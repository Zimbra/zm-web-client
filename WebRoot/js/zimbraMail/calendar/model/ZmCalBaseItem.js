/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines a base calendar item.
 *
 */

/**
 * @class
 * This class represents the base calendar item.
 * 
 * @param	{constant}	type	the item type
 * @param	{ZmList}	list		the list
 * @param	{String}	id		the id
 * @param	{String}	folderId	the folder id
 * @extends	ZmItem
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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmCalBaseItem.prototype.toString =
function() {
	return "ZmCalBaseItem";
};


// consts
/**
 * Defines the "person" resource type.
 */
ZmCalBaseItem.PERSON				= "PERSON";
/**
 * Defines the "optional person" resource type.
 */
ZmCalBaseItem.OPTIONAL_PERSON		= "OPT_PERSON";
/**
 * Defines the "location" resource type.
 */
ZmCalBaseItem.LOCATION				= "LOCATION";
/**
 * Defines the "equipment" resource type.
 */
ZmCalBaseItem.EQUIPMENT				= "EQUIPMENT";
ZmCalBaseItem.FORWARD				= "FORWARD";

/**
 * Defines the "accept" participant status.
 */
ZmCalBaseItem.PSTATUS_ACCEPT		= "AC";			// vevent, vtodo
/**
 * Defines the "declined" participant status.
 */
ZmCalBaseItem.PSTATUS_DECLINED		= "DE";			// vevent, vtodo
/**
 * Defines the "deferred" participant status.
 */
ZmCalBaseItem.PSTATUS_DEFERRED		= "DF";			// vtodo					[outlook]
/**
 * Defines the "delegated" participant status.
 */
ZmCalBaseItem.PSTATUS_DELEGATED		= "DG";			// vevent, vtodo
/**
 * Defines the "needs action" participant status.
 */
ZmCalBaseItem.PSTATUS_NEEDS_ACTION	= "NE";			// vevent, vtodo
/**
 * Defines the "completed" participant status.
 */
ZmCalBaseItem.PSTATUS_COMPLETED		= "CO";			// vtodo
/**
 * Defines the "tentative" participant status.
 */
ZmCalBaseItem.PSTATUS_TENTATIVE		= "TE";			// vevent, vtodo
/**
 * Defines the "waiting" participant status.
 */
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
 * Compares two appointments by start time and duration.
 *
 * @param {ZmCalBaseItem}	a		an appointment
 * @param {ZmCalBaseItem}	b		an appointment
 * @return	{int}	1 if start time "a" is after "b" or duration "a" is shorter than "b"; 1 if start time "b" is after "a" or duration "b" is shorter than "a"; 0 if both are the same 
 */
ZmCalBaseItem.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime()) 	return 1;
	if (a.getStartTime() < b.getStartTime()) 	return -1;
	if (a.getDuration() < b.getDuration()) 		return 1;
	if (a.getDuration() > b.getDuration()) 		return -1;
	return 0;
};

/**
 * Creates the item from the DOM.
 * 
 * @private
 */
ZmCalBaseItem.createFromDom =
function(apptNode, args, instNode) {
	var appt = new ZmCalBaseItem(ZmItem.APPT, args.list);
	appt._loadFromDom(apptNode, (instNode || {}));
	return appt;
};

/**
 * Gets the name (the "subject").
 * 
 * @return	{String}	the name
 */
ZmCalBaseItem.prototype.getName 		= function() { return this.name || ""; };			// name (aka Subject) of appt

/**
 * Gets the end time.
 * 
 * @return	{Date}	the end time
 */
ZmCalBaseItem.prototype.getEndTime 		= function() { return this.endDate.getTime(); }; 	// end time in ms

/**
 * Gets the start time.
 * 
 * @return	{Date}	the start time
 */
ZmCalBaseItem.prototype.getStartTime 	= function() { return this.startDate.getTime(); }; 	// start time in ms

/**
 * Gets the duration.
 * 
 * @return	{int}	the duration (in milliseconds)
 */
ZmCalBaseItem.prototype.getDuration 	= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
/**
 * Gets the location.
 * 
 * @return	{String}	the location
 */
ZmCalBaseItem.prototype.getLocation		= function() { return this.location || ""; };
/**
 * Checks if the item is an all day event.
 * 
 * @return	{Boolean}	<code>true</code> if all day event
 */
ZmCalBaseItem.prototype.isAllDayEvent	= function() { return this.allDayEvent == "1"; };

/**
 * Gets the participant status as a string.
 * 
 * @return	{String}	the participant status
 */
ZmCalBaseItem.prototype.getParticipantStatusStr =
function() { 
	return ZmCalBaseItem._pstatusString[this.ptst]; 
};

/**
 * Gets the unique id for this item.
 * 
 * @param	{Boolean}	useStartTime	if <code>true</code>, use the start time
 * @return	{String}	the unique id
 */
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
 * Checks if this item is multi-day.
 * 
 * @return	{Boolean}	<code>true</code> if start date and end date are on different days
 * 
 * @see		#getStartTime
 * @see		#getEndTime
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

/**
 * Gets the duration text.
 * 
 * @param	{Boolean}	emptyAllDay		if <code>true</code>, return empty string if all day event
 * @param	{Boolean}	startOnly		if <code>true</code>, use start date only
 * @return	{String}	the duration text
 */
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

/**
 * Checks if alarm is in range (based on current time).
 * 
 * @return	{Boolean}	<code>true</code> if the alarm is in range
 */
ZmCalBaseItem.prototype.isAlarmInRange =
function() {
	if (!this.alarmData) { return false; }

	var alarmData = this.alarmData[0];
	
	if (!alarmData) { return false; }
	
    this._nextAlarmTime = this.adjustMS(alarmData.nextAlarm, this.tzo);
    this._alarmInstStart = this.adjustMS(alarmData.alarmInstStart, this.tzo);

	var currentTime = (new Date()).getTime();

    return (currentTime >= this._nextAlarmTime); 
};

/**
 * Adjusts milliseconds.
 * 
 * @param	{int}	s		the seconds
 * @param	{int}	tzo		the timezone offset
 * @return	{int}	the resulting milliseconds
 */
ZmCalBaseItem.prototype.adjustMS =
function(s, tzo) {
    var adjustMs = this.isAllDayEvent() ? (tzo + new Date(s).getTimezoneOffset()*60*1000) : 0;
    return parseInt(s, 10) + adjustMs;
};

/**
 * Checks if this is an alarm instance.
 * 
 * @return	{Boolean}	<code>true</code> if this is an alarm instance
 */
ZmCalBaseItem.prototype.isAlarmInstance =
function() {
    if (!this.alarmData) { return false; }

    var alarmData = this.alarmData[0];
    this._alarmInstStart = this.adjustMS(alarmData.alarmInstStart, this.tzo);

    return (this._alarmInstStart == this.startDate.getTime());
};

/**
 * Checks if this item has alarm data.
 * 
 * @return	{Boolean}	 <code>true</code> if item has alarm data
 */
ZmCalBaseItem.prototype.hasAlarmData =
function() {
	return (this.alarmData !=  null);
};

/**
 * @private
 */
ZmCalBaseItem.prototype._loadFromDom =
function(calItemNode, instNode) {

	this.uid 			= calItemNode.uid;
	this.folderId 		= calItemNode.l || this._getDefaultFolderId();
	this.invId			= calItemNode.invId;
	this.id 			= this._getAttr(calItemNode, instNode, "id");
	this.name 			= this._getAttr(calItemNode, instNode, "name");
	this.fragment 		= this._getAttr(calItemNode, instNode, "fr");
	this.status 		= this._getAttr(calItemNode, instNode, "status");
	this.ptst 			= this._getAttr(calItemNode, instNode, "ptst");
	this.isException 	= this._getAttr(calItemNode, instNode, "ex");
	this.allDayEvent	= (instNode.allDay || calItemNode.allDay)  ? "1" : "0";
	this.organizer		= calItemNode.or && calItemNode.or.a;
	this.isOrg 			= this._getAttr(calItemNode, instNode, "isOrg");
	this.transparency	= this._getAttr(calItemNode, instNode, "transp");

	if (instNode.allDay == false) {
		this.allDayEvent = "0";
	}

	this.alarm 			= this._getAttr(calItemNode, instNode, "alarm");
	this.alarmData 		= this._getAttr(calItemNode, instNode, "alarmData");	
	this.priority 		= parseInt(this._getAttr(calItemNode, instNode, "priority"));

	this.recurring 		= instNode.recur != null ? instNode.recur : calItemNode.recur; // TEST for null since recur can be FALSE

	this.fba = this._getAttr(calItemNode, instNode, "fba");

	var sd = this._getAttr(calItemNode, instNode, "s");
	if (sd) {
        var tzo = this.tzo = instNode.tzo != null ? instNode.tzo : calItemNode.tzo;
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

/**
 * @private
 */
ZmCalBaseItem.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

/**
 * @private
 */
ZmCalBaseItem.prototype._getAttr =
function(calItem, inst, name) {
	return inst[name] != null ? inst[name] : calItem[name];
};

/**
 * @private
 */
ZmCalBaseItem.prototype._addLocationToSoap =
function(inv) {
	inv.setAttribute("loc", this.getLocation());
};

/**
 * @private
 */
ZmCalBaseItem._getTTHour =
function(d) {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(d);
};


ZmCalBaseItem.prototype.getReminderLocation =
function() {
	return (this.alarmData[0].loc || "");
};

/**
 * Gets the reminder name.
 * 
 * @return	{String}	the reminder name or empty string if not set
 */
ZmCalBaseItem.prototype.getReminderName =
function() {
	return (this.alarmData[0].name || "");
};

/**
 * Checks if the alarm is old (based on current time).
 * 
 * @return	{Boolean}	<code>true</code> if the alarm is old
 */
ZmCalBaseItem.prototype.isAlarmOld =
function() {
	if (!this.alarmData) { return false; }

	var alarmData = this.alarmData[0];
	this._nextAlarmTime = alarmData.nextAlarm;
	this._alarmInstStart = alarmData.alarmInstStart;

	var currentTime = (new Date()).getTime();

    var diff = (currentTime - this._nextAlarmTime);

    //reminder controller takes 1 minute interval for house keeping schedule
    //if the diff is greater than 2 minutes (safer deadline) mark the alarm as old
    if(diff > 2*60*1000) {
        return true;
    }
    return false;
};

ZmCalBaseItem.prototype.getRestUrl =
function() {
	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	var organizer = appCtxt.getById(this.folderId);
	var url = organizer
		? ([organizer.getRestUrl(), "/?id=", AjxStringUtil.urlComponentEncode(this.id)].join(""))
		: null;

	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};
