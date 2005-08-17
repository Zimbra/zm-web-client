function ZmBrowseController(appCtxt, parent) {

	ZmController.call(this, appCtxt);

	var pickers = this._allPickers = this._getPickers();
	this._browseView = new ZmBrowseView(this._shell, pickers);
	this._toolbar = new ZmBrowseToolBar(this._shell, pickers);
	this._browseView._toolbar = this._toolbar;
    var addListener = new AjxListener(this, this._addPickerListener);
	for (var i = 0; i < pickers.length; i++) {
		var id = pickers[i];
		this._toolbar.addSelectionListener(id, addListener);
	}
	this._toolbar.addSelectionListener(ZmPicker.RESET, new AjxListener(this, this._resetListener));
	this._toolbar.addSelectionListener(ZmPicker.CLOSE, new AjxListener(this, this._closeListener));
	this._resetPickers();
	this._browseViewVisible = false;

	var components = new Object();
	components[ZmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR] = this._toolbar;
	components[ZmAppViewMgr.C_SEARCH_BUILDER] = this._browseView;
	this._appCtxt.getAppViewMgr().addComponents(components, true);
}

ZmBrowseController.prototype = new ZmController;
ZmBrowseController.prototype.constructor = ZmBrowseController;

ZmBrowseController.prototype.toString = 
function() {
	return "ZmBrowseController";
}

ZmBrowseController.prototype._getPickers =
function() {
	var list = [ZmPicker.ATTACHMENT,
				ZmPicker.BASIC,
				ZmPicker.DATE,
				ZmPicker.DOMAIN,
				ZmPicker.FOLDER];
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
		list.push(ZmPicker.SEARCH);
	list.push(ZmPicker.SIZE);
	list.push(ZmPicker.OBJECT);
	list.push(ZmPicker.FLAG);
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
		list.push(ZmPicker.TAG);
	list.push(ZmPicker.TIME);

	return list;
}

ZmBrowseController.prototype.getBrowseView =
function() {
	return (this._appCtxt.get(ZmSetting.BROWSE_ENABLED)) ? this._browseView : null;
}

ZmBrowseController.prototype.getBrowseViewVisible =
function() {
	return this._browseViewVisible;
}

ZmBrowseController.prototype.setBrowseViewVisible =
function(visible) {
	if (this._browseViewVisible == visible) return;

	this._appCtxt.getAppViewMgr().showSearchBuilder(visible);
	this._browseViewVisible = visible;
	if (visible) {
		if (this._browseView.getPickers().size() == 0)
			this.addPicker(ZmPicker.DEFAULT_PICKER);
	}
	var browseButton = this._appCtxt.getSearchController().getSearchToolbar().getButton(ZmSearchToolBar.BROWSE_BUTTON);
	browseButton.setToolTipContent(visible ? LmMsg.closeSearchBuilder : LmMsg.openSearchBuilder);
}

/*
* The point of the mess below is to safely construct queries. Some pickers (right now, just
* the basic picker) may have multiple instances that join their queries with OR instead of
* AND (represented as a space). In that case, we need parens around each of the picker
* queries as well as around the query for the type of picker, in order to protect the OR.
*/
ZmBrowseController.prototype._updateQuery =
function(doSearch) {
	var queries = new Array();
	var numPickers = 0;
	for (var id in this._pickers) {
		var a = this._pickers[id].getArray();
		for (var i = 0; i < a.length; i++) {
			var pq = a[i]._query;
			if (pq && pq.length) {
				if (!queries[id]) {
					queries[id] = new Array();
					numPickers++;
				}
				queries[id].push(pq);
			}
		}
	}
	var queryStr = new Array();
	for (var id in queries) {
		var a = queries[id];
		if (a && a.length) {
			if (a.length > 1) {
				var q = new Array();
				var j = ZmPicker.MULTI_JOIN[id];
				var needParen = (j != " ");
				for (var i = 0; i < a.length; i++)
					q.push((needParen && a.length > 1) ? "(" + a[i] + ")" : a[i]);
				var query = q.join(j);
				if (needParen && numPickers > 1)
					query = "(" + query + ")";
				queryStr.push(query);
			} else {
				queryStr.push(a[0]);
			}
		}
	}

	var newQuery = queryStr.join(" ");
	if (newQuery != this._query) {
		this._query = newQuery;
		DBG.println(AjxDebug.DBG3, "Browse query: " + this._query);
		if (doSearch)
			this._appCtxt.getSearchController().search(this._query);
		else if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING))
			this._appCtxt.getSearchController().setSearchField(this._query);
	}
}

ZmBrowseController.prototype._executeQuery =
function() {
	this._appCtxt.getSearchController().search(this._query);
}

ZmBrowseController.prototype._resetListener =
function(ev) {
	this.removeAllPickers();
}

ZmBrowseController.prototype._closeListener =
function(ev) {
	this.setBrowseViewVisible(false);
}

ZmBrowseController.prototype.removeAllPickers =
function(ev) {
	this._browseView.removeAllPickers();
	this._clearQuery();
	this._resetPickers();
}

ZmBrowseController.prototype.addPicker =
function(id) {
	if (ZmPicker.LIMIT[id] != -1 && this._pickers[id].size() >= ZmPicker.LIMIT[id])
		return;

	var ctor = ZmPicker.CTOR[id];
	var picker = new ctor(this._browseView);
	this._browseView.addPicker(picker, id);
	this._pickers[id].add(picker);
	this._numPickers++;
	if (id == ZmPicker.DATE && this._pickers[id].size() == ZmPicker.LIMIT[id])
		picker.secondDate();
    var cb = picker.getCloseButton();
    cb.setData(ZmPicker.KEY_ID, id);
    cb.setData(ZmPicker.KEY_PICKER, picker);
    cb.addSelectionListener(new AjxListener(this, this._pickerCloseListener));
    picker.addPickerListener(new AjxListener(this, this._pickerListener));
	this._updateQuery(true);
	
	// disable picker button if max instances of this picker has been reached
	if (ZmPicker.LIMIT[id] != -1 && this._pickers[id].size() == ZmPicker.LIMIT[id])
		this._toolbar.enable(id, false);
	
	
	return picker;
}

ZmBrowseController.prototype._addPickerListener =
function(ev) {
	try {
		var id = ev.item.getData(ZmPicker.KEY_ID);
		this.addPicker(id);
	} catch (ex) {
		this._handleException(ex, this._addPickerListener, ev, false);
	}
}

ZmBrowseController.prototype._pickerCloseListener =
function(ev) {
    var b = ev.item;
	var picker = b.getData(ZmPicker.KEY_PICKER);
	this._browseView.removePicker(picker);
	var id = b.getData(ZmPicker.KEY_ID);
	this._pickers[id].remove(picker);
	this._numPickers--;
	if (this._numPickers == 0) {
		this._clearQuery();
	} else {
		this._updateQuery(true);
	}
	// enable picker button if max instances of this picker has not been reached
	if (ZmPicker.LIMIT[id] != -1 && this._pickers[id].size() < ZmPicker.LIMIT[id])
		this._toolbar.enable(id, true);
	
}

ZmBrowseController.prototype._clearQuery =
function() {
	this._query = "";
	this._appCtxt.getSearchController().setSearchField("");
}

ZmBrowseController.prototype._pickerListener =
function(ev) {
	if (ev.type != ZmEvent.S_PICKER)
		return;
	if (ev.event == ZmEvent.E_MODIFY) {
		this._updateQuery(false);
	} else if (ev.event == ZmEvent.E_LOAD) {
		this._executeQuery();
	}
}

ZmBrowseController.prototype._resetPickers =
function() {
	this._pickers = new Object();
	for (var i = 0; i < this._allPickers.length; i++) {
		var id = this._allPickers[i];
		this._pickers[id] = new AjxVector();
		this._toolbar.enable(id, true);
	}
	this._numPickers = 0;
}
