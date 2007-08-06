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

ZmBriefcaseTreeController = function(type, dropTgt) {
	
	type = type ? type : ZmOrganizer.BRIEFCASE;

	dropTgt = dropTgt ? dropTgt : null;
	
	ZmTreeController.call(this, type, dropTgt);

	this._listeners[ZmOperation.NEW_BRIEFCASEITEM] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_BRIEFCASE] = new AjxListener(this, this._shareBriefcaseListener);
	this._listeners[ZmOperation.MOUNT_BRIEFCASE] = new AjxListener(this, this._mountBriefcaseListener);
	this._eventMgrs = {};
	
};

ZmBriefcaseTreeController.prototype = new ZmTreeController;
ZmBriefcaseTreeController.prototype.constructor = ZmBriefcaseTreeController;

ZmBriefcaseTreeController.prototype.toString = function() {
	return "ZmBriefcaseTreeController";
};

// Public methods

ZmBriefcaseTreeController.prototype.resetOperations =
function(actionMenu, type, id) {
	var rootId = ZmOrganizer.getSystemId(appCtxt, ZmOrganizer.ID_ROOT);
	if (actionMenu && id != rootId) {
		var briefcase = appCtxt.getById(id);
		if (!briefcase) { return; }

		var briefcaseId = ZmOrganizer.getSystemId(appCtxt, ZmOrganizer.ID_BRIEFCASE);
		var isRoot = (briefcase.id == rootId);
		var isBriefcase = (briefcase.id == briefcaseId);
		var isTopLevel = (!isRoot && briefcase.parent.id == rootId);
		var isLink = briefcase.link;
		var isLinkOrRemote = isLink || briefcase.isRemote();

		var menuItem = actionMenu.getMenuItem(ZmOperation.DELETE);
		menuItem.setEnabled(!isBriefcase && (!isLinkOrRemote || (isLink && isTopLevel) || ZmBriefcaseTreeController.__isAllowed(notebook.parent, ZmShare.PERM_DELETE)));

		menuItem = actionMenu.getMenuItem(ZmOperation.NEW_BRIEFCASEITEM);
		menuItem.setText(ZmMsg.newFolder);
		menuItem.setImage("NewSection");
		menuItem.setDisabledImage("NewSectionDis");
		menuItem.setEnabled(!isLinkOrRemote || ZmBriefcaseTreeController.__isAllowed(briefcase, ZmShare.PERM_CREATE_SUBDIR));

		if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			isBriefcase = (!isRoot && briefcase.parent.id == rootId);
			menuItem = actionMenu.getMenuItem(ZmOperation.MOUNT_BRIEFCASE);
			//menuItem.setText(isRoot ? ZmMsg.mountNotebook : ZmMsg.mountSection);
			menuItem.setImage(isRoot ? "SharedNotebook" : "SharedSection");
			menuItem.setDisabledImage(menuItem.getImage()+"Dis");
			menuItem.setEnabled(!isLinkOrRemote || ZmBriefcaseTreeController.__isAllowed(briefcase, ZmShare.PERM_CREATE_SUBDIR));

			menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_BRIEFCASE);
//			menuItem.setText(isBriefcase ? ZmMsg.shareNotebook : ZmMsg.shareSection);
			menuItem.setText(ZmMsg.shareFolder);
			menuItem.setImage(isBriefcase ? "Folder" : "Section");
			menuItem.setDisabledImage(menuItem.getImage()+"Dis");
			menuItem.setEnabled(!isLinkOrRemote);
		}
    }
    if (actionMenu) {
		var menuItem = actionMenu.getMenuItem(ZmOperation.REFRESH);
		menuItem.setImage("Refresh");
	}
};

ZmBriefcaseTreeController.__isAllowed = function(organizer, perm) {
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
ZmBriefcaseTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_BRIEFCASEITEM ];
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_BRIEFCASE);
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
ZmBriefcaseTreeController.prototype._getActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_BRIEFCASEITEM ];
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_BRIEFCASE);
	}
	ops.push(ZmOperation.SEP);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_BRIEFCASE);
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

ZmBriefcaseTreeController.prototype._getNewDialog = function() {
	return appCtxt.getNewBriefcaseDialog();
};

ZmBriefcaseTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmBriefcaseTreeController.prototype._itemClicked =
function(briefcase) {
	
	var briefcaseController = AjxDispatcher.run("GetBriefcaseController");
	briefcaseController.show(briefcase.id);
	
	/*
	if (appCtxt.getCurrentViewId() != ZmController.NOTEBOOK_PAGE_VIEW) {
		appCtxt.getAppViewMgr().setView(ZmController.NOTEBOOK_PAGE_VIEW);
	};

	var notebookController = AjxDispatcher.run("GetNotebookController");
	notebookController.show(notebook.id, true);

	if (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
		var searchController = appCtxt.getSearchController();
		var search = ["in:\"", notebook.getSearchPath(), '"' ].join("");
		searchController.setDefaultSearchType(ZmItem.PAGE, true);
		searchController.setSearchField(search);
	}
	*/
};

// Handles a drop event
ZmBriefcaseTreeController.prototype._dropListener =
function() {
	// TODO
};

// Listener callbacks

ZmBriefcaseTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);

	if (ev.type != this.type) return;

	var fields = ev.getDetail("fields");
	if (!fields || !(fields[ZmOrganizer.F_NAME] || fields[ZmOrganizer.F_REST_URL])) {
		return;
	}

	/*
	var notebookController = AjxDispatcher.run("GetNotebookController");
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
	}*/
};

ZmBriefcaseTreeController.prototype._shareBriefcaseListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var briefcase = this._pendingActionData;
	var share = null;

	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, briefcase, share);
};

ZmBriefcaseTreeController.prototype._mountBriefcaseListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var briefcase = this._pendingActionData;

	var dialog = appCtxt.getMountFolderDialog();
	dialog.popup(ZmOrganizer.BRIEFCASE, briefcase.id/*, ...*/);
};

ZmBriefcaseTreeController.prototype._refreshListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var notebook = this._pendingActionData;
	/*
	var cache = AjxDispatcher.run("GetNotebookCache");
	cache.fillCache(notebook.id);

	var controller = AjxDispatcher.run("GetNotebookController");
	var page = controller.getPage();
	if (page && page.folderId == notebook.id) {
		controller.gotoPage(page);
	}*/
};

ZmBriefcaseTreeController.prototype._deleteListener = function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [ organizer ]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteBriefcaseItem, organizer.name);

	var dialog = appCtxt.getConfirmationDialog();
	dialog.popup(message, callback);
};

ZmBriefcaseTreeController.prototype._deleteListener2 = function(organizer) {
	this._doDelete(organizer);
};

ZmBriefcaseTreeController.prototype._notifyListeners =
function(overviewId, type, items, detail, srcEv, destEv) {
	if (this._eventMgrs[overviewId] && this._eventMgrs[overviewId].isListenerRegistered(type)) {
		if (srcEv) DwtUiEvent.copy(destEv, srcEv);
		destEv.items = items;
		if (items.length == 1) destEv.item = items[0];
		destEv.detail = detail;
		this._eventMgrs[overviewId].notifyListeners(type, destEv);
	}
};

ZmBriefcaseTreeController.prototype._doCreate =
function(params) {
	var message;
	/*
	// bug: 9406 (short term fix, waiting for backend support)
	var notebookId = ZmOrganizer.getSystemId(appCtxt, ZmOrganizer.ID_NOTEBOOK);
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
	}*/

	ZmTreeController.prototype._doCreate.apply(this, [params]);
};

ZmBriefcaseTreeController.prototype._getItems =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var rootId = ZmOrganizer.getSystemId(appCtxt, ZmOrganizer.ID_ROOT);
		var root = treeView.getTreeItemById(rootId);
		if (root) {
			return root.getItems();
		}
	}
	return [];
};
