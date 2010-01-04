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

	ZmMailMsgView.call(this, {parent:parent, posStyle:posStyle, controller:controller});
    this.setScrollWithIframe(true);// For the bug no 12995
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
ZmCalItemView.prototype.move = function() {}; // override
ZmCalItemView.prototype.changeReminder = function() {}; // override

ZmCalItemView.prototype.getPrintHtml =
function() {
	var attendees = this._calItem.getAttendeesText(ZmCalBaseItem.PERSON);
	var organizer = attendees ? this._calItem.getOrganizer() : null;

	var hasHtmlPart = (this._calItem.notesTopPart && this._calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
			? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;
	var bodyPart = this._calItem.getNotesPart(mode);

	var subs = {
		subject: this._calItem.getName(),
		dateStr: this._getTimeString(this._calItem),
		location: this._calItem.getAttendeesText(ZmCalBaseItem.LOCATION, true),
		equipment: this._calItem.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true),
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
	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("calendar.Appointment#ReadOnlyView", subs);

	this._hdrTableId = this._htmlElId + "_hdrTable";

	// add the close button
	var closeBtnCellId = this._htmlElId + "_closeBtnCell";
	var closeButton = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:closeBtnCellId});
	closeButton.setImage("Close");
	closeButton.setText(ZmMsg.close);
	closeButton.addSelectionListener(new AjxListener(this, this.close));

	// add the save button for reminders and  move select
	var saveBtnCellId = this._htmlElId + "_saveBtnCell";
	var saveButton = new DwtButton({parent:this, className:"DwtToolbarButton", parentElement:saveBtnCellId});
	saveButton.setImage("Save");
	saveButton.setText(ZmMsg.save);
	saveButton.addSelectionListener(new AjxListener(this, this.save));

    // add the move select
	var moveSelectId = this._htmlElId + "_folderCell";
	if (document.getElementById(moveSelectId) && subs.folders.length > 0) {
		this._moveSelect = new DwtSelect({parent: this});
		this._moveSelect.clearOptions();
		for (var i = 0; i < subs.folders.length; i++) {
			var folder = subs.folders[i];
			this._moveSelect.addOption(folder.name, folder.id == calItem.folderId, folder.id);
		}
		this._moveSelect.replaceElement(moveSelectId);
	}

    // add the reminder select
	var reminderSelectId = this._htmlElId + "_reminderCell";
	if (document.getElementById(reminderSelectId)) {
		var	displayOptions = [ZmMsg.apptRemindNever, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNHoursBefore, ZmMsg.apptRemindNHoursBefore, ZmMsg.apptRemindNHoursBefore, ZmMsg.apptRemindNHoursBefore, ZmMsg.apptRemindNHoursBefore ];
	    var	options = this._reminderOptions = [0, 1, 5, 10, 15, 30, 45, 60, 120, 180, 240, 300, 1080];
	    var	labels = [0, 1, 5, 10, 15, 30, 45, 60, 2, 3, 4, 5, 18];
        this._reminderSelect = new DwtSelect({parent: this});
		this._reminderSelect.clearOptions();
        for (var j = 0; j < options.length; j++) {
            var optLabel = ZmCalendarApp.__formatLabel(displayOptions[j], labels[j]);
            this._reminderSelect.addOption(optLabel, (calItem._reminderMinutes == options[j]), options[j]);
        }
		this._reminderSelect.replaceElement(reminderSelectId);
	}

    // content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);
	if (bodyPart) {
		this._msg = this._msg || this._calItem._currentlyLoaded;
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

ZmCalItemView.rfc822Callback = function(invId, partId){
    AjxDispatcher.require("MailCore", false);
    ZmMailMsgView.rfc822Callback(invId, partId);
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
	var attendees = this._calItem.getAttendeesText(ZmCalBaseItem.PERSON);
	var title = attendees ? ZmMsg.meeting : ZmMsg.appointment;
	return [ZmMsg.zimbraTitle, title, name].join(": ");
};

ZmApptView.prototype.close =
function() {
	this._controller._viewMgr.setView(this._prevView);
	this._controller._currentView = this._prevView;
	this._controller._resetToolbarOperations();
	// HACK: Since the appt read-only view is not a true view (in the
	//       ZmAppViewMgr sense), we need to force a refresh, if needed.
	if (this._controller._viewMgr.needsRefresh()) {
		this._controller._scheduleMaintenance(ZmCalViewController.MAINT_VIEW);
	}
};

ZmApptView.prototype.move =
function(ev) {
	var item = this._calItem 
	var ofolder = item.folderId;
	var nfolder = ev.item.parent.parent.getValue();
	if (ofolder == nfolder) return;

	var args = [ ofolder, nfolder ];
	var callback = new AjxCallback(this, this._handleMoveResponse, args);
	var errorCallback = new AjxCallback(this, this._handleMoveError, args);
	item.move(nfolder, callback, errorCallback);
};

ZmApptView.prototype.save =
function(ev) {
	var item = this._calItem
	var isDirty = false;

	if (this._reminderSelect && this._reminderSelect.getValue() != item._reminderMinutes) {
		item.setReminderMinutes(this._reminderSelect.getValue());
		isDirty = true;
	}
	if (this._moveSelect && this._moveSelect.getValue() != item.folderId) {
		item.folderId = this._moveSelect.getValue();
		isDirty = true;
	}

	if (!isDirty) {
		return;
	}

	var viewMode = ZmCalItem.MODE_EDIT;
	if (item.isRecurring()) {
		viewMode = item.isException ? ZmCalItem.MODE_EDIT_SINGLE_INSTANCE : ZmCalItem.MODE_EDIT_SERIES;
	}
	item.setViewMode(viewMode);
	var callback = new AjxCallback(this, this._saveCallback);
	var errorCallback = new AjxCallback(this, this._handleErrorSave);
	item.save(null, callback, errorCallback);
};

ZmApptView.prototype._saveCallback =
function() {
	appCtxt.setStatusMsg(ZmMsg.savedAppointment);
};

ZmApptView.prototype._handleErrorSave =
function(ex) {
    var msg = ZmMsg.errorSavingAppt;
    var msgDialog = appCtxt.getMsgDialog();
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup();
	return true;
};

ZmApptView.prototype._handleMoveResponse = function(ofolder, nfolder, resp) {
	// TODO: Should we display some confirmation?
};
ZmApptView.prototype._handleMoveError = function(ofolder, nfolder, resp) {
	this._moveSelect.setSelectedValue(ofolder);
	var params = {
		msg:	ZmMsg.errorMoveAppt,
		level:	ZmStatusView.LEVEL_CRITICAL
	};
	appCtxt.setStatusMsg(params);
	return true;
};

ZmApptView.prototype.setBounds =
function(x, y, width, height) {
	// dont reset the width!
	ZmMailMsgView.prototype.setBounds.call(this, x, y, Dwt.DEFAULT, height);
};

ZmApptView.prototype._getSubs =
function(calItem) {
	var subject = calItem.getName();
	var location = calItem.getAttendeesText(ZmCalBaseItem.LOCATION, true) || calItem.location;
	var equipment = calItem.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	var isException = calItem._orig.isException;
	var dateStr = this._getTimeString(calItem);
	var attendees = calItem.getAttendeesText(ZmCalBaseItem.PERSON);
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
		attachStr: attachStr,
		folder: appCtxt.getTree(ZmOrganizer.CALENDAR).getById(calItem.folderId),
		folders: String(calItem.id).match(/:/) ? [] : this._controller.getCalendars(),
		folderLabel: ZmMsg.calendar,
        reminderLabel: ZmMsg.reminder,
        alarm: calItem.alarm
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
	var params = [sd, ed, AjxMsg[AjxTimezone.DEFAULT] || AjxTimezone.getServerId(AjxTimezone.DEFAULT)];

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
	var location = calItem.location;
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
		attachStr: attachStr,
		folder: appCtxt.getTree(ZmOrganizer.TASKS).getById(calItem.folderId),
		folderLabel: ZmMsg.folder
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
