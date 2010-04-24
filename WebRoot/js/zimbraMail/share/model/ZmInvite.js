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
 * @overview
 * This file defines a calendar appointment invite.
 *
 */

/**
 * Creates an invite.
 * @class
 * This class represents an invite to a calendar appointment.
 * 
 * @extends	ZmModel
 */
ZmInvite = function() {
	ZmModel.call(this);
};

ZmInvite.prototype = new ZmModel;
ZmInvite.prototype.constructor = ZmInvite;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmInvite.prototype.toString = 
function() {
	return "ZmInvite: name=" + this.name + " id=" + this.id;
};

/**
 * Function that will be used to send requests. This should be set via ZmInvite.setSendFunction.
 * 
 * @private
 */
ZmInvite._sendFun = null;

// Class methods

/**
 * Creates the invite from the DOM.
 * 
 * @param	{Object}	node	the node
 * @return	{ZmInvite}	the newly created invite
 */
ZmInvite.createFromDom = 
function(node) {
	var invite = new ZmInvite();
	invite.components = node[0].comp;
	invite.replies = node[0].replies;
	// not sure why components are null .. but.
	if (invite.components == null) {
		invite.components = [{}];
		invite.components.empty = true;
	}
    var inv = node[0];
    if (inv.tz) {
        for (var i = 0; i < inv.tz.length; i++) {
            // get known rule
            var tz = inv.tz[i];
            var rule = AjxTimezone.getRule(tz.id);

            // get known rule that exactly matches tz definition
            if (!rule) {
                var tzrule = {
                    standard: tz.standard ? AjxUtil.createProxy(tz.standard[0]) : {},
                    daylight: tz.daylight ? AjxUtil.createProxy(tz.daylight[0]) : null
                };
                tzrule.standard.offset = tz.stdoff;
                delete tzrule.standard._object_;
                if (tz.daylight) {
                    tzrule.daylight.offset = tz.dayoff;
                    delete tzrule.daylight._object_;
                }

                rule = AjxTimezone.getRule(tz.id, tzrule);
                if (rule) {
                    var alias = AjxUtil.createProxy(rule);
                    alias.aliasId = rule.clientId;
                    alias.clientId = tz.id;
                    alias.serverId = tz.id;
                    AjxTimezone.addRule(alias);
                }
            }

            // add custom rule to known list
            if (!rule) {
                rule = { clientId: tz.id, serverId: tz.id, autoDetected: true };
                if (tz.daylight) {
                    rule.standard = AjxUtil.createProxy(tz.standard[0]);
                    rule.standard.offset = tz.stdoff;
                    rule.standard.trans = AjxTimezone.createTransitionDate(rule.standard);
                    
                    rule.daylight = AjxUtil.createProxy(tz.daylight[0]);
                    rule.daylight.offset = tz.dayoff;
                    rule.daylight.trans = AjxTimezone.createTransitionDate(rule.daylight);
                }
                else {
                    rule.standard = { offset: tz.stdoff };
                }
                AjxTimezone.addRule(rule);
            }
        }
    }
	invite.type = inv && inv.type ? inv.type : "appt";
	return invite;
};

/**
 * Sets the message id.
 * 
 * @param	{String}	id		the message id
 */
ZmInvite.prototype.setMessageId = 
function (id) {
	this.msgId = id;
};

/**
 * Gets the message id.
 * 
 * @return	{String}	the message id
 */
ZmInvite.prototype.getMessageId = 
function() {
	return this.msgId;
};

/**
 * Gets the component.
 * 
 * @param	{String}	id	the component id
 * @return	{Object}	the component
 */
ZmInvite.prototype.getComponent = 
function(id) {
	return this.components[id];
};

/**
 * Gets the components.
 * 
 * @return	{Array}	an array of components
 */
ZmInvite.prototype.getComponents = 
function () {
	return this.components;
};

/**
 * Gets the component by uid.
 * 
 * @param	{String}	uid		the component uid
 * @return	{Object}	the component
 */
ZmInvite.prototype.getComponentByUid = 
function(uid) {
	for (var i = 0 ; i < components.length ; ++i) {
		if (components.uid == uid) {
			break;
		}
	}
};

/**
 * Checks if the invite has multiple components.
 * 
 * @return	{Boolean}	<code>true</code> if the invite has one or more components
 */
ZmInvite.prototype.hasMultipleComponents = 
function() {
	return (this.components.length > 1);
};

/**
 * Checks if the invite has other attendees.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite has more than one other attendee
 */
ZmInvite.prototype.hasOtherAttendees =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].at && this.components[cn].at.length > 0;
};

/**
 * Gets the event name.
 *  
 * @param	{int}	compNum		the component number
 * @return	{String}	the name or <code>null</code> for none
 */
ZmInvite.prototype.getEventName = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].name : null;
};

/**
 * Gets the alarm.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the alarm or <code>null</code> for none
 */
ZmInvite.prototype.getAlarm = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].alarm : null;
};

/**
 * Gets the invite method.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String} the method or <code>null</code> for none
 */
ZmInvite.prototype.getInviteMethod =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].method : null;
};

/**
 * Gets the organizer email.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the organizer email or <code>null</code> for none
 */
ZmInvite.prototype.getOrganizerEmail =
function(compNum) {
	var cn = compNum || 0;
	return (this.components[cn] && this.components[cn].or && this.components[cn].or.url)
		? (this.components[cn].or.url.replace("MAILTO:", "")) : null;
};

/**
 * Gets the organizer name.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the organizer name or <code>null</code> for none
 */
ZmInvite.prototype.getOrganizerName = 
function(compNum) {
	var cn = compNum || 0;
	return (this.components[cn] && this.components[cn].or)
		? (this.components[cn].or.d || this.components[cn].or.url) : null;
};

/**
 * Gets the sent by.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the sent by or <code>null</code> for none
 */
ZmInvite.prototype.getSentBy =
function(compNum) {
	var cn = compNum || 0;
	return (this.components[cn] && this.components[cn].or)
		? this.components[cn].or.sentBy : null;
};

/**
 * Checks if is organizer.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if is organizer
 */
ZmInvite.prototype.isOrganizer =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? (!!this.components[cn].isOrg) : false;
};

/**
 * Gets the RSVP.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the RSVP or <code>null</code> for none
 */
ZmInvite.prototype.shouldRsvp =
function(compNum){
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].rsvp : null;
};

/**
 * Gets the recurrence.
 * 
 * @param	{int}	compNum		the component number
 * @return	{ZmRecurrence}	the recurrence
 */
ZmInvite.prototype.getRecurrenceRules = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].recur;
};

/**
 * Gets the attendees.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Array}	an array of attendees or an empty array for none
 */
ZmInvite.prototype.getAttendees =
function(compNum) {
	var cn = compNum || 0;
	var att = this.components[cn].at;
	var list = [];

	if (!(att && att.length)) return list;

	for (var i = 0; i < att.length; i++) {
		if (!att[i].cutype || (att[i].cutype == ZmCalendarApp.CUTYPE_INDIVIDUAL)) {
			list.push(att[i]);
		}
	}
	return list;
};

/**
 * Gets the replies.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the reply
 */
ZmInvite.prototype.getReplies =
function(compNum) {
	var cn = compNum || 0;
	return (this.replies && this.replies[cn]) ? this.replies[cn].reply : null;
};

/**
 * Gets the resources.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Array}	an array of resources
 */
ZmInvite.prototype.getResources =
function(compNum) {
	var cn = compNum || 0;
	var att = this.components[cn].at;
	var list = [];

	if (!(att && att.length)) return list;

	for (var i = 0; i < att.length; i++) {
		if (att[i].cutype == ZmCalendarApp.CUTYPE_RESOURCE) {
			list.push(att[i]);
		}
	}
	return list;
};

/**
 * Gets the except id.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the except id
 */
ZmInvite.prototype.getExceptId =
function(compNum) {
	var cn = compNum || 0;
	return (this.components[cn] && this.components[cn].exceptId) ? this.components[cn].exceptId[0] : null;
};

/**
 * Gets the status.
 * 
 * @param	{int}	compNum		the component number
 * @return {String}	the status
 */
ZmInvite.prototype.getStatus =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].status;
};

/**
 * Checks if the invite is empty.
 * 
 * @return	{Boolean}	<code>true</code> if the invite is empty
 */
ZmInvite.prototype.isEmpty =
function() {
	return Boolean(this.components.empty);
};

/**
 * Checks if the invite is an exception.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if exception
 */
ZmInvite.prototype.isException = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].ex : false;
};

/**
 * Checks if the invite is recurring.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if recurring
 * @see		#getRecurrenceRules
 */
ZmInvite.prototype.isRecurring =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].recur : false;
};

/**
 * Checks if the invite is an all day event.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if an all day event
 */
ZmInvite.prototype.isAllDayEvent = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].allDay == "1" : false;
};

/**
 * Checks if the invite is multi-day.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite is multi-day
 */
ZmInvite.prototype.isMultiDay =
function(compNum) {
	var cn = compNum || 0;
	var sd = this.getServerStartDate(cn);
	var ed = this.getServerEndDate(cn);
	return (sd.getDate() != ed.getDate()) || (sd.getMonth() != ed.getMonth()) || (sd.getFullYear() != ed.getFullYear());
};

/**
 * Gets the description html.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the description html or <code>null</code> for none
 */
ZmInvite.prototype.getComponentDescriptionHtml =
function(compNum) {
    var cn = compNum || 0;    
    if (this.components[cn] == null) return;
	var desc = this.components[cn].descHtml;
	var content = desc && desc[0]._content || null;
    if(!content)
        content = this.getSummary(true);
	return content;
};

/**
 * Gets the description.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the description or <code>null</code> for none
 */
ZmInvite.prototype.getComponentDescription =
function(compNum) {
    var cn = compNum || 0;    
    if (this.components[cn] == null) return;
	var desc = this.components[cn].desc;
	var content = desc && desc[0]._content || null;
    if(!content)
        content = this.getSummary();
	return content;
};

/**
 * Gets the server end time.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the end time
 */
ZmInvite.prototype.getServerEndTime =
function(compNum) {
	var cn = compNum || 0;
	if (this.components[cn] == null) return;

	if (this._serverEndTime == null) {
		if (this.components[cn].e != null ) {
			this._serverEndTime = this.components[cn].e[0].d;
		} else if (this.components[cn].s) {
			// get the duration
			var dur	= this.components[cn].dur;
			var dd		= dur && dur[0].d || 0;
			var weeks	= dur && dur[0].w || 0;
			var hh		= dur && dur[0].h || 0;
			var mm		= dur && dur[0].m || 0;
			var ss		= dur && dur[0].s || 0;
			var t = parseInt(ss) + (parseInt(mm) * 60) + (parseInt(hh) * 3600) + (parseInt(dd) * 24 * 3600) + (parseInt(weeks) * 7 * 24 * 3600);
			// parse the start date
			var start = this.components[cn].s[0].d;
			var yyyy = parseInt(start.substr(0,4), 10);
			var MM = parseInt(start.substr(4,2), 10);
			var dd = parseInt(start.substr(6,2), 10);
			var d = new Date(yyyy, MM -1, dd);
			if (start.charAt(8) == 'T') {
				hh = parseInt(start.substr(9,2), 10);
				mm = parseInt(start.substr(11,2), 10);
				ss = parseInt(start.substr(13,2), 10);
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

/**
 * Gets the server end date.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Date}	the end date
 */
ZmInvite.prototype.getServerEndDate =
function(compNum) {
	var cn = compNum || 0;
	if (this._serverEndDate == null) {
		this._serverEndDate = AjxDateUtil.parseServerDateTime(this.getServerEndTime(cn));
	}
	return this._serverEndDate;
};

/**
 * Gets the server start time.
 *
 * @param	{int}	compNum		the component number
 * @return	{Date}	the start time
 */
ZmInvite.prototype.getServerStartTime = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] && this.components[cn].s
		? this.components[cn].s[0].d : null;
};

/**
 * Gets the server start date.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Date}	the start date
 */
ZmInvite.prototype.getServerStartDate =
function(compNum) {
	var cn = compNum || 0;
	if (this._serverStartDate == null) {
		this._serverStartDate = AjxDateUtil.parseServerDateTime(this.getServerStartTime(cn));
	}
	return this._serverStartDate;
};

/**
 * Gets the server start time timezone.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the timezone
 */
ZmInvite.prototype.getServerStartTimeTz = 
function(compNum) {
	var cn = compNum || 0;
	if (this.components[cn] == null) return;

	if (this._serverStartTimeZone == null) {
		var startTime = this.getServerStartTime();
		this._serverStartTimeZone = startTime && startTime.charAt(startTime.length -1) == 'Z'
			? AjxTimezone.GMT_NO_DST
			: (this.components[cn].s ? this.components[cn].s[0].tz : null);
	}
	return this._serverStartTimeZone;
};

/**
 * Gets the server end time timezone.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the timezone
 */
ZmInvite.prototype.getServerEndTimeTz = 
function(compNum) {
	var cn = compNum || 0;
	if (this.components[cn] == null) return;

	if (this._serverEndTimeZone == null) {
		var endTime = this.getServerEndTime();
		this._serverEndTimeZone = endTime && startTime.charAt(endTime.length -1) == 'Z'
			? AjxTimezone.GMT_NO_DST
			: this.components[cn].e[0].tz;
	}
	return this._serverEndTimeZone;
};

/**
 * Gets the duration text.
 * 
 * @param	{int}	compNum		the component number
 * @param	{Boolean}	emptyAllDay		<code>true</code> to return an empty string "" if all day event.
 * @param	{Boolean}	startOnly		<code>true</code> to include start only
 * @param	{Boolean}	isText			<code>true</code> to return as text, not html
 * @return	{String}	the duration
 */
ZmInvite.prototype.getDurationText =
function(compNum, emptyAllDay, startOnly, isText) {
	var component = this.components[compNum];
    var sdt = this.getServerStartDate(compNum);
    var edt = this.getServerEndDate(compNum);
    if(!sdt && !edt) return "";
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
        var a = [];
        if(sd){
		    a = [ dateFormatter.format(sd), isText ? " " : "<br>" ];
            if (startOnly) {
			    a.push(timeFormatter.format(sd));
		    }
		    else {
                var ed = this.getServerEndDate(compNum);
                if(ed){
                    var startHour = timeFormatter.format(sd);
                    var endHour = timeFormatter.format(ed);

                    if (!ZmInvite._hoursFormatter) {
                        ZmInvite._hoursFormatter = new AjxMessageFormat(ZmMsg.durationHours);
                    }
                    a.push(ZmInvite._hoursFormatter.format( [ startHour, endHour ] ));
                }
		    }
        }
		return a.join("");
	}
};

/**
 * Gets the name.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the name
 */
ZmInvite.prototype.getName = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].name : null;
};

/**
 * Gets the free busy.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the free busy
 */
ZmInvite.prototype.getFreeBusy =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].fb : null;
};

/**
 * Gets the privacy.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the privacy
 */
ZmInvite.prototype.getPrivacy =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn]["class"] : null;
};

/**
 * Gets the x-prop.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the x-prop
 */
ZmInvite.prototype.getXProp =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn]["xprop"] : null;
};

/**
 * Gets the location.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the location
 */
ZmInvite.prototype.getLocation =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].loc : null;
};

/** 
 * Gets the tool tip in HTML for this invite.
 * 
 * <p>
 * <strong>Note:</strong> This method assumes that there are currently one and only one component object on the invite.
 * </p>
 * 
 * @return	{String}	the tool tip
 */
ZmInvite.prototype.getToolTip =
function() {
	if (this._toolTip)
		return this._toolTip;

	var compNum = 0;

	var html = [];
	var idx = 0;

	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 >";
	html[idx++] = "<tr valign='center'><td colspan=2 align='left'>";
	html[idx++] = "<div style='border-bottom: 1px solid black;'>";
	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
	html[idx++] = "<tr valign='center'><td><b>";

	// IMGHACK - added outer table for new image changes...
	html[idx++] = "<div style='white-space:nowrap'><table border=0 cellpadding=0 cellspacing=0 style='display:inline'><tr>";
	if (this.hasOtherAttendees(compNum)) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptMeeting");
		html[idx++] = "</td>";
	}

	if (this.isException(compNum)) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptException");
		html[idx++] = "</td>";
	}
	else if (this.isRecurring(compNum)) {
		html[idx++] = "<td>";
		html[idx++] = AjxImg.getImageHtml("ApptRecur");
		html[idx++] = "</td>";
	}

	html[idx++] = "</tr></table>&nbsp;";
	html[idx++] = AjxStringUtil.htmlEncode(this.getName(compNum));
	html[idx++] = "&nbsp;</div></b></td><td align='right'>";
	html[idx++] = AjxImg.getImageHtml("Appointment");
	html[idx++] = "</td></table></div></td></tr>";

	var when = this.getDurationText(compNum, false, false);
	idx = this._addEntryRow(ZmMsg.when, when, html, idx, false, null, true);
	if (this.isRecurring(compNum)) {
		if (!this._recurBlurb) {
			AjxDispatcher.require("CalendarCore");
			var recur = new ZmRecurrence();
			recur.parse(this.getRecurrenceRules(compNum));
			this._recurBlurb = recur.getBlurb();
		}
		idx = this._addEntryRow(ZmMsg.repeats, this._recurBlurb, html, idx, true, null, true);
	}
	idx = this._addEntryRow(ZmMsg.location, this.getLocation(compNum), html, idx, false);

	html[idx++] = "</table>";
	this._toolTip = html.join("");

	return this._toolTip;
};

/**
 * Gets the summary.
 * 
 * @param	{Boolean}	isHtml	<code>true</code> to return summary as HTML
 * @return	{String}	the summary
 */
ZmInvite.prototype.getSummary =
function(isHtml) {
	var compNum = 0;

    var orgName = this.getOrganizerName(compNum);
	var whenSummary = this.getDurationText(compNum, false, false, true);
    var locationSummary = this.getLocation(compNum);

	if (this.isRecurring(compNum)) {
		if (!this._recurBlurb) {
			AjxDispatcher.require("CalendarCore");
			var recur = new ZmRecurrence();
			recur.setRecurrenceRules(this.getRecurrenceRules(compNum), this.getServerStartDate(compNum));
			this._recurBlurb = recur.getBlurb();
		}
	}
    var recurSummary =  this._recurBlurb;

	var buf = [];
	var i = 0;

	if (!this._summaryHtmlLineFormatter) {
		this._summaryHtmlLineFormatter = new AjxMessageFormat("<tr><th align='left'>{0}</th><td>{1} {2}</td></tr>");
		this._summaryTextLineFormatter = new AjxMessageFormat("{0} {1} {2}");
	}
	var formatter = isHtml ? this._summaryHtmlLineFormatter : this._summaryTextLineFormatter;

    var params = [];
    
	if (isHtml) {
		buf[i++] = "<p>\n<table border='0'>\n";
	}


	if (orgName) {
		params = [ZmMsg.organizerLabel, orgName, ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	if (whenSummary) {
		params = [ZmMsg.whenLabel, whenSummary, ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

    if (locationSummary) {
        params = [ZmMsg.locationLabel, locationSummary, ""];
        buf[i++] = formatter.format(params);
        buf[i++] = "\n";
    }

    if (recurSummary) {
        params = [ZmMsg.repeatLabel, recurSummary, ""];
        buf[i++] = formatter.format(params);
        buf[i++] = "\n";
    }

	if (isHtml) {
		buf[i++] = "</table>\n";
	}
	buf[i++] = isHtml ? "<div>" : "\n\n";
	buf[i++] = ZmItem.NOTES_SEPARATOR;
	// bug fix #7835 - add <br> after DIV otherwise Outlook lops off 1st char
	buf[i++] = isHtml ? "</div><br>" : "\n\n";

	return buf.join("");
};

/**
 * Adds a row to the tool tip.
 * 
 * @private
 */
ZmInvite.prototype._addEntryRow =
function(field, data, html, idx, wrap, width, asIs) {
	if (data != null && data != "") {
		html[idx++] = "<tr valign='top'><td align='right' style='padding-right: 5px;'><b><div style='white-space:nowrap'>";
		html[idx++] = AjxMessageFormat.format(ZmMsg.makeLabel, AjxStringUtil.htmlEncode(field));
		html[idx++] = "</div></b></td><td align='left'><div style='white-space:";
		html[idx++] = wrap ? "wrap;" : "nowrap;";
		if (width) {
			html[idx++] = "width:";
			html[idx++] = width;
			html[idx++] = "px;";
		}
		html[idx++] = "'>";
		html[idx++] = asIs ? data : AjxStringUtil.htmlEncode(data);
		html[idx++] = "</div></td></tr>";
	}
	return idx;
};

/**
 * Checks the invite has acceptable components.
 * 
 * @return	{Boolean}	<code>true</code> if the invite has acceptable components
 */
ZmInvite.prototype.hasAcceptableComponents =
function() {	
	for(var i  in this.components) {
		if(this.getStatus(i) != ZmCalendarApp.STATUS_CANC){
			return true;
		};
	}
	
	return false;
};

/**
 * Checks the invite has a reply method.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite has a reply method
 */
ZmInvite.prototype.hasInviteReplyMethod =
function(compNum) {
    var methodName = this.getInviteMethod(compNum);
    var publishOrRequest = (methodName == ZmCalendarApp.METHOD_REQUEST || methodName == ZmCalendarApp.METHOD_PUBLISH);
    return ((methodName == null) || publishOrRequest);
};
