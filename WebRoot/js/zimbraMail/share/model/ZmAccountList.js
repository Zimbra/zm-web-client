/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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
 * Used to store and manage a list of accounts for this mailbox.
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

ZmAccountList.prototype.toString =
function() {
	return "ZmAccountList";
};

/**
 * Returns the number of accounts for this mailbox
 *
 * @param visible	[Boolean]*		If true, returns the number of visible accounts for this mailbox
 */
ZmAccountList.prototype.size =
function(visible) {
	return (visible) ? this.visibleAccounts.length : this._count;
};

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

ZmAccountList.prototype.getAccounts =
function() {
	return this._accounts;
};

ZmAccountList.prototype.getAccount =
function(id) {
	return id ? this._accounts[id] : this.mainAccount;
};

ZmAccountList.prototype.getAccountByName =
function(name) {
	for (var i in this._accounts) {
		if (this._accounts[i].name == name) {
			return this._accounts[i];
		}
	}
	return null;
};

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
 * Returns the cumulative item count of all accounts for the given folder ID
 *
 * @param folderId		[String]	folder ID
 * @param checkUnread	[Boolean]*	if true, checks the unread count instead of item count
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
 * - GetInfoRequest
 * - GetTafReqyuest
 * - GetFolderRequest
 *
 * @param callback		[AjxCallback]*	the callback to trigger once all accounts have been loaded
 */
ZmAccountList.prototype.loadAccounts =
function(callback) {
	var list = (new Array()).concat(this.visibleAccounts);
	this._loadAccount(list, callback);
};

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
 * Makes the given account the active one, which will then be used when fetching
 * any account-specific data such as settings or folder tree.
 *
 * @param account		[ZmZimbraAccount]	account to make active
 * @param skipNotify	[Boolean]*			skip notify if true
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

ZmAccountList.prototype.addActiveAcountListener =
function(listener, index) {
	return this._evtMgr.addListener("ACCOUNT", listener, index);
};

/**
 * Returns true if any of the non-main, visible accounts is currently doing an
 * initial sync.
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
 * Returns true if there is at least one of the given account types in the
 * account list. Note: if the given account type is ZCS, the local parent
 * account is NOT included when searching the account list.
 *
 * @param type	[String]		Type of account to check
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

ZmAccountList.prototype.syncAll =
function(callback) {
	var list = (new Array()).concat(this.visibleAccounts);
	this._sendSync(list, callback);
};

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
 * @param settings	[ZmSettings]	settings for the main account
 * @param obj		[Object]		JSON obj containing meta info about the main account and its children
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

ZmAccountList.prototype.saveImplicitPrefs =
function() {
	for (var i = 0; i < this.visibleAccounts.length; i++) {
		var trees = this.visibleAccounts[i].trees;
		this.visibleAccounts[i].saveImplicitPrefs();
	}
};
