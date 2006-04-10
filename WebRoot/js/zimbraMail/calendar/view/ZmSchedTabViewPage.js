/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a new tab view for scheduling appointment attendees.
* @constructor
* @class
* This class displays free/busy information for an appointment's attendees. An
* attendee may be a person, a location, or a resource.
*
* @author Parag Shah
*
* @param parent				[ZmApptComposeView]			the appt compose view
* @param appCtxt 			[ZmAppCtxt]					app context
* @param attendees			[hash]						attendees/locations/resources
* @param controller			[ZmApptComposeController]	the appt compose controller
*/
function ZmSchedTabViewPage(parent, appCtxt, attendees, controller) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this._attendees = attendees;
	this._controller = controller;

	this._apptTab = parent.getTabPage(ZmApptComposeView.TAB_APPOINTMENT);

	this.setScrollStyle(Dwt.SCROLL);
	this._rendered = false;
	this._emailToIdx = {};
	this._schedTable = [];
	this._allAttendees = [];
	this._allAttendeesSlot = null;

	this._attTypes = [ZmAppt.PERSON];
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._attTypes.push(ZmAppt.LOCATION);
		this._attTypes.push(ZmAppt.RESOURCE);
	}

	this._fbCallback = new AjxCallback(this, this._handleResponseFreeBusy);
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

// Public methods

ZmSchedTabViewPage.prototype.toString = 
function() {
	return "ZmSchedTabViewPage";
};

ZmSchedTabViewPage.prototype.showMe = 
function() {
	if (!this._dateInfo) {
		this._dateInfo = ZmApptViewHelper.getDateInfo(this._apptTab);
		this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);
	}

	if (!this._rendered) {
		this._initialize();
	}

	this.parent.tabSwitched(this._tabKey);
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);

	this.set(this._dateInfo, this._apptTab.getOrganizer(), this._attendees);
};

ZmSchedTabViewPage.prototype.tabBlur =
function() {
	if (this._activeInputIdx != null) {
		var inputEl = this._schedTable[this._activeInputIdx].inputObj.getInputElement();
		this._handleAttendeeField(inputEl);
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

	this._setAttendees(organizer, attendees);
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
		allAttCells[0].style.backgroundColor = "";
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
	if (this._acResourcesList) {
		this._acResourcesList.reset();
		this._acResourcesList.show(false);
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

ZmSchedTabViewPage.prototype.enableInputs = 
function() {
	// TODO
	DBG.println("TODO: enable inputs for schedule tab view");
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

	var html = [];
	var i = 0;

	html[i++] = "<table border=0 width=100%><tr><td>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</td><td class='ZmSchedTabViewPageKey'>";
	html[i++] = this._getKeyHtml();
	html[i++] = "</td></tr></table>";
	html[i++] = "<div style='margin-top:10'>";
	html[i++] = this._getFreeBusyHtml();
	html[i++] = "</div>";

	this.getHtmlElement().innerHTML = html.join("");
};

ZmSchedTabViewPage.prototype._getTimeHtml = 
function() {
	var html = [];
	var i = 0;

	this._startDateFieldId 		= Dwt.getNextId();
	this._startMiniCalBtnId 	= Dwt.getNextId();
	this._startTimeSelectId 	= Dwt.getNextId();
	this._allDayCheckboxId 		= Dwt.getNextId();
	this._endDateFieldId 		= Dwt.getNextId();
	this._endMiniCalBtnId 		= Dwt.getNextId();
	this._endTimeSelectId 		= Dwt.getNextId();

	var html = [];
	var i = 0;
	
	html[i++] = "<table border=0>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.startTime;
	html[i++] = "</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input autocomplete='off' style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._startDateFieldId;
	html[i++] = "' value=''></td><td id='";
	html[i++] = this._startMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td><td><input type='checkbox' id='";
	html[i++] = this._allDayCheckboxId;
	html[i++] = "'></td><td><nobr>";
	html[i++] = ZmMsg.allDayEvent;
	html[i++] = "</td><td width=100%></td></tr><tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.endTime;
	html[i++] = "</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input autocomplete='off' style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._endDateFieldId;
	html[i++] = "' value=''></td><td id='";
	html[i++] = this._endMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td></tr>";
	// XXX: note we're ignoring time zones for now
	html[i++] = "</table>";

	return html.join("");
};

ZmSchedTabViewPage.prototype._getKeyHtml = 
function() {
	var html = [];
	var i = 0;

	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 style='border:1px solid black'><tr>";
	html[i++] = "<td style='padding:3px; background-color:#CCCCCC; font-weight:bold'>";
	html[i++] = ZmMsg.key;
	html[i++] = "</td></tr><tr><td style='padding:3px; background-color:#FFFFFF'>";
	html[i++] = "<table border=0 cellpadding=3 cellspacing=3><tr>";
	html[i++] = "<td><div class='ZmSchedTabViewPageKeySquare' style='background-color:#FFFFFF'></div></td>";
	html[i++] = "<td class='nobreak'>";
	html[i++] = ZmMsg.free;
	html[i++] = "</td>"
	html[i++] = "<td><div class='ZmSchedTabViewPageKeySquare' style='background-color:#990000'></div></td>";
	html[i++] = "<td class='nobreak'>";
	html[i++] = ZmMsg.busy;
	html[i++] = "</td>"
	html[i++] = "<td>&nbsp;</td>";
	html[i++] = "<td>&nbsp;</td>";
	html[i++] = "</tr><tr>";
	html[i++] = "<td><div class='ZmSchedTabViewPageKeySquare' style='background-color:#FFCC00'></div></td>";
	html[i++] = "<td class='nobreak'>";
	html[i++] = ZmMsg.outOfOffice;
	html[i++] = "</td>"
	html[i++] = "<td><div class='ZmSchedTabViewPageKeySquare' style='background-color:#FF3300'></div></td>";
	html[i++] = "<td class='nobreak'>";
	html[i++] = ZmMsg.tentative;
	html[i++] = "</td>"
	html[i++] = "<td><div class='ZmSchedTabViewPageKeySquare' style='background-color:#FFF5CC'></div></td>";
	html[i++] = "<td class='nobreak'>";
	html[i++] = ZmMsg.unknown;
	html[i++] = "</td>"
	html[i++] = "</tr>";
	html[i++] = "</table>";
	html[i++] = "</td></tr></table>";
	
	return html.join("");	
};

ZmSchedTabViewPage.prototype._getFreeBusyHtml =
function() {

	this._navToolbarId = Dwt.getNextId();
	this._attendeesTableId = Dwt.getNextId();
	this._schedTable[0] = null;	// header row has no attendee data

	var html = [];
	var i = 0;

	html[i++] = "<table style='padding-left: 3px' border=0 cellpadding=0 cellspacing=0 width=100% id='";
	html[i++] = this._attendeesTableId;
	html[i++] = "'>";
	html[i++] = "<colgroup>";
	html[i++] = "<col style='width:";
	html[i++] = AjxEnv.isIE ? 34 : 42;
	html[i++] = "px'";
	html[i++] = "<col style='width:165px' />";
	html[i++] = "<col style='width:626px' />";
	html[i++] = "</colgroup>";
	
	// header row
	html[i++] = "<tr>";
	html[i++] = "<td colspan=2 id='";
	html[i++] = this._navToolbarId;
	html[i++] = AjxEnv.isIE ? "' width=100%>" : "'>";
	html[i++] = "</td>";
	html[i++] = "<td>";
	
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	for (var j = 0; j < 2; j++) {
		for (var k = 12; k < 24; k++) {
			var hour = k - 12;
			if (hour == 0) hour = 12;
			html[i++] = "<td><div class='ZmSchedTabViewPageGridHeaderCell'>";
			html[i++] = hour;
			html[i++] = "</div></td><td><div class='ZmSchedTabViewPageGridHeaderCell'></div></td>";
		}
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	
	html[i++] = "</table>";

	return html.join("");
};

ZmSchedTabViewPage.prototype._initAutocomplete =
function() {
	var shell = this._appCtxt.getShell();
	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	var keyUpCallback = new AjxCallback(this, this._autocompleteKeyUpCallback);

	// autocomplete for attendees
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactsClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactsLoader = contactsClass.getContactList;
		var params = {parent: shell, dataClass: contactsClass, dataLoader: contactsLoader,
					  matchValue: ZmContactList.AC_VALUE_NAME, keyUpCallback: keyUpCallback, compCallback: acCallback};
		this._acContactsList = new ZmAutocompleteListView(params);
	}
	// autocomplete for locations/resources
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var resourcesClass = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
		var resourcesLoader = resourcesClass.getResources;
		var params = {parent: shell, dataClass: resourcesClass, dataLoader: resourcesLoader,
					  matchValue: ZmContactList.AC_VALUE_NAME, keyUpCallback: keyUpCallback, compCallback: acCallback};
		this._acResourcesList = new ZmAutocompleteListView(params);
	}
};

// Add the attendee, then create a new empty slot since we've now filled one.
ZmSchedTabViewPage.prototype._autocompleteCallback =
function(text, el, match) {
	this._handleAttendeeField(el, match.data._item);
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

ZmSchedTabViewPage.prototype._addAttendeeRow =
function(isAllAttendees, isOrganizer, index) {
	index = index ? index : this._attendeesTable.rows.length;
	
	// store some meta data about this table row
	var sched = {};
	var dwtId = Dwt.getNextId();	// container for input
	sched.dwtNameId = dwtId + "_NAME_";			// TD that contains name
	sched.dwtTableId = dwtId + "_TABLE_";		// TABLE with free/busy cells
	sched.dwtSelectId = dwtId + "_SELECT_";		// TD that contains select menu
	sched.dwtInputId = dwtId + "_INPUT_";		// input field
	sched.idx = index;
	sched._coloredCells = [];
	this._schedTable[index] = sched;

	var tr = this._attendeesTable.insertRow(index);

	var td = tr.insertCell(-1);
	if (isAllAttendees) {
		td.colSpan = 2;
		td.className = 'ZmSchedTabViewPageAllTd';
		td.innerHTML = ZmMsg.allAttendees;
	} else  if (isOrganizer) {
		td.align = 'center';
		td.className = 'ZmSchedTabViewPageOrgIconTd';
		td.innerHTML = AjxImg.getImageHtml("Person");
	} else {
		td.id = sched.dwtSelectId;
	}
	
	if (!isAllAttendees) {
		td = tr.insertCell(-1);
		td.className = "ZmSchedTabViewPageNameTd";
		td.id = sched.dwtNameId;
	}
	
	var html = [];
	var i = 0;
	td = tr.insertCell(-1);
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 class='ZmSchedTabViewPageTable' id='";
	html[i++] = sched.dwtTableId;
	html[i++] = "'><tr";
	html[i++] = isAllAttendees ? " style='background-color:#FFFFFF'>" : ">";
	for (var k = 0; k < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; k++) {
		html[i++] = "<td><div class='";
		html[i++] = isAllAttendees ? "ZmSchedTabViewPageGridTopCell" : "ZmSchedTabViewPageGridCell";
		html[i++] = "'></div></td>";
	}
	html[i++] = "</tr></table>";
	td.innerHTML = html.join("");	
	
	// create DwtInputField and DwtSelect for the attendee slot
	if (!isAllAttendees) {
		var select;
		if (!isOrganizer) {
			var selectId = sched.dwtSelectId;
			var selectDiv = document.getElementById(selectId);
			if (selectDiv) {
				select = new DwtSelect(this);
				select.addOption(new DwtSelectOption(ZmAppt.PERSON, true, null, null, null, "Person"));
				select.addOption(new DwtSelectOption(ZmAppt.LOCATION, false, null, null, null, "Location"));
				select.addOption(new DwtSelectOption(ZmAppt.RESOURCE, false, null, null, null, "Resource"));
				select.reparentHtmlElement(selectId);
				select.addChangeListener(this._selectChangeListener);
				select._schedTableIdx = index;
				sched.selectObj = select;
			}
		}
		var nameDiv = document.getElementById(sched.dwtNameId);
		var dwtInputField;
		if (nameDiv) {
			dwtInputField = new DwtInputField({parent: this, type: DwtInputField.STRING, maxLen: 256});
			dwtInputField.setDisplay(Dwt.DISPLAY_INLINE);
			var inputEl = dwtInputField.getInputElement();
			inputEl.className = "ZmSchedTabViewPageInput";
			inputEl.id = sched.dwtInputId;
			sched.attType = inputEl._attType = ZmAppt.PERSON;
			sched.inputObj = dwtInputField;
			if (select) {
				select.dwtInputField = dwtInputField;
			}
			dwtInputField.reparentHtmlElement(sched.dwtNameId);
		}
	}

	if (!isAllAttendees && !isOrganizer) {
		var attendeeInput = document.getElementById(sched.dwtInputId);
		if (attendeeInput) {
			this._activeInputIdx = null;
			attendeeInput.focus();
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

	this._updateBorders(sched, isAllAttendees);

	return index;
};

ZmSchedTabViewPage.prototype._removeAttendeeRow =
function(index) {
	this._attendeesTable.deleteRow(index);
	this._schedTable.splice(index, 1);
};

ZmSchedTabViewPage.prototype._createDwtObjects = 
function() {
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

	this._startDateButton = ZmApptViewHelper.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmApptViewHelper.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener);
	
	var navBarListener = new AjxListener(this, this._navBarListener);
	this._navToolbar = new ZmNavToolBar(this, DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
	this._navToolbar._textButton.getHtmlElement().className = "ZmSchedTabViewPageDate";
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
	this._attendeesTable	= document.getElementById(this._attendeesTableId);
	this._allAttendeesIndex = this._addAttendeeRow(true, false);
	this._allAttendeesSlot = this._schedTable[this._allAttendeesIndex];
	this._allAttendeesTable = document.getElementById(this._allAttendeesSlot.dwtTableId);
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

	this._selectChangeListener = new AjxListener(this, this._selectChangeListener);
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (!sched || i == this._allAttendeesIndex || i == this._organizerIndex) continue;
	}
};

ZmSchedTabViewPage.prototype._showTimeFields = 
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	if (this._supportTimeZones) {
		Dwt.setVisibility(this._endTZoneSelect.getHtmlElement(), show);
	}
	// also show/hide the "@" text
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement().parentNode.previousSibling, show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement().parentNode.previousSibling, show);
};

/*
* Called by ONBLUR handler for attendee input field.
*/
ZmSchedTabViewPage.prototype._handleAttendeeField = 
function(inputEl, attendee) {

	var idx = inputEl._schedTableIdx;
	if (idx != this._activeInputIdx) return;

	var sched = this._schedTable[idx];
	var input = sched.inputObj;
	var value = AjxStringUtil.trim(input.getValue());
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
		attendee = attendee ? attendee : ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, value, type, true);
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
				this._addAttendeeRow(false, false); // add new empty slot
			}
		} else {
			this._activeInputIdx = null;
			var msg = AjxMessageFormat.format(this.parent._badAttendeeMsg[type], value);
			this.parent.showErrorMessage(msg, null, this._badAttendeeCallback, this, [idx, sched]);
		}
	} else if (curAttendee) {
		// user erased an attendee
		this._resetRow(sched, false, type);
		this._removeAttendeeRow(idx);
	}
};

ZmSchedTabViewPage.prototype._setAttendeeToolTip = 
function(sched, attendee, type) {
	if (type != ZmAppt.PERSON) return;

	var name = attendee.getFullName();
	var email = attendee.getEmail();
	if (name && email) {
		sched.inputObj.setToolTipContent(email);
	}
};

ZmSchedTabViewPage.prototype._badAttendeeCallback = 
function(index, sched) {
	this.parent._msgDialog.popdown();
	this._activeInputIdx = null;
	if (sched && sched.attendee) {	
		this._removeAttendeeRow(index);
	} else {
		this._resetRow(sched, false, sched.attType, true);
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
			row.cells[i].style.backgroundColor = this._getColorForStatus(ZmSchedTabViewPage.STATUS_BUSY);
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
	if (this._origAttendees) {
		this.cleanup();
	}
	this._origAttendees = attendees;

	var emails = [];
	this._organizerIndex = this._addAttendeeRow(false, true); // create a slot for the organizer
	emails.push(this._setAttendee(this._organizerIndex, organizer, ZmAppt.PERSON, true));
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		var att = attendees[type].getArray();
		for (var i = 0; i < att.length; i++) {
			if (att[i]) {
				var index = this._addAttendeeRow(false, false); // create a slot for this attendee
				emails.push(this._setAttendee(index, att[i], type, false));
			}
		}
	}
	this._addAttendeeRow(false, false); // make sure there's always an empty slot

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
	}
	
	var select = sched.selectObj;
	if (select) {
		select.setSelectedValue(type);
	}
	var email = attendee.getEmail();
	this._emailToIdx[email] = index;

	if (input && isOrganizer) {
		input.disabled(true);
	}
	this._setAttendeeToolTip(sched, attendee, type);
	
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
		table.rows[0].style.backgroundColor = "#F4F4F4";
	}

	// remove the bgcolor from the cells that were colored
	this._clearColoredCells(sched);
	
	// reset the select to person
	if (resetSelect) {
		var select = AjxCore.objectWithId(sched.selectObjId);
		if (select) {
			select.setSelectedValue(ZmAppt.PERSON);
		}
	}

	sched.uid = null;
	this._activeInputIdx = null;
};

ZmSchedTabViewPage.prototype._clearColoredCells = 
function(sched) {
	while (sched._coloredCells.length > 0) {
		// decrement cell count in all attendees row
		var idx = sched._coloredCells[0].cellIndex;
		if (this._allAttendees[idx] > 0) {
			this._allAttendees[idx] = this._allAttendees[idx] - 1;
		}

		sched._coloredCells[0].style.backgroundColor = "";
		sched._coloredCells.shift();
	}

	var allAttColors = this._allAttendeesSlot._coloredCells;
	while (allAttColors.length > 0) {
		allAttColors[0].style.backgroundColor = "";
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
	var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.LONG);
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
	this._apptTab.updateDateField(this._startDateField.value, this._endDateField.value);
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
	this._apptTab.updateDateField(this._startDateField.value, this._endDateField.value);
};

ZmSchedTabViewPage.prototype._timeChangeListener =
function(ev) {
	this._activeDateField = ZmTimeSelect.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect,
														this._startDateField, this._endDateField);
	this._dateInfo = ZmApptViewHelper.getDateInfo(this);
	this._dateBorder = this._getBordersFromDateInfo(this._dateInfo);
	this._outlineAppt(this._dateInfo);
	this._apptTab.updateTimeField(this._dateInfo);
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
	if (type == ZmAppt.PERSON && svp._acContactsList) {
		svp._acContactsList.handle(inputEl);
	} else if (svp._acResourcesList) {
		svp._acResourcesList.handle(inputEl);
	}
};

ZmSchedTabViewPage.prototype._colorSchedule = 
function(status, slots, table, sched) {
	var row = table.rows[0];
	var bgcolor = this._getColorForStatus(status);

	if (row && bgcolor) {
		// figure out the table cell that needs to be colored
		for (var i = 0; i < slots.length; i++) {
			var startIdx = this._getIndexFromTime(slots[i].s);
			var endIdx = this._getIndexFromTime(slots[i].e);

			// normalize
			if (endIdx <= startIdx)
				endIdx = ZmSchedTabViewPage.FREEBUSY_NUM_CELLS;

			for (j = startIdx; j < endIdx; j++) {
				if (row.cells[j]) {
					if (status != ZmSchedTabViewPage.STATUS_UNKNOWN)
						this._allAttendees[j] = this._allAttendees[j] + 1;
					sched._coloredCells.push(row.cells[j]);
					row.cells[j].style.backgroundColor = bgcolor;
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
	this._updateBorders(this._allAttendeesSlot);
	for (var j = 1; j < this._schedTable.length; j++) {
		this._updateBorders(this._schedTable[j]);
	}
};

/*
* The table borders outline the time of the current appt.
*
* @param sched		[sched]			IDs for this row

*/
ZmSchedTabViewPage.prototype._updateBorders =
function(sched, isAllAttendees) {
	if (!sched) return;
	isAllAttendees = isAllAttendees || (sched == this._allAttendeesSlot);

	var div, curClass, newClass;

	// if start time is midnight, mark right border of attendee div
	div = document.getElementById(sched.dwtNameId);
	if (div) {
		curClass = div.className;
		newClass = (this._dateBorder.start == -1) ? "ZmSchedTabViewPageNameTdBorder" :
													"ZmSchedTabViewPageNameTd";
		if (curClass != newClass) {
			div.className = newClass;
		}
	}
	
	// mark right borders of appropriate f/b table cells
	var normalClass = isAllAttendees ? "ZmSchedTabViewPageGridTopCell" :
									   "ZmSchedTabViewPageGridCell";
	var borderClass = isAllAttendees ? "ZmSchedTabViewPageGridTopCellBorder" :
									   "ZmSchedTabViewPageGridCellBorder";
	var table = document.getElementById(sched.dwtTableId);
	var row = table.rows[0];
	if (row) {
		for (var i = 0; i < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; i++) {
			var td = row.cells[i];
			div = td ? td.firstChild : null;
			if (div) {
				curClass = div.className;
				newClass = (i == this._dateBorder.start || i == this._dateBorder.end) ? borderClass : normalClass;
				if (curClass != newClass) {
					div.className = newClass;
				}
			}
		}
	}
};

ZmSchedTabViewPage.prototype._getIndexFromTime = 
function(time, isStart) {
	var d = (time instanceof Date) ? time : new Date(time);
	var idx = d.getHours() * 2;
	if (d.getMinutes() >= 30) {
		idx++;
	}

	return idx;
};

ZmSchedTabViewPage.prototype._getBordersFromDateInfo = 
function(dateInfo) {
	var index = {start: -99, end: -99};
	if (dateInfo.showTime) {
		var startDate = ZmTimeSelect.getDateFromFields(dateInfo.startHourIdx + 1, dateInfo.startMinuteIdx * 5,
													   dateInfo.startAmPmIdx,
													   AjxDateUtil.simpleParseDateStr(dateInfo.startDate));
		var endDate = ZmTimeSelect.getDateFromFields(dateInfo.endHourIdx + 1, dateInfo.endMinuteIdx * 5,
													 dateInfo.endAmPmIdx,
													 AjxDateUtil.simpleParseDateStr(dateInfo.endDate));
		// subtract 1 from index since we're marking right borders
		index.start = this._getIndexFromTime(startDate) - 1;
		index.end = this._getIndexFromTime(endDate) - 1;
	}
	return index;
};

ZmSchedTabViewPage.prototype._getColorForStatus = 
function(status) {
	var bgcolor = null;
	switch (status) {
		case ZmSchedTabViewPage.STATUS_FREE: 		bgcolor = "#FFFFFF"; break;
		case ZmSchedTabViewPage.STATUS_BUSY: 		bgcolor = "#990000"; break;
		case ZmSchedTabViewPage.STATUS_TENTATIVE:	bgcolor = "#FF3300"; break;
		case ZmSchedTabViewPage.STATUS_OUT: 		bgcolor = "#FFCC00"; break;
		case ZmSchedTabViewPage.STATUS_UNKNOWN: 	bgcolor = "#FFF5CC"; break;
	}
	return bgcolor;
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
			table.rows[0].style.backgroundColor = "#FFFFFF";

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
	if (str.length > 0 && !ZmEmailAddress.isValid(value)) {
		throw ZmMsg.errorInvalidEmail;
	}

	return value;
};


// Static methods

ZmSchedTabViewPage._onClick = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	if (!svp) return;
	// figure out which object was clicked
	if (el.id == svp._allDayCheckboxId) {
		svp._showTimeFields(el.checked ? false : true);
		svp._apptTab.updateAllDayField(el.checked);
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
