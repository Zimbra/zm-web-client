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

/**
 * @overview
 */

/**
 * Creates a prompt dialog.
 * @class
 * This class represents a prompt dialog.
 * 
 * @param	{Hash}	args	a hash of arguments
 * @param	{Array}	args.buttons		an array of buttons (default is [{@link DwtDialog.OK_BUTTON}, {@link DwtDialog.CANCEL_BUTTON}])
 * @param	{String}	args.password	the password
 *  
 * @extends		ZmDialog
 * 
 * @see		ZmPromptDialog.getInstance
 * @see		ZmPromptDialog.getPasswordInstance
 */
ZmPromptDialog = function(args) {
	args.buttons = args.buttons || [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON];
	this._password = args.password;
	ZmDialog.call(this, args);

	this._labelFieldId = this._htmlElId + "_label";
	this._nameFieldId = this._htmlElId + "_name";
	this._setNameField(this._nameFieldId);
};

ZmPromptDialog.prototype = new ZmDialog;
ZmPromptDialog.prototype.constructor = ZmPromptDialog;

ZmPromptDialog.prototype.toString =
function() {
	return "ZmPromptDialog";
};

/**
 * Gets an instance of the prompt dialog.
 * 
 * @return	{ZmPromptDialog}		the dialog
 */
ZmPromptDialog.getInstance =
function() {
	if (!ZmPromptDialog._INSTANCE) {
		ZmPromptDialog._INSTANCE = new ZmPromptDialog({ parent:appCtxt.getShell() });
	}
	return ZmPromptDialog._INSTANCE;
};

/**
 * Gets an instance of the prompt dialog.
 * 
 * @return	{ZmPromptDialog}	the dialog
 */
ZmPromptDialog.getPasswordInstance =
function() {
	if (!ZmPromptDialog._PASSWORD_INSTANCE) {
		ZmPromptDialog._PASSWORD_INSTANCE = new ZmPromptDialog({ parent:appCtxt.getShell(), password: true });
	}
	return ZmPromptDialog._PASSWORD_INSTANCE;
};

/**
 * Pops-up the dialog.
 *  
 * @param {Hash}	params				a hash of parameters
 * @param {String}      params.title					the dialog box title
 * @param {String}	params.label					the label next to the dialog's input field
 * @param {String}	params.value					the initial value of input field
 * @param {AjxCallback}	params.callback			the callback to run when ok button is pressed
 */
ZmPromptDialog.prototype.popup =
function(params) {
	this.setTitle(params.title);
	Dwt.byId(this._labelFieldId).innerHTML = params.label;
	var nameElement = Dwt.byId(this._nameFieldId);
	nameElement.innerHTML = params.value || "";
	this._resetCallbacks();
	this.registerCallback(DwtDialog.OK_BUTTON, params.callback);	
	DwtDialog.prototype.popup.call(this);
	if (nameElement.focus) {
		nameElement.focus();
	}
};

ZmPromptDialog.prototype._contentHtml =
function() {
	return AjxTemplate.expand("share.Dialogs#ZmPromptDialog", { id: this._htmlElId, type: this._password ? "password" : "text" });
};

ZmPromptDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getPromptData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmPromptDialog.prototype._getPromptData =
function() {
	return {
		value: AjxStringUtil.trim(this._nameField.value),
		dialog: this
	};
};

ZmPromptDialog.prototype._enterListener =
function(ev) {
	var results = this._getPromptData();
	if (results)
		this._runEnterCallback(results);
};

ZmPromptDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField, this._colorButton];
};

