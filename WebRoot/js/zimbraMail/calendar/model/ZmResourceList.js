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
	this._app = appCtxt.getApp(ZmApp.CALENDAR);
};

ZmResourceList.ATTRS =
	[ZmResource.F_name, ZmResource.F_mail, ZmResource.F_type, ZmResource.F_locationName,
	 ZmResource.F_capacity, ZmResource.F_contactMail, ZmContact.F_description];

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
		this._updateHashes(resource);
		this._preMatch(resource);
		this._idHash[resource.id] = resource;
	}
	//bug:16436 this._loaded changed to this.isLoaded 
	this.isLoaded = true;
	this._galAutocompleteEnabled = false;
};

ZmResourceList.prototype._updateHashes =
function(resource) {
	this._app.updateResourceCache(resource);
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
