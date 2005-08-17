function LmController(appCtxt, container, app, isAdmin) {

	if (arguments.length == 0) return;

	this._appCtxt = appCtxt;
	this._container = container;
	this._app = app;
	
	this._shell = appCtxt.getShell();
	this._appViews = new Object();   
	this._currentView = null;                            
	
	this._authenticating = false;

	this._loginDialog = appCtxt.getLoginDialog(isAdmin);
	this._loginDialog.registerCallback(this._loginCallback, this);

	this._msgDialog = appCtxt.getMsgDialog();
    this._msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._msgDialogCallback, this);
}

var i = 1;
LmController.CONVLIST_VIEW 			= i++;
LmController.CONV_VIEW 				= i++;
LmController.TRAD_VIEW 				= i++;
LmController.MSG_VIEW 				= i++;
LmController.MSG_NEW_WIN_VIEW 		= i++; // needed for HACK (see LmMailMsg)
LmController.CONTACT_CARDS_VIEW 	= i++;
LmController.CONTACT_SIMPLE_VIEW 	= i++;
LmController.CONTACT_VIEW			= i++;
LmController.READING_PANE_VIEW 		= i++;
LmController.ATT_LIST_VIEW 			= i++;
LmController.ATT_ICON_VIEW 			= i++;
LmController.CAL_VIEW				= i++;
LmController.COMPOSE_VIEW			= i++;
LmController.CONTACT_SRC_VIEW		= i++; // contact picker source list
LmController.CONTACT_TGT_VIEW		= i++; // contact picker target list
LmController.PREF_VIEW				= i++;
LmController.CAL_DAY_VIEW			= i++;
LmController.CAL_WEEK_VIEW			= i++;
LmController.CAL_MONTH_VIEW			= i++;
LmController.CAL_WORK_WEEK_VIEW		= i++;
LmController.APPT_DETAIL_VIEW		= i++;
LmController.MIXED_VIEW				= i++;

// Abstract methods

LmController.prototype._setView =
function() {
}

// Public methods

LmController.prototype.toString = 
function() {
	return "LmController";
}

/*
* We do the whole schedule/execute thing to give the shell the opportunity to popup its "busy" 
* overlay so that user input is blocked. For example, if a search takes a while to complete, 
* we don't want the user's clicking on the search button to cause it to re-execute repeatedly 
* when the events arrive from the UI. Since the action is executed via win.setTimeout(), it
* must be a leaf action (scheduled actions are executed after the calling code returns to the
* UI loop). You can't schedule something, and then have subsequent code that depends on the 
* scheduled action. 
*/
LmController.prototype._schedule =
function(method, params, delay) {
	if (!delay) {
		delay = 0;
		this._shell.setBusy(true);
	}
	this._action = new LsTimedAction();
	this._action.obj = this;
	this._action.method = LmController._exec;
	this._action.params.removeAll();
	this._action.params.add(method);
	this._action.params.add(params);
	this._action.params.add(delay);
	return LsTimedAction.scheduleAction(this._action, delay);
}

LmController._exec =
function(method, params, delay) {
	method.call(this, params);
	if (!delay)
		this._shell.setBusy(false);
}

LmController.prototype.popupMsgDialog = 
function(msg, ex, noExecReset)  {
	if (!noExecReset)
		this._execFrame = {method: null, params: null, restartOnError: false};
	// popup alert
	var detailStr = "";
	for (var prop in ex)
		detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
	this._msgDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, LmMsg.zimbraTitle);
	this._msgDialog.popup();
}

LmController.prototype.getControllerForView =
function(view) {
	switch (view) {
		case LmController.CONVLIST_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvListController();
		case LmController.CONV_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController();
		case LmController.TRAD_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getTradController();
		case LmController.MSG_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getMsgController();
		case LmController.CONTACT_CARDS_VIEW:
		case LmController.CONTACT_SIMPLE_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactListController();
		case LmController.CONTACT_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController();
		case LmController.CAL_VIEW:
		case LmController.CAL_DAY_VIEW:
		case LmController.CAL_WEEK_VIEW:
		case LmController.CAL_MONTH_VIEW:
		case LmController.CAL_WORK_WEEK_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
		case LmController.ATT_LIST_VIEW:
		case LmController.ATT_ICON_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getAttachmentListController();
		case LmController.COMPOSE_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
		case LmController.PREF_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.PREFERENCES_APP).getPrefController();
		case LmController.MIXED_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MIXED_APP).getMixedController();
		case LmController.APPT_DETAIL_VIEW:
		    return this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
		default: {
			DBG.println(LsDebug.DBG1, "*** controller not found for view " + view);
			return this._appCtxt.getAppController();}
	}
}

LmController.prototype.setCurrentView =
function(view) {
	this._currentView = view;
}

LmController.prototype._showLoginDialog =
function(bReloginMode) {
	this._authenticating = true;
	this._loginDialog.setVisible(true, false);
	try {
		this._loginDialog.setFocus(this._appCtxt.getUsername(), bReloginMode);
	} catch (ex) {
		// do nothing. just catch and hope for the best.
	}
}

LmController.prototype._processPrePopView = 
function(view) {
	// overload me
}

LmController.prototype._handleException =
function(ex, method, params, restartOnError, obj) {
	DBG.dumpObj(LsDebug.DBG1, ex);
	if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == LsCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == LsCsfeException.NO_AUTH_TOKEN) {
		var bReloginMode = true;
		if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED) {
			// remember the last operation attempted ONLY for expired auth token exception
			this._execFrame = {obj: obj, method: method, params: params, restartOnError: restartOnError};
			this._loginDialog.registerCallback(this._loginCallback, this);
			this._loginDialog.setError(LmMsg.sessionExpired);
		} else if (ex.code == LsCsfeException.SVC_AUTH_REQUIRED) {
			// bug fix #413 - always logoff if we get a auth required
			LmLiquidMail.logOff();
			return;
		} else {
			this._loginDialog.setError(null);
			bReloginMode = false;
		}
		this._loginDialog.setReloginMode(bReloginMode, this._appCtxt.getAppController(), this);
		this._showLoginDialog(bReloginMode);
	} else {
		// remember the last search attempted for all other exceptions
		this._execFrame = {obj: obj, method: method, params: params, restartOnError: restartOnError};
		this._msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._msgDialogCallback, this);
		var msg = this._getErrorMsg(ex.code, params);
		this.popupMsgDialog(msg, ex, true);
	}
}

// Map error code to error message. Optional params can be substituted.
LmController.prototype._getErrorMsg =
function(code, params) {
	var msg = null;
	
	switch (code) {
		// network errors
		case LsException.NETWORK_ERROR:					msg = LmMsg.errorNetwork; break;
		case LsCsfeException.NETWORK_ERROR:				msg = LmMsg.errorNetwork; break;
		case LsCsfeException.SOAP_ERROR: 				msg = LmMsg.errorNetwork; break;
		case LsCsfeException.CSFE_SVC_ERROR: 			msg = LmMsg.errorService; break;
		
		// CSFE errors
		case LsCsfeException.SVC_FAILURE: 				msg = LmMsg.errorService; break;
		case LsCsfeException.SVC_UNKNOWN_DOCUMENT: 		msg = LmMsg.errorUnknownDoc; break;
		case LsCsfeException.SVC_PARSE_ERROR: 			msg = LmMsg.errorParse; break;
		case LsCsfeException.SVC_PERM_DENIED: 			msg = LmMsg.errorPermission; break;
		
		// account errors
		case LsCsfeException.ACCT_NO_SUCH_ACCOUNT: 		msg = LmMsg.errorNoSuchAcct; break;
		case LsCsfeException.ACCT_INVALID_PASSWORD: 	msg = LmMsg.errorInvalidPass; break;
		case LsCsfeException.ACCT_INVALID_PREF_NAME:	msg = LmMsg.errorInvalidPrefName; break;
		case LsCsfeException.ACCT_INVALID_PREF_VALUE: 	msg = LmMsg.errorInvalidPrefValue; break;
		case LsCsfeException.ACCT_NO_SUCH_SAVED_SEARCH: msg = LmMsg.errorNoSuchSavedSearch; break;
		case LsCsfeException.ACCT_NO_SUCH_TAG:  		msg = LmMsg.errorNoSuchTag; break;
		case LsCsfeException.ACCT_PASS_RECENTLY_USED: 	msg = LmMsg.errorPassRecentlyUsed; break;

		// mail errors
		case LsCsfeException.MAIL_INVALID_NAME: 		msg = LsStringUtil.resolve(LmMsg.errorInvalidName, params.name); break;
		case LsCsfeException.MAIL_NO_SUCH_FOLDER: 		msg = LmMsg.errorNoSuchFolder; break;
		case LsCsfeException.MAIL_NO_SUCH_TAG:	 		msg = LmMsg.errorNoSuchTag; break;
		case LsCsfeException.MAIL_NO_SUCH_CONV:  		msg = LmMsg.errorNoSuchConv; break;
		case LsCsfeException.MAIL_NO_SUCH_MSG: 			msg = LmMsg.errorNoSuchMsg; break;
		case LsCsfeException.MAIL_NO_SUCH_PART: 		msg = LmMsg.errorNoSuchPart; break;
		case LsCsfeException.MAIL_QUERY_PARSE_ERROR:	msg = LmMsg.errorQueryParse; break;
		case LsCsfeException.MAIL_QUOTA_EXCEEDED: 		msg = LmMsg.errorQuotaExceeded; break;

		// general errors
		default: 									msg = LmMsg.errorGeneric; break;
	}
	
	return msg;
}

LmController.prototype._doAuth = 
function(params) {
	LsCsfeCommand.clearAuthToken();
	var auth = new LmAuthenticate(this._appCtxt);
	try {
		auth.execute(params.username, params.password);
    	this._authenticating = false;
    	this._appCtxt.setIsPublicComputer(params.pubComp);
		this._appCtxt.getAppController().startup({bIsRelogin: (this._execFrame != null)}); // restart application after login
		// Schedule this since we want to make sure the app is built up before we actually hide the login dialog
		this._schedule(this._hideLoginDialog);
		if (this._execFrame)
			this._schedule(this._doLastSearch);
	} catch (ex) {
		if (ex.code == LsCsfeException.ACCT_AUTH_FAILED || 
			ex.code == LsCsfeException.SVC_INVALID_REQUEST) 
		{
			this._loginDialog.setError(LmMsg.loginError);
			return;
		} else {
			this.popupMsgDialog(LmMsg.errorGeneric, ex); 
		}
	}
}

LmController.prototype._hideLoginDialog =
function() {
	this._loginDialog.setVisible(false);
	this._loginDialog.setError(null);
	this._loginDialog.clearPassword();
}

/*********** Login dialog Callbacks */

LmController.prototype._loginCallback =
function(args) {
	this._schedule(this._doAuth, {username: args[0], password: args[1], pubComp: args[2]});
}

LmController.prototype._doLastSearch = 
function() {
	var obj = this._execFrame.obj ? this._execFrame.obj : this;
	this._execFrame.method.call(obj, this._execFrame.params);
	this._execFrame = null;
}

/*********** Msg dialog Callbacks */

LmController.prototype._msgDialogCallback =
function() {
	this._msgDialog.popdown();
	if (this._execFrame) {
		if (this._execFrame.restartOnError && !this._authenticating)
			this._execFrame.method.call(this, this._execFrame.params);
		this._execFrame = null;
	}
}


// Pop up a dialog. Since it's a shared resource, we need to reset first.
LmController.prototype._showDialog = 
function(dialog, callback, data, loc, args) {
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback, this, args);
	dialog.popup(data, loc);
}

// Pop down the dialog and clear any pending actions (initiated from an action menu).
// The action menu's popdown listener got deferred when the dialog popped up, so
// run it now.
LmController.prototype._clearDialog =
function(dialog) {
	dialog.popdown();
	this._pendingActionData = null;
	this._popdownActionListener();
}
