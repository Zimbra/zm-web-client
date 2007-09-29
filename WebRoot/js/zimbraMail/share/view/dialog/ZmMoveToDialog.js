/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

function ZmMoveToDialog(parent, msgDialog, className) {
	var newButton = new DwtDialog_ButtonDescriptor(ZmMoveToDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.move, [newButton]);

	this._createOverview(ZmMoveToDialog._OVERVIEW_ID, this._folderTreeCellId);

	this.registerCallback(ZmMoveToDialog.NEW_BUTTON, this._showNewDialog, this);
	this._changeListener = new AjxListener(this, this._folderTreeChangeListener);

	this._creatingFolder = false;
};

ZmMoveToDialog._OVERVIEW_ID = "ZmMoveToFolderDialog";

ZmMoveToDialog.prototype = new ZmDialog;
ZmMoveToDialog.prototype.constructor = ZmMoveToDialog;

ZmMoveToDialog.NEW_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmMoveToDialog.prototype.toString = 
function() {
	return "ZmMoveToDialog";
};

ZmMoveToDialog.prototype.popup =
function(data, loc, treeIds, clearOverview) {
	var omit = {};
	omit[ZmFolder.ID_DRAFTS] = true;
	treeIds = treeIds ? treeIds : [ZmOrganizer.FOLDER];
	
	// New button doesn't make sense if we're only showing saved searches
	var newButton = this.getButton(ZmMoveToDialog.NEW_BUTTON);
	var searchOnly = (treeIds.length == 1 && treeIds[0] == ZmOrganizer.SEARCH);
	newButton.setVisible(!searchOnly);

	// contacts have their own tree view so find out what kind of data we're dealing with
	var item = (data instanceof Array) ? data[0] : null;
	this._isContact = item && (item instanceof ZmContact);

	if (data instanceof ZmSearchFolder) {
		this._folder = data;
		omit[ZmFolder.ID_SPAM] = true;
		treeIds = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH];
	} else if (data instanceof ZmFolder) {
		this._folder = data;
		omit[ZmFolder.ID_SPAM] = true;
	} else if (this._isContact) {
		treeIds = [ZmOrganizer.ADDRBOOK];

		// remove any addrbooks that are read only
		var folders = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).asList();

		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			if (folder.link && folder.isReadOnly()) {
				omit[folder.id] = true;
			}
		}
		this._items = data;
	} else {
		this._items = data;
	}

	if (clearOverview) {
		this._opc.clearOverview(ZmMoveToDialog._OVERVIEW_ID);
	}
	this._renderOverview(ZmMoveToDialog._OVERVIEW_ID, treeIds, omit);

	var folderTree = null;
	if (this._isContact) {
		this._folderTreeView = this._treeView[ZmOrganizer.ADDRBOOK];
		folderTree = this._opc.getTreeData(ZmOrganizer.ADDRBOOK);
	} else {
		this._folderTreeView = this._treeView[ZmOrganizer.FOLDER];
		folderTree = this._opc.getTreeData(ZmOrganizer.FOLDER);
	}

	// bug fix #13159 (regression of #10676)
	// - small hack to get selecting Trash folder working again
	if (this._folderTreeView) {
		var ti = this._folderTreeView.getTreeItemById(ZmOrganizer.ID_TRASH);
		if (ti) {
			ti.setData(ZmTreeView.KEY_TYPE, this._isContact ? ZmItem.CONTACT : ZmOrganizer.FOLDER);
		}
	}

	if (folderTree) {
		folderTree.removeChangeListener(this._changeListener);
		// this listener has to be added after folder tree view is set
		// (so that it comes after the view's standard change listener)
		folderTree.addChangeListener(this._changeListener);
	}

	ZmDialog.prototype.popup.call(this, loc);
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._treeView[treeId] = this._opc.getTreeView(ZmMoveToDialog._OVERVIEW_ID, treeId);
		var tree = this._opc.getTreeData(treeId);
		var ti = treeView.getTreeItemById(tree.root.id);
		ti.setExpanded(true);
		if (this._folder && treeId == this._folder.type) {
			treeView.setSelected(tree.root);
		}
	}
};

ZmMoveToDialog.prototype.reset =
function() {
	ZmDialog.prototype.reset.call(this);
	this._folder = this._items = null;
	this._folderTreeView = null;
};

ZmMoveToDialog.prototype._contentHtml =
function() {
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	html[idx++] = "<tr><td class='Label' colspan=2>";
	html[idx++] = ZmMsg.targetFolder;
	html[idx++] = ":</td></tr><tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr></table>";
	
	return html.join("");
};

ZmMoveToDialog.prototype._showNewDialog =
function() {
	var dialog = this._isContact 
		? this._appCtxt.getNewAddrBookDialog()
		: this._appCtxt.getNewFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup(null, this);
};

ZmMoveToDialog.prototype._newCallback =
function(parent, name) {
	var org = this._isContact ? ZmOrganizer.ADDRBOOK : ZmOrganizer.FOLDER;
	var ftc = this._opc.getTreeController(org);
	ftc._doCreate(parent, name);
	var dialog = this._isContact
		? this._appCtxt.getNewAddrBookDialog()
		: this._appCtxt.getNewFolderDialog();
	dialog.popdown();
	this._creatingFolder = true;
};

ZmMoveToDialog.prototype._folderTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE && this._creatingFolder) {
		this._folderTreeView.setSelected(ev.source, true);
		this._creatingFolder = false;
	}
};

ZmMoveToDialog.prototype._okButtonListener =
function(ev) {
	var msg;
	var tgtFolder = this._opc.getSelected(ZmMoveToDialog._OVERVIEW_ID);
	if (!tgtFolder) {
		msg = ZmMsg.noTargetFolder;
	}

	// moving a folder, check for valid target
	if (!msg && this._folder &&	!tgtFolder.mayContain(this._folder)) {
	    msg = ZmMsg.badTargetFolder;
	}

	// moving items, check for valid target
	if (!msg && this._items && !tgtFolder.mayContain(this._items)) {
		msg = ZmMsg.badTargetFolderItems;
	}

	if (msg) {
		this._showError(msg);
	} else {
		DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
	}
};
