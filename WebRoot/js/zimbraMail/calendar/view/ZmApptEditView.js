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

	ZmCalItemEditView.call(this, parent, attendees, controller, dateInfo);

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


    //used to preserve original attendees while forwarding appt
    this._fwdApptOrigAttendees = [];
};

ZmApptEditView.prototype = new ZmCalItemEditView;
ZmApptEditView.prototype.constructor = ZmApptEditView;

// Consts

ZmApptEditView.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "F", 	selected: false },
	{ label: ZmMsg.replyTentative, 		value: "T", 	selected: false },
	{ label: ZmMsg.busy, 				value: "B", 	selected: true  },
	{ label: ZmMsg.outOfOffice,			value: "O", 	selected: false }
];

ZmApptEditView.PRIVACY_OPTION_PUBLIC = "PUB";
ZmApptEditView.PRIVACY_OPTION_PRIVATE = "PRI";

ZmApptEditView.PRIVACY_OPTIONS = [
	{ label: ZmMsg._public,				value: "PUB",	selected: true	},
	{ label: ZmMsg._private,			value: "PRI"					}
//	{ label: ZmMsg.confidential,		value: "CON"					}		// see bug #21205
];

ZmApptEditView.BAD						= "_bad_addrs_"

// Public Methods

ZmApptEditView.prototype.toString =
function() {
	return "ZmApptEditView";
};

ZmApptEditView.prototype.show =
function() {
	ZmCalItemEditView.prototype.show.call(this);
	this._setAttendees();

    //bug:48189 Hide schedule tab for non-ZCS acct
    if (appCtxt.isOffline) {
        var currAcct = appCtxt.getActiveAccount();
        this.setSchedulerVisibility(currAcct.isZimbraAccount && !currAcct.isMain);
    }
};

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
		this._attendeesInputField.setValue("");
		this._optAttendeesInputField.setValue("");
        this._forwardToField.setValue("");
	}
	this._attInputField[ZmCalBaseItem.LOCATION].setValue("");
	this._locationTextMap = {};

	if (this._resourcesContainer) {
		Dwt.setVisible(this._resourcesContainer, false);
		this._resourcesData.innerHTML = "";
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

    //Default Persona
    this.setIdentity();

    if(this._scheduleAssistant) this._scheduleAssistant.cleanup();
};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmApptEditView.prototype.enableInputs =
function(bEnableInputs) {
	ZmCalItemEditView.prototype.enableInputs.call(this, bEnableInputs);
	if (this.GROUP_CALENDAR_ENABLED) {
		//only organizer can edit the attendees
		var bEnableAttendees = (this._isOrganizer != null) ? this._isOrganizer : bEnableInputs;
		if (appCtxt.isOffline && bEnableAttendees &&
			this._calItem && this._calItem.getFolder().getAccount().isMain)
		{
			bEnableAttendees = false;
		}
		this._attendeesInputField.setEnabled(bEnableAttendees);
		this._optAttendeesInputField.setEnabled(bEnableAttendees);
	}
	this._attInputField[ZmCalBaseItem.LOCATION].setEnabled(bEnableInputs);
};

ZmApptEditView.prototype.isValid =
function() {
	var errorMsg;

	// check for required subject
	var subj = AjxStringUtil.trim(this._subjectField.getValue());

	if (subj && subj.length) {
		var allDay = this._allDayCheckbox.checked;
		if (!ZmTimeInput.validStartEnd(this._startDateField, this._endDateField, (allDay ? null : this._startTimeSelect), (allDay ? null : this._endTimeSelect))) {
				errorMsg = ZmMsg.errorInvalidDates;
		}

	} else {
		errorMsg = ZmMsg.errorMissingSubject;
	}

	if (errorMsg) {
		throw errorMsg;
	}

	return true;
};

// called by schedule tab view when user changes start date field
ZmApptEditView.prototype.updateDateField =
function(newStartDate, newEndDate) {
	this._startDateField.value = newStartDate;
	this._endDateField.value = newEndDate;
};

ZmApptEditView.prototype.updateAllDayField =
function(isAllDay) {
	this._allDayCheckbox.checked = isAllDay;
	this._showTimeFields(!isAllDay);
};

ZmApptEditView.prototype.toggleAllDayField =
function() {
	this.updateAllDayField(!this._allDayCheckbox.checked);
};

ZmApptEditView.prototype.updateTimeField =
function(dateInfo) {
     this._startTimeSelect.setValue(dateInfo.startTimeStr);
     this._endTimeSelect.setValue(dateInfo.endTimeStr);
};


ZmApptEditView.prototype.setDate =
function(startDate, endDate, ignoreTimeUpdate) {
    this._startDateField.value = AjxDateUtil.simpleComputeDateStr(startDate);
    this._endDateField.value = AjxDateUtil.simpleComputeDateStr(endDate);
    if(!ignoreTimeUpdate) {
        this._startTimeSelect.set(startDate);
        this._endTimeSelect.set(endDate);
    }
};

ZmApptEditView.prototype.updateTimezone =
function(dateInfo) {
	this._tzoneSelectStart.setSelectedValue(dateInfo.timezone);
	this._tzoneSelectEnd.setSelectedValue(dateInfo.timezone);
    this.handleTimezoneOverflow();
};

ZmApptEditView.prototype.updateLocation =
function(location, locationStr) {
    this._updateAttendeeFieldValues(ZmCalBaseItem.LOCATION, [location]);
    this.setApptLocation(locationStr);
    this._addResourcesDiv(); 
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
	tabGroup.addMember(this._subjectField);
	tabGroup.addMember(this._attInputField[ZmCalBaseItem.LOCATION]);
    tabGroup.addMember(this._startDateField);
	tabGroup.addMember(this._startTimeSelect.getInputField());
	tabGroup.addMember(this._endDateField);
	tabGroup.addMember(this._endTimeSelect.getInputField());

	if(this.GROUP_CALENDAR_ENABLED) {
		tabGroup.addMember(this._attInputField[ZmCalBaseItem.PERSON]);
		tabGroup.addMember(this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON]);
	}
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	tabGroup.addMember(document.getElementById(bodyFieldId));
};

ZmApptEditView.prototype._finishReset =
function() {
	ZmCalItemEditView.prototype._finishReset.call(this);

    var newMode = (this._mode == ZmCalItem.MODE_NEW);

	// save the original form data in its initialized state
	this._origFormValueMinusAttendees = newMode ? "" : this._formValue(true);
	if (this._hasReminderSupport) {
		this._origFormValueMinusReminder = newMode ? "" : this._formValue(false, true);
		this._origReminderValue = this._reminderSelectInput.getValue();
	}
};

ZmApptEditView.prototype._getClone =
function() {
	return ZmAppt.quickClone(this._calItem);
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

    //Handle Persona's
    var identity = this.getIdentity();
    if(identity){
       calItem.identity = identity; 
       calItem.sentBy = (identity && identity.getField(ZmIdentity.SEND_FROM_ADDRESS));
    }

	calItem.freeBusy = this._showAsSelect.getValue();
	calItem.privacy = this._privacyCheckbox.checked ? ZmApptEditView.PRIVACY_OPTION_PRIVATE : ZmApptEditView.PRIVACY_OPTION_PUBLIC;

	// set the start date by aggregating start date/time fields
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (this._allDayCheckbox.checked) {
		calItem.setAllDayEvent(true);
	} else {
		calItem.setAllDayEvent(false);
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
	}
	calItem.setStartDate(startDate, true);
	calItem.setEndDate(endDate, true);
	if (Dwt.getVisibility(this._tzoneSelectStart.getHtmlElement())) {
        calItem.timezone = this._tzoneSelectStart.getValue();
        calItem.setEndTimezone(this._tzoneSelectEnd.getValue());
    }

	// set attendees
	for (var t = 0; t < this._attTypes.length; t++) {
        if(this._isForward && type == ZmCalBaseItem.PERSON)  continue;
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
        calItem.setAttendees(this._fwdApptOrigAttendees, ZmCalBaseItem.PERSON);
    }

	return calItem;
};


ZmApptEditView.prototype.getRsvp =
function() {
  return this.GROUP_CALENDAR_ENABLED ? this._controller.getRequestResponses() : false;  
};

ZmApptEditView.prototype._populateForEdit =
function(calItem, mode) {

	ZmCalItemEditView.prototype._populateForEdit.call(this, calItem, mode);

    var enableTimeSelection = !this._isForward;
    var enableApptDetails = !this._isForward && !this._isProposeTime;

	this._showAsSelect.setSelectedValue(calItem.freeBusy);
    this._showAsSelect.setEnabled(enableApptDetails);
    this._privacyCheckbox.checked = (calItem.privacy == ZmApptEditView.PRIVACY_OPTION_PRIVATE);


	// reset the date/time values based on current time
	var sd = new Date(calItem.startDate.getTime());
	var ed = new Date(calItem.endDate.getTime());

	var isAllDayAppt = calItem.isAllDayEvent();
	if (isAllDayAppt) {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);

		// set time anyway to current time and default duration (in case user changes mind)
		var now = AjxDateUtil.roundTimeMins(new Date(), 30);
		this._startTimeSelect.set(now);

		now.setTime(now.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
		this._endTimeSelect.set(now);

		// bug 9969: HACK - remove the all day durtion for display
		var isNew = (mode == ZmCalItem.MODE_NEW || mode == ZmCalItem.MODE_NEW_FROM_QUICKADD);
		if (!isNew && ed.getHours() == 0 && ed.getMinutes() == 0 && ed.getSeconds() == 0) {
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
    
	// attendees
	var attendees = calItem.getAttendees(ZmCalBaseItem.PERSON);
	if (attendees && attendees.length) {
		if (this.GROUP_CALENDAR_ENABLED) {
			this._attendeesInputField.setValue(calItem.getAttendeesTextByRole(ZmCalBaseItem.PERSON, ZmCalItem.ROLE_REQUIRED));
			this._optAttendeesInputField.setValue(calItem.getAttendeesTextByRole(ZmCalBaseItem.PERSON, ZmCalItem.ROLE_OPTIONAL));
            if(this._optAttendeesInputField.getValue() != "") {
                this._toggleOptionalAttendees(true);
            }
		}
        if(!this._isForward) {
		    this._attendees[ZmCalBaseItem.PERSON] = AjxVector.fromArray(attendees);
            this._attInputField[ZmCalBaseItem.PERSON] = this._attendeesInputField;
            this._fwdApptOrigAttendees = [];
        }else {
            this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();
            this._attInputField[ZmCalBaseItem.PERSON] = this._forwardToField;
            this._fwdApptOrigAttendees = attendees;
        }
	}else {
        if (this.GROUP_CALENDAR_ENABLED) {
            this._attendeesInputField.setValue("");
            this._optAttendeesInputField.setValue("");
        }
        this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();
        this._attInputField[ZmCalBaseItem.PERSON] = this._isForward ? this._forwardToField : this._attendeesInputField;        
    }

	// set the location *label*    
	this._attInputField[ZmCalBaseItem.LOCATION].setValue(calItem.getLocation());

	// set the location attendee(s)
	var locations = calItem.getAttendees(ZmCalBaseItem.LOCATION);
	if (locations && locations.length) {
		this._attendees[ZmCalBaseItem.LOCATION] = AjxVector.fromArray(locations);
	}

	// privacy
	if (this._privacyCheckbox) {
		var isRemote = calItem.isShared();
		var cal = isRemote ? appCtxt.getById(calItem.folderId) : null;
		var isPrivacyEnabled = ((!isRemote || (cal && cal.hasPrivateAccess())) && enableApptDetails);
		var defaultPrivacyOption = (appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV);

        this._privacyCheckbox.checked = (isPrivacyEnabled ? ((calItem.privacy == ZmApptEditView.PRIVACY_OPTION_PRIVATE) || defaultPrivacyOption) : false);
		this._privacyCheckbox.disabled = !isPrivacyEnabled;
	}

	// set the equipment attendee(s)
	var equipment = calItem.getAttendees(ZmCalBaseItem.EQUIPMENT);
	if (equipment && equipment.length) {
		this._attendees[ZmCalBaseItem.EQUIPMENT] = AjxVector.fromArray(equipment);
	}

	this._addResourcesDiv();

	if (this.GROUP_CALENDAR_ENABLED) {
        this._controller.setRequestResponses((attendees && attendees.length) ? calItem.shouldRsvp() : true);
        this._controller.setNotificationMail(true);

		this._isOrganizer = calItem.isOrganizer();
		//this._attInputField[ZmCalBaseItem.PERSON].setEnabled(calItem.isOrganizer() || this._isForward);

        //todo: disable notification for attendee
        
        if(this._organizerData) {
            this._organizerData.innerHTML = calItem.getOrganizer() || "";
        }
        this._calItemOrganizer =  calItem.getOrganizer() || "";

        //enable forward field/picker if its not propose time view
        this._forwardToField.setValue(this._isProposeTime ? calItem.getOrganizer() : "");
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
    var sentBy = calItem.sentBy;
    sentBy = sentBy || (calItem.organizer != calItem.getFolder().getOwner() ? calItem.organizer : null);
    if(sentBy){
        this.setIdentity(appCtxt.getIdentityCollection().getIdentityBySendAddress(sentBy));
    }

    if(this._scheduleAssistant) this._scheduleAssistant.updateTime(true);
};

ZmApptEditView.prototype.getCalItemOrganizer =
function() {
	var folderId = this._folderSelect.getValue();
	var organizer = new ZmContact(null);
	organizer.initFromEmail(this._calItemOrganizer, true);
	return organizer;
};


ZmApptEditView.prototype._addResourcesDiv =
function(calItem) {
	if (!(this._resourcesData && this._resourcesContainer)) { return; }

	var html = [];
	var i = 0;
	var location = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.LOCATION].getArray(), ZmCalBaseItem.LOCATION);
	var equipment = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.EQUIPMENT].getArray(), ZmCalBaseItem.EQUIPMENT);
	if (location.length || equipment.length) {
		Dwt.setVisible(this._resourcesContainer, true);
		if (location.length) {
			html[i++] = "<div style='padding-left:2px;float: left;'>";
			html[i++] = AjxImg.getImageSpanHtml("Location","float:left");
			html[i++] = "&nbsp;";
			html[i++] = location;
			html[i++] = "</div>";
		}
		if (equipment.length) {
			html[i++] = "<div style='padding-left:2px;float: left;'>";
			html[i++] = AjxImg.getImageSpanHtml("Resource", "float:left");
			html[i++] = "&nbsp;";
			html[i++] = equipment;
			html[i++] = "</div>";
		}
	} else {
		Dwt.setVisible(this._resourcesContainer, false);
	}
	this._resourcesData.innerHTML = html.join("");
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
		// add attendee input field
		var params = {
			parent: this,
			type: DwtInputField.STRING,
			rows: 1,
			parentElement: (this._htmlElId + "_person")
		};
		var input = this._attInputField[ZmCalBaseItem.PERSON] = new DwtInputField(params);
		var inputEl = input.getInputElement();
		Dwt.setSize(inputEl, "100%", Dwt.DEFAULT);
		inputEl._attType = ZmCalBaseItem.PERSON;
        this._attendeesInputField = this._attInputField[ZmCalBaseItem.PERSON];

		params = {
			parent: this,
			type: DwtInputField.STRING,
			rows: 1,
			parentElement: (this._htmlElId + "_optional")
		};
		var input = this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON] = new DwtInputField(params);
		var inputEl = input.getInputElement();
		Dwt.setSize(inputEl, "100%", Dwt.DEFAULT);
		inputEl._attType = ZmCalBaseItem.OPTIONAL_PERSON;
        this._optAttendeesInputField = this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON];
	}

	// add location input field
	params = {
		parent: this,
		type: DwtInputField.STRING,
		parentElement: (this._htmlElId + "_location")
	};
	var input = this._attInputField[ZmCalBaseItem.LOCATION] = new DwtInputField(params);
	var inputEl = input.getInputElement();
	Dwt.setSize(inputEl, "100%", "22px");
	inputEl._attType = ZmCalBaseItem.LOCATION;

    var edvId = AjxCore.assignId(this);    
    this._schButtonId = this._htmlElId + "_scheduleButton";
    this._showOptionalId = this._htmlElId + "_show_optional";
    
    this._showOptional = document.getElementById(this._showOptionalId);
    this._schButton = document.getElementById(this._schButtonId);
    this._schButton._editViewId = edvId;
    this._schImage = document.getElementById(this._htmlElId + "_scheduleImage");    
    Dwt.setHandler(this._schButton, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);

	this._resourcesContainer = document.getElementById(this._htmlElId + "_resourcesContainer");

	this._resourcesData = document.getElementById(this._htmlElId + "_resourcesData");
	this._schedulerContainer = document.getElementById(this._htmlElId + "_scheduler");
	this._schedulerOptions = document.getElementById(this._htmlElId + "_scheduler_option");

	// show-as DwtSelect
	this._showAsSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_showAsSelect")});
	for (var i = 0; i < ZmApptEditView.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptEditView.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}


    this._privacyCheckbox =  document.getElementById(this._htmlElId + "_privateCheckbox");
	this._folderSelect.addChangeListener(new AjxListener(this, this._folderListener));

	// time ZmTimeSelect
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	this._startTimeSelect = new ZmTimeInput(this, ZmTimeInput.START);
	this._startTimeSelect.reparentHtmlElement(this._htmlElId + "_startTimeSelect");
	this._startTimeSelect.addChangeListener(timeSelectListener);

	this._endTimeSelect = new ZmTimeInput(this, ZmTimeInput.END);
	this._endTimeSelect.reparentHtmlElement(this._htmlElId + "_endTimeSelect");
	this._endTimeSelect.addChangeListener(timeSelectListener);

    if (this.GROUP_CALENDAR_ENABLED) {
        var params = {
            parent: this,
            type: DwtInputField.STRING,
            rows: 3,
            parentElement: (this._htmlElId + "_to_control")
        };
        var input = new DwtInputField(params);
        var inputEl = input.getInputElement();                  
        Dwt.setSize(inputEl, "100%", "24px");
        inputEl._attType = ZmCalBaseItem.PERSON;

        this._forwardToField = input;
    }

	// timezone DwtSelect
	var timezoneListener = new AjxListener(this, this._timezoneListener);

	this._tzoneSelectStart = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_tzoneSelectStart"), cascade:false});
	this._tzoneSelectStart.addChangeListener(timezoneListener);
    this._tzoneSelectStartElement = document.getElementById(this._htmlElId + "_tzoneSelectStart");

	this._tzoneSelectEnd = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_tzoneSelectEnd"), cascade:false});
	this._tzoneSelectEnd.addChangeListener(timezoneListener);
    this._tzoneSelectEndElement = document.getElementById(this._htmlElId + "_tzoneSelectEnd");


    this._timezoneColumn = document.getElementById(this._htmlElId + "_timezoneColumn");
    this._labelColumn = document.getElementById(this._htmlElId + "_labelColumn");
    this._timezoneSpacer = document.getElementById(this._htmlElId + "_timezoneSpacer");


	// NOTE: tzone select is initialized later

	// init auto-complete widget if contacts app enabled
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this._initAutocomplete();
	}

    this._organizerOptions = document.getElementById(this._htmlElId + "_organizer_options");
    this._organizerData = document.getElementById(this._htmlElId + "_organizer");
    this._optionalAttendeesContainer = document.getElementById(this._htmlElId + "_optionalContainer");

    var isPickerEnabled = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) ||
						   appCtxt.get(ZmSetting.GAL_ENABLED) ||
						   appCtxt.multiAccounts);
    if (isPickerEnabled) {
        this._createContactPicker(this._htmlElId + "_picker", new AjxListener(this, this._addressButtonListener), ZmCalBaseItem.PERSON, true);
        this._createContactPicker(this._htmlElId + "_req_att_picker", new AjxListener(this, this._attendeesButtonListener, ZmCalBaseItem.PERSON), ZmCalBaseItem.PERSON);
        this._createContactPicker(this._htmlElId + "_opt_att_picker", new AjxListener(this, this._attendeesButtonListener, ZmCalBaseItem.OPTIONAL_PERSON), ZmCalBaseItem.OPTIONAL_PERSON);
    }

    this._createContactPicker(this._htmlElId + "_loc_picker", new AjxListener(this, this._locationButtonListener, ZmCalBaseItem.LOCATION), ZmCalBaseItem.LOCATION);
    this._createContactPicker(this._htmlElId + "_res_btn", new AjxListener(this, this._locationButtonListener, ZmCalBaseItem.EQUIPMENT), ZmCalBaseItem.EQUIPMENT);

    //Personas
    //TODO: Remove size check once we add identityCollection change listener.
    if(appCtxt.get(ZmSetting.IDENTITIES_ENABLED) && !appCtxt.multiAccounts){
        var identityOptions = this._getIdentityOptions();
        this.identitySelect = new DwtSelect({parent:this, options:identityOptions, parentElement: (this._htmlElId + "_identity")});
        this.identitySelect.setToolTipContent(ZmMsg.chooseIdentity);
    }

    this._setIdentityVisible();

    Dwt.setVisible(this._optionalAttendeesContainer, false)
};


ZmApptEditView.prototype._createContactPicker =
function(pickerId, listener, addrType, isForwardPicker) {
    var pickerEl = document.getElementById(pickerId);
    if (pickerEl) {
        var buttonId = Dwt.getNextId();
        var button = new DwtButton({parent:this, id:buttonId});
        if(isForwardPicker) {
            this._forwardPicker = button;
        }else {
            this._pickerButton[addrType] = button;            
        }
        if(addrType == ZmCalBaseItem.EQUIPMENT) {
            button.setImage("Resource");
            button.setSize("16px", Dwt.DEFAULT);
        }else {
            button.setText(pickerEl.innerHTML);
        }
        button.replaceElement(pickerEl);

        button.addSelectionListener(listener);
        button.addrType = addrType;
    }
};

ZmApptEditView.prototype._toggleOptionalAttendees =
function(forceShow) {
    this._optionalAttendeesShown = ! this._optionalAttendeesShown || forceShow;
    this._showOptional.innerHTML = this._optionalAttendeesShown ? ZmMsg.hideOptional : ZmMsg.showOptional;
    Dwt.setVisible(this._optionalAttendeesContainer, Boolean(this._optionalAttendeesShown))
};

ZmApptEditView.prototype._toggleInlineScheduler =
function() {

    if(this._schedulerOpened) {
        this._schedulerOpened = false;
        this._schButton.innerHTML = ZmMsg.show;
        this._schImage.className = "ImgSelectPullDownArrow";
        this._scheduleView.setVisible(false);
        this.autoSize();
        return;
    }

    this._schedulerOpened = true;
    this._schButton.innerHTML = ZmMsg.hide;
    this._schImage.className = "ImgSelectPullUpArrow";

    if(!this._scheduleView) {
        this._scheduleView = new ZmFreeBusySchedulerView(this, this._attendees, this._controller, this._dateInfo);
        this._scheduleView.reparentHtmlElement(this._schedulerContainer);
    }

    //todo: scheduler auto complete
    Dwt.setVisible(this._schedulerContainer, true);
    this._scheduleView.setVisible(true);
    this._scheduleView.showMe();
    this.autoSize();
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

    var addrs = this._collectForwardAddrs();
    var a = {};
    if (addrs[AjxEmailAddress.TO] && addrs[AjxEmailAddress.TO].good) {
        a[AjxEmailAddress.TO] = addrs[AjxEmailAddress.TO].good.getArray();
    }
    var str = (this._forwardToField.getValue() && !(a[AjxEmailAddress.TO] && a[AjxEmailAddress.TO].length))
        ? this._forwardToField.getValue() : "";
	var account;
	this._contactPicker.popup(AjxEmailAddress.TO, a, str, account);
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

    var addrs = this._collectAddrs(inputObj.getValue());
    var a = {};
    if (addrs[AjxEmailAddress.TO] && addrs[AjxEmailAddress.TO].good) {
        a[AjxEmailAddress.TO] = addrs[AjxEmailAddress.TO].good.getArray();
    }
    var str = (inputObj.getValue() && !(a[AjxEmailAddress.TO] && a[AjxEmailAddress.TO].length))
        ? inputObj.getValue() : "";
	var account;
	contactPicker.popup(AjxEmailAddress.TO, a, str, account);
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
    var addr = (vec.size() > 0) ? vec.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR : "";
    addr = addr ? addr : "";
    this._attInputField[addrType].setValue(addr);
    this._activeInputField = addrType; 
    this._handleAttendeeField(addrType);
	this._attendeePicker[addrType].popdown();
};

// Transfers addresses from the location/resource picker to the appt compose view.
ZmApptEditView.prototype._locationPickerOkCallback =
function(addrType, attendees) {

    this.parent.updateAttendees(attendees, addrType);

    if(this._attInputField[addrType]) {
        this._attInputField[addrType].setEnabled(true);
        this._activeInputField = addrType;        
    }

    if(addrType == ZmCalBaseItem.LOCATION) {
        var location = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.LOCATION].getArray(), ZmCalBaseItem.LOCATION);
        this.setApptLocation(location);
        this._handleAttendeeField(addrType);        
    }

    this._addResourcesDiv();
	this._attendeePicker[addrType].popdown();
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
    var addr = (vec.size() > 0) ? vec.toString(AjxEmailAddress.SEPARATOR) + AjxEmailAddress.SEPARATOR : "";
    addr = addr ? addr : "";
    this._forwardToField.setValue(addr);
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
    this._isForward = (apptComposeMode == ZmApptComposeView.FORWARD);
    this._isProposeTime = (apptComposeMode == ZmApptComposeView.PROPOSE_TIME);
    this._apptComposeMode = apptComposeMode;
    
    ZmCalItemEditView.prototype.initialize.call(this, calItem, mode, isDirty, apptComposeMode);
};

ZmApptEditView.prototype.getCalendarAccount =
function() {
	var cal = appCtxt.getById(this._folderSelect.getValue());
	return cal && cal.getAccount();
};

ZmApptEditView.prototype._folderListener =
function() {
	if (!this._privacyCheckbox) { return; }

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

    this._privacyCheckbox.disabled = !isEnabled;
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
	}

	attField = this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON];
	if (attField) {
		attField.setEnabled(enabled);
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
	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	this._acList = {};

	// autocomplete for attendees
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
		this.GROUP_CALENDAR_ENABLED)
	{
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			matchValue: ZmAutocomplete.AC_VALUE_FULL,
			compCallback: acCallback
		};
		this._acContactsList = new ZmAutocompleteListView(params);
		this._acContactsList.handle(this._attInputField[ZmCalBaseItem.PERSON].getInputElement());
		this._acContactsList.handle(this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].getInputElement());
        if(this._forwardToField) {
            this._acContactsList.handle(this._forwardToField.getInputElement());            
        }
		this._acList[ZmCalBaseItem.PERSON] = this._acContactsList;
	}

	if (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		// autocomplete for locations
		var app = appCtxt.getApp(ZmApp.CALENDAR);
		var locChangeCallback = new AjxCallback(this, this._handleLocationChange);
		var params = {
			dataClass: appCtxt.getAutocompleter(),
			matchValue: ZmAutocomplete.AC_VALUE_NAME,
			compCallback: acCallback,
			keyUpCallback: locChangeCallback,
			options: {type:ZmAutocomplete.AC_TYPE_LOCATION}
		};
		this._acLocationsList = new ZmAutocompleteListView(params);
		this._acLocationsList.handle(this._attInputField[ZmCalBaseItem.LOCATION].getInputElement());
		this._acList[ZmCalBaseItem.LOCATION] = this._acLocationsList;
	}
};

ZmApptEditView.prototype._handleLocationChange =
function(event, aclv, result) {
	var val = this._attInputField[ZmCalBaseItem.LOCATION].getValue();
	if (val == "") {
		this.parent.updateAttendees([], ZmCalBaseItem.LOCATION);
		this._addResourcesDiv();
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
    var type = el._attType;
	if (attendee) {
		if (type == ZmCalBaseItem.FORWARD) {
            DBG.println("forward auto complete match : " + match)
            return;
        }
		if (type == ZmCalBaseItem.LOCATION) {
			var name = attendee.getFullName();
			if(name) {
				this._locationTextMap[name] = attendee;
			}
			var locations = text.split(/[\n,;]/);
			var newAttendees = [];
			for(var i in locations) {
				var l = AjxStringUtil.trim(locations[i]);
				if(this._locationTextMap[l]) {
					newAttendees.push(this._locationTextMap[l]);
				}
			}
			attendee = newAttendees;
		}

        //controller tracks both optional & required attendees in common var
        if (type == ZmCalBaseItem.OPTIONAL_PERSON) {
            type = ZmCalBaseItem.PERSON;
        }

		this.parent.updateAttendees(attendee, type, (type == ZmCalBaseItem.LOCATION )?ZmApptComposeView.MODE_REPLACE : ZmApptComposeView.MODE_ADD);

		if (type == ZmCalBaseItem.LOCATION) {
			this._addResourcesDiv();
			this._isKnownLocation = true;
		}

        if(type == ZmCalBaseItem.PERSON && this._scheduleAssistant) this._scheduleAssistant.updateAttendee(attendee);
	}else if(match.email){
        if(type == ZmCalBaseItem.PERSON && this._scheduleAssistant) {
            var attendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.PERSON].getValue());
            this._scheduleAssistant.updateAttendees(attendees);
        }
    }
};

ZmApptEditView.prototype._addEventHandlers =
function() {
	var edvId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._showOptional, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmCalItemEditView._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmCalItemEditView._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);

	this._allDayCheckbox._editViewId = this._repeatDescField._editViewId = edvId;
	this._startDateField._editViewId = this._endDateField._editViewId = edvId;
    this._showOptional._editViewId = edvId;

	if (this._attendeesInputField) {
		var inputEl = this._attendeesInputField.getInputElement();
		inputEl.onfocus = AjxCallback.simpleClosure(this._handleOnFocus, this, inputEl);
		inputEl.onblur = AjxCallback.simpleClosure(this._handleOnBlur, this, inputEl);
        inputEl._editViewId = edvId;
        Dwt.setHandler(inputEl, DwtEvent.ONKEYPRESS, ZmApptEditView._onAttendeesChange);
	}

	if (this._optAttendeesInputField) {
		var inputEl = this._optAttendeesInputField.getInputElement();
		inputEl.onfocus = AjxCallback.simpleClosure(this._handleOnFocus, this, inputEl);
		inputEl.onblur = AjxCallback.simpleClosure(this._handleOnBlur, this, inputEl);
	}

    if (this._forwardToField) {
		var inputEl = this._forwardToField.getInputElement();
		inputEl.onfocus = AjxCallback.simpleClosure(this._handleOnFocus, this, inputEl);
		inputEl.onblur = AjxCallback.simpleClosure(this._handleOnBlur, this, inputEl);
	}

	inputEl = this._attInputField[ZmCalBaseItem.LOCATION].getInputElement();
	inputEl.onkeypress = AjxCallback.simpleClosure(this._handleKeyPress, this);
    if(AjxEnv.isIE) inputEl.onkeydown = AjxCallback.simpleClosure(this._handleKeyPress, this);
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
	var showTimezone = !dateInfo.isAllDay;
	if (showTimezone) {
		showTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) ||
					   dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	}

    Dwt.setDisplay(this._tzoneSelectStart.getHtmlElement(), showTimezone ? Dwt.DISPLAY_INLINE : Dwt.DISPLAY_NONE);
    Dwt.setDisplay(this._tzoneSelectEnd.getHtmlElement(), showTimezone ? Dwt.DISPLAY_INLINE : Dwt.DISPLAY_NONE);

    //expand/collapse timezone column
    if (this._tzoneSelectStartElement) Dwt.setDisplay(this._tzoneSelectStartElement, showTimezone ? Dwt.DISPLAY_TABLE_CELL : Dwt.DISPLAY_NONE);
    if (this._tzoneSelectEndElement) Dwt.setDisplay(this._tzoneSelectEndElement, showTimezone ? Dwt.DISPLAY_TABLE_CELL : Dwt.DISPLAY_NONE);
    if (this._timezoneSpacer) Dwt.setDisplay(this._timezoneSpacer, showTimezone ? Dwt.DISPLAY_TABLE_CELL : Dwt.DISPLAY_NONE);
    if (this._timezoneColumn) this._timezoneColumn.setAttribute("width", showTimezone ? 230 : 60);
    if (this._labelColumn) this._labelColumn.setAttribute("width", showTimezone ? 60 : 160);
};

ZmApptEditView.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	this._setTimezoneVisible(this._dateInfo);
};

// Returns a string representing the form content
ZmApptEditView.prototype._formValue =
function(excludeAttendees, excludeReminder) {
	var vals = [];

	vals.push(this._subjectField.getValue());
	vals.push(this._attInputField[ZmCalBaseItem.LOCATION].getValue());
	vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.LOCATION].getArray(), ZmCalBaseItem.LOCATION));
	vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.EQUIPMENT].getArray(), ZmCalBaseItem.EQUIPMENT));
	vals.push(this._showAsSelect.getValue());
	vals.push(this._privacyCheckbox.checked ? ZmApptEditView.PRIVACY_OPTION_PRIVATE : ZmApptEditView.PRIVACY_OPTION_PUBLIC);
	vals.push(this._folderSelect.getValue());

	if (!excludeReminder) {
		vals.push(this._reminderSelectInput.getValue());
	}
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);

    startDate = this._startTimeSelect.getValue(startDate);
	endDate = this._endTimeSelect.getValue(endDate);
	vals.push(
		AjxDateUtil.getServerDateTime(startDate),
		AjxDateUtil.getServerDateTime(endDate)
	);
	vals.push("" + this._allDayCheckbox.checked);
	if (Dwt.getDisplay(this._tzoneSelectStart.getHtmlElement()) != Dwt.DISPLAY_NONE) {
		vals.push(this._tzoneSelectStart.getValue());
		vals.push(this._tzoneSelectEnd.getValue());
    }
	vals.push(this._repeatSelect.getValue());
	if (!excludeAttendees) {
		vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.PERSON].getArray(), ZmCalBaseItem.PERSON, false, true));
	}
	vals.push(this._notesHtmlEditor.getContent());

    if(this._isForward) {
	    vals.push(this._forwardToField.getValue());
    }

    if(this.identitySelect){
        vals.push(this.getIdentity().id);        
    }

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};


// Listeners

ZmApptEditView.prototype._timeChangeListener =
function(ev, id) {
	ZmTimeInput.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField, this._dateInfo, id);
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
    this._dateInfo.isTimeModified = true;

    if(this._schedulerOpened) {
        this._scheduleView._timeChangeListener(ev, id);
    }
};

ZmApptEditView.prototype.setScheduleAssistant =
function(scheduleAssistant) {
    this._scheduleAssistant = scheduleAssistant;        
};

ZmApptEditView.prototype._dateCalSelectionListener =
function(ev) {
    ZmCalItemEditView.prototype._dateCalSelectionListener.call(this, ev);
    if(this._schedulerOpened) {
        ZmApptViewHelper.getDateInfo(this, this._dateInfo);
        this._scheduleView._updateFreeBusy();
    }
    
    if(this._scheduleAssistant) this._scheduleAssistant.updateTime(true);
};


ZmApptEditView.prototype.handleTimezoneOverflow =
function() {
    var timezoneTxt = this._tzoneSelectStart.getText();
    if(timezoneTxt.length > 30) {
        timezoneTxt = timezoneTxt.substring(0, 30) + '...';
        this._tzoneSelectStart.setText(timezoneTxt);
    }
    timezoneTxt = this._tzoneSelectEnd.getText();
    if(timezoneTxt.length > 30) {
        timezoneTxt = timezoneTxt.substring(0, 30) + '...';
        this._tzoneSelectEnd.setText(timezoneTxt);
    }
};

ZmApptEditView.prototype._timezoneListener =
function(ev) {
    this.handleTimezoneOverflow();
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
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
		var list = [];
		var optionalList = [];
		for (var i = 0; i < attendees.length; i++) {
            if(attendees[i].getParticipantRole() == ZmCalItem.ROLE_OPTIONAL) {
                optionalList.push(attendees[i].getAttendeeText(type));                
            }else {
			    list.push(attendees[i].getAttendeeText(type));
            }
		}
		var val = list.length ? list.join(ZmAppt.ATTENDEES_SEPARATOR) : "";

		if (type == ZmCalBaseItem.LOCATION) {
			var curVal = AjxStringUtil.trim(this._attInputField[type].getValue());
			if (curVal == "" || (!this._knownLocation && val!= "" && curVal != val) || this._isKnownLocation) {
				this._attInputField[type].setValue(val);
				this._isKnownLocation = true;
			}
		} else if (type == ZmCalBaseItem.PERSON) {
			this._attInputField[type].setValue(val);

            var optionalAttendees = optionalList.length ? optionalList.join(ZmAppt.ATTENDEES_SEPARATOR) : "";
            this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].setValue(optionalAttendees);            
		}
	}
	this._addResourcesDiv();
};

ZmApptEditView.prototype.setApptLocation =
function(val) {
    this._attInputField[ZmCalBaseItem.LOCATION].setValue(val);
};

ZmApptEditView.prototype.getAttendees =
function(type) {
    return this.getAttendeesFromString(type, this._attInputField[type].getValue());
};

ZmApptEditView.prototype._handleAttendeeField =
function(type, useException) {
	if (!this._activeInputField) { return; }

	this._controller._invalidAttendees = [];

    var attendees;

    if(type == ZmCalBaseItem.OPTIONAL_PERSON || type == ZmCalBaseItem.PERSON) {
        attendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.PERSON].getValue());
        var optionalAttendees = this.getAttendeesFromString(ZmCalBaseItem.PERSON, this._attInputField[ZmCalBaseItem.OPTIONAL_PERSON].getValue(), true);
        //merge optional & required attendees to update parent controller                
        attendees.addList(optionalAttendees);
        type = ZmCalBaseItem.PERSON;
    }else {
        var value = this._attInputField[type].getValue();        
        attendees = this.getAttendeesFromString(type, value);
    }

    return this._updateAttendeeFieldValues(type, attendees);
};

ZmApptEditView.prototype.getAttendeesFromString =
function(type, value, markAsOptional) {
	var attendees = new AjxVector();
	var items = AjxEmailAddress.split(value);

	for (var i = 0; i < items.length; i++) {
		var item = AjxStringUtil.trim(items[i]);
		if (!item) { continue; }

        var contact = AjxEmailAddress.parse(item);

		// see if it's an attendee we already know about (added via autocomplete or other tab)
		var attendee = this._getAttendeeByName(type, (contact && contact.name) ? contact.name : item) ||
					   this._getAttendeeByItem((contact && contact.address) ? contact.address : item, type) ||
					   ZmApptViewHelper.getAttendeeFromItem(item, type);
		if (attendee) {
            if(markAsOptional) attendee.setParticipantRole(ZmCalItem.ROLE_OPTIONAL);
			attendees.add(attendee);
		} else {
			this._controller._invalidAttendees.push(item);
		}
	}

    return attendees;
};

ZmApptEditView.prototype._updateAttendeeFieldValues =
function(type, attendees) {
	// *always* force replace of attendees list with what we've found
	this.parent.updateAttendees(attendees, type);

    if(this._schedulerOpened) {
        var organizer = this._isProposeTime ? this.getCalItemOrganizer() : this.getOrganizer();
        this._scheduleView.set(this._dateInfo, organizer, this._attendees);
        this.autoSize();
    }

    if(type == ZmCalBaseItem.PERSON && this._scheduleAssistant) this._scheduleAssistant.updateAttendees(attendees);
};

ZmApptEditView.prototype._getAttendeeByName =
function(type, name) {
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
		if(el.checked && this._reminderSelect) {
			this._reminderSelect.setSelectedValue(1080);
		}
	} else if(el.id == this._schButtonId) {
        this._toggleInlineScheduler();
	} else if(el.id == this._showOptionalId) {
        this._toggleOptionalAttendees();
    }else {
		ZmCalItemEditView.prototype._handleOnClick.call(this, el);
	}
};

ZmApptEditView.prototype._handleOnFocus =
function(inputEl) {
	this._activeInputField = inputEl._attType;
};

ZmApptEditView.prototype._handleOnBlur =
function(inputEl) {
	this._handleAttendeeField(inputEl._attType);
	this._activeInputField = null;
};

ZmApptEditView.prototype._handleKeyPress =
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

	var size = this.getSize();
	if (size.x <= 0 || size.y <= 0) { return; }

	var topDiv = document.getElementById(this._htmlElId + "_top");
    var topSizeHeight = this._getComponentsHeight(true);
	//var topHeight = topSize.y;
	var rowHeight = size.y - topSizeHeight;
    var rowWidth = size.x;
    if(AjxEnv.isIE)
        rowHeight = rowHeight - 10;

    if(rowHeight < 100){
        rowHeight = 100;
    }

	if(window.isTinyMCE) {
        this._notesHtmlEditor.setSize(rowWidth-5, rowHeight)
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
    this.resize(size.x, size.y);
};

ZmApptEditView.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) { return; }

	if (newWidth) {
		this.setSize(newWidth);
		Dwt.setSize(this.getHtmlElement().firstChild, newWidth);
	}

	if (newHeight) {
		this.setSize(Dwt.DEFAULT, newHeight);
	}

    this._resizeNotes();

    //If scrollbar handle it
    var size = Dwt.getSize(this.getHtmlElement());
    var compHeight= this._getComponentsHeight();
    if(compHeight > ( size.y + 5 )) {
        newWidth = size.x  - 15;
        Dwt.setSize(this.getHtmlElement().firstChild, newWidth);
        this._notesHtmlEditor.setSize(newWidth - 10);
        if(!this._scrollHandled){
            Dwt.setScrollStyle(this.getHtmlElement(), Dwt.SCROLL_Y);
            this._scrollHandled = true;
        }
    }else{
        if(this._scrollHandled){
            Dwt.setScrollStyle(this.getHtmlElement(), Dwt.CLIP);
            newWidth = size.x;
            Dwt.setSize(this.getHtmlElement().firstChild, newWidth);
            this._notesHtmlEditor.setSize(newWidth - 10);
        }
        this._scrollHandled = false;
    }
};

ZmApptEditView.prototype._initAttachContainer =
function() {
	// create new table row which will contain parent fieldset
	var table = document.getElementById(this._htmlElId + "_table");
	this._attachmentRow = table.insertRow(-1);
	var cell = this._attachmentRow.insertCell(-1);
	cell.colSpan = 7;

	this._uploadFormId = Dwt.getNextId();
	this._attachDivId = Dwt.getNextId();

	var subs = {
		uploadFormId: this._uploadFormId,
		attachDivId: this._attachDivId,
		url: appCtxt.get(ZmSetting.CSFE_UPLOAD_URI)+"&fmt=extended"
	};

	cell.innerHTML = AjxTemplate.expand("calendar.Appointment#AttachContainer", subs);
};

ZmApptEditView._onAttendeesChange =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
    var key = DwtKeyEvent.getCharCode(ev);

    if(key == 32 || key == 59) {
        edv._handleAttendeeField(ZmCalBaseItem.PERSON);                
    }
};