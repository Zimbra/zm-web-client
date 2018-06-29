/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2015, 2016, 2017, 2018 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2015, 2016, 2017, 2018 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a dialog for Password Recovery initial setup
 * @constructor
 * @class
 *
 * @extends	DwtDialog
 */
ZmPasswordRecoveryDialog = function(params) {
	this.accountInput = params.accountInput || "";

	var emailSubmitButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON,
								ZmMsg.passwordRecoveryButtonSubmit,
								DwtDialog.ALIGN_RIGHT,
								this._emailSubmitButtonListener.bind(this));

	var requestCodeButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON,
								ZmMsg.recoveryEmailButtonRequest,
								DwtDialog.ALIGN_RIGHT,
								this._requestCodeButtonListener.bind(this));

	var verifyCodeButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON,
								ZmMsg.recoveryEmailButtonValidate,
								DwtDialog.ALIGN_RIGHT,
								this._verifyCodeButtonListener.bind(this));

	var resendOptionButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON,
								ZmMsg.recoveryEmailButtonResend,
								DwtDialog.ALIGN_LEFT,
								this._resendOptionButtonListener.bind(this));

	var resetSubmitButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON,
								ZmMsg.passwordRecoveryButtonSubmit,
								DwtDialog.ALIGN_RIGHT,
								this._resetSubmitButtonListener.bind(this));

	var cancelButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.CANCEL_BUTTON,
								ZmMsg.cancel,
								DwtDialog.ALIGN_LEFT,
								this._cancelButtonListener.bind(this));

	var shell = typeof appCtxt !== "undefined" ? appCtxt.getShell() : new DwtShell({});
	var newParams = {
		parent : shell,
		title : ZmMsg.passwordRecoveryTitle,
		standardButtons : [DwtDialog.NO_BUTTONS],
		extraButtons : [cancelButton, emailSubmitButton, requestCodeButton, resendOptionButton, verifyCodeButton, resetSubmitButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml());
	this._createControls();
	this._setAllowSelection();

	// Hide title
	Dwt.hide(this._titleEl)
};

ZmPasswordRecoveryDialog.prototype = new DwtDialog;
ZmPasswordRecoveryDialog.prototype.constructor = ZmPasswordRecoveryDialog;
ZmPasswordRecoveryDialog.CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmPasswordRecoveryDialog.prototype.toString = function() {
	return "ZmPasswordRecoveryDialog";
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 *
 * @private
 */
ZmPasswordRecoveryDialog.prototype._contentHtml = function() {
	var id = this._htmlElId;
	this._getRecoveryAccountDivId = id + "_get_recovery_account";
	this._requestCodeDivId = id + "_request_code";
	this._validateCodeDivId = id + "_validate_code";
	this._validateCodeErrorDivId = id + "_validate_code_error";
	this._codeSuccessDivId = id + "_code_success";
	this._resetPasswordDivId = id + "_reset_password";
	this._resetPasswordDescriptionDivId = id + "_reset_password_description";
	this._resetPasswordErrorDivId = id + "_reset_password_error";
	this._passwordResetSuccessDivId = id + "_password_reset_success";
	this._divIdArray = [this._getRecoveryAccountDivId, this._requestCodeDivId, this._validateCodeDivId, this._codeSuccessDivId, this._resetPasswordDivId, this._passwordResetSuccessDivId];
	return AjxTemplate.expand("share.Dialogs#ZmPasswordRecovery", {id : id, accountInput : this.accountInput});
};

ZmPasswordRecoveryDialog.prototype._createRecoveryButtons =
function(ide, text, enabled, visible, divSuffix, listener) {
	var button, buttonDiv = document.getElementById(this._htmlElId + divSuffix);
	if (buttonDiv) {
		button = new DwtButton({parent: this, id: ide});
		button.setText(text);
		button.setEnabled(enabled);
		button.setVisible(visible);
		if (listener) {
			button.addSelectionListener(new AjxListener(this, this[listener]));
		}
		button.replaceElement(buttonDiv);
		this[ide] = button;
	}
};

ZmPasswordRecoveryDialog.prototype._createControls = function() {
	var id = this._htmlElId;
	var cancelbutton = this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON);
	var accountKeyupHandler = this._accountHandleKeyUp.bind(this);
	var codeKeyupHandler = this._codeHandleKeyUp.bind(this);
	var resetKeyupHandler = this._resetHandleKeyUp.bind(this);

	this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON).setClassName("ZmPasswordRecoveryButton");
	this.getButton(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON).setClassName("ZmPasswordRecoveryButton");
	this.getButton(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON).setClassName("ZmPasswordRecoveryButton");
	this.getButton(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON).setClassName("ZmPasswordRecoveryButton");
	this.getButton(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON).setClassName("ZmPasswordRecoveryButton");
	this.getButton(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON).setClassName("ZmPasswordRecoveryButton");


	cancelbutton.setClassName("ZmPasswordRecoveryButton");
	// Create buttons
	this._createRecoveryButtons("continueSessionsRecoveryButton", ZmMsg.recoveryEmailButtonContinueSession, true, false,
					"_CONTINUE_BUTTON", "_finishButtonListener");
	this._createRecoveryButtons("resetPasswordRecoveryButton", ZmMsg.recoveryEmailButtonResetPassword, true, false,
					"_RESET_PASSWORD", "_resetButtonListener");
	this._accountInput = Dwt.getElement(id + "_account_input");
	this._accountErrorDiv = Dwt.getElement(id + "_account_input_error");
	this._requestErrorDiv = Dwt.getElement(id + "_request_code_error");
	this._validateErrorDiv = Dwt.getElement(id + "_validate_code_error");
	this._codeInput = Dwt.getElement(id + "_code_input");
	this._passwordNewInput = Dwt.getElement(id + "_password_new_input");
	this._passwordConfirmInput = Dwt.getElement(id + "_password_confirm_input");
	this._requestCodeDescription = Dwt.getElement(id + "_request_code_description");
	Dwt.setHandler(this._accountInput, DwtEvent.ONKEYUP, accountKeyupHandler);
	Dwt.setHandler(this._accountInput, DwtEvent.ONINPUT, accountKeyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONKEYUP, codeKeyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONINPUT, codeKeyupHandler);
	Dwt.setHandler(this._passwordNewInput, DwtEvent.ONKEYUP, resetKeyupHandler);
	Dwt.setHandler(this._passwordNewInput, DwtEvent.ONINPUT, resetKeyupHandler);
	Dwt.setHandler(this._passwordConfirmInput, DwtEvent.ONKEYUP, resetKeyupHandler);
	Dwt.setHandler(this._passwordConfirmInput, DwtEvent.ONINPUT, resetKeyupHandler);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, false);
};

/**
** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
*
* @return An array of the input fields to be reset
*/
ZmPasswordRecoveryDialog.prototype._getInputFields = function() {
	return [this._accountInput, this._codeInput, this._passwordNewInput, this._passwordConfirmInput];
};

/**
 * Pops-up the dialog.
 */
ZmPasswordRecoveryDialog.prototype.popup = function() {
	this.reset();
	DwtDialog.prototype.popup.call(this);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, false);
	this._accountInput.value = this.accountInput;
	this._accountInput.focus();
};

/**
 * Determines whether to prevent the browser from displaying its context menu.
 */
ZmPasswordRecoveryDialog.prototype.preventContextMenu = function() {
	return false;
};

/**
 * Resets the dialog back to its original state.
 */
ZmPasswordRecoveryDialog.prototype.reset = function() {
	Dwt.show(this._getRecoveryAccountDivId);
	Dwt.hide(this._requestCodeDivId);
	Dwt.hide(this._validateCodeErrorDivId);
	Dwt.hide(this._validateCodeDivId);
	Dwt.hide(this._codeSuccessDivId);
	Dwt.hide(this._resetPasswordDivId);
	Dwt.hide(this._resetPasswordErrorDivId);
	Dwt.hide(this._passwordResetSuccessDivId);
	this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
	this._divIdArrayIndex = 0;
	DwtDialog.prototype.reset.call(this);
};

ZmPasswordRecoveryDialog.prototype._emailSubmitButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	var account = this._accountInput.value;
	this._verifyEmail(currentDivId);
};

ZmPasswordRecoveryDialog.prototype._requestCodeButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	this._sendRecoveryCode(currentDivId);
};

ZmPasswordRecoveryDialog.prototype._verifyCodeButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	this._verifyRecoveryCode(currentDivId);
};

ZmPasswordRecoveryDialog.prototype._resendOptionButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
};

ZmPasswordRecoveryDialog.prototype._resetSubmitButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
};

ZmPasswordRecoveryDialog.prototype._finishButtonListener = function() {
	// If the user clicks finish button, redirect to the login page
	location.replace(location.origin);
};

ZmPasswordRecoveryDialog.prototype._resetButtonListener = function() {
	// call reset handler method
};

ZmPasswordRecoveryDialog.prototype._cancelButtonListener = function() {
	//If the user clicks cancel button, redirect to the login page
	location.replace(location.origin);
};

ZmPasswordRecoveryDialog.prototype._accountHandleKeyUp = function(ev) {
	var firstInputPattern = new RegExp("_account_input");
	var targetIsAccountInput = firstInputPattern.test(ev.target.id); // {id}_account_input 
	var value = ev && ev.target && ev.target.value && ev.target.value.length; // value: length, ev.target.value: input value
	if (targetIsAccountInput) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, !!value);
	}
};

ZmPasswordRecoveryDialog.prototype._codeHandleKeyUp = function(ev) {
	var firstInputPattern = new RegExp("_code_input");
	var targetIsAccountInput = firstInputPattern.test(ev.target.id); // {id}_account_input 
	var value = ev && ev.target && ev.target.value && ev.target.value.length; // value: length, ev.target.value: input value
	if (targetIsAccountInput) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, !!value);
	}
};

ZmPasswordRecoveryDialog.prototype._resetHandleKeyUp = function(ev) {
	var firstInputPattern = new RegExp("_password_new_input");
	var targetIsNewPasswordInput = firstInputPattern.test(ev.target.id);
	var value = ev && ev.target && ev.target.value && ev.target.value.length;
	var altValue;
	if(targetIsNewPasswordInput){
		altValue = this._passwordConfirmInput.value;
	} else {
		altValue = this._passwordNewInput.value;
	}
	this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, !!value && (altValue === ev.target.value));
};

ZmPasswordRecoveryDialog.prototype._codeInputCheck = function() {
	var codeInput = this._codeInput.value;
	this.setButtonEnabled(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, !!codeInput);
};

ZmPasswordRecoveryDialog.prototype._passwordResetCheck = function() {
	var newValue = this._passwordNewInput.value;
	var altValue = this._passwordConfirmInput.value;
	this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, newValue && altValue && newValue === altValue);
};

/**
 * Sends first EnableTwoFactorAuthRequest with username and password
 * Sends second EnableTwoFactorAuthRequest with username, temporary authToken and twoFactorCode
*/
ZmPasswordRecoveryDialog.prototype._verifyEmail =
function(currentDivId) {
	var command = new ZmCsfeCommand(),
		soapDoc = AjxSoapDoc.create("RecoverAccountRequest", "urn:zimbraMail"),
		respCallback = this._verifyEmailCallback.bind(this, currentDivId);
	soapDoc.setMethodAttribute("op", "getRecoveryAccount");
	soapDoc.setMethodAttribute("email", this._accountInput.value);
	soapDoc.setMethodAttribute("channel", "email");
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:"/service/soap/"});
};

ZmPasswordRecoveryDialog.prototype._verifyEmailCallback =
function(currentDivId, result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._accountErrorDiv, result.getException());
	}
	else {
		var response = result.getResponse();
		if (!response || !response.Body || !response.Body.RecoverAccountResponse) {
			this._handleResetPasswordError(this._accountErrorDiv);
			return;
		}

		Dwt.setInnerHtml(this._accountErrorDiv, "");
		Dwt.hide(this._accountErrorDiv);
		recoveryAccountAddress = response.Body.RecoverAccountResponse.recoveryAccount;
		recoveryCodeRequestDescription = AjxMessageFormat.format(ZmMsg.passwordRecoveryCodeRequestDescription, [ZmMsg.passwordRecoveryTypeEmail, recoveryAccountAddress]);
		Dwt.setInnerHtml(this._requestCodeDescription, recoveryCodeRequestDescription);
		Dwt.hide(this._getRecoveryAccountDivId);
		Dwt.show(this._requestCodeDivId);
		this.setButtonVisible(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, true);
		this._divIdArrayIndex = 1;
	}
};

ZmPasswordRecoveryDialog.prototype._handleResetPasswordError =
function(errorDivId, exception) {
	var errorCode = exception ? exception.code : 'unknownError';
	Dwt.setInnerHtml(errorDivId, ZmMsg[errorCode]);
	Dwt.show(errorDivId);
}

ZmPasswordRecoveryDialog.prototype._sendRecoveryCode =
function(currentDivId) {
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create("RecoverAccountRequest", "urn:zimbraMail");
	var respCallback = this._sendRecoveryCodeCallback.bind(this, currentDivId);
	soapDoc.setMethodAttribute("op", "sendRecoveryCode");
	soapDoc.setMethodAttribute("email", this._accountInput.value);
	soapDoc.setMethodAttribute("channel", "email");
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:"/service/soap/"})
};

ZmPasswordRecoveryDialog.prototype._sendRecoveryCodeCallback =
function(currentDivId, result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._requestErrorDiv, result.getException());
	} else {
		Dwt.hide(this._requestCodeDivId);
		Dwt.show(this._validateCodeDivId);
		this._codeInputCheck();
		this._codeInput.focus();
		this.setButtonVisible(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, true);
// TODO: uncomment below and connect
//		this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, true);
	}
};

ZmPasswordRecoveryDialog.prototype._verifyRecoveryCode =
function(currentDivId) {
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create("AuthRequest", "urn:zimbraAccount");
	var respCallback = this._verifyRecoveryCodeCallback.bind(this, currentDivId);
	var elBy, recoveryCode;
	soapDoc.setMethodAttribute("csrfTokenSecured", 1);
	elBy = soapDoc.set("account", this._accountInput.value);
	elBy.setAttribute("by", "name");
	recoveryCode = soapDoc.set("recoveryCode", this._codeInput.value);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:"/service/soap/"})
};

ZmPasswordRecoveryDialog.prototype._verifyRecoveryCodeCallback =
function(currentDivId, result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._validateErrorDiv, result.getException());
	} else {
		var response = result.getResponse();
		Dwt.hide(this._validateCodeDivId);
		Dwt.show(this._codeSuccessDivId);
		this.continueSessionsRecoveryButton.setVisible(true);
		this.resetPasswordRecoveryButton.setVisible(false); // set to true once methods are ready.
		this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
	}
};



