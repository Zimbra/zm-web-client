/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmBuddy(id, addr, name, parent, tree, status, statusText, groups, activeGroup) {
	ZmOrganizer.call(this, ZmOrganizer.BUDDY, id, name, parent, tree);
	this	.addr = addr;
	this.status = status || ZmBuddy.STATUS_OFFLINE;
	this.statusText = statusText;
	this.groups = groups;
	this.activeGroup = activeGroup;
}

ZmBuddy.prototype = new ZmOrganizer;
ZmBuddy.prototype.constructor = ZmBuddy;

ZmBuddy.STATUS_OFFLINE = 0;
ZmBuddy.STATUS_AVAILABLE = 1;     // jabber normal
ZmBuddy.STATUS_CHAT = 2;          // jabber <show> chat
ZmBuddy.STATUS_AWAY = 3;          // jabber <show> away
ZmBuddy.STATUS_EXT_AWAY = 4;     // jabber <show> xa (extended away)
ZmBuddy.STATUS_DND = 5;           // jabber <show>> dnd (do not disturb)

ZmBuddy.F_STATUS = "ZmBuddy.status";
ZmBuddy.F_NAME = ZmOrganizer.F_NAME;

ZmBuddy.prototype.toString = 
function() {
	return "ZmBuddy - " + this.name;
};

// Constants
ZmBuddy.ID_BUDDY = ZmOrganizer.ID_BUDDY;

ZmBuddy.prototype.getStatusText = 
function() {
    if (this.statusText) return this.statusText;
    switch (this.status) {
    case ZmBuddy.STATUS_AVAILABLE:
        return ZmMsg.imStatusAvailable;
    case ZmBuddy.STATUS_CHAT:
        return ZmMsg.imStatusChat;
    case ZmBuddy.STATUS_AWAY:
        return ZmMsg.imStatusAway;
    case ZmBuddy.STATUS_EXT_AWAY:
        return ZmMsg.imStatusExtAway;
    case ZmBuddy.STATUS_DND:
        return ZmMsg.imStatusDND;
    case ZmBuddy.STATUS_OFFLINE:
    default:
        return ZmMsg.imStatusOffline;
        break;
    	}
};

ZmBuddy.prototype.setStatus = 
function(status) {
    this.status = status;
    var fields = {};
    fields[ZmBuddy.F_STATUS] = status;
    this.tree._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});
};

ZmBuddy.prototype.setGroup = 
function(newGroup) {
    this.group = newGroup.getName();
    this.reparent(newGroup);
    this._eventNotify(ZmEvent.E_MOVE);
};

ZmBuddy.prototype.getIcon = 
function() {
    switch (this.status) {
    case ZmBuddy.STATUS_AVAILABLE:
        return "ImAvailable";
    case ZmBuddy.STATUS_CHAT:
        return "ImFree2Chat";
    case ZmBuddy.STATUS_AWAY:
        return "ImAway";
    case ZmBuddy.STATUS_EXT_AWAY:
        return "ImExtendedAway";
    case ZmBuddy.STATUS_DND:
        return "ImDnd";
    case ZmBuddy.STATUS_OFFLINE:
    default:
        return "RoundMinusDis"; //"Blank_16";
    	}
};

ZmBuddy.sortCompare = 
function(buddyA, buddyB) {
	// sort by name
	var buddyAName = buddyA.name.toLowerCase();
	var buddyBName = buddyB.name.toLowerCase();
	if (buddyAName < buddyBName) {return -1;}
	if (buddyAName > buddyBName) {return 1;}
	return 0;
};

ZmBuddy.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmBuddy.prototype.getId = function() { return this.id; }

ZmBuddy.prototype.getAddress= function() { return this.addr; }

ZmBuddy.prototype.getGroup = function() { return this.group }

ZmBuddy.prototype.getName = 
function() {
	if (this.id == ZmBuddy.ID_BUDDY) {
		return ZmMsg.buddyList;
	} 
	return this.name;
};

ZmBuddy.prototype.getStatus = 
function() {
    return this.status;
}
