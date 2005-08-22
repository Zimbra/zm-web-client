/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
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

	ZmList.call(this, type, appCtxt);

	this.search = search;
	this.convId = null; // for msg list within a conv

	// mail list can be changed via folder or tag action (eg "Mark All Read")
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		this._folderChangeListener = new AjxListener(this, this._folderTreeChangeListener);
		folderTree.addChangeListener(this._folderChangeListener);
	}
}

ZmMailList.prototype = new ZmList;
ZmMailList.prototype.constructor = ZmMailList;

ZmMailList.prototype.toString = 
function() {
	return "ZmMailList";
}

ZmMailList.prototype.markRead =
function(items, on) {
	this.flagItems(items, "read", on);
}

// When a conv or msg is moved to Trash, it is marked read by the server.
ZmMailList.prototype.moveLocal =
function(items, folderId) {
	ZmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId != ZmFolder.ID_TRASH) return;

	var flaggedItems = new Array();
	for (var i = 0; i < items.length; i++) {
		if (items[i].isUnread) {
			items[i].flagLocal(ZmItem.FLAG_UNREAD, false);
			flaggedItems.push(items[i]);
		}
	}
	if (flaggedItems.length)
		this._eventNotify(ZmEvent.E_FLAGS, flaggedItems, {flags: [ZmItem.FLAG_UNREAD]});
}

ZmMailList.prototype.notifyCreate = 
function(convs, msgs) {
	var searchFolder = this.search ? this.search.folderId : null;
	var createdItems = new Array();
	var flaggedItems = new Array();
	var modifiedItems = new Array();
	var fields = new Object();
	if (this.type == ZmItem.CONV && searchFolder) {
		// handle new convs first so we can set their fragments from new msgs
		for (var id in convs) {
			var conv = convs[id];
			if (conv.folders && conv.folders[searchFolder]) {
				this.add(conv, 0); // add to beginning for now
				conv.list = this;
				createdItems.push(conv);
			}
		}
		for (var id in msgs) {
			var msg = msgs[id];
			var cid = msg.cid;
			var conv = this.getById(cid);
			if (conv) {
				// got a new msg for a conv that has no msg list - happens when virt conv
				// becomes real (on its second msg) - create a msg list
				if (!conv.msgs) {
					conv.msgs = new ZmMailList(ZmItem.MSG, this._appCtxt);
					conv.msgs.addChangeListener(conv._listChangeListener);
				}
				conv.msgs.add(msg, 0);
				msg.list = conv.msgs;
				if (!msg.isSent) {
					conv.isUnread = true;
					flaggedItems.push(conv);
				}
				if (conv.fragment != msg.fragment) {
					conv.fragment = msg.fragment;
					fields[ZmItem.F_FRAGMENT] = true;
				}
				modifiedItems.push(conv);
			}
		}
	} else if (this.type == ZmItem.MSG) {
		for (var id in msgs) {
			var msg = msgs[id];
			if (this.convId) { // MLV within conv
				if (msg.cid == this.convId && !this.getById(msg.id)) {
					this.add(msg, 0); // add to top of msg list
					msg.list = this;
					createdItems.push(msg);
				}
			} else { // MLV (traditional)
				if (msg.folderId == searchFolder) {
					this.add(msg, 0); // add to top of msg list
					msg.list = this;
					createdItems.push(msg);
				}
			}
		}
	}
	if (createdItems.length)
		this._eventNotify(ZmEvent.E_CREATE, createdItems);
	if (flaggedItems.length)
		this._eventNotify(ZmEvent.E_FLAGS, flaggedItems, {flags: [ZmItem.FLAG_UNREAD]});
	if (modifiedItems.length)
		this._eventNotify(ZmEvent.E_MODIFY, modifiedItems, {fields: fields});
}

/**
* Convenience method for adding messages to a conv on the fly. The specific use case for
* this is when a virtual conv becomes real. We basically add the new message(s) to the
* old (virtual) conv's message list.
*
* @param msgs		hash of messages to add
*/
ZmMailList.prototype.addMsgs =
function(msgs) {
	var addedMsgs = new Array();
	for (var id in msgs) {
		var msg = msgs[id];
		if (msg.cid == this.convId) {
			this.add(msg, 0);
			msg.list = this;
			addedMsgs.push(msg);
		}
	}
	if (addedMsgs.length)
		this._eventNotify(ZmEvent.E_CREATE, addedMsgs);
}

ZmMailList.prototype.remove = 
function(item, bForce) {
	// Don't really remove an item if this is a list of msgs of a conv b/c a
	// msg is always going to be part of a conv unless its a hard delete!
	if (!this.convId || bForce)
		ZmList.prototype.remove.call(this, item);
}

ZmMailList.prototype.clear =
function() {
	// remove listeners for this list from folder tree and tag list
	if (this._folderChangeListener)
		this._appCtxt.getFolderTree().removeChangeListener(this._folderChangeListener);
	if (this._tagChangeListener)
		this._appCtxt.getTagList().removeChangeListener(this._tagChangeListener);

	ZmList.prototype.clear.call(this);
}

ZmMailList.prototype.spamItems = 
function(items, markAsSpam, optFolderId) {
	var itemMode = false;
	if (items instanceof ZmItem) {
		items = [items];
		itemMode = true;
	}
	
	// NOTE: there really isnt a way for us to know whether each item is 
	//       already in spam or not (since we no longer have a isSpam flag) 
	//       so always process all items regardless
	
	var action = markAsSpam ? "spam" : "!spam";

	if (items.length) {	
		var respItems = optFolderId 
			? this._itemAction(items, action, {l: optFolderId})
			: this._itemAction(items, action);

		if (respItems) {
			var folderId = markAsSpam ? ZmFolder.ID_SPAM : (optFolderId || ZmFolder.ID_INBOX);

			this.moveLocal(respItems, folderId);
			for (var i = 0; i < respItems.length; i++)
				respItems[i].moveLocal(folderId);
			this._eventNotify(ZmEvent.E_MOVE, respItems, null, itemMode);
		}
	}
}

ZmMailList.prototype._folderTreeChangeListener = 
function(ev) {
	if (this.size() == 0) return;

	var flag = ev.getDetail("flag");
	var view = this._appCtxt.getAppViewMgr().getCurrentView();
	var ctlr = this._appCtxt.getAppController().getControllerForView(view);

	if (ev.event == ZmEvent.E_FLAGS && (flag == ZmItem.FLAG_UNREAD)) {
		if (this.type == ZmItem.CONV) {
			if (view == ZmController.CONVLIST_VIEW && ctlr._currentSearch.hasUnreadTerm)
				this._redoSearch(ctlr, view);
			return false;
		} else if (this.type == ZmItem.MSG) {
			if (view == ZmController.TRAD_VIEW && ctlr._currentSearch.hasUnreadTerm) {
				this._redoSearch(ctlr, view);
				return false;
			} else {
				var on = ev.getDetail("state");
				var organizer = ev.getDetail("item");
				var flaggedItems = new Array();
				var list = this.getArray();
				for (var i = 0; i < list.length; i++) {
					var msg = list[i];
					if ((organizer.type == ZmOrganizer.FOLDER && msg.folderId == organizer.id) ||
						(organizer.type == ZmOrganizer.TAG && msg.hasTag(organizer.id))) {
						msg.isUnread = on;
						flaggedItems.push(msg);
					}
				}
				if (flaggedItems.length)
					this._eventNotify(ZmEvent.E_FLAGS, flaggedItems, {flags: [flag]});
			}
		}
	} else if (ev.event == ZmEvent.E_DELETE &&
			   ev.source instanceof ZmFolder && 
			   ev.source.id == ZmFolder.ID_TRASH) 
	{
		// user just emptied the trash.. update applicable views
		if (this.type == ZmItem.CONV && view == ZmController.CONVLIST_VIEW) {
			this._redoSearch(ctlr, view, true);
			return false;
		}
	}
}

ZmMailList.prototype._tagTreeChangeListener = 
function(ev) {
	if (this.size() == 0) return;

	var flag = ev.getDetail("flag");
	if (ev.event == ZmEvent.E_FLAGS && (flag == ZmItem.FLAG_UNREAD)) {
		return this._folderTreeChangeListener(ev);
	} else {
		return ZmList.prototype._tagTreeChangeListener.call(this, ev);
	}
}

ZmMailList.prototype._redoSearch = 
function(ctlr, view, bPreservePage) {

	var callback = null;

	if (bPreservePage) {
		// redo search; if it was a pagination search, run callback to maintain cache
		for (var i = 1; i <= ctlr.maxPage; i++)
			ctlr.pageIsDirty[i] = true;
		if (ctlr.currentPage > 0)
			callback = new AjxCallback(ctlr, ctlr._paginateCallback, [view, -1, true]);
	}

	var sc = this._appCtxt.getSearchController();
	sc.redoSearch(ctlr._currentSearch, callback);
}
