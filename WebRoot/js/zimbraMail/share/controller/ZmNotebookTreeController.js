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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookTreeController(appCtxt, type, dropTgt) {
	
	type = type ? type : ZmOrganizer.NOTEBOOK;
	dropTgt = dropTgt ? dropTgt : null; //new DwtDropTarget(ZmAppt);
	
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_NOTEBOOK] = new AjxListener(this, this._newNotebookListener);
	this._listeners[ZmOperation.SHARE_NOTEBOOK] = new AjxListener(this, this._shareNotebookListener);
	this._listeners[ZmOperation.MOUNT_NOTEBOOK] = new AjxListener(this, this._mountNotebookListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editPropsListener);
	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME] = new AjxListener(this, this._editNotebookListener);
	this._listeners[ZmOperation.EDIT_NOTEBOOK_INDEX] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];

	this._eventMgrs = {};
};

ZmNotebookTreeController.prototype = new ZmTreeController;
ZmNotebookTreeController.prototype.constructor = ZmNotebookTreeController;

ZmNotebookTreeController.prototype.toString = function() {
	return "ZmNotebookTreeController";
};

// Public methods

ZmNotebookTreeController.prototype.resetOperations = 
function(actionMenu, type, id) {
	if (actionMenu && id != ZmOrganizer.ID_ROOT) {
		var overviewController = this._appCtxt.getOverviewController();
		var treeData = overviewController.getTreeData(ZmOrganizer.NOTEBOOK);

		var notebook = treeData.getById(id);
		actionMenu.enable(ZmOperation.SHARE_NOTEBOOK, !notebook.link);
		actionMenu.enable(ZmOperation.DELETE, id != ZmOrganizer.ID_NOTEBOOK);
		
		var menuItem = actionMenu.getMenuItem(ZmOperation.NEW_NOTEBOOK);
		menuItem.setText(ZmMsg.newSection);
		menuItem.setImage("NewSection");
		menuItem.setDisabledImage("NewSectionDis");
		
		var isNotebook = notebook.parent.id == ZmOrganizer.ID_ROOT;
		var menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_NOTEBOOK);
		menuItem.setText(isNotebook ? ZmMsg.shareNotebook : ZmMsg.shareSection);
		menuItem.setImage(isNotebook ? "Notebook" : "Section");
		menuItem.setDisabledImage(menuItem.getImage()+"Dis");
		
		if (!this._actionMenuInitialized) {
			var menuItem = actionMenu.getMenuItem(ZmOperation.REFRESH);
			menuItem.setImage("SendRecieve"); // [sic]
			this._actionMenuInitialized = true;
		}
	}
};

// Returns a list of desired header action menu operations
ZmNotebookTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [
		ZmOperation.NEW_NOTEBOOK, ZmOperation.EXPAND_ALL,
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_INDEX, ZmOperation.EDIT_NOTEBOOK_CHROME
	];
};

// Returns a list of desired action menu operations
ZmNotebookTreeController.prototype._getActionMenuOps =
function() {
	var ops = [ZmOperation.NEW_NOTEBOOK, ZmOperation.SEP];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_NOTEBOOK);
	}
	ops.push(
		ZmOperation.DELETE, ZmOperation.EDIT_PROPS, ZmOperation.REFRESH,
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_INDEX, ZmOperation.EDIT_NOTEBOOK_CHROME
	);
	return ops;
};

ZmNotebookTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmNotebookTreeController.prototype._itemClicked =
function(notebook) {
	var notesApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var noteController = notesApp.getNoteController();
	noteController.show(notebook.id);
};

// Handles a drop event
ZmNotebookTreeController.prototype._dropListener =
function() {
	// TODO
};

// Listener callbacks

ZmNotebookTreeController.prototype._changeListener =
function(ev, treeView) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView);

	if (ev.type != this.type) return;
	
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		if (!node) continue;

		/***
		var fields = ev.getDetail("fields");
		// NOTE: ZmTreeController#_changeListener re-inserts the node if the 
		//		 name changes so we need to reset the color in that case, too.
		if (ev.event == ZmEvent.E_CREATE || 
			(ev.event == ZmEvent.E_MODIFY && fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]))) {
			var object = node.getData(Dwt.KEY_OBJECT);
			this._setTreeItemColor(node, object.color);
		}
		/***/
	}
};

ZmNotebookTreeController.prototype._newNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	
	var overviewController = this._appCtxt.getOverviewController();
	var treeData = overviewController.getTreeData(ZmOrganizer.NOTEBOOK);
	var folder = treeData.getById(this._pendingActionData.id);

	var newNotebookDialog = this._appCtxt.getNewNotebookDialog();
	newNotebookDialog.setParentFolder(folder);
	newNotebookDialog.popup();
};

ZmNotebookTreeController.prototype._shareNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	
	var notebook = this._pendingActionData;
	var share = null;
	
	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.setDialogType(ZmSharePropsDialog.NEW);
	sharePropsDialog.setFolder(notebook);
	sharePropsDialog.setShareInfo(share);
	sharePropsDialog.popup();
};

ZmNotebookTreeController.prototype._mountNotebookListener =
function(ev) {
	alert("TODO: mount notebook dialog");
};

ZmNotebookTreeController.prototype._editPropsListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var folderPropsDialog = this._appCtxt.getFolderPropsDialog();
	var folder = this._pendingActionData;
	folderPropsDialog.setFolder(folder);
	folderPropsDialog.popup();
};

ZmNotebookTreeController.prototype._refreshListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;

	var notesApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notesApp.getNoteCache();
	cache.fillCache(notebook.id);
};

ZmNotebookTreeController.prototype._editNotebookListener = function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	
	var notebook = this._pendingActionData;
	var op = ev.item.getData(ZmOperation.KEY_ID);
	var name = op == ZmOperation.EDIT_NOTEBOOK_INDEX ? ZmNotebook.PAGE_INDEX : ZmNotebook.PAGE_CHROME;
	
	var notesApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notesApp.getNoteCache();
	
	var noteEditController = notesApp.getNoteEditController();
	var note = cache.getNoteByName(notebook.id, name, true);
	noteEditController.show(note);
};

ZmNotebookTreeController.prototype._notifyListeners =
function(overviewId, type, items, detail, srcEv, destEv) {
	if (this._eventMgrs[overviewId] && this._eventMgrs[overviewId].isListenerRegistered(type)) {
		if (srcEv) DwtUiEvent.copy(destEv, srcEv);
		destEv.items = items;
		if (items.length == 1) destEv.item = items[0];
		destEv.detail = detail;
		this._eventMgrs[overviewId].notifyListeners(type, destEv);
	}
};

ZmNotebookTreeController.prototype._getItems =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var root = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
		if (root)
			return root.getItems();
	}
	return [];
};
