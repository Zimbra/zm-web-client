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
ZmAppt = function(list, noinit) {

	ZmCalItem.call(this, ZmItem.APPT, list);
	if (noinit) return;

	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.privacy = "PUB";														// Privacy class (PUB|PRI|CON) (public/private/confidential)
	this.transparency = "O";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + (30*60*1000));
	this.otherAttendees = false;

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

ZmAppt.MODE_DRAG_OR_SASH		= ++ZmCalItem.MODE_LAST;
ZmAppt.ATTENDEES_SEPARATOR		= "; ";

ZmAppt._pstatusString = {
	NE: ZmMsg._new,
	TE: ZmMsg.tentative,
	AC: ZmMsg.accepted,
	DE: ZmMsg.declined,
	DG: ZmMsg.delegated
};


// Public methods

ZmAppt.prototype.toString =
function() {
	return "ZmAppt";
};


// Getters
ZmAppt.prototype.getAttendees			= function() { return this._attendees[ZmCalItem.PERSON]; };
ZmAppt.prototype.getAttendeesText		= function() { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.PERSON], ZmCalItem.PERSON); };
ZmAppt.prototype.getEquipment			= function() { return this._attendees[ZmCalItem.EQUIPMENT]; };
ZmAppt.prototype.getLocations			= function() { return this._attendees[ZmCalItem.LOCATION]; };
ZmAppt.prototype.getOrigAttendees 		= function() { return this._origAttendees; };
ZmAppt.prototype.getOrigLocations 		= function() { return this._origLocations; };
ZmAppt.prototype.getOrigEquipment 		= function() { return this._origEquipment; };
ZmAppt.prototype.getParticipantStatusStr= function() { return ZmAppt._pstatusString[this.ptst]; };

ZmAppt.prototype.getEquipmentText		= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.EQUIPMENT], ZmCalItem.EQUIPMENT, inclDispName); };
ZmAppt.prototype.getLocationsText		= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalItem.LOCATION], ZmCalItem.LOCATION, inclDispName); };
ZmAppt.prototype.getLocation			= function(inclDispName) { return this.getLocationsText(inclDispName); };
ZmAppt.prototype.getOrigLocationsText	= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._origLocations, ZmCalItem.LOCATION, inclDispName); };
ZmAppt.prototype.getOrigLocation		= function(inclDispName) { return this.getOrigLocationsText(inclDispName); };
ZmAppt.prototype.getOrigEquipmentText	= function(inclDispName) { return ZmApptViewHelper.getAttendeesString(this._origEquipment, ZmCalItem.EQUIPMENT, inclDispName); };

ZmAppt.prototype.hasOtherAttendees 		= function() { return this.otherAttendees; };
ZmAppt.prototype.hasAttendees =
function() {
	return ((this._attendees[ZmCalItem.PERSON] && this._attendees[ZmCalItem.PERSON].length) ||
			(this._attendees[ZmCalItem.LOCATION] && this._attendees[ZmCalItem.LOCATION].length) ||
			(this._attendees[ZmCalItem.EQUIPMENT] && this._attendees[ZmCalItem.EQUIPMENT].length));
};
ZmAppt.prototype.hasPersonAttendees =
function() {
	return ((this._attendees[ZmCalItem.PERSON] && this._attendees[ZmCalItem.PERSON].length));
};

// Public methods

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

ZmAppt.createFromDom =
function(apptNode, args, instNode) {
	var appt = new ZmAppt(args.list);
	appt._loadFromDom(apptNode, (instNode || {}));

	return appt;
};

ZmAppt.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmAppt.prototype.getToolTip =
function(controller, force) {
	if (this._orig)
		return this._orig.getToolTip(controller, force);

	if (!this._toolTip || force) {
        var organizer = this.getOrganizer();
        var sentBy = this.getSentBy();
        var userName = appCtxt.get(ZmSetting.USERNAME);
        if (sentBy || (organizer && organizer != userName)) {
            if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
                var contactsApp = appCtxt.getAppController().getApp(ZmApp.CONTACTS);
                // NOTE: ZmContactsApp#getContactList expects to be called in an
                //       asynchronous way but we need the data right away. Instead
                //       of reworking this code or the getContactList method to be
                //       able to work synchronously, I'm just going to use the
                //       raw email address in the case where the contact list has
                //       not been loaded, yet. By the next time a tooltip is
                //       created, it will probably be available so it's not a big
                //       deal.
                var contactList = contactsApp.getContactList();

                var addrs = [ organizer, sentBy ];
                for (var i = 0; i < addrs.length; i++) {
                    var addr = addrs[i];
                    if (!addr) continue;
                    
                    if (addr == userName) {
                        addrs[i] = appCtxt.get(ZmSetting.DISPLAY_NAME);
                        continue;
                    }
                    var contact = contactList && contactList.getContactByEmail(addr);
                    if (contact) {
                        addrs[i] = contact.getFullName();
                    }
                }

                organizer = addrs[0];
                sentBy = addrs[1];
            }
        }
        else {
            organizer = null;
            sentBy = null;
        }
        var params = {
            appt: this,
			cal: (this.folderId != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
            organizer: organizer,
            sentBy: sentBy,
            when: this.getDurationText(false, false),
			location: this.getLocation(true),
            width: "250",
            showAttendeeStatus: (this._ptstHashMap != null)
        };

		if(this._ptstHashMap != null){
			var ptstStatus = {};
			ptstStatus[ZmMsg.ptstAccept] = this.getAttendeeToolTipString(this._ptstHashMap[ZmCalItem.PSTATUS_ACCEPT]);
			ptstStatus[ZmMsg.ptstDeclined] = this.getAttendeeToolTipString(this._ptstHashMap[ZmCalItem.PSTATUS_DECLINED]);
			ptstStatus[ZmMsg.ptstTentative] = this.getAttendeeToolTipString(this._ptstHashMap[ZmCalItem.PSTATUS_TENTATIVE]);
			ptstStatus[ZmMsg.ptstNeedsAction] = this.getAttendeeToolTipString(this._ptstHashMap[ZmCalItem.PSTATUS_NEEDS_ACTION]);
			params.ptstStatus = ptstStatus;
		}

		this._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
		
	}

	return this._toolTip;
};

ZmAppt.prototype.getAttendeeToolTipString =
function(val) {
	var str = null;
	var maxLimit = 10;
	if(val && val.length>maxLimit){
		var len = val.length;
		var newParts = val.splice(0,maxLimit);
		str = newParts.join(",") + " ("+ (len-maxLimit) +" more)" ;
	}else if(val){
		str = val.join(",");	
	}
	return str;	
}

ZmAppt.prototype.setAttendeeToolTipData =
function (ptstHashMap) {
	this._ptstHashMap = ptstHashMap;
};

ZmAppt.prototype.getAttendeeToolTipData =
function () {
	return this._ptstHashMap;
};

ZmAppt.prototype.getSummary =
function(isHtml) {
	var orig = this._orig || this;

	var isEdit = (this.viewMode == ZmCalItem.MODE_EDIT ||
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
	var params = [ ZmMsg.subjectLabel, this.name, modified ? ZmMsg.apptModifiedStamp : "" ];
	buf[i++] = formatter.format(params);
	buf[i++] = "\n";
	
	var organizer = this.organizer ? this.organizer : appCtxt.get(ZmSetting.USERNAME);
	var orgEmail = ZmApptViewHelper.getOrganizerEmail(this.organizer).toString();
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
		params = [ ZmMsg.locationLabel, location, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}
	
	var equipment = this.getEquipmentText(true);
	if (equipment) {
		modified = isEdit && (this.getOrigEquipmentText(true) != equipment);
		params = [ ZmMsg.resourcesLabel, equipment, modified ? ZmMsg.apptModifiedStamp : "" ];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var s = this.startDate;
	var e = this.endDate;
	if (this.viewMode == ZmCalItem.MODE_DELETE_INSTANCE) {
		s = this.getUniqueStartDate();
		e = this.getUniqueEndDate();
	}

	var recurrence = this._recurrence.repeatType != "NON" &&
					 this.viewMode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE &&
					 this.viewMode != ZmCalItem.MODE_DELETE_INSTANCE;
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
		params = [ ZmMsg.startLabel, this._getTextSummaryTime(isEdit, ZmMsg.start, s, s, null, hasTime), "" ];
		buf[i++] = formatter.format(params);

		hasTime = isEdit ? (orig.endDate.getTime() != this.endDate.getTime()) : false;
		params = [ ZmMsg.endLabel, this._getTextSummaryTime(isEdit, ZmMsg.end, e, null, e, hasTime), "" ];
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
	buf[i++] = ZmItem.NOTES_SEPARATOR;
	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};


/**
* Sets the attendees (person, location, or equipment) for this appt.
*
* @param list	[array]		list of email string, AjxEmailAddress, ZmContact, or ZmResource
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
	var used = {};
	used[appCtxt.get(ZmSetting.USERNAME)] = true;
	var addrs = message.getAddresses(AjxEmailAddress.FROM, used, true);
	addrs.addList(message.getAddresses(AjxEmailAddress.CC, used, true));
	addrs.addList(message.getAddresses(AjxEmailAddress.TO, used, true));
	this._attendees[ZmCalItem.PERSON] = addrs.getArray();
};

ZmAppt.prototype.isPrivate =
function() {
	return (this.privacy != "PUB");
};



// Private / Protected methods

ZmAppt.prototype._setExtrasFromMessage =
function(message) {
	this.freeBusy = message.invite.getFreeBusy();
	this.privacy = message.invite.getPrivacy();

	// parse out attendees for this invite
	this._attendees[ZmCalItem.PERSON] = [];
	this._origAttendees = [];
	var attendees = message.invite.getAttendees();
	if (attendees) {
		for (var i = 0; i < attendees.length; i++) {
			var addr = attendees[i].url;
			var name = attendees[i].d;
			var email = new AjxEmailAddress(addr, null, name);
			var attendee = ZmApptViewHelper.getAttendeeFromItem(email, ZmCalItem.PERSON);
			if (attendee) {
				attendee.setAttr("participationStatus",attendees[i].ptst);               
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
	var locations = AjxEmailAddress.split(message.invite.getLocation());
	if (locations) {
		for (var i = 0; i < locations.length; i++) {
			var location = ZmApptViewHelper.getAttendeeFromItem(locations[i], ZmCalItem.LOCATION);
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
			var location = ZmApptViewHelper.getAttendeeFromItem(resources[i].url, ZmCalItem.LOCATION, true, true);
			if (location) {
				continue;
			}
			var equipment = ZmApptViewHelper.getAttendeeFromItem(resources[i].url, ZmCalItem.EQUIPMENT);
			if (equipment) {
				this._attendees[ZmCalItem.EQUIPMENT].push(equipment);
				this._origEquipment.push(equipment);
			}
		}
	}

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
		if (start)
			buf[i++] = formatter.format(start);
		if (start && end)
			buf[i++] = " - ";
		if (end)
			buf[i++] = formatter.format(end);

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

ZmAppt.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_CALENDAR;
};

ZmAppt.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.privacy = this._getAttr(calItemNode, instNode, "class");
	this.transparency = this._getAttr(calItemNode, instNode, "transp");
	this.otherAttendees = this._getAttr(calItemNode, instNode, "otherAtt");
	this.setAttendees(this._getAttr(calItemNode, instNode, "loc"), ZmCalItem.LOCATION);
};

ZmAppt.prototype._getSoapForMode =
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

		case ZmCalItem.MODE_GET:
			return "GetAppointmentRequest";
	}

	return null;
};

ZmAppt.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	ZmCalItem.prototype._addExtrasToSoap.call(this, soapDoc, inv, comp);

	comp.setAttribute("fb", this.freeBusy);
	comp.setAttribute("class", this.privacy);
	comp.setAttribute("transp", this.transparency);
};

ZmAppt.prototype._addLocationToSoap =
function(inv) {
	if (this._attendees[ZmCalItem.LOCATION] && this._attendees[ZmCalItem.LOCATION].length) {
		inv.setAttribute("loc", this.getLocation());
	}
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
			e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.TO]);
		}
	}

	// call base class LAST
	ZmCalItem.prototype._addAttendeesToSoap.call(this, soapDoc, inv, m, notifyList, onBehalfOf);
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
		at.setAttribute("role", (type == ZmCalItem.PERSON) ? ZmCalItem.ROLE_REQUIRED : ZmCalItem.ROLE_NON_PARTICIPANT);
		
		var ptst = ZmCalItem.PSTATUS_NEEDS_ACTION;
		if(notifyList){
			var attendeeFound = false;
			for(var i in notifyList) {
				if(address == notifyList[i]) {
					attendeeFound = true;
					break;
				}
			}
			var newptst =  attendee.getAttr("participationStatus") || ZmCalItem.PSTATUS_NEEDS_ACTION;
			ptst = (attendeeFound ? ZmCalItem.PSTATUS_NEEDS_ACTION : newptst);
		}
		at.setAttribute("ptst", ptst);
		
		var cutype = (type == ZmCalItem.PERSON) ? null : ZmCalendarApp.CUTYPE_RESOURCE;
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
		e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.TO]);

		// bug fix #9768 - auto add attendee if not in addrbook
		if (type == ZmCalItem.PERSON &&
			appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
			appCtxt.get(ZmSetting.AUTO_ADD_ADDRESS))
		{
			var clc = appCtxt.getApp(ZmApp.CONTACTS).getContactList();
			if (!clc.getContactByEmail(address))
				e.setAttribute("add", "1");
		}
	}
};

ZmAppt.prototype._getInviteFromError =
function(result) {
	return (result._data.GetAppointmentResponse.appt[0].inv[0]);
};

ZmAppt.prototype._updateParticipantStatus =
function() {
	
	if(this._orig)
		return this._orig._updateParticipantStatus();
	
	var ptstHashMap = {};	
	var attendees = this._attendees;
	var personAttendees = (this._attendees && this._attendees[ZmCalItem.PERSON]) ? this._attendees[ZmCalItem.PERSON] : null;
	if(personAttendees){
		var attendee = null;
		var ptst = null;
		for(var i=0; i<personAttendees.length; i++){
			attendee = personAttendees[i];
			ptst = attendee.getAttr("participationStatus") || "NE";				
			if(!ptstHashMap[ptst]){
				ptstHashMap[ptst] = new Array();
			}
			ptstHashMap[ptst].push(attendee.getAttendeeText(null, true));				
		}
	}
	this.setAttendeeToolTipData(ptstHashMap);
};
		
