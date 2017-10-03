/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the calendar view controller.
 * @class
 * The strategy for the calendar is to leverage the list view stuff by creating a single
 * view (i.e. {@link ZmCalViewMgr}) and have it manage the schedule views (e.g. week, month) and
 * a single calendar view (the calendar widget to the right). Each of the schedule views
 * will be a list view that are managed by the {@link ZmCalViewMgr}.
 * <p>
 * To do this we have to trick the {@link ZmListController}. Specifically we have only one toolbar and
 * directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
 * directly override the {@link ZmListControl.initializeToolBar} method.
 *
 * @param {DwtComposite}				container					the containing element
 * @param {ZmCalendarApp}				calApp						the handle to the calendar application
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmListController
 */
ZmCalViewController = function(container, calApp, sessionId, searchResultsController) {

	ZmListController.apply(this, arguments);
    
	var apptListener = this._handleApptRespondAction.bind(this);
	var apptEditListener = this._handleApptEditRespondAction.bind(this);

	// get view based on op
	ZmCalViewController.OP_TO_VIEW = {};
	ZmCalViewController.OP_TO_VIEW[ZmOperation.DAY_VIEW]		= ZmId.VIEW_CAL_DAY;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WEEK_VIEW]		= ZmId.VIEW_CAL_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.CAL_LIST_VIEW]	= ZmId.VIEW_CAL_LIST;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.FB_VIEW]			= ZmId.VIEW_CAL_FB;

	// get op based on view
	ZmCalViewController.VIEW_TO_OP = {};
	for (var op in ZmCalViewController.OP_TO_VIEW) {
		ZmCalViewController.VIEW_TO_OP[ZmCalViewController.OP_TO_VIEW[op]] = op;
	}

	this._listeners[ZmOperation.REPLY_ACCEPT]			= apptListener;
	this._listeners[ZmOperation.REPLY_DECLINE]			= apptListener;
	this._listeners[ZmOperation.REPLY_TENTATIVE]		= apptListener;
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]		= apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE]		= apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]	= apptEditListener;

	this._listeners[ZmOperation.SHOW_ORIG]				= this._showOrigListener.bind(this);
	this._listeners[ZmOperation.VIEW_APPOINTMENT]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.OPEN_APPT_INSTANCE]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.OPEN_APPT_SERIES]		= this._handleMenuViewAction.bind(this);
	this._listeners[ZmOperation.TODAY]					= this._todayButtonListener.bind(this);
	this._listeners[ZmOperation.NEW_APPT]				= this._newApptAction.bind(this);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT]		= this._newAllDayApptAction.bind(this);
	this._listeners[ZmOperation.SEARCH_MAIL]			= this._searchMailAction.bind(this);
	this._listeners[ZmOperation.MOVE]					= this._apptMoveListener.bind(this);
	this._listeners[ZmOperation.DELETE_INSTANCE]		= this._deleteListener.bind(this);
	this._listeners[ZmOperation.DELETE_SERIES]			= this._deleteListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT]			= this._forwardListener.bind(this);
    this._listeners[ZmOperation.PROPOSE_NEW_TIME]		= this._proposeTimeListener.bind(this);
    this._listeners[ZmOperation.REINVITE_ATTENDEES]		= this._reinviteAttendeesListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT_INSTANCE]	= this._forwardListener.bind(this);
	this._listeners[ZmOperation.FORWARD_APPT_SERIES]	= this._forwardListener.bind(this);
	this._listeners[ZmOperation.REPLY]					= this._replyListener.bind(this);
	this._listeners[ZmOperation.REPLY_ALL]				= this._replyAllListener.bind(this);
	this._listeners[ZmOperation.DUPLICATE_APPT]			= this._duplicateApptListener.bind(this);
    this._listeners[ZmOperation.PRINT_CALENDAR]			= this._printCalendarListener.bind(this);

	this._treeSelectionListener = this._calTreeSelectionListener.bind(this);
	this._maintTimedAction = new AjxTimedAction(this, this._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;
	this.apptCache = new ZmApptCache(this);
	this._currentViewIdOverride = ZmId.VIEW_CAL;	// public view ID
	
	ZmCalViewController.OPS = [
		ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW, ZmOperation.CAL_LIST_VIEW
	];
    if (appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED)) {
        ZmCalViewController.OPS.push(ZmOperation.FB_VIEW);    
    }
	var viewOpsListener = new AjxListener(this, this._viewActionMenuItemListener);
	for (var i = 0; i < ZmCalViewController.OPS.length; i++) {
		var op = ZmCalViewController.OPS[i];
		this._listeners[op] = viewOpsListener;
	}
	
	this._errorCallback = this._handleError.bind(this);

	// needed by ZmCalListView:
	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}
	
	this._clearCacheFolderMap = {};
	this._apptSessionId = {};
};

ZmCalViewController.prototype = new ZmListController;
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController.prototype.isZmCalViewController = true;
ZmCalViewController.prototype.toString = function() { return "ZmCalViewController"; };

ZmCalViewController.DEFAULT_APPOINTMENT_DURATION = 30*60*1000;

// maintenance needed on views and/or minical
ZmCalViewController.MAINT_NONE 		= 0x0; // no work to do
ZmCalViewController.MAINT_MINICAL 	= 0x1; // minical needs refresh
ZmCalViewController.MAINT_VIEW 		= 0x2; // view needs refresh
ZmCalViewController.MAINT_REMINDER	= 0x4; // reminders need refresh

// get view based on op
ZmCalViewController.ACTION_CODE_TO_VIEW = {};
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_DAY_VIEW]			= ZmId.VIEW_CAL_DAY;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WEEK_VIEW]			= ZmId.VIEW_CAL_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WORK_WEEK_VIEW]	= ZmId.VIEW_CAL_WORK_WEEK;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_MONTH_VIEW]		= ZmId.VIEW_CAL_MONTH;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_LIST_VIEW]			= ZmId.VIEW_CAL_LIST;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_FB_VIEW]		    = ZmId.VIEW_CAL_FB;

ZmCalViewController.CHECKED_STATE_KEY = "CalendarsChecked";

// Zimlet hack
ZmCalViewController.prototype.postInitListeners =
function () {
	if (ZmZimlet.listeners && ZmZimlet.listeners["ZmCalViewController"]) {
		for(var ix in ZmZimlet.listeners["ZmCalViewController"]) {
			if(ZmZimlet.listeners["ZmCalViewController"][ix] instanceof AjxListener) {
				this._listeners[ix] = ZmZimlet.listeners["ZmCalViewController"][ix];
			} else {
				this._listeners[ix] = new AjxListener(this, ZmZimlet.listeners["ZmCalViewController"][ix]);
			}
		}
	}
};

ZmCalViewController.getDefaultViewType =
function() {
	var setting = appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
    //This if loop has to be removed once bug 68708 is fixed
    if(setting === "schedule"){
        setting = ZmSetting.CAL_DAY;//Assigning day view as default view instead of schedule view as it is removed
    }
	return ZmCalendarApp.VIEW_FOR_SETTING[setting] || ZmId.VIEW_CAL_WORK_WEEK;
};
ZmCalViewController.prototype.getDefaultViewType = ZmCalViewController.getDefaultViewType;

/**
 * Gets the first day of week setting.
 * 
 * @return	{int}	the first day of week index
 */
ZmCalViewController.prototype.firstDayOfWeek =
function() {
	return appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};

ZmCalViewController.prototype.setCurrentViewId =
function(viewId) {
    if (viewId != ZmId.VIEW_CAL) {
        // Only store a real view id; VIEW_CAL is a placeholder used to identity the
        // constellation of calendar views to the AppViewMgr.  Cal views are handled
        // by their own ZmCalViewMgr.
        ZmController.prototype.setCurrentViewId.call(this, viewId);
    }
};

ZmCalViewController.prototype.show =
function(viewId, startDate, skipMaintenance) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	DBG.println(AjxDebug.DBG1, "ZmCalViewController.show, viewId = " + viewId);
	if (!viewId || viewId == ZmId.VIEW_CAL) {
		viewId = this.getCurrentViewType() || this.getDefaultViewType();
	}

	if (!this._viewMgr) {
		this.createViewMgr(startDate);
		this._setup(viewId); // TODO: Needed? Wouldn't this be handled by next conditional?
	}

	if (!this._viewMgr.getView(viewId)) {
		this._setup(viewId);
	}

	var previousView = this._viewMgr.getCurrentView();
	var hadFocus = previousView && previousView.hasFocus();

	this._viewMgr.setView(viewId);
	DBG.timePt("setup and set view");

	var elements = this.getViewElements(ZmId.VIEW_CAL, this._viewMgr);

	// we need to mark the current view _before_ actually setting the view,
	// otherwise we won't get the tab group added if the view already exists
	this._currentViewId = this._currentViewType = this._viewMgr.getCurrentViewName();

    this._setView({ view:		ZmId.VIEW_CAL,
					viewType:	this._currentViewType,
					elements:	elements,
					isAppView:	true});

    this.setCurrentListView(null);
    var currentView = this._listView[this._currentViewId] = this._viewMgr.getCurrentView();
	this._resetToolbarOperations(viewId);


	DBG.timePt("switching selection mode and tooltips");

    switch(viewId) {
        case ZmId.VIEW_CAL_DAY:
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousDay);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextDay);
            break;
        case ZmId.VIEW_CAL_WORK_WEEK:
            this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWorkWeek);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWorkWeek);
            break;
        case ZmId.VIEW_CAL_WEEK:
            this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWeek);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWeek);
            break;
        case ZmId.VIEW_CAL_MONTH:
            // use day until month does something
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousMonth);
            this._navToolBar[ZmId.VIEW_CAL].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextMonth);
            break;
        case ZmId.VIEW_CAL_LIST:
            this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
            break;
    }
    if (viewId == ZmId.VIEW_CAL_LIST) {
		this._navToolBar[ZmId.VIEW_CAL].setVisible(false);
	} else {
        if(viewId!=ZmId.VIEW_CAL_MONTH){this._viewMgr.getView(viewId).initializeTimeScroll();}
		this._navToolBar[ZmId.VIEW_CAL].setVisible(true);
		var navText = viewId == ZmId.VIEW_CAL_MONTH
			? currentView.getShortCalTitle()
			: currentView.getCalTitle();
		this._navToolBar[ZmId.VIEW_CAL].setText(navText);
		DBG.println(AjxDebug.DBG1, "ZmCalViewController.show, skipMaintenance = " + skipMaintenance);
		if (!skipMaintenance) {
			var work = ZmCalViewController.MAINT_VIEW;
			if (window.inlineCalSearchResponse) {
				this.processInlineCalSearch();
				window.inlineCalSearchResponse = null;
				work = ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER;
			}
			this._scheduleMaintenance(work);
		}
        if (!this.isSearchResults) {
            this.updateTimeIndicator(viewId);
        }
		DBG.timePt("scheduling maintenance");
	}

	if (hadFocus) {
		currentView.focus();
	}

	// do this last
	if (!this._calTreeController) {
		this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController) {
			if (appCtxt.multiAccounts) {
				var overviews = this._app.getOverviewContainer().getOverviews();
				for (var i in overviews) {
					this._calTreeController.addSelectionListener(i, this._treeSelectionListener);
				}
			} else {
				this._calTreeController.addSelectionListener(this._app.getOverviewId(), this._treeSelectionListener);
			}
			var calTree = appCtxt.getFolderTree();
			if (calTree) {
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));
			}
		}
		DBG.timePt("getting tree controller", true);
	}
};

/**
 * Updates the time indicator strip.
 *
 */
ZmCalViewController.prototype.updateTimeIndicator =
function(viewId) {
    viewId = viewId || this.getCurrentViewType();
    this._viewMgr.getView(viewId).startIndicatorTimer(this.isSearchResults);
};

/**
 * Gets the calendar tree controller.
 *
 * @return	{ZmCalendarTreeController}		the controller
 */
ZmCalViewController.prototype.getCalTreeController =
function() {
	return this._calTreeController;
};

ZmCalViewController.prototype.createViewMgr =
function(startDate) {
	var newDate = startDate || (this._miniCalendar ? this._miniCalendar.getDate() : new Date());

	if (!this._miniCalendar) {
		this._createMiniCalendar(newDate);
	}

	this._viewMgr = new ZmCalViewMgr(this._container, this, this._dropTgt);
	this._viewMgr.setDate(newDate);
	this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
	this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
	this._viewMgr.addViewActionListener(new AjxListener(this, this._viewActionListener));
	DBG.timePt("created view manager");
};

/**
 * Gets the checked calendars.
 * 
 * @param	{String}	overviewId		the overview id
 * @return	{Array}		an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCheckedCalendars =
function(includeTrash) {
	if (!this._checkedCalendars) {
		this._updateCheckedCalendars();
	}
    return includeTrash ? this._checkedCalendarsAll : this._checkedCalendars;
};

ZmCalViewController.prototype.getMainAccountCheckedCalendarIds =
function() {
    if (!this._checkedAccountCalendarIds) {
        // Generate the checked calendar data
        this._updateCheckedCalendars();
    }
    // If there are any account calendar ids, the 0th should be the main account - copy its checked calendars
    return (this._checkedAccountCalendarIds.length == 0) ? [] : this._checkedAccountCalendarIds[0].slice(0);
}

// Called whether starting on or offline
ZmCalViewController.prototype.getOfflineSearchCalendarIds =
function() {
    if (!this._offlineSearchCalendarIds) {

        var checkedCalendarHash = null;
        if (appCtxt.isWebClientOffline()) {
            checkedCalendarHash = this._retrieveCalendarCheckedState();
        }

        // Generate the checked calendar data - this will also store the calendar entries, if we are starting up online
        this._updateCheckedCalendars(checkedCalendarHash);
    }
    return (this._offlineSearchCalendarIds);
}

ZmCalViewController.prototype._storeCalendarCheckedState =
function() {
    // if !offline, store which calendars are currently checked, in localStorage.  This will be updated
    // while running, and reloaded if the app starts in offline mode.
    var calendarCheckedState = this._checkedCalendarIds.join(":");
    localStorage.setItem(ZmCalendarApp.CHECKED_STATE_KEY, calendarCheckedState);
}


ZmCalViewController.prototype._retrieveCalendarCheckedState =
function() {
    // Starting up offline, retrieve the stored calendar checked state
    var checkedStateText = localStorage.getItem(ZmCalendarApp.CHECKED_STATE_KEY);
    var checkedCalendarFolderIds = checkedStateText.split(":");
    var checkedCalendarHash = {};
    for (var i = 0; i < checkedCalendarFolderIds.length; i++) {
        checkedCalendarHash[checkedCalendarFolderIds[i]] = true;
    }
    return checkedCalendarHash;
}


/**
 * Gets the unchecked calendar folder ids for a owner email
 *
 * @param	{String}	ownerEmailId		email id of the owner account
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getUncheckedCalendarIdsByOwner =
function(ownerEmailId) {
	var dataTree = appCtxt.getTree(ZmId.ORG_CALENDAR, appCtxt.getActiveAccount()),
        calendars = dataTree.getByType(ZmId.ORG_CALENDAR),
        len = calendars.length,
        calIds = [],
        calendar,
        i;

    for (i=0; i<len; i++) {
        calendar = calendars[i];
        if(!calendar.isChecked && calendar.owner && calendar.owner == ownerEmailId) {
            calIds.push(calendar.id);
        }
    }
    return calIds;
};

/**
 * Gets the checked calendar folder ids.
 * 
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function(localOnly, includeTrash) {
	if (!this._checkedCalendarIds) {
		this.getCheckedCalendars(includeTrash);
		if (!this._checkedCalendarIds) {
			return [ZmOrganizer.ID_CALENDAR];
		}
	}
    // TODO: Do we also need to handle includeTrash here?
	return localOnly
		? this._checkedLocalCalendarIds
		: this._checkedCalendarIds;
};

/**
 * Gets the checked calendar folder ids.
 *
 * @param	{Boolean}	localOnly		if <code>true</code>, include local calendars only
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getOwnedCalendarIds =
function(email, includeTrash) {
    var i,
        cal,
        calendars,
        calIds = [];
    if(!this._calTreeController) {
        this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
    }

    calendars = this._calTreeController.getOwnedCalendars(this._app.getOverviewId(), email);
    for (i = 0; i < calendars.length; i++) {
        cal = calendars[i];
        if (cal) {
            if(!includeTrash && (cal.nId == ZmFolder.ID_TRASH)) { continue; }
            calIds.push(appCtxt.multiAccounts ? cal.id : cal.nId);
        }
    }

	return calIds;
};

/**
 * Gets the calendar folder ids used to create reminders.
 * All local calendars and shared calendars with the reminder flag set, checked or unchecked.
 * Does not include the trash folder.
 *
 * @return	{Array}		an array of folder ids
 */
ZmCalViewController.prototype.getReminderCalendarFolderIds =
function() {
	if (!this._reminderCalendarIds) {
		this._updateCheckedCalendars();
		if (!this._reminderCalendarIds) {
			return [ZmOrganizer.ID_CALENDAR];
		}
	}
	return this._reminderCalendarIds;
};

/**
 * Gets the checked organizers.
 *
 * @return {Array} array of {ZmOrganizer}
 */
ZmCalViewController.prototype.getCheckedOrganizers = function(includeTrash, acct) {
    var controller = appCtxt.getOverviewController();
    var overviewId = appCtxt.getApp(ZmApp.CALENDAR).getOverviewId(acct);
    var treeId = ZmOrganizer.CALENDAR;
    var treeView = controller.getTreeView(overviewId, treeId);
    var organizers = treeView.getSelected();
    if (!includeTrash) {
        for (var i = 0; i < organizers.length; i++) {
            if (organizers[i].id == ZmOrganizer.ID_TRASH) {
                organizers.splice(i, 1);
                break;
            }
        }
    }
    return organizers;
};

/**
 * Gets the checked organizer IDs.
 *
 * @return {Array} array of strings
 */
ZmCalViewController.prototype.getCheckedOrganizerIds = function() {
    return AjxUtil.map(this.getCheckedOrganizers(), ZmCalViewController.__map_id);
};
ZmCalViewController.__map_id = function(item) {
    return item.id;
};

ZmCalViewController.prototype._updateCheckedCalendars =
function(checkedCalendarHash) {
    var allCalendars = [];
	if (this._calTreeController) {
		if (appCtxt.multiAccounts) {
			var overviews = this._app.getOverviewContainer().getOverviews();
			for (var i in overviews) {
				allCalendars = allCalendars.concat(this._calTreeController.getCalendars(i));
			}
		} else {
			// bug fix #25512 - avoid race condition
			if (!this._app._overviewPanelContent) {
				this._app.setOverviewPanelContent(true);
			}
			allCalendars = this._calTreeController.getCalendars(this._app.getOverviewId());
		}
	} else {
		this._app._createDeferredFolders(ZmApp.CALENDAR);
        var ac = window.parentAppCtxt || window.appCtxt;
		var list = ac.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			var acct = list[i];
			if (!ac.get(ZmSetting.CALENDAR_ENABLED, null, acct)) { continue; }

			var folderTree = ac.getFolderTree(acct);
			var calendars = folderTree && folderTree.getByType(ZmOrganizer.CALENDAR);
			if (calendars) {
				for (var j = 0; j < calendars.length; j++) {
					// bug: 43067: skip the default calendar for caldav based accounts
					if (acct.isCalDavBased() && calendars[j].nId == ZmOrganizer.ID_CALENDAR) {
						continue;
					}
					allCalendars.push(calendars[j]);
				}
			}
		}
	}

    this._checkedCalendars = [];
    this._checkedCalendarIds = [];
    this._checkedLocalCalendarIds = [];
    this._checkedAccountCalendarIds = [];
    this._offlineSearchCalendarIds = [];
    this._reminderCalendarIds = [];
    var checkedAccountCalendarIds = {};
    var trashFolder = null;
    for (var i = 0; i < allCalendars.length; i++) {
        var cal = allCalendars[i];
        if (!cal.noSuchFolder) {
            this._offlineSearchCalendarIds.push(cal.id);
        }
        if (!cal.noSuchFolder && (cal.id != ZmOrganizer.ID_TRASH) &&
            (cal.isRemote && !cal.isRemote())) {
            this._reminderCalendarIds.push(cal.id);
        }
        var checked = cal.isChecked;
        if (checkedCalendarHash) {
            // LocalStorage values passed in upon offline startup, use those
            checked = checkedCalendarHash[cal.id] ? true : false;
            cal.isChecked = checked;
        }
        if (checked) {
            if (cal.id == ZmOrganizer.ID_TRASH) {
                trashFolder = cal;
            } else {
                this._checkedCalendars.push(cal);
            }
            if (!cal.noSuchFolder) {
                this._checkedCalendarIds.push(cal.id);
                if (cal.isRemote && !cal.isRemote()) {
                    this._checkedLocalCalendarIds.push(cal.id);
                }
                var acctId = (appCtxt.multiAccounts) ? cal.getAccount().id : appCtxt.accountList.mainAccount.id;
                if (!checkedAccountCalendarIds[acctId]) {
                    checkedAccountCalendarIds[acctId] = [];
                }
                checkedAccountCalendarIds[acctId].push(cal.id);
            }
        }
    }

    this._checkedCalendarsAll = trashFolder ? this._checkedCalendars.concat(trashFolder) : this._checkedCalendars;

    // convert hash to local array
    for (var i in checkedAccountCalendarIds) {
        this._checkedAccountCalendarIds.push(checkedAccountCalendarIds[i]);
    }

    if (!checkedCalendarHash) {
        // Not the initial call, update the stored calendar info.  Note this will be called when calendars are
        // checked/unchecked by the user (online or offline), and when notifications modifying the calendars
        // are received.
        this._storeCalendarCheckedState();
    }

    // return list of checked calendars
    return this._checkedCalendars;
};

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) { return; }

    // NOTE: This isn't called by the cal tree controller in all cases so
    // NOTE: we need to make sure the checked calendar list is up-to-date.
	this._updateCheckedCalendars();

	if (!this._calItemStatus) {
		this._calItemStatus = {};
	}

	if (ev.item) {
        var organizer = ev.item.getData && ev.item.getData(Dwt.KEY_OBJECT);
        if (organizer && organizer.nId == ZmOrganizer.ID_TRASH) {
            var found = false;
            var acct = organizer.getAccount();
            var organizers = this.getCheckedOrganizers(true, acct);
            for (var i = 0; i < organizers.length; i++) {
                var id = organizers[i].nId;
                if (id == ZmOrganizer.ID_TRASH) {
                    found = true;
                    break;
                }
            }
            this._viewMgr.setSubContentVisible(found);
            return;
        }
		ev.items = [ ev.item ];
	}
	if (ev.items && ev.items.length) {
		for (var i = 0; i < ev.items.length; i++) {
			var item = ev.items[i];
			this.__addCalItemStatus(item, item.getChecked());
		}
	}

	// update calendar state on time delay to avoid race condition
	if (!this._updateCalItemStateActionId) {
		this._updateCalItemStateActionId = AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._updateCalItemState), 1200);
	}
};

ZmCalViewController.prototype.__addCalItemStatus =
function(item, checked) {
	item.setChecked(checked);
	var organizer = item.getData(Dwt.KEY_OBJECT);
	if (organizer && organizer.type == ZmOrganizer.CALENDAR) {
        AjxDebug.println(AjxDebug.CALENDAR, " ---------------- calendar " +  organizer.name + " [" + organizer.id + "] is " + (checked ? "checked" : "unchecked"));
		this._calItemStatus[organizer.id] = {item: organizer, checked: checked};
	}

	// bug 6410
	var items = item.getItems();
	for (var i = 0; i < items.length; i++) {
		item = items[i];
		this.__addCalItemStatus(item, checked);
	}
};

ZmCalViewController.prototype._updateCalItemState =
function() {
	if (!this._calItemStatus) { return; }

	var accountName = appCtxt.isOffline && appCtxt.accountList.mainAccount.name;
	var batchCmd = new ZmBatchCommand(null, accountName, true);
	var itemCount = 0;
    for (var i in this._calItemStatus) {
        var info = this._calItemStatus[i];
        if (info.item) {
            var calendar = info.item;
            //If, Remote Calendars & not mount-points, dont send check/uncheck requests
            if ((calendar.isRemote() && (!calendar.isMountpoint || !calendar.zid))) {
                calendar.isChecked = info.checked;
                calendar.checkedCallback(info.checked);
                this._handleCheckedCalendarRefresh(calendar);
            } else {
                batchCmd.add(new AjxCallback(calendar, calendar.checkAction, [info.checked]));
                itemCount++;
            }
        }
    }

    if (appCtxt.multiAccounts) {
        this.apptCache.clearCache();
    }

    if (itemCount > 0) {
        if (appCtxt.isWebClientOffline()) {
            // The offlineCallback gets bound inside batchCmd.run to this
            var offlineCallback = this._handleOfflineCalendarCheck.bind(this, batchCmd);
            batchCmd.run(null, null, offlineCallback);
        } else {
            this._calItemStatus = {};
            batchCmd.run();
        }
    }

	this._updateCalItemStateActionId = null;
};

// Update the check change locally (a folder and its subfolders) and store the batch command into the request queue
ZmCalViewController.prototype._handleOfflineCalendarCheck =
function(batchCmd) {

    // Json batchCommand created in _updaetCalItemState above.  Must be Json to be stored in offline request queue
    var jsonObj = batchCmd.getRequestBody();

    this.apptCache.clearCache();
    // Apply the changes locally
    var calendarIds = [];
    for (var i in this._calItemStatus) {
        var info = this._calItemStatus[i];
        if (info.item) {
            var calendar = info.item;
            calendarIds.push(calendar.id);
            // Remote non-mountpoint has aleady been processed for local display - ignore it
            if (!(calendar.isRemote() && (!calendar.isMountpoint || !calendar.zid))) {
                calendar.isChecked = info.checked;
                calendar.checkedCallback(info.checked);
                this._handleCheckedCalendarRefresh(calendar);
            }
        }
    }
     this._calItemStatus = {};

    // Store the request for playback
    var jsonObjCopy = $.extend(true, {}, jsonObj);  //Always clone the object.  ?? Needed here ??
    // This should be the only BatchCommand queued for calendars for replay (for the FolderAction, checked).
    jsonObjCopy.methodName = "BatchRequest";
    // Modify the id to thwart ZmOffline._handleResponseSendOfflineRequest, which sends a DELETE
    // notification for the id - so a single calendar would get deleted in the UI
    jsonObjCopy.id = "C" + calendarIds.join(":");
    var value = {
        update:          true,
        methodName:      jsonObjCopy.methodName,
        id:              jsonObjCopy.id,
        value:           jsonObjCopy
    };

    // No callback - we apply the check changes, whether or not the request goes into the queue successfully
    ZmOfflineDB.setItemInRequestQueue(value);
};


ZmCalViewController.prototype._handleCheckedCalendarRefresh =
function(calendar){
	this._updateCheckedCalendars();
	this._refreshAction(true);
};

ZmCalViewController.prototype._calTreeChangeListener =
function(ev) {
	if (ev.event == ZmEvent.E_DELETE) {
		this._updateCheckedCalendars();
	}
    if (ev.event == ZmEvent.E_MODIFY) {
        var details = ev.getDetails(),
            fields = details ? details.fields : null;

        if (fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_RGB])) {
            this._refreshAction(true);
        }
	}
};

ZmCalViewController.prototype.getApptCache =
function(){
    return this.apptCache;
};
    
/**
 * Gets the calendar by folder id.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{ZmCalendar}	the calendar
 */
ZmCalViewController.prototype.getCalendar =
function(folderId) {
	return appCtxt.getById(folderId);
};

/**
 * Gets the calendar for the specified account.
 *
 * @param   {Hash}      params              Param hash
 * @param	{Boolean}	params.includeLinks	if <code>true</code>, include links
 * @param   {Boolean}   params.onlyWritable if <code>true</code> only writable calendars
 * @param	{ZmAccount}	params.account		the account
 * @return	{Array}	an array of {ZmCalendar} objects
 */
ZmCalViewController.prototype.getCalendars =
function(params) {
	params = params || {};
	var account = params.account;
	var includeLinks = params.includeLinks;
	var onlyWritable = params.onlyWritable;
	this._updateCheckedCalendars();
	var calendars = [];
	var organizers = appCtxt.getFolderTree(account).getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		if ((organizer.zid && !includeLinks) ||
			(appCtxt.multiAccounts &&
			 organizer.nId == ZmOrganizer.ID_CALENDAR &&
			 organizer.getAccount().isCalDavBased()))
		{
			continue;
		}

		if (account && organizer.getAccount() != account) { continue; }

		if (onlyWritable && organizer.isReadOnly()) continue;

		calendars.push(organizer);
	}
	calendars.sort(ZmCalViewController.__BY_NAME);
	return calendars;
};

ZmCalViewController.__BY_NAME =
function(a, b) {
	return a.name.localeCompare(b.name);
};

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

/**
 * Gets the calendar color.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the color
 */
ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) { return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]; }
	var cal = this.getCalendar(folderId);
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR];
};

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	//Return if a search is already in progress
	if (this.searchInProgress) {
		return;
	}
    this.setCurrentListView(null);
    
	// bug fix #33830 - force sync for calendar refresh
	if (appCtxt.isOffline) {
		appCtxt.accountList.syncAll();
	}

	var app = appCtxt.getApp(ZmApp.CALENDAR);
	// reset possibly set user query
	this._userQuery = null;
	if (app === appCtxt.getCurrentApp()) {
		var sc = appCtxt.getSearchController();
		sc.setSearchField("");
		sc.getSearchToolbar().blur();
	}
	app.currentSearch = null;
	app.currentQuery = null;
	this._refreshMaintenance = true;
    this.searchInProgress = false;
	this._refreshAction(false);

	var overview = appCtxt.getOverviewController().getOverview(app.getOverviewId());
	if (overview) {
		overview.clearSelection();
	}

};

// Move button has been pressed, show the dialog.
ZmCalViewController.prototype._apptMoveListener =
function(ev) {
	var items = this.getSelection();
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && divvied.readonly.length > 0) {
		var dlg = appCtxt.getMsgDialog();
		var list = [];
		if (divvied.normal.length > 0) {
			list = list.concat(divvied.normal);
		}
		if (divvied.recurring.length > 0) {
			list = list.concat(this._dedupeSeries(divvied.recurring));
		}
		var callback = (list.length > 0)
			? (new AjxCallback(this, this._moveListener, [ev, list])) : null;
		var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
		dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
		dlg.setMessage(ZmMsg.moveReadonly);
		dlg.popup();
	}
	else {
		this._moveListener(ev, this._dedupeSeries(items));
	}
};

ZmCalViewController.prototype._isItemMovable =
function(item, isShiftKey, folder) {
	return (!isShiftKey && !folder.isReadOnly() && !appCtxt.isWebClientOffline());
};

ZmCalViewController.prototype._moveCallback =
function(folder) {
	if (this.isMovingBetwAccounts(this._pendingActionData, folder.id)) {
        var dlg = appCtxt.getMsgDialog();
        dlg.setMessage(ZmMsg.orgChange, DwtMessageDialog.WARNING_STYLE);
        dlg.popup();
        return false;
    }else if (this.isMovingBetwAcctsAsAttendee(this._pendingActionData, folder.id)) {
		var dlg = appCtxt.getMsgDialog();
		dlg.setMessage(ZmMsg.apptInviteOnly, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	} else {
		this._doMove(this._pendingActionData, folder, null, false);
		this._clearDialog(appCtxt.getChooseFolderDialog());
		this._pendingActionData = null;
	}
};

ZmCalViewController.prototype._changeOrgCallback =
function(dlg, folder) {
	dlg.popdown();
	ZmListController.prototype._moveCallback.call(this, folder);
};

ZmCalViewController.prototype._doTag =
function(items, tag, doTag) {

	var list = this._getTaggableItems(items);

	if (doTag) {
		if (list.length > 0 && list.length == items.length) {
			// there are items to tag, and all are taggable
			ZmListController.prototype._doTag.call(this, list, tag, doTag);
		} else {
			var msg;
			var dlg = appCtxt.getMsgDialog();
			if (list.length > 0 && list.length < items.length) {
				// there are taggable and nontaggable items
				var listener = new AjxListener(this, this._handleDoTag, [dlg, list, tag, doTag]);
				dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
				msg = ZmMsg.tagReadonly;
			} else if (list.length == 0) {
				// no taggable items
				msg = ZmMsg.nothingToTag;
			}
			dlg.setMessage(msg);
			dlg.popup();
		}
	} else if (list.length > 0) {
		ZmListController.prototype._doTag.call(this, list, tag, doTag);
	}
};

ZmCalViewController.prototype._doRemoveAllTags =
function(items) {
	var list = this._getTaggableItems(items);
	ZmListController.prototype._doRemoveAllTags.call(this, list);
};

ZmCalViewController.prototype._handleDoTag =
function(dlg, list, tag, doTag) {
	dlg.popdown();
	ZmListController.prototype._doTag.call(this, list, tag, doTag);
};

ZmCalViewController.prototype._getTaggableItems =
function(items) {
	var divvied = (items.length > 1) ? this._divvyItems(items) : null;

	if (divvied && (divvied.readonly.length > 0 || divvied.shared.length > 0)) {
		// get a list of items that are "taggable"
		items = [];
		for (var i in divvied) {
			// we process read only appts b/c it can also mean any appt where
			// i'm not the organizer but still resides in my local folder.
			if (i == "shared") { continue; }

			var list = divvied[i];
			for (var j = 0; j < list.length; j++) {
				var appt = list[j];
				var calendar = appt.getFolder();
				if (calendar && !calendar.isRemote()) {
					items.push(appt);
				}
			}
		}
	}

	return items;
};

ZmCalViewController.prototype._getToolBarOps =
function() {
    var toolbarOptions = [
		ZmOperation.DELETE, ZmOperation.SEP, ZmOperation.MOVE_MENU,
		ZmOperation.TAG_MENU,
		ZmOperation.SEP,
		ZmOperation.PRINT_CALENDAR,
		ZmOperation.SEP,
		ZmOperation.TODAY,
        ZmOperation.FILLER,
        ZmOperation.DAY_VIEW,
        ZmOperation.WORK_WEEK_VIEW,
        ZmOperation.WEEK_VIEW,
		ZmOperation.MONTH_VIEW,
        ZmOperation.CAL_LIST_VIEW
	];
    if( appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED) ){
        toolbarOptions.push(ZmOperation.FB_VIEW);
    }
    return toolbarOptions;
};

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewId) {
	if (this._toolbar[ZmId.VIEW_CAL]) { return; }

	ZmListController.prototype._initializeToolBar.call(this, ZmId.VIEW_CAL_DAY);
	var toolbar = this._toolbar[ZmId.VIEW_CAL_DAY];

	// Set the other view toolbar entries to point to the Day view entry. Hack
	// to fool the ZmListController into thinking there are multiple toolbars
    this._toolbar[ZmId.VIEW_CAL_FB] = this._toolbar[ZmId.VIEW_CAL_WEEK] =
	this._toolbar[ZmId.VIEW_CAL_WORK_WEEK] = this._toolbar[ZmId.VIEW_CAL_MONTH] =
	this._toolbar[ZmId.VIEW_CAL_LIST] = this._toolbar[ZmId.VIEW_CAL_DAY];

	this._toolbar[ZmId.VIEW_CAL] = toolbar;

	// Setup the toolbar stuff
	toolbar.enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
	toolbar.enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);

	// We have style sheets in place to position the navigation toolbar at the
	// center of the main toolbar. The filler is usually at that location, so
	// to ensure that the semantic order matches the visual order as close as
	// possible, we position the navigation toolbar after it.
	var pos = AjxUtil.indexOf(this._getToolBarOps(), ZmOperation.FILLER) + 1;

	var tb = new ZmNavToolBar({
		parent: toolbar,
		index: pos,
		className: "ZmNavToolbar ZmCalendarNavToolbar",
		context: ZmId.VIEW_CAL,
		posStyle: Dwt.ABSOLUTE_STYLE
	});
	this._setNavToolBar(tb, ZmId.VIEW_CAL);

	var printButton = toolbar.getButton(ZmOperation.PRINT_CALENDAR);
	if (printButton) {
		printButton.setToolTipContent(ZmMsg.printCalendar);
	}

	toolbar.getButton(ZmOperation.DELETE).setToolTipContent(ZmMsg.hardDeleteTooltip);

	appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, viewId], {waitUntilLoaded:true});
};

ZmCalViewController.prototype._initializeTabGroup = function(viewId) {
	if (this._tabGroups[viewId]) {
		return;
	}

	ZmListController.prototype._initializeTabGroup.apply(this, arguments);

	// this is kind of horrible, but since list views don't normally have
	// children, we can't do this the right way by having a tab group in
	// ZmCalListView
	if (viewId === ZmId.VIEW_CAL_LIST) {
		var view = this._view[viewId];
		var topTabGroup = view._getSearchBarTabGroup();

		this._tabGroups[viewId].addMemberBefore(topTabGroup, view);
	}
}

ZmCalViewController.prototype.runRefresh =
function() {
	this._refreshButtonListener();
};

ZmCalViewController.prototype._setView =
function(params) {
	if (!this.isSearchResults) {
		ZmListController.prototype._setView.apply(this, arguments);
	}
};

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore since this will always be ZmId.VIEW_CAL as we are fooling
	// ZmListController (see our show method)
};

ZmCalViewController.prototype._getTagMenuMsg =
function(num) {
	return AjxMessageFormat.format(ZmMsg.tagAppts, num);
};

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
};

// Switch to selected view.
ZmCalViewController.prototype._viewActionMenuItemListener =
function(ev) {
	Dwt.setLoadingTime("ZmCalItemView");
	if (appCtxt.multiAccounts) {
		this.apptCache.clearCache();
	}
	var id = ev.item.getData(ZmOperation.KEY_ID);
    var viewType = ZmCalViewController.OP_TO_VIEW[id];
    //Check if the view is current calendar view
    if (this.getCurrentViewType() === viewType) {
        return;
    }
	this.show(viewType);
};

// Switch to selected view.
ZmCalViewController.prototype._viewMenuItemListener =
function(ev) {

};

/**
 * Creates the mini-calendar widget that sits below the overview.
 * 
 * @param {Date}		date		the date to highlight (defaults to today)
 * @private
 */
ZmCalViewController.prototype._createMiniCalendar =
function(date) {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar == null) {
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
	} else {
		this._miniCalendar = calMgr.getMiniCalendar();
		if (date != null) {
			this._miniCalendar.setDate(date, true);
		}
	}
	this._minicalMenu = calMgr._miniCalMenu;
	this._miniCalDropTarget = calMgr._miniCalDropTarget;
};

ZmCalViewController.prototype.recreateMiniCalendar =
function() {
	var calMgr = appCtxt.getCalManager();
	if (calMgr._miniCalendar != null) {
		var mc = calMgr.getMiniCalendar();
		var el = mc.getHtmlElement();
		var date = mc.getDate();
		if(el) {
			el.parentNode.removeChild(el);
		}
		this._miniCalendar = null;
		calMgr._miniCalendar = null;
		calMgr._createMiniCalendar(date);
		this._miniCalendar = calMgr.getMiniCalendar();
		this._createMiniCalendar();
	}
};

ZmCalViewController.prototype._miniCalDropTargetListener =
function(ev) {

	if (appCtxt.isWebClientOffline()) return;

	var data = ((ev.srcData.data instanceof Array) && ev.srcData.data.length == 1)
	? ev.srcData.data[0] : ev.srcData.data;

	// use shiftKey to create new Tasks if enabled. NOTE: does not support Contacts yet
	var shiftKey = appCtxt.get(ZmSetting.TASKS_ENABLED) && ev.uiEvent.shiftKey;

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		// Hack: in some instances ZmContact is reported as being an Array of
		//       length 1 (as well as a ZmContact) under FF1.5
		if (data instanceof Array && data.length > 1) {
			var foundValid = false;
			for (var i = 0; i < data.length; i++) {
				if (!shiftKey && (data[i] instanceof ZmContact)) {
					if (data[i].isGroup() && data[i].getGroupMembers().good.size() > 0) {
						foundValid = true;
					} else {
						var email = data[i].getEmail();
						if (email && email != "")
							foundValid = true;
					}
				} else {
					// theres other stuff besides contacts in here.. bail
					ev.doIt = false;
					return;
				}
			}

			// if not a single valid email was found in list of contacts, bail
			if (!foundValid) {
				ev.doIt = false;
				return;
			}
		} else {
			if (!this._miniCalDropTarget.isValidTarget(data)) {
				ev.doIt = false;
				return;
			}

			// If dealing with a contact, make sure it has a valid email address
			if (!shiftKey && data.isZmContact) {
				if (data.isGroup() && !data.isDistributionList()) {
					ev.doIt = (data.getGroupMembers().good.size() > 0);
				} else {
					var email = data.getEmail();
					ev.doIt = (email != null && email != "");
				}
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var dropDate = this._miniCalendar.getDndDate();

		if (dropDate) {
			// bug fix #5088 - reset time to next available slot
			var now = new Date();
			dropDate.setHours(now.getHours());
			dropDate.setMinutes(now.getMinutes());
			dropDate = AjxDateUtil.roundTimeMins(dropDate, 30);

			if ((data instanceof ZmContact) ||
				((data instanceof Array) && data[0] instanceof ZmContact))
			{
				this.newApptFromContact(data, dropDate);
			}
			else
			{
				if (shiftKey) {
					AjxDispatcher.require(["TasksCore", "Tasks"]);
					appCtxt.getApp(ZmApp.TASKS).newTaskFromMailItem(data, dropDate);
				} else {
					this.newApptFromMailItem(data, dropDate);
				}
			}
		}
	}
};

/**
 * This method will create a new appointment from a conversation/mail message. In the case
 * of a conversation, the appointment will be populated by the first message in the
 * conversation (or matched msg in the case of a search). This method is asynchronous and
 * will return immediately if the mail message must load in the background.
 *
 * @param {ZmConv|ZmMailMsg}	mailItem the may either be a conversation of message
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromMailItem =
function(mailItem, date) {
	var subject = mailItem.subject || "";
	if (mailItem instanceof ZmConv) {
		mailItem = mailItem.getFirstHotMsg();
	}
	mailItem.load({getHtml:false, markRead: true, forceLoad: true, noTruncate: true,
	               callback:new AjxCallback(this, this._msgLoadedCallback, [mailItem, date, subject])});
};

ZmCalViewController.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var newAppt = this._newApptObject(date, null, null, mailItem);
	newAppt.setFromMailMessage(mailItem, subject);
	
	 if (appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED)) {
        var addAttendeeDlg = this._attAttendeeDlg = appCtxt.getYesNoMsgDialog();
        addAttendeeDlg.reset();
        addAttendeeDlg.setMessage(ZmMsg.addRecipientstoAppt, DwtMessageDialog.WARNING_STYLE, ZmMsg.addAttendees);
        addAttendeeDlg.registerCallback(DwtDialog.YES_BUTTON, this._addAttendeeYesCallback, this, [newAppt]);
        addAttendeeDlg.registerCallback(DwtDialog.NO_BUTTON, this._addAttendeeNoCallback, this, [newAppt]);
        addAttendeeDlg.popup();
    }
    else {
        this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
    }
};

ZmCalViewController.prototype._addAttendeeYesCallback =
function(newAppt) {
    this._attAttendeeDlg.popdown();
    this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
};

ZmCalViewController.prototype._addAttendeeNoCallback =
function(newAppt) {
    this._attAttendeeDlg.popdown();
    newAppt.setAttendees(null,ZmCalBaseItem.PERSON);
    this.newAppointment(newAppt, ZmCalItem.MODE_NEW, true);
};


/**
 * This method will create a new appointment from a contact.
 *
 * @param {ZmContact}		contact the contact
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromContact =
function(contact, date) {
	var emails = [];
	var list = AjxUtil.toArray(contact);
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		if (item.isGroup() && !item.isDistributionList()) {
			var members = item.getGroupMembers().good.getArray();
			for (var j = 0; j < members.length; j++) {
				var e = members[j].address;
				if (e && e !== "") {
					emails.push(e);
				}
			}
		}
		else {
			// grab the first valid email address for this contact
			var e = item.getEmail();
			if (e && e !== "") {
				emails.push(e);
			}
		}
	}

	if (emails.length > 0) {
		var newAppt = this._newApptObject(date);
		newAppt.setAttendees(emails, ZmCalBaseItem.PERSON);
		this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
	}
};

/**
 * This method will create a new appointment from an email address.
 *
 * @param {String}	emailAddr	the email address
 * @param {Date}	date 	the date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromEmailAddr =
function(emailAddr, date) {
	if (!emailAddr || emailAddr == "") {return; }

	var newAppt = this._newApptObject(date);
	newAppt.setAttendees(emailAddr, ZmCalBaseItem.PERSON);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};

ZmCalViewController.prototype.getMiniCalendar =
function(delay) {
	if (!this._miniCalendar) {
		this._createMiniCalendar(null, delay);
	}
	return this._miniCalendar;
};

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
    this.setCurrentListView(null);
	this.setDate(new Date(), 0, false);
};

ZmCalViewController.prototype._newApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;

	if (d != null) {
		delete this._minicalMenu.__detail;
	} else {
		d = this._viewMgr ? this._viewMgr.getDate() : null;
	}

	// Bug 15686, eshum
	// Uses the selected timeslot if possible.
	var curr = this._viewVisible ? this._viewMgr.getDate() : new Date(); //new Date();
	if (d == null) {
		d = curr;
	} else {
		// bug fix #4693 - set the current time since it will be init'd to midnite
		d.setHours(curr.getHours());
		d.setMinutes(curr.getMinutes());
	}
	//bug:44423, Action Menu needs to select appropriate Calendar
	var calendarId = null;
	if (this._viewActionMenu && this._viewActionMenu._calendarId) {
		calendarId = this._viewActionMenu._calendarId;
		this._viewActionMenu._calendarId = null;
	}

	var loadCallback = new AjxCallback(this, this._handleLoadNewApptAction, [d, calendarId]);
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._searchMailAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) {
		delete this._minicalMenu.__detail;
		appCtxt.getSearchController().dateSearch(d, ZmId.SEARCH_MAIL);
	}
};

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) delete this._minicalMenu.__detail;
	else d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();

	//bug:44423, Action Menu needs to select appropriate Calendar
	var calendarId = null;
	if (this._viewActionMenu && this._viewActionMenu._calendarId) {
		calendarId = this._viewActionMenu._calendarId;
		this._viewActionMenu._calendarId = null;
	}

	var loadCallback = new AjxCallback(this, this._handleLoadNewAllDayApptAction, [d, calendarId]);
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewAllDayApptAction =
function(d, calendarId) {
	appCtxt.getAppViewMgr().popView(true, ZmId.VIEW_LOADING);	// pop "Loading..." page
	this.newAllDayAppointmentHelper(d, null, calendarId);
};

ZmCalViewController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	this._viewVisible = true;
	if (this._viewMgr.needsRefresh()) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
	}
    //this._app.setOverviewPanelContent();
};

ZmCalViewController.prototype._postHideCallback =
function() {
    if (appCtxt.multiAccounts) {
        var ovc = this._app.getOverviewContainer();
        var overviews = ovc.getOverviews();
        var overview;
        for (var ov in overviews) {
            ovc.getOverview(ov).zShow(false);
        }
    } else {
        overview =  this._app.getOverview();
        overview.zShow(false);
    }
    this._viewVisible = false;
};

ZmCalViewController.prototype.isCurrent =
function() {
    var currentView = this._viewMgr && this._viewMgr.getCurrentViewName();
    return (this._currentViewId === currentView);
};

ZmCalViewController.prototype._paginate =
function(viewId, forward) {
    this.setCurrentListView(null);
	var view = this._listView[viewId];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);
    this._viewMgr.getView(viewId).checkIndicatorNeed(viewId,d);
};

/**
 * Sets the date.
 * 
 * @param	{Date}		date		the date
 * @param	{int}		duration	the duration
 * @param	{Boolean}	roll		if <code>true</code>, roll
 */
ZmCalViewController.prototype.setDate =
function(date, duration, roll) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	// set mini-cal first so it will cache appts we might need
	if (this._miniCalendar.getDate() == null ||
		this._miniCalendar.getDate().getTime() != date.getTime())
	{
		this._miniCalendar.setDate(date, true, roll);
	}
	if (this._viewMgr != null) {
		this._viewMgr.setDate(date, duration, roll);
		var viewId = this._viewMgr.getCurrentViewName();
		var currentView = this._viewMgr.getCurrentView();
		var title = currentView.getCalTitle();
		Dwt.setTitle([ZmMsg.zimbraTitle, ": ", title].join(""));
		if (!roll &&
			this._currentViewType == ZmId.VIEW_CAL_WORK_WEEK &&
			!currentView.workingHours[date.getDay()].isWorkingDay &&
			(date.getDay() == 0 || date.getDay() == 6))
		{
			this.show(ZmId.VIEW_CAL_WEEK);
		}
		if (ZmId.VIEW_CAL_MONTH == this._currentViewType) {
			title = this._viewMgr.getCurrentView().getShortCalTitle();
		}
        if (ZmId.VIEW_CAL_FB == this._currentViewType && roll && appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED)) {
            currentView._navDateChangeListener(date);
		}
		this._navToolBar[ZmId.VIEW_CAL].setText(title);
	}
};

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
};

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		var loadCallback = new AjxCallback(this, this._handleLoadMiniCalSelection, [ev]);
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"], false, loadCallback, null, true);
	}
};

ZmCalViewController.prototype._handleLoadMiniCalSelection =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
	if (!this._viewVisible) {
		this.show();
	}
};

ZmCalViewController.prototype.newApptObject =
function(startDate, duration, folderId, mailItem) {
	return this._newApptObject(startDate, duration, folderId, mailItem);
};

ZmCalViewController.prototype._newApptObject =
function(startDate, duration, folderId, mailItem) {
	var newAppt = new ZmAppt();
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.resetRepeatYearlyMonthsList(startDate.getMonth()+1);
	newAppt.resetRepeatCustomDayOfWeek();
    var defaultWarningTime = appCtxt.get(ZmSetting.CAL_REMINDER_WARNING_TIME);
	if (defaultWarningTime) {
		newAppt.setReminderMinutes(defaultWarningTime);
	}

	if (folderId) {
		newAppt.setFolderId(folderId);
	} else {
		// get folderId from mail message if being created off of one
		if (appCtxt.multiAccounts && mailItem) {
			newAppt.setFolderId(mailItem.getAccount().getDefaultCalendar().id);
		} else {
			// bug: 27646 case where only one calendar is checked
			var checkedFolderIds = this.getCheckedCalendarFolderIds();
			if (checkedFolderIds && checkedFolderIds.length == 1) {
				var calId = checkedFolderIds[0];
				var cal = appCtxt.getById(calId);
				// don't use calendar if feed, or remote and don't have write perms
				if (cal) {
					var share = cal.getMainShare();
					var skipCal = (cal.isFeed() || (cal.link && share && !share.isWrite()));
					if (cal && !skipCal) {
						newAppt.setFolderId(calId);
					}
				}
			} else if (appCtxt.multiAccounts) {
				// calendar app has no notion of "active" app, so always set to default calendar
				this.defaultAccount = appCtxt.isFamilyMbox ? this.mainAccount : this.visibleAccounts[1];
				newAppt.setFolderId(calId);
			}
		}
	}
	newAppt.setPrivacy((appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV)?"PRI" :"PUB");
	return newAppt;
};

ZmCalViewController.prototype._timeSelectionListener =
function(ev) {
    if (!this._app.containsWritableFolder()) {
        return;
    }
	var view = this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[ZmId.VIEW_CAL_DAY], 0);
	}
	this.setDate(ev.detail, 0, ev.force);

	// popup the edit dialog
	if (ev._isDblClick){
		this._apptFromView = view;
		var appt = this._newApptObject(ev.detail);
		appt.setAllDayEvent(ev.isAllDay);
		if (ev.folderId) {
			appt.setFolderId(ev.folderId);
		}
		this._showQuickAddDialog(appt, ev.shiftKey);
	}
};

ZmCalViewController.prototype._printCalendarListener =
function(ev) {
	var url,
	    viewId = this._viewMgr.getCurrentViewName(),
        printDialog = this._printDialog,
        wHrs = ZmCalBaseView.parseWorkingHours(ZmCalBaseView.getWorkingHours()),
        curDate = this._viewMgr.getDate() || new Date();

    if(!printDialog) {
        printDialog = this.createPrintDialog();
    }

    var org = ZmApp.ORGANIZER[this._app._name] || ZmOrganizer.FOLDER;
    var params = {
                overviewId: appCtxt.getOverviewId(["ZmCalPrintDialog", this._app._name], null),
                treeIds: [org],
                treeStyle: DwtTree.CHECKEDITEM_STYLE,
                appName: this._app._name,
                currentViewId: viewId,
                workHours: wHrs[curDate.getDay()],
                currentDate: curDate,
                timeRange: this.getViewMgr().getView(viewId).getTimeRange()
            };

    printDialog.popup(params);

    this._printDialog = printDialog;
    /*
	if (viewId == ZmId.VIEW_CAL_LIST)
	{
		var ids = [];
		var list = this.getSelection();
		for (var i = 0; i < list.length; i++) {
			ids.push(list[i].invId);
		}
        url = ["/h/printappointments?id=", ids.join(','), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)];
        if(appCtxt.isOffline) {
            if (ids.length == 1) {
                var appt = this.getSelection()[0];
                url.push("&acct=", appt.getFolder().getAccount().name);
            }
            url.push("&zd=", "true");
        }
        url = url.join("");
    } else {
		var date = this._viewMgr
			? this._viewMgr.getDate()
			: (new Date());

		var day = (date.getDate() < 10)
			? ('0' + date.getDate())
			: date.getDate();

		var month = date.getMonth() + 1;
		if (month < 10) {
			month = '0' + month;
		}

		var view;
		switch (viewId) {
			case ZmId.VIEW_CAL_DAY: 		view = "day"; break;
			case ZmId.VIEW_CAL_WORK_WEEK:	view = "workWeek"; break;
			case ZmId.VIEW_CAL_WEEK:		view = "week"; break;
			case ZmId.VIEW_CAL_SCHEDULE:	view = "schedule"; break;
			default:						view = "month"; break;				// default is month
		}

		var folderIds = this.getCheckedCalendarFolderIds();
		var l = folderIds.join(",");

		url = [
			"/h/printcalendar?view=", view,
			"&l=", l,
			"&date=", date.getFullYear(), month, day,
			"&tz=",AjxTimezone.getServerId(AjxTimezone.DEFAULT)
		].join("");
	} */

	//window.open(appContextPath+url, "_blank");
};

ZmCalViewController.prototype.createPrintDialog =
function() {
    var pd,
        params = {},
        curDate = this._viewMgr.getDate() || new Date();

    //params.calendars = this.getCalTreeController().getOwnedCalendars(this._app.getOverviewId(), appCtxt.getActiveAccount().getEmail());
    params.parent = this._shell;
    pd = new ZmCalPrintDialog(params);
    return pd;
};

ZmCalViewController.prototype._printListener =
function(ev) {
    var ids = [];
    var list = this.getSelection();
    if (list.length == 0) {
        // Calendar list view is anomalous - on a right click (action menu) when resetOperations
        // is called, getSelection returns 1 item, but the selection actually only occurs if it was a
        // left click.  So we can get here with no selections.  Use the appt associated with the menu.
        var actionMenu = this.getActionMenu();
        var appt = actionMenu.__appt;
        if (appt) {
            ids.push(appt.invId);
        }
        // bug:68735 if no selection is made in the calendar, open up the print dialog
        else{
            this._printCalendarListener(ev);
        }

    }
    else {
        for (var i = 0; i < list.length; i++) {
            ids.push(list[i].invId);
        }
    }
    if (ids.length == 0) return;

    var url = ["/h/printappointments?id=", ids.join(','), "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)];
    if(appCtxt.isOffline) {
        if (ids.length == 1) {
            var appt = this.getSelection()[0];
            url.push("&acct=", appt.getFolder().getAccount().name);
        }
        url.push("&zd=", "true");
    }
    url = url.join("");

    window.open(appContextPath+url, "_blank");
};

ZmCalViewController.prototype._deleteListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doDelete(this.getSelection(), null, null, op);
};

ZmCalViewController.prototype._replyListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	if (items && items.length)
		this._replyAppointment(items[0], false);
};

ZmCalViewController.prototype._replyAllListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	if (items && items.length)
		this._replyAppointment(items[0], true);
};

ZmCalViewController.prototype._forwardListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	this._doForward(this.getSelection(), op);
};

ZmCalViewController.prototype._duplicateApptListener =
function(ev) {
	var op = (ev && ev.item instanceof DwtMenuItem)
		? ev.item.parent.getData(ZmOperation.KEY_ID) : null;
	var items = this.getSelection();
	var appt = items[0];
	var isException = (appt.isRecurring() && op == ZmOperation.VIEW_APPT_INSTANCE);
	this.duplicateAppt(appt, {isException: isException});
};

ZmCalViewController.prototype.duplicateAppt =
function(appt, params) {
	Dwt.setLoadingTime("ZmCalendarApp-cloneAppt");
	var clone = ZmAppt.quickClone(appt);
	var mode = ZmCalItem.MODE_EDIT;
	if (appt.isRecurring()) {
		mode = params.isException ? ZmCalItem.MODE_COPY_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;  //at first I also created a MODE_COPY_SERIES but I'm afraid of the impact and regressions. So keep it as "edit".
	}
	clone.getDetails(mode, new AjxCallback(this, this._duplicateApptContinue, [clone, ZmCalItem.MODE_NEW, params]));
	Dwt.setLoadedTime("ZmCalendarApp-cloneAppt");
};

ZmCalViewController.prototype._duplicateApptContinue =
function(appt, mode, params) {
	if(params.isException) appt.clearRecurrence();
	if(params.startDate) appt.setStartDate(params.startDate);
	if(params.endDate) appt.setEndDate(params.endDate);

    if (!appt.isOrganizer() || appt.isReadOnly()) {  //isOrganizer means current user is the organizer of the appt. (which is not the case if the appt is on a shared folder, even if the current user has admin or manager rights (i.e. not read only)
          var origOrganizer=appt.organizer;
          var myEmail=appt.getFolder().getAccount().getEmail();
          appt.replaceAttendee(myEmail,origOrganizer);
          appt.organizer=myEmail;
          appt.isOrg=true;
          if(appt.isShared()) {
            appt.isSharedCopy = true;
			if (!appt.getFolderId()) { //not sure why the following line is done, but if the appt is of a certain folder, it should be kept that folder in the copy.
            	appt.setFolderId(ZmOrganizer.ID_CALENDAR);
			}
          }
          var dlg = appCtxt.getMsgDialog();
		  var callback = new AjxCallback(this, this.newAppointment,[appt,mode,true]);
		  var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
		  dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
		  dlg.setMessage(ZmMsg.confirmApptDuplication);
		  dlg.popup();
    }
    else {
		appt.organizer = null; // Let the organizer be set according to the choise in the form. (the calendar).
	    this.newAppointment(appt, mode, true);
    }
};

ZmCalViewController.prototype._proposeTimeListener =
function(ev) {
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);

	var items = this.getSelection();

	// listview cannot handle proposing time for multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
		return;
	}

	var mode = ZmCalItem.MODE_EDIT;
	if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE
			: ZmCalItem.MODE_EDIT_SERIES;
	}

	var appt = items[0];
	var clone = ZmAppt.quickClone(appt);
	clone.setProposeTimeMode(true);
	clone.getDetails(mode, new AjxCallback(this, this._proposeTimeContinue, [clone, mode]));
};

ZmCalViewController.prototype._proposeTimeContinue =
function(appt, mode) {
	appt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(appt);
};

ZmCalViewController.prototype._reinviteAttendeesListener =
function(ev) {
    var items = this.getSelection();
    // listview cannot handle reinvite for multiple items at once
    if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
        return;
    }
    // Get the details.  Otherwise, on send, any missing information will be deleted server side
    var detailsSuccessCallback = this._sendAppt.bind(this, items[0]);
    items[0].getDetails(null, detailsSuccessCallback, this._errorCallback);
};

ZmCalViewController.prototype._sendAppt =
function(appt) {
    var mode = appt.viewMode;
    appt.viewMode =  ZmCalItem.MODE_EDIT;

    var callback = new AjxCallback(this, this._handleResponseSave, appt);
    var errorCallback = new AjxCallback(this, this._handleErrorSave, appt);
    appt.send(null, callback, errorCallback);

    appt.viewMode = mode;
};

ZmCalViewController.prototype._handleResponseSave =
function(response) {
    appCtxt.setStatusMsg(ZmMsg.apptSent);
};

ZmCalViewController.prototype._handleErrorSave =
function(calItem, ex) {
    var status = calItem.processErrorSave(ex);
    var handled = false;

    if (status.continueSave) {
        this._sendAppt(calItem);
        handled = true;
    } else {
        if (status.errorMessage) {
            // Handled the error, display the error message
            handled = true;
            var dialog = appCtxt.getMsgDialog();
            dialog.setMessage(status.errorMessage, DwtMessageDialog.CRITICAL_STYLE);
            dialog.popup();
        }
        appCtxt.notifyZimlets("onSaveApptFailure", [this, calItem, ex]);
    }
    return handled;
};

ZmCalViewController.prototype._doForward =
function(items, op) {
	// listview cannot handle forwarding multiple items at once
	if (this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST && items.length > 1) {
		return;
	}

	// since base view has multiple selection turned off, always select first item
	var appt = items[0];
	var mode = ZmCalItem.MODE_FORWARD;
	if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
		mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
			? ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE
			: ZmCalItem.MODE_FORWARD_SERIES;
	}
	this._forwardAppointment(appt, mode);
};

/**
 * Override the ZmListController method.
 * 
 * @private
 */
ZmCalViewController.prototype._doDelete =
function(items, hardDelete, attrs, op) {

    var isTrash = false;

	// listview can handle deleting multiple items at once
    if(items.length>0){
        var calendar = items[0].getFolder();
        isTrash = calendar && calendar.nId==ZmOrganizer.ID_TRASH;
    }

	if ((this._viewMgr.getCurrentViewName() == ZmId.VIEW_CAL_LIST || isTrash) && items.length > 1) {
		var divvied = this._divvyItems(items);

		// first attempt to deal with read-only appointments
		if (divvied.readonly.length > 0) {
			var dlg = appCtxt.getMsgDialog();
			var callback = (divvied.recurring.length > 0)
				? this._showTypeDialog.bind(this, [divvied.recurring, ZmCalItem.MODE_DELETE])
				: null;
			var listener = new AjxListener(this, this._handleReadonlyOk, [callback, dlg]);
			dlg.setButtonListener(DwtDialog.OK_BUTTON, listener);
			dlg.setMessage(ZmMsg.deleteReadonly);
			dlg.popup();
		}
		else if (divvied.recurring.length > 0) {
			this._showTypeDialog(divvied.recurring, ZmCalItem.MODE_DELETE);
		}
		else {
			this._promptDeleteApptList(divvied.normal);
		}
	}
	else {
		// since base view has multiple selection turned off, always select first item
		var appt = items[0];
		if (op == ZmOperation.VIEW_APPT_INSTANCE || op == ZmOperation.VIEW_APPT_SERIES) {
			var mode = (op == ZmOperation.VIEW_APPT_INSTANCE)
				? ZmCalItem.MODE_DELETE_INSTANCE
				: ZmCalItem.MODE_DELETE_SERIES;
			this._promptDeleteAppt(appt, mode);
		} else {
			this._deleteAppointment(appt);
		}
	}
};

ZmCalViewController.prototype._handleReadonlyOk =
function(callback, dlg) {
	dlg.popdown();
	if (callback) {
		callback.run();
	}
};

ZmCalViewController.prototype._handleMultiDelete =
function(deleteList, mode) {
	var batchCmd = new ZmBatchCommand(true, null, true);

	// first, get details for each appointment
	for (var i = 0; i < deleteList.length; i++) {
		var appt = deleteList[i];
		var args = [mode, null, null, null, null];
		batchCmd.add(new AjxCallback(appt, appt.getDetails, args));
	}
	batchCmd.run(this._handleGetDetails.bind(this, deleteList, mode));
};

ZmCalViewController.prototype._handleGetDetails =
function(deleteList, mode) {
	var batchCmd = new ZmBatchCommand(true, null, true);
	for (var i = 0; i < deleteList.length; i++) {
		var appt = deleteList[i];
		var args = [mode, null, null, null];
		batchCmd.add(new AjxCallback(appt, appt.cancel, args));
	}
	batchCmd.run();
	var summary = ZmList.getActionSummary({
		actionTextKey:  'actionDelete',
		numItems:       batchCmd.size(),
		type:           ZmItem.APPT
	});
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", deleteList);//notify Zimlets on delete
};

ZmCalViewController.prototype.getSelection =
function() {
    return ZmListController.prototype.getSelection.call(this, this.getCurrentListView());
};

ZmCalViewController.prototype.getSelectionCount = function() {
    return ZmListController.prototype.getSelectionCount.call(this, this.getCurrentListView());
};

ZmCalViewController.prototype._divvyItems =
function(items) {

	var normal = [];
	var readonly = [];
	var recurring = [];
	var shared = [];

	for (var i = 0; i < items.length; i++) {
		var appt = items[i];
		if (appt.type != ZmItem.APPT) { continue; }

		if (appt.isFolderReadOnly()) {
			readonly.push(appt);
		}
		else if (appt.isRecurring() && !appt.isException) {
			recurring.push(appt);
		}
		else {
			normal.push(appt);
		}

		// keep a separate list of shared items. This means "recurring" and
		// "normal" can contain shared items as well.
		var calendar = appt.getFolder();
		if (calendar && calendar.isRemote()) {
			shared.push(appt);
		}
	}

	return {normal:normal, readonly:readonly, recurring:recurring, shared:shared};
};

ZmCalViewController.prototype._promptDeleteApptList =
function(deleteList) {
	if (deleteList.length === 0) {
		return;
	}
	var calendar = deleteList[0].getFolder();
	var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var msg = (isTrash) ? ZmMsg.confirmCancelApptListPermanently : ZmMsg.confirmCancelApptList;
	var callback = this._handleMultiDelete.bind(this, deleteList, ZmCalItem.MODE_DELETE);
	appCtxt.getConfirmationDialog().popup(msg, callback);
};

ZmCalViewController.prototype._promptDeleteAppt =
function(appt, mode) {
    if(!appt){
        return;
    }
	if (appt instanceof Array) {
		this._continueDelete(appt, mode);
	} else {
		if (appt.isOrganizer()) {
			if (mode == ZmCalItem.MODE_DELETE_SERIES) {
				this._promptDeleteFutureInstances(appt, mode);
			} else {
				this._promptCancelReply(appt, mode);
			}
		} else {
			this._promptDeleteNotify(appt, mode);
		}
	}
};
ZmCalViewController.prototype._confirmDeleteApptDialog =
function(){

    if (!ZmCalViewController._confirmDialog) {
        var editMessageButton =new DwtDialog_ButtonDescriptor(DwtDialog.YES_BUTTON, ZmMsg.editMessage , DwtDialog.ALIGN_LEFT);
        var buttons = [ DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON ];
        var extraButtons = [editMessageButton];
        ZmCalViewController._confirmDialog = new DwtConfirmDialog(this._shell, null, "CNF_DEL_SENDEDIT", buttons, extraButtons);
        var noButton = ZmCalViewController._confirmDialog.getButton(DwtDialog.NO_BUTTON);
        noButton.setText(ZmMsg.sendCancellation); // Changing the text for No button
	}
	return ZmCalViewController._confirmDialog;
};

ZmCalViewController.prototype._promptCancelReply =
function(appt, mode) {
	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
    var confirmDialog;
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId==ZmOrganizer.ID_TRASH;

    // Display traditional Yes/No Dialog if
    // - If appt has no attendees
    // - appt is from trash
    // - appt is saved but not sent
	if (!isTrash && appt.otherAttendees && !appt.inviteNeverSent && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
        confirmDialog = this._confirmDeleteApptDialog();
        var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);

        confirmDialog.setTitle(ZmMsg.confirmDeleteApptTitle);
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
        confirmDialog = appCtxt.getConfirmationDialog("CNF_DEL_YESNO");
		var msg = isTrash ? ZmMsg.confirmPermanentCancelAppt : ZmMsg.confirmCancelAppt;

		if (appt.isRecurring() && !appt.isException && !isTrash) {
	    	msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE) ? AjxMessageFormat.format(ZmMsg.confirmCancelApptInst, AjxStringUtil.htmlEncode(appt.name)) :  ZmMsg.confirmCancelApptSeries; 
		}
        confirmDialog.setTitle(ZmMsg.confirmDeleteApptTitle);
		confirmDialog.popup(msg, cancelNoReplyCallback);
	}
};

ZmCalViewController.prototype._promptDeleteFutureInstances =
function(appt, mode) {

    if (appt.getAttendees(ZmCalBaseItem.PERSON).length>0) {
        this._delFutureInstNotifyDlgWithAttendees = this._delFutureInstNotifyDlgWithAttendees ?
            this._delFutureInstNotifyDlgWithAttendees : (new ZmApptDeleteNotifyDialog({
			    parent: this._shell,
			    title: AjxMsg.confirmTitle,
			    confirmMsg: ZmMsg.confirmCancelApptSeries,
			    choiceLabel1: ZmMsg.confirmCancelApptWholeSeries,
			    choiceLabel2 : ZmMsg.confirmCancelApptFutureInstances,
                choice2WarningMsg : ZmMsg.deleteApptWarning
		    }));
        this._delFutureInstNotifyDlg = this._delFutureInstNotifyDlgWithAttendees;
    }
    else{
            this._delFutureInstNotifyDlgWithoutAtteendees = this._delFutureInstNotifyDlgWithoutAtteendees ?
                this._delFutureInstNotifyDlgWithoutAtteendees : (new ZmApptDeleteNotifyDialog({
			        parent: this._shell,
			        title: ZmMsg.confirmDeleteApptTitle,
			        confirmMsg: ZmMsg.confirmCancelApptSeries,
			        choiceLabel1: ZmMsg.confirmDeleteApptWholeSeries,
                    choiceLabel2 : ZmMsg.confirmDeleteApptFutureInstances,
                    choice2WarningMsg : ZmMsg.deleteApptWarning
		        }));
        this._delFutureInstNotifyDlg = this._delFutureInstNotifyDlgWithoutAtteendees;
    }
	this._delFutureInstNotifyDlg.popup(new AjxCallback(this, this._deleteFutureInstYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteFutureInstYesCallback =
function(appt, mode) {
	var deleteWholeSeries = this._delFutureInstNotifyDlg.isDefaultOptionChecked();
	if (!deleteWholeSeries) {
		appt.setCancelFutureInstances(true);
	}

	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);

    var confirmDialog = this._confirmDeleteApptDialog();
	if (appt.otherAttendees && !appt.inviteNeverSent && appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
		confirmDialog.popup(ZmMsg.sendCancellationConfirmation, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._promptDeleteNotify =
function(appt, mode) {
	if (!this._deleteNotifyDialog) {
		this._deleteNotifyDialog = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: "",
            choiceLabel1: ZmMsg.dontNotifyOrganizer,
			choiceLabel2 : ZmMsg.notifyOrganizer
		});
	}
    if(this._deleteMode != mode){
        var msg = ZmMsg.confirmCancelAppt;
        if(appt.isRecurring()){
            msg = (mode == ZmCalItem.MODE_DELETE_INSTANCE)
    			? AjxMessageFormat.format(ZmMsg.confirmCancelApptInst, AjxStringUtil.htmlEncode(appt.name))
    			: ZmMsg.confirmCancelApptSeries;
        }
        var msgDiv = document.getElementById(this._deleteNotifyDialog._confirmMessageDivId);
        msgDiv.innerHTML = msg;
        this._deleteMode = mode;
    }
	this._deleteNotifyDialog.popup(new AjxCallback(this, this._deleteNotifyYesCallback, [appt,mode]));
};

ZmCalViewController.prototype._deleteNotifyYesCallback =
function(appt, mode) {
	var notifyOrg = !this._deleteNotifyDialog.isDefaultOptionChecked();
	if (notifyOrg) {
		this._cancelBeforeDelete(appt, mode);
	} else {
		this._continueDelete(appt, mode);
	}
};

ZmCalViewController.prototype._cancelBeforeDelete =
function(appt, mode) {
	var type = ZmOperation.REPLY_DECLINE;
	var respCallback = new AjxCallback(this, this._cancelBeforeDeleteContinue, [appt, type, mode]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._cancelBeforeDeleteContinue =
function(appt, type, mode) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
    var delContCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
	msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(),false,null,null,delContCallback);
};


ZmCalViewController.prototype._deleteAppointment =
function(appt) {
	if (!appt) { return; }

    var calendar = appt.getFolder();
    var isTrash =  calendar && calendar.nId == ZmOrganizer.ID_TRASH;

	if (appt.isRecurring() && !isTrash && !appt.isException) {
		this._showTypeDialog(appt, ZmCalItem.MODE_DELETE);
	} else {
		this._promptDeleteAppt(appt, ZmCalItem.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDeleteReply =
function(appt, mode) {
	var action = ZmOperation.REPLY_CANCEL;
	var respCallback = new AjxCallback(this, this._continueDeleteReplyRespondAction, [appt, action, mode]);
	appt.getDetails(mode, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._continueDeleteReplyRespondAction =
function(appt, action, mode) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg._appt = appt;
	msg._mode = mode;
	msgController.setMsg(msg);
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msg._instanceDate = instanceDate;
	msgController._editInviteReply(action, 0, instanceDate);
};

ZmCalViewController.prototype._continueDelete =
function(appt, mode) {
	if (appt instanceof Array) {
		// if list of appointments, de-dupe the same series appointments
		var deleteList = (mode === ZmCalItem.MODE_DELETE_SERIES) ? this._dedupeSeries(appt) : appt;
		this._handleMultiDelete(deleteList, mode);
	}
	else {
		var respCallback = new AjxCallback(this, this._handleResponseContinueDelete, appt);
		appt.cancel(mode, null, respCallback, this._errorCallback);
	}
};

ZmCalViewController.prototype._handleResponseContinueDelete =
function(appt) {

    var currentView = appCtxt.getCurrentView();
    if (currentView && currentView.isZmApptView) {
        currentView.close();
    }

	var summary = ZmList.getActionSummary({
		actionTextKey:  'actionDelete',
		numItems:       1,
		type:           ZmItem.APPT
	});
	appCtxt.setStatusMsg(summary);
	appCtxt.notifyZimlets("onAppointmentDelete", [appt]);//notify Zimlets on delete 
};

/**
 * This method takes a list of recurring appointments and returns a list of
 * unique appointments (removes instances)
 *
 * @param list		[Array]		List of *recurring* appointments
 * 
 * @private
 */
ZmCalViewController.prototype._dedupeSeries =
function(list) {
	var unique = [];
	var deduped = {};
	for (var i = 0; i < list.length; i++) {
		var appt = list[i];
		if (!deduped[appt.id]) {
			deduped[appt.id] = true;
			unique.push(appt);
		}
	}
	return unique;
};

ZmCalViewController.prototype._getMoveParams =
function(dlg) {
	var params = ZmListController.prototype._getMoveParams.apply(this, arguments);
	var omit = {};
	var folderTree = appCtxt.getFolderTree();
	if (!folderTree) { return params; }

	var folders = folderTree.getByType(ZmOrganizer.CALENDAR);
	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.link && folder.isReadOnly()) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	params.description = ZmMsg.targetCalendar;

	return params;
};

ZmCalViewController.prototype._getMoveDialogTitle =
function(num) {
	return AjxMessageFormat.format(ZmMsg.moveAppts, num);
};

/**
 * Shows a dialog for handling recurring appointments. User must choose to
 * perform the action on the instance of the series of a recurring appointment.
 *
 * @param appt		[ZmAppt]	This can be a single appt object or a *list* of appts
 * @param mode		[Integer]	Constant describing what kind of appointments we're dealing with
 * 
 * @private
 */
ZmCalViewController.prototype._showTypeDialog =
function(appt, mode) {
	if (this._typeDialog == null) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		this._typeDialog = new ZmCalItemTypeDialog({
			id: 'CAL_ITEM_TYPE_DIALOG',
			parent: this._shell
		});
		this._typeDialog.registerCallback(DwtDialog.OK_BUTTON, this._typeOkListener, this);
		this._typeDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._typeCancelListener, this);
	}
	this._typeDialog.initialize(appt, mode, ZmItem.APPT);
	this._typeDialog.popup();
};

ZmCalViewController.prototype.showApptReadOnlyView =
function(appt, mode) {
	var clone = ZmAppt.quickClone(appt);
	clone.getDetails(mode, new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]));
};

ZmCalViewController.prototype._showApptReadOnlyView =
function(appt, mode) {
	var controller = this._app.getApptViewController(this._apptSessionId[appt.invId]);
	this._apptSessionId[appt.invId] = controller.getSessionId();
	controller.show(appt, mode);
};

ZmCalViewController.prototype._showQuickAddDialog =
function(appt, shiftKey) {
    if(appCtxt.isExternalAccount() || appCtxt.isWebClientOffline()) { return; }
	// find out if we really should display the quick add dialog
	var useQuickAdd = appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD);
	if ((useQuickAdd && !shiftKey) || (!useQuickAdd && shiftKey)) {
		if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
			var timezonePicker = this.getTimezonePicker();
			var callback = new AjxCallback(this, this.handleTimezoneSelectionQuickAdd, [appt, shiftKey]);
			timezonePicker.setCallback(callback);
			timezonePicker.popup();
		} else {
			this._showQuickAddDialogContinue(appt, shiftKey);
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._showQuickAddDialogContinue =
function(appt, shiftKey) {
	if (this._quickAddDialog == null) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar", "CalendarAppt"]);
		this._quickAddDialog = new ZmApptQuickAddDialog(this._shell);
		this._quickAddDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._quickAddOkListener));
		this._quickAddDialog.addSelectionListener(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, new AjxListener(this, this._quickAddMoreListener));
	}
	this._quickAddDialog.initialize(appt);
	this._quickAddDialog.popup();
};

ZmCalViewController.prototype.newAppointmentHelper =
function(startDate, optionalDuration, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, optionalDuration, folderId);
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAllDayAppointmentHelper =
function(startDate, endDate, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, null, folderId);
	if (endDate) {
		appt.setEndDate(endDate);
	}
	appt.setAllDayEvent(true);
	appt.freeBusy = "F";
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAppointment =
function(newAppt, mode, isDirty, startDate) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	var sd = startDate || (this._viewVisible ? this._viewMgr.getDate() : new Date());
	var appt = newAppt || this._newApptObject(sd, (appCtxt.get(ZmSetting.CAL_DEFAULT_APPT_DURATION) * 1000));  //bug:50121 added appt duration as configurable from preference

    //certain views can set attendees before creating appointment
    if(this._viewVisible && this._viewMgr.getCurrentView().getAtttendees) {
        var attendees = this._viewMgr.getCurrentView().getAtttendees();
        if(attendees && attendees.length > 0) appt.setAttendees(attendees, ZmCalBaseItem.PERSON);
    }

    if (AjxTimezone.TIMEZONE_CONFLICT || AjxTimezone.DEFAULT_RULE.autoDetected) {
		var timezonePicker = this.getTimezonePicker();
		var callback = new AjxCallback(this, this.handleTimezoneSelection, [appt, mode, isDirty]);
		timezonePicker.setCallback(callback);
		timezonePicker.popup();
	} else {
		this._app.getApptComposeController().show(appt, mode, isDirty);
	}
};

ZmCalViewController.prototype.handleTimezoneSelection =
function(appt, mode, isDirty, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._app.getApptComposeController().show(appt, mode, isDirty);
};

ZmCalViewController.prototype.handleTimezoneSelectionQuickAdd =
function(appt, shiftKey, serverId) {
	this.updateTimezoneInfo(appt, serverId);
	this._showQuickAddDialogContinue(appt, shiftKey);
};

ZmCalViewController.prototype.updateTimezoneInfo =
function(appt, serverId) {
	appt.setTimezone(serverId);
	appCtxt.set(ZmSetting.DEFAULT_TIMEZONE, serverId);
	AjxTimezone.TIMEZONE_CONFLICT = false;
	this.updateDefaultTimezone(serverId);
	var settings = appCtxt.getSettings();
	var tzSetting = settings.getSetting(ZmSetting.DEFAULT_TIMEZONE);
	settings.save([tzSetting], new AjxCallback(this, this._timezoneSaveCallback));
};

ZmCalViewController.prototype.updateDefaultTimezone =
function(serverId) {
	for (var i =0; i < AjxTimezone.MATCHING_RULES.length; i++) {
		if (AjxTimezone.MATCHING_RULES[i].serverId == serverId) {
			AjxTimezone.DEFAULT_RULE = AjxTimezone.MATCHING_RULES[i];
			AjxTimezone.DEFAULT = AjxTimezone.getClientId(AjxTimezone.DEFAULT_RULE.serverId);
			break;
		}
	}
};

ZmCalViewController.prototype._timezoneSaveCallback =
function() {
	appCtxt.setStatusMsg(ZmMsg.timezonePrefSaved);
};

ZmCalViewController.prototype.getTimezonePicker =
function() {
	if (!this._timezonePicker) {
		this._timezonePicker = appCtxt.getTimezonePickerDialog();
	}
	return this._timezonePicker;
};

/**
 * Edits the appointment.
 * 
 * @param	{ZmAppt}		appt		the appointment
 * @param	{constant}		mode		the mode
 */
ZmCalViewController.prototype.editAppointment =
function(appt, mode) {
	Dwt.setLoadingTime("ZmCalendarApp-editAppt");
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptComposeView, [clone, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
	Dwt.setLoadedTime("ZmCalendarApp-editAppt");
};

ZmCalViewController.prototype._replyAppointment =
function(appt, all) {
	Dwt.setLoadingTime("ZmCalendarApp-replyAppt");
	AjxDispatcher.require(["MailCore", "Mail"]);
    var clone = ZmAppt.quickClone(appt);
	var respCallback = new AjxCallback(this, this._replyDetailsHandler, [clone, all]);
	clone.getDetails(null, respCallback, this._errorCallback, true, true);
	Dwt.setLoadedTime("ZmCalendarApp-replyAppt");
};

ZmCalViewController.prototype._replyDetailsHandler =
function(appt, all, result) {

	var msg = new ZmMailMsg(-1, null, true);
	var orig = appt.message;
	if (orig) {
		var inviteHtml = orig.getInviteDescriptionContent(ZmMimeTable.TEXT_HTML);
        if (inviteHtml) {
            var htmlContent = inviteHtml.getContent();
            htmlContent && msg.setInviteDescriptionContent(ZmMimeTable.TEXT_HTML, htmlContent);
        }

		var inviteText = orig.getInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN);
        if (inviteText) {
            var textContent = inviteText.getContent();
            textContent && msg.setInviteDescriptionContent(ZmMimeTable.TEXT_PLAIN, textContent);
        }
        if (htmlContent || textContent) {
            msg._loaded = true;
        }

		msg.invite = orig.invite;
		msg.id = orig.id;
        msg.date = orig.date;
	}
	msg.setSubject(appt.name);

	var organizer = appt.getOrganizer();
	var organizerAddress = AjxEmailAddress.parse(organizer);
	var self = appCtxt.getActiveAccount().name;
	msg.getHeaderStr = AjxCallback.returnFalse; // Real ugly hack to prevent headers from showing in the message

    var isOrganizer = appt.isOrganizer();
    var folder = appt.getFolder();
    var isRemote = folder ? folder.isRemote() : false;
	if (!isOrganizer || isRemote) {
		organizerAddress.setType(AjxEmailAddress.FROM);
		msg.addAddress(organizerAddress);
	}

	if (all) {
		var omit = AjxUtil.arrayAsHash([ self, organizerAddress.getAddress() ]),
			attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

		this._addAttendeesToReply(attendees, msg, ZmCalItem.ROLE_REQUIRED, AjxEmailAddress.FROM, omit);
		this._addAttendeesToReply(attendees, msg, ZmCalItem.ROLE_OPTIONAL, AjxEmailAddress.CC, omit);
	}
	
	var data = {action: all ? ZmOperation.CAL_REPLY_ALL : ZmOperation.CAL_REPLY, msg: msg};
	AjxDispatcher.run("GetComposeController").doAction(data);
};

ZmCalViewController.prototype._addAttendeesToReply = function(attendees, msg, role, addrType, omit) {

	var attendeesByRole = ZmApptViewHelper.getAttendeesArrayByRole(attendees, role),
		ln = attendeesByRole.length, i, addr;

	for (i = 0; i < ln; i++) {
		addr = attendeesByRole[i].getAttendeeText(ZmCalBaseItem.PERSON);
		if (addr && !omit[addr]) {
			var addrObj = new AjxEmailAddress(addr);
			addrObj.setType(addrType);
			msg.addAddress(addrObj);
		}
	}
};

ZmCalViewController.prototype._forwardAppointment =
function(appt, mode) {
	Dwt.setLoadingTime("ZmCalendarApp-fwdAppt");
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
		var clone = ZmAppt.quickClone(appt);
		clone.getDetails(mode, new AjxCallback(this, this._showApptForwardComposeView, [clone, mode]));
	} else {
		this._showApptForwardComposeView(appt, mode);
	}
	Dwt.setLoadedTime("ZmCalendarApp-fwdAppt");
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	// if we have an appointment, go get all the details.
	if (!appt.__creating) {
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);
		if (appt.isRecurring()) {
			// prompt user to edit instance vs. series if recurring but not for exception and from edit mode
			if (appt.isException || appt.editViewMode) {
				var mode = appt.editViewMode || ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
				if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || appCtxt.isWebClientOffline()) {
					this.showApptReadOnlyView(appt, mode);
				} else {
					this.editAppointment(appt, mode);
				}
			} else {
				this._showTypeDialog(appt, ZmCalItem.MODE_EDIT);
			}
		} else {
			// if simple appointment, no prompting necessary
            var isTrash = calendar.nId == ZmOrganizer.ID_TRASH;
			if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || isTrash || appCtxt.isWebClientOffline()) {
                var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
				this.showApptReadOnlyView(appt, mode);
			} else {
				this.editAppointment(appt, ZmCalItem.MODE_EDIT);
			}
		}
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._typeOkListener =
function(ev) {
	if (this._typeDialog) {
		this._typeDialog.popdown();
	}

	if (this._typeDialog.mode == ZmCalItem.MODE_DELETE)
		this._promptDeleteAppt(this._typeDialog.calItem, this._typeDialog.isInstance() ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES);
	else
		this._performApptAction(this._typeDialog.calItem, this._typeDialog.mode, this._typeDialog.isInstance());
};

ZmCalViewController.prototype._performApptAction =
function(appt, mode, isInstance) {
	if (mode == ZmCalItem.MODE_DELETE) {
		var delMode = isInstance ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES;
		if (appt instanceof Array) {
			this._continueDelete(appt, delMode);
		} else {
			if (appt.isOrganizer()) {
				this._continueDelete(appt, delMode);
			} else {
				this._promptDeleteNotify(appt, delMode);
			}
		}
	}
	else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		var viewMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var state = this._updateApptDateState;
		var args = [state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback, state.errorCallback];
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, args);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	}
	else {
		var editMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var calendar = appt.getFolder();
		var isSynced = Boolean(calendar.url);

		if (appt.isReadOnly() || calendar.isReadOnly() || isSynced || appCtxt.isWebClientOffline()) {
			this.showApptReadOnlyView(appt, editMode);
		} else {
			this.editAppointment(appt, editMode);
		}
	}
};

ZmCalViewController.prototype._typeCancelListener =
function(ev) {
	if (this._typeDialog.mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// we cancel the drag/sash, refresh view
		this._refreshAction(true);
	}

	this._typeDialog.popdown();
};

ZmCalViewController.prototype._quickAddOkListener =
function(ev) {
    var isValid = this._quickAddDialog.isValid();
    var appt = this._quickAddDialog.getAppt();
    var closeCallback = this._quickAddCallback.bind(this, true);
    var errorCallback = this._quickAddCallback.bind(this, false);

    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    // Send if any locations attendees are specified.  This will send invites
    var action = (locations.length == 0) ? ZmCalItemComposeController.SAVE_CLOSE :
                                           ZmCalItemComposeController.SEND;
    this._saveSimpleAppt(isValid, appt, action, closeCallback, errorCallback);
}

ZmCalViewController.prototype._saveSimpleAppt =
function(isValid, appt, action, closeCallback, errorCallback, cancelCallback) {
	try {
		if (isValid && appt) {
            if (appt.getFolder() && appt.getFolder().noSuchFolder) {
                throw AjxMessageFormat.format(ZmMsg.errorInvalidFolder, appt.getFolder().name);
            }
            if (!this._simpleComposeController) {
                // Create a compose controller, used for saving the quick add
                // appt and modifications made via ZmCalColView drag and drop, in
                // order to trigger permission and resource checks.
                this._simpleComposeController = this._app.getSimpleApptComposeController();
            }
            this._simpleComposeController.doSimpleSave(appt, action, closeCallback,
                                                       errorCallback, cancelCallback);
        }
	} catch(ex) {
		if (typeof ex == "string") {
			var errorDialog = new DwtMessageDialog({parent:this._shell});
			var msg = ex ? AjxMessageFormat.format(ZmMsg.errorSavingWithMessage, ex) : ZmMsg.errorSaving;
			errorDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			errorDialog.popup();
		}else{
            ZmController.handleScriptError(ex);
        }
	}
};

ZmCalViewController.prototype._quickAddCallback =
function(success) {
    if (success) {
        this._quickAddDialog.popdown();
    }
    appCtxt.setStatusMsg(success ? ZmMsg.apptCreated : ZmMsg.apptCreationError);
};

ZmCalViewController.prototype._quickAddMoreListener =
function(ev) {
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		this._quickAddDialog.popdown();
		this.newAppointment(appt, ZmCalItem.MODE_NEW_FROM_QUICKADD, this._quickAddDialog.isDirty());
	}
};

ZmCalViewController.prototype._showApptComposeView =
function(appt, mode) {
	this._app.getApptComposeController().show(appt, mode);
};

ZmCalViewController.prototype._showApptForwardComposeView =
function(appt, mode) {
	/*if(!appt.isOrganizer()) { */
	appt.name = ZmMsg.fwd + ": " + appt.name;
	//}
	this._app.getApptComposeController().show(appt, mode);
};

/**
 * appt - appt to change
 * startDate - new date or null to leave alone
 * endDate - new or null to leave alone
 * changeSeries - if recurring, change the whole series
 *
 * TODO: change this to work with _handleException, and take callback so view can
 *       restore appt location/size on failure
 *       
 * @private
 */
ZmCalViewController.prototype.dndUpdateApptDate =
function(appt, startDateOffset, endDateOffset, callback, errorCallback, ev) {	
	appt.dndUpdate = true;
	if (!appt.isRecurring()) {
		var viewMode = ZmCalItem.MODE_EDIT;
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
		appt.getDetails(viewMode, respCallback, errorCallback);
	}
	else {
		if (ev.shiftKey || ev.altKey) {
			var viewMode = ev.altKey ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
			var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
			appt.getDetails(viewMode, respCallback, errorCallback);
		}
		else {
			this._updateApptDateState = {appt:appt, startDateOffset: startDateOffset, endDateOffset: endDateOffset, callback: callback, errorCallback: errorCallback };
			if (appt.isException) {
				this._performApptAction(appt, ZmAppt.MODE_DRAG_OR_SASH, true);
			} else {
				this._showTypeDialog(appt, ZmAppt.MODE_DRAG_OR_SASH);
			}
		}
	}
	appCtxt.notifyZimlets("onApptDrop", [appt, startDateOffset, endDateOffset]);		
};

ZmCalViewController.prototype._handleResponseUpdateApptDate =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	// skip prompt if no attendees
	if (appt.inviteNeverSent || !appt.otherAttendees) {
		this._handleResponseUpdateApptDateSave.apply(this, arguments);
		return;
	}

	// NOTE: We copy the arguments into an array because arguments
	//       is *not* technically an array. So if anyone along the
	//       line considers it such it will blow up -- this prevents
	//       that at the expense of having to keep this array and
	//       the actual argument list in sync.
	var args = [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result];
	var edit = new AjxCallback(this, this._handleResponseUpdateApptDateEdit, args);
	var save = new AjxCallback(this, this._handleResponseUpdateApptDateSave, args);
	var ignore = new AjxCallback(this, this._handleResponseUpdateApptDateIgnore, args);

	var dialog = appCtxt.getConfirmationDialog();
	dialog.popup(ZmMsg.confirmModifyApptReply, edit, save, ignore);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateEdit =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	var clone = ZmAppt.quickClone(appt);
    clone.editViewMode = viewMode;
	if (startDateOffset) clone.setStartDate(new Date(clone.getStartTime() + startDateOffset));
	if (endDateOffset) clone.setEndDate(new Date(clone.getEndTime() + endDateOffset));
	this._showAppointmentDetails(clone);
};
ZmCalViewController.prototype._handleResponseUpdateApptDateEdit2 =
function(appt, action, mode, startDateOffset, endDateOffset) {
	if (startDateOffset) appt.setStartDate(new Date(appt.getStartTime() + startDateOffset));
	if (endDateOffset) appt.setEndDate(new Date(appt.getEndTime() + endDateOffset));
	this._continueDeleteReplyRespondAction(appt, action, mode);
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSave =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
         var isExceptionAllowed = appCtxt.get(ZmSetting.CAL_EXCEPTION_ON_SERIES_TIME_CHANGE);
         var showWarning = appt.isRecurring() && appt.hasEx && appt.getAttendees(ZmCalBaseItem.PERSON) && !isExceptionAllowed && viewMode==ZmCalItem.MODE_EDIT_SERIES;
         if(showWarning){
            var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSaveContinue, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result]);
            this._showExceptionWarning(respCallback);
         }
         else{
             this._handleResponseUpdateApptDateSaveContinue(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result);
         }
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSaveContinue =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
    try {
        // NOTE: If the appt was already populated (perhaps by
		//       dragging it once, canceling the change, and then
		//       dragging it again), then the result will be null.
		if (result) {
			result.getResponse();
		}
		var apptStartDate = appt.startDate;
		var apptEndDate   = appt.endDate;
	    var apptDuration = appt.getDuration();

		appt.setViewMode(viewMode);
		if (startDateOffset) {
			var sd = (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) ? appt.getUniqueStartDate() : new Date(appt.getStartTime());
			appt.setStartDate(new Date(sd.getTime() + startDateOffset));
			appt.resetRepeatWeeklyDays();
		}
		if (endDateOffset) {
			var endDateTime;

			if (viewMode === ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
				// For some reason the recurring all day events have their end date set to the next day while the normal all day events don't.
				// For e.g. an event with startDate 9th June and endDate 10th June when dragged to the next day has varying results:
				// -> Regular all day event has end Date as 9th June which with endDateOffset results in 10th June as new endDate
				// -> Recurring all day event has end Date as 10th June which with endDateOffset results in 11th June as new endDate
				// To tackle this the new End date is now calculated from the new start date and appt duration and equivalent of 1 day is subtracted from it.
				// TODO: Need a better solution for this -> investigate why the end date difference is present in the first place.
				if (appt.allDayEvent) {
					endDateTime = appt.getStartTime() + apptDuration - AjxDateUtil.MSEC_PER_DAY;
				}
				else {
					endDateTime = appt.getUniqueEndDate().getTime() + endDateOffset;
				}
			}
			else {
				endDateTime = appt.getEndTime()  + endDateOffset;
			}
			appt.setEndDate(new Date(endDateTime));
		}

		if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			//bug: 32231 - use proper timezone while creating exceptions
			appt.setOrigTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		}

		if(!appt.getTimezone()) appt.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
		var respCallback    = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [callback]);
		var respErrCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [errorCallback, appt, apptStartDate, apptEndDate]);
		appCtxt.getShell().setBusy(true);

        var action = appt.inviteNeverSent ? ZmCalItemComposeController.SAVE_CLOSE :
                                            ZmCalItemComposeController.SEND;
        this._saveSimpleAppt(true, appt, action, respCallback, respErrCallback, respErrCallback);
	} catch (ex) {
		appCtxt.getShell().setBusy(false);
		if (ex.msg) {
			this.popupErrorDialog(AjxMessageFormat.format(ZmMsg.mailSendFailure, ex.msg));
		} else {
			this.popupErrorDialog(ZmMsg.errorGeneric, ex);
		}
		if (errorCallback) errorCallback.run(ex);
	}
	if (callback) callback.run(result);
}

ZmCalViewController.prototype._showExceptionWarning = function(yesCB,noCB) {
          var dialog = appCtxt.getYesNoMsgDialog();
		  dialog.setMessage(ZmMsg.recurrenceUpdateWarning, DwtMessageDialog.WARNING_STYLE);
          dialog.registerCallback(DwtDialog.YES_BUTTON, this._handleExceptionWarningResponse, this,[dialog,yesCB]);
          dialog.registerCallback(DwtDialog.NO_BUTTON, this._handleExceptionWarningResponse,this,[dialog,noCB]);
		  dialog.popup();
}

ZmCalViewController.prototype._handleExceptionWarningResponse = function(dialog,respCallback) {
          if(respCallback){respCallback.run();}
          else{this._refreshAction(true);}
          if(dialog){
              dialog.popdown();
          }
}

ZmCalViewController.prototype._handleResponseUpdateApptDateSave2 =
function(callback, appt, apptStartDate, apptEndDate) {
    // Appt passed in for cancel/failure.  Restore the start and endDates
    if (appt) {
        appt.setStartDate(apptStartDate);
        appt.setEndDate(apptEndDate);
        appt.resetRepeatWeeklyDays();
    }
    if (callback) callback.run();
    appCtxt.getShell().setBusy(false);


};

ZmCalViewController.prototype._handleResponseUpdateApptDateIgnore =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	this._refreshAction(true);
	if (callback) callback.run(result);
};

/**
 * Gets the day tool tip text.
 * 
 * @param	{Date}		date		the date
 * @param	{Boolean}	noheader	if <code>true</code>, do not include tool tip header
 * @param	{AjxCallback}	callback		the callback
 * @param	{Boolean}	getSimpleToolTip	 if <code>true</code>,show only plain text in tooltip for all day events.
 * Multi day "appts/allday events" would be shown by just one entry showing final start/end date&time.
 */
ZmCalViewController.prototype.getDayToolTipText =
function(date, noheader, callback, isMinical, getSimpleToolTip) {
	try {
		var start = new Date(date.getTime());
		start.setHours(0, 0, 0, 0);
		var startTime = start.getTime();
		var end = start.getTime() + AjxDateUtil.MSEC_PER_DAY;
		var params = {start:startTime, end:end, fanoutAllDay:true};
		if(callback) {
			params.callback = new AjxCallback(this, this._handleToolTipSearchResponse, [start, noheader, callback, isMinical]);
			this.getApptSummaries(params);
		} else {
			var result = this.getApptSummaries(params);
			return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, null, isMinical, getSimpleToolTip);
		}
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.errorGettingAppts + "</b>";
	}
};

ZmCalViewController.prototype._handleToolTipSearchResponse =
function(start, noheader, callback, isMinical, result) {
	try {
		var tooltip = ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, null, isMinical, true);
		callback.run(tooltip);
	} catch (ex) {
		DBG.println(ex);
		callback.run("<b>" + ZmMsg.errorGettingAppts + "</b>");
	}
};

ZmCalViewController.prototype.getUserStatusToolTipText =
function(start, end, noheader, email, emptyMsg, calIds) {
	try {
        if(!calIds) {
            calIds = [];
            if (this._calTreeController) {
                var calendars = this._calTreeController.getOwnedCalendars(this._app.getOverviewId(),email);
                for (var i = 0; i < calendars.length; i++) {
                    var cal = calendars[i];
                    if (cal && (cal.nId != ZmFolder.ID_TRASH)) {
                        calIds.push(appCtxt.multiAccounts ? cal.id : cal.nId);
                    }
                }
            }

            if ((calIds.length == 0) || !email) {
                return "<b>" + ZmMsg.statusFree + "</b>";
            }
        }

		var startTime = start.getTime();
		var endTime = end.getTime();

		var dayStart = new Date(start.getTime());
		dayStart.setHours(0, 0, 0, 0);

		var dayEnd = new Date(dayStart.getTime() + AjxDateUtil.MSEC_PER_DAY);

		// to avoid frequent request to server we cache the appt for the entire
		// day first before getting the appts for selected time interval
		this.getApptSummaries({start:dayStart.getTime(), end:dayEnd.getTime(), fanoutAllDay:true, folderIds: calIds});

		var result = this.getApptSummaries({start:startTime, end:endTime, fanoutAllDay:true, folderIds: calIds});

		return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader, emptyMsg);
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.meetingStatusUnknown + "</b>";
	}
};

ZmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
};

ZmCalViewController.prototype._dateRangeListener =
function(ev) {
	ev.item.setNeedsRefresh(true);
	this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
};

ZmCalViewController.prototype.processInlineCalSearch =
function() {
	var srchResponse = window.inlineCalSearchResponse;
	if (!srchResponse) { return; }

	var params = srchResponse.search;
	var response = srchResponse.Body;

	if (params instanceof Array) {
		params = params[0];
	}

	var viewId = this._currentViewId || this.getDefaultViewType();
	var fanoutAllDay = (viewId == ZmId.VIEW_CAL_MONTH);
	var searchParams = {start: params.s, end: params.e, fanoutAllDay: fanoutAllDay, callback: null};
	searchParams.folderIds = params.l ? params.l.split(",") : []; 
	searchParams.query = "";

	var miniCalParams = this.getMiniCalendarParams();
	miniCalParams.folderIds = searchParams.folderIds;

	this.apptCache.setSearchParams(searchParams);
	this.apptCache.processBatchResponse(response.BatchResponse, searchParams, miniCalParams);
};

ZmCalViewController.prototype.setCurrentView =
function(view) {
	// do nothing
};

ZmCalViewController.prototype._resetNavToolBarButtons =
function(view) {
	this._navToolBar[ZmId.VIEW_CAL].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
};

ZmCalViewController.prototype._resetToolbarOperations =
function(viewId) {
	ZmListController.prototype._resetToolbarOperations.call(this);
};

ZmCalViewController.prototype._setNavToolbarPosition =
function(navToolbar, currentViewName) {
    if(!navToolbar || !currentViewName) { return; }
    navToolbar.setVisible(currentViewName != ZmId.VIEW_CAL_LIST);
};

ZmCalViewController.prototype._resetOperations =
function(parent, num) {
    if (!parent) return;

	parent.enableAll(true);
	var currViewName = this._viewMgr.getCurrentViewName();
    parent.enable(ZmOperation.TAG_MENU, appCtxt.get(ZmSetting.TAGGING_ENABLED) && !appCtxt.isWebClientOffline());

	if (currViewName == ZmId.VIEW_CAL_LIST && num > 1) { return; }

    this._setNavToolbarPosition(this._navToolBar[ZmId.VIEW_CAL], currViewName);

    var appt = this.getSelection()[0];
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
    num = ( isTrash && this.getCurrentListView() ) ? this.getCurrentListView().getSelectionCount() : num ;
    var isReadOnly = calendar ? calendar.isReadOnly() : false;
    var isSynced = Boolean(calendar && calendar.url);
    var isShared = calendar ? calendar.isRemote() : false;
    var disabled = isSynced || isReadOnly || (num == 0) || appCtxt.isWebClientOffline();
    var isPrivate = appt && appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
    var isForwardable = !isTrash && calendar && !calendar.isReadOnly() && appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED) && !appCtxt.isWebClientOffline();
    var isReplyable = !isTrash && appt && (num == 1) && !appCtxt.isWebClientOffline();
    var isTrashMultiple = isTrash && (num && num>1);

    parent.enable([ZmOperation.REPLY, ZmOperation.REPLY_ALL], (isReplyable && !isTrashMultiple));
    parent.enable(ZmOperation.TAG_MENU, ((!isReadOnly && !isSynced && num > 0) || isTrashMultiple) && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.VIEW_APPOINTMENT, !isPrivate && !isTrashMultiple);
    parent.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwardable
                  && !isTrashMultiple  && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.PROPOSE_NEW_TIME, !isTrash && (appt && !appt.isOrganizer()) && !isTrashMultiple && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.SHOW_ORIG, num == 1 && appt && appt.getRestUrl() != null && !isTrashMultiple  && !appCtxt.isWebClientOffline());

    parent.enable([ZmOperation.DELETE, ZmOperation.MOVE, ZmOperation.MOVE_MENU], !disabled || isTrashMultiple);

    parent.enable(ZmOperation.VIEW_APPT_INSTANCE,!isTrash);

    var apptAccess = ((appt && appt.isPrivate() && calendar.isRemote()) ? calendar.hasPrivateAccess() : true );
    parent.enable(ZmOperation.DUPLICATE_APPT,apptAccess && !isTrashMultiple && this._app.containsWritableFolder() && !appCtxt.isWebClientOffline());
    parent.enable(ZmOperation.SHOW_ORIG,apptAccess && !isTrashMultiple  && !appCtxt.isWebClientOffline());

	/*if (currViewName == ZmId.VIEW_CAL_LIST) {
		parent.enable(ZmOperation.PRINT_CALENDAR, num > 0);
	} */
	parent.enable(ZmOperation.PRINT_CALENDAR, !appCtxt.isWebClientOffline());

	// disable button for current view
	var op = ZmCalViewController.VIEW_TO_OP[currViewName];
	// setSelected on a Toolbar; Do nothing for an ActionMenu
	if (op && parent.setSelected) {
		parent.setSelected(op);
	}

    if (appCtxt.isWebClientOffline()) {
        // Disable the list view when offline
        //parent.enable(ZmCalViewController.VIEW_TO_OP[ZmOperation.CAL_LIST_VIEW], false);
        parent.enable(ZmOperation.CAL_LIST_VIEW, false);
    }

    //this._resetQuickCommandOperations(parent);
};

ZmCalViewController.prototype._listSelectionListener =
function(ev) {

	ZmListController.prototype._listSelectionListener.call(this, ev);
    // to avoid conflicts on opening a readonly appointment in readonly view
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		this._viewMgr.getCurrentView()._apptSelected();
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var appt = ev.item;
		if (appt.isPrivate() && appt.getFolder().isRemote() && !appt.getFolder().hasPrivateAccess()) {
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.setMessage(ZmMsg.apptIsPrivate, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
		} else {
			// open a appointment view
			this._apptIndexShowing = this._list.indexOf(appt);
			this._apptFromView = this._viewMgr.getCurrentView();
			this._showAppointmentDetails(appt);
		}
	}
};

ZmCalViewController.prototype.getViewMgr =
function(){
    return this._viewMgr;
}

ZmCalViewController.prototype._handleMenuViewAction =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu.__appt;
	delete actionMenu.__appt;

    var orig = appt.getOrig();
    appt = orig && orig.isMultiDay() ? orig : appt;
	var calendar = appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var isSynced = Boolean(calendar.url);
	var mode = ZmCalItem.MODE_EDIT;
	var menuItem = ev.item;
	var menu = menuItem.parent;
	var id = menu.getData(ZmOperation.KEY_ID);
	switch(id) {
		case ZmOperation.VIEW_APPT_INSTANCE:	mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE; break;
		case ZmOperation.VIEW_APPT_SERIES:		mode = ZmCalItem.MODE_EDIT_SERIES; break;
	}
	
	if (appt.isReadOnly() || isSynced || isTrash || appCtxt.isWebClientOffline()) {
		var clone = ZmAppt.quickClone(appt);
		var callback = new AjxCallback(this, this._showApptReadOnlyView, [clone, mode]);
		clone.getDetails(mode, callback, this._errorCallback);
	} else {
		this.editAppointment(appt, mode);
	}
};

ZmCalViewController.prototype._handleApptRespondAction =
function(ev) {
	var appt = this.getSelection()[0];
    if(!appt){return;}
	var type = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptRespondAction, [appt, type, op, null]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptRespondAction =
function(appt, type, op, callback) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;

    if(type == ZmOperation.REPLY_DECLINE) {
        var promptCallback = new AjxCallback(this, this._sendInviteReply, [type, instanceDate]);
        this._promptDeclineNotify(appt, promptCallback, callback);
    }else {
        msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(), false, null, null, callback);
    }
};

ZmCalViewController.prototype._promptDeclineNotify =
function(appt, promptCallback, callback) {
	if (!this._declineNotifyDialog) {
		var msg = ZmMsg.confirmDeclineAppt;
		this._declineNotifyDialog = new ZmApptDeleteNotifyDialog({
			parent: this._shell,
			title: AjxMsg.confirmTitle,
			confirmMsg: msg,
			choiceLabel1: ZmMsg.dontNotifyOrganizer,
			choiceLabel2 : ZmMsg.notifyOrganizer
		});
	}
	this._declineNotifyDialog.popup(new AjxCallback(this, this._declineNotifyYesCallback, [appt, promptCallback, callback]));
};

ZmCalViewController.prototype._declineNotifyYesCallback =
function(appt, promptCallback, callback) {
	var notifyOrg = !this._declineNotifyDialog.isDefaultOptionChecked();
    if(promptCallback) promptCallback.run(appt, notifyOrg, callback);
};


ZmCalViewController.prototype._sendInviteReply =
function(type, instanceDate, appt, notifyOrg, callback) {
    var msgController = this._getMsgController();
    msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner(), !notifyOrg, null, null, callback);
};

ZmCalViewController.prototype._handleApptEditRespondAction =
function(ev) {
	var appt = this.getSelection()[0];
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.parent.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptEditRespondAction, [appt, id, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptEditRespondAction =
function(appt, id, op) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg.subject = msg.subject || appt.name;
	if (!msg.getAddress(AjxEmailAddress.REPLY_TO)) {
		msg.setAddress(AjxEmailAddress.REPLY_TO, new AjxEmailAddress(appt.organizer));
	}
	msgController.setMsg(msg);

	// poke the msgController
	switch (id) {
		case ZmOperation.EDIT_REPLY_ACCEPT: 	id = ZmOperation.REPLY_ACCEPT; break;
		case ZmOperation.EDIT_REPLY_DECLINE: 	id = ZmOperation.REPLY_DECLINE; break;
		case ZmOperation.EDIT_REPLY_TENTATIVE: 	id = ZmOperation.REPLY_TENTATIVE; break;
	}
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._editInviteReply(id, 0, instanceDate, appt.getRemoteFolderOwner());
};

ZmCalViewController.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.registerCallback(DwtDialog.OK_BUTTON, this._handleError2, this, [msgDialog]);
		msgDialog.setMessage(ZmMsg.apptOutOfDate, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

ZmCalViewController.prototype._handleError2 =
function(msgDialog) {
	msgDialog.unregisterCallback(DwtDialog.OK_BUTTON);
	msgDialog.popdown();
	this._refreshAction(false);
};

ZmCalViewController.prototype._initCalViewMenu =
function(menu) {
	for (var i = 0; i < ZmCalViewController.OPS.length; i++) {
		var op = ZmCalViewController.OPS[i];
		menu.addSelectionListener(op, this._listeners[op]);
        menu.enable(op, ((op != ZmOperation.CAL_LIST_VIEW) || !appCtxt.isWebClientOffline()));
	}
};

/**
 * Overrides ZmListController.prototype._getViewActionMenuOps
 * 
 * @private
 */
ZmCalViewController.prototype._getViewActionMenuOps =
function () {
    if(this._app.containsWritableFolder()) {
        return [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT,
			    ZmOperation.SEP,
			    ZmOperation.TODAY, ZmOperation.CAL_VIEW_MENU];
    }
    else {
        return [ZmOperation.TODAY,
                ZmOperation.CAL_VIEW_MENU];
    }
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 * 
 * @private
 */
ZmCalViewController.prototype._initializeActionMenu =
function() {
	this._actionMenu = this._createActionMenu(this._getActionMenuOps());
	if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		this._setupTagMenu(this._actionMenu);
	}

	var recurrenceModeOps = this._getRecurrenceModeOps();
	var params = {parent: this._shell, menuItems: recurrenceModeOps};
	this._recurrenceModeActionMenu = new ZmActionMenu(params);
	for (var i = 0; i < recurrenceModeOps.length; i++) {
		var recurrenceMode = recurrenceModeOps[i];
		var modeItem = this._recurrenceModeActionMenu.getMenuItem(recurrenceMode);
		var menuOpsForMode = this._getActionMenuOps(recurrenceMode);
		var actionMenuForMode = this._createActionMenu(menuOpsForMode, modeItem, recurrenceMode);
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			this._setupTagMenu(actionMenuForMode);
		}
		modeItem.setMenu(actionMenuForMode);
		// NOTE: Target object for listener is menu item
		var menuItemListener = this._recurrenceModeMenuPopup.bind(modeItem);
		modeItem.addListener(AjxEnv.isIE ? DwtEvent.ONMOUSEENTER : DwtEvent.ONMOUSEOVER, menuItemListener);
	}
	this._recurrenceModeActionMenu.addPopdownListener(this._menuPopdownListener);
};

ZmCalViewController.prototype._createActionMenu =
function(menuItems, parentMenuItem, context) {
	var params = {parent: parentMenuItem || this._shell, menuItems: menuItems, context: this._getMenuContext() + (context ? "_" + context : "")};
	var actionMenu = new ZmActionMenu(params);
	menuItems = actionMenu.opList;
	for (var i = 0; i < menuItems.length; i++) {
		var menuItem = menuItems[i];
		if (menuItem == ZmOperation.INVITE_REPLY_MENU) {
			var menu = actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
			menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
		} else if (menuItem == ZmOperation.CAL_VIEW_MENU) {
			var menu = actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
			this._initCalViewMenu(menu);
		}
		if (this._listeners[menuItem]) {
			actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
		}
	}
	actionMenu.addPopdownListener(this._menuPopdownListener);
	return actionMenu;
};

/**
 * The <code>this</code> in this method is the menu item.
 * 
 * @private
 */
ZmCalViewController.prototype._recurrenceModeMenuPopup =
function(ev) {
	if (!this.getEnabled()) { return; }

	var menu = this.getMenu();
	var opId = this.getData(ZmOperation.KEY_ID);
	menu.setData(ZmOperation.KEY_ID, opId);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 * 
 * @private
 */
ZmCalViewController.prototype._getActionMenuOps =
function(recurrenceMode) {

	var deleteOp = ZmOperation.DELETE;
	var viewOp = ZmOperation.VIEW_APPOINTMENT;
	var forwardOp = ZmOperation.FORWARD_APPT;

	if (recurrenceMode == ZmOperation.VIEW_APPT_INSTANCE) {
		deleteOp = ZmOperation.DELETE_INSTANCE;
		viewOp = ZmOperation.OPEN_APPT_INSTANCE;
		forwardOp = ZmOperation.FORWARD_APPT_INSTANCE;
	} else if (recurrenceMode == ZmOperation.VIEW_APPT_SERIES) {
		deleteOp = ZmOperation.DELETE_SERIES;
		viewOp = ZmOperation.OPEN_APPT_SERIES;
		forwardOp = ZmOperation.FORWARD_APPT_SERIES;
	}
	
	var retVal = [viewOp,
	      		ZmOperation.PRINT,
	      		ZmOperation.SEP,
	    		ZmOperation.REPLY_ACCEPT,
	    		ZmOperation.REPLY_TENTATIVE,
	    		ZmOperation.REPLY_DECLINE,
	    		ZmOperation.INVITE_REPLY_MENU,
                ZmOperation.PROPOSE_NEW_TIME,
                ZmOperation.REINVITE_ATTENDEES,
	    		ZmOperation.DUPLICATE_APPT,
	    		ZmOperation.SEP,
	    		ZmOperation.REPLY,
	    		ZmOperation.REPLY_ALL,
	    		forwardOp,
	    		deleteOp,
	    		ZmOperation.SEP];
	if (recurrenceMode != ZmOperation.VIEW_APPT_INSTANCE) {
		retVal.push(ZmOperation.MOVE);
	}
	retVal.push(ZmOperation.TAG_MENU);
	retVal.push(ZmOperation.SHOW_ORIG);
    //retVal.push(ZmOperation.QUICK_COMMANDS);
	return retVal;
};

ZmCalViewController.prototype._getRecurrenceModeOps =
function() {
	return [ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions =
function(appt, actionMenu) {

    if (!(appt && actionMenu)) {
        return;
    }
    var isExternalAccount = appCtxt.isExternalAccount();
    var isFolderReadOnly = appt.isFolderReadOnly();
	var isShared = appt.isShared();

	//Note - isOrganizer means the Calendar is the organizer of the appt. i.e. the appointment was created on this calendar.
	//This could be "true" even if the current user is just a sharee of the calendar.
	var isTheCalendarOrganizer = appt.isOrganizer();

	// find the checked calendar for this appt
	var calendar;
	var folderId = appt.getLocalFolderId();
	var calendars = this.getCheckedCalendars(true);
	for (var i = 0; i < calendars.length; i++) {
		if (calendars[i].id == folderId) {
			calendar = calendars[i];
			break;
		}
	}
    //bug:68452 if its a trash folder then its not present in the calendars array
    if (!calendar){
        calendar = appt.getFolder();
    }
	var share = calendar && calendar.link ? calendar.getMainShare() : null;
	var workflow = share ? share.isWorkflow() : true;
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var isPrivate = appt.isPrivate() && calendar.isRemote() && !calendar.hasPrivateAccess();
    var isReplyable = !isTrash && appt.otherAttendees;
	var isForwardable = !isTrash && calendar && !calendar.isReadOnly() && appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED);

	//don't show for organizer calendar, or readOnly attendee calendar.
	var showAcceptDecline = !isTheCalendarOrganizer && !isFolderReadOnly;
	actionMenu.setItemVisible(ZmOperation.REPLY_ACCEPT, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.REPLY_DECLINE, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.REPLY_TENTATIVE, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.INVITE_REPLY_MENU, showAcceptDecline);
	actionMenu.setItemVisible(ZmOperation.PROPOSE_NEW_TIME, showAcceptDecline);
    actionMenu.setItemVisible(ZmOperation.REINVITE_ATTENDEES, !isTrash && isTheCalendarOrganizer && !isFolderReadOnly && !appt.inviteNeverSent && appt.otherAttendees);
    actionMenu.setItemVisible(ZmOperation.TAG_MENU, appCtxt.get(ZmSetting.TAGGING_ENABLED));

    // Initially enabling all the options in the action menu. And then selectively disabling unsupported options for special users.
    actionMenu.enableAll(true);

	//enable/disable specific actions, only if we actually show them. (we don't show for organizer or shared calendar)
	if (showAcceptDecline) {
		var enabled = isReplyable && workflow && !isPrivate && !isExternalAccount;
        actionMenu.enable(ZmOperation.REPLY_ACCEPT, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
        actionMenu.enable(ZmOperation.REPLY_DECLINE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
        actionMenu.enable(ZmOperation.REPLY_TENTATIVE, enabled && appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
        actionMenu.enable(ZmOperation.INVITE_REPLY_MENU, enabled);
		// edit reply menu
		var mi = enabled && actionMenu.getMenuItem(ZmOperation.INVITE_REPLY_MENU);
		var replyMenu = mi && mi.getMenu();
		if (replyMenu) {
			replyMenu.enable(ZmOperation.EDIT_REPLY_ACCEPT,	appt.ptst != ZmCalBaseItem.PSTATUS_ACCEPT);
			replyMenu.enable(ZmOperation.EDIT_REPLY_DECLINE, appt.ptst != ZmCalBaseItem.PSTATUS_DECLINED);
			replyMenu.enable(ZmOperation.EDIT_REPLY_TENTATIVE, appt.ptst != ZmCalBaseItem.PSTATUS_TENTATIVE);
		}
	}

    actionMenu.enable([ZmOperation.FORWARD_APPT, ZmOperation.FORWARD_APPT_INSTANCE, ZmOperation.FORWARD_APPT_SERIES], isForwardable);
	var myEmail = appt.getFolder().getAccount().getEmail();
	//the last condition in the following is for the somewhat corner case user1 invites user2, and user1 is looking at user2's calendar as a share.
	actionMenu.enable(ZmOperation.REPLY, isReplyable && !isTheCalendarOrganizer && myEmail !== appt.organizer); //the organizer can't reply just to himself
	actionMenu.enable(ZmOperation.REPLY_ALL, isReplyable);

    var disabledOps;
    if(appCtxt.isWebClientOffline()) {
         disabledOps = [ZmOperation.REINVITE_ATTENDEES,
            ZmOperation.PROPOSE_NEW_TIME,
            ZmOperation.REPLY,
            ZmOperation.REPLY_ALL,
            ZmOperation.DUPLICATE_APPT,
            ZmOperation.DELETE,
            ZmOperation.DELETE_INSTANCE,
            ZmOperation.DELETE_SERIES,
            ZmOperation.FORWARD_APPT,
            ZmOperation.FORWARD_APPT_INSTANCE,
            ZmOperation.FORWARD_APPT_SERIES,
            ZmOperation.SHOW_ORIG,
            ZmOperation.DUPLICATE_APPT,
			ZmOperation.MOVE,
			ZmOperation.PRINT,
			ZmOperation.TAG_MENU,
            ZmOperation.MOVE_MENU];
        actionMenu.enable(disabledOps, false);
    } else {
        if(isExternalAccount) {
            disabledOps = [ZmOperation.REINVITE_ATTENDEES,
                ZmOperation.PROPOSE_NEW_TIME,
                ZmOperation.REPLY,
                ZmOperation.REPLY_ALL,
                ZmOperation.DUPLICATE_APPT,
                ZmOperation.DELETE,
                ZmOperation.DELETE_INSTANCE,
                ZmOperation.DELETE_SERIES];

            actionMenu.enable(disabledOps, false);
        }

        // bug:71007 Disabling unsupported options for shared calendar with view only rights
        if (isFolderReadOnly) {
            disabledOps = [ZmOperation.REINVITE_ATTENDEES,
                           ZmOperation.PROPOSE_NEW_TIME,
                           ZmOperation.DELETE,
                           ZmOperation.DELETE_INSTANCE,
                           ZmOperation.DELETE_SERIES,
                           ZmOperation.MOVE,
                           ZmOperation.TAG_MENU,
                           ZmOperation.MOVE_MENU];

            actionMenu.enable(disabledOps, false);
        }
    }

	var del = actionMenu.getMenuItem(ZmOperation.DELETE);
	if (del && !isTrash) {
		del.setText((isTheCalendarOrganizer && appt.otherAttendees) ? ZmMsg.cancel : ZmMsg.del);
		var isSynced = Boolean(calendar.url);
		del.setEnabled(!calendar.isReadOnly() && !isSynced && !isPrivate && !appCtxt.isWebClientOffline());
	}

	// recurring action menu options
	if (this._recurrenceModeActionMenu && !isTrash) {
		this._recurrenceModeActionMenu.enable(ZmOperation.VIEW_APPT_SERIES, !appt.exception);
	}
};

ZmCalViewController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var count = this.getSelectionCount();
	var appt = ev.item;
	var actionMenu = this.getActionMenu();
	actionMenu.enableAll(count === 1);
	if (count > 1) {
		var isExternalAccount = appCtxt.isExternalAccount();
  		var isFolderReadOnly = appt.isFolderReadOnly();
		var enabled = !isExternalAccount && !isFolderReadOnly;
		actionMenu.enable([ZmOperation.TAG_MENU, ZmOperation.MOVE_MENU, ZmOperation.MOVE, ZmOperation.DELETE], enabled);
		actionMenu.popup(0, ev.docX, ev.docY);
		return;
	}
    var calendar = appt && appt.getFolder();
    var isTrash = calendar && calendar.nId == ZmOrganizer.ID_TRASH;
	var menu = (appt.isRecurring() && !appt.isException && !isTrash) ? this._recurrenceModeActionMenu : actionMenu;
	this._enableActionMenuReplyOptions(appt, menu);
	var op = (menu == actionMenu) && appt.exception ? ZmOperation.VIEW_APPT_INSTANCE : null;
	actionMenu.__appt = appt;
	menu.setData(ZmOperation.KEY_ID, op);

	if (appt.isRecurring() && !appt.isException && !isTrash) {
		var menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_INSTANCE);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
		menuItem = menu.getMenuItem(ZmOperation.VIEW_APPT_SERIES);
		this._setTagMenu(menuItem.getMenu());
		this._enableActionMenuReplyOptions(appt, menuItem.getMenu());
	}
	menu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._clearViewActionMenu =
function() {
    // This will cause it to regenerate next time its accessed
    this._viewActionMenu = null;
}

ZmCalViewController.prototype._viewActionListener =
function(ev) {
	if (!this._viewActionMenu) {
		var menuItems = this._getViewActionMenuOps();
		if (!menuItems) return;
		var overrides = {};
		overrides[ZmOperation.TODAY] = {textKey:"todayGoto"};
		var params = {parent:this._shell, menuItems:menuItems, overrides:overrides};
		this._viewActionMenu = new ZmActionMenu(params);
		menuItems = this._viewActionMenu.opList;
		for (var i = 0; i < menuItems.length; i++) {
			var menuItem = menuItems[i];
			if (menuItem == ZmOperation.CAL_VIEW_MENU) {
				var menu = this._viewActionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
				this._initCalViewMenu(menu);
			} else if (this._listeners[menuItem]) {
				this._viewActionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
                if ((menuItem == ZmOperation.NEW_APPT) || (menuItem == ZmOperation.NEW_ALLDAY_APPT)) {
                    this._viewActionMenu.enable(menuItem, !appCtxt.isWebClientOffline());
                }
			}
		}
        this._viewActionMenu.addPopdownListener(this._menuPopdownListener);
	}

	if ( this._viewVisible && this._currentViewType == ZmId.VIEW_CAL_DAY) {
        var calId = ev.target.getAttribute(ZmCalDayTabView.ATTR_CAL_ID);
        if(!calId) {
            var view = this._viewMgr.getView(this._currentViewId);
            var gridLoc = Dwt.toWindow(ev.target, ev.elementX, ev.elementY, ev.target, true);
            var col = view._getColFromX(gridLoc.x);
            calId = (col && col.cal) ? col.cal.id : null;
        }
        this._viewActionMenu._calendarId = calId;
	} else {
		this._viewActionMenu._calendarId = null;
	}

	this._viewActionMenu.__view = ev.item;
	this._viewActionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentViewId];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = div ? view.getItemFromElement(div) : null;

	// only tags can be dropped on us *if* we are not readonly
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (item && item.type == ZmItem.APPT) {
			var calendar = item.getFolder();
			var isReadOnly = calendar ? calendar.isReadOnly() : false;
			var isSynced = Boolean(calendar && calendar.url);
			if (isSynced || isReadOnly  || appCtxt.isWebClientOffline()) {
				ev.doIt = false; // can't tag a GAL or shared contact
				view.dragSelect(div);
				return;
			}
		}
	}

	ZmListController.prototype._dropListener.call(this, ev);
};

ZmCalViewController.prototype.sendRequest =
function(soapDoc) {
	try {
		return appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
	} catch (ex) {
		// do nothing
		return null;
	}
};

/**
 * Caller is responsible for exception handling. caller should also not modify
 * appts in this list directly.
 *
 * @param	{Hash}		params		a hash of parameters
 * @param	{long}	params.start 			the start time (in milliseconds)
 * @param	{long}	params.end				the end time (in milliseconds)
 * @param	{Boolean}	params.fanoutAllDay	if <code>true</code>, 
 * @param	{Array}	params.folderIds		the list of calendar folder Id's (null means use checked calendars in overview)
 * @param	{AjxCallback}	params.callback		the callback triggered once search results are returned
 * @param	{Boolean}	params.noBusyOverlay	if <code>true</code>, do not show veil during search
 * 
 * @private
 */
ZmCalViewController.prototype.getApptSummaries =
function(params) {
	if (!params.folderIds) {
		params.folderIds = this.getCheckedCalendarFolderIds();
	}
	params.query = this._userQuery;

	return this.apptCache.getApptSummaries(params);
};

ZmCalViewController.prototype.handleUserSearch =
function(params, callback) {
	AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);
	//Calendar search is defaulted to list view when searched from the calendar app.
	if (params.origin === ZmId.SEARCH) {
		this.show(ZmId.VIEW_CAL_LIST, null, true);
	}
	else {
		this.show(null, null, true);
	}

	this.apptCache.clearCache();
	this._viewMgr.setNeedsRefresh();
	this._userQuery = params.query;

	// set start/end date boundaries
	var view = this._listView[this._currentViewId];

	if (view) {
		var rt = view.getTimeRange();
		params.start = rt.start;
		params.end = rt.end;
	} else if (this._miniCalendar) {
		var calRange = this._miniCalendar.getDateRange();
		params.start = calRange.start.getTime();
		params.end = calRange.end.getTime();
	} else {
		// TODO - generate start/end based on current month?
	}

	params.fanoutAllDay = view && view._fanoutAllDay();
	params.callback = this._searchResponseCallback.bind(this, callback);

	this.getApptSummaries(params);
};

ZmCalViewController.prototype._searchResponseCallback =
function(callback, list, userQuery, result) {

	this.show(null, null, true);	// always make sure a calendar view is being shown
	this._userQuery = userQuery;	// cache the user-entered search query

	this._maintGetApptCallback(ZmCalViewController.MAINT_VIEW, this._listView[this._currentViewId], list, true, userQuery);

	if (callback) {
		callback.run(result);
	}
};

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(create) {
	// mark folders which needs to be cleared
	if (create && create.l) {
		var cal = appCtxt.getById(create.l);
		if (cal && cal.id) {
			this._clearCacheFolderMap[cal.id] = true;
		}
	}
};

ZmCalViewController.prototype.notifyDelete =
function(ids) {
    if (this._modifyAppts) {
        var apptList = this._viewMgr.getSubContentView().getApptList();
        for (var i = 0; i < ids.length; i++) {
            var appt = ZmCalViewController.__AjxVector_getById(apptList, ids[i])
            if (appt) {
                apptList.remove(appt);
                this._modifyAppts.removes++;
            }
        }
    }

	if (this._clearCache) { return; }

	this._clearCache = this.apptCache.containsAnyId(ids);
	this.handleEditConflict(ids);
};

ZmCalViewController.prototype.handleEditConflict =
function(ids) {
	//handling a case where appt is edited and related calendar is deleted
	if (appCtxt.getCurrentViewId() == ZmId.VIEW_APPOINTMENT) {
		var view = appCtxt.getCurrentView();
		var appt = view.getAppt(true);
		var calendar = appt && appt.getFolder();
		var idStr = ","+ ids+",";
		if (idStr.indexOf("," + calendar.id + ",") >= 0) {
			this._app.getApptComposeController()._closeView();
		}
	}
};

ZmCalViewController.prototype.notifyModify =
function(modifies) {
    var apptObjs = modifies.appt;
    if (apptObjs && this._viewMgr) {
        var listView = this._viewMgr.getSubContentView();
        if (listView) {
            for (var i = 0; i < apptObjs.length; i++) {
                var apptObj = apptObjs[i];
                // case 1: item moved *into* Trash
                if (apptObj.l == ZmOrganizer.ID_TRASH) {
                    this._modifyAppts.adds++;
                    ZmAppt.loadByUid(apptObj.uid, new AjxCallback(this, this._updateSubContent));
                }
                // case 2: item moved *from* Trash
                else {
                    var apptList = listView.getApptList();
                    var appt = ZmCalViewController.__AjxVector_getById(apptList, apptObj.id)
                    if (appt) {
                        apptList.remove(appt);
                        this._modifyAppts.removes++;
                        // TODO: was this appointment moved to a checked calendar w/in the specified range?
                    }
                }
                // case 3: neither, ignore
            }
        }
    }

	if (this._clearCache) { return; }

	// if any of the ids are in the cache then...
	for (var name in modifies) {
		var list = modifies[name];
		this._clearCache = this._clearCache || this.apptCache.containsAnyItem(list);
	}
};

ZmCalViewController.__AjxVector_getById = function(vector, id) {
    var array = vector.getArray();
    for (var i = 0; i < array.length; i++) {
        var item = array[i];
        if (item.id == id) return item;
    }
    return null;
};

ZmCalViewController.prototype._updateSubContent = function(appt) {
    if (appt) {
        var listView = this._viewMgr.getSubContentView();
        if (listView) {
            if (!listView.hasItem(appt.id)) {
                listView.getApptList().add(appt);
            }
            listView.setNeedsRefresh(true);
            if (!this._modifyAppts || --this._modifyAppts.adds <= 0) {
                listView.refresh();
                this._clearCache = true;
                this.refreshHandler();
            }
        }
    }
};

// this gets called before all the above notify* methods get called
ZmCalViewController.prototype.preNotify = function(notify) {
    DBG.println(AjxDebug.DBG2, "ZmCalViewController: preNotify");
    this._modifyAppts = null;
    if (notify.deleted || (notify.modified && notify.modified.appt)) {
        var listView = this._viewMgr && this._viewMgr.getSubContentView();
        if (listView) {
            this._modifyAppts = { adds: 0, removes:0 };
        }
    }
};

// this gets called after all the above notify* methods get called
ZmCalViewController.prototype.postNotify =
function(notify) {
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: postNotify: " + this._clearCache);

    // update the trash list all at once
    if (this._modifyAppts) {
        var removes = this._modifyAppts.removes;
        var adds = this._modifyAppts.adds;
        if (removes || adds) {
            var listView = this._viewMgr.getSubContentView();
            if (listView) {
                listView.setNeedsRefresh(true);
                listView.refresh();
                this._clearCache = true;
            }
        }
        this._modifyAppts.removes = 0;
    }

	var clearCacheByFolder = false;
	
	for (var i in this._clearCacheFolderMap) {
		DBG.println("clear cache :" + i);
		this.apptCache.clearCache(i);
		clearCacheByFolder = true;
	}
	this._clearCacheFolderMap = {};

	//offline client makes batch request for each account configured causing
	//refresh overlap clearing calendar
	var timer = (appCtxt.isOffline && this.searchInProgress) ? 1000 : 0;
	
	if (this._clearCache) {
		var act = new AjxTimedAction(this, this._refreshAction);
		AjxTimedAction.scheduleAction(act, timer);
		this._clearCache = false;
	} else if(clearCacheByFolder) {
		var act = new AjxTimedAction(this, this._refreshAction, [true]);
		AjxTimedAction.scheduleAction(act, timer);
	}
};

ZmCalViewController.prototype.setNeedsRefresh =
function(refresh) {
	if (this._viewMgr != null && this._viewMgr.setNeedsRefresh) {
		this._viewMgr.setNeedsRefresh(refresh);
	}
};

// returns true if moving given appt from local to remote folder or vice versa
ZmCalViewController.prototype.isMovingBetwAccounts =
function(appts, newFolderId) {
	appts = (!(appts instanceof Array)) ? [appts] : appts;
	var isMovingBetw = false;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		if (!appt.isReadOnly() && appt._orig && appt.otherAttendees && !appCtxt.isWebClientOffline()) {
			var origFolder = appt._orig.getFolder();
			var newFolder = appCtxt.getById(newFolderId);
			if (origFolder && newFolder) {
				if ((origFolder.id != newFolderId) &&
					((origFolder.link && !newFolder.link) || (!origFolder.link && newFolder.link)))
				{
					isMovingBetw = true;
					break;
				}
			}
		}
	}

	return isMovingBetw;
};

// returns true if moving given read-only invite appt between accounts
ZmCalViewController.prototype.isMovingBetwAcctsAsAttendee =
function(appts, newFolderId) {
	appts = (!(appts instanceof Array)) ? [appts] : appts;
	var isMovingBetw = false;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		if (appt.isReadOnly() && appt._orig) {
			var origFolder = appt._orig.getFolder();
			var newFolder = appCtxt.getById(newFolderId);
			if (origFolder && newFolder) {
				if ((origFolder.id != newFolderId) && origFolder.owner != newFolder.owner)
				{
					isMovingBetw = true;
					break;
				}
			}
		}
	}

	return isMovingBetw;
};

// this gets called when we get a refresh block from the server
ZmCalViewController.prototype.refreshHandler =
function() {
	var act = new AjxTimedAction(this, this._refreshAction);
	AjxTimedAction.scheduleAction(act, 0);
};

ZmCalViewController.prototype._refreshAction =
function(dontClearCache) {
	DBG.println(AjxDebug.DBG1, "ZmCalViewController: _refreshAction: " + dontClearCache);
	var forceMaintenance = false;
	// reset cache
	if (!dontClearCache) {
		this.apptCache.clearCache();
		forceMaintenance = true;
	}

	if (this._viewMgr != null) {
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else if (this._miniCalendar != null) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	} else {
		this._scheduleMaintenance(ZmCalViewController.MAINT_REMINDER, forceMaintenance);
	}
};

ZmCalViewController.prototype._maintErrorHandler =
function(params) {
	// TODO: resched work?
};

ZmCalViewController.prototype._maintGetApptCallback =
function(work, view, list, skipMiniCalUpdate, query) {
	if (list instanceof ZmCsfeException) {
		this.searchInProgress = false;
		this._handleError(list, new AjxCallback(this, this._maintErrorHandler));
		return;
	}
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: _maintGetApptCallback: " + work);
	this._userQuery = query;

	if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = new ZmApptList();
		this._list.getVector().addList(list);
		var sel = view.getSelection();
		view.set(list);

		// For bug 27221, reset toolbar after refresh
		if (sel && sel.length > 0) {
			var id = sel[0].id;
			for (var i = 0; i < this._list.size(); i++) {
				if (this._list.getArray()[i].id == id) {
					view.setSelection(this._list.getArray[i],true);
					break;
				}
			}
		}
		this._resetToolbarOperations();
	}

	if (work & ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
	}

	this.searchInProgress = false;

	// initiate schedule action for pending work (process queued actions)
	if (this._pendingWork != ZmCalViewController.MAINT_NONE) {
		var newWork = this._pendingWork;
		this._pendingWork = ZmCalViewController.MAINT_NONE;
		this._scheduleMaintenance(newWork);
	}
};


ZmCalViewController.prototype.refreshCurrentView =
 function() {
    var currentView = this.getCurrentView();
    if (currentView) {
        currentView.setNeedsRefresh(true);
        this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
    }
}


ZmCalViewController.prototype._scheduleMaintenance =
function(work, forceMaintenance) {

	DBG.println(AjxDebug.DBG1, "ZmCalViewController._scheduleMaintenance, work = " + work + ", forceMaintenance = " + forceMaintenance);
	DBG.println(AjxDebug.DBG1, "ZmCalViewController._scheduleMaintenance, searchInProgress = " + this.searchInProgress + ", pendingWork = " + this._pendingWork);
	this.onErrorRecovery = new AjxCallback(this, this._errorRecovery, [work, forceMaintenance]);

	// schedule timed action
	if ((!this.searchInProgress || forceMaintenance) &&
		(this._pendingWork == ZmCalViewController.MAINT_NONE))
	{
		this._pendingWork |= work;
		AjxTimedAction.scheduleAction(this._maintTimedAction, 0);
	}
	else
	{
		this._pendingWork |= work;
	}
};

ZmCalViewController.prototype.resetSearchFlags =
function() {
    this.searchInProgress = false;
    this._pendingWork = ZmCalViewController.MAINT_NONE;
};

ZmCalViewController.prototype._errorRecovery =
function(work, forceMaintenance) {
	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	if (maintainMiniCal || maintainView || maintainRemainder) {
		this.getCurrentView().setNeedsRefresh(true);
	}
	this._scheduleMaintenance(work, forceMaintenance);
};

ZmCalViewController.prototype._maintenanceAction =
function() {
	DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, work = " + this._pendingWork);
 	var work = this._pendingWork;
	this.searchInProgress = true;
	this._pendingWork = ZmCalViewController.MAINT_NONE;

	var maintainMiniCal = (work & ZmCalViewController.MAINT_MINICAL);
	var maintainView = (work & ZmCalViewController.MAINT_VIEW);
	var maintainRemainder = (work & ZmCalViewController.MAINT_REMINDER);
	
	if (work == ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
		this.searchInProgress = false;
	}
	else if (maintainMiniCal || maintainView || maintainRemainder) {
        // NOTE: It's important that we go straight to the view!
		var view = this._viewMgr ? this._viewMgr.getView(this._currentViewId) : null;
		var needsRefresh =  view && view.needsRefresh();
		DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, view = " + this._currentViewId + ", needsRefresh = " + needsRefresh);
		if (needsRefresh) {
            var rt = view.getTimeRange();
			var params = {
				start: rt.start,
				end: rt.end,
				fanoutAllDay: view._fanoutAllDay(),
				callback: (new AjxCallback(this, this._maintGetApptCallback, [work, view])),
				accountFolderIds: ([].concat(this._checkedAccountCalendarIds)), // pass in a copy, not a reference
				query: this._userQuery
			};

			var reminderParams;
			if (maintainRemainder) {
				reminderParams = this._app.getReminderController().getRefreshParams();
				reminderParams.callback = null;
			}

			DBG.println(AjxDebug.DBG1, "ZmCalViewController._maintenanceAction, do apptCache.batchRequest");
			this.apptCache.batchRequest(params, this.getMiniCalendarParams(), reminderParams);
			view.setNeedsRefresh(false);
		} else {
			this.searchInProgress = false;
		}
	}
};

ZmCalViewController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_CALENDAR;
};

ZmCalViewController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmCalViewController.handleKeyAction");
	var isWebClientOffline = appCtxt.isWebClientOffline();

	switch (actionCode) {

		case ZmKeyMap.CAL_DAY_VIEW:
		case ZmKeyMap.CAL_WEEK_VIEW:
		case ZmKeyMap.CAL_WORK_WEEK_VIEW:
		case ZmKeyMap.CAL_MONTH_VIEW:
			this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			break;

		case ZmKeyMap.CAL_LIST_VIEW:
			if (!isWebClientOffline) {
				this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			}
			break;

        case ZmKeyMap.CAL_FB_VIEW:
            if(appCtxt.get(ZmSetting.FREE_BUSY_VIEW_ENABLED) && !isWebClientOffline) {
                this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
            }
			break;

		case ZmKeyMap.TODAY:
			this._todayButtonListener();
			break;

		case ZmKeyMap.REFRESH:
			this._refreshButtonListener();
			break;

		case ZmKeyMap.QUICK_ADD:
			if (appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD) && !isWebClientOffline) {
				var date = this._viewMgr ? this._viewMgr.getDate() : new Date();
				this.newAppointmentHelper(date, ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
			}
			break;

		case ZmKeyMap.EDIT:
			if (!isWebClientOffline) {
				var appt = this.getSelection()[0];
				if (appt) {
					var ev = new DwtSelectionEvent();
					ev.detail = DwtListView.ITEM_DBL_CLICKED;
					ev.item = appt;
					this._listSelectionListener(ev);
				}
			}
			break;

		case ZmKeyMap.CANCEL:
            var currentView = this._viewMgr.getCurrentView();
            if ((this._currentViewType == ZmId.VIEW_CAL_WORK_WEEK) ||
                (this._currentViewType == ZmId.VIEW_CAL_WEEK) ||
                (this._currentViewType == ZmId.VIEW_CAL_MONTH)) {
                // Abort - restore location and Mouse up
                var data = DwtMouseEventCapture.getTargetObj();
                if (data) {
                    currentView._restoreApptLoc(data);
                    currentView._cancelNewApptDrag(data);
                    data.startDate = data.appt ? data.appt._orig.startDate : null;
                    ZmCalBaseView._apptMouseUpHdlr(null);
                }
            }
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

ZmCalViewController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[ZmId.VIEW_CAL];
};

/**
 * Returns a reference to the singleton message controller, used to send mail (in our case,
 * invites and their replies). If mail is disabled, we create our own ZmMsgController so that
 * we don't load the mail package.
 * 
 * @private
 */
ZmCalViewController.prototype._getMsgController =
function() {
	if (!this._msgController) {
		if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
			this._msgController = AjxDispatcher.run("GetMsgController");
		} else {
			AjxDispatcher.require("Mail");
			this._msgController = new ZmMsgController(this._container, this._app);
		}
	}
	return this._msgController;
};

ZmCalViewController.prototype.getMiniCalendarParams =
function() {
	var dr = this.getMiniCalendar().getDateRange();
	return {
		start: dr.start.getTime(),
		end: dr.end.getTime(),
		fanoutAllDay: true,
		noBusyOverlay: true,
		folderIds: this.getCheckedCalendarFolderIds(),
		tz: AjxTimezone.DEFAULT
	};
};

ZmCalViewController.prototype.getMiniCalCache =
function() {
	if (!this._miniCalCache) {
		this._miniCalCache = new ZmMiniCalCache(this);
	}
	return this._miniCalCache;
};

/**
 * Gets the calendar name.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{String}	the name
 */
ZmCalViewController.prototype.getCalendarName =
function(folderId) {
	var cal = appCtxt.getById(folderId);
	return cal && cal.getName();
};

ZmCalViewController.prototype._checkItemCount =
function() {
	// No-op since this view doesn't do virtual paging.
};


ZmCalViewController.prototype._showOrigListener =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu && actionMenu.__appt;
	if (appt) {
		setTimeout(this._showApptSource.bind(this, appt), 100); // Other listeners are focusing the main window, so delay the window opening for just a bit
	}
};

ZmCalViewController.prototype._showApptSource =
function(appt) {
    var apptFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI)
                    + "&id=" + AjxStringUtil.urlComponentEncode(appt.id || appt.invId)
                    +"&mime=text/plain&noAttach=1&icalAttach=none";
    // create a new window w/ generated msg based on msg id
    window.open(apptFetchUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};

ZmCalViewController.prototype.getAppointmentByInvite =
function(invite, callback) {

	var apptId = invite.getAppointmentId();
	if(apptId) {
		var jsonObj = {GetAppointmentRequest:{_jsns:"urn:zimbraMail"}};
		var request = jsonObj.GetAppointmentRequest;
		request.id = apptId;
		request.includeContent = "1";

		var accountName = (appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null);

		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._getApptItemInfoHandler, [invite, callback])),
			errorCallback: (new AjxCallback(this, this._getApptItemInfoErrorHandler, [invite, callback])),
			accountName: accountName
		});
	}
};

ZmCalViewController.prototype._getApptItemInfoHandler =
function(invite, callback, result) {
	var resp = result.getResponse();
	resp = resp.GetAppointmentResponse;

	var apptList = new ZmApptList();
	var apptNode = resp.appt[0];
	var appt = ZmAppt.createFromDom(apptNode, {list: apptList}, null);

	var invites = apptNode.inv;
	appt.setInvIdFromProposedInvite(invites, invite);

	if(callback) {
		callback.run(appt);
	}
};

ZmCalViewController.prototype._getApptItemInfoErrorHandler =
function(invite, callback, result) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(ZmMsg.unableToAcceptTime, DwtMessageDialog.INFO_STYLE);
	msgDialog.popup();
	return true;
};

ZmCalViewController.prototype.acceptProposedTime =
function(apptId, invite, proposeTimeCallback) {

	this._proposedTimeCallback = proposeTimeCallback;

	if(apptId) {
		var callback = new AjxCallback(this, this._acceptProposedTimeContinue, [invite]);
		this.getAppointmentByInvite(invite, callback);
	}else {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.reset();
		msgDialog.setMessage(ZmMsg.unableToAcceptTime, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
	}
};

ZmCalViewController.prototype._acceptProposedTimeContinue =
function(invite, appt) {
	var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
	appt.setProposedInvite(invite);
	appt.setProposedTimeCallback(this._proposedTimeCallback);
	this.editAppointment(appt, mode);
};

ZmCalViewController.prototype.proposeNewTime =
function(msg) {
	var newAppt = this.newApptObject(new Date(), null, null, msg),
        mode = ZmCalItem.MODE_EDIT,
        apptId = msg.invite.getAppointmentId();
	newAppt.setProposeTimeMode(true);
	newAppt.setFromMailMessageInvite(msg);
    if (apptId) {
		var msgId = msg.id;
		var inx = msg.id.indexOf(":");
		var accountId = null;
		if (inx !== -1) {
			accountId = msgId.substr(0, inx);
			msgId = msgId.substr(inx + 1);
		}
		var invId = [apptId, msgId].join("-");
		if (accountId) {
			invId = [accountId, invId].join(":");
		}
		newAppt.invId = invId;
        newAppt.getDetails(mode, new AjxCallback(this, this.proposeNewTimeContinue, [newAppt, mode]));
    }
    else {
        newAppt.setViewMode(mode);
        AjxDispatcher.run("GetApptComposeController").proposeNewTime(newAppt);
    }
};

ZmCalViewController.prototype.proposeNewTimeContinue =
function(newAppt, mode) {
    newAppt.setViewMode(mode);
	AjxDispatcher.run("GetApptComposeController").proposeNewTime(newAppt);
};

ZmCalViewController.prototype.forwardInvite =
function(msg) {
	var invite = msg.invite;
	var apptId = invite.getAppointmentId();

	if(apptId && invite.isOrganizer()) {
		var callback = new AjxCallback(this, this.forwardInviteContinue, [invite, msg]);
		this.getAppointmentByInvite(invite, callback);
	}else {
		var newAppt = this.newApptObject(new Date(), null, null, msg);
		newAppt.setForwardMode(true);
		newAppt.setFromMailMessageInvite(msg);
		AjxDispatcher.run("GetApptComposeController").forwardInvite(newAppt);
	}
};

ZmCalViewController.prototype.forwardInviteContinue =
function(invite, msg, appt) {
	appt.setForwardMode(true);
	appt.setFromMailMessageInvite(msg);
	var mode = appt.isRecurring() ? (appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES) : ZmCalItem.MODE_EDIT;
	var clone = ZmAppt.quickClone(appt);
	clone.getDetails(mode, new AjxCallback(this, this._forwardInviteCompose, [clone]));
};

ZmCalViewController.prototype._forwardInviteCompose =
function (appt) {
	AjxDispatcher.run("GetApptComposeController").forwardInvite(appt);
};

ZmCalViewController.prototype.getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	var acct = (appCtxt.multiAccounts)
		? this._composeView.getApptEditView().getCalendarAccount() : null;

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

ZmCalViewController.prototype.getWorkingInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
   var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
   soapDoc.setMethodAttribute("s", startTime);
   soapDoc.setMethodAttribute("e", endTime);
   soapDoc.setMethodAttribute("name", emailList);

   var acct = (appCtxt.multiAccounts)
       ? this._composeView.getApptEditView().getCalendarAccount() : null;

   return appCtxt.getAppController().sendRequest({
       soapDoc: soapDoc,
       asyncMode: true,
       callback: callback,
       errorCallback: errorCallback,
       noBusyOverlay: noBusyOverlay,
       accountName: (acct ? acct.name : null)
   });
};

/**
 * Sets the current view.
 *
 * @param {ZmListView} view	the view
 */
ZmCalViewController.prototype.setCurrentListView = function(view) {
    if (!view) {
        return;
    }

    if (this._currentListView != view) {
        var hadFocus = this._currentListView && this._currentListView.hasFocus();

        this._currentListView = view;
        this._resetToolbarOperations();

        if (hadFocus) {
            this._currentListView.focus();
        }
    }
};

ZmCalViewController.prototype.getCurrentListView = function() {
    return this._currentListView || this.getCurrentView();
};

/**
 * Creates appointment as configured in the out-of-office preference
 */
ZmCalViewController.prototype.createAppointmentFromOOOPref=
function(startDate, endDate, allDay, respCallback){
       var newAppt = new ZmAppt();
       newAppt.setAllDayEvent(allDay);
	   newAppt.setStartDate(startDate);
	   newAppt.setEndDate(endDate);
       newAppt.name = ZmMsg.outOfOffice;
       newAppt.freeBusy = (appCtxt.get(ZmSetting.VACATION_CALENDAR_TYPE)=="BUSY")?"B":"O";
       newAppt.message = appCtxt.get(ZmSetting.VACATION_MSG);
       newAppt.convertToLocalTimezone();
       newAppt.save(null, respCallback);
};
