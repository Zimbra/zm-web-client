/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
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

function ZmChooseFolderDialog(parent, className) {
    var newButton = new DwtDialog_ButtonDescriptor(ZmChooseFolderDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	ZmDialog.call(this, parent, null, className, ZmMsg.chooseFolder, [newButton]);

	this._createOverview(ZmChooseFolderDialog._OVERVIEW_ID, this._folderTreeCellId);

    this.registerCallback(ZmChooseFolderDialog.NEW_BUTTON, this._showNewDialog, this);
    this._changeListener = new AjxListener(this, this._folderTreeChangeListener);

    this._creatingFolder = false;
};

ZmChooseFolderDialog.prototype = new ZmDialog;
ZmChooseFolderDialog.prototype.constructor = ZmChooseFolderDialog;

ZmChooseFolderDialog._OVERVIEW_ID = "ZmChooseFolderDialog";

ZmChooseFolderDialog.NEW_BUTTON = ++DwtDialog.LAST_BUTTON;

// Public Methods

ZmChooseFolderDialog.prototype.toString =
function() {
	return "ZmChooseFolderDialog";
};

/**
* @param 	treeIds			[Array] 	Id's from overview's tree view's
* @param	omit			[Hash]		Id's to omit in tree view
* @param	skipReadOnly	[Boolean] 	Set true if you dont want to show read only folders
* @param	description		[String]	Description of what the user is selecting
*/
ZmChooseFolderDialog.prototype.popup =
function(treeIds, omit, skipReadOnly, description) {
	if (skipReadOnly) {
		for (var j = 0; j < treeIds.length; j++) {
			// remove any addrbooks that are read only
			var folders = this._appCtxt.getTree(treeIds[j]).asList();

			for (var i = 0; i < folders.length; i++) {
				var folder = folders[i];
				if (folder.link && folder.isReadOnly())
					omit[folder.id] = true;
			}
		}
	}

	if (description) {
		var descCell = document.getElementById(this._folderDescCellId);
		descCell.innerHTML = description;
	}

	this._renderOverview(ZmChooseFolderDialog._OVERVIEW_ID, treeIds, omit);

	ZmDialog.prototype.popup.call(this);

    for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
        var treeView = this._treeView[treeId] = this._opc.getTreeView(ZmChooseFolderDialog._OVERVIEW_ID, treeId);
		var tree = this._opc.getTreeData(treeId);
		var ti = treeView.getTreeItemById(tree.root.id);
		ti.setExpanded(true);
		if (this._folder && treeId == this._folder.type)
			treeView.setSelected(tree.root);

        tree.removeChangeListener(this._changeListener);
        // this listener has to be added after folder tree view is set
        // (so that it comes after the view's standard change listener)
        tree.addChangeListener(this._changeListener);
	}
};

ZmChooseFolderDialog.prototype.reset =
function() {
	var descCell = document.getElementById(this._folderDescCellId);
	descCell.innerHTML = "";

	this._opc.clearOverview();

	ZmDialog.prototype.reset.call(this);
};

ZmChooseFolderDialog.prototype._contentHtml =
function() {
	this._folderDescCellId = Dwt.getNextId();
	this._folderTreeCellId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	html[idx++] = "<tr><td class='Label' colspan=2 id='";
	html[idx++] = this._folderDescCellId;
	html[idx++] = "'></td></tr><tr><td colspan=2 id='";
	html[idx++] = this._folderTreeCellId;
	html[idx++] = "'/></tr></table>";

	return html.join("");
};

ZmChooseFolderDialog.prototype._okButtonListener =
function(ev) {
	var tgtFolder = this._opc.getSelected(ZmChooseFolderDialog._OVERVIEW_ID);
	DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
};

ZmChooseFolderDialog.prototype._showNewDialog =
function() {
    // REVISIT: Set the type based on the currently selected folder item.
    var type = ZmOrganizer.FOLDER;
    var dialog = type == ZmOrganizer.ADDRBOOK
		? this._appCtxt.getNewAddrBookDialog()
		: this._appCtxt.getNewFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);

    var folder = this._treeView[type].getSelected();
    dialog.popup(folder, this);
};

ZmChooseFolderDialog.prototype._newCallback =
function(parent, name) {
    var type = parent.type;
    var ftc = this._opc.getTreeController(type);
	ftc._doCreate(parent, name);
	var dialog = type == ZmOrganizer.ADDRBOOK
		? this._appCtxt.getNewAddrBookDialog()
		: this._appCtxt.getNewFolderDialog();
	dialog.popdown();
	this._creatingFolder = true;
};

ZmChooseFolderDialog.prototype._folderTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE && this._creatingFolder) {
        var treeView = this._treeView[ev.source.type];
        var organizer = ev.getDetail("organizers")[0];
        treeView.setSelected(organizer, true);
		this._creatingFolder = false;
	}
};
