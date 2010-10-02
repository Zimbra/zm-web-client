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
 * Creates a left pane view for suggesting time/locations
 * @constructor
 * @class
 * This class displays suggested free time/location for sending invites to attendees
 *
 *  @author Sathishkumar Sugumaran
 *
 * @param parent			[ZmApptComposeView]			the appt compose view
 * @param controller		[ZmApptComposeController]	the appt compose controller
 */
ZmScheduleAssistantView = function(parent, controller, apptEditView) {

	DwtComposite.call(this, {parent: parent, posStyle: DwtControl.ABSOLUTE_STYLE});

	this._controller = controller;
	this._editView = apptEditView;

	this._rendered = false;
	this._kbMgr = appCtxt.getKeyboardMgr();

    this.type = ZmCalBaseItem.LOCATION;
    this._attendees = [];
    this._workingHours = {};
    this._fbStat = new AjxVector();
    this._fbStatMap = {};
    this._schedule = {};

    this.initialize();
};

ZmScheduleAssistantView.prototype = new DwtComposite;
ZmScheduleAssistantView.prototype.constructor = ZmScheduleAssistantView;

ZmScheduleAssistantView.ATTRS = {};
ZmScheduleAssistantView.ATTRS[ZmCalBaseItem.LOCATION] =
	["fullName", "email", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "notes", "zimbraCalResType"];

ZmScheduleAssistantView.prototype.initialize =
function() {
    var appViewMgr = appCtxt.getAppViewMgr();
    if(appViewMgr.getCurrentViewComponent(ZmAppViewMgr.C_TREE_FOOTER)) {
        appViewMgr.showTreeFooter(false);
    }
    this._createWidgets();
};

ZmScheduleAssistantView.prototype.cleanup =
function() {
    this._attendees = [];
    this._timeFrame = null;
    this._schedule = {};
};

ZmScheduleAssistantView.prototype._createWidgets =
function() {
    this._createMiniCalendar();

    var id = this.getHTMLElId();

    this._customizeBtn = new DwtButton({parent:this, className: 'ZButton SuggestBtn'});
    this._customizeBtn.setImage("Preferences");    
    this._customizeBtn.setSize('100%', Dwt.DEFAULT);
    this._customizeBtn.addSelectionListener(new AjxListener(this, this._prefListener));
    this._customizeBtn.setText(ZmMsg.customizeSuggestions);

    this._timeSuggestions = new ZmTimeSuggestionView(this, this._controller, this._editView);

    var prefDlg = this.getPrefDialog();
    prefDlg.setCallback(new AjxCallback(this, this._prefChangeListener));
    prefDlg.getSearchPreference(appCtxt.getActiveAccount());
};

ZmScheduleAssistantView.prototype._setSuggestionLabel =
function(date) {

    if(!this._customizeBtn) return;

    date = date || new Date();
    var dateStr = AjxDateUtil.computeDateStrNoYear(date);
    var dateLabel =  AjxMessageFormat.format(ZmMsg.suggestTimeLabel, [dateStr]);
    this._customizeBtn.setText(dateLabel);    
};

ZmScheduleAssistantView.prototype._createMiniCalendar =
function(date) {
	date = date ? date : new Date();

	var firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

    //todo: need to use server setting to decide the weekno standard
    var serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    var useISO8601WeekNo = (serverId && serverId.indexOf("Europe")==0 && serverId != "Europe/London");

	this._miniCalendar = new DwtCalendar({parent: this, posStyle:DwtControl.RELATIVE_STYLE,
										  firstDayOfWeek: firstDayOfWeek, showWeekNumber: appCtxt.get(ZmSetting.CAL_SHOW_CALENDAR_WEEK), useISO8601WeekNo: useISO8601WeekNo});
	this._miniCalendar.setDate(date);
	this._miniCalendar.setScrollStyle(Dwt.CLIP);
	this._miniCalendar.addSelectionListener(new AjxListener(this, this._miniCalSelectionListener));
	this._miniCalendar.addDateRangeListener(new AjxListener(this, this._miniCalDateRangeListener));
	this._miniCalendar.setMouseOverDayCallback(new AjxCallback(this, this._miniCalMouseOverDayCallback));
	this._miniCalendar.setMouseOutDayCallback(new AjxCallback(this, this._miniCalMouseOutDayCallback));

	var workingWeek = [];
	for (var i = 0; i < 7; i++) {
		var d = (i + firstDayOfWeek) % 7;
		workingWeek[i] = (d > 0 && d < 6);
	}
	this._miniCalendar.setWorkingWeek(workingWeek);

	var app = appCtxt.getApp(ZmApp.CALENDAR);
	var show = app._active || appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL);
	this._miniCalendar.setSkipNotifyOnPage(show && !app._active);
	if (!app._active) {
		this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
	}
};

ZmScheduleAssistantView.prototype._suggestionListener =
function(ev) {
    this.suggestAction(true);
};

ZmScheduleAssistantView.prototype._prefListener =
function(ev) {
    var dialog = this.getPrefDialog();
    dialog.popup(this._editView.getCalendarAccount());
};

ZmScheduleAssistantView.prototype._prefChangeListener =
function() {
    this._resources = null;
    this.suggestAction(true);
};

ZmScheduleAssistantView.prototype.getPrefDialog =
function() {
    if(!this._prefDialog) {
        this._prefDialog = new ZmTimeSuggestionPrefDialog(appCtxt.getShell());        
    }
    return this._prefDialog;
};

ZmScheduleAssistantView.prototype.suggestAction =
function(focusOnSuggestion) {

    var params = {
        itemsById: {},
        itemsByIdx: [],
        focus: focusOnSuggestion
    };

    this._timeSuggestions.setLoadingHtml();
    if(!this._resources) {
        this.searchCalendarResources(new AjxCallback(this, this._findFreeBusyInfo, [params]));
    }else {
        this._findFreeBusyInfo(params);
    }    
};

ZmScheduleAssistantView.prototype._getTimeFrame =
function() {
	var di = {};
	ZmApptViewHelper.getDateInfo(this._editView, di);
	var startDate = this._date || AjxDateUtil.simpleParseDateStr(di.startDate);
    var endDate = new Date(startDate);
    endDate.setHours(23, 59, 0, 0);
    startDate.setHours(0, 0, 0, 0);
	return {start:startDate, end:endDate};
};

ZmScheduleAssistantView.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
        var date = ev.detail;
        this.reset(date, this._attendees, true);
        //set edit view start/end date
        var duration = this._editView.getDuration();
        var endDate = new Date(date.getTime() + duration);
        this._editView.setDate(date, endDate, true);
	}
};

ZmScheduleAssistantView.prototype.updateTime =
function(clearSelection) {
    if(clearSelection) this._date = null;
    var tf = this._getTimeFrame();
    this._miniCalendar.setDate(tf.start, true);
    this.reset(tf.start, this._attendees);    
};

ZmScheduleAssistantView.prototype.addOrganizer =
function() {
    //include organizer in the scheduler suggestions
    var organizer = this._editView.getOrganizer();
    this._attendees.push(organizer.getEmail());
};

ZmScheduleAssistantView.prototype.updateAttendees =
function(attendees) {

    if(attendees instanceof AjxVector) attendees = attendees.getArray();

    this._attendees = [];

    this.addOrganizer();

    var attendee;
    for (var i = attendees.length; --i >= 0;) {
            attendee = attendees[i].getEmail();
            if (attendee instanceof Array) {
                attendee = attendee[i][0];
            }
            this._attendees.push(attendee);
    }
    this.reset(this._date, this._attendees, true);
};

ZmScheduleAssistantView.prototype.updateAttendee =
function(attendee) {

    var email = (typeof attendee == 'string') ? attendee : attendee.getEmail();
    if(this._attendees.length == 0) {
        this.addOrganizer();
        this._attendees.push(email);
    }else {
        var found = false;
        for (var i = this._attendees.length; --i >= 0;) {
            if(email == this._attendees[i]) {
                found = true;
                break;
            }
        }
        if(!found) this._attendees.push(email);
    }

    this.reset(this._date, this._attendees, true);
};

ZmScheduleAssistantView.prototype.reset =
function(date, attendees, forceRefresh) {
    this.resizeTimeSuggestions();
    var newKey = this.getFormKey(date, attendees);
    this._date = date;
    if(newKey != this._key) {
        if(this._timeSuggestions) this._timeSuggestions.removeAll();
        if(forceRefresh) this.suggestAction(false);
    }
};

ZmScheduleAssistantView.prototype._miniCalDateRangeListener =
function(ev) {
    //todo: change scheduler suggestions
};

ZmScheduleAssistantView.prototype._miniCalMouseOverDayCallback =
function(control, day) {
	this._currentMouseOverDay = day;
    //todo: add code if tooltip needs to be supported
};

ZmScheduleAssistantView.prototype._miniCalMouseOutDayCallback =
function(control) {
	this._currentMouseOverDay = null;
};


//smart scheduler suggestion modules

ZmScheduleAssistantView.prototype.searchCalendarResources =
function(callback, sortBy) {
	var currAcct = this._editView.getCalendarAccount();
	var value = (this.type == ZmCalBaseItem.LOCATION) ? "Location" : "Equipment";

    var conds = [{attr: "zimbraCalResType", op: "eq", value: value}];
    if(this._prefDialog) {
        for (var i = 0; i < ZmTimeSuggestionPrefDialog.PREF_FIELDS.length; i++) {
            var sf = ZmTimeSuggestionPrefDialog.PREF_FIELDS[i];
            if(sf == "non_working_hrs") continue;
            value = AjxStringUtil.trim(this._prefDialog.getPreference(sf));
            if (value.length) {
                var attr = ZmTimeSuggestionPrefDialog.SF_ATTR[sf];
                var op = ZmTimeSuggestionPrefDialog.SF_OP[sf] ? ZmTimeSuggestionPrefDialog.SF_OP[sf] : "has";
                conds.push({attr: attr, op: op, value: value});
            }
        }
    }
    
	var params = {
		sortBy: sortBy,
		offset: 0,
		limit: ZmContactsApp.SEARCHFOR_MAX,
		conds: conds,
		attrs: ZmScheduleAssistantView.ATTRS[this.type],
		accountName: appCtxt.isOffline ? currAcct.name : null
	};
	var search = new ZmSearch(params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchCalendarResources, callback)});
};

ZmScheduleAssistantView.prototype._handleResponseSearchCalendarResources =
function(callback, result) {
	var resp = result.getResponse();
	var items = resp.getResults(ZmItem.RESOURCE).getVector();
    this._resources = (items instanceof AjxVector) ? items.getArray() : (items instanceof Array) ? items : [items];
    if(callback) callback.run();
};

ZmScheduleAssistantView.prototype._findFreeBusyInfo =
function(params) {

    var currAcct = this._editView.getCalendarAccount();
	// Bug: 48189 Don't send GetFreeBusyRequest for non-ZCS accounts.
	if (appCtxt.isOffline && (!currAcct.isZimbraAccount || currAcct.isMain)) {
        //todo: avoid showing smart scheduler button for non-ZCS accounts - offline client
        return;
	}

	var tf = this._timeFrame = this._getTimeFrame();
	var list = this._resources;
	var emails = [];

    params.itemsById = {};
    params.itemsByIdx = [];
    params.timeFrame = tf;

	for (var i = list.length; --i >= 0;) {
		var item = list[i];
		emails[i] = item.getEmail();

		// bug: 30824 - Don't list all addresses/aliases of a resource in
		// GetFreeBusyRequest.  One should suffice.
		if (emails[i] instanceof Array) {
			emails[i] = emails[i][0];
		}

        params.itemsByIdx.push(emails[i]);
        item._itemIndex = params.itemsByIdx.length-1;
		params.itemsById[emails[i]] = item;
	}

    var attendees = this._editView.getAttendees(ZmCalBaseItem.PERSON).getArray();
    var attendee;
    this._attendees = [];

    //include organizer in the scheduler suggestions
    var organizer = this._editView.getOrganizer();
    this._addAttendee(organizer, params, emails);

    for (var i = attendees.length; --i >= 0;) {        
            //ignore optional attendees while suggesting
            if(attendees[i].getParticipantRole() == ZmCalItem.ROLE_OPTIONAL) continue;
            this._addAttendee(attendees[i], params, emails);
    }

    this._key = this.getFormKey(tf.start, this._attendees);

    if(this._attendees.length == 0) {
        this.resizeTimeSuggestions();
        this._timeSuggestions.setNoResultsHtml();
        return;
    }

	if (this._freeBusyRequest) {
		appCtxt.getRequestMgr().cancelRequest(this._freeBusyRequest, null, true);
	}

    var requiredEmails = [], freeBusyKey;
    for (var i = emails.length; --i >= 0;) {
        freeBusyKey = this.getFreeBusyKey(tf, emails[i]);
        if(!this._schedule[freeBusyKey]) requiredEmails.push(emails[i]);
    }

    if(requiredEmails.length) {
	    this._freeBusyRequest = this._controller.getFreeBusyInfo(tf.start.getTime(),
															 tf.end.getTime(),
															 requiredEmails.join(","),
															 new AjxCallback(this, this._handleResponseFreeBusy, [params]),
															 null,
															 true);
    }else {
        this.getWorkingHours(params);
    }
};

ZmScheduleAssistantView.prototype._addAttendee =
function(attendeeObj, params, emails) {
    var attendee = attendeeObj.getEmail();
    if (attendee instanceof Array) {
        attendee = attendeeObj[0];
    }
    params.itemsByIdx.push(attendee);
    attendeeObj._itemIndex = params.itemsByIdx.length-1;
    params.itemsById[attendee] = attendeeObj;
    emails.push(attendee);
    this._attendees.push(attendee);
};


ZmScheduleAssistantView.prototype.getFormKey =
function(startDate, attendees) {
    return startDate.getTime() + "-" + attendees.join(",");    
};

ZmScheduleAssistantView.prototype._handleResponseFreeBusy =
function(params, result) {

    this._freeBusyRequest = null;

    //this._schedule = {};

    var freeBusyKey;
	var args = result.getResponse().GetFreeBusyResponse.usr;
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        freeBusyKey = this.getFreeBusyKey(params.timeFrame, id);
        this._schedule[freeBusyKey] = usr;
    };

    this.getWorkingHours(params);
};

ZmScheduleAssistantView.prototype.clearCache =
function() {
    this._organizerEmail = null;
    this._workingHours = {};    
};

ZmScheduleAssistantView.prototype.getFreeBusyKey =
function(timeFrame, id) {
    return timeFrame.start.getTime() + "-" + timeFrame.end.getTime() + "-" + id;
};

ZmScheduleAssistantView.prototype.getWorkingHours =
function(params) {
    if (this._workingHoursRequest) {
        appCtxt.getRequestMgr().cancelRequest(this._workingHoursRequest, null, true);
    }

    var includeNonWorkingHours = params.includeNonWorkingHours = this._prefDialog ? (this._prefDialog.getPreference("non_working_hrs") == 'true') : false;
    if(includeNonWorkingHours) {
         this.suggestTimeSlots(params);
         return;   
    }

    var organizer = this._editView.getOrganizer();
    this._organizerEmail = organizer.getEmail();

    if(this._workingHoursKey == this.getWorkingHoursKey()) {
        this.suggestTimeSlots(params);
    }else {
        this._workingHoursKey = this.getWorkingHoursKey();
        this._workingHoursRequest = this._controller.getWorkingInfo(this._timeFrame.start.getTime(),
                                                             this._timeFrame.end.getTime(),
                                                             this._organizerEmail,
                                                             new AjxCallback(this, this._handleWorkingHoursResponse, [params]),
                                                             new AjxCallback(this, this._handleWorkingHoursError, [params]),
                                                             true);
    }
};

ZmScheduleAssistantView.prototype._handleWorkingHoursResponse =
function(params, result) {

    this._workingHoursRequest = null;
    this._workingHours = {};
    
    var args = result.getResponse().GetWorkingHoursResponse.usr;
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        this._workingHours[id] = usr;
    };

    this.suggestTimeSlots(params);
};

ZmScheduleAssistantView.prototype._handleWorkingHoursError =
function(params, result) {

    this._workingHoursRequest = null;
    this._workingHours = {};
    this.suggestTimeSlots(params);

};

ZmScheduleAssistantView.prototype.suggestTimeSlots =
function(params) {

    var startDate = this._timeFrame.start;
    startDate.setHours(0, 0, 0, 0);
    var startTime = startDate.getTime();
    var endDate = new Date(startTime);
    endDate.setHours(23, 59, 0, 0);
    var endTime = endDate.getTime();
    var duration = this._editView.getDuration();

    this._fbStat = new AjxVector();
    this._fbStatMap = {};
    this._totalUsers = this._attendees.length;
    this._totalLocations =  this._resources.length;

    while(startTime < endTime) {
        this.computeAvailability(startTime, startTime + duration, params);
        startTime += AjxDateUtil.MSEC_PER_HALF_HOUR;
    }

    this._fbStat.sort(ZmScheduleAssistantView._slotComparator);
    DBG.dumpObj(this._fbStat);
    this.renderSuggestions(params);
};

ZmScheduleAssistantView.prototype.computeAvailability =
function(startTime, endTime, params) {

    var key = this.getKey(startTime, endTime);
    var fbInfo;

    if(this._fbStatMap[key]) {
        fbInfo = this._fbStatMap[key];
    }else {
        fbInfo = {
            startTime: startTime,
            endTime: endTime,
            availableUsers: 0,
            availableLocations: 0,
            attendees: [],
            locations: []
        };
    }

    var freeBusyKey;
    for(var i = this._attendees.length; --i >= 0;) {
        var attendee = this._attendees[i];
        freeBusyKey = this.getFreeBusyKey(params.timeFrame, attendee);         
        var sched = this._schedule[freeBusyKey];

        //show suggestions only in the organizer's working hours.
        var isFree = params.includeNonWorkingHours ? true : this.isUnderWorkingHour(this._organizerEmail, startTime, endTime);

        //ignore time slots for non-working hours of this user
        if(!isFree) continue;
        
        if(sched.b) isFree = isFree && this.isBooked(sched.b, startTime, endTime);
        if(sched.t) isFree = isFree && this.isBooked(sched.t, startTime, endTime);
        if(sched.u) isFree = isFree && this.isBooked(sched.u, startTime, endTime);
        var key = startTime + "-" + endTime;
        
        if(isFree) {
            fbInfo.attendees.push(params.itemsById[attendee]._itemIndex);
            fbInfo.availableUsers++;
        }
    }

    var list = this._resources;
	for (var i = list.length; --i >= 0;) {
		var item = list[i];
		var resource = item.getEmail();

		if (resource instanceof Array) {
			resource = resource[0];
		}
        freeBusyKey = this.getFreeBusyKey(params.timeFrame, resource);
        var sched = this._schedule[freeBusyKey];
        var isFree = true;
        if(sched.b) isFree = isFree && this.isBooked(sched.b, startTime, endTime);
        if(sched.t) isFree = isFree && this.isBooked(sched.t, startTime, endTime);
        if(sched.u) isFree = isFree && this.isBooked(sched.u, startTime, endTime);
        
        if(isFree) {
            fbInfo.locations.push(params.itemsById[resource]._itemIndex);
            fbInfo.availableLocations++;
        }
	}

    if(fbInfo.availableUsers > 0) {
        this._fbStat.add(fbInfo);
        this._fbStatMap[key] = fbInfo;
    }
};

ZmScheduleAssistantView._slotComparator =
function(slot1, slot2) {
	if(slot1.availableUsers < slot2.availableUsers) {
        return 1;
    }else if(slot1.availableUsers > slot2.availableUsers) {
        return -1;
    }else {
        return slot1.availableLocations < slot2.availableLocations ? 1 : (slot1.availableLocations > slot2.availableLocations ? -1 : 0);
    }
};

ZmScheduleAssistantView.prototype.getKey =
function(startTime, endTime) {
    return startTime + "-" + endTime;
};

ZmScheduleAssistantView.prototype.getWorkingHoursKey =
function() {
    return this._timeFrame ? this._timeFrame.start.getTime() + "-" + this._timeFrame.end.getTime() + "-" + this._organizerEmail : ""; 
};

ZmScheduleAssistantView.prototype.isBooked =
function(slots, startTime, endTime) {
    for (var i = 0; i < slots.length; i++) {
        var startConflict = startTime >= slots[i].s && startTime < slots[i].e;
        var endConflict = endTime >= slots[i].s && endTime < slots[i].e;
        if(startConflict || endConflict) {
            return false;
        }
    };
    return true;
};

ZmScheduleAssistantView.prototype.isUnderWorkingHour =
function(attendee, startTime, endTime) {

    var workingHours = this._workingHours[attendee];

    //if working hours could not be retrieved consider all time slots for suggestion
    if(!workingHours || workingHours.n) return true;

    var slots = workingHours.f;

    //working hours are indicated as free slots
    if(!slots) return false;

    for (var i = 0; i < slots.length; i++) {
        if(startTime >= slots[i].s && endTime <= slots[i].e) {
            return true;
        }
    };
    return false;
};

ZmScheduleAssistantView.prototype.renderSuggestions =
function(params) {
    this.resizeTimeSuggestions();
    this._timeSuggestions.set(this._fbStat, this._totalUsers, this._totalLocations, params.itemsById, params.itemsByIdx);
    if(params.focus) this._timeSuggestions.focus();
};

ZmScheduleAssistantView.prototype.resizeTimeSuggestions =
function() {

    if(!this._timeSuggestions) return;

    var calSize = Dwt.getSize(this._miniCalendar.getHtmlElement());
    var btnSize = Dwt.getSize(this._customizeBtn.getHtmlElement());
    var contSize = Dwt.getSize(this.getHtmlElement());
    var newHeight = contSize.y - btnSize.y - calSize.y -2;
    this._timeSuggestions.setSize('100%', newHeight);
};