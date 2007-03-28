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
* Creates a new appointment tab.
* @constructor
* @class
* This is the main screen for creating/editing an appointment. It provides inputs 
* for the various appointment details.
*
* @author Parag Shah
*
* @param parent				[DwtComposite]				the appt compose view
* @param appCtxt 			[ZmAppCtxt]					app context
* @param attendees			[hash]						attendees/locations/equipment
* @param controller			[ZmApptComposeController]	the appt compose controller
* @param dateInfo			[object]					hash of date info
*/
function ZmApptTabViewPage(parent, appCtxt, attendees, controller, dateInfo) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this._attendees = attendees;
	this._controller = controller;
	this._dateInfo = dateInfo;

	this.setScrollStyle(DwtControl.CLIP);
	this._rendered = false;

	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	this._composeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	this._repeatSelectDisabled = false;
	this._attachCount = 0;
	
	this._attTypes = [ZmAppt.PERSON, ZmAppt.LOCATION];
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._attTypes.push(ZmAppt.EQUIPMENT);
	}
	
	parent.addChangeListener(new AjxListener(this, this._attendeesChangeListener));
	this._kbMgr = this._appCtxt.getShell().getKeyboardMgr();
};

ZmApptTabViewPage.prototype = new DwtTabViewPage;
ZmApptTabViewPage.prototype.constructor = ZmApptTabViewPage;

ZmApptTabViewPage.prototype.toString =
function() {
	return "ZmApptTabViewPage";
};


// Consts

ZmApptTabViewPage.UPLOAD_FIELD_NAME = "attUpload";
ZmApptTabViewPage.SHOW_MAX_ATTACHMENTS = AjxEnv.is800x600orLower ? 2 : 3;

ZmApptTabViewPage.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "F", 	selected: false },
	{ label: ZmMsg.replyTentative, 		value: "T", 	selected: false },
	{ label: ZmMsg.busy, 				value: "B", 	selected: true  },
	{ label: ZmMsg.outOfOffice,			value: "O", 	selected: false }];

ZmApptTabViewPage._REPEAT_CHANGE = "REPEAT_CHANGE";

// Public

ZmApptTabViewPage.prototype.showMe =
function() {
	if (!this._rendered) return;

	this.parent.tabSwitched(this._tabKey);
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);
	this._setAttendees();
	this._controller._setApptComposeTabGroup(true);
};

ZmApptTabViewPage.prototype.tabBlur =
function(useException) {
	if (this._activeInputField) {
		this._handleAttendeeField(this._activeInputField, useException);
		this._activeInputField = null;
	}
};

ZmApptTabViewPage.prototype.getAppt =
function(attId) {
	// attempt to submit attachments first!
	if (!attId && this._gotAttachments()) {
		this._submitAttachments();
		return null;
	}
	// create a copy of the appointment so we don't muck w/ the original
	var appt = ZmAppt.quickClone(this._appt);
	appt.setViewMode(this._mode);

	// bug fix #5617 - check if there are any existing attachments that were unchecked
	if (this._mode != ZmAppt.MODE_NEW) {
		var attCheckboxes = document.getElementsByName(ZmAppt.ATTACHMENT_CHECKBOX_NAME);
		if (attCheckboxes && attCheckboxes.length > 0) {
			for (var i = 0; i < attCheckboxes.length; i++) {
				if (!attCheckboxes[i].checked)
					appt.removeAttachment(attCheckboxes[i].value);
			}
		}
	}

	// save field values of this view w/in given appt
	appt.setName(this._subjectField.getValue());
	appt.freeBusy = this._showAsSelect.getValue();
	var calId = this._calendarSelect.getValue();
	appt.setFolderId(calId);
	appt.setOrganizer(this._calendarOrgs[calId]);

	// set the start date by aggregating start date/time fields
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (this._allDayCheckbox.checked) {
		appt.setAllDayEvent(true);
	} else {
		appt.setAllDayEvent(false);
		startDate = this._startTimeSelect.getValue(startDate);
		endDate = this._endTimeSelect.getValue(endDate);
	}
	appt.setStartDate(startDate, true);
	appt.setEndDate(endDate, true);
	if (Dwt.getVisibility(this._tzoneSelect.getHtmlElement()))
		appt.setTimezone(this._tzoneSelect.getValue());

	// set the notes parts (always add text part)
	var top = new ZmMimePart();
	if (this._composeMode == DwtHtmlEditor.HTML) {
		top.setContentType(ZmMimeTable.MULTI_ALT);

		// create two more mp's for text and html content types
		var textPart = new ZmMimePart();
		textPart.setContentType(ZmMimeTable.TEXT_PLAIN);
		textPart.setContent(this._notesHtmlEditor.getTextVersion());
		top.children.add(textPart);

		var htmlPart = new ZmMimePart();
		htmlPart.setContentType(ZmMimeTable.TEXT_HTML);
		htmlPart.setContent(this._notesHtmlEditor.getContent(true));
		top.children.add(htmlPart);
	} else {
		top.setContentType(ZmMimeTable.TEXT_PLAIN);
		top.setContent(this._notesHtmlEditor.getContent());
	}

	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		appt.setAttendees(this._attendees[type].getArray(), type);
	}

	appt.notesTopPart = top;

	// set any recurrence rules
	this._getRecurrence(appt);

	return appt;
};

ZmApptTabViewPage.prototype.initialize =
function(appt, mode, isDirty) {
	this._appt = appt;
	this._isDirty = isDirty;

	this.createHtml();

	this._mode = (mode == ZmAppt.MODE_NEW_FROM_QUICKADD || !mode) ? ZmAppt.MODE_NEW : mode;

	// OPTIMIZATION: create timed action to reset the view
	var ta = new AjxTimedAction(this, this._reset, [appt, mode || ZmAppt.MODE_NEW]);
	AjxTimedAction.scheduleAction(ta, 0);
};

ZmApptTabViewPage.prototype.cleanup =
function() {
	if (this._recurDialog) {
		this._recurDialog.clearState();
		this._recurDialogRepeatValue = null;
	}

	delete this._appt;
	this._appt = null;

	// clear out all input fields
	this._subjectField.setValue("");
	this._repeatDescField.innerHTML = "";
	this._notesHtmlEditor.clear();
	for (var t = 0; t < this._attTypes.length; t++) {
		this._attInputField[this._attTypes[t]].setValue("");
	}

	// reinit non-time sensitive selects option values
	this._repeatSelect.setSelectedValue(ZmApptViewHelper.REPEAT_OPTIONS[0].value);
	this._allDayCheckbox.checked = false;
	this._showTimeFields(true);

	// remove attachments if any were added
	this._removeAllAttachments();

	// disable all input fields
	this.enableInputs(false);

	// reset autocomplete lists
	if (this._acContactsList) {
		this._acContactsList.reset();
		this._acContactsList.show(false);
	}
	if (this._acLocationsList) {
		this._acLocationsList.reset();
		this._acLocationsList.show(false);
	}
	if (this._acEquipmentList) {
		this._acEquipmentList.reset();
		this._acEquipmentList.show(false);
	}
};

ZmApptTabViewPage.prototype.addRepeatChangeListener =
function(listener) {
	this.addListener(ZmApptTabViewPage._REPEAT_CHANGE, listener);
};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmApptTabViewPage.prototype.enableInputs =
function(bEnableInputs) {
	this._subjectField.setEnabled(bEnableInputs);
	this._startDateField.disabled = !bEnableInputs;
	this._endDateField.disabled = !bEnableInputs;
	for (var t = 0; t < this._attTypes.length; t++) {
		this._attInputField[this._attTypes[t]].setEnabled(bEnableInputs);
	}
};

/**
/* @param excludeAttendees		check for dirty fields excluding the attendees field
*/
ZmApptTabViewPage.prototype.isDirty =
function(excludeAttendees) {
	var formValue = excludeAttendees 
		? this._origFormValueMinusAttendees 
		: this._origFormValue;

	return (this._gotAttachments()) || 
			this._isDirty ||
		   (this._formValue(excludeAttendees) != formValue);
};

ZmApptTabViewPage.prototype.isValid =
function() {
	var errorMsg = null;

	// check for required subject
	var subj = AjxStringUtil.trim(this._subjectField.getValue());

	if (subj && subj.length) {
		if (this._allDayCheckbox.checked) {
			var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
			var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
			if (!startDate || !endDate || (startDate.valueOf() > endDate.valueOf())) {
				errorMsg = ZmMsg.errorInvalidDates;
			}
		} else {
			if (!ZmTimeSelect.validStartEnd(this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField)) {
				errorMsg = ZmMsg.errorInvalidDates;
			}
		}
	} else {
		errorMsg = ZmMsg.errorMissingSubject;
	}

	if (errorMsg) {
		throw errorMsg;
	}

	return true;
};

ZmApptTabViewPage.prototype.getComposeMode =
function() {
	return this._composeMode;
};

ZmApptTabViewPage.prototype.setComposeMode =
function(composeMode) {
	this._composeMode = composeMode || this._composeMode;
	this._notesHtmlEditor.setMode(this._composeMode, true);
	this._resizeNotes();
};

// called by schedule tab view when user changes start date field
ZmApptTabViewPage.prototype.updateDateField =
function(newStartDate, newEndDate) {
	this._startDateField.value = newStartDate;
	this._endDateField.value = newEndDate;
};

ZmApptTabViewPage.prototype.updateAllDayField =
function(isAllDay) {
	this._allDayCheckbox.checked = isAllDay;
	this._showTimeFields(!isAllDay);
};

ZmApptTabViewPage.prototype.toggleAllDayField =
function() {
	this.updateAllDayField(!this._allDayCheckbox.checked);
};

ZmApptTabViewPage.prototype.updateTimeField =
function(dateInfo) {
	this._startTimeSelect.setSelected(dateInfo.startHourIdx, dateInfo.startMinuteIdx, dateInfo.startAmPmIdx);
	this._endTimeSelect.setSelected(dateInfo.endHourIdx, dateInfo.endMinuteIdx, dateInfo.endAmPmIdx);
};

ZmApptTabViewPage.prototype.updateTimezone =
function(dateInfo) {
    this._tzoneSelect.setSelectedValue(dateInfo.timezone);
};

ZmApptTabViewPage.prototype.reEnableDesignMode =
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._notesHtmlEditor.reEnableDesignMode();
};

ZmApptTabViewPage.prototype.createHtml =
function() {
	if (!this._rendered) {
		this._createHTML();
		this._rendered = true;
	}
    this._initTzSelect();
};

/**
 * Adds an attachment (file input field) to the appointment view. If none
 * already exist, creates the attachments container. If @attach param provided,
 * user is opening an existing appointment w/ an attachment and therefore
 * display differently
 */
ZmApptTabViewPage.prototype.addAttachmentField =
function(appt, attach) {
	if (this._attachCount == 0)
		this._initAttachContainer();

	if (this._attachCount == ZmApptTabViewPage.SHOW_MAX_ATTACHMENTS) {
		// bug fix #6906 - add a little extra padding for safari's weird scrollbars
		this._attachDiv.style.height = Dwt.getSize(this._attachDiv).y + (AjxEnv.isSafari ? 2 : 0) + "px";
	}

	this._attachCount++;

	// add file input field
	var div = document.createElement("div");

	var attachRemoveId = "_att_" + Dwt.getNextId();
	var attachInputId = "_att_" + Dwt.getNextId();

	if (attach) {
		div.innerHTML = appt.getAttachListHtml(attach, true);
	} else {
		var html = [];
		var i = 0;

		html[i++] = "<nobr>&nbsp;<input type='file' size=40 name='";
		html[i++] = ZmApptTabViewPage.UPLOAD_FIELD_NAME;
		html[i++] = "' id='";
		html[i++] = attachInputId;
		html[i++] = "'>&nbsp;<span style='cursor:pointer;color:blue;text-decoration:underline;' id='";
		html[i++] = attachRemoveId;
		html[i++] = "'>";
		html[i++] = ZmMsg.remove;
		html[i++] = "</span></nobr>";

		div.innerHTML = html.join("");
	}

	if (this._attachDiv == null)
		this._attachDiv = document.getElementById(this._attachDivId);
	this._attachDiv.appendChild(div);

	// scroll to the new attachment if needed
	this._attachDiv.scrollTop = div.offsetTop;

	if (attach == null) {
		// add event handlers as necessary
		var tvpId = AjxCore.assignId(this);
		var attachRemoveSpan = document.getElementById(attachRemoveId);
		attachRemoveSpan._tabViewPageId = tvpId;
		attachRemoveSpan._parentDiv = div;
		Dwt.setHandler(attachRemoveSpan, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
		// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
		if (AjxEnv.isIE) {
			var attachInputEl = document.getElementById(attachInputId);
			attachInputEl._tabViewPageId = tvpId;
			Dwt.setHandler(attachInputEl, DwtEvent.ONKEYDOWN, ZmApptTabViewPage._onKeyDown);
		}
	}

	this._resizeNotes();
};

ZmApptTabViewPage.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) return;

	if (newWidth) {
		this.setSize(newWidth);
		Dwt.setSize(this.getHtmlElement().firstChild, newWidth);
	}

	if (newHeight) {
		this.setSize(Dwt.DEFAULT, newHeight - 35);
		this._resizeNotes();
	}
};

ZmApptTabViewPage.prototype.getNotesHtmlEditor =
function() {
	return this._notesHtmlEditor;
};

/**
* Returns a joined string of email addresses.
*/
ZmApptTabViewPage.prototype.getOrganizer =
function() {
	var calId = this._calendarSelect.getValue();
	var organizer = new ZmContact(this._appCtxt);
	organizer.initFromEmail(ZmApptViewHelper.getOrganizerEmail(this._appCtxt, this._calendarOrgs[calId]), true);

	return organizer;
};


// Private / protected methods

ZmApptTabViewPage.prototype._addTabGroupMembers =
function(tabGroup) {
	tabGroup.addMember(this._subjectField);
	tabGroup.addMember(this._attInputField[ZmAppt.LOCATION]);
	tabGroup.addMember(this._attInputField[ZmAppt.PERSON]);
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		tabGroup.addMember(this._attInputField[ZmAppt.EQUIPMENT]);
	}
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	tabGroup.addMember(document.getElementById(bodyFieldId));
};

ZmApptTabViewPage.prototype._reset =
function(appt, mode) {
	// reset the date/time values based on current time
	var sd = new Date(appt.getStartDate().getTime());
	var ed = new Date(appt.getEndDate().getTime());
	var isAllDayAppt = appt.isAllDayEvent();
	if (isAllDayAppt) {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);

		// set time anyway to current time and default duration (in case user changes mind)
		var now = AjxDateUtil.roundTimeMins(new Date(), 30);
		this._startTimeSelect.set(now);

		now.setTime(now.getTime() + ZmCalViewController.DEFAULT_APPOINTMENT_DURATION);
		this._endTimeSelect.set(now);

		// bug 9969: remove the all day duration for display
		// HACK: This is a total hack because there are two types
		//       of all day appointment objects. Non-recurring ones
		//       have their start time set to the current time (for
		//       some unknown reason) and their end time set to the
		//       the start time + the default appointment duration.
		//       Recurring appointments have their start time and
		//       end time set to 00:00:00 which means that when
		//       editing it will look like the event ends on the
		//       day *following* the actual end day. So this hack
		//       is here until I can figure out why the two are
		//       different.
        var isNewFromQuickAdd = mode == ZmAppt.MODE_NEW_FROM_QUICKADD;
        if (!isNewFromQuickAdd && ed.getHours() == 0 && ed.getMinutes() == 0 && ed.getSeconds() == 0) {
			ed.setHours(-12);
		}
	} else {
		this._startTimeSelect.set(appt.getStartDate());
		this._endTimeSelect.set(appt.getEndDate());
	}
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);

	this._resetTimezoneSelect(appt, isAllDayAppt);
	this._resetCalendarSelect(appt, mode);

	// re-enable all input fields
	this.enableInputs(true);

	// lets always attempt to populate even if we're dealing w/ a "new" appt
	this._populateForEdit(appt, mode);

	// disable the recurrence select object for editing single instance
	this._enableRepeat(mode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE);

	// save the original form data in its initialized state
	this._origFormValue = this._formValue(false);
	this._origFormValueMinusAttendees = this._formValue(true);
};

/**
 * sets any recurrence rules w/in given ZmAppt object
*/
ZmApptTabViewPage.prototype._getRecurrence =
function(appt) {
	var repeatType = this._repeatSelect.getValue();

	if (this._recurDialog && repeatType == "CUS") {
		appt.repeatType = this._recurDialog.getSelectedRepeatValue();

		switch (appt.repeatType) {
			case "DAI": this._recurDialog.setCustomDailyValues(appt); break;
			case "WEE": this._recurDialog.setCustomWeeklyValues(appt); break;
			case "MON": this._recurDialog.setCustomMonthlyValues(appt); break;
			case "YEA": this._recurDialog.setCustomYearlyValues(appt); break;
		}

		// set the end recur values
		this._recurDialog.setRepeatEndValues(appt);
	} else {
		appt.repeatType = repeatType != "CUS" ? repeatType : "NON";
	}
};

ZmApptTabViewPage.prototype._populateForEdit =
function(appt, mode) {
	// set subject/location
	this._subjectField.setValue(appt.getName());
	this._attInputField[ZmAppt.LOCATION].setValue(appt.getLocation());

	// TODO: set calendar this appointment belongs to

	// select objects
	this._showAsSelect.setSelectedValue(appt.freeBusy);
	this._repeatSelect.setSelectedValue(appt.repeatType);

	// recurrence string
	if (appt.isCustomRecurrence()) {
		this._repeatDescField.innerHTML = appt._getRecurrenceBlurbForSave();
	} else {
		this._repeatDescField.innerHTML = appt.repeatType != "NON" ? AjxStringUtil.htmlEncode(ZmMsg.customize) : "";
	}

	// attendees
	var attendees = appt.getAttendees();
	if (attendees && attendees.length) {
		this._attInputField[ZmAppt.PERSON].setValue(appt.getAttendeesText());
		this._attendees[ZmAppt.PERSON] = AjxVector.fromArray(attendees);
		var tp = this.parent.getTabPage(ZmApptComposeView.TAB_ATTENDEES);
		if (tp) {
			tp._chooser.transfer(attendees, null, true);
		}
	}

	// locations (location field set above)
	var locations = appt.getLocations();
	if (locations && locations.length) {
		this._attendees[ZmAppt.LOCATION] = AjxVector.fromArray(locations);
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_LOCATIONS);
		if (tp) {
			if (locations.length > 1) {
				tp.enableMultipleLocations(true);
			}
			tp._chooser.transfer(locations, null, true);
		}
	}

	// equipment
	var equipment = appt.getEquipment();
	if (equipment && equipment.length && this._attInputField[ZmAppt.EQUIPMENT]) {
		this._attInputField[ZmAppt.EQUIPMENT].setValue(appt.getEquipmentText());
		this._attendees[ZmAppt.EQUIPMENT] = AjxVector.fromArray(equipment);
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_EQUIPMENT);
		if (tp) {
			tp._chooser.transfer(equipment, null, true);
		}
	}

	// attachments
	var attachList = appt.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			this.addAttachmentField(appt, attachList[i]);
	}

	// set notes/content (based on compose mode per user prefs)
	if (this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED) &&
		(this._appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT) ||
		 this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML))
	{
		this.setComposeMode(DwtHtmlEditor.HTML);
		this._notesHtmlEditor.setContent(appt.getNotesPart(ZmMimeTable.TEXT_HTML));
	} else {
		this.setComposeMode(DwtHtmlEditor.TEXT);
		this._notesHtmlEditor.setContent(appt.getNotesPart(ZmMimeTable.TEXT_PLAIN));
	}
};

ZmApptTabViewPage.prototype._enableRepeat =
function(enable) {
	if (enable) {
		this._repeatSelect.enable();
		this._repeatDescField.className = "FakeAnchor";
	}  else {
		this._repeatSelect.disable();
		this._repeatDescField.className = "DisabledText";
	}
	this._repeatSelectDisabled = !enable;
	this._repeatSelect.setAlign(DwtLabel.ALIGN_LEFT); // XXX: hack b/c bug w/ DwtSelect
};

ZmApptTabViewPage.prototype._createHTML =
function() {

	this._attTdId = {};
	for (var t = 0; t < this._attTypes.length; t++) {
		this._attTdId[this._attTypes[t]] = Dwt.getNextId();
	}

	this._createApptHtml();
	this._createInputs();
	this._createSelects();
	this._createButtons();
	this._cacheFields();
	this._initNotesHtmlEditor();
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		this._initAutocomplete();
	this._addEventHandlers();
};

ZmApptTabViewPage.prototype._createApptHtml =
function() {
	var dims = this.parent.getSize();
	var rowHeight = AjxEnv.isIE ? 150 : 110;
	this._notesHtmlEditorId = Dwt.getNextId();

	var html = [];
	var i = 0;

	html[i++] = "<div><table border=0 width=100% style='table-layout:fixed; height:";
	html[i++] = dims.y - 30;
	html[i++] = "px'><colgroup><col width='";
	html[i++] = AjxEnv.is800x600orLower ? "235" : "335";
	html[i++] = "' /><col /></colgroup>";
	html[i++] = "<tr style='height:";
	html[i++] = rowHeight;
	html[i++] = "px'><td valign=top><fieldset><legend>";
	html[i++] = ZmMsg.details;
	html[i++] = "</legend><div>";
	html[i++] = this._getDetailsHtml();
	html[i++] = "</div></fieldset></td>";
	html[i++] = "<td valign=top><fieldset><legend>";
	html[i++] = ZmMsg.time;
	html[i++] = "</legend><div style='overflow:hidden; ";
	html[i++] = AjxEnv.isIE ? " width:99%'>" : "'>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr><tr><td colspan=2>";
	html[i++] = this._getSchedulingHtml();
	html[i++] = "</td></tr></table></div><div id='";
	html[i++] = this._notesHtmlEditorId;
	html[i++] = "'></div>";
	this.getHtmlElement().innerHTML = html.join("");
};

ZmApptTabViewPage.prototype._createInputs = 
function() {
	var width = AjxEnv.is800x600orLower ? "150" : "250";

	this._subjectField = new DwtInputField({parent: this, type:DwtInputField.STRING,
											errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											validationStyle: DwtInputField.CONTINUAL_VALIDATION,
											skipCaretHack:true});
	this._subjectField.setRequired();
	Dwt.setSize(this._subjectField.getInputElement(), width, "22px");
	this._subjectField.reparentHtmlElement(this._subjectFieldId);
	delete this._subjectFieldId;

	this._attInputField = {};
	this._attInputCurVal = {};
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		var params = {parent: this, type: DwtInputField.STRING, skipCaretHack:true};
		if (type == ZmAppt.PERSON) {
			params.rows = 3;
		}
		var input = this._attInputField[type] = new DwtInputField(params);
		var inputEl = input.getInputElement();
		var w = (type == ZmAppt.LOCATION) ? width : "100%";
		Dwt.setSize(inputEl, w, (type == ZmAppt.PERSON) ? "50px" : "22px");
		inputEl._attType = type;
		input.reparentHtmlElement(this._attTdId[type]);
		this._attInputCurVal[type] = "";
	}
};

ZmApptTabViewPage.prototype._createSelects =
function() {
	// create selects for details section
	this._calendarSelect = new DwtSelect(this);
	this._calendarSelect.reparentHtmlElement(this._calSelectId);
	delete this._calSelectId;

	this._showAsSelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptTabViewPage.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}
	this._showAsSelect.reparentHtmlElement(this._showAsSelectId);
	delete this._showAsSelectId;

	var timeSelectListener = new AjxListener(this, this._timeChangeListener);

    this._startTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.START);
	this._startTimeSelect.reparentHtmlElement(this._startTimeSelectId);
	this._startTimeSelect.addChangeListener(timeSelectListener);
	delete this._startTimeSelectId;

	this._endTimeSelect = new ZmTimeSelect(this, ZmTimeSelect.END);
	this._endTimeSelect.reparentHtmlElement(this._endTimeSelectId);
	this._endTimeSelect.addChangeListener(timeSelectListener);
	delete this._endTimeSelectId;

    var timezoneListener = new AjxListener(this, this._timezoneListener);

    this._tzoneSelect = new DwtSelect(this);
	this._tzoneSelect.reparentHtmlElement(this._tzoneSelectId);
    this._tzoneSelect.addChangeListener(timezoneListener);
    delete this._tzoneSelectId;
    // NOTE: tzone select is initialized later

	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	this._repeatSelect.reparentHtmlElement(this._repeatSelectId);
	delete this._repeatSelectId;
};

ZmApptTabViewPage.prototype._initTzSelect = function() {
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

ZmApptTabViewPage.prototype._createButtons =
function() {
	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmApptViewHelper.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener, this._appCtxt);
	this._endDateButton = ZmApptViewHelper.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener, this._appCtxt);
};

ZmApptTabViewPage.prototype._getDetailsHtml =
function() {

	this._subjectFieldId 		= Dwt.getNextId();
	this._calLabelId 			= Dwt.getNextId();
	this._calSelectId 			= Dwt.getNextId();
	this._showAsSelectId 		= Dwt.getNextId();

	var html = [];
	var i = 0;

	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr><td width=1% class='ZmFieldLabelRight'>*&nbsp;";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td colspan=5 id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=5 id='";
	html[i++] = this._attTdId[ZmAppt.LOCATION];
	html[i++] = "'></td></tr>";
	html[i++] = "<tr>";
	html[i++] = "<td width=1% class='ZmFieldLabelRight'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td width=1% id='";
	html[i++] = this._showAsSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr>";
	html[i++] = "<td width=1% class='ZmFieldLabelRight' id='";
	html[i++] = this._calLabelId;
	html[i++] = "'>";
	html[i++] = ZmMsg.calendar;
	html[i++] = ":</td><td id='"
	html[i++] = this._calSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";
	html[i++] = "</td></tr></table>";

	return html.join("");
};

ZmApptTabViewPage.prototype._getTimeHtml =
function() {
	var currDate = AjxDateUtil.simpleComputeDateStr(new Date());
	this._startDateFieldId 		= Dwt.getNextId();
	this._startMiniCalBtnId 	= Dwt.getNextId();
	this._startTimeSelectId 	= Dwt.getNextId();
	this._allDayCheckboxId 		= Dwt.getNextId();
	this._endDateFieldId 		= Dwt.getNextId();
	this._endMiniCalBtnId 		= Dwt.getNextId();
	this._endTimeSelectId 		= Dwt.getNextId();
	this._tzoneSelectId 		= Dwt.getNextId();
	this._repeatSelectId 		= Dwt.getNextId();
	this._repeatDescId 			= Dwt.getNextId();

	var html = [];
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td></td><td width=1%>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input type='checkbox' id='";
	html[i++] = this._allDayCheckboxId;
	html[i++] = "'></td><td class='ZmFieldLabelLeft'>&nbsp;";
	html[i++] = ZmMsg.allDayEvent;
	html[i++] = "</td></tr></table></td><td></td><td colspan=10 id='";
	html[i++] = this._tzoneSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmFieldLabelRight'>";
	html[i++] = ZmMsg.start;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input autocomplete='off' style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._startDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._startMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td class='ZmFieldLabelCenter'>@</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr><tr><td class='ZmFieldLabelRight'>";
	html[i++] = ZmMsg.end;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input autocomplete='off' style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._endDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._endMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td class='ZmFieldLabelCenter'>@</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";
	html[i++] = "<tr><td valign=top class='ZmFieldLabelRight' style='line-height:22px'>";
	html[i++] = ZmMsg.repeat;
	html[i++] = ":</td><td valign=top colspan=2 id='";
	html[i++] = this._repeatSelectId;
	html[i++] = "'><td colspan=10><span id='";
	html[i++] = this._repeatDescId;
	html[i++] = "' onmouseout='this.style.cursor=\"default\"' style='text-decoration:underline;'";
	html[i++] = "></span></td>";
	html[i++] = "</tr>";
	html[i++] = "</table>";

	return html.join("");
};

ZmApptTabViewPage.prototype._getSchedulingHtml =
function() {

	var html = [];
	var i = 0;

	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr>";
	html[i++] = "<td width='1%' align='right' valign='top' class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.attendees;
	html[i++] = ":</td>";
	html[i++] = "<td id='";
	html[i++] = this._attTdId[ZmAppt.PERSON];
	html[i++] = "'></td>";
	html[i++] = "</tr>";

	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		html[i++] = "<tr>";
		html[i++] = "<td width=1% align=right class='ZmApptTabViewPageField'>";
		html[i++] = ZmMsg.resources;
		html[i++] = ":</td>";

		html[i++] = "<td id='";
		html[i++] = this._attTdId[ZmAppt.EQUIPMENT];
		html[i++] = "'></td>";
		html[i++] = "</tr>";
	}

	html[i++] = "</table>";

	return html.join("");
};

ZmApptTabViewPage.prototype._initNotesHtmlEditor =
function() {
	// add notes html editor
	this._notesHtmlEditor = new ZmHtmlEditor(this, null, null, this._composeMode, this._appCtxt);
	this._notesHtmlEditor.reparentHtmlElement(this._notesHtmlEditorId);
	delete this._notesHtmlEditorId;
};

ZmApptTabViewPage.prototype._initAutocomplete =
function() {
	var shell = this._appCtxt.getShell();
	var acCallback = new AjxCallback(this, this._autocompleteCallback);
	this._acList = {};

	// autocomplete for attendees
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contactsClass = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
		var contactsLoader = contactsClass.getContactList;
		var params = {parent: shell, dataClass: contactsClass, dataLoader: contactsLoader,
					  matchValue: ZmContactList.AC_VALUE_FULL, compCallback: acCallback};
		this._acContactsList = new ZmAutocompleteListView(params);
		this._acContactsList.handle(this._attInputField[ZmAppt.PERSON].getInputElement());
		this._acList[ZmAppt.PERSON] = this._acContactsList;
	}
	// autocomplete for locations/equipment
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var resourcesClass = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP);
		var params = {parent: shell, dataClass: resourcesClass, dataLoader: resourcesClass.getLocations,
					  matchValue: ZmContactList.AC_VALUE_NAME, compCallback: acCallback};
		this._acLocationsList = new ZmAutocompleteListView(params);
		this._acLocationsList.handle(this._attInputField[ZmAppt.LOCATION].getInputElement());
		this._acList[ZmAppt.LOCATION] = this._acLocationsList;
		params.dataLoader = resourcesClass.getEquipment;
		this._acEquipmentList = new ZmAutocompleteListView(params);
		this._acEquipmentList.handle(this._attInputField[ZmAppt.EQUIPMENT].getInputElement());
		this._acList[ZmAppt.EQUIPMENT] = this._acEquipmentList;
	}
};

ZmApptTabViewPage.prototype._autocompleteCallback =
function(text, el, match) {
	if (!match) {
		DBG.println(AjxDebug.DBG1, "ZmApptTabViewPage: match empty in autocomplete callback; text: " + text);
		return;
	}
	var attendee = match.item;
	var type = el._attType;
	this.parent.updateAttendees(attendee, type, ZmApptComposeView.MODE_ADD);
};

ZmApptTabViewPage.prototype._addEventHandlers =
function() {
	var tvpId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmApptTabViewPage._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmApptTabViewPage._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmApptTabViewPage._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmApptTabViewPage._onChange);

	this._allDayCheckbox._tabViewPageId = this._repeatDescField._tabViewPageId = tvpId;
	this._startDateField._tabViewPageId = this._endDateField._tabViewPageId = tvpId;
	
	for (var i in this._attInputField) {
		var inputEl = this._attInputField[i].getInputElement();
		Dwt.setHandler(inputEl, DwtEvent.ONFOCUS, ZmApptTabViewPage._onFocus);
		Dwt.setHandler(inputEl, DwtEvent.ONBLUR, ZmApptTabViewPage._onBlur);
		inputEl._tabViewPageId = tvpId;
	}
};

// cache all input fields so we dont waste time traversing DOM each time
ZmApptTabViewPage.prototype._cacheFields =
function() {
	this._calLabelField 	= document.getElementById(this._calLabelId); 			delete this._calLabelId;
	this._startDateField 	= document.getElementById(this._startDateFieldId); 		delete this._startDateFieldId;
	this._endDateField 		= document.getElementById(this._endDateFieldId);	 	delete this._endDateFieldId;
	this._allDayCheckbox 	= document.getElementById(this._allDayCheckboxId); 		// dont delete!
	this._repeatDescField 	= document.getElementById(this._repeatDescId); 			// dont delete!
};

ZmApptTabViewPage.prototype._resetTimezoneSelect =
function(appt, isAllDayAppt) {
	var showTimezone = this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) && !isAllDayAppt;
    showTimezone = showTimezone || appt.timezone != AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), showTimezone);
	this._tzoneSelect.setSelectedValue(appt.getTimezone());
};

ZmApptTabViewPage.prototype._resetCalendarSelect =
function(appt, mode) {
	// get all folders w/ view set to "Appointment" we received from initial refresh block
	var calTreeData = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.CALENDAR);
	if (calTreeData && calTreeData.root) {
		this._calendarSelect.clearOptions();
		this._calendarOrgs = {};
		var children = calTreeData.root.children.getArray();
		var len = children.length;
		var apptCal;
		for (var i = 0; i < len; i++) {
			var cal = children[i];
			if (cal.id == appt.folderId) {
				apptCal = cal;
				break;
			}
		}
		var visible = len > 1;
		var enabled = (mode == ZmAppt.MODE_NEW || mode == ZmAppt.MODE_NEW_FROM_QUICKADD || !apptCal.link);
		if (visible) {
			for (var i = 0; i < len; i++) {
				var cal = children[i];
				this._calendarOrgs[cal.id] = cal.owner;
				if (enabled) {
					// don't show calendar if remote or don't have write perms
					if (cal.isFeed()) continue;
					if (cal.link && cal.shares && cal.shares.length > 0 && !cal.shares[0].isWrite()) continue;
				}
				this._calendarSelect.addOption(cal.getName(), false, cal.id);
			}
		}
		Dwt.setVisibility(this._calendarSelect.getHtmlElement(), visible);
		Dwt.setVisibility(this._calLabelField, visible);
		if (enabled) {
			this._calendarSelect.enable();
		}
		else {
			this._calendarSelect.disable();
		}
	}
	// always reset the width of this select widget
	this._calendarSelect.setSelectedValue(appt.getFolderId());
};

ZmApptTabViewPage.prototype._initAttachContainer =
function() {
	// create new table row which will contain parent fieldset
	var table = this.getHtmlElement().firstChild.firstChild;
	this._attachmentRow = table.insertRow(2);
	this._attachmentRow.style.height = AjxEnv.isIE ? "auto" : 22;
	var cell = this._attachmentRow.insertCell(-1);
	cell.colSpan = 2;

	// create fieldset and append to given table cell
	var html = [];
	var i = 0;
	html[i++] = "<fieldset class='ZmFieldset'><legend class='ZmLegend'>";
	html[i++] = ZmMsg.attachments;
	html[i++] = "</legend>";

	this._uploadFormId = Dwt.getNextId();
	this._attachDivId = Dwt.getNextId();

	html[i++] = "<form style='margin:0;padding:0' method='POST' action='";
	html[i++] = (location.protocol + "//" + document.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI));
	html[i++] = "' id='";
	html[i++] = this._uploadFormId;
	html[i++] = "' enctype='multipart/form-data'><div id='";
	html[i++] = this._attachDivId;
	html[i++] = "' style='overflow:auto'></div></form>";

	html[i++] = "</fieldset>";
	cell.innerHTML = html.join("");
};

// Returns true if any of the attachment fields are populated
ZmApptTabViewPage.prototype._gotAttachments =
function() {
	var atts = document.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;

	return false;
};

ZmApptTabViewPage.prototype._removeAttachment =
function(removeId) {
	// get document of attachment's iframe
	var removeSpan = document.getElementById(removeId);
	if (removeSpan) {
		// have my parent kill me
		removeSpan._parentDiv.parentNode.removeChild(removeSpan._parentDiv);
		if ((this._attachCount-1) == 0) {
			this._removeAllAttachments();
		} else {
			this._attachCount--;
		}
		if (this._attachCount == ZmApptTabViewPage.SHOW_MAX_ATTACHMENTS)
			this._attachDiv.style.height = "";
		this._resizeNotes();
	}
};

ZmApptTabViewPage.prototype._removeAllAttachments =
function() {
	if (this._attachCount == 0) return;

	// let's be paranoid and really cleanup
	delete this._uploadFormId;
	delete this._attachDivId;
	delete this._attachRemoveId;
	delete this._attachDiv;
	this._attachDiv = this._attachRemoveId = this._attachDivId = this._uploadFormId = null;
	// finally, nuke the whole table row
	var table = this.getHtmlElement().firstChild.firstChild;
	table.deleteRow(2);
	delete this._attachmentRow;
	this._attachmentRow = null;
	// reset any attachment related vars
	this._attachCount = 0;
};

ZmApptTabViewPage.prototype._showTimeFields =
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	if (this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE))
		Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), show);
	// also show/hide the "@" text
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement().parentNode.previousSibling, show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement().parentNode.previousSibling, show);
};

ZmApptTabViewPage.prototype._showRecurDialog =
function(repeatType) {
	if (!this._repeatSelectDisabled) {
		if (!this._recurDialog) {
			this._recurDialog = new ZmApptRecurDialog(this._appCtxt.getShell(), this._appCtxt);
			this._recurDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._recurOkListener));
			this._recurDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._recurCancelListener));
		}
		var type = repeatType || this._recurDialogRepeatValue;
		var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
		this._recurDialog.initialize(sd, ed, type, this._appt);
		this._recurDialog.popup();
	}
};

// Returns a string representing the form content
ZmApptTabViewPage.prototype._formValue =
function(excludeAttendees) {
	var vals = [];

	vals.push(this._subjectField.getValue());
	vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.LOCATION].getArray(), ZmAppt.LOCATION));
	vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.EQUIPMENT].getArray(), ZmAppt.EQUIPMENT));
	vals.push(this._showAsSelect.getValue());
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
		vals.push(ZmApptViewHelper.getAttendeesString(this._attendees[ZmAppt.PERSON].getArray(), ZmAppt.PERSON));
	}
	vals.push(this._notesHtmlEditor.getContent());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

ZmApptTabViewPage.prototype._resizeNotes =
function() {
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	if (this._bodyFieldId != bodyFieldId) {
		this._bodyFieldId = bodyFieldId;
		this._bodyField = document.getElementById(this._bodyFieldId);
	}

	var size = this.getSize();
	if (size.x <= 0 || size.y <= 0)
		return;

	var topDiv = this.getHtmlElement().firstChild;
	var topHeight = Dwt.getSize(topDiv).y;
	var rowHeight = size.y - topHeight;
	var fudge = (this._composeMode == DwtHtmlEditor.HTML) ? 50 : 15;
	Dwt.setSize(this._bodyField, Dwt.DEFAULT, rowHeight - fudge);
};

ZmApptTabViewPage.prototype._submitAttachments =
function() {
	var callback = new AjxCallback(this, this._attsDoneCallback);
	var um = this._appCtxt.getUploadManager();
	window._uploadManager = um;
	um.execute(callback, document.getElementById(this._uploadFormId));
};

ZmApptTabViewPage.prototype._handleRepeatDescFieldHover =
function(ev, isHover) {
	if (isHover) {
		this._repeatDescField.style.cursor = this._repeatSelectDisabled
			? "default" : "pointer";

		if (this._rdfTooltip == null) {
			this._rdfTooltip = this._appCtxt.getShell().getToolTip();
		}

		var content = "<div style='width:300px'>" + this._repeatDescField.innerHTML + "</div>";
		this._rdfTooltip.setContent(content);
		this._rdfTooltip.popup((ev.pageX || ev.clientX), (ev.pageY || ev.clientY));
	} else {
		if (this._rdfTooltip) {
			this._rdfTooltip.popdown();
		}
	}
};


// Listeners

ZmApptTabViewPage.prototype._dateButtonListener =
function(ev) {
	var calDate = ev.item == this._startDateButton
		? AjxDateUtil.simpleParseDateStr(this._startDateField.value)
		: AjxDateUtil.simpleParseDateStr(this._endDateField.value);

	// if date was input by user and its foobar, reset to today's date
	if (calDate == null || isNaN(calDate)) {
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

ZmApptTabViewPage.prototype._dateCalSelectionListener =
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

ZmApptTabViewPage.prototype._repeatChangeListener =
function(ev) {
	var newSelectVal = ev._args.newValue;
	if (newSelectVal == "CUS") {
		this._oldRepeatValue = ev._args.oldValue;
		this._showRecurDialog();
	} else {
		this._repeatDescField.innerHTML = newSelectVal != "NON" ? AjxStringUtil.htmlEncode(ZmMsg.customize) : "";
	}
	this.notifyListeners(ZmApptTabViewPage._REPEAT_CHANGE, ev);
};

ZmApptTabViewPage.prototype._recurOkListener =
function(ev) {
	var popdown = true;
	this._recurDialogRepeatValue = this._recurDialog.getSelectedRepeatValue();
	if (this._recurDialogRepeatValue == "NON") {
		this._repeatSelect.setSelectedValue(this._recurDialogRepeatValue);
		this._repeatDescField.innerHTML = "";
	} else {
		if (this._recurDialog.isValid()) {
			this._repeatSelect.setSelectedValue("CUS");
			// update the recur language
			var tempAppt = ZmAppt.quickClone(this._appt);
			this._getRecurrence(tempAppt);
			this._repeatDescField.innerHTML = tempAppt._getRecurrenceBlurbForSave();
		} else {
			// give feedback to user about errors in recur dialog
			popdown = false;
		}
	}

	if (popdown)
		this._recurDialog.popdown();
};

ZmApptTabViewPage.prototype._recurCancelListener =
function(ev) {
	// reset the selected option to whatever it was before user canceled
	this._repeatSelect.setSelectedValue(this._oldRepeatValue);
	this._recurDialog.popdown();
};

ZmApptTabViewPage.prototype._timeChangeListener =
function(ev) {
	ZmTimeSelect.adjustStartEnd(ev, this._startTimeSelect, this._endTimeSelect, this._startDateField, this._endDateField);
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
};

ZmApptTabViewPage.prototype._timezoneListener =
function(ev) {
	ZmApptViewHelper.getDateInfo(this, this._dateInfo);
};

/*
* Sets the values of the attendees input fields to reflect the current lists
* of attendees.
*/
ZmApptTabViewPage.prototype._setAttendees =
function() {
	for (var t = 0; t < this._attTypes.length; t++) {
		var type = this._attTypes[t];
		var attendees = this._attendees[type].getArray();
		var list = [];
		for (var i = 0; i < attendees.length; i++) {
			list.push(attendees[i].getAttendeeText(type));
		}
		var val = list.length ? list.join(ZmAppt.ATTENDEES_SEPARATOR) : "";
		this._attInputField[type].setValue(val);
	}
};

ZmApptTabViewPage.prototype._handleAttendeeField =
function(type, useException) {
	if (!this._activeInputField) return;

	var value = this._attInputField[type].getValue();
	var attendees = new AjxVector();
	var items = ZmEmailAddress.split(value);

	for (var i = 0; i < items.length; i++) {
		var item = AjxStringUtil.trim(items[i]);
		if (!item) continue;

		// see if it's an attendee we already know about (added via autocomplete or other tab)
		var attendee = this._getAttendeeByName(type, item);
		attendee = attendee || this._getAttendeeByItem(item, type);
		if (!attendee) {
			attendee = ZmApptViewHelper.getAttendeeFromItem(this._appCtxt, item, type);
		}
		if (attendee) {
			attendees.add(attendee);
		}
	}
	// *always* force replace of attendees list with what we've found
	this.parent.updateAttendees(attendees, type);
};

ZmApptTabViewPage.prototype._getAttendeeByName =
function(type, name) {
	var a = this._attendees[type].getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i].getFullName() == name) {
			return a[i];
		}
	}
	return null;
};

ZmApptTabViewPage.prototype._getAttendeeByItem =
function(item, type) {
	var attendees = this._attendees[type].getArray();
	for (var i = 0; i < attendees.length; i++) {
		var value = (type == ZmAppt.PERSON) ? attendees[i].getEmail() : attendees[i].getFullName();
		if (item == value) {
			return attendees[i];
		}
	}
	return null;
};

// Callbacks

ZmApptTabViewPage.prototype._attsDoneCallback =
function(status, attId) {
	DBG.println(AjxDebug.DBG1, "Attachments: status = " + status + ", attId = " + attId);
	if (status == 200) {
		this._removeAllAttachments();
		var acc = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getApptComposeController();
		acc.saveAppt(attId);
	} else {
		DBG.println(AjxDebug.DBG1, "attachment error: " + status);
	}
};

ZmApptTabViewPage.prototype._emailValidator = 
function(value) {
	// first parse the value string based on separator
	var attendees = AjxStringUtil.trim(value);
	if (attendees.length > 0) {
		var addrs = ZmEmailAddress.parseEmailString(attendees);
		if (addrs.bad.size() > 0) {
			throw ZmMsg.errorInvalidEmail2;
		}
	}

	return value;
};

ZmApptTabViewPage.prototype._getDefaultFocusItem = 
function() {
	return this._subjectField;
};

// Static methods

ZmApptTabViewPage._onClick =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);

	// figure out which input field was clicked
	if (el.id == tvp._allDayCheckboxId) {
		tvp._showTimeFields(el.checked ? false : true);
	} else if (el.id == tvp._repeatDescId) {
		tvp._oldRepeatValue = tvp._repeatSelect.getValue();
		tvp._showRecurDialog(tvp._oldRepeatValue);
	} else if (el.id.indexOf("_att_") != -1) {
		tvp._removeAttachment(el.id);
	}
};

ZmApptTabViewPage._onKeyDown =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	if (el.id.indexOf("_att_") != -1) {
		// ignore enter key press in IE otherwise it tries to send the attachment!
		var key = DwtKeyEvent.getCharCode(ev);
		return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
	}
};

ZmApptTabViewPage._onMouseOver =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	if (el == tvp._repeatDescField) {
		tvp._handleRepeatDescFieldHover(ev, true);
	}
};

ZmApptTabViewPage._onMouseOut = 
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	if (el == tvp._repeatDescField) {
		tvp._handleRepeatDescFieldHover(ev, false);
	}
}

ZmApptTabViewPage._onChange =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	ZmApptViewHelper.handleDateChange(tvp._startDateField, tvp._endDateField, (el == tvp._startDateField));
};

ZmApptTabViewPage._onFocus = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	tvp._activeInputField = el._attType;
	tvp._attInputCurVal[el._attType] = el.value;
};

ZmApptTabViewPage._onBlur = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	tvp._handleAttendeeField(el._attType);
	tvp._activeInputField = null;
};
