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
 * This file contains the task application class.
 */

/**
 * Creates the task application.
 * @class
 * This class represents the task application.
 * 
 * @param	{DwtControl}	container		the container
 * 
 * @extends		ZmApp
 */
ZmTasksApp = function(container) {
	ZmApp.call(this, ZmApp.TASKS, container);
};

// Organizer and item-related constants
ZmEvent.S_TASK			= ZmId.ITEM_TASK;
ZmItem.TASK				= ZmEvent.S_TASK;
ZmOrganizer.TASKS		= ZmEvent.S_TASK;

// App-related constants
ZmApp.TASKS						= ZmId.APP_TASKS;
ZmApp.CLASS[ZmApp.TASKS]		= "ZmTasksApp";
ZmApp.SETTING[ZmApp.TASKS]		= ZmSetting.TASKS_ENABLED;
ZmApp.LOAD_SORT[ZmApp.TASKS]	= 45;
ZmApp.QS_ARG[ZmApp.TASKS]		= "tasks";

ZmTasksApp.prototype = new ZmApp;
ZmTasksApp.prototype.constructor = ZmTasksApp;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
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
	ZmOperation.registerOp(ZmId.OP_MOUNT_TASK_FOLDER, {textKey:"mountTaskFolder", image:"TaskList"});
	ZmOperation.registerOp(ZmId.OP_NEW_TASK, {textKey:"newTask", tooltipKey:"newTaskTooltip", image:"NewTask", shortcut:ZmKeyMap.NEW_TASK});
	ZmOperation.registerOp(ZmId.OP_NEW_TASK_FOLDER, {textKey:"newTaskFolder", tooltipKey:"newTaskFolderTooltip", image:"NewTaskList"});
	ZmOperation.registerOp(ZmId.OP_SHARE_TASKFOLDER, {textKey:"shareTaskFolder", image:"TaskList"});
	ZmOperation.registerOp(ZmId.OP_PRINT_TASK, {textKey:"printTask", image:"Print", shortcut:ZmKeyMap.PRINT}, ZmSetting.PRINT_ENABLED);
	ZmOperation.registerOp(ZmId.OP_PRINT_TASKFOLDER, {textKey:"printTaskFolder", image:"Print"}, ZmSetting.PRINT_ENABLED);
};

ZmTasksApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.TASK,
						{app:			ZmApp.TASKS,
						 nameKey:		"task",
						 countKey:  	"typeTask",
						 icon:			"TaskList",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmTask",
						 node:			"task",
						 organizer:		ZmOrganizer.TASKS,
						 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.TASKS],
						 searchType:	"task",
						 resultsList:
	   AjxCallback.simpleClosure(function(search) {
           AjxDispatcher.require("TasksCore");
		   return new ZmList(ZmItem.TASK, search);
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
                             folderKey:			"tasksFolder",   
                             hasColor:			true,
							 defaultColor:		ZmOrganizer.C_NONE,
							 treeType:			ZmOrganizer.FOLDER,
							 views:				["task"],
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmTaskFolder.sortCompare",
							 deferrable:		true,
							 newOp:				ZmOperation.NEW_TASK_FOLDER,
							 displayOrder:		100
							});
};

ZmTasksApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.TASK,
								{msgKey:		"tasks",
								 tooltipKey:	"searchTasks",
								 icon:			"TaskList",
								 shareIcon:		"SharedTaskList",
								 setting:		ZmSetting.TASKS_ENABLED,
								 id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.ITEM_TASK)
								});
};

ZmTasksApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_TASK] = "task";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_TASK_FOLDER] = "tasksFolder";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_TASK] = ZmOperation.NEW_TASK;

	ZmApp.registerApp(ZmApp.TASKS,
							 {mainPkg:				"Tasks",
							  nameKey:				"tasks",
							  icon:					"TaskList",
							  textPrecedence:		20,
							  chooserTooltipKey:	"goToTasks",
							  defaultSearch:		ZmItem.TASK,
							  organizer:			ZmOrganizer.TASKS,
							  overviewTrees:		[ZmOrganizer.TASKS, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  assistants:			{"ZmTaskAssistant": ["TasksCore", "Tasks"]},
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  searchTypes:			[ZmItem.TASK],
							  gotoActionCode:		ZmKeyMap.GOTO_TASKS,
							  newActionCode:		ZmKeyMap.NEW_TASK,
							  chooserSort:			35,
							  defaultSort:			25
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
	AjxDispatcher.run("GetTaskController").show((new ZmTask(null, null, params && params.folderId)));
};

ZmTasksApp.prototype._handleLoadNewTaskFolder =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	var dialog = appCtxt.getNewTaskFolderDialog();
	if (!this._newTaskFolderCb) {
		this._newTaskFolderCb = new AjxCallback(this, this._newTaskFolderCallback);
	}
	ZmController.showDialog(dialog, this._newTaskFolderCb);
};

/**
 * Checks for the creation of a tasks folder or a mount point to one.
 *
 * @param {Hash}	creates		a hash of create notifications
 * @param	{Boolean}	force	if <code>true</code>, force the create
 * 
 */
ZmTasksApp.prototype.createNotify =
function(creates, force) {
	if (!creates["folder"] && !creates["task"] && !creates["link"]) { return; }
	if (!force && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var list = creates[name];
		if (!list) { continue; }

		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }
	
			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.TASKS);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.TASKS);
			} else if (name == "task") {
				// bug fix #29833 - always attempt to process new tasks
				var taskList = this.getTaskListController().getList();
				if (taskList) {
					taskList.notifyCreate(create);
				}
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
	var acct = this._getExternalAccount();
	this.search(null, null, null, null, (acct && acct.name));
	if (callback) { callback.run(); }
};

/**
 * Shows the search results.
 * 
 * @param	{Hash}	results		the search results
 * @param	{AjxCallback}	callback		the callback
 */
ZmTasksApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require("Tasks", false, loadCallback, null, true);
};

ZmTasksApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	var folderId = results && results.search && results.search.singleTerm && results.search.folderId;
	this.getTaskListController().show(results, folderId);
	if (callback) callback.run();
};

// common API shared by calendar app

/**
 * Gets the list controller.
 * 
 * @return	{ZmTaskListController}	the controller
 */
ZmTasksApp.prototype.getListController =
function() {
	return this.getTaskListController();
};

/**
 * Gets the list controller.
 * 
 * @return	{ZmTaskListController}	the controller
 */
ZmTasksApp.prototype.getTaskListController =
function() {
	if (!this._taskListController) {
		this._taskListController = new ZmTaskListController(this._container, this);
	}
	return this._taskListController;
};

/**
 * Gets the controller.
 * 
 * @return	{ZmTaskController}	the controller
 */
ZmTasksApp.prototype.getTaskController =
function(sessionId) {
	return this.getSessionController(ZmId.VIEW_TASKEDIT, "ZmTaskController", sessionId);
};

/**
 * Creates a task from a mail item.
 * 
 * @param	{ZmMailMsg}		msg		the message
 * @param	{Date}			date	the date
 */
ZmTasksApp.prototype.newTaskFromMailItem =
function(msg, date) {
	var subject = msg.subject || "";
	if (msg instanceof ZmConv) {
		msg = msg.getFirstHotMsg();
	}
	msg.load({getHtml:false, callback:new AjxCallback(this, this._msgLoadedCallback, [msg, date, subject])});
};

/**
 * @private
 */
ZmTasksApp.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var t = new ZmTask();
	t.setStartDate(AjxDateUtil.roundTimeMins(date, 30));
	t.setFromMailMessage(mailItem, subject);
	this.getTaskController().show(t, ZmCalItem.MODE_NEW);
};

/**
 * Performs a search.
 * 
 * @param	{ZmFolder}		folder		the folder
 * @param	{Date}			startDate	the start date
 * @param	{Date}			endDate		the end date
 * @param	{AjxCallback}	callback	the callback
 * @param	{String}		accountName	the account name
 */
ZmTasksApp.prototype.search =
function(folder, startDate, endDate, callback, accountName) {
	var params = {
		query:			(folder ? folder.createQuery() : "in:tasks"),
		types:			[ZmItem.TASK],
		limit:			this.getLimit(),
		searchFor:		ZmItem.TASK,
		callback:		callback,
		accountName:	(accountName || (folder && folder.getAccount().name))
	};
	var sc = appCtxt.getSearchController();
	sc.searchAllAccounts = false;
	sc.search(params);
};

/**
 * @private
 */
ZmTasksApp.prototype._newTaskFolderCallback =
function(parent, name, color) {
	var dialog = appCtxt.getNewTaskFolderDialog();
	dialog.popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.TASKS)._doCreate(parent, name, color);
};
