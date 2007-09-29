/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a mail item.
* @constructor
* @class
* This class represents a mail item, which may be a conversation or a mail
* message.
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param type		[constant]		type of object (conv or msg)
* @param id			[int]			unique ID
* @param list		[ZmMailList]	list that contains this mail item
*/
function ZmMailItem(appCtxt, type, id, list) {

	if (arguments.length == 0) return;
	ZmItem.call(this, appCtxt, type, id, list);

	this._loaded = false;
	this._initializeParticipants();
}

ZmMailItem.prototype = new ZmItem;
ZmMailItem.prototype.constructor = ZmMailItem;

ZmMailItem.sortBy = ZmSearch.DATE_DESC;
ZmMailItem.sortCompare =
function(itemA, itemB) {
	var sortBy = ZmMailItem.sortBy;
	if (!sortBy || (sortBy != ZmSearch.DATE_DESC && sortBy != ZmSearch.DATE_ASC)) { return 0; }
	
	var itemDateA = parseInt(itemA.date);
	var itemDateB = parseInt(itemB.date);
	if (sortBy == ZmSearch.DATE_DESC) {
		return (itemDateA > itemDateB) ? -1 : (itemDateA < itemDateB) ? 1 : 0;
	}
	if (sortBy == ZmSearch.DATE_ASC) {
		return (itemDateA > itemDateB) ? 1 : (itemDateA < itemDateB) ? -1 : 0;
	}
};

ZmMailItem.prototype.toString = 
function() {
	return "ZmMailItem";
}

/**
* Returns true if this item's content has been populated via a server call.
*/
ZmMailItem.prototype.isLoaded =
function() {
	return this._loaded;
};

ZmMailItem.prototype.clear =
function() {
	this._clearParticipants();
	this._loaded = false;
	ZmItem.prototype.clear.call(this);
}

ZmMailItem.prototype.getFolderId =
function() {
	if ((this.type == ZmItem.CONV) && this.list.search) {
		return this.list.search.folderId;
	} else {
		return this.folderId;
	}
}

ZmMailItem.prototype.notifyModify =
function(obj) {
	var fields = new Object();
	if (obj.e != null) {
		this._clearParticipants();	
		this._initializeParticipants();	
		for (var i = 0; i < obj.e.length; i++)
			this._parseParticipantNode(obj.e[i]);
		fields[ZmItem.F_PARTICIPANT] = true;
		this._notify(ZmEvent.E_MODIFY, {fields : fields});
	}

	ZmItem.prototype.notifyModify.call(this, obj);
}

ZmMailItem.prototype._initializeParticipants =
function() {
	this.participants = new AjxVector();
	this.participantsElided = false;
}

ZmMailItem.prototype._clearParticipants =
function() {
	if (this.participants) {
		this.participants.removeAll();
		this.participants = null;
		this.participantsElided = false;
	}
}

ZmMailItem.prototype._getFlags =
function() {
	var list = ZmItem.prototype._getFlags.call(this);
	list.push(ZmItem.FLAG_UNREAD, ZmItem.FLAG_REPLIED, ZmItem.FLAG_FORWARDED);
	return list;
}

ZmMailItem.prototype._markReadLocal =
function(on) {
	this.isUnread = !on;
	this._notify(ZmEvent.E_FLAGS, {flags: [ZmItem.FLAG_UNREAD]});
}

ZmMailItem.prototype._parseParticipantNode = 
function(node) {
	var type = ZmEmailAddress.fromSoapType[node.t];
	this.participants.add(new ZmEmailAddress(node.a, type, node.p, node.d));
}
