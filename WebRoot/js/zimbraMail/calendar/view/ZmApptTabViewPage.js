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
*
* @param parent		[DwtComposite]		the appt compose view
* @param appCtxt 	[ZmAppCtxt]			app context
*/
function ZmApptTabViewPage(parent, appCtxt) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;

	this.setScrollStyle(DwtControl.CLIP);
	this._rendered = false;
	this._contactsSupported = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) || this._appCtxt.get(ZmSetting.GAL_ENABLED);
	this._contacts = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();

	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	this._composeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	this._repeatSelectDisabled = false;
	this._attachCount = 0;

	this._attendees = {};
	this._attendees[ZmAppt.ATTENDEE] = [];	// list of ZmEmailAddress
	this._attendees[ZmAppt.LOCATION] = [];	// list of ZmResource
	this._attendees[ZmAppt.RESOURCE] = [];	// list of ZmResource
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
	appt.location = this._locationField.getValue();
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
	appt.attendees = this._attendees[ZmAppt.ATTENDEE];
	appt.locations = this._attendees[ZmAppt.LOCATION];
	appt.resources = this._attendees[ZmAppt.RESOURCE];

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

	this._mode = mode == ZmAppt.MODE_NEW_FROM_QUICKADD || mode == null
		? ZmAppt.MODE_NEW : mode;

	// OPTIMIZATION: create timed action to reset the view
	var ta = new AjxTimedAction(this, this._reset, [appt, mode || ZmAppt.MODE_NEW]);
	AjxTimedAction.scheduleAction(ta, 0);
};

ZmApptTabViewPage.prototype.addChooserListener =
function(tab) {
	if (tab && tab._chooser) {
		tab._chooser.addChangeListener(new AjxListener(this, this._chooserListener));
	}
};

ZmApptTabViewPage.prototype.cleanup =
function() {
	if (this._recurDialog) {
		this._recurDialog.clearState();
		this._recurDialogRepeatValue = null;
	}

	delete this._appt;
	this._appt = null;

	// clear attendees lists
	this._attendees[ZmAppt.ATTENDEE] = [];
	this._attendees[ZmAppt.LOCATION] = [];
	this._attendees[ZmAppt.RESOURCE] = [];

	// clear out all input fields
	this._subjectField.setValue("");
	this._locationField.setValue("");
	this._attendeesField.setValue("");
	this._resourcesField.setValue("");
	this._repeatDescField.innerHTML = "";
	this._notesHtmlEditor.clear();

	// reinit non-time sensitive selects option values
	this._repeatSelect.setSelectedValue(ZmApptViewHelper.REPEAT_OPTIONS[0].value);
	this._allDayCheckbox.checked = false;
	this._showTimeFields(true);

	// remove attachments if any were added
	this._removeAllAttachments();

	// disable all input fields
	this.enableInputs(false);
};

ZmApptTabViewPage.prototype.addRepeatChangeListener =
function(listener) {
	this.addListener(ZmApptTabViewPage._REPEAT_CHANGE, listener);
};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmApptTabViewPage.prototype.enableInputs =
function(bEnableInputs) {
	this._subjectField.disabled(!bEnableInputs);
	this._locationField.disabled(!bEnableInputs);
	this._attendeesField.disabled(!bEnableInputs);
	this._resourcesField.disabled(!bEnableInputs);
	this._startDateField.disabled = !bEnableInputs;
	this._endDateField.disabled = !bEnableInputs;
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

	if (subj != null && subj.length > 0) {
		// check proper dates..
		var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
		if (!this._allDayCheckbox.checked) {
			startDate = this._startTimeSelect.getValue(startDate);
			endDate = this._endTimeSelect.getValue(endDate);
		}

		if (startDate == null || endDate == null || startDate.valueOf() > endDate.valueOf()) {
			errorMsg = ZmMsg.errorInvalidDates;
		} else {
			// check proper attendees
			if (this._attendeesField.isValid() == null)
				errorMsg = ZmMsg.errorInvalidAttendees + " " + ZmMsg.errorTryAgain;
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

ZmApptTabViewPage.prototype.updateTimeField =
function(startHourIdx, startMinuteIdx, startAmPmIdx, endHourIdx, endMinuteIdx, endAmPmIdx) {
	this._startTimeSelect.setSelected(startHourIdx, startMinuteIdx, startAmPmIdx);
	this._endTimeSelect.setSelected(endHourIdx, endMinuteIdx, endAmPmIdx);
};

ZmApptTabViewPage.prototype.updateAttendeesField =
function(attendees) {
	this._attendeesField.setValue(attendees);
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

	if (this._attachCount == ZmApptTabViewPage.SHOW_MAX_ATTACHMENTS)
		this._attachDiv.style.height = Dwt.getSize(this._attachDiv).y + "px";

	this._attachCount++;

	// add file input field
	var div = document.createElement("div");

	var attachRemoveId = "_att_" + Dwt.getNextId();
	var attachInputId = "_att_" + Dwt.getNextId();

	if (attach) {
		div.innerHTML = appt.getAttachListHtml(attach, true);
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
		dateInfo.showTime = true;

		dateInfo.startHourIdx = this._startTimeSelect.getSelectedHourIdx();
		dateInfo.startMinuteIdx = this._startTimeSelect.getSelectedMinuteIdx();
		dateInfo.startAmPmIdx = this._startTimeSelect.getSelectedAmPmIdx();
		dateInfo.endHourIdx = this._endTimeSelect.getSelectedHourIdx();
		dateInfo.endMinuteIdx = this._endTimeSelect.getSelectedMinuteIdx();
		dateInfo.endAmPmIdx = this._endTimeSelect.getSelectedAmPmIdx();
	}
	return dateInfo;
};

/**
* Returns a joined string of email addresses.
*/
ZmApptTabViewPage.prototype.getOrganizerAndAttendees =
function() {
	// always prepend organizer before returning attendees field
	// XXX: for now, assume no organizer means it's the user :/
	var calId = this._calendarSelect.getValue();
	var organizer = this._calendarOrgs[calId] ? this._calendarOrgs[calId] : this._appCtxt.get(ZmSetting.USERNAME);

	var list = [];
	list.push(organizer);
	
	var all = this._attendees[ZmAppt.ATTENDEE].concat(this._attendees[ZmAppt.LOCATION]).concat(this._attendees[ZmAppt.RESOURCE])
	for (var i = 0; i < all.length; i++) {
		list.push(all[i].getAddress());
	}

	return (list.join(ZmAppt.ATTENDEES_SEPARATOR_AND_SPACE));
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
	ZmApptViewHelper.resetTimeSelect(appt, this._startTimeSelect, this._endTimeSelect);

	this._resetTimezoneSelect(appt, isAllDayAppt);
	this._resetCalendarSelect(appt, mode);

	// re-enable all input fields
	this.enableInputs(true);

	// lets always attempt to populate even if we're dealing w/ a "new" appt
	this._populateForEdit(appt, mode);

	// disable the recurrence select object for editing single instance
	this._enableRepeat(mode != ZmAppt.MODE_EDIT_SINGLE_INSTANCE);

	// set focus to first input element
	this._subjectField.focus();

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
	this._locationField.setValue(appt.getLocation());

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
	if (appt.attendees && appt.attendees.length) {
		this._attendeesField.setValue(appt.getAttendees());
		this._attendees[ZmAppt.ATTENDEE] = appt.attendees;
		// attendees chooser handles ZmContact (not ZmEmailAddress)
		// grub for attendees in user's contacts, pass any found to chooser
		var tp = this.parent.getTabPage(ZmApptComposeView.TAB_ATTENDEES);
		var list = [];
		for (var i = 0; i < appt.attendees.length; i++) {
			var addr = appt.attendees[i].getAddress();
			var contact = this._contacts.getContactByEmail(addr);
			if (contact) {
				list.push(contact);
			}
		}
		if (list.length) {
			tp._chooser.transfer(list);
		}
	}

	// locations
	if (appt.locations && appt.locations.length) {
//		this._locationField.setValue(appt.getLocation());
		this._attendees[ZmAppt.LOCATION] = appt.locations;
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_LOCATIONS);
		tp._chooser.transfer(appt.locations);
	}
	
	// resources
	if (appt.resources && appt.resources.length) {
		this._resourcesField.setValue(appt.getResources());
		this._attendees[ZmAppt.RESOURCE] = appt.resources;
		tp = this.parent.getTabPage(ZmApptComposeView.TAB_RESOURCES);
		tp._chooser.transfer(appt.resources);
	}

	// attachments
	var attachList = appt.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			this.addAttachmentField(appt, attachList[i]);
	}

	// set notes/content (based on compose mode per user prefs)
	if (this._appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT) ||
		 this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML)
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
	this._createInputs();
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
	var rowHeight = AjxEnv.isIE ? 140 : 110;
	this.setSize(dims.x-2, dims.y-30);
	this._notesHtmlEditorId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 style='table-layout:fixed; height:";
	html[i++] = dims.y-30;
	html[i++] = "px'><colgroup><col width='";
	html[i++] = AjxEnv.is800x600orLower ? "235" : "335";
	html[i++] = "'><col></colgroup>";
	html[i++] = "<tr style='height:";
	html[i++] = rowHeight;
	html[i++] = "px'><td valign=top><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.details;
	html[i++] = "</legend><div style='overflow:hidden; height:";
	html[i++] = AjxEnv.isIE ? (rowHeight-20) : rowHeight;
	html[i++] = "px'>";
	html[i++] = this._getDetailsHtml();
	html[i++] = "</div></fieldset></td>";
	html[i++] = "<td valign=top><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.time;
	html[i++] = "</legend><div style='overflow:hidden; height:";
	html[i++] = AjxEnv.isIE ? (rowHeight-20) : rowHeight;
	html[i++] = "px;";
	html[i++] = AjxEnv.isIE ? " width:99%'>" : "'>";
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

ZmApptTabViewPage.prototype._createInputs = 
function() {
	var width = AjxEnv.is800x600orLower ? "150" : "250";

	this._subjectField = new DwtInputField({parent: this, type:DwtInputField.STRING,
											errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											validationStyle: DwtInputField.CONTINUAL_VALIDATION});
	this._subjectField.setRequired();
	Dwt.setSize(this._subjectField.getInputElement(), width, "22px");
	this._subjectField.reparentHtmlElement(this._subjectFieldId);
	delete this._subjectFieldId;

	this._locationField = new DwtInputField({parent: this, type: DwtInputField.STRING});
	Dwt.setSize(this._locationField.getInputElement(), width, "22px");
	this._locationField.reparentHtmlElement(this._locationFieldId);
	delete this._locationFieldId;

	this._attendeesField = new DwtInputField({parent: this, type: DwtInputField.STRING});
	Dwt.setSize(this._attendeesField.getInputElement(), "100%", "22px");
	this._attendeesField.reparentHtmlElement(this._attendeesFieldId);
	delete this._attendeesFieldId;

	this._resourcesField = new DwtInputField({parent: this, type: DwtInputField.STRING});
	Dwt.setSize(this._resourcesField.getInputElement(), "100%", "22px");
	this._resourcesField.reparentHtmlElement(this._resourcesFieldId);
	delete this._resourcesFieldId;
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

	this._startTimeSelect = new ZmTimeSelect(this);
	this._startTimeSelect.reparentHtmlElement(this._startTimeSelectId);
	delete this._startTimeSelectId;

	this._endTimeSelect = new ZmTimeSelect(this);
	this._endTimeSelect.reparentHtmlElement(this._endTimeSelectId);
	delete this._endTimeSelectId;

	this._tzoneSelect = new DwtSelect(this);
	var timezones = ZmTimezones.getAbbreviatedZoneChoices(); 					// XXX: this seems like overkill, list all 75 timezones!?
	for (var i = 0; i < timezones.length; i++)
		this._tzoneSelect.addOption(timezones[i].label, false, timezones[i].value);
	// init timezone to the local machine's time zone
	this._tzoneSelect.setSelectedValue(ZmTimezones.guessMachineTimezone());
	this._tzoneSelect.reparentHtmlElement(this._tzoneSelectId);
	delete this._tzoneSelectId;

	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	this._repeatSelect.reparentHtmlElement(this._repeatSelectId);
	delete this._repeatSelectId;
};

ZmApptTabViewPage.prototype._createButtons =
function() {
	this._locationBtnListener = new AjxListener(this, this._locationButtonListener);
	this._locationButton = new DwtButton(this);
	this._locationButton.setText(ZmMsg.location);
	this._locationButton.setSize(80);
	this._locationButton.addSelectionListener(this._locationBtnListener);
	// cleanup...
	this._locationButton.reparentHtmlElement(this._locationBtnId);
	delete this._locationBtnId;

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._startDateButton = ZmApptViewHelper.createMiniCalButton(this, this._startMiniCalBtnId, dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmApptViewHelper.createMiniCalButton(this, this._endMiniCalBtnId, dateButtonListener, dateCalSelectionListener);

	this._attendeesBtnListener = new AjxListener(this, this._attendeesButtonListener);
	this._attendeesButton = new DwtButton(this);
	this._attendeesButton.setText(ZmMsg.attendees + "...");
	this._attendeesButton.setSize(80);
	this._attendeesButton.addSelectionListener(this._attendeesBtnListener);
	// cleanup...
	this._attendeesButton.reparentHtmlElement(this._attendeesBtnId);
	delete this._attendeesBtnId;

	this._resourcesBtnListener = new AjxListener(this, this._resourcesButtonListener);
	this._resourcesButton = new DwtButton(this);
	this._resourcesButton.setText(ZmMsg.resources + "...");
	this._resourcesButton.setSize(80);
	this._resourcesButton.addSelectionListener(this._resourcesBtnListener);
	// cleanup...
	this._resourcesButton.reparentHtmlElement(this._resourcesBtnId);
	delete this._resourcesBtnId;
};

ZmApptTabViewPage.prototype._getDetailsHtml =
function() {
	this._subjectFieldId 		= Dwt.getNextId();
	this._locationBtnId			= Dwt.getNextId();
	this._locationFieldId 		= Dwt.getNextId();
	this._calLabelId 			= Dwt.getNextId();
	this._calSelectId 			= Dwt.getNextId();
	this._showAsSelectId 		= Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr><td width=1% class='ZmApptTabViewPageField'><sup>*</sup>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td colspan=5 id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% id='";
	html[i++] = this._locationBtnId;
	html[i++] = "'></td>";
	html[i++] = "</td><td colspan=5 id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr>";
	html[i++] = "<td width=1% class='ZmApptTabViewPageField'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td width=1% id='";
	html[i++] = this._showAsSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr>";
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
	html[i++] = "<tr><td></td><td width=1%>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input type='checkbox' id='";
	html[i++] = this._allDayCheckboxId;
	html[i++] = "'></td><td><nobr>&nbsp;";
	html[i++] = ZmMsg.allDayEvent;
	html[i++] = "</td></tr></table></td><td></td><td colspan=10 id='";
	html[i++] = this._tzoneSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td class='ZmApptTabViewPageField'>";
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
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr><tr><td class='ZmApptTabViewPageField'>";
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
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";
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
	this._resourcesBtnId = Dwt.getNextId();
	this._resourcesFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr>";
	if (this._contactsSupported) {
		html[i++] = "<td width=1% id='";
		html[i++] = this._attendeesBtnId;
		html[i++] = "'></td>";
	} else {
		html[i++] = "<td width=1% align=right>";
		html[i++] = ZmMsg.attendees;
		html[i++] = ":</td>";
	}
	html[i++] = "<td id='";
	html[i++] = this._attendeesFieldId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";

	html[i++] = "<tr>";
	if (this._contactsSupported) {
		html[i++] = "<td width=1% id='";
		html[i++] = this._resourcesBtnId;
		html[i++] = "'></td>";
	} else {
		html[i++] = "<td width=1% align=right>";
		html[i++] = ZmMsg.resources;
		html[i++] = ":</td>";
	}
	html[i++] = "<td id='";
	html[i++] = this._resourcesFieldId;
	html[i++] = "'></td>";
	html[i++] = "</tr>";

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
	if (this._autocomplete || !this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		return;

	var shell = this._appCtxt.getShell();
	var contactsApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmZimbraMail.CONTACTS_APP) : null;
	var contactsList = contactsApp ? contactsApp.getContactList : null;
	var locCallback = new AjxCallback(this, this._getAcListLoc, this);
	var params = {parent: shell, dataClass: contactsApp, dataLoader: contactsList,
				  matchValue: ZmContactList.AC_VALUE_EMAIL, locCallback: locCallback};
	this._autocomplete = new ZmAutocompleteListView(params);
	this._autocomplete.handle(this._attendeesField.getInputElement());
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
		var apptCal;
		for (var i = 0; i < len; i++) {
			var cal = children[i];
			if (cal.id == appt.folderId) {
				apptCal = cal;
				break;
			}
		}
		var visible = len > 1;
		var enabled = mode == ZmAppt.MODE_NEW || mode == ZmAppt.MODE_NEW_FROM_QUICKADD || !apptCal.link;
		if (visible) {
			for (var i = 0; i < len; i++) {
				var cal = children[i];
				this._calendarOrgs[cal.id] = cal.owner;
				// if for some reason, we dont have share info, show all shares
				// Note: can't move appts to/from shared calendars
				if (!enabled || !cal.link || 
					((mode == ZmAppt.MODE_NEW || ZmAppt.MODE_NEW_FROM_QUICKADD) && cal.link && 
						(cal.shares == null || cal.shares[0].isWrite())))
				{
					this._calendarSelect.addOption(cal.name, false, cal.id);
				}
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
	var table = this.getHtmlElement().firstChild;
	this._attachmentRow = table.insertRow(2);
	this._attachmentRow.style.height = AjxEnv.isIE ? "auto" : 22;
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
		var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
		this._recurDialog.initialize(sd, ed, type, this._appt);
		this._recurDialog.popup();
	}
};

// Returns a string representing the form content
ZmApptTabViewPage.prototype._formValue =
function(excludeAttendees) {
	var vals = new Array();

	vals.push(this._subjectField.getValue());
	vals.push(this._locationField.getValue());
	vals.push(this._showAsSelect.getValue());
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	startDate = this._startTimeSelect.getValue(startDate);
	endDate = this._endTimeSelect.getValue(endDate);
	vals.push(
		AjxDateUtil.getServerDateTime(startDate),
		AjxDateUtil.getServerDateTime(endDate)
	);
	vals.push(""+this._allDayCheckbox.checked);
	if (Dwt.getVisibility(this._tzoneSelect.getHtmlElement()))
		vals.push(this._tzoneSelect.getValue());
	vals.push(this._repeatSelect.getValue());
	if (!excludeAttendees)
		vals.push(this._attendeesField.getValue());
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

	// init html editor heights
	var rows = this.getHtmlElement().firstChild.rows;
	var lastRowIdx = rows.length-1;
	var rowHeight = 0;
	for (var i = 0; i < lastRowIdx; i++) {
		// safari cant handle heights for TR's so get from TD's instead
		rowHeight += AjxEnv.isSafari 
			? Dwt.getSize(rows[i].cells[0]).y
			: Dwt.getSize(rows[i]).y;
	}
	rowHeight = this.getSize().y - rowHeight;
	var fudge = this._composeMode == DwtHtmlEditor.HTML ? 75 : 15;
	Dwt.setSize(this._bodyField, Dwt.DEFAULT, rowHeight-fudge);
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
			this._rdfTooltip = new DwtToolTip(this._appCtxt.getShell());
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

ZmApptTabViewPage.prototype._locationButtonListener =
function(ev) {
	this.parent.switchToTab(ZmApptComposeView.TAB_LOCATIONS);
};

ZmApptTabViewPage.prototype._attendeesButtonListener =
function(ev) {
	this.parent.switchToTab(ZmApptComposeView.TAB_ATTENDEES);
};

ZmApptTabViewPage.prototype._resourcesButtonListener =
function(ev) {
	this.parent.switchToTab(ZmApptComposeView.TAB_RESOURCES);
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
		this._repeatDescField.innerHTML = ZmApptViewHelper.setSimpleRecurString(newSelectVal);
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

ZmApptTabViewPage.prototype._chooserListener =
function(ev) {
	var vec = ev.getDetail("items");
	var type = ev.getDetail("chooserType");
	var items = this._attendees[type] = vec.getArray();

	var list = [];
	for (var i = 0; i < items.length; i++) {
		var name = items[i].getName();
		list.push(name ? name : items[i].getAddress());
	}
	var val = list.length ? list.join(ZmEmailAddress.SEPARATOR) : "";
	if (type == ZmAppt.ATTENDEE) {
		this._attendeesField.setValue(val);
	} else if (type == ZmAppt.LOCATION) {
		this._locationField.setValue(val);
	} else if (type == ZmAppt.RESOURCE) {
		this._resourcesField.setValue(val);
	}
};

// Callbacks

ZmApptTabViewPage.prototype._getAcListLoc =
function(ev) {
	if (this._attendeesField) {
		var inputEl = this._attendeesField.getInputElement();
		var loc = Dwt.getLocation(inputEl);
		var height = Dwt.getSize(inputEl).y;
		return (new DwtPoint(loc.x, loc.y+height));
	}
	return null;
};

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
	ev || (ev = window.event);

	var el = DwtUiEvent.getTarget(ev);
	var tvp = AjxCore.objectWithId(el._tabViewPageId);

	if (el == tvp._repeatDescField) {
		tvp._handleRepeatDescFieldHover(ev, true);
	}
};

ZmApptTabViewPage._onMouseOut = 
function(ev) {
	ev || (ev = window.event);

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
	ZmApptViewHelper.handleDateChange(tvp._startDateField, tvp._endDateField, el == tvp._startDateField);
};
