/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
	this._contactSource = ZmItem.CONTACT;
	this._results = null;

	if (appCtxt.get(ZmSetting.SEARCH_ENABLED)) {
		this._setView();
	}
};

ZmSearchController.prototype = new ZmController;
ZmSearchController.prototype.constructor = ZmSearchController;

ZmSearchController.prototype.isZmSearchController = true;
ZmSearchController.prototype.toString = function() { return "ZmSearchController"; };

// Consts
ZmSearchController.QUERY_ISREMOTE = "is:remote OR is:local";


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
	this.search({
		query:			query,
		types:			[groupBy],
		searchFor:		searchFor,
		origin:			ZmId.SEARCH,
		userInitiated:	true
	});
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
	var terms = AjxUtil.map(AjxUtil.toArray(address), function(addr) {
		return "from:" + ((addr && addr.isAjxEmailAddress) ? addr.getAddress() : addr);
	});
	
	this.search({
		query:			terms.join(" OR "),
		types:			[groupBy],
		origin:			ZmId.SEARCH,
		userInitiated:	true
	});
};


/**
 * Performs a search by to address.
 *
 * @param	{String}	address		the to address
 */
ZmSearchController.prototype.toSearch =
function(address) {

	// always search for mail when doing a "tocc: <address>" search
	var groupBy = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
	var terms = AjxUtil.map(AjxUtil.toArray(address), function(addr) {
		return "tocc:" + ((addr && addr.isAjxEmailAddress) ? addr.getAddress() : addr);
	});

	var params = {
		types:			[groupBy],
		origin:			ZmId.SEARCH,
		userInitiated:	true,
		query:			terms.join(" OR ")
	}
    if (this.currentSearch && this.currentSearch.folderId == ZmFolder.ID_SENT) {
		if (terms.length > 1) {
			params.query = "(" + params.query + ")";
		}
		params.query = "in:sent AND " + params.query;
	}
    this.search(params);
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
	if (!this._searchToolBar) {
		return;
	}
	var menu = this._searchToolBar.getButton(ZmSearchToolBar.TYPES_BUTTON).getMenu();
	menu.checkItem(ZmOperation.MENUITEM_ID, type);
	this._searchMenuListener(null, type, true);
};

/**
 * @private
 */
ZmSearchController.prototype._setView =
function() {

	// Create search panel - a composite is needed because the search builder
	// element (ZmBrowseView) is added to it (can't add it to the toolbar)
	this.searchPanel = new DwtComposite({
				parent:		this._container,
				className:	"SearchPanel",
				posStyle:	Dwt.ABSOLUTE_STYLE
			});

	this._searchToolBar = new ZmMainSearchToolBar({
				parent:	this.searchPanel,
				id:		ZmId.SEARCH_TOOLBAR
			});

	this._createTabGroup();
	this._tabGroup.addMember(this._searchToolBar.getChildren());
	
	// Register keyboard callback for search field
	this._searchToolBar.registerEnterCallback(this._toolbarSearch.bind(this));

	// Button listeners
	this._searchToolBar.addSelectionListener(ZmSearchToolBar.SEARCH_BUTTON, this._searchButtonListener.bind(this));
};

/**
 * @private
 */
ZmSearchController.prototype._addMenuListeners =
function(menu) {
	// Menu listeners
	var searchMenuListener = this._searchMenuListener.bind(this);
	var items = menu.getItems();
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		item.addSelectionListener(searchMenuListener);
		var mi = item.getData(ZmOperation.MENUITEM_ID);
		// set mail as default search
		if (mi == ZmId.SEARCH_MAIL) {
			item.setChecked(true, true);
		}
	}
};

/**
 * Performs a search and displays the results.
 *
 * @param {Hash}	params		a hash of parameters:
 * 
 * @param {String}		query						the search string
 * @param {constant}	searchFor					the semantic type to search for
 * @param {Array}		types						the item types to search for
 * @param {constant}	sortBy						the sort constraint
 * @param {int}			offset						the starting point in list of matching items
 * @param {int}			limit						the maximum number of items to return
 * @param {int}			searchId					the ID of owning search folder (if any)
 * @param {Boolean}		noRender					if <code>true</code>, results will not be passed to controller
 * @param {Boolean}		userText					if <code>true</code>, text was typed by user into search box
 * @param {AjxCallback}	callback					the async callback
 * @param {AjxCallback}	errorCallback				the async callback to run if there is an exception
 * @param {Object}		response					the canned JSON response (no request will be made)
 * @param {boolean}		skipUpdateSearchToolbar     don't update the search toolbar (e.g. from the ZmDumpsterDialog where the search is called from its own search toolbar
 * @param {string}		origin						indicates what initiated the search
 * @param {string}		sessionId					session ID of search results tab (if search came from one)
 * @param {Boolean}		noGal     if true, don't search GAL. This is to override the this._contactSource value in contacts search, specifically for clicking on TAGS. 
 *
 */
ZmSearchController.prototype.search =
function(params) {

	// if the search string starts with "$set:" then it is a command to the client
	if (params.query && (params.query.indexOf("$set:") == 0 || params.query.indexOf("$cmd:") == 0)) {
		appCtxt.getClientCmdHandler().execute((params.query.substr(5)), this);
		return;
	}

	params.searchAllAccounts = this.searchAllAccounts;
	var respCallback = this._handleResponseSearch.bind(this, params.callback);
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
	params.forceTypes	= search.forceTypes;
	params.sortBy		= search.sortBy;
	params.offset		= search.offset;
	params.limit		= search.limit;
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
	params.userInitiated = search.userInitiated;
	params.sessionId	= search.sessionId;
    params.isEmpty      = search.isEmpty;
	params.markRead     = search.markRead;

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
	var button = this.searchAllAccounts && this._searchToolBar.getButton(ZmSearchToolBar.TYPES_BUTTON);
	var menu = button && button.getMenu();
	var allAccountsMI = menu && menu.getItemById(ZmOperation.MENUITEM_ID, ZmId.SEARCH_ALL_ACCOUNTS);

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
	var smb = this._searchToolBar.getButton(ZmSearchToolBar.TYPES_BUTTON);
	var mi = smb ? smb.getMenu().getItemById(ZmOperation.MENUITEM_ID, ZmId.SEARCH_GAL) : null;
	if (mi) {
		mi.setVisible(appCtxt.getActiveAccount().isZimbraAccount);
	}
};

/**
 * Gets the item type, based on searchFor. The type is the same as the searchFor, except for mail in which the type is either msg or conv based on view.
 *
 * @param   {String}	searchFor		   general description of what to search for
 * @param   {Boolean}   userInitiated      true if using a search tab
 * @return	{String}	type
 * 
 * @see		#search
 */
ZmSearchController.prototype.getTypeFromSearchFor =
function(searchFor, userInitiated) {

	var type = searchFor;

	if (searchFor === ZmId.SEARCH_MAIL) {
        var ac = window.parentAppCtxt || window.appCtxt,
            app = ac.getApp(userInitiated ? ZmApp.SEARCH : ZmApp.MAIL);
		type = app ? app.getGroupMailBy() : ZmItem.MSG;
	}

	return type;
};

/**
 * Get the searchFor var which is the same as type except for mail, in which case the type is either msg or conv but searchFor is mail.
 *
 * @param {String} type	type of items to search for
 * @return	{String}	searchFor
 *
 * @see		#search
 */
ZmSearchController.prototype.getSearchForFromType =
function(type) {
	return (type === ZmItem.MSG || type === ZmItem.CONV) ? ZmId.SEARCH_MAIL : type;
};

/**
 * Selects the appropriate item in the overview based on the search. Selection only happens
 * if the search was a simple search for a folder, tag, or saved search. A check is done to
 * make sure that item is not already selected, so selection should only occur for a query
 * manually run by the user.
 *
 * @param {ZmSearch}	searchObj		the current search
 */
ZmSearchController.prototype.updateOverview = function(searchObj) {

	var search = searchObj || appCtxt.getCurrentSearch();
    if (!search) {
        return;
    }

	var id, type;
	if (search.isSimple() || search.searchId) {
		if (search.searchId) {
			id = this._getNormalizedId(search.searchId);
			type = ZmOrganizer.SEARCH;
		}
        else if (search.folderId) {
			id = this._getNormalizedId(search.folderId);
			var folderTree = appCtxt.getFolderTree(),
			    folder = folderTree && folderTree.getById(id);

            type = ZmOrganizer.ITEM_ORGANIZER[search.searchFor] || (folder && folder.type) || ZmOrganizer.FOLDER;
		}
        else if (search.tagId) {
			id = this._getNormalizedId(search.tagId);
			type = ZmOrganizer.TAG;
		}

		if (type) {
			var app = appCtxt.getCurrentApp();
			var overview = app && app.getOverview();
			if (overview) {
				overview.setSelected(id, type);
			}
		}
	}
};

/**
 * @private
 */
ZmSearchController.prototype._getSuitableSortBy =
function(type) {
	var sortBy;

	var viewType;
	switch (type) {
		case ZmItem.CONV:		viewType = ZmId.VIEW_CONVLIST; break;
		case ZmItem.MSG:		viewType = ZmId.VIEW_TRAD; break;
		case ZmItem.CONTACT:	viewType = ZmId.VIEW_CONTACT_SIMPLE; break;
		case ZmItem.APPT:		viewType = ZmId.VIEW_CAL; break;
		case ZmItem.TASK:		viewType = ZmId.VIEW_TASKLIST; break;
		case ZmId.SEARCH_GAL:	viewType = ZmId.VIEW_CONTACT_SIMPLE; break;
		case ZmItem.BRIEFCASE_ITEM:	viewType = ZmId.VIEW_BRIEFCASE_DETAIL; break;
		// more types go here as they are suported...
	}

	if (viewType) {
		sortBy = appCtxt.get(ZmSetting.SORTING_PREF, viewType);
	}
	//bug:1108 & 43789#c19 (changelist 290073) since sort-by-[RCPT|ATTACHMENT|FLAG|PRIORITY] gives exception with querystring.
	// Avoided [RCPT|ATTACHMENT|FLAG|PRIORITY] sorting with querysting instead used date sorting
	var queryString = this._searchToolBar.getSearchFieldValue();
	if (queryString && queryString.length > 0) {
		if (sortBy === ZmSearch.RCPT_ASC || sortBy === ZmSearch.RCPT_DESC) {
			sortBy = sortBy === ZmSearch.RCPT_ASC ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;
		}
		else if (sortBy === ZmSearch.FLAG_ASC || sortBy === ZmSearch.FLAG_DESC) {
			sortBy = sortBy === ZmSearch.FLAG_ASC ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;
		}
		else if (sortBy === ZmSearch.ATTACH_ASC || sortBy === ZmSearch.ATTACH_DESC) {
			sortBy = sortBy === ZmSearch.ATTACH_ASC ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;
		}
		else if (sortBy === ZmSearch.PRIORITY_ASC || sortBy === ZmSearch.PRIORITY_DESC) {
			sortBy = sortBy === ZmSearch.PRIORITY_ASC ? ZmSearch.DATE_ASC : ZmSearch.DATE_DESC;
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
 * @param {Boolean}	params.forceTypes	use the types we pass, do not override (in case of mail) to the current user's view pref (MSG vs. CONV).
 * @param {boolean}	params.inclSharedItems		overrides this._inclSharedItems - see ZmTagsHelper._tagClick
 * @param {boolean} params.forceSearch     Ignores special processing and just executes the search.
 * @param {Boolean}	noRender		if <code>true</code>, the search results will not be rendered
 * @param {AjxCallback}	callback		the callback
 * @param {AjxCallback}	errorCallback	the error callback
 * @param {boolean} params.skipUpdateSearchToolbar     don't update the search toolbar (e.g. from the ZmDumpsterDialog where the search is called from its own search toolbar
 * @param {Boolean}		noGal     if true, don't search GAL. This is to override the this._contactSource value in contacts search, specifically for clicking on TAGS.
 *
 * @see	#search
 * 
 * @private
 */
ZmSearchController.prototype._doSearch =
function(params, noRender, callback, errorCallback) {

	var searchFor = this._searchFor = params.searchFor || this._searchFor || ZmSearchToolBar.MENU_ITEMS[0];
	appCtxt.notifyZimlets("onSearch", [params.query]);

	if (!params.skipUpdateSearchToolbar && this._searchToolBar) {
		var value = (appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) || params.userText)
			? params.query : null;
		this._searchToolBar.setSearchFieldValue(value || "");

		// bug: 42512 - deselect global inbox if searching via search toolbar
		if (appCtxt.multiAccounts && params.userText && this.searchAllAccounts) {
			appCtxt.getCurrentApp().getOverviewContainer().deselectAll();
		}
	}

	// get types from search type if not passed in explicitly
	// Note - types is now always one value (used to allow all types case, but not anymore).
	var types = params.types;
	// Support calling it with null, scalar, array or vector, to make sure different clients of this method work.
	var type = !types ? searchFor : AjxUtil.toArray(types)[0];

	//now make sure the searchFor matches the type (searchFor can be taken from the toolbar, but it's not always what we want, for example
	//in the case of saved search)
	searchFor = this.getSearchForFromType(type);

	//this makes sure for mail we get the type from the user's setting (CONV/MSG).
	if (!params.forceTypes) {
		type = this.getTypeFromSearchFor(searchFor, params.userInitiated);
	}

	var types = AjxVector.fromArray([type]); //need this Vector (one item) only for couple more usages below that I'm afraid to change now.

	if (searchFor == ZmId.SEARCH_MAIL) {
		params = appCtxt.getApp(ZmApp.MAIL).getSearchParams(params);
	}

	if (searchFor == ZmItem.TASK) {
		var tlc = AjxDispatcher.run("GetTaskListController");
		params.allowableTaskStatus = tlc && tlc.getAllowableTaskStatus();
	}

	if (params.searchAllAccounts && !params.queryHint) {
		params.queryHint = appCtxt.accountList.generateQuery(null, types);
		params.accountName = appCtxt.accountList.mainAccount.name;
	}
	else if (params.inclSharedItems || this._inclSharedItems) {
		// a query hint is part of the query that the user does not see
		params.queryHint = ZmSearchController.generateQueryForShares(type);
	}

	// only set contact source if we are searching for contacts
	params.contactSource = !params.noGal && (type === ZmItem.CONTACT || type === ZmId.SEARCH_GAL)
		? this._contactSource : null;
	if (params.contactSource == ZmId.SEARCH_GAL) {
		params.expandDL = true;
	}

	// find suitable sort by value if not given one (and if applicable)
	params.sortBy = params.sortBy || this._getSuitableSortBy(type);
	params.types = types;
	var search = new ZmSearch(params);

	// force drafts folder into msg view
	//Also force dumpster search into msg view
	if (searchFor === ZmId.SEARCH_MAIL && (params.inDumpster || (!params.isViewSwitch && search.folderId && search.folderId == ZmFolder.ID_DRAFTS))) {
		search.types = AjxVector.fromArray([ZmItem.MSG]);
		search.isDefaultToMessageView = true;
	}

	var respCallback = this._handleResponseDoSearch.bind(this, search, noRender, callback, params.noUpdateOverview);
    var offlineCallback = this._handleOfflineDoSearch.bind(this, search, respCallback);
    if (search.folderId == ZmFolder.ID_OUTBOX) {
        var offlineRequest = true;
    }
	if (!errorCallback) {
		errorCallback = this._handleErrorDoSearch.bind(this, search);
		if (!params.errorCallback) {
			params.errorCallback = errorCallback;
		}
	}

	// calendar searching is special so hand it off if necessary
	search.calController = null;
	if (searchFor == ZmItem.APPT && !params.forceSearch && !params.inDumpster) {
		var searchResultsController, sessionId;
		if (search.userInitiated && ZmApp.SEARCH_RESULTS_TAB[ZmApp.CALENDAR]) {
			searchResultsController = appCtxt.getApp(ZmApp.SEARCH).getSearchResultsController(search.sessionId, ZmApp.CALENDAR);
			sessionId = searchResultsController.getCurrentViewId();
		}
		var controller = AjxDispatcher.run("GetCalController", sessionId, searchResultsController);
		if (controller && type === ZmItem.APPT) {
			search.calController = controller;
			controller.handleUserSearch(params, respCallback);
		} else {
            search.execute({offlineCache:params && params.offlineCache, callback:respCallback, errorCallback:errorCallback, offlineCallback:offlineCallback, offlineRequest:offlineRequest});
        }
	} else {
		search.execute({offlineCache:params && params.offlineCache, callback:respCallback, errorCallback:errorCallback, offlineCallback:offlineCallback, offlineRequest:offlineRequest});
	}
};

/**
 * Takes the search result and hands it to the appropriate controller for display.
 *
 * @param {ZmSearch}	search			contains search info used to run search against server
 * @param {Boolean}		noRender		<code>true</code> to skip rendering results
 * @param {AjxCallback}	callback		the callback to run after processing search response
 * @param {Boolean}	noUpdateOverview	<code>true</code> to skip updating the overview
 * @param {ZmCsfeResult}	result			the search results
 */
ZmSearchController.prototype._handleResponseDoSearch =
function(search, noRender, callback, noUpdateOverview, result) {

	DBG.println("s", "SEARCH was user initiated: " + Boolean(search.userInitiated));
	var results = result && result.getResponse();
	if (!results) { return; }

	if (!results.type) {
		results.type = search.types.get(0);
	}

	this.currentSearch = search;
	DBG.timePt("execute search", true);

	if (!noRender) {
		this._showResults(results, search, noUpdateOverview);
	}

	if (callback) {
		callback.run(result);
	}
};

/**
 * Takes the search result and hands it to the appropriate controller for display.
 *
 * @param {ZmSearch}	search			contains search info used to run search against server
 * @param {AjxCallback}	callback		the callback to run after generating offline result
 */
ZmSearchController.prototype._handleOfflineDoSearch =
function(search, callback) {
	//force webclient offline mode into msg view for mail search
	if (search.types && search.types.replaceObject(ZmItem.CONV, ZmItem.MSG)) {
		search.isDefaultToMessageView = true;
	}
    var respCallback = this._handleOfflineResponseDoSearch.bind(this, search, callback);
    ZmOfflineDB.search(search, respCallback);
};

/**
 * @private
 */
ZmSearchController.prototype._showResults =
function(results, search, noUpdateOverview) {

	this._results = results = (results && results.isZmSearchResult) ? results : new ZmSearchResult(search);

	DBG.timePt("handle search results");

    var ac = window.parentAppCtxt || window.appCtxt;
	if (ac.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		var saveBtn = this._searchToolBar && this._searchToolBar.getButton(ZmSearchToolBar.SAVE_BUTTON);
		if (saveBtn) {
			saveBtn.setEnabled(this._contactSource != ZmId.SEARCH_GAL);
		}
	}

	var app = search.calController ? ac.getApp(ZmApp.CALENDAR) : ac.getApp(ZmItem.APP[results.type]) || ac.getCurrentApp();
	var appName = app.getName();
	if (search.userInitiated && ZmApp.SEARCH_RESULTS_TAB[appName]) {
		var ctlr = (search.calController && search.calController.searchResultsController) ||
					ac.getApp(ZmApp.SEARCH).getSearchResultsController(search.sessionId, appName);
		DBG.println("sr", "New search results controller: " + ctlr.viewId);
		ctlr.show(results, search.calController);
		this._searchToolBar.setSearchFieldValue("");
	}
	else if (app.showSearchResults) {
		// show results based on type - may invoke package load
		var loadCallback = this._handleLoadShowResults.bind(this, results, search, noUpdateOverview);
		app.currentSearch = search;
		app.currentQuery = search.query;
		app.showSearchResults(results, loadCallback);
	}
};

// Opens a new, empty search tab
ZmSearchController.prototype.openNewSearchTab = function() {
	this._toolbarSearch({
		isEmpty:    true,
		origin:     ZmId.SEARCH
	});
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
function(search, ex) {
	DBG.println(AjxDebug.DBG1, "Search exception: " + ex.code);
    if (ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG ||
		ex.code == ZmCsfeException.MAIL_QUERY_PARSE_ERROR ||
		ex.code == ZmCsfeException.MAIL_TOO_MANY_TERMS ||
		(ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER && !(ex.data.itemId && ex.data.itemId.length)))
	{
		var msg = ex.getErrorMsg();
		appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_WARNING);
		return true;
	}
	return false;
};

/**
 * Provides a string to add to the query when the search includes shared items.
 * 
 * @param {String} type		item type
 * 
 * @private
 */
ZmSearchController.generateQueryForShares =
function(type, account) {
	var ac = window.parentAppCtxt || window.appCtxt;
	var list = [];
	var app = ac.getApp(ZmItem.APP[type]);
	if (!app) {
		return null;
	}
	var ids = app.getRemoteFolderIds(account);
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		var idText = AjxUtil.isNumeric(id) ? id : ['"', id, '"'].join("");
		list.push("inid:" + idText);
	}

	if (list.length > 0) {
		list.push("is:local");
		return list.join(" OR ");
	}

	return null;
};

// called when the search button has been pressed
ZmSearchController.prototype._searchButtonListener =
function(ev) {
	this._toolbarSearch({
				ev:				ev,
				zimletEvent:	"onSearchButtonClick",
				origin:			ZmId.SEARCH
			});
};

/**
 * Runs a search based on the state of the toolbar.
 * 
 * @param {Hash}	params		a hash of parameters:
 * 
 * @param {Event}		ev							browser event	
 * @param {string}		zimletEvent					type of notification to send zimlets
 * @param {string}		query						search string (optional, overrides input field)
 * @param {Boolean}     isEmpty                     force a search for ""
 * @param {string}		origin						indicates what initiated the search
 * @param {string}		sessionId					session ID of search results tab (if search came from one)
 * @param {boolean}		skipUpdateSearchToolbar     don't update the search toolbar (e.g. from the ZmDumpsterDialog where the search is called from its own search toolbar
 * @param {String}		sortBy
 * 
 * @private
 */
ZmSearchController.prototype._toolbarSearch =
function(params) {

	// find out if the custom search menu item is selected and pass it the event
	var result = params.searchFor || this._searchToolBar.getSearchType();
	if (result && result.listener) {
		result.listener.run(params.ev);
	} else {
		var queryString = !params.isEmpty ? params.query || this._searchToolBar.getSearchFieldValue() : "";
		var userText = (queryString.length > 0);
		if (queryString) {
			this._currentQuery = null;
		} else {
			queryString = this._currentQuery || "";
		}

		appCtxt.notifyZimlets(params.zimletEvent, [queryString]);
		var searchParams = {
			query:						queryString,
			userText:					userText,
			userInitiated:				true,
			getHtml:					appCtxt.get(ZmSetting.VIEW_AS_HTML),
			searchFor:					result,
			skipUpdateSearchToolbar:	params.skipUpdateSearchToolbar,
			origin:						params.origin,
			sessionId:					params.sessionId,
			errorCallback:				params.errorCallback,
			sortBy:						params.sortBy,
			isEmpty:					params.isEmpty || !queryString
		};
		this.search(searchParams);
	}
};

/**
 * @private
 */
ZmSearchController.prototype._searchMenuListener =
function(ev, id, noFocus) {
	var btn = this._searchToolBar.getButton(ZmSearchToolBar.TYPES_BUTTON);
	if (!btn) { return; }

	var menu = btn.getMenu();
	var item = ev ? ev.item : (menu.getItemById(ZmOperation.MENUITEM_ID, id));

	if (!item || (!!(item._style & DwtMenuItem.SEPARATOR_STYLE))) { return; }
	id = item.getData(ZmOperation.MENUITEM_ID);

	var selItem = menu.getSelectedItem();
	var sharedMI = menu.getItemById(ZmOperation.MENUITEM_ID, ZmId.SEARCH_SHARED);

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
				if (this._sharedMenuItemChecked == null) {
					this._sharedMenuItemChecked = sharedMI.getChecked();
				}
				sharedMI.setChecked(false, true);
				sharedMI.setEnabled(false);
			} else {
				sharedMI.setEnabled(true);
				if (this._sharedMenuItemChecked) {
					sharedMI.setChecked(true, true);
				}
				this._sharedMenuItemChecked = null;
			}
		}
		this._contactSource = ZmItem.CONTACT;
	}
	this._inclSharedItems = sharedMI && sharedMI.getChecked();

	// search all accounts? Only applies to multi-account mbox
	var allAccountsMI = menu.getItemById(ZmOperation.MENUITEM_ID, ZmId.SEARCH_ALL_ACCOUNTS);
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
			icon = this._getSharedImage(selItem);
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
	}

	// set button tooltip
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[id]];
	if (id != ZmId.SEARCH_SHARED && id != ZmId.SEARCH_ALL_ACCOUNTS) {
		btn.setToolTipContent(tooltip);
		btn.setAttribute('aria-label', tooltip);
	}
	
	if (!noFocus) {
		// restore focus to INPUT if user changed type
		setTimeout(this._searchToolBar.focus.bind(this._searchToolBar), 10);
	}
};

/**
 * @private
 */
ZmSearchController.prototype._getSharedImage =
function(selItem) {
	var selItemId = selItem && selItem.getData(ZmOperation.MENUITEM_ID);
	return (selItemId && ZmSearchToolBar.SHARE_ICON[selItemId])
		? ZmSearchToolBar.SHARE_ICON[selItemId]
		: ZmSearchToolBar.ICON[selItemId]; //use regular icon if no share icon
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

/**
 * Takes the search result and hands it to the appropriate controller for display.
 *
 * @param {ZmSearch}	search			contains search info used to run search against server
 * @param {AjxCallback}	callback		online response callback to run after generating search response
 * @param {Object}	    result			the object stored in indexedDB
 *
 * @private
 */
ZmSearchController.prototype._handleOfflineResponseDoSearch =
function(search, callback, result) {

    if (search.sortBy === ZmSearch.DATE_DESC) {
		//Sort by received date descending
		result.sort(function(a, b) {
			return b.d - a.d;
	    });
    }
	else if (search.sortBy === ZmSearch.DATE_ASC) {
	    //Sort by received date ascending
	    result.sort(function(a, b) {
		    return a.d - b.d;
	    });
    }

    var searchResult = new ZmSearchResult(search);
    if (search.searchFor === ZmId.SEARCH_MAIL || search.parsedSearchFor === ZmId.SEARCH_MAIL) {
        search.types =  new AjxVector([ZmItem.MSG]);
        searchResult.set({m : result});
    }
    else if (search.searchFor === ZmItem.CONTACT || search.contactSource === ZmItem.CONTACT) {
        searchResult.set({cn : result});
    }
    var zmCsfeResult = new ZmCsfeResult(searchResult);
    callback(zmCsfeResult);

    if (search.folderId == ZmFolder.ID_OUTBOX || search.folderId == ZmFolder.ID_DRAFTS) {
		ZmOffline.updateFolderCountCallback(search.folderId, result.length);
    }
};

ZmSearchController.prototype._addOfflineDrafts =
function(search, result) {
    var callback = this._addOfflineDraftsCallback.bind(this, search, result);
    var key = {methodName : "SaveDraftRequest"};
    ZmOfflineDB.getItemInRequestQueue(key, callback, callback);
};

ZmSearchController.prototype._addOfflineDraftsCallback =
function(search, result, newResult) {
    var respEl = ZmOffline.generateMsgResponse(newResult);
    this._handleResponseDoIndexedDBSearch(search, [].concat(result).concat(respEl));
};
