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
	return this.components[compNum].recur
};

ZmInvite.prototype.isException = 
function(compNum) {
	return this.components[compNum] != null 
		? this.components[compNum].ex 
		: false;
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
			this._serverEndTime = StringBuffer.concat(yyyy,MM,dd,"T",hh,mm,ss);
		}
	}
	return this._serverEndTime;
};

ZmInvite.prototype.getServerStartTime = 
function(compNum) {
	return this.components[compNum] != null
		? this.components[compNum].s[0].d
		: null;
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

ZmInvite.prototype.getCannedText = 
function() {
	var text = new Array();
	var i = 0;

	text[i++] = "\n";
	text[i++] = ZmMsg.subject;
	text[i++] = ": ";
	text[i++] = this.getName(0);
	text[i++] = "\n";
	text[i++] = ZmMsg.organizer;
	text[i++] = " ";
	text[i++] = this.getOrganizerName(0);
	text[i++] = "\n\n";
	text[i++] = ZmMsg.location;
	text[i++] = ": ";
	text[i++] = this.getLocation(0);
	text[i++] = "\n";
	text[i++] = ZmMsg.time;
	text[i++] = ": ";
	text[i++] = AjxDateUtil.parseServerDateTime(this.getServerStartTime(0));
	text[i++] = ZmAppt.NOTES_SEPARATOR;

	return text.join("");
};
