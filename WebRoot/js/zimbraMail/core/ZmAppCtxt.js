/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the application context class.
 *
 */

/**
 * Creates an application context.
 * @class
 * This class is a container for application context information.
 * 
 */
ZmAppCtxt = function() {

	this._trees = {};

	this.accountList = new ZmAccountList();
	// create dummy account for startup
	this.accountList.add(new ZmZimbraAccount(ZmAccountList.DEFAULT_ID, null, false));

	// public properties
	this.inStartup = false;				// true if we are starting app (set in ZmZimbraMail)
	this.currentRequestParams = null;	// params of current SOAP request (set in ZmRequestMgr)
	this.rememberMe = null;
	this.userDomain = "";

	// account-specific
	this.isFamilyMbox = false;
	this.multiAccounts = false;

	this._evtMgr = new AjxEventMgr();

	this._itemCache			= {};
	this._itemCacheDeferred	= {};
	this._acCache			= {};	// autocomplete
};

ZmAppCtxt._ZIMLETS_EVENT = 'ZIMLETS';

/**
 * Returns a string representation of the application context.
 * 
 * @return		{String}		a string representation of the application context
 */
ZmAppCtxt.prototype.toString =
function() {
	return "ZmAppCtxt";
};

/**
 * Sets the application controller.
 * 
 * @param	{ZmController}	appController	the controller
 */
ZmAppCtxt.prototype.setAppController =
function(appController) {
	this._appController = appController;
};

/**
 * Gets the application controller.
 * 
 * @return	{ZmController}		the controller
 */
ZmAppCtxt.prototype.getAppController =
function() {
	return this._appController;
};

/**
 * Gets the application chooser.
 * 
 * @return	{ZmAppChooser}		the chooser
 */
ZmAppCtxt.prototype.getAppChooser =
function() {
	return this._appController.getAppChooser();
};

/**
 * Sets the request manager.
 * 
 * @param	{ZmRequestMgr}	requestMgr	the request manager
 */
ZmAppCtxt.prototype.setRequestMgr =
function(requestMgr) {
	this._requestMgr = requestMgr;
};

/**
 * Gets the request manager.
 * 
 * @return	{ZmRequestMgr}		the request manager
 */
ZmAppCtxt.prototype.getRequestMgr =
function() {
	return this._requestMgr;
};

/**
 * Sets the status message to display.
 * 
 * 
 * @param {Hash}	params	a hash of parameters
 * @param	{String}	params.msg 		the status message
 * @param	{constant}	params.level	the status level {@link ZmStatusView}  (may be <code>null</code>)
 * @param	{String}	params.detail 	the details (may be <code>null</code>)
 * @param	{Object}	params.transitions 	the transitions (may be <code>null</code>)
 * @param	{Object}	params.toast	the toast control (may be <code>null</code>)
 * </ul>
 * 
 */
ZmAppCtxt.prototype.setStatusMsg =
function(params) {
	params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
	this._appController.setStatusMsg(params);
};

/**
 * Gets the settings for the given account.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmSettings}	the settings
 */
ZmAppCtxt.prototype.getSettings =
function(account) {
	var al = this.accountList;
	var id = account
		? account.id
		: al.activeAccount ? al.activeAccount.id : ZmAccountList.DEFAULT_ID;

	var acct = al.getAccount(id);
	return acct && acct.settings;
};

/**
 * Sets the settings for the given account.
 * 
 * @param	{ZmSettings}	settings		the settings
 * @param	{ZmZimbraAccount}		account			the account
 */
ZmAppCtxt.prototype.setSettings = 
function(settings, account) {
	var al = this.accountList;
	var id = account
		? account.id
		: al.activeAccount ? al.activeAccount.id : ZmAccountList.DEFAULT_ID;

	var acct = al.getAccount(id);
	if (acct) {
		acct.settings = settings;
	}
};

/**
 * Gets the value of the given setting.
 *
 * @param {constant}	id		the setting id
 * @param {String}	key			the setting key (for settings that are of the hash type)
 * @param {ZmZimbraAccount}	account		the account
 * @return	{Object}		the setting value
 */
ZmAppCtxt.prototype.get =
function(id, key, account) {
	// for offline, global settings always come from the "local" parent account
	var acct = (appCtxt.multiAccounts && ZmSetting.IS_GLOBAL[id])
		? this.accountList.mainAccount : account;
	return this.getSettings(acct).get(id, key);
};

/**
 * Sets the value of the given setting.
 *
 * @param {constant}	id					the setting id
 * @param {Object}	value					the setting value
 * @param {String}	key					the setting key (for settings that are of the hash type)
 * @param {Boolean}	setDefault			if <code>true</code>, also replace setting default value
 * @param {Boolean}	skipNotify			if <code>true</code>, do not notify setting listeners
 * @param {ZmZimbraAccount}	account		if set, use this account setting instead of the currently active account
 */
ZmAppCtxt.prototype.set =
function(id, value, key, setDefault, skipNotify, account) {
	// for offline, global settings always come from "parent" account
	var acct = (this.multiAccounts && ZmSetting.IS_GLOBAL[id])
		? this.accountList.mainAccount : account;
	var setting = this.getSettings(acct).getSetting(id);

	if (setting) {
		setting.setValue(value, key, setDefault, skipNotify);
	}
};

/**
 * Gets the application.
 * 
 * @param	{String}	appName		the application name
 * @return	{ZmApp}	the application or <code>null</code> if not found
 */
ZmAppCtxt.prototype.getApp =
function(appName) {
	return this._appController.getApp(appName);
};

/**
 * Gets the name of the current application.
 * 
 * @return	{String}		the application name
 */
ZmAppCtxt.prototype.getCurrentAppName =
function() {
	var context = this.isChildWindow ? parentAppCtxt : this;
	return context._appController.getActiveApp();
};

/**
 * Gets the current application.
 * 
 * @return	{ZmApp}		the current application
 */
ZmAppCtxt.prototype.getCurrentApp =
function() {
	return this.getApp(this.getCurrentAppName());
};

/**
 * Gets the application view manager.
 * 
 * @return	{ZmAppViewMgr}		the view manager
 */
ZmAppCtxt.prototype.getAppViewMgr =
function() {
	return this._appController.getAppViewMgr();
};

/**
 * Gets the client command handler.
 * 
 * @param	{ZmClientCmdHandler}	clientCmdHdlr		not used
 * @return	{ZmClientCmdHandler}		the command handler
 */
ZmAppCtxt.prototype.getClientCmdHandler =
function(clientCmdHdlr) {
	if (!this._clientCmdHandler) {
		AjxDispatcher.require("Extras");
		this._clientCmdHandler = new ZmClientCmdHandler();
	}
	return this._clientCmdHandler;
};

/**
 * Gets the search bar controller.
 * 
 * @return	{ZmSearchController}	the search controller
 */
ZmAppCtxt.prototype.getSearchController =
function() {
	if (!this._searchController) {
		this._searchController = new ZmSearchController(this._shell);
	}
	return this._searchController;
};

/**
 * Gets the overview controller.
 * 
 * @return	{ZmOverviewController}	the overview controller
 */
ZmAppCtxt.prototype.getOverviewController =
function() {
	if (!this._overviewController) {
		this._overviewController = new ZmOverviewController(this._shell);
	}
	return this._overviewController;
};

/**
 * Gets the import/export controller.
 * 
 * @return	{ZmImportExportController}	the controller
 */
ZmAppCtxt.prototype.getImportExportController = function() {
	if (!this._importExportController) {
		AjxDispatcher.require("ImportExport");
		this._importExportController = new ZmImportExportController();
	}
	return this._importExportController;
};

/**
 * Gets the login dialog.
 * 
 * @return	{ZmLoginDialog}		the login dialog
 */
ZmAppCtxt.prototype.getLoginDialog =
function() {
	if (!this._loginDialog) {
		this._loginDialog = new ZmLoginDialog(this._shell);
	}
	return this._loginDialog;
};

/**
 * Gets the message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog) {
		this._msgDialog = new DwtMessageDialog({parent:this._shell});
	}
	return this._msgDialog;
};

/**
 * Gets the yes/no message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getYesNoMsgDialog =
function() {
	if (!this._yesNoMsgDialog) {
		this._yesNoMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]});
	}	
	return this._yesNoMsgDialog;
};

/**
 * Gets the yes/no/cancel message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getYesNoCancelMsgDialog =
function() {
	if (!this._yesNoCancelMsgDialog) {
		this._yesNoCancelMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON]});
	}	
	return this._yesNoCancelMsgDialog;
};

/**
 * Gets the ok/cancel message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getOkCancelMsgDialog =
function() {
	if (!this._okCancelMsgDialog) {
		this._okCancelMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
	}	
	return this._okCancelMsgDialog;
};

/**
 * Gets the cancel message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getCancelMsgDialog =
function() {
	if (!this._cancelMsgDialog) {
		this._cancelMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.CANCEL_BUTTON]});
	}
	return this._cancelMsgDialog;
};

/**
 * Gets the error dialog.
 * 
 * @return	{ZmErrorDialog}	the error dialog
 */
ZmAppCtxt.prototype.getErrorDialog = 
function() {
	if (!this._errorDialog) {
		AjxDispatcher.require("Startup2");
		this._errorDialog = new ZmErrorDialog(this._shell, ZmMsg);
	}
	return this._errorDialog;
};

/**
 * Gets the new tag dialog.
 * 
 * @return	{ZmNewTagDialog}	the new tag dialog
 */
ZmAppCtxt.prototype.getNewTagDialog =
function() {
	if (!this._newTagDialog) {
		this._newTagDialog = new ZmNewTagDialog(this._shell);
	}
	return this._newTagDialog;
};

/**
 * Gets the rename tag dialog.
 * 
 * @return	{ZmRenameTagDialog}		the rename tag dialog
 */
ZmAppCtxt.prototype.getRenameTagDialog =
function() {
	if (!this._renameTagDialog) {
		AjxDispatcher.require("Extras");
		this._renameTagDialog = new ZmRenameTagDialog(this._shell);
	}
	return this._renameTagDialog;
};

/**
 * Gets the new folder dialog.
 * 
 * @return	{ZmNewFolderDialog}		the new folder dialog
 */
ZmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog) {
		this._newFolderDialog = new ZmNewFolderDialog(this._shell);
	}
	return this._newFolderDialog;
};

/**
 * Gets the new address book dialog.
 * 
 * @return	{ZmNewAddrBookDialog}		the new address book dialog
 */
ZmAppCtxt.prototype.getNewAddrBookDialog = 
function() {
	if (!this._newAddrBookDialog) {
		AjxDispatcher.require("Contacts");
		this._newAddrBookDialog = new ZmNewAddrBookDialog(this._shell);
	}
	return this._newAddrBookDialog;
};

/**
 * Gets the new calendar dialog.
 * 
 * @return	{ZmNewCalendarDialog}		the new calendar dialog
 */
ZmAppCtxt.prototype.getNewCalendarDialog =
function() {
	if (!this._newCalendarDialog) {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
		this._newCalendarDialog = new ZmNewCalendarDialog(this._shell);
	}
	return this._newCalendarDialog;
};

/**
 * Gets the new notebook dialog.
 * 
 * @return	{ZmNewNotebookDialog}		the new notebook dialog
 */
ZmAppCtxt.prototype.getNewNotebookDialog =
function() {
	if (!this._newNotebookDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._newNotebookDialog = new ZmNewNotebookDialog(this._shell);
	}
	return this._newNotebookDialog;
};

/**
 * Gets the new task folder dialog.
 * 
 * @return	{ZmNewTaskFolderDialog}		the new task folder dialog
 */
ZmAppCtxt.prototype.getNewTaskFolderDialog =
function() {
	if (!this._newTaskFolderDialog) {
		AjxDispatcher.require(["TasksCore", "Tasks"]);
		this._newTaskFolderDialog = new ZmNewTaskFolderDialog(this._shell);
	}
	return this._newTaskFolderDialog;
};

/**
 * Gets the page conflict dialog.
 * 
 * @return	{ZmPageConflictDialog}		the page conflict dialog
 */
ZmAppCtxt.prototype.getPageConflictDialog =
function() {
	if (!this._pageConflictDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._pageConflictDialog = new ZmPageConflictDialog(this._shell);
	}
	return this._pageConflictDialog;
};

/**
 * Gets the dialog.
 * 
 * @return	{DwtDialog}		the dialog
 */
ZmAppCtxt.prototype.getDialog =
function(){
	if(!this._dialog){
		this._dialog = new DwtDialog({parent:this._shell});
	}
	return this._dialog;
};

/**
 * Gets the new search dialog.
 * 
 * @return	{ZmNewSearchDialog}		the new search dialog
 */
ZmAppCtxt.prototype.getNewSearchDialog =
function() {
	if (!this._newSearchDialog) {
		this._newSearchDialog = new ZmNewSearchDialog(this._shell);
	}
	return this._newSearchDialog;
};

/**
 * Gets the rename folder dialog.
 * 
 * @return	{ZmRenameFolderDialog}		the rename folder dialog
 */
ZmAppCtxt.prototype.getRenameFolderDialog =
function() {
	if (!this._renameFolderDialog) {
		AjxDispatcher.require("Extras");
		this._renameFolderDialog = new ZmRenameFolderDialog(this._shell);
	}
	return this._renameFolderDialog;
};

/**
 * Gets the choose folder dialog.
 * 
 * @return	{ZmChooseFolderDialog}		the choose folder dialog
 */
ZmAppCtxt.prototype.getChooseFolderDialog =
function() {
	if (!this._chooseFolderDialog) {
		AjxDispatcher.require("Extras");
		this._chooseFolderDialog = new ZmChooseFolderDialog(this._shell);
	}
	return this._chooseFolderDialog;
};

ZmAppCtxt.prototype.getChooseAccountDialog =
function() {
	if (!this._chooseAccountDialog) {
		AjxDispatcher.require("Extras");
		this._chooseAccountDialog = new ZmChooseAccountDialog(this._shell);
	}
	return this._chooseAccountDialog;
}

/**
 * Gets the pick tag dialog.
 * 
 * @return	{ZmPickTagDialog}		the pick tag dialog
 */
ZmAppCtxt.prototype.getPickTagDialog =
function() {
	if (!this._pickTagDialog) {
		AjxDispatcher.require("Extras");
		this._pickTagDialog = new ZmPickTagDialog(this._shell);
	}
	return this._pickTagDialog;
};

/**
 * Gets the folder notify dialog.
 * 
 * @return	{ZmFolderNotifyDialog}		the folder notify dialog
 */
ZmAppCtxt.prototype.getFolderNotifyDialog =
function() {
	if (!this._folderNotifyDialog) {
		this._folderNotifyDialog = new ZmFolderNotifyDialog(this._shell);
	}
	return this._folderNotifyDialog;
};

/**
 * Gets the folder properties dialog.
 * 
 * @return	{ZmFolderPropsDialog}		the folder properties dialog
 */
ZmAppCtxt.prototype.getFolderPropsDialog =
function() {
	if (!this._folderPropsDialog) {
		this._folderPropsDialog = new ZmFolderPropsDialog(this._shell);
	}
	return this._folderPropsDialog;
};

/**
 * Gets the link properties dialog.
 * 
 * @return	{ZmLinkPropsDialog}		the link properties dialog
 */
ZmAppCtxt.prototype.getLinkPropsDialog =
function() {
	if (!this._linkPropsDialog) {
		AjxDispatcher.require("Share");
		this._linkPropsDialog = new ZmLinkPropsDialog(this._shell);
	}
	return this._linkPropsDialog;
};

/**
 * Gets the share properties dialog.
 * 
 * @return	{ZmSharePropsDialog}		the share properties dialog
 */
ZmAppCtxt.prototype.getSharePropsDialog =
function() {
	if (!this._sharePropsDialog) {
		AjxDispatcher.require("Share");
		this._sharePropsDialog = new ZmSharePropsDialog(this._shell);
	}
	return this._sharePropsDialog;
};

/**
 * Gets the accept share dialog.
 * 
 * @return	{ZmAcceptShareDialog}		the accept share dialog
 */
ZmAppCtxt.prototype.getAcceptShareDialog =
function() {
	if (!this._acceptShareDialog) {
		AjxDispatcher.require("Share");
		this._acceptShareDialog = new ZmAcceptShareDialog(this._shell);
	}
	return this._acceptShareDialog;
};

/**
 * Gets the decline share dialog.
 * 
 * @return	{ZmDeclineShareDialog}		the decline share dialog
 */
ZmAppCtxt.prototype.getDeclineShareDialog =
function() {
	if (!this._declineShareDialog) {
		AjxDispatcher.require("Share");
		this._declineShareDialog = new ZmDeclineShareDialog(this._shell);
	}
	return this._declineShareDialog;
};

/**
 * Gets the revoke share dialog.
 * 
 * @return	{ZmRevokeShareDialog}		the revoke share dialog
 */
ZmAppCtxt.prototype.getRevokeShareDialog =
function() {
	if (!this._revokeShareDialog) {
		AjxDispatcher.require("Share");
		this._revokeShareDialog = new ZmRevokeShareDialog(this._shell);
	}
	return this._revokeShareDialog;
};

/**
 * Gets the mount folder dialog.
 * 
 * @return	{ZmMountFolderDialog}		the mount folder dialog
 */
ZmAppCtxt.prototype.getMountFolderDialog =
function() {
	if (!this._mountFolderDialog) {
		AjxDispatcher.require("Share");
		this._mountFolderDialog = new ZmMountFolderDialog(this._shell);
	}
	return this._mountFolderDialog;
};

/**
 * Gets the timezone picker dialog.
 * 
 * @return	{ZmTimezonePicker}		the timezone picker dialog
 */
ZmAppCtxt.prototype.getTimezonePickerDialog =
function() {
	if (!this._timezonePickerDialog) {
		AjxDispatcher.require("Share");
		this._timezonePickerDialog = new ZmTimezonePicker(this._shell);
	}
	return this._timezonePickerDialog;
};

/**
 * Gets the filter rule add/edit dialog.
 * 
 * @return	{ZmFilterRuleDialog}		the filter rule add/edit dialog
 */
ZmAppCtxt.prototype.getFilterRuleDialog =
function() {
	if (!this._filterRuleDialog) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._filterRuleDialog = new ZmFilterRuleDialog();
	}
	return this._filterRuleDialog;
};

/**
 * Gets the confirm dialog.
 * 
 * @return	{DwtConfirmDialog}		the confirmation dialog
 */
ZmAppCtxt.prototype.getConfirmationDialog =
function() {
	if (!this._confirmDialog) {
		this._confirmDialog = new DwtConfirmDialog(this._shell);
	}
	return this._confirmDialog;
};

/**
 * Gets the upload dialog.
 * 
 * @return	{ZmUploadDialog}		the upload dialog
 */
ZmAppCtxt.prototype.getUploadDialog =
function() {
	if (!this._uploadDialog) {
		AjxDispatcher.require(["Extras"]);
		this._uploadDialog = new ZmUploadDialog(this._shell);
	}
	return this._uploadDialog;
};

/**
 * Gets the import dialog.
 * 
 * @return	{ZmImportDialog}		the import dialog
 */
ZmAppCtxt.prototype.getImportDialog =
function() {
	if (!this._importDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._importDialog = new ZmImportDialog(this._shell);
	}
	return this._importDialog;
};

/**
 * Gets the attach dialog.
 * 
 * @return	{ZmAttachDialog}		the attach dialog
 */
ZmAppCtxt.prototype.getAttachDialog =
function() {
	if (!this._attachDialog) {
		AjxDispatcher.require("Share");
		this._attachDialog = new ZmAttachDialog(this._shell);
		this.runAttachDialogCallbacks();
	}
	return this._attachDialog;
};

/**
 * Runs the attach dialog callbacks.
 *
 * @private
 */
ZmAppCtxt.prototype.runAttachDialogCallbacks =
function() {
	while(this._attachDialogCallback && this._attachDialogCallback.length > 0) {
		var callback = this._attachDialogCallback.shift();
		if(callback && (callback instanceof AjxCallback)) {
			callback.run(this._attachDialog);
		}
	}
};

/**
 * Adds the callback to the attachment dialog callbacks.
 *
 * @param	{AjxCallback}	callback		the callback
 */
ZmAppCtxt.prototype.addAttachmentDialogCallback =
function(callback) {
	if(!this._attachDialogCallback) {
		this._attachDialogCallback = [];
	}
	this._attachDialogCallback.push(callback);
};                                              

/**
 * Gets the upload conflict dialog.
 *
 * @return	{ZmUploadConflictDialog}	the upload conflict dialog
 */
ZmAppCtxt.prototype.getUploadConflictDialog =
function() {
	if (!this._uploadConflictDialog) {
		AjxDispatcher.require(["NotebookCore", "Notebook"]);
		this._uploadConflictDialog = new ZmUploadConflictDialog(this._shell);
	}
	return this._uploadConflictDialog;
};

/**
 * Gets the new briefcase dialog.
 *
 * @return	{ZmNewBriefcaseDialog}	the new briefcase dialog
 */
ZmAppCtxt.prototype.getNewBriefcaseDialog =
function() {
	if (!this._newBriefcaseDialog) {
		AjxDispatcher.require(["BriefcaseCore", "Briefcase"]);
		this._newBriefcaseDialog = new ZmNewBriefcaseDialog(this._shell);
	}
	return this._newBriefcaseDialog;
};

/**
 * Gets the find-and-replace dialog.
 *
 * @return	{ZmFindnReplaceDialog}	the find-and-replace dialog
 */
ZmAppCtxt.prototype.getReplaceDialog =
function() {
	if (!this._replaceDialog) {
		AjxDispatcher.require("Share");
		this._replaceDialog = new ZmFindnReplaceDialog(this._shell);
	}
	return this._replaceDialog;
};

/**
 * Gets the address selection dialog.
 *
 * @return	{ZmSelectAddrDialog}		the address selection dialog
 */
ZmAppCtxt.prototype.getAddrSelectDialog =
function() {
	if (!this._addrSelectDialog) {
		AjxDispatcher.require(["MailCore", "Mail"]);
		this._addrSelectDialog = new ZmSelectAddrDialog(this._shell);
	}
	return this._addrSelectDialog;
};

/**
 * Gets the debug log dialog.
 *
 * @return	{ZmDebugLogDialog}		the debug log dialog
 */
ZmAppCtxt.prototype.getDebugLogDialog =
function() {
	if (!this._debugLogDialog) {
		AjxDispatcher.require("Extras");
		this._debugLogDialog = new ZmDebugLogDialog(this._shell);
	}
	return this._debugLogDialog;
};

/**
 * Gets the root tab group.
 *
 * @return	{DwtTabGroup}	the root tab group
 */
ZmAppCtxt.prototype.getRootTabGroup =
function() {
	if (this.isChildWindow) {
		if (!this._childWinTabGrp) {
			this._childWinTabGrp = new DwtTabGroup("CHILD_WINDOW");
		}
	} else {		
		if (!this._rootTabGrp) {
			this._rootTabGrp = new DwtTabGroup("ROOT");
		}
	}
	return this.isChildWindow ? this._childWinTabGrp : this._rootTabGrp;
};

/**
 * Gets the shell.
 *
 * @return	{DwtShell}	the shell
 */
ZmAppCtxt.prototype.getShell =
function() {
	return this._shell;
};

/**
 * Sets the shell.
 *
 * @param	{DwtShell}	the shell
 */
ZmAppCtxt.prototype.setShell =
function(shell) {
	this._shell = shell;
};

/**
 * Gets the active account.
 *
 * @return	{ZmZimbraAccount}	the active account
 */
ZmAppCtxt.prototype.getActiveAccount =
function() {
	return this.isChildWindow
		? parentAppCtxt.accountList.activeAccount
		: this.accountList.activeAccount;
};

/**
 * Gets the identity collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmIdentityCollection}	the identity collection
 */
ZmAppCtxt.prototype.getIdentityCollection =
function(account) {
	var context = this.isChildWindow ? window.opener : window;
	return context.AjxDispatcher.run("GetIdentityCollection", account);
};

/**
 * Gets the data source collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmModel}	the data source collection
 */
ZmAppCtxt.prototype.getDataSourceCollection =
function(account) {
	var context = this.isChildWindow ? window.opener : window;
	return context.AjxDispatcher.run("GetDataSourceCollection", account);
};

/**
 * Gets the signature collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmSignatureCollection}	the signature collection
 */
ZmAppCtxt.prototype.getSignatureCollection =
function(account) {
	var context = this.isChildWindow ? window.opener : window;
	return context.AjxDispatcher.run("GetSignatureCollection", account);
};

/**
 * Gets the organizer tree.
 * 
 * @param	{ZmOrganizer.FOLDER|ZmOrganizer.TAG|ZmOrganizer.ZIMLET}	type	the type
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmTree}		the tree
 * @see		#getFolderTree
 * @see		#getTagTree
 * @see		#getZimletTree
 */
ZmAppCtxt.prototype.getTree =
function(type, account) {
	if (this.isChildWindow) {
		return parentAppCtxt.getTree(type, account);
	}

	var al = this.accountList;
	var id = account
		? account.id
		: al.activeAccount ? al.activeAccount.id : ZmAccountList.DEFAULT_ID;

	var acct = al.getAccount(id);
	return acct && acct.trees[ZmOrganizer.TREE_TYPE[type]];
};

/**
 * Sets the organizer tree.
 * 
 * @param	{ZmOrganizer.FOLDER|ZmOrganizer.TAG|ZmOrganizer.ZIMLET}	type	the type
 * @param	{ZmTree}	tree		the tree
 * @param	{ZmZimbraAccount}	account		the account
 * @see		#getTree
 */
ZmAppCtxt.prototype.setTree =
function(type, tree, account) {
	var al = this.accountList;
	var id = account
		? account.id
		: al.activeAccount ? al.activeAccount.id : ZmAccountList.DEFAULT_ID;


	var acct = this.accountList.getAccount(id);
	if (acct) {
		acct.trees[type] = tree;
	}
};

/**
 * Gets the folder organizer tree.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmFolderTree}		the tree
 * @see		#getTree
 */
ZmAppCtxt.prototype.getFolderTree =
function(account) {
    return this.getTree(ZmOrganizer.FOLDER, account);
};

/**
 * Gets the tag organizer tree.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmTagTree}		the tree
 * @see		#getTree
 */
ZmAppCtxt.prototype.getTagTree =
function(account) {
	return this.getTree(ZmOrganizer.TAG, account);
};

/**
 * Gets the zimlet organizer tree.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmFolderTree}		the tree
 * @see		#getTree
 */
ZmAppCtxt.prototype.getZimletTree =
function(account) {
	return this.getTree(ZmOrganizer.ZIMLET, account);
};

/**
 * Gets the username (which is an email address).
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{String}		the username
 */
ZmAppCtxt.prototype.getUsername =
function(account) { 
	return this.get(ZmSetting.USERNAME, account);
};

/**
 * Gets the user domain.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{String}		the user domain
 */
ZmAppCtxt.prototype.getUserDomain =
function(account) {
	if (!this.userDomain) {
		var username = this.getUsername(account);
		if (username) {
			var parts = username.split("@");
			this.userDomain = (parts && parts.length) ? parts[1] : "";
		}
	}
	return this.userDomain;
};

/**
 * Gets the upload frame id.
 * 
 * @return	{String}		the frame id
 */
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

/**
 * Gets the upload manager.
 * 
 * @return	{Object}		the upload manager
 */
ZmAppCtxt.prototype.getUploadManager = 
function() {
	if (!this._uploadManager) {
		// Create upload manager (for sending attachments)
		this._uploadManager = new AjxPost(this.getUploadFrameId());
	}
	return this._uploadManager;
};

/**
 * Gets the current search.
 * 
 * @return	{ZmSearch}		the current search
 */
ZmAppCtxt.prototype.getCurrentSearch =
function() { 
	return this.getCurrentApp().currentSearch;
};

/**
 * Gets the current view id.
 * 
 * @return	{String}		the current view id
 */
ZmAppCtxt.prototype.getCurrentViewId =
function() {
	return this.getAppViewMgr().getCurrentViewId();
};

/**
 * Gets the current view.
 * 
 * @return	{DwtComposite}		the current view
 */
ZmAppCtxt.prototype.getCurrentView =
function() {
	return this.getAppViewMgr().getCurrentView();
};

/**
 * Gets the current controller.
 * 
 * @return	{ZmController}		the current controller
 */
ZmAppCtxt.prototype.getCurrentController =
function() {
	var view = this.getCurrentView();
	return (view && view.getController) ? view.getController() : null;
};

/**
 * Sets the current list.
 * 
 * @param	{ZmList}	list		the current list
 */
ZmAppCtxt.prototype.setCurrentList =
function(list) {
	this._list = list;
};

/**
 * Gets the current list.
 * 
 * @return	{ZmList}		the current list
 */
ZmAppCtxt.prototype.getCurrentList =
function() {
	var ctlr = this.getCurrentController();
	return (ctlr && ctlr.getList) ? ctlr.getList() : this._list ? this._list : null;
};

ZmAppCtxt.prototype.getActionController =
function() {
	if (!this._actionController) {
		this._actionController = new ZmActionController();
	}
	return this._actionController;
};

/**
 * Gets a new window.
 * 
 * @param	{Boolean}	fullView		<code>true</code> to include the full version
 * @param	{int}		width			the width
 * @param	{int}		height			the height
 */
ZmAppCtxt.prototype.getNewWindow = 
function(fullVersion, width, height) {
	// build url
	var url = [];
	var i = 0;
	url[i++] = document.location.protocol;
	url[i++] = "//";
	url[i++] = location.hostname;
	url[i++] = (!location.port || location.port == "80") ? "" : (":" + location.port);
	url[i++] = appContextPath;
	url[i++] = "/public/launchNewWindow.jsp?skin=";
	url[i++] = appCurrentSkin;
	url[i++] = "&localeId=";
	url[i++] = AjxEnv.DEFAULT_LOCALE || "";
	if (fullVersion) {
		url[i++] = "&full=1";
	}
	if (appDevMode) {
		url[i++] = "&dev=1";
	}

	width = width || 705;
	height = height || 465;
	var args = ["height=", height, ",width=", width, ",location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no"].join("");
	if (appDevMode) {
		args = ["height=", height, ",width=", width, ",location=yes,menubar=yes,resizable=yes,scrollbars=no,status=yes,toolbar=yes"].join("");
	}
	var newWin = window.open(url.join(""), "_blank", args);

	// Chrome-specific way to detect popup-blocker (I know, it's ugly as hell isn't it?)
	if (newWin && AjxEnv.isChrome) {
		var oldOnload = newWin.onload;
		newWin.onload = function() {
			if (oldOnload)
				oldOnload();
			setTimeout(function() { // need to halt this for a bit so innerHeight can get in place (otherwise we may display the statusmsg when the window is not actually blocked)
					if (newWin.innerHeight == 0)
						appCtxt.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
				}, 1);
		};
	}

	if (!newWin) {
		this.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
	} else {
		// add this new window to global list so parent can keep track of child windows!
		return this.getAppController().addChildWindow(newWin);
	}
};

/**
 * Caches the given key/value set.
 * 
 * @param	{Object}	key		the key
 * @param	{Object}	value	the value
 * @private
 */
ZmAppCtxt.prototype.cacheSet =
function(key, value) {
	this._itemCache[key] = value;
	delete this._itemCacheDeferred[key];
};

/**
 * Defers caching the given key set.
 * 
 * @param	{Object}	key		the key
 * @param	{String}	appName	the application name
 * @private
 */
ZmAppCtxt.prototype.cacheSetDeferred =
function(key, appName) {
	this._itemCache[key] = this._itemCacheDeferred;
	this._itemCacheDeferred[key] = appName;
};

/**
 * Gets the key from cache.
 * 
 * @param	{Object}	key		the key
 * @return	{Object}	the value
 * @private
 */
ZmAppCtxt.prototype.cacheGet =
function(key) {
	var value = this._itemCache[key];
	if (value === this._itemCacheDeferred) {
		var appName = this._itemCacheDeferred[key];
		this.getApp(appName).createDeferred();
		value = this._itemCache[key];
	}
	return value;
};

/**
 * Removes the key from cache.
 * 
 * @param	{Object}	key		the key
 * @private
 */
ZmAppCtxt.prototype.cacheRemove =
function(key) {
	delete this._itemCache[key];
	delete this._itemCacheDeferred[key];
};

/**
 * Gets the key from cache by id.
 * 
 * @param	{String}	id		the id
 * @return	{Object}	the value
 * @private
 */
ZmAppCtxt.prototype.getById =
function(id) {
	return this.cacheGet(id) || (this.isChildWindow && window.opener.appCtxt.getById(id));
};

/**
 * Gets the keyboard manager
 * 
 * @return	{DwtKeyboardMgr}		the keyboard manager
 */
ZmAppCtxt.prototype.getKeyboardMgr =
function() {
	return this._shell.getKeyboardMgr();
};

/**
 * Gets the history manager.
 * 
 * @return	{AjxHistoryMgr}		the history manager
 */
ZmAppCtxt.prototype.getHistoryMgr =
function() {
	if (!this._historyMgr) {
		this._historyMgr = new AjxHistoryMgr();
	}
	return this._historyMgr;
};

/**
 * Checks if the zimlets are present.
 * 
 * @return	{Boolean}		<code>true</code> if zimlets are present
 */
ZmAppCtxt.prototype.zimletsPresent =
function() {
	return this._zimletsPresent;
};

/**
 * Sets if the zimlets are present.
 * 
 * @param	{Boolean}	zimletsPresent		if <code>true</code>, zimlets are present
 */
ZmAppCtxt.prototype.setZimletsPresent =
function(zimletsPresent) {
	this._zimletsPresent = zimletsPresent;
};

/**
 * Gets the zimlet manager
 * 
 * @return	{ZmZimletMgr}	the zimlet manager
 */
ZmAppCtxt.prototype.getZimletMgr =
function() {
	if (!this._zimletMgr) {
		AjxDispatcher.require("Zimlet");
		if (!this._zimletMgr) // Must re-check here, because if this function is called a second time before the "Zimlet" package is loaded, both calls want to set this._zimletMgr, which must NEVER happen (Issue first located in bug #41338)
			this._zimletMgr = new ZmZimletMgr();
	}
	return this._zimletMgr;
};

/**
 * Checks if zimlets are loaded.
 * 
 * @return	{Boolean}		<code>true</code> if zimlets are loaded
 */
ZmAppCtxt.prototype.areZimletsLoaded =
function() {
	return this._zimletsLoaded;
};

/**
 * Adds a listener to the zimlets loaded event.
 * 
 * @param	{AjxCallback}	listener		the listener
 * @param	{int}		index		the index to where to add the listener
 * @return	{Boolean}	<code>true</code> if the listener is added; <code>false</code> otherwise
 */
ZmAppCtxt.prototype.addZimletsLoadedListener =
function(listener, index) {
	if (!this._zimletsLoaded) {
		return this._evtMgr.addListener(ZmAppCtxt._ZIMLETS_EVENT, listener, index);
	}
};

/**
 * Checks is all zimlets are loaded.
 * 
 * @return	{Boolean}	<code>true</code> if all zimlets are loaded
 */
ZmAppCtxt.prototype.allZimletsLoaded =
function() {
	this._zimletsLoaded = true;
	if (this._zimletMgr && !this.isChildWindow && appCtxt.get(ZmSetting.PORTAL_ENABLED)) {
		var portletMgr = this.getApp(ZmApp.PORTAL).getPortletMgr();
		if (portletMgr) {
			portletMgr.allZimletsLoaded();
		}
	}

	if (this._evtMgr.isListenerRegistered(ZmAppCtxt._ZIMLETS_EVENT)) {
		this._evtMgr.notifyListeners(ZmAppCtxt._ZIMLETS_EVENT, new ZmEvent());
		this._evtMgr.removeAll(ZmAppCtxt._ZIMLETS_EVENT);
	}
};

/**
 * Notifies zimlets if they are present and loaded.
 *
 * @param {String}		event		the zimlet event (called as a zimlet function)
 * @param {Array}		args		a list of args to the function
 * @param {Hash}	options			a hash of options
 * @param {Boolean}	options.noChildWindow		if <code>true</code>, skip notify if we are in a child window
 * @param	{Boolean}	options.waitUntilLoaded	if <code>true</code> and zimlets are not yet loaded, add a listener so that notify happens on load
 * 
 */
ZmAppCtxt.prototype.notifyZimlets =
function(event, args, options) {

	var context = this.isChildWindow ? parentAppCtxt : this;

	if (options && options.noChildWindow && this.isChildWindow) { return; }

	if (!context.areZimletsLoaded()) {
		if (options && options.waitUntilLoaded) {
			context.addZimletsLoadedListener(new AjxListener(this, this.notifyZimlets, [event, args]));
		}
		return;
	}

	this.getZimletMgr().notifyZimlets(event, args);
};

/**
 * Gets the calendar manager.
 * 
 * @return	{ZmCalMgr}	the calendar manager
 */
ZmAppCtxt.prototype.getCalManager =
function() {
	if (!this._calMgr) {
		this._calMgr = new ZmCalMgr(this._shell);
	}
	return this._calMgr;
};

/**
 * Gets the ACL.
 * 
 * @param	{ZmZimbrAccount}	account		the account
 * @param	{AjxCallback}	callback	the callback
 * @return	{ZmAccessControlList}	the ACL
 */
ZmAppCtxt.prototype.getACL =
function(account, callback) {
	var al = this.accountList;
	var id = account
		? account.id
		: al.activeAccount ? al.activeAccount.id : ZmAccountList.DEFAULT_ID;

	var acct = al.getAccount(id);
	return acct && acct.acl;
};

/**
 * Gets the shortcut hint.
 *
 * @param {String}		keyMap		the key map
 * @param {String}		shortcut	the shortcut action
 * @return	{String}	the hint
 */
ZmAppCtxt.prototype.getShortcutHint =
function(keyMap, shortcut) {
	
	var text = null;
	keyMap = keyMap || "global";
	while (!text && keyMap) {
		var scKey = [keyMap, shortcut, "display"].join(".");
		var text = AjxKeys[scKey] || ZmKeys[scKey];
		if (text) {
			var list = text.split(/;\s*/);
			var sc = list[0];	// use first shortcut in list
			if (!sc) { return null; }
			sc = sc.replace(/\b[A-Z]\b/g, function(let) { return let.toLowerCase(); });
			text = [" [", sc.replace(",", ""), "]"].join("");
		} else {
			var key = [keyMap, "INHERIT"].join(".");
			keyMap = AjxKeys[key] || ZmKeys[key];
		}
	}

	return text;
};

/**
 * Gets the shortcuts panel.
 * 
 * @return	{ZmShortcutsPanel}	the shortcuts panel
 */
ZmAppCtxt.prototype.getShortcutsPanel =
function() {
	if (!this._shortcutsPanel) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		var style = this.isChildWindow ? ZmShortcutList.WINDOW_STYLE : ZmShortcutList.PANEL_STYLE;
		this._shortcutsPanel = new ZmShortcutsPanel(style);
	}
	return this._shortcutsPanel;
};

/**
 * Gets the skin hint for the given argument(s), which will be used to look
 * successively down the properties chain.
 * 
 * <p>
 * For example, <code>getSkinHint("a", "b")</code> will return the value of <code>skin.hints.a.b</code>.
 * </p>
 * 
 * @return	{String}	the skin hint
 */
ZmAppCtxt.prototype.getSkinHint =
function() {
	if (arguments.length == 0) return "";
	
	var cur = skin && skin.hints;
	if (!cur) { return ""; }
	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if (!cur[arg]) { return ""; }
		cur = cur[arg];
	}
	return cur;
};

/**
 * Gets the auto completer.
 * 
 * @return	{ZmAutocomplete}	the auto completer
 */
ZmAppCtxt.prototype.getAutocompleter =
function() {
	if (!this._autocompleter) {
		this._autocompleter = new ZmAutocomplete();
	}
	return this._autocompleter;
};

/**
 * Checks if my address belongs to the current user (include aliases).
 * 
 * @param {String}		addr			the address
 * @param {Boolean}		allowLocal		if <code>true</code>, domain is not required
 * @return	{Boolean}		<code>true</code> if the given address belongs to the current user; <code>false</code> otherwise
 */
ZmAppCtxt.prototype.isMyAddress =
function(addr, allowLocal) {

	if (allowLocal && (addr.indexOf('@') == -1)) {
		addr = [addr, this.getUserDomain()].join("@");
	}
	
	if (addr == this.get(ZmSetting.USERNAME)) {
		return true;
	}

	var allAddresses = appCtxt.get(ZmSetting.MAIL_ALIASES).concat(appCtxt.get(ZmSetting.ALLOW_FROM_ADDRESSES));
	if (allAddresses && allAddresses.length) {
		for (var i = 0; i < allAddresses.length; i++) {
			if (addr == allAddresses[i])
				return true;
		}
	}

	return false;
};

/**
 * Gets the overview ID, prepending account name if multi-account.
 *
 * @param {Array}		parts		an array of {String} id components
 * @param {ZmAccount}	account		the account
 * @return	{String}	the id
 */
ZmAppCtxt.prototype.getOverviewId =
function(parts, account) {

	var id = (parts instanceof Array) ? parts.join("_") : parts;

	if (appCtxt.multiAccounts && (account !== null)) {
		account = account || appCtxt.getActiveAccount();
		id = [account.name, id].join(":");
	}

	return id;
};

/**
 * Gets the autocomplete cache for the given parameters, optionally creating one.
 *
 * @param	{String}	acType		the item type
 * @param	{String}	str			the autocomplete string
 * @param	{ZmAccount}	account		the account
 * @param	{Boolean}	create		if <code>true</code>, create a cache if none found
 */
ZmAppCtxt.prototype.getAutocompleteCache =
function(acType, str, account, create) {

	var cache = null;
	var acct = account || this.getActiveAccount();
	if (acct) {
		if (this._acCache[acct.id] && this._acCache[acct.id][acType]) {
			cache = this._acCache[acct.id][acType][str];
		}
	}
	if (!cache && create) {
		if (acct && !this._acCache[acct.id]) {
			this._acCache[acct.id] = {};
		}
		if (!this._acCache[acct.id][acType]) {
			this._acCache[acct.id][acType] = {};
		}
		cache = this._acCache[acct.id][acType][str] = {};
	}

	return cache;
};

/**
 * Clears the autocomplete cache.
 *
 * @param	{String}	type		item type
 * @param	{ZmAccount}	account		the account
 */
ZmAppCtxt.prototype.clearAutocompleteCache =
function(type, account) {

	var acct = account || appCtxt.getActiveAccount();
	if (this._acCache[acct.id]) {
		if (type) {
			this._acCache[acct.id][type] = {};
		} else {
			this._acCache[acct.id][ZmAutocomplete.AC_TYPE_CONTACT]		=	{};
			this._acCache[acct.id][ZmAutocomplete.AC_TYPE_LOCATION]		=	{};
			this._acCache[acct.id][ZmAutocomplete.AC_TYPE_EQUIPMENT]	=	{};
		}
	}
};
