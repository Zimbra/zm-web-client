/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmMoveToDialog(parent, msgDialog, className) {
	var newButton = new DwtDialog_ButtonDescriptor(ZmMoveToDialog.NEW_BUTTON, ZmMsg._new, DwtDialog.ALIGN_LEFT);
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.move, [newButton]);

	this.setContent(this._contentHtml());
	this._createOverview(ZmMoveToDialog._OVERVIEW_ID, this._folderTreeCellId);
	DBG.timePt("setting content");

	this.registerCallback(ZmMoveToDialog.NEW_BUTTON, this._showNewDialog, this);
	this._changeListener = new AjxListener(this, this._folderTreeChangeListener);

	this._creatingFolder = false;
	DBG.timePt("done");
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
function(data, loc) {
	var omit = new Object();
	omit[ZmFolder.ID_DRAFTS] = true;
	var treeIds = [ZmOrganizer.FOLDER];
	if (data instanceof ZmSearchFolder) {
		this._folder = data;
		treeIds = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH];
	} else if (data instanceof ZmFolder) {
		this._folder = data;
		omit[ZmFolder.ID_SPAM] = true;
	} else {
		this._items = data;
	}

	this._renderOverview(ZmMoveToDialog._OVERVIEW_ID, treeIds, omit);
	this._folderTreeView = this._treeView[ZmOrganizer.FOLDER];
	var folderTree = this._opc.getTreeData(ZmOrganizer.FOLDER);
	folderTree.removeChangeListener(this._changeListener);
	// this listener has to be added after folder tree view is set
	// (so that it comes after the view's standard change listener)
	folderTree.addChangeListener(this._changeListener);
	DBG.timePt("render and register listeners", true);

	ZmDialog.prototype.popup.call(this, loc);
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var treeView = this._treeView[treeId] = this._opc.getTreeView(ZmMoveToDialog._OVERVIEW_ID, treeId);
		var tree = this._opc.getTreeData(treeId);
		var ti = treeView.getTreeItemById(tree.root.id);
		ti.setExpanded(true);
		if (this._folder && treeId == this._folder.type)
			treeView.setSelected(tree.root);
	}
	DBG.timePt("expanded and selected");
};

ZmMoveToDialog.prototype._contentHtml = 
function() {
	this._folderTreeCellId = Dwt.getNextId();
	var html = new Array();
	var idx = 0;
	html[idx++] = "<table cellpadding='0' cellspacing='0' border='0'>";
	html[idx++] = "<tr><td class='Label' colspan=2>" + ZmMsg.targetFolder + ":</td></tr>";
	html[idx++] = "<tr><td colspan=2 id='" + this._folderTreeCellId + "'/></tr>";
	html[idx++] = "</table>";
	
	return html.join("");
};

ZmMoveToDialog.prototype._showNewDialog =
function() {
	var dialog = this._appCtxt.getNewFolderDialog();
	dialog.reset();
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._newCallback, this);
	dialog.popup(null, this);
};

ZmMoveToDialog.prototype._newCallback =
function(parent, name) {
	var ftc = this._opc.getTreeController(ZmOrganizer.FOLDER);
	ftc._doCreate(parent, name);
	this._appCtxt.getNewFolderDialog().popdown();
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
	if (!tgtFolder)
		msg = ZmMsg.noTargetFolder;

	// moving a folder, check for valid target
	if (!msg && this._folder &&	!tgtFolder.mayContain(this._folder))
	    msg = ZmMsg.badTargetFolder;

	// moving items, check for valid target
	if (!msg && !this._folder && !tgtFolder.mayContain(this._items))
		msg = ZmMsg.badTargetFolderItems;

	if (msg)
		this._showError(msg);
	else
		DwtDialog.prototype._buttonListener.call(this, ev, [tgtFolder]);
};
