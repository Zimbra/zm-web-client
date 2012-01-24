/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @class
 * This class represents a list of domains that have shown up in email addresses.
 * 
 * @extends		ZmModel
 */
ZmDomainList = function() {
	ZmModel.call(this);
};

ZmDomainList.prototype = new ZmModel;
ZmDomainList.prototype.constructor = ZmDomainList;

ZmDomainList.prototype.isZmDomainList = true;
ZmDomainList.prototype.toString = function() { return "ZmDomainList"; };

ZmDomainList.DOMAIN_RE = new RegExp("\\.\\w{2,3}$");

/**
 * Gets a sorted list of domains matching the given string (if any).
 * 
 * @param {String}		str			the string to search for
 * @param {int}			limit		the max number of domains to return
 * @param {AjxCallback}	callback	the callback to run when response is received
 */
ZmDomainList.prototype.search =
function(str, limit, callback) {

	var jsonObj = {BrowseRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.BrowseRequest;
	request.browseBy = "domains";
	if (str && (/[a-z]/i.test(str))) {
		if (ZmDomainList.DOMAIN_RE.test(str)) {
			request.regex = [".*", AjxStringUtil.regExEscape(str), "$"].join("");
		} else {
			request.regex = ["^", str, ".*"].join("");
		}
	}
	if (limit) {
		request.maxToReturn = limit;
	}
	var respCallback = ZmDomainList._handleResponseSearch.bind(null, str, callback);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmDomainList._handleResponseSearch =
function(str, callback, result) {
	var domains = result.getResponse().BrowseResponse.bd;
	var list = [];
	if (domains) {
		for (var i = 0; i < domains.length; i++) {
			var domain = domains[i];
			list[i] = new ZmDomain(domain._content, domain.h);
		}
	}
	list.sort(ZmDomain.sortCompare);
	callback.run(list);
};




/**
 * @class
 * This class represents a domain.
 * 
 * @param	{String}	name			the name
 * @param	{String}	headerFlags		header flags (where domain was found)
 * 
 * @extends	ZmModel
 */
ZmDomain = function(name, headerFlags) {
	
	ZmModel.call(this);

	this.name = name.toLowerCase();
	this._headerFlags = headerFlags;
};

ZmDomain.prototype = new ZmModel;
ZmDomain.prototype.constructor = ZmDomain;

ZmDomain.prototype.isZmDomain = true;
ZmDomain.prototype.toString = function() { return "ZmDomain"; };


ZmDomain.ADDR_FLAG = {};
ZmDomain.ADDR_FLAG[AjxEmailAddress.FROM]	= "f";
ZmDomain.ADDR_FLAG[AjxEmailAddress.TO]		= "t";
ZmDomain.ADDR_FLAG[AjxEmailAddress.CC]		= "c";


/**
 * Compares two domains by name.
 * 
 * @param	{ZmDomain}	a		the first domain
 * @param	{ZmDomain}	b		the second domain
 * @return	{int}	0 if the domains match; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmDomain.sortCompare = 
function(a, b) {
	var check = ZmOrganizer.checkSortArgs(a, b);
	if (check != null) { return check; }

	if (a.name < b.name) { return -1; }
	if (a.name > b.name) { return 1; }
	return 0;
};

ZmDomain.prototype.hasAddress =
function(addressType) {
	var flag = ZmDomain.ADDR_FLAG[addressType];
	return flag && this._headerFlags && (this._headerFlags.indexOf(flag) != -1);
};
