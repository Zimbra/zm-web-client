/**
* Creates a controller to run LiquidAdmin. Do not call directly, instead use the run()
* factory method.
* @constructor LiquidAdmin
* @param appCtx
* @class LiquidAdmin
* This class is the "ubercontroller", as it manages all the apps as well as bootstrapping
* the LiquidAdmin application.
*/
function LaLiquidAdmin(appCtxt) {

	LaController.call(this, appCtxt, null, null, true);
	this._shell = this._appCtxt.getShell();	
	this._splashScreen = new LaSplashScreen(this._shell, LaImg.M_SPLASH);
	
	appCtxt.setAppController(this);
	appCtxt.setClientCmdHdlr(new LaClientCmdHandler(appCtxt));
		
	this._apps = new Object();
	this._activeApp = null;
	
	// handles to various apps
	this._appFactory = new Object();
	this._appFactory[LaLiquidAdmin.ADMIN_APP] = LaApp;
	

//	this._createBanner();								// creates the banner
	this._schedule(LaLiquidAdmin.prototype.startup);	// creates everything else
}

LaLiquidAdmin.prototype = new LaController;
LaLiquidAdmin.prototype.constructor = LaLiquidAdmin;

LaLiquidAdmin.ADMIN_APP = "admin";

LaLiquidAdmin._MIGRATION_ID = 1;
LaLiquidAdmin._HELP_ID = 2;
LaLiquidAdmin._LOGOFF_ID = 3;
LaLiquidAdmin._PDF_HELP_ID = 4;

// do not change the name of the cookie! SoapServlet looks for it
LaLiquidAdmin._COOKIE_NAME = "LS_ADMIN_AUTH_TOKEN";
	
// Public methods

LaLiquidAdmin.prototype.toString = 
function() {
	return "LaLiquidAdmin";
}

/**
* Sets up LiquidMail, and then starts it by calling its constructor. It is assumed that the
* CSFE is on the same host.
*
* @param domain		the host that we're running on
*/
LaLiquidAdmin.run =
function(domain) {

	LsCsfeCommand.setServerUri(location.protocol+"//" + domain + LaSettings.CSFE_SERVER_URI);
	LsCsfeCommand.setCookieName(LaLiquidAdmin._COOKIE_NAME);
//	LaAuthenticate.setAdmin(true);
	
	// Create the global app context
	var appCtxt = new LaAppCtxt();


	// Create the shell
//	var shell = new DwtShell(window, false, LaLiquidAdmin._confirmExitMethod);
	var shell = new DwtShell(window, false, null);
    appCtxt.setShell(shell);
    
    // Go!
    var lm = new LaLiquidAdmin(appCtxt);
}


/**
* Returns a handle to the given app.
*
* @param appName	an app name
*/
LaLiquidAdmin.prototype.getApp =
function(appName) {
//DBG.println(LsDebug.DBG3, "getApp " + appName);
	if (this._apps[appName] == null)
		this._createApp(appName);
	return this._apps[appName];
}

LaLiquidAdmin.prototype.getAdminApp = 
function() {
	return this.getApp(LaLiquidAdmin.ADMIN_APP);
}

/**
* Returns a handle to the app view manager.
*/
LaLiquidAdmin.prototype.getAppViewMgr =
function() {
	return this._appViewMgr;
}

/**
* Returns a handle to the overview panel controller.
*/
LaLiquidAdmin.prototype.getOverviewPanelController =
function() {
	if (this._overviewPanelController == null)
		this._overviewPanelController = new LaOverviewPanelController(this._appCtxt, this._shell, this);
	return this._overviewPanelController;
}

/**
* Returns a handle to the search bar's controller.
*/
LaLiquidAdmin.prototype.getSearchController =
function() {
	if (this._searchController == null)
		this._searchController = new LaSearchController(this._appCtxt, this._shell, this);
	return this._searchController;
}

/**
* Makes the given app the active (displayed) one. The stack of hidden views will be cleared.
* Note that setting the name of the currently active app is done separately, since a view
* switch may not actually happen due to view preemption.
*
* @param appName	an app name
*/
LaLiquidAdmin.prototype.activateApp =
function(appName) {
DBG.println(LsDebug.DBG1, "activateApp: " + appName + ", current app = " + this._activeApp);
	var view = this._appViewMgr.getAppView(appName);
	if (this._activeApp)
		this._apps[this._activeApp].activate(false); // notify previously active app
DBG.println(LsDebug.DBG3, "activateApp, current " + appName + " view: " + view);
	if (view) {
		if (this._appViewMgr.setView(view)) {
			this._apps[appName].activate(true);
			this._appViewMgr.setAppView(appName, view);
		}
	} else {
		this._launchApp(appName);
	}
}

/**
* Sets the name of the currently active app. Done so we can figure out when an
* app needs to be launched.
*
* @param appName	the app
*/
LaLiquidAdmin.prototype.setActiveApp =
function(appName) {
	this._activeApp = appName;
}

LaLiquidAdmin.logOff =
function() {
	LsCsfeCommand.clearAuthToken();
	var locationStr = location.protocol + "//" + location.hostname + ((location.port == '80')? "" : ":" +location.port) + "/liquidAdmin";
	// not sure why IE doesn't allow this to process immediately, but since
	// it does not, we'll set up a timed action.
	if (LsEnv.isIE){
		var act = new LsTimedAction ();
		act.method = LaLiquidAdmin.redir;
		act.params.add(locationStr);
		LsTimedAction.scheduleAction(act, 1);
	} else {
		window.location = locationStr;
	}
}

LaLiquidAdmin.redir =
function(args){
	var locationStr = args[0];
	window.location = locationStr;
}

// Private methods

// Start up the LiquidMail application
// TODO: launch app based on prefs
LaLiquidAdmin.prototype.startup =
function() {

	this._appViewMgr = new LaAppViewMgr(this._shell, this._banner, this);
								        
	try {
		var domains = LaDomain.getAll(); // catch an exception before building the UI
		this._appViewMgr.setOverviewPanel(this.getOverviewPanelController().getOverviewPanel());
		this._appViewMgr.setSearchPanel(this.getSearchController().getSearchPanel());
		// Default to showing admin app
		this.activateApp(LaLiquidAdmin.ADMIN_APP);
	} catch (ex) {
		this._handleException(ex, "LaLiquidAdmin.prototype._startup", null, true);
	}
	this._schedule(this._killSplash);	// kill splash screen	
}

LaLiquidAdmin.prototype._killSplash =
function() {
	this._splashScreen.setVisible(false);
}


// Creates an app object, which doesn't necessarily do anything just yet.
LaLiquidAdmin.prototype._createApp =
function(appName) {
	if (this._apps[appName] != null)
		return;
DBG.println(LsDebug.DBG1, "Creating app " + appName);
	this._apps[appName] = new this._appFactory[appName](this._appCtxt, this._shell);	
}

// Launching an app causes it to create a view (if necessary) and display it. The view that is created is up to the app.
// Since most apps schedule an action as part of their launch, a call to this function should not be
// followed by any code that depends on it (ie, it should be a leaf action).
LaLiquidAdmin.prototype._launchApp =
function(appName) {
	if (!this._apps[appName])
		this._createApp(appName);
DBG.println(LsDebug.DBG1, "Launching app " + appName);
	this._apps[appName].launch();
}

// Listeners

// Banner button mouseover/mouseout handlers
LaLiquidAdmin._bannerBarMouseHdlr =
function(ev) {
	window.status = LaMsg.done;
	return true;
}

LaLiquidAdmin.prototype._showLoginDialog =
function(bReloginMode) {
	this._authenticating = true;
	this._loginDialog.setVisible(true, false);
	this._loginDialog.setUpKeyHandlers();	
	try {
		this._loginDialog.setFocus(this._appCtxt.getUsername(), bReloginMode);
	} catch (ex) {
		// something is out of whack... just make the user relogin
		LaLiquidAdmin.logOff();
	}
}

LaLiquidAdmin.prototype._hideLoginDialog =
function() {
	this._loginDialog.setVisible(false);
	this._loginDialog.setError(null);
	this._loginDialog.clearPassword();
	this._loginDialog.clearKeyHandlers();	
}

// Banner button click
LaLiquidAdmin._bannerBarHdlr =
function(id, tableId) {
	var bannerBar = Dwt.getObjectFromElement(Dwt.getDomObj(document,tableId));
	if(!bannerBar)
		return;
		
	var doc = bannerBar.getDocument();
	switch (id) {
		case LaLiquidAdmin._MIGRATION_ID:
			Dwt.getDomObj(doc, bannerBar._migrationId).blur();
			Dwt.getDomObj(doc, bannerBar._migrationId2).blur();			
			window.open("/liquidAdmin/migrationwizard/MigrationWizard.exe");
			break;
			
		case LaLiquidAdmin._HELP_ID:
			Dwt.getDomObj(doc, bannerBar._helpId).blur();
			Dwt.getDomObj(doc, bannerBar._helpId2).blur();			
			window.open("/liquidAdmin/adminhelp/html/WebHelp/administration_console_help.htm");
			break;

		case LaLiquidAdmin._PDF_HELP_ID:
			Dwt.getDomObj(doc, bannerBar._helpId).blur();
			Dwt.getDomObj(doc, bannerBar._helpId2).blur();			
			window.open("/liquidAdmin/adminhelp/pdf/admin.pdf");
			break;
						
		case LaLiquidAdmin._LOGOFF_ID:
			Dwt.getDomObj(doc, bannerBar._logOffId).blur();
			LaLiquidAdmin.logOff();
			break;
	}
}

// This method is called by the window.onbeforeunload method.
LaLiquidAdmin._confirmExitMethod =
function() {
	return LaMsg.appExitWarning;
}
