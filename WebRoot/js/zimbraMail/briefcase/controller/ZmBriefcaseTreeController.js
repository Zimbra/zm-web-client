/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmBriefcaseTreeController = function(type) {
	
	type = type ? type : ZmOrganizer.BRIEFCASE;

	ZmTreeController.call(this, type);

	this._listeners[ZmOperation.NEW_BRIEFCASEITEM] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_BRIEFCASE] = new AjxListener(this, this._shareBriefcaseListener);
	this._listeners[ZmOperation.MOUNT_BRIEFCASE] = new AjxListener(this, this._mountBriefcaseListener);
   	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);	
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
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if (actionMenu && id != rootId) {
		var briefcase = appCtxt.getById(id);
		if (!briefcase) { return; }

		var briefcaseId = ZmOrganizer.getSystemId(ZmOrganizer.ID_BRIEFCASE);
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
		menuItem.setEnabled(!isLinkOrRemote || ZmBriefcaseTreeController.__isAllowed(briefcase, ZmShare.PERM_CREATE_SUBDIR));

		if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			isBriefcase = (!isRoot && briefcase.parent.id == rootId);
			menuItem = actionMenu.getMenuItem(ZmOperation.MOUNT_BRIEFCASE);
			menuItem.setImage(isRoot ? "SharedNotebook" : "SharedSection");
			menuItem.setEnabled(!isLinkOrRemote || ZmBriefcaseTreeController.__isAllowed(briefcase, ZmShare.PERM_CREATE_SUBDIR));

			menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_BRIEFCASE);
			menuItem.setText(ZmMsg.shareFolder);
			menuItem.setImage(isBriefcase ? "SharedMailFolder" : "Section");
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
};

// Handles a drop event
ZmBriefcaseTreeController.prototype._dropListener =
function(ev) {
	var briefcaseItems = ev.srcData.data;
	var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);

	if(!briefcaseItems) {
		ev.doIt = false;
		return;
	}

	briefcaseItems = (briefcaseItems instanceof Array)? briefcaseItems : [briefcaseItems];

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		for (var i = 0; i < briefcaseItems.length; i++) {
			var briefcaseItem = briefcaseItems[i];
			if (!(briefcaseItem instanceof ZmBriefcaseItem)) {
				ev.doIt = false;
			} else if (briefcaseItem.isReadOnly() || dropFolder.isReadOnly()) {
				ev.doIt = false;
			} else if (briefcaseItem.getFolder().id == dropFolder.id) {
				ev.doIt = false;
			} else {
				ev.doIt = this._dropTgt.isValidTarget(briefcaseItem);
			}
			if (ev.doIt === false) { return; }
		}
		
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		if (briefcaseItems && briefcaseItems.length > 0) {
			var ctlr = ev.srcData.controller;
			ctlr._doMove(briefcaseItems, dropFolder, null, true);
			ctlr._pendingActionData = null;
			ctlr.removeCachedFolderItems(briefcaseItems[0].getFolder().id);
			ctlr.removeCachedFolderItems(dropFolder.id);
			ctlr.reloadFolder();
		}
	}
};

// Listener callbacks

ZmBriefcaseTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);

	if (ev.type != this.type) return;

	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	if(overviewId == this._actionedOverviewId){
		var bController = AjxDispatcher.run("GetBriefcaseController");
		bController.handleUpdate(organizers);
	}
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
	var controller = AjxDispatcher.run("GetBriefcaseController");
	controller.reloadFolder();
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
	ZmTreeController.prototype._doCreate.apply(this, [params]);
};

ZmBriefcaseTreeController.prototype._getItems =
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
