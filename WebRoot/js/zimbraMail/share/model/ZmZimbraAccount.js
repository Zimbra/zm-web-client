/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an account object containing meta info about the account
 * @constructor
 * @class
 * An account object is created primarily if a user has added subaccounts that
 * he would like to manage (i.e. family mailbox).
 *
 * @author Parag Shah
 *
 * @param id			[string]*		unique ID for this account
 * @param name			[string]*		email address
 * @param visible		[boolean]*		if true, make this account available in the overview (child accounts)
 */
ZmZimbraAccount = function(id, name, visible, list) {

	ZmAccount.call(this, null, id, name, list);

	this.visible = (visible !== false);
	this.settings = null;
	this.trees = {};
	this.loaded = false;
	this.acl = new ZmAccessControlList();
};

ZmZimbraAccount.prototype = new ZmAccount;
ZmZimbraAccount.prototype.constructor = ZmZimbraAccount;

ZmZimbraAccount.prototype.toString =
function() {
	return "ZmZimbraAccount";
};


//
// Constants
//

ZmZimbraAccount.DEFAULT_ID		= "main";
ZmZimbraAccount.STATUS_UNKNOWN	= "unknown";
ZmZimbraAccount.STATUS_OFFLINE	= "offline";
ZmZimbraAccount.STATUS_ONLINE	= "online";
ZmZimbraAccount.STATUS_RUNNING	= "running";
ZmZimbraAccount.STATUS_AUTHFAIL	= "authfail";
ZmZimbraAccount.STATUS_ERROR	= "error";

//
// Public methods
//

ZmZimbraAccount.prototype.setName =
function(name) {
	var identity = this.getIdentity();
	// TODO: If no identity and name is set, should create one!
	if (!identity) return;
	identity.name = name;
};

ZmZimbraAccount.prototype.getName =
function() {
	var identity = this.getIdentity();
	var name = (!identity)
		? this.settings.get(ZmSetting.DISPLAY_NAME)
		: identity.name;

	if (!name) {
		name = this.getDisplayName();
	}
	return identity.isDefault && name == ZmIdentity.DEFAULT_NAME ? ZmMsg.accountDefault : name;
};

ZmZimbraAccount.prototype.setEmail =
function(email) {}; // IGNORE

ZmZimbraAccount.prototype.getEmail =
function() {
	return this.name;
};

ZmZimbraAccount.prototype.getDisplayName =
function() {
	if (!this.displayName) {
		var dispName = this.isMain
			? this.settings.get(ZmSetting.DISPLAY_NAME)
			: this._displayName;
		this.displayName = (this._accountName || dispName || this.name);
	}
	return this.displayName;
};

ZmZimbraAccount.prototype.getIdentity =
function() {
	if (!appCtxt.isFamilyMbox || this.isMain) {
		return appCtxt.getIdentityCollection(this).defaultIdentity;
	}

	// for family mbox, create dummy identities for child accounts
	if (!this.dummyIdentity) {
		this.dummyIdentity = new ZmIdentity(this.name);
	}
	return this.dummyIdentity;
};

ZmZimbraAccount.prototype.getToolTip =
function() {
	if (this.status || this.lastSync) {
		var lastSyncDate = (this.lastSync && this.lastSync != 0)
			? (new Date(parseInt(this.lastSync))) : null;

		var params = {
			lastSync: (lastSyncDate ? (AjxDateUtil.computeWordyDateStr(new Date(), lastSyncDate)) : null),
			status: this.getStatusMessage()
		};

		return AjxTemplate.expand("share.App#ZimbraAccountTooltip", params);
	}
	return "";
};

ZmZimbraAccount.prototype.isOfflineInitialSync =
function() {
	return (appCtxt.isOffline && (!this.lastSync || (this.lastSync && this.lastSync == 0)));
};

ZmZimbraAccount.prototype.updateState =
function(acctInfo) {
	// update last sync timestamp
	this.lastSync = acctInfo.lastsync;

	// update offline status if changed
	if (this.status != acctInfo.status) {
		this.status = acctInfo.status;
		if (this.isMain || this.visible) {
			// todo
		}
	}

	this.code = acctInfo.code;
	if (acctInfo.error) {
		var error = acctInfo.error[0];
		this.errorDetail = error.exception[0]._content;
		this.errorMessage = error.message;
	}

	// update accordion title per unread count if changed
	if (this.visible && acctInfo.unread != this.unread) {
		this.unread = acctInfo.unread;
		if (appCtxt.multiAccounts && appCtxt.getActiveAccount() != this) {
			// todo?
		}
	}
};

ZmZimbraAccount.prototype.getTitle =
function() {
	return (appCtxt.getActiveAccount() != this && this.unread && this.unread != 0)
		? (["<b>", this.getDisplayName(), " (", this.unread, ")</b>"].join(""))
		: this.getDisplayName();
};

ZmZimbraAccount.prototype.getStatusIcon =
function() {
	switch (this.status) {
		case ZmZimbraAccount.STATUS_UNKNOWN:	return "ImgOffline";
		case ZmZimbraAccount.STATUS_OFFLINE:	return "ImgImAway";
		case ZmZimbraAccount.STATUS_ONLINE:		return "ImgImAvailable";
		case ZmZimbraAccount.STATUS_RUNNING:	return "DwtWait16Icon";
		case ZmZimbraAccount.STATUS_AUTHFAIL:	return "ImgImDnd";
		case ZmZimbraAccount.STATUS_ERROR:		return "ImgCritical";
	}
	return "";
};

ZmZimbraAccount.prototype.getIcon =
function() {
	return this.isMain ? "LocalFolders" : this.icon;
};

ZmZimbraAccount.prototype.getZdMsg =
function(code) {
	var msg = ((ZdMsg["client." + code]) || (ZdMsg["exception." + code]));
	if (!msg && code) {
		msg = ZdMsg["exception.offline.UNEXPECTED"];
	}
	return msg;
};

ZmZimbraAccount.prototype.getStatusMessage =
function() {
	switch (this.status) {
		case ZmZimbraAccount.STATUS_UNKNOWN:	return ZmMsg.unknown;
		case ZmZimbraAccount.STATUS_OFFLINE:	return ZmMsg.imStatusOffline;
		case ZmZimbraAccount.STATUS_ONLINE:		return ZmMsg.imStatusOnline;
		case ZmZimbraAccount.STATUS_RUNNING:	return ZmMsg.running;
		case ZmZimbraAccount.STATUS_AUTHFAIL:	return this.code ? this.getZdMsg(this.code) : AjxMessageFormat.format(ZmMsg.authFailure, this.getEmail());
		case ZmZimbraAccount.STATUS_ERROR:		return this.code ? this.getZdMsg(this.code) : ZmMsg.error;
	}
	return "";
};

// offline use only:
ZmZimbraAccount.prototype.showErrorMessage =
function() {
	if (this.status != ZmZimbraAccount.STATUS_ERROR) { return; }

	var dialog = appCtxt.getErrorDialog();

	// short message
	var msg = this.getZdMsg(this.code);
	if (msg == "") {
		msg = this.getStatusMessage();
	}
	dialog.setMessage(msg);

	// detailed message
	var html = [];
	var i = 0;
	if (this.errorMessage) {
		html[i++] = "<p><b>";
		html[i++] = ZdMsg.DebugMsg;
		html[i++] = "</b>: ";
		html[i++] = this.errorMessage;
		html[i++] = "</p>";
	}

	if (this.errorDetail) {
		html[i++] = "<p><b>";
		html[i++] = ZdMsg.DebugStack;
		html[i++] = "</b>:</p><p><pre>";
		html[i++] = this.errorDetail;
		html[i++] = "</pre></p>";
	}

	html[i++] = "<p><b>";
	html[i++] = ZdMsg.DebugActionNote;
	html[i++] = "</b></p>";

	dialog.setDetailString(html.join(""));
	dialog.popup(null, true);
};

ZmZimbraAccount.createFromDom =
function(node) {
	var acct = new ZmZimbraAccount();
	acct._loadFromDom(node);
	return acct;
};

ZmZimbraAccount.prototype.load =
function(callback) {
	if (!this.loaded) {
		// create new ZmSetting for this account
		this.settings = new ZmSettings();

		// check "{APP}_ENABLED" state against main account's settings
		var mainAcct = appCtxt.getMainAccount();

		// for all *loaded* apps, add their app-specific settings
		for (var i = 0; i < ZmApp.APPS.length; i++) {
			var appName = ZmApp.APPS[i];
			var setting = ZmApp.SETTING[appName];
			if (setting && appCtxt.get(setting, null, mainAcct)) {
				var app = appCtxt.getApp(appName);
				if (app) {
					app._registerSettings(this.settings);
				}
			}
		}

		var command = new ZmBatchCommand(null, this.name);

		// load user settings retrieved from server now
		var loadCallback = new AjxCallback(this, this._handleLoadSettings);
		this.settings.loadUserSettings(loadCallback, null, this.name, null, command);

		// get tag info for this account *FIRST* - otherwise, root ID get overridden
		var tagDoc = AjxSoapDoc.create("GetTagRequest", "urn:zimbraMail");
		var tagCallback = new AjxCallback(this, this._handleLoadTags);
		command.addNewRequestParams(tagDoc, tagCallback);

		// get folder info for this account
		var folderDoc = AjxSoapDoc.create("GetFolderRequest", "urn:zimbraMail");
		folderDoc.getMethod().setAttribute("visible", "1");
		var folderCallback = new AjxCallback(this, this._handleLoadFolders);
		command.addNewRequestParams(folderDoc, folderCallback);

		var respCallback = new AjxCallback(this, this._handleLoadUserInfo, callback);
		var errCallback = new AjxCallback(this, this._handleErrorLoad);
		command.run(respCallback, errCallback);
	}
	else if (callback) {
		callback.run();
	}
};

/**
 * Removes any account-specific data stored globally
 */
ZmZimbraAccount.prototype.unload =
function() {
	if (!appCtxt.inStartup) {
		// unset account-specific shortcuts
		this.settings.loadShortcuts(true);
	}
};

ZmZimbraAccount.prototype.save =
function(callback, errorCallback, batchCmd) {
	return (this.getIdentity().save(callback, errorCallback, batchCmd));
};

/**
 * Saves implicit prefs. Because it's done onunload, the save is sync.
 */
ZmZimbraAccount.prototype.saveImplicitPrefs =
function() {
	// HACK: in multi-account, hanging noop gets dropped and somehow the auth token changes
	ZmCsfeCommand._curAuthToken = ZmCsfeCommand.getAuthToken();

	var list = [];
	for (var id in ZmSetting.CHANGED_IMPLICIT) {
		var setting = this.settings ? this.settings.getSetting(id) : null;
		if (setting && (setting.getValue(null, true) != setting.origValue)) {
			list.push(setting);
		}
	}
	if (list && list.length) {
		this.settings.save(list, null, null, this.name);
	}
};


//
// Protected methods
//

ZmZimbraAccount.prototype._handleLoadSettings =
function(result) {
	DBG.println(AjxDebug.DBG1, "Account settings successfully loaded for " + this.name);

	// initialize identities/data-sources/signatures for this account
	var obj = result.getResponse().GetInfoResponse;
	appCtxt.getIdentityCollection(this).initialize(obj.identities);
	appCtxt.getDataSourceCollection(this).initialize(obj.dataSources);
	appCtxt.getSignatureCollection(this).initialize(obj.signatures);

	// read receipts are not currently allowed for non zimbra accounts
	if (!this.isZimbraAccount) {
		appCtxt.set(ZmSetting.MAIL_READ_RECEIPT_ENABLED, false);
	}
};

ZmZimbraAccount.prototype._handleLoadFolders =
function(result) {
	var resp = result.getResponse().GetFolderResponse;
	var folders = resp ? resp.folder[0] : null;
	if (folders) {
		appCtxt.getRequestMgr()._loadTree(ZmOrganizer.FOLDER, null, resp.folder[0], "folder", this);
	}
};

ZmZimbraAccount.prototype._handleLoadTags =
function(result) {
	var resp = result.getResponse().GetTagResponse;
	appCtxt.getRequestMgr()._loadTree(ZmOrganizer.TAG, null, resp, null, this);
};

ZmZimbraAccount.prototype._handleLoadUserInfo =
function(callback) {
	this.loaded = true;

	// bug fix #33168 - get perms for all mountpoints in account
	var folderTree = appCtxt.getFolderTree();
	if (folderTree) {
		folderTree.getPermissions({noBusyOverlay:true});
	}

	// in dev mode, force create deferred folders b/c postLoad gets called w/
	// invisible parent (deferred folders for child accounts are never loaded)
	var apps = appCtxt.getAppController()._apps;
	for (var i in apps) {
		if (AjxDispatcher.loaded(i)) {
			var app = appCtxt.getApp(i);
			var org = ZmOrganizer.APP2ORGANIZER[i];
			if (app && org && org.length) {
				app._createDeferredFolders(org[0], this.id);
			}
		}
	}

	if (callback) {
		callback.run();
	}
};

ZmZimbraAccount.prototype._handleErrorLoad =
function(ev) {
	DBG.println(AjxDebug.DBG1, "------- ERROR loading account settings for " + this.name);
};

ZmZimbraAccount.prototype._loadFromDom =
function(node) {
	this.id = node.id;
	this.name = node.name;
	this.visible = node.visible;

	var data = node.attrs && node.attrs._attrs;
	this._displayName = data ? data.displayName : this.email;
	this._accountName = data && data.zimbraPrefLabel;
	this.type = data ? data.offlineAccountFlavor : ZmZimbraAccount.TYPE_ZIMBRA;

	this.isZimbraAccount = this.type == ZmAccount.TYPE_ZIMBRA;

	// set icon now that we know the type
	switch (this.type) {
		case ZmAccount.TYPE_AOL:	this.icon = "AccountAOL"; break;
		case ZmAccount.TYPE_GMAIL:	this.icon = "AccountGmail"; break;
		case ZmAccount.TYPE_IMAP:	this.icon = "AccountIMAP"; break;
		case ZmAccount.TYPE_LIVE:	this.icon = "AccountMSN"; break;
		case ZmAccount.TYPE_MSE:	this.icon = "AccountExchange"; break;
		case ZmAccount.TYPE_POP:	this.icon = "AccountPOP"; break;
		case ZmAccount.TYPE_YMP:	this.icon = "AccountYahoo"; break;
		case ZmAccount.TYPE_ZIMBRA:	this.icon = "AccountZimbra"; break;
	}
};
