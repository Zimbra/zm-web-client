/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * @overview
 * 
 * This file accesses the set of system retention policies
 *
 */

ZmSystemRetentionPolicy = function() {
};

ZmSystemRetentionPolicy.prototype.constructor = ZmSystemRetentionPolicy;

ZmSystemRetentionPolicy.prototype.toString =
function() {
	return "ZmSystemRetentionPolicy";
};

ZmSystemRetentionPolicy.prototype.getKeepPolicies =
function() {
	return this._keepPolicies;
};

ZmSystemRetentionPolicy.prototype.getPurgePolicies =
function() {
	return this._purgePolicies;
};


// Read the system retention policies from the server
ZmSystemRetentionPolicy.prototype.getPolicies =
function(callback, batchCmd) {
    this._keepPolicies  = new Array();
    this._purgePolicies = new Array();

    var jsonObj = {GetSystemRetentionPolicyRequest:{_jsns:"urn:zimbraMail"}};
    var request = jsonObj.GetSystemRetentionPolicyRequest;
    var respCallback = this._handleResponseGetPolicies.bind(this, callback);
    if (batchCmd) {
        batchCmd.addRequestParams(jsonObj, respCallback);
    } else {
        appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
    }
};



ZmSystemRetentionPolicy.prototype._handleResponseGetPolicies =
function(callback, result) {
	var resp = result.getResponse().GetSystemRetentionPolicyResponse;
    if (resp.retentionPolicy) {
        if (resp.retentionPolicy[0].keep && resp.retentionPolicy[0].keep[0] &&
            resp.retentionPolicy[0].keep[0].policy) {
            this._keepPolicies = resp.retentionPolicy[0].keep[0].policy;
        }
        if (resp.retentionPolicy[0].purge && resp.retentionPolicy[0].purge[0] &&
            resp.retentionPolicy[0].purge[0].policy) {
            this._purgePolicies = resp.retentionPolicy[0].purge[0].policy;
        }
    }
	if (callback) {
		callback.run(this._keepPolicies, this._purgePolicies);
	}
};
