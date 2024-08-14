/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the task tree controller class.
 */

/**
 * Creates the task tree controller.
 * @class
 * This class represents the task tree controller.
 * 
 * @extends		ZmFolderTreeController
 */
ZmTaskTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.TASKS);

	this._listeners[ZmOperation.NEW_TASK_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_TASKFOLDER] = new AjxListener(this, this._shareTaskFolderListener);

	this._eventMgrs = {};
};

ZmTaskTreeController.prototype = new ZmFolderTreeController;
ZmTaskTreeController.prototype.constructor = ZmTaskTreeController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTaskTreeController.prototype.toString =
function() {
	return "ZmTaskTreeController";
};

// Public methods

/**
 * Displays the tree of this type.
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{constant}	params.overviewId		the overview ID
 * @param	{Boolean}	params.showUnread		if <code>true</code>, unread counts will be shown
 * @param	{Object}	params.omit				a hash of organizer IDs to ignore
 * @param	{Object}	params.include			a hash of organizer IDs to include
 * @param	{Boolean}	params.forceCreate		if <code>true</code>, tree view will be created
 * @param	{String}	params.app				the app that owns the overview
 * @param	{Boolean}	params.hideEmpty		if <code>true</code>, don't show header if there is no data
 * @param	{Boolean}	params.noTooltips	if <code>true</code>, don't show tooltips for tree items
 */
ZmTaskTreeController.prototype.show = function(params) {
	params.include = params.include || {};
    params.include[ZmFolder.ID_TRASH] = true;
    params.showUnread = false;
    return ZmFolderTreeController.prototype.show.call(this, params);
};

ZmTaskTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var folder = appCtxt.getById(id);
    var isShareVisible = true;

	parent.enableAll(true);
	if (folder) {
        if (folder.isSystem() || appCtxt.isExternalAccount()) {
            parent.enable([ZmOperation.DELETE_WITHOUT_SHORTCUT, ZmOperation.RENAME_FOLDER], false);
        } else if (folder.link && !folder.isAdmin()) {
            isShareVisible = false;
        }
        if (appCtxt.isOffline) {
            var acct = folder.getAccount();
            isShareVisible = !acct.isMain && acct.isZimbraAccount;
        }
        parent.enable([ZmOperation.SHARE_TASKFOLDER], isShareVisible);
        parent.enable(ZmOperation.SYNC, folder.isFeed());
	}

    parent.enable(ZmOperation.EMPTY_FOLDER,((folder.numTotal > 0) || (folder.children && (folder.children.size() > 0))));
    var nId = ZmOrganizer.normalizeId(id);
    var isTrash = nId == ZmOrganizer.ID_TRASH;
	this.setVisibleIfExists(parent, ZmOperation.EMPTY_FOLDER, isTrash);

	parent.enable(ZmOperation.EDIT_PROPS, !isTrash);
	var emptyFolderOp = parent.getOp(ZmOperation.EMPTY_FOLDER);
	if (emptyFolderOp) {
		emptyFolderOp.setText(ZmMsg.emptyTrash);
	}

	this._enableRecoverDeleted(parent, isTrash);

	var op = parent.getOp(ZmOperation.DELETE_WITHOUT_SHORTCUT);
	if (op) {
		op.setText(deleteText);
	}

    parent.enable(ZmOperation.NEW_TASK_FOLDER, !isTrash && !appCtxt.isExternalAccount());


	// we always enable sharing in case we're in multi-mbox mode
	// But no sharing for trash folder
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_TASKFOLDER, !isTrash && appCtxt.get(ZmSetting.SHARING_ENABLED));
};

ZmTaskTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

ZmTaskTreeController.prototype._getSearchTypes =
function(ev) {
	return [ZmItem.TASK];
};
/*
* Returns a "New Task Folder" dialog.
*/
ZmTaskTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewTaskFolderDialog();
};

ZmTaskTreeController.prototype._newCallback =
function(params) {
    // For a task, set the parent folder (params.l) if specified
    var folder = this._pendingActionData instanceof ZmOrganizer ? this._pendingActionData :
                    (this._pendingActionData && this._pendingActionData.organizer);
    if (folder) {
        params.l = folder.id;
    }
    ZmTreeController.prototype._newCallback.call(this, params);
};

// Returns a list of desired header action menu operations
ZmTaskTreeController.prototype._getHeaderActionMenuOps =
function() {
    if (appCtxt.isExternalAccount()) {
        return [];
    }
	return [ZmOperation.NEW_TASK_FOLDER, ZmOperation.FIND_SHARES];
};

// Returns a list of desired action menu operations
ZmTaskTreeController.prototype._getActionMenuOps = function() {

	return [
        ZmOperation.NEW_TASK_FOLDER,
		ZmOperation.SYNC,
		ZmOperation.EMPTY_FOLDER,
		ZmOperation.RECOVER_DELETED_ITEMS,
		ZmOperation.SHARE_TASKFOLDER,
		ZmOperation.DELETE_WITHOUT_SHORTCUT,
		ZmOperation.RENAME_FOLDER,
		ZmOperation.EDIT_PROPS
	];
};


// Listeners

ZmTaskTreeController.prototype._shareTaskFolderListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);

	// This is a transient fix untill we find actual steps to reproduce problem and find exact root cause
	if (this._pendingActionData.id === "1") {
		var ex = new AjxException("Root folder sharing is not allowed, ignoring action.", AjxException.INVALID_PARAM);
		appCtxt.getAppController()._handleException(ex);
		return;
	}

	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmTaskTreeController.prototype._deleteListener =
function(ev) {
    var organizer = this._getActionedOrganizer(ev);
    if (organizer.isInTrash()) {
        if (appCtxt.getAppViewMgr().isOpenedItemIncludedInFolder(organizer.nId)) {
            appCtxt.getAppViewMgr().popupBlockItemDeletionWarningDialog();
            return;
        }
        var callback = new AjxCallback(this, this._deleteListener2, [organizer]);
        var message = AjxMessageFormat.format(ZmMsg.confirmDeleteTaskFolder, AjxStringUtil.htmlEncode(organizer.name));

        appCtxt.getConfirmationDialog().popup(message, callback);
    }
    else {
        this._doMove(organizer, appCtxt.getById(ZmOrganizer.ID_TRASH));
    }
};

ZmTaskTreeController.prototype._deleteListener2 =
function(organizer) {
    this._doDelete(organizer);
};

/**
 * Called when a left click occurs (by the tree view listener). The folder that
 * was clicked may be a search, since those can appear in the folder tree. The
 * appropriate search will be performed.
 *
 * @param {ZmOrganizer}		folder		folder or search that was clicked
 * 
 * @private
 */
ZmTaskTreeController.prototype._itemClicked =
function(folder) {
	appCtxt.getApp(ZmApp.TASKS).search(folder);
};

/**
 * Gets the task Folders.
 *
 * @param	{String}	overviewId		the overview id
 * @param   {boolean}   includeTrash    True to include trash, if checked.
 * @return	{Array}		an array of {@link ZmCalendar} objects
 */
ZmTaskTreeController.prototype.getTaskFolders =
function(overviewId, includeTrash) {
	var tasks = [];
	var items = this._getItems(overviewId);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item._isSeparator) { continue; }
		var task = item.getData(Dwt.KEY_OBJECT);
        if (task && task.id == ZmOrganizer.ID_TRASH && !includeTrash && task.type) continue;
		if (task) tasks.push(task);
	}

	return tasks;
};


ZmTaskTreeController.prototype._getItems =
function(overviewId) {
	var treeView = this.getTreeView(overviewId);
	if (treeView) {
		var account = appCtxt.multiAccounts ? treeView._overview.account : null;
		if (!appCtxt.get(ZmSetting.TASKS_ENABLED, null, account)) { return []; }

		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, account);
		var root = treeView.getTreeItemById(rootId);
		if (root) {
			var totalItems = [];
			this._getSubItems(root, totalItems);
			return totalItems;
		}
	}
	return [];
};

ZmTaskTreeController.prototype._getSubItems =
function(root, totalItems) {
	if (!root || (root && root._isSeparator)) { return; }

	var items = root.getItems();
	for (var i in items) {
		var item = items[i];
		if (item && !item._isSeparator) {
			totalItems.push(item);
			this._getSubItems(item, totalItems);
		}
	}
};
