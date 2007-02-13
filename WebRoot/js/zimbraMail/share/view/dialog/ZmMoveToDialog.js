/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * This singleton class present a dialog with various trees so that the
 * user can choose a folder as a move target.
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

/**
 * @param data		[object]	Array of items, a folder, an item, or null
 * @param treeIds	[array]		List of trees to show
 * @param omit		[hash]		IDs to not show
 * @param orgType	[constant]	Primary tree type
 */
ZmMoveToDialog.prototype.popup =
function(params) {
	params = params || {};
	var omit = params.omit || {};
	omit[ZmFolder.ID_DRAFTS] = true;
	var treeIds = (params.treeIds && params.treeIds.length) ? params.treeIds : [ZmOrganizer.FOLDER];
	
	// New button doesn't make sense if we're only showing saved searches
	var newButton = this.getButton(ZmMoveToDialog.NEW_BUTTON);
	var searchOnly = (treeIds.length == 1 && treeIds[0] == ZmOrganizer.SEARCH);
	newButton.setVisible(!searchOnly);

	this._data = params.data;
	
	// clear overview if we're displaying different series of trees
	var treeIdString = treeIds.join("|");
	if (this._treeIdString && (treeIdString != this._treeIdString)) {
		this._opc.clearOverview(ZmMoveToDialog._OVERVIEW_ID);
	}
	this._treeIdString = treeIdString;
	this._renderOverview(ZmMoveToDialog._OVERVIEW_ID, treeIds, omit);

	this._orgType = params.orgType || treeIds[0];
	this._folderTreeView = this._treeView[this._orgType];

	// bug fix #13159 (regression of #10676)
	// - small hack to get selecting Trash folder working again
	if (this._folderTreeView) {
		var ti = this._folderTreeView.getTreeItemById(ZmOrganizer.ID_TRASH);
		if (ti) {
			ti.setData(ZmTreeView.KEY_TYPE, this._orgType);
		}
	}

	var folderTree = this._appCtxt.getFolderTree();
	folderTree.removeChangeListener(this._changeListener);
	// this listener has to be added after folder tree view is set
	// (so that it comes after the view's standard change listener)
	folderTree.addChangeListener(this._changeListener);

	ZmDialog.prototype.popup.call(this);
	
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._treeView[treeId] = this._opc.getTreeView(ZmMoveToDialog._OVERVIEW_ID, treeId);
		var tree = this._opc.getTreeData(treeId);
		var ti = treeView.getTreeItemById(tree.root.id);
		ti.setExpanded(true);
		if (this._data && (treeId == this._data.type)) {
			treeView.setSelected(tree.root);
		}
	}
};

ZmMoveToDialog.prototype.reset =
function() {
	ZmDialog.prototype.reset.call(this);
	this._data = this._orgType = this._folderTreeView = null;
	this._creatingFolder = false;
};

ZmMoveToDialog.prototype._contentHtml =
function() {
	this._folderTreeCellId = Dwt.getNextId();
	var html = [];
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
	var ftc = this._opc.getTreeController(this._orgType);
	var dialog = ftc._getNewDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup();
};

ZmMoveToDialog.prototype._newCallback =
function(params) {
	var ftc = this._opc.getTreeController(this._orgType);
	ftc._doCreate(params);
	var dialog = ftc._getNewDialog();
	dialog.popdown();
	this._creatingFolder = true;
};

ZmMoveToDialog.prototype._folderTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_CREATE && this._creatingFolder) {
		var organizers = ev.getDetail("organizers");
		if (!organizers && ev.source) {
			organizers = [ev.source];
		}
		this._folderTreeView.setSelected(organizers[0], true);
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
