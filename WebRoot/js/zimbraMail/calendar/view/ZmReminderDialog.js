/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
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

	this.ALL_APPTS = "ALL" + apptType;

	// call base class
	DwtDialog.call(this, {id:"ZmReminderDialog_" + apptType, parent:parent, standardButtons:DwtDialog.NO_BUTTONS});

	this._reminderController = reminderController;
	this._calController = calController;

	this._listId = Dwt.getNextId("ZmReminderDialogContent");

    this.setContent(this._contentHtml());
    if(this._calController instanceof ZmTaskMgr) {
        this.setTitle(ZmMsg.taskReminders);
    } else {
        this.setTitle(ZmMsg.apptReminders);
    }
};

ZmReminderDialog.prototype = new DwtDialog;
ZmReminderDialog.prototype.constructor = ZmReminderDialog;


// Consts

ZmReminderDialog.SOON = -AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES;

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
                ZmDesktopAlert.getInstance().start(ZmMsg.reminders, text, true);
            } else if (AjxEnv.isWindows) {
                winText.push(text);
            }
        }

        if (AjxEnv.isWindows && winText.length > 0) {
            if (appts.length > 5) {
                winText.push(ZmMsg.andMore);
            }
            ZmDesktopAlert.getInstance().start(ZmMsg.reminders, winText.join("\n"), true);
        }
    }

};

ZmReminderDialog.prototype.initialize =
function(list) {
	this._list = new AjxVector();
	this._apptData = {};

	var html = [];
	var idx = 0;
	var size = list.size();

    AjxDebug.println(AjxDebug.REMINDER, "---Reminders [" + (new Date().getTime())+ "]---");

	html[idx++] = "<table style='min-width:375px'>";
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
        if (appt.isShared() && appt.isReadOnly()) { continue; }
        this._list.add(appt);
		var uid = appt.getUniqueId(true);
		var data = this._apptData[uid] = {appt:appt};
		idx = this._addAppt(html, idx, appt, data);
	}
	html[idx++] = "</table>";

	this._addAllSection(html, idx);

	// cleanup before using
	this._cleanupButtons(this._dismissButtons);
	this._cleanupButtons(this._openButtons);
	this._cleanupButtons(this._snoozeButtons);
	this._cleanupButtons(this._snoozeSelectButtons);
	this._cleanupButtons(this._snoozeSelectInputs);
	this._dismissButtons = {};
	this._openButtons = {}; //those are link buttons  (the reminder name is now a link)
	this._snoozeButtons = {};
	this._snoozeSelectButtons = {};
	this._snoozeSelectInputs = {};

	var dismissListener = new AjxListener(this, this._dismissButtonListener);
	var openListener = new AjxListener(this, this._openButtonListener);
	var snoozeListener = this._snoozeButtonListener.bind(this);
	var snoozeSelectButtonListener = this._snoozeSelectButtonListener.bind(this);
	var snoozeSelectMenuListener = this._snoozeSelectMenuListener.bind(this);

	var div = document.getElementById(this._listId);
	div.innerHTML = html.join("");

	for (var i = 0; i < this._list.size(); i++) {
		var appt = this._list.get(i);
		var uid = appt.getUniqueId(true);
        var id = appt.id;
		var data = this._apptData[uid];

        var alarmData = appt.getAlarmData();
        alarmData = (alarmData && alarmData.length > 0) ? alarmData[0] : {};
        //bug: 60692 - Add troubleshooting code for late reminders
        AjxDebug.println(AjxDebug.REMINDER, appt.getReminderName() + " : " + (alarmData.nextAlarm || " NA ") + " / " + (alarmData.alarmInstStart || " NA "));

		this._createButtons(uid, id, dismissListener, openListener, snoozeListener, snoozeSelectButtonListener, snoozeSelectMenuListener);

		this._updateDelta(data);
	}

	this._createButtons(this.ALL_APPTS, this.ALL_APPTS, dismissListener, openListener, snoozeListener, snoozeSelectButtonListener, snoozeSelectMenuListener);

	this._updateIndividualSnoozeActionsVisibility();

	//hide the separator from the dialog buttons since we do not use dialog buttons for this dialog.
	document.getElementById(this._htmlElId + "_buttonsSep").style.display = "none";

};


ZmReminderDialog.prototype._createButtons =
function(uid, id, dismissListener, openListener, snoozeListener, snoozeSelectButtonListener, snoozeSelectMenuListener) {
	//id should probably not be used, and only uid should - but I'm afraid it would confuse seleniun. This was added for bug 62376

	var data = this._apptData[uid];

	var className = uid === this.ALL_APPTS ? "ZButton" : "DwtToolbarButton";
	// dismiss button
	var dismissBtn = this._dismissButtons[uid] = new DwtButton({id: "dismissBtn_" + id, parent: this, className: className, parentElement: data.dismissBtnId});
	dismissBtn.setText(ZmMsg.dismiss);
	dismissBtn.addSelectionListener(dismissListener);
	dismissBtn.apptUid = uid;

	// snoooze button
	var snoozeSelectBtn = this._snoozeSelectButtons[uid] = new DwtButton({id: "snoozeSelectBtn_" + id, parent: this, className: "DwtToolbarButton", parentElement: data.snoozeSelectBtnId});
	snoozeSelectBtn.apptUid = uid;
	snoozeSelectBtn.addDropDownSelectionListener(snoozeSelectButtonListener);

    var snoozeBtn = this._snoozeButtons[uid] = new DwtButton({id: "snoozeBtn_" + id, parent: this, className: className, parentElement: data.snoozeBtnId});
	snoozeBtn.setText(ZmMsg.snooze);
	snoozeBtn.addSelectionListener(snoozeListener);
	snoozeBtn.apptUid = uid;

	var params = {
		parent: this,
		parentElement: data.snoozeSelectInputId,
		type: DwtInputField.STRING,
		errorIconStyle: DwtInputField.ERROR_ICON_NONE,
		validationStyle: DwtInputField.CONTINUAL_VALIDATION,
		className: "DwtInputField ReminderInput"
	};
	var snoozeSelectInput = this._snoozeSelectInputs[uid] = new DwtInputField(params);
	var snoozeSelectInputEl = snoozeSelectInput.getInputElement();
	Dwt.setSize(snoozeSelectInputEl, "120px", "2rem");

	var appt = data.appt;
	this._createSnoozeMenu(snoozeSelectBtn, snoozeSelectInput, snoozeSelectMenuListener, uid === this.ALL_APPTS ? this._list : appt);

	if (uid === this.ALL_APPTS) {
		return;
	}

	// open button
	var openBtn = this._openButtons[uid] = new DwtLinkButton({id: "openBtn_" + id, parent: this, parentElement: data.openLinkId, noDropDown: true});
	openBtn.setText(AjxStringUtil.htmlEncode(appt.getReminderName()));
	openBtn.addSelectionListener(openListener);
	openBtn.apptUid = uid;
};

ZmReminderDialog.prototype._cleanupButtons =
function(buttons) {
	if (!buttons) {
		return;
	}
	for (var id in buttons) {
		buttons[id].dispose();
	}
};

ZmReminderDialog.prototype._contentHtml =
function() {
    return ["<div class='ZmReminderDialog' id='", this._listId, "'>"].join("");
};


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
function(snoozeSelectButton, snoozeSelectInput, menuSelectionListener, apptList) {
    // create menu for button
    var snoozeMenu = new DwtMenu({parent:snoozeSelectButton, style:DwtMenu.DROPDOWN_STYLE});
    snoozeMenu.setSize("150");
    snoozeSelectButton.setMenu(snoozeMenu, true);

	var appts = AjxUtil.toArray(apptList);

    var maxStartDelta = -Infinity; //It was called minStartDelta which was true if you think of the absolute value (as it is negative). But it's actually max.

    if (this._apptType == "task") {
        // Tasks are simpler: No 'before' times allowed, and all fixed times are allowed
        maxStartDelta = 0;
	}
	else {
        for (var i = 0; i < appts.length; i++) {
            var appt = appts[i];
            var startDelta = this._computeDelta(appt);
			maxStartDelta = Math.max(startDelta, maxStartDelta);
        }
		//if maxStartDelta is >= 0, there was at least one appt that is already started, in which case for the aggregate "snooze" we do not show any "before" item
		maxStartDelta = Math.min(maxStartDelta, 0); //don't get positive - we don't care about that later in the loop below. We want max to be 0.
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
        if (ZmReminderDialog.SNOOZE_MSEC[i] >= maxStartDelta) {
            // Found a snooze period to display
            snoozeDisplayValue = ZmReminderDialog.SNOOZE_MINUTES[i];
            if (snoozeDisplayValue == 0) {
                // Set up to add a separator if any 'before' time were added; do the
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
				}
				else {
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
                    snoozeSelectInput.setValue(label);
                    defaultSet = true;
                }
            }
        }
    }

};

ZmReminderDialog.prototype._snoozeSelectButtonListener =
function(ev) {
	ev.item.popup();
};

ZmReminderDialog.prototype._snoozeSelectMenuListener =
function(ev) {
	if (!ev.item || !(ev.item instanceof DwtMenuItem)) {
		return;
	}

	var obj = DwtControl.getTargetControl(ev);
	obj = obj.parent.parent; //get the button - the parent of the menu which is the parent of the menu item which is this target control.
	var uid = obj.apptUid;
	var data = this._apptData[uid];
	if (!data) {
		return;
	}
	this._snoozeSelectInputs[uid].setValue(ev.item.getText());
//  this._snoozeValue = ev.item.getData("value");
};

ZmReminderDialog.prototype._updateDelta =
function(data) {
	var td = document.getElementById(data.deltaId);
	if (td) {
		var startDelta = this._computeDelta(data.appt);

		td.className = startDelta >= 0 ? "ZmReminderOverdue"
						: startDelta > ZmReminderDialog.SOON ? "ZmReminderSoon"
						: "ZmReminderFuture";

		td.innerHTML = startDelta ? this._formatDeltaString(startDelta) : "";
	}
};

/**
 * display the individual actions (snooze, dismiss) only if there's more than one reminder.
 * @private
 */
ZmReminderDialog.prototype._updateIndividualSnoozeActionsVisibility =
function() {
	var appts = this._list.getArray();
	if (appts.length === 0) {
		return; //all snoozed or dismissed, nothing to do here)
	}
	var multiple = appts.length > 1;
	for (var i = 0; i < appts.length; i++) {
		var appt = appts[i];
		var uid = appt.getUniqueId(true);
		var data = this._apptData[uid];
		var actionsRow = document.getElementById(data.actionsRowId);
		actionsRow.style.display = multiple ? "block" : "none";
	}

	//update the all text
	var dismissAllBtn = this._dismissButtons[this.ALL_APPTS];
	dismissAllBtn.setText(multiple ? ZmMsg.dismissAll : ZmMsg.dismiss);
	var snoozeAllBtn = this._snoozeButtons[this.ALL_APPTS];
	snoozeAllBtn.setText(multiple ? ZmMsg.snoozeAllLabel : ZmMsg.snooze);

	var snoozeAllLabelId = this._apptData[this.ALL_APPTS].snoozeAllLabelId;
	var allLabelSpan = document.getElementById(snoozeAllLabelId);
	allLabelSpan.innerHTML = multiple ? ZmMsg.snoozeAll : ZmMsg.snoozeFor;
};


ZmReminderDialog.prototype._addAppt =
function(html, idx, appt, data) {

	var uid = appt.id;
	this._addData(data, uid);

	var calName = (appt.folderId != ZmOrganizer.ID_CALENDAR && appt.folderId != ZmOrganizer.ID_TASKS && this._calController)
		? this._calController.getCalendarName(appt.folderId) : null;


	var calendar = appCtxt.getById(appt.folderId);

	var params = {
		rowId: data.rowId,
		calName: AjxStringUtil.htmlEncode(calName),
		accountName: (appCtxt.multiAccounts && calendar && calendar.getAccount().getDisplayName()),
		location: (AjxStringUtil.htmlEncode(appt.getReminderLocation())),
		apptIconHtml: (AjxImg.getImageHtml(appt.otherAttendees ? "ApptMeeting" : "Appointment")),
		organizer: appt.otherAtt ? appt.organizer : null,
		reminderName: (AjxStringUtil.htmlEncode(appt.getReminderName())),
		durationText: (AjxStringUtil.trim(this._getDurationText(appt))),
		deltaId: data.deltaId,
		openLinkId: data.openLinkId,
		dismissBtnId: data.dismissBtnId,
		snoozeSelectInputId: data.snoozeSelectInputId,
		snoozeSelectBtnId: data.snoozeSelectBtnId,
		snoozeBtnId: data.snoozeBtnId,
		actionsRowId: data.actionsRowId,
        reminderNameContainerId: data.reminderNameContainerId,
        reminderDescContainerId: data.reminderDescContainerId,
        type: appt.type ? appt.type : ZmItem.APPT
	};
	html[idx++] = AjxTemplate.expand("calendar.Calendar#ReminderDialogRow", params);
	return idx;
};

ZmReminderDialog.prototype._addAllSection =
function(html, idx) {

	var uid = this.ALL_APPTS;

	var data = this._apptData[uid] = {};
	this._addData(data, uid);
	data.snoozeAllLabelId = "snoozeAllLabelContainerId_" + uid;

	var params = {
		rowId: data.rowId,
		dismissBtnId: data.dismissBtnId,
		snoozeSelectInputId: data.snoozeSelectInputId,
		snoozeSelectBtnId: data.snoozeSelectBtnId,
		snoozeBtnId: data.snoozeBtnId,
		snoozeAllLabelId: data.snoozeAllLabelId
	};
	html[idx++] = AjxTemplate.expand("calendar.Calendar#ReminderDialogAllSection", params);
	return idx;
};

ZmReminderDialog.prototype._addData =
function(data, uid) {
	data.dismissBtnId = "dismissBtnContainer_" + uid;
	data.snoozeSelectInputId = "snoozeSelectInputContainer_" + uid;
	data.snoozeSelectBtnId = "snoozeSelectBtnContainer_" + uid;
	data.snoozeBtnId = "snoozeBtnContainer_" + uid;
	data.openLinkId = "openLinkContainer_" + uid;
	data.actionsRowId = "actionsRowContainer_" + uid;
	data.deltaId = "delta_" + uid;
	data.rowId = "apptRow_" + uid;
	data.reminderNameContainerId = "reminderNameContainerId_" + uid;
	data.reminderDescContainerId = "reminderDescContainerId_" + uid;
};

ZmReminderDialog.prototype._openButtonListener =
function(ev) {

    appCtxt.getAppController().setStatusMsg(ZmMsg.allRemindersAreSnoozed, ZmStatusView.LEVEL_INFO);

	var obj = DwtControl.getTargetControl(ev);
	var data = this._apptData[obj.apptUid];

	this._snoozeButtonListener(null, true); //do it after getting the obj and data since snoozing gets rid of the elements.

	var appt = data ? data.appt : null;
    var type = appt.type ? appt.type : ZmItem.APPT;
	if (appt && type == ZmItem.APPT) {
		AjxDispatcher.require(["MailCore", "CalendarCore", "Calendar"]);

		var cc = AjxDispatcher.run("GetCalController");

		// the give appt object is a ZmCalBaseItem. We need a ZmAppt
		var newAppt = new ZmAppt();
		for (var i in appt) {
			if (!AjxUtil.isFunction(appt[i])) {
				newAppt[i] = appt[i];
			}
		}
        var mode = newAppt.isRecurring() ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : null;
		var callback = new AjxCallback(cc, cc._showAppointmentDetails, newAppt);
		newAppt.getDetails(mode, callback, null, null, true);
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
	var uid = obj.apptUid;
	var data = this._apptData[uid];
	if (!data) { return; }
	var appts;
	if (uid === this.ALL_APPTS) {
		appts = this._getApptsClone();
	}
	else {
		appts = data.appt; //note - this could be all the appts this._list
	}

	this._reminderController.dismissAppt(appts);

	this._removeAppts(appts);
};

ZmReminderDialog.prototype._cleanupButton =
function(buttons, uid) {
	var button = buttons[uid];
	if (!button) {
		return;
	}
	button.dispose();
	delete buttons[uid];
};

ZmReminderDialog.prototype._removeAppts =
function(appts) {
	appts = AjxUtil.toArray(appts);
	for (i = 0; i < appts.length; i++) {
		this._removeAppt(appts[i]);
	}
	this._updateIndividualSnoozeActionsVisibility();

};

ZmReminderDialog.prototype._removeAppt =
function(appt) {
	var uid = appt.getUniqueId(true);
	var data = this._apptData[uid];

	// cleanup HTML
	this._cleanupButton(this._dismissButtons, uid);
	this._cleanupButton(this._openButtons, uid);
	this._cleanupButton(this._snoozeButtons, uid);
	this._cleanupButton(this._snoozeSelectButtons, uid);
	this._cleanupButton(this._snoozeSelectInputs, uid);

	var row = document.getElementById(data.rowId);
	if (row) {
		var nextRow = row.nextSibling;
		if (nextRow && nextRow.getAttribute("name") === "rdsep") {
			nextRow.parentNode.removeChild(nextRow);
		}
		row.parentNode.removeChild(row);
	}

	delete this._apptData[uid];
	this._list.remove(appt);

	if (this._list.size() === 0) {
		this._cleanupButton(this._dismissButtons, this.ALL_APPTS);
		this._cleanupButton(this._snoozeButtons, this.ALL_APPTS);
		this._cleanupButton(this._snoozeSelectButtons, this.ALL_APPTS);
		this._cleanupButton(this._snoozeSelectInputs, this.ALL_APPTS);
		this.popdown();
	}
};


ZmReminderDialog.prototype._getApptsClone =
function() {
	//make a shallow copy of this_list.getArray(),  so that stuff can work while or after removing things from the _list. This is a must.
	return this._list.getArray().slice(0);
};

ZmReminderDialog.prototype._snoozeButtonListener =
function(ev, all) {

	var data;
	var uid;
	var appts;
	if (all) { //all is true in the case of "open" where we snooze everything artificially
		uid = this.ALL_APPTS;
		appts = this._getApptsClone();
	}
	else {
		var obj = DwtControl.getTargetControl(ev);
		uid = obj.apptUid;
		if (uid === this.ALL_APPTS) {
			appts = this._getApptsClone();
		}
		else {
			data = this._apptData[uid];
			appts = AjxUtil.toArray(data.appt);
		}
	}

	var snoozeString = this._snoozeSelectInputs[uid].getValue();

    // check if all fields are populated w/ valid values
    var errorMsg = [];
    var snoozeInfo = null;
    var beforeAppt = false;
    if (!snoozeString) {
         errorMsg.push(ZmMsg.reminderSnoozeClickNoDuration);
    }
	else {
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
                //Fix for Bug: 80651 - Check for snooze before object
                beforeAppt = snoozeInfo.before;
            }
        }
    }
    if (errorMsg.length > 0) {
        var msg = errorMsg.join("<br>");
        var dialog = appCtxt.getMsgDialog();
        dialog.reset();
        dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
		return;
    }

	var snoozeMinutes = ZmCalendarApp.convertReminderUnits(snoozeInfo.reminderValue, snoozeInfo.reminderUnits);
	this._reminderController.snoozeAppt(appts);
	this._reminderController._snoozeApptAction(appts, snoozeMinutes, beforeAppt);

	this._removeAppts(appts, true);

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
    // Plural
    snoozeUnitStrings[4] = AjxMsg.minutes;
    snoozeUnitStrings[5] = AjxMsg.hours;
    snoozeUnitStrings[6] = AjxMsg.days;
    snoozeUnitStrings[7] = AjxMsg.weeks;

    snoozeString = snoozeString.toLowerCase();
    var found = false;
    for (var i = 0; i < snoozeUnitStrings.length; i++) {
        if (snoozeString.indexOf(snoozeUnitStrings[i].toLowerCase()) >= 0) {
            found = true;
            break;
        }
    }
	return found;
};



ZmReminderDialog.prototype._cancelSnooze =
function() {
	if (this._snoozeActionId) {
		AjxTimedAction.cancelAction(this._snoozeActionId);
		delete this._snoozeActionId;
	}
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
	//I refactored the big nested ternary operator (?:) to make it more readable and try to understand what's the logic here.
	// After doing so, this doesn't make sense to me. But I have no idea if it should be this way on purpose, and that is the way it was with the ?:
	// Basically if there is NO alarmData it uses the appt startTime, which makes sense. But if there IS alarmData but no alarmInstStart it uses the endTime? WHY? What about the startTime?
	// I don't get it. Seems wrong.
	var now = (new Date()).getTime();
	if (!appt.alarmData || appt.alarmData.length === 0) {
		return now - appt.getStartTime();
	}
	var alarmInstStart = appt.alarmData[0].alarmInstStart; //returned from the server in case i'm wondering
	if (alarmInstStart) {
		return now - appt.adjustMS(alarmInstStart, appt.tzo);
	}
	if (!appt.getEndTime()) {
		return null;
	}
	return now - appt.getEndTime();
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


//Bug 65466: Method overridden to remove the ESC button behavior

ZmReminderDialog.prototype.handleKeyAction =
function(actionCode, ev) {
	switch (actionCode) {

		case DwtKeyMap.ENTER:
			this.notifyListeners(DwtEvent.ENTER, ev);
			break;

		case DwtKeyMap.CANCEL:
			// Dont do anything
			break;

		case DwtKeyMap.YES:
			if (this._buttonDesc[DwtDialog.YES_BUTTON]) {
				this._runCallbackForButtonId(DwtDialog.YES_BUTTON);
			}
			break;

		case DwtKeyMap.NO:
			if (this._buttonDesc[DwtDialog.NO_BUTTON]) {
				this._runCallbackForButtonId(DwtDialog.NO_BUTTON);
			}
			break;

		default:
			return false;
	}
	return true;
};
