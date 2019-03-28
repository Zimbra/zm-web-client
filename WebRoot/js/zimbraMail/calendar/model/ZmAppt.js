/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines an appointment.
 *
 */

/**
 * @class
 * This class represents a calendar item.
 *
 * @param	{ZmList}	list		the list
 * @param	{Boolean}	noinit		if <code>true</code>, do not initialize the appointment
 *
 * @extends ZmCalItem
 */
ZmAppt = function(list, noinit) {

	ZmCalItem.call(this, ZmItem.APPT, list);
	if (noinit) { return; }

	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.privacy = "PUB";														// Privacy class (PUB|PRI|CON) (public/private/confidential)
	this.transparency = "O";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
	this.otherAttendees = false;
	this.rsvp = true;
    this.inviteNeverSent = true;

	// attendees by type
	this._attendees = {};
	this._attendees[ZmCalBaseItem.PERSON]	= [];
	this._attendees[ZmCalBaseItem.LOCATION]	= [];
	this._attendees[ZmCalBaseItem.EQUIPMENT]= [];

	this.origAttendees = null;	// list of ZmContact
	this.origLocations = null;	// list of ZmResource
	this.origEquipment = null;	// list of ZmResource

	// forward address
	this._fwdAddrs = {};    
};

ZmAppt.prototype = new ZmCalItem;
ZmAppt.prototype.constructor = ZmAppt;


// Consts

ZmAppt.MODE_DRAG_OR_SASH		= ++ZmCalItem.MODE_LAST;
ZmAppt.ATTENDEES_SEPARATOR		= "; ";

ZmAppt.ACTION_SAVE = "SAVE";
ZmAppt.ACTION_SEND = "SEND";

// Public methods

ZmAppt.prototype.toString =
function() {
	return "ZmAppt";
};

/**
 * Gets the attendees.
 * 
 * @param	{constant}		type		the type
 * @return	{Array}		an array of attendee objects
 * 
 * @see		ZmCalBaseItem.PERSON
 * @see		ZmCalBaseItem.LOCATION
 * @see		ZmCalBaseItem.EQUIPMENT
 */
ZmAppt.prototype.getAttendees =
function(type) {
	return this._attendees[type];
};

/**
 * Gets the attendee as text.
 * 
 * @param	{constant}		type		the type
 * @param	{Boolean}		inclDispName		if <code>true</code>, include the display name
 * 
 * @return	{String}	the attendee string
 */
ZmAppt.prototype.getAttendeesText =
function(type, inclDispName) {
	return ZmApptViewHelper.getAttendeesString(this._attendees[type], type, inclDispName);
};

/**
 * Checks if the appointment has attendees of the specified type.
 * 
 * @param	{constant}		type		the type
 * @return	{Boolean}	<code>true</code> if the appointment has 1 or more attendees
 */
ZmAppt.prototype.hasAttendeeForType =
function(type) {
	return (this._attendees[type].length > 0);
};

/**
 * Checks if the appointment has any attendees.
 * 
 * @return	{Boolean}	<code>true</code> if the appointment has 1 or more attendees
 */
ZmAppt.prototype.hasAttendees =
function() {
	return this.hasAttendeeForType(ZmCalBaseItem.PERSON) ||
		   this.hasAttendeeForType(ZmCalBaseItem.LOCATION) ||
		   this.hasAttendeeForType(ZmCalBaseItem.EQUIPMENT);
};

ZmAppt.prototype.setForwardAddress =
function(addrs) {
	this._fwdAddrs = addrs;
};

ZmAppt.prototype.getForwardAddress =
function() {
	return this._fwdAddrs;
};

// Public methods

ZmAppt.loadOfflineData =
function(apptInfo, list) {
    var appt = new ZmAppt(list);
    var recurrence;
    var alarmActions;
    var subObjects = {_recurrence:ZmRecurrence, alarmActions:AjxVector};
    for (var prop in apptInfo) {
        // PROBLEM: The indexeddb serialization/deserialization does not recreate the actual objects - for example,
        // a AjxVector is recreated as an object containing an array.  We really want a more generalized means, but
        // for the moment do custom deseralization here.   Also, assuming only one sublevel of custom objects
        if (subObjects[prop]) {
            var obj = new subObjects[prop]();
            for (var rprop in apptInfo[prop]) {
                obj[rprop] = apptInfo[prop][rprop];
            }
            appt[prop] = obj;
        } else {
            appt[prop] = apptInfo[prop];
        }
    }

    return appt;
}

/**
 * Used to make our own copy because the form will modify the date object by 
 * calling its setters instead of replacing it with a new date object.
 * 
 * @private
 */
ZmApptClone = function() { };
ZmAppt.quickClone = 
function(appt) {
	ZmApptClone.prototype = appt;

	var newAppt = new ZmApptClone();
	newAppt.startDate = new Date(appt.startDate.getTime());
	newAppt.endDate = new Date(appt.endDate.getTime());
	newAppt._uniqId = Dwt.getNextId();

	newAppt.origAttendees = AjxUtil.createProxy(appt.origAttendees);
	newAppt.origLocations = AjxUtil.createProxy(appt.origLocations);
	newAppt.origEquipment = AjxUtil.createProxy(appt.origEquipment);
	newAppt._validAttachments = AjxUtil.createProxy(appt._validAttachments);

	if (newAppt._orig == null) {
		newAppt._orig = appt;
	}
	newAppt.type = ZmItem.APPT;
	newAppt.rsvp = appt.rsvp;

	newAppt.freeBusy = appt.freeBusy;
    if (appt.isRecurring()) {
        newAppt._recurrence = appt.getRecurrence();
    }
	newAppt.color = appt.color;
	newAppt.rgb = appt.rgb;

    return newAppt;
};

ZmAppt.createFromDom =
function(apptNode, args, instNode, noCache) {
	var appt = new ZmAppt(args.list);
	appt._loadFromDom(apptNode, (instNode || {}));
    if (appt.id && !noCache) {
        appCtxt.cacheSet(appt.id, appt);
    }
	return appt;
};

/**
 * Gets the folder.
 * 
 * @return	{ZmFolder}		the folder
 */
ZmAppt.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

/**
 * Gets the tool tip. If it needs to make a server call, returns a callback instead.
 *
 * @param {ZmController}	controller	the controller
 * 
 * @return	{Hash|String}	the callback {Hash} or tool tip
 */
ZmAppt.prototype.getToolTip =
function(controller) {
	var appt = this.apptClone || this._orig || this;
	var needDetails = (!appt._toolTip || (appt.otherAttendees && !appt.ptstHashMap));
	if (needDetails) {
        return {callback:appt._getToolTip.bind(appt, controller), loading:false};
	} else {
		return appt._toolTip || appt._getToolTip(controller);
	}
};

ZmAppt.prototype._getToolTip =
function(controller, callback) {

	// getDetails() of original appt will reset the start date/time and will break the ui layout
	this.apptClone = ZmAppt.quickClone(this);
	var respCallback = this._handleResponseGetToolTip.bind(this.apptClone, controller, callback); //run the callback on the clone - otherwise we lost data such as freeBusy
	this.apptClone.getDetails(null, respCallback);
};

ZmAppt.prototype._handleResponseGetToolTip =
function(controller, callback) {
	var organizer = this.getOrganizer();
	var sentBy = this.getSentBy();
	var userName = appCtxt.get(ZmSetting.USERNAME);
	if (sentBy || (organizer && organizer != userName)) {
		organizer = (this.message && this.message.invite && this.message.invite.getOrganizerName()) || organizer;
		if (sentBy) {
			var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
			var contact = contactsApp && contactsApp.getContactByEmail(sentBy);
			sentBy = (contact && contact.getFullName()) || sentBy;
		}
	} else {
		organizer = null;
		sentBy = null;
	}

	var params = {
		appt: this,
		cal: (this.folderId != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
		organizer: organizer,
		sentBy: sentBy,
		when: this.getDurationText(false, false),
		location: this.getLocation(),
		width: "250",
		hideAttendees: true
	};

	this.updateParticipantStatus();
	if (this.ptstHashMap != null) {
		var ptstStatus = {};
		var statusAttendees;
		var hideAttendees = true;

		statusAttendees = ptstStatus[ZmMsg.ptstAccept] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_ACCEPT);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstDeclined] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_DECLINED);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstTentative] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_TENTATIVE);
		hideAttendees = hideAttendees && !statusAttendees.count;

		statusAttendees = ptstStatus[ZmMsg.ptstNeedsAction] = this._getPtstStatus(ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
		hideAttendees = hideAttendees && !statusAttendees.count;
		params.hideAttendees = hideAttendees;
		params.ptstStatus = ptstStatus;

		var attendees = [];
		if (!this.rsvp) {
			var personAttendees = this._attendees[ZmCalBaseItem.PERSON];
			for (var i = 0; i < personAttendees.length; i++) {
				var attendee = personAttendees[i];
				attendees.push(attendee.getAttendeeText(null, true));
			}
			params.attendeesText = this.getAttendeeToolTipString(attendees);
		}
	}

	var toolTip = this._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
	if (callback) {
		callback.run(toolTip);
	} else {
		return toolTip;
	}
};

ZmAppt.prototype._getPtstStatus =
function(ptstHashKey) {
	var ptstString = this.ptstHashMap[ptstHashKey];

	return {
		count: ptstString ? ptstString.length : 0,
		attendees: this.getAttendeeToolTipString(ptstString)
	};
};

ZmAppt.prototype.getAttendeeToolTipString =
function(val) {
	var str;
	var maxLimit = 10;
	if (val && val.length > maxLimit) {
		var origLength = val.length;
		var newParts = val.splice(0, maxLimit);
		str = newParts.join(",") + " ("+ (origLength - maxLimit) +" " +  ZmMsg.more + ")" ;
	} else if (val) {
		str = val.join(",");
	}
	return str;
};

/**
 * Gets the summary for proposed time
 *
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @return	{String}	the summary
 */
ZmAppt.prototype.getProposedTimeSummary =
function(isHtml) {
	var orig = this._orig || this;

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

	var params = [ZmMsg.subjectLabel, this.name, ""];

	buf[i++] = formatter.format(params);
	buf[i++] = "\n";

	if (isHtml) {
		buf[i++] = "</table>";
	}
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}

	i = this.getApptTimeSummary(buf, i, isHtml, true);

	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmItem.NOTES_SEPARATOR;

	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};

/**
 * Gets the summary.
 *
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @return	{String}	the summary
 */
ZmAppt.prototype.getSummary =
function(isHtml) {

	if (this.isProposeTimeMode) {
		return this.getProposedTimeSummary(isHtml);
	}

	var orig = this._orig || this;

	var isEdit = !this.inviteNeverSent && (this.viewMode == ZmCalItem.MODE_EDIT ||
				  this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE ||
				  this.viewMode == ZmCalItem.MODE_EDIT_SERIES);

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
	var params = [ ZmMsg.subjectLabel, AjxStringUtil.htmlEncode(this.name), modified ? ZmMsg.apptModifiedStamp : "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";

	var userName = appCtxt.get(ZmSetting.USERNAME), displayName;
	var mailFromAddress = this.getMailFromAddress();
	if (mailFromAddress) {
		userName = mailFromAddress;
	} else if(this.identity) {
		userName = this.identity.sendFromAddress;
		displayName = this.identity.sendFromDisplay;
	}
	var organizer = this.organizer ? this.organizer : userName;
	var orgEmail = (!this.organizer && displayName)
		? (new AjxEmailAddress(userName, null, displayName)).toString()
		: ZmApptViewHelper.getAddressEmail(organizer).toString();
	var orgText = isHtml ? AjxStringUtil.htmlEncode(orgEmail) : orgEmail;
	var params = [ ZmMsg.organizer + ":", orgText, "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";
	if (this.getFolder().isRemote() && this.identity) {
		var identity = this.identity;
		orgEmail = new AjxEmailAddress(identity.sendFromAddress , null, identity.sendFromDisplay);
		orgEmail = orgEmail.toString();
		orgText = isHtml ? AjxStringUtil.htmlEncode(orgEmail) : orgEmail;
		buf[i++] = formatter.format([ZmMsg.sentBy+":", orgText, ""]);
		buf[i++] = "\n";
	}
	if (isHtml) {
		buf[i++] = "</table>";
	}
	buf[i++] = "\n";
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}

	var locationLabel = this.getLocation();
	var locationText = isHtml ? AjxStringUtil.htmlEncode(locationLabel) : locationLabel;
	var origLocationLabel = orig ? orig.getLocation() : "";
	var emptyLocation = (locationLabel == origLocationLabel && origLocationLabel == "");
	if (!emptyLocation || this.isForwardMode) {
		params = [ZmMsg.locationLabel, locationText, (isEdit && locationLabel != origLocationLabel && !this.isForwardMode ) ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var location = this.getAttendeesText(ZmCalBaseItem.LOCATION, true);
	if (location) {
		var origLocationText = ZmApptViewHelper.getAttendeesString(this.origLocations, ZmCalBaseItem.LOCATION, true);
		modified = (isEdit && (origLocationText != location));
		var resourcesText = isHtml ? AjxStringUtil.htmlEncode(location) : location;
		params = [ZmMsg.resourcesLabel, resourcesText, modified ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var equipment = this.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	if (equipment) {
		var origEquipmentText = ZmApptViewHelper.getAttendeesString(this.origEquipment, ZmCalBaseItem.EQUIPMENT, true);
		modified = (isEdit && (origEquipmentText != equipment));
		var equipmentText = isHtml ? AjxStringUtil.htmlEncode(equipment) : equipment;
		params = [ZmMsg.resourcesLabel, equipmentText, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	i = this.getApptTimeSummary(buf, i, isHtml, isEdit);
	i = this.getRecurrenceSummary(buf, i, isHtml, isEdit);

	if (this._attendees[ZmCalBaseItem.PERSON].length) {
		if (isHtml) {
			buf[i++] = "</table>\n<p>\n<table border='0'>";
		}
		buf[i++] = "\n";
		var reqAttString = ZmApptViewHelper.getAttendeesByRole(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON, ZmCalItem.ROLE_REQUIRED, 10);
		var optAttString = ZmApptViewHelper.getAttendeesByRole(this._attendees[ZmCalBaseItem.PERSON], ZmCalBaseItem.PERSON, ZmCalItem.ROLE_OPTIONAL, 10);
		var reqAttText = isHtml ? AjxStringUtil.htmlEncode(reqAttString) : reqAttString;
		var optAttText = isHtml ? AjxStringUtil.htmlEncode(optAttString) : optAttString;

		var attendeeTitle = (optAttString == "") ? ZmMsg.invitees : ZmMsg.requiredInvitees ;
		params = [ attendeeTitle + ":", reqAttText, "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";

		params = [ ZmMsg.optionalInvitees + ":", optAttText, "" ];
		if (optAttString != "") {
			buf[i++] = formatter.format(params);
		}

	}
	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmItem.NOTES_SEPARATOR;
	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};

/**
 * Checks whether appointment needs a recurrence info in summary
 *
 * @return	{Boolean}	returns whether appointment needs recurrence summary
 */
ZmAppt.prototype.needsRecurrenceSummary =
function() {
	return this._recurrence.repeatType != "NON" &&
			this.viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
			this.viewMode != ZmCalItem.MODE_DELETE_INSTANCE;
};

/**
 * Returns an object with layout coordinates for this appointment.
 */
ZmAppt.prototype.getLayoutInfo =
function() {
	return this._layout;
};

/**
 * Gets the appointment time summary.
 *
 * @param	{Array}	    buf		    buffer array to fill summary content
 * @param	{Integer}	i		    buffer array index to start filling
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @param	{Boolean}	isEdit		if view mode is edit/edit instance/edit series
 * @return	{String}	the appointment time summary
 */
ZmAppt.prototype.getApptTimeSummary =
function(buf, i, isHtml, isEdit) {
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;
	var orig = this._orig || this;
	var s = this.startDate;
	var e = this.endDate;

	if (this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE) {
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	if (this.needsRecurrenceSummary())
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
		params = [ ZmMsg.startLabel, this._getTextSummaryTime(isEdit, ZmMsg.start, s, s, null, hasTime), "" ];
		buf[i++] = formatter.format(params);

		hasTime = isEdit ? (orig.endDate.getTime() != this.endDate.getTime()) : false;
		params = [ ZmMsg.endLabel, this._getTextSummaryTime(isEdit, ZmMsg.end, e, null, e, hasTime), "" ];
		buf[i++] = formatter.format(params);
	}

	return i;
};

/**
 * Gets the recurrence summary.
 *
 * @param	{Array}	    buf		    buffer array to fill summary content
 * @param	{Integer}	i		    buffer array index to start filling
 * @param	{Boolean}	isHtml		if <code>true</code>, format as html
 * @param	{Boolean}	isEdit		if view mode is edit/edit instance/edit series
 * @return	{String}	the recurrence summary
 */
ZmAppt.prototype.getRecurrenceSummary =
function(buf, i, isHtml, isEdit) {
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;
	var orig = this._orig || this;

	if (this.needsRecurrenceSummary()) {
		var modified = false;
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
	return i;
};

/**
* Sets the attendees (person, location, or equipment) for this appt.
*
* @param {Array}	list	the list of email {String}, {@link AjxEmailAddress}, {@link ZmContact}, or {@link ZmResource}
* @param	{constant}	type		the type
*/
ZmAppt.prototype.setAttendees =
function(list, type) {
	this._attendees[type] = [];
	list = (list instanceof Array) ? list : [list];
	for (var i = 0; i < list.length; i++) {
		var attendee = ZmApptViewHelper.getAttendeeFromItem(list[i], type);
		if (attendee) {
			this._attendees[type].push(attendee);
		}
	}
};

ZmAppt.prototype.setFromMailMessage =
function(message, subject) {
	ZmCalItem.prototype.setFromMailMessage.call(this, message, subject);

	// Only unique names in the attendee list, plus omit our own name
	var account = appCtxt.multiAccounts ? message.getAccount() : null;
	var used = {};
	used[appCtxt.get(ZmSetting.USERNAME, null, account)] = true;
	var addrs = message.getAddresses(AjxEmailAddress.FROM, used, true);
	addrs.addList(message.getAddresses(AjxEmailAddress.CC, used, true));
	addrs.addList(message.getAddresses(AjxEmailAddress.TO, used, true));
	this._attendees[ZmCalBaseItem.PERSON] = addrs.getArray();
};


ZmAppt.prototype.setFromMailMessageInvite =
function(message) {
	var invite = message.invite;
	var viewMode = (!invite.isRecurring()) ? ZmCalItem.MODE_FORWARD : ZmCalItem.MODE_FORWARD_SERIES;

	if (invite.isRecurring() && invite.isException()) {
		viewMode = ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE;
	}

	this.setFromMessage(message, viewMode);
	this.name = message.subject;
	this.location = message.invite.getLocation();
	this.allDayEvent = message.invite.isAllDayEvent();
	if (message.apptId) {
		this.invId = message.apptId;
	}

	this.uid = message.invite.components ? message.invite.components[0].uid : null;

	if (this.isForwardMode) {
		this.forwardInviteMsgId = message.id;
		if (!invite.isOrganizer()) {
			this.name = ZmMsg.fwd + ": " + message.subject;
		}
		this.status = invite.components ? invite.components[0].status : ZmCalendarApp.STATUS_CONF;
	}

	if (this.isProposeTimeMode) {
		this.proposeInviteMsgId = message.id;
		//bug: 49315 - use local timezone while proposing time
		this.convertToLocalTimezone();
		if (!this.ridZ) {
			this.ridZ = message.invite.components ? message.invite.components[0].ridZ : null;
		}
		this.seq = message.invite.getSequenceNo();
	}
};

/**
 * Checks if the appointment is private.
 * 
 * @return	{Boolean}	<code>true</code> if the appointment is private
 */
ZmAppt.prototype.isPrivate =
function() {
	return (this.privacy != "PUB");
};

ZmAppt.prototype.setPrivacy =
function(privacy) {
	this.privacy = privacy;
};

// Private / Protected methods

ZmAppt.prototype._setExtrasFromMessage =
function(message) {
    ZmCalItem.prototype._setExtrasFromMessage.apply(this, arguments);

	this.freeBusy = message.invite.getFreeBusy();
	this.privacy = message.invite.getPrivacy();

	var ptstReplies = {};
	this._replies = message.invite.getReplies();
	if (this._replies) {
		for (var i = 0; i < this._replies.length; i++) {
			var name = this._replies[i].at;
			var ptst = this._replies[i].ptst;
			if (name && ptst) {
				ptstReplies[name] = ptst;
			}
		}
	}

	// parse out attendees for this invite
	this._attendees[ZmCalBaseItem.PERSON] = [];
	this.origAttendees = [];
	var rsvp;
	var attendees = message.invite.getAttendees();
	if (attendees) {
		var ac = window.parentAppCtxt || window.appCtxt;
		for (var i = 0; i < attendees.length; i++) {
			var att = attendees[i];
			var addr = att.a;
			var name = att.d;
			var email = new AjxEmailAddress(addr, null, name, null, att.isGroup, att.isGroup && att.exp);
			ac.setIsExpandableDL(att.a, email.canExpand);
            if (att.rsvp) {
				rsvp = true;
			}
			var type = att.isGroup ? ZmCalBaseItem.GROUP : ZmCalBaseItem.PERSON;
			var attendee = ZmApptViewHelper.getAttendeeFromItem(email, type);
			if (attendee) {
				attendee.setParticipantStatus(ptstReplies[addr] || att.ptst);
				attendee.setParticipantRole(att.role || ZmCalItem.ROLE_REQUIRED);
				this._attendees[ZmCalBaseItem.PERSON].push(attendee);
				this.origAttendees.push(attendee);
			}
		}
	}

	// location/equpiment are known as resources now
	this._attendees[ZmCalBaseItem.LOCATION] = [];
	this.origLocations = [];
	this._ptstLocationMap = {};

	this._attendees[ZmCalBaseItem.EQUIPMENT] = [];
	this.origEquipment = [];

	var resources = message.invite.getResources();	// returns all the invite's resources
	if (resources) {
		for (var i = 0; i < resources.length; i++) {
			var addr = resources[i].a;
			var resourceName = resources[i].d;
			var ptst = resources[i].ptst;
			if (resourceName && ptst && (this._ptstLocationMap[resourceName] != null)) {
				this._ptstLocationMap[resourceName].setParticipantStatus(ptstReplies[addr] || ptst);
			}
			if (resources[i].rsvp) {
				rsvp = true;
			}
			// if multiple resources are present (i.e. aliases) select first one
			var resourceEmail = AjxEmailAddress.split(resources[i].a)[0];

			var location = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.LOCATION, false, false, true);
			if (location || this.isLocationResource(resourceEmail, resources[i].d)) {
                if(!location) location = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.LOCATION);
                if(!location) continue;
                if(resources[i].d) location.setAttr(ZmResource.F_locationName, resources[i].d);

                location.setParticipantStatus(ptstReplies[resourceEmail] || ptst);
				this._attendees[ZmCalBaseItem.LOCATION].push(location);
				this.origLocations.push(location);
			} else {
				var equipment = ZmApptViewHelper.getAttendeeFromItem(resourceEmail, ZmCalBaseItem.EQUIPMENT);
				if (equipment) {
					equipment.setParticipantStatus(ptstReplies[resourceEmail] || ptst);
					this._attendees[ZmCalBaseItem.EQUIPMENT].push(equipment);
					this.origEquipment.push(equipment);
				}
			}
		}
	}

	this.rsvp = rsvp;
	if (message.invite.hasOtherAttendees()) {
		if (this._orig) {
			this._orig.setRsvp(rsvp);
		}
	}

    // bug 53414: For a personal appt. consider inviteNeverSent=true always.
    // Wish this was handled by server.
    if(!this.isDraft && !this.hasAttendees()){
        this.inviteNeverSent = true;
    }

    if (!this.status) {
        this.status = message.invite.getStatus();
    }

    if (!this.transparency) {
        this.transparency = message.invite.getTransparency();
    }
};

ZmAppt.prototype.isLocationResource =
function(resourceEmail, displayName) {
	var locationStr = this.location;
    var items = AjxEmailAddress.split(locationStr);

    for (var i = 0; i < items.length; i++) {

        var item = AjxStringUtil.trim(items[i]);
        if (!item) { continue; }

        if(displayName == item) return true;

        var contact = AjxEmailAddress.parse(item);
        if (!contact) { continue; }

        var name = contact.getName() || contact.getDispName();

        if(resourceEmail == contact.getAddress() || displayName == name) return true;
    }

    return false;
};

ZmAppt.prototype._getTextSummaryTime =
function(isEdit, fieldstr, extDate, start, end, hasTime) {
	var showingTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE);

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
		if (start) {
			buf[i++] = formatter.format(start);
		}
		if (start && end) {
			buf[i++] = " - ";
		}
		if (end) {
			buf[i++] = formatter.format(end);
		}
		//if (showingTimezone) { Commented for bug 13897
			buf[i++] = " ";
			buf[i++] = AjxTimezone.getLongName(AjxTimezone.getClientId(this.timezone));
		//}
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

ZmAppt.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.privacy = this._getAttr(calItemNode, instNode, "class");
	this.transparency = this._getAttr(calItemNode, instNode, "transp");
	this.otherAttendees = this._getAttr(calItemNode, instNode, "otherAtt");
	this.location = this._getAttr(calItemNode, instNode, "loc");
    this.isDraft = this._getAttr(calItemNode, instNode, "draft");
    this.inviteNeverSent = this._getAttr(calItemNode, instNode, "neverSent") || false;
    this.hasEx = this._getAttr(calItemNode, instNode, "hasEx") || false;
};

ZmAppt.prototype._getRequestNameForMode =
function(mode, isException) {
	switch (mode) {
		case ZmCalItem.MODE_NEW:
		case ZmCalItem.MODE_NEW_FROM_QUICKADD:
		case ZmAppt.MODE_DRAG_OR_SASH:
			return "CreateAppointmentRequest";

		case ZmCalItem.MODE_EDIT_SINGLE_INSTANCE:
			return !isException
				? "CreateAppointmentExceptionRequest"
				: "ModifyAppointmentRequest";

		case ZmCalItem.MODE_EDIT:
		case ZmCalItem.MODE_EDIT_SERIES:
			return "ModifyAppointmentRequest";

		case ZmCalItem.MODE_DELETE:
		case ZmCalItem.MODE_DELETE_SERIES:
		case ZmCalItem.MODE_DELETE_INSTANCE:
			return "CancelAppointmentRequest";
			
		case ZmCalItem.MODE_PURGE:
			return "ItemActionRequest";
			
		case ZmCalItem.MODE_FORWARD:
		case ZmCalItem.MODE_FORWARD_SERIES:
		case ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE:
			return "ForwardAppointmentRequest";

		case ZmCalItem.MODE_FORWARD_INVITE:
			return "ForwardAppointmentInviteRequest";

		case ZmCalItem.MODE_GET:
			return "GetAppointmentRequest";

		case ZmCalItem.MODE_PROPOSE_TIME:
			return "CounterAppointmentRequest";
	}

	return null;
};

ZmAppt.prototype._addExtrasToRequest =
function(request, comp) {
	ZmCalItem.prototype._addExtrasToRequest.call(this, request, comp);

    comp.fb = this.freeBusy;
    comp['class'] = this.privacy; //using ['class'] to avoid build error as class is reserved word
    comp.transp = this.transparency;
    //Add Draft flag
    var draftFlag = false;
    if(!this.isSend && this.hasAttendees()){
        draftFlag = this.isDraft || this.makeDraft;
    }
    comp.draft = draftFlag ? 1 : 0;

    if(!this.isSend && this.hasAttendees()){
        request.echo = "1";
    }
};

ZmAppt.prototype.setRsvp =
function(rsvp) {
   this.rsvp = rsvp;
};

ZmAppt.prototype.shouldRsvp =
function() {
	return this.rsvp;
};

ZmAppt.prototype.updateParticipantStatus =
function() {
	if (this._orig) {
		return this._orig.updateParticipantStatus();
	}

	var ptstHashMap = {};
	var personAttendees = this._attendees[ZmCalBaseItem.PERSON];
	for (var i = 0; i < personAttendees.length; i++) {
		var attendee = personAttendees[i];
		var ptst = attendee.getParticipantStatus() || "NE";
		if (!ptstHashMap[ptst]) {
			ptstHashMap[ptst] = [];
		}
		ptstHashMap[ptst].push(attendee.getAttendeeText(null, true));
	}
	this.ptstHashMap = ptstHashMap;
};

ZmAppt.prototype.addAttendeesToChckConflictsRequest =
function(request) {
    var type,
        usr,
        i,
        attendee,
        address;
	for (type in this._attendees) {
        //consider only location & equipments for conflict check
        if (type == ZmCalBaseItem.PERSON) {
            continue;
        }

		if (this._attendees[type] && this._attendees[type].length) {
            usr = request.usr = [];

            for (i = 0; i < this._attendees[type].length; i++) {
				//this._addAttendeeToSoap(soapDoc, inv, m, notifyList, this._attendees[type][i], type);
				attendee = this._attendees[type][i];
				address = null;
				if (attendee._inviteAddress) {
					address = attendee._inviteAddress;
					delete attendee._inviteAddress;
				} else {
					address = attendee.getEmail();
				}
				if (!address) continue;

				if (address instanceof Array) {
					address = address[0];
				}
				usr.push({
                    name : address
                });
			}
		}
	}
};

ZmAppt.prototype.send =
function(attachmentId, callback, errorCallback, notifyList){
    this._mode = ZmAppt.ACTION_SEND;
    this.isSend = true;
    ZmCalItem.prototype.save.call(this, attachmentId, callback, errorCallback, notifyList);
};

ZmAppt.prototype.save =
function(attachmentId, callback, errorCallback, notifyList, makeDraft){
    this._mode = ZmAppt.ACTION_SAVE;
    this.isSend = false;
    this.makeDraft = AjxUtil.isUndefined(makeDraft) ? this.hasAttendees() : makeDraft;
    ZmCalItem.prototype.save.call(this, attachmentId, callback, errorCallback, notifyList);
};

ZmAppt.prototype._doCancel =
function(mode, callback, msg, batchCmd, result){
    this._mode = ZmAppt.ACTION_SEND;
    this.isSend = true;
    ZmCalItem.prototype._doCancel.call(this, mode, callback, msg, batchCmd, result);
};

ZmAppt.prototype._sendCancelMsg =
function(callback){
    this.send(null, callback);  
};

ZmAppt.prototype._addAttendeesToRequest =
function(inv, m, notifyList, onBehalfOf, request) {
    var dispNamesNotifyList = this._dispNamesNotifyList = {};
	for (var type in this._attendees) {
		if (this._attendees[type] && this._attendees[type].length) {
			for (var i = 0; i < this._attendees[type].length; i++) {
				this._addAttendeeToRequest(inv, m, notifyList, this._attendees[type][i], type, request);
			}
		}
	}

	// if we have a separate list of email addresses to notify, do it here
	if (this._sendNotificationMail && this.isOrganizer() && m && notifyList && this.isSend) {
		for (var i = 0; i < notifyList.length; i++) {
			var e,
                address = notifyList[i],
                dispName = dispNamesNotifyList[address];

            e = {
                a : address,
                t : AjxEmailAddress.toSoapType[AjxEmailAddress.TO]
            };
            if (dispName) {
                e.p = dispName;
            }
            m.e.push(e);
		}
	}

	if (this.isOrganizer()) {
		// call base class LAST
		ZmCalItem.prototype._addAttendeesToRequest.call(this, inv, m, notifyList, onBehalfOf);
	}
    delete this._dispNamesNotifyList;
};

ZmAppt.prototype._addAttendeeToRequest =
function(inv, m, notifyList, attendee, type, request) {
	var address;
	if (attendee._inviteAddress) {
		address = attendee._inviteAddress;
		delete attendee._inviteAddress;
	} else {
		address = attendee.getLookupEmail() || attendee.getEmail();
	}
	if (!address) return;

	var dispName = attendee.getFullName();
	if (inv) {
		var at = {};
		// for now make attendees optional, until UI has a way of setting this
		var role = ZmCalItem.ROLE_NON_PARTICIPANT;
		if (type == ZmCalBaseItem.PERSON) {
			role = attendee.getParticipantRole() ? attendee.getParticipantRole() : ZmCalItem.ROLE_REQUIRED;
		}
		at.role = role;
		var ptst = attendee.getParticipantStatus();
		if (!ptst || type === ZmCalBaseItem.PERSON && this.dndUpdate) {  //Bug 56639 - special case for drag-n-drop since the ptst was not updated correctly as we didn't have the informations about attendees and changes.
			ptst = ZmCalBaseItem.PSTATUS_NEEDS_ACTION
		}
		if (notifyList) {
			var attendeeFound = false;
			for (var i = 0; i < notifyList.length; i++) {
				if (address == notifyList[i]) {
					attendeeFound = true;
					break;
				}
			}
			ptst = attendeeFound
				? ZmCalBaseItem.PSTATUS_NEEDS_ACTION
				: (attendee.getParticipantStatus() || ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
            if(attendeeFound && dispName) {
                // If attendees is found in notify list and has display name,
                // add it to object for future reference
                this._dispNamesNotifyList[address] = dispName;
            }
		}
		at.ptst = ptst;

		var rsvpVal = this.rsvp ? "1" : "0";
		if (type != ZmCalBaseItem.PERSON) {
			at.cutype = ZmCalendarApp.CUTYPE_RESOURCE;
			if(this.isOrganizer()) {
				rsvpVal = "1";
			}
		}
		if (this._cancelFutureInstances) {
			rsvpVal = "0";
		}
		at.rsvp = rsvpVal;

		if (address instanceof Array) {
			address = address[0];
		}
		at.a = address;

		if (dispName) {
			at.d = dispName;
		}
        inv.at.push(at);
	}

	// set email to notify if notifyList not provided
	if (this._sendNotificationMail && this.isOrganizer() && m && !notifyList && !this.__newFolderId && this.isSend) {
        var e = {};
        e.a = address;
		if (dispName) {
            e.p = dispName;
		}
        e.t = AjxEmailAddress.toSoapType[AjxEmailAddress.TO];
        m.e.push(e);
	}
};

ZmAppt.prototype.replaceAttendee =
function(oldAttendee,newAttendee){
   var attendees = this._attendees[ZmCalBaseItem.PERSON];
   if(attendees && attendees.length){
    for(var a=0;a<attendees.length;a++){
        if(attendees[a].getEmail()==oldAttendee){
            attendees[a]=this._createAttendeeFromMail(newAttendee);
            break;
        }
    }
   }
   this._attendees[ZmCalBaseItem.PERSON]=attendees;
}

ZmAppt.prototype._createAttendeeFromMail=
function(mailId){
    var attendee=new ZmContact(null);
    attendee.initFromEmail(mailId);
    return attendee;
}

ZmAppt.prototype._getInviteFromError =
function(result) {
	return (result._data.GetAppointmentResponse.appt[0].inv[0]);
};


ZmAppt.prototype.forwardInvite =
function(callback, errorCallback, mode) {
    var jsonObj = {},
        requestName = this._getRequestNameForMode(ZmCalItem.MODE_FORWARD_INVITE, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        m = request.m = {},
        accountName = this.getRemoteFolderOwner(),
        mailFromAddress = this.getMailFromAddress(),
        e = m.e = [],
        addrs = this._fwdAddrs,
        attendee,
        address,
        name,
        i;

	if (this.forwardInviteMsgId) {
        request.id = this.forwardInviteMsgId;
	}

	m.su = this.name;
	this.isForwardMode = true;
	this._addNotesToRequest(m);

	if (this.isOrganizer() && !accountName && mailFromAddress) {
        e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	}

	for (i = 0; i < addrs.length; i++) {
		attendee = addrs[i];
        name = "";

		if (attendee._inviteAddress) {
			address = attendee._inviteAddress;
			delete attendee._inviteAddress;
		}
        else if (attendee.isAjxEmailAddress) {
			address = attendee.address;
			name = attendee.dispName || attendee.name
		}
        else if (attendee instanceof ZmContact) {
			address = attendee.getEmail();
			name = attendee.getFullName();
		}
		if (!address) {
            continue;
        }
		if (address instanceof Array) {
			address = address[0];
		}

		this._addAddressToRequest(m, address, AjxEmailAddress.toSoapType[AjxEmailAddress.TO], name);
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype.setForwardMode =
function(forwardMode) {
	this.isForwardMode = forwardMode;
};

ZmAppt.prototype.setProposeTimeMode =
function(isProposeTimeMode) {
	this.isProposeTimeMode = isProposeTimeMode;
};

ZmAppt.prototype.sendCounterAppointmentRequest =
function(callback, errorCallback, viewMode) {
	var mode = ZmCalItem.MODE_PROPOSE_TIME,
        jsonObj = {},
        requestName = this._getRequestNameForMode(mode, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        m = request.m = {},
        e = m.e = [],
        inv = m.inv = {},
        comps = inv.comp = [],
        comp = inv.comp[0] = {},
        calendar = this.getFolder(),
    	acct = calendar.getAccount(),
    	accountName = this.getRemoteFolderOwner(),
    	localAcctName = this.getFolder().getAccount().name,
        cif = this._currentlyLoaded && this._currentlyLoaded.cif,
    	isOnBehalfOf = accountName && localAcctName && localAcctName != accountName,
    	mailFromAddress = this.getMailFromAddress(),
        orgEmail,
        orgAddress,
        exceptId,
        me,
        organizer,
        user,
        org,
        orgName;

    this._addInviteAndCompNum(request);
    m.su = ZmMsg.subjectNewTime + ": " + this.name;
    if (this.isOrganizer() && !accountName && mailFromAddress) {
		e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	} else if (isOnBehalfOf || cif) {
        e.push({
            a : isOnBehalfOf ? accountName: cif,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
        e.push({
            a : localAcctName,
            t : AjxEmailAddress.toSoapType[AjxEmailAddress.SENDER]
        });
    }

	if(this.organizer) {
		orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
		orgAddress = orgEmail.getAddress();
		e.push({
            a : orgAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.TO]
        });
	}
    //Do not add exceptId if propose new time for series
	if (this.ridZ && viewMode != ZmCalItem.MODE_EDIT_SERIES) {
		exceptId = comp.exceptId = {};
		exceptId.d = this.ridZ;
	}

	// subject/location
	comp.name = this.name;
	if (this.uid != null && this.uid != -1) {
		comp.uid = this.uid;
	}

	if (this.seq) {
		comp.seq = this.seq;
	}

	this._addDateTimeToRequest(request, comp);
	this._addNotesToRequest(m);

	// set organizer - but not for local account
	if (!(appCtxt.isOffline && acct.isMain)) {
		me = (appCtxt.multiAccounts) ? acct.getEmail() : appCtxt.get(ZmSetting.USERNAME);
		user = mailFromAddress || me;
		organizer = this.organizer || user;
		org = comp.or = {};
		org.a = organizer;
		if (calendar.isRemote()) {
			org.sentBy = user; // if on-behalf of, set sentBy
		}
		orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer);
		orgName = orgEmail.getName();
		if (orgName) {
            org.d = orgName;
        }
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype.forward =
function(callback, errorCallback) {
	var mode = ZmCalItem.MODE_FORWARD,
	    needsExceptionId = this.isException;

	if (this.viewMode == ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
		mode = ZmCalItem.MODE_FORWARD_SINGLE_INSTANCE;
		if (!this.isException) {
			needsExceptionId = true;
		}
	} else if(this.viewMode == ZmCalItem.MODE_EDIT_SERIES) {
		mode = ZmCalItem.MODE_FORWARD_SERIES;
	}

	if (this.forwardInviteMsgId) {
		this.forwardInvite(callback, errorCallback, mode);
		return;
	}

    var jsonObj = {},
        requestName = this._getRequestNameForMode(mode, this.isException),
        request = jsonObj[requestName] = {
            _jsns : "urn:zimbraMail"
        },
        exceptId,
        message,
        invite,
        exceptIdInfo,
        allDay,
        sd,
        tz,
        timezone,
        m = request.m = {},
        accountName = this.getRemoteFolderOwner(),
    	mailFromAddress = this.getMailFromAddress(),
        e = m.e = [],
        addrs = this._fwdAddrs,
        attendee,
        address,
        name,
        i;

	if (this.uid != null && this.uid != -1) {
        request.id = this.id;
	}

	if (needsExceptionId) {
		exceptId = request.exceptId = {};
		if (this.isException) {
			message = this.message ? this.message : null;
			invite = (message && message.invite) ? message.invite : null;
			exceptIdInfo = invite.getExceptId();
			exceptId.d = exceptIdInfo.d;
			if (exceptIdInfo.tz) {
				exceptId.tz = exceptIdInfo.tz;
			}
		} else {
			allDay = this._orig ? this._orig.allDayEvent : this.allDayEvent;
			if (allDay != "1") {
				sd = AjxDateUtil.getServerDateTime(this.getOrigStartDate(), this.startsInUTC);
				// bug fix #4697 (part 2)
				timezone = this.getOrigTimezone();
				if (!this.startsInUTC && timezone) {
					exceptId.tz = timezone;
				}
				exceptId.d = sd;
			} else {
				sd = AjxDateUtil.getServerDate(this.getOrigStartDate());
				exceptId.d = sd;
			}
		}
	}

	if (this.timezone) {
		var clientId = AjxTimezone.getClientId(this.timezone);
		ZmTimezone.set(request, clientId, null, true);
		tz = this.timezone;
	}

    m.su = this.name;
    this.isForwardMode = true;
	this._addNotesToRequest(m);

	if (this.isOrganizer() && !accountName && mailFromAddress) {
		e.push({
            a : mailFromAddress,
		    t : AjxEmailAddress.toSoapType[AjxEmailAddress.FROM]
        });
	}

	for (i = 0; i < addrs.length; i++) {
		attendee = addrs[i];
		if (!attendee) { continue; }

        name = "";
		if (attendee._inviteAddress) {
			address = attendee._inviteAddress;
			delete attendee._inviteAddress;
		} else if(attendee.isAjxEmailAddress){
			address = attendee.address;
			name = attendee.dispName || attendee.name
		} else if(attendee instanceof ZmContact){
			address = attendee.getEmail();
			name = attendee.getFullName();
		}
		if (!address) { continue; }
		if (address instanceof Array) {
			address = address[0];
		}
		this._addAddressToRequest(m, address, AjxEmailAddress.toSoapType[AjxEmailAddress.TO], name);
	}

	this._sendRequest(null, accountName, callback, errorCallback, jsonObj, requestName);
};

ZmAppt.prototype._addAddressToRequest =
function(m, addr, type, name) {
	var e = {};
	e.a = addr;
	e.t = type;
	if (name) {
        e.p = name;
	}
    m.e.push(e);
};

ZmAppt.prototype.setProposedInvite =
function(invite) {
	this.proposedInvite = invite;
};

ZmAppt.prototype.getRecurrenceFromInvite =
function(invite) {
	return (invite && invite.comp && invite.comp[0]) ? invite.comp[0].recur : null;
};

ZmAppt.prototype.setInvIdFromProposedInvite =
function(invites, proposedInvite) {
	var proposalRidZ = proposedInvite.getRecurrenceId();

	if (proposedInvite.components[0].ridZ) {
		// search all the invites for an appointment
		for (var i=0; i < invites.length; i++) {
			var inv = invites[i];
			if (inv.comp[0].ridZ  == proposalRidZ) {
				this.invId = this.id + "-" + inv.id;
				break;
			}
		}

		// if new time is proposed for creating an exceptional instance - no
		// matching invites will be found
		if (!this.invId) {
			this.invId = this.id + "-" + invites[0].id;
			this.ridZ = proposalRidZ;
			var invite = ZmInvite.createFromDom(invites);
			if (invite.isRecurring()) {
				this.isException = true;
				this.recurring = this.getRecurrenceFromInvite(invites[0]);
				this._origStartDate = proposedInvite.getStartDateFromExceptId();
			}
		}
	} else {
		this.invId = this.id + "-" + invites[0].id;
	}
};

/**
 * clears the recurrence.
 */
ZmCalItem.prototype.clearRecurrence =
function() {
    this._recurrence = new ZmRecurrence(this);
    this.recurring = false;
};

ZmAppt.loadById = function(id, callback, errorCallback) {
    return ZmAppt.__load(id, null, callback, errorCallback);
};
ZmAppt.loadByUid = function(uid, callback, errorCallback) {
    return ZmAppt.__load(null, uid, callback, errorCallback);
};

ZmAppt.__load = function(id, uid, callback, errorCallback) {
    var req = { _jsns: "urn:zimbraMail", includeContent: 1 };
    if (id) req.id = id;
    else if (uid) req.uid = uid;
    var params = {
        jsonObj: { GetAppointmentRequest: req },
        accountName: appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null,
        asyncMode: Boolean(callback),
        callback: new AjxCallback(ZmAppt.__loadResponse, [callback]),
        errorCallback: errorCallback
    };
    var resp = appCtxt.getAppController().sendRequest(params);
    if (!callback) {
        return ZmAppt.__loadResponse(null, resp);
    }
};
ZmAppt.__loadResponse = function(callback, resp) {
    var data = resp && resp._data;
    var response = data && data.GetAppointmentResponse;
    var apptNode = response && response.appt;
    apptNode = apptNode && apptNode[0];
    if (!apptNode) return null;

    var appt = new ZmAppt();
    appt._loadFromDom(apptNode, {});
    if (apptNode.inv) {
        // HACK: There doesn't seem to be any direct way to load an appt
        // HACK: by id/uid. So I initialize the appt object with the node
        // HACK: in the response and then fake a message with the invite
        // HACK: data to initialize the rest of it.
        var message = {
            invite: new ZmInvite.createFromDom(apptNode.inv),
            getBodyPart: function(mimeType) {
                return (mimeType == ZmMimeTable.TEXT_HTML ? apptNode.descHtml : apptNode.desc) || "";
            }
        }
        appt.setFromMessage(message);
    }

    if (callback) {
        callback.run(appt);
    }
    return appt;
};

/*
 * Checks whether there is any Daylight Savings change happens on appointment end date.
 */
ZmAppt.prototype.checkDSTChangeOnEndDate = function(){
    var endDate = this.endDate;
    var eOffset = endDate.getTimezoneOffset();
    var prevDay = new Date(endDate);
    prevDay.setTime(endDate.getTime() - AjxDateUtil.MSEC_PER_DAY);
    var prevDayOffset = prevDay.getTimezoneOffset();
    var diffOffset = prevDayOffset - eOffset;
    return diffOffset;
};
