/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a dialog with various trees so a user can select a folder.
 * @class
 * This class represents choose folder dialog.
 * 
 * @param	{DwtControl}	shell		the parent
 * @param	{String}	className		the class name
 * 
 * @extends		ZmDialog
 */
ZmChooseFolderDialog = function(parent, className) {
	var newButton = new DwtDialog_ButtonDescriptor(ZmChooseFolderDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	var params = {parent:parent, className:className, extraButtons:[newButton]};
	ZmDialog.call(this, params);

	this._createControls();
	this._setNameField(this._inputDivId);
	this.registerCallback(ZmChooseFolderDialog.NEW_BUTTON, this._showNewDialog, this);
	this._changeListener = new AjxListener(this, this._folderTreeChangeListener);

	this._treeView = {};
	this._creatingFolder = false;
	this._treeViewListener = new AjxListener(this, this._treeViewSelectionListener);

	this._multiAcctOverviews = {};
	this._lastVal = "";
};

ZmChooseFolderDialog.prototype = new ZmDialog;
ZmChooseFolderDialog.prototype.constructor = ZmChooseFolderDialog;

ZmChooseFolderDialog.NEW_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmChooseFolderDialog.prototype.toString =
function() {
	return "ZmChooseFolderDialog";
};

/**
 * Since this dialog is intended for use in a variety of situations, we need to be
 * able to create different sorts of overviews based on what the calling function
 * wants. By default, we show the folder tree view.
 * 
 * @param {Hash}	params				a hash of parameters
 * @param	{Object}	params.data					a array of items, a folder, an item or <code>null</code>
 * @param	{Array}	params.treeIds				a list of trees to show
 * @param	{String}	params.overviewId			the overview ID
 * @param	{Hash}	params.omit					a list IDs to not show
 * @param	{String}	params.title					the dialog title
 * @param	{String}	params.description			the description of what the user is selecting
 * @param	{Boolean}	params.skipReadOnly		if <code>true</code>, read-only folders will not be displayed
 * @param	{Boolean}	params.skipRemote			if <code>true</code>, remote folders (mountpoints) will not be displayed
 * @param	{Boolean}	params.hideNewButton 		if <code>true</code>, new button will not be shown
 * @param	{Boolean}	params.noRootSelect			if <code>true</code>, do not make root tree item(s) selectable
 */
ZmChooseFolderDialog.prototype.popup =
function(params) {
	// use reasonable defaults
	params = params || {};

	// create an omit list for each account
	// XXX: does this need to happen more then once???
	var omitPerAcct = {};
	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];

		if (params.forceSingle && acct != appCtxt.getActiveAccount()) {
			continue;
		}

		var omit = omitPerAcct[acct.id] = params.omit || {};
		omit[ZmFolder.ID_DRAFTS] = true;
		omit[ZmFolder.ID_OUTBOX] = true;
		omit[ZmFolder.ID_SYNC_FAILURES] = true;

		var folderTree = appCtxt.getFolderTree(acct);

		// omit any folders that are read only
		if (params.skipReadOnly || params.skipRemote || appCtxt.isOffline) {
			var folders = folderTree.asList();
			for (var i = 0; i < folders.length; i++) {
				var folder = folders[i];

				// if skipping read-only,
				if (params.skipReadOnly && folder.link && folder.isReadOnly()) {
					omit[folder.id] = true;
					continue;
				}

				// if skipping remote folders,
				if (params.skipRemote && folder.isRemote()) {
					omit[folders[i].id] = true;
				}
			}
		}
	}

	this.setTitle(params.title || ZmMsg.chooseFolder);

	var descCell = document.getElementById(this._folderDescDivId);
	descCell.innerHTML = params.description || "";

	var treeIds = this._treeIds = (params.treeIds && params.treeIds.length)
		? params.treeIds : [ZmOrganizer.FOLDER];

	// New button doesn't make sense if we're only showing saved searches
	var searchOnly = (treeIds.length == 1 && treeIds[0] == ZmOrganizer.SEARCH);
	var newButton = this.getButton(ZmChooseFolderDialog.NEW_BUTTON);
	newButton.setVisible(!searchOnly && !params.hideNewButton);

	this._data = params.data;

	var omitParam = {};
	if (appCtxt.multiAccounts) {
		omitParam[ZmOrganizer.ID_ZIMLET] = true;
		omitParam[ZmOrganizer.ID_ALL_MAILBOXES] = true;
	} else {
		omitParam = omitPerAcct[appCtxt.accountList.mainAccount.id];
	}
	
	var popupParams = {
		treeIds:		treeIds,
		omit:			omitParam,
		omitPerAcct:	omitPerAcct,
		fieldId:		this._folderTreeDivId,
		overviewId:		params.overviewId,
		noRootSelect:	params.noRootSelect,
		treeStyle:		params.treeStyle || DwtTree.SINGLE_STYLE,	// we don't want checkboxes!
		appName:		params.appName,
		selectable:		false,
		forceSingle:	params.forceSingle
	};

	// make sure the requisite packages are loaded
	var treeIdMap = {};
	for (var i = 0; i < treeIds.length; i++) {
		treeIdMap[treeIds[i]] = true;
	}

	// TODO: Refactor packages so that we don't have to bring in so much
	// TODO: code just do make sure this dialog works.
	// TODO: I opened bug 34447 for this performance enhancement.
	var pkg = [];
	if (treeIdMap[ZmOrganizer.BRIEFCASE]) pkg.push("BriefcaseCore","Briefcase");
	if (treeIdMap[ZmOrganizer.CALENDAR]) pkg.push("CalendarCore","Calendar");
	if (treeIdMap[ZmOrganizer.ADDRBOOK]) pkg.push("ContactsCore","Contacts");
	if (treeIdMap[ZmOrganizer.FOLDER]) pkg.push("MailCore","Mail");
	if (treeIdMap[ZmOrganizer.NOTEBOOK]) pkg.push("NotebookCore","Notebook");
	if (treeIdMap[ZmOrganizer.TASKS]) pkg.push("TasksCore","Tasks");
	
	AjxDispatcher.require(pkg, true, new AjxCallback(this, this._doPopup, [popupParams]));
};

ZmChooseFolderDialog.prototype._doPopup =
function(params) {
	var ov = this._setOverview(params, params.forceSingle);

	if (appCtxt.multiAccounts && !params.forceSingle) {
		// ov is an overview container, and overviewId is the containerId
		this._multiAcctOverviews[params.overviewId] = ov;
		for (var i in this._multiAcctOverviews) {
			this._multiAcctOverviews[i].setVisible(i == params.overviewId);
		}

		var overviews = ov.getOverviews();
		for (var i in overviews) {
			var overview = overviews[i];
			this._resetTree(params.treeIds, overview);
		}

		ov.expandAccountOnly(appCtxt.getActiveAccount());

	} else {
		this._resetTree(params.treeIds, ov);
	}

	this._focusElement = this._inputField;
	this._inputField.setValue("");
	ZmDialog.prototype.popup.call(this);
};

ZmChooseFolderDialog.prototype.getOverviewId =
function(part) {
	return appCtxt.getOverviewId([this.toString(), part], null);
};

ZmChooseFolderDialog.prototype._resetTree =
function(treeIds, overview) {

	var account = overview.account || appCtxt.getActiveAccount() || appCtxt.accountList.mainAccount;
	var acctTreeView = this._treeView[account.id] = {};
	var folderTree = appCtxt.getFolderTree(account);

	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = acctTreeView[treeId] = overview.getTreeView(treeId, true);
		if (!treeView) { continue; }

		// bug #18533 - always make sure header item is visible in "MoveTo" dialog
		treeView.getHeaderItem().setVisible(true, true);

		// expand root item
		var ti = treeView.getTreeItemById(folderTree.root.id);
		ti.setExpanded(true);

		// bug fix #13159 (regression of #10676)
		// - small hack to get selecting Trash folder working again
		var trashId = ZmOrganizer.getSystemId(ZmOrganizer.ID_TRASH, account);
		var ti = treeView.getTreeItemById(trashId);
		if (ti) {
			ti.setData(ZmTreeView.KEY_TYPE, treeId);
		}

		treeView.removeSelectionListener(this._treeViewListener);
		treeView.addSelectionListener(this._treeViewListener);
	}

	folderTree.removeChangeListener(this._changeListener);
	// this listener has to be added after folder tree view is set
	// (so that it comes after the view's standard change listener)
	folderTree.addChangeListener(this._changeListener);

	this._loadFolders();
	this._resetTreeView(true);
};

ZmChooseFolderDialog.prototype.reset =
function() {
	var descCell = document.getElementById(this._folderDescDivId);
	descCell.innerHTML = "";
	ZmDialog.prototype.reset.call(this);
	this._data = this._treeIds = null;
	this._creatingFolder = false;
};

ZmChooseFolderDialog.prototype._contentHtml =
function() {
	this._inputDivId = this._htmlElId + "_inputDivId";
	this._folderDescDivId = this._htmlElId + "_folderDescDivId";
	this._folderTreeDivId = this._htmlElId + "_folderTreeDivId";

	return AjxTemplate.expand("share.Widgets#ZmChooseFolderDialog", {id:this._htmlElId});
};

ZmChooseFolderDialog.prototype._createControls =
function() {
	this._inputField = new DwtInputField({parent: this});
	document.getElementById(this._inputDivId).appendChild(this._inputField.getHtmlElement());
	this._inputField.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
};

ZmChooseFolderDialog.prototype._showNewDialog =
function() {
	var item = this._getOverview().getSelected(true);
	var newType = (item && item.type) || this._treeIds[0];
	var ftc = this._opc.getTreeController(newType);
	var dialog = ftc._getNewDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this, [ftc, dialog]);
	dialog.popup();
};

ZmChooseFolderDialog.prototype._newCallback =
function(ftc, dialog, params) {
	ftc._doCreate(params);
	dialog.popdown();
	this._creatingFolder = true;
};

ZmChooseFolderDialog.prototype._folderTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE && this._creatingFolder) {
		var organizers = ev.getDetail("organizers") || (ev.source && [ev.source]);
		var org = organizers[0];
		var tv = this._treeView[org.getAccount().id][org.type];
		tv.setSelected(organizers[0], true);
		this._creatingFolder = false;
	}
	this._loadFolders();
};

ZmChooseFolderDialog.prototype._okButtonListener =
function(ev) {
	var tgtFolder = this._getOverview().getSelected();
	var folderList = (tgtFolder && (!(tgtFolder instanceof Array)))
		? [tgtFolder] : tgtFolder;

	var msg = (!folderList || (folderList && folderList.length == 0))
		? ZmMsg.noTargetFolder : null;

	// check for valid target
	if (!msg && this._data) {
		for (var i = 0; i < folderList.length; i++) {
			var folder = folderList[i];
			if (folder.mayContain && !folder.mayContain(this._data)) {
				msg = (this._data instanceof ZmFolder)
					? ZmMsg.badTargetFolder
					: ZmMsg.badTargetFolderItems;
				break;
			}
		}
	}

	if (msg) {
		this._showError(msg);
	} else {
		DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
	}
};

ZmChooseFolderDialog.prototype._getTabGroupMembers =
function() {
	return [this._inputField, this._overview[this._curOverviewId]];
};

ZmChooseFolderDialog.prototype._loadFolders =
function() {
	this._folders = [];

	for (var accountId in this._treeView) {
		var treeViews = this._treeView[accountId];

		for (var type in treeViews) {
			var treeView = treeViews[type];
			if (!treeView) { continue; }

			var items = treeView.getTreeItemList();
			for (var i = 0, len = items.length; i < len; i++) {
				var ti = items[i];
				if (ti.getData) {
					var folder = items[i].getData(Dwt.KEY_OBJECT);
					if (folder && (folder.nId != ZmOrganizer.ID_ROOT)) {
						var name = folder.getName(false, null, true, true).toLowerCase();
						var path = "/" + folder.getPath(false, false, null, true).toLowerCase();
						this._folders.push({id:folder.id, type:type, name:name, path:path, accountId:accountId});
					}
				}
			}
		}
	}
};

ZmChooseFolderDialog.prototype._handleKeyUp =
function(ev) {

	var key = DwtKeyEvent.getCharCode(ev);
	if (key == 9) {
		return;
	} else if (key == 40) {
		this._overview[this._curOverviewId].focus();
		return;
	}

	var num = 0, firstMatch, matches = [];
	var value = this._inputField.getValue().toLowerCase();
	if (value == this._lastVal) { return; }
	for (var i = 0, len = this._folders.length; i < len; i++) {
		var folderInfo = this._folders[i];
		var treeView = this._treeView[folderInfo.accountId][folderInfo.type];
		var ti = treeView.getTreeItemById(folderInfo.id);
		if (ti) {
			var testPath = "/" + value.replace(/^\//, "");
			var path = folderInfo.path;
			if (folderInfo.name.indexOf(value) == 0 ||
				(path.indexOf(testPath) == 0 && (path.substr(testPath.length).indexOf("/") == -1))) {

				matches.push(ti);
				if (!firstMatch) {
					firstMatch = folderInfo;
				}
			}
		}
	}

	// now that we know which folders match, hide all items and then show
	// the matches, expanding their parent chains as needed
	this._resetTreeView(false);
	for (var i = 0, len = matches.length; i < len; i++) {
		var ti = matches[i];
		ti._tree._expandUp(ti);
		ti.setVisible(true);
	}

	if (firstMatch) {
		var tv = this._treeView[firstMatch.accountId][firstMatch.type];
		tv.setSelected(appCtxt.getById(firstMatch.id), true, true);
	}
	this._lastVal = value;
};

ZmChooseFolderDialog.prototype._resetTreeView =
function(visible) {
	for (var i = 0, len = this._folders.length; i < len; i++) {
		var folderInfo = this._folders[i];
		var tv = this._treeView[folderInfo.accountId][folderInfo.type];
		var ti = tv.getTreeItemById(folderInfo.id);
		if (ti) {
			ti.setVisible(visible);
			ti.setChecked(false, true);
		}
	}
};

ZmChooseFolderDialog.prototype._getOverview =
function() {
	var ov;
	if (appCtxt.multiAccounts) {
		ov = this._opc.getOverviewContainer(this._curOverviewId);
	}

	// this covers the case where we're in multi-account mode, but dialog was
	// popped up in "forceSingle" mode
	return (ov || ZmDialog.prototype._getOverview.call(this));
};

ZmChooseFolderDialog.prototype._treeViewSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_SELECTED &&
		ev.detail != DwtTree.ITEM_DBL_CLICKED)
	{
		return;
	}

	if (this._getOverview() instanceof ZmAccountOverviewContainer) {
		if (ev.detail == DwtTree.ITEM_DBL_CLICKED &&
			ev.item instanceof DwtHeaderTreeItem)
		{
			return;
		}

		var oc = this._opc.getOverviewContainer(this._curOverviewId);
		var overview = oc.getOverview(ev.item.getData(ZmTreeView.KEY_ID));
		oc.deselectAll(overview);
	}

	var organizer = ev.item && ev.item.getData(Dwt.KEY_OBJECT);
	var value = organizer ? organizer.getName(null, null, true) : ev.item.getText();
	this._inputField.setValue(value);
	this._lastVal = value.toLowerCase();
	if (ev.detail == DwtTree.ITEM_DBL_CLICKED) {
		this._okButtonListener();
	}
};

ZmChooseFolderDialog.prototype._enterListener =
function(ev) {
	this._okButtonListener.call(this, ev);
};
