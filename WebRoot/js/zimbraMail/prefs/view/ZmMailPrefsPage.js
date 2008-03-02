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

    if(this._startDateVal.value != null && this._startDateVal.value != ""){
        this._startDateField.value = AjxDateUtil.simpleComputeDateStr(this._formatter.parse(this._startDateVal.value));
    }else{
        this._startDateField.value =  AjxDateUtil.simpleComputeDateStr(new Date());
    }
    if(this._endDateVal.value != null && this._endDateVal.value != ""){
        this._endDateField.value = AjxDateUtil.simpleComputeDateStr(this._formatter.parse(this._endDateVal.value));
    }else{
        this._endDateField.value =  AjxDateUtil.simpleComputeDateStr(AjxDateUtil.getDateForNextDay(new Date(),AjxDateUtil.FRIDAY));
    }

    var dateButtonListener = new AjxListener(this, this._dateButtonListener);
    var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);

    this._startDateButton = ZmCalendarApp.createMiniCalButton(this, this._sId, dateButtonListener, dateCalSelectionListener);
    this._endDateButton = ZmCalendarApp.createMiniCalButton(this, this._eId, dateButtonListener, dateCalSelectionListener);

    this._startDateCheckbox = this.getFormObject(ZmSetting.START_DATE_ENABLED);
    this._endDateCheckbox = this.getFormObject(ZmSetting.END_DATE_ENABLED);    


    var cbox = this.getFormObject(ZmSetting.VACATION_MSG_ENABLED);
	if(cbox && cbox.isSelected()){
        if(this._startDateVal.value){
            this._startDateCheckbox.setSelected(true);
            this._setEnabledStartDate(true);
        }
        if(this._endDateVal.value){
            this._endDateCheckbox.setSelected(true);
            this._setEnabledEndDate(true);
        }
    }
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
    if(this._startDateCheckbox.isSelected()){
       this._startDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._startDateField.value));
    }
    if(this._endDateCheckbox.isSelected()){
        this._endDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._endDateField.value));
    }
};



ZmMailPrefsPage.prototype._setupCheckbox = function(id, setup, value) {
	var cbox = ZmPreferencesPage.prototype._setupCheckbox.apply(this, arguments);
	if (id == ZmSetting.VACATION_MSG_ENABLED || id == ZmSetting.START_DATE_ENABLED || id == ZmSetting.END_DATE_ENABLED) {
		cbox.addSelectionListener(new AjxListener(this, this._handleEnableVacationMsg, [cbox, id]));
	}
	return cbox;
};

//
// Protected methods
//

ZmMailPrefsPage.prototype._handleEnableVacationMsg = function(cbox, id, evt) {
	var textarea = this.getFormObject(ZmSetting.VACATION_MSG);
    if (textarea) {
        if(id == ZmSetting.START_DATE_ENABLED){
            this._setEnabledStartDate(cbox.isSelected());
        }else if(id == ZmSetting.END_DATE_ENABLED){
            this._setEnabledEndDate(cbox.isSelected());
        }else{
            textarea.setEnabled(cbox.isSelected());
            this._startDateCheckbox.setEnabled(cbox.isSelected());
            this._endDateCheckbox.setEnabled(cbox.isSelected());
            
            this._setEnabledStartDate(cbox.isSelected());
            this._setEnabledEndDate(cbox.isSelected());
        }
    }
};

ZmMailPrefsPage.prototype._setEnabledStartDate = function(val) {
    //this._startDateCheckbox.setEnabled(val);
    var condition = val && this._startDateCheckbox.isSelected(); 
    this._startDateField.disabled = !condition;
    this._startDateButton.setEnabled(condition);
    if(!condition){
        this._startDateVal.value = null;
    }else{
        this._startDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._startDateField.value));    
    }
};

ZmMailPrefsPage.prototype._setEnabledEndDate = function(val) {
    //this._endDateCheckbox.setEnabled(val);
    var condition = val && this._endDateCheckbox.isSelected();
    this._endDateField.disabled = !condition;
    this._endDateButton.setEnabled(condition);
    if(!condition){
        this._endDateVal.value = null;
    }else{
        this._endDateVal.value =  this._formatter.format(AjxDateUtil.simpleParseDateStr(this._endDateField.value));
    }
};

