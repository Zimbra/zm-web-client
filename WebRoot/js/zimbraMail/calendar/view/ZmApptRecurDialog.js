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
 * Creates a new appointment recurrence dialog. The view displays itself on construction.
 * @constructor
 * @class
 * This class provides a dialog for creating/editing recurrences for an appointment
 *
 * @author Parag Shah
 * 
 * @param {ZmControl}	parent			the element that created this view
 * @param {String}	className 		optional class name for this view
 * 
 * @extends		DwtDialog
 */
ZmApptRecurDialog = function(parent, className) {

	DwtDialog.call(this, {parent:parent, className:className, title:ZmMsg.customRepeat});

	// set html content once (hence, in ctor)
	this.setContent(this._setHtml());
	this._createRepeatSections();
	this._createDwtObjects();
	this._cacheFields();
	this._addEventHandlers();
	this._createTabGroup();

	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okListener));
	this.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelListener));
};

ZmApptRecurDialog.prototype = new DwtDialog;
ZmApptRecurDialog.prototype.constructor = ZmApptRecurDialog;


// Consts

ZmApptRecurDialog.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 			value: ZmRecurrence.NONE,		selected: true 	},
	{ label: ZmMsg.daily, 			value: ZmRecurrence.DAILY,		selected: false },
	{ label: ZmMsg.weekly, 			value: ZmRecurrence.WEEKLY,		selected: false },
	{ label: ZmMsg.monthly, 		value: ZmRecurrence.MONTHLY,	selected: false },
	{ label: ZmMsg.yearly, 			value: ZmRecurrence.YEARLY,		selected: false }];


// Public methods

ZmApptRecurDialog.prototype.toString = 
function() {
	return "ZmApptRecurDialog";
};

ZmApptRecurDialog.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

ZmApptRecurDialog.prototype.initialize = 
function(startDate, endDate, repeatType, appt) {

    this._startDate = new Date(startDate.getTime());
	this._endDate = new Date(endDate.getTime());
    this._origRefDate = startDate;
    // based on repeat type, setup the repeat type values
	var repeatType = repeatType || ZmRecurrence.DAILY;
	this._repeatSelect.setSelectedValue(repeatType);
	this._setRepeatSection(repeatType);

	// dont bother initializing if user is still mucking around
	if (this._saveState)
		return;

	var startDay = this._startDate.getDay();
	var startDate = this._startDate.getDate();
	var startMonth = this._startDate.getMonth();

	// reset time based fields
	this._endByField.setValue(AjxDateUtil.simpleComputeDateStr(this._startDate));
    this._weeklySelectButton._selected = startDay;
    this._weeklySelectButton.setDisplayState(DwtControl.SELECTED);

    var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryWeekday);
    var dayFormatter = formatter.getFormatsByArgumentIndex()[0];
    this._weeklySelectButton.setText(dayFormatter.format(this._origRefDate));
    
    this._weeklyCheckboxes[startDay].checked = true;
	this._monthlyDayField.setValue(startDate);
	this._monthlyWeekdaySelect.setSelected(startDay);
	this._yearlyDayField.setValue(startDate);
	this._yearlyMonthSelect.setSelected(startMonth);
	this._yearlyWeekdaySelect.setSelected(startDay);
	this._yearlyMonthSelectEx.setSelected(startMonth);

	// if given appt object, means user is editing existing appointment's recur rules
	if (appt) {
		this._populateForEdit(appt);
	}
};

/**
 * Gets the selected repeat value.
 * 
 * @return	{constant}	the repeat value
 */
ZmApptRecurDialog.prototype.getSelectedRepeatValue = 
function() {
	return this._repeatSelect.getValue();
};

/**
 * Sets repeat end values.
 * 
 * @param	{ZmAppt}	appt		the appointment
 */
ZmApptRecurDialog.prototype.setRepeatEndValues = 
function(appt) {
	var recur = appt._recurrence;
	recur.repeatEndType = this._getRadioOptionValue(this._repeatEndName);

	// add any details for the select option
	if (recur.repeatEndType == "A")
		recur.repeatEndCount = this._endIntervalField.getValue();
	else if (recur.repeatEndType == "D")
		recur.repeatEndDate = AjxDateUtil.simpleParseDateStr(this._endByField.getValue());
};

/**
 * Sets custom daily values.
 * 
 * @param	{ZmAppt}	appt		the appointment
 */
ZmApptRecurDialog.prototype.setCustomDailyValues = 
function(appt) {
	var recur = appt._recurrence;
	var value = this._getRadioOptionValue(this._dailyRadioName);
    recur._startDate = new Date(this._origRefDate);	
	recur.repeatCustom = "1";
	recur.repeatWeekday = false;
	
	if (value == "2") {
		recur.repeatWeekday = true;
        //Let's check if it is sat/sunday today
        var d = new Date(this._origRefDate); //Using the start date specified...can be in the past
        if(d.getDay()==AjxDateUtil.SUNDAY || d.getDay()==AjxDateUtil.SATURDAY){
            recur._startDate = AjxDateUtil.getDateForNextDay(d,AjxDateUtil.MONDAY); // get subsequent monday, weekday
        }
   		recur.repeatCustomCount = 1;
    } else {
		recur.repeatCustomCount = value == "3" ? (Number(this._dailyField.getValue())) : 1;
	}
};

/**
 * Sets custom weekly values.
 * 
 * @param	{ZmAppt}	appt		the appointment
 */
ZmApptRecurDialog.prototype.setCustomWeeklyValues =
function(appt) {
	var recur = appt._recurrence;
	recur.repeatWeeklyDays = []
	recur.repeatCustom = "1";
    recur._startDate = new Date(this._origRefDate);
	var value = this._getRadioOptionValue(this._weeklyRadioName);
    var currentDay = recur._startDate.getDay();
	if (value == "1") {
		recur.repeatCustomCount = 1;
        var startDay = this._weeklySelectButton._selected;
        switch(startDay){
            case 7: //Separator
                    break;
            case 8: //Mon, wed, Fri
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.MONDAY]);
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.WEDNESDAY]);
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.FRIDAY]);
                    startDay = AjxDateUtil.MONDAY;
                    while(startDay < currentDay){
                        startDay += 2;
                    }
                    break;
            case 9: //Tue, Thu
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.TUESDAY]);
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.THURSDAY]);
                    startDay = AjxDateUtil.TUESDAY;
                    while(startDay < currentDay){
                        startDay += 2;
                    }
                    break;
            case 10: //Sat, Sunday
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SATURDAY]);
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[AjxDateUtil.SUNDAY]);
                    startDay = currentDay == AjxDateUtil.SUNDAY? currentDay:AjxDateUtil.SATURDAY;
                    break;
            default:
                    recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[this._weeklySelectButton._selected/*getValue()*/]);
                    break;
        }
        recur._startDate = AjxDateUtil.getDateForNextDay(new Date(this._origRefDate),startDay);
        //recur._endDate = recur._startDate;
    } else {
		recur.repeatCustomCount = Number(this._weeklyField.getValue());
        var selectedDays = [];
        for (var i = 0; i < this._weeklyCheckboxes.length; i++) {
			if (this._weeklyCheckboxes[i].checked){
                selectedDays.push(i);
                recur.repeatWeeklyDays.push(ZmCalItem.SERVER_WEEK_DAYS[i]);
            }
        }
        var startDay = currentDay;
        for(var i =0; i < selectedDays.length;i++){
            var startDay = selectedDays[i];
            if(startDay >= currentDay) { //In past
                break;
            }
        }
        recur._startDate = AjxDateUtil.getDateForNextDay(new Date(this._origRefDate),startDay);
    }
};

/**
 * Sets custom monthly values.
 * 
 * @param	{ZmAppt}	appt		the appointment
 */
ZmApptRecurDialog.prototype.setCustomMonthlyValues =
function(appt) {
	var recur = appt._recurrence;
	recur.repeatCustom = "1";
   	var value = this._getRadioOptionValue(this._monthlyRadioName);
    recur._startDate = new Date(this._origRefDate);
	if (value == "1") {
		recur.repeatCustomType = "S";
		recur.repeatCustomCount = this._monthlyMonthField.getValue();
		recur.repeatMonthlyDayList = [this._monthlyDayField.getValue()];
        recur.repeatCustomMonthDay = this._monthlyDayField.getValue();
        recur._startDate.setDate(recur.repeatCustomMonthDay);
        var today = new Date(this._origRefDate); //Reference date...
        var diff = (today - recur._startDate);
        if(diff >= AjxDateUtil.MSEC_PER_DAY || today.getDate() > recur._startDate.getDate()){ // was in the past, so let's use the next date
            recur._startDate.setMonth(recur._startDate.getMonth()+1);
        }

    } else {
		recur.repeatCustomType = "O";
		recur.repeatCustomCount = this._monthlyMonthFieldEx.getValue();
		recur.repeatBySetPos = this._monthlyDaySelect.getValue();
		recur.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this._monthlyWeekdaySelect.getValue()];
        recur.repeatCustomDays = this.getWeekdaySelectValue(this._monthlyWeekdaySelect);

        if(recur.repeatBySetPos==-1){ // Last day
            var lastDate = new Date(this._origRefDate);
            lastDate.setDate(AjxDateUtil.daysInMonth(lastDate.getFullYear(),lastDate.getMonth())); //Date is now last date of this month
            var lastDayDate = this.getPossibleStartDate(this._monthlyWeekdaySelect.getValue(), lastDate, recur.repeatBySetPos);

            //Check if it is already paased
            var today = new Date(this._origRefDate);
            var diff = (today - lastDayDate);
            var isInPast = today.getTime() > lastDayDate.getTime();
            if(diff >= AjxDateUtil.MSEC_PER_DAY || isInPast ){ //In the past
                // Go for next month
                lastDate.setMonth(lastDate.getMonth()+1);
                recur._startDate = this.getPossibleStartDate(this._monthlyWeekdaySelect.getValue(), lastDate, recur.repeatBySetPos);                              
            }else{
                 recur._startDate = lastDayDate;
            }
        }else{
            var first = new Date(this._origRefDate);
            first.setDate(1);  
            recur._startDate = this.getPossibleStartDate(this._monthlyWeekdaySelect.getValue(), first, recur.repeatBySetPos); //AjxDateUtil.getDateForNextDay(first,this.getFirstWeekDayOffset(this._monthlyWeekdaySelect),recur.repeatBySetPos);
             //Check if it is already paased
            var today = new Date(this._origRefDate);
            var diff = (today - recur._startDate);
            var isInPast = today.getTime() > recur._startDate.getTime();
            if(diff >= AjxDateUtil.MSEC_PER_DAY || isInPast){ //In the past
                // Go for next month, find the date as per rule
                first.setMonth(first.getMonth() + 1);//Next month
                recur._startDate = this.getPossibleStartDate(this._monthlyWeekdaySelect.getValue(), first, recur.repeatBySetPos);
            }
        }
    }
};

/**
 * Sets custom yearly values.
 * 
 * @param	{ZmAppt}	appt		the appointment
 */
ZmApptRecurDialog.prototype.setCustomYearlyValues =
function(appt) {
	appt._recurrence.repeatCustom = "1";
    var recur = appt._recurrence;
    recur._startDate = new Date(this._origRefDate);
	var value = this._getRadioOptionValue(this._yearlyRadioName);

	if (value == "1") {
		appt._recurrence.repeatCustomType = "S";
		appt._recurrence.repeatCustomMonthDay = this._yearlyDayField.getValue();
		appt._recurrence.repeatYearlyMonthsList = this._yearlyMonthSelect.getValue() + 1;
        //Create date out of it
        var d  = new Date(this._origRefDate);
        d.setDate(appt._recurrence.repeatCustomMonthDay);
        d.setMonth(this._yearlyMonthSelect.getValue());
        //Try to judge, if this date is in future
        var today = new Date(this._origRefDate);
        var diff = (today - d);
        var isInPast = today.getTime() > d.getTime();
        if( diff >= AjxDateUtil.MSEC_PER_DAY || isInPast){ //In the past
            d.setFullYear(d.getFullYear()+1);
        }
        appt._recurrence._startDate = d;
        appt._recurrence._endDate = d;
    } else {
		appt._recurrence.repeatCustomType = "O";
		appt._recurrence.repeatBySetPos = this._yearlyDaySelect.getValue();
		appt._recurrence.repeatCustomDayOfWeek = ZmCalItem.SERVER_WEEK_DAYS[this._yearlyWeekdaySelect.getValue()];
        appt._recurrence.repeatCustomDays = this.getWeekdaySelectValue(this._yearlyWeekdaySelect);

        appt._recurrence.repeatYearlyMonthsList = this._yearlyMonthSelectEx.getValue() + 1;
        var d = new Date(this._origRefDate);
        d.setMonth(this._yearlyMonthSelectEx.getValue());
        //Check if date is in past
        if(appt._recurrence.repeatBySetPos < 0){ // we want last day
            d.setDate(AjxDateUtil.daysInMonth(d.getFullYear(),d.getMonth()));
        }else{
            d.setDate(1);
        }
        var dt = this.getPossibleStartDate(this._yearlyWeekdaySelect.getValue(), d, appt._recurrence.repeatBySetPos);

        var today = new Date(this._origRefDate);
        var diff = (today -dt);
        var isInPast = today.getTime() > dt.getTime();
        if(diff >= AjxDateUtil.MSEC_PER_DAY || isInPast){ // In the past
            d.setFullYear(d.getFullYear()+1);
            if(appt._recurrence.repeatBySetPos < 0){ // we want last day
                d.setDate(AjxDateUtil.daysInMonth(d.getFullYear(),d.getMonth()));
            }else{
                d.setDate(1);
            }
        }
        appt._recurrence._startDate = this.getPossibleStartDate(this._yearlyWeekdaySelect.getValue(), d, appt._recurrence.repeatBySetPos);
        appt._recurrence._endDate = appt._recurrence._startDate;
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
	var valid = true;

	// ONLY for the selected options, check if their fields are valid
	var repeatValue = this._repeatSelect.getValue();

	if (repeatValue == ZmRecurrence.DAILY) {
		if (this._dailyFieldRadio.checked)
			valid = this._dailyField.isValid();
		if (!valid)
			this._dailyField.blur();
	} else if (repeatValue == ZmRecurrence.WEEKLY) {
		if (this._weeklyFieldRadio.checked) {
			valid = this._weeklyField.isValid();
			if (valid) {
				valid = false;
				for (var i=0; i<this._weeklyCheckboxes.length; i++) {
					if (this._weeklyCheckboxes[i].checked) {
						valid = true;
						break;
					}
				}
			}
			// weekly section is special - force a focus if valid to clear out error
			this._weeklyField.focus();
			this._weeklyField.blur();
		}
	} else if (repeatValue == ZmRecurrence.MONTHLY) {
		if (this._monthlyDefaultRadio.checked) {
			valid = this._monthlyMonthField.isValid() && this._monthlyDayField.isValid();
			if (!valid) {
				this._monthlyMonthField.blur();
				this._monthlyDayField.blur();
			}
		} else {
			valid = this._monthlyMonthFieldEx.isValid();
			if (!valid)
				this._monthlyMonthFieldEx.blur();
		}
	} else if (repeatValue == ZmRecurrence.YEARLY) {
		if (this._yearlyDefaultRadio.checked)
			valid = this._yearlyDayField.isValid();
		if (!valid)
			this._yearlyDayField.blur();
	}

	// check end section
	if (valid) {
		if (this._endAfterRadio.checked) {
			valid = this._endIntervalField.isValid();
			if (!valid)
				this._endIntervalField.blur();
		} else if (this._endByRadio.checked) {
			valid = this._endByField.isValid();
			if (!valid)
				this._endByField.blur();
		}
	}

	return valid;
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
	html[i++] = "</table>";
	
	return html.join("");
};

ZmApptRecurDialog.prototype._getEndHtml = 
function() {
	this._repeatEndName = Dwt.getNextId();
	this._noEndDateRadioId = Dwt.getNextId();
	this._endByRadioId = Dwt.getNextId();
	this._endAfterRadioId = Dwt.getNextId();
	this._endIntervalFieldId = Dwt.getNextId();
	this._endByFieldId = Dwt.getNextId();
	this._endByButtonId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	// start table
	html[i++] = "<table border=0>";
	// no end date
	html[i++] = "<tr><td width=1%><input checked value='N' type='radio' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._noEndDateRadioId;
	html[i++] = "'></td><td colspan=2>";
	html[i++] = ZmMsg.recurEndNone;
	html[i++] = "</td></tr>";
	// end after <num> occurrences
	html[i++] = "<tr><td><input type='radio' value='A' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._endAfterRadioId;
	html[i++] = "'></td><td colspan=2><nobr>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='2'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurEndNumber);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		html[i++] = "<td>";
		var segment = segments[s];
		if (segment instanceof AjxMessageFormat.MessageSegment && 
			segment.getIndex() == 0) {
			html[i++] = "<span id='";
			html[i++] = this._endIntervalFieldId;
			html[i++] = "'></span>";
		}
		else {
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end by <date>
	html[i++] = "<tr><td><input type='radio' value='D' name='";
	html[i++] = this._repeatEndName;
	html[i++] = "' id='";
	html[i++] = this._endByRadioId;
	html[i++] = "'></td><td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='0'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurEndByDate);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		if (segment instanceof AjxMessageFormat.MessageSegment && 
			segment.getIndex() == 0) {
			html[i++] = "<td id='";
			html[i++] = this._endByFieldId;
			html[i++] = "'></td><td id='";
			html[i++] = this._endByButtonId;
			html[i++] = "'></td>";
		}
		else {
			html[i++] = "<td style='padding-left:2px;padding-right:2px'>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end table
	html[i++] = "</table>";

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
	this._dailyWeekdayId = Dwt.getNextId();
	this._dailyFieldRadioId = Dwt.getNextId();
	this._dailyFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	// start table
	html[i++] = "<table border=0>";
	// every day
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._dailyDefaultId;
	html[i++] = "'></td>";
	html[i++] = "<td>";
	html[i++] = ZmMsg.recurDailyEveryDay;
	html[i++] = "</td></tr>";
	// every weekday
	html[i++] = "<tr><td><input value='2' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._dailyWeekdayId;
	html[i++] = "'></td>";
	html[i++] = "<td>";
	html[i++] = ZmMsg.recurDailyEveryWeekday;
	html[i++] = "</td></tr>";
	// every <num> days
	html[i++] = "<tr><td><input value='3' type='radio' name='";
	html[i++] = this._dailyRadioName;
	html[i++] = "' id='";
	html[i++] = this._dailyFieldRadioId;
	html[i++] = "'></td><td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurDailyEveryNumDays);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		html[i++] = "<td>";
		var segment = segments[s];
		if (segment instanceof AjxMessageFormat.MessageSegment &&
			segment.getIndex() == 0) {
			html[i++] = "<span id='";
			html[i++] = this._dailyFieldId;
			html[i++] = "'></span>";
		}
		else {
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end table
	html[i++] = "</table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatWeekly = 
function() {
	this._weeklyRadioName = Dwt.getNextId();
	this._weeklyCheckboxName = Dwt.getNextId();
	this._weeklyDefaultId = Dwt.getNextId();
	this._weeklySelectId = Dwt.getNextId();
	this._weeklyFieldRadioId = Dwt.getNextId();
	this._weeklyFieldId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	// start table
	html[i++] = "<table border=0>";
	// every <weekday>
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._weeklyRadioName;
	html[i++] = "' id='";
	html[i++] = this._weeklyDefaultId;
	html[i++] = "'></td><td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryWeekday);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<td id='";
			html[i++] = this._weeklySelectId;
			html[i++] = "'>";
		}
		else {
			html[i++] = "<td>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// every <num> weeks on <days of week>
	html[i++] = "<tr valign='top'><td><input value='2' type='radio' name='";
	html[i++] = this._weeklyRadioName;
	html[i++] = "' id='";
	html[i++] = this._weeklyFieldRadioId;
	html[i++] = "'></td>";
	html[i++] = "<td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryNumWeeksDate);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<td id='";
			html[i++] = this._weeklyFieldId;
			html[i++] = "'>";
		}
		else if (index == 1) {
			html[i++] = "<td>";
			html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
			for (var j = 0; j < AjxDateUtil.WEEKDAY_MEDIUM.length; j++) {
				if (j > 0) {
					html[i++] = "<td>&nbsp;&nbsp;</td>";
				}
				html[i++] = "<td><input type='checkbox' name='";
				html[i++] = this._weeklyCheckboxName;
				html[i++] = "'></td><td>";
				html[i++] = AjxDateUtil.WEEKDAY_MEDIUM[j];
				html[i++] = "</td>";
			}
			html[i++] = "</tr></table>";
		}
		else if (index == 2) {
			html[i++] = "</td></tr></table>";
			html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
			continue;
		}
		else {
			html[i++] = "<td>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end table
	html[i++] = "</table>";

	return html.join("");
};

ZmApptRecurDialog.prototype._createRepeatMonthly = 
function() {
	this._monthlyRadioName = Dwt.getNextId();
	this._monthlyDefaultId = Dwt.getNextId();
	this._monthlyDayFieldId = Dwt.getNextId();
	this._monthlyMonthFieldId = Dwt.getNextId();
	this._monthlyFieldRadioId = Dwt.getNextId();
	this._monthlyDaySelectId = Dwt.getNextId();
	this._monthlyWeekdaySelectId = Dwt.getNextId();
	this._monthlyMonthFieldExId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	// start table
	html[i++] = "<table border=0>";
	// every <num> months on the <day>
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._monthlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._monthlyDefaultId;
	html[i++] = "'></td>";
	html[i++] = "<td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsDate);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		html[i++] = "<td>";
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<span id='";
			html[i++] = this._monthlyDayFieldId;
			html[i++] = "'></span>";
		}
		else if (index == 1) {
			html[i++] = "<span id='";
			html[i++] = this._monthlyMonthFieldId;
			html[i++] = "'></span>";
		}
		else {
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// every <num> months on the <ordinal> <weekday>
	html[i++] = "<tr><td><input value='2' type='radio' name='";
	html[i++] = this._monthlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._monthlyFieldRadioId;
	html[i++] = "'></td>";
	html[i++] = "<td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsNumDay);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<td id='";
			html[i++] = this._monthlyDaySelectId;
			html[i++] = "'>";
		}
		else if (index == 1) {
			html[i++] = "<td id='";
			html[i++] = this._monthlyWeekdaySelectId;
			html[i++] = "'>";
		}
		else if (index == 2) {
			html[i++] = "<td><span id='";
			html[i++] = this._monthlyMonthFieldExId;
			html[i++] = "'></span>";
		}
		else {
			html[i++] = "<td>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end table
	html[i++] = "</table>";

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
	this._yearlyFieldRadioId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	// start table
	html[i++] = "<table border=0>";
	// every year on <month> <day>
	html[i++] = "<tr><td><input checked value='1' type='radio' name='";
	html[i++] = this._yearlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._yearlyDefaultId;
	html[i++] = "'></td><td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryDate);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<td id='";
			html[i++] = this._yearlyMonthSelectId;
			html[i++] = "'>";
		}
		else if (index == 1) {
			html[i++] = "<td><span id='";
			html[i++] = this._yearlyDayFieldId;
			html[i++] = "'></span>";
		}
		else {
			html[i++] = "<td>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// every year on <ordinal> <weekday> of <month>
	html[i++] = "<tr><td><input value='2' type='radio' name='";
	html[i++] = this._yearlyRadioName;
	html[i++] = "' id='";
	html[i++] = this._yearlyFieldRadioId;
	html[i++] = "'></td><td>";
	html[i++] = "<table border='0' cellspacing='0' cellpadding='1'><tr>";
	var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthNumDay);
	var segments = formatter.getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index == 0) {
			html[i++] = "<td id='";
			html[i++] = this._yearlyDaySelectId;
			html[i++] = "'>";
		}
		else if (index == 1) {
			html[i++] = "<td id='";
			html[i++] = this._yearlyWeekdaySelectId;
			html[i++] = "'>";
		}
		else if (index == 2) {
			html[i++] = "<td id='";
			html[i++] = this._yearlyMonthSelectExId;
			html[i++] = "'>";
		}
		else {
			html[i++] = "<td>";
			html[i++] = segment.toSubPattern();
		}
		html[i++] = "</td>";
	}
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";
	// end table
	html[i++] = "</table>";
	
	return html.join("");
};

ZmApptRecurDialog.prototype._createDwtObjects = 
function() {
	// create all DwtSelect's
	this._createSelects();

	// create mini calendar button for end by field
	var dateButtonListener = new AjxListener(this, this._endByButtonListener);
	var dateCalSelectionListener = new AjxListener(this, this._dateCalSelectionListener);
	ZmCalendarApp.createMiniCalButton(this, this._endByButtonId, dateButtonListener, dateCalSelectionListener);

	// create all DwtInputField's
	this._createInputs();
};

ZmApptRecurDialog.prototype._createSelects = 
function() {
	this._repeatSelect = new DwtSelect({parent:this});
	this._repeatSelect.addChangeListener(new AjxListener(this, this._repeatChangeListener));
	for (var i = 0; i < ZmApptRecurDialog.REPEAT_OPTIONS.length; i++) {
		var option = ZmApptRecurDialog.REPEAT_OPTIONS[i];
		this._repeatSelect.addOption(option.label, option.selected, option.value);
	}
	this._repeatSelect.reparentHtmlElement(this._repeatSelectId);
	delete this._repeatSelectId;

	var selectChangeListener = new AjxListener(this, this._selectChangeListener);
	this._weeklySelectButton = new DwtButton({parent:this});//new DwtSelect({parent:this});
    var wMenu = new ZmPopupMenu(this._weeklySelectButton);
    this._weeklySelectButton.setMenu(wMenu);
    //this._weeklySelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryWeekday);
	var dayFormatter = formatter.getFormatsByArgumentIndex()[0];
	var day = new Date();
	day.setDate(day.getDate() - day.getDay());
    var monwedfri = new Array();
    var tuethu = new Array();
    var satsun = new Array();
    for (var i = 0; i < 7; i++) {
		//this._weeklySelect.addOption(dayFormatter.format(day), false, i);
        var mi = new DwtMenuItem({parent:wMenu, style:DwtMenuItem.CHECK_STYLE, radioGroupId:i});
        mi.setText(dayFormatter.format(day));
        mi.addSelectionListener(selectChangeListener);
        mi.setData("index",i);
        switch(day.getDay()){
            case AjxDateUtil.SUNDAY:
            case AjxDateUtil.SATURDAY: satsun.push(dayFormatter.format(day)); break;

            case AjxDateUtil.MONDAY:
            case AjxDateUtil.WEDNESDAY:
            case AjxDateUtil.FRIDAY: monwedfri.push(dayFormatter.format(day)); break;

            case AjxDateUtil.TUESDAY:
            case AjxDateUtil.THURSDAY: tuethu.push(dayFormatter.format(day)); break;
        }
        day.setDate(day.getDate() + 1);
	}
    //Separator
    new DwtMenuItem({parent:wMenu, style:DwtMenuItem.SEPARATOR_STYLE, radioGroupId:i++});  //Pos 7 is separator
    //Add some custom pattern options too
    //this._weeklySelect.addOption(monwedfri.join(", "), false, i++);
    var mi = new DwtMenuItem({parent:wMenu, radioGroupId:i});
    mi.setText(monwedfri.join(", "));
    mi.addSelectionListener(selectChangeListener);
    mi.setData("index",i++);
    //this._weeklySelect.addOption(tuethu.join(", "), false, i++);
    mi = new DwtMenuItem({parent:wMenu, radioGroupId:i});
    mi.setText(tuethu.join(", "));
    mi.addSelectionListener(selectChangeListener);
    mi.setData("index",i++);
    //Let's correct the sequence
    var satsun1 = [satsun[1],satsun[0]];
    //this._weeklySelect.addOption(satsun1.join(", "), false, i++);
    mi = new DwtMenuItem({parent:wMenu, radioGroupId:i});
    mi.setText(satsun1.join(", "));
    mi.addSelectionListener(selectChangeListener);
    mi.setData("index",i++);
    wMenu.setSelectedItem(new Date().getDay());
    this._weeklySelectButton.setText(wMenu.getItem(new Date().getDay()).getText());
    
    //this._weeklySelect.setv
    this._weeklySelectButton.reparentHtmlElement(this._weeklySelectId);
	delete this._weeklySelectId;

	this._monthlyDaySelect = new DwtSelect({parent:this});
	this._monthlyDaySelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsNumDay);
	var ordinalFormatter = formatter.getFormatsByArgumentIndex()[0];
	var limits = ordinalFormatter.getLimits();
	var formats = ordinalFormatter.getFormats();
	for (var i = 0; i < limits.length; i++) {
		var index = (i + 1) % limits.length;
		var label = formats[index].format();
		var value = Math.floor(limits[index]);
		this._monthlyDaySelect.addOption(label, false, value);
	}
	this._monthlyDaySelect.reparentHtmlElement(this._monthlyDaySelectId);
	delete this._monthlyDaySelectId;

	this._monthlyWeekdaySelect = new DwtSelect({parent:this});
	this._monthlyWeekdaySelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurMonthlyEveryNumMonthsNumDay);
	var dayFormatter = formatter.getFormatsByArgumentIndex()[1];
	var day = new Date();
	day.setDate(day.getDate() - day.getDay());

    this._monthlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleDay, false, ZmRecurrence.RECURRENCE_DAY);
    this._monthlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleWeekend, false, ZmRecurrence.RECURRENCE_WEEKEND);
    this._monthlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleWeekday, false, ZmRecurrence.RECURRENCE_WEEKDAY);

    for (var i = 0; i < 7; i++) {
		this._monthlyWeekdaySelect.addOption(dayFormatter.format(day), false, i);
		day.setDate(day.getDate() + 1);
	}
	this._monthlyWeekdaySelect.reparentHtmlElement(this._monthlyWeekdaySelectId);
	delete this._monthlyWeekdaySelectId;

	this._yearlyMonthSelect = new DwtSelect({parent:this});
	this._yearlyMonthSelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryDate);
	var monthFormatter = formatter.getFormatsByArgumentIndex()[0];
	var month = new Date();
	month.setDate(1);
	for (var i = 0; i < 12; i++) {
		month.setMonth(i);
		this._yearlyMonthSelect.addOption(monthFormatter.format(month), false, i);
	}
	this._yearlyMonthSelect.reparentHtmlElement(this._yearlyMonthSelectId);
	delete this._yearlyMonthSelectId;

	this._yearlyDaySelect = new DwtSelect({parent:this});
	this._yearlyDaySelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthNumDay);
	var ordinalFormatter = formatter.getFormatsByArgumentIndex()[0];
	var limits = ordinalFormatter.getLimits();
	var formats = ordinalFormatter.getFormats();
	for (var i = 0; i < limits.length; i++) {
		var index = (i + 1) % limits.length;
		var label = formats[index].format();
		var value = Math.floor(limits[index]);
		this._yearlyDaySelect.addOption(label, false, value);
	}
	this._yearlyDaySelect.reparentHtmlElement(this._yearlyDaySelectId);
	delete this._yearlyDaySelectId;

	this._yearlyWeekdaySelect = new DwtSelect({parent:this});
	this._yearlyWeekdaySelect.addChangeListener(selectChangeListener);
	var formatter = new AjxMessageFormat(ZmMsg.recurYearlyEveryMonthNumDay);
	var dayFormatter = formatter.getFormatsByArgumentIndex()[1];
	var day = new Date();
	day.setDate(day.getDate() - day.getDay());

    this._yearlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleDay, false, ZmRecurrence.RECURRENCE_DAY);
    this._yearlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleWeekend, false, ZmRecurrence.RECURRENCE_WEEKEND);
    this._yearlyWeekdaySelect.addOption(ZmMsg.recurrenceRuleWeekday, false, ZmRecurrence.RECURRENCE_WEEKDAY);

	for (var i = 0; i < 7; i++) {
		this._yearlyWeekdaySelect.addOption(dayFormatter.format(day), false, i);
		day.setDate(day.getDate() + 1);
	}
	this._yearlyWeekdaySelect.reparentHtmlElement(this._yearlyWeekdaySelectId);
	delete this._yearlyWeekdaySelectId;

	this._yearlyMonthSelectEx = new DwtSelect({parent:this});
	this._yearlyMonthSelectEx.addChangeListener(selectChangeListener);
	for (var i = 0; i < AjxDateUtil.MONTH_LONG.length; i++)
		this._yearlyMonthSelectEx.addOption(AjxDateUtil.MONTH_LONG[i], false, i);
	this._yearlyMonthSelectEx.reparentHtmlElement(this._yearlyMonthSelectExId);
	delete this._yearlyMonthSelectExId;
};

ZmApptRecurDialog.prototype._createInputs = 
function() {
	// create inputs for end fields
	this._endIntervalField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
												initialValue: "1", size: 3, maxLen: 3,
												errorIconStyle: DwtInputField.ERROR_ICON_NONE, 
												validationStyle: DwtInputField.ONEXIT_VALIDATION, 
												validator: this._positiveIntValidator, 
												validatorCtxtObj: this});
	this._endIntervalField.setDisplay(Dwt.DISPLAY_INLINE);
	this._endIntervalField.reparentHtmlElement(this._endIntervalFieldId);
	delete this._endIntervalFieldId;

	this._endByField = new DwtInputField({parent: this, type: DwtInputField.DATE,
										  size: 10, maxLen: 10,
										  errorIconStyle: DwtInputField.ERROR_ICON_NONE,
										  validationStyle: DwtInputField.ONEXIT_VALIDATION,
										  validator: this._endByDateValidator, 
										  validatorCtxtObj: this});
	this._endByField.setDisplay(Dwt.DISPLAY_INLINE);
	this._endByField.reparentHtmlElement(this._endByFieldId);
	Dwt.setSize(this._endByField.getInputElement(), Dwt.DEFAULT, "22");
	delete this._endByFieldId;

	// create inputs for day fields
	this._dailyField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
										  initialValue: "2", size: 3, maxLen: 2,
										  errorIconStyle: DwtInputField.ERROR_ICON_NONE,
										  validationStyle: DwtInputField.ONEXIT_VALIDATION,
										  validator: this._positiveIntValidator,
										  validatorCtxtObj: this});
	this._dailyField.setDisplay(Dwt.DISPLAY_INLINE);
	this._dailyField.reparentHtmlElement(this._dailyFieldId);
	delete this._dailyFieldId;

	// create inputs for week fields
	this._weeklyField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
										   initialValue: "2", size: 2, maxLen: 2,
										   errorIconStyle: DwtInputField.ERROR_ICON_NONE,
										   validationStyle: DwtInputField.ONEXIT_VALIDATION,
										   validator: this._weeklyValidator,
										   validatorCtxtObj: this});
	this._weeklyField.setDisplay(Dwt.DISPLAY_INLINE);
	this._weeklyField.reparentHtmlElement(this._weeklyFieldId);
	delete this._weeklyFieldId;

	// create inputs for month fields
	this._monthlyDayField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
											   initialValue: "1", size: 2, maxLen: 2,
											   errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											   validationStyle: DwtInputField.ONEXIT_VALIDATION,
											   validatorCtxtObj: this});
	this._monthlyDayField.setDisplay(Dwt.DISPLAY_INLINE);
	this._monthlyDayField.reparentHtmlElement(this._monthlyDayFieldId);
	this._monthlyDayField.setValidNumberRange(1, 31);
	delete this._monthlyDayFieldId;

	this._monthlyMonthField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
											   initialValue: "1", size: 2, maxLen: 2,
											   errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											   validationStyle: DwtInputField.ONEXIT_VALIDATION,
											   validator: this._positiveIntValidator,
											   validatorCtxtObj: this});
	this._monthlyMonthField.setDisplay(Dwt.DISPLAY_INLINE);
	this._monthlyMonthField.reparentHtmlElement(this._monthlyMonthFieldId);
	delete this._monthlyMonthFieldId;

	this._monthlyMonthFieldEx = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
												   initialValue: "1", size: 2, maxLen: 2,
												   errorIconStyle: DwtInputField.ERROR_ICON_NONE,
												   validationStyle: DwtInputField.ONEXIT_VALIDATION,
												   validator: this._positiveIntValidator,
												   validatorCtxtObj: this});
	this._monthlyMonthFieldEx.setDisplay(Dwt.DISPLAY_INLINE);
	this._monthlyMonthFieldEx.reparentHtmlElement(this._monthlyMonthFieldExId);
	delete this._monthlyMonthFieldExId;

	// create inputs for year fields
	this._yearlyDayField = new DwtInputField({parent: this, type: DwtInputField.INTEGER,
											  initialValue: "1", size: 2, maxLen: 2,
											  errorIconStyle: DwtInputField.ERROR_ICON_NONE,
											  validationStyle: DwtInputField.ONEXIT_VALIDATION,
											  validator: this._yearlyDayValidator,
											  validatorCtxtObj: this});
	this._yearlyDayField.setDisplay(Dwt.DISPLAY_INLINE);
	this._yearlyDayField.reparentHtmlElement(this._yearlyDayFieldId);
	delete this._yearlyDayFieldId;
};

ZmApptRecurDialog.prototype._cacheFields = 
function() {
	this._noEndDateRadio = document.getElementById(this._noEndDateRadioId);			delete this._noEndDateRadioId;
	this._endByRadio = document.getElementById(this._endByRadioId); 				delete this._endByRadioId;
	this._endAfterRadio = document.getElementById(this._endAfterRadioId); 			delete this._endAfterRadioId;
	this._repeatSectionDiv = document.getElementById(this._repeatSectionId); 		delete this._repeatSectionId;
	this._repeatEndDiv = document.getElementById(this._repeatEndDivId);				delete this._repeatEndDivId;
	this._repeatDailyDiv = document.getElementById(this._repeatDailyId); 			delete this._repeatDailyId;
	this._repeatWeeklyDiv = document.getElementById(this._repeatWeeklyId); 			delete this._repeatWeeklyId;
	this._repeatMonthlyDiv = document.getElementById(this._repeatMonthlyId); 		delete this._repeatMonthlyId;
	this._repeatYearlyDiv = document.getElementById(this._repeatYearlyId); 			delete this._repeatYearlyId;
	this._dailyDefaultRadio = document.getElementById(this._dailyDefaultId); 		delete this._dailyDefaultId;
	this._dailyWeekdayRadio = document.getElementById(this._dailyWeekdayId);		delete this._dailyWeekdayId;
	this._dailyFieldRadio = document.getElementById(this._dailyFieldRadioId); 		delete this._dailyFieldRadioId;
	this._weeklyDefaultRadio = document.getElementById(this._weeklyDefaultId); 		delete this._weeklyDefaultId;
	this._weeklyFieldRadio = document.getElementById(this._weeklyFieldRadioId);		delete this._weeklyFieldRadioId;
	this._weeklyCheckboxes = document.getElementsByName(this._weeklyCheckboxName);
	this._monthlyDefaultRadio = document.getElementById(this._monthlyDefaultId); 	delete this._monthlyDefaultId;
	this._monthlyFieldRadio = document.getElementById(this._monthlyFieldRadioId); 	delete this._monthlyFieldRadioId;
	this._yearlyDefaultRadio = document.getElementById(this._yearlyDefaultId); 		delete this._yearlyDefaultId;
	this._yearlyFieldRadio = document.getElementById(this._yearlyFieldRadioId); 	delete this._yearlyFieldRadioId;
};

ZmApptRecurDialog.prototype._addEventHandlers = 
function() {
	var ardId = AjxCore.assignId(this);

	// add event listeners where necessary
	this._setFocusHandler(this._endIntervalField, ardId);
	this._setFocusHandler(this._endByField, ardId);
	this._setFocusHandler(this._dailyField, ardId);
	this._setFocusHandler(this._weeklyField, ardId);
	this._setFocusHandler(this._monthlyDayField, ardId);
	this._setFocusHandler(this._monthlyMonthField, ardId);
	this._setFocusHandler(this._monthlyMonthFieldEx, ardId);
	this._setFocusHandler(this._yearlyDayField, ardId);

	var cboxCount = this._weeklyCheckboxes.length;
	for (var i = 0; i < cboxCount; i++) {
		var checkbox = this._weeklyCheckboxes[i]; 
		Dwt.setHandler(checkbox, DwtEvent.ONFOCUS, ZmApptRecurDialog._onCheckboxFocus);
		checkbox._recurDialogId = ardId;
	}
};

ZmApptRecurDialog.prototype._createTabGroup = function() {
	var allId		= this._htmlElId;
	var repeatId	= allId+"_repeat";
	var endId		= allId+"_end";
	var controlsId	= allId+"_controls";

	// section tab groups
	this._sectionTabGroups = {};
	for (var i = 0; i < ZmApptRecurDialog.REPEAT_OPTIONS.length; i++) {
		var type = ZmApptRecurDialog.REPEAT_OPTIONS[i].value;
		this._sectionTabGroups[type] = new DwtTabGroup(repeatId+"_"+type);
	}

	// section: daily
	var daily = this._sectionTabGroups[ZmRecurrence.DAILY];
	daily.addMember(this._dailyDefaultRadio); // radio: every day
	daily.addMember(this._dailyWeekdayRadio); // radio: every weekday
	daily.addMember(this._dailyFieldRadio); // radio: every {# days}
	daily.addMember(this._dailyField); // input: # days

	// section: weekly
	var weekly = this._sectionTabGroups[ZmRecurrence.WEEKLY];
	weekly.addMember(this._weeklyDefaultRadio); // radio: every {day}
	weekly.addMember(this._weeklySelectButton); // select: day
	weekly.addMember(this._weeklyFieldRadio); // radio: every {# weeks} on {days}
	var checkboxes = new Array(this._weeklyCheckboxes.length);
	for (var i = 0; i < checkboxes.length; i++) {
		checkboxes[i] = this._weeklyCheckboxes[i];
	}
	this.__addTabMembers(
		weekly, ZmMsg.recurWeeklyEveryNumWeeksDate,
		this._weeklyField, // input: # weeks
		checkboxes // checkboxes: weekdays
	);

	// section: monthly
	var monthly = this._sectionTabGroups[ZmRecurrence.MONTHLY];
	monthly.addMember(this._monthlyDefaultRadio); // radio: day {date} of every {# months}
	this.__addTabMembers(
		monthly, ZmMsg.recurMonthlyEveryNumMonthsDate,
		this._monthlyDayField, // input: date
		this._monthlyMonthField // input: # months
	);
	monthly.addMember(this._monthlyFieldRadio); // radio: {ordinal} {weekday} of every {# months}
	this.__addTabMembers(
		monthly, ZmMsg.recurMonthlyEveryNumMonthsNumDay,
		this._monthlyDaySelect, // select: ordinal
		this._monthlyWeekdaySelect, // select: weekday
		this._monthlyMonthFieldEx // input: # months
	);

	// section: yearly
	var yearly = this._sectionTabGroups[ZmRecurrence.YEARLY];
	yearly.addMember(this._yearlyDefaultRadio); // radio: every year on {month} {date}
	this.__addTabMembers(
		yearly, ZmMsg.recurYearlyEveryDate,
		this._yearlyMonthSelect, // select: month
		this._yearlyDayField // input: date
	);
	yearly.addMember(this._yearlyFieldRadio); // radio: {ordinal} {weekday} of every {month}
	this.__addTabMembers(
		yearly, ZmMsg.recurYearlyEveryMonthNumDay,
		this._yearlyDaySelect, // select: ordinal
		this._yearlyWeekdaySelect, // select: weekday
		this._yearlyMonthSelectEx // select: month
	);

	// misc. tab groups
	this._repeatTabGroup = new DwtTabGroup(repeatId);
	this._endTabGroup = new DwtTabGroup(endId);
	this._endTabGroup.addMember(this._noEndDateRadio); // radio: none
	this._endTabGroup.addMember(this._endAfterRadio); // radio: after {# occurrences}
	this._endTabGroup.addMember(this._endIntervalField); // input: # occurrences
	this._endTabGroup.addMember(this._endByRadio); // radio: end by {date}
	this._endTabGroup.addMember(this._endByField); // input: date
	this._endTabGroup.addMember(); // button: date picker

	this._controlsTabGroup = new DwtTabGroup(controlsId);

	// primary tab group
	this._tabGroup = new DwtTabGroup(allId);
	this._tabGroup.addMember(this._repeatSelect);
	this._tabGroup.addMember(this._controlsTabGroup);
	this._tabGroup.addMember(this.getButton(DwtDialog.OK_BUTTON));
	this._tabGroup.addMember(this.getButton(DwtDialog.CANCEL_BUTTON));
};

ZmApptRecurDialog.prototype.__addTabMembers =
function(tabGroup, pattern, member1 /*, ..., memberN */) {
	var segments = new AjxMessageFormat(pattern).getSegments();
	for (var s = 0; s < segments.length; s++) {
		var segment = segments[s];
		var index = segment instanceof AjxMessageFormat.MessageSegment
				  ? segment.getIndex() : -1;
		if (index != -1) {
			var member = arguments[2 + index];
			if (member instanceof Array) {
				for (var i = 0; i < member.length; i++) {
					tabGroup.addMember(member[i]);
				}
			}
			else {
				tabGroup.addMember(member);
			}
		}
	}
};

ZmApptRecurDialog.prototype._setFocusHandler = 
function(dwtObj, ardId) {
	var inputEl = dwtObj.getInputElement();
	Dwt.setHandler(inputEl, DwtEvent.ONFOCUS, ZmApptRecurDialog._onFocus);
	inputEl._recurDialogId = ardId;
}

ZmApptRecurDialog.prototype._setRepeatSection = 
function(repeatType) {
	var isNone = repeatType == ZmRecurrence.NONE;

	Dwt.setVisible(this._repeatSectionDiv, !isNone);
	Dwt.setVisible(this._repeatEndDiv, !isNone);

	var newSection = null;
	switch (repeatType) {
		case ZmRecurrence.DAILY:	newSection = this._repeatDailyDiv; break;
		case ZmRecurrence.WEEKLY:	newSection = this._repeatWeeklyDiv; break;
		case ZmRecurrence.MONTHLY:	newSection = this._repeatMonthlyDiv; break;
		case ZmRecurrence.YEARLY:	newSection = this._repeatYearlyDiv; break;
	}

	this._controlsTabGroup.removeAllMembers();
	if (newSection) {
		if (this._currentSection) {
			Dwt.setVisible(this._currentSection, false);
		}
		Dwt.setVisible(newSection, true);
		this._currentSection = newSection;

		this._repeatTabGroup.removeAllMembers();
		this._repeatTabGroup.addMember(this._sectionTabGroups[repeatType]);

		this._controlsTabGroup.addMember(this._repeatTabGroup);
		this._controlsTabGroup.addMember(this._endTabGroup);

        this.resizeSelect(repeatType);
	}
};

ZmApptRecurDialog.prototype.resizeSelect =
function(repeatType) {

    if(repeatType = ZmRecurrence.MONTHLY) {
        this._resizeSelect(this._monthlyDaySelect);
        this._resizeSelect(this._monthlyWeekdaySelect);
    }

    if(repeatType = ZmRecurrence.YEARLY) {
        this._resizeSelect(this._yearlyMonthSelect);
        this._resizeSelect(this._yearlyDaySelect);
        this._resizeSelect(this._yearlyWeekdaySelect);
        this._resizeSelect(this._yearlyMonthSelectEx);
    }
};

ZmApptRecurDialog.prototype._resizeSelect =
function(selectObj) {
    if(!selectObj) return;
    selectObj.autoResize();
};


ZmApptRecurDialog.prototype._cleanup =
function() {
	// dont bother cleaning up if user is still mucking around
	if (this._saveState) return;

	// TODO: 
	// - dont cleanup for section that was picked if user clicks OK
	
	// reset end section
	this._noEndDateRadio.checked = true;
	this._endIntervalField.setValue("1");
	// reset daily section
	this._dailyDefaultRadio.checked = true;
	this._dailyField.setValue("2");
	// reset weekly section
	this._weeklyDefaultRadio.checked = true;
	this._weeklyField.setValue("2");
	for (var i = 0; i < this._weeklyCheckboxes.length; i++)
		this._weeklyCheckboxes[i].checked = false;
	// reset monthly section
	this._monthlyDefaultRadio.checked = true;
	this._monthlyMonthField.setValue("1");
	this._monthlyMonthFieldEx.setValue("1");
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

// depending on the repeat type, populates repeat section as necessary
ZmApptRecurDialog.prototype._populateForEdit = 
function(appt) {

    var recur = appt._recurrence;
	if (recur.repeatType == ZmRecurrence.NONE) return;

	if (recur.repeatType == ZmRecurrence.DAILY) {
		var dailyRadioOptions = document.getElementsByName(this._dailyRadioName);
		if (recur.repeatWeekday) {
			dailyRadioOptions[1].checked = true;
		} else if (recur.repeatCustomCount > 1) {
			this._dailyField.setValue(recur.repeatCustomCount);
			dailyRadioOptions[2].checked = true;
		}
	} else if (recur.repeatType == ZmRecurrence.WEEKLY) {
		var weeklyRadioOptions = document.getElementsByName(this._weeklyRadioName);
		if (recur.repeatCustomCount == 1 && recur.repeatWeeklyDays.length == 1) {
			weeklyRadioOptions[0].checked = true;
			for (var j = 0; j < ZmCalItem.SERVER_WEEK_DAYS.length; j++) {
				if (recur.repeatWeeklyDays[0] == ZmCalItem.SERVER_WEEK_DAYS[j]) {
					this._weeklySelectButton._selected = j;
                    this._weeklySelectButton.setDisplayState(DwtControl.SELECTED);

                    var formatter = new AjxMessageFormat(ZmMsg.recurWeeklyEveryWeekday);
                    var dayFormatter = formatter.getFormatsByArgumentIndex()[0];
                    this._weeklySelectButton.setText(dayFormatter.format(this._startDate));

                    break;
				}
			}
		} else {
			weeklyRadioOptions[1].checked = true;
			this._weeklyField.setValue(recur.repeatCustomCount);
			// xxx: minor hack-- uncheck this since we init'd it earlier
			this._weeklyCheckboxes[this._startDate.getDay()].checked = false;
			for (var i = 0; i < recur.repeatWeeklyDays.length; i++) {
				for (var j = 0; j < ZmCalItem.SERVER_WEEK_DAYS.length; j++) {
					if (recur.repeatWeeklyDays[i] == ZmCalItem.SERVER_WEEK_DAYS[j]) {
						this._weeklyCheckboxes[j].checked = true;
						break;
					}
				}
			}
		}
	} else if (recur.repeatType == ZmRecurrence.MONTHLY) {
		var monthlyRadioOptions = document.getElementsByName(this._monthlyRadioName);
		if (recur.repeatCustomType == "S") {
			monthlyRadioOptions[0].checked = true;
			this._monthlyDayField.setValue(recur.repeatMonthlyDayList[0]);
			this._monthlyMonthField.setValue(recur.repeatCustomCount);
		} else {
			monthlyRadioOptions[1].checked = true;
			this._monthlyDaySelect.setSelectedValue(recur.repeatBySetPos);

            if(recur.repeatCustomDays) {
                var monthlyDay = this.getRecurrenceWeekDaySelection(recur.repeatCustomDays);
                this._monthlyWeekdaySelect.setSelectedValue(monthlyDay);
            }
			this._monthlyMonthFieldEx.setValue(recur.repeatCustomCount);
		}
	} else if (recur.repeatType == ZmRecurrence.YEARLY) {
		var yearlyRadioOptions = document.getElementsByName(this._yearlyRadioName);
		if (recur.repeatCustomType == "S") {
			yearlyRadioOptions[0].checked = true;
			this._yearlyDayField.setValue(recur.repeatCustomMonthDay);
			this._yearlyMonthSelect.setSelectedValue(Number(recur.repeatYearlyMonthsList)-1);
		} else {
			yearlyRadioOptions[1].checked = true;
			this._yearlyDaySelect.setSelectedValue(recur.repeatBySetPos);

            if(recur.repeatCustomDays) {
                var weekDayVal = this.getRecurrenceWeekDaySelection(recur.repeatCustomDays);
                this._yearlyWeekdaySelect.setSelectedValue(weekDayVal);
            }
			this._yearlyMonthSelectEx.setSelectedValue(Number(recur.repeatYearlyMonthsList)-1);
		}
	}

	// populate recurrence ending rules
	if (recur.repeatEndType != "N") {
		var endRadioOptions = document.getElementsByName(this._repeatEndName);
		if (recur.repeatEndType == "A") {
			endRadioOptions[1].checked = true;
			this._endIntervalField.setValue(recur.repeatEndCount);
		} else {
			endRadioOptions[2].checked = true;
			this._endByField.setValue(AjxDateUtil.simpleComputeDateStr(recur.repeatEndDate));
		}
	}
};

/**
 * Gets the week day selection.
 * 
 * @param	{String}	repeatCustomDays		the repeat custom days
 * 
 * @return	{constant}	the week day selection (see <code>ZmRecurrence.RECURRENCE_</code> constants
 * @see	ZmRecurrence
 */
ZmApptRecurDialog.prototype.getRecurrenceWeekDaySelection =
function(repeatCustomDays) {

    if(repeatCustomDays instanceof Array) {
        repeatCustomDays = repeatCustomDays.join(",");
    }

    if(repeatCustomDays == ZmCalItem.SERVER_WEEK_DAYS.join(",")) {
        return ZmRecurrence.RECURRENCE_DAY;
    }

    var weekDays = ZmCalItem.SERVER_WEEK_DAYS.slice(1,6);
    if(repeatCustomDays == weekDays.join(",")) {
        return ZmRecurrence.RECURRENCE_WEEKDAY;
    }

    var weekEndDays = [ZmCalItem.SERVER_WEEK_DAYS[0], ZmCalItem.SERVER_WEEK_DAYS[6]];
    if(repeatCustomDays == weekEndDays.join(",")) {
        return ZmRecurrence.RECURRENCE_WEEKEND;
    }


    for (var i = 0; i < ZmCalItem.SERVER_WEEK_DAYS.length; i++) {
        if (ZmCalItem.SERVER_WEEK_DAYS[i] == repeatCustomDays) {
            return i;
            break;
        }
    }

};

ZmApptRecurDialog.prototype.getWeekdaySelectValue =
function(weekdaySelect) {

    var day = weekdaySelect.getValue();

    if(ZmCalItem.SERVER_WEEK_DAYS[day]) {
        return [ZmCalItem.SERVER_WEEK_DAYS[day]];        
    }

    if(day == ZmRecurrence.RECURRENCE_DAY) {
        return ZmCalItem.SERVER_WEEK_DAYS;
    }else if(day == ZmRecurrence.RECURRENCE_WEEKDAY) {
        return ZmCalItem.SERVER_WEEK_DAYS.slice(1,6);
    }else if(day == ZmRecurrence.RECURRENCE_WEEKEND) {
        return [ZmCalItem.SERVER_WEEK_DAYS[0], ZmCalItem.SERVER_WEEK_DAYS[6]];
    }

};

ZmApptRecurDialog.prototype.getFirstWeekDayOffset =
function(weekDaySelect) {
    var weekDayVal = weekDaySelect.getValue();
    var dayVal = 0;
    if(ZmCalItem.SERVER_WEEK_DAYS[weekDayVal]) {
       dayVal = weekDayVal;
    }else if(weekDayVal == ZmRecurrence.RECURRENCE_DAY || weekDayVal == ZmRecurrence.RECURRENCE_WEEKEND) {
        //if the selection is just the day or weekend than first day (Sunday) is selected
        dayVal = 0;
    }else if(weekDayVal == ZmRecurrence.RECURRENCE_WEEKDAY) {
        dayVal = 1;
    }
    return dayVal;
};

ZmApptRecurDialog.prototype.getPossibleStartDate =
function(weekDayVal, lastDate, repeatBySetPos) {

    //weekday select might contain normal weekdays, day, weekend values also
    if(ZmCalItem.SERVER_WEEK_DAYS[weekDayVal]) {
        return AjxDateUtil.getDateForThisDay(lastDate, weekDayVal, repeatBySetPos); //Last day of next month/year
    }else if(weekDayVal == ZmRecurrence.RECURRENCE_DAY) {
        var dayOffset = ((repeatBySetPos==-1)? 0 : (repeatBySetPos-1));
        lastDate.setDate(lastDate.getDate() + dayOffset);
        return lastDate;
    }else if(weekDayVal == ZmRecurrence.RECURRENCE_WEEKDAY) {
        return AjxDateUtil.getDateForThisWorkWeekDay(lastDate, repeatBySetPos);
    }else if(weekDayVal == ZmRecurrence.RECURRENCE_WEEKEND) {
        var lastSunday = AjxDateUtil.getDateForThisDay(lastDate, AjxDateUtil.SUNDAY, repeatBySetPos);
        var lastSaturday = AjxDateUtil.getDateForThisDay(lastDate, AjxDateUtil.SATURDAY, repeatBySetPos);
        //nearest possible weekend
        if(repeatBySetPos < 0) {
            return (lastSaturday.getTime() > lastSunday.getTime()) ? lastSaturday : lastSunday;
        }else {
            return (lastSaturday.getTime() > lastSunday.getTime()) ? lastSunday : lastSaturday;                        
        }
    }
}
// Listeners

ZmApptRecurDialog.prototype._repeatChangeListener =
function(ev) {
	var newValue = ev._args.newValue;
	this._setRepeatSection(newValue);
};

ZmApptRecurDialog.prototype._selectChangeListener = 
function(ev) {
    if(ev.item && ev.item instanceof DwtMenuItem){
       this._weeklyDefaultRadio.checked = true;
       this._weeklySelectButton.setText(ev.item.getText());
       this._weeklySelectButton._selected = ev.item.getData("index");
       this._weeklySelectButton.setDisplayState(DwtControl.SELECTED);
       return;
    }
    switch (ev._args.selectObj) {
		case this._weeklySelectButton:			this._weeklyDefaultRadio.checked = true; break;
		case this._monthlyDaySelect:
		case this._monthlyWeekdaySelect:	this._monthlyFieldRadio.checked = true; break;
		case this._yearlyMonthSelect:
			this._yearlyDefaultRadio.checked = true;
			this._yearlyDayField.validate();
			break;
		case this._yearlyDaySelect:
		case this._yearlyWeekdaySelect:
		case this._yearlyMonthSelectEx: 	this._yearlyFieldRadio.checked = true; break;
	}
};

ZmApptRecurDialog.prototype._endByButtonListener = 
function(ev) {
	var menu = ev.item.getMenu();
	var cal = menu.getItem(0);
	var initDate = this._endByField.isValid()
		? new Date(AjxDateUtil.simpleParseDateStr(this._endByField.getValue()))
		: new Date();
	cal.setDate(initDate, true);
	ev.item.popup();
};

ZmApptRecurDialog.prototype._dateCalSelectionListener = 
function(ev) {
	this._endByField.setValue(AjxDateUtil.simpleComputeDateStr(ev.detail));
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


// Callbacks

ZmApptRecurDialog.prototype._positiveIntValidator =
function(value) {
	DwtInputField.validateInteger(value);
	if (parseInt(value) < 1) {
		throw ZmMsg.errorLessThanOne;
	}
	return value;
};

ZmApptRecurDialog.prototype._yearlyDayValidator =
function(value) {
	DwtInputField.validateInteger(value);
	var dpm = AjxDateUtil._daysPerMonth[this._yearlyMonthSelect.getValue()];
	if (value < 1)
		throw AjxMessageFormat.format(AjxMsg.numberLessThanMin, 1);
	if (value > dpm) {
		throw AjxMessageFormat.format(AjxMsg.numberMoreThanMax, dpm);
	}
	return value;
};

ZmApptRecurDialog.prototype._endByDateValidator =
function(value) {
	DwtInputField.validateDate(value);
	var endByDate = AjxDateUtil.simpleParseDateStr(value);
	if (endByDate == null || endByDate.valueOf() < this._startDate.valueOf()) {
		throw ZmMsg.errorEndByDate;
	}
	return value;
};

ZmApptRecurDialog.prototype._weeklyValidator =
function(value) {
	value = this._positiveIntValidator(value);
	// make sure at least one day of the week is selected
	var checked = false;
	for (var i=0; i<this._weeklyCheckboxes.length; i++) {
		if (this._weeklyCheckboxes[i].checked) {
			checked = true;
			break;
		}
	}
	if (!checked) {
		throw ZmMsg.errorNoWeekdayChecked;
	}
	return value;
};


// Static methods

ZmApptRecurDialog._onCheckboxFocus = function(ev) {
	var el = DwtUiEvent.getTarget(ev);
	var ard = AjxCore.objectWithId(el._recurDialogId);
	ard._weeklyFieldRadio.checked = true;
};

ZmApptRecurDialog._onFocus =
function(ev) {
	ev || (ev = window.event);

	var el = DwtUiEvent.getTarget(ev);
	var ard = AjxCore.objectWithId(el._recurDialogId);
	var dwtObj = DwtControl.findControl(el);

	switch (dwtObj) {
		case ard._endIntervalField: 	ard._endAfterRadio.checked = true; break;
		case ard._endByField: 			ard._endByRadio.checked = true; break;
		case ard._dailyField: 			ard._dailyFieldRadio.checked = true; break;
		case ard._weeklyField: 			ard._weeklyFieldRadio.checked = true; break;
		case ard._monthlyMonthField:
		case ard._monthlyDayField: 		ard._monthlyDefaultRadio.checked = true; break;
		case ard._monthlyMonthFieldEx: 	ard._monthlyFieldRadio.checked = true; break;
		case ard._yearlyDayField: 		ard._yearlyDefaultRadio.checked = true; break;
	}

	appCtxt.getKeyboardMgr().grabFocus(dwtObj);
};
