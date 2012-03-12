/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a new calendar item edit view.
 * @constructor
 * @class
 * This is the main screen for creating/editing an appointment. It provides
 * inputs for the various appointment details.
 *
 * @author Parag Shah
 *
 * @param {DwtControl}	parent			some container
 * @param {Hash}	attendees			attendees/locations/equipment
 * @param {Object}	dateInfo			a hash of date info
 * @param {ZmController}	controller		the compose controller for this view
 * 
 * @extends		ZmCalItemEditView
 * 
 * @private
 */
ZmApptEditView = function(parent, attendees, controller, dateInfo) {

	ZmCalItemEditView.call(this, parent, attendees, controller, dateInfo, null, "ZmApptEditView");

	// cache so we dont keep calling appCtxt
	this.GROUP_CALENDAR_ENABLED = appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED);

	this._attTypes = [];
	if (this.GROUP_CALENDAR_ENABLED) {
		this._attTypes.push(ZmCalBaseItem.PERSON);
	}
	this._attTypes.push(ZmCalBaseItem.LOCATION);
	if (appCtxt.get(ZmSetting.GAL_ENABLED) && this.GROUP_CALENDAR_ENABLED) {
		this._attTypes.push(ZmCalBaseItem.EQUIPMENT);
	}
    this._locationTextMap = {};
    this._attendeePicker = {};
    this._pickerButton = {};

	this._useAcAddrBubbles = appCtxt.get(ZmSetting.USE_ADDR_BUBBLES);

    //used to preserve original attendees while forwarding appt
    this._fwdApptOrigAttendees = [];
    this._attendeesHashMap = {};

    // Store Appt form values.
    this._apptFormValue = {};
    this._showAsValueChanged  = false;

    this._locationExceptions  = null;
    this._alteredLocations    = null;
    this._enableResolveDialog = true;

    this._locationConflict    = false;
    this._locationStatusMode = ZmApptEditView.LOCATION_STATUS_NONE;

    var app = appCtxt.getApp(ZmApp.CALENDAR);
    // Each ApptEditView must now have its own copy of the FreeBusyCache.  The cache will
    // now hold FreeBusy info that is unique to an appointment, in that the Server provides
    // Free busy info that excludes the current appointment.  So the cache information cannot
    // be shared across appointments.
    //this._fbCache = app.getFreeBusyCache();
    AjxDispatcher.require("CalendarCore");
    this._fbCache = new ZmFreeBusyCache(app);

    this._customRecurDialogCallback = this._recurChangeForLocationConflict.bind(this);
};

ZmApptEditView.prototype = new ZmCalItemEditView;
ZmApptEditView.prototype.constructor = ZmApptEditView;

// Consts


ZmApptEditView.PRIVACY_OPTION_PUBLIC = "PUB";
ZmApptEditView.PRIVACY_OPTION_PRIVATE = "PRI";

ZmApptEditView.PRIVACY_OPTIONS = [
	{ label: ZmMsg._public,				value: "PUB",	selected: true	},
	{ label: ZmMsg._private,			value: "PRI"					}
//	{ label: ZmMsg.confidential,		value: "CON"					}		// see bug #21205
];

ZmApptEditView.BAD						= "_bad_addrs_";

ZmApptEditView.REMINDER_MAX_VALUE		= {};
ZmApptEditView.REMINDER_MAX_VALUE[ZmCalItem.REMINDER_UNIT_DAYS]		    = 14;
ZmApptEditView.REMINDER_MAX_VALUE[ZmCalItem.REMINDER_UNIT_MINUTES]		= 20160;
ZmApptEditView.REMINDER_MAX_VALUE[ZmCalItem.REMINDER_UNIT_HOURS]		= 336;
ZmApptEditView.REMINDER_MAX_VALUE[ZmCalItem.REMINDER_UNIT_WEEKS]		= 2;

ZmApptEditView.TIMEZONE_TYPE = "TZ_TYPE";

ZmApptEditView.START_TIMEZONE = 1;
ZmApptEditView.END_TIMEZONE = 2;

ZmApptEditView.LOCATION_STATUS_UNDEFINED  = -1;
ZmApptEditView.LOCATION_STATUS_NONE       =  0;
ZmApptEditView.LOCATION_STATUS_VALIDATING =  1;
ZmApptEditView.LOCATION_STATUS_CONFLICT   =  2;
ZmApptEditView.LOCATION_STATUS_RESOLVED   =  3;


// Public Methods

ZmApptEditView.prototype.toString =
function() {
	return "ZmApptEditView";
};

ZmApptEditView.prototype.isLocationConflictEnabled =
function() {
    return ((this._mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) &&
            !this._isForward && !this._isProposeTime &&
             this.getRepeatType() != "NON");
}

ZmApptEditView.prototype.getFreeBusyCache =
function() {
    return this._fbCache;
}


ZmLocationAppt = function() { };
ZmLocationRecurrence = function() { };

ZmApptEditView.prototype.show =
function() {
    this._fbCache.clearCache();
	ZmCalItemEditView.prototype.show.call(this);
	this._setAttendees();

    if (this.parent.setLocationConflictCallback) {
        var appt = this.parent.getAppt();
        this.initializeLocationConflictCheck(appt);
    }

    Dwt.setVisible(this._attendeeStatus, false);
    Dwt.setVisible(this._suggestTime, !this._isForward);
    Dwt.setVisible(this._suggestLocation, !this._isForward && !this._isProposeTime);
    this._scheduleAssistant.close();

    if(!this.GROUP_CALENDAR_ENABLED) {
        this.setSchedulerVisibility(false);
    }

    if(!appCtxt.get(ZmSetting.GAL_ENABLED) && this._useAcAddrBubbles){
        Dwt.setSize(this._attInputField[ZmCalBaseItem.LOCATION]._input, "100%");
    }

    //bug:48189 Hide schedule tab for non-ZCS acct
    if (appCtxt.isOffline) {
        var currAcct = appCtxt.getActiveAccount();
        this.setSchedulerVisibility(currAcct.isZimbraAccount && !currAcct.isMain);
    }

    this._editViewInitialized = true;
    if(this._expandInlineScheduler) {
        this._pickAttendeesInfo(ZmCalBaseItem.PERSON);
        this._pickAttendeesInfo(ZmCalBaseItem.LOCATION);
    }
};

ZmApptEditView.prototype.initializeLocationConflictCheck =
function(appt) {
    // Create a 'Location-only' clone of the appt, for use with the
    // resource conflict calls
    ZmLocationAppt.prototype = appt;
    ZmLocationRecurrence.prototype = appt.getRecurrence();
    this._locationConflictAppt = new ZmLocationAppt();
    this._locationConflictAppt._recurrence = new ZmLocationRecurrence();
    this._locationConflictAppt._attendees[ZmCalBaseItem.LOCATION] =
        appt._attendees[ZmCalBaseItem.LOCATION];
    this._locationConflictAppt._attendees[ZmCalBaseItem.PERSON]	  = [];
    this._locationConflictAppt._attendees[ZmCalBaseItem.EQUIPMENT]= [];

    this._processLocationCallback = this.processLocationConflicts.bind(this);
    this._noLocationCallback =
        this.setLocationStatus.bind(this, ZmApptEditView.LOCATION_STATUS_NONE);
    this.parent.setLocationConflictCallback(this.updatedLocationsConflictChecker.bind(this));

    this._getRecurrenceSearchResponseCallback =
        this._getExceptionSearchResponse.bind(this, this._locationConflictAppt);
    this._getRecurrenceSearchErrorCallback =
        this._getExceptionSearchError.bind(this, this._locationConflictAppt);

    if (!this._pendingLocationRequest &&
         this._scheduleAssistant && this._scheduleAssistant.isInitialized()) {
        // Trigger an initial location check - the appt may have been saved
        // with a location that has conflicts.  Only do it if no pending
        // request and the assistant is initialized (location preferences
        // are loaded). If !initialized, the locationConflictChecker will
        // be run when preferences are loaded.
        this.locationConflictChecker();
    }
}

ZmApptEditView.prototype.cancelLocationRequest =
function() {
    if (this._pendingLocationRequest) {
        appCtxt.getRequestMgr().cancelRequest(this._pendingLocationRequest, null, true);
        this._pendingLocationRequest = null;
    }
}

ZmApptEditView.prototype.locationConflictChecker =
function() {
    // Cancel any pending requests
    this.cancelLocationRequest();
    if (this.isLocationConflictEnabled() &&
        this._locationConflictAppt.hasAttendeeForType(ZmCalBaseItem.LOCATION)) {
        // Send a request to the server to get location conflicts

        // DISABLED until Bug 56464 completed - server side CreateAppointment/ModifyAppointment
        // SOAP API changes.  When done, add code in ZmCalItemComposeController to add the
        // altered locations as a list of exceptions to the SOAP call.
        //if (this._apptExceptionList) {
        //    this._runLocationConflictChecker();
        //} else {
        //    // Get the existing exceptions, then runLocationConflictChecker
        //    this._doExceptionSearchRequest();
        //}

        // Once bug 56464 completed, remove the following and enable the disabled code above
        this._runLocationConflictChecker();

    } else {
        if (this._noLocationCallback) {
            // Restore the 'Suggest Location' line to its default
            this._noLocationCallback.run();
        }
    }
}

ZmApptEditView.prototype.updatedLocationsConflictChecker =
function(locations){
    // Update locations in the appt clone, then run the conflict checker
    this._locationConflictAppt.setAttendees(locations.getArray(), ZmCalBaseItem.LOCATION);
    this.locationConflictChecker();
}

ZmApptEditView.prototype.getNumLocationConflictRecurrence =
function() {
    var numRecurrence = ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE;
    if (this._scheduleAssistant) {
        numRecurrence = this._scheduleAssistant.getLocationConflictNumRecurrence();
    }
    return numRecurrence;
}

ZmApptEditView.prototype._runLocationConflictChecker =
function() {
    var numRecurrence = this.getNumLocationConflictRecurrence();
    var locationCallback = this._controller.getCheckResourceConflicts(
        this._locationConflictAppt, numRecurrence, this._processLocationCallback, false);
    this.setLocationStatus(ZmApptEditView.LOCATION_STATUS_VALIDATING);
    this._pendingLocationRequest = locationCallback.run();
}


ZmApptEditView.prototype._doExceptionSearchRequest =
function() {
    var numRecurrence = this.getNumLocationConflictRecurrence();
    var startDate = new Date(this._calItem.startDate);
    var endTime = ZmApptComposeController.getCheckResourceConflictEndTime(
        this._locationConflictAppt, startDate, numRecurrence);

    var jsonObj = {SearchRequest:{_jsns:"urn:zimbraMail"}};
    var request = jsonObj.SearchRequest;

    request.sortBy = "dateasc";
    request.limit = numRecurrence.toString();
    // AjxEnv.DEFAULT_LOCALE is set to the browser's locale setting in the case
    // when the user's (or their COS) locale is not set.
    request.locale = { _content: AjxEnv.DEFAULT_LOCALE };
    request.calExpandInstStart = startDate.getTime();
    request.calExpandInstEnd   = endTime;
    request.types = ZmSearch.TYPE[ZmItem.APPT];
    request.query = {_content:'item:"' + this._calItem.id.toString() + '"'};
    var accountName = appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null;

    var params = {
        jsonObj:       jsonObj,
        asyncMode:     true,
        callback:      this._getExceptionSearchResponse.bind(this),
        errorCallback: this._getExceptionSearchError.bind(this),
        noBusyOverlay: true,
        accountName:   accountName
    };
    appCtxt.getAppController().sendRequest(params);
}

ZmApptEditView.prototype._getExceptionSearchResponse =
function(result) {
	if (!result) { return; }

	var resp;
    var appt;
	try {
		resp = result.getResponse();
	} catch (ex) {
		return;
	}

    // See ZmApptCache.prototype.processSearchResponse
    var rawAppts = resp.SearchResponse.appt;
    this._apptExceptionList = new ZmApptList();
    this._apptExceptionList.loadFromSummaryJs(rawAppts);
    this._apptExceptionLookup = {};

    this._locationExceptions = {}
    for (var i = 0; i < this._apptExceptionList.size(); i++) {
        appt = this._apptExceptionList.get(i);
        this._apptExceptionLookup[appt.startDate.getTime()] = appt;
        if (appt.isException) {
            // Found an exception, store its location info, using its start date as the key
            var location = appt._attendees[ZmCalBaseItem.LOCATION];
            if (!location || (location.length == 0)) {
                location = this.getAttendeesFromString(ZmCalBaseItem.LOCATION, appt.location, false);
                location = location.getArray();
            }
            this._locationExceptions[appt.startDate.getTime()] = location;
        }
    }
    this._enableResolveDialog = true;

    // Now find the conflicts
    this._runLocationConflictChecker();
};

ZmApptEditView.prototype._getExceptionSearchError =
function(ex) {
    // Disallow use of the resolve dialog if can't read the exceptions
    this._enableResolveDialog = false;
}

// Callback executed when the CheckResourceConflictRequest completes.
// Store the conflict instances (if any) and update the status field
ZmApptEditView.prototype.processLocationConflicts =
function(inst) {
    this._inst = inst;
    var locationStatus = ZmApptEditView.LOCATION_STATUS_NONE;
    for (var i = 0; i < this._inst.length; i++) {
        if (this._inst[i].usr) {
            // Conflict exists for this instance
            if (this._locationExceptions && this._locationExceptions[this._inst[i].s]) {
                // Assume that an existing exception (either persisted to the DB, or set via
                // the current use of the resolve dialog) means that the instance conflict is resolved
                locationStatus = ZmApptEditView.LOCATION_STATUS_RESOLVED;
            } else {
                // No exception for the instance, using default location which has a conflict
                locationStatus = ZmApptEditView.LOCATION_STATUS_CONFLICT;
                break;
            }
        }
    }

    this.setLocationStatus(locationStatus);
}

ZmApptEditView.prototype.setLocationStatus =
function(locationStatus, currentLocationConflict) {
    var className = "";
    var statusMessage = "";
    var linkMessage = "";
    var msgVisible = false;
    var linkVisible = false;
    var statusText = "";

    if (locationStatus != ZmApptEditView.LOCATION_STATUS_UNDEFINED) {
        this._locationStatusMode = locationStatus;
    }
    if (currentLocationConflict !== undefined) {
        this._locationConflict  = currentLocationConflict;
    }

    // Manage the location suggestion line beneath the location field.
    switch (this._locationStatusMode) {
        case ZmApptEditView.LOCATION_STATUS_NONE:
             // No recurrence conflicts or nothing to check - display based on current conflict flag
             if (this._locationConflict) {
                 statusMessage = AjxImg.getImageHtml("Warning_12", "display:inline-block;padding-right:4px;") +
                                 ZmMsg.locationCurrentConflicts;
                 className     = "ZmLocationStatusConflict";
                 msgVisible    = true;
             } else {
                 msgVisible    = false;
             }
             break;
        case ZmApptEditView.LOCATION_STATUS_VALIDATING:
             // The conflict resource check is in progress, show a busy spinner
             className     = "ZmLocationStatusValidating";
             // Don't incorporate currentConflict flag - just show validating; It will update upon completion
             statusMessage = AjxImg.getImageHtml("Wait_16", "display:inline-block;padding-right:4px;") +
                             ZmMsg.validateLocation;
             msgVisible    = true;
             linkVisible   = false;
             break;
        case ZmApptEditView.LOCATION_STATUS_CONFLICT:
             // Unresolved recurrence conflicts - show the 'Resolve Conflicts' link
             className     = "ZmLocationStatusConflict";
             statusText    = this._locationConflict ? ZmMsg.locationCurrentAndRecurrenceConflicts :
                                                      ZmMsg.locationRecurrenceConflicts;
             statusMessage = AjxImg.getImageHtml("Warning_12", "display:inline-block;padding-right:4px;") +
                             statusText;
             linkMessage   = ZmMsg.resolveConflicts;
             msgVisible    = true;
             linkVisible   = true;
             break;
        case ZmApptEditView.LOCATION_STATUS_RESOLVED:
             // Resolved conflicts - show the 'View Resolutions' link
             className     = "ZmLocationStatusResolved";
             statusMessage = this._locationConflict ? ZmMsg.locationRecurrenceResolvedButCurrentConflict :
                             ZmMsg.locationRecurrenceConflictsResolved;
             linkMessage   = ZmMsg.viewResolutions;
             msgVisible    = true;
             linkVisible   = true;
             break;
        default: break;
    }

    Dwt.setVisible(this._locationStatus, msgVisible);
    if (!this._enableResolveDialog) {
        // Unable to read the exeptions, prevent the use of the resolve dialog
        linkVisible = false;
    }

    // NOTE: Once CreateAppt/ModifyAppt SOAP API changes are completed (Bug 56464), enable
    //       the display of the resolve links and the use of the resolve dialog
    // *** NOT DONE ***
    linkVisible = false;

    Dwt.setVisible(this._locationStatusAction, linkVisible);
    Dwt.setInnerHtml(this._locationStatus, statusMessage);
    Dwt.setInnerHtml(this._locationStatusAction, linkMessage);
    this._locationStatus.className = className;
}

ZmApptEditView.prototype.blur =
function(useException) {
	if (this._activeInputField) {
		this._handleAttendeeField(this._activeInputField, useException);
		// bug: 15251 - to avoid race condition, active field will anyway be
		// cleared by onblur handler for input field this._activeInputField = null;
	}
};

ZmApptEditView.prototype.cleanup =
function() {
	ZmCalItemEditView.prototype.cleanup.call(this);

	if (this.GROUP_CALENDAR_ENABLED) {
		this._attendeesInputField.clear();
		this._optAttendeesInputField.clear();
        this._forwardToField.clear();
        this._adjustAddrHeight(this._attendeesInputField.getInputElement());
        this._adjustAddrHeight(this._optAttendeesInputField.getInputElement());
	}
    this._attInputField[ZmCalBaseItem.LOCATION].clear();
	this._locationTextMap = {};

	if (this._resourcesContainer) {
        this.showResourceField(false);
        this._resourceInputField.clear();
	}

	this._allDayCheckbox.checked = false;
	this._showTimeFields(true);
	this._isKnownLocation = false;

	// reset autocomplete lists
	if (this._acContactsList) {
		this._acContactsList.reset();
		this._acContactsList.show(false);
	}
	if (this._acLocationsList) {
		this._acLocationsList.reset();
		this._acLocationsList.show(false);
	}

	if (this._useAcAddrBubbles && this.GROUP_CALENDAR_ENABLED) {
		for (var attType in this._attInputField) {
			this._attInputField[attType].clear();
		}
	}

    this._attendeesHashMap = {};
    this._showAsValueChanged = false;

    Dwt.setVisible(this._attendeeStatus, false);
    this.setLocationStatus(ZmApptEditView.LOCATION_STATUS_NONE, false);

    //Default Persona
    this.setIdentity();
    if(this._scheduleAssistant) this._scheduleAssistant.cleanup();

    this._apptExceptionList  = null;
    this._locationExceptions = null;
    this._alteredLocations   = null;

};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmApptEditView.prototype.enableInputs =
function(bEnableInputs) {
	ZmCalItemEditView.prototype.enableInputs.call(this, bEnableInputs);
	if (this.GROUP_CALENDAR_ENABLED) {
		var bEnableAttendees = bEnableInputs;
		if (appCtxt.isOffline && bEnableAttendees &&
			this._calItem && this._calItem.getFolder().getAccount().isMain)
		{
			bEnableAttendees = false;
		}
		this._attendeesInputField.setEnabled(bEnableAttendees);
		this._optAttendeesInputField.setEnabled(bEnableAttendees);
        this.enablePickers(bEnableAttendees);        
	}else {
        //bug 57083 - disabling group calendar should disable attendee pickers
        this.enablePickers(false);
    }
	this._attInputField[ZmCalBaseItem.LOCATION].setEnabled(bEnableInputs);
};

ZmApptEditView.prototype.isOrganizer =
function() {
    return Boolean(this._isOrganizer);
};

ZmApptEditView.prototype.enablePickers =
function(bEnablePicker) {
    for (var t = 0; t < this._attTypes.length; t++) {
        var type = this._attTypes[t];
        if(this._pickerButton[type]) this._pickerButton[type].setEnabled(bEnablePicker);
    }

    if(this._pickerButton[ZmCalBaseItem.OPTIONAL_PERSON]) this._pickerButton[ZmCalBaseItem.OPTIONAL_PERSON].setEnabled(bEnablePicker);

};

ZmApptEditView.prototype.isValid =
function() {
	var errorMsg = [];

	// check for required subject
	var subj = AjxStringUtil.trim(this._subjectField.getValue());

    //bug: 49990 subject can be empty while proposing new time
	if ((subj && subj.length) || this._isProposeTime) {
		var allDay = this._allDayCheckbox.checked;
		if (!ZmTimeInput.validStartEnd(this._startDateField, this._endDateField, (allDay ? null : this._startTimeSelect), (allDay ? null : this._endTimeSelect))) {
				errorMsg.push(ZmMsg.errorInvalidDates);
		}

	} else {
		errorMsg.push(ZmMsg.errorMissingSubject);
	}
    if (this._reminderSelectInput) {
        var reminderString = this._reminderSelectInput.getValue();
        var reminderInfo = ZmCalendarApp.parseReminderString(reminderString);
        if (reminderInfo.reminderValue > ZmApptEditView.REMINDER_MAX_VALUE[reminderInfo.reminderUnits]) {
            errorMsg.push(ZmMsg.errorInvalidReminderValue);
        }
    }
	if (errorMsg.length > 0) {
		throw errorMsg.join("<br>");
	}

	return true;
};

// called by schedule tab view when user changes start date field
ZmApptEditView.prototype.updateDateField =
function(newStartDate, newEndDate) {
	var oldTimeInfo = this._getDateTimeText();

	this._startDateField.value = newStartDate;
	this._endDateField.value = newEndDate;

	this._dateTimeChangeForLocationConflict(oldTimeInfo);
};

ZmApptEditView.prototype.updateAllDayField =
function(isAllDay) {
	var oldAllDay = this._allDayCheckbox.checked;
	this._allDayCheckbox.checked = isAllDay;
	this._showTimeFields(!isAllDay);
	if (oldAllDay != isAllDay) {
		var durationInfo = this.getDurationInfo();
		this._locationConflictAppt.startDate = new Date(durationInfo.startTime);
		this._locationConflictAppt.endDate = new Date(durationInfo.endTime);
		this._locationConflictAppt.allDayEvent = isAllDay ? "1" : "0";
		this.locationConflictChecker();
	}
};

ZmApptEditView.prototype.toggleAllDayField =
function() {
	this.updateAllDayField(!this._allDayCheckbox.checked);
};

ZmApptEditView.prototype.updateShowAsField =
function(isAllDay) {
    if(!this._showAsValueChanged) {
        if(isAllDay) {
            this._showAsSelect.setSelectedValue("F");
        }
        else {
            this._showAsSelect.setSelectedValue("B");
        }
    }
};

ZmApptEditView.prototype.setShowAsFlag =
function(flag) {
    this._showAsValueChanged = flag;
};

ZmApptEditView.prototype.updateTimeField =
function(dateInfo) {
     this._startTimeSelect.setValue(dateInfo.startTimeStr);
     this._endTimeSelect.setValue(dateInfo.endTimeStr);
};


ZmApptEditView.prototype.setDate =
function(startDate, endDate, ignoreTimeUpdate) {
    var oldTimeInfo = this._getDateTimeText();
    this._startDateField.value = AjxDateUtil.simpleComputeDateStr(startDate);
    this._endDateField.value = AjxDateUtil.simpleComputeDateStr(endDate);
    if(!ignoreTimeUpdate) {
        this._startTimeSelect.set(startDate);
        this._endTimeSelect.set(endDate);
    }

    if(this._schedulerOpened) {
        this._scheduleView.handleTimeChange();
    }
    appCtxt.notifyZimlets("onEditAppt_updateTime", [this, {startDate:startDate, endDate:endDate}]);//notify Zimlets    

    this._dateTimeChangeForLocationConflict(oldTimeInfo);
};

// ?? Not used - and not setting this._dateInfo.  If used,
// need to check change in timezone in caller and then update location conflict
ZmApptEditView.prototype.updateTimezone =
function(dateInfo) {
	this._tzoneSelectStart.setSelectedValue(dateInfo.timezone);
	this._tzoneSelectEnd.setSelectedValue(dateInfo.timezone);
    this.handleTimezoneOverflow();
};

ZmApptEditView.prototype.updateLocation =
function(location, locationStr) {
    this._updateAttendeeFieldValues(ZmCalBaseItem.LOCATION, [location]);
    locationStr = locationStr || location.getAttendeeText(ZmCalBaseItem.LOCATION);
    this.setApptLocation(locationStr);
};

// Private / protected methods

ZmApptEditView.prototype._initTzSelect =
function() {
	var options = AjxTimezone.getAbbreviatedZoneChoices();
	if (options.length != this._tzCount) {
		this._tzCount = options.length;
		this._tzoneSelectStart.clearOptions();
		this._tzoneSelectEnd.clearOptions();
		for (var i = 0; i < options.length; i++) {
			this._tzoneSelectStart.addOption(options[i]);
			this._tzoneSelectEnd.addOption(options[i]);
		}
	}
};

ZmApptEditView.prototype._addTabGroupMembers =
function(tabGroup) {
	tabGroup.addMember(this._subjectField.getInputElement());
    if(this.GROUP_CALENDAR_ENABLED) {
        tabGroup.addMember(this._attInputField[ZmCalBaseItem.PERSON].getInputElement());
        tabGroup.addMember(this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].getInputElement());
    }    
	tabGroup.addMember(this._attInputField[ZmCalBaseItem.LOCATION].getInputElement());
    if(this.GROUP_CALENDAR_ENABLED && appCtxt.get(ZmSetting.GAL_ENABLED)) {
	    tabGroup.addMember(this._attInputField[ZmCalBaseItem.EQUIPMENT].getInputElement());
    }
    tabGroup.addMember(this._startDateField);
	tabGroup.addMember(this._startTimeSelect.getInputField());
	tabGroup.addMember(this._endDateField);
	tabGroup.addMember(this._endTimeSelect.getInputField());
    tabGroup.addMember(this._allDayCheckbox);
    tabGroup.addMember(this._showAsSelect);
    tabGroup.addMember(this._folderSelect);

    if(this._repeatSelect) tabGroup.addMember(this._repeatSelect);
    tabGroup.addMember(this._reminderSelectInput);


	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	tabGroup.addMember(document.getElementById(bodyFieldId));
};

ZmApptEditView.prototype._finishReset =
function() {
    ZmCalItemEditView.prototype._finishReset.call(this);

    this._apptFormValue = {};
    this._apptFormValue[ZmApptEditView.CHANGES_SIGNIFICANT]      = this._getFormValue(ZmApptEditView.CHANGES_SIGNIFICANT);
    this._apptFormValue[ZmApptEditView.CHANGES_INSIGNIFICANT]    = this._getFormValue(ZmApptEditView.CHANGES_INSIGNIFICANT);
    this._apptFormValue[ZmApptEditView.CHANGES_LOCAL]            = this._getFormValue(ZmApptEditView.CHANGES_LOCAL);
    this._apptFormValue[ZmApptEditView.CHANGES_TIME_RECURRENCE]  = this._getFormValue(ZmApptEditView.CHANGES_TIME_RECURRENCE);

    var newMode = (this._mode == ZmCalItem.MODE_NEW);        

    // save the original form data in its initialized state
	this._origFormValueMinusAttendees = newMode ? "" : this._formValue(true);
	if (this._hasReminderSupport) {
		this._origFormValueMinusReminder = newMode ? "" : this._formValue(false, true);
		this._origReminderValue = this._reminderSelectInput.getValue();
	}
    this._keyInfoValue = newMode ? "" : this._keyValue();
};

/**
 * Checks if location/time/recurrence only are changed.
 *
 * @return	{Boolean}	<code>true</code> if location/time/recurrence only are changed
 */
ZmApptEditView.prototype.isKeyInfoChanged =
function() {
	var formValue = this._keyInfoValue;
	return (this._keyValue() != formValue);
};

ZmApptEditView.prototype._getClone =
function() {
	return ZmAppt.quickClone(this._calItem);
};

ZmApptEditView.prototype.getDurationInfo =
function() {
    var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate   = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (!this._allDayCheckbox.checked) {
		startDate = this._startTimeSelect.getValue(startDate);
		endDate   = this._endTimeSelect.getValue(endDate);
	}
    var durationInfo = {};
    durationInfo.startTime = startDate.getTime();
    durationInfo.endTime   = endDate.getTime();
    durationInfo.duration  = durationInfo.endTime - durationInfo.startTime;
    return durationInfo;
};

ZmApptEditView.prototype.getDuration =
function() {
    var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
    var duration = AjxDateUtil.MSEC_PER_DAY;
	if (!this._allDayCheckbox.checked) {
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
        duration = endDate.getTime() - startDate.getTime();
	}
    return duration;
};

ZmApptEditView.prototype._populateForSave =
function(calItem) {

    ZmCalItemEditView.prototype._populateForSave.call(this, calItem);

    if(this.isOrganizer() && this.isKeyInfoChanged()) this.resetParticipantStatus();

    //Handle Persona's
    var identity = this.getIdentity();
    if(identity){
       calItem.identity = identity; 
       calItem.sentBy = (identity && identity.getField(ZmIdentity.SEND_FROM_ADDRESS));
    }

	calItem.freeBusy = this._showAsSelect.getValue();
	calItem.privacy = this._privateCheckbox.checked ? ZmApptEditView.PRIVACY_OPTION_PRIVATE : ZmApptEditView.PRIVACY_OPTION_PUBLIC;

	// set the start date by aggregating start date/time fields
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (this._allDayCheckbox.checked) {
		calItem.setAllDayEvent(true);
        if(AjxDateUtil.isDayShifted(startDate)) {
            AjxDateUtil.rollToNextDay(startDate);
            AjxDateUtil.rollToNextDay(endDate);
        }
	} else {
		calItem.setAllDayEvent(false);
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
	}
	calItem.setStartDate(startDate, true);
	calItem.setEndDate(endDate, true);
	if (Dwt.getVisibility(this._tzoneSelectStartElement)) {
        calItem.timezone = this._tzoneSelectStart.getValue();
        if (Dwt.getVisibility(this._tzoneSelectEndElement)) {
            calItem.setEndTimezone(this._tzoneSelectEnd.getValue());
        }else {
            calItem.setEndTimezone(this._tzoneSelectStart.getValue());
        }
    }

    // set attendees
    for (var t = 0; t < this._attTypes.length; t++) {
        var type = this._attTypes[t];
        calItem.setAttendees(this._attendees[type].getArray(), type);
    }

    var calLoc = AjxStringUtil.trim(this._attInputField[ZmCalBaseItem.LOCATION].getValue());
     //bug 44858, trimming ';' so that ;; does not appears in outlook, 
	calItem.location = AjxStringUtil.trim(calLoc, false, ';');

	// set any recurrence rules LAST
	this._getRecurrence(calItem);

    calItem.isForward = this._isForward;
    calItem.isProposeTime = this._isProposeTime;

    if(this._isForward)  {
        var addrs = this._collectForwardAddrs();
        var a = {};
        if (addrs[AjxEmailAddress.TO] && addrs[AjxEmailAddress.TO].good) {
            a[AjxEmailAddress.TO] = addrs[AjxEmailAddress.TO].good.getArray();
        }        
        calItem.setForwardAddress(a[AjxEmailAddress.TO]);
    }

    // Only used for the save
    calItem.alteredLocations   = this._alteredLocations;

	return calItem;
};


ZmApptEditView.prototype.getRsvp =
function() {
  return this.GROUP_CALENDAR_ENABLED ? this._controller.getRequestResponses() : false;  
};

ZmApptEditView.prototype.updateToolbarOps =
function(){
    this._controller.updateToolbarOps((this.isAttendeesEmpty() || !this.isOrganizer()) ? ZmCalItemComposeController.APPT_MODE : ZmCalItemComposeController.MEETING_MODE, this._calItem);
};

ZmApptEditView.prototype.isAttendeesEmpty =
function() {

    if(!this.GROUP_CALENDAR_ENABLED) return true;

    var locations = this._attendees[ZmCalBaseItem.LOCATION];
    //non-resource location labels also contributes to empty attendee
    var isLocationResource =(locations && locations.size() > 0);
	var isAttendeesNotEmpty = AjxStringUtil.trim(this._attendeesInputField.getValue()) || AjxStringUtil.trim(this._optAttendeesInputField.getValue()) || (this._resourceInputField ? AjxStringUtil.trim(this._resourceInputField.getValue()) : "") || isLocationResource;
    return !isAttendeesNotEmpty;
    
};

ZmApptEditView.prototype._populateForEdit =
function(calItem, mode) {

	ZmCalItemEditView.prototype._populateForEdit.call(this, calItem, mode);

    var enableTimeSelection = !this._isForward;
    var enableApptDetails = !this._isForward && !this._isProposeTime;

	this._showAsSelect.setSelectedValue(calItem.freeBusy);
    this._showAsSelect.setEnabled(enableApptDetails);

	// reset the date/time values based on current time
	var sd = new Date(calItem.startDate.getTime());
	var ed = new Date(calItem.endDate.getTime());

    var isNew = (mode == ZmCalItem.MODE_NEW || mode == ZmCalItem.MODE_NEW_FROM_QUICKADD);
	var isAllDayAppt = calItem.isAllDayEvent();
	if (isAllDayAppt) {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);
        this.updateShowAsField(true);
        this._showAsSelect.setSelectedValue(calItem.freeBusy);
        this._showAsSelect.setEnabled(enableApptDetails);

		// set time anyway to current time and default duration (in case user changes mind)
		var now = AjxDateUtil.roundTimeMins(new Date(), 30);
		this._startTimeSelect.set(now);

		now.setTime(now.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
		this._endTimeSelect.set(now);

		// bug 9969: HACK - remove the all day durtion for display
		if (!isNew && !calItem.draftUpdated && ed.getHours() == 0 && ed.getMinutes() == 0 && ed.getSeconds() == 0 && sd.getTime() != ed.getTime()) {
			ed.setHours(-12);
		}
	} else {
		this._showTimeFields(true);
		this._startTimeSelect.set(calItem.startDate);
		this._endTimeSelect.set(calItem.endDate);
	}
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);

	this._initTzSelect();
	this._resetTimezoneSelect(calItem, isAllDayAppt);

    //need to capture initial time set while composing/editing appt
    ZmApptViewHelper.getDateInfo(this, this._dateInfo);

    this._startTimeSelect.setEnabled(enableTimeSelection);
    this._endTimeSelect.setEnabled(enableTimeSelection);
    this._startDateButton.setEnabled(enableTimeSelection);
    this._endDateButton.setEnabled(enableTimeSelection);

    this._fwdApptOrigAttendees = [];

    //editing an appt should exclude the original appt time for FB calculation
    this._fbExcludeInfo = {};

    var showScheduleView = false;
	// attendees
	var attendees = calItem.getAttendees(ZmCalBaseItem.PERSON);
	if (attendees && attendees.length) {
		if (this.GROUP_CALENDAR_ENABLED) {
			var people = calItem.getAttendees(ZmCalBaseItem.PERSON);
			var reqAttendees = ZmApptViewHelper.filterAttendeesByRole(people, ZmCalItem.ROLE_REQUIRED);
			this._setAddresses(this._attendeesInputField, reqAttendees, ZmCalBaseItem.PERSON);
			var optAttendees = ZmApptViewHelper.filterAttendeesByRole(people, ZmCalItem.ROLE_OPTIONAL);
			this._setAddresses(this._optAttendeesInputField, optAttendees, ZmCalBaseItem.PERSON);
            if (optAttendees.length) {
                this._toggleOptionalAttendees(true);
            }
		}
        if(this._isForward) {
        	this._attInputField[ZmCalBaseItem.FORWARD] = this._forwardToField;
        }
    	this._attendees[ZmCalBaseItem.PERSON] = AjxVector.fromArray(attendees);
        for(var a=0;a<attendees.length;a++){
            this._attendeesHashMap[attendees[a].getEmail()+"-"+ZmCalBaseItem.PERSON]=attendees[a];
            if(!isNew) this.addFreeBusyExcludeInfo(attendees[a].getEmail(), calItem.startDate.getTime(), calItem.endDate.getTime());
        }
    	this._attInputField[ZmCalBaseItem.PERSON] = this._attendeesInputField;
    	this._fwdApptOrigAttendees = [];
        showScheduleView = true;
	} else {
        if (this.GROUP_CALENDAR_ENABLED) {
            this._attendeesInputField.clear();
            this._optAttendeesInputField.clear();
        }
        this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();
        this._attInputField[ZmCalBaseItem.PERSON] = this._isForward ? this._forwardToField : this._attendeesInputField;        
    }

	// set the location attendee(s)
	var locations = calItem.getAttendees(ZmCalBaseItem.LOCATION);
    if (!locations || !locations.length) {
        locations = this.getAttendeesFromString(ZmCalBaseItem.LOCATION, calItem.getLocation(), false);
        if (locations) {
            locations = locations.getArray();
        }
    }
	if (locations && locations.length) {
        this.updateAttendeesCache(ZmCalBaseItem.LOCATION, locations);
		this._attendees[ZmCalBaseItem.LOCATION] = AjxVector.fromArray(locations);
        var locStr = ZmApptViewHelper.getAttendeesString(locations, ZmCalBaseItem.LOCATION);
        this._setAddresses(this._attInputField[ZmCalBaseItem.LOCATION], locStr);
        showScheduleView = true;
	}else{
        // set the location *label*
	    this._attInputField[ZmCalBaseItem.LOCATION].setValue(calItem.getLocation());
    }

    // set the equipment attendee(s)
	var equipment = calItem.getAttendees(ZmCalBaseItem.EQUIPMENT);
	if (equipment && equipment.length) {
        this._toggleResourcesField(true);
		this._attendees[ZmCalBaseItem.EQUIPMENT] = AjxVector.fromArray(equipment);
        this.updateAttendeesCache(ZmCalBaseItem.EQUIPMENT, equipment);
        var equipStr = ZmApptViewHelper.getAttendeesString(equipment, ZmCalBaseItem.EQUIPMENT);
        this._setAddresses(this._attInputField[ZmCalBaseItem.EQUIPMENT], equipStr);
        showScheduleView = true;
	}

	// privacy
    var isRemote = calItem.isShared();
    var cal = isRemote ? appCtxt.getById(calItem.folderId) : null;
    var isPrivacyEnabled = ((!isRemote || (cal && cal.hasPrivateAccess())) && enableApptDetails);
    var defaultPrivacyOption = (appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV);

    this._privateCheckbox.checked = (calItem.privacy == ZmApptEditView.PRIVACY_OPTION_PRIVATE);
    this._privateCheckbox.disabled = !isPrivacyEnabled;

	if (this.GROUP_CALENDAR_ENABLED) {
        this._controller.setRequestResponses((attendees && attendees.length) ? calItem.shouldRsvp() : true);

		this._isOrganizer = calItem.isOrganizer();
		//this._attInputField[ZmCalBaseItem.PERSON].setEnabled(calItem.isOrganizer() || this._isForward);

        //todo: disable notification for attendee
        
        if(this._organizerData) {
            this._organizerData.innerHTML = calItem.getOrganizer() || "";
        }
        this._calItemOrganizer =  calItem.getOrganizer() || "";

        if(!isNew) this.addFreeBusyExcludeInfo(this.getOrganizerEmail(), calItem.startDate.getTime(), calItem.endDate.getTime());

        //enable forward field/picker if its not propose time view
        this._setAddresses(this._forwardToField, this._isProposeTime ? calItem.getOrganizer() : "");
        this._forwardToField.setEnabled(!this._isProposeTime);
        this._forwardPicker.setEnabled(!this._isProposeTime);

        for (var t = 0; t < this._attTypes.length; t++) {
		    var type = this._attTypes[t];
		    if(this._pickerButton[type]) this._pickerButton[type].setEnabled(enableApptDetails);
	    }

        if(this._pickerButton[ZmCalBaseItem.OPTIONAL_PERSON]) this._pickerButton[ZmCalBaseItem.OPTIONAL_PERSON].setEnabled(enableApptDetails);
	}


    this._folderSelect.setEnabled(enableApptDetails);
    if (this._reminderSelect) {
		this._reminderSelect.setEnabled(enableTimeSelection);
	}

    this._allDayCheckbox.disabled = !enableTimeSelection;

    if(calItem.isAcceptingProposal) this._isDirty = true;

    //Persona's   [ Should select Persona as combination of both DisplayName, FromAddress ]
    if(calItem.identity){
        this.setIdentity(calItem.identity);
    }else{
        var sentBy = calItem.sentBy;
        sentBy = sentBy || (calItem.organizer != calItem.getFolder().getOwner() ? calItem.organizer : null);
        if(sentBy){
            this.setIdentity(appCtxt.getIdentityCollection().getIdentityBySendAddress(sentBy));
        }
    }

    this.setApptMessage(this._getMeetingStatusMsg(calItem));

    this.updateToolbarOps();
    this._controller.setRequestResponses(calItem && calItem.hasAttendees() ? calItem.shouldRsvp() : true);

    showScheduleView = showScheduleView && !this._isForward;

    if(this._controller.isSave() && showScheduleView){
        this._toggleInlineScheduler(true);
    }else{
        this._schedulerOpened = null;
        this._closeScheduler();
    }

    this._expandInlineScheduler = (showScheduleView && !isNew);

};

ZmApptEditView.prototype.getFreeBusyExcludeInfo =
function(emailAddr){
    return this._fbExcludeInfo ? this._fbExcludeInfo[emailAddr] : null;
};

ZmApptEditView.prototype.excludeLocationFBSlots =
function(locations, startTime, endTime){
    for(var i=0; i < locations.length; i++){
        var location = locations[i];
        if(!location) continue;
        this.addFreeBusyExcludeInfo(location.getEmail(), startTime, endTime);
    }
};

ZmApptEditView.prototype.addFreeBusyExcludeInfo =
function(emailAddr, startTime, endTime){
    if(!this._fbExcludeInfo) this._fbExcludeInfo = {};
    // DISABLE client side exclude info usage.  Now using the GetFreeBusyInfo
    // call with ExcludeId, where the server performs the exclusion of the
    // current appt.
    //
    //this._fbExcludeInfo[emailAddr] = {
    //    s: startTime,
    //    e: endTime
    //};
};

ZmApptEditView.prototype._getMeetingStatusMsg =
function(calItem){
    var statusMsg = null;
    if(!this.isAttendeesEmpty() && calItem.isDraft){
        if(calItem.inviteNeverSent){
            statusMsg = ZmMsg.inviteNotSent;
        }else{
            statusMsg = ZmMsg.updatedInviteNotSent;
        }
    }
    return statusMsg;
};

ZmApptEditView.prototype.setApptMessage =
function(msg, icon){
    if(msg){
        Dwt.setVisible(this._inviteMsgContainer, true);
        this._inviteMsg.innerHTML = msg;
    }else{
        Dwt.setVisible(this._inviteMsgContainer, false);
    }
};

ZmApptEditView.prototype.getCalItemOrganizer =
function() {
	var folderId = this._folderSelect.getValue();
	var organizer = new ZmContact(null);
	organizer.initFromEmail(this._calItemOrganizer, true);
	return organizer;
};

ZmApptEditView.prototype._createHTML =
function() {
	// cache these Id's since we use them more than once
	this._allDayCheckboxId 	= this._htmlElId + "_allDayCheckbox";
	this._repeatDescId 		= this._htmlElId + "_repeatDesc";
	this._startTimeAtLblId  = this._htmlElId + "_startTimeAtLbl";
	this._endTimeAtLblId	= this._htmlElId + "_endTimeAtLbl";
    this._isAppt = true; 

	var subs = {
		id: this._htmlElId,
		height: (this.parent.getSize().y - 30),
		currDate: (AjxDateUtil.simpleComputeDateStr(new Date())),
		isGalEnabled: appCtxt.get(ZmSetting.GAL_ENABLED),
		isAppt: true,
		isGroupCalEnabled: this.GROUP_CALENDAR_ENABLED
	};

	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#ComposeView", subs);
};

ZmApptEditView.prototype._createWidgets =
function(width) {
	ZmCalItemEditView.prototype._createWidgets.call(this, width);

	this._attInputField = {};

	if (this.GROUP_CALENDAR_ENABLED) {
        var params = {
            bubbleRemovedCallback: new AjxCallback(this, this._handleRemovedAttendees)
        };
		this._attendeesInputField = this._createInputField("_person", ZmCalBaseItem.PERSON, params);
		this._optAttendeesInputField = this._createInputField("_optional", ZmCalBaseItem.OPTIONAL_PERSON);
        //add Resources Field
        if(appCtxt.get(ZmSetting.GAL_ENABLED)) this._resourceInputField = this._createInputField("_resourcesData", ZmCalBaseItem.EQUIPMENT, {strictMode:false});
	}

    // add location input field
	this._locationInputField = this._createInputField("_location", ZmCalBaseItem.LOCATION, {strictMode:false});

    this._mainTableId = this._htmlElId + "_table";
    this._mainTable   = document.getElementById(this._mainTableId);

    var edvId = AjxCore.assignId(this);
    this._schButtonId = this._htmlElId + "_scheduleButton";
    this._showOptionalId = this._htmlElId + "_show_optional";
    this._showResourcesId = this._htmlElId + "_show_resources";
    
    this._showOptional = document.getElementById(this._showOptionalId);
    this._showResources = document.getElementById(this._showResourcesId);

    this._schButton = document.getElementById(this._schButtonId);
    this._schButton._editViewId = edvId;
    this._schImage = document.getElementById(this._htmlElId + "_scheduleImage");
    this._schImage._editViewId = edvId;
    Dwt.setHandler(this._schButton, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
    Dwt.setHandler(this._schImage, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);

	this._resourcesContainer = document.getElementById(this._htmlElId + "_resourcesContainer");

	this._resourcesData = document.getElementById(this._htmlElId + "_resourcesData");
    this._schedulerContainer = document.getElementById(this._htmlElId + "_scheduler");
    this._suggestions = document.getElementById(this._htmlElId + "_suggestions");
    Dwt.setVisible(this._suggestions, false);

    this._attendeeStatusId = this._htmlElId + "_attendee_status";
    this._attendeeStatus   = document.getElementById(this._attendeeStatusId);
    Dwt.setVisible(this._attendeeStatus, false);

    this._suggestTimeId = this._htmlElId + "_suggest_time";
    this._suggestTime = document.getElementById(this._suggestTimeId);
    Dwt.setVisible(this._suggestTime, !this._isForward);
    this._suggestLocationId = this._htmlElId + "_suggest_location";
    this._suggestLocation   = document.getElementById(this._suggestLocationId);
    Dwt.setVisible(this._suggestLocation, !this._isForward && !this._isProposeTime);

    this._locationStatusId = this._htmlElId + "_location_status";
    this._locationStatus   = document.getElementById(this._locationStatusId);
    Dwt.setVisible(this._locationStatus, false);
    this._locationStatusMode = ZmApptEditView.LOCATION_STATUS_NONE;

    this._locationStatusActionId = this._htmlElId + "_location_status_action";
    this._locationStatusAction   = document.getElementById(this._locationStatusActionId);
    Dwt.setVisible(this._locationStatusAction, false);

    this._notesContainerId = this._htmlElId + "_notes_container";
    this._notesContainer = document.getElementById(this._notesContainerId);

	this._schedulerOptions = document.getElementById(this._htmlElId + "_scheduler_option");

	// show-as DwtSelect
	this._showAsSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_showAsSelect")});
	for (var i = 0; i < ZmApptViewHelper.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value, "showAs" + option.value);
	}

	this._showAsSelect.addChangeListener(new AjxListener(this, this.setShowAsFlag, [true]));
	this._folderSelect.addChangeListener(new AjxListener(this, this._folderListener));

    this._privateCheckbox = document.getElementById(this._htmlElId + "_privateCheckbox");

	// time ZmTimeSelect
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	this._startTimeSelect = new ZmTimeInput(this, ZmTimeInput.START);
	this._startTimeSelect.reparentHtmlElement(this._htmlElId + "_startTimeSelect");
	this._startTimeSelect.addChangeListener(timeSelectListener);

	this._endTimeSelect = new ZmTimeInput(this, ZmTimeInput.END);
	this._endTimeSelect.reparentHtmlElement(this._htmlElId + "_endTimeSelect");
	this._endTimeSelect.addChangeListener(timeSelectListener);

    if (this.GROUP_CALENDAR_ENABLED) {
		// create without saving in this._attInputField (will overwrite attendee input)
		this._forwardToField = this._createInputField("_to_control",ZmCalBaseItem.FORWARD);
    }

	// timezone DwtSelect
    var timezoneListener = new AjxListener(this, this._timezoneListener);
    this._tzoneSelectStartElement = document.getElementById(this._htmlElId + "_tzoneSelectStart");
	this._tzoneSelectStart = new DwtSelect({parent:this, parentElement:this._tzoneSelectStartElement, layout:DwtMenu.LAYOUT_SCROLL, maxRows:7});
	this._tzoneSelectStart.addChangeListener(timezoneListener);
    this._tzoneSelectStart.setData(ZmApptEditView.TIMEZONE_TYPE, ZmApptEditView.START_TIMEZONE);
    this._tzoneSelectStart.dynamicButtonWidth();

    this._tzoneSelectEndElement = document.getElementById(this._htmlElId + "_tzoneSelectEnd");
	this._tzoneSelectEnd = new DwtSelect({parent:this, parentElement:this._tzoneSelectEndElement, layout:DwtMenu.LAYOUT_SCROLL, maxRows:7});
	this._tzoneSelectEnd.addChangeListener(timezoneListener);
    this._tzoneSelectEnd.setData(ZmApptEditView.TIMEZONE_TYPE, ZmApptEditView.END_TIMEZONE);
    this._tzoneSelectEnd.dynamicButtonWidth();

	// NOTE: tzone select is initialized later

	// init auto-complete widget if contacts app enabled
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this._initAutocomplete();
	}

    this._organizerOptions = document.getElementById(this._htmlElId + "_organizer_options");
    this._organizerData = document.getElementById(this._htmlElId + "_organizer");
    this._optionalAttendeesContainer = document.getElementById(this._htmlElId + "_optionalContainer");

    this._maxPickerWidth = 0;    
    var isPickerEnabled = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) ||
						   appCtxt.get(ZmSetting.GAL_ENABLED) ||
						   appCtxt.multiAccounts);
    if (isPickerEnabled) {
        this._createContactPicker(this._htmlElId + "_picker", new AjxListener(this, this._addressButtonListener), ZmCalBaseItem.PERSON, true);
        this._createContactPicker(this._htmlElId + "_req_att_picker", new AjxListener(this, this._attendeesButtonListener, ZmCalBaseItem.PERSON), ZmCalBaseItem.PERSON);
        this._createContactPicker(this._htmlElId + "_opt_att_picker", new AjxListener(this, this._attendeesButtonListener, ZmCalBaseItem.OPTIONAL_PERSON), ZmCalBaseItem.OPTIONAL_PERSON);
        this._createContactPicker(this._htmlElId + "_loc_picker", new AjxListener(this, this._locationButtonListener, ZmCalBaseItem.LOCATION), ZmCalBaseItem.LOCATION);
        this._createContactPicker(this._htmlElId + "_res_btn", new AjxListener(this, this._locationButtonListener, ZmCalBaseItem.EQUIPMENT), ZmCalBaseItem.EQUIPMENT);
    }

    //Personas
    //TODO: Remove size check once we add identityCollection change listener.
    if (appCtxt.get(ZmSetting.IDENTITIES_ENABLED) && !appCtxt.multiAccounts){
        var identityOptions = this._getIdentityOptions();
        this.identitySelect = new DwtSelect({parent:this, options:identityOptions, parentElement: (this._htmlElId + "_identity")});
        this.identitySelect.setToolTipContent(ZmMsg.chooseIdentity);
    }

    this._setIdentityVisible();
    this.updateToolbarOps();

    if (this._resourcesContainer) {
        Dwt.setVisible(this._resourcesContainer, false);
    }

    if(this.GROUP_CALENDAR_ENABLED) {
        Dwt.setVisible(this._optionalAttendeesContainer, false);
        Dwt.setVisible(this._optAttendeesInputField.getInputElement(), false);
        if(this._resourceInputField) { Dwt.setVisible(this._resourceInputField.getInputElement(), false); }
    }

    this._inviteMsgContainer = document.getElementById(this._htmlElId + "_invitemsg_container");
    this._inviteMsg = document.getElementById(this._htmlElId + "_invitemsg");
    
};

ZmApptEditView.prototype._createInputField =
function(idTag, attType, params) {

    params = params || {};

    var height = AjxEnv.isSafari && !AjxEnv.isSafariNightly ? "52px;" : "21px";
    var overflow = AjxEnv.isSafari && !AjxEnv.isSafariNightly ? false : true;
    
	var inputId = this.parent._htmlElId + idTag + "_input";
	var cellId = this._htmlElId + idTag;
	var input;
	if (this._useAcAddrBubbles) {
		var aifParams = {
			autocompleteListView:	this._acAddrSelectList,
			inputId:				inputId,
            bubbleRemovedCallback:  params.bubbleRemovedCallback,
			type:					attType,
			strictMode:				params.strictMode
		}
		var input = this._attInputField[attType] = new ZmAddressInputField(aifParams);
		input.reparentHtmlElement(cellId);
	} else {
		var params = {
			parent:			this,
			parentElement:	cellId,
			inputId:		inputId
		};
        if (idTag == '_person' ||
            idTag == '_optional' ||
            idTag == '_to_control') {
            params.forceMultiRow = true;
        }
		input = this._attInputField[attType] = new DwtInputField(params);
	}

	var inputEl = input.getInputElement();
	Dwt.setSize(inputEl, "100%", height);
	inputEl._attType = attType;

	return input;
};

ZmApptEditView.prototype._createContactPicker =
function(pickerId, listener, addrType, isForwardPicker) {
    var pickerEl = document.getElementById(pickerId);
    if (pickerEl) {
        var buttonId = Dwt.getNextId();
        var button = new DwtButton({parent:this, id:buttonId, className: "ZButton ZPicker"});
        if(isForwardPicker) {
            this._forwardPicker = button;
        }else {
            this._pickerButton[addrType] = button;            
        }
        button.setText(pickerEl.innerHTML);
        button.replaceElement(pickerEl);

        button.addSelectionListener(listener);
        button.addrType = addrType;

        var btnWidth = button.getSize().x;
        if(btnWidth > this._maxPickerWidth) this._maxPickerWidth = btnWidth;
    }
};


ZmApptEditView.prototype._onSuggestionClose =
function() {
    // Make the trigger links visible and resize now that the suggestion panel is hidden
    Dwt.setVisible(this._suggestTime, !this._isForward);
    Dwt.setVisible(this._suggestLocation, !this._isForward && !this._isProposeTime);
    this.resize();
}

ZmApptEditView.prototype._showTimeSuggestions =
function() {
    // Display the time suggestion panel.
    Dwt.setVisible(this._suggestions, true);
    Dwt.setVisible(this._suggestTime, false);
    Dwt.setVisible(this._suggestLocation, !this._isProposeTime);
    this._scheduleAssistant.show(true);
    // Resize horizontally
    this._resizeNotes();
    this._scheduleAssistant.suggestAction(true, false);
};

ZmApptEditView.prototype._showLocationSuggestions =
function() {
    // Display the location suggestion panel
    Dwt.setVisible(this._suggestions, true);
    Dwt.setVisible(this._suggestLocation, false);
    Dwt.setVisible(this._suggestTime, true);
    this._scheduleAssistant.show(false);
    // Resize horizontally
    this._resizeNotes();
    this._scheduleAssistant.suggestAction(true, false);
};

ZmApptEditView.prototype._showLocationStatusAction =
function() {
    if (!this._resolveLocationDialog) {
        this._resolveLocationDialog = new ZmResolveLocationConflictDialog(
            this._controller, this,
            this._locationConflictOKCallback.bind(this),
            this._scheduleAssistant);
    } else {
        this._resolveLocationDialog.cleanup();
    }

    this._resolveLocationDialog.popup(this._calItem, this._inst, this._locationExceptions);
};

// Invoked from 'OK' button of location conflict resolve dialog
ZmApptEditView.prototype._locationConflictOKCallback =
function(locationExceptions, alteredLocations) {
    this._locationExceptions = locationExceptions;
    this._alteredLocations   = alteredLocations;
    this.locationConflictChecker();
};

ZmApptEditView.prototype._toggleOptionalAttendees =
function(forceShow) {
    this._optionalAttendeesShown = ! this._optionalAttendeesShown || forceShow;
    this._showOptional.innerHTML = this._optionalAttendeesShown ? ZmMsg.hideOptional : ZmMsg.showOptional;
    Dwt.setVisible(this._optionalAttendeesContainer, Boolean(this._optionalAttendeesShown))

    var inputEl = this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].getInputElement();
    Dwt.setVisible(inputEl, Boolean(this._optionalAttendeesShown));
};

ZmApptEditView.prototype._toggleResourcesField =
function(forceShow) {
    this._resourcesShown = ! this._resourcesShown || forceShow;
    this.showResourceField(this._resourcesShown);

    var inputEl = this._attInputField[ZmCalBaseItem.EQUIPMENT].getInputElement();
    Dwt.setVisible(inputEl, Boolean(this._resourcesShown));
};

ZmApptEditView.prototype.showResourceField =
function(show){
    this._showResources.innerHTML = show ? ZmMsg.hideEquipment : ZmMsg.showEquipment;
    Dwt.setVisible(this._resourcesContainer, Boolean(show))
};


ZmApptEditView.prototype.showOptional =
function() {
    this._toggleOptionalAttendees(true);
};

ZmApptEditView.prototype._closeScheduler =
function() {
    this._schButton.innerHTML = ZmMsg.show;
    this._schImage.className = "ImgSelectPullDownArrow";
    if(this._scheduleView) {
        this._scheduleView.setVisible(false);
        this.autoSize();
    }
};

ZmApptEditView.prototype._toggleInlineScheduler =
function(forceShow) {

    if(this._schedulerOpened && !forceShow) {
        this._schedulerOpened = false;        
        this._closeScheduler();
        return;
    }

    this._schedulerOpened = true;
    this._schButton.innerHTML = ZmMsg.hide;
    this._schImage.className = "ImgSelectPullUpArrow";

    var scheduleView = this.getScheduleView();

    //todo: scheduler auto complete
    Dwt.setVisible(this._schedulerContainer, true);
    scheduleView.setVisible(true);
    scheduleView.resetPagelessMode(false);
    scheduleView.showMe();

    this.autoSize();
};

ZmApptEditView.prototype.getScheduleView =
function() {
    if(!this._scheduleView) {
        var appt = this.parent.getAppt();
        this._scheduleView = new ZmFreeBusySchedulerView(this, this._attendees, this._controller,
            this._dateInfo, appt, this.showConflicts.bind(this));
        this._scheduleView.reparentHtmlElement(this._schedulerContainer);

        var closeCallback = this._onSuggestionClose.bind(this);
        this._scheduleAssistant = new ZmScheduleAssistantView(this, this._controller, this, closeCallback);
        this._scheduleAssistant.reparentHtmlElement(this._suggestions);
        AjxTimedAction.scheduleAction(new AjxTimedAction(this, this.loadPreference), 300);
    }
    return this._scheduleView;    
};

ZmApptEditView.prototype._resetAttendeeCount =
function() {
	for (var i = 0; i < ZmFreeBusySchedulerView.FREEBUSY_NUM_CELLS; i++) {
		this._allAttendees[i] = 0;
		delete this._allAttendeesStatus[i];
	}
};


//TODO:
    // 1. Organizer/From is always Persona  - Done
    // 2. Remote Cals -  sentBy is Persona  - Done
    // 3. Appt. Summary body needs Persona details - Needs Action
    // 4. No Persona's Case  - Done

ZmApptEditView.prototype.setIdentity =
function(identity){
    if (this.identitySelect) {
        identity = identity || appCtxt.getIdentityCollection().defaultIdentity;
        this.identitySelect.setSelectedValue(identity.id);
    }
};

ZmApptEditView.prototype.getIdentity =
function() {

	if (this.identitySelect) {
		var collection = appCtxt.getIdentityCollection();
		var val = this.identitySelect.getValue();
		var identity = collection.getById(val);
		return identity ? identity : collection.defaultIdentity;
	}
};

ZmApptEditView.prototype._setIdentityVisible =
function() {
	if (!appCtxt.get(ZmSetting.IDENTITIES_ENABLED)) return;

	var div = document.getElementById(this._htmlElId + "_identityContainer");
	if (!div) return;

	var visible = appCtxt.getIdentityCollection().getSize() > 1;
    Dwt.setVisible(div, visible);
};

ZmApptEditView.prototype._getIdentityOptions =
function() {
	var options = [];
	var identityCollection = appCtxt.getIdentityCollection();
	var identities = identityCollection.getIdentities();
    var defaultIdentity = identityCollection.defaultIdentity;
	for (var i = 0, count = identities.length; i < count; i++) {
		var identity = identities[i];
		options.push(new DwtSelectOptionData(identity.id, this._getIdentityText(identity), (identity.id == defaultIdentity.id)));
	}
	return options;
};

ZmApptEditView.prototype._getIdentityText =
function(identity, account) {
	var name = identity.name;
	if (identity.isDefault && name == ZmIdentity.DEFAULT_NAME) {
		name = account ? account.getDisplayName() : ZmMsg.accountDefault;
	}

	// default replacement parameters
	var defaultIdentity = appCtxt.getIdentityCollection().defaultIdentity;
	var params = [
		name,
		(identity.sendFromDisplay || ''),
		identity.sendFromAddress,
		ZmMsg.accountDefault,
		appCtxt.get(ZmSetting.DISPLAY_NAME),
		defaultIdentity.sendFromAddress
	];

	// get appropriate pattern
	var pattern;
	if (identity.isDefault) {
		pattern = ZmMsg.identityTextPrimary;
	}
	else if (identity.isFromDataSource) {
		var ds = appCtxt.getDataSourceCollection().getById(identity.id);
		params[1] = ds.userName || '';
		params[2] = ds.getEmail();
		var provider = ZmDataSource.getProviderForAccount(ds);
		pattern = (provider && ZmMsg["identityText-"+provider.id]) || ZmMsg.identityTextExternal;
	}
	else {
		pattern = ZmMsg.identityTextPersona;
	}

	// format text
	return AjxMessageFormat.format(pattern, params);
};

ZmApptEditView.prototype._addressButtonListener =
function(ev) {
	var obj = ev ? DwtControl.getTargetControl(ev) : null;
    this._forwardToField.setEnabled(false);
	if (!this._contactPicker) {
		AjxDispatcher.require("ContactsCore");
		var buttonInfo = [
			{ id: AjxEmailAddress.TO,	label: ZmMsg.toLabel }
		];
		this._contactPicker = new ZmContactPicker(buttonInfo);
		this._contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._contactPickerOkCallback, this);
		this._contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._contactPickerCancelCallback, this);
	}

	var addrList = {};
	var addrs = !this._useAcAddrBubbles && this._collectForwardAddrs();
	var type = AjxEmailAddress.TO;
	addrList[type] = this._useAcAddrBubbles ? this._forwardToField.getAddresses(true) :
											  addrs[type] && addrs[type].good.getArray();

    var str = (this._forwardToField.getValue() && !(addrList[type] && addrList[type].length)) ? this._forwardToField.getValue() : "";
	this._contactPicker.popup(type, addrList, str);
};

ZmApptEditView.prototype._attendeesButtonListener =
function(addrType, ev) {
	var obj = ev ? DwtControl.getTargetControl(ev) : null;
    var inputObj = this._attInputField[addrType]; 
    inputObj.setEnabled(false);
    var contactPicker = this._attendeePicker[addrType];
	if (!contactPicker) {
		AjxDispatcher.require("ContactsCore");
		var buttonInfo = [
			{ id: AjxEmailAddress.TO,	label: ZmMsg.toLabel }
		];
		contactPicker = this._attendeePicker[addrType] = new ZmContactPicker(buttonInfo);
		contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._attendeePickerOkCallback, this, [addrType]);
		contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._attendeePickerCancelCallback, this, [addrType]);
	}

	var addrList = {};
	var addrs = !this._useAcAddrBubbles && this._collectAddrs(inputObj.getValue());
	var type = AjxEmailAddress.TO;
	addrList[type] = this._useAcAddrBubbles ? this._attInputField[addrType].getAddresses(true) :
											  addrs[type] && addrs[type].good.getArray();
		
    var str = (inputObj.getValue() && !(addrList[type] && addrList[type].length)) ? inputObj.getValue() : "";
	contactPicker.popup(type, addrList, str);
};

ZmApptEditView.prototype._locationButtonListener =
function(addrType, ev) {
	var obj = ev ? DwtControl.getTargetControl(ev) : null;
    var inputObj = this._attInputField[addrType];
    if(inputObj) inputObj.setEnabled(false);
    var locationPicker = this.getAttendeePicker(addrType);
	locationPicker.popup();
};

ZmApptEditView.prototype.getAttendeePicker =
function(addrType) {
    var attendeePicker = this._attendeePicker[addrType];
	if (!attendeePicker) {
		attendeePicker = this._attendeePicker[addrType] = new ZmAttendeePicker(this, this._attendees, this._controller, addrType, this._dateInfo);
		attendeePicker.registerCallback(DwtDialog.OK_BUTTON, this._locationPickerOkCallback, this, [addrType]);
		attendeePicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._attendeePickerCancelCallback, this, [addrType]);
        attendeePicker.initialize(this._calItem, this._mode, this._isDirty, this._apptComposeMode);
	}
    return attendeePicker;
};

// Transfers addresses from the contact picker to the appt compose view.
ZmApptEditView.prototype._attendeePickerOkCallback =
function(addrType, addrs) {

    this._attInputField[addrType].setEnabled(true);
    var vec = (addrs instanceof AjxVector) ? addrs : addrs[AjxEmailAddress.TO];
	this._setAddresses(this._attInputField[addrType], vec);

    this._activeInputField = addrType; 
    this._handleAttendeeField(addrType);
	this._attendeePicker[addrType].popdown();
};

/**
 * One-stop shop for setting address field content. The input may be either a DwtInputField or a
 * ZmAddressInputField. The address(es) passed in may be a string, an array, or an AjxVector. The
 * latter two types may have a member type of string, AjxEmailAddress, or ZmContact/ZmResource.
 * 
 * @param addrInput
 * @param addrs
 * @param type
 * @param shortForm
 * 
 * @private
 */
ZmApptEditView.prototype._setAddresses =
function(addrInput, addrs, type, shortForm) {

	// non-person attendees are shown in short form by default
	shortForm = (shortForm || (type && type != ZmCalBaseItem.PERSON));

	// if we get a string with multiple email addresses, split it
	if (typeof addrs == "string" && (addrs.indexOf(ZmAppt.ATTENDEES_SEPARATOR) != -1)) {
		var result = AjxEmailAddress.parseEmailString(addrs, type);
		addrs = result.good;
	}

	// make sure we have an array to deal with
	addrs = (addrs instanceof AjxVector) ? addrs.getArray() : (typeof addrs == "string") ? [addrs] : addrs;

	if (this._useAcAddrBubbles) {
		addrInput.clear();
		if (addrs && addrs.length) {
            var len = addrs.length;
			for (var i = 0; i < len; i++) {
				var addr = addrs[i];
				if (addr) {
					var addrStr, email, match;
					if (typeof addr == "string") {
						addrStr = addr;
					}
					else if (addr.isAjxEmailAddress) {
						addrStr = addr.toString(shortForm);
						match = {isDL: addr.isGroup && addr.canExpand, email: addrStr};
					}
					else if (addr instanceof ZmContact) {
						email = addr.getEmail(true);
                        //bug: 57858 - give preference to lookup email address if its present
                        //bug:60427 to show display name format the lookupemail
                        addrStr = addr.getLookupEmail() ? (new AjxEmailAddress(addr.getLookupEmail(),null,addr.getFullNameForDisplay())).toString() : ZmApptViewHelper.getAttendeesText(addr, type);
                        match = {isDL: addr.isGroup && addr.canExpand, email: addrStr};
					}
					addrInput.addBubble({address:addrStr, match:match, skipNotify:true});
				}
			}
		}
	}
	else {
		var list = [];
		if (addrs && addrs.length) {
			for (var i = 0, len = addrs.length; i < len; i++) {
				var addr = addrs[i];
				if (addr) {
					if (typeof addr == "string") {
						list.push(addr);
					}
					else if (addr.isAjxEmailAddress) {
						list.push(addr.toString(shortForm));
					}
					else if (addr instanceof ZmContact) {
						var email = addr.getEmail(true);
						list.push(email.toString(shortForm));
					}
				}
			}
		}
		var addrStr = (list.length > 0) ? list.join(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR : "";
		addrInput.setValue(addrStr || "");
	}
};

// Transfers addresses from the location/resource picker to the appt compose view.
ZmApptEditView.prototype._locationPickerOkCallback =
function(addrType, attendees) {

    this.parent.updateAttendees(attendees, addrType);

    if(this._attInputField[addrType]) {
        this._attInputField[addrType].setEnabled(true);
        this._activeInputField = addrType;        
    }

    if(addrType == ZmCalBaseItem.LOCATION || addrType == ZmCalBaseItem.EQUIPMENT) {
        this.updateAttendeesCache(addrType, this._attendees[addrType].getArray());
        var attendeeStr = ZmApptViewHelper.getAttendeesString(this._attendees[addrType].getArray(), addrType);
        this.setAttendeesField(addrType, attendeeStr);        
    }
    
	this._attendeePicker[addrType].popdown();
};

// Updates the local cache with attendee objects
ZmApptEditView.prototype.updateAttendeesCache =
function(addrType, attendees){

    if (!(attendees && attendees.length)) return "";

    var a = [];
    for (var i = 0; i < attendees.length; i++) {
        var attendee = attendees[i];
        var addr = attendee.getLookupEmail() || attendee.getEmail();
        var key = addr + "-" + addrType;
        this._attendeesHashMap[key] = attendee;
    }
};

ZmApptEditView.prototype.setAttendeesField =
function(addrType, attendees){
    this._setAddresses(this._attInputField[addrType], attendees);
    this._handleAttendeeField(addrType);
};


ZmApptEditView.prototype._attendeePickerCancelCallback =
function(addrType) {
    if(this._attInputField[addrType]) {
        this._handleAttendeeField(addrType);
        this._attInputField[addrType].setEnabled(true);
    }
};

// Transfers addresses from the contact picker to the appt compose view.
ZmApptEditView.prototype._contactPickerOkCallback =
function(addrs) {
    this._forwardToField.setEnabled(true);
    var vec = (addrs instanceof AjxVector) ? addrs : addrs[AjxEmailAddress.TO];
	this._setAddresses(this._forwardToField, vec);
    this._activeInputField = ZmCalBaseItem.PERSON;
    this._handleAttendeeField(ZmCalBaseItem.PERSON);
	//this._contactPicker.removePopdownListener(this._controller._dialogPopdownListener);
	this._contactPicker.popdown();
};

ZmApptEditView.prototype._contactPickerCancelCallback =
function() {
    this._handleAttendeeField(ZmCalBaseItem.PERSON);
    this._forwardToField.setEnabled(true);
};

ZmApptEditView.prototype.getForwardAddress =
function() {
    return this._collectForwardAddrs();
};

// Grab the good addresses out of the forward to field
ZmApptEditView.prototype._collectForwardAddrs =
function() {
    return this._collectAddrs(this._forwardToField.getValue());
};

// Grab the good addresses out of the forward to field
ZmApptEditView.prototype._collectAddrs =
function(addrStr) {
    var addrs = {};
    addrs[ZmApptEditView.BAD] = new AjxVector();
    var val = AjxStringUtil.trim(addrStr);
    if (val.length == 0) return addrs;
    var result = AjxEmailAddress.parseEmailString(val, AjxEmailAddress.TO, false);
    if (result.all.size() == 0) return addrs;
    addrs.gotAddress = true;
    addrs[AjxEmailAddress.TO] = result;
    if (result.bad.size()) {
        addrs[ZmApptEditView.BAD].addList(result.bad);
        addrs.badType = AjxEmailAddress.TO;
    }
    return addrs;
};


ZmApptEditView.prototype.initialize =
function(calItem, mode, isDirty, apptComposeMode) {
    this._editViewInitialized = false;
    this._isForward = (apptComposeMode == ZmApptComposeView.FORWARD);
    this._isProposeTime = (apptComposeMode == ZmApptComposeView.PROPOSE_TIME);
    this._apptComposeMode = apptComposeMode;

    ZmCalItemEditView.prototype.initialize.call(this, calItem, mode, isDirty, apptComposeMode);

    var scheduleView = this.getScheduleView();
    scheduleView.initialize(calItem, mode, isDirty, apptComposeMode);
};

ZmApptEditView.prototype.isSuggestionsNeeded =
function() {
    if (appCtxt.isOffline) {
        var ac = window["appCtxt"].getAppController();
        return !this._isForward && this.GROUP_CALENDAR_ENABLED && ac._isPrismOnline && ac._isUserOnline;
    } else {
        return !this._isForward && this.GROUP_CALENDAR_ENABLED;
    }
};

ZmApptEditView.prototype.getCalendarAccount =
function() {
	var cal = appCtxt.getById(this._folderSelect.getValue());
	return cal && cal.getAccount();
};

ZmApptEditView.prototype._folderListener =
function() {
	var calId = this._folderSelect.getValue();
	var cal = appCtxt.getById(calId);

	// bug: 48189 - Hide schedule tab for non-ZCS acct
	if (appCtxt.isOffline) {
        var currAcct = cal.getAccount();
        appCtxt.accountList.setActiveAccount(currAcct);
		this.setSchedulerVisibility(currAcct.isZimbraAccount && !currAcct.isMain);
	}

	var acct = appCtxt.getActiveAccount();
	var id = String(cal.id);
	var isRemote = (id.indexOf(":") != -1) && (id.indexOf(acct.id) != 0);
	var isEnabled = !isRemote || cal.hasPrivateAccess();

    this._privateCheckbox.disabled = !isEnabled;

    if(this._schedulerOpened) {
        var organizer = this._isProposeTime ? this.getCalItemOrganizer() : this.getOrganizer();
        this._scheduleView.update(this._dateInfo, organizer, this._attendees);
        this._scheduleView.updateFreeBusy();
    }

    if(this._calItem && this._calItem.organizer != this._calendarOrgs[calId]) {
        this._calItem.setOrganizer(this._calendarOrgs[calId]);
    }
};

ZmApptEditView.prototype.setSchedulerVisibility =
function(visible) {
    Dwt.setVisible(this._schedulerOptions, visible);
    Dwt.setVisible(this._schedulerContainer, visible);
};

ZmApptEditView.prototype._resetFolderSelect =
function(calItem, mode) {
	ZmCalItemEditView.prototype._resetFolderSelect.call(this, calItem, mode);
	this._resetAutocompleteListView(appCtxt.getById(calItem.folderId));
};

ZmApptEditView.prototype._resetAttendeesField =
function(enabled) {
	var attField = this._attInputField[ZmCalBaseItem.PERSON];
	if (attField) {
		attField.setEnabled(enabled);
        this._adjustAddrHeight(attField.getInputElement());
	}

	attField = this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON];
	if (attField) {
		attField.setEnabled(enabled);
        this._adjustAddrHeight(attField.getInputElement());
	}
};

ZmApptEditView.prototype._folderPickerCallback =
function(dlg, folder) {
	ZmCalItemEditView.prototype._folderPickerCallback.call(this, dlg, folder);
	this._resetAutocompleteListView(folder);
	if (appCtxt.isOffline) {
		this._resetAttendeesField(!folder.getAccount().isMain);
	}
};

ZmApptEditView.prototype._resetAutocompleteListView =
function(folder) {
	if (appCtxt.multiAccounts && this._acContactsList) {
		this._acContactsList.setActiveAccount(folder.getAccount());
	}
};

ZmApptEditView.prototype._initAutocomplete =
function() {

	var acCallback = this._autocompleteCallback.bind(this);
	var keyPressCallback = this._onAttendeesChange.bind(this);
	this._acList = {};

	var params = {
		dataClass:			appCtxt.getAutocompleter(),
		matchValue:			ZmAutocomplete.AC_VALUE_FULL,
		compCallback:		acCallback,
		keyPressCallback:	keyPressCallback,
		options:			{addrBubbles:this._useAcAddrBubbles}
	};

	// autocomplete for attendees (required and optional) and forward recipients
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this.GROUP_CALENDAR_ENABLED)	{
		params.contextId = [this._controller.getCurrentViewId(), ZmCalBaseItem.PERSON].join("-");
		var aclv = this._acContactsList = new ZmAutocompleteListView(params);
		this._setAutocompleteHandler(aclv, ZmCalBaseItem.PERSON);
		this._setAutocompleteHandler(aclv, ZmCalBaseItem.OPTIONAL_PERSON);
        if (this._forwardToField) {
			this._setAutocompleteHandler(aclv, ZmCalBaseItem.FORWARD, this._forwardToField);
        }
	}

	if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
		// autocomplete for locations		
		params.keyUpCallback = this._handleLocationChange.bind(this);
        //params.matchValue = ZmAutocomplete.AC_VALUE_NAME;
		params.options = {addrBubbles:	this._useAcAddrBubbles,
						  type:			ZmAutocomplete.AC_TYPE_LOCATION};
		if (AjxEnv.isIE) {
			params.keyDownCallback = this._resetKnownLocation.bind(this);
		}
		params.contextId = [this._controller.getCurrentViewId(), ZmCalBaseItem.LOCATION].join("-");
		var aclv = this._acLocationsList = new ZmAutocompleteListView(params);
		this._setAutocompleteHandler(aclv, ZmCalBaseItem.LOCATION);
	}

    if (appCtxt.get(ZmSetting.GAL_ENABLED) && this.GROUP_CALENDAR_ENABLED) {
		// autocomplete for locations
		var app = appCtxt.getApp(ZmApp.CALENDAR);
        params.keyUpCallback = this._handleResourceChange.bind(this);
        //params.matchValue = ZmAutocomplete.AC_VALUE_NAME;
        params.options = {addrBubbles:	this._useAcAddrBubbles,
                          type:ZmAutocomplete.AC_TYPE_EQUIPMENT};		
		params.contextId = [this._controller.getCurrentViewId(), ZmCalBaseItem.EQUIPMENT].join("-");
		var aclv = this._acResourcesList = new ZmAutocompleteListView(params);
        this._setAutocompleteHandler(aclv, ZmCalBaseItem.EQUIPMENT);
	}
};

ZmApptEditView.prototype._handleResourceChange =
function(event, aclv, result) {
	var val = this._attInputField[ZmCalBaseItem.EQUIPMENT].getValue();
	if (val == "") {
		this.parent.updateAttendees([], ZmCalBaseItem.EQUIPMENT);
		this._isKnownResource = false;
	}
};


ZmApptEditView.prototype._setAutocompleteHandler =
function(aclv, attType, input) {

	input = input || this._attInputField[attType];
	var aifId = null;
	if (this._useAcAddrBubbles) {
		aifId = input._htmlElId;
		input.setAutocompleteListView(aclv);
	}
	aclv.handle(input.getInputElement(), aifId);

	this._acList[attType] = aclv;
};

ZmApptEditView.prototype._handleLocationChange =
function(event, aclv, result) {
	var val = this._attInputField[ZmCalBaseItem.LOCATION].getValue();
	if (val == "") {
		this.parent.updateAttendees([], ZmCalBaseItem.LOCATION);
		this._isKnownLocation = false;
	}
};

ZmApptEditView.prototype._autocompleteCallback =
function(text, el, match) {
	if (!match) {
		DBG.println(AjxDebug.DBG1, "ZmApptEditView: match empty in autocomplete callback; text: " + text);
		return;
	}
	var attendee = match.item;
    var type = el && el._attType;
	if (attendee) {
		if (type == ZmCalBaseItem.FORWARD) {
            DBG.println("forward auto complete match : " + match)
            return;
        }
		if (type == ZmCalBaseItem.LOCATION || type == ZmCalBaseItem.EQUIPMENT) {
			var name = ZmApptViewHelper.getAttendeesText(attendee);
			if(name) {
				this._locationTextMap[name] = attendee;
			}
			var locations = text.split(/[\n,;]/);
			var newAttendees = [];
			for(var i = 0; i < locations.length; i++) {
				var l = AjxStringUtil.trim(locations[i]);
				if(this._locationTextMap[l]) {
					newAttendees.push(this._locationTextMap[l]);
				}
			}
			attendee = newAttendees;
		}

        //controller tracks both optional & required attendees in common var
        if (type == ZmCalBaseItem.OPTIONAL_PERSON) {
            this.setAttendeesRole(attendee, ZmCalItem.ROLE_OPTIONAL);
            type = ZmCalBaseItem.PERSON;
        }

		this.parent.updateAttendees(attendee, type, (type == ZmCalBaseItem.LOCATION || type == ZmCalBaseItem.EQUIPMENT )?ZmApptComposeView.MODE_REPLACE : ZmApptComposeView.MODE_ADD);

		if (type == ZmCalBaseItem.LOCATION) {
			this._isKnownLocation = true;
		}else if(type == ZmCalBaseItem.EQUIPMENT){
            this._isKnownResource = true;
        }

        this._updateScheduler(type, attendee);
        
	}else if(match.email){
        if((type == ZmCalBaseItem.PERSON || type == ZmCalBaseItem.OPTIONAL_PERSON) && this._scheduleAssistant) {
            var attendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.PERSON].getValue());
            this.setAttendeesRole(attendees, (type == ZmCalBaseItem.OPTIONAL_PERSON) ? ZmCalItem.ROLE_OPTIONAL : ZmCalItem.ROLE_REQUIRED);
            if (type == ZmCalBaseItem.OPTIONAL_PERSON) {
                type = ZmCalBaseItem.PERSON;
            }
            this.parent.updateAttendees(attendees, type, (type == ZmCalBaseItem.LOCATION )?ZmApptComposeView.MODE_REPLACE : ZmApptComposeView.MODE_ADD);
            this._updateScheduler(type, attendees);
        }
    }

    this.updateToolbarOps();
};

ZmApptEditView.prototype._handleRemovedAttendees =
function() {
    this.handleAttendeeChange();
};

ZmApptEditView.prototype._addEventHandlers =
function() {
	var edvId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	if(this._showOptional) Dwt.setHandler(this._showOptional, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
    if(this._showResources) Dwt.setHandler(this._showResources, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmCalItemEditView._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmCalItemEditView._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);
	Dwt.setHandler(this._startDateField, DwtEvent.ONFOCUS, ZmCalItemEditView._onFocus);
	Dwt.setHandler(this._endDateField, DwtEvent.ONFOCUS, ZmCalItemEditView._onFocus);
    if (this.GROUP_CALENDAR_ENABLED) {
        Dwt.setHandler(this._suggestTime, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
    }
    Dwt.setHandler(this._suggestLocation, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
    Dwt.setHandler(this._locationStatusAction, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);

	this._allDayCheckbox._editViewId = this._repeatDescField._editViewId = edvId;
	this._startDateField._editViewId = this._endDateField._editViewId = edvId;
    if(this._showOptional) this._showOptional._editViewId = edvId;
    if(this._showResources) this._showResources._editViewId = edvId;
    if (this.GROUP_CALENDAR_ENABLED) {
        this._suggestTime._editViewId = edvId;
    }
    this._suggestLocation._editViewId = edvId;
    this._locationStatusAction._editViewId = edvId;

	var inputFields = [this._attendeesInputField, this._optAttendeesInputField,
					   this._locationInputField, this._forwardToField, this._resourceInputField];
	for (var i = 0; i < inputFields.length; i++) {
        if(!inputFields[i]) continue;
		var inputEl = inputFields[i].getInputElement();
        inputEl._editViewId = edvId;
		inputEl.onfocus = AjxCallback.simpleClosure(this._handleOnFocus, this, inputEl);
		inputEl.onblur = AjxCallback.simpleClosure(this._handleOnBlur, this, inputEl);
        inputEl.onkeyup = AjxCallback.simpleClosure(this._onAttendeesChange, this);
	}

    if (this._subjectField) {
        var inputEl = this._subjectField.getInputElement();
		inputEl.onblur = AjxCallback.simpleClosure(this._handleSubjectOnBlur, this, inputEl);
		inputEl.onfocus = AjxCallback.simpleClosure(this._handleSubjectOnFocus, this, inputEl);
    }
};

// cache all input fields so we dont waste time traversing DOM each time
ZmApptEditView.prototype._cacheFields =
function() {
	ZmCalItemEditView.prototype._cacheFields.call(this);
	this._allDayCheckbox = document.getElementById(this._allDayCheckboxId);
};

ZmApptEditView.prototype._resetTimezoneSelect =
function(calItem, isAllDayAppt) {
	this._tzoneSelectStart.setSelectedValue(calItem.timezone);
	this._tzoneSelectEnd.setSelectedValue(calItem.endTimezone || calItem.timezone);
    this.handleTimezoneOverflow();
};

ZmApptEditView.prototype._setTimezoneVisible =
function(dateInfo) {
    var showTimezones = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) || dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	var showStartTimezone = showTimezones && !dateInfo.isAllDay;
	var showEndTimezone = showStartTimezone && this._repeatSelect && this._repeatSelect.getValue()=="NON";

    if (this._tzoneSelectStartElement) {
        Dwt.setVisible(this._tzoneSelectStartElement, showStartTimezone);
        Dwt.setVisibility(this._tzoneSelectStartElement, showStartTimezone);
    }

    if (this._tzoneSelectEndElement) {
        Dwt.setVisible(this._tzoneSelectEndElement, showEndTimezone);
        Dwt.setVisibility(this._tzoneSelectEndElement, showEndTimezone);
    }
};

ZmApptEditView.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	this._setTimezoneVisible(this._dateInfo);
};

ZmApptEditView.CHANGES_LOCAL            = 1;
ZmApptEditView.CHANGES_SIGNIFICANT      = 2;
ZmApptEditView.CHANGES_INSIGNIFICANT    = 3;
ZmApptEditView.CHANGES_TIME_RECURRENCE  = 4;


ZmApptEditView.prototype._getFormValue =
function(type, attribs){

   var vals = [];
   attribs = attribs || {};
    
   switch(type){

       case ZmApptEditView.CHANGES_LOCAL:
            vals.push(this._folderSelect.getValue());           // Folder
            vals.push(this._showAsSelect.getValue());           // Busy Status
            if(!attribs.excludeReminder){                       // Reminder
                vals.push(this._reminderSelectInput.getValue());
                vals.push(this._reminderEmailCheckbox.isSelected());
                vals.push(this._reminderDeviceEmailCheckbox.isSelected());
            }
            break;

       case ZmApptEditView.CHANGES_SIGNIFICANT:

           vals = this._getTimeAndRecurrenceChanges();

           if (!attribs.excludeAttendees) {                    //Attendees
               vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.PERSON].getArray(), ZmCalBaseItem.PERSON, false, true));
           }
           if(!attribs.excludeLocation) {
               vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.LOCATION].getArray(), ZmCalBaseItem.LOCATION, false, true));
               //location can even be a normal label text
               vals.push(this._locationInputField.getValue());
           }
           if(!attribs.excludeEquipment) {
               vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.EQUIPMENT].getArray(), ZmCalBaseItem.EQUIPMENT, false, true));
           }

           if(this._isForward && !attribs.excludeAttendees) {
               vals.push(this._forwardToField.getValue()); //ForwardTo
           }
           if(this.identitySelect){
               vals.push(this.getIdentity().id);            //Identity Select
           }
           break;

       case ZmApptEditView.CHANGES_INSIGNIFICANT:
           vals.push(this._subjectField.getValue());
           vals.push(this._notesHtmlEditor.getContent());
           vals.push(this._privateCheckbox.checked ? ZmApptEditView.PRIVACY_OPTION_PRIVATE : ZmApptEditView.PRIVACY_OPTION_PUBLIC);
           //TODO: Attachments, Priority    
           break;

       case ZmApptEditView.CHANGES_TIME_RECURRENCE:
           vals = this._getTimeAndRecurrenceChanges();
           break;
   }

   vals = vals.join("|").replace(/\|+/, "|");

   return vals;
};

ZmApptEditView.prototype._getTimeAndRecurrenceChanges = function(){
           var vals = [];
           var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
           var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
           startDate = this._startTimeSelect.getValue(startDate);
           endDate = this._endTimeSelect.getValue(endDate);
           vals.push(
                   AjxDateUtil.getServerDateTime(startDate),       // Start DateTime
                   AjxDateUtil.getServerDateTime(endDate)          // End DateTime
                   );
           if (Dwt.getDisplay(this._tzoneSelectStart.getHtmlElement()) != Dwt.DISPLAY_NONE) {
               vals.push(this._tzoneSelectStart.getValue());    // Start timezone
               vals.push(this._tzoneSelectEnd.getValue());      // End timezone
           }
           vals.push("" + this._allDayCheckbox.checked);       // All Day Appt.
           //TODO: Detailed Recurrence, Repeat support
           vals.push(this._repeatSelect.getValue());        //Recurrence

           return vals;
}

// Returns a string representing the form content
ZmApptEditView.prototype._formValue =
function(excludeAttendees, excludeReminder) {

    var attribs = {
        excludeAttendees: excludeAttendees,
        excludeReminder: excludeReminder
    };

    var sigFormValue      = this._getFormValue(ZmApptEditView.CHANGES_SIGNIFICANT, attribs);
    var insigFormValue    = this._getFormValue(ZmApptEditView.CHANGES_INSIGNIFICANT, attribs);
    var localFormValue    = this._getFormValue(ZmApptEditView.CHANGES_LOCAL, attribs);

    var formVals = [];
    formVals.push(sigFormValue, insigFormValue, localFormValue);
    formVals = formVals.join('|').replace(/\|+/, "|");
    return formVals;
};


ZmApptEditView.prototype.checkIsDirty =
function(type, attribs){
    return (this._apptFormValue[type] != this._getFormValue(type, attribs))
};

ZmApptEditView.prototype._keyValue =
function() {

    return this._getFormValue(ZmApptEditView.CHANGES_SIGNIFICANT,
                              {excludeAttendees: true, excludeEquipment: true});
};

// Listeners

ZmApptEditView.prototype._getDateTimeText =
function() {
    return this._dateInfo.startDate + "-" + this._dateInfo.startTimeStr + "_" +
           this._dateInfo.endDate   + "_" + this._dateInfo.endTimeStr;

}

ZmApptEditView.prototype._timeChangeListener =
function(ev, id) {
	ZmTimeInput.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField, this._dateInfo, id);
	var oldTimeInfo = this._getDateTimeText();

    ZmApptViewHelper.getDateInfo(this, this._dateInfo);
    var newTimeInfo = this._getDateTimeText();
    if (oldTimeInfo != newTimeInfo) {

        this._dateInfo.isTimeModified = true;

        if(this._schedulerOpened) {
            this._scheduleView._timeChangeListener(ev, id);
        }

        if(this._scheduleAssistant) this._scheduleAssistant.updateTime(true, true);

        var durationInfo = this.getDurationInfo();
        this._locationConflictAppt.startDate = new Date(durationInfo.startTime);
        this._locationConflictAppt.endDate   = new Date(durationInfo.endTime);
        this.locationConflictChecker();
    }
};

ZmApptEditView.prototype._recurChangeForLocationConflict =
function() {
    this._getRecurrence(this._locationConflictAppt);
    this.locationConflictChecker();
}

ZmApptEditView.prototype._dateTimeChangeForLocationConflict =
function(oldTimeInfo) {
    var newTimeInfo = this._getDateTimeText();
    if (oldTimeInfo != newTimeInfo) {
        var durationInfo = this.getDurationInfo();
        this._locationConflictAppt.startDate = new Date(durationInfo.startTime);
        this._locationConflictAppt.endDate   = new Date(durationInfo.endTime);
        this.locationConflictChecker();
    }
}

ZmApptEditView.prototype._dateCalSelectionListener =
function(ev) {
    var oldTimeInfo = this._getDateTimeText();

    ZmCalItemEditView.prototype._dateCalSelectionListener.call(this, ev);
    if(this._schedulerOpened) {
        ZmApptViewHelper.getDateInfo(this, this._dateInfo);
        this._scheduleView._updateFreeBusy();
    }
    
    if(this._scheduleAssistant) this._scheduleAssistant.updateTime(true, true);

    this._dateTimeChangeForLocationConflict(oldTimeInfo);
};


ZmApptEditView.prototype.handleTimezoneOverflow =
function() {
    var timezoneTxt = this._tzoneSelectStart.getText();
    var limit = AjxEnv.isIE ? 25 : 30;
    if(timezoneTxt.length > limit) {
        var newTimezoneTxt = timezoneTxt.substring(0, limit) + '...';
        this._tzoneSelectStart.setText(newTimezoneTxt);
    }
    var option = this._tzoneSelectStart.getSelectedOption();
    this._tzoneSelectStart.setToolTipContent(option ? option.getDisplayValue() : timezoneTxt);
    timezoneTxt = this._tzoneSelectEnd.getText();
    if(timezoneTxt.length > limit) {
        var newTimezoneTxt = timezoneTxt.substring(0, limit) + '...';
        this._tzoneSelectEnd.setText(newTimezoneTxt);
    }
    option = this._tzoneSelectEnd.getSelectedOption();
    this._tzoneSelectEnd.setToolTipContent(option ? option.getDisplayValue() : timezoneTxt);
};

ZmApptEditView.prototype._timezoneListener =
function(ev) {
    var oldTZ = this._dateInfo.timezone;
    var dwtSelect = ev.item.parent.parent;
    var type = dwtSelect ? dwtSelect.getData(ZmApptEditView.TIMEZONE_TYPE) : ZmApptEditView.START_TIMEZONE;
    //bug: 55256 - Changing start timezone should auto-change end timezone
    if(type == ZmApptEditView.START_TIMEZONE) {
        var tzValue = dwtSelect.getValue();
        this._tzoneSelectEnd.setSelectedValue(tzValue);
    }
    this.handleTimezoneOverflow();
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
    if(this._schedulerOpened) {
        //this._controller.getApp().getFreeBusyCache().clearCache();
        this._scheduleView._timeChangeListener(ev, id);
    }

    if (oldTZ != this._dateInfo.timezone) {
        this._locationConflictAppt.timezone = this._dateInfo.timezone;
        this.locationConflictChecker();
    }
};


ZmApptEditView.prototype._repeatChangeListener =
function(ev) {
    ZmCalItemEditView.prototype._repeatChangeListener.call(this, ev);
    this._setTimezoneVisible(this._dateInfo);
    var newSelectVal = ev._args.newValue;
    if (newSelectVal != "CUS") {
        // CUS (Custom) launches a dialog. Otherwise act upon the change here
        this._locationConflictAppt.setRecurType(newSelectVal);
        this.locationConflictChecker();
    }
};

/**
* Sets the values of the attendees input fields to reflect the current lists of
* attendees.
*/
ZmApptEditView.prototype._setAttendees =
function() {

    for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		var attendees = this._attendees[type].getArray();
		var numAttendees = attendees.length;
		var addrInput = this._attInputField[type];
		var curVal = AjxStringUtil.trim(this._attInputField[type].getValue());
		if (type == ZmCalBaseItem.PERSON) {
			var reqAttendees = ZmApptViewHelper.filterAttendeesByRole(attendees, ZmCalItem.ROLE_REQUIRED);
			var optAttendees = ZmApptViewHelper.filterAttendeesByRole(attendees, ZmCalItem.ROLE_OPTIONAL);
            //bug: 62008 - always compute all the required/optional arrays before setting them to avoid race condition
            //_setAddress is a costly operation which will trigger focus listeners and change the state of attendees
            this._setAddresses(addrInput, reqAttendees, type);
			this._setAddresses(this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON], optAttendees, type);
		}
		else if (type == ZmCalBaseItem.LOCATION) {
			if (!curVal || numAttendees || this._isKnownLocation) {
				this._setAddresses(addrInput, attendees, type);
				this._isKnownLocation = true;
			}
		}
		else if (type == ZmCalBaseItem.EQUIPMENT) {
			if (!curVal || numAttendees) {
				if (numAttendees) {
					this._toggleResourcesField(true);
				}
				this._setAddresses(addrInput, attendees, type);
			}
		}
	}
};

ZmApptEditView.prototype.setApptLocation =
function(val) {
    this._setAddresses(this._attInputField[ZmCalBaseItem.LOCATION], val);
};

ZmApptEditView.prototype.getAttendees =
function(type) {
    return this.getAttendeesFromString(type, this._attInputField[type].getValue());
};

ZmApptEditView.prototype.getMode =
function(type) {
    return this._mode;
};

ZmApptEditView.prototype.getRequiredAttendeeEmails =
function() {
    var attendees = [];
    var inputField = this._attInputField[ZmCalBaseItem.PERSON];
    if(!inputField) { return attendees; } // input field can be null if zimbraFeatureGroupCalendarEnabled is FALSE

    var requiredEmails = inputField.getValue();
    var items = AjxEmailAddress.split(requiredEmails);
    for (var i = 0; i < items.length; i++) {

        var item = AjxStringUtil.trim(items[i]);
        if (!item) { continue; }

        var contact = AjxEmailAddress.parse(item);
        if (!contact) { continue; }        

        var email = contact.getAddress();
        if(email instanceof Array) email = email[0];

        attendees.push(email)
    }
    return attendees;
};

ZmApptEditView.prototype.getOrganizerEmail =
function() {
    var organizer = this.getOrganizer();
    var email = organizer.getEmail();
    if (email instanceof Array) {
        email = email[0];
    }
    return email;
};

ZmApptEditView.prototype._handleAttendeeField =
function(type, useException) {
	if (!this._activeInputField || !this.GROUP_CALENDAR_ENABLED) { return; }
	if (type != ZmCalBaseItem.LOCATION) {
		this._controller.clearInvalidAttendees();
	}

    return this._pickAttendeesInfo(type, useException);
};

ZmApptEditView.prototype._pickAttendeesInfo =
function(type, useException) {
    var attendees;

    if(type == ZmCalBaseItem.OPTIONAL_PERSON || type == ZmCalBaseItem.PERSON || type == ZmCalBaseItem.FORWARD) {
        attendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.PERSON].getValue());
        this.setAttendeesRole(attendees, ZmCalItem.ROLE_REQUIRED);
        
        var optionalAttendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].getValue(), true);
        this.setAttendeesRole(optionalAttendees, ZmCalItem.ROLE_OPTIONAL);
        
        var forwardAttendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.FORWARD].getValue(), false);
        this.setAttendeesRole(forwardAttendees, ZmCalItem.ROLE_REQUIRED);

        //merge optional & required attendees to update parent controller
        attendees.addList(optionalAttendees);
        attendees.addList(forwardAttendees);
        type = ZmCalBaseItem.PERSON;
    }else {
        var value = this._attInputField[type].getValue();        
        attendees = this.getAttendeesFromString(type, value);
    }

    return this._updateAttendeeFieldValues(type, attendees);
};

ZmApptEditView.prototype.setAttendeesRole =
function(attendees, role) {

    var personalAttendees = (attendees instanceof AjxVector) ? attendees.getArray() :
                (attendees instanceof Array) ? attendees : [attendees];

    for (var i = 0; i < personalAttendees.length; i++) {
        var attendee = personalAttendees[i];
        if(attendee) attendee.setParticipantRole(role);
    }
};

ZmApptEditView.prototype.resetParticipantStatus =
function() {
    var personalAttendees = this._attendees[ZmCalBaseItem.PERSON].getArray();
    for (var i = 0; i < personalAttendees.length; i++) {
        var attendee = personalAttendees[i];
        if(attendee) attendee.setParticipantStatus(ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
    }
};

ZmApptEditView.prototype.getAttendeesFromString =
function(type, value, markAsOptional) {
	var attendees = new AjxVector();
	var items = AjxEmailAddress.split(value);

	for (var i = 0; i < items.length; i++) {
		var item = AjxStringUtil.trim(items[i]);
		if (!item) { continue; }

        var contact = AjxEmailAddress.parse(item);
        if (!contact) {
            if(type != ZmCalBaseItem.LOCATION) this._controller.addInvalidAttendee(item);
            continue;
        }

        var addr = contact.getAddress();
        var key = addr + "-" + type;
        if(!this._attendeesHashMap[key]) {
            this._attendeesHashMap[key] = ZmApptViewHelper.getAttendeeFromItem(item, type);
        }
        var attendee = this._attendeesHashMap[key];
		if (attendee) {
            if(markAsOptional) attendee.setParticipantRole(ZmCalItem.ROLE_OPTIONAL);
			attendees.add(attendee);
		} else if (type != ZmCalBaseItem.LOCATION) {
			this._controller.addInvalidAttendee(item);
		}
	}

    return attendees;
};

ZmApptEditView.prototype._updateAttendeeFieldValues =
function(type, attendees) {
	// *always* force replace of attendees list with what we've found
	this.parent.updateAttendees(attendees, type);
    this._updateScheduler(type, attendees);
   appCtxt.notifyZimlets("onEditAppt_updateAttendees", [this]);//notify Zimlets
};

ZmApptEditView.prototype._updateScheduler =
function(type, attendees) {
        // *always* force replace of attendees list with what we've found

    attendees = (attendees instanceof AjxVector) ? attendees.getArray() :
                (attendees instanceof Array) ? attendees : [attendees];

    if (appCtxt.isOffline && !appCtxt.isZDOnline()) { return; }
    //avoid duplicate freebusy request by updating the view in sequence
    if(type == ZmCalBaseItem.PERSON) {
        this._scheduleView.setUpdateCallback(new AjxCallback(this, this.updateScheduleAssistant, [attendees, type]))
    }

    var organizer = this._isProposeTime ? this.getCalItemOrganizer() : this.getOrganizer();
    if(this._schedulerOpened) {
        this._scheduleView.update(this._dateInfo, organizer, this._attendees);
        this.autoSize();
    }else {
        if(this._schedulerOpened == null && attendees.length > 0 && !this._isForward) {
            this._toggleInlineScheduler(true);
        }else {
            // Update the schedule view even if it won't be visible - it generates
            // Free/Busy info for other components
            this._scheduleView.showMe();
            this._scheduleView.update(this._dateInfo, organizer, this._attendees);
            this.updateScheduleAssistant(attendees, type)
        }
    };

    this.updateToolbarOps();
};

ZmApptEditView.prototype.updateScheduleAssistant =
function(attendees, type) {
    if(this._scheduleAssistant && type == ZmCalBaseItem.PERSON) this._scheduleAssistant.updateAttendees(attendees);
};

ZmApptEditView.prototype._getAttendeeByName =
function(type, name) {
	if(!this._attendees[type]) {
		return null;
	}
	var a = this._attendees[type].getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i].getFullName() == name) {
			return a[i];
		}
	}
	return null;
};

ZmApptEditView.prototype._getAttendeeByItem =
function(item, type) {
	if(!this._attendees[type]) {
		return null;
	}
	var attendees = this._attendees[type].getArray();
	for (var i = 0; i < attendees.length; i++) {
		var value = (type == ZmCalBaseItem.PERSON) ? attendees[i].getEmail() : attendees[i].getFullName();
		if (item == value) {
			return attendees[i];
		}
	}
	return null;
};


// Callbacks

ZmApptEditView.prototype._emailValidator =
function(value) {
	// first parse the value string based on separator
	var attendees = AjxStringUtil.trim(value);
	if (attendees.length > 0) {
		var addrs = AjxEmailAddress.parseEmailString(attendees);
		if (addrs.bad.size() > 0) {
			throw ZmMsg.errorInvalidEmail2;
		}
	}

	return value;
};

ZmApptEditView.prototype._handleOnClick =
function(el) {
	if (el.id == this._allDayCheckboxId) {
		var edv = AjxCore.objectWithId(el._editViewId);
		ZmApptViewHelper.getDateInfo(edv, edv._dateInfo);
		this._showTimeFields(!el.checked);
        this.updateShowAsField(el.checked);
		if (el.checked && this._reminderSelect) {
			this._reminderSelect.setSelectedValue(1080);
		}
        this._scheduleView.handleTimeChange();
        if(this._scheduleAssistant) this._scheduleAssistant.updateTime(true, true);

        var durationInfo = this.getDurationInfo();
        this._locationConflictAppt.startDate = new Date(durationInfo.startTime);
        this._locationConflictAppt.endDate = new Date(durationInfo.startTime +
            AjxDateUtil.MSEC_PER_DAY);
        this._locationConflictAppt.allDayEvent = el.checked ? "1" : "0";
        this.locationConflictChecker();

	} else if(el.id == this._schButtonId || el.id == this._htmlElId + "_scheduleImage") {
        this._toggleInlineScheduler();
	} else if(el.id == this._showOptionalId) {
        this._toggleOptionalAttendees();
    }else if(el.id == this._showResourcesId){
        this._toggleResourcesField();
    }else if(el.id == this._suggestTimeId){
        this._showTimeSuggestions();
    }else if(el.id == this._suggestLocationId){
        this._showLocationSuggestions();
    }else if(el.id == this._locationStatusActionId){
        this._showLocationStatusAction();
    }else{
		ZmCalItemEditView.prototype._handleOnClick.call(this, el);
	}
};

ZmApptEditView.prototype._handleOnFocus =
function(inputEl) {
    if(!this._editViewInitialized) return;
	this._activeInputField = inputEl._attType;
    this.setFocusMember(inputEl);
};

ZmApptEditView.prototype.setFocusMember =
function(member) {
    var kbMgr = appCtxt.getKeyboardMgr();
    var tabGroup = kbMgr.getCurrentTabGroup();
    if (tabGroup) {
        tabGroup.setFocusMember(member);
    }
};

ZmApptEditView.prototype._handleOnBlur =
function(inputEl) {
    if(!this._editViewInitialized) return;
    this._handleAttendeeField(inputEl._attType);
	this._activeInputField = null;
};

ZmApptEditView.prototype._handleSubjectOnBlur =
function(inputEl) {
	var subject = AjxStringUtil.trim(this._subjectField.getValue());
    if(subject) {
        var buttonText = subject.substr(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT);
        appCtxt.getAppViewMgr().setTabTitle(this._controller.getCurrentViewId(), buttonText);
    }
};

ZmApptEditView.prototype._handleSubjectOnFocus =
function(inputEl) {
   this.setFocusMember(inputEl); 
};

ZmApptEditView.prototype._resetKnownLocation =
function() {
	this._isKnownLocation = false;
};

ZmApptEditView._switchTab =
function(type) {
	var appCtxt = window.parentAppCtxt || window.appCtxt;
	var tabView = appCtxt.getApp(ZmApp.CALENDAR).getApptComposeController().getTabView();
	var key = (type == ZmCalBaseItem.LOCATION)
		? tabView._tabKeys[ZmApptComposeView.TAB_LOCATIONS]
		: tabView._tabKeys[ZmApptComposeView.TAB_EQUIPMENT];
	tabView.switchToTab(key);
};

ZmApptEditView._showNotificationWarning =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	if (el && !el.checked) {
		var dialog = appCtxt.getMsgDialog();
		dialog.setMessage(ZmMsg.sendNotificationMailWarning, DwtMessageDialog.WARNING_STYLE);
		dialog.popup();
	}
};

ZmApptEditView.prototype._resizeNotes =
function() {
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	if (this._bodyFieldId != bodyFieldId) {
		this._bodyFieldId = bodyFieldId;
		this._bodyField = document.getElementById(this._bodyFieldId);
	}

    var node = this.getHtmlElement();
    if (node && node.parentNode)
        node.style.height = node.parentNode.style.height;

    var size = this.getSize();
    // Size x by the containing table (excluding the suggestion panel)
    var mainTableSize = Dwt.getSize(this._mainTable);
    if (mainTableSize.x <= 0 || size.y <= 0) { return; }

    var topDiv = document.getElementById(this._htmlElId + "_top");
    var topDivSize = Dwt.getSize(topDiv);
    var topSizeHeight = this._getComponentsHeight(true);
    var notesEditorHeight = (this._notesHtmlEditor && this._notesHtmlEditor.getHtmlElement()) ? this._notesHtmlEditor.getHtmlElement().clientHeight:0;
	var rowHeight = (size.y - topSizeHeight) + notesEditorHeight ;
    var rowWidth = mainTableSize.x;
    if(AjxEnv.isIE)
        rowHeight = rowHeight - 10;
    else {
        var adj = (appCtxt.isTinyMCEEnabled()) ? 12 : 38;
        rowHeight = rowHeight + adj;
    }

    if(rowHeight < 350){
        rowHeight = 350;
    }

    if( appCtxt.isTinyMCEEnabled() ) {
        this._notesHtmlEditor.setSize(rowWidth-5, rowHeight);
    }else {
        this._notesHtmlEditor.setSize(rowWidth-10, rowHeight-25);
    }
};

ZmApptEditView.prototype._getComponentsHeight =
function(excludeNotes) {
    var components = [this._topContainer, document.getElementById(this._htmlElId + "_scheduler_option")];
    if(!excludeNotes) components.push(this._notesContainer);

    var compSize;
    var compHeight= 10; //message label height
    for(var i=0; i<components.length; i++) {
        compSize= Dwt.getSize(components[i]);
        compHeight += compSize.y;
    }

    if(this._schedulerOpened) compHeight += this._scheduleView.getSize().y;
    return compHeight;
};

ZmApptEditView.prototype.autoSize =
function() {
    var size = Dwt.getSize(this.getHtmlElement());
    mainTableSize = Dwt.getSize(this._mainTable);
    this.resize(mainTableSize.x, size.y);
};

ZmApptEditView.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) { return; }

	if (newHeight) {
		this.setSize(Dwt.DEFAULT, newHeight);
	}

    this._resizeNotes();
    //this._scheduleAssistant.resizeTimeSuggestions();

    //If scrollbar handle it
    // Sizing based on the internal table now.  Scrolling bar will be external and accounted for already
    var size = Dwt.getSize(this.getHtmlElement());
    var mainTableSize = Dwt.getSize(this._mainTable);
    var compHeight= this._getComponentsHeight();
    if(compHeight > ( size.y + 5 )) {
        Dwt.setSize(this.getHtmlElement().firstChild, size.x-15);

        this._notesHtmlEditor.setSize(mainTableSize.x - 10);
        if(!this._scrollHandled){
            Dwt.setScrollStyle(this.getHtmlElement(), Dwt.SCROLL_Y);
            this._scrollHandled = true;
        }
    }else{
        if(this._scrollHandled){
            Dwt.setScrollStyle(this.getHtmlElement(), Dwt.CLIP);
            Dwt.setSize(this.getHtmlElement().firstChild, size.x);
            this._notesHtmlEditor.setSize(mainTableSize.x - 10);
        }
        this._scrollHandled = false;
    }
};

ZmApptEditView.prototype._initAttachContainer =
function() {

	this._attachmentRow = document.getElementById(this._htmlElId + "_attachment_container");
    this._attachmentRow.style.display="";
	var cell = this._attachmentRow.insertCell(-1);
	cell.colSpan = 5;

	this._uploadFormId = Dwt.getNextId();
	this._attachDivId = Dwt.getNextId();

	var subs = {
		uploadFormId: this._uploadFormId,
		attachDivId: this._attachDivId,
		url: appCtxt.get(ZmSetting.CSFE_UPLOAD_URI)+"&fmt=extended"
	};

	cell.innerHTML = AjxTemplate.expand("calendar.Appointment#AttachContainer", subs);
};

// if user presses space or semicolon, add attendee
ZmApptEditView.prototype._onAttendeesChange =
function(ev) {

	var el = DwtUiEvent.getTarget(ev);
	// forward recipient is not an attendee

    var key = DwtKeyEvent.getCharCode(ev);
    var _nodeName = el.nodeName;
    if (_nodeName && _nodeName.toLowerCase() === "textarea") {
        this._adjustAddrHeight(el);
    }
    if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) ){
        ZmAutocompleteListView.onKeyUp(ev);
    }
    if (key == 32 || key == 59 || key == 186) {
        this.handleAttendeeChange();
    }else {
        this.updateToolbarOps();
    }

	if (el._attType == ZmCalBaseItem.LOCATION) {
		this._resetKnownLocation();
	}
};

ZmApptEditView.prototype.handleAttendeeChange =
function(ev) {
    AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._handleAttendeeField, ZmCalBaseItem.PERSON), 300);
};

ZmApptEditView.prototype._adjustAddrHeight =
function(textarea) {

	if (this._useAcAddrBubbles || !textarea) { return; }

	if (textarea.value.length == 0) {
		textarea.style.height = "21px";
		if (AjxEnv.isIE) {
			// for IE use overflow-y
			textarea.style.overflowY = "hidden";
		}
		else {
			textarea.style.overflow = "hidden";
		}
		return;
	}

	var sh = textarea.scrollHeight;
	if (sh > textarea.clientHeight) {
		var taHeight = parseInt(textarea.style.height) || 0;
		if (taHeight <= 65) {
			if (sh >= 65) {
				sh = 65;
				if (AjxEnv.isIE)
					textarea.style.overflowY = "scroll";
				else
					textarea.style.overflow = "auto";
			}
			textarea.style.height = sh + 13;
		} else {
			if (AjxEnv.isIE) {
				// for IE use overflow-y
				textarea.style.overflowY = "scroll";
			}
			else {
				textarea.style.overflow = "auto";
			}
			textarea.scrollTop = sh;
		}
	}
};

ZmApptEditView.prototype.loadPreference =
function() {
    var prefDlg = appCtxt.getSuggestionPreferenceDialog();
    prefDlg.setCallback(new AjxCallback(this, this._prefChangeListener));
    // Trigger an initial location check - the appt may have been saved
    // with a location that has conflicts.  Need to do from here, so that
    // the user's numRecurrence preference is loaded
    var locationConflictCheckCallback = this.locationConflictChecker.bind(this);
    prefDlg.getSearchPreference(appCtxt.getActiveAccount(),
        locationConflictCheckCallback);
};

ZmApptEditView.prototype._prefChangeListener =
function() {
    // Preference Dialog is only displayed when the suggestions panel is visible - so update suggestions
    this._scheduleAssistant.clearResources();
    this._scheduleAssistant.suggestAction(true);

    var newNumRecurrence = this.getNumLocationConflictRecurrence();
    if (newNumRecurrence != this._scheduleAssistant.numRecurrence) {
        // Trigger Location Conflict test if enabled
        this.locationConflictChecker();
    }
};

// Show/Hide the conflict warning beneath the attendee and location input fields, and
// color any attendee or location that conflicts with the current appointment time.  If
// the appointment is recurring, the conflict status and coloration only apply for the
// current instance of the series.
ZmApptEditView.prototype.showConflicts =
function() {
    var conflictColor = "#F08080";
    var color, isFree, type, addressElId, addressEl;
    var attendeeConflict = false;
    var locationConflict = false;
    var conflictEmails = this._scheduleView.getConflicts();
    for (var email in conflictEmails) {
        type = this.parent.getAttendeeType(email);
        if ((type == ZmCalBaseItem.PERSON) || (type == ZmCalBaseItem.LOCATION)) {
            isFree = conflictEmails[email];
            if (!isFree) {
                // Record attendee or location conflict
                if (type == ZmCalBaseItem.PERSON) {
                    attendeeConflict = true
                } else {
                    locationConflict = true;
                }
            }

            // Color the address bubble or reset to default
            color = isFree ? "" : conflictColor;
            addressElId = this._attInputField[type].getAddressBubble(email);
            if (addressElId) {
                addressEl = document.getElementById(addressElId);
                if (addressEl) {
                    addressEl.style.backgroundColor = color;
                }
            }
        }
    }
    Dwt.setVisible(this._attendeeStatus, attendeeConflict);
    this.setLocationStatus(ZmApptEditView.LOCATION_STATUS_UNDEFINED, locationConflict);
}

