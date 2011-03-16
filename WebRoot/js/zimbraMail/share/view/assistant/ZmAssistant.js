/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010, 2011 Zimbra, Inc.
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
 */

/**
 * Creates the assistant.
 * @class
 * This class represents an assistant.
 * 
 * @param	{String}	title		the title
 * @param	{String}	command		the command
 * @param	{String}	commandSummary		the summary
 */
ZmAssistant = function(title, command, commandSummary) {
	if (arguments.length == 0) { return; }
	this._objectManager = new ZmObjectManager();
    try {
        if (window.ZmDate10ObjectHandler) {
		     this._objectManager.addHandler(new ZmDate10ObjectHandler(), ZmObjectManager.DATE, 100);
        }
    } catch(e) {

    }
    this._fields = {};
	this._title = title;
	this._commandSummary = commandSummary ? commandSummary : title;
	this._command = command;
};

ZmAssistant.prototype.constructor = ZmAssistant;

ZmAssistant.SPACE = "[\\s\\u00a0\\u2000-\\u200B\\u202F\\u3000]";
ZmAssistant.NONSPACE = "[^\\s\\u00a0\\u2000-\\u200B\\u202F\\u3000]";

ZmAssistant.SPACES = ZmAssistant.SPACE+"*";
ZmAssistant.WORD = ZmAssistant.NONSPACE+"+";

ZmAssistant.LEADING_SPACE = "^"+ZmAssistant.SPACES;
ZmAssistant.TRAILING_SPACE = ZmAssistant.SPACES+"$";

ZmAssistant.RE_trimLeading = new RegExp(ZmAssistant.LEADING_SPACE);
ZmAssistant.RE_trimTrailing = new RegExp(ZmAssistant.LEADING_SPACE);
ZmAssistant.RE_normalizeSpaces = new RegExp(ZmAssistant.SPACE+"+","g");

ZmAssistant.trimLeading = function(s) { return s.replace(ZmAssistant.RE_trimLeading,""); };
ZmAssistant.trimTrailing = function(s) { return s.replace(ZmAssistant.RE_trimTrailing,""); };
ZmAssistant.trim = function(s) { return ZmAssistant.trimLeading(ZmAssistant.trimTrailing(s)); };
ZmAssistant.normalize = function(s) { return s.replace(ZmAssistant.RE_normalizeSpaces," "); };
ZmAssistant.split = function(s) { return s.split(ZmAssistant.RE_normalizeSpaces); };

ZmAssistant._handlers = {};
ZmAssistant._commands = [];
ZmAssistant._allCommands = []; // inclde . commands

/**
 * Registers the handler.
 * 
 * @param	{ZmAssistant}		handler		the handler
 * @param	{String}			[name]		the name
 */
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

/**
 * Matches the word.
 * 
 * @param	{String}	word		the word
 * @param	{Array}		words		an array of words
 * @return	{Array} an array of matched words or an empty array for none
 */
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

/**
 * Gets the handler by name.
 * 
 * @param	{String}	name		the name
 * @return	{ZmAsssitant}		the handler
 */
ZmAssistant.getHandler = 
function(name) {
	return ZmAssistant._handlers[name];	
};

/**
 * Gets the handler commands.
 * 
 * @return	{Array}	an array of {String} commands
 */
ZmAssistant.getHandlerCommands = 
function() {
	return ZmAssistant._commands;
};

/**
 * Initializes the assistant and is called first time dialog switches to this assistant.
 * 
 * @param	{ZmAssistantDialog}		dialog		the dialog
 */
ZmAssistant.prototype.initialize =
function(dialog) {
	var html = new AjxBuffer();
	this._tableId = Dwt.getNextId();
	html.append("<table cellspacing='3' border='0' width='100%'><tbody id='", this._tableId, "'>");
	html.append("</tbody></table>");
	dialog.setAssistantContent(html.toString());
};

/**
 * Finishes the assistant and is called when dialog switches away from this assistant.
 * 
 * @param	{ZmAssistantDialog}		dialog		the dialog
 */
ZmAssistant.prototype.finish =
function(dialog) {
	this._clearFields();
};

/**
 * Gets the title.
 * 
 * @return	{String}		the title
 */
ZmAssistant.prototype.getTitle =
function() {
	return this._title;
};

/**
 * Gets the command.
 * 
 * @return	{String}		the command
 */
ZmAssistant.prototype.getCommand =
function() {
	return this._command;
};

/**
 * Gets the command summary.
 * 
 * @return	{String}		the command summary
 */
ZmAssistant.prototype.getCommandSummary =
function() {
	return this._commandSummary;
};

/**
 * Handles the verb.
 * 
 * @param	{ZmAssistantDialog}		the dialog
 * @param	{String}		verb	the verb
 * @param	{Hash}			line	arguments
 * 
 * @private
 */
ZmAssistant.prototype.handle =
function(dialog, verb, line) {
	//override
};

/**
 * Handles the OK event.
 * 
 * @param	{ZmAssistantDialog}		the dialog
 * @return	{Boolean}	<code>true</code> if the event is handled
 */
ZmAssistant.prototype.okHandler =
function(dialog) {
	return true; //override
};

/**
 * Gets the help.
 * 
 * @return	{String}	the help HTML
 */
ZmAssistant.prototype.getHelp = 
function() {
	return null; //override
};

/**
 * Handles the extra button event.
 * 
 * @param	{ZmAssistantDialog}		the dialog
 * @return	{Boolean}	<code>true</code> if the event is handled
 */
ZmAssistant.prototype.extraButtonHandler =
function(dialog) {
	return true; //override
};

ZmAssistant.__RE_matchTimeMatch1 = new RegExp([
    ZmAssistant.SPACES,
    "(?:(?:@|at|\\-)",ZmAssistant.SPACES,")?(\\d+):(\\d\\d)(?:",ZmAssistant.SPACES,"(AM|PM))?",
    ZmAssistant.SPACES
].join(""),"i");
ZmAssistant.__RE_matchTimeMatch2 = new RegExp([
    ZmAssistant.SPACES,
    "(?:(?:@|at|\\-)",ZmAssistant.SPACES,")?(\\d+)(AM|PM)",
    ZmAssistant.SPACES
].join(""),"i");

ZmAssistant.prototype._matchTime =
function(args) {
	var hour, minute, ampm = null;
	var match1 = args.match(ZmAssistant.__RE_matchTimeMatch1);
	var match2 = args.match(ZmAssistant.__RE_matchTimeMatch2);
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

ZmAssistant.__RE_matchTypedObjectBrackets = new RegExp([
    ZmAssistant.SPACES,"\\[([^\\]]*)\\]?",ZmAssistant.SPACES
].join(""), "i");
ZmAssistant.__RE_matchTypedObjectType = new RegExp([
    "\\b(",ZmAssistant.WORD,"):",ZmAssistant.SPACES,"$"
].join(""), "i");

ZmAssistant.prototype._matchTypedObject =
function(args, objType, obj) {
	
	var match;
	var matchIndex = 0;
	
	if (objType == ZmAssistant._BRACKETS) {
		match = args.match(ZmAssistant.__RE_matchTypedObjectBrackets);
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
		matchType = targs.match(ZmAssistant.__RE_matchTypedObjectType);
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
