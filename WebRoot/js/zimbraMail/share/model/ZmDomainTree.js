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
 * @overview
 * 
 * This file defines a domain.
 *
 */

/**
 * Creates an empty domain tree.
 * @class
 * This class represents a collection of domains that have shown up in email addresses.
 * It's not actually parsed into tree form, so it's just a flat list.
 * 
 * @extends		ZmModel
 */
ZmDomainTree = function() {
	ZmModel.call(this);
};

ZmDomainTree.prototype = new ZmModel;
ZmDomainTree.prototype.constructor = ZmDomainTree;

ZmDomainTree._searchResults = {};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmDomainTree.prototype.toString = 
function() {
	return "ZmDomainTree";
};

/**
 * Gets the root domain.
 * 
 * @return	{ZmDomain}	the domain
 */
ZmDomainTree.prototype.getRootDomain =
function() {
	return this._rootDomain;
};

/**
 * Loads all domains underneath the root domain of this tree.
 * 
 * @param {AjxCallback}	callback		the callback to run when response is received
 * 
 * @deprecated		use {@link ZmDomainTree.search} instead
 * @see		#search
 */
ZmDomainTree.prototype.load =
function(callback) {
	this._rootDomain = new ZmDomain(".", null, "");

	var jsonObj = {BrowseRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.BrowseRequest;
	request.browseBy = "domains";
	var respCallback = new AjxCallback(this, this._handleResponseLoad, callback);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

/**
 * @private
 */
ZmDomainTree.prototype._handleResponseLoad =
function(callback, result) {
	var domains = result.getResponse().BrowseResponse.bd;
	if (domains) {
		for (var i = 0; i < domains.length; i++) {
			this._rootDomain.addSubDomain(domains[i]._content, domains[i].h);
		}
	}

	if (callback) {
		callback.run(result);
	}
};

/**
 * Gets a sorted list of domains matching the given string (if any).
 * 
 * @param {String}	str			the string to search for
 * @param {int}	limit			the max number of domains to return
 * @param {AjxCallback}	callback		the callback to run when response is received
 */
ZmDomainTree.search =
function(str, limit, callback) {
	if (ZmDomainTree._searchResults[str]) {
		callback.run(ZmDomainTree._searchResults[str]);
		return;
	}
	var jsonObj = {BrowseRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.BrowseRequest;
	request.browseBy = "domains";
	if (str && (/[a-z]/i.test(str))) {
		if (/\.\w{2,3}$/.test(str)) {
			request.regex = [".*", AjxStringUtil.regExEscape(str), "$"].join("");
		} else {
			request.regex = ["^", str, ".*"].join("");
		}
	}
	if (limit) {
		request.maxToReturn = limit;
	}
	var respCallback = new AjxCallback(null, ZmDomainTree._handleResponseSearch, [str, callback]);
	appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

/**
 * @private
 */
ZmDomainTree._handleResponseSearch =
function(str, callback, result) {
	var domains = result.getResponse().BrowseResponse.bd;
	var list = [];
	if (domains) {
		for (var i = 0; i < domains.length; i++) {
			var domain = domains[i];
			list[i] = new ZmDomain(domain._content, null, domain.h);
		}
	}
	list.sort(ZmDomain.sortCompare);
	ZmDomainTree._searchResults[str] = list;
	callback.run(list);
};

/**
 * Resets and clears the search results cache.
 * 
 */
ZmDomainTree.reset =
function() {
	for (var str in ZmDomainTree._searchResults) {
		ZmDomainTree._searchResults[str] = null;
	}
	ZmDomainTree._searchResults = {};
};
