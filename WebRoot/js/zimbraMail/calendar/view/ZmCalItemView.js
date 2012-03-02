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
 * @param {DwtComposite}	parent		the parent widget
 * @param {constant}	posStyle	the positioning style
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		ZmMailMsgView
 * 
 * @private
 */
ZmCalItemView = function(parent, posStyle, controller) {
	if (arguments.length == 0) return;

	ZmMailMsgView.call(this, {parent:parent, posStyle:posStyle, controller:controller});
};

ZmCalItemView.prototype = new ZmMailMsgView;
ZmCalItemView.prototype.constructor = ZmCalItemView;

// Public methods

ZmCalItemView.prototype.isZmCalItemView = true;
ZmCalItemView.prototype.toString = function() { return "ZmCalItemView"; };

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
function(calItem, prevView, mode) {
	if (this._calItem == calItem) { return; }

	// So that Close button knows which view to go to
    // condition introduced to avoid irrelevant view being persisted as previous view
	var viewMgr = this._controller._viewMgr;
	this._prevView = prevView || (viewMgr && (calItem.folderId != ZmFolder.ID_TRASH) ?
	                              viewMgr.getCurrentViewName() : this._prevView);

	this.reset();
	this._calItem = calItem;
	this._mode = mode;
	this._renderCalItem(calItem, true);
};

ZmCalItemView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	this._calItem = null;    
};

ZmCalItemView.prototype.close = function() {}; // override
ZmCalItemView.prototype.move = function() {}; // override
ZmCalItemView.prototype.changeReminder = function() {}; // override


// Private / protected methods

ZmCalItemView.prototype._renderCalItem =
function(calItem, renderButtons) {
	this._lazyCreateObjectManager();

	var subs = this._getSubs(calItem);
	var closeBtnCellId = this._htmlElId + "_closeBtnCell";
	var editBtnCellId = this._htmlElId + "_editBtnCell";
	this._hdrTableId = this._htmlElId + "_hdrTable";

    var calendar = calItem.getFolder();
    var isReadOnly = calendar.isReadOnly();
    subs.allowEdit = !isReadOnly && (appCtxt.get(ZmSetting.CAL_APPT_ALLOW_ATTENDEE_EDIT) || calItem.isOrg);

	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("calendar.Appointment#ReadOnlyView", subs);

    if (renderButtons) {
        // add the close button
        this._closeButton = new DwtButton({parent:this, className:"DwtToolbarButton"});
        this._closeButton.setImage("Close");
        this._closeButton.setText(ZmMsg.close);
        this._closeButton.addSelectionListener(new AjxListener(this, this.close));
        this._closeButton.reparentHtmlElement(closeBtnCellId);

        if (document.getElementById(editBtnCellId)) {
            // add the save button for reminders and  move select
            this._editButton = new DwtButton({parent:this, className:"DwtToolbarButton"});
            this._editButton.setImage("Edit");
            this._editButton.setText(ZmMsg.edit);
            this._editButton.addSelectionListener(new AjxListener(this, this.edit));
            var calendar = calItem && appCtxt.getById(calItem.folderId);
            var isTrash = calendar && calendar.id == ZmOrganizer.ID_TRASH;
            this._editButton.setEnabled(!isTrash);
            this._editButton.reparentHtmlElement(editBtnCellId);
        }
    }

	// content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);
	if (bodyPart) {
		this._msg = this._msg || this._calItem._currentlyLoaded;
		this._makeIframeProxy({container: el, html:bodyPart, isTextMsg:(mode == ZmMimeTable.TEXT_PLAIN)});
	}
};

ZmCalItemView.prototype._getSubs =
function(calItem) {
	// override
};

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
		for (var i = 0; i < attachList.length; i++) {
			str[j++] = ZmApptViewHelper.getAttachListHtml(calItem, attachList[i]);
		}
	}

	return str.join("");
};

ZmCalItemView.rfc822Callback =
function(invId, partId) {
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
 * @param {DwtComposite}	parent		the parent widget
 * @param {constant}	posStyle	the positioning style
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		ZmCalItemView
 * 
 * @private
 */
ZmApptView = function(parent, posStyle, controller) {

	ZmCalItemView.call(this, parent, posStyle, controller);
};

ZmApptView.prototype = new ZmCalItemView;
ZmApptView.prototype.constructor = ZmApptView;

ZmApptView.prototype.isZmApptView = true;
ZmApptView.prototype.toString = function() { return "ZmApptView"; };

// Public methods

ZmApptView.prototype.getTitle =
function() {
    return [ZmMsg.zimbraTitle, ZmMsg.appointment].join(": ");
};

ZmApptView.prototype.edit =
function(ev) {
	var item = this._calItem;

    if(!item.isOrg && !(this._editWarningDialog && this._editWarningDialog.isPoppedUp())){
        var msgDialog = this._editWarningDialog = appCtxt.getMsgDialog();
        msgDialog.setMessage(ZmMsg.attendeeEditWarning, DwtMessageDialog.WARNING_STYLE);
        msgDialog.popup();
        msgDialog.registerCallback(DwtDialog.OK_BUTTON, this.edit, this);
        return;
    }else if(this._editWarningDialog){
        this._editWarningDialog.popdown();
    }
    
	var mode = ZmCalItem.MODE_EDIT;
	if (item.isRecurring()) {
		mode = this._mode || ZmCalItem.MODE_EDIT_SINGLE_INSTANCE;
	}
	item.setViewMode(mode);
	var app = this._controller._app;
	app.getApptComposeController().show(item, mode);
};

ZmApptView.prototype.setBounds =
function(x, y, width, height) {
	// dont reset the width!
	ZmMailMsgView.prototype.setBounds.call(this, x, y, Dwt.DEFAULT, height);
};

ZmApptView.prototype._renderCalItem =
function(calItem) {
	this._lazyCreateObjectManager();

	var subs = this._getSubs(calItem);
	this._hdrTableId = this._htmlElId + "_hdrTable";


    var calendar = calItem.getFolder();
    var isReadOnly = calendar.isReadOnly();
    subs.allowEdit = !isReadOnly && (appCtxt.get(ZmSetting.CAL_APPT_ALLOW_ATTENDEE_EDIT) || calItem.isOrg);

	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("calendar.Appointment#ReadOnlyView", subs);


    var selParams = {parent: this};
    var statusSelect = new DwtSelect(selParams);

    var ptst = {};
    ptst[ZmCalBaseItem.PSTATUS_NEEDS_ACTION] = ZmMsg.ptstMsgNeedsAction;
    ptst[ZmCalBaseItem.PSTATUS_ACCEPT] = ZmMsg.ptstMsgAccepted;
    ptst[ZmCalBaseItem.PSTATUS_TENTATIVE] = ZmMsg.ptstMsgTentative;
    ptst[ZmCalBaseItem.PSTATUS_DECLINED] = ZmMsg.ptstMsgDeclined;

    this._ptst = ptst;
    //var statusMsgs = {};

    var data = null;
    for (var stat in ptst) {
        //stat = ptst[index];
        data = new DwtSelectOptionData(stat, ZmCalItem.getLabelForParticipationStatus(stat), false, null, ZmCalItem.getParticipationStatusIcon(stat));
        statusSelect.addOption(data);
        if (stat == calItem.ptst){
            statusSelect.setSelectedValue(stat);
        }
    }

    this._statusSelect = statusSelect;
    this._origPtst = calItem.ptst;
    statusSelect.reparentHtmlElement(this._htmlElId + "_responseActionSelectCell");
    statusSelect.addChangeListener(new AjxListener(this, this._statusSelectListener));

    this._statusMsgEl = document.getElementById(this._htmlElId + "_responseActionMsgCell");
    this._statusMsgEl.innerHTML = ptst[calItem.ptst];

	// content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);
	if (bodyPart) {
		this._msg = this._msg || this._calItem._currentlyLoaded;
		this._makeIframeProxy({container: el, html:bodyPart, isTextMsg:(mode == ZmMimeTable.TEXT_PLAIN)});
	}
};

ZmApptView.prototype._getSubs =
function(calItem) {
	var subject = calItem.getName();
	var location = calItem.getAttendeesText(ZmCalBaseItem.LOCATION, true) || calItem.location;
	var equipment = calItem.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	var isException = calItem._orig.isException;
	var dateStr = this._getTimeString(calItem);
	//var attendees = calItem.getAttendeesText(ZmCalBaseItem.PERSON);
    var isAttendees = false;
    var reqAttendees = calItem.getAttendeesTextByRole(ZmCalBaseItem.PERSON, ZmCalItem.ROLE_REQUIRED, true, this._objectManager, this._htmlElId);
    var optAttendees = calItem.getAttendeesTextByRole(ZmCalBaseItem.PERSON, ZmCalItem.ROLE_OPTIONAL, true, this._objectManager, this._htmlElId);
    if(reqAttendees || optAttendees) isAttendees = true;
	var org, obo;
	var recurStr = calItem.isRecurring() ? calItem.getRecurBlurb() : null;
	var attachStr = ZmCalItemView._getAttachString(calItem);

	if (isAttendees) {
		var organizer = org = calItem.getOrganizer();
		var sender = calItem.message.getAddress(AjxEmailAddress.SENDER);
		var from = calItem.message.getAddress(AjxEmailAddress.FROM);
		var address = sender || from;
        if(!org && address)	org = address.toString();
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
	}

	return {
		id: this._htmlElId,
		subject: subject,
		location: location,
		equipment: equipment,
		isException: isException,
		dateStr: dateStr,
        isAttendees: isAttendees,
        reqAttendees: reqAttendees,
		optAttendees: optAttendees,
		org: org,
		obo: obo,
		recurStr: recurStr,
		attachStr: attachStr,
		folder: appCtxt.getTree(ZmOrganizer.CALENDAR).getById(calItem.folderId),
		//folders: String(calItem.id).match(/:/) ? [] : this._controller.getCalendars(),
		folderLabel: ZmMsg.calendar,
		reminderLabel: ZmMsg.reminder,
		alarm: calItem.alarm,
		isAppt: true
	};
};

ZmApptView.prototype._getTimeString =
function(calItem) {
	var sd = calItem._orig.startDate;
	var ed = calItem._orig.endDate;
    var tz = AjxMsg[AjxTimezone.DEFAULT] || AjxTimezone.getServerId(AjxTimezone.DEFAULT)

	if (calItem.isRecurring() && this._mode == ZmCalItem.MODE_EDIT_SERIES) {
		sd = calItem.startDate;
		ed = calItem.endDate;
        var seriesTZ = calItem.getTimezone();

        //convert to client timezone if appt's timezone differs
        if(seriesTZ != AjxTimezone.getServerId(AjxTimezone.DEFAULT)) {
            var offset1 = AjxTimezone.getOffset(AjxTimezone.DEFAULT, sd);
		    var offset2 = AjxTimezone.getOffset(AjxTimezone.getClientId(seriesTZ), sd);
            sd.setTime(sd.getTime() + (offset1 - offset2)*60*1000);
            ed.setTime(ed.getTime() + (offset1 - offset2)*60*1000);
            calItem.setTimezone(AjxTimezone.getServerId(AjxTimezone.DEFAULT));
        }
	}

	var isAllDay = calItem.isAllDayEvent();
	var isMultiDay = calItem.isMultiDay();
	if (isAllDay && isMultiDay) {
		var endDate = new Date(ed.getTime());
		ed.setDate(endDate.getDate()-1);
	}

	var pattern = isAllDay ?
				  (isMultiDay ? ZmMsg.apptTimeAllDayMulti   : ZmMsg.apptTimeAllDay) :
				  (isMultiDay ? ZmMsg.apptTimeInstanceMulti : ZmMsg.apptTimeInstance);
	var params = [sd, ed, tz];

	return AjxMessageFormat.format(pattern, params);
};

ZmApptView.prototype.set =
function(appt, mode) {
	this.reset();
	this._calItem = appt;
	this._mode = mode;
	this._renderCalItem(appt, false);
};

ZmApptView.prototype.reEnableDesignMode =
function() {

};

ZmApptView.prototype.isDirty =
function() {
    var retVal = false,
        value = this._statusSelect.getValue();
    if(this._origPtst != value) {
        retVal = true;
    }
    return retVal;
};

ZmApptView.prototype.isValid =
function() {
    // No fields to validate
    return true;
}

ZmApptView.prototype.setOrigPtst =
function(value) {
    this._origPtst = value;
    this._statusSelectListener();
};

ZmApptView.prototype.cleanup =
function() {
    return false;
};

ZmApptView.prototype.getOpValue =
function() {
    var value = this._statusSelect.getValue(),
        statusToOp = {};
    statusToOp[ZmCalBaseItem.PSTATUS_NEEDS_ACTION] = null;
    statusToOp[ZmCalBaseItem.PSTATUS_ACCEPT] = ZmOperation.REPLY_ACCEPT;
    statusToOp[ZmCalBaseItem.PSTATUS_TENTATIVE] = ZmOperation.REPLY_TENTATIVE;
    statusToOp[ZmCalBaseItem.PSTATUS_DECLINED] = ZmOperation.REPLY_DECLINE;
    return statusToOp[value];
};

ZmApptView.prototype._statusSelectListener =
function() {
    var saveButton = this.getController().getCurrentToolbar().getButton(ZmOperation.SAVE),
        value = this._statusSelect.getValue();
    saveButton.setEnabled(this._origPtst != value);
    this._statusMsgEl.innerHTML = this._ptst[value];
};

ZmApptView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmApptComposeView.DIALOG_X, loc.y + ZmApptComposeView.DIALOG_Y);
};
