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

ZmFreeBusyCache.prototype.toString =
function() {
	return "ZmFreeBusyCache";
};

ZmFreeBusyCache.prototype.clearCache =
function() {
    DBG.println("clearing free busy cache");
    this._schedule = {};
};

ZmFreeBusyCache.prototype.getFreeBusyKey =
function(startTime, endTime, id) {
    return startTime + "-" + endTime + "-" + id;
};

ZmFreeBusyCache.prototype.getFreeBusySlot =
function(startTime, endTime, id) {
    var key = this.getFreeBusyKey(startTime, endTime, id);
    return this._schedule[key];    
};

ZmFreeBusyCache.prototype.getFreeBusyInfo =
function(params) {

    var requiredEmails = [], freeBusyKey, emails = params.emails;
    for (var i = emails.length; --i >= 0;) {
        freeBusyKey = this.getFreeBusyKey(params.startTime, params.endTime, emails[i]);
        //check local cache
        if(!this._schedule[freeBusyKey]) requiredEmails.push(emails[i]);
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

ZmFreeBusyCache.prototype._handleResponseFreeBusy =
function(params, result) {

    var freeBusyKey;
	var args = result.getResponse().GetFreeBusyResponse.usr;
    for (var i = 0; i < args.length; i++) {
		var usr = args[i];
        var id = usr.id;
        if (!id) {
            continue;
        }
        freeBusyKey = this.getFreeBusyKey(params.startTime, params.endTime, id);
        this._schedule[freeBusyKey] = usr;
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



