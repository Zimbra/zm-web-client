/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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
*
*/
ZmRosterPresence = function(show, priority, showStatus) {
	this._show = show || ZmRosterPresence.SHOW_OFFLINE;
	this._priority = priority;
	this._showStatus = showStatus;
};

//ZmRoster.prototype = new ZmModel;
ZmRoster.prototype.constructor = ZmRoster;

ZmRosterPresence.SHOW_UNKNOWN	= 'UNKNOWN';	// local client, unknown presence state
ZmRosterPresence.SHOW_OFFLINE	= 'OFFLINE';	// our offline
ZmRosterPresence.SHOW_ONLINE	= 'ONLINE';		// jabber online
ZmRosterPresence.SHOW_CHAT		= 'CHAT';		// jabber <show> chat
ZmRosterPresence.SHOW_AWAY		= 'AWAY';		// jabber <show> away
ZmRosterPresence.SHOW_EXT_AWAY	= 'XA';			// jabber <show> xa (extended away)
ZmRosterPresence.SHOW_DND		= 'DND';		// jabber <show>> dnd (do not disturb)

ZmRosterPresence.prototype.setShow = function(show) 		{ this._show = show; return this; };
ZmRosterPresence.prototype.setStatus = function(showStatus) { this._showStatus = showStatus; return this; };
ZmRosterPresence.prototype.setPriority = function(priority) { this._priority = priority; return this; };
ZmRosterPresence.prototype.getShow = function() 			{ return this._show; };
ZmRosterPresence.prototype.getStatus = function() 			{ return this._showStatus; };
ZmRosterPresence.prototype.getPriority = function() 		{ return this._priority; };

// set from notification and/or roster presence. returns true if presence was diff
ZmRosterPresence.prototype.setFromJS =
function(js) {
	var same = (this._show == js.show) &&
			(this._priority == js.priority) &&
			(this._showStatus == js.status);

	if (!same) {
		this._show = js.show || ZmRosterPresence.SHOW_OFFLINE;
		this._priority = js.priority;
		this._showStatus = js.status;
	}

	return !same;
};

ZmRosterPresence.prototype.getShowText =
function() {
	if (this._showStatus) { return this._showStatus; }

	switch (this._show) {
		case ZmRosterPresence.SHOW_ONLINE:		return ZmMsg.imStatusOnline;
		case ZmRosterPresence.SHOW_CHAT:		return ZmMsg.imStatusChat;
		case ZmRosterPresence.SHOW_AWAY:		return ZmMsg.imStatusAway;
		case ZmRosterPresence.SHOW_EXT_AWAY:	return ZmMsg.imStatusExtAway;
		case ZmRosterPresence.SHOW_DND:			return ZmMsg.imStatusDND;
		case ZmRosterPresence.SHOW_UNKNOWN:		return ZmMsg.imStatusUnknown;
		case ZmRosterPresence.SHOW_OFFLINE:		return ZmMsg.imStatusOffline;
		default:								return ZmMsg.imStatusOffline;
	}
};

ZmRosterPresence.prototype.getIcon =
function(small) {
	switch (this._show) {
		case ZmRosterPresence.SHOW_ONLINE:		return small ? "_ImSmallAvailable" : "ImAvailable";
		case ZmRosterPresence.SHOW_CHAT:		return "ImFree2Chat";
		case ZmRosterPresence.SHOW_AWAY:		return small ? "_ImSmallAway" : "ImAway";
		case ZmRosterPresence.SHOW_EXT_AWAY:	return small ? "_ImSmallExtendedAway" : "ImExtendedAway";
		case ZmRosterPresence.SHOW_DND:			return small ? "_ImSmallDnD" : "ImDnd";
		case ZmRosterPresence.SHOW_UNKNOWN:		return "ImBuddy";
		case ZmRosterPresence.SHOW_OFFLINE:		return small ? "_ImSmallUnavailable" : "Offline";
		default:								return small ? "_ImSmallUnavailable" : "Offline";
	}
};

ZmRosterPresence.operationToShow =
function(op) {
	switch (op) {
		case ZmOperation.IM_PRESENCE_ONLINE:	return ZmRosterPresence.SHOW_ONLINE;
		case ZmOperation.IM_PRESENCE_CHAT:		return ZmRosterPresence.SHOW_CHAT;
		case ZmOperation.IM_PRESENCE_AWAY:		return ZmRosterPresence.SHOW_AWAY;
		case ZmOperation.IM_PRESENCE_XA:		return ZmRosterPresence.SHOW_EXT_AWAY;
		case ZmOperation.IM_PRESENCE_DND:		return ZmRosterPresence.SHOW_DND;
		case ZmOperation.IM_PRESENCE_OFFLINE:	return ZmRosterPresence.SHOW_OFFLINE;
		default:								return ZmRosterPresence.SHOW_OFFLINE;
	}
};

ZmRosterPresence.prototype.getShowOperation =
function() {
	return ZmRosterPresence.showToOperation(this.getShow());
};

ZmRosterPresence.showToOperation =
function(op) {
	switch (op) {
		case ZmRosterPresence.SHOW_ONLINE:		return ZmOperation.IM_PRESENCE_ONLINE;
		case ZmRosterPresence.SHOW_CHAT:		return ZmOperation.IM_PRESENCE_CHAT;
		case ZmRosterPresence.SHOW_AWAY:		return ZmOperation.IM_PRESENCE_AWAY;
		case ZmRosterPresence.SHOW_EXT_AWAY:	return ZmOperation.IM_PRESENCE_XA;
		case ZmRosterPresence.SHOW_DND:			return ZmOperation.IM_PRESENCE_DND;
		case ZmRosterPresence.SHOW_OFFLINE:		return ZmOperation.IM_PRESENCE_OFFLINE;
		default:								return ZmOperation.IM_PRESENCE_OFFLINE;
	}
};
