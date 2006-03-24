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
* @param acContactsList		[ZmAutocompleteListView]	autocomplete for attendees
* @param acResourcesList	[ZmAutocompleteListView]	autocomplete for locations/resources
*/
function ZmSchedTabViewPage(parent, appCtxt, attendees, controller, acContactsList, acResourcesList) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this._attendees = attendees;
	this._controller = controller;
	this._acContactsList = acContactsList;
	this._acResourcesList = acResourcesList;

	this._apptTab = parent.getTabPage(ZmApptComposeView.TAB_APPOINTMENT);

	this.setScrollStyle(Dwt.SCROLL);
	this._rendered = false;
	this._emailToIdx = {};
	this._schedTable = [];
	this._allAttendees = [];
	this._allAttendeeSlot = null;
	
	this._fbCallback = new AjxCallback(this, this._handleResponseFreeBusy);
};

ZmSchedTabViewPage.prototype = new DwtTabViewPage;
ZmSchedTabViewPage.prototype.constructor = ZmSchedTabViewPage;


// Consts

ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES	= 12;
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
	if (!this._rendered) {
		this._initialize();
	}

	this.parent.tabSwitched(this._tabKey);
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);

	// set the free/busy view with fresh data
	var dateInfo = ZmApptViewHelper.getDateInfo(this._apptTab);
	this.set(dateInfo, this._apptTab.getOrganizer(), this._attendees);
};

ZmSchedTabViewPage.prototype.tabBlur =
function() {
	if (this._activeInputField) {
		this._handleAttendeeField(this._activeInputField);
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
	this._outlineAppt();

	this._setAttendees(organizer, attendees);
};

ZmSchedTabViewPage.prototype.cleanup = 
function() {
	if (!this._rendered) return;

	// XXX: optimize later - cache objects instead of iterating DOM!
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];

		// set all visible input elements to invisible
		var inputEl = document.getElementById(sched.dwtInputId);
		// re-enable the first row (which is the "read-only" organizer row)
		if (i == 0)
			inputEl.disabled = false;
		this._cleanRow(inputEl, sched, true);
	}

	// cleanup all attendees row
	var allAttCells = this._allAttendeeSlot._coloredCells;
	while (allAttCells.length > 0) {
		allAttCells[0].style.backgroundColor = "";
		allAttCells.shift();
	}

	for (var i in this._emailToIdx)
		delete this._emailToIdx[i];

	this._resetAttendeeCount();
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
	this._createDwtObjects();
	this._cacheFields();
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

// XXX: refactor this code since ZmApptTabViewPage uses similar?
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
	html[i++] = ZmMsg.meetingStart;
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
	html[i++] = ZmMsg.meetingEnd;
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

	var html = [];
	var i = 0;

	html[i++] = "<table style='padding-left: 3px' border=0 cellpadding=0 cellspacing=0 width=100%>";
	html[i++] = "<colgroup>";
	html[i++] = "<col style='width:20px' />";
	html[i++] = "<col style='width:100%' />";
	html[i++] = "<col style='width:626px' />";
	html[i++] = "</colgroup>";
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
	
			html[i++] = "<td><div class='ZmSchedTabViewPageCell'>";
			html[i++] = hour;
			html[i++] = "</div></td><td><div class='ZmSchedTabViewPageCell'></div></td>";
		}
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	
	for (var j = 0; j < ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES; j++) {
		// store some meta data about this table row
		var attendee = {};
		var dwtId = attendee.dwtId = Dwt.getNextId();	// container for input
		attendee.dwtDivId = dwtId + "_DIV_";			// outer container
		attendee.dwtInputId = dwtId + "_INPUT_";		// input field
		attendee.dwtTableId = dwtId + "_TABLE_";		// f/b table
		attendee.dwtSelectId = dwtId + "_SELECT_";		// container for select menu
		attendee.idx = j;
		attendee._coloredCells = [];

		if (j == 0) {
			this._allAttendeeSlot = attendee;
		} else {
			this._schedTable.push(attendee);
		}

		html[i++] = "<tr>";
		if (j == 1) {
			html[i++] = "<td align='center'>";
			html[i++] = AjxImg.getImageHtml("Person");
			html[i++] = "</td>";
		} else if (j > 1) {
			html[i++] = "<td><div id='" + attendee.dwtSelectId + "'></div></td>";
		}
		html[i++] = "<td";
		html[i++] = (j == 0) ? " colspan=2>" : ">";
		html[i++] = "<table border=0 width=100% cellpadding=0 cellspacing=0 class='ZmSchedTabViewPageTable'><tr>";
		html[i++] = "<td";
		html[i++] = (j == ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES - 1 || j == 0) ? " style='border-bottom:1px solid #CCCCCC'>" : ">";
		html[i++] = "<div class='ZmSchedTabViewPageName' id='";
		html[i++] = attendee.dwtDivId;
		html[i++] = "'>";
		// make the first row the "All Attendees" row
		if (j == 0) {
			html[i++] = "<table border=0 bgcolor='#FFFFFF' cellpadding=0 cellspacing=0 width=100% height=100%><tr height=100%><td class='ZmSchedTabViewPageAll'>";
			html[i++] = ZmMsg.allAttendees;
			html[i++] = "</td></tr></table>";
		} else {
			html[i++] = "<div id='";
			html[i++] = attendee.dwtId;
			html[i++] = "'></div>";
			html[i++] = "&nbsp;&nbsp;";
			html[i++] = ZmMsg.clickHereToAddAttendee;
		}
		html[i++] = "</div></td>";
		html[i++] = "</tr></table>";
		html[i++] = "</td>";
		html[i++] = "<td";
		html[i++] = (j == ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES - 1 || j == 0) ? " style='border-bottom:1px solid #CCCCCC'>" : ">";
		html[i++] = "<table border=0 cellpadding=0 cellspacing=0 class='ZmSchedTabViewPageTable' id='";
		html[i++] = attendee.dwtTableId;
		html[i++] = "'><tr";
		html[i++] = (j == 0) ? " style='background-color:#FFFFFF'>" : ">";
		for (var k = 0; k < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; k++) {
			html[i++] = "<td><div class='ZmSchedTabViewPageGrid'></div></td>";
		}
		html[i++] = "</tr></table>";
		html[i++] = "</td></tr>";

		// add an empty row here to visually separate All Attendees
		if (j == 0) {
			html[i++] = "<tr><td style='height:5px'></td></tr>";
		}
	}
	html[i++] = "</table>";

	return html.join("");
};

ZmSchedTabViewPage.prototype._createDwtObjects = 
function() {
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);

	this._startTimeSelect = new ZmTimeSelect(this);
	this._startTimeSelect.reparentHtmlElement(this._startTimeSelectId);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	delete this._startTimeSelectId;

	this._endTimeSelect = new ZmTimeSelect(this);
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

	// create DwtInputField and DwtSelect for each attendee slot
	for (var i = 0; i < this._schedTable.length; i++) {
		var inputFieldId = this._schedTable[i].dwtId;
		var inputField = document.getElementById(inputFieldId);
		var dwtInputField;
		if (inputField) {
			dwtInputField = new DwtInputField({parent: this, type: DwtInputField.STRING, maxLen: 256});
			dwtInputField.setDisplay(Dwt.DISPLAY_INLINE);
			dwtInputField.reparentHtmlElement(inputFieldId);
			var inputEl = dwtInputField.getInputElement();
			inputEl.className = "ZmSchedTabViewPageInput";
			inputEl.id = this._schedTable[i].dwtInputId;
			inputEl._attType = ZmAppt.PERSON;
			inputEl._dwtObjId = AjxCore.assignId(dwtInputField);
		}
		var selectId = this._schedTable[i].dwtSelectId;
		var selectDiv = document.getElementById(selectId);
		if (selectDiv) {
			var select = new DwtSelect(this);
			select.addOption(new DwtSelectOption(ZmAppt.PERSON, true, null, null, null, "Person"));
			select.addOption(new DwtSelectOption(ZmAppt.LOCATION, false, null, null, null, "Location"));
			select.addOption(new DwtSelectOption(ZmAppt.RESOURCE, false, null, null, null, "Resource"));
			select.reparentHtmlElement(selectId);
			select.addChangeListener(this._selectChangeListener);
			this._schedTable[i].selectObjId = AjxCore.assignId(select);
			if (inputField) {
				select.dwtInputField = dwtInputField;
			}
		}
	}
};

ZmSchedTabViewPage.prototype._cacheFields = 
function() {
	this._startDateField 	= document.getElementById(this._startDateFieldId); 	delete this._startDateFieldId;
	this._endDateField 		= document.getElementById(this._endDateFieldId);	delete this._endDateFieldId;
	this._allDayCheckbox 	= document.getElementById(this._allDayCheckboxId);
	this._allAttendeesTable = document.getElementById(this._allAttendeeSlot.dwtTableId); 
};

ZmSchedTabViewPage.prototype._addEventHandlers = 
function() {
	var svpId = AjxCore.assignId(this);

	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
	this._allDayCheckbox._schedViewPageId = svpId;

	// add onchange handlers to the start/end date fields
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmSchedTabViewPage._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmSchedTabViewPage._onChange);
	this._startDateField._schedViewPageId = this._endDateField._schedViewPageId = svpId;

	this._selectChangeListener = new AjxListener(this, this._selectChangeListener);
	for (var i = 0; i < this._schedTable.length; i++) {
		// we use onClick in containing DIV to determine whether we got focus, since
		// input starts out disabled
		var attendeeDiv = document.getElementById(this._schedTable[i].dwtDivId);
		if (attendeeDiv) {
			Dwt.setHandler(attendeeDiv, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
			attendeeDiv._schedViewPageId = svpId;
		}
		var attendeeInput = document.getElementById(this._schedTable[i].dwtInputId);
		if (attendeeInput) {
			// handle focus moving to/from an enabled input
			Dwt.setHandler(attendeeInput, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
			Dwt.setHandler(attendeeInput, DwtEvent.ONBLUR, ZmSchedTabViewPage._onBlur);
			attendeeInput._schedViewPageId = svpId;
			attendeeInput._schedTableIdx = i;
			// default to person-based autocomplete handling
			if (this._acContactsList) {
				this._acContactsList.handle(attendeeInput);
			}
		}
	}
};

ZmSchedTabViewPage.prototype._showTimeFields = 
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	if (this._supportTimeZones)
		Dwt.setVisibility(this._endTZoneSelect.getHtmlElement(), show);
	// also show/hide the "@" text
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement().parentNode.previousSibling, show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement().parentNode.previousSibling, show);
};

ZmSchedTabViewPage.prototype._showAttendeeField =
function(el) {
	if (el.tagName.toLowerCase() == "div") {
		var inputEl = el.firstChild.firstChild.firstChild; // yuck
		if (!inputEl.disabled) {
			Dwt.setVisible(inputEl, true);
			inputEl.focus();
		}
		this._activeInputField = inputEl;
	} else if (el.tagName.toLowerCase == "input") {
		this._activeInputField = el;
	}
};

/*
* Called by ONBLUR handler for attendee input field.
*/
ZmSchedTabViewPage.prototype._handleAttendeeField = 
function(inputEl) {
	var value = AjxStringUtil.trim(inputEl.value);
	var sched = this._schedTable[inputEl._schedTableIdx];
	var select = AjxCore.objectWithId(sched.selectObjId);
	var type = select.getValue();
	var attendee = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, value, type, true);

	if (attendee) {
		var email = attendee.getEmail();
		this._emailToIdx[email] = inputEl._schedTableIdx;
		// go get this attendee's free/busy info if we haven't already
		if (sched.uid != email) {
			this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), email, this._fbCallback);
		}
		this.parent.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
	} else {
		if (value) {
			this.parent.showErrorMessage(this.parent._badAttendeeMsg[type], null, this._badAttendeeCallback, this, [inputEl, sched]);
		} else {
			this._cleanRow(inputEl, sched);
		}
	}
};

ZmSchedTabViewPage.prototype._badAttendeeCallback = 
function(inputEl, sched) {
	this._cleanRow(inputEl, sched);
	this.parent._msgDialog.popdown();
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
			this._allAttendeeSlot._coloredCells.push(row.cells[i]);
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
	var num = 0;
	emails.push(this._setAttendee(num++, organizer, ZmAppt.PERSON, true)); // add organizer first
	for (var t = 0; t < ZmApptComposeView.ATT_TYPES.length; t++) {
		var type = ZmApptComposeView.ATT_TYPES[t];
		var att = attendees[type].getArray();
		for (var i = 0; i < att.length; i++) {
			if (att[i]) {
				emails.push(this._setAttendee(num++, att[i], type, false));
			}
		}
	}

	if (emails.length > 0) {
		this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), emails.join(","), this._fbCallback);
	}
};

ZmSchedTabViewPage.prototype._setAttendee = 
function(i, attendee, type, isOrganizer) {
	var name = attendee.getFullName();
	var email = attendee.getEmail();
	var inputEl = document.getElementById(this._schedTable[i].dwtInputId);
	if (inputEl) {
		Dwt.setVisible(inputEl, true);
		inputEl.value = (type == ZmAppt.PERSON) ? email : name ? name : email;
	}
	var select = AjxCore.objectWithId(this._schedTable[i].selectObjId);
	if (select) {
		select.setSelectedValue(type);
	}
	this._emailToIdx[email] = i;

	if (isOrganizer) {
		inputEl.disabled = true;
	}
	
	return email;
};

/*
* Resets a row to its starting state. The input is cleared and removed, and
* the free/busy blocks are set back to their default color. Optionally, the
* select is set back to person.
*
* @param inputEl		[Element]		the input element
* @param sched			[object]		info for this row
* @param resetSelect	[boolean]*		if true, set select to PERSON
*/
ZmSchedTabViewPage.prototype._cleanRow = 
function(inputEl, sched, resetSelect) {
	// clear input element value and make invisible
	inputEl.value = "";
	if (Dwt.getVisible(inputEl)) {
		Dwt.setVisible(inputEl, false);
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

	var allAttColors = this._allAttendeeSlot._coloredCells;
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
	var field = parentButton == this._startDateButton
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
	var dateInfo = ZmApptViewHelper.getDateInfo(this);
	this._outlineAppt(dateInfo);
	this._apptTab.updateTimeField(dateInfo);
};

ZmSchedTabViewPage.prototype._selectChangeListener = 
function(ev) {
	var select = ev._args.selectObj;
	if (!select) return;

	var type = select.getValue();
	var input = select.dwtInputField.getInputElement();
	if (input._attType == type) return;
	input._attType = type;

	// reset row
	var svp = select.parent;
	var sched = svp._schedTable[input._schedTableIdx];
	if (input.value) {
		input.value = "";
		svp._clearColoredCells(sched);
	}

	// reset autocomplete handler
	if (type == ZmAppt.PERSON && svp._acContactsList) {
		svp._acContactsList.handle(input);
	} else if (svp._acResourcesList) {
		svp._acResourcesList.handle(input);
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
	dateInfo = dateInfo ? dateInfo : ZmApptViewHelper.getDateInfo(this);
	var index = this._getIndexesFromDateInfo(dateInfo);
	this._updateBorders(this._allAttendeesSlot, index);
	for (var j = 0; j < ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES; j++) {
		this._updateBorders(this._schedTable[j], index);
	}
};

/*
* The table borders outline the time of the current appt.
*
* @param sched		[sched]			IDs for this row
* @param index		[object]		start and end indexes
*/
ZmSchedTabViewPage.prototype._updateBorders =
function(sched, index) {
	if (!sched || !index) return;

	var div, curClass, newClass;

	// if start time is midnight, mark right border of attendee div
	div = document.getElementById(sched.dwtDivId);
	curClass = div.className;
	newClass = (index.start == -1) ? "ZmSchedTabViewPageNameMark" :
									 "ZmSchedTabViewPageName";
	if (curClass != newClass) {
		div.className = newClass;
	}
	
	// mark right borders of appropriate f/b table cells
	var table = document.getElementById(sched.dwtTableId);
	var row = table.rows[0];
	if (row) {
		for (var i = 0; i < ZmSchedTabViewPage.FREEBUSY_NUM_CELLS; i++) {
			var cell = row.cells[i];
			div = cell ? cell.firstChild : null;
			if (div) {
				curClass = div.className;
				newClass = (i == index.start || i == index.end) ? "ZmSchedTabViewPageGridMark" :
																  "ZmSchedTabViewPageGrid";
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

ZmSchedTabViewPage.prototype._getIndexesFromDateInfo = 
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
		DBG.println("****** index is " + index.start + " for " + startDate.toString());
		DBG.println("****** index is " + index.end + " for " + endDate.toString());
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
	// figure out which object was clicked
	if (el.id == svp._allDayCheckboxId) {
		svp._showTimeFields(el.checked ? false : true);
		svp._apptTab.updateAllDayField(el.checked);
		svp._outlineAppt();
	} else {
		// looks like user clicked on attendee field
		svp._showAttendeeField(el);
	}
};

ZmSchedTabViewPage._onBlur = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	svp._handleAttendeeField(el);
	svp._activeInputField = null;
};

ZmSchedTabViewPage._onChange = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = AjxCore.objectWithId(el._schedViewPageId);
	svp._handleDateChange(el == svp._startDateField);
};
