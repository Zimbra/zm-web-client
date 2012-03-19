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
 * Dialog containing the ZmResolveLocationView list.
 * @constructor
 * @class
 *
 *  @author Vince Bellows
 *
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param composeView		[ZmApptEditView]	        the appt edit view
 * @param okCallback		[function]	                callback upon OK
 * @param assistantView		[ZmScheduleAssistantView]	Assistant that provides location FB info
 *
 */

ZmResolveLocationConflictDialog = function(controller, composeView, okCallback, assistantView) {
    this._controller = controller;
    this._composeView = composeView;

    this._okCallback = okCallback;
    // The location assistant view associated with the parent appt view will
    // provide the set of viable locations for each conflict date
    this._assistantView = assistantView;

	DwtDialog.call(this, {parent:appCtxt.getShell(),
        title:ZmMsg.resolveLocationConflicts});

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._handleCancelButton));
};

ZmResolveLocationConflictDialog.prototype = new DwtDialog;
ZmResolveLocationConflictDialog.prototype.constructor = ZmResolveLocationConflictDialog;


ZmResolveLocationConflictDialog.prototype.toString =
function() {
	return "ZmResolveLocationConflictDialog";
};

// For each conflict dateTime, find the set of available locations.  These will be used to
// populate the alternate location pulldowns
ZmResolveLocationConflictDialog.prototype._determineAlternateLocations =
function(params) {
    var addr;
    var durationInfo;
    var locInfo;
    var resolveLocInfo;

    this._resolveLocList = new AjxVector();

    for (var i = 0; i < this._inst.length; i++) {
        if (this._inst[i].usr) {
            // A Conflict exists - add an entry to the resolution list
            resolveLocInfo = {};
            resolveLocInfo.originalLocation = ZmResolveLocationView.NO_SELECTION;
            resolveLocInfo.enabled = true;
            var exceptionLoc = this._locationExceptions[this._inst[i].s];
            if (exceptionLoc) {
                // Stored value (from either an existing exception in the DB or a
                // previous use of this dialog).  Save it to use for indicating the
                // selected location in the alternate locations pulldown.
                var locationEmails = [];
                for (var j = 0; j < exceptionLoc.length; j++) {
                    locationEmails.push(exceptionLoc[j].getEmail());
                }
                if (locationEmails.length > 1) {
                    // Multi select not currently supported.  If an exception was created
                    // outside this dialog specifying multiple locations, just display it
                    // (i.e. do not create a pulldown, just create a label)
                    resolveLocInfo.originalLocation  = locationEmails.join(',');
                    resolveLocInfo.enabled = false;
                } else if (locationEmails.length == 1) {
                    resolveLocInfo.originalLocation = locationEmails[0];
                }
             }

            durationInfo = {};
            durationInfo.startTime = this._inst[i].s;
            durationInfo.endTime   = this._inst[i].s + this._inst[i].dur;
            durationInfo.duration  = this._inst[i].dur;

            params.duration = durationInfo
            resolveLocInfo.inst = this._inst[i];

            // Get locations that are available for this conflict's startTime to endTime
            locInfo = this._assistantView.computeLocationAvailability(durationInfo, params);
            resolveLocInfo.alternateLocationInfo = locInfo.locations;
            // Add to the list for display by the ZmResolveLocationView
            this._resolveLocList.add(resolveLocInfo);
        }
    }
    params.list = this._resolveLocList;
    this._resolveLocationView.set(params);

};

ZmResolveLocationConflictDialog.prototype._handleOkButton =
function(event) {
    var alteredLocations   = {};
    var locationExceptions = {};
    var location;
    var newLocation;
    var resolveInfo;

    for (var i = 0; i < this._resolveLocList.size(); i++) {
        resolveInfo = this._resolveLocList.get(i);
        if (resolveInfo.enabled) {
            // Get the selected alternate (if any)
            newLocation = this._resolveLocationView.getAlternateLocation(i);
        } else {
            // Pulldown was not used due to multiple locations already set for entry
            newLocation = resolveInfo.originalLocation;
        }
        if (newLocation != ZmResolveLocationView.NO_SELECTION) {
            location = this._composeView.getAttendeesFromString(ZmCalBaseItem.LOCATION, newLocation, false);
            if (location) {
                locationExceptions[resolveInfo.inst.s] = location.getArray();
            }
            if (newLocation != resolveInfo.originalLocation) {
                // Location changed - pass to caller to apply upon Save
                alteredLocations[resolveInfo.inst.s] = locationExceptions[resolveInfo.inst.s];
            }
        }

    }

    this.popdown();
    if(this._okCallback) this._okCallback.run(locationExceptions, alteredLocations);

};

ZmResolveLocationConflictDialog.prototype._handleCancelButton =
function(event) {
	this.popdown();
};

ZmResolveLocationConflictDialog.prototype.popup =
function(appt, inst, locationExceptions) {
    this._appt = appt;
    this._inst = inst ? inst : [];

    // Existing set of location exceptions - either persisted to the DB, or specified
    // by a previous use of this dialog.
    this._locationExceptions = locationExceptions ? locationExceptions : {};

    DwtDialog.prototype.popup.call(this);
    this._resolveLocationView.setLoadingHtml();

    // Use the assistantView to get sets of locations for each conflict date.
    // These will be used to populate the alternative location dropdown.
    var fbEndTime = 0;
    if (this._inst.length > 0) {
        var inst = this._inst[this._inst.length-1];
        fbEndTime = inst.s + inst.dur;
        this._assistantView.getLocationFBInfo(
            this._determineAlternateLocations, this, fbEndTime);
    }
};

ZmResolveLocationConflictDialog.prototype.setContent =
function(text) {
	var contentDiv = this._getContentDiv();

    this._resolveLocationView = new ZmResolveLocationView(
        this, this._controller, this._apptView);
    this._resolveLocationView.reparentHtmlElement(contentDiv);


};

ZmResolveLocationConflictDialog.prototype.cleanup =
function() {
    if(this._resolveLocationView) this._resolveLocationView.removeAll();
};



