/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

function ZmSearchResult(appCtxt, search, isChildWindow) {

	var isChildWindow = isChildWindow || appCtxt.getAppController().isChildWindow();

	this._results = {};
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._results[ZmItem.CONTACT] = new ZmContactList(appCtxt, search, false);
	}
	if (!isChildWindow) {
		if (appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED)) {
			this._results[ZmItem.CONV] = new ZmMailList(ZmItem.CONV, appCtxt, search);
		}
		this._results[ZmItem.MSG] = new ZmMailList(ZmItem.MSG, appCtxt, search);
		if (appCtxt.get(ZmSetting.ATT_VIEW_ENABLED)) {
			this._results[ZmItem.ATT] = new ZmMailList(ZmItem.ATT, appCtxt, search);
		}
		if (appCtxt.get(ZmSetting.NOTEBOOK_ENABLED)) {
			this._results[ZmItem.PAGE] = new ZmPageList(appCtxt, search);
			/***
			// NOTE: Use the same list for document objects
			this._results[ZmItem.DOCUMENT] = this._results[ZmItem.PAGE];
			/***/
			this._results[ZmItem.DOCUMENT] = new ZmPageList(appCtxt, search, ZmItem.DOCUMENT);
			/***/
		}
		if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
			this._results[ZmItem.RESOURCE] = new ZmResourceList(appCtxt, null, search);
		}
	}

	this._appCtxt = appCtxt;
	this.search = search;
};

ZmSearchResult.prototype.toString = 
function() {
	return "ZmSearchResult";
};

ZmSearchResult.prototype.dtor = 
function() {
	for (var i = 0; i < ZmList.TYPES.length; i++) {
		var type = ZmList.TYPES[i];
		if (this._results[type]) {
			this._results[type].clear();
			this._results[type] = null;
		}
	}
	this._results = null;
};

ZmSearchResult.prototype.getResults =
function(type) {
	if (type == ZmList.MIXED) {
		var list = new ZmMailList(ZmList.MIXED, this._appCtxt, this.search);
		for (var i = 0; i < ZmList.TYPES.length; i++) {
			var type = ZmList.TYPES[i];
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

	this._respEl = respEl;
	
	if (this.search.isGalSearch || this.search.isGalAutocompleteSearch) {
		this._results[ZmItem.CONTACT].setIsGal(true);
	}

	var foundType = {};
	var numTypes = 0;
	var currentType = null;
	
	var _st = new Date();
	var _count = 0; // XXX: FOR DEBUG USE ONLY :XXX
	if (this.search.isGalSearch || this.search.isCalResSearch) {
		// process JS eval result for SearchGalRequest
		currentType = this.search.isGalSearch ? ZmItem.CONTACT : ZmItem.RESOURCE;
		var data = this.search.isGalSearch ? respEl.cn : respEl.calresource;
		if (data) {
			for (var j = 0; j < data.length; j++) {
				if (this._results[currentType]) {
					this._results[currentType].addFromDom(data[j]);
				}
			}
			_count = data.length;
		}
	} else {
		// process JS eval result for SearchResponse
		var types = this.search.types.getArray();
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			var data = respEl[ZmList.NODE[type]];

			// do a bunch of sanity checks
			if (this._results[type] && data && data.length) {
				_count += data.length;
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
	
	var _en = new Date();
	DBG.println(AjxDebug.DBG1, "TOTAL PARSE TIME for " + _count + " NODES: " + (_en.getTime() - _st.getTime()));

	if (numTypes <= 1) {
		this.type = currentType;
	} else if (numTypes == 2 && (currentType == ZmItem.PAGE || currentType == ZmItem.DOCUMENT)) {
		this.type = ZmItem.PAGE;
	} else {
		this.type = this._appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED) ? ZmList.MIXED : currentType;
	}

	return this.type;
};
