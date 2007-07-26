/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmAccountsPage = function(parent, appCtxt, section, controller) {
	if (arguments.length == 0) return;
	ZmPreferencesPage.call(this, parent, appCtxt, section, controller);

	this._sectionDivs = {};

	this._accounts = new AjxVector();
	this._deletedAccounts = [];
};
ZmAccountsPage.prototype = new ZmPreferencesPage;
ZmAccountsPage.prototype.constructor = ZmAccountsPage;

ZmAccountsPage.prototype.toString = function() {
	return "ZmAccountsPage";
};

//
// Constants
//

// pref values

ZmAccountsPage.DOWNLOAD_TO_INBOX = "inbox";
ZmAccountsPage.DOWNLOAD_TO_FOLDER = "folder";

// counters

ZmAccountsPage.__personaCount = 0;
ZmAccountsPage.__externalCount = 0;

// section prefs

ZmAccountsPage.PREFS = {
	// Primary / Common
	NAME: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	EMAIL: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	REPLY_TO: {
		displayName:		"Set the \"Reply-to\" field of email messages to:", // TODO: i18n
		displayContainer:	ZmPref.TYPE_CHECKBOX
	},
	REPLY_TO_NAME: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	REPLY_TO_EMAIL: {
		displayContainer:	ZmPref.TYPE_SELECT
	},
	SIGNATURE: {
		displayContainer:	ZmPref.TYPE_SELECT
	},
	// External
	ACCOUNT_TYPE: {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		["POP3", "IMAP"], // TODO: i18n
		options:			[ZmAccount.POP, ZmAccount.IMAP]
	},
	USERNAME: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	HOST: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	PASSWORD: {
		// TODO: rename ZmPref.TYPE_PASSWORD to TYPE_CHANGE_PASSWORD
		// TODO: add ZmPref.TYPE_PASSWORD
		displayContainer:	ZmPref.TYPE_INPUT
	},
	CHANGE_PORT: {
		// TODO: do message replacement when ACCOUNT_TYPE changes
		displayName:		"Change {0} port",
		displayContainer:	ZmPref.TYPE_CHECKBOX
	},
	PORT: {
		displayContainer:	ZmPref.TYPE_INPUT,
		validator:			DwtInputField.validateNumber
	},
	PORT_DEFAULT: {
		displayContainer:	ZmPref.TYPE_STATIC,
		displayName:		"({0,number} is the default)"
	},
	SSL: {
		displayName:		"Use an encrypted connection (SSL) when accessing this server", // TODO: i18n
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		options:			[ZmDataSource.CONNECT_CLEAR, ZmDataSource.CONNECT_SSL]
	},
	TEST: {
		displayName:		"Test Settings", // TODO: i18n
		displayContainer:	ZmPref.TYPE_CUSTOM // NOTE: a button
	},
	DOWNLOAD_TO: {
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayOptions:		["Inbox", "Folder: {0}"], // TODO: i18n
		options:			[ZmAccountsPage.DOWNLOAD_TO_INBOX, ZmAccountsPage.DOWNLOAD_TO_FOLDER]
	},
	DELETE_AFTER_DOWNLOAD: {
		displayName:		"Delete messages on the server after downloading them", // TODO: i18n
		displayContainer:	ZmPref.TYPE_CHECKBOX
	},
	// Persona
	FROM_NAME: {
		displayContainer:	ZmPref.TYPE_INPUT
	},
	FROM_EMAIL: {
		displayContainer:	ZmPref.TYPE_SELECT
	},
	WHEN_SENT_TO: {
		displayName:		"When replying or forwarding messages sent to {0}", // TODO: i18n, message format
		displayContainer:	ZmPref.TYPE_CHECKBOX
	},
	WHEN_IN_FOLDER: {
		displayName:		"Replying to or forwarding messages in folder(s):", // TODO: i18n
		displayContainer:	ZmPref.TYPE_CHECKBOX
	},
	WHEN_IN_FOLDER_LIST: {
		displayContainer:	ZmPref.TYPE_INPUT
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
		prefs: [
			"NAME",				// A
			"EMAIL",			// A
			"FROM_NAME",		// I
			"REPLY_TO",			// I
			"REPLY_TO_NAME",	// I
			"REPLY_TO_EMAIL",	// I
			"SIGNATURE"			// I
		]
	},
	EXTERNAL: {
		prefs: [
			"NAME",						// A
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
			"REPLY_TO",					// I
			"REPLY_TO_NAME",			// I
			"REPLY_TO_EMAIL",			// I
			"SIGNATURE"					// I
		]
	},
	PERSONA: {
		prefs: [
			"NAME",						// I
			"FROM_NAME",				// I
			"FROM_EMAIL",				// I
			"REPLY_TO",					// I
			"REPLY_TO_NAME",			// I
			"REPLY_TO_EMAIL",			// I
			"SIGNATURE",				// I
			"WHEN_SENT_TO",				// I
			"WHEN_IN_FOLDER",			// I
			"WHEN_IN_FOLDER_LIST",		// I
			"WHEN_IN_FOLDER_BUTTON"
		]
	}
};

ZmAccountsPage.ACCOUNT_PROPS = {
	"NAME":						{ setter: "setName",	getter: "getName" },
	"EMAIL":					{ setter: "setEmail",	getter: "getEmail" },
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
	"REPLY_TO":				"setReplyTo",
	"REPLY_TO_NAME":		"setReplyToDisplay",
	"REPLY_TO_EMAIL":		"setReplyToAddress",
	"SIGNATURE":			"signature",
	"WHEN_SENT_TO":			"useWhenSentTo",
	"WHEN_IN_FOLDER":		"useWhenInFolder",
	"WHEN_IN_FOLDER_LIST":	"whenInFolderIds"
};

//
// Public methods
//

ZmAccountsPage.prototype.setAccount = function(account) {
	// keep track of changes made to current account
	if (this._currentAccount) {
		this._setAccountFields(this._currentAccount, this._currentSection);
		this._currentAccount = null;
		this._currentSection = null;
	}

	// toggle delete button
	if (this._deleteButton) {
		this._deleteButton.setEnabled(account.type != ZmAccount.ZIMBRA);
	}

	// intialize sections
	for (var type in this._sectionDivs) {
		Dwt.setVisible(this._sectionDivs[type], false);
	}

	// NOTE: I hide all of the sections first and then show the
	//       specific section because some of the sections use
	//       the same div. This avoids double inititalization
	//       in that case.
	var div = this._sectionDivs[account.type];
	if (div) {
		this._currentAccount = account;
		Dwt.setVisible(div, true);
		switch (account.type) {
			case ZmAccount.ZIMBRA: {
				this._currentSection = ZmAccountsPage.SECTIONS["PRIMARY"];
				this._setZimbraAccount(account, this._currentSection);
				break;
			}
			case ZmAccount.POP:
			case ZmAccount.IMAP: {
				this._currentSection = ZmAccountsPage.SECTIONS["EXTERNAL"];
				this._setExternalAccount(account, this._currentSection);
				break;
			}
			case ZmAccount.PERSONA: {
				this._currentSection = ZmAccountsPage.SECTIONS["PERSONA"];
				this._setPersona(account, this._currentSection);
				break;
			}
		}
	}

	var name = this._currentSection && this._currentSection.controls["NAME"];
	if (name) {
		name.focus();
	}
};

// ZmPreferencesPage methods

ZmAccountsPage.prototype.showMe = function() {
	var hasRendered = this.hasRendered();
	ZmPreferencesPage.prototype.showMe.apply(this, arguments);
	if (!hasRendered) {
		this.reset();
	}
};

ZmAccountsPage.prototype.reset = function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	// clear current list of accounts
	var currentAccount = this._currentAccount;
	this._accounts.removeAll();
	this._deletedAccounts = [];

	// add various account types
	var appCtxt = this._appCtxt;
	var mainAccount = appCtxt.getMainAccount();
	// NOTE: We create proxies of all of the account objects so that we can
	//       store temporary values while editing.
	this._accounts.add(ZmAccountsPage.__createProxy(mainAccount));

	var dataSourceCollection = appCtxt.getDataSourceCollection();
	var dataSources = dataSourceCollection.getItems(); // TODO: rename getItems or rename getIdentities/getSignatures
	for (var i = 0; i < dataSources.length; i++) {
		this._accounts.add(ZmAccountsPage.__createProxy(dataSources[i]));
	}

	var identityCollection = appCtxt.getIdentityCollection();
	var identities = identityCollection.getIdentities();
	for (var i = 0; i < identities.length; i++) {
		var identity = identities[i];
		if (identity.isDefault) continue;

		var persona = new ZmPersona(appCtxt, identity);
		this._accounts.add(ZmAccountsPage.__createProxy(persona));
	}

	// initialize list view
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	this._resetAccountListView(currentAccount);
};

// saving

ZmAccountsPage.prototype.isDirty = function() {
	// make sure that the current object proxy is up-to-date
	this._setAccountFields(this._currentAccount, this._currentSection);

	var dirty = this._deletedAccounts.length > 0;
	if (!dirty) {
		var accounts = this._accounts.getArray();
		for (var i = 0; i < accounts.length; i++) {
			var account = accounts[i];
			if (account._new || account._dirty) {
				dirty = true;
				break;
			}
		}
	}
	return dirty;
};

ZmAccountsPage.prototype.validate = function() {
	return true; // TODO
};

ZmAccountsPage.prototype.getErrorMessage = function() {
	return this._errorMsg;
};

ZmAccountsPage.prototype.getPreSaveCallback = function() {
    return new AjxCallback(this, this._handlePreSave);
};

ZmAccountsPage.prototype.addCommand = function(batchCmd) {
	// make sure that the current object proxy is up-to-date
	this._setAccountFields(this._currentAccount, this._currentSection);

	// delete accounts
	var addedCommands = false;
	for (var i = 0; i < this._deletedAccounts.length; i++) {
		var callback = null;
		var errorCallback = null;
		this._deletedAccounts[i].doDelete(callback, errorCallback, batchCmd);
		addedCommands = true;
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
			var callback = null;
			var errorCallback = null;
			account.save(callback, errorCallback, batchCmd);
			addedCommands = true;
		}
	}

	// add new accounts
	for (var i = 0; i < newAccounts.length; i++) {
		var callback = null;
		var errorCallback = null;
		newAccounts[i].create(callback, errorCallback, batchCmd);
		addedCommands = true;
	}

	// add a no-op so that we can do some cleanup
	if (addedCommands) {
		// TODO: This can be removed once we implement getPostSaveCallback.
		//       The getPostSaveCallback method will be needed for saving
		//       identities that use signatures that have not been created,
		//       yet.
		var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
		soapDoc.getMethod().setAttribute("wait", "0"); // do not wait

		var callback = new AjxCallback(this, this._handleCleanUp);
		var errorCallback = null;
		batchCmd.addNewRequestParams(soapDoc, callback, errorCallback);
	}
};

//
// Protected methods
//

// set controls based on account

ZmAccountsPage.prototype._setZimbraAccount = function(account, section) {
	this._setGenericFields(account, section);
	this._setIdentityFields(account, section);
};

ZmAccountsPage.prototype._setExternalAccount = function(account, section) {
	this._setGenericFields(account, section);
	this._setDataSourceFields(account, section);
	this._setIdentityFields(account, section);
};

ZmAccountsPage.prototype._setPersona = function(account, section) {
	this._setGenericFields(account, section);
	this._setIdentityFields(account, section);
};

ZmAccountsPage.prototype._setGenericFields = function(account, section) {
	this._setControlValue("NAME", section, account.getName());
	this._setControlValue("EMAIL", section, account.getEmail());
};

ZmAccountsPage.prototype._setDataSourceFields = function(account, section) {
	var isSsl = account.connectionType == ZmDataSource.CONNECT_SSL;
	var isInbox = account.folderId == ZmOrganizer.ID_INBOX;
	var isPortChanged = account.port != account.getDefaultPort();

	this._setControlValue("ACCOUNT_TYPE", section, account.type);
	this._setControlEnabled("ACCOUNT_TYPE", section, account._new);
	this._setControlValue("USERNAME", section, account.userName);
	this._setControlValue("HOST", section, account.mailServer);
	this._setControlValue("PASSWORD", section, account.password);
	this._setControlValue("SSL", section, isSsl);
	this._setControlValue("DOWNLOAD_TO", section, isInbox ? ZmAccountsPage.DOWNLOAD_TO_INBOX : ZmAccountsPage.DOWNLOAD_TO_FOLDER);
	this._setDownloadToFolder();
	this._setControlValue("DELETE_AFTER_DOWNLOAD", section, account.leaveOnServer);
	this._setControlValue("CHANGE_PORT", section, isPortChanged);
	this._setControlEnabled("PORT", section, isPortChanged);
	this._setPortControls(account.type, account.connectionType, account.port);
};

ZmAccountsPage.prototype._setDownloadToFolder = function() {
	var section = this._currentSection;
	var radioGroup = section.controls["DOWNLOAD_TO"];
	if (!radioGroup) return;

	var pref = ZmAccountsPage.PREFS["DOWNLOAD_TO"];
	var options = pref.options;
	var displayOptions = pref.displayOptions;
	var pattern = displayOptions[options[0] == ZmAccountsPage.DOWNLOAD_TO_INBOX ? 1 : 0];
	var text = AjxMessageFormat.format(pattern, this._getControlValue("NAME", section));

	var radioButton = radioGroup.getRadioButtonByValue(ZmAccountsPage.DOWNLOAD_TO_FOLDER);
	radioButton.setText(text);
};

ZmAccountsPage.prototype._setPortControls = function(accountType, connectionType, accountPort) {
	var isPop = accountType == ZmAccount.POP;
	var isSsl = connectionType == ZmDataSource.CONNECT_SSL;

	var section = this._currentSection;
	this._setControlValue("PORT", section, accountPort);
	this._setControlEnabled("DELETE_AFTER_DOWNLOAD", section, isPop);

	var portTypeLabel = AjxMessageFormat.format(ZmAccountsPage.PREFS["CHANGE_PORT"].displayName, accountType);
	this._setControlLabel("CHANGE_PORT", section, portTypeLabel)

	var defaultPort = isPop ? ZmPopAccount.PORT_CLEAR : ZmImapAccount.PORT_CLEAR;
	if (isSsl) {
		defaultPort = isPop ? ZmPopAccount.PORT_SSL : ZmImapAccount.PORT_SSL;
	}
	var defaultPortLabel = AjxMessageFormat.format(ZmAccountsPage.PREFS["PORT_DEFAULT"].displayName, defaultPort);
	this._setControlLabel("PORT_DEFAULT", section, defaultPortLabel);
};

ZmAccountsPage.prototype._setIdentityFields = function(account, section) {
	var identity = account.getIdentity();

	this._setControlValue("FROM_NAME", section, identity.sendFromDisplay);
	this._setControlValue("FROM_EMAIL", section, identity.sendFromAddress);
	this._setControlValue("REPLY_TO", section, identity.setReplyTo);
	this._setControlValue("REPLY_TO_NAME", section, identity.setReplyToDisplay);
	this._setControlValue("REPLY_TO_EMAIL", section, identity.setReplyToAddress);
	this._setControlValue("SIGNATURE", section, identity.signature);
	this._setControlValue("WHEN_SENT_TO", section, identity.useWhenSentTo);
	this._setControlValue("WHEN_IN_FOLDER", section, identity.useWhenInFolder);
	this._setControlValue("WHEN_IN_FOLDER_LIST", section, identity.whenInFolderIds);

	this._setReplyToControls();
	this._setWhenSentToControls();
	this._setWhenInFolderControls();
};

ZmAccountsPage.prototype._setReplyToControls = function() {
	var section = this._currentSection;
	var replyTo = this._getControlValue("REPLY_TO", section);

	this._setControlEnabled("REPLY_TO_NAME", section, replyTo);
	this._setControlEnabled("REPLY_TO_EMAIL", section, replyTo);
};

ZmAccountsPage.prototype._setWhenSentToControls = function() {
	var section = this._currentSection;
	var control = section.controls["WHEN_SENT_TO"];
	if (!control) return;

	var fromEmail = this._getControlValue("FROM_EMAIL", section);

	var pattern = ZmAccountsPage.PREFS["WHEN_SENT_TO"].displayName;
	var message = AjxMessageFormat.format(pattern, fromEmail);
	control.setText(message);
};

ZmAccountsPage.prototype._setWhenInFolderControls = function() {
	var section = this._currentSection;
	var whenInFolder = this._getControlValue("WHEN_IN_FOLDER", section);

	this._setControlEnabled("WHEN_IN_FOLDER_LIST", section, whenInFolder);
	this._setControlEnabled("WHEN_IN_FOLDER_BUTTON", section, whenInFolder);
};

ZmAccountsPage.prototype._setControlLabel = function(id, section, value) {
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

ZmAccountsPage.prototype._setControlValue = function(id, section, value) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!control || !setup) return;

	if (id == "DELETE_AFTER_DOWNLOAD") {
		value = !value;
	}
	else if (id == "WHEN_IN_FOLDER_LIST") {
		var tree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		var folderIds = value;
		var array = new Array(value);
		var seenComma = false;
		for (var i = 0; i < folderIds.length; i++) {
			var searchPath = tree.getById(folderIds[i]).getSearchPath();
			array[i] = searchPath;
			seenComma = seenComma || searchPath.match(/,/);
		}
		value = array.join(seenComma ? "; " : ", ");
	}

	switch (setup.displayContainer) {
		case ZmPref.TYPE_STATIC: {
			control.setText(value);
			break;
		}
		case ZmPref.TYPE_CHECKBOX: {
			control.setSelected(value);
			break;
		}
		case ZmPref.TYPE_INPUT: {
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

ZmAccountsPage.prototype._getControlValue = function(id, section) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!control || !setup) return null;

	if (id == "WHEN_IN_FOLDER_LIST") {
		var tree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
		var root = tree.getById(ZmOrganizer.ID_ROOT);

		var folderPaths = control.getValue().replace(/\s*(;|,)\s*/g,"$1").split(/;|,/);
		var array = [];
		for (var i = 0; i < folderPaths.length; i++) {
			var folder = root.getByPath(folderPaths[i]);
			if (!folder) continue;
			array.push(folder.id);
		}
		return array;
	}
	if (id == "DELETE_AFTER_DOWNLOAD") {
		return !control.isSelected();
	}
	if (id == "DOWNLOAD_TO") {
		return control.getSelectedValue() == ZmAccountsPage.DOWNLOAD_TO_INBOX ? ZmOrganizer.ID_INBOX : -1;
	}

	switch (setup.displayContainer) {
		case ZmPref.TYPE_STATIC: {
			return control.getText();
		}
		case ZmPref.TYPE_CHECKBOX: {
			var value = control.isSelected();
			if (setup.options) {
				value = setup.options[Number(value)];
			}
			return value;
		}
		case ZmPref.TYPE_RADIO_GROUP: {
			return control.getSelectedValue();
		}
		case ZmPref.TYPE_INPUT:
		case ZmPref.TYPE_SELECT: {
			return control.getValue();
		}
	}

	return null;
};

ZmAccountsPage.prototype._setControlEnabled = function(id, section, enabled) {
	var control = section.controls[id];
	var setup = ZmAccountsPage.PREFS[id];
	if (!control || !setup) return;

	control.setEnabled(enabled);
};

ZmAccountsPage.prototype._setAccountFields = function(account, section) {
	if (!account || !section) return;

	for (var id in ZmAccountsPage.ACCOUNT_PROPS) {
		var control = section.controls[id];
		if (!control) continue;

		var prop = ZmAccountsPage.ACCOUNT_PROPS[id];
		var isField = AjxUtil.isString(prop);

		var ovalue = isField ? account[prop] : account[prop.getter]();
		var nvalue = this._getControlValue(id, section);
		if (this._valuesEqual(ovalue, nvalue)) continue;

		account._dirty = true;
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
		if (!control) continue;

		var prop = ZmAccountsPage.IDENTITY_PROPS[id];
		var isField = AjxUtil.isString(prop);

		var ovalue = isField ? identity[prop] : identity[prop.getter]();
		var nvalue = this._getControlValue(id, section);
		if (this._valuesEqual(ovalue, nvalue)) continue;

		account._dirty = true;
		if (isField) {
			identity[prop] = nvalue;
		}
		else {
			identity[prop.setter](nvalue);
		}
	}
};

ZmAccountsPage.prototype._valuesEqual = function(ovalue, nvalue) {
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

ZmAccountsPage.prototype._setupInput = function(id, setup, value) {
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
	}
	return input;
};

ZmAccountsPage.prototype._setupCheckbox = function(id, setup, value) {
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
	else if (id == "WHEN_IN_FOLDER") {
		checkbox.addSelectionListener(new AjxListener(this, this._handleWhenInFolder));
	}
	return checkbox;
};

ZmAccountsPage.prototype._setupRadioGroup = function(id, setup, value) {
	var container = ZmPreferencesPage.prototype._setupRadioGroup.apply(this, arguments);
	if (id == "ACCOUNT_TYPE") {
		var radioGroup = this.getFormObject("ACCOUNT_TYPE");
		radioGroup.addSelectionListener(new AjxListener(this, this._handleTypeChange));
	}
	return container;
};

ZmAccountsPage.prototype._setupSelect = function(id, setup, value) {
	var isEmailSelect = id == "FROM_EMAIL" || id == "REPLY_TO_EMAIL";
	if (isEmailSelect && this._appCtxt.get(ZmSetting.ALLOW_ANY_FROM_ADDRESS)) {
		var params = {
			parent: this,
			hint: ZmMsg.addressHint
		};
		var input = new DwtInputField(params);
		this.setFormObject(id, input);

		// By setting the setSelectedValue method on the input
		// field, it fakes the setter method of a DwtSelect.
		input.setSelectedValue = input.setValue;

		/***
		var sendFromAddress = new DwtInputField(params);
		sendFromAddress.setRequired(true);
		sendFromAddress.addListener(DwtEvent.ONKEYUP, this._changeListenerObj);
		sendFromAddress.setValidatorFunction(null, ZmIdentityPage._validateEmailAddress);
		this._errorMessages[ZmIdentity.SEND_FROM_ADDRESS] = ZmMsg.sendFromAddressError;
		sendFromAddress.replaceElement(id + "_sendFromAddress");
		this._inputs[ZmIdentity.SEND_FROM_ADDRESS] = sendFromAddress;
		/***/

		input.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleFromEmail));

		return input;
	}

	var select = ZmPreferencesPage.prototype._setupSelect.apply(this, arguments);
	if (isEmailSelect) {
		var accountAddress = this._appCtxt.get(ZmSetting.USERNAME);
		select.addOption(accountAddress, false, accountAddress);

		var addresses = this._appCtxt.get(ZmSetting.ALLOW_FROM_ADDRESSES);
		for (var i = 0; i < addresses.length; i++) {
			select.addOption(addresses[i], false, addresses[i]);
		}

		var aliases = this._appCtxt.get(ZmSetting.MAIL_ALIASES);
		for (var i = 0; i < aliases.length; i++) {
			select.addOption(aliases[i], false, aliases[i]);
		}

		select.addChangeListener(new AjxListener(this, this._handleFromEmail));
	}
	else if (id == "SIGNATURE") {
		var collection = this._appCtxt.getSignatureCollection();
		collection.addChangeListener(new AjxListener(this, this._resetSignatureSelect, [select]));
		this._resetSignatureSelect(select);
	}
	return select;
};

ZmAccountsPage.prototype._setupCustom = function(id, setup, value) {
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
		var button = new DwtButton(this);
		button.setText(setup.displayName);
		button.addSelectionListener(new AjxListener(this, this._handleTestButton));
		return button;
	}
	if (id == "WHEN_IN_FOLDER_BUTTON") {
		var button = new DwtButton(this);
		button.setImage("SearchFolder");
		button.addSelectionListener(new AjxListener(this, this._handleFolderButton));
		return button;
	}

	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmAccountsPage.prototype._resetAccountListView = function(accountOrIndex) {
	this._accountListView.set(this._accounts.clone());
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
	this._accountListView.setSelection(account || this._appCtxt.getMainAccount());
};

ZmAccountsPage.prototype._resetSignatureSelect = function(select) {
	var selectedValue = select.getValue();
	select.clearOptions();
	var options = this._appCtxt.getSignatureCollection().getSignatureOptions();
	for (var i = 0; i < options.length; i++) {
		select.addOption(options[i]);
	}
	select.setSelectedValue(selectedValue);
};

// account buttons

ZmAccountsPage.prototype._setupButtons = function() {
	var deleteButtonDiv = document.getElementById(this._htmlElId+"_DELETE");
	if (deleteButtonDiv) {
		var button = new DwtButton(this);
		button.setText(ZmMsg.del);
		button.setEnabled(false);
		button.addSelectionListener(new AjxListener(this, this._handleDeleteButton));
		button.replaceElement(deleteButtonDiv);
		this._deleteButton = button;
	}

	var addExternalButtonDiv = document.getElementById(this._htmlElId+"_ADD_EXTERNAL");
	if (addExternalButtonDiv) {
		var button = new DwtButton(this);
		button.setText("Add External Account"); // TODO: i18n
		button.addSelectionListener(new AjxListener(this, this._handleAddExternalButton));
		button.replaceElement(addExternalButtonDiv);
		this._addExternalButton = button;
	}

	var addPersonaButtonDiv = document.getElementById(this._htmlElId+"_ADD_PERSONA");
	if (addPersonaButtonDiv) {
		var button = new DwtButton(this);
		button.setText("Add Persona"); // TODO: i18n
		button.addSelectionListener(new AjxListener(this, this._handleAddPersonaButton));
		button.replaceElement(addPersonaButtonDiv);
		this._addPersonaButton = button;
	}
};

// account sections

ZmAccountsPage.prototype._setupPrimaryDiv = function() {
	var div = document.getElementById(this._htmlElId+"_PRIMARY");
	if (div) {
		this._sectionDivs[ZmAccount.ZIMBRA] = div;
		this._createSection("PRIMARY");
	}
};

ZmAccountsPage.prototype._setupExternalDiv = function() {
	var div = document.getElementById(this._htmlElId+"_EXTERNAL");
	if (div) {
		this._sectionDivs[ZmAccount.POP] = div;
		this._sectionDivs[ZmAccount.IMAP] = div;
		this._createSection("EXTERNAL");
	}
};

ZmAccountsPage.prototype._setupPersonaDiv = function() {
	var div = document.getElementById(this._htmlElId+"_PERSONA");
	if (div) {
		this._sectionDivs[ZmAccount.PERSONA] = div;
		this._createSection("PERSONA");
	}
};

ZmAccountsPage.prototype._createSection = function(name) {
	var section = ZmAccountsPage.SECTIONS[name];
	var prefIds = section && section.prefs;
	if (!prefIds) return;

	section.controls = {};

	var prefs = ZmAccountsPage.PREFS;
	for (var i = 0; i < prefIds.length; i++) {
		var id = prefIds[i];
		var setup = prefs[id];
		if (!setup) continue;

		var containerId = [this._htmlElId, name, id].join("_");
		var containerEl = document.getElementById(containerId);
		if (!containerEl) continue;

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
			control.replaceElement(containerEl);
			if (type == ZmPref.TYPE_RADIO_GROUP) {
				control = this.getFormObject(id);
			}
			section.controls[id] = control;
		}
	}
};

// listeners

ZmAccountsPage.prototype._handleAccountSelection = function(evt) {
	var account = this._accountListView.getSelection()[0];
	this.setAccount(account);
};

ZmAccountsPage.prototype._handleDeleteButton = function(evt) {
	var account = this._accountListView.getSelection()[0];
	if (!account._new) {
		account._deleted = true;
		this._deletedAccounts.push(account);
	}
	var index = this._accountListView.getItemIndex(account);
	this._accounts.remove(account);
	this._resetAccountListView(index);
};

ZmAccountsPage.prototype._handleAddExternalButton = function(evt) {
	var account = new ZmNewDataSource(this._appCtxt);
	this._accounts.add(account);
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	this._resetAccountListView(account);
};

ZmAccountsPage.prototype._handleAddPersonaButton = function(evt) {
	var persona = new ZmNewPersona(this._appCtxt);
	this._accounts.add(persona);
	this._accounts.sort(ZmAccountsPage.__ACCOUNT_COMPARATOR);
	this._resetAccountListView(persona);
};


// generic listeners

ZmAccountsPage.prototype._handleNameChange = function(evt) {
	var inputEl = DwtUiEvent.getTarget(evt);
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_NAME, inputEl.value);

	var type = this._currentAccount.type;
	if (type == ZmAccount.POP || type == ZmAccount.IMAP) {
		this._setDownloadToFolder();
	}
};

ZmAccountsPage.prototype._handleEmailChange = function(evt) {
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
};

ZmAccountsPage.prototype._updateEmailCell = function(email) {
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_EMAIL, email);
};

// data source listeners

ZmAccountsPage.prototype._handleTypeChange = function(evt) {
	var radio = this._currentSection.controls["ACCOUNT_TYPE"];
	this._accountListView.setCellContents(this._currentAccount, ZmItem.F_TYPE, radio.getSelectedValue());
	this._handleTypeOrSslChange(evt);
};

ZmAccountsPage.prototype._handleTypeOrSslChange = function(evt) {
	var controls = this._currentSection.controls;

	var dataSource = this._currentAccount;
	if (dataSource._new) {
		var type = controls["ACCOUNT_TYPE"];
		dataSource.setType((type && type.getSelectedValue()) || ZmAccount.POP);
	}

	var ssl = controls["SSL"];
	dataSource.connectionType = ssl && ssl.isSelected() ? ZmDataSource.CONNECT_SSL : ZmDataSource.CONNECT_CLEAR;
	dataSource.port = dataSource.getDefaultPort();
	this._setPortControls(dataSource.type, dataSource.connectionType, dataSource.port);
};

ZmAccountsPage.prototype._handleUserNameChange = function(evt) {
	this._currentAccount.userName = this._getControlValue("USERNAME", this._currentSection);
};

ZmAccountsPage.prototype._handleHostChange = function(evt) {
	this._currentAccount.mailServer = this._getControlValue("HOST", this._currentSection);
};

ZmAccountsPage.prototype._handleChangePort = function(evt) {
	this._setControlEnabled("PORT", this._currentSection, evt.detail);
};

ZmAccountsPage.prototype._handleTestButton = function(evt) {
	var button = evt.item;
	button.setEnabled(false);

	// make sure that the current object proxy is up-to-date
	var dataSource = this._currentAccount;
	this._setAccountFields(dataSource, this._currentSection);

	// testconnection
	var callback = new AjxCallback(this, this._handleTestResponse, [button, dataSource]);
	dataSource.testConnection(callback, callback);
};

ZmAccountsPage.prototype._handleTestResponse =
function(button, dataSource, result) {
	button.setEnabled(true);
	var resp = result && result._data && result._data.TestDataSourceResponse;
	if (resp) {
		var message, level, detail;
		var dsrc = resp[ZmDataSource.prototype.ELEMENT_NAME] ||
				   resp[ZmPopAccount.prototype.ELEMENT_NAME] ||
				   resp[ZmImapAccount.prototype.ELEMENT_NAME];
		dsrc = dsrc && dsrc[0];
		if (dsrc.success) {
			message = ZmMsg.dataSourceTestSuccess;
			level = ZmStatusView.LEVEL_INFO;
		}
		else {
			message = dsrc.error;
			level = ZmStatusView.LEVEL_CRITICAL;
		}
		this._appCtxt.setStatusMsg(message, level, detail);
	}
};

// identity listeners

ZmAccountsPage.prototype._handleFromEmail = function(evt) {
	this._setWhenSentToControls();
	var email = this._getControlValue("FROM_EMAIL", this._currentSection);
	this._updateEmailCell(email);
};

ZmAccountsPage.prototype._handleReplyTo = function(evt) {
	this._setReplyToControls();
};

ZmAccountsPage.prototype._handleSignatureChange =
function(select, evt) {
	if (evt.event == ZmEvent.E_CREATE || evt.event == ZmEvent.E_DELETE ||
		(evt.event == ZmEvent.E_MODIFY && evt.getDetail("rename"))) {
		this._resetSignatureSelect(select);
	}
};

ZmAccountsPage.prototype._handleWhenInFolder = function(evt) {
	this._setWhenInFolderControls();
};

ZmAccountsPage.prototype._handleFolderButton = function(evt) {
	if (!this._folderAddCallback) {
		this._folderAddCallback = new AjxCallback(this, this._handleFolderAdd);
	}
	var dialog = this._appCtxt.getChooseFolderDialog();
	ZmController.showDialog(dialog, this._folderAddCallback);
};

ZmAccountsPage.prototype._handleFolderAdd = function(folder) {
	var section = this._currentSection;
	var folders = this._getControlValue("WHEN_IN_FOLDER_LIST", section);
	if (!folders) return;

	folders.push(folder.id);
	this._setControlValue("WHEN_IN_FOLDER_LIST", section, folders);
	this._appCtxt.getChooseFolderDialog().popdown();
};

// pre-save callbacks

ZmAccountsPage.prototype._handlePreSave = function(continueCallback) {
	// make sure that the current object proxy is up-to-date
	this._setAccountFields(this._currentAccount, this._currentSection);

	// TODO: handle pre-save testing of data sources

	var accounts = this._accounts.getArray();
	var batchCmd;
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account.type == ZmAccount.POP || account.type == ZmAccount.IMAP) {
			if (account.folderId != ZmOrganizer.ID_INBOX) {
				if (!batchCmd) {
					batchCmd = new ZmBatchCommand(this._appCtxt, false)
				}

				var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
				var folderEl = soapDoc.set("folder");
				folderEl.setAttribute("l", ZmOrganizer.ID_ROOT);
				folderEl.setAttribute("name", account.getName());
				folderEl.setAttribute("fie", "1"); // fetch-if-exists

				var callback = new AjxCallback(this, this._handleCreateFolderResponse, [account]);
				var errorCallback = callback;
				batchCmd.addNewRequestParams(soapDoc, callback, errorCallback);
			}
		}
	}

	// continue
	if (batchCmd) {
		// HACK: Don't know a better way to set an error condition
		delete this.__hack_preSaveError;
		var callback = new AjxCallback(this, this._handlePreSaveFinish, [continueCallback]);
		batchCmd.run(callback);
	}
	else {
		this._handlePreSaveFinish(continueCallback);
	}
};

ZmAccountsPage.prototype._handleCreateFolderResponse =
function(dataSource, result) {
	var resp = result && result._data && result._data.CreateFolderResponse;
	if (resp) {
		dataSource.folderId = resp.folder[0].id;
	}
	else {
		// HACK: Don't know a better way to set an error condition
		this.__hack_preSaveError = true;
	}
};

ZmAccountsPage.prototype._handlePreSaveFinish = function(continueCallback) {
	// HACK: Don't know a better way to set an error condition
	continueCallback.run(this.__hack_preSaveError);
};

// post-save callbacks

ZmAccountsPage.prototype._handleCleanUp = function() {
	this.reset();
};

//
// Private functions
//

ZmAccountsPage.__ACCOUNT_COMPARATOR = function(a, b) {
	if (a.type == ZmAccount.ZIMBRA && a.isMain) return -1;
	if (b.type == ZmAccount.ZIMBRA && b.isMain) return 1;
	return a.getName() - b.getName();
};

ZmAccountsPage.__createProxy = function(account) {
	var identityProxy = AjxUtil.createProxy(account.getIdentity());
	var proxy = AjxUtil.createProxy(account);
	proxy.getIdentity = AjxCallback.simpleClosure(ZmAccountsPage.__proxy_getIdentity, proxy, identityProxy);
	return proxy;
};

ZmAccountsPage.__proxy_getIdentity = function(identity) {
	return identity;
};

//
// Classes
//

ZmAccountsListView = function(parent, className, posStyle, noMaximize) {
	className = className || "DwtListView";
	className += " ZOptionsItemsListView";
	DwtListView.call(this, parent, className, posStyle, this._getHeaderList(), noMaximize);
	this.setMultiSelect(false);
	this.setViewPrefix("acct");
};
ZmAccountsListView.prototype = new DwtListView;
ZmAccountsListView.prototype.constructor = ZmAccountsListView;

ZmAccountsListView.prototype.toString = function() {
	return "ZmAccountsListView";
};

// Constants

ZmAccountsListView.TYPES = {};
ZmAccountsListView.TYPES[ZmAccount.ZIMBRA]					= "Primary"; // TODO: i18n
ZmAccountsListView.TYPES[ZmAccount.POP]						= ZmAccount.POP;
ZmAccountsListView.TYPES[ZmAccount.IMAP]					= ZmAccount.IMAP;
ZmAccountsListView.TYPES[ZmAccount.PERSONA]					= "Persona"; // TODO: i18n

ZmAccountsListView.WIDTH_NAME	= 150;
//ZmAccountsListView.WIDTH_STATUS	= 20;
ZmAccountsListView.WIDTH_EMAIL	= 150;
ZmAccountsListView.WIDTH_TYPE	= 80;

// Public methods

ZmAccountsListView.prototype.getCellElement = function(account, field) {
	return document.getElementById(this._getCellId(account, field));
};

ZmAccountsListView.prototype.setCellContents = function(account, field, html) {
	var el = this.getCellElement(account, field);
	if (!el) return;

	// HACK: name contents is first child of name cell
	if (field == ZmItem.F_NAME) {
		el = el.firstChild;
	}
	el.innerHTML = html;
};

ZmAccountsListView.prototype.setStatusImage = function(account, imageName) {
	var el = this.getCellElement(account, ZmItem.F_NAME);
	if (!el) return;

	// HACK: status image is last child of name cell
	el.lastChild.className = AjxImg.getClassForImage(imageName);
};

// Protected methods

ZmAccountsListView.prototype._getCellContents =
function(buffer, i, item, field, col, params) {
	if (field == ZmItem.F_NAME) {
		// !!! Code depends on the content and order of this cell !!!
		buffer[i++] = "<span>";
		buffer[i++] = item.getName();
		buffer[i++] = "</span>";
		buffer[i++] = "<span class='ImgBlank_16'></span>";
		return i;
	}
	/***
	if (field == ZmItem.F_FLAG) {
		var image = "Blank_16";
		if (item.status == ZmStatusView.LEVEL_WARNING) {
			image = "Warning";
		}
		else if (item.status == ZmStatusView.LEVEL_CRITICAL) {
			image = "Critical";
		}
		buffer[i++] = "<div class='";
		buffer[i++] = AjxImg.getClassForImage(image);
		buffer[i++] = "'></div>";
		return i;
	}
	/***/
	if (field == ZmItem.F_EMAIL) {
		buffer[i++] = item.getEmail();
		return i;
	}
	if (field == ZmItem.F_TYPE) {
		buffer[i++] = ZmAccountsListView.TYPES[item.type];
		return i;
	}
	return DwtListView.prototype._getCellContents.apply(this, arguments);
}

ZmAccountsListView.prototype._getCellId = function(item, field, params) {
	return [this.getViewPrefix(), item.id, field].join("-");
};

ZmAccountsListView.prototype._getHeaderList = function() {
	return [
//		new DwtListHeaderItem(field, label, icon, width, sortable, resizeable, visible, name);
		new DwtListHeaderItem(ZmItem.F_NAME, ZmMsg.accountName, null, ZmAccountsListView.WIDTH_NAME, null, true),
//		new DwtListHeaderItem(ZmItem.F_FLAG, null, null, ZmAccountsListView.WIDTH_STATUS, null, false),
		new DwtListHeaderItem(ZmItem.F_EMAIL, ZmMsg.emailAddr, null, ZmAccountsListView.WIDTH_EMAIL, null, true),
		new DwtListHeaderItem(ZmItem.F_TYPE, ZmMsg.type, null, ZmAccountsListView.WIDTH_TYPE, null, true)
	];
};

//
// New data source class
//

ZmNewDataSource = function(appCtxt) {
	var number = ++ZmNewDataSource.ID;
	var id = "new-dsrc-"+number;
	this.setType(ZmAccount.POP);
	ZmDataSource.call(this, appCtxt, ZmAccount.POP, id);
	this.name = AjxMessageFormat.format("New External Account {0,number}", number); // TODO: i18n
	this._new = true;
};
ZmNewDataSource.prototype = new ZmDataSource;
ZmNewDataSource.prototype.constructor = ZmNewDataSource;

ZmNewDataSource.prototype.toString = function() {
	return "ZmNewDataSource";
};

// Constants

ZmNewDataSource.ID = 0;

// Data

ZmNewDataSource.prototype.ELEMENT_NAME = ZmPopAccount.prototype.ELEMENT_NAME;

// Public methods

ZmNewDataSource.prototype.setType = function(type) {
	this.type = type;
	var TYPE = this.type == ZmAccount.POP ? ZmPopAccount : ZmImapAccount;
	this.ELEMENT_NAME = TYPE.prototype.ELEMENT_NAME;
	this.getDefaultPort = TYPE.prototype.getDefaultPort;
};

//
// New persona class
//

ZmNewPersona = function(appCtxt) {
	var number = ++ZmNewPersona.ID;
	var id = "new-persona-"+number;
	var name = AjxMessageFormat.format("New Persona {0,number}", number); // TODO: i18n
	var identity = new ZmIdentity(appCtxt, name);
	identity.id = id;
	ZmPersona.call(this, appCtxt, identity);
	this.id = id;
	this._new = true;
};
ZmNewPersona.prototype = new ZmPersona;
ZmNewPersona.prototype.constructor = ZmNewPersona;

ZmNewPersona.prototype.toString = function() {
	return "ZmNewPersona";
};

// Constants

ZmNewPersona.ID = 0;
