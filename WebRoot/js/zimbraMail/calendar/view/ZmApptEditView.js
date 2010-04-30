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
        this._forwardToField.setValue("");
	}
	this._attInputField[ZmCalBaseItem.LOCATION].setValue("");
	this._locationTextMap = {};

	if (this._resourcesContainer) {
		Dwt.setDisplay(this._resourcesContainer, Dwt.DISPLAY_NONE);
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

ZmApptEditView.prototype.updateTimezone =
function(dateInfo) {
	this._tzoneSelect.setSelectedValue(dateInfo.timezone);
};

// Private / protected methods

ZmApptEditView.prototype._initTzSelect =
function() {
	var options = AjxTimezone.getAbbreviatedZoneChoices();
	if (options.length != this._tzCount) {
		this._tzCount = options.length;
		this._tzoneSelect.clearOptions();
		for (var i = 0; i < options.length; i++) {
			this._tzoneSelect.addOption(options[i]);
		}
	}
};

ZmApptEditView.prototype._addTabGroupMembers =
function(tabGroup) {
	tabGroup.addMember(this._subjectField);
	tabGroup.addMember(this._attInputField[ZmCalBaseItem.LOCATION]);
	if(this.GROUP_CALENDAR_ENABLED) {
		tabGroup.addMember(this._attInputField[ZmCalBaseItem.PERSON]);
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

ZmApptEditView.prototype._populateForSave =
function(calItem) {
	ZmCalItemEditView.prototype._populateForSave.call(this, calItem);

	calItem.freeBusy = this._showAsSelect.getValue();
	calItem.privacy = this._privacySelect.getValue();

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
	if (Dwt.getVisibility(this._tzoneSelect.getHtmlElement()))
		calItem.timezone = this._tzoneSelect.getValue();

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

	if (this.GROUP_CALENDAR_ENABLED) {
		calItem.setRsvp(this._requestResponsesCheckbox.checked);
		calItem.setMailNotificationOption(this._sendNotificationMailCheckbox.checked);
	}

    calItem.isForward = this._isForward;

    if(this._isForward)  {
        var addrs = this._collectForwardAddrs();
        calItem.setForwardAddress(this._attendees[ZmCalBaseItem.PERSON].getArray());
    }

	return calItem;
};


ZmApptEditView.prototype.getRsvp =
function() {
  return this.GROUP_CALENDAR_ENABLED ? this._requestResponsesCheckbox.checked : false;  
};

ZmApptEditView.prototype._populateForEdit =
function(calItem, mode) {

	ZmCalItemEditView.prototype._populateForEdit.call(this, calItem, mode);

	this._showAsSelect.setSelectedValue(calItem.freeBusy);
    this._showAsSelect.setEnabled(!this._isForward);
	this._privacySelect.setSelectedValue(calItem.privacy);

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


    this._startTimeSelect.setEnabled(!this._isForward);
    this._endTimeSelect.setEnabled(!this._isForward);
    this._startDateButton.setEnabled(!this._isForward);
    this._endDateButton.setEnabled(!this._isForward);

	// attendees
	var tp;
	var attendees = calItem.getAttendees(ZmCalBaseItem.PERSON);
	if (attendees && attendees.length) {
		if (this.GROUP_CALENDAR_ENABLED) {
			this._attendeesInputField.setValue(calItem.getAttendeesText(ZmCalBaseItem.PERSON));
		}
        if(!this._isForward) {
		    this._attendees[ZmCalBaseItem.PERSON] = AjxVector.fromArray(attendees);
            tp = this.parent.getTabPage(ZmApptComposeView.TAB_ATTENDEES);
            if (tp) tp._chooser.transfer(attendees, null, true);
            this._attInputField[ZmCalBaseItem.PERSON] = this._attendeesInputField;
        }else {
            this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();
            this._attInputField[ZmCalBaseItem.PERSON] = this._forwardToField;    
        }
	}else {
        if (this.GROUP_CALENDAR_ENABLED) {
            this._attendeesInputField.setValue("");
        }
        this._attendees[ZmCalBaseItem.PERSON] = new AjxVector();
    }

	// set the location *label*    
	this._attInputField[ZmCalBaseItem.LOCATION].setValue(calItem.getLocation());

	// set the location attendee(s)
	var locations = calItem.getAttendees(ZmCalBaseItem.LOCATION);
	if (locations && locations.length) {
		this._attendees[ZmCalBaseItem.LOCATION] = AjxVector.fromArray(locations);
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_LOCATIONS);
		if (tp) {
			if (locations.length > 1)
				tp.enableMultipleLocations(true);
			tp._chooser.transfer(locations, null, true);
		}
	}

	// privacy
	if (this._privacySelect) {
		var isRemote = calItem.isShared();
		var cal = isRemote ? appCtxt.getById(calItem.folderId) : null;
		var isEnabled = ((!isRemote || (cal && cal.hasPrivateAccess())) && !this._isForward);
		var defaultPrivacyOption = (appCtxt.get(ZmSetting.CAL_APPT_VISIBILITY) == ZmSetting.CAL_VISIBILITY_PRIV)?"PRI":"PUB";
		this._privacySelect.setSelectedValue(isEnabled ? (calItem.privacy || defaultPrivacyOption) : "PUB");
		this._privacySelect.setEnabled(isEnabled);
	}

	// set the equipment attendee(s)
	var equipment = calItem.getAttendees(ZmCalBaseItem.EQUIPMENT);
	if (equipment && equipment.length) {
		this._attendees[ZmCalBaseItem.EQUIPMENT] = AjxVector.fromArray(equipment);
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_EQUIPMENT);
		if (tp) {
			tp._chooser.transfer(equipment, null, true);
		}
	}

	this._addResourcesDiv();

	if (this.GROUP_CALENDAR_ENABLED) {
		this._requestResponsesCheckbox.checked = calItem.shouldRsvp();
		// by default the changes made to the appt should be visible to others
		this._sendNotificationMailCheckbox.checked = true;
		this._isOrganizer = calItem.isOrganizer();
		this._attInputField[ZmCalBaseItem.PERSON].setEnabled(calItem.isOrganizer() || this._isForward);
        Dwt.setVisible(this._notificationOptions, calItem.isOrganizer());
        Dwt.setVisible(this._organizerOptions, !calItem.isOrganizer());
        if(this._organizerData) {
            this._organizerData.innerHTML = calItem.getOrganizer() || "";
        }
	}

    this._forwardToField.setValue("");

    this._folderSelect.setEnabled(!this._isForward);
    if (this._reminderSelect) {
		this._reminderSelect.setEnabled(!this._isForward);
	}
    this._allDayCheckbox.disabled = this._isForward;    
};

ZmApptEditView.prototype._addResourcesDiv =
function(calItem) {
	if (!(this._resourcesData && this._resourcesContainer)) { return; }

	var html = [];
	var i = 0;
	var location = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.LOCATION].getArray(), ZmCalBaseItem.LOCATION);
	var equipment = ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.EQUIPMENT].getArray(), ZmCalBaseItem.EQUIPMENT);
	if (location.length || equipment.length) {
		Dwt.setDisplay(this._resourcesContainer, Dwt.DISPLAY_BLOCK);
		if (location.length) {
			html[i++] = "<div style='padding-left:2px'>";
			html[i++] = AjxImg.getImageSpanHtml("Location");
			html[i++] = "&nbsp;<a href='javascript:;' onclick='ZmApptEditView._switchTab(";
			html[i++] = '"' + ZmCalBaseItem.LOCATION + '"';
			html[i++] = ")'>";
			html[i++] = location;
			html[i++] = "</a></div>";
		}
		if (equipment.length) {
			html[i++] = "<div style='padding-left:2px'>";
			html[i++] = AjxImg.getImageSpanHtml("Resource");
			html[i++] = "&nbsp;<a href='javascript:;' onclick='ZmApptEditView._switchTab(";
			html[i++] = '"' + ZmCalBaseItem.EQUIPMENT + '"';
			html[i++] = ")'>";
			html[i++] = equipment;
			html[i++] = "</a></div>";
		}
	} else {
		Dwt.setDisplay(this._resourcesContainer, Dwt.DISPLAY_NONE);
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

	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#EditView", subs);
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
			rows: 3,
			parentElement: (this._htmlElId + "_person")
		};
		var input = this._attInputField[ZmCalBaseItem.PERSON] = new DwtInputField(params);
		var inputEl = input.getInputElement();
		Dwt.setSize(inputEl, "100%", "50px");
		inputEl._attType = ZmCalBaseItem.PERSON;
        this._attendeesInputField = this._attInputField[ZmCalBaseItem.PERSON];
	}

	// add location input field
	params = {
		parent: this,
		type: DwtInputField.STRING,
		parentElement: (this._htmlElId + "_location")
	};
	var input = this._attInputField[ZmCalBaseItem.LOCATION] = new DwtInputField(params);
	var inputEl = input.getInputElement();
	Dwt.setSize(inputEl, width, "22px");
	inputEl._attType = ZmCalBaseItem.LOCATION;

	this._resourcesContainer = document.getElementById(this._htmlElId + "_resourcesContainer");
	this._resourcesData = document.getElementById(this._htmlElId + "_resourcesData");

	// show-as DwtSelect
	this._showAsSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_showAsSelect")});
	for (var i = 0; i < ZmApptEditView.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptEditView.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}

	// privacy DwtSelect
	this._privacySelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_privacySelect")});
	for (var j = 0; j < ZmApptEditView.PRIVACY_OPTIONS.length; j++) {
		var option = ZmApptEditView.PRIVACY_OPTIONS[j];
		this._privacySelect.addOption(option.label, option.selected, option.value);
	}
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
		this._requestResponsesCheckbox = document.getElementById(this._htmlElId + "_requestResponses");
		this._sendNotificationMailCheckbox = document.getElementById(this._htmlElId + "_sendNotificationMail");
		Dwt.setHandler(this._sendNotificationMailCheckbox, DwtEvent.ONCLICK, ZmApptEditView._showNotificationWarning);
	}


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

	this._tzoneSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_tzoneSelect"), cascade:false});
	this._tzoneSelect.addChangeListener(timezoneListener);
	// NOTE: tzone select is initialized later

	// init auto-complete widget if contacts app enabled
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this._initAutocomplete();
	}

    this._notificationOptions = document.getElementById(this._htmlElId + "_notification_options");
    this._organizerOptions = document.getElementById(this._htmlElId + "_organizer_options");
    this._organizerData = document.getElementById(this._htmlElId + "_organizer");

    var isPickerEnabled = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) ||
						   appCtxt.get(ZmSetting.GAL_ENABLED) ||
						   appCtxt.multiAccounts);
    if (isPickerEnabled) {
        var pickerId = this._htmlElId + "_picker";
        var pickerEl = document.getElementById(pickerId);
        if (pickerEl) {
            var buttonId = Dwt.getNextId();
            var button = this._pickerButton = new DwtButton({parent:this, id:buttonId});
            button.setText(pickerEl.innerHTML);
            button.replaceElement(pickerEl);

            button.addSelectionListener(new AjxListener(this, this._addressButtonListener));
            button.addrType = ZmCalBaseItem.PERSON;
        }
    }
};

ZmApptEditView.prototype._addressButtonListener =
function(ev, addrType) {
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
    var addrs = {};
    addrs[ZmApptEditView.BAD] = new AjxVector();
    var val = AjxStringUtil.trim(this._forwardToField.getValue());
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


ZmApptEditView.prototype._folderListener =
function() {
	if (!this._privacySelect) { return; }

	var calId = this._folderSelect.getValue();
	var cal = appCtxt.getById(calId);

	var acct = appCtxt.getActiveAccount();
	var id = String(cal.id);
	var isRemote = (id.indexOf(":") != -1) && (id.indexOf(acct.id) != 0);
	var isEnabled = !isRemote || cal.hasPrivateAccess();

	this._privacySelect.setEnabled(isEnabled);
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
		this.parent.parent.updateAttendees([], ZmCalBaseItem.LOCATION);
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
	if (attendee) {
		var type = el._attType;

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
		this.parent.parent.updateAttendees(attendee, type, (type == ZmCalBaseItem.LOCATION )?ZmApptComposeView.MODE_REPLACE : ZmApptComposeView.MODE_ADD);

		if (type == ZmCalBaseItem.LOCATION) {
			this._addResourcesDiv();
			this._isKnownLocation = true;
		}
	}
};

ZmApptEditView.prototype._addEventHandlers =
function() {
	var edvId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmCalItemEditView._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmCalItemEditView._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);

	this._allDayCheckbox._editViewId = this._repeatDescField._editViewId = edvId;
	this._startDateField._editViewId = this._endDateField._editViewId = edvId;

	if (this._attendeesInputField) {
		var inputEl = this._attendeesInputField.getInputElement();
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
};

// cache all input fields so we dont waste time traversing DOM each time
ZmApptEditView.prototype._cacheFields =
function() {
	ZmCalItemEditView.prototype._cacheFields.call(this);
	this._allDayCheckbox = document.getElementById(this._allDayCheckboxId);
};

ZmApptEditView.prototype._resetTimezoneSelect =
function(calItem, isAllDayAppt) {
	this._tzoneSelect.setSelectedValue(calItem.timezone);
};

ZmApptEditView.prototype._setTimezoneVisible =
function(dateInfo) {
	var showTimezone = !dateInfo.isAllDay;
	if (showTimezone) {
		showTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) ||
					   dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
	}
	Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), showTimezone);
};

ZmApptEditView.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	this._setTimezoneVisible(this._dateInfo);

	// also show/hide the "@" text
	Dwt.setVisibility(document.getElementById(this._startTimeAtLblId), show);
	Dwt.setVisibility(document.getElementById(this._endTimeAtLblId), show);
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
	vals.push(this._privacySelect.getValue());
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
	if (Dwt.getVisibility(this._tzoneSelect.getHtmlElement()))
		vals.push(this._tzoneSelect.getValue());
	vals.push(this._repeatSelect.getValue());
	if (!excludeAttendees) {
		vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmCalBaseItem.PERSON].getArray(), ZmCalBaseItem.PERSON, false, true));
	}
	vals.push(this._notesHtmlEditor.getContent());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};


// Listeners

ZmApptEditView.prototype._timeChangeListener =
function(ev, id) {
	ZmTimeInput.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField, this._dateInfo, id);
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
};

ZmApptEditView.prototype._timezoneListener =
function(ev) {
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
		for (var i = 0; i < attendees.length; i++) {
			list.push(attendees[i].getAttendeeText(type));
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
		}
	}
	this._addResourcesDiv();
};

ZmApptEditView.prototype.setApptLocation =
function(val) {
    this._attInputField[ZmCalBaseItem.LOCATION].setValue(val);
};

ZmApptEditView.prototype._handleAttendeeField =
function(type, useException) {
	if (!this._activeInputField) { return; }

	this._controller._invalidAttendees = [];
	var value = this._attInputField[type].getValue();
    return this._updateAttendeeFieldValues(type, value);
};

ZmApptEditView.prototype._updateAttendeeFieldValues =
function(type, value) {
	var attendees = new AjxVector();
	var items = AjxEmailAddress.split(value);

	for (var i = 0; i < items.length; i++) {
		var item = AjxStringUtil.trim(items[i]);
		if (!item) continue;

		// see if it's an attendee we already know about (added via autocomplete or other tab)
		var attendee = this._getAttendeeByName(type, item) ||
					   this._getAttendeeByItem(item, type) ||
					   ZmApptViewHelper.getAttendeeFromItem(item, type);
		if (attendee) {
			attendees.add(attendee);
		} else {
			this._controller._invalidAttendees.push(item);
		}
	}

	// *always* force replace of attendees list with what we've found
	this.parent.parent.updateAttendees(attendees, type);
	
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
	} else {
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
