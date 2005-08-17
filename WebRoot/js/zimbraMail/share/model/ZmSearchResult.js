function ZmSearchResult(appCtxt, search) {

	this._results = new Object();
	if (appCtxt.get(ZmSetting.CONVERSATIONS_ENABLED))
		this._results[ZmItem.CONV] = new ZmMailList(ZmItem.CONV, appCtxt, search);
	this._results[ZmItem.MSG] = new ZmMailList(ZmItem.MSG, appCtxt, search);
	if (appCtxt.get(ZmSetting.ATT_VIEW_ENABLED))
		this._results[ZmItem.ATT] = new ZmMailList(ZmItem.ATT, appCtxt, search);
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED))
		this._results[ZmItem.CONTACT] = new ZmContactList(appCtxt, false);

	this._appCtxt = appCtxt;
	this.search = search;
}

ZmSearchResult.prototype.toString = 
function() {
	return "ZmSearchResult";
}

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
}

ZmSearchResult.prototype.getResults =
function(type) {
	if (type == ZmList.MIXED) {
		var list = new ZmList(ZmList.MIXED, this._appCtxt);
		for (var i = 0; i < ZmList.TYPES.length; i++) {
			var type = ZmList.TYPES[i];
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

ZmSearchResult.prototype.getAttribute = 
function(name) {
	return this._respEl ? this._respEl[name] : null;
}

ZmSearchResult.prototype.set =
function(respEl, contactSource) {

	this._respEl = respEl;
	
	var isGalSearch = (contactSource == ZmSearchToolBar.FOR_GAL_MI);
	if (contactSource)
		this._results[ZmItem.CONTACT].setIsGal(isGalSearch);
	
	var addressHash = new Object();
	var foundType = new Object();
	var numTypes = 0;
	var currentType = null;
	
	var _st = new Date();
	var _count = 0; // XXX: FOR DEBUG USE ONLY :XXX
	if (isGalSearch) {
		// process JS eval result for SearchGalRequest
		currentType = ZmItem.CONTACT;
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
			var data = respEl[ZmList.NODE[type]];
			
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
	DBG.println(AjxDebug.DBG1, "TOTAL PARSE TIME for " + _count + " NODES: " + (_en.getTime() - _st.getTime()));
	
	if (numTypes <= 1) {
		this.type = currentType;
	} else {
		this.type = this._appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED)
			? ZmList.MIXED : currentType;
	}

	return this.type;
}
