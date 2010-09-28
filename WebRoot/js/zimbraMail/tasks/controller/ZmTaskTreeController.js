/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
	this._listeners[ZmOperation.MOUNT_TASK_FOLDER] = new AjxListener(this, this._mountTaskFolderListener);
	this._listeners[ZmOperation.BROWSE] = new AjxListener(this, function(){ appCtxt.getSearchController().fromBrowse(""); });

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
    return ZmFolderTreeController.prototype.show.call(this, params);
};

ZmTaskTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var folder = appCtxt.getById(id);

	parent.enableAll(true);
	if (folder) {
		if (folder.isSystem()) {
			parent.enable([ZmOperation.DELETE, ZmOperation.RENAME_FOLDER], false);
		} else if (folder.link && !folder.isAdmin()) {
			parent.enable([ZmOperation.SHARE_TASKFOLDER], false);
		}
		parent.enable(ZmOperation.SYNC, folder.isFeed());
	}

	var op = parent.getOp(ZmOperation.DELETE);
	if (op) {
		op.setText(deleteText);
	}

	// we always enable sharing in case we're in multi-mbox mode
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_TASKFOLDER, appCtxt.get(ZmSetting.SHARING_ENABLED));
	this._resetButtonPerSetting(parent, ZmOperation.MOUNT_TASK_FOLDER, appCtxt.get(ZmSetting.SHARING_ENABLED));
};

ZmTaskTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

/*
* Returns a "New Task Folder" dialog.
*/
ZmTaskTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewTaskFolderDialog();
};

// Returns a list of desired header action menu operations
ZmTaskTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [
		ZmOperation.NEW_TASK_FOLDER,
		ZmOperation.MOUNT_TASK_FOLDER,
		ZmOperation.BROWSE
	];
};

// Returns a list of desired action menu operations
ZmTaskTreeController.prototype._getActionMenuOps =
function() {
	return [
		ZmOperation.SHARE_TASKFOLDER,
		ZmOperation.DELETE,
		ZmOperation.RENAME_FOLDER,
		ZmOperation.EDIT_PROPS,
		ZmOperation.SYNC
	];
};


// Listeners

ZmTaskTreeController.prototype._shareTaskFolderListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmTaskTreeController.prototype._mountTaskFolderListener =
function(ev) {
	appCtxt.getMountFolderDialog().popup(ZmOrganizer.TASKS);
};

ZmTaskTreeController.prototype._deleteListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var callback = new AjxCallback(this, this._deleteListener2, [organizer]);
	var message = AjxMessageFormat.format(ZmMsg.confirmDeleteTaskFolder, organizer.name);

	appCtxt.getConfirmationDialog().popup(message, callback);
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
