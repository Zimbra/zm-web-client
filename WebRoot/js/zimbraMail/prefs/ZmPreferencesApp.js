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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* @class
* Application for the preferences UI. This is where the preferences
* hook into the overall application.
*/
function ZmPreferencesApp(appCtxt, container) {

	ZmApp.call(this, ZmApp.PREFERENCES, appCtxt, container);

	AjxDispatcher.registerMethod("GetIdentityCollection", "PreferencesCore", new AjxCallback(this, this.getIdentityCollection));
	AjxDispatcher.registerMethod("GetDataSourceCollection", "PreferencesCore", new AjxCallback(this, this.getDataSourceCollection));
	AjxDispatcher.registerMethod("GetFilterRules", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterRules));
	AjxDispatcher.registerMethod("GetPrefController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPrefController));
	AjxDispatcher.registerMethod("GetPopAccountsController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPopAccountsController));
	AjxDispatcher.registerMethod("GetFilterController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterController));

	ZmOperation.registerOp("ADD_FILTER_RULE", {textKey:"newFilter", image:"Plus"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("EDIT_FILTER_RULE", {textKey:"filterEdit", image:"Edit"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("MOVE_DOWN_FILTER_RULE", {textKey:"filterMoveDown", image:"DownArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("MOVE_UP_FILTER_RULE", {textKey:"filterMoveUp", image:"UpArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("REMOVE_FILTER_RULE", {textKey:"filterRemove", image:"Delete"}, ZmSetting.FILTERS_ENABLED);

	ZmApp.registerApp(ZmApp.PREFERENCES,
							 {mainPkg:				"Preferences",
							  nameKey:				"options",
							  icon:					"Preferences",
							  chooserTooltipKey:	"goToOptions",
							  button:				ZmAppChooser.B_OPTIONS,
							  overviewTrees:		[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.MSG, ZmItem.CONV],
							  gotoActionCode:		ZmKeyMap.GOTO_OPTIONS,
							  chooserSort:			180
							  });
};

// Organizer and item-related constants
ZmEvent.S_FILTER			= "FILTER";
ZmEvent.S_DATA_SOURCE       = "DATA SOURCE";
ZmEvent.S_IDENTITY       	= "IDENTITY";
ZmItem.DATA_SOURCE			= ZmEvent.S_DATA_SOURCE;

// App-related constants
ZmApp.PREFERENCES					= "Options";
ZmApp.CLASS[ZmApp.PREFERENCES]		= "ZmPreferencesApp";
ZmApp.SETTING[ZmApp.PREFERENCES]	= ZmSetting.PREFERENCES_ENABLED;
ZmApp.LOAD_SORT[ZmApp.PREFERENCES]	= 10;
ZmApp.QS_ARG[ZmApp.PREFERENCES]		= "options";

ZmPreferencesApp.prototype = new ZmApp;
ZmPreferencesApp.prototype.constructor = ZmPreferencesApp;

ZmPreferencesApp.prototype.toString =
function() {
	return "ZmPreferencesApp";
};

ZmPreferencesApp.prototype.startup =
function(result) {
	var obj = result.getResponse().GetInfoResponse;
	AjxDispatcher.run("GetIdentityCollection").initialize(obj.identities);
	AjxDispatcher.run("GetDataSourceCollection").initialize(obj.dataSources);
};

ZmPreferencesApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["PreferencesCore", "Preferences"], false, loadCallback, null, true);
};

ZmPreferencesApp.prototype._handleLoadLaunch =
function(callback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, [callback]);
	this._appCtxt.getSettings().loadAvailableSkins(respCallback);
};

ZmPreferencesApp.prototype._handleResponseLaunch =
function(callback) {
	AjxDispatcher.run("GetPrefController").show();
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
        var prefController = AjxDispatcher.run("GetPrefController");
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
	if (!this._identityCollection) {
		this._identityCollection = new ZmIdentityCollection(this._appCtxt);
	}
	return this._identityCollection;
};
