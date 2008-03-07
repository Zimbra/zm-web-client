/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmController = function(container, app) {

	if (arguments.length == 0) { return; }

	this._container = container;
	this._app = app;
	
	this._shell = appCtxt.getShell();
	this._appViews = {};
	this._currentView = null;
	
	this._authenticating = false;
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
ZmController.MY_CARD_VIEW				= "MYC";
ZmController.NOTEBOOK_FILE_VIEW			= "NBF";
ZmController.NOTEBOOK_PAGE_EDIT_VIEW	= "NBPE";
ZmController.NOTEBOOK_PAGE_VIEW			= "NBP";
ZmController.NOTEBOOK_PAGE_VERSION_VIEW = "NBPV";
ZmController.NOTEBOOK_SITE_VIEW			= "NBS";
ZmController.PORTAL_VIEW                = "PORTAL";
ZmController.PREF_VIEW					= "PREF";
ZmController.TASK_VIEW					= "TKV";
ZmController.TASKEDIT_VIEW				= "TKE";
ZmController.TASKLIST_VIEW				= "TKL";
ZmController.TRAD_VIEW 					= "TV";
ZmController.VOICEMAIL_VIEW				= "VM";
ZmController.BRIEFCASE_VIEW			    = "BC";
ZmController.BRIEFCASE_DETAIL_VIEW		= "BCD";
ZmController.BRIEFCASE_COLUMN_VIEW		= "BCC";

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

ZmController.prototype.getApp = function() {
	return this._app;
};

ZmController.prototype.popupErrorDialog = 
function(msg, ex, noExecReset, hideReportButton)  {
	// popup alert
	var detailStr = "";
	if (typeof ex == "string") {
		// in case an Error makes it here
		detailStr = ex;
	} else if (ex instanceof Object) {
		for (var prop in ex) {
			if (typeof ex[prop] == "function") { continue; }
			detailStr = [detailStr, prop, ": ", ex[prop], "<br/>\n"].join("");
		}
	}
	var errorDialog = appCtxt.getErrorDialog();
	errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
	errorDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	errorDialog.setButtonVisible(ZmErrorDialog.REPORT_BUTTON, !hideReportButton);
	errorDialog.popup();
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
	
	// tab navigation shortcut
	var tabView = this.getTabView ? this.getTabView() : null;
	if (tabView && tabView.handleKeyAction(actionCode)) {
		return true;
	}
	
	// check for action code with argument, eg MoveToFolder3
	var shortcut = ZmShortcut.parseAction("Global", actionCode);
	if (shortcut) {
		actionCode = shortcut.baseAction;
	}

	// shortcuts tied directly to operations
	var app = ZmApp.ACTION_CODES_R[actionCode];
	if (app) {
		var op = ZmApp.ACTION_CODES[actionCode];
		if (op) {
			appCtxt.getApp(app).handleOp(op);
			return true;
		}
	}

	switch (actionCode) {

		case ZmKeyMap.NEW: {
			// find default "New" action code for current app
			app = appCtxt.getCurrentAppName();
			var newActionCode = ZmApp.NEW_ACTION_CODE[app];
			if (newActionCode) {
				var op = ZmApp.ACTION_CODES[newActionCode];
				if (op) {
					appCtxt.getApp(app).handleOp(op);
					return true;
				}
			}
			break;
		}

		case ZmKeyMap.NEW_FOLDER:
		case ZmKeyMap.NEW_TAG:
			// dont allow new tags for child 
			if (actionCode == ZmKeyMap.NEW_TAG &&
				appCtxt.multiAccounts &&
				!appCtxt.getActiveAccount().isMain)
			{
				break;
			}
			var op = ZmApp.ACTION_CODES[actionCode];
			if (op) {
				this._newListener(null, op);
			}
			break;

		case ZmKeyMap.GOTO_TAG:
			if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
				var tag = shortcut ? appCtxt.getById(shortcut.arg) : null;
				if (tag) {
					appCtxt.getSearchController().search({query: 'tag:"' + tag.name + '"'});
				}
			}
			break;

		case ZmKeyMap.SAVED_SEARCH:
			if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
				var searchFolder = shortcut ? appCtxt.getById(shortcut.arg) : null;
				if (searchFolder) {
					appCtxt.getSearchController().redoSearch(searchFolder.search);
				}
			}
			break;

		default:
			return false;
	}
	return true;
};

ZmController.prototype._newListener =
function(ev, op) {
	switch (op) {
		// new organizers
		case ZmOperation.NEW_FOLDER: {
			var dialog = appCtxt.getNewFolderDialog();
			if (!this._newFolderCb) {
				this._newFolderCb = new AjxCallback(this, this._newFolderCallback);
			}
			ZmController.showDialog(dialog, this._newFolderCb);
			break;
		}
		case ZmOperation.NEW_TAG: {
			var dialog = appCtxt.getNewTagDialog();
			if (!this._newTagCb) {
				this._newTagCb = new AjxCallback(this, this._newTagCallback);
			}
			ZmController.showDialog(dialog, this._newTagCb);
			break;
		}
	}
};

ZmController.prototype._newFolderCallback =
function(parent, name, color, url) {
	// REVISIT: Do we really want to close the dialog before we
	//          know if the create succeeds or fails?
	var dialog = appCtxt.getNewFolderDialog();
	dialog.popdown();

	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.FOLDER)._doCreate(parent, name, color, url);
};

ZmController.prototype._newTagCallback =
function(params) {
	var dialog = appCtxt.getNewTagDialog();
	dialog.popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.TAG)._doCreate(params);
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

// Remember the currently focused item before this view is hidden. Typically
// called by a preHideCallback.
ZmController.prototype._saveFocus = 
function() {
	var currentFocusMember = appCtxt.getRootTabGroup().getFocusMember();
	var myTg = this.getTabGroup();
	this._savedFocusMember = (currentFocusMember && myTg && myTg.contains(currentFocusMember)) ? currentFocusMember : null;
	return this._savedFocusMember;
};

// Make our tab group the current app view tab group, and restore focus to
// whatever had it last time we were visible. Typically called by a
// postShowCallback.
ZmController.prototype._restoreFocus = 
function(focusItem, noFocus) {
	var rootTg = appCtxt.getRootTabGroup();
	var myTg = this.getTabGroup();
	var kbMgr = appCtxt.getKeyboardMgr();

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

/**
 * Common exception handling entry point for sync and async commands.
 */
ZmController.prototype._handleError =
function(ex, continuation) {
	this._handleException(ex, continuation);
};

/**
 * Handles exceptions. There is special handling for auth-related exceptions.
 * Other exceptions generally result in the display of an error dialog. An
 * auth-expired exception results in the display of a login dialog. After the
 * user logs in, we use the continuation to re-run the request that failed.
 * 
 * @param ex				[AjxException]		the exception
 * @param continuation		[object]*			original request params
 */
ZmController.prototype._handleException =
function(ex, continuation) {
	
	if (ex.code == AjxSoapException.INVALID_PDU) {
		ex.code = ZmCsfeException.SVC_FAILURE;
		ex.detail = ["contact your administrator (", ex.msg, ")"].join("");
		ex.msg = "Service failure";
	}
	
	if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || 
		ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || 
		ex.code == ZmCsfeException.NO_AUTH_TOKEN) {

		ZmCsfeCommand.clearAuthToken();
		var reloginMode = false;
		var loginDialog = appCtxt.getLoginDialog();
		if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED) {
			loginDialog.setError(ZmMsg.sessionExpired);
			reloginMode = true;
		} else if (ex.code == ZmCsfeException.SVC_AUTH_REQUIRED) {
			// bug fix #413 - always logoff if we get auth required
			ZmZimbraMail.logOff();
			return;
		} else {
			// NO_AUTH_TOKEN
			loginDialog.setError(null);
		}
		loginDialog.setReloginMode(reloginMode);
		this._handleLogin(reloginMode, continuation);
	} else if (ex.code == ZmCsfeException.AUTH_TOKEN_CHANGED) {
		var soapDoc = AjxSoapDoc.create("GetInfoRequest", "urn:zimbraAccount");
		var method = soapDoc.getMethod();
		method.setAttribute("sections", "mbox");
		var respCallback = new AjxCallback(this, this._handleResponseGetInfo);
		var params = {soapDoc:soapDoc, asyncMode:true, callback:respCallback, skipAuthCheck:true};
		appCtxt.getAppController().sendRequest(params);
	} else {
		// bug fix #5603 - error msg for mail.SEND_FAILURE takes an argument
		var args = null;
        switch (ex.code) {
            case ZmCsfeException.MAIL_NO_SUCH_ITEM: args = ex.data.itemId; break;
            case ZmCsfeException.MAIL_SEND_FAILURE: args = ex.code; break;
        }
		var msg = ex.getErrorMsg ? ex.getErrorMsg(args) : ex.msg ? ex.msg : ex.message;
		// silently ignore polling exceptions
		if (ex.method != "NoOpRequest") {
			this.popupErrorDialog(msg, ex, true, this._hideSendReportBtn(ex));
		}
	}
};

/**
 * Takes the user to a login form.
 * 
 * @param reloginMode		[boolean]*		if true, user is re-authenticating
 * @param continuation		[object]*		original request params
 */
ZmController.prototype._handleLogin =
function(reloginMode, continuation) {
	var url = appCtxt.get(ZmSetting.LOGIN_URL);
	if (url) {
		// NOTE: If user is sent to external login URL to re-auth, we can't
		// continue the request they made when auth expired. Would probably
		// need to provide a continuation entry point to make that happen.
		ZmZimbraMail.sendRedirect(url);
		return;
	}
	
	var username = appCtxt.getUsername();
	if (!username) {
		ZmZimbraMail.logOff();
		return;
	}
	this._authenticating = true;
	var loginDialog = appCtxt.getLoginDialog();
	loginDialog.registerCallback(this._loginCallback, this, [continuation]);
	loginDialog.setVisible(true, false);
	try {
		loginDialog.setFocus(username, reloginMode);
	} catch (ex) {}
};

ZmController.prototype._loginCallback =
function(continuation, username, password, rememberMe) {
	this._doAuth(continuation, username, password, rememberMe);
};

/**
 * User is logging in after an auth exception. If it was AUTH_EXPIRED, we try to complete what the
 * user was doing at the time (if the caller passed us the data we need to resume it). The continuation
 * is the original request params. For an async request, we just call sendRequest() and pass it the
 * original params. For a sync request, we run a callback (which generally is the function containing
 * the sendRequest), so that state is not lost.
 *
 * @param continuation		[object]*		original request params
 * @param username			[string]		user name
 * @param password			[string]		user password
 * @param rememberMe		[boolean]*		if true, preserve user's auth token
 */
ZmController.prototype._doAuth = 
function(continuation, username, password, rememberMe) {
	var auth = new ZmAuthenticate();
	var respCallback = new AjxCallback(this, this._handleResponseDoAuth, [continuation, rememberMe]);
	auth.execute(username, password, respCallback);
};

ZmController.prototype._handleResponseDoAuth =
function(continuation, rememberMe, result) {
	try {
		result.getResponse();
		this._authenticating = false;
		appCtxt.setRememberMe(rememberMe);
		if (continuation) {
			if (continuation.continueCallback) {
				// sync request
				continuation.continueCallback.run();
			} else {
				// async request
				continuation.resend = ZmCsfeCommand.REAUTH;
				appCtxt.getRequestMgr().sendRequest(continuation);
			}
		} else {
			// if no continuation context, start over
			ZmCsfeCommand.setSessionId(null);						// so we get a refresh block
			appCtxt.getAppController().startup({isRelogin:true});	// restart application
		}
		this._hideLoginDialog();
	} catch (ex) {
		var loginDialog = appCtxt.getLoginDialog();
		if (ex.code == ZmCsfeException.ACCT_AUTH_FAILED || ex.code == ZmCsfeException.SVC_INVALID_REQUEST) {
			loginDialog.setError(ZmMsg.loginError);
		} else if (ex.code == ZmCsfeException.ACCT_MAINTENANCE_MODE) {
			loginDialog.setError(ZmMsg.errorMaintenanceMode + " " + ZmMsg.errorContact);
		} else {
			this.popupErrorDialog(ZmMsg.errorGeneric, ex); 
		}
	}	
};

ZmController.prototype._hideLoginDialog =
function() {
	var loginDialog = appCtxt.getLoginDialog();
	loginDialog.setVisible(false);
	loginDialog.setError(null);
	loginDialog.clearPassword();
};

/**
 * Check GetInfoResponse to see if the user for the new auth token is the same as the
 * user for this session. If the user has changed, show the login dialog but don't
 * remove the auth cookie (that way, if the current user doesn't relogin, the other
 * user can continue with the new auth token). If the user hasn't changed, do nothing -
 * we can just continue to use the new auth token.
 */
ZmController.prototype._handleResponseGetInfo =
function(result) {
	var response = result.getResponse();
	var obj = response.GetInfoResponse;
	if (obj.name != appCtxt.getUsername()) {
		DBG.println(AjxDebug.DBG1, "AUTH TOKEN CHANGED, NEW USER: " + obj.name + " (old user: " + appCtxt.getUsername() + ")");
		var loginDialog = appCtxt.getLoginDialog();
		loginDialog.registerCallback(this._loginCallback, this);
		loginDialog.setError(ZmMsg.authChanged);
		var reloginMode = false;
		loginDialog.setReloginMode(reloginMode);
		this._handleLogin(reloginMode);
	} else {
		DBG.println(AjxDebug.DBG1, "AUTH TOKEN CHANGED, SAME USER: " + obj.name);
	}
};

ZmController.prototype._hideSendReportBtn =
function(ex) {
	return (ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		  	ex.code == ZmCsfeException.MAIL_MAINTENANCE_MODE ||
			ex.code == ZmCsfeException.MAIL_MESSAGE_TOO_BIG ||
			ex.code == ZmCsfeException.NETWORK_ERROR ||
		   	ex.code == ZmCsfeException.EMPTY_RESPONSE ||
		   	ex.code == ZmCsfeException.BAD_JSON_RESPONSE ||
		   	ex.code == ZmCsfeException.TOO_MANY_TAGS);
};

/*********** Msg dialog Callbacks */

ZmController.prototype._errorDialogCallback =
function() {
	appCtxt.getErrorDialog().popdown();
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
