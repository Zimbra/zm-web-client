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

ZmApptRecurDialog.prototype.initialize = 
function(startDate, endDate, repeatType) {
	this._startDate = startDate;
	this._endDate = endDate;
	
	// based on repeat type, setup the repeat type values
	var repeatType = repeatType || "DAI";
	this._repeatSelect.setSelectedValue(repeatType);
	this._setRepeatSection(repeatType);
};

ZmApptRecurDialog.prototype.cleanup = 
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);

	if (bPoppedUp) {
		// TODO:
		// - reset time based fields
		this._endByField.value = AjxDateUtil.simpleComputeDateStr(new Date());
	} else {
		// TODO:
		// - reset default values
		this._noEndDateRadio.checked = true;
		this._endIntervalField.value = "1";
	}
};

ZmApptRecurDialog.prototype.getSelectedRepeatValue = 
function() {
	return this._repeatSelect.getValue();
};


// Private / protected methods
 
ZmApptRecurDialog.prototype._setHtml = 
function() {
	this._repeatSelectId = Dwt.getNextId();
	this._repeatSectionId = Dwt.getNextId();
	this._repeatEndDivId = Dwt.getNextId();

	var html = new Array();
	var i = 0;
	
	html[i++] = "<table border=0 width=450>";
	html[i++] = "<tr><td><fieldset><legend>";
	html[i++] = ZmMsg.repeat;
	html[i++] = "</legend><div style='height:120px'>";
	html[i++] = "<div id='";
	html[i++] = this._repeatSelectId;
	html[i++] = "'></div><div id='";
	html[i++] = this._repeatSectionId;
	html[i++] = "'></div>";
	html[i++] = "</div></fieldset></td></tr>";
	html[i++] = "<tr><td><div id='";
	html[i++] = this._repeatEndDivId;
	html[i++] = "'><fieldset><legend>";
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
		div.id = this._repeatDailyId = Dwt.getNextId();
		div.innerHTML = this._createRepeatDaily();
		sectionDiv.appendChild(div);
		
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatWeeklyId = Dwt.getNextId();
		div.innerHTML = "Weekly";
		sectionDiv.appendChild(div);
	
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatMonthlyId = Dwt.getNextId();
		div.innerHTML = "Monthly";
		sectionDiv.appendChild(div);
	
		var div = doc.createElement("div");
		div.style.position = "relative";
		div.style.display = "none";
		div.id = this._repeatYearlyId = Dwt.getNextId();
		div.innerHTML = "Yearly";
		sectionDiv.appendChild(div);
	}
};

ZmApptRecurDialog.prototype._createRepeatDaily = 
function() {
	this._dailyRadioName = Dwt.getNextId();
	this._everyDayRadioId = Dwt.getNextId();
	this._everyXDaysFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<table border=0>";
	html[i++] = "<tr><td><input checked type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._everyDayRadioId;
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
	html[i++] = this._everyXDaysFieldId;
	html[i++] = "'></td><td>";
	html[i++] = ZmMsg.day_s;
	html[i++] = "</td></tr></table>";

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
	
	this._endByButton = new DwtButton(this);
	this._endByButton.setImage("SelectPullDownArrow");
	this._endByButton.addSelectionListener(new AjxListener(this, this._endByButtonListener));
	this._endByButton.setSize(20, 20);
	var endByButtonCell = Dwt.getDomObj(doc, this._endByButtonId);
	if (endByButtonCell)
		endByButtonCell.appendChild(this._endByButton.getHtmlElement());
};

ZmApptRecurDialog.prototype._cacheFields = 
function() {
	var doc = this.getDocument();

	this._noEndDateRadio = Dwt.getDomObj(doc, this._noEndDateRadioId);
	this._endByRadio = Dwt.getDomObj(doc, this._endByRadioId);
	this._repeatSectionDiv = Dwt.getDomObj(doc, this._repeatSectionId);
	this._repeatEndDiv = Dwt.getDomObj(doc, this._repeatEndDivId);
	this._repeatDailyDiv = Dwt.getDomObj(doc, this._repeatDailyId);
	this._repeatWeeklyDiv = Dwt.getDomObj(doc, this._repeatWeeklyId);
	this._repeatMonthlyDiv = Dwt.getDomObj(doc, this._repeatMonthlyId);
	this._repeatYearlyDiv = Dwt.getDomObj(doc, this._repeatYearlyId);
	this._endIntervalField = Dwt.getDomObj(doc, this._endIntervalFieldId);
	this._endByField = Dwt.getDomObj(doc, this._endByFieldId);
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
	var endByField = Dwt.getDomObj(this.getDocument(), this._endByFieldId);
	if (endByField) {
		endByField.value = AjxDateUtil.simpleComputeDateStr(ev.detail);
		this._endByRadio.checked = true;
	}
	this._dateCalendar.setVisible(false);
};
