/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

/**
* show history of the status window
* @param parent			the element that created this view
*/
ZmReminderDialog = function(parent, reminderController, calController) {
	var selectId = Dwt.getNextId();
	var html = new Array(5);
	var i = 0;
    // TODO: i18n
    html[i++] = "<td valign='middle' class='ZmReminderField'>";
	html[i++] = ZmMsg.snoozeAll;
	html[i++] = "</td><td valign='middle' id='";
	html[i++] = selectId;
	html[i++] = "'></td><td valign='middle' id=\"{0}\"></td>";
	
	var snoozeButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.SNOOZE_BUTTON, 
													  ZmMsg.snooze, DwtDialog.ALIGN_LEFT, 
													  null, html.join(""));

	var dismissAllButton = new DwtDialog_ButtonDescriptor(ZmReminderDialog.DISMISS_ALL_BUTTON, 
														   ZmMsg.dismissAll, DwtDialog.ALIGN_RIGHT);														   

	DwtDialog.call(this, {parent:parent, standardButtons:DwtDialog.NO_BUTTONS, extraButtons:[snoozeButton, dismissAllButton]});

	this.setContent(this._contentHtml(selectId));
	this.setTitle(ZmMsg.apptReminders);
	this._reminderController = reminderController;
	this._calController = calController;
	this.registerCallback(ZmReminderDialog.SNOOZE_BUTTON, this._handleSnoozeButton, this);
	this.registerCallback(ZmReminderDialog.DISMISS_ALL_BUTTON, this._handleDismissAllButton, this);
	this._snoozeTimedAction = new AjxTimedAction(this, this._snoozeAction);
	this._active = false;
};

ZmReminderDialog.prototype = new DwtDialog;
ZmReminderDialog.prototype.constructor = ZmReminderDialog;

ZmReminderDialog.SNOOZE_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmReminderDialog.DISMISS_ALL_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmReminderDialog.SOON = -AjxDateUtil.MSEC_PER_FIFTEEN_MINUTES;

// Public methods

ZmReminderDialog.prototype.toString = 
function() {
	return "ZmReminderDialog";
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

ZmReminderDialog.prototype._addAttr = 
function(html, title, value, data) {
	if (value) {
		html.append("<tr width=100% id='", this._rowId(data), "'>");
		html.append("<td align=right style='Zwidth:60px;' class='ZmReminderField'>", title, ":&nbsp;</td>");
		html.append("<td>",AjxStringUtil.htmlEncode(value), "</td>");
		html.append("</tr>");	
	}
};

ZmReminderDialog.prototype._updateDelta = 
function(data) {
	var td = document.getElementById(data.deltaId);
	if (td == null) return;
	
	var startDelta = ZmReminderDialog._computeDelta(data.appt);
    if (startDelta >= 0) {
        td.className = 'ZmReminderOverdue';
    }
    else if (startDelta > ZmReminderDialog.SOON) {
        td.className = 'ZmReminderSoon';
    }
    else {
        td.className = 'ZmReminderFuture';
    }
    td.innerHTML = ZmReminderDialog._formatReminderString(startDelta);
};

ZmReminderDialog.prototype._rowId = 
function(data) {
	var id = Dwt.getNextId();
	data.rowIds.push(id);
	return id;
};

ZmReminderDialog.prototype._addAppt = 
function(html, appt, data, needSep) {

	var startDelta = ZmReminderDialog._computeDelta(appt);
	data.buttonId = Dwt.getNextId();
	data.deltaId = Dwt.getNextId();
	data.rowIds = [];

	var cal = appt.folderId != ZmOrganizer.ID_CALENDAR && this._calController
			? this._calController.getCalendar(appt.folderId) : null;
	
	if (needSep) html.append("<tr id='", this._rowId(data), "'><td colspan=4><div class=horizSep></div></td></tr>");
	html.append("<tr width=100% id='", this._rowId(data), "'>");
	html.append("<td colspan=2>");
	html.append("<table cellpadding=0 cellspacing=0 border=0><tr>");
	html.append("<td width=25px>", AjxImg.getImageHtml(appt.hasOtherAttendees() ? "ApptMeeting" : "Appointment"), "</td>");
	html.append("<td><b>",  AjxStringUtil.htmlEncode(appt.getName()), "</b> (", appt.getDurationText(false, false),")</td>");
	html.append("</tr></table>");
	html.append("</td>");
	html.append("<td id='", data.deltaId, "'></td>");
	html.append("<td align=right id='", data.buttonId, "'></td>");	
	html.append("</tr>");
	if (appt.hasOtherAttendees()) this._addAttr(html, ZmMsg.status, appt.getParticipantStatusStr(), data);
	if (cal) this._addAttr(html, ZmMsg.calendar, cal.getName(), data);	
	this._addAttr(html, ZmMsg.location, appt.getLocation(), data);
};
 
ZmReminderDialog.prototype.initialize = 
function(list) {
	this._list = list.clone();
	this._apptData = {};
	
	var html = new AjxBuffer();

	var formatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.SHORT, AjxDateFormat.MEDIUM);
	
	var size = list.size();

	html.append("<table cellpadding=0 cellspacing=0 border=0 width=100%>");
	for (var i=0; i < size; i++) {
		var appt = list.get(i);
		var data = this._apptData[appt.getUniqueId(true)] = { appt: appt};
		this._addAppt(html, appt, data, i > 0);
	}
	html.append("</table>");
	
	var div = document.getElementById(this._listId);
	div.innerHTML = html.toString();
	for (var i=0; i < size; i++) {
		var appt = list.get(i);
		var uid = appt.getUniqueId(true);		
		var data = this._apptData[uid];
		var button = new DwtButton({parent:this, style:DwtLabel.ALIGN_CENTER, className:"DwtToolbarButton"});
		button.setImage("Cancel");
		button.addSelectionListener(new AjxListener(this, this._closeButtonListener));
		button.__apptUniqueId = uid;
		//button.setToolTipContent(ZmMsg.dismissReminderToolTip);
		document.getElementById(data.buttonId).appendChild(button.getHtmlElement());
		this._updateDelta(data);
	}
};


// Button listener that checks for callbacks
ZmReminderDialog.prototype._closeButtonListener =
function(ev, args) {
	var obj = DwtControl.getTargetControl(ev);
	var buttonId = obj.buttonId;
	
	var size = this._list ? this._list.size() : 0;
	for (var i=0; i < size; i++) {
		var appt = this._list.get(i);
		var uid = appt.getUniqueId(true);
		if (uid == obj.__apptUniqueId) {
			var data = this._apptData[uid];
			this._reminderController.dismissAppt(data.appt);
			if (!data) break;
			var rowIds = data.rowIds;
			for (var j=0; j < rowIds.length; j++) {
				var row = document.getElementById(rowIds[j]);
				if (row) row.parentNode.removeChild(row);
			}
			delete this._apptData[uid];
			// if size was 1, then we need to popdown
			if (size == 1) this.popdown();
			else if (size > 1 && i == 0) {
				// remove separator, since this is now the first item in list
				appt = this._list.get(1);
				var data = this._apptData[appt.getUniqueId(true)];
				var seprow = document.getElementById(data.rowIds.shift());
				if (seprow) seprow.parentNode.removeChild(seprow);
			}
			this._list.removeAt(i);
			break;
		}
	}
};

ZmReminderDialog.prototype._snoozeAction =
function() {
	if (!this.isPoppedUp()) {
		for (var id in this._apptData) {
			this._updateDelta(this._apptData[id]);
		}
		this.popup();
	}
};

ZmReminderDialog.prototype.popup =
function() {
	DwtDialog.prototype.popup.call(this);
	this._cancelSnooze();
};

ZmReminderDialog._computeDelta =
function(appt) {
	return (new Date()).getTime() - appt.getStartTime();
};

ZmReminderDialog.prototype._handleSnoozeButton =
function() {
	this._snoozeActionId = AjxTimedAction.scheduleAction(this._snoozeTimedAction, this._select.getValue()*60*1000);
	this.popdown();
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
	// dismiss all of them
	var size = this._list.size();
	for (var i=0; i < size; i++) {
		var appt = this._list.get(i);
		this._reminderController.dismissAppt(appt);
	}
};
	
ZmReminderDialog._formatReminderString =
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
