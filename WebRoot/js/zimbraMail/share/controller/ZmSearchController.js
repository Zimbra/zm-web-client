/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the search controller.
 *
 */

/**
 * Creates a search controller.
 * @class
 * This class represents the search controller.
 * 
 * @param {DwtControl}	container	the top-level container
 * @extends	ZmController
 */
ZmSearchController = function(container) {

	ZmController.call(this, container);

	this._inited = false;

	// default menu values
	this._searchFor = ZmId.SEARCH_MAIL;
	this._contactSource = ZmItem.CONTACT;
	this._results = null;

	if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		this._setView();
	}
};

ZmSearchController.prototype = new ZmController;
ZmSearchController.prototype.constructor = ZmSearchController;

// Consts
ZmSearchController.QUERY_ISREMOTE = "is:remote OR is:local";

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmSearchController.prototype.toString =
function() {
	return "ZmSearchController";
};

/**
 * Gets the search tool bar.
 * 
 * @return	{ZmButtonToolBar}		the tool bar
 */
ZmSearchController.prototype.getSearchToolbar =
function() {
	return this._searchToolBar;
};

/**
 * Performs a search by date.
 * 
 * @param	{Date}	d		the date or <code>d</code> for now
 * @param	{String}	searchFor	the search for string
 */
ZmSearchController.prototype.dateSearch =
function(d, searchFor) {
	d = d || new Date();
    var formatter = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT);
    var date = formatter.format(d);
	var groupBy = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	var query = "date:" + date;
	this.search({query:query, types:[groupBy], searchFor: searchFor});
};

/**
 * Performs a search by from address.
 * 
 * @param	{String}	address		the from address
 */
ZmSearchController.prototype.fromSearch =
function(address) {
	// always search for mail when doing a "from: <address>" search
	var groupBy = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	var query = address instanceof Array ? address.concat() : [ address ];
	for (var i = 0; i < query.length; i++) {
		query[i] = ["from:(", query[i], ")"].join("");
	}
	this.search({query:query.join(" OR "), types:[groupBy]});
};

/**
 * Shows the browse view by from name.
 * 
 * @param	{String}	name	the name
 */
ZmSearchController.prototype.fromBrowse =
function(name) {
	// showBrowseView() may need load of Browse package
	var loadCallback = new AjxCallback(this, this._handleLoadFromBrowse, [name]);
	this.showBrowseView(true, loadCallback);
};

/**
 * Shows the browse picker.
 *
 * @param {Array}	pickers a array of pickers to show browser with
 * @param {Boolean}	showBasic		<code>true</code> to show basic picker
 */
ZmSearchController.prototype.showBrowsePickers =
function(pickers, showBasic) {
	// WTF:
	showBasic = (!showBasic || showBasic == null) ? true : showBasic;

	// Pickers array
	this.showBrowseView(true, null);

	// now remove all pickers and add those from array
	if (pickers instanceof Array) {
		this._browseViewController.removeAllPickers();
		if (showBasic) {
			this._browseViewController.addPicker(ZmPicker.BASIC);
		}
	for (var i = 0; i < pickers.length; i++) {
			this._browseViewController.addPicker(pickers[i]);
		}
	}
};

/**
 * @private
 */
ZmSearchController.prototype._handleLoadFromBrowse =
function(name, bv) {
	this.setDefaultSearchType(ZmId.SEARCH_MAIL);
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
 * @param {Boolean}	forceShow		if <code>true</code>, show panel
 * @param {AjxCallback}	callback		the callback to run after display is done
 */
ZmSearchController.prototype.showBrowseView =
function(forceShow, callback) {
	if (!this._browseViewController) {
		var loadCallback = new AjxCallback(this, this._handleLoadShowBrowseView, [callback]);
		AjxDispatcher.require("Browse", false, loadCallback, null, false);
	} else {
		var bvc = this._browseViewController;
		bvc.setBrowseViewVisible(forceShow || !bvc.getBrowseViewVisible());
		if (callback) {
			callback.run(bvc.getBrowseView());
		}
	}
};

/**
 * @private
 */
ZmSearchController.prototype._handleLoadShowBrowseView =
function(callback) {
	var bvc = this._browseViewController = new ZmBrowseController(this.searchPanel);
	bvc.setBrowseViewVisible(true);
	if (callback) {
		callback.run(bvc.getBrowseView());
	}
};

/**
 * Gets the browse view.
 * 
 * @return	{Object}	the browse view
 */
ZmSearchController.prototype.getBrowseView =
function() {
	return (this._browseViewController && this._browseViewController.getBrowseView());
};

/**
 * Sets the search field.
 * 
 * @param	{String}	searchString	the search string
 */
ZmSearchController.prototype.setSearchField =
function(searchString) {
	if (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) && this._searchToolBar) {
		this._searchToolBar.setSearchFieldValue(searchString);
	} else {
		this._currentQuery = searchString;
	}
};

/**
 * Gets the search field value.
 * 
 * @return	{String}	the search field value or an empty string
 */
ZmSearchController.prototype.getSearchFieldValue =
function() {
	return this._searchToolBar ? this._searchToolBar.getSearchFieldValue() : "";
};

ZmSearchController.prototype.setEnabled =
function(enabled) {
	if (this._searchToolBar) {
		this._searchToolBar.setEnabled(enabled);
	}
};

/**
 * Sets the default type. This method provides a programmatic way to set the search type.
 *
 * @param {Object}	type		the search type to set as the default
 */
ZmSearchController.prototype.setDefaultSearchType =
function(type) {
	if (this._searchToolBar && !appCtxt.inStartup) {
		var menu = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
		menu.checkItem(ZmSearchToolBar.MENUITEM_ID, type);
		this._searchMenuListener(null, type);
	}
};

/**
 * @private
 */
ZmSearchController.prototype._setView =
function() {
	// Create search panel - a composite is needed because the search builder
	// element (ZmBrowseView) is added to it (can't add it to the toolbar)
	this.searchPanel = new DwtComposite({parent:this._container, className:"SearchPanel", posStyle:Dwt.ABSOLUTE_STYLE});
	this._searchToolBar = new ZmSearchToolBar(this.searchPanel, ZmId.SEARCH_TOOLBAR);

	// create people search toolbar
	if (!appCtxt.isChildWindow) {
		this.peopleSearchToolBar = new ZmPeopleSearchToolBar(this._container, ZmId.PEOPLE_SEARCH_TOOLBAR);
	}

	this._createTabGroup();
	this._tabGroup.addMember(this._searchToolBar.getSearchField());
	var buttons = this._searchToolBar.getButtons();
	for (var i = 0; i < buttons.length; i++) {
		this._tabGroup.addMember(buttons[i]);
	}

	// Register keyboard callback for search field
	this._searchToolBar.registerCallback(this._searchFieldCallback, this);

	// Button listeners
	this._searchToolBar.addSelectionListener(ZmSearchToolBar.SEARCH_BUTTON, new AjxListener(this, this._searchButtonListener));
	if (appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.BROWSE_BUTTON, new AjxListener(this, this._browseButtonListener));
	}
	if (appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.SAVE_BUTTON, new AjxListener(this, this._saveButtonListener));
	}
};

/**
 * @private
 */
ZmSearchController.prototype._addMenuListeners =
function(menu) {
	// Menu listeners
	var searchMenuListener = new AjxListener(this, this._searchMenuListener);
	var items = menu.getItems();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		item.addSelectionListener(searchMenuListener);
		var mi = item.getData(ZmSearchToolBar.MENUITEM_ID);
		// set mail as default search
		if (mi == ZmId.SEARCH_MAIL) {
			item.setChecked(true, true);
		}
	}
};

/**
 * Performs a search and displays the results.
 *
 * @param {Hash}	params		a hash of parameters
 * @param {String}	params.query	the search string
 * @param {constant}	params.searchFor	the semantic type to search for
 * @param {Array}	params.types		the item types to search for
 * @param {constant}	params.sortBy		the sort constraint
 * @param {int}	params.offset	the starting point in list of matching items
 * @param {int}	params.limit	the maximum number of items to return
 * @param {int}	params.searchId	the ID of owning search folder (if any)
 * @param {int}	params.prevId	the ID of last items displayed (for pagination)
 * @param {constant}	params.prevSortBy	previous sort order (for pagination)
 * @param {Boolean}	params.noRender	if <code>true</code>, results will not be passed to controller
 * @param {Boolean}	params.noClear	if <code>true</code>, previous results will not be destroyed
 * @param {Boolean}	params.userText	if <code>true</code>, text was typed by user into search box
 * @param {AjxCallback}	params.callback		the async callback
 * @param {AjxCallback}	params.errorCallback	the async callback to run if there is an exception
 * @param	{Object}	params.response		the canned JSON response (no request will be made)
 * 
 */
ZmSearchController.prototype.search =
function(params) {
	if (params.searchFor != ZmItem.APPT && (!params.query && !params.queryHint)) {
		return;
	}

	// if the search string starts with "$set:" then it is a command to the client
	if (params.query && (params.query.indexOf("$set:") == 0 || params.query.indexOf("$cmd:") == 0)) {
		appCtxt.getClientCmdHandler().execute((params.query.substr(5)), this);
		return;
	}

	params.searchAllAccounts = this.searchAllAccounts;

	var respCallback = new AjxCallback(this, this._handleResponseSearch, [params.callback]);
	this._doSearch(params, params.noRender, respCallback, params.errorCallback);
};

/**
 * @private
 */
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
 * @param {ZmSearch}	search		the search object
 * @param {Boolean}		noRender		if <code>true</code>, results will not be passed to controller
 * @param {Object}	changes		the hash of changes to make to search
 * @param {AjxCallback}	callback		the async callback
 * @param {AjxCallback}	errorCallback	the async callback to run if there is an exception
 */
ZmSearchController.prototype.redoSearch =
function(search, noRender, changes, callback, errorCallback) {

	var params = {};
	params.query		= search.query;
	params.queryHint	= search.queryHint;
	params.types		= search.types;
	params.sortBy		= search.sortBy;
	params.offset		= search.offset;
	params.limit		= search.limit;
	params.prevId		= search.prevId;
	params.prevSortBy	= search.prevSortBy;
	params.fetch		= search.fetch;
	params.searchId		= search.searchId;
	params.lastSortVal	= search.lastSortVal;
	params.endSortVal	= search.endSortVal;
	params.lastId		= search.lastId;
	params.soapInfo		= search.soapInfo;
	params.accountName	= search.accountName;
	params.searchFor	= this._searchFor;
	params.idsOnly		= search.idsOnly;
	params.inDumpster   = search.inDumpster;

	if (changes) {
		for (var key in changes) {
			params[key] = changes[key];
		}
	}

	this._doSearch(params, noRender, callback, errorCallback);
};

/**
 * Resets search for all accounts.
 * 
 */
ZmSearchController.prototype.resetSearchAllAccounts =
function() {
	var button = this.searchAllAccounts && this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	var menu = button && button.getMenu();
	var allAccountsMI = menu && menu.getItemById(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_ALL_ACCOUNTS);

	if (allAccountsMI) {
		allAccountsMI.setChecked(false, true);

		var selItem = menu.getSelectedItem();
		var icon = this._inclSharedItems
			? this._getSharedImage(selItem) : selItem.getImage();
		button.setImage(icon);

		this.searchAllAccounts = false;
	}
};

/**
 * Resets the search toolbar. This is used by the offline client to "reset" the toolbar whenever user
 * switches between accounts.
 * 
 */
ZmSearchController.prototype.resetSearchToolbar =
function() {
	var smb = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	var mi = smb ? smb.getMenu().getItemById(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_GAL) : null;
	if (mi) {
		mi.setVisible(appCtxt.getActiveAccount().isZimbraAccount);
	}
};

/**
 * Gets the item types. Assembles a list of item types to return based on a search menu value (which can
 * be passed in).
 *
 * @param {Hash}	params			a hash of arguments for the search
 * @param {String}	params.searchFor	the string for.
 * @return	{AjxVector}		a list of types
 * 
 * @see		#search
 */
ZmSearchController.prototype.getTypes =
function(params) {
	var types = new AjxVector();
	var searchFor = params.searchFor || this._searchFor;

	var groupBy;
	if ((searchFor == ZmId.SEARCH_MAIL || searchFor == ZmId.SEARCH_ANY) &&
		appCtxt.get(ZmSetting.MAIL_ENABLED))
	{
		groupBy = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	}

	if (searchFor == ZmId.SEARCH_MAIL) {
		types.add(groupBy);
	} else if (searchFor == ZmId.SEARCH_ANY) {
		if (appCtxt.get(ZmSetting.MAIL_ENABLED) && groupBy)	{ types.add(groupBy); }
		if (appCtxt.get(ZmSetting.CONTACTS_ENABLED))		{ types.add(ZmItem.CONTACT); }
		if (appCtxt.get(ZmSetting.CALENDAR_ENABLED))		{ types.add(ZmItem.APPT); }
		if (appCtxt.get(ZmSetting.TASKS_ENABLED))			{ types.add(ZmItem.TASK); }
		if (appCtxt.get(ZmSetting.NOTEBOOK_ENABLED))		{ types.add(ZmItem.PAGE); }
		if (appCtxt.get(ZmSetting.BRIEFCASE_ENABLED))		{ types.add(ZmItem.BRIEFCASE_ITEM); }
	} else {
		types.add(searchFor);
		if (searchFor == ZmItem.PAGE) {
			types.add(ZmItem.DOCUMENT);
		}
	}

	return types;
};

/**
 * Selects the appropriate item in the overview based on the search. Selection only happens
 * if the search was a simple search for a folder, tag, or saved search. A check is done to
 * make sure that item is not already selected, so selection should only occur for a query
 * manually run by the user.
 *
 * @param {ZmSearch}	searchObj		the current search
 */
ZmSearchController.prototype.updateOverview =
function(searchObj) {
	var search = searchObj || appCtxt.getCurrentSearch();

	var id, type;
	if (search && (search.singleTerm || search.searchId)) {
		if (search.searchId) {
			id = this._getNormalizedId(search.searchId);
			type = ZmOrganizer.SEARCH;
		} else if (search.folderId) {
			id = this._getNormalizedId(search.folderId);
			var folderTree = appCtxt.getFolderTree();
			var folder = folderTree && folderTree.getById(id);
			type = folder ? folder.type : ZmOrganizer.FOLDER;
            if (search.searchFor == ZmItem.TASK) {
                type = ZmOrganizer.TASKS;
            }
		} else if (search.tagId) {
			id = this._getNormalizedId(search.tagId);
			type = ZmOrganizer.TAG;
		}
		var app = appCtxt.getCurrentApp();
		var overview = app && app.getOverview();
		if (overview) {
			overview.setSelected(id, type);
		}
	}
};

/**
 * @private
 */
ZmSearchController.prototype._getSuitableSortBy =
function(types) {
	var sortBy;

	if (types.size() == 1) {
		var type = types.get(0);
		var viewType;
		switch (type) {
			case ZmItem.CONV:		viewType = ZmId.VIEW_CONVLIST; break;
			case ZmItem.MSG:		viewType = ZmId.VIEW_TRAD; break;
			case ZmItem.CONTACT:	viewType = ZmId.VIEW_CONTACT_SIMPLE; break;
			case ZmItem.APPT:		viewType = ZmId.VIEW_CAL; break;
			case ZmItem.TASK:		viewType = ZmId.VIEW_TASKLIST; break;
			case ZmId.SEARCH_GAL:	viewType = ZmId.VIEW_CONTACT_SIMPLE; break;
			// more types go here as they are suported...
		}

		if (viewType) {
			sortBy = appCtxt.get(ZmSetting.SORTING_PREF, viewType);
		}
	}

	return sortBy;
};

/**
 * Performs the search.
 *
 * @param {Hash}	params		a hash of params for the search
 * @param {String}	params.searchFor	the search for
 * @param {String}	params.query	the search query
 * @param {String}	params.userText	the user text
 * @param {Array}	params.type		an array of types
 * @param {boolean} params.forceSearch     Ignores special processing and just executes the search.
 * @param {Boolean}	noRender		if <code>true</code>, the search results will not be rendered
 * @param {AjxCallback}	callback		the callback
 * @param {AjxCallback}	errorCallback	the error callback
 * 
 * @see	#search
 * 
 * @private
 */
ZmSearchController.prototype._doSearch =
function(params, noRender, callback, errorCallback) {

	var searchFor = this._searchFor = params.searchFor || this._searchFor;
	appCtxt.notifyZimlets("onSearch", [params.query]);

	if (this._searchToolBar) {
		var value = (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) || params.userText)
			? params.query : null;
		this._searchToolBar.setSearchFieldValue(value || "");

		// bug: 42512 - deselect global inbox if searching via search toolbar
		if (appCtxt.multiAccounts && params.userText && this.searchAllAccounts) {
			appCtxt.getCurrentApp().getOverviewContainer().deselectAll();
		}
	}

	// get types from search type if not passed in explicitly
	var types = params.types || this.getTypes(params);
	if (types instanceof Array) { // convert array to AjxVector if necessary
		types = AjxVector.fromArray(types);
	}
	if (searchFor == ZmId.SEARCH_MAIL) {
		params = appCtxt.getApp(ZmApp.MAIL).getSearchParams(params);
	}

	if (searchFor == ZmItem.TASK) {
		var tlc = AjxDispatcher.run("GetTaskListController");
		params.allowableTaskStatus = (tlc) ? tlc.getAllowableTaskStatus() : null;
	}

	// if the user explicitly searched for all types, force mixed view
	var isMixed = (searchFor == ZmId.SEARCH_ANY);

	if (params.searchAllAccounts && !params.queryHint) {
		params.queryHint = appCtxt.accountList.generateQuery(null, types);
		params.accountName = appCtxt.accountList.mainAccount.name;
	}
	else if (this._inclSharedItems) {
		// a query hint is part of the query that the user does not see
		params.queryHint = isMixed
			? ZmSearchController.QUERY_ISREMOTE
			: ZmSearchController.generateQueryForShares(types.getArray());
	}

	// only set contact source if we are searching for contacts
	params.contactSource = (types.contains(ZmItem.CONTACT) || types.contains(ZmId.SEARCH_GAL))
		? this._contactSource : null;
	if (params.contactSource == ZmId.SEARCH_GAL) {
		params.expandDL = true;
	}

	// find suitable sort by value if not given one (and if applicable)
	params.sortBy = params.sortBy || this._getSuitableSortBy(types);
	params.types = types;
	var search = new ZmSearch(params);

	var args = [search, noRender, isMixed, callback, params.noUpdateOverview, params.noClear];
	var respCallback = new AjxCallback(this, this._handleResponseDoSearch, args);
	if (!errorCallback) {
		errorCallback = new AjxCallback(this, this._handleErrorDoSearch, [search, isMixed]);
	}

	// calendar searching is special so hand it off if necessary
	if (searchFor == ZmItem.APPT && !params.forceSearch) {
		var controller = AjxDispatcher.run("GetCalController");
		if (controller && types.contains(ZmItem.APPT)) {
			controller.handleUserSearch(params, respCallback);
		} else {
            search.execute({callback:respCallback, errorCallback:errorCallback});            
        }
	} else {
		search.execute({callback:respCallback, errorCallback:errorCallback});
	}
};

/**
 * Takes the search result and hands it to the appropriate controller for display.
 *
 * @param {ZmSearch}	search			contains search info used to run search against server
 * @param {Boolean}		noRender		<code>true</code> to skip rendering results
 * @param {Boolean}	isMixed				<code>true</code> if in mixed mode
 * @param {AjxCallback}	callback		the callback to run after processing search response
 * @param {Boolean}	noUpdateOverview	<code>true</code> to skip updating the overview
 * @param {Boolean}		noClear			if <code>true</code>, previous results will not be destructed
 * @param {ZmCsfeResult}	result			the search results
 */
ZmSearchController.prototype._handleResponseDoSearch =
function(search, noRender, isMixed, callback, noUpdateOverview, noClear, result) {

	var results = result.getResponse();
	if (!results) { return; }

	if (!results.type) {
		results.type = search.types.get(0);
	}

	if (results.type == ZmItem.APPT) {
		this._results = new ZmSearchResult(search);
		return;
	}

	this.currentSearch = search;
	DBG.timePt("execute search", true);

	// bug fix #34776 - don't show search results if user is in the composer
	if (!noRender) {
		this._showResults(results, search, isMixed, noUpdateOverview, noClear);
	}

	if (callback) {
		callback.run(result);
	}
};

/**
 * @private
 */
ZmSearchController.prototype._showResults =
function(results, search, isMixed, noUpdateOverview, noClear) {
	// allow old results to dtor itself
	if (!noClear && this._results && (this._results.type == results.type) && this._results.dtor) {
		this._results.dtor();
	}
	this._results = results;

	DBG.timePt("handle search results");

	// determine if we need to default to mixed view
	if (appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		var saveBtn = this._searchToolBar && this._searchToolBar.getButton(ZmSearchToolBar.SAVE_BUTTON);
		if (saveBtn) {
			saveBtn.setEnabled(this._contactSource != ZmId.SEARCH_GAL);
		}
	}

	// show results based on type - may invoke package load
	var resultsType = isMixed ? ZmItem.MIXED : results.type;
	var loadCallback = new AjxCallback(this, this._handleLoadShowResults, [results, search, noUpdateOverview]);
	var app = appCtxt.getApp(ZmItem.APP[resultsType]);
	app.currentSearch = search;
	app.currentQuery = search.query;
	app.showSearchResults(results, loadCallback);
};

/**
 * @private
 */
ZmSearchController.prototype._handleLoadShowResults =
function(results, search, noUpdateOverview) {
	appCtxt.setCurrentList(results.getResults(results.type));
	if (!noUpdateOverview) {
		this.updateOverview(search);
	}
	DBG.timePt("render search results");
};

/**
 * Handle a few minor errors where we show an empty result set and issue a
 * status message to indicate why the query failed. Those errors are: no such
 * folder, no such tag, and bad query. If it's a "no such folder" error caused
 * by the deletion of a folder backing a mountpoint, we pass it along for
 * special handling by ZmZimbraMail.
 * 
 * @private
 */
ZmSearchController.prototype._handleErrorDoSearch =
function(search, isMixed, ex) {
	DBG.println(AjxDebug.DBG1, "Search exception: " + ex.code);

	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG ||
		ex.code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR ||
		ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		(ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER && !(ex.data.itemId && ex.data.itemId.length)))
	{
		var msg = ex.getErrorMsg();
		appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		var results = new ZmSearchResult(search);
		results.type = search.types ? search.types.get(0) : null;
		this._showResults(results, search, isMixed);
		return true;
	}
	return false;
};

/**
 * Provides a string to add to the query when the search includes shared items.
 * 
 * @param types		[array]		list of item types
 * 
 * @private
 */
ZmSearchController.generateQueryForShares =
function(types, account) {
	var ac = window.parentAppCtxt || window.appCtxt;
	var list = [];
	for (var j = 0; j < types.length; j++) {
		var type = types[j];
		var app = ac.getApp(ZmItem.APP[type]);
		if (app) {
			var ids = app.getRemoteFolderIds(account);
			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];
				var idText = AjxUtil.isNumeric(id) ? id : ['"', id, '"'].join("");
				list.push("inid:" + idText);
			}
		}
	}

	if (list.length > 0) {
		list.push("is:local");
		return list.join(" OR ");
	}

	return null;
};

/**
 * Search Field Callback
 *
 * @private
 */
ZmSearchController.prototype._searchFieldCallback =
function(queryString) {
	var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
	this.search({query: queryString, userText: true, getHtml: getHtml});
};

/**
 * Search Bar Callbacks
 * 
 * @private
 */
ZmSearchController.prototype._searchButtonListener =
function(ev) {
	// find out if the custom search menu item is selected and pass it the query
	var btn = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	var menu = btn && btn.getMenu();
	var mi = menu && menu.getSelectedItem();
	var data = mi && mi.getData("CustomSearchItem");
	if (data) {
		data[2].run(ev);
	} else {
		var queryString = this._searchToolBar.getSearchFieldValue();
		var userText = (queryString.length > 0);
		if (queryString) {
			this._currentQuery = null;
		} else {
			queryString = this._currentQuery ? this._currentQuery : "";
		}
		appCtxt.notifyZimlets("onSearchButtonClick", [queryString]);
		var getHtml = appCtxt.get(ZmSetting.VIEW_AS_HTML);
		this.search({query: queryString, userText: userText, getHtml: getHtml});
	}
};

/**
 * @private
 */
ZmSearchController.prototype._browseButtonListener =
function(ev) {
	this.showBrowseView();
};

/**
 * @private
 */
ZmSearchController.prototype._saveButtonListener =
function(ev) {
	var stc = appCtxt.getOverviewController().getTreeController(ZmOrganizer.SEARCH);
	if (!stc._newCb) {
		stc._newCb = new AjxCallback(stc, stc._newCallback);
	}

	var params = {
		search: this._results && this._results.search,
		showOverview: (this._searchFor == ZmId.SEARCH_MAIL)
	};
	ZmController.showDialog(stc._getNewDialog(), stc._newCb, params);
};

/**
 * @private
 */
ZmSearchController.prototype._searchMenuListener =
function(ev, id) {
	var btn = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	if (!btn) { return; }

	var menu = btn.getMenu();
	var item = ev ? ev.item : (menu.getItemById(ZmSearchToolBar.MENUITEM_ID, id));

	if (!item || (!!(item._style & DwtMenuItem.SEPARATOR_STYLE))) { return; }
	id = item.getData(ZmSearchToolBar.MENUITEM_ID);

	var selItem = menu.getSelectedItem();
	var sharedMI = menu.getItemById(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_SHARED);

	// enable shared menu item if not a gal search
	if (id == ZmId.SEARCH_GAL) {
		this._contactSource = ZmId.SEARCH_GAL;
		if (sharedMI) {
			sharedMI.setChecked(false, true);
			sharedMI.setEnabled(false);
		}
	} else {
		if (sharedMI) {
			// we allow user to check "Shared Items" for appointments since it
			// is based on whats checked in their tree view
			if (id == ZmItem.APPT || id == ZmId.SEARCH_CUSTOM) {
				sharedMI.setChecked(false, true);
				sharedMI.setEnabled(false);
			} else {
				sharedMI.setEnabled(true);
			}
		}
		this._contactSource = ZmItem.CONTACT;
	}
	this._inclSharedItems = sharedMI && sharedMI.getChecked();

	// search all accounts? Only applies to multi-account mbox
	var allAccountsMI = menu.getItemById(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_ALL_ACCOUNTS);
	if (allAccountsMI) {
		if (id == ZmItem.APPT) {
			this.resetSearchAllAccounts();
			allAccountsMI.setEnabled(false);
		} else {
			allAccountsMI.setEnabled(true);
			this.searchAllAccounts = allAccountsMI && allAccountsMI.getChecked();
		}
	}

	if (id == ZmId.SEARCH_SHARED) {
		var icon = this.searchAllAccounts
			? allAccountsMI.getImage() : selItem.getImage();

		if (this._inclSharedItems) {
			var selItemId = selItem && selItem.getData(ZmSearchToolBar.MENUITEM_ID);
			icon = selItemId
				? ((ZmSearchToolBar.SHARE_ICON[selItemId]) || item.getImage())
				: item.getImage();
		}

		btn.setImage(icon);
	}
	else if (id == ZmId.SEARCH_ALL_ACCOUNTS) {
		var icon = (this.searchAllAccounts && !this._inclSharedItems)
			? item.getImage()
			: (this._inclSharedItems) ? this._getSharedImage(selItem) : selItem.getImage();
		btn.setImage(icon);
	}
	else {
		// only set search for if a "real" search-type menu item was clicked
		this._searchFor = id;
		var icon = item.getImage();

		if (this._inclSharedItems) {
			icon = this._getSharedImage(selItem);
		}
		else if (this.searchAllAccounts) {
			icon = allAccountsMI.getImage();
		}

		btn.setImage(icon);
		btn.setText(item.getText());
	}

	// set button tooltip
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[id]];
	if (id == ZmId.SEARCH_MAIL) {
		var groupBy = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
		tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[groupBy]];
	}
	btn.setToolTipContent(tooltip);
};

/**
 * @private
 */
ZmSearchController.prototype._getSharedImage =
function(selItem) {
	var selItemId = selItem && selItem.getData(ZmSearchToolBar.MENUITEM_ID);
	return (selItemId && ZmSearchToolBar.SHARE_ICON[selItemId])
		? ZmSearchToolBar.SHARE_ICON[selItemId]
		: ZmSearchToolBar.ICON[ZmId.SEARCH_SHARED];
};

/**
 * @private
 */
ZmSearchController.prototype._getNormalizedId =
function(id) {
	var nid = id;

	var acct = appCtxt.getActiveAccount();
	if (!acct.isMain && id.indexOf(":") == -1) {
		nid = acct.id + ":" + id;
	}

	return nid;
};
