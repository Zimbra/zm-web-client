/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016 Synacor, Inc. All Rights Reserved.
 *
 * ***** END LICENSE BLOCK *****
 */
/**
 * Created by administrator on 29/05/15.
 */

/**
 * Creates a application code dialog.
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmApplicationCodeDialog = function(appPasscodeCallback) {
	var nextButton = new DwtDialog_ButtonDescriptor(ZmApplicationCodeDialog.NEXT_BUTTON, ZmMsg.next, DwtDialog.ALIGN_RIGHT, this._nextButtonListener.bind(this));
	var cancelButton = new DwtDialog_ButtonDescriptor(ZmApplicationCodeDialog.CANCEL_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT, this._cancelButtonListener.bind(this));
	var params = {
		parent : appCtxt.getShell(),
		title : ZmMsg.twoStepAuthAddAppCode,
		standardButtons : [DwtDialog.NO_BUTTONS],
		extraButtons : [cancelButton, nextButton]
	};
	DwtDialog.call(this, params);
	this.setContent(this._contentHtml());
	this._createControls();
	this._setAllowSelection();
	this.appPasscodeCallback = appPasscodeCallback;

	this.getButton(ZmApplicationCodeDialog.NEXT_BUTTON).addClassName("ZPrimaryButton");
};

ZmApplicationCodeDialog.prototype = new DwtDialog;
ZmApplicationCodeDialog.prototype.constructor = ZmApplicationCodeDialog;

ZmApplicationCodeDialog.NEXT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmApplicationCodeDialog.CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmApplicationCodeDialog.prototype._nextButtonListener =
function() {
	this.setButtonEnabled(ZmApplicationCodeDialog.NEXT_BUTTON, false);
	var appName = this._appNameInput.value;
	var callback = this._handleAppSpecificPassword.bind(this, appName);
	var errorCallback = this._handleAppSpecificPasswordError.bind(this, appName);
	this._createAppSpecificPassword(appName, callback, errorCallback);
};

ZmApplicationCodeDialog.prototype._cancelButtonListener =
function() {
	this.popdown();
};

ZmApplicationCodeDialog.prototype._contentHtml =
function() {
	var id = this._htmlElId;
	this._appName = id + "_app_name";
	this._appPassCode = id + "_app_passcode";
	this._appPassCodeValue = id + "_app_passcode_value";
	return AjxTemplate.expand("prefs.Pages#AddApplicationCode", {id : id});
};

ZmApplicationCodeDialog.prototype._createControls =
function() {
	var id = this._htmlElId;
	this.setButtonEnabled(ZmApplicationCodeDialog.NEXT_BUTTON, false);
	this._appNameInput = Dwt.getElement(id + "_app_name_input");
	Dwt.setHandler(this._appNameInput, DwtEvent.ONKEYUP, this._handleKeyUp.bind(this));
	this._appNameError = Dwt.getElement(id + "_app_name_error");
};

ZmApplicationCodeDialog.prototype._handleKeyUp =
function(ev) {
	var value = ev && ev.target && ev.target.value && ev.target.value.length;
	this.setButtonEnabled(ZmApplicationCodeDialog.NEXT_BUTTON, !!value);
};

/**
 ** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
 *
 * @return An array of the input fields to be reset
 */
ZmApplicationCodeDialog.prototype._getInputFields =
function() {
	return [this._appNameInput];
};

/**
 * Pops-up the dialog.
 */
ZmApplicationCodeDialog.prototype.popup =
function() {
	this.reset();
	DwtDialog.prototype.popup.call(this);
	this._appNameInput.focus();
};

/**
 * Resets the dialog back to its original state.
 */
ZmApplicationCodeDialog.prototype.reset =
function() {
	Dwt.show(this._appName);
	Dwt.setInnerHtml(this._appNameError, "");
	Dwt.hide(this._appPassCode);
	DwtDialog.prototype.reset.call(this);
	this.setButtonEnabled(ZmApplicationCodeDialog.NEXT_BUTTON, false);
	this.setButtonVisible(ZmApplicationCodeDialog.NEXT_BUTTON, true);
	this.getButton(ZmApplicationCodeDialog.CANCEL_BUTTON).setText(ZmMsg.cancel);
	this.getButton(ZmApplicationCodeDialog.CANCEL_BUTTON).delClassName("ZPrimaryButton");
};

ZmApplicationCodeDialog.prototype._createAppSpecificPassword =
function(appName, callback, errorCallback) {
	var jsonObj = {CreateAppSpecificPasswordRequest : {_jsns:"urn:zimbraAccount", appName:{_content : appName}}};
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:callback, errorCallback:errorCallback});
};

ZmApplicationCodeDialog.prototype._handleAppSpecificPassword =
function(appName, result) {
	var response = result.getResponse();
	if (!response || !response.CreateAppSpecificPasswordResponse) {
		this._handleAppSpecificPasswordError(appName);
		return;
	}
	Dwt.hide(this._appName);
	Dwt.setInnerHtml(Dwt.getElement(this._appPassCodeValue), response.CreateAppSpecificPasswordResponse.pw);
	Dwt.show(this._appPassCode);
	this.setButtonVisible(ZmApplicationCodeDialog.NEXT_BUTTON, false);
	this.getButton(ZmApplicationCodeDialog.CANCEL_BUTTON).setText(ZmMsg.close);
	this.getButton(ZmApplicationCodeDialog.CANCEL_BUTTON).addClassName("ZPrimaryButton");
	this.appPasscodeCallback && this.appPasscodeCallback();
};

ZmApplicationCodeDialog.prototype._handleAppSpecificPasswordError =
function(appName, exception) {
	var errorMsg;
	if (exception) {
		if (exception.msg === "system failure: app-specific password already exists for the name " + appName) {
			errorMsg = ZmMsg.twoStepAuthAppNameError1;
		}
		else {
			errorMsg = exception.getErrorMsg();
		}
	}
	else {
		errorMsg = ZmMsg.twoStepAuthAppNameError2;
	}
	Dwt.setInnerHtml(this._appNameError, errorMsg);
	this._appNameInput.focus();
	this.setButtonEnabled(ZmApplicationCodeDialog.NEXT_BUTTON, true);
	return true;
};
