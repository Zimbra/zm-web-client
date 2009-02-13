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

/**
* Simple dialog allowing user to choose between an Instance or Series for an appointment
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
*/
ZmApptDeleteNotifyDialog = function(parent) {

    var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON ];
    DwtDialog.call(this, {parent:parent, standardButtons:buttons});

	this.setTitle(AjxMsg.confirmTitle);
	this.setContent(this._setHtml());
	this._cacheFields();
    this.registerCallback(DwtDialog.YES_BUTTON, new AjxCallback(this, this._handleYesButton));
    this.registerCallback(DwtDialog.NO_BUTTON, new AjxCallback(this, this._handleNoButton));
};

ZmApptDeleteNotifyDialog.prototype = new DwtDialog;
ZmApptDeleteNotifyDialog.prototype.constructor = ZmApptDeleteNotifyDialog;

// Public methods

ZmApptDeleteNotifyDialog.prototype.toString =
function() {
	return "ZmApptDeleteNotifyDialog";
};

ZmApptDeleteNotifyDialog.prototype.initialize =
function(appt, attId) {
	this._appt = appt;
	this._attId = attId;
	this._defaultRadio.checked = true;
};

// helper method - has no use for this dialog
ZmApptDeleteNotifyDialog.prototype.getAppt =
function() {
	return this._appt;
};

// helper method - has no use for this dialog
ZmApptDeleteNotifyDialog.prototype.getAttId =
function() {
	return this._attId;
};

ZmApptDeleteNotifyDialog.prototype.notifyOrg =
function() {
	return !this._defaultRadio.checked;
};

ZmApptDeleteNotifyDialog.prototype.addSelectionListener =
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};


// Private / protected methods

ZmApptDeleteNotifyDialog.prototype._setHtml =
function() {
	this._defaultRadioId	= Dwt.getNextId();
	this._notifyChoiceName	= Dwt.getNextId();
	this._addedListId		= Dwt.getNextId();
	this._removedListId		= Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<div style='width:275px'>";
	html[i++] = ZmMsg.confirmCancelAppt;
	html[i++] = "<br>";
	html[i++] = "</div><p>";
	html[i++] = "<table align=center border=0 width=1%>";
	html[i++] = "<tr><td width=1%><input checked value='1' type='radio' id='";
	html[i++] = this._defaultRadioId;
	html[i++] = "' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = ZmMsg.dontNotifyOrganizer;
	html[i++] = "</td></tr>";
	html[i++] = "<tr><td width=1%><input value='2' type='radio' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = ZmMsg.notifyOrganizer;
	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	return html.join("");
};

ZmApptDeleteNotifyDialog.prototype._cacheFields =
function() {
	this._defaultRadio = document.getElementById(this._defaultRadioId); 		delete this._defaultRadioId;	
};

ZmApptDeleteNotifyDialog.prototype.popup = 
function(yesCallback, noCallback) {

	this._yesCallback = yesCallback;
	this._noCallback = noCallback;

	this.setButtonVisible(DwtDialog.CANCEL_BUTTON, Boolean(noCallback));

	DwtDialog.prototype.popup.call(this);
};

ZmApptDeleteNotifyDialog.prototype._handleYesButton =
function(ev) {
	if (this._yesCallback) this._yesCallback.run(ev);
	this.popdown();
};

ZmApptDeleteNotifyDialog.prototype._handleNoButton =
function(ev) {
	if (this._noCallback) this._noCallback.run(ev);
	this.popdown();
};