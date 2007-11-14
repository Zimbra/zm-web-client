/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

/**
 *	The strategy for the calendar is to leverage the list view stuff by creating a single
 *	view (i.e. ZmCalViewMgr) and have it manage the schedule views (e.g. week, month) and
 *	a single calendar view (the calendar widget to the right). Each of the schedule views
 *	will be a list view that are managed by the ZmCalViewMgr.
 *
 *	To do this we have to trick the ZmListController. Specifically we have only one toolbar and
 *	directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
 *	directly replace:
 *
 *	ZmListControl.prototype.initializeToolBar
 */

ZmCalViewController = function(container, calApp) {
	ZmListController.call(this, container, calApp);

	var apptListener = new AjxListener(this, this._handleApptRespondAction);
	var apptEditListener = new AjxListener(this, this._handleApptEditRespondAction);
	var calViewListener = new AjxListener(this, this._calViewButtonListener);

	// get view based on op
	ZmCalViewController.OP_TO_VIEW = {};
	ZmCalViewController.OP_TO_VIEW[ZmOperation.DAY_VIEW]		= ZmController.CAL_DAY_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WEEK_VIEW]		= ZmController.CAL_WEEK_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WORK_WEEK_VIEW]	= ZmController.CAL_WORK_WEEK_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.MONTH_VIEW]		= ZmController.CAL_MONTH_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.SCHEDULE_VIEW]	= ZmController.CAL_SCHEDULE_VIEW;

	// get op based on view
	ZmCalViewController.VIEW_TO_OP = {};
	for (var op in ZmCalViewController.OP_TO_VIEW) {
		ZmCalViewController.VIEW_TO_OP[ZmCalViewController.OP_TO_VIEW[op]] = op;
	}

	this._listeners[ZmOperation.REPLY_ACCEPT] = apptListener;
	this._listeners[ZmOperation.REPLY_DECLINE] = apptListener;
	this._listeners[ZmOperation.REPLY_TENTATIVE] = apptListener;
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE] = apptEditListener;
	this._listeners[ZmOperation.VIEW_APPOINTMENT] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.TODAY] = new AjxListener(this, this._todayButtonListener);
	this._listeners[ZmOperation.DAY_VIEW] = calViewListener;
	this._listeners[ZmOperation.WEEK_VIEW] = calViewListener;
	this._listeners[ZmOperation.WORK_WEEK_VIEW] = calViewListener;
	this._listeners[ZmOperation.MONTH_VIEW] = calViewListener;
	this._listeners[ZmOperation.SCHEDULE_VIEW] = calViewListener;
	this._listeners[ZmOperation.NEW_APPT] = new AjxListener(this, this._newApptAction);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT] = new AjxListener(this, this._newAllDayApptAction);
	this._listeners[ZmOperation.SEARCH_MAIL] = new AjxListener(this, this._searchMailAction);
	this._listeners[ZmOperation.CAL_REFRESH] = new AjxListener(this, this._refreshButtonListener);

	this._treeSelectionListener = new AjxListener(this, this._calTreeSelectionListener);
	this._maintTimedAction = new AjxTimedAction(this, this._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;
	this._apptCache = new ZmApptCache(this);
	ZmCalViewController.OPS = [ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW,
							   ZmOperation.MONTH_VIEW, ZmOperation.SCHEDULE_VIEW];

	// get view based on op
	ZmCalViewController.OP_TO_VIEW = {};
	ZmCalViewController.OP_TO_VIEW[ZmOperation.DAY_VIEW]		= ZmController.CAL_DAY_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WEEK_VIEW]		= ZmController.CAL_WEEK_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.WORK_WEEK_VIEW]	= ZmController.CAL_WORK_WEEK_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.MONTH_VIEW]		= ZmController.CAL_MONTH_VIEW;
	ZmCalViewController.OP_TO_VIEW[ZmOperation.SCHEDULE_VIEW]	= ZmController.CAL_SCHEDULE_VIEW;

	this._initializeViewActionMenu();

	this._errorCallback = new AjxCallback(this, this._handleError);
};

ZmCalViewController.prototype = new ZmListController();
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController.DEFAULT_APPOINTMENT_DURATION = 3600000;

// maintenance needed on views and/or minical
ZmCalViewController.MAINT_NONE 		= 0x0; // no work to do
ZmCalViewController.MAINT_MINICAL 	= 0x1; // minical needs refresh
ZmCalViewController.MAINT_VIEW 		= 0x2; // view needs refresh
ZmCalViewController.MAINT_REMINDER	= 0x4; // reminders need refresh

// get view based on op
ZmCalViewController.ACTION_CODE_TO_VIEW = {};
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_DAY_VIEW]			= ZmController.CAL_DAY_VIEW;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WEEK_VIEW]			= ZmController.CAL_WEEK_VIEW;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_WORK_WEEK_VIEW]	= ZmController.CAL_WORK_WEEK_VIEW;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_MONTH_VIEW]		= ZmController.CAL_MONTH_VIEW;
ZmCalViewController.ACTION_CODE_TO_VIEW[ZmKeyMap.CAL_SCHEDULE_VIEW]		= ZmController.CAL_SCHEDULE_VIEW;

ZmCalViewController.prototype.toString =
function() {
	return "ZmCalViewController";
};

// Zimlet hack
ZmCalViewController.prototype.postInitListeners =
function () {
	if(ZmZimlet.listeners && ZmZimlet.listeners["ZmCalViewController"]) {
		for(var ix in ZmZimlet.listeners["ZmCalViewController"]) {
			if(ZmZimlet.listeners["ZmCalViewController"][ix] instanceof AjxListener)  {
				this._listeners[ix] = ZmZimlet.listeners["ZmCalViewController"][ix];
			} else {
				this._listeners[ix] = new AjxListener(this, ZmZimlet.listeners["ZmCalViewController"][ix]);
			}
		}
	}
};

ZmCalViewController.prototype._defaultView =
function() {
	var view = appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
	switch (view) {
		case "day": 		return ZmController.CAL_DAY_VIEW;
		case "workWeek": 	return ZmController.CAL_WORK_WEEK_VIEW;
		case "week": 		return ZmController.CAL_WEEK_VIEW;
		case "month": 		return ZmController.CAL_MONTH_VIEW;
		case "schedule": 	return ZmController.CAL_SCHEDULE_VIEW;
		default:  			return ZmController.CAL_WORK_WEEK_VIEW;
	}
};

ZmCalViewController.prototype.firstDayOfWeek =
function() {
	return appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};

ZmCalViewController.prototype.show =
function(viewId, startDate, skipMaintenance) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	if (!viewId || viewId == ZmController.CAL_VIEW)
		viewId = this._currentView ? this._currentView : this._defaultView();

	if (!this._calTreeController) {
		this._calTreeController = appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController) {
			this._calTreeController.addSelectionListener(this._app.getOverviewId(), this._treeSelectionListener);
			var calTree = appCtxt.getFolderTree();
			if (calTree)
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));
			// add change listener
		}
		DBG.timePt("getting tree controller", true);
	}

	if (!this._viewMgr) {
		var newDate = startDate || (this._miniCalendar ? this._miniCalendar.getDate() : new Date());

		if (!this._miniCalendar) {
			this._createMiniCalendar(newDate);
			//DBG.timePt("_createMiniCalendar");
		}

		this._viewMgr = new ZmCalViewMgr(this._container, this, this._dropTgt);
		//DBG.timePt("created view manager");
		this._viewMgr.setDate(newDate);
		//DBG.timePt("_viewMgr.setDate");
		this._setup(viewId);
		//DBG.timePt("this._setup");
		this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
		this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
		this._viewMgr.addViewActionListener(new AjxListener(this, this._viewActionListener));
		DBG.timePt("created view manager");
	}

	if (!this._viewMgr.getView(viewId)) {
		this._setup(viewId);
	}

	this._viewMgr.setView(viewId);
	DBG.timePt("setup and set view");

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[ZmController.CAL_VIEW];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._viewMgr;
	this._setView(ZmController.CAL_VIEW, elements, true);
	this._currentView = this._viewMgr.getCurrentViewName();
	this._listView[this._currentView] = this._viewMgr.getCurrentView();
	this._resetToolbarOperations();

	switch(viewId) {
		case ZmController.CAL_DAY_VIEW:
		case ZmController.CAL_SCHEDULE_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousDay);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextDay);
			break;
		case ZmController.CAL_WORK_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWorkWeek);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWorkWeek);
			break;
		case ZmController.CAL_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousWeek);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextWeek);
			break;
		case ZmController.CAL_MONTH_VIEW:
			// use day until month does something
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previousMonth);
			this._navToolBar[ZmController.CAL_VIEW].setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.nextMonth);
			break;
	}
	DBG.timePt("switching selection mode and tooltips");

	if (viewId == ZmController.CAL_APPT_VIEW) {
		this._navToolBar[ZmController.CAL_VIEW].setVisible(false);
	} else {
		this._navToolBar[ZmController.CAL_VIEW].setVisible(true);
		var cv = this._viewMgr.getCurrentView();
		var navText = viewId == ZmController.CAL_MONTH_VIEW
			? cv.getShortCalTitle()
			: cv.getCalTitle();
		this._navToolBar[ZmController.CAL_VIEW].setText(navText);
		if (!skipMaintenance) {
			this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
		}
		DBG.timePt("scheduling maintenance");
	}
};

ZmCalViewController.prototype.getCheckedCalendars =
function() {
	if (this._checkedCalendars == null) {
		if (this._calTreeController == null) { return []; }
		this._updateCheckedCalendars();
	}
	return this._checkedCalendars;
};

ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function(localOnly) {
	if (this._checkedCalendarFolderIds == null) {
		this.getCheckedCalendars();
		if (this._checkedCalendarFolderIds == null) 
			return [ZmOrganizer.ID_CALENDAR];
	}
	return localOnly
		? this._checkedLocalCalendarFolderIds
		: this._checkedCalendarFolderIds;
};

ZmCalViewController.prototype.getCheckedCalendar =
function(id) {
	var calendars = this.getCheckedCalendars();
	for (var i = 0; i < calendars.length; i++) {
		var calendar = calendars[i];
		if (calendar.id == id) {
			return calendar;
		}
	}
	return null;
};

ZmCalViewController.prototype.handleMailboxChange =
function() {
	this._calTreeController.addSelectionListener(this._app.getOverviewId(), this._treeSelectionListener);
	this._updateCheckedCalendars();
	this._refreshAction(false);
};

ZmCalViewController.prototype._updateCheckedCalendars =
function() {
	if (!this._calTreeController) { return []; }

	var cc = this._calTreeController.getCheckedCalendars(this._app.getOverviewId());
	this._checkedCalendars = cc;
	this._checkedCalendarFolderIds = [];
	this._checkedLocalCalendarFolderIds = [];
	for (var i=0; i < cc.length; i++) {
		var cal = cc[i];
		this._checkedCalendarFolderIds.push(cal.nId);
		if (cal.isRemote && !cal.isRemote()) {
			this._checkedLocalCalendarFolderIds.push(cal.nId);
		}
	}
	return cc;
};

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) { return; }

	this._updateCheckedCalendars();
	this._refreshAction(true);

	// save checkbox state to server
	if (ev.item) {
		var calendar = ev.item.getData(Dwt.KEY_OBJECT);
		calendar.setChecked(ev.item.getChecked());
	} else if (ev.items && ev.items.length) {
		var batchCmd = new ZmBatchCommand();
		for (var i = 0; i < ev.items.length; i++) {
			var item = ev.items[i];
			var calendar = item.getData(Dwt.KEY_OBJECT);
			batchCmd.add(new AjxCallback(calendar, calendar.setChecked, [item.getChecked()]));
		}
		batchCmd.run();
	}
};

ZmCalViewController.prototype._calTreeChangeListener =
function(ev) {
	// TODO: check only for color/name changes?
	if (ev.event == ZmEvent.E_DELETE) {
		this._updateCheckedCalendars();
	}
	this._refreshAction(true);
};

ZmCalViewController.prototype.getCalendar =
function(folderId) {
	return appCtxt.getById(folderId);
};

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) { return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR]; }
	var cal = this.getCalendar(folderId);
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.CALENDAR];
};

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	// reset possibly set user query
	this._userQuery = null;
	var sc = appCtxt.getSearchController();
	sc.setSearchField("");
	sc.getSearchToolbar().blur();

	this._refreshAction(false);
};

ZmCalViewController.prototype._getToolBarOps =
function() {
	return [ZmOperation.NEW_MENU, ZmOperation.CAL_REFRESH,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.PRINT,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU,
			ZmOperation.SEP,
			ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.SCHEDULE_VIEW,
			ZmOperation.SEP,
			ZmOperation.TODAY];
};

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewId) {
	if (this._toolbar[ZmController.CAL_VIEW]) return;

	ZmListController.prototype._initializeToolBar.call(this, ZmController.CAL_DAY_VIEW);

	// NOTE: bug 5720
	if (AjxEnv.is800x600orLower) {
		var toolbar = this._toolbar[ZmController.CAL_DAY_VIEW];
		toolbar.getButton(ZmOperation.DAY_VIEW).setText("");
		toolbar.getButton(ZmOperation.WEEK_VIEW).setText("");
		toolbar.getButton(ZmOperation.WORK_WEEK_VIEW).setText("");
		toolbar.getButton(ZmOperation.MONTH_VIEW).setText("");
		toolbar.getButton(ZmOperation.SCHEDULE_VIEW).setText("");
	}

	// Set the other view toolbar entries to point to the Day view entry. I.e. this is a trick
	// to fool the ZmListController into thinking there are multiple toolbars
	this._toolbar[ZmController.CAL_SCHEDULE_VIEW] = this._toolbar[ZmController.CAL_WEEK_VIEW] =
		this._toolbar[ZmController.CAL_WORK_WEEK_VIEW] = this._toolbar[ZmController.CAL_MONTH_VIEW] =
		this._toolbar[ZmController.CAL_APPT_VIEW] = this._toolbar[ZmController.CAL_DAY_VIEW];
	this._toolbar[ZmController.CAL_VIEW] = this._toolbar[ZmController.CAL_DAY_VIEW];

	// Setup the toolbar stuff
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.TODAY], true);
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.CAL_REFRESH], true);
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);

	this._toolbar[ZmController.CAL_DAY_VIEW].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[ZmController.CAL_DAY_VIEW], DwtControl.STATIC_STYLE, "ZmNavToolbar ZmCalendarNavToolbar", ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, ZmController.CAL_VIEW);

	this._setNewButtonProps(viewId, ZmMsg.createNewAppt, "NewAppointment", "NewAppointmentDis", ZmOperation.NEW_APPT);
};

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore since this will always be ZmController.CAL_VIEW as we are fooling
	// ZmListController (see our show method)
};

ZmCalViewController.prototype._getTagMenuMsg =
function(num) {
	return (num == 1) ? ZmMsg.tagAppt : ZmMsg.tagAppts;
};

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
};

/**
 * Creates the mini-calendar widget that sits below the overview.
 * 
 * @param date		[Date]*		date to highlight (defaults to today)
 */
ZmCalViewController.prototype._createMiniCalendar =
function(date) {
	date = date ? date : new Date();

	this._miniCalendar = new DwtCalendar(this._container, null, DwtControl.ABSOLUTE_STYLE, this.firstDayOfWeek());
	this._miniCalendar.setDate(date);
	this._miniCalendar.setScrollStyle(Dwt.CLIP);
	this._miniCalendar.addSelectionListener(new AjxListener(this, this._miniCalSelectionListener));
	this._miniCalendar.addActionListener(new AjxListener(this, this._miniCalActionListener));
	this._miniCalendar.addDateRangeListener(new AjxListener(this, this._miniCalDateRangeListener));
	this._miniCalendar.setMouseOverDayCallback(new AjxCallback(this, this._miniCalMouseOverDayCallback));

	var list = [];
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		list.push("ZmMailMsg");
		list.push("ZmConv");
	}
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push("ZmContact");
	}
	this._miniCalDropTarget = new DwtDropTarget(list);
	this._miniCalDropTarget.addDropListener(new AjxListener(this, this._miniCalDropTargetListener));
	this._miniCalendar.setDropTarget(this._miniCalDropTarget);

	var workingWeek = [];
	var fdow = this.firstDayOfWeek();
	for (var i = 0; i < 7; i++) {
		var d = (i + fdow) % 7
		workingWeek[i] = (d > 0 && d < 6);
	}
	this._miniCalendar.setWorkingWeek(workingWeek);
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);

	// add mini-calendar to skin
	var components = {};
	components[ZmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
	appCtxt.getAppViewMgr().addComponents(components, true);
};

ZmCalViewController.prototype._miniCalDropTargetListener =
function(ev) {
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
					var email = data[i].getEmail();
					if (email && email != "")
						foundValid = true;
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
			if (!shiftKey && (data instanceof ZmContact)) {
				var email = data.getEmail();
				if (!email || email == "")
					ev.doIt = false;
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

/*
 * This method will create a new appointment from a conversation/mail message. In the case
 * of a conversation, the appointment will be populated by the first message in the
 * conversation (or matched msg in the case of a search). This method is asynchronous and
 * will return immediately if the mail message must load in the background.
 *
 * @param mailItem This may either be a ZmConv or a ZmMailMsg.
 * @param date The date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromMailItem =
function(mailItem, date) {
	var subject = mailItem.subject || "";
	if (mailItem instanceof ZmConv) {
		mailItem = mailItem.getFirstHotMsg();
	}
	mailItem.load(false, false, new AjxCallback(this, this._msgLoadedCallback, [mailItem, date, subject]));
};

ZmCalViewController.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var newAppt = this._newApptObject(date);
	newAppt.setFromMailMessage(mailItem, subject);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};

/*
 * This method will create a new appointment from a contact.
 *
 * @param contact ZmContact
 * @param date The date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromContact =
function(contact, date) {
	var emails = [];
	var list = (contact instanceof ZmContact) ? [contact] : contact;
	for (var i = 0; i < list.length; i++) {
		// grab the first valid email address for this contact
		var e = list[i].getEmail();
		if (e && e != "")
			emails.push(e);
	}

	if (emails.length > 0) {
		var newAppt = this._newApptObject(date);
		newAppt.setAttendees(emails, ZmCalItem.PERSON);
		this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
	}
};

/*
 * This method will create a new appointment from an email address.
 *
 * @param emailAddr	email address
 * @param date The date/time for the appointment
 */
ZmCalViewController.prototype.newApptFromEmailAddr =
function(emailAddr, date) {
	if (!emailAddr || emailAddr == "")
		return;
	var newAppt = this._newApptObject(date);
	newAppt.setAttendees(emailAddr, ZmCalItem.PERSON);
	this.newAppointment(newAppt, ZmCalItem.MODE_NEW);
};


ZmCalViewController.prototype.getMiniCalendar =
function(delay) {
	if (!this._miniCalendar) {
		this._createMiniCalendar(null, delay);
	}
	return this._miniCalendar;
};

ZmCalViewController.prototype._calViewButtonListener =
function(ev) {
	var id = ev.item.getData(ZmOperation.KEY_ID);
	if (id) {
		this.show(ZmCalViewController.OP_TO_VIEW[id]);
	}
};

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
	this.setDate(new Date(), 0, true);
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

	var loadCallback = new AjxCallback(this, this._handleLoadNewApptAction, [d]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewApptAction =
function(d) {
	appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	this.newAppointmentHelper(d);
};

ZmCalViewController.prototype._searchMailAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) {
	    delete this._minicalMenu.__detail;
	    appCtxt.getSearchController().dateSearch(d);
    }
};

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) delete this._minicalMenu.__detail;
	else d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();

	var loadCallback = new AjxCallback(this, this._handleLoadNewAllDayApptAction, [d]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalViewController.prototype._handleLoadNewAllDayApptAction =
function(d) {
	appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	this.newAllDayAppointmentHelper(d);
};

ZmCalViewController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	this._viewVisible = true;
	if (this._viewMgr.needsRefresh()) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
	}
};

ZmCalViewController.prototype._postHideCallback =
function() {
	this._viewVisible = false;
};

ZmCalViewController.prototype._paginate =
function(viewId, forward) {
	var view = this._listView[viewId];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);
};

// attempts to process a nav toolbar up/down button click
ZmCalViewController.prototype._paginateDouble =
function(forward) {
	var view = 	this._viewMgr.getCurrentView();
	var field = view.getRollField(true);
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);
};

ZmCalViewController.prototype.setDate =
function(date, duration, roll) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	// set mini-cal first so it will cache appts we might need
	if (this._miniCalendar.getDate() == null || this._miniCalendar.getDate().getTime() != date.getTime())
		this._miniCalendar.setDate(date, true, roll);
	if (this._viewMgr != null) {
		this._viewMgr.setDate(date, duration, roll);
		var viewId = this._viewMgr.getCurrentViewName();
		if (viewId == ZmController.CAL_APPT_VIEW) {
			this._viewMgr.getCurrentView().close();
		}
		var title = this._viewMgr.getCurrentView().getCalTitle();
		Dwt.setTitle([ZmMsg.zimbraTitle, ": ", title].join(""));
		if (!roll &&
			this._currentView == ZmController.CAL_WORK_WEEK_VIEW &&
			(date.getDay() == 0 || date.getDay() ==  6))
		{
			this.show(ZmController.CAL_WEEK_VIEW);
		}
		if (ZmController.CAL_MONTH_VIEW == this._currentView) {
			title = this._viewMgr.getCurrentView().getShortCalTitle();
		}
		this._navToolBar[ZmController.CAL_VIEW].setText(title);
	}
};

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
};

ZmCalViewController.prototype._miniCalActionListener =
function(ev) {
	var mm = this._getMiniCalActionMenu();
	mm.__detail = ev.detail;
	mm.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._getMiniCalActionMenu =
function() {
	if (this._minicalMenu == null) {

		this.postInitListeners();

		var list = [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT, ZmOperation.SEP, ZmOperation.SEARCH_MAIL];
		//Zimlet hack
		var zimletOps = ZmZimlet.actionMenus ? ZmZimlet.actionMenus["ZmCalViewController"] : null;
		if (zimletOps && zimletOps.length) {
			for (var i = 0; i < zimletOps.length; i++) {
				var op = zimletOps[i];
				ZmOperation.defineOperation(null, op);
				list.push(op.id);
			}
		}
		var params = {parent:this._shell, menuItems:list};
		this._minicalMenu = new ZmActionMenu(params);
		list = this._minicalMenu.opList;
		var cnt = list.length;
		for(var ix=0; ix < cnt; ix++) {
			if(this._listeners[list[ix]]) {
				this._minicalMenu.addSelectionListener(list[ix], this._listeners[list[ix]]);
			}
		}
	}
	return this._minicalMenu;
};

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		var loadCallback = new AjxCallback(this, this._handleLoadMiniCalSelection, [ev]);
		AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
	}
};

ZmCalViewController.prototype._handleLoadMiniCalSelection =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
	if (!this._viewVisible) {
		this.show();
	}
};

ZmCalViewController.prototype._newApptObject =
function(startDate, duration, folderId) {
	var newAppt = new ZmAppt();
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.resetRepeatYearlyMonthsList(startDate.getMonth()+1);
	newAppt.resetRepeatCustomDayOfWeek();

	if (folderId)
		newAppt.setFolderId(folderId);
	return newAppt;
};

ZmCalViewController.prototype._timeSelectionListener =
function(ev) {
	var view = this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[ZmController.CAL_DAY_VIEW], 0);
	}
	this.setDate(ev.detail, 0, ev.force);

	// popup the edit dialog
	if (ev._isDblClick){
		//var p = new DwtPoint(ev.docX, ev.docY);
		this._apptFromView = view;
		var appt = this._newApptObject(ev.detail);
		appt.setAllDayEvent(ev.isAllDay);
		if (ev.folderId) appt.setFolderId(ev.folderId);
		this._showQuickAddDialog(appt, ev.shiftKey);
	}
};

ZmCalViewController.prototype._printListener =
function(ev) {
	appCtxt.getPrintView().render(this._viewMgr);
};

ZmCalViewController.prototype._deleteListener =
function(ev) {
	var op;
	if (ev.item instanceof DwtMenuItem) {
		op = ev.item.parent.getData(ZmOperation.KEY_ID);
	}
	this._doDelete(this._listView[this._currentView].getSelection(), null, null, op);
};

/**
 * Override the ZmListController method.
 */
ZmCalViewController.prototype._doDelete =
function(items, hardDelete, attrs, op) {
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
};

ZmCalViewController.prototype._promptDeleteAppt =
function(appt, mode) {
	var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);

	var confirmDialog = appCtxt.getConfirmationDialog();
	if (appt.isOrganizer() && appt.hasOtherAttendees()) {
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		confirmDialog.popup(ZmMsg.confirmCancelAppt, cancelNoReplyCallback);
	}
};

ZmCalViewController.prototype._deleteAppointment =
function(appt) {
	if (!appt) return;
	if (appt.isRecurring() && !appt.isException) {
		this._showTypeDialog(appt, ZmCalItem.MODE_DELETE);
	} else {
		this._promptDeleteAppt(appt, ZmCalItem.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDeleteReply =
function(appt, mode) {
	var action = ZmOperation.REPLY_CANCEL;
	var respCallback = new AjxCallback(this, this._continueDeleteReplyRespondAction, [appt, action, mode]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._continueDeleteReplyRespondAction =
function(appt, action, mode) {
	var msgController = this._getMsgController();
	var msg = appt.message;
	msg._appt = appt;
	msg._mode = mode;
	msgController.setMsg(msg);
	var instanceDate = mode == ZmCalItem.MODE_DELETE_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._editInviteReply(action, 0, instanceDate);
};

ZmCalViewController.prototype._continueDelete =
function(appt, mode) {
	try {
		var respCallback = new AjxCallback(this, this._handleResponseContinueDelete);
		appt.cancel(mode, null, respCallback, this._errorCallback);
	} catch (ex) {
		var params = [appt, mode];
		this._handleException(ex, this._continueDelete, params, false);
	}
};

ZmCalViewController.prototype._handleResponseContinueDelete =
function() {
 	if (this._viewMgr.getCurrentViewName() == ZmController.CAL_APPT_VIEW) {
 		this._viewMgr.getCurrentView().close();
 	}
};

ZmCalViewController.prototype._showTypeDialog =
function(appt, mode) {
	if (this._typeDialog == null) {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);		
		this._typeDialog = new ZmCalItemTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener));
		this._typeDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._typeCancelListener));
	}
	this._typeDialog.initialize(appt, mode);
	this._typeDialog.popup();
};

ZmCalViewController.prototype._showApptReadOnlyView =
function(appt) {
	var viewId = ZmController.CAL_APPT_VIEW;
	var apptView = this._viewMgr.getView(viewId);
	if (!apptView) {
		this._setup(viewId);
		apptView = this._viewMgr.getView(viewId);
	}
	apptView.set(appt);
	this.show(viewId);
	this._resetToolbarOperations();
};

ZmCalViewController.prototype._showQuickAddDialog =
function(appt, shiftKey) {
	// find out if we really should display the quick add dialog
	var useQuickAdd = appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD);
	if ((useQuickAdd && !shiftKey) || (!useQuickAdd && shiftKey)) {
		if (this._quickAddDialog == null) {
			AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
			this._quickAddDialog = new ZmApptQuickAddDialog(this._shell);
			this._quickAddDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._quickAddOkListener));
			this._quickAddDialog.addSelectionListener(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, new AjxListener(this, this._quickAddMoreListener));
		}
		this._quickAddDialog.initialize(appt);
		this._quickAddDialog.popup();
	} else {
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype.newAppointmentHelper =
function(startDate, optionalDuration, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, optionalDuration, folderId)
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAllDayAppointmentHelper =
function(startDate, endDate, folderId, shiftKey) {
	var appt = this._newApptObject(startDate, null, folderId);
	if (endDate)
		appt.setEndDate(endDate);
	appt.setAllDayEvent(true);
	appt.freeBusy = "F";
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAppointment =
function(newAppt, mode, isDirty, startDate) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	var sd = startDate || (this._viewVisible ? this._viewMgr.getDate() : new Date());
	/*
	// Undoing part of 15686.  Should default to "now" for "New" action.
	var sd = this._viewVisible
	         ? this._viewMgr.getDate()
	         : (startDate || new Date());
	*/
	var appt = newAppt || this._newApptObject(sd, AjxDateUtil.MSEC_PER_HALF_HOUR);
	this._app.getApptComposeController().show(appt, mode, isDirty);
};

ZmCalViewController.prototype.editAppointment =
function(appt, mode) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	if (mode != ZmCalItem.MODE_NEW) {
        var clone = ZmAppt.quickClone(appt);
        clone.getDetails(mode, new AjxCallback(this, this._showApptComposeView, [clone, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
};

// XXX: this method is temporary until bug 6082 is fixed!
ZmCalViewController.prototype.checkForRefresh =
function(appt) {
	if (appt && appt.isShared()) {
		this._refreshAction(false);
	}
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	try {
		// if we have an appointment, go get all the details.
		if (!appt.__creating) {
			var calendar = appt.getFolder();
			var isSynced = Boolean(calendar.url);
			if (appt.isReadOnly() || isSynced) {
				var mode = appt.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		        var clone = ZmAppt.quickClone(appt);
				clone.getDetails(mode, new AjxCallback(this, this._showApptReadOnlyView, [clone]));
			} else {
				if (appt.isRecurring()) {
					// prompt user to edit instance vs. series if recurring but not exception
					if (appt.isException) {
						this.editAppointment(appt, ZmCalItem.MODE_EDIT_SINGLE_INSTANCE);
					} else {
						this._showTypeDialog(appt, ZmCalItem.MODE_EDIT);
					}
				} else {
					// if simple appointment, no prompting necessary
					this.editAppointment(appt, ZmCalItem.MODE_EDIT);
				}
			}
		} else {
			this.newAppointment(appt);
		}
	} catch (ex) {
		this._handleException(ex, this._showAppointmentDetails, [appt], false);
	}
};

ZmCalViewController.prototype._typeOkListener =
function(ev) {
    this._performApptAction(this._typeDialog.calItem, this._typeDialog.mode, this._typeDialog.isInstance());
};

ZmCalViewController.prototype._performApptAction =
function(appt, mode, isInstance) {
	if (mode == ZmCalItem.MODE_DELETE) {
		var delMode = isInstance ? ZmCalItem.MODE_DELETE_INSTANCE : ZmCalItem.MODE_DELETE_SERIES;
		this._continueDelete(appt, delMode);
	}
    else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// {appt:appt, startDate: startDate, endDate: endDate, callback: callback, errorCallback: errorCallback };
		var viewMode =  isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		var state = this._updateApptDateState;
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate,
								[state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback, state.errorCallback]);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	}
    else {
		var editMode = isInstance ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
		this.editAppointment(appt, editMode);
	}
};

ZmCalViewController.prototype._typeCancelListener =
function(ev) {
	if (this._typeDialog.mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// we cancel the drag/sash, refresh view
		this._refreshAction(true);
	}
};

ZmCalViewController.prototype._quickAddOkListener =
function(ev) {
	try {
		if (this._quickAddDialog.isValid()) {
			this._quickAddDialog.popdown();
			var appt = this._quickAddDialog.getAppt();
			if (appt) {
				var callback = new AjxCallback(this, this._refreshActionCallback, [appt]);
				appt.save(null, callback);
			}
		}
	} catch(ex) {
		if (typeof ex == "string") {
			var errorDialog = new DwtMessageDialog(this._shell);
			var msg = ZmMsg.errorSaving + (ex ? (":<p>" + ex) : ".");
			errorDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
			errorDialog.popup();
		}
	}
};

// XXX: remove once bug 6082 is fixed!
ZmCalViewController.prototype._refreshActionCallback =
function(appt) {
    appCtxt.getShell().setBusy(false);
	if (appt.isShared())
		this._refreshAction(false);
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

/*
* appt - appt to change
* startDate - new date or null to leave alone
* endDate - new or null to leave alone
* changeSeries - if recurring, change the whole series
*
* TODO: change this to work with _handleException, and take callback so view can
*       restore appt location/size on failure
*/
ZmCalViewController.prototype.dndUpdateApptDate =
function(appt, startDateOffset, endDateOffset, callback, errorCallback, ev) {
/*
	var viewMode = !appt.isRecurring()
		? ZmCalItem.MODE_EDIT
		: (changeSeries ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT_SINGLE_INSTANCE);
	var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDate, endDate, callback]);
	appt.getDetails(viewMode, respCallback, errorCallback);
	*/
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
};

ZmCalViewController.prototype._handleResponseUpdateApptDate =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	// skip prompt if no attendees
	if (!appt.hasOtherAttendees()) {
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
	try {
		// NOTE: If the appt was already populated (perhaps by
		//       dragging it once, canceling the change, and then
		//       dragging it again), then the result will be null.
		if (result) {
			result.getResponse();
		}
		appt.setViewMode(viewMode);
		if (startDateOffset) {
			appt.setStartDate(new Date(appt.getStartTime() + startDateOffset));
			appt.resetRepeatWeeklyDays();
		}
		if (endDateOffset) appt.setEndDate(new Date(appt.getEndTime() + endDateOffset));
		var respCallback = callback != null
            ? new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [callback])
            : new AjxCallback(this, this._refreshActionCallback, [appt]);
        var respErrCallback = new AjxCallback(this, this._handleResponseUpdateApptDateSave2, [errorCallback]);
        appCtxt.getShell().setBusy(true);
        appt.save(null, respCallback, respErrCallback);
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
};

ZmCalViewController.prototype._handleResponseUpdateApptDateSave2 =
function(callback) {
    appCtxt.getShell().setBusy(false);
    callback.run();
};

ZmCalViewController.prototype._handleResponseUpdateApptDateIgnore =
function(appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback, result) {
	this._refreshAction(true);
	if (callback) callback.run(result);
};

ZmCalViewController.prototype.getDayToolTipText =
function(date, noheader) {
	try {
		var start = new Date(date.getTime());
		start.setHours(0, 0, 0, 0);
		var startTime = start.getTime();
		var end = start.getTime() + AjxDateUtil.MSEC_PER_DAY;
		var result = this.getApptSummaries({start:startTime, end:end, fanoutAllDay:true});
		return ZmApptViewHelper.getDayToolTipText(start, result, this, noheader);
	} catch (ex) {
		DBG.println(ex);
		return "<b>" + ZmMsg.errorGettingAppts + "</b>";
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

ZmCalViewController.prototype._miniCalMouseOverDayCallback =
function(control, day) {
	control.setToolTipContent(this.getDayToolTipText(day));
};

ZmCalViewController.prototype._getViewType =
function() {
	return ZmController.CAL_VIEW;
};

ZmCalViewController.prototype.setCurrentView =
function(view) {
	// do nothing
};

ZmCalViewController.prototype._resetNavToolBarButtons =
function(view) {
	this._navToolBar[ZmController.CAL_VIEW].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
};

ZmCalViewController.prototype._resetOperations =
function(parent, num) {
	parent.enableAll(true);
	var currViewName = this._viewMgr.getCurrentViewName();
	if (currViewName == ZmController.CAL_APPT_VIEW)
	{
		// disable DELETE since CAL_APPT_VIEW is a read-only view
		parent.enable([ZmOperation.DELETE, ZmOperation.CAL_REFRESH, ZmOperation.TODAY], false);
	}
	else
	{
		this._navToolBar[ZmController.CAL_VIEW].setVisible(true);
		var currView = this._viewMgr.getCurrentView();
		var appt = currView ? currView.getSelection()[0] : null;
		var calendar = appt && appt.getFolder();
		var isReadOnly = calendar ? calendar.isReadOnly() : false;
		var isSynced = Boolean(calendar && calendar.url);
		var isShared = calendar ? calendar.isRemote() : false;
		var disabled = isSynced || isReadOnly || (num == 0);
		var isPrivate = appt && appt.isPrivate() && calendar.isRemote();
		var isParent = appCtxt.getActiveAccount().isMain;
		parent.enable(ZmOperation.DELETE, !disabled);
		parent.enable(ZmOperation.TAG_MENU, (isParent && !isShared && !isSynced && num > 0));
		parent.enable(ZmOperation.VIEW_APPOINTMENT, !isPrivate);
	}
	// disable button for current view
	var op = ZmCalViewController.VIEW_TO_OP[currViewName];
	if (op) {
		parent.enable(op, false);
	}
};

ZmCalViewController.prototype._listSelectionListener =
function(ev) {
	ZmListController.prototype._listSelectionListener.call(this, ev);
	if (ev.detail == DwtListView.ITEM_SELECTED) {
		this._viewMgr.getCurrentView()._apptSelected();
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var appt = ev.item;
		if (appt.isPrivate() && appt.getFolder().isRemote()) {
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.setMessage(ZmMsg.apptIsPrivate, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
		} else {
			// open a appointment view
			this._apptIndexShowing = this._list.indexOf(appt);
			this._apptFromView = this._viewMgr.getCurrentView();
			this._showAppointmentDetails(ev.item);
		}
	}
};

ZmCalViewController.prototype._handleMenuViewAction =
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu.__appt;
	delete actionMenu.__appt;

	var calendar = appt.getFolder();
	var isSynced = Boolean(calendar.url);
	if (appt.isReadOnly() || isSynced) {
		// always get details on appt as if we're editing series (since its read only)
		var callback = new AjxCallback(this, this._showApptReadOnlyView, [appt]);
		appt.getDetails(ZmCalItem.MODE_EDIT_SERIES, callback, this._errorCallback);
	} else {
		var mode = ZmCalItem.MODE_EDIT;
		var menuItem = ev.item;
		var menu = menuItem.parent;
		var id = menu.getData(ZmOperation.KEY_ID);
		switch(id) {
			case ZmOperation.VIEW_APPT_INSTANCE:	mode = ZmCalItem.MODE_EDIT_SINGLE_INSTANCE; break;
			case ZmOperation.VIEW_APPT_SERIES:		mode = ZmCalItem.MODE_EDIT_SERIES; break;
		}
		this.editAppointment(appt, mode);
	}
};

ZmCalViewController.prototype._handleApptRespondAction =
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var type = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptRespondAction, [appt, type, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptRespondAction =
function(appt, type, op) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);
	// poke the msgController
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt.uniqStartTime) : null;
	msgController._sendInviteReply(type, appt.compNum || 0, instanceDate, appt.getRemoteFolderOwner());
};

ZmCalViewController.prototype._handleApptEditRespondAction =
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var op = ev.item.parent.parent.parent.getData(ZmOperation.KEY_ID);
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptEditRespondAction, [appt, id, op]);
	appt.getDetails(null, respCallback, this._errorCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptEditRespondAction =
function(appt, id, op) {
	var msgController = this._getMsgController();
	msgController.setMsg(appt.message);

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

/**
 * action menu for right-clicking on the view background
 */
ZmCalViewController.prototype._initializeViewActionMenu =
function() {
	if (this._viewActionMenu) return;

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
		}
	}
};

ZmCalViewController.prototype._initCalViewMenu =
function(menu) {
	menu.addSelectionListener(ZmOperation.DAY_VIEW, this._listeners[ZmOperation.DAY_VIEW]);
	menu.addSelectionListener(ZmOperation.WORK_WEEK_VIEW, this._listeners[ZmOperation.WORK_WEEK_VIEW]);
	menu.addSelectionListener(ZmOperation.WEEK_VIEW, this._listeners[ZmOperation.WEEK_VIEW]);
	menu.addSelectionListener(ZmOperation.MONTH_VIEW, this._listeners[ZmOperation.MONTH_VIEW]);
	menu.addSelectionListener(ZmOperation.SCHEDULE_VIEW, this._listeners[ZmOperation.SCHEDULE_VIEW]);
};

/**
 * Overrides ZmListController.prototype._getViewActionMenuOps
 */
ZmCalViewController.prototype._getViewActionMenuOps =
function () {
	return [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT,
			ZmOperation.SEP,
			ZmOperation.TODAY, ZmOperation.CAL_VIEW_MENU];
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 */
ZmCalViewController.prototype._initializeActionMenu =
function() {
	var menuItems = this._getActionMenuOps();
	if (menuItems && menuItems.length > 0) {
		var params = {parent:this._shell, menuItems:menuItems};
		var actionMenu = this._actionMenu = new ZmActionMenu(params);
		menuItems = actionMenu.opList;
		for (var i = 0; i < menuItems.length; i++) {
			var menuItem = menuItems[i];
			if (menuItem == ZmOperation.INVITE_REPLY_MENU) {
				var menu = actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
			} else if (menuItem == ZmOperation.CAL_VIEW_MENU) {
				var menu = actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
				this._initCalViewMenu(menu);
			}
			if (this._listeners[menuItem]) {
				actionMenu.addSelectionListener(menuItem, this._listeners[menuItem]);
			}
		}
		actionMenu.addPopdownListener(this._popdownListener);

		var menuItems = this._getRecurringActionMenuOps();
		if (menuItems && menuItems.length > 0) {
			var params = {parent:this._shell, menuItems:menuItems};
			this._recurringActionMenu = new ZmActionMenu(params);
			menuItems = this._recurringActionMenu.opList;
			for (var i = 0; i < menuItems.length; i++) {
				var item = this._recurringActionMenu.getMenuItem(menuItems[i]);
				item.setMenu(actionMenu);
				// NOTE: Target object for listener is menu item
				var menuItemListener = new AjxListener(item, this._recurringMenuPopup);
				item.addListener(DwtEvent.ONMOUSEOVER, menuItemListener);
			}
			this._recurringActionMenu.addPopdownListener(this._popdownListener);
		}

		if (appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			this._setupTagMenu(actionMenu);
		}
	}
};

/** The <code>this</code> in this method is the menu item. */
ZmCalViewController.prototype._recurringMenuPopup =
function(ev) {
    if (!this.getEnabled()) return;
	var menu = this.getMenu();
	var opId = this.getData(ZmOperation.KEY_ID);
	menu.setData(ZmOperation.KEY_ID, opId);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 */
ZmCalViewController.prototype._getActionMenuOps =
function() {
	return [
		ZmOperation.VIEW_APPOINTMENT,
		ZmOperation.SEP,
		ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_DECLINE, ZmOperation.REPLY_TENTATIVE, ZmOperation.INVITE_REPLY_MENU,
		ZmOperation.SEP,
		ZmOperation.DELETE, ZmOperation.TAG_MENU
	];
};

ZmCalViewController.prototype._getRecurringActionMenuOps =
function() {
	return [ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions =
function(appt, actionMenu) {
	var isOrganizer = appt.isOrganizer();
	var calendar = this.getCheckedCalendar(appt.getLocalFolderId());
	var share = calendar && calendar.link ? calendar.shares[0] : null;
	var workflow = share ? share.isWorkflow() : true;
	var isPrivate = appt.isPrivate() && calendar.isRemote();
	var enabled = !isOrganizer && workflow && !isPrivate;

	// reply action menu
	actionMenu.enable(ZmOperation.REPLY_ACCEPT, enabled && appt.ptst != ZmCalItem.PSTATUS_ACCEPT);
	actionMenu.enable(ZmOperation.REPLY_DECLINE, enabled && appt.ptst != ZmCalItem.PSTATUS_DECLINED);
	actionMenu.enable(ZmOperation.REPLY_TENTATIVE, enabled && appt.ptst != ZmCalItem.PSTATUS_TENTATIVE);
	actionMenu.enable(ZmOperation.INVITE_REPLY_MENU, enabled);

	// edit reply menu
	if (enabled) {
		var mi = actionMenu.getMenuItem(ZmOperation.INVITE_REPLY_MENU);
		if (mi) {
			var editReply = mi.getMenu();
			if (editReply) {
				editReply.enable(ZmOperation.EDIT_REPLY_ACCEPT, appt.ptst != ZmCalItem.PSTATUS_ACCEPT);
				editReply.enable(ZmOperation.EDIT_REPLY_DECLINE, appt.ptst != ZmCalItem.PSTATUS_DECLINED);
				editReply.enable(ZmOperation.EDIT_REPLY_TENTATIVE, appt.ptst != ZmCalItem.PSTATUS_TENTATIVE);
			}
		}
	}

	var del = actionMenu.getMenuItem(ZmOperation.DELETE);
	del.setText((isOrganizer && appt.hasOtherAttendees()) ? ZmMsg.cancel : ZmMsg.del);
	var isSynced = Boolean(calendar.url);
	del.setEnabled(!calendar.isReadOnly() && !isSynced);

	// recurring action menu options
	this._recurringActionMenu.enable(ZmOperation.VIEW_APPT_SERIES, !appt.exception);
};

ZmCalViewController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	var appt = ev.item;
	var actionMenu = this.getActionMenu();
	this._enableActionMenuReplyOptions(appt, actionMenu);
	var menu = appt.isRecurring() ? this._recurringActionMenu : actionMenu;
    var op = menu == actionMenu && appt.exception ? ZmOperation.VIEW_APPT_INSTANCE : null;
    actionMenu.__appt = appt;
	menu.setData(ZmOperation.KEY_ID, op);
	menu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._viewActionListener =
function(ev) {
	this._viewActionMenu.__view = ev.item;
	this._viewActionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentView];
	var div = Dwt.getAttr(ev.uiEvent.target, "_itemIndex", true);
	var item = div ? view.getItemFromElement(div) : null

	// only tags can be dropped on us *if* we are not readonly
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (item && item.type == ZmItem.APPT) {
			var calendar = item.getFolder();
			var isReadOnly = calendar ? calendar.isReadOnly() : false;
			var isSynced = Boolean(calendar && calendar.url);
			if (isSynced || isReadOnly) {
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
* @param	start 			[long]			start time in MS
* @param	end				[long]			end time in MS
* @param	fanoutAllDay	[Boolean]*
* @param	folderIds		[Array]*		list of calendar folder Id's (null means use checked calendars in overview)
* @param	callback		[AjxCallback]*	callback triggered once search results are returned
* @param	noBusyOverlay	[Boolean]*		dont show veil during search
*/
ZmCalViewController.prototype.getApptSummaries =
function(params) {
	if (!params.folderIds) {
		params.folderIds = this.getCheckedCalendarFolderIds();
	}
	params.query = this._userQuery;

	return this._apptCache.getApptSummaries(params);
};

ZmCalViewController.prototype.handleUserSearch =
function(params, callback) {
	AjxDispatcher.require(["CalendarCore", "Calendar"]);
	this.show(null, null, true);

	this._apptCache.clearCache();
	this._viewMgr.setNeedsRefresh();
	appCtxt.getSearchController().setEnabled(false);
	this._userQuery = params.query;

	// set start/end date boundaries
	var view = this.getCurrentView();
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

	params.fanoutAllDay = view ? view._fanoutAllDay() : false;
	params.callback = new AjxCallback(this, this._searchResponseCallback, callback);

	this.getApptSummaries(params);
};

ZmCalViewController.prototype._searchResponseCallback =
function(callback, list, userQuery) {
	appCtxt.getSearchController().setEnabled(true);

	this.show(null, null, true);	// always make sure a calendar view is being shown
	this._userQuery = userQuery;	// cache the user-entered search query

	this._maintGetApptCallback(ZmCalViewController.MAINT_VIEW, this.getCurrentView(), list, true);

	if (callback) {
		callback.run();
	}
};

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(create) {
	if (!this._clearCache) {
		this._clearCache = true;
	}
};

ZmCalViewController.prototype.notifyDelete =
function(ids) {
	if (this._clearCache) return;
	this._clearCache = this._apptCache.containsAnyId(ids);
	this.handleEditConflict(ids);	
};

ZmCalViewController.prototype.handleEditConflict =
function(ids) {
	//handling a case where appt is edited and related calendar is deleted
	if(appCtxt.getAppViewMgr().getCurrentViewId() == ZmController.APPOINTMENT_VIEW) {
		var view = appCtxt.getAppViewMgr().getCurrentView();
		var appt = view.getAppt();
		var calendar = appt && appt.getFolder();
		var idStr = ids+",";
		if(idStr.indexOf(calendar.id+",")>=0){
			var apptCtrller = this._app.getApptComposeController();
			apptCtrller._closeView();
		}	
	}	
};

ZmCalViewController.prototype.notifyModify =
function(modifies) {
	if (this._clearCache) return;
	// if any of the ids are in the cache then...
	for (var name in modifies) {
		var list = modifies[name];
		this._clearCache = this._clearCache || this._apptCache.containsAnyItem(list);
	}
}

// this gets called afer all the above notify* methods get called
ZmCalViewController.prototype.notifyComplete =
function() {
	DBG.println(AjxDebug.DBG2, "ZmCalViewController: notifyComplete: " + this._clearCache);
	if (this._clearCache) {
		var act = new AjxTimedAction(this, this._refreshAction);
		AjxTimedAction.scheduleAction(act, 0);
		this._clearCache = false;
	}
};

ZmCalViewController.prototype.setNeedsRefresh =
function(refresh) {
	if (this._viewMgr != null) {
		this._viewMgr.setNeedsRefresh(refresh);
	}
};

// this gets called when we get a refresh block from the server
ZmCalViewController.prototype.refreshHandler =
function() {
	var act = new AjxTimedAction(this, this._refreshAction);
	AjxTimedAction.scheduleAction(act, 0);
};

ZmCalViewController.prototype._refreshAction =
function(dontClearCache) {
	// reset cache
	if (!dontClearCache) {
		this._apptCache.clearCache();
	}

	if (this._viewMgr != null) {
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
	} else if (this._miniCalendar != null) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
	}
	this._scheduleMaintenance(ZmCalViewController.MAINT_REMINDER);
};

ZmCalViewController.prototype._maintErrorHandler =
function(params) {
	// TODO: resched work?
};

ZmCalViewController.prototype._maintGetApptCallback =
function(work, view, list, skipMiniCalUpdate) {
	// TODO: turn off shell busy

	if (list instanceof ZmCsfeException) {
		this._handleError(list, this._maintErrorHandler, null);
		return;
	}

	if (work & ZmCalViewController.MAINT_MINICAL) {
		var highlight = [];
		for (var i=0; i < list.size(); i++) {
			var sd = list.get(i).startDate;
			highlight[sd.getFullYear()+"/"+sd.getMonth()+"/"+sd.getDate()] = sd;
		}
		this._miniCalendar.setHilite(highlight, true, true);

		if (work & ZmCalViewController.MAINT_VIEW) {
			// now schedule view for maint
			this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
		}
	} else if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = list;
		view.set(list, skipMiniCalUpdate);
	}
	if (work & ZmCalViewController.MAINT_REMINDER) {
		this._app.getReminderController().refresh();
	}
};

ZmCalViewController.prototype._scheduleMaintenance =
function(work) {
	// schedule timed action
	if (this._pendingWork == ZmCalViewController.MAINT_NONE) {
		AjxTimedAction.scheduleAction(this._maintTimedAction, 0);
	}
	this._pendingWork |= work;
};

ZmCalViewController.prototype._maintenanceAction =
function() {
	var work = this._pendingWork;
	this._pendingWork = ZmCalViewController.MAINT_NONE;

	// do minical first, since it might load in a whole month worth of appts
	// the main view can use
	if (work & ZmCalViewController.MAINT_MINICAL)
	{
		if (appCtxt.getCurrentViewId() != ZmController.CAL_VIEW) {
			this.fetchMiniCalendarAppts();
		} else {
			var view = this._viewMgr.getCurrentView();
			if (view.getTimeRange) {
				var rt = view.getTimeRange();
				var cb = new AjxCallback(this, this._maintGetApptCallback, [work, null]);
				this.getApptSummaries({start:rt.start, end:rt.end, fanoutAllDay:view._fanoutAllDay(), callback:cb});
			}
		}
	}
	else if (work & ZmCalViewController.MAINT_VIEW)
	{
		var view = this.getCurrentView();
		if (view && view.needsRefresh()) {
			var rt = view.getTimeRange();
			var cb = new AjxCallback(this, this._maintGetApptCallback, [work, view]);
			this.getApptSummaries({start:rt.start, end:rt.end, fanoutAllDay:view._fanoutAllDay(), callback:cb});
			view.setNeedsRefresh(false);
		}
	}
	else if (work & ZmCalViewController.MAINT_REMINDER)
	{
		this._app.getReminderController().refresh();
	}
};

ZmCalViewController.prototype.getKeyMapName =
function() {
	return "ZmCalViewController";
};

ZmCalViewController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmCalViewController.handleKeyAction");

	switch (actionCode) {

		case ZmKeyMap.CAL_DAY_VIEW:
		case ZmKeyMap.CAL_WEEK_VIEW:
		case ZmKeyMap.CAL_WORK_WEEK_VIEW:
		case ZmKeyMap.CAL_MONTH_VIEW:
		case ZmKeyMap.CAL_SCHEDULE_VIEW:
			this.show(ZmCalViewController.ACTION_CODE_TO_VIEW[actionCode]);
			break;

		case ZmKeyMap.TODAY:
			this._todayButtonListener();
			break;

		case ZmKeyMap.REFRESH:
			this._refreshButtonListener();
			break;

		case ZmKeyMap.QUICK_ADD:
			if (appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD)) {
				var date = this._viewMgr ? this._viewMgr.getDate() : new Date();
				this.newAppointmentHelper(date, ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
			}
			break;

		case ZmKeyMap.EDIT:
			var appt = this._listView[this._currentView].getSelection()[0];
			if (appt) {
				var ev = new DwtSelectionEvent();
				ev.detail = DwtListView.ITEM_DBL_CLICKED;
				ev.item = appt;
				this._listSelectionListener(ev);
			}
			break;

		case ZmKeyMap.CANCEL:
			if (this._currentView == ZmController.CAL_APPT_VIEW) {
				this._listView[this._currentView].close();
			}
			break;

		default:
			return ZmListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};

ZmCalViewController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[ZmController.CAL_VIEW];
};

/**
 * Returns a reference to the singleton message controller, used to send mail (in our case,
 * invites and their replies). If mail is disabled, we create our own ZmMsgController so that
 * we don't load the mail package.
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

ZmCalViewController.prototype.fetchMiniCalendarAppts = 
function() {	
	var dr = this._miniCalendar.getDateRange();
	var params = {
		start: dr.start.getTime(),
		end: dr.end.getTime(),
		fanoutAllDay: true,
		callback: new AjxCallback(this, this._maintGetApptCallback, [ZmCalViewController.MAINT_MINICAL, null]),
		noBusyOverlay:true
	};
	this.getApptSummaries(params);
};
