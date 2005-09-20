/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSearchController(appCtxt, container) {

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

ZmSearchController.prototype.fromSearch = 
function(address) {
	// bug fix #3297 - always search for mail when doing a "from: <address>" search
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	this.search("from:(" + address + ")", [groupBy]);
}

ZmSearchController.prototype.fromBrowse = 
function(name) {
	var bv = this.showBrowseView(true);
	bv.removeAllPickers();
	this._browseViewController.removeAllPickers();
	var picker = this._browseViewController.addPicker(ZmPicker.BASIC);
	picker.setFrom(name);
	picker.execute();
}

ZmSearchController.prototype.showBrowseView = 
function(forceShow) {
	var bvc = this._browseViewController;
	var show, bv;
	if (!bvc) {
		show = true;
		bvc = this._browseViewController = new ZmBrowseController(this._appCtxt, this._searchPanel);
		bvc.setBrowseViewVisible(show);
		bv = bvc.getBrowseView();
	} else {
		show = forceShow || !bvc.getBrowseViewVisible();
		bvc.setBrowseViewVisible(show);
		bv = bvc.getBrowseView();
	}
	
   	return bv;
}

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
* Provides a programmatic way to set the search type. So that it doesn't override a user's
* choice, it only works if there's a current system-set default, or the "force" flag is set.
* Any time a user chooses a type through the menu, the default is cleared.
*
* @param type		the search type to set as the default
* @param force		override user choice
*/
ZmSearchController.prototype.setDefaultSearchType =
function(type, force) {
	if (this._defaultSearchType || force) {
		if (this._searchToolBar) {
			var menu = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON).getMenu();
			menu.checkItem(ZmSearchToolBar.MENUITEM_ID, type);
		}
		this._defaultSearchType = type;
	}
}
	
ZmSearchController.prototype._setView =
function() {
	// Create search panel - a composite is needed because the search builder 
	// element (ZmBrowseView) is added to it (can't add it to the toolbar)
	this._searchPanel = new DwtComposite(this._container, "SearchPanel", Dwt.ABSOLUTE_STYLE);
	this._searchToolBar = new ZmSearchToolBar(this._appCtxt, this._searchPanel);
	
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

	this._searchToolBar.addSelectionListener(ZmSearchToolBar.SEARCH_BUTTON, new AjxListener(this, this._searchButtonListener));
	if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED))
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.BROWSE_BUTTON, new AjxListener(this, this._browseButtonListener));
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
		this._searchToolBar.addSelectionListener(ZmSearchToolBar.SAVE_BUTTON, new AjxListener(this, this._saveButtonListener));
}

ZmSearchController.prototype.search =
function(query, types, sortBy, offset, limit, callback, userText) {
	if (!(query && query.length)) return;
	
	// if the search string starts with "$set:" then it is a command to the client 
	if (query.indexOf("$set:") == 0) {
		this._appCtxt.getClientCmdHdlr().execute((query.substr(5)).split(" "));
		return;
	}

	var params = {query: query, types: types, sortBy: sortBy, offset: offset, limit: limit, callback: callback, userText: userText};
	this._schedule(this._doSearch, params);
}

/**
* Performs the given search. It takes a ZmSearch, rather than constructing one out of the currently selected menu
* choices. Aside from re-executing a search, it can be used to perform a canned search.
*/
ZmSearchController.prototype.redoSearch =
function(search, callback, changes) {
	search.callback = callback;
	var newSearch;
	if (changes) {
		newSearch = new ZmSearch(this._appCtxt, search.query, search.types, search.sortBy,
								 search.offset, search.limit, search.contactSource);
		newSearch.callback = callback;
		for (var key in changes) 
			newSearch[key] = changes[key];
	} else {
		newSearch = search;
	}
	this._schedule(this._doSearch, newSearch);
}

/**
* Assembles a list of item types to return based on a search menu value (which can
* be passed in).
*
* @param searchFor		the value of a search menu item (see ZmSearchToolBar)
*/
ZmSearchController.prototype.getTypes =
function(searchFor) {
	var types = new AjxVector();
	searchFor = searchFor ? searchFor : this._searchFor;
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	if (searchFor == ZmSearchToolBar.FOR_MAIL_MI) {
		types.add(groupBy);
	} else if (searchFor == ZmSearchToolBar.FOR_ANY_MI) {
		types.add(groupBy);
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
			types.add(ZmItem.CONTACT);
		if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED))
			types.add(ZmItem.APPT);
		if (this._appCtxt.get(ZmSetting.NOTES_ENABLED))
			types.add(ZmItem.NOTE);
	} else {
		types.add(searchFor);
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
			case ZmItem.CONV: 	viewType = ZmController.CONVLIST_VIEW; break;
			case ZmItem.MSG: 	viewType = ZmController.TRAD_VIEW; break;
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
* @param params	[Object]	a hash of arguments for the search (see search() method)
*/
ZmSearchController.prototype._doSearch =
function(params) {

	if (this._searchToolBar) {
		var value = (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING) || params.userText) ? params.query : "";
		this._searchToolBar.setSearchFieldValue(value);
		this._searchToolBar.setEnabled(false);
	}

	// get types from search menu if not passed in
	var types = params.types || this.getTypes();
	if (types instanceof Array) // convert array to AjxVector if necessary
		types = AjxVector.fromArray(types);

	// only set contact source if we are searching for contacts
	var contactSource = (types.contains(ZmItem.CONTACT) || types.contains(ZmSearchToolBar.FOR_GAL_MI))
		? this._contactSource : null;
	// find suitable sort by value if not given one (and if applicable)
	params.sortBy = params.sortBy || this._getSuitableSortBy(types);
	
	var search = new ZmSearch(this._appCtxt, params.query, types, params.sortBy, params.offset, params.limit, contactSource);
	var results;
	var useAsync = this._appCtxt.get(ZmSetting.ASYNC_MODE);
	try {
		if (useAsync) {
			var callback = new AjxCallback(this, this._handleResponse, [search, params, types]);
			search.execute(callback);
		} else {
			results = search.execute();
			this._handleResponse([search, params, types, results]);
		}
	} catch (ex) {
		this._handleError(ex, params);
	}
}

/*
* Takes the search result and hands it to the appropriate controller.
*
* @params args	[Object]	
*/
ZmSearchController.prototype._handleResponse =
function(args) {

	var search = args[0];
	var params = args[1];
	var types = args[2];
	var results = args[3];

	if (!results) return;
	var gotError = (results instanceof ZmCsfeException);
	if (gotError) {
		this._handleError(results, params);
		results = new ZmSearchResult(this._appCtxt);
		results.type = params.types ? params.types[0]: null;
	}

	this._appCtxt.setCurrentSearch(search);
	DBG.timePt("execute search");
	if (this._searchToolBar)
		this._searchToolBar.setEnabled(true);
	if (!results.type)
		results.type = types.get(0);
	
	if (params.callback) {
		params.callback.run(results);
		return;
	} 

	// allow old results to dtor itself
	if (this._results && (this._results.type == results.type))
		this._results.dtor();
	this._results = results;

	DBG.timePt("handle search results");
	if (results.type == ZmItem.CONV) {
		this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getConvListController().show(results, params.query);
	} else if (results.type == ZmItem.MSG) {
		this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getTradController().show(results, params.query);
	} else if (results.type == ZmItem.CONTACT) {
		this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactListController().show(results, params.query, this._contactSource == ZmSearchToolBar.FOR_GAL_MI);
	} else if (results.type == ZmList.MIXED) {
		this._appCtxt.getApp(ZmZimbraMail.MIXED_APP).getMixedController().show(results, params.query);
	}
	DBG.timePt("render search results");
}

ZmSearchController.prototype._handleError =
function(ex, params) {
	if (this._searchToolBar)
		this._searchToolBar.setEnabled(true);
	DBG.println(AjxDebug.DBG1, "Search exception: " + ex.code);
	if (ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER || ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG) {
		var msg = this._getErrorMsg(ex.code);
		this._appCtxt.getAppController().setStatusMsg(msg);
	} else {
		this._handleException(ex, this._doSearch, params, false);
		return;
	}
}

/*********** Search Field Callback */

ZmSearchController.prototype._searchFieldCallback =
function(queryString) {
	this.search(queryString, null, null, null, null, null, true);
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
	this.search(queryString, null, null, null, null, null, userText);
}

ZmSearchController.prototype._browseButtonListener =
function(ev) {
	this.showBrowseView();
}

ZmSearchController.prototype._saveButtonListener =
function(ev) {
	if (this._results && this._results.search) {
		var ftc = this._appCtxt.getOverviewPanelController().getFolderTreeController();
		ftc._showDialog(ftc._getNewSearchDialog(), ftc._newSearchCallback, this._results.search);
	}
}

ZmSearchController.prototype._searchMenuListener = 
function(ev) {
	if (ev.detail != DwtMenuItem.CHECKED) return;

	var id = ev.item.getData(ZmSearchToolBar.MENUITEM_ID);
	this._searchFor = id;
	if (id == ZmItem.CONTACT || id == ZmSearchToolBar.FOR_GAL_MI)
		this._contactSource = id;

	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[id]];
	var image = ZmSearchToolBar.ICON_KEY[id];
	
	if (id == ZmSearchToolBar.FOR_MAIL_MI) {
		var groupBy = this._appCtxt.getSettings().getGroupMailBy();
		tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[groupBy]];
	}

	var searchMenuBtn = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_MENU_BUTTON);
	
	var mi = searchMenuBtn.getMenu().getItemById(ZmSearchToolBar.MENUITEM_ID, id);
	image = mi._imageInfo;
	
	if (tooltip) {
		var button = this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_BUTTON);
		button.setToolTipContent(tooltip);
	}

	this._defaultSearchType = null; // clear system default now that user has spoken
}

ZmSearchController.prototype.setGroupMailBy =
function(id) {
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[id]];
	this._searchToolBar.getButton(ZmSearchToolBar.SEARCH_BUTTON).setToolTipContent(tooltip);
}
