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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
ZmPreferencesApp = function(container) {
	ZmApp.call(this, ZmApp.PREFERENCES, container);

	// must be hash for case of multi-accounts
	this._filterRules = {};
	this._dataSourceCollection = {};
	this._identityCollection = {};
	this._signatureCollection = {};
};

// Organizer and item-related constants
ZmEvent.S_FILTER			= "FILTER";
ZmEvent.S_DATA_SOURCE       = "DATA SOURCE";
ZmEvent.S_IDENTITY       	= "IDENTITY";
ZmEvent.S_SIGNATURE			= "SIGNATURE";
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

//
// Public methods
//

// App API

ZmPreferencesApp.prototype.startup =
function(result) {
	var obj = result.getResponse().GetInfoResponse;
	appCtxt.getIdentityCollection().initialize(obj.identities);
	AjxDispatcher.run("GetDataSourceCollection").initialize(obj.dataSources);
	appCtxt.getSignatureCollection().initialize(obj.signatures);
};

ZmPreferencesApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["PreferencesCore", "Preferences"], true, loadCallback, null, true);
};

// Public methods

ZmPreferencesApp.prototype.getPrefController =
function() {
	if (!this._prefController) {
		this._prefController = new ZmPrefController(this._container, this);
	}
	return this._prefController;
};

ZmPreferencesApp.prototype.getFilterController =
function() {
	if (!this._filterController)
		this._filterController = new ZmFilterController(this._container, this);
	return this._filterController;
};

ZmPreferencesApp.prototype.getFilterRules =
function() {
	var activeAcct = appCtxt.getActiveAccount().name;
	if (!this._filterRules[activeAcct]) {
		this._filterRules[activeAcct] = new ZmFilterRules();
	}
	return this._filterRules[activeAcct];
};

ZmPreferencesApp.prototype.getDataSourceCollection =
function() {
	var activeAcct = appCtxt.getActiveAccount().name;
	if (!this._dataSourceCollection[activeAcct]) {
		this._dataSourceCollection[activeAcct] = new ZmDataSourceCollection();
	}
	return this._dataSourceCollection[activeAcct];
};

ZmPreferencesApp.prototype.getIdentityCollection =
function() {
	var activeAcct = appCtxt.getActiveAccount().name;
	if (!this._identityCollection[activeAcct]) {
		this._identityCollection[activeAcct] = new ZmIdentityCollection();
	}
	return this._identityCollection[activeAcct];
};

ZmPreferencesApp.prototype.getSignatureCollection =
function() {
	var activeAcct = appCtxt.getActiveAccount().name;
	if (!this._signatureCollection[activeAcct]) {
		this._signatureCollection[activeAcct] = new ZmSignatureCollection();
	}
	return this._signatureCollection[activeAcct];
};

//
// Protected methods
//

// Construction

ZmPreferencesApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetIdentityCollection", "PreferencesCore", new AjxCallback(this, this.getIdentityCollection));
	AjxDispatcher.registerMethod("GetSignatureCollection", "PreferencesCore", new AjxCallback(this, this.getSignatureCollection));
	AjxDispatcher.registerMethod("GetDataSourceCollection", "PreferencesCore", new AjxCallback(this, this.getDataSourceCollection));
	AjxDispatcher.registerMethod("GetFilterRules", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterRules));
	AjxDispatcher.registerMethod("GetPrefController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPrefController));
	AjxDispatcher.registerMethod("GetFilterController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterController));
};

ZmPreferencesApp.prototype._registerOperations =
function() {
	AjxDispatcher.setPackageLoadFunction("Preferences", new AjxCallback(this, this._postLoad));
};

ZmPreferencesApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.PREFERENCES,
							 {mainPkg:				"Preferences",
							  nameKey:				"preferences",
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
	var sections = {
		GENERAL: {
			title: ZmMsg.general,
			templateId: "zimbraMail.prefs.templates.Pages#General",
			priority: 0,
			prefs: [
				ZmSetting.LOCALE_NAME,
				ZmSetting.PASSWORD,
				ZmSetting.SEARCH_INCLUDES_SPAM,
				ZmSetting.SEARCH_INCLUDES_TRASH,
				ZmSetting.SHOW_SEARCH_STRING,
				ZmSetting.SHOW_SELECTION_CHECKBOX,
				ZmSetting.SKIN_NAME,
				ZmSetting.CLIENT_TYPE
			]
		},
		COMPOSING: {
			title: ZmMsg.composing,
			templateId: "zimbraMail.prefs.templates.Pages#Composing",
			priority: 20,
			precondition: [ ZmSetting.MAIL_ENABLED, ZmSetting.CALENDAR_ENABLED, ZmSetting.NOTEBOOK_ENABLED ],
			prefs: [
				ZmSetting.COMPOSE_AS_FORMAT,
				ZmSetting.COMPOSE_INIT_FONT_COLOR,
				ZmSetting.COMPOSE_INIT_FONT_FAMILY,
				ZmSetting.COMPOSE_INIT_FONT_SIZE,
				ZmSetting.FORWARD_INCLUDE_ORIG,
				ZmSetting.NEW_WINDOW_COMPOSE,
				ZmSetting.REPLY_INCLUDE_ORIG,
				ZmSetting.REPLY_PREFIX,
				ZmSetting.SAVE_TO_SENT
			]
		},
		SHORTCUTS: {
			title: ZmMsg.shortcuts,
			templateId: "zimbraMail.prefs.templates.Pages#Shortcuts",
			priority: 100,
			precondition: ZmSetting.USE_KEYBOARD_SHORTCUTS,
			prefs: [
				ZmSetting.SHORTCUTS
			],
			createView: function(parent, section, controller) {
				return new ZmShortcutsPage(parent, section.id, controller);
			}
		}
	};
	for (var id in sections) {
		ZmPref.registerPrefSection(id, sections[id]);
	}

	ZmPref.registerPref("CLIENT_TYPE", {
		displayName:		ZmMsg.clientType,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions: 	[ZmMsg.clientAdvanced, ZmMsg.clientStandard],
		options: 			[ZmSetting.CLIENT_ADVANCED, ZmSetting.CLIENT_STANDARD]
	});

	ZmPref.registerPref("COMPOSE_AS_FORMAT", {
		displayName:		ZmMsg.composeUsing,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions: 	[ZmMsg.composeAsHTML, ZmMsg.composeAsText],
		options: 			[ZmSetting.COMPOSE_HTML, ZmSetting.COMPOSE_TEXT],
		precondition:		ZmSetting.HTML_COMPOSE_ENABLED
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_COLOR", {
		displayOptions: 	["rgb(0, 0, 0)"],
		displayContainer:	ZmPref.TYPE_COLOR,
		precondition:		[ZmSetting.HTML_COMPOSE_ENABLED, ZmSetting.NOTEBOOK_ENABLED]
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_FAMILY", {
		displayName:		ZmMsg.defaultFontSettings,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions: 	["Arial", "Times New Roman", "Courier", "Verdana"],
		options: 			["Arial", "Times New Roman", "Courier", "Verdana"],
		precondition:		[ZmSetting.HTML_COMPOSE_ENABLED, ZmSetting.NOTEBOOK_ENABLED]
	});

	ZmPref.registerPref("COMPOSE_INIT_FONT_SIZE", {
		displayName:		null,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions: 	["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"],
		precondition:		[ZmSetting.HTML_COMPOSE_ENABLED, ZmSetting.NOTEBOOK_ENABLED]
	});

	ZmPref.registerPref("COMPOSE_SAME_FORMAT", {
		displayName:		ZmMsg.replyForwardInSameFormat,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	ZmPref.registerPref("FORWARD_INCLUDE_ORIG", {
		displayName:		ZmMsg.forwardInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.includeInBody, ZmMsg.includePrefix, ZmMsg.includeOriginalAsAttach],
		options:			[ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, ZmSetting.INCLUDE_ATTACH]
	});

	ZmPref.registerPref("LOCALE_NAME", {
		displayName:		ZmMsg.selectLanguage,
		displayContainer:	ZmPref.TYPE_LOCALES,
		images:				[],
		displayOptions:		[],
        options:			[],
        loadFunction:		ZmPref.loadLocales,
		displaySeparator:	true,
		precondition:		ZmSetting.LOCALE_CHANGE_ENABLED
	});

	ZmPref.registerPref("NEW_WINDOW_COMPOSE", {
		displayName:		ZmMsg.composeInNewWin,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.MAIL_ENABLED,
		displaySeparator: 	true
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
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ ZmMsg.pollNever, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes ],
		// NOTE: 525600 is the number of minutes in a year. I think that's a
		//       reasonable value for "never" since the server must have
		//       *some* number.
		options:			[ 525600, 5, 10, 15, 30, 60],
		approximateFunction: ZmPref.approximateInterval,
		validationFunction: ZmPref.validatePollingInterval
	});

	ZmPref.registerPref("READING_PANE_ENABLED", {
		displayName:		ZmMsg.alwaysShowReadingPane,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		displaySeparator:	true
	});

	ZmPref.registerPref("REPLY_INCLUDE_ORIG", {
		displayName:		ZmMsg.replyInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.dontInclude,
							 ZmMsg.includeInBody, ZmMsg.includePrefix,
							 ZmMsg.includeOriginalAsAttach,
							 ZmMsg.smartInclude],
		options:			[ZmSetting.INCLUDE_NONE,
							 ZmSetting.INCLUDE, ZmSetting.INCLUDE_PREFIX, 
							 ZmSetting.INCLUDE_ATTACH,
							 ZmSetting.INCLUDE_SMART]
	});

	ZmPref.registerPref("REPLY_PREFIX", {
		displayName:		ZmMsg.prefix,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[">", "|"],
		displaySeparator:	true
	});

	ZmPref.registerPref("SAVE_TO_SENT", {
		displayName:		ZmMsg.saveToSent,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		precondition:		ZmSetting.MAIL_ENABLED,
		displayOptions:		[ ZmMsg.saveToSent, ZmMsg.saveToSentNOT ],
		options:			[ true, false ]
	});

	ZmPref.registerPref("SEARCH_INCLUDES_SPAM", {
		displayName:		ZmMsg.includeJunkFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		AjxCallback.simpleClosure(ZmPref.requireAllPreConditions, null, ZmSetting.MAIL_ENABLED, ZmSetting.SPAM_ENABLED)
	});

	ZmPref.registerPref("SEARCH_INCLUDES_TRASH", {
		displayName:		ZmMsg.includeTrashFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		[ZmSetting.MAIL_ENABLED, ZmSetting.CONTACTS_ENABLED],
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
		displayContainer:	ZmPref.TYPE_CHECKBOX
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
		displayName:		ZmMsg.displayMail,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
        orientation:        ZmPref.ORIENT_HORIZONTAL,
        displayOptions:     [ZmMsg.displayAsHTML, ZmMsg.displayAsText],
        options:            [true, false]
    });
};

// other

ZmPreferencesApp.prototype._handleLoadLaunch =
function(callback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, [callback]);
	appCtxt.getSettings().loadSkinsAndLocales(respCallback);
};

ZmPreferencesApp.prototype._handleResponseLaunch =
function(callback) {
	AjxDispatcher.run("GetPrefController").show();
	if (callback) {
		callback.run();
	}
};

ZmPreferencesApp.prototype.refresh =
function(refresh) {
	this._handleRefresh();
};

ZmPreferencesApp.prototype._postLoad =
function() {
	appCtxt.getAppController().runAppFunction("_registerPrefs", true);
};
