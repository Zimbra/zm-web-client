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

/**
 * Singleton alert class that alerts the user by popping up a message on the desktop.
 */
ZmDesktopAlert = function() {
};

ZmDesktopAlert.prototype = new ZmAlert;
ZmDesktopAlert.prototype.constructor = ZmDesktopAlert;

ZmDesktopAlert.prototype.toString =
function() {
	return "ZmDesktopAlert";
};

ZmDesktopAlert.getInstance =
function() {
	return ZmDesktopAlert.INSTANCE = ZmDesktopAlert.INSTANCE || new ZmDesktopAlert();
};

ZmDesktopAlert.prototype.start =
function(title, message) {
	AjxDispatcher.require([ "BrowserPlus" ]);
	var serviceObj = { service: "Notify", version: "2", minversion: "2.0.9" };
	var callback = new AjxCallback(this, this._notityServiceCallback, [title, message]);
	ZmBrowserPlus.getInstance().require(serviceObj, callback);
};

ZmDesktopAlert.prototype._notityServiceCallback =
function(title, message, service) {
	service.show({ title: title, message: message }, function(){});
};

