/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for Two factor initial setup
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmTwoFactorSetupDialog = function(params) {
	this.username = typeof appCtxt !== "undefined" ? appCtxt.getLoggedInUsername() : params.userName;
	this.twoStepAuthSpan = params.twoStepAuthSpan;
	this.twoStepAuthLink = params.twoStepAuthLink;
	this.twoStepAuthCodesContainer = params.twoStepAuthCodesContainer;
	this.twoStepAuthEnabledCallback = params.twoStepAuthEnabledCallback;
	// this.isFromLoginPage will be true if ZmTwoFactorSetupDialog is created from TwoFactorSetup.jsp, which is forwarded from login.jsp file.
	this.isFromLoginPage = params.isFromLoginPage;
	var previousButton = new DwtDialog_ButtonDescriptor(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, ZmMsg.previous, DwtDialog.ALIGN_RIGHT, this._previousButtonListener.bind(this));
	var beginSetupButton = new DwtDialog_ButtonDescriptor(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, ZmMsg.twoStepAuthBeginSetup, DwtDialog.ALIGN_RIGHT, this._beginSetupButtonListener.bind(this));
	var nextButton = new DwtDialog_ButtonDescriptor(ZmTwoFactorSetupDialog.NEXT_BUTTON, ZmMsg.next, DwtDialog.ALIGN_RIGHT, this._nextButtonListener.bind(this));
	var finishButton = new DwtDialog_ButtonDescriptor(ZmTwoFactorSetupDialog.FINISH_BUTTON, ZmMsg.twoStepAuthSuccessFinish, DwtDialog.ALIGN_RIGHT, this._finishButtonListener.bind(this));
	var cancelButton = new DwtDialog_ButtonDescriptor(ZmTwoFactorSetupDialog.CANCEL_BUTTON, ZmMsg.cancel, DwtDialog.ALIGN_RIGHT, this._cancelButtonListener.bind(this));
	var shell = typeof appCtxt !== "undefined" ? appCtxt.getShell() : new DwtShell({});
	var newParams = {
		parent : shell,
		title : ZmMsg.twoStepAuthSetup,
		standardButtons : [DwtDialog.NO_BUTTONS],
		extraButtons : [previousButton, beginSetupButton, nextButton, finishButton, cancelButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml());
	this._createControls();
	this._setAllowSelection();
};

ZmTwoFactorSetupDialog.prototype = new DwtDialog;
ZmTwoFactorSetupDialog.prototype.constructor = ZmTwoFactorSetupDialog;

ZmTwoFactorSetupDialog.PREVIOUS_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmTwoFactorSetupDialog.NEXT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmTwoFactorSetupDialog.FINISH_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmTwoFactorSetupDialog.CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmTwoFactorSetupDialog.ONE_TIME_CODES = "ZIMBRA_TWO_FACTOR_ONE_TIME_CODES";

ZmTwoFactorSetupDialog.prototype.toString =
function() {
	return "ZmTwoFactorSetupDialog";
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 *
 * @private
 */
ZmTwoFactorSetupDialog.prototype._contentHtml =
function() {
	var id = this._htmlElId;
	this._descriptionDivId = id + "_description";
	this._passwordDivId = id + "_password";
	this._passwordErrorDivId = id + "_password_error";
	this._authenticationDivId = id + "_authentication";
	this._emailDivId = id + "_email";
	this._codeDivId = id + "_code";
	this._codeDescriptionDivId = id + "_code_description";
	this._codeErrorDivId = id + "_code_error";
	this._successDivId = id + "_success";
	this._divIdArray = [this._descriptionDivId, this._passwordDivId, this._authenticationDivId, this._emailDivId, this._codeDivId, this._successDivId];
	return AjxTemplate.expand("share.Dialogs#ZmTwoFactorSetup", {id : id, username : this.username});
};

ZmTwoFactorSetupDialog.prototype._createControls =
function() {
	var id = this._htmlElId;
	this._passwordInput = Dwt.getElement(id + "_password_input");
	this._codeInput = Dwt.getElement(id + "_code_input");
	this._keySpan = Dwt.getElement(id + "_email_key");
	var keyupHandler = this._handleKeyUp.bind(this);
	Dwt.setHandler(this._passwordInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._passwordInput, DwtEvent.ONINPUT, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONINPUT, keyupHandler);
};

/**
** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
*
* @return An array of the input fields to be reset
*/
ZmTwoFactorSetupDialog.prototype._getInputFields =
function() {
	return [this._passwordInput, this._codeInput];
};

/**
 * Pops-up the dialog.
 */
ZmTwoFactorSetupDialog.prototype.popup =
function() {
	this.reset();
	DwtDialog.prototype.popup.call(this);
};

/**
 * Resets the dialog back to its original state.
 */
ZmTwoFactorSetupDialog.prototype.reset =
function() {
	Dwt.show(this._descriptionDivId);
	Dwt.hide(this._passwordDivId);
	Dwt.hide(this._passwordErrorDivId);
	Dwt.hide(this._authenticationDivId);
	Dwt.hide(this._emailDivId);
	Dwt.hide(this._codeDivId);
	Dwt.hide(this._codeErrorDivId);
	Dwt.hide(this._successDivId);
	this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, true);
	this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.FINISH_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.CANCEL_BUTTON, true);
	this._divIdArrayIndex = 0;
	DwtDialog.prototype.reset.call(this);
};

ZmTwoFactorSetupDialog.prototype._beginSetupButtonListener =
function() {
	Dwt.hide(this._descriptionDivId);
	Dwt.show(this._passwordDivId);
	this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
	this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._passwordInput.value !== "");
	this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
	this._passwordInput.focus();
	this._divIdArrayIndex = 1;
};

ZmTwoFactorSetupDialog.prototype._previousButtonListener =
function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	if (currentDivId === this._passwordDivId) {
		Dwt.hide(this._passwordErrorDivId);
		this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, true);
	}
	else if (currentDivId === this._codeDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
	}
	else if (currentDivId === this._successDivId) {
		this.setButtonVisible(ZmTwoFactorSetupDialog.FINISH_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
	}
	Dwt.show(this._divIdArray[this._divIdArrayIndex - 1]);
	Dwt.hide(this._divIdArray[this._divIdArrayIndex]);
	if (this._divIdArrayIndex > -1) {
		this._divIdArrayIndex--;
	}
};

ZmTwoFactorSetupDialog.prototype._nextButtonListener =
function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	if (currentDivId === this._passwordDivId || currentDivId === this._codeDivId) {
		this._enableTwoFactorAuth(currentDivId);
		return;
	}
	Dwt.show(this._divIdArray[this._divIdArrayIndex + 1]);
	Dwt.hide(this._divIdArray[this._divIdArrayIndex]);
	if (this._divIdArrayIndex < this._divIdArray.length) {
		this._divIdArrayIndex++;
	}
	if (currentDivId === this._emailDivId) {
		Dwt.hide(this._codeErrorDivId);
		Dwt.show(this._codeDescriptionDivId);
		this._codeInput.focus();
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._codeInput.value !== "");
	}
};

ZmTwoFactorSetupDialog.prototype._finishButtonListener =
function() {
	//If the user clicks finish button, redirect to the login page
	if (this.isFromLoginPage) {
		location.replace(location.href);
	}
	else {
		this.popdown();
		if (this.twoStepAuthSpan) {
			Dwt.setInnerHtml(this.twoStepAuthSpan, ZmMsg.twoStepAuth);
		}
		if (this.twoStepAuthLink) {
			Dwt.setInnerHtml(this.twoStepAuthLink, ZmMsg.twoStepAuthDisableLink);
		}
		if (this.twoStepAuthCodesContainer) {
			Dwt.setDisplay(this.twoStepAuthCodesContainer, "");
		}
		if (this.twoStepAuthEnabledCallback) {
			this.twoStepAuthEnabledCallback();
		}
	}
};

ZmTwoFactorSetupDialog.prototype._cancelButtonListener =
function() {
	//If the user clicks cancel button, redirect to the login page
	if (this.isFromLoginPage) {
		location.replace(location.href);
	}
	else {
		this.popdown();
	}
};

ZmTwoFactorSetupDialog.prototype._handleKeyUp =
function(ev) {
	var value = ev && ev.target && ev.target.value && ev.target.value.length;
	this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, !!value);
};

/**
 * Sends first EnableTwoFactorAuthRequest with username and password
 * Sends second EnableTwoFactorAuthRequest with username, temporary authToken and twoFactorCode
*/
ZmTwoFactorSetupDialog.prototype._enableTwoFactorAuth =
function(currentDivId) {
	var passwordInput = this._passwordInput;
	passwordInput.setAttribute("disabled", true);
	this.setButtonEnabled(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
	this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
	var command = new ZmCsfeCommand();
	if (currentDivId === this._codeDivId) {
		var codeInput = this._codeInput;
		codeInput.setAttribute("disabled", true);
		var jsonObj = {EnableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", name:{_content : this.username}, authToken:{_content : this._authToken}, twoFactorCode:{_content : codeInput.value}}};
	}
	else {
		var jsonObj = {EnableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", name:{_content : this.username}, password:{_content : passwordInput.value}}};
	}
	var callback = this._enableTwoFactorAuthCallback.bind(this, currentDivId);
	command.invoke({jsonObj:jsonObj, noAuthToken: true, asyncMode: true, callback: callback, serverUri:"/service/soap/"});
};

ZmTwoFactorSetupDialog.prototype._enableTwoFactorAuthCallback =
function(currentDivId, result) {
	if (!result || result.isException()) {
		this._handleTwoFactorAuthError(currentDivId, result.getException());
	}
	else {
		var response = result.getResponse();
		if (!response || !response.Body || !response.Body.EnableTwoFactorAuthResponse) {
			this._handleTwoFactorAuthError(currentDivId);
			return;
		}
		var enableTwoFactorAuthResponse = response.Body.EnableTwoFactorAuthResponse;
		var authToken = enableTwoFactorAuthResponse.authToken;
		this._authToken = authToken && authToken[0] && authToken[0]._content;
		var secret = enableTwoFactorAuthResponse.secret;
		var scratchCodes = enableTwoFactorAuthResponse.scratchCodes;
		if (secret && secret[0] && secret[0]._content) {
			Dwt.setInnerHtml(this._keySpan, secret[0]._content);
			this._handleTwoFactorAuthSuccess(currentDivId);
			return;
		}
		else if (scratchCodes && scratchCodes[0] && scratchCodes[0].scratchCode) {
			if (typeof appCtxt !== "undefined") {
				//Only the server will set ZmSetting.TWO_FACTOR_AUTH_ENABLED. Don’t try to save the setting from the UI.
				appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_ENABLED, true, false, false, true);
				var scratchCode = AjxUtil.map(scratchCodes[0].scratchCode, function(obj) {return obj._content});
				appCtxt.cacheSet(ZmTwoFactorSetupDialog.ONE_TIME_CODES, scratchCode);
			}
			this._handleTwoFactorAuthSuccess(currentDivId);
			return;
		}
		this._handleTwoFactorAuthError(currentDivId);
	}
};

ZmTwoFactorSetupDialog.prototype._handleTwoFactorAuthSuccess =
function(currentDivId) {
	if (currentDivId === this._passwordDivId) {
		Dwt.hide(this._passwordDivId);
		Dwt.show(this._authenticationDivId);
		Dwt.hide(this._passwordErrorDivId);
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
		this.setButtonEnabled(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
		if (this._divIdArrayIndex < this._divIdArray.length) {
			this._divIdArrayIndex++;
		}
	}
	else if (currentDivId === this._codeDivId) {
		Dwt.show(this._successDivId);
		Dwt.hide(this._codeDivId);
		this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.FINISH_BUTTON, true);
		this.setButtonVisible(ZmTwoFactorSetupDialog.CANCEL_BUTTON, false);
	}
};

ZmTwoFactorSetupDialog.prototype._handleTwoFactorAuthError =
function(currentDivId, exception) {
	if (currentDivId === this._passwordDivId) {
		if (exception && exception.code === ZmCsfeException.ACCT_AUTH_FAILED) {
			Dwt.show(this._passwordErrorDivId);
		}
		var passwordInput = this._passwordInput;
		passwordInput.removeAttribute("disabled");
		passwordInput.value = "";
		passwordInput.focus();
	}
	else if (currentDivId === this._codeDivId) {
		Dwt.show(this._codeErrorDivId);
		Dwt.hide(this._codeDescriptionDivId);
		var codeInput = this._codeInput;
		codeInput.removeAttribute("disabled");
		codeInput.value = "";
		codeInput.focus();
	}
	this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
	this.setButtonEnabled(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
};

/**
 * Determines whether to prevent the browser from displaying its context menu.
 */
ZmTwoFactorSetupDialog.prototype.preventContextMenu =
function() {
	return false;
};

ZmTwoFactorSetupDialog.disableTwoFactorAuth =
function(params, dialog) {
	var command = new ZmCsfeCommand();
	var jsonObj = {DisableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount"}};
	var callback = ZmTwoFactorSetupDialog.disableTwoFactorAuthCallback.bind(window, params, dialog);
	command.invoke({jsonObj: jsonObj, noAuthToken: true, asyncMode: true, callback: callback, serverUri:"/service/soap/"});
};

ZmTwoFactorSetupDialog.disableTwoFactorAuthCallback =
function(params, dialog) {
	dialog.popdown();
	Dwt.setInnerHtml(params.twoStepAuthSpan, ZmMsg.twoStepStandardAuth);
	Dwt.setInnerHtml(params.twoStepAuthLink, ZmMsg.twoStepAuthSetupLink);
	Dwt.setDisplay(params.twoStepAuthCodesContainer, Dwt.DISPLAY_NONE);
	appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_ENABLED, false, false, false, true);
};