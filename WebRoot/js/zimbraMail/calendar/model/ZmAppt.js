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



function ZmAppt(appCtxt, list, noinit) {
	ZmItem.call(this, appCtxt, ZmItem.APPT, list);

	if (noinit) return;

	this._evt = new ZmEvent(ZmEvent.S_APPT);
	this.id = -1;
	this.uid = -1;
	this.type = null;
	this.name = "";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + (30*60*1000));
	this.transparency = "FR";
	this.allDayEvent = '0';
	this.exception = false;
	this.recurring = false;
	this.alarm = false;
	this.otherAttendees = false;
	this.location = "";
	this.notes = "";
	this.repeatType = "NON"; // This maps to frequency in the createAppt call.
	this.repeatCustom = '0';  // 1|0
	this.repeatCustomCount = 1; // ival
	this.repeatCustomType = 'S'; // (S)pecific, (O)rdinal
	this.repeatCustomOrdinal = "1";
	this.repeatCustomDayOfWeek = "SU"; //(DAY|WEEKDAY|WEEKEND)|((SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY))
	this.repeatCustomMonthDay = this.startDate.getDate();
	this.repeatWeeklyDays = null; //SU|MO|TU|WE|TH|FR|SA
	this.repeatMonthlyDayList = null;
	this.repeatYearlyMonthsList = '1';
	this.repeatEnd = null;
	this.repeatEndDate = null; // maps to until
	this.repeatEndCount = 1; // this will map count ( when there is no end date specified )
	this.repeatEndType = 'N';
	this.attachments = null;
	this.timezone = ZmTimezones.getDefault();
	this._viewMode = ZmAppt.MODE_NEW;
}

ZmAppt.prototype = new ZmItem;
ZmAppt.prototype.constructor = ZmAppt;

ZmAppt.MODE_NEW = 1;
ZmAppt.MODE_EDIT = 2;
ZmAppt.MODE_EDIT_SINGLE_INSTANCE = 3;
ZmAppt.MODE_EDIT_SERIES = 4;
ZmAppt.MODE_DELETE = 5;
ZmAppt.MODE_DELETE_INSTANCE = 6;
ZmAppt.MODE_DELETE_SERIES = 7;

ZmAppt.EDIT_NO_REPEAT = 1;
ZmAppt.EDIT_TIME = 2;
ZmAppt.EDIT_TIME_REPEAT = 3;

ZmAppt.SOAP_METHOD_REQUEST = 1;
ZmAppt.SOAP_METHOD_REPLY = 2;
ZmAppt.SOAP_METHOD_CANCEL = 3;

ZmAppt.ATTENDEES_SEPARATOR_REGEX = /[;,]/;
ZmAppt.ATTENDEES_SEPARATOR_AND_SPACE = "; ";

ZmAppt.STATUS_TENTATIVE = "TENT";
ZmAppt.STATUS_CONFIRMED = "CONF";
ZmAppt.STATUS_CANCELLED = "CANC";

ZmAppt.PSTATUS_NEEDS_ACTION = "NE";
ZmAppt.PSTATUS_TENTATIVE = "TE";
ZmAppt.PSTATUS_ACCEPT = "AC";
ZmAppt.PSTATUS_DECLINED = "DE";
ZmAppt.PSTATUS_DELEGATED = "DG";

ZmAppt.FREQ_TO_DISPLAY = {
	SEC: ["second", "seconds"],
	HOU: ["hour" , "hours"],
	DAI: ["day" , "days"],
	WEE: ["week" , "weeks"],
	MON: ["month" , "months"],
	YEA: ["year" , "years"]
};

ZmAppt.SERVER_DAYS_TO_DISPLAY = {
	SU: "Sunday",
	MO: "Monday",
	TU: "Tuesday",
	WE: "Wednesday",
	TH: "Thursday",
	FR: "Friday",
	SAT: "Saturday"
};

ZmAppt.SERVER_WEEK_DAYS = ["SU","MO","TU", "WE", "TH", "FR", "SA","SU"];

ZmAppt.NOTES_SEPARATOR = "\n\n*~*~*~*~*~*~*~*~*~*\n\n";
ZmAppt.NOTES_SEPARATOR_REGEX = /\s*\*~\*~\*~\*~\*~\*~\*~\*~\*~\*\s*/;

ZmAppt.prototype.toString = 
function() {
	return "ZmAppt: name="+this.name+" sd="+this.getStartDate()+" ed="+this.getEndDate()+" id=" + this.id;
}

/**
 * This method sets the view mode, and resets any other fields
 * that should not be set for that view mode.
 */
ZmAppt.prototype.setViewMode = function (mode){
	this._viewMode = (mode != null)? mode: ZmAppt.MODE_NEW;
	switch (this._viewMode) {
	case ZmAppt.MODE_NEW:
		break;
	case ZmAppt.MODE_EDIT:
		break;
	case ZmAppt.MODE_EDIT_SINGLE_INSTANCE:
		this.repeatType = "NON";
		break;
	case ZmAppt.MODE_EDIT_SERIES:
		break;
	case ZmAppt.MODE_DELETE:
		break;
	case ZmAppt.MODE_DELETE_INSTANCE:
		break;
	case ZmAppt.MODE_DELETE_SERIES:
		break;
	}
};

ZmAppt.prototype.getViewMode = function () {
	return this._viewMode;
};

ZmAppt.prototype.getStatus = function () {
	return this.status;
};

ZmAppt.prototype.getStatusString = function () {
	return ZmAppt._statusString[this.status];
};

ZmAppt._statusString = {
	TE: ZmMsg.tentative,
	CONF: ZmMsg.confirmed,
	CANC: ZmMsg.cancelled
}

ZmAppt.prototype.getParticipationStatus = function () {
	return this.ptst;
};

ZmAppt._pstatusString = {
	NE: "Undecided",	//	ZmMsg.needsAction,		// HACK: i18n
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
}

ZmAppt.prototype.getParticipationStatusString = function () {
	return ZmAppt._pstatusString[this.ptst];
};

ZmApptClone = function() { }

ZmAppt.quickClone = function (appt) {
	//return appt.clone();
	ZmApptClone.prototype = appt;
	var newAppt = new ZmApptClone();
	// make our own copy
	newAppt.startDate = new Date(appt.startDate.getTime());
	newAppt.endDate = new Date(appt.endDate.getTime());
	return newAppt;
}

ZmAppt.prototype.clone = function () {
	var newAppt = new ZmAppt(this._appCtxt, this.list, true);
	var key = null;
	for (key in this) {
		if (typeof (this[key] != 'function') &&
			key != 'prototype'){
			if (AjxUtil.isDate(this[key])){
				newAppt[key] = new Date(this[key].getTime());
			} else {
				newAppt[key] = this[key];
			}
		}
	}
	newAppt._resetCached();	
	return newAppt;
};

// Class methods

/**
* Compares two appts. sort by (starting date, duration)
* sort methods.
*
* @param a		an appt
* @param b		an appt
*/
ZmAppt.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime())  return 1;
	if (a.getStartTime() < b.getStartTime())  return -1;
	if (a.getDuration() < b.getDuration())	 return 1;
	if (a.getDuration() > b.getDuration())	 return -1;
	return 0;
}

// Public methods

/*
 * mail item id on appt instance
 */
ZmAppt.prototype.getId =
function() {
	return this.id;
}

/*
 * default mail item invite id on appt instance
 */
ZmAppt.prototype.getInvId =
function() {
	return this.invId;
}

/*
 * return unique (across recurrance) id, by using getUid()+"/"+getStartTime()
 */
ZmAppt.prototype.getUniqueId =
function() {
	return this.id+"_"+this._uniqStartTime;
}

/**
 * returns the unique start time for an instance of a recurring appointment.
 */
ZmAppt.prototype.getUniqueStartTime =
function () {
	return this._uniqStartTime;
};

/*
 * iCal uid of appt
 */
ZmAppt.prototype.getUid =
function() {
	return this.uid;
}

ZmAppt.prototype.setType =
function(newType) {
	this.type = newType;
}

/*
 * type of appt (event|todo)
 */
ZmAppt.prototype.getType =
function() {
	return this.type;
}

ZmAppt.prototype.setName =
function(newName) {
	this.name = newName;
}
/*
 * name (aka Subject) of appt
 */
ZmAppt.prototype.getName =
function() {
	return this.name;
}

/*
 * duration in milliseconds
 */
ZmAppt.prototype.getDuration =
function() {
	return this.getEndTime() - this.getStartTime();
}

ZmAppt.prototype.getOrigStartDate = 
function () {
	return (this._origStartDate != null)? this._origStartDate: this.startDate;
};

ZmAppt.prototype.getOrigStartTime =
function () {
	return this.getOrigStartDate().getTime();
};

ZmAppt.prototype.setStartDate =
function(startDate) {
	if (this._origStartDate == null && this.startDate != null) {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate);
	this._resetCached();
}
ZmAppt.prototype.setEndDate =
function(endDate) {
	this.endDate = new Date(endDate);
	this._resetCached();
}

ZmAppt.prototype.resetRepeatWeeklyDays = function () {
	this.repeatWeeklyDays = [ZmAppt.SERVER_WEEK_DAYS[this.startDate.getDay()]];
};

ZmAppt.prototype.resetRepeatMonthlyDayList = function () {
	this.repeatMonthlyDayList = [this.startDate.getDate()];
};


ZmAppt.prototype._resetCached =
function() {
	delete this._validAttachments;
	delete this.tooltip;
}

/*
 * start time in milliseconds
 */
ZmAppt.prototype.getStartTime =
function() {
	return this.startDate.getTime();
}

ZmAppt.prototype.isOverlapping =
function(other) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();
	
	return (tst < oet) && (tet > ost);
	//return (tst >= ost && tst < oet) || (tet > ost && tet < oet);
}

ZmAppt.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();	
	return (tst < endTime && tet > startTime);
}

/**
 * return true if the start time of this appt is within range
 */
ZmAppt.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
}

/**
 * return true if the end time of this appt is within range
 */
ZmAppt.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
}

/*
 * start time as a date
 */
ZmAppt.prototype.getStartDate =
function() {
	return this.startDate;
}

/*
 * end time in milliseconds
 */
ZmAppt.prototype.getEndTime =
function() {
	return this.endDate.getTime();
}

/*
 * start time as a date
 */
ZmAppt.prototype.getEndDate =
function() {
	return this.endDate;
}



ZmAppt.prototype.setDateRange = function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
	//this._createRangeIfNecessary();
// 	this._rangeObj.startDate.setTime(s.getTime());
// 	this._rangeObj.endDate.setTime(e.getTime());
// 	this.startDate.setTime(s.getTime());
// 	this.endDate.setTime(e.getTime());	
};

ZmAppt.prototype._createRangeIfNecessary = function () {
 	if (this._rangeObj == null) {
		this._rangeObj = new Object();
		this._rangeObj.startDate = new Date();
		this._rangeObj.endDate = new Date();
	}
};

ZmAppt.prototype.getDateRange = function (instance, current, refPath) {
	//this._createRangeIfNecessary();
	return { startDate:this.startDate, endDate: this.endDate };
// 	if (this.startDate.getTime() != this._rangeObj.startDate.getTime()) {
// 		this._rangeObj.startDate.setTime(this.startDate.getTime());
// 	} 
// 	if (this.getEndDate().getTime() != this.$rangeObj.endDate.getTime()) {
// 		this.$rangeObj.endDate.setTime(this.getEndDate().getTime());
// 	}
// 	return this.$rangeObj;
};

/*
 * transparancy (free|busy|oof|tent
 */
ZmAppt.prototype.getTransparency =
function() {
	return this.transparency;
}

/*
 * true if all day event
 */
ZmAppt.prototype.isAllDayEvent =
function() {
	return this.allDayEvent == "1";
}

/*
 * true if startDate and endDate are on different days
 */
ZmAppt.prototype.isMultiDay =
function() {
	var sd = this.getStartDate();
	var ed = this.getEndDate();
	return (sd.getDate() != ed.getDate()) || (sd.getMonth() != ed.getMonth()) || (sd.getFullYear() != ed.getFullYear());
}

/*
 * true if all day event
 */
ZmAppt.prototype.isException =
function() {
	return this.exception;
}

/*
 * true if is recurring
 */
ZmAppt.prototype.isRecurring =
function() {
	return this.recurring;
}

/*
 * true if has alarm
 */
ZmAppt.prototype.hasAlarm =
function() {
	return this.alarm;
}

/*
 * true if other attendees
 */
ZmAppt.prototype.hasOtherAttendees =
function() {
	return this.otherAttendees;
}

ZmAppt.prototype.getLocation =
function() {
	return this.location;
}

ZmAppt.prototype.getNotes = 
function () {
	return this.notes;
};

ZmAppt.prototype.getOrganizer =
function () {
	return ( (this.organizer)? this.organizer: "" );
};

ZmAppt.prototype.isOrganizer = function () {
	return ( (typeof(this.isOrg) === 'undefined') || (this.isOrg == true) );
};

ZmAppt.prototype.getAttendees =
function () {
	return ( (this.attendees)? this.attendees: "");
}

/**
 * accepts a comma delimeted string of ids
 */
ZmAppt.prototype.setAttachments = function (ids){
	if (ids != null && ids.length > 0) {
		var ids = ids.split(',');
		this.attachments = new Array();
		for (var i = 0 ; i < ids.length; ++i){
			this.attachments[i] = {id: ids[i]};
		}
	}
};
// TOOD: i18n
ZmAppt.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	if (this.isAllDayEvent()) {
		if (emptyAllDay)
			return "";
		if (this.isMultiDay()) {
			return this._getTTDay(this.getStartDate()) + " - " + this._getTTDay(this.getEndDate());
		} else {
			return this._getTTDay(this.getStartDate());
		}

	} else {
		if (startOnly) {
			return this._getTTHour(this.getStartDate());
		} else {
			return this._getTTHour(this.getStartDate())+" - "+this._getTTHour(this.getEndDate());
		}			
	}
}

ZmAppt.prototype.getShortStartHour =
function() {
	var d = this.getStartDate();
	var h = d.getHours();
	var m = d.getMinutes();	
	var ampm = h < 12 ? "am" : "pm";
	if (h < 13) {
		if (h == 0)
			h = 12;
	} else {
		h -= 12;
	}

	var ms = m;
	if (m < 10) ms = "0"+ms;
	return h+":"+ms+ampm;
}

ZmAppt.prototype._getTTHour =
function(d) {
	var h = d.getHours();
	var m = d.getMinutes();	
	var ampm = h < 12 ? "am" : "pm";
	if (h < 13) {
		if (h == 0)
			h = 12;
	} else {
		h -= 12;
	}

	//var hs = h;
	//if (h<10) hs = "0"+hs;
	var ms = m;
	if (m < 10) ms = "0"+ms;

	return h+":"+ms+ampm;
}

// TODO: i18n/l10n
ZmAppt.prototype._getTTDay =
function(d) {
	return (d.getMonth()+1)+"/"+d.getDate();
}
/**
* Returns HTML for a tool tip for this appt.
*/
ZmAppt.prototype.getToolTip =
function() {
	// update/null if modified
	if (this._orig) return this._orig.getToolTip();

	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		
		var when = this.getDurationText(false, false);
				
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0>";
		html[idx++] = "<tr valign='center'><td colspan='2' align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black;'>";
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
		html[idx++] = "<tr valign='center'>";
		//html[idx++] = "<td><b>" + AjxStringUtil.htmlEncode(this.getName()) + "</b></td>";
		html[idx++] = "<td><b>";
		
		// IMGHACK - added outer table for new image changes...
		html[idx++] = "<div style='white-space:nowrap'><table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";
		if (this.hasOtherAttendees()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_MEETING) + "</td>";
			
		if (this.isException()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_EXCEPTION) + "</td>";
		else if (this.isRecurring()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_RECUR) + "</td>";
			
//		if (this.hasAlarm()) 
//			html[idx++] = "<td>" + AjxImg.getImageHtml(ZmImg.I_APPT_REMINDER) + "</td>";

		html[idx++] = "</tr></table>";
		
		html[idx++] = "&nbsp;"+AjxStringUtil.htmlEncode(this.getName());
		html[idx++] = "&nbsp;</div></b></td>";		
		html[idx++] = "<td align='right'>";
		html[idx++] = AjxImg.getImageHtml(ZmImg.I_APPT);
		html[idx++] = "</td></table></div></td></tr>";
		//idx = this._addEntryRow("Subject", this.getName(), html, idx);
		//idx = this._addEntryRow(ZmMsg.meetingStatus, this.getStatusString(), html, idx, false);
		if (this.hasOtherAttendees()) {
			idx = this._addEntryRow(ZmMsg.status, this.getParticipationStatusString(), html, idx, false);		
		}
		idx = this._addEntryRow(ZmMsg.when, when, html, idx, false);		
		idx = this._addEntryRow(ZmMsg.location, this.getLocation(), html, idx, false);
		idx = this._addEntryRow(ZmMsg.notes, this.getNotes(), html, idx, true);		

		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
}

// Adds a row to the tool tip.
ZmAppt.prototype._addEntryRow =
function(field, data, html, idx, wrap) {
	if (data != null && data != "") {
		html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b><div style='white-space:nowrap'>";
		html[idx++] = AjxStringUtil.htmlEncode(field) + ":";
		html[idx++] = "</div></b></td><td align='left'><div style='white-space:";
		html[idx++] = wrap ? "wrap'>" : "nowrap'>";
		html[idx++] = AjxStringUtil.htmlEncode(data);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
};

ZmAppt.prototype.hasAttachments = function () {
	return (this.getAttachments() != null);
};

ZmAppt.prototype.getAttachments = function () {
	var m = this.getMessage();	
	if (this.hasDetails() && m._attachments != null) {
		var attachs = m._attachments;
		if (this._validAttachments == null){
			this._validAttachments = new Array();
			for (var i = 0; i < attachs.length; ++i){
				if (m.isRealAttachment(attachs[i])){
					this._validAttachments.push(attachs[i]);
				}
			}
		}
		return (this._validAttachments.length > 0)? this._validAttachments: null;
	}
	return null;
};

ZmAppt.prototype.clearDetailsCache = function () {
	this._message = null;
	// the series message should never change
};

ZmAppt.prototype.getMessage = function () {
	if (this._viewMode == ZmAppt.MODE_EDIT_SERIES) {
		return this._seriesMessage;
	} else {
		return this._message;
	}
};

ZmAppt.prototype.hasDetails = function () {
	var m = this.getMessage();
	return m != null;
};

ZmAppt.prototype.getUniqueStartDate = function () {
	if (this._uniqueStartDate == null) {
		this._uniqueStartDate = new Date(this.getUniqueStartTime());
	}
	return this._uniqueStartDate;
};

ZmAppt.prototype.getUniqueEndDate = function () {
	if (this._uniqueEndDate == null) {
		var st = this.getUniqueStartTime();
		var dur = this.getDuration();
		this._uniqueEndDate = new Date(st + dur);
	}
	return this._uniqueEndDate;
};

ZmAppt.prototype.getDetails =
function (viewMode) {
	var mode = viewMode || this._viewMode;
	var id, message;
	if ( mode == ZmAppt.MODE_EDIT_SERIES){
		if (this._seriesMessage == null) {
			id = this._seriesInvId;
			message = new ZmMailMsg(this._appCtxt);
			message.id = id;
			message.load(false);
			this._seriesMessage = message;
		}
		message = this._seriesMessage;
	} else {
		if (this._message == null){
			id = this.invId;
			message = new ZmMailMsg(this._appCtxt);
			message.id = id;
			message.load(false);
			this._message = message;
		}
		message = this._message;
	}
	this.setFromMessage(message, mode);
};

ZmAppt.prototype.setFromMessage = function (message, viewMode) {
	if (message !== this._currentlyLoaded) {
		this.isOrg = message.invite.isOrganizer(0);
		this.organizer = message.getInviteOrganizer();
		this.name = message.invite.getName(0);
		this._isException = message.invite.isException(0);
		// if this is an instance of a recurring appointment, 
		// the start date is generated from the unique start time sent
		// in the appointment summaries. The associated message will contain
		// only the original start time.
		if (viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) {
			this.setStartDate(this.getUniqueStartDate());
			this.setEndDate(this.getUniqueEndDate());
		} else {
			this.setEndDate(this._parseServerDateTime(message.invite.getServerEndTime(0), this.endDate));
			this.setStartDate(this._parseServerDateTime(message.invite.getServerStartTime(0), this.startDate));
		}
		this.timezone = message.invite.getServerStartTimeTz(0);
		this.repeatCustomMonthDay = this.startDate.getDate();
		// attendees should all be in the TO field??
		var addrs = message.getAddresses(ZmEmailAddress.TO);
		this._attAddresses = addrs;
		this.attendees = addrs.toString(ZmAppt.ATTENDEES_SEPARATOR_AND_SPACE, true);
		this.notes = message.getTextPart();
		this._trimNotesSummary();
		this.getAttachments();
		// parse recurrence rules
		var recurrences = message.getInvite().getRecurrenceRules(0);
		this.repeatType = "NON";
		// For now, parse what the UI supports.
		// if this rule is generated by another program,
		// we're most likely going to be showing a string representing
		// the rule, instead of allowing the user to edit the rule.
		if (recurrences != null) {
			this._rawRecurrences = recurrences;
		}
		// if we are going to allow the user to edit recurrence rules,
		// then get the information the UI will need. Otherwise, 
		// get the string that describes the recurrence rules.
		if (this.editTimeRepeat()){
			this._populateRecurrenceFields();
		} else {
			this.getRecurrenceDisplayString();
		}
		this._currentlyLoaded = message;
	}
};

ZmAppt.prototype._populateRecurrenceFields = function () {
	if (this._rawRecurrences == null) return;
	var recurrences = this._rawRecurrences;
	var recur = null;
	var i, j, k, x;
	var adds, excludes, excepts, rules, rule;
	for (k = 0; k < recurrences.length ; ++k) {
		adds = recurrences[k].add;
		excludes = recurrences[k].excludes;
		excepts = recurrences[k].except;
		if (adds != null) {
			for (i = 0; i < adds.length; ++i){
				rules = adds[i].rule;
				if (rules) {
					for (j =0; j < rules.length; ++j){
						rule = rules[j];
						if (rule.freq){
							this.repeatType = rule.freq.substring(0,3);
							if (rule.interval && rule.interval[0].ival) this.repeatCustomCount = parseInt(rule.interval[0].ival);
						}
						// hmm ... what to do about negative numbers....
						if (rule.bymonth){
							this.repeatYearlyMonthsList = rule.bymonth[0].molist;
							this.repeatCustom = "1";
						}
						if (rule.bymonthday) {
							if (this.repeatType == "YEA") {
								this.repeatCustomMonthDay = rule.bymonthday[0].modaylist;
								this.repeatCustomType = "S";
							} else if (this.repeatType == "MON"){
								this.repeatMonthlyDayList = rule.bymonthday[0].modaylist.split(",");
							}
							this.repeatCustom = "1";
						}
						if (rule.byday && rule.byday[0] && rule.byday[0].wkday){
							this.repeatCustom = "1";
							if (this.repeatType == "WEE") {
								for (x = 0; x < rule.byday[0].wkday.length; ++x){
									if (this.repeatWeeklyDays == null) this.repeatWeeklyDays = new Array();
									this.repeatWeeklyDays.push(rule.byday[0].wkday[x].day);
								}	
							} else {
								this.repeatCustomDayOfWeek = rule.byday[0].wkday[0].day;
								this.repeatCustomOrdinal = rule.byday[0].wkday[0].ordwk;
								this.repeatCustomType = "O";
							}
						}
						if (rule.until){
							this.repeatEndType = "D";
							this.repeatEndDate = this._parseServerDateTime(rule.until[0].d);
						} else if (rule.count) {
							this.repeatEndType = "A";
							this.repeatEndCount = rule.count[0].num;
						}
					}
				}
			}
		}
		if (excepts != null) {
			for (i = 0; i < excepts.length; ++i){
				// hmmm ....
			}
		}
	}
};

ZmAppt.prototype.frequencyToDisplayString = function (freq, count) {
	var plural = (count > 1)? 1: 0;
	return ZmAppt.FREQ_TO_DISPLAY[freq][plural];
};


//TODO : i18n
ZmAppt.prototype.getRecurrenceDisplayString = function () {
	if (this._recDispStr == null) {
		// grab our saved recurrences
		var list, arr, t, ord, i, j, k, x, y, z;
		var recurrences = this._rawRecurrences;
		var str = new Array();
		var idx = 0;
		// iterate through the whole thing, and see if we can't come up
		// with a gramatically correct interpretation.
		for (k = 0; k < recurrences.length ; ++k) {
			adds = recurrences[k].add;
			excludes = recurrences[k].excludes;
			excepts = recurrences[k].except;
			if (adds != null) {
				str[idx++] = "Every ";
				for (i = 0; i < adds.length; ++i){
					rules = adds[i].rule;
					if (rules) {
						for (j =0; j < rules.length; ++j){
							rule = rules[j];
							idx = this._ruleToString(rule, str, idx);
						}
					}
				}
			}
			if (excludes != null) {
				if (idx > 0) {
					str[idx++] = " except for every ";
				} else {
					str[idx++] = "Except every ";
				}
				for (i = 0; i < excludes.length; ++i){
					rules = excludes[i].rule;
					if (rules) {
						for (j =0; j < rules.length; ++j){
							rule = rules[j];
							idx = this._ruleToString(rule, str, idx);
						}
					}
				}
			}
		}
		this._recDispStr = str.join("");
	}
	return this._recDispStr;
};

ZmAppt.prototype._ruleToString = function (rule, str, idx) {
	idx = this._getFreqString(rule, str, idx);
	idx = this._getByMonthString(rule, str, idx);
	idx = this._getByWeeknoString(rule, str, idx);
	idx = this._getByYearDayString(rule, str, idx);
	idx = this._getMonthDayString(rule, str, idx);
	idx = this._getByDayString(rule, str, idx);
	idx = this._getRecurrenceTimeString(rule, str, idx);
	return idx;
};

ZmAppt.prototype._getFreqString = function (rule, str, idx) {
	if (rule.freq){
		var count = 0;
		if (rule.interval && rule.interval[0].ival) count = rule.interval[0].ival;
		if (count > 1 ) {
			str[idx++] = count; 
			str[idx++] = " ";
		}
		freq = rule.freq.substring(0,3);
		str[idx++] = this.frequencyToDisplayString(freq, count);
	}
	return idx;
};

ZmAppt.prototype._getByMonthString = function (rule, str, idx) {
	var ord;
	if (rule.bymonth){
		list = rule.bymonth[0].molist;
		arr = list.split(',');
		if (arr && arr.length > 0) str[idx++] = " in ";
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			str[idx++] = AjxDateUtil._months[ord];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getByWeeknoString = function (rule, str, idx) {
	var list, arr, t, ord;
	if (rule.byweekno) {
		list = rule.bymonth[0].molist;
		arr = list.split(',');
		if (arr && arr.length > 0) str[idx++] = " weeks ";
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last week of the year ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last week of the year ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getMonthDayString = function (rule, str, idx) {
	var arr, list, t;
	if (rule.monthday) {
		list = rule.bymonthday[0].modaylist;
		arr = list.split(',');
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last day of the month ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last day of the month ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getByDayString = function (rule, str, idx) {
	var x;
	if (rule.byday){
		for (x = 0; x < rule.byday.length; ++x){
			str[idx++] = " on ";
			str[idx++] = ZmAppt.SERVER_DAYS_TO_DISPLAY[rule.byday[x].wkday[0].day];
			var serverOrd = rule.byday[x].wkday[0].ordwk;
			if (serverOrd != null) {
				var fChar = serverOrd.charAt(0);
				var num;
				if (serverOrd == "-1") {
					str[idx++] = " the last week of the";
				} else if ( fChar == '-') {
					num = parseInt(serverOrd.substring(1,serverOrd.length - 1));
					str[idx++] = " the ";
					str[idx++] = num;
					str[idx++] = " from the last week of the ";
				} else {
					if (fChar == '+') {
						num = parseInt(serverOrd.substring(1,serverOrd.length - 1));
					} else {
						num = parseInt(serverOrd);
					}
					str[idx++] = " the ";
					str[idx++] = num;
					str[idx++] = " week of the ";
				}
				str[idx++] = freq;
				str[idx++] = " ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getRecurrenceTimeString = function (rule, str, idx) {
	var hours;
	if (rule.byhour) {
		list = rule.byhour[0].hrlist;
		hours = list.split(',');
	} else {
		hours = [this.startDate.getHours()];
	}

	var minutes;
	if (rule.byminute) {
		list = rule.byminute[0].minlist;
		minutes = list.split(',');
	} else {
		minutes = [this.startDate.getMinutes()];
	}

	var seconds;
	if (rule.bysecond) {
		list = rule.bysecond[0].seclist;
		seconds = list.split(',');
	} else {
		seconds = [this.startDate.getSeconds()];
	}
							
	str[idx++] = " at ";
	for (x=0; x < hours.length; ++x){ 
		for (y=0; y < minutes.length; ++y) {
			for (z = 0; z < seconds.length; ++z){
										
				var h = parseInt(hours[x]);
				var ampm = " AM";
				if (h >= 12) ampm = " PM";
				str[idx++] = (h != 12)? (h % 12): h;
				str[idx++] = ":";
				str[idx++] = AjxDateUtil._pad(minutes[y]);
// 				if (seconds[z] == '0' || seconds[z] == '00') {
// 				} else {
// 					str[idx++] = ":";
// 					str[idx++] = AjxDateUtil._pad(seconds[z]);
// 				}
				str[idx++] = ampm;
				if (z < seconds.length - 1 || y < seconds.length - 1 || x < hours.length -1){
					str[idx++] = ", and ";
				}
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getByYearDayString = function (rule, str, idx) {
	var list, arr, t, ord;
	if (rule.byyearday) {
		list = rule.byyearday[0].yrdaylist;
		arr = list.split(',');
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last day of the year ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last day of the year ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype.getAttendeeAddrs = 
function () {
	
	return (this._attAddresses != null)? this._attAddresses.getArray() : null;
};

ZmAppt.prototype.isReadOnly = function () {
	return !this.isOrganizer();
};

ZmAppt.prototype.editTimeRepeat = function () {
	if (this._editingUser == null ) {
		this._editingUser = this._appCtxt.get(ZmSetting.USERNAME);
	}
	var u = this._editingUser;
	var m = this._viewMode;
	var isOrg = this.isOrganizer();
	if ((m == ZmAppt.MODE_EDIT_SERIES && !isOrg)){
		return ZmAppt.EDIT_NO_REPEAT;
	}

	if ( ( ((m == ZmAppt.MODE_EDIT_SERIES) || (m == ZmAppt.MODE_EDIT))
		 && (isOrg)) ||
		 m == ZmAppt.MODE_NEW){
		return ZmAppt.EDIT_TIME_REPEAT;
	}

	return ZmAppt.EDIT_TIME;
};

ZmAppt.prototype._addInviteAndCompNum = function (soapDoc) {
	if (this._viewMode == ZmAppt.MODE_EDIT_SERIES) {
		if (this.recurring && this._seriesInvId !== void 0 && this._seriesInvId != null) {
			soapDoc.setMethodAttribute("id", this._seriesInvId);
			soapDoc.setMethodAttribute("comp", this.compNum);
		}
	} else {
		if (this.invId !== void 0 && this.invId != null && this.invId != -1) {
			soapDoc.setMethodAttribute("id", this.invId);
			soapDoc.setMethodAttribute("comp", this.compNum);
		}
	}
};

ZmAppt.prototype._getServerDate = function (date) {
	var yyyy = date.getFullYear();
	var MM = AjxDateUtil._pad(date.getMonth() + 1);
	var dd = AjxDateUtil._pad(date.getDate());
	return AjxBuffer.concat(yyyy,MM,dd);
};

ZmAppt.prototype._getServerDateTime = function ( date ) {
	var yyyy = date.getFullYear();
	var MM = AjxDateUtil._pad(date.getMonth() + 1);
	var dd = AjxDateUtil._pad(date.getDate());
	var hh = AjxDateUtil._pad(date.getHours());
	var mm = AjxDateUtil._pad(date.getMinutes());
	var ss = AjxDateUtil._pad(date.getSeconds());
	return AjxBuffer.concat(yyyy, MM, dd,"T",hh, mm, ss);
};

ZmAppt.prototype._parseServerTime = function (serverStr, date) {
	if (serverStr.charAt(8) == 'T') {
		var hh = parseInt(serverStr.substr(9,2), 10);
		var mm = parseInt(serverStr.substr(11,2), 10);
		var ss = parseInt(serverStr.substr(13,2), 10);
		date.setHours(hh, mm, ss, 0);
	}
	return date;
};

ZmAppt.prototype._parseServerDateTime = function (serverStr) {
	if (serverStr == null) return null;
	var d = new Date();
	var yyyy = parseInt(serverStr.substr(0,4), 10);
	var MM = parseInt(serverStr.substr(4,2), 10);
	var dd = parseInt(serverStr.substr(6,2), 10);
	d.setFullYear(yyyy);
	d.setMonth(MM - 1);
	d.setDate(dd);
	this._parseServerTime(serverStr, d);
	return d;
};

ZmAppt.prototype._prepareSoapForSave = 
function (soapDoc, attachmentId) {

	var obj = this._setSimpleSoapAttributes(soapDoc, ZmAppt.SOAP_METHOD_REQUEST, attachmentId);

	// TODO -- ALARM
	// var alarm = soapDoc.set("alarm", null, inv);
	// alarm.setAttribute("rel-start", /* some alarm start time */);

	this._addRecurrenceRulesToSoap(soapDoc, obj.inv);
	
	return obj;
};

ZmAppt.prototype._setSimpleSoapAttributes = function (soapDoc, method,  attachmentId) {

	if (this.organizer == null) this.organizer = this._appCtxt.get(ZmSetting.USERNAME);
	var m = this._messageNode = soapDoc.set('m');

	m.setAttribute("d", new Date().getTime());

	var inv = soapDoc.set("inv", null, m);
	switch (method) {
	case ZmAppt.SOAP_METHOD_REQUEST:
		inv.setAttribute('method', "REQUEST");
		break;
	case ZmAppt.SOAP_METHOD_CANCEL:
		inv.setAttribute('method', "CANCEL");
		break;
	}
	
	inv.setAttribute("type", "event");

	if (this.isOrganizer()) {
		this._addAttendeesToSoap(soapDoc, inv, m);
	}

	this._addNotesToSoap(soapDoc, m);

	if (this.uid !== void 0 && this.uid != null && this.uid != -1) {
		inv.setAttribute("uid", this.uid);
	}

	inv.setAttribute("type", "event");

    if (this.isAllDayEvent()) {
        // for "all day" events, default them to "transparent" -- not counted towards free-busy --
        // this is what outlook does.  Eventually, the UI will have a checkbox to choose this
        inv.setAttribute("fb","F");
        inv.setAttribute("transp", "T");
    } else {
        // for all other appointments, default to time as "busy"
        inv.setAttribute("fb","B");
        inv.setAttribute("transp", "O");
    }
	inv.setAttribute("status","CONF");
	inv.setAttribute("allDay", this.allDayEvent);
	var s = soapDoc.set("s", null, inv);
	var e = soapDoc.set("e", null, inv);
	if (this.allDayEvent != "1") {
		s.setAttribute("d", this._getServerDateTime(this.startDate));
		s.setAttribute("tz", this.timezone);
		e.setAttribute("d", this._getServerDateTime(this.endDate));
		e.setAttribute("tz", this.timezone);
	} else {
		s.setAttribute("d", this._getServerDate(this.startDate));
		e.setAttribute("d", this._getServerDate(this.endDate));
	}
	
	soapDoc.set("su", this.name, m);
	inv.setAttribute("name", this.name);

	if (this.location != null) {
		inv.setAttribute("loc", this.location);
	}

	var org = soapDoc.set("or", null, inv);
	// TODO: make attendees list, a list of ZmEmailAddresses.
	// org.setAttribute("d",
	org.setAttribute("a", this.organizer);

	// handle attachments
	if ( (attachmentId != null)|| (this._validAttachments != null && this._validAttachments.length)) {
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId != null) {
			attachNode.setAttribute("aid", attachmentId);
		}
		if (this._validAttachments) {
			for (var i = 0; i < this._validAttachments.length; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				msgPartNode.setAttribute("mid", this._message.id);
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

ZmAppt.prototype._addRecurrenceRulesToSoap = function (soapDoc, inv) {
	if (this.repeatType != "NON"){
		var recur = soapDoc.set("recur", null, inv);
		var add = soapDoc.set("add", null, recur);
		if (this.repeatType == "NON") {
			var date = soapDoc.set("date", null, add);
			date.setAttribute("d", this._getServerDateTime(this.startDate));
			date.setAttribute("tz", this.timezone);
		} else {
			var rule = soapDoc.set("rule", null, add);
			rule.setAttribute("freq", this.repeatType);
			var interval = soapDoc.set("interval", null, rule);
			interval.setAttribute("ival", this.repeatCustomCount);
			if (this.repeatEndDate != null && this.repeatEndType == "D") {
				var until = soapDoc.set("until", null, rule);
				until.setAttribute("d", this._getServerDate(this.repeatEndDate));
				until.setAttribute("tz", this.timezone);
			} else if (this.repeatEndType == "A"){
				var c = soapDoc.set("count",null, rule);
				c.setAttribute("num", this.repeatEndCount);
			}
			if (this.repeatCustom == '1') {
				if (this.repeatType == "WEE"){
					var bwd = soapDoc.set("byday", null, rule);
					var wkDay;
					for (var i = 0; i < this.repeatWeeklyDays.length; ++i) {
						wkDay = soapDoc.set("wkday", null, bwd);
						wkDay.setAttribute("day", this.repeatWeeklyDays[i]);
					}
				} else if (this.repeatType == "MON"){
					if (this.repeatCustomType == "S") {
						var bmd = soapDoc.set("bymonthday", null, rule);
						bmd.setAttribute("modaylist", this.repeatMonthlyDayList);

					} else {
						var bwd = soapDoc.set("byday", null, rule);
						wkDay = soapDoc.set("wkday", null, bwd);
						wkDay.setAttribute("ordwk", this.repeatCustomOrdinal);
						wkDay.setAttribute("day", this.repeatCustomDayOfWeek);
					}
					var co = soapDoc.set('x-name', null, rule);
					co.setAttribute('name', "repeatCustomType");
					co.setAttribute('value', this.repeatCustomType);
				} else if (this.repeatType == "YEA"){
					var bm = soapDoc.set("bymonth", null, rule);
					bm.setAttribute("molist", this.repeatYearlyMonthsList + 1);
					var co = soapDoc.set('x-name', null, rule);
					co.setAttribute('name', "repeatCustomType");
					co.setAttribute('value', this.repeatCustomType);
					if (this.repeatCustomType == "O") {
						var bwd = soapDoc.set("byday", null, rule);
						wkDay = soapDoc.set("wkday", null, bwd);
						wkDay.setAttribute("ordwk", this.repeatCustomOrdinal);
						wkDay.setAttribute("day", this.repeatCustomDayOfWeek);
					} else {
						var bmd = soapDoc.set("bymonthday", null, rule);
						bmd.setAttribute("modaylist", this.repeatCustomMonthDay);						
					}
				}
			}
		}
	}
};

ZmAppt.prototype._addAttendeesToSoap = function(soapDoc, inv, m){
	if (this.attendees != null && this.attendees.length > 0){

		var addrArr = this.attendees.split(ZmAppt.ATTENDEES_SEPARATOR_REGEX);
		var addrs = new Array();
		for (var z = 0 ; z < addrArr.length; ++z) {
			var e = ZmEmailAddress.parse(addrArr[z]);
			if (e != null){
				addrs.push(e);
			}
		}

		for (var i = 0; i < addrs.length; ++i) {
			var address = addrs[i].getAddress();
			var dispName = addrs[i].getDispName();
			if (inv != null) {
				at = soapDoc.set("at", null, inv);			
				// for now make all attendees optional, until the UI has a way of setting this.
				at.setAttribute("role", "OPT");
				// not sure if it makes sense for status to be required on create.
				at.setAttribute("ptst", "NE");
				at.setAttribute("rsvp", "1");
				at.setAttribute("a", address);
				if (dispName) {
					at.setAttribute("d", dispName);
				}
			}

			if (m != null) {
				e = soapDoc.set("e", null, m);
				e.setAttribute("a", address);
				if (dispName){
					e.setAttribute("p", dispName);
				}
				e.setAttribute("t", ZmEmailAddress.toSoapType[addrs[i].getType()]);
			}
		}
	}
};

ZmAppt.prototype._getDefaultBlurb = function (cancel) {
	var buf = new Array();
	var idx = 0;
	buf[idx++] = "Action:";
	if (cancel) {
		buf[idx++] =" Cancelled";
	} else {
		if (( this._viewMode == ZmAppt.MODE_EDIT) || (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) ||
			(this._viewMode == ZmAppt.MODE_EDIT_SERIES)) {
			buf[idx++] = " Modified";
		} else {
			buf[idx++] = " Created";
		}
	}
	if ( (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) || (this._viewMode == ZmAppt.MODE_DELETE_INSTANCE)){
		buf[idx++] = " a single instance";
	}
	buf[idx++] = "\n";

	idx = this.getTextSummary(cancel, buf, idx);
	return buf.join("");
};

//TODO -- cleanup
ZmAppt.prototype.getTextSummary = function (cancel, buffer, idx) {
	// if there are attendees, then create a simple message
	// describing the meeting invitation.
	var showingTimezone = this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);
	// instances of recurring meetings should send out information that looks very
	// much like a simple appointment.
	// simple meeting
	buffer[idx++] = "Organizer Email: "
	buffer[idx++] = this.organizer;
	buffer[idx++] = "\n";
	buffer[idx++] = "Subject:"
	buffer[idx++] = "\"";
	buffer[idx++] = this.name;
	buffer[idx++] = "\"\n";
	if (this.location != "") {
		buffer[idx++] = "Location: ";
		buffer[idx++] = this.location;
		buffer[idx++] = "\n";
	}
	if ((this.repeatType != "NON") && (this._viewMode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE) &&
		this._viewMode != ZmAppt.MODE_DELETE_INSTANCE) {
		buffer[idx++] = "Recurrence: ";
		buffer[idx++] = this._getRecurrenceBlurbForSave();
		buffer[idx++] = "\n";
	}
	buffer[idx++] = "Start:";
	var s = this.startDate;
	var e = this.endDate;
	if (this._viewMode == ZmAppt.MODE_DELETE_INSTANCE){
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}
	if ((this.repeatType == "NON") || (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) &&
		this._viewMode == ZmAppt.MODE_DELETE_INSTANCE) {
		buffer[idx++] = AjxDateUtil.simpleComputeDateStr(s);
		buffer[idx++] = " ";
	}
	buffer[idx++] = AjxDateUtil.getTimeStr(s, "%h:%m %P");
	if (showingTimezone){
		buffer[idx++] = " ";
		buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
	}
	buffer[idx++] = "\n";
	buffer[idx++] = "Ends:";
	if ((this.repeatType == "NON") || (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) &&
		this._viewMode == ZmAppt.MODE_DELETE_INSTANCE) {
		buffer[idx++] = AjxDateUtil.simpleComputeDateStr(e);
		buffer[idx++] = " ";
	}
	buffer[idx++] = AjxDateUtil.getTimeStr(e, "%h:%m %P");
	if (showingTimezone){
		buffer[idx++] = " ";
		buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
	}
	buffer[idx++] = "\n";
	if (this.isAllDayEvent()) {
		buffer[idx++] = "(all day)";
		buffer[idx++] = "\n";
	}
	buffer[idx++] = ZmAppt.NOTES_SEPARATOR;
	return idx;
};

ZmAppt.prototype._getRecurrenceBlurbForSave = function () {
	if (this.repeatType != "NON"){
		var blurb = new Array();
		var idx = 0;
		blurb[idx++] = "occuring every ";
		if (this.repeatCustomCount > 1) {
			blurb[idx++] = this.repeatCustomCount;
			blurb[idx++] = " ";
		}
		blurb[idx++] = this.frequencyToDisplayString(this.repeatType, this.repeatCustomCount);

		var customRepeat = (this.repeatCustom == '1');
		if (this.repeatType == "WEE"){
			blurb[idx++] = " on ";
			if (customRepeat) {
				if (this.repeatWeeklyDays.length > 0) {
					for (var i = 0; i < this.repeatWeeklyDays.length; ++i) {
						blurb[idx++] = ZmAppt.SERVER_DAYS_TO_DISPLAY[this.repeatWeeklyDays[i]];
						if (i == (this.repeatWeeklyDays.length - 2 )){
							blurb[idx++] = " and ";
						} else if (i < (this.repeatWeeklyDays.length - 1)){
							blurb[idx++] = ", ";
						}
					}
				}
			} else {
				blurb[idx++] = AjxDateUtil._daysOfTheWeek[this.startDate.getDay()];
			}
		} else if (this.repeatType == "MON"){
			if (this.repeatCustomType == "S") {
				blurb[idx++] = " on the";
				if (customRepeat) {
					var nums = this.repeatMonthlyDayList;
					for (var i = 0 ; i < nums.length; ++i ){
						blurb[idx++] = nums[i];
						if (i == (nums.length - 2) ) {
							blurb[idx++] = " and ";
						} else {
							blurb[idx++] = ",";
						}
					}
				} else {
					blurb[idx++] =  this.repeatCustomOrdinal;
					blurb[idx++] = this.repeatCustomDayOfWeek;
					blurb[idx++] = " of the month";
				}
			} else {
				blurb[idx++] = this.startDate.getDate();
			}
		} else if (this.repeatType == "YEA"){
			if (customRepeat) {
				blurb[idx++] = " in ";
				var nums = this.repeatYearlyMonthsList.split(",");
				for (var i = 0 ; i < nums.length; ++i ){
					blurb[idx++] = AjxDateUtil._months[nums[i]];
					if (i < nums.length -1 ) {
						blurb[idx++] = ",";
					}
				}
				if (this.repeatCustomType == "O") {
					blurb[idx++] = " on the ";
					blurb[idx++] = this.repeatCustomOrdinal;
					blurb[idx++] = this.repeatCustomDayOfWeek;
					blurb[idx++] = " of the month";
				} else {
					blurb[idx++] = " on the ";
					this.repeatCustomMonthDay;
				}
			} else {
				blurb[idx++] = " on ";
				blurb[idx++] = AjxDateUtil._months[this.startDate.getMonth()];
				blurb[idx++] = " ";
				blurb[idx++] = this.startDate.getDate();
			}
		}

		if (this.repeatEndDate != null && this.repeatEndType == "D") {
			blurb[idx++] = " until ";
			blurb[idx++] = AjxDateUtil.simpleComputeDateStr(this.repeatEndDate);
			if (this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE)){
				blurb[idx++] = " ";
				blurb[idx++] = ZmTimezones.valueToDisplay[this.timezone];
			}

		} else if (this.repeatEndType == "A"){
			blurb[idx++] = " for ";
			blurb[idx++] = this.repeatEndCount;
			blurb[idx++] = " ";
			blurb[idx++] = this.frequencyToDisplayString(this.repeatType, this.repeatEndCount);
		}
		blurb[idx++] = " effective ";
		blurb[idx++] = AjxDateUtil.simpleComputeDateStr(this.startDate);
		return blurb.join("");
	}
};

ZmAppt.prototype._trimNotesSummary = function () {
	var notesArr;
	if (this.notes != null){
		notesArr = this.notes.split(ZmAppt.NOTES_SEPARATOR_REGEX);
		if (notesArr.length > 1) {
			this.notes = notesArr[1];
		}
	}
};


ZmAppt.prototype._addNotesToSoap = function (soapDoc, m, cancel) {	
	var mp = soapDoc.set("mp", null, m);
	mp.setAttribute("content-type", "text/plain");
	this._trimNotesSummary();
	var content = "";
	if (this.attendees != null) {
		content = this._getDefaultBlurb(cancel);
	}
	if (this.notes != null && this.notes.length > 0) {
		content = AjxBuffer.concat(content, this.notes);
	}
	soapDoc.set("content", content, mp);
};

ZmAppt.prototype.save = function (sender, attachmentId) {
	var needsExceptionId = false;
	switch (this._viewMode) {
	case ZmAppt.MODE_NEW:
		var soapDoc = AjxSoapDoc.create("CreateAppointmentRequest",
									   "urn:zimbraMail");
		break;
	case ZmAppt.MODE_EDIT_SINGLE_INSTANCE:
		if (!this.isException()){
			var soapDoc = AjxSoapDoc.create("CreateAppointmentExceptionRequest",
										   "urn:zimbraMail");
			this._addInviteAndCompNum(soapDoc);
			soapDoc.setMethodAttribute("s", this.getOrigStartTime());
			needsExceptionId = true;
		} else {
			var soapDoc = AjxSoapDoc.create("ModifyAppointmentExceptionRequest",
										   "urn:zimbraMail");
			this._addInviteAndCompNum(soapDoc);
		}
		break;
// 	case ZmAppt.MODE_EDIT_SERIES:
// 		var soapDoc = AjxSoapDoc.create("ModifyAppointmentRequest",
// 									   "urn:zimbraMail");
// 		this._addInviteAndCompNum(soapDoc);
// 		soapDoc.setMethodAttribute("thisAndFuture",true);
// 		break;
	default:
		var soapDoc = AjxSoapDoc.create("ModifyAppointmentRequest",
									   "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
		break;
	}

	var invAndM = this._prepareSoapForSave(soapDoc, attachmentId);

	if (needsExceptionId) {
		exceptId = soapDoc.set("exceptId", null, invAndM.inv);
		if (this.allDayEvent != '1') {
			exceptId.setAttribute("d", this._getServerDateTime(this.getOrigStartDate()));
			exceptId.setAttribute("tz", this.timezone);
		} else {
			exceptId.setAttribute("d", this._getServerDate(this.getOrigStartDate()));
		}
	}
	this._sendRequest(sender, soapDoc);
};

ZmAppt.prototype._sendRequest = function (sender, soapDoc) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var resp = sender.sendRequest(soapDoc);
	// branch for different responses
	var response = resp[responseName];
	if (response.uid != null) {
		this.uid = response.uid;
	}
	if (response.m != null){
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId) {
			this.clearDetailsCache();
		}
	}

	this._messageNode = null;
};

ZmAppt.prototype.cancel = function (sender, mode) {
	this.setViewMode(mode);
	// To get the attendees for this appointment, we have to get the 
	// message.
	this.getDetails();
	switch (mode) {
	case ZmAppt.MODE_DELETE:
		// fall through
	case ZmAppt.MODE_DELETE_SERIES:
		var soapDoc = AjxSoapDoc.create("CancelAppointmentRequest",
									   "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
		var m = soapDoc.set("m");
		if (this.isOrganizer()) {
			this._addAttendeesToSoap(soapDoc, null, m);
		}
		soapDoc.set("su","Cancelled: " + this.name, m);
		this._addNotesToSoap(soapDoc, m, true);
		this._sendRequest(sender, soapDoc);
		break;
	case ZmAppt.MODE_DELETE_INSTANCE:
		var soapDoc = AjxSoapDoc.create("CancelAppointmentExceptionRequest",
									   "urn:zimbraMail");
		soapDoc.setMethodAttribute("s", this.getOrigStartTime());
		this._addInviteAndCompNum(soapDoc);
		var inst = soapDoc.set("inst");
		inst.setAttribute("d", this._getServerDateTime(this.getOrigStartDate()));
		inst.setAttribute("tz", this.timezone);
		var m = soapDoc.set("m");
		if (this.isOrganizer()){
			this._addAttendeesToSoap(soapDoc, null, m);
		}
		soapDoc.set("su","Cancelled: " + this.name, m);
		this._addNotesToSoap(soapDoc, m, true);
		this._sendRequest(sender, soapDoc);
		break;
	}
};
