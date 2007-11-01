/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new tab view for scheduling appointment attendees.
 * @constructor
 * @class
 * This class displays free/busy information for an appointment's attendees. An
 * attendee may be a person, a location, or equipment.
 * 
 *  @author Parag Shah
 *
 * @param parent			[ZmApptComposeView]			the appt compose view
 * @param attendees			[hash]						attendees/locations/equipment
 * @param controller		[ZmApptComposeController]	the appt compose controller
 * @param dateInfo			[object]					hash of date info
 */
ZmSchedTabViewPage = function(parent, attendees, controller, dateInfo) {

	DwtTabViewPage.call(this, parent);

	this._attendees = attendees;
	this._controller = controller;
	this._dateInfo = dateInfo;

	this._editView = parent.getTabPage(ZmApptComposeView.TAB_APPOINTMENT).getEditView();

	this.setScrollStyle(Dwt.SCROLL);
	this._rendered = false;
	this._emailToIdx = {};
	this._schedTable = [];
	this._allAttendees = [];
	this._allAttendeesSlot = null;

	this._attTypes = [ZmCalItem.PERSON];
	if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._attTypes.push(ZmCalItem.LOCATION);
		this._attTypes.push(ZmCalItem.EQUIPMENT);
	}

	this._fbCallback = new AjxCallback(this, this._handleResponseFreeBusy);
	this._kbMgr = appCtxt.getShell().getKeyboardMgr();
};

ZmSchedTabViewPage.prototype = new DwtTabViewPage;
ZmSchedTabViewPage.prototype.constructor = ZmSchedTabViewPage;


// Consts

ZmSchedTabViewPage.FREEBUSY_NUM_CELLS		= 48;

ZmSchedTabViewPage.STATUS_FREE				= 1;
ZmSchedTabViewPage.STATUS_BUSY				= 2;
ZmSchedTabViewPage.STATUS_TENTATIVE			= 3;
ZmSchedTabViewPage.STATUS_OUT				= 4;
ZmSchedTabViewPage.STATUS_UNKNOWN			= 5;

// Pre-cache the status css class names
ZmSchedTabViewPage.STATUS_CLASSES = [];
ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_FREE] = 	"ZmScheduler-free";
ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_BUSY] =		"ZmScheduler-busy";
ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_TENTATIVE]= "ZmScheduler-tentative";
ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_OUT] = 		"ZmScheduler-outOfOffice";
ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_UNKNOWN] = 	"ZmScheduler-unknown";

ZmSchedTabViewPage.PSTATUS_CLASSES = [];
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_DECLINED]      = "ZmSchedulerPTST-declined";
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_DEFERRED]      = "ZmSchedulerPTST-deferred";
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_DELEGATED]     = "ZmSchedulerPTST-delegated";
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_NEEDS_ACTION]  = "ZmSchedulerPTST-needsaction";
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_TENTATIVE]     = "ZmSchedulerPTST-tentative";
ZmSchedTabViewPage.PSTATUS_CLASSES[ZmCalItem.PSTATUS_WAITING]       = "ZmSchedulerPTST-waiting";

// Hold on to this one separately because we use it often
ZmSchedTabViewPage.FREE_CLASS = ZmSchedTabViewPage.STATUS_CLASSES[ZmSchedTabViewPage.STATUS_FREE];

// Public methods

ZmSchedTabViewPage.prototype.toString =
function() {
	return "ZmSchedTabViewPage";
};

ZmSchedTabViewPage.prototype.showMe =
function() {

	ZmApptViewHelper.getDateInfo(this._editView, this._dateInfo);
	this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);

	if (!this._rendered) {
		this._initialize();
	}

	this.parent.tabSwitched(this._tabKey);
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);

	this.set(this._dateInfo, this._editView.getOrganizer(), this._attendees);
	this._controller._setComposeTabGroup();
};

ZmSchedTabViewPage.prototype.tabBlur =
function(useException) {
	if (this._activeInputIdx != null) {
		var inputEl = this._schedTable[this._activeInputIdx].inputObj.getInputElement();
		this._handleAttendeeField(inputEl, null, useException);
		this._activeInputIdx = null;
	}
	if (this._activeDateField) {
		this._handleDateChange(this._activeDateField == this._startDateField);
	}
};

ZmSchedTabViewPage.prototype.initialize =
function(appt, mode) {
	this._appt = appt;
	this._mode = mode;
};

ZmSchedTabViewPage.prototype.set =
function(dateInfo, organizer, attendees) {
	this._startDateField.value = dateInfo.startDate;
	this._endDateField.value = dateInfo.endDate;
	if (dateInfo.showTime) {
		this._allDayCheckbox.checked = false;
		this._showTimeFields(true);
		this._startTimeSelect.setSelected(dateInfo.startHourIdx, dateInfo.startMinuteIdx, dateInfo.startAmPmIdx);
		this._endTimeSelect.setSelected(dateInfo.endHourIdx, dateInfo.endMinuteIdx, dateInfo.endAmPmIdx);
	} else {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);
	}
	this._resetFullDateField();

    this._initTzSelect();
    this._resetTimezoneSelect(dateInfo);

	this._setAttendees(organizer, attendees);
	this._outlineAppt(this._dateInfo);
};

ZmSchedTabViewPage.prototype.cleanup =
function() {
	if (!this._rendered) return;

	// remove all but first two rows (header and All Attendees)
	while (this._attendeesTable.rows.length > 2) {
		this._removeAttendeeRow(2);
	}
	this._activeInputIdx = null;

	// cleanup all attendees row
	var allAttCells = this._allAttendeesSlot._coloredCells;
	while (allAttCells.length > 0) {
		allAttCells[0].className = ZmSchedTabViewPage.FREE_CLASS;
		allAttCells.shift();
	}

	for (var i in this._emailToIdx) {
		delete this._emailToIdx[i];
	}

	this._curValStartDate = "";
	this._curValEndDate = "";

	this._resetAttendeeCount();

	// reset autocomplete lists
	if (this._acContactsList) {
		this._acContactsList.reset();
		this._acContactsList.show(false);
	}
	if (this._acEquipmentList) {
		this._acEquipmentList.reset();
		this._acEquipmentList.show(false);
	}
};

ZmSchedTabViewPage.prototype.isDirty =
function() {
	return false;
};

ZmSchedTabViewPage.prototype.isValid =
function() {
	return true;
};

ZmSchedTabViewPage.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) return;

	if (newWidth) {
		this.setSize(newWidth);
	}

	if (newHeight) {
		this.setSize(Dwt.DEFAULT, newHeight - 30);
	}
};

ZmSchedTabViewPage.prototype.toggleAllDayField =
function() {
	var el = this._allDayCheckbox;
	el.checked = !el.checked;
	this._showTimeFields(!el.checked);
	this._editView.updateAllDayField(el.checked);
	this._outlineAppt();
};

// Private / protected methods

ZmSchedTabViewPage.prototype._initialize =
function() {
	this._createHTML();
	this._initAutocomplete();
	this._createDwtObjects();
	this._addEventHandlers();
	this._resetAttendeeCount();

	this._rendered = true;
};

ZmSchedTabViewPage.prototype._createHTML =
function() {
	this._startDateFieldId 	= this._htmlElId + "_startDateField";
	this._startMiniCalBtnId = this._htmlElId + "_startMiniCalBtn";
	this._startTimeSelectId = this._htmlElId + "_startTimeSelect";
	this._startTimeAtLblId	= this._htmlElId + "_startTimeAtLbl";
	this._allDayCheckboxId 	= this._htmlElId + "_allDayCheckbox";
	this._endDateFieldId 	= this._htmlElId + "_endDateField";
	this._endMiniCalBtnId 	= this._htmlElId + "_endMiniCalBtn";
	this._endTimeSelectId 	= this._htmlElId + "_endTimeSelect";
    this._endTimeAtLblId	= this._htmlElId + "_endTimeAtLbl";
    this._tzoneSelectId	    = this._htmlElId + "_tzoneSelect";
	this._navToolbarId		= this._htmlElId + "_navToolbar";
	this._attendeesTableId	= this._htmlElId + "_attendeesTable";

	this._schedTable[0] = null;	// header row has no attendee data

	var subs = { id:this._htmlElId, isAppt: true, showTZSelector: appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#ScheduleView", subs);
};

ZmSchedTabViewPage.prototype._initAutocomplete =
function() {
	var shell = appCtxt.getShell();
	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	var keyUpCallback = new AjxCallback(this, this._autocompleteKeyUpCallback);
	this._acList = {};

	// autocomplete for attendees
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactsClass = appCtxt.getApp(ZmApp.CONTACTS);
		var contactsLoader = contactsClass.getContactList;
		var params = {parent: shell, dataClass: contactsClass, dataLoader: contactsLoader, separator: "",
					  matchValue: ZmContactsApp.AC_VALUE_NAME, keyUpCallback: keyUpCallback, compCallback: acCallback};
		this._acContactsList = new ZmAutocompleteListView(params);
		this._acList[ZmCalItem.PERSON] = this._acContactsList;
	}
	// autocomplete for locations/equipment
	if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var resourcesClass = appCtxt.getApp(ZmApp.CALENDAR);
		var params = {parent: shell, dataClass: resourcesClass, dataLoader: resourcesClass.getLocations, separator: "",
					  matchValue: ZmContactsApp.AC_VALUE_NAME, compCallback: acCallback};
		this._acLocationsList = new ZmAutocompleteListView(params);
		this._acList[ZmCalItem.LOCATION] = this._acLocationsList;
		params.dataLoader = resourcesClass.getEquipment;
		this._acEquipmentList = new ZmAutocompleteListView(params);
		this._acList[ZmCalItem.EQUIPMENT] = this._acEquipmentList;
	}
};

// Add the attendee, then create a new empty slot since we've now filled one.
ZmSchedTabViewPage.prototype._autocompleteCallback =
function(text, el, match) {
	if (match && match.item) {
		if (match.item.isGroup()) {
			var members = match.item.getGroupMembers().good.getArray();
			for (var i = 0; i < members.length; i++) {
				el.value = members[i].address;
				var index = this._handleAttendeeField(el);

				if (index && ((i+1) < members.length)) {
					el = this._schedTable[index].inputObj.getInputElement();
				}
			}
		} else {
			this._handleAttendeeField(el, match.item);
		}
	}
};

// Enter listener. If the user types a return when no autocomplete list is showing,
// then go ahead and add a new empty slot.
ZmSchedTabViewPage.prototype._autocompleteKeyUpCallback =
function(ev, aclv, result) {
	var key = DwtKeyEvent.getCharCode(ev);
	if ((key == 3 || key == 13) && !aclv.getVisible()) {
		var el = DwtUiEvent.getTargetWithProp(ev, "id");
		this._handleAttendeeField(el);
	}
};

ZmSchedTabViewPage.prototype._addTabGroupMembers =
function(tabGroup) {
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (sched && sched.inputObj) {
			tabGroup.addMember(sched.inputObj);
		}
	}
};

/*
* Adds a new, empty slot with a select for the attendee type, an input field, and
* cells for free/busy info.
*
* @param isAllAttendees		[boolean]*	if true, this is the "All Attendees" row
* @param organizer			[string]*	organizer
* @param drawBorder			[boolean]*	if true, draw borders to indicate appt time
* @param index				[int]*		index at which to add the row
* @param updateTabGroup		[boolean]*	if true, add this row to the tab group
* @param setFocus			[boolean]*	if true, set focus to this row's input field
*/
ZmSchedTabViewPage.prototype._addAttendeeRow =
function(isAllAttendees, organizer, drawBorder, index, updateTabGroup, setFocus) {
	index = index || this._attendeesTable.rows.length;

	// store some meta data about this table row
	var sched = {};
	var dwtId = Dwt.getNextId();	// container for input
	sched.dwtNameId		= dwtId + "_NAME_";			// TD that contains name
	sched.dwtTableId	= dwtId + "_TABLE_";		// TABLE with free/busy cells
	sched.dwtSelectId	= dwtId + "_SELECT_";		// TD that contains select menu
	sched.dwtInputId	= dwtId + "_INPUT_";		// input field
	sched.idx = index;
	sched._coloredCells = [];
	this._schedTable[index] = sched;

    var data = {
        id: dwtId,
        sched: sched,
        isAllAttendees: isAllAttendees,
        organizer: organizer,
        cellCount: ZmSchedTabViewPage.FREEBUSY_NUM_CELLS
    };

	var tr = this._attendeesTable.insertRow(index);
	var td = tr.insertCell(-1);
    td.innerHTML = AjxTemplate.expand("calendar.Appointment#AttendeeName", data);

	var td = tr.insertCell(-1);
    td.innerHTML = AjxTemplate.expand("calendar.Appointment#AttendeeFreeBusy", data);

	// create DwtInputField and DwtSelect for the attendee slots, add handlers
	if (!isAllAttendees && !organizer) {
		// add DwtSelect
		var select;
		var selectId = sched.dwtSelectId;
		var selectDiv = document.getElementById(selectId);
		if (selectDiv) {
			select = new DwtSelect(this);
			select.addOption(new DwtSelectOption(ZmCalItem.PERSON, true, null, null, null, "Person"));
			select.addOption(new DwtSelectOption(ZmCalItem.LOCATION, false, null, null, null, "Location"));
			select.addOption(new DwtSelectOption(ZmCalItem.EQUIPMENT, false, null, null, null, "Resource"));
			select.reparentHtmlElement(selectId);
			select.addChangeListener(this._selectChangeListener);
			select.setSize("50");
			select._schedTableIdx = index;
			sched.selectObj = select;
		}
		// add DwtInputField
		var nameDiv = document.getElementById(sched.dwtNameId);
		if (nameDiv) {
			var dwtInputField = new DwtInputField({parent: this, type: DwtInputField.STRING, maxLen: 256});
			dwtInputField.setDisplay(Dwt.DISPLAY_INLINE);
			var inputEl = dwtInputField.getInputElement();
			inputEl.className = "ZmSchedulerInput";
			inputEl.id = sched.dwtInputId;
			sched.attType = inputEl._attType = ZmCalItem.PERSON;
			sched.inputObj = dwtInputField;
			if (select) {
				select.dwtInputField = dwtInputField;
			}
			dwtInputField.reparentHtmlElement(sched.dwtNameId);
		}
		
		sched.ptstObj = document.getElementById(sched.dwtNameId+"_ptst");
		
		// set handlers
		var attendeeInput = document.getElementById(sched.dwtInputId);
		if (attendeeInput) {
			this._activeInputIdx = null;
			this._activeInputIdx = index;
			// handle focus moving to/from an enabled input
			Dwt.setHandler(attendeeInput, DwtEvent.ONFOCUS, ZmSchedTabViewPage._onFocus);
			Dwt.setHandler(attendeeInput, DwtEvent.ONBLUR, ZmSchedTabViewPage._onBlur);
			attendeeInput._schedViewPageId = this._svpId;
			attendeeInput._schedTableIdx = index;
			// default to person-based autocomplete handling
			if (this._acContactsList) {
				this._acContactsList.handle(attendeeInput);
			}
		}
	}

	if (drawBorder) {
		this._updateBorders(sched, isAllAttendees);
	}
	if (updateTabGroup) {
		this._controller._setComposeTabGroup();
	}
	if (setFocus && sched.inputObj) {
		this._kbMgr.grabFocus(sched.inputObj);
	}

	return index;
};

ZmSchedTabViewPage.prototype._removeAttendeeRow =
function(index, updateTabGroup) {
	this._attendeesTable.deleteRow(index);
	this._schedTable.splice(index, 1);
	if (updateTabGroup) {
		this._controller._setComposeTabGroup(true);
	}
};

ZmSchedTabViewPage.prototype._createDwtObjects =
function() {
    var timezoneListener = new AjxListener(this, this._timezoneListener);

    this._tzoneSelect = new DwtSelect(this);
    if (appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE)) {
    	this._tzoneSelect.reparentHtmlElement(this._tzoneSelectId);
    }
    this._tzoneSelect.addChangeListener(timezoneListener);
    // NOTE: tzone select is initialized later
    delete this._tzoneSelectId;

	var timeSelectListener = new AjxListener(this, this._timeChangeListener);

	this._startTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.START);
	this._startTimeSelect.reparentHtmlElement(this._startTimeSelectId);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	delete this._startTimeSelectId;

	this._endTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.END);
	this._endTimeSelect.addChangeListener(timeSelectListener);
	this._endTimeSelect.reparentHtmlElement(this._endTimeSelectId);
	delete this._endTimeSelectId;

	// create mini calendar buttons
	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener);

	var navBarListener = new AjxListener(this, this._navBarListener);
	this._navToolbar = new ZmNavToolBar(this, DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._navToolbar._textButton.getHtmlElement().className = "ZmSchedulerDate";
	this._navToolbar.addSelectionListener(ZmOperation.PAGE_BACK, navBarListener);
	this._navToolbar.addSelectionListener(ZmOperation.PAGE_FORWARD, navBarListener);
	this._navToolbar.reparentHtmlElement(this._navToolbarId);
	delete this._navToolbarId;

	this._freeBusyDiv = document.getElementById(this._freeBusyDivId);
	delete this._freeBusyDivId;

	this._startDateField 	= document.getElementById(this._startDateFieldId);
	this._endDateField 		= document.getElementById(this._endDateFieldId);
	this._allDayCheckbox 	= document.getElementById(this._allDayCheckboxId);

	this._curValStartDate = "";
	this._curValEndDate = "";

	// add All Attendees row
	this._svpId = AjxCore.assignId(this);
	this._attendeesTable = document.getElementById(this._attendeesTableId);
	this._allAttendeesIndex = this._addAttendeeRow(true, null, false);
	this._allAttendeesSlot = this._schedTable[this._allAttendeesIndex];
	this._allAttendeesTable = document.getElementById(this._allAttendeesSlot.dwtTableId);

	this._selectChangeListener = new AjxListener(this, this._selectChangeListener);
};

ZmSchedTabViewPage.prototype._initTzSelect = function() {
    // XXX: this seems like overkill, list all timezones!?
    var options = AjxTimezone.getAbbreviatedZoneChoices();
    if (options.length != this._tzCount) {
        this._tzCount = options.length;
        this._tzoneSelect.clearOptions();
        for (var i = 0; i < options.length; i++) {
            this._tzoneSelect.addOption(options[i]);
        }
    }
};

ZmSchedTabViewPage.prototype._addEventHandlers =
function() {
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
	this._allDayCheckbox._schedViewPageId = this._svpId;

	Dwt.setHandler(this._startDateField, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
	Dwt.setHandler(this._startDateField, DwtEvent.ONBLUR, ZmSchedTabViewPage._onBlur);
	Dwt.setHandler(this._endDateField, DwtEvent.ONBLUR, ZmSchedTabViewPage._onBlur);
	this._startDateField._schedViewPageId = this._endDateField._schedViewPageId = this._svpId;
};

ZmSchedTabViewPage.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
    this._setTimezoneVisible(this._dateInfo);

	// also show/hide the "@" text
	Dwt.setVisibility(document.getElementById(this._startTimeAtLblId), show);
	Dwt.setVisibility(document.getElementById(this._endTimeAtLblId), show);
};

/*
* Called by ONBLUR handler for attendee input field.
*/
ZmSchedTabViewPage.prototype._handleAttendeeField =
function(inputEl, attendee, useException) {

	var idx = inputEl._schedTableIdx;
	if (idx != this._activeInputIdx) return;

	var sched = this._schedTable[idx];
	if (!sched) return;
	var input = sched.inputObj;
	if (!input) return;

	var value = input.getValue();
	if (value) {
		value = AjxStringUtil.trim(value.replace(/[;,]$/, ""));	// trim separator, white space
	}
	var curAttendee = sched.attendee;
	var type = sched.attType;

	if (value) {
		if (curAttendee) {
			// user edited slot with an attendee in it
			var attText = AjxStringUtil.trim(curAttendee.getAttendeeText(type, true));
			if (value == attText) {
				return;
			} else {
				this._resetRow(sched, false, type, true);
			}
		}
		attendee = attendee ? attendee : ZmApptViewHelper.getAttendeeFromItem(value, type, true);
		if (attendee) {
			var email = attendee.getEmail();
			this._emailToIdx[email] = idx;
			// go get this attendee's free/busy info if we haven't already
			if (sched.uid != email) {
				this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), email, this._fbCallback);
			}
			sched.attendee = attendee;
			this._setAttendeeToolTip(sched, attendee);
			this.parent.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
			if (!curAttendee) {
				// user added attendee in empty slot
				return this._addAttendeeRow(false, null, true, null, true, true); // add new empty slot
			}
		} else {
			this._activeInputIdx = null;
		}
	} else if (curAttendee) {
		// user erased an attendee
		this._resetRow(sched, false, type);
		this._removeAttendeeRow(idx, true);
	}
};

ZmSchedTabViewPage.prototype._setAttendeeToolTip =
function(sched, attendee, type) {
	if (type != ZmCalItem.PERSON) return;

	var name = attendee.getFullName();
	var email = attendee.getEmail();
	if (name && email) {
        var ptst = ZmMsg.attendeeStatusLabel + ZmCalItem.getLabelForParticipationStatus(attendee.getAttr("participationStatus") || "NA");
        sched.inputObj.setToolTipContent(email +"<br>"+ ptst);
	}
};

ZmSchedTabViewPage.prototype._getStartTime =
function() {
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	if (!this._allDayCheckbox.checked) {
		startDate.setHours(0, 0, 0, 0);
	}
	return startDate.getTime();
};

ZmSchedTabViewPage.prototype._getEndTime =
function() {
	// XXX: always get start date field value since we dont support multiday yet
	//var ed = this._endDateField.value;
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (!this._allDayCheckbox.checked) {
		endDate.setHours(23, 59, 0, 0);
	}
	return endDate.getTime();
};

ZmSchedTabViewPage.prototype._colorAllAttendees =
function() {
	var row = this._allAttendeesTable.rows[0];

	for (var i = 0; i < this._allAttendees.length; i++) {
		if (this._allAttendees[i] > 0) {
			// TODO: opacity...
			row.cells[i].className = this._getClassForStatus(ZmSchedTabViewPage.STATUS_BUSY);
			this._allAttendeesSlot._coloredCells.push(row.cells[i]);
		}
	}
};

ZmSchedTabViewPage.prototype._updateFreeBusy =
function() {
	// update the full date field
	this._resetFullDateField();

	// clear the schedules for existing attendees
	var uids = [];
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (!sched) continue;
		if (sched.uid)
			uids.push(sched.uid);
	}

	this._resetAttendeeCount();

	if (uids.length) {
		var emails = uids.join(",");
		this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), emails, this._fbCallback);
	}
};

// XXX: optimize later - currently we always update the f/b view :(
ZmSchedTabViewPage.prototype._setAttendees =
function(organizer, attendees) {

	this.cleanup();
	var emails = [];
	// create a slot for the organizer
	this._organizerIndex = this._addAttendeeRow(false, organizer.getAttendeeText(ZmCalItem.PERSON, true), false);
	emails.push(this._setAttendee(this._organizerIndex, organizer, ZmCalItem.PERSON, true));

	// create slots for each of the other attendees/resources
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		var att = attendees[type].getArray();
		for (var i = 0; i < att.length; i++) {
			var email = att[i] ? att[i].getEmail() : null;
			if (email && !this._emailToIdx[email]) {
				var index = this._addAttendeeRow(false, null, false); // create a slot for this attendee
				emails.push(this._setAttendee(index, att[i], type, false));
			}
		}
	}

	// make sure there's always an empty slot
	this._addAttendeeRow(false, null, false, null, true, true);

	if (emails.length) {
		this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), emails.join(","), this._fbCallback);
	}
};

ZmSchedTabViewPage.prototype._setAttendee =
function(index, attendee, type, isOrganizer) {
	var sched = this._schedTable[index];
	if (!sched) return;

	sched.attendee = attendee;
	sched.attType = type;
	var input = sched.inputObj;
	if (input) {
		input.setValue(attendee.getAttendeeText(type, true), true);
		this._setAttendeeToolTip(sched, attendee, type);
	}

	var select = sched.selectObj;
	if (select) {
		select.setSelectedValue(type);
	}
	
    var ptst = attendee.getAttr("participationStatus") || "NA";
	var ptstCont = sched.ptstObj;
	if(ptstCont) {
		var ptstIcon = ZmCalItem.getParticipationStatusIcon(ptst);
		if(ptstIcon != "") {
			var ptstLabel = ZmMsg.attendeeStatusLabel + " " + ZmCalItem.getLabelForParticipationStatus(ptst);
			ptstCont.innerHTML = AjxImg.getImageHtml(ptstIcon);
			var imgDiv = ptstCont.firstChild;
			if(imgDiv && !imgDiv._schedViewPageId ){
				Dwt.setHandler(imgDiv, DwtEvent.ONMOUSEOVER, ZmSchedTabViewPage._onPTSTMouseOver);	
				Dwt.setHandler(imgDiv, DwtEvent.ONMOUSEOUT, ZmSchedTabViewPage._onPTSTMouseOut);
				imgDiv._ptstLabel = ptstLabel;
				imgDiv._schedViewPageId = this._svpId;
				imgDiv._schedTableIdx = index;
			}
		}
	}	
	
	var email = attendee.getEmail();
	this._emailToIdx[email] = index;

	return email;
};

/*
* Resets a row to its starting state. The input is cleared and removed, and
* the free/busy blocks are set back to their default color. Optionally, the
* select is set back to person.
*
* @param sched			[object]		info for this row
* @param resetSelect	[boolean]*		if true, set select to PERSON
* @param type			[constant]*		attendee type
* @param noClear		[boolean]*		if true, don't clear input field
*/
ZmSchedTabViewPage.prototype._resetRow =
function(sched, resetSelect, type, noClear) {

	var input = sched.inputObj;
	if (sched.attendee && type) {
		this.parent.updateAttendees(sched.attendee, type, ZmApptComposeView.MODE_REMOVE);
		if (input) {
			input.setToolTipContent(null);
		}
		sched.attendee = null;
	}

	// clear input field
	if (input && !noClear) {
		input.setValue("", true);
	}

	// reset the row color to non-white
	var table = document.getElementById(sched.dwtTableId);
	if (table) {
		table.rows[0].className = "ZmSchedulerDisabledRow";
	}

	// remove the bgcolor from the cells that were colored
	this._clearColoredCells(sched);

	// reset the select to person
	if (resetSelect) {
		var select = AjxCore.objectWithId(sched.selectObjId);
		if (select) {
			select.setSelectedValue(ZmCalItem.PERSON);
		}
	}

	sched.uid = null;
	this._activeInputIdx = null;
};

ZmSchedTabViewPage.prototype._resetTimezoneSelect =
function(dateInfo) {
    this._tzoneSelect.setSelectedValue(dateInfo.timezone);
};
ZmSchedTabViewPage.prototype._setTimezoneVisible =
function(dateInfo) {
    var showTimezone = !dateInfo.isAllDay;
    if (showTimezone) {
        showTimezone = appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) ||
                       dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    }
    Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), showTimezone);
};

ZmSchedTabViewPage.prototype._clearColoredCells =
function(sched) {
	while (sched._coloredCells.length > 0) {
		// decrement cell count in all attendees row
		var idx = sched._coloredCells[0].cellIndex;
		if (this._allAttendees[idx] > 0) {
			this._allAttendees[idx] = this._allAttendees[idx] - 1;
		}

		sched._coloredCells[0].className = ZmSchedTabViewPage.FREE_CLASS;
		sched._coloredCells.shift();
	}
	var allAttColors = this._allAttendeesSlot._coloredCells;
	while (allAttColors.length > 0) {
		var idx = allAttColors[0].cellIndex;
		// clear all attendees cell if it's now free
		if (this._allAttendees[idx] == 0) {
			allAttColors[0].className = ZmSchedTabViewPage.FREE_CLASS;
		}
		allAttColors.shift();
	}
};

ZmSchedTabViewPage.prototype._resetAttendeeCount =
function() {
	for (var i = 0; i < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; i++) {
		this._allAttendees[i] = 0;
	}
};

ZmSchedTabViewPage.prototype._resetFullDateField =
function() {
	var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.MEDIUM);
	this._navToolbar.setText(formatter.format(AjxDateUtil.simpleParseDateStr(this._startDateField.value)));
};

ZmSchedTabViewPage.prototype._handleDateChange =
function(isStartDate, skipCheck) {
	var start = this._startDateField.value;
	var end = this._endDateField.value;
	if ((isStartDate && (start == this._curValStartDate)) ||
		(!isStartDate && (end == this._curValEndDate))) {
		return;
	}

	isStartDate ? this._curValStartDate = start : this._curValEndDate = end;
	var needsUpdate = ZmApptViewHelper.handleDateChange(this._startDateField, this._endDateField, isStartDate, skipCheck);
	if (needsUpdate) {
		this._updateFreeBusy();
	}
	// finally, update the appt tab view page w/ new date(s)
	this._editView.updateDateField(this._startDateField.value, this._endDateField.value);
};

// Listeners

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._dateButtonListener =
function(ev) {
	var calDate = ev.item == this._startDateButton
		? AjxDateUtil.simpleParseDateStr(this._startDateField.value)
		: AjxDateUtil.simpleParseDateStr(this._endDateField.value);

	// if date was input by user and its foobar, reset to today's date
	if (isNaN(calDate)) {
		calDate = new Date();
		var field = ev.item == this._startDateButton
			? this._startDateField : this._endDateField;
		field.value = AjxDateUtil.simpleComputeDateStr(calDate);
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();
};

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._dateCalSelectionListener =
function(ev) {
	var parentButton = ev.item.parent.parent;

	// update the appropriate field w/ the chosen date
	var field = (parentButton == this._startDateButton)
		? this._startDateField : this._endDateField;
	field.value = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	this._handleDateChange(parentButton == this._startDateButton, true);
};

ZmSchedTabViewPage.prototype._navBarListener =
function(ev) {
	var op = ev.item.getData(ZmOperation.KEY_ID);

	var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);

	var newSd = op == ZmOperation.PAGE_BACK ? sd.getDate()-1 : sd.getDate()+1;
	var newEd = op == ZmOperation.PAGE_BACK ? ed.getDate()-1 : ed.getDate()+1;

	sd.setDate(newSd);
	ed.setDate(newEd);

	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);

	this._updateFreeBusy();

	// finally, update the appt tab view page w/ new date(s)
	this._editView.updateDateField(this._startDateField.value, this._endDateField.value);
};

ZmSchedTabViewPage.prototype._timeChangeListener =
function(ev) {
	this._activeDateField = ZmTimeSelect.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect,
														this._startDateField, this._endDateField);
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
	this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);
	this._outlineAppt(this._dateInfo);
	this._editView.updateTimeField(this._dateInfo);
};

ZmSchedTabViewPage.prototype._timezoneListener =
function(ev) {
    ZmApptViewHelper.getDateInfo(this, this._dateInfo);
    this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);
    this._outlineAppt(this._dateInfo);
    this._editView.updateTimezone(this._dateInfo);
    this._updateFreeBusy();
};

ZmSchedTabViewPage.prototype._selectChangeListener =
function(ev) {
	var select = ev._args.selectObj;
	if (!select) return;

	var svp = select.parent;
	var type = select.getValue();
	var sched = svp._schedTable[select._schedTableIdx];
	if (sched.attType == type) return;

	// reset row
	var input = sched.inputObj;
	input.setValue("", true);
	svp._clearColoredCells(sched);

	// if we wiped out an attendee, make sure it's reflected in master list
	if (sched.attendee) {
		this.parent.updateAttendees(sched.attendee, sched.attType, ZmApptComposeView.MODE_REMOVE);
		sched.attendee = null;
	}
	sched.attType = type;

	// reset autocomplete handler
	var inputEl = input.getInputElement();
	if (type == ZmCalItem.PERSON && svp._acContactsList) {
		svp._acContactsList.handle(inputEl);
	} else if (type == ZmCalItem.LOCATION && svp._acLocationsList) {
		svp._acLocationsList.handle(inputEl);
	} else if (type == ZmCalItem.EQUIPMENT && svp._acEquipmentList) {
		svp._acEquipmentList.handle(inputEl);
	}
};

ZmSchedTabViewPage.prototype._colorSchedule =
function(status, slots, table, sched) {
	var row = table.rows[0];
	var className = this._getClassForStatus(status);

	if (row && className) {
		// figure out the table cell that needs to be colored
		for (var i = 0; i < slots.length; i++) {
			var startIdx = this._getIndexFromTime(slots[i].s);
			var endIdx = this._getIndexFromTime(slots[i].e, true);

			// normalize
			if (endIdx < startIdx) {
				endIdx = ZmSchedTabViewPage.FREEBUSY_NUM_CELLS - 1;
			}

			for (j = startIdx; j <= endIdx; j++) {
				if (row.cells[j]) {
					if (status != ZmSchedTabViewPage.STATUS_UNKNOWN) {
						this._allAttendees[j] = this._allAttendees[j] + 1;
					}
					sched._coloredCells.push(row.cells[j]);
					row.cells[j].className = className;
				}
			}
		}
	}
};

/*
* Draws a dark border for the appt's start and end times.
*
* @param index		[object]		start and end indexes
*/
ZmSchedTabViewPage.prototype._outlineAppt =
function(dateInfo) {
	this._updateBorders(this._allAttendeesSlot, true);
	for (var j = 1; j < this._schedTable.length; j++) {
		this._updateBorders(this._schedTable[j]);
	}
};

/*
* Outlines the times of the current appt for the given row.
*
* @param sched			[sched]			info for this row
* @param isAllAttendees	[boolean]*		if true, this is the All Attendees row
*/
ZmSchedTabViewPage.prototype._updateBorders =
function(sched, isAllAttendees) {
	if (!sched) return;

	var div, curClass, newClass;

	// if start time is midnight, mark right border of attendee div
	div = document.getElementById(sched.dwtNameId);
	if (div) {
		curClass = div.className;
		newClass = (this._dateBorder.start == -1)
			? "ZmSchedulerNameTdBorder"
			: "ZmSchedulerNameTd";
		if (curClass != newClass) {
			div.className = newClass;
		}
	}

	// mark right borders of appropriate f/b table cells
	var normalClassName = "ZmSchedulerGridDiv",
		halfHourClassName = normalClassName + "-halfHour",
		startClassName = normalClassName + "-start",
		endClassName = normalClassName + "-end"


	var table = document.getElementById(sched.dwtTableId);
	var row = table.rows[0];
	if (row) {
		for (var i = 0; i < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; i++) {
			var td = row.cells[i];
			div = td ? td.getElementsByTagName("*")[0] : null;
			if (div) {
				curClass = div.className;
				newClass = normalClassName;
				if (i == this._dateBorder.start) {
					newClass = startClassName;
				} else if (i == this._dateBorder.end) {
					newClass = endClassName;
				} else if (i % 2 == 0) {
					newClass = halfHourClassName;
				}
				if (curClass != newClass) {
					div.className = newClass;
				}
			}
		}
	}
};

/*
* Calculate index of the cell that covers the given time. A start time on a half-hour border
* covers the corresponding time block, whereas an end time does not. For example, an appt with
* a start time of 5:00 causes the 5:00 - 5:30 block to be marked. The end time of 5:30 does not
* cause the 5:30 - 6:00 block to be marked.
*
* @param time	[Date or int]		time
* @param isEnd	[boolean]*			if true, this is an appt end time
* @param adjust [boolean]           (Optional) Specify whether the time should
*                                   be adjusted based on timezone selector. If
*                                   not specified, assumed to be true.
*/
ZmSchedTabViewPage.prototype._getIndexFromTime =
function(time, isEnd, adjust) {
	var d = (time instanceof Date) ? time : new Date(time);
    var hourmin = d.getHours() * 60 + d.getMinutes();
    adjust = adjust != null ? adjust : true;
    if (adjust && this._dateInfo.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT)) {
        var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, d);
        var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(this._dateInfo.timezone), d);
        hourmin += offset2 - offset1;
    }
	var idx = Math.floor(hourmin / 60) * 2;
	var minutes = hourmin % 60;
	if (minutes >= 30) {
		idx++;
	}
	// end times don't mark blocks on half-hour boundary
	if (isEnd && (minutes == 0 || minutes == 30)) {
		//block even if it exceeds 1 second
		var s = d.getSeconds();
		if(s == 0){
		idx--;
		}
	}

	return idx;
};

ZmSchedTabViewPage.prototype._getBordersFromDateInfo =
function(dateInfo) {
	var index = {start: -99, end: -99};
	if (dateInfo.showTime) {
		var idx = AjxDateUtil.isLocale24Hour() ? 0 : 1;
		var startDate = ZmTimeSelect.getDateFromFields(dateInfo.startHourIdx + idx, dateInfo.startMinuteIdx * 5,
													   dateInfo.startAmPmIdx,
													   AjxDateUtil.simpleParseDateStr(dateInfo.startDate));
		var endDate = ZmTimeSelect.getDateFromFields(dateInfo.endHourIdx + idx, dateInfo.endMinuteIdx * 5,
													 dateInfo.endAmPmIdx,
													 AjxDateUtil.simpleParseDateStr(dateInfo.endDate));
		// subtract 1 from index since we're marking right borders
		index.start = this._getIndexFromTime(startDate, null, false) - 1;
		index.end = this._getIndexFromTime(endDate, true, false);
	}
	return index;
};

ZmSchedTabViewPage.prototype._getClassForStatus =
function(status) {
	return ZmSchedTabViewPage.STATUS_CLASSES[status];
};

ZmSchedTabViewPage.prototype._getClassForParticipationStatus =
function(status) {
	return ZmSchedTabViewPage.PSTATUS_CLASSES[status];
};

// Callbacks

ZmSchedTabViewPage.prototype._handleResponseFreeBusy =
function(result) {
	var args = result.getResponse().GetFreeBusyResponse.usr;

	for (var i = 0; i < args.length; i++) {
		var usr = args[i];

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._emailToIdx[usr.id]];
		var table = sched ? document.getElementById(sched.dwtTableId) : null;
		if (table) {
			table.rows[0].className = "ZmSchedulerNormalRow";

			this._clearColoredCells(sched);
			sched.uid = usr.id;

			// next, for each free/busy status, color the row for given start/end times
			if (usr.n) this._colorSchedule(ZmSchedTabViewPage.STATUS_UNKNOWN, usr.n, table, sched);
			if (usr.t) this._colorSchedule(ZmSchedTabViewPage.STATUS_TENTATIVE, usr.t, table, sched);
			if (usr.b) this._colorSchedule(ZmSchedTabViewPage.STATUS_BUSY, usr.b, table, sched);
			if (usr.u) this._colorSchedule(ZmSchedTabViewPage.STATUS_OUT, usr.u, table, sched);
		}
	}
	this._colorAllAttendees();
};

ZmSchedTabViewPage.prototype._emailValidator =
function(value) {
	var str = AjxStringUtil.trim(value);
	if (str.length > 0 && !AjxEmailAddress.isValid(value)) {
		throw ZmMsg.errorInvalidEmail;
	}

	return value;
};

ZmSchedTabViewPage.prototype._getDefaultFocusItem =
function() {
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (sched && sched.inputObj && !sched.inputObj.disabled) {
			return sched.inputObj;
		}
	}
	return null;
};


// Static methods

ZmSchedTabViewPage._onClick =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	// figure out which object was clicked
	if (el.id == svp._allDayCheckboxId) {
        ZmApptViewHelper.getDateInfo(svp, svp._dateInfo);
		svp._showTimeFields(!el.checked);
		svp._editView.updateAllDayField(el.checked);
        svp._dateBorder = svp._getBordersFromDateInfo(svp._dateInfo);
		svp._outlineAppt();
	} else if (el.id == svp._startDateFieldId || el.id == svp._endDateFieldId) {
		svp._activeDateField = el;
	}
};

ZmSchedTabViewPage._onFocus =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		svp._activeInputIdx = el._schedTableIdx;
	}
};

ZmSchedTabViewPage._onBlur =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	if (el.id == svp._startDateFieldId || el.id == svp._endDateFieldId) {
		svp._handleDateChange(el == svp._startDateField);
		svp._activeDateField = null;
	} else {
		svp._handleAttendeeField(el);
	}
};

ZmSchedTabViewPage._onPTSTMouseOver = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.setContent(el._ptstLabel, true);
		tooltip.popup((ev.pageX || ev.clientX), (ev.pageY || ev.clientY), true);
	}
};


ZmSchedTabViewPage._onPTSTMouseOut = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	var sched = svp._schedTable[el._schedTableIdx];
	if (sched) {		
		var shell = DwtShell.getShell(window);
		var tooltip = shell.getToolTip();
		tooltip.popdown();
	}
};