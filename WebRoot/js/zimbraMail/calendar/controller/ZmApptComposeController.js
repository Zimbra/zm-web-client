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
 * Creates a new appointment controller to manage appointment creation/editing.
 * @constructor
 * @class
 * This class manages appointment creation/editing.
 *
 * @author Parag Shah
 *
 * @param {DwtComposite}	container	the containing element
 * @param {ZmCalendarApp}	app		the handle to the calendar application
 * 
 * @extends		ZmCalItemComposeController
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

/**
 * Forwards the calendar item.
 * 
 * @param	{ZmAppt}	appt		the appointment
 * @return	{Boolean}	<code>true</code> indicates the forward is executed
 */
ZmApptComposeController.prototype.forwardCalItem =
function(appt, forwardCallback) {
    //todo: to address input validation
    var callback = new AjxCallback(this, this._handleForwardInvite, forwardCallback);
    appt.forward(callback);
    return true;
};

ZmApptComposeController.prototype._handleForwardInvite =
function(forwardCallback) {
    appCtxt.setStatusMsg(ZmMsg.forwardInviteSent);
    if(forwardCallback) {
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
    this._app.popView(true);
};

ZmApptComposeController.prototype.saveCalItem =
function(attId) {
	var appt = this._composeView.getAppt(attId);
	if (appt) {

        if(appt.isForward) {
            var addrs = this._composeView.getForwardAddress();

            //validate empty forward address
            if (!addrs.gotAddress) {
                var msgDialog = appCtxt.getMsgDialog();
                msgDialog.setMessage(ZmMsg.noForwardAddresses, DwtMessageDialog.CRITICAL_STYLE);
                msgDialog.popup();
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
                return false;
            }
            
            return this.forwardCalItem(appt);
        }

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
        var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
        var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
        var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

        var needsPermissionCheck = (attendees && attendees.length > 0) || (resources && resources.length > 0) || (locations && locations.length > 0);
        var needsConflictCheck = (resources && resources.length > 0) || (locations && locations.length > 0);

        if (needsConflictCheck) {
            this.checkConflicts(appt, attId);
            return false;
        }else if (needsPermissionCheck) {
            this.checkAttendeePermissions(appt, attId);
            return false;
        }else{
            this._saveCalItemFoRealz(appt, attId);
        }
        return true;
    }

    return false;
};

ZmApptComposeController.prototype.checkConflicts =
function(appt, attId) {

    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);

    var needsPermissionCheck = (attendees && attendees.length > 0) || (resources && resources.length > 0) || (locations && locations.length > 0);

    var callback =  new AjxCallback(this, this.saveCalItemContinue, [appt, attId]);

    if(needsPermissionCheck) {
        callback =  new AjxCallback(this, this.checkAttendeePermissions, [appt, attId]);
    }

    this._checkResourceConflicts(appt, callback);

};

ZmApptComposeController.prototype.checkAttendeePermissions =
function(appt, attId) {
    var newEmails = [];

    var attendees = appt.getAttendees(ZmCalBaseItem.PERSON);
    if (attendees && attendees.length > 0) {
        for (var i = 0; i < attendees.length; i++) {
            var email = attendees[i].getEmail();
            newEmails.push(email);
        }
    }

    var locations = appt.getAttendees(ZmCalBaseItem.LOCATION);
    if (locations && locations.length > 0) {
        for (var i = 0; i < locations.length; i++) {
            var email = locations[i].getEmail();
            newEmails.push(email);
        }
    }

    var resources = appt.getAttendees(ZmCalBaseItem.EQUIPMENT);
    if (resources && resources.length > 0) {
        for (var i = 0; i < resources.length; i++) {
            var email = resources[i].getEmail();
            newEmails.push(email);
        }
    }

    if(newEmails.length) {
        this.checkPermissionRequest(newEmails, appt, attId);
        return false;
    }else {
        // otherwise, just save the appointment
        this._saveCalItemFoRealz(appt, attId);
    }
};


ZmApptComposeController.prototype.checkResourceConflicts =
function(callback) {
    this._conflictCallback = callback;
    var appt = this._composeView.getAppt();
    this._checkResourceConflicts(appt);
};

ZmApptComposeController.prototype._checkResourceConflicts =
function(appt, callback) {
    var mode = appt.viewMode;

    if(mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
        if(appt.isRecurring()) {
            //for recurring appt - user GetRecurRequest to get full recurrence information
            //and use the component in CheckRecurConflictRequest
            var recurInfoCallback = new AjxCallback(this, this._checkResourceConflictsSoap, [appt, callback]);
            this.getRecurInfo(appt, recurInfoCallback);
        }else {
            this._checkResourceConflictsSoap(appt, callback);
        }
    }else {
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

    if(mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
        request.excludeUid = appt.uid;
    }

    request.comp = recurInfo.comp || [];
    request.except = recurInfo.except;
    request.tz = recurInfo.tz;

    appt.addAttendeesToChckConflictsJSONRequest(request);

    var callback = new AjxCallback(this, this._handleResourceConflict, [appt, callback]);
    var errorCallback = new AjxCallback(this, this._handleResourceConflictError, [appt, callback]);

    return appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:callback,
                                                   errorCallback:errorCallback, noBusyOverlay:true});
};

ZmApptComposeController.prototype.setExceptFromRecurInfo =
function(soapDoc, recurInfo) {

    var exceptInfo = recurInfo ? recurInfo.except : undefined;

    if(!exceptInfo) return;

    for(var i in exceptInfo) {
        var s = exceptInfo[i].s ? exceptInfo[i].s[0] : null;
        var e = exceptInfo[i].e ? exceptInfo[i].e[0] : null;
        var exceptId = exceptInfo[i].exceptId ? exceptInfo[i].exceptId[0] : null;
        
        var except = soapDoc.set("except", null, soapDoc.getMethod());
        if(s) {
            var sNode = soapDoc.set("s", null, except);
            sNode.setAttribute("d", s.d);
            if(s.tz) sNode.setAttribute("tz", s.tz);
        }
        if(e) {
            var eNode = soapDoc.set("e", null, except);
            eNode.setAttribute("d", e.d);
            if(e.tz)  eNode.setAttribute("tz", e.tz);
        }
        if(exceptId) {
            var exceptIdNode = soapDoc.set("exceptId", null, except);
            exceptIdNode.setAttribute("d", exceptId.d);
            if(exceptId.tz) exceptIdNode.setAttribute("tz", exceptId.tz);
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
	
	if(mode!=ZmCalItem.MODE_NEW_FROM_QUICKADD && mode!= ZmCalItem.MODE_NEW) {
		soapDoc.setMethodAttribute("excludeUid", appt.uid);
	}

    var comp = soapDoc.set("comp", null, soapDoc.getMethod());

    appt._addDateTimeToSoap(soapDoc, soapDoc.getMethod(), comp);
    appt._recurrence.setSoap(soapDoc, comp);

    this.setExceptFromRecurInfo(soapDoc, recurInfo);
    
    appt.addAttendeesToChckConflictsRequest(soapDoc, soapDoc.getMethod());

    var callback = new AjxCallback(this, this._handleResourceConflict, [appt, callback]);
    var errorCallback = new AjxCallback(this, this._handleResourceConflictError, [appt, callback]);

    return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback,
                                                   errorCallback:errorCallback, noBusyOverlay:true});    
};

/**
 * Gets the recurrence definition of an appointment.
 * 
 * @param {ZmAppt}	appt 	the appointment
 * @param {AjxCallback}	callback 		the callback module after getting recurrence info
 */
ZmApptComposeController.prototype.getRecurInfo =
function(appt, recurInfoCallback) {

    var soapDoc = AjxSoapDoc.create("GetRecurRequest", "urn:zimbraMail");
    soapDoc.setMethodAttribute("id", appt.id);

    var callback = new AjxCallback(this, this._handleRecurInfo, [appt, recurInfoCallback]);
    var errorCallback = new AjxCallback(this, this._handleRecurInfoError, [appt, recurInfoCallback]);

    return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:callback,
                                                   errorCallback:errorCallback, noBusyOverlay:true});
};

/**
 * Handle Response for GetRecurRequest call
 * 
 * @private
 */
ZmApptComposeController.prototype._handleRecurInfo =
function(appt, callback, result) {
    var recurResponse = result.getResponse().GetRecurResponse;
    if(callback){
        callback.run(recurResponse);
    }
};

ZmApptComposeController.prototype._handleRecurInfoError =
function(appt, callback, result) {
    if(callback){
        callback.run();
    }
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
function(appt, callback, result) {
    var conflictExist = false;
    if(result) {
        var conflictResponse = result.getResponse().CheckRecurConflictsResponse;
        var inst = this._conflictingInstances = conflictResponse.inst;
        if(inst && inst.length > 0) {
            if(this._conflictCallback) this._conflictCallback.run(inst);
            this.showConflictDialog(appt, callback, inst);
            conflictExist = true;
        }
    }

    if(!conflictExist && callback){
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
    if(!this._resConflictDialog) {
        this._resConflictDialog = new ZmResourceConflictDialog(this._shell);
    }
    return this._resConflictDialog;
};

ZmApptComposeController.prototype._handleResourceConflictError =
function(appt, callback) {
    //continue with normal saving process via callback
    if(callback) {
        callback.run();
    }
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

ZmApptComposeController.prototype.closeView = function() {
   this._closeView();    
};

ZmApptComposeController.prototype.forwardInvite =
function(newAppt) {
    this.show(newAppt, ZmCalItem.MODE_FORWARD_INVITE);
};
