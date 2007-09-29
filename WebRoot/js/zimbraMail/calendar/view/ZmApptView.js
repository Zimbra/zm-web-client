/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty appointment view.
* @constructor
* @class
* Simple read-only view of an appointment. It looks more or less like a message -
* the notes have their own area at the bottom, and everything else goes into a
* header section at the top.
*
* @author Parag Shah
* @author Conrad Damon
* 
* @param parent		[DwtComposite]	parent widget
* @param posStyle	[constant]		positioning style
* @param controller	[ZmController]	owning controller
*/
function ZmApptView(parent, posStyle, controller) {

	ZmMailMsgView.call(this, parent, null, posStyle, null, controller);
};

ZmApptView.prototype = new ZmMailMsgView;
ZmApptView.prototype.constructor = ZmApptView;

// Public methods

ZmApptView.prototype.toString = 
function() {
	return "ZmApptView";
};

ZmApptView.prototype.getController =
function() {
	return this._controller;
};

// Following public overrides are a hack to allow this view to pretend it's a list view,
// as well as a calendar view
ZmApptView.prototype.getSelection =
function() {
	return [this._appt];
};

ZmApptView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmApptView.prototype.needsRefresh = 
function() {
	return false;
};

ZmApptView.prototype.addSelectionListener = function() {};
ZmApptView.prototype.addActionListener = function() {};
ZmApptView.prototype.handleActionPopdown = function(ev) {};

ZmApptView.prototype.getTitle =
function() {
	var name = this._appt.getName();
	var attendees = this._appt.getAttendeesText();
	var title = attendees ? ZmMsg.meeting : ZmMsg.appointment;
	return title + ": " + name;
};

ZmApptView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	this._appt = null;
};

ZmApptView.prototype.set = 
function(appt) {
	if (this._appt == appt) return;

	// so that Close button knows which view to go to
	this._prevView = this._controller._viewMgr.getCurrentViewName();

	this.reset();
	this._appt = appt;
	this._renderAppt(appt);
};

ZmApptView.prototype.setBounds =
function(x, y, width, height) {
	// dont reset the width!
	ZmMailMsgView.prototype.setBounds.call(this, x, y, Dwt.DEFAULT, height);
};

ZmApptView.prototype.close =
function() {
	this._controller._viewMgr.setView(this._prevView);
	this._controller._currentView = this._prevView;
	this._controller._resetToolbarOperations();
};

ZmApptView.prototype.getPrintHtml =
function() {
	var idx = 0;
	var html = [];

	html[idx++] = "<div style='width: 100%; background-color: #EEEEEE'>";
	html[idx++] = "<table border=0 width=100%><tr>";

	// print subject and date
	html[idx++] = "<td><font size=+1>";
	html[idx++] = this._appt.getName();
	html[idx++] = "</font></td><td align=right><font size=+1>";
	html[idx++] = this._getTimeString(this._appt);
	html[idx++] = "</font></td></tr></table>";

	html[idx++] = "<table border=0 width=100%>";

	// print location
	var location = this._appt.getLocation(true);
	if (location) {
		idx = this._printField(ZmMsg.location, location, html, idx);
	}

	// print resources
	var equipment = this._appt.getEquipmentText(true);
	if (equipment) {
		idx = this._printField(ZmMsg.resources, equipment, html, idx);
	}

	// print organizer/attendees
	var attendees = this._appt.getAttendeesText();
	if (attendees) {
		var organizer = this._appt.getOrganizer();
		if (organizer) {
			idx = this._printField(ZmMsg.organizer, organizer, html, idx);
		}
		idx = this._printField(ZmMsg.attendees, attendees, html, idx);
	}

	// print recurrence blurb
	var repeatStr = this._appt._getRecurrenceBlurbForSave();
	if (repeatStr) {
		idx = this._printField(ZmMsg.repeats, repeatStr, html, idx);
	}

	// print attachments
	var attachStr = this._getAttachString(this._appt);
	if (attachStr) {
		idx = this._printField(ZmMsg.attachments, attachStr, html, idx, true);
	}

	html[idx++] = "</table></div>";

	// finally, print notes
	var hasHtmlPart = (this._appt.notesTopPart && this._appt.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && this._appCtxt.get(ZmSetting.VIEW_AS_HTML))
			? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
	var bodyPart = this._appt.getNotesPart(mode);
	if (bodyPart) {
		html[idx++] = "<div style='padding:10px; font-size:12px'>";
		html[idx++] = bodyPart;
		html[idx++] = "</div>";
	}

	return html.join("");
};


// Private / protected methods

ZmApptView.prototype._renderAppt =
function(appt) {
	this._lazyCreateObjectManager();
	if (this._objectManager) {
	    this._objectManager.setHandlerAttr(ZmObjectManager.DATE, 
	    								   ZmObjectManager.ATTR_CURRENT_DATE, 
	    								   appt.getStartDate());
	}

	var closeBtnCellId = Dwt.getNextId();
	this._hdrTableId = Dwt.getNextId();

	this._appt = appt;

	var i = 0;
	var html = [];

	html[i++] = "<table border=0 class='MsgHeaderTable' id='";
	html[i++] = this._hdrTableId;
	html[i++] = "' cellspacing=0 cellpadding=0 border=0 width=100%>";

	// Subject
	var name = appt.getName();
	html[i++] = "<tr><td width=100 class='SubjectCol LabelColName'>";
	html[i++] = AjxStringUtil.htmlEncode(ZmMsg.subject);
	html[i++] = ": </td><td colspan=3>";
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0 width=100%><tr><td class='SubjectCol LabelColValue'>";
	html[i++] = this._objectManager ? this._objectManager.findObjects(name, true) : name;
	html[i++] = "</td>";

	// Close button
	html[i++] = "<td width=1% id='";
	html[i++] = closeBtnCellId;
	html[i++] = "'></td>"; // add extra cell for padding since CSS does not play well in IE
	html[i++] = "</tr></table>";
	html[i++] = "</td></tr>";

	var location = appt.getLocation(true);
	if (location) {
		i = this._showField(ZmMsg.location, this._objectManager.findObjects(location, true), html, i);
	}

	var equipment = appt.getEquipmentText(true);
	if (equipment) {
		i = this._showField(ZmMsg.resources, this._objectManager.findObjects(equipment, true), html, i);
	}

	html[i++] = "<tr><td width=100 class='LabelColName'";
	var isException = appt._orig.isException();
	if (isException) {
		html[i++] = " rowspan='2'";
	}
	html[i++] = ">";
	html[i++] = ZmMsg.time;
	html[i++] = ":</td><td class='LabelColValue'>";
	html[i++] = this._objectManager.findObjects(this._getTimeString(appt), true);
	html[i++] = "</td></tr>";
	if (isException) {
		html[i++] = "<tr valign='center'><td><div class='";
		html[i++] = AjxImg.getClassForImage("ApptException");
		html[i++] = "' style='float:left;padding-right:0.25em'></div><b>";
		html[i++] = ZmMsg.apptExceptionNote;
		html[i++] = "</b></td></tr>";
	}

	var attendees = appt.getAttendeesText();
	if (attendees) {
		var organizer = appt.getOrganizer();
		var sender = appt.getMessage().getAddress(ZmEmailAddress.SENDER);
		if (sender || organizer) {
			var or = sender ? sender.toString() : organizer;
			var ob = this._objectManager.findObjects(or, true, ZmObjectManager.EMAIL);
			i = this._showField(ZmMsg.organizer, ob, html, i);
			if (sender && organizer) {
				ob = this._objectManager.findObjects(organizer, true, ZmObjectManager.EMAIL);
				i = this._showField(ZmMsg.onBehalfOf, ob, html, i);
			}
		}
		i = this._showField(ZmMsg.attendees, this._objectManager.findObjects(attendees, true), html, i);
	}

	var repeatStr = appt.isRecurring() ? appt._getRecurrenceBlurbForSave() : null;
	if (repeatStr) {
		i = this._showField(ZmMsg.repeats, repeatStr, html, i);
	}

	var attachStr = this._getAttachString(appt);
	if (attachStr) {
		i = this._showField(ZmMsg.attachments, attachStr, html, i);
	}

	html[i++] = "</table>";

	var el = this.getHtmlElement();
	el.appendChild(Dwt.parseHtmlFragment(html.join("")));

	// add the close button
	this._closeButton = new DwtButton(this, null, "DwtToolbarButton");
	this._closeButton.setImage("Close");
	this._closeButton.setText(ZmMsg.close);
	this._closeButton.reparentHtmlElement(closeBtnCellId);
	this._closeButton.addSelectionListener(new AjxListener(this, this.close));

	var hasHtmlPart = (appt.notesTopPart && appt.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && this._appCtxt.get(ZmSetting.VIEW_AS_HTML)) ? ZmMimeTable.TEXT_HTML :
																			ZmMimeTable.TEXT_PLAIN;
	var bodyPart = appt.getNotesPart(mode);
	if (bodyPart) {
		this._makeIframeProxy(el, bodyPart, mode == ZmMimeTable.TEXT_PLAIN);
	}
};

ZmApptView.prototype._showField =
function(label, value, html, i) {
	html[i++] = "<tr><td width=100 class='LabelColName'>";
	html[i++] = AjxStringUtil.htmlEncode(label);
	html[i++] = ": </td><td class='LabelColValue'>";
	html[i++] = value;
	html[i++] = "</td></tr>";
	
	return i;
};

ZmApptView.prototype._printField =
function(label, value, html, idx, dontEncode) {
	html[idx++] = "<tr><td valign=top style='text-align:right; font-size:14px'>";
	html[idx++] = label;
	html[idx++] = ": </td><td width=100% style='font-size:14px'>";
	html[idx++] = !dontEncode ? AjxStringUtil.htmlEncode(value) : value;
	html[idx++] = "</td></tr>";

	return idx;
};

ZmApptView.prototype._getTimeString = 
function(appt) {
	var str = [];
	var i = 0;

	var sd = appt._orig.getStartDate();
	var ed = appt._orig.getEndDate();

	var dateFormatter = AjxDateFormat.getDateInstance();
	var timeFormatter = AjxDateFormat.getTimeInstance(AjxDateFormat.SHORT);
	var timezone = appt.getOrigTimezone();
	var localTimezone = AjxTimezone.getServerId(AjxTimezone.DEFAULT);

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
			if (timezone && timezone != localTimezone) {
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
			if (timezone && timezone != localTimezone) {
				str[i++] = " ";
				str[i++] = appt.getTimezone();
			}
		}
	}

	return str.join("");
};

ZmApptView.prototype._getAttachString = 
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

ZmApptView.prototype._setAttachmentLinks =
function() {
	// do nothing since appt view renders attachments differently
};

// returns true if given dates are w/in a single day
ZmApptView.prototype._isOneDayAppt = 
function(sd, ed) {
	var start = new Date(sd.getTime());
	var end = new Date(ed.getTime());

	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);

	return start.valueOf() == end.valueOf();
};
