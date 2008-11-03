/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 *
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 *
 * ***** END LICENSE BLOCK *****
 */

ZmImPrefsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
	ZmImPrefsPage.INSTANCE = this;
	this._gatewayControls = {};
};

ZmImPrefsPage.prototype = new ZmPreferencesPage;
ZmImPrefsPage.prototype.constructor = ZmImPrefsPage;

ZmImPrefsPage.prototype.toString = function() {
	return "ZmImPrefsPage";
};

ZmImPrefsPage.login =
function() {
	ZmImApp.INSTANCE.login();
};

ZmImPrefsPage.prototype.showMe =
function() {
	ZmPreferencesPage.prototype.showMe.call(this);
};

ZmImPrefsPage.prototype.reset =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	this._resetGateways();
};

/*
 * ZmPrefView.getChangedPrefs() doesn't quite work for performing a dirty check on this page since
 * it only returns true if a changed setting is stored in LDAP (has a 'name' property in its ZmSetting
 * object). This override checks the gateway-related settings to see if they changed.
 */
ZmImPrefsPage.prototype.isDirty =
function(section, list, errors) {
	// Check if the ZmSettings on this page are dirty
	var dirty = this._controller.getPrefsView()._checkSection(section, this, true, true, list, errors);
	if (dirty) {
		return dirty;
	}
	// Check if the gateways are dirty.
	for (var type in this._gatewayControls) {
		if (this._gatewayControls[type].isDirty()) {
			return true;
		}
	}
	return false;
};

ZmImPrefsPage.prototype.addCommand =
function(batchCmd) {
	for (var type in this._gatewayControls) {
		var control = this._gatewayControls[type];
		if (control.isDirty()) {
			var roster;
			roster = roster || AjxDispatcher.run("GetRoster");

			var name = control.getName();
			var password = control.getPassword();
			if (!name && !password) {
				roster.unregisterGateway(type, batchCmd);
			} else {
				roster.registerGateway(type, name, password, batchCmd)
			}
		}
	}
};

ZmImPrefsPage.prototype._resetGateways =
function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);

	var gateways = ZmImApp.INSTANCE.getRoster().getGateways();
	for (var i = 1, count = gateways.length; i < count; i++) {
		var gateway = gateways[i];
		var control = this._gatewayControls[gateway.type];
		if (control) {
			control.reset();
		}
	}
};

ZmImPrefsPage.prototype._getTemplateData =
function() {
	var data = ZmPreferencesPage.prototype._getTemplateData.call(this);
	data.loginMsg = AjxMessageFormat.format(ZmMsg.imNotLoggedInPrefs, "ZmImPrefsPage.login()");
	data.hasAccounts = ZmImServiceController.INSTANCE.getSupportsAccounts();
	return data;
};

ZmImPrefsPage.prototype._createGatewayControls =
function() {
	var gateways = ZmImApp.INSTANCE.getRoster().getGateways();
	for (var i = 1, count = gateways.length; i < count; i++) {
		var gateway = gateways[i];
		if (this._gatewayControls[gateway.type]) {
			this._gatewayControls[gateway.type].setGateway(gateway);
		} else {
			
			if (this._hasGatewayControl) {
				var separatorDiv = document.createElement("DIV");
				separatorDiv.innerHTML = AjxTemplate.expand("prefs.Pages#ZmImAccountSeparator");
				this._accountsEl.appendChild(separatorDiv);
			}
			var div = document.createElement("DIV");
			var args = {
				id: this._htmlElId + "_" + gateway.type,
				name: AjxStringUtil.capitalize(gateway.type),
				nameLower: gateway.type
			};
			div.innerHTML = AjxTemplate.expand("prefs.Pages#ZmImAccountRow", args);
			this._accountsEl.appendChild(div);
			var controlArgs = {
				parent: this,
				parentElement: args.id + "_valueCell",
				id: this._htmlElId + gateway.type,
				gateway: gateway
			};
			var control = new ZmImGatewayControl(controlArgs);
			this._gatewayControls[gateway.type] = control;
			this._hasGatewayControl = true;
			this._tabGroup.addMember(control.tabGroup);
		}
	}
};

ZmImPrefsPage.prototype._createControls =
function() {
	ZmImApp.INSTANCE.addGatewayListListener(new AjxListener(this, this._gatewayListListener));
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
	this._notLoggedInEl = document.getElementById(this._htmlElId + "_imAccountsNotLoggedIn");
	this._accountsEl = document.getElementById(this._htmlElId + "_imAccounts");
	this._updateAccountsSection();
};

ZmImPrefsPage.prototype._updateAccountsSection =
function() {
	if (!ZmImServiceController.INSTANCE.getSupportsAccounts()) {
		return;
	}
	var loggedIn = ZmImApp.loggedIn();
	Dwt.setVisible(this._notLoggedInEl, !loggedIn);
	Dwt.setVisible(this._accountsEl, loggedIn);
	if (loggedIn) {
		this._createGatewayControls();
		this._resetGateways();
	}
};

ZmImPrefsPage.prototype._gatewayListListener =
function() {
	this._updateAccountsSection();
};