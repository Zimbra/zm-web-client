/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmMailPrefsPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
};
ZmMailPrefsPage.prototype = new ZmPreferencesPage;
ZmMailPrefsPage.prototype.constructor = ZmMailPrefsPage;

ZmMailPrefsPage.prototype.toString = function() {
	return "ZmMailPrefsPage";
};

//
// ZmPreferencesPage methods
//

ZmMailPrefsPage.prototype.reset = function(useDefaults) {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}
};

ZmMailPrefsPage.prototype._createControls = function() {
	ZmPreferencesPage.prototype._createControls.apply(this, arguments);

    this._sId = this._htmlElId + "_startMiniCal";
    this._eId = this._htmlElId + "_endMiniCal";
    this._startDateField 	= document.getElementById(this._htmlElId + "_VACATION_FROM1");
    this._endDateField 		= document.getElementById(this._htmlElId + "_VACATION_UNTIL1");

    this._startDateVal 	= document.getElementById(this._htmlElId + "_VACATION_FROM");
    this._endDateVal 		= document.getElementById(this._htmlElId + "_VACATION_UNTIL");
    this._formatter = new AjxDateFormat("yyyyMMddHHmmss'Z'");

    
    this._startDateField.value = AjxDateUtil.simpleComputeDateStr(this._formatter.parse(this._startDateVal.value));
    this._endDateField.value = AjxDateUtil.simpleComputeDateStr(this._formatter.parse(this._endDateVal.value));


    /*this._startDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._startDateField.value) || new Date());
    this._endDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._endDateField.value) || new Date());//this._formatter.format(this._endDateField.value);*/

    /*var today =  new Date();
    this._startDateField.value = AjxDateUtil.simpleComputeDateStr(today);
    today.setDate(today.getDate()+1);
    var nextDay = AjxDateUtil.getDateForNextDay(today,AjxDateUtil.FRIDAY,1)
    this._endDateField.value = AjxDateUtil.simpleComputeDateStr(nextDay);*/
    
    var dateButtonListener = new AjxListener(this, this._dateButtonListener);
    var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

    this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._sId, dateButtonListener, dateCalSelectionListener, true);
    this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._eId, dateButtonListener, dateCalSelectionListener, true);

    var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if (cbox) {
		this._handleEnableVacationMsg(cbox);
	}
};

ZmMailPrefsPage.prototype._dateButtonListener =
function(ev) {
	var calDate = ev.item == this._startDateButton
		? AjxDateUtil.simpleParseDateStr(this._startDateField.value)
		: AjxDateUtil.simpleParseDateStr(this._endDateField.value);

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
	ev.item.popup();
};


ZmMailPrefsPage.prototype._dateCalSelectionListener =
function(ev) {
	var parentButton = ev.item.parent.parent;

	// do some error correction... maybe we can optimize this?
	var sd = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var ed = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	var newDate = AjxDateUtil.simpleComputeDateStr(ev.detail);

	// change the start/end date if they mismatch
	if (parentButton == this._startDateButton) {
		if (ed.valueOf() < ev.detail.valueOf())
			this._endDateField.value = AjxDateUtil.simpleComputeDateStr(AjxDateUtil.getDateForNextDay(AjxDateUtil.simpleParseDateStr(newDate),AjxDateUtil.FRIDAY));
		this._startDateField.value = newDate;
	} else {
        if(ev.detail < new Date()) return;
        if (sd.valueOf() > ev.detail.valueOf())
			this._startDateField.value = newDate;
		this._endDateField.value = newDate;
	}
    this._startDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._startDateField.value));
    this._endDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._endDateField.value));
    
};



ZmMailPrefsPage.prototype._setupCheckbox = function(id, setup, value) {
	var cbox = ZmPreferencesPage.prototype._setupCheckbox.apply(this, arguments);
	if (id == ZmSetting.VACATION_MSG_ENABLED) {
		cbox.addSelectionListener(new AjxListener(this, this._handleEnableVacationMsg, [cbox]));
	}
	return cbox;
};

//
// Protected methods
//

ZmMailPrefsPage.prototype._handleEnableVacationMsg = function(cbox, evt) {
	var textarea = this.getFormObject(ZmSetting.VACATION_MSG);
    if (textarea) {
		textarea.setEnabled(cbox.isSelected());

        this._startDateField.disabled = !cbox.isSelected();
        this._endDateField.disabled = !cbox.isSelected();

        this._startDateButton.setEnabled(cbox.isSelected());
        this._endDateButton.setEnabled(cbox.isSelected());

    }
};