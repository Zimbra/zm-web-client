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

ZmTasksApp = function(container) {
	ZmApp.call(this, ZmApp.TASKS, container);
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
	AjxDispatcher.setPackageLoadFunction("TasksCore", new AjxCallback(this, this._postLoadCore));
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
						 dropTargets:	[ZmOrganizer.TAG],
						 searchType:	"task",
						 resultsList:
		   AjxCallback.simpleClosure(function(search) {
			   AjxDispatcher.require("TasksCore");
			   return new ZmTaskList(search);
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
								 icon:			"TaskList",
								 shareIcon:		"SharedTaskList",
								 setting:		ZmSetting.TASKS_ENABLED
								});
};

ZmTasksApp.prototype._setupCurrentAppToolbar =
function() {
	ZmCurrentAppToolBar.registerApp(this.getName(), ZmOperation.NEW_TASK_FOLDER, ZmOrganizer.TASKS);
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
							  assistants:			{"ZmTaskAssistant": ["TasksCore", "Tasks"]},
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  searchTypes:			[ZmItem.TASK],
							  gotoActionCode:		ZmKeyMap.GOTO_TASKS,
							  newActionCode:		ZmKeyMap.NEW_TASK,
							  chooserSort:			35,
							  defaultSort:			25,
							  supportsMultiMbox:	true
							  });
};

// App API

ZmTasksApp.prototype.postNotify =
function(notify) {
	if (this._checkReplenishListView) {
		this._checkReplenishListView._checkReplenish();
		this._checkReplenishListView = null;
	}
};

ZmTasksApp.prototype.refresh =
function(refresh) {
	this._handleRefresh();
};

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
	AjxDispatcher.run("GetTaskController").show((new ZmTask(null, null, folderId)));
};

ZmTasksApp.prototype._handleLoadNewTaskFolder =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	var dialog = appCtxt.getNewTaskFolderDialog();
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
			if (appCtxt.cacheGet(create.id)) { continue; }
	
			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.TASKS);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.TASKS);
			} else if (name == "task") {
				var currList = appCtxt.getCurrentList();
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
function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, callback);
	AjxDispatcher.require(["TasksCore", "Tasks"], true, loadCallback, null, true);
};


ZmTasksApp.prototype._handleLoadLaunch =
function(callback) {
	if (callback) { callback.run(); }
	this.search();
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

ZmTasksApp.prototype._activateAccordionItem =
function(accordionItem) {
	ZmApp.prototype._activateAccordionItem.call(this, accordionItem);

	this.search();
};

// common API shared by calendar app
ZmTasksApp.prototype.getListController =
function() {
	return this.getTaskListController();
};

ZmTasksApp.prototype.getTaskListController =
function() {
	if (!this._taskListController) {
		this._taskListController = new ZmTaskListController(this._container, this);
	}
	return this._taskListController;
};

ZmTasksApp.prototype.getTaskController =
function() {
	if (!this._taskController) {
		this._taskController = new ZmTaskController(this._container, this);
	}
	return this._taskController;
};

ZmTasksApp.prototype.newTaskFromMailItem =
function(msg, date) {
	var subject = msg.subject || "";
	if (msg instanceof ZmConv) {
		msg = msg.getFirstHotMsg();
	}
	msg.load(false, false, new AjxCallback(this, this._msgLoadedCallback, [msg, date, subject]));
};

ZmTasksApp.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var t = new ZmTask();
	t.setStartDate(AjxDateUtil.roundTimeMins(date, 30));
	t.setFromMailMessage(mailItem, subject);
	this.getTaskController().show(t, ZmCalItem.MODE_NEW);
};


ZmTasksApp.prototype.search =
function(folder, startDate, endDate, callback) {
	var query = folder ? folder.createQuery() : "in:tasks";
	var sc = appCtxt.getSearchController();
	sc.search({query:query, types:[ZmItem.TASK], callback:callback});
};


// Callback

ZmTasksApp.prototype._newTaskFolderCallback =
function(parent, name, color) {
	var dialog = appCtxt.getNewTaskFolderDialog();
	dialog.popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.TASKS)._doCreate(parent, name, color);
};
