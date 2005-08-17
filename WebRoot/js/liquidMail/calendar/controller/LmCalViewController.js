/*
	The strategy for the calendar is to leverage the list view stuff by creating a single
	view (i.e. LmCalViewMgr) and have it manage the schedule views (e.g. week, month) and
	a single calendar view (the calendar widget to the right). Each of the schedule views
	will be a list view that are managed by the LmCalViewMgr. 
	
	To do this we have to trick the LmListController. Specifically we have only one toolbar and
	directly manipulate this._toolbar elements to point to a single instance of the toolbar. We also
	directly replace:
	
	LmListControl.prototype.initilaizeToolBar
*/

function LmCalViewController(appCtxt, container, calApp) {
	LmListController.call(this, appCtxt, container, calApp);
	this._listeners[LmOperation.REPLY_ACCEPT] = new LsListener(this,this._handleApptRespondAction);
	this._listeners[LmOperation.REPLY_DECLINE] = new LsListener(this,this._handleApptRespondAction);
	this._listeners[LmOperation.REPLY_TENTATIVE] = new LsListener(this,this._handleApptRespondAction);
	//DND//this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	//DND//this._dragSrc.addDragListener(new LsListener(this, this._dragListener));	
	this.resetApptSummaryCache();
}

LmCalViewController.prototype = new LmListController();
LmCalViewController.prototype.constructor = LmCalViewController;

LmCalViewController._VIEW_NAME = "LmCalViewController._VIEW_NAME";

LmCalViewController.ICON = new Object();
LmCalViewController.ICON[LmCalViewMgr.DAY_VIEW]			= LmImg.I_DAY_VIEW;
LmCalViewController.ICON[LmCalViewMgr.WORK_WEEK_VIEW]	= LmImg.I_WORK_WEEK_VIEW;
LmCalViewController.ICON[LmCalViewMgr.WEEK_VIEW]		= LmImg.I_WEEK_VIEW;
LmCalViewController.ICON[LmCalViewMgr.MONTH_VIEW]		= LmImg.I_MONTH_VIEW;

LmCalViewController.MSG_KEY = new Object();
LmCalViewController.MSG_KEY[LmCalViewMgr.DAY_VIEW]			= "viewDay";
LmCalViewController.MSG_KEY[LmCalViewMgr.WORK_WEEK_VIEW]	= "viewWorkWeek";
LmCalViewController.MSG_KEY[LmCalViewMgr.WEEK_VIEW]			= "viewWeek";
LmCalViewController.MSG_KEY[LmCalViewMgr.MONTH_VIEW]		= "viewMonth";

LmCalViewController.VIEWS = [LmCalViewMgr.DAY_VIEW, LmCalViewMgr.WORK_WEEK_VIEW, LmCalViewMgr.WEEK_VIEW, LmCalViewMgr.MONTH_VIEW ];

LmCalViewController.prototype.toString =
function() {
	return "LmCalViewController";
}

LmCalViewController.prototype._defaultView =
function() {
	var view = this._appCtxt.get(LmSetting.CALENDAR_INITIAL_VIEW);
	if (view == "day") return LmCalViewMgr.DAY_VIEW;
	else if (view == "workWeek") return LmCalViewMgr.WORK_WEEK_VIEW;
	else if (view == "week") return LmCalViewMgr.WEEK_VIEW;
	else if (view == "month") return LmCalViewMgr.MONTH_VIEW;	
	else return LmCalViewMgr.WORK_WEEK_VIEW;
}

LmCalViewController.prototype.show = 
function(viewName) {
	if (viewName == null) viewName = this._currentView;
	if (viewName == null) viewName = this._defaultView();

	//DBG.println("LmCalViewController._show: " + viewName);
	if (this._viewMgr == null) {
	
		var newDate = new Date();
		
		this._viewMgr = new LmCalViewMgr(this._container, null);
		this._viewMgr.setDate(newDate);
		//DND//this._viewMgr._dragSrc = this._dragSrc;
		this._setup(viewName);
		//this._viewMgr.getCalendar().addSelectionListener(calSelectionListner);
		this._viewMgr.addTimeSelectionListener(new LsListener(this, this._timeSelectionListener));
		this._viewMgr.addDateRangeListener(new LsListener(this, this._dateRangeListener));
		
		this._miniCalendar = new DwtCalendar(this._container, null, DwtControl.ABSOLUTE_STYLE);
		this._miniCalendar.setDate(newDate);
		//this._miniCalendar.setDate(new Date());
		this._miniCalendar.setScrollStyle(Dwt.CLIP);
		this._miniCalendar.addSelectionListener(new LsListener(this, this._miniCalSelectionListener));
		this._miniCalendar.addDateRangeListener(new LsListener(this, this._miniCalDateRangeListener));
		this._miniCalendar.setWorkingWeek([0, 1, 1, 1, 1, 1, 0]);
		this._needMiniCalendarUpdate = true;
		//this.refreshMiniCalendar();
		// add mini-calendar to skin
		var components = new Object();
		components[LmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
		this._appCtxt.getAppViewMgr().addComponents(components, true);
	}
	
	if (!this._viewMgr.getView(viewName))
		this._setup(viewName);

	this._viewMgr.setView(viewName);

	var elements = new Object();
	elements[LmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[LmController.CAL_VIEW];
	elements[LmAppViewMgr.C_APP_CONTENT] = this._viewMgr;
	var ok = this._setView(LmController.CAL_VIEW, elements, true);
	if (ok) {
		this._setViewMenu(LmController.CAL_VIEW);
		if (this._currentView)
			this._view_menu_item[this._currentView].setChecked(false, true);
	}
	this._currentView = this._viewMgr.getCurrentViewName();
	this._view_menu_item[this._currentView].setChecked(true, true);
	this._listView[this._currentView] = this._viewMgr.getCurrentView();	
	
	switch(viewName) {
		case LmCalViewMgr.DAY_VIEW: 
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
			this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.day);
			this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.day);
			break;
		case LmCalViewMgr.WORK_WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WORK_WEEK);
			this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.workWeek);
			this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.workWeek);			
			break;
		case LmCalViewMgr.WEEK_VIEW:
			this._miniCalendar.setSelectionMode(DwtCalendar.WEEK);
			this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.week);
			this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.week);			
			break;;		
		case LmCalViewMgr.MONTH_VIEW:
			// use day until month does something
			this._miniCalendar.setSelectionMode(DwtCalendar.DAY);		
			this._navToolBar.setToolTip(LmOperation.PAGE_BACK, LmMsg.previous + " " + LmMsg.month);
			this._navToolBar.setToolTip(LmOperation.PAGE_FORWARD, LmMsg.next + " " + LmMsg.month);
			//this._calendar.setSelectionMode(DwtCalendar.MONTH);
			break;
	}
	var cv = this._viewMgr.getCurrentView();
	
	this._navToolBar.setText(cv.getCalTitle());
	
	if (cv.isFirstSet()) {
		// schedule	
		cv.setFirstSet(false);
		var act = new LsTimedAction();
		act.obj = this;
		act.method = LmCalViewController.prototype.refreshView;
		LsTimedAction.scheduleAction(act, 0);
	} else {
		this.refreshView();
	}
}

LmCalViewController.prototype._getToolBarOps =
function() {
//DBG.println("LmCalViewController.prototype._getToolBarOps");
	var list = new Array();
	list.push(LmOperation.NEW_MENU);
	list.push(LmOperation.DELETE);
	list.push(LmOperation.SEP);
	list.push(LmOperation.DAY_VIEW);
	list.push(LmOperation.WORK_WEEK_VIEW);
	list.push(LmOperation.WEEK_VIEW);
	list.push(LmOperation.MONTH_VIEW);
	list.push(LmOperation.SEP);	
	list.push(LmOperation.TODAY);
	return list;
}

/* This method is called from LmListController._setup. We control when this method is called in our
 * show method. We ensure it is only called once i.e the first time show is called
 */
LmCalViewController.prototype._initializeToolBar =
function(viewName) {
	if (this._toolbar[LmController.CAL_VIEW]) return;
	//DBG.println("LmCalViewController.prototype._initializeToolBar: " + viewName);
	var calViewButtonListener = new LsListener(this, this._calViewButtonListener);
	var todayButtonListener = new LsListener(this, this._todayButtonListener);	
	
	LmListController.prototype._initializeToolBar.call(this, LmCalViewMgr.DAY_VIEW);
	this._setupViewMenu(LmController.CAL_VIEW);
	this._toolbar[LmCalViewMgr.DAY_VIEW].addSelectionListener(LmOperation.DAY_VIEW, calViewButtonListener);
	this._toolbar[LmCalViewMgr.DAY_VIEW].addSelectionListener(LmOperation.WEEK_VIEW, calViewButtonListener);
	this._toolbar[LmCalViewMgr.DAY_VIEW].addSelectionListener(LmOperation.WORK_WEEK_VIEW, calViewButtonListener);
	this._toolbar[LmCalViewMgr.DAY_VIEW].addSelectionListener(LmOperation.MONTH_VIEW, calViewButtonListener);	
	this._toolbar[LmCalViewMgr.DAY_VIEW].addSelectionListener(LmOperation.TODAY, todayButtonListener);
		
	this._toolbar[LmCalViewMgr.DAY_VIEW].setData(LmOperation.DAY_VIEW, LmCalViewController._VIEW_NAME, LmCalViewMgr.DAY_VIEW);
	this._toolbar[LmCalViewMgr.DAY_VIEW].setData(LmOperation.WEEK_VIEW, LmCalViewController._VIEW_NAME, LmCalViewMgr.WEEK_VIEW);
	this._toolbar[LmCalViewMgr.DAY_VIEW].setData(LmOperation.WORK_WEEK_VIEW, LmCalViewController._VIEW_NAME, LmCalViewMgr.WORK_WEEK_VIEW);	
	this._toolbar[LmCalViewMgr.DAY_VIEW].setData(LmOperation.MONTH_VIEW, LmCalViewController._VIEW_NAME, LmCalViewMgr.MONTH_VIEW);		
	
	// Set the other view toolbar entries to point to the Day view entry. I.e. this is a trick
	// to fool the LmListController into thinking there are multiple toolbars
	this._toolbar[LmCalViewMgr.WEEK_VIEW] = this._toolbar[LmCalViewMgr.WORK_WEEK_VIEW] = this._toolbar[LmCalViewMgr.MONTH_VIEW]= this._toolbar[LmCalViewMgr.DAY_VIEW];
	this._toolbar[LmController.CAL_VIEW] = this._toolbar[LmCalViewMgr.DAY_VIEW];

	// Setup the toolbar stuff
	this._toolbar[LmCalViewMgr.DAY_VIEW].enable([LmOperation.TODAY], true);	
	this._toolbar[LmCalViewMgr.DAY_VIEW].enable([LmOperation.PAGE_BACK, LmOperation.PAGE_FORWARD], true);	
	this._toolbar[LmCalViewMgr.DAY_VIEW].enable([LmOperation.WEEK_VIEW, LmOperation.MONTH_VIEW, LmOperation.DAY_VIEW], true);	

	this._toolbar[LmCalViewMgr.DAY_VIEW].addFiller();
	var tb = new LmNavToolBar(this._toolbar[LmCalViewMgr.DAY_VIEW], DwtControl.STATIC_STYLE, null, LmNavToolBar.SINGLE_ARROWS, true);
	this._setNavToolBar(tb);

	this._setNewButtonProps(viewName, LmMsg.createNewAppt, LmImg.I_APPT,
							LmImg.ID_APPT, LmOperation.NEW_APPT);

}

// Create menu for View button and add listeners.
LmCalViewController.prototype._setupViewMenu =
function(view) {
	var appToolbar = this._appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var menu = new LmPopupMenu(appToolbar.getViewButton());
		this._view_menu_item = {};
		this._view_menu_listener = new LsListener(this, this._viewMenuListener);
		for (var i = 0; i < LmCalViewController.VIEWS.length; i++) {
			var id = LmCalViewController.VIEWS[i];
			var mi = menu.createMenuItem(id, LmCalViewController.ICON[id], LmMsg[LmCalViewController.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE);
			mi.setData(LmCalViewController._VIEW_NAME, id);
			mi.addSelectionListener(this._view_menu_listener);
			this._view_menu_item[id] = mi;
		}
		appToolbar.setViewMenu(view, menu);
	}
	return menu;
}

LmCalViewController.prototype._viewMenuListener =
function(ev) {
	//DBG.println(ev.item.getData(LmCalViewController._VIEW_NAME));
	if (ev.detail == DwtMenuItem.CHECKED) {
		this.show(ev.item.getData(LmCalViewController._VIEW_NAME));	
	}
}

LmCalViewController.prototype._setViewContents =
function(viewName) {
	//DBG.println("LmCalListController.prototype._setViewContents");
	// Ignore viewName since this will always be LmController.CAL_VIEW as we are fooling the
	// LmListController (see our show method)
	var viewName = this._viewMgr.getCurrentViewName();
	//DBG.println("SETTING VIEW CONTENTS FOR: " + viewName);
}

LmCalViewController.prototype._createNewView =
function(viewName) {
	//DBG.println("LmCalViewController._createNewView: " + viewName);
	return this._viewMgr.createView(viewName);
}

LmCalViewController.prototype._calViewButtonListener =
function(ev) {
	var viewName = ev.item.getData(LmCalViewController._VIEW_NAME);
	//DBG.println("FROM LISTENER: " + viewName);
	this.show(viewName);
}

LmCalViewController.prototype._todayButtonListener =
function(ev) {
	//DBG.println("TODAY LISTENER");
	this.setDate(new Date(), 0, true);
}

LmCalViewController._miniCalVisible = false;

LmCalViewController.prototype._postShowCallback =
function() {
	this.showMiniCalendar(true);
	this._viewVisible = true;
	this.refreshView();
}

LmCalViewController.prototype._postHideCallback =
function() {
	this.showMiniCalendar(false);
	this._viewVisible = false;
}

LmCalViewController.prototype.showMiniCalendar =
function(show) {
	if (LmCalViewController._miniCalVisible == show) return;

	this._appCtxt.getAppViewMgr().showTreeFooter(show);
	LmCalViewController._miniCalVisible = show;
}

LmCalViewController.prototype._toggleMiniCalendar = 
function() {
	this.showMiniCalendar(!LmCalViewController._miniCalVisible);
}

LmCalViewController.prototype._paginate =
function(viewName, forward) {
	var view = this._listView[viewName];
	var field = view.getRollField();
	var d = new Date(this._viewMgr.getDate());
	d = LsDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);	
}

// attempts to process a nav toolbar up/down button click
LmCalViewController.prototype._paginateDouble = 
function(forward) {
	var view = 	this._viewMgr.getCurrentView();
	var field = view.getRollField(true);
	var d = new Date(this._viewMgr.getDate());
	d = LsDateUtil.roll(d, field, forward ? 1 : -1);
	this.setDate(d, 0, true);	
}

LmCalViewController.prototype.setDate = 
function(date, duration, roll) {
	//DBG.println("LmCalViewController.setDate = "+date);
	// set mini-cal first so it will cache appts we might need	
	if (this._miniCalendar.getDate() == null || this._miniCalendar.getDate().getTime() != date.getTime()) 
		this._miniCalendar.setDate(date, true, roll);
	this._viewMgr.setDate(date, duration, roll);
	this._navToolBar.setText(this._viewMgr.getCurrentView().getCalTitle());
}

LmCalViewController.prototype._dateSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.force);
}

LmCalViewController.prototype._miniCalSelectionListener =
function(ev) {
	this.setDate(ev.detail, 0, ev.item.getForceRollOver());
}

LmCalViewController.prototype._timeSelectionListener =
function(ev) {
	//DBG.println("LCVC _timeSelectionListener");
	var view = 	this._viewMgr.getCurrentView();
	if (view.getSelectedItems().size() > 0) {
		view.deselectAll();
		this._resetOperations(this._toolbar[LmCalViewMgr.DAY_VIEW], 0);
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
LmCalViewController.prototype._getAppointmentDialog = function () {
	if (this._apptView == null) {
		LmUserSchedule.setCommandSender(this);
		this._apptView = new LmAppointmentView(this._container, null, true);
		this._apptDialog = new LmDialog (this._shell, null, null, LmMsg.appointmentNewTitle, null, this._apptView);
		// create listeners for the save and cancel buttons
		var sLis = new LsListener(this, this._saveAppointment);
		var enterLis = new LsListener(this, this._apptEnterKeyHandler);
		var cLis = new LsListener(this, this._cancelAppointmentSave);
		var stateChangeLis = new LsListener(this, this._apptViewStateChange);
		var focusLis = new LsListener(this, this._apptDialogFocused);
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

LmCalViewController.prototype._apptViewStateChange = function (event) {
	// details are whether or not the apptView has errors.
	if (event.details == true) {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	} else {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, true);
	}
};

LmCalViewController.prototype._apptDialogFocused = function () {
	this._apptView.focus();
};

/** 
 * Override the LmListController method.
 */
LmCalViewController.prototype._doDelete =
function(params) {
	try {
		// since our base view has multiple selection turned off,
		// this should always be one item.
		this._deleteAppointment(params.items[0]);
	} catch (ex) {
		this._handleException(ex, this._doDelete, params, false);
	}
};

// LmCalViewController.prototype._handleMenuDelete = function (event) {
// 	DBG.println("_handleMenuDelete called");
// 	var menuItem = event.item;
// 	var menuDetail = event.detail;
// 	var appt = this._actionMenu.__appt;
// 	delete this._actionMenu.__appt;
// 	this._actionMenu.popdown();
// 	this._deleteAppointment(appt);
// };

LmCalViewController.prototype._deleteAppointment = function (appt) {
	if (appt == null) return;
	if (appt.isRecurring()){
		var m = LsStringUtil.resolve(LmMsg.showOccurrenceDeleteMessage,[appt.name]);
		this._getInstanceSeriesDialog(m, LmAppt.MODE_DELETE);
		this._showSingleInstanceDialog.popup();
		this._showSingleInstanceDialog.__appt = appt;
	} else {
		this._continueDelete(appt, LmAppt.MODE_DELETE);
	}
};

LmCalViewController.prototype._continueDelete = function (appt, mode){ 
	try {
		appt.cancel(this._appCtxt.getAppController(), mode);
	} catch (ex) {
		var params = [appt, mode];
		this._handleException(ex, this._continueDelete, params, false);		
	}
};

LmCalViewController.prototype._getInstanceSeriesDialog = function (message, mode) {
	var t = (mode == LmAppt.MODE_DELETE)? LmMsg.deleteRecurringItem: LmMsg.openRecurringItem;
	if (this._rView == null) {
		this._recInstance = {message:message, operation:mode, title: t};
		this._rView = new LmEditInstanceSeriesView(this._shell, this._recInstance);
		this._showSingleInstanceDialog = new DwtBaseDialog (this._shell, null, t, null, null, null, this._rView);
															//this._rView.getDragHandleId());
		this._rView.addListener(DwtEvent.BUTTON_PRESSED,
								new LsListener(this, this._handleSingleInstanceButton));
	} else {
		this._recInstance.message = message;
		this._recInstance.operation = mode;
		this._recInstance.title = t;
		this._rView.setData(this._recInstance);
	}

	return this._showSingleInstanceDialog;
};

LmCalViewController.prototype.newAppointment = function (optionalStartDate) {
	// Create a new appointment
	optionalStartDate = (optionalStartDate != null)? optionalStartDate: ((this._viewMgr != null)? this._viewMgr.getDate(): null);
	this._getAppointmentDialog();
	this._apptDialog.setTitle(LmMsg.appointmentNewTitle);
	this._popupAppointmentDialog(null, optionalStartDate, LmAppt.MODE_NEW);
};

LmCalViewController.prototype.editRecurringAppointment = function (appt, optionalStartDate) {
	var m = LsStringUtil.resolve(LmMsg.showOccurrenceMessage,[appt.name]);
	this._getInstanceSeriesDialog(m, LmAppt.MODE_EDIT);
	this._showSingleInstanceDialog.__appt = appt;
	this._showSingleInstanceDialog.__osd = optionalStartDate;
	this._showSingleInstanceDialog.popup();
};

LmCalViewController.prototype.editSimpleAppointment = function (appt, optionalStartDate) {

};

LmCalViewController.prototype._showAppointmentDetails =
function (appt, point, optionalStartDate){
	var appModels = this._appCtxt.getAppController()._models;
	var arr = appModels.getArray();
	var mailList = null;
	for (var i = 0 ; i < arr.length; ++i) {
		if (arr[i] instanceof LmMailList) {
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
				this.editAppointment(appt, optionalStartDate, LmAppt.MODE_EDIT);
			}
		} else {
			this.newAppointment(optionalStartDate);
		}
	} catch (ex) {
		var params = [appt, point];
		this._handleException(ex, this._showAppointmentDetails, params, false);
	}
};

LmCalViewController.prototype._handleSingleInstanceButton = function (event) {
	// find out what button was pushed.
	var btn = event.item;
	btn._setMouseOutClassName();
	var text = btn.getText();
	var appt = this._showSingleInstanceDialog.__appt;
	delete this._showSingleInstanceDialog.__appt;
	var optionalStartDate = this._showSingleInstanceDialog.__osd;
	delete this._showSingleInstanceDialog.__osd;
	if (text == LmMsg.openSeries){
		this.editAppointment(appt, optionalStartDate, LmAppt.MODE_EDIT_SERIES);
	} else if (text == LmMsg.openInstance){
		this.editAppointment(appt, optionalStartDate, LmAppt.MODE_EDIT_SINGLE_INSTANCE);
	} else if (text == LmMsg.deleteInstance){
		this._continueDelete(appt, LmAppt.MODE_DELETE_INSTANCE);
	} else if (text == LmMsg.deleteSeries) {
		this._continueDelete(appt, LmAppt.MODE_DELETE_SERIES);
	} else if (text == LmMsg.cancel){
		// nothing
	}
	this._showSingleInstanceDialog.popdown();
};

LmCalViewController.prototype.editAppointment = function (appt, optionalStartDate, mode) {
	this._getAppointmentDialog();
	this._apptDialog.setTitle(LmMsg.appointmentEditTitle);
	this._popupAppointmentDialog(appt, optionalStartDate, mode);
};

LmCalViewController.prototype._popupAppointmentDialog = function (appt, optionalStartDate, mode) {
	this._apptView.showDetail(appt, optionalStartDate, mode);
	this._apptDialog.popup();
	if (appt && !appt.isOrganizer()) {
		this._apptDialog.setButtonEnabled(DwtDialog.OK_BUTTON, false);
	}
};

LmCalViewController.prototype._apptEnterKeyHandler = function (event) {
	if (this._apptDialog.getButtonEnabled(DwtDialog.OK_BUTTON)){
		this._saveAppointment(event);
	}
};
LmCalViewController.prototype._saveAppointment = function (event) {
	try{
		if (!this._savingAppointment) {
			this._savingAppointment = true;
			// submit attachments if there are any.
			if (this._apptView.hasAttachments()){
				var sCb = new LsCallback(this, this._continueSave);
				var fCb = new LsCallback(this, this._attachmentUploadFailed);
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

LmCalViewController.prototype._continueSave = function (args) {
	try{
		// get the attachment id from the arguments
		var attId = args[1];

		// get the appointment from the appointmentView,
		var appt = this._apptView.getAppt();
		var editMode = appt.getViewMode();

		// save it to the server
		appt.save(this._appCtxt.getAppController(), attId);
		if (this._list != null) {
			if (editMode != LmAppt.MODE_NEW) {
				this._list.replace(this._apptIndexShowing, appt);
			} else {
				this._list.add(appt);
			}
		}
		this._apptDialog.popdown();
	} catch (ex) {
		this._handleException(ex, this._saveAppointment, args, false);
	} finally {
		this._savingAppointment = false;
	}
};

LmCalViewController.prototype._cancelAppointmentSave = function (event) {
	this._apptDialog.popdown();
};

LmCalViewController.prototype._miniCalDateRangeListener =
function(ev) {
	//this._schedule(this._doPopulateMiniCal, {view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});
	this._doPopulateMiniCal({view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});	
}

LmCalViewController.prototype._doPopulateMiniCal =
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

LmCalViewController.prototype.getDayToolTipText =
function(date)
{
	try {
		var start = new Date(date);
		start.setHours(0, 0, 0, 0);
		var end = new Date(start);
		end.setDate(start.getDate()+1);
		var result = this.getApptSummaries(start.getTime(), end.getTime(), true);
		return LmCalMonthView.getDayToolTipText(start,result);
	} catch (ex) {
		//alert(ex);
		return "<b>error getting summary</b>";
	}
}

LmCalViewController.prototype._dateRangeListener =
function(ev) {
	//this._schedule(this._doPopulateView, {view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});
	this._doPopulateView({view : ev.item, startTime: ev.start.getTime(), endTime: ev.end.getTime()});	
}

LmCalViewController.prototype._doPopulateView =
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
LmCalViewController.prototype._getActionMenuOps =
function() {
	var list = this._contactOps();
	list.push(LmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
}
*/

LmCalViewController.prototype._getViewType = 
function() {
	return LmController.CAL_VIEW;
}

LmCalViewController.prototype.setCurrentView = 
function(view) {
	// do nothing
}

LmCalViewController.prototype._resetNavToolBarButtons = 
function(view) {
	this._navToolBar.enable([LmOperation.PAGE_BACK, LmOperation.PAGE_FORWARD], true);
}

LmCalViewController.prototype._resetOperations = 
function(parent, num) {
	LmListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		parent.enable([LmOperation.TODAY, LmOperation.WEEK_VIEW, LmOperation.MONTH_VIEW, LmOperation.WORK_WEEK_VIEW, LmOperation.DAY_VIEW], true);
	}
}

LmCalViewController.prototype._listSelectionListener = 
function(ev) {
	LmListController.prototype._listSelectionListener.call(this, ev);
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

LmCalViewController.prototype._handleApptRespondAction = function (ev){
	var appt = this._listView[this._currentView].getSelection()[0];
	var msgController = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getMsgController();
	ev._inviteReplyType = ev.item.getData(LmOperation.KEY_ID);;
	ev._inviteComponentId = null;
	appt.getDetails();
	msgController.setMsg(appt.getMessage());
	// poke the handler for inviteReply events
	msgController._inviteReplyListener.handleEvent(ev);
};

/**
 * Overrides LmListController.prototype._initializeActionMenu
 */
LmCalViewController.prototype._initializeActionMenu = function (){
	if (this._actionMenu) return;

	var menuItems = this._getActionMenuOps();
	if (!menuItems) return;
	this._actionMenu = new LmActionMenu(this._shell, menuItems);
	for (var i = 0; i < menuItems.length; i++){
		if (menuItems[i] > 0) {
			this._actionMenu.addSelectionListener(menuItems[i],this._listeners[menuItems[i]]);
		}
	}
	this._actionMenu.addPopdownListener(this._popdownListener);
};

/**
 * Overrides LmListController.prototype._getActionMenuOptions
 */
LmCalViewController.prototype._getActionMenuOps = function () {
	return [LmOperation.DELETE, LmOperation.SEP,LmOperation.REPLY_ACCEPT, LmOperation.REPLY_DECLINE, LmOperation.REPLY_TENTATIVE]
};

LmCalViewController.prototype._listActionListener = function (ev){
	this._actionMenu.popup(0, ev.docX, ev.docY);
	LmListController.prototype._listActionListener.call(this, ev);
};

LmCalViewController.prototype.sendRequest = function (soapDoc, useXml) {
	try {
		return this._appCtxt.getAppController().sendRequest(soapDoc, useXml);
	} catch (ex) {
		// do nothing
		return null;
	}
}

LmCalViewController.prototype._getCachedVector =
function(startTime, endTime, fanoutAllDay)
{
	var cacheKey = startTime+":"+endTime+":"+fanoutAllDay;
	var result  = this._cachedApptVectors[cacheKey];
	if (result != null) return result.clone();
	else return null;
}

LmCalViewController.prototype._findCachedApptSummaries =
function(start,end) {
	var found = false;
	var entry = this._cachedApptSummaries[start+":"+end];
	if (entry != null) return entry;

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

LmCalViewController.CACHING_ENABLED = true;

LmCalViewController.prototype.resetApptSummaryCache =
function() {
	this._cachedApptSummaries = {};
	this._cachedApptVectors = {};	
	this._cachedIds = {};		
}

LmCalViewController.prototype._updateCachedIds =
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
LmCalViewController.prototype.getApptSummaries =
function(start,end, fanoutAllDay) {
	var list;
	
	if (LmCalViewController.CACHING_ENABLED) {
		list = this._getCachedVector(start, end, fanoutAllDay);
		if (list != null) return list; // already cloned
		var apptList = this._findCachedApptSummaries(start,end);
		if (apptList != null) {
			list = LmApptList.toVector(apptList, start, end, fanoutAllDay);			
			this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;
			return list.clone();
		}
	}

	apptList = new LmApptList(this._shell.getData(LmAppCtxt.LABEL));
	var soapDoc = LsSoapDoc.create("GetApptSummariesRequest", "urn:liquidMail");
	var method = soapDoc.getMethod();
	method.setAttribute("s", start);
	method.setAttribute("e", end);
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	apptList.loadFromSummaryJs(resp.GetApptSummariesResponse);
	
	if (LmCalViewController.CACHING_ENABLED)
		this._updateCachedIds(apptList);
	
	// cache it 
	if (LmCalViewController.CACHING_ENABLED)
		this._cachedApptSummaries[start+":"+end] = {start: start, end:end, list: apptList};	
	list = LmApptList.toVector(apptList, start, end, fanoutAllDay);	
	if (LmCalViewController.CACHING_ENABLED)	
		this._cachedApptVectors[start+":"+end+":"+fanoutAllDay] = list;
	
	return list.clone();
}

LmCalViewController.prototype.notifyCreate =
function(msg) {
	//DBG.println("LmCalViewController: notifyCreate!");
	if (!this._clearCache) {
		this._clearCache = true;
	}
}

LmCalViewController.prototype.notifyDelete =
function(ids) {
	//DBG.println("LmCalViewController: notifyDelete!");
	if (this._cacheCleared) return;
	// if any of the ids ire in the cache then...	
	for (var i=0; i < ids.length; i++) {
		if (this._cachedIds[ids[i]]) {
			this._clearCache = true;
			return;
		}
	}
}

LmCalViewController.prototype.notifyModify =
function(ids) {
	//DBG.println("LmCalViewController: notifyModify!");
	if (this._cacheCleared) return;
	// if any of the ids ire in the cache then...	
	for (var i=0; i < ids.length; i++) {
		if (this._cachedIds[ids[i]]) {
			this._clearCache = true;
			return;
		}
	}
}

LmCalViewController.prototype.notifyComplete =
function(ids) {
	//DBG.println("LmCalViewController: notifyComplete!");
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

LmCalViewController.prototype.refreshMiniCalendar =
function() {
	var cal = this._miniCalendar;
	var calRange = cal.getDateRange();
	var params = {startTime:calRange.start.getTime(), endTime: calRange.end.getTime(), view: cal};
	this._doPopulateMiniCal(params);
}

LmCalViewController.prototype.refreshView = 
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
