/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
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

function ZmAssistant(appCtxt, title, command, commandSummary) {
	if (arguments.length == 0) return;
	this._appCtxt = appCtxt;
	this._objectManager = new ZmObjectManager(null, this._appCtxt, null);
    try {
        if (ZmDate10ObjectHandler)
		     this._objectManager.addHandler(new ZmDate10ObjectHandler(appCtxt), ZmObjectManager.DATE, 100);
    } catch(e) {

    }
    this._fields = {};
	this._title = title;
	this._commandSummary = commandSummary ? commandSummary : title;
	this._command = command;
};

ZmAssistant.prototype.constructor = ZmAssistant;


ZmAssistant._handlers = {};
ZmAssistant._commands = [];
ZmAssistant._allCommands = []; // inclde . commands

ZmAssistant.register = 
function(handler, name) {
	if (name == null) name = handler.getCommand();
	if (name in ZmAssistant._handlers) return; // need to alert/error out and/or deal with dups!
	ZmAssistant._handlers[name] = handler;
	ZmAssistant._allCommands.push(name);
	ZmAssistant._allCommands.sort();
	if (name.substring(0,1) != ".") {
		ZmAssistant._commands.push(name);
		ZmAssistant._commands.sort();		
	}
};

ZmAssistant.matchWord = 
function(word, words) {
	if (words == null) words = ZmAssistant._allCommands;
	var i;
	var matched = [];
	for (i in words) {
		var n = words[i];
		if (n == word) return [n];
		else if (n.substring(0, word.length) == word) {
			matched.push(n);
		}
	}
	return matched;
};

ZmAssistant.getHandler = 
function(name) {
	return ZmAssistant._handlers[name];	
};

ZmAssistant.getHandlerCommands = 
function() {
	return ZmAssistant._commands;
};

// called first time dialog switches to this assistant
ZmAssistant.prototype.initialize =
function(dialog) {
	var html = new AjxBuffer();
	this._tableId = Dwt.getNextId();
	html.append("<table cellspacing='3' border='0' width='100%'><tbody id='", this._tableId, "'>");
	html.append("</tbody></table>");
	dialog.setAssistantContent(html.toString());
};

// called when dialog switches away from this assistant
ZmAssistant.prototype.finish =
function(dialog) {
	this._clearFields();
};

ZmAssistant.prototype.getTitle =
function() {
	return this._title;
};

ZmAssistant.prototype.getCommand =
function() {
	return this._command;
};

ZmAssistant.prototype.getCommandSummary =
function() {
	return this._commandSummary;
};

ZmAssistant.prototype.handle =
function(dialog, verb, line) {
	//override
};

ZmAssistant.prototype.okHandler =
function(dialog) {
	return true; //override
};

ZmAssistant.prototype.getHelp = 
function() {
	return null; //override
};

ZmAssistant.prototype.extraButtonHandler =
function(dialog) {
	return true; //override
};

ZmAssistant.prototype._matchTime =
function(args) {
	var hour, minute, ampm = null;
	var match1 = args.match(/\s*(?:(?:@|at|\-)\s*)?(\d+):(\d\d)(?:\s*(AM|PM))?\s*/i);
	var match2 = args.match(/\s*(?:(?:@|at|\-)\s*)?(\d+)(AM|PM)\s*/i);	
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
		var rowEl = document.getElementById(fieldData.rowId);
		if (rowEl) rowEl.parentNode.removeChild(rowEl);
		delete this._fields[title];
	}
}

ZmAssistant.prototype._setOptField = 
function(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign) {
	if (value && value != "") {
		return this._setField(title, value, isDefault, htmlEncode, afterRowTitle, titleAlign);
	} else {
		this._clearField(title);
		return -1;
	}
}

ZmAssistant.prototype._setField = 
function(title, value, isDefault, htmlEncode, desiredRowIndex, titleAlign) {
	var cname =  isDefault ? "ZmAsstFieldDefValue" : "ZmAsstField";
	var rowIndex = -1;
	var fieldData = this._fields[title];
	if (htmlEncode) value = AjxStringUtil.htmlEncode(value);
	if (fieldData) {
		var rowEl = document.getElementById(fieldData.rowId);
		if (rowEl) rowIndex = rowEl.rowIndex;
		var divEl = document.getElementById(fieldData.id);
		divEl.innerHTML = value;
		divEl.className = cname;
	} else {
		var id = Dwt.getNextId();
		if (desiredRowIndex != null) rowIndex = desiredRowIndex;
		var tableEl = document.getElementById(this._tableId);
		var row = tableEl.insertRow(rowIndex);
		row.id = Dwt.getNextId();
		var cell1 = row.insertCell(-1);
		cell1.vAlign = titleAlign ? titleAlign : "top";
		cell1.className = 'ZmAsstFieldLabel';
		cell1.innerHTML = AjxStringUtil.htmlEncode(title+":");
		var cell2 = row.insertCell(-1);
		cell2.innerHTML = "<div id='"+id+"' class='"+cname+"'>"+value+"</div></td>";
		this._fields[title] = { id: id, rowId: row.id };
		rowIndex = row.rowIndex;
	}
	return rowIndex;
};

ZmAssistant.prototype._clearFields =
function() {
	for (var field in this._fields) {
		this._clearField(field);
	}
};
