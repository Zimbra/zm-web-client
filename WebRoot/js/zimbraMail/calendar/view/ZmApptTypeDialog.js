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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
* Simple dialog allowing user to choose between an Instance or Series for an appointment
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
*/
function ZmApptTypeDialog(parent) {

	DwtDialog.call(this, parent);

	this.setContent(this._setHtml());
	this._cacheFields();
};

ZmApptTypeDialog.prototype = new DwtDialog;
ZmApptTypeDialog.prototype.constructor = ZmApptTypeDialog;

// Public methods

ZmApptTypeDialog.prototype.toString = 
function() {
	return "ZmApptTypeDialog";
};

ZmApptTypeDialog.prototype.initialize = 
function(mode, appt) {
	this._appt = appt;
	this._apptMode = mode;
	this._defaultRadio.checked = true;

	var m = AjxMessageFormat.format(ZmMsg.isRecurringAppt, [appt.getName()]);
	if (mode == ZmAppt.MODE_EDIT) {
		this.setTitle(ZmMsg.openRecurringItem);
		this._questionCell.innerHTML = m + " " + ZmMsg.editApptQuestion;
		this._instanceMsg.innerHTML = ZmMsg.openInstance;
		this._seriesMsg.innerHTML = ZmMsg.openSeries;
	} else if (mode == ZmAppt.MODE_DRAG_OR_SASH) {
		this.setTitle(ZmMsg.modifyRecurringItem);
		this._questionCell.innerHTML = m + " " + ZmMsg.modifyApptQuestion;
		this._instanceMsg.innerHTML = ZmMsg.modifyInstance;
		this._seriesMsg.innerHTML = ZmMsg.modifySeries;
	} else {
		this.setTitle(ZmMsg.deleteRecurringItem);
		this._questionCell.innerHTML = m + " " + ZmMsg.deleteApptQuestion;
		this._instanceMsg.innerHTML = ZmMsg.deleteInstance;
		this._seriesMsg.innerHTML = ZmMsg.deleteSeries;
	}
};

ZmApptTypeDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};

ZmApptTypeDialog.prototype.isInstance = 
function() {
	return this._defaultRadio.checked;
};

ZmApptTypeDialog.prototype.getAppt = 
function() {
	return this._appt;
};

ZmApptTypeDialog.prototype.getApptMode = 
function() {
	return this._apptMode;
};


// Private / protected methods

ZmApptTypeDialog.prototype._setHtml = 
function() {
	this._questionId = Dwt.getNextId();
	this._defaultRadioId = Dwt.getNextId();
	this._instSeriesRadioName = Dwt.getNextId();
	this._instanceMsgId = Dwt.getNextId();
	this._seriesMsgId = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<div style='width:275px' id='";
	html[i++] = this._questionId;
	html[i++] = "'></div><p>";
	html[i++] = "<table align=center border=0 width=1%>";
	html[i++] = "<tr><td width=1%><input checked value='1' type='radio' id='";
	html[i++] = this._defaultRadioId;
	html[i++] = "' name='";
	html[i++] = this._instSeriesRadioName;
	html[i++] = "'></td><td style='white-space:nowrap' id='";
	html[i++] = this._instanceMsgId;
	html[i++] = "'></td></tr>";
	html[i++] = "<tr><td width=1%><input value='2' type='radio' name='";
	html[i++] = this._instSeriesRadioName;
	html[i++] = "'></td><td style='white-space:nowrap' id='";
	html[i++] = this._seriesMsgId;
	html[i++] = "'></td></tr>";
	html[i++] = "</table>";

	return html.join("");
};

ZmApptTypeDialog.prototype._cacheFields = 
function() {
	this._defaultRadio = document.getElementById(this._defaultRadioId); 		delete this._defaultRadioId;
	this._questionCell = document.getElementById(this._questionId); 			delete this._questionId;
	this._instanceMsg = document.getElementById(this._instanceMsgId); 			delete this._instanceMsgId;
	this._seriesMsg = document.getElementById(this._seriesMsgId); 				delete this._seriesMsgId;
};
