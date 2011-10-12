/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
* show history of the status window
* @param parent			the element that created this view
 * @private
*/
ZmReminderDialog = function(parent, reminderController, calController, apptType) {

	// init custom buttons
    this._apptType = apptType;
    var selectInputId  = "ZmReminderDialog_reminderSelectInput_" + apptType;
    var selectButtonId = "ZmReminderDialog_reminderSelectBtn_"   + apptType;
    var html = [];
    var i = 0;
    html[i++] = "<td valign='middle' class='ZmReminderField'>";
    html[i++] = ZmMsg.snoozeAll;
    html[i++] = "</td><td valign='middle'>";
    // Use a table within a dialog button td to cause the selector input field and drop
    // down button to align properly and butt up against one another.
    html[i++] = "<table cellspacing=0 cellpadding=0><tr></tr><td valign='middle' id='";
    html[i++] = selectInputId;
    html[i++] = "'></td><td valign='middle' id='";
    html[i++] = selectButtonId;
    html[i++] = "'></td></tr></table>";
    html[i++] = "</td><td valign='middle' class='ZmSnoozeButton' id=\"{0}\"></td>";

	var snoozeButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.SNOOZE_BUTTON, ZmMsg.snooze, DwtDialog.ALIGN_LEFT, null, html.join(""));
	var dismissAllButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.DISMISS_ALL_BUTTON, ZmMsg.dismissAll, DwtDialog.ALIGN_RIGHT);

	// call base class
	DwtDialog.call(this, {id:"ZmReminderDialog_" + apptType, parent:parent, standardButtons:DwtDialog.NO_BUTTONS, extraButtons:[snoozeButton, dismissAllButton]});

	this._reminderController = reminderController;
	this._calController = calController;

    this.setContent(this._contentHtml(selectInputId, selectButtonId));
    if(this._calController instanceof ZmTaskMgr) {
        this.setTitle(ZmMsg.taskReminders);
    } else {
        this.setTitle(ZmMsg.apptReminders);
    }
    this.registerCallback(ZmReminderDialog.SNOOZE_BUTTON, this._handleSnoozeButton, this);
	this.registerCallback(ZmReminderDialog.DISMISS_ALL_BUTTON, this._handleDismissAllButton, this);
};

ZmReminderDialog.prototype = new DwtDialog;
ZmReminderDialog.prototype.constructor = ZmReminderDialog;


// Consts

ZmReminderDialog.SNOOZE_BUTTON		= "Snooze";//++DwtDialog.LAST_BUTTON;
ZmReminderDialog.DISMISS_ALL_BUTTON	= "DismissAll";//++DwtDialog.LAST_BUTTON;
ZmReminderDialog.SOON				= -AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES;

// Public methods

ZmReminderDialog.prototype.toString =
function() {
	return "ZmReminderDialog";
};

ZmReminderDialog.prototype.popup =
function() {
	DwtDialog.prototype.popup.call(this);
	this._cancelSnooze();

    if (appCtxt.get(ZmSetting.CAL_REMINDER_NOTIFY_BROWSER)) {
        AjxPackage.require("Alert");
        ZmBrowserAlert.getInstance().start(ZmMsg.reminders);
    }

    if (appCtxt.get(ZmSetting.CAL_REMINDER_NOTIFY_SOUNDS)) {
        AjxPackage.require("Alert");
        ZmSoundAlert.getInstance().start();
    }

    if (appCtxt.get(ZmSetting.CAL_REMINDER_NOTIFY_TOASTER)) {
        AjxPackage.require("Alert");
        var winText = [];
        var appts = this._list.getArray();
        // only show, at most, five appointment reminders
        for (var i = 0; i < appts.length && i < 5; i++) {
            var appt = appts[i];
            var startDelta = this._computeDelta(appt);
            var delta = startDelta ? this._formatDeltaString(startDelta) : "";
            var text = [appt.getName(), ", ", this._getDurationText(appt), "\n(", delta, ")"].join("");
            if (AjxEnv.isMac) {
                ZmDesktopAlert.getInstance().start(ZmMsg.reminders, text);
            } else if (AjxEnv.isWindows) {
                winText.push(text);
            }
        }

        if (AjxEnv.isWindows && winText.length > 0) {
            if (appts.length > 5) {
                winText.push(ZmMsg.andMore);
            }
            ZmDesktopAlert.getInstance().start(ZmMsg.reminders, winText.join("\n"), 5);
        }
    }

    var snoozeSelectMenuListener = this._snoozeSelectMenuListener.bind(this);
    this._createSnoozeMenu(this._snoozeSelectButton, snoozeSelectMenuListener, this._list);

};

ZmReminderDialog.prototype.initialize =
function(list) {
	this._list = list.clone();
	this._apptData = {};

	var html = [];
	var idx = 0;
	var size = list.size();

    AjxDebug.println(AjxDebug.REMINDER, "---Reminders [" + (new Date().getTime())+ "]---");

	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		var uid = appt.getUniqueId(true);
		var data = this._apptData[uid] = {appt:appt};
		idx = this._addAppt(html, idx, appt, data, (i > 0));
	}
	html[idx++] = "</table>";

	// cleanup before using
	if (this._dismissButtons) {
		for (var id in this._dismissButtons) {
			this._dismissButtons[id].dispose();
		}
	}
	if (this._openButtons) {
		for (var id in this._openButtons) {
			this._openButtons[id].dispose();
		}
	}
	this._dismissButtons = {};
	this._openButtons = {};

	var dismissListener = new AjxListener(this, this._dismissButtonListener);
	var openListener = new AjxListener(this, this._openButtonListener);
	var div = document.getElementById(this._listId);
	div.innerHTML = html.join("");

	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		var uid = appt.getUniqueId(true);
        var id = appt.id;
		var data = this._apptData[uid];

        var alarmData = appt.getAlarmData();
        alarmData = (alarmData && alarmData.length > 0) ? alarmData[0] : {};
        //bug: 60692 - Add troubleshooting code for late reminders
        AjxDebug.println(AjxDebug.REMINDER, appt.getReminderName() + " : " + (alarmData.nextAlarm || " NA ") + " / " + (alarmData.alarmInstStart || " NA "));

		// dismiss button
		var dismissBtn = this._dismissButtons[data.dismissBtnId] = new DwtButton({id:"dismissBtn_" + id, parent:this, className:"DwtToolbarButton", parentElement:data.dismissBtnId});
		dismissBtn.setImage("Cancel");
		dismissBtn.setText(ZmMsg.dismiss);
		dismissBtn.addSelectionListener(dismissListener);
		dismissBtn.apptUid = uid;

		// open button
		var openBtn = this._openButtons[data.openBtnId] = new DwtButton({id:"openBtn_" + id, parent:this, className:"DwtToolbarButton", parentElement:data.openBtnId});
		openBtn.setImage(appt.otherAttendees ? "ApptMeeting" : (appt.type == ZmItem.TASK) ? "TasksApp" : "Appointment");
		openBtn.setText(ZmMsg.viewAppointment);
		openBtn.addSelectionListener(openListener);
		openBtn.apptUid = uid;

		this._updateDelta(data);
	}

    var snoozeSelectMenuListener = this._snoozeSelectMenuListener.bind(this);
    this._createSnoozeMenu(this._snoozeSelectButton, snoozeSelectMenuListener, this._list);
};

ZmReminderDialog.prototype._contentHtml =
function(selectInputId, selectButtonId) {
	this._listId = Dwt.getNextId("ZmReminderDialogContent");//Dwt.getNextId();
    var params = {
        parent: this,
        parentElement: selectInputId,
        type: DwtInputField.STRING,
        errorIconStyle: DwtInputField.ERROR_ICON_NONE,
        validationStyle: DwtInputField.CONTINUAL_VALIDATION,
        className: "DwtInputField ReminderInput"
    };
    this._snoozeSelectInput = new DwtInputField(params);
    var snoozeInputEl = this._snoozeSelectInput.getInputElement();
    Dwt.setSize(snoozeInputEl, Dwt.DEFAULT, "22px");

    var snoozeSelectButtonListener = this._snoozeSelectButtonListener.bind(this);
    this._snoozeSelectButton = this._createSnoozeSelectButton(this, selectButtonId,
            snoozeSelectButtonListener);

    return ["<div class='ZmReminderDialog' id='", this._listId, "'>"].join("");
};


ZmReminderDialog.prototype._createSnoozeSelectButton =
function(parent, buttonId, buttonListener) {
    var snoozeSelectButton = new DwtButton({parent:parent});
    snoozeSelectButton.addDropDownSelectionListener(buttonListener);
    snoozeSelectButton.setData(Dwt.KEY_ID, buttonId);
    snoozeSelectButton.setSize(AjxEnv.isIE ? "30" : "20");

    snoozeSelectButton.reparentHtmlElement(buttonId);

    //this._createSnoozeMenu(snoozeSelectButton, menuSelectionListener);

    return snoozeSelectButton;
}



ZmReminderDialog.DEFAULT_SNOOZE = -5;
ZmReminderDialog.SNOOZE_MINUTES =
// Snooze period in minutes (negative is 'minutes before appt', zero is separator:
    [-30, -15, -5, -1, 0,
       1, 5, 10, 15, 30, 45, 60, 120, 240, 480,  1440, 2880,  4320,   5760, 10080, 20160];
//                          1hr  2hr  4hr  8hr  1day  2days  3days  4days  1week  2weeks

// Snooze period in msec (Entries must match SNOOZE_MINUTES)
ZmReminderDialog.SNOOZE_MSEC =
    [  -30*60*1000,   -15*60*1000,  -5*60*1000,    -1*60*1000,            0,
         1*60*1000,     5*60*1000,  10*60*1000,    15*60*1000,   30*60*1000,    45*60*1000,   60*60*1000,
       120*60*1000,   240*60*1000, 480*60*1000,  1440*60*1000, 2880*60*1000,  4320*60*1000, 5760*60*1000,
     10080*60*1000, 20160*60*1000];

// Minutes per:                   minute hour  day   week   endMarker
ZmReminderDialog.SCALE_MINUTES = [   1,   60, 1440, 10080,   1000000];

ZmReminderDialog.prototype._createSnoozeMenu =
function(snoozeSelectButton, menuSelectionListener, apptList) {
    // create menu for button
    var snoozeMenu = new DwtMenu({parent:snoozeSelectButton, style:DwtMenu.DROPDOWN_STYLE});
    snoozeMenu.setSize("150");
    snoozeSelectButton.setMenu(snoozeMenu, true);

    var appts = apptList.getArray();
    var minStartDelta =  1;
    var maxStartDelta = -1;

    if (this._apptType == "task") {
        // Tasks are simpler: No 'before' times allowed, and all fixed times are allowed
        minStartDelta = 1;
        maxStartDelta = ZmReminderDialog.SNOOZE_MSEC[ZmReminderDialog.SNOOZE_MSEC.length-1];
    } else {
        for (var i = 0; i < appts.length; i++) {
            var appt = appts[i];
            var startDelta = this._computeDelta(appt);
            // Only limit the snooze menu with appts that have not already started/completed
            if (startDelta < 0) {
                // Limit the list of 'before' times by the appt that will appear the soonest in the future
                if ((startDelta > minStartDelta) || (minStartDelta >= 0)) {
                    minStartDelta = startDelta;
                }
                // Get the largest snooze period that can be used by any appt (without snoozing past its start)
                startDelta = -startDelta;
                if (startDelta > maxStartDelta) {
                    maxStartDelta = startDelta;
                }
            }
        }
    }

    var snoozeFormatter = [];
    var snoozeFormatterBefore = new AjxMessageFormat(ZmMsg.apptRemindNMinutesBefore); // Before Appt Formatter
    snoozeFormatter[0] = new AjxMessageFormat(ZmMsg.reminderSnoozeMinutes);       // Minute Formatter
    snoozeFormatter[1] = new AjxMessageFormat(ZmMsg.reminderSnoozeHours);         // Hour   Formatter
    snoozeFormatter[2] = new AjxMessageFormat(ZmMsg.reminderSnoozeDays);          // Day    Formatter
    snoozeFormatter[3] = new AjxMessageFormat(ZmMsg.reminderSnoozeWeeks);         // Week   Formatter
    var iFormatter = 0;
    var formatter = null;
    var snoozeDisplayValue = 0;
    var scale = 1;
    var defaultSet = false;
    var firstMenuItem = null;
    var addSeparator = false;
    var anyAdded = false;
    for (var i = 0; i < ZmReminderDialog.SNOOZE_MINUTES.length; i++) {
        // Don't display any fixed periods greater than the longest time till the start of an appt
        if (ZmReminderDialog.SNOOZE_MSEC[i] > maxStartDelta) break;

        if (ZmReminderDialog.SNOOZE_MSEC[i] >= minStartDelta) {
            // Found a snooze period to display
            snoozeDisplayValue = ZmReminderDialog.SNOOZE_MINUTES[i];
            if (snoozeDisplayValue == 0) {
                // Set up to add a seperator if any 'before' time were added; do the
                // actual add if any fixed times are added
                addSeparator = anyAdded;
            }
            else {
                if (addSeparator) {
                    new DwtMenuItem({parent:snoozeMenu, style:DwtMenuItem.SEPARATOR_STYLE});
                    addSeparator = false;
                }
                anyAdded = true;
                if (snoozeDisplayValue <= 0) {
                    snoozeDisplayValue = -snoozeDisplayValue;
                    formatter = snoozeFormatterBefore;
                    scale = 1;
                }else {
                    if (snoozeDisplayValue >= ZmReminderDialog.SCALE_MINUTES[iFormatter+1]) {
                        iFormatter++;
                    }
                    scale = ZmReminderDialog.SCALE_MINUTES[iFormatter];
                    formatter = snoozeFormatter[iFormatter];
                }
                var label = formatter.format(snoozeDisplayValue/scale);
                var mi = new DwtMenuItem({parent: snoozeMenu, style: DwtMenuItem.NO_STYLE});
                mi.setText(label);
                mi.setData("value", snoozeDisplayValue);
                if(menuSelectionListener) mi.addSelectionListener(menuSelectionListener);

                if (!firstMenuItem) {
                    // Set the first item as the default
                    firstMenuItem = mi;
                    mi.setChecked(true);
                    this._snoozeSelectInput.setValue(label);
                    defaultSet = true;
                }
            }
        }
    }
    if (firstMenuItem == null) {
        // No valid selections
        this._snoozeSelectInput.setValue("");
        this._snoozeSelectInput.setEnabled(false, true);
        snoozeMenu.setEnabled(false, true);
        snoozeSelectButton.setEnabled(false, true);
        this.unregisterCallback(ZmReminderDialog.SNOOZE_BUTTON);
    } else {
        this._snoozeSelectInput.setEnabled(true, true);
        snoozeMenu.setEnabled(true, true);
        snoozeSelectButton.setEnabled(true, true);
        this.registerCallback(ZmReminderDialog.SNOOZE_BUTTON, this._handleSnoozeButton, this);
    }

};


ZmReminderDialog.prototype._snoozeSelectButtonListener =
function(ev) {
	ev.item.popup();
};

ZmReminderDialog.prototype._snoozeSelectMenuListener =
function(ev) {
    if (ev.item && ev.item instanceof DwtMenuItem) {
        this._snoozeSelectInput.setValue(ev.item.getText());
        this._snoozeValue = ev.item.getData("value");
        return;
    }
};

ZmReminderDialog.prototype._updateDelta =
function(data) {
	var td = document.getElementById(data.deltaId);
	if (td) {
		var startDelta = this._computeDelta(data.appt);

		if (startDelta >= 0) 							td.className = 'ZmReminderOverdue';
		else if (startDelta > ZmReminderDialog.SOON)	td.className = 'ZmReminderSoon';
		else											td.className = 'ZmReminderFuture';

		td.innerHTML = startDelta ? this._formatDeltaString(startDelta) : "";
	}
};

ZmReminderDialog.prototype._addAppt =
function(html, idx, appt, data, needSep) {

	var uid = appt.id;
	data.dismissBtnId = "dismissBtnContainer_" + uid;
	data.openBtnId = "openBtnContainer_" + uid;
	data.deltaId = "delta_" + uid;
	data.rowId = "apptRow_" + uid;
	data.reminderNameContainerId = "reminderNameContainerId_" + uid;
	data.reminderDescContainerId = "reminderDescContainerId_" + uid;

	var calName = (appt.folderId != ZmOrganizer.ID_CALENDAR && appt.folderId != ZmOrganizer.ID_TASKS && this._calController)
		? this._calController.getCalendarName(appt.folderId) : null;


	var calendar = appCtxt.getById(appt.folderId);

	var params = {
		needSep: needSep,
		rowId: data.rowId,
		calName: AjxStringUtil.htmlEncode(calName),
		accountName: (appCtxt.multiAccounts && calendar && calendar.getAccount().getDisplayName()),
		location: (AjxStringUtil.htmlEncode(appt.getReminderLocation())),
		apptIconHtml: (AjxImg.getImageHtml(appt.otherAttendees ? "ApptMeeting" : "Appointment")),
		organizer: appt.otherAtt ? appt.organizer : null,
		reminderName: (AjxStringUtil.htmlEncode(appt.getReminderName())),
		durationText: (AjxStringUtil.trim(this._getDurationText(appt))),
		deltaId: data.deltaId,
		openBtnId: data.openBtnId,
		dismissBtnId: data.dismissBtnId,
        reminderNameContainerId: data.reminderNameContainerId,
        reminderDescContainerId: data.reminderDescContainerId,
        type: appt.type ? appt.type : ZmItem.APPT
	};
	html[idx++] = AjxTemplate.expand("calendar.Calendar#ReminderDialogRow", params);
	return idx;
};

ZmReminderDialog.prototype._openButtonListener =
function(ev) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.allRemindersAreSnoozed, ZmStatusView.LEVEL_INFO);

	this._handleSnoozeButton();

	var obj = DwtControl.getTargetControl(ev);
	var data = this._apptData[obj.apptUid];
	var appt = data ? data.appt : null;
    var type = appt.type ? appt.type : ZmItem.APPT;
	if (appt && type == ZmItem.APPT) {
		AjxDispatcher.require(["CalendarCore", "Calendar"]);

		var cc = AjxDispatcher.run("GetCalController");

		// the give appt object is a ZmCalBaseItem. We need a ZmAppt
		var newAppt = new ZmAppt();
		for (var i in appt) {
			if (!AjxUtil.isFunction(appt[i])) {
				newAppt[i] = appt[i];
			}
		}
		var callback = new AjxCallback(cc, cc._showAppointmentDetails, newAppt);
		newAppt.getDetails(null, callback, null, null, true);
	} else if(appt && type == ZmItem.TASK) {
        AjxDispatcher.require(["TasksCore", "Tasks"]);

		var tlc = AjxDispatcher.run("GetTaskListController");

		// the give appt object is a ZmCalBaseItem. We need a ZmAppt
		var newTask = new ZmTask();
		for (var i in appt) {
			if (!AjxUtil.isFunction(appt[i])) {
				newTask[i] = appt[i];
			}
		}
		var callback = new AjxCallback(tlc, tlc._editTask, newTask);
		newTask.getDetails(null, callback, null, null, true);
    }
};

ZmReminderDialog.prototype._dismissButtonListener =
function(ev) {
	var obj = DwtControl.getTargetControl(ev);
	var data = this._apptData[obj.apptUid];
	if (!data) { return; }

	this._reminderController.dismissAppt(data.appt);

	// cleanup HTML
	var dismissBtn = this._dismissButtons[data.dismissBtnId];
	if (dismissBtn) {
		dismissBtn.dispose();
		delete this._dismissButtons[data.dismissBtnId];
	}
	var openBtn = this._openButtons[data.openBtnId];
	if (openBtn) {
		openBtn.dispose();
		delete this._openButtons[data.openBtnId];
	}
	var row = document.getElementById(data.rowId);
	if (row) {
		var nextRow = row.nextSibling;
		if (nextRow && nextRow.getAttribute("name") == "rdsep") {
			nextRow.parentNode.removeChild(nextRow);
		}
		row.parentNode.removeChild(row);
	}

	delete this._apptData[obj.apptUid];
	this._list.remove(data.appt);

	if (this._list.size() == 0) {
		this.popdown();
	}
};


ZmReminderDialog.prototype._handleSnoozeButton =
function() {
    // check if all fields are populated w/ valid values
    var errorMsg = [];
    var snoozeInfo = null;
    var beforeAppt = false;
    var snoozeString = this._snoozeSelectInput.getValue();
    if (!snoozeString) {
         errorMsg.push(ZmMsg.reminderSnoozeClickNoDuration);
    } else {
        snoozeInfo = ZmCalendarApp.parseReminderString(snoozeString);
        if (snoozeInfo.reminderValue === "" ) {
            // Returned when no number was specified in the snooze input field
            errorMsg.push(ZmMsg.reminderSnoozeClickNoNumber);
        }  else {
            // Test if the unit is a known one (default behaviour for parseReminderString
            // returns unknowns as hours)
            var valid = this._testSnoozeString(snoozeString);
            if (!valid) {
                 errorMsg.push(ZmMsg.reminderSnoozeClickUnknownUnit);
            } else {
                // Detect 'before'
                beforeAppt = (snoozeString.indexOf('before') >= 0);
            }
        }
    }
    if (errorMsg.length > 0) {
        var msg = errorMsg.join("<br>");
        var dialog = appCtxt.getMsgDialog();
        dialog.reset();
        dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
    }  else {
        this.popdown();
        var snoozeMinutes = ZmCalendarApp.convertReminderUnits(snoozeInfo.reminderValue,
                                                               snoozeInfo.reminderUnits);
	    this._reminderController.snoozeAppt(this._list);
        this._reminderController._snoozeApptAction(this._list, snoozeMinutes, beforeAppt)
    }

};



/**
 * Parses the given string to insure the units are recognized
 * @param snoozeString snooze string eg. "10 minutes"
 *
 * @private
 */
ZmReminderDialog.prototype._testSnoozeString =
function(snoozeString) {
    var snoozeUnitStrings = [];
    snoozeUnitStrings[0] = AjxMsg.minute;
    snoozeUnitStrings[1] = AjxMsg.hour;
    snoozeUnitStrings[2] = AjxMsg.day;
    snoozeUnitStrings[3] = AjxMsg.week;

    snoozeString = snoozeString.toLowerCase();
    var found = false;
    for (i = 0; i < snoozeUnitStrings.length; i++) {
        if (snoozeString.indexOf(snoozeUnitStrings[i]) >= 0) {
            found = true;
            break;
        }
    }
	return found;
};



ZmReminderDialog.prototype._snoozeAction =
function(list) {
	if (list) {
		this._reminderController.activateSnoozedAppts(list);
	}
};

ZmReminderDialog.prototype._cancelSnooze =
function() {
	if (this._snoozeActionId) {
		AjxTimedAction.cancelAction(this._snoozeActionId);
		delete this._snoozeActionId;
	}
};

ZmReminderDialog.prototype._handleDismissAllButton =
function() {
	this._cancelSnooze();
	this.popdown();
	this._reminderController.dismissAppt(this._list);
};

ZmReminderDialog.prototype._getDurationText =
function(appt) {
	var isMultiDay = appt.isMultiDay();
	var start = appt._alarmInstStart ? new Date(appt._alarmInstStart) : appt.startDate ? appt.startDate : null;
	// bug: 28598 - alarm for recurring appt might still point to old alarm time
	// cannot take endTime directly
	var endTime = appt._alarmInstStart ? (start.getTime() + appt.getDuration()) : appt.getEndTime();
	var end = new Date(endTime);

    //for task
    if(appt.type == ZmItem.TASK && !start && !endTime) { return null; }

	if (appt.isAllDayEvent()) {
		end = appt.type != ZmItem.TASK ? new Date(endTime - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0)) : end;
		var pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		return start ? AjxMessageFormat.format(pattern, [start, end]) : AjxMessageFormat.format(pattern, [end]); //for task
	}
	var pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	return AjxMessageFormat.format(pattern, [start, end, ""]);
};

ZmReminderDialog.prototype._computeDelta =
function(appt) {
	return (appt.alarmData && appt.alarmData.length > 0)
		? (appt.alarmData[0].alarmInstStart ? (new Date()).getTime() - appt.adjustMS(appt.alarmData[0].alarmInstStart, appt.tzo) : appt.getEndTime()  ? (new Date()).getTime() - appt.getEndTime() : null)
		: ((new Date()).getTime() - appt.getStartTime());
};

ZmReminderDialog.prototype._formatDeltaString =
function(deltaMSec) {
	var prefix = deltaMSec < 0 ? "In" : "OverdueBy";
	deltaMSec = Math.abs(deltaMSec);

	// calculate parts
	var years =  Math.floor(deltaMSec / (AjxDateUtil.MSEC_PER_DAY * 365));
	if (years != 0)
		deltaMSec -= years * AjxDateUtil.MSEC_PER_DAY * 365;
	var months = Math.floor(deltaMSec / (AjxDateUtil.MSEC_PER_DAY * 30.42));
	if (months > 0)
		deltaMSec -= Math.floor(months * AjxDateUtil.MSEC_PER_DAY * 30.42);
	var days = Math.floor(deltaMSec / AjxDateUtil.MSEC_PER_DAY);
	if (days > 0)
		deltaMSec -= days * AjxDateUtil.MSEC_PER_DAY;
	var hours = Math.floor(deltaMSec / AjxDateUtil.MSEC_PER_HOUR);
	if (hours > 0)
		deltaMSec -= hours * AjxDateUtil.MSEC_PER_HOUR;
	var mins = Math.floor(deltaMSec / 60000);
	if (mins > 0)
		deltaMSec -= mins * 60000;
	var secs = Math.floor(deltaMSec / 1000);
	if (secs > 30 && mins < 59) mins++;

	var secs = 0;

	// determine message
	var amount;
	if (years > 0) {
		amount = "Years";
		if (years <= 3 && months > 0) {
			amount = "YearsMonths";
		}
	} else if (months > 0) {
		amount = "Months";
		if (months <= 3 && days > 0) {
			amount = "MonthsDays";
		}
	} else if (days > 0) {
		amount = "Days";
		if (days <= 2 && hours > 0) {
			amount = "DaysHours";
		}
	} else if (hours > 0) {
		amount = "Hours";
		if (hours < 5 && mins > 0) {
			amount = "HoursMinutes";
		}
	} else {
		amount = "Minutes";
	}

	// format message
	var key = ["reminder",prefix,amount].join("");
	var args = [deltaMSec, years, months, days, hours, mins, secs];
	return AjxMessageFormat.format(ZmMsg[key], args);
};
