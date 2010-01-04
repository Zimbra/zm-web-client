/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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
 * Create a new, empty calendar resources list.
 * @constructor
 * @class
 * This class represents a list of calendar resources. A calendar resource can be a
 * location or a piece of equipment. All calendar resource records are stored in the GAL.
 *
 * @author Conrad Damon
 *
 * @param resType	[constant]		type of resources (location or equipment)
 * @param search	[ZmSearch]*		search that generated this list
 */
ZmResourceList = function(resType, search) {
	ZmContactList.call(this, search, true, ZmItem.RESOURCE);

	this.resType = resType;
	
	this._nameToResource = {};
	this._emailToResource = {};
	this._acMatchFields = ZmResourceList.AC_FIELDS;
};

ZmResourceList.ATTRS =
	[ZmResource.F_name, ZmResource.F_mail, ZmResource.F_type, ZmResource.F_locationName,
	 ZmResource.F_capacity, ZmResource.F_contactMail, ZmContact.F_description];

ZmResourceList.AC_FIELDS = [ZmResource.F_name];

ZmResourceList.prototype = new ZmContactList;
ZmResourceList.prototype.constructor = ZmResourceList;

ZmResourceList.prototype.toString =
function() {
	return "ZmResourceList";
};

ZmResourceList.prototype.load =
function(batchCmd) {
	var conds = [];
	var value = (this.resType == ZmCalBaseItem.LOCATION) ? ZmResource.ATTR_LOCATION : ZmResource.ATTR_EQUIPMENT;
	conds.push({attr: ZmResource.F_type, op: "eq", value: value});
	var params = {conds: conds, join: ZmSearch.JOIN_OR, attrs: ZmResourceList.ATTRS};
	var search = new ZmSearch(params);
	
	search.execute({callback: new AjxCallback(this, this._handleResponseLoad), batchCmd: batchCmd});
};

ZmResourceList.prototype._handleResponseLoad = 
function(result) {
	var resp = result.getResponse();
	this._vector = resp.getResults(ZmItem.RESOURCE).getVector();
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		var resource = a[i];
		this.updateHashes(resource);
		this._preMatch(resource);
		this._idHash[resource.id] = resource;
	}
	//bug:16436 this._loaded changed to this.isLoaded 
	this.isLoaded = true;
	this._galAutocompleteEnabled = false;
};

ZmResourceList.prototype.updateHashes = 
function(resource) {
	var name = resource.getFullName();
	if (name) {
		this._nameToResource[name.toLowerCase()] = resource;
	}
	var email = resource.getEmail();
	if (email) {
		this._emailToResource[email.toLowerCase()] = resource;
	}
};

// Override so we don't invoke ZmContactList.addFromDom
ZmResourceList.prototype.addFromDom =
function(node, args) {
	ZmList.prototype.addFromDom.call(this, node, args);
};

/**
* Returns the resource with the given name, if any. Canonical list only.
* Since names aren't guaranteed to be unique, this returns the last resource
* with the given name.
*
* @param name	[string]	a resource name
*/
ZmResourceList.prototype.getResourceByName = 
function(name) {
	if (!name || !this.isCanonical) return null;

	return this._nameToResource[name.toLowerCase()];
};

/**
* Returns the resource with the given address, if any. Canonical list only.
*
* @param address	[string]	an email address
*/
ZmResourceList.prototype.getResourceByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	return this._emailToResource[address.toLowerCase()];
};

/**
* Returns true if the given string maps to a single resource. Used by autocomplete.
* We match names, and names are not guaranteed unique, so return false.
*
* @param str		string to test for uniqueness
*/
ZmResourceList.prototype.isUniqueValue =
function(str) {
	return false;
};

/**
 * Returns true if the given string is a valid resource name.
 * 
 * @param str	[string]	a string
 */
ZmResourceList.prototype.isComplete =
function(str) {
	return (this.getResourceByName(str) != null);
};

/*
 * Fetches GAL matches for the given string from the server.
 *
 * @param str		[string]	string to match against
 */
ZmResourceList.prototype._getGalMatches =
function(str, aclv, callback) {

	var conds = [];
	conds.push({attr:ZmResource.F_name, op:"startswith", value:str});
	var resType = (this.resType == ZmCalBaseItem.LOCATION) ? ZmResource.ATTR_LOCATION : ZmResource.ATTR_EQUIPMENT;
	conds.push({attr:ZmResource.F_type, op:"eq", value:resType});
	var attrs = [ZmResource.F_name, ZmResource.F_mail];
	var params = {conds:conds, attrs:attrs, limit:ZmContactList.AC_MAX};
	var search = new ZmSearch(params);
	var respCallback = new AjxCallback(this, this._handleResponseGetGalMatches, [str, aclv, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorGetGalMatches, [str, aclv, callback]);
	search.execute({callback: respCallback, errorCallback: errorCallback, timeout: ZmContactList.AC_GAL_TIMEOUT,
					noBusyOverlay: true});
};

ZmResourceList.prototype._handleResponseGetGalMatches =
function(str, aclv, callback, result) {
	aclv.setWaiting(false);

	var resp = result.getResponse();

	this._galResults[str] = {};

	var list = resp.getResults(ZmItem.RESOURCE);
	var a = list ? list.getArray() : [];
	var hasMore = false;
	if (a.length > ZmContactList.AC_MAX) {
		a = a.slice(0, ZmContactList.AC_MAX);
		hasMore = true;
	}

	this._acAddrList[str] = this._acAddrList[str] || [];
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		this._acAddrList[str].push(contact);
		var email = contact.getAttr(ZmResource.F_mail);
		if (email) {
			this._emailToContact[email] = contact;
		}
	}

	this._acAddrList[str].hasGalMatches = (a.length > 0);
	this._acAddrList[str].galMatchingDone = true;

	this._galResults[str].ts = (new Date()).getTime();
	this._galResults[str].more = hasMore;

	callback.run();
};

/*
* Creates the matching object(s) for a particular matched contact. If a contact has multiple
* email addresses and didn't match on one of them (it matched on a name), then a matching
* object will be created for each email address.
*
* @param id		[int]		ID of matched contact
* @param str	[string]	string that was matched
*/
ZmResourceList.prototype._getMatches =
function(id, str) {
	var resource = (id instanceof ZmContact) ? id : this.getById(id);
	var match = this._testAcMatch(resource, str, true);
	if (!match) {
		DBG.println(AjxDebug.DBG1, "Matched resource with ID " + resource.id + " no longer matches '" + str);
		return null;
	}

	var matchObj = this._createMatch(match, resource);

	return [matchObj];	
};

/*
* Creates a match object from the given fields.
*
* @param match		[object]		info from the match
* @param resource	[ZmResource]	the resource that was matched
*/
ZmResourceList.prototype._createMatch =
function(match, resource) {
	var result = {};
	result.item = resource;
	result.text = match.savedMatch;
	result.plain = result.text ? result.text.replace(/<\/?b>/g, "") : "";	// for sorting results
	result[ZmContactsApp.AC_VALUE_EMAIL] = resource.getEmail();
	result[ZmContactsApp.AC_VALUE_NAME] = resource.getFullName();

	return result;
};
