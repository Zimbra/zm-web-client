/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSearchResult(appCtxt, search) {
	if (!search) { return; }
	this._results = {};
	this._appCtxt = appCtxt;
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
	if (!this._results) { return null; }
	if (type == ZmItem.MIXED) {
		var list = new ZmMailList(ZmItem.MIXED, this._appCtxt, this.search);
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
		return this._results[type];
	}
};

ZmSearchResult.prototype.getAttribute = 
function(name) {
	return this._respEl ? this._respEl[name] : null;
};

ZmSearchResult.prototype.set =
function(respEl, contactSource) {

	if (!this.search) { return; }
	this._respEl = respEl;
	
	var foundType = {};
	var numTypes = 0;
	var currentType, defaultType;
	
	var _st = new Date();
	var count = 0;
	if (this.search.isGalSearch || this.search.isCalResSearch) {
		// process JS eval result for SearchGalRequest
		currentType = defaultType = this.search.isGalSearch ? ZmItem.CONTACT : ZmItem.RESOURCE;
		var data = this.search.isGalSearch ? respEl.cn : respEl.calresource;
		if (data) {
			if (!this._results[currentType]) {
				// create list as needed - may invoke package load
				this._results[currentType] = ZmItem.RESULTS_LIST[currentType](this.search);
			}
			for (var j = 0; j < data.length; j++) {
				this._results[currentType].addFromDom(data[j]);
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
	if ((this.search.isGalSearch || this.search.isGalAutocompleteSearch) && this._results[ZmItem.CONTACT]) {
		this._results[ZmItem.CONTACT].setIsGal(true);
	}
	
	var _en = new Date();
	DBG.println(AjxDebug.DBG1, "TOTAL PARSE TIME for " + count + " NODES: " + (_en.getTime() - _st.getTime()));

	if (numTypes <= 1) {
		this.type = currentType;
	} else if (numTypes == 2 && (currentType == ZmItem.PAGE || currentType == ZmItem.DOCUMENT)) {
		this.type = ZmItem.PAGE;
	} else {
		this.type = this._appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED) ? ZmItem.MIXED : currentType;
	}

	return this.type;
};
