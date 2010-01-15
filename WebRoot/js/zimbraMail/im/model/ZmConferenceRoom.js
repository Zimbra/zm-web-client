/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
ZmConferenceRoom = function(params) {
	if (arguments.length == 0) return;

	params.type = ZmOrganizer.CONFERENCE_ITEM;
	ZmOrganizer.call(this, params);

	this.status = params.status || ZmConferenceRoom.STATUS.READY;
	this.thread = params.thread;
	this.config = null;
};

// Status values. More statuses to be supported by server later.
ZmConferenceRoom.STATUS = {
	NEW: "NewRoomCreated",  // this is a NEW, LOCKED, ROOM. You must configure it.
	READY: "- Ready -"
};

ZmConferenceRoom.prototype = new ZmOrganizer;
ZmConferenceRoom.prototype.constructor = ZmConferenceRoom;

ZmConferenceRoom.prototype.toString =
function() {
	return "ZmConferenceRoom";
};

ZmConferenceRoom.prototype.getAddress =
function() {
	return this.id;
};

ZmConferenceRoom.prototype.getIcon =
function() {
	return "ImGroup";
};

ZmConferenceRoom.prototype.configure =
function(config, callback) {
	var responseCallback = new AjxCallback(this, this._handleResponseConfigure, [config, callback]);
	ZmImApp.INSTANCE.getService().configureConferenceRoom(this, config, responseCallback);
};

ZmConferenceRoom.prototype._handleResponseConfigure =
function(config, callback) {
	this.status = ZmConferenceRoom.STATUS.READY;
	this._config = config;
	if (callback) {
		callback.run(this);
	}
};

ZmConferenceRoom.prototype.join =
function(password, callback) {
	var responseCallback = new AjxCallback(this, this._handleResponseJoin, [callback]);
	ZmImApp.INSTANCE.getService().joinConferenceRoom(this, password, responseCallback);
};

ZmConferenceRoom.prototype._handleResponseJoin =
function(callback, jsonObj) {
	this.thread = jsonObj.thread;
	if (callback) {
		callback.run(this, jsonObj);
	}
};

