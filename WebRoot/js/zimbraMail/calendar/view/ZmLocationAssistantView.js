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
 * Creates a left pane view for suggesting locations
 * @constructor
 * @class
 * This class displays suggested free locations for a new appointment
 *
 *  @author Vince Bellows
 *
 * @param newApptDialog     [ZmApptQuickAddDialog]	    the new appt dialog
 * @param container         [DOM Element]	            the dialog's content Element
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param closeCallback     [Callback Function]			Function to invoke upon close
 */
ZmLocationAssistantView = function(parent, controller, newApptDialog, closeCallback) {
	ZmApptAssistantView.call(this, parent, controller, newApptDialog, closeCallback);
};

ZmLocationAssistantView.prototype = new ZmApptAssistantView;
ZmLocationAssistantView.prototype.constructor = ZmLocationAssistantView;


ZmLocationAssistantView.prototype.toString =
function() {
	return "ZmLocationAssistantView";
}

ZmLocationAssistantView.prototype.cleanup =
function() {
    if(this._locationSuggestions) this._locationSuggestions.removeAll();
};


ZmLocationAssistantView.prototype._configureSuggestionWidgets =
function() {
    var locClassName = "DwtListView ZmSuggestLocationList";
    this._locationSuggestions = new ZmLocationSuggestionView(this, this._controller,
                                    this._apptView, locClassName);
    this._locationSuggestions.reparentHtmlElement(this._suggestionsView);

    Dwt.setInnerHtml(this._suggestionName, ZmMsg.suggestedLocations);

    this._suggestionsView.style.overflow = 'auto';
    Dwt.setVisible(this._suggestMinical, false);
};

ZmLocationAssistantView.prototype.show =
function(containerSize) {
    this._enabled = true;
    if (!this._containerHeight) {
        this._containerHeight = containerSize.y;

        var nameSize        = Dwt.getSize(this._suggestionName);
        this._yAdjustment   = nameSize.y + 20;
    }
};

ZmLocationAssistantView.prototype.suggestAction =
function(freeBusyCallback) {

    if(appCtxt.isOffline && !appCtxt.isZDOnline()) { return; }

    var params = {
        items: [],
        itemIndex: {},
        focus: true,
        showOnlyGreenSuggestions: true,
        fbCallback: freeBusyCallback
    };

    this._locationSuggestions.setLoadingHtml();
    if(this._resources.length == 0) {
        this.searchCalendarResources(new AjxCallback(this, this._findFreeBusyInfo, [params]));
    } else {
        this._findFreeBusyInfo(params);
    }
};

ZmLocationAssistantView.prototype._getTimeFrame =
function() {
    var di = {};
    ZmApptViewHelper.getDateInfo(this._apptView, di);
    var startDate = AjxDateUtil.simpleParseDateStr(di.startDate);
    startDate.setHours(0, 0, 0, 0);
    var endDate = AjxDateUtil.simpleParseDateStr(di.endDate);
    endDate.setHours(23, 59, 59, 9999);
    return {start:startDate, end:endDate};
};

ZmLocationAssistantView.prototype.updateTime =
function() {
    var tf = this._getTimeFrame();
    this.reset(tf.start);
};

ZmLocationAssistantView.prototype.reset =
function(date) {
    var newDurationInfo = this._apptView.getDurationInfo();
    if(!this._duration ||
       ((newDurationInfo.startTime != this._duration.startTime) ||
        (newDurationInfo.endTime   != this._duration.endTime))) {
        this._duration = newDurationInfo;
        if(this._locationSuggestions){
            this._locationSuggestions.removeAll();
        }
        this.suggestAction();
    }
};

ZmLocationAssistantView.prototype._findFreeBusyInfo =
function(params) {

    var currAcct = this._apptView.getCalendarAccount();
	// Bug: 48189 Don't send GetFreeBusyRequest for non-ZCS accounts.
	if (appCtxt.isOffline && (!currAcct.isZimbraAccount || currAcct.isMain)) {
        //todo: avoid showing smart scheduler button for non-ZCS accounts - offline client
        return;
    }

    var tf = this._getTimeFrame();

    params.itemIndex = {};
    params.items = [];
    params.timeFrame = tf;
    params.attendeeEmails = [];

    var emails = [];
    this._copyResourcesToParams(params, emails);
    params.emails = emails;

    if (this._freeBusyRequest) {
        appCtxt.getRequestMgr().cancelRequest(this._freeBusyRequest, null, true);
    }

    var callback = params.fbCallback ? params.fbCallback :
        new AjxCallback(this, this.suggestLocations, [params]);
    var acct = (appCtxt.multiAccounts) ? this._apptView.getCalendarAccount() : null;
    var fbParams = {
                    startTime:     tf.start.getTime(),
                    endTime:       tf.end.getTime(),
                    emails:        emails,
                    callback:      callback,
                    errorCallback: callback,
                    noBusyOverlay: true,
                    account:       acct
    };

    this._freeBusyRequest = this._fbCache.getFreeBusyInfo(fbParams);
};


ZmLocationAssistantView.prototype.suggestLocations =
function(params) {
    ZmApptAssistantView.prototype.suggestLocations.call(this, params);
    Dwt.setSize(this._suggestionsView, Dwt.DEFAULT, this._containerHeight - this._yAdjustment);
};

ZmLocationAssistantView.prototype.renderSuggestions =
function(params) {
    params.list = params.locationInfo.locations;
    params.totalLocations = this._totalLocations;
    var warning = false;
    if (params.list.size() >= ZmContactsApp.SEARCHFOR_MAX) {
        // Problem: the locations search returned the Limit, implying there may
        // be even more - and the location suggestion pane does not have a 'Next'
        // button to get the next dollop, since large numbers of suggestions are
        // not useful. Include a warning that the user should set their location prefs.
        warning = true;
    }
    this._locationSuggestions.setWarning(warning);

    this._locationSuggestions.set(params);
    if(params.focus) this._locationSuggestions.focus();
};
