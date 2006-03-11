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
* Class encompasing an invite to a calendar appt.
* @constructor
* @class
* 
* @author
*/
function ZmInvite() {
	ZmModel.call(this);
};

ZmInvite.prototype = new ZmModel;
ZmInvite.prototype.constructor = ZmInvite;

ZmInvite.prototype.toString = 
function() {
	return "ZmInvite: name=" + this.name + " id=" + this.id;
};

/**
 * function that will be used to send requests.
 * This should be set via ZmInvite.setSendFunction.
 */
ZmInvite._sendFun = null;

// Class methods
ZmInvite.createFromDom = 
function(node) {
	var invite = new ZmInvite();
	invite.components = node[0].comp;
	// not sure why components are null .. but.
	if (invite.components == null) {
		invite.components = [{}];
		invite.components.empty = true;
	}
	return invite;
};

ZmInvite.prototype.setMessageId = 
function (id) {
	this.msgId = id;
};

/*
 * mail item id on appt instance
 */
ZmInvite.prototype.getMessageId = 
function() {
	return this.msgId;
};

ZmInvite.prototype.getComponent = 
function(id) {
	return this.components[id];
};

ZmInvite.prototype.getComponents = 
function () {
	return this.components;
};

ZmInvite.prototype.getComponentByUid = 
function(uid) {
	for (var i = 0 ; i < components.length ; ++i) {
		if (components.uid == uid) {
			break;
		}
	}
};

ZmInvite.prototype.hasMultipleComponents = 
function() {
	return (this.components.length > 1);
};

ZmInvite.prototype.hasOtherAttendees =
function(compNum) {
	var component = this.components[compNum];
	return component.at && component.at.length > 0;
};

ZmInvite.prototype.getEventName = 
function(compNum) {
	return this.components[compNum] ? this.components[compNum].name : null;
};

ZmInvite.prototype.getOrganizerEmail = 
function(compNum) {
	if (this.components[compNum] != null &&
		this.components[compNum].or != null &&
		this.components[compNum].or.url != null) 
	{
		return this.components[compNum].or.url.replace("MAILTO:", "");
	}
	return null;
};

ZmInvite.prototype.getOrganizerName = 
function(compNum) {
	var org = null;
	if (this.components[compNum] != null &&
		this.components[compNum].or != null) 
	{
		org = this.components[compNum].or.d;
		if (org == null || org == "")
			org = this.components[compNum].or.url;
	}
	return org;
};

ZmInvite.prototype.isOrganizer = 
function(compNum) {
	if (this.components[compNum] != null) {
		return ((this.components[compNum].isOrg != null) ? this.components[compNum].isOrg : false);
	}
	return false;
};

ZmInvite.prototype.shouldRsvp =
function (compNum){
	return this.components[compNum] != null 
		? this.components[compNum].rsvp 
		: null;
};

ZmInvite.prototype.getRecurrenceRules = 
function(compNum) {
	return this.components[compNum].recur;
};

ZmInvite.prototype.getAttendees =
function(compNum) {
	compNum = compNum || 0;
	return this.components[compNum].at;
};

ZmInvite.prototype.getStatus =
function(compNum) {
	compNum = compNum || 0;
	return this.components[compNum].status;
};

ZmInvite.prototype.isEmpty =
function() {
	return Boolean(this.components.empty);
};

ZmInvite.prototype.isException = 
function(compNum) {
	return this.components[compNum] != null 
		? this.components[compNum].ex 
		: false;
};

ZmInvite.prototype.isRecurring =
function(compNum) {
	var component = this.components[compNum];
	return component.recur;
};

ZmInvite.prototype.isAllDayEvent = 
function(compNum) { 
	var component = this.components[compNum];
	return component.allDay == "1"; 
};

ZmInvite.prototype.isMultiDay =
function(compNum) {
	var sd = this.getServerStartDate(compNum);
	var ed = this.getServerEndDate(compNum);
	return (sd.getDate() != ed.getDate()) || (sd.getMonth() != ed.getMonth()) || (sd.getFullYear() != ed.getFullYear());
};

ZmInvite.prototype.getServerEndTime = 
function(compNum) {
	if (this.components[compNum] == null) return;

	if (this._serverEndTime == null) {
		if (this.components[compNum].e != null ) {
			this._serverEndTime = this.components[compNum].e[0].d;
		} else {
			// get the duration
			var dd = this.components[compNum].dur[0].d || 0;
			var weeks = this.components[compNum].dur[0].w || 0;
			var hh = this.components[compNum].dur[0].h || 0;
			var mm = this.components[compNum].dur[0].m || 0;
			var ss = this.components[compNum].dur[0].s || 0;
			var t = parseInt(ss) + (parseInt(mm) * 60) + (parseInt(hh) * 3600) + (parseInt(dd) * 24 * 3600) + (parseInt(weeks) * 7 * 24 * 3600);
			// parse the start date
			var start = this.components[compNum].s[0].d;
			var yyyy = parseInt(start.substr(0,4), 10);
			var MM = parseInt(start.substr(4,2), 10);
			var dd = parseInt(start.substr(6,2), 10);
			var d = new Date(yyyy, MM -1, dd);
			if (start.charAt(8) == 'T') {
				var hh = parseInt(start.substr(9,2), 10);
				var mm = parseInt(start.substr(11,2), 10);
				var ss = parseInt(start.substr(13,2), 10);
				d.setHours(hh, mm, ss, 0);
			}
			// calculate the end date -- start + offset;
			var endDate = new Date(d.getTime() + (t * 1000));

			// put the end date into server DURATION format.
			MM = AjxDateUtil._pad(d.getMonth() + 1);
			dd = AjxDateUtil._pad(d.getDate());
			hh = AjxDateUtil._pad(d.getHours());
			mm = AjxDateUtil._pad(d.getMinutes());
			ss = AjxDateUtil._pad(d.getSeconds());
			yyyy = d.getFullYear();
			this._serverEndTime = [yyyy,MM,dd,"T",hh,mm,ss].join("");
		}
	}
	return this._serverEndTime;
};
ZmInvite.prototype.getServerEndDate =
function(compNum) {
	if (this._serverEndDate == null) {
		var time = this.getServerEndTime(compNum);
		this._serverEndDate = AjxDateUtil.parseServerDateTime(time);
	}
	return this._serverEndDate;
};

ZmInvite.prototype.getServerStartTime = 
function(compNum) {
	return this.components[compNum] != null
		? this.components[compNum].s[0].d
		: null;
};
ZmInvite.prototype.getServerStartDate =
function(compNum) {
	if (this._serverStartDate == null) {
		var time = this.getServerStartTime(compNum);
		this._serverStartDate = AjxDateUtil.parseServerDateTime(time);
	}
	return this._serverStartDate;
};

ZmInvite.prototype.getServerStartTimeTz = 
function(compNum) {
	if (this.components[compNum] == null) return;

	if (this._serverStartTimeZone == null) {
		var startTime = this.getServerStartTime();
		this._serverStartTimeZone = startTime && startTime.charAt(startTime.length -1) == 'Z'
			? ZmTimezones.GMT
			: this.components[compNum].s[0].tz;
	}
	return this._serverStartTimeZone;
};

ZmInvite.prototype.getServerEndTimeTz = 
function(compNum) {
	if (this.components[compNum] == null) return;

	if (this._serverEndTimeZone == null) {
		var endTime = this.getServerEndTime();
		this._serverEndTimeZone = endTime && startTime.charAt(endTime.length -1) == 'Z'
			? ZmTimezones.GMT
			: this.components[compNum].e[0].tz;
	}
	return this._serverEndTimeZone;
};

ZmInvite.prototype.getDurationText =
function(compNum, emptyAllDay,startOnly) {
	var component = this.components[compNum];
	if (this.isAllDayEvent(compNum)) {
		if (emptyAllDay) {
			return "";
		}

		var sd = this.getServerStartDate(compNum);
		if (this.isMultiDay(compNum)) {
			var ed = this.getServerEndDate(compNum);
			
			var dateFormatter = AjxDateFormat.getDateInstance();
			var startDay = dateFormatter.format(sd);
			var endDay = dateFormatter.format(ed);
			
			if (!ZmInvite._daysFormatter) {
				ZmInvite._daysFormatter = new AjxMessageFormat(ZmMsg.durationDays);
			}
			return ZmInvite._daysFormatter.format( [ startDay, endDay ] );
		} 
		else {
			var dateFormatter = AjxDateFormat.getDateInstance(AjxDateFormat.FULL);
			return dateFormatter.format(sd);
		}

	} 
	else {
		var dateFormatter = AjxDateFormat.getDateInstance(AjxDateFormat.FULL);
		var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);

		var sd = this.getServerStartDate(compNum);

		var a = [ dateFormatter.format(sd), "<br>" ];
		if (startOnly) {
			a.push(timeFormatter.format(sd));
		} 
		else {
			var ed = this.getServerEndDate(compNum);
		
			var startHour = timeFormatter.format(sd);
			var endHour = timeFormatter.format(ed);
			
			if (!ZmInvite._hoursFormatter) {
				ZmInvite._hoursFormatter = new AjxMessageFormat(ZmMsg.durationHours);
			}
			a.push(ZmInvite._hoursFormatter.format( [ startHour, endHour ] ));
		}
		return a.join("");
	}
};

ZmInvite.prototype.getName = 
function(compNum) {
	return this.components[compNum] != null
		? this.components[compNum].name
		: null;
};

ZmInvite.prototype.getFreeBusy =
function(compNum) {
	return this.components[compNum] != null
		? this.components[compNum].fb
		: null;
};

ZmInvite.prototype.getLocation =
function(compNum) {
	return this.components[compNum] != null
		? this.components[compNum].loc
		: null;
};

/** 
 * Returns HTML for a tool tip for this invite. 
 * <p>
 * <strong>Note:</strong>
 * This method assumes that there are currently one and only one
 * component object on the invite.
 */
ZmInvite.prototype.getToolTip =
function(/*calController*/) {
	if (!this._toolTip) {
		var compNum = 0;
		
		var html = new Array(20);
		var idx = 0;
		
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 >";
		html[idx++] = "<tr valign='center'><td colspan=2 align='left'>";
		html[idx++] = "<div style='border-bottom: 1px solid black;'>";
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>";
		
		// IMGHACK - added outer table for new image changes...
		html[idx++] = "<div style='white-space:nowrap'><table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";
		if (this.hasOtherAttendees(compNum)) {
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptMeeting") + "</td>";
		}
		
		if (this.isException(compNum)) {
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptException") + "</td>";
		}
		else if (this.isRecurring(compNum)) {
			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptRecur") + "</td>";
		}
			
//		if (this.hasAlarm()) 
//			html[idx++] = "<td>" + AjxImg.getImageHtml("ApptReminder") + "</td>";

		html[idx++] = "</tr></table>";
		
		html[idx++] = "&nbsp;";
		html[idx++] = AjxStringUtil.htmlEncode(this.getName(compNum));
		html[idx++] = "&nbsp;</div></b></td>";	
		html[idx++] = "<td align='right'>";

		/***
		var cal = this.getFolderId() != ZmOrganizer.ID_CALENDAR && calController
			? calController.getCalendar(this.getFolderId()) : null;
		/***/
		var cal = null;
		/***/

		html[idx++] = cal && cal.link
			? AjxImg.getImageHtml("GroupSchedule")
			: AjxImg.getImageHtml("Appointment");
					
		html[idx++] = "</td>";
		html[idx++] = "</table>";
		html[idx++] = "</div></td></tr>";
		//idx = this._addEntryRow(ZmMsg.meetingStatus, this.getStatusString(), html, idx, false);

		if (cal) {
			idx = this._addEntryRow(ZmMsg.calendar, cal.getName(compNum), html, idx, false);
		}

		/***
		if (this.hasOtherAttendees())
			idx = this._addEntryRow(ZmMsg.status, this.getParticipationStatusString(), html, idx, false);		
		/***/

		var when = this.getDurationText(compNum, false, false);
		idx = this._addEntryRow(ZmMsg.when, when, html, idx, false, null, true);		
		if (this.isRecurring(compNum)) {
			var recurrences = this.getRecurrenceRules(compNum);
			var startDate = this.getServerStartDate(compNum);
			var repeats = ZmApptViewHelper.getRecurrenceDisplayString(recurrences, startDate);
			idx = this._addEntryRow(ZmMsg.repeats, repeats, html, idx, false, null, true);		
		}
		idx = this._addEntryRow(ZmMsg.location, this.getLocation(compNum), html, idx, false);
		//idx = this._addEntryRow(ZmMsg.notes, this.getFragment(), html, idx, true, "250");

		html[idx++] = "</table>";
		this._toolTip = html.join("");
	}
	return this._toolTip;
};

/** Adds a row to the tool tip. */
ZmInvite.prototype._addEntryRow =
function(field, data, html, idx, wrap, width, asIs) {
	if (data != null && data != "") {
		html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b><div style='white-space:nowrap'>";
		html[idx++] = AjxStringUtil.htmlEncode(field) + ":";
		html[idx++] = "</div></b></td><td align='left'><div style='white-space:";
		html[idx++] = wrap ? "wrap;" : "nowrap;";
		if (width) html[idx++] = "width:"+width+"px;";
		html[idx++] = "'>";
		html[idx++] = asIs ? data : AjxStringUtil.htmlEncode(data);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
};
