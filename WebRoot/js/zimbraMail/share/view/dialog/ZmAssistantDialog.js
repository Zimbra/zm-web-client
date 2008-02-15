/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmAssistantDialog = function() {

	var helpButton = new DwtDialog_ButtonDescriptor(ZmAssistantDialog.HELP_BUTTON, ZmMsg.help, DwtDialog.ALIGN_LEFT);
														   
	var extraButton = new DwtDialog_ButtonDescriptor(ZmAssistantDialog.EXTRA_BUTTON, 
														   ZmMsg.moreDetails, DwtDialog.ALIGN_LEFT);														   
														   
	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmAssistantDialog", title:ZmMsg.zimbraAssistant,
						  standardButtons:[helpButton, extraButton]});
//	ZmQuickAddDialog.call(this, appCtxt.getShell(), null, null, []);

	this.setContent(this._contentHtml());
	this._initContent();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(ZmAssistantDialog.EXTRA_BUTTON, new AjxListener(this, this._extraButtonListener));	
	this.setButtonListener(ZmAssistantDialog.HELP_BUTTON, new AjxListener(this, this._helpButtonListener));

	// only trigger matching after a sufficient pause
	this._parseInterval = 75; //appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	this._parseTimedAction = new AjxTimedAction(this, this._parseAction);
	this._parseActionId = -1;

	ZmAssistantDialog.initializeAssistants();
};

//ZmAssistantDialog.prototype = new ZmQuickAddDialog;
ZmAssistantDialog.prototype = new DwtDialog;
ZmAssistantDialog.prototype.constructor = ZmAssistantDialog;

ZmAssistantDialog.initializeAssistants = function() {
	if (!ZmAssistantDialog._handlerInit) {
		ZmAssistant.register(new ZmVersionAssistant());
		ZmAssistant.register(new ZmDebugAssistant());
		// ZmAssistant.register(new ZmCallAssistant());
		for (var i = 0; i < ZmApp.APPS.length; i++) {
			var app = ZmApp.APPS[i];
			var setting = ZmApp.SETTING[app];
			if (!setting || appCtxt.get(setting)) {
				var assistants = ZmApp.ASSISTANTS[app];
				if (assistants) {
					for (var asstName in assistants) {
						var pkg = assistants[asstName];
						AjxDispatcher.require(pkg);
						var asst = eval(asstName);
						ZmAssistant.register(new asst());
					}
				}
			}
		}
	}
};

ZmAssistantDialog.HELP_BUTTON = ++DwtDialog.LAST_BUTTON;
ZmAssistantDialog.EXTRA_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmAssistantDialog._handlerInit = false;

/**
*/
ZmAssistantDialog.prototype.popup =
function() {
	this._commandEl.value = "";
	var commands = ZmAssistant.getHandlerCommands().join(", ");
	this._availableCommands = ZmMsg.ASST_availableCommands+ " " + commands;
	this._setDefault();
	this._setHelpButton(null, true, true);
	DwtDialog.prototype.popup.call(this);
	this._commandEl.focus();
};

/*
* Returns HTML that forms the basic framework of the dialog.
*/
ZmAssistantDialog.prototype._contentHtml =
function() {
	var html = new AjxBuffer();
	this._contentId = Dwt.getNextId();	
	this._commandId = Dwt.getNextId();
	this._commandTitleId = Dwt.getNextId();
	html.append("<table cellspacing=3 border=0 width=400>");
	html.append("<tr><td colspan=3>", ZmMsg.enterCommand, "&nbsp;<span class='ZmAsstField' id='", this._commandTitleId, "'></span></td></tr>");	
	//html.append("<tr><td colspan=3 id='", this._commandTitleId, "'>", ZmMsg.enterCommand, "</td></tr>");		
	html.append("<tr><td colspan=3><div>");
	html.append(Dwt.CARET_HACK_BEGIN);
	html.append("<textarea rows=", AjxEnv.isIE ? "3" : "2", " style='width:100%' id='",this._commandId,"'>");
	html.append("</textarea>");
	html.append(Dwt.CARET_HACK_END);
	html.append("</div></td></tr>");
	html.append("<tr><td colspan=3><div class=horizSep></div></td></tr>");
	html.append("<tr><td colspan=3><div id='", this._contentId, "'></div></td></tr>");
	html.append("</table>");	
	return html.toString();
};

ZmAssistantDialog.prototype.setAssistantContent =
function(html) {
	var contentDivEl = document.getElementById(this._contentId);
	contentDivEl.innerHTML = html;
};

ZmAssistantDialog.prototype.getAssistantDiv =
function(html) {
	return document.getElementById(this._contentId);
};


ZmAssistantDialog.prototype._initContent =
function() {
	this._commandEl = document.getElementById(this._commandId);
	Dwt.associateElementWithObject(this._commandEl, this);
	this._commandEl.onkeyup = ZmAssistantDialog._keyUpHdlr;
};

ZmAssistantDialog._keyUpHdlr =
function(ev) {
	var keyEv = DwtShell.keyEvent;
	keyEv.setFromDhtmlEvent(ev, true);
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
	var assistant = null;	
	var cmd = this._commandEl.value.replace(/^\s*/, '');
	var match = cmd.match(/^([\.\w]+)\s*/);
	if (match) {
		var args = cmd.substring(match[0].length);
		var mainCommand = match[1];
		var commands = ZmAssistant.matchWord(mainCommand);
		switch(commands.length) {
			case 0:
				this._availableCommands = ZmMsg.ASST_availableCommands+ " " + ZmMsg.ASST_no_match;
				break;
			case 1:
				assistant = ZmAssistant.getHandler(commands[0]);
				break;
			default:
				this._availableCommands = ZmMsg.ASST_availableCommands+ " " + commands.join(", ");
				break;
		}
		if (assistant && mainCommand == cmd && this._assistant != assistant) {
			this._commandEl.value = assistant.getCommand() + " ";
			var len = this._commandEl.value.length;
			Dwt.setSelectionRange(this._commandEl, len, len);
		}
	} else {
		this._availableCommands = ZmMsg.ASST_availableCommands+ " " + ZmAssistant.getHandlerCommands().join(", ");
	}

	if (this._assistant != assistant) {
		if (this._assistant != null) this._assistant.finish(this);
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

	if (this._assistant) this._assistant.handle(this, null, args);
	else this._setDefault();
};

ZmAssistantDialog.prototype._setDefault = 
function() {
	this.setAssistantContent(this._availableCommands);
	this._setOkButton(AjxMsg.ok, false, false, true, null);
	this._setHelpButton(null, true, true);		
	this._setExtraButton(ZmMsg.moreDetails, false, false, true, null);	
	this._setCommandTitle("");
};	

ZmAssistantDialog.prototype._setCommandTitle =
function(title, dontHtmlEncode) {
	var titleEl = document.getElementById(this._commandTitleId);
	if (titleEl) titleEl.innerHTML = dontHtmlEncode ? title : AjxStringUtil.htmlEncode(title);
};

ZmAssistantDialog.prototype._setOkButton =
function(title, visible, enabled) {
	var ok = this.getButton(DwtDialog.OK_BUTTON);
	if (title) ok.setText(title);
	ok.setEnabled(enabled);
	ok.setVisible(visible);
	//if (setImage) ok.setImage(image);
};

ZmAssistantDialog.prototype._setExtraButton =
function(title, visible, enabled) {
	var ok = this.getButton(ZmAssistantDialog.EXTRA_BUTTON);
	if (title) ok.setText(title);
	ok.setEnabled(enabled);
	ok.setVisible(visible);
	//if (setImage) ok.setImage(image);
};

ZmAssistantDialog.prototype._setHelpButton =
function(title, visible, enabled) {
	var b = this.getButton(ZmAssistantDialog.HELP_BUTTON);
	if (title) b.setText(title);
	b.setEnabled(enabled);
	b.setVisible(visible);
	//if (setImage) ok.setImage(image);
};

/**
* Clears the conditions and actions table before popdown so we don't keep
* adding to them.
*/
ZmAssistantDialog.prototype.popdown =
function() {
	DwtDialog.prototype.popdown.call(this);
	if (this._assistant != null) this._assistant.finish(this);
	this._assistant = null;
};

ZmAssistantDialog.prototype._okButtonListener =
function(ev) {
	if (this._assistant && !this._assistant.okHandler(this)) return;
	this.popdown();
};

ZmAssistantDialog.prototype._extraButtonListener =
function(ev) {
	if (this._assistant && !this._assistant.extraButtonHandler(this)) return;
	this.popdown();
};

ZmAssistantDialog.prototype._helpButtonListener =
function(ev) {
	if (this._assistant) {
		var help = this._assistant.getHelp();
		if (help != null) this.messageDialog(help, DwtMessageDialog.INFO_STYLE);
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
		this.messageDialog(html.toString(), DwtMessageDialog.INFO_STYLE);
	}
};


ZmAssistantDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};

ZmAssistantDialog.prototype.messageDialog =
function(message, style) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(message, style);
	msgDialog.popup();
};
