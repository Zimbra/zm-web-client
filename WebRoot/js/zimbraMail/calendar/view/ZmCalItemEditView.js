/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
/**
 * Creates a new calendar item edit view.
 * @constructor
 * @class
 * This is the main screen for creating/editing a calendar item. It provides
 * inputs for the various appointment/task details.
 *
 * @author Parag Shah
 *
 * @param {DwtControl}	parent			the container
 * @param {Hash}	attendees			the attendees/locations/equipment
 * @param {ZmController}	controller		the compose controller for this view
 * @param {Object}	dateInfo			a hash of date info
 * @param {static|relative|absolute}	posStyle			the position style
 * 
 * @extends	DwtComposite
 * 
 * @private
 */
ZmCalItemEditView = function(parent, attendees, controller, dateInfo, posStyle) {
	if (arguments.length == 0) { return; }

	DwtComposite.call(this, {parent:parent, posStyle:posStyle});

	this._attendees = attendees;
	this._controller = controller;
	this._dateInfo = dateInfo;

	this.setScrollStyle(DwtControl.CLIP);
	this._rendered = false;

	var bComposeEnabled = appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	this._composeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;

	this._repeatSelectDisabled = false;
	this._attachCount = 0;
	this._calendarOrgs = {};

	this._kbMgr = appCtxt.getKeyboardMgr();
};

ZmCalItemEditView.prototype = new DwtComposite;
ZmCalItemEditView.prototype.constructor = ZmCalItemEditView;

ZmCalItemEditView.prototype.toString =
function() {
	return "ZmCalItemEditView";
};


// Consts

ZmCalItemEditView.UPLOAD_FIELD_NAME = "__calAttUpload__";
ZmCalItemEditView.SHOW_MAX_ATTACHMENTS = AjxEnv.is800x600orLower ? 2 : 3;

ZmCalItemEditView._REPEAT_CHANGE = "REPEAT_CHANGE";

// Public

ZmCalItemEditView.prototype.show =
function() {
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);
};

ZmCalItemEditView.prototype.isRendered =
function() {
	return this._rendered;
};

/**
 * Gets the calendar item.
 * 
 * @return	{ZmCalItem}	the item
 */
ZmCalItemEditView.prototype.getCalItem =
function(attId) {
	// attempt to submit attachments first!
	if (!attId && this._gotAttachments()) {
		this._submitAttachments();
		return null;
	}

	return this._populateForSave(this._getClone());
};

ZmCalItemEditView.prototype.initialize =
function(calItem, mode, isDirty, isForward) {
	this._calItem = calItem;
	this._isDirty = isDirty;
    this._isForward = Boolean(isForward);
    
	var firstTime = !this._rendered;
	this.createHtml();

	this._mode = (mode == ZmCalItem.MODE_NEW_FROM_QUICKADD || !mode) ? ZmCalItem.MODE_NEW : mode;
	this._reset(calItem, mode || ZmCalItem.MODE_NEW, firstTime);
};

ZmCalItemEditView.prototype.cleanup =
function() {
	if (this._recurDialog) {
		this._recurDialog.clearState();
		this._recurDialogRepeatValue = null;
	}

	delete this._calItem;
	this._calItem = null;

	// clear out all input fields
	this._subjectField.setValue("");
	this._repeatDescField.innerHTML = "";
	this._notesHtmlEditor.setContent("");

	// reinit non-time sensitive selects option values
	this._repeatSelect.setSelectedValue(ZmApptViewHelper.REPEAT_OPTIONS[0].value);

	// remove attachments if any were added
	this._removeAllAttachments();

	// disable all input fields
	this.enableInputs(false);
};

ZmCalItemEditView.prototype.addRepeatChangeListener =
function(listener) {
	this.addListener(ZmCalItemEditView._REPEAT_CHANGE, listener);
};

// Acceptable hack needed to prevent cursor from bleeding thru higher z-index'd views
ZmCalItemEditView.prototype.enableInputs =
function(bEnableInputs) {
	this._subjectField.setEnabled(bEnableInputs);
	this._startDateField.disabled = !bEnableInputs;
	this._endDateField.disabled = !bEnableInputs;
};

ZmCalItemEditView.prototype.enableSubjectField =
function(bEnableInputs) {
	this._subjectField.setEnabled(bEnableInputs);
};

/**
 * Checks for dirty fields.
 * 
 * @param {Boolean}	excludeAttendees		if <code>true</code> check for dirty fields excluding the attendees field
 */
ZmCalItemEditView.prototype.isDirty =
function(excludeAttendees) {
	var formValue = excludeAttendees && this._origFormValueMinusAttendees
		? this._origFormValueMinusAttendees
		: this._origFormValue;

	return (this._gotAttachments() || this._removedAttachments()) ||
			this._isDirty ||
		   (this._formValue(excludeAttendees) != formValue);
};

/**
 * Checks if reminder only is changed.
 * 
 * @return	{Boolean}	<code>true</code> if reminder only changed
 */
ZmCalItemEditView.prototype.isReminderOnlyChanged =
function() {

	if(!this._hasReminderSupport) { return false; }

	var formValue = this._origFormValueMinusReminder;

	var isDirty = (this._gotAttachments() || this._removedAttachments()) ||
			this._isDirty ||
		   (this._formValue(false, true) != formValue);

	var isReminderChanged = (this._origReminderValue != this._reminderSelectInput.getValue());

	return isReminderChanged && !isDirty;
};

ZmCalItemEditView.prototype.isValid =
function() {
	// override
};

ZmCalItemEditView.prototype.getComposeMode =
function() {
	return this._composeMode;
};

ZmCalItemEditView.prototype.setComposeMode =
function(composeMode) {
	this._composeMode = composeMode || this._composeMode;
    this._notesHtmlModeFirstTime = !this._notesHtmlEditor.isHtmlModeInited();
	this._notesHtmlEditor.setMode(this._composeMode, true);
	this._resizeNotes();
};

ZmCalItemEditView.prototype.reEnableDesignMode =
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._notesHtmlEditor.reEnableDesignMode();
};

ZmCalItemEditView.prototype.createHtml =
function() {
	if (!this._rendered) {
		var width = AjxEnv.is800x600orLower ? "150" : "250";

		this._createHTML();
		this._createWidgets(width);
		this._cacheFields();
		this._addEventHandlers();
		this._rendered = true;
	}
};

/**
 * Adds an attachment (file input field) to the appointment view. If none
 * already exist, creates the attachments container. If <code>attach</code> parameters is
 * provided, user is opening an existing appointment w/ an attachment and therefore
 * display differently.
 * 
 * @param	{ZmCalItem}	calItem		the calendar item
 * @param	{Object}	attach		the attachment
 * 
 * @private
 */
ZmCalItemEditView.prototype.addAttachmentField =
function(calItem, attach) {
	if (this._attachCount == 0) {
		this._initAttachContainer();
	}
	if (this._attachCount == ZmCalItemEditView.SHOW_MAX_ATTACHMENTS) {
		this._attachDiv.style.height = Dwt.getSize(this._attachDiv).y + "px";
	}

	this._attachCount++;

	// add file input field
	var div = document.createElement("div");

	var attachRemoveId = "_att_" + Dwt.getNextId();
	var attachInputId = "_att_" + Dwt.getNextId();

	if (attach) {
		div.innerHTML = calItem.getAttachListHtml(attach, true);
	} else {
		var subs = {
			id: this._htmlElId,
			attachInputId: attachInputId,
			attachRemoveId: attachRemoveId,
			uploadFieldName: ZmCalItemEditView.UPLOAD_FIELD_NAME
		};
		div.innerHTML = AjxTemplate.expand("calendar.Appointment#AttachAdd", subs);
	}

	if (this._attachDiv == null) {
		this._attachDiv = document.getElementById(this._attachDivId);
	}
	this._attachDiv.appendChild(div);

	// scroll to the new attachment if needed
	this._attachDiv.scrollTop = div.offsetTop;

	if (attach == null) {
		// add event handlers as necessary
		var tvpId = AjxCore.assignId(this);
		var attachRemoveSpan = document.getElementById(attachRemoveId);
		attachRemoveSpan._editViewId = tvpId;
		attachRemoveSpan._parentDiv = div;
		Dwt.setHandler(attachRemoveSpan, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
		// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
		if (AjxEnv.isIE) {
			var attachInputEl = document.getElementById(attachInputId);
			attachInputEl._editViewId = tvpId;
			Dwt.setHandler(attachInputEl, DwtEvent.ONKEYDOWN, ZmCalItemEditView._onKeyDown);
		}
	}

	this._resizeNotes();
};

ZmCalItemEditView.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) { return; }

	if (newWidth) {
		this.setSize(newWidth);
		Dwt.setSize(this.getHtmlElement().firstChild, newWidth);
	}

	if (newHeight) {
		this.setSize(Dwt.DEFAULT, newHeight - 35);
		this._resizeNotes();
	}
};

ZmCalItemEditView.prototype.getHtmlEditor =
function() {
	return this._notesHtmlEditor;
};

ZmCalItemEditView.prototype.getOrganizer =
function() {
	var folderId = this._folderSelect.getValue();
	var organizer = new ZmContact(null);
	organizer.initFromEmail(ZmApptViewHelper.getOrganizerEmail(this._calendarOrgs[folderId]), true);

	return organizer;
};


// Private / protected methods

ZmCalItemEditView.prototype._addTabGroupMembers =
function(tabGroup) {
	// override
};

ZmCalItemEditView.prototype._reset =
function(calItem, mode, firstTime) {
    this._calendarOrgs = {};
	ZmApptViewHelper.populateFolderSelect(this._folderSelect, this._folderRow, this._calendarOrgs, calItem);

	this.enableInputs(true);

	// lets always attempt to populate even if we're dealing w/ a "new" calItem
	this._populateForEdit(calItem, mode);

	// disable the recurrence select object for editing single instance
    var enableRepeat = ((mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) && !this._isForward);
	this._enableRepeat(enableRepeat);

    //show 'to' fields for forward action
    var forwardOptions = document.getElementById(this._htmlElId + "_forward_options");
    if(forwardOptions) Dwt.setVisible(forwardOptions, this._isForward);

    var reminderOptions = document.getElementById(this._htmlElId + "_reminder_options");
    if(reminderOptions) Dwt.setVisible(reminderOptions, !this._isForward);

	// if first time reset'ing, delay saving form value since all widgets
	// (i.e. html editor) may not have finished initializing yet.
    if (firstTime || this._notesHtmlModeFirstTime) {   // Also, handling HTML mode specially as it takes some time to initialize.
		var ta = new AjxTimedAction(this, this._finishReset);
		AjxTimedAction.scheduleAction(ta, 500);
	} else {
		this._finishReset();
	}
};

ZmCalItemEditView.prototype._finishReset =
function() {
    var newMode = (this._mode == ZmCalItem.MODE_NEW);
    // save the original form data in its initialized state for edited appt
    this._origFormValue = newMode ? "" : this._formValue(false);
};

ZmCalItemEditView.prototype._getClone =
function() {
	// override
};

ZmCalItemEditView.prototype._populateForSave =
function(calItem) {
	// create a copy of the appointment so we don't muck w/ the original
	calItem.setViewMode(this._mode);

	// bug fix #5617 - check if there are any existing attachments that were unchecked
	if (this._mode != ZmCalItem.MODE_NEW) {
		var attCheckboxes = document.getElementsByName(ZmCalItem.ATTACHMENT_CHECKBOX_NAME);
		if (attCheckboxes && attCheckboxes.length > 0) {
			for (var i = 0; i < attCheckboxes.length; i++) {
				if (!attCheckboxes[i].checked)
					calItem.removeAttachment(attCheckboxes[i].value);
			}
		}
	}

	// save field values of this view w/in given appt
	calItem.setName(this._subjectField.getValue());

	var folderId = this._folderSelect.getValue();
	if (this._mode != ZmCalItem.MODE_NEW && this._calItem.folderId != folderId) {
		// if moving existing calitem across mail boxes, cache the new folderId
		// so we can save it as a separate request
		var origFolder = appCtxt.getById(this._calItem.folderId);
		var newFolder = appCtxt.getById(folderId);
		if (origFolder.isRemote() || newFolder.isRemote()) {
			calItem.__newFolderId = folderId;
			folderId = this._calItem.folderId;
		}
	}

	calItem.setFolderId(folderId);
	calItem.setOrganizer(this._calItem.organizer || this._calendarOrgs[folderId]);

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
		htmlPart.setContent(this._notesHtmlEditor.getContent(true, true));
		top.children.add(htmlPart);
	} else {
		top.setContentType(ZmMimeTable.TEXT_PLAIN);
		top.setContent(this._notesHtmlEditor.getContent());
	}

	calItem.notesTopPart = top;

	//set the reminder time for alarm
	if (this._hasReminderSupport) {
		//calItem.setReminderMinutes(this._reminderSelect.getValue());
        var reminderString = this._reminderSelectInput.getValue();
        if(!reminderString || reminderString == ZmMsg.apptRemindNever) {
            calItem.setReminderMinutes(0);                        
        }else {
            var reminderInfo = ZmCalendarApp.parseReminderString(reminderString);
            calItem.setReminderUnits(reminderInfo.reminderValue,  reminderInfo.reminderUnits);            
        }
	}

	return calItem;
};

ZmCalItemEditView.prototype._populateForEdit =
function(calItem, mode) {
	// set subject
	this._subjectField.setValue(calItem.getName());
	this._repeatSelect.setSelectedValue(calItem.getRecurType());

	// recurrence string
	this._setRepeatDesc(calItem);

	// attachments
	this._attachDiv = document.getElementById(this._attachDivId);
	if (this._attachDiv) {
		// Bug 19993: clear out the attachments to prevent duplicates in the display.
		this._attachDiv.innerHTML = "";
	}
	var attachList = calItem.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			this.addAttachmentField(calItem, attachList[i]);
	}

	this._setContent(calItem, mode);
	if (this._hasReminderSupport) {
		this.adjustReminderValue(calItem);
	}
};

ZmCalItemEditView.prototype.adjustReminderValue =
function(calItem) {
    this._reminderSelectInput.setValue(ZmCalendarApp.getReminderSummary(calItem._reminderMinutes));
    return
};

ZmCalItemEditView.prototype._setRepeatDesc =
function(calItem) {
	if (calItem.isCustomRecurrence()) {
		this._repeatDescField.innerHTML = calItem.getRecurBlurb();
	} else {
		this._repeatDescField.innerHTML = (calItem.getRecurType() != "NON")
			? AjxStringUtil.htmlEncode(ZmMsg.customize) : "";
	}
};

ZmCalItemEditView.prototype._setContent =
function(calItem, mode) {
    
	// set notes/content (based on compose mode per user prefs)
	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED) &&
		(appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML ||
		 mode != ZmCalItem.MODE_NEW && appCtxt.get(ZmSetting.VIEW_AS_HTML)))
	{
		this._controller.setFormatBtnItem(true, DwtHtmlEditor.HTML);
		this.setComposeMode(DwtHtmlEditor.HTML);
        var notesPart = calItem.getNotesPart(ZmMimeTable.TEXT_HTML)
        if(this._isForward) {
            var preface = [ZmMsg.DASHES, " ", ZmMsg.originalAppointment, " ", ZmMsg.DASHES].join("");
            var crlf2 = "<br><br>";
            var crlf = "<br>";
            notesPart = crlf2 + preface + crlf + calItem.getInviteDescription(true);
            notesPart = this.formatContent(notesPart, true);
        }
		this._notesHtmlEditor.setContent(notesPart);
	}
	else {
		this._controller.setFormatBtnItem(true, ZmMimeTable.TEXT_PLAIN);
		this.setComposeMode(DwtHtmlEditor.TEXT);
        var notesPart = calItem.getNotesPart(ZmMimeTable.TEXT_PLAIN);
        if(this._isForward) {
            var preface = [ZmMsg.DASHES, " ", ZmMsg.originalAppointment, " ", ZmMsg.DASHES].join("");
            var crlf2 = ZmMsg.CRLF2;
            var crlf = ZmMsg.CRLF;
            notesPart = crlf2 + preface + crlf + calItem.getInviteDescription(false);
            notesPart = this.formatContent(notesPart, false);
        }
		this._notesHtmlEditor.setContent(notesPart);
	}
};

ZmCalItemEditView.prototype.formatContent =
function(body, composingHtml) {

    var includePref = appCtxt.get(ZmSetting.FORWARD_INCLUDE_ORIG);
    if (includePref == ZmSetting.INCLUDE_PREFIX || includePref == ZmSetting.INCLUDE_PREFIX_FULL) {
        var preface = (composingHtml ? '<br>' : '\n');
		var wrapParams = ZmHtmlEditor.getWrapParams(composingHtml);
		wrapParams.text = body;
        body = preface + AjxStringUtil.wordWrap(wrapParams);
    }
    return body;
};

/**
 * sets any recurrence rules w/in given ZmCalItem object
*/
ZmCalItemEditView.prototype._getRecurrence =
function(calItem) {
	var repeatType = this._repeatSelect.getValue();

	if (this._recurDialog && repeatType == "CUS") {
		calItem.setRecurType(this._recurDialog.getSelectedRepeatValue());

		switch (calItem.getRecurType()) {
			case "DAI": this._recurDialog.setCustomDailyValues(calItem); break;
			case "WEE": this._recurDialog.setCustomWeeklyValues(calItem); break;
			case "MON": this._recurDialog.setCustomMonthlyValues(calItem); break;
			case "YEA": this._recurDialog.setCustomYearlyValues(calItem); break;
		}

		// set the end recur values
		this._recurDialog.setRepeatEndValues(calItem);
	} else {
		calItem.setRecurType(repeatType != "CUS" ? repeatType : "NON");
		this._resetRecurrence(calItem);
	}
};

ZmCalItemEditView.prototype._enableRepeat =
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

ZmCalItemEditView.prototype._createHTML =
function() {
	// override
};

ZmCalItemEditView.prototype._createWidgets =
function(width) {
	// subject DwtInputField
	var params = {
		parent: this,
		parentElement: (this._htmlElId + "_subject"),
		type: DwtInputField.STRING,
		errorIconStyle: DwtInputField.ERROR_ICON_NONE,
		validationStyle: DwtInputField.CONTINUAL_VALIDATION
	};
	this._subjectField = new DwtInputField(params);
	this._subjectField.setRequired();
	Dwt.setSize(this._subjectField.getInputElement(), width, "22px");

	// CalItem folder DwtSelect
	this._folderSelect = new DwtSelect({parent:this, parentElement:(this._htmlElId + "_folderSelect")});

	// recurrence DwtSelect
	this._repeatSelect = new DwtSelect({parent:this, parentElement:(this._htmlElId + "_repeatSelect")});
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}

	this._hasReminderSupport = Boolean(Dwt.byId(this._htmlElId + "_reminderSelect") != null);

	// start/end date DwtButton's
	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	// start/end date DwtCalendar's
	this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._htmlElId + "_startMiniCalBtn", dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._htmlElId + "_endMiniCalBtn", dateButtonListener, dateCalSelectionListener);

	if (this._hasReminderSupport) {
		var params = {
			parent: this,
			parentElement: (this._htmlElId + "_reminderSelectInput"),
			type: DwtInputField.STRING,
			errorIconStyle: DwtInputField.ERROR_ICON_NONE,
			validationStyle: DwtInputField.CONTINUAL_VALIDATION
		};
		this._reminderSelectInput = new DwtInputField(params);
		var reminderInputEl = this._reminderSelectInput.getInputElement();
		Dwt.setSize(reminderInputEl, Dwt.DEFAULT, "22px");
		reminderInputEl.onblur = AjxCallback.simpleClosure(this._handleReminderOnBlur, this, reminderInputEl);

		var reminderButtonListener = new AjxListener(this, this._reminderButtonListener);
		var reminderSelectionListener = new AjxListener(this, this._reminderSelectionListener);
		this._reminderButton = ZmCalendarApp.createReminderButton(this, this._htmlElId + "_reminderSelect", reminderButtonListener, reminderSelectionListener);
	}

	// notes ZmHtmlEditor
	if (window.isTinyMCE) {
		this._notesHtmlEditor = new ZmAdvancedHtmlEditor(this, null, null, this._composeMode);
		this._notesHtmlEditor.addOnContentIntializedListener(new AjxCallback(this,this.resizeNotesEditor));
        //tinymce editor issue: reparenting the container breaks the editor
		//this._notesHtmlEditor.reparentHtmlElement(this._htmlElId + "_notes");
		// bug: 19079 to avoid access denied exception set some content which corrects the doc domain
		this._notesHtmlEditor.setContent("");
	} else {
		this._notesHtmlEditor = new ZmHtmlEditor(this, null, null, this._composeMode);
		this._notesHtmlEditor.reparentHtmlElement(this._htmlElId + "_notes");
		// bug: 19079 to avoid access denied exception set some content which corrects the doc domain
		this._notesHtmlEditor.setContent("");
	}
};

ZmCalItemEditView.prototype._handleReminderOnBlur =
function(inputEl) {
	var reminderString = inputEl.value;

	if (!reminderString) {
		inputEl.value = ZmMsg.apptRemindNever;
		return;
	}

	var reminderInfo = ZmCalendarApp.parseReminderString(reminderString);
	var reminderMinutes = ZmCalendarApp.convertReminderUnits(reminderInfo.reminderValue, reminderInfo.reminderUnits);
	inputEl.value = ZmCalendarApp.getReminderSummary(reminderMinutes);
};

ZmCalItemEditView.prototype._addEventHandlers =
function() {
	// override
};

// cache all input fields so we dont waste time traversing DOM each time
ZmCalItemEditView.prototype._cacheFields =
function() {
	this._folderRow			= document.getElementById(this._htmlElId + "_folderRow");
	this._startDateField 	= document.getElementById(this._htmlElId + "_startDateField");
	this._endDateField 		= document.getElementById(this._htmlElId + "_endDateField");
	this._repeatDescField 	= document.getElementById(this._repeatDescId); 		// dont delete!
};

ZmCalItemEditView.prototype._initAttachContainer =
function() {
	// create new table row which will contain parent fieldset
	var table = document.getElementById(this._htmlElId + "_table");
	this._attachmentRow = table.insertRow(-1);
	this._attachmentRow.style.height = AjxEnv.isIE ? "auto" : 22;
	var cell = this._attachmentRow.insertCell(-1);
	cell.colSpan = 2;

	this._uploadFormId = Dwt.getNextId();
	this._attachDivId = Dwt.getNextId();

	var subs = {
		uploadFormId: this._uploadFormId,
		attachDivId: this._attachDivId,
		url: appCtxt.get(ZmSetting.CSFE_UPLOAD_URI)+"&fmt=extended"
	};

	cell.innerHTML = AjxTemplate.expand("calendar.Appointment#AttachContainer", subs);
};

// Returns true if any of the attachment fields are populated
ZmCalItemEditView.prototype._gotAttachments =
function() {
	var atts = document.getElementsByName(ZmCalItemEditView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++) {
		if (atts[i].value.length)
			return true;
	}

	return false;
};

ZmCalItemEditView.prototype._removedAttachments =
function(){
    var attCheckboxes = document.getElementsByName(ZmCalItem.ATTACHMENT_CHECKBOX_NAME);
	if (attCheckboxes && attCheckboxes.length > 0) {
		for (var i = 0; i < attCheckboxes.length; i++) {
			if (!attCheckboxes[i].checked) {
				return true;
			}
		}
	}
    return false;
};

ZmCalItemEditView.prototype._removeAttachment =
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
		if (this._attachCount == ZmCalItemEditView.SHOW_MAX_ATTACHMENTS) {
			this._attachDiv.style.height = "";
		}
		this._resizeNotes();
	}
};

ZmCalItemEditView.prototype._removeAllAttachments =
function() {
	if (this._attachCount == 0) { return; }

	// let's be paranoid and really cleanup
	delete this._uploadFormId;
	delete this._attachDivId;
	delete this._attachRemoveId;
	delete this._attachDiv;
	this._attachDiv = this._attachRemoveId = this._attachDivId = this._uploadFormId = null;
	// finally, nuke the whole table row
	var table = document.getElementById(this._htmlElId + "_table");
	table.deleteRow(table.rows.length-1);
	delete this._attachmentRow;
	this._attachmentRow = null;
	// reset any attachment related vars
	this._attachCount = 0;
};

ZmCalItemEditView.prototype._submitAttachments =
function() {
	var callback = new AjxCallback(this, this._attsDoneCallback);
	var um = appCtxt.getUploadManager();
	window._uploadManager = um;
	um.execute(callback, document.getElementById(this._uploadFormId));
};

ZmCalItemEditView.prototype._showRecurDialog =
function(repeatType) {
	if (!this._repeatSelectDisabled) {
		this._initRecurDialog(repeatType);
		this._recurDialog.popup();
	}
};

ZmCalItemEditView.prototype._initRecurDialog =
function(repeatType) {
	if (!this._recurDialog) {
		this._recurDialog = new ZmApptRecurDialog(appCtxt.getShell());
		this._recurDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._recurOkListener));
		this._recurDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._recurCancelListener));
	}
	var type = repeatType || this._recurDialogRepeatValue;
	var sd = (AjxDateUtil.simpleParseDateStr(this._startDateField.value)) || (new Date());
	var ed = (AjxDateUtil.simpleParseDateStr(this._endDateField.value)) || (new Date());
	this._recurDialog.initialize(sd, ed, type, this._calItem);
};

ZmCalItemEditView.prototype._showTimeFields =
function(show) {
	// override if applicable
};

// Returns a string representing the form content
ZmCalItemEditView.prototype._formValue =
function(excludeAttendees) {
	// override
};

ZmCalItemEditView.prototype.resizeNotesEditor =
function() {
    this._notesHtmlEditor.resizeWidth('100%');
    this._resizeNotes();
};

ZmCalItemEditView.prototype._resizeNotes =
function() {
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	if (this._bodyFieldId != bodyFieldId) {
		this._bodyFieldId = bodyFieldId;
		this._bodyField = document.getElementById(this._bodyFieldId);
	}

	var size = this.getSize();
	if (size.x <= 0 || size.y <= 0) { return; }

	var topDiv = document.getElementById(this._htmlElId + "_top");
	var topHeight = Dwt.getSize(topDiv).y;
	var rowHeight = size.y - topHeight;
	var hFudge = (this._composeMode == DwtHtmlEditor.HTML) ? 50 : 15;
	var wFudge = AjxEnv.isIE ? size.x-20 : Dwt.DEFAULT;
	if(window.isTinyMCE) {
        this._notesHtmlEditor.setSize(size.x-5, rowHeight)   
    }else {
        Dwt.setSize(this._bodyField, wFudge, rowHeight - hFudge);
    }
};

ZmCalItemEditView.prototype._handleRepeatDescFieldHover =
function(ev, isHover) {
	if (isHover) {
		var html = this._repeatDescField.innerHTML;
		if (html && html.length > 0) {
			this._repeatDescField.style.cursor = this._repeatSelectDisabled
				? "default" : "pointer";

			if (this._rdfTooltip == null) {
				this._rdfTooltip = appCtxt.getShell().getToolTip();
			}

			var content = ["<div style='width:300px'>", html, "</div>"].join("");
			this._rdfTooltip.setContent(content);
			this._rdfTooltip.popup((ev.pageX || ev.clientX), (ev.pageY || ev.clientY));
		}
	} else {
		if (this._rdfTooltip) {
			this._rdfTooltip.popdown();
		}
	}
};


// Listeners

ZmCalItemEditView.prototype._dateButtonListener =
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

ZmCalItemEditView.prototype._reminderButtonListener =
function(ev) {
	var menu = ev.item.getMenu();
	var reminderItem = menu.getItem(0);
	ev.item.popup();
};

ZmCalItemEditView.prototype._reminderSelectionListener =
function(ev) {
    if(ev.item && ev.item instanceof DwtMenuItem){
       this._reminderSelectInput.setValue(ev.item.getText());
       this._reminderValue = ev.item.getData("value");
       return;
    }    
};

ZmCalItemEditView.prototype._dateCalSelectionListener =
function(ev) {
	var parentButton = ev.item.parent.parent;
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	this._oldStartDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	this._oldEndDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);	

	// change the start/end date if they mismatch
	if (parentButton == this._startDateButton) {
		var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
		if (ed && (ed.valueOf() < ev.detail.valueOf()))
			this._endDateField.value = newDate;
		this._startDateField.value = newDate;
	} else {
		var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		if (sd && (sd.valueOf() > ev.detail.valueOf()))
			this._startDateField.value = newDate;
		this._endDateField.value = newDate;
	}
	var calItem = this._calItem;
	var repeatType = this._repeatSelect.getValue();
	
	if (calItem.isCustomRecurrence() &&
		this._mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
	{
		this._checkRecurrenceValidity = true;
		this._initRecurDialog(repeatType);
		this._recurOkListener();		
	}
	else
	{
		var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		this._calItem._recurrence.setRecurrenceStartTime(sd.getTime());
		this._setRepeatDesc(this._calItem);
	}
};

ZmCalItemEditView.prototype._resetRecurrence =
function(calItem) {
	var recur = calItem._recurrence;
	if(!recur) { return; }
	var startTime = calItem.getStartTime();
	recur.setRecurrenceStartTime(startTime);
};

ZmCalItemEditView.prototype._repeatChangeListener =
function(ev) {
	var newSelectVal = ev._args.newValue;
	if (newSelectVal == "CUS") {
		this._oldRepeatValue = ev._args.oldValue;
		this._showRecurDialog();
	} else {
		this._repeatDescField.innerHTML = newSelectVal != "NON" ? AjxStringUtil.htmlEncode(ZmMsg.customize) : "";
	}
	this.notifyListeners(ZmCalItemEditView._REPEAT_CHANGE, ev);
};

ZmCalItemEditView.prototype._recurOkListener =
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
			var temp = this._getClone(this._calItem);
			this._getRecurrence(temp);
			var sd = (AjxDateUtil.simpleParseDateStr(this._startDateField.value));
			// If date changed...chnage the values
			if (temp._recurrence._startDate.getDate() != sd.getDate() ||
				temp._recurrence._startDate.getMonth() != sd.getMonth() ||
				temp._recurrence._startDate.getFullYear() != sd.getFullYear())
			{
				if (this._checkRecurrenceValidity) {
					this.validateRecurrence(temp._recurrence._startDate, temp._recurrence._startDate, sd, temp);
					this._checkRecurrenceValidity = false;
				} else {
					this._startDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
					this._endDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
					this.startDate = temp._recurrence._startDate;
					this.endDate = temp._recurrence._startDate;
					this._calItem._startDate = this.startDate ;
					this._calItem._endDate = this.startDate ;
					this._setRepeatDesc(temp);
				}

			} else {
				this._setRepeatDesc(temp);
			}
		} else {
			// give feedback to user about errors in recur dialog
			popdown = false;
		}
	}

	if (popdown) {
		this._recurDialog.popdown();
	}
};

ZmCalItemEditView.prototype.validateRecurrence =
function(startDate,  endDate, sd, temp) {
	this._newRecurrenceStartDate = startDate;
	this._newRecurrenceEndDate = endDate;	

	var ps = this._dateResetWarningDlg = appCtxt.getYesNoMsgDialog();
	ps.reset();
	ps.setMessage(ZmMsg.validateRecurrence, DwtMessageDialog.WARNING_STYLE);

	ps.registerCallback(DwtDialog.YES_BUTTON, this._dateChangeCallback, this, [startDate, endDate, sd, temp]);
	ps.registerCallback(DwtDialog.NO_BUTTON, this._ignoreDateChangeCallback, this, [startDate, endDate, sd, temp]);
	ps.popup();
};

ZmCalItemEditView.prototype._dateChangeCallback =
function(startDate,  endDate, sd, temp) {
	this._dateResetWarningDlg .popdown();
	this._startDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
	this.startDate = temp._recurrence._startDate;
	this.endDate = temp._recurrence._startDate;
	this._calItem._startDate = this.startDate ;
	this._calItem._endDate = this.startDate ;
	this._setRepeatDesc(temp);
};

ZmCalItemEditView.prototype._ignoreDateChangeCallback =
function(startDate,  endDate, sd, temp) {
	this._dateResetWarningDlg.popdown();
	if (this._oldStartDate && this._oldEndDate) {
		this._startDateField.value = AjxDateUtil.simpleComputeDateStr(this._oldStartDate);
		this._endDateField.value = AjxDateUtil.simpleComputeDateStr(this._oldEndDate);
		this.startDate = this._oldStartDate;
		this.endDate = this._oldEndDate;
		this._calItem._startDate = this.startDate;
		this._calItem._endDate = this.endDate;
		if (this._calItem._recurrence) {
			this._calItem._recurrence._startDate.setTime(this.startDate.getTime());
		}
		this._setRepeatDesc(this._calItem);
	}
};

ZmCalItemEditView.prototype._recurCancelListener =
function(ev) {
	// reset the selected option to whatever it was before user canceled
	this._repeatSelect.setSelectedValue(this._oldRepeatValue);
	this._recurDialog.popdown();
};


// Callbacks

ZmCalItemEditView.prototype._attsDoneCallback =
function(status, attId) {
	DBG.println(AjxDebug.DBG1, "Attachments: status = " + status + ", attId = " + attId);
	if (status == AjxPost.SC_OK) {
		//Checking for Zero sized/wrong path attachments
		var zeroSizedAttachments = false;
		if (typeof attId != "string") {
			var attachmentIds = [];
			for (var i = 0; i < attId.length; i++) {
				var att = attId[i];
				if (att.s == 0) {
					zeroSizedAttachments = true;
					continue;
				}
				attachmentIds.push(att.aid);
			}
			attId = attachmentIds.length > 0 ? attachmentIds.join(",") : null;
		}
		if (zeroSizedAttachments){
			appCtxt.setStatusMsg(ZmMsg.zeroSizedAtts);
		}
		var isSaved = this._controller.saveCalItem(attId);
        if(isSaved) {
            this._controller.closeView();   
        }
	} else if (status == AjxPost.SC_UNAUTHORIZED) {
		// auth failed during att upload - let user relogin, continue with compose action
		var ex = new AjxException("401 response during attachment upload", ZmCsfeException.SVC_AUTH_EXPIRED);
		var callback = new AjxCallback(this._controller, isDraft ? this._controller.saveDraft : this._controller._send);
		this._controller._handleException(ex, {continueCallback:callback});
	} else {
		// bug fix #2131 - handle errors during attachment upload.
		var msg = AjxMessageFormat.format(ZmMsg.errorAttachment, (status || AjxPost.SC_NO_CONTENT));
		switch (status) {
			// add other error codes/message here as necessary
			case AjxPost.SC_REQUEST_ENTITY_TOO_LARGE: 	msg += " " + ZmMsg.errorAttachmentTooBig + "<br><br>"; break;
			default: 									msg += " "; break;
		}

		this._controller.popupErrorDialog(msg + ZmMsg.errorTryAgain, null, null, true);		
	}
};

ZmCalItemEditView.prototype._getDefaultFocusItem =
function() {
	return this._subjectField;
};

ZmCalItemEditView.prototype._handleOnClick =
function(el) {
	// figure out which input field was clicked
	if (el.id == this._repeatDescId) {
		this._oldRepeatValue = this._repeatSelect.getValue();
		this._showRecurDialog(this._oldRepeatValue);
	} else if (el.id.indexOf("_att_") != -1) {
		this._removeAttachment(el.id);
	}
};

ZmCalItemEditView.prototype.handleStartDateChange =
function(sd) {	
	var calItem = this._calItem;
	var repeatType = this._repeatSelect.getValue();
	if (calItem.isCustomRecurrence() &&
		this._mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE)
	{
		var temp = this._getClone(this._calItem);		
		this._oldStartDate = temp._startDate;
		this._oldEndDate = temp._endDate;
		this._checkRecurrenceValidity = true;
		this._initRecurDialog(repeatType);
		this._recurOkListener();		
	}
	else
	{
		calItem._recurrence.setRecurrenceStartTime(sd.getTime());
		this._setRepeatDesc(calItem);
	}
};

// Static methods

ZmCalItemEditView._onClick =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
	if (edv) {
		edv._handleOnClick(el);
	}
};

ZmCalItemEditView._onKeyDown =
function(ev) {
	ev = ev || window.event;
	var el = DwtUiEvent.getTarget(ev);
	if (el.id.indexOf("_att_") != -1) {
		// ignore enter key press in IE otherwise it tries to send the attachment!
		var key = DwtKeyEvent.getCharCode(ev);
		return (key != DwtKeyEvent.KEY_ENTER && key != DwtKeyEvent.KEY_END_OF_TEXT);
	}
};

ZmCalItemEditView._onMouseOver =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
	if (el == edv._repeatDescField) {
		edv._handleRepeatDescFieldHover(ev, true);
	}
};

ZmCalItemEditView._onMouseOut =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
	if (el == edv._repeatDescField) {
		edv._handleRepeatDescFieldHover(ev, false);
	}
};

ZmCalItemEditView._onChange =
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var edv = AjxCore.objectWithId(el._editViewId);
	var sdField = edv._startDateField;
	var edField = edv._endDateField;
	ZmApptViewHelper.handleDateChange(sdField, edField, (el == sdField));

	var calItem = edv._calItem;
	var sd = AjxDateUtil.simpleParseDateStr(sdField.value);
	edv.handleStartDateChange(sd);
};
