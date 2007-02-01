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

	ZmCalItemEditView.call(this, parent, appCtxt, null, controller, null, DwtControl.ABSOLUTE_STYLE);
};

ZmTaskEditView.prototype = new ZmCalItemEditView;
ZmTaskEditView.prototype.constructor = ZmTaskEditView;


// Consts

ZmTaskEditView.PRIORITY_VALUES = [
	{ v:ZmCalItem.PRIORITY_LOW,		l:ZmMsg.low },
	{ v:ZmCalItem.PRIORITY_NORMAL,	l:ZmMsg.normal },
	{ v:ZmCalItem.PRIORITY_HIGH,	l:ZmMsg.high }];

ZmTaskEditView.STATUS_VALUES = [
	{ v:ZmCalItem.STATUS_NEED,		l:ZmMsg.notStarted },
	{ v:ZmCalItem.STATUS_COMP,		l:ZmMsg.completed },
	{ v:ZmCalItem.STATUS_INPR,		l:ZmMsg.inProgress},
	{ v:ZmCalItem.STATUS_WAIT,		l:ZmMsg.waitingOn },
	{ v:ZmCalItem.STATUS_DEFR,		l:ZmMsg.deferred },
	{ v:ZmCalItem.STATUS_CANC,		l:ZmMsg.cancelled }];

// Message dialog placement
ZmTaskEditView.DIALOG_X = 50;
ZmTaskEditView.DIALOG_Y = 100;


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

ZmTaskEditView.prototype._populateForEdit =
function(calItem, mode) {
	ZmCalItemEditView.prototype._populateForEdit.call(this, calItem, mode);

	this._location.setValue(calItem.getLocation());
	this._prioritySelect.setSelectedValue(calItem.priority);
	this._statusSelect.setSelectedValue(calItem.status);
	this._pCompleteSelect.setSelected(calItem.pComplete);
	this._statusCheckbox.checked = calItem.status == ZmCalItem.STATUS_COMP && calItem.pComplete == 100;
};

ZmTaskEditView.prototype._populateForSave =
function(calItem) {
	ZmCalItemEditView.prototype._populateForSave.call(this, calItem);

	calItem.location = this._location.getValue();
	// TODO - normalize
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (startDate) calItem.setStartDate(startDate, true);
	if (endDate) calItem.setEndDate(endDate, true);
	calItem.setAllDayEvent(true);
	calItem.pComplete = this._pCompleteSelect.getValue();
	calItem.priority = this._prioritySelect.getValue();
	calItem.status = this._statusSelect.getValue();

	return calItem;
};

ZmTaskEditView.prototype.isValid =
function() {
	var val = AjxStringUtil.trim(this._subjectField.getValue());
	if (val.length == 0) {
		throw ZmMsg.errorMissingSubject;
	}

	return true;
};

ZmTaskEditView.prototype.cleanup =
function() {
	ZmCalItemEditView.prototype.cleanup.call(this);

	this._startDateField.value = "";
	this._endDateField.value = "";
};


// Private/protected Methods

ZmTaskEditView.prototype._createHTML =
function() {
	this._statusCheckboxId 	= this._htmlElId + "_status_cbox";
	this._repeatDescId		= this._htmlElId + "_repeatDesc";

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

	// add location
	var params = {parent: this, type: DwtInputField.STRING, skipCaretHack:true};
	this._location = new DwtInputField(params);
	Dwt.setSize(this._location.getInputElement(), width, "22px");
	this._location.reparentHtmlElement(this._htmlElId + "_location");

	// add priority DwtSelect
	this._prioritySelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.PRIORITY_VALUES.length; i++) {
		this._prioritySelect.addOption(ZmTaskEditView.PRIORITY_VALUES[i].l, i==1, ZmTaskEditView.PRIORITY_VALUES[i].v);
	}
	this._prioritySelect.reparentHtmlElement(this._htmlElId + "_priority");

	var listener = new AjxListener(this, this._selectListener);
	// add status DwtSelect
	this._statusSelect = new DwtSelect(this);
	for (var i = 0; i < ZmTaskEditView.STATUS_VALUES.length; i++) {
		this._statusSelect.addOption(ZmTaskEditView.STATUS_VALUES[i].l, i==0, ZmTaskEditView.STATUS_VALUES[i].v);
	}
	this._statusSelect.addChangeListener(listener);
	this._statusSelect.reparentHtmlElement(this._htmlElId + "_status");

	// add percent complete DwtSelect
	this._pCompleteSelect = new DwtSelect(this);
	for (var i = 0; i <= 100; i += ZmTask.PCOMPLETE_INT) {
		this._pCompleteSelect.addOption((i+"%"), i==0, i);
	}
	this._pCompleteSelect.addChangeListener(listener);
	this._pCompleteSelect.reparentHtmlElement(this._htmlElId + "_complete");
};

ZmTaskEditView.prototype._addEventHandlers =
function() {
	var edvId = AjxCore.assignId(this);

	// add event listeners where necessary
	Dwt.setHandler(this._statusCheckbox, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONCLICK, ZmCalItemEditView._onClick);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOVER, ZmCalItemEditView._onMouseOver);
	Dwt.setHandler(this._repeatDescField, DwtEvent.ONMOUSEOUT, ZmCalItemEditView._onMouseOut);
	Dwt.setHandler(this._startDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);
	Dwt.setHandler(this._endDateField, DwtEvent.ONCHANGE, ZmCalItemEditView._onChange);

	this._repeatDescField._editViewId = this._statusCheckbox._editViewId = edvId;
	this._startDateField._editViewId = this._endDateField._editViewId = edvId;
};

// cache all input fields so we dont waste time traversing DOM each time
ZmTaskEditView.prototype._cacheFields =
function() {
	ZmCalItemEditView.prototype._cacheFields.call(this);
	this._statusCheckbox = document.getElementById(this._statusCheckboxId);
};

// Returns a string representing the form content
ZmTaskEditView.prototype._formValue =
function(excludeAttendees) {
	var vals = [];

	vals.push(this._subjectField.getValue());
	vals.push(this._location.getValue());
	vals.push(this._prioritySelect.getValue());
	vals.push("" + this._statusCheckbox.checked);
	vals.push(this._pCompleteSelect.getValue());
	vals.push(this._statusSelect.getValue());
	var startDate = AjxDateUtil.simpleParseDateStr(this._startDateField.value);
	if (startDate) vals.push(AjxDateUtil.getServerDateTime(startDate));
	var endDate = AjxDateUtil.simpleParseDateStr(this._endDateField.value);
	if (endDate) vals.push(AjxDateUtil.getServerDateTime(endDate));
	vals.push(this._repeatSelect.getValue());
	vals.push(this._notesHtmlEditor.getContent());

	var str = vals.join("|");
	str = str.replace(/\|+/, "|");
	return str;
};

ZmTaskEditView.prototype._addTabGroupMembers =
function(tabGroup) {
	tabGroup.addMember(this._subjectField);
	tabGroup.addMember(this._location);

	var bodyFieldId = this._notesHtmlEditor.getBodyFieldId();
	tabGroup.addMember(document.getElementById(bodyFieldId));
};

// Consistent spot to locate various dialogs
ZmTaskEditView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmTaskEditView.DIALOG_X, loc.y + ZmTaskEditView.DIALOG_Y);
};

ZmTaskEditView.prototype._setPercentCompleteFields =
function(isComplete) {
	var val = isComplete
		? ZmTaskEditView.STATUS_VALUES[1].v : ZmTaskEditView.STATUS_VALUES[0].v;
	this._statusSelect.setSelectedValue(val);
	this._pCompleteSelect.setSelected(isComplete ? (this._pCompleteSelect.size()-1) : 0);
};


// Listeners

ZmTaskEditView.prototype._selectListener =
function(ev) {
	
};


// Callbacks

ZmTaskEditView.prototype._handleOnClick =
function(el) {
	if (el.id == this._statusCheckboxId) {
		this._setPercentCompleteFields(el.checked);
	} else {
		ZmCalItemEditView.prototype._handleOnClick.call(this, el);
	}
};


// Static Methods

ZmTaskEditView.getPrintHtml =
function(task, appCtxt) {
	// TODO
	return "TODO";
};
