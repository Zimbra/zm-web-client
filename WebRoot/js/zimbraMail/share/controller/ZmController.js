function ZmController(appCtxt, container, app, isAdmin) {

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
ZmController.CONVLIST_VIEW 			= i++;
ZmController.CONV_VIEW 				= i++;
ZmController.TRAD_VIEW 				= i++;
ZmController.MSG_VIEW 				= i++;
ZmController.MSG_NEW_WIN_VIEW 		= i++; // needed for HACK (see ZmMailMsg)
ZmController.CONTACT_CARDS_VIEW 	= i++;
ZmController.CONTACT_SIMPLE_VIEW 	= i++;
ZmController.CONTACT_VIEW			= i++;
ZmController.READING_PANE_VIEW 		= i++;
ZmController.ATT_LIST_VIEW 			= i++;
ZmController.ATT_ICON_VIEW 			= i++;
ZmController.CAL_VIEW				= i++;
ZmController.COMPOSE_VIEW			= i++;
ZmController.CONTACT_SRC_VIEW		= i++; // contact picker source list
ZmController.CONTACT_TGT_VIEW		= i++; // contact picker target list
ZmController.PREF_VIEW				= i++;
ZmController.CAL_DAY_VIEW			= i++;
ZmController.CAL_WEEK_VIEW			= i++;
ZmController.CAL_MONTH_VIEW			= i++;
ZmController.CAL_WORK_WEEK_VIEW		= i++;
ZmController.APPT_DETAIL_VIEW		= i++;
ZmController.MIXED_VIEW				= i++;

// Abstract methods

ZmController.prototype._setView =
function() {
}

// Public methods

ZmController.prototype.toString = 
function() {
	return "ZmController";
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
ZmController.prototype._schedule =
function(method, params, delay) {
	if (!delay) {
		delay = 0;
		this._shell.setBusy(true);
	}
	this._action = new AjxTimedAction();
	this._action.obj = this;
	this._action.method = ZmController._exec;
	this._action.params.removeAll();
	this._action.params.add(method);
	this._action.params.add(params);
	this._action.params.add(delay);
	return AjxTimedAction.scheduleAction(this._action, delay);
}

ZmController._exec =
function(method, params, delay) {
	method.call(this, params);
	if (!delay)
		this._shell.setBusy(false);
}

ZmController.prototype.popupMsgDialog = 
function(msg, ex, noExecReset)  {
	if (!noExecReset)
		this._execFrame = {method: null, params: null, restartOnError: false};
	// popup alert
	var detailStr = "";
	for (var prop in ex)
		detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
	this._msgDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	this._msgDialog.popup();
}

ZmController.prototype.getControllerForView =
function(view) {
	switch (view) {
		case ZmController.CONVLIST_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvListController();
		case ZmController.CONV_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvController();
		case ZmController.TRAD_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getTradController();
		case ZmController.MSG_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
		case ZmController.CONTACT_CARDS_VIEW:
		case ZmController.CONTACT_SIMPLE_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactListController();
		case ZmController.CONTACT_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController();
		case ZmController.CAL_VIEW:
		case ZmController.CAL_DAY_VIEW:
		case ZmController.CAL_WEEK_VIEW:
		case ZmController.CAL_MONTH_VIEW:
		case ZmController.CAL_WORK_WEEK_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		case ZmController.ATT_LIST_VIEW:
		case ZmController.ATT_ICON_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getAttachmentListController();
		case ZmController.COMPOSE_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
		case ZmController.PREF_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getPrefController();
		case ZmController.MIXED_VIEW:
			return this._appCtxt.getApp(ZmZimbraMail.MIXED_APP).getMixedController();
		case ZmController.APPT_DETAIL_VIEW:
		    return this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
		default: {
			DBG.println(AjxDebug.DBG1, "*** controller not found for view " + view);
			return this._appCtxt.getAppController();}
	}
}

ZmController.prototype.setCurrentView =
function(view) {
	this._currentView = view;
}

ZmController.prototype._showLoginDialog =
function(bReloginMode) {
	this._authenticating = true;
	this._loginDialog.setVisible(true, false);
	try {
		this._loginDialog.setFocus(this._appCtxt.getUsername(), bReloginMode);
	} catch (ex) {
		// do nothing. just catch and hope for the best.
	}
}

ZmController.prototype._processPrePopView = 
function(view) {
	// overload me
}

ZmController.prototype._handleException =
function(ex, method, params, restartOnError, obj) {
	DBG.dumpObj(AjxDebug.DBG1, ex);
	if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == ZmCsfeException.NO_AUTH_TOKEN) {
		var bReloginMode = true;
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED) {
			// remember the last operation attempted ONLY for expired auth token exception
			this._execFrame = {obj: obj, method: method, params: params, restartOnError: restartOnError};
			this._loginDialog.registerCallback(this._loginCallback, this);
			this._loginDialog.setError(ZmMsg.sessionExpired);
		} else if (ex.code == ZmCsfeException.SVC_AUTH_REQUIRED) {
			// bug fix #413 - always logoff if we get a auth required
			ZmZimbraMail.logOff();
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
ZmController.prototype._getErrorMsg =
function(code, params) {
	var msg = null;
	
	switch (code) {
		// network errors
		case AjxException.NETWORK_ERROR:					msg = ZmMsg.errorNetwork; break;
		case ZmCsfeException.NETWORK_ERROR:				msg = ZmMsg.errorNetwork; break;
		case ZmCsfeException.SOAP_ERROR: 				msg = ZmMsg.errorNetwork; break;
		case ZmCsfeException.CSFE_SVC_ERROR: 			msg = ZmMsg.errorService; break;
		
		// CSFE errors
		case ZmCsfeException.SVC_FAILURE: 				msg = ZmMsg.errorService; break;
		case ZmCsfeException.SVC_UNKNOWN_DOCUMENT: 		msg = ZmMsg.errorUnknownDoc; break;
		case ZmCsfeException.SVC_PARSE_ERROR: 			msg = ZmMsg.errorParse; break;
		case ZmCsfeException.SVC_PERM_DENIED: 			msg = ZmMsg.errorPermission; break;
		
		// account errors
		case ZmCsfeException.ACCT_NO_SUCH_ACCOUNT: 		msg = ZmMsg.errorNoSuchAcct; break;
		case ZmCsfeException.ACCT_INVALID_PASSWORD: 	msg = ZmMsg.errorInvalidPass; break;
		case ZmCsfeException.ACCT_INVALID_PREF_NAME:	msg = ZmMsg.errorInvalidPrefName; break;
		case ZmCsfeException.ACCT_INVALID_PREF_VALUE: 	msg = ZmMsg.errorInvalidPrefValue; break;
		case ZmCsfeException.ACCT_NO_SUCH_SAVED_SEARCH: msg = ZmMsg.errorNoSuchSavedSearch; break;
		case ZmCsfeException.ACCT_NO_SUCH_TAG:  		msg = ZmMsg.errorNoSuchTag; break;
		case ZmCsfeException.ACCT_PASS_RECENTLY_USED: 	msg = ZmMsg.errorPassRecentlyUsed; break;

		// mail errors
		case ZmCsfeException.MAIL_INVALID_NAME: 		msg = AjxStringUtil.resolve(ZmMsg.errorInvalidName, params.name); break;
		case ZmCsfeException.MAIL_NO_SUCH_FOLDER: 		msg = ZmMsg.errorNoSuchFolder; break;
		case ZmCsfeException.MAIL_NO_SUCH_TAG:	 		msg = ZmMsg.errorNoSuchTag; break;
		case ZmCsfeException.MAIL_NO_SUCH_CONV:  		msg = ZmMsg.errorNoSuchConv; break;
		case ZmCsfeException.MAIL_NO_SUCH_MSG: 			msg = ZmMsg.errorNoSuchMsg; break;
		case ZmCsfeException.MAIL_NO_SUCH_PART: 		msg = ZmMsg.errorNoSuchPart; break;
		case ZmCsfeException.MAIL_QUERY_PARSE_ERROR:	msg = ZmMsg.errorQueryParse; break;
		case ZmCsfeException.MAIL_QUOTA_EXCEEDED: 		msg = ZmMsg.errorQuotaExceeded; break;

		// general errors
		default: 									msg = ZmMsg.errorGeneric; break;
	}
	
	return msg;
}

ZmController.prototype._doAuth = 
function(params) {
	ZmCsfeCommand.clearAuthToken();
	var auth = new ZmAuthenticate(this._appCtxt);
	try {
		auth.execute(params.username, params.password);
    	this._authenticating = false;
    	this._appCtxt.setIsPublicComputer(params.pubComp);
		this._appCtxt.getAppController().startup({bIsRelogin: (this._execFrame != null)}); // restart application after login
		// Schedule this since we want to make sure the app is built up before we actually hide the login dialog
		this._schedule(this._hideLoginDialog);
		if (this._execFrame)
			this._schedule(this._doZastSearch);
	} catch (ex) {
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED || 
			ex.code == ZmCsfeException.SVC_INVALID_REQUEST) 
		{
			this._loginDialog.setError(ZmMsg.loginError);
			return;
		} else {
			this.popupMsgDialog(ZmMsg.errorGeneric, ex); 
		}
	}
}

ZmController.prototype._hideLoginDialog =
function() {
	this._loginDialog.setVisible(false);
	this._loginDialog.setError(null);
	this._loginDialog.clearPassword();
}

/*********** Login dialog Callbacks */

ZmController.prototype._loginCallback =
function(args) {
	this._schedule(this._doAuth, {username: args[0], password: args[1], pubComp: args[2]});
}

ZmController.prototype._doZastSearch = 
function() {
	var obj = this._execFrame.obj ? this._execFrame.obj : this;
	this._execFrame.method.call(obj, this._execFrame.params);
	this._execFrame = null;
}

/*********** Msg dialog Callbacks */

ZmController.prototype._msgDialogCallback =
function() {
	this._msgDialog.popdown();
	if (this._execFrame) {
		if (this._execFrame.restartOnError && !this._authenticating)
			this._execFrame.method.call(this, this._execFrame.params);
		this._execFrame = null;
	}
}


// Pop up a dialog. Since it's a shared resource, we need to reset first.
ZmController.prototype._showDialog = 
function(dialog, callback, data, loc, args) {
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback, this, args);
	dialog.popup(data, loc);
}

// Pop down the dialog and clear any pending actions (initiated from an action menu).
// The action menu's popdown listener got deferred when the dialog popped up, so
// run it now.
ZmController.prototype._clearDialog =
function(dialog) {
	dialog.popdown();
	this._pendingActionData = null;
	this._popdownActionListener();
}
