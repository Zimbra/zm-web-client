/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a left pane view for suggesting locations
 * @constructor
 * @class
 * This class displays suggested free locations for a new appointment
 *
 *  @author Vince Bellows
 *
 * @param apptEditView		[ZmApptQuickAddDialog or
 *                           ZmApptComposeView]         View containing the suggestions
 * @param container  		[DOM Element]	            The dialog's content Element
 * @param controller		[ZmApptComposeController]	The appt compose controller
 * @param closeCallback 	[Callback Function]			Function to invoke upon close
 */
ZmApptAssistantView = function(parent, controller, apptView, closeCallback) {
    if (arguments.length == 0) { return; }

	DwtComposite.call(this, {parent: parent, posStyle: DwtControl.RELATIVE_STYLE, className: "ZmScheduleAssistantView"});

	this.setScrollStyle(Dwt.SCROLL_Y);

	this._controller    = controller;
	this._apptView      = apptView;
    this._prefDialog    = appCtxt.getSuggestionPreferenceDialog();
    this._closeCallback = closeCallback;

    // For bug 68531
    //var app = appCtxt.getApp(ZmApp.CALENDAR);
    //this._fbCache       = app.getFreeBusyCache();
    this._fbCache       = apptView.getFreeBusyCache();

	this._rendered      = false;
    this.type           = ZmCalBaseItem.LOCATION;
    this._resources     = [];

    this._enabled       = false;

    this.numRecurrence  = this.getLocationConflictNumRecurrence();

    this.initialize();
};

ZmApptAssistantView.prototype = new DwtComposite;
ZmApptAssistantView.prototype.constructor = ZmApptAssistantView;


ZmApptAssistantView.prototype.toString =
function() {
	return "ZmApptAssistantView";
}

ZmApptAssistantView.ATTRS = {};
ZmApptAssistantView.ATTRS[ZmCalBaseItem.LOCATION] =
	["fullName", "email", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "description", "zimbraCalResType"];

ZmApptAssistantView.prototype.initialize =
function() {
    this._createHTML();
    this._createWidgets();
    this.addControlListener(this._resetSize.bind(this));
    this._resetSize();
};

ZmApptAssistantView.prototype.isInitialized =
function() {
    var prefInitialized = this._prefDialog ? this._prefDialog.getPrefLoaded() : false;
    // Only checking pref Dialog initialization for now
    return prefInitialized;
};

ZmApptAssistantView.prototype.cleanup =
function() {
};

ZmApptAssistantView.prototype._createHTML =
function() {
	var subs = {
		id: this._htmlElId
	};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#SuggestionsView", subs);
};

ZmApptAssistantView.prototype._createWidgets =
function() {

    this._closeId = this._htmlElId + "_suggest_close";
    this._closeBtn = document.getElementById(this._closeId);
    Dwt.setHandler(this._closeBtn, DwtEvent.ONCLICK, this._closeListener.bind(this));

    this._suggestionContainerElId = this._htmlElId + "_suggest_container";
    this._suggestionsContainer = document.getElementById(this._suggestionContainerElId);

    this._suggestionNameElId = this._htmlElId + "_suggestion_name"
    this._suggestionName = document.getElementById(this._suggestionNameElId);

    this._suggestionViewElId = this._htmlElId + "_suggest_view";
    this._suggestionsView = document.getElementById(this._suggestionViewElId);

    this._createMiniCalendar();
    this._suggestMinicalElId = this._htmlElId + "_suggest_minical";
    this._suggestMinical = document.getElementById(this._suggestMinicalElId);

    this._optionsBtnId = this._htmlElId + "_suggest_options_image";
    this._optionsBtn = document.getElementById(this._optionsBtnId);
    Dwt.setHandler(this._optionsBtn, DwtEvent.ONCLICK, this._prefListener.bind(this));

    this._configureSuggestionWidgets();
};

ZmApptAssistantView.prototype._configureSuggestionWidgets =
function() {
};

ZmApptAssistantView.prototype._createMiniCalendar =
function(date) {
}

ZmApptAssistantView.prototype.clearResources =
function() {
    this._resources = [];
};


ZmApptAssistantView.prototype.getLocationConflictNumRecurrence =
function() {
    return this._prefDialog ?
        parseInt(this._prefDialog.getPreference(ZmTimeSuggestionPrefDialog.RECURRENCE)) :
        ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE;
};

ZmApptAssistantView.prototype._prefListener =
function(ev) {
    // Record the current numRecurrence value, for detecting changes upon
    // completion of the preferences dialog
    this.numRecurrence = this.getLocationConflictNumRecurrence();
    this._prefDialog.popup(this._apptView.getCalendarAccount());
};


ZmApptAssistantView.prototype._closeListener =
function(ev) {
    this.close();
};
ZmApptAssistantView.prototype.close =
function() {
    var parentEl = this.getHtmlElement().parentNode;
    Dwt.setVisible(parentEl, false);
    this._enabled = false;
    if (this._closeCallback) {
        this._closeCallback.run();
    }
};

ZmApptAssistantView.prototype.suggestAction =
function() {
};

ZmApptAssistantView.prototype._getTimeFrame =
function() {
};

ZmApptAssistantView.prototype.updateTime =
function() {
};

ZmApptAssistantView.prototype.reset =
function(date) {
};

//smart scheduler suggestion modules

ZmApptAssistantView.prototype.searchCalendarResources =
function(callback, sortBy) {
	var currAcct = this._apptView.getCalendarAccount();
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
		attrs: ZmApptAssistantView.ATTRS[this.type],
		accountName: appCtxt.isOffline ? currAcct.name : null
	};
	var search = new ZmSearch(params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchCalendarResources, callback)});
};

ZmApptAssistantView.prototype._handleResponseSearchCalendarResources =
function(callback, result) {
	var resp = result.getResponse();
	var items = resp.getResults(ZmItem.RESOURCE).getVector();
    	if (items)
    		this._resources = (items instanceof AjxVector) ? items.getArray() : (items instanceof Array) ? items : [items];
    if(callback) callback.run();
};

// This should only be called for time suggestions
ZmApptAssistantView.prototype._findFreeBusyInfo =
function(params) {
};

ZmApptAssistantView.prototype._copyResourcesToParams =
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

ZmApptAssistantView.prototype.suggestLocations =
function(params) {
    var emails = [];
    this._copyResourcesToParams(params, emails);
    this._duration  = this._apptView.getDurationInfo();
    params.emails   = emails;
    params.duration = this._duration.duration;
    params.locationInfo = this.computeLocationAvailability(this._duration, params);
    this.renderSuggestions(params);
};

// For a single given time slot, determine the available rooms
ZmApptAssistantView.prototype.computeLocationAvailability =
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

        var excludeTimeSlots = this._apptView.getFreeBusyExcludeInfo(email);

        // Adjust start and end time by 1 msec, to avoid fencepost problems
        sched = this._fbCache.getFreeBusySlot(durationInfo.startTime+1,
            durationInfo.endTime-1, email, excludeTimeSlots);
        isFree = true;
        if(sched.b) isFree = isFree && ZmApptAssistantView.isBooked(sched.b, durationInfo.startTime, durationInfo.endTime);
        if(sched.t) isFree = isFree && ZmApptAssistantView.isBooked(sched.t, durationInfo.startTime, durationInfo.endTime);
        if(sched.u) isFree = isFree && ZmApptAssistantView.isBooked(sched.u, durationInfo.startTime, durationInfo.endTime);

        //collect all the item indexes of the locations available at this slot
        if(isFree) {
            var displayInfo = this._createLocationDisplayInfo(email);
            locationInfo.locations.add(displayInfo);
        }
    }
    locationInfo.locations.sort(this._compareItems.bind(this));
    return locationInfo;
};


ZmApptAssistantView.isBooked =
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

ZmApptAssistantView.prototype._createLocationDisplayInfo =
function (email) {
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
        info.contactMail = info.locationObj.getAttr(ZmResource.F_contactMail)
        info.capacity    = info.locationObj.getAttr(ZmResource.F_capacity)
    }
    return info;
}

ZmApptAssistantView.prototype._sortLocation = function(list) {
	if (list) {
		list.sort(this._compareItems.bind(this));
	}
};
ZmApptAssistantView.prototype._compareItems = function(item1, item2) {
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

ZmApptAssistantView.prototype.renderSuggestions =
function(params) {
};

ZmApptAssistantView.prototype.getLocationByEmail =
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

ZmApptAssistantView.prototype._resetSize = function() {
    if (!this._suggestionsView) {
        return;
    }

    var header = this._suggestionsContainer.firstChild;
    var bounds = this.boundsForChild(this._suggestionsView);
    var insets = Dwt.getInsets(this._suggestionsView);

    var width = bounds.width - insets.left - insets.right;
    var height = (bounds.height - Dwt.getOuterSize(this._suggestMinical).y -
                  Dwt.getOuterSize(header).y);

    Dwt.setSize(this._suggestionsView, width, height);
};
