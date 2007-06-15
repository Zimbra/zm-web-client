/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
* Creates a generic quick add dialog (which basically mean it has different 
* than regular dialogs). See "DwtSemiModalDialog" in Ajax widget templates
* for cosmetics.
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
ZmApptQuickAddDialog = function(parent, appCtxt) {
	// create extra "more details" button to be added at the footer of DwtDialog
	var moreDetailsButton = new DwtDialog_ButtonDescriptor(ZmApptQuickAddDialog.MORE_DETAILS_BUTTON, 
														   ZmMsg.moreDetails, DwtDialog.ALIGN_LEFT);

	ZmQuickAddDialog.call(this, parent, null, null, [moreDetailsButton]);
	DBG.timePt("ZmQuickAddDialog constructor", true);

	this._appCtxt = appCtxt;

	this._attendees = {};

	this.setContent(this._setHtml());
	this.setTitle(ZmMsg.quickAddAppt);
	DBG.timePt("create content");

	this._createDwtObjects();
	this._cacheFields();
	this._addEventHandlers();
	this._button[ZmApptQuickAddDialog.MORE_DETAILS_BUTTON].setSize("100");
	DBG.timePt("create dwt controls, fields; register handlers");
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

ZmApptQuickAddDialog.prototype.initialize = 
function(appt) {
	this._appt = appt;
	this._subjectField.focus();

	// reset fields...
	this._subjectField.setValue(appt.getName() ? appt.getName() : "");
	this._locationField.setValue(appt.getLocation() ? appt.getLocation() : "");
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(appt.startDate);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(appt.endDate);
	var isAllDay = appt.isAllDayEvent();
	this._showTimeFields(!isAllDay);
	if (!isAllDay) {
		this._startTimeSelect.set(appt.startDate);
		this._endTimeSelect.set(appt.endDate);
	}
	this._showAsSelect.setSelectedValue("B");
	this._resetCalendarSelect(appt);
	this._repeatSelect.setSelectedValue("NON");
	this._repeatDescField.innerHTML = "";

	this._origFormValue = this._formValue();
	this._attendees[ZmCalItem.LOCATION] = new AjxVector();	// list of ZmResource
	
	// autocomplete for locations
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var shell = this._appCtxt.getShell();
		var resourcesClass = this._appCtxt.getApp(ZmApp.CALENDAR);
		var params = {parent: shell, dataClass: resourcesClass, dataLoader: resourcesClass.getLocations,
					  matchValue: ZmContactsApp.AC_VALUE_NAME};
		this._acLocationsList = new ZmAutocompleteListView(params);
		this._acLocationsList.handle(this._locationField.getInputElement());
	}

};

ZmApptQuickAddDialog.prototype.getAppt = 
function() {
	// create a copy of the appointment so we dont muck w/ the original
	var appt = ZmAppt.quickClone(this._appt);
	appt.setViewMode(ZmCalItem.MODE_NEW);

	// save field values of this view w/in given appt
	appt.setName(this._subjectField.getValue());
	appt.freeBusy = this._showAsSelect.getValue();
	var calId = this._calendarSelect.getValue();
	appt.setFolderId(calId);
	appt.setOrganizer(this._calendarOrgs[calId]);

	// set the start date by aggregating start date/time fields
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (this._appt.isAllDayEvent()) {
		appt.setAllDayEvent(true);
	} else {
		appt.setAllDayEvent(false);
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
	}
	appt.setStartDate(startDate);
	appt.setEndDate(endDate);
	appt.setRecurType(this._repeatSelect.getValue());
	appt.setAttendees(AjxEmailAddress.split(this._locationField.getValue()), ZmCalItem.LOCATION);

	return appt;
};

ZmApptQuickAddDialog.prototype.isValid = 
function() {
	var subj = AjxStringUtil.trim(this._subjectField.getValue());
	var errorMsg = null;

	if (subj && subj.length) {
		if (!ZmTimeSelect.validStartEnd(this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField)) {
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

ZmApptQuickAddDialog.prototype.isDirty = 
function() {
	return this._formValue() != this._origFormValue;
};

ZmApptQuickAddDialog.prototype.popup =
function(loc) {
	ZmQuickAddDialog.prototype.popup.call(this, loc);
	DBG.timePt("ZmQuickAddDialog#popup", true);
};


// Private / protected methods

ZmApptQuickAddDialog.prototype._setHtml = 
function() {
	this._subjectFieldId	= Dwt.getNextId();
	this._locationFieldId	= Dwt.getNextId();
	this._showAsSelectId	= Dwt.getNextId();
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
	this._calRowId          = Dwt.getNextId();

    var html = [];
	var i = 0;

	html[i++] = "<table border=0 width=330>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'><div style='width:70px'><sup>*</sup>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</div></td><td colspan=2 id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=2 id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td colspan=2 id='";
	html[i++] = this._showAsSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr id='" + this._calRowId + "'><td class='ZmApptTabViewPageField' id='";
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
	html[i++] = "<input style='height:22px;' type='text' autocomplete='off' size=8 maxlength=10 id='";
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
	html[i++] = "<input style='height:22px;' type='text' autocomplete='off' size=8 maxlength=10 id='";
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

	// create DwtInputField's
	this._subjectField = new DwtInputField({parent:this, type:DwtInputField.STRING,
											initialValue:null, size:null, maxLen:null,
											errorIconStyle:DwtInputField.ERROR_ICON_NONE,
											validationStyle:DwtInputField.CONTINUAL_VALIDATION});
	this._subjectField.setRequired();
	Dwt.setSize(this._subjectField.getInputElement(), "100%", "22px");
	this._subjectField.reparentHtmlElement(this._subjectFieldId);
	delete this._subjectFieldId;

	this._locationField = new DwtInputField({parent:this, type:DwtInputField.STRING,
											initialValue:null, size:null, maxLen:null,
											errorIconStyle:DwtInputField.ERROR_ICON_NONE,
											validationStyle:DwtInputField.ONEXIT_VALIDATION});
	Dwt.setSize(this._locationField.getInputElement(), "100%", "22px");
	this._locationField.reparentHtmlElement(this._locationFieldId);
	delete this._locationFieldId;

	// create DwtSelects
	this._showAsSelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptEditView.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptEditView.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}
	this._showAsSelect.reparentHtmlElement(this._showAsSelectId);

	this._calendarSelect = new DwtSelect(this);
	this._calendarSelect.reparentHtmlElement(this._calSelectId);
	delete this._calSelectId;

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener, this._appCtxt, true);
	this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener, this._appCtxt, true);

	// create selects for Time section
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	
	this._startTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.START);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	this._startTimeSelect.reparentHtmlElement(this._startTimeSelectId);
	delete this._startTimeSelectId;

	this._endTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.END);
	this._endTimeSelect.addChangeListener(timeSelectListener);
	this._endTimeSelect.reparentHtmlElement(this._endTimeSelectId);
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
	var org = ZmOrganizer.ITEM_ORGANIZER[appt.type];
	var data = this._appCtxt.getFolderTree().getByType(org);

	this._calendarSelect.clearOptions();
	this._calendarOrgs = [];
	for (var i = 0; i < data.length; i++) {
		var cal = data[i];
		var id = cal.link ? cal.getRemoteId() : cal.id;
		this._calendarOrgs[id] = cal.owner;
		// don't show calendar if remote or don't have write perms
		if (cal.url) continue;
		if (cal.link && cal.shares && cal.shares.length > 0 && !cal.shares[0].isWrite()) continue;
		this._calendarSelect.addOption(cal.getName(), false, id);
	}

	var len = this._calendarSelect.size();
	Dwt.setVisible(document.getElementById(this._calRowId), len > 1);

    this._calendarSelect.setSelectedValue(appt.folderId);
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

ZmApptQuickAddDialog.prototype._formValue =
function() {
	var vals = [];

	vals.push(this._subjectField.getValue());
	vals.push(this._locationField.getValue());
	vals.push(this._startDateField.value);
	vals.push(this._endDateField.value);
	if (!this._appt.isAllDayEvent()) {
		vals.push(
			AjxDateUtil.getServerDateTime(this._startTimeSelect.getValue()),
			AjxDateUtil.getServerDateTime(this._endTimeSelect.getValue())
		);
	}
	vals.push(this._repeatSelect.getValue());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

// Listeners

ZmApptQuickAddDialog.prototype._dateButtonListener = 
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

ZmApptQuickAddDialog.prototype._dateCalSelectionListener = 
function(ev) {
	var parentButton = ev.item.parent.parent;

	// do some error correction... maybe we can optimize this?
	var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
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

ZmApptQuickAddDialog.prototype._repeatChangeListener = 
function(ev) {
	this._repeatDescField.innerHTML = ev._args.newValue != "NON" ? AjxStringUtil.htmlEncode(ZmMsg.recurEndNone) : "";
};

ZmApptQuickAddDialog.prototype._timeChangeListener =
function(ev) {
	ZmTimeSelect.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField);
};

// Static methods
ZmApptQuickAddDialog._onChange = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var qad = AjxCore.objectWithId(el._qadId);
	ZmApptViewHelper.handleDateChange(qad._startDateField, qad._endDateField, el == qad._startDateField);
};
