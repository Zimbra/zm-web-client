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
 */

/**
 * Creates an overview container for a multi-account mailbox.
 * @class
 * Creates a header tree item for an account if mailbox has multiple accounts
 * configured. For each account header, a {@link ZmOverview} is added a child. If mailbox
 * only has one account configured, no account header is created and the
 * {@link ZmOverview} is added as a child of the container.
 *
 * @param	{Hash}	params		a hash of parameters
 * 
 * @author Parag Shah
 */
ZmAccountOverviewContainer = function(params) {
	if (arguments.length == 0) { return; }

	ZmOverviewContainer.call(this, params);

	this._vFolderTreeItemMap = {};
	this._settingChangeListener = new AjxListener(this, this._handleSettingChange);
};

ZmAccountOverviewContainer.prototype = new ZmOverviewContainer;
ZmAccountOverviewContainer.prototype.constructor = ZmAccountOverviewContainer;


// Consts
ZmAccountOverviewContainer.VIRTUAL_FOLDERS = [
	ZmFolder.ID_INBOX,
	ZmFolder.ID_SENT,
	ZmFolder.ID_DRAFTS,
	ZmFolder.ID_SPAM,
	ZmFolder.ID_OUTBOX,
	ZmFolder.ID_TRASH
];


// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccountOverviewContainer.prototype.toString =
function() {
	return "ZmAccountOverviewContainer";
};

ZmAccountOverviewContainer.prototype.getHeaderItem =
function(account) {
	return account && this._headerItems[account.id];
};

/**
 * Expands the given account only (collapses all other accounts).
 *
 * @param {ZmAccount}	account		the account to expand
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

/**
 * Initializes the account overview.
 * 
 * @param	{Hash}	params		a hash of parameters
 * 
 */
ZmAccountOverviewContainer.prototype.initialize =
function(params) {

	var header, acct;
	var accounts = appCtxt.accountList.visibleAccounts;
	var showAllMailboxes = (appCtxt.isOffline && this._appName == ZmApp.MAIL && (accounts.length > 2));
	var showBackgroundColor = showAllMailboxes;
	var mainAcct = appCtxt.accountList.mainAccount;

	for (var i = 0; i < accounts.length; i++) {
		acct = accounts[i];
		// skip the main account in offline mode since we'll add it at the end
		if (appCtxt.isOffline && acct.isMain && this._appName != ZmApp.PREFERENCES) { continue; }

		params.omit = {};

		if (acct.type == ZmAccount.TYPE_POP) {
			params.omit[ZmFolder.ID_SPAM]   = true;
			params.omit[ZmFolder.ID_OUTBOX] = true;
		}

		if (this._appName == ZmApp.CALENDAR) {
			params.selectable = false;
		}

		this._addAccount(params, acct, showBackgroundColor);

		header = this.getHeaderItem(acct);
		if (header) {
			this._setupHeader(header, acct);
		}

		this.updateAccountInfo(acct, true, true);

		showBackgroundColor = !showBackgroundColor;
	}

	// add "All Mailboxes"
	skip = params.omit && params.omit[ZmOrganizer.ID_ALL_MAILBOXES];
	if (showAllMailboxes && !skip) {
		var text = ZmMsg[ZmFolder.MSG_KEY[ZmOrganizer.ID_ALL_MAILBOXES]];
		var params1 = {
			parent: this,
			text: this._getFolderLabel(ZmOrganizer.ID_INBOX, text),
			imageInfo: "AccountAll"
		};
		var showAllMboxes = appCtxt.get(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES);
		var allTi = this._allMailboxesTreeHeader = new DwtTreeItem(params1);
		allTi.setData(Dwt.KEY_ID, ZmOrganizer.ID_ALL_MAILBOXES);
		allTi.addClassName("ZmOverviewGlobalInbox");
		allTi._initialize(0, true);
		allTi.setVisible(showAllMboxes);
		allTi.__origText = text;
		if (showAllMboxes) {
			this.highlightAllMboxes();
		}

		var setting = appCtxt.getSettings(mainAcct).getSetting(ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES);
		setting.addChangeListener(this._settingChangeListener);

		var folders = ZmAccountOverviewContainer.VIRTUAL_FOLDERS;
		for (var i = 0; i < folders.length; i++) {
			var folderId = folders[i];

			// add virtual system folders
			params1 = {
				parent: allTi,
				text: this._getFolderLabel(folderId, ZmMsg[ZmFolder.MSG_KEY[folderId]]),
				imageInfo: ZmFolder.ICON[folderId]
			};
			var ti = this._vFolderTreeItemMap[folderId] = new DwtTreeItem(params1);
			ti.setData(Dwt.KEY_ID, folderId);
			ti.addClassName("DwtTreeItemChildDiv");
			ti._initialize(null, true);
			ti.setToolTipContent(appCtxt.accountList.getTooltipForVirtualFolder(folderId));
		}

		// add global searches
		params1 = {
			parent: allTi,
			text: ZmMsg.globalSearches,
			imageInfo: "SearchFolder",
			selectable: false
		};
		var searchTi = this._searchTreeHeader = new DwtTreeItem(params1);
		searchTi.addClassName("DwtTreeItemChildDiv");
		searchTi._initialize(null, true);
		searchTi.__isSearch = true;

		var root = appCtxt.getById(ZmOrganizer.ID_ROOT, mainAcct);
		var searchFolders = root.getByType(ZmOrganizer.SEARCH);
		for (var i = 0; i < searchFolders.length; i++) {
			var folder = searchFolders[i];
			if (folder.id != ZmOrganizer.ID_ALL_MAILBOXES &&
				folder.isOfflineGlobalSearch)
			{
				this.addSearchFolder(folder);
			}
		}
		searchTi.setVisible(searchTi.getItemCount() > 0);

		// bug #43734 - set expand/collapse state based on user's pref
		if (appCtxt.get(ZmSetting.OFFLINE_SAVED_SEARCHES_TREE_OPEN)) {
			searchTi.setExpanded(true, null, true);
		}
		if (appCtxt.get(ZmSetting.OFFLINE_ALL_MAILBOXES_TREE_OPEN)) {
			allTi.setExpanded(true, null, true);
		}
	}

	// add the "local" account last
	if (appCtxt.isOffline) {
		var params2 = AjxUtil.hashCopy(params);
		params2.omit = {};
		params2.selectable = false;

		if (this._appName != ZmApp.PREFERENCES) {
			this._addAccount(params2, mainAcct, showBackgroundColor, "ZmOverviewLocalHeader");

			header = this.getHeaderItem(mainAcct);
			header.setExpanded(appCtxt.get(ZmSetting.ACCOUNT_TREE_OPEN, null, mainAcct));

			this.updateAccountInfo(mainAcct, false, true);
		}
		else {
			var params3 = {
				parent: this,
				text: mainAcct.getDisplayName(),
				imageInfo: mainAcct.getIcon(),
				selectable: false
			};
			var localPrefTi = new DwtTreeItem(params3);
			localPrefTi._initialize(null, true);

			var globalPrefOverviewId = appCtxt.getOverviewId(this.containerId, mainAcct);
			var tv = this._overview[globalPrefOverviewId].getTreeView(ZmOrganizer.PREF_PAGE);
			var importExportTi = tv.getTreeItemById("PREF_PAGE_IMPORT_EXPORT");

			tv.getHeaderItem().removeChild(importExportTi);
			localPrefTi._addItem(importExportTi);
			importExportTi.addClassName("DwtTreeItemChildDiv");
			localPrefTi.setExpanded(true, null, true);
		}
	}

	// add zimlets at the end of all overviews
	var skip = params.omit && params.omit[ZmOrganizer.ID_ZIMLET];

	if (!appCtxt.inStartup && !skip && appCtxt.getZimletMgr().getPanelZimlets().length == 0) {
		skip = true;
	}

	if (!skip) {
		AjxDispatcher.require("Zimlet");
	}

	if (!skip && window[ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]] &&
		this._appName != ZmApp.PREFERENCES)
	{
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
			header.setExpanded(appCtxt.get(ZmSetting.ZIMLET_TREE_OPEN, null, mainAcct));
		}
	}

	this._initializeActionMenu();
};

/**
 * Adds a search folder.
 * 
 * @param	{ZmFolder}		folder		the folder
 */
ZmAccountOverviewContainer.prototype.addSearchFolder =
function(folder) {
	if (!this._searchTreeHeader) { return; }

	var params = {
		parent: this._searchTreeHeader,
		text: folder.getName(),
		imageInfo: folder.getIcon()
	};
	var ti = new DwtTreeItem(params);
	ti.setData(Dwt.KEY_ID, folder);
	ti._initialize(null, true);

	if (!this._searchTreeHeader.getVisible()) {
		this._searchTreeHeader.setVisible(true);
	}
};

/**
 * Sets/updates the account-level status icon next to account name tree header.
 * This only applies to app-based overview containers (i.e. not dialogs). Also resets the
 * tooltip for the account header tree item.
 *
 * @param {ZmZimbraAccount}	account		the account to update status icon for
 * @param	{Boolean}	updateStatus	if <code>true</code>, update the status
 * @param	{Boolean}	updateTooltip	if <code>true</code>, update the tool tip
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

		if (updateTooltip || updateStatus) {
			hi.setToolTipContent(account.getToolTip());
		}
	}
};

/**
 * Updates the label.
 * 
 * @param	{ZmOrganizer}	organizer		the organizer
 */
ZmAccountOverviewContainer.prototype.updateLabel =
function(organizer) {
	// update account header if necessary
	if (organizer.nId == ZmOrganizer.ID_INBOX) {
		var acct = organizer.getAccount();
		var header = this.getHeaderItem(acct);
		if (header && !header.getExpanded()) {
			header.setText(this._getAccountHeaderLabel(acct));
		}
	}

	// update virtual folder label
	var ti = this._vFolderTreeItemMap[organizer.nId];
	if (ti) {
		ti.setText(this._getFolderLabel(organizer.nId, organizer.name));
		if (organizer.nId == ZmOrganizer.ID_INBOX &&
			!this._allMailboxesTreeHeader.getExpanded())
		{
			var text = this._getFolderLabel(organizer.nId, this._allMailboxesTreeHeader.__origText);
			this._allMailboxesTreeHeader.setText(text);
		}
	}
};

/**
 * Updates the tool tip.
 * 
 * @param	{String}	folderId		the folder id
 * 
 */
ZmAccountOverviewContainer.prototype.updateTooltip =
function(folderId) {
	var ti = this._allMailboxesTreeHeader && this._vFolderTreeItemMap[folderId];
	if (ti) {
		ti.setToolTipContent(appCtxt.accountList.getTooltipForVirtualFolder(folderId));
	}
};

ZmAccountOverviewContainer.prototype.resetOperations =
function(parent, data) {

	var emptyFolderOp = parent.getOp(ZmOperation.EMPTY_FOLDER);

	if (data instanceof ZmSearchFolder) {
		parent.getOp(ZmOperation.MARK_ALL_READ).setVisible(false);
		emptyFolderOp.setVisible(false);
		parent.getOp(this._newOp).setVisible(false);
		if (appCtxt.isOffline) {
			parent.getOp(ZmOperation.SYNC).setVisible(false);
		}
		parent.getOp(ZmOperation.DELETE).setVisible(true);
		return;
	}

	var acct = appCtxt.accountList.getAccount(data);
	var isAcctType = (acct || data == ZmOrganizer.ID_ALL_MAILBOXES);

	parent.getOp(ZmOperation.MARK_ALL_READ).setVisible(!isAcctType);
	emptyFolderOp.setVisible(false);
	parent.getOp(this._newOp).setVisible(isAcctType && data != ZmOrganizer.ID_ALL_MAILBOXES);
	if (appCtxt.isOffline) {
		parent.getOp(ZmOperation.SYNC).setVisible(isAcctType && (!acct || (acct && !acct.isMain)));
	}
	parent.getOp(ZmOperation.DELETE).setVisible(false);

	if (isAcctType) {
		parent.enable(this._newOp, (acct && acct.type != ZmAccount.TYPE_POP));
		parent.enable(ZmOperation.SYNC, (!acct || (acct && !acct.isMain)));
	} else {
		// reset mark all based on a "friendly" hack ;)
		var markAllEnabled = false;
		if (data != ZmOrganizer.ID_OUTBOX && data != ZmFolder.ID_DRAFTS &&
			this._actionedHeaderItem.getText().indexOf("bold") != -1)
		{
			markAllEnabled = true;
		}
		parent.enable(ZmOperation.MARK_ALL_READ, markAllEnabled);

		// reset empty "folder" based on Trash/Junk
		if (data == ZmOrganizer.ID_TRASH || data == ZmOrganizer.ID_SPAM) {
			var text = (data == ZmOrganizer.ID_TRASH) ? ZmMsg.emptyTrash : ZmMsg.emptyJunk;
			emptyFolderOp.setText(text);
			emptyFolderOp.setVisible(true);
			parent.enable(ZmOperation.EMPTY_FOLDER, !this._isFolderEmpty(data));
		}
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

ZmAccountOverviewContainer.prototype.highlightAllMboxes =
function() {
	this.deselectAll();
	this.setSelection(this._allMailboxesTreeHeader, true);
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

		var headerLabel, headerIcon;
		if (this._appName == ZmApp.PREFERENCES && account.isMain && appCtxt.isOffline) {
			headerLabel = ZmMsg.allAccounts;
			headerIcon = "AccountAll";
		} else {
			headerLabel = account.getDisplayName();
			headerIcon = account.getIcon()
		}

		var headerParams = {
			label: headerLabel,
			icon: headerIcon,
			dataId: account.id,
			className: headerClassName
		};

		this._addSection(headerParams, omit, params, showBackgroundColor);
	}

	var setting = appCtxt.getSettings(account).getSetting(ZmSetting.QUOTA_USED);
	setting.addChangeListener(this._settingChangeListener);
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
	var ov = this._controller._overview[overviewParams.overviewId] = this._overview[overviewParams.overviewId] = new ZmOverview(overviewParams, this._controller);

	header._addItem(ov, null, true);

	// finally set treeviews for this overview
	var treeIds = overviewParams.overviewTrees || overviewParams.treeIds;
	ov.set(treeIds, omit);
};

ZmAccountOverviewContainer.prototype._setupHeader =
function(header, acct) {
	// always expand header in prefs app, otherwise follow implicit user pref
	if (this._appName == ZmApp.PREFERENCES) {
		header.setExpanded(true, false, true);
		header.enableSelection(false);
	} else {
		var isExpanded = appCtxt.get(ZmSetting.ACCOUNT_TREE_OPEN, null, acct);
		header.setExpanded(isExpanded);
		if (!isExpanded) {
			header.setText(this._getAccountHeaderLabel(acct));
		}
	}

	// add onclick support
	if (header._extraCell) {
		header._extraCell.onclick = AjxCallback.simpleClosure(this._handleStatusClick, this, acct);
	}

	// add DnD support
	var dropTgt = this._controller.getTreeController(ZmOrganizer.FOLDER).getDropTarget();
	var root = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, acct);
	header.setDropTarget(dropTgt);
	header.setData(Dwt.KEY_OBJECT, appCtxt.getById(root));
};

/**
 * Iterates all visible account and checks whether folder for each account is
 * empty. Used by "All Mailboxes" to determine whether a virtual folder needs
 * to be disabled or not when right-clicked.
 *
 * @param folderId		[String]		Normalized folder ID (should not be fully qualified)
 */
ZmAccountOverviewContainer.prototype._isFolderEmpty =
function(folderId) {
	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var folder = appCtxt.getById(ZmOrganizer.getSystemId(folderId, accounts[i]));
		if (folder && folder.numTotal > 0) {
			return false;
		}
	}

	return true;
};

ZmAccountOverviewContainer.prototype._syncAccount =
function(dialog, account) {
	dialog.popdown();
	account.sync();
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

	// do nothing if zimlet/search is clicked
	if (item && (item.__isZimlet || item.__isSearch)) { return; }

	var data = item && item.getData(Dwt.KEY_ID);

	if (ev.detail == DwtTree.ITEM_ACTIONED && appCtxt.getApp(this._appName)) {	// right click
		var actionMenu = this._getActionMenu(data);
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

			var account = appCtxt.accountList.getAccount(data);
			if (account) {

				// don't process click if user clicked on error status icon
				if ((ev.target.parentNode == ev.item._extraCell) && account.isError()) {
					return;
				}

				sc.searchAllAccounts = false;
				appCtxt.accountList.setActiveAccount(account);

				if (appCtxt.isOffline && account.hasNotSynced() && !account.__syncAsked) {
					account.__syncAsked = true;

					var dialog = appCtxt.getYesNoMsgDialog();
					dialog.registerCallback(DwtDialog.YES_BUTTON, this._syncAccount, this, [dialog, account]);
					dialog.setMessage(ZmMsg.neverSyncedAsk, DwtMessageDialog.INFO_STYLE);
					dialog.popup();
				}

				var fid = ZmOrganizer.DEFAULT_FOLDER[ZmApp.ORGANIZER[this._appName]];
				var folder = appCtxt.getById(ZmOrganizer.getSystemId(fid, account));

				// briefcase is not a ZmFolder so let's skip for now
				if (!(folder instanceof ZmFolder)) { return; }

				var defaultSortBy = (this._appName == ZmApp.TASKS)
					? ZmSearch.DUE_DATE_DESC : ZmSearch.DATE_DESC;

				var params = {
					query: folder.createQuery(),
					getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
					searchFor: (ZmApp.DEFAULT_SEARCH[this._appName]),
					sortBy: ((sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : defaultSortBy),
					accountName: (account && account.name),
					noUpdateOverview: true
				};
			} else {
				var main = appCtxt.accountList.mainAccount;
				sc.resetSearchAllAccounts();
				sc.searchAllAccounts = true;

				if (data instanceof ZmSearchFolder) {
					params = {
						searchAllAccounts: true,
						accountName: main.name,
						getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML),
						noUpdateOverview: true
					};
					sc.redoSearch(data.search, false, params);
					return;
				}
				if (data == ZmOrganizer.ID_ALL_MAILBOXES) {
					data = ZmFolder.ID_INBOX;
				}

				params = {
					queryHint: appCtxt.accountList.generateQuery(data),
					folderId: null,
					getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML, null, main),
					searchFor: (ZmApp.DEFAULT_SEARCH[this._appName]),
					sortBy: ZmSearch.DATE_DESC,
					accountName: main.name,
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
	if (ev.detail != DwtTree.ITEM_COLLAPSED &&
		ev.detail != DwtTree.ITEM_EXPANDED)
	{
		return;
	}

	var header = ev.item;
	var expanded = ev.detail == DwtTree.ITEM_EXPANDED;

	var acct;
	if (header) {
		if (header.__isSearch) {
			appCtxt.set(ZmSetting.OFFLINE_SAVED_SEARCHES_TREE_OPEN, expanded);
			return;
		}

		var data = header.getData(Dwt.KEY_ID);
		if (data == ZmOrganizer.ID_ALL_MAILBOXES) {
			var text = expanded
				? header.__origText
				: this._getFolderLabel(ZmOrganizer.ID_INBOX, header.__origText);
			header.setText(text);

			// bug #43734 - remember expand/collapse state
			appCtxt.set(ZmSetting.OFFLINE_ALL_MAILBOXES_TREE_OPEN, expanded);

			return;
		}

		acct = header.__isZimlet
			? appCtxt.accountList.mainAccount
			: appCtxt.accountList.getAccount(data);
	}

	if (acct && appCtxt.getCurrentAppName() != ZmApp.PREFERENCES) {
		if (!appCtxt.inStartup) {
			appCtxt.set(ZmSetting.ACCOUNT_TREE_OPEN, expanded, null, null, null, acct);
		}

		if (!header.__isZimlet) {
			var text = expanded
				? acct.getDisplayName()
				: this._getAccountHeaderLabel(acct);
			header.setText(text);
		}
	}
};

ZmAccountOverviewContainer.prototype._handleSettingChange =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }

	var setting = ev.source;

	if (setting.id == ZmSetting.OFFLINE_SHOW_ALL_MAILBOXES) {
		var isVisible = setting.getValue();
		this._allMailboxesTreeHeader.setVisible(isVisible);
		if (!isVisible) {
			if (appCtxt.getActiveAccount().isMain) {
				appCtxt.accountList.setActiveAccount(appCtxt.accountList.defaultAccount);
			}
			appCtxt.getSearchController().searchAllAccounts = false;
			appCtxt.getApp(ZmApp.MAIL).mailSearch();
		} else {
			this._deselect(this._allMailboxesTreeHeader);
		}
	}
	else if (setting.id == ZmSetting.QUOTA_USED) {
		this.updateAccountInfo(ev.getDetails().account, false, true);
	}
};

ZmAccountOverviewContainer.prototype._getAccountHeaderLabel =
function(acct, header) {
	var inboxId = (this._appName == ZmApp.MAIL)
		? ZmOrganizer.getSystemId(ZmOrganizer.ID_INBOX, acct, true) : null;
	var inbox = inboxId && appCtxt.getById(inboxId);
	if (inbox && inbox.numUnread > 0) {
		var name = AjxMessageFormat.format(ZmMsg.folderUnread, [acct.getDisplayName(), inbox.numUnread]);
		return (["<span style='font-weight:bold;'>", name, "</span>"].join(""));
	}

	return acct.getDisplayName();
};

ZmAccountOverviewContainer.prototype._getFolderLabel =
function(folderId, label) {
	var checkUnread = (folderId != ZmFolder.ID_DRAFTS && folderId != ZmFolder.ID_OUTBOX);
	var count = appCtxt.accountList.getItemCount(folderId, checkUnread);
	if (count > 0) {
		var name = AjxMessageFormat.format(ZmMsg.folderUnread, [label, count]);
		return (["<span style='font-weight:bold;'>", name, "</span>"].join(""));
	}

	return label;
};

ZmAccountOverviewContainer.prototype._initializeActionMenu =
function() {
	if (!this._actionMenu) {
		var orgType = ZmApp.ORGANIZER[this._appName];
		this._newOp = ZmOrganizer.NEW_OP[orgType];

		var ops = [this._newOp];
		if (appCtxt.isOffline) {
			ops.push(ZmOperation.SYNC);
		}
		ops.push(ZmOperation.MARK_ALL_READ,
				ZmOperation.EMPTY_FOLDER,
				ZmOperation.DELETE);

		this._actionMenu = new AjxCallback(this, this._createActionMenu, [ops]);
	}
};

ZmAccountOverviewContainer.prototype._createActionMenu =
function(menuItems) {
	var listener = new AjxListener(this, this._actionMenuListener);
	var actionMenu = new ZmActionMenu({parent:appCtxt.getShell(), menuItems:menuItems});
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var mi = actionMenu.getItem(i);
		var op = menuItems[i];
		if (op == ZmOperation.SYNC) {
			mi.setText(ZmMsg.sendReceive);
		}
		actionMenu.addSelectionListener(op, listener);
	}

	return actionMenu;
};

ZmAccountOverviewContainer.prototype._actionMenuListener =
function(ev) {
	var opId = ev.item.getData(ZmOperation.KEY_ID);
	var data = this._actionedHeaderItem.getData(Dwt.KEY_ID);

	if (opId == this._newOp) {
		var treeId = ZmApp.ORGANIZER[this._appName];
		var tc = this._controller.getTreeController(treeId, true);
		if (tc) {
			tc._actionedOrganizer = null;
			var account = appCtxt.accountList.getAccount(data);
			tc._actionedOrganizer = appCtxt.getFolderTree(account).root;
			tc._newListener(ev, account);
		}
	}
	else if (opId == ZmOperation.SYNC) {
		if (data == ZmOrganizer.ID_ALL_MAILBOXES) {
			appCtxt.accountList.syncAll();
		} else {
			var account = appCtxt.accountList.getAccount(data);
			if (account) {
				account.sync();
			}
		}
	}
	else if (opId == ZmOperation.MARK_ALL_READ) {
		this._doAction(data, opId);
	}
	else if (opId == ZmOperation.EMPTY_FOLDER) {
		this._confirmEmptyAction(data, opId);
	}
	else if (opId == ZmOperation.DELETE) {
		data._delete();
		var parent = this._actionedHeaderItem.parent;
		parent.removeChild(this._actionedHeaderItem); // HACK: just nuke it
		parent.setVisible(parent.getItemCount() > 0);
	}
};

ZmAccountOverviewContainer.prototype._confirmEmptyAction =
function(data, opId) {
	var dialog = appCtxt.getOkCancelMsgDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._emptyCallback, this, [dialog, data, opId]);

	var msg = (data == ZmFolder.ID_TRASH)
		? ZmMsg.confirmEmptyTrashFolder
		: (AjxMessageFormat.format(ZmMsg.confirmEmptyFolder, ZmMsg[ZmFolder.MSG_KEY[data]]));

	dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	dialog.popup();
};

ZmAccountOverviewContainer.prototype._emptyCallback =
function(dialog, folderId, opId) {
	dialog.popdown();
	this._doAction(folderId, opId);
};

ZmAccountOverviewContainer.prototype._doAction =
function(folderId, opId) {
	var bc = new ZmBatchCommand(true, appCtxt.accountList.mainAccount.name);

	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var account = accounts[i];
		if (account.isMain) { continue; }

		var fid = ZmOrganizer.getSystemId(folderId, account);
		var folder = appCtxt.getById(fid);
		if (folder) {
			if (opId == ZmOperation.MARK_ALL_READ) {
				folder.markAllRead(bc);
			} else {
				folder.empty(null, bc);
			}
			bc.curId++;
		}
	}

	bc.run();
};

ZmAccountOverviewContainer.prototype._handleStatusClick =
function(account, ev) {
	account.showErrorMessage();
};
