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
ZmPasswordRecoveryDialog =
function(params) {
	this.accountInput = params.accountInput || '';

	var emailSubmitButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON,
								ZmMsg.passwordRecoveryButtonSubmit,
								DwtDialog.ALIGN_LEFT,
								this._emailSubmitButtonListener.bind(this));

	var requestCodeButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON,
								ZmMsg.recoveryEmailButtonRequest,
								DwtDialog.ALIGN_LEFT,
								this._requestCodeButtonListener.bind(this));

	var verifyCodeButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON,
								ZmMsg.recoveryEmailButtonValidate,
								DwtDialog.ALIGN_LEFT,
								this._verifyCodeButtonListener.bind(this));

	var resendOptionButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON,
								ZmMsg.recoveryEmailButtonResend,
								DwtDialog.ALIGN_LEFT,
								this._resendOptionButtonListener.bind(this));

	var resetSubmitButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON,
								ZmMsg.passwordRecoveryButtonSubmit,
								DwtDialog.ALIGN_LEFT,
								this._resetSubmitButtonListener.bind(this));

	var cancelButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.CANCEL_BUTTON,
								ZmMsg.passwordRecoveryButtonCancel,
								DwtDialog.ALIGN_LEFT,
								this._cancelButtonListener.bind(this));

	var loginButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.LOGIN_BUTTON,
								ZmMsg.passwordRecoveryButtonCancel,
								DwtDialog.ALIGN_LEFT,
								this._finishButtonListener.bind(this));

	var twoFactorVerifyButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON,
								ZmMsg.recoveryEmailButtonValidate,
								DwtDialog.ALIGN_LEFT,
								this._twoFactorCodeButtonVerifyListener.bind(this));

	var shell = typeof appCtxt !== 'undefined' ? appCtxt.getShell() : new DwtShell({});
	var newParams = {
		parent : shell,
		title : ZmMsg.passwordRecoveryTitle,
		standardButtons : [DwtDialog.NO_BUTTONS],
		extraButtons : [ emailSubmitButton, requestCodeButton, verifyCodeButton, resendOptionButton, resetSubmitButton, loginButton, cancelButton, twoFactorVerifyButton ]
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
ZmPasswordRecoveryDialog.LOGIN_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON = ++DwtDialog.LAST_BUTTON;

/**
 * Returns the strng name of this class.
 *
 * @return class name
 */
ZmPasswordRecoveryDialog.prototype.toString =
function() {
	return 'ZmPasswordRecoveryDialog';
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 *
 */
ZmPasswordRecoveryDialog.prototype._contentHtml =
function() {
	var id = this._htmlElId;
	this._getRecoveryAccountDivId = id + '_get_recovery_account';
	this._requestCodeDivId = id + '_request_code';
	this._validateCodeDivId = id + '_validate_code';
	this._codeSuccessDivId = id + '_code_success';
	this._resetPasswordDivId = id + '_reset_password';
	this._resetPasswordDescriptionDivId = id + '_reset_password_description';
	this._passwordResetSuccessDivId = id + '_password_reset_success';
	this._twoFactorCodeDivId = id + '_two_factor_code';
	this._divIdArray = [this._getRecoveryAccountDivId, this._requestCodeDivId, this._validateCodeDivId, this._codeSuccessDivId, this._resetPasswordDivId, this._passwordResetSuccessDivId, this._twoFactorCodeDivId];
	return AjxTemplate.expand('share.Dialogs#ZmPasswordRecovery', {id : id, accountInput : this.accountInput});
};

/**
 * Create DWT buttons that are not part of the main dialog button flow.
 * These buttons are to be used in the body of the dialog view.
 *
 * @param {string}  ide         The name of the id for this button element.
 * @param {string}  text        The text that shows on the button.
 * @param {boolean} enabled     Boolean to enable / disable the button.
 * @param {boolean} visible     Boolean to show / hide the button.
 * @param {string}  divSuffix   The id from the template to grab.
 * @param {string}  listener    The onclick method.
 */
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

/**
 * Identify Elements from the template that require manipulation in the UI.
 *
 */
ZmPasswordRecoveryDialog.prototype._createControls =
function() {
	var id = this._htmlElId;
	var cancelbutton = this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON);
	var accountKeyupHandler = this._accountHandleKeyUp.bind(this);
	var codeKeyupHandler = this._codeHandleKeyUp.bind(this);
	this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryCancelButton');
	this.getButton(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoverySubmitButton');
	this.getButton(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryRequestButton');
	this.getButton(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryResendButton');
	this.getButton(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryVerifyButton');
	this.getButton(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryResetButton');
	this.getButton(ZmPasswordRecoveryDialog.LOGIN_BUTTON).setClassName('ZmPasswordRecoveryButton PasswordRecoveryLoginButton');
	this.getButton(ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON).setClassName('ZmPasswordRecoveryButton');
	cancelbutton.setClassName('ZmPasswordRecoveryButton PasswordRecoveryBackToSignInButton');
	// Create buttons
	this._createRecoveryButtons('continueSessionsRecoveryButton', ZmMsg.recoveryEmailButtonContinueSession, true, false,
					'_CONTINUE_BUTTON', '_finishButtonListener');
	this._createRecoveryButtons('resetPasswordRecoveryButton', ZmMsg.recoveryEmailButtonResetPassword, true, false,
					'_RESET_PASSWORD', '_resetButtonListener');
	this._accountInput = Dwt.getElement(id + '_account_input');
	this._accountErrorDiv = Dwt.getElement(id + '_account_input_error');
	this._accountErrorMessageDiv = Dwt.getElement(id + '_account_input_error_message');
	this._accountErrorDivMsg = Dwt.getElement(id + '_account_input_error_message');
	this._requestErrorDiv = Dwt.getElement(id + '_request_code_error');
	this._requestErrorMessageDiv = Dwt.getElement(id + '_request_code_error_message');
	this._validateCodeDescription = Dwt.getElement(id + '_validate_code_description');
	this._validateErrorDiv = Dwt.getElement(id + '_validate_code_error');
	this._validateErrorMessageDiv = Dwt.getElement(id + '_validate_code_error_message');
	this._validateInputDiv = Dwt.getElement(id + '_validate_input');
	this._resetPasswordErrorDiv = Dwt.getElement(id + '_reset_password_error');
	this._resetPasswordErrorMessageDiv = Dwt.getElement(id + '_reset_password_error_message');
	this._codeInput = Dwt.getElement(id + '_code_input');
	this._passwordNewInput = Dwt.getElement(id + '_password_new_input');
	this._twoFactorCodeInput = Dwt.getElement(id + '_two_factor_code_input');
	this._trustedDeviceInput = Dwt.getElement(id + '_trust_device_input');
	this._trustedDeviceDiv = Dwt.getElement(id + '_trust_device_section');
	this._validateTwoFactorErrorDiv = Dwt.getElement(id + '_validate_two_factor_code_error');
	this._validateTwoFactorErrorMessageDiv = Dwt.getElement(id + '_validate_two_factor_code_error_message');

	this._passwordRuleList = Dwt.getElement(id + '_password_rule_list');
	this._passwordAllowedCharsLI = Dwt.getElement(id + '_allowed_char');
	this._passwordAllowedCharsLabel = Dwt.getElement(id + '_allowed_char_label');
	this._passwordMinLengthRule = Dwt.getElement(id + '_min_length');
	this._passwordMinLengthLabel = Dwt.getElement(id + '_min_length_label');
	this._passwordMinUpperCaseCharsRule = Dwt.getElement(id + '_min_upper_case_chars');
	this._passwordMinUpperCaseCharsLabel = Dwt.getElement(id + '_min_upper_case_chars_label');
	this._passwordMinLowerCaseCharsRule = Dwt.getElement(id + '_min_lower_case_chars');
	this._passwordMinLowerCaseCharsLabel = Dwt.getElement(id + '_min_lower_case_chars_label');
	this._passwordMinPunctuationCharsRule = Dwt.getElement(id + '_min_punctuation_chars');
	this._passwordMinPunctuationCharsLabel = Dwt.getElement(id + '_min_punctuation_chars_label');
	this._passwordMinNumericCharsRule = Dwt.getElement(id + '_min_numeric_chars');
	this._passwordMinNumericCharsLabel = Dwt.getElement(id + '_min_numeric_chars_label');
	this._passwordMinDigitsOrPunctuationRule = Dwt.getElement(id + '_min_digits_or_punctuations');
	this._passwordMinDigitsOrPunctuationLabel = Dwt.getElement(id + '_min_digits_or_punctuations_label');

	this._passwordConfirmInput = Dwt.getElement(id + '_password_confirm_input');
	this._requestCodeDescription = Dwt.getElement(id + '_request_code_description');
	Dwt.setHandler(this._accountInput, DwtEvent.ONKEYUP, accountKeyupHandler);
	Dwt.setHandler(this._accountInput, DwtEvent.ONINPUT, accountKeyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONKEYUP, codeKeyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONINPUT, codeKeyupHandler);
};

/**
** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
*
* @return An array of the input fields to be reset
*/
ZmPasswordRecoveryDialog.prototype._getInputFields =
function() {
	return [this._accountInput, this._codeInput, this._passwordNewInput, this._passwordConfirmInput, this._twoFactorCodeInput];
};

/**
 * Pops-up the dialog.
 */
ZmPasswordRecoveryDialog.prototype.popup =
function() {
	this.reset();
	DwtDialog.prototype.popup.call(this);
	this._accountInput.value = this.accountInput;
	this._suspend = false;
	this._accountInput.focus();
	this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, false);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
	if(this._accountInput.value.length > 0) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, true);
	}
};

/**
 * Determines whether to prevent the browser from displaying its context menu.
 */
ZmPasswordRecoveryDialog.prototype.preventContextMenu =
function() {
	return false;
};

/**
 * Resets the dialog back to its original state.
 */
ZmPasswordRecoveryDialog.prototype.reset =
function() {
	Dwt.show(this._getRecoveryAccountDivId);
	Dwt.hide(this._requestCodeDivId);
	Dwt.hide(this._validateCodeErrorDivId);
	Dwt.hide(this._validateCodeDivId);
	Dwt.hide(this._codeSuccessDivId);
	Dwt.hide(this._resetPasswordDivId);
	Dwt.hide(this._resetPasswordErrorDivId);
	Dwt.hide(this._passwordResetSuccessDivId);
	Dwt.hide(this._twoFactorCodeDivId);
	this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.LOGIN_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON, false);
	this._divIdArrayIndex = 0;
	this._resendCount = 0;
	DwtDialog.prototype.reset.call(this);
};

/**
 * Listener for Email Submit Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._emailSubmitButtonListener =
function() {
	this._verifyEmail();
};

/**
 * Listener for Request Code Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._requestCodeButtonListener =
function() {
	// hide button after click to help with  uncaught exception edge case
	this.setButtonEnabled(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, false);
	this._sendRecoveryCode();
};

/**
 * Listener for Verify Code Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._verifyCodeButtonListener =
function() {
	this._verifyRecoveryCode();
};

/**
 * Listener for Resend Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._resendOptionButtonListener =
function() {
	this._resendCount++; // Used to determine correct messaging on Verify Code view.
	this._sendRecoveryCode();
};

/**
 * Listener for Reset Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._resetButtonListener =
function() {
	this._setResetPasswordDialog();
};

/**
 * Listener for Reset Submit Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._resetSubmitButtonListener =
function() {
	this._resetPassword();
};

/**
 * Listener for Back to Login Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._finishButtonListener =
function() {
	// If the user clicks finish button, redirect to the login page
	location.replace(location.origin + '?loginOp=relogin');
};

/**
 * Listener for Email Cancel Button.
 *
 */
ZmPasswordRecoveryDialog.prototype._cancelButtonListener =
function() {
	//If the user clicks cancel button, redirect to the login page
	location.replace(location.origin);
};

ZmPasswordRecoveryDialog.prototype._twoFactorCodeButtonVerifyListener =
function() {
	this._validateTwoFactorCode();
};

/**
 * Listener for Keyup event account input filed.
 *
 * @param {object} ev The event object
 */
ZmPasswordRecoveryDialog.prototype._accountHandleKeyUp =
function(ev) {
	var firstInputPattern = new RegExp('_account_input');
	var targetIsAccountInput = firstInputPattern.test(ev.target.id); // {id}_account_input
	var value = ev && ev.target && ev.target.value && ev.target.value.length; // value: length, ev.target.value: input value
	if (targetIsAccountInput) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.EMAIL_SUBMIT_BUTTON, !!value);
	}
};

/**
 * Listener for Keyup event code input filed.
 *
 * @param {object} ev The event object
 */
ZmPasswordRecoveryDialog.prototype._codeHandleKeyUp =
function(ev) {
	var firstInputPattern = new RegExp('_code_input');
	var targetIsAccountInput = firstInputPattern.test(ev.target.id); // {id}_account_input
	var value = ev && ev.target && ev.target.value && ev.target.value.length; // value: length, ev.target.value: input value
	var validValue = value && ev.target.value.length >= 8;
	if (targetIsAccountInput) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, !!validValue);
	}
};

/**
 * Prepare and send 'RecvoverAccountRequest' for the user's account call.
 *
 */
ZmPasswordRecoveryDialog.prototype._verifyEmail =
function() {
	var command = new ZmCsfeCommand(),
		soapDoc = AjxSoapDoc.create('RecoverAccountRequest', 'urn:zimbraMail'),
		respCallback = this._verifyEmailCallback.bind(this);
	soapDoc.setMethodAttribute('op', 'getRecoveryAccount');
	soapDoc.setMethodAttribute('email', this._accountInput.value);
	soapDoc.setMethodAttribute('channel', 'email');
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:'/service/soap/'});
};

/**
 * Callback for retrieving validation of the user's account.
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._verifyEmailCallback =
function(result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._accountErrorDiv, this._accountErrorMessageDiv, result.getException());
	}
	else {
		var response = result.getResponse();
		if (!response || !response.Body || !response.Body.RecoverAccountResponse) {
			this._handleResetPasswordError(this._accountErrorDiv, this._accountErrorMessageDiv);
			return;
		}

		Dwt.setInnerHtml(this._accountErrorDiv, '');
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

/**
 * Recovery Error callback method.
 *
 * Response object will have a code and msg value to work with.
 * Determine message to display and update the error message div.
 *
 * @param {string} errorDivId The error html id name
 * @param {string} errorMessageDivId The element to add error message to
 * @param {object} exception The error object to translate the code from
 */
ZmPasswordRecoveryDialog.prototype._handleResetPasswordError =
function(errorDivId, errorMessageDivId, exception) {
	var errorCode = exception ? exception.code : 'unknownError';
	var errorMessage = exception && exception.msg ? exception.msg.toLowerCase() : 'Unknown error.';
	var emailMatch = new RegExp('email');
	var usernameMatch = new RegExp('username');
	var passwordMatch = new RegExp('password');
	if (errorCode === 'service.INVALID_REQUEST' && (usernameMatch.test(errorMessage) || emailMatch.test(errorMessage))) {
		Dwt.setInnerHtml(errorMessageDivId, ZmMsg['service.INVALID_REQUEST_USERNAME']);
	} else if (errorCode === 'service.INVALID_REQUEST' && passwordMatch.test(errorMessage)) {
		Dwt.setInnerHtml(errorMessageDivId, ZmMsg['service.INVALID_REQUEST_PASSWORD']);
	} else if (errorCode === 'service.MAX_ATTEMPTS_REACHED') {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
		Dwt.setInnerHtml(errorMessageDivId, ZmMsg[errorCode]);
	} else if (errorCode === 'service.FEATURE_RESET_PASSWORD_SUSPENDED' || errorCode === 'service.FEATURE_RESET_PASSWORD_DISABLED') {
		Dwt.hide(this._validateCodeDescription);
		Dwt.hide(this._validateInputDiv);
		Dwt.setInnerHtml(errorMessageDivId, ZmMsg['service.CONTACT_ADMIN']);
	} else if(errorCode === 'account.TWO_FACTOR_AUTH_FAILED')  {
		Dwt.setInnerHtml(errorMessageDivId, ZMsg['account.TWO_FACTOR_AUTH_FAILED']);	
	}else {
		Dwt.setInnerHtml(errorMessageDivId, ZmMsg[errorCode]);
	}
	Dwt.show(errorDivId);
}

/**
 * Prepare and send for a recovery code.
 *
 */
ZmPasswordRecoveryDialog.prototype._sendRecoveryCode =
function() {
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create('RecoverAccountRequest', 'urn:zimbraMail');
	var respCallback = this._sendRecoveryCodeCallback.bind(this);
	var errorResult = {};
	Dwt.hide(this._validateErrorDiv);
	soapDoc.setMethodAttribute('op', 'sendRecoveryCode');
	soapDoc.setMethodAttribute('email', this._accountInput.value);
	soapDoc.setMethodAttribute('channel', 'email');
	// Set an error but continue with invoke in order to force suspension since user clicked resend again.
	// This is a patch for a uncaught exception  edge case if user refresehd and re-attempted request.
	if (this._suspend) {
		errorResult.code = 'service.FEATURE_RESET_PASSWORD_SUSPENDED';
		this._handleResetPasswordError(this._validateErrorDiv, this._validateErrorMessageDiv, errorResult);
	}
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:'/service/soap/'});
};

/**
 * Callback for vaildation that a recovery code was sent.
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._sendRecoveryCodeCallback =
function(result) {
	var response = result && result.getResponse() ? result.getResponse() : false;
	var sentLabel = this._resendCount > 0 ? ZmMsg.recoveryEmailResentLabel : ZmMsg.recoveryEmailSentLabel;
	var attempts, expiry, attemptsMessage, expiryMessage, requestMessage, resendMessage;
	var durationTypePos, durationTypeChar, durationArray, durationTime, durationType, durationMessage, plural;
	var expiryDefault = '10m';
	this.setButtonVisible(ZmPasswordRecoveryDialog.REQUEST_CODE_BUTTON, false);
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._validateErrorDiv, this._validateErrorMessageDiv, result.getException());
		return;
	}
	if (response.Body && response.Body.RecoverAccountResponse) {
		attempts = response.Body.RecoverAccountResponse.recoveryAttemptsLeft ? response.Body.RecoverAccountResponse.recoveryAttemptsLeft : 0;
		attemptsMessage = attempts > 0 ? AjxMessageFormat.format(ZmMsg.recoveryEmailMessageAttempts, [attempts]) : '';
		resendMessage = attempts > 0 ? AjxMessageFormat.format(ZmMsg.recoveryEmailMessageResend) : '';
		expiry = response.Body.RecoverAccountResponse.recoveryCodeExpiry ? response.Body.RecoverAccountResponse.recoveryCodeExpiry.toLowerCase() : expiryDefault;
		if(expiry) {
			durationTypePos = expiry.search(/[a-zA-Z]/);
			durationTypeChar = expiry.charAt(durationTypePos);
			durationArray = expiry.split(durationTypeChar);
			durationTime = durationArray[0];
			plural = durationTime > 1 ? "s" : "";
			if (durationTypePos !== -1 && durationTime !== "") {
				switch(durationTypeChar) {
					case "d":
						durationType = "day" + plural;
					break;
					case "m":
						durationType = "minute" + plural;
					break;
					default:
						durationType = "";
					break;
				}
				if (durationType && durationTime) {
					durationMessage = durationTime + " " + ZmMsg[durationType].toLowerCase();
				}
			} else {
				durationMessage = false;
			}
		}
		expiryMessage = durationMessage ? AjxMessageFormat.format(ZmMsg.recoveryEmailMessageDuration, [durationMessage]) : "";
		requestMessage = AjxMessageFormat.format(ZmMsg.recoveryEmailMessageSent, [sentLabel, expiryMessage, attemptsMessage, resendMessage]);
		Dwt.setInnerHtml(this._validateCodeDescription, requestMessage);
		Dwt.hide(this._requestCodeDivId);
		Dwt.show(this._validateCodeDescription);
		Dwt.show(this._validateInputDiv);
		Dwt.show(this._validateCodeDivId);
		this._codeInput.focus();
		this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, true);
		this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, true);
		if (attempts === 0) {
			result.code = 'service.MAX_ATTEMPTS_REACHED';
			this._suspend = true;
			this._handleResetPasswordError(this._validateErrorDiv, this._validateErrorMessageDiv, result);
		}
	} else {
		// account for unknown response error
		Dwt.hide(this._validateCodeDescription);
		Dwt.hide(this._validateInputDiv);
		this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
		this._handleResetPasswordError(this._validateErrorDiv, this._validateErrorMessageDiv);
	}
};

/**
 * Prepare and send call to cross reference the user's code inpout.
 *
 */
ZmPasswordRecoveryDialog.prototype._verifyRecoveryCode =
function() {
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create('AuthRequest', 'urn:zimbraAccount');
	var respCallback = this._verifyRecoveryCodeCallback.bind(this);
	var elBy, recoveryCode;
	soapDoc.setMethodAttribute('csrfTokenSecured', 1);
	elBy = soapDoc.set('account', this._accountInput.value);
	elBy.setAttribute('by', 'name');
	recoveryCode = soapDoc.set('recoveryCode', this._codeInput.value);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:'/service/soap/'})
};

/**
 * Callback for retrieving validation of the recovery code
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._verifyRecoveryCodeCallback =
function(result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._validateErrorDiv, this._validateErrorMessageDiv, result.getException());
	} else {
		var response = result.getResponse();
		if(response.Body.AuthResponse.csrfToken) {
			window.csrfToken = response.Body.AuthResponse.csrfToken._content;
		}
		Dwt.hide(this._validateCodeDivId);
		if(response.Body.AuthResponse.twoFactorAuthRequired && response.Body.AuthResponse.twoFactorAuthRequired._content) {
			Dwt.show(this._twoFactorCodeDivId);
			this.setButtonVisible(ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON, true);
			this._twoFactorCodeInput.focus();
			this._twoFactorAuthToken = response.Body.AuthResponse.authToken[0]._content;
			if(!response.Body.AuthResponse.trustedDevicesEnabled._content) {
				Dwt.hide(this._trustedDeviceDiv);
			}
		} else {
			Dwt.show(this._codeSuccessDivId);
			this.continueSessionsRecoveryButton.setVisible(true);
			this.resetPasswordRecoveryButton.setVisible(true); // set to true once methods are ready.
		}
		
		this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
	}
};

/**
 * Callback for retrieving validation of the two factor code
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._verifyTwoFactorCodeAuthCallback =
function(result) {
	if (!result || result.isException()) {
		this._handleResetPasswordError(this._validateTwoFactorErrorDiv, this._validateTwoFactorErrorMessageDiv, result.getException());
	} else {
		Dwt.hide(this._twoFactorCodeDivId);
		this.setButtonVisible(ZmPasswordRecoveryDialog.TWO_FACTOR_VERIFY_BUTTON, false);
		this._verifyRecoveryCodeCallback(result);
	}
}


/**
 * Update the view to support reset password.
 *
 */
ZmPasswordRecoveryDialog.prototype._setResetPasswordDialog =
function() {
	var soapDoc = AjxSoapDoc.create("GetInfoRequest", "urn:zimbraAccount");
	var command = new ZmCsfeCommand();
	var callback = new AjxCallback(this, this._handleGetAccountInfo, []);
	
	command.invoke({soapDoc: soapDoc, noAuthToken:true, noSession: true, asyncMode: true, callback: callback, serverUri:'/service/soap/'});
};

// Function to check special character
function isAsciiPunc(ch) {
	return (ch >= 33 && ch <= 47) || // ! " # $ % & ' ( ) * + , - . /
	(ch >= 58 && ch <= 64) || // : ; < = > ? @
	(ch >= 91 && ch <= 96) || // [ \ ] ^ _ `
	(ch >= 123 && ch <= 126); // { | } ~
}

function parseCharsFromPassword(passwordString, zimbraPasswordAllowedChars, zimbraPasswordAllowedPunctuationChars) {
	var uppers = [],
		lowers = [],
		numbers = [],
		punctuations = [],
		invalidChars = [];

	var characters = passwordString.split('') || [];
	var isInvalid = false;

	for(var i=0; i<characters.length;i++){
		var character = characters[i];
		var charCode = character.charCodeAt(0);

		if (zimbraPasswordAllowedChars) {
			try {
				if (!character.match(new RegExp(zimbraPasswordAllowedChars, 'g'))) {
					invalidChars.push(character);
					isInvalid = true;
				}
			} catch (error) {
				console.log(error);
			}
		}

		if (!isInvalid) {
			if (charCode >= 65 && charCode <= 90) {
				uppers.push(character);
			} else if (charCode >= 97 && charCode <= 122) {
				lowers.push(character);
			} else if (charCode >= 48 && charCode <= 57) {
				numbers.push(character);
			} else if (zimbraPasswordAllowedPunctuationChars) {
				try {
					if (character.match(new RegExp(zimbraPasswordAllowedPunctuationChars, 'g'))) {
						punctuations.push(character);
					} else {
						invalidChars.push(character);
					}
				} catch (error) {
					console.log(error);
				}
			} else if (isAsciiPunc(charCode)) {
				punctuations.push(character);
			}
		}
	}

	return {
		uppers: uppers,
		lowers: lowers,
		numbers: numbers,
		punctuations: punctuations,
		invalidChars: invalidChars
	};
};

function showPassword(passElem, showSpanElem, hideSpanElem) {
	if (passElem.type === "password") {
		passElem.type = "text";
		showSpanElem.style.display = "none";
		hideSpanElem.style.display = "block";
	} else {
		passElem.type = "password";
		showSpanElem.style.display = "block";
		hideSpanElem.style.display = "none";
	}
}

function showNewPassword() {
	showPassword(this._passwordNewInput, newPasswordShowSpan, newPasswordHideSpan);
}

function showConfirmPassword() {
	showPassword(this._passwordConfirmInput, confirmShowSpan, confirmHideSpan);
}

function check(checkImg, closeImg) {
	closeImg.style.display = "none";
	checkImg.style.display = "inline";
}

function unCheck(checkImg, closeImg) {
	closeImg.style.display = "inline";
	checkImg.style.display = "none";
}

function resetImg(condition, checkImg, closeImg){
	condition ? check(checkImg, closeImg) : unCheck(checkImg, closeImg);
}


function handleErrorMessageDiv(condition, errorMessage, msgDiv, errorDiv) {
	if (condition) {
		msgDiv.style.display = "block";
		msgDiv.innerHTML = errorMessage;
		Dwt.show(errorDiv);
	} else {
		msgDiv.style.display = "none";
		Dwt.hide(errorDiv);
	}
}

ZmPasswordRecoveryDialog.prototype._handleGetAccountInfo = 
function (result) {

	var response = result.getResponse();
	var getInfoResponse = response.Body.GetInfoResponse
	var attributes = getInfoResponse.attrs._attrs;

	var zimbraPasswordMinLength = parseInt(attributes.zimbraPasswordMinLength);
	var zimbraPasswordMinUpperCaseChars = parseInt(attributes.zimbraPasswordMinUpperCaseChars);
	var zimbraPasswordMinLowerCaseChars = parseInt(attributes.zimbraPasswordMinLowerCaseChars);
	var zimbraPasswordMinPunctuationChars = parseInt(attributes.zimbraPasswordMinPunctuationChars);
	var zimbraPasswordMinNumericChars = parseInt(attributes.zimbraPasswordMinNumericChars);
	var zimbraPasswordMinDigitsOrPuncs = parseInt(attributes.zimbraPasswordMinDigitsOrPuncs);

	var zimbraPasswordAllowedChars = attributes.zimbraPasswordAllowedChars || false;
	var zimbraPasswordAllowedPunctuationChars = attributes.zimbraPasswordAllowedPunctuationChars || false;

	var enabledLocalRules = [];
	var matchedLocalRules = [];
	
	var supportedRules = [
		{
			type : "zimbraPasswordMinLength",
			checkImg : Dwt.getElement("minLengthCheckImg"),
			closeImg : Dwt.getElement("minLengthCloseImg")
		},
		{
			type : "zimbraPasswordMinUpperCaseChars",
			checkImg : Dwt.getElement("minUpperCaseCheckImg"),
			closeImg : Dwt.getElement("minUpperCaseCloseImg")
		},
		{
			type : "zimbraPasswordMinLowerCaseChars",
			checkImg : Dwt.getElement("minLowerCaseCheckImg"),
			closeImg : Dwt.getElement("minLowerCaseCloseImg")
		},
		{
			type : "zimbraPasswordMinNumericChars",
			checkImg : Dwt.getElement("minNumericCharsCheckImg"),
			closeImg : Dwt.getElement("minNumericCharsCloseImg")
		},
		{
			type : "zimbraPasswordMinPunctuationChars",
			checkImg : Dwt.getElement("minPunctuationCharsCheckImg"),
			closeImg : Dwt.getElement("minPunctuationCharsCloseImg")
		},
		{
			type : "zimbraPasswordMinDigitsOrPuncs",
			checkImg : Dwt.getElement("minDigitsOrPuncsCheckImg"),
			closeImg : Dwt.getElement("minDigitsOrPuncsCloseImg")
		},
		{
			type : "zimbraPasswordEnforceHistory",
			checkImg : Dwt.getElement("enforceHistoryCheckImg"),
			closeImg : Dwt.getElement("enforceHistoryCloseImg")
		},
		{
			type : "zimbraPasswordBlockCommonEnabled",
			checkImg : Dwt.getElement("blockCommonCheckImg"),
			closeImg : Dwt.getElement("blockCommonCloseImg")
		}
	];

	Dwt.hide(this._passwordMinLengthRule);
	Dwt.hide(this._passwordMinUpperCaseCharsRule);
	Dwt.hide(this._passwordMinLowerCaseCharsRule);
	Dwt.hide(this._passwordMinPunctuationCharsRule);
	Dwt.hide(this._passwordMinNumericCharsRule);
	Dwt.hide(this._passwordMinDigitsOrPunctuationRule);
	
	function findRule(ruleType) {
		if (!Array.prototype.find) {
			var matchingRule;
			supportedRules.forEach(function(rule){ if(rule.type === ruleType) 
				{ matchingRule = rule; } 
			});
			return matchingRule;
		} else {
			return supportedRules.find(function(rule){ return rule.type === ruleType });
		}
	}
	
	if (zimbraPasswordMinLength){
		var minLengthMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinLength, [zimbraPasswordMinLength.toString()]);
		
		enabledLocalRules.push(findRule("zimbraPasswordMinLength"));
		Dwt.setInnerHtml(this._passwordMinLengthLabel, minLengthMsg);
		Dwt.show(this._passwordMinLengthRule);
	}

	if (zimbraPasswordMinUpperCaseChars) {
		var minUpperCaseCharsMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinUpperCaseChars, [zimbraPasswordMinUpperCaseChars.toString()]);

		enabledLocalRules.push(findRule("zimbraPasswordMinUpperCaseChars"));
		Dwt.setInnerHtml(this._passwordMinUpperCaseCharsLabel, minUpperCaseCharsMsg);
		Dwt.show(this._passwordMinUpperCaseCharsRule);
	}

	if (zimbraPasswordMinLowerCaseChars) {
		var minLowerCaseCharsMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinLowerCaseChars, [zimbraPasswordMinLowerCaseChars.toString()]);

		enabledLocalRules.push(findRule("zimbraPasswordMinLowerCaseChars"));
		Dwt.setInnerHtml(this._passwordMinLowerCaseCharsLabel, minLowerCaseCharsMsg);
		Dwt.show(this._passwordMinLowerCaseCharsRule);
	}

	if (zimbraPasswordMinNumericChars) {
		var minNumericCharsMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinNumericChars, [zimbraPasswordMinNumericChars.toString()]);

		enabledLocalRules.push(findRule("zimbraPasswordMinNumericChars"));
		Dwt.setInnerHtml(this._passwordMinNumericCharsLabel, minNumericCharsMsg);
		Dwt.show(this._passwordMinNumericCharsRule);
	}

	if (zimbraPasswordMinPunctuationChars) {
		var minPunctuationCharsMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinPunctuationChars, [zimbraPasswordMinPunctuationChars.toString()]);
		enabledLocalRules.push(findRule("zimbraPasswordMinPunctuationChars"));

		Dwt.setInnerHtml(this._passwordMinPunctuationCharsLabel, minPunctuationCharsMsg);
		Dwt.show(this._passwordMinPunctuationCharsRule);
	}

	if(zimbraPasswordMinDigitsOrPuncs) {
		var minDigitsOrPuncsMsg = AjxMessageFormat.format(ZmMsg.zimbraPasswordMinDigitsOrPuncs, [zimbraPasswordMinDigitsOrPuncs.toString()]);
		enabledLocalRules.push(findRule("zimbraPasswordMinDigitsOrPuncs"));

		Dwt.setInnerHtml(this._passwordMinDigitsOrPunctuationLabel, minDigitsOrPuncsMsg);
		Dwt.show(this._passwordMinDigitsOrPunctuationRule);
	}

	
	if(enabledLocalRules.length === 0) {
		Dwt.hide(this._passwordRuleList);
	}

	var newPasswordShowSpan = Dwt.getElement("newPasswordShowSpan");
	var newPasswordHideSpan = Dwt.getElement("newPasswordHideSpan");
	var confirmShowSpan = Dwt.getElement("confirmShowSpan");
	var confirmHideSpan = Dwt.getElement("confirmHideSpan");

	newPasswordShowSpan.addEventListener("click", showNewPassword.bind(this), null);
	newPasswordHideSpan.addEventListener("click", showNewPassword.bind(this), null);
	confirmShowSpan.addEventListener("click", showConfirmPassword.bind(this), null);
	confirmHideSpan.addEventListener("click", showConfirmPassword.bind(this), null);

	function handleNewPasswordChange() {
		var currentValue = this._passwordNewInput.value;
		var parsedChars = parseCharsFromPassword(currentValue, zimbraPasswordAllowedChars, zimbraPasswordAllowedPunctuationChars);

		matchedLocalRules = [];

		if (zimbraPasswordMinLength){
			if (currentValue.length >= zimbraPasswordMinLength) {
				matchedLocalRules.push({type : "zimbraPasswordMinLength"});
			}
		}

		if (zimbraPasswordMinUpperCaseChars) {
			if (parsedChars.uppers.length >= zimbraPasswordMinUpperCaseChars) {
				matchedLocalRules.push({type : "zimbraPasswordMinUpperCaseChars"});
			}
		}

		if (zimbraPasswordMinLowerCaseChars) {
			if (parsedChars.lowers.length >= zimbraPasswordMinLowerCaseChars) {
				matchedLocalRules.push({type : "zimbraPasswordMinLowerCaseChars"});
			}
		}

		if (zimbraPasswordMinNumericChars) {
			if (parsedChars.numbers.length >= zimbraPasswordMinNumericChars) {
				matchedLocalRules.push({type : "zimbraPasswordMinNumericChars"});
			}
		}

		if (zimbraPasswordMinPunctuationChars) {
			if (parsedChars.punctuations.length >= zimbraPasswordMinPunctuationChars) {
				matchedLocalRules.push({type : "zimbraPasswordMinPunctuationChars"});
			}
		}

		if(zimbraPasswordMinDigitsOrPuncs) {
			if (parsedChars.punctuations.length + parsedChars.numbers.length >= zimbraPasswordMinDigitsOrPuncs) {
				matchedLocalRules.push({type : "zimbraPasswordMinDigitsOrPuncs"});
			}
		}

		enabledLocalRules.forEach(function(rule) {
			if (matchedLocalRules.findIndex(function(mRule) { return mRule.type === rule.type}) >= 0) {
				check(rule.checkImg, rule.closeImg);
			} else {
				unCheck(rule.checkImg, rule.closeImg);
			}
		})

		handleErrorMessageDiv(parsedChars.invalidChars.length > 0, [parsedChars.invalidChars.join(", "), ZmMsg.zimbraPasswordAllowedChars].join(' '), this._resetPasswordErrorMessageDiv, this._resetPasswordErrorDiv);

		resetImg(this._passwordConfirmInput.value && this._passwordConfirmInput.value === this._passwordNewInput.value, Dwt.getElement("mustMatchCheckImg"), Dwt.getElement("mustMatchCloseImg"));
		
		if (enabledLocalRules.length !== matchedLocalRules.length || this._passwordConfirmInput.value !== this._passwordNewInput.value) {
			this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
		} else {
			this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, true);
		}
	};

	function handleConfirmPasswordChange() {
		resetImg(this._passwordConfirmInput.value && this._passwordConfirmInput.value === this._passwordNewInput.value, Dwt.getElement("mustMatchCheckImg"), Dwt.getElement("mustMatchCloseImg"));
		
		if (enabledLocalRules.length !== matchedLocalRules.length || this._passwordConfirmInput.value !== this._passwordNewInput.value) {
			this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
		} else {
			this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, true);
		}
	};

	this._passwordNewInput.addEventListener("input", handleNewPasswordChange.bind(this), null);
	this._passwordConfirmInput.addEventListener("input", handleConfirmPasswordChange.bind(this), null);
	
	Dwt.hide(this._codeSuccessDivId);
	Dwt.show(this._resetPasswordDivId);
	this.continueSessionsRecoveryButton.setVisible(false);
	this.resetPasswordRecoveryButton.setVisible(false);
	
	this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON).setText(ZmMsg.recoveryEmailButtonContinueSession);
	this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.VERIFY_CODE_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESEND_OPTION_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, true);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
}

/**
 * Prepare and send in a request to change the password.
 *
 */
ZmPasswordRecoveryDialog.prototype._resetPassword =
function() {
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create('ResetPasswordRequest', 'urn:zimbraAccount');
	var respCallback = this._resetPasswordCallback.bind(this);
	var pwdNewValue = this._passwordNewInput.value;
	var pwdConfirmValue = this._passwordConfirmInput.value;
	var result = {};
	if (pwdNewValue !== pwdConfirmValue) {
		result.code = 'service.FEATURE_RESET_PASSWORD_MISMATCH';
		this._resetPasswordErrorMessageDiv.style.display = "block";
		this._handleResetPasswordError(this._resetPasswordErrorDiv, this._resetPasswordErrorMessageDiv, result);
		return;
	}
	soapDoc.set('password', this._passwordNewInput.value);
	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:'/service/soap/'})
};

/**
 * Callback for retrieving validation of the passwqord updatee.
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._resetPasswordCallback =
function(result) {
	if (!result || result.isException()) {
		this._resetPasswordErrorMessageDiv.style.display = "block";
		this._handleResetPasswordError(this._resetPasswordErrorDiv, this._resetPasswordErrorMessageDiv, result.getException());
	} else {
		Dwt.hide(this._resetPasswordDivId);
		Dwt.show(this._passwordResetSuccessDivId);
		this.setButtonVisible(ZmPasswordRecoveryDialog.CANCEL_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.RESET_SUBMIT_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.LOGIN_BUTTON, true);
	}
};

/**
 * Callback for retrieving validation of the two factor code
 *
 * @param {object} result The returned result object
 */
ZmPasswordRecoveryDialog.prototype._validateTwoFactorCode =
function() {
	var elBy;
	var command = new ZmCsfeCommand();
	var soapDoc = AjxSoapDoc.create('AuthRequest', 'urn:zimbraAccount');
	var respCallback = this._verifyTwoFactorCodeAuthCallback.bind(this);
	var twoFactorCode = this._twoFactorCodeInput.value;
	var trustedDevice = this._trustedDeviceInput.value;
	soapDoc.set('twoFactorCode', twoFactorCode);
	soapDoc.set('deviceTrusted', trustedDevice);
	elBy = soapDoc.set('authToken', this._twoFactorAuthToken);
	elBy.setAttribute('verifyAccount', '0');

	command.invoke({soapDoc: soapDoc, noAuthToken: true, noSession: true, asyncMode: true, callback: respCallback, serverUri:'/service/soap/'})
};

