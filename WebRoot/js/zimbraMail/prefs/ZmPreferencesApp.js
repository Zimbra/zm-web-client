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
ZmPreferencesApp = function(appCtxt, container) {

	ZmApp.call(this, ZmApp.PREFERENCES, appCtxt, container);
};

// Organizer and item-related constants
ZmEvent.S_FILTER			= "FILTER";
ZmEvent.S_DATA_SOURCE       = "DATA SOURCE";
ZmEvent.S_IDENTITY       	= "IDENTITY";
ZmItem.DATA_SOURCE			= ZmEvent.S_DATA_SOURCE;

// App-related constants
ZmApp.PREFERENCES					= "Options";
ZmApp.CLASS[ZmApp.PREFERENCES]		= "ZmPreferencesApp";
ZmApp.SETTING[ZmApp.PREFERENCES]	= ZmSetting.OPTIONS_ENABLED;
ZmApp.LOAD_SORT[ZmApp.PREFERENCES]	= 10;
ZmApp.QS_ARG[ZmApp.PREFERENCES]		= "options";

ZmPreferencesApp.prototype = new ZmApp;
ZmPreferencesApp.prototype.constructor = ZmPreferencesApp;

ZmPreferencesApp.prototype.toString =
function() {
	return "ZmPreferencesApp";
};

// Construction

ZmPreferencesApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetIdentityCollection", "PreferencesCore", new AjxCallback(this, this.getIdentityCollection));
	AjxDispatcher.registerMethod("GetDataSourceCollection", "PreferencesCore", new AjxCallback(this, this.getDataSourceCollection));
	AjxDispatcher.registerMethod("GetFilterRules", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterRules));
	AjxDispatcher.registerMethod("GetPrefController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPrefController));
	AjxDispatcher.registerMethod("GetPopAccountsController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPopAccountsController));
	AjxDispatcher.registerMethod("GetFilterController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterController));
};

ZmPreferencesApp.prototype._registerSettings =
function(settings) {
	var settings = settings || this._appCtxt.getSettings();
	settings.registerSetting("ALLOW_ANY_FROM_ADDRESS",	{name: "zimbraAllowAnyFromAddress", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("ALLOW_FROM_ADDRESSES",	{name: "zimbraAllowFromAddress", type: ZmSetting.T_COS, dataType: ZmSetting.D_LIST});
	settings.registerSetting("FILTERS_ENABLED",			{name: "zimbraFeatureFiltersEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN,	defaultValue: false});
	settings.registerSetting("IDENTITIES_ENABLED",		{name: "zimbraFeatureIdentitiesEnabled", type: ZmSetting.T_COS, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
};

ZmPreferencesApp.prototype._registerOperations =
function() {
	AjxDispatcher.setPackageLoadFunction("Preferences", new AjxCallback(this, this._postLoad));
	ZmOperation.registerOp("ADD_FILTER_RULE", {textKey:"newFilter", image:"Plus"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("EDIT_FILTER_RULE", {textKey:"filterEdit", image:"Edit"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("MOVE_DOWN_FILTER_RULE", {textKey:"filterMoveDown", image:"DownArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("MOVE_UP_FILTER_RULE", {textKey:"filterMoveUp", image:"UpArrow"}, ZmSetting.FILTERS_ENABLED);
	ZmOperation.registerOp("REMOVE_FILTER_RULE", {textKey:"filterRemove", image:"Delete"}, ZmSetting.FILTERS_ENABLED);
};

ZmPreferencesApp.prototype._registerApp =
function() {
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

ZmPreferencesApp.prototype._registerPrefs =
function() {
	var list = [ZmSetting.SEARCH_INCLUDES_SPAM, ZmSetting.SEARCH_INCLUDES_TRASH,
				ZmSetting.SHOW_SEARCH_STRING, ZmSetting.SHOW_SELECTION_CHECKBOX,
				ZmSetting.COMPOSE_AS_FORMAT, ZmSetting.COMPOSE_INIT_FONT_FAMILY,
				ZmSetting.COMPOSE_INIT_FONT_SIZE, ZmSetting.COMPOSE_INIT_FONT_COLOR,
				ZmSetting.SKIN_NAME, ZmSetting.PASSWORD];

	ZmPref.setPrefList("GENERAL_PREFS", list);
	ZmPref.setPrefList("SHORTCUT_PREFS", [ZmSetting.SHORTCUTS]);
	ZmPref.setPrefList("POP_ACCOUNTS_PREFS", []);

	ZmPref.registerPref("COMPOSE_AS_FORMAT", {
		displayName:		ZmMsg.composeUsing,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions: 	[ZmMsg.text, ZmMsg.htmlDocument],
		options: 			[ZmSetting.COMPOSE_TEXT, ZmSetting.COMPOSE_HTML],
		precondition:		ZmSetting.HTML_COMPOSE_ENABLED
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_FAMILY", {
		displayName:		ZmMsg.defaultFontSettings,
		displayContainer:	ZmPref.TYPE_FONT,
		displayOptions: 	["Arial", "Times New Roman", "Courier", "Verdana"],
		options: 			["Arial", "Times New Roman", "Courier", "Verdana"],
		precondition:		ZmSetting.HTML_COMPOSE_ENABLED
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_SIZE", {
		displayName:		null,
		displayContainer:	ZmPref.TYPE_FONT,
		displayOptions: 	["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"],
		precondition:		ZmSetting.HTML_COMPOSE_ENABLED
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_COLOR", {
		displayOptions: 	["rgb(0, 0, 0)"],
		displayContainer:	ZmPref.TYPE_FONT,
		precondition:		ZmSetting.HTML_COMPOSE_ENABLED
	});

	ZmPref.registerPref("COMPOSE_SAME_FORMAT", {
		displayName:		ZmMsg.replyForwardInSameFormat,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("LOCALE_NAME", {
		displayName:		ZmMsg.selectLanguage,
		displayContainer:	ZmPref.TYPE_SELECT,
		images:				[],
		displayOptions:		[],
		options:			[],
		loadFunction:		ZmPref.loadLocales,
		displaySeparator:	true,
		precondition:		ZmSetting.LOCALE_CHANGE_ENABLED
	});

	ZmPref.registerPref("PAGE_SIZE", {
		displayName:		ZmMsg.itemsPerPage,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		["10", "25", "50", "100"]
	});

	ZmPref.registerPref("PASSWORD", {
		displayName:		ZmMsg.changePassword,
		displayContainer:	ZmPref.TYPE_PASSWORD,
		precondition:		ZmSetting.CHANGE_PASSWORD_ENABLED,
		displaySeparator:	true
	});

	ZmPref.registerPref("POLLING_INTERVAL", {
		displayName:		ZmMsg.pollingInterval,
		displayContainer:	ZmPref.TYPE_INPUT,
		validationFunction: ZmPref.validatePollingInterval
	});

	ZmPref.registerPref("READING_PANE_ENABLED", {
		displayName:		ZmMsg.alwaysShowReadingPane,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator:	true
	});

	ZmPref.registerPref("SEARCH_INCLUDES_SPAM", {
		displayName:		ZmMsg.includeJunkFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.SPAM_ENABLED
	});

	ZmPref.registerPref("SEARCH_INCLUDES_TRASH", {
		displayName:		ZmMsg.includeTrashFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator:	true
	});

	ZmPref.registerPref("SHORTCUTS", {
		displayContainer:	ZmPref.TYPE_SHORTCUTS,
		precondition:		ZmSetting.USE_KEYBOARD_SHORTCUTS
	});

	ZmPref.registerPref("SHOW_FRAGMENTS", {
		displayName:		ZmMsg.showFragments,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("SHOW_SEARCH_STRING", {
		displayName:		ZmMsg.showSearchString,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("SHOW_SELECTION_CHECKBOX", {
		displayName:		ZmMsg.showSelectionString,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator:	true
	});

	ZmPref.registerPref("SKIN_NAME", {
		displayName:		ZmMsg.selectSkin,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[],
		options:			[],
		loadFunction:		ZmPref.loadSkins,
		displaySeparator:	true,
		precondition:		ZmSetting.SKIN_CHANGE_ENABLED
	});

	ZmPref.registerPref("VIEW_AS_HTML", {
		displayName:		ZmMsg.viewMailAsHtml,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
};

// App API

ZmPreferencesApp.prototype.startup =
function(result) {
	var obj = result.getResponse().GetInfoResponse;
	AjxDispatcher.run("GetIdentityCollection").initialize(obj.identities);
	AjxDispatcher.run("GetDataSourceCollection").initialize(obj.dataSources);
};

ZmPreferencesApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["PreferencesCore", "Preferences"], true, loadCallback, null, true);
};

ZmPreferencesApp.prototype._handleLoadLaunch =
function(callback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, [callback]);
	this._appCtxt.getSettings().loadSkinsAndLocales(respCallback);
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

ZmPreferencesApp.prototype._postLoad =
function() {
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = this._appCtxt.getApp(ZmApp.APPS[i]);
		if (app._registerPrefs) {
			app._registerPrefs();
		}
	}
};
