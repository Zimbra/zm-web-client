/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a generic time picker dialog
 * @constructor
 * @class
 * 
 * @extends		ZmDialog
 * 
 */
ZmTimeDialog = function(params) {
	ZmDialog.call(this, params);
	var html = AjxTemplate.expand("share.Dialogs#ZmTimeDialog", {id: this._htmlElId, description: ZmMsg.sendLaterDescription, label: ZmMsg.time});
	this.setContent(html);
	this.setTitle(ZmMsg.sendLaterTitle);
	this._createDwtObjects();
};

ZmTimeDialog.prototype = new ZmDialog;
ZmTimeDialog.prototype.constructor = ZmTimeDialog;

// Public

ZmTimeDialog.prototype.toString = 
function() {
	return "ZmTimeDialog";
};

ZmTimeDialog.prototype.initialize = 
function() {
	// Init Date / time picker
	var now = new Date();
	this._dateField.value = AjxDateUtil.simpleComputeDateStr(now);
	this.showTimeFields(true);
	this._timeSelect.set(now);

	// Init Timezone picker
	var options = AjxTimezone.getAbbreviatedZoneChoices();
	var serverIdMap = {};
	var serverId;
	if (options.length != this._tzCount) {
		this._tzCount = options.length;
		this._tzoneSelect.clearOptions();
		for (var i = 0; i < options.length; i++) {
			if (!options[i].autoDetected) {
				serverId = options[i].value;
				serverIdMap[serverId] = true;
				this._tzoneSelect.addOption(options[i]);
			}
		}
	}
	this.autoSelectTimezone();
};



ZmTimeDialog.prototype.isValid = 
function() {
	return true;
};

ZmTimeDialog.prototype.isDirty = 
function() {
	return true;
};

ZmTimeDialog.prototype.getValue =
function() {
	var date = this._timeSelect.getValue(AjxDateUtil.simpleParseDateStr(this._dateField.value));
	var timezone = this._tzoneSelect.getValue();
	return {date: date, timezone: timezone};
}

ZmTimeDialog.prototype.popup =
function() {
	this.initialize();
	ZmDialog.prototype.popup.call(this);
	if (!this._tabGroupComplete) {
		var members = [this._dateField, this._dateButton, this._timeSelect.getInputField(), this._tzoneSelect];
		for (var i = 0; i < members.length; i++) {
			this._tabGroup.addMember(members[i], i);
		}
		this._tabGroupComplete = true;
	}
	this._tabGroup.setFocusMember(this._dateField);
};

// Private / protected methods

ZmTimeDialog.prototype._createDwtObjects =
function() {

	var dateButtonListener = new AjxListener(this, this._dateButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

	this._dateButton = this.createMiniCalButton(this._htmlElId + "_miniCal", dateButtonListener, dateCalSelectionListener);

	// create selects for Time section
	var timeSelectListener = new AjxListener(this, this._timeChangeListener);
	
	this._timeSelect = new ZmTimeInput(this, ZmTimeInput.START);
	this._timeSelect.addChangeListener(timeSelectListener);
	this._timeSelect.reparentHtmlElement(this._htmlElId + "_time");

	this._dateField = Dwt.byId(this._htmlElId + "_date");

	this._tzoneSelect = new DwtSelect({parent:this, parentElement: (this._htmlElId + "_tzSelect"), cascade:true});
};

ZmTimeDialog.prototype.showTimeFields = 
function(show) {
	Dwt.setVisibility(this._timeSelect.getHtmlElement(), show);
};

// Listeners

ZmTimeDialog.prototype._dateButtonListener = 
function(ev) {
	var calDate = AjxDateUtil.simpleParseDateStr(this._dateField.value);

	// if date was input by user and its foobar, reset to today's date
	if (calDate === null || isNaN(calDate)) {
		calDate = new Date();
		var field = this._dateField;
		field.value = AjxDateUtil.simpleComputeDateStr(calDate);
	}

	// always reset the date to current field's date
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	cal.setDate(calDate, true);
	ev.item.popup();
};

ZmTimeDialog.prototype._dateCalSelectionListener = 
function(ev) {
	var parentButton = ev.item.parent.parent;

	// do some error correction... maybe we can optimize this?
	var sd = AjxDateUtil.simpleParseDateStr(this._dateField.value);
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	if (parentButton == this._dateButton) {
		this._dateField.value = newDate;
	}
};

ZmTimeDialog.prototype.createMiniCalButton =
function(buttonId, dateButtonListener, dateCalSelectionListener) {
	// create button
	var dateButton = new DwtButton({parent:this});
	dateButton.addDropDownSelectionListener(dateButtonListener);
	dateButton.setData(Dwt.KEY_ID, buttonId);
	if (AjxEnv.isIE) {
		dateButton.setSize("20");
	}

	// create menu for button
	var calMenu = new DwtMenu({parent:dateButton, style:DwtMenu.CALENDAR_PICKER_STYLE});
	calMenu.setSize("150");
	calMenu._table.width = "100%";
	dateButton.setMenu(calMenu, true);

	// create mini cal for menu for button
	var cal = new DwtCalendar({parent:calMenu});
	cal.setData(Dwt.KEY_ID, buttonId);
	cal.setSkipNotifyOnPage(true);
	var fdow = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
	cal.setFirstDayOfWeek(fdow);
	cal.addSelectionListener(dateCalSelectionListener);
	// add settings change listener on mini cal in case first day of week setting changes
	// safety check since this is static code (may not have loaded calendar)
	var fdowSetting = appCtxt.getSettings().getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK);
	if (fdowSetting) {
		var listener = new AjxListener(null, ZmCalendarApp._settingChangeListener, cal);
		fdowSetting.addChangeListener(listener);
	}

	// reparent and cleanup
	dateButton.reparentHtmlElement(buttonId);
	delete buttonId;

	return dateButton;
};

ZmTimeDialog.prototype.autoSelectTimezone =
function() {
	if (AjxTimezone.DEFAULT_RULE.autoDetected) {

		var cRule = AjxTimezone.DEFAULT_RULE;
		var standardOffsetMatch, daylightOffsetMatch, transMatch;

		for (var i in AjxTimezone.MATCHING_RULES) {
			var rule = AjxTimezone.MATCHING_RULES[i];
			if (rule.autoDetected) continue;
			if (rule.standard.offset == cRule.standard.offset) {

				if (!standardOffsetMatch)
					standardOffsetMatch = rule.serverId;

				var isDayLightOffsetMatching = (cRule.daylight && rule.daylight && (rule.daylight.offset == cRule.daylight.offset));

				if(isDayLightOffsetMatching) {
					if (!daylightOffsetMatch)
						daylightOffsetMatch = rule.serverId;
					var isTransYearMatching = (rule.daylight.trans[0] == cRule.daylight.trans[0]);
					var isTransMonthMatching = (rule.daylight.trans[1] == cRule.daylight.trans[1]);
					if (isTransYearMatching && isTransMonthMatching && !transMatch)
						transMatch = rule.serverId;
				}
			}
		}
		//select closest matching timezone
		var serverId = transMatch ? transMatch : (daylightOffsetMatch || standardOffsetMatch);
		if (serverId) this._tzoneSelect.setSelectedValue(serverId);
	} else {
		var tz = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
		this._tzoneSelect.setSelectedValue(tz);
	}
};
