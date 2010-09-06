/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Does nothing.
 * @constructor
 * @class
 * This static class provides utility functions for dealing with appointments
 * and their related forms and views.
 *
 * @author Parag Shah
 * @author Conrad Damon
 *
 * - Helper methods shared by several views associated w/ creating new appointments.
 *   XXX: move to new files when fully baked!
 *   
 * @private
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
 * Gets an object with the indices of the currently selected time fields.
 *
 * @param {ZmApptTabViewPage|DwtSchedTabViewPage}	tabView		the tab view
 * @param {Hash}	dateInfo	a hash of date info to fill in
 */
ZmApptViewHelper.getDateInfo =
function(tabView, dateInfo) {
	dateInfo.startDate = tabView._startDateField.value;
	dateInfo.endDate = tabView._endDateField.value;
    var tzoneSelect = tabView._tzoneSelect || tabView._tzoneSelectStart;
    dateInfo.timezone = tzoneSelect ? tzoneSelect.getValue() : "";
    if (tabView._allDayCheckbox && tabView._allDayCheckbox.checked) {
		dateInfo.showTime = false;

        //used by ZmTimeInput - advanced time picker
        dateInfo.startTimeStr = dateInfo.endTimeStr = null;

        //used by ZmTimeSelect
        dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
		dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;

        dateInfo.isAllDay = true;
    } else {
		dateInfo.showTime = true;

        if(tabView._startTimeSelect instanceof ZmTimeSelect) {
            dateInfo.startHourIdx = tabView._startTimeSelect.getSelectedHourIdx();
            dateInfo.startMinuteIdx = tabView._startTimeSelect.getSelectedMinuteIdx();
            dateInfo.startAmPmIdx = tabView._startTimeSelect.getSelectedAmPmIdx();
            dateInfo.endHourIdx = tabView._endTimeSelect.getSelectedHourIdx();
            dateInfo.endMinuteIdx = tabView._endTimeSelect.getSelectedMinuteIdx();
            dateInfo.endAmPmIdx = tabView._endTimeSelect.getSelectedAmPmIdx();
        }else {
            dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
            dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;            
        }

        if(tabView._startTimeSelect instanceof ZmTimeInput) {
            dateInfo.startTimeStr = tabView._startTimeSelect.getTimeString();
            dateInfo.endTimeStr = tabView._endTimeSelect.getTimeString();
        }else {
            dateInfo.startTimeStr = dateInfo.endTimeStr = null;
        }

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
function(date, list, controller, noheader, emptyMsg) {
	
	if(!emptyMsg){
		emptyMsg = ZmMsg.noAppts;
	}
	
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
			var isNew = ao.status == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;

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
		html.append("<tr><td>"+emptyMsg+"</td></tr>");
	}
	html.append("</table>");
	html.append("</tr></td></table>");
	html.append("</div>");

	return html.toString();
};

/**
 * Returns a list of calendars based on certain conditions. Especially useful
 * for multi-account
 *
 * @param folderSelect	[DwtSelect]		DwtSelect object to populate
 * @param folderRow		[HTMLElement]	Table row element to show/hide
 * @param calendarOrgs	[Object]		Hash map of calendar ID to calendar owner
 * @param calItem		[ZmCalItem]		a ZmAppt or ZmTask object
 */
ZmApptViewHelper.populateFolderSelect =
function(folderSelect, folderRow, calendarOrgs, calItem) {
	// get calendar folders (across all accounts)
	var org = ZmOrganizer.ITEM_ORGANIZER[calItem.type];
	var data = [];
	var folderTree;
	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];

		var appEnabled = ZmApp.SETTING[ZmItem.APP[calItem.type]];
		if ((appCtxt.isOffline && acct.isMain) ||
			!appCtxt.get(appEnabled, null, acct))
		{
			continue;
		}

		folderTree = appCtxt.getFolderTree(acct);
		data = data.concat(folderTree.getByType(org));
	}

	// add the local account last for multi-account
	if (appCtxt.isOffline) {
		folderTree = appCtxt.getFolderTree(appCtxt.accountList.mainAccount);
		data = data.concat(folderTree.getByType(org));
	}

	folderSelect.clearOptions();
    
	for (var i = 0; i < data.length; i++) {
		var cal = data[i];
		var acct = cal.getAccount();

		if (cal.noSuchFolder || cal.isFeed() || (cal.link && cal.isReadOnly())) { continue; }

		if (appCtxt.multiAccounts &&
			cal.nId == ZmOrganizer.ID_CALENDAR &&
			acct.isCalDavBased())
		{
			continue;
		}

		var id = cal.link ? cal.getRemoteId() : cal.id;
		calendarOrgs[id] = cal.owner;

		// bug: 28363 - owner attribute is not available for shared sub folders
		if (cal.isRemote() && !cal.owner && cal.parent && cal.parent.isRemote()) {
			calendarOrgs[id] = cal.parent.getOwner();
		}

		var selected = ((calItem.folderId == cal.id) || (calItem.folderId == id));
		var icon = appCtxt.multiAccounts ? acct.getIcon() : null;
		var name = AjxStringUtil.htmlDecode(appCtxt.multiAccounts
			? ([cal.getName(), " (", acct.getDisplayName(), ")"].join(""))
			: cal.getName());
		var option = new DwtSelectOption(id, selected, name, null, null, icon);
		folderSelect.addOption(option, selected);
	}


    //todo: new ui hide folder select if there is only one folder
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
function(item, type, strictText, strictEmail, checkForAvailability) {

	if (!item || !type) return null;

	if (type == ZmCalBaseItem.LOCATION && !ZmApptViewHelper._locations) {
		var locations = ZmApptViewHelper._locations = appCtxt.getApp(ZmApp.CALENDAR).getLocations();
        if(!locations.isLoaded) {
            locations.load();
        }

	}
	if (type == ZmCalBaseItem.EQUIPMENT && !ZmApptViewHelper._equipment) {
		var equipment = ZmApptViewHelper._equipment = appCtxt.getApp(ZmApp.CALENDAR).getEquipment();
        if(!equipment.isLoaded) {
            equipment.load();
        }                
	}
	
	var attendee = null;
	if (item.type == ZmItem.CONTACT) {
		// it's already a contact or resource, return it as is
		attendee = item;
	} else if (item instanceof AjxEmailAddress) {
		var addr = item.getAddress();
		// see if we have this contact/resource by checking email address
		attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);

		// Bug 7837: preserve the email address as it was typed
		//           instead of using the contact's primary email.
		if (attendee && type == ZmCalBaseItem.PERSON) {
			attendee = AjxUtil.createProxy(attendee);
			attendee._inviteAddress = addr;
			attendee.getEmail = function() {
				return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			}
		}

		if (!checkForAvailability && !attendee && !strictEmail) {
			// AjxEmailAddress has name and email, init a new contact/resource from those
			attendee = (type == ZmCalBaseItem.PERSON) ? new ZmContact(null) :
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
			if (!checkForAvailability && !attendee && !strictEmail) {
				if (type == ZmCalBaseItem.PERSON) {
					attendee = new ZmContact(null);
				} else if (type == ZmCalBaseItem.LOCATION) {
					attendee = new ZmResource(null, ZmApptViewHelper._locations, ZmCalBaseItem.LOCATION);
				} else if (type == ZmCalBaseItem.EQUIPMENT) {
					attendee = new ZmResource(null, ZmApptViewHelper._equipment, ZmCalBaseItem.EQUIPMENT);
				}
				attendee.initFromEmail(email, true);
			} else if (attendee && type == ZmCalBaseItem.PERSON) {
				// remember actual address (in case it's email2 or email3)
				attendee._inviteAddress = addr;
			}
		}
	}
	return attendee;
};

ZmApptViewHelper._getAttendeeFromAddr =
function(addr, type) {

	var attendee = null;
	if (type == ZmCalBaseItem.PERSON) {
		var contactsApp = appCtxt.getApp(ZmApp.CONTACTS);
		attendee = contactsApp && contactsApp.getContactByEmail(addr);
	} else if (type == ZmCalBaseItem.LOCATION) {
        attendee = ZmApptViewHelper._locations.getResourceByEmail(addr);
	} else if (type == ZmCalBaseItem.EQUIPMENT) {
		attendee = ZmApptViewHelper._equipment.getResourceByEmail(addr);
	}
	return attendee;
};

/**
 * Returns a AjxEmailAddress for the organizer.
 *
 * @param organizer	[string]*		organizer's email address
 * @param account	[ZmAccount]*	organizer's account
 */
ZmApptViewHelper.getOrganizerEmail =
function(organizer, account) {
	var orgAddress = organizer ? organizer : appCtxt.get(ZmSetting.USERNAME, null, account);
	var orgName = (orgAddress == appCtxt.get(ZmSetting.USERNAME, null, account))
		? appCtxt.get(ZmSetting.DISPLAY_NAME, null, account) : null;
	return new AjxEmailAddress(orgAddress, null, orgName);
};

ZmApptViewHelper.getAddressEmail =
function(email, isIdentity) {
	var orgAddress = email ? email : appCtxt.get(ZmSetting.USERNAME);
	var orgName;
    if(email == appCtxt.get(ZmSetting.USERNAME)){
        orgName = appCtxt.get(ZmSetting.DISPLAY_NAME);
    }else{
        //Identity
        var identity = appCtxt.getIdentityCollection().getIdentityBySendAddress(orgAddress);
        if(identity){
            orgName = identity.sendFromDisplay;
        }
    }
    return new AjxEmailAddress(orgAddress, null, orgName);    
};

/**
* Creates a string from a list of attendees/locations/resources. If an item
* doesn't have a name, its address is used.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param includeDisplayName		[boolean]*		if true, include location info in parens (ZmResource)
* @param includeRole		    [boolean]*		if true, include attendee role
*/
ZmApptViewHelper.getAttendeesString = 
function(list, type, includeDisplayName, includeRole) {
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
        if(includeRole) {
            text += " " + (attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED);
        }
		a.push(text);
	}

	return a.join(ZmAppt.ATTENDEES_SEPARATOR);
};

/**
* Creates a string of attendees by role. If an item
* doesn't have a name, its address is used.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param role      		        [constant]      attendee role
* @param count                  [number]        number of attendees to be returned
*/
ZmApptViewHelper.getAttendeesByRole =
function(list, type, role, count) {
    if (!(list && list.length)) return "";

    var a = [];
    var str = "";
    var hasMore = false;
    for (var i = 0; i < list.length; i++) {
        var attendee = list[i];
        var text = attendee.getAttendeeText(type);
        var _attendeeRole = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;
        if(_attendeeRole == role){
            a.push(text);
        }
    }
    if (count && a.length > count){
        hasMore = true;
        a = a.slice(0, count);
    }

    str = a.join(ZmAppt.ATTENDEES_SEPARATOR);
    return hasMore ?  str+= ZmAppt.ATTENDEES_SEPARATOR + " ..." : str;
};

ZmApptViewHelper._allDayItemHtml =
function(appt, id, bodyStyle, controller) {
	var isNew = appt.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
	var isAccepted = appt.ptst == ZmCalBaseItem.PSTATUS_ACCEPT;
	var calendar = appt.getFolder();
    AjxDispatcher.require(["CalendarCore", "Calendar"]);
	var colors = ZmCalBaseView._getColors(calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color]);
	var headerStyle = ZmCalBaseView._toColorsCss(isNew ? colors.deeper.header : colors.standard.header);
	bodyStyle += ZmCalBaseView._toColorsCss(isNew ? colors.deeper.body : colors.standard.body);
	var subs = {
		id: id,
		headerStyle: headerStyle,
		bodyStyle: bodyStyle,
		newState: isNew ? "_new" : "",
		name: AjxStringUtil.htmlEncode(appt.getName()),
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime: appt.getDurationText(true, true),
		endtime: (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmCalBaseItem._getTTHour(appt.endDate),
		location: AjxStringUtil.htmlEncode(appt.getLocation()),
		status: appt.isOrganizer() ? "" : appt.getParticipantStatusStr(),
		icon: appt.isPrivate() ? "ReadOnly" : null,
		showAsColor : ZmApptViewHelper._getShowAsColorFromId(appt.fba),
        boxBorder: ZmApptViewHelper.getBoxBorderFromId(appt.fba)
	};
    return AjxTemplate.expand("calendar.Calendar#calendar_appt_allday", subs);
};

ZmApptViewHelper._getShowAsColorFromId =
function(id) {
	switch(id) {
		case "F": return "ZmAppt-free";
		case "B": return "ZmAppt-busy";
		case "T": return "ZmAppt-tentative";
		case "O": return "ZmAppt-ooo";
	}
	return "ZmAppt-busy";
};

ZmApptViewHelper.getBoxBorderFromId =
function(id) {
	switch(id) {
		case "F": return "ZmSchedulerApptBorder-free";
		case "B": return "ZmSchedulerApptBorder-busy";
		case "T": return "ZmSchedulerApptBorder-tentative";
		case "O": return "ZmSchedulerApptBorder-outOfOffice";
	}
	return "ZmSchedulerApptBorder-busy";
};
