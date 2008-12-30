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
 * Creates and initializes support for server-based autocomplete.
 * @constructor
 * @class
 * Manages autocompletion via AutoCompleteRequest calls to the server.
 *
 * @author Conrad Damon
 */
ZmAutocomplete = function() {
	this._acRequests = {};		// request mgmt (timeout, cancel)
	this._acCache = {};			// results cache
};

// choices for text in the returned match object
ZmAutocomplete.AC_VALUE_FULL 	= "fullAddress";
ZmAutocomplete.AC_VALUE_EMAIL	= "email";
ZmAutocomplete.AC_VALUE_NAME	= "name";

// request control
ZmAutocomplete.AC_MAX 			= 20;	// max # of autocomplete matches to return
ZmAutocomplete.AC_TIMEOUT		= 20;	// autocomplete timeout (in seconds)

// result types
ZmAutocomplete.AC_TYPE_CONTACT		= "contact";
ZmAutocomplete.AC_TYPE_GAL			= "gal";
ZmAutocomplete.AC_TYPE_GROUP		= "group";
ZmAutocomplete.AC_TYPE_UNKNOWN		= "unknown";
ZmAutocomplete.AC_TYPE_LOCATION		= "Location";	// same as ZmResource.ATTR_LOCATION
ZmAutocomplete.AC_TYPE_EQUIPMENT	= "Equipment";	// same as ZmResource.ATTR_EQUIPMENT

// icons
ZmAutocomplete.AC_ICON = {};
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_CONTACT]	= "Contact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_GAL]		= "GALContact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_GROUP]	= "Group";

// cache control
ZmAutocomplete.GAL_RESULTS_TTL	= 900000;	// time-to-live for cached GAL autocomplete results

/**
 * Returns a list of matching contacts for a given string. The first name, last
 * name, full name, first/last name, and email addresses are matched against.
 *
 * @param str		[string]					string to match against
 * @param callback	[AjxCallback]				callback to run with results
 * @param aclv		[ZmAutocompleteListView]*	needed to show wait msg
 * @param options	[hash]*						additional options:
 *        types		[list]*						list of acceptable results types
 */
ZmAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options) {

	str = str.toLowerCase();
	this._curAcStr = str;
	DBG.println("ac", "begin autocomplete for " + str);

	if (options && options.types) {
		options.typeHash = {};
		for (var i = 0; i < options.types.length; i++) {
			options.typeHash[options.types[i]] = true;
		}
	}

	var list = this._checkCache(str);
	if (list !== null) {
		list = this._checkType(list, options && options.typeHash);
		this._handleResponseAutocompleteMatch(str, callback, list);
		return;
	}

	aclv.setWaiting(true);
	var respCallback = new AjxCallback(this, this._handleResponseAutocompleteMatch, [str, callback]);
	this._doAutocomplete(str, aclv, options, respCallback);
};

ZmAutocomplete.prototype._handleResponseAutocompleteMatch =
function(str, callback, list) {
	// return results - we check str against curAcStr because we want to make sure
	// that we're returning results for the most recent (current) query
	if (str == this._curAcStr) {
		callback.run(list);
	}
};

/**
 * Fetches autocomplete matches for the given string from the server.
 *
 * @param str		[string]					string to match against
 * @param aclv		[ZmAutocompleteListView]	autocomplete popup
 * @param options
 * @param callback	[AjxCallback]				callback to run with results
 */
ZmAutocomplete.prototype._doAutocomplete =
function(str, aclv, options, callback) {
	// cancel any outstanding requests for strings that are substrings of this one
	for (var substr in this._acRequests) {
		if (str != substr && str.indexOf(substr) === 0) {
			DBG.println("ac", "canceling autocomplete request for '" + substr + "' due to request for '" + str + "'");
			appCtxt.getAppController().cancelRequest(this._acRequests[substr], null, true);
			delete this._acRequests[str];
		}
	}

	var params = {query:str, limit:ZmAutocomplete.AC_MAX, isAutocompleteSearch:true};
	var types = options && options.typeHash;
	if (types && (types[ZmAutocomplete.AC_TYPE_LOCATION] || types[ZmAutocomplete.AC_TYPE_EQUIPMENT])) {
		params.isGalAutocompleteSearch = true;
		params.isAutocompleteSearch = false;
		params.limit = params.limit * 2;
		params.types = AjxVector.fromArray([ZmItem.CONTACT]);
		params.galType = ZmSearch.GAL_RESOURCE;
	}

	DBG.println("ac", "AutoCompleteRequest: " + str);
	var search = new ZmSearch(params);
	var respCallback = new AjxCallback(this, this._handleResponseDoAutocomplete, [str, aclv, options, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorDoAutocomplete, [str, aclv]);
	this._acRequests[str] = search.execute({callback:respCallback, errorCallback:errorCallback,
											timeout:ZmAutocomplete.AC_TIMEOUT, noBusyOverlay:true});
};

ZmAutocomplete.prototype._handleResponseDoAutocomplete =
function(str, aclv, options, callback, result) {

	DBG.println("ac", "got response for " + str);

	// if we get back results for other than the current string, ignore them
	if (str != this._curAcStr) { return; }

	aclv.setWaiting(false);

	delete this._acRequests[str];

	var resultList, gotContacts = false, hasGal = false;
	var resp = result.getResponse();
	if (resp && resp.search && resp.search.isGalAutocompleteSearch) {
		var cl = resp.getResults(ZmItem.CONTACT);
		resultList = (cl && cl.getArray()) || [];
		gotContacts = true;
	} else {
		resultList = resp._respEl.match || [];
	}

	DBG.println("ac", resultList.length + " matches");

	var list = [];
	for (var i = 0; i < resultList.length; i++) {
		list.push(new ZmAutocompleteMatch(resultList[i], options, gotContacts));
	}
	var subList = this._checkType(list, options && options.typeHash);

	// we assume the results from the server are sorted by ranking
	callback.run(subList);

	this._acCache[str] = this._acCache[str] || {};
	this._acCache[str].list = list;
	// we always cache; flag below indicates whether we can do forward matching
	this._acCache[str].cacheable = resp._respEl.canBeCached;
	if (hasGal) {
		this._acCache[str].ts = (new Date()).getTime();
	}
};

/**
 * Handle timeout.
 */
ZmAutocomplete.prototype._handleErrorDoAutocomplete =
function(str, aclv, ex) {
	DBG.println("ac", "error on request for " + str + ", canceling");
	aclv.setWaiting(false);
	appCtxt.getAppController().cancelRequest(this._acRequests[str], null, true);
	appCtxt.setStatusMsg(ZmMsg.autocompleteFailed);
	delete this._acRequests[str];

	return true;
};

ZmAutocomplete.prototype._checkType =
function(list, types) {

	if (!types) {
		types = {};
		types[ZmAutocomplete.AC_TYPE_CONTACT] = true;
		types[ZmAutocomplete.AC_TYPE_GAL] = true;
	}

	var list1 = [];
	for (var i = 0; i < list.length; i++) {
		var type = list[i] && list[i].type;
		if (types[type]) {
			list1.push(list[i]);
		}
	}
	return list1;
};

/**
 * Sort autocomplete list by ranking scores.
 */
ZmAutocomplete.acSortCompare =
function(a, b) {
	var aScore = (a && a.score) || 0;
	var bScore = (b && b.score) || 0;
	return (aScore > bScore) ? 1 : (aScore < bScore) ? -1 : 0;
};


/**
 * Returns true if the given string is a valid email.
 *
 * @param str	[string]	a string
 */
ZmAutocomplete.prototype.isComplete =
function(str) {
	return AjxEmailAddress.isValid(str);
};

/**
 * Quick completion of a string when there are no matches. Appends the
 * user's domain to the given string.
 *
 * @param str	[string]	text that was typed in
 */
ZmAutocomplete.prototype.quickComplete =
function(str) {

	if (str.indexOf("@") != -1) { return null; }

	if (!this._userDomain) {
		var uname = appCtxt.get(ZmSetting.USERNAME);
		if (uname) {
			var a = uname.split("@");
			if (a && a.length) {
				this._userDomain = a[a.length - 1];
			}
		}
	}
	if (this._userDomain) {
		var text = [str, this._userDomain].join("@");
		var match = new ZmAutocompleteMatch();
		match.name = match.email = match.fullAddress = text;
		return match;
	} else {
		return null;
	}
};

ZmAutocomplete.prototype._checkCache =
function(str) {

	// check cache for results for this exact string
	var list = this._getCachedResults(str);
	if (list !== null) { return list; }
	if (str.length <= 1) { return null; }

	// forward matching: if we have complete results for a beginning part of this
	// string, we can cull those down to results for this string
	var tmp = str;
	while (tmp && !list) {
		tmp = tmp.slice(0, -1); // remove last character
		list = this._getCachedResults(tmp, true);
		if (list && list.length == 0) {
			// substring had no matches, so this string has none
			DBG.println("ac", "Found empty results for substring " + tmp);
			return list;
		}
	}

	var list1 = [];
	if (list && list.length) {
		// found a substring that we've already done matching for, so we just need
		// to narrow those results
		DBG.println("ac", "working forward from '" + tmp + "'");
		// test each of the substring's matches to see if it also matches this string
		for (var i = 0; i < list.length; i++) {
			var match = list[i];
			if (match.matches(str)) {
				list1.push(match);
			}
		}
	} else {
		return null;
	}

	this._acCache[str] = this._acCache[str] || {};
	this._acCache[str].list = list1;
	this._acCache[str].ts = this._acCache[tmp] && this._acCache[tmp].ts;

	return list1;
};

/**
 * See if we have cached results for the given string. If the cached results have a
 * timestamp, we make sure they haven't expired.
 *
 * @param str				[string]		string to match against
 * @param checkCacheable	[boolean]		if true, make sure results are cacheable
 *
 * @return list								if we find valid matches in the cache
 * @return null								if there is no valid data from cache
 * @return ZmAutocomplete.AC_NO_RESULTS		if the string was autocompleted and had no hits
 */
ZmAutocomplete.prototype._getCachedResults =
function(str, checkCacheable) {

	var cache = this._acCache[str];
	if (cache) {
		if (checkCacheable && (cache.cacheable === false)) { return null; }
		if (cache.ts) {
			var now = (new Date()).getTime();
			if (now > (cache.ts + ZmAutocomplete.GAL_RESULTS_TTL)) {
				return null;
			}
		}
		DBG.println("ac", "cache hit for " + str);
		return cache.list;
	} else {
		return null;
	}
};

/**
 * Autocomplete result, with fields for the caller to look at, and fields to
 * help with further matching.
 *
 * @param match			[object]		JSON match object, or ZmContact
 * @param options		[hash]			matching options
 * @param isContact		[boolean]		if true, provided match is a ZmContact
 */
ZmAutocompleteMatch = function(match, options, isContact) {

	if (!match) { return; }
	this.type = match.type;
	if (isContact) {
		this.text = this.name = match.getFullName();
		this.email = match.getEmail();
		this.item = match;
		this.type = ZmContact.getAttr(match, ZmResource.F_type) || ZmAutocomplete.AC_TYPE_GAL;
	} else {
		var email = AjxEmailAddress.parse(match.email);
		this.fullAddress = email.toString();
		this.name = email.getName();
		this.email = email.getAddress();
		this.text = AjxStringUtil.htmlEncode(match.email);
		this.icon = ZmAutocomplete.AC_ICON[match.type];
		this.score = match.ranking;
		if (options && options.needItem && window.ZmContact) {
			this.item = new ZmContact(null);
			this.item.initFromEmail(email);
		}
	}
};

/**
 * Returns true if the given string matches this autocomplete result.
 *
 * @param str
 */
ZmAutocompleteMatch.prototype.matches =
function(str) {
	if (this.name && !this._nameParsed) {
		var parts = this.name.split(/\s+/, 3);
		var firstName = parts[0];
		this._lastName = parts[parts.length - 1];
		this._firstLast = [firstName, this._lastName].join(" ");
		this._nameParsed = true;
	}

	var fields = [this.email, this.name, this._lastName, this._firstLast];
	for (var i = 0; i < fields.length; i++) {
		var f = fields[i] && fields[i].toLowerCase();
		if (f && (f.indexOf(str) == 0)) {
			return true;
		}
	}
	return false;
};
