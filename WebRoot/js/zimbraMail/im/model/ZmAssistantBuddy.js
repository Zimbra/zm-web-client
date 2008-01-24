/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmAssistantBuddy = function(list) {
	var assistant_rp = new ZmRosterPresence(ZmRosterPresence.SHOW_ONLINE, null, null);
	assistant_rp.getIcon = function() {
		return "ZimbraIcon";
	};
	ZmRosterItem.call(this, ZmAssistantBuddy.ADDR, list, ZmMsg.zimbraAssistant, assistant_rp);

	this.shell = appCtxt.getShell(); // FIXME: not sure this is needed, but it's accessed in some Assistant objects

	AjxDispatcher.require("Assistant");
};

ZmAssistantBuddy.prototype = new ZmRosterItem;
ZmAssistantBuddy.prototype.constructor = ZmAssistantBuddy;

ZmAssistantBuddy.ADDR = "internal://assistant";

ZmAssistantBuddy.prototype.isDefaultBuddy = function() {
	return true;
};

ZmAssistantBuddy.prototype.getDisplayName = function() {
	return ZmMsg.zimbraAssistant;
};

ZmAssistantBuddy.prototype.handleInput = function(args) {
//	console.log("Received: %s (%d:%d) %d / ENTER? %s", args.str, args.sel_start, args.sel_end, args.last_key, args.enter);

	var ret = { str  : null,
		    stop : true };

	// disallow leading space.
	if (/^\s+$/.test(args.str)) {
		ret.str = "";
		return ret;
	}

	if (args.enter && this._assistant) {
		this._assistant.okHandler(this);
		this._setDefault();
		ret.str = "";
		return ret;
	}

	var assistant = null;
	var cmd = args.str.replace(/^\s+/, "");
	var match = cmd.match(/^([\.\w]+)\s*(.*)/);
	if (match) {
		var rest = match[2];
		var mainCommand = match[1];
		var commands = ZmAssistant.matchWord(mainCommand);
		switch(commands.length) {
		    case 0:
			this._availableCommands = ZmMsg.ASST_availableCommands+ " " + ZmMsg.ASST_no_match;
			break;
		    case 1:
			assistant = ZmAssistant.getHandler(commands[0]);
			this._availableCommands = null;
			break;
		    default:
			this._availableCommands = ZmMsg.ASST_availableCommands+ " " + commands.join(", ");
			break;
		}
		if (assistant) {
			var realCommand = assistant.getCommand();
			if (mainCommand != realCommand &&
			    args.last_key != 8 && // BACKSPACE
			    args.last_key != 46 && // DELETE ?
			    (args.sel_start <= mainCommand.length ||
			     (args.sel_start == mainCommand.length + 1 && args.last_key == 32)))
			{
				ret.str = realCommand + " " + match[2];
				if (args.last_key != 32) {
					ret.sel_start = args.sel_start;
					ret.sel_end = realCommand.length;
					ret.sel_timeout = 1000;
					ret.sel_end2 = ret.sel_end + 1;
				} else {
					ret.sel_start = ret.sel_end = realCommand.length + 1;
				}
			}
		}
// 		if (assistant && mainCommand == cmd && this._assistant != assistant) {
// 			ret.str = assistant.getCommand() + " ";
// 			ret.sel_start = args.sel_start;
// 			ret.sel_end = ret.str.length;
// 			ret.sel_timeout = 1000;
// 		}
	} else {
		this._availableCommands = ZmMsg.ASST_availableCommands+ " " + ZmAssistant.getHandlerCommands().join(", ");
	}

	if (this._availableCommands)
		this._displayAvailableCommands();

	if (this._assistant != assistant) {
		this.clearLastMessage();
		if (this._assistant != null)
			this._assistant.finish(this);
		this._assistant = assistant;
		if (this._assistant) {
			// reset help/extra
			this._setHelpButton(null, true, true);
			this._setExtraButton(ZmMsg.moreDetails, false, false, true, null);
			this._assistant.initialize(this);
			var title = this._assistant.getTitle();
			if (title) this._setCommandTitle(title);
			var help = this._assistant.getHelp();
			this._setHelpButton(null, help != null, true);
		}
	}

	if (this._assistant) this._assistant.handle(this, null, rest);
	else this._setDefault();

	this.__widget.scrollTo(0);

	if (args.enter)
		ret.str = "";	// clear input field
	return ret;
};

ZmAssistantBuddy.prototype.chatStarted = function(chat, widget) {
	this.__chat = chat;
	this.__widget = widget;
	
	
	Dwt.addClass(widget.getHtmlElement(), "ZmAssistantChat");
	
	widget.getEditor().setMode(ZmLiteHtmlEditor.TEXT);
	
	widget.handleMessage(new ZmChatMessage({ from: ZmMsg.zimbraAssistant,
						 body: [ { _content: ZmMsg.zimbraAssistantWelcome } ]
					       }));

	this.__assistantButtonsDivId = Dwt.getNextId();
	this.__helpBtnId = Dwt.getNextId();
	this.__extraBtnId = Dwt.getNextId();
	this.__okBtnId = Dwt.getNextId();
	// "assistant content" DIV
	widget.handleHtmlMessage(
		[ "<div class='ZmChatWindowChatEntry ZmChatWindowChatEntryThem ZmAssistantButtons'><div id='",
		  this.__assistantButtonsDivId,
		  "'class='body'>",
		  "<table cellspacing='0' cellpadding='0' border='0'><tbody><tr>",
		  "<td><span class='ZButtonBorder' onclick='return ZmAssistantBuddy.buttonClicked(this, event, 0)' id='", this.__helpBtnId, "'>"+ZmMsg.help+"</span></td>",
		  "<td><span class='ZButtonBorder' onclick='return ZmAssistantBuddy.buttonClicked(this, event, 1)' id='", this.__extraBtnId, "'>"+ZmMsg.extra+"</span></td>",
		  "<td><span class='ZButtonBorder' onclick='return ZmAssistantBuddy.buttonClicked(this, event, 2)' id='", this.__okBtnId, "'>"+ZmMsg.ok+"</span></td>",
		  "</tr></tbody></table>",
		  "</div></div>" ].join("")
	);

	this.__availableCommandsDivId = Dwt.getNextId();
	// "available commands" DIV
	widget.handleHtmlMessage(
		[ "<div class='ZmChatWindowChatEntry ZmChatWindowChatEntryThem'><div id='",
		  this.__availableCommandsDivId,
		  "'class='body'></div></div>" ].join("")
	);

	this.__assistantContentDivId = Dwt.getNextId();
	// "assistant content" DIV
	widget.handleHtmlMessage(
		[ "<div class='ZmChatWindowChatEntry ZmChatWindowChatEntryThem'><div id='",
		  this.__assistantContentDivId,
		  "'class='body'></div></div>" ].join("")
	);

	// make sure assistants are ready to go
	ZmAssistantDialog.initializeAssistants();

	// this.handleInput({ str: "", sel_start: 0, sel_end: 0 });
	this._setDefault();
};

ZmAssistantBuddy.buttonClicked = function(span, ev, type) {
	var dwtEv = DwtShell.mouseEvent;
	dwtEv.setFromDhtmlEvent(ev);
	var widget = DwtUiEvent.getDwtObjFromEvent(dwtEv);
	while (widget && !(widget instanceof ZmChatWidget))
		widget = widget.parent;
	var self = widget.chat.getRosterItem(0);
	var assistant = self._assistant;
	switch (type) {
	    case 0: // HELP
		if (assistant) {
			var help = assistant.getHelp();
			if (help != null)
				self.messageDialog(help, DwtMessageDialog.INFO_STYLE);
		} else {
			var html = new AjxBuffer();
			html.append(ZmMsg.ASST_HELP);
			html.append("<table cellspacing=1 cellpadding=2 border=0>");
			var cmds = ZmAssistant.getHandlerCommands();
			for (var i=0; i < cmds.length; i++) {
				var handler = ZmAssistant.getHandler(cmds[i]);
				html.append("<tr><td><b>", AjxStringUtil.htmlEncode(handler.getCommand()), "</b></td><td>&nbsp;</td><td>", AjxStringUtil.htmlEncode(handler.getCommandSummary()),"</td></tr>");
			}
			html.append("</table>");
			self.messageDialog(html.toString(), DwtMessageDialog.INFO_STYLE);
		}
		break;

	    case 1: // EXTRA
		if (assistant)
			assistant.extraButtonHandler(this);
		break;

	    case 2: // OK
		if (assistant) {
			assistant.okHandler(this);
			this._setDefault();
		}
		break;
	}
};

// ZmAssistantBuddy.prototype.getIcon = function() {
// 	return "ZimbraIcon";
// };

// ZmAssistantBuddy.prototype.getName = function() {
// 	return ZmMsg.zimbraAssistant;
// };




//!!! in order to use the existing Assistant framework, we need to
//    define some functions that are called in various assistants on
//    the dialog object.

ZmAssistantBuddy.prototype.setAssistantContent = function(html) {
	document.getElementById(this.__assistantContentDivId).innerHTML = html;
};

ZmAssistantBuddy.prototype.popdown = function() {};

ZmAssistantBuddy.prototype._setOkButton = function(title, visible, enabled) {
	var span = document.getElementById(this.__okBtnId);
	span.style.display = visible ? "" : "none";
	if (title)
		span.innerHTML = title;
};

ZmAssistantBuddy.prototype._setExtraButton = function(title, visible, enabled) {
	var span = document.getElementById(this.__extraBtnId);
	span.style.display = visible ? "" : "none";
	if (title)
		span.innerHTML = title;
};

ZmAssistantBuddy.prototype._setHelpButton = function(title, visible, enabled) {
	var span = document.getElementById(this.__helpBtnId);
	span.style.display = visible ? "" : "none";
	if (title)
		span.innerHTML = title;
};

ZmAssistantBuddy.prototype.clearLastMessage = function() {
	if (this.__lastMsgDiv) {
		this.__lastMsgDiv.parentNode.removeChild(this.__lastMsgDiv);
		this.__lastMsgDiv = null;
	}
};

ZmAssistantBuddy.prototype.messageDialog = function(text, type) {
	// return ZmAssistantDialog.prototype.messageDialog.apply(this, arguments);
	// this.__widget.handleHtmlMessage(text);
	this.clearLastMessage();
	this.__widget.__lastFrom = "foo";
	var msg = new ZmChatMessage({ from: ZmMsg.zimbraAssistant + ' ' + ZmMsg.help,
				      body: [ { _content: text } ] // grr
				    });
	msg.htmlEncode = false;
	msg.objectify = false;
	this.__lastMsgDiv = this.__widget.handleMessage(msg);
	this.__widget.focus();
};

ZmAssistantBuddy.prototype._setDefault = function() {
	if (this._assistant != null)
		this._assistant.finish(this);
	this._assistant = null;
	this.clearLastMessage();
	this._availableCommands = ZmMsg.ASST_availableCommands + " " + ZmAssistant.getHandlerCommands().join(", ");
	return ZmAssistantDialog.prototype._setDefault.call(this);
};

ZmAssistantBuddy.prototype._setCommandTitle = function(title) {
	var dlgTitle = ZmMsg.zimbraAssistant;
	if (title)
		dlgTitle +=  ": " + title;
	this.__widget.setTitle(dlgTitle);
	this._displayAvailableCommands("<b>" + title + "</b>");
};

ZmAssistantBuddy.prototype._displayAvailableCommands = function(text) {
	if (!text)
		text = this._availableCommands;
	document.getElementById(this.__availableCommandsDivId).innerHTML = text;
};
