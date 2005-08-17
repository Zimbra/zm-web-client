function LmBrowseController(appCtxt, parent) {

	LmController.call(this, appCtxt);

	var pickers = this._allPickers = this._getPickers();
	this._browseView = new LmBrowseView(this._shell, pickers);
	this._toolbar = new LmBrowseToolBar(this._shell, pickers);
	this._browseView._toolbar = this._toolbar;
    var addListener = new LsListener(this, this._addPickerListener);
	for (var i = 0; i < pickers.length; i++) {
		var id = pickers[i];
		this._toolbar.addSelectionListener(id, addListener);
	}
	this._toolbar.addSelectionListener(LmPicker.RESET, new LsListener(this, this._resetListener));
	this._toolbar.addSelectionListener(LmPicker.CLOSE, new LsListener(this, this._closeListener));
	this._resetPickers();
	this._browseViewVisible = false;

	var components = new Object();
	components[LmAppViewMgr.C_SEARCH_BUILDER_TOOLBAR] = this._toolbar;
	components[LmAppViewMgr.C_SEARCH_BUILDER] = this._browseView;
	this._appCtxt.getAppViewMgr().addComponents(components, true);
}

LmBrowseController.prototype = new LmController;
LmBrowseController.prototype.constructor = LmBrowseController;

LmBrowseController.prototype.toString = 
function() {
	return "LmBrowseController";
}

LmBrowseController.prototype._getPickers =
function() {
	var list = [LmPicker.ATTACHMENT,
				LmPicker.BASIC,
				LmPicker.DATE,
				LmPicker.DOMAIN,
				LmPicker.FOLDER];
	if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED))
		list.push(LmPicker.SEARCH);
	list.push(LmPicker.SIZE);
	list.push(LmPicker.OBJECT);
	list.push(LmPicker.FLAG);
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
		list.push(LmPicker.TAG);
	list.push(LmPicker.TIME);

	return list;
}

LmBrowseController.prototype.getBrowseView =
function() {
	return (this._appCtxt.get(LmSetting.BROWSE_ENABLED)) ? this._browseView : null;
}

LmBrowseController.prototype.getBrowseViewVisible =
function() {
	return this._browseViewVisible;
}

LmBrowseController.prototype.setBrowseViewVisible =
function(visible) {
	if (this._browseViewVisible == visible) return;

	this._appCtxt.getAppViewMgr().showSearchBuilder(visible);
	this._browseViewVisible = visible;
	if (visible) {
		if (this._browseView.getPickers().size() == 0)
			this.addPicker(LmPicker.DEFAULT_PICKER);
	}
	var browseButton = this._appCtxt.getSearchController().getSearchToolbar().getButton(LmSearchToolBar.BROWSE_BUTTON);
	browseButton.setToolTipContent(visible ? LmMsg.closeSearchBuilder : LmMsg.openSearchBuilder);
}

/*
* The point of the mess below is to safely construct queries. Some pickers (right now, just
* the basic picker) may have multiple instances that join their queries with OR instead of
* AND (represented as a space). In that case, we need parens around each of the picker
* queries as well as around the query for the type of picker, in order to protect the OR.
*/
LmBrowseController.prototype._updateQuery =
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
				var j = LmPicker.MULTI_JOIN[id];
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
		DBG.println(LsDebug.DBG3, "Browse query: " + this._query);
		if (doSearch)
			this._appCtxt.getSearchController().search(this._query);
		else if (this._appCtxt.get(LmSetting.SHOW_SEARCH_STRING))
			this._appCtxt.getSearchController().setSearchField(this._query);
	}
}

LmBrowseController.prototype._executeQuery =
function() {
	this._appCtxt.getSearchController().search(this._query);
}

LmBrowseController.prototype._resetListener =
function(ev) {
	this.removeAllPickers();
}

LmBrowseController.prototype._closeListener =
function(ev) {
	this.setBrowseViewVisible(false);
}

LmBrowseController.prototype.removeAllPickers =
function(ev) {
	this._browseView.removeAllPickers();
	this._clearQuery();
	this._resetPickers();
}

LmBrowseController.prototype.addPicker =
function(id) {
	if (LmPicker.LIMIT[id] != -1 && this._pickers[id].size() >= LmPicker.LIMIT[id])
		return;

	var ctor = LmPicker.CTOR[id];
	var picker = new ctor(this._browseView);
	this._browseView.addPicker(picker, id);
	this._pickers[id].add(picker);
	this._numPickers++;
	if (id == LmPicker.DATE && this._pickers[id].size() == LmPicker.LIMIT[id])
		picker.secondDate();
    var cb = picker.getCloseButton();
    cb.setData(LmPicker.KEY_ID, id);
    cb.setData(LmPicker.KEY_PICKER, picker);
    cb.addSelectionListener(new LsListener(this, this._pickerCloseListener));
    picker.addPickerListener(new LsListener(this, this._pickerListener));
	this._updateQuery(true);
	
	// disable picker button if max instances of this picker has been reached
	if (LmPicker.LIMIT[id] != -1 && this._pickers[id].size() == LmPicker.LIMIT[id])
		this._toolbar.enable(id, false);
	
	
	return picker;
}

LmBrowseController.prototype._addPickerListener =
function(ev) {
	try {
		var id = ev.item.getData(LmPicker.KEY_ID);
		this.addPicker(id);
	} catch (ex) {
		this._handleException(ex, this._addPickerListener, ev, false);
	}
}

LmBrowseController.prototype._pickerCloseListener =
function(ev) {
    var b = ev.item;
	var picker = b.getData(LmPicker.KEY_PICKER);
	this._browseView.removePicker(picker);
	var id = b.getData(LmPicker.KEY_ID);
	this._pickers[id].remove(picker);
	this._numPickers--;
	if (this._numPickers == 0) {
		this._clearQuery();
	} else {
		this._updateQuery(true);
	}
	// enable picker button if max instances of this picker has not been reached
	if (LmPicker.LIMIT[id] != -1 && this._pickers[id].size() < LmPicker.LIMIT[id])
		this._toolbar.enable(id, true);
	
}

LmBrowseController.prototype._clearQuery =
function() {
	this._query = "";
	this._appCtxt.getSearchController().setSearchField("");
}

LmBrowseController.prototype._pickerListener =
function(ev) {
	if (ev.type != LmEvent.S_PICKER)
		return;
	if (ev.event == LmEvent.E_MODIFY) {
		this._updateQuery(false);
	} else if (ev.event == LmEvent.E_LOAD) {
		this._executeQuery();
	}
}

LmBrowseController.prototype._resetPickers =
function() {
	this._pickers = new Object();
	for (var i = 0; i < this._allPickers.length; i++) {
		var id = this._allPickers[i];
		this._pickers[id] = new LsVector();
		this._toolbar.enable(id, true);
	}
	this._numPickers = 0;
}
