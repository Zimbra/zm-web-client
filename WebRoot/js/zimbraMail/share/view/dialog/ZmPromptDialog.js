/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

