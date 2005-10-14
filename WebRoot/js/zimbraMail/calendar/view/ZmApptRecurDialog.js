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
 * The Original Code is: Zimbra Collaboration Suite.
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


ZmApptRecurDialog.MONTHLY_DAY_OPTIONS = [
	{ label: AjxMsg.first, 			value: 1, 		selected: true 	},
	{ label: AjxMsg.second, 		value: 2, 		selected: false },
	{ label: AjxMsg.third, 			value: 3, 		selected: false },
	{ label: AjxMsg.fourth, 		value: 4, 		selected: false },
	{ label: AjxMsg.last, 			value: 5, 		selected: false }];


// Public methods

ZmApptRecurDialog.prototype.initialize = 
function(startDate, endDate, repeatType) {
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
	this._monthlyDayField.value = startDate;
	this._monthlyWeekdaySelect.setSelected(startDay);
	this._yearlyDayField.value = startDate;
	this._yearlyMonthSelect.setSelected(startMonth);
	this._yearlyWeekdaySelect.setSelected(startDay);
	this._yearlyMonthSelectEx.setSelected(startMonth);
};

ZmApptRecurDialog.prototype.getSelectedRepeatValue = 
function() {
	return this._repeatSelect.getValue();
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
	html[i++] = "<tr><td width=1%><input checked type='radio' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._noEndDateRadioId;
	html[i++] = "'></td><td colspan=2>";
	html[i++] = ZmMsg.noEndDate;
	html[i++] = "</td></tr><tr><td><input type='radio' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "'></td><td colspan=2><nobr>";
	html[i++] = ZmMsg.endAfter;
	html[i++] = "&nbsp;<input type='text' value='1' maxlength=3 size=3 id='";
	html[i++] = this._endIntervalFieldId;
	html[i++] = "'>&nbsp;";
	html[i++] = ZmMsg.meetings;
	html[i++] = "</td></tr><tr><td><input type='radio' name='";
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
	var doc = this.getDocument();
	var sectionDiv = Dwt.getDomObj(doc, this._repeatSectionId);
	if (sectionDiv) {
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatDailyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatDaily();
		sectionDiv.appendChild(div);
		
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatWeeklyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatWeekly();;
		sectionDiv.appendChild(div);
	
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatMonthlyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatMonthly();
		sectionDiv.appendChild(div);
	
		var div = doc.createElement("div");
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
	html[i++] = "<tr><td><input checked type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._dailyDefaultId;
	html[i++] = "'></td><td colspan=3>";
	html[i++] = ZmMsg.everyDay;
	html[i++] = "</td></tr><tr><td><input type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "'></td><td colspan=3>";
	html[i++] = ZmMsg.everyWeekday;
	html[i++] = "</td></tr><tr><td><input type='radio' name='";
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
	html[i++] = "<tr><td><input checked type='radio' name='";
	html[i++] = this._weeklyRadioName;
	html[i++] = "' id='";
	html[i++] = this._weeklyDefaultId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.every;
	html[i++] = "</td><td id='";
	html[i++] = this._weeklySelectId;
	html[i++] = "'></td></tr><tr><td><input type='radio' name='";
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
	html[i++] = "<tr><td><input checked type='radio' name='";
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
	html[i++] = "</td></tr><tr><td><input type='radio' name='";
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
	html[i++] = "<tr><td><input checked type='radio' name='";
	html[i++] = this._yearlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._yearlyDefaultId;
	html[i++] = "'></td><td><table border=0 cellpadding=0 cellspacing=0><tr><td>";
	html[i++] = ZmMsg.everyYearOn;
	html[i++] = "</td><td>&nbsp;</td><td id='";
	html[i++] = this._yearlyMonthSelectId;
	html[i++] = "'></td><td>&nbsp;</td><td><input value='1' type='text' size=2 maxlength=2 id='";
	html[i++] = this._yearlyDayFieldId;
	html[i++] = "'></td></tr></table></td></tr><tr><td><input type='radio' name='";
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
	var doc = this.getDocument();
	
	this._repeatSelect = new DwtSelect(this);
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptRecurDialog.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptRecurDialog.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	var repeatSelectDiv = Dwt.getDomObj(doc, this._repeatSelectId);
	if (repeatSelectDiv)
		repeatSelectDiv.appendChild(this._repeatSelect.getHtmlElement());
	delete this._repeatSelectId;
	
	this._endByButton = new DwtButton(this);
	this._endByButton.setImage("SelectPullDownArrow");
	this._endByButton.addSelectionListener(new AjxListener(this, this._endByButtonListener));
	this._endByButton.setSize(20, 20);
	var endByButtonCell = Dwt.getDomObj(doc, this._endByButtonId);
	if (endByButtonCell)
		endByButtonCell.appendChild(this._endByButton.getHtmlElement());
	delete this._endByButtonId;

	this._weeklySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._weeklySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var weeklySelectCell = Dwt.getDomObj(doc, this._weeklySelectId);
	if (weeklySelectCell)
		weeklySelectCell.appendChild(this._weeklySelect.getHtmlElement());
	delete this._weeklySelectId;

	this._monthlyDaySelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptRecurDialog.MONTHLY_DAY_OPTIONS.length; i++) {
		var option = ZmApptRecurDialog.MONTHLY_DAY_OPTIONS[i];
		this._monthlyDaySelect.addOption(option.label, option.selected, option.value);
	}
	var monthlyDayCell = Dwt.getDomObj(doc, this._monthlyDaySelectId);
	if (monthlyDayCell)
		monthlyDayCell.appendChild(this._monthlyDaySelect.getHtmlElement());
	delete this._monthlyDaySelectId;

	this._monthlyWeekdaySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._monthlyWeekdaySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var monthlyWeekdayCell = Dwt.getDomObj(doc, this._monthlyWeekdaySelectId);
	if (monthlyWeekdayCell)
		monthlyWeekdayCell.appendChild(this._monthlyWeekdaySelect.getHtmlElement());
	delete this._monthlyWeekdaySelectId;

	this._yearlyMonthSelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.MONTH_LONG.length; i++)
		this._yearlyMonthSelect.addOption(AjxDateUtil.MONTH_LONG[i], false, i);
	var yearlyMonthCell = Dwt.getDomObj(doc, this._yearlyMonthSelectId);
	if (yearlyMonthCell)
		yearlyMonthCell.appendChild(this._yearlyMonthSelect.getHtmlElement());
	delete this._yearlyMonthSelectId;

	this._yearlyDaySelect = new DwtSelect(this);
	for (var i = 0; i < ZmApptRecurDialog.MONTHLY_DAY_OPTIONS.length; i++) {
		var option = ZmApptRecurDialog.MONTHLY_DAY_OPTIONS[i];
		this._yearlyDaySelect.addOption(option.label, option.selected, option.value);
	}
	var yearlyDayCell = Dwt.getDomObj(doc, this._yearlyDaySelectId);
	if (yearlyDayCell)
		yearlyDayCell.appendChild(this._yearlyDaySelect.getHtmlElement());
	delete this._yearlyDaySelectId;

	this._yearlyWeekdaySelect = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.WEEKDAY_LONG.length; i++)
		this._yearlyWeekdaySelect.addOption(AjxDateUtil.WEEKDAY_LONG[i], false, i);
	var yearlyWeekdayCell = Dwt.getDomObj(doc, this._yearlyWeekdaySelectId);
	if (yearlyWeekdayCell)
		yearlyWeekdayCell.appendChild(this._yearlyWeekdaySelect.getHtmlElement());
	delete this._yearlyWeekdaySelectId;

	this._yearlyMonthSelectEx = new DwtSelect(this);
	for (var i = 0; i < AjxDateUtil.MONTH_LONG.length; i++)
		this._yearlyMonthSelectEx.addOption(AjxDateUtil.MONTH_LONG[i], false, i);
	var yearlyMonthCellEx = Dwt.getDomObj(doc, this._yearlyMonthSelectExId);
	if (yearlyMonthCellEx)
		yearlyMonthCellEx.appendChild(this._yearlyMonthSelectEx.getHtmlElement());
	delete this._yearlyMonthSelectExId;
};

ZmApptRecurDialog.prototype._cacheFields = 
function() {
	var doc = this.getDocument();

	this._noEndDateRadio = Dwt.getDomObj(doc, this._noEndDateRadioId);			delete this._noEndDateRadioId;
	this._endByRadio = Dwt.getDomObj(doc, this._endByRadioId); 					delete this._endByRadioId;
	this._repeatSectionDiv = Dwt.getDomObj(doc, this._repeatSectionId); 		delete this._repeatSectionId;
	this._repeatEndDiv = Dwt.getDomObj(doc, this._repeatEndDivId);				delete this._repeatEndDivId;
	this._repeatDailyDiv = Dwt.getDomObj(doc, this._repeatDailyId); 			delete this._repeatDailyId;
	this._repeatWeeklyDiv = Dwt.getDomObj(doc, this._repeatWeeklyId); 			delete this._repeatWeeklyId;
	this._repeatMonthlyDiv = Dwt.getDomObj(doc, this._repeatMonthlyId); 		delete this._repeatMonthlyId;
	this._repeatYearlyDiv = Dwt.getDomObj(doc, this._repeatYearlyId); 			delete this._repeatYearlyId;
	this._endIntervalField = Dwt.getDomObj(doc, this._endIntervalFieldId); 		delete this._endIntervalFieldId;
	this._endByField = Dwt.getDomObj(doc, this._endByFieldId); 					delete this._endByFieldId;
	this._dailyDefaultRadio = Dwt.getDomObj(doc, this._dailyDefaultId); 		delete this._dailyDefaultId;
	this._dailyField = Dwt.getDomObj(doc, this._dailyFieldId); 					delete this._dailyFieldId;
	this._weeklyDefaultRadio = Dwt.getDomObj(doc, this._weeklyDefaultId); 		delete this._weeklyDefaultId;
	this._weeklyField = Dwt.getDomObj(doc, this._weeklyFieldId); 				delete this._weeklyFieldId;
	this._weeklyCheckboxes = doc.getElementsByName(this._weeklyCheckboxName);
	this._monthlyDefaultRadio = Dwt.getDomObj(doc, this._monthlyDefaultId); 	delete this._monthlyDefaultId;
	this._monthlyDayField = Dwt.getDomObj(doc, this._monthlyDayFieldId); 		delete this._monthlyDayFieldId;
	this._monthlyMonthField = Dwt.getDomObj(doc, this._monthlyMonthFieldId); 	delete this._monthlyMonthFieldId;
	this._monthlyMonthFieldEx = Dwt.getDomObj(doc, this._monthlyMonthFieldExId);delete this._monthlyMonthFieldExId;
	this._yearlyDefaultRadio = Dwt.getDomObj(doc, this._yearlyDefaultId); 		delete this._yearlyDefaultId;
	this._yearlyDayField = Dwt.getDomObj(doc, this._yearlyDayFieldId); 			delete this._yearlyDayFieldId;
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
		ev.dwtObj.getHtmlElement().appendChild(this._dateCalendar.getHtmlElement());
	} else {
		// only toggle display if user clicked on same button calendar is being shown for
		if (this._dateCalendar.getHtmlElement().parentNode == ev.dwtObj.getHtmlElement())
			this._dateCalendar.setVisible(!this._dateCalendar.getVisible());
		else
			this._dateCalendar.setVisible(true);
	}

	// always reset the date to today's date
	this._dateCalendar.setDate(new Date(), true);
};

ZmApptRecurDialog.prototype._dateCalSelectionListener = 
function(ev) {
	this._endByField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
	this._endByRadio.checked = true;
	this._dateCalendar.setVisible(false);
};

ZmApptRecurDialog.prototype._okListener = 
function() {
	this._saveState = true;
};

ZmApptRecurDialog.prototype._cancelListener = 
function() {
	this._cleanup();
};
