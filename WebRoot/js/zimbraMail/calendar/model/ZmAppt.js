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
	if (noinit) { return; }

	this.freeBusy = "B"; 														// Free/Busy status (F|B|T|O) (free/busy/tentative/outofoffice)
	this.privacy = "PUB";														// Privacy class (PUB|PRI|CON) (public/private/confidential)
	this.transparency = "O";
	this.startDate = new Date();
	this.endDate = new Date(this.startDate.getTime() + (30*60*1000));
	this.otherAttendees = false;
    this.rsvp = true;

    // attendees by type
	this._attendees = {};
	this._attendees[ZmCalBaseItem.PERSON]	= [];
	this._attendees[ZmCalBaseItem.LOCATION]	= [];
	this._attendees[ZmCalBaseItem.EQUIPMENT]= [];

	this.origAttendees = null;	// list of ZmContact
	this.origLocations = null;	// list of ZmResource
	this.origEquipment = null;	// list of ZmResource
};

ZmAppt.prototype = new ZmCalItem;
ZmAppt.prototype.constructor = ZmAppt;


// Consts

ZmAppt.MODE_DRAG_OR_SASH		= ++ZmCalItem.MODE_LAST;
ZmAppt.ATTENDEES_SEPARATOR		= "; ";


// Public methods

ZmAppt.prototype.toString =
function() {
	return "ZmAppt";
};

ZmAppt.prototype.getAttendees =
function(type) {
	return this._attendees[type];
};

ZmAppt.prototype.getAttendeesText =
function(type, inclDispName) {
	return ZmApptViewHelper.getAttendeesString(this._attendees[type], type, inclDispName);
};

ZmAppt.prototype.hasAttendeeForType =
function(type) {
	return ((this._attendees[type] && this._attendees[type].length));
};

ZmAppt.prototype.hasAttendees =
function() {
	return this.hasAttendeeForType(ZmCalBaseItem.PERSON) ||
		   this.hasAttendeeForType(ZmCalBaseItem.LOCATION) ||
		   this.hasAttendeeForType(ZmCalBaseItem.EQUIPMENT);
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

	newAppt.origAttendees = AjxUtil.createProxy(appt.origAttendees);
	newAppt.origLocations = AjxUtil.createProxy(appt.origLocations);
	newAppt.origEquipment = AjxUtil.createProxy(appt.origEquipment);
	newAppt._validAttachments = AjxUtil.createProxy(appt._validAttachments);

	if (newAppt._orig == null) {
		newAppt._orig = appt;
	}
	newAppt.type = ZmItem.APPT;
	newAppt.rsvp = appt.rsvp;

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
	if (this._orig) {
		return this._orig.getToolTip(controller, force);
	}

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
			location: this.getLocation(),
			width: "250",
			showAttendeeStatus: (this.ptstHashMap != null)
		};

		if (this.ptstHashMap != null) {
			var ptstStatus = {};
			ptstStatus[ZmMsg.ptstAccept] = this.getAttendeeToolTipString(this.ptstHashMap[ZmCalBaseItem.PSTATUS_ACCEPT]);
			ptstStatus[ZmMsg.ptstDeclined] = this.getAttendeeToolTipString(this.ptstHashMap[ZmCalBaseItem.PSTATUS_DECLINED]);
			ptstStatus[ZmMsg.ptstTentative] = this.getAttendeeToolTipString(this.ptstHashMap[ZmCalBaseItem.PSTATUS_TENTATIVE]);
			ptstStatus[ZmMsg.ptstNeedsAction] = this.getAttendeeToolTipString(this.ptstHashMap[ZmCalBaseItem.PSTATUS_NEEDS_ACTION]);
			params.ptstStatus = ptstStatus;

            var attendees = [];
            if(!this.rsvp) {
                var personAttendees = (this._attendees && this._attendees[ZmCalBaseItem.PERSON])
                        ? this._attendees[ZmCalBaseItem.PERSON] : [];

                for (var i = 0; i < personAttendees.length; i++) {
                    var attendee = personAttendees[i];
                    attendees.push(attendee.getAttendeeText(null, true));
                }
                params.attendeesText = this.getAttendeeToolTipString(attendees);
            }
		}

		this._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
		
	}

	return this._toolTip;
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
}

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

	// bug fix #29249 - check if location *label* has changed
	var locationLabel = this.getLocation();
	var origLocationLabel = orig ? orig.getLocation() : "";
	if (locationLabel != origLocationLabel) {
		params = [ZmMsg.locationLabel, locationLabel, isEdit ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var location = this.getAttendeesText(ZmCalBaseItem.LOCATION, true);
	if (location) {
		var origLocationText = ZmApptViewHelper.getAttendeesString(this.origLocations, ZmCalBaseItem.LOCATION, true);
		modified = (isEdit && (origLocationText != location));
		params = [ZmMsg.resourcesLabel, location, modified ? ZmMsg.apptModifiedStamp : ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var equipment = this.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	if (equipment) {
		var origEquipmentText = ZmApptViewHelper.getAttendeesString(this.origEquipment, ZmCalBaseItem.EQUIPMENT, true);
		modified = (isEdit && (origEquipmentText != equipment));
		params = [ZmMsg.resourcesLabel, equipment, modified ? ZmMsg.apptModifiedStamp : "" ];
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

	if (this._attendees[ZmCalBaseItem.PERSON] && this._attendees[ZmCalBaseItem.PERSON].length) {
		if (isHtml) {
			buf[i++] = "</table>\n<p>\n<table border='0'>";
		}
		buf[i++] = "\n";
		var attString = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.PERSON].slice(0, 10), ZmCalBaseItem.PERSON);
		if (this._attendees[ZmCalBaseItem.PERSON].length > 10) {
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
	this._attendees[ZmCalBaseItem.PERSON] = addrs.getArray();
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
	this._attendees[ZmCalBaseItem.PERSON] = [];
	this.origAttendees = [];
	var attendees = message.invite.getAttendees();
	if (attendees) {
		for (var i = 0; i < attendees.length; i++) {
			var addr = attendees[i].url;
			var name = attendees[i].d;
			var email = new AjxEmailAddress(addr, null, name);
			var attendee = ZmApptViewHelper.getAttendeeFromItem(email, ZmCalBaseItem.PERSON);
			if (attendee) {
				attendee.setAttr("participationStatus", attendees[i].ptst);
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
			var resourceName = resources[i].d;
			var ptst = resources[i].ptst;
			if (resourceName && ptst && (this._ptstLocationMap[resourceName] != null)) {
				this._ptstLocationMap[resourceName].setAttr("participationStatus", ptst);
			}

			// if multiple resources are present (i.e. aliases) select first one
			var resourceURL = AjxEmailAddress.split(resources[i].url)[0];

			var location = ZmApptViewHelper.getAttendeeFromItem(resourceURL, ZmCalBaseItem.LOCATION);
			if (location) {
				location.setAttr("participationStatus", ptst);
				this._attendees[ZmCalBaseItem.LOCATION].push(location);
				this.origLocations.push(location);
			} else {
				var equipment = ZmApptViewHelper.getAttendeeFromItem(resourceURL, ZmCalBaseItem.EQUIPMENT);
				if (equipment) {
					equipment.setAttr("participationStatus", ptst);
					this._attendees[ZmCalBaseItem.EQUIPMENT].push(equipment);
					this.origEquipment.push(equipment);
				}
			}
		}
	}

    this._setAlarmFromMessage(message);

    if(message.invite.hasOtherAttendees()) {
        var attendees = message.invite.getAttendees();
        var rsvp = false;
        for(var i in attendees) {
            if(attendees[i].rsvp) {
                rsvp = true;
                break;
            }
        }
        this.rsvp = rsvp;
        if(this._orig) {
            this._orig.setRsvp(rsvp);
        }
    }
};

ZmAppt.prototype._setAlarmFromMessage =
function(message) {
    this._reminderMinutes = 0;
    var alarm = message.invite.getAlarm();
    if(alarm) {
        for(var i in alarm) {
            if(alarm[i] && (alarm[i].action == "DISPLAY")) {
                this.parseAlarm(alarm[i]);
                break;
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

ZmAppt.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.privacy = this._getAttr(calItemNode, instNode, "class");
	this.transparency = this._getAttr(calItemNode, instNode, "transp");
	this.otherAttendees = this._getAttr(calItemNode, instNode, "otherAtt");
	this.location = this._getAttr(calItemNode, instNode, "loc");
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
	var personAttendees = (this._attendees && this._attendees[ZmCalBaseItem.PERSON])
		? this._attendees[ZmCalBaseItem.PERSON] : [];

	for (var i = 0; i < personAttendees.length; i++) {
		var attendee = personAttendees[i];
		var ptst = attendee.getAttr("participationStatus") || "NE";
		if (!ptstHashMap[ptst]) {
			ptstHashMap[ptst] = [];
		}
		ptstHashMap[ptst].push(attendee.getAttendeeText(null, true));
	}
	this.ptstHashMap = ptstHashMap;
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
	if (this.isOrganizer() && m && notifyList) {
		for (var i = 0; i < notifyList.length; i++) {
			e = soapDoc.set("e", null, m);
			e.setAttribute("a", notifyList[i]);
			e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.TO]);
		}
	}

	if (this.isOrganizer()) {
		// call base class LAST
		ZmCalItem.prototype._addAttendeesToSoap.call(this, soapDoc, inv, m, notifyList, onBehalfOf);
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
		at.setAttribute("role", (type == ZmCalBaseItem.PERSON) ? ZmCalItem.ROLE_REQUIRED : ZmCalItem.ROLE_NON_PARTICIPANT);
		
		var ptst = attendee.getAttr("participationStatus") || ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
		if (notifyList) {
			var attendeeFound = false;
			for (var i in notifyList) {
				if (address == notifyList[i]) {
					attendeeFound = true;
					break;
				}
			}
			ptst = attendeeFound
				? ZmCalBaseItem.PSTATUS_NEEDS_ACTION
				: (attendee.getAttr("participationStatus") || ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
		}
		at.setAttribute("ptst", ptst);
		
		if (type != ZmCalBaseItem.PERSON) {
			at.setAttribute("cutype", ZmCalendarApp.CUTYPE_RESOURCE);
		}
		at.setAttribute("rsvp", this.rsvp ? "1" : "0");

		if (address instanceof Array) {
			address = address[0];
		}
		at.setAttribute("a", address);

		if (dispName) {
			at.setAttribute("d", dispName);
		}
	}

	// set email to notify if notifyList not provided
	if (this.isOrganizer() && m && !notifyList && !this.__newFolderId) {
		e = soapDoc.set("e", null, m);
		e.setAttribute("a", address);
		if (dispName) {
			e.setAttribute("p", dispName);
		}
		e.setAttribute("t", AjxEmailAddress.toSoapType[AjxEmailAddress.TO]);

		// bug fix #9768 - auto add attendee if not in addrbook
		if (type == ZmCalBaseItem.PERSON &&
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
