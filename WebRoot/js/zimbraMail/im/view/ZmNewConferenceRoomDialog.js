/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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

ZmNewConferenceRoomDialog = function(params) {
	ZmDialog.call(this, params);
	this._createForm();
};

ZmNewConferenceRoomDialog.prototype = new ZmDialog;
ZmNewConferenceRoomDialog.prototype.constructor = ZmNewConferenceRoomDialog;

ZmNewConferenceRoomDialog.prototype.toString =
function() {
	return "ZmNewConferenceRoomDialog";
};

ZmNewConferenceRoomDialog.getInstance =
function() {
	ZmNewConferenceRoomDialog.INSTANCE = ZmNewConferenceRoomDialog.INSTANCE || new ZmNewConferenceRoomDialog({ parent: appCtxt.getShell() });
	return ZmNewConferenceRoomDialog.INSTANCE;
};

/**
 * Pops up the dialog.
 *
 * @param params				[hash]			hash of params:
 *        title					[String]		Dialog title
 *        name					[String]		Name of the room
 *        config				[hash]			Hash of config params. See ZmImService#configureConferenceRoom
 *        callback				[AjxCallback]	Callback to run when ok button is pressed
 */
ZmNewConferenceRoomDialog.prototype.popup =
function (params) {
	params = params || {};
	params.config = params.config || {};
	this.setTitle(params.title);
	this._form.setValue("NAME", params.name || "");
	this._form.setValue("PASSWORD", "");
	this._form.setValue("CONFIRM_PASSWORD", "");
	this._form.setValue("PERMANENT", params.config.persistent);
	this._form.setValue("ANONYMOUS", !params.config.noanonymous);
	this.registerCallback(DwtDialog.OK_BUTTON, params.callback);
	ZmDialog.prototype.popup.call(this);
};

ZmNewConferenceRoomDialog.prototype._createForm =
function() {
	var params = { parent: this, parentElement: this._getContentDiv() };
	params.form = {
		items: [
			// default items
			{ id: "NAME", type: "DwtInputField" },
			{ id: "PERMANENT", type: "DwtCheckbox", label: ZmMsg.imPermanentInfo},
			{ id: "ANONYMOUS", type: "DwtCheckbox", label: ZmMsg.imAnonymousInfo},
			{ id: "PASSWORD", type: "DwtInputField", params: { type: DwtInputField.PASSWORD } },
			{ id: "CONFIRM_PASSWORD", type: "DwtInputField", params: { type: DwtInputField.PASSWORD } }
		],
		template: "im.Chat#ZmNewConferenceRoomDialog" 
	};
	this._form = new DwtForm(params);
	this._setNameField(this._messageFieldId);
};

ZmNewConferenceRoomDialog.prototype._getRoomData =
function() {
	var name = this._form.getValue("NAME");
	if (!name) {
		appCtxt.setStatusMsg(ZmMsg.imRoomNameRequired, ZmStatusView.LEVEL_CRITICAL);
		return null;
	}
	var password = this._form.getValue("PASSWORD");
	var confirmPassword =  this._form.getValue("CONFIRM_PASSWORD");
	if (password != confirmPassword) {
		appCtxt.setStatusMsg(ZmMsg.imPasswordMismatch, ZmStatusView.LEVEL_CRITICAL);
		return null;
	}
	return {
		dialog: this,
		name: name,
		config: {
			passwordprotect: password ? true : false,
			password: this._form.getValue("PASSWORD"),
			persistent: !!this._form.getValue("PERMANENT"),
			noanonymous: !this._form.getValue("ANONYMOUS")
		}
	};
};

ZmNewConferenceRoomDialog.prototype._enterListener =
function() {
	var results = this._getRoomData();
	if (results) {
		this._runEnterCallback(results);
	}
};

ZmNewConferenceRoomDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getRoomData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewConferenceRoomDialog.prototype._handleResponseJoin =
function() {
	this.popdown();
};

