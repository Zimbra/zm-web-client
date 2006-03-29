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
ZmController.CONVLIST_VIEW 				= i++;
ZmController.CONV_VIEW 					= i++;
ZmController.TRAD_VIEW 					= i++;
ZmController.MSG_VIEW 					= i++;
ZmController.MSG_NEW_WIN_VIEW			= i++; // needed for HACK (see ZmMailMsg)
ZmController.CONTACT_CARDS_VIEW			= i++;
ZmController.CONTACT_SIMPLE_VIEW 		= i++;
ZmController.CONTACT_VIEW				= i++;
ZmController.READING_PANE_VIEW 			= i++;
ZmController.ATT_LIST_VIEW 				= i++;
ZmController.ATT_ICON_VIEW 				= i++;
ZmController.CAL_VIEW					= i++;
ZmController.COMPOSE_VIEW				= i++;
ZmController.CONTACT_SRC_VIEW			= i++; // contact picker source list
ZmController.CONTACT_TGT_VIEW			= i++; // contact picker target list
ZmController.PREF_VIEW					= i++;
ZmController.CAL_DAY_VIEW				= i++;
ZmController.CAL_SCHEDULE_VIEW			= i++;
ZmController.CAL_WEEK_VIEW				= i++;
ZmController.CAL_MONTH_VIEW				= i++;
ZmController.CAL_WORK_WEEK_VIEW			= i++;
ZmController.APPT_DETAIL_VIEW			= i++;
ZmController.APPOINTMENT_VIEW 			= i++;
ZmController.MIXED_VIEW					= i++;
ZmController.IM_CHAT_TAB_VIEW			= i++;
ZmController.IM_CHAT_MULTI_WINDOW_VIEW	= i++;
ZmController.NOTE_VIEW					= i++;
ZmController.NOTE_EDIT_VIEW				= i++;
ZmController.NOTE_FILE_VIEW				= i++;
ZmController.NOTE_SITE_VIEW				= i++;

// Abstract methods

ZmController.prototype._setView =
function() {
};

// Public methods

ZmController.prototype.toString = 
function() {
	return "ZmController";
};

ZmController.prototype.popupErrorDialog = 
function(msg, ex, noExecReset, hideReportButton)  {
	if (!noExecReset)
		this._execFrame = {func: null, args: null, restartOnError: false};
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

ZmController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmController.handleKeyAction");
	switch (actionCode) {
		case ZmKeyMap.NEW_APPT:
			var appt = new ZmAppt(this._appCtxt);
			this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalendarController().show(appt);
			break;
			
		case ZmKeyMap.NEW_CALENDAR:
			alert("New Calendar");
			break;
			
		case ZmKeyMap.NEW_CONTACT:
			var contact = new ZmContact(this._appCtxt);
			this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController().show(contact);
			break;
			
		case ZmKeyMap.NEW_FOLDER:
			alert("New Folder");
			break;
			
		case ZmKeyMap.NEW_MESSAGE:
			var inNewWindow = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE);
			this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController().doAction(ZmOperation.NEW_MESSAGE, inNewWindow);
			break;
			
		case ZmKeyMap.NEW_TAG:
			alert("New Tag");
			break;	
	}
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
	if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == ZmCsfeException.NO_AUTH_TOKEN) {
		var bReloginMode = true;
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED) {
			// remember the last operation attempted ONLY for expired auth token exception
			if (method)
				this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, func: method, args: params, restartOnError: restartOnError};
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
		this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, func: method, args: params, restartOnError: restartOnError};
		this._errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
		// bug fix #5603 - error msg for mail.SEND_FAILURE takes an argument
		var args = (ex.code == ZmCsfeException.MAIL_SEND_FAILURE) ? ex.code : null;
		var msg = ex.getErrorMsg ? ex.getErrorMsg(args) : ex.msg ? ex.msg : ex.message;
		this.popupErrorDialog(msg, ex, true);
	}
};

/*
* User is logging in after an auth exception. If it was AUTH_EXPIRED, we try to complete what the
* user was doing at the time (if the caller passed us the data we need to resume it).
*
* @param username	[string]	user name
* @param password	[string]	user password
* @param rememberMe	[boolean]	if true, preserve user's auth token
*/
ZmController.prototype._doAuth = 
function(username, password, rememberMe) {
	ZmCsfeCommand.clearAuthToken();
	var auth = new ZmAuthenticate(this._appCtxt);
	var respCallback = new AjxCallback(this, this._handleResponseDoAuth, rememberMe);
	auth.execute(username, password, respCallback);
};

ZmController.prototype._handleResponseDoAuth =
function(rememberMe, result) {
	try {
		result.getResponse();
		this._authenticating = false;
		this._appCtxt.setRememberMe(rememberMe);
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
		} else if (ex.code == ZmCsfeException.ACCT_MAINTENANCE_MODE) {
			this._loginDialog.setError(ZmMsg.errorMaintenanceMode + " " + ZmMsg.errorContact);
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
function(username, password, rememberMe) {
	this._doAuth(username, password, rememberMe);
};

ZmController.prototype._doLastSearch = 
function() {
	var obj = this._execFrame.obj ? this._execFrame.obj : this;
	this._execFrame.func.apply(obj, this._execFrame.args);
	this._execFrame = null;
};

/*********** Msg dialog Callbacks */

ZmController.prototype._errorDialogCallback =
function() {
	this._errorDialog.popdown();
	if (this._execFrame) {
		if (this._execFrame.restartOnError && !this._authenticating)
			this._execFrame.func.apply(this, this._execFrame.args);
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
