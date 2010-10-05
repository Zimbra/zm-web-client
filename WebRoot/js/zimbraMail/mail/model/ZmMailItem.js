/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
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
 * @param {constant}	type		the type of object (conv or msg)
 * @param {int}	id		the unique ID
 * @param {ZmMailList}	list		the list that contains this mail item
 * @param {Boolean}	noCache		if <code>true</code>, do not cache this item
 * 
 * @extends		ZmItem
 */
ZmMailItem = function(type, id, list, noCache) {

	if (arguments.length == 0) { return; }
	ZmItem.call(this, type, id, list, noCache);

	this._loaded = false;
	this._initializeParticipants();
};

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
};

/**
 * Clears this item.
 * 
 */
ZmMailItem.prototype.clear =
function() {
	this._clearParticipants();
	this._loaded = false;
	ZmItem.prototype.clear.call(this);
};

ZmMailItem.prototype.getFolderId =
function() {
	return this.folderId;
};

ZmMailItem.prototype.notifyModify =
function(obj, batchMode) {
	var fields = {};
	if (obj.e && obj.e.length) {
		this._clearParticipants();
		this._initializeParticipants();
		for (var i = 0; i < obj.e.length; i++) {
			this._parseParticipantNode(obj.e[i]);
		}
		fields[ZmItem.F_FROM] = true;
		this._notify(ZmEvent.E_MODIFY, {fields:fields});
	}

	return ZmItem.prototype.notifyModify.apply(this, arguments);
};

ZmMailItem.prototype._initializeParticipants =
function() {
	this.participants = new AjxVector();
	this.participantsElided = false;
};

ZmMailItem.prototype._clearParticipants =
function() {
	if (this.participants) {
		this.participants.removeAll();
		this.participants = null;
		this.participantsElided = false;
	}
};

ZmMailItem.prototype._getFlags =
function() {
	var list = ZmItem.prototype._getFlags.call(this);
	list.push(ZmItem.FLAG_UNREAD, ZmItem.FLAG_REPLIED, ZmItem.FLAG_FORWARDED, ZmItem.FLAG_READ_RECEIPT_SENT);
	return list;
};

ZmMailItem.prototype._markReadLocal =
function(on) {
	this.isUnread = !on;
	this._notify(ZmEvent.E_FLAGS, {flags:[ZmItem.FLAG_UNREAD]});
};

ZmMailItem.prototype.setAutoSendTime =
function(autoSendTime) {
	var wasScheduled = this.isScheduled;
	var isDate = AjxUtil.isDate(autoSendTime);
	this.flagLocal(ZmItem.FLAG_ISSCHEDULED, isDate);
	this.autoSendTime = isDate ? autoSendTime : null;
	if (wasScheduled != this.isScheduled)
		this._notify(ZmEvent.E_FLAGS, {flags: ZmItem.FLAG_ISSCHEDULED});
};

ZmMailItem.prototype._parseParticipantNode =
function(node) {
	var type = AjxEmailAddress.fromSoapType[node.t];
	if (type == AjxEmailAddress.READ_RECEIPT) {
		this.readReceiptRequested = true;
	} else {
		this.participants.add(new AjxEmailAddress(node.a, type, node.p, node.d));
	}
};

/**
 * Gets the email addresses of the participants.
 * 
 * @return	{Array}	an array of email addresses
 */
ZmMailItem.prototype.getEmails =
function() {
	return this.participants.map("address");
};

/**
 * Checks if this item is in Junk or Trash and the user is not including
 * those in search results.
 * 
 * @return	{Boolean}	<code>true</code> if this item is in the Junk or Trash folder
 */
ZmMailItem.prototype.ignoreJunkTrash =
function() {
	return Boolean((this.folderId == ZmFolder.ID_SPAM && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_SPAM)) ||
				   (this.folderId == ZmFolder.ID_TRASH && !appCtxt.get(ZmSetting.SEARCH_INCLUDES_TRASH)));
};
