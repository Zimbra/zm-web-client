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
* Read only dialog showing ZmAppt information for appointments which user is not 
* allowed to edit
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
*/
function ZmApptReadOnlyDialog(parent, appCtxt) {

	DwtDialog.call(this, parent, null, null, [DwtDialog.OK_BUTTON]);

	this._appCtxt = appCtxt;
};

ZmApptReadOnlyDialog.prototype = new DwtDialog;
ZmApptReadOnlyDialog.prototype.constructor = ZmApptReadOnlyDialog;

// Public methods

ZmApptReadOnlyDialog.prototype.toString = 
function() {
	return "ZmApptReadOnlyDialog";
};

ZmApptReadOnlyDialog.prototype.initialize = 
function(appt) {
	this._appt = appt;

	var name = appt.getName();
	var attendees = appt.getAttendees();

	// set the title of this dialog
	var title = attendees && attendees.length > 0
		? ZmMsg.meeting : ZmMsg.appointment;
	this.setTitle(title + ": " + name);

	// set content of this dialog
	var html = new Array();
	var i = 0;

	html[i++] = "<table cellpadding=2 cellspacing=2 width=440>";

	html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td>";
	html[i++] = name;
	html[i++] = "</td></tr>";

	var location = appt.getLocation();
	if (location && location != "") {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.location;
		html[i++] = ":</td><td>";
		html[i++] = location;
		html[i++] = "</td></tr>";
	}

	html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
	html[i++] = ZmMsg.time;
	html[i++] = ":</td><td>";
	html[i++] = this._getTimeString(appt);
	html[i++] = "</td></tr>";

	if (attendees && attendees.length > 0) {
		var organizer = appt.getOrganizer();
		if (organizer != "") {
			html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
			html[i++] = ZmMsg.organizer;
			html[i++] = "</td><td>";
			html[i++] = organizer;
			html[i++] = "</td></tr>";
		}

		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.attendees;
		html[i++] = ":</td><td>";
		html[i++] = attendees;
		html[i++] = "</td></tr>";
	}

	var repeatStr = appt._getRecurrenceBlurbForSave();
	if (repeatStr && repeatStr != "") {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.repeats;
		html[i++] = ":</td><td>";
		html[i++] = repeatStr;
		html[i++] = "</td></tr>";
	}

	var attachStr = this._getAttachString(appt);
	if (attachStr && attachStr != "") {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.attachments;
		html[i++] = ":</td><td>";
		html[i++] = attachStr;
		html[i++] = "</td></tr>";
	}

	var notesStr = this._getNotesString(appt);
	if (notesStr && notesStr != "") {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.notes;
		html[i++] = ":</td><td><div style='height:75px; overflow:auto'>";
		html[i++] = AjxStringUtil.nl2br(notesStr);
		html[i++] = "</div></td></tr>";
	}

	html[i++] = "</table>";

	this.setContent(html.join(""));
};


// Private / protected methods

ZmApptReadOnlyDialog.prototype._getTimeString = 
function(appt) {
	var str = new Array();
	var i = 0;

	var sd = appt.getStartDate();
	var ed = appt.getEndDate();

	if (this._isOneDayAppt(sd, ed)) {
		str[i++] = AjxDateUtil.simpleComputeDateStr(sd);
		if (!appt.isAllDayEvent()) {
			str[i++] = " ";
			str[i++] = ZmMsg.from.toLowerCase();
			str[i++] = " ";
			str[i++] = AjxDateUtil.computeTimeString(sd);
			str[i++] = " - ";
			str[i++] = AjxDateUtil.computeTimeString(ed);
		}
	} else {
		str[i++] = ZmMsg.from;
		str[i++] = " ";
		str[i++] = AjxDateUtil.simpleComputeDateStr(sd);
		if (!appt.isAllDayEvent()) {
			str[i++] = ", ";
			str[i++] = AjxDateUtil.computeTimeString(sd);
		}
		str[i++] = " - ";
		str[i++] = AjxDateUtil.simpleComputeDateStr(ed);
		if (!appt.isAllDayEvent()) {
			str[i++] = ", ";
			str[i++] = AjxDateUtil.computeTimeString(ed);
		}
	}

	return str.join("");
};

ZmApptReadOnlyDialog.prototype._getAttachString = 
function(appt) {
	var str = new Array();
	var j = 0;

	var attachList = appt.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			str[j++] = appt.getAttachListHtml(attachList[i]);
	}

	return str.join("");
};

ZmApptReadOnlyDialog.prototype._getNotesString =
function(appt) {
	// set notes/content (based on compose mode per user prefs)
	var hasHtmlPart = appt.notesTopPart && appt.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT;
	var mode = (hasHtmlPart && 
				(this._appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT) ||
				 this._appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML))
		? ZmMimeTable.TEXT_HTML
		: ZmMimeTable.TEXT_PLAIN;

	return appt.getNotesPart(mode);
};

// returns true if given dates are w/in a single day
ZmApptReadOnlyDialog.prototype._isOneDayAppt = 
function(sd, ed) {
	var start = new Date(sd);
	var end = new Date(ed);

	start.setHours(0);
	start.setMinutes(0);
	start.setSeconds(0);

	end.setHours(0);
	end.setMinutes(0);
	end.setSeconds(0);

	return start.valueOf() == end.valueOf();
};
