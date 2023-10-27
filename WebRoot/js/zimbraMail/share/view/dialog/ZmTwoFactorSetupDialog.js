/*
 * ***** BEGIN LICENSE BLOCK *****
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
	this.accountPage = params.accountPage;
	this.twoStepAuthSpan = params.twoStepAuthSpan;
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
		extraButtons : params.isFromLoginPage ? [nextButton, previousButton, beginSetupButton, finishButton, cancelButton] : [previousButton, beginSetupButton, nextButton, finishButton, cancelButton]
	};
	DwtDialog.call(this, newParams);
	this.setContent(this._contentHtml(params.isFromLoginPage));
	this._createControls(params.isFromLoginPage);
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
function(isFromLoginPage) {
	var id = this._htmlElId;
	this._descriptionDivId = id + "_description";
	this._passwordDivId = id + "_password";
	this._passwordErrorDivId = id + "_password_error";
	this._chooseMethodDivId = id + "_choose_method";
	this._authenticationDivId = id + "_authentication";
	this._emailDivId = id + "_email";
	this._emailAddressDivId = id + "_email_address";
	this._codeDivId = id + "_code";
	this._codeDescriptionDivId = id + "_code_description";
	this._codeErrorDivId = id + "_code_error";
	this._successDivId = id + "_success";


	return isFromLoginPage ?
		AjxTemplate.expand("share.Dialogs#ZmTwoFactorCustomLoginPage", {id : id, username : this.username}) :
		AjxTemplate.expand("share.Dialogs#ZmTwoFactorSetup", {id : id, username : this.username});
};

ZmTwoFactorSetupDialog.prototype._createControls =
function(isFromLoginPage) {
	var id = this._htmlElId;
	this._passwordInput = Dwt.getElement(id + "_password_input");
	this._codeInput = Dwt.getElement(id + "_code_input");
	this._keySpan = Dwt.getElement(id + "_email_key");
	this._emailAddressInput = Dwt.getElement(id + "_email_address_input");
	var keyupHandler = this._handleKeyUp.bind(this);

	if(isFromLoginPage) {
		this.getButton(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON).setClassName('ZmTwoFactorPreviousButton');
		this.getButton(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON).setClassName('ZmTwoFactorBeginButton');
		this.getButton(ZmTwoFactorSetupDialog.NEXT_BUTTON).setClassName('ZmTwoFactorNextButton');
		this.getButton(ZmTwoFactorSetupDialog.FINISH_BUTTON).setClassName('ZmTwoFactorFinishButton');
		this.getButton(ZmTwoFactorSetupDialog.CANCEL_BUTTON).setClassName('ZmTwoFactorCancelButton');
	}
	Dwt.setHandler(this._passwordInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._passwordInput, DwtEvent.ONINPUT, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._codeInput, DwtEvent.ONINPUT, keyupHandler);

	Dwt.setHandler(this._emailAddressInput, DwtEvent.ONKEYUP, keyupHandler);
	Dwt.setHandler(this._emailAddressInput, DwtEvent.ONINPUT, keyupHandler);

};

/**
** an array of input fields that will be cleaned up between instances of the dialog being popped up and down
*
* @return An array of the input fields to be reset
*/
ZmTwoFactorSetupDialog.prototype._getInputFields =
function() {
	return [this._passwordInput, this._codeInput, this._emailAddressInput];
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

	if (typeof appCtxt !== "undefined") {
		this.methodAllowed = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowed();
		this.methodEnabled = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled();
		this.isResetPasswordEnabled = (appCtxt.get(ZmSetting.RESET_PASSWORD_STATUS) === "enabled" && appCtxt.get(ZmSetting.PASSWORD_RECOVERY_EMAIL_STATUS) === "verified");
	} else {
		this.methodAllowed = params.tfaMethodAllowed ? params.tfaMethodAllowed.split(',') : [ZmTwoFactorAuth.APP];
		this.methodEnabled = [];
		this.isResetPasswordEnabled = params.isResetPasswordEnabled;
	}

	this.methodNotEnabled = [];
	for (var i = 0; i < this.methodAllowed.length; i++) {
		if (this.methodEnabled.indexOf(this.methodAllowed[i]) === -1) {
			this.methodNotEnabled.push(this.methodAllowed[i]);
		}
	}

	if (this.methodNotEnabled.length > 1) {
		this.showChooseMethod = true;
		this.tfaMethod = "";
	} else {
		this.showChooseMethod = false;
		this.tfaMethod = this.methodNotEnabled[0];
	}

	this._stages = [ "initial", "tfaMethod", "auth"];
	this._divIds = { initial: [this._descriptionDivId],
	                 app:   [this._passwordDivId, this._authenticationDivId, this._emailDivId],
	                 email: [this._emailAddressDivId, this._passwordDivId],
	                 auth: [this._codeDivId, this._successDivId]
	               };

	if (this.showChooseMethod) {
		this._divIds["initial"].push(this._chooseMethodDivId);
	} else {
		this._stages[1] = this.methodNotEnabled[0];
	}

	// TODO: radio buttons need to be created here rather than template
	var id = this._htmlElId;
	if (this.showChooseMethod) {
		var divElem = Dwt.getElement(id + "_method_list");
		while (divElem.firstChild){
			divElem.removeChild(divElem.firstChild);
		}
		var radioHandler = this._radioChange.bind(this);
		for (var i = 0; i < this.methodNotEnabled.length; i++) {
			var pElem = document.createElement('p');
			pElem.className = this.isFromLoginPage ? "ZmTwoFactorCustomParaLoginPage" : "";
			var inputElem = document.createElement('input');
			inputElem.type = "radio";
			inputElem.id = id + "_method_" + this.methodNotEnabled[i];
			inputElem.name = "tfaMethod";
			inputElem.value = this.methodNotEnabled[i];

			var labelElem = document.createElement('label');
			labelElem.htmlFor = id + "_method_" + this.methodNotEnabled[i];
			labelElem.textContent = ZmMsg["twoStepAuthChooseMethod_" + this.methodNotEnabled[i]];
			if (!this.isFromLoginPage) {
				labelElem.style.margin = 0;
			}

			pElem.appendChild(inputElem);
			pElem.appendChild(labelElem);
			divElem.appendChild(pElem);
			Dwt.setHandler(inputElem, DwtEvent.ONCHANGE, radioHandler);
		}
	}

	if (this.methodNotEnabled.indexOf(ZmTwoFactorAuth.EMAIL) !== -1 && this.isResetPasswordEnabled) {
		var divElemEmailNote = Dwt.getElement(id + "_email_note");
		while (divElemEmailNote.firstChild) {
			divElemEmailNote.removeChild(divElemEmailNote.firstChild);
		}
		var pElemEmailNote = document.createElement("p");
		pElemEmailNote.className = this.isFromLoginPage ? "ZmTwoFactorCustomParaLoginPage" : "";
		pElemEmailNote.textContent = ZmMsg.twoStepAuthEnterEmailNote;
		divElemEmailNote.appendChild(pElemEmailNote);
	}

	Dwt.show(this._descriptionDivId);
	Dwt.hide(this._passwordDivId);
	Dwt.hide(this._passwordErrorDivId);
	Dwt.hide(this._chooseMethodDivId);
	Dwt.hide(this._authenticationDivId);
	Dwt.hide(this._emailAddressDivId);
	Dwt.hide(this._emailDivId);
	Dwt.hide(this._codeDivId);
	Dwt.hide(this._codeErrorDivId);
	Dwt.hide(this._successDivId);
	this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, true);
	this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.FINISH_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.CANCEL_BUTTON, true);
	this._stageIndex = 0;
	this._divIndexInStage = 0;
	this._currentDivId;
	DwtDialog.prototype.reset.call(this);
};

ZmTwoFactorSetupDialog.prototype._beginSetupButtonListener =
function() {
	this._showNextPage();
	this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, false);
	this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
	this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
};

ZmTwoFactorSetupDialog.prototype._previousButtonListener =
function() {
	var currentDivId = this._divIds[this._stages[this._stageIndex]][this._divIndexInStage];
	if (currentDivId === this._passwordDivId) {
		Dwt.hide(this._passwordErrorDivId);
	} else if (currentDivId === this._codeDivId) {
		Dwt.hide(this._codeErrorDivId);
		Dwt.show(this._codeDescriptionDivId);
	}

	var stage = this._stages[this._stageIndex];
	var nextDivId;
	if (this._divIndexInStage !== 0) {
		stage = this._stages[this._stageIndex];
		Dwt.hide(this._divIds[stage][this._divIndexInStage--]);
		nextDivId = this._divIds[stage][this._divIndexInStage]
		Dwt.show(nextDivId);
	} else {
		Dwt.hide(this._divIds[stage][this._divIndexInStage]);
		this._stageIndex--;
		stage = this._stages[this._stageIndex];
		this._divIndexInStage = this._divIds[stage].length -1;
		nextDivId = this._divIds[stage][this._divIndexInStage]
		Dwt.show(nextDivId);
	}

	if (nextDivId === this._descriptionDivId) {
		this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.BEGIN_SETUP_BUTTON, true);
	} else if (nextDivId === this._passwordDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._passwordInput.value !== "");
	} else if (nextDivId === this._chooseMethodDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this.tfaMethod !== "");
	} else if (nextDivId === this._emailAddressDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._emailAddressInput.value !== "");
		this._emailAddressInput.focus();
	} else if (nextDivId === this._emailDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
	}
};

ZmTwoFactorSetupDialog.prototype._nextButtonListener =
function() {
	var currentDivId = this._divIds[this._stages[this._stageIndex]][this._divIndexInStage];
	if (currentDivId === this._passwordDivId || currentDivId === this._codeDivId) {
		this._enableTwoFactorAuth(currentDivId);
		return;
	}

	this._showNextPage();
};
ZmTwoFactorSetupDialog.prototype._showNextPage =
function() {
	var stage = this._stages[this._stageIndex];
	var nextDivId;
	if (this._divIndexInStage !== this._divIds[stage].length - 1) {
		Dwt.hide(this._divIds[stage][this._divIndexInStage++]);
		nextDivId = this._divIds[stage][this._divIndexInStage];
		Dwt.show(nextDivId);
	} else {
		Dwt.hide(this._divIds[stage][this._divIndexInStage]);
		this._stageIndex++;
		stage = this._stages[this._stageIndex];
		this._divIndexInStage = 0;
		nextDivId = this._divIds[stage][this._divIndexInStage];
		Dwt.show(nextDivId);
	}

	if (nextDivId === this._chooseMethodDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this.tfaMethod !== "");
	} else if (nextDivId === this._passwordDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._passwordInput.value !== "");
		this._passwordInput.focus();
	} else if (nextDivId === this._authenticationDivId || nextDivId === this._emailDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, true);
		this.setButtonEnabled(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
	} else if (nextDivId === this._emailAddressDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._emailAddressInput.value !== "");
		this._emailAddressInput.focus();
	} else if (nextDivId === this._codeDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, this._codeInput.value !== "");
		this.setButtonEnabled(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, true);
		this._codeInput.focus();
	} else if (nextDivId === this._successDivId) {
		this.setButtonVisible(ZmTwoFactorSetupDialog.PREVIOUS_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.NEXT_BUTTON, false);
		this.setButtonVisible(ZmTwoFactorSetupDialog.FINISH_BUTTON, true);
		this.setButtonVisible(ZmTwoFactorSetupDialog.CANCEL_BUTTON, false);
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

		this.accountPage.setTwoStepAuthLink();

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
	var currentDivId = this._divIds[this._stages[this._stageIndex]][this._divIndexInStage];
	if (currentDivId === this._passwordDivId || currentDivId === this._codeDivId || currentDivId === this._emailAddressDivId) {
		this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, !!value);
	}
};

ZmTwoFactorSetupDialog.prototype._radioChange =
function(ev) {
	var value = ev && ev.target && ev.target.value;
	this.tfaMethod = ev.target.value;
	this.setButtonEnabled(ZmTwoFactorSetupDialog.NEXT_BUTTON, !!value);
	this._stages[1] = value;
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
		var jsonObj = {EnableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", csrfTokenSecured:1, name:{_content : this.username}, authToken:{_content : this._authToken}, twoFactorCode:{_content : codeInput.value}, method:{_content : this.tfaMethod}}};
	} else if (this.tfaMethod === ZmTwoFactorAuth.APP) {
		var jsonObj = {EnableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", csrfTokenSecured:1, name:{_content : this.username}, password:{_content : passwordInput.value}, method:{_content : this.tfaMethod}}};
	} else if (this.tfaMethod === ZmTwoFactorAuth.EMAIL) {
		var jsonObj = {EnableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", csrfTokenSecured:1, name:{_content : this.username}, password:{_content : passwordInput.value}, method:{_content : this.tfaMethod}, email:{_content: this._emailAddressInput.value}}};
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
		if (enableTwoFactorAuthResponse.csrfToken && enableTwoFactorAuthResponse.csrfToken[0] && enableTwoFactorAuthResponse.csrfToken[0]._content) {
			window.csrfToken = enableTwoFactorAuthResponse.csrfToken[0]._content;
		}
		/* TODO: scratchCodes will not be returned when 2nd method is enabled.
		 *       Need to fix if-else conditions.
		 */
		/* TODO: when email method is enabled zimbraFeatureResetPasswordStatus is enabled,
		 *       update recovery email address and show the email address in Password Recovery Account Setting with verified status
		 */
		var secret = enableTwoFactorAuthResponse.secret;
		var scratchCodes = enableTwoFactorAuthResponse.scratchCodes;
		if (secret && secret[0] && secret[0]._content) {
			Dwt.setInnerHtml(this._keySpan, secret[0]._content);
			this._handleTwoFactorAuthSuccess(currentDivId);
			return;
		}
		else if (scratchCodes && scratchCodes[0] && scratchCodes[0].scratchCode) {
			/* TODO: it may be better to call GetInfoRequest to get the updated values of
			 *       - zimbraTwoFactorAuthMethodEnabled
			 *       - zimbraPrefPrimaryTwoFactorAuthMethod
			 *       - zimbraPrefPasswordRecoveryAddress
			 *       - zimbraPrefPasswordRecoveryAddressStatus
			 */
			if (typeof appCtxt !== "undefined") {
				//Only the server will set ZmSetting.TWO_FACTOR_AUTH_ENABLED. Don't try to save the setting from the UI.
				appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_ENABLED, true, false, false, true);

				this.methodEnabled.push(this.tfaMethod);
				appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_METHOD_ENABLED, this.methodEnabled.concat(), false, false, true);
				for (var i = 0; i < this.methodNotEnabled.length; i++) {
					if (this.methodNotEnabled[i] === this.tfaMethod) {
						this.methodNotEnabled.splice(i, 1);
						break;
					}
				}
				if (!ZmTwoFactorAuth.getPrefPrimaryTwoFactorAuthMethod()) {
					appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_PRIMARY_METHOD, this.tfaMethod, false, false, true);
				}

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
	this._showNextPage();
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
	var methodsDiv = document.getElementById("tfaMethodsToBeDisabled");
	var method = params.method;
	if (methodsDiv) {
		var collection = methodsDiv.getElementsByTagName('INPUT');
		for (i = 0; i < collection.length; i++) {
			if (collection[i].checked) {
				method = collection[i].value;
				break;
			}
		}
	}
	var jsonObj = {DisableTwoFactorAuthRequest : {_jsns:"urn:zimbraAccount", method: method}};
	var callback = ZmTwoFactorSetupDialog.disableTwoFactorAuthCallback.bind(window, params, dialog, method);
	command.invoke({jsonObj: jsonObj, noAuthToken: true, asyncMode: true, callback: callback, serverUri:"/service/soap/"});
};

ZmTwoFactorSetupDialog.disableTwoFactorAuthCallback =
function(params, dialog, method) {
	dialog.popdown();
	Dwt.setInnerHtml(params.twoStepAuthSpan, ZmMsg.twoStepStandardAuth);
	Dwt.setDisplay(params.twoStepAuthCodesContainer, Dwt.DISPLAY_NONE);

	var methodEnabled = ZmTwoFactorAuth.getTwoFactorAuthMethodAllowedAndEnabled();
	for (i = 0; i < methodEnabled.length; i++) {
		if (methodEnabled[i] === method) {
			methodEnabled.splice(i, 1);
			break;
		}
	}
	/* TODO: it may be better to call GetInfoRequest to get the updated values of
	 *       - zimbraTwoFactorAuthMethodEnabled
	 *       - zimbraPrefPrimaryTwoFactorAuthMethod
	 */
	appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_METHOD_ENABLED, methodEnabled, false, false, true);

	if (ZmTwoFactorAuth.getPrefPrimaryTwoFactorAuthMethod() === method) {
		if (methodEnabled.length > 0) {
			appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_PRIMARY_METHOD, methodEnabled[0], false, false, true);
		} else {
			appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_PRIMARY_METHOD, null, false, false, true);
		}
	}

	if (methodEnabled.length === 0) {
		appCtxt.set(ZmSetting.TWO_FACTOR_AUTH_ENABLED, false, false, false, true);
	}

	params.accountPage.setTwoStepAuthLink();
};