/**
* Creates a controller to run LiquidMail. Do not call directly, instead use the run()
* factory method.
* @constructor
* @class
* This class is the "ubercontroller", as it manages all the apps as well as bootstrapping
* the LiquidMail application.
*
* @param appCtxt		the app context (global storage)
* @param domain			current domain
* @param app			starting app
*/
function LmLiquidMail(appCtxt, domain, app, userShell) {

	LmController.call(this, appCtxt);

	this._userShell = userShell;

	// settings structure and defaults
	this._settings = appCtxt.getSettings();
	DBG.println(LsDebug.DBG1, "Branch: " + appCtxt.get(LmSetting.BRANCH));
	this._settings.addChangeListener(new LsListener(this, this._settingsChangeListener));

	LsCsfeCommand.setServerUri(location.protocol + "//" + domain + appCtxt.get(LmSetting.CSFE_SERVER_URI));

	appCtxt.setAppController(this);
	appCtxt.setClientCmdHdlr(new LmClientCmdHandler(appCtxt));

	this._shell = appCtxt.getShell();
    this._splashScreen = new LmSplashScreen(this._shell, LmImg.M_SPLASH);
   
	this._apps = new Object();
	this._activeApp = null;
	
	this._pollActionId = null;
	this._sessionTimer = new LsTimedAction();
	this._sessionTimer.method = LmLiquidMail.logOff;
	this._models = new LsVector();
	this._needOverviewLayout = false;
	this._unreadListener = new LsListener(this, this._unreadChangeListener);	

	this._schedule(this.startup, {app: app});
}

LmLiquidMail.prototype = new LmController;
LmLiquidMail.prototype.constructor = LmLiquidMail;

LmLiquidMail.MAIL_APP			= "mail";
LmLiquidMail.CONTACTS_APP		= "contacts";
LmLiquidMail.CALENDAR_APP		= "calendar";
LmLiquidMail.PREFERENCES_APP	= "options";
LmLiquidMail.MIXED_APP			= "mixed";

LmLiquidMail.APP_CLASS = new Object();
LmLiquidMail.APP_CLASS[LmLiquidMail.MAIL_APP]			= LmMailApp;
LmLiquidMail.APP_CLASS[LmLiquidMail.CONTACTS_APP]		= LmContactsApp;
LmLiquidMail.APP_CLASS[LmLiquidMail.CALENDAR_APP]		= LmCalendarApp;
LmLiquidMail.APP_CLASS[LmLiquidMail.PREFERENCES_APP]	= LmPreferencesApp;
LmLiquidMail.APP_CLASS[LmLiquidMail.MIXED_APP]			= LmMixedApp;

LmLiquidMail.MSG_KEY = new Object();
LmLiquidMail.MSG_KEY[LmLiquidMail.MAIL_APP]			= "email";
LmLiquidMail.MSG_KEY[LmLiquidMail.CONTACTS_APP]		= "contacts";
LmLiquidMail.MSG_KEY[LmLiquidMail.CALENDAR_APP]		= "calendar";
LmLiquidMail.MSG_KEY[LmLiquidMail.PREFERENCES_APP]	= "options";
LmLiquidMail.MSG_KEY[LmLiquidMail.MIXED_APP]		= "zimbraTitle";

LmLiquidMail.APP_ICON = new Object();
LmLiquidMail.APP_ICON[LmLiquidMail.MAIL_APP]		= LmImg.I_MAIL;
LmLiquidMail.APP_ICON[LmLiquidMail.CONTACTS_APP]	= LmImg.I_CONTACT;
LmLiquidMail.APP_ICON[LmLiquidMail.CALENDAR_APP]	= LmImg.I_APPT;
LmLiquidMail.APP_ICON[LmLiquidMail.PREFERENCES_APP]	= LmImg.I_PREFERENCES;
LmLiquidMail.APP_ICON[LmLiquidMail.MIXED_APP]		= LmImg.I_MAIL;

LmLiquidMail.APP_BUTTON = new Object();
LmLiquidMail.APP_BUTTON[LmLiquidMail.MAIL_APP]			= LmAppChooser.B_EMAIL;
LmLiquidMail.APP_BUTTON[LmLiquidMail.CONTACTS_APP]		= LmAppChooser.B_CONTACTS;
LmLiquidMail.APP_BUTTON[LmLiquidMail.CALENDAR_APP]		= LmAppChooser.B_CALENDAR;
LmLiquidMail.APP_BUTTON[LmLiquidMail.PREFERENCES_APP]	= LmAppChooser.B_OPTIONS;

LmLiquidMail.DEFAULT_SEARCH = new Object();
LmLiquidMail.DEFAULT_SEARCH[LmLiquidMail.MAIL_APP]		= LmSearchToolBar.FOR_MAIL_MI;
LmLiquidMail.DEFAULT_SEARCH[LmLiquidMail.CONTACTS_APP]	= LmItem.CONTACT;
//LmLiquidMail.DEFAULT_SEARCH[LmLiquidMail.CALENDAR_APP]	= LmItem.APPT;
LmLiquidMail.DEFAULT_SEARCH[LmLiquidMail.CALENDAR_APP]	= LmSearchToolBar.FOR_MAIL_MI;
LmLiquidMail.DEFAULT_SEARCH[LmLiquidMail.MIXED_APP]		= LmSearchToolBar.FOR_ANY_MI;

LmLiquidMail.VIEW_TT_KEY = new Object();
LmLiquidMail.VIEW_TT_KEY[LmLiquidMail.MAIL_APP]		= "displayMail";
LmLiquidMail.VIEW_TT_KEY[LmLiquidMail.CONTACTS_APP]	= "displayContacts";
LmLiquidMail.VIEW_TT_KEY[LmLiquidMail.CALENDAR_APP]	= "displayCalendar";

LmLiquidMail.defaultStartApp = LmLiquidMail.MAIL_APP;

LmLiquidMail.STATUS_LIFE = 5000; // status message duration

LmLiquidMail._PREFS_ID	= 1;
LmLiquidMail._HELP_ID	= 2;
LmLiquidMail._LOGOFF_ID	= 3;

// Public methods

LmLiquidMail.prototype.toString = 
function() {
	return "LmLiquidMail";
}

/**
* Sets up LiquidMail, and then starts it by calling its constructor. It is assumed that the
* CSFE is on the same host.
*
* @param domain		the host that we're running on
* @param app		starting app
*/
LmLiquidMail.run =
function(domain, app, userShellId) {

	// Create the global app context
	var appCtxt = new LmAppCtxt();

	appCtxt.setIsPublicComputer(false);

	// Create the shell
	var settings = appCtxt.getSettings();
	var userShell = window.document.getElementById(settings.get(LmSetting.SKIN_SHELL_ID));
	var shell = new DwtShell(null, false, LmLiquidMail._confirmExitMethod, userShell);
    appCtxt.setShell(shell);
    
	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new LsPost());
	
    // Go!
	new LmLiquidMail(appCtxt, domain, app, userShell);
}

/**
* Allows parent window to walk list of open child windows and either nuke them 
* or "disable" them
*/
LmLiquidMail.unload = 
function(ev) {
	var childWinList = window._liquidMail ? window._liquidMail._childWinList : null;
	if (childWinList) {
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			childWin.parentController = null;
			// for now, lets nuke all the windows (cause its so easy!)
			childWin.close();
		}
		
		window._liquidMail = null;
	}
}

LmLiquidMail.prototype.startup =
function(params) {
	if (!(params && params.bIsRelogin)) {

		if (!this._appViewMgr) {
			this._appViewMgr = new LmAppViewMgr(this._shell, this, false, true);
		}

		try {
			this._components = new Object();
			this._components[LmAppViewMgr.C_SASH] = new DwtSash(this._shell, DwtSash.HORIZONTAL_STYLE,
												 				"console_inset_app_l", 20);
			this._components[LmAppViewMgr.C_BANNER] = this._createBanner();
			this._components[LmAppViewMgr.C_USER_INFO] = this._createUserInfo();
			this._settings.loadUserSettings(); // load user prefs and COS data
			if (params && params.settings) {
				this._needOverviewLayout = true;
				for (var id in params.settings)
					this._settings.getSetting(id).setValue(params.settings[id]);
			}
			this._pollInterval = this._appCtxt.get(LmSetting.POLLING_INTERVAL) * 1000;
			DBG.println(LsDebug.DBG1, "poll interval = " + this._pollInterval + "ms");
			LmTimezones.initializeServerTimezone();
			this._setUserInfo();
			this._checkOverviewLayout();

			var app = params ? params.app : null;
			var startApp = LmLiquidMail.APP_CLASS[app] ? app : LmLiquidMail.defaultStartApp;
			if (this._appCtxt.get(LmSetting.SEARCH_ENABLED))
				this._components[LmAppViewMgr.C_SEARCH] = this.getSearchController().getSearchPanel();
			var currentAppToolbar = new LmCurrentAppToolBar(this._shell);
			this._appCtxt.setCurrentAppToolbar(currentAppToolbar);
			this._components[LmAppViewMgr.C_CURRENT_APP] = currentAppToolbar;
			this._components[LmAppViewMgr.C_APP_CHOOSER] = this._createAppChooser();
			this._components[LmAppViewMgr.C_STATUS] = this._statusBox = new DwtText(this._shell, "statusBox", Dwt.ABSOLUTE_STYLE);
			this._statusBox.setScrollStyle(Dwt.CLIP);
			
			this._calController = this.getApp(LmLiquidMail.CALENDAR_APP).getCalController();		

			// the outer element of the entire skin is hidden until this point
			// so that the skin won't flash (become briefly visible) during app loading
			if (skin && skin.showSkin)
				skin.showSkin(true);
			this._appViewMgr.addComponents(this._components, true);
			
			try {
				this.activateApp(startApp);
			} catch (ex) {
				this._handleException(ex, this.startup, null, true);
			}
			
			this.setSessionTimer(true);

		} catch (ex) {
			// handle exceptions for getting user settings a special way.
			//LsCsfeCommand.clearAuthToken();
			ex.code = LsCsfeException.SVC_AUTH_EXPIRED;
			this._handleException(ex, this.startup, null, true);
		}
	}
	this._schedule(this._killSplash);	// kill splash screen
}

/**
* Performs a 'running restart' of the app by clearing state and calling the startup method.
* This method is run after a logoff, or a change in what's supported.
*/
LmLiquidMail.prototype.restart =
function(settings) {
	// need to decide what to clean up, what to have startup load lazily
	// could have each app do shutdown()
	DBG.println(LsDebug.DBG1, "RESTARTING APP");
	LsCsfeCommand.setSessionId(null);			// so we get a refresh block
	var tagList = this._appCtxt.getTagList();
	if (tagList) tagList.reset();
	var folderTree = this._appCtxt.getFolderTree()
	if (folderTree) folderTree.reset();
	if (this._appCtxt.isPublicComputer())
		this._appCtxt.getLoginDialog().clearAll();
	var len = this._models.size();				// clear out known models
	for (var i = 0; i < len; i++) {
		var model = this._models.get(i);
		model = null;
	}		
	this._models = new LsVector();
	this._actionedIds = null;
	for (var app in this._apps)					// reset apps
		this._apps[app] = null;
	this._activeApp = null;
	this._appViewMgr.dtor();
	this._appViewMgr = null;
	this._searchController = this._overviewPanelController = null;
	this._schedule(this.startup, {bIsRelogin: false, settings: settings});
}

LmLiquidMail.prototype.sendRequest = 
function(soapDoc, useXml) {
	useXml = (useXml == null) ? this._appCtxt.get(LmSetting.USE_XML) : useXml;
	var result = LsCsfeCommand.invoke(soapDoc, null, null, null, useXml);
	if (!useXml && result.Header)
		this._handleHeader(result.Header);
	this._checkOverviewLayout();
	this._actionedIds = null; // reset for next request

	// we just got activity, reset polling action		
	if (this._pollActionId)
		LsTimedAction.cancelAction(this._pollActionId);
	if (this._pollInterval)
		this._pollActionId = this._schedule(this._doPoll, null, this._pollInterval);
	
	return useXml ? result : result.Body;
}

/**
* Returns a handle to the given app.
*
* @param appName	an app name
*/
LmLiquidMail.prototype.getApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	return this._apps[appName];
}

/**
* Returns a handle to the app view manager.
*/
LmLiquidMail.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
}

/**
* Returns a handle to the overview panel controller.
*/
LmLiquidMail.prototype.getOverviewPanelController =
function() {
	if (!this._overviewPanelController)
		this._overviewPanelController = new LmOverviewPanelController(this._appCtxt, this._shell, this);
	return this._overviewPanelController;
}

/**
* Returns a handle to the search bar's controller.
*/
LmLiquidMail.prototype.getSearchController =
function() {
	if (!this._searchController)
		this._searchController = new LmSearchController(this._appCtxt, this._shell, this);
	return this._searchController;
}

/**
* Makes the given app the active (displayed) one. The stack of hidden views will be cleared.
* Note that setting the name of the currently active app is done separately, since a view
* switch may not actually happen due to view preemption.
*
* @param appName	an app name
*/
LmLiquidMail.prototype.activateApp =
function(appName) {
	try {
		var bActivated = false;
	    DBG.println(LsDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);
	    if (this._activeApp) {
			// some views are not stored in _apps collection, so check if it exists.
			var app = this._apps[this._activeApp];
			if (app)
			    app.activate(false); // notify previously active app
	    }
	    
	    var view = this._appViewMgr.getAppView(appName);
	    if (view) {
	    	bActivated = true;
		    DBG.println(LsDebug.DBG3, "activateApp, current " + appName + " view: " + view);
			if (this._appViewMgr.pushView(view)) {
			    this._apps[appName].activate(true);
			    this._appViewMgr.setAppView(appName, view);
			}
	    } else {
			this._launchApp(appName);
			view = this._appViewMgr.getCurrentView();
	    }
	    
		return bActivated;
	} catch (ex) {
		this._handleException(ex, this.activateApp, appName, false);
	}
}

/**
* Sets the name of the currently active app. Done so we can figure out when an
* app needs to be launched.
*
* @param appName	the current app
* @param view		the current view
*/
LmLiquidMail.prototype.setActiveApp =
function(appName, view) {
	var toolbar = this._appCtxt.getCurrentAppToolbar();
	toolbar.showViewMenu(view);
	if (this._activeApp != appName) {
		this._activeApp = appName;
		toolbar.setCurrentApp(appName);
		toolbar.setViewTooltip(view, LmMsg[LmLiquidMail.VIEW_TT_KEY[appName]]);
		this._appCtxt.getSearchController().setDefaultSearchType(LmLiquidMail.DEFAULT_SEARCH[appName], true);
	}
//	this._components[LmAppViewMgr.C_APP_CHOOSER].setActiveApp(appName);
}

// Private methods

LmLiquidMail.prototype._killSplash =
function() {
	this._splashScreen.setVisible(false);
}

// Creates an app object, which doesn't necessarily do anything just yet.
LmLiquidMail.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	DBG.println(LsDebug.DBG1, "Creating app " + appName);
	this._apps[appName] = new LmLiquidMail.APP_CLASS[appName](this._appCtxt, this._shell);	
}

// Launching an app causes it to create a view (if necessary) and display it. The view that is created is up to the app.
// Since most apps schedule an action as part of their launch, a call to this function should not be
// followed by any code that depends on it (ie, it should be a leaf action).
LmLiquidMail.prototype._launchApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	DBG.println(LsDebug.DBG1, "Launching app " + appName);
	this._apps[appName].launch();
}

LmLiquidMail.prototype._checkOverviewLayout =
function() {
	if (this._needOverviewLayout && this._settings.userSettingsLoaded) {
		DBG.println(LsDebug.DBG1, "laying out overview panel");
		var opc = this.getOverviewPanelController();
		opc.setView();
		this._components[LmAppViewMgr.C_TREE] = opc.getOverviewPanel();
		// clear shared folder dialogs so they'll be recreated with new folder tree
		this._appCtxt.clearFolderDialogs();
		this._needOverviewLayout = false;
	}
}

LmLiquidMail.prototype._setUserInfo = 
function() {

	var login = this._appCtxt.get(LmSetting.USERNAME);
	var displayName = this._appCtxt.get(LmSetting.DISPLAY_NAME);
	var username;
	username = displayName ? displayName : login;
	if (username) {
		this._userNameField.innerHTML = username;
		if (LsEnv.isLinux)	// bug fix #3355
			this._userNameField.style.lineHeight = "13px";
	}
	var userTooltip = (username != login) ? login : null;

	var quota = this._appCtxt.get(LmSetting.QUOTA);
	var usedQuota = this._appCtxt.get(LmSetting.QUOTA_USED);
	usedQuota = usedQuota ? usedQuota : 0;

	var size = LsUtil.formatSize(usedQuota);
	var html = new Array();
	var idx = 0;
	
	var style = LsEnv.isLinux ? " style='line-height: 13px'" : ""; 	// bug fix #3355
	html[idx++] = "<center><table border=0 cellpadding=0 cellspacing=0><tr" + style + ">";
	html[idx++] = "<td class='BannerText'>" + LmMsg.quota + ": </td>";
	var quotaTooltip = null;
	if (quota) {
		var limit = LsUtil.formatSize(quota);
		var percent = Math.min(Math.round((usedQuota / quota) * 100), 100);
		
		// set background color based on percent used
		var bgcolor = "#66cc33";
		if (percent < 85 && percent > 65)
			bgcolor	= "orange";
		else if (percent >= 85)
			bgcolor = "red";
		
		html[idx++] = "<td><div class='quotabar'><div style='width: " + percent + "; background-color:" + bgcolor + "' class='quotaused'></div></div></td>";
		quotaTooltip = LmMsg.quota + ": " + percent + "% (" + size + " of " + limit + ")";
	} else {
		html[idx++] = "<td class='BannerText'> " + size + " of unlimited</td>";
	}
	html[idx++] = "</tr></table></center>";
	
	this._usedQuotaField.innerHTML = html.join("");

	if (userTooltip || quotaTooltip) {
		var tooltip = new Array();
		idx = 0;
		tooltip[idx++] = "<table>";
		if (userTooltip)
			tooltip[idx++] = "<tr><td>" + userTooltip + "</td></tr>";
		if (quotaTooltip)
			tooltip[idx++] = "<tr><td>" + quotaTooltip + "</td></tr>";
		tooltip[idx++] = "</table>";
		this._components[LmAppViewMgr.C_USER_INFO].setToolTipContent(tooltip.join(""));
	}
}

// Listeners

LmLiquidMail.logOff =
function() {

	// stop keeping track of user input (if applicable)
	if (window._liquidMail)
		window._liquidMail.setSessionTimer(false);

	LsCsfeCommand.clearAuthToken();
	
	var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80')? "" : ":" + location.port) + "/liquid/" + window.location.search;
	// not sure why IE doesn't allow this to process immediately, but since
	// it does not, we'll set up a timed action.
	if (LsEnv.isIE){
		var act = new LsTimedAction();
		act.method = LmLiquidMail.redir;
		act.params.add(locationStr);
		LsTimedAction.scheduleAction(act, 1);
	} else {
		window.location = locationStr;
	}
}

LmLiquidMail.redir =
function(args){
	var locationStr = args[0];
	window.location = locationStr;
}

LmLiquidMail.prototype.setSessionTimer =
function(bStartTimer) {

	// ALWAYS set back reference into our world (also used by unload handler)
	window._liquidMail = this;
	
	// if no timeout value, user's client never times out from inactivity	
	var timeout = this._appCtxt.get(LmSetting.IDLE_SESSION_TIMEOUT);
	if (timeout <= 0)
		return;

	var htmlElement = this._shell.getHtmlElement();

	if (bStartTimer) {
		DBG.println(LsDebug.DBG3, "INACTIVITY TIMER SET (" + (new Date()).toLocaleString() + ")");
		this._sessionTimerId = LsTimedAction.scheduleAction(this._sessionTimer, timeout);
		
		DwtEventManager.addListener(DwtEvent.ONMOUSEUP, LmLiquidMail._userEventHdlr);
		htmlElement.onmouseup = LmLiquidMail._userEventHdlr;
		if (LsEnv.isIE)
			htmlElement.onkeydown = LmLiquidMail._userEventHdlr;
		else
			window.onkeydown = LmLiquidMail._userEventHdlr;
	} else {
		DBG.println(LsDebug.DBG3, "INACTIVITY TIMER CANCELED (" + (new Date()).toLocaleString() + ")");
		
		LsTimedAction.cancelAction(this._sessionTimerId);
		this._sessionTimerId = -1;

		DwtEventManager.removeListener(DwtEvent.ONMOUSEUP, LmLiquidMail._userEventHdlr);
		htmlElement.onmouseup = null;
		if (LsEnv.isIE)
			htmlElement.onkeydown = null;
		else
			window.onkeydown = null;
	}
}

LmLiquidMail.prototype.addChildWindow = 
function(childWin) {
	if (this._childWinList == null)
		this._childWinList = new LsVector();
	
	this._childWinList.add(childWin);
}

LmLiquidMail.prototype.removeChildWindow =
function(childWin) {
	if (this._childWinList) {
		for (var i = 0; i < this._childWinList.size(); i++) {
			if (childWin == this._childWinList.get(i)) {
				this._childWinList.removeAt(i);
				break;
			}
		}
	}
}

LmLiquidMail.prototype._handleHeader =
function(hdr) {
	if (!hdr.context) return;
	
	if (hdr.context.refresh) {
		this._refreshHandler(hdr.context.refresh);
	} else if (hdr.context.notify) {
		this._notifyHandler(hdr.context.notify);
	}
}

// A <refresh> block is returned in a SOAP response any time the session ID has changed. It always happens
// on the first SOAP command (eg gettings prefs). After that, it happens after a session timeout.
// We'll always get a <folder> element back, but we might not get back a <tags>, so we
// need to make sure a tag tree is created, even if it's empty.
//
// Note: this could be optimized to do a compare (since for the large majority of refreshes, the tags and
// folders won't have changed except unread counts), but a session timeout should be relatively rare when
// we're doing polling.
LmLiquidMail.prototype._refreshHandler =
function(refresh) {
	DBG.println(LsDebug.DBG2, "Handling REFRESH");
	
	var tagTree = this._appCtxt.getTagList();
	if (!tagTree) {
		tagTree = new LmTagTree(this._appCtxt);
		tagTree.addChangeListener(this._unreadListener);
		this._appCtxt.setTagList(tagTree);
	}
	var tagString = tagTree.asString();
	var unread = tagTree.getUnreadHash();
	tagTree.reset();
	tagTree.createRoot(); // tag tree root not in the DOM

	var folderTree = this._appCtxt.getFolderTree();
	if (!folderTree) {
		folderTree = new LmFolderTree(this._appCtxt);
		folderTree.addChangeListener(this._unreadListener);
		this._appCtxt.setFolderTree(folderTree);
	}
	var folderString = folderTree.asString();
	folderTree.getUnreadHash(unread);
	folderTree.reset();

	if (refresh.tags)
		tagTree.loadFromJs(refresh.tags);
	if (refresh.folder)
		folderTree.loadFromJs(refresh.folder[0]);
	
	if (tagTree.asString() != tagString || folderTree.asString() != folderString) {
		DBG.println(LsDebug.DBG1, "overview layout needed (refresh)");
		DBG.println(LsDebug.DBG2, "tags: " + tagString + " / " + tagTree.asString());
		DBG.println(LsDebug.DBG2, "folders: " + folderString + " / " + folderTree.asString());
		this._needOverviewLayout = true;
	} else {
		this._checkUnread(tagTree, unread);
		this._checkUnread(folderTree, unread);
	}
}

LmLiquidMail.prototype._checkUnread =
function(tree, unread) {
	var organizers = new Array();
	var list = tree.asList();
	for (var i = 0; i < list.length; i++) {
		var organizer = list[i];
		if (organizer.numUnread != unread[organizer.id])
			organizers.push(organizer);
	}
	if (organizers.length) {
		var fields = new Object();
		fields[LmOrganizer.F_UNREAD] = true;
		tree._eventNotify(LmEvent.E_MODIFY, organizers, {fields: fields});
	}
}

// This method is called by the window.onbeforeunload method.
LmLiquidMail._confirmExitMethod =
function() {
DBG.println("HERE");
	return LmMsg.appExitWarning;
}

// To handle notifications, we keep track of all the models in use. A model could
// be an item, a list of items, or an organizer tree. Currently we never get an
// organizer by itself.
LmLiquidMail.prototype._notifyHandler =
function(notify) {
	DBG.println(LsDebug.DBG2, "Handling NOTIFY");
	notify = this._adjustNotifies(notify);
	try {
		if (notify.deleted)
			this._handleDeletes(notify.deleted);
		if (notify.created)
			this._handleCreates(notify.created, notify.modified);
		if (notify.modified)
			this._handleModifies(notify.modified);
		this._calController.notifyComplete();
	} catch (ex) {
		this._handleException(ex, this._notifyHandler, notify, false);
	}
}

// Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
LmLiquidMail.prototype._adjustNotifies =
function(notify) {
	if (!(notify.deleted && notify.created && notify.modified))	return notify;
	
	var virtConvDeleted = false;
	var deletedIds = notify.deleted.id.split(",");
	var virtConv = new Object();
	var newDeletedIds = new Array();
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
	var createdMsgs = new Object();
	var createdConvs = new Object();
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
	var newToOldCid = new Object();
	var modList = this._getObjList(notify.modified);
	var movedMsgs = new Object();
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
	var newMods = new Array();
	for (var cid in newToOldCid) {
		var node = createdConvs[cid];
		node.id = newToOldCid[cid];
		node._newId = cid;
		newMods.push(node);
	}
	
	// Go ahead and process these changes, which will change the ID of each promoted conv
	// from its virtual (negative) ID to its real (positive) one.
	if (newMods.length) {
		var mods = new Object();
		mods.c = newMods;
		this._handleModifies(mods);
	}
	
	return notify;
}

/**
* Adds a model to the internal tracking list. If the model is already in the list, the old one is
* removed first.
*
* @param model		a data model
*/
LmLiquidMail.prototype.addModel =
function(model) {
	DBG.println(LsDebug.DBG2, "LmLiquidMail: Adding model: " + model.toString());
	if (this._models.contains(model))
		this._models.remove(model);
	this._models.add(model);
}

/**
* Removes a model from the internal tracking list.
*
* @param model		a data model
*/
LmLiquidMail.prototype.removeModel =
function(model) {
	DBG.println(LsDebug.DBG2, "LmLiquidMail: Removing model: " + model.toString());
	this._models.remove(model);
}

/**
* Sets the list of IDs of items that are being acted on by the most recent SOAP call.
* Essentially, it's a list of IDs to ignore notifications for in the coming response.
* If an action has side effects, then notifications that aren't directly tied to the
* action are also ignored, so those effects must be handled in the response processing.
* For example, moving an item to Trash marks it as read. Instead of updating the UI to
* mark it as read based on the notification, we have to recognize that it's being moved
* to Trash and do it ourselves.
*
* @param ids		a list of item IDs
*/
LmLiquidMail.prototype.setActionedIds =
function(ids) {
	this._actionedIds = new Object();
	for (var i = 0; i < ids.length; i++)
		this._actionedIds[ids[i]] = true;
}

// Delete notification just gives us a list of IDs which could be anything.
// Hand that list to each model and let it check.
LmLiquidMail.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	this._calController.notifyDelete(ids);
	// ignore IDs we know about
	var newIds = new Array();
	for (var i = 0; i < ids.length; i++) {
		if (!this._actionedIds || (this._actionedIds && !this._actionedIds[ids[i]])) {
			DBG.println(LsDebug.DBG2, "handling delete notif for ID " + ids[i]);
			newIds.push(ids[i]);
		}
	}
	var numModels = this._models.size();
	for (var i = 0; i < numModels; i++) {
		var model = this._models.get(i);
		model.notifyDelete(newIds);
	}
}

// Create notification hands us the full XML node. For tags and folders, we 
// should always have tag and folder trees, so let them handle the create.
// For items, finding a containing list is trickier. If it's a contact, we hand
// the new node to the contact list. If it's mail, there is no authoritative
// list (mail lists are always the result of a search), so we notify each 
// LmMailList that we know about. To make life easier, we figure out which 
// folder(s) a conv spans before we hand it off.
LmLiquidMail.prototype._handleCreates =
function(creates, modifies) {
	var list = this._getObjList(creates);
	var convs = new Object();
	var msgs = new Object();
	var folders = new Object();
	var numMsgs = new Object();
	var gotMail = false;
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if ((name == "c") && create._wasVirtConv) continue;
		DBG.println(LsDebug.DBG1, "handling CREATE for node: " + name);
		if (name == "tag") {
			var tagList = this._appCtxt.getTagList();
			tagList.root.notifyCreate(create);
		} else if (name == "folder" || name == "search") {
			var isSearch = (name == "search");
			var parentId = create.l;
			if (parentId == LmFolder.ID_ROOT)
				parentId = isSearch ? LmFolder.ID_SEARCH : LmFolder.ID_USER;
			var parent = this._appCtxt.getFolderTree().getById(parentId);
			parent.notifyCreate(create, isSearch);
		} else if (name == "m") {
			var msg = LmMailMsg.createFromDom(create, {appCtxt: this._appCtxt}, true);
			if (msg.isInvite()) 
				this._calController.notifyCreate(msg);
			msgs[msg.id] = msg;
			var cid = msg.cid;
			var folder = msg.folderId;
			if (cid && folder) {
				if (!folders[cid])
					folders[cid] = new Object();
				folders[cid][folder] = true;
			}
			numMsgs[cid] = numMsgs[cid] ? numMsgs[cid] + 1 : 1;
			gotMail = true;
		} else if (name == "c") {
			var conv = LmConv.createFromDom(create, {appCtxt: this._appCtxt}, true);
			convs[conv.id] = conv;
			gotMail = true;
		} else if (name == "cn") {
			var list = this.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
			list.notifyCreate(create, true);
		}
	}
	if (gotMail) {
		for (var cid in convs) {
			var conv = convs[cid];
			conv.folders = folders[cid] ? folders[cid] : null;
		}
		var numModels = this._models.size();
		for (var i = 0; i < numModels; i++) {
			var model = this._models.get(i);
			if (model instanceof LmMailList)
				model.notifyCreate(convs, msgs);
		}
	}
}

// Change notifications are handled at the item/organizer level. The item or
// organizer will notify its list/tree, if any.
LmLiquidMail.prototype._handleModifies =
function(modifies) {
	var list = this._getObjList(modifies);
	// always notify cal controller on all
	this._calController.notifyModify(list);
	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		var id = mod.id;
		var name = mod._name;

		// ignore IDs we know about
		if (this._actionedIds && this._actionedIds[id] && !((name == "c") && mod._wasVirtConv))
			continue;
		if (name == "mbx") {
			var setting = this._settings.getSetting(LmSetting.QUOTA_USED);
			setting.notifyModify(mod);
			continue;
		}
		
		// TODO: if we only care about tags and folders, we could optimize here to only look at tag and folder trees
		DBG.println(LsDebug.DBG2, "handling modified notif for ID " + id + ", node type = " + name);
		var numModels = this._models.size();
		for (var j = 0; j < numModels; j++) {
			var model = this._models.get(j);
			var item = (model instanceof LmItem) ? model : model.getById(id);
			if (item && item.id == id)
				item.notifyModify(mod);
		}
	}
}

// Returns a list of objects that have the given parent, flattening child
// arrays in the process. It also saves each child's name into it.
LmLiquidMail.prototype._getObjList =
function(parent) {
	var list = new Array();
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
}

// Sends a NoOpRequest to see if we get any notifications (eg new mail). Ignores exceptions.
LmLiquidMail.prototype._doPoll =
function() {
	this._pollActionId = null; // so we don't try to cancel
	var soapDoc = LsSoapDoc.create("NoOpRequest", "urn:liquidMail");
	try {
		this.sendRequest(soapDoc);
	} catch (ex) {}
}

LmLiquidMail._userEventHdlr =
function(ev) {
	
	var lm = window._liquidMail;

	if (lm) {
		// cancel old timer and start a new one
		LsTimedAction.cancelAction(lm._sessionTimerId);
		lm._sessionTimerId = LsTimedAction.scheduleAction(lm._sessionTimer, 
														  lm._appCtxt.get(LmSetting.IDLE_SESSION_TIMEOUT));
	}
	
	DBG.println(LsDebug.DBG3, "INACTIVITY TIMER RESET (" + (new Date()).toLocaleString() + ")");
}

LmLiquidMail.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == LmSetting.QUOTA_USED)
		this._setUserInfo();
}

LmLiquidMail.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == LmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (fields && fields[LmOrganizer.F_UNREAD]) {
			var curView = this._appViewMgr.getCurrentView();
			var ctlr = this.getControllerForView(curView);
			if (ctlr._activeSearch && ctlr._activeSearch.search) {
				var search = ctlr._activeSearch.search;
				if (ev.source.id == search.folderId || ev.source.id == search.tagId)
					Dwt.setTitle(search.getTitle());
			}
		}		
	}
}

LmLiquidMail.prototype._createBanner =
function() {
	// The LogoContainer style centers the logo
	var banner = new DwtComposite(this._shell, "LogoContainer", Dwt.ABSOLUTE_STYLE);
	var html = new Array();
	var i = 0;
	html[i++] = "<a href='";
	html[i++] = this._appCtxt.get(LmSetting.LOGO_URI);
	html[i++] = "' target='_blank'><div class='logo'></div></a>";
	banner.getHtmlElement().innerHTML = html.join("");
	return banner;
}

LmLiquidMail.prototype._createUserInfo =
function() {
	var userInfo = new DwtComposite(this._shell, "BannerBar", Dwt.ABSOLUTE_STYLE);
	userInfo.setScrollStyle(Dwt.CLIP);
	userInfo._setMouseEventHdlrs();

	var userNameId = Dwt.getNextId();
	var usedQuotaId = Dwt.getNextId();

	var html = new Array();
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
}

LmLiquidMail.prototype._createAppChooser =
function() {
	var buttons = [LmAppChooser.B_EMAIL];
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
		buttons.push(LmAppChooser.B_CONTACTS);
	if (this._appCtxt.get(LmSetting.CALENDAR_ENABLED))
		buttons.push(LmAppChooser.B_CALENDAR);
	buttons.push(LmAppChooser.SEP, LmAppChooser.B_HELP, LmAppChooser.B_OPTIONS, LmAppChooser.B_LOGOUT);
	var appChooser = new LmAppChooser(this._shell, null, buttons);
	
	var buttonListener = new LsListener(this, this._appButtonListener);
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (id == LmAppChooser.SEP) continue;
		var b = appChooser.getButton(id);
		b.addSelectionListener(buttonListener);
	}

	return appChooser;
}

LmLiquidMail.prototype.setStatusMsg =
function(msg) {
	this._statusBox.setText(msg);
	if (msg) {
		var act = new LsTimedAction ();
		act.method = LmLiquidMail._clearStatus;
		act.params.add(this._statusBox);
		LsTimedAction.scheduleAction(act, LmLiquidMail.STATUS_LIFE);
	}
}

LmLiquidMail._clearStatus =
function(args) {
	args[0].setText("");
}

LmLiquidMail.prototype._appButtonListener =
function(ev) {
	var searchController = this._appCtxt.getSearchController();
	var id = ev.item.getData(Dwt.KEY_ID);
	DBG.println("LmLiquidMail button press: " + id);
	if (id == LmAppChooser.B_EMAIL) {
		this.activateApp(LmLiquidMail.MAIL_APP);
	} else if (id == LmAppChooser.B_CONTACTS) {
		this.getApp(LmLiquidMail.CONTACTS_APP).launch();
	} else if (id == LmAppChooser.B_CALENDAR) {
		this.activateApp(LmLiquidMail.CALENDAR_APP);
	} else if (id == LmAppChooser.B_HELP) {
		window.open(this._appCtxt.get(LmSetting.HELP_URI));
	} else if (id == LmAppChooser.B_OPTIONS) {
		this.activateApp(LmLiquidMail.PREFERENCES_APP);
	} else if (id == LmAppChooser.B_LOGOUT) {
		LmLiquidMail.logOff();
	}
}
