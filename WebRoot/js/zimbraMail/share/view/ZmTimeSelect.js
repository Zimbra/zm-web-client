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
* Creates up to three separate DwtSelects for the time (hour, minute, am|pm)
* Showing the AM|PM select widget is dependent on the user's locale
* 
* @author Parag Shah
*
* @param parent		[DwtComposite]	the parent widget
* @param id			[string]*		an ID that is propagated to component select objects
 *
 * @private
*/
ZmTimeSelect = function(parent, id) {
	DwtComposite.call(this, {parent:parent});

	this.id = id;
	this._isLocale24Hour = true;
	this._createSelects();
};

// IDs for types of time selects
ZmTimeSelect.START	= 1;
ZmTimeSelect.END	= 2;

// IDs for time select components
ZmTimeSelect.HOUR	= 1;
ZmTimeSelect.MINUTE	= 2;
ZmTimeSelect.AMPM	= 3;

ZmTimeSelect.getDateFromFields =
function(hours, minutes, ampm, date) {
	hours = Number(hours);
	if (ampm) {
		if (ampm == "AM" || ampm === 0) {
			hours = (hours == 12) ? 0 : hours;
		} else if (ampm == "PM" || ampm == 1) {
			hours = (hours < 12) ? hours + 12 : hours;
		}
	}
	date = date ? date : new Date();
	date.setHours(hours, Number(minutes), 0, 0);
	return date;
};

ZmTimeSelect.parse =
function(timeString) {
    var date;
	var lTimeString = timeString.toLowerCase();
	if (lTimeString === ZmMsg.midnight.toLowerCase() || lTimeString === ZmMsg.noon.toLowerCase()) {
		date = new Date();
		date.setMinutes(0);
		date.setSeconds(0);
			date.setHours(lTimeString === ZmMsg.noon.toLowerCase() ? 12 : 0);
	} else {
		var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);    
		date = timeFormatter.parse(timeString);
	}
    return date;
};

ZmTimeSelect.format =
function(date) {
	if (date.getHours() == 0 && date.getMinutes() == 0) {
		return ZmMsg.midnight;
	} else if (date.getHours() == 12 && date.getMinutes() == 0) {
		return ZmMsg.noon;
	} else {
		return AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT).format(date);
	}
};

/**
* Adjust an appt's start or end based on changes to the other one. If the user changes
* the start time, change the end time so that the appt duration is maintained. If the
* user changes the end time, we leave things alone.
*
* @param ev					[Event]				UI event from a DwtSelect
* @param startSelect		[ZmTimeSelect]		start time select
* @param endSelect			[ZmTimeSelect]		end time select
* @param startDateField		[element]			start date field
* @param endDateField		[element]			end date field
*/
ZmTimeSelect.adjustStartEnd =
function(ev, startSelect, endSelect, startDateField, endDateField) {
	var select = ev._args.selectObj;
	var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);
	var startDateOrig = startDateField.value;
	var endDateOrig = endDateField.value;
	if (select.id == ZmTimeSelect.START) {
		var hours = (select.compId == ZmTimeSelect.HOUR) ? ev._args.oldValue : startSelect.getHours();
		var minutes = (select.compId == ZmTimeSelect.MINUTE) ? ev._args.oldValue : startSelect.getMinutes();
		var ampm = (select.compId == ZmTimeSelect.AMPM) ? ev._args.oldValue : startSelect.getAmPm();
		var oldStartDateMs = ZmTimeSelect.getDateFromFields(hours, minutes, ampm, startDate).getTime();
		var newStartDateMs = ZmTimeSelect.getDateFromFields(startSelect.getHours(), startSelect.getMinutes(), startSelect.getAmPm(), startDate).getTime();
		var oldEndDateMs = ZmTimeSelect.getDateFromFields(endSelect.getHours(), endSelect.getMinutes(), endSelect.getAmPm(), endDate).getTime();
		var delta = oldEndDateMs - oldStartDateMs;
		if (!delta) return null;
		var newEndDateMs = newStartDateMs + delta;
		var newEndDate = new Date(newEndDateMs);
		endSelect.set(newEndDate);
		endDateField.value = AjxDateUtil.simpleComputeDateStr(newEndDate);
		if (endDateField.value != endDateOrig) {
			return endDateField;
		}
	} else {
		return null;
	}
};

/**
 * Returns true if the start date/time is before the end date/time.
 *
 * @param ss				[ZmTimeSelect]		start time select
 * @param es				[ZmTimeSelect]		end time select
 * @param startDateField	[element]			start date field
 * @param endDateField		[element]			end date field
 */
ZmTimeSelect.validStartEnd =
function(startDateField, endDateField, ss, es) {
	var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);

    if (startDate && endDate) {
        if((startDate.valueOf() > endDate.valueOf())){
            return false;
        }
        // bug fix #11329 - dont allow year to be more than the earth will be around :]
		if (startDate.getFullYear() > 9999 || endDate.getFullYear() > 9999) {
			return false;
		}
        if(ss && es){
            var startDateMs = ZmTimeSelect.getDateFromFields(ss.getHours(), ss.getMinutes(), ss.getAmPm(), startDate).getTime();
            var endDateMs = ZmTimeSelect.getDateFromFields(es.getHours(), es.getMinutes(), es.getAmPm(), endDate).getTime();
            if (startDateMs > endDateMs) {
                return false;
            }
        }
    } else {
		return false;
	}
	return true;
};

ZmTimeSelect.prototype = new DwtComposite;
ZmTimeSelect.prototype.constructor = ZmTimeSelect;

/**
* Sets the time select according to the given date.
*
* @param date	[Date]		a Date object
*/
ZmTimeSelect.prototype.set = 
function(date) {

	var hourIdx = 0, minuteIdx = 0, amPmIdx = 0;
	var isLocale24Hour = this.isLocale24Hour();

	var hours = date.getHours();
	if (!isLocale24Hour && hours > 12) {
		hourIdx = hours - 13;
	} else if (!isLocale24Hour && hours == 0) {
		hourIdx = this.getHourSelectSize() - 1;
	} else {
		hourIdx = isLocale24Hour ? hours : hours - 1;
	}

	minuteIdx = Math.floor(date.getMinutes() / 5);

	if (!isLocale24Hour) {
		amPmIdx = (date.getHours() >= 12) ? 1 : 0;
	}

	this.setSelected(hourIdx, minuteIdx, amPmIdx);
};


/**
 * Returns a date object with the hours and minutes set based on
 * the values of this time select.
 *
 * @param date [Date] Optional. If specified, the hour and minute
 *                    values will be set on the specified object;
 *                    else, a new <code>Date</code> object is created.
 */
ZmTimeSelect.prototype.getValue =
function(date) {
	return (ZmTimeSelect.getDateFromFields(this.getHours(), this.getMinutes(), this.getAmPm(), date));
};

ZmTimeSelect.prototype.getHours =
function() {
	return this._hourSelect.getValue();
};

ZmTimeSelect.prototype.getMinutes =
function() {
	return this._minuteSelect.getValue();
};

ZmTimeSelect.prototype.getAmPm =
function() {
	return this._amPmSelect ? this._amPmSelect.getValue() : null;
};

ZmTimeSelect.prototype.setSelected = 
function(hourIdx, minuteIdx, amPmIdx) {
	this._hourSelect.setSelected(hourIdx);
	this._minuteSelect.setSelected(minuteIdx);
	if (!this._isLocale24Hour) {
		this._amPmSelect.setSelected(amPmIdx);
	}
};

ZmTimeSelect.prototype.addChangeListener = 
function(listener) {
	this._hourSelect.addChangeListener(listener);
	this._minuteSelect.addChangeListener(listener);
	if (this._amPmSelect)
		this._amPmSelect.addChangeListener(listener);
};

ZmTimeSelect.prototype.isLocale24Hour = 
function() {
	return this._isLocale24Hour;
};

ZmTimeSelect.prototype.getHourSelectSize = 
function() {	
	return this._hourSelect.size();
};

ZmTimeSelect.prototype.getMinuteSelectSize = 
function() {	
	return this._minuteSelect.size();
};

ZmTimeSelect.prototype.getSelectedHourIdx = 
function() {
	return this._hourSelect.getSelectedIndex();
};

ZmTimeSelect.prototype.getSelectedMinuteIdx = 
function() {
	return this._minuteSelect.getSelectedIndex();
};

ZmTimeSelect.prototype.getSelectedAmPmIdx = 
function() {
	return this._amPmSelect ? this._amPmSelect.getSelectedIndex() : 0;
};

ZmTimeSelect.prototype.setEnabled =
function(enabled) {
   DwtComposite.prototype.setEnabled.call(this, enabled);

   this._hourSelect.setEnabled(enabled);
   this._minuteSelect.setEnabled(enabled);
   if (this._amPmSelect) this._amPmSelect.setEnabled(enabled);
};

ZmTimeSelect.prototype._createSelects =
function() {
	this._hourSelectId = Dwt.getNextId();
	this._minuteSelectId = Dwt.getNextId();
	this._amPmSelectId = Dwt.getNextId();

	// get the time formatter for the user's locale
	var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	var hourSegmentIdx = 0;
	var minuteSegmentIdx = 0;

	var html = [];
	var i = 0;

	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";

	// walk time formatter's segments array to render each segment part in the right order
	for (var j = 0; j < timeFormatter._segments.length; j++) {
		var segmentStr = timeFormatter._segments[j]._s;

		if (timeFormatter._segments[j] instanceof AjxFormat.TextSegment) {
			var trimStr = AjxStringUtil.trim(segmentStr);
			if (trimStr.length) {
				html[i++] = "<td class='TextPadding ZmFieldLabel'>"
				html[i++] = segmentStr;
				html[i++] = "</td>";
			}
		} else if (segmentStr.charAt(0) == "h" || segmentStr.charAt(0) == "H") {
			hourSegmentIdx = j;
			html[i++] = "<td width=42 id='"
			html[i++] = this._hourSelectId;
			html[i++] = "'></td>";
		} else if (segmentStr.charAt(0) == "m") {
			minuteSegmentIdx = j;
			html[i++] = "<td width=42 id='"
			html[i++] = this._minuteSelectId;
			html[i++] = "'></td>";
		} else if (segmentStr == "a") {	
			this._isLocale24Hour = false;
			html[i++] = "<td width=42 id='"
			html[i++] = this._amPmSelectId;
			html[i++] = "'></td>";
		}
	}
	
	html[i++] = "</tr></table>";

	// append html template to DOM
	this.getHtmlElement().innerHTML = html.join("");

	// init vars for adding hour DwtSelect
	var now = new Date();
	var start = this._isLocale24Hour ? 0 : 1;
	var limit = this._isLocale24Hour ? 24 : 13;

	// create new DwtSelect for hour slot
	this._hourSelect = new DwtSelect({parent:this});
	this._hourSelect.id = this.id;
	this._hourSelect.compId = ZmTimeSelect.HOUR;
	for (var i = start; i < limit; i++) {
		now.setHours(i);
		var label = timeFormatter._segments[hourSegmentIdx].format(now);
		this._hourSelect.addOption(label, false, i);
	}
	this._hourSelect.reparentHtmlElement(this._hourSelectId);
	delete this._hourSelectId;

	// create new DwtSelect for minute slot
	this._minuteSelect = new DwtSelect({parent:this});
	this._minuteSelect.id = this.id;
	this._minuteSelect.compId = ZmTimeSelect.MINUTE;
	for (var i = 0; i < 60; i = i + 5) {
		now.setMinutes(i);
		var label = timeFormatter._segments[minuteSegmentIdx].format(now);
		this._minuteSelect.addOption(label, false, i);
	}
	this._minuteSelect.reparentHtmlElement(this._minuteSelectId);
	delete this._minuteSelectId;

	// if locale is 12-hour time, add AM|PM DwtSelect
	if (!this._isLocale24Hour) {
		this._amPmSelect = new DwtSelect({parent:this});
		this._amPmSelect.id = this.id;
		this._amPmSelect.compId = ZmTimeSelect.AMPM;
		this._amPmSelect.addOption(I18nMsg["periodAm"], false, "AM");
		this._amPmSelect.addOption(I18nMsg["periodPm"], false, "PM");
		this._amPmSelect.reparentHtmlElement(this._amPmSelectId);
		delete this._amPmSelectId;
	}
};

/**
* Creates up to three separate DwtSelects for the time (hour, minute, am|pm)
* Showing the AM|PM select widget is dependent on the user's locale
*
* @author Parag Shah
*
* @param parent		[DwtComposite]	the parent widget
* @param id			[string]*		an ID that is propagated to component select objects
 *
 * @private
*/
ZmTimeInput = function(parent, id, parentElement) {
    var params = {parent:parent};
    if(parentElement) {
        params.parentElement = parentElement;
    }
	DwtComposite.call(this, params);

	this.id = id;
	this._isLocale24Hour = true;
	this._createSelects();
    this._useTextInput = true;
};

// IDs for types of time selects
ZmTimeInput.START	= 1;
ZmTimeInput.END	= 2;

// IDs for time select components
ZmTimeInput.HOUR	= 1;
ZmTimeInput.MINUTE	= 2;
ZmTimeInput.AMPM	= 3;

ZmTimeInput.getDateFromFields =
function(timeStr, date) {
    var formattedDate = ZmTimeSelect.parse(timeStr);
    date = date || new Date();
    date.setHours(formattedDate.getHours(), formattedDate.getMinutes(), 0, 0);
    return date;
};

/**
* Adjust an appt's start or end based on changes to the other one. If the user changes
* the start time, change the end time so that the appt duration is maintained. If the
* user changes the end time, we leave things alone.
*
* @param ev					[Event]				UI event from a DwtSelect
* @param startSelect		[ZmTimeInput]		start time select
* @param endSelect			[ZmTimeInput]		end time select
* @param startDateField		[element]			start date field
* @param endDateField		[element]			end date field
* @param dateInfo		    [object]			date info used to calculate the old time before changing this
* @param id		            [string]			an ID which got changed 
*/
ZmTimeInput.adjustStartEnd =
function(ev, startSelect, endSelect, startDateField, endDateField, dateInfo, id) {
    var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
    var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);
    var startDateOrig = startDateField.value;
    var endDateOrig = endDateField.value;
    if (id == ZmTimeInput.START) {
        var timeStr = dateInfo ? dateInfo.startTimeStr : startSelect.getTimeString();
        var oldStartDateMs = ZmTimeInput.getDateFromFields(timeStr, startDate).getTime();
        var newStartDateMs = ZmTimeInput.getDateFromFields(startSelect.getTimeString(), startDate).getTime();
        var oldEndDateMs = ZmTimeInput.getDateFromFields(endSelect.getTimeString(), endDate).getTime();

        var delta = oldEndDateMs - oldStartDateMs;
        if (!delta) return null;

        var newEndDateMs = newStartDateMs + delta;
        var newEndDate = new Date(newEndDateMs);

        startSelect.set(new Date(newStartDateMs));
        endSelect.set(newEndDate);
        endDateField.value = AjxDateUtil.simpleComputeDateStr(newEndDate);

        if (endDateField.value != endDateOrig) {
            return endDateField;
        }
    } else {
        return null;
    }
};

/**
 * Returns true if the start date/time is before the end date/time.
 *
 * @param ss				[ZmTimeInput]		start time select
 * @param es				[ZmTimeInput]		end time select
 * @param startDateField	[element]			start date field
 * @param endDateField		[element]			end date field
 */
ZmTimeInput.validStartEnd =
function(startDateField, endDateField, ss, es) {
	var startDate = AjxDateUtil.simpleParseDateStr(startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(endDateField.value);

	if (startDate && endDate) {
		if((startDate.valueOf() > endDate.valueOf())) {
			return false;
		}
		// bug fix #11329 - dont allow year to be more than the earth will be around :]
		if (startDate.getFullYear() > 9999 || endDate.getFullYear() > 9999) {
			return false;
		}
		if (ss && es) {
			var startTime = ss.getTimeString();
			var endTime = es.getTimeString();
			if (startTime && endTime) {
				var startDateMs = ZmTimeInput.getDateFromFields(startTime, startDate).getTime();
				var endDateMs = ZmTimeInput.getDateFromFields(endTime, endDate).getTime();
				if (startDateMs > endDateMs) {
					return false;
				}
			}
		}
	} else {
		return false;
	}
	return true;
};

ZmTimeInput.prototype = new DwtComposite;
ZmTimeInput.prototype.constructor = ZmTimeInput;

/**
* Sets the time select according to the given date.
*
* @param date	[Date]		a Date object
*/
ZmTimeInput.prototype.set =
function(date) {
    var timeStr = ZmTimeSelect.format(date);
    this._originalTimeStr = timeStr;
    this._timeSelectInput.setValue(timeStr);
    this._scrollToValue(timeStr);
};

/**
* Sets the time string after validating it
*
* @param date	[Date]		a Date object
*/
ZmTimeInput.prototype.setValue =
function(str) {
    //sets only if the date is valid
    var date = ZmTimeSelect.parse(str);
    if (!date) str = "";
    this._originalTimeStr = str;
    this._timeSelectInput.setValue(str);
    this._scrollToValue(str);
};

ZmTimeInput.prototype._scrollToValue =
function(str) {
    var index = this.getTimeIndex(str);
    if (index !== null)
        this._hoursSelectMenu.scrollToIndex(index);
};

/**
 * Returns a date object with the hours and minutes set based on
 * the values of this time picker.
 *
 * @param date [Date] Optional. If specified, the hour and minute
 *                    values will be set on the specified object;
 *                    else, a new <code>Date</code> object is created.
 */
ZmTimeInput.prototype.getValue =
function(date) {
	//return (ZmTimeInput.getDateFromFields(this.getHours(), this.getMinutes(), this.getAmPm(), date));
    var d = ZmTimeSelect.parse(this._timeSelectInput.getValue());
    date = date || new Date();
    //daylight saving time
    if(AjxDateUtil.isDayShifted(date)) {
        AjxDateUtil.rollToNextDay(date);
    }
    date.setHours(d.getHours(), d.getMinutes(), 0, 0);
    return date;
};

ZmTimeInput.prototype.getHours =
function() {
    var d = this.getValue();
    return d ? d.getHours() : null;
};

ZmTimeInput.prototype.getMinutes =
function() {
    var d = this.getValue();
    return d ? d.getMinutes() : null;
};

ZmTimeInput.prototype.addChangeListener =
function(listener) {
    this._changeListener = listener;
    var callback = AjxCallback.simpleClosure(this.handleTimeChange, this, listener);
    this._timeSelectInput.setHandler(DwtEvent.ONFOCUS, callback);
    this._timeSelectInput.setHandler(DwtEvent.ONBLUR, callback);
};

ZmTimeInput.prototype.handleTimeChange =
function(listener, ev) {
    //restore old value if the new time is not in correct format
    var str = this._timeSelectInput.getValue();
    var d = ZmTimeSelect.parse(str);
    if(!d) {
        var newDate = this.correctTimeString(str, ZmTimeSelect.parse(this._originalTimeStr));
        this.setValue(ZmTimeSelect.format(newDate) || "");
    } else {
        this._scrollToValue(str);
    }

    listener.run(ev, this.id);
};

ZmTimeInput.prototype.correctTimeString =
function(val, originalDate) {

    var segments = val.split(":");

    if(!segments) return originalDate;

    var hrs = (segments.length && segments[0] != null) ? parseInt(segments[0].replace(/\D/g, "")) : null;
    var mins = (segments.length > 1 && segments[1]!= null) ? parseInt(segments[1].replace(/\D/g, "")) : 0;

    if(!hrs) hrs = (hrs == 0) ? 0 : originalDate.getHours();
    if(!mins) mins = 0;

    originalDate.setHours(hrs, mins, 0, 0);

    return originalDate;

};

ZmTimeInput.prototype.isLocale24Hour =
function() {
	return this._isLocale24Hour;
};

ZmTimeInput.prototype.setEnabled =
function(enabled) {
   DwtComposite.prototype.setEnabled.call(this, enabled);
   this._timeSelectInput.setEnabled(enabled);
   this._timeSelectBtn.setEnabled(enabled);
};


ZmTimeInput.prototype._timeButtonListener =
function(ev) {
    if(!this._menuItemsAdded) {
        var j,
            k,
            mi,
            smi,
            text,
            minutesSelectMenu,
            now = new Date(),
            timeSelectButton = this._timeSelectBtn,
            timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT),
            menuSelectionListener = new AjxListener(this, this._timeSelectionListener);

        for (j = 0; j < 24; j++) {
            now.setHours(j);
            now.setMinutes(0);

            mi = new DwtMenuItem({parent: this._hoursSelectMenu, style: DwtMenuItem.NO_STYLE});
            text = timeFormatter.format(now); // Regular formatter, returns the I18nMsg formatted time
            this.putTimeIndex(text, j);

            if (j==0 || j==12) {
                text = ZmTimeSelect.format(now); // Specialized formatter, returns ZmMsg.midnight for midnight and ZmMsg.noon for noon
                this.putTimeIndex(text, j); // Both should go in the indexer
            }

            mi.setText(text);
            mi.setData("value", j*60);
            if (menuSelectionListener) mi.addSelectionListener(menuSelectionListener);

            minutesSelectMenu = new DwtMenu({parent:mi, style:DwtMenu.DROPDOWN_STYLE, layout:DwtMenu.LAYOUT_CASCADE, maxRows:1, congruent: true});
            mi.setMenu(minutesSelectMenu, true);
            mi.setSelectableWithSubmenu(true);
            for (k = 1; k < 4; k++) {
                now.setMinutes(k*15);
                smi = new DwtMenuItem({parent: minutesSelectMenu, style: DwtMenuItem.NO_STYLE});
                smi.setText(timeFormatter.format(now));
                smi.setData("value", j*60 + k*15);
                if (menuSelectionListener) smi.addSelectionListener(menuSelectionListener);
            }
        }
        this._hoursSelectMenu.setWidth(timeSelectButton.getW() + this._timeSelectInput.getW());
        this._scrollToValue(timeFormatter.format(this.getValue()));
        this._menuItemsAdded = true;
    }
	ev.item.popup();
};

ZmTimeInput.prototype._timeSelectionListener =
function(ev) {
    if(ev.item && ev.item instanceof DwtMenuItem){
       this._timeSelectInput.setValue(ev.item.getText());
       this._timeSelectValue = ev.item.getData("value");
       if(this._changeListener) this._changeListener.run(ev, this.id);
       return;
    }
};

ZmTimeInput.prototype.getTimeString =
function() {
    //validate and returns only valid time string
    var date = ZmTimeSelect.parse(this._timeSelectInput.getValue());
    return date ? this._timeSelectInput.getValue() : "";    
};

ZmTimeInput.prototype.getInputField =
function() {
    return this._timeSelectInput;
};

ZmTimeInput.prototype.putTimeIndex =
function(text, value) {
    this._timeIndex[text.replace(/\:\d\d/, ":00").replace(/\s/,"").toLowerCase()] = value;
};

ZmTimeInput.prototype.getTimeIndex =
function(text) {
    if (!text) return null;
    var index = this._timeIndex[text.replace(/\:\d\d/, ":00").replace(/\s/,"").toLowerCase()];
    return (index || index===0) ? index : null;
};

ZmTimeInput.prototype._createSelects =
function() {
	// get the time formatter for the user's locale

	this.getHtmlElement().innerHTML = AjxTemplate.expand("calendar.Appointment#ApptTimeInput", {id: this._htmlElId});

    //create time select input field
    var params = {
        parent: this,
        parentElement: (this._htmlElId + "_timeSelectInput"),
        type: DwtInputField.STRING,
        errorIconStyle: DwtInputField.ERROR_ICON_NONE,
        validationStyle: DwtInputField.CONTINUAL_VALIDATION
    };

    this._timeSelectInput = new DwtInputField(params);
    var timeInputEl = this._timeSelectInput.getInputElement();
    Dwt.setSize(timeInputEl, "80px", "22px");
    timeInputEl.typeId = this.id;
    //listeners
    var buttonListener = new AjxListener(this, this._timeButtonListener);
    var buttonId = this._htmlElId + "_timeSelectBtn";

    //create time select drop down button
    var timeSelectButton = this._timeSelectBtn = new DwtButton({parent:this});
    timeSelectButton.addDropDownSelectionListener(buttonListener);
    timeSelectButton.setData(Dwt.KEY_ID, buttonId);
    if (AjxEnv.isIE) {
        timeSelectButton.setSize("20");
    }
    this._timeIndex = {};
    // create menu for button
    this._hoursSelectMenu = new DwtMenu({parent:timeSelectButton, style:DwtMenu.DROPDOWN_STYLE, layout:DwtMenu.LAYOUT_SCROLL, maxRows:7});
    timeSelectButton.setMenu(this._hoursSelectMenu, true, false, false, true);
    this._menuItemsAdded = false;
    timeSelectButton.reparentHtmlElement(buttonId);
};
