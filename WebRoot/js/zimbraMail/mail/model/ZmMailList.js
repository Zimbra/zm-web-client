/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty list of mail items.
* @constructor
* @class
* This class represents a list of mail items (conversations, messages, or
* attachments). We retain a handle to the search that generated the list for
* two reasons: so that we can redo the search if necessary, and so that we
* can get the folder ID if this list represents folder contents.
*
* @author Conrad Damon
* @param type		type of mail item (see ZmItem for constants)
* @param appCtxt	global app context
* @param search		the search that generated this list
*/
function ZmMailList(type, appCtxt, search) {

	ZmList.call(this, type, appCtxt, search);

	this.convId = null; // for msg list within a conv

	// mail list can be changed via folder or tag action (eg "Mark All Read")
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		this._folderChangeListener = new AjxListener(this, this._folderTreeChangeListener);
		folderTree.addChangeListener(this._folderChangeListener);
	}
};

ZmMailList.prototype = new ZmList;
ZmMailList.prototype.constructor = ZmMailList;

ZmMailList.prototype.toString = 
function() {
	return "ZmMailList";
};

/**
* Override so that we can specify "tcon" attribute for conv move - we don't want
* to move messages in certain system folders as a side effect. Also, we need to
* update the UI based on the response if we're moving convs, since the 
* notifications only tell us about moved messages.
*
* @param items		[Array]			a list of items to move
* @param folder		[ZmFolder]		destination folder
* @param attrs		[Object]		additional attrs for SOAP command
*/
ZmMailList.prototype.moveItems =
function(items, folder, attrs) {
	if (this.type != ZmItem.CONV) {
		ZmList.prototype.moveItems.call(this, items, folder, attrs);
		return;
	}
	
	var attrs = {};
	attrs.tcon = this._getTcon();
	attrs.l = folder.id;
	var action = folder.id == ZmFolder.ID_TRASH ? "trash" : "move";
	var respCallback = new AjxCallback(this, this._handleResponseMoveItems, [folder]);
	this._itemAction({items: items, action: action, attrs: attrs, callback: respCallback});
};

ZmMailList.prototype._handleResponseMoveItems =
function(folder, result) {
	var movedItems = result.getResponse();	
	if (movedItems && movedItems.length) {
		this.moveLocal(movedItems, folder.id);
		for (var i = 0; i < movedItems.length; i++) {
			movedItems[i].moveLocal(folder.id);
		}
		ZmModel.notifyEach(movedItems, ZmEvent.E_MOVE, {replenish:true});
	}
};

/**
* Marks items as "spam" or "not spam". If they're marked as "not spam", a target folder
* may be provided.
*
* @param items			[Array]			a list of items to move
* @param markAsSpam		[boolean]		if true, mark as "spam"
* @param folder			[ZmFolder]*		destination folder
*/
ZmMailList.prototype.spamItems = 
function(items, markAsSpam, folder) {
	if (this.type == ZmItem.MIXED && !this._mixedType) {
		this._mixedAction("spamItems", [items, markAsSpam, folder]);
		return;
	}

	var action = markAsSpam ? "spam" : "!spam";

	var attrs = {};
	attrs.tcon = this._getTcon();
	if (folder) attrs.l = folder.id;

	var respCallback = new AjxCallback(this, this._handleResponseSpamItems, [markAsSpam, folder]);
	this._itemAction({items: items, action: action, attrs: attrs, callback: respCallback});
};

ZmMailList.prototype._handleResponseSpamItems =
function(markAsSpam, folder, result) {
	var movedItems = result.getResponse();
	if (movedItems && movedItems.length) {
		folderId = markAsSpam ? ZmFolder.ID_SPAM : (folder ? folder.id : ZmFolder.ID_INBOX);
		this.moveLocal(movedItems, folderId);
		for (var i = 0; i < movedItems.length; i++) {
			movedItems[i].moveLocal(folderId);
		}
		ZmModel.notifyEach(movedItems, ZmEvent.E_MOVE, {replenish:true});

		var msg = markAsSpam ? ZmMsg.markedAsJunk : ZmMsg.markedAsNotJunk;
		this._appCtxt.setStatusMsg(AjxMessageFormat.format(msg, movedItems.length));
	}
};

/**
* Override so that delete of a conv in Trash doesn't hard-delete its msgs in
* other folders.
*
* @param items			[Array]			list of items to delete
* @param hardDelete		[boolean]		whether to force physical removal of items
* @param attrs			[Object]		additional attrs for SOAP command
*/
ZmMailList.prototype.deleteItems =
function(items, folder, attrs) {
	if (this.type == ZmItem.CONV || this._mixedType == ZmItem.CONV) {
		var searchFolder = this.search ? this._appCtxt.getById(this.search.folderId) : null;
		if (searchFolder && searchFolder.isInTrash()) {
			if (!attrs) attrs = {};
			attrs.tcon = ZmFolder.TCON_CODE[ZmFolder.ID_TRASH];
		}
	}
	ZmList.prototype.deleteItems.call(this, items, folder, attrs);
};

/*
 * Only make the request for items whose state will be changed. 
 */
ZmMailList.prototype.markRead =
function(items, on) {
	var items1 = [];
	for (var i = 0; i < items.length; i++) {
		if (items[i].isUnread == on) {
			items1.push(items[i]);
		}
	}
	if (items1.length) {
		this.flagItems(items1, "read", on);
	}
};

// When a conv or msg is moved to Trash, it is marked read by the server.
ZmMailList.prototype.moveLocal =
function(items, folderId) {
	ZmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId != ZmFolder.ID_TRASH) return;

	var flaggedItems = [];
	for (var i = 0; i < items.length; i++) {
		if (items[i].isUnread) {
			items[i].flagLocal(ZmItem.FLAG_UNREAD, false);
			flaggedItems.push(items[i]);
		}
	}
	ZmModel.notifyEach(flaggedItems, ZmEvent.E_FLAGS, {flags:[ZmItem.FLAG_UNREAD]});
};

ZmMailList.prototype.notifyCreate = 
function(convs, msgs) {
	var searchFolder = this.search ? this.search.folderId : null;
	var createdItems = [];
	var newConvs = [];
	var newMsgs = [];
	var flaggedItems = [];
	var modifiedItems = [];
	var newConvId = {};
	var fields = {};
	var sortBy = this.search ? this.search.sortBy : null;
	var sortIndex = {};
	if (this.type == ZmItem.CONV && searchFolder) {
		// handle new convs first so we can set their fragments from new msgs
		for (var id in convs) {
			if (this.getById(id)) { continue; }	// already have this conv
			newConvId[id] = true;
			var conv = convs[id];
			if (conv.folders && conv.folders[searchFolder]) {
				// conv's msg matches current search
				sortIndex[id] = this._getSortIndex(conv, sortBy);
				this.add(conv, sortIndex[id]);
				conv.list = this;
				newConvs.push(conv);
			}
		}
		// sort item list to reverse so they show up in correct order when processed
		if (newConvs.length > 1) {
			ZmMailItem.sortBy = sortBy;
			newConvs.sort(ZmMailItem.sortCompare);
			newConvs.reverse();
		}
		for (var id in msgs) {
			var msg = msgs[id];
			var cid = msg.cid;
			var conv = this.getById(cid);
			if (conv && !(conv.msgs && conv.msgs.getById(id))) {
				if (!conv.msgs) {
					conv.msgs = new ZmMailList(ZmItem.MSG, this._appCtxt);
					conv.msgs.addChangeListener(conv._listChangeListener);
				}
				var index = conv.msgs._getSortIndex(msg, conv._sortBy);
				conv.msgs.add(msg, index);
				msg.list = conv.msgs;
				if (!msg.isSent) {
					conv.isUnread = true;
					flaggedItems.push(conv);
				}
				// if the new msg matches current search, update conv date and fragment
				// TODO: handle simple tag searches
				var msgMatches = (msg.folderId == searchFolder);
				if (msgMatches && (conv.fragment != msg.fragment)) {
					conv.fragment = msg.fragment;
					fields[ZmItem.F_FRAGMENT] = true;
				}
				if (msgMatches && (conv.date != msg.date)) {
					conv.date = msg.date;
					// recalculate conv's sort position since we changed its date
					sortIndex[conv.id] = this._getSortIndex(conv, sortBy);
					fields[ZmItem.F_DATE] = true;
				}
				// conv gained a msg, may need to be moved to top/bottom
				if (msgMatches && !newConvId[conv.id] && this._vector.contains(conv)) {
					fields[ZmItem.F_INDEX] = true;
				}
				modifiedItems.push(conv);
			}
			newMsgs.push(msg);
		}
	} else if (this.type == ZmItem.MSG) {
		for (var id in msgs) {
			if (this.getById(id)) continue;
			var msg = msgs[id];
			sortIndex[id] = this._getSortIndex(msg, sortBy);
			if (this.convId) { // MLV within conv
				if (msg.cid == this.convId && !this.getById(msg.id)) {
					this.add(msg, sortIndex[id]);
					msg.list = this;
					newMsgs.push(msg);
				}
			} else { // MLV (traditional)
				if (msg.folderId == searchFolder) {
					this.add(msg, sortIndex[id]);
					msg.list = this;
					newMsgs.push(msg);
				}
			}
		}
	}
	ZmModel.notifyEach(newConvs, ZmEvent.E_CREATE, {sortIndex:sortIndex});
	ZmModel.notifyEach(newMsgs, ZmEvent.E_CREATE, {sortIndex:sortIndex});
	ZmModel.notifyEach(flaggedItems, ZmEvent.E_FLAGS, {flags:[ZmItem.FLAG_UNREAD]});
	ZmModel.notifyEach(modifiedItems, ZmEvent.E_MODIFY, {fields:fields, sortIndex:sortIndex});
};

/**
* Convenience method for adding messages to a conv on the fly. The specific use case for
* this is when a virtual conv becomes real. We basically add the new message(s) to the
* old (virtual) conv's message list.
*
* @param msgs		hash of messages to add
*/
ZmMailList.prototype.addMsgs =
function(msgs) {
	var addedMsgs = [];
	for (var id in msgs) {
		var msg = msgs[id];
		if (msg.cid == this.convId) {
			this.add(msg, 0);
			msg.list = this;
			addedMsgs.push(msg);
		}
	}
	ZmModel.notifyEach(addedMsgs, ZmEvent.E_CREATE);
};

ZmMailList.prototype.remove = 
function(item, bForce) {
	// Don't really remove an item if this is a list of msgs of a conv b/c a
	// msg is always going to be part of a conv unless it's a hard delete!
	if (!this.convId || bForce)
		ZmList.prototype.remove.call(this, item);
};

ZmMailList.prototype.clear =
function() {
	// remove listeners for this list from folder tree and tag list
	if (this._folderChangeListener) {
		this._appCtxt.getFolderTree().removeChangeListener(this._folderChangeListener);
	}
	if (this._tagChangeListener) {
		this._appCtxt.getTagTree().removeChangeListener(this._tagChangeListener);
	}

	ZmList.prototype.clear.call(this);
};

/*
* Returns the insertion point for the given item into this list. If we're not sorting by
* date, returns 0 (the item will be inserted at the top of the list).
*
* @param item		[ZmMailItem]	a mail item
* @param sortBy		[constant]		sort order
*/
ZmMailList.prototype._getSortIndex =
function(item, sortBy) {
	if (!sortBy || (sortBy != ZmSearch.DATE_DESC && sortBy != ZmSearch.DATE_ASC)) {
		return 0;
	}
	
	var itemDate = parseInt(item.date);
	var a = this.getArray();
	for (var i = 0; i < a.length; i++) {
		var date = parseInt(a[i].date);
		if ((sortBy == ZmSearch.DATE_DESC && (itemDate > date)) ||
			(sortBy == ZmSearch.DATE_ASC && (itemDate < date))) {
			return i;
		}
	}
	return i;
};

ZmMailList.prototype._getTcon =
function() {
	var chars = ["-"];
	var folders = [ZmFolder.ID_TRASH, ZmFolder.ID_SPAM, ZmFolder.ID_SENT];
	for (var i = 0; i < folders.length; i++) {
		var name = ZmFolder.QUERY_NAME[folders[i]];
		if (!(this.search && this.search.hasFolderTerm(name)))
			chars.push(ZmFolder.TCON_CODE[folders[i]]);
	}

	return chars.join("");
};

ZmMailList.prototype._folderTreeChangeListener = 
function(ev) {
	if (this.size() == 0) return;

	var flag = ev.getDetail("flag");
	var view = this._appCtxt.getCurrentViewId();
	var ctlr = this._appCtxt.getCurrentController();

	if (ev.event == ZmEvent.E_FLAGS && (flag == ZmItem.FLAG_UNREAD)) {
		if (this.type == ZmItem.CONV) {
			if (view == ZmController.CONVLIST_VIEW && ctlr._currentSearch.hasUnreadTerm)
				this._redoSearch(ctlr);
		} else if (this.type == ZmItem.MSG) {
			if (view == ZmController.TRAD_VIEW && ctlr._currentSearch.hasUnreadTerm) {
				this._redoSearch(ctlr);
			} else {
				var on = ev.getDetail("state");
				var organizer = ev.getDetail("item");
				var flaggedItems = [];
				var list = this.getArray();
				for (var i = 0; i < list.length; i++) {
					var msg = list[i];
					if ((organizer.type == ZmOrganizer.FOLDER && msg.folderId == organizer.id) ||
						(organizer.type == ZmOrganizer.TAG && msg.hasTag(organizer.id))) {
						msg.isUnread = on;
						flaggedItems.push(msg);
					}
				}
				ZmModel.notifyEach(flaggedItems, ZmEvent.E_FLAGS, {flags:[flag]});
			}
		}
	} else {
		ZmList.prototype._folderTreeChangeListener.call(this, ev);
	}
};

ZmMailList.prototype._tagTreeChangeListener = 
function(ev) {
	if (this.size() == 0) return;

	var flag = ev.getDetail("flag");
	if (ev.event == ZmEvent.E_FLAGS && (flag == ZmItem.FLAG_UNREAD)) {
		this._folderTreeChangeListener(ev);
	} else {
		ZmList.prototype._tagTreeChangeListener.call(this, ev);
	}
};
