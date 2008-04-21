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

ZmCalendarAssistant = function() {
	ZmAssistant.call(this, ZmMsg.openCalendar, ZmMsg.ASST_CMD_CALENDAR, ZmMsg.ASST_CMD_SUM_CALENDAR);
};

ZmCalendarAssistant.prototype = new ZmAssistant();
ZmCalendarAssistant.prototype.constructor = ZmCalendarAssistant;

ZmCalendarAssistant.prototype.okHandler =
function(dialog) {
	var calApp = appCtxt.getApp(ZmApp.CALENDAR);
	//calApp.activate(true, this._view, this._startDate);	
	var cc = calApp.getCalController();
	cc.setDate(this._startDate);
	// need to call twice due to cal view controller bug
	cc.show(this._view);
	cc.show(this._view);	
	return true;
};

ZmCalendarAssistant.prototype.getHelp =
function() {
	return ZmMsg.ASST_CALENDAR_HELP;
};

ZmCalendarAssistant.prototype.handle =
function(dialog, verb, args) {
	
	this._startDate = null;
	// look for start date
	var match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		this._startDate = match.context.date;
		//if (startTime) startDate.setHours(startTime.hour, startTime.minute);
	}

	match = args.match(RegExp("\\b("
								+ZmMsg.viewCalForDay+"|"
								+ZmMsg.viewCalForWeek+"|"
								+ZmMsg.viewCalForWorkWeek+"|"
								+ZmMsg.viewCalForMonth+")\\b"));
	var view = (match) ? match[1] : null;
	var icon;
	switch (view) {
	case ZmMsg.viewCalForDay:
		icon = 'DayView';
		this._view = ZmController.CAL_DAY_VIEW;
		view = ZmMsg.viewDay;
		break;
	case ZmMsg.viewCalForWeek:
		icon = 'WeekView';
		this._view = ZmController.CAL_WEEK_VIEW;
		view = ZmMsg.viewWeek;
		break;
	case ZmMsg.viewCalForWorkWeek:
		icon = 'WorkWeekView';
		this._view = ZmController.CAL_WORK_WEEK_VIEW;
		view = ZmMsg.viewWorkWeek;
		break;
	case ZmMsg.viewCalForMonth:
		icon = 'MonthView';
		this._view = ZmController.CAL_MONTH_VIEW;
		view = ZmMsg.viewMonth;
		break;
	default:
		icon = "CalendarApp";
		this._view = null;
	}

	dialog._setOkButton(AjxMsg.ok, true, true); //, true, icon);
	
	if (this._startDate == null) this._startDate = new Date();
	var startDateValue = DwtCalendar.getDateFullFormatter().format(this._startDate);

	this._setField(ZmMsg.goToDate, startDateValue, false, true);
	this._setField(ZmMsg.view, view == null ? ZmMsg.calAssistDefaultView : view, view == null, true);
};
