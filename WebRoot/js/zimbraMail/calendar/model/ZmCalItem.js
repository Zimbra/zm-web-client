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
function ZmCalItem(appCtxt, type, list) {

	ZmItem.call(this, appCtxt, type, null, list);

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

	this._viewMode = ZmCalItem.MODE_NEW;
	this._recurrence = new ZmRecurrence(this);
};

ZmCalItem.prototype = new ZmItem;
ZmCalItem.prototype.constructor = ZmCalItem;

// Consts

ZmCalItem.MODE_NEW						= 1;
ZmCalItem.MODE_EDIT						= 2;
ZmCalItem.MODE_EDIT_SINGLE_INSTANCE		= 3;
ZmCalItem.MODE_EDIT_SERIES				= 4;
ZmCalItem.MODE_DELETE					= 5;
ZmCalItem.MODE_DELETE_INSTANCE			= 6;
ZmCalItem.MODE_DELETE_SERIES			= 7;
ZmCalItem.MODE_NEW_FROM_QUICKADD 		= 8;
ZmCalItem.MODE_LAST						= 8;

ZmCalItem.SOAP_METHOD_REQUEST			= 1;
ZmCalItem.SOAP_METHOD_REPLY				= 2;
ZmCalItem.SOAP_METHOD_CANCEL			= 3;

ZmCalItem.ATTENDEES_SEPARATOR			= "; ";

ZmCalItem.STATUS_TENTATIVE				= "TENT";
ZmCalItem.STATUS_CONFIRMED				= "CONF";
ZmCalItem.STATUS_CANCELLED				= "CANC";

ZmCalItem.ROLE_CHAIR					= "CHA";
ZmCalItem.ROLE_REQUIRED					= "REQ";
ZmCalItem.ROLE_OPTIONAL					= "OPT";
ZmCalItem.ROLE_NON_PARTICIPANT			= "NON";

ZmCalItem.PSTATUS_NEEDS_ACTION			= "NE";
ZmCalItem.PSTATUS_TENTATIVE				= "TE";
ZmCalItem.PSTATUS_ACCEPT				= "AC";
ZmCalItem.PSTATUS_DECLINED				= "DE";
ZmCalItem.PSTATUS_DELEGATED				= "DG";

ZmCalItem.CUTYPE_INDIVIDUAL				= "IND";
ZmCalItem.CUTYPE_GROUP					= "GRO";
ZmCalItem.CUTYPE_RESOURCE				= "RES";
ZmCalItem.CUTYPE_ROOM					= "ROO";
ZmCalItem.CUTYPE_UNKNOWN				= "UNK";

ZmCalItem.PERSON						= 1;
ZmCalItem.LOCATION						= 2;
ZmCalItem.EQUIPMENT						= 3;

ZmCalItem.SERVER_WEEK_DAYS				= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
ZmCalItem.NOTES_SEPARATOR				= "*~*~*~*~*~*~*~*~*~*";

ZmCalItem.ATTACHMENT_CHECKBOX_NAME		= Dwt.getNextId();

ZmCalItem._pstatusString = {
	NE: "NEW",	//	ZmMsg.needsAction,		// HACK: i18n
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
};


ZmCalItem.prototype.toString =
function() {
	return "ZmCalItem";
};


// Getters

ZmCalItem.prototype.getAttendees					= function() { return this._attendees[ZmCalItem.PERSON]; };
ZmCalItem.prototype.getDuration 					= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
ZmCalItem.prototype.getEquipment					= function() { return this._attendees[ZmCalItem.EQUIPMENT]; };
ZmCalItem.prototype.getEndTime 						= function() { return this.endDate.getTime(); }; 	// end time in ms
ZmCalItem.prototype.getFolder						= function() { /* override */ };
ZmCalItem.prototype.getFolderId 					= function() { return this.folderId; };
ZmCalItem.prototype.getId 							= function() { return this.id; }; 					// mail item id on appt instance
ZmCalItem.prototype.getLocations					= function() { return this._attendees[ZmCalItem.LOCATION]; };
ZmCalItem.prototype.getMessage 						= function() { return this._message; };
ZmCalItem.prototype.getName 						= function() { return this.name || ""; };			// name (aka Subject) of appt
ZmCalItem.prototype.getOrganizer 					= function() { return this.organizer || ""; };
ZmCalItem.prototype.getOrigStartDate 				= function() { return this._origStartDate || this.startDate; };
ZmCalItem.prototype.getOrigStartTime 				= function() { return this.getOrigStartDate().getTime(); };
ZmCalItem.prototype.getParticipationStatusString 	= function() { return ZmCalItem._pstatusString[this.ptst]; };
ZmCalItem.prototype.getRecurBlurb					= function() { return this._recurrence.getBlurb(); };
ZmCalItem.prototype.getRecurType					= function() { return this._recurrence.repeatType; };
ZmCalItem.prototype.getStartTime 					= function() { return this.startDate.getTime(); }; 	// start time in ms
ZmCalItem.prototype.getSummary						= function(isHtml) { /* override */ };
ZmCalItem.prototype.getToolTip						= function(controller) { /* override */ };

ZmCalItem.prototype.getViewMode 					= function() { return this._viewMode; };
ZmCalItem.prototype.getType 						= function() { return this.type; };					// type of appt (event|todo)
ZmCalItem.prototype.getUniqueStartTime 				= function() { return this._uniqStartTime; }; 		// returns unique start time for an instance of recurring appt
ZmCalItem.prototype.getUniqueId =
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

ZmCalItem.prototype.isAllDayEvent 		= function() { return this.allDayEvent == "1"; };
ZmCalItem.prototype.isCustomRecurrence 	= function() { return this._recurrence.repeatCustom == "1" || this._recurrence.repeatEndType != "N"; };
ZmCalItem.prototype.isException 		= function() { return this.exception || false; };
ZmCalItem.prototype.isOrganizer 		= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
ZmCalItem.prototype.isRecurring 		= function() { return (this.recurring || (this._rawRecurrences != null)); };
ZmCalItem.prototype.hasAttachments 		= function() { return this.getAttachments() != null; };
ZmCalItem.prototype.hasDetails 			= function() { return this.getMessage() != null; };
ZmCalItem.prototype.hasOtherAttendees 	= function() { return this.otherAttendees; };


// Setters
ZmCalItem.prototype.setAllDayEvent 		= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
ZmCalItem.prototype.setFolderId 		= function(folderId) 	{ this.folderId = folderId || ZmOrganizer.ID_CALENDAR; };
ZmCalItem.prototype.setFreeBusy 		= function(fb) 			{ this.freeBusy = fb || "B"; };
ZmCalItem.prototype.setMessage 			= function(message) 	{ this._message = message; };
ZmCalItem.prototype.setName 			= function(newName) 	{ this.name = newName; };
ZmCalItem.prototype.setOrganizer 		= function(organizer) 	{ this.organizer = organizer != "" ? organizer : null; };
ZmCalItem.prototype.setRecurType		= function(repeatType)	{ this._recurrence.repeatType = repeatType; };
ZmCalItem.prototype.setType 			= function(newType) 	{ this.type = newType; };

ZmCalItem.prototype.setEndDate =
function(endDate, keepCache) {
	this.endDate = new Date(endDate instanceof Date ? endDate.getTime(): endDate);
	if (!keepCache)
		this._resetCached();
};

ZmCalItem.prototype.setStartDate =
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
ZmCalItem.prototype.setAttendees =
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

/**
 * This method sets the view mode, and resets any other fields that should not 
 * be set for that view mode.
 */
ZmCalItem.prototype.setViewMode =
function(mode) {
	this._viewMode = mode || ZmCalItem.MODE_NEW;

	if (this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
		this._recurrence.repeatType = "NON";
};

/**
 * Walks the notesParts array looking for the first part that matches given 
 * content type - for now, returns the content (but we could just return the whole part?)
*/
ZmCalItem.prototype.getNotesPart =
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

// returns "owner" of remote/shared calItem folder this calItem belongs to
// (null if folder is not remote/shared)
ZmCalItem.prototype.getRemoteFolderOwner =
function() {
	var folder = this.getFolder();
	return folder && folder.link ? folder.owner : null;
};

ZmCalItem.prototype.isReadOnly =
function() { 
	var isLinkAndReadOnly = false;
	var folder = this.getFolder();
	// if we're dealing w/ a shared cal, find out if we have any write access
	if (folder.link) {
		var share = folder.getShares()[0];
		isLinkAndReadOnly = share && !share.isWrite();
	}

	return !this.isOrganizer() || isLinkAndReadOnly;
};

ZmCalItem.prototype.isShared =
function() {
	return (this.id && this.id != -1)
		? (this.id.indexOf(":") != -1) : false;
};

ZmCalItem.prototype.resetRepeatWeeklyDays =
function() {
	this._recurrence.repeatWeeklyDays = [ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()]];
};

ZmCalItem.prototype.resetRepeatMonthlyDayList =
function() {
	this._recurrence.repeatMonthlyDayList = [this.startDate.getDate()];
};

ZmCalItem.prototype.resetRepeatYearlyMonthsList =
function(mo) {
	this._recurrence.repeatYearlyMonthsList = mo;
};

ZmCalItem.prototype.resetRepeatCustomDayOfWeek =
function() {
	this._recurrence.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this.startDate.getDay()];
};

ZmCalItem.prototype.isOverlapping =
function(other, checkFolder) {
	if (checkFolder && this.getFolderId() != other.getFolderId()) return false;

	var tst = this.getStartTime();
	var tet = this.getEndTime();
	var ost = other.getStartTime();
	var oet = other.getEndTime();
	
	return (tst < oet) && (tet > ost);
};

ZmCalItem.prototype.isInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	var tet = this.getEndTime();	
	return (tst < endTime && tet > startTime);
};

/**
 * return true if the start time of this appt is within range
 */
ZmCalItem.prototype.isStartInRange =
function(startTime, endTime) {
	var tst = this.getStartTime();
	return (tst < endTime && tst >= startTime);
};

/**
 * return true if the end time of this appt is within range
 */
ZmCalItem.prototype.isEndInRange =
function(startTime, endTime) {
	var tet = this.getEndTime();
	return (tet <= endTime && tet > startTime);
};

ZmCalItem.prototype.setDateRange =
function (rangeObject, instance, parentValue, refPath) {
	var s = rangeObject.startDate;
	var e = rangeObject.endDate;
	this.endDate.setTime(rangeObject.endDate.getTime());
	this.startDate.setTime(rangeObject.startDate.getTime());
};

ZmCalItem.prototype.getDateRange =
function(instance, current, refPath) {
	return { startDate:this.startDate, endDate: this.endDate };
};

/**
 * true if startDate and endDate are on different days
 */
ZmCalItem.prototype.isMultiDay =
function() {
	return (this.startDate.getDate() != this.endDate.getDate()) ||
		   (this.startDate.getMonth() != this.endDate.getMonth()) ||
		   (this.startDate.getFullYear() != this.endDate.getFullYear());
};

/**
 * accepts a comma delimeted string of ids
 */
ZmCalItem.prototype.setAttachments =
function(ids) {
	this.attachments = [];

	if (ids && ids.length > 0) {
		var split = ids.split(',');
		for (var i = 0 ; i < split.length; i++)
			this.attachments[i] = { id:split[i] };
	}
};

ZmCalItem.prototype.getAttachments =
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

ZmCalItem.prototype.removeAttachment =
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

ZmCalItem.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	if (this.isAllDayEvent()) {
		if (emptyAllDay)
			return "";
		if (this.isMultiDay()) {
			var endDate = new Date(this.endDate.getTime());
			endDate.setDate(endDate.getDate()-1);

			var startDay = this._getTTDay(this.startDate);
			var endDay = this._getTTDay(endDate);

			if (!ZmCalItem._daysFormatter) {
				ZmCalItem._daysFormatter = new AjxMessageFormat(ZmMsg.durationDays);
			}
			return ZmCalItem._daysFormatter.format( [ startDay, endDay ] );
		} else {
			return this._getTTDay(this.startDate);
		}

	} else {
		if (startOnly) {
			return ZmCalItem._getTTHour(this.startDate);
		} else {
			var startHour = ZmCalItem._getTTHour(this.startDate);
			var endHour = ZmCalItem._getTTHour(this.endDate);
		
			if (!ZmCalItem._hoursFormatter) {
				ZmCalItem._hoursFormatter = new AjxMessageFormat(ZmMsg.durationHours);
			}
			return ZmCalItem._hoursFormatter.format( [startHour, endHour] );
		}			
	}
};

ZmCalItem.prototype.getShortStartHour =
function() {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(this.startDate);
};

ZmCalItem.prototype.getUniqueStartDate =
function() {
	if (this._uniqueStartDate == null) {
		this._uniqueStartDate = new Date(this.getUniqueStartTime());
	}
	return this._uniqueStartDate;
};

ZmCalItem.prototype.getUniqueEndDate =
function() {
	if (this._uniqueEndDate == null) {
		var st = this.getUniqueStartTime();
		var dur = this.getDuration();
		this._uniqueEndDate = new Date(st + dur);
	}
	return this._uniqueEndDate;
};

ZmCalItem.prototype.getDetails =
function(viewMode, callback, errorCallback, ignoreOutOfDate) {
	var mode = viewMode || this._viewMode;
	
	var seriesMode = mode == ZmCalItem.MODE_EDIT_SERIES;
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

ZmCalItem.prototype._handleErrorGetDetails =
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

ZmCalItem.prototype._handleErrorGetDetails2 =
function(mode, callback, errorCallback, result) {
	// Update invId and force a message reload
	var invite = result._data.GetAppointmentResponse.appt[0].inv[0];
	this.invId = [this.id, invite.id].join("-");
	this._message = null;
	var ignoreOutOfDate = true;
	this.getDetails(mode, callback, errorCallback, ignoreOutOfDate);
};

ZmCalItem.prototype.setFromMessage =
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
	if (viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
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
	if (viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
		ZmCalItem.__adjustDateForTimezone(this.startDate, tz, this.startsInUTC);
		ZmCalItem.__adjustDateForTimezone(this.endDate, tz, this.endsInUTC);
	}
	this.timezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

	// parse out attendees for this invite
	this._attendees[ZmCalItem.PERSON] = [];
	this._origAttendees = [];
	var attendees = message.invite.getAttendees();
	if (attendees) {
		for (var i = 0; i < attendees.length; i++) {
			var addr = attendees[i].url;
			var name = attendees[i].d;
			var email = new ZmEmailAddress(addr, null, name);
			var attendee = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, email, ZmCalItem.PERSON);
			if (attendee) {
				this._attendees[ZmCalItem.PERSON].push(attendee);
				this._origAttendees.push(attendee);
			}
		}
	}

	// Locations can be free-text or known, so we parse the "loc" string to
	// get them rather than looking at the invite's resources (which will
	// only contain known locations)
	this._attendees[ZmCalItem.LOCATION] = [];
	this._origLocations = [];
	var locations = ZmEmailAddress.split(message.invite.getLocation());
	if (locations) {
		for (var i = 0; i < locations.length; i++) {
			var location = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, locations[i], ZmCalItem.LOCATION);
			if (location && location.isLocation()) {
				this._attendees[ZmCalItem.LOCATION].push(location);
				this._origLocations.push(location);
			}
		}
	}

	// Get equipment by email, make sure to exclude location resources
	this._attendees[ZmCalItem.EQUIPMENT] = [];
	this._origEquipment = [];
	var resources = message.invite.getResources();	// returns all the invite's resources
	if (resources) {
		for (var i = 0; i < resources.length; i++) {
			// see if it's a known location
			var location = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, resources[i].url, ZmCalItem.LOCATION, true, true);
			if (location) {
				continue;
			}
			var equipment = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, resources[i].url, ZmCalItem.EQUIPMENT);
			if (equipment) {
				this._attendees[ZmCalItem.EQUIPMENT].push(equipment);
				this._origEquipment.push(equipment);
			}
		}
	}

	this._setRecurrence(message);
	this._setNotes(message);
	this.getAttachments();

	this._currentlyLoaded = message;
};

ZmCalItem.prototype.setFromMailMessage =
function(message, subject) {
	this.name = subject;
	
	// Only unique names in the attendee list, plus omit our own name
	var used = {};
	used[this._appCtxt.get(ZmSetting.USERNAME)] = true;
	var addrs = message.getAddresses(ZmEmailAddress.FROM, used, true);
	addrs.addList(message.getAddresses(ZmEmailAddress.CC, used, true));
	addrs.addList(message.getAddresses(ZmEmailAddress.TO, used, true));
	this._attendees[ZmCalItem.PERSON] = addrs.getArray();

	this._setNotes(message);
}

ZmCalItem.prototype.setTextNotes =
function(notes) {
	this.notesTopPart = new ZmMimePart();	
	this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
	this.notesTopPart.setContent(notes);	
}

ZmCalItem.prototype._setRecurrence =
function(message) {
	var recurRules = message.invite.getRecurrenceRules();

	if (recurRules)
		this._recurrence.parse(recurRules);

	if (this._recurrence.repeatWeeklyDays == null)
		this.resetRepeatWeeklyDays();

	if (this._recurrence.repeatMonthlyDayList == null)
		this.resetRepeatMonthlyDayList();
};

ZmCalItem.prototype._setNotes =
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
 * @param attachmentId 		[string]*		ID of the already uploaded attachment
 * @param callback 			[AjxCallback]*	callback triggered once request for appointment save is complete
 * @param errorCallback 	[AjxCallback]*	callback triggered if error during appointment save request
 * @param notifyList 		[Array]*		optional sublist of attendees to be notified (if different from original list of attendees)
*/
ZmCalItem.prototype.save =
function(attachmentId, callback, errorCallback, notifyList) {
	var soapDoc = null;
	var accountName = this.getRemoteFolderOwner();
	var needsExceptionId = false;

	if (this._viewMode == ZmCalItem.MODE_NEW) {
		soapDoc = AjxSoapDoc.create("CreateAppointmentRequest", "urn:zimbraMail");
	} else if (this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE && !this.isException()) {
		soapDoc = AjxSoapDoc.create("CreateAppointmentExceptionRequest", "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
		soapDoc.setMethodAttribute("s", this.getOrigStartTime());
		needsExceptionId = true;
	} else {
		soapDoc = AjxSoapDoc.create("ModifyAppointmentRequest", "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);
        needsExceptionId = this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE || this.exception;
	}

	var invAndMsg = this._setSimpleSoapAttributes(soapDoc, ZmCalItem.SOAP_METHOD_REQUEST, attachmentId, notifyList, accountName);

	if (needsExceptionId) {
		var exceptId = soapDoc.set("exceptId", null, invAndMsg.inv);
        // bug 13529: exception id based on original appt, not new data
        var allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent;
        if (allDay != "1") {
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

ZmCalItem.prototype.move =
function(folderId, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("ItemActionRequest", "urn:zimbraMail");
	var accountName = null;

	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", this.id);
	actionNode.setAttribute("op", "move");
	actionNode.setAttribute("l", folderId);
	
	this._sendRequest(soapDoc, accountName, callback, errorCallback);
};

ZmCalItem.prototype.cancel =
function(mode, msg, callback, errorCallback) {
	this.setViewMode(mode);
	if (msg) {
		// REVISIT: I have to explicitly set the bodyParts of the message
		//          because ZmComposeView#getMsg only sets the topPart on
		//          the new message that's returned. And ZmCalItem#_setNotes
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

ZmCalItem.prototype._doCancel =
function(mode, callback, msg, result) {
	if (mode == ZmCalItem.MODE_DELETE || mode == ZmCalItem.MODE_DELETE_SERIES || mode == ZmCalItem.MODE_DELETE_INSTANCE) {
		var soapDoc = AjxSoapDoc.create("CancelAppointmentRequest", "urn:zimbraMail");
		var accountName = this.getRemoteFolderOwner();
		this._addInviteAndCompNum(soapDoc);

		if (mode == ZmCalItem.MODE_DELETE_INSTANCE) {
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
ZmCalItem.prototype.getTextSummary =
function() {
	return this.getSummary(false);
};

ZmCalItem.prototype.getHtmlSummary =
function() {
	return this.getSummary(true);
};

/**
 * @param attach		generic Object contain meta info about the attachment
 * @param hasCheckbox	whether to insert a checkbox prior to the attachment
*/
ZmCalItem.prototype.getAttachListHtml =
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
		html[i++] = ZmCalItem.ATTACHMENT_CHECKBOX_NAME;
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

ZmCalItem.prototype._getTextSummaryTime =
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
ZmCalItem.prototype._trimNotesSummary =
function(notes, isHtml) {
	if (notes) {
		var idx = notes.indexOf(ZmCalItem.NOTES_SEPARATOR);
		if (idx != -1) {
			notes = notes.substr(idx + ZmCalItem.NOTES_SEPARATOR.length);
			var junk = isHtml ? "</div>" : "\n\n";
			if (notes.indexOf(junk) == 0) {
				notes = notes.replace(junk, "");
			}
		}
	}
	return AjxStringUtil.trim(notes);
};

ZmCalItem.prototype._resetCached =
function() {
	delete this._startTimeUniqId; this._startTimeUniqId = null;
	delete this._validAttachments; this._validAttachments = null;
	delete this.tooltip; this.tooltip = null;
};

ZmCalItem.prototype._getTTDay =
function(d) {
	return DwtCalendar.getDayFormatter().format(d);
};

ZmCalItem.prototype._addInviteAndCompNum =
function(soapDoc) {
	if (this._viewMode == ZmCalItem.MODE_EDIT_SERIES || this._viewMode == ZmCalItem.MODE_DELETE_SERIES) {
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

ZmCalItem.prototype._getDefaultBlurb =
function(cancel, isHtml) {
	var buf = [];
	var i = 0;
	var singleInstance = this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE	||
						 this._viewMode == ZmCalItem.MODE_DELETE_INSTANCE;
	if (isHtml) {
		buf[i++] = "<h3>";
	}
	if (cancel) {
		buf[i++] = singleInstance ? ZmMsg.apptInstanceCanceled : ZmMsg.apptCanceled;
	} else {
		if (this._viewMode == ZmCalItem.MODE_EDIT ||
			this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
			this._viewMode == ZmCalItem.MODE_EDIT_SERIES)
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

ZmCalItem.prototype._setSimpleSoapAttributes =
function(soapDoc, method, attachmentId, notifyList, onBehalfOf) {

	var m = this._messageNode = soapDoc.set('m');

	m.setAttribute("d", new Date().getTime());

	if (this._viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE && !this.isException()) {
		// do nothing for instance requests
	} else {
		if (onBehalfOf)
		{
			m.setAttribute("l", this.getFolder().rid);
		}
		// do not set folderId if default folder or editing single instance
		else if (this.getFolderId() != ZmOrganizer.ID_CALENDAR &&
				 this._viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
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
		case ZmCalItem.SOAP_METHOD_REQUEST: inv.setAttribute('method', "REQUEST"); break;
		case ZmCalItem.SOAP_METHOD_CANCEL:  inv.setAttribute('method', "CANCEL"); break;
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

	if (this._attendees[ZmCalItem.LOCATION] && this._attendees[ZmCalItem.LOCATION].length) {
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

ZmCalItem.prototype._addAttendeesToSoap =
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

ZmCalItem.prototype._addAttendeeToSoap =
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
		at.setAttribute("role", (type == ZmCalItem.PERSON) ? ZmCalItem.ROLE_REQUIRED : ZmCalItem.ROLE_NON_PARTICIPANT);
		at.setAttribute("ptst", ZmCalItem.PSTATUS_NEEDS_ACTION);
		var cutype = (type == ZmCalItem.PERSON) ? null : ZmCalItem.CUTYPE_RESOURCE;
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
		if (type == ZmCalItem.PERSON &&
			this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
			this._appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS))
		{
			var clc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
			if (!clc.getContactByEmail(address))
				e.setAttribute("add", "1");
		}
	}
};

ZmCalItem.prototype._addNotesToSoap =
function(soapDoc, m, cancel) {	

	var hasAttendees = ((this._attendees[ZmCalItem.PERSON] && this._attendees[ZmCalItem.PERSON].length) ||
						(this._attendees[ZmCalItem.LOCATION] && this._attendees[ZmCalItem.LOCATION].length) ||
						(this._attendees[ZmCalItem.EQUIPMENT] && this._attendees[ZmCalItem.EQUIPMENT].length));
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

ZmCalItem.prototype._sendRequest =
function(soapDoc, accountName, callback, errorCallback) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var respCallback = new AjxCallback(this, this._handleResponseSend, [responseName, callback]);
	this._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, accountName:accountName, callback:respCallback, errorCallback:errorCallback});
};


// Callbacks

ZmCalItem.prototype._handleResponseSend =
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

ZmCalItem.prototype._handleResponseGetDetails =
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
ZmCalItem.compareByTimeAndDuration =
function(a, b) {
	if (a.getStartTime() > b.getStartTime()) 	return 1;
	if (a.getStartTime() < b.getStartTime()) 	return -1;
	if (a.getDuration() < b.getDuration()) 		return 1;
	if (a.getDuration() > b.getDuration()) 		return -1;
	return 0;
};

ZmCalItem._getTTHour =
function(d) {
	var formatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	return formatter.format(d);
};

// REVISIT: Move to AjxDateUtil function
ZmCalItem.__adjustDateForTimezone =
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
