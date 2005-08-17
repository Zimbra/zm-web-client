function LmSearchController(appCtxt, container) {

	LmController.call(this, appCtxt, container);

	this._inited = false;
	
	// default menu values
	this._searchFor = LmSearchToolBar.FOR_MAIL_MI;
	this._contactSource = LmItem.CONTACT;
	this._results = null;

	if (this._appCtxt.get(LmSetting.SEARCH_ENABLED))
		this._setView();
}

LmSearchController.prototype = new LmController;
LmSearchController.prototype.constructor = LmSearchController;

LmSearchController.prototype.toString = 
function() {
	return "LmSearchController";
}

LmSearchController.prototype.getSearchPanel =
function() {
	return this._searchPanel;
}

LmSearchController.prototype.getSearchToolbar = 
function() {
	return this._searchToolBar;
}

LmSearchController.prototype.fromSearch = 
function(address) {
	// bug fix #3297 - always search for mail when doing a "from: <address>" search
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	this.search("from:(" + address + ")", [groupBy]);
}

LmSearchController.prototype.fromBrowse = 
function(name) {
	var bv = this.showBrowseView(true);
	bv.removeAllPickers();
	this._browseViewController.removeAllPickers();
	var picker = this._browseViewController.addPicker(LmPicker.BASIC);
	picker.setFrom(name);
	picker.execute();
}

LmSearchController.prototype.showBrowseView = 
function(forceShow) {
	var bvc = this._browseViewController;
	var show, bv;
	if (!bvc) {
		show = true;
		bvc = this._browseViewController = new LmBrowseController(this._appCtxt, this._searchPanel);
		bvc.setBrowseViewVisible(show);
		bv = bvc.getBrowseView();
	} else {
		show = forceShow || !bvc.getBrowseViewVisible();
		bvc.setBrowseViewVisible(show);
		bv = bvc.getBrowseView();
	}
	
   	return bv;
}

LmSearchController.prototype.getBrowseView =
function() {
	var bvc = this._browseViewController;
	return (bvc == null) ? null : bvc.getBrowseView();
}

LmSearchController.prototype.setSearchField =
function(searchString) {
	if (this._searchToolBar)
		this._searchToolBar.setSearchFieldValue(searchString);
}

LmSearchController.prototype.getSearchFieldValue =
function() {
	return this._searchToolBar ? this._searchToolBar.getSearchFieldValue() : "";
}

LmSearchController.prototype.setEnabled =
function(enabled) {
	if (this._searchToolBar)
		this._searchToolBar.setEnabled(enabled);
}

/**
* Provides a programmatic way to set the search type. So that it doesn't override a user's
* choice, it only works if there's a current system-set default, or the "force" flag is set.
* Any time a user chooses a type through the menu, the default is cleared.
*
* @param type		the search type to set as the default
* @param force		override user choice
*/
LmSearchController.prototype.setDefaultSearchType =
function(type, force) {
	if (this._defaultSearchType || force) {
		if (this._searchToolBar) {
			var menu = this._searchToolBar.getButton(LmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
			menu.checkItem(LmSearchToolBar.MENUITEM_ID, type);
		}
		this._defaultSearchType = type;
	}
}
	
LmSearchController.prototype._setView =
function() {
	// Create search panel - a composite is needed because the search builder 
	// element (LmBrowseView) is added to it (can't add it to the toolbar)
	this._searchPanel = new DwtComposite(this._container, "SearchPanel", Dwt.ABSOLUTE_STYLE);
	this._searchToolBar = new LmSearchToolBar(this._appCtxt, this._searchPanel);
	
	// Register keyboard callback for search field
	this._searchToolBar.registerCallback(this._searchFieldCallback, this);
	
    // Menu and button listeners
    var searchMenuListener = new LsListener(this, this._searchMenuListener);
    var m = this._searchToolBar.getButton(LmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
    var items = m.getItems();
    for (var i = 0; i < items.length; i++) {
    	var item = items[i];
		item.addSelectionListener(searchMenuListener);
		var mi = item.getData(LmSearchToolBar.MENUITEM_ID);
		// set mail as default search
     	if (mi == LmSearchToolBar.FOR_MAIL_MI)
    		item.setChecked(true, true);
    }

	this._searchToolBar.addSelectionListener(LmSearchToolBar.SEARCH_BUTTON, new LsListener(this, this._searchButtonListener));
	if (this._appCtxt.get(LmSetting.BROWSE_ENABLED))
		this._searchToolBar.addSelectionListener(LmSearchToolBar.BROWSE_BUTTON, new LsListener(this, this._browseButtonListener));
	if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED))
		this._searchToolBar.addSelectionListener(LmSearchToolBar.SAVE_BUTTON, new LsListener(this, this._saveButtonListener));
}

LmSearchController.prototype.search =
function(query, types, sortBy, offset, limit, callback) {
	if (!(query && query.length)) return;
	
	// if the search string starts with "$set:" then it is a command to the client 
	if (query.indexOf("$set:") == 0) {
		this._appCtxt.getClientCmdHdlr().execute((query.substr(5)).split(" "));
		return;
	}

	var params = {query: query, types: types, sortBy: sortBy, offset: offset, limit: limit, callback: callback};
	this._schedule(this._doSearch, params);
}

/**
* Performs the given search. It takes a LmSearch, rather than constructing one out of the currently selected menu
* choices. Aside from re-executing a search, it can be used to perform a canned search.
*/
LmSearchController.prototype.redoSearch =
function(search, callback, changes) {
	search.callback = callback;
	var newSearch;
	if (changes) {
		newSearch = new LmSearch(this._appCtxt, search.query, search.types, search.sortBy,
								 search.offset, search.limit, search.contactSource);
		newSearch.callback = callback;
		for (var key in changes) 
			newSearch[key] = changes[key];
	} else {
		newSearch = search;
	}
	this._schedule(this._doSearch, newSearch);
}

// Assemble a list of item types to return based on the current values of the search menu.
// They're pushed onto a list in preparation for the search menu having checkboxes.
LmSearchController.prototype._getTypes =
function() {
	var types = new LsVector();
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	if (this._searchFor == LmSearchToolBar.FOR_MAIL_MI) {
		types.add(groupBy);
	} else if (this._searchFor == LmSearchToolBar.FOR_ANY_MI) {
		types.add(groupBy);
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
			types.add(LmItem.CONTACT);
		if (this._appCtxt.get(LmSetting.CALENDAR_ENABLED))
			types.add(LmItem.APPT);
		if (this._appCtxt.get(LmSetting.NOTES_ENABLED))
			types.add(LmItem.NOTE);
	} else {
		types.add(this._searchFor);
	}
	return types;
}

LmSearchController.prototype._getSuitableSortBy = 
function(types) {
	var sortBy = null;
	
	if (types.size() == 1) {
		var type = types.get(0);
		var viewType = null;
		switch (type) {
			case LmItem.CONV: 	viewType = LmController.CONVLIST_VIEW; break;
			case LmItem.MSG: 	viewType = LmController.TRAD_VIEW; break;
			// more types go here as they are suported...
		}
		
		if (viewType)
			sortBy = this._appCtxt.get(LmSetting.SORTING_PREF, viewType);
	}
	
	return sortBy;
}


LmSearchController.prototype._doSearch =
function(params) {
	if (this._searchToolBar) {
		var value = this._appCtxt.get(LmSetting.SHOW_SEARCH_STRING) ? params.query : "";
		this._searchToolBar.setSearchFieldValue(value);
		this._searchToolBar.setEnabled(false);
	}

	// get types from search menu if not passed in
	var types = params.types || this._getTypes();
	if (types instanceof Array) // convert array to LsVector if necessary
		types = LsVector.fromArray(types);

	// only set contact source if we are searching for contacts
	var contactSource = (types.contains(LmItem.CONTACT) || types.contains(LmSearchToolBar.FOR_GAL_MI))
		? this._contactSource : null;
	// find suitable sort by value if not given one (and if applicable)
	params.sortBy = params.sortBy || this._getSuitableSortBy(types);
	
	var search = new LmSearch(this._appCtxt, params.query, types, params.sortBy, params.offset, params.limit, contactSource);
	var results;
	try {
		results = search.execute();
	} catch (ex) {
		this._searchToolBar.setEnabled(true);
		DBG.println(LsDebug.DBG2, "Search exception: " + ex.code);
		// Only restart on error if we are not initialized
		if (ex.code == LsCsfeException.MAIL_NO_SUCH_FOLDER || ex.code == LsCsfeException.MAIL_NO_SUCH_TAG) {
			results = new LmSearchResult(this._appCtxt);
			results.type = params.types ? params.types[0]: null;
			var msg = this._getErrorMsg(ex.code);
			this._appCtxt.getAppController().setStatusMsg(msg);
		} else {
			this._handleException(ex, this._doSearch, params, false);
			return;
		}
	}
	if (!results) return;

	DBG.timePt("execute search");
	this._appCtxt.setCurrentSearch(search);
	if (this._searchToolBar)
		this._searchToolBar.setEnabled(true);
	if (!results.type)
		results.type = types.get(0);
	
	if (params.callback) {
		params.callback.run(results);
		return;
	} 

	// allow old results to dtor itself
	if (this._results)
		this._results.dtor();
	this._results = results;

	DBG.timePt("handle search results");
	if (results.type == LmItem.CONV) {
		this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getConvListController().show(results, params.query);
	} else if (results.type == LmItem.MSG) {
		this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getTradController().show(results, params.query);
	} else if (results.type == LmItem.CONTACT) {
		this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactListController().show(results, params.query, this._contactSource == LmSearchToolBar.FOR_GAL_MI);
	} else if (results.type == LmList.MIXED) {
		this._appCtxt.getApp(LmLiquidMail.MIXED_APP).getMixedController().show(results, params.query);
	}
//	Dwt.setTitle(search.getTitle());
	DBG.timePt("render search results");
}

/*********** Search Field Callback */

LmSearchController.prototype._searchFieldCallback =
function(queryString) {
	this.search(queryString);
}

/*********** Search Bar Callbacks */

LmSearchController.prototype._searchButtonListener =
function(ev) {
	var queryString = this._searchToolBar.getSearchFieldValue();
	this.search(queryString);
}

LmSearchController.prototype._browseButtonListener =
function(ev) {
	this.showBrowseView();
}

LmSearchController.prototype._saveButtonListener =
function(ev) {
	if (this._results && this._results.search) {
		var ftc = this._appCtxt.getOverviewPanelController().getFolderTreeController();
		ftc._showDialog(ftc._getNewSearchDialog(), ftc._newSearchCallback, this._results.search);
	}
}

LmSearchController.prototype._searchMenuListener = 
function(ev) {
	if (ev.detail != DwtMenuItem.CHECKED) return;

	var id = ev.item.getData(LmSearchToolBar.MENUITEM_ID);
	this._searchFor = id;
	if (id == LmItem.CONTACT || id == LmSearchToolBar.FOR_GAL_MI)
		this._contactSource = id;

	var tooltip = LmMsg[LmSearchToolBar.TT_MSG_KEY[id]];
	var image = LmSearchToolBar.ICON_KEY[id];
	
	if (id == LmSearchToolBar.FOR_MAIL_MI) {
		var groupBy = this._appCtxt.getSettings().getGroupMailBy();
		tooltip = LmMsg[LmSearchToolBar.TT_MSG_KEY[groupBy]];
	}

	var searchMenuBtn = this._searchToolBar.getButton(LmSearchToolBar.SEARCH_MENU_BUTTON);
	
	var mi = searchMenuBtn.getMenu().getItemById(LmSearchToolBar.MENUITEM_ID, id);
	image = mi._imageInfo;
	
	if (tooltip) {
		var button = this._searchToolBar.getButton(LmSearchToolBar.SEARCH_BUTTON);
		button.setToolTipContent(tooltip);
	}

	this._defaultSearchType = null; // clear system default now that user has spoken
}

LmSearchController.prototype.setGroupMailBy =
function(id) {
	var tooltip = LmMsg[LmSearchToolBar.TT_MSG_KEY[id]];
	this._searchToolBar.getButton(LmSearchToolBar.SEARCH_BUTTON).setToolTipContent(tooltip);
}
