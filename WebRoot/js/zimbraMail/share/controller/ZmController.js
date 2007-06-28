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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmController = function(appCtxt, container, app) {

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

// view identifiers - need to be all caps
ZmController.APPOINTMENT_VIEW 			= "APPT";
ZmController.APPT_DETAIL_VIEW			= "APPTD";
ZmController.ATT_ICON_VIEW 				= "ATI";
ZmController.ATT_LIST_VIEW 				= "ATL";
ZmController.CAL_APPT_VIEW				= "CLA";
ZmController.CAL_DAY_VIEW				= "CLD";
ZmController.CAL_MONTH_VIEW				= "CLM";
ZmController.CAL_SCHEDULE_VIEW			= "CLS";
ZmController.CAL_VIEW					= "CAL";
ZmController.CAL_WEEK_VIEW				= "CLW";
ZmController.CAL_WORK_WEEK_VIEW			= "CLWW";
ZmController.CALLLIST_VIEW				= "CLIST";
ZmController.COMPOSE_VIEW				= "COMPOSE";
ZmController.CONTACT_CARDS_VIEW			= "CNC";
ZmController.CONTACT_SIMPLE_VIEW 		= "CNS";
ZmController.CONTACT_SRC_VIEW			= "CNSRC"; // contact picker source list
ZmController.CONTACT_TGT_VIEW			= "CNTGT"; // contact picker target list
ZmController.CONTACT_VIEW				= "CN";
ZmController.CONVLIST_VIEW 				= "CLV";
ZmController.CONV_VIEW 					= "CV";
ZmController.GROUP_VIEW					= "GRP";
ZmController.IM_CHAT_MULTI_WINDOW_VIEW	= "IMCMW";
ZmController.IM_CHAT_TAB_VIEW			= "IMCT";
ZmController.LOADING_VIEW				= "LOADING";
ZmController.MIXED_VIEW					= "MX";
ZmController.MSG_NEW_WIN_VIEW			= "MSGNW"; // needed for HACK (see ZmMailMsg)
ZmController.MSG_VIEW 					= "MSG";
ZmController.NOTEBOOK_FILE_VIEW			= "NBF";
ZmController.NOTEBOOK_PAGE_EDIT_VIEW	= "NBPE";
ZmController.NOTEBOOK_PAGE_VIEW			= "NBP";
ZmController.NOTEBOOK_SITE_VIEW			= "NBS";
ZmController.PORTAL_VIEW                = "PORTAL";
ZmController.PREF_VIEW					= "PREF";
ZmController.READING_PANE_VIEW 			= "RP";
ZmController.TASK_VIEW					= "TKV";
ZmController.TASKEDIT_VIEW				= "TKE";
ZmController.TASKLIST_VIEW				= "TKL";
ZmController.TRAD_VIEW 					= "TV";
ZmController.VOICEMAIL_VIEW				= "VM";
ZmController.BRIEFCASE_VIEW			    = "BC";

/* ROSSD - It feels like we may need a ZmAppViewController class to help with
 * the tab group work. Delaying this until I have more experience pushing the 
 * tab group stuff around the app to see what abstraction makes sense*/
ZmController._currAppViewTabGroup = null;

ZmController._setCurrentAppViewTabGroup =
function(tabGroup) {
	ZmController._currAppViewTabGroup = tabGroup;
};

ZmController._getCurrentAppViewTabGroup =
function() {
	return ZmController._currAppViewTabGroup;
};

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
	if (!noExecReset) {
		this._execFrame = {func: null, args: null, restartOnError: false};
	}
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

ZmController.prototype.getCurrentView =
function() {
	return this._currentView;
};

ZmController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmController.handleKeyAction");
	var tabView = this.getTabView ? this.getTabView() : null;
	if (tabView && tabView.handleKeyAction(actionCode)) {
		return true;
	}

	return false;
};

ZmController.prototype._createTabGroup =
function(name) {
	name = name ? name : this.toString();
	this._tabGroup = new DwtTabGroup(name);
	return this._tabGroup;
};

ZmController.prototype._setTabGroup =
function(tabGroup) {
	this._tabGroup = tabGroup;
};

ZmController.prototype.getTabGroup =
function() {
	return this._tabGroup;
};

ZmController.prototype._handleLogin =
function(bReloginMode) {
	var url = this._appCtxt.get(ZmSetting.LOGIN_URL);
	if (url) {
		ZmZimbraMail.sendRedirect(url);
		return;
	}
	
	var username = this._appCtxt.getUsername();
	if (!username) {
		ZmZimbraMail.logOff();
		return;
	}
	this._authenticating = true;
	this._loginDialog.setVisible(true, false);
	try {
		this._loginDialog.setFocus(username, bReloginMode);
	} catch (ex) {
		// do nothing. just catch and hope for the best.
	}
};

// Remember the currently focused item before this view is hidden. Typically
// called by a preHideCallback.
ZmController.prototype._saveFocus = 
function() {
	var currentFocusMember = this._appCtxt.getRootTabGroup().getFocusMember();
	var myTg = this.getTabGroup();
	this._savedFocusMember = (currentFocusMember && myTg && myTg.contains(currentFocusMember)) ? currentFocusMember : null;
	return this._savedFocusMember;
};

// Make our tab group the current app view tab group, and restore focus to
// whatever had it last time we were visible. Typically called by a
// postShowCallback.
ZmController.prototype._restoreFocus = 
function(focusItem, noFocus) {
	var rootTg = this._appCtxt.getRootTabGroup();
	var myTg = this.getTabGroup();
	var kbMgr = this._appCtxt.getKeyboardMgr();

	if (rootTg && myTg) {
		focusItem = focusItem || this._savedFocusMember || this._getDefaultFocusItem() || rootTg.getFocusMember();
		rootTg.replaceMember(ZmController._getCurrentAppViewTabGroup(), myTg, false, false, focusItem, noFocus);
		ZmController._setCurrentAppViewTabGroup(myTg);
	}
};

ZmController.prototype._getDefaultFocusItem = 
function() {
	var myTg = this.getTabGroup();
	return myTg ? myTg.getFirstMember(true) : null;
};

ZmController.prototype._preHideCallback = 
function() {
	DBG.println(AjxDebug.DBG2, "ZmController.prototype._preHideCallback");
	this._saveFocus();
	return true;
};

ZmController.prototype._postShowCallback = 
function() {
	DBG.println(AjxDebug.DBG2, "ZmController.prototype._postShowCallback");
	this._restoreFocus();
	return true;
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

		ZmCsfeCommand.clearAuthToken();
		var bReloginMode = true;
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED) {
			// remember the last operation attempted ONLY for expired auth token exception
			if (method) {
				this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, func: method, args: params, restartOnError: restartOnError};
			}
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
		this._loginDialog.setReloginMode(bReloginMode);
		this._handleLogin(bReloginMode);
	} else {
		// remember the last search attempted for all other exceptions
		this._execFrame = (method instanceof AjxCallback) ? method : {obj: obj, func: method, args: params, restartOnError: restartOnError};
		this._errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
		// bug fix #5603 - error msg for mail.SEND_FAILURE takes an argument
		var args = null;
        switch (ex.code) {
            case ZmCsfeException.MAIL_NO_SUCH_ITEM: args = ex.data.itemId; break;
            case ZmCsfeException.MAIL_SEND_FAILURE: args = ex.code; break;
        }
		var msg = ex.getErrorMsg ? ex.getErrorMsg(args) : ex.msg ? ex.msg : ex.message;
		this.popupErrorDialog(msg, ex, true, this._hideSendReportBtn(ex));
	}
};

ZmController.prototype._hideSendReportBtn =
function(ex) {
	return ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		   ex.code == ZmCsfeException.MAIL_MAINTENANCE_MODE;
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
			ZmCsfeCommand.setSessionId(null);								// so we get a refresh block
			this._appCtxt.getAppController().startup({isRelogin: true});	// restart application
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
	if (!this._execFrame) { return; }
	var obj = this._execFrame.obj ? this._execFrame.obj : this;
	if (this._execFrame.func) {
		this._execFrame.func.apply(obj, this._execFrame.args);
	}
	this._execFrame = null;
};

/*********** Msg dialog Callbacks */

ZmController.prototype._errorDialogCallback =
function() {
	this._errorDialog.popdown();
	if (!this._execFrame) { return; }
	if (this._execFrame.restartOnError && !this._authenticating && this._execFrame.func) {
		this._execFrame.func.apply(this, this._execFrame.args);
	}
	this._execFrame = null;
};


// Pop up a dialog. Since it's a shared resource, we need to reset first.
ZmController.showDialog = 
function(dialog, callback, params) {
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback);
	dialog.popup(params);
};

// Pop down the dialog and clear any pending actions (initiated from an action menu).
ZmController.prototype._clearDialog =
function(dialog) {
	dialog.popdown();
	this._pendingActionData = null;
};

ZmController.prototype._menuPopdownActionListener = function() {};
