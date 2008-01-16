/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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
 * @param parent			[DwtControl]				some container
 * @param attendees			[hash]*						attendees/locations/equipment
 * @param controller		[ZmController]				the compose controller for this view
 * @param dateInfo			[object]*					hash of date info
 * @param posStyle			[String]*					[static|relative|absolute]
 */
ZmCalItemEditView = function(parent, attendees, controller, dateInfo, posStyle) {
	if (arguments.length == 0) { return; }

	DwtComposite.call(this, parent, null, posStyle);

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

	this._kbMgr = appCtxt.getShell().getKeyboardMgr();
};

ZmCalItemEditView.prototype = new DwtComposite;
ZmCalItemEditView.prototype.constructor = ZmCalItemEditView;

ZmCalItemEditView.prototype.toString =
function() {
	return "ZmCalItemEditView";
};


// Consts

ZmCalItemEditView.UPLOAD_FIELD_NAME = "attUpload_" + Dwt.getNextId();
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
function(calItem, mode, isDirty) {
	this._calItem = calItem;
	this._isDirty = isDirty;

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
	this._notesHtmlEditor.clear();

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

/**
/* @param excludeAttendees		check for dirty fields excluding the attendees field
*/
ZmCalItemEditView.prototype.isDirty =
function(excludeAttendees) {
	var formValue = excludeAttendees && this._origFormValueMinusAttendees
		? this._origFormValueMinusAttendees
		: this._origFormValue;

	return (this._gotAttachments()) ||
			this._isDirty ||
		   (this._formValue(excludeAttendees) != formValue);
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
 * already exist, creates the attachments container. If @attach param provided,
 * user is opening an existing appointment w/ an attachment and therefore
 * display differently
 */
ZmCalItemEditView.prototype.addAttachmentField =
function(calItem, attach) {
	if (this._attachCount == 0)
		this._initAttachContainer();

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
		var html = [];
		var i = 0;

		html[i++] = "<nobr>&nbsp;<input type='file' size=40 name='";
		html[i++] = ZmCalItemEditView.UPLOAD_FIELD_NAME;
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

ZmCalItemEditView.prototype.getHtmlEditor =
function() {
	return this._notesHtmlEditor;
};

/**
* Returns a joined string of email addresses.
*/
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
	this._resetFolderSelect(calItem, mode);
	this.enableInputs(true);

	// lets always attempt to populate even if we're dealing w/ a "new" calItem
	this._populateForEdit(calItem, mode);

	// disable the recurrence select object for editing single instance
	this._enableRepeat(mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE);

	// if first time reset'ing, delay saving form value since all widgets
	// (i.e. html editor) may not have finished initializing yet.
	if (firstTime) {
		var ta = new AjxTimedAction(this, this._finishReset);
		AjxTimedAction.scheduleAction(ta, 250);
	} else {
		this._finishReset();
	}
};

ZmCalItemEditView.prototype._finishReset =
function() {
	// save the original form data in its initialized state
	this._origFormValue = this._formValue(false);
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
	calItem.setFolderId(folderId);
	calItem.setOrganizer(this._calendarOrgs[folderId]);

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

	calItem.notesTopPart = top;

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
};

ZmCalItemEditView.prototype._setRepeatDesc = function(calItem) {
	if (calItem.isCustomRecurrence()) {
		this._repeatDescField.innerHTML = calItem.getRecurBlurb();
	} else {
		this._repeatDescField.innerHTML = calItem.getRecurType() != "NON" ? AjxStringUtil.htmlEncode(ZmMsg.customize) : "";
	}
};

ZmCalItemEditView.prototype._setContent =
function(calItem, mode) {
	// set notes/content (based on compose mode per user prefs)
	if (appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED) &&
		(appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML ||
		 mode != ZmCalItem.MODE_NEW && appCtxt.get(ZmSetting.VIEW_AS_HTML)))
	{
		this.setComposeMode(DwtHtmlEditor.HTML);
		this._notesHtmlEditor.setContent(calItem.getNotesPart(ZmMimeTable.TEXT_HTML));
	} else {
		this.setComposeMode(DwtHtmlEditor.TEXT);
		this._notesHtmlEditor.setContent(calItem.getNotesPart(ZmMimeTable.TEXT_PLAIN));
	}
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
	this._subjectField = new DwtInputField({parent: this, type:DwtInputField.STRING,
											errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											validationStyle: DwtInputField.CONTINUAL_VALIDATION,
											skipCaretHack:true});
	this._subjectField.setRequired();
	Dwt.setSize(this._subjectField.getInputElement(), width, "22px");
	this._subjectField.reparentHtmlElement(this._htmlElId + "_subject");

	// CalItem folder DwtSelect
	this._folderSelect = new DwtSelect(this);
	this._folderSelect.reparentHtmlElement(this._htmlElId + "_folderSelect");

	// recurrence DwtSelect
	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptViewHelper.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptViewHelper.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	this._repeatSelect.reparentHtmlElement(this._htmlElId + "_repeatSelect");

	// start/end date DwtButton's
	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);
	// start/end date DwtCalendar's
	this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._htmlElId+"_startMiniCalBtn", dateButtonListener, dateCalSelectionListener);
	this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._htmlElId+"_endMiniCalBtn", dateButtonListener, dateCalSelectionListener);

	// notes ZmHtmlEditor
	this._notesHtmlEditor = new ZmHtmlEditor(this, null, null, this._composeMode);
	this._notesHtmlEditor.reparentHtmlElement(this._htmlElId + "_notes");
	//bug:19079 to avoid access denied exception set some content which corrects the doc domain
	this._notesHtmlEditor.setContent("");	
};

ZmCalItemEditView.prototype._addEventHandlers =
function() {
	// override
};

// cache all input fields so we dont waste time traversing DOM each time
ZmCalItemEditView.prototype._cacheFields =
function() {
	this._folderLabelField 	= document.getElementById(this._htmlElId + "_folderLabel");
	this._startDateField 	= document.getElementById(this._htmlElId + "_startDateField");
	this._endDateField 		= document.getElementById(this._htmlElId + "_endDateField");
	this._repeatDescField 	= document.getElementById(this._repeatDescId); 			// dont delete!
};

ZmCalItemEditView.prototype._resetFolderSelect =
function(calItem, mode) {
	// get all calendar folders
	var org = ZmOrganizer.ITEM_ORGANIZER[calItem.type];
	var folderTree = appCtxt.getFolderTree();
	var data = folderTree ? folderTree.getByType(org) : [];
	var len = data.length;

	// look for calItem's calendar
	this._folderSelect.clearOptions();
	this._calendarOrgs = {};
	var itemCal;
	for (var i = 0; i < len; i++) {
		var cal = data[i];
		if (cal.id == calItem.folderId) {
			itemCal = cal;
			break;
		}
	}

	for (var i = 0; i < len; i++) {
		var cal = data[i];
		var id = cal.link ? cal.getRemoteId() : cal.id;
		this._calendarOrgs[id] = cal.owner;
		// don't show calendar if feed, or remote and don't have write perms
		if (cal.isFeed() ||
			(cal.link && cal.shares && cal.shares.length > 0 && !cal.shares[0].isWrite()))
		{
			continue;
		}
		this._folderSelect.addOption(cal.getName(), false, id);
	}
	var num = this._folderSelect.size();
	Dwt.setVisibility(this._folderSelect.getHtmlElement(), num > 1);
	Dwt.setVisibility(this._folderLabelField, num > 1);

	this._folderSelect.setSelectedValue(calItem.folderId);
};

ZmCalItemEditView.prototype._initAttachContainer =
function() {
	// create new table row which will contain parent fieldset
	var table = document.getElementById(this._htmlElId + "_table");
	this._attachmentRow = table.insertRow(-1);
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
	html[i++] = appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	html[i++] = "' id='";
	html[i++] = this._uploadFormId;
	html[i++] = "' enctype='multipart/form-data'><div id='";
	html[i++] = this._attachDivId;
	html[i++] = "' style='overflow:auto'></div></form>";

	html[i++] = "</fieldset>";
	cell.innerHTML = html.join("");
};

// Returns true if any of the attachment fields are populated
ZmCalItemEditView.prototype._gotAttachments =
function() {
	var atts = document.getElementsByName(ZmCalItemEditView.UPLOAD_FIELD_NAME);

	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;

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
		if (this._attachCount == ZmCalItemEditView.SHOW_MAX_ATTACHMENTS)
			this._attachDiv.style.height = "";
		this._resizeNotes();
	}
};

ZmCalItemEditView.prototype._removeAllAttachments =
function() {
	if (this._attachCount == 0) return;

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

ZmCalItemEditView.prototype._resizeNotes =
function() {
	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	if (this._bodyFieldId != bodyFieldId) {
		this._bodyFieldId = bodyFieldId;
		this._bodyField = document.getElementById(this._bodyFieldId);
	}

	var size = this.getSize();
	if (size.x <= 0 || size.y <= 0)
		return;

	var topDiv = document.getElementById(this._htmlElId + "_top");
	var topHeight = Dwt.getSize(topDiv).y;
	var rowHeight = size.y - topHeight;
	var hFudge = (this._composeMode == DwtHtmlEditor.HTML) ? 50 : 15;
	var wFudge = AjxEnv.isIE ? size.x-20 : Dwt.DEFAULT;
	Dwt.setSize(this._bodyField, wFudge, rowHeight - hFudge);
};

ZmCalItemEditView.prototype._handleRepeatDescFieldHover =
function(ev, isHover) {
	if (isHover) {
		this._repeatDescField.style.cursor = this._repeatSelectDisabled
			? "default" : "pointer";

		if (this._rdfTooltip == null) {
			this._rdfTooltip = appCtxt.getShell().getToolTip();
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
	if(calItem.isCustomRecurrence()){
		this._checkRecurrenceValidity = true;
		this._initRecurDialog(repeatType);
		this._recurOkListener();		
	}else{
		var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
		this._calItem._recurrence._startDate.setTime(sd.getTime());
		this._setRepeatDesc(this._calItem);
	}
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
            if(temp._recurrence._startDate.getDate()!= sd.getDate() ||
                temp._recurrence._startDate.getMonth()!= sd.getMonth() ||
                temp._recurrence._startDate.getFullYear()!= sd.getFullYear() ){            // If date changed...chnage the values
               	if(this._checkRecurrenceValidity) {
	                this.validateRecurrence(temp._recurrence._startDate, temp._recurrence._startDate, sd, temp);
               		this._checkRecurrenceValidity = false;
               	}else{
	                this._startDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
    	            this._endDateField.value = AjxDateUtil.simpleComputeDateStr(temp._recurrence._startDate);
	                this.startDate = temp._recurrence._startDate;
    	            this.endDate = temp._recurrence._startDate;
        	        this._calItem._startDate = this.startDate ;
            	    this._calItem._endDate = this.startDate ;
					this._setRepeatDesc(temp);
               	}

            }else{
				this._setRepeatDesc(temp);
            }
		} else {
			// give feedback to user about errors in recur dialog
			popdown = false;
		}
	}

	if (popdown)
		this._recurDialog.popdown();
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
	this._dateResetWarningDlg .popdown();
	if(this._oldStartDate && this._oldEndDate){
	    this._startDateField.value = AjxDateUtil.simpleComputeDateStr(this._oldStartDate);
    	this._endDateField.value = AjxDateUtil.simpleComputeDateStr(this._oldEndDate);
	    this.startDate = this._oldStartDate;
    	this.endDate = this._oldEndDate;
	    this._calItem._startDate = this.startDate;
    	this._calItem._endDate = this.endDate;
    	if(this._calItem._recurrence) {
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
	if (status == 200) {
		this._controller.saveCalItem(attId);
	} else {
		DBG.println(AjxDebug.DBG1, "attachment error: " + status);
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
	if(calItem.isCustomRecurrence()){
		var temp = this._getClone(this._calItem);		
		this._oldStartDate = temp._startDate;
		this._oldEndDate = temp._endDate;
		this._checkRecurrenceValidity = true;
		this._initRecurDialog(repeatType);
		this._recurOkListener();		
	}else{
		calItem._recurrence._startDate.setTime(sd.getTime());
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