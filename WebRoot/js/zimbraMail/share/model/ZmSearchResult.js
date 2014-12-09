/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the search result class.
 */

/**
 * Creates the search result
 * @class
 * This class represents a search result.
 * 
 * @param	{ZmSearch}	search		the search
 */
ZmSearchResult = function(search) {
	if (!search) { return; }
	this._results = {};
	this.search = search;
	this.type = search.searchFor;
};

ZmSearchResult.prototype.isZmSearchResult = true;
ZmSearchResult.prototype.toString = function() { return "ZmSearchResult"; };

/**
 * Gets the results.
 * 
 * @param	{constant}	type	the type
 * @return	{Array}	an array of results
 */
ZmSearchResult.prototype.getResults =
function(type) {

	type = type || this.type;
	if (!this._results) {
		// probably got an exception - return an empty list
		return this._getResultsList(type);
	} else if (this.search.idsOnly) {
		return this._results;
	} else {
		// if we don't have results for the requested type, the search was probably for the wrong type
		return this._results[type] ? this._results[type] : type && this._getResultsList(type);
	}
};

/**
 * Gets the attribute.
 * 
 * @param	{String}	name		the attribute name
 * @return	{Object}	the attribute
 */
ZmSearchResult.prototype.getAttribute = 
function(name) {
	return this._respEl ? this._respEl[name] : null;
};

/**
 * Sets the response.
 * 
 * @private
 */
ZmSearchResult.prototype.set =
function(respEl) {

	if (!this.search) { return; }

	this._respEl = respEl;

	// <match> objects are returned for autocomplete search, not items; let caller handle them
	if (this.search.isAutocompleteSearch) { return; }

	var foundType = {};
	var numTypes = 0;
	var currentType, defaultType;
	var isGalSearch = this.search.isGalSearch;
	
	var _st = new Date();
	var count = 0;
	if (isGalSearch || this.search.isCalResSearch) {
		// process JS eval result for SearchGalRequest
		currentType = defaultType = isGalSearch ? ZmItem.CONTACT : ZmItem.RESOURCE;
		var data = isGalSearch ? respEl.cn : respEl.calresource;
		if (data) {
			if (!this._results[currentType]) {
				// create list as needed - may invoke package load
				this._results[currentType] =  this._getResultsList(currentType);
			}
			for (var j = 0; j < data.length; j++) {
				this._results[currentType].addFromDom(data[j]);
			}

			// manually sort gal results since server won't do it for us :(
			if (isGalSearch) {
				this._results[currentType].getArray().sort(ZmSearchResult._sortGalResults)
			}
			count = data.length;
		}
	} else if (this.search.idsOnly) {
		this._results = respEl.hit || [];
		return;
	} else {
		// process JS eval result for SearchResponse
		var types = this.search.types.getArray();
		defaultType = types[0];

		// bug fix #44232 - resolve default type if none provided
		if (!defaultType) {
			var allTypes = AjxUtil.values(ZmList.NODE);
			for (var i = 0; i < allTypes.length; i++) {
				var t = allTypes[i];
				if (respEl[t]) {
					defaultType = ZmList.ITEM_TYPE[t];
					if (types && types.length == 0) {
						types = [defaultType];
					}
					break;
				}
			}
		}

		if (!defaultType) {
			var curApp = appCtxt.getCurrentAppName();
			var types = ZmApp.SEARCH_TYPES[curApp];
			defaultType = types && types.length && types[0];
		}

		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			var data = respEl[ZmList.NODE[type]];

			// A chat isa message. Futz with the types to deal with this.
			// (Eventually we'll avoid this problem by displying chat history in im app.)
			if (!data && (type == ZmItem.MSG)) {
				data = respEl["chat"];
			}
			// Likewise, a Resource is a Contact. Futz with the types to deal with this.
			if (!data && (type == ZmItem.RESOURCE)) {
				data = respEl[ZmList.NODE[ZmItem.CONTACT]];
			}

			// do a bunch of sanity checks
			if (data && data.length) {
				count += data.length;
				if (!this._results[type]) {
					// create list as needed - may invoke package load
					this._results[type] = this._getResultsList(type);
				}
				for (var j = 0; j < data.length; j++) {
					var item = data[j];
					item._type = type;
					this._results[type].addFromDom(item);
				}

				if (!foundType[type]) {
					foundType[type] = true;
					numTypes++;
					currentType = type;
				}
			}
		}
	}
	if (!count && defaultType) {
		this._results[defaultType] = this._getResultsList(defaultType);
	}
	if ((isGalSearch || this.search.isGalAutocompleteSearch) && this._results[ZmItem.CONTACT]) {
		this._results[ZmItem.CONTACT].setIsGal(true);
	}
	if (this.search.isGalAutocompleteSearch) {
		this.isTokenized = (this._respEl.tokenizeKey != null);
	}
	
	var _en = new Date();
	DBG.println(AjxDebug.DBG1, "TOTAL PARSE TIME for " + count + " NODES: " + (_en.getTime() - _st.getTime()));

	currentType = currentType || defaultType;
	if (numTypes <= 1) {
		this.type = currentType;
	}

	return this.type;
};

/**
 * @private
 */
ZmSearchResult._sortGalResults =
function(a, b) {
	var af = a.getFileAs && a.getFileAs().toLowerCase();
	var bf = b.getFileAs && b.getFileAs().toLowerCase();
	return af < bf ? -1 : (af > bf ? 1 : 0);
};

ZmSearchResult.prototype._getResultsList =
function(type) {

	if (type && typeof(ZmItem.RESULTS_LIST[type]) === "function") {
		return ZmItem.RESULTS_LIST[type](this.search);
	} else {
		DBG.println(
			AjxDebug.DBG1,
			AjxMessageFormat.format(
				"!type || ZmItem.RESULTS_LIST[type] !== function. Active app: {0}, type: {1}, searchFor: {2}.",
				[appCtxt.getCurrentAppName(), type, this.search.searchFor]
			)
		);
		return new ZmList(type, this.search);
	}

};

