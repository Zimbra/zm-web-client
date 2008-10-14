/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmImService = function() {
	if (arguments.length == 0) { return; }

	ZmImService.INSTANCE = this;
	this._roster = null; // Is initialized when the roster is created.
}

ZmImService.prototype.getMyAddress =
function() {
	alert('Not implemented');
};

ZmImService.prototype.getGateways =
function(callback, params) {
	alert('Not implemented');
};

ZmImService.prototype.getRoster =
function(callback, params) {
	alert('Not implemented');
};

ZmImService.prototype.createRosterItem =
function(addr, name, groups, params) {
	alert('Not implemented');
};

ZmImService.prototype.deleteRosterItem =
function(rosterItem, params) {
	alert('Not implemented');
};

ZmImService.prototype.sendMessage =
function(chat, text, html, typing, params) {
	alert('Not implemented');
};

ZmImService.prototype.closeChat =
function(chat, params) {
	alert('Not implemented');
};

ZmImService.prototype.handleNotification =
function(im) {
	alert('Not implemented');
};

ZmImService.prototype.startIgnoreNotify =
function() {
	this.__avoidNotifyTimeout = new Date().getTime();

};

ZmImService.prototype.getShowNotify =
function() {
	return !this.__avoidNotifyTimeout ||
			(new Date().getTime() - this.__avoidNotifyTimeout > ZmRoster.NOTIFICATION_FOO_TIMEOUT);
};


