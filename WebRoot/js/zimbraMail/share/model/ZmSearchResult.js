function LmSearchResult(appCtxt, search) {

	this._results = new Object();
	if (appCtxt.get(LmSetting.CONVERSATIONS_ENABLED))
		this._results[LmItem.CONV] = new LmMailList(LmItem.CONV, appCtxt, search);
	this._results[LmItem.MSG] = new LmMailList(LmItem.MSG, appCtxt, search);
	if (appCtxt.get(LmSetting.ATT_VIEW_ENABLED))
		this._results[LmItem.ATT] = new LmMailList(LmItem.ATT, appCtxt, search);
	if (appCtxt.get(LmSetting.CONTACTS_ENABLED) || appCtxt.get(LmSetting.GAL_ENABLED))
		this._results[LmItem.CONTACT] = new LmContactList(appCtxt, false);

	this._appCtxt = appCtxt;
	this.search = search;
}

LmSearchResult.prototype.toString = 
function() {
	return "LmSearchResult";
}

LmSearchResult.prototype.dtor = 
function() {
	for (var i = 0; i < LmList.TYPES.length; i++) {
		var type = LmList.TYPES[i];
		if (this._results[type]) {
			this._results[type].clear();
			this._results[type] = null;
		}
	}
	this._results = null;
}

LmSearchResult.prototype.getResults =
function(type) {
	if (type == LmList.MIXED) {
		var list = new LmList(LmList.MIXED, this._appCtxt);
		for (var i = 0; i < LmList.TYPES.length; i++) {
			var type = LmList.TYPES[i];
			var results = this._results[type];
			if (results) {
				var a = results.getArray();
				for (var j = 0; j < a.length; j++)
					list.add(a[j]);
			}
		}
		return list;
	} else {
		return this._results[type];
	}
}

LmSearchResult.prototype.getAttribute = 
function(name) {
	return this._respEl ? this._respEl[name] : null;
}

LmSearchResult.prototype.set =
function(respEl, contactSource) {

	this._respEl = respEl;
	
	var isGalSearch = (contactSource == LmSearchToolBar.FOR_GAL_MI);
	if (contactSource)
		this._results[LmItem.CONTACT].setIsGal(isGalSearch);
	
	var addressHash = new Object();
	var foundType = new Object();
	var numTypes = 0;
	var currentType = null;
	
	var _st = new Date();
	var _count = 0; // XXX: FOR DEBUG USE ONLY :XXX
	if (isGalSearch) {
		// process JS eval result for SearchGalRequest
		currentType = LmItem.CONTACT;
		var data = respEl.cn;
		if (data) {
			for (var j = 0; j < data.length; j++)
				this._results[currentType].addFromDom(data[j], {addressHash: addressHash});
			_count = data.length;
		}
	} else {
		// process JS eval result for SearchResponse
		var types = this.search.types.getArray();
		for (var i = 0; i < types.length; i++) {
			var type = types[i];
			var data = respEl[LmList.NODE[type]];
			
			// do a bunch of sanity checks
			if (this._results[type] && data && (data instanceof Array) && data.length) {
				_count += data.length;
				for (var j = 0; j < data.length; j++)
					this._results[type].addFromDom(data[j], {addressHash: addressHash});

				if (!foundType[type]) {
					foundType[type] = true;
					numTypes++;
					currentType = type;
				}
			}
		}
	}
	
	var _en = new Date();
	DBG.println(LsDebug.DBG1, "TOTAL PARSE TIME for " + _count + " NODES: " + (_en.getTime() - _st.getTime()));
	
	if (numTypes <= 1) {
		this.type = currentType;
	} else {
		this.type = this._appCtxt.get(LmSetting.MIXED_VIEW_ENABLED)
			? LmList.MIXED : currentType;
	}

	return this.type;
}
