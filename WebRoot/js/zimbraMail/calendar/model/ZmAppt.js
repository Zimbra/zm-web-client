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
function ZmAppt(appCtxt, list, noinit, type) {

	ZmItem.call(this, appCtxt, (type || ZmItem.APPT), list);

	if (noinit) return;

	this.id = -1;
	this.uid = -1;																// iCal uid of appt
	this.name = "";
	this.fragment = "";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + (30*60*1000));
	this.transparency = "FR";
	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.allDayEvent = "0";
	this.exception = this.recurring = this.alarm = this.otherAttendees = false;
	this.notesTopPart = null; 													// ZmMimePart containing children w/ different message parts
	this.status = null;															// status (TENT|CONF|CANC|NEED|COMP|INPR|WAITING|DEFERRED)
	this.ptst = null;															// participant status
	this.attachments = null;
	this.timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	this.folderId = ZmOrganizer.ID_CALENDAR;

	this._viewMode = ZmAppt.MODE_NEW;
	this._recurrence = new ZmRecurrence(this);

	// attendees by type
	this._attendees = {};
	this._attendees[ZmAppt.PERSON]		= [];
	this._attendees[ZmAppt.LOCATION]	= [];
	this._attendees[ZmAppt.EQUIPMENT]	= [];

	this._origAttendees = null;	// list of ZmContact
	this._origLocations = null;	// list of ZmResource
	this._origEquipment = null;	// list of ZmResource
};

ZmAppt.prototype = new ZmItem;
ZmAppt.prototype.constructor = ZmAppt;

// Consts

ZmAppt.MODE_NEW						= 1;
ZmAppt.MODE_EDIT					= 2;
ZmAppt.MODE_EDIT_SINGLE_INSTANCE	= 3;
ZmAppt.MODE_EDIT_SERIES				= 4;
ZmAppt.MODE_DELETE					= 5;
ZmAppt.MODE_DELETE_INSTANCE			= 6;
ZmAppt.MODE_DELETE_SERIES			= 7;
ZmAppt.MODE_DRAG_OR_SASH			= 8;
ZmAppt.MODE_NEW_FROM_QUICKADD 		= 9;

ZmAppt.SOAP_METHOD_REQUEST			= 1;
ZmAppt.SOAP_METHOD_REPLY			= 2;
ZmAppt.SOAP_METHOD_CANCEL			= 3;

ZmAppt.PERSON		= 1;
ZmAppt.LOCATION		= 2;
ZmAppt.EQUIPMENT	= 3;

ZmAppt.ATTENDEES_SEPARATOR	= "; ";

ZmAppt.STATUS_TENTATIVE		= "TENT";
ZmAppt.STATUS_CONFIRMED		= "CONF";
ZmAppt.STATUS_CANCELLED		= "CANC";

ZmAppt.ROLE_CHAIR			= "CHA";
ZmAppt.ROLE_REQUIRED		= "REQ";
ZmAppt.ROLE_OPTIONAL		= "OPT";
ZmAppt.ROLE_NON_PARTICIPANT	= "NON";

ZmAppt.PSTATUS_NEEDS_ACTION	= "NE";
ZmAppt.PSTATUS_TENTATIVE	= "TE";
ZmAppt.PSTATUS_ACCEPT		= "AC";
ZmAppt.PSTATUS_DECLINED		= "DE";
ZmAppt.PSTATUS_DELEGATED	= "DG";

ZmAppt.CUTYPE_INDIVIDUAL	= "IND";
ZmAppt.CUTYPE_GROUP			= "GRO";
ZmAppt.CUTYPE_RESOURCE		= "RES";
ZmAppt.CUTYPE_ROOM			= "ROO";
ZmAppt.CUTYPE_UNKNOWN		= "UNK";

ZmAppt.SERVER_WEEK_DAYS				= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
ZmAppt.NOTES_SEPARATOR				= "*~*~*~*~*~*~*~*~*~*";

ZmAppt.ATTACHMENT_CHECKBOX_NAME 	= Dwt.getNextId();

ZmAppt._pstatusString = {
	NE: "NEW",	//	ZmMsg.needsAction,		// HACK: i18n
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
};


ZmAppt.prototype.toString = 
function() {
	return "ZmAppt";
};


// Getters

ZmAppt.prototype.getAttendees					= function() { return this._attendees[ZmAppt.PERSON]; };
ZmAppt.prototype.getLocations					= function() { return this._attendees[ZmAppt.LOCATION]; };
ZmAppt.prototype.getEquipment					= function() { return this._attendees[ZmAppt.EQUIPMENT]; };
ZmAppt.prototype.getOrigAttendees 				= function() { return this._origAttendees; };
ZmAppt.prototype.getOrigLocations 				= function() { return this._origLocations; };
ZmAppt.prototype.getOrigEquipment 				= function() { return this._origEquipment; };
ZmAppt.prototype.getDuration 					= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
ZmAppt.prototype.getEndTime 					= function() { return this.endDate.getTime(); }; 	// end time in ms
ZmAppt.prototype.getFolderId 					= function() { return this.folderId || ZmOrganizer.ID_CALENDAR; };
ZmAppt.prototype.getId 							= function() { return this.id; }; 					// mail item id on appt instance
ZmAppt.prototype.getMessage 					= function() { return this._message; };
ZmAppt.prototype.getName 						= function() { return this.name || ""; };			// name (aka Subject) of appt
ZmAppt.prototype.getOrganizer 					= function() { return this.organizer || ""; };
ZmAppt.prototype.getOrigStartDate 				= function() { return this._origStartDate || this.startDate; };
ZmAppt.prototype.getOrigStartTime 				= function() { return this.getOrigStartDate().getTime(); };
ZmAppt.prototype.getParticipationStatusString 	= function() { return ZmAppt._pstatusString[this.ptst]; };
ZmAppt.prototype.getRecurBlurb					= function() { return this._recurrence.getBlurb(); };
ZmAppt.prototype.getRecurType					= function() { return this._recurrence.repeatType; };
ZmAppt.prototype.getStartTime 					= function() { return this.startDate.getTime(); }; 	// start time in ms
ZmAppt.prototype.getViewMode 					= function() { return this._viewMode; };
ZmAppt.prototype.getType 						= function() { return this.type; };					// type of appt (event|todo)
ZmAppt.prototype.getUniqueStartTime 			= function() { return this._uniqStartTime; }; 		// returns unique start time for an instance of recurring appt
ZmAppt.prototype.getUniqueId =
function(useStartTime) {
	if (useStartTime) {
		if (!this._startTimeUniqId) this._startTimeUniqId = this.id + "_" + this.getStartTime();
		return this._startTimeUniqId;
	} else {
		if (this._uniqId == null)
			this._uniqId = Dwt.getNextId();
		return (this.id + "_" + this._uniqId);
	}
};

ZmAppt.prototype.getAttendeesText		= function() { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.PERSON], ZmAppt.PERSON); };
ZmAppt.prototype.getLocationsText		= function(includeDisplayName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.LOCATION], ZmAppt.LOCATION, includeDisplayName); };
ZmAppt.prototype.getLocation			= function(includeDisplayName) { return this.getLocationsText(includeDisplayName); };
ZmAppt.prototype.getEquipmentText		= function(includeDisplayName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.EQUIPMENT], ZmAppt.EQUIPMENT, includeDisplayName); };
ZmAppt.prototype.getOrigLocationsText	= function(includeDisplayName) { return ZmApptViewHelper.getAttendeesString(this._origLocations, ZmAppt.LOCATION, includeDisplayName); };
ZmAppt.prototype.getOrigLocation		= function(includeDisplayName) { return this.getOrigLocationsText(includeDisplayName); };
ZmAppt.prototype.getOrigEquipmentText	= function(includeDisplayName) { return ZmApptViewHelper.getAttendeesString(this._origEquipment, ZmAppt.EQUIPMENT, includeDisplayName); };
ZmAppt.prototype.isAllDayEvent 			= function() { return this.allDayEvent == "1"; };
ZmAppt.prototype.isCustomRecurrence 	= function() { return this._recurrence.repeatCustom == "1" || this._recurrence.repeatEndType != "N"; };
ZmAppt.prototype.isException 			= function() { return this.exception || false; };
ZmAppt.prototype.isOrganizer 			= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
ZmAppt.prototype.isRecurring 			= function() { return (this.recurring || (this._rawRecurrences != null)); };
ZmAppt.prototype.hasAttachments 		= function() { return this.getAttachments() != null; };
ZmAppt.prototype.hasDetails 			= function() { return this.getMessage() != null; };
ZmAppt.prototype.hasOtherAttendees 		= function() { return this.otherAttendees; };


// Setters
ZmAppt.prototype.setAllDayEvent 		= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
ZmAppt.prototype.setFolderId 			= function(folderId) 	{ this.folderId = folderId || ZmOrganizer.ID_CALENDAR; };
ZmAppt.prototype.setFreeBusy 			= function(fb) 			{ this.freeBusy = fb || "B"; };
ZmAppt.prototype.setOrganizer 			= function(organizer) 	{ this.organizer = organizer != "" ? organizer : null; };
ZmAppt.prototype.setMessage 			= function(message) 	{ this._message = message; };
ZmAppt.prototype.setName 				= function(newName) 	{ this.name = newName; };
ZmAppt.prototype.setType 				= function(newType) 	{ this.type = newType; };
ZmAppt.prototype.setRecurType			= function(repeatType)	{ this._recurrence.repeatType = repeatType; };

ZmAppt.prototype.setEndDate =
function(endDate, keepCache) {
	this.endDate = new Date(endDate instanceof Date ? endDate.getTime(): endDate);
	if (!keepCache)
		this._resetCached();
};

ZmAppt.prototype.setStartDate =
function(startDate, keepCache) {
	if (this._origStartDate == null && this.startDate != null) {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate instanceof Date ? startDate.getTime() : startDate);
	if (!keepCache)
		this._resetCached();
};

/**
* Sets the attendees (person, location, or equipment) for this appt.
*
* @param list	[array]		list of email string, ZmEmailAddress, ZmContact, or ZmResource
*/
ZmAppt.prototype.setAttendees =
function(list, type) {
	this._attendees[type] = [];
	list = (list instanceof Array) ? list : [list];
	for (var i = 0; i < list.length; i++) {
		var attendee = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, list[i], type);
		if (attendee) {
			this._attendees[type].push(attendee);
		}
	}
};

// Public methods

/**
 * This method sets the view mode, and resets any other fields that should not 
 * be set for that view mode.
 */
ZmAppt.prototype.setViewMode = 
function(mode) {
	this._viewMode = mode || ZmAppt.MODE_NEW;

	if (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE)
		this._recurrence.repeatType = "NON";
};

/**
* Used to make our own copy because the form will modify the date object by 
* calling its setters instead of replacing it with a new date object.
*/
ZmApptClone = function() { }
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

	return newAppt;
}

/**
 * Walks the notesParts array looking for the first part that matches given 
 * content type - for now, returns the content (but we could just return the whole part?)
*/
ZmAppt.prototype.getNotesPart = 
function(contentType) {
	if (this.notesTopPart) {
		var ct = contentType || ZmMimeTable.TEXT_PLAIN;
		var content = this.notesTopPart.getContentForType(ct);

		// if requested content type not found, try the other
		if (content == null || content == "") {
			if (ct == ZmMimeTable.TEXT_PLAIN) {
				var div = document.createElement("div");
				content = this.notesTopPart.getContentForType(ZmMimeTable.TEXT_HTML);
				div.innerHTML = content || "";
				var text = AjxStringUtil.convertHtml2Text(div);
				return text.substring(1); // above func prepends \n due to div
			} else if (ct == ZmMimeTable.TEXT_HTML) {
				content = AjxStringUtil.convertToHtml(this.notesTopPart.getContentForType(ZmMimeTable.TEXT_PLAIN));
			}
		}
		return AjxUtil.isString(content) ? content : content.content;
	} else {
		return this.fragment;
	}
};

ZmAppt.prototype.getCalendar =
function() {
	var ct = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
	return ct ? ct.getById(this.getFolderId()) : null;
};

// returns "owner" of remote/shared calendar this appt belongs to
// (null if calendar is not remote/shared)
ZmAppt.prototype.getRemoteCalendarOwner =
function() {
	var cal = this.getCalendar();
	return cal && cal.link ? cal.owner : null;
};

ZmAppt.prototype.isReadOnly =
function() { 
	var isLinkAndReadOnly = false;
	var cal = this.getCalendar();
	// if we're dealing w/ a shared cal, find out if we have any write access
	if (cal.link) {
		var share = cal.getShares()[0];
		isLinkAndReadOnly = share && !share.isWrite();
	}

	return !this.isOrganizer() || isLinkAndReadOnly;
};

ZmAppt.prototype.isShared =
function() {
	return (this.id && this.id != -1)
		? (this.id.indexOf(":") != -1) : false;
};

ZmAppt.prototype.resetRepeatWeeklyDays = 
function() {
	this._recurrence.repeatWeeklyDays = [ZmAppt.SERVER_WEEK_DAYS[this.startDate.getDay()]];
};

ZmAppt.prototype.resetRepeatMonthlyDayList = 
function() {
	this._recurrence.repeatMonthlyDayList = [this.startDate.getDate()];
};

ZmAppt.prototype.resetRepeatYearlyMonthsList =
function(mo) {
	this._recurrence.repeatYearlyMonthsList = mo;
};

ZmAppt.prototype.resetRepeatCustomDayOfWeek =
function() {
	this._recurrence.repeatCustomDayOfWeek = ZmAppt.SERVER_WEEK_DAYS[this.startDate.getDay()];
};

ZmAppt.prototype.isOverlapping =
function(other, checkFolder) {
	if (checkFolder && this.getFolderId() != other.getFolderId()) return false;

	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();
	
	return (tst < oet) && (tet > ost);
};

ZmAppt.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();	
	return (tst < endTime && tet > startTime);
};

/**
 * return true if the start time of this appt is within range
 */
ZmAppt.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * return true if the end time of this appt is within range
 */
ZmAppt.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

ZmAppt.prototype.setDateRange = 
function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
};

ZmAppt.prototype.getDateRange = 
function(instance, current, refPath) {
	return { startDate:this.startDate, endDate: this.endDate };
};

/**
 * true if startDate and endDate are on different days
 */
ZmAppt.prototype.isMultiDay =
function() {
	return (this.startDate.getDate() != this.endDate.getDate()) ||
		   (this.startDate.getMonth() != this.endDate.getMonth()) ||
		   (this.startDate.getFullYear() != this.endDate.getFullYear());
};

/**
 * accepts a comma delimeted string of ids
 */
ZmAppt.prototype.setAttachments = 
function(ids) {
	this.attachments = [];

	if (ids && ids.length > 0) {
		var split = ids.split(',');
		for (var i = 0 ; i < split.length; i++)
			this.attachments[i] = { id:split[i] };
	}
};

ZmAppt.prototype.getAttachments = 
function() {
	var m = this.getMessage();	
	if (this.hasDetails() && m._attachments != null) {
		var attachs = m._attachments;
		if (this._validAttachments == null) {
			this._validAttachments = [];
			for (var i = 0; i < attachs.length; ++i) {
				if (m.isRealAttachment(attachs[i]))
					this._validAttachments.push(attachs[i]);
			}
		}
		return this._validAttachments.length > 0 ? this._validAttachments : null;
	}
	return null;
};

ZmAppt.prototype.removeAttachment = 
function(part) {
	if (this._validAttachments && this._validAttachments.length > 0) {
		for (var i = 0; i < this._validAttachments.length; i++) {
			if (this._validAttachments[i].part == part) {
				this._validAttachments.splice(i,1);
				break;
			}
		}
	}
};

ZmAppt.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	if (this.isAllDayEvent()) {
		if (emptyAllDay)
			return "";
		if (this.isMultiDay()) {
			var endDate = new Date(this.endDate.getTime());
			endDate.setDate(endDate.getDate()-1);

			var startDay = this._getTTDay(this.startDate);
			var endDay = this._getTTDay(endDate);

			if (!ZmAppt._daysFormatter) {
				ZmAppt._daysFormatter = new AjxMessageFormat(ZmMsg.durationDays);
			}
			return ZmAppt._daysFormatter.format( [ startDay, endDay ] );
		} else {
			return this._getTTDay(this.startDate);
		}

	} else {
		if (startOnly) {
			return ZmAppt._getTTHour(this.startDate);
		} else {
			var startHour = ZmAppt._getTTHour(this.startDate);
			var endHour = ZmAppt._getTTHour(this.endDate);
		
			if (!ZmAppt._hoursFormatter) {
				ZmAppt._hoursFormatter = new AjxMessageFormat(ZmMsg.durationHours);
			}
			return ZmAppt._hoursFormatter.format( [startHour, endHour] );
		}			
	}
};

ZmAppt.prototype.getShortStartHour =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(this.startDate);
};

ZmAppt.prototype.getUniqueStartDate =
function() {
	if (this._uniqueStartDate == null) {
		this._uniqueStartDate = new Date(this.getUniqueStartTime());
	}
	return this._uniqueStartDate;
};

ZmAppt.prototype.getUniqueEndDate = 
function() {
	if (this._uniqueEndDate == null) {
		var st = this.getUniqueStartTime();
		var dur = this.getDuration();
		this._uniqueEndDate = new Date(st + dur);
	}
	return this._uniqueEndDate;
};

ZmAppt.prototype.getDetails =
function(viewMode, callback, errorCallback, ignoreOutOfDate) {
	var mode = viewMode || this._viewMode;
	
	var seriesMode = mode == ZmAppt.MODE_EDIT_SERIES;
	if (this._message == null) {
		var id = seriesMode ? (this._seriesInvId || this.invId) : this.invId;
		this._message = new ZmMailMsg(this._appCtxt, id);
		var respCallback = new AjxCallback(this, this._handleResponseGetDetails, [mode, this._message, callback]);
		var respErrorCallback = !ignoreOutOfDate ? new AjxCallback(this, this._handleErrorGetDetails, [mode, callback, errorCallback]) : errorCallback;
		this._message.load(this._appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback, respErrorCallback);
	} else {
		this.setFromMessage(this._message, mode);
		if (callback)
			callback.run();
	}
};

ZmAppt.prototype._handleErrorGetDetails =
function(mode, callback, errorCallback, ex) {
	if (ex.code == "mail.INVITE_OUT_OF_DATE") {
		var soapDoc = AjxSoapDoc.create("GetAppointmentRequest", "urn:zimbraMail");
		soapDoc.setMethodAttribute("id", this.id);

		var respCallback = new AjxCallback(this, this._handleErrorGetDetails2, [mode, callback, errorCallback]);
		var params = {
			soapDoc: soapDoc,
			asyncMode: true,
			callback: respCallback,
			errorCallback: errorCallback
		};
		this._appCtxt.getAppController().sendRequest(params);
		return true;
	}
	if (errorCallback) {
		return errorCallback.run(ex);
	}
	return false;
};

ZmAppt.prototype._handleErrorGetDetails2 =
function(mode, callback, errorCallback, result) {
	// Update invId and force a message reload
	var invite = result._data.GetAppointmentResponse.appt[0].inv[0];
	this.invId = [this.id, invite.id].join("-");
	this._message = null;
	var ignoreOutOfDate = true;
	this.getDetails(mode, callback, errorCallback, ignoreOutOfDate);
};

ZmAppt.prototype.setFromMessage =
function(message, viewMode) {
	if (message == this._currentlyLoaded)
		return;

	this.isOrg = message.invite.isOrganizer();
	this.organizer = message.invite.getOrganizerEmail();
	this.name = message.invite.getName();
	this.exception = message.invite.isException();
	this.freeBusy = message.invite.getFreeBusy();
	// if instance of recurring appointment, start date is generated from
	// unique start time sent in appointment summaries. Associated message
	// will contain only the original start time.
	var start = message.invite.getServerStartTime();
	var end = message.invite.getServerEndTime();
	if (viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE) {
		this.setStartDate(this.getUniqueStartDate());
		this.setEndDate(this.getUniqueEndDate());
	} else {
		this.setStartDate(AjxDateUtil.parseServerDateTime(start));
		this.setEndDate(AjxDateUtil.parseServerDateTime(end));
	}

	// record whether the start/end dates are in UTC
	this.startsInUTC = start.charAt(start.length-1) == "Z";
	this.endsInUTC = end.charAt(start.length-1) == "Z";

	// record timezone if given, otherwise, guess
	var tz = (message.invite.getServerStartTimeTz()) || (AjxTimezone.getServerId(AjxTimezone.DEFAULT));

	// adjust start/end times based on UTC/timezone
	if (viewMode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE) {
		ZmAppt.__adjustDateForTimezone(this.startDate, tz, this.startsInUTC);
		ZmAppt.__adjustDateForTimezone(this.endDate, tz, this.endsInUTC);
	}
	this.timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

	// parse out attendees for this invite
	this._attendees[ZmAppt.PERSON] = [];
	this._origAttendees = [];
	var attendees = message.invite.getAttendees();
	if (attendees) {
		for (var i = 0; i < attendees.length; i++) {
			var addr = attendees[i].url;
			var name = attendees[i].d;
			var email = new ZmEmailAddress(addr, null, name);
			var attendee = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, email, ZmAppt.PERSON);
			if (attendee) {
				this._attendees[ZmAppt.PERSON].push(attendee);
				this._origAttendees.push(attendee);
			}
		}
	}

	// Locations can be free-text or known, so we parse the "loc" string to
	// get them rather than looking at the invite's resources (which will
	// only contain known locations)
	this._attendees[ZmAppt.LOCATION] = [];
	this._origLocations = [];
	var locations = ZmEmailAddress.split(message.invite.getLocation());
	if (locations) {
		for (var i = 0; i < locations.length; i++) {
			var location = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, locations[i], ZmAppt.LOCATION);
			if (location && location.isLocation()) {
				this._attendees[ZmAppt.LOCATION].push(location);
				this._origLocations.push(location);
			}
		}
	}

	// Get equipment by email, make sure to exclude location resources
	this._attendees[ZmAppt.EQUIPMENT] = [];
	this._origEquipment = [];
	var resources = message.invite.getResources();	// returns all the invite's resources
	if (resources) {
		for (var i = 0; i < resources.length; i++) {
			// see if it's a known location
			var location = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, resources[i].url, ZmAppt.LOCATION, true, true);
			if (location) {
				continue;
			}
			var equipment = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, resources[i].url, ZmAppt.EQUIPMENT);
			if (equipment) {
				this._attendees[ZmAppt.EQUIPMENT].push(equipment);
				this._origEquipment.push(equipment);
			}
		}
	}

	this._setRecurrence(message);
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
};

ZmAppt.prototype.setFromMailMessage = 
function(message, subject) {
	this.name = subject;
	
	// Only unique names in the attendee list, plus omit our own name
	var used = {};
	used[this._appCtxt.get(ZmSetting.USERNAME)] = true;
	var addrs = message.getAddresses(ZmEmailAddress.FROM, used, true);
	addrs.addList(message.getAddresses(ZmEmailAddress.CC, used, true));
	addrs.addList(message.getAddresses(ZmEmailAddress.TO, used, true));
	this._attendees[ZmAppt.PERSON] = addrs.getArray();

	this._setNotes(message);
}

ZmAppt.prototype.setTextNotes = 
function(notes) {
	this.notesTopPart = new ZmMimePart();	
	this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
	this.notesTopPart.setContent(notes);	
}

ZmAppt.prototype._setRecurrence =
function(message) {
	var recurRules = message.invite.getRecurrenceRules();

	if (recurRules)
		this._recurrence.parse(recurRules);

	if (this._recurrence.repeatWeeklyDays == null)
		this.resetRepeatWeeklyDays();

	if (this._recurrence.repeatMonthlyDayList == null)
		this.resetRepeatMonthlyDayList();
};

ZmAppt.prototype._setNotes =
function(message) {
	var text = message.getBodyPart(ZmMimeTable.TEXT_PLAIN);
	var html = message.getBodyPart(ZmMimeTable.TEXT_HTML);

    this.notesTopPart = new ZmMimePart();
	if (html) {
        var htmlContent = this._trimNotesSummary(html.content, true);
        var textContent = AjxStringUtil.convertHtml2Text(htmlContent);

		// create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(textContent);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
		htmlPart.setContent(htmlContent);

        this.notesTopPart.setContentType(ZmMimeTable.MULTI_ALT);
        this.notesTopPart.children.add(textPart);
		this.notesTopPart.children.add(htmlPart);
	} else {
        var textContent = this._trimNotesSummary((text && text.content) || "");

		this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		this.notesTopPart.setContent(textContent);
	}
}

/**
* Returns HTML for a tool tip for this appt.
*/
ZmAppt.prototype.getToolTip =
function(calController) {
	if (this._orig)
		return this._orig.getToolTip(calController);

	if (!this._toolTip) {
		var params = { appt: this,
			cal: (this.getFolderId() != ZmOrganizer.ID_CALENDAR && calController) ? calController.getCalendar() : null,
			when: this.getDurationText(false, false),
			location: this.getLocation(true), width: "250" };

		this._toolTip = AjxTemplate.expand("zimbraMail.calendar.templates.Appointment#Tooltip", params);
	}
	return this._toolTip;
};

/**
 * @param attachmentId 		[string]*		ID of the already uploaded attachment
 * @param callback 			[AjxCallback]*	callback triggered once request for appointment save is complete
 * @param errorCallback 	[AjxCallback]*	callback triggered if error during appointment save request
 * @param notifyList 		[Array]*		optional sublist of attendees to be notified (if different from original list of attendees)
*/
ZmAppt.prototype.save = 
function(attachmentId, callback, errorCallback, notifyList) {
	var soapDoc = null;
	var accountName = this.getRemoteCalendarOwner();
	var needsExceptionId = false;

	if (this._viewMode == ZmAppt.MODE_NEW) {
		soapDoc = AjxSoapDoc.create("CreateAppointmentRequest", "urn:zimbraMail");
	} else if (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE && !this.isException()) {
		soapDoc = AjxSoapDoc.create("CreateAppointmentExceptionRequest", "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
		soapDoc.setMethodAttribute("s", this.getOrigStartTime());
		needsExceptionId = true;
	} else {
		soapDoc = AjxSoapDoc.create("ModifyAppointmentRequest", "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
		needsExceptionId = this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE;
	}

	var invAndMsg = this._setSimpleSoapAttributes(soapDoc, ZmAppt.SOAP_METHOD_REQUEST, attachmentId, notifyList, accountName);

	if (needsExceptionId) {
		var exceptId = soapDoc.set("exceptId", null, invAndMsg.inv);
        // bug 13529: exception id based on original appt, not new data
        if (this._orig.allDayEvent != "1") {
			var sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
			// bug fix #4697 (part 2)
			if (!this.startsInUTC && this.timezone) {
				var tz = AjxEnv.isSafari ? AjxStringUtil.xmlEncode(this.timezone) : this.timezone;
				exceptId.setAttribute("tz", tz);
			}
			if (AjxEnv.isSafari) sd = AjxStringUtil.xmlEncode(sd);
			exceptId.setAttribute("d", sd);
		} else {
			var sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
			if (AjxEnv.isSafari) sd = AjxStringUtil.xmlEncode(sd);
			exceptId.setAttribute("d", sd);
		}
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._recurrence.setSoap(soapDoc, invAndMsg.inv);
	}

	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

ZmAppt.prototype.move = 
function(folderId, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("ItemActionRequest", "urn:zimbraMail");
	var accountName = null;

	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", this.id);
	actionNode.setAttribute("op", "move");
	actionNode.setAttribute("l", folderId);
	
	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

ZmAppt.prototype.cancel = 
function(mode, msg, callback, errorCallback) {
	this.setViewMode(mode);
	if (msg) {
		// REVISIT: I have to explicitly set the bodyParts of the message
		//          because ZmComposeView#getMsg only sets the topPart on
		//          the new message that's returned. And ZmAppt#_setNotes
		//          calls ZmMailMsg#getBodyPart.
		var bodyParts = [];
		var childParts = msg._topPart.node.ct == ZmMimeTable.MULTI_ALT
				? msg._topPart.children.getArray()
				: [msg._topPart];
		for (var i = 0; i < childParts.length; i++) {
			bodyParts.push(childParts[i].node);
		}
		msg.setBodyParts(bodyParts);
		this._setNotes(msg);
		this._doCancel(mode, callback, msg);
	} else {
		// To get the attendees for this appointment, we have to get the message.
		var respCallback = new AjxCallback(this, this._doCancel, [mode, callback, null]);
		this.getDetails(null, respCallback, errorCallback);
	}
};

ZmAppt.prototype._doCancel =
function(mode, callback, msg, result) {
	if (mode == ZmAppt.MODE_DELETE || mode == ZmAppt.MODE_DELETE_SERIES || mode == ZmAppt.MODE_DELETE_INSTANCE) {
		var soapDoc = AjxSoapDoc.create("CancelAppointmentRequest", "urn:zimbraMail");
		var accountName = this.getRemoteCalendarOwner();
		this._addInviteAndCompNum(soapDoc);

		if (mode == ZmAppt.MODE_DELETE_INSTANCE) {
			soapDoc.setMethodAttribute("s", this.getOrigStartTime());
			var inst = soapDoc.set("inst");
            var allDay = this.isAllDayEvent();
            var format = allDay ? AjxDateUtil.getServerDate : AjxDateUtil.getServerDateTime;
            inst.setAttribute("d", format(this.getOrigStartDate()));
            if (!allDay && this.timezone) {
                var tz = AjxEnv.isSafari ? AjxStringUtil.xmlEncode(this.timezone) : this.timezone;
				inst.setAttribute("tz", tz);

                var clientId = AjxTimezone.getClientId(this.timezone);
                ZmTimezone.set(soapDoc, clientId, null, true);
			}
		}

		var m = soapDoc.set("m");
		if (this.isOrganizer()) {
			// NOTE: We only use the explicit list of addresses if sending via
			//       a message compose.
			if (msg) {
				for (var i = 0; i < ZmMailMsg.ADDRS.length; i++) {
					var type = ZmMailMsg.ADDRS[i];
					// if on-behalf-of, dont set the from address
					if (accountName && type == ZmEmailAddress.FROM)
						continue;
					var vector = msg.getAddresses(type);
					var count = vector.size();
					for (var j = 0; j < count; j++) {
						var addr = vector.get(j);
						var e = soapDoc.set("e", null, m);
						e.setAttribute("a", addr.getAddress());
						e.setAttribute("t", ZmEmailAddress.toSoapType[type]);
					}
				}

				// set from address to on-behalf-of if applicable
				if (accountName) {
					var e = soapDoc.set("e", null, m);
					e.setAttribute("a", accountName);
					e.setAttribute("t", ZmEmailAddress.toSoapType[ZmEmailAddress.FROM]);
				}
			}
			else {
				this._addAttendeesToSoap(soapDoc, null, m, null, accountName);
			}
		}
		soapDoc.set("su", "Cancelled: " + this.name, m); // XXX: i18n?
		this._addNotesToSoap(soapDoc, m, true);
		this._sendRequest(soapDoc, accountName, callback);
	} else {
		if (callback) callback.run();
	}
};

// Returns canned text for meeting invites.
// - Instances of recurring meetings should send out information that looks very
//   much like a simple appointment.
ZmAppt.prototype.getTextSummary =
function() {
	return this.getSummary(false);
};

ZmAppt.prototype.getHtmlSummary =
function() {
	return this.getSummary(true);
};

ZmAppt.prototype.getSummary =
function(isHtml) {
	var orig = this._orig || this;

	var isEdit = (this._viewMode == ZmAppt.MODE_EDIT || 
				  this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE ||
				  this._viewMode == ZmAppt.MODE_EDIT_SERIES);

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
	if (this._viewMode == ZmAppt.MODE_DELETE_INSTANCE) {
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	var recurrence = this._recurrence.repeatType != "NON" &&
					 this._viewMode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE &&
					 this._viewMode != ZmAppt.MODE_DELETE_INSTANCE;
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

	if (this._attendees[ZmAppt.PERSON] && this._attendees[ZmAppt.PERSON].length) {
		if (isHtml) {
			buf[i++] = "</table>\n<p>\n<table border='0'>";
		}
		buf[i++] = "\n";
		var attString = ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.PERSON].slice(0, 10), ZmAppt.PERSON);
		if (this._attendees[ZmAppt.PERSON].length > 10) {
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

/**
 * @param attach		generic Object contain meta info about the attachment
 * @param hasCheckbox	whether to insert a checkbox prior to the attachment
*/
ZmAppt.prototype.getAttachListHtml = 
function(attach, hasCheckbox) {
	var hrefRoot = "href='" + this._appCtxt.getCsfeMsgFetcher() + "id=" + this.invId + "&amp;part=";

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText = null;
	if (size != null) {
	    if (size < 1024)		sizeText = size + " B";
        else if (size < 1024^2)	sizeText = Math.round((size/1024) * 10) / 10 + " KB"; 
        else 					sizeText = Math.round((size / (1024*1024)) * 10) / 10 + " MB"; 
	}

	var html = [];
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	if (hasCheckbox) {
		html[i++] = "<td width=1%><input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "' name='";
		html[i++] = ZmAppt.ATTACHMENT_CHECKBOX_NAME;
		html[i++] = "'></td>";
	}
	html[i++] = "<td width=20><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);
	html[i++] = "</a></td>";
	html[i++] = "<td><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = attach.filename;
	html[i++] = "</a>";

	var addHtmlLink = (this._appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) && 
					  attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "&nbsp;(";
		if (sizeText) {
			html[i++] = sizeText;
			if (addHtmlLink)
				html[i++] = ", ";
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&view=html";
			html[i++] = "'>";
			html[i++] = ZmMsg.viewAsHtml;
			html[i++] = "</a>";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = ", ";
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			html[i++] = hrefRoot;
			html[i++] = attach.part;
			html[i++] = "&disp=a'>";
			html[i++] = ZmMsg.download;
			html[i++] = "</a>";
		}
		html[i++] = ")";
	}

	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	return html.join("");
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

// Uses indexOf() rather than a regex since IE didn't split on the regex correctly.
ZmAppt.prototype._trimNotesSummary = 
function(notes, isHtml) {
	if (notes) {
		var idx = notes.indexOf(ZmAppt.NOTES_SEPARATOR);
		if (idx != -1) {
			notes = notes.substr(idx + ZmAppt.NOTES_SEPARATOR.length);
			var junk = isHtml ? "</div>" : "\n\n";
			if (notes.indexOf(junk) == 0) {
				notes = notes.replace(junk, "");
			}
		}
	}
	return AjxStringUtil.trim(notes);
};

ZmAppt.prototype._resetCached =
function() {
	delete this._startTimeUniqId; this._startTimeUniqId = null;
	delete this._validAttachments; this._validAttachments = null;
	delete this.tooltip; this.tooltip = null;
};

ZmAppt.prototype._getTTDay =
function(d) {
	return DwtCalendar.getDayFormatter().format(d);
};

ZmAppt.prototype._addInviteAndCompNum =
function(soapDoc) {
	if (this._viewMode == ZmAppt.MODE_EDIT_SERIES || this._viewMode == ZmAppt.MODE_DELETE_SERIES) {
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

ZmAppt.prototype._getDefaultBlurb = 
function(cancel, isHtml) {
	var buf = [];
	var i = 0;
	var singleInstance = this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE	|| 
						 this._viewMode == ZmAppt.MODE_DELETE_INSTANCE;
	if (isHtml) {
		buf[i++] = "<h3>";
	}
	if (cancel) {
		buf[i++] = singleInstance ? ZmMsg.apptInstanceCanceled : ZmMsg.apptCanceled;
	} else {
		if (this._viewMode == ZmAppt.MODE_EDIT || 
			this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE ||
			this._viewMode == ZmAppt.MODE_EDIT_SERIES)
		{
			buf[i++] = singleInstance ? ZmMsg.apptInstanceModified : ZmMsg.apptModified;
		} else {
			buf[i++] = ZmMsg.apptNew;
		}
	}
	if (isHtml) {
		buf[i++] = "</h3>";
	}
	buf[i++] = "\n\n";
	buf[i++] = this.getSummary(isHtml);

	return buf.join("");
};

// Server request calls

ZmAppt.prototype._setSimpleSoapAttributes = 
function(soapDoc, method, attachmentId, notifyList, onBehalfOf) {

	var m = this._messageNode = soapDoc.set('m');

	m.setAttribute("d", new Date().getTime());

	if (this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE && !this.isException()) {
		// do nothing for instance requests
	} else {
		if (onBehalfOf)
		{
			m.setAttribute("l", this.getCalendar().rid);
		}
		// do not set folderId if default folder or editing single instance
		else if (this.getFolderId() != ZmOrganizer.ID_CALENDAR &&
				 this._viewMode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE)
		{
			m.setAttribute("l", this.folderId);
		}
	}

	if (this.timezone) {
		var clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(soapDoc, clientId, m, true);
	}

	var inv = soapDoc.set("inv", null, m);
	switch (method) {
		case ZmAppt.SOAP_METHOD_REQUEST: inv.setAttribute('method', "REQUEST"); break;
		case ZmAppt.SOAP_METHOD_CANCEL:  inv.setAttribute('method', "CANCEL"); break;
	}
	
	inv.setAttribute("type", "event");

	if (this.isOrganizer()) {
		this._addAttendeesToSoap(soapDoc, inv, m, notifyList, onBehalfOf);
	}

	this._addNotesToSoap(soapDoc, m);

	if (this.uid !== void 0 && this.uid != null && this.uid != -1)
		inv.setAttribute("uid", this.uid);

	inv.setAttribute("type", "event");
	inv.setAttribute("fb", this.freeBusy);
	inv.setAttribute("transp", "O");
	inv.setAttribute("status", "CONF");
	inv.setAttribute("allDay", this.allDayEvent);

	var s = soapDoc.set("s", null, inv);
	var e = soapDoc.set("e", null, inv);
	if (this.allDayEvent != "1") {
		var sd = AjxDateUtil.getServerDateTime(this.startDate, this.startsInUTC);
		var ed = AjxDateUtil.getServerDateTime(this.endDate, this.endsInUTC);

		// set timezone if not utc date/time
		var tz = AjxEnv.isSafari ? AjxStringUtil.xmlEncode(this.timezone) : this.timezone;
		if (!this.startsInUTC && tz && tz.length)
			s.setAttribute("tz", tz);
		if (!this.endsInUTC && tz && tz.length)
			e.setAttribute("tz", tz);

		s.setAttribute("d", sd);
		e.setAttribute("d", ed);
		
	} else {
		s.setAttribute("d", AjxDateUtil.getServerDate(this.startDate));
		e.setAttribute("d", AjxDateUtil.getServerDate(this.endDate));
	}
	
	soapDoc.set("su", this.name, m);
	inv.setAttribute("name", this.name);

	if (this._attendees[ZmAppt.LOCATION] && this._attendees[ZmAppt.LOCATION].length) {
		inv.setAttribute("loc", this.getLocation());
	}

	// set organizer
	var user = this._appCtxt.get(ZmSetting.USERNAME);
	var organizer = this.organizer || user;
	var org = soapDoc.set("or", null, inv);
	org.setAttribute("a", organizer);
	// if on-behalf of, set sentBy
	if (organizer != user) org.setAttribute("sentBy", user);
	// set display name of organizer
	var orgEmail = ZmApptViewHelper.getOrganizerEmail(this._appCtxt, this.organizer);
	var orgName = orgEmail.getName();
	if (name) org.setAttribute("d", name);

	// handle attachments
	if (attachmentId != null || (this._validAttachments != null && this._validAttachments.length)) {
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId)
			attachNode.setAttribute("aid", attachmentId);

		if (this._validAttachments) {
			for (var i = 0; i < this._validAttachments.length; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				msgPartNode.setAttribute("mid", this._message.id); 				// shouldnt this be this.invId ??
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

ZmAppt.prototype._addAttendeesToSoap =
function(soapDoc, inv, m, notifyList, onBehalfOf) {
	for (var x in this._attendees) {
		if (this._attendees[x] && this._attendees[x].length) {
			for (var i = 0; i < this._attendees[x].length; i++) {
				this._addAttendeeToSoap(soapDoc, inv, m, notifyList, this._attendees[x][i], x);
			}
		}
	}

	// if we have a separate list of email addresses to notify, do it here
	if (m && notifyList) {
		for (var i = 0; i < notifyList.length; i++) {
			e = soapDoc.set("e", null, m);
			e.setAttribute("a", notifyList[i]);
			e.setAttribute("t", ZmEmailAddress.toSoapType[ZmEmailAddress.TO]);
		}
	}

	// finally, if this appt is on-behalf-of, set the from address to that person
	if (onBehalfOf) {
		e = soapDoc.set("e", null, m);
		e.setAttribute("a", onBehalfOf);
		e.setAttribute("t", ZmEmailAddress.toSoapType[ZmEmailAddress.FROM]);
	}
};

ZmAppt.prototype._addAttendeeToSoap = 
function(soapDoc, inv, m, notifyList, attendee, type) {
	var address;
	if (attendee._inviteAddress) {
		address = attendee._inviteAddress;
		delete attendee._inviteAddress;
	} else {
		address = attendee.getEmail();
	}
	if (!address) return;

	var dispName = attendee.getFullName();
	if (inv) {
		at = soapDoc.set("at", null, inv);
		// for now make attendees optional, until UI has a way of setting this
		at.setAttribute("role", (type == ZmAppt.PERSON) ? ZmAppt.ROLE_REQUIRED : ZmAppt.ROLE_NON_PARTICIPANT);
		at.setAttribute("ptst", ZmAppt.PSTATUS_NEEDS_ACTION);
		var cutype = (type == ZmAppt.PERSON) ? null : ZmAppt.CUTYPE_RESOURCE;
		if (cutype) {
			at.setAttribute("cutype", cutype);
		}
		at.setAttribute("rsvp", "1");
		at.setAttribute("a", address);
		if (dispName) {
			at.setAttribute("d", dispName);
		}
	}

	// set email to notify if notifyList not provided
	if (m && !notifyList) {
		e = soapDoc.set("e", null, m);
		e.setAttribute("a", address);
		if (dispName) {
			e.setAttribute("p", dispName);
		}
		e.setAttribute("t", ZmEmailAddress.toSoapType[ZmEmailAddress.TO]);

		// bug fix #9768 - auto add attendee if not in addrbook
		if (type == ZmAppt.PERSON &&
			this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
			this._appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS))
		{
			var clc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
			if (!clc.getContactByEmail(address))
				e.setAttribute("add", "1");
		}
	}
};

ZmAppt.prototype._addNotesToSoap = 
function(soapDoc, m, cancel) {	

	var hasAttendees = ((this._attendees[ZmAppt.PERSON] && this._attendees[ZmAppt.PERSON].length) ||
						(this._attendees[ZmAppt.LOCATION] && this._attendees[ZmAppt.LOCATION].length) ||
						(this._attendees[ZmAppt.EQUIPMENT] && this._attendees[ZmAppt.EQUIPMENT].length));
	var tprefix = hasAttendees ? this._getDefaultBlurb(cancel) : "";
	var hprefix = hasAttendees ? this._getDefaultBlurb(cancel, true) : "";
	
	var mp = soapDoc.set("mp", null, m);
	mp.setAttribute("ct", ZmMimeTable.MULTI_ALT);
	var numSubParts = this.notesTopPart ? this.notesTopPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this.notesTopPart.children.get(i);
			var partNode = soapDoc.set("mp", null, mp);
			var pct = part.getContentType();
			partNode.setAttribute("ct", pct);

			var isHtml = pct == ZmMimeTable.TEXT_HTML;
			var pprefix = isHtml ? hprefix  : tprefix;
			var content = AjxBuffer.concat(pprefix, part.getContent());
			soapDoc.set("content", content, partNode);
		}
	}
	else {
		var tcontent = this.notesTopPart ? this.notesTopPart.getContent() : "";
		var textPart = soapDoc.set("mp", null, mp);
		textPart.setAttribute("ct", ZmMimeTable.TEXT_PLAIN);
		soapDoc.set("content", AjxBuffer.concat(tprefix, tcontent), textPart);

		// bug fix #9592 - html encode the text before setting it as the "HTML" part
		var hcontent = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(tcontent));
		var htmlPart = soapDoc.set("mp", null, mp);
		htmlPart.setAttribute("ct", ZmMimeTable.TEXT_HTML);
		var html = "<html><body>" + AjxBuffer.concat(hprefix, hcontent) + "</body></html>";
		soapDoc.set("content", html, htmlPart);
	}
};

ZmAppt.prototype._sendRequest = 
function(soapDoc, accountName, callback, errorCallback) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
	this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
};


// Callbacks

ZmAppt.prototype._handleResponseSend = 
function(respName, callback, result) {
	var resp = result.getResponse();

	// branch for different responses
	var response = resp[respName];
	if (response.uid != null)
		this.uid = response.uid;

	// set ID now if appt is shared since we wont get CREATE notification (see bug 6082)
	if (response.calItemId && response.calItemId.indexOf(":") != -1)
		this.id = response.calItemId;

	if (response.m != null) {
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId)
			this._message = null;
	}

	this._messageNode = null;

	if (callback)
		callback.run();
};

ZmAppt.prototype._handleResponseGetDetails =
function(mode, message, callback, result) {
	// msg content should be text, so no need to pass callback to setFromMessage()
	this.setFromMessage(message, mode);
	if (callback) callback.run(result);
};

// Static methods

/**
* Compares two appts. sort by (starting date, duration)
* sort methods.
*
* @param a		an appt
* @param b		an appt
*/
ZmAppt.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime()) 	return 1;
	if (a.getStartTime() < b.getStartTime()) 	return -1;
	if (a.getDuration() < b.getDuration()) 		return 1;
	if (a.getDuration() > b.getDuration()) 		return -1;
	return 0;
};

ZmAppt._getTTHour =
function(d) {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(d);
};

ZmAppt._SORTBY_VALUE = 
function(a, b) {
	a = Number(a);
	b = Number(b);
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
};

// REVISIT: Move to AjxDateUtil function
ZmAppt.__adjustDateForTimezone =
function(date, timezoneServerId, inUTC) {
	var currentOffset = AjxTimezone.getOffset(AjxTimezone.DEFAULT, date);
	var timezoneOffset = currentOffset;
	if (!inUTC) {
		var timezoneClientId = AjxTimezone.getClientId(timezoneServerId);
		timezoneOffset = AjxTimezone.getOffset(timezoneClientId, date);
	}
	var offset = currentOffset - timezoneOffset;
	date.setMinutes(date.getMinutes() + offset);
};
