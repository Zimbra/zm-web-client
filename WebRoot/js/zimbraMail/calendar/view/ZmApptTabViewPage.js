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
* Creates a new tab view that can be used to overload DwtTabView base class methods
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
* @param appCtxt 		app context
*/
function ZmApptTabViewPage(parent, appCtxt) {
	DwtTabViewPage.call(this, parent);

	this.setScrollStyle(DwtControl.CLIP);
	this._appCtxt = appCtxt;
	this._rendered = false;
	this._contactsSupported = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) || this._appCtxt.get(ZmSetting.GAL_ENABLED);

	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	this._composeMode = this._defaultComposeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	this._repeatSelectDisabled = false;
	this._attachCount = 0;
};

ZmApptTabViewPage.prototype = new DwtTabViewPage;
ZmApptTabViewPage.prototype.constructor = ZmApptTabViewPage;

ZmApptTabViewPage.prototype.toString =
function() {
	return "ZmApptTabViewPage";
};


// Consts

ZmApptTabViewPage.UPLOAD_FIELD_NAME = "attUpload";
ZmApptTabViewPage.CONTACT_PICKER_BID = ZmEmailAddress.TO;

ZmApptTabViewPage.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "F", 	selected: false },
	{ label: ZmMsg.replyTentative, 		value: "T", 	selected: false },
	{ label: ZmMsg.busy, 				value: "B", 	selected: true  },
	{ label: ZmMsg.outOfOffice,			value: "O", 	selected: false }];


// Public

ZmApptTabViewPage.prototype.showMe =
function() {
	if (this._rendered)
		this.parent.tabSwitched(this._tabKey);

	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);
};

ZmApptTabViewPage.prototype.getAppt =
function(attId) {
	// attempt to submit attachments first!
	if (!attId && this._gotAttachments()) {
		this._submitAttachments();
		return null;
	}

	// create a copy of the appointment so we dont muck w/ the original
	var appt = ZmAppt.quickClone(this._appt);
	appt.setViewMode(this._mode);

	// save field values of this view w/in given appt
	appt.setName(this._subjectField.value);
	appt.location = this._locationField.value;
	appt.freeBusy = this._showAsSelect.getValue();
	var calId = this._calendarSelect.getValue();
	appt.setFolderId(calId);
	appt.setOrganizer(this._calendarOrgs[calId]);

	// set the start date by aggregating start date/time fields
	var startDate = this._startDateField.value;
	var endDate = this._endDateField.value;
	if (this._allDayCheckbox.checked) {
		appt.setAllDayEvent(true);
	} else {
		appt.setAllDayEvent(false);
		startDate = startDate + " " + this._startTimeSelect.getValue();
		endDate = endDate + " " + this._endTimeSelect.getValue();
	}
	appt.setStartDate(startDate);
	appt.setEndDate(endDate);
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
		htmlPart.setContent(this._notesHtmlEditor.getContent());
		top.children.add(htmlPart);
	} else {
		top.setContentType(ZmMimeTable.TEXT_PLAIN);
		top.setContent(this._notesHtmlEditor.getContent());
	}
	appt.attendees = this._attendeesField.value;
	appt.notesTopPart = top;

	// set any recurrence rules
	this._getRecurrence(appt);

	return appt;
};

ZmApptTabViewPage.prototype.initialize =
function(appt, mode) {
	this._appt = appt;

	if (!this._rendered) {
		this._createHTML();
		this._rendered = true;
		this.setComposeMode();
	}

	this._reset(appt, (mode || ZmAppt.MODE_NEW));

	this._mode = mode == ZmAppt.MODE_NEW_FROM_QUICKADD || mode == null
		? ZmAppt.MODE_NEW : mode;

	// save the original form data in its initialized state
	this._origFormValue = this._formValue();
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
	this._subjectField.value = "";
	this._locationField.value = "";
	this._attendeesField.value = "";
	this._repeatDescField.innerHTML = "";
	this._notesHtmlEditor.clear();

	// reinit non-time sensitive selects option values
	this._showAsSelect.setSelectedValue(ZmApptTabViewPage.SHOWAS_OPTIONS[2].value);
	this._repeatSelect.setSelectedValue(ZmApptViewHelper.REPEAT_OPTIONS[0].value);
	this._allDayCheckbox.checked = false;
	this._showTimeFields(true);

	// remove attachments if any were added
	this._removeAllAttachments();

	// disable all input fields
	this.enableInputs(false);
};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmApptTabViewPage.prototype.enableInputs =
function(bEnableInputs) {
	this._subjectField.disabled = !bEnableInputs;
	this._locationField.disabled = !bEnableInputs;
	this._attendeesField.disabled = !bEnableInputs;
	this._startDateField.disabled = !bEnableInputs;
	this._endDateField.disabled = !bEnableInputs;
};

ZmApptTabViewPage.prototype.isDirty =
function() {
	return (this._gotAttachments()) ||
		   (this._formValue() != this._origFormValue) ||
		   (this._subjectField.value != "");
};

ZmApptTabViewPage.prototype.isValid =
function() {

	// check for required subject
	var subj = AjxStringUtil.trim(this._subjectField.value);
	var isValid = subj != null && subj.length > 0;

	// check proper dates..
	if (isValid) {
		var sd = this._startDateField.value;
		var ed = this._endDateField.value;
		if (!this._allDayCheckbox.checked) {
			sd += " " + this._startTimeSelect.getValue();
			ed += " " + this._endTimeSelect.getValue();
		}
		var startDate = new Date(sd);
		var endDate = new Date(ed);
		isValid = startDate.valueOf() <= endDate.valueOf();
	}

	if (isValid) {
		// TODO: check proper attendees
	}

	return isValid;
};

ZmApptTabViewPage.prototype.getComposeMode =
function() {
	return this._composeMode;
};

ZmApptTabViewPage.prototype.setComposeMode =
function(composeMode) {
	this._composeMode = composeMode || this._composeMode;
	this._notesHtmlEditor.setMode(this._composeMode, true);

	// dont forget to reset the body field Id and object ref
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	if (this._bodyFieldId != bodyFieldId) {
		this._bodyFieldId = bodyFieldId;
		this._bodyField = Dwt.getDomObj(this.getDocument(), this._bodyFieldId);
	}

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

ZmApptTabViewPage.prototype.updateTimeField =
function(newStartValue, newEndValue) {
	this._startTimeSelect.setSelectedValue(newStartValue);
	this._endTimeSelect.setSelectedValue(newEndValue);
};

ZmApptTabViewPage.prototype.updateAttendeesField =
function(attendees) {
	this._attendeesField.value = attendees;
};

ZmApptTabViewPage.prototype.reEnableDesignMode =
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._notesHtmlEditor.reEnableDesignMode();
};

/**
 * Adds an attachment (file input field) to the appointment view. If none
 * already exist, creates the attachments container. If @attach param provided,
 * user is opening an existing appointment w/ an attachment and therefore
 * display differently
 */
ZmApptTabViewPage.prototype.addAttachmentField =
function(appt, attach) {
	if (this._attachCount == 0) {
		this._initAttachIframe();
	}

	this._attachCount++;

	// add file input field
	var doc = this.getDocument();
	var div = doc.createElement("div");

	var attachRemoveId = "_att_" + Dwt.getNextId();
	var attachInputId = "_att_" + Dwt.getNextId();

	if (attach) {
		// skip setting the icon since the attachment field is inside an iframe
		div.innerHTML = appt.getAttachListHtml(attach, true, false);
	} else {
		var html = new Array();
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
		this._attachDiv = Dwt.getDomObj(doc, this._attachDivId);
	this._attachDiv.appendChild(div);

	if (attach == null) {
		// add event handlers as necessary
		var tvpId = AjxCore.assignId(this);
		var attachRemoveSpan = Dwt.getDomObj(doc, attachRemoveId);
		attachRemoveSpan._tabViewPageId = tvpId;
		attachRemoveSpan._parentDiv = div;
		Dwt.setHandler(attachRemoveSpan, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
		// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
		if (AjxEnv.isIE) {
			var attachInputEl = Dwt.getDomObj(doc, attachInputId);
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
		this.setSize(Dwt.DEFAULT, newHeight - 30);
		Dwt.setSize(this.getHtmlElement().firstChild, Dwt.DEFAULT, newHeight - 30);
		this._resizeNotes();
	}
};

ZmApptTabViewPage.prototype.getNotesHtmlEditor =
function() {
	return this._notesHtmlEditor;
};

ZmApptTabViewPage.prototype.getDateInfo =
function() {
	var dateInfo = new Object();
	dateInfo.startDate = this._startDateField.value;
	dateInfo.endDate = this._endDateField.value;
	if (!this._allDayCheckbox.checked) {
		dateInfo.startTime = this._startTimeSelect.getValue();
		dateInfo.endTime = this._endTimeSelect.getValue();
	}
	return dateInfo;
};

ZmApptTabViewPage.prototype.getAttendees =
function() {
	// always prepend organizer before returning attendees field
	// XXX: for now, assume no organizer means its the user :/
	var calId = this._calendarSelect.getValue();
	var organizer = this._calendarOrgs[calId] || this._appCtxt.get(ZmSetting.USERNAME);

	// bug fix #4719 - only grab the valid email addresses
	var addrs = ZmEmailAddress.parseEmailString(this._attendeesField.value);
	var addrsArr = addrs.all.getArray();
	var allAddrs = new Array();
	for (var i = 0; i < addrsArr.length; i++)
		allAddrs.push(addrsArr[i].address);

	return (organizer + "; " + allAddrs.join("; "));
};


// Private / protected methods

ZmApptTabViewPage.prototype._reset =
function(appt, mode) {
	// reset the date/time values based on current time
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(appt.getStartDate());
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(appt.getEndDate());
	var isAllDayAppt = appt.isAllDayEvent();
	if (isAllDayAppt) {
		this._allDayCheckbox.checked = true;
		this._showTimeFields(false);
	}
	// if all day appt, set time anyway in case user changes mind
	ZmApptViewHelper.resetTimeSelect(appt, this._startTimeSelect, this._endTimeSelect, isAllDayAppt);
	this._resetTimezoneSelect(appt, isAllDayAppt);
	this._resetCalendarSelect(appt, mode);

	// re-enable all input fields
	this.enableInputs(true);

	// if not creating new appt, pre-populate from given appt
	if (mode != ZmAppt.MODE_NEW) {
		this._populateForEdit(appt);
	} else {
		// reset compose view to html preference
		this.setComposeMode(this._defaultComposeMode);
	}
	// disable the recurrence select object for editing single instance
	this._enableRepeat(mode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE);

	// set focus to first input element
	this._subjectField.focus();
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
function(appt) {
	// set subject/location
	this._subjectField.value = appt.getName();
	this._locationField.value = appt.getLocation();

	// TODO: set calendar this appointment belongs to

	// select objects
	this._showAsSelect.setSelectedValue(appt.freeBusy);
	this._repeatSelect.setSelectedValue(appt.repeatType);

	// recurrence string
	if (appt.isCustomRecurrence()) {
		this._repeatDescField.innerHTML = appt._getRecurrenceBlurbForSave();
	} else {
		this._repeatDescField.innerHTML = ZmApptViewHelper.setSimpleRecurString(appt.repeatType);
	}

	// attendees
	this._attendeesField.value = appt.getAttendees();

	// attachments
	var attachList = appt.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			this.addAttachmentField(appt, attachList[i]);
	}

	// set notes/content (based on compose mode per user prefs)
	var hasHtmlPart = appt.notesTopPart && appt.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT;
	if (hasHtmlPart &&
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
		this._repeatDescField.style.color = "#0000FF";
	}  else {
		this._repeatSelect.disable();
		this._repeatDescField.style.color = "#999999";
	}
	this._repeatSelectDisabled = !enable;
	this._repeatSelect.setAlign(DwtLabel.ALIGN_LEFT); // XXX: hack b/c bug w/ DwtSelect
};

ZmApptTabViewPage.prototype._createHTML =
function() {
	this._createApptHtml();
	this._createSelects();
	this._createButtons();
	this._cacheFields();
	this._initNotesHtmlEditor();
	this._initAutocomplete();
	this._addEventHandlers();
};

ZmApptTabViewPage.prototype._createApptHtml =
function() {
	var dims = this.parent.getSize();
	var half = (dims.x / 2) - 5;
	this.setSize(dims.x-2, dims.y-30);
	this._notesHtmlEditorId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 style='table-layout:fixed; height:";
	html[i++] = dims.y-30;
	html[i++] = "px'><colgroup><col width=";
	html[i++] = half;
	html[i++] = "><col width=";
	html[i++] = half;
	html[i++] = "></colgroup><tr style='height:110px'><td valign=top><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.details;
	html[i++] = "</legend><div style='overflow:hidden; height:";
	html[i++] = AjxEnv.isIE ? "90px;'>" : "82px;'>";
	html[i++] = this._getDetailsHtml();
	html[i++] = "</div></fieldset></td>";
	html[i++] = "<td valign=top><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.time;
	html[i++] = "</legend><div style='overflow:hidden; height:";
	html[i++] = AjxEnv.isIE ? "90px;'>" : "82px;'>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr><tr style='height:30px;'><td colspan=2>";
	html[i++] = this._getSchedulingHtml();
	html[i++] = "</td></tr><tr><td valign=top colspan=2 id='";
	html[i++] = this._notesHtmlEditorId;
	html[i++] = "'>";
	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	this.getHtmlElement().innerHTML = html.join("");
};

ZmApptTabViewPage.prototype._createSelects =
function() {
	var doc = this.getDocument();

	// create selects for details section
	this._calendarSelect = new DwtSelect(this);
	var calCell = Dwt.getDomObj(doc, this._calSelectId);
	if (calCell)
		calCell.appendChild(this._calendarSelect.getHtmlElement());
	delete this._calSelectId;

	this._showAsSelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptTabViewPage.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}
	var showAsCell = Dwt.getDomObj(doc, this._showAsSelectId);
	if (showAsCell)
		showAsCell.appendChild(this._showAsSelect.getHtmlElement());
	this._showAsSelect.setSize("85"); 											// XXX: hardcode width for now
	delete this._showAsSelectId;

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
	var startTimeCell = Dwt.getDomObj(doc, this._startTimeSelectId);
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
	var endTimeCell = Dwt.getDomObj(doc, this._endTimeSelectId);
	if (endTimeCell)
		endTimeCell.appendChild(this._endTimeSelect.getHtmlElement());
	delete this._endTimeSelectId;

	this._tzoneSelect = new DwtSelect(this);
	var timezones = ZmTimezones.getAbbreviatedZoneChoices(); 					// XXX: this seems like overkill, list all 75 timezones!?
	for (var i = 0; i < timezones.length; i++)
		this._tzoneSelect.addOption(timezones[i].label, false, timezones[i].value);
	// init timezone to the local machine's time zone
	this._tzoneSelect.setSelectedValue(ZmTimezones.guessMachineTimezone());
	var endTZoneCell = Dwt.getDomObj(doc, this._tzoneSelectId);
	if (endTZoneCell)
		endTZoneCell.appendChild(this._tzoneSelect.getHtmlElement());
	this._tzoneSelect.setSize("100"); 											// XXX: hardcode width for now
	delete this._tzoneSelectId;

	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	var repeatCell = Dwt.getDomObj(doc, this._repeatSelectId);
	if (repeatCell)
		repeatCell.appendChild(this._repeatSelect.getHtmlElement());
	delete this._repeatSelectId;
};

ZmApptTabViewPage.prototype._createButtons =
function() {
	var doc = this.getDocument();

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmApptViewHelper.createMiniCalButton(doc, this, this._startMiniCalBtnId,
																 dateButtonListener, dateCalSelectionListener);

	this._endDateButton = ZmApptViewHelper.createMiniCalButton(doc, this, this._endMiniCalBtnId,
															   dateButtonListener, dateCalSelectionListener);

	this._attendeesBtnListener = new AjxListener(this, this._attendeesButtonListener);
	this._attendeesButton = new DwtButton(this);
	this._attendeesButton.setText(ZmMsg.attendees + "...");
	this._attendeesButton.setSize(80);
	this._attendeesButton.addSelectionListener(this._attendeesBtnListener);
	// reparent
	var attendeesButtonCell = Dwt.getDomObj(doc, this._attendeesBtnId);
	if (attendeesButtonCell)
		attendeesButtonCell.appendChild(this._attendeesButton.getHtmlElement());
	delete this._attendeesBtnId;
};

ZmApptTabViewPage.prototype._getDetailsHtml =
function() {
	this._subjectFieldId 		= Dwt.getNextId();
	this._locationFieldId 		= Dwt.getNextId();
	this._calLabelId 			= Dwt.getNextId();
	this._calSelectId 			= Dwt.getNextId();
	this._showAsSelectId 		= Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr><td width=1% class='ZmApptTabViewPageField'><sup>*</sup>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td colspan=5><input style='width:100%; height:22px' type='text' id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=5><input style='width:100%; height:22px' type='text' id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr>";
	html[i++] = "<td width=1% class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td width=1% id='";
	html[i++] = this._showAsSelectId;
	html[i++] = "'></td>";
	html[i++] = "<td width=100%></td>";
	html[i++] = "<td width=1% class='ZmApptTabViewPageField' id='";
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

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.start;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._startDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._startMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "<td colspan=3 id='";
	html[i++] = this._tzoneSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr><tr><td class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.end;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input style='height:22px;' type='text' size=11 maxlength=10 id='";
	html[i++] = this._endDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._endMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "<td><input type='checkbox' id='";
	html[i++] = this._allDayCheckboxId;
	html[i++] = "'></td><td><nobr>";
	html[i++] = ZmMsg.allDayEvent;
	html[i++] = "</td><td width=100%></td></tr>";
	html[i++] = "<tr><td valign=top class='ZmApptTabViewPageField' style='line-height:22px'>";
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
	this._attendeesBtnId = Dwt.getNextId();
	this._attendeesFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=100%><tr>";
	if (this._contactsSupported) {
		html[i++] = "<td width=1% id='";
		html[i++] = this._attendeesBtnId;
		html[i++] = "'></td>";
	} else {
		html[i++] = "<td width=1% align=right>";
		html[i++] = ZmMsg.attendees;
		html[i++] = ":</td>";
	}
	html[i++] = "<td><input style='width:100%; height:22px' type='text' id='";
	html[i++] = this._attendeesFieldId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table>";

	return html.join("");
};

ZmApptTabViewPage.prototype._initNotesHtmlEditor =
function() {
	var doc = this.getDocument();

	// add notes html editor
	this._notesHtmlEditor = new ZmHtmlEditor(this, null, null, this._composeMode, this._appCtxt);
	var notesHtmlEditorDiv = Dwt.getDomObj(doc, this._notesHtmlEditorId);
	if (notesHtmlEditorDiv)
		notesHtmlEditorDiv.appendChild(this._notesHtmlEditor.getHtmlElement());
	delete this._notesHtmlEditorId;

	this._bodyField = Dwt.getDomObj(doc, this._notesHtmlEditor.getBodyFieldId());
	this._resizeNotes();
};

ZmApptTabViewPage.prototype._initAutocomplete =
function() {
	if (this._autocomplete || !this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		return;

	var shell = this._appCtxt.getShell();
	var contactsApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmZimbraMail.CONTACTS_APP) : null;
	var contactsList = contactsApp ? contactsApp.getContactList : null;
	var locCallback = new AjxCallback(this, this._getAcListLoc, this);
	var params = {parent: shell, dataClass: contactsApp, dataLoader: contactsList,
				  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback};
	this._autocomplete = new ZmAutocompleteListView(params);
	this._autocomplete.handle(this._attendeesField);
};

ZmApptTabViewPage.prototype._addEventHandlers =
function() {
	var tvpId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmApptTabViewPage._onMouseOver);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmApptTabViewPage._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmApptTabViewPage._onChange);

	this._allDayCheckbox._tabViewPageId = this._repeatDescField._tabViewPageId = tvpId;
	this._startDateField._tabViewPageId = this._endDateField._tabViewPageId = tvpId;
};

// cache all input fields so we dont waste time traversing DOM each time
ZmApptTabViewPage.prototype._cacheFields =
function() {
	var doc = this.getDocument();

	this._subjectField 		= Dwt.getDomObj(doc, this._subjectFieldId); 		delete this._subjectFieldId;
	this._locationField 	= Dwt.getDomObj(doc, this._locationFieldId); 		delete this._locationFieldId;
	this._calLabelField 	= Dwt.getDomObj(doc, this._calLabelId); 			delete this._calLabelId;
	this._startDateField 	= Dwt.getDomObj(doc, this._startDateFieldId); 		delete this._startDateFieldId;
	this._endDateField 		= Dwt.getDomObj(doc, this._endDateFieldId);	 		delete this._endDateFieldId;
	this._attendeesField 	= Dwt.getDomObj(doc, this._attendeesFieldId); 		delete this._attendeesFieldId;
	this._allDayCheckbox 	= Dwt.getDomObj(doc, this._allDayCheckboxId); 		// dont delete!
	this._repeatDescField 	= Dwt.getDomObj(doc, this._repeatDescId); 			// dont delete!
};

ZmApptTabViewPage.prototype._resetTimezoneSelect =
function(appt, isAllDayAppt) {
	var showTimezone = this._appCtxt.get(ZmSetting.CAL_SHOW_TIMEZONE) && !isAllDayAppt;
	Dwt.setVisibility(this._tzoneSelect.getHtmlElement(), showTimezone);
	this._tzoneSelect.setSelectedValue(appt.getTimezone());
};

ZmApptTabViewPage.prototype._resetCalendarSelect =
function(appt, mode) {
	// get all folders w/ view set to "Appointment" we received from initial refresh block
	var calTreeData = this._appCtxt.getOverviewController().getTreeData(ZmOrganizer.CALENDAR);
	if (calTreeData && calTreeData.root) {
		this._calendarSelect.clearOptions();
		this._calendarOrgs = new Array();
		var children = calTreeData.root.children.getArray();
		var len = children.length;
		var visible = (mode != ZmAppt.MODE_NEW && !appt.isReadOnly()) || (mode == ZmAppt.MODE_NEW && len>1);
		Dwt.setVisibility(this._calendarSelect.getHtmlElement(), visible);
		Dwt.setVisibility(this._calLabelField, visible);
		if (visible) {
			for (var i = 0; i < len; i++) {
				var cal = children[i];
				this._calendarOrgs[cal.id] = cal.owner;
				// if for some reason, we dont have share info, show all shares
				if (!cal.link || (cal.link && (cal.shares == null || cal.shares[0].isWrite())))
					this._calendarSelect.addOption(cal.name, false, cal.id);
			}
		}
	}
	// always reset the width of this select widget
	this._calendarSelect.setSize("110");
	this._calendarSelect.setSelectedValue(appt.getFolderId());
};

ZmApptTabViewPage.prototype._initAttachIframe =
function() {
	// create new table row which will contain parent fieldset
	var table = this.getHtmlElement().firstChild;
	this._attachmentRow = table.insertRow(2);
	this._attachmentRow.style.height = AjxEnv.isIE ? 44 : 22;
	var cell = this._attachmentRow.insertCell(-1);
	cell.colSpan = 2;

	// create fieldset and append to given table cell
	var html = new Array();
	var i = 0;
	html[i++] = "<fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border:1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.attachments;
	html[i++] = "</legend>";

	var doc = this.getDocument();
	this._uploadFormId = Dwt.getNextId();
	this._attachDivId = Dwt.getNextId();

	html[i++] = "<form style='margin:0;padding:0' method='POST' action='";
	html[i++] = (location.protocol + "//" + doc.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI));
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
	var atts = this.getDocument().getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;

	return false;
};

ZmApptTabViewPage.prototype._removeAttachment =
function(removeId) {
	// get document of attachment's iframe
	var removeSpan = this.getElementById(removeId);
	if (removeSpan) {
		// have my parent kill me
		removeSpan._parentDiv.parentNode.removeChild(removeSpan._parentDiv);
		if ((this._attachCount-1) == 0) {
			this._removeAllAttachments();
		}
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
	var table = this.getHtmlElement().firstChild;
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
		this._recurDialog.initialize(this._startDateField.value, this._endDateField.value, type, this._appt);
		this._recurDialog.popup();
	}
};

// Returns a string representing the form content
ZmApptTabViewPage.prototype._formValue =
function() {
	var vals = new Array();

	vals.push(this._subjectField.value);
	vals.push(this._locationField.value);
	vals.push(this._showAsSelect.getValue());
	vals.push(this._startDateField.value);
	vals.push(this._endDateField.value);
	vals.push(this._startTimeSelect.getValue());
	vals.push(this._endTimeSelect.getValue());
	vals.push(""+this._allDayCheckbox.checked);
	if (Dwt.getVisibility(this._tzoneSelect.getHtmlElement()))
		vals.push(this._tzoneSelect.getValue());
	vals.push(this._repeatSelect.getValue());
	vals.push(this._attendeesField.value);
	vals.push(this._notesHtmlEditor.getContent());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

ZmApptTabViewPage.prototype._resizeNotes =
function() {
	// init html editor heights
	var rows = this.getHtmlElement().firstChild.rows;
	var lastRowIdx = rows.length-1;
	var rowHeight = 0;
	for (var i = 0; i < lastRowIdx; i++)
		rowHeight += Dwt.getSize(rows[i]).y;
	rowHeight = this.getSize().y - rowHeight;
	var fudge = this._composeMode == DwtHtmlEditor.HTML ? 75 : 15;
	Dwt.setSize(this._bodyField, Dwt.DEFAULT, rowHeight-fudge);
};

ZmApptTabViewPage.prototype._submitAttachments =
function() {
	var callback = new AjxCallback(this, this._attsDoneCallback);
	var um = this._appCtxt.getUploadManager();
	window._uploadManager = um;
	um.execute(callback, this.getElementById(this._uploadFormId));
};


// Listeners

ZmApptTabViewPage.prototype._dateButtonListener =
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

ZmApptTabViewPage.prototype._attendeesButtonListener =
function(ev) {
	if (!this._contactPicker) {
		var buttonInfo = [ { id:ZmApptTabViewPage.CONTACT_PICKER_BID, value:ZmMsg.add.toLowerCase() } ];
		this._contactPicker = new ZmContactPicker(this._appCtxt, buttonInfo);
		this._contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._contactPickerOk, this);
		this._contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._contactPickerCancel, this);
	}
	this._contactPicker.popup(ZmApptTabViewPage.CONTACT_PICKER_BID);
};

ZmApptTabViewPage.prototype._dateCalSelectionListener =
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

ZmApptTabViewPage.prototype._timeChangeListener =
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

ZmApptTabViewPage.prototype._repeatChangeListener =
function(ev) {
	var newSelectVal = ev._args.newValue;
	if (newSelectVal == "CUS") {
		this._oldRepeatValue = ev._args.oldValue;
		this._showRecurDialog();
	} else {
		this._repeatDescField.innerHTML = ZmApptViewHelper.setSimpleRecurString(newSelectVal);
	}
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
			// TODO - give feedback to user about errors in recur dialog
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


// Callbacks

// Transfers addresses from the contact picker to the compose view.
ZmApptTabViewPage.prototype._contactPickerOk =
function(args) {
	var addrs = args[0];

	// populate attendees field w/ chosen contacts from picker
	var vec = addrs[ZmApptTabViewPage.CONTACT_PICKER_BID];

	// bug fix #4719 - just display the email address (no display name)
	var addrs = vec.getArray();
	var addrsArr = new Array();
	for (var i = 0; i < addrs.length; i++)
		addrsArr.push(addrs[i].address);

	this._attendeesField.value += addrsArr.length > 0
		? ((addrsArr.join(ZmEmailAddress.SEPARATOR) + ZmEmailAddress.SEPARATOR))
		: "";

	this._contactPicker.popdown();

	this.enableInputs(true);
	this.reEnableDesignMode();
};

ZmApptTabViewPage.prototype._contactPickerCancel =
function(args) {
	this.enableInputs(true);
	this.reEnableDesignMode();
};

ZmApptTabViewPage.prototype._getAcListLoc =
function(ev) {
	if (this._attendeesField) {
		var loc = Dwt.getLocation(this._attendeesField);
		var height = Dwt.getSize(this._attendeesField).y;
		return (new DwtPoint(loc.x, loc.y+height));
	}
	return null;
};

ZmApptTabViewPage.prototype._attsDoneCallback =
function(args) {
	DBG.println(AjxDebug.DBG1, "Attachments: status = " + args[0] + ", attId = " + args[1]);
	if (args[0] == 200) {
		this._removeAllAttachments();
		var acc = this._appCtxt.getApp(ZmZimbraMail.CALENDAR_APP).getApptComposeController();
		acc.saveAppt(args[1]);
	} else {
		DBG.println(AjxDebug.DBG1, "attachment error: " + args[0]);
	}
};


// Static methods

ZmApptTabViewPage._onClick =
function(ev) {
	ev || (ev = window.event);

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
	ev || (ev = window.event);

	var el = DwtUiEvent.getTarget(ev);

	if (el.id.indexOf("_att_") != -1) {
		// ignore enter key press in IE otherwise it tries to send the attachment!
		var key = DwtKeyEvent.getCharCode(ev);
		return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
	}
};

ZmApptTabViewPage._onMouseOver =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);

	if (el == tvp._repeatDescField) {
		tvp._repeatDescField.style.cursor = tvp._repeatSelectDisabled
			? "default" : "pointer";
	}
};

ZmApptTabViewPage._onChange =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);
	ZmApptViewHelper.handleDateChange(tvp._startDateField, tvp._endDateField, el == tvp._startDateField);
};
