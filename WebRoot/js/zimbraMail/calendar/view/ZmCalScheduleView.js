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
/****************** OLD VERSION OF SCHEDULE VIEW *********************/
ZmCalScheduleView = function(parent, posStyle, controller, dropTgt) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, null, 1, true);
};

ZmCalScheduleView.prototype = new ZmCalColView;
ZmCalScheduleView.prototype.constructor = ZmCalScheduleView;

ZmCalScheduleView.prototype.toString =
function() {
	return "ZmCalScheduleView";
};

ZmCalScheduleView.prototype._apptMouseDownAction =
function(ev, apptEl) {
    appt = this.getItemFromElement(apptEl);
    if (appt.isAllDayEvent()) {
        return false;
    } else {
        return ZmCalBaseView.prototype._apptMouseDownAction.call(this, ev, apptEl, appt);
    }
}





/****************** NEW VERSION OF SCHEDULE VIEW *********************/
ZmCalNewScheduleView = function(parent, posStyle, controller, dropTgt) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_FB, 1, true);
    var app = appCtxt.getApp(ZmApp.CALENDAR);
    this._fbCache = new ZmFreeBusyCache(app);
};

ZmCalNewScheduleView.prototype = new ZmCalColView;
ZmCalNewScheduleView.prototype.constructor = ZmCalNewScheduleView;

ZmCalNewScheduleView.prototype.toString = 
function() {
	return "ZmCalNewScheduleView";
};

ZmCalNewScheduleView.ATTENDEES_METADATA = 'MD_SCHED_VIEW_ATTENDEES';

ZmCalNewScheduleView.prototype.getFreeBusyCache =
function() {
    return this._fbCache;
}

ZmCalNewScheduleView.prototype._createHtml =
function(abook) {
	DBG.println(AjxDebug.DBG2, "ZmCalNewScheduleView in _createHtml!");
    //TODO: Check and remove unnecessary instance vars
    this._days = {};
	this._columns = [];
	this._hours = {};
	this._layouts = [];
	this._allDayAppts = [];
    this._calendarOwners = {};

	this._headerYearId = Dwt.getNextId();
	this._yearHeadingDivId = Dwt.getNextId();
	this._yearAllDayDivId = Dwt.getNextId();
	this._leftAllDaySepDivId = Dwt.getNextId();
	this._leftApptSepDivId = Dwt.getNextId();

	this._allDayScrollDivId = Dwt.getNextId();
	this._allDayHeadingDivId = Dwt.getNextId();
	this._allDayApptScrollDivId = Dwt.getNextId();
	this._allDayDivId = Dwt.getNextId();
	this._hoursScrollDivId = Dwt.getNextId();
	this._bodyHourDivId = Dwt.getNextId();
	this._allDaySepDivId = Dwt.getNextId();
	this._bodyDivId = Dwt.getNextId();
	this._apptBodyDivId = Dwt.getNextId();
	this._newApptDivId = Dwt.getNextId();
	this._newAllDayApptDivId = Dwt.getNextId();
	this._timeSelectionDivId = Dwt.getNextId();


    this._unionHeadingDivId = Dwt.getNextId();
    this._unionAllDayDivId = Dwt.getNextId();
    this._unionHeadingSepDivId = Dwt.getNextId();
    this._unionGridScrollDivId = Dwt.getNextId();
    this._unionGridDivId = Dwt.getNextId();
    this._unionGridSepDivId = Dwt.getNextId();
    this._workingHrsFirstDivId = Dwt.getNextId();
    this._workingHrsSecondDivId = Dwt.getNextId();
	

	this._allDayRows = [];
    this._attendees = {};
    this._attendees[ZmCalBaseItem.PERSON] = {};
    this._attendees[ZmCalBaseItem.LOCATION] = {};
    this._attendees[ZmCalBaseItem.EQUIPMENT] = {};

    var html = new AjxBuffer();
    html.append("<div id='", this._bodyDivId, "' class=calendar_body style='position:absolute'>");
    html.append("<div id='", this._apptBodyDivId, "' style='width:100%;position:absolute;'>","</div>");
    html.append("</div>");
    this.getHtmlElement().innerHTML = html.toString();
    
};


ZmCalNewScheduleView.prototype._layout =
function(refreshApptLayout) {
	DBG.println(AjxDebug.DBG2, "ZmCalNewScheduleView in layout!");

    var sz = this.getSize();
	var width = sz.x;
	var height = sz.y;
    if (width == 0 || height == 0) { return; }
    this._setBounds(this._bodyDivId, 0, 0, width, height);
    this._setBounds(this._apptBodyDivId, 0, 0, width-Dwt.SCROLLBAR_WIDTH, height);
    //this._layoutAllDayAppts();
	
};

ZmCalNewScheduleView.prototype.getCalendarAccount =
function() {
	return null;
};

//mouse actions removed for now
ZmCalNewScheduleView.prototype._apptMouseDownAction =
function(ev, apptEl) {
    DBG.println(AjxDebug.DBG2,  "mouse listeners");    
};

ZmCalNewScheduleView.prototype._doubleClickAction =
function(ev, div) {
    this._mouseDownAction(ev, div, true);
};

ZmCalNewScheduleView.prototype._mouseDownAction =
function(ev, div, isDblClick) {
    DBG.println(AjxDebug.DBG2,  "mouse down action");
    var target = DwtUiEvent.getTarget(ev),
        targetId,
        tmp,
        index = {},
        apptDate,
        duration = 30,
        folderId = null,
        isAllDay = false;
    isDblClick = isDblClick || false;
    if(target && target.className.indexOf("ZmSchedulerGridDiv") != -1) {
        targetId = target.id;
        tmp = targetId.split("__");
        index.start = tmp[1] - 1;
        index.end = tmp[1];

        if(this._scheduleView) {
            this._scheduleView.setDateBorder(index);
            this._scheduleView._outlineAppt();
            if(!this._date) {
                this._date = new Date();
            }
            apptDate = new Date(this._date);
            apptDate.setHours(0, index.end*30, 0);

            this._timeSelectionEvent(apptDate, duration, isDblClick, isAllDay, folderId, ev.shiftKey);
        }
    }
};

ZmCalNewScheduleView.prototype.getOrganizer =
function() {
    var organizer = new ZmContact(null);
	organizer.initFromEmail(appCtxt.getUsername(), true);
    return organizer;
};
//overridden method - do not remove
ZmCalNewScheduleView.prototype.getRsvp =
function() {
    return false;
};
//overridden method - do not remove
ZmCalNewScheduleView.prototype._scrollToTime =
function(hour) {
};

ZmCalNewScheduleView.prototype.getDateInfo =
function(date) {
    var dateInfo = {},
        d = date || new Date();
	dateInfo.startDate = AjxDateUtil.simpleComputeDateStr(d);
	dateInfo.endDate = AjxDateUtil.simpleComputeDateStr(d);
	dateInfo.timezone = AjxDateFormat.format("z", d);
    dateInfo.isAllDay = true;
    return dateInfo;
};

ZmCalNewScheduleView.prototype._navDateChangeListener =
function(date) {
    this._date = date;
    this._scheduleView.changeDate(this.getDateInfo(date));
};
//overridden method - do not remove
ZmCalNewScheduleView.prototype._dateUpdate =
function(rangeChanged) {
};

ZmCalNewScheduleView.prototype.set =
function(list, skipMiniCalUpdate) {
    this._preSet();
    //Check added for sync issue - not sure if schedule view is ready by this time
    if(!this._scheduleView) {
        this._calNotRenderedList = list;
        return;
    }
    this.resetListItems(list);
    this.renderAppts(list);
};

ZmCalNewScheduleView.prototype.resetListItems =
function(list) {
    this._selectedItems.removeAll();
    var newList = list;
    if (list && (list == this._list)) {
        newList = list.clone();
    }
    this._resetList();
    this._list = newList;
};

ZmCalNewScheduleView.prototype.renderAppts =
function(list) {
    var timeRange = this.getTimeRange();
	if (list) {
		var size = list.size();
		DBG.println(AjxDebug.DBG2,"list.size:"+size);
		if (size != 0) {
            var showDeclined = appCtxt.get(ZmSetting.CAL_SHOW_DECLINED_MEETINGS);
            this._computeApptLayout();
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
				if (ao && ao.isInRange(timeRange.start, timeRange.end) &&
				    (showDeclined || (ao.ptst != ZmCalBaseItem.PSTATUS_DECLINED))) {
                    this.addAppt(ao);
				}
			}
		}
	}
};

ZmCalNewScheduleView.prototype.addAppt =
function(appt) {
    if(this._scheduleView) {
        var item = this._createItemHtml(appt),
            div = this._getDivForAppt(appt);

	    if (div) {
            div.appendChild(item);
        }
        this._scheduleView.colorAppt(appt, item);
    }
};

ZmCalNewScheduleView.prototype.removeAppt =
function(appt) {
    if(this._scheduleView) {
        var itemId = this._getItemId(appt),
            item = document.getElementById(itemId),
            div = this._getDivForAppt(appt);

	    if (div && item) {
            div.removeChild(item);
        }
    }
};

ZmCalNewScheduleView.prototype.removeApptByEmail =
function(email) {
    if(this._scheduleView) {
        for (var i = 0; i<this._list.size(); i++) {
            var appt = this._list.get(i);
            if(appt && appt.getFolder().getOwner() == email) {
                var itemId = this._getItemId(appt),
                    item = document.getElementById(itemId),
                    div = this._getDivForAppt(appt);

                if (div && item) {
                    div.removeChild(item);
                }
            }
        }
    }
};

ZmCalNewScheduleView.prototype.refreshAppts =
function() {
    this._selectedItems.removeAll();
    var newList = this._list.clone();
    this._resetList();
    this._list = newList;
    this.renderAppts(newList);
};

//overridden method - do not remove
ZmCalNewScheduleView.prototype._layoutAllDayAppts =
function() {
};

ZmCalNewScheduleView.prototype.getAtttendees =
function() {
    return this._attendees[ZmCalBaseItem.PERSON].getArray();
};

ZmCalNewScheduleView.prototype.getMetadataAttendees =
function(organizer) {
    var md = new ZmMetaData(organizer.getAccount());
    var callback = new AjxCallback(this, this.processMetadataAttendees);
    md.get('MD_SCHED_VIEW_ATTENDEES', null, callback);
};

ZmCalNewScheduleView.prototype.processMetadataAttendees =
function(metadataResponse) {
    var objAttendees = metadataResponse.getResponse().BatchResponse.GetMailboxMetadataResponse[0].meta[0]._attrs,
        emails = [],
        email,
        acct,
        i;

    for (email in objAttendees) {
        if(email && objAttendees[email]) {
            emails.push(objAttendees[email]);
        }
    }
    this._mdAttendees = AjxVector.fromArray(emails);
    for (i=0; i<this._mdAttendees.size(); i++) {
        acct = ZmApptViewHelper.getAttendeeFromItem(this._mdAttendees.get(i), ZmCalBaseItem.PERSON);
        this._attendees[ZmCalBaseItem.PERSON].add(acct, null, true);
    }

    AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);
    this._scheduleView = new ZmFreeBusySchedulerView(this, this._attendees, this._controller, this.getDateInfo());
    this._scheduleView.setComposeMode(false);
    this._scheduleView.setVisible(true);
    this._scheduleView.showMe();
    this._scheduleView.reparentHtmlElement(this._apptBodyDivId);

    //Called to handle the sync issue
    this.resetListItems(this._calNotRenderedList);
    this.renderAppts(this._calNotRenderedList);
    delete this._calNotRenderedList;
};

ZmCalNewScheduleView.prototype.setMetadataAttendees =
function(organizer, email) {
    if(!organizer) {
        organizer = this.getOrganizer();
    }
    if (email instanceof Array) {
        email = email.join(',');
    }
    var md = new ZmMetaData(organizer.getAccount());
    this._mdAttendees.add(email, null, true);
    return md.set(ZmCalNewScheduleView.ATTENDEES_METADATA, this._mdAttendees.getArray());
};

ZmCalNewScheduleView.prototype.removeMetadataAttendees =
function(organizer, email) {
    if(!organizer) {
        organizer = this.getOrganizer();
    }
    if (email instanceof Array) {
        email = email.join(',');
    }
    var md = new ZmMetaData(organizer.getAccount());
    this._mdAttendees.remove(email, null, true);
    return md.set(ZmCalNewScheduleView.ATTENDEES_METADATA, this._mdAttendees.getArray());
};

ZmCalNewScheduleView.prototype._resetCalendarData =
function() {
    var i,
        tb,
        acct,
        acctEmail,
        strAttendees,
        mdAttendees,
        organizer = this.getOrganizer();
	this._calendars = this._controller.getCheckedCalendars();
	this._calendars.sort(ZmCalendar.sortCompare);
	this._folderIdToColIndex = {};
	this._columns = [];
	this._numCalendars = this._calendars.length;
    this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();

    for (i=0; i<this._numCalendars; i++) {
        acctEmail = this._calendars[i].getOwner();
        if(organizer.getEmail() != acctEmail) {
            //if not organizer add to the attendee list
            acct = ZmApptViewHelper.getAttendeeFromItem(acctEmail, ZmCalBaseItem.PERSON);
            this._attendees[ZmCalBaseItem.PERSON].add(acct, null, true);
        }
    }

    if(this._scheduleView) {
        //this._attendees[ZmCalBaseItem.PERSON] = this._scheduleView.getAttendees();

        for (i=0; i<this._mdAttendees.size(); i++) {
            acct = ZmApptViewHelper.getAttendeeFromItem(this._mdAttendees.get(i), ZmCalBaseItem.PERSON);
            this._attendees[ZmCalBaseItem.PERSON].add(acct, null, true);
        }

        this._scheduleView.cleanup();
        this._scheduleView.setComposeMode(false);
        this._scheduleView.set(this.getDate(), organizer, this._attendees);
        this._scheduleView.enablePartcipantStatusColumn(true);
    }
    else {
        this._mdAttendees = new AjxVector();
        this.getMetadataAttendees(organizer);        
    }    
};