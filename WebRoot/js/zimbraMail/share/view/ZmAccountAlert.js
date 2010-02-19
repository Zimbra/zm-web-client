/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates the account alert.
 * @class
 * This class represents an alert that highlights and flashes an account accordion item.
 *
 * @param {ZmAccount}		account		the account
 * 
 * @extends		ZmAlert
 */
ZmAccountAlert = function(account) {
	ZmAlert.call(this);
	this.account = account;
	this._alertApps = {};
	appCtxt.accountList.addActiveAcountListener(new AjxListener(this, this._accountListener));
};

ZmAccountAlert.prototype = new ZmAlert;
ZmAccountAlert.prototype.constructor = ZmAccountAlert;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccountAlert.prototype.toString =
function() {
	return "ZmAccountAlert";
};

/**
 * Gets the alert by account. If the alert does not exist for the specified account, a new 
 * alert is created
 * 
 * @param	{ZmAccount}	account		the account
 * @return	{ZmAccountAlert}		the alert
 */
ZmAccountAlert.get =
function(account) {
	ZmAccountAlert.INSTANCES = ZmAccountAlert.INSTANCES || {};
	if (!ZmAccountAlert.INSTANCES[account.id]) {
		ZmAccountAlert.INSTANCES[account.id] = new ZmAccountAlert(account);
	}
	return ZmAccountAlert.INSTANCES[account.id];
};

/**
 * Starts the alert.
 * 
 * @param		{ZmApp}		app		the application
 */
ZmAccountAlert.prototype.start =
function(app) {
	if (this.account != appCtxt.getActiveAccount()) {
		this._started = true;
		if (app) {
			this._alertApps[app.getName()] = app;
		}
	}
};

/**
 * Stops the alert.
 * 
 */
ZmAccountAlert.prototype.stop =
function() {
	this._started = false;
};

ZmAccountAlert.prototype._accountListener =
function(evt) {
	if (evt.account == this.account) {
		this.stop();
		for (var appName in this._alertApps) {
			this._alertApps[appName].startAlert();
		}
		this._alertApps = {};
	}
};
