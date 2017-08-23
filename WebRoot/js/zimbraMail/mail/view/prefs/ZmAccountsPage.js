/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmAccountsPage = function(parent, section, controller) {
	// bug: 20458 - We don't have ZmDataSource and other classes unless
	//              we load MailCore (which we never do if mail is disabled).
	ZmAccountsPage._definePrefs();
	ZmAccountsPage._defineClasses();

	ZmPreferencesPage.call(this, parent, section, controller);

	this._sectionDivs = {};
	this._accounts = new AjxVector();
	this._deletedAccounts = [];
};
ZmAccountsPage.prototype = new ZmPreferencesPage;
ZmAccountsPage.prototype.constructor = ZmAccountsPage;

ZmAccountsPage.prototype.toString =
function() {
	return "ZmAccountsPage";
};

//
// Constants
//

// pref values

ZmAccountsPage.DOWNLOAD_TO_INBOX  = ZmOrganizer.ID_INBOX;
ZmAccountsPage.DOWNLOAD_TO_FOLDER = -1;

// counters

ZmAccountsPage.__personaCount = 0;
ZmAccountsPage.__externalCount = 0;

// section prefs

ZmAccountsPage._definePrefs =
function() {
	ZmAccountsPage.PREFS = {
		// Primary / Common
		ALERT: {
			displayContainer:	ZmPref.TYPE_CUSTOM
		},
		PROVIDER: {
			displayContainer:   ZmPref.TYPE_SELECT
		},
		NAME: {
			displayContainer:	ZmPref.TYPE_INPUT
		},
		HEADER: {
			displayContainer:	ZmPref.TYPE_STATIC,
			displayName:		ZmMsg.accountSubHeader
		},
		EMAIL: {
			displayContainer:	ZmPref.TYPE_INPUT,
			hint:				ZmMsg.exampleEmailAddr
		},
		VISIBLE: {
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		REPLY_TO: {
			displayName:		ZmMsg.accountReplyTo,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		REPLY_TO_NAME: {
			displayContainer:	ZmPref.TYPE_INPUT,
			hint:				ZmMsg.exampleEmailName
		},
		REPLY_TO_EMAIL: {
			displayContainer:	ZmPref.TYPE_COMBOBOX,
			hint:				ZmMsg.emailAddr
		},
		// External
		ACCOUNT_TYPE: {
			displayContainer:	ZmPref.TYPE_RADIO_GROUP,
			orientation:		ZmPref.ORIENT_HORIZONTAL,
			displayOptions:		["POP3", "IMAP"], // TODO: i18n
			options:			[ZmAccount.TYPE_POP, ZmAccount.TYPE_IMAP]
		},
		USERNAME: {
			displayContainer:	ZmPref.TYPE_INPUT
		},
		HOST: {
			displayContainer:	ZmPref.TYPE_INPUT,
			hint:				ZmMsg.exampleMailServer
		},
		PASSWORD: {
			// TODO: rename ZmPref.TYPE_PASSWORD to TYPE_CHANGE_PASSWORD
			// TODO: add ZmPref.TYPE_PASSWORD
			displayContainer:	ZmPref.TYPE_INPUT
		},
		CHANGE_PORT: {
			displayName:		ZmMsg.accountChangePortLabel,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		PORT: {
			displayContainer:	ZmPref.TYPE_INPUT,
			validator:			DwtInputField.validateNumber
		},
		PORT_DEFAULT: {
			displayContainer:	ZmPref.TYPE_STATIC,
			displayName:		ZmMsg.accountPortDefault
		},
		SSL: {
			displayName:		ZmMsg.accountUseSSL,
			displayContainer:	ZmPref.TYPE_CHECKBOX,
			options:			[ZmDataSource.CONNECT_CLEAR, ZmDataSource.CONNECT_SSL]
		},
		TEST: {
			displayName:		ZmMsg.accountTest,
			displayContainer:	ZmPref.TYPE_CUSTOM // NOTE: a button
		},
		DOWNLOAD_TO: {
			displayContainer:	ZmPref.TYPE_RADIO_GROUP,
			displayOptions:		[ZmMsg.accountDownloadToInbox, ZmMsg.accountDownloadToFolder],
			options:			[ZmAccountsPage.DOWNLOAD_TO_INBOX, ZmAccountsPage.DOWNLOAD_TO_FOLDER]
		},
		DELETE_AFTER_DOWNLOAD: {
			displayName:		ZmMsg.accountDeleteAfterDownload,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		// Persona
		FROM_NAME: {
			displayContainer:	ZmPref.TYPE_INPUT,
			hint:				ZmMsg.exampleEmailName
		},
		FROM_EMAIL: {
			displayContainer:	ZmPref.TYPE_SELECT,
			hint:				ZmMsg.emailAddr
		},
		FROM_EMAIL_TYPE: {
			displayContainer:	ZmPref.TYPE_SELECT,
			hint:				ZmMsg.emailAddr
		},
		WHEN_SENT_TO: {
			displayName:		ZmMsg.personaWhenSentTo,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		WHEN_SENT_TO_LIST: {
			displayContainer:	ZmPref.TYPE_INPUT
		},
		WHEN_IN_FOLDER: {
			displayName:		ZmMsg.personaWhenInFolder,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		},
		WHEN_IN_FOLDER_LIST: {
			displayContainer:	ZmPref.TYPE_INPUT,
			hint:				ZmMsg.exampleFolderNames
		},
		WHEN_IN_FOLDER_BUTTON: {
			displayContainer:	ZmPref.TYPE_CUSTOM
		}
	};

	/**
	 * Defines the various account sections. Each section has a list of "prefs"
	 * that may appear in that section. In the code below, each pref is marked
	 * as "A" if it's a field on the account object and "I" if it's a field on
	 * the identity object.
	 */
	ZmAccountsPage.SECTIONS = {
		PRIMARY: {
			id: "PRIMARY",
			prefs: [
				"NAME",					// A
				"HEADER",				//
				"EMAIL",				// A
				"VISIBLE",				//
				"FROM_NAME",			// I
				"FROM_EMAIL",			// I
				"FROM_EMAIL_TYPE",			// I
				"REPLY_TO",				// I
				"REPLY_TO_NAME",		// I
				"REPLY_TO_EMAIL"		// I
			]
		},
		EXTERNAL: {
			id: "EXTERNAL",
			prefs: [
				"ALERT",
				"PROVIDER",
				"NAME",						// A
				"HEADER",
				"EMAIL",					// I - maps to from name in identity
				"ACCOUNT_TYPE",				// A
				"USERNAME",					// A
				"HOST",						// A
				"PASSWORD",					// A
				"CHANGE_PORT",
				"PORT",						// A
				"PORT_DEFAULT",
				"SSL",						// A
				"TEST",
				"DOWNLOAD_TO",				// A
				"DELETE_AFTER_DOWNLOAD",	// A
				"FROM_NAME",				// I
				"FROM_EMAIL",				// I
				"REPLY_TO",					// I
				"REPLY_TO_NAME",			// I
				"REPLY_TO_EMAIL"			// I
			]
		},
		PERSONA: {
			id: "PERSONA",
			prefs: [
				"NAME",						// I
				"HEADER",
				"FROM_NAME",				// I
				"FROM_EMAIL",				// I
				"FROM_EMAIL_TYPE",				// I
				"REPLY_TO",					// I
				"REPLY_TO_NAME",			// I
				"REPLY_TO_EMAIL",			// I
				"WHEN_SENT_TO",				// I
				"WHEN_SENT_TO_LIST",		// I
				"WHEN_IN_FOLDER",			// I
				"WHEN_IN_FOLDER_LIST",		// I
				"WHEN_IN_FOLDER_BUTTON"
			]
		}
	};

	/*** DEBUG ***
	var providers = [
		{ id: "yahoo-pop", name: "Yahoo! Mail", type: "POP", host: "yahoo.com" },
		{ id: "gmail-pop", name: "GMail (POP)", type: "POP", host: "pop.gmail.com", connectionType: "ssl" },
		{ id: "gmail-imap", name: "GMail (IMAP)", type: "IMAP", host: "imap.gmail.com", connectionType: "ssl" }
	];
	for (var i = 0; i < providers.length; i++) {
		ZmDataSource.addProvider(providers[i]);
	}
	/***/

	// create a section for each provider with a custom template
	var providers = ZmDataSource.getProviders();
	for (var id in providers) {
		if (!AjxTemplate.getTemplate("prefs.Pages#ExternalAccount-"+id)) { continue; }
		ZmAccountsPage.SECTIONS[id] = {
			id:    id,
			prefs: ZmAccountsPage.SECTIONS["EXTERNAL"].prefs
		};
	}

}; // function ZmAccountsPage._definePrefs

ZmAccountsPage.ACCOUNT_PROPS = {
	"NAME":						{ setter: "setName",	getter: "getName" },
	"EMAIL":					{ setter: "setEmail",	getter: "getEmail" },
	"EMAIL_TYPE":					"emailType",
	"VISIBLE":					"visible",
	"ACCOUNT_TYPE":				"type",
	"USERNAME":					"userName",
	"HOST":						"mailServer",
	"PASSWORD":					"password",
	"PORT":						"port",
	"SSL":						"connectionType",
	"DOWNLOAD_TO":				{ setter: "setFolderId", getter: "getFolderId" },
	"DELETE_AFTER_DOWNLOAD":	"leaveOnServer"
};

ZmAccountsPage.IDENTITY_PROPS = {
	"FROM_NAME":			"sendFromDisplay",
	"FROM_EMAIL":			"sendFromAddress",
	"FROM_EMAIL_TYPE":		"sendFromAddressType",
	"REPLY_TO":				"setReplyTo",
	"REPLY_TO_NAME":		"setReplyToDisplay",
	"REPLY_TO_EMAIL":		"setReplyToAddress",
	"WHEN_SENT_TO":			"useWhenSentTo",
	"WHEN_SENT_TO_LIST":	"whenSentToAddresses",
	"WHEN_IN_FOLDER":		"useWhenInFolder",
	"WHEN_IN_FOLDER_LIST":	"whenInFolderIds"
};

ZmAccountsPage.prototype._handleTwoStepAuthLink =
function(params) {
	if (appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_ENABLED)) {
		var dialog = appCtxt.getYesNoMsgDialog();
		dialog.setMessage(ZmMsg.twoStepAuthDisableConfirm, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.twoStepAuthDisable);
		dialog.registerCallback(DwtDialog.YES_BUTTON, ZmTwoFactorSetupDialog.disableTwoFactorAuth.bind(window, params, dialog));
	}
	else {
		if (!this._twoFactorSetupDialog) {
			this._twoFactorSetupDialog = new ZmTwoFactorSetupDialog(params);
		}
		var dialog = this._twoFactorSetupDialog;
	}
	dialog.popup();
};

ZmAccountsPage.prototype._handleTwoStepAuthCodesViewLink =
function(params) {
	if (!this._oneTimeCodesDialog) {
		this._oneTimeCodesDialog = new ZmOneTimeCodesDialog(params);
	}
	this._oneTimeCodesDialog.popup();
};

ZmAccountsPage.prototype.getGrantRightsDlg =
function(callback) {

    if (!this._grantRightsDlg) {
        this._grantRightsDlg = new ZmGrantRightsDialog(appCtxt.getShell(), "ZmGrantRightsDialog");
    }
    this._grantRightsDlg._okCallBack = callback;
    return this._grantRightsDlg;

};

ZmAccountsPage.prototype._errRightsCommand =
function(user, ex) {
    this._delegateErrFormatter = this._delegateErrFormatter || new AjxMessageFormat(ZmMsg.delegateNoSuchAccErr);
    var msg = this._delegateErrFormatter.format(user);
    if (ex.code === "account.NO_SUCH_ACCOUNT") {
        appCtxt.getAppController().popupErrorDialog(msg, ex);
        return true;
    }

    return false;

};

ZmAccountsPage.prototype._handleDelegateRights =
function(user, sendAs, sendObo, isGrant, refresh) {
	var request = isGrant ? "GrantRightsRequest" : "RevokeRightsRequest";
	var soapDoc = AjxSoapDoc.create(request, "urn:zimbraAccount");
	var batchCmd = new ZmBatchCommand(null, appCtxt.accountList.mainAccount.name);
	var callback = this._handleDelegateRightsCallback.bind(this, user, sendAs, sendObo, isGrant, refresh);
	var errCallback = this._errRightsCommand.bind(this, user);
	var aceNode = null;
	if (sendAs){
		aceNode = soapDoc.set("ace");
		aceNode.setAttribute("gt", "usr");
		aceNode.setAttribute("d", user);
		aceNode.setAttribute("right", ZmSetting.SEND_AS);
	}

	if (sendObo){
		aceNode = soapDoc.set("ace");
		aceNode.setAttribute("gt", "usr");
		aceNode.setAttribute("d", user);
		aceNode.setAttribute("right", ZmSetting.SEND_ON_BEHALF_OF);
	}

	batchCmd.addNewRequestParams(soapDoc, callback, errCallback);
	batchCmd.run();
};

 ZmAccountsPage.prototype._handleDelegateRightsCallback =
 function(user, sendAs, sendObo, isGrant, refresh, result){
     var email = user;
     if (isGrant){
        var response = result.getResponse();
        var aces = response && response.GrantRightsResponse && response.GrantRightsResponse.ace;
        if (aces && aces.length && aces[0].d)
            email = aces[0].d;
     }
     if (refresh) {
         this._getGrants();
     }
     this._sendGrantRightsMessage(appCtxt.accountList.mainAccount.name, email, sendAs, sendObo, isGrant);

 };

ZmAccountsPage.prototype._grantDelegateRights =
function(user, sendAs, sendObo) {
    if (sendAs || sendObo){
        this._handleDelegateRights(user, sendAs, sendObo, true, true);
    }
};

ZmAccountsPage.prototype._handleAddDelegateButton =
function() {
    var callback = this._grantDelegateRights.bind(this);
    var dlg = this.getGrantRightsDlg(callback);
    dlg.setData();
    dlg.popup();
};


ZmAccountsPage.prototype._editDelegateRights =
function() {
    var user = this._editDelegateOrig.user;
    var sendAs = arguments[1];
    var sendObo = arguments[2];
    var isGrant = null;
    var updateSendAs = false;
    var updateSendObo = false;

    if (sendAs != this._editDelegateOrig.sendAs && sendObo != this._editDelegateOrig.sendOnBehalfOf){
        if (sendAs == sendObo){
            updateSendAs = updateSendObo = true;
            isGrant = sendAs;
        }else{
            this._handleDelegateRights(user, true, false, sendAs, false);
            updateSendObo = true;
            isGrant = sendObo;
        }
    }else if (sendAs != this._editDelegateOrig.sendAs){
            updateSendAs = true;
            isGrant = sendAs;
    }else if (sendObo != this._editDelegateOrig.sendOnBehalfOf){
            updateSendObo = true;
            isGrant = sendObo;
    }
    this._handleDelegateRights(user, updateSendAs, updateSendObo, isGrant, true);
};

ZmAccountsPage.prototype._editDelegateButton =
    function() {
    var item = this.delegatesList.getSelection()[0];
    this._editDelegateOrig = item;
    this._editDelegateOrig.sendAs = item.sendAs || false;
    this._editDelegateOrig.sendOnBehalfOf = item.sendOnBehalfOf || false;
    var callback = this._editDelegateRights.bind(this);
    var dlg = this.getGrantRightsDlg(callback);
    dlg.setData(item);
    dlg.popup();
};
ZmAccountsPage.prototype._compareDelegateEntries =
function(a, b) {
	return a.user < b.user ? -1 : (a.user > b.user ? 1 : 0);
};
ZmAccountsPage.prototype._setDelegateSendPrefs =
function(grants) {
    var ace = grants._data.GetRightsResponse && grants._data.GetRightsResponse.ace;
    var userRights = [];
    var right = user = node = null;
    var res = new AjxVector();
    if (!ace){
        this._dlSelectionListener(false);
        return res;
    }
    for (var i=0;i<ace.length;i++){
        user = ace[i].d;
        right = ace[i].right;
        if (!userRights[user]){
         userRights[user] = {user:user, id:ace[i].zid};

        }
        userRights[user][right] = true;
    }

    for (var usr in userRights) {
        res.add(userRights[usr])
    }

    res.sort(this._compareDelegateEntries);
    return res;
};

ZmAccountsPage.prototype._refreshRights =
function(grants) {
    var delegatesEl =   document.getElementById(this._htmlElId+"_DELEGATE_RIGHTS") || (this.delegatesList && this.delegatesList.getHtmlElement());
    var dlUsers = this._setDelegateSendPrefs(grants);
    var delegatesList = new ZmAccountDelegatesListView(this);
    delegatesList.replaceElement(delegatesEl);
    delegatesList.setEnabled(true);
    delegatesList.set(dlUsers);
    delegatesList.addSelectionListener(this._dlSelectionListener.bind(this,(dlUsers.size() > 0)));
    this.delegatesList = delegatesList;
    if (this._grantRightsDlg && this._grantRightsDlg.isPoppedUp()) this._grantRightsDlg.popdown();

    this._dlSelectionListener(false);
};

ZmAccountsPage.prototype._removeDelegateButton =
function() {
    var item = this.delegatesList.getSelection()[0];
    this._handleDelegateRights(item.user, item.sendAs, item.sendOnBehalfOf, false, true);
};

ZmAccountsPage.prototype._sendGrantRightsMessage =
function(granter, grantee, sendAs,sendObo,isGrant) {
    var msg = new ZmMailMsg();
    var addrs = new AjxVector();
    var permissions = (sendAs && sendObo)?ZmMsg.sendAsAndSendOnBehalfOf:(sendAs?ZmMsg.sendAs:ZmMsg.sendOnBehalfOflbl);
    var subject = "";
    var status = "";
    if (isGrant){
        status = (sendAs && sendObo) ? ZmMsg.delegateRightsStatus : ZmMsg.delegateRightStatus;
        subject = (sendAs && sendObo) ? ZmMsg.delegateRightsSubject : ZmMsg.delegateRightSubject;
    } else{
        status = (sendAs && sendObo) ? ZmMsg.revokeRightsStatus : ZmMsg.revokeRightStatus;
        subject = (sendAs && sendObo) ? ZmMsg.revokeRightsSubject : ZmMsg.revokeRightSubject;
    }
    subject = AjxMessageFormat.format(subject, [granter]);
    status = AjxMessageFormat.format(status, AjxStringUtil.htmlEncode(grantee));
    var text = (isGrant)?ZmMsg.delegateCreatedText : ZmMsg.delegateRevokedText;
    text = AjxMessageFormat.format(text, [permissions, grantee, granter]);
    var html = (isGrant)?ZmMsg.delegateCreatedHtml : ZmMsg.delegateRevokedHtml;
    html = AjxMessageFormat.format(html, [permissions, grantee, granter]);
    appCtxt.setStatusMsg(status);

    addrs.add(new AjxEmailAddress(grantee, AjxEmailAddress.TO));
    msg.setAddresses(AjxEmailAddress.TO, addrs);
    msg.setSubject(subject);
    var topPart = new ZmMimePart();
    topPart.setContentType(ZmMimeTable.MULTI_ALT);

    var htmlPart = new ZmMimePart();
    htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
    htmlPart.setContent(html);

    var textPart = new ZmMimePart();
    textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
    textPart.setContent(text);

    topPart.children.add(textPart);
    topPart.children.add(htmlPart);
    msg.setTopPart(topPart);
    msg.send();
};

ZmAccountsPage.getScratchCodes =
function(isNew, params, callback) {
	if (isNew) {
		var jsonObj = {GenerateScratchCodesRequest : {_jsns:"urn:zimbraAccount"}};
	}
	else {
		var jsonObj = {GetScratchCodesRequest: {_jsns: "urn:zimbraAccount"}};
	}
	var getScratchCodesCallback = ZmAccountsPage._getScratchCodesCallback.bind(window, isNew, params, callback);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:getScratchCodesCallback});
};

ZmAccountsPage._getScratchCodesCallback =
function(isNew, params, callback, result) {
	if (!result || result.isException()) {
		return;
	}
	var response = result.getResponse();
	var scratchCodesResponse = response && (response.GetScratchCodesResponse || response.GenerateScratchCodesResponse);
	if (!scratchCodesResponse) {
		return;
	}
	var scratchCode = scratchCodesResponse.scratchCodes && scratchCodesResponse.scratchCodes.scratchCode;
	if (scratchCode) {
		var scratchCodeArray = [];
		for (var i = 0; i < scratchCode.length; i++) {
			if (scratchCode[i]._content) {
				scratchCodeArray.push(scratchCode[i]._content);
			}
		}
		if (scratchCodeArray.length === 0) {
			Dwt.setInnerHtml(params.twoStepAuthCodesSpan, ZmMsg.twoStepAuthOneTimeCodesEmpty);
			Dwt.setDisplay(params.twoStepAuthCodesViewLink, Dwt.DISPLAY_NONE);
			Dwt.setDisplay(params.twoStepAuthCodesGenerateLink, "");
		}
		else {
			Dwt.setInnerHtml(params.twoStepAuthCodesSpan, AjxMessageFormat.format(ZmMsg.twoStepAuthOneTimeCodesCount, scratchCodeArray.length));
			Dwt.setDisplay(params.twoStepAuthCodesViewLink, "");
			Dwt.setDisplay(params.twoStepAuthCodesGenerateLink, Dwt.DISPLAY_NONE);
		}
		if (callback) {
			callback(scratchCodeArray);
		}
	}
};

ZmAccountsPage.prototype._getTrustedDevicesCount =
function() {
	var jsonObj = {GetTrustedDevicesRequest : {_jsns : "urn:zimbraAccount"}};
	var respCallback = this._getTrustedDevicesCountCallback.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccountsPage.prototype._getTrustedDevicesCountCallback =
function(result) {
	var response = result && result.getResponse();
	var getTrustedDevicesResponse = response && response.GetTrustedDevicesResponse;
	if (!response || !getTrustedDevicesResponse) {
		return;
	}
	var trustedDevicesCount = 0;
	var trustedDeviceRevokeLink = document.getElementById(this._htmlElId + "_TRUSTED_DEVICE_REVOKE_LINK");
	if (getTrustedDevicesResponse.thisDeviceTrusted) {
		if (trustedDeviceRevokeLink) {
			Dwt.setHandler(trustedDeviceRevokeLink, DwtEvent.ONCLICK, this._handleTrustedDeviceRevokeLink.bind(this));
			Dwt.delClass(trustedDeviceRevokeLink, "ZmLinkDisabled");
		}
		trustedDevicesCount = 1;
	}
	else {
		if (trustedDeviceRevokeLink) {
			Dwt.addClass(trustedDeviceRevokeLink, "ZmLinkDisabled");
		}
	}
	var trustedDevicesRevokeAllLink = document.getElementById(this._htmlElId + "_TRUSTED_DEVICES_REVOKE_ALL_LINK");
	if (getTrustedDevicesResponse.nOtherDevices) {
		if (trustedDevicesRevokeAllLink) {
			Dwt.setHandler(trustedDevicesRevokeAllLink, DwtEvent.ONCLICK, this._handleTrustedDevicesRevokeAllLink.bind(this));
			Dwt.delClass(trustedDevicesRevokeAllLink, "ZmLinkDisabled");
		}
		trustedDevicesCount = trustedDevicesCount + parseInt(getTrustedDevicesResponse.nOtherDevices);
	}
	else {
		if (trustedDevicesRevokeAllLink) {
			Dwt.addClass(trustedDevicesRevokeAllLink, "ZmLinkDisabled");
		}
	}
	var trustedDevicesCountSpan = document.getElementById(this._htmlElId + "_TRUSTED_DEVICES_COUNT");
	Dwt.setInnerHtml(trustedDevicesCountSpan, AjxMessageFormat.format(ZmMsg.trustedDevicesCount, trustedDevicesCount));
};

ZmAccountsPage.prototype._handleTrustedDeviceRevokeLink =
function() {
	var trustedDeviceRevokeLink = document.getElementById(this._htmlElId + "_TRUSTED_DEVICE_REVOKE_LINK");
	//link is currently disabled by CSS pointer-event which will prevent onclick event. For older browsers just check for ZmLinkDisabled class
	if (Dwt.hasClass(trustedDeviceRevokeLink, "ZmLinkDisabled")) {
		return false;
	}
	var msgDialog = appCtxt.getOkCancelMsgDialog();
	msgDialog.setMessage(ZmMsg.revokeTrustedDeviceMsg, DwtMessageDialog.WARNING_STYLE, ZmMsg.revokeTrustedDevice);
	msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._revokeTrustedDevice.bind(this, msgDialog));
	msgDialog.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.revoke);
	msgDialog.popup();
};

ZmAccountsPage.prototype._revokeTrustedDevice =
function(msgDialog) {
	msgDialog.popdown();
	var jsonObj = {RevokeTrustedDeviceRequest : {_jsns : "urn:zimbraAccount"}};
	var respCallback = this._revokeTrustedDeviceCallback.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccountsPage.prototype._revokeTrustedDeviceCallback =
function() {
	this._getTrustedDevicesCount();
};

ZmAccountsPage.prototype._handleTrustedDevicesRevokeAllLink =
function() {
	var trustedDevicesRevokeAllLink = document.getElementById(this._htmlElId + "_TRUSTED_DEVICES_REVOKE_ALL_LINK");
	if (Dwt.hasClass(trustedDevicesRevokeAllLink, "ZmLinkDisabled")) {
		return false;
	}
	var msgDialog = appCtxt.getOkCancelMsgDialog();
	msgDialog.setMessage(ZmMsg.revokeAllTrustedDevicesMsg, DwtMessageDialog.WARNING_STYLE, ZmMsg.revokeAllTrustedDevices);
	msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._revokeOtherTrustedDevices.bind(this, msgDialog));
	msgDialog.getButton(DwtDialog.OK_BUTTON).setText(ZmMsg.revokeAll);
	msgDialog.popup();
};

ZmAccountsPage.prototype._revokeOtherTrustedDevices =
function(msgDialog) {
	msgDialog.popdown();
	var jsonObj = {RevokeOtherTrustedDevicesRequest : {_jsns : "urn:zimbraAccount"}};
	var respCallback = this._revokeOtherTrustedDevicesCallback.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccountsPage.prototype._revokeOtherTrustedDevicesCallback =
function() {
	this._getTrustedDevicesCount();
};

ZmAccountsPage.prototype._getGrants =
function() {
    var jsonObj = {GetRightsRequest:{
        _jsns:"urn:zimbraAccount",
        "ace":[
            {right:ZmSetting.SEND_AS},
            {right:ZmSetting.SEND_ON_BEHALF_OF}
        ]
      }
    };
    var respCallback = this._refreshRights.bind(this);
    appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccountsPage.prototype._dlSelectionListener =
function(opt) {
    this.editDelegateButton.setEnabled(opt);
    this.removeDelegateButton.setEnabled(opt);
}

ZmAccountsPage.prototype.setAccountSecurity =
function() {
	//If two-factor authentication feature is not available just return.
	if (!appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_AVAILABLE)) {
		return;
	}
	//If two-factor authentication is required user cannot see the Enable/Disable two-step authentication link.
	if (!appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_REQUIRED)) {
		var twoStepAuthLink = document.getElementById(this._htmlElId + "_TWO_STEP_AUTH_LINK");
		if (twoStepAuthLink) {
			var paramsObj = {
				twoStepAuthLink : twoStepAuthLink,
				twoStepAuthSpan : Dwt.getElement(this._htmlElId + "_TWO_STEP_AUTH"),
				twoStepAuthCodesContainer : Dwt.getElement(this._htmlElId + "_TWO_STEP_AUTH_CODES_CONTAINER"),
				twoStepAuthEnabledCallback : this.setAccountSecurity.bind(this)
			};
			Dwt.setHandler(twoStepAuthLink, DwtEvent.ONCLICK, this._handleTwoStepAuthLink.bind(this, paramsObj));
		}
	}
	//If two-factor authentication is not enabled just return.
	if (!appCtxt.get(ZmSetting.TWO_FACTOR_AUTH_ENABLED)) {
		return;
	}

	var twoStepAuthCodesSpan = document.getElementById(this._htmlElId + "_TWO_STEP_AUTH_CODES");
	if (twoStepAuthCodesSpan) {
		var twoStepAuthCodesViewLink = document.getElementById(this._htmlElId + "_TWO_STEP_AUTH_CODES_VIEW_LINK");
		var twoStepAuthCodesGenerateLink = document.getElementById(this._htmlElId + "_TWO_STEP_AUTH_CODES_GENERATE_LINK");
		var params = {
			twoStepAuthCodesSpan : twoStepAuthCodesSpan,
			twoStepAuthCodesViewLink : twoStepAuthCodesViewLink,
			twoStepAuthCodesGenerateLink : twoStepAuthCodesGenerateLink
		};
		if (twoStepAuthCodesViewLink) {
			Dwt.setHandler(twoStepAuthCodesViewLink, DwtEvent.ONCLICK, this._handleTwoStepAuthCodesViewLink.bind(this, params));
		}
		if (twoStepAuthCodesGenerateLink) {
			Dwt.setHandler(twoStepAuthCodesGenerateLink, DwtEvent.ONCLICK, ZmAccountsPage.getScratchCodes.bind(window, true, params, false));
		}
		ZmAccountsPage.getScratchCodes(false, params, false);
	}

	if (appCtxt.get(ZmSetting.TRUSTED_DEVICES_ENABLED)) {
		var trustedDevicesCountSpan = document.getElementById(this._htmlElId + "_TRUSTED_DEVICES_COUNT");
		if (trustedDevicesCountSpan) {
			this._getTrustedDevicesCount();
		}
	}

	//Whether app-specific passwords are enabled when two-factor auth is enabled
	if (appCtxt.get(ZmSetting.APP_PASSWORDS_ENABLED)) {
		var applicationCodesElement = document.getElementById(this._htmlElId + "_APPLICATION_CODES");
		if (!applicationCodesElement) {
			return;
		}
		this._getAppSpecificPasswords(applicationCodesElement);

		var addApplicationCodeButton = document.getElementById(this._htmlElId + "_ADD_APPLICATION_CODE");
		if (addApplicationCodeButton) {
			var button = new DwtButton({parent:this, id:"addApplicationCodeBtn"});
			button.setText(ZmMsg.twoStepAuthAddAppCode);
			button.setEnabled(true);
			button.addSelectionListener(new AjxListener(this, this._handleAddApplicationCode));
			button.replaceElement(addApplicationCodeButton);
			this.addApplicationCodeButton = button;
		}

		var revokeApplicationCodeButton = document.getElementById(this._htmlElId+"_REVOKE_APPLICATION_CODE");
		if (revokeApplicationCodeButton) {
			var button = new DwtButton({parent:this, id:"revokeApplicationCodeBtn"});
			button.setText(ZmMsg.twoStepAuthRevokeCode);
			button.setEnabled(false);
			button.addSelectionListener(new AjxListener(this, this._revokeApplicationCode));
			button.replaceElement(revokeApplicationCodeButton);
			this.revokeApplicationCodeButton = button;
		}
	}
};

ZmAccountsPage.prototype.setAccountDelegates =
function() {
    var delegatesEl =   document.getElementById(this._htmlElId+"_DELEGATE_RIGHTS");
    if(!delegatesEl) return;
    this._getGrants(delegatesEl);


    var addDelegateButtonDiv = document.getElementById(this._htmlElId+"_ADD_DELEGATE");
	if (addDelegateButtonDiv) {
		var button = new DwtButton({parent:this, id:"addDelegateBtn"});
		button.setText(ZmMsg.addDelegate);
		button.setEnabled(true);
		button.addSelectionListener(new AjxListener(this, this._handleAddDelegateButton));
        button.replaceElement(addDelegateButtonDiv);
		this.addDelegateButton = button;
	}

    var editDelegateButtonDiv = document.getElementById(this._htmlElId+"_EDIT_DELEGATE");
    if (editDelegateButtonDiv) {
        var button = new DwtButton({parent:this, id:"editDelegateBtn"});
        button.setText(ZmMsg.editPermissions);
        button.setEnabled(false);
        button.addSelectionListener(new AjxListener(this, this._editDelegateButton));
        button.replaceElement(editDelegateButtonDiv);
        this.editDelegateButton = button;
    }

    var removeDelegateButtonDiv = document.getElementById(this._htmlElId+"_REMOVE_DELEGATE");
    if (removeDelegateButtonDiv) {
       var button = new DwtButton({parent:this, id:"removeDelegateBtn"});
       button.setText(ZmMsg.remove);
       button.setEnabled(false);
       button.addSelectionListener(new AjxListener(this, this._removeDelegateButton));
       button.replaceElement(removeDelegateButtonDiv);
       this.removeDelegateButton = button;
    }



}
//
// Public methods
//

ZmAccountsPage.prototype.setAccount =
function(account, skipUpdate, ignoreProvider) {
	// keep track of changes made to current account
	if (this._currentAccount) {
		if (!skipUpdate) {
			this._setAccountFields(this._currentAccount, this._currentSection);
		}
		this._tabGroup.removeMember(this._currentSection.tabGroup);
		this._currentAccount = null;
		this._currentSection = null;
	}

	// toggle delete button
	if (this._deleteButton) {
		var isEnabled = (appCtxt.isOffline)
			? (account && account.type == ZmAccount.TYPE_PERSONA)
			: (account && account.type != ZmAccount.TYPE_ZIMBRA);
        if (account.smtpEnabled) {
            isEnabled = false;
        }
		this._deleteButton.setEnabled(isEnabled);
	}

	// intialize sections
	for (var type in this._sectionDivs) {
		Dwt.setVisible(this._sectionDivs[type], false);
	}

	// HACK: Attempt to get around an IE update issue.
	setTimeout(AjxCallback.simpleClosure(this._setAccount2, this, account, skipUpdate, ignoreProvider),0);
};

ZmAccountsPage.prototype._setAccount2 =
function(account, skipUpdate, ignoreProvider) {
	// NOTE: hide all sections first, then show the specific section b/c some
	// sections use same div. This avoids double inititalization in that case.
	var isExternal = account instanceof ZmDataSource;
	var provider = !ignoreProvider && isExternal && account.getProvider();
	var div = (provider && this._sectionDivs[provider.id]) || this._getSectionDiv(account);
    if (div) {
        this._currentAccount = account;
        Dwt.setVisible(div, true);
        if (appCtxt.isOffline) {
            // bug 48014 - add "Use this persona" section for offline
            if(account.type == ZmAccount.TYPE_PERSONA) {
                this._currentSection = ZmAccountsPage.SECTIONS["PERSONA"];
                this._setPersona(account, this._currentSection);
            } else {
                this._currentSection = ZmAccountsPage.SECTIONS["PRIMARY"];
                this._setZimbraAccount(account, this._currentSection);
            }
        } else {
            switch (account.type) {
                case ZmAccount.TYPE_POP:
                case ZmAccount.TYPE_IMAP: {
                    this._currentSection = provider && ZmAccountsPage.SECTIONS[provider.id];
                    this._currentSection = this._currentSection || ZmAccountsPage.SECTIONS["EXTERNAL"];
                    this._setExternalAccount(account, this._currentSection);
                    if (ignoreProvider) {
                        this._setControlValue("PROVIDER", this._currentSection, "");
                    }
                    if (!skipUpdate) {
                        var password = this._getControlObject("PASSWORD", this._currentSection);
                        if (password) {
                            password.setShowPassword(false);
                        }
                    }
                    break;
                }
                case ZmAccount.TYPE_PERSONA: {
                    this._currentSection = ZmAccountsPage.SECTIONS["PERSONA"];
                    this._setPersona(account, this._currentSection);
                    break;
                }
                default: {
                    this._currentSection = ZmAccountsPage.SECTIONS["PRIMARY"];
                    this._setZimbraAccount(account, this._currentSection);
                    break;
                }
            }
        }
		if (!this._tabGroup.contains(this._currentSection.tabGroup)) {
			this._tabGroup.addMember(this._currentSection.tabGroup);
		}
	}

	// update list cells
	this._updateList(account);

	var control = this._currentSection && this._currentSection.controls[isExternal ? "EMAIL" : "NAME"];

	// When a hidden field is applied focus(), IE throw's an exception.
	// Thus checking for isActive()
	if (control && this.isActive()) {
		control.focus();
	}
};

ZmAccountsPage.prototype.isActive =
function() {
	return (this._controller.getTabView().getActiveView().toString() == this.toString());
};

// ZmPreferencesPage methods

ZmAccountsPage.prototype.showMe =
function() {
	var hasRendered = this.hasRendered; // cache before calling base

	ZmPreferencesPage.prototype.showMe.apply(this, arguments);

	if (!hasRendered) {
		this.reset();
	}
};

ZmAccountsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	// clear current list of accounts
	this._accounts.removeAll();
	this._deletedAccounts = [];
	this._currentAccount = null;
	this._currentSection = null;

	var usedIdentities = {};

	// add zimbra accounts (i.e. family mboxes)
	var mboxes = appCtxt.accountList.getAccounts();
	var active = appCtxt.getActiveAccount();
	for (var j in mboxes) {
		var acct = mboxes[j];
		var ident = acct.getIdentity();
		// NOTE: We create proxies of all of the account objects so that we can
		//       store temporary values while editing.
		if (active.isMain || acct == active) {
			this._accounts.add(ZmAccountsPage.__createProxy(acct));
			if (ident) usedIdentities[ident.id] = true;
		}
	}
	// add data sources unless we're in offline mode
	if (!appCtxt.isOffline && active.isMain) {
		var dataSourceCollection = appCtxt.getDataSourceCollection();
		var dataSources = dataSourceCollection.getItems(); // TODO: rename getItems or rename getIdentities
		for (var i = 0; i < dataSources.length; i++) {
			var datasource = dataSources[i];
			var ident = datasource.getIdentity();
			delete datasource.password;
			this._accounts.add(ZmAccountsPage.__createProxy(datasource));
			if (ident) usedIdentities[ident.id] = true;
		}
	}

	// add identities/personas
	var identityCollection = appCtxt.getIdentityCollection();
	var identities = identityCollection.getIdentities();
	for (var i = 0; i < identities.length; i++) {
		var identity = identities[i];
		if (identity.isDefault || identity.isFromDataSource) continue;
		var id = identity.id;
		if (usedIdentities[id]) continue;
		usedIdentities[id] = true;
		var persona = new ZmPersona(identity);
		this._accounts.add(ZmAccountsPage.__createProxy(persona), null, true);
	}
    var signatureLinkElement = Dwt.getElement(this._htmlElId + "_External_Signatures_Link");
    Dwt.setHandler(signatureLinkElement, DwtEvent.ONCLICK, function(){skin.gotoPrefs("SIGNATURES")});
	// initialize list view
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	var account = this._accounts.get(0);
	this._resetAccountListView(account);
	this.setAccount(account);
	this.setAccountSecurity();
    this.setAccountDelegates();
};

// saving

ZmAccountsPage.prototype.isDirty =
function() {
	// make sure that the current object proxy is up-to-date
	this._setAccountFields(this._currentAccount, this._currentSection, true);

	var printAcct = function(acct) {
		if (AjxUtil.isArray(acct)) {
			return AjxUtil.map(acct, printAcct).join("\n");
		}
		return ["name: ",acct.name,", id: ",acct.id].join("");
	}

	var dirty = this._deletedAccounts.length > 0;
	if (dirty) {
		AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\n" + "Deleted accounts:\n" + printAcct(this._deletedAccounts));
	}
	if (!dirty) {
		var accounts = this._accounts.getArray();
		var dirtyAccounts = [];
		for (var i = 0; i < accounts.length; i++) {
			var account = accounts[i];
			if (account._new || account._dirty || account._visibleDirty) {
				dirty = true;
				dirtyAccounts.push(account);
			}
		}
		if (dirty) {
			AjxDebug.println(AjxDebug.PREFS, "Dirty preferences:\n" + "Dirty accounts:\n" + printAcct(dirtyAccounts));
		}
	}
	return dirty;
};

/**
 * Does minimal checking:
 * <li>bug 21104: persona name and the associated display value for the From address
 * <li>bug 950: email addresses
 */
ZmAccountsPage.prototype.validate =
function() {
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		var type = account.type;
		var isPrimary = type == ZmAccount.TYPE_ZIMBRA;
		var isExternal = type == ZmAccount.TYPE_POP || type == ZmAccount.TYPE_IMAP;
		var isPersona = type == ZmAccount.TYPE_PERSONA;

		// bug 21104
		if (isPersona && (account._new || account._dirty) && 
			!(account.identity && account.identity.name)) {
			this._errorMsg = ZmMsg.invalidPersonaName;
			return false;
		}
		// bug 950
		if (isExternal && !this.__validateEmail(this.__getAccountValue(account, "EMAIL"))) {
			return false;
		}
		if (this.__getIdentityValue(account, "REPLY_TO") &&
			!this.__validateEmail(this.__getIdentityValue(account, "REPLY_TO_EMAIL"))) {
			return false;
		}
		if (isExternal && !this.__validateEmail(this.__getIdentityValue(account, "FROM_EMAIL"))) {
			return false;
		}
		if (isPersona && this.__getIdentityValue(account, "WHEN_SENT_TO") &&
			!this.__validateEmailList(this.__getIdentityValue(account, "WHEN_SENT_TO_LIST"))) {
			return false;
		}
		if ( AjxUtil.isEmpty(this.__getIdentityValue(account, "FROM_NAME")) &&
		    !AjxUtil.isEmpty(appCtxt.get(ZmSetting.DISPLAY_NAME))) {
			this._errorMsg = ZmMsg.missingEmailDisplayName;
			return false;
		}
	}
	return true;
};

ZmAccountsPage.prototype.__getAccountValue =
function(account, id) {
	var prop = ZmAccountsPage.ACCOUNT_PROPS[id];
	if (!prop) return;
	return (typeof prop == "string") ? account[prop] : account[prop.getter]();
};

ZmAccountsPage.prototype.__getIdentityValue =
function(account, id) {
	var prop = ZmAccountsPage.IDENTITY_PROPS[id];
	if (!prop) return;
	var identity = account.getIdentity();
	return identity && (typeof prop == "string" ? identity[prop] : identity[prop]());
};

ZmAccountsPage.prototype.__validateEmail =
function(s) {
	if (!ZmPref.validateEmail(s)) {
		this._errorMsg = AjxStringUtil.htmlEncode(AjxMessageFormat.format(ZmMsg.invalidEmail, [s]));
		return false;
	}
	return true;
};

ZmAccountsPage.prototype.__validateEmailList =
function(l) {
	var ss = String(l).split(/[,;]/);
	for (var i = 0; i < ss.length; i++) {
		var valid = this.__validateEmail(ss[i]);
		if (!valid) return false;
	}
	return true;
};

ZmAccountsPage.prototype.getErrorMessage =
function() {
	return this._errorMsg;
};

ZmAccountsPage.prototype.getPreSaveCallback =
function() {
	return new AjxCallback(this, this._preSave);
};

ZmAccountsPage.prototype.getPostSaveCallback =
function() {
	return new AjxCallback(this, this._postSave);
};

ZmAccountsPage.prototype.addCommand =
function(batchCmd) {
	// make sure that the current object proxy is up-to-date
	// NOTE: This is already done so don't do it again or else we'll
	// NOTE: lose the folderId from the create/rename folder op.
	//this._setAccountFields(this._currentAccount, this._currentSection);

	// delete accounts
	for (var i = 0; i < this._deletedAccounts.length; i++) {
		var callback = null;
		var account = this._deletedAccounts[i];
		var folderId = account.folderId;
		if (folderId == ZmAccountsPage.DOWNLOAD_TO_FOLDER || folderId != ZmAccountsPage.DOWNLOAD_TO_INBOX) {
			var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
			var name = account.getName();
			var folder = root.getByName(name);
			if (folder && !folder.isSystem()) {
				callback = new AjxCallback(this, this._promptToDeleteFolder, [folder]);
			}
		}
		this._deletedAccounts[i].doDelete(callback, null, batchCmd);
	}

	// for multi-account mbox, check if user changed visible flag on subaccounts
	if (appCtxt.accountList.size(true) > 1) {
		this._saveVisibleAccounts(batchCmd);
	}

	// modify existing accounts
	var newAccounts = [];
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account._new) {
			newAccounts.push(account);
			continue;
		}

		if (account._dirty) {
			var callback = new AjxCallback(this, this._handleSaveAccount, [account]);
			account.save(callback, null, batchCmd);
		}
	}

	// add new accounts
	for (var i = 0; i < newAccounts.length; i++) {
		var account = newAccounts[i];
		var callback = new AjxCallback(this, this._handleCreateAccount, [account]);
		account.create(callback, null, batchCmd);
	}

	// refresh display after all is done
	var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	var callback = new AjxCallback(this, this.reset);
	batchCmd.addNewRequestParams(soapDoc, callback);
};

//
// Protected methods
//

ZmAccountsPage.prototype._testAccounts =
function(accounts, okCallback, cancelCallback) {
	this._controller.getTestDialog().popup(accounts, okCallback, cancelCallback);
};

// set controls based on account

ZmAccountsPage.prototype._setZimbraAccount =
function(account, section) {
	this._setGenericFields(account, section);
	this._setIdentityFields(account, section);
	if (appCtxt.isFamilyMbox) {
		this._setControlEnabled("VISIBLE", section, !account.isMain);
	}
};

ZmAccountsPage.prototype._setExternalAccount =
function(account, section) {
	this._setGenericFields(account, section);
	this._setDataSourceFields(account, section);
	this._setIdentityFields(account, section);
	if (this._setControlVisible("ALERT", section, !account.isStatusOk())) {
		var alert = section.controls["ALERT"];
		alert.setStyle(DwtAlert.CRITICAL);
		alert.setTitle(account.failingSince ? ZmMsg.dataSourceFailureTitle : ZmMsg.accountInactiveTitle);
		alert.setContent(account.lastError || ZmMsg.accountInactiveContent);
	}
};

ZmAccountsPage.prototype._setPersona =
function(account, section) {
	this._setGenericFields(account, section);
	this._setIdentityFields(account, section);
};

ZmAccountsPage.prototype._setGenericFields =
function(account, section) {
	this._setControlValue("NAME", section, account.getName());
	this._setControlValue("HEADER", section, account.getName());
	this._setControlValue("EMAIL", section, account.getEmail());
	this._setControlValue("VISIBLE", section, account.visible);
};

ZmAccountsPage.prototype._setDataSourceFields =
function(account, section) {
	var isSsl = account.connectionType == ZmDataSource.CONNECT_SSL;
	var isInbox = account.folderId == ZmOrganizer.ID_INBOX;
	var isPortChanged = account.port != account.getDefaultPort();
    var isSmtpEnabled = account.smtpEnabled;

	this._setControlValue("ACCOUNT_TYPE", section, account.type);
	this._setControlEnabled("ACCOUNT_TYPE", section, account._new);
	this._setControlValue("USERNAME", section, account.userName);
	this._setControlValue("HOST", section, account.mailServer);
	this._setControlValue("PASSWORD", section, account.password);
	this._setControlValue("SSL", section, isSsl);
	this._setControlEnabled("TEST", section, true);
	this._setDownloadToFolder(account);
	this._setControlValue("DELETE_AFTER_DOWNLOAD", section, account.leaveOnServer);
	this._setControlValue("CHANGE_PORT", section, isPortChanged);
	this._setControlEnabled("PORT", section, isPortChanged);
	this._setPortControls(account.type, account.connectionType, account.port);

	var provider = account.getProvider();
	this._setControlValue("PROVIDER", section, provider ? provider.id : "");
	this._setControlVisible("PROVIDER", section, AjxUtil.keys(ZmDataSource.getProviders()).length > 0);
    this._setExternalSectionControlsView(section, !isSmtpEnabled);
};

ZmAccountsPage.prototype._setDownloadToFolder =
function(account) {
	var section = this._currentSection;
	var radioGroup = section.controls["DOWNLOAD_TO"];
	if (!radioGroup) return;

	var pref = ZmAccountsPage.PREFS["DOWNLOAD_TO"];
	var options = pref.options;
	var displayOptions = pref.displayOptions;
	var pattern = displayOptions[options[0] == ZmAccountsPage.DOWNLOAD_TO_INBOX ? 1 : 0];
	var name = AjxStringUtil.htmlEncode(this._getControlValue("NAME", section));
	var text = AjxMessageFormat.format(pattern, name);

	var radioButton = radioGroup.getRadioButtonByValue(ZmAccountsPage.DOWNLOAD_TO_FOLDER);
	radioButton.setText(text);

	var isImap = account.type == ZmAccount.TYPE_IMAP;
	var isInbox = !isImap && account.folderId == ZmOrganizer.ID_INBOX;
	var value = isInbox ? ZmAccountsPage.DOWNLOAD_TO_INBOX : ZmAccountsPage.DOWNLOAD_TO_FOLDER;
	this._setControlValue("DOWNLOAD_TO", section, value);
	this._setControlEnabled("DOWNLOAD_TO", section, !isImap);
};

ZmAccountsPage.prototype._setPortControls =
function(accountType, connectionType, accountPort) {
	var isPop = accountType == ZmAccount.TYPE_POP;
	var isSsl = connectionType == ZmDataSource.CONNECT_SSL;

	var section = this._currentSection;
	this._setControlValue("PORT", section, accountPort);
	this._setControlEnabled("DELETE_AFTER_DOWNLOAD", section, isPop);

	this._setControlEnabled("DOWNLOAD_TO", section, isPop);
	// imap is never allowed in inbox
	if (!isPop) {
		this._setControlValue("DOWNLOAD_TO", section, ZmAccountsPage.DOWNLOAD_TO_FOLDER);
	}

	var portTypeLabel = AjxMessageFormat.format(ZmAccountsPage.PREFS["CHANGE_PORT"].displayName, accountType);
	this._setControlLabel("CHANGE_PORT", section, portTypeLabel);

	var defaultPort = isPop ? ZmPopAccount.PORT_CLEAR : ZmImapAccount.PORT_CLEAR;
	if (isSsl) {
		defaultPort = isPop ? ZmPopAccount.PORT_SSL : ZmImapAccount.PORT_SSL;
	}
	var defaultPortLabel = AjxMessageFormat.format(ZmAccountsPage.PREFS["PORT_DEFAULT"].displayName, defaultPort);
	this._setControlLabel("PORT_DEFAULT", section, defaultPortLabel);
};

ZmAccountsPage.prototype._setIdentityFields =
function(account, section) {
	var identity = account.getIdentity();

	this._setControlValue("FROM_NAME", section, identity.sendFromDisplay);
    this._setControlValue("FROM_EMAIL", section, (identity.sendFromAddressType == ZmSetting.SEND_ON_BEHALF_OF) ? ZmMsg.onBehalfOfMidLabel + " " + identity.sendFromAddress : identity.sendFromAddress);
    this._setControlValue("FROM_EMAIL_TYPE", section, identity.sendFromAddressType);
    this._setControlValue("REPLY_TO", section, identity.setReplyTo);
	this._setControlValue("REPLY_TO_NAME", section, identity.setReplyToDisplay);
	this._setControlValue("REPLY_TO_EMAIL", section, identity.setReplyToAddress);
	this._setControlValue("READ_RECEIPT_TO_ADDR", section, identity.readReceiptAddr);
	this._setControlValue("WHEN_SENT_TO", section, identity.useWhenSentTo);
	this._setControlValue("WHEN_SENT_TO_LIST", section, identity.whenSentToAddresses);
	this._setControlValue("WHEN_IN_FOLDER", section, identity.useWhenInFolder);
	this._setControlValue("WHEN_IN_FOLDER_LIST", section, identity.whenInFolderIds);

	this._setReplyToControls();
	this._setWhenSentToControls();
	this._setWhenInFolderControls();
};

ZmAccountsPage.prototype._saveVisibleAccounts =
function(batchCmd) {
	var accounts = this._accounts.getArray();
	var visibilityChanged = false;

	// check if visibility changed for any sub accounts
	for (var i = 0; i < accounts.length; i++) {
		if (accounts[i]._visibleDirty) {
			visibilityChanged = true;
			break;
		}
	}

	// collect *all* visible accounts for ModifyPrefsRequest and add to batchCmd
	if (visibilityChanged) {
		var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
		var setting = appCtxt.getSettings().getSetting(ZmSetting.CHILD_ACCTS_VISIBLE);
		var foundVisible = false;
		for (var j = 0; j < accounts.length; j++) {
			var account = accounts[j];
			if (!account.isMain && account.visible) {
				var node = soapDoc.set("pref", account.id);
				node.setAttribute("name", setting.name);
				foundVisible = true;
			}
		}
		// user unset visible for all accounts - send empty value
		if (!foundVisible) {
			var node = soapDoc.set("pref", "");
			node.setAttribute("name", setting.name);
		}
		var callback = new AjxCallback(this, this._handleSaveVisibleAccount);
		batchCmd.addNewRequestParams(soapDoc, callback);
	}
};

ZmAccountsPage.prototype._setReplyToControls =
function() {
	var section = this._currentSection;
	var replyTo = this._getControlValue("REPLY_TO", section);

	this._setControlEnabled("REPLY_TO_NAME", section, replyTo);
	this._setControlEnabled("REPLY_TO_EMAIL", section, replyTo);
};

ZmAccountsPage.prototype._setWhenSentToControls =
function() {
	var section = this._currentSection;
	var whenSentTo = this._getControlValue("WHEN_SENT_TO", section);

	this._setControlEnabled("WHEN_SENT_TO_LIST", section, whenSentTo);
};

ZmAccountsPage.prototype._setWhenInFolderControls =
function() {
	var section = this._currentSection;
	var whenInFolder = this._getControlValue("WHEN_IN_FOLDER", section);

	this._setControlEnabled("WHEN_IN_FOLDER_LIST", section, whenInFolder);
	this._setControlEnabled("WHEN_IN_FOLDER_BUTTON", section, whenInFolder);
};

ZmAccountsPage.prototype._setControlLabel =
function(id, section, value) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!control || !setup) return;

	switch (setup.displayContainer) {
		case ZmPref.TYPE_STATIC:
		case ZmPref.TYPE_CHECKBOX: {
			control.setText(value);
			break;
		}
	}
};

ZmAccountsPage.prototype._getControlObject =
function(id, section) {
	return section && section.controls[id];
};

ZmAccountsPage.prototype._setControlValue =
function(id, section, value) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!setup) return;
	if (!control) {
		setup.value = value;
		return;
	}

	if (setup.displayFunction) {
		value = setup.displayFunction(value);
	}
	if (id == "DELETE_AFTER_DOWNLOAD") {
		value = !value;
	}
	else if (id == "WHEN_SENT_TO_LIST") {
		value = value ? value.join(", ") : "";
	}
	else if (id == "WHEN_IN_FOLDER_LIST") {
		var tree = appCtxt.getTree(ZmOrganizer.FOLDER);
		var folderIds = value;
		var array = [value];
		var seenComma = false;
		for (var i = 0; i < folderIds.length; i++) {
			var fid = folderIds[i];
			var searchPath = array[i] = tree.getById(fid).getSearchPath();
			seenComma = seenComma || searchPath.match(/,/);
		}
		value = AjxUtil.uniq(array).join(seenComma ? "; " : ", ");
	}

	switch (setup.displayContainer) {
		case ZmPref.TYPE_STATIC: {
			var message = setup.displayName ? AjxMessageFormat.format(setup.displayName, value) : value;
			control.setText(message);
			break;
		}
		case ZmPref.TYPE_CHECKBOX: {
			control.setSelected(value);
			break;
		}
		case ZmPref.TYPE_INPUT:
		case ZmPref.TYPE_COMBOBOX: {
			control.setValue(value);
			break;
		}
		case ZmPref.TYPE_SELECT:
		case ZmPref.TYPE_RADIO_GROUP: {
			control.setSelectedValue(value, true);
			break;
		}
	}
};

ZmAccountsPage.prototype._getControlValue =
function(id, section) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!setup) return null;
	if (!control) {
		return setup.value || (id == "DOWNLOAD_TO" && ZmAccountsPage.DOWNLOAD_TO_FOLDER);
	}

	var value = null;
	if (id == "WHEN_SENT_TO_LIST") {
		var array = AjxEmailAddress.parseEmailString(control.getValue()).all.getArray();
		for (var i = 0; i < array.length; i++) {
			array[i] = array[i].address;
		}
		value = array;
	}
	else if (id == "WHEN_IN_FOLDER_LIST") {
		var tree = appCtxt.getTree(ZmOrganizer.FOLDER);
		var root = tree.getById(ZmOrganizer.ID_ROOT);

		var folderPaths = control.getValue().replace(/\s*(;|,)\s*/g,"$1").split(/;|,/);
		var array = [];
		for (var i = 0; i < folderPaths.length; i++) {
			var folder = root.getByPath(folderPaths[i],true);
			if (!folder) continue;
			array.push(folder.id);
		}
		value = array;
	}
	else if (id == "DELETE_AFTER_DOWNLOAD") {
		value = !control.isSelected();
	}
	else {
		switch (setup.displayContainer) {
			case ZmPref.TYPE_STATIC: {
				value = control.getText();
				break;
			}
			case ZmPref.TYPE_CHECKBOX: {
				value = control.isSelected();
				if (setup.options) {
					value = setup.options[Number(value)];
				}
				break;
			}
			case ZmPref.TYPE_RADIO_GROUP: {
				value = control.getSelectedValue();
				break;
			}
			case ZmPref.TYPE_INPUT:
			case ZmPref.TYPE_SELECT: {
				value = control.getValue();
				break;
			}
			case ZmPref.TYPE_COMBOBOX: {
				value = control.getValue() || control.getText();
				break;
			}
		}
	}

	return setup.valueFunction ? setup.valueFunction(value) : value;
};

ZmAccountsPage.prototype._setControlVisible =
function(id, section, visible) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (control) control.setVisible(visible);
	var el = document.getElementById([this._htmlElId, section.id, id, "row"].join("_"));
	if (el) Dwt.setVisible(el, visible);
	return control || el ? visible : false;
};

ZmAccountsPage.prototype._setControlEnabled =
function(id, section, enabled) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!control || !setup) return;

	control.setEnabled(enabled);
};

/**
 * If selected datasource has attr smtpEnabled to true, make the external controls
 * readOnly else editable.
 */

ZmAccountsPage.prototype._setExternalSectionControlsView =
function(section, toEnable) {
    var prefs,
        prefsLen,
        i,
        pref,
        signatureLinkElement,
        signatureTextSpan;

    prefs = section.prefs; // external sections prefs.
    prefsLen = prefs.length;
    signatureLinkElement = Dwt.getElement(this._htmlElId + "_External_Signatures_Link");
    signatureTextSpan    = Dwt.getElement(this._htmlElId + "_External_Signatures_Text");

    for (i = 0; i < prefsLen; i++) {
        pref = prefs[i];
        this._setControlEnabled(pref, section, toEnable); // Disable/enable external section pref, depending on the boolean value of attr smtpEnabled in selected Data Source.
    }
    if (toEnable) {
        Dwt.setVisible(signatureLinkElement,true);
        Dwt.setVisible(signatureTextSpan,false);
    }
    else {
        Dwt.setVisible(signatureLinkElement,false);
        Dwt.setVisible(signatureTextSpan,true);
    }
};

ZmAccountsPage.prototype._setAccountFields =
function(account, section, dontClearFolder) {
	if (!account || !section) return;

	for (var id in ZmAccountsPage.ACCOUNT_PROPS) {
		var control = section.controls[id];
		if (!control) {
			// HACK: default to new folder if control not available
			if (id == "DOWNLOAD_TO" && !dontClearFolder) {
				account.folderId = ZmAccountsPage.DOWNLOAD_TO_FOLDER; 
			}
			continue;
		}

		var prop = ZmAccountsPage.ACCOUNT_PROPS[id];
		var isField = AjxUtil.isString(prop);

		var ovalue = isField ? account[prop] : account[prop.getter]();
		var nvalue = this._getControlValue(id, section);
		if (this._valuesEqual(ovalue, nvalue)) continue;

		// special case: download-to
		if (id == "DOWNLOAD_TO" &&
		    ovalue != ZmOrganizer.ID_INBOX && nvalue != ZmOrganizer.ID_INBOX) {
			continue;
		}

		// handling visible is special
		if (id == "VISIBLE") {
			account._visibleDirty = true;
		} else {
			account._dirty = true;
		}

		if (AjxUtil.isString(prop)) {
			account[prop] = nvalue;
		}
		else {
			account[prop.setter](nvalue);
		}
	}

	var identity = account.getIdentity();
	for (var id in ZmAccountsPage.IDENTITY_PROPS) {
		var control = section.controls[id];
		if (!control) { continue; }

		var prop = ZmAccountsPage.IDENTITY_PROPS[id];
		var isField = AjxUtil.isString(prop);

		var ovalue = (isField ? identity[prop] : identity[prop.getter]())|| "";
		var nvalue = (this._getControlValue(id, section))||"";
        if (id == "FROM_EMAIL" && identity.sendFromAddressType == ZmSetting.SEND_ON_BEHALF_OF) ovalue = ZmMsg.sendOnBehalfOf + " " + ovalue;

        if (this._valuesEqual(ovalue, nvalue)) { continue; }

        if (id == "FROM_EMAIL" && nvalue.indexOf(ZmMsg.sendOnBehalfOf + " ") == 0) {
            nvalue = nvalue.replace(ZmMsg.sendOnBehalfOf + " ", "");
            identity.sendFromAddressType = ZmSetting.SEND_ON_BEHALF_OF;
        } else {
            identity.sendFromAddressType = ZmSetting.SEND_AS;
        }

		account._dirty = true;
		if (isField) {
			identity[prop] = nvalue;
		}
		else {
			identity[prop.setter](nvalue);
		}
	}
};

ZmAccountsPage.prototype._valuesEqual =
function(ovalue, nvalue) {
	if (AjxUtil.isArray(ovalue) && AjxUtil.isArray(nvalue)) {
		if (ovalue.length != nvalue.length) {
			return false;
		}
		var oarray = [].concat(ovalue).sort();
		var narray = [].concat(nvalue).sort();
		for (var i = 0; i < oarray.length; i++) {
			if (oarray[i] != narray[i]) {
				return false;
			}
		}
		return true;
	}
	return ovalue == nvalue;
};

// init ui

ZmAccountsPage.prototype._initControl =
function(id, setup, value, section) {
	ZmPreferencesPage.prototype._initControl.apply(this, arguments);
	if (id == "PROVIDER" && !setup.options) {
		var providers = AjxUtil.values(ZmDataSource.getProviders());
		providers.sort(ZmAccountsPage.__BY_PROVIDER_NAME);
		providers.unshift( { id: "", name: "Custom" } ); // TODO: i18n

		var options = new Array(providers.length);
		var displayOptions = new Array(providers.length);
		for (var i = 0; i < providers.length; i++) {
			var provider = providers[i];
			options[i] = provider.id;
			displayOptions[i] = provider.name;
		}

		setup.options = options;
		setup.displayOptions = displayOptions;
	}
};

ZmAccountsPage.prototype._setupInput =
function(id, setup, value) {
	if (id == "PASSWORD") {
		var input = new DwtPasswordField({ parent: this });
		input.setValue(value);
		this.setFormObject(id, input);
		return input;
	}
	var input = ZmPreferencesPage.prototype._setupInput.apply(this, arguments);
	switch (id) {
		case "NAME": {
			input.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleNameChange));
			break;
		}
		case "HOST": {
			input.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleHostChange));
			break;
		}
		case "EMAIL": {
			input.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleEmailChange));
			break;
		}
		case "USERNAME": {
			input.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleUserNameChange));
			break;
		}
		case "WHEN_SENT_TO_LIST": {
			input.setHint(appCtxt.get(ZmSetting.USERNAME));
			break;
		}
	}
	return input;
};

ZmAccountsPage.prototype._setupCheckbox =
function(id, setup, value) {
	var checkbox = ZmPreferencesPage.prototype._setupCheckbox.apply(this, arguments);
	if (id == "SSL") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleTypeOrSslChange));
	}
	else if (id == "CHANGE_PORT") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleChangePort));
	}
	else if (id == "REPLY_TO") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleReplyTo));
	}
	else if (id == "WHEN_SENT_TO") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleWhenSentTo));
	}
	else if (id == "WHEN_IN_FOLDER") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleWhenInFolder));
	}
	return checkbox;
};

ZmAccountsPage.prototype._setupRadioGroup =
function(id, setup, value) {
	var container = ZmPreferencesPage.prototype._setupRadioGroup.apply(this, arguments);
	if (id == "ACCOUNT_TYPE") {
		var radioGroup = this.getFormObject("ACCOUNT_TYPE");
		radioGroup.addSelectionListener(new AjxListener(this, this._handleTypeChange));
	}
	return container;
};

ZmAccountsPage.prototype._setSelectFromLabels =
function( displayOptions, fromAddress){
 if (!this._selectFromLabels){
    var tmpArray1 = [];
    var tmpArray2 = [];
    var email  = null;
    var index = -1;
     // Add sendOnBehalfOf emails
    for (var i=0;i < appCtxt.sendOboEmails.length; i++){
      email = appCtxt.sendOboEmails[i].addr;
      index = -1;
      if (index = AjxUtil.indexOf(fromAddress,email) != -1)
          fromAddress.splice(index, 1);
      if (index = AjxUtil.indexOf(displayOptions,email) != -1)
           displayOptions.splice(index, 1);
      tmpArray2.push({label:(ZmMsg.sendOnBehalfOf + " " + email), value:(ZmMsg.sendOnBehalfOf + " " + email)});
    }

    // Add sendAs emails
    for (var i=0;i < appCtxt.sendAsEmails.length; i++){
      email = appCtxt.sendAsEmails[i].addr;
      index = -1;
      if ((index = AjxUtil.indexOf(fromAddress,email)) != -1)
          fromAddress.splice(index, 1);
      if ((index = AjxUtil.indexOf(displayOptions,email)) != -1)
           displayOptions.splice(index, 1);
      tmpArray2.push({label:email, value:email});
    }


    if (fromAddress && fromAddress.length)
        fromAddress = fromAddress.sort();

    if (displayOptions && displayOptions.length)
        displayOptions = displayOptions.sort();

    displayOptions = AjxUtil.mergeArrays(displayOptions, fromAddress);

    var length = displayOptions.length;
    for (var i=0;i<length; i++){
        tmpArray1.push({label:displayOptions[i], value:displayOptions[i]});
    }
    this._selectFromLabels =  tmpArray1.concat(tmpArray2);
 }
 return this._selectFromLabels;
};


ZmAccountsPage.prototype._setupSelect =
function(id, setup, value) {
	var select;
	if (id == "FROM_EMAIL") {
		setup.displayOptions = this._getAllAddresses();
		var fromAddress = appCtxt.get(ZmSetting.MAIL_FROM_ADDRESS);
        setup.options = this._setSelectFromLabels(setup.displayOptions, fromAddress );
        setup.choices = setup.options;
		if (appCtxt.get(ZmSetting.ALLOW_ANY_FROM_ADDRESS)) {
			select = this._setupComboBox(id, setup, value);
			// By setting the setSelectedValue method on the combox
			// box, it fakes the setter method of a DwtSelect.
			select.setSelectedValue = select.setValue;
			// NOTE: For this control, we always want the text value 
			select.getValue = select.getText;
		}
	}
	else if (setup.displayOptions && setup.displayOptions.length < 2) {
		select = this._setupInput(id, setup, value);
		select.setEnabled(false);
		select.setSelectedValue = select.setValue;
	}
	if (!select) {
		select = ZmPreferencesPage.prototype._setupSelect.apply(this, arguments);
	}
	if (id == "PROVIDER") {
		select.addChangeListener(new AjxListener(this, this._handleProviderChange));
	}
	return select;
};

ZmAccountsPage.__BY_PROVIDER_NAME = function(a, b) {
	if (a.name.match(/^zimbra/i)) return -1;
	if (b.name.match(/^zimbra/i)) return  1;
	if (a.name.match(/^yahoo/i)) return -1;
	if (b.name.match(/^yahoo/i)) return  1;
	return a.name.localeCompare(b.name);
};

ZmAccountsPage.prototype._setupComboBox =
function(id, setup, value) {
	if (id == "REPLY_TO_EMAIL") {
		var addresses = this._getAllAddresses();
		var accounts = [].concat(appCtxt.getDataSourceCollection().getImapAccounts(), appCtxt.getDataSourceCollection().getPopAccounts());
		addresses = this._getAddressesFromAccounts(accounts, addresses, true, true);
		setup.displayOptions = addresses;
	}
	return ZmPreferencesPage.prototype._setupComboBox.apply(this, arguments);
};

ZmAccountsPage.prototype._updateComboBox =
function(id, extras) {
	var dwtElement = this.getFormObject(id);
	if (dwtElement && AjxUtil.isFunction(dwtElement.removeAll) && AjxUtil.isFunction(dwtElement.add)) {
		if (id == "REPLY_TO_EMAIL") {
			if (!AjxUtil.isArray(extras))
				extras = AjxUtil.isString(extras) ? [extras] : [];

			var addresses = this._getAllAddresses().concat(extras);
			var accounts = this._accounts.getArray();
			addresses = this._getAddressesFromAccounts(accounts, addresses, true, true);
				    
			dwtElement.removeAll();
			for (var i=0; i<addresses.length; i++) {
				dwtElement.add(addresses[i], addresses[i], false);
			}
		}
	}
};





ZmAccountsPage.prototype._setupCustom =
function(id, setup, value) {
	if (id == ZmSetting.ACCOUNTS) {
		// setup list
		var listView = this._accountListView = new ZmAccountsListView(this);
		listView.addSelectionListener(new AjxListener(this, this._handleAccountSelection));
		this.setFormObject(id, listView);

		// setup buttons
		this._setupButtons();

		// setup account sections
		this._setupPrimaryDiv();
		this._setupExternalDiv();
		this._setupPersonaDiv();

		// initialize list
		this._resetAccountListView();

		return listView;
	}
	if (id == "TEST") {
		var button = new DwtButton({parent:this});
		button.setText(setup.displayName);
		button.addSelectionListener(new AjxListener(this, this._handleTestButton));
		return button;
	}
	if (id == "WHEN_IN_FOLDER_BUTTON") {
		var button = new DwtButton({parent:this});
		button.setImage("SearchFolder");
		button.addSelectionListener(new AjxListener(this, this._handleFolderButton));
		return button;
	}
	if (id == "ALERT") {
		return new DwtAlert(this);
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmAccountsPage.prototype._getAllAddresses =
function() {
	var username = appCtxt.get(ZmSetting.USERNAME);
	var addresses = appCtxt.get(ZmSetting.ALLOW_FROM_ADDRESSES);
	var aliases = appCtxt.get(ZmSetting.MAIL_ALIASES);
	return [].concat(username, addresses, aliases);
};

/*
 * Takes a list of accounts and extracts their email addresses
 * @param accounts	array of account objects
 * @param unique	boolean: if true, addresses will be included in output only if they are not already present. Defaults to true
 * @param valid		boolean: if true, performs a validation check on the address and only includes it if it passes. Defaults to true
 * @param addresses	optional array of addresses (as strings) to append to. Defaults to an empty array
*/
ZmAccountsPage.prototype._getAddressesFromAccounts = function(accounts, addresses, unique, valid) {
	if (!AjxUtil.isArray(addresses))
		addresses = [];
	for (var i=0; i<accounts.length; i++) {
		var account = accounts[i];
		if (account.isMain || account.enabled) {
			var address = account.getEmail();
			if (!AjxUtil.isEmpty(address) && (!valid || AjxEmailAddress.isValid(address)) && (!unique || AjxUtil.indexOf(addresses, address, false) == -1)) // Make sure we are not adding an empty address and that we are not adding the address twice
				addresses.push(address);
		}
	}
	return addresses;
};

ZmAccountsPage.prototype._resetAccountListView =
function(accountOrIndex) {
	var accounts = this._accounts.clone();
	var count = accounts.size();
	// NOTE: We go backwards so we don't have to adjust index when we remove an item.
	for (var i = count - 1; i >= 0; i--) {
		var account = accounts.get(i);
		if (account.type == ZmAccount.TYPE_ZIMBRA && !account.isMain && !account.visible) {
			accounts.removeAt(i);
		}
	}
	this._accountListView.set(accounts);
	var account = accountOrIndex;
	if (AjxUtil.isNumber(account)) {
		var index = accountOrIndex;
		var list = this._accountListView.getList();
		var size = list.size();
		if (accountOrIndex >= size) {
			index = size - 1;
		}
		account = list.get(index);
	}
	this._accountListView.setSelection(account || appCtxt.accountList.mainAccount);
	this._updateReplyToEmail();
};

// account buttons

ZmAccountsPage.prototype._setupButtons =
function() {
	var deleteButtonDiv = document.getElementById(this._htmlElId+"_DELETE");
	if (deleteButtonDiv) {
		var button = new DwtButton({parent:this});
		button.setText(ZmMsg.del);
		button.setEnabled(false);
		button.addSelectionListener(new AjxListener(this, this._handleDeleteButton));
		this._replaceControlElement(deleteButtonDiv, button);
		this._deleteButton = button;
	}

	var addExternalButtonDiv = document.getElementById(this._htmlElId+"_ADD_EXTERNAL");
	if (addExternalButtonDiv) {
		var button = new DwtButton({parent:this});
		button.setText(ZmMsg.addExternalAccount);
		button.addSelectionListener(new AjxListener(this, this._handleAddExternalButton));
		this._replaceControlElement(addExternalButtonDiv, button);
		this._addExternalButton = button;
	}

	var addPersonaButtonDiv = document.getElementById(this._htmlElId+"_ADD_PERSONA");
	if (addPersonaButtonDiv) {
		var button = new DwtButton({parent:this});
		button.setText(ZmMsg.addPersona);
		button.addSelectionListener(new AjxListener(this, this._handleAddPersonaButton));
		this._replaceControlElement(addPersonaButtonDiv, button);
		this._addPersonaButton = button;
	}
};

// account sections


ZmAccountsPage.prototype._getSectionDiv =
function(account) {
	return appCtxt.isOffline
		? ((account.type == ZmAccount.TYPE_PERSONA) ? this._sectionDivs[account.type] : this._sectionDivs[ZmAccount.TYPE_ZIMBRA] )
		: this._sectionDivs[account.type];
};

ZmAccountsPage.prototype._setupPrimaryDiv =
function() {
	var div = document.getElementById(this._htmlElId+"_PRIMARY");
	if (div) {
		this._sectionDivs[ZmAccount.TYPE_ZIMBRA] = div;
		this._createSection("PRIMARY", div);
	}
};

ZmAccountsPage.prototype._setupExternalDiv =
function() {
	// setup generic external account div
	var div = document.getElementById(this._htmlElId+"_EXTERNAL");
	if (div) {
		this._sectionDivs[ZmAccount.TYPE_POP] = div;
		this._sectionDivs[ZmAccount.TYPE_IMAP] = div;
		this._createSection("EXTERNAL", div);
	}

	// setup divs for specific providers
	var providers = ZmDataSource.getProviders();
	for (var id in providers) {
		var div = document.getElementById([this._htmlElId, id].join("_"));
		if (!div) continue;
		this._sectionDivs[id] = div;
		this._createSection(id, div);
	}
};

ZmAccountsPage.prototype._setupPersonaDiv =
function() {
	var div = document.getElementById(this._htmlElId+"_PERSONA");
	if (div) {
		this._sectionDivs[ZmAccount.TYPE_PERSONA] = div;
		this._createSection("PERSONA", div);
	}
};

ZmAccountsPage.prototype._createSection =
function(name, sectionDiv) {
	var section = ZmAccountsPage.SECTIONS[name];
	var prefIds = section && section.prefs;
	if (!prefIds) return;

	this._enterTabScope();
	try {
		this._addTabLinks(sectionDiv);

		section.controls = {};

		var prefs = ZmAccountsPage.PREFS;
		for (var i = 0; i < prefIds.length; i++) {
			var id = prefIds[i];
			var setup = prefs[id];
			if (!setup) continue;

			var containerId = [this._htmlElId, name, id].join("_");
			var containerEl = document.getElementById(containerId);
			if (!containerEl) continue;

			this._initControl(id, setup, value, name);

			var type = setup.displayContainer;
			var value = null;
			var control;
			switch (type) {
				case ZmPref.TYPE_STATIC: {
					control = this._setupStatic(id, setup, value);
					break;
				}
				case ZmPref.TYPE_INPUT: {
					control = this._setupInput(id, setup, value);
					break;
				}
				case ZmPref.TYPE_SELECT: {
					control = this._setupSelect(id, setup, value);
					break;
				}
				case ZmPref.TYPE_COMBOBOX: {
					control = this._setupComboBox(id, setup, value);
					break;
				}
				case ZmPref.TYPE_CHECKBOX: {
					control = this._setupCheckbox(id, setup, value);
					break;
				}
				case ZmPref.TYPE_RADIO_GROUP: {
					control = this._setupRadioGroup(id, setup, value);
					break;
				}
				case ZmPref.TYPE_CUSTOM: {
					control = this._setupCustom(id, setup, value);
					break;
				}
				default: continue;
			}

			if (control) {
				if (name == "PRIMARY" && id == "EMAIL") {
					control.setEnabled(false);
				}
				this._replaceControlElement(containerEl, control);
				if (type == ZmPref.TYPE_RADIO_GROUP) {
					control = this.getFormObject(id);
				}
				section.controls[id] = control;
			}
		}

		section.tabGroup = new DwtTabGroup(name);
		this._addControlsToTabGroup(section.tabGroup);
	}
	finally {
		this._exitTabScope();
	}
};

// listeners

ZmAccountsPage.prototype._handleAccountSelection =
function(evt) {
	var account = this._accountListView.getSelection()[0];
	this.setAccount(account);
};

ZmAccountsPage.prototype._handleDeleteButton =
function(evt) {
	var account = this._accountListView.getSelection()[0];
	if (!account._new) {
		account._deleted = true;
		this._deletedAccounts.push(account);
	}
	var index = this._accountListView.getItemIndex(account);
    if (account.type == ZmAccount.TYPE_PERSONA) {
        var personaList = ZmNewPersona.getPersonaList(this._accountListView.getList().getArray());
        var personaListLength = personaList.length;

        // If there's only one persona or the last added persona are being deleted then reset the personal display count.
        if (personaListLength === 1) {
            ZmNewPersona.ID = 0;
        }
        else if (personaListLength === index) {
            if (ZmNewPersona.ID > 0) {
                ZmNewPersona.ID--;
            }
        }
    }

    this._accounts.remove(account);
	this._resetAccountListView(index);
};

ZmAccountsPage.prototype._handleAddExternalButton =
function(evt) {
	var account = new ZmNewDataSource();
	this._accounts.add(account);
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	this._resetAccountListView(account);
};

ZmAccountsPage.prototype._handleAddPersonaButton =
function(evt) {
	var persona = new ZmNewPersona();
	this._accounts.add(persona);
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	this._resetAccountListView(persona);
};

ZmAccountsPage.prototype._updateList =
function(account) {
	var lv = this._accountListView;
    var email = AjxStringUtil.htmlEncode(account.getEmail());
    var identity = account.getIdentity();
    if (!account.isMain && identity && identity.sendFromAddressType == ZmSetting.SEND_ON_BEHALF_OF){
        email = appCtxt.getUsername() + " " + ZmMsg.sendOnBehalfOf + " " + email;
    }

	lv.setCellContents(account, ZmItem.F_NAME, AjxStringUtil.htmlEncode(account.getName()));
	lv.setCellContents(account, ZmItem.F_EMAIL,email);
	lv.setCellContents(account, ZmItem.F_TYPE, AjxStringUtil.htmlEncode(lv._getAccountType(account)));
};

// generic listeners

ZmAccountsPage.prototype._handleNameChange =
function(evt) {
	var inputEl = DwtUiEvent.getTarget(evt);
	var newName = inputEl.value;
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_NAME, AjxStringUtil.htmlEncode(newName));
	this._setControlValue("HEADER", this._currentSection, newName);

	if (this._currentAccount.identity) {
		this._currentAccount.identity.name = newName;
	}

	var type = this._currentAccount.type;
	if (type == ZmAccount.TYPE_POP || type == ZmAccount.TYPE_IMAP) {
		this._setDownloadToFolder(this._currentAccount);
	}
};

ZmAccountsPage.prototype._handleEmailChange =
function(evt) {
	// update email cell
	var section = this._currentSection;
	var email = this._getControlValue("EMAIL", section);
	this._updateEmailCell(email);

	// auto-fill username and host
	var m = email.match(/^(.*?)(?:@(.*))?$/);
	if (!m) return;

	var dataSource = this._currentAccount;
	if (dataSource.userName == "") {
		this._setControlValue("USERNAME", section, m[1]);
	}
	if (m[2] && dataSource.mailServer == "") {
		this._setControlValue("HOST", section, m[2]);
	}
	this._updateReplyToEmail(email);
};

ZmAccountsPage.prototype._updateEmailCell =
function(email) {
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_EMAIL, AjxStringUtil.htmlEncode(email));
};

ZmAccountsPage.prototype._updateReplyToEmail =
function(email) {
	if (AjxEmailAddress.isValid(email)) {
		this._updateComboBox("REPLY_TO_EMAIL", email);
	} else {
		this._updateComboBox("REPLY_TO_EMAIL");
	}
};

// data source listeners

ZmAccountsPage.prototype._handleTypeChange =
function(evt) {
	var type = ZmAccount.getTypeName(this._getControlValue("ACCOUNT_TYPE", this._currentSection));
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_TYPE, AjxStringUtil.htmlEncode(type));
	this._handleTypeOrSslChange(evt);
};

ZmAccountsPage.prototype._handleDownloadTo =
function(evt) {
	var isInbox = this._getControlValue("DOWNLOAD_TO", this._currentSection) == ZmAccountsPage.DOWNLOAD_TO_INBOX;
	this._currentAccount.folderId = isInbox ? ZmOrganizer.ID_INBOX : -1; 
};

ZmAccountsPage.prototype._handleProviderChange =
function() {
	var id = this._getControlValue("PROVIDER", this._currentSection);
	var dataSource = this._currentAccount;

	// initialize data source
	if (id) {
		var provider = ZmDataSource.getProviders()[id];
		if (!provider) return;

		// init default values
		dataSource.reset();
		for (var p in provider) {
			if (p == "id") continue;
			if (p == "type") {
				dataSource.setType(provider[p]);
				continue;
			}
			if (ZmDataSource.DATASOURCE_ATTRS[p]) {
				dataSource[ZmDataSource.DATASOURCE_ATTRS[p]] = provider[p];
			}
		}
	}

	// reset interface
	var skipUpdate = true;
	var ignoreProvider = id == "";
	this.setAccount(dataSource, skipUpdate, ignoreProvider);
};

ZmAccountsPage.prototype._handleTypeOrSslChange =
function(evt) {
	var dataSource = this._currentAccount;
	var section = this._currentSection;
	if (dataSource._new) {
		var type = this._getControlValue("ACCOUNT_TYPE", section);
		if (!type) {
			type = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) ? ZmAccount.TYPE_POP : ZmAccount.TYPE_IMAP;
		}
		dataSource.setType(type);

		var isPop = type == ZmAccount.TYPE_POP;
		this._setControlEnabled("DELETE_AFTER_DOWNLOAD", this._currentSection, isPop);
		this._setControlEnabled("DOWNLOAD_TO", this._currentSection, isPop);
	}

	var ssl = this._getControlValue("SSL", section) == ZmDataSource.CONNECT_SSL;
	dataSource.connectionType = ssl ? ZmDataSource.CONNECT_SSL : ZmDataSource.CONNECT_CLEAR;
	dataSource.port = dataSource.getDefaultPort();
	this._setPortControls(dataSource.type, dataSource.connectionType, dataSource.port);
};

ZmAccountsPage.prototype._handleUserNameChange =
function(evt) {
	var userName = this._getControlValue("USERNAME", this._currentSection);
	this._currentAccount.userName = userName;
	if (!this._getControlValue("EMAIL", this._currentSection)) {
		var provider = ZmDataSource.getProviderForAccount(this._currentAccount);
		var email = userName && provider && provider._host ? [userName,provider._host].join("@") : userName;
		this._updateEmailCell(email);
	}
};

ZmAccountsPage.prototype._handleHostChange =
function(evt) {
	this._currentAccount.mailServer = this._getControlValue("HOST", this._currentSection);
};

ZmAccountsPage.prototype._handleChangePort =
function(evt) {
	this._setControlEnabled("PORT", this._currentSection, evt.detail);
};

ZmAccountsPage.prototype._handleTestButton =
function(evt) {
	var button = evt.item;
	button.setEnabled(false);

	// make sure that the current object proxy is up-to-date
	var dataSource = this._currentAccount;
	this._setAccountFields(dataSource, this._currentSection);

	// check values
	if (!dataSource.userName || !dataSource.mailServer || !dataSource.port) {
		appCtxt.setStatusMsg(ZmMsg.accountTestErrorMissingInfo, ZmStatusView.LEVEL_CRITICAL);
		button.setEnabled(true);
		return;
	}

	// testconnection
	var accounts = [ dataSource ];
	var callback = new AjxCallback(this, this._testFinish, [button]);
	this._testAccounts(accounts, callback, callback);
};

ZmAccountsPage.prototype._testFinish =
function(button) {
	button.setEnabled(true);
};

// identity listeners

ZmAccountsPage.prototype._handleReplyTo =
function(evt) {
	this._setReplyToControls();
};

ZmAccountsPage.prototype._handleWhenSentTo =
function(evt) {
	this._setWhenSentToControls();
};

ZmAccountsPage.prototype._handleWhenInFolder =
function(evt) {
	this._setWhenInFolderControls();
};

ZmAccountsPage.prototype._handleFolderButton =
function(evt) {
	if (!this._folderAddCallback) {
		this._folderAddCallback = new AjxCallback(this, this._handleFolderAdd);
	}
	var dialog = appCtxt.getChooseFolderDialog();
	var params = {overviewId: dialog.getOverviewId(ZmApp.MAIL), appName:ZmApp.MAIL};
	ZmController.showDialog(dialog, this._folderAddCallback, params);
};

ZmAccountsPage.prototype._handleFolderAdd =
function(folder) {
	var section = this._currentSection;
	var folders = this._getControlValue("WHEN_IN_FOLDER_LIST", section);
	if (!folders) return;

	folders.push(folder.id);
	this._setControlValue("WHEN_IN_FOLDER_LIST", section, folders);
	appCtxt.getChooseFolderDialog().popdown();
};

// pre-save callbacks

ZmAccountsPage.prototype._preSave =
function(continueCallback) {
    // make sure that the current object proxy is up-to-date
    this._setAccountFields(this._currentAccount, this._currentSection);

    if (appCtxt.isOffline) {
        // skip account tests  
        this._preSaveCreateFolders(continueCallback);
    } else {
        // perform account tests
        this._preSaveTest(continueCallback);
    }

};

ZmAccountsPage.prototype._preSaveTest =
function(continueCallback) {
	// get dirty external accounts
	var dirtyAccounts = [];
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account.type == ZmAccount.TYPE_POP || account.type == ZmAccount.TYPE_IMAP) {
			if (account._new || account._dirty) {
				dirtyAccounts.push(account);
			}
		}
	}

	// test for invalid name
	for (var i = 0; i < dirtyAccounts.length; i++) {
		var account = dirtyAccounts[i];
		if (account.type == ZmAccount.TYPE_IMAP && account.name.match(/^\s*inbox\s*$/i)) {
			var params = {
				msg: AjxMessageFormat.format(ZmMsg.accountNameReserved, [AjxStringUtil.htmlEncode(account.name)]),
				level: ZmStatusView.LEVEL_CRITICAL
			};
			appCtxt.setStatusMsg(params);
			continueCallback.run(false);
			return;
		}
	}

	// test external accounts
	if (dirtyAccounts.length > 0) {
		var okCallback = new AjxCallback(this, this._preSaveTestOk, [continueCallback, dirtyAccounts]);
		var cancelCallback = new AjxCallback(this, this._preSaveTestCancel, [continueCallback]);
		this._testAccounts(dirtyAccounts, okCallback, cancelCallback);
	}

	// perform next step
	else {
		this._preSaveCreateFolders(continueCallback);
	}
};

ZmAccountsPage.prototype._preSaveTestOk =
function(continueCallback, accounts, successes) {
	// en/disable accounts based on test results 
	for (var i = 0; i < accounts.length; i++) {
		accounts[i].enabled = successes[i];
	}

	// continue
	this._preSaveCreateFolders(continueCallback);
};

ZmAccountsPage.prototype._preSaveTestCancel =
function(continueCallback) {
	if (continueCallback) {
		continueCallback.run(false);
	}
};

ZmAccountsPage.prototype._preSaveCreateFolders =
function(continueCallback) {
	var batchCmd;
	var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account.type == ZmAccount.TYPE_POP || account.type == ZmAccount.TYPE_IMAP) {
			if (account.folderId != ZmOrganizer.ID_INBOX) {
				var name = AjxStringUtil.trim(account.getName());
				if (!batchCmd) { batchCmd = new ZmBatchCommand(false); }

				// avoid folder create if it already exists
				var folder = root.getByName(name, true);
				if (folder) {
					var folderId = folder.id;
					if (folder.type !== ZmId.ORG_FOLDER) {
						if (folder.parent.id == ZmOrganizer.ID_ROOT) {
							//e.g. calendar that's child of root - wouldn't be able to create the folder for the account with that same name. (despite it being mail). So bail.
							var params = {
								msg: AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [AjxStringUtil.htmlEncode(name), ZmMsg[folder.type.toLowerCase()]]),
								level: ZmStatusView.LEVEL_CRITICAL
							};
							appCtxt.setStatusMsg(params);
							continueCallback.run(false);
							return;
						}
						//otherwise this continues on with creating the folder since this folder is not interfering (it's not a root child folder)
					}
					else if (folderId != ZmOrganizer.ID_INBOX && Number(folderId) < 256) {
						var params = {
							msg: AjxMessageFormat.format(ZmMsg.accountNameReserved, [AjxStringUtil.htmlEncode(name)]),
							level: ZmStatusView.LEVEL_CRITICAL
						};
						appCtxt.setStatusMsg(params);
						continueCallback.run(false);
						return;
					}
					// if there already is a folder by this name in Trash, rename the trashed folder
					else if (folder.isInTrash()) {
						folder.rename(folder.name+"_");
					}
					else {
						account.folderId = folder.id;
						continue;
					}
				}

				// this means user modified name of the folder, so let's rename it
				folder = account._object_ && appCtxt.getById(account._object_.folderId);
				if (folder && Number(folder.id) >= 256) {
					if (folder.name != name) {
						var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
						var actionNode = soapDoc.set("action");
						actionNode.setAttribute("op", "rename");
						actionNode.setAttribute("id", folder.id);
						actionNode.setAttribute("name", name);

						var callback = new AjxCallback(this, this._handleRenameFolderResponse, [account, folder]);
						batchCmd.addNewRequestParams(soapDoc, callback, callback);
					}
					else {
						account.folderId = folder.id;
					}
				} else {
					var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
					var folderEl = soapDoc.set("folder");
					folderEl.setAttribute("l", ZmOrganizer.ID_ROOT);
					folderEl.setAttribute("name", name);
					folderEl.setAttribute("fie", "1"); // fetch-if-exists

					var callback = new AjxCallback(this, this._handleCreateFolderResponse, [account]);
					batchCmd.addNewRequestParams(soapDoc, callback, callback);
				}
			}
		}
	}

	// continue
	if (batchCmd && batchCmd.size() > 0) {
		// HACK: Don't know a better way to set an error condition
		this.__hack_preSaveSuccess = true;
		var callback = new AjxCallback(this, this._preSaveFinish, [continueCallback]);
		batchCmd.run(callback);
	}
	else {
		this._preSaveFinish(continueCallback);
	}
};

ZmAccountsPage.prototype._handleCreateFolderResponse =
function(dataSource, result) {
	var resp = result && result._data && result._data.CreateFolderResponse;
	if (resp) {
		dataSource.folderId = ZmOrganizer.normalizeId(resp.folder[0].id);
	}
	else {
		// HACK: Don't know a better way to set an error condition
		this.__hack_preSaveSuccess = false;
	}
};

ZmAccountsPage.prototype._handleRenameFolderResponse =
function(dataSource, folder, result) {
	var resp = result && result._data && result._data.FolderActionResponse;
	if (resp) {
		dataSource.folderId = ZmOrganizer.normalizeId(folder.id);
	}
	else {
		// HACK: Don't know a better way to set an error condition
		this.__hack_preSaveSuccess = false;
	}
};

ZmAccountsPage.prototype._preSaveFinish =
function(continueCallback, result, exceptions) {
	// HACK: Don't know a better way to set an error condition
	continueCallback.run(this.__hack_preSaveSuccess && (!exceptions || exceptions.length == 0));
};

// save callbacks

ZmAccountsPage.prototype._handleSaveAccount =
function(account, resp) {

	delete account._dirty;

	var mboxes = appCtxt.accountList.getAccounts();
	var active = appCtxt.getActiveAccount();

	// Save data from old proxies to proxied objects
	for (var j in mboxes) {
		var acct = mboxes[j];
		if (active.isMain || acct == active) {
			var acct = ZmAccountsPage.__unProxy(mboxes[j]._proxy_);
			if (acct) {
				mboxes[j] = acct;
			}
		}
	}
};

ZmAccountsPage.prototype._handleSaveVisibleAccount =
function() {
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		account._object_.visible = account.visible;
		delete account._visibleDirty;
	}
	var setting = appCtxt.getSettings().getSetting(ZmSetting.CHILD_ACCTS_VISIBLE);
	setting._notify(ZmEvent.E_MODIFY);
};

ZmAccountsPage.prototype._handleCreateAccount =
function(account, resp) {
	delete account._new;
	account._needsSync = true;
};

ZmAccountsPage.prototype._promptToDeleteFolder = function(organizer) {
	var dialog = appCtxt.getConfirmationDialog();
	var prompt = AjxMessageFormat.format(ZmMsg.accountDeleteFolder, [organizer.getName()]);
	var callback = new AjxCallback(this, this._handleDeleteFolder, [organizer]);
	dialog.popup(prompt, callback);
};

ZmAccountsPage.prototype._handleDeleteFolder = function(organizer) {
	var trash = appCtxt.getById(ZmOrganizer.ID_TRASH);
	organizer.move(trash);
};


ZmAccountsPage.prototype._postSave =
function() {
	var needsSync = [];
	var accounts = this._accounts.getArray();
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account._needsSync) {
			needsSync.push(account);
		}
		if (account instanceof ZmDataSource) {
			delete account.password;
		}
	}

	if (needsSync.length) {
	    var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
		for (var i = 0; i < needsSync.length; i++) {
			var account = needsSync[i];
			dsCollection.importMailFor(account.folderId);
			delete account._needsSync;
		}
	}
};

ZmAccountsPage.prototype._handleAddApplicationCode =
function() {
	if (!this._addApplicationCodeDlg) {
		var appPasscodeCallback = this._getAppSpecificPasswords.bind(this);
		this._addApplicationCodeDlg = new ZmApplicationCodeDialog(appPasscodeCallback);
	}
	this._addApplicationCodeDlg.popup();
};

ZmAccountsPage.prototype._revokeApplicationCode =
function() {
	var item = this.appPasscodeList.getSelection()[0];
	if (item) {
		var jsonObj = {RevokeAppSpecificPasswordRequest : {_jsns : "urn:zimbraAccount", appName : item.appName}};
		var respCallback = this._handleRevokeApplicationCode.bind(this);
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

ZmAccountsPage.prototype._handleRevokeApplicationCode =
function() {
	this._getAppSpecificPasswords();
};

ZmAccountsPage.prototype._getAppSpecificPasswords =
function() {
	var jsonObj = {GetAppSpecificPasswordsRequest : {_jsns : "urn:zimbraAccount"}};
	var respCallback = this._getAppSpecificPasswordsCallback.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccountsPage.prototype._getAppSpecificPasswordsCallback =
function(appSpecificPasswords) {
	var applicationCodesElement = document.getElementById(this._htmlElId + "_APPLICATION_CODES") || (this.appPasscodeList && this.appPasscodeList.getHtmlElement());
	var appSpecificPasswordsList = this._setAppSpecificPasswords(appSpecificPasswords);
	if (!appSpecificPasswordsList) {
		appSpecificPasswordsList = new AjxVector();
	}
	var appPasscodeList = new ZmAccountAppPasscodeListView(this);
	this.appPasscodeList = appPasscodeList;
	appPasscodeList.replaceElement(applicationCodesElement);
	appPasscodeList.set(appSpecificPasswordsList);
	appPasscodeList.addSelectionListener(this._appPasscodeSelectionListener.bind(this));
	this.revokeApplicationCodeButton.setEnabled(false);
};

ZmAccountsPage.prototype._setAppSpecificPasswords =
function(appSpecificPasswords) {
	var response = appSpecificPasswords.getResponse();
	if (!response || !response.GetAppSpecificPasswordsResponse) {
		return;
	}
	var appSpecificPasswordsResponse = response.GetAppSpecificPasswordsResponse;
	var passwordData =  appSpecificPasswordsResponse && appSpecificPasswordsResponse.appSpecificPasswords && appSpecificPasswordsResponse.appSpecificPasswords.passwordData;
	if (!passwordData) {
		return;
	}
	var vector = AjxVector.fromArray(passwordData);
	vector.sort(this._compareAppPasscodes);
	return vector;
};

ZmAccountsPage.prototype._compareAppPasscodes =
function(a, b) {
	return a.appName < b.appName ? -1 : (a.appName > b.appName ? 1 : 0);
};

ZmAccountsPage.prototype._appPasscodeSelectionListener =
function() {
	this.revokeApplicationCodeButton.setEnabled(!!this.appPasscodeList.getSelectionCount());
};

//
// Private functions
//

ZmAccountsPage.__ACCOUNT_COMPARATOR =
function(a, b) {
	if (a.type == ZmAccount.TYPE_ZIMBRA && (a.isMain || appCtxt.isOffline)) return -1;
	if (b.type == ZmAccount.TYPE_ZIMBRA && (b.isMain || appCtxt.isOffline)) return 1;
	return a.getName().localeCompare(b.getName());
};

ZmAccountsPage.__createProxy =
function(account) {
	delete account._object_;
	var identity = account.getIdentity();
	var identityProxy = AjxUtil.createProxy(identity);
	var proxy = AjxUtil.createProxy(account);
	proxy._identity = identityProxy;
	account._proxy_ = proxy;
	proxy.getIdentity = AjxCallback.simpleClosure(function(){return this._identity}, proxy, identityProxy);
	return proxy;
};

ZmAccountsPage.__proxy_getIdentity =
function(identity) {
	return identity;
};

ZmAccountsPage.__unProxy =
function(accountProxy) {
	var account = AjxUtil.unProxy(accountProxy);
	if (!account) return accountProxy;
	var identityProxy = accountProxy._identity;
	var identity = AjxUtil.unProxy(identityProxy);
	account.getIdentity = AjxCallback.simpleClosure(ZmAccountsPage.__proxy_getIdentity, account, identity);
	return account;
}

//
// Classes
//

ZmAccountsListView = function(parent, className, posStyle, noMaximize) {
	className = className || "DwtListView";
	className += " ZOptionsItemsListView";
	DwtListView.call(this, {parent:parent, className:className, posStyle:posStyle,
							headerList:this._getHeaderList(), noMaximize:noMaximize});
	this.setMultiSelect(false);
	this._view = ZmId.VIEW_ACCOUNT;
};
ZmAccountsListView.prototype = new DwtListView;
ZmAccountsListView.prototype.constructor = ZmAccountsListView;

ZmAccountsListView.prototype.toString =
function() {
	return "ZmAccountsListView";
};

// Constants

ZmAccountsListView.WIDTH_NAME	= ZmMsg.COLUMN_WIDTH_NAME_ACC;
ZmAccountsListView.WIDTH_STATUS	= ZmMsg.COLUMN_WIDTH_STATUS_ACC;
ZmAccountsListView.WIDTH_TYPE	= ZmMsg.COLUMN_WIDTH_TYPE_ACC;

// Public methods

ZmAccountsListView.prototype.getCellElement =
function(account, field) {
	return document.getElementById(this._getCellId(account, field));
};

ZmAccountsListView.prototype.setCellContents =
function(account, field, html) {
	var el = this.getCellElement(account, field);
	if (!el) { return; }

	if (field == ZmItem.F_NAME) {
		el = document.getElementById(this._getCellId(account, field)+"_name");
    }
    if(field == ZmItem.F_EMAIL) {
        html = "<div style='margin-left: 10px;'>"+ html +"</div>";    
    }
	el.innerHTML = html;
};

// Protected methods

ZmAccountsListView.prototype._getCellContents =
function(buffer, i, item, field, col, params) {
	if (field == ZmItem.F_NAME) {
		var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_name'>";
		buffer[i++] = AjxStringUtil.htmlEncode(item.getName());
		buffer[i++] = "</div>";
		return i;
	}
	if (field == ZmItem.F_STATUS) {
		if (item instanceof ZmDataSource && !item.isStatusOk()) {
			buffer[i++] = "<table border=0 cellpadding=0 cellpadding=0><tr>";
			buffer[i++] = "<td><div class='ImgCritical_12'></div></td><td>";
			buffer[i++] = ZmMsg.ALT_ERROR;
			buffer[i++] = "</td></tr></table>";
		}
		else {
			buffer[i++] = AjxMsg.ok;
		}
		return i;
	}
	if (field == ZmItem.F_EMAIL) {
        var email = item.getEmail();
        var identity = item.getIdentity();
        if (!item.isMain && identity.sendFromAddressType == ZmSetting.SEND_ON_BEHALF_OF) email = appCtxt.getActiveAccount().name + " " + ZmMsg.sendOnBehalfOf + " " + email;
		buffer[i++] = "<div style='margin-left: 10px;'>"+ AjxStringUtil.htmlEncode(email) +"</div>";
		return i;
	}
	if (field == ZmItem.F_TYPE) {
		buffer[i++] = this._getAccountType(item);
		return i;
	}
	return DwtListView.prototype._getCellContents.apply(this, arguments);
};

ZmAccountsListView.prototype._getCellId =
function(item, field, params) {
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, this._view, item.id, field);
};

ZmAccountsListView.prototype._getHeaderList =
function() {
	return [
		new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg.accountName, width:ZmAccountsListView.WIDTH_NAME}),
		new DwtListHeaderItem({field:ZmItem.F_STATUS, text:ZmMsg.status, width:ZmAccountsListView.WIDTH_STATUS, align:"center"}),
		new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.emailAddr}),
		new DwtListHeaderItem({field:ZmItem.F_TYPE, text:ZmMsg.type, width:ZmAccountsListView.WIDTH_TYPE})
	];
};

ZmAccountsListView.prototype._getAccountType =
function(account) {
	var provider = ZmDataSource.getProviderForAccount(account);
	return (provider && AjxStringUtil.htmlEncode(provider.name)) || (account.isMain ? ZmMsg.accountTypePrimary : ZmAccount.getTypeName(account.type));
};

// Delegate Permissions

ZmAccountDelegatesListView = function(parent, className, posStyle, noMaximize) {
	className = className || "DwtListView";
	className += " ZOptionsItemsListView";
	DwtListView.call(this, {parent:parent, className:className, posStyle:posStyle,
							headerList:this._getHeaderList(), noMaximize:noMaximize});
	this.setMultiSelect(false);
};
ZmAccountDelegatesListView.prototype = new DwtListView;
ZmAccountDelegatesListView.prototype.constructor = ZmAccountDelegatesListView;

ZmAccountDelegatesListView.prototype.toString =
function() {
	return "ZmAccountDelegatesListView";
};

// Constants

ZmAccountDelegatesListView.WIDTH_NAME	= ZmMsg.COLUMN_WIDTH_NAME_ACC;
ZmAccountDelegatesListView.WIDTH_STATUS	= ZmMsg.COLUMN_WIDTH_STATUS_ACC;
ZmAccountDelegatesListView.WIDTH_TYPE	= ZmMsg.COLUMN_WIDTH_TYPE_ACC;

// Public methods

ZmAccountDelegatesListView.prototype.getCellElement =
function(account, field) {
	return document.getElementById(this._getCellId(account, field));
};

ZmAccountDelegatesListView.prototype.setCellContents =
function(account, field, html) {
	var el = this.getCellElement(account, field);
	if (!el) { return; }

	if (field == ZmItem.F_NAME) {
		el = document.getElementById(this._getCellId(account, field)+"_name");
    }
    if(field == ZmItem.F_EMAIL) {
        html = "<div style='margin-left: 10px;'>"+ html +"</div>";
    }
	el.innerHTML = html;
};

// Protected methods

ZmAccountDelegatesListView.prototype._getCellContents =
function(buffer, i, item, field, col, params) {
	if (field == ZmItem.F_NAME) {
		var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_name' style='margin:0 5px; overflow:hidden;'>";
		buffer[i++] = AjxStringUtil.htmlEncode(item.user);
		buffer[i++] = "</div>";
		return i;
	}
	if (field == ZmItem.F_TYPE) {
        var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_type' style='margin:0 5px;'>";
		buffer[i++] = (item.sendAs && item.sendOnBehalfOf)  ? ZmMsg.sendAsAndSendOnBehalfOf : (item.sendAs ? ZmMsg.sendAs : ZmMsg.sendOnBehalfOflbl);
		buffer[i++] = "</div>";
		return i;
	}
	return DwtListView.prototype._getCellContents.apply(this, arguments);
};

ZmAccountDelegatesListView.prototype._getCellId =
function(item, field, params) {
    return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, this._view, item.id, field);
};

ZmAccountDelegatesListView.prototype._getHeaderList =
function() {
	return [
		new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_NAME_DELEGATE, margin:"5px"}),
		new DwtListHeaderItem({field:ZmItem.F_TYPE, text:ZmMsg.type})
	];
};

ZmAccountDelegatesListView.prototype._doubleClickAction =
function(){
   this.parent._editDelegateButton();
}

//overriding no results container getter function for custom behavior
ZmAccountDelegatesListView.prototype._getNoResultsContainer =
function() {
	var div = document.createElement("div");
	div.className = "ZmListViewTableNoResultsContainer";
	return div;
};

ZmAccountAppPasscodeListView = function(parent, className, posStyle, noMaximize) {
	className = className || "DwtListView";
	className += " ZOptionsItemsListView";
	DwtListView.call(this, {parent:parent, className:className, posStyle:posStyle, headerList:this._getHeaderList(), noMaximize:noMaximize});
	this.setMultiSelect(false);
};
ZmAccountAppPasscodeListView.prototype = new DwtListView;
ZmAccountAppPasscodeListView.prototype.constructor = ZmAccountAppPasscodeListView;

ZmAccountAppPasscodeListView.prototype.toString =
function() {
	return "ZmAccountAppPasscodeListView";
};

ZmAccountAppPasscodeListView.prototype._getHeaderList =
function() {
	return [
		new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg.name, margin:"5px", width:ZmMsg.COLUMN_WIDTH_NAME_APPLICATION}),
		new DwtListHeaderItem({field:ZmItem.F_APP_PASSCODE_CREATED, text:ZmMsg.created, width:ZmMsg.COLUMN_WIDTH_NAME_APPLICATION}),
		new DwtListHeaderItem({field:ZmItem.F_APP_PASSCODE_LAST_USED, text:ZmMsg.lastUsed, width:ZmMsg.COLUMN_WIDTH_NAME_APPLICATION})
	];
};

ZmAccountAppPasscodeListView.prototype._getCellContents =
function(buffer, i, item, field, col, params) {
	if (field == ZmItem.F_NAME) {
		var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_name' style='margin:0 5px; overflow:hidden;'>";
		buffer[i++] = AjxStringUtil.htmlEncode(item.appName);
		buffer[i++] = "</div>";
		return i;
	}
	else if (field == ZmItem.F_APP_PASSCODE_CREATED) {
		var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_type' style='margin:0 5px;'>";
		buffer[i++] = AjxDateFormat.format(AjxDateFormat.SHORT, new Date(item.created));
		buffer[i++] = "</div>";
		return i;
	}
	else if (field == ZmItem.F_APP_PASSCODE_LAST_USED) {
		var cellId = this._getCellId(item, field);
		buffer[i++] = "<div id='";
		buffer[i++] = cellId;
		buffer[i++] = "_type' style='margin:0 5px;'>";
		if (item.lastUsed) {
			buffer[i++] = AjxDateFormat.format(AjxDateFormat.SHORT, new Date(item.lastUsed));
		}
		else {
			buffer[i++] = "-";
		}
		buffer[i++] = "</div>";
		return i;
	}
	return DwtListView.prototype._getCellContents.apply(this, arguments);
};


//
// New data source class
//

ZmAccountsPage._defineClasses =
function() {
ZmNewDataSource = function() {
	var number = ++ZmNewDataSource.ID;
	this.setType(appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) ? ZmAccount.TYPE_POP : ZmAccount.TYPE_IMAP);
	ZmDataSource.call(this, this.type, ("new-dsrc-"+number));
	this.email = "";
	this.name = AjxMessageFormat.format(ZmMsg.newExternalAccount, number);
	this._new = true;
	this.folderId = -1;
	var identity = this.getIdentity();
	identity.sendFromDisplay = appCtxt.get(ZmSetting.DISPLAY_NAME);
	identity.sendFromAddress = appCtxt.get(ZmSetting.USERNAME);
};
ZmNewDataSource.prototype = new ZmDataSource;
ZmNewDataSource.prototype.constructor = ZmNewDataSource;

ZmNewDataSource.prototype.toString =
function() {
	return "ZmNewDataSource";
};

// Constants

ZmNewDataSource.ID = 0;

// Data

ZmNewDataSource.prototype.ELEMENT_NAME = ZmPopAccount.prototype.ELEMENT_NAME;

// Public methods

ZmNewDataSource.prototype.setType =
function(type) {
	this.type = type;
	var TYPE = this.type == ZmAccount.TYPE_POP ? ZmPopAccount : ZmImapAccount;
	this.ELEMENT_NAME = TYPE.prototype.ELEMENT_NAME;
	this.getDefaultPort = TYPE.prototype.getDefaultPort;
};

//
// New persona class
//

ZmNewPersona = function() {
	var number = ++ZmNewPersona.ID;
	var id = "new-persona-"+number;
	var name = AjxMessageFormat.format(ZmMsg.newPersona, number);
	var identity = new ZmIdentity(name);
	identity.id = id;
	ZmPersona.call(this, identity);
	this.id = id;
	this._new = true;
	identity.sendFromDisplay = appCtxt.get(ZmSetting.DISPLAY_NAME);
	identity.sendFromAddress = appCtxt.get(ZmSetting.USERNAME);
};
ZmNewPersona.prototype = new ZmPersona;
ZmNewPersona.prototype.constructor = ZmNewPersona;

ZmNewPersona.prototype.toString =
function() {
	return "ZmNewPersona";
};

// Constants

ZmNewPersona.ID = 0;

/**
 * Fetches the list of personas added to account list view amongst other accounts.
 *
 *
 * @param	{String}	accountList		List of accounts added to account list view e.g. Persona and External (POP) account.
 *
 *
 * @public
 */
ZmNewPersona.getPersonaList =
function(accountList) {
    var personas = [];

    personas = AjxUtil.filter(accountList, function(accountItem) {
        if (accountItem instanceof ZmNewPersona || accountItem.type == ZmAccount.TYPE_PERSONA) {
            return accountItem;
        }
    });

    return personas;
};

}; // function ZmAccountsPage._defineClasses


// GrantRights Dialog


/**
 * Creates a grantRights Dialog.
 * @class
 * This class represents a rename folder dialog.
 *
 * @param	{DwtComposite}	parent		the parent
 * @param	{String}	className		the class name
 *
 * @extends		ZmDialog
 */
ZmGrantRightsDialog = function(parent, className, callback) {

	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.grantRights, id:"GrantRightsDialog"});
    var id			= this.toString();
	var inputId		= id + "_name";
	var cellId		= id + "_name_cell";
	var rowId		= id + "_name_row";
	var sendAsId	= id + "_sendAs";
	var sendOboId	= id + "_sendObo";

	var aifParams = {
		parent:					parent,
		bubbleAddedCallback:	this._onChange.bind(this),
		bubbleRemovedCallback:	this._onChange.bind(this),
		singleBubble:			true,
		inputId:				inputId,
		type:					AjxEmailAddress.TO
	}

	this._editPermissions		= false;
	this._okCallBack			= callback;

	this._addrInputField		= new ZmAddressInputField(aifParams);
	this._aifId					= this._addrInputField._htmlElId;

	this._delegateEmailInput	= document.getElementById(inputId);
	this._delegateEmailRow		= document.getElementById(rowId);
	this._sendAs				= document.getElementById(sendAsId);
	this._sendObo				= document.getElementById(sendOboId);

	this._addrInputField.reparentHtmlElement(cellId);
	this._initAutoComplete();
	var okBtn = this.getButton(DwtDialog.OK_BUTTON);
	okBtn.setText(ZmMsg.save);
};

ZmGrantRightsDialog.prototype = new ZmDialog;
ZmGrantRightsDialog.prototype.constructor = ZmGrantRightsDialog;

ZmGrantRightsDialog.prototype.toString =
function() {
	return "ZmGrantRightsDialog";
};

/**
 * Pops-up the dialog.
 *
 */
ZmGrantRightsDialog.prototype.popup =
function() {
	this._addrInputField.clear();
	ZmDialog.prototype.popup.call(this);
    if (!this._editPermissions){
     this._delegateEmailInput.focus();
    } else {
     this._sendAs.focus();
    }
};

ZmGrantRightsDialog.prototype._contentHtml =
function() {
    var subs = {id: this.toString()};
	return AjxTemplate.expand("prefs.Pages#GrantRightsDialog",subs);
};

ZmGrantRightsDialog.prototype._okButtonListener =
function(ev) {
	// get email address from the bubble
	var emailsFromBubbles = this._addrInputField.getAddresses(true);
	var delegateEmail = emailsFromBubbles[0] && emailsFromBubbles[0].address;
	if (!delegateEmail) {
		// get email address from the plain text in input if no bubbles
		var emailsFromText = AjxEmailAddress.getValidAddresses(this._delegateEmailInput.value).getArray();
		delegateEmail = (emailsFromText[0] && emailsFromText[0].address) || this._delegateEmailInput.value;
	}
	this._okCallBack.run(delegateEmail, this._sendAs.checked, this._sendObo.checked);
};

ZmGrantRightsDialog.prototype.setData =
function(item){
    if (item){
        this.setTitle(ZmMsg.editDelegatePermissions + " - " + AjxStringUtil.htmlEncode(item.user));
        this._delegateEmailRow.style.display ="none";
        this._sendAs.checked = item.sendAs;
        this._sendObo.checked = item.sendOnBehalfOf;
        this._editPermissions = true;
        this._prevData = item;
    } else {
        this.setTitle(ZmMsg.delegatePermissions);
        this._delegateEmailRow.style.display ="";
        this._delegateEmailInput.value="";
        this._sendAs.checked = false;
        this._sendObo.checked = false;
        this._editPermissions = false;
        Dwt.setHandler(this._delegateEmailInput, DwtEvent.ONCHANGE, this._onChange.bind(this));
    }
    this.getButton(DwtDialog.OK_BUTTON).setEnabled(false);
    Dwt.setHandler(this._sendAs, DwtEvent.ONCLICK, this._onChange.bind(this));
    Dwt.setHandler(this._sendObo, DwtEvent.ONCLICK, this._onChange.bind(this));
};
ZmGrantRightsDialog.prototype._initAutoComplete =
function(){
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var params = {
			parent:			appCtxt.getShell(),
			dataClass:		appCtxt.getAutocompleter(),
			options:		{type:ZmAutocomplete.AC_TYPE_GAL, acType:ZmAutocomplete.AC_TYPE_CONTACT, excludeGroups:true},
			matchValue:		ZmAutocomplete.AC_VALUE_FULL,
			separator:		"",
			galType:		ZmSearch.GAL_ACCOUNT,
			contextId:		this.toString()
		};
		this._acAddrSelectList = new ZmAutocompleteListView(params);
		this._acAddrSelectList.handle(this._delegateEmailInput, this._aifId);
		this._addrInputField.setAutocompleteListView(this._acAddrSelectList);
	}
};

ZmGrantRightsDialog.prototype._onChange =
function(){
    var enable = false;
    if (!this._editPermissions){
		enable = (this._delegateEmailInput.value || this._addrInputField.getValue())
			&& (this._sendAs.checked || this._sendObo.checked);
    } else {
		enable = this._prevData.sendAs !== this._sendAs.checked
			|| this._prevData.sendOnBehalfOf !== this._sendObo.checked;
    }
    this.getButton(DwtDialog.OK_BUTTON).setEnabled(enable);

}
