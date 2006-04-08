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
*
* @param appCtxt	[ZmAppCtxt]			the app context
*/
function ZmAssistantDialog(appCtxt) {

//	DwtDialog.call(this, appCtxt.getShell(), "ZmAssistantDialog", "Zimbra Assistant");
	ZmQuickAddDialog.call(this, appCtxt.getShell(), null, null, []);

	this._appCtxt = appCtxt;

	this.setTitle("Zimbra Assistant");
	this.setContent(this._contentHtml());
	this._initContent();
	this._fields = {};	
	this._msgDialog = this._appCtxt.getMsgDialog();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._objectManager = new ZmObjectManager(null, null, null);		

};

ZmAssistantDialog.prototype = new ZmQuickAddDialog;
ZmAssistantDialog.prototype.constructor = ZmAssistantDialog;

/**
*/
ZmAssistantDialog.prototype.popup =
function() {
	this._commandEl.value = "";
//	this._fields = {};	
	this._setDefaultAction();

	DwtDialog.prototype.popup.call(this);
	this._commandEl.focus();
};

/**
* Clears the conditions and actions table before popdown so we don't keep
* adding to them.
*/
ZmAssistantDialog.prototype.popdown =
function() {
	DwtDialog.prototype.popdown.call(this);
};

/*
* Returns HTML that forms the basic framework of the dialog.
*/
ZmAssistantDialog.prototype._contentHtml =
function() {
	var html = new AjxBuffer();
	this._tableId = Dwt.getNextId();
	
	html.append("<table cellspacing=4 border=0 width=400 id='", this._tableId, "'>");
	this._commandId = this._addCommand(html, "");
	html.append("<td colspan=3><hr></td>");
	html.append("</table>");	
	return html.toString();
};

ZmAssistantDialog.prototype._initContent =
function() {
	this._commandEl = document.getElementById(this._commandId);
	this._tableEl = document.getElementById(this._tableId);	
	Dwt.associateElementWithObject(this._commandEl, this);
	this._commandEl.onkeyup = ZmAssistantDialog._keyUpHdlr;
};

ZmAssistantDialog._keyUpHdlr =
function(ev) {
	var keyEv = DwtShell.keyEvent;
	keyEv.setFromDhtmlEvent(ev);
	var obj = keyEv.dwtObj;
	obj._commandUpdated();
//	DBG.println("value = "+obj._commandEl.value);
};

ZmAssistantDialog.prototype._commandUpdated =
function() {
	var cmd = this._commandEl.value.replace(/^\s*/, '');
	var match = cmd.match(/^(appt|new|empty)\s*/);
	if (!match) {
			this._setDefaultAction();
			return;
	}
	var args = cmd.substring(match[0].length);
	var mainCommand = match[1];
	if (this._mainCommand != mainCommand) {
		this._fieldsToDisplay({});
		this._mainCommand = mainCommand;
	}

	if (mainCommand == 'appt')
		this._newApptCommand(args);
	else if (mainCommand == 'new')
		this._newCommand(args);
	else if (mainCommand == 'empty')
		this._emptyCommand(args);	
	else {
		this._setDefaultAction();		
	}
};

ZmAssistantDialog.prototype._emptyCommand =
function(args) {
	var match = args.match(/\s*(\w+)\s*/);
	if (!match) return;
	var obj = match[1];
	//DBG.println("object = "+obj);
	args = args.substring(match[0].length);
	if (obj == 'trash') {
		this._setAction(ZmMsg.emptyTrash, "Trash");
	} else if (obj == 'junk') {
		this._setAction(ZmMsg.emptyJunk, "SpamFolder");
	} else {
		this._setDefaultAction();
	}
}

ZmAssistantDialog.prototype._newCommand =
function(args) {
	DBG.println("new = "+args);
	var match = args.match(/\s*(\w+)\s*/);
	if (!match) return;
	var obj = match[1];
	DBG.println("object = "+obj);
	args = args.substring(match[0].length);
	if (obj == 'appt') this._newApptCommand(args);
	else if (obj == 'contact') this._newContactCommand(args);
	else if (obj == 'note') this._newNoteCommand(args);	
	else if (obj == 'message') this._newMessageCommand(args);	
	else if (obj == 'm')  { 
		this._commandEl.value += "essage ";
		this._newMessageCommand("");
	}
	else this._setDefaultAction();
}

ZmAssistantDialog.prototype._matchTime =
function(args) {
	var hour, minute, ampm = null;
	var match1 = args.match(/\s*(\d+):(\d\d)(?:\s*(AM|PM))?\s*/i);
	var match2 = args.match(/\s*(\d+)(AM|PM)\s*/i);	
	// take the first match
	if (match1 && match2) {
		if  (match1.index < match2.index) match2 = null;
		else match1 = null;
	}
	if (match1) {
		hour = parseInt(match1[1]);
		minute = parseInt(match1[2]);
		if (match1[3]) ampm = match1[3].toLowerCase();
		args = args.replace(match1[0], " ");
	} else if (match2) {
		hour = parseInt(match2[1]);
		minute = 0;
		ampm = match2[2].toLowerCase();	
		args = args.replace(match2[0], " ");	
	} else {
		return null;
	}

	if (ampm == 'pm' && hour < 12) hour += 12;
	else if (ampm == 'am' && hour == 12) hour = 0;

	return {hour: hour, minute: minute, args: args };
};

/**
 * 
 * (...)                 matched as notes, stripped out
 * [...]                 matched as location, stripped out
 * {date-spec}           first matched pattern is "start date", second is "end date"
 * {time-spec}           first matched pattern is "start time", second is "end time"
 * repat {repeat-spec}   recurrence rule
 * calendar {cal-name}   calendar to add appt to
 * invite {e1,e2,e3}     email addresses to invite (ideally would auto-complete)
 * subject "..."         explicit subject
 * 
 * everything renaming is the subject, unless subject was explicit
 * 
 * example:
 * 
 * lunch 12:30 PM next friday with satish (to discuss future release) [CPK, Palo Alto]
 * 
 * "12:30 PM" matched as a time, saved as "start time" * 
 * "next friday" matches a date, so is stripped out and saved as "start date"
 * (...) matched as notes, stripped out and saved as "notes"
 * [...] matched as location
 * 
 * everything left "lunch with satish" is taken as subject
 * 
 */
 	
ZmAssistantDialog.prototype._newApptCommand =
function(args) {
	this._setActionField(ZmMsg.newAppt, "NewAppointment");

	DBG.println("args = "+args);
	var startDate = new Date();
	var endDate = null;

//	DBG.println("args = "+args);

	var loc = null;
	match = args.match(/\s*\[([^\]]+)\]?\s*/);	
	if (match) {
		DBG.println("location = "+match[1]);
		loc = match[1];
		//this._setTextField(ZmMsg.location, match[1], null, null, "300px");
		args = args.replace(match[0], " ");
	}

	var notes = null;
	match = args.match(/\s*\(([^)]+)\)?\s*/);	
	if (match) {
		notes = match[1];
		//this._setTextField(ZmMsg.notes, match[1], null, null, "300px");
		args = args.replace(match[0], " ");
	}

	startDate.setMinutes(0);
	var startTime = this._matchTime(args);
	if (startTime) {
		startDate.setHours(startTime.hour, startTime.minute);
		args = startTime.args;
	}

	// look for an end time
	var endTime = this._matchTime(args);
	if (endTime) {
		args = endTime.args;
	}
		

	match = this._objectManager.findMatch(args, ZmObjectManager.DATE)
	
	if (match) {
		args = args.replace(match[0], " ");
		startDate = match.context.date;
		if (startTime) startDate.setHours(startTime.hour, startTime.minute);
		//this._setDateField(ZmMsg.startTime, startDate, false, fields);
	}
	
	// look for an end date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE)
	if (match) {
		args = args.replace(match[0], " ");
		endDate = match.context.date;
		if (endTime != null) endDate.setHours(endTime.hour, endTime.minute);
	} else {
		if (endTime) {
			endDate = new Date(startDate.getTime());
			if (endTime != null) endDate.setHours(endTime.hour, endTime.minute);			
		} else if (startTime) {
			endDate = new Date(startDate.getTime() + 1000 * 60 * 60);
		}
	}
	
	var subject = null;
	match = args.match(/\s*\b(?:subject|sub|subj)\s+\"([^\"]*)\"?\s*/i);
	if (match) {
		subject = match[1];
		//this._setTextField(ZmMsg.subject, subject, null, null, "300px");
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*repeat\s+(\S+)\s*/);	
	if (match) {
		//this._setTextField(ZmMsg.repeat, match[1], null, null, "100px");
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*invite\s+(\S+)\s*/);
	if (match) {
		//this._setTextField(ZmMsg.attendees, match[1], null, null, "300px");
		args = args.replace(match[0], " ");
	}

	if (subject == null) {
		subject = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' ');
		//this._setTextField(ZmMsg.subject, subject, null, null, "300px");
	}

	this._setField(ZmMsg.subject, subject == "" ? "enter subject" : subject, subject == "", true);
	this._setField(ZmMsg.location, loc == null ? "[ enclose location in brackets ]" : loc, loc == null, true);	
	this._setDateFields(startDate, startTime, endDate, endTime);
	this._setField(ZmMsg.notes, notes == null ? "( enclose notes in parens )" : notes, notes == null, true);
	return;

};
	
ZmAssistantDialog.prototype._genericTextField =
function(title, str, args, fields) {
	var regex = new RegExp("\\s*\\b(?:"+str+")\\s+\\\"([^\\\"]*)\\\"?\\s*", "i");
	var match = args.match(regex);
	if (match) {
		var  val = match[1];
		this._setTextField(title, val, null, null, "300px");
		fields[title] = 1;
		args = args.replace(match[0], " ");
	}
	return args;
};

ZmAssistantDialog.prototype._genericWordField =
function(title, str, args, fields) {
	var regex = new RegExp("\\s*\\b(?:"+str+")\\s+(\\S+)\\s*", "i");
	var match = args.match(regex);
	if (match) {
		var  val = match[1];
		this._setTextField(title, val, null, null, "300px");
		fields[title] = 1;
		args = args.replace(match[0], " ");
	}
	return args;
};


ZmAssistantDialog.prototype._fieldsToDisplay =
function(fields) {
	for (var field in this._fields) {
		if (!(field in fields)) {
			var fieldData = this._fields[field];
			fieldData.rowEl.parentNode.removeChild(fieldData.rowEl);
			delete this._fields[field];
		}
	}
};

ZmAssistantDialog.prototype._newContactCommand =
function(args) {
	this._setAction(ZmMsg.newContact, "NewContact");
	DBG.println("args = "+args);

	var fields = {};

	args = this._genericWordField("Email", "email", args, fields);
	args = this._genericWordField("First", "first", args, fields);
	args = this._genericWordField("Last", "last", args, fields);	

	this._fieldsToDisplay(fields);
};


ZmAssistantDialog.prototype._newNoteCommand =
function(args) {
	this._setAction("New Note", "NewNote");
	DBG.println("args = "+args);

	var fields = {};
	
	this._setTextField("Note", args, null, null, "300px");
	fields["Note"] = 1;
	this._fieldsToDisplay(fields);
};
	
ZmAssistantDialog.prototype._newMessageCommand =
function(args) {
	this._setAction(ZmMsg.newEmail, "NewMessage");
	DBG.println("args = "+args);

	var fields = {};

	args = this._genericWordField("To", "to", args, fields);
	args = this._genericWordField("Cc", "cc", args, fields);
	args = this._genericTextField("Subject", "subject", args, fields);	
	
//	args = this._genericTextField("Body", "body", args, fields);		
	this._setTextField("Body", args, null, null, "300px");
	fields["Body"] = 1;

	this._fieldsToDisplay(fields);
};

ZmAssistantDialog.prototype._setField = 
function(title, value, isDefault, htmlEncode) {
	var color = isDefault ? 'gray' : 'black';
	var fontStyle = isDefault ? 'italic' : 'normal';
	var fieldData = this._fields[title];
	if (htmlEncode) value = AjxStringUtil.htmlEncode(value);
	if (fieldData) {
		var divEl = document.getElementById(fieldData.id);
		divEl.innerHTML = value;
		if (color) divEl.style.color = color;
		if (fontStyle) divEl.style.fontStyle = fontStyle;
	} else {
		var html = new AjxBuffer();
		var id = Dwt.getNextId();
		html.append("<td class='ZmApptTabViewPageField'>", AjxStringUtil.htmlEncode(title), ":</td>");
		html.append("<td><div id='", id, "'");
		if (color||fontStyle) {
			html.append(" style='");
			if (color) html.append("color: ", color, ";")
			if (fontStyle) html.append(" font-style: ", fontStyle, ";")
			html.append("' ");			
		}
		html.append(">", value, "</div></td>");
		var row = this._tableEl.insertRow(-1);
		row.innerHTML = html.toString();
		this._fields[title] = { id: id, rowEl: row };
	}
};

ZmAssistantDialog.prototype._setTextField = 
function(title, value, size, maxlength, width, color) {
	var fieldData = this._fields[title];
	if (fieldData) {
		fieldData.inputEl.value = value;
	} else {
		var html = new AjxBuffer();
		var id = Dwt.getNextId();
		html.append("<td class='ZmApptTabViewPageField'>");
		html.append(title);
		html.append(":</td><td colspan=2><div>");
		html.append("<input readonly autocomplete='off' type='text'");
		html.append(" id='", id, "'");
		if (width || color) {
			html.append(" style='");
			if (color) html.append("color: ", color, ";")
			if (width) html.append("width:", width, ";");
			html.append("' ");			
		}
		if (value) html.append(" value='", value, "'");
		if (size) html.append(" size='", size, "'");
		if (maxlength) html.append(" maxlength='", maxlength, "'");	
		html.append("></input>");
		html.append("</div></td>");
		var row = this._tableEl.insertRow(-1);
		row.innerHTML = html.toString();
		var inputEl = document.getElementById(id);
		inputEl.value = value;
		this._fields[title] = { inputEl: inputEl, rowEl: row };
	}
};

ZmAssistantDialog.prototype._setDateField = 
function(title, date, isAllDay) {
	var dateValue = DwtCalendar.getDateFullFormatter().format(date);
	var timeValue = AjxDateUtil.computeTimeString(date);
	var html = new AjxBuffer();
	html.append("<table border=0 cellpadding=0 cellspacing=0><tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(dateValue), "</td>");
	html.append("</td><td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
	html.append("<td>", AjxStringUtil.htmlEncode(timeValue), "</td>");	
	html.append("</tr></table>");
	this._setField(title, html, false, false);
};

ZmAssistantDialog.prototype._setDateFields = 
function(startDate, startTime, endDate, endTime) {
	var startDateValue = DwtCalendar.getDateFullFormatter().format(startDate);
	var sameDay = false;
	var html = new AjxBuffer();
	html.append("<table border=0 cellpadding=0 cellspacing=0>");
	html.append("<tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(startDateValue), "</td>");
	if (startTime) {
		var startTimeValue = AjxDateUtil.computeTimeString(startDate);
		html.append("<td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
		html.append("<td>", AjxStringUtil.htmlEncode(startTimeValue), "</td>");
		sameDay = endDate && endDate.getFullYear() == startDate.getFullYear() && 
			endDate.getMonth() == startDate.getMonth() && endDate.getDate() == startDate.getDate();
		if (sameDay) {
			var endTimeValue = AjxDateUtil.computeTimeString(endDate);
			html.append("<td>&nbsp;-&nbsp;</td>");
			html.append("<td>", AjxStringUtil.htmlEncode(endTimeValue), "</td>");
		}
	}
	html.append("</tr>");
	if (endDate && !sameDay) {
		var endDateValue = DwtCalendar.getDateFullFormatter().format(endDate);
		html.append("<tr>");
		html.append("<td>", AjxStringUtil.htmlEncode(endDateValue), "</td>");
		if (startTime) { // display end time if a startTime was specified
			var endTimeValue = AjxDateUtil.computeTimeString(endDate);
			html.append("<td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
			html.append("<td>", AjxStringUtil.htmlEncode(endTimeValue), "</td>");
		}
		html.append("</tr>");
	}
	html.append("</table>");
	this._setField(ZmMsg.when, html, false, false);
};

ZmAssistantDialog.prototype._setActionField = 
function(value, icon) {
	var html = new AjxBuffer();
	html.append("<table><tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(value), "</td>");	
	html.append("<td>", AjxImg.getImageHtml(icon), "</td>");
	html.append("</<tr></table>");
	this._setField(ZmMsg.action, html, false, false);	
};

ZmAssistantDialog.prototype._setDefaultAction = 
function() {
	this._fieldsToDisplay({});		
	this._setField(ZmMsg.action, "available actions: appt, contact, empty, message",  true, true);
};	
	
ZmAssistantDialog.prototype._setAction = 
function(value, icon) {
	if (this._actionValue == value) return;
	this._actionValue = value;

	if (value == null) {
		if (this._actionRowEl != null) {
			this._actionHrEl.parentNode.removeChild(this._actionHrEl);
			this._actionRowEl.parentNode.removeChild(this._actionRowEl);
			this._actionHrEl = null;
			this._actionRowEl = null;
			this._fieldsToDisplay({});
		}
		return;	
	}

	if (this._actionRowEl == null) {
		this._actionHrEl = this._tableEl.insertRow(-1);
		this._actionHrEl.innerHTML = "<td colspan=3><hr></td>";
		this._actionRowEl = this._tableEl.insertRow(-1);
	}

	var html = new AjxBuffer();
	html.append("<td class='ZmApptTabViewPageField'>");
	html.append("Action");
	html.append(":</td><td colspan=2>");
	html.append("<table><tr>");
	html.append("<td>", value, "</td>");	
	html.append("<td>", AjxImg.getImageHtml(icon), "</td>");
	html.append("</<tr></table>");
	html.append("</td>");
	
	this._actionRowEl.innerHTML = html.toString();
};

ZmAssistantDialog.prototype._addCommand = 
function(html, value) {
	var id = Dwt.getNextId();
	html.append("<tr><td colspan=3><div>");
	html.append("<textarea rows=1 style='width:100%' id='",id,"'>");
	html.append(value);
	html.append("</textarea>");
	html.append("</div></td></tr>");
	return id;
};

/*
*
* @param ev		[DwtEvent]		event
*/
ZmAssistantDialog.prototype._okButtonListener =
function(ev) {
	this.popdown();
};

ZmAssistantDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};
