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
*
*/
function ZmRosterPresence(show, priority, showStatus) {
    this._show = show || ZmRosterPresence.SHOW_OFFLINE;
    this._priority = priority;
    this._showStatus = showStatus;
};

//ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRosterPresence.SHOW_UNKNOWN = 'UNKNOWN';   // local client, unknown presence state
ZmRosterPresence.SHOW_OFFLINE = 'OFFLINE';   // our offline
ZmRosterPresence.SHOW_ONLINE = 'ONLINE';     // jabber online
ZmRosterPresence.SHOW_CHAT = 'CHAT';         // jabber <show> chat
ZmRosterPresence.SHOW_AWAY = 'AWAY';         // jabber <show> away
ZmRosterPresence.SHOW_EXT_AWAY = 'XA';       // jabber <show> xa (extended away)
ZmRosterPresence.SHOW_DND = 'DND';           // jabber <show>> dnd (do not disturb)

ZmRosterPresence.prototype.setShow = function(show) { this._show = show; return this; }

ZmRosterPresence.prototype.setStatus = function(showStatus) { this._showStatus = showStatus; return this; }

ZmRosterPresence.prototype.setPriority = function(priority) { this._priority = priority; return this; }

// set from notification and/or roster presence. returns true if presence was diff
ZmRosterPresence.prototype.setFromJS = 
function(js) {
    var same = (this._show == js.show) && (this._priority == js.priority) && (this._showStatus == js.status);
    if (!same) {
        this._show = js.show || ZmRosterPresence.SHOW_OFFLINE;
        this._priority = js.priority;
        this._showStatus = js.status;
    }
    return !same;
};

ZmRosterPresence.prototype.getShow = function() { return this._show; }

ZmRosterPresence.prototype.getStatus = function() { return this._showStatus; }

ZmRosterPresence.prototype.getPriority = function() { return this._priority; }

ZmRosterPresence.prototype.getShowText = 
function() {
    if (this._showStatus) return this._showStatus;
    switch (this._show) {
    case ZmRosterPresence.SHOW_ONLINE:
        return ZmMsg.imStatusOnline;
    case ZmRosterPresence.SHOW_CHAT:
        return ZmMsg.imStatusChat;
    case ZmRosterPresence.SHOW_AWAY:
        return ZmMsg.imStatusAway;
    case ZmRosterPresence.SHOW_EXT_AWAY:
        return ZmMsg.imStatusExtAway;
    case ZmRosterPresence.SHOW_DND:
        return ZmMsg.imStatusDND;
    case ZmRosterPresence.SHOW_UNKNOWN:
        return ZmMsg.imStatusUnknown;
    case ZmRosterPresence.SHOW_OFFLINE:
    default:
        return ZmMsg.imStatusOffline;
        break;
    	}
};

ZmRosterPresence.prototype.getIcon = 
function() {
    switch (this._show) {
    case ZmRosterPresence.SHOW_ONLINE:
        return "ImAvailable";
    case ZmRosterPresence.SHOW_CHAT:
        return "ImFree2Chat";
    case ZmRosterPresence.SHOW_AWAY:
        return "ImAway";
    case ZmRosterPresence.SHOW_EXT_AWAY:
        return "ImExtendedAway";
    case ZmRosterPresence.SHOW_DND:
        return "ImDnd";
    case ZmRosterPresence.SHOW_UNKNOWN:
    return "ImBuddy"; //Blank_16";    
    case ZmRosterPresence.SHOW_OFFLINE:
    default:
        return "RoundMinusDis"; //"Blank_16";
    	}
};

ZmRosterPresence.operationToShow = 
function(op) {
    switch (op) {
    case ZmOperation.IM_PRESENCE_ONLINE:
        return ZmRosterPresence.SHOW_ONLINE;
    case ZmOperation.IM_PRESENCE_CHAT:
        return ZmRosterPresence.SHOW_CHAT;
    case ZmOperation.IM_PRESENCE_AWAY:
        return ZmRosterPresence.SHOW_AWAY;
    case ZmOperation.IM_PRESENCE_XA:
        return ZmRosterPresence.SHOW_EXT_AWAY;
    case ZmOperation.IM_PRESENCE_DND:
        return ZmRosterPresence.SHOW_DND;
    case ZmOperation.IM_PRESENCE_OFFLINE:
    default:
        return ZmRosterPresence.SHOW_OFFLINE;
        break;
    	}
};

ZmRosterPresence.prototype.getShowOperation = 
function() {
    return ZmRosterPresence.showToOperation(this.getShow());
};

ZmRosterPresence.showToOperation = 
function(op) {
    switch (op) {
    case ZmRosterPresence.SHOW_ONLINE:
        return ZmOperation.IM_PRESENCE_ONLINE;
    case ZmRosterPresence.SHOW_CHAT:
        return ZmOperation.IM_PRESENCE_CHAT;
    case ZmRosterPresence.SHOW_AWAY:
        return ZmOperation.IM_PRESENCE_AWAY;
    case ZmRosterPresence.SHOW_EXT_AWAY:
        return ZmOperation.IM_PRESENCE_XA;
    case ZmRosterPresence.SHOW_DND:
        return ZmOperation.IM_PRESENCE_DND;
    case ZmRosterPresence.SHOW_OFFLINE:
    default:
        return ZmOperation.IM_PRESENCE_OFFLINE;
        break;
    	}
};
