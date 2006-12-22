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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskTreeController(appCtxt, type, dropTgt) {
	if (arguments.length == 0) return;

	ZmTreeController.call(this, appCtxt, (type || ZmOrganizer.TASKS), dropTgt);

	this._listeners[ZmOperation.NEW_TASK_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.CHECK_ALL] = new AjxListener(this, this._checkAllListener);
	this._listeners[ZmOperation.CLEAR_ALL] = new AjxListener(this, this._clearAllListener);

//	this._listeners[ZmOperation.SHARE_CALENDAR] = new AjxListener(this, this._shareCalListener);
//	this._listeners[ZmOperation.MOUNT_CALENDAR] = new AjxListener(this, this._mountCalListener);

	this._eventMgrs = {};
};

ZmTaskTreeController.prototype = new ZmCalendarTreeController;
ZmTaskTreeController.prototype.constructor = ZmTaskTreeController;

ZmTaskTreeController.prototype.toString =
function() {
	return "ZmTaskTreeController";
};

ZmTaskTreeController.prototype.resetOperations =
function(actionMenu, type, id) {
	if (actionMenu) {
		var treeData = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.TASKS);
		var tf = treeData.getById(id);
//		actionMenu.enable(ZmOperation.SHARE_CALENDAR, !calendar.link);
		actionMenu.enable(ZmOperation.DELETE, id != ZmOrganizer.ID_TASKS);
		actionMenu.enable(ZmOperation.SYNC, tf.isFeed());
		if (id == ZmOrganizer.ID_ROOT) {
			var items = this._getItems(this._actionedOverviewId);
			var foundChecked = false;
			var foundUnchecked = false;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item._isSeparator) continue;
				item.getChecked() ? foundChecked = true : foundUnchecked = true;
			}
			actionMenu.enable(ZmOperation.CHECK_ALL, foundUnchecked);
			actionMenu.enable(ZmOperation.CLEAR_ALL, foundChecked);
		}
	}
};


/*
* Returns a "New Task Folder" dialog.
*/
ZmTaskTreeController.prototype._getNewDialog =
function() {
	// TODO
	DBG.println("TODO- new task folder dialog");
	//return this._appCtxt.getNewCalendarDialog();
};

// Returns a list of desired header action menu operations
ZmTaskTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [ ZmOperation.NEW_TASK_FOLDER ];
/*
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.MOUNT_CALENDAR);
	}
*/
	ops.push(ZmOperation.CHECK_ALL, ZmOperation.CLEAR_ALL);
	return ops;
};

// Returns a list of desired action menu operations
ZmTaskTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
/*
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		ops.push(ZmOperation.SHARE_CALENDAR);
	}
*/
	ops.push(ZmOperation.DELETE, ZmOperation.EDIT_PROPS, ZmOperation.SYNC);
	return ops;
};
