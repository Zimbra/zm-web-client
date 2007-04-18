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

function ZmMailListView(parent, className, posStyle, view, type, controller, headerList, dropTgt) {

	if (arguments.length == 0) return;
	ZmListView.call(this, parent, className, posStyle, view, type, controller, headerList, dropTgt);

	this._folderId = null;
};

ZmMailListView.prototype = new ZmListView;
ZmMailListView.prototype.constructor = ZmMailListView;

// Consts

ZmMailListView.KEY_ID = "_keyId";


// Public methods

ZmMailListView.prototype.toString = 
function() {
	return "ZmMailListView";
};

// abstract method
ZmMailListView.prototype.markUIAsRead = 
function(items, on) {}

ZmMailListView.prototype.set =
function(list, sortField) {
	this._folderId = list.search ? list.search.folderId : null;
	ZmListView.prototype.set.call(this, list, sortField);
};

ZmMailListView.prototype.getTitle =
function() {
	return this._controller._activeSearch && this._controller._activeSearch.search 
		? this._controller._activeSearch.search.getTitle() : null;
};

ZmMailListView.prototype.replenish = 
function(list) {
	DwtListView.prototype.replenish.call(this, list);
	this._resetColWidth();
};

// Private / protected methods

ZmMailListView.prototype._isSentOrDraftsFolder = 
function() {
	var isSentFolder = (this._folderId == ZmFolder.ID_SENT);
	var isDraftsFolder = (this._folderId == ZmFolder.ID_DRAFTS);

	// XXX: is the code below necessary?
	
	// if not in Sent/Drafts, deep dive into query to be certain		
	if (!isSentFolder && !isDraftsFolder) {
		// check for is:sent or is:draft w/in search query
		var query = this._appCtxt.getCurrentSearch().query;
		var idx = query.indexOf(":");
		if (idx) {
			var prefix = AjxStringUtil.trim(query.substring(0, idx));
			if (prefix == "is") {
				var folder = AjxStringUtil.trim(query.substring(idx+1));
				isSentFolder = folder == ZmFolder.QUERY_NAME[ZmFolder.ID_SENT];
				isDraftsFolder = folder == ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS];
			}
		}
	}
	return {sent:isSentFolder, drafts:isDraftsFolder};
};

// Figure out how many of the participants will fit into a given pixel width.
// We always include the originator, and then as many of the most recent participants
// as possible. If any have been elided (either by the server or because they don't
// fit), there will be an ellipsis after the originator.
//
// The length of a participants string is determined mathematically. Since each letter
// is assumed to be an em in width, the calculated length is significantly longer than
// the actual length. The only way I've found to get the actual length is to create
// invisible divs and measure them, but that's expensive. The calculated length seems to
// run about 50% greater than the actual length, so we use a 30% fudge factor. The text 
// that's tested is bolded, since that's bigger and the conv may be unread.
//
// Returns a list of objects with name and original index.
ZmMailListView.prototype._fitParticipants = 
function(participants, participantsElided, width) {
	// fudge factor since we're basing calc on em width; the actual ratio is around 1.5
	width = width * 1.3;
	// only one participant, no need to test width
	if (participants.length == 1) {
		var p = participants[0];
		var name = p.name ? p.name : p.dispName;
		var tmp = {name: AjxStringUtil.htmlEncode(name), index: 0};
		return [tmp];
	}
	// create a list of "others" (not the originator)
	var list = new Array();
	for (var i = 0; i < participants.length; i++) {
		var tmp = {name: AjxStringUtil.htmlEncode(participants[i].dispName), index: i};
		list.push(tmp);
	}
	var origLen = list.length;
	var originator = list.shift();
	// test originator + others
	// if it's too big, remove the oldest from others
	while (list.length) {
		var test = [originator];
		test = test.concat(list);
		var text;
		var tmp = new Array();
		var w = 0;
		for (var i = 0; i < test.length; i++)
			w = w + (test[i].name.length * DwtUnits.WIDTH_EM); // total width of names
		if ((test.length == origLen) && !participantsElided) {
			w = w + (test.length - 1) * DwtUnits.WIDTH_SEP; // none left out, comma join
			for (var i = 0; i < test.length; i++)
				tmp.push(test[i].name);
			text = tmp.join(", ");
		} else {
			w = w + DwtUnits.WIDTH_ELLIPSIS;				// some left out, add in ellipsis
			w = w + (test.length - 2) * DwtUnits.WIDTH_SEP; // and remaining commas
			for (var i = 0; i < list.length; i++)
				tmp.push(list[i].name);
			text = originator.name + AjxStringUtil.ELLIPSIS + tmp.join(", ");
		}
		//DBG.println(AjxDebug.DBG3, "calc width of [" + text + "] = " + w);
		if (w <= width) {
			return test;
		} else {
			list.shift();
		}
	}
	return [originator];
};

ZmMailListView.prototype._getActionMenuForColHeader = 
function() {
	if (!this._colHeaderActionMenu) {
		// create a action menu for the header list
		this._colHeaderActionMenu = new ZmPopupMenu(this);
		var actionListener = new AjxListener(this, this._colHeaderActionListener);
		for (var i = 0; i < this._headerList.length; i++) {
			var hCol = this._headerList[i];
			// lets not allow columns w/ relative width to be removed (for now) - it messes stuff up
			if (hCol._width) {
				var mi = this._colHeaderActionMenu.createMenuItem(hCol._id, {text:hCol._name, style:DwtMenuItem.CHECK_STYLE});
				mi.setData(ZmMailListView.KEY_ID, hCol._id);
				mi.setChecked(true, true);
				this._colHeaderActionMenu.addSelectionListener(hCol._id, actionListener);
			}
		}
	}
	return this._colHeaderActionMenu;
};


// Listeners

ZmMailListView.prototype._changeListener =
function(ev) {

	var item = ev.item;
	if (ev.handled || !this._handleEventType[item.type]) { return; }

	if (ev.event == ZmEvent.E_FLAGS) { // handle "unread" flag
		DBG.println(AjxDebug.DBG2, "ZmMailListView: FLAGS");
		var flags = ev.getDetail("flags");
		for (var j = 0; j < flags.length; j++) {
			var flag = flags[j];
			if (flag == ZmItem.FLAG_UNREAD) {
				var on = item[ZmItem.FLAG_PROP[flag]];
				this.markUIAsRead([item], !on);
			}
		}
	}
	
	if (ev.event == ZmEvent.E_CREATE) {
		DBG.println(AjxDebug.DBG2, "ZmMailListView: CREATE");
		var sortIndex = ev.getDetail("sortIndex");
		if (this._list && this._list.contains(item)) { return; } // skip if we already have it
		if (!this._handleEventType[item.type]) { return; }

		// Check to see if ZmMailList::notifyCreate gave us an index for the item.
		// If not, we assume that the new conv/msg is the most recent one. If we're on the
		// first page with date desc order, we insert it at the top. If we're on the last
		// page with date asc order, we insert it at the bottom.
		var index = sortIndex[item.id];
		if (index != null) {
			this.addItem(item, index);
		} else if ((this.getOffset() == 0) && (!this._sortByString || this._sortByString == ZmSearch.DATE_DESC)) {
			this.addItem(item, 0);
		} else if ((this._controller.getList().hasMore() === false) && (this._sortByString == ZmSearch.DATE_ASC)) {
			if (this.size() < this.getLimit()) {
				// add new item at the end of list view's internal list
				this.addItem(item);
			} else {
				// XXX: reset pagination buttons?
			}
		}
		ev.handled = true;
	}

	if (!ev.handled) {
		ZmListView.prototype._changeListener.call(this, ev);
	}
};

ZmMailListView.prototype._colHeaderActionListener =
function(ev) {

	var menuItemId = ev.item.getData(ZmMailListView.KEY_ID);

	for (var i = 0; i < this._headerList.length; i++) {
		var col = this._headerList[i];
		if (col._id == menuItemId) {
			col._visible = !col._visible;
			break;
		}
	}
	
	this._relayout();
};
