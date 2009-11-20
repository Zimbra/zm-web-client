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
 * Creates an overview container for a multi-account mailbox.
 * @constructor
 * @class
 * Creates a header tree item for an account if mailbox has multiple accounts
 * configured. For each account header, a ZmOverview is added a child. If mbox
 * only has one account configured, no account header is created and the
 * ZmOverview is added as a child of the container.
 *
 * @author Parag Shah
 */
ZmAccountOverviewContainer = function(params) {
	if (arguments.length == 0) { return; }

	ZmOverviewContainer.call(this, params);
};

ZmAccountOverviewContainer.prototype = new ZmOverviewContainer;
ZmAccountOverviewContainer.prototype.constructor = ZmAccountOverviewContainer;

ZmAccountOverviewContainer.prototype.toString =
function() {
	return "ZmAccountOverviewContainer";
};

ZmAccountOverviewContainer.prototype.getHeaderItem =
function(account) {
	return account && this._headerItems[account.id];
};

/**
 * Expands the given account only (collapses all other accounts)
 *
 * @param account
 */
ZmAccountOverviewContainer.prototype.expandAccountOnly =
function(account) {
	if (!account) {
		account = appCtxt.getActiveAccount();
	}

	for (var i in this._headerItems) {
		this._headerItems[i].setExpanded((i == account.id), false, false);
	}
};

ZmAccountOverviewContainer.prototype.getSelected =
function() {
	var selected = ZmOverviewContainer.prototype.getSelected.call(this);

	if (!selected) {
		selected = this.getSelection()[0];
		var account = selected && appCtxt.accountList.getAccount(selected.getData(Dwt.KEY_ID));
		var tree = account && appCtxt.getFolderTree(account);
		return tree && tree.root;
	}

	return selected;
};

ZmAccountOverviewContainer.prototype.initialize =
function(params) {

	var header, acct;
	var showBackgroundColor = false;
	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		acct = accounts[i];
		// skip the main account in offline mode since we'll add it at the end
		if (appCtxt.isOffline && acct.isMain && this._appName != ZmApp.PREFERENCES) { continue; }

		this._addAccount(params, acct, showBackgroundColor);

		header = this.getHeaderItem(acct);
		if (header) {
			if (this._appName == ZmApp.PREFERENCES) {
				header.setExpanded(true, false, true);
				header.enableSelection(false);
			} else {
				var isExpanded = appCtxt.get(ZmSetting.ACCOUNT_TREE_OPEN, null, acct);
				header.setExpanded(isExpanded);
				if (!isExpanded) {
					this._setAccountHeaderLabel(acct, header);
				}
			}
		}

		this.updateAccountInfo(acct, true, true);

		showBackgroundColor = !showBackgroundColor;
	}

	// add the "local" account last
	if (appCtxt.isOffline && this._appName != ZmApp.PREFERENCES) {
		// hide Junk folder for "local" account
		var omit = params.omit;
		if (!omit) { omit = {}; }
		omit[ZmFolder.ID_SPAM] = true;

		acct = appCtxt.accountList.mainAccount;
		this._addAccount(params, acct, showBackgroundColor, "ZmOverviewLocalHeader");

		header = this.getHeaderItem(acct);
		header.setExpanded(appCtxt.get(ZmSetting.ACCOUNT_TREE_OPEN, null, acct));
	}

	// add zimlets at the end of all overviews
	var skip = params.omit && params.omit[ZmOrganizer.ID_ZIMLET];
	if (!skip && !appCtxt.inStartup) {
		skip = (appCtxt.getZimletMgr().getPanelZimlets().length == 0);
	}
	if (!skip && window[ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]]) {
		var headerLabel = ZmOrganizer.LABEL[ZmOrganizer.ZIMLET];
		var headerDataId = params.overviewId = appCtxt.getOverviewId([this.containerId, headerLabel], null);
		var headerParams = {
			label: ZmMsg[headerLabel],
			icon: "Resource",
			dataId: headerDataId,
			className: "ZmOverviewZimletHeader"
		};
		params.overviewTrees = [ZmOrganizer.ZIMLET];

		this._addSection(headerParams, null, params);

		var header = this._headerItems[headerDataId];
		if (header) {
			header.__isZimlet = true;
			header.setExpanded(appCtxt.get(ZmSetting.ZIMLET_TREE_OPEN, null, appCtxt.accountList.mainAccount));
		}
	}

	// add Global Inbox tree item
	skip = params.omit && params.omit[ZmOrganizer.ID_GLOBAL_INBOX];
	if (appCtxt.isOffline && !skip && 
		this._appName == ZmApp.MAIL &&
		appCtxt.accountList.size(true) > 2)
	{
		var params = {
			parent: this,
			text: (ZmMsg[ZmFolder.MSG_KEY[ZmOrganizer.ID_GLOBAL_INBOX]]),
			imageInfo: "GlobalInbox"
		};
		var ti = new DwtTreeItem(params);
		ti.setData(Dwt.KEY_ID, appCtxt.getById(ZmOrganizer.ID_GLOBAL_INBOX));
		ti.setScrollStyle(Dwt.CLIP);
		ti.addClassName("ZmOverviewGlobalInbox");
		ti._initialize(0, true);
		ti.setVisible(appCtxt.get(ZmSetting.OFFLINE_SHOW_GLOBAL_INBOX));
		this.setSelection(ti, true);

		var mainAcct = appCtxt.accountList.mainAccount;
		var setting = appCtxt.getSettings(mainAcct).getSetting(ZmSetting.OFFLINE_SHOW_GLOBAL_INBOX);
		setting.addChangeListener(new AjxListener(this, this._settingChangeListener, ti));
	}
};

/**
 * Sets/updates the account-level status icon next to account name tree header.
 * This only applies to app-based overview containers (i.e. not dialogs)
 *
 * Also resets the tooltip for the account header tree item.
 *
 * @param account	[ZmZimbraAccount]*		account to update status icon for
 */
ZmAccountOverviewContainer.prototype.updateAccountInfo =
function(account, updateStatus, updateTooltip) {
	// check if appName is a real app (and not a dialog) before setting the account status
	var hi = appCtxt.getApp(this._appName) && this.getHeaderItem(account);
	if (hi) {
		if (updateStatus) {
			var html = "";
			if (account.status != ZmZimbraAccount.STATUS_ONLINE) {
				html = (account.status == ZmZimbraAccount.STATUS_RUNNING)
					? ("<img src='/img/animated/ImgSpinner.gif' width=16 height=16 border=0>")
					: (AjxImg.getImageHtml(account.getStatusIcon()));
			}
			if (hi._extraCell) {
				hi._extraCell.innerHTML = html;
			}
		}

		if (updateTooltip) {
			hi.setToolTipContent(account.getToolTip());
		}
	}
};

ZmAccountOverviewContainer.prototype.resetOperations =
function(parent, acctId) {

	parent.enableAll(!(acctId instanceof ZmFolder));

	var acct = appCtxt.accountList.getAccount(acctId);
	if (acct) {
		parent.enable(ZmOperation.NEW_FOLDER, acct.type != ZmAccount.TYPE_POP);
		parent.enable(ZmOperation.SYNC, !acct.isMain);
	}
};

// HACK - when the overview container for mail is initially created, zimlet
// data has yet to be parsed so we remove the zimlet section after zimlet load
// if there are no panel zimlets.
ZmAccountOverviewContainer.prototype.removeZimletSection =
function() {
	var headerLabel = ZmOrganizer.LABEL[ZmOrganizer.ZIMLET];
	var headerDataId = appCtxt.getOverviewId([this.containerId, headerLabel], null);
	var header = this._headerItems[headerDataId];
	if (header) {
		this.removeChild(header);
	}
};

ZmAccountOverviewContainer.prototype._addAccount =
function(params, account, showBackgroundColor, headerClassName) {
	params.overviewId = appCtxt.getOverviewId(this.containerId, account);
	params.account = account;	// tree controller might need reference to account

	// only show sections for apps that are supported unless this is prefs app
	var app = appCtxt.getApp(this._appName);
	var isSupported = (!app || (app && appCtxt.get(ZmApp.SETTING[this._appName], null, account)));

	if (this._appName == ZmApp.PREFERENCES || isSupported) {
		var omit = params.omitPerAcct
			? params.omitPerAcct[account.id] : params.omit;

		var headerLabel = (this._appName == ZmApp.PREFERENCES && account.isMain)
			? ZmMsg.allAccounts : account.getDisplayName();

		var headerParams = {
			label: headerLabel,
			icon: account.getIcon(),
			dataId: account.id,
			className: headerClassName
		};

		this._addSection(headerParams, omit, params, showBackgroundColor);

		this._initializeActionMenu(account);
	}
};

ZmAccountOverviewContainer.prototype._addSection =
function(headerParams, omit, overviewParams, showBackgroundColor) {
	// create a top-level section header
	var params = {
		parent: this,
		text: headerParams.label,
		imageInfo: headerParams.icon,
		selectable: overviewParams.selectable,
		className: headerParams.className
	};
	var header = this._headerItems[headerParams.dataId] = new DwtTreeItem(params);
	header.setData(Dwt.KEY_ID, headerParams.dataId);
	header.setScrollStyle(Dwt.CLIP);
	header._initialize(null, true, true);
	header.addClassName(showBackgroundColor ? "ZmOverviewSectionHilite" : "ZmOverviewSection");

	// reset some params for child overviews
	overviewParams.id = ZmId.getOverviewId(overviewParams.overviewId);
	overviewParams.parent = header;
	overviewParams.scroll = Dwt.CLIP;
	overviewParams.posStyle = Dwt.STATIC_STYLE;

	// next, create an overview for this account and add it to the account header
	var ov = this._controller._overview[overviewParams.overviewId] =
			 this._overview[overviewParams.overviewId] =
			 new ZmOverview(overviewParams, this._controller);

	header._addItem(ov, null, true);

	// finally set treeviews for this overview
	var treeIds = overviewParams.overviewTrees || overviewParams.treeIds;
	ov.set(treeIds, omit);
};

ZmAccountOverviewContainer.prototype._treeViewListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_ACTIONED &&
		ev.detail != DwtTree.ITEM_SELECTED &&
		ev.detail != DwtTree.ITEM_DBL_CLICKED)
	{
		return;
	}

	var item = this._actionedHeaderItem = ev.item;
	var data = item && item.getData(Dwt.KEY_ID);

	if (ev.detail == DwtTree.ITEM_ACTIONED && appCtxt.getApp(this._appName)) {	// right click
		if (item.__isZimlet) { return; } // do nothing if zimlet is right-clicked

		var actionMenu = this._getActionMenu(ev);
		if (actionMenu) {
			this.resetOperations(actionMenu, data);
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
		if (data) {
			var sc = appCtxt.getSearchController();
			var params;

			if (data instanceof ZmFolder) {
				var main = appCtxt.accountList.mainAccount;
				sc.resetSearchAllAccounts();
				sc.searchAllAccounts = true;
				params = {
					queryHint: appCtxt.accountList.generateQuery(ZmOrganizer.ID_INBOX),
					folderId: null,
					getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML, null, main),
					searchFor: (ZmApp.DEFAULT_SEARCH[this._appName]),
					sortBy: ZmSearch.DATE_DESC,
					accountName: main.name,
					noUpdateOverview: true
				};
			}
			else {
				sc.searchAllAccounts = false;
				var account = appCtxt.accountList.getAccount(data);
				appCtxt.accountList.setActiveAccount(account);

				var fid = ZmOrganizer.DEFAULT_FOLDER[ZmApp.ORGANIZER[this._appName]];
				var folder = appCtxt.getById(ZmOrganizer.getSystemId(fid, account));
				params = {
					query: folder.createQuery(),
					getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
					searchFor: (ZmApp.DEFAULT_SEARCH[this._appName]),
					sortBy: ((sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : ZmSearch.DATE_DESC),
					accountName: (account && account.name),
					noUpdateOverview: true
				};
			}
			sc.search(params);
		}
	} else {																	// double click
		// handle double click?
	}
};

ZmAccountOverviewContainer.prototype._treeListener =
function(ev) {
	var acct;
	var header = ev.item;
	if (header) {
		acct = header.__isZimlet
			? appCtxt.accountList.mainAccount
			: appCtxt.accountList.getAccount(header.getData(Dwt.KEY_ID));
	}
	if (!acct) { return; }

	if (appCtxt.getCurrentAppName() != ZmApp.PREFERENCES &&
		(ev.detail == DwtTree.ITEM_COLLAPSED ||
		 ev.detail == DwtTree.ITEM_EXPANDED))
	{
		var expanded = ev.detail == DwtTree.ITEM_EXPANDED;
		if (!appCtxt.inStartup) {
			appCtxt.set(ZmSetting.ACCOUNT_TREE_OPEN, expanded, null, null, null, acct);
		}

		if (!header.__isZimlet) {
			if (expanded) {
				header.setText(acct.getDisplayName());
			} else {
				this._setAccountHeaderLabel(acct, header);
			}
		}
	}
};

ZmAccountOverviewContainer.prototype._settingChangeListener =
function(ti, ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }

	var setting = ev.source;
	if (setting.id == ZmSetting.OFFLINE_SHOW_GLOBAL_INBOX) {
		ti.setVisible(setting.getValue());
	}
};

ZmAccountOverviewContainer.prototype.updateAccountHeaderLabel =
function(acct) {
	var header = this.getHeaderItem(acct);
	if (header && !header.getExpanded()) {
		this._setAccountHeaderLabel(acct, header);
	}
};

ZmAccountOverviewContainer.prototype._setAccountHeaderLabel =
function(acct, header) {
	var inboxId = ZmOrganizer.getSystemId(ZmOrganizer.ID_INBOX, acct, true);
	var inbox = appCtxt.getById(inboxId);
	var label = (inbox && inbox.numUnread > 0)
		? (["<span style='font-weight:bold;'>",acct.getDisplayName()," (", inbox.numUnread, ")","</span>"].join(""))
		: acct.getDisplayName();
	header.setText(label);
};

ZmAccountOverviewContainer.prototype._initializeActionMenu =
function(account) {
	if (!this._actionMenu) {
		var ops = [
			ZmOperation.NEW_FOLDER,
			ZmOperation.SYNC
		];
		var args = [appCtxt.getShell(), ops, account];
		this._actionMenu = new AjxCallback(this, this._createActionMenu, args);
	}
};

ZmAccountOverviewContainer.prototype._createActionMenu =
function(parent, menuItems, account) {
	if (!menuItems) { return; }

	var listener = new AjxListener(this, this._actionMenuListener);
	var actionMenu = new ZmActionMenu({parent:parent, menuItems:menuItems});
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var mi = actionMenu.getItem(i);
		var op = menuItems[i];
		if (op == ZmOperation.SYNC) {
			mi.setText(ZmMsg.sendReceive);
		}
		mi.setData(Dwt.KEY_OBJECT, appCtxt.getFolderTree(account).root);
		actionMenu.addSelectionListener(op, listener);
	}

	return actionMenu;
};

ZmAccountOverviewContainer.prototype._actionMenuListener =
function(ev) {
	var opId = ev.item.getData(ZmOperation.KEY_ID);

	if (opId == ZmOperation.NEW_FOLDER) {
		var treeId = ZmApp.ORGANIZER[this._appName];
		var tc = this._controller.getTreeController(treeId, true);
		if (tc) {
			tc._actionedOrganizer = null;
			var account = appCtxt.accountList.getAccount(this._actionedHeaderItem.getData(Dwt.KEY_ID));
			tc._actionedOrganizer = appCtxt.getFolderTree(account).root;
			tc._newListener(ev, account);
		}
	}
	else if (opId == ZmOperation.SYNC) {
		var account = appCtxt.accountList.getAccount(this._actionedHeaderItem.getData(Dwt.KEY_ID));
		if (account) {
			account.sync();
		}
	}
};
