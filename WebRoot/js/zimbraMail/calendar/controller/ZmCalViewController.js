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

/*
	The strategy for the calendar is to leverage the list view stuff by creating a single
	view (i.e. ZmCalViewMgr) and have it manage the schedule views (e.g. week, month) and
	a single calendar view (the calendar widget to the right). Each of the schedule views
	will be a list view that are managed by the ZmCalViewMgr. 
	
	To do this we have to trick the ZmListController. Specifically we have only one toolbar and
	directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
	directly replace:
	
	ZmListControl.prototype.initializeToolBar
*/

function ZmCalViewController(appCtxt, container, calApp) {
	ZmListController.call(this, appCtxt, container, calApp);

	var apptListener = new AjxListener(this, this._handleApptRespondAction);
	var apptEditListener = new AjxListener(this, this._handleApptEditRespondAction);
	var calViewListener = new AjxListener(this, this._calViewButtonListener);

	this._listeners[ZmOperation.REPLY_ACCEPT] = apptListener;
	this._listeners[ZmOperation.REPLY_DECLINE] = apptListener;
	this._listeners[ZmOperation.REPLY_TENTATIVE] = apptListener;
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE] = apptEditListener;
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE] = apptEditListener;
	this._listeners[ZmOperation.VIEW_APPOINTMENT] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.TODAY_GOTO] = new AjxListener(this, this._todayButtonListener);	
	this._listeners[ZmOperation.DAY_VIEW] = calViewListener;
	this._listeners[ZmOperation.WEEK_VIEW] = calViewListener;
	this._listeners[ZmOperation.WORK_WEEK_VIEW] = calViewListener;
	this._listeners[ZmOperation.MONTH_VIEW] = calViewListener;
	this._listeners[ZmOperation.SCHEDULE_VIEW] = calViewListener;
	this._listeners[ZmOperation.NEW_APPT] = new AjxListener(this, this._newApptAction);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT] = new AjxListener(this, this._newAllDayApptAction);	
	this._listeners[ZmOperation.SEARCH_MAIL] = new AjxListener(this, this._searchMailAction);	

	this._maintTimedAction = new AjxTimedAction(this, this._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;	
	this._apptCache = new ZmApptCache(this, appCtxt);
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

ZmCalViewController.ICON = {};
ZmCalViewController.ICON[ZmController.CAL_DAY_VIEW]				= "DayView";
ZmCalViewController.ICON[ZmController.CAL_WORK_WEEK_VIEW]		= "WorkWeekView";
ZmCalViewController.ICON[ZmController.CAL_WEEK_VIEW]			= "WeekView";
ZmCalViewController.ICON[ZmController.CAL_MONTH_VIEW]			= "MonthView";
ZmCalViewController.ICON[ZmController.CAL_SCHEDULE_VIEW]		= "GroupSchedule";

ZmCalViewController.MSG_KEY = {};
ZmCalViewController.MSG_KEY[ZmController.CAL_DAY_VIEW]			= "viewDay";
ZmCalViewController.MSG_KEY[ZmController.CAL_WORK_WEEK_VIEW]	= "viewWorkWeek";
ZmCalViewController.MSG_KEY[ZmController.CAL_WEEK_VIEW]			= "viewWeek";
ZmCalViewController.MSG_KEY[ZmController.CAL_MONTH_VIEW]		= "viewMonth";
ZmCalViewController.MSG_KEY[ZmController.CAL_SCHEDULE_VIEW]		= "viewSchedule";

ZmCalViewController.VIEWS = [ZmController.CAL_DAY_VIEW, ZmController.CAL_WORK_WEEK_VIEW, ZmController.CAL_WEEK_VIEW,
							ZmController.CAL_MONTH_VIEW, ZmController.CAL_SCHEDULE_VIEW];

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

// get op based on view
ZmCalViewController.VIEW_TO_OP = {};
for (var op in ZmCalViewController.OP_TO_VIEW) {
	ZmCalViewController.VIEW_TO_OP[ZmCalViewController.OP_TO_VIEW[op]] = op;
}

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
	var view = this._appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
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
	return this._appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
};

ZmCalViewController.prototype.show = 
function(viewId) {
	if (!viewId || viewId == ZmController.CAL_VIEW)
		viewId = this._currentView ? this._currentView : this._defaultView();

	if (!this._calTreeController) {
		this._calTreeController = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController) {
			this._calTreeController.addSelectionListener(ZmZimbraMail._OVERVIEW_ID, new AjxListener(this, this._calTreeSelectionListener));
			var calTree = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.CALENDAR);
			if (calTree)
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));			
			// add change listener
		}
		DBG.timePt("getting tree controller", true);
	}

	if (!this._viewMgr) {
		//this._initializeViewActionMenu();

		var newDate = this._miniCalendar ? this._miniCalendar.getDate() : new Date();
		
		if (!this._miniCalendar) {
			this._createMiniCalendar(newDate);
			//DBG.timePt("_createMiniCalendar");
		}

		this._viewMgr = new ZmCalViewMgr(this._container, this);
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
	this._appCtxt.getCurrentAppToolbar().setSubView(ZmController.CAL_VIEW, viewId);
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
			break;;		
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
		this._navToolBar[ZmController.CAL_VIEW].setText(cv.getCalTitle());
		this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
		DBG.timePt("scheduling maintenance");
	}
};

ZmCalViewController.prototype.getCheckedCalendars =
function() {
	if (this._checkedCalendars == null) {
		if (this._calTreeController == null) return [];		
		this._updateCheckedCalendars();
	}
	return this._checkedCalendars;
};

ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function(localOnly) {
	if (this._checkedCalendarFolderIds == null) {
		this.getCheckedCalendars();
		if (this._checkedCalendarFolderIds == null) return [ZmOrganizer.ID_CALENDAR];
	}
	return localOnly ? this._checkedLocalCalendarFolderIds : this._checkedCalendarFolderIds;
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

ZmCalViewController.prototype._updateCheckedCalendars =
function() {
	if (!this._calTreeController)
		return [];
	var cc = this._calTreeController.getCheckedCalendars(ZmZimbraMail._OVERVIEW_ID);
	this._checkedCalendars = cc;
	this._checkedCalendarFolderIds = [];
	this._checkedLocalCalendarFolderIds = [];
	for (var i=0; i < cc.length; i++) {
		var cal = cc[i];
		this._checkedCalendarFolderIds.push(cal.id);
		if (cal.isRemote && !cal.isRemote()) {
			this._checkedLocalCalendarFolderIds.push(cal.id);
		}
	}
	return cc;
};

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) return;
	this._updateCheckedCalendars();
	this._refreshAction(true);
	
	// save checkbox state to server
	if (ev.item) {
		var calendar = ev.item.getData(Dwt.KEY_OBJECT);
		calendar.setChecked(ev.item.getChecked());
	} else if (ev.items && ev.items.length) {
		var batchCmd = new ZmBatchCommand(this._appCtxt);
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
	var ct = this._appCtxt.getTree(ZmOrganizer.CALENDAR);	
	return ct ? ct.getById(folderId) : null;
};

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) return ZmOrganizer.DEFAULT_COLOR;
	var cal = this.getCalendar(folderId);
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR;
};

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	this._refreshAction(false);
};

ZmCalViewController.prototype._getToolBarOps =
function() {
	return [
		ZmOperation.NEW_MENU,
		ZmOperation.CAL_REFRESH,
		ZmOperation.SEP,
		ZmOperation.DELETE, ZmOperation.PRINT,
		ZmOperation.SEP,
		ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW,
		ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW,
		ZmOperation.SCHEDULE_VIEW,
		ZmOperation.SEP,
		ZmOperation.TODAY
	];
};

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewId) {
	if (this._toolbar[ZmController.CAL_VIEW]) return;
	//DBG.println("ZmCalViewController.prototype._initializeToolBar: " + viewId);
	var calViewButtonListener = new AjxListener(this, this._calViewButtonListener);
	var todayButtonListener = new AjxListener(this, this._todayButtonListener);	
	var refreshButtonListener = new AjxListener(this, this._refreshButtonListener);		
	
	ZmListController.prototype._initializeToolBar.call(this, ZmController.CAL_DAY_VIEW);
	this._setupViewMenu(ZmController.CAL_VIEW);
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.DAY_VIEW, calViewButtonListener);
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.WEEK_VIEW, calViewButtonListener);
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.WORK_WEEK_VIEW, calViewButtonListener);
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.MONTH_VIEW, calViewButtonListener);	
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.SCHEDULE_VIEW, calViewButtonListener);		
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.TODAY, todayButtonListener);
	this._toolbar[ZmController.CAL_DAY_VIEW].addSelectionListener(ZmOperation.CAL_REFRESH, refreshButtonListener);	

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
	var tb = new ZmNavToolBar(this._toolbar[ZmController.CAL_DAY_VIEW], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb, ZmController.CAL_VIEW);

	this._setNewButtonProps(viewId, ZmMsg.createNewAppt, "NewAppointment", "NewAppointmentDis", ZmOperation.NEW_APPT);
};

// Create menu for View button and add listeners.
ZmCalViewController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		menu = new ZmPopupMenu(appToolbar.getViewButton());
		this._view_menu_listener = new AjxListener(this, this._viewMenuListener);
		for (var i = 0; i < ZmCalViewController.VIEWS.length; i++) {
			var id = ZmCalViewController.VIEWS[i];
			var mi = menu.createMenuItem(id, ZmCalViewController.ICON[id], ZmMsg[ZmCalViewController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(ZmOperation.KEY_ID, ZmCalViewController.OPS[i]);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(this._view_menu_listener);
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
};

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore since this will always be ZmController.CAL_VIEW as we are fooling
	// ZmListController (see our show method)
};

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
};

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

	this._miniCalDropTarget = new DwtDropTarget(ZmConv, ZmMailMsg, ZmContact);
	this._miniCalDropTarget.addDropListener(new AjxListener(this, this._miniCalDropTargetListener));
	this._miniCalendar.setDropTarget(this._miniCalDropTarget);

	var workingWeek = [];
	var fdow = this.firstDayOfWeek();
	for (var i=0; i < 7; i++) {
		var d = (i+fdow)%7
		workingWeek[i] = (d > 0 && d < 6);
	}
	this._miniCalendar.setWorkingWeek(workingWeek);
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);

	// add mini-calendar to skin
	var components = {};
	components[ZmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
	this._appCtxt.getAppViewMgr().addComponents(components, true);
};

ZmCalViewController.prototype._miniCalDropTargetListener =
function(ev) {
	var data = ((ev.srcData.data instanceof Array) && ev.srcData.data.length == 1)
		? ev.srcData.data[0] : ev.srcData.data;

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		// Hack: in some instances ZmMailMsg is reported as being an Array of
		//       length 1 (as well as a ZmMailMsg) under FF1.5
		if (data instanceof Array && data.length > 1) {
			var foundValid = false;
			for (var i = 0; i < data.length; i++) {
				if (data[i] instanceof ZmContact) {
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
			if (data instanceof ZmContact) {
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
				this.newApptFromMailItem(data, dropDate);
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
	var subject = mailItem.subject || '';
	if (mailItem instanceof ZmConv)
		mailItem = mailItem.getFirstMsg();
	mailItem.load(false, false, new AjxCallback(this, this._msgLoadedCallback, [mailItem, date, subject]));
};

ZmCalViewController.prototype._msgLoadedCallback =
function(mailItem, date, subject) {
	var newAppt = this._newApptObject(date);
	newAppt.setFromMailMessage(mailItem, subject);
	this.newAppointment(newAppt, ZmAppt.MODE_NEW);
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
		newAppt.setAttendees(emails, ZmAppt.PERSON);
		this.newAppointment(newAppt, ZmAppt.MODE_NEW);
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
	newAppt.setAttendees(emailAddr, ZmAppt.PERSON);
	this.newAppointment(newAppt, ZmAppt.MODE_NEW);
};


ZmCalViewController.prototype.getMiniCalendar =
function() {
	if (!this._miniCalendar)
		this._createMiniCalendar();
	return this._miniCalendar;
};

ZmCalViewController.prototype._viewMenuListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED)
		this._calViewButtonListener(ev);	
};

ZmCalViewController.prototype._calViewButtonListener =
function(ev) {
	var id = ev.item.getData(ZmOperation.KEY_ID);
	this.show(ZmCalViewController.OP_TO_VIEW[id]);
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

	this.newAppointmentHelper(d);
};

ZmCalViewController.prototype._searchMailAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) {
	    delete this._minicalMenu.__detail;
	    this._appCtxt.getSearchController().dateSearch(d);
    }
};

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._minicalMenu ? this._minicalMenu.__detail : null;
	if (d != null) delete this._minicalMenu.__detail;
	else d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();
	this.newAllDayAppointmentHelper(d);
};

ZmCalViewController.prototype._postShowCallback =
function() {
	ZmController.prototype._postShowCallback.call(this);
	this._viewVisible = true;
	if (this._viewMgr.getNeedsRefresh()) {
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
		this._navToolBar[ZmController.CAL_VIEW].setText(title);
		Dwt.setTitle(title);
		if (!roll && this._currentView == ZmController.CAL_WORK_WEEK_VIEW && (date.getDay() == 0 || date.getDay() ==  6)) {
			this.show(ZmController.CAL_WEEK_VIEW);
		}
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

//Zimlet hack
ZmCalViewController.prototype._getMiniCalActionMenu =
function() {
	if (this._minicalMenu == null) {
		
		this.postInitListeners();

		var list = [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT, ZmOperation.SEP, ZmOperation.SEARCH_MAIL];
		var extraList = [];
		if(ZmZimlet.actionMenus && ZmZimlet.actionMenus["ZmCalViewController"] && ZmZimlet.actionMenus["ZmCalViewController"] instanceof Array) {
			extraList = ZmZimlet.actionMenus["ZmCalViewController"];
		}
		this._minicalMenu = new ZmActionMenu(this._appCtxt.getShell(), list,extraList);
		var cnt = list.length;
		for(var ix=0; ix < cnt; ix++) {
			if(this._listeners[list[ix]]) {
				this._minicalMenu.addSelectionListener(list[ix], this._listeners[list[ix]]);
			}		
		}
		cnt = extraList.length;
		for(var ix=0; ix < cnt; ix++) {
			if(this._listeners[extraList[ix].id]) {
				this._minicalMenu.addSelectionListener(extraList[ix].id, this._listeners[extraList[ix].id]);
			}		
		}		
	}
	return this._minicalMenu;
};

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		this.setDate(ev.detail, 0, ev.item.getForceRollOver());
		if (!this._viewVisible) this.show();
	}
};

ZmCalViewController.prototype._newApptObject = 
function(startDate, duration, folderId) {
	var newAppt = new ZmAppt(this._appCtxt);
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.repeatYearlyMonthsList = startDate.getMonth() + 1;
	newAppt.repeatCustomDayOfWeek = ZmAppt.SERVER_WEEK_DAYS[startDate.getDay()];	
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
	var viewMgr = this._viewMgr;
	if (!this._printView) {
		this._printView = new ZmPrintView(this._appCtxt);
	}
	this._printView.render(viewMgr);
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
		var mode = (op == ZmOperation.VIEW_APPT_INSTANCE) ? ZmAppt.MODE_DELETE_INSTANCE : ZmAppt.MODE_DELETE_SERIES;
		this._promptDeleteAppt(appt, mode);
	} else {
		this._deleteAppointment(appt);
	}
};

ZmCalViewController.prototype._promptDeleteAppt = 
function(appt, mode) {
	var cancelReplyCallback = new AjxCallback(this, this._continueDeleteReply, [appt, mode]);
	var cancelNoReplyCallback = new AjxCallback(this, this._continueDelete, [appt, mode]);
	
	var confirmDialog = this._appCtxt.getConfirmationDialog();
	if (appt.isOrganizer() && appt.hasOtherAttendees()) {
		confirmDialog.popup(ZmMsg.confirmCancelApptReply, cancelReplyCallback, cancelNoReplyCallback);
	} else {
		confirmDialog.popup(ZmMsg.confirmCancelAppt, cancelNoReplyCallback);
	}
};

ZmCalViewController.prototype._deleteAppointment = 
function(appt) {
	if (!appt) return;
	if (appt.isRecurring() && !appt.isException()) {
		this._showTypeDialog(appt, ZmAppt.MODE_DELETE);
	} else {
		this._promptDeleteAppt(appt, ZmAppt.MODE_DELETE);
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
	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	var msg = appt.getMessage();
	msg._appt = appt;
	msg._mode = mode;
	msgController.setMsg(msg);
	var instanceDate = mode == ZmAppt.MODE_DELETE_INSTANCE ? new Date(appt._uniqStartTime) : null;
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
		this._typeDialog = new ZmApptTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener));
		this._typeDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._typeCancelListener));
	}
	this._typeDialog.initialize(mode, appt);
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
	var useQuickAdd = this._appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD);
	if ((useQuickAdd && !shiftKey) || (!useQuickAdd && shiftKey)) {
		if (this._quickAddDialog == null) {
			this._quickAddDialog = new ZmApptQuickAddDialog(this._shell, this._appCtxt);
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
	appt.setFreeBusy("F");
	this._showQuickAddDialog(appt, shiftKey);
};

ZmCalViewController.prototype.newAppointment = 
function(newAppt, mode, isDirty, startDate) {
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
	if (mode != ZmAppt.MODE_NEW) {
        var clone = ZmAppt.quickClone(appt);
        clone.getDetails(mode, new AjxCallback(this, this._showApptComposeView, [clone, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
};

// XXX: this method is temporary until bug 6082 is fixed!
ZmCalViewController.prototype.checkForRefresh =
function(appt) {
	if (appt.isShared()) {
		this._refreshAction(false);
	}
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	try {
		// if we have an appointment, go get all the details.
		if (!appt.__creating) {
			var tree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
			var calendar = tree.getById(appt.folderId);
			var isSynced = Boolean(calendar.url);
			if (appt.isReadOnly() || isSynced) {
				var mode = appt.isException() ? ZmAppt.MODE_EDIT_SINGLE_INSTANCE : ZmAppt.MODE_EDIT_SERIES;
				appt.getDetails(mode, new AjxCallback(this, this._showApptReadOnlyView, [appt]));
			} else {
				if (appt.isRecurring()) {
					// prompt user to edit instance vs. series if recurring but not exception
					if (appt.isException()) {
						this.editAppointment(appt, ZmAppt.MODE_EDIT_SINGLE_INSTANCE);
					} else {
						this._showTypeDialog(appt, ZmAppt.MODE_EDIT);
					}
				} else {
					// if simple appointment, no prompting necessary
					this.editAppointment(appt, ZmAppt.MODE_EDIT);
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
    var appt = this._typeDialog.getAppt();
    var mode = this._typeDialog.getApptMode();
    var isInstance = this._typeDialog.isInstance();
    this._performApptAction(appt, mode, isInstance);
};

ZmCalViewController.prototype._performApptAction =
function(appt, mode, isInstance) {
	if (mode == ZmAppt.MODE_DELETE) {
		var delMode = isInstance ? ZmAppt.MODE_DELETE_INSTANCE : ZmAppt.MODE_DELETE_SERIES;
		this._continueDelete(appt, delMode);
	}
    else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		// {appt:appt, startDate: startDate, endDate: endDate, callback: callback, errorCallback: errorCallback };		
		var viewMode =  isInstance ? ZmAppt.MODE_EDIT_SINGLE_INSTANCE : ZmAppt.MODE_EDIT_SERIES;
		var state = this._updateApptDateState; 
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, 
								[state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback, state.errorCallback]);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	}
    else {
		var editMode = isInstance ? ZmAppt.MODE_EDIT_SINGLE_INSTANCE : ZmAppt.MODE_EDIT_SERIES;
		this.editAppointment(appt, editMode);
	}
};

ZmCalViewController.prototype._typeCancelListener = 
function(ev) {
	if (this._typeDialog.getApptMode() == ZmAppt.MODE_DRAG_OR_SASH) {
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
    this._appCtxt.getShell().setBusy(false);
	if (appt.isShared())
		this._refreshAction(false);
};

ZmCalViewController.prototype._quickAddMoreListener = 
function(ev) {
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		this._quickAddDialog.popdown();
		this.newAppointment(appt, ZmAppt.MODE_NEW_FROM_QUICKADD, this._quickAddDialog.isDirty());
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
		? ZmAppt.MODE_EDIT 
		: (changeSeries ? ZmAppt.MODE_EDIT_SERIES : ZmAppt.MODE_EDIT_SINGLE_INSTANCE);
	var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDate, endDate, callback]);
	appt.getDetails(viewMode, respCallback, errorCallback);
	*/	

	if (!appt.isRecurring()) {
		var viewMode = ZmAppt.MODE_EDIT;
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
		appt.getDetails(viewMode, respCallback, errorCallback);
	}
    else {
		if (ev.shiftKey || ev.altKey) {
			var viewMode = ev.altKey ? ZmAppt.MODE_EDIT_SERIES : ZmAppt.MODE_EDIT_SINGLE_INSTANCE;
			var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback, errorCallback]);
			appt.getDetails(viewMode, respCallback, errorCallback);
		}
        else {
			this._updateApptDateState = {appt:appt, startDateOffset: startDateOffset, endDateOffset: endDateOffset, callback: callback, errorCallback: errorCallback };
            if (appt.isException()) {
                this._performApptAction(appt, ZmAppt.MODE_DRAG_OR_SASH, true);
            }
            else {
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

	var dialog = this._appCtxt.getConfirmationDialog();
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
        this._appCtxt.getShell().setBusy(true);
        appt.save(null, respCallback, respErrCallback);
	} catch (ex) {
        this._appCtxt.getShell().setBusy(false);
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
    this._appCtxt.getShell().setBusy(false);
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
		var result = this.getApptSummaries(start.getTime(), start.getTime()+AjxDateUtil.MSEC_PER_DAY, true, this.getCheckedCalendarFolderIds());
		return ZmCalMonthView.getDayToolTipText(start,result, this, noheader);
	} catch (ex) {
		DBG.println(ex);
		return "<b>"+ZmMsg.errorGettingAppts+"</b>";
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
	ZmListController.prototype._resetOperations.call(this, parent, num);
	parent.enableAll(true);
	var currViewName = this._viewMgr.getCurrentViewName();
	if (currViewName == ZmController.CAL_APPT_VIEW) {
		// disable DELETE since CAL_APPT_VIEW is a read-only view
		parent.enable([ZmOperation.DELETE, ZmOperation.CAL_REFRESH, ZmOperation.TODAY], false);
	}
	else {
		this._navToolBar[ZmController.CAL_VIEW].setVisible(true);
		var currView = this._viewMgr.getCurrentView();
		var appt = currView ? currView.getSelection()[0] : null;
		var isReadOnly = appt ? appt.isReadOnly() : false;
		var tree = appt && this._appCtxt.getTree(ZmOrganizer.CALENDAR);
		var calendar = tree && tree.getById(appt.folderId);
		var isSynced = Boolean(calendar && calendar.url);
		var disabled = isSynced || isReadOnly;
		parent.enable(ZmOperation.DELETE, !disabled);
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
		// open a appointment view
		this._apptIndexShowing = this._list.indexOf(ev.item);
		this._apptFromView = this._viewMgr.getCurrentView();
		this._showAppointmentDetails(ev.item);		
	}
};

ZmCalViewController.prototype._handleMenuViewAction = 
function(ev) {
	var actionMenu = this.getActionMenu();
	var appt = actionMenu.__appt;
	delete actionMenu.__appt;

	var tree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
	var calendar = tree.getById(appt.folderId);
	var isSynced = Boolean(calendar.url);
	if (appt.isReadOnly() || isSynced) {
		// always get details on appt as if we're editing series (since its read only)
		var callback = new AjxCallback(this, this._showApptReadOnlyView, [appt]);
		appt.getDetails(ZmAppt.MODE_EDIT_SERIES, callback, this._errorCallback);
	} else {
		var mode = ZmAppt.MODE_EDIT;
		var menuItem = ev.item;
		var menu = menuItem.parent;
		var id = menu.getData(ZmOperation.KEY_ID);
		switch(id) {
			case ZmOperation.VIEW_APPT_INSTANCE:	mode = ZmAppt.MODE_EDIT_SINGLE_INSTANCE; break;
			case ZmOperation.VIEW_APPT_SERIES:		mode = ZmAppt.MODE_EDIT_SERIES; break;
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
	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());
	// poke the msgController
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt._uniqStartTime) : null;
	msgController._sendInviteReply(type, 0, instanceDate, appt.getRemoteCalendarOwner());
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
	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());

	// poke the msgController
	switch (id) {
		case ZmOperation.EDIT_REPLY_ACCEPT: 	id = ZmOperation.REPLY_ACCEPT; break;
		case ZmOperation.EDIT_REPLY_DECLINE: 	id = ZmOperation.REPLY_DECLINE; break;
		case ZmOperation.EDIT_REPLY_TENTATIVE: 	id = ZmOperation.REPLY_TENTATIVE; break;
	}
	var instanceDate = op == ZmOperation.VIEW_APPT_INSTANCE ? new Date(appt._uniqStartTime) : null;
	msgController._editInviteReply(id, 0, instanceDate, appt.getRemoteCalendarOwner());
};

ZmCalViewController.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = this._appCtxt.getMsgDialog();
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
	this._viewActionMenu = new ZmActionMenu(this._shell, menuItems);
	for (var i = 0; i < menuItems.length; i++){
		if (menuItems[i] > 0) {
			if (menuItems[i] == ZmOperation.CAL_VIEW_MENU) {
				var menu = this._viewActionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
				this._initCalViewMenu(menu);
			}
			this._viewActionMenu.addSelectionListener(menuItems[i],this._listeners[menuItems[i]]);
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
 * Overrides ZmListController.prototype._getActionMenuOptions
 */
ZmCalViewController.prototype._getViewActionMenuOps =
function () {
	return [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT, ZmOperation.SEP, ZmOperation.TODAY_GOTO, ZmOperation.CAL_VIEW_MENU];
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 */
ZmCalViewController.prototype._initializeActionMenu = 
function() {
	var menuItems = this._getActionMenuOps();
	if (menuItems && menuItems.length > 0) {
		var actionMenu = this._actionMenu = new ZmActionMenu(this._shell, menuItems);
		for (var i = 0; i < menuItems.length; i++) {
			if (menuItems[i] > 0) {
				if (menuItems[i] == ZmOperation.INVITE_REPLY_MENU) {
					var menu = actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
					menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
					menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
					menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
				} else if (menuItems[i] == ZmOperation.CAL_VIEW_MENU) {
					var menu = actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();
					this._initCalViewMenu(menu);
				}
				actionMenu.addSelectionListener(menuItems[i],this._listeners[menuItems[i]]);
			}
		}
		actionMenu.addPopdownListener(this._popdownListener);

		var menuItems = this._getRecurringActionMenuOps();
		if (menuItems && menuItems.length > 0) {
			this._recurringActionMenu = new ZmActionMenu(this._shell, menuItems);
			for (var i = 0; i < menuItems.length; i++) {
				var item = this._recurringActionMenu.getMenuItem(menuItems[i]);
				item.setMenu(actionMenu);
				// NOTE: Target object for listener is menu item
				var menuItemListener = new AjxListener(item, this._recurringMenuPopup);
				item.addListener(DwtEvent.ONMOUSEOVER, menuItemListener);
			}
			this._recurringActionMenu.addPopdownListener(this._popdownListener);
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
		ZmOperation.DELETE
	];
};

ZmCalViewController.prototype._getRecurringActionMenuOps =
function() {
	return [ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions =
function(appt, actionMenu) {
	var isOrganizer = appt.isOrganizer();
	var calendar = this.getCheckedCalendar(appt.folderId);
	var share = calendar && calendar.link ? calendar.shares[0] : null;
	var workflow = share ? share.isWorkflow() : true;
	var pstatus = appt.getParticipationStatus();
	var enabled = !isOrganizer && workflow;

	// reply action menu
	actionMenu.enable(ZmOperation.REPLY_ACCEPT, enabled && pstatus != ZmAppt.PSTATUS_ACCEPT);
	actionMenu.enable(ZmOperation.REPLY_DECLINE, enabled && pstatus != ZmAppt.PSTATUS_DECLINED);
	actionMenu.enable(ZmOperation.REPLY_TENTATIVE, enabled && pstatus != ZmAppt.PSTATUS_TENTATIVE);
	actionMenu.enable(ZmOperation.INVITE_REPLY_MENU, enabled);

	// edit reply menu
	if (enabled) {
		var editReply = actionMenu.getMenuItem(ZmOperation.INVITE_REPLY_MENU).getMenu();
		editReply.enable(ZmOperation.EDIT_REPLY_ACCEPT, pstatus != ZmAppt.PSTATUS_ACCEPT);
		editReply.enable(ZmOperation.EDIT_REPLY_DECLINE, pstatus != ZmAppt.PSTATUS_DECLINED);
		editReply.enable(ZmOperation.EDIT_REPLY_TENTATIVE, pstatus != ZmAppt.PSTATUS_TENTATIVE);
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

ZmCalViewController.prototype.sendRequest = 
function(soapDoc) {
	try {
		return this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc});
	} catch (ex) {
		// do nothing
		return null;
	}
};

/**
* caller is responsible for exception handling. caller should also not modify appts in this list directly.
*/
ZmCalViewController.prototype.getApptSummaries =
function(start,end, fanoutAllDay, folderIds, callback) {
	return this._apptCache.getApptSummaries(start, end, fanoutAllDay, folderIds, callback);
};

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(appt) {
	if (!this._clearCache) {
		this._clearCache = true;
	}
};

ZmCalViewController.prototype.notifyDelete =
function(ids) {
	if (this._clearCache) return;
	this._clearCache = this._apptCache.containsAnyId(ids);
};

ZmCalViewController.prototype.notifyModify =
function(items) {
	if (this._clearCache) return;
	// if any of the ids are in the cache then...	
	this._clearCache = this._apptCache.containsAnyItem(items);
}

// this gets called afer all the above notify* methods get called
ZmCalViewController.prototype.notifyComplete =
function(ids) {
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
	if (!dontClearCache) this._apptCache.clearCache();

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
function(work, view, list) {
	// TODO: turn off shell busy
	
	if (list instanceof ZmCsfeException) {	
		this._handleError(list, this._maintErrorHandler, null);
		return;
	}

	if (work & ZmCalViewController.MAINT_MINICAL) {	
		var highlight = [];
		for (var i=0; i < list.size(); i++) {
			var sd = list.get(i).getStartDate();
			highlight[sd.getFullYear()+"/"+sd.getMonth()+"/"+sd.getDate()] = sd;
		}
		this._miniCalendar.setHilite(highlight, true, true);
		
		if (work & ZmCalViewController.MAINT_VIEW) {
			// now schedule view for maint
			this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
		}
	} else if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = list;
		view.set(list);
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
	if (work & ZmCalViewController.MAINT_MINICAL) {
		var calRange = this._miniCalendar.getDateRange();
		var cb = new AjxCallback(this, this._maintGetApptCallback, [ work, null]);
		// TODO: turn on shell busy
		this.getApptSummaries(calRange.start.getTime(), calRange.end.getTime(), true, this.getCheckedCalendarFolderIds(), cb);
		// return. callback will check and see if MAINT_VIEW is nededed as well.
		return;
	} else if (work & ZmCalViewController.MAINT_VIEW) {
		if (this._viewMgr == null) return;
		var view = this.getCurrentView();
		if (view && view.needsRefresh()) {
			var rt = view.getTimeRange();
			var cb = new AjxCallback(this, this._maintGetApptCallback, [work, view]);
			// TODO: turn on shell busy
			this.getApptSummaries(rt.start, rt.end, view._fanoutAllDay(), this.getCheckedCalendarFolderIds(), cb);
			view.setNeedsRefresh(false);
		}
	} else if (work & ZmCalViewController.MAINT_REMINDER) {
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
			if (this._appCtxt.get(ZmSetting.CAL_USE_QUICK_ADD)) {
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
