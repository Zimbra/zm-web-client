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
	//this._listeners[ZmOperation.MOUNT_NOTEBOOK] = new AjxListener(this, this._mountNotebookListener);
	this._listeners[ZmOperation.EDIT_PROPS] = new AjxListener(this, this._editPropsListener);
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);

	this._eventMgrs = {};
};

ZmNotebookTreeController.prototype = new ZmTreeController;
ZmNotebookTreeController.prototype.constructor = ZmNotebookTreeController;

ZmNotebookTreeController.prototype.toString = function() {
	return "ZmNotebookTreeController";
};

// Public methods

ZmNotebookTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate) {
	var firstTime = (!this._treeView[overviewId] || forceCreate);

	ZmTreeController.prototype.show.call(this, overviewId, showUnread, omit, forceCreate);
	
	if (firstTime) {
		var treeView = this.getTreeView(overviewId);
		var root = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
		root.showCheckBox(false);
		var items = root.getItems();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var object = item.getData(Dwt.KEY_OBJECT);
			/***
			this._setTreeItemColor(item, object.color);
			if (object.id == ZmCalendar.ID_CALENDAR) {
				item.setChecked(true);
			}
			/***/
		}
	}
};

ZmNotebookTreeController.prototype.resetOperations = 
function(actionMenu, type, id) {
	/***
	if (actionMenu) {
		var overviewController = this._appCtxt.getOverviewController();
		var treeData = overviewController.getTreeData(ZmOrganizer.NOTEBOOK);
		var notebook = treeData.getById(id);
		actionMenu.enable(ZmOperation.SHARE_CALENDAR, !calendar.link);
		actionMenu.enable(ZmOperation.DELETE, id != ZmOrganizer.ID_CALENDAR);
		actionMenu.enable(ZmOperation.SYNC, calendar.isFeed());
		if (id == ZmOrganizer.ID_ROOT) {
			var items = this._getItems(this._actionedOverviewId);
			var foundChecked = false;
			var foundUnchecked = false;
			for (var i = 0; i < items.length; i++) {
				items[i].getChecked() ? foundChecked = true : foundUnchecked = true;
			}
			actionMenu.enable(ZmOperation.CHECK_ALL, foundUnchecked);
			actionMenu.enable(ZmOperation.CLEAR_ALL, foundChecked);
		}
	}
	/***/
};

// Returns a list of desired header action menu operations
ZmNotebookTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_NOTEBOOK];
};

// Returns a list of desired action menu operations
ZmNotebookTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_NOTEBOOK);
	}
	ops.push(ZmOperation.DELETE, ZmOperation.EDIT_PROPS);
	return ops;
};

ZmNotebookTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmNotebookTreeController.prototype._itemClicked =
function() {
	// TODO
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
	var overviewController = this._appCtxt.getOverviewController();
	var treeData = overviewController.getTreeData(ZmOrganizer.NOTEBOOK);
	var folder = treeData.root;

	var newNotebookDialog = this._appCtxt.getNewNotebookDialog();
	newNotebookDialog .setParentFolder(folder);
	newNotebookDialog .popup();
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
