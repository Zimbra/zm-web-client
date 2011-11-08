/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
 * Creates a new appointment controller to manage appointment creation/editing.
 * @constructor
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtShell}	container	the containing shell
 * @param {ZmApp}		app			the containing app
 * @param {constant}	type		controller type
 * @param {string}		sessionId	the session id
 * 
 * @extends		ZmCalItemComposeController
 */
ZmApptComposeController = function(container, app, type, sessionId) {

	ZmCalItemComposeController.apply(this, arguments);

	this._addedAttendees = [];
	this._removedAttendees = [];
	this._kbMgr = appCtxt.getKeyboardMgr();

	appCtxt.getSettings().getSetting(ZmSetting.USE_ADDR_BUBBLES).addChangeListener(new AjxListener(this, this._handleSettingChange));
};

ZmApptComposeController.prototype = new ZmCalItemComposeController;
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.isZmApptComposeController = true;
ZmApptComposeController.prototype.toString = function() { return "ZmApptComposeController"; };

ZmApptComposeController._VALUE = "value";

// Public methods

ZmApptComposeController.getDefaultViewType =
function() {
	return ZmId.VIEW_APPOINTMENT;
};
ZmApptComposeController.prototype.getDefaultViewType = ZmApptComposeController.getDefaultViewType;

ZmApptComposeController.prototype.show =
function(calItem, mode, isDirty) {
	ZmCalItemComposeController.prototype.show.call(this, calItem, mode, isDirty);

	this._addedAttendees.length = this._removedAttendees.length = 0;
	this._setComposeTabGroup();
};

/**
 * Forwards the calendar item.
 * 
 * @param	{ZmAppt}	appt		the appointment
 * @return	{Boolean}	<code>true</code> indicates the forward is executed
 */
ZmApptComposeController.prototype.forwardCalItem =
function(appt, forwardCallback) {
	// todo: to address input validation
	var callback = new AjxCallback(this, this._handleForwardInvite, forwardCallback);
	appt.forward(callback);
	return true;
};

/**
 * Propose new time for an appointment
 *
 * @param	{ZmAppt}	    appt		            the appointment
 * @param	{AjxCallback}	proposeTimeCallback		callback executed  after proposing time
 * @return	{Boolean}	    <code>true</code>       indicates that propose time is executed
 */
ZmApptComposeController.prototype.sendCounterAppointmentRequest =
function(appt, proposeTimeCallback) {
	var callback = new AjxCallback(this, this._handleCounterAppointmentRequest, proposeTimeCallback);
	appt.sendCounterAppointmentRequest(callback);
	return true;
};

ZmApptComposeController.prototype._handleCounterAppointmentRequest =
function(proposeTimeCallback) {
	appCtxt.setStatusMsg(ZmMsg.newTimeProposed);
	if (proposeTimeCallback instanceof AjxCallback) {
		proposeTimeCallback.run();
	}
};

ZmApptComposeController.prototype._handleForwardInvite =
function(forwardCallback) {
	appCtxt.setStatusMsg(ZmMsg.forwardInviteSent);
	if (forwardCallback instanceof AjxCallback) {
		forwardCallback.run();
	}
};

ZmApptComposeController.prototype._badAddrsOkCallback =
function(dialog, appt) {
	dialog.popdown();
	this.forwardCalItem(appt, new AjxCallback(this, this._apptForwardCallback));
};

ZmApptComposeController.prototype._apptForwardCallback =
function() {
	this.closeView();
};

ZmApptComposeController.prototype._checkIsDirty =
function(type, attribs){
    return this._composeView.checkIsDirty(type, attribs)
};

ZmApptComposeController.prototype._getChangesDialog =
function(){
    var id,
        dlg,
        isOrganizer = this._composeView.isOrganizer();
    if(isOrganizer) {
        dlg = this._changesDialog;
        if (!dlg) {
           dlg = this._changesDialog = new DwtDialog({parent:appCtxt.getShell()});
           id = this._changesDialogId = Dwt.getNextId();
           dlg.setContent(AjxTemplate.expand("calendar.Appointment#ChangesDialogOrganizer", {id: id}));
           dlg.setTitle(ZmMsg.apptSave);
           dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._changesDialogListener, id));
        }
    }
    else {
        dlg = this._attendeeChangesDialog;
        if (!dlg) {
            dlg = this._attendeeChangesDialog = new DwtDialog({parent:appCtxt.getShell()});
            id = this._attendeeChangesDialogId = Dwt.getNextId();
            dlg.setContent(AjxTemplate.expand("calendar.Appointment#ChangesDialogAttendee", {id: id}));
            dlg.setTitle(ZmMsg.apptSave);
            dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._attendeeChangesDialogListener, id));
        }
    }
    return dlg;
};

ZmApptComposeController.prototype._changesDialogListener =
function(id){

    var sendAppt = document.getElementById(id+"_send");
    var discardAppt = document.getElementById(id+"_discard");
    this.clearInvalidAttendees();
    delete this._invalidAttendees;
    if (sendAppt.checked) {
        this._sendListener();
    } else if (discardAppt.checked) {
        this.closeView();
    }
    this._changesDialog.popdown();
};

ZmApptComposeController.prototype._attendeeChangesDialogListener =
function(id){
    this.clearInvalidAttendees();
    delete this._invalidAttendees;
    this.closeView();
    this._attendeeChangesDialog.popdown();
};

ZmApptComposeController.prototype.saveCalItem =
function(attId) {
	var appt = this._composeView.getAppt(attId);


    if(!appt.isValidDuration()){
        this._composeView.showInvalidDurationMsg();
        this.enableToolbar(true);
        return false;
    }

	if (appt) {

        if (appCtxt.get(ZmSetting.GROUP_CALENDAR_ENABLED)) {
            if (this._requestResponses)
            	appt.setRsvp(this._requestResponses.getChecked());
            appt.setMailNotificationOption(true);
        }

        if(appt.isProposeTime && !appt.isOrganizer()) {
            return this.sendCounterAppointmentRequest(appt);
        }

		if (appt.isForward) {
			var addrs = this._composeView.getForwardAddress();

			// validate empty forward address
			if (!addrs.gotAddress) {
				var msgDialog = appCtxt.getMsgDialog();
				msgDialog.setMessage(ZmMsg.noForwardAddresses, DwtMessageDialog.CRITICAL_STYLE);
				msgDialog.popup();
                this.enableToolbar(true);
				return false;
			}

			if (addrs[ZmApptEditView.BAD] && addrs[ZmApptEditView.BAD].size()) {
				var cd = appCtxt.getOkCancelMsgDialog();
				cd.reset();
				var bad = AjxStringUtil.htmlEncode(addrs[ZmApptEditView.BAD].toString(AjxEmailAddress.SEPARATOR));
				var msg = AjxMessageFormat.format(ZmMsg.compBadAddresses, bad);
				cd.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
				cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this, [cd,appt]);
				cd.setVisible(true); // per fix for bug 3209
				cd.popup();
                this.enableToolbar(true);
				return false;
			}

            //attendee forwarding an appt
            if(!appt.isOrganizer()) return this.forwardCalItem(appt);
		}

		if (!this._attendeeValidated && this._invalidAttendees && this._invalidAttendees.length > 0) {
			var dlg = appCtxt.getYesNoMsgDialog();
			dlg.registerCallback(DwtDialog.YES_BUTTON, this._clearInvalidAttendeesCallback, this, [appt, attId, dlg]);
			var msg = "";
            if(this._action == ZmCalItemComposeController.SAVE){
               msg = AjxMessageFormat.format(ZmMsg.compSaveBadAttendees, AjxStringUtil.htmlEncode(this._invalidAttendees.join(",")));
            }
            else{
                msg = AjxMessageFormat.format(ZmMsg.compBadAttendees, AjxStringUtil.htmlEncode(this._invalidAttendees.join(",")));
            }
			dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
			dlg.popup();
            this.enableToolbar(true);
            this._attendeeValidated = true;
			return false;
		}

        //Validation Check for Significant / Insignificant / Local changes
        if(this._action == ZmCalItemComposeController.SAVE && !appt.inviteNeverSent){
            //Check for Significant Changes
            if(this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)){
                this._getChangesDialog().popup();
                this.enableToolbar(true);
                return false;
            }
        }

		var origAttendees = appt.origAttendees;						// bug fix #4160
		if (origAttendees && origAttendees.length > 0 && 			// make sure we're not u/l'ing a file
			attId == null) 											// make sure we are editing an existing appt w/ attendees
		{
			if (!appt.inviteNeverSent && !this._composeView.getApptEditView().isDirty(true)) {	// make sure other fields (besides attendees field) have not changed
				var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
				if (attendees.length > 0) {
					// check whether organizer has added/removed any attendees
					if (this._action == ZmCalItemComposeController.SEND && this._attendeesUpdated(appt, attId, attendees, origAttendees))
						return false;
				}
			}

			// check whether moving appt from local to remote folder with attendees
			var cc = AjxDispatcher.run("GetCalController");
			if (cc.isMovingBetwAccounts(appt, appt.__newFolderId)) {
				var dlg = appCtxt.getYesNoMsgDialog();
				dlg.registerCallback(DwtDialog.YES_BUTTON, this._changeOrgCallback, this, [appt, attId, dlg]);
				var newFolder = appCtxt.getById(appt.__newFolderId);
				var newOrg = newFolder ? newFolder.getOwner() : null;
				if (newOrg) {
					var msg = AjxMessageFormat.format(ZmMsg.orgChange, newOrg);
					dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
					dlg.popup();
                    this.enableToolbar(true);
					return false;
				}
			}
		}

		var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
		var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
		var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

        var notifyList;

		var needsPermissionCheck = (attendees && attendees.length > 0) ||
								   (resources && resources.length > 0) ||
								   (locations && locations.length > 0);

		var needsConflictCheck = !appt.isForward &&
                                 ((resources && resources.length > 0) ||
								 (locations && locations.length > 0));

		if (needsConflictCheck) {
			this.checkConflicts(appt, attId, notifyList);
			return false;
		} else if (needsPermissionCheck) {
			this.checkAttendeePermissions(appt, attId, notifyList);
			return false;
		} else {
			this._saveCalItemFoRealz(appt, attId, notifyList);
		}
		return true;
	}

	return false;
};

ZmApptComposeController.prototype.updateToolbarOps =
function(mode, appt) {

    if (!this._requestResponses) return;

    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);

    if(mode == ZmCalItemComposeController.APPT_MODE) {
        saveButton.setText(ZmMsg.saveClose);
        saveButton.setVisible(true);
        sendButton.setVisible(false);

        this._requestResponses.setEnabled(false);
    }else {
        sendButton.setVisible(true);
        saveButton.setVisible(true);
        saveButton.setText(ZmMsg.save);

        //change cancel button's text/icon to close
        var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
        cancelButton.setText(ZmMsg.close);

        this._requestResponses.setEnabled(true);
    }

    if((this._mode == ZmCalItem.MODE_PROPOSE_TIME) || ZmCalItem.FORWARD_MAPPING[this._mode]) {
        sendButton.setVisible(true);
        saveButton.setVisible(false);

        this._requestResponses.setEnabled(false);
        this.setRequestResponses(false);
    }

};

ZmApptComposeController.prototype._initToolbar =
function(mode) {

    ZmCalItemComposeController.prototype._initToolbar.call(this, mode);

    //use send button for forward appt view
    //Switch Save Btn label n listeners 
    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    saveButton.removeSelectionListeners();
    if(ZmCalItem.FORWARD_MAPPING[mode]) {
        saveButton.addSelectionListener(new AjxListener(this, this._sendBtnListener));
    }else {
        saveButton.addSelectionListener(new AjxListener(this, this._saveBtnListener));
    }

    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);
    sendButton.removeSelectionListeners();
    sendButton.addSelectionListener(new AjxListener(this, this._sendBtnListener));

    var btn = this._toolbar.getButton(ZmOperation.ATTACHMENT);
    if(btn)
        btn.setEnabled(!(this._mode == ZmCalItem.MODE_PROPOSE_TIME || ZmCalItem.FORWARD_MAPPING[mode]));
};

ZmApptComposeController.prototype._sendListener =
function(ev){

     var appt = this._composeView.getApptEditView()._calItem;

     if(!appt.inviteNeverSent){
        this._sendAfterExceptionCheck();
     }
     else{this._sendContinue();}

     return true;
};

ZmApptComposeController.prototype._sendAfterExceptionCheck =
function(){
     var appt = this._composeView.getApptEditView()._calItem;
     var isExceptionAllowed = appCtxt.get(ZmSetting.CAL_EXCEPTION_ON_SERIES_TIME_CHANGE);
     var isEditingSeries = (this._mode == ZmCalItem.MODE_EDIT_SERIES);
     var showWarning = appt.isRecurring() && appt.hasEx && isEditingSeries && appt.getAttendees(ZmCalBaseItem.PERSON) && !isExceptionAllowed && this._checkIsDirty(ZmApptEditView.CHANGES_TIME_RECURRENCE);
     if(showWarning){
          var dialog = appCtxt.getYesNoCancelMsgDialog();
		  dialog.setMessage(ZmMsg.recurrenceUpdateWarning, DwtMessageDialog.WARNING_STYLE);
          dialog.registerCallback(DwtDialog.YES_BUTTON, this._sendContinue, this,[dialog]);
          dialog.registerCallback(DwtDialog.NO_BUTTON, this._dontSend,this,[dialog]);
          dialog.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.discard);
		  dialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._dontSendAndClose,this,[dialog]);
		  dialog.popup();
    }
    else{
            this._sendContinue();
    }
}

ZmApptComposeController.prototype._dontSend =
function(dialog){
    this._revertWarningDialog(dialog);
}

ZmApptComposeController.prototype._dontSendAndClose =
function(dialog){
this._revertWarningDialog(dialog);
this.closeView();
}

ZmApptComposeController.prototype._revertWarningDialog =
function(dialog){
    if(dialog){
        dialog.popdown();
        dialog.getButton(DwtDialog.CANCEL_BUTTON).setText(ZmMsg.cancel);
    }
}

ZmApptComposeController.prototype._sendContinue =
function(dialog){
    this._revertWarningDialog(dialog);
    this._action = ZmCalItemComposeController.SEND;
    this.enableToolbar(false);
	if (this._doSave() === false) {
		return;
    }
	this.closeView();
}

ZmApptComposeController.prototype.isSave =
function(){
    return (this._action == ZmCalItemComposeController.SAVE); 
};

ZmApptComposeController.prototype._saveBtnListener =
function(ev) {
    delete this._attendeeValidated;
    return this._saveListener(ev, true);
};

ZmApptComposeController.prototype._sendBtnListener =
function(ev) {
    delete this._attendeeValidated;
    return this._sendListener(ev);
};

ZmApptComposeController.prototype._saveListener =
function(ev, force) {
    var isMeeting = !this._composeView.isAttendeesEmpty();

    this._action = isMeeting ? ZmCalItemComposeController.SAVE : ZmCalItemComposeController.SAVE_CLOSE;

    //attendee should not have send/save option
    if(!this._composeView.isOrganizer()) {
        this._action = ZmCalItemComposeController.SAVE_CLOSE;
    }
    this.enableToolbar(false);

    var dlg = appCtxt.getOkCancelMsgDialog();
    if(dlg.isPoppedUp()){
        dlg.popdown();
    }

    if(!force && this._action == ZmCalItemComposeController.SAVE){
        var appt = this._composeView.getApptEditView()._calItem;
        var inviteNeverSent = (appt && appt.inviteNeverSent);
        var showDlg = true;
        if(appt.isDraft){
            showDlg = false;
        }
        if(showDlg && !inviteNeverSent && (this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)
                ||  this._checkIsDirty(ZmApptEditView.CHANGES_LOCAL))){
            showDlg = false;
        }
        if(showDlg){
            dlg.setMessage(ZmMsg.saveApptInfoMsg);
            dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._saveListener, [ev, true]));
            dlg.popup();
            this.enableToolbar(true);
            return;
        }
    }

	if (this._doSave() === false) {
		return;
    }
};

ZmApptComposeController.prototype._createToolBar =
function() {

    ZmCalItemComposeController.prototype._createToolBar.call(this);

	var optionsButton = this._toolbar.getButton(ZmOperation.COMPOSE_OPTIONS);
	if (optionsButton){
	optionsButton.setVisible(true); //might be invisible if not ZmSetting.HTML_COMPOSE_ENABLED (see ZmCalItemComposeController._createToolBar)

	var m = optionsButton.getMenu();

	var sepMi = new DwtMenuItem({parent:m, style:DwtMenuItem.SEPARATOR_STYLE});
    var mi = this._requestResponses = new DwtMenuItem({parent:m, style:DwtMenuItem.CHECK_STYLE});
    mi.setText(ZmMsg.requestResponses);
    mi.setChecked(true, true);
    }

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

ZmApptComposeController.prototype.setRequestResponses =
function(requestResponses) {
   if (this._requestResponses)
   this._requestResponses.setChecked(requestResponses);
};

ZmApptComposeController.prototype.getRequestResponses =
function() {
   if (this._requestResponses)
   return this._requestResponses.getEnabled() ? this._requestResponses.getChecked() : true;
};

ZmApptComposeController.prototype.getNotifyList =
function(addrs) {
    var notifyList = [];
    for(var i in addrs) {
        notifyList.push(addrs[i]._inviteAddress || addrs[i].address || addrs[i].getEmail());
    }

    return notifyList;
}; 

ZmApptComposeController.prototype.isAttendeesEmpty =
function(appt) {
    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

	var isAttendeesNotEmpty = (attendees && attendees.length > 0) ||
							   (resources && resources.length > 0) ||
							   (locations && locations.length > 0);
    return !isAttendeesNotEmpty
};

ZmApptComposeController.prototype.checkConflicts =
function(appt, attId, notifyList) {
	var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

	var needsPermissionCheck = (attendees && attendees.length > 0) ||
							   (resources && resources.length > 0) ||
							   (locations && locations.length > 0);

	var callback = needsPermissionCheck
		? (new AjxCallback(this, this.checkAttendeePermissions, [appt, attId, notifyList]))
		: (new AjxCallback(this, this.saveCalItemContinue, [appt, attId, notifyList]));

	this._checkResourceConflicts(appt, callback);
};

ZmApptComposeController.prototype.checkAttendeePermissions =
function(appt, attId, notifyList) {
	var newEmails = [];

	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
	if (attendees && attendees.length > 0) {
		for (var i = 0; i < attendees.length; i++) {
			newEmails.push(attendees[i].getEmail());
		}
	}

	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	if (locations && locations.length > 0) {
		for (var i = 0; i < locations.length; i++) {
			newEmails.push(locations[i].getEmail());
		}
	}

	var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	if (resources && resources.length > 0) {
		for (var i = 0; i < resources.length; i++) {
			newEmails.push(resources[i].getEmail());
		}
	}

	if (newEmails.length) {
		this.checkPermissionRequest(newEmails, appt, attId, notifyList);
		return false;
	}

	// otherwise, just save the appointment
	this._saveCalItemFoRealz(appt, attId, notifyList);
};

ZmApptComposeController.prototype.checkResourceConflicts =
function(callback) {
	this._conflictCallback = callback;
	this._checkResourceConflicts(this._composeView.getAppt());
};

ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, callback) {
	var mode = appt.viewMode;

	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		if(appt.isRecurring() && mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			// for recurring appt - user GetRecurRequest to get full recurrence
			// information and use the component in CheckRecurConflictRequest
			var recurInfoCallback = new AjxCallback(this, this._checkResourceConflictsSoap, [appt, callback]);
			this.getRecurInfo(appt, recurInfoCallback);
		} else {
			this._checkResourceConflictsSoap(appt, callback);
		}
	} else {
		this._checkResourceConflictsSoap(appt, callback);
	}
};

/**
 * JSON request is used to make easy re-use of "comp" elements from GetRecurResponse.
 * 
 * @private
 */
ZmApptComposeController.prototype._checkResourceConflictsJSON =
function(appt, callback, recurInfo) {
	var mode = appt.viewMode;
	var jsonObj = {CheckRecurConflictsRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.CheckRecurConflictsRequest;
	var today = new Date();
	today.setHours(0,0,0,0);
	request.s = today.getTime();
	request.e = today.getTime() + (AjxDateUtil.MSEC_PER_DAY*365);

	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		request.excludeUid = appt.uid;
	}

	request.comp = recurInfo.comp || [];
	request.except = recurInfo.except;
	request.tz = recurInfo.tz;

	appt.addAttendeesToChckConflictsJSONRequest(request);

	return appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResourceConflict, [appt, callback])),
		errorCallback: (new AjxCallback(this, this._handleResourceConflictError, [appt, callback])),
		noBusyOverlay: true
	});
};

ZmApptComposeController.prototype.setExceptFromRecurInfo =
function(soapDoc, recurInfo) {
	var exceptInfo = recurInfo && recurInfo.except;
	if (!exceptInfo) { return; }

	for (var i in exceptInfo) {
		var s = exceptInfo[i].s ? exceptInfo[i].s[0] : null;
		var e = exceptInfo[i].e ? exceptInfo[i].e[0] : null;
		var exceptId = exceptInfo[i].exceptId ? exceptInfo[i].exceptId[0] : null;

		var except = soapDoc.set("except", null, soapDoc.getMethod());
		if (s) {
			var sNode = soapDoc.set("s", null, except);
			sNode.setAttribute("d", s.d);
			if (s.tz) {
				sNode.setAttribute("tz", s.tz);
			}
		}

		if (e) {
			var eNode = soapDoc.set("e", null, except);
			eNode.setAttribute("d", e.d);
			if (e.tz) {
				eNode.setAttribute("tz", e.tz);
			}
		}

		if (exceptId) {
			var exceptIdNode = soapDoc.set("exceptId", null, except);
			exceptIdNode.setAttribute("d", exceptId.d);
			if (exceptId.tz) {
				exceptIdNode.setAttribute("tz", exceptId.tz);
			}
		}
	}
};

/**
 * Soap Request is used when "comp" has to be generated from appt.
 * 
 * @private
 */
ZmApptComposeController.prototype._checkResourceConflictsSoap =
function(appt, callback, recurInfo) {
	var mode = appt.viewMode;
	var soapDoc = AjxSoapDoc.create("CheckRecurConflictsRequest", "urn:zimbraMail");

	var today = new Date();
	today.setHours(0,0,0,0);

	soapDoc.setMethodAttribute("s", today.getTime());
	soapDoc.setMethodAttribute("e", today.getTime() + (AjxDateUtil.MSEC_PER_DAY*365));

	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		soapDoc.setMethodAttribute("excludeUid", appt.uid);
	}

	var comp = soapDoc.set("comp", null, soapDoc.getMethod());

	appt._addDateTimeToSoap(soapDoc, soapDoc.getMethod(), comp);

    //preserve the EXDATE (exclude recur) information
    if(recurInfo) {
        var recurrence = appt.getRecurrence();
        var recur = (recurInfo && recurInfo.comp) ? recurInfo.comp[0].recur : null;
        recurrence.parseExcludeInfo(recur);
    }

	if(mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) appt._recurrence.setSoap(soapDoc, comp);

	this.setExceptFromRecurInfo(soapDoc, recurInfo);

	appt.addAttendeesToChckConflictsRequest(soapDoc, soapDoc.getMethod());

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResourceConflict, [appt, callback])),
		errorCallback: (new AjxCallback(this, this._handleResourceConflictError, [appt, callback])),
		noBusyOverlay: true
	});
};

/**
 * Gets the recurrence definition of an appointment.
 * 
 * @param {ZmAppt}	appt 	the appointment
 * @param {AjxCallback}	recurInfoCallback 		the callback module after getting recurrence info
 */
ZmApptComposeController.prototype.getRecurInfo =
function(appt, recurInfoCallback) {
	var soapDoc = AjxSoapDoc.create("GetRecurRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("id", appt.id);

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleRecurInfo, [appt, recurInfoCallback])),
		errorCallback: (new AjxCallback(this, this._handleRecurInfoError, [appt, recurInfoCallback])),
		noBusyOverlay: true
	});
};

/**
 * Handle Response for GetRecurRequest call
 * 
 * @private
 */
ZmApptComposeController.prototype._handleRecurInfo =
function(appt, callback, result) {
	var recurResponse = result.getResponse().GetRecurResponse;
	if (callback) {
		callback.run(recurResponse);
	}
};

ZmApptComposeController.prototype._handleRecurInfoError =
function(appt, callback, result) {
	if (callback) {
		callback.run();
	}
};

ZmApptComposeController.prototype.checkPermissionRequest =
function(names, appt, attId, notifyList) {
	var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
	var request = jsonObj.BatchRequest;

	var chkPermRequest = request.CheckPermissionRequest = [];

	for (var i in names) {
		var permRequest = {_jsns:"urn:zimbraMail"};
		permRequest.target = {
			type: "account",
			by: "name",
			_content: names[i]
		};

		    permRequest.right = {_content: "invite"};

		chkPermRequest.push(permRequest);
	}

	var respCallback = new AjxCallback(this, this.handleCheckPermissionResponse, [appt, attId, names, notifyList]);
	var errorCallback = new AjxCallback(this, this.handleCheckPermissionResponseError, [appt, attId, names, notifyList]);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, errorCallback: errorCallback, noBusyOverlay:true});
};

ZmApptComposeController.prototype.handleCheckPermissionResponse =
function(appt, attId, names, notifyList, response) {
	var batchResp = response && response._data && response._data.BatchResponse;
	var checkPermissionResp = (batchResp && batchResp.CheckPermissionResponse) ? batchResp.CheckPermissionResponse  : null;
	if (checkPermissionResp) {
		var deniedAttendees = [];
		for (var i in checkPermissionResp) {
			if (checkPermissionResp && !checkPermissionResp[i].allow) {
				deniedAttendees.push(names[i]);
			}
		}
		if (deniedAttendees.length > 0) {
			var msg =  AjxMessageFormat.format(ZmMsg.invitePermissionDenied, [deniedAttendees.join(",")]);
			var msgDialog = appCtxt.getMsgDialog();
			msgDialog.reset();
			msgDialog.setMessage(msg, DwtMessageDialog.INFO_STYLE);
			msgDialog.popup();
            this.enableToolbar(true);
			return;
		}
	}
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype._saveAfterPermissionCheck =
function(appt, attId, notifyList, msgDialog) {
	msgDialog.popdown();
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype.saveCalItemContinue =
function(appt, attId, notifyList) {
	this._saveCalItemFoRealz(appt, attId, notifyList);
};

ZmApptComposeController.prototype.handleCheckPermissionResponseError =
function(appt, attId, names, notifyList, response) {
	var resp = response && response._data && response._data.BatchResponse;
	this.saveCalItemContinue(appt, attId, notifyList);
};

ZmApptComposeController.prototype._handleResourceConflict =
function(appt, callback, result) {
	var conflictExist = false;
	if (result) {
		var conflictResponse = result.getResponse().CheckRecurConflictsResponse;
		var inst = this._conflictingInstances = conflictResponse.inst;
		if (inst && inst.length > 0) {
			if(this._conflictCallback) this._conflictCallback.run(inst);
			this.showConflictDialog(appt, callback, inst);
			conflictExist = true;
            this.enableToolbar(true);
		}
	}

	if (!conflictExist && callback) {
		callback.run();
	}
};

ZmApptComposeController.prototype.showConflictDialog =
function(appt, callback, inst) {
	DBG.println("conflict instances :" + inst.length);

	var conflictDialog = this.getConflictDialog();
	conflictDialog.initialize(inst, appt, callback);
	conflictDialog.popup();
};

ZmApptComposeController.prototype.getConflictDialog =
function() {
	if (!this._resConflictDialog) {
		this._resConflictDialog = new ZmResourceConflictDialog(this._shell);
	}
	return this._resConflictDialog;
};

ZmApptComposeController.prototype._handleResourceConflictError =
function(appt, callback) {
	// continue with normal saving process via callback
	if (callback) {
		callback.run();
	}
};

ZmApptComposeController.prototype.getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	var acct = (appCtxt.multiAccounts)
		? this._composeView.getApptEditView().getCalendarAccount() : null;

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

ZmApptComposeController.prototype._createComposeView =
function() {
	return (new ZmApptComposeView(this._container, null, this._app, this));
};

ZmApptComposeController.prototype._createScheduler =
function(apptEditView) {
	return (new ZmScheduleAssistantView(this._container, this, apptEditView));
};

ZmApptComposeController.prototype._setComposeTabGroup =
function(setFocus) {
	DBG.println(AjxDebug.DBG2, "_setComposeTabGroup");
	var tg = this._createTabGroup();
	var rootTg = appCtxt.getRootTabGroup();
	tg.newParent(rootTg);
	tg.addMember(this._toolbar);
	var editView = this._composeView.getApptEditView();
	editView._addTabGroupMembers(tg);

	var focusItem = editView._savedFocusMember || editView._getDefaultFocusItem() || tg.getFirstMember(true);
	var ta = new AjxTimedAction(this, this._setFocus, [focusItem, !setFocus]);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype._getDefaultFocusItem =
function() {
    return this._composeView.getApptEditView()._getDefaultFocusItem();	
};

ZmApptComposeController.prototype.getKeyMapName =
function() {
	return "ZmApptComposeController";
};


// Private / Protected methods

ZmApptComposeController.prototype._attendeesUpdated =
function(appt, attId, attendees, origAttendees) {
	// create hashes of emails for comparison
	var origEmails = {};
	for (var i = 0; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		origEmails[email] = true;
	}
	var fwdEmails = {};
	var fwdAddrs = appt.getForwardAddress();
	for(var i=0;i<fwdAddrs.length;i++) {
		var email = fwdAddrs[i].getAddress();
		fwdEmails[email] = true;
	}
	var curEmails = {};
	for (var i = 0; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		curEmails[email] = true;
	}

	// walk the current list of attendees and check if there any new ones
	for (var i = 0 ; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		if (!origEmails[email] && !fwdEmails[email]) {
			this._addedAttendees.push(email);
		}
	}
    
	for (var i = 0 ; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		if (!curEmails[email]) {
			this._removedAttendees.push(email);
		}
	}

	if (this._addedAttendees.length > 0 || this._removedAttendees.length > 0) {
		if (!this._notifyDialog) {
			this._notifyDialog = new ZmApptNotifyDialog(this._shell);
			this._notifyDialog.addSelectionListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._notifyDlgOkListener));
			this._notifyDialog.addSelectionListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._notifyDlgCancelListener));
		}
		appt.setMailNotificationOption(true);
		this._notifyDialog.initialize(appt, attId, this._addedAttendees, this._removedAttendees);
		this._notifyDialog.popup();
        this.enableToolbar(true);
		return true;
	}

	return false;
};


// Listeners

// Cancel button was pressed
ZmApptComposeController.prototype._cancelListener =
function(ev) {

    var isDirty = false;

    if(this._composeView.gotNewAttachments()) {
        isDirty = true;
    }else {
        var appt = this._composeView.getAppt(this._attId);
        if (appt && !appt.inviteNeverSent){
           //Check for Significant Changes
            isDirty = this._checkIsDirty(ZmApptEditView.CHANGES_SIGNIFICANT)
        }
    }

    if(isDirty){
        this._getChangesDialog().popup();
        this.enableToolbar(true);
        return;
    }

	this._app.getCalController().setNeedsRefresh(true);

	ZmCalItemComposeController.prototype._cancelListener.call(this, ev);
};

ZmApptComposeController.prototype._printListener =
function() {
	var calItem = this._composeView._apptEditView._calItem;
	var url = ["/h/printappointments?id=", calItem.invId, "&tz=", AjxTimezone.getServerId(AjxTimezone.DEFAULT)]; //bug:53493
    if (appCtxt.isOffline) {
        url.push("&zd=true", "&acct=", this._composeView.getApptEditView().getCalendarAccount().name);
    }
	window.open(appContextPath + url.join(""), "_blank");
};


// Callbacks

ZmApptComposeController.prototype._notifyDlgOkListener =
function(ev) {
	var notifyList = this._notifyDialog.notifyNew() ? this._addedAttendees : null;
	this._saveCalItemFoRealz(this._notifyDialog.getAppt(), this._notifyDialog.getAttId(), notifyList);
};

ZmApptComposeController.prototype._notifyDlgCancelListener =
function(ev) {
	this._addedAttendees.length = this._removedAttendees.length = 0;
};

ZmApptComposeController.prototype._changeOrgCallback =
function(appt, attId, dlg) {
	dlg.popdown();
	this._saveCalItemFoRealz(appt, attId);
};

ZmApptComposeController.prototype._saveCalItemFoRealz =
function(calItem, attId, notifyList, force){
    force = force || ( this._action == ZmCalItemComposeController.SEND );

    //organizer forwarding an appt is same as organizer editing appt while adding new attendees
    if(calItem.isForward) {
        notifyList = this.getForwardNotifyList(calItem);
    }

    ZmCalItemComposeController.prototype._saveCalItemFoRealz.call(this, calItem, attId, notifyList, force);    
};

/**
 * To get the array of forward email addresses
 *
 * @param	{ZmAppt}	appt		the appointment
 * @return	{Array}	an array of email addresses
 */
ZmApptComposeController.prototype.getForwardNotifyList =
function(calItem){
    var fwdAddrs = calItem.getForwardAddress();
    var notifyList = [];
    for(var i=0;i<fwdAddrs.length;i++) {
        var email = fwdAddrs[i].getAddress();
        notifyList.push(email);
    }
    return notifyList;
};

ZmApptComposeController.prototype._doSaveCalItem =
function(appt, attId, callback, errorCallback, notifyList){
    delete this._attendeeValidated;
    if(this._action == ZmCalItemComposeController.SEND){
        appt.send(attId, callback, errorCallback, notifyList);
    }else{
        var isMeeting = appt.hasAttendees();
        if(isMeeting){
            this._draftFlag = appt.isDraft || appt.inviteNeverSent || this._checkIsDirty(ZmApptEditView.CHANGES_INSIGNIFICANT);
        }else{
            this._draftFlag = false;
        }
        appt.save(attId, callback, errorCallback, notifyList, this._draftFlag);
    }
};

ZmApptComposeController.prototype._handleResponseSave =
function(calItem, result) {
	if (calItem.__newFolderId) {
		var folder = appCtxt.getById(calItem.__newFolderId);
		calItem.__newFolderId = null;
		this._app.getListController()._doMove(calItem, folder, null, false);
	}

    var isNewAppt;
    var viewMode = calItem.getViewMode();
    if(viewMode == ZmCalItem.MODE_NEW || viewMode == ZmCalItem.MODE_NEW_FROM_QUICKADD || viewMode == ZmAppt.MODE_DRAG_OR_SASH) {
        isNewAppt = true;
    }

    if(this.isCloseAction()) {
        calItem.handlePostSaveCallbacks();
        this.closeView();	    
    }else {
        this.enableToolbar(true);
        if(isNewAppt) {
            viewMode = calItem.isRecurring() ? ZmCalItem.MODE_EDIT_SERIES : ZmCalItem.MODE_EDIT;
        }
        calItem.setFromSavedResponse(result);
        if(this._action == ZmCalItemComposeController.SAVE){
            calItem.isDraft = this._draftFlag;
            calItem.draftUpdated = true;
        }
        this._composeView.set(calItem, viewMode);        
    }

    var msg = isNewAppt ? ZmMsg.apptCreated : ZmMsg.apptSaved;
    if(calItem.hasAttendees()){
        if(this._action == ZmCalItemComposeController.SAVE || this._action == ZmCalItemComposeController.SAVE_CLOSE){
            msg = ZmMsg.apptSaved;
        }else{
            if(viewMode != ZmCalItem.MODE_NEW){
                msg = ZmMsg.apptSent;
            }
        }              
    }
    appCtxt.setStatusMsg(msg);
    
    appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
};

ZmApptComposeController.prototype._resetNavToolBarButtons =
function(view) {
	//do nothing
};

ZmApptComposeController.prototype._clearInvalidAttendeesCallback =
function(appt, attId, dlg) {
	dlg.popdown();
    this.clearInvalidAttendees();
	delete this._invalidAttendees;
    if(this._action == ZmCalItemComposeController.SAVE){
	    this._saveListener();
    }else{
        this._sendListener();
    }
};

ZmApptComposeController.prototype.clearInvalidAttendees =
function() {
	this._invalidAttendees = [];
};

ZmApptComposeController.prototype.addInvalidAttendee =
function(item) {
	if (AjxUtil.indexOf(this._invalidAttendees, item)==-1) {
		this._invalidAttendees.push(item);
	}
};

ZmApptComposeController.prototype.closeView =
function() {
	this._closeView();
};

ZmApptComposeController.prototype.forwardInvite =
function(newAppt) {
	this.show(newAppt, ZmCalItem.MODE_FORWARD_INVITE);
};

ZmApptComposeController.prototype.proposeNewTime =
function(newAppt) {
	this.show(newAppt, ZmCalItem.MODE_PROPOSE_TIME);
};

ZmApptComposeController.prototype.initComposeView =
function(initHide) {
    
	if (!this._composeView || this._needComposeViewRefresh) {
		this._composeView = this._createComposeView();
        var appEditView = this._composeView.getApptEditView();
        this._smartScheduler = this._createScheduler(appEditView);
        appEditView.setScheduleAssistant(this._smartScheduler);
        this._savedFocusMember = appEditView._getDefaultFocusItem();

		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_PRE_HIDE] = new AjxCallback(this, this._preHideCallback);
		callbacks[ZmAppViewMgr.CB_PRE_UNLOAD] = new AjxCallback(this, this._preUnloadCallback);
		callbacks[ZmAppViewMgr.CB_POST_SHOW] = new AjxCallback(this, this._postShowCallback);
		callbacks[ZmAppViewMgr.CB_PRE_SHOW] = new AjxCallback(this, this._preShowCallback);
		callbacks[ZmAppViewMgr.CB_POST_HIDE] = new AjxCallback(this, this._postHideCallback);
		if (!this._toolbar)
			this._createToolBar();

		var elements = this.getViewElements(null, this._composeView, this._toolbar);

		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});
		if (initHide) {
			this._composeView.preload();
		}
		this._needComposeViewRefresh = false;
		return true;
	}
    else{
        this._savedFocusMember = this._composeView.getApptEditView()._getDefaultFocusItem();
    }
	return false;
};

ZmApptComposeController.prototype.getCalendarAccount =
function() {
    return (appCtxt.multiAccounts)
        ? this._composeView.getApptEditView().getCalendarAccount() : null;

};

ZmApptComposeController.prototype.getAttendees =
function(type) {
    return this._composeView.getAttendees(type);
};

ZmApptComposeController.prototype._postHideCallback =
function() {

	ZmCalItemComposeController.prototype._postHideCallback(); 

    if (appCtxt.getCurrentAppName() == ZmApp.CALENDAR || appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		appCtxt.getAppViewMgr().displayComponent(ZmAppViewMgr.C_TREE_FOOTER, true);
    }
    if (this._schedulerRendered) {
		this._smartScheduler.zShow(false);
	}
};

ZmApptComposeController.prototype._postShowCallback =
function(view, force) {    
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
	appCtxt.getAppViewMgr().displayComponent(ZmAppViewMgr.C_TREE_FOOTER, false);
    this.setSchedulerPanelContent();
};

ZmApptComposeController.prototype.getScheduleAssistant =
function() {
    return this._smartScheduler;
};

ZmApptComposeController.prototype.setSchedulerPanelContent =
function() {
    var scheduler = this.getScheduleAssistant();
    if (scheduler) {
		var components = {};
		components[ZmAppViewMgr.C_TREE] = scheduler;
        appCtxt.getAppViewMgr().setViewComponents(this._viewId, components, true);
        this._schedulerRendered = true;
    }
};

ZmApptComposeController.prototype.getWorkingInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
   var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
   soapDoc.setMethodAttribute("s", startTime);
   soapDoc.setMethodAttribute("e", endTime);
   soapDoc.setMethodAttribute("name", emailList);

   var acct = (appCtxt.multiAccounts)
       ? this._composeView.getApptEditView().getCalendarAccount() : null;

   return appCtxt.getAppController().sendRequest({
       soapDoc: soapDoc,
       asyncMode: true,
       callback: callback,
       errorCallback: errorCallback,
       noBusyOverlay: noBusyOverlay,
       accountName: (acct ? acct.name : null)
   });
};

ZmApptComposeController.prototype._resetToolbarOperations =
function() {
    //do nothing - this  gets called when this controller handles a list view
};

ZmApptComposeController.prototype._handleSettingChange =
function(ev) {

	if (ev.type != ZmEvent.S_SETTING) { return; }

	var id = ev.source.id;
	if (id == ZmSetting.USE_ADDR_BUBBLES) {
		this._needComposeViewRefresh = true;
	}
};
