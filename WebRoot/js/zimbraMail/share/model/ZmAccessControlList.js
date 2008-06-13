/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an empty access control list (ACL).
 * @constructor
 * @class
 * An access control list is a collection of access control entries (ACE's). Each entry contains
 * information about a certain permission applied by the current user to another user or users
 * for a particular type of action. So far, there are two types of rights that are managed in
 * this way:
 * 
 * 		viewFreeBusy	governs whether other users may view this user's free/busy information
 * 		invite			whether an invite from other users will automatically create a tentative
 * 						appointment on this user's calendar
 * 
 * Note that shared organizers (ZmShare) manage rights (read/write/manage) in their own way.
 * 
 * @author Conrad Damon
 * 
 * @param aces		[array]*		list of ZmAccessControlEntry objects
 */
ZmAccessControlList = function(aces) {
	this._aces = {};
}

ZmAccessControlList.prototype.toString =
function() {
	return "ZmAccessControlList";
};

ZmAccessControlList.prototype.load =
function(callback) {
	var jsonObj = {GetPermissionRequest:{_jsns:"urn:zimbraMail"}};
	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAccessControlList.prototype._handleResponseLoad =
function(callback, result) {
	var response = result.getResponse();
	var aces = response.GetPermissionResponse.ace;
	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			this.add(ZmAccessControlEntry.createFromDom(aces[i]));
		}
	}
	if (callback) {
		callback.run();
	}
};

ZmAccessControlList.prototype.getACLByRight =
function(right) {
	return this._aces[right];
};

ZmAccessControlList.prototype.getGranteeType =
function(right) {
	var aces = this._aces[right];
	return (aces && aces.length && (aces[0].granteeType == ZmSetting.ACL_USER || ace.granteeType == ZmSetting.ACL_GROUP)) ?
		ZmSetting.ACL_USER : ZmSetting.ACL_PUBLIC;
};

ZmAccessControlList.prototype.getGrantees =
function(right) {
	var aces = this._aces[right];
	var list = [];
	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = aces[i];
			if (ace.granteeType == ZmSetting.ACL_USER || ace.granteeType == ZmSetting.ACL_GROUP) {
				list.push(ace.grantee);
			}
		}
	}
	list.sort();
	return list;
};

ZmAccessControlList.prototype.grant =
function(aces, callback, batchCmd) {
	this._setPerms(aces, false, callback, batchCmd);
};

ZmAccessControlList.prototype.revoke =
function(aces, callback, batchCmd) {
	this._setPerms(aces, true, callback, batchCmd);
};

ZmAccessControlList.prototype._setPerms =
function(aces, revoke, callback, batchCmd) {
	var reqName = revoke ? "RevokePermissionRequest" : "GrantPermissionRequest";
	var soapDoc = AjxSoapDoc.create(reqName, "urn:zimbraMail");
	for (var i = 0; i < aces.length; i++) {
		var ace = aces[i];
		var aceNode = soapDoc.set("ace");
		aceNode.setAttribute("right", ace.right);
		aceNode.setAttribute("gt", ace.granteeType);
		aceNode.setAttribute("d", ace.grantee);
		if (ace.zid) {
			aceNode.setAttribute("zid", ace.zid);
		}
		if (ace.negative) {
			aceNode.setAttribute("deny", 1);
		}
	}
	var respCallback = new AjxCallback(this, this._handleResponseSetPerms, [callback]);
	if (batchCmd) {
		batchCmd.addNewRequestParams(soapDoc, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

ZmAccessControlList.prototype._handleResponseSetPerms =
function(callback, result) {
	if (callback) {
		callback.run();
	}
};

ZmAccessControlList.prototype.add =
function(ace) {
	if (!ace) { return; }
	var right = ace.right;
	if (!this._aces[right]) {
		this._aces[right] = [];
	}
	this._aces[right].push(ace);
};

ZmAccessControlList.prototype.remove =
function(ace) {
	if (!ace) { return; }
	var list = this._aces[ace.right];
	if (list && list.length) {
		var newList = [];
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];

		}
	}
};

/**
 * Creates an access control entry.
 * @constructor
 * @class
 * An access control entry encapsulates the permission information pertaining to a user or users
 * regarding a certain right.
 * 
 * @param params		[hash]		hash of params:
 *        right			[string]	action governed by this ACE
 *        grantee		[string]*	account name of user or group permission applies to
 *        zid			[string]	ZID of grantee
 *        granteeType	[constant]	type of grantee - one of ZmSetting.ACL_*
 *        negative		[boolean]*	if true, permission is denied by this ACE
 */
ZmAccessControlEntry =
function(params) {
	this.grantee = params.grantee;
	this.zid = params.zid;
	this.granteeType = params.granteeType;
	this.right = params.right;
	this.negative = params.negative;
}

ZmAccessControlEntry.prototype.toString =
function() {
	return "ZmAccessControlEntry";
};

ZmAccessControlEntry.createFromDom =
function(obj) {
	var params = {};
	params.grantee = obj.d;
	params.granteeType = obj.gt;
	params.zid = obj.zid;
	params.right = obj.right;
	params.negative = (obj.deny == "1");
	
	return new ZmAccessControlEntry(params);
};
