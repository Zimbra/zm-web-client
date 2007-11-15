/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */
ZmRosterItem = function(id, list, name, presence, groupNames) {
	if (arguments.length > 0) {
		ZmItem.call(this, ZmOrganizer.ROSTER_ITEM, id, list);
		this.name = name;
		this.presence = presence || new ZmRosterPresence();
		this.groupNames = groupNames;
		this.groups = groupNames ? groupNames.split(/,/) : [];
		this.numUnreadIMs = 0; // num unread IMs from this buddy
	}
}

ZmRosterItem.prototype = new ZmItem;
ZmRosterItem.prototype.constructor = ZmRosterItem;

ZmRosterItem.F_PRESENCE = "ZmRosterItem.presence";
ZmRosterItem.F_GROUPS = "ZmRosterItem.groups";
ZmRosterItem.F_NAME = "ZmRosterItem.name";
ZmRosterItem.F_UNREAD = "ZmRosterItem.unread";
ZmRosterItem.F_TYPING = "ZmRosterItem.typing";

ZmRosterItem.prototype.toString =
function() {
	return "ZmRosterItem - " + this.name;
};

/**
 * delete item on server. notification will remove us from list
 */
ZmRosterItem.prototype._delete =
function() {
	this._modify(this.id, this.name, this.groupNames, true);
};

/**
 * modify item on server. notification will remove us from list
 */
ZmRosterItem.prototype._modify =
function(id, name, groupNames, doDelete) {
	var soapDoc = AjxSoapDoc.create("IMSubscribeRequest", "urn:zimbraIM");
	var method = soapDoc.getMethod();
	method.setAttribute("addr", id);
	if (name) method.setAttribute("name", name);
	if (groupNames) method.setAttribute("groups", groupNames);
	method.setAttribute("op", doDelete ? "remove" : "add");
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true});
};

ZmRosterItem.prototype.getPresence =
function() {
	return this.presence;
};

ZmRosterItem.prototype._notifyTyping = function(typing) {
	var fields = {};
	fields[ZmRosterItem.F_TYPING] = !!typing;
	this.list._notify(ZmEvent.E_MODIFY, { fields : fields,
					      items  : [ this ] });
};

ZmRosterItem.prototype._notifyPresence =
function() {
	var fields = {};
	fields[ZmRosterItem.F_PRESENCE] = this.getPresence();
	this.list._notify(ZmEvent.E_MODIFY, { fields: fields, items: [this] });
	delete this._toolTip;
        var c = this.getContact();
        if (c)
                c.notifyModify({});
};

ZmRosterItem.prototype.setUnread  =
function(num, addToTotal) {
	this.numUnreadIMs = addToTotal ? this.numUnreadIMs + num : num;
	var fields = {};
	fields[ZmRosterItem.F_UNREAD] = this.numUnreadIMs;
	this.list._notify(ZmEvent.E_MODIFY, { fields: fields, items: [this] });
	delete this._toolTip;
};

ZmRosterItem.prototype._notifySetGroups =
function(newGroups) {
	this.groupNames = newGroups;
	this.groups = this.groupNames ? this.groupNames.split(/,/) : [];
	var fields = {};
	fields[ZmRosterItem.F_GROUPS] = this.groupNames;
	this.list._notify(ZmEvent.E_MODIFY, { fields: fields, items: [this] });
	delete this._toolTip;
};

ZmRosterItem.prototype._notifySetName =
function(newName) {
	this.name = newName;
	var fields = {};
	fields[ZmRosterItem.F_NAME] = this.name;
	this.list._notify(ZmEvent.E_MODIFY, { fields: fields, items: [this] });
	delete this._toolTip;
};

/**
 * sends updated group list to server
 */
ZmRosterItem.prototype.doRenameGroup =
function(oldGroup, newGroup) {
	var oldI = -1;
	var newI = -1;
	for (var i in this.groups) {
		if (this.groups[i] == oldGroup) oldI = i;
		if (this.groups[i] == newGroup) newI = i;
	}
	if (newI !=-1 || oldI == -1) return;
	var newGroups = [];
	for (var i in this.groups) {
		if (i != oldI) newGroups.push(this.groups[i]);
	}
	newGroups.push(newGroup);
	var newGroupNames = newGroups.join(",");
	this._modify(this.id, this.name, newGroupNames, false);
};

ZmRosterItem.sortCompare =
function(itemA, itemB) {
	var check = ZmOrganizer.checkSortArgs(itemA, itemB);
	if (check != null) return check;

	// sort by name
	var itemAName = itemA.getDisplayName().toLowerCase();
	var itemBName = itemB.getDisplayName().toLowerCase();
	if (itemAName < itemBName) {return -1;}
	if (itemAName > itemBName) {return 1;}
	return 0;
};

// Public methods
ZmRosterItem.prototype.getId = function() { return this.id; };

ZmRosterItem.prototype.getAddress= function() { return this.id; };

ZmRosterItem.prototype.getGroups = function() { return this.groups; };

ZmRosterItem.prototype.getGroupNames = function() { return this.groupNames; };

ZmRosterItem.prototype.getName = function() {	return this.name; }

ZmRosterItem.prototype.getContact = function() {
        var contactList = AjxDispatcher.run("GetContacts");
        var contact = contactList.getContactByEmail(this.getAddress());
        if (!contact) {
                var roster = AjxDispatcher.run("GetRoster");
                var addr = roster.makeGenericAddress(this.id);
                if (addr)
	                contact = contactList.getContactByIMAddress(addr);
        }
        return contact;
};

ZmRosterItem.prototype.getDisplayName = function() {
	if (this.name)
		return this.name;
	var c = this.getContact();
	if (c)
		return c.getFullName();
	return this.id;
};

ZmRosterItem.prototype.getUnread = function() { return this.numUnreadIMs; };

// args contains: str, sel_start, sel_end, last_key, enter
//
// chat      : ZmChat where this discussion is taking place
// widget    : ZmChatWidget of this discussion
// str	     : full string
// sel_start : selection start (caret position for empty selection)
// sel_end   : selection end     (same ^^)
// last_key  : the last key pressed (keyCode)
// enter     : true if ENTER was pressed
//
// return value: undefined or hash containing: (all optional)
//
// str       : new string to include in the input field
// sel_start : place new selection
// sel_end   : ^^
// stop      : true to avoid sending the message to server (useful for Zimbra Assistant)
ZmRosterItem.prototype.handleInput = function(args) {
	// by default we do typing notification
// 	function clearTyping(chat) {
// 		chat.sendMessage(null);
// 		this._isTyping = null;
// 	};
// 	if (!this._isTyping) {
// 		var typing = !args.enter;
// 		this._isTyping = typing;
// 		args.chat.sendMessage(null, typing);
// 		if (this._clearTypingTimer)
// 			clearTimeout(this._clearTypingTimer);
// 		this._clearTypingTimer = setTimeout(AjxCallback.simpleClosure(clearTyping, this, args.chat),
// 						    5000);
// 	}
};

ZmRosterItem.prototype.chatStarted = function(chat, widget) {}; // called when a new ZmChat is started with this item

ZmRosterItem.prototype.inGroup =
function(name) {
	for (var i in this.groups) {
		if (this.groups[i] == name) return true;
	}
	return false;
};

/**
* Checks a roster name for validity. Returns an error message if the
* name is invalid and null if the name is valid.
*
* @param name
*/
ZmRosterItem.checkName =
function(name) {
	return null;
};

/**
* Checks a roster address for validity. Returns an error message if the
* addres is invalid and null if the address is valid.
*
* @param address
*/
ZmRosterItem.checkAddress =
function(address) {
	if (address == null || address == "")
		return ZmMsg.rosterItemAddressNoValue;
	else
        	return null;
};

ZmRosterItem.checkGroups =
function(groups) {
	return null;
};

ZmRosterItem.prototype.getToolTip = function() {
	return AjxTemplate.expand("im.Chat#RosterItemTooltip",
				  { buddy   : this,
				    contact : this.getContact()
				  });
};

ZmRosterItem.prototype.isDefaultBuddy = function() {
	return false;
};
