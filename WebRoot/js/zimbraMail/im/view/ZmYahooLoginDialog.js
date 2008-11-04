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

ZmYahooLoginDialog = function(params) {
	ZmDialog.call(this, params);

	this._nameFieldId = this._htmlElId + "_nameField";
	this._passwordFieldId = this._htmlElId + "_passwordField";
	this._rememberIdCheckboxId = this._htmlElId + "_rememberIdCheckbox";
	this._messageBoxId = this._htmlElId + "_messageBox";
	this._messageTextId = this._htmlElId + "_messageText";
	this._setNameField(this._nameFieldId);
};

ZmYahooLoginDialog.prototype = new ZmDialog;
ZmYahooLoginDialog.prototype.constructor = ZmYahooLoginDialog;


// Public methods

ZmYahooLoginDialog.prototype.toString =
function() {
	return "ZmYahooLoginDialog";
};

ZmYahooLoginDialog.getInstance =
function() {
	if (!ZmYahooLoginDialog._INSTANCE) {
		ZmYahooLoginDialog._INSTANCE = new ZmYahooLoginDialog({parent:appCtxt.getShell()});
	}
	return ZmYahooLoginDialog._INSTANCE;
};

/**
 * Pops up the dialog.
 *
 * @param params				[hash]			hash of params:
 *        id					[String]		The initial yahoo id
 *        remember				[boolean]		True to initially check the Remember Me option
 *        message				[String]		Optional error message to display
 *        callback				[AjxCallback]	Callback to run when ok button is pressed
 */
ZmYahooLoginDialog.prototype.popup =
function(params) {
	this._resetCallbacks();
	this.setMessage(params.message);
	ZmDialog.prototype.popup.call(this);
	this.setTitle(ZmMsg.imYahooLogin);
	this._nameField.value = params.id || "";
	var passwordField = Dwt.byId(this._passwordFieldId);
	passwordField.value = "";
	Dwt.byId(this._rememberIdCheckboxId).checked = params.remember;
	var focusField = params.id ? passwordField : this._nameField;
	if (focusField.focus) {
		focusField.focus();
	}
	this.registerCallback(DwtDialog.OK_BUTTON, params.callback);
};

ZmYahooLoginDialog.prototype.setMessage =
function(message) {
	var messageBox = Dwt.byId(this._messageBoxId);
	Dwt.setVisible(messageBox, message);
	Dwt.byId(this._messageTextId).innerHTML = message || "";
};

ZmYahooLoginDialog.prototype._contentHtml =
function() {
	return AjxTemplate.expand("im.Chat#ZmYahooLoginDialog", { id: this._htmlElId});
};

ZmYahooLoginDialog.prototype._initLoginControls =
function() {
};

ZmYahooLoginDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getLoginData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmYahooLoginDialog.prototype._getLoginData =
function() {
	return {
		id: AjxStringUtil.trim(this._nameField.value),
		password: Dwt.byId(this._passwordFieldId).value,
		remember: Dwt.byId(this._rememberIdCheckboxId).checked,
		dialog: this
	};
};

ZmYahooLoginDialog.prototype._enterListener =
function(ev) {
	var results = this._getLoginData();
	if (results)
		this._runEnterCallback(results);
};

ZmYahooLoginDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField, this._passwordFieldId, this._rememberIdCheckboxId];
};

