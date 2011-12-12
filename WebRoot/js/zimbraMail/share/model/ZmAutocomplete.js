/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011 Zimbra, Inc.
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
ZmAutocomplete = function(params) {

	if (arguments.length == 0) { return; }

	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var listener = this._settingChangeListener.bind(this);
		var settings = [ZmSetting.GAL_AUTOCOMPLETE, ZmSetting.AUTOCOMPLETE_SHARE, ZmSetting.AUTOCOMPLETE_SHARED_ADDR_BOOKS];
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
ZmAutocomplete.AC_TYPE_TABLE		= "rankingTable";

ZmAutocomplete.AC_TYPE_UNKNOWN		= "unknown";
ZmAutocomplete.AC_TYPE_LOCATION		= "Location";	// same as ZmResource.ATTR_LOCATION
ZmAutocomplete.AC_TYPE_EQUIPMENT	= "Equipment";	// same as ZmResource.ATTR_EQUIPMENT

// icons
ZmAutocomplete.AC_ICON = {};
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_CONTACT]	    = "Contact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_GAL]		    = "GALContact";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_LOCATION]		= "Location";
ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_EQUIPMENT]	= "Resource";

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
 * @param {String}					str				the string to match against
 * @param {closure}					callback		the callback to run with results
 * @param {ZmAutocompleteListView}	aclv			the needed to show wait msg
 * @param {ZmZimbraAccount}			account			the account to fetch cached items from
 * @param {Hash}					options			additional options:
 * @param {constant} 				type		 	type of result to match; default is {@link ZmAutocomplete.AC_TYPE_CONTACT}; other valid values are for location or equipment
 * @param {Boolean}					needItem	 	if <code>true</code>, return a {@link ZmItem} as part of match result
 * @param {Boolean}					supportForget	allow user to reset ranking for a contact (defaults to true)
 */
ZmAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options, account) {

	str = str.toLowerCase().replace(/"/g, '');
	this._curAcStr = str;
	DBG.println("ac", "begin autocomplete for " + str);

	var acType = (options && options.type) || ZmAutocomplete.AC_TYPE_CONTACT;

	var list = this._checkCache(str, acType, account);
	if (!str || (list !== null)) {
		callback(list);
	}
	else {
		aclv.setWaiting(true, str);
		return this._doSearch(str, aclv, options, acType, callback, account);
	}
};

ZmAutocomplete.prototype._doSearch =
function(str, aclv, options, acType, callback, account) {

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
	params.expandDL = appCtxt.get(ZmSetting.GAL_AUTOCOMPLETE);

	var search = new ZmSearch(params);
	var searchParams = {
		callback:		this._handleResponseDoAutocomplete.bind(this, str, aclv, options, acType, callback, account),
		errorCallback:	this._handleErrorDoAutocomplete.bind(this, str, aclv),
		timeout:		ZmAutocomplete.AC_TIMEOUT,
		noBusyOverlay:	true
	};
	return search.execute(searchParams);
};

/**
 * @private
 */
ZmAutocomplete.prototype._handleResponseDoAutocomplete =
function(str, aclv, options, acType, callback, account, result) {

	DBG.println("ac", "got response for " + str);
	aclv.setWaiting(false);

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
		var match = new ZmAutocompleteMatch(resultList[i], options, gotContacts, str);
		if (match.acType == acType) {
			if (match.type == ZmAutocomplete.AC_TYPE_GAL) {
				hasGal = true;
			}
			list.push(match);
		}
	}
	var complete = !(resp && resp.getAttribute("more"));

	// we assume the results from the server are sorted by ranking
	callback(list);
	this._cacheResults(str, acType, list, hasGal, complete && resp._respEl.canBeCached, null, account);
};

/**
 * Handle timeout.
 * 
 * @private
 */
ZmAutocomplete.prototype._handleErrorDoAutocomplete =
function(str, aclv, ex) {
	DBG.println("ac", "error on request for " + str + ": " + ex.toString());
	aclv.setWaiting(false);
	appCtxt.setStatusMsg({msg:ZmMsg.autocompleteFailed, level:ZmStatusView.LEVEL_WARNING});

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
 * Asks the server to drop an address from the ranking table.
 * 
 * @param {string}	addr		email address
 * @param {closure}	callback	callback to run after response
 */
ZmAutocomplete.prototype.forget =
function(addr, callback) {

	var jsonObj = {RankingActionRequest:{_jsns:"urn:zimbraMail"}};
	jsonObj.RankingActionRequest.action = {op:"delete", email:addr};
	var respCallback = this._handleResponseForget.bind(this, callback);
	var aCtxt = appCtxt.isChildWindow ? parentAppCtxt : appCtxt;
	aCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
};

ZmAutocomplete.prototype._handleResponseForget =
function(callback) {
	appCtxt.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
	if (appCtxt.isChildWindow) {
		parentAppCtxt.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
	}
	if (callback) {
		callback();
	}
};

/**
 * Expands a contact which is a DL and returns a list of its members.
 * 
 * @param {ZmContact}	contact		DL contact
 * @param {int}			offset		member to start with (in case we're paging a large DL)
 * @param {closure}		callback	callback to run with results
 */
ZmAutocomplete.prototype.expandDL =
function(contact, offset, callback) {

	var respCallback = this._handleResponseExpandDL.bind(this, contact, callback);
	contact.getDLMembers(offset, null, respCallback);
};

ZmAutocomplete.prototype._handleResponseExpandDL =
function(contact, callback, result) {

	var list = result.list;
	var matches = [];
	if (list && list.length) {
		for (var i = 0, len = list.length; i < len; i++) {
			var addr = list[i];
			var match = {};
			match.type = ZmAutocomplete.AC_TYPE_GAL;
			match.email = addr;
			match.isGroup = result.isDL[addr];
			matches.push(new ZmAutocompleteMatch(match, null, false, contact && contact.str));
		}
	}
	if (callback) {
		callback(matches);
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
 * 
 * TODO: substring result matching for multiple tokens, eg "tim d"
 */
ZmAutocomplete.prototype._checkCache =
function(str, acType, account) {

	// check cache for results for this exact string
	var cache = this._getCachedResults(str, acType, null, account);
	var list = cache && cache.list;
	if (list !== null) { return list; }
	if (str.length <= 1) { return null; }
	
	// bug 58913: don't do client-side substring matching since the server matches on
	// fields that are not returned in the results
	return null;

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
ZmAutocompleteMatch = function(match, options, isContact, str) {
	// TODO: figure out how to minimize loading of calendar code
    AjxDispatcher.require("CalendarCore");
	if (!match) { return; }
	this.type = match.type;
	this.str = str;
	if (isContact) {
		this.text = this.name = match.getFullName();
		this.email = match.getEmail();
		this.item = match;
		this.type = ZmContact.getAttr(match, ZmResource && ZmResource.F_type || "zimbraCalResType") || ZmAutocomplete.AC_TYPE_GAL;
        this.fullAddress = (new AjxEmailAddress(this.email, null, this.text)).toString(); //bug:60789 formated the email and name to get fullAddress
	} else {
		this.isGroup = Boolean(match.isGroup);
		this.isDL = (this.isGroup && this.type == ZmAutocomplete.AC_TYPE_GAL);
		if (this.isGroup && !this.isDL) {
			// Local contact group; emails need to be looked up by group member ids.  
			var contactGroup = appCtxt.cacheGet(match.id);
			if (contactGroup) {
				var groups = contactGroup.getGroupMembers();
				var addresses = ((groups.good.size()) && groups.good.getArray()) || [];
				var emails = [], addrs = [];
				for (var i = 0; i < addresses.length; i++) {
					var addr = addresses[i];
					emails.push(addr.getAddress());
					addrs.push(addr.toString());
				}				
				this.name = match.display;
				this.email = emails.join(AjxEmailAddress.SEPARATOR);
				this.fullAddress = addrs.join(AjxEmailAddress.SEPARATOR);
				this.text = AjxStringUtil.htmlEncode(match.display) || this.email;
				this.icon = "Group";
			}
		} else {   
			// Local contact, GAL contact, or distribution list
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
			this.icon = this.isDL ? "Group" : ZmAutocomplete.AC_ICON[match.type];
			this.canExpand = this.isDL && match.exp;
			var ac = window.parentAppCtxt || window.appCtxt;
			ac.setIsExpandableDL(this.email, this.canExpand);
		}
	}
	this.score = (match.ranking && parseInt(match.ranking)) || 0;
	this.icon = this.icon || ZmAutocomplete.AC_ICON[ZmAutocomplete.AC_TYPE_CONTACT];
	this.acType = (this.type == ZmAutocomplete.AC_TYPE_LOCATION || this.type == ZmAutocomplete.AC_TYPE_EQUIPMENT)
		? this.type : ZmAutocomplete.AC_TYPE_CONTACT;
    if(this.type == ZmAutocomplete.AC_TYPE_LOCATION || this.type == ZmAutocomplete.AC_TYPE_EQUIPMENT) {
        this.icon = ZmAutocomplete.AC_ICON[this.type];
    }
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
		icon:		function(o) { return o.getIconWithColor(); },
		matchText:	function(o) { return o.createQuery(); }
	};
	this._registerHandler("tag", params);

	params = {
		listType:	ZmId.ORG_FOLDER,
		text:		function(o) { return o.getPath(false, false, null, true, false); },
		icon:		function(o) { return o.getIconWithColor(); },
		matchText:	function(o) { return o.createQuery(); }
	};
	this._loadFunc[ZmId.ORG_FOLDER] = this._loadFolders;
	this._registerHandler("in", params);
	params.matchText = function(o) { return "under:" + '"' + o.getPath() + '"'; };
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
			  matchText:	function(o) { return "type:" + (o.query || o.type); },
			  quoteMatch:	true
			 };
	this._loadFunc[ZmId.ITEM_ATT] = this._loadTypes;
	this._registerHandler("type", params);
	this._registerHandler("attachment", params);

	params = {
		loader:		this._loadCommands
	};
	this._registerHandler("set", params);

	var folderTree = appCtxt.getFolderTree();
    if (folderTree) {
        folderTree.addChangeListener(this._folderTreeChangeListener.bind(this));
    }
	var tagTree = appCtxt.getTagTree();
    if (tagTree) {
        tagTree.addChangeListener(this._tagTreeChangeListener.bind(this));
    }
};

ZmSearchAutocomplete.prototype.isZmSearchAutocomplete = true;
ZmSearchAutocomplete.prototype.toString = function() { return "ZmSearchAutocomplete"; };
		
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
	this._op[op] = {loader:loadFunc.bind(this), text:params.text, icon:params.icon,
					listType:params.listType || op, matchText:params.matchText || params.text, quoteMatch:params.quoteMatch};
};

/**
 * Returns a list of matches for a given query operator.
 *
 * @param {String}					str			the string to match against
 * @param {closure}					callback	the callback to run with results
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

	var idx = str.lastIndexOf(" ");
	if (idx != -1 && idx <= str.length) {
		str = str.substr(idx + 1);
	}
	var m = str.match(/\b-?\$?([a-z]+):/);
	if (!(m && m.length)) {
		callback();
		return;
	}

	var op = m[1];
	var opHash = this._op[op];
	if (!opHash) {
		callback();
		return;
	}
	var list = this._list[opHash.listType];
	if (list) {
		callback(this._getMatches(op, str));
	} else {
		var respCallback = this._handleResponseLoad.bind(this, op, str, callback);
		this._list[opHash.listType] = [];
		opHash.loader(opHash.listType, respCallback);
	}
};

// TODO - some validation of search ops and args
ZmSearchAutocomplete.prototype.isComplete =
function(str) {
	var pq = new ZmParsedQuery(str);
	return (!pq.parseFailed && (pq.getNumTokens() == 1));
};

ZmSearchAutocomplete.prototype.getAddedBubbleClass =
function(str) {
	var pq = new ZmParsedQuery(str);
	var tokens = pq.getTokens();
	return (!pq.parseFailed && (pq.getNumTokens() == 1) && tokens && tokens.length && tokens[0].type);
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._getMatches =
function(op, str) {

	var opHash = this._op[op];
	var results = [], app;
	var list = this._list[opHash.listType];
	var rest = str.substr(str.indexOf(":") + 1);
	if (opHash.listType == ZmId.ORG_FOLDER) {
		rest = rest.replace(/^\//, "");	// remove leading slash in folder path
		app = appCtxt.getCurrentAppName();
		if (!ZmApp.ORGANIZER[app]) {
			app = null;
		}
	}
	for (var i = 0, len = list.length; i < len; i++) {
		var o = list[i];
		var text = opHash.text ? opHash.text(o) : o;
		var test = text.toLowerCase();
		if (app && ZmOrganizer.APP[o.type] != app) { continue; }
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
	callback(this._getMatches(op, str));
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
	if (callback) {	callback();	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadFolders =
function(listType, callback) {

	var list = this._list[listType];
    var folderTree = appCtxt.getFolderTree();
	var folders = folderTree ? folderTree.asList({includeRemote:true}) : [];
	for (var i = 0, len = folders.length; i < len; i++) {
		var folder = folders[i];
		if (folder.id != ZmOrganizer.ID_ROOT && !ZmFolder.HIDE_ID[folder.id]) {
			list.push(folder);
		}
	}
	list.sort(ZmFolder.sortComparePath);
	if (callback) {	callback();	}
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadFlags =
function(listType, callback) {

	this._list[listType] = ZmParsedQuery.IS_VALUES.sort();
	if (callback) { callback(); }
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
	if (callback) { callback(); }
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadTypes =
function(listType, callback) {

	AjxDispatcher.require("Extras");
	var attachTypeList = new ZmAttachmentTypeList();
	var respCallback = this._handleResponseLoadTypes.bind(this, attachTypeList, listType, callback);
	attachTypeList.load(respCallback);
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._handleResponseLoadTypes =
function(attachTypeList, listType, callback) {

	this._list[listType] = attachTypeList.getAttachments();
	if (callback) { callback(); }
};

/**
 * @private
 */
ZmSearchAutocomplete.prototype._loadCommands =
function(listType, callback) {
	var list = this._list[listType];
	for (var funcName in ZmClientCmdHandler.prototype) {
		if (funcName.indexOf("execute_") == 0) {
			list.push(funcName.substr(8));
		}
	}
	list.sort();
	if (callback) { callback(); }
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

/**
 * Creates a people search auto-complete.
 * @class
 * This class supports auto-complete for searching the GAL and the user's
 * personal contacts.
 */
ZmPeopleSearchAutocomplete = function() {
	// no need to call ctor
//	this._acRequests = {};
};

ZmPeopleSearchAutocomplete.prototype = new ZmAutocomplete;
ZmPeopleSearchAutocomplete.prototype.constructor = ZmPeopleSearchAutocomplete;

ZmPeopleSearchAutocomplete.prototype.toString =
function() {
	return "ZmPeopleSearchAutocomplete";
};

ZmPeopleSearchAutocomplete.prototype._doSearch =
function(str, aclv, options, acType, callback, account) {
	var params = {
		query: str,
		types: AjxVector.fromArray([ZmItem.CONTACT]),
		sortBy: ZmSearch.NAME_ASC,
		contactSource: ZmId.SEARCH_GAL,
		accountName: account && account.name
	};

	var search = new ZmSearch(params);

	var searchParams = {
		callback:		this._handleResponseDoAutocomplete.bind(this, str, aclv, options, acType, callback, account),
		errorCallback:	this._handleErrorDoAutocomplete.bind(this, str, aclv),
		timeout:		ZmAutocomplete.AC_TIMEOUT,
		noBusyOverlay:	true
	};
	return search.execute(searchParams);
};

/**
 * @private
 */
ZmPeopleSearchAutocomplete.prototype._handleResponseDoAutocomplete =
function(str, aclv, options, acType, callback, account, result) {
	// if we get back results for other than the current string, ignore them
	if (str != this._curAcStr) { return; }

	var resp = result.getResponse();
	var cl = resp.getResults(ZmItem.CONTACT);
	var resultList = (cl && cl.getArray()) || [];
	var list = [];

	for (var i = 0; i < resultList.length; i++) {
		var match = new ZmAutocompleteMatch(resultList[i], options, true);
		list.push(match);
	}
	var complete = !(resp && resp.getAttribute("more"));

	// we assume the results from the server are sorted by ranking
	callback(list);
	this._cacheResults(str, acType, list, true, complete && resp._respEl.canBeCached, null, account);
};
