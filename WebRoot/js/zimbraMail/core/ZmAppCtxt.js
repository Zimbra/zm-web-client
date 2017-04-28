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
    this.sendAsEmails = [];
    this.sendOboEmails = [];

	this._evtMgr = new AjxEventMgr();

	this._itemCache			= {};
	this._itemCacheDeferred	= {};
	this._acCache			= {};	// autocomplete
	this._isExpandableDL	= {};	// distribution lists

	this._checkAuthTokenWarning();
};

ZmAppCtxt.ONE_MINUTE  = 60 * 1000;
ZmAppCtxt.MAX_TIMEOUT_VALUE = 2147483647;

ZmAppCtxt._ZIMLETS_EVENT = 'ZIMLETS';
ZmAppCtxt._AUTHTOKEN_EVENT = 'AUTHTOKEN';

//Regex constants
//Bug fix # 79986, #81095. Invalid file names are < > , ? | / \ * :
ZmAppCtxt.INVALID_NAME_CHARS = "[\\|?<>:*\"\\\\\/]";
ZmAppCtxt.INVALID_NAME_CHARS_RE = new RegExp(ZmAppCtxt.INVALID_NAME_CHARS);

/**
 * Returns a string representation of the application context.
 * 
 * @return		{String}		a string representation of the application context
 */
ZmAppCtxt.prototype.toString =
function() {
	return "ZmAppCtxt";
};

ZmAppCtxt.prototype._checkAuthTokenWarning =
function() {
	this._authIntervalId = window.setInterval(this._authTokenWarningTimeout.bind(this), ZmAppCtxt.ONE_MINUTE);
};
ZmAppCtxt.prototype._setAuthTokenWarning =
function(delay) {
    window.setTimeout(this._authTokenWarningTimeout.bind(this), delay);
};

/**
 * Adds a listener to the auth token warning event. This listener is fired once
 * per minute when less than five minutes remain before token expiry.
 *
 * @param	{AjxCallback}	listener		the listener
 * @param	{int}		index		the index to where to add the listener
 * @return	{Boolean}	<code>true</code> if the listener is added; <code>false</code> otherwise
 */
ZmAppCtxt.prototype.addAuthTokenWarningListener =
function(listener, index) {
	return this._evtMgr.addListener(ZmAppCtxt._AUTHTOKEN_EVENT, listener, index);
};

/**
 * Removes a listener for the auth token warning event.
 *
 * @param	{AjxCallback}	listener		the listener
 * @return	{Boolean}	<code>true</code> if the listener is removed; <code>false</code> otherwise
 */
ZmAppCtxt.prototype.removeAuthTokenWarningListener =
function(listener) {
	return this._evtMgr.removeListener(ZmAppCtxt._AUTHTOKEN_EVENT, listener);
};

ZmAppCtxt.prototype._authTokenWarningTimeout =
function () {

	if (!window.authTokenExpires) {
		return; //for cases we the auth token expires is not available. (e.g. some new windows we didn't set it for yet, or for saved rest URLs
	}

	var now = new Date().getTime();
	var millisToLive = window.authTokenExpires - now;
    var minutesToLive = Math.round(millisToLive / ZmAppCtxt.ONE_MINUTE);
    var delay;

	if (minutesToLive > 5 || millisToLive <= 0) {
        // Outside the times to issue warnings
        if (minutesToLive === 6) {
            // Line up the timer to go off at exactly 5 minutes (or as exact as we can make it), which is
            // when we start issuing warnings
            window.clearInterval(this._authIntervalId);
            delay = millisToLive - (5 * ZmAppCtxt.ONE_MINUTE);
            this._setAuthTokenWarning(delay);
        }
		return;
	}

	if (this._evtMgr.isListenerRegistered(ZmAppCtxt._AUTHTOKEN_EVENT)) {
		var event = new ZmEvent(ZmAppCtxt._AUTHTOKEN_EVENT);
		this._evtMgr.notifyListeners(ZmAppCtxt._AUTHTOKEN_EVENT, event);
	}

	var msg;
    var decaSecondsToLive = 0;
    var toastDuration;
    if (minutesToLive > 1) {
        msg = AjxMessageFormat.format(ZmMsg.authTokenExpirationWarning, [minutesToLive, ZmMsg.minutes]);
        toastDuration = ZmAppCtxt.ONE_MINUTE / 4;
    } else {
        // Get the number of 10-second intervals remaining - used once we are within 1 minute
        decaSecondsToLive =  Math.round(millisToLive / 10000);
        toastDuration = 8000;
        if (decaSecondsToLive >= 6) {
            // 1 minute+ to go.  But should be pretty close to 1 minute
            msg = AjxMessageFormat.format(ZmMsg.authTokenExpirationWarning, [1, ZmMsg.minute]);
        } else {
            // Seconds remain
            msg = AjxMessageFormat.format(ZmMsg.authTokenExpirationWarning, [decaSecondsToLive * 10, ZmMsg.seconds]);
        }
    }

	var params = {
		msg:    msg,
		level:  ZmStatusView.LEVEL_WARNING,
		transitions: [{type: "fade-in", duration: 500}, {type: "pause", duration: toastDuration}, {type: "fade-out", duration: 500} ]
	};
	this.setStatusMsg(params);

    if (minutesToLive > 1) {
        var floorMinutesToLive = Math.floor(millisToLive / ZmAppCtxt.ONE_MINUTE);
        if (floorMinutesToLive === minutesToLive) {
            floorMinutesToLive--;
        }
        delay = millisToLive - (floorMinutesToLive * ZmAppCtxt.ONE_MINUTE);
    }  else {
        decaSecondsToLive--;
        delay = millisToLive - (decaSecondsToLive * 10000);
    }
    if (delay > 0) {
        this._setAuthTokenWarning(delay);
    }
};

ZmAppCtxt.prototype.setZimbraMail = function(zimbraMail) {
	this._zimbraMail = zimbraMail;
}

ZmAppCtxt.prototype.getZimbraMail = function() {
	return this._zimbraMail;
}

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
 * @param   {boolean}   params.force    force any displayed toasts out of the way (dismiss them and run their dismissCallback). Enqueued messages that are not yet displayed will not be displayed
 * @param   {AjxCallback} params.dismissCallback    callback to run when the toast is dismissed (by another message using [force], or explicitly calling ZmStatusView.prototype.dismiss())
 * @param   {AjxCallback} params.finishCallback     callback to run when the toast finishes its transitions by itself (not when dismissed)
 * </ul>
 * 
 */
ZmAppCtxt.prototype.setStatusMsg =
function(params) {
	params = Dwt.getParams(arguments, ZmStatusView.MSG_PARAMS);
	this._appController.setStatusMsg(params);
};

/**
 * Dismisses the displayed status message, if any
 */

ZmAppCtxt.prototype.dismissStatusMsg =
function(all) {
	this._appController.dismissStatusMsg(all);
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

	var acct = account || al.activeAccount || al.mainAccount
			|| al.getAccount(ZmAccountList.DEFAULT_ID); //Probably doesn't ever happen, and if it does, returns null. Might be some historical artifact - did we ever have account with id "main"? I'm still afraid to remove it without being sure it won't cause regression.

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
ZmAppCtxt.prototype.get = function(id, key, account) {

    //use parentAppCtxt in case of new window
    var context = this.isChildWindow ? parentAppCtxt : this;

	// for offline, global settings always come from the "local" parent account
	var acct = (context.multiAccounts && ZmSetting.IS_GLOBAL[id])
		? context.accountList.mainAccount : account;
	return context.getSettings(acct).get(id, key);
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
 * @param {Boolean}	skipImplicit		if <code>true</code>, do not check for change to implicit pref
 */
ZmAppCtxt.prototype.set =
function(id, value, key, setDefault, skipNotify, account, skipImplicit) {
	// for offline, global settings always come from "parent" account
	var acct = (this.multiAccounts && ZmSetting.IS_GLOBAL[id])
		? this.accountList.mainAccount : account;
	var setting = this.getSettings(acct).getSetting(id);

	if (setting) {
		setting.setValue(value, key, setDefault, skipNotify, skipImplicit);
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
 *
 */
ZmAppCtxt.prototype.getLoggedInUsername =
function() {
	return appCtxt.get(ZmSetting.USERNAME);
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
 * Gets the overview controller. Creates a new one if not already set, unless dontCreate is true. 
 *
 * @param {boolean} dontCreate (optional) - don't create overviewController if not created already. (see ZmApp for usage with dontCreate == true)
 * 
 * @return	{ZmOverviewController}	the overview controller
 */
ZmAppCtxt.prototype.getOverviewController =
function(dontCreate) {
	if (!this._overviewController) {
		if (dontCreate) {
			return null;
		}
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
 * Gets the message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getMsgDialog =
function() {
	if (!this._msgDialog) {
		this._msgDialog = new DwtMessageDialog({parent:this._shell, id: "ZmMsgDialog"});
	}
	return this._msgDialog;
};

/**
 * Gets the message dialog with a help button.
 *
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getHelpMsgDialog =
	function() {
		if (!this._helpMsgDialog) {
			this._helpMsgDialog = new DwtMessageDialog({parent:this._shell, helpText:ZmMsg.help, id: "ZmHelpMsgDialog"});
		}
		return this._helpMsgDialog;
	};

/**
 * Gets the yes/no message dialog.
 * 
 * @return	{DwtMessageDialog}	the message dialog
 */
ZmAppCtxt.prototype.getYesNoMsgDialog =
function(id) {
	if (!this._yesNoMsgDialog) {
		this._yesNoMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], id: "YesNoMsgDialog"});
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
		this._yesNoCancelMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON], id:"YesNoCancel"});
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
		this._okCancelMsgDialog = new DwtMessageDialog({parent:this._shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON], id:"OkCancel"});
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
 * Gets the new contact group dialog.
 *
 * @return	{ZmNewContactGroupDialog}	the new contact group dialog
 */
ZmAppCtxt.prototype.getNewContactGroupDialog =
function() {
	if (!this._newContactGroupDialog) {
		this._newContactGroupDialog = new ZmNewContactGroupDialog(this._shell);
	}
	return this._newContactGroupDialog;
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
 * Gets the password update dialog.
 *
 * @return	{ZmPasswordUpdateDialog}		the rename tag dialog
 */
ZmAppCtxt.prototype.getPasswordChangeDialog =
function() {
	if (!this._passwordUpdateDialog) {
		AjxDispatcher.require("Extras");
		this._passwordUpdateDialog = new ZmPasswordUpdateDialog(this._shell);
	}
	return this._passwordUpdateDialog;
};

/**
 * Gets the new folder dialog.
 * 
 * @return	{ZmNewFolderDialog}		the new folder dialog
 */
ZmAppCtxt.prototype.getNewFolderDialog =
function() {
	if (!this._newFolderDialog) {
        var title = ZmMsg.createNewFolder;
        var type = ZmOrganizer.FOLDER;
        this._newFolderDialog = new ZmNewOrganizerDialog(this._shell, null, title, type)
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
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		this._newCalendarDialog = new ZmNewCalendarDialog(this._shell);
	}
	return this._newCalendarDialog;
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
 * Gets the new suggestion Preferences dialog
 *
 * @return	{ZmTimeSuggestionPrefDialog}
 */
ZmAppCtxt.prototype.getSuggestionPreferenceDialog =
function() {
	if (!this._suggestionPrefDialog) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
        this._suggestionPrefDialog = new ZmTimeSuggestionPrefDialog(this._shell);
    }
    return this._suggestionPrefDialog;
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
	this._newSearchDialogs = this._newSearchDialogs || {};
	this.searchAppName = this.searchAppName || ZmApp.MAIL;
	if (!this._newSearchDialogs[this.searchAppName]) {
		this._newSearchDialogs[this.searchAppName] = new ZmNewSearchDialog(this._shell);
	}
	this._newSearchDialog = this._newSearchDialogs[this.searchAppName];
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
function(appName) {
	var app = appName ? this.getApp(appName) : this.getCurrentApp();
	// this.getCurrentAppName() returns "Search" for search apps. Let's re-use dialogs from regular apps.
	appName = app.isZmSearchApp ? this.searchAppName : app.getName();
	this._chooseFolderDialogs = this._chooseFolderDialogs || {};
	if (!this._chooseFolderDialogs[appName]) {
		AjxDispatcher.require("Extras");
		this._chooseFolderDialogs[appName] = new ZmChooseFolderDialog(this._shell);
	}
	this._chooseFolderDialog = this._chooseFolderDialogs[appName];
	return this._chooseFolderDialog;
};

ZmAppCtxt.prototype.getChooseAccountDialog =
function() {
	if (!this._chooseAccountDialog) {
		AjxDispatcher.require("Extras");
		this._chooseAccountDialog = new ZmChooseAccountDialog(this._shell);
	}
	return this._chooseAccountDialog;
};

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

ZmAppCtxt.prototype.getShareSearchDialog = function() {
	if (!this._shareSearchDialog) {
		AjxDispatcher.require("Share");
		this._shareSearchDialog = new ZmShareSearchDialog({parent:this._shell});
	}
	return this._shareSearchDialog;
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
 * Gets the priority message filter dialog.
 * 
 * @return {ZmPriorityMessageFilterDialog}  the priority message filter dialog
 */
ZmAppCtxt.prototype.getPriorityMessageFilterDialog = 
function() {
	if (!this._priorityMessageFilterDialog) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._priorityMessageFilterDialog = new ZmPriorityMessageFilterDialog();
	}
	return this._priorityMessageFilterDialog;
};


/**
 * Gets the activity stream prompt dialog for running activity stream filters
 * 
 * @return {ZmActivityStreamPromptDialog}
*/
ZmAppCtxt.prototype.getActivityStreamFilterDialog = 
function() {
	if (!this._activityStreamFilterDialog) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._activityStreamFilterDialog = new ZmActivityStreamPromptDialog();
	}
	return this._activityStreamFilterDialog;
};

/**
 * Gets the prompt for moving files from the Activity Stream to the Inbox
 * 
 * @return {ZmActivityToInboxPromptDialog}
 */
ZmAppCtxt.prototype.getActivityToInboxFilterDialog =
function() {
	if (!this._activityToInboxFilterDialog) {
		AjxDispatcher.require(["PreferencesCore", "Preferences"]);
		this._activityToInboxFilterDialog = new ZmActivityToInboxPromptDialog();
	}
	return this._activityToInboxFilterDialog;
};

/**
 * Gets the quickadd dialog for creating a contact
 * 
 * @return {ZmContactQuickAddDialog}
 */
ZmAppCtxt.prototype.getContactQuickAddDialog = 
function() {
	if (!this._contactQuickAddDialog) {
		AjxDispatcher.require(["ContactsCore", "Contacts"]);
		this._contactQuickAddDialog = new ZmContactQuickAddDialog();
	}
	return this._contactQuickAddDialog;
};

/**
 * Gets the confirm dialog.
 * 
 * @return	{DwtConfirmDialog}		the confirmation dialog
 */
ZmAppCtxt.prototype.getConfirmationDialog =
function(id) {
	if (!this._confirmDialog) {
		this._confirmDialog = new DwtConfirmDialog(this._shell, null, "CONFIRM_DIALOG");
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

ZmAppCtxt.prototype.getDumpsterDialog =
function() {
	if (!this._dumpsterDialog) {
		AjxDispatcher.require("Extras");
		this._dumpsterDialog = new ZmDumpsterDialog(this._shell);
	}
	return this._dumpsterDialog;
};


/**
 * Gets the mail redirect dialog.
 *
 * @return	{ZmMailRedirectDialog}	the new mail redirect dialog
 */
ZmAppCtxt.prototype.getMailRedirectDialog =
function() {
	if (!this._mailRedirectDialog) {
		this._mailRedirectDialog = new ZmMailRedirectDialog(this._shell);
	}
	return this._mailRedirectDialog;
};

/**
 * Gets the mail retention warning dialog.
 *
 * @return	{ZmRetetionWarningDialog}	the new mail retention warning dialog
 */
ZmAppCtxt.prototype.getRetentionWarningDialog =
function() {
	if (!this._retentionWarningDialog) {
		this._retentionWarningDialog = new ZmRetentionWarningDialog(this._shell);
	}
	return this._retentionWarningDialog;
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
		AjxDispatcher.require(["Extras"]);
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
 * Gets the active account.
 *
 * @return	{ZmZimbraAccount}	the active account
 */
ZmAppCtxt.prototype.isExternalAccount =
function() {
	return this.get(ZmSetting.IS_EXTERNAL);
};

/*
 * This is a list of Aspell (Ver. 0.61) support locale from the result of the following command:
 *   /opt/zimbra/aspell/bin/aspell dump dicts
 *      (use only the items whose format is "<Primary-tag> *( "_" <Subtag> )")
 * When Aspell is upgraded and more locales are added, please update this list too.
 */
ZmAppCtxt.AVAILABLE_DICTIONARY_LOCALES = ["ar", "da", "de", "de_AT", "de_CH", "de_DE", "en", "en_CA", "en_GB", "en_US", "es", "fr", "fr_CH", "fr_FR", "hi", "hu", "it", "nl", "pl", "pt_BR", "ru", "sv"];

/**
 * Gets the availability of the spell check feature based on the current locale and user's configuration
 *
 * @return     {Boolean}       <code>true</code> if the spell checker is available.
 */
ZmAppCtxt.prototype.isSpellCheckerAvailable = function () {

	if (!appCtxt.get(ZmSetting.SPELL_CHECK_ENABLED)) {
		return false;
	}

	if (typeof this._spellCheckAvailable !== 'undefined') {
		return this._spellCheckAvailable;
	}

	this._spellCheckAvailable = false;
	var myLocale = appCtxt.get(ZmSetting.LOCALE_NAME);
	var myDefaultDictionaryName = appCtxt.get(ZmSetting.SPELL_DICTIONARY);

	var myLanguage = myLocale.split('_')[0];

	var dictLocales = ZmAppCtxt.AVAILABLE_DICTIONARY_LOCALES;
	var ln = dictLocales.length;

	for (var i = 0; i < ln; i++) {
		var dictLocale = dictLocales[i];
		if (dictLocale === myLocale ||
		    dictLocale === myLanguage ||
		    dictLocale === myDefaultDictionaryName) {
			this._spellCheckAvailable = true;
			break;
		}
	}

	return this._spellCheckAvailable;
}

/**
 * Gets the identity collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmIdentityCollection}	the identity collection
 */
ZmAppCtxt.prototype.getIdentityCollection = function(account) {

    var context = this.isChildWindow ? window && window.opener : window;
	return context && context.AjxDispatcher.run("GetIdentityCollection", account);
};

/**
 * Gets the data source collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmModel}	the data source collection
 */
ZmAppCtxt.prototype.getDataSourceCollection = function(account) {

	var context = this.isChildWindow ? window && window.opener : window;
	return context && context.AjxDispatcher.run("GetDataSourceCollection", account);
};

/**
 * Gets the signature collection.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @return	{ZmSignatureCollection}	the signature collection
 */
ZmAppCtxt.prototype.getSignatureCollection = function(account) {

    var context = this.isChildWindow ? window && window.opener : window;
	return context && context.AjxDispatcher.run("GetSignatureCollection", account);
};


ZmAppCtxt.prototype.killMarkReadTimer =
function() {
	if (this.markReadActionId > 0) {
		AjxTimedAction.cancelAction(this.markReadActionId);
		this.markReadActionId = -1;
	}
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
 * Gets the tag organizer tree's root.
 *
 * @param	{ZmItem}	item		item to look up the account of for and get the account tag list.
 * @return	{ZmTag}		the root of the tree, which is also a list.
 */
ZmAppCtxt.prototype.getAccountTagList =
function(item) {
	var account = (item && appCtxt.multiAccounts) ? item.getAccount() : null;

	return this.getTagTree(account).root;
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

ZmAppCtxt.prototype.reloadAppCache =
function(force, retryOnError) {
	AjxDebug.println(AjxDebug.OFFLINE, "reloadAppCache :: " + AjxDebug._getTimeStamp());
    if (this.isWebClientOfflineSupported || force) {
		var localOfflineBrowserKey = localStorage.getItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
		//If application cache status is downloading browser is already downloading the resources mentioned in the manifest file. Resetting the cookie value will result in application cache error event "Manifest changed during update".
		if (localOfflineBrowserKey && AjxEnv.supported.applicationcache && applicationCache.status !== applicationCache.DOWNLOADING) {
			var cookieValue = localOfflineBrowserKey + "_" + new Date().getTime();
			AjxCookie.setCookie(document, "ZM_OFFLINE_KEY", cookieValue, false, "/");
		}
		var manifestURL = appContextPath + "/appcache/images,common,dwt,msgview,login,zm,spellcheck,skin.appcache?";
        var urlParams = [];
        urlParams.push("v=" + window.cacheKillerVersion);
        urlParams.push("debug=" + window.appDevMode);
        urlParams.push("compress=" + !(window.appDevMode === true));
        urlParams.push("templates=only");
        manifestURL = encodeURIComponent(manifestURL + urlParams.join('&'));
        var offlineIframe = document.getElementById("offlineIframe");
        if (!offlineIframe) {
            offlineIframe = document.createElement("iframe");
            offlineIframe.id = "offlineIframe";
            offlineIframe.style.display = "none";
            document.body.appendChild(offlineIframe);
        }
        if (offlineIframe) {
			retryOnError = AjxUtil.isBoolean(retryOnError) ? retryOnError : true;
			offlineIframe.src = "public/Offline.jsp?url=" + manifestURL + "&isFirefox=" + AjxEnv.isFirefox + "&retryOnError=" + retryOnError;
        }
    }
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

ZmAppCtxt.prototype.getZmUploadManager =
    function() {
        if (!this._zmUploadManager) {
            // Create upload manager (for sending attachments)
            AjxDispatcher.require("Extras");
            this._zmUploadManager = new ZmUploadManager();
        }
        return this._zmUploadManager;
    };

/**
 * Gets the current search.
 * 
 * @return	{ZmSearch}		the current search
 */
ZmAppCtxt.prototype.getCurrentSearch =
function() {
	var app = this.getCurrentApp();
	if (app && app.currentSearch) {
		return app.currentSearch;
	}
	var ctlr = this.getCurrentController();
	return ctlr && ctlr._currentSearch;
};

/**
 * Gets the current view id. If we're showing search results, returns the ID of the
 * view within the search results (rather than the ID of the search results).
 * 
 * @return	{String}		the current view id
 */
ZmAppCtxt.prototype.getCurrentViewId =
function() {
	var viewId = this.getAppViewMgr().getCurrentViewId();
	if (viewId && viewId.indexOf(ZmId.VIEW_SEARCH_RESULTS) === 0) {
		viewId = this.getCurrentController().getCurrentViewId();
	}
	return viewId;
};

/**
 * Gets the current view type. If we're showing search results, returns the type of the
 * view within the search results (rather than the type of the search results).
 * 
 * @return	{String}		the current view type
 */
ZmAppCtxt.prototype.getCurrentViewType =
function() {
	var viewType = this.getAppViewMgr().getCurrentViewType();
	if (viewType && viewType.indexOf(ZmId.VIEW_SEARCH_RESULTS) === 0) {
		viewType = this.getCurrentController().getCurrentViewType();
	}
	return viewType;
};

/**
 * Extracts the view type from a view ID.
 * 
 * @param	{string}	viewId		a view ID
 * @return	{String}	the view type
 */
ZmAppCtxt.prototype.getViewTypeFromId =
function(viewId) {
	var array = viewId && viewId.split(ZmController.SESSION_ID_SEP);
	return array ? array[0] : "";
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
	if (!this._actionController && !this.isChildWindow) {
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
 * @param   {String}    name            window name
 */
ZmAppCtxt.prototype.getNewWindow = 
function(fullVersion, width, height, name) {
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
	if (window.appDevMode) {
		url[i++] = "&dev=1";
	}
    if (window.appCoverageMode) {
        url[i++] = "&coverage=1";
    }
	this.__childWindowId = (this.__childWindowId+1) || 0;
	url[i++] = "&childId=" + this.__childWindowId;

    name = name || "_blank";
	width = width || 705;
	height = height || 465;
	var args = ["height=", height, ",width=", width, ",location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no"].join("");
	if (window.appDevMode) {
		args = ["height=", height, ",width=", width, ",location=yes,menubar=yes,resizable=yes,scrollbars=no,status=yes,toolbar=yes"].join("");
	}
	var newWin = window.open(url.join(""), name, args);
	this.handlePopupBlocker(newWin);
	if(newWin) {
		// add this new window to global list so parent can keep track of child windows!
		return this.getAppController().addChildWindow(newWin, this.__childWindowId);
	}
};

/**
 * Handle Popup bloker for a given window
 * @param {Object}	win  A Window object
 */
ZmAppCtxt.prototype.handlePopupBlocker =
function(win) {
	if (!win) {
		this.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
	} else if (win && AjxEnv.isChrome) {
		setTimeout(function() { 
					if (win.innerHeight == 0)
						appCtxt.setStatusMsg(ZmMsg.popupBlocker, ZmStatusView.LEVEL_CRITICAL);
				}, 200);
		};
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
ZmAppCtxt.prototype.getById = function(id) {

    // Try parent cache if we're a child window and we don't have it
	return this.cacheGet(id) || (this.isChildWindow && window && window.opener && window.opener.appCtxt && window.opener.appCtxt.getById(id));
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
 * @return	{Boolean} Returns <code>true</code> if at least one Zimlet handles the notification
 */
ZmAppCtxt.prototype.notifyZimlets =
function(event, args, options) {
	this.notifySkin(event, args, options); // Also notify skin

	var context = this.isChildWindow ? parentAppCtxt : this;

	if (options && options.noChildWindow && this.isChildWindow) { return false; }

	if (!context.areZimletsLoaded()) {
		if (options && options.waitUntilLoaded) {
			context.addZimletsLoadedListener(new AjxListener(this, this.notifyZimlets, [event, args]));
		}
		return false;
	}

	return this.getZimletMgr().notifyZimlets(event, args);
};

ZmAppCtxt.prototype.notifyZimlet =
function(zimletName, event, args, options) {
	if (options && options.noChildWindow && this.isChildWindow) { return false; }
	return this.getZimletMgr().notifyZimlet(zimletName, event, args);
};

ZmAppCtxt.prototype.notifySkin =
function(event, args, options) {
	var context = this.isChildWindow ? parentAppCtxt : this;
	if (options && options.noChildWindow && this.isChildWindow) { return; }
	try {
		return window.skin && AjxUtil.isFunction(window.skin.handleNotification) && window.skin.handleNotification(event, args);
	} catch (e) {}
};


/**
 * Gets the calendar manager.
 * 
 * @return	{ZmCalMgr}	the calendar manager
 */
ZmAppCtxt.prototype.getCalManager =
function() {
	if (!this._calMgr) {
        AjxDispatcher.require("Startup2");
		this._calMgr = new ZmCalMgr(this._shell);
	}
	return this._calMgr;
};

ZmAppCtxt.prototype.updateOfflineAppt = function(msgId, field, value, nullData, callback) {
	var calMgr = appCtxt.getCalManager();
	if (calMgr) {
		var calViewController = calMgr && calMgr.getCalViewController();
		if (calViewController) {
			var apptCache = calViewController.getApptCache();
			if (apptCache) {
				apptCache.updateOfflineAppt(msgId, field, value, nullData, callback);
			}
		}
	}
}

/**
 * Gets the task manager.
 *
 * @return	{ZmTaskMgr}	the task manager
 */
ZmAppCtxt.prototype.getTaskManager =
function() {
	if (!this._taskMgr) {
		this._taskMgr = new ZmTaskMgr(this._shell);
	}
	return this._taskMgr;
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
			sc = sc.replace(/\b[A-Z]\b/g, function(let) { return window.skin && AjxUtil.isFunction(window.skin.shortcutFormatter) && window.skin.shortcutFormatter(let) });
			text = [sc.replace(",", "")].join("");
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
 * Opens a new change password window
 *
 */
ZmAppCtxt.prototype.getChangePasswordWindow =
function(ev) {
    var url = appCtxt.get(ZmSetting.CHANGE_PASSWORD_URL);

    	if (!url) {
    		var isHttp	= appCtxt.get(ZmSetting.PROTOCOL_MODE) == ZmSetting.PROTO_HTTP;
    		var proto	= isHttp ? ZmSetting.PROTO_HTTP : ZmSetting.PROTO_HTTPS;
    		var port	= appCtxt.get(isHttp ? ZmSetting.HTTP_PORT : ZmSetting.HTTPS_PORT);
    		var path	= appContextPath+"/h/changepass";

    		var publicUrl = appCtxt.get(ZmSetting.PUBLIC_URL);
    		if (publicUrl) {
    			var parts = AjxStringUtil.parseURL(publicUrl);
    			path = parts.path + "/h/changepass";
    			var switchMode = (parts.protocol == "http" && proto == ZmSetting.PROTO_HTTPS);
    			proto = switchMode ? proto : parts.protocol;
    			port = switchMode ? port : parts.port;
    		}
			var qsArgs = {skin: appCurrentSkin};
    		url = AjxUtil.formatUrl({protocol: proto, port: port, path: path, qsReset: true, qsArgs: qsArgs});
    	}

    	var args  = "height=465,width=705,location=no,menubar=no,resizable=yes,scrollbars=no,status=yes,toolbar=no";
    	window.open(url,'ChangePasswordWindow', args);
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
	
	var cur = window.skin && window.skin.hints;
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
		this._autocompleter = new ZmAutocomplete(null);
	}
	return this._autocompleter;
};

/**
 * Checks if my address belongs to the current user (include aliases).
 * 
 * @param {String}		addr			            the address
 * @param {Boolean}		allowLocal		            if <code>true</code>, domain is not required
 * @param {Boolean}		excludeAllowFromAddress		if <code>true</code>, addresses in zimbraAllowFromAddresses are ignored
 * @return	{Boolean}		<code>true</code> if the given address belongs to the current user; <code>false</code> otherwise
 */
ZmAppCtxt.prototype.isMyAddress =
function(addr, allowLocal, excludeAllowFromAddress) {

	if (allowLocal && (addr.indexOf('@') == -1)) {
		addr = [addr, this.getUserDomain()].join("@");
	}
	
	if (addr == this.get(ZmSetting.USERNAME)) {
		return true;
	}

	var allAddresses;
    if(excludeAllowFromAddress){
        allAddresses= appCtxt.get(ZmSetting.MAIL_ALIASES);
    }
    else
    {
        allAddresses= appCtxt.get(ZmSetting.MAIL_ALIASES).concat(appCtxt.get(ZmSetting.ALLOW_FROM_ADDRESSES));
    }

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

ZmAppCtxt.prototype.getOutsideMouseEventMgr =
function() {
	return DwtOutsideMouseEventMgr.INSTANCE;
};


/**
* @return Returns language specific charset. Currently supports only Japanese. 
* Returns "Windows-31J" for Japanese or returns "UTF-8" for everything else
*/
ZmAppCtxt.prototype.getCharset =
function() {
	var lang = AjxEnv.isIE ? window.navigator.systemLanguage : window.navigator.language;
	//Currently only differs for Japanese, but can extend for different languages as/if we need it.
	if((AjxEnv.DEFAULT_LOCALE == "ja" || lang == "ja") && AjxEnv.isWindows) {
		return "Windows-31J";
	} else {
		return "UTF-8";
	}
};

/**
 * Returns true if an address is an expandable DL.
 *  
 * @param {string}	addr	email address
 */
ZmAppCtxt.prototype.isExpandableDL =
function(addr) {
	return addr && this._isExpandableDL[addr] && this.get("EXPAND_DL_ENABLED");
};

/**
 * Cache whether an address is an expandable DL.
 * 
 * @param {string}	addr			email address
 * @param {boolean}	isExpandableDL	if true, address is expandable DL
 * 
 * TODO: consider caching AjxEmailAddress objects by addr so we also save display name
 */
ZmAppCtxt.prototype.setIsExpandableDL =
function(addr, isExpandableDL) {
	this._isExpandableDL[addr] = isExpandableDL;
};

ZmAppCtxt.prototype.getToolTipMgr =
function() {
	if (!this._toolTipMgr) {
		this._toolTipMgr = new ZmToolTipMgr();
	}
	return this._toolTipMgr;
};

/**
 * Returns true if Prism and the user is online
 *
 */
ZmAppCtxt.prototype.isZDOnline =
function() {
    var ac = window["appCtxt"].getAppController();
    return !AjxEnv.isPrism || (ac._isPrismOnline && ac._isUserOnline);
};

/**
 * When using pre-auth window.opener.appCtxt may not be accessible.  This function
 * handles appCtxt assignment to avoid a permission denied error
 * @return {Object} ZmAppCtxt
 */
ZmAppCtxt.handleWindowOpener = 
function() {
	try {
		return window && window.opener && window.opener.appCtxt || appCtxt;
	}
	catch (ex) {
		return appCtxt;
	}
};

ZmAppCtxt.prototype.isWebClientOffline =
function() {
    if (this.isWebClientOfflineSupported) {
        return ZmOffline.isServerReachable === false;
    }
    return false;
};

ZmAppCtxt.prototype.initWebOffline =
function() {
    this.isWebClientOfflineSupported = false;
	if (!AjxEnv.isOfflineSupported || !appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_ENABLED)) {
		AjxDebug.println(AjxDebug.OFFLINE, "isWebClientOfflineSupported :: false");
        return;
    }
    var offlineBrowserKey = appCtxt.get(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
    var localOfflineBrowserKey = localStorage.getItem(ZmSetting.WEBCLIENT_OFFLINE_BROWSER_KEY);
    if (offlineBrowserKey && offlineBrowserKey.indexOf(localOfflineBrowserKey) !== -1) {
        this.isWebClientOfflineSupported = true;
        this.webClientOfflineHandler = new ZmOffline();
    }
	AjxDebug.println(AjxDebug.OFFLINE, "isWebClientOfflineSupported :: "+ this.isWebClientOfflineSupported);
};

/**
 * Gets the offline settings dialog.
 *
 * @return	{ZmOfflineSettingsDialog}	offline settings dialog
 */
ZmAppCtxt.prototype.getOfflineSettingsDialog =
function() {
    if (!this._offlineSettingsDialog) {
        this._offlineSettingsDialog = new ZmOfflineSettingsDialog();
    }
    return this._offlineSettingsDialog;
};

/**
 * Returns true if the given ID is not local. That's the case if the ID has
 * an account part that is not the active account.
 *
 * @param {String|Number}   id
 * @returns {Boolean}   true if the given ID is not local
 */
ZmAppCtxt.prototype.isRemoteId = function(id) {
	id = String(id);
	var acct = appCtxt.getActiveAccount();
	return (id.indexOf(":") !== -1) && (id.indexOf(acct.id) !== 0);
};

/**
 * Returns the singleton AjxClipboard instance, if it is supported.
 *
 * @returns {AjxClipboard}
 */
ZmAppCtxt.prototype.getClipboard = function() {
	return AjxClipboard.isSupported() ? new AjxClipboard() : null;
};

/**
 * Checks a precondition which may be in one of several forms: a boolean, a settings constant, a function, or a list.
 *
 * @param {Boolean|String|Function|Array}   precondition    something that evaluates to true or false
 * @param {Boolean}                         listAny         (optional) if a list is provided, whether just one (instead of all) must be true
 *
 * @return boolean  false if the precondition evaluates to false or null, otherwise true
 */
ZmAppCtxt.prototype.checkPrecondition = function(precondition, listAny) {

	// Lack of a precondition evaluates to true
	if (precondition === undefined) {
		return true;
	}

	// A precondition of null should not happen
	if (precondition === null) {
		return false;
	}

	// Boolean speaks for itself
	if (AjxUtil.isBoolean(precondition)) {
		return precondition;
	}

	// Client setting: fetch value from settings
	if (AjxUtil.isString(precondition) && ZmSetting.hasOwnProperty(precondition)) {
		return appCtxt.get(precondition);
	}

	// Function: evaluate and return result
	if (AjxUtil.isFunction(precondition)) {
		return precondition();
	}

	// Array can be treated in one of two modes, where all have to be true, or just one does
	if (AjxUtil.isArray(precondition)) {
		for (var i = 0; i < precondition.length; i++) {
			var result = this.checkPrecondition(precondition[i]);
			if (listAny && result) {
				return true;
			}
			if (!listAny && !result) {
				return false;
			}
		}
		return !listAny;
	}

	return true;
};

/**
 * Displays an error message in  dialog.
 *
 * @param {string}  errMsg      error message
 * @param {string}  details     (optional) additional info to show using Details button
 * @param {string}  style       (optional) style constant DwtMessageDialog.*_STYLE
 * @param {string}  title       (optional) title for dialog (other than one for the style)
 * @apram {boolean} noReport    do not add a Report button/function to the dialog (defaults to true)
 */
ZmAppCtxt.prototype.showError = function(params) {

    params = params || {};
    var errMsg = params.errMsg || params;
    var dlg = this.getErrorDialog();
    dlg.reset();
    dlg.setMessage(errMsg, params.details, params.style || DwtMessageDialog.WARNING_STYLE, params.title);
    dlg.popup(null, params.noReport !== false);
};
