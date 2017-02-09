/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file defines the search results controller.
 *
 * @author Conrad Damon
 */

/**
 * @class
 * This controller is used to display the results of a user-initiated search. The results are
 * displayed in a tab which has three parts: a search bar at the top that can be used to modify
 * the search, a filtering mechanism on the left that can be used to refine the search, and the
 * results themselves. The results may be of any type: messages, contacts, etc.
 * 
 * @param	{DwtShell}		container		the application container
 * @param	{ZmApp}			app				the application
 * @param	{constant}		type			type of controller
 * @param	{string}		sessionId		the session id
 * 
 * @extends	ZmController
 */
ZmSearchResultsController = function(container, app, type, sessionId) {

	ZmController.apply(this, arguments);
	
	this._initialize();
};

ZmSearchResultsController.prototype = new ZmController;
ZmSearchResultsController.prototype.constructor = ZmSearchController;

ZmSearchResultsController.prototype.isZmSearchResultsController = true;
ZmSearchResultsController.prototype.toString = function() { return "ZmSearchResultsController"; };

ZmSearchResultsController.DEFAULT_TAB_TEXT = ZmMsg.search;

ZmSearchResultsController.getDefaultViewType =
function() {
	return ZmId.VIEW_SEARCH_RESULTS;
};
ZmSearchResultsController.prototype.getDefaultViewType = ZmSearchResultsController.getDefaultViewType;

/**
 * Displays the given results in a search tab managed by this controller.
 * 
 * @param {ZmSearchResults}		results		search results
 */
ZmSearchResultsController.prototype.show =
function(results, resultsCtlr) {
	var resultsType = results.type;
	results.search.sessionId = this.sessionId;	// in case we reuse this search (eg view switch)
	var app = this._resultsApp = appCtxt.getApp(ZmItem.APP[resultsType]) || appCtxt.getCurrentApp();
	if (!resultsCtlr) {
		app.showSearchResults(results, this._displayResults.bind(this, results.search), this);
	}
	else {
		this._displayResults(results.search, resultsCtlr);
	}
	appCtxt.searchAppName = app.getName();
	this._curSearch = results.search;
	this.inactive = true;	// search tabs can always be reused (unless pinned)
};

/**
 * Shows the overview or the filter panel, and the mini-calendar. The overview is shown during a DnD operation.
 *
 * @param {Boolean}     show    if true, show the overview; if false, show the filter panel
 */
ZmSearchResultsController.prototype.showOverview =
function(show) {

	var overview = this._resultsApp.getOverview(),
		avm = appCtxt.getAppViewMgr();

	if (overview) {
		var treeComp = {};
		treeComp[ZmAppViewMgr.C_TREE] = show ? overview : this._filterPanel;
		avm.setViewComponents(this.viewId, treeComp, true);
		avm.displayComponent(ZmAppViewMgr.C_TREE_FOOTER, show, true);
	}
};

// creates the toolbar and filter panel
ZmSearchResultsController.prototype._initialize =
function() {

	this._toolbar = new ZmSearchResultsToolBar({
				parent:			this._container,
				controller:		this,
				id:				DwtId.makeId(ZmId.SEARCHRESULTS_TOOLBAR, this._currentViewId),
				noMenuButton:	true
			});
	this._toolbar.getButton(ZmSearchToolBar.SEARCH_BUTTON).addSelectionListener(this._searchListener.bind(this));
	var saveButton = this._toolbar.getButton(ZmSearchToolBar.SAVE_BUTTON);
	if (saveButton) {
		saveButton.addSelectionListener(this._saveListener.bind(this));
	}
	this._toolbar.registerEnterCallback(this._searchListener.bind(this));

	this.isPinned = false;
};

/**
 * Shows the results of the given search in this controller's search tab. The toolbar and filter panel
 * were created earlier, and the content area (top toolbar and list view) is taken from the controller
 * that generated the results.
 * 
 * @param {ZmSearch}		search			search object
 * @param {ZmController}	resultsCtlr		passed back from app
 * @private
 */
ZmSearchResultsController.prototype._displayResults =
function(search, resultsCtlr) {

	var resultsApp = resultsCtlr.getApp().getName();
	if (!this._filterPanel || this._filterPanel._resultsApp !== resultsApp) {
		this._filterPanel = new ZmSearchResultsFilterPanel({
					parent:		this._container,
					controller:	this,
					id:			DwtId.makeId(ZmId.SEARCHRESULTS_PANEL, this._currentViewId),
					resultsApp:	resultsApp
				});
	}

	this._resultsController = resultsCtlr;

	var elements = {};
	elements[ZmAppViewMgr.C_TREE] = this._filterPanel;
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = resultsCtlr.getCurrentToolbar();
	elements[ZmAppViewMgr.C_APP_CONTENT] = resultsCtlr.getViewMgr ? resultsCtlr.getViewMgr() : resultsCtlr.getCurrentView();

	if (appCtxt.getCurrentViewId().indexOf(this._currentViewId) !== -1) {
		appCtxt.getAppViewMgr().setViewComponents(this._currentViewId, elements, true);
	}
	else {

		var callbacks = {};
		callbacks[ZmAppViewMgr.CB_POST_REMOVE]	= this._postRemoveCallback.bind(this);
		callbacks[ZmAppViewMgr.CB_POST_SHOW]    = this._postShowCallback.bind(this);
		elements[ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR] = this._toolbar;

		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								callbacks:	callbacks,
								controller:	this,
								hide:		[ ZmAppViewMgr.C_TREE_FOOTER ],
								tabParams:	this._getTabParams()});
		this._app.pushView(this._currentViewId);
		this._filterPanel.reset();

		if (!this._button) {
			this._button = appCtxt.getAppChooser().getButton(this.tabId);
			Dwt.addClass(this._button.getHtmlElement(), "SearchTabButton");
			this._button.addSelectionListener(this._pinnedListener.bind(this));
		}
	}

	if (search && search.query) {
		this._filterPanel.resetBasicFiltersToQuery(search.query);
	}
	
	if (search && search.origin == ZmId.SEARCH) {
		this._toolbar.setSearch(search);
	}

	// Tell the user how many results were found
	var searchResult = resultsCtlr.getCurrentSearchResults && resultsCtlr.getCurrentSearchResults();
	var results = (searchResult && searchResult.getResults()) || resultsCtlr.getList();
	var size = results && results.size && results.size();
	var plus = (results && results.hasMore && results.hasMore()) ? "+" : "";
	var label = size ? AjxMessageFormat.format(ZmMsg.searchResultsLabel, [size, plus]) :
					   search.isEmpty ? ZmMsg.searchResultsEnterSearch : ZmMsg.searchResultsLabelNone;
	this._toolbar.setLabel(label, false);
    if (resultsCtlr && resultsCtlr.updateTimeIndicator) {
        resultsCtlr.updateTimeIndicator();
    }
	setTimeout(this._toolbar.focus.bind(this._toolbar), 100);
};

ZmSearchResultsController.prototype._postHideCallback =
function() {
};

ZmSearchResultsController.prototype._postRemoveCallback =
function() {
	this._app.deleteSessionController({
		appName:	this._resultsApp.getName(),
		controllerClass: "ZmSearchResultsController",
		sessionId:	this.sessionId
	});
};

ZmSearchResultsController.prototype._postShowCallback =
function() {
	if (appCtxt.isWebClientOfflineSupported) {
		this.getApp().resetWebClientOfflineOperations(this);
	}
};

// returns params for the search tab button
ZmSearchResultsController.prototype._getTabParams =
function() {
	return {
		id:					this.tabId,
		leftImage:			"Pin",
		rightImage:			"CloseGray",
        rightHoverImage:	"Close",
		text:				ZmSearchResultsController.DEFAULT_TAB_TEXT,
		textPrecedence:		90,
		tooltip:			ZmSearchResultsController.DEFAULT_TAB_TEXT,
		style:          	DwtLabel.IMAGE_BOTH
	};
};

// runs a search based on the contents of the input
ZmSearchResultsController.prototype._searchListener =
function(ev, zimletEvent) {

	// add bubble if needed before running search, but don't let "bubble added" callback trigger a search
	var toolbar = this._toolbar, element = toolbar && toolbar._searchField.getInputElement();
	if (element && toolbar._acList) {
		toolbar._settingSearch = true;
		toolbar._acList._complete(element);
		toolbar._settingSearch = false;
	}

	var view = appCtxt.getCurrentViewId(); //this view should be the results list view. Somehow it seems to be.
	var sortBy = view ? appCtxt.get(ZmSetting.SORTING_PREF, view) : null; // repeat the previous sort order (from same search tab only, which is this case)

	// run the search
	var query = this._toolbar.getSearchFieldValue();
	var params = {
		ev:							ev,
		zimletEvent:				zimletEvent || "onSearchButtonClick",
		query:						query,
		isEmpty:					!query,
		sessionId:					this.sessionId,
		skipUpdateSearchToolbar:	true,
		origin:						ZmId.SEARCHRESULTS,
		searchFor:					this._curSearch && this._curSearch.searchFor,
		sortBy:						sortBy,
		errorCallback:				this._errorCallback.bind(this)
	};
	toolbar.setLabel(ZmMsg.searching);
	appCtxt.getSearchController()._toolbarSearch(params);
};

// Note the error and then eat it - we don't want to show toast or clear out results
ZmSearchResultsController.prototype._errorCallback =
function(ex) {
	var msg = ZmCsfeException.getErrorMsg(ex.code);
	msg = msg || ZmMsg.unknownError;
	this._toolbar.setLabel(msg, true);
	return true;
};

// pops up a dialog to save the search
ZmSearchResultsController.prototype._saveListener =
function(ev) {

	var stc = appCtxt.getOverviewController().getTreeController(ZmOrganizer.SEARCH);
	if (!stc._newCb) {
		stc._newCb = stc._newCallback.bind(stc);
	}

	var params = {
		search: this._curSearch,
		appName: this._resultsApp.getName()
	};
	ZmController.showDialog(stc._getNewDialog(), stc._newCb, params);
};

// toggles the pinned state of this tab
ZmSearchResultsController.prototype._pinnedListener =
function(ev) {
	if (!Dwt.hasClass(ev.target, "ImgPin") && !Dwt.hasClass(ev.target, "ImgUnpin")) {
		return;
	}
	this.isPinned = !this.isPinned;
	var button = appCtxt.getAppChooser().getButton(this.tabId);
	button.setImage(this.isPinned ? "Unpin" : "Pin", DwtLabel.LEFT);
};

ZmSearchResultsController.prototype._closeListener =
function(ev) {
	appCtxt.getAppViewMgr().popView(false, this.getCurrentViewId());
};

// adds the given term to the search as a bubble
ZmSearchResultsController.prototype.addSearchTerm =
function(term, skipNotify, addingCond) {
	return this._toolbar.addSearchTerm(term, skipNotify, addingCond);
};

// removes the bubble with the given term
ZmSearchResultsController.prototype.removeSearchTerm =
function(term, skipNotify) {
	this._toolbar.removeSearchTerm(term, skipNotify);
};

// returns a list of current search terms
ZmSearchResultsController.prototype.getSearchTerms =
function(term, skipNotify) {
	var values = this._toolbar._searchField.getAddresses();
	var terms = AjxUtil.map(values, function(member, i) {
		return new ZmSearchToken(member);
	});
	return terms;
};
