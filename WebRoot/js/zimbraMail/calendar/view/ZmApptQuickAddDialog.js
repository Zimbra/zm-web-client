/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * 
 * @param {ZmShell}		parent				parent widget (the shell)
 * 
 * @extends		ZmQuickAddDialog
 * 
 */
ZmApptQuickAddDialog = function(parent) {
	ZmQuickAddDialog.call(this, parent, AjxMessageFormat.format(ZmMsg.quickAddAppt, ['']), null, null, null, 'DwtDialog ZmApptQuickAddDialog');

	DBG.timePt("ZmQuickAddDialog constructor", true);

	AjxDispatcher.run("GetResources");
	AjxDispatcher.require(["MailCore", "CalendarCore"]);

	var app = appCtxt.getApp(ZmApp.CALENDAR);

	var html = AjxTemplate.expand("calendar.Appointment#ZmApptQuickAddDialog", {id: this._htmlElId});
	this.setContent(html);

	DBG.timePt("create content");
	this._calendarOrgs = {};

	this._createDwtObjects();
	this._cacheFields();

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

	this.setTitle(AjxMessageFormat.format(ZmMsg.quickAddAppt, [DwtCalendar.getDateFormatter().format(appt.startDate)]));

	// reset fields...
	this._subjectField.setValue(appt.getName() ? appt.getName() : "");
	var isAllDay = appt.isAllDayEvent();
	this._showTimeFields(!isAllDay);
	if (!isAllDay) {
		this._startTimeSelect.set(appt.startDate);
		this._endTimeSelect.set(appt.endDate);
	}

	this._calendarOrgs = {};
	ZmApptViewHelper.populateFolderSelect(this._folderSelect, this._folderRow, this._calendarOrgs, appt);
	this._origFormValue = this._formValue();

	// Warn the user if trying to schedule an appointment in the past.
	ZmApptViewHelper.warnIfApptStartingInPast(appt.startDate, this._htmlElId);
};

/**
 * Gets the appointment.
 * 
 * @return	{ZmAppt}	the appointment
 */
ZmApptQuickAddDialog.prototype.getAppt = 
function() {
	// create a copy of the appointment so we dont muck w/ the original
	var appt = ZmAppt.quickClone(this._appt);
	appt.setViewMode(ZmCalItem.MODE_NEW);

	// save field values of this view w/in given appt
	appt.setName(this._subjectField.getValue());
	var calId = this._folderSelect.getValue();
	appt.setFolderId(calId);
	appt.setOrganizer(this._calendarOrgs[calId]);

	// set the start date by aggregating start date/time fields
	var startDate = this._appt.startDate;
	var endDate = this._appt.endDate;
	if (this._appt.isAllDayEvent()) {
		appt.setAllDayEvent(true);
		if(AjxDateUtil.isDayShifted(startDate)) {
			AjxDateUtil.rollToNextDay(startDate);
			AjxDateUtil.rollToNextDay(endDate);
		}
	} else {
		appt.setAllDayEvent(false);
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
	}
	appt.setStartDate(startDate);
	appt.setEndDate(endDate);

	return appt;
};

ZmApptQuickAddDialog.prototype.isValid = 
function() {
	var subj = AjxStringUtil.trim(this._subjectField.getValue());
	var errorMsg = [];
	var startDate = this._appt.startDate;
	var endDate = this._appt.endDate;

	if (subj && subj.length) {
		var startTime = this._startTimeSelect.getTimeString();
		var endTime = this._endTimeSelect.getTimeString();

		if (startTime && endTime) {
			var startDateMs = DwtTimeInput.getDateFromFields(startTime, startDate).getTime();
			var endDateMs = DwtTimeInput.getDateFromFields(endTime, endDate).getTime();

			if (startDateMs > endDateMs) {
				// Shows error if end time is less than start time.
				errorMsg.push(ZmMsg.errorInvalidTimes);
			}
		}
	} else {
		errorMsg.push(ZmMsg.errorMissingSubject);
	}

	if (errorMsg.length > 0) {
		var dlg = appCtxt.getMsgDialog();
		dlg.setMessage(errorMsg.join("<br>"), DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	}

	return errorMsg.length == 0;
};

ZmApptQuickAddDialog.prototype.isDirty = 
function() {
	return this._formValue() != this._origFormValue;
};

ZmApptQuickAddDialog.prototype._setFocusToSubjectFeild =
function(){
	this._tabGroup.setFocusMember(this._subjectField);
};

ZmApptQuickAddDialog.prototype.popup =
function(loc) {
	ZmQuickAddDialog.prototype.popup.call(this, loc);

	if (!this._tabGroupComplete) {
		// tab group filled in here rather than in the constructor b/c we need
		// all the content fields to have been created
		this._tabGroup.addMember([
			this._subjectField, this._folderSelect,
			this._startTimeSelect.getTabGroupMember(), this._endTimeSelect.getTabGroupMember()
		]);
		this._tabGroupComplete = true;
	}
	//bug:68208 Focus must be in the Subject of QuickAdd Appointment dialog after double-click in calendar
	this._focusAction = new AjxTimedAction(this, this._setFocusToSubjectFeild);
	AjxTimedAction.scheduleAction(this._focusAction, 300);

	DBG.timePt("ZmQuickAddDialog#popup", true);
};

// Private / protected methods

ZmApptQuickAddDialog.prototype._createDwtObjects =
function() {

	// create DwtInputField's
	this._subjectField = new DwtInputField({parent:this, type:DwtInputField.STRING,
											initialValue:null, size:null, maxLen:null,
											errorIconStyle:DwtInputField.ERROR_ICON_NONE,
											validationStyle:DwtInputField.CONTINUAL_VALIDATION,
											hint: ZmMsg.subjectHint,
											parentElement:(this._htmlElId + "_subject")});
	this._subjectField.getInputElement().setAttribute('aria-labelledby', this._htmlElId + "_subject_label");
	this._subjectField.setRequired(true);

	this._folderSelect = new DwtSelect({parent:this, parentElement:(this._htmlElId + "_calendar"), label: ZmMsg.calendar});
	this._folderSelect.setAttribute('aria-labelledby', this._htmlElId + "_calendar_label");
	this._folderSelect.addChangeListener(new AjxListener(this, this._privacyListener));

	// create selects for Time section
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	
	this._startTimeSelect = new DwtTimeInput(this, DwtTimeInput.START);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	this._startTimeSelect.reparentHtmlElement(this._htmlElId + "_startTime");

	this._endTimeSelect = new DwtTimeInput(this, DwtTimeInput.END);
	this._endTimeSelect.addChangeListener(timeSelectListener);
	this._endTimeSelect.reparentHtmlElement(this._htmlElId + "_endTime");

	var dialogContentEl = document.getElementById(this._htmlElId + "_content");
	this._containerSize = Dwt.getSize(dialogContentEl);

	this._moreDetails = new DwtLinkButton({parent: this, parentElement: this._htmlElId + "_more_details", noDropDown: true});
	this._moreDetails.setText(ZmMsg.moreDetails);
};

ZmApptQuickAddDialog.prototype.setMoreDetailsListener =
function(handler) {
	this._moreDetails.addSelectionListener(handler);
};

ZmApptQuickAddDialog.prototype._cacheFields =
function() {
	this._folderRow	= document.getElementById(this._htmlElId + "_folderRow");
};

ZmApptQuickAddDialog.prototype._showTimeFields = 
function(show) {
	Dwt.setVisible(document.getElementById(this._htmlElId + "_timeSelector"), show);
};

ZmApptQuickAddDialog.prototype._formValue =
function() {
	var vals = [];

	vals.push(this._subjectField.getValue());
	if (!this._appt.isAllDayEvent()) {
		vals.push(
			AjxDateUtil.getServerDateTime(this._startTimeSelect.getValue()),
			AjxDateUtil.getServerDateTime(this._endTimeSelect.getValue())
		);
	}

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

ZmApptQuickAddDialog.prototype._timeChangeListener =
function(ev, id) {
	//DwtTimeInput.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, {value: AjxDateUtil.simpleComputeDateStr(this._appt.startDate)}, {value: AjxDateUtil.simpleComputeDateStr(this._appt.endDate)}, null, id);

	var startDate = this._appt.startDate;
	var endDate = this._appt.endDate;

	if (id == DwtTimeInput.START) {
		var oldStartDateMs = startDate.getTime();
		var newStartDateMs = DwtTimeInput.getDateFromFields(this._startTimeSelect.getTimeString(), startDate).getTime();
		var oldEndDateMs = endDate.getTime();

		var delta = oldEndDateMs - oldStartDateMs;
		if (!delta) return null;

		var newEndDateMs = newStartDateMs + delta;
		var newEndDate = new Date(newEndDateMs);
		var newStartDate = new Date(newStartDateMs);

		// Changing date is not allowed so change delta to 15 mins
		if(newEndDate.getDay() !== new Date(oldEndDateMs).getDay()) {
			delta = 900000; // 15 mins

			newEndDateMs = newStartDateMs + delta;
			newEndDate = new Date(newEndDateMs);
		}

		this._startTimeSelect.set(newStartDate);
		this._endTimeSelect.set(newEndDate);
	} else if (id == DwtTimeInput.END){
		var oldEndDateMs = endDate.getTime();
		var newEndDateMs = DwtTimeInput.getDateFromFields(this._endTimeSelect.getTimeString(), endDate).getTime();
		var oldStartDateMs = startDate.getTime();

		var delta = oldEndDateMs - oldStartDateMs;
		if (!delta) return null;

		//adjust start date only when the end date falls earlier than start date
		if(newEndDateMs < oldStartDateMs) {
			var newStartDateMs = newEndDateMs - delta;
			var newStartDate = new Date(newStartDateMs);
			var newEndDate = new Date(newEndDateMs);

			// Changing date is not allowed so change delta to 15 mins
			if(newStartDate.getDay() !== new Date(oldStartDateMs).getDay()) {
				delta = 900000; // 15 mins

				newStartDateMs = newEndDateMs - delta;
				newStartDate = new Date(newStartDateMs);
			}

			this._startTimeSelect.set(newStartDate);
			this._endTimeSelect.set(newEndDate);
		}
	}

	// Warn the user if trying to schedule an appointment in the past.
	var startDate = this._appt.startDate;
	if (startDate) {
		startDate.setHours(this._startTimeSelect.getHours(), this._startTimeSelect.getMinutes(), 0);
		ZmApptViewHelper.warnIfApptStartingInPast(startDate, this._htmlElId);
	}
};
