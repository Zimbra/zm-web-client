/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
ZmCalItemView = function(parent, posStyle, controller, id, className) {
	if (arguments.length == 0) return;

	params = {parent: parent, posStyle: posStyle, controller: controller};
	if (id) {
		params.id = id;
	}
	if (className) {
		params.className = className;
	}
	ZmMailMsgView.call(this, params);
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
	this._calItem = this._item = calItem;
	this._mode = mode;
	this._renderCalItem(calItem, true);
};

ZmCalItemView.prototype.reset =
function() {
	ZmMailMsgView.prototype.reset.call(this);
	this._calItem = this._item = null;
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
	var offlineHandler = appCtxt.webClientOfflineHandler;
	if (offlineHandler) {
		var linkIds = [ZmCalItem.ATT_LINK_IMAGE, ZmCalItem.ATT_LINK_MAIN, ZmCalItem.ATT_LINK_DOWNLOAD];
		var getLinkIdCallback = this._getAttachmentLinkId.bind(this);
		offlineHandler._handleAttachmentsForOfflineMode(calItem.getAttachments(), getLinkIdCallback, linkIds);
	}

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
        if (mode === ZmMimeTable.TEXT_PLAIN) {
            bodyPart = AjxStringUtil.convertToHtml(bodyPart);
        }
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



ZmCalItemView.prototype._getAttachString =
function(calItem) {
	var str = [];
	var j = 0;

	var attachList = calItem.getAttachments();
	if (attachList) {
		var getLinkIdCallback = this._getAttachmentLinkId.bind(this);
		for (var i = 0; i < attachList.length; i++) {
			str[j++] = ZmApptViewHelper.getAttachListHtml(calItem, attachList[i], false, getLinkIdCallback);
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
		this._editWarningDialog.reset();
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
	subs.subject = AjxStringUtil.htmlEncode(subs.subject);
	subs.location = AjxStringUtil.htmlEncode(subs.location);

	this._hdrTableId = this._htmlElId + "_hdrTable";

    var calendar = calItem.getFolder();
    var isReadOnly = calendar.isReadOnly() || calendar.isInTrash();
    subs.allowEdit = !isReadOnly && (appCtxt.get(ZmSetting.CAL_APPT_ALLOW_ATTENDEE_EDIT) || calItem.isOrg);

	var el = this.getHtmlElement();
	el.innerHTML = AjxTemplate.expand("calendar.Appointment#ReadOnlyView", subs);
	var offlineHandler = appCtxt.webClientOfflineHandler;
	if (offlineHandler) {
		var linkIds = [ZmCalItem.ATT_LINK_IMAGE, ZmCalItem.ATT_LINK_MAIN, ZmCalItem.ATT_LINK_DOWNLOAD];
		var getLinkIdCallback = this._getAttachmentLinkId.bind(this);
		offlineHandler._handleAttachmentsForOfflineMode(calItem.getAttachments(), getLinkIdCallback, linkIds);
	}

	// Set tab name as Appointment subject
	var subject = AjxStringUtil.trim(calItem.getName());
	if (subject) {
		var tabButtonText = subject.substring(0, ZmAppViewMgr.TAB_BUTTON_MAX_TEXT);
		appCtxt.getAppViewMgr().setTabTitle(this._controller.getCurrentViewId(), tabButtonText);
	}

	this._createBubbles();

    var selParams = {parent: this, id: Dwt.getNextId('ZmNeedActionSelect_')};
    var statusSelect = new DwtSelect(selParams);

    var ptst = {};
    ptst[ZmCalBaseItem.PSTATUS_NEEDS_ACTION] = ZmMsg.ptstMsgNeedsAction;
    ptst[ZmCalBaseItem.PSTATUS_ACCEPT] = ZmMsg.ptstMsgAccepted;
    ptst[ZmCalBaseItem.PSTATUS_TENTATIVE] = ZmMsg.ptstMsgTentative;
    ptst[ZmCalBaseItem.PSTATUS_DECLINED] = ZmMsg.ptstMsgDeclined;

    this._ptst = ptst;
    //var statusMsgs = {};
    var calItemPtst = calItem.ptst || ZmCalBaseItem.PSTATUS_ACCEPT;

    var data = null;
    for (var stat in ptst) {
        //stat = ptst[index];
        if (stat === ZmCalBaseItem.PSTATUS_NEEDS_ACTION && calItemPtst !== ZmCalBaseItem.PSTATUS_NEEDS_ACTION) { continue; }
        data = new DwtSelectOptionData(stat, ZmCalItem.getLabelForParticipationStatus(stat), false, null, ZmCalItem.getParticipationStatusIcon(stat), Dwt.getNextId('ZmNeedActionOption_' + stat + '_'));
        statusSelect.addOption(data);
        if (stat == calItemPtst){
            statusSelect.setSelectedValue(stat);
        }
    }
    if (isReadOnly) { statusSelect.setEnabled(false); }

    this._statusSelect = statusSelect;
    this._origPtst = calItemPtst;
    statusSelect.reparentHtmlElement(this._htmlElId + "_responseActionSelectCell");
    statusSelect.addChangeListener(new AjxListener(this, this._statusSelectListener));

    this._statusMsgEl = document.getElementById(this._htmlElId + "_responseActionMsgCell");
    this._statusMsgEl.innerHTML = ptst[calItemPtst];

	// content/body
	var hasHtmlPart = (calItem.notesTopPart && calItem.notesTopPart.getContentType() == ZmMimeTable.MULTI_ALT);
	var mode = (hasHtmlPart && appCtxt.get(ZmSetting.VIEW_AS_HTML))
		? ZmMimeTable.TEXT_HTML : ZmMimeTable.TEXT_PLAIN;

	var bodyPart = calItem.getNotesPart(mode);
	if (bodyPart) {
		this._msg = this._msg || this._calItem._currentlyLoaded;
        if (mode === ZmMimeTable.TEXT_PLAIN) {
            bodyPart = AjxStringUtil.convertToHtml(bodyPart);
        }
		this._makeIframeProxy({container: el, html:bodyPart, isTextMsg:(mode == ZmMimeTable.TEXT_PLAIN)});
	}
};

ZmApptView.prototype._getSubs =
function(calItem) {
	var subject   = calItem.getName();
	var location  = calItem.location;
	var equipment = calItem.getAttendeesText(ZmCalBaseItem.EQUIPMENT, true);
	var isException = calItem._orig.isException;
	var dateStr = this._getTimeString(calItem);

	this._clearBubbles();
	var reqAttendees = this._getAttendeesByRoleCollapsed(calItem.getAttendees(ZmCalBaseItem.PERSON), ZmCalBaseItem.PERSON, ZmCalItem.ROLE_REQUIRED);
	var optAttendees = this._getAttendeesByRoleCollapsed(calItem.getAttendees(ZmCalBaseItem.PERSON), ZmCalBaseItem.PERSON, ZmCalItem.ROLE_OPTIONAL);
	var hasAttendees = reqAttendees || optAttendees;

	var organizer, obo;
	var recurStr = calItem.isRecurring() ? calItem.getRecurBlurb() : null;
	var attachStr = this._getAttachString(calItem);

	if (hasAttendees) { // I really don't know why this check here but it's the way it was before so keeping it. (I just renamed the var)
		organizer = new AjxEmailAddress(calItem.getOrganizer(), null, calItem.getOrganizerName());

		var sender = calItem.message.getAddress(AjxEmailAddress.SENDER);
		var from = calItem.message.getAddress(AjxEmailAddress.FROM);
		var address = sender || from;
		if (!organizer && address)	{
			organizer = address.toString();
		}
		if (sender && organizer) {
			obo = from ? new AjxEmailAddress(from.toString()) : organizer;
		}
	}

	organizer = organizer && this._getBubbleHtml(organizer);
	obo = obo && this._getBubbleHtml(obo);

	return {
		id:             this._htmlElId,
		subject:        subject,
		location:       location,
		equipment:      equipment,
		isException:    isException,
		dateStr:        dateStr,
        isAttendees:    hasAttendees,
        reqAttendees:   reqAttendees,
		optAttendees:   optAttendees,
		org:            organizer,
		obo:            obo,
		recurStr:       recurStr,
		attachStr:      attachStr,
		folder:         appCtxt.getTree(ZmOrganizer.CALENDAR).getById(calItem.folderId),
		folderLabel:    ZmMsg.calendar,
		reminderLabel:  ZmMsg.reminder,
		alarm:          calItem.alarm,
		isAppt:         true,
        _infoBarId:     this._infoBarId
	};
};

/**
 * Creates a string of attendees by role. If an item doesn't have a name, its address is used.
 *
 * calls common code from mail msg view to get the collapse/expand "show more" funcitonality for large lists.
 *
 * @param list					[array]			list of attendees (ZmContact or ZmResource)
 * @param type					[constant]		attendee type
 * @param role      		        [constant]      attendee role
 */
ZmApptView.prototype._getAttendeesByRoleCollapsed = function(list, type, role) {

	if (!(list && list.length)) {
		return "";
	}
	var attendees = ZmApptViewHelper.getAttendeesArrayByRole(list, role);

	var emails = [];
	for (var i = 0; i < attendees.length; i++) {
		var att = attendees[i];
		emails.push(new AjxEmailAddress(att.getEmail(), type, att.getFullName(), att.getFullName(), att.isGroup(), att.canExpand));
	}

	var options = {};
	options.shortAddress = appCtxt.get(ZmSetting.SHORT_ADDRESS);
	var addressInfo = this.getAddressesFieldHtmlHelper(emails, options, role);
	return addressInfo.html;
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
	this._calItem = this._item = appt;
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

ZmApptView.prototype.close =
function() {
    this._controller._closeView();
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
