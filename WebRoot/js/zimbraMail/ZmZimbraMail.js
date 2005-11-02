/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a controller to run ZimbraMail. Do not call directly, instead use the run()
* factory method.
* @constructor
* @class
* This class is the "ubercontroller", as it manages all the apps as well as bootstrapping
* the ZimbraMail application.
*
* @param appCtxt		the app context (global storage)
* @param domain			current domain
* @param app			starting app
*/
function ZmZimbraMail(appCtxt, domain, app, userShell) {

	ZmController.call(this, appCtxt);

	this._userShell = userShell;

	// settings structure and defaults
	this._settings = appCtxt.getSettings();
	DBG.println(AjxDebug.DBG1, "Branch: " + appCtxt.get(ZmSetting.BRANCH));
	this._settings.addChangeListener(new AjxListener(this, this._settingsChangeListener));

	ZmCsfeCommand.setServerUri(location.protocol + "//" + domain + appCtxt.get(ZmSetting.CSFE_SERVER_URI));

	appCtxt.setAppController(this);
	appCtxt.setClientCmdHdlr(new ZmClientCmdHandler(appCtxt));

	this._shell = appCtxt.getShell();
	this._shell.addListener(DwtEvent.ONKEYPRESS, new AjxListener(this, this._keyPressListener));
    this._splashScreen = new ZmSplashScreen(this._shell, "SplashScreen");
 
	this._apps = {};
	this._activeApp = null;
	
	this._pollActionId = null;
	this._sessionTimer = new AjxTimedAction(null, ZmZimbraMail.logOff);
	this._sessionTimerId = -1;
	this._shell.setBusyDialogText(ZmMsg.askCancel);
	this._pendingRequests = {};

	this._needOverviewLayout = false;
	this._unreadListener = new AjxListener(this, this._unreadChangeListener);	
	this._calendarListener = new AjxListener(this, this._calendarChangeListener);

	this._useXml = this._appCtxt.get(ZmSetting.USE_XML);
	this._logRequest = this._appCtxt.get(ZmSetting.LOG_REQUEST);

	this._schedule(this.startup, {app: app});
};

ZmZimbraMail.prototype = new ZmController;
ZmZimbraMail.prototype.constructor = ZmZimbraMail;

ZmZimbraMail.MAIL_APP			= "mail";
ZmZimbraMail.CONTACTS_APP		= "contacts";
ZmZimbraMail.CALENDAR_APP		= "calendar";
ZmZimbraMail.PREFERENCES_APP	= "options";
ZmZimbraMail.MIXED_APP			= "mixed";

ZmZimbraMail.APP_CLASS = {};
ZmZimbraMail.APP_CLASS[ZmZimbraMail.MAIL_APP]			= ZmMailApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.CONTACTS_APP]		= ZmContactsApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.CALENDAR_APP]		= ZmCalendarApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.PREFERENCES_APP]	= ZmPreferencesApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.MIXED_APP]			= ZmMixedApp;

ZmZimbraMail.MSG_KEY = {};
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MAIL_APP]			= "mail";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CONTACTS_APP]		= "contacts";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CALENDAR_APP]		= "calendar";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.PREFERENCES_APP]	= "options";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MIXED_APP]		= "zimbraTitle";

ZmZimbraMail.APP_ICON = {};
ZmZimbraMail.APP_ICON[ZmZimbraMail.MAIL_APP]		= "MailApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.CONTACTS_APP]	= "ContactsApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.CALENDAR_APP]	= "CalendarApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.PREFERENCES_APP]	= "Preferences";
ZmZimbraMail.APP_ICON[ZmZimbraMail.MIXED_APP]		= "Globe";

ZmZimbraMail.APP_BUTTON = {};
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.MAIL_APP]			= ZmAppChooser.B_EMAIL;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CONTACTS_APP]		= ZmAppChooser.B_CONTACTS;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CALENDAR_APP]		= ZmAppChooser.B_CALENDAR;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.PREFERENCES_APP]	= ZmAppChooser.B_OPTIONS;

ZmZimbraMail.DEFAULT_SEARCH = {};
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MAIL_APP]		= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CONTACTS_APP]	= ZmItem.CONTACT;
//ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmItem.APPT;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MIXED_APP]		= ZmSearchToolBar.FOR_ANY_MI;

ZmZimbraMail.VIEW_TT_KEY = {};
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.MAIL_APP]		= "displayMail";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CONTACTS_APP]	= "displayContacts";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CALENDAR_APP]	= "displayCalendar";

ZmZimbraMail.OVERVIEW_TREES = {};
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MAIL_APP]			= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CONTACTS_APP]		= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CALENDAR_APP]		= [ZmOrganizer.CALENDAR];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.PREFERENCES_APP]	= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MIXED_APP]			= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG];

ZmZimbraMail.defaultStartApp = ZmZimbraMail.MAIL_APP;

ZmZimbraMail._PREFS_ID	= 1;
ZmZimbraMail._HELP_ID	= 2;
ZmZimbraMail._LOGOFF_ID	= 3;

ZmZimbraMail._OVERVIEW_ID = "ZmZimbraMail";

ZmZimbraMail.IGNORE_ERRORS = "_ignore_";

// request states
ZmZimbraMail._SENT		= 1;
ZmZimbraMail._RESPONSE	= 2;
ZmZimbraMail._CANCEL	= 3;

ZmZimbraMail._nextReqId = 1;

ZmZimbraMail.getNextReqId =
function() {
	return "Req_" + ZmZimbraMail._nextReqId++;
};

// Public methods

ZmZimbraMail.prototype.toString = 
function() {
	return "ZmZimbraMail";
};

/**
* Sets up ZimbraMail, and then starts it by calling its constructor. It is assumed that the
* CSFE is on the same host.
*
* @param domain		the host that we're running on
* @param app		starting app
*/
ZmZimbraMail.run =
function(domain, app, userShellId) {

	// Create the global app context
	var appCtxt = new ZmAppCtxt();

	appCtxt.setIsPublicComputer(false);

	// Create the shell
	var settings = appCtxt.getSettings();
	var userShell = window.document.getElementById(settings.get(ZmSetting.SKIN_SHELL_ID));
	var shell = new DwtShell(null, false, ZmZimbraMail._confirmExitMethod, userShell);
    appCtxt.setShell(shell);
    
    appCtxt.setItemCache(new AjxCache());
    
	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new AjxPost());
	
    // Go!
	new ZmZimbraMail(appCtxt, domain, app, userShell);
};

/**
* Allows parent window to walk list of open child windows and either nuke them 
* or "disable" them
*/
ZmZimbraMail.unload = 
function(ev) {
	var childWinList = window._zimbraMail ? window._zimbraMail._childWinList : null;
	if (childWinList) {
		// close all child windows
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			childWin.parentController = null;
			childWin.close();
		}
		
		window._zimbraMail = null;
	}
};

/**
* Loads the app and presents the initial view. First, it gets the user's preferences.
* Next, it launches the start app (which defaults to mail) and shows the results to
* the user. Finally, we load contacts in the background.
*
* @param isRelogin		[boolean]	if true, app is already loaded/started
*/
ZmZimbraMail.prototype.startup =
function(params) {
	if (!(params && params.isRelogin)) {
		if (!this._appViewMgr) {
			this._appViewMgr = new ZmAppViewMgr(this._shell, this, false, true);
		}

		skin.showSkin(true);
		this._components = {};
		this._components[ZmAppViewMgr.C_SASH] = new DwtSash(this._shell, DwtSash.HORIZONTAL_STYLE,
												 				"console_inset_app_l", 20);
		this._components[ZmAppViewMgr.C_BANNER] = this._createBanner();
		this._components[ZmAppViewMgr.C_USER_INFO] = this._createUserInfo();
		var currentAppToolbar = new ZmCurrentAppToolBar(this._shell);
		this._appCtxt.setCurrentAppToolbar(currentAppToolbar);
		this._components[ZmAppViewMgr.C_CURRENT_APP] = currentAppToolbar;
		this._components[ZmAppViewMgr.C_STATUS] = this._statusView = new ZmStatusView(this._shell, "ZmStatus", Dwt.ABSOLUTE_STYLE);

		var respCallback = new AjxCallback(this, this._handleResponseStartup, params);
		this._errorCallback = new AjxCallback(this, this._handleErrorStartup);
		this._settings.loadUserSettings(respCallback, this._errorCallback); // load user prefs and COS data
	} else {
		this._killSplash();
	}
};

ZmZimbraMail.prototype._handleErrorStartup =
function(ex) {
	this._killSplash();
	return false;
};

/*
* Startup: part 2
* Creates components which have dependencies on the settings, including the overview.
*
* @param settings	[Object]		hash of overrides of user settings
* @param app		[constant]		starting app
*/
ZmZimbraMail.prototype._handleResponseStartup =
function(params) {
	if (params && params.settings) {
		this._needOverviewLayout = true;
		for (var id in params.settings)
			this._settings.getSetting(id).setValue(params.settings[id]);
	}

	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		this.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();

	this.setPollInterval();
	var opc = this._appCtxt.getOverviewController();
	opc.createOverview({overviewId: ZmZimbraMail._OVERVIEW_ID, parent: this._shell, posStyle: Dwt.ABSOLUTE_STYLE,
						selectionSupported: true, actionSupported: true, dndSupported: true, showUnread: true});
	this._setUserInfo();
	this._checkOverviewLayout();

	if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED))
		this._components[ZmAppViewMgr.C_SEARCH] = this._appCtxt.getSearchController().getSearchPanel();
	this._components[ZmAppViewMgr.C_APP_CHOOSER] = this._createAppChooser();
	this._appViewMgr.addComponents(this._components, true);

	this._calController = this.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();		

	// reset the user's time zone (save to prefs) if it has changed
	var respCallback = new AjxCallback(this, this._handleResponseStartup1, [params]);
	ZmTimezones.initializeServerTimezone(respCallback);
};

/*
* Startup: part 3
* Launches the starting application.
*
* @param app		[constant]		starting app
*/
ZmZimbraMail.prototype._handleResponseStartup1 =
function(args) {
	var params = args[0];
	var respCallback = new AjxCallback(this, this._handleResponseStartup2);
	var startApp = (params && params.app) ? params.app : ZmZimbraMail.defaultStartApp;
	this.activateApp(startApp, respCallback, this._errorCallback);
	this.setStatusMsg(ZmMsg.initializationComplete, null, null, null, ZmStatusView.TRANSITION_INVISIBLE);
};

/*
* Startup: part 4
* Does a couple housecleaning tasks, then loads the contacts.
*/
ZmZimbraMail.prototype._handleResponseStartup2 =
function() {
	this.setSessionTimer(true);
	this._killSplash();
};

/**
* Performs a 'running restart' of the app by clearing state and calling the startup method.
* This method is run after a logoff, or a change in what's supported.
*/
ZmZimbraMail.prototype.restart =
function(settings) {
	// need to decide what to clean up, what to have startup load lazily
	// could have each app do shutdown()
	DBG.println(AjxDebug.DBG1, "RESTARTING APP");
	ZmCsfeCommand.setSessionId(null);			// so we get a refresh block
	var tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	if (tagList) tagList.reset();
	var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER)
	if (folderTree) folderTree.reset();
	if (this._appCtxt.isPublicComputer())
		this._appCtxt.getLoginDialog().clearAll();
	this._actionedIds = null;
	for (var app in this._apps)					// reset apps
		this._apps[app] = null;
	this._activeApp = null;
	this._appViewMgr.dtor();
	this._appViewMgr = null;
	this._searchController = this._overviewController = null;
	this._schedule(this.startup, {bIsRelogin: false, settings: settings});
};

/**
* Sends a request to the CSFE and processes the response. Notifications and
* refresh blocks that come in the response header are handled. Also handles
* exceptions by default, though the caller can pass in a special callback to
* run for exceptions. To ignore exceptions, pass in ZmZimbraMail.IGNORE_ERRORS
* as the value for the error callback (currently done for polling).
*
* @param soapDoc		[AjxSoapDoc]	SOAP document that represents the request
* @param asyncMode		[boolean]*		if true, request will be made asynchronously
* @param callback		[AjxCallback]*	next callback in chain for async request
* @param errorCallback	[Object]*		callback to run if there is an exception
* @param timeout		[int]*			timeout value (in milliseconds)
*/
ZmZimbraMail.prototype.sendRequest = 
function(soapDoc, asyncMode, callback, errorCallback, timeout) {
	var reqId = ZmZimbraMail.getNextReqId();
	var asyncCallback = asyncMode ? new AjxCallback(this, this._handleResponseSendRequest, [true, callback, errorCallback, reqId]) : null;
	var command = new ZmCsfeCommand();
	var params = {soapDoc: soapDoc, useXml: this._useXml, changeToken: this._changeToken, timeout: timeout,
				  asyncMode: asyncMode, callback: asyncCallback, logRequest: this._logRequest};
	
	if (asyncMode && (errorCallback != ZmZimbraMail.IGNORE_ERRORS)) {
		var cancelCallback = null;
		var showBusyDialog = false;
		if (timeout) {
			DBG.println(AjxDebug.DBG1, "ZmZimbraMail.sendRequest: timeout for " + reqId + " is " + timeout);
			cancelCallback = new AjxCallback(this, this.cancelRequest, [reqId, errorCallback]);
			showBusyDialog = true;
		}
		this._shell.setBusy(true, null, showBusyDialog, timeout, cancelCallback); // put up busy overlay to block user input
	}

	this._pendingRequests[reqId] = command;

	try {
		var response = command.invoke(params);
		command.state = ZmZimbraMail._SENT;
	} catch (ex) {
		if (asyncMode)
			this._handleResponseSendRequest([asyncMode, asyncCallback, errorCallback, reqId, new ZmCsfeResult(ex, true)]);
		else
			throw ex;
	}
	if (!asyncMode)
		return this._handleResponseSendRequest([asyncMode, null, errorCallback, reqId, response]);
};

ZmZimbraMail.prototype._handleResponseSendRequest =
function(args) {
	var asyncMode		= args[0];
	var callback		= args[1];
	var errorCallback	= args[2];
	var reqId			= args[3];
	var result			= args[4];

	if (this._cancelDialog && this._cancelDialog.isPoppedUp())
		this._cancelDialog.popdown();

	if (!this._pendingRequests[reqId]) return;
	if (this._pendingRequests[reqId].state == ZmZimbraMail._CANCEL) return;
	
	this._pendingRequests[reqId].state = ZmZimbraMail._RESPONSE;
	
	this._shell.setBusy(false); // remove busy overlay

	// we just got activity, cancel current poll timer
	if (this._pollActionId)
		AjxTimedAction.cancelAction(this._pollActionId);

	var response;
	try {
		response = asyncMode ? result.getResponse() : result;
	} catch (ex) {
		if (errorCallback) {
			if (errorCallback != ZmZimbraMail.IGNORE_ERRORS) {
				var handled = errorCallback.run(ex);
				if (!handled)
					this._handleException(ex);
			}
		} else {
			this._handleException(ex);
		}
		return;
	}
	
	if (response.Header) {
		this._handleHeader(response.Header);
		this._checkOverviewLayout();
	}
	if (asyncMode)
		result.set(response.Body);

	this._actionedIds = null; // reset for next request

	// start poll timer if we didn't get an exception
	if (this._pollInterval)
		this._pollActionId = this._schedule(this._doPoll, null, this._pollInterval);

	if (asyncMode) {
		if (callback) callback.run(result);
	} else {
		return response.Body;
	}
	
	this._clearPendingRequest(reqId);
};

ZmZimbraMail.prototype.cancelRequest = 
function(args) {
	var reqId			= args[0];
	var errorCallback	= args[1];

	if (!this._pendingRequests[reqId]) return;
	if (this._pendingRequests[reqId].state == ZmZimbraMail._RESPONSE) return;

	this._pendingRequests[reqId].state = ZmZimbraMail._CANCEL;
	this._shell.setBusy(false); // remove busy overlay
	DBG.println(AjxDebug.DBG1, "ZmZimbraMail.cancelRequest: " + reqId);
	this._pendingRequests[reqId].cancel();
	if (errorCallback && (errorCallback != ZmZimbraMail.IGNORE_ERRORS)) {
		var ex = new AjxException("Request canceled", AjxException.CANCELED, "ZmZimbraMail.prototype.cancelRequest");
		errorCallback.run(ex);
	}
	this._clearPendingRequest(reqId);
};

ZmZimbraMail.prototype._clearPendingRequest =
function(reqId) {
	if (this._pendingRequests[reqId])
		delete this._pendingRequests[reqId];
};

/**
* Returns a handle to the given app.
*
* @param appName	an app name
*/
ZmZimbraMail.prototype.getApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	return this._apps[appName];
};

/**
* Returns a handle to the app view manager.
*/
ZmZimbraMail.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
};


ZmZimbraMail.prototype.activateApp =
function(appName, callback, errorCallback) {
    DBG.println(AjxDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);
	    
    var view = this._appViewMgr.getAppView(appName);
    if (view) {
    	// if the app has been launched, make its view the current one
    	bActivated = true;
	    DBG.println(AjxDebug.DBG3, "activateApp, current " + appName + " view: " + view);
		if (this._appViewMgr.pushView(view)) {
		    this._appViewMgr.setAppView(appName, view);
		}
    } else {
    	// launch the app
    	if (!this._apps[appName])
			this._createApp(appName);
		DBG.println(AjxDebug.DBG1, "Launching app " + appName);
		var respCallback = new AjxCallback(this, this._handleResponseActivateApp, callback);
		this._apps[appName].launch(respCallback, errorCallback);
    }
};

ZmZimbraMail.prototype._handleResponseActivateApp =
function(callback) {
	if (callback) callback.run();
};

/**
* Handles a change in which app is current. The change will be reflected in the
* current app toolbar and the overview. The previous and newly current apps are
* notified of the change. This method is called after a new view is pushed.
*
* @param appName	[constant]	the newly current app
* @param view		[constant]	the newly current view
*/
ZmZimbraMail.prototype.setActiveApp =
function(appName, view) {
	// update view menu
	var toolbar = this._appCtxt.getCurrentAppToolbar();
	toolbar.showViewMenu(view);

	if (this._activeApp != appName) {
		// deactivate previous app
	    if (this._activeApp) {
			// some views are not stored in _apps collection, so check if it exists.
			var app = this._apps[this._activeApp];
			if (app) app.activate(false, view);
	    }
	    // switch app
		this._activeApp = appName;
		toolbar.setCurrentApp(appName);
		toolbar.setViewTooltip(view, ZmMsg[ZmZimbraMail.VIEW_TT_KEY[appName]]);
		this._appCtxt.getSearchController().setDefaultSearchType(ZmZimbraMail.DEFAULT_SEARCH[appName], true);
		this._checkOverviewLayout(true);
		// activate current app
		var app = this._apps[this._activeApp];
		if (app) app.activate(true, view);
	}
};

// Private methods

ZmZimbraMail.prototype._killSplash =
function() {
	this._splashScreen.setVisible(false);
};

// Creates an app object, which doesn't necessarily do anything just yet.
ZmZimbraMail.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	DBG.println(AjxDebug.DBG1, "Creating app " + appName);
	this._apps[appName] = new ZmZimbraMail.APP_CLASS[appName](this._appCtxt, this._shell);	
};

// Launching an app causes it to create a view (if necessary) and display it. The view that is created is up to the app.
// Since most apps schedule an action as part of their launch, a call to this function should not be
// followed by any code that depends on it (ie, it should be a leaf action).
ZmZimbraMail.prototype._launchApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	DBG.println(AjxDebug.DBG1, "Launching app " + appName);
	this._apps[appName].launch();
};

ZmZimbraMail.prototype._checkOverviewLayout =
function(force) {
	if ((this._needOverviewLayout || force) && this._settings.userSettingsLoaded) {
		DBG.println(AjxDebug.DBG1, "laying out overview panel");
		var opc = this._appCtxt.getOverviewController();
		opc.set(ZmZimbraMail._OVERVIEW_ID, ZmZimbraMail.OVERVIEW_TREES[this._activeApp]);
		this._components[ZmAppViewMgr.C_TREE] = opc.getOverview(ZmZimbraMail._OVERVIEW_ID);
		// clear shared folder dialogs so they'll be recreated with new folder tree
		this._appCtxt.clearFolderDialogs();
		this._needOverviewLayout = false;
	}
};

ZmZimbraMail.prototype._setUserInfo = 
function() {

	var login = this._appCtxt.get(ZmSetting.USERNAME);
	var displayName = this._appCtxt.get(ZmSetting.DISPLAY_NAME);
	var username;
	username = displayName ? displayName : login;
	if (username) {
		this._userNameField.innerHTML = username;
		if (AjxEnv.isLinux)	// bug fix #3355
			this._userNameField.style.lineHeight = "13px";
	}
	var userTooltip = (username != login) ? login : null;

	var quota = this._appCtxt.get(ZmSetting.QUOTA);
	var usedQuota = this._appCtxt.get(ZmSetting.QUOTA_USED);
	usedQuota = usedQuota ? usedQuota : 0;

	var size = AjxUtil.formatSize(usedQuota);
	var html = [];
	var idx = 0;
	
	var style = AjxEnv.isLinux ? " style='line-height: 13px'" : ""; 	// bug fix #3355
	html[idx++] = "<center><table border=0 cellpadding=0 cellspacing=0><tr" + style + ">";
	html[idx++] = "<td class='BannerText'>" + ZmMsg.quota + ": </td>";
	var quotaTooltip = null;
	if (quota) {
		var limit = AjxUtil.formatSize(quota);
		var percent = Math.min(Math.round((usedQuota / quota) * 100), 100);
		
		// set background color based on percent used
		var bgcolor = "#66cc33";
		if (percent < 85 && percent > 65)
			bgcolor	= "orange";
		else if (percent >= 85)
			bgcolor = "red";
		
		html[idx++] = "<td><div class='quotabar'><div style='width: " + percent + "; background-color:" + bgcolor + "' class='quotaused'></div></div></td>";
		quotaTooltip = ZmMsg.quota + ": " + percent + "% (" + size + " of " + limit + ")";
	} else {
		html[idx++] = "<td class='BannerText'> " + size + " of unlimited</td>";
	}
	html[idx++] = "</tr></table></center>";
	
	this._usedQuotaField.innerHTML = html.join("");

	if (userTooltip || quotaTooltip) {
		var tooltip = [];
		idx = 0;
		tooltip[idx++] = "<table>";
		if (userTooltip)
			tooltip[idx++] = "<tr><td>" + userTooltip + "</td></tr>";
		if (quotaTooltip)
			tooltip[idx++] = "<tr><td>" + quotaTooltip + "</td></tr>";
		tooltip[idx++] = "</table>";
		this._components[ZmAppViewMgr.C_USER_INFO].setToolTipContent(tooltip.join(""));
	}
};

// Listeners

ZmZimbraMail.logOff =
function() {

	// stop keeping track of user input (if applicable)
	if (window._zimbraMail)
		window._zimbraMail.setSessionTimer(false);

	ZmCsfeCommand.clearAuthToken();
	
	window.onbeforeunload = null;
	
	var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80')? "" : ":" + location.port) + "/zimbra/" + window.location.search;
	// not sure why IE doesn't allow this to process immediately, but since
	// it does not, we'll set up a timed action.
	if (AjxEnv.isIE){
		var act = new AjxTimedAction();
		act.method = ZmZimbraMail.redir;
		act.params.add(locationStr);
		AjxTimedAction.scheduleAction(act, 1);
	} else {
		window.location = locationStr;
	}
};

ZmZimbraMail.redir =
function(args){
	window.location = args[0];
};

ZmZimbraMail.prototype.setPollInterval =
function(minutes) {
	this._pollInterval = minutes ? minutes : this._appCtxt.get(ZmSetting.POLLING_INTERVAL) * 1000;
	DBG.println(AjxDebug.DBG1, "poll interval = " + this._pollInterval + "ms");
	if (this._pollActionId)
		AjxTimedAction.cancelAction(this._pollActionId);
	this._pollActionId = this._schedule(this._doPoll, null, this._pollInterval);
};

ZmZimbraMail.prototype.setSessionTimer =
function(bStartTimer) {

	// ALWAYS set back reference into our world (also used by unload handler)
	window._zimbraMail = this;
	
	// if no timeout value, user's client never times out from inactivity	
	var timeout = this._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT);
	if (timeout <= 0)
		return;

	if (bStartTimer) {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER SET (" + (new Date()).toLocaleString() + ")");
		this._sessionTimerId = AjxTimedAction.scheduleAction(this._sessionTimer, timeout);
		
		DwtEventManager.addListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		this._shell.setHandler(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		if (AjxEnv.isIE)
			this._shell.setHandler(DwtEvent.ONMOUSEDOWN, ZmZimbraMail._userEventHdlr);
		else
			window.onkeydown = ZmZimbraMail._userEventHdlr;
	} else {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER CANCELED (" + (new Date()).toLocaleString() + ")");
		
		AjxTimedAction.cancelAction(this._sessionTimerId);
		this._sessionTimerId = -1;

		DwtEventManager.removeListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		this._shell.clearHandler(DwtEvent.ONMOUSEUP);
		if (AjxEnv.isIE)
			this._shell.clearHandler(DwtEvent.ONMOUSEDOWN);
		else
			window.onkeydown = null;
	}
};

ZmZimbraMail.prototype.addChildWindow = 
function(childWin) {
	if (this._childWinList == null)
		this._childWinList = new AjxVector();
	
	this._childWinList.add(childWin);
};

ZmZimbraMail.prototype.removeChildWindow =
function(childWin) {
	if (this._childWinList) {
		for (var i = 0; i < this._childWinList.size(); i++) {
			if (childWin == this._childWinList.get(i)) {
				this._childWinList.removeAt(i);
				break;
			}
		}
	}
};

ZmZimbraMail.prototype._handleHeader =
function(hdr) {
	if (!hdr.context) return;
	
	if (hdr.context.refresh) {
		this._refreshHandler(hdr.context.refresh);
	}
	if (hdr.context.notify) {
		this._notifyHandler(hdr.context.notify);
	}
	if (hdr.context.change) {
		this._changeToken = hdr.context.change.token;
	}
};

// A <refresh> block is returned in a SOAP response any time the session ID has changed. It always happens
// on the first SOAP command (eg gettings prefs). After that, it happens after a session timeout.
// We'll always get a <folder> element back, but we might not get back a <tags>, so we
// need to make sure a tag tree is created, even if it's empty.
//
// Note: this could be optimized to do a compare (since for the large majority of refreshes, the tags and
// folders won't have changed except unread counts), but a session timeout should be relatively rare when
// we're doing polling.
ZmZimbraMail.prototype._refreshHandler =
function(refresh) {
	DBG.println(AjxDebug.DBG2, "Handling REFRESH");
	
	var tagTree = this._appCtxt.getTree(ZmOrganizer.TAG);
	if (!tagTree) {
		tagTree = new ZmTagTree(this._appCtxt);
		tagTree.addChangeListener(this._unreadListener);
		this._appCtxt.setTree(ZmOrganizer.TAG, tagTree);
	}
	var tagString = tagTree.asString();
	var unread = tagTree.getUnreadHash();
	tagTree.reset();
	tagTree.createRoot(); // tag tree root not in the DOM

	var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
	if (!calendarTree) {
		calendarTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.CALENDAR);
		calendarTree.addChangeListener(this._calendarListener);
		this._appCtxt.setTree(ZmOrganizer.CALENDAR, calendarTree);
	}
	var calendarString = calendarTree.asString();
	calendarTree.reset();

	var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
	if (!folderTree) {
		folderTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.FOLDER);
		folderTree.addChangeListener(this._unreadListener);
		this._appCtxt.setTree(ZmOrganizer.FOLDER, folderTree);
	}
	var folderString = folderTree.asString();
	folderTree.getUnreadHash(unread);
	folderTree.reset();
	
	var searchTree = this._appCtxt.getTree(ZmOrganizer.SEARCH);
	if (!searchTree) {
		searchTree = new ZmFolderTree(this._appCtxt, ZmOrganizer.SEARCH);
		this._appCtxt.setTree(ZmOrganizer.SEARCH, searchTree);
	}
	var searchString = searchTree.asString();
	searchTree.reset();

	if (refresh.tags)
		tagTree.loadFromJs(refresh.tags);
	if (refresh.folder) {
		calendarTree.loadFromJs(refresh.folder[0]);
		folderTree.loadFromJs(refresh.folder[0]);
		searchTree.loadFromJs(refresh.folder[0]);
	}
	
	if (tagTree.asString() != tagString || folderTree.asString() != folderString ||
		calendarTree.asString() != calendarString) {
		DBG.println(AjxDebug.DBG1, "overview layout needed (refresh)");
		DBG.println(AjxDebug.DBG2, "tags: " + tagString + " / " + tagTree.asString());
		DBG.println(AjxDebug.DBG2, "folders: " + folderString + " / " + folderTree.asString());
		this._needOverviewLayout = true;
	} else {
		this._checkUnread(tagTree, unread);
		this._checkUnread(folderTree, unread);
	}

	// need to tell calendar to refresh/relayout
	if (this._calController) this._calController.refreshHandler();	
};

ZmZimbraMail.prototype._checkUnread =
function(tree, unread) {
	var organizers = [];
	var list = tree.asList();
	for (var i = 0; i < list.length; i++) {
		var organizer = list[i];
		if (organizer.numUnread != unread[organizer.id])
			organizers.push(organizer);
	}
	if (organizers.length) {
		var fields = {};
		fields[ZmOrganizer.F_UNREAD] = true;
		tree._eventNotify(ZmEvent.E_MODIFY, organizers, {fields: fields});
	}
};

// This method is called by the window.onbeforeunload method.
ZmZimbraMail._confirmExitMethod =
function() {
	DBG.println(AjxDebug.DBG1, "_confirmExitMethod, received unload event");
	return ZmMsg.appExitWarning;
};

// To handle notifications, we keep track of all the models in use. A model could
// be an item, a list of items, or an organizer tree. Currently we never get an
// organizer by itself.
ZmZimbraMail.prototype._notifyHandler =
function(notify) {
	DBG.println(AjxDebug.DBG2, "Handling NOTIFY");
	notify = this._adjustNotifies(notify);
	try {
		if (notify.deleted)
			this._handleDeletes(notify.deleted);
		if (notify.created)
			this._handleCreates(notify.created, notify.modified);
		if (notify.modified)
			this._handleModifies(notify.modified);
		if (this._calController) this._calController.notifyComplete();
	} catch (ex) {
		this._handleException(ex, this._notifyHandler, notify, false);
	}
};

// Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
ZmZimbraMail.prototype._adjustNotifies =
function(notify) {
	if (!(notify.deleted && notify.created && notify.modified))	return notify;
	
	var virtConvDeleted = false;
	var deletedIds = notify.deleted.id.split(",");
	var virtConv = {};
	var newDeletedIds = [];
	for (var i = 0; i < deletedIds.length; i++) {
		var id = deletedIds[i];
		if (id < 0) {
			virtConv[id] = true;
			virtConvDeleted = true;
		} else {
			newDeletedIds.push(id);
		}
	}
	if (!virtConvDeleted) return notify;

	var gotNewConv = false;
	var createList = this._getObjList(notify.created);
	var createdMsgs = {};
	var createdConvs = {};
	for (var i = 0; i < createList.length; i++) {
		var create = createList[i];
		var id = create.id;
		var name = create._name;
		if (name == "m") {
			createdMsgs[id] = create;
		} else if (name == "c" && (create.n > 1)) {
			createdConvs[id] = create;
			gotNewConv = true;
		}
	}
	if (!gotNewConv) return notify;
	
	var msgMoved = false;
	var newToOldCid = {};
	var modList = this._getObjList(notify.modified);
	var movedMsgs = {};
	for (var i = 0; i < modList.length; i++) {
		var mod = modList[i];
		var id = mod.id;
		var name = mod._name;
		if (name == "m") {
			var virtCid = id * -1;
			if (virtConv[virtCid] && createdConvs[mod.cid]) {
				msgMoved = true;
				movedMsgs[id] = mod;
				newToOldCid[mod.cid] = virtCid;
			}
		}
	}
	if (!msgMoved) return notify;
	
	// We're promoting a virtual conv. Normalize the notifications object, and
	// process a preliminary notif that will update the virtual conv's ID to its
	// new value.
	
	// First, ignore the deleted notif for the virtual conv
	notify.deleted.id = newDeletedIds.join(",");
	
	// Next, make sure we ignore the create for the real conv by placing a marker in its node.
	for (var i = 0; i < createList.length; i++) {
		var create = createList[i];
		var id = create.id;
		var name = create._name;
		if (name == "c" && virtConv[newToOldCid[id]]) {
			createdConvs[id]._wasVirtConv = true;
		}
	}

	// Create modified notifs for the virtual convs that have been promoted.
	var newMods = [];
	for (var cid in newToOldCid) {
		var node = createdConvs[cid];
		node.id = newToOldCid[cid];
		node._newId = cid;
		newMods.push(node);
	}
	
	// Go ahead and process these changes, which will change the ID of each promoted conv
	// from its virtual (negative) ID to its real (positive) one.
	if (newMods.length) {
		var mods = {};
		mods.c = newMods;
		this._handleModifies(mods);
	}
	
	return notify;
};

// Delete notification just gives us a list of IDs which could be anything.
// Hand that list to each model and let it check.
ZmZimbraMail.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	if (this._calController) this._calController.notifyDelete(ids);

	for (var i = 0; i < ids.length; i++) {
		var item = this._appCtxt.cacheGet(ids[i]);
		DBG.println(AjxDebug.DBG2, "handling delete notif for ID " + ids[i]);
		if (item)
			item.notifyDelete();
	}
};

// Create notification hands us the full XML node. For tags and folders, we 
// should always have tag and folder trees, so let them handle the create.
// For items, finding a containing list is trickier. If it's a contact, we hand
// the new node to the contact list. If it's mail, there is no authoritative
// list (mail lists are always the result of a search), so we notify each 
// ZmMailList that we know about. To make life easier, we figure out which 
// folder(s) a conv spans before we hand it off.
ZmZimbraMail.prototype._handleCreates =
function(creates, modifies) {
	var list = this._getObjList(creates);
	var convs = {};
	var msgs = {};
	var folders = {};
	var numMsgs = {};
	var gotMail = false;
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if ((name == "c") && create._wasVirtConv) continue;
		DBG.println(AjxDebug.DBG1, "handling CREATE for node: " + name);
		if (name == "tag") {
			var tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
			tagList.root.notifyCreate(create);
		} else if (name == "folder" || name == "search") {
			var parentId = create.l;
			var parent;
			var folderTree = this._appCtxt.getTree(ZmOrganizer.FOLDER);
			var searchTree = this._appCtxt.getTree(ZmOrganizer.SEARCH);
			var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
			// parent could be a folder or a search
			if (parentId == ZmOrganizer.ID_ROOT) {
				parent = (name == "folder")
						? (create.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR] ? calendarTree.getById(parentId) : folderTree.getById(parentId))
						: searchTree.getById(parentId);
			} else {
				parent = folderTree.getById(parentId);
				if (!parent)
					parent = searchTree.getById(parentId);
				if (!parent)
					parnet = calendarTree.getById(parentId);
			}
			if (parent)
				parent.notifyCreate(create, (name == "search"));
		} else if (name == "link") {
			// TODO: We only support calendar links at the moment...
			var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);

			var parentId = create.l;
			var parent = calendarTree.getById(parentId);
			
			if (parent) {
				parent.notifyCreate(create, true);
			}
		} else if (name == "m") {
			var msg = ZmMailMsg.createFromDom(create, {appCtxt: this._appCtxt}, true);
			msgs[msg.id] = msg;
			var cid = msg.cid;
			var folder = msg.folderId;
			if (cid && folder) {
				if (!folders[cid])
					folders[cid] = {};
				folders[cid][folder] = true;
			}
			numMsgs[cid] = numMsgs[cid] ? numMsgs[cid] + 1 : 1;
			gotMail = true;
		} else if (name == "c") {
			var conv = ZmConv.createFromDom(create, {appCtxt: this._appCtxt}, true);
			convs[conv.id] = conv;
			gotMail = true;
		} else if (name == "cn") {
			var contactList = this.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
			contactList.notifyCreate(create, true);
		} else if (name == "appt") {
			// TODO: create appt object and pass into notify create
			if (this._calController) 
				this._calController.notifyCreate(null);
		}
	}
	if (gotMail) {
		for (var cid in convs) {
			var conv = convs[cid];
			conv.folders = folders[cid] ? folders[cid] : null;
		}
		var list = this._appCtxt.getCurrentList();
		if (list && (list instanceof ZmMailList))
			list.notifyCreate(convs, msgs);
	}
};

// Change notifications are handled at the item/organizer level. The item or
// organizer will notify its list/tree, if any.
ZmZimbraMail.prototype._handleModifies =
function(modifies) {
	var list = this._getObjList(modifies);
	// always notify cal controller
	if (this._calController) this._calController.notifyModify(list);
	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		var id = mod.id;
		var name = mod._name;

		if (name == "mbx") {
			var setting = this._settings.getSetting(ZmSetting.QUOTA_USED);
			setting.notifyModify(mod);
			continue;
		}

		DBG.println(AjxDebug.DBG2, "handling modified notif for ID " + id + ", node type = " + name);
		var item = this._appCtxt.cacheGet(id);
		if (item)
			item.notifyModify(mod);
	}
};

// Returns a list of objects that have the given parent, flattening child
// arrays in the process. It also saves each child's name into it.
ZmZimbraMail.prototype._getObjList =
function(parent) {
	var list = [];
	for (var name in parent) {
		var obj = parent[name];
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				obj[i]._name = name;
				list.push(obj[i]);
			}
		} else {
			obj._name = name;
			list.push(obj);
		}
	}
	return list;
};

// Sends a NoOpRequest to see if we get any notifications (eg new mail). Ignores exceptions.
ZmZimbraMail.prototype._doPoll =
function() {
	this._pollActionId = null; // so we don't try to cancel
	var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	this.sendRequest(soapDoc, true, null, ZmZimbraMail.IGNORE_ERRORS);
};

ZmZimbraMail._userEventHdlr =
function(ev) {
	var zm = window._zimbraMail;
	if (zm) {
		// cancel old timer and start a new one
		AjxTimedAction.cancelAction(zm._sessionTimerId);
		var timeout = zm._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT);
		zm._sessionTimerId = AjxTimedAction.scheduleAction(zm._sessionTimer, timeout);
	}
	DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER RESET (" + (new Date()).toLocaleString() + ")");
};

ZmZimbraMail.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == ZmSetting.QUOTA_USED) {
		this._setUserInfo();
	} else	if (setting.id == ZmSetting.POLLING_INTERVAL) {
		this.setPollInterval();
	}
};

/*
* Changes the browser title if it's a folder or tag whose unread
* count just changed.
*/
ZmZimbraMail.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (fields && fields[ZmOrganizer.F_UNREAD]) {
			var search = this._appCtxt.getCurrentSearch();
			if (search && (ev.source.id == search.folderId || ev.source.id == search.tagId))
				Dwt.setTitle(search.getTitle());
		}		
	}
};

ZmZimbraMail.prototype._calendarChangeListener =
function(ev) {
	// TODO
};

ZmZimbraMail.prototype._createBanner =
function() {
	// The LogoContainer style centers the logo
	var banner = new DwtComposite(this._shell, "LogoContainer", Dwt.ABSOLUTE_STYLE);
	var html = [];
	var i = 0;
	html[i++] = "<a href='";
	html[i++] = this._appCtxt.get(ZmSetting.LOGO_URI);
	html[i++] = "' target='_blank'><div class='"+AjxImg.getClassForImage("AppBanner")+"'></div></a>";
	banner.getHtmlElement().innerHTML = html.join("");
	return banner;
};

ZmZimbraMail.prototype._createUserInfo =
function() {
	var userInfo = new DwtComposite(this._shell, "BannerBar", Dwt.ABSOLUTE_STYLE);
	userInfo.setScrollStyle(Dwt.CLIP);
	userInfo._setMouseEventHdlrs();

	var userNameId = Dwt.getNextId();
	var usedQuotaId = Dwt.getNextId();

	var html = [];
	var i = 0;
	html[i++] = "<table border=0 cellpadding=1 cellspacing=0 width=100%>";
	html[i++] = "<tr><td><div class='BannerTextUser' id='" + userNameId + "'></div></td></tr>";
	html[i++] = "<tr><td><div id='" + usedQuotaId + "'></div></td></tr>";
	html[i++] = "</table>";
	userInfo.getHtmlElement().innerHTML = html.join("");

	var doc = userInfo.getDocument();
	this._userNameField = doc.getElementById(userNameId);
	this._usedQuotaField = doc.getElementById(usedQuotaId);
	
	return userInfo;
};

ZmZimbraMail.prototype._createAppChooser =
function() {
	var buttons = [ZmAppChooser.B_EMAIL];
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		buttons.push(ZmAppChooser.B_CONTACTS);
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED))
		buttons.push(ZmAppChooser.B_CALENDAR);
	buttons.push(ZmAppChooser.SEP, ZmAppChooser.B_HELP, ZmAppChooser.B_OPTIONS, ZmAppChooser.B_LOGOUT);
	var appChooser = new ZmAppChooser(this._shell, null, buttons);
	
	var buttonListener = new AjxListener(this, this._appButtonListener);
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SEP) continue;
		var b = appChooser.getButton(id);
		b.addSelectionListener(buttonListener);
	}

	return appChooser;
};

ZmZimbraMail.prototype.setStatusMsg =
function(msg, level, detail, delay, transition) {
	this._statusView.setStatusMsg(msg, level, detail, delay, transition);
};

ZmZimbraMail.prototype._appButtonListener =
function(ev) {
	try {
		var searchController = this._appCtxt.getSearchController();
		var id = ev.item.getData(Dwt.KEY_ID);
		DBG.println("ZmZimbraMail button press: " + id);
		if (id == ZmAppChooser.B_EMAIL) {
			this.activateApp(ZmZimbraMail.MAIL_APP);
		} else if (id == ZmAppChooser.B_CONTACTS) {
			this.activateApp(ZmZimbraMail.CONTACTS_APP);
		} else if (id == ZmAppChooser.B_CALENDAR) {
			this.activateApp(ZmZimbraMail.CALENDAR_APP);
		} else if (id == ZmAppChooser.B_HELP) {
			window.open(this._appCtxt.get(ZmSetting.HELP_URI));
		} else if (id == ZmAppChooser.B_OPTIONS) {
			this.activateApp(ZmZimbraMail.PREFERENCES_APP);
		} else if (id == ZmAppChooser.B_LOGOUT) {
			ZmZimbraMail.logOff();
		}
	} catch (ex) {
		this._handleException(ex, this._appButtonListener, ev, false);
	}
};

ZmZimbraMail.prototype._keyPressListener =
function(ev) {
	DBG.println("ZmZimbraMail.KeyPressListener");
	var curView = this._appViewMgr.getCurrentView();
	if (curView) {
		DBG.println("DO IT!");
		curView.getController().handleKeyPressEvent(ev);
	}
}
