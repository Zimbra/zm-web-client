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
    this._splashScreen = new ZmSplashScreen(this._shell, ZmImg.M_SPLASH);
   
	this._apps = new Object();
	this._activeApp = null;
	
	this._pollActionId = null;
	this._sessionTimer = new AjxTimedAction();
	this._sessionTimer.method = ZmZimbraMail.logOff;
	this._models = new AjxVector();
	this._needOverviewLayout = false;
	this._unreadListener = new AjxListener(this, this._unreadChangeListener);	

	this._schedule(this.startup, {app: app});
}

ZmZimbraMail.prototype = new ZmController;
ZmZimbraMail.prototype.constructor = ZmZimbraMail;

ZmZimbraMail.MAIL_APP			= "mail";
ZmZimbraMail.CONTACTS_APP		= "contacts";
ZmZimbraMail.CALENDAR_APP		= "calendar";
ZmZimbraMail.PREFERENCES_APP	= "options";
ZmZimbraMail.MIXED_APP			= "mixed";

ZmZimbraMail.APP_CLASS = new Object();
ZmZimbraMail.APP_CLASS[ZmZimbraMail.MAIL_APP]			= ZmMailApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.CONTACTS_APP]		= ZmContactsApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.CALENDAR_APP]		= ZmCalendarApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.PREFERENCES_APP]	= ZmPreferencesApp;
ZmZimbraMail.APP_CLASS[ZmZimbraMail.MIXED_APP]			= ZmMixedApp;

ZmZimbraMail.MSG_KEY = new Object();
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MAIL_APP]			= "email";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CONTACTS_APP]		= "contacts";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.CALENDAR_APP]		= "calendar";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.PREFERENCES_APP]	= "options";
ZmZimbraMail.MSG_KEY[ZmZimbraMail.MIXED_APP]		= "zimbraTitle";

ZmZimbraMail.APP_ICON = new Object();
ZmZimbraMail.APP_ICON[ZmZimbraMail.MAIL_APP]		= ZmImg.I_MAIL;
ZmZimbraMail.APP_ICON[ZmZimbraMail.CONTACTS_APP]	= ZmImg.I_CONTACT;
ZmZimbraMail.APP_ICON[ZmZimbraMail.CALENDAR_APP]	= ZmImg.I_APPT;
ZmZimbraMail.APP_ICON[ZmZimbraMail.PREFERENCES_APP]	= ZmImg.I_PREFERENCES;
ZmZimbraMail.APP_ICON[ZmZimbraMail.MIXED_APP]		= ZmImg.I_MAIL;

ZmZimbraMail.APP_BUTTON = new Object();
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.MAIL_APP]			= ZmAppChooser.B_EMAIL;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CONTACTS_APP]		= ZmAppChooser.B_CONTACTS;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.CALENDAR_APP]		= ZmAppChooser.B_CALENDAR;
ZmZimbraMail.APP_BUTTON[ZmZimbraMail.PREFERENCES_APP]	= ZmAppChooser.B_OPTIONS;

ZmZimbraMail.DEFAULT_SEARCH = new Object();
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MAIL_APP]		= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CONTACTS_APP]	= ZmItem.CONTACT;
//ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmItem.APPT;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.CALENDAR_APP]	= ZmSearchToolBar.FOR_MAIL_MI;
ZmZimbraMail.DEFAULT_SEARCH[ZmZimbraMail.MIXED_APP]		= ZmSearchToolBar.FOR_ANY_MI;

ZmZimbraMail.VIEW_TT_KEY = new Object();
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.MAIL_APP]		= "displayMail";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CONTACTS_APP]	= "displayContacts";
ZmZimbraMail.VIEW_TT_KEY[ZmZimbraMail.CALENDAR_APP]	= "displayCalendar";

ZmZimbraMail.defaultStartApp = ZmZimbraMail.MAIL_APP;

ZmZimbraMail.STATUS_LIFE = 5000; // status message duration

ZmZimbraMail._PREFS_ID	= 1;
ZmZimbraMail._HELP_ID	= 2;
ZmZimbraMail._LOGOFF_ID	= 3;

// Public methods

ZmZimbraMail.prototype.toString = 
function() {
	return "ZmZimbraMail";
}

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
    
	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new AjxPost());
	
    // Go!
	new ZmZimbraMail(appCtxt, domain, app, userShell);
}

/**
* Allows parent window to walk list of open child windows and either nuke them 
* or "disable" them
*/
ZmZimbraMail.unload = 
function(ev) {
	var childWinList = window._zimbraMail ? window._zimbraMail._childWinList : null;
	if (childWinList) {
		for (var i = 0; i < childWinList.size(); i++) {
			var childWin = childWinList.get(i);
			childWin.parentController = null;
			// for now, lets nuke all the windows (cause its so easy!)
			childWin.close();
		}
		
		window._zimbraMail = null;
	}
}

ZmZimbraMail.prototype.startup =
function(params) {
	if (!(params && params.bIsRelogin)) {

		if (!this._appViewMgr) {
			this._appViewMgr = new ZmAppViewMgr(this._shell, this, false, true);
		}

		try {
			this._components = new Object();
			this._components[ZmAppViewMgr.C_SASH] = new DwtSash(this._shell, DwtSash.HORIZONTAL_STYLE,
												 				"console_inset_app_l", 20);
			this._components[ZmAppViewMgr.C_BANNER] = this._createBanner();
			this._components[ZmAppViewMgr.C_USER_INFO] = this._createUserInfo();
			this._settings.loadUserSettings(); // load user prefs and COS data
			if (params && params.settings) {
				this._needOverviewLayout = true;
				for (var id in params.settings)
					this._settings.getSetting(id).setValue(params.settings[id]);
			}
			this._pollInterval = this._appCtxt.get(ZmSetting.POLLING_INTERVAL) * 1000;
			DBG.println(AjxDebug.DBG1, "poll interval = " + this._pollInterval + "ms");
			ZmTimezones.initializeServerTimezone();
			this._setUserInfo();
			this._checkOverviewLayout();

			var app = params ? params.app : null;
			var startApp = ZmZimbraMail.APP_CLASS[app] ? app : ZmZimbraMail.defaultStartApp;
			if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED))
				this._components[ZmAppViewMgr.C_SEARCH] = this.getSearchController().getSearchPanel();
			var currentAppToolbar = new ZmCurrentAppToolBar(this._shell);
			this._appCtxt.setCurrentAppToolbar(currentAppToolbar);
			this._components[ZmAppViewMgr.C_CURRENT_APP] = currentAppToolbar;
			this._components[ZmAppViewMgr.C_APP_CHOOSER] = this._createAppChooser();
			this._components[ZmAppViewMgr.C_STATUS] = this._statusBox = new DwtText(this._shell, "statusBox", Dwt.ABSOLUTE_STYLE);
			this._statusBox.setScrollStyle(Dwt.CLIP);
			
			this._calController = this.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();		

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
			//ZmCsfeCommand.clearAuthToken();
			ex.code = ZmCsfeException.SVC_AUTH_EXPIRED;
			this._handleException(ex, this.startup, null, true);
		}
	}
	this._schedule(this._killSplash);	// kill splash screen
}

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
	this._models = new AjxVector();
	this._actionedIds = null;
	for (var app in this._apps)					// reset apps
		this._apps[app] = null;
	this._activeApp = null;
	this._appViewMgr.dtor();
	this._appViewMgr = null;
	this._searchController = this._overviewPanelController = null;
	this._schedule(this.startup, {bIsRelogin: false, settings: settings});
}

ZmZimbraMail.prototype.sendRequest = 
function(soapDoc, useXml) {
	useXml = (useXml == null) ? this._appCtxt.get(ZmSetting.USE_XML) : useXml;
	var result = ZmCsfeCommand.invoke(soapDoc, null, null, null, useXml, false, this._changeToken);
	if (!useXml && result.Header)
		this._handleHeader(result.Header);
	this._checkOverviewLayout();
	this._actionedIds = null; // reset for next request

	// we just got activity, reset polling action		
	if (this._pollActionId)
		AjxTimedAction.cancelAction(this._pollActionId);
	if (this._pollInterval)
		this._pollActionId = this._schedule(this._doPoll, null, this._pollInterval);
	
	return useXml ? result : result.Body;
}

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
}

/**
* Returns a handle to the app view manager.
*/
ZmZimbraMail.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
}

/**
* Returns a handle to the overview panel controller.
*/
ZmZimbraMail.prototype.getOverviewPanelController =
function() {
	if (!this._overviewPanelController)
		this._overviewPanelController = new ZmOverviewPanelController(this._appCtxt, this._shell, this);
	return this._overviewPanelController;
}

/**
* Returns a handle to the search bar's controller.
*/
ZmZimbraMail.prototype.getSearchController =
function() {
	if (!this._searchController)
		this._searchController = new ZmSearchController(this._appCtxt, this._shell, this);
	return this._searchController;
}

/**
* Makes the given app the active (displayed) one. The stack of hidden views will be cleared.
* Note that setting the name of the currently active app is done separately, since a view
* switch may not actually happen due to view preemption.
*
* @param appName	an app name
*/
ZmZimbraMail.prototype.activateApp =
function(appName) {
	try {
		var bActivated = false;
	    DBG.println(AjxDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);
	    if (this._activeApp) {
			// some views are not stored in _apps collection, so check if it exists.
			var app = this._apps[this._activeApp];
			if (app)
			    app.activate(false); // notify previously active app
	    }
	    
	    var view = this._appViewMgr.getAppView(appName);
	    if (view) {
	    	bActivated = true;
		    DBG.println(AjxDebug.DBG3, "activateApp, current " + appName + " view: " + view);
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
ZmZimbraMail.prototype.setActiveApp =
function(appName, view) {
	var toolbar = this._appCtxt.getCurrentAppToolbar();
	toolbar.showViewMenu(view);
	if (this._activeApp != appName) {
		this._activeApp = appName;
		toolbar.setCurrentApp(appName);
		toolbar.setViewTooltip(view, ZmMsg[ZmZimbraMail.VIEW_TT_KEY[appName]]);
		this._appCtxt.getSearchController().setDefaultSearchType(ZmZimbraMail.DEFAULT_SEARCH[appName], true);
	}
//	this._components[ZmAppViewMgr.C_APP_CHOOSER].setActiveApp(appName);
}

// Private methods

ZmZimbraMail.prototype._killSplash =
function() {
	this._splashScreen.setVisible(false);
}

// Creates an app object, which doesn't necessarily do anything just yet.
ZmZimbraMail.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	DBG.println(AjxDebug.DBG1, "Creating app " + appName);
	this._apps[appName] = new ZmZimbraMail.APP_CLASS[appName](this._appCtxt, this._shell);	
}

// Launching an app causes it to create a view (if necessary) and display it. The view that is created is up to the app.
// Since most apps schedule an action as part of their launch, a call to this function should not be
// followed by any code that depends on it (ie, it should be a leaf action).
ZmZimbraMail.prototype._launchApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	DBG.println(AjxDebug.DBG1, "Launching app " + appName);
	this._apps[appName].launch();
}

ZmZimbraMail.prototype._checkOverviewLayout =
function() {
	if (this._needOverviewLayout && this._settings.userSettingsLoaded) {
		DBG.println(AjxDebug.DBG1, "laying out overview panel");
		var opc = this.getOverviewPanelController();
		opc.setView();
		this._components[ZmAppViewMgr.C_TREE] = opc.getOverviewPanel();
		// clear shared folder dialogs so they'll be recreated with new folder tree
		this._appCtxt.clearFolderDialogs();
		this._needOverviewLayout = false;
	}
}

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
	var html = new Array();
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
		var tooltip = new Array();
		idx = 0;
		tooltip[idx++] = "<table>";
		if (userTooltip)
			tooltip[idx++] = "<tr><td>" + userTooltip + "</td></tr>";
		if (quotaTooltip)
			tooltip[idx++] = "<tr><td>" + quotaTooltip + "</td></tr>";
		tooltip[idx++] = "</table>";
		this._components[ZmAppViewMgr.C_USER_INFO].setToolTipContent(tooltip.join(""));
	}
}

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
}

ZmZimbraMail.redir =
function(args){
	window.location = args[0];
}

ZmZimbraMail.prototype.setSessionTimer =
function(bStartTimer) {

	// ALWAYS set back reference into our world (also used by unload handler)
	window._zimbraMail = this;
	
	// if no timeout value, user's client never times out from inactivity	
	var timeout = this._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT);
	if (timeout <= 0)
		return;

	var htmlElement = this._shell.getHtmlElement();

	if (bStartTimer) {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER SET (" + (new Date()).toLocaleString() + ")");
		this._sessionTimerId = AjxTimedAction.scheduleAction(this._sessionTimer, timeout);
		
		DwtEventManager.addListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		htmlElement.onmouseup = ZmZimbraMail._userEventHdlr;
		if (AjxEnv.isIE)
			htmlElement.onkeydown = ZmZimbraMail._userEventHdlr;
		else
			window.onkeydown = ZmZimbraMail._userEventHdlr;
	} else {
		DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER CANCELED (" + (new Date()).toLocaleString() + ")");
		
		AjxTimedAction.cancelAction(this._sessionTimerId);
		this._sessionTimerId = -1;

		DwtEventManager.removeListener(DwtEvent.ONMOUSEUP, ZmZimbraMail._userEventHdlr);
		htmlElement.onmouseup = null;
		if (AjxEnv.isIE)
			htmlElement.onkeydown = null;
		else
			window.onkeydown = null;
	}
}

ZmZimbraMail.prototype.addChildWindow = 
function(childWin) {
	if (this._childWinList == null)
		this._childWinList = new AjxVector();
	
	this._childWinList.add(childWin);
}

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
}

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
}

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
	
	var tagTree = this._appCtxt.getTagList();
	if (!tagTree) {
		tagTree = new ZmTagTree(this._appCtxt);
		tagTree.addChangeListener(this._unreadListener);
		this._appCtxt.setTagList(tagTree);
	}
	var tagString = tagTree.asString();
	var unread = tagTree.getUnreadHash();
	tagTree.reset();
	tagTree.createRoot(); // tag tree root not in the DOM

	var folderTree = this._appCtxt.getFolderTree();
	if (!folderTree) {
		folderTree = new ZmFolderTree(this._appCtxt);
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
}

ZmZimbraMail.prototype._checkUnread =
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
		fields[ZmOrganizer.F_UNREAD] = true;
		tree._eventNotify(ZmEvent.E_MODIFY, organizers, {fields: fields});
	}
}

// This method is called by the window.onbeforeunload method.
ZmZimbraMail._confirmExitMethod =
function() {
	DBG.println(AjxDebug.DBG1, "_confirmExitMethod, received unload event");
	return ZmMsg.appExitWarning;
}

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
}

// Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
ZmZimbraMail.prototype._adjustNotifies =
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
ZmZimbraMail.prototype.addModel =
function(model) {
	DBG.println(AjxDebug.DBG2, "ZmZimbraMail: Adding model: " + model.toString());
	if (this._models.contains(model))
		this._models.remove(model);
	this._models.add(model);
}

/**
* Removes a model from the internal tracking list.
*
* @param model		a data model
*/
ZmZimbraMail.prototype.removeModel =
function(model) {
	DBG.println(AjxDebug.DBG2, "ZmZimbraMail: Removing model: " + model.toString());
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
ZmZimbraMail.prototype.setActionedIds =
function(ids) {
	this._actionedIds = new Object();
	for (var i = 0; i < ids.length; i++)
		this._actionedIds[ids[i]] = true;
}

// Delete notification just gives us a list of IDs which could be anything.
// Hand that list to each model and let it check.
ZmZimbraMail.prototype._handleDeletes =
function(deletes) {
	var ids = deletes.id.split(",");
	if (this._calController) this._calController.notifyDelete(ids);
	// ignore IDs we know about
	var newIds = new Array();
	for (var i = 0; i < ids.length; i++) {
		if (!this._actionedIds || (this._actionedIds && !this._actionedIds[ids[i]])) {
			DBG.println(AjxDebug.DBG2, "handling delete notif for ID " + ids[i]);
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
// ZmMailList that we know about. To make life easier, we figure out which 
// folder(s) a conv spans before we hand it off.
ZmZimbraMail.prototype._handleCreates =
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
		DBG.println(AjxDebug.DBG1, "handling CREATE for node: " + name);
		if (name == "tag") {
			var tagList = this._appCtxt.getTagList();
			tagList.root.notifyCreate(create);
		} else if (name == "folder" || name == "search") {
			var isSearch = (name == "search");
			var parentId = create.l;
			if (parentId == ZmFolder.ID_ROOT)
				parentId = isSearch ? ZmFolder.ID_SEARCH : ZmFolder.ID_USER;
			var parent = this._appCtxt.getFolderTree().getById(parentId);
			if (parent)
				parent.notifyCreate(create, isSearch);
		} else if (name == "m") {
			var msg = ZmMailMsg.createFromDom(create, {appCtxt: this._appCtxt}, true);
			if (msg.isInvite() && this._calController) 
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
			var conv = ZmConv.createFromDom(create, {appCtxt: this._appCtxt}, true);
			convs[conv.id] = conv;
			gotMail = true;
		} else if (name == "cn") {
			var list = this.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
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
			if (model instanceof ZmMailList)
				model.notifyCreate(convs, msgs);
		}
	}
}

// Change notifications are handled at the item/organizer level. The item or
// organizer will notify its list/tree, if any.
ZmZimbraMail.prototype._handleModifies =
function(modifies) {
	var list = this._getObjList(modifies);
	// always notify cal controller on all
	if (this._calController) this._calController.notifyModify(list);
	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		var id = mod.id;
		var name = mod._name;

		// ignore IDs we know about
		if (this._actionedIds && this._actionedIds[id] && !((name == "c") && mod._wasVirtConv))
			continue;
		if (name == "mbx") {
			var setting = this._settings.getSetting(ZmSetting.QUOTA_USED);
			setting.notifyModify(mod);
			continue;
		}
		
		// TODO: if we only care about tags and folders, we could optimize here to only look at tag and folder trees
		DBG.println(AjxDebug.DBG2, "handling modified notif for ID " + id + ", node type = " + name);
		var numModels = this._models.size();
		for (var j = 0; j < numModels; j++) {
			var model = this._models.get(j);
			var item = (model instanceof ZmItem) ? model : model.getById(id);
			if (item && item.id == id)
				item.notifyModify(mod);
		}
	}
}

// Returns a list of objects that have the given parent, flattening child
// arrays in the process. It also saves each child's name into it.
ZmZimbraMail.prototype._getObjList =
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
ZmZimbraMail.prototype._doPoll =
function() {
	this._pollActionId = null; // so we don't try to cancel
	var soapDoc = AjxSoapDoc.create("NoOpRequest", "urn:zimbraMail");
	try {
		this.sendRequest(soapDoc);
	} catch (ex) {}
}

ZmZimbraMail._userEventHdlr =
function(ev) {
	
	var lm = window._zimbraMail;

	if (lm) {
		// cancel old timer and start a new one
		AjxTimedAction.cancelAction(lm._sessionTimerId);
		lm._sessionTimerId = AjxTimedAction.scheduleAction(lm._sessionTimer, 
														  lm._appCtxt.get(ZmSetting.IDLE_SESSION_TIMEOUT));
	}
	
	DBG.println(AjxDebug.DBG3, "INACTIVITY TIMER RESET (" + (new Date()).toLocaleString() + ")");
}

ZmZimbraMail.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == ZmSetting.QUOTA_USED)
		this._setUserInfo();
}

ZmZimbraMail.prototype._unreadChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_MODIFY) {
		var fields = ev.getDetail("fields");
		if (fields && fields[ZmOrganizer.F_UNREAD]) {
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

ZmZimbraMail.prototype._createBanner =
function() {
	// The LogoContainer style centers the logo
	var banner = new DwtComposite(this._shell, "LogoContainer", Dwt.ABSOLUTE_STYLE);
	var html = new Array();
	var i = 0;
	html[i++] = "<a href='";
	html[i++] = this._appCtxt.get(ZmSetting.LOGO_URI);
	html[i++] = "' target='_blank'><div class='logo'></div></a>";
	banner.getHtmlElement().innerHTML = html.join("");
	return banner;
}

ZmZimbraMail.prototype._createUserInfo =
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
}

ZmZimbraMail.prototype.setStatusMsg =
function(msg) {
	this._statusBox.setText(msg);
	if (msg) {
		var act = new AjxTimedAction ();
		act.method = ZmZimbraMail._clearStatus;
		act.params.add(this._statusBox);
		AjxTimedAction.scheduleAction(act, ZmZimbraMail.STATUS_LIFE);
	}
}

ZmZimbraMail._clearStatus =
function(args) {
	args[0].setText("");
}

ZmZimbraMail.prototype._appButtonListener =
function(ev) {
	var searchController = this._appCtxt.getSearchController();
	var id = ev.item.getData(Dwt.KEY_ID);
	DBG.println("ZmZimbraMail button press: " + id);
	if (id == ZmAppChooser.B_EMAIL) {
		this.activateApp(ZmZimbraMail.MAIL_APP);
	} else if (id == ZmAppChooser.B_CONTACTS) {
		this.getApp(ZmZimbraMail.CONTACTS_APP).launch();
	} else if (id == ZmAppChooser.B_CALENDAR) {
		this.activateApp(ZmZimbraMail.CALENDAR_APP);
	} else if (id == ZmAppChooser.B_HELP) {
		window.open(this._appCtxt.get(ZmSetting.HELP_URI));
	} else if (id == ZmAppChooser.B_OPTIONS) {
		this.activateApp(ZmZimbraMail.PREFERENCES_APP);
	} else if (id == ZmAppChooser.B_LOGOUT) {
		ZmZimbraMail.logOff();
	}
}
