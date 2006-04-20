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

function ZmNewCalendarDialog(parent, msgDialog, className) {
	ZmDialog.call(this, parent, msgDialog, className, ZmMsg.createNewCalendar);

	this.setContent(this._contentHtml());
	this._setNameField(this._nameFieldId);
	this._setElements();
};

ZmNewCalendarDialog.prototype = new ZmDialog;
ZmNewCalendarDialog.prototype.constructor = ZmNewCalendarDialog;

ZmNewCalendarDialog.prototype.toString = 
function() {
	return "ZmNewCalendarDialog";
};

// Public methods

ZmNewCalendarDialog.prototype.popup =
function(folder, loc) {
	this._parentFolder = folder;

	// reset input fields
	this._nameField.value = "";
	
	var color = (this._colorInput.getValue() + 1) % ZmOrganizer.COLOR_CHOICES.length;
	var option = this._colorInput.getOptionWithValue(color);
	this._colorInput.setSelectedOption(option);
	
	this._excludeFbCheckbox.checked = false;
	
	this._remoteCheckbox.checked = false;
	this._remoteCheckbox._urlRow.style.display = "none";
	this._urlField.value = "";
	
	// show dialog
	ZmDialog.prototype.popup.call(this, loc);
};

// Protected methods

ZmNewCalendarDialog.prototype._contentHtml = 
function() {
	this._nameFieldId			= Dwt.getNextId();
	this._colorSelectTdId		= Dwt.getNextId();
	this._excludeFbCheckboxId	= Dwt.getNextId();
	this._remoteCheckboxId		= Dwt.getNextId();
	this._urlRowId				= Dwt.getNextId();
	this._urlFieldId			= Dwt.getNextId();
	
	// create HTML
	var html = [];
	var i = 0;
	
	html[i++] = "<table border=0 cellSpacing=3 cellPadding=0>";

	html[i++] = "<tr><td class='Label'>";
	html[i++] = ZmMsg.nameLabel;
	html[i++] = "</td><td><input type='text' class='Field' id='";
	html[i++] = this._nameFieldId;
	html[i++] = "' /></td></tr>";

	html[i++] = "<tr><td class='Label'>";
	html[i++] = ZmMsg.colorLabel;
	html[i++] = "</td><td id='";
	html[i++] = this._colorSelectTdId;
	html[i++] = "'></td></tr>";

	html[i++] = "<tr><td colspan=2 class='Label'><input type='checkbox' id='";
	html[i++] = this._excludeFbCheckboxId;
	html[i++] = "' />";
	html[i++] = ZmMsg.excludeFromFreeBusy;
	html[i++] = "</td></tr>";

	html[i++] = "<tr><td colspan=2 class='Label'><input type='checkbox' id='";
	html[i++] = this._remoteCheckboxId;
	html[i++] = "' />";
	html[i++] = ZmMsg.addRemoteAppts;
	html[i++] = "</td></tr>";

	html[i++] = "<tr style='display:none' id='"
	html[i++] = this._urlRowId;
	html[i++] = "'><td class='Label'>";
	html[i++] = ZmMsg.urlLabel;
	html[i++] = "</td><td><input type='text' class='Field' id='";
	html[i++] = this._urlFieldId;
	html[i++] = "' /></td></tr>";

	html[i++] = "</table>";

	return html.join("");
};

ZmNewCalendarDialog.prototype._setElements =
function() {
	this._colorInput = new DwtSelect(this);
	for (var i = 0; i < ZmOrganizer.COLOR_CHOICES.length; i++) {
		var choice = ZmOrganizer.COLOR_CHOICES[i];
		this._colorInput.addOption(choice.label, i == 0, choice.value);
	}
	var colorTd = document.getElementById(this._colorSelectTdId);
	colorTd.appendChild(this._colorInput.getHtmlElement());
	
	this._excludeFbCheckbox = document.getElementById(this._excludeFbCheckboxId);
	this._remoteCheckbox = document.getElementById(this._remoteCheckboxId);
	var urlRow = document.getElementById(this._urlRowId);
	this._remoteCheckbox._urlRow = urlRow;
	this._urlField = document.getElementById(this._urlFieldId);
	this._remoteCheckbox._urlField = this._urlField;

	Dwt.setHandler(this._remoteCheckbox, DwtEvent.ONCLICK, this._handleCheckbox);
};

ZmNewCalendarDialog.prototype._getCalendarData =
function() {
	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmCalendar.checkName(name);
	
	var url = null;
	if (!msg && this._remoteCheckbox.checked) {
		url = AjxStringUtil.trim(this._urlField.value);
		msg = ZmOrganizer.checkUrl(url);
	}

	var color = this._colorInput.getValue();
	var excludeFb = this._excludeFbCheckbox.checked;
	
	return (msg ? this._showError(msg) : [this._parentFolder, name, url, color, excludeFb]);
};

ZmNewCalendarDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getCalendarData();
	if (results)
		DwtDialog.prototype._buttonListener.call(this, ev, results);
};

ZmNewCalendarDialog.prototype._handleCheckbox =
function(event) {
	var target = DwtUiEvent.getTarget(event);
	target._urlRow.style.display = target.checked ? (AjxEnv.isIE ? "block" : "table-row") : "none";
	if (target.checked) {
		target._urlField.focus();
	}
};
