/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
* Creates an empty calItem view used to display read-only calendar items.
* @constructor
* @class
* Simple read-only view of an appointment or task. It looks more or less like a
* message - the notes have their own area at the bottom, and everything else
* goes into a header section at the top.
*
* @author Parag Shah
* @author Conrad Damon
*
* @param parent		[DwtComposite]	parent widget
* @param posStyle	[constant]		positioning style
* @param controller	[ZmController]	owning controller
*/
ZmCalItemView = function(parent, posStyle, controller) {
	if (arguments.length == 0) return;

	ZmMailMsgView.call(this, parent, null, posStyle, null, controller);
};

ZmCalItemView.prototype = new ZmMailMsgView;
ZmCalItemView.prototype.constructor = ZmCalItemView;

// Public methods

ZmCalItemView.prototype.toString =
function() {
	return "ZmCalItemView";
};

ZmCalItemView.prototype.getController =
function() {
	return this._controller;
};

// Following public overrides are a hack to allow this view to pretend it's a list view,
// as well as a calendar view
ZmCalItemView.prototype.getSelection =
function() {
	return [this._calItem];
};

ZmCalItemView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmCalItemView.prototype.needsRefresh =
function() {
	return false;
};

ZmCalItemView.prototype.addSelectionListener = function() {};
ZmCalItemView.prototype.addActionListener = function() {};
ZmCalItemView.prototype.handleActionPopdown = function(ev) {};

ZmCalItemView.prototype.getTitle =
function() {
	// override
};

ZmCalItemView.prototype.set =
function(calItem, prevView) {
	if (this._calItem == calItem) return;

	// so that Close button knows which view to go to
	this._prevView = prevView || this._controller._viewMgr.getCurrentViewName();

	this.reset();
	this._calItem = calItem;
	this._renderCalItem(calItem);
};

ZmCalItemView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	this._calItem = null;
};

ZmCalItemView.prototype.close =
function() {
	// override
};

ZmCalItemView.prototype.getPrintHtml =
function() {
	var attendees = this._calItem.getAttendeesText();
	var organizer = attendees ? this._calItem.getOrganizer() : null;

	var hasHtmlPart = (this._calItem.notesTopPart && this._calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
			? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
	var bodyPart = this._calItem.getNotesPart(mode);

	var subs = {
		subject: this._calItem.getName(),
		dateStr: this._getTimeString(this._calItem),
		location: this._calItem.getLocation(true),
		equipment: this._calItem.getEquipmentText(true),
		attendees: attendees,
		organizer: organizer,
		recurStr: this._calItem.getRecurBlurb(),
		attachStr: ZmCalItemView._getAttachString(this._calItem),
		bodyPart: bodyPart
	};

	return AjxTemplate.expand("calendar.Appointment#ReadOnlyPrint", subs);
};


// Private / protected methods

ZmCalItemView.prototype._renderCalItem =
function(calItem) {
	this._lazyCreateObjectManager();

	var subs = this._getSubs(calItem);
	var closeBtnCellId = this._htmlElId + "_closeBtnCell";
	this._hdrTableId = this._htmlElId + "_hdrTable";

	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("calendar.Appointment#ReadOnlyView", subs);

	// add the close button
	this._closeButton = new DwtButton(this, null, "DwtToolbarButton");
	this._closeButton.setImage("Close");
	this._closeButton.setText(ZmMsg.close);
	this._closeButton.reparentHtmlElement(closeBtnCellId);
	this._closeButton.addSelectionListener(new AjxListener(this, this.close));

	// content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);
	if (bodyPart) {
		this._makeIframeProxy(el, bodyPart, mode == ZmMimeTable.TEXT_PLAIN);
	}
};

ZmCalItemView.prototype._getSubs =
function(calItem) {
	// override
}

ZmCalItemView.prototype._getTimeString =
function(calItem) {
	// override
};

ZmCalItemView.prototype._setAttachmentLinks =
function() {
	// do nothing since calItem view renders attachments differently
};

// returns true if given dates are w/in a single day
ZmCalItemView.prototype._isOneDayAppt =
function(sd, ed) {
	var start = new Date(sd.getTime());
	var end = new Date(ed.getTime());

	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);

	return start.valueOf() == end.valueOf();
};

ZmCalItemView._getAttachString =
function(calItem) {
	var str = [];
	var j = 0;

	var attachList = calItem.getAttachments();
	if (attachList) {
		for (var i = 0; i < attachList.length; i++)
			str[j++] = calItem.getAttachListHtml(attachList[i]);
	}

	return str.join("");
};





/**
* Creates an empty appointment view.
* @constructor
* @class
* Simple read-only view of an appointment. It looks more or less like a message -
* the notes have their own area at the bottom, and everything else goes into a
* header section at the top.
*
* @author Parag Shah
* @author Conrad Damon
*
* @param parent		[DwtComposite]	parent widget
* @param posStyle	[constant]		positioning style
* @param controller	[ZmController]	owning controller
*/
ZmApptView = function(parent, posStyle, controller) {

	ZmCalItemView.call(this, parent, posStyle, controller);
};

ZmApptView.prototype = new ZmCalItemView;
ZmApptView.prototype.constructor = ZmApptView;

// Public methods

ZmApptView.prototype.toString =
function() {
	return "ZmApptView";
};

ZmApptView.prototype.getTitle =
function() {
	var name = this._calItem.getName();
	var attendees = this._calItem.getAttendeesText();
	var title = attendees ? ZmMsg.meeting : ZmMsg.appointment;
	return [ZmMsg.zimbraTitle, title, name].join(": ");
};

ZmApptView.prototype.close =
function() {
	this._controller._viewMgr.setView(this._prevView);
	this._controller._currentView = this._prevView;
	this._controller._resetToolbarOperations();
};

ZmApptView.prototype.setBounds =
function(x, y, width, height) {
	// dont reset the width!
	ZmMailMsgView.prototype.setBounds.call(this, x, y, Dwt.DEFAULT, height);
};

ZmApptView.prototype._getSubs =
function(calItem) {
	var subject = calItem.getName();
	var location = calItem.getLocation(true);
	var equipment = calItem.getEquipmentText(true);
	var isException = calItem._orig.isException;
	var dateStr = this._getTimeString(calItem);
	var attendees = calItem.getAttendeesText();
	var org, obo;
	var recurStr = calItem.isRecurring() ? calItem.getRecurBlurb() : null;
	var attachStr = ZmCalItemView._getAttachString(calItem);

	if (attendees) {
		var organizer = calItem.getOrganizer();
		var sender = calItem.message.getAddress(AjxEmailAddress.SENDER);
		var from = calItem.message.getAddress(AjxEmailAddress.FROM);
		var address = sender || from;
		org = address ? address.toString() : organizer;
		if (sender && organizer)
			obo = from ? from.toString() : organizer;
	}

	if (this._objectManager) {
	    this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
	    								   ZmObjectManager.ATTR_CURRENT_DATE,
	    								   calItem.startDate);

		subject = this._objectManager.findObjects(subject, true);
		location = this._objectManager.findObjects(location, true);
		equipment = this._objectManager.findObjects(equipment, true);
		dateStr = this._objectManager.findObjects(dateStr, true);
		if (org) org = this._objectManager.findObjects(org, true, ZmObjectManager.EMAIL);
		if (obo) obo = this._objectManager.findObjects(obo, true, ZmObjectManager.EMAIL);
		if (attendees) attendees = this._objectManager.findObjects(attendees, true);
	}

	return {
		id: this._htmlElId,
		subject: subject,
		location: location,
		equipment: equipment,
		isException: isException,
		dateStr: dateStr,
		attendees: attendees,
		org: org,
		obo: obo,
		recurStr: recurStr,
		attachStr: attachStr
	};
};

ZmApptView.prototype._getTimeString =
function(calItem) {
	var sd = calItem._orig.startDate;
	var ed = calItem._orig.endDate;

	var isAllDay = calItem.isAllDayEvent();
	var isMultiDay = calItem.isMultiDay();
	if(isAllDay && isMultiDay){
		var endDate = new Date(ed.getTime());
		ed.setDate(endDate.getDate()-1);
	}

	var pattern = isAllDay ?
				  (isMultiDay ? ZmMsg.apptTimeAllDayMulti   : ZmMsg.apptTimeAllDay) :
				  (isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance);
	var params = [sd, ed, AjxTimezone.getServerId(AjxTimezone.DEFAULT)];

	return AjxMessageFormat.format(pattern, params);
};





/**
* Creates an empty task view.
* @constructor
* @class
* Simple read-only view of a task. It looks more or less like a message -
* the notes have their own area at the bottom, and everything else goes into a
* header section at the top.
*
* @author Parag Shah
* @author Conrad Damon
*
* @param parent		[DwtComposite]	parent widget
* @param posStyle	[constant]		positioning style
* @param controller	[ZmController]	owning controller
*/
ZmTaskView = function(parent, posStyle, controller) {

	ZmCalItemView.call(this, parent, posStyle, controller);
};

ZmTaskView.prototype = new ZmCalItemView;
ZmTaskView.prototype.constructor = ZmTaskView;

// Public methods

ZmTaskView.prototype.toString =
function() {
	return "ZmTaskView";
};

ZmTaskView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, this._calItem.getName()].join(": ");
};

ZmTaskView.prototype.close =
function() {
	this._controller._app.popView();
};

ZmTaskView.prototype._getSubs =
function(calItem) {
	var subject = calItem.getName();
	var location = calItem.getLocation(true);
	var isException = calItem._orig ? calItem._orig.isException : calItem.isException;
	var startDate = calItem.startDate ? AjxDateFormat.getDateInstance().format(calItem.startDate) : null;
	var dueDate = calItem.endDate ? AjxDateFormat.getDateInstance().format(calItem.endDate) : null;
	var priority = calItem.priority ? ZmCalItem.getLabelForPriority(calItem.priority) : null;
	var status = calItem.status ? ZmCalItem.getLabelForStatus(calItem.status) : null;
	var pComplete = calItem.pComplete;
	var recurStr = calItem.isRecurring() ? calItem.getRecurBlurb() : null;
	var attachStr = ZmCalItemView._getAttachString(calItem);

	if (this._objectManager) {
	    this._objectManager.setHandlerAttr(ZmObjectManager.DATE,
	    								   ZmObjectManager.ATTR_CURRENT_DATE,
	    								   calItem.startDate);

		subject = this._objectManager.findObjects(subject, true);
		if (location) location = this._objectManager.findObjects(location, true);
		if (startDate) startDate = this._objectManager.findObjects(startDate, true);
		if (dueDate) dueDate = this._objectManager.findObjects(dueDate, true);
	}

	return {
		id: this._htmlElId,
		subject: subject,
		location: location,
		isException: isException,
		startDate: startDate,
		dueDate: dueDate,
		priority: priority,
		status: status,
		pComplete: pComplete,
		recurStr: recurStr,
		attachStr: attachStr
	};
};

ZmTaskView.getPrintHtml =
function(task, preferHtml, callback) {
	var ct = preferHtml ? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var subs = {
		task: task,
		attachments: task.hasAttachments() ? ZmCalItemView._getAttachString(task) : null,
		isHtml: preferHtml,
		content: task.getNotesPart(ct)
	};

	var html = AjxTemplate.expand("tasks.Tasks#PrintView", subs);

	if (callback) {
		callback.run(new ZmCsfeResult(html));
	} else {
		return html;
	}
};
