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
	for (var i in this._overview) {
		var selected = this._overview[i].getSelected();
		if (selected) {
			return selected;
		}
	}
};

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
		if (!acct.visible || (appCtxt.isOffline && acct.isMain)) { continue; }

		this._addAccount(params, acct);
	}

	// add the "local" account last
	if (appCtxt.isOffline) {
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
		this._addSection(account.getDisplayName(), null, account.id, omit, params);
	}
};

ZmOverviewContainer.prototype._addSection =
function(headerLabel, headerIcon, headerDataId, omit, overviewParams) {
	// create a top-level section header
	var params = {parent:this, text:headerLabel, imageInfo:headerIcon/*, className:"overviewHeader"*/};
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

ZmOverviewContainer.prototype._itemClicked =
function(item, ev) {
	var appName = appCtxt.getCurrentAppName();
	if (appName == ZmApp.CALENDAR) { return; }

	DwtTree.prototype._itemClicked.call(this, item, ev);

	this._deselectAllTreeViews();

	// if an account header item was clicked, run the default search for it
	var acctId = item.getData(Dwt.KEY_ID);
	if (acctId) {
		var account = appCtxt.getAccount(acctId);
		appCtxt.setActiveAccount(account);

		var fid = ZmOrganizer.DEFAULT_FOLDER[ZmApp.ORGANIZER[appName]];
		var folder = appCtxt.getById(ZmOrganizer.getSystemId(fid, account));
		var sc = appCtxt.getSearchController();
		var params = {
			query: folder.createQuery(),
			getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
			searchFor: (ZmApp.DEFAULT_SEARCH[appName]),
			sortBy: ((sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : ZmSearch.DATE_DESC),
			accountName: (account && account.name)
		};
		sc.search(params);
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
