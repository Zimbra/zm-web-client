function LaController(appCtxt, container, app, isAdmin) {

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
    if(app) {
    	this._msgDialog.setApp(app);
    }	
}

var i = 1;
LaController.CONVLIST_VIEW 		= i++;
LaController.CONV_VIEW 			= i++;
LaController.TRAD_VIEW 			= i++;
LaController.MSG_VIEW 			= i++;
LaController.MSG_NEW_WIN_VIEW 	= i++; // needed for HACK (see LmMailMsg)
LaController.CONTACT_CARDS_VIEW = i++;
LaController.CONTACT_LIST_VIEW 	= i++;
LaController.CONTACT_VIEW		= i++;
LaController.SINGLE_PANE_VIEW 	= i++;
LaController.DOUBLE_PANE_VIEW 	= i++;
LaController.ATT_LIST_VIEW 		= i++;
LaController.ATT_ICON_VIEW 		= i++;
LaController.CAL_VIEW			= i++;
LaController.COMPOSE_VIEW		= i++;
LaController.CONTACT_SRC_VIEW	= i++; // contact picker source list
LaController.CONTACT_TGT_VIEW	= i++; // contact picker target list
LaController.PREF_VIEW			= i++;
LaController.CAL_DAY_VIEW		= i++;
LaController.CAL_WEEK_VIEW		= i++;
LaController.CAL_MONTH_VIEW		= i++;
LaController.CAL_WORK_WEEK_VIEW	= i++;


// Public methods
LaController.prototype.toString = 
function() {
	return "LaController";
}

LaController.prototype.setDirty = 
function (isD) {
	//overwrite this method to disable toolbar buttons, for example, Save button
}

LaController.prototype.setCurrentView =
function(view) {
	this._currentView = view;
}

LaController.prototype.setEnabled = 
function(enable) {
	//abstract
//	throw new LsException("This method is abstract", LsException.UNIMPLEMENTED_METHOD, "LaController.prototype.setEnabled");	
}

LaController.prototype.popupMsgDialog = 
function(msg, ex, noExecReset)  {
	if (!noExecReset)
		this._execFrame = {method: null, params: null, restartOnError: false};
	
	var detailStr = "";
	if(ex != null) {
		if(ex.msg) {
			detailStr += "Message:  ";
		    detailStr += ex.msg;
		    detailStr += "\n";			    
		}
		if(ex.code) {
			detailStr += "Code:  ";
		    detailStr += ex.code;
		    detailStr += "\n";			    
		}
		if(ex.method) {
			detailStr += "Method:  ";
		    detailStr += ex.method;
		    detailStr += "\n";			    
		}
		if(ex.detail) {
			detailStr += "Details:  ";
		    detailStr += ex.detail;
		    detailStr += "\n";			    
		}
	}
	// popup alert
	this._msgDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, LaMsg.liquidAdminTitle);
	this._msgDialog.popup();
}

LaController.prototype.getControllerForView =
function(view) {
	switch (view) {
		case LaController.CONVLIST_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvListController();
		case LaController.CONV_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvController();
		case LaController.TRAD_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getTradController();
		case LaController.MSG_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getMsgController();
		case LaController.CONTACT_CARDS_VIEW:
		case LaController.CONTACT_LIST_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactListController();
		case LaController.CONTACT_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController();
		case LaController.CAL_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.CALENDAR_APP).getCalController();
		case LaController.ATT_LIST_VIEW:
		case LaController.ATT_ICON_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getAttachmentListController();
		case LaController.COMPOSE_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
		case LaController.PREF_VIEW:
			return this._appCtxt.getApp(LmLiquidMail.PREFERENCES_APP).getPrefController();
		default: {
			DBG.println(LsDebug.DBG1, "*** controller not found for view " + view);
			return this._appCtxt.getAppController();}
	}
}

//Private/protected methods

LaController.prototype._setView =
function() {

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
LaController.prototype._schedule =
function(method, params, delay) {
	if (!delay) {
		delay = 0;
		this._shell.setBusy(true);
	}
	this._action = new LsTimedAction();
	this._action.obj = this;
	this._action.method = LaController._exec;
	this._action.params.removeAll();
	this._action.params.add(method);
	this._action.params.add(params);
	this._action.params.add(delay);
	return LsTimedAction.scheduleAction(this._action, delay);
}

LaController._exec =
function(method, params, delay) {
	method.call(this, params);
	if (!delay)
		this._shell.setBusy(false);
}



LaController.prototype._showLoginDialog =
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

LaController.prototype._handleException =
function(ex, method, params, restartOnError, obj) {
	DBG.dumpObj(ex);
	if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == LsCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == LsCsfeException.NO_AUTH_TOKEN) 
	{
		var bReloginMode = true;
		if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED) 
		{
			// remember the last search attempted ONLY for expired auto token exception
			this._execFrame = {obj: obj, method: method, params: params, restartOnError: restartOnError};
			this._loginDialog.registerCallback(this._loginCallback, this);
			this._loginDialog.setError(LaMsg.ERROR_SESSION_EXPIRED);
		} else {
			this._loginDialog.setError(null);
			bReloginMode = false;
		}
		this._loginDialog.setReloginMode(bReloginMode, this._appCtxt.getAppController(), this);
		this._showLoginDialog(bReloginMode);
	} 
	else 
	{
		this._execFrame = {obj: obj, method: method, params: params, restartOnError: restartOnError};
		this._msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._msgDialogCallback, this);
		if (ex.code == LsCsfeException.SOAP_ERROR) {
			this.popupMsgDialog(LaMsg.SOAP_ERROR, ex, true);
		} else if (ex.code == LsCsfeException.NETWORK_ERROR) {
			this.popupMsgDialog(LaMsg.NETWORK_ERROR, ex, true);
		} else if (ex.code ==  LsCsfeException.SVC_PARSE_ERROR) {
			this.popupMsgDialog(LaMsg.PARSE_ERROR, ex, true);
		} else if (ex.code ==  LsCsfeException.SVC_PERM_DENIED) {
			this.popupMsgDialog(LaMsg.PERMISSION_DENIED, ex, true);
		} else if (ex.code == LsCsfeException.ACCT_NO_SUCH_ACCOUNT) {
			this.popupMsgDialog(LaMsg.ERROR_NO_SUCH_ACCOUNT, ex, true);
		} else if (ex.code == LsCsfeException.CSFE_SVC_ERROR || ex.code == LsCsfeException.SVC_FAILURE || (ex.code && ex.code.match(/^(service|account|mail)\./))) {
			this.popupMsgDialog(LaMsg.SERVER_ERROR, ex, true);
		} else {
			//search for error code
			var gotit = false;
			for(var ix in LsCsfeException) {
				if(LsCsfeException[ix] == ex.code) {
					this.popupMsgDialog(LaMsg.SERVER_ERROR, ex, true);
					gotit = true;
					break;
				}
			}
			if(!gotit)
				this.popupMsgDialog(LaMsg.JAVASCRIPT_ERROR + " in method " + method, ex, true);
		}
	}
}

LaController.prototype._doAuth = 
function(params) {
	LsCsfeCommand.clearAuthToken();
	var auth = new LaAuthenticate(this._appCtxt);
	try {
		auth.execute(params.username, params.password);
    	this._authenticating = false;
		this._appCtxt.getAppController().startup({bIsRelogin: (this._execFrame != null)}); // restart application after login
		// Schedule this since we want to make sure the app is built up before we actually hide the login dialog
		this._schedule(this._hideLoginDialog);
	} catch (ex) {
		if (ex.code == LsCsfeException.ACCT_AUTH_FAILED || 
			ex.code == LsCsfeException.INVALID_REQUEST) 
		{
			this._loginDialog.setError(LaMsg.ERROR_AUTH_FAILED);
			return;
		} else if(ex.code == LsCsfeException.SVC_PERM_DENIED) {
			this._loginDialog.setError(LaMsg.ERROR_AUTH_NO_ADMIN_RIGHTS);
			return;
		} else {
			this.popupMsgDialog(LaMsg.SERVER_ERROR, ex); 
		}
	}
}

LaController.prototype._hideLoginDialog =
function() {
	this._appCtxt.getAppController().createBannerBarHtml();
	this._loginDialog.setVisible(false);
	this._loginDialog.setError(null);
	this._loginDialog.clearPassword();
	this._loginDialog.clearKeyHandlers();
}

/*********** Login dialog Callbacks */

LaController.prototype._loginCallback =
function(args) {
	this._schedule(this._doAuth, {username: args[0], password: args[1]});
}


/*********** Msg dialog Callbacks */

LaController.prototype._msgDialogCallback =
function() {
	this._msgDialog.popdown();
	if (this._execFrame) {
		if (this._execFrame.restartOnError && !this._authenticating)
			this._execFrame.method.call(this, this._execFrame.params);
		this._execFrame = null;
	}
}


// Pop up a dialog. Since it's a shared resource, we need to reset first.
LaController.prototype._showDialog = 
function(dialog, callback, organizer, loc, args) {
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback, this, args);
	dialog.popup(organizer, loc);
}
