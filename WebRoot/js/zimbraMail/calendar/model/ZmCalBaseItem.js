/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
ZmCalBaseItem = function(type, list, id, folderId) {
	if (arguments.length == 0) { return; }

	ZmItem.call(this, type, id, list);

	this.id = id || -1;
	this.uid = -1; // iCal uid of appt
	this.folderId = folderId || this._getDefaultFolderId();
	this.fragment = "";
	this.name = "";
	this.allDayEvent = "0";
	this.startDate = null;
	this.endDate = null;
	this.timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	this.alarm = false;
	this.alarmData = null;
	this.isException = false;
	this.recurring = false;
	this.priority = null;
	this.ptst = null; // participant status
	this.status = ZmCalendarApp.STATUS_CONF;
	this._reminderMinutes = 0;
	this.otherAttendees = false;	
};

ZmCalBaseItem.prototype = new ZmItem;
ZmCalBaseItem.prototype.constructor = ZmCalBaseItem;

ZmCalBaseItem.prototype.toString =
function() {
	return "ZmCalBaseItem";
};


// consts

ZmCalBaseItem.PERSON				= 1;
ZmCalBaseItem.LOCATION				= 2;
ZmCalBaseItem.EQUIPMENT				= 3;

ZmCalBaseItem.PSTATUS_ACCEPT		= "AC";			// vevent, vtodo
ZmCalBaseItem.PSTATUS_DECLINED		= "DE";			// vevent, vtodo
ZmCalBaseItem.PSTATUS_DEFERRED		= "DF";			// vtodo					[outlook]
ZmCalBaseItem.PSTATUS_DELEGATED		= "DG";			// vevent, vtodo
ZmCalBaseItem.PSTATUS_NEEDS_ACTION	= "NE";			// vevent, vtodo
ZmCalBaseItem.PSTATUS_COMPLETED		= "CO";			// vtodo
ZmCalBaseItem.PSTATUS_TENTATIVE		= "TE";			// vevent, vtodo
ZmCalBaseItem.PSTATUS_WAITING		= "WA";			// vtodo					[outlook]

ZmCalBaseItem.FBA_TO_PTST = {
	B: ZmCalBaseItem.PSTATUS_ACCEPT,
	F: ZmCalBaseItem.PSTATUS_DECLINED,
	T: ZmCalBaseItem.PSTATUS_TENTATIVE
};

ZmCalBaseItem._pstatusString = {
	NE: ZmMsg._new,
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
};

/**
* Compares two appts. sort by (starting date, duration)
* sort methods.
*
* @param a		an appt
* @param b		an appt
*/
ZmCalBaseItem.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime()) 	return 1;
	if (a.getStartTime() < b.getStartTime()) 	return -1;
	if (a.getDuration() < b.getDuration()) 		return 1;
	if (a.getDuration() > b.getDuration()) 		return -1;
	return 0;
};

ZmCalBaseItem.createFromDom =
function(apptNode, args, instNode) {
	var appt = new ZmCalBaseItem(ZmItem.APPT, args.list);
	appt._loadFromDom(apptNode, (instNode || {}));
	return appt;
};

ZmCalBaseItem.prototype.getName 		= function() { return this.name || ""; };			// name (aka Subject) of appt
ZmCalBaseItem.prototype.getEndTime 		= function() { return this.endDate.getTime(); }; 	// end time in ms
ZmCalBaseItem.prototype.getStartTime 	= function() { return this.startDate.getTime(); }; 	// start time in ms
ZmCalBaseItem.prototype.getDuration 	= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
ZmCalBaseItem.prototype.getLocation		= function() { return this.location || ""; };
ZmCalBaseItem.prototype.isAllDayEvent	= function() { return this.allDayEvent == "1"; };

ZmCalBaseItem.prototype.getParticipantStatusStr =
function() { 
	return ZmCalBaseItem._pstatusString[this.ptst]; 
};

ZmCalBaseItem.prototype.getUniqueId =
function(useStartTime) {
	if (useStartTime) {
		if (!this._startTimeUniqId) {
			this._startTimeUniqId = this.id + "_" + this.getStartTime();
		}
		return this._startTimeUniqId;
	} else {
		if (this._uniqId == null) {
			this._uniqId = Dwt.getNextId();
		}
		return (this.id + "_" + this._uniqId);
	}
};

/**
 * true if startDate and endDate are on different days
 */
ZmCalBaseItem.prototype.isMultiDay =
function() {
	var start = this.startDate;
	var end = this.endDate;
	if (end.getHours() == 0 && end.getMinutes() == 0 && end.getSeconds() == 0) {
		// if end is the beginning of day, then disregard that it
		// technically crossed a day boundary for the purpose of
		// determining if it is a multi-day appt
		end = new Date(end.getTime() - 2 * AjxDateUtil.MSEC_PER_HOUR);
	}
	return (start.getDate() != end.getDate()) ||
		   (start.getMonth() != end.getMonth()) ||
		   (start.getFullYear() != end.getFullYear());
};

ZmCalBaseItem.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	var isAllDay = this.isAllDayEvent();
	var isMultiDay = this.isMultiDay();
	if (isAllDay) {
		if (emptyAllDay) return "";

		var start = this.startDate;
		var end = new Date(this.endDate.getTime() - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0));

		var pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		return AjxMessageFormat.format(pattern, [start, end]);
	}

	if (startOnly) {
		return ZmCalBaseItem._getTTHour(this.startDate);
	}

	var pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	return AjxMessageFormat.format(pattern, [this.startDate, this.endDate, ""]);
};

ZmCalBaseItem.prototype.isAlarmInRange =
function() {
	if (!this.alarmData) { return false; }

	var alarmData = this.alarmData[0];
	this._nextAlarmTime = alarmData.nextAlarm;
	this._alarmInstStart = alarmData.alarmInstStart;

	var currentTime = (new Date()).getTime();

    return (currentTime >= this._nextAlarmTime); 
};

ZmCalBaseItem.prototype.isAlarmInstance =
function() {
    if (!this.alarmData) { return false; }

    var alarmData = this.alarmData[0];
    this._alarmInstStart = alarmData.alarmInstStart;

    return (this._alarmInstStart == this.startDate.getTime());
};

ZmCalBaseItem.prototype.hasAlarmData =
function() {
    return (this.alarmData !=  null);
}

ZmCalBaseItem.prototype._loadFromDom =
function(calItemNode, instNode) {

	this.uid 			= calItemNode.uid;
	this.folderId 		= calItemNode.l || this._getDefaultFolderId();
	this.id 			= this._getAttr(calItemNode, instNode, "id");
	this.name 			= this._getAttr(calItemNode, instNode, "name");
	this.fragment 		= this._getAttr(calItemNode, instNode, "fr");
    this.status 		= this._getAttr(calItemNode, instNode, "status");
	this.ptst 			= this._getAttr(calItemNode, instNode, "ptst");
	this.isException 	= this._getAttr(calItemNode, instNode, "ex");
	this.allDayEvent	= (instNode.allDay || calItemNode.allDay)  ? "1" : "0";

	this.alarm 			= this._getAttr(calItemNode, instNode, "alarm");
	this.alarmData 		= this._getAttr(calItemNode, instNode, "alarmData");	
	this.priority 		= parseInt(this._getAttr(calItemNode, instNode, "priority"));

	this.recurring 		= instNode.recur != null ? instNode.recur : calItemNode.recur; // TEST for null since recur can be FALSE

    this.fba = this._getAttr(calItemNode, instNode, "fba");

	var sd = this._getAttr(calItemNode, instNode, "s");
	if (sd) {
        var tzo = instNode.tzo != null ? instNode.tzo : calItemNode.tzo;
		var adjustMs = this.isAllDayEvent() ? (tzo + new Date(instNode.s).getTimezoneOffset()*60*1000) : 0;
		var startTime = parseInt(sd,10) + adjustMs;
		this.startDate = new Date(startTime);
		this.uniqStartTime = this.startDate.getTime();
	}

	var dur = this._getAttr(calItemNode, instNode, "dur");
	if (dur) {
		var endTime = startTime + (parseInt(dur));
		this.endDate = new Date(endTime);
	}
	
	this.otherAttendees = this._getAttr(calItemNode, instNode, "otherAtt");
	this.location = this._getAttr(calItemNode, instNode, "loc");
};

ZmCalBaseItem.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

ZmCalBaseItem.prototype._getAttr =
function(calItem, inst, name) {
	return inst[name] || calItem[name];
};

ZmCalBaseItem.prototype._addLocationToSoap =
function(inv) {
	inv.setAttribute("loc", this.getLocation());
};

ZmCalBaseItem._getTTHour =
function(d) {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(d);
};


ZmCalBaseItem.prototype.getReminderLocation =
function()
{
    var alarmData = this.alarmData[0];
    return alarmData.loc ? alarmData.loc : "";
}


ZmCalBaseItem.prototype.getReminderName =
function()
{
    var alarmData = this.alarmData[0];
    return alarmData.name ? alarmData.name : "";
}
