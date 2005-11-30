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
* Static class used by ZmApptQuickAddDialog, ZmApptTabViewPage, ZmApptRecurDialog,
* ZmSchedTabViewPage, and possibly others that have shared code.
* @constructor
* @class
* This class provides a form for creating/editing appointments.
*
* @author Parag Shah
* @param parent			the element that created this view
* @param className 		class name for this view (defaults to ZmApptComposeView)
* @param calApp			a handle to the owning calendar application
* @param controller		the controller for this view
* @param contactPicker	handle to a ZmContactPicker for selecting addresses
* @param composeMode 	passed in so detached window knows which mode to be in on startup
*/

/**
 * ZmApptViewHelper
 * - Helper methods shared by several views associated w/ creating new appointments.
 *   XXX: move to new files when fully baked!
*/
function ZmApptViewHelper() {
};

ZmApptViewHelper.REPEAT_OPTIONS = [
	{ label: ZmMsg.none, 				value: "NON", 	selected: true 	},
	{ label: ZmMsg.everyDay, 			value: "DAI", 	selected: false },
	{ label: ZmMsg.everyWeek, 			value: "WEE", 	selected: false },
	{ label: ZmMsg.everyMonth, 			value: "MON", 	selected: false },
	{ label: ZmMsg.everyYear, 			value: "YEA", 	selected: false },
	{ label: ZmMsg.custom, 				value: "CUS", 	selected: false }];

// singleton options value
ZmApptViewHelper.TIME_OPTION_VALUES = null;
ZmApptViewHelper.getTimeOptionValues = 
function() {	
	if (ZmApptViewHelper.TIME_OPTION_VALUES)
		return ZmApptViewHelper.TIME_OPTION_VALUES;

	ZmApptViewHelper.TIME_OPTION_VALUES = new Array();
	
	var today = new Date((new Date()).setHours(0,0,0,0));
	var todayDate = today.getDate();

	while (today.getDate() == todayDate) {
		var props = new Object();
		props["label"] = AjxDateUtil.computeTimeString(today);
		props["value"] = today.UTC;
		props["selected"] = false;
		ZmApptViewHelper.TIME_OPTION_VALUES.push(props);
		
		// increment date by 30 mins
		today.setMinutes(today.getMinutes() + 30);
	}
	return ZmApptViewHelper.TIME_OPTION_VALUES;
};

/**
 * creates a new button with a DwtCalendar as its menu
 * @document 					the DOM document
 * @parent						parent this DwtButton gets appended to
 * @buttonId 					buttonId to fetch inside DOM and append DwtButton to
 * @dateButtonListener			AjxListener to call when date button is pressed
 * @dateCalSelectionListener	AjxListener to call when date is selected in DwtCalendar
 * @isInDialog 					true if mini cal is inside a DwtDialog (otherwise z-index will be too low)
*/
ZmApptViewHelper.createMiniCalButton =
function(document, parent, buttonId, dateButtonListener, dateCalSelectionListener, isInDialog) {
	// create button
	var dateButton = new DwtButton(parent);
	dateButton.addSelectionListener(dateButtonListener);
	dateButton.addDropDownSelectionListener(dateButtonListener);
	dateButton.setSize(20, 20);

	// create menu for button
	var calMenu = new DwtMenu(dateButton, DwtMenu.CALENDAR_PICKER_STYLE, null, null, isInDialog);
	dateButton.setMenu(calMenu, true);

	// create mini cal for menu for button
	var cal = new DwtCalendar(calMenu);
	cal.setSkipNotifyOnPage(true);
	cal.addSelectionListener(dateCalSelectionListener);

	// reparent and cleanup
	var buttonCell = Dwt.getDomObj(document, buttonId);
	if (buttonCell)
		buttonCell.appendChild(dateButton.getHtmlElement());
	delete buttonId;

	return dateButton;
};

ZmApptViewHelper.resetTimeSelect = 
function(appt, startTimeSelect, endTimeSelect, useNowDate) {
	var startIdx = 0;
	var endIdx = 0;
	
	if (useNowDate) {
		var now = new Date();
		var nextHour = now.getMinutes() > 30;
		startIdx = now.getHours() * 2 + (now.getMinutes() >= 30 ? 2 : 1);
		endIdx = startIdx + 1;
		// normalize
		var timeOptions = ZmApptViewHelper.getTimeOptionValues();
		if (startIdx == timeOptions.length) {
			startIdx = 0;
			endIdx = 1;
		}
	} else {
		var startDate = appt.getStartDate();
		startIdx = (startDate.getHours() * 2) + (startDate.getMinutes() >= 30 ? 1 : 0);
	
		var endDate = appt.getEndDate();
		endIdx = (endDate.getHours() * 2) + (endDate.getMinutes() >= 30 ? 1 : 0);
	}
	startTimeSelect.setSelected(startIdx);
	endTimeSelect.setSelected(endIdx);
};

ZmApptViewHelper.handleDateChange = 
function(startDateField, endDateField, isStartDate, skipCheck) {
	var needsUpdate = false;
	var sd = new Date(startDateField.value);
	var ed = new Date(endDateField.value);

	// if start date changed, reset end date if necessary
	if (isStartDate) {
		// if date was input by user and its foobar, reset to today's date
		if (!skipCheck) {
			if (isNaN(sd)) {
				sd = new Date();
			}
			// always reset the field value in case user entered date in wront format
			startDateField.value = AjxDateUtil.simpleComputeDateStr(sd);
		}

		if (ed.valueOf() < sd.valueOf())
			endDateField.value = startDateField.value;
		needsUpdate = true;
	} else {
		// if date was input by user and its foobar, reset to today's date
		if (!skipCheck) {
			if (isNaN(ed)) {
				ed = new Date();
			}
			// always reset the field value in case user entered date in wront format
			endDateField.value = AjxDateUtil.simpleComputeDateStr(ed);
		}

		// otherwise, reset start date if necessary
		if (sd.valueOf() > ed.valueOf()) {
			startDateField.value = endDateField.value;
			needsUpdate = true;
		}
	}

	return needsUpdate;
};

ZmApptViewHelper.setSimpleRecurString = 
function(repeatType) {
	// per new select value, change the recur description
	var recurDesc = null;
	switch (repeatType) {
		case "DAI": recurDesc = ZmMsg.everyDay;   break;
		case "WEE": recurDesc = ZmMsg.everyWeek;  break;
		case "MON": recurDesc = ZmMsg.everyMonth; break;
		case "YEA": recurDesc = ZmMsg.everyYear;  break;
	}
	return recurDesc ? (recurDesc + " (" + ZmMsg.noEndDate + ")") : "";
};

//TODO : i18n
ZmApptViewHelper.getRecurrenceDisplayString = 
function(recurrences, startDate) {
	var list, arr, t, ord, i, j, k, x, y, z;
	var str = new Array();
	var idx = 0;
	// iterate through the whole thing, and see if we can't come up
	// with a gramatically correct interpretation.
	var repeatWeekday = ZmApptViewHelper._isRepeatWeekday(recurrences);
	for (k = 0; k < recurrences.length ; ++k) {
		adds = recurrences[k].add;
		excludes = recurrences[k].excludes;
		excepts = recurrences[k].except;
		if (adds != null) {
			str[idx++] = "Every ";
			for (i = 0; i < adds.length; ++i){
				rules = adds[i].rule;
				if (rules) {
					for (j =0; j < rules.length; ++j){
						rule = rules[j];
						idx = ZmApptViewHelper._ruleToString(rule, str, idx, startDate, repeatWeekday);
					}
				}
			}
		}
		if (excludes != null) {
			if (idx > 0) {
				str[idx++] = " except for every ";
			} else {
				str[idx++] = "Except every ";
			}
			for (i = 0; i < excludes.length; ++i){
				rules = excludes[i].rule;
				if (rules) {
					for (j =0; j < rules.length; ++j){
						rule = rules[j];
						idx = ZmApptViewHelper._ruleToString(rule, str, idx, startDate);
					}
				}
			}
		}
	}
	return str.join("");
};

ZmApptViewHelper._ruleToString = 
function(rule, str, idx, startDate, repeatWeekday) {
	idx = ZmApptViewHelper._getFreqString(rule, str, idx, repeatWeekday);
	idx = ZmApptViewHelper._getByMonthString(rule, str, idx);
	idx = ZmApptViewHelper._getByWeeknoString(rule, str, idx);
	idx = ZmApptViewHelper._getByYearDayString(rule, str, idx);
	idx = ZmApptViewHelper._getMonthDayString(rule, str, idx);
	idx = ZmApptViewHelper._getByDayString(rule, str, idx);
	idx = ZmApptViewHelper._getRecurrenceTimeString(rule, str, idx, startDate);
	return idx;
};

ZmApptViewHelper._getFreqString = 
function(rule, str, idx, repeatWeekday) {
	if (rule.freq) {
		var count = 0;
		if (rule.interval && rule.interval[0].ival) 
			count = rule.interval[0].ival;
		if (count > 1 ) {
			str[idx++] = count; 
			str[idx++] = " ";
		}
		freq = rule.freq.substring(0,3);
		str[idx++] = ZmApptViewHelper._frequencyToDisplayString(freq, count, repeatWeekday);
	}
	return idx;
};

ZmApptViewHelper._getByMonthString = 
function(rule, str, idx) {
	if (rule.bymonth) {
		list = rule.bymonth[0].molist;
		arr = list.split(',');
		if (arr && arr.length > 0) 
			str[idx++] = " in ";
		var ord;
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			str[idx++] = AjxDateUtil.MONTH_MEDIUM[ord];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmApptViewHelper._getByWeeknoString = 
function(rule, str, idx) {
	var list, arr, t, ord;
	if (rule.byweekno) {
		list = rule.bymonth[0].molist;
		arr = list.split(',');
		if (arr && arr.length > 0) str[idx++] = " weeks ";
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last week of the year ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last week of the year ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmApptViewHelper._getMonthDayString = 
function(rule, str, idx) {
	var arr, list, t;
	if (rule.monthday) {
		list = rule.bymonthday[0].modaylist;
		arr = list.split(',');
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last day of the month ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last day of the month ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmApptViewHelper._getByDayString = 
function(rule, str, idx) {
	var x;
	if (rule.byday) {
		for (x = 0; x < rule.byday.length; ++x) {
			str[idx++] = " on ";
			str[idx++] = ZmAppt.SERVER_DAYS_TO_DISPLAY[rule.byday[x].wkday[0].day];
			var serverOrd = rule.byday[x].wkday[0].ordwk;
			if (serverOrd != null) {
				var fChar = serverOrd.charAt(0);
				var num;
				if (serverOrd == "-1") {
					str[idx++] = " the last week of the";
				} else if ( fChar == '-') {
					num = parseInt(serverOrd.substring(1,serverOrd.length - 1));
					str[idx++] = " the ";
					str[idx++] = num;
					str[idx++] = " from the last week of the ";
				} else {
					if (fChar == '+') {
						num = parseInt(serverOrd.substring(1,serverOrd.length - 1));
					} else {
						num = parseInt(serverOrd);
					}
					str[idx++] = " the ";
					str[idx++] = num;
					str[idx++] = " week of the ";
				}
				str[idx++] = freq;
				str[idx++] = " ";
			}
		}
	}
	return idx;
};

ZmApptViewHelper._getRecurrenceTimeString = 
function(rule, str, idx, startDate) {
	var hours;
	if (rule.byhour) {
		list = rule.byhour[0].hrlist;
		hours = list.split(',');
	} else {
		hours = [startDate.getHours()];
	}

	var minutes;
	if (rule.byminute) {
		list = rule.byminute[0].minlist;
		minutes = list.split(',');
	} else {
		minutes = [startDate.getMinutes()];
	}

	var seconds;
	if (rule.bysecond) {
		list = rule.bysecond[0].seclist;
		seconds = list.split(',');
	} else {
		seconds = [startDate.getSeconds()];
	}
							
	str[idx++] = " at ";
	for (x=0; x < hours.length; ++x){ 
		for (y=0; y < minutes.length; ++y) {
			for (z = 0; z < seconds.length; ++z){
										
				var h = parseInt(hours[x]);
				var ampm = " AM";
				if (h >= 12) ampm = " PM";
				str[idx++] = (h != 12)? (h % 12): h;
				str[idx++] = ":";
				str[idx++] = AjxDateUtil._pad(minutes[y]);
// 				if (seconds[z] == '0' || seconds[z] == '00') {
// 				} else {
// 					str[idx++] = ":";
// 					str[idx++] = AjxDateUtil._pad(seconds[z]);
// 				}
				str[idx++] = ampm;
				if (z < seconds.length - 1 || y < seconds.length - 1 || x < hours.length -1){
					str[idx++] = ", and ";
				}
			}
		}
	}
	return idx;
};

ZmApptViewHelper._getByYearDayString = 
function(rule, str, idx) {
	var list, arr, t, ord;
	if (rule.byyearday) {
		list = rule.byyearday[0].yrdaylist;
		arr = list.split(',');
		for (t = 0; t < arr.length; ++t) {
			ord = parseInt(arr[t]);
			if (ord == -1 ){
				str[idx++] = " the last day of the year ";
			} else {
				str[idx++] = " the ";
				str[idx++] = ( ord * -1);
				str[idx++] = " from the last day of the year ";
			}
			str[idx++] = arr[t];
			if (t < arr.length -1) {
				str[idx++] = " and ";
			}
		}
	}
	return idx;
};

ZmApptViewHelper._frequencyToDisplayString = 
function(freq, count, repeatWeekday) {
	var plural = count > 1 ? 1 : 0;
	return freq == "DAI" && repeatWeekday 
		? ZmMsg.weekday
		: AjxDateUtil.FREQ_TO_DISPLAY[freq][plural];
};

ZmApptViewHelper._isRepeatWeekday = 
function(recurrences) {
	// NOTE: Taken from ZmAppt.prototype._populateRecurrenceFields and
	//       stripped down to minimal amount to calculate repeatWeekday.
	var repeatWeekday = false;
	for (var k = 0; k < recurrences.length ; ++k) {
		var adds = recurrences[k].add;
		if (adds != null) {
			var repeatType;
			for (var i = 0; i < adds.length; ++i) {
				var rules = adds[i].rule;
				if (rules) {
					for (var j =0; j < rules.length; ++j) {
						var rule = rules[j];
						if (rule.freq) {
							repeatType = rule.freq.substring(0,3);
						}
						if (rule.byday && rule.byday[0] && rule.byday[0].wkday) {
							var wkdayLen = rule.byday[0].wkday.length;
							if (repeatType == "WEE" || (repeatType == "DAI" && wkdayLen == 5)) {
								repeatWeekday = repeatType == "DAI";
							}
						}
					}
				}
			}
		}
	}
	return repeatWeekday;
};
