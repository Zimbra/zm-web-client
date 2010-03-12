/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 * 
 * This file defines a list of accounts.
 *
 */

/**
 * Creates the account list.
 * @class
 * This class is used to store and manage a list of accounts for a mailbox.
 *
 * @author Parag Shah
 */
ZmAccountList = function() {
	this._accounts = {};
	this._count = 0;
	this.visibleAccounts = [];
	this.mainAccount = null;
	this.activeAccount = null;
	this.defaultAccount = null; // the first non-main account.

	this._evtMgr = new AjxEventMgr();
};

ZmAccountList.prototype.constructor = ZmAccountList;


// Consts

ZmAccountList.DEFAULT_ID = "main";


// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccountList.prototype.toString =
function() {
	return "ZmAccountList";
};

/**
 * Gets the number of visible accounts for this mailbox.
 *
 * @param	{Boolean}	includeInvisible	if <code>true</code>, include the number of invisible accounts for this mailbox
 * @return	{int}							the number of accounts for this mailbox
 */
ZmAccountList.prototype.size =
function(includeInvisible) {
	return (includeInvisible) ? this._count : this.visibleAccounts.length;
};

/**
 * Adds the account.
 * 
 * @param	{ZmAccount}	account		the account
 */
ZmAccountList.prototype.add =
function(account) {
	this._accounts[account.id] = account;
	this._count++;

	if (account.visible || account.id == ZmAccountList.DEFAULT_ID) {
		this.visibleAccounts.push(account);
	}

	if (account.id == ZmAccountList.DEFAULT_ID) {
		this.mainAccount = account;
	}
};

/**
 * Gets the accounts.
 * 
 * @return	{Array}	an array of {ZmAccount} objects
 */
ZmAccountList.prototype.getAccounts =
function() {
	return this._accounts;
};

/**
 * Gets the account by id.
 * 
 * @param	{String}	id		the id
 * @return	{ZmAccount}	the account
 */
ZmAccountList.prototype.getAccount =
function(id) {
	return id ? this._accounts[id] : this.mainAccount;
};

/**
 * Gets the account by name.
 * 
 * @param	{String}	name	the name
 * @return	{ZmAccount}	the account
 */
ZmAccountList.prototype.getAccountByName =
function(name) {
	for (var i in this._accounts) {
		if (this._accounts[i].name == name) {
			return this._accounts[i];
		}
	}
	return null;
};

/**
 * Gets the account by email.
 * 
 * @param	{String}	email	the email
 * @return	{ZmAccount}	the account
 */
ZmAccountList.prototype.getAccountByEmail =
function(email) {
	for (var i in this._accounts) {
		if (this._accounts[i].getEmail() == email) {
			return this._accounts[i];
		}
	}
	return null;
};

/**
 * Gets the cumulative item count of all accounts for the given folder ID.
 *
 * @param {String}	folderId		the folder id
 * @param {Boolean}	checkUnread		if <code>true</code>, checks the unread count instead of item count
 * @return	{int}	the item count
 */
ZmAccountList.prototype.getItemCount =
function(folderId, checkUnread) {
	var count = 0;
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		var acct = this.visibleAccounts[i];
		if (acct.isMain) { continue; } // local account should never have drafts

		var fid = ZmOrganizer.getSystemId(folderId, acct);
		var folder = appCtxt.getById(fid);
		if (folder) {
			count += (checkUnread ? folder.numUnread : folder.numTotal);
		}
	}

	return count;
};

/**
 * Generates a query.
 * 
 * @param {String}	folderId		the folder id
 * @param	{Array}	types		the types
 * @return	{String}	the query
 */
ZmAccountList.prototype.generateQuery =
function(folderId, types) {
	// XXX: for now, let's just search for *one* type at a time
	var type = types && types.get(0);
	var query = [];
	var list = this.visibleAccounts;
	var fid = folderId || ZmOrganizer.ID_ROOT;
	var syntax = folderId ? "inid" : "underid";
	for (var i = 0; i < list.length; i++) {
		var acct = list[i];

		// dont add any apps not supported by this account
		if ((type && !acct.isAppEnabled(ZmItem.APP[type])) || acct.isMain) { continue; }

		var part = [syntax, ':"', ZmOrganizer.getSystemId(fid, acct, true), '"'];
		query.push(part.join(""));
	}

	DBG.println(AjxDebug.DBG2, "query = " + query.join(" OR "));
	return (query.join(" OR "));
};

/**
 * Loads each visible account serially by requesting the following requests from
 * the server in a batch request:
 * 
 * <ul>
 * <li><code><GetInfoRequest></code></li>
 * <li><code><GetTafReqyuest></code></li>
 * <li><code><GetFolderRequest></code></li>
 * </ul>
 * 
 * @param {AjxCallback}	callback		the callback to trigger once all accounts have been loaded
 */
ZmAccountList.prototype.loadAccounts =
function(callback) {
	var list = (new Array()).concat(this.visibleAccounts);
	this._loadAccount(list, callback);
};

/**
 * @private
 */
ZmAccountList.prototype._loadAccount =
function(accounts, callback) {
	var acct = accounts.shift();
	if (acct) {
		var respCallback = new AjxCallback(this, this._loadAccount, [accounts, callback]);
		acct.load(respCallback);
	} else {
		// do any post account load initialization
		ZmOrganizer.HIDE_EMPTY[ZmOrganizer.TAG] = true;
		ZmOrganizer.HIDE_EMPTY[ZmOrganizer.SEARCH] = true;

		// enable compose based on whether at least one account supports smtp
		for (var i = 0; i < this.visibleAccounts.length; i++) {
			if (appCtxt.get(ZmSetting.OFFLINE_SMTP_ENABLED, null, this.visibleAccounts[i])) {
				appCtxt.set(ZmSetting.OFFLINE_COMPOSE_ENABLED, true, null, null, true);
				break;
			}
		}

		if (callback) {
			callback.run();
		}
	}
};

/**
 * Sets the given account as the active one, which will then be used when fetching
 * any account-specific data such as settings or folder tree.
 *
 * @param {ZmZimbraAccount}	account		the account to make active
 * @param {Boolean}	skipNotify		if <code>true</code>, skip notify
 */
ZmAccountList.prototype.setActiveAccount =
function(account, skipNotify) {
	this.activeAccount = account;

	this._evt = this._evt || new ZmEvent();
	this._evt.account = account;

	if (!skipNotify) {
		this._evtMgr.notifyListeners("ACCOUNT", this._evt);
	}
};

/**
 * Adds an active account listener.
 * 
 * @param	{AjxListener}	listener		the listener
 * @param	{int}	index		the index where to insert the listener
 */
ZmAccountList.prototype.addActiveAcountListener =
function(listener, index) {
	return this._evtMgr.addListener("ACCOUNT", listener, index);
};

/**
 * Checks if any of the non-main, visible accounts is currently doing an initial sync.
 * 
 * @return	{Boolean}	<code>true</code> if any of the non-main accounts are doing initial sync
 */
ZmAccountList.prototype.isInitialSyncing =
function() {
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		var acct = this.visibleAccounts[i];
		if (acct.isMain) { continue; }

		if (acct.isOfflineInitialSync()) {
			return true;
		}
	}

	return false;
};

/**
 * Checks if there is at least one of the given account types in the
 * account list. Note: if the given account type is ZCS, the local parent
 * account is NOT included when searching the account list.
 *
 * @param {String}	type	the type of account to check
 * @return	{Boolean}	<code>true</code> if the account exists
 */
ZmAccountList.prototype.accountTypeExists =
function(type) {
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		var acct = this.visibleAccounts[i];
		if (type == ZmAccount.TYPE_ZIMBRA && acct.isMain) { continue; }
		if (acct.type == type) { return true; }
	}

	return false;
};

/**
 * Resolves the given folder ID based on whether its an ID of a
 * system folder (less than 255) to that of the default account since the main
 * "local" account only contains the Trash folder.
 *
 * @param {String}	folderId		the folder id to resolve
 * @return	{Boolean}	<code>true</code> if the given folder is a system folder
 */
ZmAccountList.prototype.resolveFolderId =
function(folderId) {
	return (folderId.indexOf(":") == -1 && folderId < 255 && folderId != ZmFolder.ID_TRASH)
		? ZmOrganizer.getSystemId(folderId, this.defaultAccount) : folderId;
};

/**
 * Syncs all visible accounts.
 * 
 * @param	{AjxCallback}	callback		the callback
 */
ZmAccountList.prototype.syncAll =
function(callback) {
	var list = (new Array()).concat(this.visibleAccounts);
	this._sendSync(list, callback);
};

/**
 * @private
 */
ZmAccountList.prototype._sendSync =
function(accounts, callback) {
	var acct = accounts.shift();
	if (acct) {
		if (!acct.isMain) { // skip the main account
			acct.sync();
		}
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._sendSync, [accounts, callback]), 500);
	} else {
		if (callback) {
			callback.run();
		}
	}
};

/**
 * Creates the main account and all its children. In the normal case, the "main"
 * account is the only account, and represents the user who logged in. If family
 * mailbox is enabled, that account is a parent account with dominion over child
 * accounts. If offline, the main account is the "local" account.
 *
 * @param {ZmSettings}	settings	the settings for the main account
 * @param {Object}	obj		the JSON obj containing meta info about the main account and its children
 */
ZmAccountList.prototype.createAccounts =
function(settings, obj) {
	// first, replace the dummy main account with real information
	var account = appCtxt.accountList.mainAccount;
	account.id = obj.id;
	account.name = obj.name;
	account.isMain = true;
	account.isZimbraAccount = true;
	account.loaded = true;
	account.visible = true;
	account.settings = settings;
	account.type = ZmAccount.TYPE_ZIMBRA;
	account.icon = "AccountZimbra";

	this._accounts[account.id] = account;
	delete this._accounts[ZmAccountList.DEFAULT_ID];

	this.setActiveAccount(account);

	if (appCtxt.isOffline) {
		account.displayName = ZmMsg.localFolders;

		if (appCtxt.get(ZmSetting.OFFLINE_NOTEBOOK_SYNC_ENABLED)) {
			appCtxt.set(ZmSetting.NOTEBOOK_ENABLED, true, null, null, true);
		}
	}

	// second, create all child accounts if applicable
	var childAccounts = obj.childAccounts && obj.childAccounts.childAccount;
	if (childAccounts) {
		for (var i = 0; i < childAccounts.length; i++) {
			this.add(ZmZimbraAccount.createFromDom(childAccounts[i]));
		}

		// set global vars per number of child accounts
		appCtxt.multiAccounts = this.size() > 1;
		appCtxt.isFamilyMbox = appCtxt.multiAccounts && !appCtxt.isOffline;

		this.defaultAccount = appCtxt.isFamilyMbox ? this.mainAccount : this.visibleAccounts[1];
	}
};

/**
 * Resets the trees.
 * 
 */
ZmAccountList.prototype.resetTrees =
function() {
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		for (var type in trees) {
			var tree = trees[type];
			if (tree && tree.reset) {
				tree.reset();
			}
		}
	}
};

/**
 * Saves the implicit preferences on the visible accounts.
 * 
 */
ZmAccountList.prototype.saveImplicitPrefs =
function() {
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		this.visibleAccounts[i].saveImplicitPrefs();
	}
};

/**
 * Gets the tool tip for the folder.
 * 
 * @param	{String}	folderId	the folder id
 * @return	{String}	the tool tip
 */
ZmAccountList.prototype.getTooltipForVirtualFolder =
function(folderId) {
	var numTotal = 0;
	var sizeTotal = 0;

	for (var i = 0; i < this.visibleAccounts.length; i++) {
		var acct = this.visibleAccounts[i];
		var fid = ZmOrganizer.getSystemId(folderId, acct);
		var folder = appCtxt.getById(fid);
		if (folder) {
			numTotal += folder.numTotal;
			sizeTotal += folder.sizeTotal;
		}
	}

	var subs = {
		itemText: ZmMsg.messages,
		numTotal: numTotal,
		sizeTotal: sizeTotal
	};

	return AjxTemplate.expand("share.App#FolderTooltip", subs);
};
