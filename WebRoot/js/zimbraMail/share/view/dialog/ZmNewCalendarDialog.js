/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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

function ZmNewCalendarDialog(appCtxt, parent, className) {
	var title = ZmMsg.createNewCalendar;
	var buttons = [ DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON ];
	DwtDialog.call(this, parent, className, title, buttons);
	
	this._appCtxt = appCtxt;
	
	var contentEl = this._createContentEl();
	var contentDiv = this._getContentDiv();
	contentDiv.appendChild(contentEl);
	
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleOkButton));
}

ZmNewCalendarDialog.prototype = new DwtDialog;
ZmNewCalendarDialog.prototype.constructor = ZmNewCalendarDialog;

ZmNewCalendarDialog.prototype.toString = 
function() {
	return "ZmNewCalendarDialog";
}

// Data

ZmNewCalendarDialog.prototype._nameFieldId;
ZmNewCalendarDialog.prototype._parentFolder;

// Public methods

ZmNewCalendarDialog.prototype.setParentFolder =
function(folder) {
	this._parentFolder = folder;
};

ZmNewCalendarDialog.prototype.popup =
function(loc) {
	// reset input fields
	this._nameInputEl.value = "";
	
	var color = (this._colorInput.getValue() + 1) % ZmOrganizer.COLOR_CHOICES.length;
	var option = this._colorInput.getOptionWithValue(color);
	this._colorInput.setSelectedOption(option);
	
	this._excludeFbCheckbox.checked = false;
	
	this._remoteCheckboxEl.checked = false;
	this._remoteCheckboxEl._urlRow.style.display = "none";
	this._urlInputEl.value = "";
	
	// show dialog
	ZmDialog.prototype.popup.call(this, loc);
}

// Protected methods

ZmNewCalendarDialog.prototype._handleOkButton = 
function(event) {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameInputEl.value);
	var msg = ZmFolder.checkName(name) || this._checkUrl();
	
	// create folder
	var ex = null;
	var calendarId = null;
	if (!msg) {
		try {
			var parentFolderId = this._parentFolder ? this._parentFolder.id : null;
			var url = this._remoteCheckboxEl.checked ? AjxStringUtil.trim(this._urlInputEl.value) : null;
			var results = ZmCalendar.create(this._appCtxt, name, parentFolderId, url);
			calendarId = results.CreateFolderResponse.folder[0].id;
		}
		catch (ex) {
			msg = ZmMsg.unknownError;
			switch (ex.code) {
				case "mail.ALREADY_EXISTS": {
					msg = ZmMsg.folderNameExists;
					ex = null;
					break;
				}
				case "service.PARSE_ERROR": {
					msg = ZmMsg.errorCalendarParse;
					break;
				}
				default: {
					msg = ex.getErrorMsg() || msg;
				}
			}
		}
	}
	
	// color folder
	if (!msg) {
		try {
			var calendar = this._appCtxt.cacheGet(calendarId);
			var color = this._colorInput.getValue();
			calendar.setColor(color);
		}
		catch (ex) {
			msg = ZmMsg.errorCalendarSettingAfterCreate;
		}
	}
	
	// exclude from f/b
	if (!msg && this._excludeFbCheckbox.checked) {
		try {
			var calendar = this._appCtxt.cacheGet(calendarId);
			var exclude = true;
			calendar.setFreeBusy(exclude);
		}
		catch (ex) {
			msg = ZmMsg.errorCalendarSettingAfterCreate;
		}
	}
	
	// display error message
	if (msg) {
		var appController = this._appCtxt.getAppController();
		var errorDialog = appController.popupErrorDialog(msg, ex, null, true);
		return;
	}
	
	// default processing
	this.popdown();
};

ZmNewCalendarDialog.prototype._createContentEl = 
function() {
	// create controls
	this._nameInputEl = document.createElement("INPUT");
	//this._nameInputEl.autocomplete = "OFF";
	this._nameInputEl.type = "text";
	this._nameInputEl.className = "Field";
	
	this._colorInput = new DwtSelect(this);
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorInput.addOption(choice.label, i == 0, choice.value);
	}

	this._excludeFbCheckbox = document.createElement("INPUT");
	this._excludeFbCheckbox.type = "checkbox";
	this._excludeFbCheckbox.checked = false;

	this._remoteCheckboxEl = document.createElement("INPUT");
	this._remoteCheckboxEl.type = "checkbox";
	this._remoteCheckboxEl.checked = false;
	Dwt.setHandler(this._remoteCheckboxEl, DwtEvent.ONCLICK, this._handleCheckbox);
	
	this._urlInputEl = document.createElement("INPUT");
	this._urlInputEl.type = "text";
	this._urlInputEl.className = "Field";

	// create HTML
	var table = document.createElement("TABLE");
	table.border = 0;
	table.cellSpacing = 3;
	table.cellPadding = 0;

	var nameRow = table.insertRow(table.rows.length);
	var nameLabelCell = nameRow.insertCell(nameRow.cells.length);
	nameLabelCell.className = "Label";
	nameLabelCell.innerHTML = ZmMsg.nameLabel;
	var nameInputCell = nameRow.insertCell(nameRow.cells.length);
	nameInputCell.appendChild(this._nameInputEl);

	var colorRow = table.insertRow(table.rows.length);
	var colorLabelCell = colorRow.insertCell(colorRow.cells.length);
	colorLabelCell.className = "Label";
	colorLabelCell.innerHTML = ZmMsg.colorLabel;
	var colorInputCell = colorRow.insertCell(colorRow.cells.length);
	colorInputCell.appendChild(this._colorInput.getHtmlElement());	
	
	var excludeFbRow = table.insertRow(table.rows.length);
	var excludeFbCell = excludeFbRow.insertCell(excludeFbRow.cells.length);
	excludeFbCell.colSpan = 2;
	excludeFbCell.className = "Label";
	excludeFbCell.appendChild(this._excludeFbCheckbox);
	excludeFbCell.appendChild(document.createTextNode(ZmMsg.excludeFromFreeBusy));
	
	var remoteRow = table.insertRow(table.rows.length);
	var remoteLabelCell = remoteRow.insertCell(remoteRow.cells.length);
	remoteLabelCell.colSpan = 2;
	remoteLabelCell.className = "Label";
	remoteLabelCell.appendChild(this._remoteCheckboxEl);
	remoteLabelCell.appendChild(document.createTextNode(ZmMsg.addRemoteAppts));
	
	var urlRow = table.insertRow(table.rows.length);
	urlRow.style.display = "none";
	var urlLabelCell = urlRow.insertCell(urlRow.cells.length);
	urlLabelCell.className = "Label";
	urlLabelCell.innerHTML = ZmMsg.urlLabel;
	var urlInputCell = urlRow.insertCell(urlRow.cells.length);
	urlInputCell.className = "Field";
	urlInputCell.appendChild(this._urlInputEl);
	
	this._remoteCheckboxEl._urlRow = urlRow;
	this._remoteCheckboxEl._urlInputEl = this._urlInputEl;
		
	return table;
};

ZmNewCalendarDialog.prototype._handleCheckbox = function(event) {
	event = event || window.event;
	var target = DwtUiEvent.getTarget(event);
	target._urlRow.style.display = target.checked ? (AjxEnv.isIE ? "block" : "table-row") : "none";
	if (target.checked) {
		target._urlInputEl.focus();
	}
};

ZmNewCalendarDialog.prototype._checkUrl = function() {
	if (this._remoteCheckboxEl.checked && this._urlInputEl.value.match(/^\s*$/)) {
		return ZmMsg.errorUrlMissing;
	}
};

ZmNewCalendarDialog.prototype._getSeparatorTemplate = function() {
	return "";
};
