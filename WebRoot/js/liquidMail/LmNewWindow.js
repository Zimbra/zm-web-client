/**
* Creates a controller to run LmNewWindow. Do not call directly, instead use the run()
* factory method.
* @constructor
* @class
* This class is the new child window "controller" for all new windows created 
* by the parent window's controller *i think, maybe? please?*
*/
function LmNewWindow(appCtxt, domain) {

	LmController.call(this, appCtxt);

	appCtxt.setAppController(this);

	this._settings = appCtxt.getSettings();
	this._shell = appCtxt.getShell();
	this._apps = new Object();
	this._activeApp = null;
	this._models = new LsVector();
	this._needOverviewLayout = false;
	this._schedule(this.startup);
}

LmNewWindow.prototype = new LmController;
LmNewWindow.prototype.constructor = LmNewWindow;

LmNewWindow.MAIL_APP			= "mail";
LmNewWindow.CONTACTS_APP		= "contacts";
LmNewWindow.CALENDAR_APP		= "cal";
LmNewWindow.PREFERENCES_APP		= "prefs";
LmNewWindow.MIXED_APP			= "mixed";

// XXX: may not need this...
LmNewWindow.APP_CLASS = new Object();
LmNewWindow.APP_CLASS[LmNewWindow.MAIL_APP]			= LmMailApp;
LmNewWindow.APP_CLASS[LmNewWindow.CONTACTS_APP]		= LmContactsApp;
LmNewWindow.APP_CLASS[LmNewWindow.CALENDAR_APP]		= LmCalendarApp;
LmNewWindow.APP_CLASS[LmNewWindow.PREFERENCES_APP]	= LmPreferencesApp;
LmNewWindow.APP_CLASS[LmNewWindow.MIXED_APP]		= LmMixedApp;

LmNewWindow.prototype.toString = 
function() {
	return "LmNewWindow";
}

// Public methods

/**
* Sets up LiquidMail, and then starts it by calling its constructor. It is assumed that the
* CSFE is on the same host.
*
* @param domain		the host that we're running on
*/
LmNewWindow.run =
function(domain) {

	// Create the global app context
	var appCtxt = new LmAppCtxt();
	appCtxt.setIsPublicComputer(false);
	
	// set any global references in parent w/in child window
	if (window.parentController) {
		//appCtxt.setTagList(window.parentController._appCtxt.getTagList());
		appCtxt.setSettings(window.parentController._appCtxt.getSettings());
	}

	var shell = new DwtShell("MainShell", false);
    appCtxt.setShell(shell);
    
	// Create upload manager (for sending attachments)
	appCtxt.setUploadManager(new LsPost());
	
    // Go!
    var lm = new LmNewWindow(appCtxt, domain);
}

/**
* Allows this child window to inform parent its going away
*/
LmNewWindow.unload = 
function(ev) {	
	if (window.parentController) {
		window.parentController.removeChildWindow(window);
	}
}

/**
* Starts up LmNewWindow. Since it's a 
* scheduled method, it receives its args bundled up in a single params arg.
*
* @param settings		forced values for settings (for dev client command hack)
*
* TODO: launch app based on prefs
*/
LmNewWindow.prototype.startup =
function(params) {

	if (!this._appViewMgr)
		this._appViewMgr = new LmAppViewMgr(this._shell, this, true, false);

	try {
		// depending on the command, do the right thing
		if (window.command == "compose" || window.command == "composeDetach") {
			this.activateApp(LmNewWindow.MAIL_APP);
			var cc = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
			cc.isChildWindow = true;
			if (window.command == "compose") {
				this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController()._setView(window.args[0], window.args[1], window.args[2], window.args[3], window.args[4]);
			} else {
				cc._setView(LmOperation.NEW_MESSAGE, window.args.msg, null, null, null, window.args.composeMode);
				cc._composeView.setDetach(window.args);
			}
		}
	} catch (ex) {
		ex.code = LsCsfeException.SVC_AUTH_EXPIRED;
		this._handleException(ex, this.startup, null, true);
	}
}

LmNewWindow.prototype.sendRequest = 
function(soapDoc, useXml) {

	// defer all server requests to the parent window
	var result = window.parentController
		? window.parentController.sendRequest(soapDoc, useXml)
		: null;
	
	return result;
}

/**
* Returns a handle to the given app.
*
* @param appName	an app name
*/
LmNewWindow.prototype.getApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
	return this._apps[appName];
}

/**
* Returns a handle to the app view manager.
*/
LmNewWindow.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
}

/**
* Makes the given app the active (displayed) one. The stack of hidden views will be cleared.
* Note that setting the name of the currently active app is done separately, since a view
* switch may not actually happen due to view preemption.
*
* @param appName	an app name
*/
LmNewWindow.prototype.activateApp =
function(appName) {
	var bActivated = false;
    if (this._activeApp) {
		// some views are not stored in _apps collection, so check if it exists.
		var app = this._apps[this._activeApp];
		if (app)
		    app.activate(false); // notify previously active app
    }
    
    var view = this._appViewMgr.getAppView(appName);
    if (view) {
    	bActivated = true;
		if (this._appViewMgr.setView(view)) {
		    this._apps[appName].activate(true);
		    this._appViewMgr.setAppView(appName, view);
		}
    } else {
		if (!this._apps[appName])
			this._createApp(appName);
    }
    return bActivated;
}

/**
* Sets the name of the currently active app. Done so we can figure out when an
* app needs to be launched.
*
* @param appName	the app
*/
LmNewWindow.prototype.setActiveApp =
function(appName) {
	this._activeApp = appName;
}

// Private methods

// Creates an app object, which doesn't necessarily do anything just yet.
LmNewWindow.prototype._createApp =
function(appName) {
	if (this._apps[appName]) return;
	this._apps[appName] = new LmNewWindow.APP_CLASS[appName](this._appCtxt, this._shell, window.parentController);
}

