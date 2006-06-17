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
* Creates a controller to run ZimbraMail. Do not call directly, instead use the run()
* factory method.
* @constructor
* @class
* This class is the "ubercontroller", as it manages all the apps as well as bootstrapping
* the ZimbraMail application.
*
* @param appCtxt	[ZmAppCtxt]		the app context (global storage)
* @param domain		[string]		current domain
* @param app		[constant]		starting app
*/
function ZmZimbraMail(appCtxt, domain, app, userShell) {
	ZmController.call(this, appCtxt);

	this._userShell = userShell;

	// load these here instead of globally so new window doesnt need to import unnecessary apps
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.MAIL_APP]			= ZmMailApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.CONTACTS_APP]		= ZmContactsApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.CALENDAR_APP]		= ZmCalendarApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.IM_APP]				= ZmImApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.NOTEBOOK_APP]		= ZmNotebookApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.PREFERENCES_APP]	= ZmPreferencesApp;
	ZmZimbraMail.APP_CLASS[ZmZimbraMail.MIXED_APP]			= ZmMixedApp;

	// settings structure and defaults
	this._settings = appCtxt.getSettings();
    DBG.println(AjxDebug.DBG1, "Branch: " + appCtxt.get(ZmSetting.BRANCH) + " Image Load: " + zImgLoading + " JS/CSS Load: " + zJSloading);
    var listener = new AjxListener(this, this._settingsChangeListener);
	this._settings.getSetting(ZmSetting.QUOTA_USED).addChangeListener(listener);
	this._settings.getSetting(ZmSetting.POLLING_INTERVAL).addChangeListener(listener);
	this._settings.getSetting(ZmSetting.SKIN_NAME).addChangeListener(listener);

	ZmCsfeCommand.setServerUri(location.protocol + "//" + domain + appCtxt.get(ZmSetting.CSFE_SERVER_URI));

	appCtxt.setAppController(this);
	appCtxt.setClientCmdHdlr(new ZmClientCmdHandler(appCtxt));

	this._shell = appCtxt.getShell();
	
	/* Register our keymap and global key action handler with the shell's keyboard manager 
	 * CURRENTLY use $set: kbnav. 
	 */
	this._kbMgr = this._shell.getKeyboardMgr();
	this._kbMgr.registerKeyMap(new ZmKeyMap());
	this._kbMgr.registerApplicationKeyActionHandler(this);

	if (location.search && (location.search.indexOf("nss=1") != -1))
   	    this._splashScreen = null;
    else
   	    this._splashScreen = new ZmSplashScreen(this._shell, "SplashScreen");
 
	this._apps = {};
	this._activeApp = null;
    this._highestNotifySeen = 0;
	
	this._sessionTimer = new AjxTimedAction(null, ZmZimbraMail.logOff);
	this._sessionTimerId = -1;
	this._shell.setBusyDialogText(ZmMsg.askCancel);
	this._pendingRequests = {};

	this._pollActionId = null;

	this._needOverviewLayout = false;
	this._treeListener = {};
	var unreadListener = new AjxListener(this, this._unreadChangeListener);
	this._treeListener[ZmOrganizer.FOLDER]		= unreadListener;
	this._treeListener[ZmOrganizer.TAG]			= unreadListener;
	this._treeListener[ZmOrganizer.CALENDAR]	= new AjxListener(this, this._calendarChangeListener);
	this._treeListener[ZmOrganizer.NOTEBOOK]	= new AjxListener(this, this._notebookChangeListener);
	this._treeListener[ZmOrganizer.ADDRBOOK]	= new AjxListener(this, this._addrBookChangeListener);
	this._treeListener[ZmOrganizer.SEARCH]		= new AjxListener(this, this._searchChangeListener);

	this._useXml = this._appCtxt.get(ZmSetting.USE_XML);
	this._logRequest = this._appCtxt.get(ZmSetting.LOG_REQUEST);
	this._stdTimeout = this._appCtxt.get(ZmSetting.TIMEOUT);

	this._keyMap = new ZmKeyMap();
	
	this.startup({app: app});
};

ZmZimbraMail.prototype = new ZmController;
ZmZimbraMail.prototype.constructor = ZmZimbraMail;

ZmZimbraMail.MAIL_APP			= "mail";
ZmZimbraMail.CONTACTS_APP		= "contacts";
ZmZimbraMail.CALENDAR_APP		= "calendar";
ZmZimbraMail.IM_APP				= "im";
ZmZimbraMail.NOTEBOOK_APP		= "notebook";
ZmZimbraMail.PREFERENCES_APP	= "options";
ZmZimbraMail.MIXED_APP			= "mixed";

ZmZimbraMail.APP_CLASS = {};

// app names
ZmZimbraMail.MSG_KEY = {};
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MAIL_APP]				= "mail";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CONTACTS_APP]			= "addressBook";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CALENDAR_APP]			= "calendar";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.IM_APP]				= "imAppTitle";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.NOTEBOOK_APP]			= "documents";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.PREFERENCES_APP]		= "options";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MIXED_APP]			= "zimbraTitle";

// app icons
ZmZimbraMail.APP_ICON = {};
ZmZimbraMail.APP_ICON[ZmZimbraMail.MAIL_APP]			= "MailApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.CONTACTS_APP]		= "ContactsApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.CALENDAR_APP]		= "CalendarApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.IM_APP]				= "ImStartChat";
ZmZimbraMail.APP_ICON[ZmZimbraMail.NOTEBOOK_APP]		= "NoteApp";
ZmZimbraMail.APP_ICON[ZmZimbraMail.PREFERENCES_APP]		= "Preferences";
ZmZimbraMail.APP_ICON[ZmZimbraMail.MIXED_APP]			= "Globe";

// tooltips for app buttons
ZmZimbraMail.VIEW_TT_KEY = {};
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.MAIL_APP]			= "displayMail";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CONTACTS_APP]		= "displayContacts";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CALENDAR_APP]		= "displayCalendar";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.IM_APP]	        = "displayIM";

// apps for the app chooser
ZmZimbraMail.APPS = [ZmZimbraMail.MAIL_APP, ZmZimbraMail.CONTACTS_APP, ZmZimbraMail.CALENDAR_APP,
					 ZmZimbraMail.IM_APP, ZmZimbraMail.NOTEBOOK_APP];

// app button IDs
ZmZimbraMail.APP_BUTTON = {};
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.MAIL_APP]			= ZmAppChooser.B_EMAIL;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CONTACTS_APP]		= ZmAppChooser.B_CONTACTS;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CALENDAR_APP]		= ZmAppChooser.B_CALENDAR;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.IM_APP]			= ZmAppChooser.B_IM;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.NOTEBOOK_APP]		= ZmAppChooser.B_NOTEBOOK;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.PREFERENCES_APP]	= ZmAppChooser.B_OPTIONS;

// setting for each app which tells us if it is enabled
ZmZimbraMail.APP_SETTING = {};
ZmZimbraMail.APP_SETTING[ZmZimbraMail.CONTACTS_APP]		= ZmSetting.CONTACTS_ENABLED;
ZmZimbraMail.APP_SETTING[ZmZimbraMail.CALENDAR_APP]		= ZmSetting.CALENDAR_ENABLED;
ZmZimbraMail.APP_SETTING[ZmZimbraMail.IM_APP]			= ZmSetting.IM_ENABLED;
ZmZimbraMail.APP_SETTING[ZmZimbraMail.NOTEBOOK_APP]		= ZmSetting.NOTEBOOK_ENABLED;

// default search type for each app
ZmZimbraMail.DEFAULT_SEARCH = {};
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MAIL_APP]		= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CONTACTS_APP]	= ZmItem.CONTACT;
//ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmItem.APPT;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.IM_APP]    	= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MIXED_APP]		= ZmSearchToolBar.FOR_ANY_MI;

// trees shown in overview panel for each app
ZmZimbraMail.OVERVIEW_TREES = {};
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MAIL_APP]		= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CONTACTS_APP]	= [ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CALENDAR_APP]	= [ZmOrganizer.CALENDAR, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.IM_APP]		= [ZmOrganizer.ROSTER_TREE_ITEM, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.NOTEBOOK_APP]	= [ZmOrganizer.NOTEBOOK, /*ZmOrganizer.SEARCH,*/ ZmOrganizer.TAG,ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MIXED_APP]		= [ZmOrganizer.FOLDER, ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];

// trees to hide if they have no data
ZmZimbraMail.HIDE_EMPTY = {};
ZmZimbraMail.HIDE_EMPTY[ZmOrganizer.SEARCH]	= true;
ZmZimbraMail.HIDE_EMPTY[ZmOrganizer.ZIMLET]	= true;

// types of saved searches to show
ZmZimbraMail.SEARCH_TYPES = {};
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.MAIL_APP]		= [ZmItem.MSG, ZmItem.CONV];
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.CONTACTS_APP]	= [ZmItem.CONTACT];
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.NOTEBOOK_APP]	= [ZmItem.PAGE, ZmItem.DOCUMENT];
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.MIXED_APP]		= [ZmItem.MSG, ZmItem.CONV];
ZmZimbraMail.SEARCH_TYPES_H = {};
for (var app in ZmZimbraMail.SEARCH_TYPES) {
	ZmZimbraMail.SEARCH_TYPES_H[app] = {};
	for (var i = 0; i < ZmZimbraMail.SEARCH_TYPES[app].length; i++) {
		ZmZimbraMail.SEARCH_TYPES_H[app][ZmZimbraMail.SEARCH_TYPES[app][i]] = true;
	}
}

// map a keyboard action code to the app to go to
ZmZimbraMail.ACTION_CODE_TO_APP = {};
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_MAIL]		= ZmZimbraMail.MAIL_APP;
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_CONTACTS]	= ZmZimbraMail.CONTACTS_APP;
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_CALENDAR]	= ZmZimbraMail.CALENDAR_APP;
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_IM]		= ZmZimbraMail.IM_APP;
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_NOTEBOOK]	= ZmZimbraMail.NOTEBOOK_APP;
ZmZimbraMail.ACTION_CODE_TO_APP[ZmKeyMap.GOTO_OPTIONS]	= ZmZimbraMail.PREFERENCES_APP;

// trees whose data comes in a <refresh> block
ZmZimbraMail.REFRESH_TREES = [ZmOrganizer.FOLDER, ZmOrganizer.TAG, ZmOrganizer.SEARCH, ZmOrganizer.ZIMLET,
							  ZmOrganizer.ADDRBOOK, ZmOrganizer.CALENDAR, ZmOrganizer.NOTEBOOK];

ZmZimbraMail.defaultStartApp = ZmZimbraMail.MAIL_APP;

ZmZimbraMail._PREFS_ID	= 1;
ZmZimbraMail._HELP_ID	= 2;
ZmZimbraMail._LOGOFF_ID	= 3;

ZmZimbraMail._OVERVIEW_ID = "ZmZimbraMail";

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
* @param domain			[string]	the host that we're running on
* @param app			[constant]*	starting app
* @param userShellId	[string]*	DOM ID of containing skin
*/
ZmZimbraMail.run =
function(domain, app, userShellId) {

	// Create the global app context
	var appCtxt = new ZmAppCtxt();

	appCtxt.setRememberMe(false);

	// Create the shell
	var settings = appCtxt.getSettings();
	var userShell = window.document.getElementById(settings.get(ZmSetting.SKIN_SHELL_ID));
	var shell = new DwtShell(null, false, ZmZimbraMail._confirmExitMethod, userShell);
	appCtxt.setShell(shell);

	appCtxt.setItemCache(new AjxCache());

	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new AjxPost(appCtxt.getUploadFrameId()));

	// Go!
	new ZmZimbraMail(appCtxt, domain, app, userShell);
};

/**
* Allows parent window to walk list of open child windows and either nuke them
* or "disable" them.
*/
ZmZimbraMail.unload =
function() {
	var childWinList = window._zimbraMail ? window._zimbraMail._childWinList : null;
	if (childWinList) {
		// close all child windows
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			childWin.win.parentController = null;
			childWin.win.close();
		}
	}
	window._zimbraMail = window.onload = window.onresize = window.document.onkeypress = null;
};

/**
* Loads the app and presents the initial view. First, it gets the user's preferences.
* Next, it launches the start app (which defaults to mail) and shows the results to
* the user. Finally, we load contacts in the background.
*
* @param app			[constant]*		starting app
* @param isRelogin		[boolean]*		user has re-authenticated after session timeout
* @param settings		[hash]*			settings overrides
*/
ZmZimbraMail.prototype.startup =
function(params) {

	if (!this._appViewMgr) {
		this._appViewMgr = new ZmAppViewMgr(this._shell, this, false, true);
	}

	skin.showSkin(true);
	if (!this._components) {
		this._components = {};
		this._components[ZmAppViewMgr.C_SASH] = new DwtSash(this._shell, DwtSash.HORIZONTAL_STYLE,
											 				"console_inset_app_l", 20);
		this._components[ZmAppViewMgr.C_BANNER] = this._createBanner();
		this._components[ZmAppViewMgr.C_USER_INFO] = this._createUserInfo();
		var currentAppToolbar = new ZmCurrentAppToolBar(this._shell);
		this._appCtxt.setCurrentAppToolbar(currentAppToolbar);
		this._components[ZmAppViewMgr.C_CURRENT_APP] = currentAppToolbar;
		this._components[ZmAppViewMgr.C_STATUS] = this._statusView = new ZmStatusView(this._shell, "ZmStatus", Dwt.ABSOLUTE_STYLE);
	}

	var respCallback = new AjxCallback(this, this._handleResponseStartup, params);
	this._errorCallback = new AjxCallback(this, this._handleErrorStartup);
	this._settings.loadUserSettings(respCallback, this._errorCallback); // load user prefs and COS data
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

	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
	}

    // trigger roster load/reload
	if (this._appCtxt.get(ZmSetting.IM_ENABLED)) {
		this.getApp(ZmZimbraMail.IM_APP).getRoster().reload();
	}

	if (document.domain != "localhost") {
		this.setPollInterval();	// turn off polling for dev
	}
	var opc = this._appCtxt.getOverviewController();
	if (!opc.getOverview(ZmZimbraMail._OVERVIEW_ID)) {
		opc.createOverview({overviewId: ZmZimbraMail._OVERVIEW_ID, parent: this._shell, posStyle: Dwt.ABSOLUTE_STYLE,
							selectionSupported: true, actionSupported: true, dndSupported: true, showUnread: true,
							hideEmpty: ZmZimbraMail.HIDE_EMPTY});
	}
	this._setUserInfo();
	this._checkOverviewLayout();

	if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		this._components[ZmAppViewMgr.C_SEARCH] = this._appCtxt.getSearchController().getSearchPanel();
	}

	if (!this._components[ZmAppViewMgr.C_APP_CHOOSER]) {
		this._components[ZmAppViewMgr.C_APP_CHOOSER] = this._createAppChooser();
	}
	this._appViewMgr.addComponents(this._components, true);

	// ROSSD - TEMPORARY - WILL BE MOVED
	/* Appview manager is the place for these. the issue is that the skins will need to provide the
	 * tabgroup index location of each of the top level views
	 */
	DBG.println(AjxDebug.DBG2, "SETTING SEARCH CONTROLLER TAB GROUP")
	var rootTg = this._appCtxt.getRootTabGroup();
	rootTg.addMember(this._appCtxt.getSearchController().getTabGroup());
	// Add dummy app view tab group. This will get replaced right away when the
	// app view comes into play
	var dummyTg = new DwtTabGroup("DUMMY APPVIEW");
	ZmController._setCurrentAppViewTabGroup(dummyTg);
	rootTg.addMember(dummyTg);
	rootTg.addMember(this._components[ZmAppViewMgr.C_APP_CHOOSER]);

	this._calController = this.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED) && this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		this.getApp(ZmZimbraMail.CALENDAR_APP).showMiniCalendar(true);
	}

	this._preloadViews();

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
function(params) {
	var respCallback = new AjxCallback(this, this._handleResponseStartup2);
	var startApp = (params && params.app) ? params.app :
				   (params && params.isRelogin && this._activeApp) ? this._activeApp : ZmZimbraMail.defaultStartApp;
	this.activateApp(startApp, false, respCallback, this._errorCallback);
	this.setStatusMsg(ZmMsg.initializationComplete, null, null, null, ZmStatusView.TRANSITION_INVISIBLE);
};

/*
* Startup: part 4
* Does a couple housecleaning tasks, then sets focus.
*/
ZmZimbraMail.prototype._handleResponseStartup2 =
function() {
	this.setSessionTimer(true);
	this._killSplash();

	this._shell.getKeyboardMgr().setTabGroup(this._appCtxt.getRootTabGroup());
	var startupFocusItem = this._appViewMgr.getCurrentView().getController().getCurrentView();	// returns a list view
	this._shell.getKeyboardMgr().grabFocus(startupFocusItem);
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
	this.reset();
   	this.startup({settings: settings});
};

ZmZimbraMail.prototype.reset =
function() {
	ZmCsfeCommand.setSessionId(null);	// so we get a refresh block
    this._highestNotifySeen = 0; 		// we have a new session

    for (var t in this._appCtxt._trees) {
    	var tree = this._appCtxt.getTree(t);
    	if (tree && tree.reset) {
    		tree.reset();
    	}
    }

	if (!this._appCtxt.rememberMe()) {
		this._appCtxt.getLoginDialog().clearAll();
	}
	for (var app in this._apps) {
		this._apps[app] = null;
	}
	this._activeApp = null;
	this._appViewMgr.reset();
};

/**
* Sends a request to the CSFE and processes the response. Notifications and
* refresh blocks that come in the response header are handled. Also handles
* exceptions by default, though the caller can pass in a special callback to
* run for exceptions. The error callback should return true if it has
* handled the exception, and false if standard exception handling should still
* be performed.
*
* @param soapDoc		[AjxSoapDoc]	SOAP document that represents the request
* @param asyncMode		[boolean]*		if true, request will be made asynchronously
* @param callback		[AjxCallback]*	next callback in chain for async request
* @param errorCallback	[Object]*		callback to run if there is an exception
* @param execFrame		[AjxCallback]*	the calling method, object, and args
* @param timeout		[int]*			timeout value (in seconds)
* @param noBusyOverlay	[boolean]*		if true, don't use the busy overlay
*/
ZmZimbraMail.prototype.sendRequest =
function(params) {
	var reqId = params.reqId = ZmZimbraMail.getNextReqId();
	var timeout = (params.timeout != null) ? params.timeout : this._stdTimeout;
	if (timeout) timeout = timeout * 1000; // convert seconds to ms
	var asyncCallback = params.asyncMode ? new AjxCallback(this, this._handleResponseSendRequest, [params]) : null;
	var command = new ZmCsfeCommand();
	var cmdParams = {soapDoc: params.soapDoc, useXml: this._useXml, changeToken: this._changeToken,
					 asyncMode: params.asyncMode, callback: asyncCallback, logRequest: this._logRequest,
					 highestNotifySeen: this._highestNotifySeen };

	DBG.println(AjxDebug.DBG2, "sendRequest: " + params.soapDoc._methodEl.nodeName);
	if (params.asyncMode && !params.noBusyOverlay) {
		var cancelCallback = null;
		var showBusyDialog = false;
		if (timeout) {
			DBG.println(AjxDebug.DBG1, "ZmZimbraMail.sendRequest: timeout for " + reqId + " is " + timeout);
			cancelCallback = new AjxCallback(this, this.cancelRequest, [reqId, params.errorCallback]);
			showBusyDialog = true;
		}
		this._shell.setBusy(true, reqId, showBusyDialog, timeout, cancelCallback); // put up busy overlay to block user input
	}

	this._pendingRequests[reqId] = command;

	try {
		var response = command.invoke(cmdParams);
		command.state = ZmZimbraMail._SENT;
	} catch (ex) {
		this._handleResponseSendRequest(params, new ZmCsfeResult(ex, true));
	}
	if (!params.asyncMode)
		return this._handleResponseSendRequest(params, response);
};

ZmZimbraMail.prototype._handleResponseSendRequest =
function(params, result) {
	if (this._cancelDialog && this._cancelDialog.isPoppedUp())
		this._cancelDialog.popdown();

	if (!this._pendingRequests[params.reqId]) return;
	if (this._pendingRequests[params.reqId].state == ZmZimbraMail._CANCEL) return;

	this._pendingRequests[params.reqId].state = ZmZimbraMail._RESPONSE;

	if (!params.noBusyOverlay)
		this._shell.setBusy(false, params.reqId); // remove busy overlay

	// we just got activity, cancel current poll timer
	if (this._pollActionId)
		AjxTimedAction.cancelAction(this._pollActionId);

	var response;
	try {
		response = params.asyncMode ? result.getResponse() : result;
	} catch (ex) {
		DBG.println(AjxDebug.DBG2, "Request " + params.reqId + " got an exception");
		if (params.errorCallback) {
			var handled = params.errorCallback.run(ex);
			if (!handled)
				this._handleException(ex, params.execFrame);
		} else {
			this._handleException(ex, params.execFrame);
		}
		this._handleHeader(result.getHeader());
		return;
	}
	if (params.asyncMode) {
		result.set(response.Body);
	}

	this._handleHeader(response.Header);

	// start poll timer if we didn't get an exception
	if (this._pollInterval)
		this._pollActionId = this._doPoll();

	this._clearPendingRequest(params.reqId);

	if (params.asyncMode && params.callback) {
		params.callback.run(result);
	}

	if (!params.asyncMode) {
		return response.Body;
	}
};

ZmZimbraMail.prototype.cancelRequest =
function(reqId, errorCallback) {
	if (!this._pendingRequests[reqId]) return;
	if (this._pendingRequests[reqId].state == ZmZimbraMail._RESPONSE) return;

	this._pendingRequests[reqId].state = ZmZimbraMail._CANCEL;
	this._shell.setBusy(false, reqId); // remove busy overlay
	DBG.println(AjxDebug.DBG1, "ZmZimbraMail.cancelRequest: " + reqId);
	this._pendingRequests[reqId].cancel();
	if (errorCallback) {
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
 * Processes the SOAP header that comes with a response. It updates the
 * change token, processes a <refresh> block if there is one (that happens
 * when a new session is created on the server), and handles notifications.
 *
 * @param hdr	[object]	a SOAP header
 */
ZmZimbraMail.prototype._handleHeader =
function(hdr) {
	if (!hdr) {
		return;
	}

	// update change token if we got one
	if (hdr && hdr.context && hdr.context.change) {
		this._changeToken = hdr.context.change.token;
	}

	// refresh block causes the overview panel to get updated
	if (hdr && hdr.context && hdr.context.refresh) {
		this._highestNotifySeen = 0;
		var resetTree = this._refreshHandler(hdr.context.refresh);
		this._checkOverviewLayout(false, resetTree);
	}

	// Handle notifications, then run the callback. Many callbacks take the SOAP
	// response data and update the model. If we run into scenarios where that needs
	// to happen before notifications are handled, then we may need to split the
	// callback into two routines, one to handle the SOAP response, and one to do
	// everything else. In general, it always makes sense to run the callback last.
	// That's especially important if the callback invokes another request, since if
	// the callback were run before notifications, you'd end up with a stack of
	// notifications running in inverted order.
	if (hdr && hdr.context && hdr.context.notify) {
        for(i = 0; i < hdr.context.notify.length; i++) {
        	var notify = hdr.context.notify[i];
        	var seq = notify.seq;
            // BUG?  What if the array isn't in sequence-order?  We would miss some notifications. Can that happen?
            if (notify.seq > this._highestNotifySeen) {
                DBG.println(AjxDebug.DBG1, "Handling notification[" + i + "] seq=" + seq);
                this._highestNotifySeen = seq;
                this._notifyHandler(notify);
            } else {
            	DBG.println(AjxDebug.DBG1, "SKIPPING notification[" + i + "] seq=" + seq + " highestNotifySeen=" + this._highestNotifySeen);
	      	}
    	}
	}

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

ZmZimbraMail.prototype.getActiveApp =
function() {
	return this._activeApp;
};

ZmZimbraMail.prototype.getPreviousApp =
function() {
	return this._previousApp;
};

/**
* Activates the given app.
*
* @param appName		[constant]		application
* @param force			[boolean]*		if true, launch the app
* @param callback		[AjxCallback]*	callback
* @param errorCallback	[AjxCallback]*	error callback
*/
ZmZimbraMail.prototype.activateApp =
function(appName, force, callback, errorCallback) {
    DBG.println(AjxDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);

    var view = this._appViewMgr.getAppView(appName);
    if (view && !force) {
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
		var respCallback = new AjxCallback(this, this._handleResponseActivateApp, [callback]);
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
			this._previousApp = this._activeApp;
	    }
	    // switch app
		this._activeApp = appName;
		toolbar.setCurrentApp(appName);
		toolbar.setViewTooltip(view, ZmMsg[ZmZimbraMail.VIEW_TT_KEY[appName]]);
		if (appName != ZmZimbraMail.MIXED_APP)
			this._appCtxt.getSearchController().setDefaultSearchType(ZmZimbraMail.DEFAULT_SEARCH[appName], true);
		this._checkOverviewLayout(true);
		// activate current app
		var app = this._apps[this._activeApp];
		if (app) app.activate(true, view);
	}
};

ZmZimbraMail.prototype.isChildWindow =
function() {
	return false;
};

// Private methods

ZmZimbraMail.prototype._preloadViews =
function() {

	// safari is slow on preloading so dont do it
	if (AjxEnv.isSafari) return;

	// preload the compose view
	var cc = this.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
	if (cc) {
		cc.initComposeView(true);
	}

	// preload the appointment compose view
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		var acc = this.getApp(ZmZimbraMail.CALENDAR_APP).getApptComposeController();
		if (acc) {
			acc.initApptComposeView(true);
		}
	}
};

ZmZimbraMail.prototype._killSplash =
function() {
	if (this._splashScreen)	this._splashScreen.setVisible(false);
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
function(force, resetTree) {
	if ((this._needOverviewLayout || force) && this._settings.userSettingsLoaded) {
		DBG.println(AjxDebug.DBG1, "laying out overview panel");
		var opc = this._appCtxt.getOverviewController();
		opc.set(ZmZimbraMail._OVERVIEW_ID, this._getOverviewTrees(this._activeApp), null, resetTree);
		this._components[ZmAppViewMgr.C_TREE] = opc.getOverview(ZmZimbraMail._OVERVIEW_ID);
		// clear shared folder dialogs so they'll be recreated with new folder tree
		this._appCtxt.clearFolderDialogs();
		this._needOverviewLayout = false;
	}
};

ZmZimbraMail.prototype._getOverviewTrees =
function(app) {
	var list = ZmZimbraMail.OVERVIEW_TREES[app];
	if (!(list && list.length)) return null;
	
	var trees = [];
	for (var i = 0; i < list.length; i++) {
		var id = list[i];
		if ((id == ZmOrganizer.SEARCH && !this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) ||
			(id == ZmOrganizer.CALENDAR && !this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) ||
			(id == ZmOrganizer.NOTEBOOK && !this._appCtxt.get(ZmSetting.NOTEBOOK_ENABLED)) ||
			(id == ZmOrganizer.ROSTER_TREE_ITEM && !this._appCtxt.get(ZmSetting.IM_ENABLED)) ||			
			(id == ZmOrganizer.TAG && !this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) ||
			(id == ZmOrganizer.ADDRBOOK && !this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)))
		{
			continue;
		}

		// dont show folders when viewing mixed app coming from contacts app
		// and dont show addrbooks when viewing mixed app coming from mail app
		if (this._activeApp == ZmZimbraMail.MIXED_APP) {
			if ((this._previousApp == ZmZimbraMail.CONTACTS_APP && id == ZmOrganizer.FOLDER) ||
				(this._previousApp == ZmZimbraMail.MAIL_APP && id == ZmOrganizer.ADDRBOOK))
			{
				continue;
			}
		}

		trees.push(id);
	}
	return trees;
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

	var size = AjxUtil.formatSize(usedQuota, false, 1);
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
		var progressClassName = "quotaUsed";
		if (percent < 85 && percent > 65)
			progressClassName = "quotaWarning";
		else if (percent >= 85)
			progressClassName = "quotaCritical";
		
		html[idx++] = "<td><div class='quotabar'><div style='width: " + percent + ";' class='" + progressClassName + "'></div></div></td>";
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
	
	var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80') ?
					  "" : ":" + location.port) + "/zimbra/" + window.location.search;
	ZmZimbraMail.sendRedirect(locationStr);
};

ZmZimbraMail._logOffListener = new AjxListener(null, ZmZimbraMail.logOff);

ZmZimbraMail.conditionalLogOff =
function() {
	if (window._zimbraMail && !window._zimbraMail._appViewMgr.isOkToLogOff(ZmZimbraMail._logOffListener)) {
		return;
	}
	ZmZimbraMail.logOff();
};

ZmZimbraMail.sendRedirect =
function(locationStr) {
	// not sure why IE doesn't allow this to process immediately, but since
	// it does not, we'll set up a timed action.
	if (AjxEnv.isIE) {
		var act = new AjxTimedAction(null, ZmZimbraMail.redir, [locationStr]);
		AjxTimedAction.scheduleAction(act, 1);
	} else {
		window.location = locationStr;
	}
};

ZmZimbraMail.redir =
function(locationStr){
	window.location = locationStr;
};

/**
* Resets the interval between poll requests, based on what's in the settings.
*/
ZmZimbraMail.prototype.setPollInterval =
function() {
	this._pollInterval = this._appCtxt.get(ZmSetting.POLLING_INTERVAL) * 1000;
	DBG.println(AjxDebug.DBG1, "poll interval = " + this._pollInterval + "ms");
	if (this._pollActionId)
		AjxTimedAction.cancelAction(this._pollActionId);
	if (this._pollInterval)
		this._pollActionId = this._doPoll();
};

ZmZimbraMail.prototype.setSessionTimer =
function(bStartTimer) {

	// ALWAYS set back reference into our world (also used by unload handler)
	window._zimbraMail = this;
	
	// if no timeout value, user's client never times out from inactivity	
	var timeout = this._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT) * 1000;
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

	// NOTE: we now save childWin w/in Object so other params can be added to it.
	// Otherwise, Safari breaks (see http://bugzilla.opendarwin.org/show_bug.cgi?id=7162)
	var newWinObj = new Object();
	newWinObj.win = childWin;

	this._childWinList.add(newWinObj);

	return newWinObj;
};

ZmZimbraMail.prototype.getChildWindow = 
function(childWin) {
	if (this._childWinList) {
		for (var i = 0; i < this._childWinList.size(); i++) {
			if (childWin == this._childWinList.get(i).win) {
				return this._childWinList.get(i);
			}
		}
	}
	return null;
};

ZmZimbraMail.prototype.removeChildWindow =
function(childWin) {
	if (this._childWinList) {
		for (var i = 0; i < this._childWinList.size(); i++) {
			if (childWin == this._childWinList.get(i).win) {
				this._childWinList.removeAt(i);
				break;
			}
		}
	}
};

// A <refresh> block is returned in a SOAP response any time the session ID has 
// changed. It always happens on the first SOAP command (GetInfoRequest).
// After that, it happens after a session timeout.
ZmZimbraMail.prototype._refreshHandler =
function(refresh) {
	DBG.println(AjxDebug.DBG2, "Handling REFRESH");

	var treeString = {};
	var unread = {};
	for (var i = 0; i < ZmZimbraMail.REFRESH_TREES.length; i++) {
		var treeId = ZmZimbraMail.REFRESH_TREES[i];
		var tree = this._appCtxt.getTree(treeId);
		if (!tree) {
			tree = (treeId == ZmOrganizer.TAG) ? new ZmTagTree(this._appCtxt) :
												 new ZmFolderTree(this._appCtxt, treeId);
			tree.addChangeListener(this._treeListener[treeId]);
			this._appCtxt.setTree(treeId, tree);
		}
		treeString[treeId] = tree.asString();
		if (treeId == ZmOrganizer.TAG || treeId == ZmOrganizer.FOLDER) {
			tree.getUnreadHash(unread);
		}
		tree.reset();
		if (treeId == ZmOrganizer.TAG) {
			tree.createRoot(); // tag tree root not in the DOM
		}
	}
	
	if (this._appCtxt.get(ZmSetting.IM_ENABLED)) {
		this.getApp(ZmZimbraMail.IM_APP).getRoster().reload();
	}

	if (refresh.tags) {
		this._appCtxt.getTree(ZmOrganizer.TAG).loadFromJs(refresh.tags);
	}
	// everything but tags comes in the <folder> block
	if (refresh.folder) {
		for (var i = 0; i < ZmZimbraMail.REFRESH_TREES.length; i++) {
			var treeId = ZmZimbraMail.REFRESH_TREES[i];
			var tree = this._appCtxt.getTree(treeId);
			if (tree && treeId != ZmOrganizer.TAG) {
				tree.loadFromJs(refresh.folder[0]);
			}
		}
	}
	
	var resetTree = {};
	for (var i = 0; i < ZmZimbraMail.REFRESH_TREES.length; i++) {
		var treeId = ZmZimbraMail.REFRESH_TREES[i];
		var tree = this._appCtxt.getTree(treeId);
		if (tree.asString() != treeString[treeId]) {
			// structure of tree changed (organizer added/removed/renamed/moved)
			DBG.println(AjxDebug.DBG2, treeId + ": " + treeString[treeId] + " / " + tree.asString());
			this._needOverviewLayout = resetTree[treeId] = true;
		} else if (treeId == ZmOrganizer.TAG || treeId == ZmOrganizer.FOLDER) {
			// handle change in unread count by notifying tree
			this._checkUnread(tree, unread);
		}
	}

	var inbox = this._appCtxt.getTree(ZmOrganizer.FOLDER).getById(ZmFolder.ID_INBOX);
	if (inbox) {
		this._statusView.setIconVisible(ZmStatusView.ICON_INBOX, inbox.numUnread > 0);
	}

	// LAME:
	var calController = this.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
	calController.refreshHandler();

	// XXX: temp, get additional share info (see bug #4434)
	if (refresh.folder) {
		this._getFolderPermissions([ZmOrganizer.CALENDAR, ZmOrganizer.NOTEBOOK, ZmOrganizer.ADDRBOOK]);
	}

	return resetTree;
};

ZmZimbraMail.prototype._getFolderPermissions =
function(items) {
	var needPermArr = [];

	for (var i = 0; i < items.length; i++) {
		this._getItemsWithoutPerms(needPermArr, items[i]);
	}

	// build batch request to get all permissions at once
	if (needPermArr.length > 0) {
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");

		var doc = soapDoc.getDoc();
		for (var j = 0; j < needPermArr.length; j++) {
			var folderRequest = soapDoc.set("GetFolderRequest");
			folderRequest.setAttribute("xmlns", "urn:zimbraMail");
			var folderNode = doc.createElement("folder");
			folderNode.setAttribute("l", needPermArr[j]);
			folderRequest.appendChild(folderNode);
		}

		var respCallback = new AjxCallback(this, this._handleResponseGetShares);
		this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

ZmZimbraMail.prototype._getItemsWithoutPerms =
function(needPermArr, item) {
	var treeData = this._appCtxt.getTree(item);
	var items = treeData && treeData.root
		? treeData.root.children.getArray()
		: null;

	for (var i = 0; i < items.length; i++) {
		if (items[i].link && items[i].shares == null)
			needPermArr.push(items[i].id);
	}
};

ZmZimbraMail.prototype._handleResponseGetShares =
function(result) {
	var resp = result.getResponse().BatchResponse.GetFolderResponse;
	if (resp) {
		for (var i = 0; i < resp.length; i++) {
			var link = resp[i].link ? resp[i].link[0] : null;
			if (link) {
				var tree;
				if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR])
					tree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
				else if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK])
					tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
				else if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK])
					tree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);

				var share = tree ? tree.getById(link.id) : null;
				if (share)
					share.setPermissions(link.perm);
			}
		}
	}
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
		tree._notify(ZmEvent.E_MODIFY, {organizers: organizers, fields: fields});
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
		if (notify.im && this._appCtxt.get(ZmSetting.IM_ENABLED))
			this.getApp(ZmZimbraMail.IM_APP).getRoster().handleNotification(notify.im);
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
// Check the item cache for each ID.
ZmZimbraMail.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	if (this._calController) this._calController.notifyDelete(ids);

	for (var i = 0; i < ids.length; i++) {
		var item = this._appCtxt.cacheGet(ids[i]);
		DBG.println(AjxDebug.DBG2, "handling delete notif for ID " + ids[i]);
		if (item)
			item.notifyDelete();
		// REVISIT: Use app item cache
		else {
			var notebookApp = this.getApp(ZmZimbraMail.NOTEBOOK_APP);
			var cache = notebookApp.getNotebookCache();
			var page = cache.getPageById(ids[i]);
			if (page) {
				cache.removePage(page);
			}
		}
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
		// ignore create notif for item we already have
		if (this._appCtxt.cacheGet(create.id)) {
			continue;
		}
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
			var notebookTree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
			var addrBookTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
			// parent could be a folder or a search
			if (parentId == ZmOrganizer.ID_ROOT) {
				if (name == "folder") {
					if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR])
						parent = calendarTree.getById(parentId);
					else if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
						DBG.println("notebook tree");
						parent = notebookTree.getById(parentId);
					}
					else if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK])
						parent = addrBookTree.getById(parentId);
					else
						parent = folderTree.getById(parentId);
				} else {
					parent = searchTree.getById(parentId);
				}
			/*** REVISIT: temporary until we get dedicated folder ***/
			} else if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				parent = notebookTree.getById(parentId);
			/***/
			} else {
				parent = folderTree.getById(parentId);
				if (!parent) parent = searchTree.getById(parentId);
				if (!parent) parent = calendarTree.getById(parentId);
				if (!parent) parent = notebookTree.getById(parentId);
				if (!parent) parent = addrBookTree.getById(parentId);
			}
			if (parent)
				parent.notifyCreate(create, (name == "search"));
		} else if (name == "link") {
			var parentId = create.l;
			var parent;
			var share;
			if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR]) {
				var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
				parent = calendarTree.getById(parentId);
				share = ZmOrganizer.CALENDAR;
			} else if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				var notebookTree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
				parent = notebookTree.getById(parentId);
				share = ZmOrganizer.NOTEBOOK;
			} else if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]) {
				var addrbookTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
				parent = addrbookTree.getById(parentId);
				share = ZmOrganizer.ADDRBOOK;
			}

			if (parent) {
				parent.notifyCreate(create, true);
				// XXX: once bug #4434 is fixed, check if this call is still needed
				this._getFolderPermissions([share]);
			}
		} else if (name == "w") {
			// REVISIT: use app context item cache
			var notebookApp = this.getApp(ZmZimbraMail.NOTEBOOK_APP);
			var cache = notebookApp.getNotebookCache();
			var page = new ZmPage(this._appCtxt);
			page.set(create);
			cache.putPage(page);
			
			// re-render current page, if necessary
			var notebookController = notebookApp.getNotebookController();
			var shownPage = notebookController.getPage();
			if (shownPage && shownPage.name == ZmNotebook.PAGE_INDEX) {
				notebookController.gotoPage(shownPage);
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

	var lastMove = null;
	for (var i = 0; i < list.length; i++)
		if (list[i].l)
			lastMove = i;
	if (lastMove != null)
		list[lastMove].lastModify = true;
	
	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		var id = mod.id;
		var name = mod._name;

		if (name == "mbx") {
			var setting = this._settings.getSetting(ZmSetting.QUOTA_USED);
			setting.notifyModify(mod);
			continue;
		}
		if (name == "w" && id) {
			// REVISIT: Use app context item cache
			var notebookApp = this.getApp(ZmZimbraMail.NOTEBOOK_APP);
			var cache = notebookApp.getNotebookCache();
			var page = cache.getPageById(mod.id);
			if (!page) {
				page = new ZmPage(this._appCtxt);
				page.set(mod);
				cache.putPage(page);
			}
			else {
				page.notifyModify(mod);
				page.set(mod);
			}
			
			// re-render current page, if necessary
			var notebookController = notebookApp.getNotebookController();
			var shownPage = notebookController.getPage();
			if (shownPage && shownPage.folderId == page.folderId) {
				if (shownPage.name == ZmNotebook.PAGE_INDEX || shownPage.name == page.name) {
					notebookController.gotoPage(shownPage);
				}
			}
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

/*
* Sends a delayed NoOpRequest to see if we get any notifications (eg new mail). Ignores
* exceptions unless they're auth-related.
*/
ZmZimbraMail.prototype._doPoll =
function(now) {
	this._pollActionId = null; // so we don't try to cancel
	
	// It'd be more efficient to make these instance variables, but for some
	// reason that breaks polling in IE.
	var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	var errorCallback = new AjxCallback(this, this._handleErrorDoPoll);
	var pollParams = {soapDoc: soapDoc, asyncMode: true, errorCallback: errorCallback, noBusyOverlay: true};
	var pollAction = new AjxTimedAction(this, this.sendRequest, [pollParams]);
	return AjxTimedAction.scheduleAction(pollAction, (now ? 0 : this._pollInterval));
};

ZmZimbraMail.prototype._handleErrorDoPoll =
function(ex) {
	return (ex.code != ZmCsfeException.SVC_AUTH_EXPIRED &&
			ex.code != ZmCsfeException.SVC_AUTH_REQUIRED &&
			ex.code != ZmCsfeException.NO_AUTH_TOKEN);
};

ZmZimbraMail._userEventHdlr =
function(ev) {
	var zm = window._zimbraMail;
	if (zm) {
		// cancel old timer and start a new one
		AjxTimedAction.cancelAction(zm._sessionTimerId);
		var timeout = zm._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT) * 1000;
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
	} else if (setting.id == ZmSetting.POLLING_INTERVAL) {
		this.setPollInterval();
	} else if (setting.id == ZmSetting.SKIN_NAME) {
		var cd = this._confirmDialog = this._appCtxt.getYesNoMsgDialog();
		cd.reset();
		cd.registerCallback(DwtDialog.YES_BUTTON, this._newSkinYesCallback, this);
		cd.setMessage(ZmMsg.skinChangeRestart, DwtMessageDialog.WARNING_STYLE);
		cd.popup();
	}
};

ZmZimbraMail.prototype._newSkinYesCallback =
function() {
	this._confirmDialog.popdown();
    window.onbeforeunload = null;
    ZmZimbraMail.sendRedirect(location.toString()); // redirect to self to force reload
};

/*
* Changes the browser title if it's a folder or tag whose unread
* count just changed.
*/
ZmZimbraMail.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		var organizers = ev.getDetail("organizers");
		var organizer = organizers ? organizers[0] : null;
		var id = organizer ? organizer.id : null;
		if (fields && fields[ZmOrganizer.F_UNREAD]) {
			var search = this._appCtxt.getCurrentSearch();
			if (search && id && (id == search.folderId || id == search.tagId))
				Dwt.setTitle(search.getTitle());
			if (id == ZmFolder.ID_INBOX) {
				this._statusView.setIconVisible(ZmStatusView.ICON_INBOX,  organizer.numUnread > 0);
			}
		}		
	}
};

ZmZimbraMail.prototype._calendarChangeListener =
function(ev) {
	// TODO
};
ZmZimbraMail.prototype._notebookChangeListener =
function(ev) {
	// TODO
};

ZmZimbraMail.prototype._addrBookChangeListener =
function(ev) {
	// TODO
};

ZmZimbraMail.prototype._searchChangeListener =
function(ev) {
	// TODO
};

ZmZimbraMail.prototype._createBanner =
function() {
	// The LogoContainer style centers the logo
	var banner = new DwtComposite(this._shell, null, Dwt.ABSOLUTE_STYLE);
	var html = [];
	var i = 0;
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 style='width:100%;height:100%'>";
	html[i++] = "<tr><td align='center' valign='middle'>";
	html[i++] = "<a href='";
	html[i++] = this._appCtxt.get(ZmSetting.LOGO_URI);
	html[i++] = "' target='_blank'><div class='";
	html[i++] = AjxImg.getClassForImage("AppBanner");
	html[i++] = "'></div></a></td></tr></table>";
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
	html[i++] = "<tr><td><div class='BannerTextUser' id='";
	html[i++] = userNameId;
	html[i++] = "'></div></td></tr>";
	html[i++] = "<tr><td><div id='";
	html[i++] = usedQuotaId;
	html[i++] = "'></div></td></tr>";
	html[i++] = "</table>";
	userInfo.getHtmlElement().innerHTML = html.join("");

	this._userNameField = document.getElementById(userNameId);
	this._usedQuotaField = document.getElementById(usedQuotaId);
	
	return userInfo;
};

ZmZimbraMail.prototype._createAppChooser =
function() {
	var buttons = [];
	for (var i = 0; i < ZmZimbraMail.APPS.length; i++) {
		var app = ZmZimbraMail.APPS[i];
		var setting = ZmZimbraMail.APP_SETTING[app];
		if (!setting || this._appCtxt.get(setting)) {
			buttons.push(ZmZimbraMail.APP_BUTTON[app]);
		}
	}
	buttons.push(ZmAppChooser.SPACER, ZmAppChooser.B_HELP, ZmAppChooser.B_OPTIONS, ZmAppChooser.B_LOGOUT);
	var appChooser = new ZmAppChooser(this._shell, null, buttons);
	
	var buttonListener = new AjxListener(this, this._appButtonListener);
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == ZmAppChooser.SPACER) continue;
		var b = appChooser.getButton(id);
		b.addSelectionListener(buttonListener);
	}

	return appChooser;
};

ZmZimbraMail.prototype.setStatusMsg =
function(msg, level, detail, delay, transition) {
	this._statusView.setStatusMsg(msg, level, detail, delay, transition);
};

ZmZimbraMail.prototype.setStatusIconVisible =
function(icon, visible) {
	this._statusView.setIconVisible(icon, visible);
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
			// force launch to display all contacts
			this.activateApp(ZmZimbraMail.CONTACTS_APP);
		} else if (id == ZmAppChooser.B_CALENDAR) {
			this.activateApp(ZmZimbraMail.CALENDAR_APP);
		} else if (id == ZmAppChooser.B_IM) {
			this.activateApp(ZmZimbraMail.IM_APP);			
		} else if (id == ZmAppChooser.B_NOTEBOOK) {
			this.activateApp(ZmZimbraMail.NOTEBOOK_APP);
		} else if (id == ZmAppChooser.B_HELP) {
			window.open(this._appCtxt.get(ZmSetting.HELP_URI));
		} else if (id == ZmAppChooser.B_OPTIONS) {
			this.activateApp(ZmZimbraMail.PREFERENCES_APP);
		} else if (id == ZmAppChooser.B_LOGOUT) {
			ZmZimbraMail.conditionalLogOff();
		}
	} catch (ex) {
		this._handleException(ex, this._appButtonListener, ev, false);
	}
};

ZmZimbraMail.prototype.getKeyMapName =
function() {
	var curView = this._appViewMgr.getCurrentView();
	if (curView && curView.getController) {
		var ctlr = curView.getController();
		if (ctlr && ctlr.getKeyMapName) {
			return ctlr.getKeyMapName();
		}
	}
	return "Global";
};

ZmZimbraMail.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {
		case ZmKeyMap.DBG_NONE:
			this._appCtxt.setStatusMsg("Setting Debug Level To: " + AjxDebug.NONE);
			DBG.setDebugLevel(AjxDebug.NONE);
			break;
			
		case ZmKeyMap.DBG_1:
			this._appCtxt.setStatusMsg("Setting Debug Level To: " + AjxDebug.DBG1);
			DBG.setDebugLevel(AjxDebug.DBG1);
			break;
			
		case ZmKeyMap.DBG_2:
			this._appCtxt.setStatusMsg("Setting Debug Level To: " + AjxDebug.DBG2);
			DBG.setDebugLevel(AjxDebug.DBG2);
			break;
			
		case ZmKeyMap.DBG_3:
			this._appCtxt.setStatusMsg("Setting Debug Level To: " + AjxDebug.DBG3);
			DBG.setDebugLevel(AjxDebug.DBG3);
			break;
			
		case ZmKeyMap.DBG_TIMING: {
			var on = DBG._showTiming;
			var newState = on ? "off" : "on";
			this._appCtxt.setStatusMsg("Turning Timing Info " + newState);
			DBG.showTiming(!on);
			break;
		}
		
		case ZmKeyMap.GOTO_MAIL:
		case ZmKeyMap.GOTO_CONTACTS:
		case ZmKeyMap.GOTO_CALENDAR:
		case ZmKeyMap.GOTO_IM:
		case ZmKeyMap.GOTO_OPTIONS:
		case ZmKeyMap.GOTO_NOTEBOOK: {
			var app = ZmZimbraMail.ACTION_CODE_TO_APP[actionCode];
			if (app == this.getActiveApp()) {
				return false;
			}
			var setting = ZmZimbraMail.APP_SETTING[app];
			if (!setting || this._appCtxt.get(setting)) {
				this.activateApp(app);
			}
			break;
		}

		case ZmKeyMap.ASSISTANT: {
			if (this._assistantDialog == null)
				this._assistantDialog = new ZmAssistantDialog(this._appCtxt);
			this._assistantDialog.popup();
			break;
		}
		
		case ZmKeyMap.LOGOFF: {
			ZmZimbraMail.conditionalLogOff();
			break;
		}
			
		default: {
			var curView = this._appViewMgr.getCurrentView();
			if (curView && curView.getController) {
				var ctlr = curView.getController();
				if (ctlr && ctlr.handleKeyAction) {
					return ctlr.handleKeyAction(actionCode, ev);
				}
			} else {
				return false;
			}
			break;
		}
	}
	return true;
};
