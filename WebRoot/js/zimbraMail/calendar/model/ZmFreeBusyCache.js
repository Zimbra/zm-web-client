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
ZmFreeBusyCache.STATUS_OUT = 'u';
ZmFreeBusyCache.STATUS_FREE = 'f';

ZmFreeBusyCache.STATUS_WORKING_HOURS = 'f';
ZmFreeBusyCache.STATUS_NON_WORKING_HOURS = 'u';
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
function(startTime, endTime, id, excludeTimeSlots) {
    var slotDate = new Date(startTime);
    slotDate.setHours(0, 0, 0, 0);

    var fbSlots = this._schedule[id] || [];
    var fbResult = {id: id};

    //free busy response is always merged
    var usr, searchRange, newSearchIsInRange;
    for(var i= fbSlots.length; --i >= 0;) {
        usr = fbSlots[i];
        searchRange = usr.searchRange;

        if(searchRange) {
            newSearchIsInRange = (startTime >= searchRange.startTime && endTime <= searchRange.endTime);
            if(!newSearchIsInRange) continue;
        }

        if (usr.n) this._addFBInfo(usr.n, id, ZmFreeBusyCache.STATUS_UNKNOWN, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.t) this._addFBInfo(usr.t, id, ZmFreeBusyCache.STATUS_TENTATIVE, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.b) this._addFBInfo(usr.b, id, ZmFreeBusyCache.STATUS_BUSY, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.u) this._addFBInfo(usr.u, id, ZmFreeBusyCache.STATUS_OUT, startTime, endTime, fbResult, excludeTimeSlots);
        if (usr.f) this._addFBInfo(usr.f, id, ZmFreeBusyCache.STATUS_FREE, startTime, endTime, fbResult, excludeTimeSlots);
    }

    return fbResult;
};

ZmFreeBusyCache.prototype._addFBInfo =
function(slots, id, status, startTime, endTime, fbResult, excludeTimeSlots) {

    if(!fbResult[status]) fbResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        var fbSlot;
        if(slots[i].s >= startTime && slots[i].e  <= endTime) {
            fbSlot = {s: slots[i].s, e: slots[i].e};
        }else if(startTime >= slots[i].s && endTime  <= slots[i].e) {
            fbSlot = {s: startTime, e: endTime};
        }else if(startTime >= slots[i].s && startTime  <= slots[i].e) {
            fbSlot = {s: startTime, e: slots[i].e};
        }else if(endTime >= slots[i].s && endTime  <= slots[i].e) {
            fbSlot = {s: slots[i].s, e: endTime};
        }

        if(fbSlot) {
            if(excludeTimeSlots && status != ZmFreeBusyCache.STATUS_FREE && status != ZmFreeBusyCache.STATUS_UNKNOWN) {
                this._addByExcludingTime(excludeTimeSlots, fbSlot, fbResult, status);
            }else {
                fbResult[status].push(fbSlot);
            }
        }
    };

    if(fbResult[status].length == 0) fbResult[status] = null;
};

ZmFreeBusyCache.prototype._addByExcludingTime =
function(excludeTimeSlots, fbSlot, fbResult, status) {
    var startTime =  excludeTimeSlots.s;
    var endTime =  excludeTimeSlots.e;
    var newFBSlot;

    if(fbSlot.s == startTime && fbSlot.e == endTime) {
        return;
    }

    if(fbSlot.s < startTime && fbSlot.e > endTime) {
        fbResult[status].push({s: fbSlot.s, e: startTime});
        newFBSlot = {s: endTime, e: fbSlot.e};
    }else if(fbSlot.s < startTime && fbSlot.e >= startTime) {
        newFBSlot = {s: fbSlot.s, e: startTime};
    }else if(fbSlot.s <= endTime && fbSlot.e > endTime) {
        newFBSlot = {s: endTime, e: fbSlot.e};
    }else if(fbSlot.s <= startTime && fbSlot.e <= startTime) {
        newFBSlot = {s: fbSlot.s, e: fbSlot.e};
    }else if(fbSlot.s >= endTime && fbSlot.e >= endTime) {
        newFBSlot = {s: fbSlot.s, e: fbSlot.e};
    }

    if(newFBSlot) {
        fbResult[status].push(newFBSlot);
    }
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
                                     params.account,
                                     params.excludedId);
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
	var args = result.getResponse().GetFreeBusyResponse.usr || [];
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        if(!this._schedule[id]) {
            this._schedule[id] = [];
        }

        usr.searchRange = {startTime: params.startTime,  endTime: params.endTime};
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
function(startTime, endTime, emailList, callback, errorCallback, noBusyOverlay, acct, excludedId) {
	var soapDoc = AjxSoapDoc.create("GetFreeBusyRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", startTime);
	soapDoc.setMethodAttribute("e", endTime);
	soapDoc.setMethodAttribute("uid", emailList);
	if (excludedId) {
		soapDoc.setMethodAttribute("excludeUid", excludedId);
	}

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
	var args = result.getResponse().GetWorkingHoursResponse.usr || [];
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
    if (usr.f) this._addWorkingHrSlot(usr.f, id, ZmFreeBusyCache.STATUS_WORKING_HOURS);
    if (usr.u) this._addWorkingHrSlot(usr.u, id, ZmFreeBusyCache.STATUS_NON_WORKING_HOURS);
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

        //unknown working hours slots will be compressed on server response (will send one accumulated slots)
        if(status == ZmFreeBusyCache.STATUS_UNKNOWN) {
            this._workingHrs[id] = whSlots;
        }
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

    //handle the case where the working hours are not available and slot dates are accumulated
    var unknownSlots = this._workingHrs[id];
    if(unknownSlots) {
        return unknownSlots;
    }

    if(whSlots[ZmFreeBusyCache.STATUS_WORKING_HOURS]) whResult[ZmFreeBusyCache.STATUS_WORKING_HOURS] = whSlots[ZmFreeBusyCache.STATUS_WORKING_HOURS];
    if(whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS]) whResult[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS] = whSlots[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS];
    if(whSlots[ZmFreeBusyCache.STATUS_UNKNOWN]) whResult[ZmFreeBusyCache.STATUS_UNKNOWN] = whSlots[ZmFreeBusyCache.STATUS_UNKNOWN];

    if(!whResult[ZmFreeBusyCache.STATUS_WORKING_HOURS] && !whResult[ZmFreeBusyCache.STATUS_NON_WORKING_HOURS] && !whResult[ZmFreeBusyCache.STATUS_UNKNOWN]) return null;
    return whResult;        
};

ZmFreeBusyCache.prototype._addWHInfo =
function(slots, id, status, startTime, endTime, whResult) {

    if(!whResult[status]) whResult[status] = [];

    for (var i = 0; i < slots.length; i++) {
        if(startTime >= slots[i].s && endTime <= slots[i].e) {
            whResult[status].push({s: startTime, e: endTime});
        }else if(slots[i].s >= startTime && slots[i].e <= endTime) {
            whResult[status].push({s: slots[i].s, e: slots[i].e});
        }else if(slots[i].s >= startTime && slots[i].s  <= endTime) {
            whResult[status].push({s: slots[i].s, e: endTime});
        }else if(slots[i].e >= startTime && slots[i].e  <= endTime) {
            whResult[status].push({s: startTime, e: slots[i].e});
        }
    };

    if(whResult[status].length == 0) whResult[status] = null;
};

/**
 * converts working hours in different time base to required or current time base
 * this is done due to the fact that working hrs pattern repeat everyweek and
 * working hours are not fetched for every date change to optimize client code
 * @param slot  {object} working hrs slot with start and end time in milliseconds
 * @param relativeDate {date} optional date object relative to which the slot timings are converted
 */
ZmFreeBusyCache.prototype.convertWorkingHours =
function(slot, relativeDate) {
    relativeDate = relativeDate || new Date();
    var slotStartDate = new Date(slot.s);
    var slotEndDate = new Date(slot.e);
    var dur = slot.e - slot.s;
    slot.s = (new Date(relativeDate.getTime())).setHours(slotStartDate.getHours(), slotStartDate.getMinutes(), 0, 0);
    slot.e = slot.s + dur;
};
