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

/**
*
*/
function ZmRosterPresence(show, priority, showStatus) {
    this._show = show || ZmRosterPresence.SHOW_ONLINE;
    this._priority = priority;
    this._showStatus = showStatus;
};

//ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRosterPresence.SHOW_OFFLINE = 'offline';
ZmRosterPresence.SHOW_ONLINE = 'online';     // jabber online
ZmRosterPresence.SHOW_CHAT = 'chat';         // jabber <show> chat
ZmRosterPresence.SHOW_AWAY = 'away';         // jabber <show> away
ZmRosterPresence.SHOW_EXT_AWAY = 'xa';       // jabber <show> xa (extended away)
ZmRosterPresence.SHOW_DND = 'dnd';           // jabber <show>> dnd (do not disturb)

ZmRosterPresence.prototype.setShow = function(show) { this._show = show; return this; }

ZmRosterPresence.prototype.setStatus = function(showStatus) { this._showStatus = showStatus; return this; }

ZmRosterPresence.prototype.setPriority = function(priority) { this._priority = priority; return this; }

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
    case ZmRosterPresence.SHOW_OFFLINE:
    default:
        return "RoundMinusDis"; //"Blank_16";
    	}
};
