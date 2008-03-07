/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmSearchResult = function(search) {
	if (!search) { return; }
	this._results = {};
	this.search = search;
};

ZmSearchResult.prototype.toString = 
function() {
	return "ZmSearchResult";
};

ZmSearchResult.prototype.dtor = 
function() {
	for (var type in this._results) {
		if (this._results[type].clear) {
			this._results[type].clear();
			this._results[type] = null;
		}
	}
	this._results = null;
};

ZmSearchResult.prototype.getResults =
function(type) {
	if (!this._results) {
		// probably got an exception - return an empty list
		return ZmItem.RESULTS_LIST[type](this.search);
	}
	if (type == ZmItem.MIXED) {
		var list = new ZmMailList(ZmItem.MIXED, this.search);
		for (var type in this._results) {
			var results = this._results[type];
			if (results && results.size()) {
				var a = results.getArray();
				for (var j = 0; j < a.length; j++) {
					list.add(a[j]);
				}
			}
		}
		return list;
	} else {
		// if we don't have results for the requested type, the search was probably for the wrong type
		return this._results[type] ? this._results[type] : ZmItem.RESULTS_LIST[type](this.search);
	}
};

ZmSearchResult.prototype.getAttribute = 
function(name) {
	return this._respEl ? this._respEl[name] : null;
};

ZmSearchResult.prototype.set =
function(respEl) {

	if (!this.search) { return; }
	this._respEl = respEl;
	
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
				this._results[currentType] = ZmItem.RESULTS_LIST[currentType](this.search);
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
	} else {
		// process JS eval result for SearchResponse
		var types = this.search.types.getArray();
		defaultType = types[0];
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			var data = respEl[ZmList.NODE[type]];

			// do a bunch of sanity checks
			if (data && data.length) {
				count += data.length;
				if (!this._results[type]) {
					// create list as needed - may invoke package load
					this._results[type] = ZmItem.RESULTS_LIST[type](this.search);
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
	if (!count) {
		this._results[defaultType] = ZmItem.RESULTS_LIST[defaultType](this.search);
	}
	if ((isGalSearch || this.search.isGalAutocompleteSearch) && this._results[ZmItem.CONTACT]) {
		this._results[ZmItem.CONTACT].setIsGal(true);
	}
	if (this.search.isGalAutocompleteSearch) {
		this.isTokenized = (this._respEl.tokenizeKey != null);
	}
	
	var _en = new Date();
	DBG.println(AjxDebug.DBG1, "TOTAL PARSE TIME for " + count + " NODES: " + (_en.getTime() - _st.getTime()));

	if (numTypes <= 1) {
		this.type = currentType;
	} else if (numTypes == 2 && (currentType == ZmItem.PAGE || currentType == ZmItem.DOCUMENT)) {
		this.type = ZmItem.PAGE;
	} else {
		this.type = appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED) ? ZmItem.MIXED : currentType;
	}

	return this.type;
};

ZmSearchResult._sortGalResults =
function(a, b) {
	var af = a.getFileAs().toLowerCase();
	var bf = b.getFileAs().toLowerCase();
	return af < bf ? -1 : (af > bf ? 1 : 0);
};
