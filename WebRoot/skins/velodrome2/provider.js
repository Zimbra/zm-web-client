/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite, Network Edition.
 * Copyright (C) 2009 Zimbra, Inc.  All Rights Reserved.
 * 
 * ***** END LICENSE BLOCK *****
 */
// Turn on provider in templates

skin.PROVIDER_ENABLED = true;

//
// Comcast.net data source
//

VelodromeSkin.PROVIDER ={
	id: "comcast-imap",
	name: "Comcast.net",
	type: "imap",
	connectionType: "ssl",
	host: "mail.comcast.net",
	port: 993,
	_host: "comcast.net",
	_nosender: true
};

//
// ZmAccountsPage method overrides
//

// NOTE: All of the methods in this section execute within the context
//       of the ZmAccountsPage instance object.

VelodromeSkin.prototype._setDataSourceFields = function(account, section) {
	arguments.callee.func.apply(this, arguments);

	var value = account.type == ZmAccount.TYPE_POP ? "zimbra-pop" : "zimbra-imap";
	if (account.mailServer == VelodromeSkin.PROVIDER.host) {
		value = "comcast-imap";
	}

	this._setControlValue("X-TYPE", this._currentSection, value);
	this._setControlEnabled("X-TYPE", this._currentSection, Boolean(account._new));
};

VelodromeSkin.prototype._updateSelect = function(id) {
    var dwtElement = this.getFormObject(id);
    if (dwtElement) {
		if (id == "REPLY_TO_EMAIL") {
			var addresses = this._getAllAddresses(); // Get the addresses we can from _getAllAddresses()
	
			// Apparently not all (any?) external account addresses are retrieved from _getAllAddresses(), so we dig them out from this._accounts
			// this._accounts is ready when the interface has been drawn
			var accounts = this._accounts.getArray();
			addresses = this._getAddressesFromAccounts(accounts, true, true, addresses);
				    
			var value = dwtElement.getValue();
			dwtElement.clearOptions();
			for (var i=0; i<addresses.length; i++) {
				dwtElement.addOption(addresses[i], addresses[i] == value);
			}
		}
    }
};

VelodromeSkin.prototype._updateList = function(account) {
    this._updateComboBox("REPLY_TO_EMAIL");
    arguments.callee.func.apply(this, arguments);
};

/*
 * Takes a list of accounts and extracts their email addresses
 * @param accounts	array of account objects
 * @param unique	boolean: if true, addresses will be included in output only if they are not already present. Defaults to true
 * @param valid		boolean: if true, performs a validation check on the address and only includes it if it passes. Defaults to true
 * @param addresses	optional array of addresses (as strings) to append to. Defaults to an empty array
*/
VelodromeSkin.prototype._getAddressesFromAccounts = function(accounts, unique, valid, addresses) {
    if (!addresses) addresses = [];
    unique = unique !== false;
    valid = valid !== false;
    for (var i=0; i<accounts.length; i++) {
	var account = accounts[i];
	if (account.isMain || account.enabled) {
	    var address = account.getEmail();
	    if (!AjxUtil.isEmpty(address) && (!valid || AjxUtil.isEmailAddress(address)) && (!unique || AjxUtil.indexOf(addresses, address, false) == -1)) // Make sure we are not adding an empty address and that we are not adding the address twice
		addresses.push(address);
	}
    }
    return addresses;
};

VelodromeSkin.prototype._setupRadioGroup = function(id, setup, value) {
	var container = arguments.callee.func.apply(this, arguments);
	if (id == "X-TYPE") {
		var group = this.getFormObject(id);
		group.addSelectionListener(new AjxListener(this, this._handleXTypeChange));
	}
	return container;
};

VelodromeSkin.prototype._handleXTypeChange = function() {
	var section = this._currentSection;
	var account = this._currentAccount;

	var value = this._getControlValue("X-TYPE", section);
	var isComcastAcct = value == "comcast-imap";
	var type = /-pop$/.test(value) ? ZmAccount.TYPE_POP : ZmAccount.TYPE_IMAP;

	// reset acct
	this._setControlValue("PROVIDER", section, isComcastAcct ? "comcast-imap" : "");
	this._setControlValue("ACCOUNT_TYPE", section, type);
	account.setType(type);
	account.reset();

	// set account values
	if (isComcastAcct) {
		var provider = VelodromeSkin.PROVIDER;
		for (var p in provider) {
			if (p == "id" || p == "type" || p == "name") continue;
			if (ZmDataSource.DATASOURCE_ATTRS[p]) {
				account[ZmDataSource.DATASOURCE_ATTRS[p]] = provider[p];
			}
		}
	}

	// update page
	this.setAccount(account, true, false);
};

//
// Application launch methods
//

VelodromeSkin.prototype._provider_handlePrefsPreLaunch = function() {
	if (!VelodromeSkin.__registeredProvider) {
		VelodromeSkin.__registeredProvider = true;
		ZmDataSource.addProvider(VelodromeSkin.PROVIDER);
	}
	if (window.ZmDataSourceCollection) {
		this.overrideAPI(ZmDataSourceCollection.prototype, "__gotoPrefSection");
	}
};
VelodromeSkin.prototype._provider_handleMailPreLaunch = VelodromeSkin.prototype._provider_handlePrefsPreLaunch;
VelodromeSkin.prototype._provider_handleMailCoreLoad  = VelodromeSkin.prototype._provider_handlePrefsPreLaunch;

VelodromeSkin.prototype._provider_handlePrefsPostLaunch = function() {
	// register our new preference
	ZmAccountsPage.PREFS["X-TYPE"] = {
		displayContainer: ZmPref.TYPE_RADIO_GROUP,
		orientation:      ZmPref.ORIENT_HORIZONTAL,
		options:          [ "zimbra-pop", "zimbra-imap", "comcast-imap" ],
		displayOptions:   [ "POP3",       "IMAP",        "Comcast.net" ]
	};
	ZmAccountsPage.SECTIONS["EXTERNAL"].prefs.push("X-TYPE");

	ZmAccountsPage.PREFS.REPLY_TO_EMAIL.displayContainer = ZmPref.TYPE_SELECT;

	// override/add API to ZmAccountsPage
	var proto = window.ZmAccountsPage && ZmAccountsPage.prototype;
	if (proto) {
		this.overrideAPI(proto, "_setDataSourceFields");
		this.overrideAPI(proto, "_setupRadioGroup");
		this.overrideAPI(proto, "_handleXTypeChange");
		this.overrideAPI(proto, "_setupSelect");
		this.overrideAPI(proto, "_setupComboBox");
		this.overrideAPI(proto, "_updateSelect");
		this.overrideAPI(proto, "_getAddressesFromAccounts");
		this.overrideAPI(proto, "_updateList");
	}
};

VelodromeSkin.prototype._provider_handleMailLoad = function() {
	if (window.ZmComposeView) {
        this.overrideAPI(ZmComposeView.prototype, "_getIdentityText");
	}
};

// register app listeners

ZmZimbraMail.addAppListener(
	ZmApp.PREFERENCES, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin._provider_handlePrefsPreLaunch)
);
ZmZimbraMail.addAppListener(
	ZmApp.MAIL, ZmAppEvent.PRE_LAUNCH, new AjxListener(skin, skin._provider_handleMailPreLaunch)
);
AjxDispatcher.addPackageLoadFunction("MailCore", new AjxCallback(skin, skin._provider_handleMailCoreLoad));

ZmZimbraMail.addAppListener(
	ZmApp.PREFERENCES, ZmAppEvent.POST_LAUNCH, new AjxListener(skin, skin._provider_handlePrefsPostLaunch)
);
