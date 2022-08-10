/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * Defines the "group" resource type.
 */
ZmCalBaseItem.GROUP					= "GROUP";
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
 * Gets the alarm instance start time
 *
 * @return	{Date}	the alarmInst time
 */
ZmCalBaseItem.prototype.getAlarmInstStart = function() { return this._alarmInstStart; }; 	// alarm inst time in ms

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

    if(!start && !end) { return false; }

    if(!start) { return false; }

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
 * @param   {Boolean}   getSimpleText   if <code>true</code>, use the modified representation for duration where:
 * 1. For one day all day event we show only "All day" before event name and omit the Date information
 * 2. For multiday all day event we just show  final start/end date and omit time information and other words.
 * 3. For appt that entirely falls in one day we omit day and just show time.
 * 4. For multiday appt we show final start/end date&time
 * @return	{String}	the duration text
 */
ZmCalBaseItem.prototype.getDurationText =
function(emptyAllDay, startOnly, getSimpleText) {
	var isAllDay = this.isAllDayEvent();
	var isMultiDay = this.isMultiDay();
	var pattern;
	
	if (isAllDay) {
		if (emptyAllDay) return "";

		var start = this.startDate;
		var end = new Date(this.endDate.getTime() - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0));	

		if (getSimpleText) {
			if (isMultiDay) {
				pattern = ZmMsg.apptTimeAllDayMultiCondensed;
			}
			else {
				return ZmMsg.allDay;
			}
		}
		else {
			pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		}
		return AjxMessageFormat.format(pattern, [start, end]);
	}

	if (startOnly) {
		return ZmCalBaseItem._getTTHour(this.startDate);
	}

	if (getSimpleText) {
		pattern = isMultiDay ? ZmMsg.apptTimeInstanceMultiCondensed : ZmMsg.apptTimeInstanceCondensed;
	}
	else {
		pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	}
	
	return AjxMessageFormat.format(pattern, [this.getDateInLocalTimezone(this.startDate), this.getDateInLocalTimezone(this.endDate), ""]);
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
    var alarmData = this.alarmData ? this.alarmData[0] : null;

    if (!alarmData ||
        !alarmData.alarmInstStart ||
        !this.startDate) {
        return false;
    }
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
	this.isException 	= instNode.ex; 
	this.id 			= calItemNode.id;
	this.name 			= this._getAttr(calItemNode, instNode, "name");
	this.fragment 		= this._getAttr(calItemNode, instNode, "fr");
	this.status 		= this._getAttr(calItemNode, instNode, "status");
	this.ptst 			= this._getAttr(calItemNode, instNode, "ptst");
	
	this.allDayEvent	= (instNode.allDay || calItemNode.allDay)  ? "1" : "0";
	this.organizer		= calItemNode.or && calItemNode.or.a;
	this.isOrg 			= this._getAttr(calItemNode, instNode, "isOrg");
	this.transparency	= this._getAttr(calItemNode, instNode, "transp");

	if (instNode.allDay == false) {
		this.allDayEvent = "0";
	}

	this.alarm 			= this._getAttr(calItemNode, instNode, "alarm");
	this.alarmData 		= this._getAttr(calItemNode, instNode, "alarmData");
    if (!this.alarmData && this.isException) {
        this.alarmData  = calItemNode.alarmData;
    }
	this.priority 		= parseInt(this._getAttr(calItemNode, instNode, "priority"));

	this.recurring 		= instNode.recur != null ? instNode.recur : calItemNode.recur; // TEST for null since recur can be FALSE
    this.ridZ 			= this.recurring && instNode && instNode.ridZ;

	this.fba = this._getAttr(calItemNode, instNode, "fba");

	var sd = instNode.s !=null ? instNode.s : calItemNode.inst && calItemNode.inst.length > 0 &&  calItemNode.inst[0].s;
	if (sd) {
        var tzo = this.tzo = instNode.tzo != null ? instNode.tzo : calItemNode.tzo;
		var adjustMs = this.isAllDayEvent() ? (tzo + new Date(sd).getTimezoneOffset()*60*1000) : 0;
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
	return appCtxt.get(ZmSetting.CAL_DEFAULT_ID);
};

/**
 * @private
 */
ZmCalBaseItem.prototype._getAttr =
function(calItem, inst, name) {
	return inst[name] != null ? inst[name] : inst.ex ? null : calItem[name];
};

/**
 * @private
 */
ZmCalBaseItem.prototype._addLocationToRequest =
function(inv) {
    inv.loc = this.getLocation();
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
 * Gets alarm info
 *
 * @return	{Object}    the alarm information
 */
ZmCalBaseItem.prototype.getAlarmData =
function() {
	return this.alarmData;
}

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
		? ([organizer.getRestUrl(), "/?id=", AjxStringUtil.urlComponentEncode(this.id || this.invId)].join(""))
		: null;

	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};

ZmCalBaseItem.prototype.getDateInLocalTimezone =
function(date) {
    var apptTZ = this.getTimezone();
    var localTZ = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    if(apptTZ != localTZ) {
        var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, date);
        var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(apptTZ), date);
        return new Date(date.getTime() + (offset1 - offset2)*60*1000);
    }
    return date;
};

