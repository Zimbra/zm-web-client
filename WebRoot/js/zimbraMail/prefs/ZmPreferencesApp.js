/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates the preferences application.
 * @class
 * This class represents the application for the preferences UI. This is where the preferences
 * hook into the overall application.
 * 
 * @param	{DwtControl}	container	the control that contains components
 * @param	{ZmController}	parentController	the parent window controller (set by the child window)
 * 
 * @extends		ZmApp
 */
ZmPreferencesApp = function(container, parentController) {
	ZmApp.call(this, ZmApp.PREFERENCES, container, parentController);

	// must be hash for case of multi-accounts
	this._filterRules = {};
};

// Organizer and item-related constants
ZmEvent.S_FILTER					= "FILTER";
ZmEvent.S_PREF_ZIMLET				= "PREF_ZIMLET";

// App-related constants
/**
 * Defines the "preferences" application.
 */
ZmApp.PREFERENCES					= ZmId.APP_PREFERENCES;
ZmApp.CLASS[ZmApp.PREFERENCES]		= "ZmPreferencesApp";
ZmApp.SETTING[ZmApp.PREFERENCES]	= ZmSetting.OPTIONS_ENABLED;
ZmApp.LOAD_SORT[ZmApp.PREFERENCES]	= 10;
ZmApp.QS_ARG[ZmApp.PREFERENCES]		= "options";
ZmOrganizer.PREF_PAGE				= "PREF_PAGE";

ZmPreferencesApp.prototype = new ZmApp;
ZmPreferencesApp.prototype.constructor = ZmPreferencesApp;

ZmPreferencesApp.prototype.toString =
function() {
	return "ZmPreferencesApp";
};

// NOTE: This is registered staticly to guarantee that all of the
//       enabled app's preferences will be registered by the time
//       that another app listener gets the launch event and may
//       want to alter those prefs.
ZmPreferencesApp._registerAllPrefs =
function() {
	AjxDispatcher.require("PreferencesCore");
	appCtxt.getAppController().runAppFunction("_registerPrefs");
};
ZmZimbraMail.addAppListener(ZmApp.PREFERENCES, ZmAppEvent.PRE_LAUNCH, new AjxListener(ZmPreferencesApp._registerAllPrefs));

//
// Public methods
//

// App API

ZmPreferencesApp.prototype.launch =
function(params, callback) {
	// first time launch of prefs app should reset active app to "local" account
	if (appCtxt.multiAccounts) {
		appCtxt.accountList.setActiveAccount(appCtxt.accountList.mainAccount);
	}
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["PreferencesCore", "Preferences"], true, loadCallback, null, true);
};

// Public methods

/**
 * Gets the preferences controller.
 * 
 * @return	{ZmPrefController}	the controller
 */
ZmPreferencesApp.prototype.getPrefController =
function() {
	if (!this._prefController) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._prefController = new ZmPrefController(this._container, this);
	}
	return this._prefController;
};

/**
 * Gets the filter controller.
 * 
 * @return	{ZmFilterController}	the controller
 */
ZmPreferencesApp.prototype.getFilterController =
function() {
	if (!this._filterController) {
		this._filterController = new ZmFilterController(this._container, this);
	}
	return this._filterController;
};

/**
 * Gets the filter rules.
 * 
 * @param	{String}	[accountName]		the account name or <code>null</code> to use the active account
 * @return	{ZmFilterRules}		the filter rules
 */
ZmPreferencesApp.prototype.getFilterRules =
function(accountName) {
	var ac = window.parentAppCtxt || window.appCtxt;
	var acct = accountName || ac.getActiveAccount().name;

	if (!this._filterRules[acct]) {
		this._filterRules[acct] = new ZmFilterRules(acct);
	}
	return this._filterRules[acct];
};

ZmPreferencesApp.prototype.modifyNotify =
function(modifies, force) {

	var sharingView = this._getSharingView();
	if (sharingView) {
		sharingView.notifyModify(modifies);
	}
};

ZmPreferencesApp.prototype.refresh =
function(refresh) {

	if (!appCtxt.inStartup) {
		var sharingView = this._getSharingView();
		if (sharingView) {
			sharingView.refresh(refresh);
		}
	}
};


//
// Protected methods
//

// Construction

ZmPreferencesApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetFilterRules", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterRules));
	AjxDispatcher.registerMethod("GetPrefController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getPrefController));
	AjxDispatcher.registerMethod("GetFilterController", ["PreferencesCore", "Preferences"], new AjxCallback(this, this.getFilterController));
};

ZmPreferencesApp.prototype._registerOrganizers =  function() {
	ZmOrganizer.registerOrg(ZmOrganizer.PREF_PAGE,
							{app:				ZmApp.PREFERENCES,
							 orgClass:			"ZmPrefPage",
							 orgPackage:		"PreferencesCore",
							 treeController:	"ZmPrefPageTreeController",
							 labelKey:			"preferences",
							 treeType:			ZmOrganizer.PREF_PAGE,
							 displayOrder:		100
							});

};

ZmPreferencesApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp(ZmId.OP_MOBILE_REMOVE, {textKey:"mobileRemoveFromList", image:"Delete"});
	ZmOperation.registerOp(ZmId.OP_MOBILE_RESUME_SYNC, {textKey:"mobileResumeSync", image:"ImAvailable"});
	ZmOperation.registerOp(ZmId.OP_MOBILE_SUSPEND_SYNC, {textKey:"mobileSuspendSync", image:"Offline"});
	ZmOperation.registerOp(ZmId.OP_MOBILE_WIPE, {textKey:"mobileWipe", image:"MobileWipe"}, ZmSetting.MOBILE_POLICY_ENABLED);
	ZmOperation.registerOp(ZmId.OP_MOBILE_CANCEL_WIPE, {textKey:"mobileWipeCancel", image:"MobileWipeCancel"}, ZmSetting.MOBILE_POLICY_ENABLED);
};

ZmPreferencesApp.prototype._registerSettings =
function(settings) {
	settings = settings || appCtxt.getSettings();
	settings.registerSetting("IMPORT_FOLDER",				{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_NONE});
	settings.registerSetting("IMPORT_BUTTON",				{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_NONE});
	settings.registerSetting("EXPORT_FOLDER",				{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_NONE});
	settings.registerSetting("EXPORT_BUTTON",				{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_NONE});
	settings.registerSetting("PREF_SECTIONS",				{type:ZmSetting.T_PSEUDO, dataType:ZmSetting.D_HASH, isGlobal:true});
	settings.registerSetting("SIGNATURE_MAX_LENGTH",		{name:"zimbraMailSignatureMaxLength", type:ZmSetting.T_COS, dataType:ZmSetting.D_INT, defaultValue:1024});
	settings.registerSetting("DISCARD_IN_FILTER_ENABLED",	{name:"zimbraFeatureDiscardInFiltersEnabled", type:ZmSetting.T_COS, dataType:ZmSetting.D_BOOLEAN, defaultValue:true});
};

ZmPreferencesApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.PREFERENCES,
							 {mainPkg:				"Preferences",
							  nameKey:				"preferences",
							  icon:					"Preferences",
							  textPrecedence:		50,
							  chooserTooltipKey:	"goToOptions",
							  button:				appCtxt.isChildWindow ? null : ZmAppChooser.B_OPTIONS,
							  overviewTrees:		[ZmOrganizer.PREF_PAGE],
							  hideZimlets:			true,
							  gotoActionCode:		ZmKeyMap.GOTO_OPTIONS,
							  chooserSort:			180
                  });
};

ZmPreferencesApp.prototype._registerPrefs =
function() {
	var sections = {
		GENERAL: {
			title: ZmMsg.general,
			templateId: "prefs.Pages#General",
			priority: 0,
			prefs: [
				ZmSetting.LOCALE_NAME,
				ZmSetting.PASSWORD,
				ZmSetting.SEARCH_INCLUDES_SPAM,
				ZmSetting.SEARCH_INCLUDES_TRASH,
				ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES,
				ZmSetting.SHOW_SEARCH_STRING,
				ZmSetting.PAGE_SIZE,
				ZmSetting.SHOW_SELECTION_CHECKBOX,
				ZmSetting.SKIN_NAME,
				ZmSetting.CLIENT_TYPE,
				ZmSetting.DEFAULT_TIMEZONE,
                ZmSetting.DEFAULT_PRINTFONTSIZE,
				ZmSetting.OFFLINE_IS_MAILTO_HANDLER,
				ZmSetting.OFFLINE_NOTEBOOK_SYNC_ENABLED // offline
			]
		},
		COMPOSING: {
			parentId: "MAIL",
			title: ZmMsg.composing,
			icon: "Compose",
			templateId: "prefs.Pages#Composing",
			priority: 20,
			precondition: [ ZmSetting.MAIL_ENABLED ],
			prefs: [
				ZmSetting.COMPOSE_AS_FORMAT,
				ZmSetting.COMPOSE_INIT_FONT_COLOR,
				ZmSetting.COMPOSE_INIT_FONT_FAMILY,
				ZmSetting.COMPOSE_INIT_FONT_SIZE,
				ZmSetting.FORWARD_INCLUDE_WHAT,
				ZmSetting.FORWARD_USE_PREFIX,
				ZmSetting.FORWARD_INCLUDE_HEADERS,
				ZmSetting.NEW_WINDOW_COMPOSE,
				ZmSetting.AUTO_SAVE_DRAFT_INTERVAL,
				ZmSetting.REPLY_INCLUDE_WHAT,
				ZmSetting.REPLY_USE_PREFIX,
				ZmSetting.REPLY_INCLUDE_HEADERS,
				ZmSetting.REPLY_PREFIX,
				ZmSetting.SAVE_TO_SENT,
                ZmSetting.COMPOSE_SAME_FORMAT,
                ZmSetting.MAIL_MANDATORY_SPELLCHECK
            ]
		},
		SHARING: {
			title: ZmMsg.sharing,
			icon: "SharedContact",
			templateId: "prefs.Pages#SharingPrefPage",
			priority: 85,
			precondition: ZmSetting.SHARING_ENABLED,
			manageChanges: true,
			createView: function(parent, section, controller) {
				AjxDispatcher.require("Share");
				return new ZmSharingPage(parent, section, controller);
			}
		},
		MOBILE: {
			title: ZmMsg.mobileDevices,
			icon: "Mobile",
			templateId: "prefs.Pages#MobileDevices",
			priority: 90,
			precondition: ZmSetting.MOBILE_SYNC_ENABLED,
			manageChanges: true,
			createView: function(parent, section, controller) {
				return new ZmMobileDevicesPage(parent, section, controller);
			}
		},
		IMPORT_EXPORT: {
			title: ZmMsg.importExport,
			icon: "SendReceive",
			templateId: "data.ImportExport#ImportExportPrefPage",
			priority: 100,
			precondition: ZmSetting.IMPORT_EXPORT_ENABLED,
			prefs: [
				ZmSetting.IMPORT_FOLDER,
				ZmSetting.IMPORT_BUTTON,
				ZmSetting.EXPORT_FOLDER,
				ZmSetting.EXPORT_BUTTON
			],
			manageChanges: true,
			createView: function(parent, section, controller) {
				AjxDispatcher.require("ImportExport");
				return new ZmImportExportPage(parent, section, controller);
			}
		},
		SHORTCUTS: {
			title: ZmMsg.shortcuts,
			icon: "Shortcut",
			templateId: "prefs.Pages#Shortcuts",
			priority: 120,
			precondition: ZmSetting.USE_KEYBOARD_SHORTCUTS,
			createView: function(parent, section, controller) {
				return new ZmShortcutsPage(parent, section, controller);
			}
		},
        PREF_ZIMLETS: {
			title: ZmMsg.zimlets,
	        icon: "Zimlet",
			templateId: "prefs.Pages#Zimlets",
			manageDirty: true,
            priority: 140,
			precondition: ZmSetting.CHECKED_ZIMLETS_ENABLED,
			prefs: [
				ZmSetting.CHECKED_ZIMLETS    
			],
            createView: function(parent, section, controller) {
				return new ZmZimletsPage(parent, section, controller);
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

	// Yuck: Should add functionality in Pref. to add prefix/postfix to all options. Meanwhile...
	var fontSizeOptions = [AjxMessageFormat.format(ZmMsg.pt,"8"), AjxMessageFormat.format(ZmMsg.pt,"10"),
        AjxMessageFormat.format(ZmMsg.pt,"12"), AjxMessageFormat.format(ZmMsg.pt,"14"), AjxMessageFormat.format(ZmMsg.pt,"18"),
        AjxMessageFormat.format(ZmMsg.pt,"24"), AjxMessageFormat.format(ZmMsg.pt,"36")];
    //Server values are stored with 'pt' to work irrespective of locale, while display options are as per the respective locale 
    var fontSizeValueOptions = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
	ZmPref.registerPref("COMPOSE_INIT_FONT_SIZE", {
		displayName:		null,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions: 	fontSizeOptions,
        options:            fontSizeValueOptions,
		precondition:		[ZmSetting.HTML_COMPOSE_ENABLED, ZmSetting.NOTEBOOK_ENABLED]
	});

	ZmPref.registerPref("COMPOSE_SAME_FORMAT", {
		displayName:		ZmMsg.replyForwardInSameFormat,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

    ZmPref.registerPref("CHECKED_ZIMLETS", {
		displayName:		ZmMsg.zimlets,
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

    ZmPref.registerPref("DEFAULT_TIMEZONE", {
        displayName:		ZmMsg.selectTimezone,
        displayContainer:	ZmPref.TYPE_SELECT,
        displayParams:		{ cascade: false },
        displayOptions:		AjxTimezone.getZonePreferences(),
        options:			AjxTimezone.getZonePreferencesOptions()
    });

    ZmPref.registerPref("DEFAULT_PRINTFONTSIZE", {
		displayName:		ZmMsg.printFontSizePref,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions: 	fontSizeOptions,
        options:            fontSizeValueOptions
	});

    ZmPref.registerPref("EXPORT_FOLDER", {
        displayContainer:	ZmPref.TYPE_CUSTOM
    });

    ZmPref.registerPref("EXPORT_BUTTON", {
        displayName:		ZmMsg._export,
        displayContainer:	ZmPref.TYPE_CUSTOM
    });

	ZmPref.registerPref("FORWARD_INCLUDE_WHAT", {
		displayName:		ZmMsg.forwardInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.includeInBody, ZmMsg.includeOriginalAsAttach],
		options:			[ZmSetting.INC_BODY, ZmSetting.INC_ATTACH],
        setFunction:		ZmPref.setIncludeOrig,
		initFunction:		ZmPref.initIncludeWhat,
		changeFunction:		ZmPref.onChangeIncludeWhat
	});

	ZmPref.registerPref("FORWARD_USE_PREFIX", {
		displayName:		ZmMsg.usePrefix,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
        setFunction:		ZmPref.setIncludeOrig
	});

	ZmPref.registerPref("FORWARD_INCLUDE_HEADERS", {
		displayName:		ZmMsg.includeHeaders,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
        setFunction:		ZmPref.setIncludeOrig
	});

	ZmPref.registerPref("IMPORT_FOLDER", {
		loadFunction:       ZmPref.loadCsvFormats,
		displayContainer:	ZmPref.TYPE_CUSTOM
	});
	ZmPref.registerPref("IMPORT_BUTTON", {
		displayName:		ZmMsg._import,
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	ZmPref.registerPref("LOCALE_NAME", {
		displayName:		ZmMsg.selectLanguage,
		displayContainer:	ZmPref.TYPE_LOCALES,
		precondition:		ZmSetting.LOCALE_CHANGE_ENABLED
	});

	var markReadTime = AjxMessageFormat.format(ZmMsg.messageReadTime, DwtId._makeId(ZmId.WIDGET_INPUT, ZmId.OP_MARK_READ));
	ZmPref.registerPref("MARK_MSG_READ", {
		displayName:		ZmMsg.messageReadLabel,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		displayFunction:	ZmPref.markMsgReadDisplay,
        orientation:        ZmPref.ORIENT_VERTICAL,
        displayOptions:     [ZmMsg.messageReadNow, markReadTime, ZmMsg.messageReadNone],
        options:            [ZmSetting.MARK_READ_NOW, ZmSetting.MARK_READ_TIME, ZmSetting.MARK_READ_NONE],
        valueFunction:		ZmPref.markMsgReadValue
    });

	ZmPref.registerPref("NEW_WINDOW_COMPOSE", {
		displayName:		ZmMsg.composeInNewWin,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		AjxCallback.simpleClosure(ZmPref.requireAllPreConditions, null, ZmSetting.MAIL_ENABLED, ZmSetting.DETACH_COMPOSE_ENABLED)
	});

    ZmPref.registerPref("MAIL_MANDATORY_SPELLCHECK", {
		displayName:		ZmMsg.mandatorySpellcheck,
		displayContainer:	ZmPref.TYPE_CHECKBOX		
	});

	ZmPref.registerPref("PAGE_SIZE", {
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		["25", "50", "100", "200"]
	});

	ZmPref.registerPref("PASSWORD", {
		displayName:		ZmMsg.changePassword,
		displayContainer:	ZmPref.TYPE_PASSWORD,
		precondition:		ZmSetting.CHANGE_PASSWORD_ENABLED
	});

	ZmPref.registerPref("SHARING", {
		displayContainer:	ZmPref.TYPE_CUSTOM
	});

	if (appCtxt.isOffline) {
		ZmPref.registerPref("OFFLINE_IS_MAILTO_HANDLER", {
			displayName:		ZmMsg.offlineAllowMailTo,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		});

		// only offer "enable notebooks" pref if a ZCS account exists
		if (appCtxt.accountList.accountTypeExists(ZmAccount.TYPE_ZIMBRA)) {
			ZmPref.registerPref("OFFLINE_NOTEBOOK_SYNC_ENABLED", {
				displayName:		ZmMsg.enableDocuments,
				displayContainer:	ZmPref.TYPE_CHECKBOX
			});
		}
	}

	// Polling Interval Options - Dynamically constructed according to MIN_POLLING_INTERVAL,POLLING_INTERVAL
	var options = [525600];

	var startValue = ZmPref.pollingIntervalDisplay(appCtxt.get(ZmSetting.MIN_POLLING_INTERVAL));
	startValue = (startValue < 1) ? 1 : Math.round(startValue);

	var pollInterval = ZmPref.pollingIntervalDisplay(appCtxt.get(ZmSetting.POLLING_INTERVAL));
	pollInterval = Math.round(pollInterval);

	while (startValue <= 10) {
		options.push(startValue);
		startValue++;
	}
	startValue = startValue - 1;

	var count = options.length;
	while (count < 10) {
		startValue = startValue + 5;
		options.push(startValue);
		count++;
	}

	if (pollInterval > startValue) {
		var p = pollInterval % 5;
		p = (p == 0) ? pollInterval : ((pollInterval / 5 + 1) * 5);
		options.push(p);
	} else {
		startValue = startValue + 5;
		options.push(startValue);
	}

	var displayOptions = [ZmMsg.pollNever];
	while (displayOptions.length <= count) {
		displayOptions.push(ZmMsg.pollEveryNMinutes);
	}

	ZmPref.registerPref("POLLING_INTERVAL", {
		displayName:		ZmMsg.pollingInterval,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		displayOptions,
		//displayOptions:		[ ZmMsg.pollNever, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes, ZmMsg.pollEveryNMinutes ],
		// NOTE: 525600 is the number of minutes in a year. I think that's a
		//       reasonable value for "never" since the server must have
		//       *some* number.
		options:			 options,
		approximateFunction: ZmPref.approximateInterval,
		displayFunction:	 ZmPref.pollingIntervalDisplay,
		valueFunction:	 	 ZmPref.pollingIntervalValue,
		validationFunction:  ZmPref.validatePollingInterval
	});

	ZmPref.registerPref("REPLY_INCLUDE_WHAT", {
		displayName:		ZmMsg.replyInclude,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.dontInclude,
							ZmMsg.includeInBody,
							ZmMsg.smartInclude,
							ZmMsg.includeOriginalAsAttach],
		options:			[ZmSetting.INC_NONE,
							ZmSetting.INC_BODY,
							ZmSetting.INC_SMART,
							ZmSetting.INC_ATTACH],
		setFunction:		ZmPref.setIncludeOrig,
		initFunction:		ZmPref.initIncludeWhat,
		changeFunction:		ZmPref.onChangeIncludeWhat
	});

	ZmPref.registerPref("REPLY_USE_PREFIX", {
		displayName:		ZmMsg.usePrefix,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		setFunction:		ZmPref.setIncludeOrig
	});

	ZmPref.registerPref("REPLY_INCLUDE_HEADERS", {
		displayName:		ZmMsg.includeHeaders,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		setFunction:		ZmPref.setIncludeOrig
	});

	ZmPref.registerPref("REPLY_PREFIX", {
		displayName:		ZmMsg.prefix,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_HORIZONTAL,
		displayOptions:		[">", "|"]
	});

	ZmPref.registerPref("SAVE_TO_SENT", {
		displayName:		ZmMsg.saveToSent,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		ZmSetting.MAIL_ENABLED
	});

	ZmPref.registerPref("SEARCH_INCLUDES_SPAM", {
		displayName:		ZmMsg.includeJunkFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		AjxCallback.simpleClosure(ZmPref.requireAllPreConditions, null, ZmSetting.MAIL_ENABLED, ZmSetting.SPAM_ENABLED)
	});

	ZmPref.registerPref("SEARCH_INCLUDES_TRASH", {
		displayName:		ZmMsg.includeTrashFolder,
		displayContainer:	ZmPref.TYPE_CHECKBOX,
		precondition:		[ZmSetting.MAIL_ENABLED, ZmSetting.CONTACTS_ENABLED]
	});

	ZmPref.registerPref("SHOW_FRAGMENTS", {
		displayName:		ZmMsg.showFragments,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});

	if (appCtxt.isOffline) {
		ZmPref.registerPref("OFFLINE_SHOW_ALL_MAILBOXES", {
			displayName:		ZmMsg.showAllMailboxes,
			displayContainer:	ZmPref.TYPE_CHECKBOX
		});
	}

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
		precondition:		ZmSetting.SKIN_CHANGE_ENABLED
	});

	ZmPref.registerPref("VIEW_AS_HTML", {
		displayName:		ZmMsg.displayMail,
		displayContainer:	ZmPref.TYPE_RADIO_GROUP,
		orientation:		ZmPref.ORIENT_VERTICAL,
		displayOptions:		[ZmMsg.displayAsHTML, ZmMsg.displayAsText],
		options:			[true, false]
	});
};

// other

ZmPreferencesApp.prototype._handleLoadLaunch =
function(callback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, [callback]);
	appCtxt.getSettings().loadPreferenceData(respCallback);
};

ZmPreferencesApp.prototype._handleResponseLaunch =
function(callback) {
	AjxDispatcher.run("GetPrefController").show();
	if (callback) {
		callback.run();
	}
};

ZmPreferencesApp.prototype._getSharingView =
function() {
	if (!this._prefController) {
		return null;
	}
	var prefCtlr = this.getPrefController();
	var prefsView = prefCtlr && prefCtlr.getPrefsView();
	var sharingSection = prefsView && prefsView.getView("SHARING");
	return (sharingSection && sharingSection.view);
};

// needed to hide zimlet tree view for multi-account
ZmPreferencesApp.prototype._getOverviewParams =
function() {
	var params = ZmApp.prototype._getOverviewParams.call(this);
	params.omit = {};
	params.omit[ZmOrganizer.ID_ZIMLET] = true;

	return params;
};
