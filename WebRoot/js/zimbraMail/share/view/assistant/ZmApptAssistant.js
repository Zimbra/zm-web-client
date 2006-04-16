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
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmApptAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt);	
};

ZmApptAssistant.prototype = new ZmAssistant();
ZmApptAssistant.prototype.constructor = ZmAssistant;

ZmApptAssistant.prototype.initialize =
function(dialog) {
	ZmAssistant.prototype.initialize.call(this, dialog);
	this._apptData = {};
};

ZmApptAssistant.prototype.okHandler =
function(dialog) {
	if (!this._apptData.subject) {
		this._msgDialog.reset();
		this._msgDialog.setMessage(ZmMsg.errorMissingSubject, DwtMessageDialog.CRITICAL_STYLE);
		this._msgDialog.popup();
	} else {
		var appt = this.getAppt();
		appt.save();			
	}
	return true;
};

ZmApptAssistant.prototype.extraButtonHandler =
function(dialog) {
	var calApp = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
	var cc = calApp.getCalController();
	cc.newAppointment(this.getAppt(), ZmAppt.MODE_NEW_FROM_QUICKADD, true); // dirty bit
	return true;
};

ZmApptAssistant.prototype.getAppt =
function() {
	var appt = new ZmAppt(this._appCtxt);
	appt.setStartDate(this._apptData.startDate);
	appt.setEndDate(this._apptData.endDate ? this._apptData.endDate : this._apptData.startDate);
	appt.setAllDayEvent(this._apptData.startTime == null);

	if (this._apptData.location) appt.setAttendees(ZmEmailAddress.split(this._apptData.location), ZmAppt.LOCATION);
	if (this._apptData.notes) appt.setTextNotes(this._apptData.notes);
	if (this._apptData.subject) appt.setName(this._apptData.subject);
	return appt;
};

/**
 * 
 * (...)                 matched as notes, stripped out
 * [...]                 matched as location, stripped out
 * {date-spec}           first matched pattern is "start date", second is "end date"
 * {time-spec}           first matched pattern is "start time", second is "end time"
 * repat {repeat-spec}   recurrence rule
 * calendar {cal-name}   calendar to add appt to
 * invite {e1,e2,e3}     email addresses to invite (ideally would auto-complete)
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
ZmApptAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(ZmMsg.createNewAppt, true, true, true, "NewAppointment");
	dialog._setExtraButton(ZmMsg.moreDetails, true, true, false);
	
	var adata = this._apptData = {};
	
	adata.startDate = new Date();
	adata.endDate = null;

	var match;

	match = args.match(/\s*\[([^\]]*)\]?\s*/);	
	if (match) {
		adata.location = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*\(([^)]*)\)?\s*/);
	if (match) {
		adata.notes = match[1];
		args = args.replace(match[0], " ");
	}

	adata.startDate.setMinutes(0);
	adata.startTime = this._matchTime(args);
	if (adata.startTime) {
		adata.startDate.setHours(adata.startTime.hour, adata.startTime.minute);
		args = adata.startTime.args;
	}

	// look for an end time
	adata.endTime = this._matchTime(args);
	if (adata.endTime) {
		args = adata.endTime.args;
	}

	// look for start date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		adata.startDate = match.context.date;
		if (adata.startTime) adata.startDate.setHours(adata.startTime.hour, adata.startTime.minute);
	}
	
	// look for end date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		adata.endDate = match.context.date;
		if (adata.endTime != null) adata.endDate.setHours(adata.endTime.hour, adata.endTime.minute);
		else if (adata.startTime != null) adata.endDate.setHours(adata.startTime.hour, adata.startTime.minute);
	} else {
		if (adata.endTime) {
			adata.endDate = new Date(adata.startDate.getTime());
			if (adata.endTime != null) adata.endDate.setHours(adata.endTime.hour, adata.endTime.minute);			
		} else if (adata.startTime) {
			adata.endDate = new Date(adata.startDate.getTime() + 1000 * 60 * 60);
		}
	}
	
	match = args.match(/\s*\"([^\"]*)\"?\s*/);
	if (match) {
		adata.subject = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*repeats?\s+(\S+)\s*/);	
	if (match) {
		adata.repeat = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*invite\s+(\S+)\s*/);
	if (match) {
		args = args.replace(match[0], " ");
	}

	if (adata.subject == null) {
		adata.subject = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' ');
	}

	dialog._setOkButton(null, true, adata.subject != null && adata.subject != "");
	
	var subStr = AjxStringUtil.convertToHtml(adata.subject == "" ? ZmMsg.ASST_APPT_subject : adata.subject);
	var locStr = AjxStringUtil.convertToHtml(adata.location == null ? ZmMsg.ASST_APPT_location : adata.location);
	var notesStr = AjxStringUtil.convertToHtml(adata.notes == null ? ZmMsg.ASST_APPT_notes : adata.notes);
	this._setField("* "+ZmMsg.subject, subStr, adata.subject == "", false);
	this._setDateFields(adata.startDate, adata.startTime, adata.endDate, adata.endTime);
	this._setField(ZmMsg.location, locStr, adata.location == null, false);	
	this._setField(ZmMsg.notes, notesStr, adata.notes == null, false);

	var cc = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getCalController();
	var agenda = cc.getDayToolTipText(adata.startDate, true);
	this._setField(ZmMsg.agenda, agenda, false, false);
	//this._setOptField(ZmMsg.repeat, repeat, false, true);
	return;
};

ZmApptAssistant.prototype._setDateFields = 
function(startDate, startTime, endDate, endTime) {
	var startDateValue = DwtCalendar.getDateFullFormatter().format(startDate);
	var sameDay = false;
	var html = new AjxBuffer();
	html.append("<table border=0 cellpadding=0 cellspacing=0>");
	html.append("<tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(startDateValue), "</td>");
	if (startTime) {
		var startTimeValue = AjxDateUtil.computeTimeString(startDate);
		html.append("<td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
		html.append("<td>", AjxStringUtil.htmlEncode(startTimeValue), "</td>");
		sameDay = endDate && endDate.getFullYear() == startDate.getFullYear() && 
			endDate.getMonth() == startDate.getMonth() && endDate.getDate() == startDate.getDate();
		if (sameDay) {
			var endTimeValue = AjxDateUtil.computeTimeString(endDate);
			html.append("<td>&nbsp;-&nbsp;</td>");
			html.append("<td>", AjxStringUtil.htmlEncode(endTimeValue), "</td>");
		}
	}
	html.append("</tr></table>");	
	var doEnd = (endDate && !sameDay);
	
	if (doEnd) {
		this._clearField(ZmMsg.time);
		this._setField(ZmMsg.startTime, html.toString(), false, false, ZmMsg.subject);
		
		html.clear();
		var endDateValue = DwtCalendar.getDateFullFormatter().format(endDate);
			html.append("<table border=0 cellpadding=0 cellspacing=0>");		
		html.append("<tr>");
		html.append("<td>", AjxStringUtil.htmlEncode(endDateValue), "</td>");
		if (startTime) { // display end time if a startTime was specified
			var endTimeValue = AjxDateUtil.computeTimeString(endDate);
			html.append("<td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
			html.append("<td>", AjxStringUtil.htmlEncode(endTimeValue), "</td>");
		}
		html.append("</tr></table>");
		this._setField(ZmMsg.endTime, html.toString(), false, false, ZmMsg.startTime);
		
	} else {
		this._setField(ZmMsg.time, html.toString(), false, false, ZmMsg.subject);
		this._clearField(ZmMsg.startTime);
		this._clearField(ZmMsg.endTime);		
	}
};