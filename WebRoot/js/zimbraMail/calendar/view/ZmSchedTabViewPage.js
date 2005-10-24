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
 * The Original Code is: Zimbra Collaboration Suite.
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
* Creates a new tab view that can be used to overload DwtTabView base class methods
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
* @param appCtxt 		app context
*/
function ZmSchedTabViewPage(parent, appCtxt, apptTab, controller) {
	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this._apptTab = apptTab;
	this._controller = controller;

	this.setScrollStyle(Dwt.SCROLL);
	this._doc = this.getDocument();
	this._rendered = false;
	this._attendees = new Object();
	this._schedTable = new Array();
	this._allAttendees = new Array(48);
	this._allAttendeeSlot = null;

	this._fbCallback = new AjxCallback(this, this._fbResponseCallback);
};

ZmSchedTabViewPage.prototype = new DwtTabViewPage;
ZmSchedTabViewPage.prototype.constructor = ZmSchedTabViewPage;


// Consts

ZmSchedTabViewPage.FREEBUSY_ROW_HEIGHT = 25;
ZmSchedTabViewPage.FREEBUSY_ATTENDEE_WIDTH = 150;
ZmSchedTabViewPage.FREEBUSY_NEXTPREV_WIDTH = 21;
ZmSchedTabViewPage.FREEBUSY_INIT_ATTENDEES = 12;

ZmSchedTabViewPage.STATUS_FREE 			= 1;
ZmSchedTabViewPage.STATUS_BUSY 			= 2;
ZmSchedTabViewPage.STATUS_TENTATIVE 	= 3;
ZmSchedTabViewPage.STATUS_OUT 			= 4;
ZmSchedTabViewPage.STATUS_UNKNOWN 		= 5;


// Public methods

ZmSchedTabViewPage.prototype.toString = 
function() {
	return "ZmSchedTabViewPage";
};

ZmSchedTabViewPage.prototype.showMe = 
function() {
	this.setZIndex(DwtTabView.Z_ACTIVE_TAB); // XXX: is this necessary?

	if (!this._rendered)
		this._initialize();

	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);

	// set the free/busy view w/ fresh data
	this.set(this._apptTab.getDateInfo(), this._apptTab.getAttendees());

	this.parent.tabSwitched(this._tabKey);
};

ZmSchedTabViewPage.prototype.initialize = 
function(appt, mode) {
	this._appt = appt;
	this._mode = mode;
};

ZmSchedTabViewPage.prototype.set =
function(dateInfo, attendees) {
	this._startDateField.value = dateInfo.startDate;
	this._endDateField.value = dateInfo.endDate;
	if (dateInfo.startTime && dateInfo.endTime) {
		this._allDayCheckbox.checked = false;
		this._showTimeFields(true);
		this._startTimeSelect.setSelectedValue(dateInfo.startTime);
		this._endTimeSelect.setSelectedValue(dateInfo.endTime);
	} else {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);
	}

	this._resetFullDateField();

	// TODO - parse the attendees string and populate free busy attendees column
};

ZmSchedTabViewPage.prototype.cleanup = 
function() {
	if (!this._rendered) return;

	// XXX: optimize later - cache objects instead of iterating DOM!
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];

		// set all visible input elements to invisible
		var inputEl = Dwt.getDomObj(this._doc, sched.dwtInputId);
		this._cleanRow(inputEl, sched);
	}

	// cleanup all attendees row
	var allAttCells = this._allAttendeeSlot._coloredCells;
	while (allAttCells.length > 0) {
		allAttCells[0].style.backgroundColor = "";
		allAttCells.shift();
	}

	for (var i in this._attendees)
		delete this._attendees[i];

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
	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0><tr><td>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</td><td class='ZmSchedTabViewPageKey'>";
	html[i++] = AjxImg.getImageHtml("FreeBusyKey");
	html[i++] = "</td></tr></table><p>";
	html[i++] = this._getFreeBusyHtml();

	this.getHtmlElement().innerHTML = html.join("");
};

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._getTimeHtml = 
function() {
	var html = new Array();
	var i = 0;

	this._startDateFieldId 		= Dwt.getNextId();
	this._startMiniCalBtnId 	= Dwt.getNextId();
	this._startTimeSelectId 	= Dwt.getNextId();
	this._allDayCheckboxId 		= Dwt.getNextId();
	this._endDateFieldId 		= Dwt.getNextId();
	this._endMiniCalBtnId 		= Dwt.getNextId();
	this._endTimeSelectId 		= Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.meetingStart;
	html[i++] = "</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input style='height:22px;' type='text' size=11 maxlength=10 id='";
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
	html[i++] = "<input style='height:22px;' type='text' size=11 maxlength=10 id='";
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

ZmSchedTabViewPage.prototype._getFreeBusyHtml =
function() {
	this._fullDateFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 cellpadding=2 cellspacing=3 width=100%><tr><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 width=100%><tr>";
	html[i++] = "<td class='ZmSchedTabViewPageDate' id='";
	html[i++] = this._fullDateFieldId;
	html[i++] = "'";
	if (AjxEnv.isIE)
		html[i++] = " width=100%";
	html[i++] = "></td>";
	html[i++] = "<td width=626>";
	
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
		var attendee = new Object();
		var dwtId = Dwt.getNextId();
		attendee.dwtDivId = dwtId + "_DIV_";
		attendee.dwtInputId = dwtId + "_INPUT_";
		attendee.dwtTableId = dwtId + "_TABLE_";
		attendee.idx = j;
		attendee._coloredCells = new Array();

		if (j == 0) {
			this._allAttendeeSlot = attendee;
		} else {
			this._schedTable.push(attendee);
		}

		html[i++] = "<tr>";
		html[i++] = "<td><table border=0 width=100% cellpadding=0 cellspacing=0 class='ZmSchedTabViewPageTable'><tr>";
		html[i++] = "<td><div class='ZmSchedTabViewPageName' id='";
		html[i++] = attendee.dwtDivId;
		html[i++] = "'>";
		// make the first row the "All Attendees" row
		if (j == 0) {
			html[i++] = "<table border=0 bgcolor='#FFFFFF' cellpadding=0 cellspacing=0 width=100% height=100%><tr height=100%><td class='ZmSchedTabViewPageAll'>";
			html[i++] = ZmMsg.allAttendees;
			html[i++] = "</td></tr></table>";
		} else {
			html[i++] = "<input type='text' class='ZmSchedTabViewPageInput' maxlength=256 id='";
			html[i++] = attendee.dwtInputId;
			html[i++] = "'>";
		}
		html[i++] = "</div></td>";
		html[i++] = "</tr></table>";
		html[i++] = "</td>";
		html[i++] = "<td><table border=0 cellpadding=0 cellspacing=0 class='ZmSchedTabViewPageTable' id='";
		html[i++] = attendee.dwtTableId;
		html[i++] = "'><tr";
		html[i++] = j == 0 ? " style='background-color:#FFFFFF'>" : ">";
		for (var k = 0; k < 48; k++)
			html[i++] = "<td><div class='ZmSchedTabViewPageGrid'></div></td>";
		html[i++] = "</tr></table>";
		html[i++] = "</td></tr>";
	}
	html[i++] = "</table>";
	html[i++] = "</td></tr></table>";

	return html.join("");
};

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._createDwtObjects = 
function() {
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	// create selects for Time section
	this._startTimeSelect = new DwtSelect(this);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	var timeOptions = this._apptTab.getTimeOptionValues();
	if (timeOptions) {
		for (var i = 0; i < timeOptions.length; i++) {
			var option = timeOptions[i];
			this._startTimeSelect.addOption(option.label, option.selected, option.value);
		}
	}
	var startTimeCell = Dwt.getDomObj(this._doc, this._startTimeSelectId);
	if (startTimeCell)
		startTimeCell.appendChild(this._startTimeSelect.getHtmlElement());
	delete this._startTimeSelectId;

	this._endTimeSelect = new DwtSelect(this);
	this._endTimeSelect.addChangeListener(timeSelectListener);
	if (timeOptions) {
		for (var i = 0; i < timeOptions.length; i++) {
			var option = timeOptions[i];
			this._endTimeSelect.addOption(option.label, option.selected, option.value);
		}
	}
	var endTimeCell = Dwt.getDomObj(this._doc, this._endTimeSelectId);
	if (endTimeCell)
		endTimeCell.appendChild(this._endTimeSelect.getHtmlElement());
	delete this._endTimeSelectId;

	// create down arrow buttons for mini calendar
	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	this._startDateButton = new DwtButton(this);
	this._startDateButton.setImage("SelectPullDownArrow");
	this._startDateButton.addSelectionListener(dateButtonListener);
	this._startDateButton.setSize(20, 20);
	// reparent
	var startButtonCell = Dwt.getDomObj(this._doc, this._startMiniCalBtnId);
	if (startButtonCell)
		startButtonCell.appendChild(this._startDateButton.getHtmlElement());
	delete this._startMiniCalBtnId;
	
	this._endDateButton = new DwtButton(this);
	this._endDateButton.setImage("SelectPullDownArrow");
	this._endDateButton.addSelectionListener(dateButtonListener);
	this._endDateButton.setSize(20, 20);
	// reparent
	var endButtonCell = Dwt.getDomObj(this._doc, this._endMiniCalBtnId);
	if (endButtonCell)
		endButtonCell.appendChild(this._endDateButton.getHtmlElement());
	delete this._endMiniCalBtnId;
};

ZmSchedTabViewPage.prototype._cacheFields = 
function() {
	this._startDateField 	= Dwt.getDomObj(this._doc, this._startDateFieldId); delete this._startDateFieldId;
	this._endDateField 		= Dwt.getDomObj(this._doc, this._endDateFieldId);	delete this._endDateFieldId;
	this._allDayCheckbox 	= Dwt.getDomObj(this._doc, this._allDayCheckboxId);
	this._fullDateField  	= Dwt.getDomObj(this._doc, this._fullDateFieldId); 	delete this._fullDateFieldId;
	this._allAttendeesTable = Dwt.getDomObj(this._doc, this._allAttendeeSlot.dwtTableId); 
};

ZmSchedTabViewPage.prototype._addEventHandlers = 
function() {
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
	this._allDayCheckbox._schedViewPage = this; // XXX: this may cause mem leaks?

	for (var i = 0; i < this._schedTable.length; i++) {
		var attendeeDiv = Dwt.getDomObj(this._doc, this._schedTable[i].dwtDivId);
		if (attendeeDiv) {
			Dwt.setHandler(attendeeDiv, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
			attendeeDiv._schedViewPage = this;
		}
		var attendeeInput = Dwt.getDomObj(this._doc, this._schedTable[i].dwtInputId);
		if (attendeeInput) {
			Dwt.setHandler(attendeeInput, DwtEvent.ONCLICK, ZmSchedTabViewPage._onClick);
			Dwt.setHandler(attendeeInput, DwtEvent.ONBLUR, ZmSchedTabViewPage._onBlur);
			attendeeInput._schedViewPage = this;
			attendeeInput._schedTableIdx = i;
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
		Dwt.setVisible(el.firstChild, true);
		el.firstChild.focus();
	}
};

ZmSchedTabViewPage.prototype._handleAttendeeField = 
function(inputEl) {
	var email = AjxStringUtil.trim(inputEl.value);
	var sched = this._schedTable[inputEl._schedTableIdx];

	if (email && email.length > 0) {
		this._attendees[email] = inputEl._schedTableIdx;
		// go get this attendee's free/busy info if we havent already
		if (sched.uid != email)
			this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), email, this._fbCallback);
	} else {
		this._cleanRow(inputEl, sched);
	}
};

ZmSchedTabViewPage.prototype._getStartTime = 
function() {
	var sd = this._startDateField.value;
	if (!this._allDayCheckbox.checked)
		sd += " 12:00 AM";
	return ((new Date(sd)).getTime());
};

ZmSchedTabViewPage.prototype._getEndTime = 
function() {
	var ed = this._endDateField.value;
	if (!this._allDayCheckbox.checked)
		ed += " 11:59 PM";
	return ((new Date(ed)).getTime());
};

ZmSchedTabViewPage.prototype._colorAllAttendees =
function() {
	var row = this._allAttendeesTable.rows[0];

	for (var i = 0; i < this._allAttendees.length; i++) {
		if (this._allAttendees[i] > 0) {
			
			//this._coloredCells.push
		}
	}
};

ZmSchedTabViewPage.prototype._updateFreeBusy = 
function() {
	// update the full date field
	this._resetFullDateField();

	// clear the schedules for existing attendees
	var uids = new Array();
	for (var i = 0; i < this._schedTable.length; i++) {
		var sched = this._schedTable[i];
		if (sched.uid)
			uids.push(sched.uid);
	}

	if (uids.length) {
		var emails = uids.join(",");
		this._controller.getFreeBusyInfo(this._getStartTime(), this._getEndTime(), emails, this._fbCallback);
	}
};

ZmSchedTabViewPage.prototype._cleanRow = 
function(inputEl, sched) {
	// clear input element value and make invisible
	if (inputEl) {
		inputEl.value = "";
		if (Dwt.getVisible(inputEl))
			Dwt.setVisible(inputEl, false);
	}

	// reset the row color to non-white
	var table = Dwt.getDomObj(this.getDocument(), sched.dwtTableId);
	if (table)
		table.rows[0].style.backgroundColor = "#F4F4F4";

	// remove the bgcolor from the cells that were colored
	this._clearColoredCells(sched);

	sched.uid = null;
};

ZmSchedTabViewPage.prototype._clearColoredCells = 
function(sched) {
	while (sched._coloredCells.length > 0) {
		sched._coloredCells[0].style.backgroundColor = "";
		sched._coloredCells.shift();
	}
};

ZmSchedTabViewPage.prototype._resetAttendeeCount = 
function() {
	for (var i = 0; i < this._allAttendees.length; i++)
		this._allAttendees[i] = 0;
};

ZmSchedTabViewPage.prototype._resetFullDateField =
function() {
	// XXX: need i18n version!
	this._fullDateField.innerHTML = AjxDateUtil.getTimeStr((new Date(this._startDateField.value)), "%t %D, %Y");
};


// Listeners

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._dateButtonListener = 
function(ev) {
	// init new DwtCalendar if not already created
	if (!this._dateCalendar) {
		this._dateCalendar = new DwtCalendar(this.shell, null, DwtControl.ABSOLUTE_STYLE);

		this._dateCalendar.skipNotifyOnPage();
		this._dateCalendar.setSize("150");
		this._dateCalendar.setZIndex(Dwt.Z_VIEW);
		var calEl = this._dateCalendar.getHtmlElement();
		calEl.style.borderWidth = "2px";
		calEl.style.borderStyle = "solid";
		calEl.style.borderColor = "#B2B2B2 #000000 #000000 #B2B2B2";
		calEl.style.backgroundImage = "url(/zimbra/skins/steel/images/bg_pebble.gif)";

		this._dateCalendar.addSelectionListener(new AjxListener(this, this._dateCalSelectionListener));
		var workingWeek = [];
		var fdow = this._appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
		for (var i=0; i < 7; i++) {
			var d = (i+fdow)%7;
			workingWeek[i] = (d > 0 && d < 6);
		}
		this._dateCalendar.setWorkingWeek(workingWeek);
	} else {
		// only toggle display if user clicked on same button calendar is being shown for
		if (this._dateCalendar._currButton == ev.dwtObj)
			this._dateCalendar.setVisible(!this._dateCalendar.getVisible());
		else
			this._dateCalendar.setVisible(true);
	}
	// reparent calendar based on which button was clicked
	var buttonLoc = ev.dwtObj.getLocation();
	this._dateCalendar.setLocation(buttonLoc.x, buttonLoc.y+22);
	this._dateCalendar._currButton = ev.dwtObj;

	// always reset the date to today's date
	this._dateCalendar.setDate(new Date(), true);
};

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._dateCalSelectionListener = 
function(ev) {
	// get the parent node this calendar currently belongs to
	var parentButton = this._dateCalendar._currButton;

	// do some error correction... maybe we can optimize this?
	var sd = new Date(this._startDateField.value);
	var ed = new Date(this._endDateField.value);
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	if (parentButton == this._startDateButton) {
		if (ed.valueOf() < ev.detail.valueOf())
			this._endDateField.value = newDate;
		this._startDateField.value = newDate;
		this._updateFreeBusy();
	} else {
		if (sd.valueOf() > ev.detail.valueOf()) {
			this._startDateField.value = newDate;
			this._updateFreeBusy();
		}
		this._endDateField.value = newDate;
	}

	this._dateCalendar.setVisible(false);
};

// XXX: refactor this code since ZmApptTabViewPage uses similar?
ZmSchedTabViewPage.prototype._timeChangeListener =
function(ev) {
	var selectedObj = ev._args.selectObj;

	var sd = new Date(this._startDateField.value);
	var ed = new Date(this._endDateField.value);

	// only attempt to correct the times if dates are equal (otherwise all bets are off)
	if (sd.valueOf() == ed.valueOf()) {
		var numOptions = this._startTimeSelect.size();

		if (selectedObj == this._startTimeSelect) {
			var startIdx = this._startTimeSelect.getIndexForValue(selectedObj.getValue());
			var endIdx = this._endTimeSelect.getIndexForValue(this._endTimeSelect.getValue());
			if (endIdx <= startIdx) {
				var newIdx = startIdx+1;
				if (newIdx == numOptions) {
					newIdx = 0;
					var ed = new Date(this._endDateField.value);
					ed.setDate(ed.getDate()+1);
					this._endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);
				}
				var newIdx = ((startIdx+1) == numOptions) ? 0 : (startIdx+1);
				this._endTimeSelect.setSelected(newIdx);
			}
		} else {
			var startIdx = this._startTimeSelect.getIndexForValue(this._startTimeSelect.getValue());
			var endIdx = this._endTimeSelect.getIndexForValue(selectedObj.getValue());
			if (startIdx > endIdx) {
				var newIdx = endIdx == 0 ? numOptions-1 : endIdx-1;
				this._startTimeSelect.setSelected(newIdx);
				if (newIdx == (numOptions-1)) {
					var sd = new Date(this._startDateField.value);
					sd.setDate(sd.getDate()-1);
					this._startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
				}
			}
		}
	}
};

ZmSchedTabViewPage.prototype._colorSchedule = 
function(status, slots, table, sched) {
	var row = table.rows[0];
	var bgcolor = null;
	switch (status) {
		case ZmSchedTabViewPage.STATUS_FREE: 		bgcolor = "#FFFFFF"; break;
		case ZmSchedTabViewPage.STATUS_BUSY: 		bgcolor = "#990000"; break;
		case ZmSchedTabViewPage.STATUS_TENTATIVE:	bgcolor = "#FF3300"; break;
		case ZmSchedTabViewPage.STATUS_OUT: 		bgcolor = "#FFCC00"; break;
		case ZmSchedTabViewPage.STATUS_UNKNOWN: 	bgcolor = "#FFF5CC"; break;
	}

	if (row && bgcolor) {
		// figure out the table cell that needs to be colored
		for (var i = 0; i < slots.length; i++) {
			var sd = new Date(slots[i].s);
			var ed = new Date(slots[i].e);
			var startIdx = sd.getHours() * 2;
			if (sd.getMinutes() == "30")
				startIdx++;
			var endIdx = ed.getHours() * 2;
			if (ed.getMinutes() == "30" || ed.getMinutes() == "59")
				endIdx++;

			for (j = startIdx; j <= endIdx; j++) {
				if (row.cells[j]) {
					if (status != ZmSchedTabViewPage.STATUS_UNKNOWN)
						this._allAttendees[j] = this._allAttendees[j]+1;
					sched._coloredCells.push(row.cells[j]);
					row.cells[j].style.backgroundColor = bgcolor;
				}
			}
		}

		this._colorAllAttendees();
	}
};


// Callbacks

ZmSchedTabViewPage.prototype._fbResponseCallback =
function(args) {
	for (var i = 0; i < args.length; i++) {
		var usr = args[i];

		// first clear out the whole row for this email id
		var sched = this._schedTable[this._attendees[usr.id]];
		var table = sched ? Dwt.getDomObj(this._doc, sched.dwtTableId) : null;
		if (table) {
			table.rows[0].style.backgroundColor = "#FFFFFF";

			// clear out old sched if one exists
			if (sched.uid)
				this._clearColoredCells(sched);
			sched.uid = usr.id;

			// next, for each free/busy status, color the row for given start/end times
			if (usr.n)
				this._colorSchedule(ZmSchedTabViewPage.STATUS_UNKNOWN, usr.n, table, sched);
			if (usr.t)
				this._colorSchedule(ZmSchedTabViewPage.STATUS_TENTATIVE, usr.t, table, sched);
			if (usr.b)
				this._colorSchedule(ZmSchedTabViewPage.STATUS_BUSY, usr.b, table, sched);
			if (usr.u)
				this._colorSchedule(ZmSchedTabViewPage.STATUS_OUT, usr.u, table, sched);
		}
	}
};


// Static methods

ZmSchedTabViewPage._onClick = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = el._schedViewPage;

	// figure out which object was clicked
	if (el.id == svp._allDayCheckboxId) {
		svp._showTimeFields(el.checked ? false : true);
	} else {
		// looks like user clicked on attendee field
		svp._showAttendeeField(el);
	}
};

ZmSchedTabViewPage._onBlur = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var svp = el._schedViewPage;

	svp._handleAttendeeField(el);
};
