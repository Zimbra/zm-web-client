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
    if (arguments.length == 0) { return; }

	ZmCalItemComposeController.apply(this, arguments);

	this._addedAttendees = [];
	this._removedAttendees = [];
	this._kbMgr = appCtxt.getKeyboardMgr();
};

ZmApptComposeController.prototype = new ZmCalItemComposeController;
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.isZmApptComposeController = true;
ZmApptComposeController.prototype.toString = function() { return "ZmApptComposeController"; };

ZmApptComposeController._VALUE = "value";

ZmApptComposeController._DIALOG_OPTIONS = {
	SEND: 'SEND',
	CANCEL: 'CANCEL',
	DISCARD: 'DISCARD'
};

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
    var apptEditView = this._composeView ? this._composeView.getApptEditView() : null;
    var viewMode = apptEditView ? apptEditView.getMode() : null;
	appt.sendCounterAppointmentRequest(callback, null, viewMode);
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
			dlg = this._changesDialog = new DwtOptionDialog({
				parent: appCtxt.getShell(),
				id: Dwt.getNextId("CHNG_DLG_ORG_"),
				title: ZmMsg.apptSave,
				message: ZmMsg.apptSignificantChanges,
				options: [
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.SEND,
						text: ZmMsg.apptSaveChanges
					},
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.CANCEL,
						text: ZmMsg.apptSaveCancel
					},
					{
						name: ZmApptComposeController._DIALOG_OPTIONS.DISCARD,
						text: ZmMsg.apptSaveDiscard
					}
				]
			});
			dlg.registerCallback(DwtDialog.OK_BUTTON,
			                     this._changesDialogListener.bind(this));
        }
    }
    else {
        dlg = this._attendeeChangesDialog;
        if (!dlg) {
            dlg = this._attendeeChangesDialog = new DwtDialog({parent:appCtxt.getShell(), id:Dwt.getNextId("CHNG_DLG_ATTNDE_")});
            id = this._attendeeChangesDialogId = Dwt.getNextId();
            dlg.setContent(AjxTemplate.expand("calendar.Appointment#ChangesDialogAttendee", {id: id}));
            dlg.setTitle(ZmMsg.apptSave);
            dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._attendeeChangesDialogListener, id));
        }
    }
    return dlg;
};

ZmApptComposeController.prototype._changesDialogListener =
function(){

    this.clearInvalidAttendees();
    delete this._invalidAttendees;

	switch (this._changesDialog.getSelection()) {
	case ZmApptComposeController._DIALOG_OPTIONS.SEND:
        this._sendListener();
		break;

	case ZmApptComposeController._DIALOG_OPTIONS.CANCEL:
		break;

	case ZmApptComposeController._DIALOG_OPTIONS.DISCARD:
        this.closeView();
		break;
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
	this._composeView.cancelLocationRequest();
	var appt = this._composeView.getAppt(attId);
    var numRecurrence = this._composeView.getNumLocationConflictRecurrence ?
        this._composeView.getNumLocationConflictRecurrence() :
        ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE;

	if (appt) {

		if (!appt.isValidDuration()) {
			this._composeView.showInvalidDurationMsg();
			this.enableToolbar(true);
			return false;
		}
		if (!appt.isValidDurationRecurrence()) {
			this._composeView.showInvalidDurationRecurrenceMsg();
			this.enableToolbar(true);
			return false;
		}

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
            /* if(!appt.isOrganizer()) */ return this.forwardCalItem(appt);
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
				var dlg = appCtxt.getMsgDialog();
                dlg.setMessage(ZmMsg.orgChange, DwtMessageDialog.WARNING_STYLE);
                dlg.popup();
                this.enableToolbar(true);
                return false;
			}
		}

        var ret = this._initiateSaveWithChecks(appt, attId, numRecurrence);
		return ret;
	}

	return false;
};

ZmApptComposeController.prototype._initiateSaveWithChecks =
function(appt, attId, numRecurrence) {
    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

    var notifyList;

    var needsPermissionCheck = (attendees && attendees.length > 0) ||
                               (resources && resources.length > 0) ||
                               (locations && locations.length > 0);

    var needsConflictCheck = !appt.isForward &&
         ((resources && resources.length > 0) ||
         // If alteredLocations specified, it implies the user
         // has already examined and modified the location conflicts
         // that they want - so issue no further warnings.

         // NOTE: appt.alteredLocations is disabled (and hence undefined)
         //       for now.  It will be set once CreateAppt/ModifyAppt
         //       SOAP API changes are completed (Bug 56464)
          (!appt.alteredLocations && locations && locations.length > 0));

    if (needsConflictCheck) {
        this.checkConflicts(appt, numRecurrence, attId, notifyList);
        return false;
    } else if (needsPermissionCheck) {
        this.checkAttendeePermissions(appt, attId, notifyList);
        return false;
    } else {
        this._saveCalItemFoRealz(appt, attId, notifyList);
    }
    return true;
};

ZmApptComposeController.prototype.updateToolbarOps =
function(mode, appt) {

    var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
    var sendButton = this._toolbar.getButton(ZmOperation.SEND_INVITE);

    if (mode == ZmCalItemComposeController.APPT_MODE) {
        saveButton.setText(ZmMsg.saveClose);
        saveButton.setVisible(true);
        sendButton.setVisible(false);
    } else {
        sendButton.setVisible(true);
        saveButton.setVisible(true);
        saveButton.setText(ZmMsg.save);

        //change cancel button's text/icon to close
        var cancelButton = this._toolbar.getButton(ZmOperation.CANCEL);
        cancelButton.setText(ZmMsg.close);
    }
	if (this._requestResponses) {
		this._requestResponses.setEnabled(mode !== ZmCalItemComposeController.APPT_MODE);
	}

    if ((this._mode == ZmCalItem.MODE_PROPOSE_TIME) || ZmCalItem.FORWARD_MAPPING[this._mode]) {
        sendButton.setVisible(true);
        saveButton.setVisible(false);
        // Enable the RequestResponse when Forwarding
		if (this._requestResponses) {
			this._requestResponses.setEnabled(this._mode !== ZmCalItem.MODE_PROPOSE_TIME);
		}
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

	var saveButton = this._toolbar.getButton(ZmOperation.SAVE);
	saveButton.setToolTipContent(ZmMsg.saveToCalendar);
	
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
        if (m) {
            var sepMi = new DwtMenuItem({parent:m, style:DwtMenuItem.SEPARATOR_STYLE});
        }
        else {
            m = new DwtMenu({parent:optionsButton});
            optionsButton.setMenu(m);
        }

        var mi = this._requestResponses = new DwtMenuItem({parent:m, style:DwtMenuItem.CHECK_STYLE});
        mi.setText(ZmMsg.requestResponses);
        mi.setChecked(true, true);

        sepMi = new DwtMenuItem({parent:m, style:DwtMenuItem.SEPARATOR_STYLE});
        mi = new DwtMenuItem({parent:m, style:DwtMenuItem.NO_STYLE});
        mi.setText(ZmMsg.suggestionPreferences);
        mi.addSelectionListener(this._prefListener.bind(this));
    }

	this._toolbar.addSelectionListener(ZmOperation.SPELL_CHECK, new AjxListener(this, this._spellCheckListener));
};

ZmApptComposeController.prototype._prefListener =
function(ev) {
    this._prefDialog = appCtxt.getSuggestionPreferenceDialog();
    this._prefDialog.popup(this.getCalendarAccount());
};

ZmApptComposeController.prototype.setRequestResponsesEnabled =
function(enabled) {
   if (this._requestResponses)
   this._requestResponses.setEnabled(enabled);
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
    for(var i = 0; i < addrs.length; i++) {
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
function(appt, numRecurrence, attId, notifyList) {
	var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
	var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
	var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

	var needsPermissionCheck = (attendees && attendees.length > 0) ||
							   (resources && resources.length > 0) ||
							   (locations && locations.length > 0);

	var callback = needsPermissionCheck
		? (new AjxCallback(this, this.checkAttendeePermissions, [appt, attId, notifyList]))
		: (new AjxCallback(this, this.saveCalItemContinue, [appt, attId, notifyList]));

	this._checkResourceConflicts(appt, numRecurrence, callback, false, true, false);
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

// Expose the resource conflict check call to allow the ApptEditView to
// trigger a location conflict check
ZmApptComposeController.prototype.getCheckResourceConflicts =
function(appt, numRecurrence, callback, displayConflictDialog) {
    return this.checkResourceConflicts.bind(this, appt, numRecurrence, callback, displayConflictDialog);
}

ZmApptComposeController.prototype.checkResourceConflicts =
function(appt, numRecurrence, callback, displayConflictDialog) {
	return this._checkResourceConflicts(appt, numRecurrence, callback,
        true, displayConflictDialog, true);
};

ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, numRecurrence, callback, showAll, displayConflictDialog, conflictCallbackOverride) {
	var mode = appt.viewMode;
	var reqId;
	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		if(appt.isRecurring() && mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
			// for recurring appt - user GetRecurRequest to get full recurrence
			// information and use the component in CheckRecurConflictRequest
			var recurInfoCallback = this._checkResourceConflicts.bind(this,
                appt, numRecurrence, callback, showAll, displayConflictDialog, conflictCallbackOverride);
			reqId = this.getRecurInfo(appt, recurInfoCallback);
		}
        else {
			reqId = this._checkResourceConflicts(appt, numRecurrence, callback,
                showAll, displayConflictDialog, conflictCallbackOverride);
		}
	}
    else {
		reqId = this._checkResourceConflicts(appt, numRecurrence, callback,
            showAll, displayConflictDialog, conflictCallbackOverride);
	}
	return reqId;
};

/**
 * JSON request is used to make easy re-use of "comp" elements from GetRecurResponse.
 * 
 * @private
 */
ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, numRecurrence, callback, showAll, displayConflictDialog,
         conflictCallbackOverride, recurInfo) {
	var mode = appt.viewMode,
	    jsonObj = {
            CheckRecurConflictsRequest: {
                _jsns:"urn:zimbraMail"
            }
        },
	    request = jsonObj.CheckRecurConflictsRequest,
        startDate = new Date(appt.startDate),
        comps = request.comp = [],
        comp = request.comp[0] = {},
        recurrence,
        recur;

    startDate.setHours(0,0,0,0);
	request.s = startDate.getTime();
	request.e = ZmApptComposeController.getCheckResourceConflictEndTime(
	        appt, startDate, numRecurrence);

    if (showAll) {
        request.all = "1";
    }

	if (mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		request.excludeUid = appt.uid;
	}


    appt._addDateTimeToRequest(request, comp, true);

    //preserve the EXDATE (exclude recur) information
    if(recurInfo) {
        recurrence = appt.getRecurrence();
        recur = (recurInfo && recurInfo.comp) ? recurInfo.comp[0].recur : null;
        recurrence.parseExcludeInfo(recur);
    }

    if(mode != ZmCalItem.MODE_EDIT_SINGLE_INSTANCE) {
        appt._recurrence.setJson(comp);
    }

    this.setExceptFromRecurInfo(request, recurInfo);

    appt.addAttendeesToChckConflictsRequest(request);

    return appCtxt.getAppController().sendRequest({
        jsonObj: jsonObj,
        asyncMode: true,
        callback: (new AjxCallback(this, this._handleResourceConflict, [appt, callback,
            displayConflictDialog, conflictCallbackOverride])),
        errorCallback: (new AjxCallback(this, this._handleResourceConflictError, [appt, callback])),
        noBusyOverlay: true
    });
};

ZmApptComposeController.prototype.setExceptFromRecurInfo =
function(request, recurInfo) {
	var exceptInfo = recurInfo && recurInfo.except,
        i,
        s,
        e,
        exceptId,
        except,
        sNode,
        eNode,
        exceptIdNode;
	if (!exceptInfo) { return; }

	for (i in exceptInfo) {
		s = exceptInfo[i].s ? exceptInfo[i].s[0] : null;
		e = exceptInfo[i].e ? exceptInfo[i].e[0] : null;
		exceptId = exceptInfo[i].exceptId ? exceptInfo[i].exceptId[0] : null;

		except = request.except = {};
		if (s) {
			sNode = except.s = {};
			sNode.d = s.d;
			if (s.tz) {
				sNode.tz = s.tz;
			}
		}

		if (e) {
			eNode = except.e = {};
			eNode.d = e.d;
			if (e.tz) {
				eNode.tz = e.tz;
			}
		}

		if (exceptId) {
			exceptIdNode = except.exceptId = {};
			exceptIdNode.d = exceptId.d;
			if (exceptId.tz) {
				exceptIdNode.tz = exceptId.tz;
			}
		}
	}
};

// Use the (numRecurrences * the recurrence period * repeat.customCount)
// time interval to determine the endDate of the resourceConflict check
ZmApptComposeController.getCheckResourceConflictEndTime =
function(appt, originalStartDate, numRecurrence) {
    var startDate = new Date(originalStartDate.getTime());
    var recurrence = appt.getRecurrence();
    var endDate;
    var range = recurrence.repeatCustomCount * numRecurrence;
    if (recurrence.repeatType == ZmRecurrence.NONE) {
        if (appt.allDayEvent === "1") {
            endDate = new Date(appt.endDate.getTime() + AjxDateUtil.MSEC_PER_DAY);
        } else {
            endDate = appt.endDate;
        }
    } else if (recurrence.repeatType == ZmRecurrence.DAILY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.DAY, range);
    } else if (recurrence.repeatType == ZmRecurrence.WEEKLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.WEEK, range);
    } else if (recurrence.repeatType == ZmRecurrence.MONTHLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.MONTH, range);
    } else if (recurrence.repeatType == ZmRecurrence.YEARLY) {
        endDate = AjxDateUtil.roll(startDate, AjxDateUtil.YEAR, range);
    }
    var endTime = endDate.getTime();
    if (recurrence.repeatEndDate) {
        var repeatEndTime = recurrence.repeatEndDate.getTime() + AjxDateUtil.MSEC_PER_DAY;
        if (endTime > repeatEndTime) {
            endTime = repeatEndTime;
        }
    }
    return endTime;
}

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
    // CheckPermissions to be retired after IronMaiden.  Replaced with CheckRights
    var jsonObj = {CheckRightsRequest:{_jsns:"urn:zimbraAccount"}};
    var request = jsonObj.CheckRightsRequest;

    request.target = [];
    for (var i = 0; i < names.length; i++) {
        var targetInstance = {
            type: "account",
            by:   "name",
            key:   names[i]
        };
        targetInstance.right = [{_content: "invite"}];
        request.target.push(targetInstance);
    }

    var respCallback  = new AjxCallback(this, this.handleCheckRightsResponse, [appt, attId, names, notifyList]);
    var errorCallback = new AjxCallback(this, this.handleCheckRightsResponse, [appt, attId, names, notifyList]);
    appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, errorCallback: errorCallback, noBusyOverlay:true});
};

ZmApptComposeController.prototype.handleCheckRightsResponse =
function(appt, attId, names, notifyList, response) {
	var checkRightsResponse = response && response._data && response._data.CheckRightsResponse;
	if (checkRightsResponse && checkRightsResponse.target) {
		var deniedAttendees = [];
		for (var i in checkRightsResponse.target) {
			if (!checkRightsResponse.target[i].allow) {
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
function(appt, callback, displayConflictDialog, conflictCallbackOverride, result) {
	var conflictExist = false;
    var inst = null;
	if (result) {
		var conflictResponse = result.getResponse().CheckRecurConflictsResponse;
		inst = this._conflictingInstances = conflictResponse.inst;
		if (inst && inst.length > 0) {
			if (displayConflictDialog) {
				this.showConflictDialog(appt, callback, inst);
			}
			conflictExist = true;
			this.enableToolbar(true);
		}
	}

	if ((conflictCallbackOverride || !conflictExist) && callback) {
		callback.run(inst);
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
	return ZmKeyMap.MAP_EDIT_APPOINTMENT;
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

    this._composeView.getApptEditView().resetParticipantStatus();

    // NOTE: Once CreateAppt/ModifyAppt SOAP API changes are completed (Bug 56464), pass to
    // the base _saveCalItemFoRealz appt.alteredLocations, to create a set of location
    // exceptions along with creation/modification of the underlying appt
    // *** NOT DONE ***
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
    
	if (!this._composeView) {
		this._composeView = this._createComposeView();
        var appEditView = this._composeView.getApptEditView();
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
								hide:		this._elementsToHide,
								controller:	this,
								callbacks:	callbacks,
								tabParams:	this._getTabParams()});
		if (initHide) {
			this._composeView.preload();
		}
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
};

ZmApptComposeController.prototype._postShowCallback =
function(view, force) {
	var ta = new AjxTimedAction(this, this._setFocus);
	AjxTimedAction.scheduleAction(ta, 10);
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

// --- Subclass the ApptComposeController for saving Quick Add dialog appointments, and doing a
//     save when the CalColView drag and drop is used
ZmSimpleApptComposeController = function(container, app, type, sessionId) {
    ZmApptComposeController.apply(this, arguments);
    this._closeCallback = null;
    // Initialize a static/dummy compose view.  It is never actually used
    // for display (only for the function calls made to it during the save),
    // so it can be setup here.
    this.initComposeView();
};

ZmSimpleApptComposeController.prototype = new ZmApptComposeController;
ZmSimpleApptComposeController.prototype.constructor = ZmSimpleApptComposeController;

ZmSimpleApptComposeController.prototype.toString = function() { return "ZmSimpleApptComposeController"; };

ZmSimpleApptComposeController.getDefaultViewType =
function() {
	return ZmId.VIEW_SIMPLE_ADD_APPOINTMENT;
};

ZmSimpleApptComposeController.prototype.doSimpleSave =
function(appt, action, closeCallback, errorCallback, cancelCallback) {
    var ret = false;
    this._action = action;
    this._closeCallback = null;
    if(!appt.isValidDuration()){
        this._composeView.showInvalidDurationMsg();
    } else if (appt) {
        this._simpleCloseCallback  = closeCallback;
        this._simpleErrorCallback  = errorCallback;
        this._simpleCancelCallback = cancelCallback;
        ret = this._initiateSaveWithChecks(appt, null, ZmTimeSuggestionPrefDialog.DEFAULT_NUM_RECURRENCE);
    }
    return ret;
};

ZmSimpleApptComposeController.prototype._handleResponseSave =
function(calItem, result) {
    if (this._simpleCloseCallback) {
        this._simpleCloseCallback.run();
    }
    appCtxt.notifyZimlets("onSaveApptSuccess", [this, calItem, result]);//notify Zimlets on success
};

ZmSimpleApptComposeController.prototype._getErrorSaveStatus =
function(calItem, ex) {
    var status = ZmCalItemComposeController.prototype._getErrorSaveStatus.call(this, calItem, ex);
    if (!status.continueSave && this._simpleErrorCallback) {
        this._simpleErrorCallback.run(this);
    }

    return status;
};

ZmSimpleApptComposeController.prototype.initComposeView =
function() {
	if (!this._composeView) {
		// Create an empty compose view and make it always return isDirty == true
		this._composeView = this._createComposeView();
		this._composeView.isDirty = function() { return true; };
		return true;
    }
	return false;
};

ZmSimpleApptComposeController.prototype.enableToolbar =
function(enabled) { }


ZmSimpleApptComposeController.prototype.showConflictDialog =
function(appt, callback, inst) {
	DBG.println("conflict instances :" + inst.length);

	var conflictDialog = this.getConflictDialog();
	conflictDialog.initialize(inst, appt, callback, this._simpleCancelCallback);
	conflictDialog.popup();
};
