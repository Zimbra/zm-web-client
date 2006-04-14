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

function ZmAssistant(appCtxt) {
	if (arguments.length == 0) return;
	this._appCtxt = appCtxt;
	this._objectManager = new ZmObjectManager(null, this._appCtxt, null);
	this._fields = {};	
	
};

ZmAssistant.prototype.constructor = ZmAssistant;

// called first time dialog switches to this assistant
ZmAssistant.prototype.initialize =
function(dialog) {
	var html = new AjxBuffer();
	this._tableId = Dwt.getNextId();
	html.append("<table cellspacing=3 border=0 width=100% id='", this._tableId, "'>");
	html.append("</table>");	
	dialog.setAssistantContent(html.toString());
};

// called when dialog switches away from this assistant
ZmAssistant.prototype.finish =
function(dialog) {
	this._clearFields();
};

ZmAssistant.prototype.handle =
function(dialog, verb, line) {
	//override
};

ZmAssistant.prototype.okHandler =
function(dialog) {
	return true; //override
};

ZmAssistant.prototype._matchTime =
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

ZmAssistant._BRACKETS = "ZmAssistantBrackets";
ZmAssistant._PARENS = "ZmAssistantParens";

ZmAssistant.prototype._matchTypedObject =
function(args, objType, obj) {
	
	var match;
	var matchIndex = 0;
	
	if (objType == ZmAssistant._BRACKETS) {
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
	

	return {data: match[matchIndex], args: args, type: type};
};

ZmAssistant.prototype._clearField = 
function(title) {
	var fieldData = this._fields[title];
	if (fieldData) {
		fieldData.rowEl.parentNode.removeChild(fieldData.rowEl);
		delete this._fields[title];
	}
}

ZmAssistant.prototype._setOptField = 
function(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign) {
	if (value && value != "") {
		this._setField(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign);
	} else {
		this._clearField(title);
	}
}

ZmAssistant.prototype._setField = 
function(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign) {
	var cname =  isDefault ? "ZmAsstFieldDefValue" : "ZmAsstField";

	var fieldData = this._fields[title];
	if (htmlEncode) value = AjxStringUtil.htmlEncode(value);
	if (fieldData) {
		var divEl = document.getElementById(fieldData.id);
		divEl.innerHTML = value;
		divEl.className = cname;
	} else {
		var html = new AjxBuffer();
		var id = Dwt.getNextId();
		html.append("<td valign='", titleAlign ? titleAlign : "top", "' class='ZmAsstFieldLabel'>", AjxStringUtil.htmlEncode(title), ":</td>");
		html.append("<td><div id='", id, "' class='", cname, "'>", value, "</div></td>");
		var rowIndex = -1;
		if (afterRowTitle) {
			var afterRow = this._fields[afterRowTitle];
			if (afterRow) rowIndex = afterRow.rowEl.rowIndex+1;
		}
		var tableEl = document.getElementById(this._tableId);
		var row = tableEl.insertRow(rowIndex);
		row.innerHTML = html.toString();
		this._fields[title] = { id: id, rowEl: row };
	}
};

ZmAssistant.prototype._clearFields =
function() {
	for (var field in this._fields) {
		this._clearField(field);
	}
};
