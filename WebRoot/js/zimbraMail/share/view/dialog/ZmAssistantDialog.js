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

	DwtDialog.call(this, appCtxt.getShell(), "ZmAssistantDialog", "Zimbra Assistant");
//	ZmQuickAddDialog.call(this, appCtxt.getShell(), null, null, []);

	this._appCtxt = appCtxt;

	this.setTitle("Zimbra Assistant");
	this.setContent(this._contentHtml());
	this._initContent();
	this._fields = {};	
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
	this._commandId = Dwt.getNextId();
	html.append("<tr><td colspan=3><div>");
	html.append("<textarea rows=2 style='width:100%' id='",this._commandId,"'>");
	html.append("");
	html.append("</textarea>");
	html.append("</div></td></tr>");
	html.append("<td colspan=3><div class=horizSep></div></td>");
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
		this._clearFields();
		this._mainCommand = mainCommand;
	}

	if (mainCommand == 'appt')
		this._apptAssist.parse(this, null, args);
	else if (mainCommand == 'contact') 
		this._contactAssist.parse(this, null, args);
	else if (mainCommand == 'empty')
		this._emptyCommand(args);	
	else {
		this._setDefaultAction();		
	}
};

//	else if (obj == 'm')  { 
//		this._commandEl.value += "essage ";



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
//	this._setAction("New Note", "NewNote");
//	this._setTextField("Note", args, null, null, "300px");
};
	
ZmAssistantDialog.prototype._newMessageCommand =
function(args) {
//	this._setActionField(ZmMsg.newEmail, "NewMessage");
//	args = this._genericWordField("To", "to", args, fields);
//	args = this._genericWordField("Cc", "cc", args, fields);
//	args = this._genericTextField("Subject", "subject", args, fields);	
//	args = this._genericTextField("Body", "body", args, fields);		
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
		html.append("<td valign='", titleAlign ? titleAlign : "top", "' class='ZmApptTabViewPageField'>", AjxStringUtil.htmlEncode(title), ":</td>");
		html.append("<td><div id='", id, "' class='", cname, "'>", value, "</div></td>");
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


ZmAssistantDialog.prototype._setActionField = 
function(value, icon) {
	return;
	var html = new AjxBuffer();
	html.append("<table><tr>");
	html.append("<td>", AjxStringUtil.htmlEncode(value), "</td>");	
	html.append("<td>", AjxImg.getImageHtml(icon), "</td>");
	html.append("</<tr></table>");
	this._setField(ZmMsg.action, html, false, false, null, 'middle');
};

ZmAssistantDialog.prototype._setDefaultAction = 
function() {
	this._clearFields();
//	this._setField(ZmMsg.action, "available actions: appt, contact, empty, message",  true, true, null, 'middle');
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

ZmAssistantDialog.prototype._okButtonListener =
function(ev) {
	this.popdown();
};

ZmAssistantDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};

ZmAssistantDialog.prototype._clearFields =
function() {
	for (var field in this._fields) {
		this._clearField(field);
	}
};
