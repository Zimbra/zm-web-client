/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmImApp(appCtxt, container) {

	ZmApp.call(this, ZmZimbraMail.IM_APP, appCtxt, container);

	this._active = false;
	this.getRoster(); // pre-create
};

ZmImApp.prototype = new ZmApp;
ZmImApp.prototype.constructor = ZmImApp;

ZmImApp.prototype.toString = 
function() {
	return "ZmImApp";
};

ZmImApp.prototype.launch =
function(callback) {
    var clc = this.getChatListController();
    clc.show();
	if (callback)
		callback.run();
};

ZmImApp.prototype.activate =
function(active) {
    this._active = active;
    if (active) this._appCtxt.setStatusIconVisible(ZmStatusView.ICON_IM, false);
};

ZmImApp.prototype.isActive =
function() {
    return this._active;
};

ZmImApp.prototype.getChatListController =
function() {
	if (!this._chatListController)
		this._chatListController = new ZmChatListController(this._appCtxt, this._container, this);
	return this._chatListController;
};

ZmImApp.prototype.getRoster =
function() {
	if (!this._roster)
		this._roster = new ZmRoster(this._appCtxt, this);
	return this._roster;
};

ZmImApp.prototype.getAutoCompleteGroups =
function() {
    return new ZmRosterTreeGroups(this.getRoster().getRosterItemTree());
};
