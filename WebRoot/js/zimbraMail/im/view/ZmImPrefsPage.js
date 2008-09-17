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
	//TODO.....
	alert('work in progress.')
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
	//TODO: Do I need to add/remove controls if the gateway list changed????
	}
};

ZmImPrefsPage.prototype._getTemplateData =
function() {
	var data = ZmPreferencesPage.prototype._getTemplateData.call(this);
	data.loginMsg = AjxMessageFormat.format(ZmMsg.imNotLoggedInPrefs, "ZmImPrefsPage.login");
	return data;
};

ZmImPrefsPage.prototype._createControls =
function() {
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);
	this._notLoggedInEl = document.getElementById(this._htmlElId + "_imAccountsNotLoggedIn");
	this._accountsEl = document.getElementById(this._htmlElId + "_imAccounts");
	var loggedIn = ZmImApp.loggedIn();
	Dwt.setVisible(this._notLoggedInEl, !loggedIn);
	Dwt.setVisible(this._accountsEl, loggedIn);
	if (loggedIn) {
		var gateways = ZmImApp.INSTANCE.getRoster().getGateways();
		for (var i = 1, count = gateways.length; i < count; i++) {
			var gateway = gateways[i];
			var row = this._accountsEl.insertRow(-1);
			var labelCell = row.insertCell(-1);
			labelCell.className = "ZOptionsLabel";
			var args = {
				name: AjxStringUtil.capitalize(gateway.type),
				nameLower: gateway.type 
			};
			labelCell.innerHTML = AjxTemplate.expand("prefs.Pages#ImAccountLabel", args);
			var valueCell = row.insertCell(-1);
			valueCell.className = "ZOptionsField";
			var controlArgs = {
				parent: this,
				parentElement: valueCell,
				id: this._htmlElId + gateway.type,
				gateway: gateway
			};
			this._gatewayControls[gateway.type] = new ZmImGatewayControl(controlArgs);
		}
		this._resetGateways();
	}
};

