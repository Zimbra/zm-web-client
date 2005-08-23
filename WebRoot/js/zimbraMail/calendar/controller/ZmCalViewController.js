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
	this._listeners[ZmOperation.REPLY_ACCEPT] = new AjxListener(this,this._handleApptRespondAction);
	this._listeners[ZmOperation.REPLY_DECLINE] = new AjxListener(this,this._handleApptRespondAction);
	this._listeners[ZmOperation.REPLY_TENTATIVE] = new AjxListener(this,this._handleApptRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_ACCEPT] = new AjxListener(this,this._handleApptEditRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_DECLINE] = new AjxListener(this,this._handleApptEditRespondAction);
	this._listeners[ZmOperation.EDIT_REPLY_TENTATIVE] = new AjxListener(this,this._handleApptEditRespondAction);
	this._listeners[ZmOperation.VIEW_APPOINTMENT] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.VIEW_APPT_INSTANCE] = new AjxListener(this, this._handleMenuViewAction);
	this._listeners[ZmOperation.VIEW_APPT_SERIES] = new AjxListener(this, this._handleMenuViewAction);

	//DND//this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	//DND//this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));	
	this.resetApptSummaryCache();
}

ZmCalViewController.prototype = new ZmListController();
ZmCalViewController.prototype.constructor = ZmCalViewController;

ZmCalViewController._VIEW_NAME = "ZmCalViewController._VIEW_NAME";

ZmCalViewController.ICON = new Object();
ZmCalViewController.ICON[ZmCalViewMgr.DAY_VIEW]			= ZmImg.I_DAY_VIEW;
ZmCalViewController.ICON[ZmCalViewMgr.WORK_WEEK_VIEW]	= ZmImg.I_WORK_WEEK_VIEW;
ZmCalViewController.ICON[ZmCalViewMgr.WEEK_VIEW]		= ZmImg.I_WEEK_VIEW;
ZmCalViewController.ICON[ZmCalViewMgr.MONTH_VIEW]		= ZmImg.I_MONTH_VIEW;

ZmCalViewController.MSG_KEY = new Object();
ZmCalViewController.MSG_KEY[ZmCalViewMgr.DAY_VIEW]			= "viewDay";
ZmCalViewController.MSG_KEY[ZmCalViewMgr.WORK_WEEK_VIEW]	= "viewWorkWeek";
ZmCalViewController.MSG_KEY[ZmCalViewMgr.WEEK_VIEW]			= "viewWeek";
ZmCalViewController.MSG_KEY[ZmCalViewMgr.MONTH_VIEW]		= "viewMonth";

ZmCalViewController.VIEWS = [ZmCalViewMgr.DAY_VIEW, ZmCalViewMgr.WORK_WEEK_VIEW, ZmCalViewMgr.WEEK_VIEW, ZmCalViewMgr.MONTH_VIEW ];

ZmCalViewController.prototype.toString =
function() {
	return "ZmCalViewController";
}

ZmCalViewController.prototype._defaultView =
function() {
	var view = this._appCtxt.get(ZmSetting.CALENDAR_INITIAL_VIEW);
	if (view == "day") return ZmCalViewMgr.DAY_VIEW;
	else if (view == "workWeek") return ZmCalViewMgr.WORK_WEEK_VIEW;
	else if (view == "week") return ZmCalViewMgr.WEEK_VIEW;
	else if (view == "month") return ZmCalViewMgr.MONTH_VIEW;	
	else return ZmCalViewMgr.WORK_WEEK_VIEW;
}

ZmCalViewController.prototype.show = 
function(viewName) {
	if (viewName == null) viewName = this._currentView;
	if (viewName == null) viewName = this._defaultView();

	//DBG.println("ZmCalViewController._show: " + viewName);
	if (this._viewMgr == null) {
	
		var newDate = new Date();
		
		this._viewMgr = new ZmCalViewMgr(this._container, null);
		this._viewMgr.setDate(newDate);
		//DND//this._viewMgr._dragSrc = this._dragSrc;
		this._setup(viewName);
		//this._viewMgr.getCalendar().addSelectionListener(calSelectionListner);
		this._viewMgr.addTimeSelectionListener(new AjxListener(this, this._timeSelectionListener));
		this._viewMgr.addDateRangeListener(new AjxListener(this, this._dateRangeListener));
		
		this._miniCalendar = new DwtCalendar(this._container, null, DwtControl.ABSOLUTE_STYLE);
		this._miniCalendar.setDate(newDate);
		//this._miniCalendar.setDate(new Date());
		this._miniCalendar.setScrollStyle(Dwt.CLIP);
		this._miniCalendar.addSelectionListener(new AjxListener(this, this._miniCalSelectionListener));
		this._miniCalendar.addDateRangeListener(new AjxListener(this, this._miniCalDateRangeListener));
		this._miniCalendar.setWorkingWeek([0, 1, 1, 1, 1, 1, 0]);
		this._needMiniCalendarUpdate = true;
		//this.refreshMiniCalendar();
		// add mini-calendar to skin
		var components = new Object();
		components[ZmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
		this._appCtxt.getAppViewMgr().addComponents(components, true);
	}
	
	if (!this._viewMgr.getView(viewName))
		this._setup(viewName);

	this._viewMgr.setView(viewName);

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
	
	switch(viewName) {
		case ZmCalViewMgr.DAY_VIEW: 
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.day);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.day);
			break;
		case ZmCalViewMgr.WORK_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.workWeek);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.workWeek);			
			break;
		case ZmCalViewMgr.WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.week);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.week);			
			break;;		
		case ZmCalViewMgr.MONTH_VIEW:
			// use day until month does something
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);		
			this._navToolBar.setToolTip(ZmOperation.PAGE_BACK, ZmMsg.previous + " " + ZmMsg.month);
			this._navToolBar.setToolTip(ZmOperation.PAGE_FORWARD, ZmMsg.next + " " + ZmMsg.month);
			//this._calendar.setSelectionMode(DwtCalendar.MONTH);
			break;
	}
	var cv = this._viewMgr.getCurrentView();
	
	this._navToolBar.setText(cv.getCalTitle());
	
	if (cv.isFirstSet()) {
		// schedule	
		cv.setFirstSet(false);
		var act = new AjxTimedAction();
		act.obj = this;
		act.method = ZmCalViewController.prototype.refreshView;
		AjxTimedAction.scheduleAction(act, 0);
	} else {
		this.refreshView();
	}
}

ZmCalViewController.prototype._getToolBarOps =
function() {
//DBG.println("ZmCalViewController.prototype._getToolBarOps");
	var list = new Array();
	list.push(ZmOperation.NEW_MENU);
	list.push(ZmOperation.DELETE);
	list.push(ZmOperation.SEP);
	list.push(ZmOperation.DAY_VIEW);
	list.push(ZmOperation.WORK_WEEK_VIEW);
	list.push(ZmOperation.WEEK_VIEW);
	list.push(ZmOperation.MONTH_VIEW);
	list.push(ZmOperation.SEP);	
	list.push(ZmOperation.TODAY);
	return list;
}

/* This method is called from ZmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
ZmCalViewController.prototype._initializeToolBar =
function(viewName) {
	if (this._toolbar[ZmController.CAL_VIEW]) return;
	//DBG.println("ZmCalViewController.prototype._initializeToolBar: " + viewName);
	var calViewButtonListener = new AjxListener(this, this._calViewButtonListener);
	var todayButtonListener = new AjxListener(this, this._todayButtonListener);	
	
	ZmListController.prototype._initializeToolBar.call(this, ZmCalViewMgr.DAY_VIEW);
	this._setupViewMenu(ZmController.CAL_VIEW);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].addSelectionListener(ZmOperation.DAY_VIEW, calViewButtonListener);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].addSelectionListener(ZmOperation.WEEK_VIEW, calViewButtonListener);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].addSelectionListener(ZmOperation.WORK_WEEK_VIEW, calViewButtonListener);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].addSelectionListener(ZmOperation.MONTH_VIEW, calViewButtonListener);	
	this._toolbar[ZmCalViewMgr.DAY_VIEW].addSelectionListener(ZmOperation.TODAY, todayButtonListener);
		
	this._toolbar[ZmCalViewMgr.DAY_VIEW].setData(ZmOperation.DAY_VIEW, ZmCalViewController._VIEW_NAME, ZmCalViewMgr.DAY_VIEW);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].setData(ZmOperation.WEEK_VIEW, ZmCalViewController._VIEW_NAME, ZmCalViewMgr.WEEK_VIEW);
	this._toolbar[ZmCalViewMgr.DAY_VIEW].setData(ZmOperation.WORK_WEEK_VIEW, ZmCalViewController._VIEW_NAME, ZmCalViewMgr.WORK_WEEK_VIEW);	
	this._toolbar[ZmCalViewMgr.DAY_VIEW].setData(ZmOperation.MONTH_VIEW, ZmCalViewController._VIEW_NAME, ZmCalViewMgr.MONTH_VIEW);		
	
	// Set the other view toolbar entries to point to the Day view entry. I.e. this is a trick
	// to fool the ZmListController into thinking there are multiple toolbars
	this._toolbar[ZmCalViewMgr.WEEK_VIEW] = this._toolbar[ZmCalViewMgr.WORK_WEEK_VIEW] = this._toolbar[ZmCalViewMgr.MONTH_VIEW]= this._toolbar[ZmCalViewMgr.DAY_VIEW];
	this._toolbar[ZmController.CAL_VIEW] = this._toolbar[ZmCalViewMgr.DAY_VIEW];

	// Setup the toolbar stuff
	this._toolbar[ZmCalViewMgr.DAY_VIEW].enable([ZmOperation.TODAY], true);	
	this._toolbar[ZmCalViewMgr.DAY_VIEW].enable([ZmOperation.PAGE_BACK, ZmOperation.PAGE_FORWARD], true);	
	this._toolbar[ZmCalViewMgr.DAY_VIEW].enable([ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.DAY_VIEW], true);	

	this._toolbar[ZmCalViewMgr.DAY_VIEW].addFiller();
	var tb = new ZmNavToolBar(this._toolbar[ZmCalViewMgr.DAY_VIEW], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);

	this._setNewButtonProps(viewName, ZmMsg.createNewAppt, ZmImg.I_APPT,
							ZmImg.ID_APPT, ZmOperation.NEW_APPT);

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
			mi.setData(ZmCalViewController._VIEW_NAME, id);
			mi.addSelectionListener(this._view_menu_listener);
			this._view_menu_item[id] = mi;
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
}

ZmCalViewController.prototype._viewMenuListener =
function(ev) {
	//DBG.println(ev.item.getData(ZmCalViewController._VIEW_NAME));
	if (ev.detail == DwtMenuItem.CHECKED) {
		this.show(ev.item.getData(ZmCalViewController._VIEW_NAME));	
	}
}

ZmCalViewController.prototype._setViewContents =
function(viewName) {
	//DBG.println("ZmCalListController.prototype._setViewContents");
	// Ignore viewName since this will always be ZmController.CAL_VIEW as we are fooling the
	// ZmListController (see our show method)
	var viewName = this._viewMgr.getCurrentViewName();
	//DBG.println("SETTING VIEW CONTENTS FOR: " + viewName);
}

ZmCalViewController.prototype._createNewView =
function(viewName) {
	//DBG.println("ZmCalViewController._createNewView: " + viewName);
	return this._viewMgr.createView(viewName);
}

ZmCalViewController.prototype._calViewButtonListener =
function(ev) {
	var viewName = ev.item.getData(ZmCalViewController._VIEW_NAME);
	//DBG.println("FROM LISTENER: " + viewName);
	this.show(viewName);
}

ZmCalViewController.prototype._todayButtonListener =
function(ev) {
	//DBG.println("TODAY LISTENER");
	this.setDate(new Date(), 0, true);
}

ZmCalViewController._miniCalVisible = false;

ZmCalViewController.prototype._postShowCallback =
function() {
	this.showMiniCalendar(true);
	this._viewVisible = true;
	this.refreshView();
}

ZmCalViewController.prototype._postHideCallback =
function() {
	this.showMiniCalendar(false);
	this._viewVisible = false;
}

ZmCalViewController.prototype.showMiniCalendar =
function(show) {
	if (ZmCalViewController._miniCalVisible == show) return;

	this._appCtxt.getAppViewMgr().showTreeFooter(show);
	ZmCalViewController._miniCalVisible = show;
}

ZmCalViewController.prototype._toggleMiniCalendar = 
function() {
	this.showMiniCalendar(!ZmCalViewController._miniCalVisible);
}

ZmCalViewController.prototype._paginate =
function(viewName, forward) {
	var view = this._listView[viewName];
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
	//DBG.println("ZmCalViewController.setDate = "+date);
	// set mini-cal first so it will cache appts we might need	
	if (this._miniCalendar.getDate() == null || this._miniCalendar.getDate().getTime() != date.getTime()) 
		this._miniCalendar.setDate(date, true, roll);
	this._viewMgr.setDate(date, duration, roll);
	this._navToolBar.setText(this._viewMgr.getCurrentView().getCalTitle());
}

ZmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
}

ZmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
}

ZmCalViewController.prototype._timeSelectionListener =
function(ev) {
	//DBG.println("LCVC _timeSelectionListener");
	var view = 	this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[ZmCalViewMgr.DAY_VIEW], 0);
	}
	this.setDate(ev.detail, 0, ev.force);

	// popup the edit dialog 
	if (ev._isDblClick){
		var p = new DwtPoint(ev.docX, ev.docY);
		this._apptFromView = view;
		this._showAppointmentDetails(null, p, ev.detail);
	}
}

// =======================================================================
// Appointment methods
// =======================================================================
ZmCalViewController.prototype._getAppointmentDialog = function () {
	if (this._apptView == null) {
		ZmUserSchedule.setCommandSender(this);
		this._apptView = new ZmAppointmentView(this._container, null, true);
		this._apptDialog = new ZmDialog (this._shell, null, null, ZmMsg.appointmentNewTitle, null, this._apptView);
		// create listeners for the save and cancel buttons
		var sLis = new AjxListener(this, this._saveAppointment);
		var enterLis = new AjxListener(this, this._apptEnterKeyHandler);
		var cLis = new AjxListener(this, this._cancelAppointmentSave);
		var stateChangeLis = new AjxListener(this, this._apptViewStateChange);
		var focusLis = new AjxListener(this, this._apptDialogFocused);
		this._apptView.addListener(DwtEvent.STATE_CHANGE, stateChangeLis);
		this._apptDialog.setButtonListener(DwtDialog.OK_BUTTON, sLis);
		this._apptDialog.setButtonListener(DwtDialog.CANCEL_BUTTON, cLis);
		this._apptDialog.addEnterListener(enterLis);
		this._apptDialog.addListener(DwtEvent.ONFOCUS, focusLis);
	} else {
		this._apptDialog.reset();
	}
	this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	return this._apptDialog;
};

ZmCalViewController.prototype._apptViewStateChange = function (event) {
	// details are whether or not the apptView has errors.
	if (event.details == true) {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	} else {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	}
};

ZmCalViewController.prototype._apptDialogFocused = function () {
	this._apptView.focus();
};

/** 
 * Override the ZmListController method.
 */
ZmCalViewController.prototype._doDelete =
function(params) {
	try {
		// since our base view has multiple selection turned off,
		// this should always be one item.
		this._deleteAppointment(params.items[0]);
	} catch (ex) {
		this._handleException(ex, this._doDelete, params, false);
	}
};

ZmCalViewController.prototype._deleteAppointment = function (appt) {
	if (appt == null) return;
	if (appt.isRecurring()){
		var m = AjxStringUtil.resolve(ZmMsg.showOccurrenceDeleteMessage,[appt.name]);
		this._getInstanceSeriesDialog(m, ZmAppt.MODE_DELETE);
		this._showSingleInstanceDialog.popup();
		this._showSingleInstanceDialog.__appt = appt;
	} else {
		this._continueDelete(appt, ZmAppt.MODE_DELETE);
	}
};

ZmCalViewController.prototype._continueDelete = function (appt, mode){ 
	try {
		appt.cancel(this._appCtxt.getAppController(), mode);
	} catch (ex) {
		var params = [appt, mode];
		this._handleException(ex, this._continueDelete, params, false);		
	}
};

ZmCalViewController.prototype._getInstanceSeriesDialog = function (message, mode) {
	var t = (mode == ZmAppt.MODE_DELETE)? ZmMsg.deleteRecurringItem: ZmMsg.openRecurringItem;
	if (this._rView == null) {
		this._recInstance = {message:message, operation:mode, title: t};
		this._rView = new ZmEditInstanceSeriesView(this._shell, this._recInstance);
		this._showSingleInstanceDialog = new DwtBaseDialog (this._shell, null, t, null, null, null, this._rView);
															//this._rView.getDragHandleId());
		this._rView.addListener(DwtEvent.BUTTON_PRESSED,
								new AjxListener(this, this._handleSingleInstanceButton));
	} else {
		this._recInstance.message = message;
		this._recInstance.operation = mode;
		this._recInstance.title = t;
		this._rView.setData(this._recInstance);
	}

	return this._showSingleInstanceDialog;
};

ZmCalViewController.prototype.newAppointment = function (optionalStartDate) {
	// Create a new appointment
	optionalStartDate = (optionalStartDate != null)? optionalStartDate: ((this._viewMgr != null)? this._viewMgr.getDate(): null);
	this._getAppointmentDialog();
	this._apptDialog.setTitle(ZmMsg.appointmentNewTitle);
	this._popupAppointmentDialog(null, optionalStartDate, ZmAppt.MODE_NEW);
};

ZmCalViewController.prototype.editRecurringAppointment = function (appt, optionalStartDate) {
	var m = AjxStringUtil.resolve(ZmMsg.showOccurrenceMessage,[appt.name]);
	this._getInstanceSeriesDialog(m, ZmAppt.MODE_EDIT);
	this._showSingleInstanceDialog.__appt = appt;
	this._showSingleInstanceDialog.__osd = optionalStartDate;
	this._showSingleInstanceDialog.popup();
};

ZmCalViewController.prototype.editSimpleAppointment = function (appt, optionalStartDate) {

};

ZmCalViewController.prototype._showAppointmentDetails =
function (appt, point, optionalStartDate){
	var appModels = this._appCtxt.getAppController()._models;
	var arr = appModels.getArray();
	var mailList = null;
	for (var i = 0 ; i < arr.length; ++i) {
		if (arr[i] instanceof ZmMailList) {
			mailList = arr[i];
			break;
		}
	}
	try {
		if (appt != null) {
			// if we have an appointment, go get all the details.
			// if the appointment is recurring, then ask the user whether to deal with
			// the one from this day, or the whole appointment
			if (appt.isRecurring()){
				this.editRecurringAppointment(appt, optionalStartDate)
				return;
			} else {
				// if we're dealing with a simple appointment, no intermediate dialog
				// is necessary, so just continue.
				this.editAppointment(appt, optionalStartDate, ZmAppt.MODE_EDIT);
			}
		} else {
			this.newAppointment(optionalStartDate);
		}
	} catch (ex) {
		var params = [appt, point];
		this._handleException(ex, this._showAppointmentDetails, params, false);
	}
};

ZmCalViewController.prototype._handleSingleInstanceButton = function (event) {
	// find out what button was pushed.
	var btn = event.item;
	btn._setMouseOutClassName();
	var text = btn.getText();
	var appt = this._showSingleInstanceDialog.__appt;
	delete this._showSingleInstanceDialog.__appt;
	var optionalStartDate = this._showSingleInstanceDialog.__osd;
	delete this._showSingleInstanceDialog.__osd;
	if (text == ZmMsg.openSeries){
		this.editAppointment(appt, optionalStartDate, ZmAppt.MODE_EDIT_SERIES);
	} else if (text == ZmMsg.openInstance){
		this.editAppointment(appt, optionalStartDate, ZmAppt.MODE_EDIT_SINGLE_INSTANCE);
	} else if (text == ZmMsg.deleteInstance){
		this._continueDelete(appt, ZmAppt.MODE_DELETE_INSTANCE);
	} else if (text == ZmMsg.deleteSeries) {
		this._continueDelete(appt, ZmAppt.MODE_DELETE_SERIES);
	} else if (text == ZmMsg.cancel){
		// nothing
	}
	this._showSingleInstanceDialog.popdown();
};

ZmCalViewController.prototype.editAppointment = function (appt, optionalStartDate, mode) {
	this._getAppointmentDialog();
	this._apptDialog.setTitle(ZmMsg.appointmentEditTitle);
	this._popupAppointmentDialog(appt, optionalStartDate, mode);
};

ZmCalViewController.prototype._popupAppointmentDialog = function (appt, optionalStartDate, mode) {
	this._apptView.showDetail(appt, optionalStartDate, mode);
	this._apptDialog.popup();
	if (appt && !appt.isOrganizer()) {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	}
};

ZmCalViewController.prototype._apptEnterKeyHandler = function (event) {
	if (this._apptDialog.getButtonEnabled(DwtDialog.OK_BUTTON)){
		this._saveAppointment(event);
	}
};
ZmCalViewController.prototype._saveAppointment = function (event) {
	try{
		if (!this._savingAppointment) {
			this._savingAppointment = true;
			// submit attachments if there are any.
			if (this._apptView.hasAttachments()){
				var sCb = new AjxCallback(this, this._continueSave);
				var fCb = new AjxCallback(this, this._attachmentUploadFailed);
				this._apptView.submitAttachments(sCb, fCb);
				return;
			} else {
				var args = [200, null];
				this._continueSave(args);
			}
		}
	} catch (ex) {
		this._handleException(ex, this._saveAppointment, args, false);
	} finally {
		this._savingAppointment = false;
	}
};

ZmCalViewController.prototype._continueSave = function (args) {
	try{
		// get the attachment id from the arguments
		var attId = args[1];

		// get the appointment from the appointmentView,
		var appt = this._apptView.getAppt();
		//var editMode = appt.getViewMode();

		// save it to the server
		appt.save(this._appCtxt.getAppController(), attId);
		// let notifications cause the internal list to be updated
		this._apptDialog.popdown();
	} catch (ex) {
		if (ex.code == ZmCsfeException.MAIL_UNKNOWN_LOCAL_RECIPIENTS) {
 			// This is probably an invalid email address
			var addresses = ex.msg.replace(/^.*unknown:/, "");
 			this.popupErrorDialog(AjxStringUtil.resolve(ZmMsg.unknownLocalRecipients,[addresses]));
 		} else {
			this._handleException(ex, this._saveAppointment, args, false);
 		}
	} finally {
		this._savingAppointment = false;
	}
};

ZmCalViewController.prototype._cancelAppointmentSave = function (event) {
	this._apptDialog.popdown();
};

ZmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	//this._schedule(this._doPopulateMiniCal, {view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});
	this._doPopulateMiniCal({view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});	
}

ZmCalViewController.prototype._doPopulateMiniCal =
function(params)
{
	try {
		var result = this.getApptSummaries(params.startTime, params.endTime, true);
		var highlight = new Array();
		for (var i=0; i < result.size(); i++) {
			var sd = result.get(i).getStartDate();
			highlight[sd.getFullYear()+"/"+sd.getMonth()+"/"+sd.getDate()] = sd;
		}
		params.view.setHilite(highlight, true, true);
	} catch (ex) {
		this._handleException(ex, this._doPopulateMiniCal, params, false);
	}
}

ZmCalViewController.prototype.getDayToolTipText =
function(date)
{
	try {
		var start = new Date(date);
		start.setHours(0, 0, 0, 0);
		var end = new Date(start);
		end.setDate(start.getDate()+1);
		var result = this.getApptSummaries(start.getTime(), end.getTime(), true);
		return ZmCalMonthView.getDayToolTipText(start,result);
	} catch (ex) {
		//alert(ex);
		return "<b>error getting summary</b>";
	}
}

ZmCalViewController.prototype._dateRangeListener =
function(ev) {
	//this._schedule(this._doPopulateView, {view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});
	this._doPopulateView({view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});	
}

ZmCalViewController.prototype._doPopulateView =
function(params)
{
	// first set, get on a refresh
	if (params.view.isFirstSet())
		return;

	try {
		var list = this._list = this.getApptSummaries(params.startTime, params.endTime, params.view._fanoutAllDay());
		params.view.set(list);
	} catch (ex) {
		this._handleException(ex, this._doPopulateView, params, false);
	}
}

/* 
ZmCalViewController.prototype._getActionMenuOps =
function() {
	var list = this._contactOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
}
*/

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
		parent.enable([ZmOperation.TODAY, ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.DAY_VIEW], true);
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
		var p = new DwtPoint(ev.docX, ev.docY);
		this._apptIndexShowing = this._list.indexOf(ev.item);
		this._apptFromView = this._viewMgr.getCurrentView();
		this._showAppointmentDetails(ev.item, p);		
	}
}

ZmCalViewController.prototype._handleMenuViewAction = function (ev) {
	var id = ev.item.getData(ZmOperation.KEY_ID);
	var appt = this._actionMenu.__appt;
	delete this._actionMenu.__appt;
	var mode;
	switch(id) {
	case ZmOperation.VIEW_APPOINTMENT:
		mode = ZmAppt.MODE_EDIT;
		break;
	case ZmOperation.VIEW_APPT_INSTANCE:
		mode = ZmAppt.MODE_EDIT_SINGLE_INSTANCE;
		break;
	case ZmOperation.VIEW_APPT_SERIES:
		mode = ZmAppt.MODE_EDIT_SERIES;
		break;
	}
	this.editAppointment(appt, null, mode);

};

ZmCalViewController.prototype._handleApptRespondAction = function (ev){
	var appt = this._listView[this._currentView].getSelection()[0];
	appt.getDetails();
	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());
	// poke the msgController
	msgController._sendInviteReply(ev.item.getData(ZmOperation.KEY_ID), 0);
};

ZmCalViewController.prototype._handleApptEditRespondAction = function (ev){
	
	var appt = this._listView[this._currentView].getSelection()[0];
	appt.getDetails();
	var msgController = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getMsgController();
	msgController.setMsg(appt.getMessage());
	// poke the msgController
	var id = ev.item.getData(ZmOperation.KEY_ID);
	switch (id) {
	case ZmOperation.EDIT_REPLY_ACCEPT:
		id = ZmOperation.REPLY_ACCEPT;
		break;
	case ZmOperation.EDIT_REPLY_DECLINE:
		id = ZmOperation.REPLY_DECLINE;
		break;
	case ZmOperation.EDIT_REPLY_TENTATIVE:
		id = ZmOperation.REPLY_TENTATIVE;
		break;
	}
	msgController._editInviteReply(id, 0);
};

/**
 * Overrides ZmListController.prototype._initializeActionMenu
 */
ZmCalViewController.prototype._initializeActionMenu = function (){
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
			}
			this._actionMenu.addSelectionListener(menuItems[i],this._listeners[menuItems[i]]);
		}
	}
	this._actionMenu.addPopdownListener(this._popdownListener);
};

/**
 * Overrides ZmListController.prototype._getActionMenuOptions
 */
ZmCalViewController.prototype._getActionMenuOps = function () {
	return [ZmOperation.VIEW_APPOINTMENT, ZmOperation.VIEW_APPT_INSTANCE, ZmOperation.VIEW_APPT_SERIES, ZmOperation.SEP, 
			ZmOperation.REPLY_ACCEPT, ZmOperation.REPLY_DECLINE, ZmOperation.REPLY_TENTATIVE, 
			ZmOperation.INVITE_REPLY_MENU, ZmOperation.SEP, ZmOperation.DELETE];
};

ZmCalViewController.prototype._enableActionMenuReplyOptions = function (appt) {
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

ZmCalViewController.prototype._enableActionMenuOpenOptions = function (appt) {
	if (appt == null) return;

	var open = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPOINTMENT);
	var openInstance = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPT_INSTANCE);
	var openSeries = this._actionMenu.getItemById(ZmOperation.KEY_ID, ZmOperation.VIEW_APPT_SERIES);
	var recur = appt.isRecurring();
	open.setEnabled(!recur);
	openInstance.setEnabled(recur);
	openSeries.setEnabled(recur);
};

ZmCalViewController.prototype._listActionListener = function (ev){
	ZmListController.prototype._listActionListener.call(this, ev);
	this._enableActionMenuOpenOptions(ev.item);
	this._enableActionMenuReplyOptions(ev.item);
	this._actionMenu.__appt = ev.item;
	this._actionMenu.popup(0, ev.docX, ev.docY);
	
};

ZmCalViewController.prototype.sendRequest = function (soapDoc, useXml) {
	try {
		return this._appCtxt.getAppController().sendRequest(soapDoc, useXml);
	} catch (ex) {
		// do nothing
		return null;
	}
}

ZmCalViewController.prototype._getCachedVector =
function(startTime, endTime, fanoutAllDay)
{
	var cacheKey = startTime+":"+endTime+":"+fanoutAllDay;
	var result  = this._cachedApptVectors[cacheKey];
	if (result != null) return result.clone();
	else return null;
}

ZmCalViewController.prototype._findCachedApptSummaries =
function(start,end) {
	var found = false;
	var entry = this._cachedApptSummaries[start+":"+end];
	if (entry != null) return entry.list;

	for (var key in this._cachedApptSummaries) {
		entry = this._cachedApptSummaries[key];
		if (start >= entry.start &&
			end <= entry.end) {
			found = true;
			break;
		}
	}
	if (!found)
		return null;

	DBG.println("cache hit!");
			
	if (entry.start == start && entry.end == end)
		return entry.list;

	var apptList = entry.list.getSubset(start,end);
	this._cachedApptSummaries[start+":"+end] = {start: start, end:end, list: apptList};	
	return apptList;
}

ZmCalViewController.CACHING_ENABLED = true;

ZmCalViewController.prototype.resetApptSummaryCache =
function() {
	this._cachedApptSummaries = {};
	this._cachedApptVectors = {};	
	this._cachedIds = {};		
}

ZmCalViewController.prototype._updateCachedIds =
function(apptList) {
	var list = apptList.getVector();
	var size = list.size();
	for (var i=0; i < size; i++) {
		var ao = list.get(i);
		this._cachedIds[ao.id] = 1;
		this._cachedIds[ao.invId] = 1;		
	}	
}

/**
* caller is responsible for exception handling. caller should also not modify appts in this list directly.
*/
ZmCalViewController.prototype.getApptSummaries =
function(start,end, fanoutAllDay) {
	var list;
	
	if (ZmCalViewController.CACHING_ENABLED) {
		list = this._getCachedVector(start, end, fanoutAllDay);
		if (list != null) return list; // already cloned
		var apptList = this._findCachedApptSummaries(start,end);
		if (apptList != null) {
			list = ZmApptList.toVector(apptList, start, end, fanoutAllDay);
			this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;
			return list.clone();
		}
	}

	apptList = new ZmApptList(this._shell.getData(ZmAppCtxt.LABEL));
	var soapDoc = AjxSoapDoc.create("GetApptSummariesRequest", "urn:zimbraMail");
	var method = soapDoc.getMethod();
	method.setAttribute("s", start);
	method.setAttribute("e", end);
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	apptList.loadFromSummaryJs(resp.GetApptSummariesResponse);
	
	if (ZmCalViewController.CACHING_ENABLED)
		this._updateCachedIds(apptList);
	
	// cache it 
	if (ZmCalViewController.CACHING_ENABLED)
		this._cachedApptSummaries[start+":"+end] = {start: start, end:end, list: apptList};	
	list = ZmApptList.toVector(apptList, start, end, fanoutAllDay);	
	if (ZmCalViewController.CACHING_ENABLED)	
		this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;
	
	return list.clone();
}

ZmCalViewController.prototype.notifyCreate =
function(msg) {
	//DBG.println("ZmCalViewController: notifyCreate!");
	if (!this._clearCache) {
		this._clearCache = true;
	}
}

ZmCalViewController.prototype.notifyDelete =
function(ids) {
	//DBG.println("ZmCalViewController: notifyDelete!");
	if (this._cacheCleared) return;
	// if any of the ids ire in the cache then...	
	for (var i=0; i < ids.length; i++) {
		if (this._cachedIds[ids[i]]) {
			this._clearCache = true;
			return;
		}
	}
}

ZmCalViewController.prototype.notifyModify =
function(ids) {
	//DBG.println("ZmCalViewController: notifyModify!");
	if (this._cacheCleared) return;
	// if any of the ids ire in the cache then...	
	for (var i=0; i < ids.length; i++) {
		if (this._cachedIds[ids[i]]) {
			this._clearCache = true;
			return;
		}
	}
}

ZmCalViewController.prototype.notifyComplete =
function(ids) {
	//DBG.println("ZmCalViewController: notifyComplete!");
	if (this._clearCache && this._viewMgr != null) {
		// reset cache
		this.resetApptSummaryCache();
		// mark all views as dirty
		this._viewMgr.setNeedsRefresh(true);
		// mark mini cal as dirty
		this._needMiniCalendarUpdate = true;
		this._clearCache = false;	
		
		if (this._viewVisible) this.refreshView();
	}
}

ZmCalViewController.prototype.refreshMiniCalendar =
function() {
	var cal = this._miniCalendar;
	var calRange = cal.getDateRange();
	var params = {startTime:calRange.start.getTime(), endTime: calRange.end.getTime(), view: cal};
	this._doPopulateMiniCal(params);
}

ZmCalViewController.prototype.refreshView = 
function () {
	if (this._viewMgr == null)
		return;

	if (this._needMiniCalendarUpdate) {
		this.refreshMiniCalendar();
		this._needMiniCalendarUpdate = false;
	}

	var cV = this.getCurrentView();
	if (cV && cV.needsRefresh()) {
		var rt = cV.getTimeRange();
		var params = {startTime:rt.start, endTime :rt.end, view : cV};		
		this._doPopulateView(params);	
		cV.setNeedsRefresh(false);			
	}
}
