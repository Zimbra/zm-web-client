/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmTaskAssistant = function() {
	ZmAssistant.call(this, ZmMsg.createNewTask, ZmMsg.ASST_CMD_TASK, ZmMsg.ASST_CMD_SUM_TASK);
};

ZmTaskAssistant.prototype = new ZmAssistant();
ZmTaskAssistant.prototype.constructor = ZmTaskAssistant;

ZmTaskAssistant.prototype.initialize =
function(dialog) {
	ZmAssistant.prototype.initialize.call(this, dialog);
	this._taskData = {};
};

ZmTaskAssistant.prototype.okHandler =
function(dialog) {
	if (!this._taskData.subject) {
		dialog.messageDialog(ZmMsg.errorMissingSubject, DwtMessageDialog.CRITICAL_STYLE);
	} else {
		var task = this.getTask();
		task.save();// TODO: callback, etc.
		return true;
	}
};

ZmTaskAssistant.prototype.extraButtonHandler =
function(dialog) {
	var app = appCtxt.getApp(ZmApp.TASKS);
	var tc = app.getTaskController();
	tc.show(this.getTask(), ZmCalItem.MODE_NEW_FROM_QUICKADD);
	return true;
};

ZmTaskAssistant.prototype.getHelp =
function() {
	return ZmMsg.ASST_TASK_HELP;
};

ZmTaskAssistant.prototype.getTask =
function() {
	var task = new ZmTask();
	if (this._taskData.startDate) task.setStartDate(this._taskData.startDate);
	if (this._taskData.endDate) task.setEndDate(this._taskData.endDate);
	task.setAllDayEvent(true);

	if (this._taskData.location) task.location = this._taskData.location;
	if (this._taskData.notes) task.setTextNotes(this._taskData.notes);
	if (this._taskData.subject) task.setName(this._taskData.subject);
	return task;
};

/**
 *
 * (...)                 matched as notes, stripped out
 * [...]                 matched as location, stripped out
 * {date-spec}           first matched pattern is "start date", second is "end date"
 * subject "..."         explicit subject
 *
 * everything renaming is the subject, unless subject was explicit
 *
 * example:
 *
 * lunch 12:30 PM next friday with satish (to discuss future release) [CPK, Palo Alto]
 *
 * "12:30 PM" matched as a time, saved as "start time" *
 * "next friday" matches a date, so is stripped out and saved as "start date"
 * (...) matched as notes, stripped out and saved as "notes"
 * [...] matched as location
 *
 * everything left "lunch with satish" is taken as subject
 *
 */
ZmTaskAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true, false);
	dialog._setExtraButton(ZmMsg.moreDetails, true, true, false);

	var tdata = this._taskData = {};

	tdata.startDate = new Date();
	tdata.endDate = null;

	var match;

	match = args.match(/\s*\"([^\"]*)\"?\s*/);
	if (match) {
		tdata.subject = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*\[([^\]]*)\]?\s*/);
	if (match) {
		tdata.location = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*\(([^)]*)\)?\s*/);
	if (match) {
		tdata.notes = match[1];
		args = args.replace(match[0], " ");
	}

	// look for start date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		tdata.startDate = match.context.date;
		if (tdata.startTime) tdata.startDate.setHours(tdata.startTime.hour, tdata.startTime.minute);
	}

	// look for end date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		tdata.endDate = match.context.date;
		if (tdata.endTime != null) tdata.endDate.setHours(tdata.endTime.hour, tdata.endTime.minute);
		else if (tdata.startTime != null) tdata.endDate.setHours(tdata.startTime.hour, tdata.startTime.minute);
	} else {
		if (tdata.endTime) {
			tdata.endDate = new Date(tdata.startDate.getTime());
			if (tdata.endTime != null) tdata.endDate.setHours(tdata.endTime.hour, tdata.endTime.minute);
		} else if (tdata.startTime) {
			tdata.endDate = new Date(tdata.startDate.getTime() + 1000 * 60 * 60);
		}
	}

	if (tdata.subject == null) {
		tdata.subject = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' ');
	}

	var subStr = AjxStringUtil.convertToHtml(tdata.subject == "" ? ZmMsg.ASST_APPT_subject : tdata.subject);
	var locStr = AjxStringUtil.convertToHtml(tdata.location == null ? ZmMsg.ASST_APPT_location : tdata.location);
	var notesStr = AjxStringUtil.convertToHtml(tdata.notes == null ? ZmMsg.ASST_APPT_notes : tdata.notes);
	var subjectIndex = this._setField("* "+ZmMsg.subject, subStr, tdata.subject == "", false);
	this._setDateFields(tdata.startDate, tdata.endDate, subjectIndex);
	this._setField(ZmMsg.location, locStr, tdata.location == null, false);
	this._setField(ZmMsg.notes, notesStr, tdata.notes == null, false);
};

ZmTaskAssistant.prototype._setDateFields =
function(startDate, endDate, rowIndex) {
	var startDateValue = DwtCalendar.getDateFullFormatter().format(startDate);
	var sameDay = false;
	var html = new AjxBuffer();
	html.append("<table border=0 cellpadding=0 cellspacing=0>");
	html.append("<tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(startDateValue), "</td>");
	html.append("</tr></table>");
	var doEnd = (endDate && !sameDay);

	if (doEnd) {
		this._clearField(ZmMsg.time);
		rowIndex = this._setField(ZmMsg.startTime, html.toString(), false, false, rowIndex+1);

		html.clear();
		var endDateValue = DwtCalendar.getDateFullFormatter().format(endDate);
			html.append("<table border=0 cellpadding=0 cellspacing=0>");
		html.append("<tr>");
		html.append("<td>", AjxStringUtil.htmlEncode(endDateValue), "</td>");
		html.append("</tr></table>");
	} else {
		this._setField(ZmMsg.time, html.toString(), false, false, rowIndex+1);
		this._clearField(ZmMsg.startTime);
		this._clearField(ZmMsg.endTime);
	}
};