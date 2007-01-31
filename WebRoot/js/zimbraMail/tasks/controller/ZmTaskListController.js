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

function ZmTaskListController(appCtxt, container, app) {
	if (arguments.length == 0) return;
	ZmListController.call(this, appCtxt, container, app);

	// TEMP:
	this._list = new AjxVector();
};

ZmTaskListController.prototype = new ZmListController;
ZmTaskListController.prototype.constructor = ZmTaskListController;

ZmTaskListController.prototype.toString =
function() {
	return "ZmTaskListController";
};

ZmTaskListController.prototype.show =
function(view) {
	var v = view || this._defaultView();

	ZmListController.prototype.show.call(this, null, v);

	this._setup(v);

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[v];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[v];

	if (this._setView(v, elements, true))
		this._setViewMenu(v);

	this._setTabGroup(this._tabGroups[v]);
	this._restoreFocus();
};

ZmTaskListController.prototype._defaultView =
function() {
	return ZmController.TASKLIST_VIEW;
};

ZmTaskListController.prototype._createNewView =
function(view) {
	this._listView[view] = new ZmTaskListView(this._container, this, this._dropTgt);
	return this._listView[view];
};

ZmTaskListController.prototype._getToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU];
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmOperation.TAG_MENU);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DELETE, ZmOperation.MOVE);
	if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
		list.push(ZmOperation.PRINT_MENU);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.EDIT);
	return list;
};

ZmTaskListController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);
/*
TODO
	this._setupViewMenu(view);
*/
	this._setNewButtonProps(view, ZmMsg.createNewTask, "NewTask", "NewTaskDis", ZmOperation.NEW_TASK);
/*
TODO
	this._toolbar[view].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, view);
*/
};

ZmListController.prototype._getActionMenuOps =
function() {
	return this._standardActionMenuOps();
};

ZmTaskListController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagTask : ZmMsg.tagTasks;
};

ZmTaskListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._app.getTaskController().show(this._activeSearch, ev.item);
	}
};

ZmTaskListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
};

ZmTaskListController.prototype._setViewContents =
function(view) {
	///////////////////////////////////////
	// TEMP TEMP TEMP
	///////////////////////////////////////
/*
	for (var i = 0; i < 10; i++) {
		var task = new ZmTask(this._appCtxt, this._list);
		task.id = Dwt.getNextId();
		task.name = "foobar " + i;
		task._percentComplete = "20%";
		task._priority = ZmTask.PRIORITY_LOW;
		this._list.add(task);
	}
*/

	// load tasks into the given view and perform layout.
	this._listView[view].set(this._list, null, this.folderId);
};

ZmTaskListController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveTask : ZmMsg.moveTasks;
};
