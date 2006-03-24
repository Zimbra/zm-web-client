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

	this._setMouseEventHdlrs(); 
	this._objectManager = new ZmObjectManager(this, appCtxt, new AjxCallback(this, this._objectSelectCallback)); 

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
	this._objectManager.reset();

	var name = appt.getName();
	var attendees = appt.getAttendeesText();

	// set the title of this dialog
	var title = attendees ? ZmMsg.meeting : ZmMsg.appointment;
	this.setTitle(title + ": " + name);

	// set content of this dialog
	var html = [];
	var i = 0;

	html[i++] = "<table cellpadding=2 cellspacing=2 width=440>";

	html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
	html[i++] = ZmMsg.subject;
	html[i++] = ":</td><td>";
	html[i++] = this._objectManager.findObjects(name, true);
	html[i++] = "</td></tr>";

	var location = appt.getLocation(true);
	if (location) {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.location;
		html[i++] = ":</td><td>";
		html[i++] = this._objectManager.findObjects(location, true);
		html[i++] = "</td></tr>";
	}

	var resources = appt.getResourcesText();
	if (resources) {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.resources;
		html[i++] = ":</td><td>";
		html[i++] = this._objectManager.findObjects(resources, true);
		html[i++] = "</td></tr>";
	}

	html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'";
	var isException = appt._orig.isException();
	if (isException) {
		html[i++] = " rowspan='2'";
	}
	html[i++] = ">";
	html[i++] = ZmMsg.time;
	html[i++] = ":</td><td>";
	html[i++] = this._objectManager.findObjects(this._getTimeString(appt), true);
	html[i++] = "</td></tr>";
	if (isException) {
		html[i++] = "<tr valign='center'><td><div class='";
		html[i++] = AjxImg.getClassForImage("ApptException");
		html[i++] = "' style='float:left;padding-right:0.25em'></div><b>";
		html[i++] = ZmMsg.apptExceptionNote;
		html[i++] = "</b></td></tr>";
	}

	if (attendees) {
		var organizer = appt.getOrganizer();
		if (organizer != "") {
			html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
			html[i++] = ZmMsg.organizer;
			html[i++] = "</td><td>";
			html[i++] = this._objectManager.findObjects(organizer, true);
			html[i++] = "</td></tr>";
		}

		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.attendees;
		html[i++] = ":</td><td>";
		html[i++] = this._objectManager.findObjects(attendees, true);
		html[i++] = "</td></tr>";
	}

	var repeatStr = appt._getRecurrenceBlurbForSave();
	if (repeatStr) {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.repeats;
		html[i++] = ":</td><td>";
		html[i++] = repeatStr;
		html[i++] = "</td></tr>";
	}

	var attachStr = this._getAttachString(appt);
	if (attachStr) {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.attachments;
		html[i++] = ":</td><td>";
		html[i++] = attachStr;
		html[i++] = "</td></tr>";
	}

	var notesStr = this._getNotesString(appt);
	if (notesStr) {
		html[i++] = "<tr><td class='ZmApptReadOnlyDialogField'>";
		html[i++] = ZmMsg.notes;
		html[i++] = ":</td><td><div style='height:75px; overflow:auto'>";
		html[i++] = notesStr;
		html[i++] = "</div></td></tr>";
	}

	html[i++] = "</table>";

	this.setContent(html.join(""));
};


// Private / protected methods

ZmApptReadOnlyDialog.prototype._getTimeString = 
function(appt) {
	var str = [];
	var i = 0;

	var sd = appt._orig.getStartDate();
	var ed = appt._orig.getEndDate();

	var dateFormatter = AjxDateFormat.getDateInstance();
	var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	var timezone = appt.getTimezone();
	var localTimzone = ZmTimezones.guessMachineTimezone();

	if (this._isOneDayAppt(sd, ed)) {
		str[i++] = dateFormatter.format(sd);
		if (!appt.isAllDayEvent()) {
			str[i++] = " ";
			str[i++] = ZmMsg.from.toLowerCase();
			str[i++] = " ";
			str[i++] = timeFormatter.format(sd);
			str[i++] = " - ";
			str[i++] = timeFormatter.format(ed);
			// bug fix #4762
			if (timezone && timezone != localTimzone) {
				str[i++] = " ";
				str[i++] = appt.getTimezone();
			}
		}
	} else {
		str[i++] = ZmMsg.from;
		str[i++] = " ";
		str[i++] = dateFormatter.format(sd);
		if (!appt.isAllDayEvent()) {
			str[i++] = ", ";
			str[i++] = timeFormatter.format(sd);
		}
		str[i++] = " - ";
		str[i++] = dateFormatter.format(ed);
		if (!appt.isAllDayEvent()) {
			str[i++] = ", ";
			str[i++] = timeFormatter.format(ed);
			// bug fix #4762
			if (timezone && timezone != localTimzone) {
				str[i++] = " ";
				str[i++] = appt.getTimezone();
			}
		}
	}

	return str.join("");
};

ZmApptReadOnlyDialog.prototype._getAttachString = 
function(appt) {
	var str = [];
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
	var mode = (hasHtmlPart && this._appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML
		: ZmMimeTable.TEXT_PLAIN;

	var notesPart = appt.getNotesPart(mode);
	return mode == ZmMimeTable.TEXT_HTML
		? this._objectManager.findObjects(notesPart)
		: AjxStringUtil.nl2br(this._objectManager.findObjects(notesPart, true));
};

// returns true if given dates are w/in a single day
ZmApptReadOnlyDialog.prototype._isOneDayAppt = 
function(sd, ed) {
	var start = new Date(sd.getTime());
	var end = new Date(ed.getTime());

	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);

	return start.valueOf() == end.valueOf();
};


// Callbacks

ZmApptReadOnlyDialog.prototype._objectSelectCallback =
function(args) {
	this.popdown();
};
