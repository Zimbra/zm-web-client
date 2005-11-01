/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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
	
	ZmListControl.prototype.initilaizeToolBar
*/

function ZmCalViewController(appCtxt, container, calApp) {
	ZmListController.call(this, appCtxt, container, calApp);

	this._listeners[ZmOperation.REPLY_ACCEPT] = new AjxListener(this, this._handleApptRespondAction);
	this._listeners[ZmOperation.REPLY_DECLINE] = new AjxListener(this, this._handleApptRespondAction);
	this._listeners[ZmOperation.REPLY_TENTATIVE] = new AjxListener(this, this._handleApptRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT] = new AjxListener(this, this._handleApptEditRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE] = new AjxListener(this, this._handleApptEditRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE] = new AjxListener(this, this._handleApptEditRespondAction);
	this._listeners[ZmOperation.VIEW_APPOINTMENT] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.VIEW_APPT_INSTANCE] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.VIEW_APPT_SERIES] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.TODAY_GOTO] = new AjxListener(this, this._todayButtonListener);	
	this._listeners[ZmOperation.DAY_VIEW] = new AjxListener(this, this._calViewButtonListener);
	this._listeners[ZmOperation.WEEK_VIEW] = new AjxListener(this, this._calViewButtonListener);
	this._listeners[ZmOperation.WORK_WEEK_VIEW] = new AjxListener(this, this._calViewButtonListener);
	this._listeners[ZmOperation.MONTH_VIEW] = new AjxListener(this, this._calViewButtonListener);
	this._listeners[ZmOperation.SCHEDULE_VIEW] = new AjxListener(this, this._calViewButtonListener);	
	this._listeners[ZmOperation.NEW_APPT] = new AjxListener(this, this._newApptAction);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT] = new AjxListener(this, this._newAllDayApptAction);	

	this._maintTimedAction = new AjxTimedAction(this, ZmCalViewController.prototype._maintenanceAction);
	this._pendingWork = ZmCalViewController.MAINT_NONE;	
	this._apptCache = new ZmApptCache(this, appCtxt);
	this._folderIdToCalendar = {};
}

ZmCalViewController.prototype = new ZmListController();
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController.ICON = new Object();
ZmCalViewController.ICON[ZmController.CAL_DAY_VIEW]				= "DayView";
ZmCalViewController.ICON[ZmController.CAL_WORK_WEEK_VIEW]		= "WorkWeekView";
ZmCalViewController.ICON[ZmController.CAL_WEEK_VIEW]			= "WeekView";
ZmCalViewController.ICON[ZmController.CAL_MONTH_VIEW]			= "MonthView";
ZmCalViewController.ICON[ZmController.CAL_SCHEDULE_VIEW]		= "GroupSchedule";

ZmCalViewController.MSG_KEY = new Object();
ZmCalViewController.MSG_KEY[ZmController.CAL_DAY_VIEW]			= "viewDay";
ZmCalViewController.MSG_KEY[ZmController.CAL_WORK_WEEK_VIEW]	= "viewWorkWeek";
ZmCalViewController.MSG_KEY[ZmController.CAL_WEEK_VIEW]			= "viewWeek";
ZmCalViewController.MSG_KEY[ZmController.CAL_MONTH_VIEW]		= "viewMonth";
ZmCalViewController.MSG_KEY[ZmController.CAL_SCHEDULE_VIEW]		= "viewSchedule";

ZmCalViewController.VIEWS = [ZmController.CAL_DAY_VIEW, ZmController.CAL_WORK_WEEK_VIEW, ZmController.CAL_WEEK_VIEW,
							ZmController.CAL_MONTH_VIEW, ZmController.CAL_SCHEDULE_VIEW];

ZmCalViewController.OPS = [ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW, 
							ZmOperation.MONTH_VIEW, ZmOperation.SCHEDULE_VIEW];

ZmCalViewController.DEFAULT_APPOINTMENT_DURATION = 3600000;

// maintenance needed on views and/or minical
ZmCalViewController.MAINT_NONE 		= 0x0; // no work to do
ZmCalViewController.MAINT_MINICAL 	= 0x1; // minical needs refresh
ZmCalViewController.MAINT_VIEW 		= 0x2; // view needs refresh

ZmCalViewController.prototype.toString =
function() {
	return "ZmCalViewController";
}

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
}

ZmCalViewController.prototype.firstDayOfWeek =
function() {
	return this._appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
}

ZmCalViewController.prototype.show = 
function(viewId) {
	if (!viewId || viewId == ZmController.CAL_VIEW)
		viewId = this._currentView ? this._currentView : this._defaultView();

	if (this._calTreeController == null) {
		this._calTreeController = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.CALENDAR);
		if (this._calTreeController != null) {
			this._calTreeController.addSelectionListener(ZmZimbraMail._OVERVIEW_ID,  new AjxListener(this, this._calTreeSelectionListener));
			var calTree = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.CALENDAR);
			if (calTree)
				calTree.addChangeListener(new AjxListener(this, this._calTreeChangeListener));			
			// add change listener
		}
	}

	if (this._viewMgr == null) {
		this._initializeViewActionMenu();
		var newDate = new Date();
		
		this._viewMgr = new ZmCalViewMgr(this._container, this);
		this._viewMgr.setDate(newDate);
		this._setup(viewId);
		this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
		this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
		this._viewMgr.addViewActionListener(new AjxListener(this, this._viewActionListener));

		if (!this._miniCalendar)
			this._createMiniCalendar(newDate);
	}

	if (!this._viewMgr.getView(viewId))
		this._setup(viewId);

	this._viewMgr.setView(viewId);

	var elements = new Object();
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[ZmController.CAL_VIEW];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._viewMgr;
	var ok = this._setView(ZmController.CAL_VIEW, elements, true);
	if (ok) {
		this._setViewMenu(ZmController.CAL_VIEW);
		if (this._currentView)
			this._view_menu_item[this._currentView].setChecked(false, true);
	}
	this._currentView = this._viewMgr.getCurrentViewName();
	this._view_menu_item[this._currentView].setChecked(true, true);
	this._listView[this._currentView] = this._viewMgr.getCurrentView();	
	
	switch(viewId) {
		case ZmController.CAL_DAY_VIEW: 
		case ZmController.CAL_SCHEDULE_VIEW: 		
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.day);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.day);
			break;
		case ZmController.CAL_WORK_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.workWeek);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.workWeek);			
			break;
		case ZmController.CAL_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.week);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.week);			
			break;;		
		case ZmController.CAL_MONTH_VIEW:
			// use day until month does something
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);		
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.month);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.month);
			break;
	}

	var cv = this._viewMgr.getCurrentView();
	this._navToolBar.setText(cv.getCalTitle());
	
	this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
}

ZmCalViewController.prototype.getCheckedCalendars =
function() {
	if (this._checkedCalendars == null) {
		if (this._calTreeController == null) return [];		
		this._checkedCalendars = this._updateCheckedCalendars();
	}
	return this._checkedCalendars;
}

ZmCalViewController.prototype.getCheckedCalendarFolderIds =
function() {
	if (this._checkedCalendarFolderIds == null)
		this.getCheckedCalendars();
	return this._checkedCalendarFolderIds;
}

ZmCalViewController.prototype._updateCheckedCalendars =
function() {
	var cc = this._calTreeController.getCheckedCalendars(ZmZimbraMail._OVERVIEW_ID);
	this._checkedCalendarFolderIds = [];
	for (var i=0; i < cc.length; i++) {
		var cal = cc[i];
		this._folderIdToCalendar[cal.id] = cal;
		this._checkedCalendarFolderIds.push(cal.id);
	}
	return cc;
}

ZmCalViewController.prototype._calTreeSelectionListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_CHECKED) return;
	var newCheckedCalendars = this._updateCheckedCalendars();
	// TODO: diff between new and old...
	this._checkedCalendars = newCheckedCalendars;
	this._refreshAction(true);
}

ZmCalViewController.prototype._calTreeChangeListener =
function(ev) {
	// TODO: check only for color/name changes?
	if (ev.event == ZmEvent.E_DELETE) {
		// TODO: diff between new and old...
		this._checkedCalendars = this._updateCheckedCalendars();
	}
	this._refreshAction(true);
}

ZmCalViewController.prototype.getCalendar =
function(folderId) {
	return this._folderIdToCalendar[folderId];
}

// todo: change to currently "selected" calendar
ZmCalViewController.prototype.getDefaultCalendarFolderId =
function() {
	return ZmFolder.ID_CALENDAR;
}

ZmCalViewController.prototype.getCalendarColor =
function(folderId) {
	if (!folderId) return ZmOrganizer.DEFAULT_COLOR;
	var cal = this._folderIdToCalendar[folderId];
	return cal ? cal.color : ZmOrganizer.DEFAULT_COLOR;
}

ZmCalViewController.prototype.isCalendarLink =
function(folderId) {
	//shortcut that also helps when we are invoked before _folderIdToCalendar is init'd
	if (folderId == ZmOrganizer.ID_CALENDAR) return false;
	var cal = this._folderIdToCalendar[folderId];
	return cal ? (cal.link ? true : false) : false;
}

ZmCalViewController.prototype._refreshButtonListener =
function(ev) {
	this._refreshAction(false);
}

ZmCalViewController.prototype._getToolBarOps =
function() {
	var list = new Array();
	list.push(ZmOperation.NEW_MENU);
	list.push(ZmOperation.DELETE);
	list.push(ZmOperation.PRINT);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DAY_VIEW);
	list.push(ZmOperation.WORK_WEEK_VIEW);
	list.push(ZmOperation.WEEK_VIEW);
	list.push(ZmOperation.MONTH_VIEW);
	list.push(ZmOperation.SCHEDULE_VIEW);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.TODAY);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.CAL_REFRESH);
	return list;
}

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
	
	// Set the other view toolbar entries to point to the Day view entry. I.e. this is a trick
	// to fool the ZmListController into thinking there are multiple toolbars
	this._toolbar[ZmController.CAL_SCHEDULE_VIEW] = this._toolbar[ZmController.CAL_WEEK_VIEW] = 
		this._toolbar[ZmController.CAL_WORK_WEEK_VIEW] = this._toolbar[ZmController.CAL_MONTH_VIEW] = this._toolbar[ZmController.CAL_DAY_VIEW];
	this._toolbar[ZmController.CAL_VIEW] = this._toolbar[ZmController.CAL_DAY_VIEW];

	// Setup the toolbar stuff
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.TODAY], true);	
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.CAL_REFRESH], true);		
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);	
	this._toolbar[ZmController.CAL_DAY_VIEW].enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);	

	this._toolbar[ZmController.CAL_DAY_VIEW].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[ZmController.CAL_DAY_VIEW], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);

	this._setNewButtonProps(viewId, ZmMsg.createNewAppt, "NewAppointment", "NewAppointmentDis", ZmOperation.NEW_APPT);

}

// Create menu for View button and add listeners.
ZmCalViewController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var menu = new ZmPopupMenu(appToolbar.getViewButton());
		this._view_menu_item = {};
		this._view_menu_listener = new AjxListener(this, this._viewMenuListener);
		for (var i = 0; i < ZmCalViewController.VIEWS.length; i++) {
			var id = ZmCalViewController.VIEWS[i];
			var mi = menu.createMenuItem(id, ZmCalViewController.ICON[id], ZmMsg[ZmCalViewController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(ZmOperation.KEY_ID, ZmCalViewController.OPS[i]);
			mi.addSelectionListener(this._view_menu_listener);
			this._view_menu_item[id] = mi;
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
}

ZmCalViewController.prototype._setViewContents =
function(viewId) {
	// Ignore viewId since this will always be ZmController.CAL_VIEW as we are fooling the
	// ZmListController (see our show method)
	var viewId = this._viewMgr.getCurrentViewName();
}

ZmCalViewController.prototype._createNewView =
function(viewId) {
	return this._viewMgr.createView(viewId);
}

ZmCalViewController.prototype._createMiniCalendar =
function(date) {
	date = date ? date : new Date();

	this._miniCalendar = new DwtCalendar(this._container, null, DwtControl.ABSOLUTE_STYLE, this.firstDayOfWeek());
	this._miniCalendar.setDate(date);
	this._miniCalendar.setScrollStyle(Dwt.CLIP);
	this._miniCalendar.addSelectionListener(new AjxListener(this, this._miniCalSelectionListener));
	this._miniCalendar.addDateRangeListener(new AjxListener(this, this._miniCalDateRangeListener));

	var workingWeek = [];
	var fdow = this.firstDayOfWeek();
	for (var i=0; i < 7; i++) {
		var d = (i+fdow)%7
		workingWeek[i] = (d > 0 && d < 6);
	}
	this._miniCalendar.setWorkingWeek(workingWeek);
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);

	// add mini-calendar to skin
	var components = new Object();
	components[ZmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
	this._appCtxt.getAppViewMgr().addComponents(components, true);
}

ZmCalViewController.prototype.getMiniCalendar =
function() {
	if (!this._miniCalendar)
		this._createMiniCalendar();
	return this._miniCalendar;
}

ZmCalViewController.prototype._viewMenuListener =
function(ev) {
	if (ev.detail == DwtMenuItem.CHECKED)
		this._calViewButtonListener(ev);	
}

ZmCalViewController.prototype._calViewButtonListener =
function(ev) {
	var id = ev.item.getData(ZmOperation.KEY_ID);
	switch(id) {
		case ZmOperation.DAY_VIEW:		this.show(ZmController.CAL_DAY_VIEW); break;
		case ZmOperation.WEEK_VIEW:		this.show(ZmController.CAL_WEEK_VIEW); break;
		case ZmOperation.WORK_WEEK_VIEW:this.show(ZmController.CAL_WORK_WEEK_VIEW);	break;		
		case ZmOperation.MONTH_VIEW: 	this.show(ZmController.CAL_MONTH_VIEW); break;
		case ZmOperation.SCHEDULE_VIEW: 	this.show(ZmController.CAL_SCHEDULE_VIEW); break;		
	}
}

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
	this.setDate(new Date(), 0, true);
}

ZmCalViewController.prototype._newApptAction =
function(ev) {
	var d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();
	this.newAppointment(this._newApptObject(d));
}

ZmCalViewController.prototype._newAllDayApptAction =
function(ev) {
	var d = this._viewMgr ? this._viewMgr.getDate() : null;
	if (d == null) d = new Date();
	this.newAllDayAppointmentHelper(d);
}

ZmCalViewController.prototype._postShowCallback =
function() {
	this._viewVisible = true;
	if (this._needFullRefresh) {
		this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);	
	}
}

ZmCalViewController.prototype._postHideCallback =
function() {
	this._viewVisible = false;
}

ZmCalViewController.prototype._paginate =
function(viewId, forward) {
	var view = this._listView[viewId];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);	
}

// attempts to process a nav toolbar up/down button click
ZmCalViewController.prototype._paginateDouble = 
function(forward) {
	var view = 	this._viewMgr.getCurrentView();
	var field = view.getRollField(true);
	var d = new Date(this._viewMgr.getDate());
	d = AjxDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);	
}

ZmCalViewController.prototype.setDate = 
function(date, duration, roll) {
	// set mini-cal first so it will cache appts we might need	
	if (this._miniCalendar.getDate() == null || this._miniCalendar.getDate().getTime() != date.getTime()) 
		this._miniCalendar.setDate(date, true, roll);
	this._viewMgr.setDate(date, duration, roll);
	var title = this._viewMgr.getCurrentView().getCalTitle();
	this._navToolBar.setText(title);
	Dwt.setTitle(title);
	if (!roll && this._currentView == ZmController.CAL_WORK_WEEK_VIEW && (date.getDay() == 0 || date.getDay() ==  6)) {
		this.show(ZmController.CAL_WEEK_VIEW);
	}
}

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
}

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
}

ZmCalViewController.prototype._newApptObject = 
function(startDate, duration, folderId) {
	var newAppt = new ZmAppt(this._appCtxt);
	newAppt.setStartDate(AjxDateUtil.roundTimeMins(startDate, 30));
	newAppt.setEndDate(newAppt.getStartTime() + (duration ? duration : ZmCalViewController.DEFAULT_APPOINTMENT_DURATION));
	newAppt.resetRepeatWeeklyDays();
	newAppt.resetRepeatMonthlyDayList();
	newAppt.repeatYearlyMonthsList = startDate.getMonth();
	newAppt.repeatCustomDayOfWeek = ZmAppt.SERVER_WEEK_DAYS[startDate.getDay()];	
	if (folderId)
		newAppt.setFolderId(folderId);
	return newAppt;
}

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
		this._showQuickAddDialog(appt);
	}
}

ZmCalViewController.prototype._printListener = 
function(ev) {
	var viewMgr = this._viewMgr;
	if (!this._printView) {
		this._printView = new ZmPrintView(this._appCtxt);
	}
	this._printView.render(viewMgr);
};

/** 
 * Override the ZmListController method.
 */
ZmCalViewController.prototype._doDelete =
function(items, hardDelete, attrs) {
	// since base view has multiple selection turned off, always select first item
	this._deleteAppointment(items[0]);
};

ZmCalViewController.prototype._deleteAppointment = 
function(appt) {
	if (appt == null) return;
	if (appt.isRecurring()) {
		this._showTypeDialog(ZmAppt.MODE_DELETE, appt);
	} else {
		this._continueDelete(appt, ZmAppt.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDelete = 
function(appt, mode) {
	try {
		appt.cancel(mode);
	} catch (ex) {
		var params = [appt, mode];
		this._handleException(ex, this._continueDelete, params, false);		
	}
};

ZmCalViewController.prototype._showTypeDialog = 
function(mode, appt) {
	if (this._typeDialog == null) {
		this._typeDialog = new ZmApptTypeDialog(this._shell);
		this._typeDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._typeOkListener));
		this._typeDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._typeCancelListener));
		this._typeDialog._disableFFhack();
	}
	this._typeDialog.initialize(mode, appt);
	this._typeDialog.popup();
};

ZmCalViewController.prototype._showReadOnlyDialog = 
function(args) {
	var appt = args[0];

	if (this._readOnlyDialog == null) {
		this._readOnlyDialog = new ZmApptReadOnlyDialog(this._shell, this._appCtxt);
		// TODO: enable this when we add mre functionality to read-only dialog (i.e. Accept/Decline buttons)
		//this._readOnlyDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._readOnlyOkListener));
		this._readOnlyDialog._disableFFhack();
	}
	this._readOnlyDialog.initialize(appt);
	this._readOnlyDialog.popup();
};

ZmCalViewController.prototype._showQuickAddDialog = 
function(appt) {
	if (this._quickAddDialog == null) {
		this._quickAddDialog = new ZmApptQuickAddDialog(this._shell, this._appCtxt);
		this._quickAddDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._quickAddOkListener));
		this._quickAddDialog.addSelectionListener(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, new AjxListener(this, this._quickAddMoreListener));
		this._quickAddDialog._disableFFhack();
	}
	this._quickAddDialog.initialize(appt);
	this._quickAddDialog.popup();
};

ZmCalViewController.prototype.newAppointmentHelper = 
function(startDate, optionalDuration, folderId) {
	var appt = this._newApptObject(startDate, optionalDuration, folderId)
	this._showQuickAddDialog(appt);
};

ZmCalViewController.prototype.newAllDayAppointmentHelper = 
function(startDate, endDate, folderId) {
	var appt = this._newApptObject(startDate, null, folderId);
	if (endDate)
		appt.setEndDate(endDate);
	appt.setAllDayEvent(true);
	this._showQuickAddDialog(appt);
};

ZmCalViewController.prototype.newAppointment = 
function(newAppt) {
	var appt = newAppt || this._newApptObject(new Date());
	this._app.getApptComposeController().show(appt);
};

ZmCalViewController.prototype.editAppointment = 
function(appt, mode) {
	if (mode != ZmAppt.MODE_NEW) {
		appt.getDetails(mode, new AjxCallback(this, this._showApptView, [appt, mode]));
	} else {
		this._app.getApptComposeController().show(appt, mode);
	}
};

ZmCalViewController.prototype._showAppointmentDetails =
function(appt) {
	try {
		// if we have an appointment, go get all the details.
		if (!appt.__creating) {
			if (appt.isReadOnly()) {
				appt.getDetails(ZmAppt.MODE_EDIT_SERIES, new AjxCallback(this, this._showReadOnlyDialog, [appt]));
			} else {
				if (appt.isRecurring()) {
					// prompt user to edit instance vs. series if recurring but not exception
					if (appt.isException()) {
						this.editAppointment(appt, ZmAppt.MODE_EDIT_SINGLE_INSTANCE);
					} else {
						this._showTypeDialog(ZmAppt.MODE_EDIT, appt);
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

	if (this._typeDialog.getApptMode() == ZmAppt.MODE_DELETE) {
		var mode = this._typeDialog.isInstance() ? ZmAppt.MODE_DELETE_INSTANCE : ZmAppt.MODE_DELETE_SERIES;
		this._continueDelete(appt, mode);
	} else if (this._typeDialog.getApptMode() == ZmAppt.MODE_DRAG_OR_SASH) {
		// {appt:appt, startDate: startDate, endDate: endDate, callback: callback, errorCallback: errorCallback };		
		var viewMode =  this._typeDialog.isInstance() ? ZmAppt.MODE_EDIT_SINGLE_INSTANCE : ZmAppt.MODE_EDIT_SERIES;
		var state = this._updateApptDateState; 
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, 
											[state.appt, viewMode, state.startDateOffset, state.endDateOffset, state.callback]);
		delete this._updateApptDateState;
		appt.getDetails(viewMode, respCallback, state.errorCallback);
	} else {
		var mode = this._typeDialog.isInstance() ? ZmAppt.MODE_EDIT_SINGLE_INSTANCE : ZmAppt.MODE_EDIT_SERIES;
		this.editAppointment(appt, mode);
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
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		appt.save();
	}
};

ZmCalViewController.prototype._quickAddMoreListener = 
function(ev) {
	var appt = this._quickAddDialog.getAppt();
	if (appt) {
		this._quickAddDialog.popdown();
		this.newAppointment(appt);
	}
};

ZmCalViewController.prototype._showApptView = 
function(args) {
	var appt = args[0];
	var mode = args[1];
	this._app.getApptComposeController().show(appt, mode);
};

/*
* appt - appt to change
* startDate - new date or null to leave alone
* endDate - new or null to leave alone
* changeSeries - if recurring, change the whole series
*
* TODO: change this to work with _handleException, and take callback so view can restore appt location/size on failure
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
		var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback]);
		appt.getDetails(viewMode, respCallback, errorCallback);
	} else {
		if (ev.shiftKey || ev.altKey) {
			var viewMode = ev.altKey ? ZmAppt.MODE_EDIT_SERIES : ZmAppt.MODE_EDIT_SINGLE_INSTANCE;
			var respCallback = new AjxCallback(this, this._handleResponseUpdateApptDate, [appt, viewMode, startDateOffset, endDateOffset, callback]);
			appt.getDetails(viewMode, respCallback, errorCallback);
		} else {
			this._updateApptDateState = {appt:appt, startDateOffset: startDateOffset, endDateOffset: endDateOffset, callback: callback, errorCallback: errorCallback };
			this._showTypeDialog(ZmAppt.MODE_DRAG_OR_SASH, appt);;
		}
	}

}

ZmCalViewController.prototype._handleResponseUpdateApptDate =
function(args) {
	var appt	= args[0];
	var viewMode	= args[1];
	var startDateOffset = args[2];
	var endDateOffset = args[3];
	var callback	= args[4];
	var result = args[5];
	
	try {
		result.getResponse();
		appt.setViewMode(viewMode);
		if (startDateOffset) appt.setStartDate(new Date(appt.getStartTime() + startDateOffset));
		if (endDateOffset) appt.setEndDate(new Date(appt.getEndTime() + endDateOffset));		
		appt.save();
	} catch (ex) {
		this.popupErrorDialog(AjxStringUtil.resolve(ZmMsg.mailSendFailure, ex.msg));
	}
	if (callback) callback.run(result);
}

ZmCalViewController.prototype.getDayToolTipText =
function(date) {
	try {
		var start = new Date(date.getTime());
		start.setHours(0, 0, 0, 0);
		var result = this.getApptSummaries(start.getTime(), start.getTime()+AjxDateUtil.MSEC_PER_DAY, true, ZmOrganizer.ID_CALENDAR	);
		return ZmCalMonthView.getDayToolTipText(start,result, this);
	} catch (ex) {
		DBG.println(ex);
		return "<b>"+ZmMsg.errorGettingAppts+"</b>";
	}
}

ZmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
}

ZmCalViewController.prototype._dateRangeListener =
function(ev) {
	ev.item.setNeedsRefresh(true);
	this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
}

ZmCalViewController.prototype._getViewType = 
function() {
	return ZmController.CAL_VIEW;
}

ZmCalViewController.prototype.setCurrentView = 
function(view) {
	// do nothing
}

ZmCalViewController.prototype._resetNavToolBarButtons = 
function(view) {
	this._navToolBar.enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);
}

ZmCalViewController.prototype._resetOperations = 
function(parent, num) {
	ZmListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		parent.enable([ZmOperation.PRINT,ZmOperation.TODAY, ZmOperation.CAL_REFRESH, ZmOperation.SCHEDULE_VIEW,
						ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.DAY_VIEW], true);
	}

 	var ops = this._getActionMenuOps();
 	var item;
 	for (var i = 0 ; i < ops.length ; ++i) {
 		item = this._actionMenu.getItem(i);
 		item.setEnabled(true);
 	}
}

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
}

ZmCalViewController.prototype._handleMenuViewAction = 
function(ev) {
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var appt = this._actionMenu.__appt;
	delete this._actionMenu.__appt;
	var mode;
	switch(id) {
		case ZmOperation.VIEW_APPOINTMENT: 	mode = ZmAppt.MODE_EDIT; break;
		case ZmOperation.VIEW_APPT_INSTANCE:mode = ZmAppt.MODE_EDIT_SINGLE_INSTANCE; break;
		case ZmOperation.VIEW_APPT_SERIES: 	mode = ZmAppt.MODE_EDIT_SERIES; break;
	}
	this.editAppointment(appt, mode);
};

ZmCalViewController.prototype._handleApptRespondAction = 
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptRespondAction, [appt, ev]);
	appt.getDetails(null, respCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptRespondAction =
function(args) {
	var appt	= args[0];
	var ev		= args[1];

	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());
	// poke the msgController
	msgController._sendInviteReply(ev.item.getData(ZmOperation.KEY_ID), 0);
};

ZmCalViewController.prototype._handleApptEditRespondAction = 
function(ev) {
	var appt = this._listView[this._currentView].getSelection()[0];
	var respCallback = new AjxCallback(this, this._handleResponseHandleApptEditRespondAction, [appt, ev]);
	appt.getDetails(null, respCallback);
};

ZmCalViewController.prototype._handleResponseHandleApptEditRespondAction =
function(args) {
	var appt	= args[0];
	var ev		= args[1];

	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());

	// poke the msgController
	var id = ev.item.getData(ZmOperation.KEY_ID);
	switch (id) {
		case ZmOperation.EDIT_REPLY_ACCEPT: 	id = ZmOperation.REPLY_ACCEPT; break;
		case ZmOperation.EDIT_REPLY_DECLINE: 	id = ZmOperation.REPLY_DECLINE; break;
		case ZmOperation.EDIT_REPLY_TENTATIVE: 	id = ZmOperation.REPLY_TENTATIVE; break;
	}
	msgController._editInviteReply(id, 0);
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
}

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
	if (this._actionMenu) return;

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new ZmActionMenu(this._shell, menuItems);
	for (var i = 0; i < menuItems.length; i++){
		if (menuItems[i] > 0) {
			if (menuItems[i] == ZmOperation.INVITE_REPLY_MENU) {
				var menu = this._actionMenu.getOp(ZmOperation.INVITE_REPLY_MENU).getMenu();
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_ACCEPT, this._listeners[ZmOperation.EDIT_REPLY_ACCEPT]);
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_DECLINE, this._listeners[ZmOperation.EDIT_REPLY_DECLINE]);
				menu.addSelectionListener(ZmOperation.EDIT_REPLY_TENTATIVE, this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE]);
			} else if (menuItems[i] == ZmOperation.CAL_VIEW_MENU) {
				var menu = this._actionMenu.getOp(ZmOperation.CAL_VIEW_MENU).getMenu();			
				this._initCalViewMenu(menu);
			}
			this._actionMenu.addSelectionListener(menuItems[i],this._listeners[menuItems[i]]);
		}
	}
	this._actionMenu.addPopdownListener(this._popdownListener);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 */
ZmCalViewController.prototype._getActionMenuOps = 
function() {
	return [ZmOperation.VIEW_APPOINTMENT, ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES, ZmOperation.SEP, 
			ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_DECLINE, ZmOperation.REPLY_TENTATIVE, 
			ZmOperation.INVITE_REPLY_MENU, ZmOperation.SEP, ZmOperation.DELETE, ZmOperation.SEP, ZmOperation.TODAY_GOTO, ZmOperation.CAL_VIEW_MENU];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions = 
function (appt) {
	var accept = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.REPLY_ACCEPT);
	var decline = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.REPLY_DECLINE);
	var tent = this._actionMenu.getItemById(ZmOperation.KEY_ID,ZmOperation.REPLY_TENTATIVE);
	var editReply = this._actionMenu.getItemById(ZmOperation.KEY_ID,ZmOperation.INVITE_REPLY_MENU);

	var enabled = !appt.isOrganizer();
	accept.setEnabled(enabled);
	decline.setEnabled(enabled);
	tent.setEnabled(enabled);
	editReply.setEnabled(enabled);
};

ZmCalViewController.prototype._enableActionMenuOpenOptions = 
function (appt) {
	if (appt == null) return;

	var open = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPOINTMENT);
	var openInstance = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPT_INSTANCE);
	var openSeries = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPT_SERIES);
	var recur = appt.isRecurring();
	open.setEnabled(!recur);
	openInstance.setEnabled(recur);
	openSeries.setEnabled(recur);
};

ZmCalViewController.prototype._listActionListener = 
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);
	this._enableActionMenuOpenOptions(ev.item);
	this._enableActionMenuReplyOptions(ev.item);
	this._actionMenu.__appt = ev.item;
	this._actionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype._viewActionListener = 
function(ev) {
	this._viewActionMenu.__view = ev.item;
	this._viewActionMenu.popup(0, ev.docX, ev.docY);
};

ZmCalViewController.prototype.sendRequest = 
function(soapDoc) {
	try {
		return this._appCtxt.getAppController().sendRequest(soapDoc);
	} catch (ex) {
		// do nothing
		return null;
	}
}

/**
* caller is responsible for exception handling. caller should also not modify appts in this list directly.
*/
ZmCalViewController.prototype.getApptSummaries =
function(start,end, fanoutAllDay, folderIds, callback) {
	return this._apptCache.getApptSummaries(start, end, fanoutAllDay, folderIds, callback);
}

// TODO: appt is null for now. we are just clearing our caches...
ZmCalViewController.prototype.notifyCreate =
function(appt) {
	//DBG.println("ZmCalViewController: notifyCreate! 1 "+this._clearCache);
	if (!this._clearCache) {
		this._clearCache = true;
	}
}

ZmCalViewController.prototype.notifyDelete =
function(ids) {
	//DBG.println("ZmCalViewController: notifyDelete!");
	if (this._clearCache) return;
	this._clearCache = this._apptCache.containsAnyId(ids);
}

ZmCalViewController.prototype.notifyModify =
function(items) {
	//DBG.println("ZmCalViewController: notifyModify!");
	if (this._clearCache) return;	
	// if any of the ids are in the cache then...	
	this._clearCache = this._apptCache.containsAnyItem(items);
}

// this gets called afer all the above notify* methods get called
ZmCalViewController.prototype.notifyComplete =
function(ids) {
	//DBG.println("ZmCalViewController: notifyComplete: "+this._clearCache);
	if (this._clearCache) {
		var act = new AjxTimedAction(this, ZmCalViewController.prototype._refreshAction);
		AjxTimedAction.scheduleAction(act, 0);
		this._clearCache = false;			
	}
}

// this gets called when we get a refresh block from the server
ZmCalViewController.prototype.refreshHandler =
function() {
	var act = new AjxTimedAction();
	act.obj = this;
	act.method = ZmCalViewController.prototype._refreshAction;
	AjxTimedAction.scheduleAction(act, 0);
}

ZmCalViewController.prototype._refreshAction =
function(dontClearCache) {
	if (this._viewMgr != null) {
		// reset cache
		if (!dontClearCache) this._apptCache.clearCache();
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		if (this._viewVisible) {
			this._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL|ZmCalViewController.MAINT_VIEW);
		} else {
			// delay until we are visible
			this._needFullRefresh = true;
		}
	}
}

ZmCalViewController.prototype._maintErrorHandler =
function(params) {
	// TODO: resched work?
}

ZmCalViewController.prototype._maintGetApptCallback =
function(args) {
	var work = args[0];
	var view = args[1];
	var list = args[2];

	// TODO: turn off shell busy
	
	if (list instanceof ZmCsfeException) {	
		this._handleError(list, this._maintErrorHandler, null);
		return;
	}

	if (work & ZmCalViewController.MAINT_MINICAL) {	
		var highlight = new Array();
		for (var i=0; i < list.size(); i++) {
			var sd = list.get(i).getStartDate();
			highlight[sd.getFullYear()+"/"+sd.getMonth()+"/"+sd.getDate()] = sd;
		}
		this._miniCalendar.setHilite(highlight, true, true);
		
		if (work & ZmCalViewController.MAINT_VIEW) {
			// now schedule view for maint
			this._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
			return;
		}
	} else if (work & ZmCalViewController.MAINT_VIEW) {
		this._list = list;
		view.set(list);
	}
}

ZmCalViewController.prototype._scheduleMaintenance =
function(work) {
	// schedule timed action
	if (this._pendingWork == ZmCalViewController.MAINT_NONE) {
		AjxTimedAction.scheduleAction(this._maintTimedAction, 0);
	}
	this._pendingWork |= work;	
}

ZmCalViewController.prototype._maintenanceAction =
function() {
	var work = this._pendingWork;
	this._pendingWork = ZmCalViewController.MAINT_NONE;

	if (this._viewMgr == null)
		return;

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
		var view = this.getCurrentView();
		if (view && view.needsRefresh()) {
			var rt = view.getTimeRange();
			var cb = new AjxCallback(this, this._maintGetApptCallback, [work, view]);
			// TODO: turn on shell busy
			this.getApptSummaries(rt.start, rt.end, view._fanoutAllDay(), this.getCheckedCalendarFolderIds(), cb);
			view.setNeedsRefresh(false);
		}
	}
}
