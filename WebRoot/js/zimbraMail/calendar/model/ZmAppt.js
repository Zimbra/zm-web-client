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
	this.id = this.uid = -1;
	this.type = null;
	this.name = this.location = this.fragment = "";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + (30*60*1000));
	this.transparency = "FR";
	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.allDayEvent = "0";
	this.exception = this.recurring = this.alarm = this.otherAttendees = false;
	this.notesTopPart = null; 													// ZmMimePart containing children w/ different message parts
	this.repeatType = "NON"; 													// maps to "freq" in the createAppt call.
	this.repeatCustom = "0";  													// 1|0
	this.repeatCustomCount = 1; 												// ival
	this.repeatCustomType = "S"; 												// (S)pecific, (O)rdinal
	this.repeatCustomOrdinal = "1";
	this.repeatCustomDayOfWeek = "SU"; 											// (DAY|WEEKDAY|WEEKEND) | (SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)
	this.repeatCustomMonthDay = this.startDate.getDate();
	this.repeatWeekday = false; 												// set to true if freq = "DAI" and custom repeats every weekday
	this.repeatWeeklyDays = null; 												//SU|MO|TU|WE|TH|FR|SA
	this.repeatMonthlyDayList = null; 											// list of numbers representing days (usually, just one day)
	this.repeatYearlyMonthsList = "1"; 											// list of numbers representing months (usually, just one month)
	this.repeatEnd = null;
	this.repeatEndDate = null; 													// maps to "until"
	this.repeatEndCount = 1; 													// maps to "count" (when there is no end date specified)
	this.repeatEndType = "N";
	this.attachments = null;
	this.timezone = ZmTimezones.getDefault();
	this._viewMode = ZmAppt.MODE_NEW;
	this.folderId = ZmFolder.ID_CALENDAR;	
}

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

ZmAppt.EDIT_NO_REPEAT				= 1;
ZmAppt.EDIT_TIME					= 2;
ZmAppt.EDIT_TIME_REPEAT				= 3;

ZmAppt.SOAP_METHOD_REQUEST			= 1;
ZmAppt.SOAP_METHOD_REPLY			= 2;
ZmAppt.SOAP_METHOD_CANCEL			= 3;

ZmAppt.ATTENDEES_SEPARATOR_REGEX	= /[;,]/;
ZmAppt.ATTENDEES_SEPARATOR_AND_SPACE= "; ";

ZmAppt.STATUS_TENTATIVE				= "TENT";
ZmAppt.STATUS_CONFIRMED				= "CONF";
ZmAppt.STATUS_CANCELLED				= "CANC";

ZmAppt.PSTATUS_NEEDS_ACTION			= "NE";
ZmAppt.PSTATUS_TENTATIVE			= "TE";
ZmAppt.PSTATUS_ACCEPT				= "AC";
ZmAppt.PSTATUS_DECLINED				= "DE";
ZmAppt.PSTATUS_DELEGATED			= "DG";

ZmAppt.MODIFIED						= "[MODIFIED]";

ZmAppt.SERVER_DAYS_TO_DISPLAY = {
	SU: "Sunday",
	MO: "Monday",
	TU: "Tuesday",
	WE: "Wednesday",
	TH: "Thursday",
	FR: "Friday",
	SAT: "Saturday"
};

ZmAppt.MONTHLY_DAY_OPTIONS = [
	{ label: AjxMsg.first, 			value: "1", 		selected: true 	},
	{ label: AjxMsg.second, 		value: "2", 		selected: false },
	{ label: AjxMsg.third, 			value: "3", 		selected: false },
	{ label: AjxMsg.fourth, 		value: "4", 		selected: false },
	{ label: AjxMsg.last, 			value: "-1", 		selected: false }];

ZmAppt.SERVER_WEEK_DAYS				= ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
ZmAppt.NOTES_SEPARATOR				= "\n\n*~*~*~*~*~*~*~*~*~*\n\n";
ZmAppt.NOTES_SEPARATOR_REGEX		= /\s*\*~\*~\*~\*~\*~\*~\*~\*~\*~\*\s*/;

ZmAppt._statusString = {
	TE:   ZmMsg.tentative,
	CONF: ZmMsg.confirmed,
	CANC: ZmMsg.cancelled
};

ZmAppt._pstatusString = {
	NE: "NEW",	//	ZmMsg.needsAction,		// HACK: i18n
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
};


ZmAppt.prototype.toString = 
function() {
	return "ZmAppt: (" + this.name + ") sd=" + this.getStartDate() + " ed=" + this.getEndDate() + " id=" + this.id;
};


// Getters

ZmAppt.prototype.getAttendees 					= function() { return this.attendees || ""; };
ZmAppt.prototype.getAttendeeAddrs 				= function() { return this._attAddresses ? this._attAddresses.getArray() : null; };
ZmAppt.prototype.getDuration 					= function() { return this.getEndTime() - this.getStartTime(); } // duration in ms
ZmAppt.prototype.getEndDate 					= function() { return this.endDate; };
ZmAppt.prototype.getEndTime 					= function() { return this.endDate.getTime(); }; 	// end time in ms
ZmAppt.prototype.getFolderId 					= function() { return this.folderId || ZmFolder.ID_CALENDAR; };
ZmAppt.prototype.getFragment 					= function() { return this.fragment; };
ZmAppt.prototype.getId 							= function() { return this.id; }; 					// mail item id on appt instance
ZmAppt.prototype.getInvId 						= function() { return this.invId; }; 				// default mail item invite id on appt instance
ZmAppt.prototype.getLocation 					= function() { return this.location; };
ZmAppt.prototype.getMessage 					= function() { return this._message; };
ZmAppt.prototype.getName 						= function() { return this.name; }; 				// name (aka Subject) of appt
ZmAppt.prototype.getOrganizer 					= function() { return this.organizer || ""; };
ZmAppt.prototype.getOrigStartDate 				= function() { return this._origStartDate || this.startDate; };
ZmAppt.prototype.getOrigStartTime 				= function() { return this.getOrigStartDate().getTime(); };
ZmAppt.prototype.getParticipationStatus 		= function() { return this.ptst; };
ZmAppt.prototype.getParticipationStatusString 	= function() { return ZmAppt._pstatusString[this.ptst]; };
ZmAppt.prototype.getStartDate 					= function() { return this.startDate; };
ZmAppt.prototype.getStartTime 					= function() { return this.startDate.getTime(); }; 	// start time in ms
ZmAppt.prototype.getStatus 						= function() { return this.status; };
ZmAppt.prototype.getStatusString 				= function() { return ZmAppt._statusString[this.status]; };
ZmAppt.prototype.getViewMode 					= function() { return this._viewMode; };
ZmAppt.prototype.getTransparency 				= function() { return this.transparency; }; 		// transparency (free|busy|oof|tent)
ZmAppt.prototype.getType 						= function() { return this.type; };					// type of appt (event|todo)
ZmAppt.prototype.getUid 						= function() { return this.uid; }; 					// iCal uid of appt
ZmAppt.prototype.getUniqueStartTime 			= function() { return this._uniqStartTime; }; 		// returns unique start time for an instance of recurring appt
ZmAppt.prototype.getUniqueId =
function() {
	// return unique (across recurrance) id, by using getUid()+"/"+getStartTime()
	if (this._uniqId == null)
		this._uniqId = Dwt.getNextId();
	return (this.id + "_" + this._uniqId);
};

ZmAppt.prototype.isAllDayEvent 					= function() { return this.allDayEvent == "1"; };
ZmAppt.prototype.isCustomRecurrence 			= function() { return this.repeatCustom == "1" || this.repeatEndType != "N"; };
ZmAppt.prototype.isException 					= function() { return this.exception || false; };
ZmAppt.prototype.isOrganizer 					= function() { return (typeof(this.isOrg) === 'undefined') || (this.isOrg == true); };
ZmAppt.prototype.isReadOnly 					= function() { return !this.isOrganizer(); };
ZmAppt.prototype.isRecurring 					= function() { return (this.recurring || (this._rawRecurrences != null)); };
ZmAppt.prototype.hasAlarm 						= function() { return this.alarm; };
ZmAppt.prototype.hasAttachments 				= function() { return this.getAttachments() != null; };
ZmAppt.prototype.hasDetails 					= function() { return this.getMessage() != null; };
ZmAppt.prototype.hasOtherAttendees 				= function() { return this.otherAttendees; };

// Setters

ZmAppt.prototype.setAllDayEvent 				= function(isAllDay) 	{ this.allDayEvent = isAllDay ? "1" : "0"; };
ZmAppt.prototype.setEndDate 					= function(endDate) 	{ this.endDate = new Date(endDate); this._resetCached(); };
ZmAppt.prototype.setFolderId 					= function(folderId) 	{ this.folderId = folderId; };
ZmAppt.prototype.setMessage 					= function(message) 	{ this._message = message; };
ZmAppt.prototype.setName 						= function(newName) 	{ this.name = newName; };
ZmAppt.prototype.setStartDate =
function(startDate) {
	if (this._origStartDate == null && this.startDate != null) {
		this._origStartDate = new Date(this.startDate.getTime());
	}
	this.startDate = new Date(startDate);
	this._resetCached();
};
ZmAppt.prototype.setType 						= function(newType) 	{ this.type = newType; };


// Public methods

/**
 * This method sets the view mode, and resets any other fields that should not 
 * be set for that view mode.
 */
ZmAppt.prototype.setViewMode = 
function(mode) {
	this._viewMode = mode || ZmAppt.MODE_NEW;
	
	switch (this._viewMode) {
		case ZmAppt.MODE_NEW:
		case ZmAppt.MODE_EDIT:
		case ZmAppt.MODE_EDIT_SERIES:
		case ZmAppt.MODE_DELETE:
		case ZmAppt.MODE_DELETE_INSTANCE:
		case ZmAppt.MODE_DELETE_SERIES:
			break;
		case ZmAppt.MODE_EDIT_SINGLE_INSTANCE:
			this.repeatType = "NON";
			break;
	}
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

		// if requesting text part but none found, request html part and convert to text
		if (content == null && ct == ZmMimeTable.TEXT_PLAIN) {
			var div = document.createElement("div");
			div.innerHTML = this.notesTopPart.getContentForType(ZmMimeTable.TEXT_HTML);
			return AjxStringUtil.convertHtml2Text(div);
		}
		return AjxUtil.isString(content) ? content : content.content;
	} else {
		return this.getFragment();
	}
};

ZmAppt.prototype.resetRepeatWeeklyDays = 
function() {
	this.repeatWeeklyDays = [ZmAppt.SERVER_WEEK_DAYS[this.startDate.getDay()]];
};

ZmAppt.prototype.resetRepeatMonthlyDayList = 
function() {
	this.repeatMonthlyDayList = [this.startDate.getDate()];
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

/*
 * true if startDate and endDate are on different days
 */
ZmAppt.prototype.isMultiDay =
function() {
	var sd = this.getStartDate();
	var ed = this.getEndDate();
	return (sd.getDate() != ed.getDate()) || (sd.getMonth() != ed.getMonth()) || (sd.getFullYear() != ed.getFullYear());
};

/**
 * accepts a comma delimeted string of ids
 */
ZmAppt.prototype.setAttachments = 
function(ids) {
	if (ids != null && ids.length > 0) {
		var ids = ids.split(',');
		this.attachments = new Array();
		for (var i = 0 ; i < ids.length; ++i){
			this.attachments[i] = {id: ids[i]};
		}
	}
};

ZmAppt.prototype.getAttachments = 
function() {
	var m = this.getMessage();	
	if (this.hasDetails() && m._attachments != null) {
		var attachs = m._attachments;
		if (this._validAttachments == null) {
			this._validAttachments = new Array();
			for (var i = 0; i < attachs.length; ++i) {
				if (m.isRealAttachment(attachs[i]))
					this._validAttachments.push(attachs[i]);
			}
		}
		return this._validAttachments.length > 0 ? this._validAttachments : null;
	}
	return null;
};

// TOOD: i18n
ZmAppt.prototype.getDurationText =
function(emptyAllDay,startOnly) {
	if (this.isAllDayEvent()) {
		if (emptyAllDay)
			return "";
		if (this.isMultiDay()) {
			var endDate = new Date(this.getEndDate());
			endDate.setDate(endDate.getDate()-1);
			return this._getTTDay(this.getStartDate()) + " - " + this._getTTDay(endDate);
		} else {
			return this._getTTDay(this.getStartDate());
		}

	} else {
		if (startOnly) {
			return ZmAppt._getTTHour(this.getStartDate());
		} else {
			return ZmAppt._getTTHour(this.getStartDate())+" - "+ZmAppt._getTTHour(this.getEndDate());
		}			
	}
};

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
};

ZmAppt.prototype.clearDetailsCache = 
function() {
	this._message = null; // the series message should never change
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
function(viewMode, callback, errorCallback) {
	var mode = viewMode || this._viewMode;
	
	var seriesMode = mode == ZmAppt.MODE_EDIT_SERIES;
	if (this._message == null) {
		var id = seriesMode ? (this._seriesInvId || this.invId) : this.invId;
		this._message = new ZmMailMsg(this._appCtxt, id);
		var respCallback = new AjxCallback(this, this._handleResponseGetDetails, [mode, this._message, callback]);
		this._message.load(this._appCtxt.get(ZmSetting.VIEW_AS_HTML), false, respCallback, errorCallback);
	} else {
		this.setFromMessage(this._message, mode);
		if (callback)
			callback.run();
	}
};

ZmAppt.prototype.setFromMessage = 
function(message, viewMode) {
	if (message !== this._currentlyLoaded) {
		this.isOrg = message.invite.isOrganizer(0);
		this.organizer = message.getInviteOrganizer();
		this.name = message.invite.getName(0);
		this.exception = message.invite.isException(0);
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
		this.getAttachments();
		// parse recurrence rules
		var recurrences = message.getInvite().getRecurrenceRules(0);
		this.repeatType = "NON";
		// For now, parse what the UI supports.
		// if this rule is generated by another program,
		// we're most likely going to be showing a string representing
		// the rule, instead of allowing the user to edit the rule.
		if (recurrences != null)
			this._rawRecurrences = recurrences;

		// if we are going to allow the user to edit recurrence rules,
		// then get the information the UI will need. Otherwise, 
		// get the string that describes the recurrence rules.
		if (this.editTimeRepeat()) {
			this._populateRecurrenceFields();
		} else {
			this.getRecurrenceDisplayString();
		}
		this._currentlyLoaded = message;

		this.notesTopPart = new ZmMimePart();
		var html = message.getBodyPart(ZmMimeTable.TEXT_HTML);
		var text = message.getBodyPart(ZmMimeTable.TEXT_PLAIN);
		if (html) {
			this.notesTopPart.setContentType(ZmMimeTable.MULTI_ALT);
	
			// create two more mp's for text and html content types
			var textPart = new ZmMimePart();
			textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
			textPart.setContent(text);
			this.notesTopPart.children.add(textPart);
	
			var htmlPart = new ZmMimePart();
			htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
			htmlPart.setContent(html.content);
			this.notesTopPart.children.add(htmlPart);
		} else {
			this.notesTopPart.setContentType(ZmMimeTable.TEXT_PLAIN);
			this.notesTopPart.setContent(text);
		}
	}
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmAppt.prototype.getToolTip =
function(calController) {
	// update/null if modified
	if (this._orig) return this._orig.getToolTip(calController);

	if (!this._toolTip) {
		var html = new Array(20);
		var idx = 0;
		
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 >";
		html[idx++] = "<tr valign='center'><td colspan=2 align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black;'>";
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>";
		
		// IMGHACK - added outer table for new image changes...
		html[idx++] = "<div style='white-space:nowrap'><table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";
		if (this.hasOtherAttendees()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptMeeting") + "</td>";
			
		if (this.isException()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptException") + "</td>";
		else if (this.isRecurring()) 
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptRecur") + "</td>";
			
//		if (this.hasAlarm()) 
//			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptReminder") + "</td>";

		html[idx++] = "</tr></table>";
		
		html[idx++] = "&nbsp;";
		html[idx++] = AjxStringUtil.htmlEncode(this.getName());
		html[idx++] = "&nbsp;</div></b></td>";	
		html[idx++] = "<td align='right'>";

		var cal = this.getFolderId() != ZmOrganizer.ID_CALENDAR && calController
			? calController.getCalendar(this.getFolderId()) : null;

		html[idx++] = cal && cal.link
			? AjxImg.getImageHtml("GroupSchedule")
			: AjxImg.getImageHtml("Appointment");
					
		html[idx++] = "</td>";
		html[idx++] = "</table></div></td></tr>";
		//idx = this._addEntryRow(ZmMsg.meetingStatus, this.getStatusString(), html, idx, false);

		if (cal)
			idx = this._addEntryRow(ZmMsg.calendar, cal.getName(), html, idx, false);

		if (this.hasOtherAttendees())
			idx = this._addEntryRow(ZmMsg.status, this.getParticipationStatusString(), html, idx, false);		

		var when = this.getDurationText(false, false);
				
		idx = this._addEntryRow(ZmMsg.when, when, html, idx, false);		
		idx = this._addEntryRow(ZmMsg.location, this.getLocation(), html, idx, false);
		idx = this._addEntryRow(ZmMsg.notes, this.getFragment(), html, idx, true, "250");

		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
};

ZmAppt.prototype.editTimeRepeat = 
function() {
	if (this._editingUser == null )
		this._editingUser = this._appCtxt.get(ZmSetting.USERNAME);

	var u = this._editingUser;
	var m = this._viewMode;
	var isOrg = this.isOrganizer();
	if ((m == ZmAppt.MODE_EDIT_SERIES && !isOrg)) {
		return ZmAppt.EDIT_NO_REPEAT;
	}

	if (((m == ZmAppt.MODE_EDIT_SERIES || m == ZmAppt.MODE_EDIT) && isOrg) || m == ZmAppt.MODE_NEW) {
		return ZmAppt.EDIT_TIME_REPEAT;
	}

	return ZmAppt.EDIT_TIME;
};

ZmAppt.prototype.save = 
function(sender, attachmentId) {
	var soapDoc = null;
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
		//if (this._viewMode == ZmAppt.MODE_EDIT_SERIES)
		//	soapDoc.setMethodAttribute("thisAndFuture",true);
	}

	var invAndMsg = this._setSimpleSoapAttributes(soapDoc, ZmAppt.SOAP_METHOD_REQUEST, attachmentId);

	if (needsExceptionId) {
		var exceptId = soapDoc.set("exceptId", null, invAndMsg.inv);
		if (this.allDayEvent != "1") {
			exceptId.setAttribute("d", this._getServerDateTime(this.getOrigStartDate()));
			exceptId.setAttribute("tz", this.timezone);
		} else {
			exceptId.setAttribute("d", this._getServerDate(this.getOrigStartDate()));
		}
	} else {
		// set recurrence rules for appointment (but not for exceptions!)
		this._addRecurrenceRulesToSoap(soapDoc, invAndMsg.inv);
	}

	// TODO - alarm
	// var alarm = soapDoc.set("alarm", null, inv);
	// alarm.setAttribute("rel-start", /* some alarm start time */);

	this._sendRequest(sender, soapDoc);
};

ZmAppt.prototype.cancel = 
function(sender, mode) {
	this.setViewMode(mode);
	// To get the attendees for this appointment, we have to get the message.
	var respCallback = new AjxCallback(this, this._handleResponseCancel, [sender, mode]);
	this.getDetails(null, respCallback);
};

//TODO -- cleanup
ZmAppt.prototype.getTextSummary = 
function(cancel, buffer, idx) {
	var edit = this._viewMode == ZmAppt.MODE_EDIT || 
				this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE ||
				this._viewMode == ZmAppt.MODE_EDIT_SERIES;
	
	// if there are attendees, then create a simple message
	// describing the meeting invitation.
	var showingTimezone = this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);
	// instances of recurring meetings should send out information that looks very
	// much like a simple appointment.
	// simple meeting
	buffer[idx++] = "Subject: "
	buffer[idx++] = this.name;
	if (edit && this.hasOwnProperty("name")) {
		buffer[idx++] = " ";
		buffer[idx++] = ZmAppt.MODIFIED;
	}
	buffer[idx++] = "\n";
	
	buffer[idx++] = "Organizer: "
	buffer[idx++] = this.organizer;
	buffer[idx++] = "\n\n";
	
	if (this.location != "") {
		buffer[idx++] = "Location: ";
		buffer[idx++] = this.location;
		if (edit && this.hasOwnProperty("location")) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
		buffer[idx++] = "\n";
	}

	var s = this.startDate;
	var e = this.endDate;
	if (this._viewMode == ZmAppt.MODE_DELETE_INSTANCE){
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	var recurrence = this.repeatType != "NON" && 
						this._viewMode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE &&
						this._viewMode != ZmAppt.MODE_DELETE_INSTANCE;
	if (recurrence) {
		buffer[idx++] = "Time: ";
		if (this.isAllDayEvent()) {
			buffer[idx++] = "All day";
		}
		else {
			buffer[idx++] = AjxDateUtil.getTimeStr(s, "%h:%m %P");
			buffer[idx++] = " - ";
			buffer[idx++] = AjxDateUtil.getTimeStr(e, "%h:%m %P");
			if (showingTimezone){
				buffer[idx++] = " ";
				buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
			}
		}
		// NOTE: This relies on the fact that setModel creates a clone of the
		//		 appointment object and that the original object is saved in 
		//		 the clone as the _orig property.
		if (edit && (this.hasOwnProperty("allDayEvent") ||
			this._orig.startDate.getTime() != s.getTime() ||
			this._orig.endDate.getTime() != e.getTime()) ) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
	}
	else if (s.getFullYear() == e.getFullYear() && 
			 s.getMonth() == e.getMonth() && s.getDate() == e.getDate()) {
		buffer[idx++] = "Time: ";
		buffer[idx++] = AjxDateUtil.longComputeDateStr(s);
		buffer[idx++] = ", ";
		if (this.isAllDayEvent()) {
			buffer[idx++] = "All day";
		}
		else {
			buffer[idx++] = AjxDateUtil.getTimeStr(s, "%h:%m %P");
			buffer[idx++] = " - ";
			buffer[idx++] = AjxDateUtil.getTimeStr(e, "%h:%m %P");
			if (showingTimezone){
				buffer[idx++] = " ";
				buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
			}
		}
		// NOTE: This relies on the fact that setModel creates a clone of the
		//		 appointment object and that the original object is saved in 
		//		 the clone as the _orig property.
		if (edit && (this.hasOwnProperty("allDayEvent") ||
			this._orig.startDate.getTime() != this.startDate.getTime() ||
			this._orig.endDate.getTime() != this.endDate.getTime()) ) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
	}
	else {
		buffer[idx++] = "Start: ";
		buffer[idx++] = AjxDateUtil.longComputeDateStr(s);
		buffer[idx++] = ", ";
		if (this.isAllDayEvent()) {
			buffer[idx++] = "All day";
		}
		else {
			buffer[idx++] = AjxDateUtil.getTimeStr(s, "%h:%m %P");
			if (showingTimezone){
				buffer[idx++] = " ";
				buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
			}
		}
		// NOTE: This relies on the fact that setModel creates a clone of the
		//		 appointment object and that the original object is saved in 
		//		 the clone as the _orig property.
		if (edit && (this.hasOwnProperty("allDayEvent") ||
			this._orig.startDate.getTime() != this.startDate.getTime()) ) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
		buffer[idx++] = "\n";
		buffer[idx++] = "End: ";
		buffer[idx++] = AjxDateUtil.longComputeDateStr(e);
		buffer[idx++] = ", ";
		if (this.isAllDayEvent()) {
			buffer[idx++] = "All day";
		}
		else {
			buffer[idx++] = AjxDateUtil.getTimeStr(e, "%h:%m %P");
			if (showingTimezone){
				buffer[idx++] = " ";
				buffer[idx++] = ZmTimezones.valueToDisplay[this.timezone];
			}
		}
		// NOTE: This relies on the fact that setModel creates a clone of the
		//		 appointment object and that the original object is saved in 
		//		 the clone as the _orig property.
		if (edit && (this.hasOwnProperty("allDayEvent") ||
			this._orig.endDate.getTime() != this.endDate.getTime()) ) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
	}
	buffer[idx++] = "\n";

	if (recurrence) {
		buffer[idx++] = "Recurrence: ";
		buffer[idx++] = this._getRecurrenceBlurbForSave();
		var modified = this.hasOwnProperty("repeatType");
		modified = modified || 
					this.hasOwnProperty("repeatCustom") ||
					this.hasOwnProperty("repeatCustomType") ||
					this.hasOwnProperty("repeatCustomCount") ||
					this.hasOwnProperty("repeatCustomOrdinal") ||
					this.hasOwnProperty("repeatCustomDayOfWeek") ||
					this.hasOwnProperty("repeatCustomMonthday");
		modified = modified || 
					this.hasOwnProperty("repeatEnd") ||
					this.hasOwnProperty("repeatEndType") || 
					this.hasOwnProperty("repeatEndCount") || 
					this.hasOwnProperty("repeatEndDate") ||
					this.hasOwnProperty("repeatWeeklyDays") ||
					this.hasOwnProperty("repeatMonthlyDayList") ||
					this.hasOwnProperty("repeatYearlyMonthsList");
		if (edit && modified) {
			buffer[idx++] = " ";
			buffer[idx++] = ZmAppt.MODIFIED;
		}
		buffer[idx++] = "\n";
	}

	buffer[idx++] = "\n";
	buffer[idx++] = "Invitees: ";
	var attendees = this.attendees.replace(/^\s*/,"").replace(/\s*$/,"").split(/;\s*/);
	if (attendees.length > 10) {
		attendees = attendees.slice(0, 10);
		attendees.push("...");
	}
	buffer[idx++] = attendees.join(", ");
	
	//buffer[idx++] = "\n";
	buffer[idx++] = ZmAppt.NOTES_SEPARATOR;
	return idx;
};


// Private / Protected methods

ZmAppt.prototype._resetCached =
function() {
	delete this._validAttachments;
	delete this.tooltip;
};

ZmAppt.prototype._createRangeIfNecessary = 
function() {
 	if (this._rangeObj == null) {
		this._rangeObj = new Object();
		this._rangeObj.startDate = new Date();
		this._rangeObj.endDate = new Date();
	}
};

// TODO: i18n/l10n
ZmAppt.prototype._getTTDay =
function(d) {
	return (d.getMonth()+1)+"/"+d.getDate();
};

// Adds a row to the tool tip.
ZmAppt.prototype._addEntryRow =
function(field, data, html, idx, wrap, width) {
	if (data != null && data != "") {
		html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b><div style='white-space:nowrap'>";
		html[idx++] = AjxStringUtil.htmlEncode(field) + ":";
		html[idx++] = "</div></b></td><td align='left'><div style='white-space:";
		html[idx++] = wrap ? "wrap;" : "nowrap;";
		if (width) html[idx++] = "width:"+width+"px;";
		html[idx++] = "'>";
		html[idx++] = AjxStringUtil.htmlEncode(data);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
};

ZmAppt.prototype._handleResponseGetDetails =
function(args) {
	var mode		= args[0];
	var message		= args[1];
	var callback	= args[2];
	var result		= args[3];
	
	// msg content should be text, so no need to pass callback to setFromMessage()
	this.setFromMessage(message, mode);
	if (callback) callback.run(result);
};

ZmAppt.prototype._populateRecurrenceFields = 
function () {
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
			for (i = 0; i < adds.length; ++i) {
				rules = adds[i].rule;
				if (rules) {
					for (j =0; j < rules.length; ++j) {
						rule = rules[j];
						if (rule.freq) {
							this.repeatType = rule.freq.substring(0,3);
							if (rule.interval && rule.interval[0].ival) 
								this.repeatCustomCount = parseInt(rule.interval[0].ival);
						}
						// hmm ... what to do about negative numbers....
						if (rule.bymonth) {
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
						if (rule.byday && rule.byday[0] && rule.byday[0].wkday) {
							this.repeatCustom = "1";
							var wkdayLen = rule.byday[0].wkday.length;
							if (this.repeatType == "WEE" || (this.repeatType == "DAI" && wkdayLen == 5)) {
								this.repeatWeekday = this.repeatType == "DAI";
								for (x = 0; x < wkdayLen; ++x) {
									if (this.repeatWeeklyDays == null) 
										this.repeatWeeklyDays = new Array();
									this.repeatWeeklyDays.push(rule.byday[0].wkday[x].day);
								}	
							} else {
								this.repeatCustomDayOfWeek = rule.byday[0].wkday[0].day;
								this.repeatCustomOrdinal = rule.byday[0].wkday[0].ordwk;
								this.repeatCustomType = "O";
							}
						}
						if (rule.until) {
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

ZmAppt.prototype.frequencyToDisplayString = 
function(freq, count) {
	var plural = count > 1 ? 1 : 0;
	return freq == "DAI" && this.repeatWeekday 
		? ZmMsg.weekday
		: AjxDateUtil.FREQ_TO_DISPLAY[freq][plural];
};

//TODO : i18n
ZmAppt.prototype.getRecurrenceDisplayString = 
function() {
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

ZmAppt.prototype._ruleToString = 
function(rule, str, idx) {
	idx = this._getFreqString(rule, str, idx);
	idx = this._getByMonthString(rule, str, idx);
	idx = this._getByWeeknoString(rule, str, idx);
	idx = this._getByYearDayString(rule, str, idx);
	idx = this._getMonthDayString(rule, str, idx);
	idx = this._getByDayString(rule, str, idx);
	idx = this._getRecurrenceTimeString(rule, str, idx);
	return idx;
};

ZmAppt.prototype._getFreqString = 
function(rule, str, idx) {
	if (rule.freq) {
		var count = 0;
		if (rule.interval && rule.interval[0].ival) 
			count = rule.interval[0].ival;
		if (count > 1 ) {
			str[idx++] = count; 
			str[idx++] = " ";
		}
		freq = rule.freq.substring(0,3);
		str[idx++] = this.frequencyToDisplayString(freq, count);
	}
	return idx;
};

ZmAppt.prototype._getByMonthString = 
function(rule, str, idx) {
	if (rule.bymonth) {
		list = rule.bymonth[0].molist;
		arr = list.split(',');
		if (arr && arr.length > 0) 
			str[idx++] = " in ";
		var ord;
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			str[idx++] = AjxDateUtil.MONTH_MEDIUM[ord];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmAppt.prototype._getByWeeknoString = 
function(rule, str, idx) {
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

ZmAppt.prototype._getMonthDayString = 
function(rule, str, idx) {
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

ZmAppt.prototype._getByDayString = 
function(rule, str, idx) {
	var x;
	if (rule.byday) {
		for (x = 0; x < rule.byday.length; ++x) {
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

ZmAppt.prototype._getRecurrenceTimeString = 
function(rule, str, idx) {
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

ZmAppt.prototype._getByYearDayString = 
function(rule, str, idx) {
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

ZmAppt.prototype._getServerDate = 
function(date) {
	var yyyy = date.getFullYear();
	var MM = AjxDateUtil._pad(date.getMonth() + 1);
	var dd = AjxDateUtil._pad(date.getDate());
	return AjxBuffer.concat(yyyy,MM,dd);
};

ZmAppt.prototype._getServerDateTime = 
function(date) {
	var yyyy = date.getFullYear();
	var MM = AjxDateUtil._pad(date.getMonth() + 1);
	var dd = AjxDateUtil._pad(date.getDate());
	var hh = AjxDateUtil._pad(date.getHours());
	var mm = AjxDateUtil._pad(date.getMinutes());
	var ss = AjxDateUtil._pad(date.getSeconds());
	return AjxBuffer.concat(yyyy, MM, dd,"T",hh, mm, ss);
};

ZmAppt.prototype._parseServerTime = 
function(serverStr, date) {
	if (serverStr.charAt(8) == 'T') {
		var hh = parseInt(serverStr.substr(9,2), 10);
		var mm = parseInt(serverStr.substr(11,2), 10);
		var ss = parseInt(serverStr.substr(13,2), 10);
		date.setHours(hh, mm, ss, 0);
	}
	return date;
};

ZmAppt.prototype._parseServerDateTime = 
function(serverStr) {
	if (serverStr == null) return null;
	var d = new Date();
	var yyyy = parseInt(serverStr.substr(0,4), 10);
	var MM = parseInt(serverStr.substr(4,2), 10);
	var dd = parseInt(serverStr.substr(6,2), 10);
	d.setFullYear(yyyy);
	// EMC 8/31/05 - fix for bug 3839. It looks like firefox needs to call setMonth twice for 
	// dates starting sept 1. No good reason at this point, but I noticed that
	// setting it twice seems to do the trick. Very odd.
	d.setMonth(MM - 1);
	d.setMonth(MM - 1);
	// DON'T remove second call to setMonth
	d.setDate(dd);
	this._parseServerTime(serverStr, d);
	return d;
};

ZmAppt.prototype._setSimpleSoapAttributes = 
function(soapDoc, method,  attachmentId) {

	if (this.organizer == null) this.organizer = this._appCtxt.get(ZmSetting.USERNAME);
	var m = this._messageNode = soapDoc.set('m');

	m.setAttribute("d", new Date().getTime());

	if (this.getFolderId() != ZmFolder.ID_CALENDAR)
		m.setAttribute("l", this.folderId);

	var inv = soapDoc.set("inv", null, m);
	switch (method) {
		case ZmAppt.SOAP_METHOD_REQUEST: inv.setAttribute('method', "REQUEST"); break;
		case ZmAppt.SOAP_METHOD_CANCEL:  inv.setAttribute('method', "CANCEL"); break;
	}
	
	inv.setAttribute("type", "event");

	if (this.isOrganizer())
		this._addAttendeesToSoap(soapDoc, inv, m);

	this._addNotesToSoap(soapDoc, m);

	if (this.uid !== void 0 && this.uid != null && this.uid != -1)
		inv.setAttribute("uid", this.uid);

	inv.setAttribute("type", "event");
	inv.setAttribute("fb", this.freeBusy);

	var transp = this.isAllDayEvent() ? "T" : "O";
	inv.setAttribute("transp", transp);

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

	if (this.location != null)
		inv.setAttribute("loc", this.location);
	
	var org = soapDoc.set("or", null, inv);
	// TODO: make attendees list, a list of ZmEmailAddresses.
	// org.setAttribute("d", ...)
	org.setAttribute("a", this.organizer);

	// handle attachments
	if (attachmentId != null || (this._validAttachments != null && this._validAttachments.length)) {
		var attachNode = soapDoc.set("attach", null, m);
		if (attachmentId)
			attachNode.setAttribute("aid", attachmentId);

		if (this._validAttachments) {
			for (var i = 0; i < this._validAttachments.length; i++) {
				var msgPartNode = soapDoc.set("mp", null, attachNode);
				msgPartNode.setAttribute("mid", this._message.id); 				// shouldnt this be this.getInvId() ??
				msgPartNode.setAttribute("part", this._validAttachments[i].part);
			}
		}
	}

	return {'inv': inv, 'm': m};
};

ZmAppt.prototype._addRecurrenceRulesToSoap = 
function(soapDoc, inv) {
	if (this.repeatType == "NON") return;

	var recur = soapDoc.set("recur", null, inv);
	var add = soapDoc.set("add", null, recur);
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

	if (this.repeatCustom != "1")
		return;

	if (this.repeatType == "DAI") {
		if (this.repeatWeekday) {
			// TODO: for now, handle "every weekday" as M-F
			//       eventually, needs to be localized work week days
			var bwd = soapDoc.set("byday", null, rule);
			for (var i in ZmAppt.SERVER_WEEK_DAYS) {
				var day = ZmAppt.SERVER_WEEK_DAYS[i];
				if (day == "SA" || day == "SU")
					continue;
				var wkDay = soapDoc.set("wkday", null, bwd);
				wkDay.setAttribute("day", day);
			}
		}
	} else if (this.repeatType == "WEE") {
		var bwd = soapDoc.set("byday", null, rule);
		for (var i = 0; i < this.repeatWeeklyDays.length; ++i) {
			var wkDay = soapDoc.set("wkday", null, bwd);
			wkDay.setAttribute("day", this.repeatWeeklyDays[i]);
		}
	} 
	else if (this.repeatType == "MON") 
	{
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
	}
	else if (this.repeatType == "YEA") 
	{
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
};

ZmAppt.prototype._addAttendeesToSoap = 
function(soapDoc, inv, m) {
	if (this.attendees != null && this.attendees.length > 0) {
		var addrArr = this.attendees.split(ZmAppt.ATTENDEES_SEPARATOR_REGEX);
		var addrs = new Array();
		for (var z = 0 ; z < addrArr.length; ++z) {
			var e = ZmEmailAddress.parse(addrArr[z]);
			if (e) addrs.push(e);
		}

		for (var i = 0; i < addrs.length; ++i) {
			var address = addrs[i].getAddress();
			var dispName = addrs[i].getDispName();
			if (inv != null) {
				at = soapDoc.set("at", null, inv);			
				at.setAttribute("role", "OPT");		// for now make all attendees optional, until the UI has a way of setting this.
				at.setAttribute("ptst", "NE"); 		// not sure if it makes sense for status to be required on create.
				at.setAttribute("rsvp", "1");
				at.setAttribute("a", address);
				if (dispName)
					at.setAttribute("d", dispName);
			}

			if (m != null) {
				e = soapDoc.set("e", null, m);
				e.setAttribute("a", address);
				if (dispName)
					e.setAttribute("p", dispName);
				e.setAttribute("t", ZmEmailAddress.toSoapType[addrs[i].getType()]);
			}
		}
	}
};

// TODO: i18n!
ZmAppt.prototype._getDefaultBlurb = 
function(cancel) {
	var buf = new Array();
	var idx = 0;
	var singleInstance = this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE	|| 
						 this._viewMode == ZmAppt.MODE_DELETE_INSTANCE;
	if (cancel) {
		buf[idx++] = singleInstance
			? "A single instance of the following meeting has been cancelled:"
			: "The following meeting has been cancelled:";
	} else {
		if (this._viewMode == ZmAppt.MODE_EDIT || 
			this._viewMode == ZmAppt.MODE_EDIT_SINGLE_INSTANCE ||
			this._viewMode == ZmAppt.MODE_EDIT_SERIES)
		{
			buf[idx++] = singleInstance
				? "A single instance of the following meeting has been modified:"
				: "The following meeting has been modified:";
		} 
		else 
		{
			buf[idx++] = "The following is a new meeting request:";
		}
	}
	buf[idx++] = "\n\n";

	idx = this.getTextSummary(cancel, buf, idx);
	return buf.join("");
};

ZmAppt.prototype._getRecurrenceBlurbForSave = 
function() {
	if (this.repeatType == "NON") return "";

	var blurb = new Array();
	var idx = 0;

	blurb[idx++] = "Every ";
	if (this.repeatCustomCount > 1) {
		blurb[idx++] = this.repeatCustomCount;
		blurb[idx++] = " ";
	}
	blurb[idx++] = this.frequencyToDisplayString(this.repeatType, this.repeatCustomCount);

	var customRepeat = (this.repeatCustom == '1');
	if (this.repeatType == "WEE") {
		blurb[idx++] = " on ";
		if (customRepeat) {
			if (this.repeatWeeklyDays.length > 0) {
				for (var i = 0; i < this.repeatWeeklyDays.length; ++i) {
					blurb[idx++] = ZmAppt.SERVER_DAYS_TO_DISPLAY[this.repeatWeeklyDays[i]];
					if (i == (this.repeatWeeklyDays.length - 2 )) {
						blurb[idx++] = " and ";
					} else if (i < (this.repeatWeeklyDays.length - 1)) {
						blurb[idx++] = ", ";
					}
				}
			}
		} else {
			blurb[idx++] = AjxDateUtil.WEEKDAY_LONG[this.startDate.getDay()];
		}
	} else if (this.repeatType == "MON"){
		if (this.repeatCustomType == "S") {
			blurb[idx++] = " on the ";
			if (customRepeat) {
				var nums = this.repeatMonthlyDayList;
				nums = nums.sort(ZmAppt._SORTBY_VALUE);
				for (var i = 0 ; i < nums.length; ++i ) {
					blurb[idx++] = nums[i];
					if (i < nums.length - 1) {
						blurb[idx++] = ", ";
					} else if (i == nums.length - 2) {
						blurb[idx++] = " and ";
					}
				}
			} else {
				blurb[idx++] =  this.repeatCustomOrdinal;
				blurb[idx++] = this.repeatCustomDayOfWeek;
				blurb[idx++] = " of the month ";
			}
		} else {
			blurb[idx++] = this.startDate.getDate();
		}
	} else if (this.repeatType == "YEA") {
		if (customRepeat) {
			blurb[idx++] = " on ";
			blurb[idx++] = AjxDateUtil.MONTH_MEDIUM[Number(this.repeatYearlyMonthsList)];
			if (this.repeatCustomType == "O") {
				blurb[idx++] = " on the ";
				blurb[idx++] = ZmAppt.MONTHLY_DAY_OPTIONS[Number(this.repeatCustomOrdinal)-1].label;
				var dayOfWeek = null;
				for (var i = 0; i < ZmAppt.SERVER_WEEK_DAYS.length; i++) {
					if (ZmAppt.SERVER_WEEK_DAYS[i] == this.repeatCustomDayOfWeek) {
						dayOfWeek = AjxDateUtil.WEEKDAY_LONG[i];
						break;
					}
				}
				blurb[idx++] = dayOfWeek;
				blurb[idx++] = " of the month ";
			} else {
				blurb[idx++] = " ";
				blurb[idx++] = this.repeatCustomMonthDay;
			}
		} else {
			blurb[idx++] = " on ";
			blurb[idx++] = AjxDateUtil.MONTH_MEDIUM[this.startDate.getMonth()];
			blurb[idx++] = " ";
			blurb[idx++] = this.startDate.getDate();
		}
	}

	if (this.repeatEndDate != null && this.repeatEndType == "D") {
		blurb[idx++] = " until ";
		blurb[idx++] = AjxDateUtil.simpleComputeDateStr(this.repeatEndDate);
		if (this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE)) {
			blurb[idx++] = " ";
			blurb[idx++] = ZmTimezones.valueToDisplay[this.timezone];
		}

	} else if (this.repeatEndType == "A") {
		blurb[idx++] = " for ";
		blurb[idx++] = this.repeatEndCount;
		blurb[idx++] = " ";
		blurb[idx++] = this.frequencyToDisplayString(this.repeatType, this.repeatEndCount);
	}
	blurb[idx++] = " effective ";
	blurb[idx++] = AjxDateUtil.simpleComputeDateStr(this.startDate);
	return blurb.join("");
};

ZmAppt.prototype._addNotesToSoap = 
function(soapDoc, m, cancel) {	
	var prefix = this.attendees ? this._getDefaultBlurb(cancel) : "";
	var mp = soapDoc.set("mp", null, m);
	var ct = this.notesTopPart ? this.notesTopPart.getContentType() : ZmMimeTable.TEXT_PLAIN;
	mp.setAttribute("ct", ct);
	// if top part has sub parts, add them as children
	var numSubParts = this.notesTopPart ? this.notesTopPart.children.size() : 0;
	if (numSubParts > 0) {
		for (var i = 0; i < numSubParts; i++) {
			var part = this.notesTopPart.children.get(i);
			var partNode = soapDoc.set("mp", null, mp);
			partNode.setAttribute("ct", part.getContentType());
			var content = AjxBuffer.concat(prefix, part.getContent());
			soapDoc.set("content", content, partNode);
		}
	} else {
		var content = this.notesTopPart ? AjxBuffer.concat(prefix, this.notesTopPart.getContent()) : "";
		soapDoc.set("content", content, mp);
	}
};

ZmAppt.prototype._sendRequest = 
function(sender, soapDoc) {
	var responseName = soapDoc.getMethod().nodeName.replace("Request", "Response");
	var resp = sender.sendRequest(soapDoc);

	// branch for different responses
	var response = resp[responseName];
	if (response.uid != null)
		this.uid = response.uid;

	if (response.m != null) {
		var oldInvId = this.invId;
		this.invId = response.m.id;
		if (oldInvId != this.invId)
			this.clearDetailsCache();
	}

	this._messageNode = null;
};

ZmAppt.prototype._handleResponseCancel =
function(args) {
	var sender	= args[0];
	var mode	= args[1];
	
	if (mode == ZmAppt.MODE_DELETE || mode == ZmAppt.MODE_DELETE_SERIES || mode == ZmAppt.MODE_DELETE_INSTANCE) {
		var soapDoc = AjxSoapDoc.create("CancelAppointmentRequest", "urn:zimbraMail");
		this._addInviteAndCompNum(soapDoc);

		if (mode == ZmAppt.MODE_DELETE_INSTANCE) {
			soapDoc.setMethodAttribute("s", this.getOrigStartTime());
			var inst = soapDoc.set("inst");
			inst.setAttribute("d", this._getServerDateTime(this.getOrigStartDate()));
			inst.setAttribute("tz", this.timezone);
		}

		var m = soapDoc.set("m");
		if (this.isOrganizer())
			this._addAttendeesToSoap(soapDoc, null, m);
		soapDoc.set("su", "Cancelled: " + this.name, m);
		this._addNotesToSoap(soapDoc, m, true);
		this._sendRequest(sender, soapDoc);
	}
};

ZmAppt.prototype.getAttachListHtml = 
function(attach, hasCheckbox) {
	var csfeMsgFetchSvc = location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	var hrefRoot = "href='" + csfeMsgFetchSvc + "id=" + this.getInvId() + "&amp;part=";

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText = "";
	if (size != null) {
	    if (size < 1024)		sizeText = " (" + size + "B)&nbsp;";
        else if (size < 1024^2)	sizeText = " (" + Math.round((size/1024) * 10) / 10 + "KB)&nbsp;"; 
        else 					sizeText = " (" + Math.round((size / (1024*1024)) * 10) / 10 + "MB)&nbsp;"; 
	}

	var html = new Array();
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	if (hasCheckbox) {
		html[i++] = "<td width=1%><input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "'></td>";
	}
	html[i++] = "<td><a target='_blank' class='AttLink' ";
	html[i++] = hrefRoot;
	html[i++] = attach.part;
	html[i++] = "'>";
	html[i++] = attach.filename;
	html[i++] = sizeText;
	html[i++] = "</a></td></tr>";
	html[i++] = "</table>";

	return html.join("");
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
};

ZmAppt._SORTBY_VALUE = 
function(a, b) {
	a = Number(a);
	b = Number(b);
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
};
