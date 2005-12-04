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
function ZmRosterItem(id, list, appCtxt, addr, name, show, status, groupNames) {
	ZmItem.call(this, appCtxt, ZmOrganizer.ROSTER_ITEM, id, list);
	this.name = name;
	this	.addr = addr;
	this.show = show || ZmRosterItem.SHOW_OFFLINE;
	this.status = status;
	this.groupNames = groupNames;
    this.groups = groupNames ? groupNames.split(/,/) : [];
    this.numUnreadIMs = 0; // num unread IMs from this buddy
}

ZmRosterItem.prototype = new ZmItem;
ZmRosterItem.prototype.constructor = ZmRosterItem;

ZmRosterItem.SHOW_OFFLINE = 0; //'offline';
ZmRosterItem.SHOW_ONLINE = 1; //'online';     // jabber online
ZmRosterItem.SHOW_CHAT = 2; //'chat';         // jabber <show> chat
ZmRosterItem.SHOW_AWAY = 3; //'away';         // jabber <show> away
ZmRosterItem.SHOW_EXT_AWAY = 4; //'xa';       // jabber <show> xa (extended away)
ZmRosterItem.SHOW_DND = 5; //'dnd';           // jabber <show>> dnd (do not disturb)

ZmRosterItem.F_SHOW = "ZmRosterItem.show";
ZmRosterItem.F_STATUS = "ZmRosterItem.status";
ZmRosterItem.F_GROUPS = "ZmRosterItem.groups";
ZmRosterItem.F_NAME = "ZmRosterItem.name";
ZmRosterItem.F_UNREAD = "ZmRosterItem.unread";

ZmRosterItem.prototype.toString = 
function() {
	return "ZmRosterItem - " + this.name;
};

// Constants
//ZmRosterItem.ID_ROSTER_ITEM = ZmOrganizer.ID_ROSTER_ITEM;

ZmRosterItem.prototype.getShowText = 
function() {
    if (this.status) return this.status;
    switch (this.show) {
    case ZmRosterItem.SHOW_ONLINE:
        return ZmMsg.imStatusOnline;
    case ZmRosterItem.SHOW_CHAT:
        return ZmMsg.imStatusChat;
    case ZmRosterItem.SHOW_AWAY:
        return ZmMsg.imStatusAway;
    case ZmRosterItem.SHOW_EXT_AWAY:
        return ZmMsg.imStatusExtAway;
    case ZmRosterItem.SHOW_DND:
        return ZmMsg.imStatusDND;
    case ZmRosterItem.SHOW_OFFLINE:
    default:
        return ZmMsg.imStatusOffline;
        break;
    	}
};

ZmRosterItem.prototype.setShow  = 
function(show, status) {
    this.show = show;
    this.status = status;
    var fields = {};
    fields[ZmRosterItem.F_SHOW] = show;
    fields[ZmRosterItem.F_STATUS] = status;
    this._listNotify(ZmEvent.E_MODIFY, {fields: fields});
};

ZmRosterItem.prototype.setUnread  = 
function(num, addToTotal) {
    this.numUnreadIMs = addToTotal ? this.numUnreadIMs + num : num;
    var fields = {};
    fields[ZmRosterItem.F_UNREAD] = this.numUnreadIMs;
    this._listNotify(ZmEvent.E_MODIFY, {fields: fields});
};

ZmRosterItem.prototype.renameGroup = 
function(oldGroup, newGroup) {
    var oldI = -1;
    var newI = -1;
    for (var i in this.groups) {
        if (this.groups[i] == oldGroup) oldI = i;
        if (this.groups[i] == newGroup) newI = i;
    }
    if (newI !=-1 || oldI == -1) return;
    this.groups[oldI] = newGroup;
    this.groupNames = this.groups.join(",");
    
    var fields = {};
    fields[ZmRosterItem.F_GROUPS] = this.groupNames;
    this._listNotify(ZmEvent.E_MODIFY, {fields: fields});
//    this.group = newGroup.getName();
//    this.reparent(newGroup);
//    this._eventNotify(ZmEvent.E_MOVE);
};

ZmRosterItem.prototype.getIcon = 
function() {
    switch (this.show) {
    case ZmRosterItem.SHOW_ONLINE:
        return "ImAvailable";
    case ZmRosterItem.SHOW_CHAT:
        return "ImFree2Chat";
    case ZmRosterItem.SHOW_AWAY:
        return "ImAway";
    case ZmRosterItem.SHOW_EXT_AWAY:
        return "ImExtendedAway";
    case ZmRosterItem.SHOW_DND:
        return "ImDnd";
    case ZmRosterItem.SHOW_OFFLINE:
    default:
        return "RoundMinusDis"; //"Blank_16";
    	}
};

ZmRosterItem.sortCompare = 
function(itemA, itemB) {
	// sort by name
	var itemAName = itemA.getName().toLowerCase();
	var itemBName = itemB.getName().toLowerCase();
	if (itemAName < itemBName) {return -1;}
	if (itemAName > itemBName) {return 1;}
	return 0;
};

// Public methods
ZmRosterItem.prototype.getId = function() { return this.id; };

ZmRosterItem.prototype.getAddress= function() { return this.addr; };

ZmRosterItem.prototype.getGroups = function() { return this.groups; };

ZmRosterItem.prototype.getGroupNames = function() { return this.groupNames; };

ZmRosterItem.prototype.getName = function() {	return this.name ? this.name : this.addr;};

ZmRosterItem.prototype.getShow = function() { return this.show; };

ZmRosterItem.prototype.getStatus = function() { return this.status; };

ZmRosterItem.prototype.getUnread = function() { return this.numUnreadIMs; }

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
