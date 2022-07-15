/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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

	this._eventMgrs = {};
    this._app = appCtxt.getApp(ZmApp.BRIEFCASE);
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

ZmBriefcaseTreeController.prototype.getItemActionMenu = function(ev, item) {
	var actionMenu = null;
	if (item.id != ZmOrganizer.ID_FILE_SHARED_WITH_ME) {
		actionMenu = ZmTreeController.prototype.getItemActionMenu.apply(this, arguments);
	}
	return actionMenu;
}

// Public methods

ZmBriefcaseTreeController.prototype.resetOperations =
function(actionMenu, type, id) {

	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
     if (actionMenu && id != rootId) {
		var briefcase = appCtxt.getById(id);
		if (!briefcase) { return; }
        var nId = ZmOrganizer.normalizeId(id);
		var isRoot = (nId == rootId);
		var isBriefcase = (nId == ZmOrganizer.getSystemId(ZmOrganizer.ID_BRIEFCASE));
		var isTopLevel = (!isRoot && briefcase.parent.id == rootId);
		var isLink = briefcase.link;
		var isLinkOrRemote = isLink || briefcase.isRemote();
        var isTrash = (nId == ZmFolder.ID_TRASH);
        var isReadOnly = briefcase ? briefcase.isReadOnly() : false;

        var deleteText = ZmMsg.del;

        actionMenu.getOp(ZmOperation.EMPTY_FOLDER).setVisible(isTrash);

        if (isTrash) {
            var hasContent = ((briefcase.numTotal > 0) || (briefcase.children && (briefcase.children.size() > 0)));
            actionMenu.enableAll(false);
            actionMenu.enable(ZmOperation.EMPTY_FOLDER,hasContent);
            actionMenu.getOp(ZmOperation.EMPTY_FOLDER).setText(ZmMsg.emptyTrash);            
        } else {
            actionMenu.enableAll(true);
            var showEditMenu = (!isLinkOrRemote || !isReadOnly || (isLink && isTopLevel) || ZmBriefcaseTreeController.__isAllowed(briefcase.parent, ZmShare.PERM_DELETE));
            actionMenu.enable(ZmOperation.DELETE_WITHOUT_SHORTCUT, showEditMenu && !isBriefcase);
            actionMenu.enable(ZmOperation.EDIT_PROPS, showEditMenu);

			var menuItem;
            menuItem = actionMenu.getMenuItem(ZmOperation.NEW_BRIEFCASE);
            menuItem.setText(ZmMsg.newFolder);
            menuItem.setImage("NewFolder");
            menuItem.setEnabled((!isLinkOrRemote || ZmBriefcaseTreeController.__isAllowed(briefcase, ZmShare.PERM_CREATE_SUBDIR) || briefcase.isAdmin() || ZmShare.getRoleFromPerm(briefcase.perm) == ZmShare.ROLE_MANAGER));

            if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
                isBriefcase = (!isRoot && briefcase.parent.id == rootId) || type==ZmOrganizer.BRIEFCASE;
                menuItem = actionMenu.getMenuItem(ZmOperation.SHARE_BRIEFCASE);
                menuItem.setText(ZmMsg.shareFolder);
                menuItem.setImage(isBriefcase ? "SharedMailFolder" : "Section");
                var isShareVisible = (!isLinkOrRemote || briefcase.isAdmin());
                if (appCtxt.isOffline) {
                    var acct = briefcase.getAccount();
                    isShareVisible = !acct.isMain && acct.isZimbraAccount;
                }
                menuItem.setEnabled(isShareVisible);
            }
        }
        var op = actionMenu.getOp(ZmOperation.DELETE_WITHOUT_SHORTCUT);
        if (op) {
            op.setText(deleteText);
        }
		this._enableRecoverDeleted(actionMenu, isTrash);

        // we always enable sharing in case we're in multi-mbox mode
        this._resetButtonPerSetting(actionMenu, ZmOperation.SHARE_BRIEFCASE, appCtxt.get(ZmSetting.SHARING_ENABLED));

	}

};

ZmBriefcaseTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

ZmBriefcaseTreeController.prototype._getSearchTypes =
function(ev) {
	return [ZmItem.BRIEFCASE_ITEM];
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
    var ops = [];
    if (!appCtxt.isExternalAccount()) {
        ops.push(ZmOperation.NEW_BRIEFCASE);
    }
    ops.push(ZmOperation.EXPAND_ALL);
	if (!appCtxt.isExternalAccount()) {
		ops.push(ZmOperation.FIND_SHARES);
	}
	return ops;
};

// Returns a list of desired action menu operations
ZmBriefcaseTreeController.prototype._getActionMenuOps =
function() {

	var ops = [
		ZmOperation.NEW_BRIEFCASE,
		ZmOperation.EMPTY_FOLDER,
		ZmOperation.RECOVER_DELETED_ITEMS
	];
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_BRIEFCASE);
	}
	ops.push(
		ZmOperation.DELETE_WITHOUT_SHORTCUT,
		ZmOperation.EDIT_PROPS
	);
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
	appCtxt.getApp(ZmApp.BRIEFCASE).search({
        folderId:folder.id,
        callback: new AjxCallback(this, this._handleSearchResponse, [folder]),
		isFileShareWithMeFolder: folder.id === ZmOrganizer.ID_FILE_SHARED_WITH_ME
    });
};

// Listener callbacks

ZmBriefcaseTreeController.prototype._shareBriefcaseListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	var briefcase = this._pendingActionData;
	var share = null;

	// This is a transient fix untill we find actual steps to reproduce problem and find exact root cause
	if (briefcase.id === "1") {
		var ex = new AjxException("Root folder sharing is not allowed, ignoring action.", AjxException.INVALID_PARAM);
		appCtxt.getAppController()._handleException(ex);
		return;
	}

	var sharePropsDialog = appCtxt.getSharePropsDialog();
	sharePropsDialog.popup(ZmSharePropsDialog.NEW, briefcase, share);
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

ZmBriefcaseTreeController.prototype.show =
function(params) {
	params.include = {};
	params.include[ZmFolder.ID_TRASH] = true;
    params.showUnread = false;
    var treeView = ZmFolderTreeController.prototype.show.call(this, params);

    treeView._controller = this;
    // Finder to BriefcaseTreeView drag and drop
    this._initDragAndDrop(treeView);

    return treeView;
};


/**
 * @private
 */
ZmBriefcaseTreeController.prototype._createTreeView = function(params) {
	return new ZmBriefcaseTreeView(params);
};


ZmBriefcaseTreeController.prototype._handleSearchResponse =
function(folder, result) {
    // bug fix #49568 - Trash is special when in Briefcase app since it
    // is a FOLDER type in BRIEFCASE tree. So reset selection if clicked
    if (folder.nId == ZmFolder.ID_TRASH) {
        this._treeView[this._app.getOverviewId()].setSelected(folder, true);
    }
};


ZmBriefcaseTreeController.prototype._initDragAndDrop = function(treeView) {
	this._dnd = new ZmDragAndDrop(treeView);
};
