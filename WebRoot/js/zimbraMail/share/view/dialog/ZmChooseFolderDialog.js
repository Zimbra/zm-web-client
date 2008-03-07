/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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

//	this._createOverview(this._folderTreeCellId);

	this.registerCallback(ZmChooseFolderDialog.NEW_BUTTON, this._showNewDialog, this);
	this._changeListener = new AjxListener(this, this._folderTreeChangeListener);

	this._creatingFolder = false;
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
 * @param params		[hash]*		hash of params:
 *        data			[object]	array of items, a folder, an item, or null
 *        treeIds		[array]		list of trees to show
 *        overviewId	[string]*	ID to use as base for overview ID
 *        omit			[hash]*		IDs to not show
 *        noSelect		[hash]*		IDs to disable selection for
 *        title			[string]*	dialog title
 *        description	[string]*	description of what the user is selecting
 *        skipReadOnly	[boolean]* 	if true, read-only folders will not be displayed
 *        hideNewButton [boolean]*	if true, New button will not be shown
 *        orgType		[constant]*	primary tree type
 *        noRootSelect	[boolean]*	if true, don't make root tree item(s) selectable
 */
ZmChooseFolderDialog.prototype.popup =
function(params) {
	// use reasonable defaults
	params = params || {};
	var omit = params.omit || {};
	omit[ZmFolder.ID_DRAFTS] = true;
	omit[ZmFolder.ID_OUTBOX] = true;
	var treeIds = (params.treeIds && params.treeIds.length) ? params.treeIds : [ZmOrganizer.FOLDER];
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

	this.setTitle(params.title || ZmMsg.chooseFolder);

	if (params.description) {
		var descCell = document.getElementById(this._folderDescCellId);
		descCell.innerHTML = params.description;
	}

	// New button doesn't make sense if we're only showing saved searches
	var newButton = this.getButton(ZmChooseFolderDialog.NEW_BUTTON);
	var searchOnly = (treeIds.length == 1 && treeIds[0] == ZmOrganizer.SEARCH);
	newButton.setVisible(!searchOnly && !params.hideNewButton);

	this._data = params.data;
	
	// use an overview ID that comprises calling class, this class, and current account
	var base = [this.toString(), params.overviewId].join("-");
	var overviewId = appCtxt.multiAccounts ? [base, appCtxt.getActiveAccount().name].join(":") : base;
	this._setOverview({treeIds:treeIds, omit:omit, fieldId:this._folderTreeCellId,
					   overviewId:overviewId, noRootSelect:params.noRootSelect});

	this._orgType = params.orgType || treeIds[0];
	this._folderTreeView = this._getOverview().getTreeView(this._orgType);

	if (this._folderTreeView) {
		// bug #18533 - always make sure header item is visible in "MoveTo" dialog
		this._folderTreeView.getHeaderItem().setVisible(true, true);

		// remove checkboxes if treeview has them as re-enable selection
		this._folderTreeView.showCheckboxes(false);

		// bug fix #13159 (regression of #10676)
		// - small hack to get selecting Trash folder working again
		var ti = this._folderTreeView.getTreeItemById(ZmOrganizer.ID_TRASH);
		if (ti) {
			ti.setData(ZmTreeView.KEY_TYPE, this._orgType);
		}
	}

	folderTree.removeChangeListener(this._changeListener);
	// this listener has to be added after folder tree view is set
	// (so that it comes after the view's standard change listener)
	folderTree.addChangeListener(this._changeListener);

	ZmDialog.prototype.popup.call(this);
	
	// expand tree views, select current organizer if any
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._getOverview().getTreeView(treeId);
		var ti = treeView.getTreeItemById(folderTree.root.id);
		ti.setExpanded(true);
		if (this._data && (treeId == this._data.type)) {
			treeView.setSelected(folderTree.root);
		}
	}
};

ZmChooseFolderDialog.prototype.popdown =
function() {
	if (this._folderTreeView) {
		// re-add checkboxes if treeview has them and re-enable selection
		this._folderTreeView.showCheckboxes(true);
	}

	DwtDialog.prototype.popdown.call(this);
};

ZmChooseFolderDialog.prototype.reset =
function() {
	var descCell = document.getElementById(this._folderDescCellId);
	descCell.innerHTML = "";
	ZmDialog.prototype.reset.call(this);
	this._data = this._orgType = this._folderTreeView = null;
	this._creatingFolder = false;
};

ZmChooseFolderDialog.prototype._contentHtml =
function() {
	this._folderDescCellId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();
	var html = [];
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	html[idx++] = "<tr><td class='Label' colspan=2 id='";
	html[idx++] = this._folderDescCellId;
	html[idx++] = "'></td></tr><tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr></table>";
	
	return html.join("");
};

ZmChooseFolderDialog.prototype._showNewDialog =
function() {
	var ftc = this._opc.getTreeController(this._orgType);
	var dialog = ftc._getNewDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup();
};

ZmChooseFolderDialog.prototype._newCallback =
function(params) {
	var ftc = this._opc.getTreeController(this._orgType);
	ftc._doCreate(params);
	var dialog = ftc._getNewDialog();
	dialog.popdown();
	this._creatingFolder = true;
};

ZmChooseFolderDialog.prototype._folderTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE && this._creatingFolder) {
		var organizers = ev.getDetail("organizers");
		if (!organizers && ev.source) {
			organizers = [ev.source];
		}
		this._folderTreeView.setSelected(organizers[0], true);
		this._folderTreeView.showCheckboxes(false);
		this._creatingFolder = false;
	}
};

ZmChooseFolderDialog.prototype._okButtonListener =
function(ev) {
	var msg;
	var tgtFolder = this._getOverview().getSelected();
	if (!tgtFolder) {
		msg = ZmMsg.noTargetFolder;
	}

	// check for valid target
	if (!msg && this._data && !tgtFolder.mayContain(this._data)) {
	    msg = (this._data instanceof ZmFolder) ? ZmMsg.badTargetFolder : ZmMsg.badTargetFolderItems;
	}

	if (msg) {
		this._showError(msg);
	} else {
		DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
	}
};
