/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009 Zimbra, Inc.
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
 * This singleton class presents a dialog with various trees so that the
 * user can choose a folder.
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
 * @param params				[hash]*			hash of params:
 *        data					[object]		array of items, a folder, an item, or null
 *        treeIds				[array]			list of trees to show
 *        overviewId			[string]*		ID to use as base for overview ID
 *        omit					[hash]*			IDs to not show
 *        title					[string]*		dialog title
 *        description			[string]*		description of what the user is selecting
 *        skipReadOnly			[boolean]* 		if true, read-only folders will not be displayed
 *        skipRemote			[boolean]*		if true, remote folders (mountpoints) will not be displayed
 *        skipSyncFailureSubs	[boolean]*		if true, don't show "Local Folders"
 *        hideNewButton 		[boolean]*		if true, New button will not be shown
 *        noRootSelect			[boolean]*		if true, don't make root tree item(s) selectable
 */
ZmChooseFolderDialog.prototype.popup =
function(params) {
	// use reasonable defaults
	params = params || {};
	var omit = params.omit || {};
	omit[ZmFolder.ID_DRAFTS] = true;
	omit[ZmFolder.ID_OUTBOX] = true;
	omit[ZmFolder.ID_SYNC_FAILURES] = true;
	var treeIds = this._treeIds = (params.treeIds && params.treeIds.length) ? params.treeIds : [ZmOrganizer.FOLDER];
	var folderTree = appCtxt.getFolderTree();

	if (params.skipReadOnly) {
		// omit any folders that are read only
		var folders = folderTree.asList();
		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			if (folder.link && folder.isReadOnly()) {
				omit[folder.id] = true;
			}
		}
	}

	if (params.skipRemote) {
		var folders = folderTree.asList({remoteOnly:true});
		for (var i = 0; i < folders.length; i++) {
			omit[folders[i].id] = true;
		}
	}

	if (appCtxt.isOffline && params.skipSyncFailureSubs) {
		// omit any folders that are under "Local Folders" if applicable
		var folders = folderTree.asList();
		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			if (folder.isUnder(ZmOrganizer.ID_ARCHIVE)) {
				omit[folder.nId] = true;
			}
		}
	}

	this.setTitle(params.title || ZmMsg.chooseFolder);

	if (params.description) {
		var descCell = document.getElementById(this._folderDescDivId);
		descCell.innerHTML = params.description;
	}

	// New button doesn't make sense if we're only showing saved searches
	var newButton = this.getButton(ZmChooseFolderDialog.NEW_BUTTON);
	var searchOnly = (treeIds.length == 1 && treeIds[0] == ZmOrganizer.SEARCH);
	newButton.setVisible(!searchOnly && !params.hideNewButton);

	this._data = params.data;
	
	// use an overview ID that comprises calling class, this class, and current account
	var base = [this.toString(), params.overviewId].join("-");
	var acct = appCtxt.getActiveAccount();
	var params = {
		treeIds: treeIds,
		omit: omit,
		fieldId: this._folderTreeDivId,
		overviewId: (appCtxt.multiAccounts) ? ([base, acct.name].join(":")) : base,
		noRootSelect: params.noRootSelect,
		account: acct,
		treeStyle: params.treeStyle || DwtTree.SINGLE_STYLE		// we don't want checkboxes!
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
	
	AjxDispatcher.require(pkg, true, new AjxCallback(this, this._doPopup, [params, treeIds, folderTree]));
};

ZmChooseFolderDialog.prototype._doPopup =
function(params, treeIds, folderTree) {

	this._setOverview(params);

	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._treeView[treeId] = this._getOverview().getTreeView(treeId, true);

		// bug #18533 - always make sure header item is visible in "MoveTo" dialog
		treeView.getHeaderItem().setVisible(true, true);

		// expand root item
		var ti = treeView.getTreeItemById(folderTree.root.id);
		ti.setExpanded(true);

		// bug fix #13159 (regression of #10676)
		// - small hack to get selecting Trash folder working again
		var trashId = ZmOrganizer.getSystemId(ZmOrganizer.ID_TRASH);
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
	ZmDialog.prototype.popup.call(this);
	this._inputField.setValue("");
	this._inputField.focus();
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
	var newType = this._getOverview().getSelected(true) || this._treeIds[0];
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
		this._treeView[org.type].setSelected(organizers[0], true);
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
	for (var type in this._treeView) {
		var treeView = this._treeView[type];
		var items = treeView.getTreeItemList();
		for (var i = 0, len = items.length; i < len; i++) {
			var ti = items[i];
			if (ti.getData) {
				var folder = items[i].getData(Dwt.KEY_OBJECT);
				if (folder && (folder.id != ZmOrganizer.ID_ROOT)) {
					var name = folder.getName(false, null, true, true).toLowerCase();
					var path = "/" + folder.getPath(false, false, null, true).toLowerCase();
					this._folders.push({id:folder.id, type:type, name:name, path:path});
				}
			}
		}
	}
};

ZmChooseFolderDialog.prototype._handleKeyUp =
function(ev) {

	var num = 0, firstMatch, matches = [];
	var value = this._inputField.getValue().toLowerCase();
	if (value == this._lastVal) { return; }
	for (var i = 0, len = this._folders.length; i < len; i++) {
		var folderInfo = this._folders[i];
		var treeView = this._treeView[folderInfo.type];
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
		this._treeView[firstMatch.type].setSelected(appCtxt.getById(firstMatch.id), true, true);
	}
	this._lastVal = value;
};

ZmChooseFolderDialog.prototype._resetTreeView =
function(visible) {
	for (var i = 0, len = this._folders.length; i < len; i++) {
		var folderInfo = this._folders[i];
		var ti = this._treeView[folderInfo.type].getTreeItemById(folderInfo.id);
		if (ti) {
			ti.setVisible(visible);
		}
	}
};

ZmChooseFolderDialog.prototype._treeViewSelectionListener =
function(ev) {

	if (ev.detail != DwtTree.ITEM_SELECTED)	{ return; }

	var folder = ev.item.getData(Dwt.KEY_OBJECT);
	if (folder) {
		var value = this._lastVal = folder.getName(false, null, true, true);
		this._inputField.setValue(value);
	}
};

ZmChooseFolderDialog.prototype._enterListener =
function(ev) {
	this._okButtonListener.call(this, ev);
};
