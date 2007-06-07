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

ZmTasksApp = function(appCtxt, container) {

	ZmApp.call(this, ZmApp.TASKS, appCtxt, container);
};

// Organizer and item-related constants
ZmEvent.S_TASK			= "TASK";
ZmItem.TASK				= ZmEvent.S_TASK;
ZmOrganizer.TASKS		= ZmEvent.S_TASK;

// App-related constants
ZmApp.TASKS						= "Tasks";
ZmApp.CLASS[ZmApp.TASKS]		= "ZmTasksApp";
ZmApp.SETTING[ZmApp.TASKS]		= ZmSetting.TASKS_ENABLED;
ZmApp.LOAD_SORT[ZmApp.TASKS]	= 45;
ZmApp.QS_ARG[ZmApp.TASKS]		= "tasks";

ZmTasksApp.prototype = new ZmApp;
ZmTasksApp.prototype.constructor = ZmTasksApp;

ZmTasksApp.prototype.toString =
function() {
	return "ZmTasksApp";
};

// Construction

ZmTasksApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("Tasks", new AjxCallback(this, this._postLoad, ZmOrganizer.TASKS));
	AjxDispatcher.registerMethod("GetTaskListController", ["TasksCore", "Tasks"], new AjxCallback(this, this.getTaskListController));
	AjxDispatcher.registerMethod("GetTaskController", ["TasksCore", "Tasks"], new AjxCallback(this, this.getTaskController));
};

ZmTasksApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("MOUNT_TASK_FOLDER", {textKey:"mountTaskFolder", image:"TaskList"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("NEW_TASK", {textKey:"newTask", tooltipKey:"newTaskTooltip", image:"NewTask"});
	ZmOperation.registerOp("NEW_TASK_FOLDER", {textKey:"newTaskFolder", tooltipKey:"newTaskFolderTooltip", image:"NewTaskList"});
	ZmOperation.registerOp("SHARE_TASKFOLDER", {textKey:"shareTaskFolder", image:"TaskList"}, ZmSetting.SHARING_ENABLED);
};

ZmTasksApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.TASK,
						{app:			ZmApp.TASKS,
						 nameKey:		"task",
						 icon:			"TaskList",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmTask",
						 node:			"task",
						 organizer:		ZmOrganizer.TASKS,
						 searchType:	"task",
						 resultsList:
		   AjxCallback.simpleClosure(function(search) {
			   AjxDispatcher.require("TasksCore");
			   return new ZmTaskList(this._appCtxt, search);
		   }, this)
						});
};

ZmTasksApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.TASKS,
							{app:				ZmApp.TASKS,
							 nameKey:			"taskFolder",
							 defaultFolder:		ZmFolder.ID_TASKS,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmTaskFolder",
							 orgPackage:		"TasksCore",
							 treeController:	"ZmTaskTreeController",
							 labelKey:			"tasks",
							 itemsKey:			"tasks",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_GRAY,
							 treeType:			ZmOrganizer.FOLDER,
							 views:				["task"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmTaskFolder.sortCompare",
							 deferrable:		true
							});
};

ZmTasksApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.TASK,
								{msgKey:		"tasks",
								 tooltipKey:	"searchTasks",
								 icon:			"SearchTasks",
								 setting:		ZmSetting.TASKS_ENABLED
								});
};

ZmTasksApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_TASK] = "task";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_TASK_FOLDER] = "taskFolder";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_TASK] = ZmOperation.NEW_TASK;

	ZmApp.registerApp(ZmApp.TASKS,
							 {mainPkg:				"Tasks",
							  nameKey:				"tasks",
							  icon:					"TaskList",
							  chooserTooltipKey:	"goToTasks",
							  defaultSearch:		ZmItem.TASK,
							  organizer:			ZmOrganizer.TASKS,
							  overviewTrees:		[ZmOrganizer.TASKS, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
							  assistants:			{"ZmTaskAssistant":"Tasks"},
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  searchTypes:			[ZmItem.TASK],
							  gotoActionCode:		ZmKeyMap.GOTO_TASKS,
							  newActionCode:		ZmKeyMap.NEW_TASK,
							  chooserSort:			35,
							  defaultSort:			25});
};

// App API

ZmTasksApp.prototype.handleOp =
function(op, params) {
	switch (op) {
		case ZmOperation.NEW_TASK: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewTask, [params]);
			AjxDispatcher.require(["TasksCore", "Tasks"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_TASK_FOLDER: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewTaskFolder);
			AjxDispatcher.require(["TasksCore", "Tasks"], false, loadCallback, null, true);
			break;
		}
	}
};

ZmTasksApp.prototype._handleLoadNewTask =
function(params) {
	var folderId = params ? params.folderId : null;
	AjxDispatcher.run("GetTaskController").show((new ZmTask(this._appCtxt, null, null, folderId)));
};

ZmTasksApp.prototype._handleLoadNewTaskFolder =
function() {
	this._appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	var dialog = this._appCtxt.getNewTaskFolderDialog();
	if (!this._newTaskFolderCb) {
		this._newTaskFolderCb = new AjxCallback(this, this._newTaskFolderCallback);
	}
	ZmController.showDialog(dialog, this._newTaskFolderCb);
};

/**
 * Checks for the creation of an address book or a mount point to one. Regular
 * contact creates are handed to the canonical list.
 *
 * @param creates	[hash]		hash of create notifications
 */
ZmTasksApp.prototype.createNotify =
function(creates, force) {
	if (!creates["folder"] && !creates["task"] && !creates["link"]) { return; }
	if (!force && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var list = creates[name];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (this._appCtxt.cacheGet(create.id)) { continue; }
	
			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.TASKS);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.TASKS);
			} else if (name == "task") {
				var currList = this._appCtxt.getCurrentList();
				if (currList && (currList instanceof ZmTaskList)) {
					currList.notifyCreate(create);
				}
				create._handled = true;
			}
		}
	}
};

// Public methods

ZmTasksApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, callback);
	AjxDispatcher.require(["TasksCore", "Tasks"], true, loadCallback, null, true);
};


ZmTasksApp.prototype._handleLoadLaunch =
function(callback) {
	this.search(null, null, null, callback);
};

ZmTasksApp.prototype.showSearchResults =
function(results, callback, isGal, folderId) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback, folderId]);
	AjxDispatcher.require("Tasks", false, loadCallback, null, true);
};

ZmTasksApp.prototype._handleLoadShowSearchResults =
function(results, callback, folderId) {
	this.getTaskListController().show(results, folderId);
	if (callback) callback.run();
};

ZmTasksApp.prototype.getTaskListController =
function() {
	if (!this._taskListController) {
		this._taskListController = new ZmTaskListController(this._appCtxt, this._container, this);
	}
	return this._taskListController;
};

ZmTasksApp.prototype.getTaskController =
function() {
	if (!this._taskController)
		this._taskController = new ZmTaskController(this._appCtxt, this._container, this);
	return this._taskController;
};

ZmTasksApp.prototype.newTaskFromMailItem =
function(msg, date) {
	var subject = msg.subject || "";
	if (msg instanceof ZmConv)
		msg = msg.getFirstMsg();
	msg.load(false, false, new AjxCallback(this, this._msgLoadedCallback, [msg, date, subject]));
};

ZmTasksApp.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var t = new ZmTask(this._appCtxt);
	t.setStartDate(AjxDateUtil.roundTimeMins(date, 30));
	t.setFromMailMessage(mailItem, subject);
	this.getTaskController().show(t, ZmCalItem.MODE_NEW);
};


ZmTasksApp.prototype.search =
function(folder, startDate, endDate, callback) {
	var query = folder ? folder.createQuery() : "in:tasks";
	var sc = this._appCtxt.getSearchController();
	sc.search({query:query, types:sc.getTypes(), sortBy:ZmSearch.DATE_DESC, callback:callback});
};


// Callback

ZmTasksApp.prototype._newTaskFolderCallback =
function(parent, name, color) {
	var dialog = this._appCtxt.getNewTaskFolderDialog();
	dialog.popdown();
	var oc = this._appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.TASKS)._doCreate(parent, name, color);
};
