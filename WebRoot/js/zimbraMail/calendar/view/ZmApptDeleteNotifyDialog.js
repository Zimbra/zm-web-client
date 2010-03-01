/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a dialog allowing user to choose between an Instance or Series for an appointment.
 * @constructor
 * @class
 *
 * @author Parag Shah
 * @param {Hash}	params			a hash of parameters
 * @param {DwtComposite}      params.parent			a parent widget (the shell)
 * @param {String}	params.title			a title of dialog
 * @param {String}	params.confirmMsg 	a dialog confirmation message 
 * @param {String}	params.choiceLabel1	a label value for choice 1
 * @param {String}	params.choiceLabel2	a label value for choice 2
 * 
 * @extends	DwtDialog
 */
ZmApptDeleteNotifyDialog = function(params) {

    params = Dwt.getParams(arguments, ZmApptDeleteNotifyDialog.PARAMS);
    var buttons = [ DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON, DwtDialog.CANCEL_BUTTON ];
    DwtDialog.call(this, {parent: params.parent, standardButtons:buttons});

    this._choiceLabel1 = params.choiceLabel1;
    this._choiceLabel2 = params.choiceLabel2;
    this._confirmMsg = params.confirmMsg;

	this.setTitle(params.title || AjxMsg.confirmTitle);
	this.setContent(this._setHtml());
	this._cacheFields();
    this.registerCallback(DwtDialog.YES_BUTTON, new AjxCallback(this, this._handleYesButton));
    this.registerCallback(DwtDialog.NO_BUTTON, new AjxCallback(this, this._handleNoButton));
};

ZmApptDeleteNotifyDialog.PARAMS = ["parent", "title", "confirmMsg", "choiceLabel1", "choiceLabel2"];

ZmApptDeleteNotifyDialog.prototype = new DwtDialog;
ZmApptDeleteNotifyDialog.prototype.constructor = ZmApptDeleteNotifyDialog;

// Public methods

ZmApptDeleteNotifyDialog.prototype.toString =
function() {
	return "ZmApptDeleteNotifyDialog";
};

/**
 * Initializes the dialog.
 * 
 * @param	{ZmAppt}	appt		the appointment
 * @param	{String}	attId		the id
 */
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

/**
 * Checks if the default option is checked.
 * 
 * @return	{Boolean}	<code>true</code> if the default option is checked
 */
ZmApptDeleteNotifyDialog.prototype.isDefaultOptionChecked =
function() {
	return this._defaultRadio.checked;
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

	var html = new Array();
	var i = 0;

	html[i++] = "<div style='width:275px'>";
	html[i++] = this._confirmMsg;
	html[i++] = "<br>";
	html[i++] = "</div><p>";
	html[i++] = "<table align=center border=0 width=1%>";
	html[i++] = "<tr><td width=1%><input checked value='1' type='radio' id='";
	html[i++] = this._defaultRadioId;
	html[i++] = "' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = this._choiceLabel1;
	html[i++] = "</td></tr>";
	html[i++] = "<tr><td width=1%><input value='2' type='radio' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = this._choiceLabel2;
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