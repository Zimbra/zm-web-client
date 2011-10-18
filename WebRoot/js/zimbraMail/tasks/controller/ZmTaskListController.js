/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
 * This file contains the task list controller class.
 */

/**
 * Creates the task list controller.
 * @class
 * This class represents the task list controller.
 * 
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						app							the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmListController
 */
ZmTaskListController = function(container, app, type, sessionId, searchResultsController) {

	ZmListController.apply(this, arguments);

	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}

	this._listeners[ZmOperation.EDIT]				= this._editListener.bind(this);
	this._listeners[ZmOperation.PRINT_TASK]			= this._printTaskListener.bind(this);
	this._listeners[ZmOperation.PRINT_TASKFOLDER]	= this._printTaskFolderListener.bind(this);
	this._listeners[ZmOperation.SHOW_ORIG]			= this._showOrigListener.bind(this);
	this._listeners[ZmOperation.MARK_AS_COMPLETED]	= this._markAsCompletedListener.bind(this);
    this._listeners[ZmOperation.DELETE]				= this._deleteListener.bind(this);

	this._listeners[ZmOperation.PRINT]				= null; // override base class to do nothing
	
	this._currentTaskView = ZmId.VIEW_TASK_ALL;
};

ZmTaskListController.prototype = new ZmListController;
ZmTaskListController.prototype.constructor = ZmTaskListController;

ZmTaskListController.prototype.isZmTaskListController = true;
ZmTaskListController.prototype.toString = function() { return "ZmTaskListController"; };

// Consts
ZmTaskListController.SORT_BY = [
	ZmId.VIEW_TASK_NOT_STARTED,
	ZmId.VIEW_TASK_COMPLETED,
	ZmId.VIEW_TASK_IN_PROGRESS,
	ZmId.VIEW_TASK_WAITING,
	ZmId.VIEW_TASK_DEFERRED,
	ZmId.VIEW_TASK_ALL,
    ZmId.VIEW_TASK_TODO    
];

ZmTaskListController.ICON = {};
ZmTaskListController.ICON[ZmId.VIEW_TASK_NOT_STARTED]		= "TaskViewNotStarted";
ZmTaskListController.ICON[ZmId.VIEW_TASK_COMPLETED]			= "TaskViewCompleted";
ZmTaskListController.ICON[ZmId.VIEW_TASK_IN_PROGRESS]		= "TaskViewInProgress";
ZmTaskListController.ICON[ZmId.VIEW_TASK_WAITING]			= "TaskViewWaiting";
ZmTaskListController.ICON[ZmId.VIEW_TASK_DEFERRED]			= "TaskViewDeferred";
ZmTaskListController.ICON[ZmId.VIEW_TASK_ALL]				= "TaskList";
ZmTaskListController.ICON[ZmId.VIEW_TASK_TODO]				= "TaskViewTodoList";

ZmTaskListController.MSG_KEY = {};
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_NOT_STARTED]	= "notStarted";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_COMPLETED]		= "completed";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_IN_PROGRESS]	= "inProgress";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_WAITING]		= "waitingOn";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_DEFERRED]		= "deferred";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_ALL]			= "all";
ZmTaskListController.MSG_KEY[ZmId.VIEW_TASK_TODO]			= "todoList";

/**
 * Defines the status.
 */
ZmTaskListController.SOAP_STATUS = {};
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_NOT_STARTED]= "NEED";
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_COMPLETED]	= "COMP";
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_IN_PROGRESS]= "INPR";
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_WAITING]	= "WAITING";
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_DEFERRED]	= "DEFERRED";
ZmTaskListController.SOAP_STATUS[ZmId.VIEW_TASK_TODO]	= "NEED,INPR,WAITING";


// reading pane options
ZmTaskListController.READING_PANE_TEXT = {};
ZmTaskListController.READING_PANE_TEXT[ZmSetting.RP_OFF]	= ZmMsg.readingPaneOff;
ZmTaskListController.READING_PANE_TEXT[ZmSetting.RP_BOTTOM]	= ZmMsg.readingPaneAtBottom;
ZmTaskListController.READING_PANE_TEXT[ZmSetting.RP_RIGHT]	= ZmMsg.readingPaneOnRight;

// convert key mapping to view menu item
ZmTaskListController.ACTION_CODE_TO_MENU_ID = {};
ZmTaskListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_OFF]		= ZmSetting.RP_OFF;
ZmTaskListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_BOTTOM]	= ZmSetting.RP_BOTTOM;
ZmTaskListController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_RIGHT]	= ZmSetting.RP_RIGHT;

ZmTaskListController.READING_PANE_ICON = {};
ZmTaskListController.READING_PANE_ICON[ZmSetting.RP_OFF]	= "SplitPaneOff";
ZmTaskListController.READING_PANE_ICON[ZmSetting.RP_BOTTOM]	= "SplitPane";
ZmTaskListController.READING_PANE_ICON[ZmSetting.RP_RIGHT]	= "SplitPaneVertical";

ZmTaskListController.RP_IDS = [ZmSetting.RP_BOTTOM, ZmSetting.RP_RIGHT, ZmSetting.RP_OFF];

// Public methods

ZmTaskListController.prototype.show =
function(results, folderId) {

	this._folderId = folderId;

	this.setList(results.getResults(ZmItem.TASK));

	// XXX: WHY?
	// find out if we just searched for a shared tasks folder
	var folder = appCtxt.getById(folderId);
	this._list._isShared = folder ? folder.link : false;
	this._list.setHasMore(results.getAttribute("more"));

	ZmListController.prototype.show.call(this, results);

    if (this._taskMultiView) {
		var tlv = this._taskMultiView._taskListView;
		tlv._saveState({selection:true});
		tlv.reset();
	}

	this._setup(this._currentViewId);

	// reset offset if list view has been created
	var lv = this._listView[this._currentViewId];
	if (lv) { lv.offset = 0; }

	var elements = this.getViewElements(this._currentViewId, this._taskMultiView);
	
	this._setView({ view:		this._currentViewId,
					viewType:	this._currentViewType,
					elements:	elements,
					isAppView:	true});

	this._setTabGroup(this._tabGroups[this._currentViewId]);
	this._resetNavToolBarButtons();

    // do this last
	if (!this._taskTreeController) {
		this._taskTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.TASKS);
		DBG.timePt("getting tree controller", true);
	}

    this.getListView().setTaskInputVisible(folderId != ZmOrganizer.ID_TRASH);
};

ZmTaskListController.prototype.getCurrentView = 
function() {
	return this._taskMultiView;
};

/**
 * Switches the view.
 * 
 * @param	{DwtComposite}		view		the view
 */
ZmTaskListController.prototype.switchView =
function(view) {
	if (this._currentTaskView == view) { return; }
	this._currentTaskView = view;
    if (view == ZmSetting.RP_OFF ||	view == ZmSetting.RP_BOTTOM || view == ZmSetting.RP_RIGHT) {
		this._taskListView._colHeaderActionMenu = null;
		if (view != this._getReadingPanePref()) {
			this._setReadingPanePref(view);
			this._taskMultiView.setReadingPane();
		}
        // always reset the view menu button icon to reflect the current view
        var btn = this._toolbar[this._currentViewId].getButton(ZmOperation.VIEW_MENU);
        btn.setImage(ZmTaskListController.READING_PANE_ICON[view]);
	} else {
        // always reset the view menu button icon to reflect the current view
        var btn = this._toolbar[this._currentViewId].getButton(ZmOperation.SORTBY_MENU);
        btn.setImage(ZmTaskListController.ICON[view]);
	}
	var sc = appCtxt.getSearchController();
	var soapStatus = ZmTaskListController.SOAP_STATUS[view];
	sc.redoSearch(appCtxt.getCurrentSearch(), false, {allowableTaskStatus:soapStatus});
};

/**
 * Gets the task status.
 * 
 * @return	{constant}	the status (see {@link ZmTaskListController.SOAP_STATUS})
 */
ZmTaskListController.prototype.getAllowableTaskStatus =
function() {
	var tb = this._toolbar && this._toolbar[this._currentViewId];
	var menu = tb ? tb.getButton(ZmOperation.SORTBY_MENU).getMenu() : null;
	var mi = menu ? menu.getSelectedItem(DwtMenuItem.RADIO_STYLE) : null;
	var id = mi ? mi.getData(ZmOperation.MENUITEM_ID) : ZmId.VIEW_TASK_ALL;

	return ZmTaskListController.SOAP_STATUS[id];
};

ZmTaskListController.prototype._updateViewMenu =
function(id) {
	var viewBtn = this._toolbar[this._currentViewId].getButton(ZmOperation.VIEW_MENU);
	var menu = viewBtn && viewBtn.getMenu();
	if (menu) {
		var mi = menu.getItemById(ZmOperation.MENUITEM_ID, id);
		if (mi) {
			mi.setChecked(true, true);
		}
	}
};

ZmTaskListController.prototype.getKeyMapName =
function() {
	return "ZmTaskListController";
};

ZmTaskListController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmTaskListController.handleKeyAction");

    switch(actionCode) {

        case ZmKeyMap.MARK_COMPLETE:
        case ZmKeyMap.MARK_UNCOMPLETE:
            var task = this._listView[this._currentViewId].getSelection()[0];
            if ((task.isComplete() && actionCode == ZmKeyMap.MARK_UNCOMPLETE) ||
                    (!task.isComplete() && actionCode == ZmKeyMap.MARK_COMPLETE))
            {
                this._doCheckCompleted(task);
            }
            break;

        case ZmKeyMap.READING_PANE_BOTTOM:
		case ZmKeyMap.READING_PANE_RIGHT:
		case ZmKeyMap.READING_PANE_OFF:
			var menuId = ZmTaskListController.ACTION_CODE_TO_MENU_ID[actionCode];
			this._updateViewMenu(menuId);
            this.switchView(menuId);
			break;

        default:
            return ZmListController.prototype.handleKeyAction.call(this, actionCode);
    }

    return true;
};

ZmTaskListController.prototype.mapSupported =
function(map) {
	return (map == "list");
};

// override if reading pane is supported
ZmTaskListController.prototype._setupReadingPaneMenuItems = function() {};

/**
 * Checks if the reading pane is "on".
 *
 * @return	{Boolean}	<code>true</code> if the reading pane is "on"
 */
ZmTaskListController.prototype.isReadingPaneOn =
function() {
	return (this._getReadingPanePref() != ZmSetting.RP_OFF);
};

/**
 * Checks if the reading pane is "on" right.
 *
 * @return	{Boolean}	<code>true</code> if the reading pane is "on" right.
 */
ZmTaskListController.prototype.isReadingPaneOnRight =
function() {
	return (this._getReadingPanePref() == ZmSetting.RP_RIGHT);
};

ZmTaskListController.prototype._getReadingPanePref =
function() {
	return appCtxt.get(ZmSetting.READING_PANE_LOCATION_TASKS);
};

ZmTaskListController.prototype._setReadingPanePref =
function(value) {
	appCtxt.set(ZmSetting.READING_PANE_LOCATION_TASKS, value);
};


/**
 * Saves the task.
 * 
 * @param		{String}	name		the task name
 * @param		{AjxCallback}	callback	the save callback
 * 
 * @see	ZmTask
 */
ZmTaskListController.prototype.quickSave =
function(name, callback, errCallback) {
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

	task.save(null, callback, errCallback);
};

ZmTaskListController.getDefaultViewType =
function() {
	return ZmId.VIEW_TASKLIST;
};
ZmTaskListController.prototype.getDefaultViewType = ZmTaskListController.getDefaultViewType;

ZmTaskListController.prototype._createNewView =
function() {

    if (this._taskListView && this._dragSrc) {
		this._taskListView.setDragSource(this._dragSrc);
	}
	return this._taskListView;
};

ZmTaskListController.prototype._getToolBarOps =
function() {
	var toolbarOps =  [];
	toolbarOps.push(ZmOperation.EDIT,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE_MENU, ZmOperation.TAG_MENU,
			ZmOperation.SEP,
			ZmOperation.PRINT,
			ZmOperation.SEP,
            ZmOperation.SORTBY_MENU,
            ZmOperation.SEP,
            ZmOperation.MARK_AS_COMPLETED,
            ZmOperation.VIEW_MENU
            );
	
	return toolbarOps;
};

ZmTaskListController.prototype._initialize =
function(view) {
	// set up double pane view (which creates the TLV and TV)
	if (!this._taskMultiView){
		var dpv = this._taskMultiView = new ZmTaskMultiView({parent:this._container, posStyle:Dwt.ABSOLUTE_STYLE, controller:this, dropTgt:this._dropTgt});
        this._taskListView = dpv.getTaskListView();
	}
    
    if(view == ZmId.VIEW_TASK) {
        this._listView[view] = new ZmTaskView(this._container, DwtControl.ABSOLUTE_STYLE, this);
    }

    ZmListController.prototype._initialize.call(this, view);
};

ZmTaskListController.prototype.getTaskMultiView = 
function() {
		return this._taskMultiView;	
};

ZmTaskListController.prototype._initializeToolBar =
function(view) {
	if (this._toolbar[view]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.newTask, ZmMsg.createNewTask, "NewTask", "NewTaskDis", ZmOperation.NEW_TASK);
	this._setupPrintMenu(view);
    this._setupViewMenu(view);
	this._setupSortByMenu(view);
	this._setupMarkAsCompletedMenu(view);
	
	this._toolbar[view].getButton(ZmOperation.DELETE).setToolTipContent(ZmMsg.hardDeleteTooltip);

	this._toolbar[view].addFiller();
	this._initializeNavToolBar(view);
};

ZmTaskListController.prototype._handleSyncAll =
function() {
	//doesn't do anything now after I removed the appCtxt.get(ZmSetting.GET_MAIL_ACTION) == ZmSetting.GETMAIL_ACTION_DEFAULT preference stuff
};

ZmTaskListController.prototype.runRefresh =
function() {
	if (!appCtxt.isOffline) {
		return;
	}
	//should only happen in ZD

	this._syncAllListener();
};


ZmTaskListController.prototype._syncAllListener =
function(view) {
	var callback = new AjxCallback(this, this._handleSyncAll);
	appCtxt.accountList.syncAll(callback);
};


ZmTaskListController.prototype._sendReceiveListener =
function(ev) {
	var account = appCtxt.accountList.getAccount(ev.item.getData(ZmOperation.MENUITEM_ID));
	if (account) {
		account.sync();
	}
};

ZmTaskListController.prototype._setupMarkAsCompletedMenu = 
function(view) {
	var markAsCompButton = this._toolbar[view].getButton(ZmOperation.MARK_AS_COMPLETED);
	if(!markAsCompButton) { return; }
	
	markAsCompButton.setToolTipContent(ZmMsg.markAsCompleted);
	markAsCompButton.addSelectionListener(this._listeners[ZmOperation.MARK_AS_COMPLETED]);
	//markAsCompButton.noMenuBar = true;
}

ZmTaskListController.prototype._setupPrintMenu =
function(view) {
	var printButton = this._toolbar[view].getButton(ZmOperation.PRINT);
	if (!printButton) { return; }

	printButton.setToolTipContent(ZmMsg.printMultiTooltip);
	printButton.noMenuBar = true;
	var menu = new ZmPopupMenu(printButton);
	printButton.setMenu(menu);

	var id = ZmOperation.PRINT_TASK;
	var mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
	mi.setData(ZmOperation.MENUITEM_ID, id);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT_TASK]);

	id = ZmOperation.PRINT_TASKFOLDER;
	mi = menu.createMenuItem(id, {image:ZmOperation.getProp(id, "image"), text:ZmMsg[ZmOperation.getProp(id, "textKey")]});
	mi.setData(ZmOperation.MENUITEM_ID, id);
	mi.addSelectionListener(this._listeners[ZmOperation.PRINT_TASKFOLDER]);
};

ZmTaskListController.prototype._setupViewMenu =
function(view) {
    var btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
    var menu = btn.getMenu();
    var pref = this._getReadingPanePref();

    if (!menu) {
		menu = new ZmPopupMenu(btn);
		btn.setMenu(menu);
		for (var i = 0; i < ZmTaskListController.RP_IDS.length; i++) {
			var id = ZmTaskListController.RP_IDS[i];
			var params = {
				image:ZmTaskListController.READING_PANE_ICON[id],
				text:ZmTaskListController.READING_PANE_TEXT[id],
				style:DwtMenuItem.RADIO_STYLE
			};
			var mi = menu.createMenuItem(id, params);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			if (id == pref) {
				mi.setChecked(true, true);
			}
		}
        btn.setImage(ZmTaskListController.READING_PANE_ICON[pref]);
	}
};

ZmTaskListController.prototype._setupSortByMenu =
function(view) {
	var btn = this._toolbar[view].getButton(ZmOperation.SORTBY_MENU);
    
	var menu = btn.getMenu();
	if (!menu) {
		menu = new ZmPopupMenu(btn);
		btn.setMenu(menu);
		for (var i = 0; i < ZmTaskListController.SORT_BY.length; i++) {
			var id = ZmTaskListController.SORT_BY[i];
			if (id == ZmId.VIEW_TASK_ALL) {
				new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
			}
			var params = {
				image:ZmTaskListController.ICON[id],
				text:ZmMsg[ZmTaskListController.MSG_KEY[id]],
				style:DwtMenuItem.RADIO_STYLE
			};
			var mi = menu.createMenuItem(id, params);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);

			if (id == ZmId.VIEW_TASK_ALL) { // "all" is the default
				mi.setChecked(true, true);
			}
		}
		btn.setImage(ZmTaskListController.ICON[ZmId.VIEW_TASK_ALL]);
	}
};

ZmTaskListController.prototype._getActionMenuOps =
function() {
	return [
		ZmOperation.EDIT,
		ZmOperation.MARK_AS_COMPLETED,
		ZmOperation.SEP,
		ZmOperation.TAG_MENU,
		ZmOperation.DELETE,
		ZmOperation.MOVE,
		ZmOperation.PRINT_TASK,
		ZmOperation.SHOW_ORIG
	];
};

ZmTaskListController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagTask : ZmMsg.tagTasks;
};

ZmTaskListController.prototype._resetOperations =
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
    
	// a valid folderId means user clicked on a task list
	var folderId = (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;
	if (folderId) {
		var folder = appCtxt.getById(folderId);
		var isShare = folder && folder.link;
        var isTrash = folder && folder.id == ZmOrganizer.ID_TRASH;
		var canEdit = (folder == null || !folder.isReadOnly());

		parent.enable([ZmOperation.MOVE, ZmOperation.MOVE_MENU, ZmOperation.DELETE], canEdit && num > 0);
		parent.enable(ZmOperation.EDIT, !isTrash && canEdit && num == 1);
		parent.enable(ZmOperation.MARK_AS_COMPLETED, !isTrash && canEdit && num > 0);
		parent.enable(ZmOperation.TAG_MENU, (!isShare && num > 0));
	} else {
      	var task = this._listView[this._currentViewId].getSelection()[0];
		var canEdit = (num == 1 && !task.isReadOnly() && !ZmTask.isInTrash(task));
		parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU, ZmOperation.TAG_MENU], num > 0);
		parent.enable(ZmOperation.EDIT, canEdit);
        parent.enable(ZmOperation.MARK_AS_COMPLETED, canEdit && !task.isComplete())
    }
	var printButton = (parent instanceof ZmButtonToolBar) ? parent.getButton(ZmOperation.PRINT) : null;
	var printMenu = printMenu && printButton.getMenu();
	var printMenuItem = printMenu && printMenu.getItem(1);
	if (printMenuItem) {
		var text = (folderId != null) ? ZmMsg.printTaskFolder : ZmMsg.printResults;
		printMenuItem.setText(text);
	}

	var printOp = (parent instanceof ZmActionMenu) ? ZmOperation.PRINT_TASK : ZmOperation.PRINT;
	parent.enable(printOp, num > 0);
    parent.enable(ZmOperation.SORTBY_MENU, true);
    parent.enable(ZmOperation.VIEW_MENU, true)
    parent.enable(ZmOperation.TEXT, true);

    if (parent.getOp(ZmOperation.SHOW_ORIG)){
        var tasks = this._taskListView.getSelection();
        parent.enable(ZmOperation.SHOW_ORIG, num == 1 && tasks && tasks.length && tasks[0].getRestUrl() != null);
    }
};

ZmTaskListController.prototype._deleteListener =
function(ev) {

    var tasks = this._listView[this._currentViewId].getSelection();

    if (!tasks || tasks.length == 0) return;

    var folderId = (this._activeSearch && this._activeSearch.search) ? this._activeSearch.search.folderId : null;
    if (!folderId) {
        var showWarDlg = false;
        for (var i=0, cnt=tasks.length; i<cnt; i++) {
            if (tasks[i] && ZmTask.isInTrash(tasks[i])) {
                showWarDlg = true;
                break;
            }
        }
        if(showWarDlg) {
            var dialog = appCtxt.getOkCancelMsgDialog();
            dialog.reset();
            dialog.setMessage(ZmMsg.confirmItemDelete, DwtMessageDialog.WARNING_STYLE);
            dialog.registerCallback(DwtDialog.OK_BUTTON, this._deleteCallback, this, [dialog]);
            dialog.popup();
        }
    } else {
       this._doDelete(this._listView[this._currentViewId].getSelection());
    }
};

ZmTaskListController.prototype._deleteCallback =
function(dialog) {
	dialog.popdown();
	// hard delete
	this._doDelete(this._listView[this._currentViewId].getSelection());
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
    if (!tasks || tasks.length == 0) return;

    // check to see if this is a cancel or delete
    var nId = ZmOrganizer.normalizeId(tasks[0].folderId);
    var isTrash = nId == ZmOrganizer.ID_TRASH;

    if (isTrash) {
        this._handleDelete(tasks);
    }
    else {
        this._handleCancel(tasks);
    }
};

ZmTaskListController.prototype._handleDelete =
function(tasks) {
    var params = {
        items:			tasks,
        hardDelete:		true,
        finalCallback:	this._handleDeleteResponse.bind(this, tasks)
    };
    // NOTE: This makes the assumption that the task items to be deleted are
    // NOTE: always in a list (which knows how to hard delete items). But since
    // NOTE: this is the task *list* controller, I think that's a fair bet. ;)
    tasks[0].list.deleteItems(params);
};

ZmTaskListController.prototype._handleDeleteResponse = function(tasks, resp) {
    var summary = ZmList.getActionSummary(ZmMsg.actionDelete, tasks.length, ZmItem.TASK);
    appCtxt.setStatusMsg(summary);
};

ZmTaskListController.prototype._doCheckCompleted =
function(task,ftask) {
    var clone = ZmTask.quickClone(task);
    clone.message = null;
	var callback = new AjxCallback(this, this._doCheckCompletedResponse, [clone,ftask]);
	clone.getDetails(ZmCalItem.MODE_EDIT, callback);
};

ZmTaskListController.prototype._doCheckCompletedResponse =
function(task,ftask) {
	var clone = ZmTask.quickClone(task);
	clone.pComplete = task.isComplete() ? 0 : 100;
	clone.status = task.isComplete() ? ZmCalendarApp.STATUS_NEED : ZmCalendarApp.STATUS_COMP;
    if(!task.isComplete()) {  //bug:51913 disable alarm when stats is completed
        clone.alarm = false;
        clone.setTaskReminder(null);
    }
	clone.setViewMode(ZmCalItem.MODE_EDIT);
	var callback = new AjxCallback(this, this._markAsCompletedResponse, [clone,ftask]);
	clone.save(null, callback);
};

ZmTaskListController.prototype._markAsCompletedResponse = 
function(task,ftask) {
	if (task && task._orig)
		task._orig.message = null;
	//Cache the item for further processing
	task.cache();
	this._taskListView.updateListViewEl(task);
	if(ftask && this.isReadingPaneOn()) {
		this._taskMultiView.setTask(task);
	}
};

	
ZmTaskListController.prototype._handleCancel =
function(tasks) {
	var batchCmd = new ZmBatchCommand();
	var actionController = appCtxt.getActionController();
	var idList = [];
	for (var i = 0; i < tasks.length; i++) {
		var t = tasks[i];
		var cmd = new AjxCallback(t, t.cancel, [ZmCalItem.MODE_DELETE]);
		batchCmd.add(cmd);
		idList.push(t.id);
	}
	var actionLogItem = (actionController && actionController.actionPerformed({op: "trash", ids: idList, attrs: {l: ZmOrganizer.ID_TRASH}})) || null;
	batchCmd.run();
	var summary = ZmList.getActionSummary(ZmMsg.actionTrash, tasks.length, ZmItem.TASK);
	
	var undoLink = actionLogItem && actionController && actionController.getUndoLink(actionLogItem);
	if (undoLink && actionController) {
		actionController.onPopup();
		appCtxt.setStatusMsg({msg: summary+undoLink, transitions: actionController.getStatusTransitions()});
	} else {
		appCtxt.setStatusMsg(summary);
	}
};

ZmTaskListController.prototype._editTask =
function(task) {
	var mode = ZmCalItem.MODE_EDIT;

    var folder = appCtxt.getById(task.folderId);
    var canEdit = null;

    if(folder) {
        canEdit = folder.id != ZmOrganizer.ID_TRASH && !folder.isReadOnly();
    }
    
    if (!canEdit) {
		if (task.isException) mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
        var clone = ZmTask.quickClone(task);
		clone.getDetails(mode, new AjxCallback(this, this._showTaskReadOnlyView, clone));
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
        task.message = null; //null out message so we re-fetch task next time its opened
		task.getDetails(mode, new AjxCallback(this, this._showTaskEditView, [task, mode]));
	}
};

// All items in the list view are gone - show "No Results"
ZmTaskListController.prototype._handleEmptyList =
function(listView) {
	listView._resetListView();
	listView._setNoResultsHtml();
};

ZmTaskListController.prototype._setSelectedItem =
function() {
	var selCnt = this._listView[this._currentViewId].getSelectionCount();
	if (selCnt == 1) {
		var task = this._listView[this._currentViewId].getSelection();
	}
};

ZmTaskListController.prototype._showTaskReadOnlyView =
function(task) {
	var viewId = ZmId.VIEW_TASK;
    if(!this.isReadingPaneOn()) {
        var calItemView = this._listView[viewId];

        if (!calItemView) {
            this._setup(viewId);
            calItemView = this._listView[viewId];
        }

        calItemView.set(task, ZmId.VIEW_TASKLIST);
        this._resetOperations(this._toolbar[viewId], 1); // enable all buttons

		var elements = this.getViewElements(viewId, this._listView[viewId]);
		
        this._setView({	view:		viewId,
						elements:	elements,
						pushOnly:	true});
    } else {
        var calItemView = this._taskMultiView._taskView;
        if(calItemView) {
            calItemView.set(task, ZmId.VIEW_TASK);
        }
    }
};

ZmTaskListController.prototype._showTaskEditView =
function(task, mode) {
	this._app.getTaskController().show(task, mode);
};

ZmTaskListController.prototype._showTypeDialog =
function(task, mode) {
	if (!this._typeDialog) {
		this._typeDialog = new ZmCalItemTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener, [task, mode]));
	}
	this._typeDialog.initialize(task, mode, ZmItem.TASK);
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
	params.folderId = this._list.search.folderId;
	ZmListController.prototype._newListener.call(this, ev, op, params);
};

ZmTaskListController.prototype._listSelectionListener =
function(ev) {
	Dwt.setLoadingTime("ZmTaskItem", new Date());
    ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._editTask(ev.item);
	} else if(this.isReadingPaneOn()) {
        var task = ev.item;
        var mode = ZmCalItem.MODE_EDIT;
        var clone = ZmTask.quickClone(task);
        clone.getDetails(mode, new AjxCallback(this, this._showTaskReadOnlyView, clone));
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
	var task = this._listView[this._currentViewId].getSelection()[0];
	this._editTask(task);
};

ZmTaskListController.prototype._printTaskListener =
function(ev) {
	var listView = this._listView[this._currentViewId];
	var items = listView.getSelection();
	var taskIds = [];
	for (var i = 0; i < items.length; i++) {
		taskIds.push(items[i].invId);
	}

	var url = ["/h/printtasks?id=", taskIds.join(",")];
	if (appCtxt.isOffline) {
		var folderId = this._folderId || ZmFolder.ID_CONTACTS;
		var acctName = appCtxt.getById(folderId).getAccount().name;
		url.push("&acct=", acctName);
	}
	window.open([appContextPath, url.join(""), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)].join(""), "_blank");
};

ZmTaskListController.prototype._markAsCompletedListener = 
function(ev) {
	var listView = this._listView[this._currentViewId];
	var items = listView.getSelection();
	var fItem = null;
	for (var i = 0; i < items.length; i++) {
		var task = items[i];
		if (!task.isComplete()) {
			if(!fItem) fItem = true;
			this._doCheckCompleted(items[i],fItem);
		}	
	}
    var summary = ZmList.getActionSummary(ZmMsg.actionCompleted, items.length, ZmItem.TASK);
    appCtxt.setStatusMsg(summary);
};

ZmTaskListController.prototype._printListener =
function(ev) {
    this._printTaskListener(ev);
};

ZmTaskListController.prototype._printTaskFolderListener =
function(ev) {
	var url = ["/h/printtasks?"];
	if (this._folderId) {
		url.push("st=task&sfi=", this._folderId);
	} else {
		var taskIds = [];
		var list = this._list.getArray();
		for (var i = 0; i < list.length; i++) {
			taskIds.push(list[i].invId);
		}
        url.push("id=", taskIds.join(","));
	}
	if (appCtxt.isOffline) {
		var folderId = this._folderId || ZmFolder.ID_CONTACTS;
		var acctName = appCtxt.getById(folderId).getAccount().name;
		url.push("&acct=", acctName);
	}
	window.open([appContextPath, url.join(""), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)].join(""), "_blank");
};

ZmTaskListController.prototype._setViewContents =
function(view) {
	// load tasks into the given view and perform layout.
	var lv = this._taskListView;
	lv.set(this._list, ZmItem.F_DATE);

	if (lv.offset == 0) {
		var list = this._list.getVector();
		if (list.size()) {
            this._taskListView.setSelection(list.get(0));
        } else {
            this._taskMultiView._taskView.reset();
        }    
	}
};

ZmTaskListController.prototype._getMoveDialogTitle =
function(num) {
	return (num == 1) ? ZmMsg.moveTask : ZmMsg.moveTasks;
};

// Move stuff to a new folder.
ZmTaskListController.prototype._moveCallback =
function(folder) {
	this._doMove(this._pendingActionData, folder);
	this._clearDialog(appCtxt.getChooseFolderDialog());
	this._pendingActionData = null;
};

ZmTaskListController.prototype._showOrigListener =
function(ev) {
	var tasks = this._listView[this._currentViewId].getSelection();
	if (tasks && tasks.length > 0)
		setTimeout(AjxCallback.simpleClosure(this._showTaskSource, this, tasks[0]), 1); // Other listeners are focusing the main window, so delay the window opening for just a bit
};

ZmTaskListController.prototype._showTaskSource =
function(task) {
	var restUrl = task.getRestUrl();
	if (restUrl) {
		var url = [restUrl, (restUrl.indexOf("?")==-1) ? "?" : "&", "mime=text/plain", "&", "noAttach=1"].join("");
		var win = window.open(url, "TaskSource", "menubar=yes,resizable=yes,scrollbars=yes");
		appCtxt.handlePopupBlocker(win);
	}
};

/**
 * Gets the checked calendar folder ids.
 *
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmTaskListController.prototype.getTaskFolderIds =
function(localOnly) {
    var cc = [];
    if(localOnly) {
        if(this._taskTreeController) {
            if (appCtxt.multiAccounts) {
                var overviews = this._app.getOverviewContainer().getOverviews();
                for (var i in overviews) {
                    cc = cc.concat(this._taskTreeController.getTaskFolders(i, false));
                }
            } else {
                // bug fix #25512 - avoid race condition
                if (!this._app._overviewPanelContent) {
                    this._app.setOverviewPanelContent(true);
                }
                cc = this._taskTreeController.getTaskFolders(this._app.getOverviewId(), false);
            }
        } else {
            this._app._createDeferredFolders(ZmApp.TASKS);
            var list = appCtxt.accountList.visibleAccounts;
            for (var i = 0; i < list.length; i++) {
                var acct = list[i];
                if (!appCtxt.get(ZmSetting.TASKS_ENABLED, null, acct)) { continue; }

                var tasks = appCtxt.getFolderTree(acct).getByType(ZmOrganizer.TASKS);
                for (var j = 0; j < tasks.length; j++) {
                    if (tasks[j].nId == ZmOrganizer.ID_TRASH) {
                        continue;
                    }
                    cc.push(tasks[j]);
                }
            }

        }

        this._taskLocalFolderIds = [];

        for (var i = 0; i < cc.length; i++) {
            var cal = cc[i];
            if (cal.noSuchFolder) { continue; }

            if (cal.isRemote && !cal.isRemote()) {
                this._taskLocalFolderIds.push(cal.id);
            }
        }

        // return list of checked calendars
        return this._taskLocalFolderIds;
    }
};