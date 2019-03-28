/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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


// Consts
ZmInvite.CHANGES_LOCATION	= "location";
ZmInvite.CHANGES_SUBJECT	= "subject";
ZmInvite.CHANGES_RECURRENCE	= "recurrence";
ZmInvite.CHANGES_TIME		= "time";
ZmInvite.TASK		= "task";


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
    invite.id = node[0].id;
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
 * Checks if the invite has other individual (non-location & resource) attendees.
 *
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite has more than one other individual attendee
 */
ZmInvite.prototype.hasOtherIndividualAttendees =
function(compNum) {
    var cn  = compNum || 0;
    var att = this.components[cn].at;
    var otherFound = false;

    if (att && att.length) {
        for (var i = 0; i < att.length; i++) {
            if (!att[i].cutype || (att[i].cutype == ZmCalendarApp.CUTYPE_INDIVIDUAL)) {
                otherFound = true;
                break;
            }
        }
    }
    return otherFound;
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
 * Gets the sequence no
 *
 * @param	{int}	compNum		the component number
 * @return	{String} the sequence no
 */
ZmInvite.prototype.getSequenceNo =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].seq : null;
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

	if (!(att && att.length)) { return list; }

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

	if (!(att && att.length)) { return list; }

	for (var i = 0; i < att.length; i++) {
		if (att[i].cutype == ZmCalendarApp.CUTYPE_RESOURCE || 
		    att[i].cutype == ZmCalendarApp.CUTYPE_ROOM      ) {
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
	return (this.components[cn] && this.components[cn].exceptId)
		? this.components[cn].exceptId[0] : null;
};

/**
 * Gets the appointment id.
 * 
 * @param	{int}	compNum		the component number
 * @return {String}	the id
 */
ZmInvite.prototype.getAppointmentId =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].apptId;
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
 * Gets the transparency.
 *
 * @param	{int}	compNum		the component number
 * @return {String}	the transparent value
 */
ZmInvite.prototype.getTransparency = 
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].transp;
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

    if(!sd) return false;

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
	var comp = this.components[cn];
	if (comp == null) { return; }

	var desc = comp.descHtml;
	var content = desc && desc[0]._content || null;
	if (!content) {
		var txtContent = comp.desc;
        txtContent = (txtContent && txtContent[0]._content) || null;
        content = txtContent ? AjxStringUtil.convertToHtml(txtContent) : null;
		if (!content) {
			var msg = appCtxt.getById(this.getMessageId());
			if (msg && msg.hasContentType) {
				content = msg.hasContentType(ZmMimeTable.TEXT_HTML) ? msg.getBodyContent(ZmMimeTable.TEXT_HTML) : null;
				if (!content) {
					txtContent = msg.getTextBodyPart();
					content = txtContent ? AjxStringUtil.convertToHtml(txtContent) : null;
				}
			}
		}
		if (!content) {
			content = this.getApptSummary(true);
		}
	}
    if (!content) {
        var comment = this.getComponentComment();
        content = comment && AjxStringUtil.convertToHtml(comment);
    }
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
	var comp = this.components[cn];
	if (comp == null) { return; }

	var desc = comp.desc;
	var content = desc && desc[0]._content || null;
	if (!content) {
		content = this.getComponentComment();
	}
	if (!content) {
		var htmlContent = comp.descHtml;
		htmlContent = (htmlContent && htmlContent[0]._content) || null;
		if (!htmlContent && this.type != ZmInvite.TASK) {
			content = this.getApptSummary();
		}
	}
	return content;
};

/**
 * Gets the comment.
 * 
 * @param	{int}	compNum		the component number
 * @return	{String}	the comment or <code>null</code> for none
 */
ZmInvite.prototype.getComponentComment =
function(compNum) {
	var cn = compNum || 0;
	var comp = this.components[cn];
	if (comp == null) { return; }

	var comment = comp.comment;
	return comment && comment[0]._content || null;
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
	if (this.components[cn] == null) { return; }

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
function(compNum, noSpecialUtcCase) {
	var cn = compNum || 0;
    return AjxDateUtil.parseServerDateTime(this.getServerEndTime(cn), noSpecialUtcCase);
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
function(compNum, noSpecialUtcCase) {
	var cn = compNum || 0;
    return AjxDateUtil.parseServerDateTime(this.getServerStartTime(cn), noSpecialUtcCase);
};

/**
 * Gets start date from exception ID.
 *
 * @param	{int}	compNum		the component number
 */

ZmInvite.prototype.getStartDateFromExceptId =
function(compNum) {
	var cn = compNum || 0;
    return AjxDateUtil.parseServerDateTime(this.components[cn] && this.components[cn].exceptId
		? this.components[cn].exceptId[0].d : null);
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
	if (this.components[cn] == null) { return; }

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
	var endComp = this.components[cn] && this.components[cn].e;
	if (!endComp) { return null; }

	if (!this._serverEndTimeZone) {
		var endTime = this.getServerEndTime();
		this._serverEndTimeZone = (endTime && endTime.charAt(endTime.length -1) == 'Z')
			? AjxTimezone.GMT_NO_DST : endComp[0].tz;
	}
	return this._serverEndTimeZone;
};

/**
 * Gets the duration text.
 * 
 * @param	{int}		compNum			the component number
 * @param	{Boolean}	emptyAllDay		<code>true</code> to return an empty string "" if all day event.
 * @param	{Boolean}	startOnly		<code>true</code> to include start only
 * @param	{Boolean}	isText			<code>true</code> to return as text, not html
 * @param	{Date}		startDate		Optional. Start date to use instead of the original start date
 * @param	{Date}		endDate			Optional. End date to use instead of the original end date
 *
 * @return	{String}	the duration
 */
ZmInvite.prototype.getDurationText =
function(compNum, emptyAllDay, startOnly, isText, startDate, endDate) {
	var component = this.components[compNum];
	var sd = startDate || this.getServerStartDate(compNum);
	var ed = endDate || this.getServerEndDate(compNum);
	if (!sd && !ed) { return ""; }

	// all day
	if (this.isAllDayEvent(compNum)) {
		if (emptyAllDay) { return ""; }

		if (this.isMultiDay(compNum)) {
			var dateFormatter = AjxDateFormat.getDateInstance();
			var startDay = dateFormatter.format(sd);
			var endDay = dateFormatter.format(ed);

			if (!ZmInvite._daysFormatter) {
				ZmInvite._daysFormatter = new AjxMessageFormat(ZmMsg.durationDays);
			}
			return ZmInvite._daysFormatter.format([startDay, endDay]);
		} 
		return sd ? AjxDateFormat.getDateInstance(AjxDateFormat.FULL).format(sd) : "";
	}

    var dateFormatter = AjxDateFormat.getDateInstance(AjxDateFormat.FULL);
    var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);

    var a = sd ? [dateFormatter.format(sd), isText ? " " : "<br>"] : [];
    if (startOnly) {
        a.push(sd ? timeFormatter.format(sd) : "");
	}
	else {
        var startHour = sd ? timeFormatter.format(sd) : "";
		var endHour = timeFormatter.format(ed);

		if (!ZmInvite._hoursFormatter) {
			ZmInvite._hoursFormatter = new AjxMessageFormat(ZmMsg.durationHours);
		}
		a.push(ZmInvite._hoursFormatter.format([startHour, endHour]));
	}
	return a.join("");
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
 * Gets the recurrence id (ridZ) - applicable to recurring appointment .
 *
 * @param	{int}	compNum		the component number
 * @return	{String}	the recurrence id, null for non-recurring appointment
 */
ZmInvite.prototype.getRecurrenceId =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn] ? this.components[cn].ridZ : null;
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
			AjxDispatcher.require(["MailCore", "CalendarCore"]);
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
 * Gets the Appt summary.
 *
 * @param	{Boolean}	isHtml	<code>true</code> to return summary as HTML
 * @return	{String}	the appt summary
 */
ZmInvite.prototype.getApptSummary =
function(isHtml) {
	var msg = appCtxt.getById(this.getMessageId());
	var appt;

	if (msg) {
		AjxDispatcher.require(["MailCore", "CalendarCore"]);
		appt = new ZmAppt();
		appt.setFromMessage(msg);
	}

	return appt ? appt.getSummary(isHtml) : this.getSummary(isHtml);
};

/**
 * Gets the summary.
 * 
 * @param	{Boolean}	isHtml	<code>true</code> to return summary as HTML
 * @return	{String}	the summary
 */
ZmInvite.prototype.getSummary =
function(isHtml) {
	if (this.isRecurring()) {
		if (!this._recurBlurb) {
			AjxDispatcher.require(["MailCore", "CalendarCore"]);
			var recur = new ZmRecurrence();
			recur.setRecurrenceRules(this.getRecurrenceRules(), this.getServerStartDate());
			this._recurBlurb = recur.getBlurb();
		}
	}

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

	var orgName = AjxStringUtil.htmlEncode(this.getOrganizerName());
	if (orgName) {
		params = [ZmMsg.organizerLabel, orgName, ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var whenSummary = this.getDurationText(0, false, false, true);
	if (whenSummary) {
		params = [ZmMsg.whenLabel, whenSummary, ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	var locationSummary = AjxStringUtil.htmlEncode(this.getLocation());
	if (locationSummary) {
		params = [ZmMsg.locationLabel, locationSummary, ""];
		buf[i++] = formatter.format(params);
		buf[i++] = "\n";
	}

	if (this._recurBlurb) {
		params = [ZmMsg.repeatLabel, this._recurBlurb, ""];
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
	for (var i  in this.components) {
		if (this.getStatus(i) != ZmCalendarApp.STATUS_CANC) {
			return true;
		}
	}

	return false;
};

/**
 * Checks the invite has a reply method.
 * 
 * @param	{int}	compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite has a method that REQUIRES a reply (ironically NOT REPLY method but rather REQUEST or PUBLISH)
 */
ZmInvite.prototype.hasInviteReplyMethod =
function(compNum) {
	var methodName = this.getInviteMethod(compNum);
	var publishOrRequest = (methodName == ZmCalendarApp.METHOD_REQUEST ||
							methodName == ZmCalendarApp.METHOD_PUBLISH);
	return ((methodName == null) || publishOrRequest);
};

/**
 * Checks the invite has a counter method.
 *
 * @param	{int}	    compNum		the component number
 * @return	{Boolean}	<code>true</code> if the invite has a counter method
 */
ZmInvite.prototype.hasCounterMethod =
function(compNum) {
	return (this.getInviteMethod(compNum) == ZmCalendarApp.METHOD_COUNTER);
};

/**
 * returns proposed time from counter invite
 *
 * @param	{int}	    compNum		the component number
 * @return	{string}	proposed time as formatted string
 */
ZmInvite.prototype.getProposedTimeStr =
function(compNum) {
	var methodName = this.getInviteMethod(compNum);
	if (methodName == ZmCalendarApp.METHOD_COUNTER) {
		return this.getDurationText(compNum, false, false, true);
	}
	return "";
};

/**
 * Gets the color
 *
 * @param	{int}	compNum		the component number
 * @return {String}	the color value
 */
ZmInvite.prototype.getColor =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].color;
};

/**
 * Gets the RGB
 *
 * @param	{int}	compNum		the component number
 * @return {String}	the rgb string
 */
ZmInvite.prototype.getRGB =
function(compNum) {
	var cn = compNum || 0;
	return this.components[cn].rgb;
};

ZmInvite.prototype.getChanges =
function(compNum) {
	var cn = compNum || 0;
	var changesStr = this.components[cn] && this.components[cn].changes;
	var changesArr = changesStr && changesStr.split(",");
	if (changesArr && changesArr.length > 0) {
		var changes = {};
		for (var i = 0; i < changesArr.length; i++) {
			changes[changesArr[i]] = true;
		}
		return changes;
	}

	return null;
};

/**
 * Returns true if this invite has attendees, one of which replied back with an
 * "actioned" response (e.g. accept/decline/tentative)
 */
ZmInvite.prototype.hasAttendeeResponse =
function() {
	var att = this.getAttendees();
	return (att.length > 0 && att[0].ptst != ZmCalBaseItem.PSTATUS_NEEDS_ACTION);
};

/**
 * Checks if this invite has html description.
 *
 * @return	{Boolean}	<code>true</code> if this invite has HTML description
 */
ZmInvite.prototype.isHtmlInvite =
function() {
	var comp = this.getComponent(0);
	var htmlContent = comp && comp.descHtml;
	return (htmlContent && htmlContent[0] && htmlContent[0]._content) ? true : false;
};
