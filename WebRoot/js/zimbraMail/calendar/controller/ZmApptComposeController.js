/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
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
 * @param container	[DwtComposite]	the containing element
 * @param app		[ZmCalendarApp]	a handle to the calendar application
 */
ZmApptComposeController = function(container, app) {

	ZmCalItemComposeController.call(this, container, app);

	this._addedAttendees = [];
	this._removedAttendees = [];
	this._kbMgr = appCtxt.getKeyboardMgr();

	// preload compose view for faster loading
	this.initComposeView(true);
};

ZmApptComposeController.prototype = new ZmCalItemComposeController;
ZmApptComposeController.prototype.constructor = ZmApptComposeController;

ZmApptComposeController.prototype.toString =
function() {
	return "ZmApptComposeController";
};

// Public methods

ZmApptComposeController.prototype.show =
function(calItem, mode, isDirty) {
	ZmCalItemComposeController.prototype.show.call(this, calItem, mode, isDirty);

	this._addedAttendees.length = this._removedAttendees.length = 0;
	this._setComposeTabGroup();
};

ZmApptComposeController.prototype.saveCalItem =
function(attId) {
	var appt = this._composeView.getAppt(attId);
	if (appt) {
		
		if (this._invalidAttendees && this._invalidAttendees.length > 0) {
			var dlg = appCtxt.getYesNoMsgDialog();
			dlg.registerCallback(DwtDialog.YES_BUTTON, this._clearInvalidAttendeesCallback, this, [appt, attId, dlg]);
			var msg = AjxMessageFormat.format(ZmMsg.compBadAttendees, this._invalidAttendees.join(","));
			dlg.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
			dlg.popup();
			return false;
		}
		
		var origAttendees = appt.origAttendees;						// bug fix #4160
		if (origAttendees && origAttendees.length > 0 && 			// make sure we're not u/l'ing a file
			attId == null) 											// make sure we are editing an existing appt w/ attendees
		{
			if (!this._composeView.getApptTab().isDirty(true)) {	// make sure other fields (besides attendees field) have not changed
				var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
				if (attendees.length > 0) {
					// check whether organizer has added/removed any attendees
					if (this._attendeesUpdated(appt, attId, attendees, origAttendees))
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
					return false;
				}
			}
		}

        //this._checkResourceConflicts(appt);

        var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
        if (attendees && attendees.length > 0) {
            var newEmails = [];
            for (var i = 0; i < attendees.length; i++) {
                var email = attendees[i].getEmail();
                newEmails.push(email);
            }
            this.checkPermissionRequest(newEmails, appt, attId);
            return false;
        }else {
		    // otherwise, just save the appointment
		    this._saveCalItemFoRealz(appt, attId);
        }
	}
	return true;
};

ZmApptComposeController.prototype.checkResourceConflicts =
function() {
    var appt = this._composeView.getAppt();
    this._checkResourceConflicts(appt);
};

ZmApptComposeController.prototype._checkResourceConflicts =
function(appt) {
    //if(!appt.isRecurring()) return;

    var soapDoc = AjxSoapDoc.create("CheckRecurConflictsRequest", "urn:zimbraMail");
    var today = new Date();
    today.setHours(0,0,0,0);
        
    soapDoc.setMethodAttribute("s", today.getTime());
    soapDoc.setMethodAttribute("e", today.getTime() + (AjxDateUtil.MSEC_PER_DAY*365));
	
	var mode = appt.viewMode;
	if(mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		soapDoc.setMethodAttribute("excludeUid", appt.uid);
	}

    var comp = soapDoc.set("comp", null, soapDoc.getMethod());

    appt._addDateTimeToSoap(soapDoc, soapDoc.getMethod(), comp);
    appt._recurrence.setSoap(soapDoc, comp);

    
    appt.addAttendeesToChckConflictsRequest(soapDoc, soapDoc.getMethod());

    var callback = new AjxCallback(this, this._handleResourceConflict, appt);
    var errorCallback = new AjxCallback(this, this._handleResourceConflictError);

    return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback,
                                                   errorCallback:errorCallback, noBusyOverlay:true});    
};

ZmApptComposeController.prototype.checkPermissionRequest =
function(names, appt, attId) {
    var jsonObj = {BatchRequest:{_jsns:"urn:zimbra", onerror:"continue"}};
    var request = jsonObj.BatchRequest;

    var chkPermRequest = request.CheckPermissionRequest = [];

    for(var i in names) {
        var permRequest = {_jsns:"urn:zimbraMail"};
        permRequest.target = {
            type : "account",
            by : "name",
            _content : names[i]
        };
        permRequest.right = {_content: "invite"};
        chkPermRequest.push(permRequest);
    }

    var respCallback = new AjxCallback(this, this.handleCheckPermissionResponse, [appt, attId, names]);
    var errorCallback = new AjxCallback(this, this.handleCheckPermissionResponseError, [appt, attId, names]);
    appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, errorCallback: errorCallback, noBusyOverlay:true});
};

ZmApptComposeController.prototype.handleCheckPermissionResponse =
function(appt, attId, names, response) {
    var batchResp = response && response._data && response._data.BatchResponse;
    var checkPermissionResp = (batchResp && batchResp.CheckPermissionResponse) ? batchResp.CheckPermissionResponse  : null;
    if(checkPermissionResp) {
        var deniedAttendees = [];
        for(var i in checkPermissionResp) {
            if(checkPermissionResp && !checkPermissionResp[i].allow) {
                deniedAttendees.push(names[i]);
            }
        }
        if(deniedAttendees.length > 0) {
            var msg =  AjxMessageFormat.format(ZmMsg.invitePermissionDenied, [deniedAttendees.join(",")]);;            
            var msgDialog = appCtxt.getYesNoMsgDialog();
            msgDialog.reset();
			msgDialog.registerCallback(DwtDialog.YES_BUTTON, this._saveAfterPermissionCheck, this, [appt, attId, msgDialog]);
            msgDialog.setMessage(msg, DwtMessageDialog.INFO_STYLE);
            msgDialog.popup();
            return;
        }
    }
    this.saveCalItemContinue(appt, attId);
};

ZmApptComposeController.prototype._saveAfterPermissionCheck =
function(appt, attId, msgDialog) {
    msgDialog.popdown();
    this.saveCalItemContinue(appt, attId);
};

ZmApptComposeController.prototype.saveCalItemContinue =
function(appt, attId) {
    this._saveCalItemFoRealz(appt, attId);
    this._app.popView(true);
};

ZmApptComposeController.prototype.handleCheckPermissionResponseError =
function(appt, attId, response) {
    var resp = response && response._data && response._data.BatchResponse;
    this.saveCalItemContinue(appt, attId);
};

ZmApptComposeController.prototype._handleResourceConflict =
function(appt, result) {
    var conflictResponse = result.getResponse().CheckRecurConflictsResponse;

    if(!conflictResponse) return;
    var inst = conflictResponse.inst;

    if(inst && inst.length > 0) {
        DBG.println("conflict instances :" + inst.length);
        if(!this._resConflictDialog) {
            this._resConflictDialog = new ZmResourceConflictDialog(this._shell);
        }
        this._resConflictDialog.initialize(inst, appt);
        this._resConflictDialog.popup();
    }
    
};

ZmApptComposeController.prototype._handleResourceConflictError =
function() {

};

ZmApptComposeController.prototype.getFreeBusyInfo = 
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback,
												   errorCallback:errorCallback, noBusyOverlay:noBusyOverlay});
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
	var tabView = this._composeView.getTabView(this._composeView.getCurrentTab());
	tabView._addTabGroupMembers(tg);
	
	var focusItem = tabView._savedFocusMember || tabView._getDefaultFocusItem() || tg.getFirstMember(true);
	var ta = new AjxTimedAction(this, this._setFocus, [focusItem, !setFocus]);
	AjxTimedAction.scheduleAction(ta, 10);
};

ZmApptComposeController.prototype.getKeyMapName =
function() {
	return "ZmApptComposeController";
};


// Private / Protected methods

ZmApptComposeController.prototype._getViewType =
function() {
	return ZmId.VIEW_APPOINTMENT;
};

ZmApptComposeController.prototype._attendeesUpdated =
function(appt, attId, attendees, origAttendees) {
	// create hashes of emails for comparison
	var origEmails = {};
	for (var i = 0; i < origAttendees.length; i++) {
		var email = origAttendees[i].getEmail();
		origEmails[email] = true;
	}
	var curEmails = {};
	for (var i = 0; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		curEmails[email] = true;
	}

	// walk the current list of attendees and check if there any new ones
	for (var i = 0 ; i < attendees.length; i++) {
		var email = attendees[i].getEmail();
		if (!origEmails[email]) {
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
		return true;
	}

	return false;
};


// Listeners

// Cancel button was pressed
ZmApptComposeController.prototype._cancelListener =
function(ev) {
	this._app.getCalController().setNeedsRefresh(true);

	ZmCalItemComposeController.prototype._cancelListener.call(this, ev);
};

ZmApptComposeController.prototype._printListener =
function() {
	var calItem = this._composeView._apptEditView._calItem;
	var url = ("/h/printappointments?id=" + calItem.invId);
	window.open(appContextPath+url, "_blank");
};


// Callbacks

ZmApptComposeController.prototype._notifyDlgOkListener =
function(ev) {
	var notifyList = this._notifyDialog.notifyNew() ? this._addedAttendees : null;
	this._saveCalItemFoRealz(this._notifyDialog.getAppt(), this._notifyDialog.getAttId(), notifyList);
	this._app.popView(true);
};

ZmApptComposeController.prototype._notifyDlgCancelListener =
function(ev) {
	this._addedAttendees.length = this._removedAttendees.length = 0;
};

ZmApptComposeController.prototype._changeOrgCallback =
function(appt, attId, dlg) {
	dlg.popdown();
	this._saveCalItemFoRealz(appt, attId);
	this._app.popView(true);
};

ZmApptComposeController.prototype._clearInvalidAttendeesCallback =
function(appt, attId, dlg) {	
	dlg.popdown();
	delete this._invalidAttendees;
	this._saveListener();
};
