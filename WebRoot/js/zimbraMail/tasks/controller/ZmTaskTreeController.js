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

ZmTaskTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.TASKS);

	this._listeners[ZmOperation.NEW_TASK_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_TASKFOLDER] = new AjxListener(this, this._shareTaskFolderListener);
	this._listeners[ZmOperation.MOUNT_TASK_FOLDER] = new AjxListener(this, this._mountTaskFolderListener);

	this._eventMgrs = {};
}

ZmTaskTreeController.prototype = new ZmFolderTreeController;
ZmTaskTreeController.prototype.constructor = ZmTaskTreeController;


// Public Methods
ZmTaskTreeController.prototype.toString =
function() {
	return "ZmTaskTreeController";
};

ZmTaskTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var folder = appCtxt.getById(id);

	parent.enableAll(true);
	if (folder) {
		if ( folder.isSystem()) {
			parent.enable([ZmOperation.DELETE, ZmOperation.RENAME_FOLDER], false);
		} else if (folder.link) {
			parent.enable([ZmOperation.SHARE_TASKFOLDER], false);
		}
	}

	var op = parent.getOp(ZmOperation.DELETE);
	if (op) {
		op.setText(deleteText);
	}
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
	var ops = [ZmOperation.NEW_TASK_FOLDER];
	if (!appCtxt.get(ZmSetting.OFFLINE)) {
		ops.push(ZmOperation.MOUNT_TASK_FOLDER);
	}
	return ops;
};

// Returns a list of desired action menu operations
ZmTaskTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	if (!appCtxt.get(ZmSetting.OFFLINE)) {
		ops.push(ZmOperation.SHARE_TASKFOLDER);
	}
	ops.push(ZmOperation.DELETE, ZmOperation.RENAME_FOLDER, ZmOperation.EDIT_PROPS);
	return ops;
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

/*
* Called when a left click occurs (by the tree view listener). The folder that
* was clicked may be a search, since those can appear in the folder tree. The
* appropriate search will be performed.
*
* @param folder		ZmOrganizer		folder or search that was clicked
*/
ZmTaskTreeController.prototype._itemClicked =
function(folder) {
	appCtxt.getApp(ZmApp.TASKS).search(folder);
};
