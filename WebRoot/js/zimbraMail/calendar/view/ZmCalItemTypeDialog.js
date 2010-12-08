/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @extends		DwtDialog
 * 
 * @private
 */
ZmCalItemTypeDialog = function(parent) {

	DwtDialog.call(this, {parent:parent});

	var content = AjxTemplate.expand("calendar.Calendar#TypeDialog", {id:this._htmlElId});
	this.setContent(content);

	// cache fields
	this._defaultRadio = document.getElementById(this._htmlElId + "_defaultRadio");
	this._questionCell = document.getElementById(this._htmlElId + "_question");
	this._instanceMsg = document.getElementById(this._htmlElId + "_instanceMsg");
	this._seriesMsg = document.getElementById(this._htmlElId + "_seriesMsg");
};

ZmCalItemTypeDialog.prototype = new DwtDialog;
ZmCalItemTypeDialog.prototype.constructor = ZmCalItemTypeDialog;

// Public methods

ZmCalItemTypeDialog.prototype.toString =
function() {
	return "ZmCalItemTypeDialog";
};

ZmCalItemTypeDialog.prototype.initialize =
function(calItem, mode, type) {
	this.calItem = calItem;
	this.mode = mode;
	this._defaultRadio.checked = true;

	var m;
	if (type == ZmItem.APPT) {
		m = (calItem instanceof Array)
			? ZmMsg.isRecurringApptList
			: AjxMessageFormat.format(ZmMsg.isRecurringAppt, [calItem.getName()]);
	} else {
		m = AjxMessageFormat.format(ZmMsg.isRecurringTask, [calItem.getName()]);
	}
	if (mode == ZmCalItem.MODE_EDIT) {
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
		if (calItem instanceof Array) {
			this._questionCell.innerHTML = m + " " + ZmMsg.deleteApptListQuestion;
			this._instanceMsg.innerHTML = ZmMsg.deleteInstances;
		} else {
			this._questionCell.innerHTML = m + " " + ZmMsg.deleteApptQuestion;
			this._instanceMsg.innerHTML = ZmMsg.deleteInstance;
		}
		this._seriesMsg.innerHTML = ZmMsg.deleteSeries;
	}
};

ZmCalItemTypeDialog.prototype.addSelectionListener =
function(buttonId, listener) {
	this._button[buttonId].addSelectionListener(listener);
};

ZmCalItemTypeDialog.prototype.isInstance =
function() {
	return this._defaultRadio.checked;
};
