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

ZmFreeBusyCache = function(controller) {
	this._controller = controller;
	this.clearCache();
};

ZmFreeBusyCache.STATUS_UNKNOWN = 'n';
ZmFreeBusyCache.STATUS_TENTATIVE = 't';
ZmFreeBusyCache.STATUS_BUSY = 'b';
ZmFreeBusyCache.STATUS_OUT = 'o';
ZmFreeBusyCache.STATUS_FREE = 'f';

ZmFreeBusyCache.STATUS_WORKING_HRS = 'f';
ZmFreeBusyCache.STATUS_NON_WORKING_HRS = 'u';
ZmFreeBusyCache.STATUS_UNKNOWN = 'n';

ZmFreeBusyCache.prototype.toString =
function() {
	return "ZmFreeBusyCache";
};

ZmFreeBusyCache.prototype.clearCache =
function() {
    DBG.println("clearing free busy cache");
    this._schedule = {};
    this._workingHrs = {};
};

ZmFreeBusyCache.prototype.getFreeBusyKey =
function(startTime, id) {
    return startTime + "-" + id;
};

ZmFreeBusyCache.prototype.getWorkingHoursKey =
function(id, day) {
    return id + "-" + day;
};

//filter free busy slots for given time from compressed/accumulated free busy response that got cached already
ZmFreeBusyCache.prototype.getFreeBusySlot =
function(startTime, endTime, id) {
    var slotDate = new Date(startTime);
    slotDate.setHours(0, 0, 0, 0);

    var fbSlots = this._schedule[id] || [];
    var fbResult = {id: id};

    //free busy response is always merged
    for(var i= fbSlots.length; --i >= 0;) {
        var usr = fbSlots[i];
        if (usr.n) this._addFBInfo(usr.n, id, ZmFreeBusyCache.STATUS_UNKNOWN, startTime, endTime, fbResult);
        if (usr.t) this._addFBInfo(usr.t, id, ZmFreeBusyCache.STATUS_TENTATIVE, startTime, endTime, fbResult);
        if (usr.b) this._addFBInfo(usr.b, id, ZmFreeBusyCache.STATUS_BUSY, startTime, endTime, fbResult);
        if (usr.u) this._addFBInfo(usr.u, id, ZmFreeBusyCache.STATUS_OUT, startTime, endTime, fbResult);
        if (usr.f) this._addFBInfo(usr.f, id, ZmFreeBusyCache.STATUS_FREE, startTime, endTime, fbResult);
    }

    return fbResult;
};

ZmFreeBusyCache.prototype._addFBInfo =
function(slots, id, status, startTime, endTime, fbResult) {

    if(!fbResult[status]) fbResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        if(startTime >= slots[i].s && endTime  <= slots[i].e) {
            fbResult[status].push({s: startTime, e: endTime});
        }else if(startTime >= slots[i].s && startTime  <= slots[i].e) {
            fbResult[status].push({s: startTime, e: slots[i].e});            
        }else if(endTime >= slots[i].s && endTime  <= slots[i].e) {
            fbResult[status].push({s: slots[i].s, e: endTime});
        }
    };

    if(fbResult[status].length == 0) fbResult[status] = null;
};

ZmFreeBusyCache.prototype.getFreeBusyInfo =
function(params) {

    var requiredEmails = [], freeBusyKey, emails = params.emails, fbSlot;
    for (var i = emails.length; --i >= 0;) {
        freeBusyKey = params.startTime + "";
        //check local cache
        var entryExists = false
        if(this._schedule[emails[i]]) {
            var fbSlots = this.getFreeBusySlot(params.startTime, params.endTime, emails[i]);
            if(fbSlots.f || fbSlots.u || fbSlots.b || fbSlots.t || fbSlots.n) entryExists = true;            
        };
        if(!entryExists) requiredEmails.push(emails[i]);
    }

    var fbCallback = new AjxCallback(this, this._handleResponseFreeBusy, [params]);
    var fbErrorCallback = new AjxCallback(this, this._handleErrorFreeBusy, [params]);

    if(requiredEmails.length) {
	    return this._getFreeBusyInfo(params.startTime,
                                     params.endTime,
                                     requiredEmails.join(","),
                                     fbCallback,
                                     fbErrorCallback,
                                     params.noBusyOverlay,
                                     params.account);
    }else {
        if(params.callback) {
            params.callback.run();
        }
        return null;
    }

};

//cache free busy response in user-id -> slots hash map
ZmFreeBusyCache.prototype. _handleResponseFreeBusy =
function(params, result) {

    var freeBusyKey;
	var args = result.getResponse().GetFreeBusyResponse.usr;
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        if(!this._schedule[id]) {
            this._schedule[id] = [];
        }

        this._schedule[id].push(usr);
    };

    if(params.callback) {
        params.callback.run(result);
    }
};

ZmFreeBusyCache.prototype._handleErrorFreeBusy =
function(params, result) {
    if(params.errorCallback) {
        params.errorCallback.run(result);
    }
};

ZmFreeBusyCache.prototype._getFreeBusyInfo =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay, acct) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);

	return appCtxt.getAppController().sendRequest({
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay,
		accountName: (acct ? acct.name : null)
	});
};

//working hrs related code
ZmFreeBusyCache.prototype.getWorkingHours =
function(params) {

    var requiredEmails = [], whKey, emails = params.emails;
    for (var i = emails.length; --i >= 0;) {
        whKey = this.getWorkingHoursKey(emails[i], (new Date(params.startTime)).getDay());
        //check local cache
        if(!this._workingHrs[whKey]) requiredEmails.push(emails[i]);
    }

    var fbCallback = new AjxCallback(this, this._handleResponseWorkingHrs, [params]);
    var fbErrorCallback = new AjxCallback(this, this._handleErrorWorkingHrs, [params]);

    if(requiredEmails.length) {
	    return this._getWorkingHours(params.startTime,
                                     params.endTime,
                                     requiredEmails.join(","),
                                     fbCallback,
                                     fbErrorCallback,
                                     params.noBusyOverlay,
                                     params.account);
    }else {
        if(params.callback) {
            params.callback.run();
        }
        return null;
    }

};

ZmFreeBusyCache.prototype._handleResponseWorkingHrs =
function(params, result) {

    var freeBusyKey;
	var args = result.getResponse().GetWorkingHoursResponse.usr;
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        this._addWorkingHrInfo(params.startTime, params.endTime, usr);
    };

    if(params.callback) {
        params.callback.run(result);
    }
};

ZmFreeBusyCache.prototype._addWorkingHrInfo =
function(startTime, endTime, usr) {
    var id = usr.id;
    if (usr.f) this._addWorkingHrSlot(usr.f, id, ZmFreeBusyCache.STATUS_WORKING_HRS);
    if (usr.u) this._addWorkingHrSlot(usr.u, id, ZmFreeBusyCache.STATUS_NON_WORKING_HRS);
    if (usr.n) this._addWorkingHrSlot(usr.n, id, ZmFreeBusyCache.STATUS_UNKNOWN);
};

ZmFreeBusyCache.prototype._addWorkingHrSlot =
function(slots, id, status) {
    var slotTime, slotDate, whKey, whSlots;
    for (var i = 0; i < slots.length; i++) {
        slotTime = slots[i].s;
        slotDate = new Date(slotTime);
        whKey = this.getWorkingHoursKey(id, slotDate.getDay());
        whSlots = this._workingHrs[whKey];
        if(!whSlots) {
            this._workingHrs[whKey] = whSlots = {id: id};
        }

        if(!whSlots[status]) {
            whSlots[status] = [];
        }
        whSlots[status].push(slots[i]);
    };
};


ZmFreeBusyCache.prototype._handleErrorWorkingHrs =
function(params, result) {
    if(params.errorCallback) {
        params.errorCallback.run(result);
    }
};

ZmFreeBusyCache.prototype._getWorkingHours =
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay, acct) {
    var soapDoc = AjxSoapDoc.create("GetWorkingHoursRequest", "urn:zimbraMail");
    soapDoc.setMethodAttribute("s", startTime);
    soapDoc.setMethodAttribute("e", endTime);
    soapDoc.setMethodAttribute("name", emailList);

    return appCtxt.getAppController().sendRequest({
        soapDoc: soapDoc,
        asyncMode: true,
        callback: callback,
        errorCallback: errorCallback,
        noBusyOverlay: noBusyOverlay,
        accountName: (acct ? acct.name : null)
    });
};

ZmFreeBusyCache.prototype.getWorkingHrsSlot =
function(startTime, endTime, id) {
    var whKey = this.getWorkingHoursKey(id, (new Date(startTime)).getDay());
    var whSlots = this._workingHrs[whKey] || {};
    var whResult = {id: id};

    if(whSlots[ZmFreeBusyCache.STATUS_WORKING_HRS]) whResult[ZmFreeBusyCache.STATUS_WORKING_HRS] = whSlots[ZmFreeBusyCache.STATUS_WORKING_HRS];
    if(whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HRS]) whResult[ZmFreeBusyCache.STATUS_NON_WORKING_HRS] = whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HRS];
    if(whSlots[ZmFreeBusyCache.STATUS_UNKNOWN]) whResult[ZmFreeBusyCache.STATUS_UNKNOWN] = whSlots[ZmFreeBusyCache.STATUS_UNKNOWN];

    return whResult;        
};

ZmFreeBusyCache.prototype._addWHInfo =
function(slots, id, status, startTime, endTime, whResult) {

    if(!whResult[status]) whResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        if(slots[i].s >= startTime && slots[i].e <= endTime) {
            whResult[status].push({s: slots[i].s, e: slots[i].e});
        }else if(slots[i].s >= startTime && slots[i].s  <= endTime) {
            whResult[status].push({s: slots[i].s, e: endTime});
        }else if(slots[i].e >= startTime && slots[i].e  <= endTime) {
            whResult[status].push({s: startTime, e: slots[i].e});
        }
    };

    if(whResult[status].length == 0) whResult[status] = null;
};