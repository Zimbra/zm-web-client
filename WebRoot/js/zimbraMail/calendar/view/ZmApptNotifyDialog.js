/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
* Simple dialog allowing user to choose between an Instance or Series for an appointment
* @constructor
* @class
*
* @author Parag Shah
* @param parent			the element that created this view
* 
* 
* @extends		ZmController
* @private
*/
ZmApptNotifyDialog = function(parent) {

	DwtDialog.call(this, {parent:parent});

	this.setTitle(ZmMsg.sendUpdateTitle);
	this.setContent(this._setHtml());
	this._cacheFields();
};

ZmApptNotifyDialog.prototype = new ZmController;
ZmApptNotifyDialog.prototype.constructor = ZmApptNotifyDialog;

// Public methods

ZmApptNotifyDialog.prototype.toString = 
function() {
	return "ZmApptNotifyDialog";
};

ZmApptNotifyDialog.prototype.initialize = 
function(appt, attId, addedAttendees, removedAttendees) {
	this._appt = appt;
	this._attId = attId;
	this._defaultRadio.checked = true;

    var aCount = addedAttendees.length;
    var rCount = removedAttendees.length;    
    Dwt.setSize(Dwt.byId(this._containerId), 275, (aCount + rCount > 10) ? 300 : Dwt.CLEAR );

	this._addedList.innerHTML = this._getAttedeeHtml(addedAttendees, ZmMsg.added);
	this._removedList.innerHTML = this._getAttedeeHtml(removedAttendees, ZmMsg.removed);
};

// helper method - has no use for this dialog
ZmApptNotifyDialog.prototype.getAppt = 
function() {
	return this._appt;
};

// helper method - has no use for this dialog
ZmApptNotifyDialog.prototype.getAttId = 
function() {
	return this._attId;
};

ZmApptNotifyDialog.prototype.notifyNew = 
function() {
	return this._defaultRadio.checked;
};

ZmApptNotifyDialog.prototype.addSelectionListener = 
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};


// Private / protected methods

ZmApptNotifyDialog.prototype._setHtml = 
function() {
	this._defaultRadioId	= Dwt.getNextId();
	this._notifyChoiceName	= Dwt.getNextId();
	this._addedListId		= Dwt.getNextId();
	this._removedListId		= Dwt.getNextId();
    this._containerId       = Dwt.getNextId();

	var html = new Array();
	var i = 0;

	html[i++] = "<div style='width:275px; overflow: auto;' id='"+this._containerId+"'>";
	html[i++] = ZmMsg.attendeeListChanged;
	html[i++] = "<br><div id='";
	html[i++] = this._addedListId;
	html[i++] = "'></div>";
	html[i++] = "<div id='";
	html[i++] = this._removedListId;
	html[i++] = "'></div>";
	html[i++] = "</div><p>";
	html[i++] = "<table align=center border=0 width=1%>";
	html[i++] = "<tr><td width=1%><input checked value='1' type='radio' id='";
	html[i++] = this._defaultRadioId;
	html[i++] = "' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = ZmMsg.sendUpdatesNew;
	html[i++] = "</td></tr>";
	html[i++] = "<tr><td width=1%><input value='2' type='radio' name='";
	html[i++] = this._notifyChoiceName;
	html[i++] = "'></td><td style='white-space:nowrap'>";
	html[i++] = ZmMsg.sendUpdatesAll;
	html[i++] = "</td></tr>";
	html[i++] = "</table>";

	return html.join("");
};

ZmApptNotifyDialog.prototype._getAttedeeHtml = 
function(attendeeList, attendeeLabel) {
	var html = new Array();
	var j = 0;

	if (attendeeList.length) {
		html[j++] = "<table border=0><tr>";
		html[j++] = "<td valign=top>&nbsp;&nbsp;<b>";
		html[j++] = attendeeLabel;
		html[j++] = "</b></td><td>";
		html[j++] = attendeeList.join(", ");
		html[j++] = "</td></tr></table>";
	}
	return html.join("");
};

ZmApptNotifyDialog.prototype._cacheFields = 
function() {
	this._defaultRadio = document.getElementById(this._defaultRadioId); 		delete this._defaultRadioId;
	this._addedList = document.getElementById(this._addedListId); 				delete this._addedListId;
	this._removedList = document.getElementById(this._removedListId); 			delete this._removedListId;
	
};
