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
ZmReminderDialog = function(parent, reminderController, calController) {

	// init custom buttons
	var selectId = Dwt.getNextId();
	var html = [];
	var i = 0;
	html[i++] = "<td valign='middle' class='ZmReminderField'>";
	html[i++] = ZmMsg.snoozeAll;
	html[i++] = "</td><td valign='middle' id='";
	html[i++] = selectId;
	html[i++] = "'></td><td valign='middle' id=\"{0}\"></td>";
	
	var snoozeButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.SNOOZE_BUTTON, ZmMsg.snooze, DwtDialog.ALIGN_LEFT, null, html.join(""));
	var dismissAllButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.DISMISS_ALL_BUTTON, ZmMsg.dismissAll, DwtDialog.ALIGN_RIGHT);

	// call base class
	DwtDialog.call(this, {parent:parent, standardButtons:DwtDialog.NO_BUTTONS, extraButtons:[snoozeButton, dismissAllButton]});

	this._reminderController = reminderController;
	this._calController = calController;

	this.setContent(this._contentHtml(selectId));
	this.setTitle(ZmMsg.apptReminders);
	this.registerCallback(ZmReminderDialog.SNOOZE_BUTTON, this._handleSnoozeButton, this);
	this.registerCallback(ZmReminderDialog.DISMISS_ALL_BUTTON, this._handleDismissAllButton, this);
};

ZmReminderDialog.prototype = new DwtDialog;
ZmReminderDialog.prototype.constructor = ZmReminderDialog;


// Consts

ZmReminderDialog.SNOOZE_BUTTON		= ++DwtDialog.LAST_BUTTON;
ZmReminderDialog.DISMISS_ALL_BUTTON	= ++DwtDialog.LAST_BUTTON;
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
        ZmBrowserAlert.getInstance().start(ZmMsg.appointmentReminder);
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
            var delta = this._formatDeltaString(this._computeDelta(appt));
            var text = [appt.getName(), ", ", this._getDurationText(appt), "\n(", delta, ")"].join("");
            if (AjxEnv.isMac) {
                ZmDesktopAlert.getInstance().start(ZmMsg.appointmentReminder, text);
            } else if (AjxEnv.isWindows) {
                winText.push(text);
            }
        }

        if (AjxEnv.isWindows && winText.length > 0) {
            if (appts.length > 5) {
                winText.push(ZmMsg.andMore);
            }
            ZmDesktopAlert.getInstance().start(ZmMsg.appointmentReminder, winText.join("\n"), 5);
        }
    }    
};

ZmReminderDialog.prototype.initialize =
function(list) {
	this._list = list.clone();
	this._apptData = {};

	var html = [];
	var idx = 0;
	var size = list.size();

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
		var data = this._apptData[uid];

		// dismiss button
		var dismissBtn = this._dismissButtons[data.dismissBtnId] = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:data.dismissBtnId});
		dismissBtn.setImage("Cancel");
		dismissBtn.setText(ZmMsg.dismiss);
		dismissBtn.addSelectionListener(dismissListener);
		dismissBtn.apptUid = uid;

		// open button
		var openBtn = this._openButtons[data.openBtnId] = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:data.openBtnId});
		openBtn.setImage(appt.otherAttendees ? "ApptMeeting" : "Appointment");
		openBtn.setText(ZmMsg.viewAppointment);
		openBtn.addSelectionListener(openListener);
		openBtn.apptUid = uid;

		this._updateDelta(data);
	}
};

ZmReminderDialog.prototype._contentHtml =
function(selectId) {
	this._listId = Dwt.getNextId();

	var snooze = [1, 5, 10, 15, 30, 45, 60];
	this._select = new DwtSelect({parent:this});
	var snoozeFormatter = new AjxMessageFormat(ZmMsg.reminderSnoozeMinutes);
	for (var i = 0; i < snooze.length; i++) {
		var label = snoozeFormatter.format(snooze[i]);
		this._select.addOption(label, i==0, snooze[i]);
	}
	this._select.reparentHtmlElement(selectId);

	return ["<div class='ZmReminderDialog' id='", this._listId, "'>"].join("");
};

ZmReminderDialog.prototype._updateDelta = 
function(data) {
	var td = document.getElementById(data.deltaId);
	if (td) {
		var startDelta = this._computeDelta(data.appt);

		if (startDelta >= 0) 							td.className = 'ZmReminderOverdue';
		else if (startDelta > ZmReminderDialog.SOON)	td.className = 'ZmReminderSoon';
		else											td.className = 'ZmReminderFuture';

		td.innerHTML = this._formatDeltaString(startDelta);
	}
};

ZmReminderDialog.prototype._addAppt =
function(html, idx, appt, data, needSep) {

	data.dismissBtnId = Dwt.getNextId();
	data.openBtnId = Dwt.getNextId();
	data.deltaId = Dwt.getNextId();
	data.rowId = Dwt.getNextId();

	var calName = (appt.folderId != ZmOrganizer.ID_CALENDAR && this._calController)
		? this._calController.getCalendarName(appt.folderId) : null;

	var calendar = appCtxt.getById(appt.folderId);

	var params = {
		needSep: needSep,
		rowId: data.rowId,
		calName: calName,
		accountName: (appCtxt.multiAccounts && calendar && calendar.getAccount().getDisplayName()),
		location: appt.getReminderLocation(),
		apptIconHtml: (AjxImg.getImageHtml(appt.otherAttendees ? "ApptMeeting" : "Appointment")),
		organizer: appt.otherAtt ? appt.organizer : null,
		reminderName: (AjxStringUtil.htmlEncode(appt.getReminderName())),
		durationText: (AjxStringUtil.trim(this._getDurationText(appt))),
		deltaId: data.deltaId,
		openBtnId: data.openBtnId,
		dismissBtnId: data.dismissBtnId
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
	if (appt) {
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
	this.popdown();
	var snoozedIds = this._reminderController.snoozeAppt(this._list);
	var list = this._list.clone();
	var snoozeTimedAction = new AjxTimedAction(this, this._snoozeAction, [list]);
	AjxTimedAction.scheduleAction(snoozeTimedAction, this._select.getValue()*60*1000);		
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
	var start = appt._alarmInstStart ? new Date(appt._alarmInstStart) : appt.startDate;
	// bug: 28598 - alarm for recurring appt might still point to old alarm time
	// cannot take endTime directly
	var endTime = appt._alarmInstStart ? (start.getTime() + appt.getDuration()) : appt.getEndTime();
	var end = new Date(endTime);

	if (appt.isAllDayEvent()) {
		end = new Date(endTime - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0));
		var pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		return AjxMessageFormat.format(pattern, [start, end]);
	}
	var pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	return AjxMessageFormat.format(pattern, [start, end, ""]);
};

ZmReminderDialog.prototype._computeDelta =
function(appt) {
	return (appt.alarmData && appt.alarmData.length > 0)
		? ((new Date()).getTime() - appt.adjustMS(appt.alarmData[0].alarmInstStart, appt.tzo))
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
