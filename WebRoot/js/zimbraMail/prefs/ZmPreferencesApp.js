/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* @class
* Application for the preferences UI. This is where the preferences
* hook into the overall application.
*/
function ZmPreferencesApp(appCtxt, container) {
	ZmApp.call(this, ZmZimbraMail.PREFERENCES_APP, appCtxt, container);
};

ZmPreferencesApp.prototype = new ZmApp;
ZmPreferencesApp.prototype.constructor = ZmPreferencesApp;

ZmPreferencesApp.prototype.toString =
function() {
	return "ZmPreferencesApp";
};

ZmPreferencesApp.prototype.launch =
function(callback, errorCallback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, [callback]);
	this._appCtxt.getSettings().loadAvailableSkins(respCallback);
};

ZmPreferencesApp.prototype._handleResponseLaunch =
function(callback) {
	this.getPrefController().show();
	if (callback) {
		callback.run();
	}
};

ZmPreferencesApp.prototype.getPrefController =
function() {
	if (!this._prefController) {
		this._prefController = new ZmPrefController(this._appCtxt, this._container, this);
	}
	return this._prefController;
};

ZmPreferencesApp.prototype.getPopAccountsController =
function() {
    if (!this._popAccountsController) {
        var prefController = this.getPrefController();
        var prefsView = prefController.getPrefsView();
        this._popAccountsController = new ZmPopAccountsController(this._appCtxt, this._container, this, prefsView);
    }
    return this._popAccountsController;
};

ZmPreferencesApp.prototype.getFilterController =
function() {
	if (!this._filterController)
		this._filterController = new ZmFilterController(this._appCtxt, this._container, this);
	return this._filterController;
};

ZmPreferencesApp.prototype.getFilterRules =
function() {
	if (!this._filterRules)
		this._filterRules = new ZmFilterRules(this._appCtxt);
	return this._filterRules;
};

ZmPreferencesApp.prototype.getDataSourceCollection = function() {
    if (!this._dataSourceCollection) {
        this._dataSourceCollection = new ZmDataSourceCollection(this._appCtxt);
    }
    return this._dataSourceCollection;
};

ZmPreferencesApp.prototype.getIdentityCollection =
function() {
	return this._appCtxt.getIdentityCollection();
};

