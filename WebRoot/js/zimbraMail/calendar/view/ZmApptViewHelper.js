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

/**
 * Does nothing.
 * @constructor
 * @class
 * This static class provides utility functions for dealing with appointments
 * and their related forms and views.
 *
 * @author Parag Shah
 * @author Conrad Damon
 */

/**
 * ZmApptViewHelper
 * - Helper methods shared by several views associated w/ creating new appointments.
 *   XXX: move to new files when fully baked!
*/
ZmApptViewHelper = function() {
};

ZmApptViewHelper.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 				value: "NON", 	selected: true 	},
	{ label: ZmMsg.everyDay, 			value: "DAI", 	selected: false },
	{ label: ZmMsg.everyWeek, 			value: "WEE", 	selected: false },
	{ label: ZmMsg.everyMonth, 			value: "MON", 	selected: false },
	{ label: ZmMsg.everyYear, 			value: "YEA", 	selected: false },
	{ label: ZmMsg.custom, 				value: "CUS", 	selected: false }];

/**
* Returns an object with the indices of the currently selected time fields.
*
* @param tabView	[DwtTabView]	ZmApptTabViewPage or DwtSchedTabViewPage
* @param dateInfo	[object]		hash of date info to fill in
*/
ZmApptViewHelper.getDateInfo =
function(tabView, dateInfo) {
	dateInfo.startDate = tabView._startDateField.value;
	dateInfo.endDate = tabView._endDateField.value;
    dateInfo.timezone = tabView._tzoneSelect.getValue();
    if (tabView._allDayCheckbox.checked) {
		dateInfo.showTime = false;
		dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
		dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;
        dateInfo.isAllDay = true;
    } else {
		dateInfo.showTime = true;
		dateInfo.startHourIdx = tabView._startTimeSelect.getSelectedHourIdx();
		dateInfo.startMinuteIdx = tabView._startTimeSelect.getSelectedMinuteIdx();
		dateInfo.startAmPmIdx = tabView._startTimeSelect.getSelectedAmPmIdx();
		dateInfo.endHourIdx = tabView._endTimeSelect.getSelectedHourIdx();
		dateInfo.endMinuteIdx = tabView._endTimeSelect.getSelectedMinuteIdx();
		dateInfo.endAmPmIdx = tabView._endTimeSelect.getSelectedAmPmIdx();
        dateInfo.isAllDay = false;
	}
};

ZmApptViewHelper.handleDateChange = 
function(startDateField, endDateField, isStartDate, skipCheck) {
	var needsUpdate = false;
	var sd = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(endDateField.value);

	// if start date changed, reset end date if necessary
	if (isStartDate) {
		// if date was input by user and it's foobar, reset to today's date
		if (!skipCheck) {
			if (sd == null || isNaN(sd)) {
				sd = new Date();
			}
			// always reset the field value in case user entered date in wrong format
			startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
		}

		if (ed.valueOf() < sd.valueOf())
			endDateField.value = startDateField.value;
		needsUpdate = true;
	} else {
		// if date was input by user and it's foobar, reset to today's date
		if (!skipCheck) {
			if (ed == null || isNaN(ed)) {
				ed = new Date();
			}
			// always reset the field value in case user entered date in wrong format
			endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);
		}

		// otherwise, reset start date if necessary
		if (sd.valueOf() > ed.valueOf()) {
			startDateField.value = endDateField.value;
			needsUpdate = true;
		}
	}

	return needsUpdate;
};

ZmApptViewHelper.getDayToolTipText =
function(date, list, controller, noheader) {
	var html = new AjxBuffer();

	var formatter = DwtCalendar.getDateFullFormatter();	
	var title = formatter.format(date);
	
	html.append("<div>");

	html.append("<table cellpadding='0' cellspacing='0' border='0'>");
	if (!noheader) html.append("<tr><td><div class='calendar_tooltip_month_day_label'>", title, "</div></td></tr>");
	html.append("<tr><td>");
	html.append("<table cellpadding='1' cellspacing='0' border='0' width=100%>");
	
	var size = list ? list.size() : 0;

	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		if (ao.isAllDayEvent()) {
			//DBG.println("AO    "+ao);
			var bs = "";
			if (!ao._fanoutFirst) bs = "border-left:none;";
			if (!ao._fanoutLast) bs += "border-right:none;";
			var body_style = (bs != "") ? "style='"+bs+"'" : "";
			html.append("<tr><td><div class=appt>");
			html.append(ZmApptViewHelper._allDayItemHtml(ao, Dwt.getNextId(), body_style, controller));
			html.append("</div></td></tr>");
		}
	}

	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		if (!ao.isAllDayEvent()) {
		
			var color = ZmCalendarApp.COLORS[controller.getCalendarColor(ao.folderId)];
			var isNew = ao.status == ZmCalItem.PSTATUS_NEEDS_ACTION;

			html.append("<tr><td class='calendar_month_day_item'><div class='", color, isNew ? "DarkC" : "C", "'>");		
			if (isNew) html.append("<b>");
			//html.append("&bull;&nbsp;");
			//var dur = ao.getShortStartHour();
			var dur = ao.getDurationText(false, false);
			html.append(dur);
			if (dur != "") {
				html.append("&nbsp;");
			}
			html.append(AjxStringUtil.htmlEncode(ao.getName()));
			if (isNew) html.append("</b>");			
			html.append("</div>");
			html.append("</td></tr>");
		}
	}
	if ( size == 0) {
		html.append("<tr><td>"+ZmMsg.noAppts+"</td></tr>");
	}
	html.append("</table>");
	html.append("</tr></td></table>");
	html.append("</div>");

	return html.toString();
};

/*
 * Takes a string, AjxEmailAddress, or contact/resource and returns
 * a ZmContact or a ZmResource. If the attendee cannot be found in
 * contacts, locations, or equipment, a new contact or
 * resource is created and initialized.
 *
 * @param item			[object]		string, AjxEmailAddress, ZmContact, or ZmResource
 * @param type			[constant]*		attendee type
 * @param strictText	[boolean]*		if true, new location will not be created from free text
 * @param strictEmail	[boolean]*		if true, new attendee will not be created from email address
 */
ZmApptViewHelper.getAttendeeFromItem =
function(item, type, strictText, strictEmail) {

	if (!item || !type) return null;

	if (!ZmApptViewHelper._contacts) {
		ZmApptViewHelper._contacts = AjxDispatcher.run("GetContacts");
	}
	if (!ZmApptViewHelper._locations) {
		ZmApptViewHelper._locations = appCtxt.getApp(ZmApp.CALENDAR).getLocations();
	}
	if (!ZmApptViewHelper._equipment) {
		ZmApptViewHelper._equipment = appCtxt.getApp(ZmApp.CALENDAR).getEquipment();
	}

	var attendee = null;
	if ((item instanceof ZmContact) || (item instanceof ZmResource)) {
		// it's already a contact or resource, return it as is
		attendee = item;
	} else if (item instanceof AjxEmailAddress) {
		var addr = item.getAddress();
		// see if we have this contact/resource by checking email address
		attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);

		// Bug 7837: preserve the email address as it was typed
		//           instead of using the contact's primary email.
		if (attendee && type == ZmCalItem.PERSON) {
			attendee = AjxUtil.createProxy(attendee);
			attendee._inviteAddress = addr;
			attendee.getEmail = function() {
				return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			}
		}

		if (!attendee && !strictEmail) {
			// AjxEmailAddress has name and email, init a new contact/resource from those
			attendee = (type == ZmCalItem.PERSON) ? new ZmContact(null) :
													new ZmResource(type);
			attendee.initFromEmail(item, true);
		}
	} else if (typeof item == "string") {
		item = AjxStringUtil.trim(item);	// trim white space
		item = item.replace(/;$/, "");		// trim separator
		// see if it's an email we can use for lookup
	 	var email = AjxEmailAddress.parse(item);
	 	if (email) {
	 		var addr = email.getAddress();
	 		// is it a contact/resource we already know about?
			attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);
			if (!attendee && !strictEmail) {
				if (type == ZmCalItem.PERSON) {
					attendee = new ZmContact(null);
				} else if (type == ZmCalItem.LOCATION) {
					attendee = new ZmResource(null, ZmApptViewHelper._locations, ZmCalItem.LOCATION);
				} else if (type == ZmCalItem.EQUIPMENT) {
					attendee = new ZmResource(null, ZmApptViewHelper._equipment, ZmCalItem.EQUIPMENT);
				}
				attendee.initFromEmail(email, true);
			} else if (type == ZmCalItem.PERSON) {
				// remember actual address (in case it's email2 or email3)
				attendee._inviteAddress = addr;
			}
		} else if (type != ZmCalItem.PERSON) {
			// check if it's a location or piece of equipment we know by name
			if (ZmApptViewHelper._locations) {
				attendee = ZmApptViewHelper._locations.getResourceByName(item);
			}
			if (!attendee && ZmApptViewHelper._equipment) {
				attendee = ZmApptViewHelper._equipment.getResourceByName(item);
			}
		}
		// non-email string: initialize as a resource if it's a location, since
		// those can be free-text
		if (!attendee && type == ZmCalItem.LOCATION && !strictText && ZmApptViewHelper._locations) {
			attendee = new ZmResource(null, ZmApptViewHelper._locations, ZmCalItem.LOCATION);
			attendee.setAttr(ZmResource.F_name, item);
			attendee.setAttr(ZmResource.F_type, ZmResource.ATTR_LOCATION);
			ZmApptViewHelper._locations.updateHashes(attendee);
		}
	}
	return attendee;
};

ZmApptViewHelper._getAttendeeFromAddr =
function(addr, type) {
	var attendee = null;
	if ((type == ZmCalItem.PERSON) && ZmApptViewHelper._contacts) {
		attendee = ZmApptViewHelper._contacts.getContactByEmail(addr);
	} else if ((type == ZmCalItem.LOCATION) && ZmApptViewHelper._locations) {
		attendee = ZmApptViewHelper._locations.getResourceByEmail(addr);
	} else if ((type == ZmCalItem.EQUIPMENT) && ZmApptViewHelper._equipment) {
		attendee = ZmApptViewHelper._equipment.getResourceByEmail(addr);
	}
	return attendee;
};

/**
 * Returns a AjxEmailAddress for the organizer.
 *
 * @param organizer	[string]*		organizer's email address
 */
ZmApptViewHelper.getOrganizerEmail =
function(organizer) {
	var orgAddress = organizer ? organizer : appCtxt.get(ZmSetting.USERNAME);
	var orgName = (orgAddress == appCtxt.get(ZmSetting.USERNAME)) ? appCtxt.get(ZmSetting.DISPLAY_NAME) : null;
	return new AjxEmailAddress(orgAddress, null, orgName);
};

/*
* Creates a string from a list of attendees/locations/resources. If an item
* doesn't have a name, its address is used.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param includeDisplayName		[boolean]*		if true, include location info in parens (ZmResource)
*/
ZmApptViewHelper.getAttendeesString = 
function(list, type, includeDisplayName) {
	if (!(list && list.length)) return "";

	var a = [];
	for (var i = 0; i < list.length; i++) {
		var attendee = list[i];
		var text = attendee.getAttendeeText(type);
		if (includeDisplayName && list.length == 1) {
			var displayName = attendee.getAttr(ZmResource.F_locationName);
			if (displayName) {
				text = [text, " (", displayName, ")"].join("");
			}
		}
		a.push(text);
	}

	return a.join(ZmAppt.ATTENDEES_SEPARATOR);
};

ZmApptViewHelper._allDayItemHtml =
function(appt, id, body_style, controller) {
	var isNew = appt.ptst == ZmCalItem.PSTATUS_NEEDS_ACTION;
	var isAccepted = appt.ptst == ZmCalItem.PSTATUS_ACCEPT;
	var color = ZmCalendarApp.COLORS[controller.getCalendarColor(appt.folderId)];
	var subs = {
		id: id,
		body_style: body_style,
		newState: isNew ? "_new" : "",
		headerColor: color + (isNew ? "Dark" : "Light"),
		bodyColor: color + (isNew ? "" : "Bg"),
		name: AjxStringUtil.htmlEncode(appt.getName()),
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		endtime: (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmCalItem._getTTHour(appt.endDate),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		status: appt.isOrganizer() ? "" : appt.getParticipantStatusStr(),
		icon: appt.isPrivate() ? "ReadOnly" : null
	};
    return AjxTemplate.expand("calendar.Calendar#calendar_appt_allday", subs);
};


/**
* Creates up to three separate DwtSelects for the time (hour, minute, am|pm)
* Showing the AM|PM select widget is dependent on the user's locale
* 
* @author Parag Shah
*
* @param parent		[DwtComposite]	the parent widget
* @param id			[string]*		an ID that is propagated to component select objects
*/
ZmTimeSelect = function(parent, id) {
	DwtComposite.call(this, parent);

	this.id = id;
	this._isLocale24Hour = true;
	this._createSelects();
};

// IDs for types of time selects
ZmTimeSelect.START	= 1;
ZmTimeSelect.END	= 2;

// IDs for time select components
ZmTimeSelect.HOUR	= 1;
ZmTimeSelect.MINUTE	= 2;
ZmTimeSelect.AMPM	= 3;

ZmTimeSelect.getDateFromFields =
function(hours, minutes, ampm, date) {
	hours = Number(hours);
	if (ampm) {
		if (ampm == "AM" || ampm === 0) {
			hours = (hours == 12) ? 0 : hours;
		} else if (ampm == "PM" || ampm == 1) {
			hours = (hours < 12) ? hours + 12 : hours;
		}
	}
	
	date = date ? date : new Date();
	date.setHours(hours, Number(minutes), 0, 0);
	return date;
};

/**
* Adjust an appt's start or end based on changes to the other one. If the user changes
* the start time, change the end time so that the appt duration is maintained. If the
* user changes the end time, we leave things alone.
*
* @param ev					[Event]				UI event from a DwtSelect
* @param startSelect		[ZmTimeSelect]		start time select
* @param endSelect			[ZmTimeSelect]		end time select
* @param startDateField		[element]			start date field
* @param endDateField		[element]			end date field
*/
ZmTimeSelect.adjustStartEnd =
function(ev, startSelect, endSelect, startDateField, endDateField) {
	var select = ev._args.selectObj;
	var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);
	var startDateOrig = startDateField.value;
	var endDateOrig = endDateField.value;
	if (select.id == ZmTimeSelect.START) {
		var hours = (select.compId == ZmTimeSelect.HOUR) ? ev._args.oldValue : startSelect.getHours();
		var minutes = (select.compId == ZmTimeSelect.MINUTE) ? ev._args.oldValue : startSelect.getMinutes();
		var ampm = (select.compId == ZmTimeSelect.AMPM) ? ev._args.oldValue : startSelect.getAmPm();
		var oldStartDateMs = ZmTimeSelect.getDateFromFields(hours, minutes, ampm, startDate).getTime();
		var newStartDateMs = ZmTimeSelect.getDateFromFields(startSelect.getHours(), startSelect.getMinutes(), startSelect.getAmPm(), startDate).getTime();
		var oldEndDateMs = ZmTimeSelect.getDateFromFields(endSelect.getHours(), endSelect.getMinutes(), endSelect.getAmPm(), endDate).getTime();
		var delta = oldEndDateMs - oldStartDateMs;
		if (!delta) return null;
		var newEndDateMs = newStartDateMs + delta;
		var newEndDate = new Date(newEndDateMs);
		endSelect.set(newEndDate);
		endDateField.value = AjxDateUtil.simpleComputeDateStr(newEndDate);
		if (endDateField.value != endDateOrig) {
			return endDateField;
		}
	} else {
		return null;
	}
};

/**
 * Returns true if the start date/time is before the end date/time.
 *
 * @param ss				[ZmTimeSelect]		start time select
 * @param es				[ZmTimeSelect]		end time select
 * @param startDateField	[element]			start date field
 * @param endDateField		[element]			end date field
 */
ZmTimeSelect.validStartEnd =
function(ss, es, startDateField, endDateField) {
	var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);
	if (startDate && endDate) {
		// bug fix #11329 - dont allow year to be more than the earth will be around :]
		if (startDate.getFullYear() > 9999 || endDate.getFullYear() > 9999) {
			return false;
		}

		var startDateMs = ZmTimeSelect.getDateFromFields(ss.getHours(), ss.getMinutes(), ss.getAmPm(), startDate).getTime();
		var endDateMs = ZmTimeSelect.getDateFromFields(es.getHours(), es.getMinutes(), es.getAmPm(), endDate).getTime();
		if (startDateMs > endDateMs) {
			return false;
		}
	} else {
		return false;
	}
	return true;
};

ZmTimeSelect.prototype = new DwtComposite;
ZmTimeSelect.prototype.constructor = ZmTimeSelect;

/**
* Sets the time select according to the given date.
*
* @param date	[Date]		a Date object
*/
ZmTimeSelect.prototype.set = 
function(date) {

	var hourIdx = 0, minuteIdx = 0, amPmIdx = 0;
	var isLocale24Hour = this.isLocale24Hour();

	var hours = date.getHours();
	if (!isLocale24Hour && hours > 12) {
		hourIdx = hours - 13;
	} else if (!isLocale24Hour && hours == 0) {
		hourIdx = this.getHourSelectSize() - 1;
	} else {
		hourIdx = isLocale24Hour ? hours : hours - 1;
	}

	minuteIdx = Math.floor(date.getMinutes() / 5);

	if (!isLocale24Hour) {
		amPmIdx = (date.getHours() >= 12) ? 1 : 0;
	}

	this.setSelected(hourIdx, minuteIdx, amPmIdx);
};


/**
 * Returns a date object with the hours and minutes set based on
 * the values of this time select.
 *
 * @param date [Date] Optional. If specified, the hour and minute
 *                    values will be set on the specified object;
 *                    else, a new <code>Date</code> object is created.
 */
ZmTimeSelect.prototype.getValue =
function(date) {
	return (ZmTimeSelect.getDateFromFields(this.getHours(), this.getMinutes(), this.getAmPm(), date));
};

ZmTimeSelect.prototype.getHours =
function() {
	return this._hourSelect.getValue();
};

ZmTimeSelect.prototype.getMinutes =
function() {
	return this._minuteSelect.getValue();
};

ZmTimeSelect.prototype.getAmPm =
function() {
	return this._amPmSelect ? this._amPmSelect.getValue() : null;
};

ZmTimeSelect.prototype.setSelected = 
function(hourIdx, minuteIdx, amPmIdx) {
	this._hourSelect.setSelected(hourIdx);
	this._minuteSelect.setSelected(minuteIdx);
	if (!this._isLocale24Hour) {
		this._amPmSelect.setSelected(amPmIdx);
	}
};

ZmTimeSelect.prototype.addChangeListener = 
function(listener) {
	this._hourSelect.addChangeListener(listener);
	this._minuteSelect.addChangeListener(listener);
	if (this._amPmSelect)
		this._amPmSelect.addChangeListener(listener);
};

ZmTimeSelect.prototype.isLocale24Hour = 
function() {
	return this._isLocale24Hour;
};

ZmTimeSelect.prototype.getHourSelectSize = 
function() {	
	return this._hourSelect.size();
};

ZmTimeSelect.prototype.getMinuteSelectSize = 
function() {	
	return this._minuteSelect.size();
};

ZmTimeSelect.prototype.getSelectedHourIdx = 
function() {
	return this._hourSelect.getSelectedIndex();
};

ZmTimeSelect.prototype.getSelectedMinuteIdx = 
function() {
	return this._minuteSelect.getSelectedIndex();
};

ZmTimeSelect.prototype.getSelectedAmPmIdx = 
function() {
	return this._amPmSelect ? this._amPmSelect.getSelectedIndex() : 0;
};

ZmTimeSelect.prototype._createSelects =
function() {
	this._hourSelectId = Dwt.getNextId();
	this._minuteSelectId = Dwt.getNextId();
	this._amPmSelectId = Dwt.getNextId();

	// get the time formatter for the user's locale
	var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	var hourSegmentIdx = 0;
	var minuteSegmentIdx = 0;

	var html = [];
	var i = 0;

	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";

	// walk time formatter's segments array to render each segment part in the right order
	for (var j = 0; j < timeFormatter._segments.length; j++) {
		var segmentStr = timeFormatter._segments[j]._s;

		if (timeFormatter._segments[j] instanceof AjxFormat.TextSegment) {
			var trimStr = AjxStringUtil.trim(segmentStr);
			if (trimStr.length) {
				html[i++] = "<td class='TextPadding ZmFieldLabel'>"
				html[i++] = segmentStr;
				html[i++] = "</td>";
			}
		} else if (segmentStr.charAt(0) == "h" || segmentStr.charAt(0) == "H") {
			hourSegmentIdx = j;
			html[i++] = "<td width=42 id='"
			html[i++] = this._hourSelectId;
			html[i++] = "'></td>";
		} else if (segmentStr.charAt(0) == "m") {
			minuteSegmentIdx = j;
			html[i++] = "<td width=42 id='"
			html[i++] = this._minuteSelectId;
			html[i++] = "'></td>";
		} else if (segmentStr == "a") {	
			this._isLocale24Hour = false;
			html[i++] = "<td width=42 id='"
			html[i++] = this._amPmSelectId;
			html[i++] = "'></td>";
		}
	}
	
	html[i++] = "</tr></table>";

	// append html template to DOM
	this.getHtmlElement().innerHTML = html.join("");

	// init vars for adding hour DwtSelect
	var now = new Date();
	var start = this._isLocale24Hour ? 0 : 1;
	var limit = this._isLocale24Hour ? 24 : 13;

	// create new DwtSelect for hour slot
	this._hourSelect = new DwtSelect(this);
	this._hourSelect.id = this.id;
	this._hourSelect.compId = ZmTimeSelect.HOUR;
	for (var i = start; i < limit; i++) {
		now.setHours(i);
		var label = timeFormatter._segments[hourSegmentIdx].format(now);
		this._hourSelect.addOption(label, false, i);
	}
	this._hourSelect.reparentHtmlElement(this._hourSelectId);
	delete this._hourSelectId;

	// create new DwtSelect for minute slot
	this._minuteSelect = new DwtSelect(this);
	this._minuteSelect.id = this.id;
	this._minuteSelect.compId = ZmTimeSelect.MINUTE;
	for (var i = 0; i < 60; i = i + 5) {
		now.setMinutes(i);
		var label = timeFormatter._segments[minuteSegmentIdx].format(now);
		this._minuteSelect.addOption(label, false, i);
	}
	this._minuteSelect.reparentHtmlElement(this._minuteSelectId);
	delete this._minuteSelectId;

	// if locale is 12-hour time, add AM|PM DwtSelect
	if (!this._isLocale24Hour) {
		this._amPmSelect = new DwtSelect(this);
		this._amPmSelect.id = this.id;
		this._amPmSelect.compId = ZmTimeSelect.AMPM;
		this._amPmSelect.addOption(I18nMsg["periodAm"], false, "AM");
		this._amPmSelect.addOption(I18nMsg["periodPm"], false, "PM");
		this._amPmSelect.reparentHtmlElement(this._amPmSelectId);
		delete this._amPmSelectId;
	}
};
