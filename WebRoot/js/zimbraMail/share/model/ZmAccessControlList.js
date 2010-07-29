/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines an access control list and associated classes.
 *
 */

/**
 * Creates an empty access control list (ACL).
 * @class
 * An access control list is a collection of access control entries (ACEs). Each entry contains
 * information about a certain permission applied by the current user to another user or users
 * for a particular type of action. So far, there are two types of rights that are managed in
 * this way:
 * 
 * <ul>
 * <li><b>viewFreeBusy</b> - governs whether other users may view this user's free/busy information</li>
 * <li><b>invite</b> - determines whether an invite from other users will automatically create a tentative appointment on this user's calendar</li>
 * </ul>
 * 
 * Note: that shared organizers ({@link ZmShare}) manage rights (read/write/manage) in their own way.
 * 
 * @author Conrad Damon
 * 
 * @param {Array}	aces		the list of {@link ZmAccessControlEntry} objects
 */
ZmAccessControlList = function(aces) {
	this._aces = {};
}

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccessControlList.prototype.toString =
function() {
	return "ZmAccessControlList";
};

/**
 * Loads the list.
 * 
 * @param	{AjxCallback}	callback	the function to callback after the loaded
 * 
 * @private
 */
ZmAccessControlList.prototype.load =
function(callback) {
	var jsonObj = {GetPermissionRequest:{_jsns:"urn:zimbraMail"}};
	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

/**
 * @private
 */
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

/**
 * Gets the access control entry by right.
 * 
 * @param	{String}	right		the right
 * @return	{ZmAccessControlEntry}	the entry
 */
ZmAccessControlList.prototype.getACLByRight =
function(right) {
	return this._aces[right];
};

/**
 * Gets the grantee type.
 * 
 * @param	{String}	right		the right
 * @return	{constant}	the grantee type (see <code>ZmSetting.ACL_</code> constants)
 * 
 * @see		ZmSetting
 */
ZmAccessControlList.prototype.getGranteeType =
function(right) {
	var aces = this._aces[right];
	var gt = ZmSetting.ACL_PUBLIC;
	
	var gtMap = {};
	if(aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = aces[i];
			DBG.println("<font color=red>ace:</font>" + (ace.negative?"-":"") + ace.granteeType +"," +  ace.grantee );
			var aceGranteeType =  (ace.granteeType == ZmSetting.ACL_USER || ace.granteeType == ZmSetting.ACL_GROUP)  ? ZmSetting.ACL_USER : ace.granteeType;
			gtMap[aceGranteeType] = ace.negative ? -1 : 1;
		}
	}
	
	var allowPublic = (gtMap[ZmSetting.ACL_PUBLIC] == 1);
	var denyPublic  = (gtMap[ZmSetting.ACL_PUBLIC] == -1);
	var allowLocal  = (gtMap[ZmSetting.ACL_AUTH] == 1);
	var denyLocal   = (gtMap[ZmSetting.ACL_AUTH] == -1);
	
	var allowUser = (gtMap[ZmSetting.ACL_USER] == 1);
	var allowNone = (denyPublic || denyLocal) && (gtMap[ZmSetting.ACL_USER] == null);
				
	if(allowPublic) {
		return ZmSetting.ACL_PUBLIC;
	}
	
	if(allowLocal) {
		return ZmSetting.ACL_AUTH;
	}
	
	if(denyPublic) {
		if(allowLocal) {
			return ZmSetting.ACL_AUTH;
		}
	}
	
	if(allowUser) {
		return ZmSetting.ACL_USER;
	}
	
	if(allowNone) {
		return ZmSetting.ACL_NONE;
	}
	return gt;
};

/**
 * Gets the access control entry by grantee type.
 * 
 * @param	{String}	right	the right
 * @param	{constant}	gt		the grantee type (see <code>ZmSetting.ACL_</code> constants)
 * @return	{Array}	an array of {@link ZmAccessControlEntry} objects
 */
ZmAccessControlList.prototype.getACLByGranteeType =
function(right, gt) {
	var aces = this._aces[right];
	var list = [];
	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = aces[i];
			if (ace.granteeType == gt) {
				list.push(ace);
			}
		}
	}
	list.sort();
	return list;
};

/**
 * Gets the grantees.
 * 
 * @param	{String}	right	the right
 * @return	{Array}		an array of grantees
 */
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

/**
 * Gets the grantees info.
 * 
 * @param	{String}	right		the right
 * @return	{Array}	an array of grantree info objects (obj.grantee, obj.zid)
 */
ZmAccessControlList.prototype.getGranteesInfo =
function(right) {
	var aces = this._aces[right];
	var list = [];
	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = aces[i];
			if (ace.granteeType == ZmSetting.ACL_USER || ace.granteeType == ZmSetting.ACL_GROUP) {
				list.push({grantee: ace.grantee, zid: ace.zid});
			}
		}
	}
	list.sort(ZmAccessControlList.sortByGrantee);
	return list;
};

/**
 * Grants permissions on the access control entries.
 * 
 * @param	{Array}	aces		an array of {@link ZmAccessControlEntry} objects
 * @param	{AjxCallback}	callback	the callback
 * @param	{Boolean}	batchCmd	<code>true</code> to submit as a batch command
 */
ZmAccessControlList.prototype.grant =
function(aces, callback, batchCmd) {
	this._setPerms(aces, false, callback, batchCmd);
};

/**
 * Revokes and denies permissions the access control entries.
 * 
 * @param	{Array}	aces		an array of {@link ZmAccessControlEntry} objects
 * @param	{AjxCallback}	callback	the callback
 * @param	{Boolean}	batchCmd	<code>true</code> to submit as a batch command
 */
ZmAccessControlList.prototype.revoke =
function(aces, callback, batchCmd) {
	this._setPerms(aces, true, callback, batchCmd);
};

/**
 * Sets the permissions.
 * 
 * @param	{Array}	aces		an array of {@link ZmAccessControlEntry} objects
 * @param	{Boolean}	revoke	<code>true</code> to deny; <code>false</code> to grant
 * @param	{AjxCallback}	callback	the callback
 * @param	{Boolean}	batchCmd	<code>true</code> to submit as a batch command
 *
 * @private
 */
ZmAccessControlList.prototype._setPerms =
function(aces, revoke, callback, batchCmd) {
	var reqName = revoke ? "RevokePermissionRequest" : "GrantPermissionRequest";
	var soapDoc = AjxSoapDoc.create(reqName, "urn:zimbraMail");
	for (var i = 0; i < aces.length; i++) {
		var ace = aces[i];
		var aceNode = soapDoc.set("ace");
		aceNode.setAttribute("right", ace.right);
		aceNode.setAttribute("gt", ace.granteeType);
		if(ace.grantee) {
			aceNode.setAttribute("d", ace.grantee);
		}
		if (ace.zid) {
			aceNode.setAttribute("zid", ace.zid);
		}
		if (ace.negative) {
			aceNode.setAttribute("deny", 1);
		}
	}
	var respCallback = new AjxCallback(this, this._handleResponseSetPerms, [revoke, callback]);
	if (batchCmd) {
		batchCmd.addNewRequestParams(soapDoc, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback});
	}
};

/**
 * @private
 */
ZmAccessControlList.prototype._handleResponseSetPerms =
function(revoke, callback, result) {
	var response = result.getResponse();
	var resp = revoke ? response.RevokePermissionResponse : response.GrantPermissionResponse;
	var aces = resp && resp.ace;
	var aceList = [];
	if (aces && aces.length) {
		for (var i = 0; i < aces.length; i++) {
			var ace = ZmAccessControlEntry.createFromDom(aces[i]);
			aceList.push(ace);
			if (revoke) {
				this.remove(ace);
			} else {
				this.update(ace);
			}
		}
	}

	if (callback) {
		callback.run(aceList);
	}
};

/**
 * Adds the entry to the ACL.
 * 
 * @param	{ZmAccessControlEntry}	ace	the entry to add
 */
ZmAccessControlList.prototype.add =
function(ace) {
	if (!ace) { return; }
	var right = ace.right;
	if (!this._aces[right]) {
		this._aces[right] = [];
	}
	this._aces[right].push(ace);
};

/**
 * Removes the entry to the ACL.
 * 
 * @param	{ZmAccessControlEntry}	ace	the entry to remove
 */
ZmAccessControlList.prototype.remove =
function(ace) {
	if (!ace) { return; }
	var list = this._aces[ace.right];
	var newList = [];
	if (list && list.length) {
		for (var i = 0; i < list.length; i++) {
			if (list[i].grantee != ace.grantee) {
				newList.push(list[i]);
			}
		}
	}
	this._aces[ace.right] = newList;
};

/**
 * Updates the entry to the ACL.
 * 
 * @param	{ZmAccessControlEntry}	ace	the entry to update
 * @param	{Boolean}	removeEnty	not used
 */
ZmAccessControlList.prototype.update =
function(ace, removeEntry) {
	if (!ace || !ace.right) { return; }
	var found = false;
	
	if(!this._aces[ace.right]) {
		this._aces[ace.right] = [];
	}

	var list = this._aces[ace.right];	
	if (list.length) {
		//search for ace to update
		for (var i = 0; i < list.length; i++) {
			if ((list[i].grantee == ace.grantee) && (list[i].granteeType == ace.granteeType)) {
				this._aces[ace.right][i] = ace;
				found = true;
			}
		}
	}
	if(!found) {
		//adding new entry to ace list
		this._aces[ace.right].push(ace);
	}
};

/**
 * Cleans up the ACL.
 * 
 */
ZmAccessControlList.prototype.cleanup =
function() {
	this._aces = {};
};

/**
 * Sorts the ACL by grantee.
 * 
 * @param	{Hash}	a		grantee "a"
 * @param	{String}	a.grantee	the grantee
 * @param	{Hash}	b		grantee "b"
 * @param	{Hash}	b.grantee		grantee "b"
 * @return	{int}	0 if "a" and "b" are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmAccessControlList.sortByGrantee =
function(a, b) {

    var granteeA = a.grantee || "";
    var granteeB = b.grantee || "";

    if (granteeA.toLowerCase() > granteeB.toLowerCase()) { return 1; }
    if (granteeA.toLowerCase() < granteeB.toLowerCase()) { return -1; }
    
	return 0;
};


/**
 * Creates an access control entry.
 * @class
 * An access control entry encapsulates the permission information pertaining to a user or users
 * regarding a certain right.
 * 
 * @param {Hash}	params		a hash of parameters
 * @param	{String}	params.right		the action governed by this ACE
 * @param	{String}	params.grantee		the account name of user or group permission applies to
 * @param	{String}	params.zid			the ZID of grantee
 * @param	{constant}	params.granteeType	type of grantee (see <code>ZmSetting.ACL_</code> constants)
 * @param	{Boolean}	params.negative		if <code>true</code>, permission is denied by this ACE
 * @see		ZmSetting
 */
ZmAccessControlEntry =
function(params) {
	this.grantee = params.grantee;
	this.zid = params.zid;
	this.granteeType = params.granteeType;
	this.right = params.right;
	this.negative = params.negative;
}

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccessControlEntry.prototype.toString =
function() {
	return "ZmAccessControlEntry";
};

/**
 * Creates an entry from the DOM object.
 * 
 * @param	{Hash}	obj		the DOM object
 * @param	{String}	obj.right		the action governed by this ACE
 * @param	{String}	obj.d		the account name of user or group permission applies to
 * @param	{String}	obj.zid			the ZID of grantee
 * @param	{constant}	obj.gt		the type of grantee (see <code>ZmSetting.ACL_</code> constants)
 * @param	{Boolean}	obj.deny		if <code>1</code>, permission is denied by this ACE
 * @return	{ZmAccessControlEntry}	the newly created entry
 */
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
