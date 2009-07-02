/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates and initializes support for server-based autocomplete.
 * @constructor
 * @class
 * Manages autocompletion via AutoCompleteRequest calls to the server. Currently limited
 * to matching against only one type among people, locations, and equipment.
 *
 * @author Conrad Damon
 */
ZmAutocomplete = function() {
	this._acRequests = {};		// request mgmt (timeout, cancel)
	this._acCache = {};			// results cache, grouped by type
	this._acCache[ZmAutocomplete.AC_TYPE_CONTACT]	=	{};
	this._acCache[ZmAutocomplete.AC_TYPE_LOCATION]	=	{};
	this._acCache[ZmAutocomplete.AC_TYPE_EQUIPMENT]	=	{};

	var settings = appCtxt.getSettings();
	var galSetting = settings.getSetting(ZmSetting.GAL_AUTOCOMPLETE);
    if(galSetting){ //AddrBook might be disabled
        galSetting.addChangeListener(new AjxListener(this, this._settingChangeListener));
    }
};

// choices for text in the returned match object
ZmAutocomplete.AC_VALUE_FULL 	= "fullAddress";
ZmAutocomplete.AC_VALUE_EMAIL	= "email";
ZmAutocomplete.AC_VALUE_NAME	= "name";

// request control
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

ZmAutocomplete.prototype.toString =
function() {
	return "ZmAutocomplete";
};

/**
 * Returns a list of matching contacts for a given string. The first name, last
 * name, full name, first/last name, and email addresses are matched against.
 *
 * @param str		[string]					string to match against
 * @param callback	[AjxCallback]				callback to run with results
 * @param aclv		[ZmAutocompleteListView]*	needed to show wait msg
 * @param options	[hash]*						additional options:
 *        type		[constant]*					type of result to match; default is
 * 												ZmAutocomplete.AC_TYPE_CONTACT; other valid values
 * 												are for location or equipment
 *        needItem	[boolean]*					if true, return a ZmItem as part of match result
 */
ZmAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options) {

	str = str.toLowerCase().replace(/"/g, '');
	this._curAcStr = str;
	DBG.println("ac", "begin autocomplete for " + str);

	var acType = (options && options.type) || ZmAutocomplete.AC_TYPE_CONTACT;

	var list = this._checkCache(str, acType);
	if (list !== null) {
		this._handleResponseAutocompleteMatch(str, callback, list);
		return;
	}

	aclv.setWaiting(true);
	var respCallback = new AjxCallback(this, this._handleResponseAutocompleteMatch, [str, callback]);
	this._doAutocomplete(str, aclv, options, acType, respCallback);
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
 * @param options	[hash]						additional options
 * @param acType	[constant]					type of result to match
 * @param callback	[AjxCallback]				callback to run with results
 */
ZmAutocomplete.prototype._doAutocomplete =
function(str, aclv, options, acType, callback) {
	// cancel any outstanding requests for strings that are substrings of this one
	for (var substr in this._acRequests) {
		if (str != substr && str.indexOf(substr) === 0) {
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

	var search = new ZmSearch(params);
	var respCallback = new AjxCallback(this, this._handleResponseDoAutocomplete, [str, aclv, options, acType, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorDoAutocomplete, [str, aclv]);
	this._acRequests[str] = search.execute({callback:respCallback, errorCallback:errorCallback,
											timeout:ZmAutocomplete.AC_TIMEOUT, noBusyOverlay:true});
};

ZmAutocomplete.prototype._handleResponseDoAutocomplete =
function(str, aclv, options, acType, callback, result) {

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

	this._cacheResults(str, acType, list, hasGal, resp._respEl.canBeCached);
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

/**
 * @param str			[string]		string to match against
 * @param acType		[constant]		type of result to match
 * @param list			[array]			list of matches
 * @param hasGal		[boolean]*		if true, list includes GAL results
 * @param cacheable		[boolean]*		server indication of cacheability
 * @param baesCache		[hash]*			cache that is superset of this one
 */
ZmAutocomplete.prototype._cacheResults =
function(str, acType, list, hasGal, cacheable, baseCache) {

	var cache = this._acCache[acType][str] = this._acCache[acType][str] || {};
	cache.list = list;
	// we always cache; flag below indicates whether we can do forward matching
	cache.cacheable = (baseCache && baseCache.cacheable) || cacheable;
	if (hasGal) {
		cache.ts = (baseCache && baseCache.ts) || (new Date()).getTime();
	}
};

ZmAutocomplete.prototype._checkCache =
function(str, acType) {

	// check cache for results for this exact string
	var cache = this._getCachedResults(str, acType);
	var list = cache && cache.list;
	if (list !== null) { return list; }
	if (str.length <= 1) { return null; }

	// forward matching: if we have complete results for a beginning part of this
	// string, we can cull those down to results for this string
	var tmp = str;
	while (tmp && !list) {
		tmp = tmp.slice(0, -1); // remove last character
		DBG.println("ac", "checking cache for " + tmp);
		cache = this._getCachedResults(tmp, acType, true);
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

	this._cacheResults(str, acType, list1, false, false, cache);

	return list1;
};

/**
 * See if we have cached results for the given string. If the cached results have a
 * timestamp, we make sure they haven't expired.
 *
 * @param str				[string]		string to match against
 * @param acType			[constant]		type of result to match
 * @param checkCacheable	[boolean]		if true, make sure results are cacheable
 */
ZmAutocomplete.prototype._getCachedResults =
function(str, acType, checkCacheable) {

	var cache = this._acCache[acType][str];
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

ZmAutocomplete.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) { return; }
	if (ev.source.id == ZmSetting.GAL_AUTOCOMPLETE) {
		this._acCache[ZmAutocomplete.AC_TYPE_CONTACT] = {};
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
            this.email       = emails.join(";");
            this.text        = match.display;
        } else {
            var email = AjxEmailAddress.parse(match.email);
			if (email) {
				this.fullAddress = email.toString();
				this.name = email.getName();
				this.email = email.getAddress();
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
	this.acType = (this.type == ZmAutocomplete.AC_TYPE_LOCATION || this.type == ZmAutocomplete.AC_TYPE_EQUIPMENT) ?
					this.type : ZmAutocomplete.AC_TYPE_CONTACT;
};

ZmAutocompleteMatch.prototype.toString =
function() {
	return "ZmAutocompleteMatch";
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




/**
 * This class supports autocomplete for our query language.
 *
 * Each search operator that is supported has an associated handler. A handler is a hash which contains the info
 * needed for autocomplete. A handler can have the following properties:
 *
 * 		listType		A handler needs a list of objects to autocomplete against. By default, that list is
 * 						identified by the operator. If more than one operator uses the same list, their handlers
 * 						should use this property to identify the list.
 * 		loader			Function that populates the list of objects. Lists used by more than one operator provide
 * 						their loader separately.
 * 		text			Function that returns a string value of data, to autocomplete against and to display in the
 * 						autocomplete list.
 * 		icon			Function that returns an icon to display in the autocomplete list.
 * 		matchText		Function that returns a string to place in the input when the item is selected. Defaults to
 * 						the 'op:' plus the value of the 'text' attribute.
 * 		quoteMatch		If true, the text that goes into matchText will be place in double quotes.
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

ZmSearchAutocomplete.prototype._registerHandler =
function(op, params) {
	var loadFunc = params.loader || this._loadFunc[params.listType];
	this._op[op] = {loader:new AjxCallback(this, loadFunc), text:params.text, icon:params.icon,
					listType:params.listType || op, matchText:params.matchText || params.text, quoteMatch:params.quoteMatch};
};

/**
 * Returns a list of matches for a given query operator.
 *
 * @param str		[string]					string to match against
 * @param callback	[AjxCallback]				callback to run with results
 * @param aclv		[ZmAutocompleteListView]*	needed to show wait msg
 * @param options	[hash]*						additional options:
 *        type		[constant]*					type of result to match; default is
 * 												ZmAutocomplete.AC_TYPE_CONTACT; other valid values
 * 												are for location or equipment
 *        needItem	[boolean]*					if true, return a ZmItem as part of match result
 */
ZmSearchAutocomplete.prototype.autocompleteMatch =
function(str, callback, aclv, options) {

	if (ZmSearchAutocomplete._ignoreNextKey) {
		ZmSearchAutocomplete._ignoreNextKey = false;
		return;
	}

	str = str.toLowerCase().replace(/"/g, '');

	var m = str.match(/\b([a-z]+):/);
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

ZmSearchAutocomplete.prototype._getMatches =
function(op, str) {

	var opHash = this._op[op];
	var results = [];
	var list = this._list[opHash.listType];
	var rest = str.substr(op.length + 1);
	if (opHash.listType == ZmId.ORG_FOLDER) {
		rest = rest.replace(/^\//, "");	// remove leading slash in folder path
	}
	for (var i = 0, len = list.length; i < len; i++) {
		var o = list[i];
		var text = opHash.text ? opHash.text(o) : o;
		var test = text.toLowerCase();
		if (test.indexOf(rest) == 0) {
			var matchText = opHash.matchText ? opHash.matchText(o) :
								opHash.quoteMatch ? [op, ":", '"', text, '"'].join("") :
													[op, ":", text].join("");
			results.push({text:			text,
						  icon:			opHash.icon ? opHash.icon(o) : null,
						  matchText:	matchText});
		}
	}

	// no need to show list of one item that is same as what was typed
	if (results.length == 1 && results[0].matchText == str) {
		results = [];
	}

	return results;
};

ZmSearchAutocomplete.prototype._handleResponseLoad =
function(op, str, callback) {
	callback.run(this._getMatches(op, str));
};

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

ZmSearchAutocomplete.prototype._loadTypes =
function(listType, callback) {

	AjxDispatcher.require("Browse");
	var attachTypeList = new ZmAttachmentTypeList();
	var respCallback = new AjxCallback(this, this._handleResponseLoadTypes, [attachTypeList, listType, callback]);
	attachTypeList.load(respCallback);
};

ZmSearchAutocomplete.prototype._handleResponseLoadTypes =
function(attachTypeList, listType, callback) {

	this._list[listType] = attachTypeList.getAttachments();
	if (callback) { callback.run(); }
};

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
