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
 * creates a new DwtCalendar
 * @parent 		parent this DwtCalendar gets appended to (usually the shell)
 * @listener 	AjxListener to call when date is selected
 * @fdow 		first day of the week (different per i18n)
 * @isInDialog 	set to true if mini cal is to be inside a DwtDialog (otherwise z-index will be too low)
*/
ZmApptViewHelper.createMiniCal = 
function(parent, listener, fdow, isInDialog) {
	var dateCalendar = new DwtCalendar(parent, null, DwtControl.ABSOLUTE_STYLE);

	dateCalendar.setSkipNotifyOnPage(true);
	dateCalendar.setSize("150");
	dateCalendar.setZIndex(isInDialog ? Dwt.Z_DIALOG : Dwt.Z_VIEW);
	var calEl = dateCalendar.getHtmlElement();
	calEl.style.borderWidth = "2px";
	calEl.style.borderStyle = "solid";
	calEl.style.borderColor = "#B2B2B2 #000000 #000000 #B2B2B2";
	calEl.style.backgroundImage = "url(/zimbra/skins/steel/images/bg_pebble.gif)";

	dateCalendar.addSelectionListener(listener);

	var workingWeek = [];
	for (var i=0; i < 7; i++) {
		var d = (i+fdow)%7;
		workingWeek[i] = (d > 0 && d < 6);
	}
	dateCalendar.setWorkingWeek(workingWeek);
	
	return dateCalendar;
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
