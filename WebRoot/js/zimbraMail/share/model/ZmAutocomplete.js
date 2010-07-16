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
 * This file defines authentication.
 *
 */

/**
 * Creates and initializes support for server-based autocomplete.
 * @class
 * This class manages auto-completion via <code>&lt;AutoCompleteRequest&gt;</code> calls to the server. Currently limited
 * to matching against only one type among people, locations, and equipment.
 *
 * @author Conrad Damon
 */
ZmAutocomplete = function() {

	this._acRequests = {};		// request mgmt (timeout, cancel)

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var listener = new AjxListener(this, this._settingChangeListener);
		var settings = [ZmSetting.GAL_AUTOCOMPLETE, ZmSetting.AUTOCOMPLETE_SHARE,
						ZmSetting.AUTOCOMPLETE_SHARED_ADDR_BOOKS, ZmSetting.AUTOCOMPLETE_NO_GROUP_MATCH];
		for (var i = 0; i < settings.length; i++) {
			appCtxt.getSettings().getSetting(settings[i]).addChangeListener(listener);
		}
	}
};

// choices for text in the returned match object
ZmAutocomplete.AC_VALUE_FULL 		= "fullAddress";
ZmAutocomplete.AC_VALUE_EMAIL		= "email";
ZmAutocomplete.AC_VALUE_NAME		= "name";

// request control
ZmAutocomplete.AC_TIMEOUT			= 20;	// autocomplete timeout (in seconds)

// result types
ZmAutocomplete.AC_TYPE_CONTACT		= "contact";
ZmAutocomplete.AC_TYPE_GAL			= "gal";
ZmAutocomplete.AC_TYPE_GROUP		= "group";
ZmAutocomplete.AC_TYPE_TABLE		= "rankingTable";

ZmAutocomplete.AC_TYPE_UNKNOWN		= "unknown";
ZmAutocomplete.AC_TYPE_LOCATION		= "Location";	// same as ZmResource.ATTR_LOCATION
ZmAutocomplete.AC_TYPE_EQUIPMENT	= "Equipment";	// same as ZmResource.ATTR_EQUIPMENT

// icons
ZmAutocomplete.AC_ICON = {};
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_CONTACT]	= "Contact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_GAL]		= "GALContact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_GROUP]	= "Group";

// cache control
ZmAutocomplete.GAL_RESULTS_TTL		= 900000;	// time-to-live for cached GAL autocomplete results (msec)

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAutocomplete.prototype.toString =
function() {
	return "ZmAutocomplete";
};

/**
 * Returns a list of matching contacts for a given string. The first name, last
 * name, full name, first/last name, and email addresses are matched against.
 *
 * @param {String}					str			the string to match against
 * @param {AjxCallback}				callback	the callback to run with results
 * @param {ZmAutocompleteListView}	aclv		the needed to show wait msg
 * @param {ZmZimbraAccount}			account		the account to fetch cached items from
 * @param {Hash}					options		additional options:
 *  @param {constant} 				 type		 		type of result to match; default is {@link ZmAutocomplete.AC_TYPE_CONTACT}; other valid values are for location or equipment
 *  @param {Boolean}				 needItem	 		if <code>true</code>, return a {@link ZmItem} as part of match result
 *  @param {Boolean}				 supportForget		allow user to reset ranking for a contact (defaults to true)
 */
ZmAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options, account) {

	str = str.toLowerCase().replace(/"/g, '');
	this._curAcStr = str;
	DBG.println("ac", "begin autocomplete for " + str);

	var acType = (options && options.type) || ZmAutocomplete.AC_TYPE_CONTACT;

	var list = this._checkCache(str, acType, account);
	if (list !== null) {
		this._handleResponseAutocompleteMatch(str, callback, list);
		return;
	}

	aclv.setWaiting(true);
	var respCallback = new AjxCallback(this, this._handleResponseAutocompleteMatch, [str, callback]);
	this._doAutocomplete(str, aclv, options, acType, respCallback, account);
};
/**
 * @private
 */
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
 * @param options	[hash]						additional options
 * @param acType	[constant]					type of result to match
 * @param callback	[AjxCallback]				callback to run with results
 * @param account	[ZmZimbraAccount]*			accout to fetch from
 * 
 * @private
 */
ZmAutocomplete.prototype._doAutocomplete =
function(str, aclv, options, acType, callback, account) {

	if (this._acRequests[str]) // A request for this particular string is already active.
		return;

	// cancel any outstanding requests for strings that are substrings of this one
	for (var substr in this._acRequests) {
		if (str != substr) {
			DBG.println("ac", "canceling autocomplete request for '" + substr + "' due to request for '" + str + "'");
			appCtxt.getAppController().cancelRequest(this._acRequests[substr], null, true);
			delete this._acRequests[str];
		}
	}

	var params = {query:str, isAutocompleteSearch:true};
	if (acType != ZmAutocomplete.AC_TYPE_CONTACT) {
		params.isGalAutocompleteSearch = true;
		params.isAutocompleteSearch = false;
		params.limit = params.limit * 2;
		params.types = AjxVector.fromArray([ZmItem.CONTACT]);
		params.galType = ZmSearch.GAL_RESOURCE;
		DBG.println("ac", "AutoCompleteGalRequest: " + str);
	} else {
		DBG.println("ac", "AutoCompleteRequest: " + str);
	}
	params.accountName = account && account.name;

	var search = new ZmSearch(params);
	var searchParams = {
		callback: (new AjxCallback(this, this._handleResponseDoAutocomplete, [str, aclv, options, acType, callback, account])),
		errorCallback: (new AjxCallback(this, this._handleErrorDoAutocomplete, [str, aclv])),
		timeout: ZmAutocomplete.AC_TIMEOUT,
		noBusyOverlay: true
	};
	this._acRequests[str] = search.execute(searchParams);
};

/**
 * @private
 */
ZmAutocomplete.prototype._handleResponseDoAutocomplete =
function(str, aclv, options, acType, callback, account, result) {

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
		gotContacts = hasGal = true;
	} else {
		resultList = resp._respEl.match || [];
	}

	DBG.println("ac", resultList.length + " matches");

	var list = [];
	for (var i = 0; i < resultList.length; i++) {
		var match = new ZmAutocompleteMatch(resultList[i], options, gotContacts);
		if (match.acType == acType) {
			if (match.type == ZmAutocomplete.AC_TYPE_GAL) {
				hasGal = true;
			}
			list.push(match);
		}
	}

	// we assume the results from the server are sorted by ranking
	callback.run(list);

	this._cacheResults(str, acType, list, hasGal, resp._respEl.canBeCached, null, account);
};

/**
 * Handle timeout.
 * 
 * @private
 */
ZmAutocomplete.prototype._handleErrorDoAutocomplete =
function(str, aclv, ex) {
	DBG.println("ac", "error on request for " + str + ", canceling");
	aclv.setWaiting(false);
	appCtxt.getAppController().cancelRequest(this._acRequests[str], null, true);
	appCtxt.setStatusMsg({msg:ZmMsg.autocompleteFailed, level:ZmStatusView.LEVEL_WARNING});
	delete this._acRequests[str];

	return true;
};

/**
 * Sort auto-complete list by ranking scores.
 * 
 * @param	{ZmAutocomplete}	a		the auto-complete list
 * @param	{ZmAutocomplete}	b		the auto-complete list
 * @return	{int}	0 if the lists match; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmAutocomplete.acSortCompare =
function(a, b) {
	var aScore = (a && a.score) || 0;
	var bScore = (b && b.score) || 0;
	return (aScore > bScore) ? 1 : (aScore < bScore) ? -1 : 0;
};


/**
 * Checks if the given string is a valid email.
 *
 * @param {String}	str		a string
 * @return	{Boolean}	<code>true</code> if a valid email
 */
ZmAutocomplete.prototype.isComplete =
function(str) {
	return AjxEmailAddress.isValid(str);
};

/**
 * Quick completion of a string when there are no matches. Appends the
 * user's domain to the given string.
 *
 * @param {String}	 str	the text that was typed in
 * @return	{String}	the string
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

ZmAutocomplete.prototype.forget =
function(addr, callback) {

	var jsonObj = {RankingActionRequest:{_jsns:"urn:zimbraMail"}};
	jsonObj.RankingActionRequest.action = {op:"delete", email:addr};
	var respCallback = new AjxCallback(this, this._handleResponseForget, [callback]);
	appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAutocomplete.prototype._handleResponseForget =
function(callback) {
	appCtxt.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
	if (callback) {
		callback.run();
	}
};

/**
 * @param acType		[constant]			type of result to match
 * @param str			[string]			string to match against
 * @param account		[ZmZimbraAccount]*	account to check cache against
 * @param create		[boolean]			if <code>true</code>, create a cache if none found
 *
 * @private
 */
ZmAutocomplete.prototype._getCache =
function(acType, str, account, create) {
	var context = AjxEnv.isIE ? window.appCtxt : window.parentAppCtxt || window.appCtxt;
	return context.getAutocompleteCache(acType, str, account, create);
};

/**
 * @param str			[string]			string to match against
 * @param acType		[constant]			type of result to match
 * @param list			[array]				list of matches
 * @param hasGal		[boolean]*			if true, list includes GAL results
 * @param cacheable		[boolean]*			server indication of cacheability
 * @param baseCache		[hash]*				cache that is superset of this one
 * @param account		[ZmZimbraAccount]*	account to check cache against
 * 
 * @private
 */
ZmAutocomplete.prototype._cacheResults =
function(str, acType, list, hasGal, cacheable, baseCache, account) {

	var cache = this._getCache(acType, str, account, true);
	cache.list = list;
	// we always cache; flag below indicates whether we can do forward matching
	cache.cacheable = (baseCache && baseCache.cacheable) || cacheable;
	if (hasGal) {
		cache.ts = (baseCache && baseCache.ts) || (new Date()).getTime();
	}
};

/**
 * @private
 */
ZmAutocomplete.prototype._checkCache =
function(str, acType, account) {

	// check cache for results for this exact string
	var cache = this._getCachedResults(str, acType, null, account);
	var list = cache && cache.list;
	if (list !== null) { return list; }
	if (str.length <= 1) { return null; }

	// forward matching: if we have complete results for a beginning part of this
	// string, we can cull those down to results for this string
	var tmp = str;
	while (tmp && !list) {
		tmp = tmp.slice(0, -1); // remove last character
		DBG.println("ac", "checking cache for " + tmp);
		cache = this._getCachedResults(tmp, acType, true, account);
		list = cache && cache.list;
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

	this._cacheResults(str, acType, list1, false, false, cache, account);

	return list1;
};

/**
 * See if we have cached results for the given string. If the cached results have a
 * timestamp, we make sure they haven't expired.
 *
 * @param str				[string]			string to match against
 * @param acType			[constant]			type of result to match
 * @param checkCacheable	[boolean]			if true, make sure results are cacheable
 * @param account			[ZmZimbraAccount]*	account to fetch cached results from
 * 
 * @private
 */
ZmAutocomplete.prototype._getCachedResults =
function(str, acType, checkCacheable, account) {

	var cache = this._getCache(acType, str, account);
	if (cache) {
		if (checkCacheable && (cache.cacheable === false)) { return null; }
		if (cache.ts) {
			var now = (new Date()).getTime();
			if (now > (cache.ts + ZmAutocomplete.GAL_RESULTS_TTL)) {
				return null;	// expired GAL results
			}
		}
		DBG.println("ac", "cache hit for " + str);
		return cache;
	} else {
		return null;
	}
};

/**
 * Clears contact autocomplete cache on change to any related setting.
 *
 * @private
 */
ZmAutocomplete.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }
	var context = AjxEnv.isIE ? window.appCtxt : window.parentAppCtxt || window.appCtxt;
	context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
};


/**
 * Creates an auto-complete match.
 * @class
 * This class represents an auto-complete result, with fields for the caller to look at, and fields to
 * help with further matching.
 *
 * @param {Object}	match		the JSON match object or a {@link ZmContact} object
 * @param {Object}	options		the matching options
 * @param {Boolean}	isContact	if <code>true</code>, provided match is a {@link ZmContact}
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
		if (this.type == ZmAutocomplete.AC_TYPE_GROUP) {
			this.fullAddress = match.email;
			this.name        = match.display;
			//Find all the emails
			var emails = [];
			var eIds = match.email.split(',');
			for (var i = 0; i < eIds.length; i++) {
				var email = AjxEmailAddress.parse(eIds[i]);
				if (email && email.getAddress()) {
					emails.push(email.getAddress());
				}
			}
			this.email = emails.join(";");
			this.text = match.display;
		} else {
			var email = AjxEmailAddress.parse(match.email);
			if (email) {
				this.fullAddress = email.toString();
				this.name = email.getName();
				this.email = email.getAddress();
			} else {
				this.email = match.email;
			}
			this.text = AjxStringUtil.htmlEncode(match.email);
			if (options && options.needItem && window.ZmContact) {
				this.item = new ZmContact(null);
				this.item.initFromEmail(email || match.email);
			}
		}
		this.icon = ZmAutocomplete.AC_ICON[match.type];
		this.score = match.ranking;
	}
	this.icon = this.icon || ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_CONTACT];
	this.acType = (this.type == ZmAutocomplete.AC_TYPE_LOCATION || this.type == ZmAutocomplete.AC_TYPE_EQUIPMENT)
		? this.type : ZmAutocomplete.AC_TYPE_CONTACT;
	this.canForget = (match.type == ZmAutocomplete.AC_TYPE_TABLE);
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAutocompleteMatch.prototype.toString =
function() {
	return "ZmAutocompleteMatch";
};

/**
 * Matches the given string to this auto-complete result.
 *
 * @param {String}	str		the string
 * @return	{Boolean}	<code>true</code> if the given string matches this result
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

/**
 * Creates a search auto-complete.
 * @class
 * This class supports auto-complete for our query language. Each search operator that is supported has an associated handler.
 * A handler is a hash which contains the info needed for auto-complete. A handler can have the following properties:
 *
 * <ul>
 * <li><b>listType</b> - A handler needs a list of objects to autocomplete against. By default, that list is
 * 						identified by the operator. If more than one operator uses the same list, their handlers
 * 						should use this property to identify the list.</li>
 * <li><b>loader</b> - Function that populates the list of objects. Lists used by more than one operator provide
 * 						their loader separately.</li>
 * <li><b>text</b> - Function that returns a string value of data, to autocomplete against and to display in the
 * 						autocomplete list.</li>
 * <li><b>icon</b> - Function that returns an icon to display in the autocomplete list.</li>
 * <li><b>matchText</b> - Function that returns a string to place in the input when the item is selected. Defaults to
 * 						the 'op:' plus the value of the 'text' attribute.</li>
 * <li><b>quoteMatch</b> - If <code>true</code>, the text that goes into matchText will be place in double quotes.</li>
 * </ul>
 * 
 */
ZmSearchAutocomplete = function() {

	this._op = {};
	this._list = {};
	this._loadFunc = {};

	var params = {
		loader:		this._loadTags,
		text:		function(o) { return o.getName(false, null, true, true); },
		icon:		function(o) { return o.getIcon(); },
		matchText:	function(o) { return o.createQuery(); }
	};
	this._registerHandler("tag", params);

	params = {
		listType:	ZmId.ORG_FOLDER,
		text:		function(o) { return o.getPath(false, false, null, true, true); },
		icon:		function(o) { return o.getIcon(); },
		matchText:	function(o) { return o.createQuery(); }
	};
	this._loadFunc[ZmId.ORG_FOLDER] = this._loadFolders;
	this._registerHandler("in", params);
	this._registerHandler("under", params);

	params = { loader:		this._loadFlags };
	this._registerHandler("is", params);

	params = {
		loader:		this._loadObjects,
		icon:		function(o) { return ZmSearchAutocomplete.ICON[o]; }
	};
	this._registerHandler("has", params);

	params = {listType:		ZmId.ITEM_ATT,
			  text:			function(o) { return o.desc; },
			  icon:			function(o) { return o.image; },
			  matchText:	function(o) { return o.type; },
			  quoteMatch:	true
			 };
	this._loadFunc[ZmId.ITEM_ATT] = this._loadTypes;
	this._registerHandler("type", params);
	this._registerHandler("attachment", params);

	appCtxt.getFolderTree().addChangeListener(new AjxListener(this, this._folderTreeChangeListener));
	appCtxt.getTagTree().addChangeListener(new AjxListener(this, this._tagTreeChangeListener));
};

ZmSearchAutocomplete.ICON = {};
ZmSearchAutocomplete.ICON["attachment"]	= "Attachment";
ZmSearchAutocomplete.ICON["phone"]		= "Telephone";
ZmSearchAutocomplete.ICON["url"]		= "URL";

/**
 * @private
 */
ZmSearchAutocomplete.prototype._registerHandler =
function(op, params) {
	var loadFunc = params.loader || this._loadFunc[params.listType];
	this._op[op] = {loader:new AjxCallback(this, loadFunc), text:params.text, icon:params.icon,
					listType:params.listType || op, matchText:params.matchText || params.text, quoteMatch:params.quoteMatch};
};

/**
 * Returns a list of matches for a given query operator.
 *
 * @param {String}					str			the string to match against
 * @param {AjxCallback}				callback	the callback to run with results
 * @param {ZmAutocompleteListView}	aclv		needed to show wait msg
 * @param {Hash}					options		a hash of additional options
 */
ZmSearchAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options) {

	if (ZmSearchAutocomplete._ignoreNextKey) {
		ZmSearchAutocomplete._ignoreNextKey = false;
		return;
	}

	str = str.toLowerCase().replace(/"/g, '');

	var m = str.match(/\b-?([a-z]+):/);
	if (!(m && m.length)) {
		callback.run();
		return;
	}

	var op = m[1];
	var opHash = this._op[op];
	if (!opHash) {
		callback.run();
		return;
	}
	var list = this._list[opHash.listType];
	if (list) {
		callback.run(this._getMatches(op, str));
	} else {
		var respCallback = new AjxCallback(this, this._handleResponseLoad, [op, str, callback]);
		this._list[opHash.listType] = [];
		opHash.loader.run(opHash.listType, respCallback);
	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._getMatches =
function(op, str) {

	var opHash = this._op[op];
	var results = [];
	var list = this._list[opHash.listType];
	var rest = str.substr(str.indexOf(":") + 1);
	if (opHash.listType == ZmId.ORG_FOLDER) {
		rest = rest.replace(/^\//, "");	// remove leading slash in folder path
	}
	for (var i = 0, len = list.length; i < len; i++) {
		var o = list[i];
		var text = opHash.text ? opHash.text(o) : o;
		var test = text.toLowerCase();
		if (!rest || (test.indexOf(rest) == 0)) {
			var matchText = opHash.matchText ? opHash.matchText(o) :
								opHash.quoteMatch ? [op, ":", '"', text, '"'].join("") :
													[op, ":", text].join("");
			matchText = str.replace(op + ":" + rest, matchText);
			results.push({text:			text,
						  icon:			opHash.icon ? opHash.icon(o) : null,
						  matchText:	matchText,
						  exactMatch:	(test.length == rest.length)});
		}
	}

	// no need to show list of one item that is same as what was typed
	if (results.length == 1 && results[0].exactMatch) {
		results = [];
	}

	return results;
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._handleResponseLoad =
function(op, str, callback) {
	callback.run(this._getMatches(op, str));
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadTags =
function(listType, callback) {

	var list = this._list[listType];
	var tags = appCtxt.getTagTree().asList();
	for (var i = 0, len = tags.length; i < len; i++) {
		var tag = tags[i];
		if (tag.id != ZmOrganizer.ID_ROOT) {
			list.push(tag);
		}
	}
	list.sort(ZmTag.sortCompare);
	if (callback) {	callback.run();	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadFolders =
function(listType, callback) {

	var list = this._list[listType];
	var folders = appCtxt.getFolderTree().asList({includeRemote:true});
	for (var i = 0, len = folders.length; i < len; i++) {
		var folder = folders[i];
		if (folder.id != ZmOrganizer.ID_ROOT && folder.type == ZmOrganizer.FOLDER) {
			list.push(folder);
		}
	}
	list.sort(ZmFolder.sortComparePath);
	if (callback) {	callback.run();	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadFlags =
function(listType, callback) {

	this._list[listType] = ["anywhere",
							"unread", "read", "flagged", "unflagged",
							"sent", "received", "replied", "unreplied", "forwarded", "unforwarded",
							"invite",
							"solo",
							"tome", "fromme", "ccme", "tofromme", "fromccme", "tofromccme",
							"local", "remote"].sort();
	if (callback) { callback.run(); }
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadObjects =
function(listType, callback) {

	var list = this._list[listType];
	list.push("attachment");
	var idxZimlets = appCtxt.getZimletMgr().getIndexedZimlets();
	if (idxZimlets.length) {
		for (var i = 0; i < idxZimlets.length; i++) {
			list.push(idxZimlets[i].keyword);
		}
	}
	list.sort();
	if (callback) { callback.run(); }
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadTypes =
function(listType, callback) {

	AjxDispatcher.require("Browse");
	var attachTypeList = new ZmAttachmentTypeList();
	var respCallback = new AjxCallback(this, this._handleResponseLoadTypes, [attachTypeList, listType, callback]);
	attachTypeList.load(respCallback);
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._handleResponseLoadTypes =
function(attachTypeList, listType, callback) {

	this._list[listType] = attachTypeList.getAttachments();
	if (callback) { callback.run(); }
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._folderTreeChangeListener =
function(ev) {
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_MOVE ||
		((ev.event == ZmEvent.E_MODIFY) && fields && fields[ZmOrganizer.F_NAME])) {

		var listType = ZmId.ORG_FOLDER;
		if (this._list[listType]) {
			this._list[listType] = [];
			this._loadFolders(listType);
		}
	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._tagTreeChangeListener =
function(ev) {
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_MOVE ||
		((ev.event == ZmEvent.E_MODIFY) && fields && fields[ZmOrganizer.F_NAME])) {

		var listType = "tag";
		if (this._list[listType]) {
			this._list[listType] = [];
			this._loadTags(listType);
		}
	}
};
