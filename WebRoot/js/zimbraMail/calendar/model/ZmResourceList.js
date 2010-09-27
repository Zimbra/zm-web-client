/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Create a new, empty calendar resources list.
 * @constructor
 * @class
 * This class represents a list of calendar resources. A calendar resource can be a
 * location or a piece of equipment. All calendar resource records are stored in the GAL.
 *
 * @author Conrad Damon
 *
 * @param {constant}	resType	the type of resources (location or equipment)
 * @param {ZmSearch}	search	the search that generated this list
 * 
 * @extends		ZmContactList
 * 
 * @see		ZmCalBaseItem
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
	 ZmResource.F_capacity, ZmResource.F_contactMail, ZmResource.F_description];

ZmResourceList.prototype = new ZmContactList;
ZmResourceList.prototype.constructor = ZmResourceList;

ZmResourceList.prototype.toString =
function() {
	return "ZmResourceList";
};

/**
 * Loads the list.
 * 
 * @param	{ZmBatchCommand}	batchCmd		the batch command
 */
ZmResourceList.prototype.load =
function(batchCmd) {
	var conds = [];
	var value = (this.resType == ZmCalBaseItem.LOCATION) ? ZmResource.ATTR_LOCATION : ZmResource.ATTR_EQUIPMENT;
	conds.push({attr: ZmResource.F_type, op: "eq", value: value});
	var params = {conds: conds, join: ZmSearch.JOIN_OR, attrs: ZmResourceList.ATTRS};
    if(batchCmd) {
        var search = new ZmSearch(params);        
	    search.execute({callback: new AjxCallback(this, this._handleResponseLoad), batchCmd: batchCmd});
    }else{
        this.searchCalResources(params);
    }
};

/**
 * Searches the calendar resources.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmResourceList.prototype.searchCalResources =
function(params) {
    var soapDoc = AjxSoapDoc.create("SearchCalendarResourcesRequest", "urn:zimbraAccount");
    var method = soapDoc.getMethod();
    if (params.attrs) {
        var attrs = [].concat(params.attrs);
        AjxUtil.arrayRemove(attrs, "fullName");
        method.setAttribute("attrs", attrs.join(","));
    }
    var searchFilterEl = soapDoc.set("searchFilter");
    if (params.conds && params.conds.length) {
        var condsEl = soapDoc.set("conds", null, searchFilterEl);
        if (params.join == ZmSearch.JOIN_OR) {
            condsEl.setAttribute("or", 1);
        }
        for (var i = 0; i < params.conds.length; i++) {
            var cond = params.conds[i];
            if (cond.attr=="fullName" && cond.op=="has") {
                var nameEl = soapDoc.set("name", cond.value);
            } else {
                var condEl = soapDoc.set("cond", null, condsEl);
                condEl.setAttribute("attr", cond.attr);
                condEl.setAttribute("op", cond.op);
                condEl.setAttribute("value", cond.value);
            }
        }
    }

    var response = appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:false,
        timeout:params.timeout, noBusyOverlay:params.noBusyOverlay});
    var result = new ZmCsfeResult(response, false);

    var search = new ZmSearch(params);
    search.isCalResSearch = true;

    var searchResult = new ZmSearchResult(search);
    searchResult.set(response.SearchCalendarResourcesResponse);
    result.set(searchResult);
    
    this._handleResponseLoad(result);
};

ZmResourceList.prototype._handleResponseLoad = 
function(result) {
	var resp = result.getResponse();
	this._vector = resp.getResults(ZmItem.RESOURCE).getVector();
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		var resource = a[i];
		this._updateHashes(resource);
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
 * Gets the resource with the given name, if any. Canonical list only.
 * Since names aren't guaranteed to be unique, this returns the last resource
 * with the given name.
 *
 * @param {String}	name	the resource name
 * @return	{ZmResource}	the resource or <code>null</code> if not found
 */
ZmResourceList.prototype.getResourceByName = 
function(name) {
	if (!name || !this.isCanonical) return null;

	return this._nameToResource[name.toLowerCase()];
};

/**
 *Gets the resource with the given address, if any. Canonical list only.
 *
 * @param {String}	address	an email address
 * @return	{ZmResource}	the resource or <code>null</code> if not found
 */
ZmResourceList.prototype.getResourceByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	return this._emailToResource[address.toLowerCase()];
};
