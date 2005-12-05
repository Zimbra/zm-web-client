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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmController(appCtxt, container, app) {

	if (arguments.length == 0) return;

	this._appCtxt = appCtxt;
	this._container = container;
	this._app = app;
	
	this._shell = appCtxt.getShell();
	this._appViews = new Object();   
	this._currentView = null;                            
	
	this._authenticating = false;

	this._loginDialog = appCtxt.getLoginDialog();
	this._loginDialog.registerCallback(this._loginCallback, this);

	this._msgDialog = appCtxt.getMsgDialog();
	
	this._errorDialog = appCtxt.getErrorDialog();
    this._errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
};

var i = 1;
ZmController.CONVLIST_VIEW 			= i++;
ZmController.CONV_VIEW 				= i++;
ZmController.TRAD_VIEW 				= i++;
ZmController.MSG_VIEW 				= i++;
ZmController.MSG_NEW_WIN_VIEW        = i++; // needed for HACK (see ZmMailMsg)
ZmController.CONTACT_CARDS_VIEW      = i++;
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
ZmController.CAL_SCHEDULE_VIEW		= i++;
ZmController.CAL_WEEK_VIEW			= i++;
ZmController.CAL_MONTH_VIEW			= i++;
ZmController.CAL_WORK_WEEK_VIEW		= i++;
ZmController.APPT_DETAIL_VIEW		= i++;
ZmController.APPOINTMENT_VIEW 		= i++;
ZmController.MIXED_VIEW				= i++;
ZmController.IM_CHAT_TAB_VIEW         = i++;
ZmController.IM_CHAT_MULTI_WINDOW_VIEW      = i++;

// Abstract methods

ZmController.prototype._setView =
function() {
};

// Public methods

ZmController.prototype.toString = 
function() {
	return "ZmController";
};

/*
* We do the whole schedule/execute thing to give the shell the opportunity to popup its "busy" 
* overlay so that user input is blocked. For example, if a search takes a while to complete, 
* we don't want the user's clicking on the search button to cause it to re-execute repeatedly 
* when the events arrive from the UI. Since the action is executed via win.setTimeout(), it
* must be a leaf action (scheduled actions are executed after the calling code returns to the
* UI loop). You can't schedule something, and then have subsequent code that depends on the 
* results of the scheduled action.
*/
ZmController.prototype._schedule =
function(method, params, delay, asyncMode) {
	delay = delay ? delay : 0;
	if (asyncMode) {
		method.call(this, params);
	} else {
		if (delay == 0) {
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
};

ZmController._exec =
function(method, params, delay) {
	method.call(this, params);
	if (!delay) {
		this._shell.setBusy(false);
	}
};

ZmController.prototype.popupErrorDialog = 
function(msg, ex, noExecReset, hideReportButton)  {
	if (!noExecReset)
		this._execFrame = {method: null, params: null, restartOnError: false};
	// popup alert
	var detailStr = "";
	if (typeof ex == "string") {
		// in case an Error makes it here
		detailStr = ex;
	} else if (ex instanceof Object) {
		for (var prop in ex) {
			if (typeof ex[prop] == "function") continue; // skip functions
			detailStr = detailStr + prop + " - " + ex[prop] + "\n";				
		}
	}
	this._errorDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	this._errorDialog.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, !hideReportButton);
	this._errorDialog.popup();
};

ZmController.prototype.setCurrentView =
function(view) {
	this._currentView = view;
};

ZmController.prototype.handleKeyPressEvent =
function(ev) {
};

ZmController.prototype._showLoginDialog =
function(bReloginMode) {
	this._authenticating = true;
	this._loginDialog.setVisible(true, false);
	try {
		this._loginDialog.setFocus(this._appCtxt.getUsername(), bReloginMode);
	} catch (ex) {
		// do nothing. just catch and hope for the best.
	}
};

ZmController.prototype._processPrePopView = 
function(view) {
	// overload me
};

/*
* Common exception handling entry point for sync and async commands.
*/
ZmController.prototype._handleError =
function(ex, method, params) {
	this._handleException(ex, method, params, false);
};

ZmController.prototype._handleException =
function(ex, method, params, restartOnError, obj) {
	DBG.dumpObj(AjxDebug.DBG1, ex);
	if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == ZmCsfeException.NO_AUTH_TOKEN) {
		var bReloginMode = true;
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED) {
			// remember the last operation attempted ONLY for expired auth token exception
			if (method)
				this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, method: method, params: params, restartOnError: restartOnError};
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
		this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, method: method, params: params, restartOnError: restartOnError};
		this._errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
		var msg = this._getErrorMsg(ex.code, params);
		this.popupErrorDialog(msg, ex, true);
	}
};

// Map error code to error message. Optional params can be substituted.
ZmController.prototype._getErrorMsg =
function(code, params) {
	var msg = null;
	
	switch (code) {
		// network errors
		case AjxException.NETWORK_ERROR:				msg = ZmMsg.errorNetwork; break;
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
};

/*
* User is logging in after an auth exception. If it was AUTH_EXPIRED, we try to complete what the
* user was doing at the time (if the caller passed us the data we need to resume it).
*
* @param username	[string]	user name
* @param password	[string]	user password
* @param pubComp	[boolean]
*/
ZmController.prototype._doAuth = 
function(username, password, pubComp) {
	ZmCsfeCommand.clearAuthToken();
	var auth = new ZmAuthenticate(this._appCtxt);
	var respCallback = new AjxCallback(this, this._handleResponseDoAuth, [pubComp]);
	auth.execute(username, password, respCallback);
};

ZmController.prototype._handleResponseDoAuth =
function(args) {
	var pubComp	= args[0];
	var result	= args[1];
	
	try {
		result.getResponse();
	   	this._authenticating = false;
	   	this._appCtxt.setIsPublicComputer(pubComp);
	   	if (this._execFrame instanceof AjxCallback) {
		   	// exec frame for an async call is a callback
	   		this._execFrame.run();
	   		this._execFrame = null;
	   	} else if (this._execFrame) {
			// old-style exec frame is obj
	   		this._doLastSearch();
	   	} else {
	   		// if no exec frame, start over
		   	this._appCtxt.getAppController().startup(); // restart application
	   	}
	   	this._hideLoginDialog();
	} catch (ex) {
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED || ex.code == ZmCsfeException.SVC_INVALID_REQUEST) {
			this._loginDialog.setError(ZmMsg.loginError);
		} else {
			this.popupErrorDialog(ZmMsg.errorGeneric, ex); 
		}
	}	
};

ZmController.prototype._hideLoginDialog =
function() {
	this._loginDialog.setVisible(false);
	this._loginDialog.setError(null);
	this._loginDialog.clearPassword();
};

/*********** Login dialog Callbacks */

ZmController.prototype._loginCallback =
function(args) {
	this._doAuth(args[0], args[1], args[2]);
};

ZmController.prototype._doLastSearch = 
function() {
	var obj = this._execFrame.obj ? this._execFrame.obj : this;
	this._execFrame.method.call(obj, this._execFrame.params);
	this._execFrame = null;
};

/*********** Msg dialog Callbacks */

ZmController.prototype._errorDialogCallback =
function() {
	this._errorDialog.popdown();
	if (this._execFrame) {
		if (this._execFrame.restartOnError && !this._authenticating)
			this._execFrame.method.call(this, this._execFrame.params);
		this._execFrame = null;
	}
};


// Pop up a dialog. Since it's a shared resource, we need to reset first.
ZmController.prototype._showDialog = 
function(dialog, callback, data, loc, args) {
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback, this, args);
	dialog.popup(data, loc);
};

// Pop down the dialog and clear any pending actions (initiated from an action menu).
// The action menu's popdown listener got deferred when the dialog popped up, so
// run it now.
ZmController.prototype._clearDialog =
function(dialog) {
	dialog.popdown();
	this._pendingActionData = null;
	this._popdownActionListener();
};

ZmController.prototype._popdownActionListener = function() {};
