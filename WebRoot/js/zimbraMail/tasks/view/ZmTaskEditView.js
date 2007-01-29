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
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

function ZmTaskEditView(parent, appCtxt, controller) {
	if (arguments.length == 0) return;

	ZmCalItemEditView.call(this, parent, appCtxt, null, null, DwtControl.ABSOLUTE_STYLE);

	// XXX: may not need this
	this._controller = controller;
};

ZmTaskEditView.prototype = new ZmCalItemEditView;
ZmTaskEditView.prototype.constructor = ZmTaskEditView;


// Consts

ZmTaskEditView.PRIORITY_VALUES = [
	{ v:ZmTask.PRIORITY_LOW,	l:ZmMsg.low },
	{ v:ZmTask.PRIORITY_NORMAL,	l:ZmMsg.normal },
	{ v:ZmTask.PRIORITY_HIGH,	l:ZmMsg.high }];

ZmTaskEditView.STATUS_VALUES = [
	{ v:"TENT",					l:ZmMsg.notStarted },
	{ v:"COMP",					l:ZmMsg.completed },
	{ v:"INPR",					l:ZmMsg.inProgress},
	{ v:"WAITING",				l:ZmMsg.waitingOn },
	{ v:"DEFERRED",				l:ZmMsg.deferred }];


// Public Methods

ZmTaskEditView.prototype.toString =
function() {
	return "ZmTaskEditView";
};

ZmTaskEditView.prototype.set =
function(calItem) {
	this.initialize(calItem);
};

ZmTaskEditView.prototype._getClone =
function() {
	return ZmTask.quickClone(this._calItem);
};

ZmTaskEditView.prototype._populateForSave =
function(calItem) {
	ZmCalItemEditView.prototype._populateForSave.call(this, calItem);

	// set location
	calItem.setAttendees([this._location.getValue()], ZmCalItem.LOCATION);

	// set start/end dates if applicable
	// TODO - normalize
	var startDate = AjxDateUtil.simpleParseDateStr(document.getElementById(this._dateStartId).value);
	var endDate = AjxDateUtil.simpleParseDateStr(document.getElementById(this._dateDueId).value);
	calItem.setAllDayEvent(true);
	calItem.setStartDate(startDate, true);
	calItem.setEndDate(endDate, true);

	calItem.setPercentComplete(this._pCompleteSelect.getValue());
	calItem.setPriority(this._prioritySelect.getValue());
	calItem.setStatus(this._statusSelect.getValue());

	return calItem;
};

ZmTaskEditView.prototype.isValid =
function() {
	var val = AjxStringUtil.trim(document.getElementById(this._subjectId).value);
	if (val.length == 0) {
		throw ZmMsg.errorMissingSubject;
	}

	return true;
};

ZmTaskEditView.prototype.cleanup =
function() {
	ZmCalItemEditView.prototype.cleanup.call(this);

	this._pCompleteSelect.setSelected(0);
	this._prioritySelect.setSelected(1);
};


// Private/protected Methods

ZmTaskEditView.prototype._createHTML =
function() {
	this._repeatDescId = this._htmlElId + "_repeatDesc";

	var subs = {
		id: this._htmlElId,
		height: (this.parent.getSize().y - 30),
		locationId: (this._htmlElId + "_location"),
		isGalEnabled: this._appCtxt.get(ZmSetting.GAL_ENABLED),
		isAppt: false
	};

	// XXX: rename template name to CalItem#CalItemEdit
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.calendar.templates.Appointment#EditView", subs);
};

ZmTaskEditView.prototype._createWidgets =
function(width) {
	ZmCalItemEditView.prototype._createWidgets.call(this, width);

	var listener = new AjxListener(this, this._selectListener);

	// add location
	var params = {parent: this, type: DwtInputField.STRING, skipCaretHack:true};
	this._location = new DwtInputField(params);
	Dwt.setSize(this._location.getInputElement(), width, "22px");
	this._location.reparentHtmlElement(this._htmlElId + "_location");

	// add percent complete DwtSelect
	this._pCompleteSelect = new DwtSelect(this);
	for (var i = 0; i <= 100; i += 10) {
		this._pCompleteSelect.addOption((i+"%"), i==0, i);
	}
	this._pCompleteSelect.addChangeListener(listener);
	this._pCompleteSelect.reparentHtmlElement(this._htmlElId + "_complete");

	// add priority DwtSelect
	this._prioritySelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.PRIORITY_VALUES.length; i++) {
		this._prioritySelect.addOption(ZmTaskEditView.PRIORITY_VALUES[i].l, i==1, ZmTaskEditView.PRIORITY_VALUES[i].v);
	}
	this._prioritySelect.addChangeListener(listener);
	this._prioritySelect.reparentHtmlElement(this._htmlElId + "_priority");

	// add status DwtSelect
	this._statusSelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.STATUS_VALUES.length; i++) {
		this._statusSelect.addOption(ZmTaskEditView.STATUS_VALUES[i].l, i==0, ZmTaskEditView.STATUS_VALUES[i].v);
	}
	this._statusSelect.addChangeListener(listener);
	this._statusSelect.reparentHtmlElement(this._htmlElId + "_status");
};

ZmTaskEditView.prototype._addEventHandlers =
function() {
	// add event listeners where necessary
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmApptEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmApptEditView._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmApptEditView._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmApptEditView._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmApptEditView._onChange);

	this._repeatDescField._editViewId = this._startDateField._editViewId = this._endDateField._editViewId = AjxCore.assignId(this);
};

ZmTaskEditView.prototype._addTabGroupMembers =
function(tabGroup) {
	tabGroup.addMember(this._subjectField);
	tabGroup.addMember(this._location);

	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	tabGroup.addMember(document.getElementById(bodyFieldId));
};


// Listeners

ZmTaskEditView.prototype._selectListener =
function(ev) {
	this._isDirty = true;
};


// Static Methods

ZmTaskEditView.getPrintHtml =
function(task, appCtxt) {
	// TODO
	return "TODO";
};
