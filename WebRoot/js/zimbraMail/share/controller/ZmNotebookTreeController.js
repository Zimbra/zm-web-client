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

	this._listeners[ZmOperation.NEW_NOTEBOOK] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_NOTEBOOK] = new AjxListener(this, this._shareNotebookListener);
	this._listeners[ZmOperation.MOUNT_NOTEBOOK] = new AjxListener(this, this._mountNotebookListener);
	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	/***
	this._listeners[ZmOperation.EDIT_NOTEBOOK_INDEX] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];
	this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME] = new AjxListener(this, this._editNotebookListener);
	this._listeners[ZmOperation.EDIT_NOTEBOOK_STYLES] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];
	this._listeners[ZmOperation.EDIT_NOTEBOOK_SIDE_BAR] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];
	this._listeners[ZmOperation.EDIT_NOTEBOOK_HEADER] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];
	this._listeners[ZmOperation.EDIT_NOTEBOOK_FOOTER] = this._listeners[ZmOperation.EDIT_NOTEBOOK_CHROME];
	/***/

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

		var isRoot = notebook.id == ZmOrganizer.ID_ROOT;
		var isNotebook = notebook.id == ZmOrganizer.ID_NOTEBOOK;
		var isTopLevel = !isRoot && notebook.parent.id == ZmOrganizer.ID_ROOT;
		var isLink = notebook.link;
		var isLinkOrRemote = isLink || notebook.isRemote();

		var menuItem = actionMenu.getMenuItem(ZmOperation.DELETE);
		menuItem.setEnabled(!isNotebook && (!isLinkOrRemote || (isLink && isTopLevel) || ZmNotebookTreeController.__isAllowed(notebook.parent, ZmShare.PERM_DELETE)));

		var menuItem = actionMenu.getMenuItem(ZmOperation.NEW_NOTEBOOK);
		menuItem.setText(ZmMsg.newSection);
		menuItem.setImage("NewSection");
		menuItem.setDisabledImage("NewSectionDis");
		menuItem.setEnabled(!isLinkOrRemote || ZmNotebookTreeController.__isAllowed(notebook, ZmShare.PERM_CREATE_SUBDIR));

		if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			var isNotebook = !isRoot && notebook.parent.id == ZmOrganizer.ID_ROOT;
			var menuItem = actionMenu.getMenuItem(ZmOperation.MOUNT_NOTEBOOK);
			//menuItem.setText(isRoot ? ZmMsg.mountNotebook : ZmMsg.mountSection);
			menuItem.setImage(isRoot ? "SharedNotebook" : "SharedSection");
			menuItem.setDisabledImage(menuItem.getImage()+"Dis");
			menuItem.setEnabled(!isLinkOrRemote || ZmNotebookTreeController.__isAllowed(notebook, ZmShare.PERM_CREATE_SUBDIR));

			var menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_NOTEBOOK);
			menuItem.setText(isNotebook ? ZmMsg.shareNotebook : ZmMsg.shareSection);
			menuItem.setImage(isNotebook ? "Notebook" : "Section");
			menuItem.setDisabledImage(menuItem.getImage()+"Dis");
			menuItem.setEnabled(!isLinkOrRemote);
		}
    }
    if (actionMenu) {
        var menuItem = actionMenu.getMenuItem(ZmOperation.REFRESH);
		menuItem.setImage("Refresh");
	}
};

ZmNotebookTreeController.__isAllowed = function(organizer, perm) {
	var allowed = true;
	if (organizer.link || organizer.isRemote()) {
		// change assumption to not allowed
		allowed = false;
		// REVISIT: bug 10801
		var share = organizer.shares && organizer.shares[0];
		if (share && !share.isPermRestricted(perm)) {
			allowed = share.isPermAllowed(perm);
		}
	}
	return allowed;
};

// Returns a list of desired header action menu operations
ZmNotebookTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_NOTEBOOK ];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_NOTEBOOK);
	}
	ops.push(
		ZmOperation.EXPAND_ALL,
		ZmOperation.SEP,
		ZmOperation.REFRESH
		/***
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_INDEX
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_HEADER, ZmOperation.EDIT_NOTEBOOK_FOOTER,
		ZmOperation.EDIT_NOTEBOOK_SIDE_BAR,
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_CHROME, ZmOperation.EDIT_NOTEBOOK_STYLES
		***/
	);
	return ops;
};

// Returns a list of desired action menu operations
ZmNotebookTreeController.prototype._getActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_NOTEBOOK ];
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_NOTEBOOK);
	}
	ops.push(ZmOperation.SEP);
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_NOTEBOOK);
	}
	ops.push(
		ZmOperation.DELETE, ZmOperation.EDIT_PROPS, ZmOperation.REFRESH
		/***
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_INDEX
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_HEADER, ZmOperation.EDIT_NOTEBOOK_FOOTER,
		ZmOperation.EDIT_NOTEBOOK_SIDE_BAR,
		ZmOperation.SEP,
		ZmOperation.EDIT_NOTEBOOK_CHROME, ZmOperation.EDIT_NOTEBOOK_STYLES
		/***/
	);
	return ops;
};

ZmNotebookTreeController.prototype._getNewDialog = function() {
	return this._appCtxt.getNewNotebookDialog();
};

ZmNotebookTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmNotebookTreeController.prototype._itemClicked =
function(notebook) {
	if (this._appCtxt.getCurrentViewId() != ZmController.NOTEBOOK_PAGE_VIEW) {
		this._appCtxt.getAppViewMgr().setView(ZmController.NOTEBOOK_PAGE_VIEW);
	};

	var notebookApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var notebookController = notebookApp.getNotebookController();
	notebookController.show(notebook.id, true);

	if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
		var searchController = this._appCtxt.getSearchController();
		var search = ["in:\"", notebook.getSearchPath(), '"' ].join("");
		searchController.setDefaultSearchType(ZmItem.PAGE, true);
		searchController.setSearchField(search);
	}
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

	var fields = ev.getDetail("fields");
	if (!fields || !(fields[ZmOrganizer.F_NAME] || fields[ZmOrganizer.F_REST_URL])) {
		return;
	}

	var notebookApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var notebookController = notebookApp.getNotebookController();
	var shownPage = notebookController.getPage();
	if (!shownPage) {
		return;
	}
	
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		if (id == shownPage.id || id == shownPage.folderId) {
			notebookController.gotoPage(shownPage);
		}

		/***
		var node = treeView.getTreeItemById(id);
		if (!node) continue;
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

/***
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
/***/

ZmNotebookTreeController.prototype._shareNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var notebook = this._pendingActionData;
	var share = null;

	var sharePropsDialog = this._appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, notebook, share);
};

ZmNotebookTreeController.prototype._mountNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;

	var dialog = this._appCtxt.getMountFolderDialog();
	dialog.popup(ZmOrganizer.NOTEBOOK, notebook.id/*, ...*/);
};

ZmNotebookTreeController.prototype._refreshListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;

	var notebookApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notebookApp.getNotebookCache();

	cache.fillCache(notebook.id);

	var controller = notebookApp.getNotebookController();
	var page = controller.getPage();
	if (page && page.folderId == notebook.id) {
		controller.gotoPage(page);
	}
};

ZmNotebookTreeController.prototype._editNotebookListener = function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	
	var notebook = this._pendingActionData;
	var op = ev.item.getData(ZmOperation.KEY_ID);
	if (op == ZmOperation.EDIT_NOTEBOOK_INDEX) {
		op = ZmNotebook.PAGE_INDEX;
		
	} else if (op == ZmOperation.EDIT_NOTEBOOK_CHROME) {
		op = ZmNotebook.PAGE_CHROME;
		
	} else if (op == ZmOperation.EDIT_NOTEBOOK_STYLES) {
		op = ZmNotebook.PAGE_CHROME_STYLES;
		
	} else if (op == ZmOperation.EDIT_NOTEBOOK_HEADER) {
		op = ZmNotebook.PAGE_HEADER;
		
	} else if (op == ZmOperation.EDIT_NOTEBOOK_FOOTER) {
		op = ZmNotebook.PAGE_FOOTER;
		
	} else if (op == ZmOperation.EDIT_NOTEBOOK_SIDE_BAR) {
		op = ZmNotebook.PAGE_SIDE_BAR;
	}
	var name = op;
	
	var notebookApp = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = notebookApp.getNotebookCache();
	
	var pageEditController = notebookApp.getPageEditController();
	var page = cache.getPageByName(notebook.id, name, true);
	pageEditController.show(page);
};

ZmNotebookTreeController.prototype._deleteListener = function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [ organizer ]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteNotebook, organizer.name);

	var dialog = this._appCtxt.getConfirmationDialog();
	dialog.popup(message, callback);
};
ZmNotebookTreeController.prototype._deleteListener2 = function(organizer) {
	this._doDelete(organizer);
}

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

ZmNotebookTreeController.prototype._doCreate =
function(parent, name, color/*, url*/) {
	var message;

	// bug: 9406 (short term fix, waiting for backend support)
	var folderId = (parent && parent.id) || ZmOrganizer.ID_NOTEBOOK;
	var app = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
	var cache = app.getNotebookCache();
	if (cache.getPageByName(folderId, name)) {
		message = AjxMessageFormat.format(ZmMsg.errorInvalidPageOrSectionName, name);
	}

	if (message) {
		var dialog = this._appCtxt.getMsgDialog();
		dialog.setMessage(message, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
		return;
	}

	parent.create(name, color);
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
