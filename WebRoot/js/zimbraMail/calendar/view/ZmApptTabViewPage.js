/**
* Creates a new tab view that can be used to overload DwtTabView base class methods
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
* @param appCtxt 		app context
* @param className 		class name for this view
* @param posStyle		positioning style
*/
function ZmApptTabViewPage(parent, appCtxt, className, posStyle) {
	DwtTabViewPage.call(this, parent, className, posStyle);
	this.setScrollStyle(DwtControl.CLIP);
	this._appCtxt = appCtxt;
	this._rendered = false;
	this._contactsSupported = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) || this._appCtxt.get(ZmSetting.GAL_ENABLED);

	var bComposeEnabled = this._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	var composeFormat = this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
	this._composeMode = this._defaultComposeMode = bComposeEnabled && composeFormat == ZmSetting.COMPOSE_HTML
		? DwtHtmlEditor.HTML : DwtHtmlEditor.TEXT;
};

ZmApptTabViewPage.prototype = new DwtTabViewPage;
ZmApptTabViewPage.prototype.constructor = ZmApptTabViewPage;

ZmApptTabViewPage.prototype.toString = 
function() {
	return "ZmApptTabViewPage";
};


// Consts

ZmApptTabViewPage.IFRAME_HEIGHT = "30px";
ZmApptTabViewPage.UPLOAD_FIELD_NAME = "attUpload";

ZmApptTabViewPage.REMINDER_OPTIONS = [
	{ label: ZmMsg.none, 				value: "none", 	selected: true 	},
	{ label: ZmMsg.showMessage, 		value: "show", 	selected: false }];

ZmApptTabViewPage.REMINDER_TIME_OPTIONS = [
	{ label: ZmMsg.atStartTime, 		value: 0, 		selected: true 	},
	{ label: "5 " + AjxMsg.minutes, 	value: 5, 		selected: false },
	{ label: "10 " + AjxMsg.minutes,	value: 10, 		selected: false },
	{ label: "15 " + AjxMsg.minutes,	value: 15, 		selected: false },
	{ label: "30 " + AjxMsg.minutes, 	value: 30, 		selected: false },
	{ label: "1 " + AjxMsg.hour, 		value: 60, 		selected: false },
	{ label: "2 " + AjxMsg.hours, 		value: 120, 	selected: false },
	{ label: "3 " + AjxMsg.hours, 		value: 180, 	selected: false },
	{ label: "4 " + AjxMsg.hours, 		value: 240, 	selected: false },
	{ label: "8 " + AjxMsg.hours, 		value: 480, 	selected: false },
	{ label: "12 " + AjxMsg.hours,		value: 720, 	selected: false },
	{ label: "1 " + AjxMsg.day,			value: 1440, 	selected: false },
	{ label: "2 " + AjxMsg.days,		value: 2880, 	selected: false },
	{ label: "3 " + AjxMsg.days,		value: 4320, 	selected: false },
	{ label: "4 " + AjxMsg.days,		value: 5760, 	selected: false },
	{ label: "1 " + AjxMsg.week,		value: 10080, 	selected: false },
	{ label: "2 " + AjxMsg.weeks,		value: 20160, 	selected: false }];

ZmApptTabViewPage.SHOWAS_OPTIONS = [
	{ label: ZmMsg.free, 				value: "free", 	selected: true 	},
	{ label: ZmMsg.replyTentative, 		value: "tentative", selected: false },
	{ label: ZmMsg.busy, 				value: "busy", 	selected: false },
	{ label: ZmMsg.outOfOffice,			value: "out", 	selected: false }];

ZmApptTabViewPage.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 				value: "NON", 	selected: true 	},
	{ label: ZmMsg.everyDay, 			value: "DAI", 	selected: false },
	{ label: ZmMsg.everyWeek, 			value: "WEE", 	selected: false },
	{ label: ZmMsg.everyMonth, 			value: "MON", 	selected: false },
	{ label: ZmMsg.everyYear, 			value: "YEA", 	selected: false },
	{ label: ZmMsg.custom, 				value: "CUS", 	selected: false }];


// Public

ZmApptTabViewPage.prototype.showMe = 
function() {
	if (!this._rendered) {
		this._createHTML();
		this._rendered = true;
	}
	DwtTabViewPage.prototype.showMe.call(this);
	this.parent.tabSwitched(this._tabKey);
};

ZmApptTabViewPage.prototype.reset = 
function() {
	// TODO
	// - reset heights of all sub components
	//this._resetBodySize();
	// - reset all local vars

	// reset the date/time values based on current time
	this._startDateField.value = this._endDateField.value = AjxDateUtil.simpleComputeDateStr(new Date());
	this._resetTimeSelect();

	// re-enable all input fields
	this.enableInputs(true);
	
	// set focus to first input element
	this._subjectField.focus();
};

ZmApptTabViewPage.prototype.cleanup = 
function() {
	// clear out all input fields
	this._subjectField.value = "";
	this._locationField.value = "";
	this._attendeesField.value = "";
	this._notesHtmlEditor.clear();
	
	// reinit non-time sensitive selects option values
	this._calendarSelect.setSelectedValue("personal");
	this._showAsSelect.setSelectedValue(ZmApptTabViewPage.SHOWAS_OPTIONS[0].value);
	this._reminderSelect.setSelectedValue(ZmApptTabViewPage.REMINDER_OPTIONS[0].value);
	this._reminderTimesSelect.setSelectedValue(ZmApptTabViewPage.REMINDER_TIME_OPTIONS[0].value);
	this._repeatSelect.setSelectedValue(ZmApptTabViewPage.REPEAT_OPTIONS[0].value);
	// reinit checkboxes
	this._privateCheckbox.checked = false;
	this._allDayCheckbox.checked = false;
	// show/hide elements as necessary
	Dwt.setVisibility(this._reminderTimesSelect.getHtmlElement(), false);
	this._showTimeFields(true);
	
	// reset compose view to html preference
	this.setComposeMode(this._defaultComposeMode);

	// sometimes attachTable doesnt get set so refetch it
	if (!this._attachTable)
		this._attachTable = this._getAttachTable();
	// reset iframe containing attachments if any
	while (this._attachTable.rows.length > 0)
		this._attachTable.deleteRow(-1);
	Dwt.setVisible(this._attachDiv, false);

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
	// any attachment activity => dirty
	if (this._gotAttachments())
		return true;

	var curFormValue = this._formValue();
	return (curFormValue.match(ZmApptComposeView.EMPTY_FORM_RE))
		? false
		: (curFormValue != this._origFormValue);
};

ZmApptTabViewPage.prototype.isValid = 
function() {
	DBG.prinln("TODO: check if all fields in appointment view tab are valid");
	return true;
};

ZmApptTabViewPage.prototype.getComposeMode = 
function() {
	return this._composeMode;
};

ZmApptTabViewPage.prototype.setComposeMode = 
function(composeMode) {
	this._composeMode = composeMode;
	this._notesHtmlEditor.setMode(composeMode, true);
	
	// dont forget to reset the body field Id and object ref
	//this._bodyFieldId = this._htmlEditor.getBodyFieldId();
	//this._bodyField = Dwt.getDomObj(this.getDocument(), this._bodyFieldId);
	
	// TODO - reset message body size
	//this._resetBodySize();
};

ZmApptTabViewPage.prototype.reEnableDesignMode = 
function() {
	if (this._composeMode == DwtHtmlEditor.HTML)
		this._notesHtmlEditor.reEnableDesignMode();
};

ZmApptTabViewPage.prototype.addAttachmentField =
function() {
	if (!this._attachTable)
		this._attachTable = this._getAttachTable();

	var doc = this.getDocument();
	// make sure the parent DIV containing the attach IFRAME is visible!
	if (this._attachDiv && !Dwt.getVisible(this._attachDiv)) {
		Dwt.setVisible(this._attachDiv, true);
		Dwt.setSize(this._attachDiv, Dwt.DEFAULT, "100px");
		var attachInnerDiv = Dwt.getDomObj(doc, this._attachInnerDivId);
		if (attachInnerDiv) {
			Dwt.setSize(attachInnerDiv, Dwt.DEFAULT, "45px");
			Dwt.setScrollStyle(attachInnerDiv, Dwt.SCROLL);
		}
	}

	// add new row
	var	row = this._attachTable.insertRow(-1);
	var attId = "_att_" + Dwt.getNextId();
	var attRemoveId = attId + "_r";
	var attInputId = attId + "_i";
	row.id = attId;
	row.style.height = ZmApptTabViewPage.IFRAME_HEIGHT;

	// add new cell and build html for inserting file upload input element
	var	cell = row.insertCell(-1);
	var html = new Array();
	var i = 0;
	html[i++] = "<table cellspacing=2 cellpadding=0 border=0><tr><td><div class='attachText'>";
	html[i++] = ZmMsg.attachFile;
	html[i++] = ":</div></td><td class='nobreak'><input type='file' size=40 id='";
	html[i++] = attInputId;
	html[i++] = "' name='";
	html[i++] = ZmApptTabViewPage.UPLOAD_FIELD_NAME;
	html[i++] = "'>&nbsp;<span onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;' id='";
	html[i++] = attRemoveId;
	html[i++] = "'>";
	html[i++] = ZmMsg.remove;
	html[i++] = "</span></td></tr></table>";
	cell.innerHTML = html.join("");
	
	//this._setEventHandler(attRemoveId, "onClick", null, !AjxEnv.isNav);
	// trap key presses in IE for input field so we can ignore ENTER key (bug 961)
	//if (AjxEnv.isIE)
	//	this._setEventHandler(attInputId, "onKeyDown", null, !AjxEnv.isNav);
	this._setAttachIframeHeight(true);
	//this._resetBodySize();
};


// Private / protected methods

ZmApptTabViewPage.prototype._createHTML = 
function() {
	this._calcTimeOptions();
	this._createApptHtml();
	this._createSelects();
	this._createButtons();
	this._cacheFields();
	this._initAttachIframe();
	this._initAutocomplete();
	
	var doc = this.getDocument();

	// add notes html editor
	this._notesHtmlEditor = new ZmHtmlEditor(this, null, DwtControl.RELATIVE_STYLE, null, this._composeMode, this._appCtxt);
	var noteHtmlEditorCell = Dwt.getDomObj(doc, this._notesHtmlEditorId);
	if (noteHtmlEditorCell)
		noteHtmlEditorCell.appendChild(this._notesHtmlEditor.getHtmlElement());

	// add event listeners where necessary
	Dwt.setHandler(this._allDayCheckbox, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmApptTabViewPage._onClick);
	this._allDayCheckbox._tabViewPage = this._repeatDescField._tabViewPage = this;
	
	// save the original form data in its initialized state
	this._origFormValue = this._formValue();
};

ZmApptTabViewPage.prototype._createApptHtml = 
function() {
	var div = this.getDocument().createElement("div");
	
	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 width=100%><tr>";
	html[i++] = "<td valign=top width=50%><fieldset><legend>";
	html[i++] = ZmMsg.details;
	html[i++] = "</legend><div style='height:110px;'>";
	html[i++] = this._getDetailsHtml();
	html[i++] = "</div></fieldset></td>";
	html[i++] = "<td valign=top width=50%><fieldset><legend>";
	html[i++] = ZmMsg.time;
	html[i++] = "</legend><div style='height:110px;'>";
	html[i++] = this._getTimeHtml();
	html[i++] = "</div></fieldset>";
	html[i++] = "</td></tr></table>";
	
	html[i++] = this._getSchedulingHtml();
	html[i++] = this._getAttachHtml();
	html[i++] = this._getNotesHtml();
	
	div.innerHTML = html.join("");
	this.getHtmlElement().appendChild(div);
};

ZmApptTabViewPage.prototype._createSelects = 
function() {
	var doc = this.getDocument();

	// create selects for details section
	this._calendarSelect = new DwtSelect(this);
	// TODO - get all folders/links w/ view set to "Appointment" we received from initial refresh block
	this._calendarSelect.addOption("Personal Calendar", true, "personal");
	var calCell = Dwt.getDomObj(doc, this._calSelectId);
	if (calCell)
		calCell.appendChild(this._calendarSelect.getHtmlElement());

	this._showAsSelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptTabViewPage.SHOWAS_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.SHOWAS_OPTIONS[i];
		this._showAsSelect.addOption(option.label, option.selected, option.value);
	}
	var showAsCell = Dwt.getDomObj(doc, this._showAsSelectId);
	if (showAsCell)
		showAsCell.appendChild(this._showAsSelect.getHtmlElement());

	this._reminderSelect = new DwtSelect(this);
	this._reminderSelect.addChangeListener(new AjxListener(this, this._reminderChangeListener));
	for (var i = 0; i < ZmApptTabViewPage.REMINDER_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.REMINDER_OPTIONS[i];
		this._reminderSelect.addOption(option.label, option.selected, option.value);
	}
	var reminderCell = Dwt.getDomObj(doc, this._reminderSelectId);
	if (reminderCell)
		reminderCell.appendChild(this._reminderSelect.getHtmlElement());
	
	this._reminderTimesSelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptTabViewPage.REMINDER_TIME_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.REMINDER_TIME_OPTIONS[i];
		var label = i > 0 ? (option.label + " " + ZmMsg.before) : option.label;
		this._reminderTimesSelect.addOption(label, option.selected, option.value);
	}
	var reminderTimesCell = Dwt.getDomObj(doc, this._reminderTimesSelectId);
	if (reminderTimesCell)
		reminderTimesCell.appendChild(this._reminderTimesSelect.getHtmlElement());

	// create selects for Time section
	this._startTimeSelect = new DwtSelect(this);
	if (this._timeOptions) {
		for (var i = 0; i < this._timeOptions.length; i++) {
			var option = this._timeOptions[i];
			this._startTimeSelect.addOption(option.label, option.selected, option.value);
		}
	}
	var startTimeCell = Dwt.getDomObj(doc, this._startTimeSelectId);
	if (startTimeCell)
		startTimeCell.appendChild(this._startTimeSelect.getHtmlElement());

	this._endTimeSelect = new DwtSelect(this);
	if (this._timeOptions) {
		for (var i = 0; i < this._timeOptions.length; i++) {
			var option = this._timeOptions[i];
			this._endTimeSelect.addOption(option.label, option.selected, option.value);
		}
	}
	var endTimeCell = Dwt.getDomObj(doc, this._endTimeSelectId);
	if (endTimeCell)
		endTimeCell.appendChild(this._endTimeSelect.getHtmlElement());

	this._endTZoneSelect = new DwtSelect(this);
	// XXX: this seems like overkill to list all 75 timezones!
	var timezones = ZmTimezones.getAbbreviatedZoneChoices();
	for (var i = 0; i < timezones.length; i++)
		this._endTZoneSelect.addOption(timezones[i].label, false, timezones[i].value);
	// init timezone to the local machine's time zone
	this._endTZoneSelect.setSelectedValue(ZmTimezones.guessMachineTimezone());
	var endTZoneCell = Dwt.getDomObj(doc, this._endTZoneSelectId);
	if (endTZoneCell)
		endTZoneCell.appendChild(this._endTZoneSelect.getHtmlElement());
	
	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptTabViewPage.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptTabViewPage.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	var repeatCell = Dwt.getDomObj(doc, this._repeatSelectId);
	if (repeatCell)
		repeatCell.appendChild(this._repeatSelect.getHtmlElement());
};

ZmApptTabViewPage.prototype._createButtons = 
function() {
	var doc = this.getDocument();

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	this._startDateButton = new DwtButton(this);
	this._startDateButton.setImage("SelectPullDownArrow");
	this._startDateButton.addSelectionListener(dateButtonListener);
	this._startDateButton.setSize(20, 20);
	// reparent
	var startButtonCell = Dwt.getDomObj(doc, this._startMiniCalBtnId);
	if (startButtonCell)
		startButtonCell.appendChild(this._startDateButton.getHtmlElement());
	
	this._endDateButton = new DwtButton(this);
	this._endDateButton.setImage("SelectPullDownArrow");
	this._endDateButton.addSelectionListener(dateButtonListener);
	this._endDateButton.setSize(20, 20);
	// reparent
	var endButtonCell = Dwt.getDomObj(doc, this._endMiniCalBtnId);
	if (endButtonCell)
		endButtonCell.appendChild(this._endDateButton.getHtmlElement());

	this._attendeesBtnListener = new AjxListener(this, this._attendeesButtonListener);
	this._attendeesButton = new DwtButton(this);
	this._attendeesButton.setText(ZmMsg.attendees + "...");
	this._attendeesButton.setSize(80);
	this._attendeesButton.addSelectionListener(this._attendeesBtnListener);
	// reparent
	var attendeesButtonCell = Dwt.getDomObj(doc, this._attendeesBtnId);
	if (attendeesButtonCell)
		attendeesButtonCell.appendChild(this._attendeesButton.getHtmlElement());
};

ZmApptTabViewPage.prototype._getDetailsHtml = 
function() {
	this._subjectFieldId 		= Dwt.getNextId();
	this._locationFieldId 		= Dwt.getNextId();
	this._calSelectId 			= Dwt.getNextId();
	this._showAsSelectId 		= Dwt.getNextId();
	this._reminderSelectId 		= Dwt.getNextId();
	this._reminderTimesSelectId = Dwt.getNextId();
	this._privateCheckboxId 	= Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 width=100%>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.subject;
	html[i++] = "<sup>*</sup>:</td><td colspan=4><input style='width:100%' id='";
	html[i++] = this._subjectFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.location;
	html[i++] = ":</td><td colspan=4><input style='width:100%' id='";
	html[i++] = this._locationFieldId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.calendar;
	html[i++] = ":</td><td width=1% id='"
	html[i++] = this._calSelectId;
	html[i++] = "'></td><td width=1% align=right class='nobreak'>";
	html[i++] = ZmMsg.showAs;
	html[i++] = "</td><td width=1% id='";
	html[i++] = this._showAsSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1% align=right>";
	html[i++] = ZmMsg.reminder;
	html[i++] = ":</td><td colspan=10>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 width=100%><tr>";
	html[i++] = "<td id='";
	html[i++] = this._reminderSelectId;
	html[i++] = "'><td>&nbsp;</td><td style='visibility:hidden' id='";
	html[i++] = this._reminderTimesSelectId;
	html[i++] = "'></td><td width=100%>&nbsp;</td><td>";
	html[i++] = "<input type='checkbox' id='";
	html[i++] = this._privateCheckboxId;
	html[i++] = "'></td><td>&nbsp;</td><td>";
	html[i++] = ZmMsg._private;
	html[i++] = "</td></tr></table>";
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
	this._endTZoneSelectId 		= Dwt.getNextId();
	this._repeatSelectId 		= Dwt.getNextId();
	this._repeatDescId 			= Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0>";
	html[i++] = "<tr><td align=right>";
	html[i++] = ZmMsg.start;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input style='height:22px;' type='text' size=10 maxlength=10 id='";
	html[i++] = this._startDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._startMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._startTimeSelectId;
	html[i++] = "'></td><td width=1%><input type='checkbox' id='";
	html[i++] = this._allDayCheckboxId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.allDayEvent;
	html[i++] = "</td></tr><tr><td align=right>";
	html[i++] = ZmMsg.end;
	html[i++] = ":</td><td>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = "<input style='height:22px;' type='text' size=10 maxlength=10 id='";
	html[i++] = this._endDateFieldId;
	html[i++] = "' value='";
	html[i++] = currDate;
	html[i++] = "'></td><td id='";
	html[i++] = this._endMiniCalBtnId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table></td>";
	html[i++] = "<td>@</td><td id='";
	html[i++] = this._endTimeSelectId;
	html[i++] = "'></td><td colspan=2 id='";
	html[i++] = this._endTZoneSelectId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td align=right>";
	html[i++] = ZmMsg.repeat;
	html[i++] = ":</td><td colspan=2 id='";
	html[i++] = this._repeatSelectId;
	html[i++] = "'><td colspan=10><span id='";
	html[i++] = this._repeatDescId;
	html[i++] = "' onmouseover='this.style.cursor=\"pointer\"' onmouseout='this.style.cursor=\"default\"' style='color:blue;text-decoration:underline;'";
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
		html[i++] = "<td id='";
		html[i++] = this._attendeesBtnId;
		html[i++] = "'></td>";
	} else {
		html[i++] = "<td align=right>";
		html[i++] = ZmMsg.attendees;
		html[i++] = ":</td>";
	}
	html[i++] = "<td width=100%><input style='width:100%' type='text' id='";
	html[i++] = this._attendeesFieldId;
	html[i++] = "'></td>";
	html[i++] = "</tr></table>";
	
	return html.join("");
};

ZmApptTabViewPage.prototype._getAttachHtml =
function() {
	this._attachDivId = Dwt.getNextId();
	this._attachInnerDivId = Dwt.getNextId();
	this._attachIframeId = Dwt.getNextId();
	var src = AjxEnv.isIE && location.protocol == "https:" ? "'/zimbra/public/blank.html'" : null;

	var html = new Array();
	var i = 0;

	html[i++] = "<div style='display:none; overflow:hidden' id='";
	html[i++] = this._attachDivId;
	html[i++] = "'><table border=0 width=100%><tr><td><fieldset><legend>";
	html[i++] = ZmMsg.attachments;
	html[i++] = "</legend><div id='";
	html[i++] = this._attachInnerDivId;
	html[i++] = "'><iframe frameborder=0 vspace=0 hspace=0 marginwidth=0 marginheight=0 width=100% scrolling=no tabindex=-1 ";
	html[i++] = "style='height:0px; overflow-x:visible; overflow-y:visible;' id='";
	html[i++] = this._attachIframeId;
	html[i++] = src ? ("' src='" + src + "'>") : "'>";
	html[i++] = "</iframe></div></fieldset></td></tr></table></div>";

	return html.join("");
};

ZmApptTabViewPage.prototype._getNotesHtml =
function() {
	this._notesHtmlEditorId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0 width=100%><tr><td id='";
	html[i++] = this._notesHtmlEditorId;
	html[i++] = "'></td></tr></table>";

	return html.join("");
};

// cache all input fields so we dont waste time traversing DOM each time
ZmApptTabViewPage.prototype._cacheFields = 
function() {
	var doc = this.getDocument();
	
	this._subjectField 		= Dwt.getDomObj(doc, this._subjectFieldId);
	this._locationField 	= Dwt.getDomObj(doc, this._locationFieldId);
	this._startDateField 	= Dwt.getDomObj(doc, this._startDateFieldId);
	this._endDateField 		= Dwt.getDomObj(doc, this._endDateFieldId);
	this._attendeesField 	= Dwt.getDomObj(doc, this._attendeesFieldId);
	this._privateCheckbox 	= Dwt.getDomObj(doc, this._privateCheckboxId);
	this._allDayCheckbox 	= Dwt.getDomObj(doc, this._allDayCheckboxId);
	this._repeatDescField 	= Dwt.getDomObj(doc, this._repeatDescId);
};

ZmApptTabViewPage.prototype._initAttachIframe = 
function() {
	var doc = this.getDocument();
	var uri = location.protocol + "//" + doc.domain + this._appCtxt.get(ZmSetting.CSFE_UPLOAD_URI);
	this._uploadFormId = Dwt.getNextId();
	this._attachTableId = Dwt.getNextId();
	
	// add table container w/in attachment iframe
	var attachIframe = Dwt.getDomObj(doc, this._attachIframeId);
	var idoc = attachIframe ? Dwt.getIframeDoc(attachIframe) : null;
	if (idoc) {
		var html = new Array();
		var i = 0;
		
		html[i++] = "<html><head><style type='text/css'>";
		html[i++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/dwt.css); -->";
		html[i++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/common.css); -->";
		html[i++] = "<!-- @import url(/zimbra/js/zimbraMail/config/style/zm.css); -->";
		html[i++] = "</style></head><body scroll=no bgcolor='#EEEEEE'><form style='margin:0;padding:0' method='POST' action='";
		html[i++] = uri;
		html[i++] = "' id='";
		html[i++] = this._uploadFormId;
		html[i++] = "' enctype='multipart/form-data'>";
		html[i++] = "<table cellspacing=0 cellpadding=0 border=0 class='iframeTable' id='";
		html[i++] = this._attachTableId;
		html[i++] = "'></table></form></body></html>";
		
		idoc.write(html.join(""));
		idoc.close();

		// save reference to the attachment table w/in the IFRAME
		this._attachTable = Dwt.getDomObj(idoc, this._attachTableId);
	}
	// save reference to the parent DIV holding this IFRAME
	this._attachDiv = Dwt.getDomObj(doc, this._attachDivId);
};

ZmApptTabViewPage.prototype._initAutocomplete = 
function() {
	if (this._autocomplete || !this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
		return;

	var shell = this._appCtxt.getShell();
	var contactsApp = shell ? shell.getData(ZmAppCtxt.LABEL).getApp(ZmZimbraMail.CONTACTS_APP) : null;
	var contactsList = contactsApp ? contactsApp.getContactList : null;
	var locCallback = new AjxCallback(this, this._getAcListLoc, this);
	var compCallback = new AjxCallback(this, this._handleAutoCompleteData);

	this._autocomplete = new ZmAutocompleteListView(this._appCtxt.getShell(), null, 
														  contactsApp, contactsList, 
														  ZmContactList.AC_VALUE_EMAIL, 
														  locCallback, compCallback);
	this._autocomplete.handle(this._attendeesField);
};

ZmApptTabViewPage.prototype._calcTimeOptions = 
function() {
	if (this._timeOptions) return;

	this._timeOptions = new Array();
	
	var today = new Date((new Date()).setHours(0,0,0,0));
	var todayDate = today.getDate();

	while (today.getDate() == todayDate) {
		var props = new Object();
		props["label"] = AjxDateUtil.computeTimeString(today);
		props["value"] = today.UTC;
		props["selected"] = false;
		this._timeOptions.push(props);
		
		// increment date by 30 mins
		today.setMinutes(today.getMinutes() + 30);
	}
};

ZmApptTabViewPage.prototype._resetTimeSelect = 
function() {
	var now = new Date();
	var nextHour = now.getMinutes() > 30;
	var startIdx = now.getHours() * 2 + (now.getMinutes() >= 30 ? 2 : 1);
	var endIdx = startIdx + 1;
	// normalize
	if (startIdx == this._timeOptions.length) {
		startIdx = 0;
		endIdx = 1;

		// and reset the start/end dates to the next day
		now.setDate(now.getDate()+1);
		var tomString = AjxDateUtil.simpleComputeDateStr(now);
		this._startDateField.value = this._endDateField.value = tomString;
	}
	
	// get the start DwtSelect object
	this._startTimeSelect.setSelected(startIdx);
	this._endTimeSelect.setSelected(endIdx);
};

ZmApptTabViewPage.prototype._setAttachIframeHeight =
function(add) {
	var attachIframe = Dwt.getDomObj(this.getDocument(), this._attachIframeId);
	if (attachIframe) {
		var height = parseInt(attachIframe.style.height);
		if (add) {
			height += ZmApptTabViewPage.IFRAME_HEIGHT;
		} else {
			height -= ZmApptTabViewPage.IFRAME_HEIGHT;
		}
		attachIframe.style.height = height;
	}
};

// Returns true if any of the attachment fields are populated
ZmApptTabViewPage.prototype._gotAttachments =
function() {
	var attachIframe = Dwt.getDomObj(this.getDocument(), this._attachIframeId);
	var idoc = attachIframe ? Dwt.getIframeDoc(attachIframe) : null;
	var atts = idoc ? idoc.getElementsByName(ZmComposeView.UPLOAD_FIELD_NAME) : [];

	for (var i = 0; i < atts.length; i++)
		if (atts[i].value.length)
			return true;

	return false;
};

ZmApptTabViewPage.prototype._getAttachTable = 
function() {
	var attachIframe = Dwt.getDomObj(this.getDocument(), this._attachIframeId);
	var idoc = attachIframe ? Dwt.getIframeDoc(attachIframe) : null;
	return idoc ? Dwt.getDomObj(idoc, this._attachTableId) : null;
};

ZmApptTabViewPage.prototype._showTimeFields = 
function(show) {
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement(), show);
	Dwt.setVisibility(this._endTZoneSelect.getHtmlElement(), show);
	// also show/hide the "@" text
	Dwt.setVisibility(this._startTimeSelect.getHtmlElement().parentNode.previousSibling, show);
	Dwt.setVisibility(this._endTimeSelect.getHtmlElement().parentNode.previousSibling, show);
};

ZmApptTabViewPage.prototype._showRecurDialog = 
function() {
	if (!this._recurDialog) {
		this._recurDialog = new ZmApptRecurDialog(this._appCtxt.getShell(), this._appCtxt);
		this._recurDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._recurOkListener));
		this._recurDialog.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._recurCancelListener));
	}
	this._recurDialog.initialize(this._startDateField.value, this._endDateField.value);
	this._recurDialog.popup();
};

// Returns a string representing the form content
ZmApptTabViewPage.prototype._formValue =
function() {
	var doc = this.getDocument();
	var vals = new Array();

	vals.push(this._subjectField.value);
	vals.push(this._locationField.value);
	vals.push(this._startDateField.value);
	vals.push(this._endDateField.value);
	vals.push(this._attendeesField.value);
	vals.push(this._notesHtmlEditor.getContent());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};


// Listeners

ZmApptTabViewPage.prototype._dateButtonListener = 
function(ev) {
	// init new DwtCalendar if not already created
	if (!this._dateCalendar) {
		this._dateCalendar = new DwtCalendar(this, null, DwtControl.ABSOLUTE_STYLE);

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
		if (this._dateCalendar.getHtmlElement().parentNode == ev.dwtObj.getHtmlElement())
			this._dateCalendar.setVisible(!this._dateCalendar.getVisible());
		else
			this._dateCalendar.setVisible(true);
	}
	// reparent calendar based on which button was clicked
	var calEl = this._dateCalendar.getHtmlElement();
	ev.dwtObj.getHtmlElement().appendChild(calEl);

	// always reset the date to today's date
	this._dateCalendar.setDate(new Date(), true);
};

ZmApptTabViewPage.prototype._attendeesButtonListener = 
function(ev) {
	if (!this._contactPicker) {
		var buttonInfo = [ { id: 1, value: ZmMsg.add.toLowerCase() } ];
		this._contactPicker = new ZmContactPicker(this, this._appCtxt.getShell(), this._appCtxt, buttonInfo);
		this._contactPicker.registerCallback(DwtDialog.OK_BUTTON, this._contactPickerOk, this);
		this._contactPicker.registerCallback(DwtDialog.CANCEL_BUTTON, this._contactPickerCancel, this);
	}
	this._contactPicker.popup();
};

ZmApptTabViewPage.prototype._dateCalSelectionListener = 
function(ev) {
	// get the parent node this calendar currently belongs to
	var parentButton = this._dateCalendar.getHtmlElement().parentNode;
	// and get reference to its respective text field
	var textField = parentButton == this._startDateButton.getHtmlElement()
		? this._startDateField : this._endDateField;

	if (textField)
		textField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
	
	this._dateCalendar.setVisible(false);
};

ZmApptTabViewPage.prototype._reminderChangeListener = 
function(ev) {
	Dwt.setVisibility(this._reminderTimesSelect.getHtmlElement(), ev._args.newValue == "show");
};

ZmApptTabViewPage.prototype._repeatChangeListener = 
function(ev) {	
	var newSelectVal = ev._args.newValue;
	if (newSelectVal == "CUS") {
		this._oldRepeatValue = ev._args.oldValue;
		this._showRecurDialog();
	} else {
		// per new select value, change the recur description
		var recurDesc = null;
		switch (newSelectVal) {
			case "DAI": recurDesc = ZmMsg.everyDay;   break;
			case "WEE": recurDesc = ZmMsg.everyWeek;  break;
			case "MON": recurDesc = ZmMsg.everyMonth; break;
			case "YEA": recurDesc = ZmMsg.everyYear;  break;
		}
		this._repeatDescField.innerHTML = recurDesc ? (recurDesc + " (" + ZmMsg.noEndDate + ")") : "";
	}
};

ZmApptTabViewPage.prototype._recurOkListener = 
function(ev) {
	// TODO
	// - and get the recur rules to update the recur language
	var repeatValue = this._recurDialog.getSelectedRepeatValue();
	if (repeatValue == "NON") {
		this._repeatSelect.setSelectedValue(repeatValue);
		this._repeatDescField.innerHTML = "";
	} else {
		this._repeatSelect.setSelectedValue("CUS");
	}
	
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
	var vec = addrs[1];
	var addr = vec.size() ? (vec.toString(ZmEmailAddress.SEPARATOR) + ZmEmailAddress.SEPARATOR) : "";
	this._attendeesField.value += addr;
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

ZmApptTabViewPage.prototype._handleAutoCompleteData = 
function(ev) {
	DBG.println("ZmApptTabViewPage.prototype._handleAutoCompleteData = ");
};


// Static methods

ZmApptTabViewPage._onClick = 
function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var tvp = el._tabViewPage;

	// figure out which input field was clicked
	if (el.id == tvp._allDayCheckboxId) {
		el._tabViewPage._showTimeFields(el.checked ? false : true);
	} else if (el.id == tvp._repeatDescId) {
		tvp._oldRepeatValue = tvp._repeatSelect.getValue();
		tvp._showRecurDialog();
	}
};
