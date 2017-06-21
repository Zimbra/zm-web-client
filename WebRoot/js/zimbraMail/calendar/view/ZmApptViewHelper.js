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


ZmApptViewHelper.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "F", 	selected: false },
	{ label: ZmMsg.organizerTentative, 		value: "T", 	selected: false },
	{ label: ZmMsg.busy, 				value: "B", 	selected: true  },
	{ label: ZmMsg.outOfOffice,			value: "O", 	selected: false }
];

/**
 * returns the label of the option specified by it's value. This is used in calendar.Appointment#Tooltip template
 *
 * @param value
 * returns the label
 */
ZmApptViewHelper.getShowAsOptionLabel =
function(value) {

	for (var i = 0; i < ZmApptViewHelper.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.SHOWAS_OPTIONS[i];
		if (option.value == value) {
			return option.label;
		}
	}
};


/**
 * Gets an object with the indices of the currently selected time fields.
 *
 * @param {ZmApptEditView}	tabView		the edit/tab view containing time widgets
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

        //used by DwtTimeInput - advanced time picker
        dateInfo.startTimeStr = dateInfo.endTimeStr = null;

        //used by DwtTimeSelect
        dateInfo.startHourIdx = dateInfo.startMinuteIdx = dateInfo.startAmPmIdx =
		dateInfo.endHourIdx = dateInfo.endMinuteIdx = dateInfo.endAmPmIdx = null;

        dateInfo.isAllDay = true;
    } else {
		dateInfo.showTime = true;

        if(tabView._startTimeSelect instanceof DwtTimeSelect) {
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

        if(tabView._startTimeSelect instanceof DwtTimeInput) {
            dateInfo.startTimeStr = tabView._startTimeSelect.getTimeString();
            dateInfo.endTimeStr = tabView._endTimeSelect.getTimeString();
        }else {
            dateInfo.startTimeStr = dateInfo.endTimeStr = null;
        }

        dateInfo.isAllDay = false;
	}
};

ZmApptViewHelper.handleDateChange = 
function(startDateField, endDateField, isStartDate, skipCheck, oldStartDate) {
	var needsUpdate = false;
	var sd = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(endDateField.value);

	// if start date changed, reset end date if necessary
	if (isStartDate) {
		// if date was input by user and it's foobar, reset to today's date
		if (!skipCheck) {
			// Bug fix for https://jira.corp.synacor.com/browse/ZCS-207. Do not allow past appointments less than year 1900
			if (sd == null || isNaN(sd)) {
				sd = new Date();
			}
			// always reset the field value in case user entered date in wrong format
			startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
		}

		if (ed.valueOf() < sd.valueOf()) {
			endDateField.value = startDateField.value;
        }else if(oldStartDate != null) {
            var delta = ed.getTime() - oldStartDate.getTime();
            var newEndDate = new Date(sd.getTime() + delta);
            endDateField.value = AjxDateUtil.simpleComputeDateStr(newEndDate);
        }
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

ZmApptViewHelper.getApptToolTipText =
function(origAppt, controller) {
    if(origAppt._toolTip) {
        return origAppt._toolTip;
    }
    var appt = ZmAppt.quickClone(origAppt);
    var organizer = appt.getOrganizer();
	var sentBy = appt.getSentBy();
	var userName = appCtxt.get(ZmSetting.USERNAME);
	if (sentBy || (organizer && organizer != userName)) {
		organizer = (appt.message && appt.message.invite && appt.message.invite.getOrganizerName()) || organizer;
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
		appt: appt,
		cal: (appt.folderId != ZmOrganizer.ID_CALENDAR && controller) ? controller.getCalendar() : null,
		organizer: organizer,
		sentBy: sentBy,
		when: appt.getDurationText(false, false),
		location: appt.getLocation(),
		width: "250",
        hideAttendees: true
	};

	var toolTip = origAppt._toolTip = AjxTemplate.expand("calendar.Appointment#Tooltip", params);
    return toolTip;
};


ZmApptViewHelper.getDayToolTipText =
function(date, list, controller, noheader, emptyMsg, isMinical, getSimpleToolTip) {
	
	if (!emptyMsg) {
		emptyMsg = ZmMsg.noAppts;
	}

	var html = new AjxBuffer();

	var formatter = DwtCalendar.getDateFullFormatter();	
	var title = formatter.format(date);
	
	html.append("<div>");

	html.append("<table cellpadding='0' cellspacing='0' border='0'>");
	if (!noheader) html.append("<tr><td><div class='calendar_tooltip_month_day_label'>", title, "</div></td></tr>");
	html.append("<tr><td>");
	html.append("<table cellpadding='1' cellspacing='0' border='0' style='width:100%;'>");
	
	var size = list ? list.size() : 0;

	var useEmptyMsg = true;
	var dateTime = date.getTime();
	for (var i = 0; i < size; i++) {
		var ao = list.get(i);
		var isAllDay = ao.isAllDayEvent();
		if (isAllDay || getSimpleToolTip) {
			// Multi-day "appts/all day events" will be broken up into one sub-appt per day, so only show
			// the one that matches the selected date
			var apptDate = new Date(ao.startDate.getTime());
			apptDate.setHours(0,0,0,0);
			if (apptDate.getTime() != dateTime) continue;
		}

		if (isAllDay && !getSimpleToolTip) {
			useEmptyMsg = false;
			if(!isMinical && ao.toString() == "ZmAppt") {
				html.append("<tr><td><div class=appt>");
				html.append(ZmApptViewHelper.getApptToolTipText(ao, controller));
				html.append("</div></td></tr>");
			}
			else {
				//DBG.println("AO    "+ao);
				var widthField = AjxEnv.isIE ? "width:500px;" : "min-width:300px;";
				html.append("<tr><td><div style='" + widthField + "' class=appt>");
				html.append(ZmApptViewHelper._allDayItemHtml(ao, Dwt.getNextId(), controller, true, true));
				html.append("</div></td></tr>");
			}
		}
		else {
			useEmptyMsg = false;
			if (!isMinical && ao.toString() == "ZmAppt") {
				html.append("<tr><td><div class=appt>");
				html.append(ZmApptViewHelper.getApptToolTipText(ao, controller));
				html.append("</div></td></tr>");
			}
			else {
				html.append("<tr><td class='calendar_month_day_item'><span class='calendar_month_day_duration'>");
				
				var dur; 
				if (isAllDay) {
					dur = ao._orig.getDurationText(false, false, true)
				} 
				else {
					//html.append("&bull;&nbsp;");
					//var dur = ao.getShortStartHour();
					dur = getSimpleToolTip ? ao._orig.getDurationText(false,false,true) : ao.getDurationText(false,false);
				}
				html.append(dur);
				if (dur != "") {
					html.append("&nbsp;");
				}
				html.append("</span><span class='calendar_month_day_description'>");
				html.append(AjxStringUtil.htmlEncode(ao.getName()));

				html.append("</span>");
				html.append("</td></tr>");
			}
		}
	}
	if (useEmptyMsg) {
		html.append("<tr><td>"+emptyMsg+"</td></tr>");
	}
	html.append("</table>");
	html.append("</td></tr></table>");
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

		if (cal.noSuchFolder || cal.isFeed() || (cal.link && cal.isReadOnly()) || cal.isInTrash()) { continue; }

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
		var icon = appCtxt.multiAccounts ? acct.getIcon() : cal.getIconWithColor();
		var name = AjxStringUtil.htmlDecode(appCtxt.multiAccounts
			? ([cal.getName(), " (", acct.getDisplayName(), ")"].join(""))
			: cal.getName());
		var option = new DwtSelectOption(id, selected, name, null, null, icon);
		folderSelect.addOption(option, selected);
	}

    ZmApptViewHelper.folderSelectResize(folderSelect);
    //todo: new ui hide folder select if there is only one folder
};

/**
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
		if (!appCtxt.get(ZmSetting.GAL_ENABLED)) {
			//if GAL is disabled then user does not have permission to load locations.
			return null;
		}
		var locations = ZmApptViewHelper._locations = appCtxt.getApp(ZmApp.CALENDAR).getLocations();
        if(!locations.isLoaded) {
            locations.load();
        }

	}
	if (type == ZmCalBaseItem.EQUIPMENT && !ZmApptViewHelper._equipment) {
		if (!appCtxt.get(ZmSetting.GAL_ENABLED)) {
			//if GAL is disabled then user does not have permission to load equipment.
			return null;
		}
		var equipment = ZmApptViewHelper._equipment = appCtxt.getApp(ZmApp.CALENDAR).getEquipment();
        if(!equipment.isLoaded) {
            equipment.load();
        }                
	}
	
	var attendee = null;
	if (item.type == ZmItem.CONTACT || item.type == ZmItem.GROUP || item.type == ZmItem.RESOURCE) {
		// it's already a contact or resource, return it as is
		attendee = item;
	} else if (item instanceof AjxEmailAddress) {
		var addr = item.getAddress();
		// see if we have this contact/resource by checking email address
		attendee = ZmApptViewHelper._getAttendeeFromAddr(addr, type);

		// Bug 7837: preserve the email address as it was typed
		//           instead of using the contact's primary email.
		if (attendee && (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP)) {
			attendee = AjxUtil.createProxy(attendee);
			attendee._inviteAddress = addr;
			attendee.getEmail = function() {
				return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			};
		}

		if (!checkForAvailability && !attendee && !strictEmail) {
			// AjxEmailAddress has name and email, init a new contact/resource from those
			if (type === ZmCalBaseItem.PERSON) {
				attendee = new ZmContact(null, null, ZmItem.CONTACT);
			}
			else if (type === ZmCalBaseItem.GROUP) {
				attendee = new ZmContact(null, null, ZmItem.GROUP);
			}
			else {
				attendee = new ZmResource(type);
			}
			attendee.initFromEmail(item, true);
		}
		attendee.canExpand = item.canExpand;
		var ac = window.parentAppCtxt || window.appCtxt;
		ac.setIsExpandableDL(addr, attendee.canExpand);
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
				if (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.FORWARD) {
					attendee = new ZmContact(null, null, ZmItem.CONTACT);
				}
				else if (type === ZmCalBaseItem.GROUP) {
					attendee = new ZmContact(null, null, ZmItem.GROUP);
				}
				else if (type === ZmCalBaseItem.LOCATION) {
					attendee = new ZmResource(null, ZmApptViewHelper._locations, ZmCalBaseItem.LOCATION);
				}
				else if (type === ZmCalBaseItem.EQUIPMENT) {
					attendee = new ZmResource(null, ZmApptViewHelper._equipment, ZmCalBaseItem.EQUIPMENT);
				}
				attendee.initFromEmail(email, true);
			} else if (attendee && (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP)) {
				// remember actual address (in case it's email2 or email3)
				attendee._inviteAddress = addr;
                attendee.getEmail = function() {
				    return this._inviteAddress || this.constructor.prototype.getEmail.apply(this);
			    };
			}
		}
	}
	return attendee;
};

ZmApptViewHelper._getAttendeeFromAddr =
function(addr, type) {

	var attendee = null;
	if (type === ZmCalBaseItem.PERSON || type === ZmCalBaseItem.GROUP || type === ZmCalBaseItem.FORWARD) {
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
        var iCol = appCtxt.getIdentityCollection(),
            identity = iCol ? iCol.getIdentityBySendAddress(orgAddress) : "";
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
		var text = ZmApptViewHelper.getAttendeesText(attendee, type);
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

ZmApptViewHelper.getAttendeesText =
function(attendee, type, shortForm) {

    //give preference to lookup email is the attendee object is located by looking up email address
    var lookupEmailObj = attendee.getLookupEmail(true);
    if(lookupEmailObj) {
		return lookupEmailObj.toString(shortForm || (type && type !== ZmCalBaseItem.PERSON && type !== ZmCalBaseItem.GROUP));
	}

    return attendee.getAttendeeText(type, shortForm);
};

/**
* Creates a string of attendees by role. If an item
* doesn't have a name, its address is used.
*
* calls common code from mail msg view to get the collapse/expand "show more" funcitonality for large lists.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param role      		        [constant]      attendee role
* @param count                  [number]        number of attendees to be returned
*/
ZmApptViewHelper.getAttendeesByRoleCollapsed =
function(list, type, role, objectManager, htmlElId) {
    if (!(list && list.length)) return "";
	var attendees = ZmApptViewHelper.getAttendeesArrayByRole(list, role);

	var emails = [];
	for (var i = 0; i < attendees.length; i++) {
		var att = attendees[i];
		emails.push(new AjxEmailAddress(att.getEmail(), type, att.getFullName(), att.getFullName()));
	}

	var options = {};
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);
	var addressInfo = ZmMailMsgView.getAddressesFieldHtmlHelper(emails, options,
		role, objectManager, htmlElId);
	return addressInfo.html;
};

/**
* Creates a string of attendees by role. this allows to show only count elements, with "..." appended.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param type					[constant]		attendee type
* @param role      		        [constant]      attendee role
* @param count                  [number]        number of attendees to be returned
*/
ZmApptViewHelper.getAttendeesByRole =
function(list, type, role, count) {
    if (!(list && list.length)) return "";

	var res = [];

	var attendees = ZmApptViewHelper.getAttendeesArrayByRole(list, role);
	for (var i = 0; i < attendees.length; i++) {
		if (count && i > count) {
			res.push(" ...");
			break;
		}
		if (i > 0) {
			res.push(ZmAppt.ATTENDEES_SEPARATOR);
		}
		res.push(attendees[i].getAttendeeText(type));
	}
	return res.join("");
};



/**
* returns array of attendees by role.
*
* @param list					[array]			list of attendees (ZmContact or ZmResource)
* @param role      		        [constant]      attendee role
*/
ZmApptViewHelper.getAttendeesArrayByRole =
function(list, role, count) {

    if (!(list && list.length)) {
	    return [];
    }

    var a = [];
    for (var i = 0; i < list.length; i++) {
        var attendee = list[i];
        var attendeeRole = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;
        if (attendeeRole === role){
            a.push(attendee);
        }
    }
	return a;
};

ZmApptViewHelper._allDayItemHtml =
function(appt, id, controller, first, last) {
	var isNew = appt.ptst == ZmCalBaseItem.PSTATUS_NEEDS_ACTION;
	var isAccepted = appt.ptst == ZmCalBaseItem.PSTATUS_ACCEPT;
	var calendar = appt.getFolder();
    AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);

    var tagNames  = appt.getVisibleTags();
    var tagIcon = last ? appt.getTagImageFromNames(tagNames) : null;

    var fba = isNew ? ZmCalBaseItem.PSTATUS_NEEDS_ACTION : appt.fba;
    var headerColors = ZmApptViewHelper.getApptColor(isNew, calendar, tagNames, "header");
    var headerStyle  = ZmCalBaseView._toColorsCss(headerColors.appt);
    var bodyColors   = ZmApptViewHelper.getApptColor(isNew, calendar, tagNames, "body");
    var bodyStyle    = ZmCalBaseView._toColorsCss(bodyColors.appt);

    var borderLeft  = first ? "" : "border-left:0;";
    var borderRight = last  ? "" : "border-right:0;";

    var newState = isNew ? "_new" : "";
	var subs = {
		id:           id,
		headerStyle:  headerStyle,
		bodyStyle:    bodyStyle,
		newState:     newState,
		name:         first ? AjxStringUtil.htmlEncode(appt.getName()) : "&nbsp;",
//		tag: isNew ? "NEW" : "",		//  HACK: i18n
		starttime:    appt.getDurationText(true, true),
		endtime:      (!appt._fanoutLast && (appt._fanoutFirst || (appt._fanoutNum > 0))) ? "" : ZmCalBaseItem._getTTHour(appt.endDate),
		location:     AjxStringUtil.htmlEncode(appt.getLocation()),
		status:       appt.isOrganizer() ? "" : appt.getParticipantStatusStr(),
		icon:         first && appt.isPrivate() ? "ReadOnly" : null,
        showAsColor:  first ? ZmApptViewHelper._getShowAsColorFromId(fba) : "",
        showAsClass:  first ? "" : "appt_allday" + newState + "_name",
        boxBorder:    ZmApptViewHelper.getBoxBorderFromId(fba),
        borderLeft:   borderLeft,
        borderRight:  borderRight,
        tagIcon:      tagIcon
	};
    ZmApptViewHelper.setupCalendarColor(last, headerColors, tagNames, subs, "headerStyle", null, 1, 1);
    return AjxTemplate.expand("calendar.Calendar#calendar_appt_allday", subs);
};

ZmApptViewHelper._getShowAsColorFromId =
function(id) {
    var color = "#4AA6F1";
	switch(id) {
        case ZmCalBaseItem.PSTATUS_NEEDS_ACTION: color = "#FF3300"; break;
		case "F": color = "#FFFFFF"; break;
		case "B": color = "#4AA6F1"; break;
		case "T": color = "#BAE0E3"; break;
		case "O": color = "#7B5BAC"; break;
	}
	var cssString = [];
	cssString.push(ZmApptViewHelper.getTransparentDiagonalGradientCSS("45deg",3));
	cssString.push("background-color: " + color);
    return cssString.join(";");
};

ZmApptViewHelper.getBoxBorderFromId =
function(id) {
	switch(id) {
		case "F": return "ZmSchedulerApptBorder-free";
        case ZmCalBaseItem.PSTATUS_NEEDS_ACTION:
		case "B": return "ZmSchedulerApptBorder-busy";
		case "T": return "ZmSchedulerApptBorder-tentative";
		case "O": return "ZmSchedulerApptBorder-outOfOffice";
	}
	return "ZmSchedulerApptBorder-busy";
};

/**
 * Returns a list of attendees with the given role.
 *
 * @param	{array}		list		list of attendees
 * @param	{constant}	role		defines the role of the attendee (required/optional)
 *
 * @return	{array}	a list of attendees
 */
ZmApptViewHelper.filterAttendeesByRole =
function(list, role) {

	var result = [];
	for (var i = 0; i < list.length; i++) {
		var attendee = list[i];
		var attRole = attendee.getParticipantRole() || ZmCalItem.ROLE_REQUIRED;
		if (attRole == role){
			result.push(attendee);
		}
	}
	return result;
};

ZmApptViewHelper.getApptColor =
function(deeper, calendar, tagNames, segment) {
    var colors = ZmCalBaseView._getColors(calendar.rgb || ZmOrganizer.COLOR_VALUES[calendar.color]);
    var calColor = deeper ? colors.deeper[segment] : colors.standard[segment];
    var apptColor = calColor;
    if (tagNames && (tagNames.length == 1)) {
		var tagList = appCtxt.getAccountTagList(calendar);

        var tag = tagList.getByNameOrRemote(tagNames[0]);
        if(tag){apptColor = { bgcolor: tag.getColor() };}
    }
    return {calendar:calColor, appt:apptColor};
};

ZmApptViewHelper.setupCalendarColor =
function(last, colors, tagNames, templateData, colorParam, clearParam, peelTopOffset, peelRightOffset, div) {
    // var colorCss = Dwt.createLinearGradientCss("#FFFFFF", colors.appt.bgcolor, "v");
	var colorCss = "background-color: rgba(" + AjxColor.components(colors.appt.bgcolor) + ", 0.2)";
    if (colorCss) {
        templateData[colorParam] = colorCss;
        if (clearParam) {
            templateData[clearParam] = null;
        }
    }
    if (last && tagNames && (tagNames.length == 1)) {
        if (!colorCss) {
            // Can't use the gradient color.  IE masking doesn't work properly for tags on appts;
            // Since the color is already set in the background, just print the overlay image
            var match = templateData.tagIcon.match(AjxImg.RE_COLOR);
            if (match) {
                templateData.tagIcon = (match && match[1]) + "Overlay";
            }
        }
        // Tag color has been applied to the appt.  Add the calendar peel image
        templateData.peelIcon  = "Peel,color=" + colors.calendar.bgcolor;
        templateData.peelTop   = peelTopOffset;
        templateData.peelRight = peelRightOffset;
    }
};

/**
 * Gets the attach list as HTML.
 * 
 * @param {ZmCalItem}	calItem			calendar item
 * @param {Object}		attach			a generic Object contain meta info about the attachment
 * @param {Boolean}		hasCheckbox		<code>true</code> to insert a checkbox prior to the attachment
 * @return	{String}	the HTML
 * 
 * TODO: replace string onclick handlers with funcs
 */
ZmApptViewHelper.getAttachListHtml =
function(calItem, attach, hasCheckbox, getLinkIdCallback) {
	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);

	// gather meta data for this attachment
	var mimeInfo = ZmMimeTable.getInfo(attach.ct);
	var icon = mimeInfo ? mimeInfo.image : "GenericDoc";
	var size = attach.s;
	var sizeText;
	if (size != null) {
		if (size < 1024)		sizeText = size + " B";
		else if (size < 1024^2)	sizeText = Math.round((size/1024) * 10) / 10 + " KB";
		else 					sizeText = Math.round((size / (1024*1024)) * 10) / 10 + " MB";
	}

	var html = [];
	var i = 0;

	// start building html for this attachment
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0  class='ZmAttachmentItem'>";
	html[i++] = "<tr>";
	if (hasCheckbox) {
		html[i++] = "<td class='ZmAttachmentCheckbox'>";
		html[i++] = "<input type='checkbox' checked value='";
		html[i++] = attach.part;
		html[i++] = "' name='";
		html[i++] = ZmCalItem.ATTACHMENT_CHECKBOX_NAME;
		html[i++] = "'></td>";
	}

	var hrefRoot = ["href='", msgFetchUrl, "&id=", calItem.invId, "&amp;part=", attach.part].join("");
	html[i++] = "<td class='ZmAttachmentIcon'><a target='_blank' class='AttLink' ";
	if (getLinkIdCallback) {
		var imageLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_IMAGE);
		html[i++] = "id='";
		html[i++] = imageLinkId;
		html[i++] = "' ";
	}
	html[i++] = hrefRoot;
	html[i++] = "'>";
	html[i++] = AjxImg.getImageHtml(icon);

	html[i++] = "</a></td>";
	html[i++] = "<td class='ZmAttachmentMetaInfo'>";
	html[i++] = "<div class='ZmAttachmentFileName'><a target='_blank' class='AttLink' "; //Filename wrapper

	if (appCtxt.get(ZmSetting.MAIL_ENABLED) && attach.ct == ZmMimeTable.MSG_RFC822) {
		html[i++] = " href='javascript:;' onclick='ZmCalItemView.rfc822Callback(";
		html[i++] = '"';
		html[i++] = calItem.invId;
		html[i++] = '"';
		html[i++] = ",\"";
		html[i++] = attach.part;
		html[i++] = "\"); return false;'";
	} else {
		html[i++] = hrefRoot;
		html[i++] = "'";
	}
	if (getLinkIdCallback) {
		var mainLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_MAIN);
		html[i++] = " id='";
		html[i++] = mainLinkId;
		html[i++] = "'";
	}
	html[i++] = ">";
	html[i++] = AjxStringUtil.htmlEncode(attach.filename);
	html[i++] = "</a>";
	html[i++] = "</div>"; //close `ZmAttachmentFileName` class

	var addHtmlLink = (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) &&
					   attach.body == null && ZmMimeTable.hasHtmlVersion(attach.ct));

	if (sizeText || addHtmlLink) {
		html[i++] = "<div class='ZmAttachmentFileSize'>"; //filesize wrapper
		html[i++] = "(";
		if (sizeText) {
			html[i++] = sizeText;
			html[i++] = ") ";
		}
		html[i++] = "</div>"; //close `ZmAttachmentFileSize`
		html[i++] = "<div class='ZmAttachmentLinks'>"; //attachment links wrapper
		var downloadLinkId = "";
		if (getLinkIdCallback) {
			downloadLinkId = getLinkIdCallback(attach.part, ZmCalItem.ATT_LINK_DOWNLOAD);
		}
		if (addHtmlLink) {
			html[i++] = "<a style='text-decoration:underline' target='_blank' class='AttLink' ";
			if (getLinkIdCallback) {
				html[i++] = "id='";
				html[i++] = downloadLinkId;
				html[i++] = "' ";
			}
			html[i++] = hrefRoot;
			html[i++] = "&view=html'>";
			html[i++] = AjxImg.getImageHtml("Preview");
			html[i++] = "</a>&nbsp;";
		}
		if (attach.ct != ZmMimeTable.MSG_RFC822) {
			html[i++] = "<a style='text-decoration:underline' class='AttLink' onclick='ZmZimbraMail.unloadHackCallback();' ";
			if (getLinkIdCallback) {
				html[i++] = " id='";
				html[i++] = downloadLinkId;
				html[i++] = "' ";
			}
			html[i++] = hrefRoot;
			html[i++] = "&disp=a'>";
			html[i++] = AjxImg.getImageHtml("Download");
			html[i++] = "</a>";
		}
		html[i++] = "</div>"; //close `ZmAttachmentLinks`
	}

	html[i++] = "</td></tr></table>";

	// Provide lookup id and label for offline mode
	if (!attach.mid) {
		attach.mid = calItem.invId;
		attach.label = attach.filename;
	}

	return html.join("");
};

/**
 * @param {DwtSelect} folderSelect
 *
 * TODO: set the width for folderSelect once the image icon gets loaded if any
 */
ZmApptViewHelper.folderSelectResize =
function(folderSelect) {

    var divEl = folderSelect._containerEl,
        childNodes,
        img;

    if (divEl) {
        childNodes = divEl.childNodes[0];
        if (childNodes) {
            img = childNodes.getElementsByTagName("img")[0];
            if (img) {
                img.onload = function() {
                    divEl.style.width = childNodes.offsetWidth || "auto";// offsetWidth doesn't work in IE if the element or one of its parents has display:none
                    img.onload = "";
                }
            }
        }
    }
};

/**
 * Compute start date and time and decide which warning message to show.
 *
 * @param {Date}		startDate		start date of the appointment
 * @param {String}		htmlElId		currently referenced HTML Id
 * @param {Boolean}		isAllDay		check for all day event
 *
 */
ZmApptViewHelper.warnIfApptStartingInPast =
function (startDate, htmlElId, isAllDay) {
	var todaysDateTime = new Date(),
		todaysDate = new Date(new Date().setHours(0, 0, 0)),
		apptStartDate = new Date(new Date(startDate).setHours(0, 0, 0)),
		apptStartDateTime = new Date(startDate),
		isApptDateInPast = false,
		isApptTimeInPast = false;

	if (apptStartDate !== null || !isNaN(apptStartDate)) {
		if (Date.parse(apptStartDate) - Date.parse(todaysDate) < 0) {
			isApptDateInPast = true;
		}

		if (!isAllDay) {
			var secondsElapsed = (apptStartDateTime.getTime() - todaysDateTime.getTime()) / 1000;
			if (secondsElapsed <  0) {
				isApptTimeInPast = true;
			}
		}
	}

	if (isApptDateInPast && isApptTimeInPast) {
		ZmApptViewHelper._toggleMeetingInPastWarning(true, htmlElId, ZmMsg.meetingInPastWarning);
	}
	else if (isApptDateInPast) {
		ZmApptViewHelper._toggleMeetingInPastWarning(true, htmlElId, ZmMsg.meetingDateInPastWarning);
	}
	else if (isApptTimeInPast) {
		ZmApptViewHelper._toggleMeetingInPastWarning(true, htmlElId, ZmMsg.meetingTimeInPastWarning);
	}
	else {
		ZmApptViewHelper._toggleMeetingInPastWarning(false, htmlElId, '');
	}
};

/**
 * Show/hide warning message in case the user is trying to schedule an appointment in past.
 *
 * @param {Boolean}		toggleFlag			state to hide/show warning message
 * @param {String}		htmlElId			currently referenced HTML Id
 * @param {String}		warningMessage		message to display as warning
 *
 */
ZmApptViewHelper._toggleMeetingInPastWarning =
function(toggleFlag, htmlElId, warningMessage) {
	var warningTemplateElement = document.getElementById(htmlElId + '_meetingInPastWarning');
	var warningTemplateTextElement = document.getElementById(htmlElId + '_meetingInPastWarningMessageText');
	warningTemplateTextElement.innerHTML = warningMessage;

	warningTemplateElement.style.display = toggleFlag ? "" : Dwt.DISPLAY_NONE;
	warningTemplateTextElement.style.display = toggleFlag? "" : Dwt.DISPLAY_NONE;
};

/**
 * Utility method to return diagonal gradient CSS
 * TODO: Need to find better alternative for this (maybe using PNG image)
 * TODO: Handle browser prefixes
 */
ZmApptViewHelper.getTransparentDiagonalGradientCSS = function(angle, length) {
	if(!angle) {
		angle = "45deg";
	}
	if(!length) {
		length = 10;
	}
	length = parseInt(length); 
	var css = [];
	css.push("background-image: repeating-linear-gradient(" + angle);
	css.push("transparent");
	css.push("transparent " + length + "px");
	css.push("rgba(255,255,255,.5) " + length + "px");
	css.push("rgba(255,255,255,.5) " + length*2 + "px)");
	return css.join(",");
}