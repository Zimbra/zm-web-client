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
 * Creates an overview container.
 * @constructor
 * @class
 * Creates a header tree item for an account if mailbox has multiple accounts
 * configured. For each account header, a ZmOverview is added a child. If mbox
 * only has one account configured, no account header is created and the
 * ZmOverview is added as a child of the container.
 *
 * @author Parag Shah
 */
ZmOverviewContainer = function(params) {
	if (arguments.length == 0) { return; }

	params.className = "ZmOverviewContainer";
	DwtTree.call(this, params);

	this.setScrollStyle(params.scroll || Dwt.SCROLL);

	this._controller = params.controller;
	this._headerItems = {};
	this._overview = {};

	// add listeners
	this.addSelectionListener(new AjxListener(this, this._treeViewListener));
};

ZmOverviewContainer.prototype = new DwtTree;
ZmOverviewContainer.prototype.constructor = ZmOverviewContainer;

ZmOverviewContainer.prototype.toString =
function() {
	return "ZmOverviewContainer";
};

ZmOverviewContainer.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
};

ZmOverviewContainer.prototype.getOverviews =
function() {
	return this._overview;
};

ZmOverviewContainer.prototype.getHeaderItem =
function(account) {
	return account ? this._headerItems[account.id] : null;
};

ZmOverviewContainer.prototype.getSelected =
function() {
	var selected;
	for (var i in this._overview) {
		selected = this._overview[i].getSelected();
		if (selected) {
			return selected;
		}
	}

	selected = this.getSelection()[0];
	var account = selected && appCtxt.getAccount(selected.getData(Dwt.KEY_ID));
	var tree = account && appCtxt.getFolderTree(account);
	return tree && tree.root;
};

/**
 * Deselects all tree views for each overview in this container
 *
 * @param exception		[ZmOverview]*	If set, this overview is skipped during deselection
 */
ZmOverviewContainer.prototype.deselectAll =
function(exception) {
	DwtTree.prototype.deselectAll.call(this);
	this._deselectAllTreeViews(exception);
};

ZmOverviewContainer.prototype.setOverviewTrees =
function(treeIds) {
	for (var i in this._overview) {
		this._overview[i].set(treeIds);
	}
};

ZmOverviewContainer.prototype.initialize =
function(params) {
	this._appName = params.appName;

	var accounts = appCtxt.getZimbraAccounts();
	for (var i in accounts) {
		var acct = accounts[i];
		// skip the main account in offline mode since we'll add it at the end
		if (!acct.visible || (appCtxt.isOffline && acct.isMain && this._appName != ZmApp.PREFERENCES)) { continue; }

		this._addAccount(params, acct);
	}

	// add the "local" account last
	if (appCtxt.isOffline && this._appName != ZmApp.PREFERENCES) {
		var main = appCtxt.getMainAccount();

		// hide Junk folder for "local" account
		var omit = params.omit;
		if (!omit) { omit = {}; }
		omit[ZmFolder.ID_SPAM] = true;

		this._addAccount(params, main);
	}

	// add zimlets at the end of all overviews
	var skip = params.omit && params.omit[ZmOrganizer.ID_ZIMLET];
	if (!skip && window[ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]]) {
		var headerLabel = ZmOrganizer.LABEL[ZmOrganizer.ZIMLET];
		var headerDataId = params.overviewId = [params.appName, headerLabel].join(":");
		params.overviewTrees = [ZmOrganizer.ZIMLET];
		this._addSection(ZmMsg[headerLabel], "Resource", headerDataId, null, params);
	}
};

ZmOverviewContainer.prototype.resetOperations =
function(parent, acctId) {

	parent.enableAll(true);

	var acct = appCtxt.getAccount(acctId);
	if (acct.type == ZmAccount.TYPE_POP) {
		parent.enable(ZmOperation.NEW_FOLDER, false);
	}
};

ZmOverviewContainer.prototype._addAccount =
function(params, account) {
	params.overviewId = [params.appName, account.name].join(":"); 				// reset overviewId to be based on account
	params.account = account;													// tree controller might need reference to account

	// only show sections for apps that are supported unless this is prefs app
	var app = appCtxt.getApp(this._appName);
	var isSupported = (!app || (app && appCtxt.get(ZmApp.SETTING[this._appName], null, account)));

	if (this._appName == ZmApp.PREFERENCES || isSupported) {
		var omit = params.omitPerAcct
			? params.omitPerAcct[account.id] : params.omit;

		var headerLabel = (this._appName == ZmApp.PREFERENCES && account.isMain)
			? ZmMsg.allAccounts : account.getDisplayName();

		this._addSection(headerLabel, null, account.id, omit, params);

		this._initializeActionMenu(account);
	}
};

ZmOverviewContainer.prototype._addSection =
function(headerLabel, headerIcon, headerDataId, omit, overviewParams) {
	// create a top-level section header
	var params = {
		parent: this,
		text: headerLabel
		/*imageInfo: headerIcon*/
		/*className:"overviewHeader"*/
	};
	var header = this._headerItems[headerDataId] = new DwtTreeItem(params);
	header.setData(Dwt.KEY_ID, headerDataId);
	header.setScrollStyle(Dwt.CLIP);
	header._initialize(null, true);

	// reset some params for child overviews
	overviewParams.id = ZmId.getOverviewId(params.overviewId); 					// used to set ID for HTML element
	overviewParams.parent = header;
	overviewParams.scroll = Dwt.CLIP;
	overviewParams.posStyle = Dwt.STATIC_STYLE;

	// next, create an overview for this account and add it to the account header
	var ov = this._controller._overview[overviewParams.overviewId] =
			 this._overview[overviewParams.overviewId] =
			 new ZmOverview(overviewParams, this._controller);

	header._addItem(ov, null, true);
	header.addNodeIconListeners();
	header.setExpanded(true, false, false);

	// finally set treeviews for this overview
	var treeIds = overviewParams.overviewTrees || overviewParams.treeIds;
	ov.set(treeIds, omit);
};

ZmOverviewContainer.prototype._treeViewListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_ACTIONED &&
		ev.detail != DwtTree.ITEM_SELECTED &&
		ev.detail != DwtTree.ITEM_DBL_CLICKED)
	{
		return;
	}

	var item = this._actionedHeaderItem = ev.item;
	var acctId = item && item.getData(Dwt.KEY_ID);

	if (ev.detail == DwtTree.ITEM_ACTIONED && appCtxt.getApp(this._appName)) {	// right click
		var actionMenu = this._getActionMenu(ev);
		if (actionMenu) {
			this.resetOperations(actionMenu, acctId);
			actionMenu.popup(0, ev.docX, ev.docY);
		}
	}
	else if ((ev.detail == DwtTree.ITEM_SELECTED) && item) {					// left click
		// if calendar/prefs app, do nothing
		if (this._appName == ZmApp.CALENDAR ||
			this._appName == ZmApp.PREFERENCES)
		{
			return;
		}

		this._deselectAllTreeViews();

		// this avoids processing clicks in dialogs etc.
		if (!ZmApp.NAME[this._appName]) { return; }

		// if an account header item was clicked, run the default search for it
		if (acctId) {
			var account = appCtxt.getAccount(acctId);
			appCtxt.setActiveAccount(account);

			var fid = ZmOrganizer.DEFAULT_FOLDER[ZmApp.ORGANIZER[this._appName]];
			var folder = appCtxt.getById(ZmOrganizer.getSystemId(fid, account));
			var sc = appCtxt.getSearchController();
			var params = {
				query: folder.createQuery(),
				getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
				searchFor: (ZmApp.DEFAULT_SEARCH[this._appName]),
				sortBy: ((sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : ZmSearch.DATE_DESC),
				accountName: (account && account.name)
			};
			sc.search(params);
		}
	} else {																	// double click
		// handle double click?
	}
};

ZmOverviewContainer.prototype._initializeActionMenu =
function(account) {
	if (!this._actionMenu) {
		var ops = [
			ZmOperation.NEW_FOLDER,
			ZmOperation.EXPAND_ALL
			/*ZmOperation.SYNC*/
		];
		var args = [appCtxt.getShell(), ops, account];
		this._actionMenu = new AjxCallback(this, this._createActionMenu, args);
	}
};

ZmOverviewContainer.prototype._getActionMenu =
function() {
	if (this._actionMenu instanceof AjxCallback) {
		var callback = this._actionMenu;
		this._actionMenu = callback.run();
	}
	return this._actionMenu;
};

ZmOverviewContainer.prototype._createActionMenu =
function(parent, menuItems, account) {
	if (!menuItems) { return; }

	var listener = new AjxListener(this, this._actionMenuListener);
	var actionMenu = new ZmActionMenu({parent:parent, menuItems:menuItems});
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		actionMenu.getItem(i).setData(Dwt.KEY_OBJECT, appCtxt.getFolderTree(account).root);
		actionMenu.addSelectionListener(menuItems[i], listener);
	}

	return actionMenu;
};

ZmOverviewContainer.prototype._actionMenuListener =
function(ev) {
	var opId = ev.item.getData(ZmOperation.KEY_ID);

	if (opId == ZmOperation.NEW_FOLDER) {
		var treeId = ZmApp.ORGANIZER[this._appName];
		var tc = this._controller.getTreeController(treeId, true);
		if (tc) {
			tc._newListener(ev);
		}
	}
	else if (opId == ZmOperation.EXPAND_ALL) {
		this._actionedHeaderItem.setExpanded(true, true);
	}
};

/**
 * Deselects any selection for each overview this container is managing.
 *
 * @param exception		[ZmOverview]*	If set, deselects all overviews except this one.
 */
ZmOverviewContainer.prototype._deselectAllTreeViews =
function(exception) {
	// make sure none of the other items in the other overviews are selected
	for (var i in this._overview) {
		var overview = this._overview[i];
		if (exception && exception == overview ) { continue; }

		var trees = overview._treeHash;
		for (var j in trees) {
			if (trees[j].getSelectionCount() > 0) {
				trees[j].deselectAll();
				break;
			}
		}
	}
};
