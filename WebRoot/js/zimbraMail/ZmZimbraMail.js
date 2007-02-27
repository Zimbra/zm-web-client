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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
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

	this._requestMgr = new ZmRequestMgr(appCtxt, this, domain);

	// settings structure and defaults
	this._settings = appCtxt.getSettings();
    var listener = new AjxListener(this, this._settingsChangeListener);
	this._settings.getSetting(ZmSetting.QUOTA_USED).addChangeListener(listener);
	this._settings.getSetting(ZmSetting.POLLING_INTERVAL).addChangeListener(listener);
	this._settings.getSetting(ZmSetting.SKIN_NAME).addChangeListener(listener);
	this._settings.getSetting(ZmSetting.SHORTCUTS).addChangeListener(listener);

	appCtxt.setAppController(this);
	appCtxt.setClientCmdHdlr(new ZmClientCmdHandler(appCtxt));

	this._shell = appCtxt.getShell();

	if (location.search && (location.search.indexOf("nss=1") != -1)) {
		this._splashScreen = null;
	} else {
   	    this._splashScreen = new ZmSplashScreen(this._shell, "SplashScreen");
	}

	this._apps = {};
	this._activeApp = null;

	this._sessionTimer = new AjxTimedAction(null, ZmZimbraMail.logOff);
	this._sessionTimerId = -1;

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

// REVISIT: This is done so that we when we switch from being "beta"
//          to production, we don't have to ensure that all of the
//          translations are changed at the same time. We can simply
//          remove the beta suffix from the app name.
ZmMsg.BETA_documents = [ZmMsg.documents, ZmMsg.beta].join(" ");

// app names
ZmZimbraMail.MSG_KEY = {};
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MAIL_APP]				= "mail";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CONTACTS_APP]			= "addressBook";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CALENDAR_APP]			= "calendar";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.IM_APP]				= "imAppTitle";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.NOTEBOOK_APP]			= "BETA_documents";
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
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.NOTEBOOK_APP]	= ZmItem.PAGE;

// trees shown in overview panel for each app
ZmZimbraMail.OVERVIEW_TREES = {};
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MAIL_APP]			= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CONTACTS_APP]		= [ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.CALENDAR_APP]		= [ZmOrganizer.CALENDAR, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.PREFERENCES_APP]	= [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.IM_APP]			= [ZmOrganizer.ROSTER_TREE_ITEM, ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.NOTEBOOK_APP]		= [ZmOrganizer.NOTEBOOK, /*ZmOrganizer.SEARCH,*/ ZmOrganizer.TAG,ZmOrganizer.ZIMLET];
ZmZimbraMail.OVERVIEW_TREES[ZmZimbraMail.MIXED_APP]			= [ZmOrganizer.FOLDER, ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG, ZmOrganizer.ZIMLET];

// trees to hide if they have no data
ZmZimbraMail.HIDE_EMPTY = {};
ZmZimbraMail.HIDE_EMPTY[ZmOrganizer.SEARCH]	= true;
ZmZimbraMail.HIDE_EMPTY[ZmOrganizer.ZIMLET]	= true;

// types of saved searches to show
ZmZimbraMail.SEARCH_TYPES = {};
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.MAIL_APP]		= [ZmItem.MSG, ZmItem.CONV];
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.CONTACTS_APP]	= [ZmItem.CONTACT];
ZmZimbraMail.SEARCH_TYPES[ZmZimbraMail.PREFERENCES_APP]	= [ZmItem.MSG, ZmItem.CONV];
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
ZmZimbraMail.REFRESH_TREES = [ZmOrganizer.FOLDER, ZmOrganizer.TAG, ZmOrganizer.SEARCH,
							  ZmOrganizer.ADDRBOOK, ZmOrganizer.CALENDAR, ZmOrganizer.NOTEBOOK];

ZmZimbraMail.defaultStartApp = ZmZimbraMail.MAIL_APP;

ZmZimbraMail._PREFS_ID	= 1;
ZmZimbraMail._HELP_ID	= 2;
ZmZimbraMail._LOGOFF_ID	= 3;

ZmZimbraMail._OVERVIEW_ID = "ZmZimbraMail";

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
			childWin.win.onbeforeunload = null;
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
	
	if (typeof(skin) == "undefined") {
		DBG.println(AjxDebug.DBG1, "No skin!");
		var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80') ?
					  "" : ":" + location.port) + "/public/skinError.jsp?skin=" + appCurrentSkin;
		ZmZimbraMail.sendRedirect(locationStr);
        return;
    }

	if (!this._appViewMgr) {
		this._appViewMgr = new ZmAppViewMgr(this._shell, this, false, true);
	}

	skin.showSkin(true);
	this._TAB_SKIN_ENABLED = skin.hints && skin.hints.app_chooser.style == "tabs";
	if (!this._components) {
		this._components = {};
		this._components[ZmAppViewMgr.C_SASH] = new DwtSash(this._shell, DwtSash.HORIZONTAL_STYLE, "console_inset_app_l", 20);
		this._components[ZmAppViewMgr.C_BANNER] = this._createBanner();
		this._components[ZmAppViewMgr.C_USER_INFO] = this._userNameField = this._createUserInfo();
		this._components[ZmAppViewMgr.C_QUOTA_INFO] = this._usedQuotaField = this._createUserInfo();
		var currentAppToolbar = new ZmCurrentAppToolBar(this._shell, this._TAB_SKIN_ENABLED);
		this._appCtxt.setCurrentAppToolbar(currentAppToolbar);
		this._components[ZmAppViewMgr.C_CURRENT_APP] = currentAppToolbar;
		this._components[ZmAppViewMgr.C_STATUS] = this._statusView = new ZmStatusView(this._shell, "ZmStatus", Dwt.ABSOLUTE_STYLE);
	}

	var respCallback = new AjxCallback(this, this._handleResponseStartup, params);
	this._errorCallback = new AjxCallback(this, this._handleErrorStartup, params);
	this._settings.loadUserSettings(respCallback, this._errorCallback); // load user prefs and COS data
};

ZmZimbraMail.prototype._handleErrorStartup =
function(params, ex) {
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
		// temporarily change the value of initial search to "in:inbox"
		var oldInitSearch = this._appCtxt.get(ZmSetting.INITIAL_SEARCH);
		this._appCtxt.set(ZmSetting.INITIAL_SEARCH, "in:inbox", null, null, true);
		this._handleResponseStartup(params);
		this._appCtxt.set(ZmSetting.INITIAL_SEARCH, oldInitSearch, null, null, true);
	} else {
		this._killSplash();
	}
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

	var kbMgr = this._appCtxt.getKeyboardMgr();
	if (this._appCtxt.get(ZmSetting.USE_KEYBOARD_SHORTCUTS)) {
		// Register our keymap and global key action handler with the shell's keyboard manager
		kbMgr.enable(true);
		kbMgr.registerKeyMap(new ZmKeyMap(this._appCtxt));
		kbMgr.pushDefaultHandler(this);

		DBG.println(AjxDebug.DBG2, "SETTING SEARCH CONTROLLER TAB GROUP");
		var rootTg = this._appCtxt.getRootTabGroup();
		rootTg.addMember(this._appCtxt.getSearchController().getTabGroup());
		// Add dummy app view tab group. This will get replaced right away when the
		// app view comes into play
		var dummyTg = new DwtTabGroup("DUMMY APPVIEW");
		ZmController._setCurrentAppViewTabGroup(dummyTg);
		rootTg.addMember(dummyTg);
		var appChooserTg = new DwtTabGroup("ZmAppChooser");
		appChooserTg.addMember(this._components[ZmAppViewMgr.C_APP_CHOOSER]);
		rootTg.addMember(appChooserTg);
		var kbMgr = this._appCtxt.getKeyboardMgr();
		kbMgr.setTabGroup(rootTg);
		
		this._settings._loadShortcuts();
	} else {
		kbMgr.enable(false);
	}

	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		this._calController = this.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		if (this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
			this.getApp(ZmZimbraMail.CALENDAR_APP).showMiniCalendar(true);
		}
	}

	this._preloadViews();

	this._handleResponseStartup1(params);
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

	// check for jump to compose page or msg view
	var checkQS = false;
	var match;
	if (location.search && (match = location.search.match(/\bview=(\w+)\b/))) {
		var view = match[1];
		if (view == "compose" || view == "msg") {
			startApp = ZmZimbraMail.MAIL_APP;
			checkQS = true;
		}
	}
	this.activateApp(startApp, false, respCallback, this._errorCallback, checkQS);
	this.setStatusMsg(ZmMsg.initializationComplete, null, null, null, ZmStatusView.TRANSITION_INVISIBLE);
};

/*
* Startup: part 4
* Kills the splash screen, checks license
*/
ZmZimbraMail.prototype._handleResponseStartup2 =
function() {
	this.setSessionTimer(true);
	this._killSplash();
	this._appViewMgr.addComponents(this._components, true);

	if (this._appCtxt.get(ZmSetting.LICENSE_STATUS) != ZmSetting.LICENSE_GOOD) {
		var dlg = this._appCtxt.getMsgDialog();
		dlg.reset();
		dlg.setMessage(ZmMsg.licenseExpired, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	}

    if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
        var controller = this.getApp(ZmZimbraMail.CALENDAR_APP).getReminderController();
        controller.refresh();
    }

    // Back out code below (bug 10140) pending further investigation
	// Setup an async load of the views we precreate
//	var ta = new AjxTimedAction(this, ZmZimbraMail.prototype._preloadViews);
//	AjxTimedAction.scheduleAction(ta, 500);
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

ZmZimbraMail.prototype.sendRequest =
function(params) {
	return this._requestMgr.sendRequest(params);
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
* @param checkQS		[boolean]*		if true, check query string for launch args
*/
ZmZimbraMail.prototype.activateApp =
function(appName, force, callback, errorCallback, checkQS) {
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
    	if (!this._apps[appName]) {
			this._createApp(appName);
    	}
		DBG.println(AjxDebug.DBG1, "Launching app " + appName);
		var respCallback = new AjxCallback(this, this._handleResponseActivateApp, [callback]);
		this._apps[appName].launch(respCallback, errorCallback, checkQS);
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
	// update app chooser
	this._components[ZmAppViewMgr.C_APP_CHOOSER].setSelected(ZmZimbraMail.APP_BUTTON[appName]);

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
	if (this._TAB_SKIN_ENABLED) {
		var hideIcon = skin.hints && skin.hints.help_button.hideIcon;
		this._setUserInfoLink("ZmZimbraMail.helpLinkCallback();", "Help", ZmMsg.help, "skin_container_help", hideIcon);
		hideIcon = skin.hints && skin.hints.logout_button.hideIcon;
		this._setUserInfoLink("ZmZimbraMail.conditionalLogOff();", "Logoff", ZmMsg.logOff, "skin_container_logoff", hideIcon);
	}

	var login = this._appCtxt.get(ZmSetting.USERNAME);
	var username = (this._appCtxt.get(ZmSetting.DISPLAY_NAME)) || login;
	if (username) {
		this._userNameField.getHtmlElement().innerHTML = username;
		if (AjxEnv.isLinux)	// bug fix #3355
			this._userNameField.getHtmlElement().style.lineHeight = "13px";
	}

	var userTooltip = (username != login) ? login : null;
	var quota = this._appCtxt.get(ZmSetting.QUOTA);
	var usedQuota = (this._appCtxt.get(ZmSetting.QUOTA_USED)) || 0;
	var size = AjxUtil.formatSize(usedQuota, false, 1);
	var quotaTooltip = null;

	var html = [];
	var idx = 0;
	html[idx++] = "<center><table border=0 cellpadding=0 cellspacing=0 class='BannerBar'><tr";
	html[idx++] = AjxEnv.isLinux ? " style='line-height: 13px'" : ""; // bug #3355;
	html[idx++] = "><td class='BannerTextQuota'>";
	html[idx++] = ZmMsg.quota;
	html[idx++] = ": </td>";
	if (quota) {
		var limit = AjxUtil.formatSize(quota, false, 1);
		var percent = Math.min(Math.round((usedQuota / quota) * 100), 100);
		
		// set background color based on percent used
		var progressClassName = "quotaUsed";
		if (percent < 85 && percent > 65)
			progressClassName = "quotaWarning";
		else if (percent >= 85)
			progressClassName = "quotaCritical";

		html[idx++] = "<td><div class='quotabar'><div style='width: ";
		html[idx++] = percent;
		html[idx++] = ";' class='";
		html[idx++] = progressClassName;
		html[idx++] = "'></div></div></td>";

		var desc = AjxMessageFormat.format(ZmMsg.quotaDescLimited, [size, limit]);
		quotaTooltip = [ZmMsg.quota, ": ", percent, "% ", desc].join("");
	} else {
		var desc = AjxMessageFormat.format(ZmMsg.quotaDescUnlimited, [size]);
		html[idx++] = "<td class='BannerTextQuota'>";
		html[idx++] = desc;
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr></table></center>";

	if (!(skin.hints && skin.hints.help_button.hideIcon))
		this._usedQuotaField.getHtmlElement().innerHTML = html.join("");

	if (userTooltip || quotaTooltip) {
		var tooltip = [];
		idx = 0;
		tooltip[idx++] = "<table>";
		if (userTooltip) {
			tooltip[idx++] = "<tr><td>";
			tooltip[idx++] = userTooltip;
			tooltip[idx++] = "</td></tr>";
		}
		if (quotaTooltip) {
			tooltip[idx++] = "<tr><td><center>";
			tooltip[idx++] = quotaTooltip;
			tooltip[idx++] = "</center></td></tr>";
		}
		tooltip[idx++] = "</table>";
		this._components[ZmAppViewMgr.C_USER_INFO].setToolTipContent(tooltip.join(""));
		this._components[ZmAppViewMgr.C_QUOTA_INFO].setToolTipContent(tooltip.join(""));
	}
};

ZmZimbraMail.prototype._setUserInfoLink =
function(staticFunc, icon, lbl, id, hideIcon) {
	var html = [];
	var i = 0;
	html[i++] = "<table border=0 cellpadding=1 cellspacing=1 align=right width=1%><tr>";
	if (!hideIcon) {
		html[i++] = "<td align=right><a href='javascript:;' onclick='";
		html[i++] = staticFunc;
		html[i++] = "'>";
		html[i++] = AjxImg.getImageHtml(icon, null, "border=0");
		html[i++] = "</a></td>";
	}
	html[i++] = "<td width=1% align=right style='white-space:nowrap; font-weight:bold'><a href='javascript:;' onclick='";
	html[i++] = staticFunc;
	html[i++] = "'>";
	html[i++] = lbl;
	html[i++] = "</a></td></tr></table>";

	var cell = document.getElementById(id);
	if (cell) cell.innerHTML = html.join("");
};

// Listeners

ZmZimbraMail.logOff =
function() {

	// stop keeping track of user input (if applicable)
	if (window._zimbraMail)
		window._zimbraMail.setSessionTimer(false);

	ZmCsfeCommand.clearAuthToken();
	
	window.onbeforeunload = null;
	
	var port = (location.port == '80') ? "" : [":", location.port].join("");
	var locationStr = [location.protocol, "//", location.hostname, port].join("");
	if (appContextPath) {
		locationStr = [locationStr, appContextPath].join("/");
	}
	locationStr = [locationStr, location.search].join("");
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

ZmZimbraMail.helpLinkCallback =
function() {
	ZmZimbraMail.unloadHackCallback();

	var appCtxt = window.parentController
		? window.parentController._appCtxt
		: window._zimbraMail._appCtxt;

	window.open(appCtxt.get(ZmSetting.HELP_URI));
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

/*
* Common exception handling entry point.
*
* @param ex	[Object]		the exception
* 
*/
ZmZimbraMail.prototype._handleException =
function(ex, method, params, restartOnError, obj) {
	var handled = false;
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER) {
		var organizerTypes = [ZmOrganizer.CALENDAR, ZmOrganizer.NOTEBOOK, ZmOrganizer.ADDRBOOK];
		if (ex.data.itemId && ex.data.itemId.length) {
			var itemId = ex.data.itemId[0];
			var index = itemId.lastIndexOf(':');
			var zid = itemId.substring(0, index);
			var rid = itemId.substring(index + 1, itemId.length);
			for (var type = 0; type < organizerTypes.length; type++) {
				handled |= this._requestMgr._handleNoSuchFolderError(organizerTypes[type], zid, rid, true);
			}
		}
	}
	if (!handled) {
		ZmController.prototype._handleException.call(this, ex, method, params, restartOnError, obj);
	}
};

// This method is called by the window.onbeforeunload method.
ZmZimbraMail._confirmExitMethod =
function() {
	return ZmMsg.appExitWarning;
};

ZmZimbraMail.unloadHackCallback =
function() {
	window.onbeforeunload = null;
	var f = function() { window.onbeforeunload = ZmZimbraMail._confirmExitMethod; };
	var t = new AjxTimedAction(null, f);
	AjxTimedAction.scheduleAction(t, 3000);
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
	
	var id = ev.source.id;
	if (id == ZmSetting.QUOTA_USED) {
		this._setUserInfo();
	} else if (id == ZmSetting.POLLING_INTERVAL) {
		this.setPollInterval();
	} else if (id == ZmSetting.SKIN_NAME) {
		var cd = this._confirmDialog = this._appCtxt.getYesNoMsgDialog();
		cd.reset();
		var skin = ev.source.getValue();
		cd.registerCallback(DwtDialog.YES_BUTTON, this._newSkinYesCallback, this, [skin]);
		cd.setMessage(ZmMsg.skinChangeRestart, DwtMessageDialog.WARNING_STYLE);
		cd.popup();
	} else if (id == ZmSetting.SHORTCUTS) {
		this._appCtxt.getKeyboardMgr().registerKeyMap(new ZmKeyMap(this._appCtxt));
		this._settings._loadShortcuts();
	}
};

ZmZimbraMail.prototype._newSkinYesCallback =
function(skin) {
	this._confirmDialog.popdown();
    window.onbeforeunload = null;
    var qs = AjxStringUtil.queryStringSet(location.search, "skin", skin);
	var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80') ?
					  "" : ":" + location.port) + location.pathname + qs;
	DBG.println(AjxDebug.DBG1, "skin change, redirect to: " + locationStr);
    ZmZimbraMail.sendRedirect(locationStr); // redirect to self to force reload
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
	var logoUrl = skin.hints && skin.hints.logo && skin.hints.logo.url ? skin.hints.logo.url : this._appCtxt.get(ZmSetting.LOGO_URI);
	var html = [];
	var i = 0;
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 style='width:100%;height:100%'>";
	html[i++] = "<tr><td align='center' valign='middle'>";
	html[i++] = "<a href='";
	html[i++] = logoUrl;
	html[i++] = "' target='_blank'><div class='";
	html[i++] = AjxImg.getClassForImage("AppBanner");
	html[i++] = "'></div></a></td></tr></table>";
	banner.getHtmlElement().innerHTML = html.join("");
	return banner;
};

ZmZimbraMail.prototype._createUserInfo =
function() {
	var ui = new DwtComposite(this._shell, "BannerTextUser", Dwt.ABSOLUTE_STYLE);
	ui.setScrollStyle(Dwt.CLIP);
	ui._setMouseEventHdlrs();
	return ui;
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

	if (!this._TAB_SKIN_ENABLED) {
		buttons.push(ZmAppChooser.SPACER, ZmAppChooser.B_HELP);
		if (this._appCtxt.get(ZmSetting.PREFS_ENABLED)) {
			buttons.push(ZmAppChooser.B_OPTIONS);
		}
		buttons.push(ZmAppChooser.B_LOGOUT);
	} else {
		if (this._appCtxt.get(ZmSetting.PREFS_ENABLED)) {
			buttons.push(ZmAppChooser.B_OPTIONS);
		}
	}

	var appChooser = new ZmAppChooser(this._shell, null, buttons, this._TAB_SKIN_ENABLED);
	
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
		DBG.println(AjxDebug.DBG1, "ZmZimbraMail button press: " + id);
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
