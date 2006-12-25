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
	var list = this._standardToolBarOps();
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
