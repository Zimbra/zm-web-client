/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the Zimbra mail controller class.
 * 
 */

/**
 * Creates a controller to run ZimbraMail. Do not call directly, instead use the run()
 * factory method.
 * @constructor
 * @class
 * This class is the "ubercontroller", as it manages all the apps as well as bootstrapping
 * the ZimbraMail application.
 *
 * @param {Hash}	params	a hash of parameters
 * @param {constant}    params.app		the starting app
 * @param  {Element}	params.userShell	the top-level skin container
 *        
 * @extends	ZmController
 */
ZmZimbraMail = function(params) {

    if (arguments.length == 0) { return; }

	ZmController.call(this, null);

	appCtxt.setZimbraMail(this);
    appCtxt.setAppController(this);

	// ALWAYS set back reference into our world (also used by unload handler)
	window._zimbraMail = this;

    // app event handling
    this._evt = new ZmAppEvent();
    this._evtMgr = new AjxEventMgr();
    // copy over any statically registered listeners
    for (var type in ZmZimbraMail._listeners) {
        var list = ZmZimbraMail._listeners[type];
        if (list && list.length) {
            for (var i = 0; i < list.length; i++) {
                this._evtMgr.addListener(type, list[i]);
            }
        }
    }

    // all subsequent calls to register static app listeners go to instance
    ZmZimbraMail.addListener = AjxCallback.simpleClosure(this.addListener, this);
    ZmZimbraMail.addAppListener = AjxCallback.simpleClosure(this.addAppListener, this);

    // Create generic operations
    ZmOperation.initialize();

    // settings
    this._createSettings(params);
    this._createEnabledApps();
    this._initializeSettings(params);
	this._postInitializeSettings();

	//update body class to reflect user selected font
	document.body.className = "user_font_" + appCtxt.get(ZmSetting.FONT_NAME);
	//update root html elment class to reflect user selected font size (remove the "normal" size that was set by default).
	Dwt.delClass(document.documentElement, "user_font_size_normal", "user_font_size_" + appCtxt.get(ZmSetting.FONT_SIZE));

    // set internal state
	this._shell = appCtxt.getShell();
    this._userShell = params.userShell;

    this._requestMgr = new ZmRequestMgr(this); // NOTE: requires settings to be initialized

	this._appIframeView = {};
	this._activeApp = null;
	this._sessionTimer = new AjxTimedAction(null, ZmZimbraMail.executeSessionTimer);
	this._sessionTimerId = -1;
	this._pollActionId = null;	// AjaxTimedAction ID of timer counting down to next poll time
	this._pollRequest = null;	// HTTP request of poll we've sent to server
	this._pollInstantNotifications = false; // if TRUE, we're in "instant notification" mode
	this.statusView = null;
	ZmZimbraMail._exitTimer = new AjxTimedAction(null, ZmZimbraMail.exitSession);
	ZmZimbraMail._exitTimerId = -1;
	ZmZimbraMail.stayOnPagePrompt = false;
	ZmZimbraMail.STAYONPAGE_INTERVAL = 2;  //in minutes
    // setup history support
    if (appCtxt.get(ZmSetting.HISTORY_SUPPORT_ENABLED) && !AjxEnv.isSafari) {
        window.historyMgr = appCtxt.getHistoryMgr();
    }

    // create app view manager
    this._appViewMgr = new ZmAppViewMgr(this._shell, this, false, true);
	var hidden = [ ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR, ZmAppViewMgr.C_TASKBAR ];
	if (!appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		hidden.push(ZmAppViewMgr.C_TREE_FOOTER);
	}
	this._appViewMgr.setHiddenComponents(ZmAppViewMgr.GLOBAL, hidden, true);

    // register handlers
	AjxDispatcher.setPackageLoadFunction("Zimlet", new AjxCallback(this, this._postLoadZimlet));

	AjxDispatcher.setPreLoadFunction(new AjxCallback(this, function() {
		this._appViewMgr.pushView(ZmId.VIEW_LOADING);
	}));
	AjxDispatcher.setPostLoadFunction(new AjxCallback(this, function() {
		if (!AjxUtil.arrayContains(this._appViewMgr._toRemove, ZmId.VIEW_LOADING)) {
			this._appViewMgr._toRemove.push(ZmId.VIEW_LOADING);
		}
	}));

	for (var i in ZmApp.QS_ARG) {
		ZmApp.QS_ARG_R[ZmApp.QS_ARG[i]] = i;
	}

	this._shell.addGlobalSelectionListener(new AjxListener(this, this._globalSelectionListener));

    // setup webClient offline support
    appCtxt.initWebOffline();
    /// go!
	this.startup(params);
};

ZmZimbraMail.prototype = new ZmController;
ZmZimbraMail.prototype.constructor = ZmZimbraMail;

ZmZimbraMail.prototype.isZmZimbraMail = true;
ZmZimbraMail.prototype.toString = function() { return "ZmZimbraMail"; };

// REVISIT: This is done so that we when we switch from being "beta"
//          to production, we don't have to ensure that all of the
//          translations are changed at the same time. We can simply
//          remove the beta suffix from the app name.
ZmMsg.BETA_documents = [ZmMsg.documents, ZmMsg.beta].join(" ");

// dummy app (needed when defining drop targets in _registerOrganizers)
ZmApp.MAIN = "ZmZimbraMail";
ZmApp.DROP_TARGETS[ZmApp.MAIN] = {};

// Static listener registration
ZmZimbraMail._listeners = {};

// Consts
ZmZimbraMail.UI_LOAD_BEGIN		= "ui_load_begin";
ZmZimbraMail.UI_LOAD_END		= "ui_load_end";
ZmZimbraMail.UI_NETWORK_UP		= "network_up";
ZmZimbraMail.UI_NETWORK_DOWN	= "network_down";


// Public methods


/**
 * Sets up ZimbraMail, and then starts it by calling its constructor. It is assumed that the
 * CSFE is on the same host.
 *
 * @param {Hash}	params			a hash of parameters
 * @param {constant}      params.app				te starting app
 * @param {Boolean}      params.offlineMode		if <code>true</code>, this is the offline client
 * @param {Boolean}      params.devMode			if <code>true</code>, we are in development environment
 * @param {Hash}      params.settings			the server prefs/attrs
 * @param {constant}      params.protocolMode	the protocal mode (http, https or mixed)
 * @param {Boolean}      params.noSplashScreen	if <code>true</code>, do not show splash screen during startup
 */
ZmZimbraMail.run =
function(params) {

	if (params.noSplashScreen) {
		ZmZimbraMail.killSplash();
	}

	// Create the global app context
	window.appCtxt = new ZmAppCtxt();
	appCtxt.rememberMe = false;

	// Handle offline mode
	if (params.offlineMode) {
		DBG.println(AjxDebug.DBG1, "OFFLINE MODE");
		appCtxt.isOffline = true;
	}

	// Create the shell
	var userShell = params.userShell = window.document.getElementById(ZmId.SKIN_SHELL);
	if (!userShell) {
		alert("Could not get user shell - skin file did not load properly");
	}
	var shell = new DwtShell({userShell:userShell, docBodyScrollable:false, id:ZmId.SHELL});
	appCtxt.setShell(shell);

    // Go!
    new ZmZimbraMail(params);
};

/**
 * Unloads the controller. Allows parent window to walk list of open child windows and either "delete" 
 * or "disable" them.
 * 
 */
ZmZimbraMail.unload =
function() {

	if (!ZmZimbraMail._endSessionDone) {
		ZmZimbraMail._endSession();
	}

	if (ZmZimbraMail._isLogOff) {
		ZmZimbraMail._isLogOff = false;
		// stop keeping track of user input (if applicable)
		if (window._zimbraMail) {
			window._zimbraMail.setSessionTimer(false);
		}

		ZmCsfeCommand.noAuth = true;
	}

	ZmZimbraMail.closeChildWindows();
	
	ZmZimbraMail.stayOnPagePrompt = false;
	ZmZimbraMail.setExitTimer(false);
	ZmZimbraMail.sessionTimerInvoked = false;
	window._zimbraMail = window.onload = window.onunload = window.onresize = window.document.onkeypress = null;
};

ZmZimbraMail.closeChildWindows =
function() {
	
	var childWinList = window._zimbraMail && window._zimbraMail._childWinList;
	if (childWinList) {
		// close all child windows
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			if (childWin.win) {
				childWin.win.onbeforeunload = null;
				childWin.win.parentController = null;
				childWin.win.close();
			}
		}
	}
};

/**
 * Returns sort order using a and b as keys into given hash.
 *
 * @param {Hash}	hash		a hash with sort values
 * @param {String}	a			a key into hash
 * @param {String}	b			a key into hash
 * @return	{int}	0 if the items are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmZimbraMail.hashSortCompare =
function(hash, a, b) {
	var appA = a ? Number(hash[a]) : 0;
	var appB = b ? Number(hash[b]) : 0;
	if (appA > appB) { return 1; }
	if (appA < appB) { return -1; }
	return 0;
};

/**
 * Hides the splash screen.
 * 
 */
ZmZimbraMail.killSplash =
function() {
	// 	Splash screen is now a part of the skin, loaded in statically via the JSP
	//	as a well-known ID.  To hide the splash screen, just hide that div.
	Dwt.hide("skin_container_splash_screen");
};

/**
 * Returns the state of ZCS application if user is logged out in case of browser quit.
 * The public method is added to take appropriate action in the chat app if user session is ending.
 *
 *
 * @public
 */
ZmZimbraMail.hasSessionEnded =
    function() {
        return ZmZimbraMail._endSessionDone;
    };

/**
 * Startup the mail controller.
 * 
 * <p>
 * The following steps are performed:
 * <ul>
 * <li>check for skin, show it</li>
 * <li>create app view mgr</li>
 * <li>create components (sash, banner, user info, toolbar above overview, status view)</li>
 * <li>create apps</li>
 * <li>load user settings (using a <code>&lt;GetInfoRequest&gt;</code>)</li>
 * </ul>
 * 
 * @param {Hash}	params		a hash of parameters
 * @param {constant}	app			the starting app
 * @param {Hash}	settings		a hash of settings overrides
 */
ZmZimbraMail.prototype.startup =
function(params) {

	if (appCtxt.isOffline) {
		this.sendClientEventNotify(ZmZimbraMail.UI_LOAD_BEGIN);
	}

	appCtxt.inStartup = true;
	if (typeof(skin) == "undefined") {
		DBG.println(AjxDebug.DBG1, "No skin!");
	}

	skin.show("skin", true);
	appCtxt.getShell().relayout();

	if (!this._components) {
		this._components = {};
		this._components[ZmAppViewMgr.C_SASH] = new DwtSash({parent:this._shell, style:DwtSash.HORIZONTAL_STYLE,
															 className:"console_inset_app_l", threshold:20, id:ZmId.MAIN_SASH});
		this._components[ZmAppViewMgr.C_SASH].addListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._folderTreeSashRelease);
		this._components[ZmAppViewMgr.C_BANNER] = this._createBanner();
		this._components[ZmAppViewMgr.C_USER_INFO] = this._userNameField =
			this._createUserInfo("BannerTextUser", ZmAppViewMgr.C_USER_INFO, ZmId.USER_NAME);
		this._components[ZmAppViewMgr.C_QUOTA_INFO] = this._usedQuotaField =
			this._createUserInfo("BannerTextQuota", ZmAppViewMgr.C_QUOTA_INFO, ZmId.USER_QUOTA);

		if (appCtxt.isOffline) {
			this._initOfflineUserInfo();
		}
	}

	if (!this.statusView) {
		this.statusView = new ZmStatusView(this._shell, "ZmStatus", Dwt.ABSOLUTE_STYLE, ZmId.STATUS_VIEW);
	}

	this._registerOrganizers();

	// set up map of search types to item types
	for (var i in ZmSearch.TYPE) {
		ZmSearch.TYPE_MAP[ZmSearch.TYPE[i]] = i;
	}
	ZmZimbraMail.registerViewsToTypeMap();

	this._getStartApp(params);
	appCtxt.startApp = params.startApp;

	this._postRenderCallbacks = [];
	this._postRenderLast = 0;
	if (params.startApp == ZmApp.MAIL) {
		this._doingPostRenderStartup = true;
		var callback = new AjxCallback(this,
			function() {
				AjxDispatcher.require("Startup2");
				var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
				if (appCtxt.get(ZmSetting.CALENDAR_ENABLED, null, account)) {
					this.handleCalendarComponents();
				}
				if (appCtxt.get(ZmSetting.TASKS_ENABLED, null, account)) {
					this.handleTaskComponents();
				}
				this._appViewMgr.loadingView.setVisible(false);
			});
		this.addPostRenderCallback(callback, 0, 0, true);

		// wait half a minute and load TinyMCE
		var callback = new AjxCallback(this, function() {
			AjxDispatcher.require("Startup2");

			var timer = new DwtIdleTimer(30 * 1000, function() {
				AjxDispatcher.require('TinyMCE', true);
				timer.kill();
			});
		});
		this.addPostRenderCallback(callback, 0, 0, true);
	}

    // NOTE: We must go through the request mgr for default handling
    var getInfoResponse = AjxUtil.get(params, "getInfoResponse");
    if (getInfoResponse) {
        this._requestMgr.sendRequest({response:getInfoResponse});
    }

	// fetch meta data for the main account
	var respCallback = new AjxCallback(this, this._handleResponseGetMetaData, params);
	appCtxt.accountList.mainAccount.loadMetaData(respCallback);

	//todo - might want to move this call and the methods to ZmMailApp as it's specific to mail app only.
    this._initDelegatedSenderAddrs();
    if(appCtxt.isOffline) {
        var updatePref = appCtxt.get(ZmSetting.OFFLINE_UPDATE_NOTIFY);
        this._offlineUpdateChannelPref(updatePref)
    }
};


ZmZimbraMail.prototype._initDelegatedSenderAddrs =
function() {
    var soapDoc = AjxSoapDoc.create("DiscoverRightsRequest", "urn:zimbraAccount");
    soapDoc.set("right","sendAs" );
    soapDoc.set("right","sendOnBehalfOf");
    soapDoc.set("right","sendAsDistList");
    soapDoc.set("right","sendOnBehalfOfDistList");
    var batchCmd = new ZmBatchCommand(null, appCtxt.accountList.mainAccount.name);
    var callback = this._initDelegatedSenderEmails.bind(this);
    batchCmd.addNewRequestParams(soapDoc, callback, callback);
	var offlineCallback = this._handleOfflineDelegatedSenderEmails.bind(this, callback);
    batchCmd.run(null, null, offlineCallback);
};

ZmZimbraMail.prototype._getDelegatedSenderEmails =
function(sendRights, sendRight) {
	var emails = [];
	if (!sendRights || !sendRights.length) {
		return emails;
	}
	for (var i = 0; i < sendRights.length; i++) {
		var targets = sendRights[i].target;
		var right = sendRights[i].right;
		var sendRightDistList = sendRight + "DistList";
		if (right !== sendRight && right !== sendRightDistList) {
			continue;
		}
		var isDL = right === sendRightDistList;
		for (var j = 0; j < targets.length; j++) {
			var target = targets[j];
			var emailList = target.email;
			for (var k = 0; k < emailList.length; k++) {
				var addr = emailList[k].addr;
				emails.push({addr: addr, isDL: isDL, displayName: target.d});
			}
		}

	}
	return emails;
};

ZmZimbraMail.prototype._initDelegatedSenderEmails =
function(result){
    var response = result.getResponse();
	if (ZmOffline.isOnlineMode()) {
		localStorage.setItem("DiscoverRightsResponse", JSON.stringify(response));
	}
	var discoverRightsResponse = response && response.DiscoverRightsResponse;
	var sendRights = discoverRightsResponse && discoverRightsResponse.targets;
    appCtxt.sendAsEmails = this._getDelegatedSenderEmails(sendRights, 'sendAs');
    appCtxt.sendOboEmails = this._getDelegatedSenderEmails(sendRights, 'sendOnBehalfOf');
};

ZmZimbraMail.prototype._handleOfflineDelegatedSenderEmails =
function(callback) {
	var result = localStorage.getItem("DiscoverRightsResponse");
	if (result) {
		var csfeResult = new ZmCsfeResult({BatchResponse : JSON.parse(result)});
		callback.run(csfeResult);
	}
};

ZmZimbraMail.registerViewsToTypeMap = function() {
	// organizer types based on view
	for (var i in ZmOrganizer.VIEWS) {
		var list = ZmOrganizer.VIEWS[i];
		for (var j = 0; j < list.length; j++) {
			ZmOrganizer.TYPE[list[j]] = i;
		}
	}
};

ZmZimbraMail.prototype._createSettings = function(params) {
    // We've received canned SOAP responses for GetInfoRequest and SearchRequest from the
    // launch JSP, wrapped in a BatchRequest. Jiggle them so that they look like real
    // responses, and pass them along.
    if (params.batchInfoResponse) {
        var batchResponse = params.batchInfoResponse.Body.BatchResponse;

        // always assume there's a get info response
		var infoResponse = batchResponse.GetInfoResponse[0];
		if(!infoResponse) {
			infoResponse ={}
		}
		//store per-domain settings in infoResponse obj so we can access it like other settings
		infoResponse.domainSettings = params.settings;
        params.getInfoResponse = {
            Header: params.batchInfoResponse.Header,
            Body: { GetInfoResponse: infoResponse}
        };
        var session = AjxUtil.get(params.getInfoResponse, "Header", "context", "session");
        if (session) {
            ZmCsfeCommand.setSessionId(session);
        }
        DBG.println(AjxDebug.DBG1, ["<b>RESPONSE (from JSP tag)</b>"].join(""), "GetInfoResponse");
        DBG.dumpObj(AjxDebug.DBG1, params.getInfoResponse, -1);

        // we may have an initial search response
        if (batchResponse.SearchResponse) {
            params.searchResponse = {
                Body: { SearchResponse: batchResponse.SearchResponse[0] }
            };
            DBG.println(AjxDebug.DBG1, ["<b>RESPONSE (from JSP tag)</b>"].join(""), "SearchResponse");
            DBG.dumpObj(AjxDebug.DBG1, params.searchResponse, -1);
        }
    }

    // create settings
    var settings = new ZmSettings()
    appCtxt.setSettings(settings);

    // We have to pre-initialize the settings in order to create
    // the enabled apps correctly.
    settings.setUserSettings({info:params.getInfoResponse.Body.GetInfoResponse, preInit:true});
};

ZmZimbraMail.prototype._initializeSettings = function(params) {
    var info = params.getInfoResponse.Body.GetInfoResponse;

    var settings = appCtxt.getSettings();
    // NOTE: Skip notify to avoid callbacks which reference objects that aren't set, yet
    settings.setUserSettings(info, null, true, true, true);
    settings.userSettingsLoaded = true;

    // settings structure and defaults
    var branch = appCtxt.get(ZmSetting.BRANCH);
    if (window.DBG && !DBG.isDisabled()) {
        DBG.setTitle("Debug (" + branch + ")");
    }

    // setting overrides
    if (params.settings) {
        for (var name in params.settings) {
            var id = settings.getSettingByName(name);
            if (id) {
                settings.getSetting(id).setValue(params.settings[name]);
            }
        }
    }

    // reset polling interval for offline
    if (appCtxt.isOffline) {
        appCtxt.set(ZmSetting.POLLING_INTERVAL, 60, null, null, true);
    }

    // Handle dev mode
    if (params.devMode == "1") {
        DBG.println(AjxDebug.DBG1, "DEV MODE");
        appCtxt.set(ZmSetting.DEV, true);
    }

    // Handle protocol mode - standardize on trailing :
    if (params.protocolMode) {
        var proto = (params.protocolMode.indexOf(":") == -1) ? params.protocolMode + ":" : params.protocolMode;
        appCtxt.set(ZmSetting.PROTOCOL_MODE, proto);
    }
    if (params.httpPort) {
        appCtxt.set(ZmSetting.HTTP_PORT, params.httpPort);
    }
    if (params.httpsPort) {
        appCtxt.set(ZmSetting.HTTPS_PORT, params.httpsPort);
    }

    // hide spam if not enabled
    if (!appCtxt.get(ZmSetting.SPAM_ENABLED)) {
        ZmFolder.HIDE_ID[ZmFolder.ID_SPAM] = true;
    }

	// Chats hidden by default, check for override
	if (appCtxt.get(ZmSetting.SHOW_CHATS_FOLDER)) {
		delete ZmFolder.HIDE_ID[ZmOrganizer.ID_CHATS];
	}
};

/**
 * Perform any additional operation after initializing settings
 * @private
 */
ZmZimbraMail.prototype._postInitializeSettings =
function() {
	this._setCustomInvalidEmailPats();
};

/**
 * Set an array of invalid Email patterns(values of zimbraMailAddressValidationRegex in ldap) to
 * AjxEmailAddress.customInvalidEmailPats
 * @private
 */
ZmZimbraMail.prototype._setCustomInvalidEmailPats =
function() {
 	var customPatSetting = appCtxt.getSettings().getSetting(ZmSetting.EMAIL_VALIDATION_REGEX);
	var cPatList = [];
	if(customPatSetting) {
		cPatList = customPatSetting.value;
	}
	for(var i = 0; i< cPatList.length; i++) {
		var pat = cPatList[i];
		if(pat && pat != "") {
			  AjxEmailAddress.customInvalidEmailPats.push(new RegExp(pat))
		}
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype._handleResponseGetMetaData =
function(params) {

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var method = appCtxt.multiAccounts ? "GetContactsForAllAccounts" : "GetContacts";
		AjxDispatcher.run({
			method:     method,
			callback:   this._handleResponseLoadUserSettings.bind(this, params)
		});
	}
	else {
		this._handleResponseLoadUserSettings(params);
	}
};

/**
 * Shows the mini-calendar.
 * 
 */
ZmZimbraMail.prototype.showMiniCalendar =
function() {
	var calMgr = appCtxt.getCalManager();
	calMgr.getMiniCalendar();
	appCtxt.getAppViewMgr().displayComponent(ZmAppViewMgr.C_TREE_FOOTER, true);
    calMgr.highlightMiniCal();
    calMgr.startDayRollTimer();
};

/**
 * Shows reminders.
 */
ZmZimbraMail.prototype.showReminder =
function() {
    var reminderController = appCtxt.getApp(ZmApp.CALENDAR).getReminderController();
	reminderController.refresh();
};

/**
 * Shows reminders.
 */
ZmZimbraMail.prototype.showTaskReminder =
function() {
	var taskMgr = appCtxt.getTaskManager();
	var taskReminderController = taskMgr.getReminderController();
	taskReminderController.refresh();
};

ZmZimbraMail.prototype._isProtocolHandlerAccessed =
function() {
    if (AjxEnv.isFirefox){
      if (!localStorage || localStorage['zimbra_mailto_init']) return true;
      localStorage['zimbra_mailto_init'] = true;
    }
    return false;
};

/**
 * @private
 */
ZmZimbraMail.prototype._handleResponseLoadUserSettings =
function(params, result) {
	if (appCtxt.multiAccounts) {
		var callback = new AjxCallback(this, this._handleResponseStartup, [params, result]);
		appCtxt.accountList.loadAccounts(callback);
	} else {
		this._handleResponseStartup(params, result);
	}
};

/**
 * Startup: part 2
 * 	- create app toolbar component
 * 	- determine and launch starting app
 *
 * @param {Hash}	params			a hash of parameters
 * @param       {constant}	params.app				the starting app
 * @param       {Object}	params.settingOverrides	a hash of overrides of user settings
 * @param {ZmCsfeResult}	result		the result object from load of user settings
 * 
 * @private
 */
ZmZimbraMail.prototype._handleResponseStartup =
function(params, result) {

	params = params || {};
	if (params.settingOverrides) {
		this._needOverviewLayout = true;
		for (var id in params.settingOverrides) {
			var setting = appCtxt.getSetting(id);
			if (setting) {
				setting.setValue(params.settingOverrides[id]);
			}
		}
	}
	if (params.preset) {
		var presets = params.preset.split(",");
		for (var i = 0; i < presets.length; i++) {
			var fields = presets[i].split(":");
			var setting = appCtxt.getSettings().getSetting(fields[0]);
			if (setting && setting.canPreset) {
				setting.setValue(fields[1]);
			}
		}
	}

	if (!appCtxt.isOffline) {
        if (appCtxt.get(ZmSetting.INSTANT_NOTIFY) && appCtxt.get(ZmSetting.INSTANT_NOTIFY_INTERVAL) == appCtxt.get(ZmSetting.POLLING_INTERVAL))
            AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.setInstantNotify, [true]), 4000);
        else
		    this.setPollInterval(true);
	} else {
		if (appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO) && window.platform && 
			window.platform.isRegisteredProtocolHandler("mailto")) {  
		    // bug fix #34342 - always register the protocol handler for mac and linux on start up
		    this.registerMailtoHandler(!AjxEnv.isWindows, true);
		}    
	}

	window.onbeforeunload = ZmZimbraMail._confirmExitMethod;

	if (!this._components[ZmAppViewMgr.C_APP_CHOOSER]) {
		this._components[ZmAppViewMgr.C_APP_CHOOSER] = this._appChooser = this._createAppChooser();
	}

	ZmApp.initialize();

    if(appCtxt.get(ZmSetting.DEFAULT_TIMEZONE)) {
        AjxTimezone.DEFAULT_RULE = AjxTimezone._guessMachineTimezone(appCtxt.get(ZmSetting.DEFAULT_TIMEZONE));
        AjxTimezone.DEFAULT = AjxTimezone.getClientId(AjxTimezone.DEFAULT_RULE.serverId);
    }

	this.notify(ZmAppEvent.PRE_STARTUP);

	params.result = result;
	var respCallback = new AjxCallback(this, this._handleResponseStartup1, params);

	// startup and packages have been optimized for quick mail display
	if (this._doingPostRenderStartup) {
		this.addAppListener(params.startApp, ZmAppEvent.POST_RENDER, new AjxListener(this, this._postRenderStartup));
        //For offline mode offline callback will take care
		if (!appCtxt.isWebClientOffline()) {
	        this._searchResponse = params.searchResponse;
        }
	} else {
		AjxDispatcher.require("Startup2");
	}

	// Set up post-render callbacks

	// run app-related startup functions
	var callback = new AjxCallback(this,
		function() {
			this.runAppFunction("startup", false, params.result);
		});
	this.addPostRenderCallback(callback, 2, 0, true);

	callback = new AjxCallback(this,
		function() {
			this._setupTabGroups();
			this.focusContentPane();
		});
	this.addPostRenderCallback(callback, 3, 100);

	// miscellaneous post-startup housekeeping
	callback = new AjxCallback(this,
		function() {
			AjxDispatcher.enableLoadFunctions(true);
			appCtxt.inStartup = false;
			this.notify(ZmAppEvent.POST_STARTUP);

			var sc = appCtxt.getSearchController();
			sc.getSearchToolbar().initAutocomplete();

			// bug fix #31996
			if (appCtxt.isOffline) {
				sc.resetSearchToolbar();
			}

			if (appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO) && appCtxt.isOffline) {
				this.handleOfflineMailTo(location.search);
			}
		});
	this.addPostRenderCallback(callback, 5, 100);

    if (appCtxt.get(ZmSetting.MAIL_ENABLED) && !appCtxt.isExternalAccount() && navigator.registerProtocolHandler && !this._isProtocolHandlerAccessed()){
        callback = new AjxCallback(this,
            function() {
                try {
                    navigator.registerProtocolHandler("mailto",AjxUtil.formatUrl({qsArgs:{view:'compose',to:'%s'}, qsReset:true}) ,ZmMsg.zimbraTitle);
                } catch (err){};
        });
        this.addPostRenderCallback(callback, 6, 100);
    }

	this.activateApp(params.startApp, false, respCallback, this._errorCallback, params);

	var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED, null, account) &&
		!this._doingPostRenderStartup &&
		(params.startApp != ZmApp.CALENDAR))
	{
		this.handleCalendarComponents();
	}
	if (appCtxt.get(ZmSetting.TASKS_ENABLED, null, account) &&
		!this._doingPostRenderStartup &&
		(params.startApp != ZmApp.TASKS))
	{
		this.handleTaskComponents();
	}

	if (appCtxt.get(ZmSetting.IMPORT_ON_LOGIN_ENABLED)) {
		var ds = new ZmDataSourceCollection();
		var dsCollection = appCtxt.getDataSourceCollection();
		var pop3Accounts = dsCollection && dsCollection.getPopAccounts();
		var imapAccounts = dsCollection && dsCollection.getImapAccounts();
		var sourceMap = {};
		if (pop3Accounts) {
			for (var i=0; i<pop3Accounts.length; i++) {
				sourceMap[pop3Accounts[i].id] = pop3Accounts[i];
			}
		}
		if (imapAccounts) {
			for (var i=0; i<imapAccounts.length; i++) {
				sourceMap[imapAccounts[i].id] = imapAccounts[i];	
			}
		}
		
		if (pop3Accounts || imapAccounts) {
			var action = new AjxTimedAction(ds, ds.checkStatus, [sourceMap, 2000]);
			AjxTimedAction.scheduleAction(action, 10000);  //kick off check in 10 seconds
		}
	}
};

/**
 * Creates & show Task Reminders on delay
 *
 * @private
 */
ZmZimbraMail.prototype.handleTaskComponents =
function() {
	var reminderAction = new AjxTimedAction(this, this.showTaskReminder);
	var delay = appCtxt.isOffline ? 0 : ZmTasksApp.REMINDER_START_DELAY;
	AjxTimedAction.scheduleAction(reminderAction, delay);
};

/**
 * Creates mini calendar and shows reminders on delay
 * 
 * @private
 */
ZmZimbraMail.prototype.handleCalendarComponents =
function() {
	if (appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
        var miniCalAction = new AjxTimedAction(this, this.showMiniCalendar);
		var delay = appCtxt.isOffline ? 0 : ZmCalendarApp.MINICAL_DELAY;
        AjxTimedAction.scheduleAction(miniCalAction, delay);
	}

	AjxDispatcher.require(["ContactsCore", "MailCore", "CalendarCore", "Calendar"]);
	var reminderAction = new AjxTimedAction(this, this.showReminder);
	var delay = appCtxt.isOffline ? 0 : ZmCalendarApp.REMINDER_START_DELAY;
	AjxTimedAction.scheduleAction(reminderAction, delay);
};

/**
 * Startup: part 3
 * 	- populate user info
 * 	- create search bar
 * 	- set up keyboard handling (shortcuts and tab groups)
 * 	- kill splash, show UI
 * 	- check license
 *
 * @param {Hash}	params			a hash of parameters
 * @param {constant}	params.app				the starting app
 * @param {Object}	params.settingOverrides	a hash of overrides of user settings
 *        
 * @private
 */
ZmZimbraMail.prototype._handleResponseStartup1 =
function(params) {

	this._setExternalLinks();
	this.setUserInfo();
	this._setRefresh();
	this._setZimletsButton();

	if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		this._components[ZmAppViewMgr.C_SEARCH] = appCtxt.getSearchController().getSearchToolbar();
	}
	else {
		Dwt.hide(ZmId.SKIN_SEARCH);
	}
	
	var newButton = this.getNewButton();
	var tbParams = {
		parent:				this._shell,
		context:			ZmOperation.NEW_MENU,
		buttons:			ZmOperation.NONE,
		controller:			this,
		refElementId:		ZmId.SKIN_APP_NEW_BUTTON
	};
	var tb = this._newToolbar = new ZmButtonToolBar(tbParams);
	newButton.reparent(tb);
	this._components[ZmAppViewMgr.C_NEW_BUTTON] = tb;
	
	if (params.unitTest) {
		var utm = window.unitTestManager;
		appCtxt.addZimletsLoadedListener(utm.runTests.bind(utm), 0);
	}

	this.getKeyMapMgr();	// make sure keyboard handling is initialized

	this.setSessionTimer(true);
	ZmZimbraMail.killSplash();

	// Give apps a chance to add their own UI components.
	this.runAppFunction("addComponents", false, this._components);

	// make the UI appear
	this._appViewMgr.setViewComponents(ZmAppViewMgr.GLOBAL, this._components, true);

	this._checkLicense();

	if (!this._doingPostRenderStartup) {
		this._postRenderStartup();
	}
};

/**
 * set the refresh button at the masthead.
 */
ZmZimbraMail.prototype._setRefresh =
function() {
	var containerEl = document.getElementById(ZmId.SKIN_REFRESH);
	if (!containerEl) {
		return;
	}
	var button = appCtxt.refreshButton = new DwtToolBarButton({parent:DwtShell.getShell(window), id: ZmId.OP_CHECK_MAIL}); //use ToolbarButton just for the style, for now it looks ok.
	button.setImage("RefreshAll");
	button.setToolTipContent(ZmMsg.checkMailPrefUpdate, true);

	button.reparentHtmlElement(ZmId.SKIN_REFRESH);

	var refreshListener = this._refreshListener.bind(this);
	button.addSelectionListener(refreshListener);

};

/**
 * refresh button listener. call runRefresh() of all the enabled apps that have this method defined.
 */
ZmZimbraMail.prototype._refreshListener =
function() {
	if (!appCtxt.isWebClientOffline()) {
		this.runAppFunction("runRefresh");
	}
};

// popup a warning dialog if there is a problem with the license
ZmZimbraMail.prototype._checkLicense =
function(ev) {

	var status = appCtxt.get(ZmSetting.LICENSE_STATUS);
	var msg = ZmSetting.LICENSE_MSG[status];
	if (msg) {
		AjxDispatcher.require("Startup2");
		var dlg = appCtxt.getMsgDialog();
		dlg.reset();
        dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	}
};

/**
 * The work to render the start app has been done. Now perform all the startup
 * work that remains - each piece of work is contained in a callback with an
 * associated order and delay.
 * 
 * @private
 */
ZmZimbraMail.prototype._postRenderStartup =
function(ev) {
	this._postRenderCallbacks.sort(function(a, b) {
		return a.order - b.order;
	});
	this._runNextPostRenderCallback();
};

/**
 * @private
 */
ZmZimbraMail.prototype._runNextPostRenderCallback =
function() {
	DBG.println(AjxDebug.DBG2, "POST-RENDER CALLBACKS: " + this._postRenderCallbacks.length);
	if (this._postRenderCallbacks && this._postRenderCallbacks.length) {
		var prcb = this._postRenderCallbacks.shift();
		if (!prcb) { return; }
		DBG.println(AjxDebug.DBG2, "POST-RENDER CALLBACK: #" + prcb.order + ", delay " + prcb.delay + " in " + prcb.callback.obj.toString());
		AjxTimedAction.scheduleAction(new AjxTimedAction(this,
			function() {
				prcb.callback.run();
				this._runNextPostRenderCallback();
			}), prcb.delay);
	} else {
		if (appCtxt.isOffline) {
			this.sendClientEventNotify(ZmZimbraMail.UI_LOAD_END);

			if (AjxEnv.isPrism) {
				this._firstTimeNetworkChange = true;

				var nc = new ZimbraNetworkChecker();
				nc.addEventListener("offline", function(e) { window["appCtxt"].getAppController().handleNetworkChange(false); }, false);
				nc.addEventListener("online", function(e) { window["appCtxt"].getAppController().handleNetworkChange(true); }, false);
			}
		}
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype.handleNetworkChange =
function(online) {
	this._isPrismOnline = online;

	if (this._isUserOnline || this._firstTimeNetworkChange) {
		this._updateNetworkStatus(online);
	}
};

ZmZimbraMail.prototype._updateNetworkStatus =
function(online) {
	// bug 48108 - Prism sometimes triggers network status change mutliple times
	// So don't bother if the last change is the same as current status
	if ((online && this._currentNetworkStatus == ZmZimbraMail.UI_NETWORK_UP) ||
		(!online && this._currentNetworkStatus == ZmZimbraMail.UI_NETWORK_DOWN))
	{
		return;
	}

	if (online) {
		if (!this._firstTimeNetworkChange) {
			this.setStatusMsg(ZmMsg.networkChangeOnline);
		} else {
			this._firstTimeNetworkChange = false;
			this._isUserOnline = online;
		}
		this._currentNetworkStatus = ZmZimbraMail.UI_NETWORK_UP;
        this.sendClientEventNotify(this._currentNetworkStatus, true);
	} else {
		this.setStatusMsg(ZmMsg.networkChangeOffline, ZmStatusView.LEVEL_WARNING);
		this._currentNetworkStatus = ZmZimbraMail.UI_NETWORK_DOWN;
        this.sendClientEventNotify(this._currentNetworkStatus);
	}

	this._networkStatusIcon.setToolTipContent(online ? ZmMsg.networkStatusOffline : ZmMsg.networkStatusOnline, true);
	this._networkStatusIcon.getHtmlElement().innerHTML = AjxImg.getImageHtml(online ? "Connect" : "Disconnect");
	var netStatus = online ? ZmMsg.netStatusOnline : ZmMsg.netStatusOffline;
	this._networkStatusText.getHtmlElement().innerHTML = netStatus.substr(0, 1).toUpperCase() + netStatus.substr(1);
};

/**
 * Sets up a callback to be run after the starting app has rendered, if we're doing
 * post-render callbacks. The callback is registered with an order that determines
 * when it will run relative to other callbacks. A delay can also be given, so that
 * the UI has a chance to do some work between callbacks.
 *
 * @param {AjxCallback}	callback		the callback
 * @param {int}	order			the run order for the callback
 * @param {int}	delay			how long to pause before running the callback
 * @param {Boolean}	runNow		if <code>true</code>, we are not doing post-render callbacks, run the callback now and don't add it to the list
 */
ZmZimbraMail.prototype.addPostRenderCallback =
function(callback, order, delay, runNow) {
	if (!this._doingPostRenderStartup && runNow) {
		callback.run();
	} else {
		order = order || this._postRenderLast++;
		this._postRenderCallbacks.push({callback:callback, order:order, delay:delay || 0});
	}
};

ZmZimbraMail.prototype._isInternalApp =
function(app) {
	return !ZmApp.SETTING[app] || (appCtxt.get(ZmApp.SETTING[app], null, appCtxt.multiAccounts && appCtxt.accountList.mainAccount));
};

ZmZimbraMail.prototype._isIframeApp =
function(app) {
	return !this._isInternalApp(app) && appCtxt.get(ZmApp.UPSELL_SETTING[app]);
};

/**
 * @private
 */
ZmZimbraMail.prototype._getStartApp =
function(params) {
	// determine starting app
	var startApp;
	var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
	if (params && params.app) {
		startApp = ZmApp.QS_ARG_R[params.app.toLowerCase()];
		// make sure app given in QS is actually enabled
		// an app is valid if it's enabled as internal, iframe, or external
		if (!this._isInternalApp(startApp) && !this._isIframeApp(startApp)) {
			startApp = null;
		}
	}
	if (!startApp) {
		for (var app in ZmApp.DEFAULT_SORT) {
			ZmApp.DEFAULT_APPS.push(app);
		}
		ZmApp.DEFAULT_APPS.sort(function(a, b) {
			return ZmZimbraMail.hashSortCompare(ZmApp.DEFAULT_SORT, a, b);
		});
		var defaultStartApp = null;
		for (var i = 0; i < ZmApp.DEFAULT_APPS.length; i++) {
			var app = ZmApp.DEFAULT_APPS[i];
			if (this._isInternalApp(app)) {
				defaultStartApp = app;
				break;
			}
		}
		startApp = this._getDefaultStartAppName(account);
	}

	// parse query string, in case we are coming in with a deep link	
	var qsParams = AjxStringUtil.parseQueryString();
	if (qsParams && qsParams.view && !qsParams.app) {
		startApp = ZmApp.QS_VIEWS[qsParams.view];
	}

	params.startApp = startApp;
	params.qsParams = qsParams;
};

/**
 * @private
 */
ZmZimbraMail.prototype._getDefaultStartAppName =
function(account) {
	account = account || (appCtxt.multiAccounts && appCtxt.accountList.mainAccount) || null;
	
	for (var app in ZmApp.DEFAULT_SORT) {
		ZmApp.DEFAULT_APPS.push(app);
	}
	ZmApp.DEFAULT_APPS.sort(function(a, b) {
		return ZmZimbraMail.hashSortCompare(ZmApp.DEFAULT_SORT, a, b);
	});
	var defaultStartApp = null;
	for (var i = 0; i < ZmApp.DEFAULT_APPS.length; i++) {
		var app = ZmApp.DEFAULT_APPS[i];
		var setting = ZmApp.SETTING[app];
		if (!setting || appCtxt.get(setting, null, account)) {
			return app;
		}
	}
};

/**
 * Cancels the request.
 * 
 * @param	{String}	reqId		the request id
 * @param	{AjxCallback}	errorCallback		the callback
 * @param	{Boolean}	noBusyOverlay	if <code>true</code>, do not show busy overlay
 * @see	ZmRequestMgr#cancelRequest
 */
ZmZimbraMail.prototype.cancelRequest =
function(reqId, errorCallback, noBusyOverlay) {
	this._requestMgr.cancelRequest(reqId, errorCallback, noBusyOverlay);
};

/**
 * Sends the request.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @see	ZmRequestMgr#sendRequest
 */
ZmZimbraMail.prototype.sendRequest =
function(params) {
	return this._requestMgr.sendRequest(params);
};

/**
 * Runs the given function for all enabled apps, passing args.
 *
 * @param {String}	funcName		the function name
 * @param {Boolean}	force			if <code>true</code>, run func for disabled apps as well
 */
ZmZimbraMail.prototype.runAppFunction =
function(funcName, force) {
	var args = [];
	for (var i = 2; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var appName = ZmApp.APPS[i];
		var setting = this._isIframeApp(appName) ? ZmApp.UPSELL_SETTING[appName] : ZmApp.SETTING[appName];
		var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
		if (!setting || appCtxt.get(setting, null, account) || force) {
			var app = appCtxt.getApp(appName, null, account);
			var func = app && app[funcName];
			if (func && (typeof(func) == "function")) {
				func.apply(app, args);
			}
		}
	}
	appCtxt.notifyZimlets("runAppFunction", [funcName]);
};

/**
 * Instantiates enabled apps. An optional argument may be given limiting the set
 * of apps that may be created.
 *
 * @param {Hash}	apps	the set of apps to create
 * 
 * @private
 */
ZmZimbraMail.prototype._createEnabledApps =
function(apps) {
    this._apps = {};

	for (var app in ZmApp.CLASS) {
		if (!apps || apps[app]) {
			ZmApp.APPS.push(app);
		}
	}
	ZmApp.APPS.sort(function(a, b) {
		return ZmZimbraMail.hashSortCompare(ZmApp.LOAD_SORT, a, b);
	});

	// Instantiate enabled apps, which will invoke app registration.
	// We also create iframed (external) apps, which will only show the content of a URL in an iframe.
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = ZmApp.APPS[i];
		var isInternal = this._isInternalApp(app);
		var isIframe = this._isIframeApp(app);
		if (isInternal || isIframe || app === ZmApp.BRIEFCASE) {
			ZmApp.ENABLED_APPS[app] = isInternal || isIframe;
			this._createApp(app);
			this._apps[app].isIframe = isIframe;
		}
	}
};

/**
 * Static function to add a listener before this class has been instantiated.
 * During construction, listeners are copied to the event manager. This function
 * could be used by a skin, for example.
 *
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 */
ZmZimbraMail.addListener =
function(type, listener) {
	if (!ZmZimbraMail._listeners[type]) {
		ZmZimbraMail._listeners[type] = [];
	}
	ZmZimbraMail._listeners[type].push(listener);
};

/**
 * Static function to add an app listener before this class has been
 * instantiated. This is separate from {@link ZmZimbraMail#addListener}
 * so that the caller doesn't need to know the specifics of how we
 * twiddle the type name for app events.
 * 
 * @param	{String}	appName		the application name
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 * 
 */
ZmZimbraMail.addAppListener =
function(appName, type, listener) {
	type = [appName, type].join("_");
	ZmZimbraMail.addListener(type, listener);
};

/**
 * Adds a listener for the given event type.
 *
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 * @return	{Boolean}	<code>true</code> if the listener is added
 * 
 */
ZmZimbraMail.prototype.addListener =
function(type, listener) {
	return this._evtMgr.addListener(type, listener);
};

/**
 * Removes a listener for the given event type.
 *
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 * @return	{Boolean}	<code>true</code> if the listener is removed
 */
ZmZimbraMail.prototype.removeListener =
function(type, listener) {
	return this._evtMgr.removeListener(type, listener);
};

/**
 * Adds a listener for the given event type and app.
 *
 * @param {constant}	app		the app name
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 * @return	{Boolean}	<code>true</code> if the listener is added
 */
ZmZimbraMail.prototype.addAppListener =
function(app, type, listener) {
	type = [app, type].join("_");
	return this.addListener(type, listener);
};

/**
 * Removes a listener for the given event type and app.
 *
 * @param {constant}	app		the app name
 * @param {constant}	type		the event type
 * @param {AjxListener}	listener	a listener
 * @return	{Boolean}	<code>true</code> if the listener is removed
 */
ZmZimbraMail.prototype.removeAppListener =
function(app, type, listener) {
	type = [app, type].join("_");
	return this.removeListener(type, listener);
};

/**
 * Sends a <code>&lt;NoOpRequest&gt;</code> to the server. Used for '$set:noop'
 */
ZmZimbraMail.prototype.sendNoOp =
function() {
	var jsonObj = { NoOpRequest: { _jsns: "urn:zimbraMail" } };
	var accountName = appCtxt.isOffline && appCtxt.accountList.mainAccount.name;
	this.sendRequest({jsonObj:jsonObj, asyncMode:true, noBusyOverlay:true, accountName:accountName});
};

/**
 * Sends a <code>&lt;ClientEventNotifyRequest&gt;</code> to the server.
 * 
 * @param	{Object}	event		the event
 */
ZmZimbraMail.prototype.sendClientEventNotify =
function(event, isNetworkOn) {
	var params = {
		jsonObj: {
			ClientEventNotifyRequest: {
				_jsns:"urn:zimbraOffline",
				e: event
			}
		},
		asyncMode:true
	};

    if (isNetworkOn) {
        params.callback = new AjxCallback(this, this.handleClientEventNotifyResponse, event);
        params.noBusyOverlay = true;

        if (this.clientEventNotifyReqId) {
            appCtxt.getRequestMgr().cancelRequest(this.clientEventNotifyReqId);
        }
        this.clientEventNotifyTimerId = 
            AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.sendClientEventNotify, [event, true]), 3000);
    } else {
        params.callback = new AjxCallback(this, this.setInstantNotify, true);
    }

    this.clientEventNotifyReqId = this.sendRequest(params);
};

ZmZimbraMail.prototype.handleClientEventNotifyResponse =
function(event, res) {
    if (!res.isException() && res.getResponse()) {
        if (this.clientEventNotifyTimerId) {
            AjxTimedAction.cancelAction(this.clientEventNotifyTimerId);
            this.clientEventNotityTimerId = null;
        }
        this.setInstantNotify(true);
    }
};

/**
 * Sets the client into "instant notifications" mode.
 * 
 * @param {Boolean}	on				if <code>true</code>, turn on instant notify
 */
ZmZimbraMail.prototype.setInstantNotify =
function(on) {
	if (on) {
		this._pollInstantNotifications = true;
		// set nonzero poll interval so cant ever get into a full-speed request loop
		this._pollInterval = appCtxt.get(ZmSetting.INSTANT_NOTIFY_INTERVAL);
		if (this._pollActionId) {
			AjxTimedAction.cancelAction(this._pollActionId);
			this._pollActionId = null;
		}
		this._kickPolling(true);
	} else {
		this._pollInstantNotifications = false;
		this._cancelInstantNotify();
		this.setPollInterval(true);
	}
};

/**
 * Gets the "instant notification" setting.
 * 
 * @return	{Boolean}	<code>true</code> if instant notification is "ON"
 */
ZmZimbraMail.prototype.getInstantNotify =
function() {
	return this._pollInstantNotifications;
};

ZmZimbraMail.prototype.registerMailtoHandler =
function(regProto, selected) {
	if (appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_MAILTO) && window.platform) {
		try { // add try/catch - see bug #33870
			if (selected) { // user selected zd as default mail app 
				// register mailto handler
				if (regProto) {
					var url = appCtxt.get(ZmSetting.OFFLINE_WEBAPP_URI, null, appCtxt.accountList.mainAccount);
					window.platform.registerProtocolHandler("mailto", url + "&mailto=%s");
				
					// handle "send to mail recipient" on windows (requires mapi@zimbra.com extension)
					if (AjxEnv.isWindows) {
						var shell = new ZimbraDesktopShell;
						shell.defaultClient = true;
					}
				}

				// register mailto callback
				var callback = AjxCallback.simpleClosure(this.handleOfflineMailTo, this);
				window.platform.registerProtocolCallback("mailto", callback);
			} else { // unselected (box unchecked) 
				window.platform.unregisterProtocolHandler("mailto");

				if (AjxEnv.isWindows) {
					var shell = new ZimbraDesktopShell;
					shell.defaultClient = false;
				}
			}
		} catch(ex) {
			// do nothing
		}
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype.handleOfflineMailTo =
function(uri, callback) {
	if (window.platform && !window.platform.isRegisteredProtocolHandler("mailto")) { return false; }

	var mailApp = this.getApp(ZmApp.MAIL);
	var idx = (uri.indexOf("mailto"));
	if (idx >= 0) {
		var query = "to=" + decodeURIComponent(uri.substring(idx+7));
		query = query.replace(/\?/g, "&");
		var controller = mailApp._showComposeView(callback, query);
        	this._checkOfflineMailToAttachments(controller, query);
		return true;
	}
	return false;
};

ZmZimbraMail.prototype._checkOfflineMailToAttachments =
function(controller, queryStr) {
    var qs = queryStr || location.search;

    var match = qs.match(/\bto=([^&]+)/);
    var to = match ? AjxStringUtil.urlComponentDecode(match[1]) : null;

    match = qs.match(/\battachments=([^&]+)/);
    var attachments = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;

    if (to && to.indexOf('mailto') == 0) {
        to = to.replace(/mailto:/,'');
        var mailtoQuery = to.split('?');
        if (mailtoQuery.length > 1) {
            mailtoQuery = mailtoQuery[1];
            match = mailtoQuery.match(/\battachments=([^&]+)/);
            if(!attachments) attachments = match ? (AjxStringUtil.urlComponentDecode(match[1]).replace(/\+/g, " ")) : null;
        }
    }

    if(attachments) {
        attachments = attachments.replace(/;$/, "");
        attachments = attachments.split(";");
        this._mailtoAttachmentsLength = attachments.length;
        this._attachmentsProcessed = 0;        
        this.attachment_ids = [];
        for(var i=0; i<attachments.length; i++) {
            this._handleMailToAttachment(attachments[i], controller);
        }
    }
};

ZmZimbraMail.prototype._handleMailToAttachment =
function(attachment, controller) {

    var filePath = attachment;
    var filename = filePath.replace(/^.*\\/, '');

    DBG.println("Uploading File :" + filename + ",filePath:" + filePath);

    //check read file permission;
    try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    } catch (e) {
        //permission denied to read file
        DBG.println("Permission denied to read file");
        return;
    }

    try {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath( filePath );

        var contentType = this._getAttachmentContentType(file);

        var inputStream = Components.classes[ "@mozilla.org/network/file-input-stream;1" ].createInstance(Components.interfaces.nsIFileInputStream);
        inputStream.init(file, -1, -1, false );

        var binary = Components.classes[ "@mozilla.org/binaryinputstream;1" ].createInstance(Components.interfaces.nsIBinaryInputStream);
        binary.setInputStream(inputStream);

        var req = new XMLHttpRequest();
        req.open("POST", appCtxt.get(ZmSetting.CSFE_UPLOAD_URI)+"&fmt=extended,raw", true);
        req.setRequestHeader("Cache-Control", "no-cache");
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        req.setRequestHeader("Content-Type",  (contentType || "application/octet-stream") );
        req.setRequestHeader("Content-Disposition", 'attachment; filename="'+ AjxUtil.convertToEntities(filename) + '"');

        var reqObj = req;
        req.onreadystatechange = AjxCallback.simpleClosure(this._handleUploadResponse, this, reqObj, controller);
        req.sendAsBinary(binary.readBytes(binary.available()));
        delete req;
    }catch(ex) {
        DBG.println("exception in handling attachment: " + attachment);
        DBG.println(ex);
        this._attachmentsProcessed++;
    }
};

ZmZimbraMail.prototype._getAttachmentContentType =
function(file) {
	var contentType;
	try {
		contentType = Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService).getTypeFromFile(file);
	}catch(ex) {
		 DBG.println("exception in reading content type: " + ex);
		 contentType =  "application/octet-stream";
	}
	return contentType;
};

ZmZimbraMail.prototype._handleUploadResponse = function(req, controller) {
    if(req) {
        if(req.readyState == 4 && req.status == 200) {
            var resp = eval("["+req.responseText+"]");
            this._attachmentsProcessed++;
            this.popupUploadErrorDialog(ZmItem.MSG, resp[0]);
            if(resp.length > 2) {
                var respObj = resp[2];
                for (var i = 0; i < respObj.length; i++) {
                    if(respObj[i].aid != "undefined") {
                        this.attachment_ids.push(respObj[i].aid);
                    }
                }

                if(this.attachment_ids.length > 0 && this._attachmentsProcessed == this._mailtoAttachmentsLength) {
                    var attachment_list = this.attachment_ids.join(",");
                    if(!controller) {
                        var msg = new ZmMailMsg();
                        controller = AjxDispatcher.run("GetComposeController");
                        controller._setView({action:ZmOperation.NEW_MESSAGE, msg:msg, inNewWindow:false});
                    }
                    var callback = new AjxCallback (controller,controller._handleResponseSaveDraftListener);
        		    controller.sendMsg(attachment_list, ZmComposeController.DRAFT_TYPE_MANUAL,callback);
                    this.getAppViewMgr().pushView(controller.getCurrentViewId());
                }
            }
        }
    }

};

/**
 * Resets the interval between poll requests, based on what's in the settings,
 * only if we are not in instant notify mode.
 *
 * @param {Boolean}	kickMe	if <code>true</code>, start the poll timer
 * @return	{Boolean}	<code>true</code> if poll interval started; <code>false</code> if in "instant notification" mode
 */
ZmZimbraMail.prototype.setPollInterval =
function(kickMe) {
	if (!this._pollInstantNotifications) {
		this._pollInterval = appCtxt.get(ZmSetting.POLLING_INTERVAL) * 1000;

		if (this._pollInterval) {
			DBG.println(AjxDebug.DBG1, "poll interval = " + this._pollInterval + "ms");
			if (kickMe)
				this._kickPolling(true);
		} else {
			// cancel timer if it is waiting...
			if (this._pollActionId) {
				AjxTimedAction.cancelAction(this._pollActionId);
				this._pollActionId = null;
			}
		}
		return true;
	} else {
		this._pollInterval = appCtxt.get(ZmSetting.INSTANT_NOTIFY_INTERVAL);
		DBG.println(AjxDebug.DBG1, "Ignoring Poll Interval (in instant-notify mode)");
		return false;
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype._cancelInstantNotify =
function() {
	if (this._pollRequest) {
		this._requestMgr.cancelRequest(this._pollRequest);
		this._pollRequest = null;
	}

	if (this._pollActionId) {
		AjxTimedAction.cancelAction(this._pollActionId);
		this._pollActionId = null;
	}
};

/**
 * Make sure the polling loop is running.  Basic flow:
 *
 *       1) kickPolling():
 *             - cancel any existing timers
 *             - set a timer for _pollInterval time
 *             - call execPoll() when the timer goes off
 *
 *       2) execPoll():
 *             - make the NoOp request, if we're in "instant notifications"
 *               mode, this request will hang on the server until there is more data,
 *               otherwise it will return immediately.  Call into a handle() func below
 *
 *       3) handleDoPollXXXX():
 *             - call back to kickPolling() above
 *
 * resetBackoff = TRUE e.g. if we've just received a successful
 * response from the server, or if the user just changed our
 * polling settings and we want to start in fast mode
 * 
 * @private
 */
ZmZimbraMail.prototype._kickPolling =
function(resetBackoff) {
	DBG.println(AjxDebug.DBG2, [
		"ZmZimbraMail._kickPolling ",
		this._pollInterval, ", ",
		this._pollActionId, ", ",
		this._pollRequest ? "request_pending" : "no_request_pending"
	].join(""));

	// reset the polling timeout
	if (this._pollActionId) {
		AjxTimedAction.cancelAction(this._pollActionId);
		this._pollActionId = null;
	}

	if (resetBackoff && this._pollInstantNotifications) {
		// we *were* backed off -- reset the delay back to 1s fastness
		var interval = appCtxt.get(ZmSetting.INSTANT_NOTIFY_INTERVAL);
		if (this._pollInterval > interval) {
			this._pollInterval = interval;
		}
	}

	if (this._pollInterval && !this._pollRequest) {
		try {
			this._pollActionId = AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._execPoll), this._pollInterval);
		} catch (ex) {
			this._pollActionId = null;
			DBG.println(AjxDebug.DBG1, "Caught exception in ZmZimbraMail._kickPolling.  Polling chain broken!");
		}
	}
};

/**
 * We've finished waiting, do the actual poll itself
 *
 * @private
 */
ZmZimbraMail.prototype._execPoll =
function() {

	this._cancelInstantNotify();

	// It'd be more efficient to make these instance variables, but for some
	// reason that breaks polling in IE.
	var jsonObj = { NoOpRequest: { _jsns: "urn:zimbraMail" } },
		method = jsonObj.NoOpRequest;

	try {
        if (this._pollInstantNotifications) {
			var sessionId = ZmCsfeCommand.getSessionId();
			if (sessionId) {
				method.wait = 1;
				method.limitToOneBlocked = 1;
			}
        }
		var params = {
			jsonObj:        jsonObj,
			asyncMode:      true,
			callback:       this._handleResponseDoPoll.bind(this),
			errorCallback:  this._handleErrorDoPoll.bind(this),
			noBusyOverlay:  true,
			timeout:        appCtxt.get(ZmSetting.INSTANT_NOTIFY_TIMEOUT),
			accountName:    appCtxt.isOffline && appCtxt.accountList.mainAccount.name
		};
		this._pollRequest = this.sendRequest(params);

		// bug #42664 - handle case where sync-status-changes fall between 2 client requests
		var accList = appCtxt.accountList;
		if (appCtxt.isOffline && !accList.isInitialSyncing() && accList.isSyncStatus(ZmZimbraAccount.STATUS_RUNNING)) {
			this.sendNoOp();
		}
	} catch (ex) {
		this._handleErrorDoPoll(ex); // oops!
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype._handleErrorDoPoll =
function(ex) {
	if (this._pollRequest) {
		// reset the polling timeout
		if (this._pollActionId) {
			AjxTimedAction.cancelAction(this._pollActionId);
			this._pollActionId = null;
		}
		this._requestMgr.cancelRequest(this._pollRequest);
		this._pollRequest = null;
	}

	if (this._pollInstantNotifications) {
		// very simple-minded exponential backoff
		this._pollInterval *= 2;
		if (this._pollInterval > (1000 * 60 * 2)) {
			this._pollInterval = 1000 * 60 * 2;
		}
	}

	var isAuthEx = (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED ||
					ex.code == ZmCsfeException.SVC_AUTH_REQUIRED ||
					ex.code == ZmCsfeException.NO_AUTH_TOKEN);

	// restart poll timer if we didn't get an auth exception
	if (!isAuthEx) {
		this._kickPolling(false);
	}

	return !isAuthEx;
};

/**
 * @private
 */
ZmZimbraMail.prototype._handleResponseDoPoll =
function(result) {
	this._pollRequest = null;
	var noopResult = result.getResponse().NoOpResponse;
	if (noopResult.waitDisallowed) {
		this._waitDisallowed = true;
		// revert to polling mode - server doesn't want us to use instant notify.
		this.setInstantNotify(false);
	}  else {
		// restart poll timer if we didn't get an exception
		this._kickPolling(true);
	}
};

/**
 * Gets the key map manager.
 * 
 * @return	{DwtKeyMapMgr}	the key map manager
 */
ZmZimbraMail.prototype.getKeyMapMgr =
function() {
	var kbMgr = appCtxt.getKeyboardMgr();
	if (!kbMgr.__keyMapMgr) {
		this._initKeyboardHandling();
	}
	return kbMgr.__keyMapMgr;
};

/**
 * @private
 */
ZmZimbraMail.prototype._initKeyboardHandling =
function() {
	var kbMgr = appCtxt.getKeyboardMgr();
	if (kbMgr.__keyMapMgr) { return; }
	if (appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		// Register our keymap and global key action handler with the shell's keyboard manager
		kbMgr.enable(true);
		kbMgr.registerKeyMap(new ZmKeyMap());
		kbMgr.pushDefaultHandler(this);
	} else {
		kbMgr.enable(false);
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype._setupTabGroups =
function() {
	DBG.println(AjxDebug.DBG2, "SETTING SEARCH CONTROLLER TAB GROUP");
	var rootTg = appCtxt.getRootTabGroup();
	if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		rootTg.addMember(appCtxt.getSearchController().getSearchToolbar().getTabGroupMember());
	}

	rootTg.addMember(this._userNameField);
	rootTg.addMember(this._usedQuotaField);

	if (this._helpButton) {
		rootTg.addMember(this._helpButton);
	}

	rootTg.addMember(appCtxt.getAppChooser().getTabGroupMember());
	rootTg.addMember(appCtxt.refreshButton);
	rootTg.addMember(this._newToolbar);

	var curApp = appCtxt.getCurrentApp();
	var overview = curApp && curApp.getOverview();
	if (overview) {
		rootTg.addMember(overview.getTabGroupMember());
		ZmController._currentOverview = overview;
	}
	
	appCtxt.getKeyboardMgr().setTabGroup(rootTg);
};

/**
 * @private
 */
ZmZimbraMail.prototype._registerOrganizers =
function() {

	ZmOrganizer.registerOrg(ZmOrganizer.FOLDER,
							{app:				ZmApp.MAIL,
							 nameKey:			"folder",
							 defaultFolder:		ZmOrganizer.ID_INBOX,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmFolder",
							 orgPackage:		"MailCore",
							 treeController:	"ZmMailFolderTreeController",
							 labelKey:			"mailFolders",
							 itemsKey:			"messages",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_NONE,
							 treeType:			ZmOrganizer.FOLDER,
							 dropTargets:		[ZmOrganizer.FOLDER],
							 views:				["message", "conversation"],
							 folderKey:			"mailFolder",
							 mountKey:			"mountFolder",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmFolder.sortCompare",
							 newOp:				ZmOperation.NEW_FOLDER,
							 displayOrder:		100,
							 childWindow:		true,
							 openSetting:		ZmSetting.FOLDER_TREE_OPEN
							});

	ZmOrganizer.registerOrg(ZmOrganizer.SEARCH,
							{app:				ZmApp.MAIN,
							 nameKey:			"savedSearch",
							 precondition:		ZmSetting.SAVED_SEARCHES_ENABLED,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmSearchFolder",
							 treeController:	"ZmSearchTreeController",
							 labelKey:			"searches",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_NONE,
							 treeType:			ZmOrganizer.FOLDER,
							 folderKey:			"savedSearch",
							 disableShare:		true,
 							 dropTargets:		[ZmOrganizer.FOLDER, ZmOrganizer.SEARCH],
							 createFunc:		"ZmSearchFolder.create",
							 compareFunc:		"ZmFolder.sortCompare",
							 openSetting:		ZmSetting.SEARCH_TREE_OPEN,
							 displayOrder:		300,
                             hideEmpty:         true
							});

    ZmOrganizer.registerOrg(ZmOrganizer.SHARE, {
        orgClass:       "ZmShareProxy",
        treeController: "ZmShareTreeController",
        labelKey:       "sharedFoldersHeader",
        compareFunc:	"ZmFolder.sortCompare",
        displayOrder:	101, // NOTE: Always show shares below primary folder tree
        hideEmpty:		false
    });

	ZmOrganizer.registerOrg(ZmOrganizer.TAG,
							{app:				ZmApp.MAIN,
							 nameKey:			"tag",
							 precondition:		ZmSetting.TAGGING_ENABLED,
							 soapCmd:			"TagAction",
							 firstUserId:		64,
							 orgClass:			"ZmTag",
							 treeController:	"ZmTagTreeController",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_ORANGE,
							 labelKey:			"tags",
							 treeType:			ZmOrganizer.TAG,
							 createFunc:		"ZmTag.create",
							 compareFunc:		"ZmTag.sortCompare",
							 newOp:				ZmOperation.NEW_TAG,
							 openSetting:		ZmSetting.TAG_TREE_OPEN,
							 displayOrder:		400,
                             hideEmpty:         true
							});

		// ZmOrganizer.registerOrg(ZmOrganizer.ZIMLET,
		// 						{orgClass:			"ZmZimlet",
		// 						treeController:	"ZmZimletTreeController",
		// 						labelKey:			"zimlets",
		// 						compareFunc:		"ZmZimlet.sortCompare",
		// 						openSetting:		ZmSetting.ZIMLET_TREE_OPEN,
		// 						hideEmpty:			true
		// 						});
	
	// Technically, we don't need to do this because the drop listeners for dragged organizers typically do their
	// own checks on the class of the dragged object. But it's better to do it anyway, in case it ever gets
	// validated within the drop target against the valid types.
	this._name = ZmApp.MAIN;
	ZmApp.prototype._setupDropTargets.call(this);
};

/**
 * Gets a handle to the given app.
 *
 * @param {String}	appName		the app name
 * @return	{ZmApp}	the app
 */
ZmZimbraMail.prototype.getApp =
function(appName) {
	if (!ZmApp.ENABLED_APPS[appName]) {
		return null;
	}
	if (!this._apps[appName]) {
		this._createApp(appName);
	}
	return this._apps[appName];
};

/**
 * Gets a handle to the app view manager.
 * 
 * @return	{ZmAppViewMgr}	the app view manager
 */
ZmZimbraMail.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
};

/**
 * Gets the active app.
 * 
 * @return	{ZmApp}	the app
 */
ZmZimbraMail.prototype.getActiveApp =
function() {
	return this._activeApp;
};

/**
 * Gets the previous application.
 * 
 * @return	{ZmApp}	the app
 */
ZmZimbraMail.prototype.getPreviousApp =
function() {
	return this._previousApp;
};

/**
 * Activates the given application.
 *
 * @param {constant}	appName		the application name
 * @param {Boolean}	force			if <code>true</code>, launch the app
 * @param {AjxCallback}	callback		the callback
 * @param {AjxCallback}	errorCallback	the error callback
 * @param {Hash}	params		a hash of parameters		(see {@link #startup} for full list)
 * @param {Boolean}	params.checkQS		if <code>true</code>, check query string for launch args
 * @param {ZmCsfeResult}	params.result		the result object from load of user settings
 */
ZmZimbraMail.prototype.activateApp =
function(appName, force, callback, errorCallback, params) {
	DBG.println(AjxDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);

	var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
	var isIframe = this._isIframeApp(appName);
	var view = this._appViewMgr.getAppView(appName);
	if (view && !force) {
		// if the app has been launched, make its view the current one
		DBG.println(AjxDebug.DBG3, "activateApp, current " + appName + " view: " + view);
		if (this._appViewMgr.pushView(view)) {
			this._appViewMgr.setAppView(appName, view);
            if (isIframe) {
                var title = [ZmMsg.zimbraTitle, appName].join(": ");
                Dwt.setTitle(title);
            }            
		}
		if (callback) {
			callback.run();
		}
	} else {
		// launch the app
		if (!this._apps[appName]) {
			this._createApp(appName);
		}

		if (isIframe) {
			this._createAppIframeView(appName);
			if (callback) {
				callback.run();
			}
		}
		else {
			DBG.println(AjxDebug.DBG1, "Launching app " + appName);
			var respCallback = new AjxCallback(this, this._handleResponseActivateApp, [callback, appName]);
			var eventType = [appName, ZmAppEvent.PRE_LAUNCH].join("_");
			this._evt.item = this._apps[appName];
			this.notify(eventType);
			params = params || {};
			params.searchResponse = this._searchResponse;
			this._apps[appName].launch(params, respCallback);
			delete this._searchResponse;
		}
	}
};

/**
 * @private
 */
ZmZimbraMail.prototype._handleResponseActivateApp =
function(callback, appName) {
	if (callback) {
		callback.run();
	}

	if (ZmApp.DEFAULT_SEARCH[appName]) {
		appCtxt.getSearchController().setDefaultSearchType(ZmApp.DEFAULT_SEARCH[appName]);
	}

	var eventType = [appName, ZmAppEvent.POST_LAUNCH].join("_");
	this._evt.item = this._apps[appName];
	this.notify(eventType);
};

/**
 * Handles a change in which app is current. The change will be reflected in the
 * current app toolbar and the overview. The previous and newly current apps are
 * notified of the change. This method is called after a new view is pushed.
 *
 * @param {Object}	view
 */
ZmZimbraMail.prototype.setActiveApp =
function(view) {
	var appName = view.app;

	// update app chooser
	if (!view.isTabView) {
		this._components[ZmAppViewMgr.C_APP_CHOOSER].setSelected(appName);
	}

	// app not actually enabled if this is result of iframe view push
	var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
	var appEnabled = !ZmApp.SETTING[appName] || appCtxt.get(ZmApp.SETTING[appName], null, account);

	this._activeTabId = null;	// app is active; tab IDs are for non-apps

	if (appName === ZmApp.SEARCH) {
		//this is a special case - the search tab - set the new button based on type by using the results type app to get the button props.
		this._setSearchTabNewButtonProps(view.controller._resultsController);
	}

	if (this._activeApp != appName) {
		// deactivate previous app
	    if (this._activeApp) {
			// some views are not stored in _apps collection, so check if it exists.
			var app = this._apps[this._activeApp];
			if (app) {
				app.activate(false, view.id);
			}
			this._previousApp = this._activeApp;
		}

		// switch app
		this._activeApp = appName;
		if (appEnabled) {
			var app = this._apps[this._activeApp];
			if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
				var searchType;
				var currentSearch;
				if (appName === ZmApp.SEARCH) {
					currentSearch = view.controller._resultsController._currentSearch;
					var types = currentSearch && currentSearch.types;
					searchType = types && types.size() > 0 && types.get(0);
				}
				else {
					currentSearch = app.currentSearch;
					searchType = app.getInitialSearchType();
					if (!searchType) {
						searchType = ZmApp.DEFAULT_SEARCH[appName];
					}
				}
				if (searchType) {
					appCtxt.getSearchController().setDefaultSearchType(searchType);
				}
				// set search string value to match current app's last search, if applicable
				var stb = appCtxt.getSearchController().getSearchToolbar();
				if (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) && stb) {
					var value = currentSearch ? currentSearch.query : app.currentQuery;
					value = appName === ZmApp.SEARCH ? "" : value;
					stb.setSearchFieldValue(value || "");
				}
			}

			// activate current app - results in rendering of overview
			if (app) {
				if (appCtxt.inStartup && this._doingPostRenderStartup) {
					var callback = new AjxCallback(this,
						function() {
							app.activate(true);
						});
					this.addPostRenderCallback(callback, 1, 0, true);
				} else {
					app.activate(true);
				}
			}
		}
		this._evt.item = this._apps[appName];
		this.notify(ZmAppEvent.ACTIVATE);
	}
	else if (this._activeApp && this._apps[this._activeApp]) {
		this._apps[this._activeApp].stopAlert();
	}
};

ZmZimbraMail.prototype._setSearchTabNewButtonProps =
function(resultsController) {
	var resultsApp;
	if (resultsController.isZmCalViewController) {
		//calendar search is different, no _currentSearch unfortunately.
		resultsApp = appCtxt.getApp(ZmApp.CALENDAR);
	}
	else {
		var currentSearch = resultsController._currentSearch;
		var types = currentSearch && currentSearch.types;
		var searchType = types && types.size() > 0 && types.get(0);
		resultsApp = searchType && appCtxt.getApp(ZmItem.APP[searchType]);
	}
	if (resultsApp) {
		appCtxt.getAppController().setNewButtonProps(resultsApp.getNewButtonProps());
	}

};

/**
 * Gets the app chooser button.
 * 
 * @param	{String}	id		the id
 * @return	{ZmAppButton}	the button
 */
ZmZimbraMail.prototype.getAppChooserButton =
function(id) {
	var chooser = this._components[ZmAppViewMgr.C_APP_CHOOSER];
	return chooser && chooser.getButton(id);
};

/**
 * An app calls this once it has fully rendered, so that we may notify
 * any listeners.
 * 
 * @param	{String}	appName		the app name
 */
ZmZimbraMail.prototype.appRendered =
function(appName) {
	var eventType = [appName, ZmAppEvent.POST_RENDER].join("_");
	this.notify(eventType);

	if (window._facadeCleanup) {
		window._facadeCleanup();
		window._facadeCleanup = null;
	}
};

/**
 * Adds the application.
 * 
 * @param	{ZmApp}		app		the app
 */
ZmZimbraMail.prototype.addApp = function(app) {
	var appName = app.getName();
	this._apps[appName] = app;
	ZmApp.ENABLED_APPS[appName] = true;
};

// Private methods

/**
 * Creates an app object, which doesn't necessarily do anything just yet.
 * 
 * @private
 */
ZmZimbraMail.prototype._createApp =
function(appName) {
	if (!appName || this._apps[appName]) return;
	DBG.println(AjxDebug.DBG1, "Creating app " + appName);
	var appClass = eval(ZmApp.CLASS[appName]);
	this.addApp(new appClass(this._shell));
};

/**
 * @private
 */
ZmZimbraMail.prototype._setExternalLinks =
function() {
    // bug: 41313 - admin console link
    var adminUrl;
    if (!appCtxt.isOffline &&
        (appCtxt.get(ZmSetting.IS_ADMIN) ||
         appCtxt.get(ZmSetting.IS_DELEGATED_ADMIN))) {

        adminUrl = appCtxt.get(ZmSetting.ADMIN_URL);
        if (!adminUrl) {
            adminUrl = ["https://", location.hostname, ":7071"].join("");
        }
    }
	var el = document.getElementById("skin_container_links");
	if (el) {
		var data = {
			showOfflineLink: (!appCtxt.isOffline && appCtxt.get(ZmSetting.SHOW_OFFLINE_LINK)),
			helpIcon: (appCtxt.getSkinHint("helpButton", "hideIcon") ? null : "Help"),
			logoutIcon: (appCtxt.getSkinHint("logoutButton", "hideIcon") ? null : "Logoff"),
			logoutText: (appCtxt.isOffline ? ZmMsg.setup : ZmMsg.logOff),
			adminUrl: adminUrl
		};
		el.innerHTML = AjxTemplate.expand("share.App#UserInfo", data);
	}
	
	el = document.getElementById("skin_container_help_button");
	if (el) {
		this._helpButton = this.getHelpButton(DwtShell.getShell(window));
		this._helpButton.reparentHtmlElement("skin_container_help_button");
	}

    el = document.getElementById("skin_dropMenu");
    if (el) {
		this._helpButton = this.getDropMenuOptions(DwtShell.getShell(window), el, adminUrl);
		//this._helpButton.reparentHtmlElement("skin_dropMenu");
	}
};


ZmZimbraMail.ONLINE_HELP_URL = "https://help.zimbra.com/?";
ZmZimbraMail.NEW_FEATURES_URL = "https://www.zimbra.com/products/whats_new.html?";

ZmZimbraMail.DEFAULT_CONTACT_ICON = appContextPath + "/img/large/ImgPerson_48.png?v=" + window.cacheKillerVersion;
ZmZimbraMail.DEFAULT_CONTACT_ICON_SMALL = appContextPath + "/img/large/ImgPerson_32.png?v=" + window.cacheKillerVersion;

/**
* Adds a "help" submenu.
*
* @param {DwtComposite}		parent		the parent widget
* @return {ZmActionMenu}	the menu
*/
ZmZimbraMail.prototype.getDropMenuOptions =
function(parent, parentElement, adminUrl) {

	var button = new DwtLinkButton({parent: parent, className: DwtButton.LINK_BUTTON_CLASS, parentElement: parentElement, elementTag: "DIV"});
	button.whatToShow = { };
	button.setSize(Dwt.DEFAULT);
	button.setAlign(DwtLabel.ALIGN_LEFT);
	button.setText(ZmMsg.help);
	button.setAttribute('aria-label', ZmMsg.userActions);
	var menu = new ZmPopupMenu(button);

	var supportedHelps = appCtxt.get(ZmSetting.SUPPORTED_HELPS);
	var helpListener = new AjxListener(this, this._helpListener);
	button.addSelectionListener(helpListener);

    var mi;

	if (this.getApp(ZmAppChooser.OPTIONS)) {
		var preferenceListener = new AjxListener(this, this._appButtonListener);
		var prefButtonId = ZmAppChooser.OPTIONS;
		mi = menu.createMenuItem(prefButtonId, {text: ZmMsg.preferences});
		mi.setData(Dwt.KEY_ID, prefButtonId);
		mi.addSelectionListener(preferenceListener);
	}

	mi = menu.createMenuItem("showCurrentShortcuts", {text: ZmMsg.shortcuts});
	mi.addSelectionListener(this._showCurrentShortcuts.bind(this));

	if (supportedHelps.indexOf("productHelp") !== -1) {
		mi = menu.createMenuItem("documentation", {text: ZmMsg.productHelp});
		mi.addSelectionListener(helpListener);
	}

	if (supportedHelps.indexOf("onlineHelp") !== -1) {
		mi = menu.createMenuItem("onlinehelp", {text: ZmMsg.onlineHelp});
		mi.addSelectionListener(new AjxListener(this, this._onlineHelpListener));
	}

	if (supportedHelps.indexOf("newFeatures") !== -1) {
		mi = menu.createMenuItem("newFeatures", {text: ZmMsg.newFeatures});
		mi.addSelectionListener(new AjxListener(this, this._newFeaturesListener));
	}

	menu.createSeparator();

	if (adminUrl) {
	    mi = menu.createMenuItem("adminLink", {text: ZmMsg.adminLinkLabel});
	    mi.addSelectionListener(new AjxListener(null, ZmZimbraMail.adminLinkCallback, adminUrl));
	}

    mi = menu.createMenuItem("standardHtmlLink", {text: ZmMsg.htmlClient});
    mi.addSelectionListener(ZmZimbraMail.standardHtmlLinkCallback);

	menu.createSeparator();

	mi = menu.createMenuItem(ZmZimbraMail.HELP_MENU_ABOUT, {text: ZmMsg.about});
	mi.addSelectionListener(new AjxListener(this, this._aboutListener));

    menu.createSeparator();

	if (!appCtxt.isExternalAccount() && appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_ENABLED)) {
        mi = menu.createMenuItem("offlineSettings", {text: ZmMsg.offlineSettings});
        mi.addSelectionListener(new AjxListener(this, this._offlineSettingsListener));
    }

	if (AjxEnv.isFirefox && (AjxEnv.browserVersion >= 23.0) && !appCtxt.isExternalAccount()) {
		mi = menu.createMenuItem("socialfoxSettings", {text: ZmMsg.socialfoxEnableSidebar});
		mi.addSelectionListener(this._socialfoxSettingsListener.bind(this));
	}

	if (appCtxt.get(ZmSetting.CHANGE_PASSWORD_ENABLED)) {
        mi = menu.createMenuItem("changePassword", {text: ZmMsg.changePassword});
        mi.addSelectionListener(new AjxListener(this, this._changePasswordListener));
	}

    mi = menu.createMenuItem(ZmZimbraMail.HELP_MENU_LOGOFF, {text: ZmMsg.logOff});
	mi.addSelectionListener(new AjxListener(null, ZmZimbraMail.logOff));

	button.setMenu(menu);
	this.setupHelpMenu(button);
	return button;
};

ZmZimbraMail.HELP_MENU_ABOUT  = "about";
ZmZimbraMail.HELP_MENU_LOGOFF = "logOff";

ZmZimbraMail.prototype.setupHelpMenu = function(button) {
	button = button || this._helpButton;
	if (!button) return;

	var menu = button.getMenu();
	if (!menu) return;

	var isOnline = !appCtxt.isWebClientOffline();
	if (isOnline) {
		menu.enableAll(true);
	} else {
		menu.enableAll(false);
		var offlineEnabledIds = [ZmZimbraMail.HELP_MENU_ABOUT];
		menu.enable(offlineEnabledIds, true);
	}
};

ZmZimbraMail.prototype.getNewButton =
function() {

	var newButton = this._newButton;
	if (!newButton) {
		var buttonId = ZmId.getButtonId(null, ZmOperation.NEW_MENU);
		var buttonParams = {
			parent:		appCtxt.getShell(),
			id:			buttonId,
			posStyle:	DwtControl.ABSOLUTE_STYLE,
			className:	"ZToolbarButton ZNewButton"
		};
		newButton = this._newButton = new DwtToolBarButton(buttonParams);
		newButton.setText(ZmMsg._new);

		ZmOperation.addNewMenu(newButton);

		var selectionListener = this._newButtonListener.bind(this);
		var listener = this._newDropDownListener.bind(this, selectionListener);
		this._newDropDownListener = listener;
		newButton.addSelectionListener(selectionListener);
		newButton.addDropDownSelectionListener(listener);
	}

	return newButton;
};



/**
 * Creates the New menu's drop down menu the first time the drop down arrow is used,
 * then removes itself as a listener.
 *
 * @private
 */
ZmZimbraMail.prototype._newDropDownListener =
function(selectionListener, event) {

	var newButton = this.getNewButton();
	var menu = newButton.getMenu();
	var items = menu.getItems();
	for (var i = 0; i < menu.getItemCount(); i++) {
		items[i].addSelectionListener(selectionListener);
	}

	var listener = this._newDropDownListener;
	newButton.removeDropDownSelectionListener(listener);
	//Called explicitly as its a selection listener. Refer DwtButton._dropDownCellMouseDownHdlr()
	newButton.popup();

	delete this._newDropDownListener;
};

/**
 * Create some new thing, via a dialog. If just the button has been pressed (rather than
 * a menu item), the action taken depends on the app.
 *
 * @param {DwtUiEvent}	ev		the ui event
 * @param {constant}	op		the operation ID
 * @param {Boolean}		newWin	<code>true</code> if in a separate window
 *
 * @private
 */
ZmZimbraMail.prototype._newButtonListener =
function(ev, op, params) {

	if (!ev && !op) { return; }

	op = op || ev.item.getData(ZmOperation.KEY_ID);
	if (!op || op == ZmOperation.NEW_MENU) {
		op = ZmController._defaultNewId;
	}

	var app = ZmApp.OPS_R[op];
	if (app) {
		params = params || {};
		params.ev = ev;
		appCtxt.getApp(app).handleOp(op, params);
	} else {
		var ctlr = appCtxt.getCurrentController();
		if (ctlr) {
			ctlr._newListener(ev, op);
		}
	}
};

/**
 * Set up the New button based on the current app.
 */
ZmZimbraMail.prototype.setNewButtonProps =
function(params) {
	var newButton = this.getNewButton();
	if (newButton) {
		newButton.setText(params.text);
		newButton.setToolTipContent(params.tooltip);
		newButton.setImage(params.icon);
		newButton.setEnabled(!params.disabled);
		ZmController._defaultNewId = params.defaultId;
		params.hidden ? newButton.setVisibility(false) : newButton.setVisibility(true);
	}
};


/**
* Adds a "help" submenu.
*
* @param {DwtComposite}		parent		the parent widget
* @return {ZmActionMenu}	the menu
*/
ZmZimbraMail.prototype.getHelpButton =
function(parent) {

	var button = new DwtLinkButton({parent: parent, className: DwtButton.LINK_BUTTON_CLASS});
	button.dontStealFocus();
	button.setSize(Dwt.DEFAULT);
	button.setAlign(DwtLabel.ALIGN_LEFT);
	button.setText(ZmMsg.help);
	var menu = new ZmPopupMenu(button);

	var helpListener = new AjxListener(this, this._helpListener);
	button.addSelectionListener(helpListener);

	var mi = menu.createMenuItem("documentation", {text: ZmMsg.productHelp});
	mi.addSelectionListener(helpListener);

	var mi = menu.createMenuItem("onlinehelp", {text: ZmMsg.onlineHelp});
	mi.addSelectionListener(new AjxListener(this, this._onlineHelpListener));


	mi = menu.createMenuItem("newFeatures", {text: ZmMsg.newFeatures});
	mi.addSelectionListener(new AjxListener(this, this._newFeaturesListener));

	mi = menu.createMenuItem("showCurrentShortcuts", {text: ZmMsg.shortcuts});
	mi.addSelectionListener(this._showCurrentShortcuts.bind(this));

	menu.createSeparator();

	mi = menu.createMenuItem("about", {text: ZmMsg.about});
	mi.addSelectionListener(new AjxListener(this, this._aboutListener));

	button.setMenu(menu);
	return button;
};

ZmZimbraMail.prototype._helpListener =
function(ev) {
	ZmZimbraMail.helpLinkCallback();
};


ZmZimbraMail.prototype._getVersion =
function() {
	return appCtxt.get(ZmSetting.CLIENT_VERSION);
};


ZmZimbraMail.prototype._getQueryParams =
function() {

	var appName = appCtxt.getCurrentAppName().toLowerCase();
	var prod = appCtxt.isOffline ? "zd" : "zcs";
	return ["utm_source=", appName, "&utm_medium=", prod, "&utm_content=", this._getVersion(), "&utm_campaign=help"].join("");
};


ZmZimbraMail.prototype._onlineHelpListener =
function(ev) {
	ZmZimbraMail.unloadHackCallback();
	var url = [ZmZimbraMail.ONLINE_HELP_URL, this._getQueryParams()].join("");
	window.open(url);
};

ZmZimbraMail.prototype._newFeaturesListener =
function(ev) {
	ZmZimbraMail.unloadHackCallback();
	var url = [ZmZimbraMail.NEW_FEATURES_URL, this._getQueryParams()].join("");
	window.open(url);
};

ZmZimbraMail.prototype._changePasswordListener =
function(ev) {
    appCtxt.getChangePasswordWindow(ev);
}

ZmZimbraMail.prototype._aboutListener =
function(ev) {
	var dialog = appCtxt.getMsgDialog();
	dialog.reset();
	var version = this._getVersion();
	var release = appCtxt.get(ZmSetting.CLIENT_RELEASE);
	var aboutMsg = appCtxt.isOffline ? ZmMsg.aboutMessageZD : ZmMsg.aboutMessage;
	dialog.setMessage(AjxMessageFormat.format(aboutMsg, [version, release, AjxDateUtil.getYearStr()]), DwtMessageDialog.INFO_STYLE, ZmMsg.about);
	dialog.popup();

};

ZmZimbraMail.prototype._offlineSettingsListener =
function(ev) {
    var dialog;
    if (AjxEnv.isOfflineSupported) {
        dialog = appCtxt.getOfflineSettingsDialog();
    } else {
        dialog = appCtxt.getMsgDialog();
        dialog.setMessage(ZmMsg.offlineSupportedBrowser, "", ZmMsg.offlineSettings);
    }
    dialog.popup();
};

ZmZimbraMail.prototype._socialfoxSettingsListener =
function(ev) {
    var dialog = new ZmSocialfoxActivationDialog();
    dialog.popup();
};


ZmZimbraMail.prototype._initOfflineUserInfo =
function() {
	var htmlElId = this._userNameField.getHTMLElId();
	this._userNameField.getHtmlElement().innerHTML = AjxTemplate.expand('share.App#NetworkStatus', {id:htmlElId});
	this._userNameField.addClassName("BannerTextUserOffline");

	var params = {
		parent: this._userNameField,
		parentElement: (htmlElId+"_networkStatusIcon")
	};
	this._networkStatusIcon = new DwtComposite(params);

	var params1 = {
		parent: this._userNameField,
		parentElement: (htmlElId+"_networkStatusText")
	};
	this._networkStatusText = new DwtComposite(params1);

	var topTreeEl = document.getElementById("skin_container_tree_top");
	if (topTreeEl) {
		Dwt.setSize(topTreeEl, Dwt.DEFAULT, "20");
	}
};

ZmZimbraMail.prototype._offlineUpdateChannelPref =
function(val) {
    try {
        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
        var prefs =
            Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        if (prefs) {
            prefs.setCharPref("app.update.channel", val);
        }
    } catch (ex) {
        DBG.println(AjxDebug.DBG1, "-----------Exception while setting update channel preference " + ex);
    }
};

/**
 * Sets the user info.
 *
 */
ZmZimbraMail.prototype.setUserInfo = function() {

	if (appCtxt.isOffline) {
		return;
	}

	// username
	var login = appCtxt.getLoggedInUsername();
	var username = (appCtxt.get(ZmSetting.DISPLAY_NAME)) || login;
	if (username) {
		var el = this._userNameField.getHtmlElement();
        el.innerHTML =  AjxStringUtil.htmlEncode(AjxStringUtil.clipByLength(username, 24));
		el.setAttribute('aria-label', username);
		if (AjxEnv.isLinux) {	// bug fix #3355
			el.style.lineHeight = "13px";
		}
	}

    this.setQuotaInfo(login, username);
};

ZmZimbraMail.prototype.setQuotaInfo = function(login, username) {

    var quota = appCtxt.get(ZmSetting.QUOTA);
	var usedQuota = (appCtxt.get(ZmSetting.QUOTA_USED)) || 0;
	var data = {
		id: this._usedQuotaField._htmlElId,
		login: login,
		username: username,
		quota: quota,
		usedQuota: usedQuota,
		size: (AjxUtil.formatSize(usedQuota, false, 1))
	};

	var quotaTemplateId;
	if (data.quota) {
		quotaTemplateId = 'UsedLimited';
		data.limit = AjxUtil.formatSize(data.quota, false, 1);
		data.percent = Math.min(Math.round((data.usedQuota / data.quota) * 100), 100);
		data.desc = AjxMessageFormat.format(ZmMsg.usingDescLimited, [data.size, '(' + data.percent + '%)', data.limit]);
	}
    else {
		data.desc = AjxMessageFormat.format(ZmMsg.usingDescUnlimited, [data.size]);
		quotaTemplateId = 'UsedUnlimited';
	}

	var el = this._usedQuotaField.getHtmlElement();
    el.innerHTML = AjxTemplate.expand('share.Quota#' + quotaTemplateId, data);
	el.setAttribute('aria-label', data.desc);

	// tooltip for username/quota fields
	var html = AjxTemplate.expand('share.Quota#Tooltip', data);
	this._components[ZmAppViewMgr.C_USER_INFO].setToolTipContent(html);
	this._components[ZmAppViewMgr.C_QUOTA_INFO].setToolTipContent(html);
};

/**
 * If a user has been prompted and elects to stay on page, this timer automatically logs them off after an interval of time.
 * @param startTimer {boolean} true to start timer, false to cancel
 */
ZmZimbraMail.setExitTimer = 
function(startTimer) {
	if (startTimer && ZmZimbraMail.stayOnPagePrompt) {
		DBG.println(AjxDebug.DBG1, "user has clicked stay on page. scheduled exit timer at " + new Date().toLocaleString());
		if (ZmZimbraMail._exitTimerId == -1) {
			ZmZimbraMail._exitTimerId = AjxTimedAction.scheduleAction(ZmZimbraMail._exitTimer, ZmZimbraMail.STAYONPAGE_INTERVAL * 60 * 1000); //give user 2 minutes
			if (AjxEnv.isFirefox) {
				var msg = AjxMessageFormat.format(ZmMsg.appExitPrompt, [ZmZimbraMail.STAYONPAGE_INTERVAL]);
				var msgDialog = appCtxt.getMsgDialog();
				msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE); //Firefox 4+ doesn't allow custom stay on page message. Prompt user they have X minutes
				//wait 2 seconds before popping up  so FF doesn't show dialog when leave page is clicked
				setTimeout(function() { msgDialog.popup()}, 1000 * 2);
			}
		}

	}
	else if (!startTimer && ZmZimbraMail._exitTimerId) {
		DBG.println(AjxDebug.DBG1, "canceling exit timer at " + new Date().toLocaleString());
		AjxTimedAction.cancelAction(ZmZimbraMail._exitTimerId);
		ZmZimbraMail._exitTimerId = -1;
	}
	
};

// Listeners

/**
 * Logs off the application.
 * 
 */
ZmZimbraMail.logOff =
function(ev, relogin) {
	if (appCtxt.isChildWindow) {
		window.close();
		return;
	}
	if (appCtxt.isWebClientOfflineSupported && (ev || relogin)) {
		return ZmOffline.handleLogOff(ev, relogin);
    }

	ZmZimbraMail._isLogOff = true;

	// bug fix #36791 - reset the systray icon when returning to Account Setup
	if (appCtxt.isOffline && AjxEnv.isWindows &&
		appCtxt.get(ZmSetting.OFFLINE_SUPPORTS_DOCK_UPDATE))
	{
		window.platform.icon().imageSpec = "resource://webapp/icons/default/launcher.ico";
		window.platform.icon().title = null;
	}
    var urlParams = {
                path:appContextPath,
                qsArgs: {
                        loginOp: relogin ? 'relogin' : 'logout'
                    }
                };
	if (relogin) {
		urlParams.qsArgs.username = appCtxt.getLoggedInUsername();
	}
    if(appCtxt.isExternalAccount()) {
        var vAcctDomain = appCtxt.getUserDomain();
        urlParams.qsArgs.virtualacctdomain = vAcctDomain ? vAcctDomain : "";
    }
	var url = AjxUtil.formatUrl(urlParams);
	ZmZimbraMail.sendRedirect(url);	// will trigger onbeforeunload
	if (AjxEnv.isFirefox) {
		DBG.println(AjxDebug.DBG1, "calling setExitTimer from logoff "  + new Date().toLocaleString());
		ZmZimbraMail.setExitTimer(true);	
	}
	

};

/**
 * Logs user off when session has expired and user has choosen to stay on page when prompted
 */
ZmZimbraMail.exitSession =
function() {
	DBG.println(AjxDebug.DBG1, "exit timer called  " + new Date().toLocaleString());
	ZmZimbraMail.logOff();
};

ZmZimbraMail.executeSessionTimer = 
function() {
	ZmZimbraMail.sessionTimerInvoked = true;
	DBG.println(AjxDebug.DBG1, "session timer invoked  " + new Date().toLocaleString());
	ZmZimbraMail.logOff();
};


/**
 * Return the confirmExitMethod that can be used for window.onbeforeunload
 *
 */
ZmZimbraMail.getConfirmExitMethod =
function(){
    return this._confirmExitMethod;
}


/**
 * @private
 */
ZmZimbraMail._onClickLogOff =
function() {
	if (AjxEnv.isIE) {
		// Don't the the default <a> handler process the event. It can bring up
		// an unwanted "Are you sure you want to exit?" dialog.
		var ev = DwtUiEvent.getEvent();
		ev.returnValue = false;
	}
	ZmZimbraMail.logOff();
};

/**
 * @private
 */
ZmZimbraMail.adminLinkCallback =
function(url) {
	ZmZimbraMail.unloadHackCallback();
	var ac = window.parentAppCtxt || window.appCtxt;
	window.open(url);
};

/**
 * @private
 */
ZmZimbraMail.standardHtmlLinkCallback =
function() {
	var urlParams = {
		path: appContextPath,
		qsArgs: {
			client: "standard"
		}
	};
	var url = AjxUtil.formatUrl(urlParams);
	ZmZimbraMail.sendRedirect(url);	// will trigger onbeforeunload
};

/**
 * @private
 */
ZmZimbraMail.helpLinkCallback =
function(helpurl) {
	ZmZimbraMail.unloadHackCallback();

	var ac = window.parentAppCtxt || window.appCtxt;
	var url;
	if (!ac.isOffline) {
		try { url = helpurl || skin.hints.helpButton.url; } catch (e) { /* ignore */ }
		url = url || ac.get(ZmSetting.HELP_URI);
		var sep = url.match(/\?/) ? "&" : "?";
		url = [url, sep, "locid=", AjxEnv.DEFAULT_LOCALE].join("");
	} else {
		url = ac.get(ZmSetting.HELP_URI).replace(/\/$/,"");
		// bug fix #35098 - offline help is only available in en_US for now
		url = [url, "help", "en_US", "Zimbra_Mail_Help.htm"].join("/");
//		url = [url, "help", AjxEnv.DEFAULT_LOCALE, "Zimbra_Mail_Help.htm"].join("/");
	}
	window.open(url);
};

/**
 * Sends a redirect.
 * 
 * @param	{String}	locationStr		the redirect location
 */
ZmZimbraMail.sendRedirect =
function(locationStr) {
	// not sure why IE doesn't allow this to process immediately, but since
	// it does not, we'll set up a timed action.
	if (AjxEnv.isIE) {
		var act = new AjxTimedAction(null, ZmZimbraMail.redir, [locationStr]);
		AjxTimedAction.scheduleAction(act, 1);
	} else {
		ZmZimbraMail.redir(locationStr);
	}
};

/**
 * Redirect.
 * 
 * @param	{String}	locationStr		the redirect location
 */
ZmZimbraMail.redir =
function(locationStr){
	// IE has a tendency to throw a mysterious error when the "are you sure" dialog pops up and the user presses "cancel".
	// Pressing cancel, however, equals doing nothing, so we can just catch the exception and ignore it (bug #59853)
	try {
		window.location = locationStr;
	} catch (e) {
	}
};

/**
 * Sets the session timer.
 * 
 * @param	{Boolean}	bStartTimer		if <code>true</code>, start the timer
 */
ZmZimbraMail.prototype.setSessionTimer =
function(bStartTimer) {

	// if no timeout value, user's client never times out from inactivity
	var timeout = appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT) * 1000;
	if (timeout <= 0) {
		return;
	}

	if (bStartTimer) {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER SET (" + (new Date()).toLocaleString() + ")");
		this._sessionTimerId = AjxTimedAction.scheduleAction(this._sessionTimer, timeout);

		DwtEventManager.addListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		this._shell.setHandler(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		if (document.attachEvent)  {
			document.attachEvent("onkeydown", ZmZimbraMail._userEventHdlr);
		}
		window.onkeydown = ZmZimbraMail._userEventHdlr;		
	}
	else {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER CANCELED (" + (new Date()).toLocaleString() + ")");

		AjxTimedAction.cancelAction(this._sessionTimerId);
		this._sessionTimerId = -1;

		DwtEventManager.removeListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		this._shell.clearHandler(DwtEvent.ONMOUSEUP);
		if (document.detachEvent) {
			document.detachEvent("onkeydown", ZmZimbraMail._userEventHdlr);
		}	
		window.onkeydown = null;
	}
};

/**
 * Adds a child window.
 * 
 * @private
 */
ZmZimbraMail.prototype.addChildWindow =
function(childWin, childId) {
	if (this._childWinList == null) {
		this._childWinList = new AjxVector();
	}

	// NOTE: we now save childWin w/in Object so other params can be added to it.
	// Otherwise, Safari breaks (see http://bugs.webkit.org/show_bug.cgi?id=7162)
	var newWinObj = {win:childWin,childId:childId};
	this._childWinList.add(newWinObj);

	return newWinObj;
};

/**
 * Gets a child window.
 * 
 * @private
 */
ZmZimbraMail.prototype.getChildWindow =
function(childWin) {
	var list = this._childWinList;
	if (list && childWin) {
		for (var i = 0; i < list.size(); i++) {
			var winObj = list.get(i);
			if (childWin === winObj.win || childWin.childId === winObj.childId) {
				return winObj;
			}
		}
	}
	return null;
};

/**
 * Removes a child window.
 * 
 * @private
 */
ZmZimbraMail.prototype.removeChildWindow =
function(childWin) {
	var list = this._childWinList;
	if (list) {
		for (var i = 0; i < list.size(); i++) {
			var winObj = list.get(i);
			if (childWin == winObj.win) {
				// Bug 84426: We don't want our old window metadata to go away; if it's merely a refresh
				// we want access to the parameters of our old window, so clear the actual window object,
				// and leave the other parameters in winObj intact
				winObj.win = null;
				break;
			}
		}
	}
};

/**
 * Checks for a certain type of exception, then hands off to standard
 * exception handler.
 *
 * @param {AjxException}	ex				the exception
 * @param {Object}	continuation		the original request params
 * 
 * @private
 */
ZmZimbraMail.prototype._handleException =
function(ex, continuation) {
	var handled = false;
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
		// check for fault when getting folder perms
		var organizerTypes = [ZmOrganizer.CALENDAR, ZmOrganizer.ADDRBOOK];
		if (ex.data.itemId && ex.data.itemId.length) {
			var itemId = ex.data.itemId[0];
			var index = itemId.lastIndexOf(':');
			var zid = itemId.substring(0, index);
			var rid = itemId.substring(index + 1, itemId.length);
			var ft = appCtxt.getFolderTree();
			for (var type = 0; type < organizerTypes.length; type++) {
				handled |= ft.handleNoSuchFolderError(organizerTypes[type], zid, rid, true);
			}
		}
	}
    else if (appCtxt.isWebClientOffline() && ex.code === ZmCsfeException.EMPTY_RESPONSE) {
        handled = true;
    }
	if (!handled) {
		ZmController.prototype._handleException.apply(this, arguments);
	}
};

/**
 * This method is called by the window.onbeforeunload handler
 * 
 * @private
 */
ZmZimbraMail._confirmExitMethod =
function() {

	if (!ZmCsfeCommand.noAuth) {
		appCtxt.accountList.saveImplicitPrefs();

		if (appCtxt.get(ZmSetting.WARN_ON_EXIT) && !ZmZimbraMail._isOkToExit()) {
			if (ZmZimbraMail.stayOnPagePrompt) {
				DBG.println(AjxDebug.DBG1, "user has already been prompted. Forcing exit " + new Date().toLocaleString());
				return;
			}
			
			ZmZimbraMail._isLogOff = false;
			DBG.println(AjxDebug.DBG1, "prompting to user to stay on page or leave " + new Date().toLocaleString());
			var msg = (appCtxt.isOffline) ? ZmMsg.appExitWarningZD : ZmMsg.appExitWarning;
			
			if (ZmZimbraMail.sessionTimerInvoked) {
				ZmZimbraMail.stayOnPagePrompt = true;
				msg = AjxMessageFormat.format(msg + ZmMsg.appExitTimeWarning, [ZmZimbraMail.STAYONPAGE_INTERVAL]); //append time warning
			}
			if (!AjxEnv.isFirefox) {
				DBG.println(AjxDebug.DBG1, "calling setExitTimer  "  + new Date().toLocaleString());
				ZmZimbraMail.setExitTimer(true);
			}
			return msg;
			
		}

		ZmZimbraMail._endSession();
	}
    if (window.ZmDesktopAlert) {
        ZmDesktopAlert.closeNotification();
    }
	ZmZimbraMail._endSessionDone = true;
};

/**
 * Returns true if there is no unsaved work. If that's the case, it also
 * cancels any pending poll. Typically called by onbeforeunload handling.
 * 
 * @private
 */
ZmZimbraMail._isOkToExit =
function() {
	var appCtlr = window._zimbraMail;
	if (!appCtlr) { return true; }
	var okToExit = appCtlr._appViewMgr.isOkToUnload() && ZmZimbraMail._childWindowsOkToUnload();
	if (okToExit && !AjxEnv.isPrism && appCtlr._pollRequest) {
		appCtlr._requestMgr.cancelRequest(appCtlr._pollRequest);
	}
	return okToExit;
};

// returns true if no child windows are dirty
ZmZimbraMail._childWindowsOkToUnload =
function() {
	var childWinList = window._zimbraMail ? window._zimbraMail._childWinList : null;
	if (childWinList) {
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			if (childWin.win && childWin.win.ZmNewWindow && childWin.win.ZmNewWindow._confirmExitMethod()) {
				return false;
			}
		}
	}
	return true;
};

ZmZimbraMail.handleNetworkStatusClick =
function() {
	var ac = window["appCtxt"].getAppController();

	// if already offline, then ignore this click
	if (!ac._isPrismOnline) { return; }

	ac._isUserOnline = !ac._isUserOnline;
	ac._updateNetworkStatus(ac._isUserOnline);
};

/**
 * @private
 */
ZmZimbraMail.unloadHackCallback =
function() {
	window.onbeforeunload = null;
	var f = function() { window.onbeforeunload = ZmZimbraMail._confirmExitMethod; };
	AjxTimedAction.scheduleAction((new AjxTimedAction(null, f)), 3000);
};

/**
 * @private
 */
ZmZimbraMail._userEventHdlr =
function(ev) {
	var zm = window._zimbraMail;
	if (zm) {
		// cancel old timer and start a new one
		AjxTimedAction.cancelAction(zm._sessionTimerId);
		var timeout = appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT) * 1000;
		if (timeout <= 0) {
			return;
		}
		zm._sessionTimerId = AjxTimedAction.scheduleAction(zm._sessionTimer, timeout);
	}
	DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER RESET (" + (new Date()).toLocaleString() + ")");
};

/**
 * @private
 */
ZmZimbraMail.prototype._createBanner =
function() {
	var banner = new DwtComposite({parent:this._shell, posStyle:Dwt.ABSOLUTE_STYLE, id:ZmId.BANNER});
	var logoUrl = appCtxt.getSkinHint("banner", "url") || appCtxt.get(ZmSetting.LOGO_URI);
	var data = {url:logoUrl, isOffline:appCtxt.isOffline};
	banner.getHtmlElement().innerHTML  = AjxTemplate.expand('share.App#Banner', data);
	banner.getHtmlElement().style.height = '100%';
	return banner;
};

/**
 * @private
 */
ZmZimbraMail.prototype._createUserInfo =
function(className, cid, id) {

	var position = appCtxt.getSkinHint(cid, "position");
	var posStyle = position || Dwt.ABSOLUTE_STYLE;
	var ui = new DwtComposite({
		parent:         this._shell,
		className:      className,
		posStyle:       posStyle,
		id:             id,
		isFocusable:    true
	});
	ui._setMouseEventHdlrs();
	return ui;
};

/**
 * @private
 */
ZmZimbraMail.prototype._createAppChooser =
function() {

	var buttons = [];
	for (var id in ZmApp.CHOOSER_SORT) {
		if (id == ZmAppChooser.OPTIONS || id == ZmAppChooser.SPACER || id == ZmAppChooser.B_HELP || id == ZmAppChooser.B_LOGOUT) {
			continue;
		}

		if (this._isInternalApp(id) || this._isIframeApp(id)) {
			buttons.push(id);
		}
	}
	buttons.sort(function(a, b) {
		return ZmZimbraMail.hashSortCompare(ZmApp.CHOOSER_SORT, a, b);
	});

	var appChooser = new ZmAppChooser({parent:this._shell, buttons:buttons, id:ZmId.APP_CHOOSER, refElementId:ZmId.SKIN_APP_CHOOSER});

	var buttonListener = new AjxListener(this, this._appButtonListener);
	appChooser.addSelectionListener(buttonListener);

	return appChooser;
};

/**
 * @private
 */
ZmZimbraMail.prototype._appButtonListener =
function(ev) {
	try {
		var id = ev.item.getData(Dwt.KEY_ID);
		DBG.println(AjxDebug.DBG1, "ZmZimbraMail button press: " + id);
		if (id == ZmAppChooser.B_HELP) {
			window.open(appCtxt.get(ZmSetting.HELP_URI));
		} else if (id == ZmAppChooser.B_LOGOUT) {
			ZmZimbraMail.logOff();
		} else if (id && ZmApp.ENABLED_APPS[id] && (id != this._activeTabId)) {
			var isCloseButton = (DwtUiEvent.getTargetWithProp(ev, "id") == ev.item._getIconEl(DwtLabel.RIGHT));
			if (isCloseButton) {
				this._appViewMgr.popView(false, id);
			}
			else {
				this.activateApp(id);
				if (appCtxt.zimletsPresent()) {
					appCtxt.getZimletMgr().notifyZimlets("onSelectApp", id);
				}
			}
		} else {
			var isCloseButton = (DwtUiEvent.getTargetWithProp(ev, "id") == ev.item._getIconEl(DwtLabel.RIGHT));
			if (isCloseButton) {
				this._appViewMgr.popView(false, id);
			}
			else if (id != this._activeTabId) {
				this._appViewMgr.pushView(id);
			}
		}
	} catch (ex) {
		this._handleException(ex);
	}
};

/**
 * Gets the application chooser.
 * 
 * @return	{ZmAppChooser}	the chooser
 */
ZmZimbraMail.prototype.getAppChooser =
function() {
	return this._appChooser;
};

/**
 * Sets the active tab.
 * 
 * @param	{String}	id		the tab id
 */
ZmZimbraMail.prototype.setActiveTabId =
function(id) {
	this._activeTabId = id;
	this._appChooser.setSelected(id);
};

/**
 * Displays a status message.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param {String}	params.msg		the message
 * @param {constant}	[params.level] ZmStatusView.LEVEL_INFO, ZmStatusView.LEVEL_WARNING, or ZmStatusView.LEVEL_CRITICAL
 * @param {constant}	[params.detail] 	the details
 * @param {constant}	[params.transitions]		the transitions
 * @param {constant}	[params.toast]		the toast control 
 * @param {boolean}     [force]        force any displayed toasts out of the way (dismiss them and run their dismissCallback). Enqueued messages that are not yet displayed will not be displayed
 * @param {AjxCallback}    [dismissCallback]    callback to run when the toast is dismissed (by another message using [force], or explicitly calling ZmStatusView.prototype.dismiss())
 * @param {AjxCallback}    [finishCallback]     callback to run when the toast finishes its transitions by itself (not when dismissed)
 */
ZmZimbraMail.prototype.setStatusMsg =
function(params) {
	params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
	this.statusView.setStatusMsg(params);
};

/**
 * Dismisses the displayed status message, if any
 */

ZmZimbraMail.prototype.dismissStatusMsg =
function(all) {
	this.statusView.dismissStatusMsg(all);
};

/**
 * Gets the key map name.
 * 
 * @return	{String}	the key map name
 */
ZmZimbraMail.prototype.getKeyMapName =
function() {
	var ctlr = appCtxt.getCurrentController();
	if (ctlr && ctlr.getKeyMapName) {
		return ctlr.getKeyMapName();
	}
	return ZmKeyMap.MAP_GLOBAL;
};

/**
 * Handles the key action.
 * 
 * @param	{constant}		actionCode		the action code
 * @param	{Object}	    ev		        the event
 */
ZmZimbraMail.prototype.handleKeyAction = function(actionCode, ev) {

    DwtMenu.closeActiveMenu();

	var app = ZmApp.GOTO_ACTION_CODE_R[actionCode];
	if (app) {
		if (app == this.getActiveApp()) {
            return false;
        }
		if (appCtxt.isWebClientOffline() && !AjxUtil.arrayContains(ZmOffline.SUPPORTED_APPS, app)) {
			return false;
		}
		this.activateApp(app);
		return true;
	}

	switch (actionCode) {

		case ZmKeyMap.QUICK_REMINDER: {
            var account = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
            // calMgr.showQuickReminder uses an entire alternate search mechanism from ZmApptCache - setting params,
            // sending a search, etc.  Suppress for offline - lots of work for little gain to adapt this to offline modek
            if (appCtxt.get(ZmSetting.CALENDAR_ENABLED, null, account) && !appCtxt.isWebClientOffline()) {
                var calMgr = appCtxt.getCalManager();
                calMgr.showQuickReminder();
            }
			break;
		}

		case ZmKeyMap.FOCUS_SEARCH_BOX: {
			var stb = appCtxt.getSearchController().getSearchToolbar();
			if (stb) {
				var searchBox = stb.getSearchField();
				appCtxt.getKeyboardMgr().grabFocus(searchBox);
				if (ZmSearchAutocomplete) {
					ZmSearchAutocomplete._ignoreNextKey = true;
				}
			}
			break;
		}

		case ZmKeyMap.FOCUS_CONTENT_PANE: {
			this.focusContentPane();
			break;
		}

		case ZmKeyMap.FOCUS_TOOLBAR: {
			this.focusToolbar();
			break;
		}

		case ZmKeyMap.SHORTCUTS: {
			this._showCurrentShortcuts();
			break;
		}

		// this action needs to be last
		case ZmKeyMap.CANCEL: {
			// see if there's a current drag operation we can cancel
			var handled = false;
			var captureObj = (DwtMouseEventCapture.getId() == "DwtControl") ? DwtMouseEventCapture.getCaptureObj() : null;
			var obj = captureObj && captureObj.targetObj;
			if (obj && (obj._dragging == DwtControl._DRAGGING)) {
				captureObj.release();
				obj.__lastDestDwtObj = null;
				obj._setDragProxyState(false);					// turn dnd icon red so user knows no drop is happening
				DwtControl.__badDrop(obj, DwtShell.mouseEvent);	// shell's mouse ev should have latest info
				handled = true;
			}
			if (handled) { break; }
		}

		default: {
            // Hand shortcut to current controller
			var ctlr = appCtxt.getCurrentController();
			return ctlr && ctlr.handleKeyAction ? ctlr.handleKeyAction(actionCode, ev) : false;
		}
	}

	return true;
};

/**
 * Focuses on the content pane.
 * 
 */
ZmZimbraMail.prototype.focusContentPane =
function() {
	// Set focus to the list view that's in the content pane. If there is no
	// list view in the content pane, nothing happens. The list view will be
	// found in the root tab group hierarchy.
	var ctlr = appCtxt.getCurrentController();
	var content = ctlr && ctlr._getDefaultFocusItem();
	if (content) {
		appCtxt.getKeyboardMgr().grabFocus(content);
	}
};

/**
 * Focuses on the toolbar.
 * 
 */
ZmZimbraMail.prototype.focusToolbar =
function() {
	// Set focus to the toolbar that's in the content pane.
	var ctlr = appCtxt.getCurrentController();
	var toolbar = ctlr && ctlr.getCurrentToolbar && ctlr.getCurrentToolbar();
	if (toolbar) {
		appCtxt.getKeyboardMgr().grabFocus(toolbar);
	}
};

/**
 * Creates an "iframe view", which is a placeholder view for an app that's not
 * enabled but which has a tab. The app will have
 * a URL for its external content, which we put into an IFRAME.
 *
 * @param {constant}	appName	the name of app
 * 
 * @private
 */
ZmZimbraMail.prototype._createAppIframeView =
function(appName) {

	var viewName = [appName, "iframe"].join("_"),
		isSocial = (appName === ZmApp.SOCIAL),
		params = { appName: appName },
		appIframeView = this._appIframeView[appName];

	if (!appIframeView) {
		appIframeView = this._appIframeView[appName] = isSocial ? new ZmCommunityView(params) : new ZmAppIframeView(params);

		var elements = {}, callbacks = {};
		elements[ZmAppViewMgr.C_APP_CONTENT] = appIframeView;
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = this._displayAppIframeView.bind(this);

		var hide = [ ZmAppViewMgr.C_TREE, ZmAppViewMgr.C_TREE_FOOTER, ZmAppViewMgr.C_TOOLBAR_TOP,
			ZmAppViewMgr.C_NEW_BUTTON, ZmAppViewMgr.C_SASH ];

		this._appViewMgr.createView({	viewId:			viewName,
										appName:		appName,
										controller:		this,
										elements:		elements,
										hide:			hide,
										isTransient:	true,
										isFullScreen:	true,
										callbacks:		callbacks});
	}

	this._appViewMgr.pushView(viewName);
	appIframeView.activate(true);
};

ZmZimbraMail.prototype._displayAppIframeView =
function(appName) {
	appCtxt.getApp(this._getDefaultStartAppName()).setOverviewPanelContent(false);
};

/**
 * Sets up Zimlet organizer type. This is run if we get zimlets in the
 * GetInfoResponse. Note that this will run before apps are instantiated,
 * which is necessary because they depend on knowing whether there are zimlets.
 * 
 * @private
 */
ZmZimbraMail.prototype._postLoadZimlet =
function() {
	appCtxt.setZimletsPresent(true);
};

/**
 * @private
 */
ZmZimbraMail.prototype._globalSelectionListener =
function(ev) {
	// bug 47514
	if (this._waitDisallowed) {
		this._waitDisallowed = false;
		this.setInstantNotify(true);
	}

	if (!appCtxt.areZimletsLoaded()) { return; }

	var item = ev.item;

	// normalize action
	var text = (item && item.getText) ? (item.getText() || item._toggleText) : null;
	if (item && !text) {
		text = item.getData(ZmOperation.KEY_ID) || item.getData(Dwt.KEY_ID);
	}
	if (text) {
		var type;
		if (item instanceof ZmAppButton) {
			type = "app";
		} else if (item instanceof DwtMenuItem) {
			type = "menuitem";
		} else if (item instanceof DwtButton) {
			type = "button";
		} else if (item instanceof DwtTreeItem) {
			if (!item.getSelected()) { return; }
			type = "treeitem";
		} else {
			type = item.toString();
		}

		var avm = appCtxt.getAppViewMgr();
		var currentViewId = avm.getCurrentViewId();
		var lastViewId = avm.getLastViewId();
		var action = (AjxStringUtil.split((""+text), " ")).join("");
		appCtxt.notifyZimlets("onAction", [type, action, currentViewId, lastViewId]);
	}
};

ZmZimbraMail._folderTreeSashRelease =
function(sash) {
	var currentWidth = skin.getTreeWidth();
	if (currentWidth) {
		appCtxt.set(ZmSetting.FOLDER_TREE_SASH_WIDTH, currentWidth);
	}
};

/**
 * @private
 */
ZmZimbraMail._endSession =
function() {
	if (!AjxEnv.isPrism && navigator.onLine) {
		// Let the server know that the session is ending.
		var args = {
			jsonObj: { EndSessionRequest: { _jsns: "urn:zimbraAccount" } },
			asyncMode: !appCtxt.get("FORCE_CLEAR_COOKIES"),
			emptyResponseOkay:	true
		};
        var controller = appCtxt.getAppController();
		controller && controller.sendRequest(args);
	}
};

ZmZimbraMail.prototype.notify =
function(eventType) {
	this._evtMgr.notifyListeners(eventType, this._evt);
};

ZmZimbraMail.prototype._showCurrentShortcuts = function() {

	var panel = appCtxt.getShortcutsPanel();
	var curMap = this.getKeyMapName();
	var km = appCtxt.getAppController().getKeyMapMgr();
	var maps = km.getAncestors(curMap);
	var inherits = (maps && maps.length > 0);
	maps.unshift(curMap);
	var maps2 = [];
	if (inherits) {
		if (maps.length > 1 && maps[maps.length - 1] == ZmKeyMap.MAP_GLOBAL) {
			maps.pop();
			maps2.push(ZmKeyMap.MAP_GLOBAL);
		}
	}

	var col1 = {}, col2 = {};
	col1.type = ZmShortcutList.TYPE_APP;
	col1.maps = maps;
	var colList = [col1];
	if (maps2.length) {
		col2.type = ZmShortcutList.TYPE_APP;
		col2.maps = maps2;
		colList.push(col2);
	}
	var col3 = {};
	col3.type = ZmShortcutList.TYPE_SYS;
	col3.maps = [];
	var ctlr = appCtxt.getCurrentController();
	var testMaps = ["list", "editor", "tabView"];
	for (var i = 0; i < testMaps.length; i++) {
		if (ctlr && ctlr.mapSupported(testMaps[i])) {
			col3.maps.push(testMaps[i]);
		}
	}
	col3.maps.push("button", "menu", "tree", "dialog", "toolbarHorizontal");
	colList.push(col3);
	panel.popup(colList);
}

// YUCK:
ZmOrganizer.ZIMLET = "ZIMLET";


/**
 * Sets global zimlet drop button
 */
ZmZimbraMail.prototype._setZimletsButton = function () {
	var containerEl = document.getElementById("skin_container_zimlets");
	if (!containerEl) {
		return;
	}
	var button = new DwtToolBarButton({ parent: DwtShell.getShell(window) });
	button.setImage("Apps");
	button.reparentHtmlElement(containerEl);
	button.setEnabled(false);
	appCtxt.addZimletsLoadedListener(new AjxListener(this, this._handleAllZimletsLoaded, button));
};

/**
 * Callback that will executed when all zimlets are loaded
 */
ZmZimbraMail.prototype._handleAllZimletsLoaded = function (zimletsButton, event, data) {
	var zimletManager = appCtxt.getZimletMgr && appCtxt.getZimletMgr();
	if (!zimletManager) {
		return;
	}
	var zimlets = zimletManager.getPanelZimlets && zimletManager.getPanelZimlets();
	if (!zimlets) {
		return;
	}
	//zimlet's list menu
	var menu = new ZmPopupMenu({ parent: zimletsButton });
	var menuItem;
	zimlets.forEach(function (item) {
		zimletPanelItem = item.zimletPanelItem;
		menuItem = new DwtMenuItem({ parent: menu });
		if (zimletPanelItem && zimletPanelItem.label) {
			menuItem.setText(item.process(zimletPanelItem.label));
		}
		if (zimletPanelItem && zimletPanelItem.toolTipText) {
			menuItem.setToolTipContent(item.process(zimletPanelItem.toolTipText));
		}
		if (zimletPanelItem && zimletPanelItem.icon) {
			menuItem.setImage(zimletPanelItem.icon);
		}
		// TODO: Need to figure out if we really need 'selectionListener' method
		// As all zimlet by default get "preference" action in context menu which does the same job as onClick of menuItem
		menuItem.addSelectionListener(new AjxListener(this, this._zimletMenuItemClicked,item));
		//Create zimlet's submenu
		var menuItems = zimletPanelItem && zimletPanelItem.contextMenu && zimletPanelItem.contextMenu.menuItem;
		if (menuItem) {
			var params = {
				parent: menuItem,
				context: item,
				menuItems: menuItems
			}
			var subMenu = this._makeZimletSubMenu(params);
			menuItem.setMenu(subMenu);
		}
	}.bind(this));
	if (zimlets.length) {
		menu.createSeparator();
	}
	menuItem = new DwtMenuItem({ parent: menu, className: "ZAddNewMenuItem" });
	menuItem.setText("Zimlets");
	menuItem.setImage("Plus");
	var appLoadCallback = new AjxCallback(this, this.__gotoZimletPrefSection);
	menuItem.addSelectionListener(new AjxListener(this, this.activateApp,[ZmApp.PREFERENCES, false, appLoadCallback]));
	zimletsButton.setMenu(menu);
	zimletsButton.setEnabled(true);
}

/**
 * Zimlet menu item click listener
 */
ZmZimbraMail.prototype._zimletMenuItemClicked = function (zimletContext, event) {
	zimletContext.callHandler("_dispatch", ["singleClicked"]);
};

/**
 * Make zimlet's submenu
 * ref: ZmZimletContext.prototype._makeMenu
 */
ZmZimbraMail.prototype._makeZimletSubMenu = function (params) {
	var menuItems = params.menuItems;
	var context = params.context;
	var menu = new ZmPopupMenu({ parent: params.parent, menuItems: ZmOperation.NONE });
	for (var i = 0; i < menuItems.length; ++i) {
		var data = menuItems[i];
		if (!data.id) {
			menu.createSeparator();
		} else {
			var params = { image: data.icon, text: context.process(data.label), disImage: data.disabledIcon };
			var item = menu.createMenuItem(data.id, params);
			item.setData("xmlMenuItem", data);
			item.addSelectionListener(context._handleMenuItemSelected);
			if (data.menuItem) {
				item.setMenu(this._makeZimletSubMenu(data.menuItem));
			}
		}
	}
	return menu;
};

/**
 * Go to Zimlets section in preferences
 */
ZmZimbraMail.prototype.__gotoZimletPrefSection = function() {
	var view = appCtxt.getCurrentView();
	if(view instanceof ZmPrefView) {
		view.selectSection("PREF_ZIMLETS");
	}
};