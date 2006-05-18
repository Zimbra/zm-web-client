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

/**
* Does nothing.
* @constructor
* @class
* This class is a container for stuff that the overall app may want to know about. That
* includes environment information (such as whether the browser in use is public), and
* stuff that is common to the app as a whole (such as tags). The methods are almost all
* just getters and setters.
*/
function ZmAppCtxt() {
	this._trees = {};
};

ZmAppCtxt.LABEL = "appCtxt";

ZmAppCtxt.prototype.toString = 
function() {
	return "ZmAppCtxt";
};

/**
* Gets the app context from the given shell.
*
* @param shell		the shell
* @returns			the app context
*/
ZmAppCtxt.getFromShell =
function(shell) {
	return shell.getData(ZmAppCtxt.LABEL);
};

ZmAppCtxt.prototype.rememberMe =
function() {
	return this._rememberMe;
};

ZmAppCtxt.prototype.setRememberMe =
function(rememberMe) {
	this._rememberMe = rememberMe;
};

ZmAppCtxt.prototype.setAppController =
function(appController) {
	this._appController = appController;
};

ZmAppCtxt.prototype.getAppController =
function() {
	return this._appController;
};

ZmAppCtxt.prototype.setStatusMsg =
function(msg, level, detail, delay, transition) {
	this._appController.setStatusMsg(msg, level, detail, delay, transition);
};

ZmAppCtxt.prototype.setStatusIconVisible =
function(icon, visible) {
	this._appController.setStatusIconVisible(icon, visible);
};

ZmAppCtxt.prototype.getSettings =
function() {
	if (!this._settings)
		this._settings = new ZmSettings(this);
	return this._settings;
};

// NOTE: this is only to be used by any child windows!
ZmAppCtxt.prototype.setSettings = 
function(settings) {
	this._settings = settings;
};

// convenience method to return the value of a setting
// key param is *optional* (used for hash table data type)
ZmAppCtxt.prototype.get =
function(id, key) {
	return this.getSettings().get(id, key);
};

// convenience method to set the value of a setting
ZmAppCtxt.prototype.set =
function(id, value, key, setDefault, skipNotify) {
	var setting = this.getSettings().getSetting(id);
	if (setting)
		setting.setValue(value, key, setDefault, skipNotify);
};

ZmAppCtxt.prototype.getApp =
function(appName) {
	return this._appController.getApp(appName);
};

ZmAppCtxt.prototype.getAppViewMgr =
function() {
	return this._appController.getAppViewMgr();
};

ZmAppCtxt.prototype.setClientCmdHdlr =
function(clientCmdHdlr) {
	this._clientCmdHdlr = clientCmdHdlr;
};

ZmAppCtxt.prototype.getClientCmdHdlr =
function() {
	return this._clientCmdHdlr;
};

/**
* Returns a handle to the search bar's controller.
*/
ZmAppCtxt.prototype.getSearchController =
function() {
	if (!this._searchController)
		this._searchController = new ZmSearchController(this, this.getShell());
	return this._searchController;
};

/**
* Returns a handle to the overview controller.
*/
ZmAppCtxt.prototype.getOverviewController =
function() {
	if (!this._overviewController)
		this._overviewController = new ZmOverviewController(this, this.getShell());
	return this._overviewController;
};

ZmAppCtxt.prototype.getLoginDialog =
function() {
	if (!this._loginDialog)
		this._loginDialog = new ZmLoginDialog(this.getShell());
	return this._loginDialog;
};

ZmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog)
		this._msgDialog = new DwtMessageDialog(this.getShell());
	return this._msgDialog;
};

ZmAppCtxt.prototype.getYesNoMsgDialog =
function() {
	if (!this._yesNoMsgDialog) {
		this._yesNoMsgDialog = new DwtMessageDialog(this.getShell(), null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	}	
	return this._yesNoMsgDialog;
};

ZmAppCtxt.prototype.getYesNoCancelMsgDialog =
function() {
	if (!this._yesNoCancelMsgDialog) {
		this._yesNoCancelMsgDialog = new DwtMessageDialog(this.getShell(), null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
	}	
	return this._yesNoCancelMsgDialog;
};

ZmAppCtxt.prototype.getOkCancelMsgDialog =
function() {
	if (!this._okCancelMsgDialog) {
		this._okCancelMsgDialog = new DwtMessageDialog(this.getShell(), null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
	}	
	return this._okCancelMsgDialog;
};

ZmAppCtxt.prototype.getErrorDialog = 
function() {
	if (!this._errorDialog)
		this._errorDialog = new ZmErrorDialog(this.getShell(), this, ZmMsg);
	return this._errorDialog;
};

ZmAppCtxt.prototype.getNewTagDialog =
function() {
	if (!this._newTagDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newTagDialog = new ZmNewTagDialog(parent, msgDialog);
	}
	return this._newTagDialog;
};

ZmAppCtxt.prototype.getRenameTagDialog =
function() {
	if (!this._renameTagDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._renameTagDialog = new ZmRenameTagDialog(parent, msgDialog);
	}
	return this._renameTagDialog;
};

ZmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newFolderDialog = new ZmNewFolderDialog(parent, msgDialog);
	}
	return this._newFolderDialog;
};

ZmAppCtxt.prototype.getNewAddrBookDialog = 
function() {
	if (!this._newAddrBookDialog) {
		var parent = this.getShell();
		this._newAddrBookDialog = new ZmNewAddrBookDialog(parent);
	}
	return this._newAddrBookDialog;
}

ZmAppCtxt.prototype.getNewCalendarDialog =
function() {
	if (!this._newCalendarDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newCalendarDialog = new ZmNewCalendarDialog(parent, msgDialog);
	}
	return this._newCalendarDialog;
};

ZmAppCtxt.prototype.getNewNotebookDialog =
function() {
	if (!this._newNotebookDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newNotebookDialog = new ZmNewNotebookDialog(parent, msgDialog);
	}
	return this._newNotebookDialog;
};

ZmAppCtxt.prototype.getNewRosterItemDialog =
function() {
	if (!this._newRosterItemDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newRosterItemDialog = new ZmNewRosterItemDialog(parent, this, msgDialog);
	}
	return this._newRosterItemDialog;
};

ZmAppCtxt.prototype.getNewSearchDialog =
function() {
	if (!this._newSearchDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._newSearchDialog = new ZmNewSearchDialog(parent, msgDialog);
	}
	return this._newSearchDialog;
};

ZmAppCtxt.prototype.getRenameFolderDialog =
function() {
	if (!this._renameFolderDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._renameFolderDialog = new ZmRenameFolderDialog(parent, msgDialog);
	}
	return this._renameFolderDialog;
};

ZmAppCtxt.prototype.getMoveToDialog =
function() {
	if (!this._moveToDialog) {
		var parent = this.getShell();
		var msgDialog = this.getMsgDialog();
		this._moveToDialog = new ZmMoveToDialog(parent, msgDialog);
	}
	return this._moveToDialog;
};

ZmAppCtxt.prototype.getFolderPropsDialog =
function() {
	if (!this._folderPropsDialog)
		this._folderPropsDialog = new ZmFolderPropsDialog(this, this.getShell());
	return this._folderPropsDialog;
};

ZmAppCtxt.prototype.getSharePropsDialog =
function() {
	if (!this._sharePropsDialog)
		this._sharePropsDialog = new ZmSharePropsDialog(this, this.getShell());
	return this._sharePropsDialog;
};

ZmAppCtxt.prototype.getAcceptShareDialog = function() {
	if (!this._acceptShareDialog)
		this._acceptShareDialog = new ZmAcceptShareDialog(this, this.getShell());
	return this._acceptShareDialog;
};

ZmAppCtxt.prototype.getDeclineShareDialog = function() { 
	if (!this._declineShareDialog)
		this._declineShareDialog = new ZmDeclineShareDialog(this, this.getShell());
	return this._declineShareDialog;
};

ZmAppCtxt.prototype.getRevokeShareDialog = function() {
	if (!this._revokeShareDialog)
		this._revokeShareDialog = new ZmRevokeShareDialog(this, this.getShell());
	return this._revokeShareDialog;
};

/**
* Returns the dialog used to add or edit a filter rule.
*/
ZmAppCtxt.prototype.getFilterRuleDialog =
function() {
	if (!this._filterRuleDialog)
		this._filterRuleDialog = new ZmFilterRuleDialog(this);
	return this._filterRuleDialog;
};

ZmAppCtxt.prototype.getConfirmationDialog =
function() {
	if (!this._confirmDialog)
		this._confirmDialog = new DwtConfirmDialog(this.getShell());
	return this._confirmDialog;
};

ZmAppCtxt.prototype.getUploadDialog =
function() {
	if (!this._uploadDialog)
		this._uploadDialog = new ZmUploadDialog(this, this.getShell());
	return this._uploadDialog;
};

ZmAppCtxt.prototype.clearAllDialogs =
function() {
	this.clearFolderDialogs();
	this.clearCalendarDialogs();
	this.clearNotebookDialogs();
	this.clearShareDialogs();
	this._filterRuleDialog = null;
	this._confirmDialog = null;	
	this._uploadDialog = null;
};

ZmAppCtxt.prototype.clearFolderDialogs =
function() {
	this._newFolderDialog = this._newSearchDialog = this._renameFolderDialog = this._moveToFolderDialog = null;
	this._folderPropsDialog = null;
};

ZmAppCtxt.prototype.clearCalendarDialogs =
function() {
	this._newCalendarDialog = null;
};

ZmAppCtxt.prototype.clearNotebookDialogs =
function() {
	this._newNotebookDialog = null;
};

ZmAppCtxt.prototype.clearShareDialogs = 
function() {
	this._sharePropsDialog = null;
	this._acceptShareDialog = null;
	this._declineShareDialog = null;
	this._revokeShareDialog = null;
};

ZmAppCtxt.prototype.getRootTabGroup =
function() {
	if (!this._rootTabGrp)
		this._rootTabGrp = new DwtTabGroup("ROOT");
	return this._rootTabGrp;
}

ZmAppCtxt.prototype.getShell =
function() {
	return this._shell;
};

ZmAppCtxt.prototype.setShell =
function(shell) {
	this._shell = shell;
	shell.setData(ZmAppCtxt.LABEL, this);
};

ZmAppCtxt.prototype.getTree =
function(type) {
	return this._trees[type];
};

ZmAppCtxt.prototype.setTree =
function(type, tree) {
	this._trees[type] = tree;
};

ZmAppCtxt.prototype.getUsername = 
function() { 
	// get username from the cookie set during successful login
	return AjxCookie.getCookie(document, "ls_last_username");
};

ZmAppCtxt.prototype.getUploadFrameId =
function() {
	if (!this._uploadManagerIframeId) {
		var iframeId = Dwt.getNextId();
		var html = [ "<iframe name='", iframeId, "' id='", iframeId,
			     "' src='", (AjxEnv.isIE && location.protocol == "https:") ? appContextPath+"/public/blank.html" : "javascript:\"\"",
			     "' style='position: absolute; top: 0; left: 0; visibility: hidden'></iframe>" ];
		var div = document.createElement("div");
		div.innerHTML = html.join("");
		document.body.appendChild(div.firstChild);
		this._uploadManagerIframeId = iframeId;
	}
	return this._uploadManagerIframeId;
};

ZmAppCtxt.prototype.getUploadManager = 
function() { 
	return this._uploadManager;
};

ZmAppCtxt.prototype.setUploadManager = 
function(uploadManager) {
	this._uploadManager = uploadManager;
};

ZmAppCtxt.prototype.getCurrentAppToolbar =
function() { 
	return this._currentAppToolbar;
};

ZmAppCtxt.prototype.setCurrentAppToolbar =
function(toolbar) {
	this._currentAppToolbar = toolbar;
};

ZmAppCtxt.prototype.getCurrentSearch =
function() { 
	return this._currentSearch;
};

ZmAppCtxt.prototype.setCurrentSearch =
function(search) {
	this._currentSearch = search;
};

ZmAppCtxt.prototype.getCurrentViewId =
function() {
	return this.getAppViewMgr().getCurrentViewId();
};

ZmAppCtxt.prototype.getCurrentView =
function() {
	return this.getAppViewMgr().getCurrentView();
};

ZmAppCtxt.prototype.getCurrentController =
function() {
	var view = this.getCurrentView();
	return view ? view.getController() : null;
};

ZmAppCtxt.prototype.setCurrentList =
function(list) {
	this._list = list;
};

ZmAppCtxt.prototype.getCurrentList =
function() {
	var ctlr = this.getCurrentController();
	return (ctlr && ctlr.getList) ? ctlr.getList() : this._list ? this._list : null;
};

ZmAppCtxt.prototype.getNewWindow = 
function(fullVersion) {
	var args = "height=450,width=615,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var prefix = document.location.protocol + "//" + document.domain;
	var port = (!location.port || location.port == "80") ? "" : ":" + location.port;
	var url = prefix + port + appContextPath+"/public/launchNewWindow.jsp";
	if (fullVersion)
		url += "?full=1";
	var newWin = window.open(url, "_blank", args);
	
	// add this new window to global list so parent can keep track of child windows!
	return this.getAppController().addChildWindow(newWin);
};

ZmAppCtxt.prototype.setItemCache =
function(cache) {
	this._itemCache = cache;
};

ZmAppCtxt.prototype.getItemCache =
function() {
	return this._itemCache;
};

ZmAppCtxt.prototype.cacheSet =
function(key, value) {
	if (this._itemCache)
		this._itemCache.set(key, value);
};

ZmAppCtxt.prototype.cacheGet =
function(key) {
	return this._itemCache ? this._itemCache.get(key) : null;
};
