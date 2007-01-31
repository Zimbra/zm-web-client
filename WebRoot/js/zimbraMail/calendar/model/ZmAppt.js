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
function ZmAppt(appCtxt, list, noinit) {

	ZmCalItem.call(this, appCtxt, ZmItem.APPT, list);
	if (noinit) return;

	this.folderId = ZmOrganizer.ID_CALENDAR;

	this._viewMode = ZmCalItem.MODE_NEW;
	this._recurrence = new ZmRecurrence(this);

	// attendees by type
	this._attendees = {};
	this._attendees[ZmCalItem.PERSON]	= [];
	this._attendees[ZmCalItem.LOCATION]	= [];
	this._attendees[ZmCalItem.EQUIPMENT]= [];

	this._origAttendees = null;	// list of ZmContact
	this._origLocations = null;	// list of ZmResource
	this._origEquipment = null;	// list of ZmResource
};

ZmAppt.prototype = new ZmCalItem;
ZmAppt.prototype.constructor = ZmAppt;


// Consts

ZmAppt.MODE_DRAG_OR_SASH			= ++ZmCalItem.MODE_LAST;


// Public methods

ZmAppt.prototype.toString =
function() {
	return "ZmAppt";
};


// Getters

ZmAppt.prototype.getOrigAttendees 		= function() { return this._origAttendees; };
ZmAppt.prototype.getOrigLocations 		= function() { return this._origLocations; };
ZmAppt.prototype.getOrigEquipment 		= function() { return this._origEquipment; };
ZmAppt.prototype.getAttendeesText		= function() { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.PERSON], ZmCalItem.PERSON); };
ZmAppt.prototype.getLocationsText		= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.LOCATION], ZmCalItem.LOCATION, inclDispName); };
ZmAppt.prototype.getLocation			= function(inclDispName) { return this.getLocationsText(inclDispName); };
ZmAppt.prototype.getEquipmentText		= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.EQUIPMENT], ZmCalItem.EQUIPMENT, inclDispName); };
ZmAppt.prototype.getOrigLocationsText	= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._origLocations, ZmCalItem.LOCATION, inclDispName); };
ZmAppt.prototype.getOrigLocation		= function(inclDispName) { return this.getOrigLocationsText(inclDispName); };
ZmAppt.prototype.getOrigEquipmentText	= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._origEquipment, ZmCalItem.EQUIPMENT, inclDispName); };

/**
* Used to make our own copy because the form will modify the date object by 
* calling its setters instead of replacing it with a new date object.
*/
ZmApptClone = function() { };
ZmAppt.quickClone = 
function(appt) {
	ZmApptClone.prototype = appt;

	var newAppt = new ZmApptClone();
	newAppt.startDate = new Date(appt.startDate.getTime());
	newAppt.endDate = new Date(appt.endDate.getTime());
	newAppt._uniqId = Dwt.getNextId();

	newAppt._origAttendees = AjxUtil.createProxy(appt.getOrigAttendees());
	newAppt._origLocations = AjxUtil.createProxy(appt.getOrigLocations());
	newAppt._origEquipment = AjxUtil.createProxy(appt.getOrigEquipment());
	newAppt._validAttachments = AjxUtil.createProxy(appt._validAttachments);
	
	if (newAppt._orig == null) 
		newAppt._orig = appt;

	newAppt.type = ZmItem.APPT;

	return newAppt;
};

ZmAppt.prototype.getFolder =
function() {
	var ct = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
	return ct ? ct.getById(this.getFolderId()) : null;
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmAppt.prototype.getToolTip =
function(controller) {
	if (this._orig)
		return this._orig.getToolTip(controller);

	if (!this._toolTip) {
		var params = { appt: this,
			cal: (this.getFolderId() != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
			when: this.getDurationText(false, false),
			location: this.getLocation(true), width: "250" };

		this._toolTip = AjxTemplate.expand("zimbraMail.calendar.templates.Appointment#Tooltip", params);
	}
	return this._toolTip;
};

ZmAppt.prototype.getSummary =
function(isHtml) {
	var orig = this._orig || this;

	var isEdit = (this._viewMode == ZmCalItem.MODE_EDIT ||
				  this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
				  this._viewMode == ZmCalItem.MODE_EDIT_SERIES);

	var buf = [];
	var i = 0;

	if (!this._summaryHtmlLineFormatter) {
		this._summaryHtmlLineFormatter = new AjxMessageFormat("<tr><th align='left'>{0}</th><td>{1} {2}</td></tr>");
		this._summaryTextLineFormatter = new AjxMessageFormat("{0} {1} {2}");
	}
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;

	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}
	var modified = isEdit && (orig.getName() != this.getName());
	var params = [ ZmMsg.subject + ":", this.name, modified ? ZmMsg.apptModifiedStamp : "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";
	
	var organizer = this.organizer ? this.organizer : this._appCtxt.get(ZmSetting.USERNAME);
	var orgEmail = ZmApptViewHelper.getOrganizerEmail(this._appCtxt, this.organizer).toString();
	var orgText = isHtml ? AjxStringUtil.htmlEncode(orgEmail) : orgEmail;
	var params = [ ZmMsg.organizer + ":", orgText, "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "</table>";
	}
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}
	
	var location = this.getLocation(true);
	if (location) {
		modified = isEdit && (this.getOrigLocation(true) != location);
		params = [ ZmMsg.location + ":", location, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}
	
	var equipment = this.getEquipmentText(true);
	if (equipment) {
		modified = isEdit && (this.getOrigEquipmentText(true) != equipment);
		params = [ ZmMsg.resources + ":", equipment, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var s = this.startDate;
	var e = this.endDate;
	if (this._viewMode == ZmCalItem.MODE_DELETE_INSTANCE) {
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	var recurrence = this._recurrence.repeatType != "NON" &&
					 this._viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
					 this._viewMode != ZmCalItem.MODE_DELETE_INSTANCE;
	if (recurrence)
	{
		var hasTime = isEdit 
			? ((orig.startDate.getTime() != s.getTime()) || (orig.endDate.getTime() != e.getTime()))
			: false;
		params = [ ZmMsg.time + ":", this._getTextSummaryTime(isEdit, ZmMsg.time, null, s, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}
	else if (s.getFullYear() == e.getFullYear() && 
			 s.getMonth() == e.getMonth() && 
			 s.getDate() == e.getDate()) 
	{
		var hasTime = isEdit 
			? ((orig.startDate.getTime() != this.startDate.getTime()) || (orig.endDate.getTime() != this.endDate.getTime()))
			: false;
		params = [ ZmMsg.time + ":", this._getTextSummaryTime(isEdit, ZmMsg.time, s, s, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}
	else 
	{
		var hasTime = isEdit ? (orig.startDate.getTime() != this.startDate.getTime()) : false;
		params = [ ZmMsg.start + ":", this._getTextSummaryTime(isEdit, ZmMsg.start, s, s, null, hasTime), "" ];
		buf[i++] = formatter.format(params);

		hasTime = isEdit ? (orig.endDate.getTime() != this.endDate.getTime()) : false;
		params = [ ZmMsg.end + ":", this._getTextSummaryTime(isEdit, ZmMsg.end, e, null, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}

	if (recurrence) {
		modified = false;
		if (isEdit) {
			modified = orig._recurrence.repeatType != this._recurrence.repeatType ||
					   orig._recurrence.repeatCustom != this._recurrence.repeatCustom ||
					   orig._recurrence.repeatCustomType != this._recurrence.repeatCustomType ||
					   orig._recurrence.repeatCustomCount != this._recurrence.repeatCustomCount ||
					   orig._recurrence.repeatCustomOrdinal != this._recurrence.repeatCustomOrdinal ||
					   orig._recurrence.repeatCustomDayOfWeek != this._recurrence.repeatCustomDayOfWeek ||
					   orig._recurrence.repeatCustomMonthDay != this._recurrence.repeatCustomMonthDay ||
					   orig._recurrence.repeatEnd != this._recurrence.repeatEnd ||
					   orig._recurrence.repeatEndType != this._recurrence.repeatEndType ||
					   orig._recurrence.repeatEndCount != this._recurrence.repeatEndCount ||
					   orig._recurrence.repeatEndDate != this._recurrence.repeatEndDate ||
					   orig._recurrence.repeatWeeklyDays != this._recurrence.repeatWeeklyDays ||
					   orig._recurrence.repeatMonthlyDayList != this._recurrence.repeatMonthlyDayList ||
					   orig._recurrence.repeatYearlyMonthsList != this._recurrence.repeatYearlyMonthsList;
		}
		params = [ ZmMsg.recurrence, ":", this._recurrence.getBlurb(), modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	if (this._attendees[ZmCalItem.PERSON] && this._attendees[ZmCalItem.PERSON].length) {
		if (isHtml) {
			buf[i++] = "</table>\n<p>\n<table border='0'>";
		}
		buf[i++] = "\n";
		var attString = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.PERSON].slice(0, 10), ZmCalItem.PERSON);
		if (this._attendees[ZmCalItem.PERSON].length > 10) {
			attString += ", ...";
		}
		params = [ ZmMsg.invitees + ":", attString, "" ];
		buf[i++] = formatter.format(params);
	}
	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmAppt.NOTES_SEPARATOR;
	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};


// Private / Protected methods

ZmAppt.prototype._getTextSummaryTime = 
function(isEdit, fieldstr, extDate, start, end, hasTime) {
	var showingTimezone = this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);

	var buf = [];
	var i = 0;

	if (extDate) {
		buf[i++] = AjxDateUtil.longComputeDateStr(extDate);
		buf[i++] = ", ";
	}
	if (this.isAllDayEvent()) {
		buf[i++] = ZmMsg.allDay;
	} else {
		var formatter = AjxDateFormat.getTimeInstance();
		if (start)
			buf[i++] = formatter.format(start);
		if (start && end)
			buf[i++] = " - ";
		if (end)
			buf[i++] = formatter.format(end);

		if (showingTimezone) {
			buf[i++] = " ";
			buf[i++] = AjxTimezone.getLongName(AjxTimezone.getClientId(this.timezone));
		}
	}
	// NOTE: This relies on the fact that setModel creates a clone of the
	//		 appointment object and that the original object is saved in 
	//		 the clone as the _orig property.
	if (isEdit && ((this._orig && this._orig.isAllDayEvent() != this.isAllDayEvent()) || hasTime)) {
		buf[i++] = " ";
		buf[i++] = ZmMsg.apptModifiedStamp;
	}
	buf[i++] = "\n";

	return buf.join("");
};
