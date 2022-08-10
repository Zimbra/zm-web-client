/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines an application controller.
 *
 */

/**
 * Creates a controller. 
 * @class
 * This class represents an application controller.
 * 
 * @param	{DwtShell}		container		the application container
 * @param	{ZmApp}			app				the application
 * @param	{constant}		type			type of controller (typically a view type)				
 * @param	{string}		sessionId		the session id
 */
ZmController = function(container, app, type, sessionId) {

	if (arguments.length == 0) { return; }

	this.setCurrentViewType(this.getDefaultViewType());
	this.setCurrentViewId(this.getDefaultViewType());
	if (sessionId) {
		this.setSessionId(sessionId, type);
	}
	
	this._container = container;
	this._app = app;
		
	this._shell = appCtxt.getShell();
	this._appViews = {};
	
	this._authenticating = false;
	this.isHidden = (sessionId == ZmApp.HIDDEN_SESSION);
	this._elementsToHide = null;
};

ZmController.prototype.isZmController = true;
ZmController.prototype.toString = function() { return "ZmController"; };


ZmController.SESSION_ID_SEP = "-";

// Abstract methods

ZmController.prototype._setView = function() {};

/**
 * Returns the default view type
 */
ZmController.getDefaultViewType = function() {};	// needed by ZmApp::getSessionController
ZmController.prototype.getDefaultViewType = function() {};

// _defaultView is DEPRECATED in 8.0
ZmController.prototype._defaultView = ZmController.prototype.getDefaultViewType;



// Public methods

/**
 * Gets the session ID.
 * 
 * @return	{string}	the session ID
 */
ZmController.prototype.getSessionId =
function() {
	return this._sessionId;
};

/**
 * Sets the session id, view id, and tab id (using the type and session id).
 * Controller for a view that shows up in a tab within the app chooser bar.
 * Examples include compose, send confirmation, and msg view.
 *
 * @param {string}						sessionId					the session id
 * @param {string}						type						the type
 * @param {ZmSearchResultsController}	searchResultsController		owning controller
 */
ZmController.prototype.setSessionId =
function(sessionId, type) {

	this._sessionId = sessionId;
	if (type) {
		this.setCurrentViewType(type);
		this.setCurrentViewId(sessionId ? [type, sessionId].join(ZmController.SESSION_ID_SEP) : type);
		this.tabId = sessionId ? ["tab", this.getCurrentViewId()].join("_") : "";
	}
	
	// this.sessionId and this.viewId are DEPRECATED in 8.0;
	// use getSessionId() and getCurrentViewId() instead
	this.sessionId = this._sessionId;
	this.viewId = this.getCurrentViewId();
};

/**
 * Gets the current view type.
 * 
 * @return	{constant}			the view type
 */
ZmController.prototype.getCurrentViewType =
function(viewType) {
	return this._currentViewType;
};
// _getViewType is DEPRECATED in 8.0
ZmController.prototype._getViewType = ZmController.prototype.getCurrentViewType;

/**
 * Sets the current view type.
 * 
 * @param	{constant}	viewType		the view type
 */
ZmController.prototype.setCurrentViewType =
function(viewType) {
	this._currentViewType = viewType;
};

/**
 * Gets the current view ID.
 * 
 * @return	{DwtComposite}	the view Id
 */
ZmController.prototype.getCurrentViewId =
function() {
	return this._currentViewIdOverride || this._currentViewId;
};

/**
 * Sets the current view ID.
 * 
 * @param	{string}	viewId		the view ID
 */
ZmController.prototype.setCurrentViewId =
function(viewId) {
	this._currentViewId = viewId;
	
	// this._currentView is DEPRECATED in 8.0; use getCurrentViewId() instead
	this._currentView = this._currentViewId;
};

/**
 * Gets the application.
 * 
 * @return	{ZmApp}		the application
 */
ZmController.prototype.getApp = function() {
	return this._app;
};

/**
 * return the view elements. Currently a toolbar, app content, and "new" button.
 * 
 * @param view (optional if provided toolbar)
 * @param appContentView
 * @param toolbar (used only if view param is null)
 *
 */
ZmController.prototype.getViewElements =
function(view, appContentView, toolbar) {
	var elements = {};
	toolbar = toolbar || this._toolbar[view];
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = toolbar;
	elements[ZmAppViewMgr.C_APP_CONTENT] = appContentView;

	return elements;
};

/**
 * Pops-up the error dialog.
 * 
 * @param	{String}	msg		the error msg
 * @param	{ZmCsfeException}	ex		the exception
 * @param	{Boolean}	noExecReset		(not used)
 * @param	{Boolean}	hideReportButton		if <code>true</code>, hide the "Send error report" button
 * @param	{Boolean}	expanded		if <code>true</code>, contents are expanded by default
 */
ZmController.prototype.popupErrorDialog = 
function(msg, ex, noExecReset, hideReportButton, expanded, noEncoding) {
	// popup alert
	var errorDialog = appCtxt.getErrorDialog();
	var detailStr = "";
	if (typeof ex == "string") {
		// in case an Error makes it here
		detailStr = ex;
	} else if (ex instanceof Object) {
		ex.msg = ex.msg || msg;
		var fields = ["method", "msg", "code", "detail", "trace", "request",
					"fileName", "lineNumber", "message", "name", "stack" ];
		var html = [], i = 0;
		html[i++] = "<table>";
		for (var j = 0; j < fields.length; j++) {
			var fld = fields[j];
			var value = AjxStringUtil.htmlEncode(ex[fld]);
			if (value) {
				if (fld == "request") {
					value = ["<pre>", value, "</pre>"].join("");
					var msgDiv = document.getElementById(errorDialog._msgCellId);
					if (msgDiv) {
						msgDiv.className = "DwtMsgDialog-wide";
					}
				}
				html[i++] = ["<tr><td valign='top'>", fields[j], ":</td><td valign='top'>", value, "</td></tr>"].join("");
			}
		}
		html[i++] = "</table>";
		detailStr = html.join("");
	}
	errorDialog.registerCallback(DwtDialog.OK_BUTTON, this._errorDialogCallback, this);
	if (!noEncoding) {
		msg = AjxStringUtil.htmlEncode(msg);
	}
	errorDialog.setMessage(msg, detailStr, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.zimbraTitle);
	errorDialog.popup(null, hideReportButton);
	if (expanded)
		errorDialog.showDetail();
};

/**
 * Pops-up an error dialog describing an upload error.
 *
 * @param	{constant}	type		the type of the uploaded item, e.g. <code>ZmItem.MSG</code>.
 * @param	{Number}	respCode		the HTTP reponse status code
 * @param	{String}	extraMsg		optional message to append to the status
 */
ZmController.prototype.popupUploadErrorDialog =
function(type, respCode, extraMsg) {
    var warngDlg = appCtxt.getMsgDialog();
    var style = DwtMessageDialog.CRITICAL_STYLE;
    var msg = this.createErrorMessage(type, respCode, extraMsg);
	if (msg.length > 0) {
		warngDlg.setMessage(msg, style);
		warngDlg.popup();
	}
};

ZmController.prototype.createErrorMessage = function(type, respCode, extraMsg) {
	var msg = "";

	switch (respCode) {
		case AjxPost.SC_OK:
			break;

		case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE:
			var basemsg =
				type && ZmMsg['attachmentSizeError_' + type] ||
					ZmMsg.attachmentSizeError;
			var sizelimit =
				AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT));
			msg = AjxMessageFormat.format(basemsg, sizelimit);
			break;

		default:
			var basemsg =
				type && ZmMsg['errorAttachment_' + type] ||
					ZmMsg.errorAttachment;
			msg = AjxMessageFormat.format(basemsg, respCode || AjxPost.SC_NO_CONTENT);
			break;
	}

	if ((msg.length > 0) && extraMsg) {
		msg += '<br /><br />';
		msg += extraMsg;
	}
	return msg;
};

ZmController.handleScriptError =
function(ex, debugWindowOnly) {

	var text = [];
	var eol = "<br/>";
	if (ex) {
		var msg = ZmMsg.scriptError + ": " + ex.message;
		var m = ex.fileName && ex.fileName.match(/(\w+\.js)/);
		if (m && m.length) {
			msg += " - " + m[1] + ":" + ex.lineNumber;
		}
		if (ex.fileName)	{ text.push("File: " + ex.fileName); }
		if (ex.lineNumber)	{ text.push("Line: " + ex.lineNumber); }
		if (ex.name)		{ text.push("Error: " + ex.name); }
		if (ex.stack)		{ text.push("Stack: " + ex.stack.replace("\n", eol, "g")); }
	}
	var content = text.join(eol);
	var errorMsg = [msg, content].join(eol + eol);
	if (debugWindowOnly) {
		// Display the error in the debug window
		DBG.println(AjxDebug.DBG1, errorMsg);
	} else {
		// Record the error in a log buffer and display a script error popup
		AjxDebug.println(AjxDebug.EXCEPTION, errorMsg);
		appCtxt.getAppController().popupErrorDialog(msg, content, null, false, true);
	}
};

/**
 * Gets the key map name.
 * 
 * @return	{String}	the key map name
 */
ZmController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_GLOBAL;
};

/**
 * Handles the key action.
 * 
 * @param	{constant}		actionCode		the action code
 * @return	{Boolean}	<code>true</code> if the key action is handled
 * 
 * @see		ZmApp.ACTION_CODES_R
 * @see		ZmKeyMap
 */
ZmController.prototype.handleKeyAction =
function(actionCode, ev) {
	DBG.println(AjxDebug.DBG3, "ZmController.handleKeyAction");
	
	// tab navigation shortcut
	var tabView = this.getTabView ? this.getTabView() : null;
	if (tabView && tabView.handleKeyAction(actionCode)) {
		return true;
	}

	// shortcuts tied directly to operations
    var isExternalAccount = appCtxt.isExternalAccount();
	var app = ZmApp.ACTION_CODES_R[actionCode];
	if (app) {
		var op = ZmApp.ACTION_CODES[actionCode];
		if (op) {
            if (isExternalAccount) { return true; }
			appCtxt.getApp(app).handleOp(op);
			return true;
		}
	}

    switch (actionCode) {

		case ZmKeyMap.NEW: {
            if (isExternalAccount) { break; }
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
            if (isExternalAccount || appCtxt.isWebClientOffline()) { break; }
			var op = ZmApp.ACTION_CODES[actionCode];
			if (op) {
				this._newListener(null, op);
			}
			break;

	    case ZmKeyMap.NEW_SEARCH: {
		    appCtxt.getSearchController().openNewSearchTab();
		    break;
	    }

		case ZmKeyMap.SAVED_SEARCH:
            if (isExternalAccount) { break; }
			var searches = appCtxt.getFolderTree().getByType(ZmOrganizer.SEARCH);
			if (searches && searches.length > 0) {
				var dlg = appCtxt.getChooseFolderDialog();
				// include app name in ID so we have one overview per app to show only its saved searches
				var params = {treeIds:		[ZmOrganizer.SEARCH],
							  overviewId:	dlg.getOverviewId(ZmOrganizer.SEARCH, this._app._name),
							  appName:      this._app._name,
							  title:		ZmMsg.selectSearch};
				ZmController.showDialog(dlg, new AjxCallback(null, ZmController._searchSelectionCallback, [dlg]), params);
			}
			break;

		case ZmKeyMap.VISIT:
			var dlg = appCtxt.getChooseFolderDialog();
			var orgType = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
			var params = {treeIds:		[orgType],
						  overviewId:	dlg.getOverviewId(ZmOrganizer.APP[orgType]),
						  appName:		this._app._name,
						  noRootSelect: true,
						  title:		AjxMessageFormat.format(ZmMsg.goToFolder, ZmMsg[ZmOrganizer.MSG_KEY[orgType]])};
			ZmController.showDialog(dlg, new AjxCallback(null, ZmController._visitOrgCallback, [dlg, orgType]), params);
			break;

		case ZmKeyMap.VISIT_TAG:
			if (appCtxt.getTagTree().size() > 0) {
				var dlg = appCtxt.getPickTagDialog();
				ZmController.showDialog(dlg, new AjxCallback(null, ZmController._visitOrgCallback, [dlg, ZmOrganizer.TAG]));
			}
			break;

		default:
			return false;
	}
	return true;
};

/**
 * @private
 */
ZmController._searchSelectionCallback =
function(dialog, searchFolder) {
	if (searchFolder) {
		appCtxt.getSearchController().redoSearch(searchFolder.search);
	}
	dialog.popdown();
};

/**
 * @private
 */
ZmController._visitOrgCallback =
function(dialog, orgType, org) {
	if (org) {
		var tc = appCtxt.getOverviewController().getTreeController(orgType);
		if (tc && tc._itemClicked) {
			tc._itemClicked(org);
		}
	}
	dialog.popdown();
};

/**
 * Checks if shortcuts for the given map are supported for this view. For example, given the map
 * "tabView", a controller that creates a tab view would return <code>true</code>.
 *
 * @param {String}	map		the name of a map (see {@link DwtKeyMap})
 * @return	{Boolean}		<code>true</code> if shortcuts are supported
 */
ZmController.prototype.mapSupported =
function(map) {
	return false;
};

/**
 * @private
 */
ZmController.prototype._newListener =
function(ev, op) {
	switch (op) {
		// new organizers
		case ZmOperation.NEW_FOLDER: {
			// note that this shortcut only happens if mail app is around - it means "new mail folder"
			ZmController.showDialog(appCtxt.getNewFolderDialog(), this.getNewFolderCallback());
			break;
		}
		case ZmOperation.NEW_TAG: {
			if (!this._newTagCb) {
				this._newTagCb = new AjxCallback(this, this._newTagCallback);
			}
			ZmController.showDialog(appCtxt.getNewTagDialog(), this._newTagCb);
			break;
		}
	}
};

/**
 * @private
 */
ZmController.prototype._newFolderCallback =
function(parent, name, color, url) {
	// REVISIT: Do we really want to close the dialog before we
	//          know if the create succeeds or fails?
	var dialog = appCtxt.getNewFolderDialog();
	dialog.popdown();

	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.FOLDER)._doCreate(parent, name, color, url);
};

/**
 * @private
 */
ZmController.prototype._newTagCallback =
function(params) {
	appCtxt.getNewTagDialog().popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.TAG)._doCreate(params);
};

/**
 * @private
 */
ZmController.prototype._createTabGroup =
function(name) {
	name = name ? name : this.toString();
	this._tabGroup = new DwtTabGroup(name);
	return this._tabGroup;
};

/**
 * @private
 */
ZmController.prototype._setTabGroup =
function(tabGroup) {
	this._tabGroup = tabGroup;
};

/**
 * Gets the tab group.
 * 
 * @return	{Object}	the tab group
 */
ZmController.prototype.getTabGroup =
function() {
	return this._tabGroup;
};

/**
 * Gets the new folder callback.
 * 
 * @return	{AjxCallback}	the callback
 */
ZmController.prototype.getNewFolderCallback =
function() {
	if (!this._newFolderCb) {
		this._newFolderCb = new AjxCallback(this, this._newFolderCallback);
	}
	return this._newFolderCb;
};

/**
 * Remember the currently focused item before this view is hidden. Typically called by a preHideCallback.
 * 
 * @private
 */
ZmController.prototype._saveFocus = 
function() {
	var currentFocusMember = appCtxt.getRootTabGroup().getFocusMember();
	var myTg = this.getTabGroup();
	this._savedFocusMember = (currentFocusMember && myTg && myTg.contains(currentFocusMember)) ? currentFocusMember : null;
	return this._savedFocusMember;
};

/**
 * Make our tab group the current app view tab group, and restore focus to
 * whatever had it last time we were visible. Typically called by a postShowCallback.
 * 
 * @private
 */
ZmController.prototype._restoreFocus = 
function(focusItem, noFocus) {

	var rootTg = appCtxt.getRootTabGroup();

	var curApp = appCtxt.getCurrentApp();
	var ovId = curApp && curApp.getOverviewId();
	var overview = ovId && appCtxt.getOverviewController().getOverview(ovId);
	if (rootTg && overview && (overview != ZmController._currentOverview)) {
		var currTg = ZmController._currentOverview &&
			ZmController._currentOverview.getTabGroupMember();
		rootTg.replaceMember(currTg, overview.getTabGroupMember(),
		                     false, false, null, true);
		ZmController._currentOverview = overview;
	}

	var myTg = this.getTabGroup();
	focusItem = focusItem || this._savedFocusMember || this._getDefaultFocusItem() || rootTg.getFocusMember();
	noFocus = noFocus || ZmController.noFocus;
	ZmController.noFocus = false;
	if (rootTg && myTg && (myTg != ZmController._currentAppViewTabGroup)) {
		rootTg.replaceMember(ZmController._currentAppViewTabGroup, myTg, false, false, focusItem, noFocus);
		ZmController._currentAppViewTabGroup = myTg;
	} else if (focusItem && !noFocus) {
		appCtxt.getKeyboardMgr().grabFocus(focusItem);
	}
};

/**
 * @private
 */
ZmController.prototype._getDefaultFocusItem = 
function() {
	var myTg = this.getTabGroup();
	return myTg ? myTg.getFirstMember(true) : null;
};

// Callbacks to run on changes in view state
ZmController.prototype._preUnloadCallback	= function() { return true; };
ZmController.prototype._postHideCallback	= function() { return true; };
ZmController.prototype._postRemoveCallback	= function() { return true; };
ZmController.prototype._preShowCallback		= function() { return true; };

// preserve focus state
ZmController.prototype._preHideCallback = 
function() {
	DBG.println(AjxDebug.DBG2, "ZmController.prototype._preHideCallback");
	this._saveFocus();
	return true;
};

// restore focus state
ZmController.prototype._postShowCallback = 
function() {
	DBG.println(AjxDebug.DBG2, "ZmController.prototype._postShowCallback");
	this._restoreFocus();
	return true;
};

/**
 * Common exception handling entry point for sync and async commands.
 * 
 * @private
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
 * @param {AjxException}	ex				the exception
 * @param {Hash}	continuation		the original request params
 * 
 * @private
 */
ZmController.prototype._handleException = function(ex, continuation) {

	if (ex.code == AjxSoapException.INVALID_PDU) {
		ex.code = ZmCsfeException.SVC_FAILURE;
		ex.detail = ["contact your administrator (", ex.msg, ")"].join("");
		ex.msg = "Service failure";
	}
	
	if (ex.code == ZmCsfeException.SVC_AUTH_EXPIRED || ex.code == ZmCsfeException.SVC_AUTH_REQUIRED || ex.code == ZmCsfeException.NO_AUTH_TOKEN) {
		ZmCsfeCommand.noAuth = true;
        DBG.println(AjxDebug.DBG1, "ZmController.prototype._handleException ex.code : " + ex.code + ". Invoking logout.");
		ZmZimbraMail.logOff(null, true);
		return;
	}

	// If we get this error, user is probably looking at a stale list. Let's
	// refetch user's search results. This is more likely to happen in zdesktop.
	// See bug 33760.
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_MSG) {
		var vid = appCtxt.getCurrentViewId();
		// only process if we're in one of these views otherwise, do the default
		if (vid == ZmId.VIEW_CONVLIST || vid == ZmId.VIEW_TRAD) {
			var mailApp = appCtxt.getApp(ZmApp.MAIL);
			var callback = appCtxt.isOffline ? new AjxCallback(this, this._handleMailSearch, mailApp) : null;
			mailApp.mailSearch(null, callback);
			return;
		}
	}

	// silently ignore polling exceptions
	if (ex.method !== "NoOpRequest") {
		var args;
		if (ex.code === ZmCsfeException.MAIL_NO_SUCH_ITEM) {
			args = ex.data.itemId;
		}
        else if (ex.code === ZmCsfeException.MAIL_SEND_FAILURE) {
			args = ex.code; // bug fix #5603 - error msg for mail.SEND_FAILURE takes an argument
		}
        else if (ex.code === ZmCsfeException.MAIL_INVALID_NAME) {
			args = ex.data.name;
		}
        else if (ex.code === ZmCsfeException.SVC_UNKNOWN_DOCUMENT) {
            args = ex.msg.split(': ')[1];
        }

		if (ex.lineNumber && !ex.detail) {
			// JS error that was caught before our JS-specific handler got it
			ZmController.handleScriptError(ex);
		}
        else {
            var msg;

            if (continuation && continuation.restUri && continuation.restUri.indexOf('zimbraim') !== -1) {
                msg = ZmMsg.chatXMPPError;
            }
            else {
                msg = ex.getErrorMsg ? ex.getErrorMsg(args) : ex.msg || ex.message;
            }

			this.popupErrorDialog(msg, ex, true, this._hideSendReportBtn(ex));
		}
	}
};

ZmController.prototype._handleMailSearch =
function(app) {
	if (appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES)) {
		app.getOverviewContainer().highlightAllMboxes();
	}
};

/**
 * @private
 */
ZmController.prototype._hideSendReportBtn =
function(ex) {
	return (ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		  	ex.code == ZmCsfeException.MAIL_MAINTENANCE_MODE ||
			ex.code == ZmCsfeException.MAIL_MESSAGE_TOO_BIG ||
			ex.code == ZmCsfeException.NETWORK_ERROR ||
		   	ex.code == ZmCsfeException.EMPTY_RESPONSE ||
		   	ex.code == ZmCsfeException.BAD_JSON_RESPONSE ||
		   	ex.code == ZmCsfeException.TOO_MANY_TAGS ||
			ex.code == ZmCsfeException.OFFLINE_ONLINE_ONLY_OP);
};

//
// Msg dialog Callbacks
//

/**
 * @private
 */
ZmController.prototype._errorDialogCallback =
function() {
	appCtxt.getErrorDialog().popdown();
};

/**
 * Shows a dialog. Since the dialog is a shared resource, a dialog reset is performed.
 * 
 * @param	{DwtDialog}		dialog		the dialog
 * @param	{AjxCallback}	callback	the callback
 * @param	{Hash}		params		a hash of parameters
 * @param	{ZmAccount}	account		the account
 * 
 * @see DwtDialog#reset
 * @see DwtDialog#popup
 */
ZmController.showDialog = 
function(dialog, callback, params, account) {
	dialog.reset(account);
	dialog.registerCallback(DwtDialog.OK_BUTTON, callback);
	dialog.popup(params, account);
};

/**
 * Pop down the dialog and clear any pending actions (initiated from an action menu).
 * 
 * @private
 */
ZmController.prototype._clearDialog =
function(dialog) {
	dialog.popdown();
	this._pendingActionData = null;
};

/**
 * @private
 */
ZmController.prototype._menuPopdownActionListener = function() {};

/**
 * Checks if the view is transient.
 * 
 * @param	{Object}	oldView		the old view
 * @param	{Object}	newView		the new view
 * @return	{Boolean}		<code>true</code> if the controller is transient.
 */
ZmController.prototype.isTransient =
function(oldView, newView) {
	return false;
};

