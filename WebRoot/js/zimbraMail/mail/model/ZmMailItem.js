/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * Gets the read/unread icon.
 *
 * @return	{String}	the icon
 */
ZmMailItem.prototype.getReadIcon =
function() {
	return this.isUnread ? "MsgUnread" : "MsgRead";
};

/**
 * Gets the mute/unmute icon.
 *
 * @return	{String}	the icon
 */
ZmMailItem.prototype.getMuteIcon =
function() {
	return "";
};


ZmMailItem.prototype.getColor =
function() {
	if (!this.tags || this.tags.length !== 1) {
		return null;
	}
	var tagList = appCtxt.getAccountTagList(this);

	var tag = tagList.getByNameOrRemote(this.tags[0]);

	return tag.getColor();
};

/**
 * Clears this item.
 * 
 */
ZmMailItem.prototype.clear = function() {

    // only clear data if no more views are using this item
    if (this.refCount <= 1) {
        this._clearParticipants();
        this._loaded = false;
    }

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
	list.push(ZmItem.FLAG_UNREAD, ZmItem.FLAG_MUTE, ZmItem.FLAG_REPLIED, ZmItem.FLAG_FORWARDED, ZmItem.FLAG_READ_RECEIPT_SENT, ZmItem.FLAG_PRIORITY);
	return list;
};

ZmMailItem.prototype._markReadLocal =
function(on) {
	this.isUnread = !on;
	this._notify(ZmEvent.E_FLAGS, {flags:[ZmItem.FLAG_UNREAD]});
};

ZmMailItem.prototype._parseParticipantNode =
function(node) {
	var type = AjxEmailAddress.fromSoapType[node.t];
	if (type == AjxEmailAddress.READ_RECEIPT) {
		this.readReceiptRequested = true;
	} else {
		// if we can find the person in contacts, use the name from there
		var contactList = AjxDispatcher.run("GetContacts"),
			contact = contactList && contactList.getContactByEmail(node.a),
			fullName = contact && contact.getFullNameForDisplay(false);

		// unless it's just the start of the email address (ZBUG-2236)
		if (node.p && node.a && node.a.startsWith(fullName + "@")) {
			fullName = node.p;
		}

		var addr = new AjxEmailAddress(node.a, type, fullName || node.p, node.d, node.isGroup, node.isGroup && node.exp);
		var ac = window.parentAppCtxt || window.appCtxt;
		ac.setIsExpandableDL(node.a, addr.canExpand);
		this.participants.add(addr);
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

ZmMailItem.prototype.setAutoSendTime =
function(autoSendTime) {
	var wasScheduled = this.isScheduled;
	var isDate = AjxUtil.isDate(autoSendTime);
	this.flagLocal(ZmItem.FLAG_ISSCHEDULED, isDate);
	var autoSendTime = isDate ? autoSendTime : null;
	if (autoSendTime != this.autoSendTime) {
		this.autoSendTime = autoSendTime;
		this._notify(ZmEvent.E_MODIFY);
	}
	if (wasScheduled != this.isScheduled) {
		this._notify(ZmEvent.E_FLAGS, {flags: ZmItem.FLAG_ISSCHEDULED});
	}
};
