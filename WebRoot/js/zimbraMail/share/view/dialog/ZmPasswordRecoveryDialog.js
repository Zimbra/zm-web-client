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
 * Creates a dialog for Two factor initial setup
 * @constructor
 * @class
 * @author  Hem Aravind
 *
 * @extends	DwtDialog
 */
ZmPasswordRecoveryDialog = function(params) {
	console.log("PARAMSPARAMS: ", params);
	this.accountInput = params.accountInput || "";
	// this.isFromLoginPage will be true if ZmPasswordRecoveryDialog is created from TwoFactorSetup.jsp, which is forwarded from login.jsp file.
	this.isFromLoginPage = params.isFromLoginPage;

	var beginSetupButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON,
								ZmMsg.passwordRecoveryBeginSetup,
								DwtDialog.ALIGN_RIGHT,
								this._beginSetupButtonListener.bind(this));

	var previousButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.PREVIOUS_BUTTON,
								ZmMsg.previous, DwtDialog.ALIGN_RIGHT,
								this._previousButtonListener.bind(this));

	var nextButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.NEXT_BUTTON,
								ZmMsg.next, DwtDialog.ALIGN_RIGHT,
								this._nextButtonListener.bind(this));

	var finishButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.FINISH_BUTTON,
								ZmMsg.passwordRecoveryResetSuccessFinish,
								DwtDialog.ALIGN_RIGHT,
								this._finishButtonListener.bind(this));

	var cancelButton = new DwtDialog_ButtonDescriptor(ZmPasswordRecoveryDialog.CANCEL_BUTTON,
								ZmMsg.cancel,
								DwtDialog.ALIGN_RIGHT,
								this._cancelButtonListener.bind(this));

	var shell = typeof appCtxt !== "undefined" ? appCtxt.getShell() : new DwtShell({});
	var newParams = {
		parent : shell,
		title : ZmMsg.passwordRecoveryTitle,
		standardButtons : [DwtDialog.NO_BUTTONS],
		extraButtons : [cancelButton, beginSetupButton, previousButton, nextButton, finishButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml());
	this._createControls();
	this._setAllowSelection();
};

ZmPasswordRecoveryDialog.prototype = new DwtDialog;
ZmPasswordRecoveryDialog.prototype.constructor = ZmPasswordRecoveryDialog;

ZmPasswordRecoveryDialog.CANCEL_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.PREVIOUS_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.NEXT_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmPasswordRecoveryDialog.FINISH_BUTTON = ++DwtDialog.LAST_BUTTON;

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

ZmPasswordRecoveryDialog.prototype._createControls = function() {
	var id = this._htmlElId;
	var cancelbutton = this.getButton(ZmPasswordRecoveryDialog.CANCEL_BUTTON);
	this._accountInput = Dwt.getElement(id + "_account_input");
	this._codeInput = Dwt.getElement(id + "_code_input");
	this._passwordNewInput = Dwt.getElement(id + "_password_new_input");
	this._passwordConfirmInput = Dwt.getElement(id + "_password_confirm_input");
	var keyupHandler = this._handleKeyUp.bind(this);
	var keyupResetHandler = this._handleResetKeyUp.bind(this);
	Dwt.setHandler(this._accountInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._accountInput, DwtEvent.ONINPUT, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONINPUT, keyupHandler);
	Dwt.setHandler(this._passwordNewInput, DwtEvent.ONKEYUP, keyupResetHandler);
	Dwt.setHandler(this._passwordNewInput, DwtEvent.ONINPUT, keyupResetHandler);
	Dwt.setHandler(this._passwordConfirmInput, DwtEvent.ONKEYUP, keyupResetHandler);
	Dwt.setHandler(this._passwordConfirmInput, DwtEvent.ONINPUT, keyupResetHandler);
	cancelbutton.setText(ZmMsg.passwordRecoveryButtonCancel);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, false);
};

/**
** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
*
* @return An array of the input fields to be reset
*/
ZmPasswordRecoveryDialog.prototype._getInputFields = function() {
	return [this._accountInput, this._codeInput];
};

/**
 * Pops-up the dialog.
 */
ZmPasswordRecoveryDialog.prototype.popup = function() {
	this.reset();
	DwtDialog.prototype.popup.call(this);
	this.setButtonEnabled(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, false);
	this._accountInput.focus();
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
	this.setButtonVisible(ZmPasswordRecoveryDialog.PREVIOUS_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.NEXT_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.FINISH_BUTTON, false);
	this._divIdArrayIndex = 0;
	DwtDialog.prototype.reset.call(this);
};

ZmPasswordRecoveryDialog.prototype._beginSetupButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	Dwt.hide(this._getRecoveryAccountDivId);
	Dwt.show(this._requestCodeDivId);
	this.setButtonVisible(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, false);
	this.setButtonVisible(ZmPasswordRecoveryDialog.PREVIOUS_BUTTON, true);
	this.setButtonVisible(ZmPasswordRecoveryDialog.NEXT_BUTTON, true);
	this._divIdArrayIndex = 1;
};

ZmPasswordRecoveryDialog.prototype._previousButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	if (currentDivId === this._requestCodeDivId) {
		Dwt.hide(this._validateCodeErrorDivId);
		this.setButtonVisible(ZmPasswordRecoveryDialog.PREVIOUS_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, true);
		this._accountInput.focus();
	}
	else if (currentDivId === this._validateCodeDivId) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, true);
	}
	else if (currentDivId === this._resetPasswordDivId) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, true);
	}
	else if (currentDivId === this._passwordResetSuccessDivId) {
		this.setButtonVisible(ZmPasswordRecoveryDialog.FINISH_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.NEXT_BUTTON, true);
		this._passwordResetCheck();
		this._passwordNewInput.focus();
	}
	Dwt.show(this._divIdArray[this._divIdArrayIndex - 1]);
	Dwt.hide(this._divIdArray[this._divIdArrayIndex]);
	if (this._divIdArrayIndex > -1) {
		this._divIdArrayIndex--;
	}
};

ZmPasswordRecoveryDialog.prototype._nextButtonListener = function() {
	var currentDivId = this._divIdArray[this._divIdArrayIndex];
	Dwt.show(this._divIdArray[this._divIdArrayIndex + 1]);
	Dwt.hide(this._divIdArray[this._divIdArrayIndex]);
	if (this._divIdArrayIndex < this._divIdArray.length) {
		this._divIdArrayIndex++;
	}
	if (currentDivId === this._requestCodeDivId) {
		this._codeInputCheck();
		this._codeInput.focus();
	}
	if (currentDivId === this._codeSuccessDivId) {
		Dwt.hide(this._resetPasswordErrorDivId);
		Dwt.show(this._resetPasswordDescriptionDivId);
		this._passwordResetCheck();
		this._passwordNewInput.focus();
	}
	if (currentDivId === this._resetPasswordDivId) {
		this.setButtonVisible(ZmPasswordRecoveryDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmPasswordRecoveryDialog.FINISH_BUTTON, true);
	}
};

ZmPasswordRecoveryDialog.prototype._finishButtonListener = function() {
	// If the user clicks finish button, redirect to the login page
	location.replace(location.origin);
};

ZmPasswordRecoveryDialog.prototype._cancelButtonListener = function() {
	//If the user clicks cancel button, redirect to the login page
	location.replace(location.origin);
};

ZmPasswordRecoveryDialog.prototype._handleKeyUp = function(ev) {
	var firstInputPattern = new RegExp("_account_input");
	var targetIsAccountInput = firstInputPattern.test(ev.target.id);
	var value = ev && ev.target && ev.target.value && ev.target.value.length;
	if (targetIsAccountInput) {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.BEGIN_SETUP_BUTTON, !!value);
	} else {
		this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, !!value);
	}
};

ZmPasswordRecoveryDialog.prototype._handleResetKeyUp = function(ev) {
	var firstInputPattern = new RegExp("_password_new_input");
	var targetIsNewPasswordInput = firstInputPattern.test(ev.target.id);
	var value = ev && ev.target && ev.target.value && ev.target.value.length;
	var altValue;
	if(targetIsNewPasswordInput){
		altValue = this._passwordConfirmInput.value;
	} else {
		altValue = this._passwordNewInput.value;
	}
	this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, !!value && (altValue === ev.target.value));
};

ZmPasswordRecoveryDialog.prototype._codeInputCheck = function() {
	var codeInput = this._codeInput.value;
	this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, !!codeInput);
};

ZmPasswordRecoveryDialog.prototype._passwordResetCheck = function() {
	var newValue = this._passwordNewInput.value;
	var altValue = this._passwordConfirmInput.value;
	this.setButtonEnabled(ZmPasswordRecoveryDialog.NEXT_BUTTON, newValue && altValue && newValue === altValue);
};

/**
 * Determines whether to prevent the browser from displaying its context menu.
 */
ZmPasswordRecoveryDialog.prototype.preventContextMenu = function() {
	return false;
};

