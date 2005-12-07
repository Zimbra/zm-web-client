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
* Creates a generic quick add dialog (which basically mean it has different 
* than regular dialogs). See "SemiModalDialog" in DwtBorder for cosmetics.
* @constructor
* @class
* This class represents a modal dialog which has at least a title and the 
* standard buttons (OK/Cancel).
* widgets (i.e. buttons, etc) as necessary.
* <p>
* Dialogs always hang off the main shell since their stacking order is managed 
* through z-index.
*
* @author Parag Shah
* @param parent				parent widget (the shell)
* @param appCtxt 			singleton appCtxt
*/
function ZmApptQuickAddDialog(parent, appCtxt) {
	DBG.showTiming(true, AjxDebug.PERF, "ZmApptQuickAddDialog");
	// create extra "more details" button to be added at the footer of DwtDialog
	var moreDetailsButton = new DwtDialog_ButtonDescriptor(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, 
														   ZmMsg.moreDetails, DwtDialog.ALIGN_LEFT);

	ZmQuickAddDialog.call(this, parent, null, null, [moreDetailsButton]);
	DBG.timePt(AjxDebug.PERF, "ZmQuickAddDialog constructor");

	this._appCtxt = appCtxt;

	this.setContent(this._setHtml());
	this.setTitle(ZmMsg.quickAddAppt);
	DBG.timePt(AjxDebug.PERF, "create content");

	this._createDwtObjects();
	this._cacheFields();
	this._addEventHandlers();
	this._button[ZmApptQuickAddDialog.MORE_DETAILS_BUTTON].setSize("100");
	DBG.timePt(AjxDebug.PERF, "create dwt controls, fields; register handlers");
	DBG.showTiming(false);
};

ZmApptQuickAddDialog.prototype = new ZmQuickAddDialog;
ZmApptQuickAddDialog.prototype.constructor = ZmApptQuickAddDialog;


// Consts

ZmApptQuickAddDialog.MORE_DETAILS_BUTTON = ++DwtDialog.LAST_BUTTON;


// Public

ZmApptQuickAddDialog.prototype.toString = 
function() {
	return "ZmApptQuickAddDialog";
};

ZmApptQuickAddDialog.prototype.addKeyListeners =
function() {
	// overloaded so base class wont register for key events.
};

ZmApptQuickAddDialog.prototype.initialize = 
function(appt) {
	this._appt = appt;
	this._subjectField.focus();

	// reset fields...
	this._subjectField.value = "";
	this._locationField.value = "";
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(appt.getStartDate());
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(appt.getEndDate());
	var isAllDay = appt.isAllDayEvent();
	this._showTimeFields(!isAllDay);
	if (!isAllDay)
		ZmApptViewHelper.resetTimeSelect(appt, this._startTimeSelect, this._endTimeSelect, false);
	this._resetCalendarSelect(appt);
	this._repeatSelect.setSelectedValue("NON");
	this._repeatDescField.innerHTML = "";
};

ZmApptQuickAddDialog.prototype.getAppt = 
function() {
	// create a copy of the appointment so we dont muck w/ the original
	var appt = ZmAppt.quickClone(this._appt);
	appt.setViewMode(ZmAppt.MODE_NEW);

	// save field values of this view w/in given appt
	appt.setName(this._subjectField.value);
	appt.location = this._locationField.value;

	var calId = this._calendarSelect.getValue();
	appt.setFolderId(calId);
	appt.setOrganizer(this._calendarOrgs[calId]);

	// set the start date by aggregating start date/time fields
	var startDate = this._startDateField.value;
	var endDate = this._endDateField.value;
	if (this._appt.isAllDayEvent()) {
		appt.setAllDayEvent(true);
	} else {
		startDate = startDate + " " + this._startTimeSelect.getValue();
		endDate = endDate + " " + this._endTimeSelect.getValue();
	}
	appt.setStartDate(startDate);
	appt.setEndDate(endDate);

	appt.repeatType = this._repeatSelect.getValue();

	return appt;
};

ZmApptQuickAddDialog.prototype.isValid = 
function() {
	var subj = AjxStringUtil.trim(this._subjectField.value);
	var isValid = subj && subj.length > 0;

	if (isValid) {
		// check proper dates..
		var sd = this._startDateField.value;
		var ed = this._endDateField.value;
		
		if (!this._appt.isAllDayEvent()) {
			sd += " " + this._startTimeSelect.getValue();
			ed += " " + this._endTimeSelect.getValue();
		}
		var startDate = new Date(sd);
		var endDate = new Date(ed);
		isValid = startDate.valueOf() <= endDate.valueOf();
	}

	return isValid;
};

ZmApptQuickAddDialog.prototype.popup =
function(loc) {
	DBG.showTiming(true, AjxDebug.PERF, "ZmApptQuickAddDialog#popup");
	ZmQuickAddDialog.prototype.popup.call(this, loc);
	DBG.timePt(AjxDebug.PERF, "ZmQuickAddDialog#popup");
	DBG.showTiming(false);
};


// Private / protected methods

ZmApptQuickAddDialog.prototype._setHtml = 
function() {
	this._subjectFieldId	= Dwt.getNextId();
	this._locationFieldId	= Dwt.getNextId();
	this._calSelectId		= Dwt.getNextId();
	this._calLabelId		= Dwt.getNextId();
	this._startDateFieldId	= Dwt.getNextId();
	this._startMiniCalBtnId = Dwt.getNextId();
	this._startTimeSelectId = Dwt.getNextId();
	this._endDateFieldId	= Dwt.getNextId();
	this._endMiniCalBtnId	= Dwt.getNextId();
	this._endTimeSelectId	= Dwt.getNextId();
	this._repeatSelectId	= Dwt.getNextId();
	this._repeatDescId 		= Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=325>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'><div style='width:75px'><sup>*</sup>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</div></td><td colspan=2><input type='text' autocomplete='off' style='width:100%; height:22px' id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=2><input type='text' autocomplete='off' style='width:100%; height:22px' id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField' id='";
	html[i++] = this._calLabelId;
	html[i++] = "'>";
	html[i++] = ZmMsg.calendar;
	html[i++] = ":</td><td colspan=2 id='";
	html[i++] = this._calSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.startTime;
	html[i++] = ":</td><td colspan=2>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	html[i++] = "<td>";
	html[i++] = "<input style='height:22px;' type='text' autocomplete='off' size=11 maxlength=10 id='";
	html[i++] = this._startDateFieldId;
	html[i++] = "'></td><td id='";
	html[i++] = this._startMiniCalBtnId;
	html[i++] = "'></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td></tr></table>";
	html[i++] = "</td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.endTime;
	html[i++] = ":</td><td colspan=2>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	html[i++] = "<td>";
	html[i++] = "<input style='height:22px;' type='text' autocomplete='off' size=11 maxlength=10 id='";
	html[i++] = this._endDateFieldId;
	html[i++] = "'></td><td id='";
	html[i++] = this._endMiniCalBtnId;
	html[i++] = "'></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td></tr></table>";
	html[i++] = "</td></tr>";
	html[i++] = "<tr><td></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.repeat;
	html[i++] = ":</td><td id='";
	html[i++] = this._repeatSelectId;
	html[i++] = "'></td><td><span class='ZmApptTabViewPageField' style='width:100%' id='";
	html[i++] = this._repeatDescId;
	html[i++] = "'></td></tr>";
	html[i++] = "</table>";

	return html.join("");	
};

ZmApptQuickAddDialog.prototype._createDwtObjects = 
function() {
	// create selects for details section
	this._calendarSelect = new DwtSelect(this);
	var calCell = document.getElementById(this._calSelectId);
	if (calCell)
		calCell.appendChild(this._calendarSelect.getHtmlElement());
	delete this._calSelectId;

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmApptViewHelper.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener, true);
	this._endDateButton = ZmApptViewHelper.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener, true);

	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	// create selects for Time section
	this._startTimeSelect = new DwtSelect(this);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	var timeOptions = ZmApptViewHelper.getTimeOptionValues();
	if (timeOptions) {
		for (var i = 0; i < timeOptions.length; i++) {
			var option = timeOptions[i];
			this._startTimeSelect.addOption(option.label, option.selected, option.value);
		}
	}
	var startTimeCell = document.getElementById(this._startTimeSelectId);
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
	var endTimeCell = document.getElementById(this._endTimeSelectId);
	if (endTimeCell)
		endTimeCell.appendChild(this._endTimeSelect.getHtmlElement());
	delete this._endTimeSelectId;

	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length-1; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	var repeatCell = document.getElementById(this._repeatSelectId);
	if (repeatCell)
		repeatCell.appendChild(this._repeatSelect.getHtmlElement());
	delete this._repeatSelectId;
};

ZmApptQuickAddDialog.prototype._cacheFields = 
function() {
	this._subjectField 		= document.getElementById(this._subjectFieldId); 	delete this._subjectFieldId;
	this._locationField 	= document.getElementById(this._locationFieldId); 	delete this._locationFieldId;
	this._calLabelField 	= document.getElementById(this._calLabelId); 		delete this._calLabelId;
	this._startDateField 	= document.getElementById(this._startDateFieldId);	delete this._startDateFieldId;
	this._endDateField 		= document.getElementById(this._endDateFieldId);	delete this._endDateFieldId;
	this._repeatDescField 	= document.getElementById(this._repeatDescId);		delete this._repeatDescId;
};

ZmApptQuickAddDialog.prototype._addEventHandlers = 
function() {
	var qadId = AjxCore.assignId(this);

	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmApptQuickAddDialog._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmApptQuickAddDialog._onChange);

	this._startDateField._qadId = this._endDateField._qadId =  qadId;
};

ZmApptQuickAddDialog.prototype._resetCalendarSelect = 
function(appt) {
	// get all folders w/ view set to "Appointment" we received from initial refresh block
	var calTreeData = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.CALENDAR);
	if (calTreeData && calTreeData.root) {
		this._calendarSelect.clearOptions();
		this._calendarOrgs = new Array();
		var children = calTreeData.root.children.getArray();
		var len = children.length;
		Dwt.setVisibility(this._calendarSelect.getHtmlElement(), len>1);
		Dwt.setVisibility(this._calLabelField, len>1);
		if (len>1) {
			for (var i = 0; i < len; i++) {
				var cal = children[i];
				this._calendarOrgs[cal.id] = cal.owner;
				// if for some reason, we dont have share info, show all shares 
				if (!cal.link || (cal.link && (cal.shares == null || cal.shares[0].isWrite())))
					this._calendarSelect.addOption(cal.name, false, cal.id);
			}
		}
		this._calendarSelect.setSelectedValue(appt.getFolderId());
	}
};

ZmApptQuickAddDialog.prototype._showTimeFields = 
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	if (this._supportTimeZones)
		Dwt.setVisibility(this._endTZoneSelect.getHtmlElement(), show);
	// also show/hide the "@" text
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement().parentNode.previousSibling.previousSibling, show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement().parentNode.previousSibling.previousSibling, show);
};


// Listeners

ZmApptQuickAddDialog.prototype._dateButtonListener = 
function(ev) {
	var calDate = ev.item == this._startDateButton
		? new Date(this._startDateField.value)
		: new Date(this._endDateField.value);

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
	menu.popup();
};

ZmApptQuickAddDialog.prototype._dateCalSelectionListener = 
function(ev) {
	var parentButton = ev.item.parent.parent;

	// do some error correction... maybe we can optimize this?
	var sd = new Date(this._startDateField.value);
	var ed = new Date(this._endDateField.value);
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	if (parentButton == this._startDateButton) {
		if (ed.valueOf() < ev.detail.valueOf())
			this._endDateField.value = newDate;
		this._startDateField.value = newDate;
	} else {
		if (sd.valueOf() > ev.detail.valueOf())
			this._startDateField.value = newDate;
		this._endDateField.value = newDate;
	}
};

ZmApptQuickAddDialog.prototype._timeChangeListener = 
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

ZmApptQuickAddDialog.prototype._repeatChangeListener = 
function(ev) {
	this._repeatDescField.innerHTML = ZmApptViewHelper.setSimpleRecurString(ev._args.newValue);
};

// Static methods
ZmApptQuickAddDialog._onChange = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var qad = AjxCore.objectWithId(el._qadId);
	ZmApptViewHelper.handleDateChange(qad._startDateField, qad._endDateField, el == qad._startDateField);
};
