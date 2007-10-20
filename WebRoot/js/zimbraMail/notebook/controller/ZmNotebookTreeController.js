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

ZmNotebookTreeController = function() {
	
	ZmTreeController.call(this, ZmOrganizer.NOTEBOOK);

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
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (actionMenu && id != rootId) {
		var notebook = appCtxt.getById(id);
		if (!notebook) { return; }

		var notebookId = ZmOrganizer.getSystemId(ZmOrganizer.ID_NOTEBOOK);
		var isRoot = (notebook.id == rootId);
		var isNotebook = (notebook.id == notebookId);
		var isTopLevel = (!isRoot && notebook.parent.id == rootId);
		var isLink = notebook.link;
		var isLinkOrRemote = isLink || notebook.isRemote();

		var menuItem = actionMenu.getMenuItem(ZmOperation.DELETE);
		menuItem.setEnabled(!isNotebook && (!isLinkOrRemote || (isLink && isTopLevel) || ZmNotebookTreeController.__isAllowed(notebook.parent, ZmShare.PERM_DELETE)));

		menuItem = actionMenu.getMenuItem(ZmOperation.NEW_NOTEBOOK);
		menuItem.setText(ZmMsg.newSection);
		menuItem.setImage("NewSection");
		menuItem.setEnabled(!isLinkOrRemote || ZmNotebookTreeController.__isAllowed(notebook, ZmShare.PERM_CREATE_SUBDIR));

		if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			isNotebook = (!isRoot && notebook.parent.id == rootId);
			menuItem = actionMenu.getMenuItem(ZmOperation.MOUNT_NOTEBOOK);
			//menuItem.setText(isRoot ? ZmMsg.mountNotebook : ZmMsg.mountSection);
			menuItem.setImage(isRoot ? "SharedNotebook" : "SharedSection");
			menuItem.setEnabled(!isLinkOrRemote || ZmNotebookTreeController.__isAllowed(notebook, ZmShare.PERM_CREATE_SUBDIR));

			menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_NOTEBOOK);
			menuItem.setText(isNotebook ? ZmMsg.shareNotebook : ZmMsg.shareSection);
			menuItem.setImage(isNotebook ? "Notebook" : "Section");
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
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
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
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_NOTEBOOK);
	}
	ops.push(ZmOperation.SEP);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
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
	return appCtxt.getNewNotebookDialog();
};

ZmNotebookTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmNotebookTreeController.prototype._itemClicked =
function(notebook) {
	if (appCtxt.getCurrentViewId() != ZmController.NOTEBOOK_PAGE_VIEW) {
		appCtxt.getAppViewMgr().setView(ZmController.NOTEBOOK_PAGE_VIEW);
	};

	var notebookController = AjxDispatcher.run("GetNotebookController");
	notebookController.show(notebook.id, true);

	if (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
		var searchController = appCtxt.getSearchController();
		var search = ["in:\"", notebook.getSearchPath(), '"' ].join("");
		searchController.setDefaultSearchType(ZmItem.PAGE);
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
function(ev, treeView, overviewId) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);

	if (ev.type != this.type) return;

    if(overviewId != this._actionedOverviewId) return;

    var notebookController = AjxDispatcher.run("GetNotebookController");
    var cache = AjxDispatcher.run("GetNotebookCache");

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
        var parentId  = organizer.parent ? organizer.parent.id : null;
        if (shownPage.isChildOf(id) || id == shownPage.id || id == shownPage.folderId || shownPage.id == parentId) {
            if(id == shownPage.folderId && shownPage.name == ZmNotebook.PAGE_INDEX){
                shownPage.restUrl = organizer.restUrl;
            }
            var item = cache.getItemInfo({id:shownPage.id},true);
            var appViewMgr = appCtxt.getAppViewMgr();
            if( appViewMgr.getCurrentViewId() != ZmController.NOTEBOOK_FILE_VIEW ) {
                notebookController.gotoPage(item);
            }
        }
    }
};

/***
ZmNotebookTreeController.prototype._newNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var overviewController = appCtxt.getOverviewController();
	var treeData = overviewController.getTreeData(ZmOrganizer.NOTEBOOK);
	var folder = appCtxt.getById(this._pendingActionData.id);

	var newNotebookDialog = appCtxt.getNewNotebookDialog();
	newNotebookDialog.setParentFolder(folder);
	newNotebookDialog.popup();
};
/***/

ZmNotebookTreeController.prototype._shareNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var notebook = this._pendingActionData;
	var share = null;

	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, notebook, share);
};

ZmNotebookTreeController.prototype._mountNotebookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;

	var dialog = appCtxt.getMountFolderDialog();
	dialog.popup(ZmOrganizer.NOTEBOOK, notebook.id/*, ...*/);
};

ZmNotebookTreeController.prototype._refreshListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;
	var cache = AjxDispatcher.run("GetNotebookCache");
	cache.fillCache(notebook.id);

	var controller = AjxDispatcher.run("GetNotebookController");
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
	
	var cache = AjxDispatcher.run("GetNotebookCache");
	
	var pageEditController = AjxDispatcher.run("GetPageEditController");
	var page = cache.getPageByName(notebook.id, name, true);
	pageEditController.show(page);
};

ZmNotebookTreeController.prototype._deleteListener = function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [ organizer ]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteNotebook, organizer.name);

	var dialog = appCtxt.getConfirmationDialog();
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
function(params) {
	var message;

	// bug: 9406 (short term fix, waiting for backend support)
	var notebookId = ZmOrganizer.getSystemId(ZmOrganizer.ID_NOTEBOOK);
	var folderId = (params.parent && params.parent.id) || notebookId;
	var cache = AjxDispatcher.run("GetNotebookCache");
	if (cache.getPageByName(folderId, params.name)) {
		message = AjxMessageFormat.format(ZmMsg.errorInvalidPageOrSectionName, params.name);
	}

	if (message) {
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(message, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
		return;
	}

	ZmTreeController.prototype._doCreate.apply(this, [params]);
};

ZmNotebookTreeController.prototype._getItems =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
		var root = treeView.getTreeItemById(rootId);
		if (root) {
			return root.getItems();
		}
	}
	return [];
};
