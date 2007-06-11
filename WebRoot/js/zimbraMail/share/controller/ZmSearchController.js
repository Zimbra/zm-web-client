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

ZmSearchController = function(appCtxt, container) {

	ZmController.call(this, appCtxt, container);

	this._inited = false;

	// default menu values
	this._searchFor = ZmSearchToolBar.FOR_MAIL_MI;
	this._contactSource = ZmItem.CONTACT;
	this._results = null;

	if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED))
		this._setView();
}

ZmSearchController.prototype = new ZmController;
ZmSearchController.prototype.constructor = ZmSearchController;


// Consts
ZmSearchController.QUERY_ISREMOTE = "(is:remote OR is:local)";


ZmSearchController.prototype.toString =
function() {
	return "ZmSearchController";
}

ZmSearchController.prototype.getSearchPanel =
function() {
	return this._searchPanel;
}

ZmSearchController.prototype.getSearchToolbar =
function() {
	return this._searchToolBar;
}

ZmSearchController.prototype.dateSearch =
function(d) {
    d = d || new Date();
    var date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
	var groupBy = this._appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	var query = "date:" + date;
	this.search({query:query, types:[groupBy]});
};

ZmSearchController.prototype.fromSearch =
function(address) {
	// always search for mail when doing a "from: <address>" search
	var groupBy = this._appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	var query = "from:(" + address + ")";
	this.search({query:query, types:[groupBy]});
};

ZmSearchController.prototype.fromBrowse =
function(name) {
	// showBrowseView() may need load of Browse package
	var loadCallback = new AjxCallback(this, this._handleLoadFromBrowse, [name]);
	this.showBrowseView(true, loadCallback);
};

ZmSearchController.prototype._handleLoadFromBrowse =
function(name, bv) {
	bv.removeAllPickers();
	this._browseViewController.removeAllPickers();
	var picker = this._browseViewController.addPicker(ZmPicker.BASIC);
	picker.setFrom(name);
	picker.execute();
};

/**
 * Shows or hides the Advanced Search panel, which contains various pickers.
 * Since it may require loading the "Browse" package, callers should use a 
 * callback to run subsequent code. By default, the display of the panel is
 * toggled.
 * 
 * @param forceShow		[boolean]*		if true, show panel
 * @param callback		[AjxCallback]*	callback to run after display is done
 */
ZmSearchController.prototype.showBrowseView =
function(forceShow, callback) {
	if (!this._browseViewController) {
		var loadCallback = new AjxCallback(this, this._handleLoadShowBrowseView, [callback]);
		AjxDispatcher.require("Browse", false, loadCallback, null, true);
	} else {
		var bvc = this._browseViewController;
		bvc.setBrowseViewVisible(forceShow || !bvc.getBrowseViewVisible());
		if (callback) {
			callback.run(bvc.getBrowseView());
		}
	}
};

ZmSearchController.prototype._handleLoadShowBrowseView =
function(callback) {
	this._appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);
	var bvc = this._browseViewController = new ZmBrowseController(this._appCtxt, this._searchPanel);
	bvc.setBrowseViewVisible(true);
	if (callback) {
		callback.run(bvc.getBrowseView());
	}
};

ZmSearchController.prototype.getBrowseView =
function() {
	var bvc = this._browseViewController;
	return (bvc == null) ? null : bvc.getBrowseView();
}

ZmSearchController.prototype.setSearchField =
function(searchString) {
	if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) && this._searchToolBar)
		this._searchToolBar.setSearchFieldValue(searchString);
	else
		this._currentQuery = searchString;
}

ZmSearchController.prototype.getSearchFieldValue =
function() {
	return this._searchToolBar ? this._searchToolBar.getSearchFieldValue() : "";
}

ZmSearchController.prototype.setEnabled =
function(enabled) {
	if (this._searchToolBar)
		this._searchToolBar.setEnabled(enabled);
}

/**
 * Provides a programmatic way to set the search type.
 *
 * @param type		the search type to set as the default
 */
ZmSearchController.prototype.setDefaultSearchType =
function(type) {
	if (this._searchToolBar) {
		var menu = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
		menu.checkItem(ZmSearchToolBar.MENUITEM_ID, type);
		this._searchMenuListener(null, type, true);
	}
};

ZmSearchController.prototype._setView =
function() {
	// Create search panel - a composite is needed because the search builder
	// element (ZmBrowseView) is added to it (can't add it to the toolbar)
	this._searchPanel = new DwtComposite(this._container, "SearchPanel", Dwt.ABSOLUTE_STYLE);
	this._searchToolBar = new ZmSearchToolBar(this._appCtxt, this._searchPanel);

	var tg = this._createTabGroup();
	tg.addMember(this._searchToolBar.getSearchField());
	tg.addMember(this._searchToolBar);

	// Register keyboard callback for search field
	this._searchToolBar.registerCallback(this._searchFieldCallback, this);

    // Menu and button listeners
    var searchMenuListener = new AjxListener(this, this._searchMenuListener);
    var m = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
    var items = m.getItems();
    for (var i = 0; i < items.length; i++) {
    	var item = items[i];
		item.addSelectionListener(searchMenuListener);
		var mi = item.getData(ZmSearchToolBar.MENUITEM_ID);
		// set mail as default search
     	if (mi == ZmSearchToolBar.FOR_MAIL_MI)
    		item.setChecked(true, true);
    }

	this._searchToolBar.addSelectionListener(ZmSearchToolBar.SEARCH_MENU_BUTTON, new AjxListener(this, this._searchButtonListener));
	if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED))
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.BROWSE_BUTTON, new AjxListener(this, this._browseButtonListener));
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.SAVE_BUTTON, new AjxListener(this, this._saveButtonListener));
}

/**
* Performs a search and displays the results.
*
* @param query			[string]			search string
* @param types			[Array]*			item types to search for
* @param sortBy			[constant]*			sort constraint
* @param offset			[int]*				starting point in list of matching items
* @param limit			[int]*				maximum number of items to return
* @param searchId		[int]*				ID of owning search folder (if any)
* @param prevId			[int]*				ID of last items displayed (for pagination)
* @param prevSortBy		[constant]*			previous sort order (for pagination)
* @param noRender		[boolean]*			if true, results will not be passed to controller
* @param userText		[boolean]*			true if text was typed by user into search box
* @param callback		[AjxCallback]*		async callback
* @param errorCallback	[AjxCallback]*		async callback to run if there is an exception
*/
ZmSearchController.prototype.search =
function(params) {
	if (!(params.query && params.query.length)) return;

	// if the search string starts with "$set:" then it is a command to the client
	if (params.query.indexOf("$set:") == 0 || params.query.indexOf("$cmd:") == 0) {
		this._appCtxt.getClientCmdHdlr().execute((params.query.substr(5)), this);
		return;
	}

	var respCallback = new AjxCallback(this, this._handleResponseSearch, [params.callback]);
	this._doSearch(params, params.noRender, respCallback, params.errorCallback);
}

ZmSearchController.prototype._handleResponseSearch =
function(callback, result) {
	if (callback) {
		callback.run(result);
	}
};

/**
* Performs the given search. It takes a ZmSearch, rather than constructing one out of the currently selected menu
* choices. Aside from re-executing a search, it can be used to perform a canned search.
*
* @param search			[ZmSearch]			search object
* @param noRender		[boolean]*			if true, results will not be passed to controller
* @param changes		[Object]*			hash of changes to make to search
* @param callback		[AjxCallback]*		async callback
* @param errorCallback	[AjxCallback]*		async callback to run if there is an exception
*/
ZmSearchController.prototype.redoSearch =
function(search, noRender, changes, callback, errorCallback) {
	var params = {};
	params.query		= search.query;
	params.types		= search.types;
	params.sortBy		= search.sortBy;
	params.offset		= search.offset;
	params.limit		= search.limit;
	params.prevId		= search.prevId;
	params.prevSortBy	= search.prevSortBy;
	params.fetch		= search.fetch;
	params.searchId		= search.searchId;
	params.lastSortVal	= search.lastSortVal;
	params.lastId		= search.lastId;
	params.soapInfo		= search.soapInfo;

	if (changes) {
		for (var key in changes)
			params[key] = changes[key];
	}

	this._doSearch(params, noRender, callback, errorCallback);
}

/**
 * Assembles a list of item types to return based on a search menu value (which can
 * be passed in).
 *
 * @param searchFor		the value of a search menu item (see ZmSearchToolBar)
 * TODO: APPS
 */
ZmSearchController.prototype.getTypes =
function(searchFor) {
	var types = new AjxVector();
	searchFor = searchFor || this._searchFor;

	var groupBy;
	if (searchFor == ZmSearchToolBar.FOR_MAIL_MI ||
		searchFor == ZmSearchToolBar.FOR_ANY_MI ||
		searchFor == ZmSearchToolBar.FOR_PAM_MI) {

		groupBy = this._appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	}

	if (searchFor == ZmSearchToolBar.FOR_MAIL_MI ||
		searchFor == ZmSearchToolBar.FOR_PAM_MI) {

		types.add(groupBy);
	} else if (searchFor == ZmSearchToolBar.FOR_ANY_MI)	{
		types.add(groupBy);
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
			types.add(ZmItem.CONTACT);
		if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED))
			types.add(ZmItem.APPT);
		if (this._appCtxt.get(ZmSetting.TASKS_ENABLED))
			types.add(ZmItem.TASK);
		if (this._appCtxt.get(ZmSetting.NOTEBOOK_ENABLED)) {
			types.add(ZmItem.PAGE);
			types.add(ZmItem.DOCUMENT);
		}
	} else if (searchFor == ZmSearchToolBar.FOR_PAS_MI)	{
		if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			types.add(ZmItem.CONTACT);
		}
	} else {
		types.add(searchFor);
		if (searchFor == ZmItem.PAGE) {
			types.add(ZmItem.DOCUMENT);
		}
	}

	return types;
}

ZmSearchController.prototype._getSuitableSortBy =
function(types) {
	var sortBy = null;

	if (types.size() == 1) {
		var type = types.get(0);
		var viewType = null;
		switch (type) {
			case ZmItem.CONV:		viewType = ZmController.CONVLIST_VIEW; break;
			case ZmItem.MSG:		viewType = ZmController.TRAD_VIEW; break;
			case ZmItem.CONTACT:	viewType = ZmController.CONTACT_SIMPLE_VIEW; break;
			// more types go here as they are suported...
		}

		if (viewType)
			sortBy = this._appCtxt.get(ZmSetting.SORTING_PREF, viewType);
	}

	return sortBy;
}

/*
* Performs the search.
*
* @param params			[Object]		a hash of arguments for the search (see search() method)
* @param noRender		[boolean]*		if true, the search results will not be rendered
* @param callback		[AjxCallback]*	callback
* @param errorCallback	[AjxCallback]*	error callback
*/
ZmSearchController.prototype._doSearch =
function(params, noRender, callback, errorCallback) {

	if (this._appCtxt.zimletsPresent()) {
		this._appCtxt.getZimletMgr().notifyZimlets("onSearch", params.query);
	}

	if (this._searchToolBar) {
		var value = (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) || params.userText) ? params.query : "";
		this._searchToolBar.setSearchFieldValue(value);
		this._searchToolBar.setEnabled(false);
	}

	// get types from search menu if not passed in
	var types = params.types || this.getTypes();
	if (types instanceof Array) // convert array to AjxVector if necessary
		types = AjxVector.fromArray(types);

	// if the user explicitly searched for all types, force mixed view
	var isMixed = (this._searchFor == ZmSearchToolBar.FOR_ANY_MI);

	// XXX: hack -- we have to hack the query string in order for this search to work
	if (this._searchFor == ZmSearchToolBar.FOR_PAS_MI ||
		this._searchFor == ZmSearchToolBar.FOR_PAM_MI)
	{
		if (params.query.indexOf(ZmSearchController.QUERY_ISREMOTE) == -1)
			params.query += (" " + ZmSearchController.QUERY_ISREMOTE);	
	}

	// only set contact source if we are searching for contacts
	params.contactSource = (types.contains(ZmItem.CONTACT) || types.contains(ZmSearchToolBar.FOR_GAL_MI))
		? this._contactSource : null;

	// find suitable sort by value if not given one (and if applicable)
	params.sortBy = params.sortBy || this._getSuitableSortBy(types);
	params.types = types;

	var search = new ZmSearch(this._appCtxt, params);
	var respCallback = new AjxCallback(this, this._handleResponseDoSearch, [search, noRender, isMixed, callback]);
	if (!errorCallback)
		errorCallback = new AjxCallback(this, this._handleErrorDoSearch, [search, isMixed]);
	search.execute({callback: respCallback, errorCallback: errorCallback});
};

/*
* Takes the search result and hands it to the appropriate controller for display.
*
* @param search			[ZmSearch]
* @param noRender		[boolean]
* @param callback		[AjxCallback]*
* @param result			[ZmCsfeResult]
*/
ZmSearchController.prototype._handleResponseDoSearch =
function(search, noRender, isMixed, callback, result) {
	var results = result.getResponse();

	this._appCtxt.setCurrentSearch(search);
	DBG.timePt("execute search", true);

	if (this._searchToolBar)
		this._searchToolBar.setEnabled(true);

	if (!results.type)
		results.type = search.types.get(0);

	if (!noRender)
		this._showResults(results, search, isMixed);

	if (callback) callback.run(result);
};

ZmSearchController.prototype._showResults =
function(results, search, isMixed) {
	// allow old results to dtor itself
	if (this._results && (this._results.type == results.type))
		this._results.dtor();
	this._results = results;

	DBG.timePt("handle search results");

	// determine if we need to default to mixed view
	var folder = this._appCtxt.getById(search.folderId);
	var inTrash = folder && folder.isInTrash();
	var isInGal = (this._contactSource == ZmSearchToolBar.FOR_GAL_MI);
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._searchToolBar.getButton(ZmSearchToolBar.SAVE_BUTTON).setEnabled(!isInGal);
	}

	// show results based on type - may invoke package load
	var resultsType = (isMixed || inTrash) ? ZmItem.MIXED : results.type;
	var loadCallback = new AjxCallback(this, this._handleLoadShowResults, [results, search]);
	var app = this._appCtxt.getApp(ZmItem.APP[resultsType]);
	app.currentQuery = search.query;
	app.showSearchResults(results, loadCallback, isInGal, search.folderId);
	this._appCtxt.getAppController().focusContentPane();
};

ZmSearchController.prototype._handleLoadShowResults =
function(results, search) {
	this._appCtxt.setCurrentList(results.getResults(results.type));
	this._updateOverview(search);
	DBG.timePt("render search results");
};

/*
* Handle a few minor errors where we show an empty result set and issue a
* status message to indicate why the query failed. Those errors are: no such
* folder, no such tag, and bad query. If it's a "no such folder" error caused
* by the deletion of a folder backing a mountpoint, we pass it along for
* special handling by ZmZimbraMail.
*/
ZmSearchController.prototype._handleErrorDoSearch =
function(search, isMixed, ex) {
	DBG.println(AjxDebug.DBG1, "Search exception: " + ex.code);
	if (this._searchToolBar) {
		this._searchToolBar.setEnabled(true);
	}

	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG ||
		ex.code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR ||
		ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		(ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER && !(ex.data.itemId && ex.data.itemId.length))) {

		var msg = ex.getErrorMsg();
		this._appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		var results = new ZmSearchResult(this._appCtxt);
		results.type = search.types ? search.types.get(0) : null;
		this._showResults(results, search, isMixed);
		return true;
	} else {
		return false;
	}
}

/*********** Search Field Callback */

ZmSearchController.prototype._searchFieldCallback =
function(queryString) {
	this.search({query: queryString, userText: true});
}

/*********** Search Bar Callbacks */

ZmSearchController.prototype._searchButtonListener =
function(ev) {
	var queryString = this._searchToolBar.getSearchFieldValue();
	var userText = (queryString.length > 0);
	if (queryString)
		this._currentQuery = null;
	else
		queryString = this._currentQuery;
	this.search({query: queryString, userText: userText});
}

ZmSearchController.prototype._browseButtonListener =
function(ev) {
	this.showBrowseView();
}

ZmSearchController.prototype._saveButtonListener =
function(ev) {
	if (this._results && this._results.search) {
		var stc = this._appCtxt.getOverviewController().getTreeController(ZmOrganizer.SEARCH);
		if (!stc._newCb) {
			stc._newCb = new AjxCallback(stc, stc._newCallback);
		}
		ZmController.showDialog(stc._getNewDialog(), stc._newCb, this._results.search);
	}
}

ZmSearchController.prototype._searchMenuListener =
function(ev, id, noSearch) {
	if (ev && (ev.detail != DwtMenuItem.CHECKED)) { return; }

	var btn = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	var item;
	if (ev) {
		item = ev.item;
		id = ev.item.getData(ZmSearchToolBar.MENUITEM_ID);
	} else {
		item = btn.getMenu().getItemById(ZmSearchToolBar.MENUITEM_ID, id);
	}

	this._searchFor = id;
	this._contactSource = (id == ZmSearchToolBar.FOR_GAL_MI) ? ZmSearchToolBar.FOR_GAL_MI : ZmItem.CONTACT;

	// set button text
	btn.setText(item.getText());

	// set button tooltip
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[id]];
	if (id == ZmSearchToolBar.FOR_MAIL_MI) {
		var groupBy = this._appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
		tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[groupBy]];
	}

	// run search
	if (!noSearch) {
		this._searchButtonListener(ev);
	}
};

/**
 * Selects the appropriate item in the overview based on the search. Selection only happens
 * if the search was a simple search for a folder, tag, or saved search.
 *
 * @param search		[ZmSearch]		the current search
 */
ZmSearchController.prototype._updateOverview =
function(search) {
	var id, type;
	if (search.folderId) {
		id = search.folderId;
		var folder = this._appCtxt.getFolderTree().getById(id);
		type = folder ? folder.type : ZmOrganizer.FOLDER;
	} else if (search.tagId) {
		id = search.tagId;
		type = ZmOrganizer.TAG;
	} else if (search.searchId) {
		id = search.searchId;
		type = ZmOrganizer.SEARCH;
	}
	var app = this._appCtxt.getCurrentApp();
	var overview = app.getOverview();
	if (!overview) { return; }
	if (id) {
		var treeView = overview.getTreeView(type);
		if (treeView) {
			treeView.setSelected(id, true);
		}
		overview.itemSelected(type);
	} else {
		// clear overview of selection
		overview.itemSelected();
	}
};
