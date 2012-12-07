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
ZmQuickReminderDialog = function(parent, reminderController, calController) {

	// init custom buttons
	var selectId = Dwt.getNextId();
	// call base class
	DwtDialog.call(this, {parent:parent, standardButtons: [DwtDialog.OK_BUTTON]});

	this._reminderController = reminderController;
	this._calController = calController;

	this.setContent(this._contentHtml(selectId));
	this.setTitle(ZmMsg.currentMeetings);
};

ZmQuickReminderDialog.prototype = new DwtDialog;
ZmQuickReminderDialog.prototype.constructor = ZmQuickReminderDialog;


ZmQuickReminderDialog.SOON = -AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES;


// Public methods

ZmQuickReminderDialog.prototype.toString = 
function() {
	return "ZmQuickReminderDialog";
};

ZmQuickReminderDialog.prototype.popup =
function() {
	DwtDialog.prototype.popup.call(this);
};

ZmQuickReminderDialog.prototype.initialize =
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
    if(size == 0) {
        html[idx++] = '<tr name="rdsep">';
		html[idx++] = '<td colspan=3><div>' + ZmMsg.noMeetingsFound + '</div></td>';
		html[idx++] = '</tr>';
    }
	html[idx++] = "</table>";

	
	if (this._openButtons) {
		for (var id in this._openButtons) {
			this._openButtons[id].dispose();
		}
	}
	this._openButtons = {};

	var openListener = new AjxListener(this, this._openButtonListener);
	var div = document.getElementById(this._listId);
	div.innerHTML = html.join("");

	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		var uid = appt.getUniqueId(true);
		var data = this._apptData[uid];

		// open button
		var openBtn = this._openButtons[data.openBtnId] = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:data.openBtnId});
		openBtn.setImage(appt.otherAttendees ? "ApptMeeting" : "Appointment");
		openBtn.setText(ZmMsg.viewAppointment);
		openBtn.addSelectionListener(openListener);
		openBtn.apptUid = uid;

		this._updateDelta(data);
	}
};

ZmQuickReminderDialog.prototype._contentHtml =
function(selectId) {
	this._listId = Dwt.getNextId();
	return ["<div class='ZmQuickReminderDialog' id='", this._listId, "'>"].join("");
};

ZmQuickReminderDialog.prototype._updateDelta = 
function(data) {
	var td = document.getElementById(data.deltaId);
	if (td) {
		var startDelta = this._computeDelta(data.appt);

		if (startDelta >= 0) 							td.className = 'ZmReminderOverdue';
		else if (startDelta > ZmQuickReminderDialog.SOON)	td.className = 'ZmReminderSoon';
		else											td.className = 'ZmReminderFuture';

		td.innerHTML = this._formatDeltaString(startDelta);
	}
};

ZmQuickReminderDialog.prototype._addAppt =
function(html, idx, appt, data, needSep) {

	data.openBtnId = Dwt.getNextId();
	data.deltaId = Dwt.getNextId();
	data.rowId = Dwt.getNextId();

	var calName = (appt.folderId != ZmOrganizer.ID_CALENDAR && this._calController)
		? this._calController.getCalendarName(appt.folderId) : null;

	var calendar = appCtxt.getById(appt.folderId);

    var apptLabel = appt.isUpcomingEvent ? " (" + ZmMsg.upcoming + ")" : ""

	var params = {
		needSep: needSep,
		rowId: data.rowId,
		calName: calName,
		accountName: (appCtxt.multiAccounts && calendar && calendar.getAccount().getDisplayName()),
		location: appt.getLocation(),
		apptIconHtml: (AjxImg.getImageHtml(appt.otherAttendees ? "ApptMeeting" : "Appointment")),
		organizer: appt.otherAtt ? appt.organizer : null,
		reminderName: (AjxStringUtil.htmlEncode(appt.name + apptLabel)),
		durationText: (AjxStringUtil.trim(this._getDurationText(appt))),
		deltaId: data.deltaId,
		openBtnId: data.openBtnId
	};
	html[idx++] = AjxTemplate.expand("calendar.Calendar#ReminderDialogRow", params);
	return idx;
};

ZmQuickReminderDialog.prototype._openButtonListener =
function(ev) {

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
        this.popdown();
	}
};

ZmQuickReminderDialog.prototype._getDurationText =
function(appt) {
	var isMultiDay = appt.isMultiDay();
	var start = appt.startDate;
	var endTime = appt.getEndTime();
	var end = new Date(endTime);

	if (appt.isAllDayEvent()) {
		end = new Date(endTime - (isMultiDay ? 2 * AjxDateUtil.MSEC_PER_HOUR : 0));
		var pattern = isMultiDay ? ZmMsg.apptTimeAllDayMulti : ZmMsg.apptTimeAllDay;
		return AjxMessageFormat.format(pattern, [start, end]);
	}
	var pattern = isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance;
	return AjxMessageFormat.format(pattern, [start, end, ""]);
};

ZmQuickReminderDialog.prototype._computeDelta =
function(appt) {
	return ((new Date()).getTime() - appt.getStartTime());
};
	
ZmQuickReminderDialog.prototype._formatDeltaString =
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
