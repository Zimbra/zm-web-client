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

ZmAppCtxt.prototype.setRequestMgr =
function(requestMgr) {
	this._requestMgr = requestMgr;
};

ZmAppCtxt.prototype.getRequestMgr =
function() {
	return this._requestMgr;
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
	return this._settings;
};

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
	if (!this._searchController) {
		this._searchController = new ZmSearchController(this, this._shell);
	}
	return this._searchController;
};

/**
* Returns a handle to the overview controller.
*/
ZmAppCtxt.prototype.getOverviewController =
function() {
	if (!this._overviewController) {
		this._overviewController = new ZmOverviewController(this, this._shell);
	}
	return this._overviewController;
};

ZmAppCtxt.prototype.getLoginDialog =
function() {
	if (!this._loginDialog) {
		this._loginDialog = new ZmLoginDialog(this._shell, this);
	}
	return this._loginDialog;
};

ZmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog) {
		this._msgDialog = new DwtMessageDialog(this._shell);
	}
	return this._msgDialog;
};

ZmAppCtxt.prototype.getYesNoMsgDialog =
function() {
	if (!this._yesNoMsgDialog) {
		this._yesNoMsgDialog = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	}	
	return this._yesNoMsgDialog;
};

ZmAppCtxt.prototype.getYesNoCancelMsgDialog =
function() {
	if (!this._yesNoCancelMsgDialog) {
		this._yesNoCancelMsgDialog = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]);
	}	
	return this._yesNoCancelMsgDialog;
};

ZmAppCtxt.prototype.getOkCancelMsgDialog =
function() {
	if (!this._okCancelMsgDialog) {
		this._okCancelMsgDialog = new DwtMessageDialog(this._shell, null, [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]);
	}	
	return this._okCancelMsgDialog;
};

ZmAppCtxt.prototype.getErrorDialog = 
function() {
	if (!this._errorDialog) {
		this._errorDialog = new ZmErrorDialog(this._shell, this, ZmMsg);
	}
	return this._errorDialog;
};

ZmAppCtxt.prototype.getNewTagDialog =
function() {
	if (!this._newTagDialog) {
		this._newTagDialog = new ZmNewTagDialog(this._shell, this.getMsgDialog());
	}
	return this._newTagDialog;
};

ZmAppCtxt.prototype.getRenameTagDialog =
function() {
	if (!this._renameTagDialog) {
		AjxDispatcher.require("Extras");
		this._renameTagDialog = new ZmRenameTagDialog(this._shell, this.getMsgDialog());
	}
	return this._renameTagDialog;
};

ZmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog) {
		this._newFolderDialog = new ZmNewFolderDialog(this._shell, this.getMsgDialog());
	}
	return this._newFolderDialog;
};

ZmAppCtxt.prototype.getNewAddrBookDialog = 
function() {
	if (!this._newAddrBookDialog) {
		AjxDispatcher.require("Contacts");
		this._newAddrBookDialog = new ZmNewAddrBookDialog(this._shell);
	}
	return this._newAddrBookDialog;
}

ZmAppCtxt.prototype.getNewCalendarDialog =
function() {
	if (!this._newCalendarDialog) {
		AjxDispatcher.require(["CalendarCore", "Calendar"]);
		this._newCalendarDialog = new ZmNewCalendarDialog(this._shell, this.getMsgDialog());
	}
	return this._newCalendarDialog;
};

ZmAppCtxt.prototype.getNewNotebookDialog =
function() {
	if (!this._newNotebookDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._newNotebookDialog = new ZmNewNotebookDialog(this._shell, this.getMsgDialog());
	}
	return this._newNotebookDialog;
};

ZmAppCtxt.prototype.getNewTaskFolderDialog =
function() {
	if (!this._newTaskFolderDialog) {
		AjxDispatcher.require(["TasksCore", "Tasks"]);
		this._newTaskFolderDialog = new ZmNewTaskFolderDialog(this._shell, this.getMsgDialog());
	}
	return this._newTaskFolderDialog;
};

ZmAppCtxt.prototype.getPageConflictDialog =
function() {
	if (!this._pageConflictDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._pageConflictDialog = new ZmPageConflictDialog(this, this._shell);
	}
	return this._pageConflictDialog;
};

ZmAppCtxt.prototype.getNewImDialog =
function() {
	if (!this._newImDialog) {
		AjxDispatcher.require("IM");
		this._newImDialog = new ZmNewImDialog(this._shell);
	}
	return this._newImDialog;
};

ZmAppCtxt.prototype.getNewRosterItemDialog =
function() {
	if (!this._newRosterItemDialog) {
		AjxDispatcher.require("IM");
		this._newRosterItemDialog = new ZmNewRosterItemDialog(this._shell, this, this.getMsgDialog());
	}
	return this._newRosterItemDialog;
};

ZmAppCtxt.prototype.getNewSearchDialog =
function() {
	if (!this._newSearchDialog) {
		this._newSearchDialog = new ZmNewSearchDialog(this._shell, this.getMsgDialog());
	}
	return this._newSearchDialog;
};

ZmAppCtxt.prototype.getRenameFolderDialog =
function() {
	if (!this._renameFolderDialog) {
		AjxDispatcher.require("Extras");
		this._renameFolderDialog = new ZmRenameFolderDialog(this._shell, this.getMsgDialog());
	}
	return this._renameFolderDialog;
};

ZmAppCtxt.prototype.getMoveToDialog =
function() {
	if (!this._moveToDialog) {
		AjxDispatcher.require("Extras");
		this._moveToDialog = new ZmMoveToDialog(this._shell, this.getMsgDialog());
	}
	return this._moveToDialog;
};

ZmAppCtxt.prototype.getChooseFolderDialog =
function() {
	if (!this._chooseFolderDialog) {
		AjxDispatcher.require("Extras");
		this._chooseFolderDialog = new ZmChooseFolderDialog(this._shell);
	}
	return this._chooseFolderDialog;
};

ZmAppCtxt.prototype.getPickTagDialog =
function() {
	if (!this._pickTagDialog) {
		AjxDispatcher.require("Extras");
		this._pickTagDialog = new ZmPickTagDialog(this._shell, this.getMsgDialog());
	}
	return this._pickTagDialog;
};

ZmAppCtxt.prototype.getFolderPropsDialog =
function() {
	if (!this._folderPropsDialog) {
		this._folderPropsDialog = new ZmFolderPropsDialog(this, this._shell);
	}
	return this._folderPropsDialog;
};

ZmAppCtxt.prototype.getLinkPropsDialog =
function() {
	if (!this._linkPropsDialog) {
		AjxDispatcher.require("Share");
		this._linkPropsDialog = new ZmLinkPropsDialog(this, this._shell);
	}
	return this._linkPropsDialog;
};

ZmAppCtxt.prototype.getSharePropsDialog =
function() {
	if (!this._sharePropsDialog) {
		AjxDispatcher.require("Share");
		this._sharePropsDialog = new ZmSharePropsDialog(this, this._shell);
	}
	return this._sharePropsDialog;
};

ZmAppCtxt.prototype.getAcceptShareDialog =
function() {
	if (!this._acceptShareDialog) {
		AjxDispatcher.require("Share");
		this._acceptShareDialog = new ZmAcceptShareDialog(this, this._shell);
	}
	return this._acceptShareDialog;
};

ZmAppCtxt.prototype.getDeclineShareDialog =
function() {
	if (!this._declineShareDialog) {
		AjxDispatcher.require("Share");
		this._declineShareDialog = new ZmDeclineShareDialog(this, this._shell);
	}
	return this._declineShareDialog;
};

ZmAppCtxt.prototype.getRevokeShareDialog =
function() {
	if (!this._revokeShareDialog) {
		AjxDispatcher.require("Share");
		this._revokeShareDialog = new ZmRevokeShareDialog(this, this._shell);
	}
	return this._revokeShareDialog;
};

ZmAppCtxt.prototype.getMountFolderDialog =
function() {
	if (!this._mountFolderDialog) {
		AjxDispatcher.require("Share");
		this._mountFolderDialog = new ZmMountFolderDialog(this, this._shell);
	}
	return this._mountFolderDialog;
};

/**
* Returns the dialog used to add or edit a filter rule.
*/
ZmAppCtxt.prototype.getFilterRuleDialog =
function() {
	if (!this._filterRuleDialog) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._filterRuleDialog = new ZmFilterRuleDialog(this);
	}
	return this._filterRuleDialog;
};

ZmAppCtxt.prototype.getConfirmationDialog =
function() {
	if (!this._confirmDialog) {
		this._confirmDialog = new DwtConfirmDialog(this._shell);
	}
	return this._confirmDialog;
};

ZmAppCtxt.prototype.getUploadDialog =
function() {
	if (!this._uploadDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._uploadDialog = new ZmUploadDialog(this, this._shell);
	}
	return this._uploadDialog;
};

ZmAppCtxt.prototype.getUploadConflictDialog =
function() {
	if (!this._uploadConflictDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._uploadConflictDialog = new ZmUploadConflictDialog(this, this._shell);
	}
	return this._uploadConflictDialog;
};

ZmAppCtxt.prototype.getChangePasswordDialog =
function() {
	if (!this._changePasswordDialog) {
		AjxDispatcher.require("Extras");
		this._changePasswordDialog = new ZmChangePasswordDialog(this._shell, this.getMsgDialog());
	}
	return this._changePasswordDialog;
}

ZmAppCtxt.prototype.clearAllDialogs =
function() {
	this.clearFolderDialogs();
	this.clearCalendarDialogs();
	this.clearNotebookDialogs();
	this.clearShareDialogs();
	this.clearUploadDialogs();
	this.clearOtherDialogs();
};

ZmAppCtxt.prototype.clearFolderDialogs =
function() {
	this._newFolderDialog = null;
	this._newSearchDialog = null;
	this._renameFolderDialog = null;
	this._moveToFolderDialog = null;
	this._folderPropsDialog = null;
	this._chooseFolderDialog = null;
};

ZmAppCtxt.prototype.clearCalendarDialogs =
function() {
	this._newCalendarDialog = null;
};

ZmAppCtxt.prototype.clearNotebookDialogs =
function() {
	this._newNotebookDialog = null;
	this._pageConflictDialog = null;
};

ZmAppCtxt.prototype.clearShareDialogs = 
function() {
	this._sharePropsDialog = null;
	this._acceptShareDialog = null;
	this._declineShareDialog = null;
	this._revokeShareDialog = null;
	this._mountFolderDialog = null;
};

ZmAppCtxt.prototype.clearUploadDialogs =
function() {
	this._uploadDialog = null;
	this._uploadConflictDialog = null;
};

ZmAppCtxt.prototype.clearOtherDialogs =
function() {
	this._filterRuleDialog = null;
	this._confirmDialog = null;
	this._pickTagDialog = null;
	this._changePasswordDialog = null;
	this._renameTagDialog = null;
};

ZmAppCtxt.prototype.getRootTabGroup =
function() {
	var isChildWin = this.getAppController().isChildWindow();
	if (isChildWin) {
		if (!this._childWinTabGrp) {
			this._childWinTabGrp = new DwtTabGroup("CHILD_WINDOW");
		}
	} else {		
		if (!this._rootTabGrp) {
			this._rootTabGrp = new DwtTabGroup("ROOT");
		}
	}
	return isChildWin ? this._childWinTabGrp : this._rootTabGrp;
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
	if (type == ZmOrganizer.TAG) {
		return this.getTagTree();
	} else if (type == ZmOrganizer.ZIMLET) {
		return this.getZimletTree();
	} else {
		return this.getFolderTree();
	}
};

ZmAppCtxt.prototype.setTree =
function(type, tree) {
	this._trees[type] = tree;
};

ZmAppCtxt.prototype.getFolderTree =
function() {
	return this.getAppController().isChildWindow()
		? window.parentController._appCtxt.getFolderTree()
		: this._folderTree;
};

ZmAppCtxt.prototype.setFolderTree =
function(tree) {
	this._folderTree = tree;
};

ZmAppCtxt.prototype.getTagTree =
function() {
	return this.getAppController().isChildWindow()
		? window.parentController._appCtxt.getTagTree()
		: this._tagTree;
};

ZmAppCtxt.prototype.setTagTree =
function(tree) {
	this._tagTree = tree;
};

ZmAppCtxt.prototype.getZimletTree =
function() {
	return this.getAppController().isChildWindow()
		? window.parentController._appCtxt.getZimletTree()
		: this._zimletTree;
};

ZmAppCtxt.prototype.setZimletTree =
function(tree) {
	this._zimletTree = tree;
};

ZmAppCtxt.prototype.getUsername = 
function() { 
	// get username from acct info received in GetInfoResponse
	return this.get(ZmSetting.USERNAME);
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
	return (view && view.getController) ? view.getController() : null;
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
	// build url
	var url = [];
	var i = 0;
	url[i++] = document.location.protocol;
	url[i++] = "//";
	url[i++] = document.domain;
	url[i++] = (!location.port || location.port == "80") ? "" : (":" + location.port);
	url[i++] = appContextPath;
	url[i++] = "/public/launchNewWindow.jsp?skin=";
	url[i++] = this.get(ZmSetting.SKIN_NAME);
	if (fullVersion)
		url[i++] = "&full=1";

	var args = "height=465,width=705,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
	var newWin = window.open(url.join(""), "_blank", args);
	
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

ZmAppCtxt.prototype.cacheRemove =
function(key) {
	this._itemCache.clear(key);
};

ZmAppCtxt.prototype.getById =
function(id) {
	return this._itemCache ? this._itemCache.get(id) : null;
};

ZmAppCtxt.prototype.getCsfeMsgFetcher = 
function() {
	if (!this._csfeMsgFetchSvc) {
		this._csfeMsgFetchSvc = location.protocol + "//" + document.domain + this.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	}
	return this._csfeMsgFetchSvc;
};

ZmAppCtxt.prototype.getKeyboardMgr =
function() {
	return this._shell.getKeyboardMgr();
};

ZmAppCtxt.prototype.zimletsPresent =
function() {
	return this._zimletsPresent;
};

ZmAppCtxt.prototype.setZimletsPresent =
function(zimletsPresent) {
	this._zimletsPresent = zimletsPresent;
};

ZmAppCtxt.prototype.getZimletMgr =
function() {
	if (!this._zimletMgr) {
		AjxDispatcher.require("Zimlet");
		this._zimletMgr = new ZmZimletMgr(this);
	}
	return this._zimletMgr;
};

ZmAppCtxt.prototype.getPrintView =
function() {
	if (!this._printView) {
		AjxDispatcher.require("Extras");
		this._printView = new ZmPrintView(this);
	}
	return this._printView;
};
