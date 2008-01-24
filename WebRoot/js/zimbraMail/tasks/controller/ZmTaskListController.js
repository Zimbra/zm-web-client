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

ZmTaskListController = function(container, app) {

	ZmListController.call(this, container, app);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
};

ZmTaskListController.prototype = new ZmListController;
ZmTaskListController.prototype.constructor = ZmTaskListController;

ZmTaskListController.prototype.toString =
function() {
	return "ZmTaskListController";
};

ZmTaskListController.prototype.show =
function(list, folderId) {

	// XXX: will "list" ever be ZmTaskList?
	if (list instanceof ZmTaskList)
	{
		this._list = list;			// set as canonical list of contacts
		this._list._isShared = false;		// this list is not a search of shared items
	}
	else if (list instanceof ZmSearchResult)
	{
		this._list = list.getResults(ZmItem.TASK);

		// XXX: WHY?
		// find out if we just searched for a shared address book
		var folder = appCtxt.getById(folderId);
		this._list._isShared = folder ? folder.link : false;
		this._list.setHasMore(list.getAttribute("more"));
	}

	ZmListController.prototype.show.call(this, list);

	this._setup(this._currentView);

	// reset offset if list view has been created
	if (this._listView[this._currentView])
		this._listView[this._currentView].setOffset(0);

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];

	this._setView(this._currentView, elements, true);

	this._setTabGroup(this._tabGroups[this._currentView]);
	this._restoreFocus();
	this._resetNavToolBarButtons(this._currentView);
};

ZmTaskListController.prototype.getKeyMapName =
function() {
	return "ZmTaskListController";
};

ZmTaskListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmTaskListController.handleKeyAction");

	if (actionCode == ZmKeyMap.MARK_COMPLETE ||
		actionCode == ZmKeyMap.MARK_UNCOMPLETE)
	{
		var task = this._listView[this._currentView].getSelection()[0];
		if ((task.isComplete() && actionCode == ZmKeyMap.MARK_UNCOMPLETE) ||
			(!task.isComplete() && actionCode == ZmKeyMap.MARK_COMPLETE))
		{
			this._doCheckCompleted(task);
		}
	}
	else
	{
		return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
};

ZmTaskListController.prototype.quickSave =
function(name, callback) {
	var folderId = (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;

	var folder = appCtxt.getById(folderId);
	if (folder && folder.link) {
		folderId = folder.getRemoteId();
	}

	var task = new ZmTask(this._list, null, folderId);

	if (folder && folder.link) {
		task.setOrganizer(folder.owner);
		task._orig = new ZmTask(this._list);
	}

	task.setName(name);
	task.setViewMode(ZmCalItem.MODE_NEW);
	task.location = "";
	task.setAllDayEvent(true);

	task.save(null, callback);
};

// default callback before a view is shown - enable/disable nav buttons
ZmTaskListController.prototype._preShowCallback =
function(view, viewPushed) {
	if (view == ZmController.TASKLIST_VIEW) {
		return ZmListController.prototype._preShowCallback.call(this, view, viewPushed);
	}
	return true;
};

ZmTaskListController.prototype._defaultView =
function() {
	return ZmController.TASKLIST_VIEW;
};

ZmTaskListController.prototype._getItemType =
function() {
	return ZmItem.TASK;
};

ZmTaskListController.prototype._getViewType =
function() {
	return this._currentView;
};

ZmTaskListController.prototype._getMoveParams =
function() {
	var params = ZmListController.prototype._getMoveParams.call(this);
	params.overviewId = "ZmTaskListController";
	return params;
};

ZmTaskListController.prototype._createNewView =
function(view) {
	if (view == ZmController.TASK_VIEW) {
		this._listView[view] = new ZmTaskView(this._container, DwtControl.ABSOLUTE_STYLE, this);
	} else {
		this._listView[view] = new ZmTaskListView(this._container, this, this._dropTgt);
		this._listView[view].setDragSource(this._dragSrc);
	}
	return this._listView[view];
};

ZmTaskListController.prototype._getToolBarOps =
function() {
	return [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.EDIT,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.PRINT,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU];
};

ZmTaskListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.createNewTask, "NewTask", "NewTaskDis", ZmOperation.NEW_TASK);

	this._toolbar[view].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, view);
};

ZmTaskListController.prototype._getActionMenuOps =
function() {
	var list = [ZmOperation.EDIT, ZmOperation.SEP];
	list = list.concat(this._standardActionMenuOps());
	return list;
};

ZmTaskListController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagTask : ZmMsg.tagTasks;
};

ZmTaskListController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);

	// a valid folderId means user clicked on a task list
	var isParent = appCtxt.getActiveAccount().isMain;
	var folderId = (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;
	if (folderId) {
		var folder = appCtxt.getById(folderId);
		var isShare = folder && folder.link;
		var canEdit = (folder == null || !folder.isReadOnly());

		parent.enable([ZmOperation.MOVE, ZmOperation.DELETE], canEdit && num > 0);
		parent.enable(ZmOperation.EDIT, canEdit && num == 1);
		parent.enable(ZmOperation.TAG_MENU, (isParent && !isShare && num > 0));
	} else {
		parent.enable(ZmOperation.TAG_MENU, isParent);
	}
};

ZmTaskListController.prototype._doDelete =
function(tasks, mode) {
	/*
	 * XXX: Recurrence is not yet supported by tasks
	 *
	if (task.isRecurring() && !task.isException) {
		// prompt user to edit instance vs. series if recurring but not exception
		this._showTypeDialog(task, ZmCalItem.MODE_DELETE);
	}
	*/
	var callback = new AjxCallback(this, this._handleDelete, [tasks]);
	appCtxt.getConfirmationDialog().popup(ZmMsg.confirmCancelTask, callback);
};

ZmTaskListController.prototype._handleDelete =
function(tasks) {
	var batchCmd = new ZmBatchCommand();
	for (var i = 0; i < tasks.length; i++) {
		var t = tasks[i];
		var cmd = new AjxCallback(t, t.cancel, [ZmCalItem.MODE_DELETE]);
		batchCmd.add(cmd);
	}
	batchCmd.run();
};

ZmTaskListController.prototype._editTask =
function(task) {
	var mode = ZmCalItem.MODE_EDIT;

	if (task.isReadOnly()) {
		if (task.isException) mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
		task.getDetails(mode, new AjxCallback(this, this._showTaskReadOnlyView, task));
	} else {
		if (task.isRecurring()) {
			// prompt user to edit instance vs. series if recurring but not exception
			if (task.isException) {
				mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
			} else {
				this._showTypeDialog(task, ZmCalItem.MODE_EDIT);
				return;
			}
		}
		task.getDetails(mode, new AjxCallback(this, this._showTaskEditView, [task, mode]));
	}
};

// All items in the list view are gone - show "No Results"
ZmTaskListController.prototype._handleEmptyList =
function(listView) {
	listView._resetListView();
	listView._setNoResultsHtml();
};

ZmTaskListController.prototype._showTaskReadOnlyView =
function(task) {
	var viewId = ZmController.TASK_VIEW;
	var calItemView = this._listView[viewId];

	if (!calItemView) {
		this._setup(viewId);
		calItemView = this._listView[viewId];
	}

	calItemView.set(task, ZmController.TASKLIST_VIEW);
	this._resetOperations(this._toolbar[viewId], 1); // enable all buttons
	this._navToolBar[viewId].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], false);

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[viewId];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[viewId];
	this._setView(viewId, elements, null, null, true);
};

ZmTaskListController.prototype._showTaskEditView =
function(task, mode) {
	this._app.getTaskController().show(task, mode);
};

ZmTaskListController.prototype._doCheckCompleted =
function(task) {
	var callback = new AjxCallback(this, this._doCheckCompletedResponse, [task]);
	task.getDetails(ZmCalItem.MODE_EDIT, callback);
};

ZmTaskListController.prototype._doCheckCompletedResponse =
function(task) {
	var clone = ZmTask.quickClone(task);
	clone.pComplete = task.isComplete() ? 0 : 100;
	clone.status = task.isComplete() ? ZmCalendarApp.STATUS_NEED : ZmCalendarApp.STATUS_COMP;
	clone.setViewMode(ZmCalItem.MODE_EDIT);
	clone.save();
};

ZmTaskListController.prototype._showTypeDialog =
function(task, mode) {
	if (!this._typeDialog) {
		this._typeDialog = new ZmCalItemTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener, [task, mode]));
	}
	this._typeDialog.initialize(task, mode);
	this._typeDialog.popup();
};

ZmTaskListController.prototype._typeOkListener =
function(task, mode, ev) {
	var isInstance = this._typeDialog.isInstance();

	if (mode == ZmCalItem.MODE_DELETE) {
		var delMode = isInstance
			? ZmCalItem.MODE_DELETE_INSTANCE
			: ZmCalItem.MODE_DELETE_SERIES;
		// TODO
	} else {
		var editMode = isInstance
			? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE
			: ZmCalItem.MODE_EDIT_SERIES;

		task.getDetails(mode, new AjxCallback(this, this._showTaskEditView, [task, editMode]));
	}
};

ZmTaskListController.prototype._newListener =
function(ev, op, params) {
	params = params || {};
	params.folderId = this._list.folderId;
	ZmListController.prototype._newListener.call(this, ev, op, params);
};

ZmTaskListController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._editTask(ev.item);
	}
};

ZmTaskListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
};

ZmTaskListController.prototype._editListener =
function(ev) {
	var task = this._listView[this._currentView].getSelection()[0];
	this._editTask(task);
};

ZmTaskListController.prototype._setViewContents =
function(view) {
	// load tasks into the given view and perform layout.
	this._listView[view].set(this._list, ZmItem.F_DATE);

	var list = this._list.getVector();
	if (list.size()) this._listView[view].setSelection(list.get(0));
};

ZmTaskListController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveTask : ZmMsg.moveTasks;
};
