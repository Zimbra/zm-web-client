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
* Creates a new appointment recurrence dialog. The view displays itself on construction.
* @constructor
* @class
* This class provides a dialog for creating/editing recurrences for an appointment
*
* @author Parag Shah
* @param parent			the element that created this view
* @param appCtxt 		the singleton app context
* @param className 		optional class name for this view
*/
function ZmApptRecurDialog(parent, appCtxt, className) {

	DwtDialog.call(this, parent, className, ZmMsg.customRepeat);
	this._appCtxt = appCtxt;
	// set html content once (hence, in ctor)
	this.setContent(this._setHtml());
	this._createRepeatSections();
	this._createDwtObjects();
	this._cacheFields();

	this.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okListener));
	this.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelListener));
};

ZmApptRecurDialog.prototype = new DwtDialog;
ZmApptRecurDialog.prototype.constructor = ZmApptRecurDialog;


// Consts

ZmApptRecurDialog.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 			value: "NON", 	selected: true 	},
	{ label: ZmMsg.daily, 			value: "DAI", 	selected: false },
	{ label: ZmMsg.weekly, 			value: "WEE", 	selected: false },
	{ label: ZmMsg.monthly, 		value: "MON", 	selected: false },
	{ label: ZmMsg.yearly, 			value: "YEA", 	selected: false }];


// Public methods

ZmApptRecurDialog.prototype.toString = 
function() {
	return "ZmApptRecurDialog";
};

ZmApptRecurDialog.prototype.initialize = 
function(startDate, endDate, repeatType, appt) {
	this._startDate = new Date(startDate);
	this._endDate = new Date(endDate);
	
	// based on repeat type, setup the repeat type values
	var repeatType = repeatType || "DAI";
	this._repeatSelect.setSelectedValue(repeatType);
	this._setRepeatSection(repeatType);

	// dont bother initializing if user is still mucking around
	if (this._saveState)
		return;

	var startDay = this._startDate.getDay();
	var startDate = this._startDate.getDate();
	var startMonth = this._startDate.getMonth();

	// reset time based fields
	this._endByField.value = AjxDateUtil.simpleComputeDateStr(new Date());
	this._weeklySelect.setSelected(startDay);
	this._weeklyCheckboxes[startDay].checked = true;
	this._monthlyDayField.value = startDate;
	this._monthlyWeekdaySelect.setSelected(startDay);
	this._yearlyDayField.value = startDate;
	this._yearlyMonthSelect.setSelected(startMonth);
	this._yearlyWeekdaySelect.setSelected(startDay);
	this._yearlyMonthSelectEx.setSelected(startMonth);

	// if given appt object, means user is editing existing appointment's recur rules
	if (appt) {
		this._populateForEdit(appt);
	}
};

ZmApptRecurDialog.prototype.getSelectedRepeatValue = 
function() {
	return this._repeatSelect.getValue();
};

ZmApptRecurDialog.prototype.setRepeatEndValues = 
function(appt) {	
	appt.repeatEndType = this._getRadioOptionValue(this._repeatEndName);

	// add any details for the select option
	if (appt.repeatEndType == "A")
		appt.repeatEndCount = this._endIntervalField.value;
	else if (appt.repeatEndType == "D")
		appt.repeatEndDate = new Date(this._endByField.value);
};

ZmApptRecurDialog.prototype.setCustomDailyValues = 
function(appt) {
	var value = this._getRadioOptionValue(this._dailyRadioName);

	if (value == "2") {
		appt.repeatCustom = "1";
		appt.repeatWeekday = true;
	} else {
		appt.repeatCustomCount = value == "3" ? (Number(this._dailyField.value)) : 1;
	}
};

ZmApptRecurDialog.prototype.setCustomWeeklyValues = 
function(appt) {
	appt.repeatWeeklyDays = new Array();
	appt.repeatCustom = "1";

	var value = this._getRadioOptionValue(this._weeklyRadioName);
	
	if (value == "1") {
		appt.repeatCustomCount = 1;
		appt.repeatWeeklyDays.push(ZmAppt.SERVER_WEEK_DAYS[this._weeklySelect.getValue()]);
	} else {
		appt.repeatCustomCount = Number(this._weeklyField.value);
		for (var i = 0; i < this._weeklyCheckboxes.length; i++) {
			if (this._weeklyCheckboxes[i].checked)
				appt.repeatWeeklyDays.push(ZmAppt.SERVER_WEEK_DAYS[i]);
		}
	}
};

ZmApptRecurDialog.prototype.setCustomMonthlyValues = 
function(appt) {
	appt.repeatCustom = "1";

	var value = this._getRadioOptionValue(this._monthlyRadioName);
	
	if (value == "1") {
		appt.repeatCustomType = "S";
		appt.repeatCustomCount = this._monthlyMonthField.value;
		appt.repeatMonthlyDayList = [this._monthlyDayField.value];
	} else {
		appt.repeatCustomType = "O";
		appt.repeatCustomCount = this._monthlyMonthFieldEx.value;
		appt.repeatCustomOrdinal = this._monthlyDaySelect.getValue();
		appt.repeatCustomDayOfWeek = ZmAppt.SERVER_WEEK_DAYS[this._monthlyWeekdaySelect.getValue()];
	}
};

ZmApptRecurDialog.prototype.setCustomYearlyValues = 
function(appt) {
	appt.repeatCustom = "1";

	var value = this._getRadioOptionValue(this._yearlyRadioName);

	if (value == "1") {
		appt.repeatCustomType = "S";
		appt.repeatCustomMonthDay = this._yearlyDayField.value;
		appt.repeatYearlyMonthsList = this._yearlyMonthSelect.getValue();
	} else {
		appt.repeatCustomType = "O";
		appt.repeatCustomOrdinal = this._yearlyDaySelect.getValue();
		appt.repeatCustomDayOfWeek = ZmAppt.SERVER_WEEK_DAYS[this._yearlyWeekdaySelect.getValue()];
		appt.repeatYearlyMonthsList = this._yearlyMonthSelectEx.getValue();
	}
};

ZmApptRecurDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};

ZmApptRecurDialog.prototype.clearState = 
function() {
	this._saveState = false;
	this._cleanup();
};

ZmApptRecurDialog.prototype.isValid = 
function() {
	// TODO - return true/false based on proper values entered by user
	return true;
};


// Private / protected methods
 
ZmApptRecurDialog.prototype._setHtml = 
function() {
	this._repeatSelectId = Dwt.getNextId();
	this._repeatSectionId = Dwt.getNextId();
	this._repeatEndDivId = Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 cellpadding=2 cellspacing=2 width=450>";
	html[i++] = "<tr><td><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border:1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.repeat;
	html[i++] = "</legend><div style='height:100px'>";
	html[i++] = "<div id='";
	html[i++] = this._repeatSelectId;
	html[i++] = "'></div><div id='";
	html[i++] = this._repeatSectionId;
	html[i++] = "'></div>";
	html[i++] = "</div></fieldset></td></tr>";
	html[i++] = "<tr><td><div id='";
	html[i++] = this._repeatEndDivId;
	html[i++] = "'><fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border:1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmMsg.end;
	html[i++] = "</legend>";
	html[i++] = this._getEndHtml();
	html[i++] = "</fieldset></div></td></tr>";
	html[i++] = "</html>";
	
	return html.join("");
};

ZmApptRecurDialog.prototype._getEndHtml = 
function() {
	this._repeatEndName = Dwt.getNextId();
	this._noEndDateRadioId = Dwt.getNextId();
	this._endByRadioId = Dwt.getNextId();
	this._endIntervalFieldId = Dwt.getNextId();
	this._endByFieldId = Dwt.getNextId();
	this._endByButtonId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td width=1%><input checked value='N' type='radio' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._noEndDateRadioId;
	html[i++] = "'></td><td colspan=2>";
	html[i++] = ZmMsg.noEndDate;
	html[i++] = "</td></tr><tr><td><input type='radio' value='A' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "'></td><td colspan=2><nobr>";
	html[i++] = ZmMsg.endAfter;
	html[i++] = "&nbsp;<input type='text' value='1' maxlength=3 size=3 id='";
	html[i++] = this._endIntervalFieldId;
	html[i++] = "'>&nbsp;";
	html[i++] = ZmMsg.occurrences;
	html[i++] = "</td></tr><tr><td><input type='radio' value='D' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._endByRadioId;
	html[i++] = "'></td><td><table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = ZmMsg.endBy;
	html[i++] = "</td><td>&nbsp;</td><td><input style='height:22px;' type='text' maxlength=10 size=10 id='";
	html[i++] = this._endByFieldId;
	html[i++] = "' value='";
	html[i++] = AjxDateUtil.simpleComputeDateStr(new Date(this._endDate));
	html[i++] = "'></td><td id='";
	html[i++] = this._endByButtonId;
	html[i++] = "'></td></tr></table></td></tr></table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatSections = 
function() {
	var sectionDiv = document.getElementById(this._repeatSectionId);
	if (sectionDiv) {
		var div = document.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatDailyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatDaily();
		sectionDiv.appendChild(div);
		
		var div = document.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatWeeklyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatWeekly();;
		sectionDiv.appendChild(div);
	
		var div = document.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatMonthlyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatMonthly();
		sectionDiv.appendChild(div);
	
		var div = document.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatYearlyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatYearly();
		sectionDiv.appendChild(div);
	}
};

ZmApptRecurDialog.prototype._createRepeatDaily = 
function() {
	this._dailyRadioName = Dwt.getNextId();
	this._dailyDefaultId = Dwt.getNextId();
	this._dailyFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._dailyDefaultId;
	html[i++] = "'></td><td colspan=3>";
	html[i++] = ZmMsg.everyDay;
	html[i++] = "</td></tr><tr><td><input value='2' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "'></td><td colspan=3>";
	html[i++] = ZmMsg.everyWeekday;
	html[i++] = "</td></tr><tr><td><input value='3' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.every;
	html[i++] = "</td><td><input type='text' size=3 maxlength=3 value='2' id='";
	html[i++] = this._dailyFieldId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.day_s;
	html[i++] = "</td></tr></table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatWeekly = 
function() {
	this._weeklyRadioName = Dwt.getNextId();
	this._weeklyCheckboxName = Dwt.getNextId();
	this._weeklyDefaultId = Dwt.getNextId();
	this._weeklySelectId = Dwt.getNextId();
	this._weeklyFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._weeklyRadioName;
	html[i++] = "' id='";
	html[i++] = this._weeklyDefaultId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.every;
	html[i++] = "</td><td id='";
	html[i++] = this._weeklySelectId;
	html[i++] = "'></td></tr><tr><td><input value='2' type='radio' name='";
	html[i++] = this._weeklyRadioName;
	html[i++] = "'></td><td width=1%>";
	html[i++] = ZmMsg.every;
	html[i++] = "</td><td><input type='text' value='2' size=2 maxlength=2 id='";
	html[i++] = this._weeklyFieldId;
	html[i++] = "'>&nbsp;";
	html[i++] = ZmMsg.weeksOn;
	html[i++] = "</td></tr><tr><td></td><td colspan=2><table border=0 cellpadding=0 cellspacing=0><tr>";
	for (var j = 0; j < AjxDateUtil.WEEKDAY_MEDIUM.length; j++) {
		html[i++] = "<td><input type='checkbox' name='";
		html[i++] = this._weeklyCheckboxName;
		html[i++] = "'></td><td>";
		html[i++] = AjxDateUtil.WEEKDAY_MEDIUM[j];
		html[i++] = "</td><td>&nbsp;&nbsp;</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr></table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatMonthly = 
function() {
	this._monthlyRadioName = Dwt.getNextId();
	this._monthlyDefaultId = Dwt.getNextId();
	this._monthlyDayFieldId = Dwt.getNextId();
	this._monthlyMonthFieldId = Dwt.getNextId();
	this._monthlyDaySelectId = Dwt.getNextId();
	this._monthlyWeekdaySelectId = Dwt.getNextId();
	this._monthlyMonthFieldExId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._monthlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._monthlyDefaultId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.day
	html[i++] = "</td><td><nobr><input value='1' type='text' size=2 maxlength=2 id='";
	html[i++] = this._monthlyDayFieldId;
	html[i++] = "'>&nbsp;";
	html[i++] = ZmMsg.ofEvery;
	html[i++] = "&nbsp;<input value='1' type='text' size=2 maxlength=2 id='";
	html[i++] = this._monthlyMonthFieldId;
	html[i++] = "'>&nbsp;";
	html[i++] = ZmMsg.month_s;
	html[i++] = "</td></tr><tr><td><input value='2' type='radio' name='";
	html[i++] = this._monthlyRadioName;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.the;
	html[i++] = "</td><td><table border=0 cellpadding=0 cellspacing=0><tr><td id='";
	html[i++] = this._monthlyDaySelectId;
	html[i++] = "'></td><td>&nbsp;</td><td id='";
	html[i++] = this._monthlyWeekdaySelectId;
	html[i++] = "'></td><td>&nbsp;</td><td>";
	html[i++] = ZmMsg.ofEvery;
	html[i++] = "</td><td>&nbsp;</td><td><input value='1' type='text' size=2 maxlength=2 id='";
	html[i++] = this._monthlyMonthFieldExId;
	html[i++] = "'></td><td>&nbsp;</td><td>";
	html[i++] = ZmMsg.month_s;
	html[i++] = "</td></tr></table>";
	html[i++] = "</td></tr></table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatYearly = 
function() {
	this._yearlyDefaultId = Dwt.getNextId();
	this._yearlyRadioName = Dwt.getNextId();
	this._yearlyMonthSelectId = Dwt.getNextId();
	this._yearlyDayFieldId = Dwt.getNextId();
	this._yearlyDaySelectId = Dwt.getNextId();
	this._yearlyWeekdaySelectId = Dwt.getNextId();
	this._yearlyMonthSelectExId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._yearlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._yearlyDefaultId;
	html[i++] = "'></td><td><table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = ZmMsg.everyYearOn;
	html[i++] = "</td><td>&nbsp;</td><td id='";
	html[i++] = this._yearlyMonthSelectId;
	html[i++] = "'></td><td>&nbsp;</td><td><input value='1' type='text' size=2 maxlength=2 id='";
	html[i++] = this._yearlyDayFieldId;
	html[i++] = "'></td></tr></table></td></tr><tr><td><input value='2' type='radio' name='";
	html[i++] = this._yearlyRadioName;
	html[i++] = "'></td><td><table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = ZmMsg.the;
	html[i++] = "</td><td>&nbsp;</td><td id='";
	html[i++] = this._yearlyDaySelectId;
	html[i++] = "'></td><td>&nbsp;</td><td id='";
	html[i++] = this._yearlyWeekdaySelectId;
	html[i++] = "'></td><td>&nbsp;</td><td>";
	html[i++] = ZmMsg.of;
	html[i++] = "</td><td>&nbsp;</td><td id='";
	html[i++] = this._yearlyMonthSelectExId;
	html[i++] = "'></td></tr></table></td></tr></table>";
	
	return html.join("");
};

ZmApptRecurDialog.prototype._createDwtObjects = 
function() {
	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptRecurDialog.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptRecurDialog.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	var repeatSelectDiv = document.getElementById(this._repeatSelectId);
	if (repeatSelectDiv)
		repeatSelectDiv.appendChild(this._repeatSelect.getHtmlElement());
	delete this._repeatSelectId;

	var dateButtonListener = new AjxListener(this, this._endByButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._endByButton = ZmApptViewHelper.createMiniCalButton(this, this._endByButtonId, dateButtonListener, dateCalSelectionListener, true);

	this._weeklySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._weeklySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var weeklySelectCell = document.getElementById(this._weeklySelectId);
	if (weeklySelectCell)
		weeklySelectCell.appendChild(this._weeklySelect.getHtmlElement());
	delete this._weeklySelectId;

	this._monthlyDaySelect = new DwtSelect(this);
	for (var i = 0; i < ZmAppt.MONTHLY_DAY_OPTIONS.length; i++) {
		var option = ZmAppt.MONTHLY_DAY_OPTIONS[i];
		this._monthlyDaySelect.addOption(option.label, option.selected, option.value);
	}
	var monthlyDayCell = document.getElementById(this._monthlyDaySelectId);
	if (monthlyDayCell)
		monthlyDayCell.appendChild(this._monthlyDaySelect.getHtmlElement());
	delete this._monthlyDaySelectId;

	this._monthlyWeekdaySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._monthlyWeekdaySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var monthlyWeekdayCell = document.getElementById(this._monthlyWeekdaySelectId);
	if (monthlyWeekdayCell)
		monthlyWeekdayCell.appendChild(this._monthlyWeekdaySelect.getHtmlElement());
	delete this._monthlyWeekdaySelectId;

	this._yearlyMonthSelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.MONTH_LONG.length; i++)
		this._yearlyMonthSelect.addOption(AjxDateUtil.MONTH_LONG[i], false, i);
	var yearlyMonthCell = document.getElementById(this._yearlyMonthSelectId);
	if (yearlyMonthCell)
		yearlyMonthCell.appendChild(this._yearlyMonthSelect.getHtmlElement());
	delete this._yearlyMonthSelectId;

	this._yearlyDaySelect = new DwtSelect(this);
	for (var i = 0; i < ZmAppt.MONTHLY_DAY_OPTIONS.length; i++) {
		var option = ZmAppt.MONTHLY_DAY_OPTIONS[i];
		this._yearlyDaySelect.addOption(option.label, option.selected, option.value);
	}
	var yearlyDayCell = document.getElementById(this._yearlyDaySelectId);
	if (yearlyDayCell)
		yearlyDayCell.appendChild(this._yearlyDaySelect.getHtmlElement());
	delete this._yearlyDaySelectId;

	this._yearlyWeekdaySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._yearlyWeekdaySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var yearlyWeekdayCell = document.getElementById(this._yearlyWeekdaySelectId);
	if (yearlyWeekdayCell)
		yearlyWeekdayCell.appendChild(this._yearlyWeekdaySelect.getHtmlElement());
	delete this._yearlyWeekdaySelectId;

	this._yearlyMonthSelectEx = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.MONTH_LONG.length; i++)
		this._yearlyMonthSelectEx.addOption(AjxDateUtil.MONTH_LONG[i], false, i);
	var yearlyMonthCellEx = document.getElementById(this._yearlyMonthSelectExId);
	if (yearlyMonthCellEx)
		yearlyMonthCellEx.appendChild(this._yearlyMonthSelectEx.getHtmlElement());
	delete this._yearlyMonthSelectExId;
};

ZmApptRecurDialog.prototype._cacheFields = 
function() {
	this._noEndDateRadio = document.getElementById(this._noEndDateRadioId);			delete this._noEndDateRadioId;
	this._endByRadio = document.getElementById(this._endByRadioId); 				delete this._endByRadioId;
	this._repeatSectionDiv = document.getElementById(this._repeatSectionId); 		delete this._repeatSectionId;
	this._repeatEndDiv = document.getElementById(this._repeatEndDivId);				delete this._repeatEndDivId;
	this._repeatDailyDiv = document.getElementById(this._repeatDailyId); 			delete this._repeatDailyId;
	this._repeatWeeklyDiv = document.getElementById(this._repeatWeeklyId); 			delete this._repeatWeeklyId;
	this._repeatMonthlyDiv = document.getElementById(this._repeatMonthlyId); 		delete this._repeatMonthlyId;
	this._repeatYearlyDiv = document.getElementById(this._repeatYearlyId); 			delete this._repeatYearlyId;
	this._endIntervalField = document.getElementById(this._endIntervalFieldId); 	delete this._endIntervalFieldId;
	this._endByField = document.getElementById(this._endByFieldId); 				delete this._endByFieldId;
	this._dailyDefaultRadio = document.getElementById(this._dailyDefaultId); 		delete this._dailyDefaultId;
	this._dailyField = document.getElementById(this._dailyFieldId); 				delete this._dailyFieldId;
	this._weeklyDefaultRadio = document.getElementById(this._weeklyDefaultId); 		delete this._weeklyDefaultId;
	this._weeklyField = document.getElementById(this._weeklyFieldId); 				delete this._weeklyFieldId;
	this._weeklyCheckboxes = document.getElementsByName(this._weeklyCheckboxName);
	this._monthlyDefaultRadio = document.getElementById(this._monthlyDefaultId); 	delete this._monthlyDefaultId;
	this._monthlyDayField = document.getElementById(this._monthlyDayFieldId); 		delete this._monthlyDayFieldId;
	this._monthlyMonthField = document.getElementById(this._monthlyMonthFieldId); 	delete this._monthlyMonthFieldId;
	this._monthlyMonthFieldEx = document.getElementById(this._monthlyMonthFieldExId);delete this._monthlyMonthFieldExId;
	this._yearlyDefaultRadio = document.getElementById(this._yearlyDefaultId); 		delete this._yearlyDefaultId;
	this._yearlyDayField = document.getElementById(this._yearlyDayFieldId); 		delete this._yearlyDayFieldId;
};

ZmApptRecurDialog.prototype._setRepeatSection = 
function(repeatType) {
	var newSection = null;
	switch (repeatType) {
		case "DAI": newSection = this._repeatDailyDiv; break;
		case "WEE": newSection = this._repeatWeeklyDiv; break;
		case "MON": newSection = this._repeatMonthlyDiv; break;
		case "YEA": newSection = this._repeatYearlyDiv; break;
	}
	if (newSection) {
		if (this._currentSection)
			Dwt.setVisible(this._currentSection, false);
		Dwt.setVisible(newSection, true);
		this._currentSection = newSection;
	}
};

ZmApptRecurDialog.prototype._cleanup = 
function() {
	// dont bother cleaning up if user is still mucking around
	if (this._saveState) return;

	// TODO: 
	// - dont cleanup for section that was picked if user clicks OK
	
	// reset end section
	this._noEndDateRadio.checked = true;
	this._endIntervalField.value = "1";
	// reset daily section
	this._dailyDefaultRadio.checked = true;
	this._dailyField.value = "2";
	// reset weekly section
	this._weeklyDefaultRadio.checked = true;
	this._weeklyField.value = "2";
	for (var i = 0; i < this._weeklyCheckboxes.length; i++)
		this._weeklyCheckboxes[i].checked = false;
	// reset monthly section
	this._monthlyDefaultRadio.checked = true;
	this._monthlyMonthField.value = "1";
	this._monthlyMonthFieldEx.value = "1";
	this._monthlyDaySelect.setSelected(0);
	// reset yearly section
	this._yearlyDefaultRadio.checked = true;
	this._yearlyDaySelect.setSelected(0);
};

ZmApptRecurDialog.prototype._getRadioOptionValue = 
function(radioName) {	
	var options = document.getElementsByName(radioName);
	if (options) {
		for (var i = 0; i < options.length; i++) {
			if (options[i].checked)
				return options[i].value;
		}
	}
	return null;
};

/**
 * depending on the repeat type, populates repeat section as necessary
*/
ZmApptRecurDialog.prototype._populateForEdit = 
function(appt) {
	if (appt.repeatType == "NON") return;

	if (appt.repeatType == "DAI") {
		var dailyRadioOptions = document.getElementsByName(this._dailyRadioName);
		if (appt.repeatWeekday) {
			dailyRadioOptions[1].checked = true;
		} else if (appt.repeatCustomCount > 1) {
			this._dailyField.value = appt.repeatCustomCount;
			dailyRadioOptions[2].checked = true;
		}
	} else if (appt.repeatType == "WEE") {
		var weeklyRadioOptions = document.getElementsByName(this._weeklyRadioName);
		if (appt.repeatCustomCount == 1 && appt.repeatWeeklyDays.length == 1) {
			weeklyRadioOptions[0].checked = true;
			for (var j = 0; j < ZmAppt.SERVER_WEEK_DAYS.length; j++) {
				if (appt.repeatWeeklyDays[0] == ZmAppt.SERVER_WEEK_DAYS[j]) {
					this._weeklySelect.setSelectedValue(j);
					break;
				}
			}
		} else {
			weeklyRadioOptions[1].checked = true;
			this._weeklyField.value = appt.repeatCustomCount;
			// xxx: minor hack-- uncheck this since we init'd it earlier
			this._weeklyCheckboxes[this._startDate.getDay()].checked = false;
			for (var i = 0; i < appt.repeatWeeklyDays.length; i++) {
				for (var j = 0; j < ZmAppt.SERVER_WEEK_DAYS.length; j++) {
					if (appt.repeatWeeklyDays[i] == ZmAppt.SERVER_WEEK_DAYS[j]) {
						this._weeklyCheckboxes[j].checked = true;
						break;
					}
				}
			}
		}
	} else if (appt.repeatType == "MON") {
		var monthlyRadioOptions = document.getElementsByName(this._monthlyRadioName);
		if (appt.repeatMonthlyDayList) {
			monthlyRadioOptions[0].checked = true;
			this._monthlyDayField.value = appt.repeatMonthlyDayList[0];
			this._monthlyMonthField.value = appt.repeatCustomCount;
		} else {
			monthlyRadioOptions[1].checked = true;
			this._monthlyDaySelect.setSelectedValue(appt.repeatCustomOrdinal);
			for (var i = 0; i < ZmAppt.SERVER_WEEK_DAYS.length; i++) {
				if (ZmAppt.SERVER_WEEK_DAYS[i] == appt.repeatCustomDayOfWeek) {
					this._monthlyWeekdaySelect.setSelectedValue(i);
					break;
				}
			}
			this._monthlyMonthFieldEx.value = appt.repeatCustomCount;
		}
	} else if (appt.repeatType == "YEA") {
		var yearlyRadioOptions = document.getElementsByName(this._yearlyRadioName);
		if (appt.repeatCustomType == "S") {
			yearlyRadioOptions[0].checked = true;
			this._yearlyDayField.value = appt.repeatCustomMonthDay;
			this._yearlyMonthSelect.setSelectedValue(Number(appt.repeatYearlyMonthsList)+1);
		} else {
			yearlyRadioOptions[1].checked = true;
			this._yearlyDaySelect.setSelectedValue(appt.repeatCustomOrdinal);
			for (var i = 0; i < ZmAppt.SERVER_WEEK_DAYS.length; i++) {
				if (ZmAppt.SERVER_WEEK_DAYS[i] == appt.repeatCustomDayOfWeek) {
					this._yearlyWeekdaySelect.setSelectedValue(i);
					break;
				}
			}
			this._yearlyMonthSelectEx.setSelectedValue(Number(appt.repeatYearlyMonthsList)-1);
		}
	}

	// populate recurrence ending rules
	if (appt.repeatEndType != "N") {
		var endRadioOptions = document.getElementsByName(this._repeatEndName);
		if (appt.repeatEndType == "A") {
			endRadioOptions[1].checked = true;
			this._endIntervalField.value = appt.repeatEndCount;
		} else {
			endRadioOptions[2].checked = true;
			this._endByField.value = AjxDateUtil.simpleComputeDateStr(appt.repeatEndDate);
		}
	}
};


// Listeners

ZmApptRecurDialog.prototype._repeatChangeListener =
function(ev) {
	var newValue = ev._args.newValue;
	Dwt.setVisible(this._repeatSectionDiv, newValue != "NON");
	Dwt.setVisible(this._repeatEndDiv, newValue != "NON");
	this._setRepeatSection(newValue);
};

ZmApptRecurDialog.prototype._endByButtonListener = 
function(ev) {
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	// always(?) reset the date to today's date
	cal.setDate(new Date(), true);
	menu.popup();
};

ZmApptRecurDialog.prototype._dateCalSelectionListener = 
function(ev) {
	this._endByField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
	this._endByRadio.checked = true;
};

ZmApptRecurDialog.prototype._okListener = 
function() {
	this._saveState = true;
};

ZmApptRecurDialog.prototype._cancelListener = 
function() {
	this._cleanup();
};
