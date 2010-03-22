/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the briefcase tree controller class.
 * 
 */

/**
 * Creates the briefcase tree controller.
 * @class
 * This class is a controller for the tree view used by the briefcase application.
 *
 * @param	{constant}	type		the organizer (see {@link ZmOrganizer.BRIEFCASE})
 * 
 * @author Parag Shah
 * 
 * @extends		ZmFolderTreeController
 */
ZmBriefcaseTreeController = function(type) {

	ZmFolderTreeController.call(this, (type || ZmOrganizer.BRIEFCASE));

	this._listeners[ZmOperation.NEW_BRIEFCASE] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_BRIEFCASE] = new AjxListener(this, this._shareBriefcaseListener);
	this._listeners[ZmOperation.MOUNT_BRIEFCASE] = new AjxListener(this, this._mountBriefcaseListener);
	this._listeners[ZmOperation.BROWSE] = new AjxListener(this, function(){ appCtxt.getSearchController().fromBrowse(""); });

	this._eventMgrs = {};
};

ZmBriefcaseTreeController.prototype = new ZmFolderTreeController;
ZmBriefcaseTreeController.prototype.constructor = ZmBriefcaseTreeController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseTreeController.prototype.toString =
function() {
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
        var isTrash = (briefcase.id == ZmFolder.ID_TRASH);

        var deleteText = ZmMsg.del;
        if (isTrash) {
            var hasContent = ((briefcase.numTotal > 0) || (briefcase.children && (briefcase.children.size() > 0)));
            actionMenu.enableAll(false);
            actionMenu.enable(ZmOperation.DELETE, hasContent);
            deleteText = ZmMsg.emptyTrash;
        }else{
            actionMenu.enableAll(true);
            var menuItem = actionMenu.getMenuItem(ZmOperation.DELETE);
            menuItem.setEnabled(!isBriefcase && (!isLinkOrRemote || (isLink && isTopLevel) || ZmBriefcaseTreeController.__isAllowed(briefcase.parent, ZmShare.PERM_DELETE)));

            menuItem = actionMenu.getMenuItem(ZmOperation.NEW_BRIEFCASE);
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
                menuItem.setEnabled(!isLinkOrRemote || briefcase.isAdmin());
            }
        }

        var op = actionMenu.getOp(ZmOperation.DELETE);
        if (op) {
            op.setText(deleteText);
        }

        // we always enable sharing in case we're in multi-mbox mode
        this._resetButtonPerSetting(actionMenu, ZmOperation.SHARE_BRIEFCASE, appCtxt.get(ZmSetting.SHARING_ENABLED));
        this._resetButtonPerSetting(actionMenu, ZmOperation.MOUNT_BRIEFCASE, appCtxt.get(ZmSetting.SHARING_ENABLED));

	}

};

ZmBriefcaseTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

ZmBriefcaseTreeController.__isAllowed =
function(organizer, perm) {
	var allowed = true;
	if (organizer.link || organizer.isRemote()) {
		allowed = false; // change assumption to not allowed

		// REVISIT: bug 10801
		var share = organizer.getMainShare();
		if (share && !share.isPermRestricted(perm)) {
			allowed = share.isPermAllowed(perm);
		}
	}
	return allowed;
};

// Returns a list of desired header action menu operations
ZmBriefcaseTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ZmOperation.NEW_BRIEFCASE];
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_BRIEFCASE);
	}
	ops.push(
		ZmOperation.EXPAND_ALL,
		ZmOperation.SEP,
		ZmOperation.BROWSE
	);
	return ops;
};

// Returns a list of desired action menu operations
ZmBriefcaseTreeController.prototype._getActionMenuOps =
function() {
	var ops = [ZmOperation.NEW_BRIEFCASE];
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_BRIEFCASE);
	}
	ops.push(ZmOperation.SEP);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_BRIEFCASE);
	}
	ops.push(ZmOperation.DELETE, ZmOperation.EDIT_PROPS);
	return ops;
};

ZmBriefcaseTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewBriefcaseDialog();
};

/**
 * Gets the tree style.
 * 
 * @return	{constant}	the style
 * 
 * @see		DwtTree.SINGLE_STYLE
 */
ZmBriefcaseTreeController.prototype.getTreeStyle =
function() {
	return DwtTree.SINGLE_STYLE;
};

// Method that is run when a tree item is left-clicked
ZmBriefcaseTreeController.prototype._itemClicked =
function(folder) {
	appCtxt.getApp(ZmApp.BRIEFCASE).search({folderId:folder.id});
};

// Listener callbacks

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

ZmBriefcaseTreeController.prototype._trashChangeListener =
function(treeView, ev){

    if(ev.type == ZmOrganizer.BRIEFCASE && ev.event == ZmEvent.E_MOVE) {

        var organizers = ev.getDetail("organizers");
        if (!organizers && ev.source) {
            organizers = [ev.source];
        }

        if(organizers)
            treeView.setSelected(organizers[0], false);
        
    }
};

ZmBriefcaseTreeController.prototype.show =
function(params) {
	params.include = {};
	params.include[ZmFolder.ID_TRASH] = true;
    params.showUnread = false;
    var treeView = ZmFolderTreeController.prototype.show.call(this, params);

	// contacts app has its own Trash folder so listen for change events
	var trash = this.getDataTree().getById(ZmFolder.ID_TRASH);
	if (trash) {
		trash.addChangeListener(new AjxListener(this, this._trashChangeListener, treeView));
	}

	return treeView;
};
