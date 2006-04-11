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
	this._objectManager = new ZmObjectManager(null, this._appCtxt, null);		

	// only trigger matching after a sufficient pause
	this._pasrseInterval = this._appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	this._parseTimedAction = new AjxTimedAction(this, this._parseAction);
	this._parseActionId = -1;
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
	
	html.append("<table cellspacing=3 border=0 width=400 id='", this._tableId, "'>");
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
	// reset timer on key activity
	if (this._parseActionId != -1) 	AjxTimedAction.cancelAction(this._parseActionId);
	this._parseActionId = AjxTimedAction.scheduleAction(this._parseTimedAction, this._parseInterval);
}

ZmAssistantDialog.prototype._parseAction =
function() {
	var cmd = this._commandEl.value.replace(/^\s*/, '');
	var match = cmd.match(/^(appt|contact|new|empty)\b\s*/);
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
	else if (mainCommand == 'contact') 
		this._newContactCommand(args);		
	else if (mainCommand == 'new')
		this._newCommand(args);
	else if (mainCommand == 'empty')
		this._emptyCommand(args);	
	else {
		this._setDefaultAction();		
	}
};

ZmAssistantDialog.prototype._newCommand =
function(args) {
	DBG.println("new = "+args);
	var match = args.match(/\s*(\w+)\s*/);
	if (!match) return;
	var obj = match[1];
	DBG.println("object = "+obj);
	args = args.substring(match[0].length);
	if (obj == 'appt') this._newApptCommand(args);
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
	var match;

//	DBG.println("args = "+args);

	var loc = null;
	match = args.match(/\s*\[([^\]]*)\]?\s*/);	
	if (match) {
		loc = match[1];
		args = args.replace(match[0], " ");
	}

	var notes = null;
	match = args.match(/\s*\(([^)]*)\)?\s*/);
	if (match) {
		notes = match[1];
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

	// look for start date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		startDate = match.context.date;
		if (startTime) startDate.setHours(startTime.hour, startTime.minute);
	}
	
	// look for end date
	match = this._objectManager.findMatch(args, ZmObjectManager.DATE);
	if (match) {
		args = args.replace(match[0], " ");
		endDate = match.context.date;
		if (endTime != null) endDate.setHours(endTime.hour, endTime.minute);
		else if (startTime != null) endDate.setHours(startTime.hour, startTime.minute);
	} else {
		if (endTime) {
			endDate = new Date(startDate.getTime());
			if (endTime != null) endDate.setHours(endTime.hour, endTime.minute);			
		} else if (startTime) {
			endDate = new Date(startDate.getTime() + 1000 * 60 * 60);
		}
	}
	
	var subject = null;
	match = args.match(/\s*\"([^\"]*)\"?\s*/);
	if (match) {
		subject = match[1];
		args = args.replace(match[0], " ");
	}

	var repeat = null;
	match = args.match(/\s*repeats?\s+(\S+)\s*/);	
	if (match) {
		repeat = match[1];
		args = args.replace(match[0], " ");
	}

	match = args.match(/\s*invite\s+(\S+)\s*/);
	if (match) {
		args = args.replace(match[0], " ");
	}

	if (subject == null) {
		subject = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' ');
	}

	var subStr = AjxStringUtil.convertToHtml(subject == "" ? "\"enclose subject in quotes or just type\"" : subject);
	var locStr = AjxStringUtil.convertToHtml(loc == null ? "[enclose location in brackets]" : loc);
	var notesStr = AjxStringUtil.convertToHtml(notes == null ? "(enclose notes in parens)" : notes);
	this._setField(ZmMsg.subject, subStr, subject == "", false);
	this._setDateFields(startDate, startTime, endDate, endTime);
	this._setField(ZmMsg.location, locStr, loc == null, false);	
	this._setField(ZmMsg.notes, notesStr, notes == null, false);
	this._setOptField(ZmMsg.repeat, repeat, false, true);
	return;

};

ZmAssistantDialog._BRACKETS = "ZmAssistantDialogBrackets";
ZmAssistantDialog._PARENS = "ZmAssistantDialogParens";

ZmAssistantDialog.prototype._matchTypedObject =
function(args, objType, obj) {
	
	var match;
	var matchIndex = 0;
	
	if (objType == ZmAssistantDialog._BRACKETS) {
		match = args.match(/\s*\[([^\]]*)\]?\s*/);
		matchIndex = 1;
	} else {
		match = this._objectManager.findMatch(args, objType);
	}
	if (!match) return null;

	var type = obj.defaultType;
	var matchType = null;
	if (match.index > 0) {
		// check for a type
		var targs = args.substring(0, match.index);
		matchType = targs.match(/\b(\w+):\s*$/i);
		if (matchType) {
			type = matchType[1].toLowerCase();
		}
	}
	if (matchType) {
		args = args.replace(matchType[0]+match[0], " ");
	} else {
		args = args.replace(match[0], " ");
	}

	if (obj.aliases) {
		var real = obj.aliases[type];
		if (real) type = real;
	}
	
	var fieldData = ZmAssistantDialog._CONTACT_FIELDS[type];
	if (fieldData) type = fieldData.key;

	return {data: match[matchIndex], args: args, type: type};
};

ZmAssistantDialog._CONTACT_FIELD_ORDER = [
     'title', 'company',
	 'e', 'e2', 'e3', 
	 'wp', 'w2', 'm', 'p', 'wf', 'a', 'c', 'cp', 'cbp',  'wa', 'wu',
	 'hp', 'h2', 'hf', 'ha', 'hu',
	 'op', 'of', 'oa', 'ou', 'notes'
];

ZmAssistantDialog._CONTACT_FIELDS = {
	  a: { field: ZmMsg.AB_FIELD_assistantPhone, key: 'a' },
	  c: { field: ZmMsg.AB_FIELD_carPhone, key: 'c' },
	cbp: { field: ZmMsg.AB_FIELD_callbackPhone, key: 'cbp' },
company: { field: ZmMsg.AB_FIELD_company, key: 'company' },
	 cp: { field: ZmMsg.AB_FIELD_companyPhone, key: 'cp' },
	  e: { field: ZmMsg.AB_FIELD_email, key: 'e', defaultValue: 'enter an email address'},
	 e2: { field: ZmMsg.AB_FIELD_email2, key: 'e2' },
	 e3: { field: ZmMsg.AB_FIELD_email3, key: 'e3' },
	  f: { field: ZmMsg.AB_FIELD_workFax, key: 'wf' }, // alias f to wf
	 h2: { field: ZmMsg.AB_FIELD_homePhone2, key: 'h2' }, 
	 ha: { field: ZmMsg.AB_ADDR_HOME, key: 'ha', multiline: true },
	 hf: { field: ZmMsg.AB_FIELD_homeFax, key: 'hf' },
	 hp: { field: ZmMsg.AB_FIELD_homePhone, key: 'hp' },
	 hu: { field: ZmMsg.AB_HOME_URL, key: 'hu' },
jobtitle:{ field: ZmMsg.AB_FIELD_jobTitle, key: 'title' },	 // alias jobtitle to title
	  m: { field: ZmMsg.AB_FIELD_mobilePhone, key: 'm' },
  notes: { field: ZmMsg.notes, key: 'notes', multiLine: true, defaultValue: '(enclose notes in parens)' },	  
	 oa: { field: ZmMsg.AB_ADDR_OTHER, key: 'oa', multiLine: true },
	 of: { field: ZmMsg.AB_FIELD_otherFax, key: 'of' },
	 op: { field: ZmMsg.AB_FIELD_otherPhone, key: 'op' },
	 ou: { field: ZmMsg.AB_OTHER_URL, key: 'ou' },
	  p: { field: ZmMsg.AB_FIELD_pager, key: 'p' },
  title: { field: ZmMsg.AB_FIELD_jobTitle, key: 'title' },
	 w2: { field: ZmMsg.AB_FIELD_workPhone2, key: 'w2' },
	 wa: { field: ZmMsg.AB_ADDR_WORK, key: 'wa', multiLine: true },
	 wf: { field: ZmMsg.AB_FIELD_workFax, key: 'wf' },
	 wp: { field: ZmMsg.AB_FIELD_workPhone, key: 'wp' },
	 wu: { field: ZmMsg.AB_WORK_URL, key: 'wu' }
};

ZmAssistantDialog._CONTACT_OBJECTS = { };
ZmAssistantDialog._CONTACT_OBJECTS[ZmObjectManager.URL] = { defaultType: 'wu', aliases: { w: 'wu', h: 'hu', o: 'ou' }};
ZmAssistantDialog._CONTACT_OBJECTS[ZmObjectManager.PHONE] = { defaultType: 'wp', aliases: { w: 'wp', h: 'hp', o: 'op' }};
ZmAssistantDialog._CONTACT_OBJECTS[ZmObjectManager.EMAIL] = { defaultType: 'e' };
ZmAssistantDialog._CONTACT_OBJECTS[ZmAssistantDialog._BRACKETS] = { defaultType: 'wa', aliases: { w: 'wa', h: 'ha', o: 'oa' }};

// check address first, since we grab any fields quoted with [], objects in them won't be matched later
ZmAssistantDialog._CONTACT_OBJECT_ORDER = [
	ZmAssistantDialog._BRACKETS, ZmObjectManager.PHONE, ZmObjectManager.URL, ZmObjectManager.EMAIL
];

ZmAssistantDialog.prototype._newContactCommand =
function(args) {
	this._setActionField(ZmMsg.newContact, "NewContact");
	var match;
	var objects = {};	
		
	// check address first, since we grab any fields quoted with [], objects in them won't be matched later
	for (var i = 0; i < ZmAssistantDialog._CONTACT_OBJECT_ORDER.length; i++) {
		var objType = ZmAssistantDialog._CONTACT_OBJECT_ORDER[i];
		var obj = ZmAssistantDialog._CONTACT_OBJECTS[objType];
		while (match = this._matchTypedObject(args, objType, obj)) {
			var field = ZmAssistantDialog._CONTACT_FIELDS[match.type];
			var type = field ? field.key : match.type;
			objects[type] = match;
			args = match.args;
		}
	}

	if (!objects.notes) {
		match = args.match(/\s*\(([^)]*)\)?\s*/);
		if (match) {
			objects.notes = {data : match[1] };
			args = args.replace(match[0], " ");
		}
	}

	var remaining = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' ').split(",", 3);
	var fullName = remaining[0];

	if (!objects.title) objects.title = { data : remaining[1] ? remaining[1] : ""};
	if (!objects.company) objects.company = { data: remaining[2] ? remaining[2] : ""};	

	this._setField(ZmMsg.AB_FIELD_fullName, fullName == "" ? "type to enter fullname, title, company" : fullName, fullName == "", true);
	
	for (var i=0; i < ZmAssistantDialog._CONTACT_FIELD_ORDER.length; i++) {	
		var key = ZmAssistantDialog._CONTACT_FIELD_ORDER[i];
		var data = objects[key];
		var field = ZmAssistantDialog._CONTACT_FIELDS[key];
		var value = (data && data.data) ? data.data : null;
		if (value != null) {
			value = field.multiLine ? AjxStringUtil.convertToHtml(value) : AjxStringUtil.htmlEncode(value);
		}
		if (field.defaultValue) {
			var useDefault = (value == null || value == "");
			this._setField(field.field, useDefault ? field.defaultValue : value, useDefault, false);
		} else {
			this._setOptField(field.field, value, false, false);
		}
	}
	return;
};

ZmAssistantDialog.prototype._emptyCommand =
function(args) {
	this._setActionField(ZmMsg.empty, "Trash");
	var match = args.match(/\s*(\w+)\s*/);
	var folder = match ? match[1] : null;

	if (folder == 'trash' || folder == 'junk') {
		this._setOptField(ZmMsg.folder, folder, false, true);
	} else {
		this._setOptField(ZmMsg.folder, "trash or junk", true, true);
	}
}

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

ZmAssistantDialog.prototype._clearField = 
function(title) {
	var fieldData = this._fields[title];
	if (fieldData) {
		fieldData.rowEl.parentNode.removeChild(fieldData.rowEl);
		delete this._fields[title];
	}
}

ZmAssistantDialog.prototype._setOptField = 
function(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign) {
	if (value && value != "") {
		this._setField(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign);
	} else {
		this._clearField(title);
	}
}

ZmAssistantDialog.prototype._setField = 
function(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign) {
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
		html.append("<td valign='", titleAlign ? titleAlign : "top", "' class='ZmApptTabViewPageField'>", AjxStringUtil.htmlEncode(title), ":</td>");
		html.append("<td><div id='", id, "'");
		if (color||fontStyle) {
			html.append(" style='");
			if (color) html.append("color: ", color, ";")
			if (fontStyle) html.append(" font-style: ", fontStyle, ";")
			html.append("' ");			
		}
		html.append(">", value, "</div></td>");
		var rowIndex = -1;
		if (afterRowTitle) {
			var afterRow = this._fields[afterRowTitle];
			if (afterRow) rowIndex = afterRow.rowEl.rowIndex+1;
		}
		var row = this._tableEl.insertRow(rowIndex);
		row.innerHTML = html.toString();
		this._fields[title] = { id: id, rowEl: row };
	}
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
	html.append("</tr></table>");	
	var doEnd = (endDate && !sameDay);
	
	if (doEnd) {
		this._clearField(ZmMsg.time);
		this._setField(ZmMsg.startTime, html.toString(), false, false, ZmMsg.subject);
		
		html.clear();
		var endDateValue = DwtCalendar.getDateFullFormatter().format(endDate);
			html.append("<table border=0 cellpadding=0 cellspacing=0>");		
		html.append("<tr>");
		html.append("<td>", AjxStringUtil.htmlEncode(endDateValue), "</td>");
		if (startTime) { // display end time if a startTime was specified
			var endTimeValue = AjxDateUtil.computeTimeString(endDate);
			html.append("<td></td><td>&nbsp;</td><td>@</td><td>&nbsp;</td>");
			html.append("<td>", AjxStringUtil.htmlEncode(endTimeValue), "</td>");
		}
		html.append("</tr></table>");
		this._setField(ZmMsg.endTime, html.toString(), false, false, ZmMsg.startTime);
		
	} else {
		this._setField(ZmMsg.time, html.toString(), false, false, ZmMsg.subject);
		this._clearField(ZmMsg.startTime);
		this._clearField(ZmMsg.endTime);		
	}
};

ZmAssistantDialog.prototype._setActionField = 
function(value, icon) {
	var html = new AjxBuffer();
	html.append("<table><tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(value), "</td>");	
	html.append("<td>", AjxImg.getImageHtml(icon), "</td>");
	html.append("</<tr></table>");
	this._setField(ZmMsg.action, html, false, false, null, 'middle');
};

ZmAssistantDialog.prototype._setDefaultAction = 
function() {
	this._fieldsToDisplay({});		
	this._setField(ZmMsg.action, "available actions: appt, contact, empty, message",  true, true, null, 'middle');
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
	html.append("<textarea rows=2 style='width:100%' id='",id,"'>");
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

	
ZmAssistantDialog.prototype._genericTextField =
function(title, str, args, fields) {
	var regex = new RegExp("\\s*\\b(?:"+str+")\\s+\\\"([^\\\"]*)\\\"?\\s*", "i");
	var match = args.match(regex);
	if (match) {
		var  val = match[1];
		//this._setTextField(title, val, null, null, "300px");
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
		//this._setTextField(title, val, null, null, "300px");
		fields[title] = 1;
		args = args.replace(match[0], " ");
	}
	return args;
};

ZmAssistantDialog.prototype._fieldsToDisplay =
function(fields) {
	for (var field in this._fields) {
		if (!(field in fields)) {
			this._clearField(field);
		}
	}
};
