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
ZmScheduleAssistantView = function(parent, controller, apptEditView, closeCallback) {
	DwtComposite.call(this, {parent: parent, posStyle: DwtControl.RELATIVE_STYLE, className: "ZmScheduleAssistantView"});

	this._controller = controller;
	this._editView   = apptEditView;
    this._prefDialog = apptEditView.getPrefDialog();
    this._closeCallback  = closeCallback;

    this._fbCache = controller.getApp().getFreeBusyCache();

	this._rendered = false;
	this._kbMgr = appCtxt.getKeyboardMgr();

    this.type = ZmCalBaseItem.LOCATION;
    this._attendees = [];
    this._resources = [];
    this._workingHours = {};
    this._fbStat = new AjxVector();
    this._fbStatMap = {};
    this._schedule = {};

    this._enabled = false;

    this.initialize();
};

ZmScheduleAssistantView.prototype = new DwtComposite;
ZmScheduleAssistantView.prototype.constructor = ZmScheduleAssistantView;


ZmScheduleAssistantView.prototype.toString =
function() {
	return "ZmScheduleAssistantView";
}

ZmScheduleAssistantView.ATTRS = {};
ZmScheduleAssistantView.ATTRS[ZmCalBaseItem.LOCATION] =
	["fullName", "email", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "notes", "zimbraCalResType"];

ZmScheduleAssistantView.prototype.initialize =
function() {
    this._createHTML();
    this._createWidgets();
};

ZmScheduleAssistantView.prototype.cleanup =
function() {
    this._attendees = [];
    this._schedule = {};

    this._manualOverrideFlag = false;
    if(this._currentSuggestions) this._currentSuggestions.removeAll();
    if(this._miniCalendar) this.clearMiniCal();

};

ZmScheduleAssistantView.prototype._createHTML =
function() {
	var subs = {
		id: this._htmlElId
	};

	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#SuggestionsView", subs);
};


ZmScheduleAssistantView.prototype._createWidgets =
function() {

    this._closeId = this._htmlElId + "_suggest_close";
    this._closeBtn = document.getElementById(this._closeId);
    Dwt.setHandler(this._closeBtn, DwtEvent.ONCLICK, this._closeListener.bind(this));

    this._createMiniCalendar();
    this._suggestMinicalId = this._htmlElId + "_suggest_minical"
    this._suggestMinical   = document.getElementById(this._suggestMinicalId);

    var id = this.getHTMLElId();
    this._suggestionContainerElId = this._htmlElId + "_suggest_view"
    this._suggestionsContainer = document.getElementById(this._suggestionContainerElId);

    this._suggestionNameElId = this._htmlElId + "_suggestion_name"
    this._suggestionName = document.getElementById(this._suggestionNameElId);

    this._timeSuggestions = new ZmTimeSuggestionView(this, this._controller, this._editView);
    this._timeSuggestions.reparentHtmlElement(this._suggestionsContainer);
    this._suggestTime = true;
    this._currentSuggestions = this._timeSuggestions;

    this._locationSuggestions = new ZmLocationSuggestionView(this, this._controller, this._editView);
    this._locationSuggestions.reparentHtmlElement(this._suggestionsContainer);

    this._optionsId = this._htmlElId + "_suggest_options";
    this._options  = document.getElementById(this._optionsId);
    this._optionsBtnId = this._htmlElId + "_suggest_options_image";
    this._optionsBtn = document.getElementById(this._optionsBtnId);
    Dwt.setHandler(this._optionsBtn, DwtEvent.ONCLICK, this._prefListener.bind(this));
};

ZmScheduleAssistantView.prototype._createMiniCalendar =
function(date) {
	date = date ? date : new Date();

	var firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

    //todo: need to use server setting to decide the weekno standard
    var serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    var useISO8601WeekNo = (serverId && serverId.indexOf("Europe")==0 && serverId != "Europe/London");

	this._miniCalendar = new ZmMiniCalendar({parent: this, posStyle:DwtControl.RELATIVE_STYLE,
	    firstDayOfWeek: firstDayOfWeek, showWeekNumber: appCtxt.get(ZmSetting.CAL_SHOW_CALENDAR_WEEK),
        useISO8601WeekNo: useISO8601WeekNo});
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

    this._miniCalendar.reparentHtmlElement(this._htmlElId + "_suggest_minical");
};

ZmScheduleAssistantView.prototype.clearResources =
function() {
    this._resources = [];
};


ZmScheduleAssistantView.prototype._prefListener =
function(ev) {
    this._prefDialog.popup(this._editView.getCalendarAccount());
};


ZmScheduleAssistantView.prototype._closeListener =
function(ev) {
    var parentEl = this.getHtmlElement().parentNode;
    Dwt.setVisible(parentEl, false);
    this._enabled = false;
    if (this._closeCallback) {
        this._closeCallback.run();
    }
};


ZmScheduleAssistantView.prototype.show =
function(suggestTime) {
    this._enabled = true;

    this._suggestTime = suggestTime;
    if (this._suggestTime) {
        Dwt.setInnerHtml(this._suggestionName, ZmMsg.suggestedTimes);
        this._locationSuggestions.setVisible(false);
        this._timeSuggestions.setVisible(true);
        Dwt.setVisible(this._suggestMinical, true);
        this._currentSuggestions = this._timeSuggestions;
    } else {
        Dwt.setInnerHtml(this._suggestionName, ZmMsg.suggestedLocations);
        this._timeSuggestions.setVisible(false);
        Dwt.setVisible(this._suggestMinical, false);
        this._locationSuggestions.setVisible(true);
        this._currentSuggestions = this._locationSuggestions;
    }
};

ZmScheduleAssistantView.prototype.suggestAction =
function(focusOnSuggestion, showAllSuggestions) {

    if(appCtxt.isOffline && !appCtxt.isZDOnline()) { return; }

    var params = {
        items: [],        
        itemIndex: {},
        focus: focusOnSuggestion,
        showOnlyGreenSuggestions: !showAllSuggestions
    };

    this._currentSuggestions.setLoadingHtml();
    if(this._resources.length == 0 || !this._suggestTime) {
        if(this._resources.length == 0) {
            if (this._suggestTime) {
                this.searchCalendarResources(new AjxCallback(this, this._findFreeBusyInfo, [params]));
            } else {
                this.searchCalendarResources(new AjxCallback(this, this.suggestLocations, [params]));
            }
        } else {
            this.suggestLocations(params);
        }

    } else {
        this._findFreeBusyInfo(params);
    }    
};



ZmScheduleAssistantView.prototype._getTimeFrame =
function() {
	var di = {};
	ZmApptViewHelper.getDateInfo(this._editView, di);
	var startDate = this._date || AjxDateUtil.simpleParseDateStr(di.startDate);
    var endDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setTime(startDate.getTime() + AjxDateUtil.MSEC_PER_DAY);
	return {start:startDate, end:endDate};
};

ZmScheduleAssistantView.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof ZmMiniCalendar) {
        var date = ev.detail;

        // *** Separate Suggestions pane, only invoked to show suggestions, so changing
        //     force refresh to True
        this.reset(date, this._attendees, true);

        //set edit view start/end date
        var duration = this._editView.getDurationInfo().duration;
        var endDate = new Date(date.getTime() + duration);
        this._editView.setDate(date, endDate, true);
	}
};

ZmScheduleAssistantView.prototype.updateTime =
function(clearSelection, forceRefresh) {
    if(clearSelection) this._date = null;
    var tf = this._getTimeFrame();
    this._miniCalendar.setDate(tf.start, true);
    this.reset(tf.start, this._attendees, forceRefresh);
    appCtxt.notifyZimlets("onEditAppt_updateTime", [this._editView, tf]);//notify Zimlets
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

    // *** Separate Suggestions pane, only invoked to show suggestions, so changing
    //     force refresh to True
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

    // *** Separate Suggestions pane, only invoked to show suggestions, so changing
    //     force refresh to True
    this.reset(this._date, this._attendees, true);
};


ZmScheduleAssistantView.prototype.reset =
function(date, attendees, forceRefresh) {
    this._date = date || this._miniCalendar.getDate();
    if(!this._editView.isSuggestionsNeeded() || !this.isSuggestionsEnabled()) {
        var isGalEnabled = appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED) && appCtxt.get(ZmSetting.GAL_ENABLED);
        if(this._timeSuggestions && !isGalEnabled) this._timeSuggestions.removeAll();
        this.clearMiniCal();
        if(!this.isSuggestionsEnabled()) {
           if(isGalEnabled) this._timeSuggestions.setShowSuggestionsHTML(this._date);
        }
        return;
    }

    var newDuration = this._editView.getDurationInfo().duration;
    var newKey = this.getFormKey(this._date, attendees);
    if(newKey != this._key || newDuration != this._duration) {
        if(this._currentSuggestions){
            this._currentSuggestions.removeAll();
            this.clearMiniCal();
        }
        if(forceRefresh) this.suggestAction(false, false);
    }
};

ZmScheduleAssistantView.prototype._miniCalDateRangeListener =
function(ev) {
    //clear current mini calendar suggestions
    this._miniCalendar.setColor({}, true, {});
    if(!this._editView.isSuggestionsNeeded()) return;
    this.highlightMiniCal();
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

            if(!ZmTimeSuggestionPrefDialog.isSearchCondition(sf)) continue;

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
    	if (items)
    		this._resources = (items instanceof AjxVector) ? items.getArray() : (items instanceof Array) ? items : [items];
    if(callback) callback.run();
};


// This should only be called for time suggestions
ZmScheduleAssistantView.prototype._findFreeBusyInfo =
function(params) {

    var currAcct = this._editView.getCalendarAccount();
	// Bug: 48189 Don't send GetFreeBusyRequest for non-ZCS accounts.
	if (appCtxt.isOffline && (!currAcct.isZimbraAccount || currAcct.isMain)) {
        //todo: avoid showing smart scheduler button for non-ZCS accounts - offline client
        return;
	}

	var tf = this._timeFrame = this._getTimeFrame();
	var emails = [], attendeeEmails = [], email;

    params.itemIndex = {};
    params.items = [];
    params.timeFrame = tf;

    this._copyResourcesToParams(params, emails);

    var attendees = this._editView.getRequiredAttendeeEmails();
    this._attendees = [];


    var attendee;
    for (var i = attendees.length; --i >= 0;) {
        this._addAttendee(attendees[i], params, emails, attendeeEmails);
    }
    params._nonOrganizerAttendeeEmails = attendeeEmails.slice();
    //include organizer in the scheduler suggestions
    var organizer = this._editView.getOrganizerEmail();
    this._addAttendee(organizer, params, emails, attendeeEmails);

    params.emails = emails;
    params.attendeeEmails = attendeeEmails;

    this._key = this.getFormKey(tf.start, this._attendees);

    if(this._attendees.length == 0) {
        this._timeSuggestions.setNoAttendeesHtml();
        return;
    }

	if (this._freeBusyRequest) {
		appCtxt.getRequestMgr().cancelRequest(this._freeBusyRequest, null, true);
	}

    var callback = new AjxCallback(this, this.getWorkingHours, [params]);
    var acct = (appCtxt.multiAccounts)
        ? this._editView.getCalendarAccount() : null;

    var fbParams = {
                    startTime: tf.start.getTime(),
                    endTime: tf.end.getTime(),
                    emails: emails,
                    callback: callback,
                    errorCallback: callback,
                    noBusyOverlay: true,
                    account: acct
    };

    this._freeBusyRequest = this._fbCache.getFreeBusyInfo(fbParams);
};

ZmScheduleAssistantView.prototype._copyResourcesToParams =
function(params, emails) {
    var list = this._resources;
	for (var i = list.length; --i >= 0;) {
		var item = list[i];
		var email = item.getEmail();

		// bug: 30824 - Don't list all addresses/aliases of a resource in
		// GetFreeBusyRequest.  One should suffice.
		if (email instanceof Array) {
			email = email[0];
		}
		emails.push(email);

        params.items.push(email);
        params.itemIndex[email] = params.items.length-1;
	}
}

ZmScheduleAssistantView.prototype._addAttendee =
function(attendee, params, emails, attendeeEmails) {
    params.items.push(attendee);
    params.itemIndex[attendee] = params.items.length-1;
    emails.push(attendee);
    attendeeEmails.push(attendee);
    this._attendees.push(attendee);
};


ZmScheduleAssistantView.prototype.getFormKey =
function(startDate, attendees) {
    return startDate.getTime() + "-" + attendees.join(",");
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

    //clear fb request info
    this._freeBusyRequest = null;

    if (this._workingHoursRequest) {
        appCtxt.getRequestMgr().cancelRequest(this._workingHoursRequest, null, true);
    }

    var onlyIncludeMyWorkingHours     = params.onlyIncludeMyWorkingHours     = this.isOnlyMyWorkingHoursIncluded();
    var onlyIncludeOthersWorkingHours = params.onlyIncludeOthersWorkingHours = this.isOnlyOthersWorkingHoursIncluded();

    if(!onlyIncludeMyWorkingHours && !onlyIncludeOthersWorkingHours) {
         // Non-working hours can be used for the organizer and all attendees
         this.suggestTimeSlots(params);
         return;   
    }

    var organizer = this._editView.getOrganizer();
    this._organizerEmail = organizer.getEmail();

    var emails =  [];
    if (onlyIncludeOthersWorkingHours) {
        emails = params._nonOrganizerAttendeeEmails;
    }
    if (onlyIncludeMyWorkingHours) {
        emails = emails.concat([this._organizerEmail]);
    }

    if(this._workingHoursKey == this.getWorkingHoursKey()) {
        this.suggestTimeSlots(params);
    }else {
        this._workingHoursKey = this.getWorkingHoursKey();

        var acct = (appCtxt.multiAccounts) ? this._editView.getCalendarAccount() : null;

        //optimization: fetch working hrs for a week - wrking hrs pattern repeat everyweek
        var weekStartDate = new Date(params.timeFrame.start.getTime());
        var dow = weekStartDate.getDay();
        weekStartDate.setDate(weekStartDate.getDate()-((dow+7))%7);
        

        var whrsParams = {
            startTime: weekStartDate.getTime(),
            endTime: weekStartDate.getTime() + 7*AjxDateUtil.MSEC_PER_DAY,
            emails: emails,
            callback: new AjxCallback(this, this._handleWorkingHoursResponse, [params]),
            errorCallback: new AjxCallback(this, this._handleWorkingHoursError, [params]),
            noBusyOverlay: true,
            account: acct
        };

        this._workingHoursRequest = this._fbCache.getWorkingHours(whrsParams);
    }
};

ZmScheduleAssistantView.prototype.isOnlyMyWorkingHoursIncluded =
function() {
    return this._prefDialog ?
        (this._prefDialog.getPreference(ZmTimeSuggestionPrefDialog.MY_WORKING_HOURS_FIELD) == "true") : false;
};
ZmScheduleAssistantView.prototype.isOnlyOthersWorkingHoursIncluded =
function() {
    return this._prefDialog ?
        (this._prefDialog.getPreference(ZmTimeSuggestionPrefDialog.OTHERS_WORKING_HOURS_FIELD) == "true") : false;
};

ZmScheduleAssistantView.prototype._handleWorkingHoursResponse =
function(params, result) {

    this._workingHoursRequest = null;
    this._workingHours = {};
    
    if(this._organizerEmail) {
        this._workingHours[this._organizerEmail] =
            this._fbCache.getWorkingHrsSlot(params.timeFrame.start.getTime(),
                                            params.timeFrame.end.getTime(), this._organizerEmail);
    }
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

    var cDate = new Date();

    //ignore suggestions that are in past
    if(startTime == cDate.setHours(0, 0, 0, 0)) {
        startDate = new Date();
        startTime = startDate.setHours(startDate.getHours(), ((startDate.getMinutes() >=30) ? 60 : 30), 0, 0);
    }

    var endDate = new Date(startTime);
    endDate.setHours(23, 59, 0, 0);
    var endTime = endDate.getTime();
    var durationInfo = this._duration = this._editView.getDurationInfo();

    params.duration = durationInfo.duration;

    this._fbStat = new AjxVector();
    this._fbStatMap = {};
    this._totalUsers = this._attendees.length;
    this._totalLocations =  this._resources.length;

    while(startTime < endTime) {
        this.computeAvailability(startTime, startTime + durationInfo.duration, params);
        startTime += AjxDateUtil.MSEC_PER_HALF_HOUR;
    }

    params.locationInfo = this.computeLocationAvailability(durationInfo, params);

    this._fbStat.sort(ZmScheduleAssistantView._slotComparator);
    //DBG.dumpObj(this._fbStat);
    this.renderSuggestions(params);

    //highlight minicalendar to mark suggested days in month
    this.highlightMiniCal();
};



ZmScheduleAssistantView.prototype.suggestLocations =
function(params) {
    var emails = [];
    this._copyResourcesToParams(params, emails);
    var durationInfo = this._duration = this._editView.getDurationInfo();
    params.emails = emails;
    params.duration = durationInfo.duration;
    params.locationInfo = this.computeLocationAvailability(durationInfo, params);
    this.renderSuggestions(params);
};

ZmScheduleAssistantView.prototype.isSuggestionsEnabled =
function() {
    if(!appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED) || !appCtxt.get(ZmSetting.GAL_ENABLED)) return false;
    // Enabled when visible
    return this._enabled;
};

ZmScheduleAssistantView.prototype.overrideManualSuggestion =
function(enable) {
    this._manualOverrideFlag = enable;
};

ZmScheduleAssistantView.prototype.isSuggestRooms =
function() {
    // Keep for the moment - no preference now, but may need some sort of function
    return true;
};

ZmScheduleAssistantView.prototype.getAttendees =
function() {
    return this._attendees;
};

ZmScheduleAssistantView.prototype.computeAvailability =
function(startTime, endTime, params) {
    
    var dayStartTime = (new Date(startTime)).setHours(0,0,0,0);
    var dayEndTime = dayStartTime + AjxDateUtil.MSEC_PER_DAY;

    var key = this.getKey(startTime, endTime);
    var fbInfo;

    if(!params.miniCalSuggestions && this._fbStatMap[key]) {
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

    var attendee, sched, isFree;
    for(var i = this._attendees.length; --i >= 0;) {
        attendee = this._attendees[i];

        var excludeTimeSlots = this._editView.getFreeBusyExcludeInfo(attendee);
        sched = this._fbCache.getFreeBusySlot(dayStartTime, dayEndTime, attendee, excludeTimeSlots);

        // Last entry will be the organizer, all others are attendees
        // Organizer and Attendees have separate checkboxes indicating whether to apply non-working hours to them.
        var isOrganizer = (i == (this._attendees.length-1));
        var onlyUseWorkingHours = isOrganizer ?
            params.onlyIncludeMyWorkingHours :  params.onlyIncludeOthersWorkingHours;
        isFree = onlyUseWorkingHours ?  this.isWithinWorkingHour(attendee, startTime, endTime) : true;

        //ignore time slots for non-working hours of this user
        if(!isFree) continue;

        if(sched.b) isFree = isFree && this.isBooked(sched.b, startTime, endTime);
        if(sched.t) isFree = isFree && this.isBooked(sched.t, startTime, endTime);
        if(sched.u) isFree = isFree && this.isBooked(sched.u, startTime, endTime);

        //collect all the item indexes of the attendees available at this slot
        if(isFree) {
            if(!params.miniCalSuggestions) fbInfo.attendees.push(params.itemIndex[attendee]);
            fbInfo.availableUsers++;
        }
    }

    if (this.isSuggestRooms()) {

        var list = this._resources, resource;
        for (var i = list.length; --i >= 0;) {
            attendee = list[i];
            resource = attendee.getEmail();

            if (resource instanceof Array) {
                resource = resource[0];
            }

            var excludeTimeSlots = this._editView.getFreeBusyExcludeInfo(resource);
            sched = this._fbCache.getFreeBusySlot(dayStartTime, dayEndTime, resource, excludeTimeSlots);
            isFree = true;
            if(sched.b) isFree = isFree && this.isBooked(sched.b, startTime, endTime);
            if(sched.t) isFree = isFree && this.isBooked(sched.t, startTime, endTime);
            if(sched.u) isFree = isFree && this.isBooked(sched.u, startTime, endTime);

            //collect all the item indexes of the locations available at this slot
            if(isFree) {
                if(!params.miniCalSuggestions) fbInfo.locations.push(params.itemIndex[resource]);
                fbInfo.availableLocations++;
            }
        }
    }

    //mini calendar suggestions should avoid collecting all computed information in array for optimiziation
    if(!params.miniCalSuggestions && fbInfo.availableUsers > 0) {
        var showOnlyGreenSuggestions = params.showOnlyGreenSuggestions;
        if(!showOnlyGreenSuggestions || (fbInfo.availableUsers == this._totalUsers)) {
            this._fbStat.add(fbInfo);
            this._fbStatMap[key] = fbInfo;            
        }
    }

    return fbInfo;
};





// For a single given time slot, determine the available rooms
ZmScheduleAssistantView.prototype.computeLocationAvailability =
function(durationInfo, params) {

    var locationInfo = {
            startTime: durationInfo.startTime,
            endTime:   durationInfo.endTime,
            locations: new AjxVector()
        };

    var list = this._resources;
    for (var i = list.length; --i >= 0;) {
        var email = list[i].getEmail();

        if (email instanceof Array) {
            email = email[0];
        }

        var excludeTimeSlots = this._editView.getFreeBusyExcludeInfo(email);

        sched = this._fbCache.getFreeBusySlot(durationInfo.startTime, durationInfo.endTime, email, excludeTimeSlots);
        isFree = true;
        if(sched.b) isFree = isFree && this.isBooked(sched.b, durationInfo.startTime, durationInfo.endTime);
        if(sched.t) isFree = isFree && this.isBooked(sched.t, durationInfo.startTime, durationInfo.endTime);
        if(sched.u) isFree = isFree && this.isBooked(sched.u, durationInfo.startTime, durationInfo.endTime);

        //collect all the item indexes of the locations available at this slot
        if(isFree) {
            var displayInfo = this._createLocationDisplayInfo(params.itemIndex[email], email);
            locationInfo.locations.add(displayInfo);
        }
    }
    locationInfo.locations.sort(this._compareItems.bind(this));
    return locationInfo;
};


ZmScheduleAssistantView.prototype._createLocationDisplayInfo =
function (index, email) {
    var info = { email: email };
    info.locationObj = this.getLocationByEmail(email);
    info.name = email;
    info.description = '';
    if(info.locationObj) {
        info.name = info.locationObj._fileAs;
        info.description = info.locationObj.getAttr(ZmResource.F_locationName) ||
                           info.locationObj.getAttr(ZmResource.F_name);
        if (info.description == info.name) {
            info.description = '';
        }
    }
    return info;
}


ZmScheduleAssistantView.prototype._sortLocation = function(list) {
	if (list) {
		list.sort(this._compareItems.bind(this));
	}
};
ZmScheduleAssistantView.prototype._compareItems = function(item1, item2) {
	var aVal = item1.name.toLowerCase();
	var bVal = item2.name.toLowerCase();

	if (aVal < bVal) {
        return -1;
    } else if (aVal > bVal)	{
        return 1; }
	else {
        return 0;
    }

};


//module to sort the computed time slots in order of 1)available users 2)time
ZmScheduleAssistantView._slotComparator =
function(slot1, slot2) {
	if(slot1.availableUsers < slot2.availableUsers) {
        return 1;
    }else if(slot1.availableUsers > slot2.availableUsers) {
        return -1;
    }else {
        return slot1.startTime < slot2.startTime ? -1 : (slot1.startTime > slot2.startTime ? 1 : 0);
    }
};

ZmScheduleAssistantView.prototype.getKey =
function(startTime, endTime) {
    return startTime + "-" + endTime;
};

//working hours pattern repeats every week - fetch it for just one week 
ZmScheduleAssistantView.prototype.getWorkingHoursKey =
function() {

    if(!this._timeFrame) return;

    var weekStartDate = new Date(this._timeFrame.start.getTime());
    var dow = weekStartDate.getDay();
    weekStartDate.setDate(weekStartDate.getDate()-((dow+7))%7);
    return [weekStartDate.getTime(), weekStartDate.getTime() + 7*AjxDateUtil.MSEC_PER_DAY, this._organizerEmail].join("-");
};

ZmScheduleAssistantView.prototype.isBooked =
function(slots, startTime, endTime) {
    for (var i = 0; i < slots.length; i++) {
        var startConflict = startTime >= slots[i].s && startTime < slots[i].e;
        var endConflict = endTime > slots[i].s && endTime <= slots[i].e;
        var inlineSlotConflict = slots[i].s >= startTime && slots[i].e <= endTime;
        if(startConflict || endConflict || inlineSlotConflict) {
            return false;
        }
    };
    return true;
};

ZmScheduleAssistantView.prototype.isWithinWorkingHour =
function(attendee, startTime, endTime) {

    var dayStartTime = (new Date(startTime)).setHours(0,0,0,0);
    var dayEndTime = dayStartTime + AjxDateUtil.MSEC_PER_DAY;

    var workingHours = this._fbCache.getWorkingHrsSlot(dayStartTime, dayEndTime, attendee);

    //if working hours could not be retrieved consider all time slots for suggestion
    if(workingHours && workingHours.n) {
        workingHours = this._fbCache.getWorkingHrsSlot(dayStartTime, dayEndTime, this._organizerEmail);
        if(workingHours && workingHours.n) return true;
    }

    if(!workingHours) return false;

    var slots = workingHours.f;

    //working hours are indicated as free slots
    if(!slots) return false;

    //convert working hrs relative to the searching time before comparing
    var slotStartDate, slotEndDate, slotStartTime, slotEndTime;
    for (var i = 0; i < slots.length; i++) {
        slotStartDate = new Date(slots[i].s);
        slotEndDate = new Date(slots[i].e);
        slotStartTime = (new Date(startTime)).setHours(slotStartDate.getHours(), slotStartDate.getMinutes(), 0, 0);
        slotEndTime = slotStartTime + (slots[i].e - slots[i].s);
        if(startTime >= slotStartTime && endTime <= slotEndTime) {
            return true;
        }
    };
    return false;
};

ZmScheduleAssistantView.prototype.renderSuggestions =
function(params) {
    if (this._suggestTime) {
        params.list = this._fbStat;
    } else {
        params.list = params.locationInfo.locations;
    }
    params.totalUsers = this._totalUsers;
    params.totalLocations = this._totalLocations;

    //this._timeSuggestions.setSuggestionsPref(params.showOnlyGreenSuggestions);
    this._currentSuggestions.set(params);
    if(params.focus) this._currentSuggestions.focus();
};

//modules for handling mini calendar suggestions

ZmScheduleAssistantView.prototype.highlightMiniCal =
function() {
    this.getMonthFreeBusyInfo();
};

ZmScheduleAssistantView.prototype.clearMiniCal =
function() {
    this._miniCalendar.setColor({}, true, {});
};

ZmScheduleAssistantView.prototype.getLocationByEmail =
function(item) {
	var locations = this._resources;
	for (var i = 0; i < locations.length; i++) {
		var value = locations[i].getEmail();

        if(value instanceof Array) {
            for(var j = 0; j < value.length; j++) {
                if(item == value[j]) return locations[i];
            }
        }
		if (item == value) {
			return locations[i];
		}
	}
	return null;
};

ZmScheduleAssistantView.prototype.getMonthFreeBusyInfo =
function() {
    var range = this._miniCalendar.getDateRange();
    var startDate = range.start;
    var endDate = range.end;

    var params = {
        items: [],
        itemIndex: {},
        focus: false,
        timeFrame: {
            start: startDate,
            end: endDate
        },
        miniCalSuggestions: true
    };

    //avoid suggestions for past date
    var currentDayTime = (new Date()).setHours(0,0,0,0);
    if(currentDayTime >= startDate.getTime() && currentDayTime <= endDate.getTime()) {
        //reset start date if the current date falls within the month date range - to ignore free busy info from the past
        startDate = params.timeFrame.start = new Date(currentDayTime);
        if(endDate.getTime() == currentDayTime) {
            endDate = params.timeFrame.end = new Date(currentDayTime + AjxDateUtil.MSEC_PER_DAY);
        }
    }else if(endDate.getTime() < currentDayTime) {
        //avoid fetching free busy info for dates in the past
        return;
    }

    var list = this._resources;
    var emails = [], attendeeEmails = [];


    for (var i = list.length; --i >= 0;) {
        var item = list[i];
        var email = item.getEmail();
        if (email instanceof Array) {
            email = email[0];
        }
        emails.push(email);

        params.items.push(email);
		params.itemIndex[email] = params.items.length -1;

    }

    var attendees = this._editView.getRequiredAttendeeEmails();

    var attendee;
    for (var i = attendees.length; --i >= 0;) {
        attendee = attendees[i];
        params.items.push(attendee);
        params.itemIndex[attendee] = params.items.length-1;
        emails.push(attendee);
        attendeeEmails.push(attendee);        
    }

    params._nonOrganizerAttendeeEmails = attendeeEmails.slice();

    //include organizer in the scheduler suggestions
    var organizer = this._editView.getOrganizerEmail();
    params.items.push(organizer);
    params.itemIndex[organizer] = params.items.length-1;
    emails.push(organizer);
    attendeeEmails.push(organizer);

    params.emails = emails;
    params.attendeeEmails = attendeeEmails;

    var callback = new AjxCallback(this, this._handleMonthFreeBusyInfo, [params]);
    var acct = (appCtxt.multiAccounts)
            ? this._editView.getCalendarAccount() : null;


    var fbParams = {
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        emails: emails,
        callback: callback,
        errorCallback: callback,
        noBusyOverlay: true,
        account: acct
    };

    this._monthFreeBusyRequest = this._fbCache.getFreeBusyInfo(fbParams);
};

ZmScheduleAssistantView.prototype._handleMonthFreeBusyInfo =
function(params) {

    //clear fb request info
    this._monthFreeBusyRequest = null;

    if (this._monthWorkingHrsReq) {
        appCtxt.getRequestMgr().cancelRequest(this._monthWorkingHrsReq, null, true);
    }

    var onlyIncludeMyWorkingHours     = this.isOnlyMyWorkingHoursIncluded();
    var onlyIncludeOthersWorkingHours = this.isOnlyOthersWorkingHoursIncluded();

    if(!onlyIncludeMyWorkingHours && !onlyIncludeOthersWorkingHours) {
        this.suggestMonthTimeSlots(params);
        return;
    }

    var organizer = this._editView.getOrganizer();
    this._organizerEmail = organizer.getEmail();

    this._workingHoursKey = this.getWorkingHoursKey();

    var acct = (appCtxt.multiAccounts) ? this._editView.getCalendarAccount() : null;

    //optimization: fetch working hrs for a week - wrking hrs pattern repeat everyweek
    var weekStartDate = new Date(params.timeFrame.start.getTime());
    var dow = weekStartDate.getDay();
    weekStartDate.setDate(weekStartDate.getDate()-((dow+7))%7);

    if (onlyIncludeOthersWorkingHours) {
        emails = params._nonOrganizerAttendeeEmails;
    }
    if (onlyIncludeMyWorkingHours) {
        emails = emails.concat([this._organizerEmail]);
    }

    var whrsParams = {
        startTime: weekStartDate.getTime(),
        endTime: weekStartDate.getTime() + 7*AjxDateUtil.MSEC_PER_DAY,
        emails: emails,
        callback: new AjxCallback(this, this._handleMonthWorkingHoursResponse, [params]),
        errorCallback: new AjxCallback(this, this._handleMonthWorkingHoursError, [params]),
        noBusyOverlay: true,
        account: acct
    };

    this._monthWorkingHrsReq = this._fbCache.getWorkingHours(whrsParams);
};


ZmScheduleAssistantView.prototype._handleMonthWorkingHoursResponse =
function(params, result) {

    this._monthWorkingHrsReq = null;
    this.suggestMonthTimeSlots(params);
};

ZmScheduleAssistantView.prototype._handleMonthWorkingHoursError =
function(params, result) {

    this._monthWorkingHrsReq = null;
    this.suggestMonthTimeSlots(params);
};


ZmScheduleAssistantView.prototype.suggestMonthTimeSlots =
function(params) {

    var startDate = params.timeFrame.start;
    startDate.setHours(0, 0, 0, 0);
    var startTime = startDate.getTime();
    var endTime = params.timeFrame.end.getTime();
    var duration = this._duration = this._editView.getDurationInfo().duration;

    params.duration = duration;

    this._fbStat = new AjxVector();
    this._fbStatMap = {};
    this._totalUsers = this._attendees.length;
    this._totalLocations =  this._resources.length;

    params.dates = {};
    params.colors = {};

    var key, fbStat, freeSlotFound = false, dayStartTime, dayEndTime;

    //suggest for entire minicalendar range
    while(startTime < endTime) {

        dayStartTime = startTime;
        dayEndTime = dayStartTime + AjxDateUtil.MSEC_PER_DAY;

        freeSlotFound = false;

        while(dayStartTime < dayEndTime) {
            fbStat = this.computeAvailability(dayStartTime, dayStartTime + duration, params);
            dayStartTime += AjxDateUtil.MSEC_PER_HALF_HOUR;

            var roomsAvailable = (fbStat.availableLocations > 0);
            var includeRooms   = this.isSuggestRooms();
            if(fbStat && fbStat.availableUsers == this._totalUsers && (!includeRooms || roomsAvailable)) {
                this._addColorCode(params, startTime, ZmMiniCalendar.COLOR_GREEN);
                freeSlotFound = true;
                //found atleast one free slot that can accomodate all attendees and atleast one recources
                break;
            }
        }

        if(!freeSlotFound) {                        
            this._addColorCode(params, startTime, ZmMiniCalendar.COLOR_RED); 
        }

        startTime += AjxDateUtil.MSEC_PER_DAY;
    }

    this._miniCalendar.setColor(params.dates, true, params.colors);
};

ZmScheduleAssistantView.prototype._addColorCode =
function(params, startTime, code) {
    var sd = new Date(startTime);
    var str = AjxDateFormat.format("yyyyMMdd", sd);
    params.dates[str] = sd;
    params.colors[str] = code;
};
