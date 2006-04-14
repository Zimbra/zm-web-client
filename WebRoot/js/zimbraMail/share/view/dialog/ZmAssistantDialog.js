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

	DwtDialog.call(this, appCtxt.getShell(), "ZmAssistantDialog", ZmMsg.zimbraAssistant);
//	ZmQuickAddDialog.call(this, appCtxt.getShell(), null, null, []);

	this._appCtxt = appCtxt;

	this.setContent(this._contentHtml());
	this._initContent();
	this._msgDialog = this._appCtxt.getMsgDialog();
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));

	// only trigger matching after a sufficient pause
	this._pasrseInterval = this._appCtxt.get(ZmSetting.AC_TIMER_INTERVAL);
	this._parseTimedAction = new AjxTimedAction(this, this._parseAction);
	this._parseActionId = -1;
	
	this._apptAssist = new ZmApptAssistant(appCtxt);	
	this._contactAssist = new ZmContactAssistant(appCtxt);
	
	var ok = this.getButton(DwtDialog.OK_BUTTON);
	ok.setAlign(DwtLabel.IMAGE_RIGHT);
};

//ZmAssistantDialog.prototype = new ZmQuickAddDialog;
ZmAssistantDialog.prototype = new DwtDialog;
ZmAssistantDialog.prototype.constructor = ZmAssistantDialog;

/**
*/
ZmAssistantDialog.prototype.popup =
function() {
	this._commandEl.value = "";
	this._setDefault();

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
	html.append("<table cellspacing=3 border=0 width=400>");
	html.append("<tr><td colspan=3>", ZmMsg.enterCommand, "</td></tr>");	
	html.append("<tr><td colspan=3><div>");
	html.append("<textarea rows=2 style='width:100%' id='",this._commandId,"'>");
	html.append("</textarea>");
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

ZmAssistantDialog.prototype._initContent =
function() {
	this._commandEl = document.getElementById(this._commandId);
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
	var assistant = null;	
	var cmd = this._commandEl.value.replace(/^\s*/, '');
	var match = cmd.match(/^(\w+)\b\s*/);
	if (match) {
		var args = cmd.substring(match[0].length);
		var mainCommand = match[1];
		if (mainCommand == 'appt') assistant = this._apptAssist;
		else if (mainCommand == 'contact') assistant = this._contactAssist;
		else {
			// assistant is null
		}
	}

	if (this._assistant != assistant) {
		if (this._assistant != null) this._assistant.finish(this);
		this._assistant = assistant;
		if (this._assistant) this._assistant.initialize(this);
	}

	if (this._assistant) this._assistant.handle(this, null, args);
	else this._setDefault();
};

ZmAssistantDialog.prototype._setDefault = 
function() {
	this.setAssistantContent("available commands: appt, contact, empty, message");
	this._setOkButton(AjxMsg.ok, false, false, true, null);
};	

ZmAssistantDialog.prototype._setOkButton =
function(title, visible, enabled, setImage, image) {
	var ok = this.getButton(DwtDialog.OK_BUTTON);
	if (title) ok.setText(title);
	ok.setEnabled(enabled);
	ok.setVisible(visible);
	if (setImage) ok.setImage(image);
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

ZmAssistantDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};

//	else if (obj == 'm')  { 
//		this._commandEl.value += "essage ";

//ZmAssistantDialog.prototype._emptyCommand =
//function(args) {
//	this._setActionField(ZmMsg.empty, "Trash");
//	var match = args.match(/\s*(\w+)\s*/);
//	var folder = match ? match[1] : null;
//
//	if (folder == 'trash' || folder == 'junk') {
//		this._setOptField(ZmMsg.folder, folder, false, true);
//	} else {
//		this._setOptField(ZmMsg.folder, "trash or junk", true, true);
//	}
//}

//ZmAssistantDialog.prototype._newMessageCommand =
//function(args) {
//	this._setActionField(ZmMsg.newEmail, "NewMessage");
//	args = this._genericWordField("To", "to", args, fields);
//	args = this._genericWordField("Cc", "cc", args, fields);
//	args = this._genericTextField("Subject", "subject", args, fields);	
//	args = this._genericTextField("Body", "body", args, fields);		
//};
