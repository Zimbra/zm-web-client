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

ZmCalScheduleView = function(parent, posStyle, controller, dropTgt) {
	ZmCalColView.call(this, parent, posStyle, controller, dropTgt, ZmId.VIEW_CAL_SCHEDULE, 1, true);
};

ZmCalScheduleView.prototype = new ZmCalColView;
ZmCalScheduleView.prototype.constructor = ZmCalScheduleView;

ZmCalScheduleView.prototype.toString = 
function() {
	return "ZmCalScheduleView";
};

ZmCalScheduleView.ATTENDEES_METADATA = 'MD_SCHED_VIEW_ATTENDEES';


ZmCalScheduleView.prototype._createHtml =
function(abook) {
	DBG.println(AjxDebug.DBG2, "ZmCalScheduleView in _createHtml!");
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
    html.append("<div id='", this._apptBodyDivId, "' style='width:100%;position:absolute;'>","</div>");
    this.getHtmlElement().innerHTML = html.toString();
    
};


ZmCalScheduleView.prototype._layout =
function(refreshApptLayout) {
	DBG.println(AjxDebug.DBG2, "ZmCalColView in layout!");
    //this._layoutAllDayAppts();
	
};
//mouse actions removed for now
ZmCalScheduleView.prototype._apptMouseDownAction =
function(ev, apptEl) {
    DBG.println(AjxDebug.DBG2,  "mouse listeners");    
};
//mouse actions removed for now
ZmCalColView.prototype._mouseDownAction =
function(ev, div) {
    DBG.println(AjxDebug.DBG2,  "mouse down action");
    var target = DwtUiEvent.getTarget(ev),
        targetId,
        tmp,
        index = {};
    if(target) {
        targetId = target.id;
        tmp = targetId.split("__");
        index.start = tmp[1] - 1;
        index.end = tmp[1];

        if(this._scheduleView) {
            this._scheduleView.setDateBorder(index);
            this._scheduleView._outlineAppt();
        }
    }
};



ZmCalScheduleView.prototype.getOrganizer =
function() {
    var organizer = new ZmContact(null);
	organizer.initFromEmail(appCtxt.getUsername(), true);
    return organizer;
};
//overridden method - do not remove
ZmCalScheduleView.prototype.getRsvp =
function() {
    return false;
};
//overridden method - do not remove
ZmCalScheduleView.prototype._scrollToTime =
function(hour) {
};

ZmCalScheduleView.prototype.getDateInfo =
function(date) {
    var dateInfo = {},
        d = date || new Date();
	dateInfo.startDate = AjxDateFormat.format("M/d/yyyy", d);
	dateInfo.endDate = AjxDateFormat.format("M/d/yyyy", d);
	dateInfo.timezone = AjxDateFormat.format("z", d);
    return dateInfo;
};

ZmCalScheduleView.prototype._navDateChangeListener =
function(date) {
    this._scheduleView.changeDate(this.getDateInfo(date));
};
//overridden method - do not remove
ZmCalScheduleView.prototype._dateUpdate =
function(rangeChanged) {
};

ZmCalScheduleView.prototype.set =
function(list, skipMiniCalUpdate) {
    this._preSet();
	this._selectedItems.removeAll();
    var newList = list;
    if (list && (list == this._list)) {
        newList = list.clone();
    }
    this._resetList();
    this._list = newList;
    var timeRange = this.getTimeRange();
	if (list) {
		var size = list.size();
		DBG.println(AjxDebug.DBG2,"list.size:"+size);
		if (size != 0) {
			this._computeApptLayout();
			for (var i=0; i < size; i++) {
				var ao = list.get(i);
				if (ao && ao.isInRange(timeRange.start, timeRange.end)) {
					this.addAppt(ao);
				}
			}
		}
	}    
};

ZmCalScheduleView.prototype.addAppt =
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

//overridden method - do not remove
ZmCalScheduleView.prototype._layoutAllDayAppts =
function() {
};

ZmCalScheduleView.prototype.getMetadataAttendees =
function(organizer) {
    var md = new ZmMetaData(organizer.getAccount());
    var callback = new AjxCallback(this, this.processMetadataAttendees);
    md.get('MD_SCHED_VIEW_ATTENDEES', null, callback);
};

ZmCalScheduleView.prototype.processMetadataAttendees =
function(metadataResponse) {
    var objAttendees = metadataResponse.getResponse().BatchResponse.GetMailboxMetadataResponse[0].meta[0]._attrs,
        emails = [],
        email,
        acct,
        tb,
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
    tb = this._controller._navToolBar[ZmId.VIEW_CAL];
    tb.reparentHtmlElement(this._scheduleView._navToolbarContainerId);
};

ZmCalScheduleView.prototype.setMetadataAttendees =
function(organizer, email) {
    if(!organizer) {
        organizer = this.getOrganizer();
    }
    if (email instanceof Array) {
        email = email.join(',');
    }
    var md = new ZmMetaData(organizer.getAccount());
    this._mdAttendees.add(email, null, true);
    return md.set(ZmCalScheduleView.ATTENDEES_METADATA, this._mdAttendees.getArray());
};

ZmCalScheduleView.prototype.removeMetadataAttendees =
function(organizer, email) {
    if(!organizer) {
        organizer = this.getOrganizer();
    }
    if (email instanceof Array) {
        email = email.join(',');
    }
    var md = new ZmMetaData(organizer.getAccount());
    this._mdAttendees.remove(email, null, true);
    return md.set(ZmCalScheduleView.ATTENDEES_METADATA, this._mdAttendees.getArray());
};

ZmCalScheduleView.prototype._resetCalendarData =
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