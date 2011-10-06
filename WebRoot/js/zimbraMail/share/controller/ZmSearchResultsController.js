/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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

ZmSearchResultsController.prototype.show =
function(results) {
	
	var resultsType = results.type;
//	var loadCallback = this._handleLoadShowResults.bind(this, results, search, noUpdateOverview);
	var app = this._resultsApp = appCtxt.getApp(ZmItem.APP[resultsType]) || appCtxt.getCurrentApp();
//	app.currentSearch = search;
//	app.currentQuery = search.query;
	app.showSearchResults(results, this._displayResults.bind(this, results.search), this);
};

ZmSearchResultsController.prototype._initialize =
function() {

	this._toolbar = new ZmSearchResultsToolBar({
				parent:			this._container,
				id:				ZmId.SEARCHRESULTS_TOOLBAR,
				noMenuButton:	true
			});
	
	this._toolbar.getButton(ZmSearchToolBar.SEARCH_BUTTON).addSelectionListener(this._searchListener.bind(this));
	this._toolbar.getButton(ZmSearchToolBar.SAVE_BUTTON).addSelectionListener(this._saveListener.bind(this));
	this._toolbar.registerEnterCallback(this._searchListener.bind(this));

	this._filterPanel = new ZmSearchResultsFilterPanel({parent:this._container});
};

// TODO: handle reuse
/**
 * 
 * @param search
 * @param {ZmController}	resultsCtlr		passed back from app
 */
ZmSearchResultsController.prototype._displayResults =
function(search, resultsCtlr) {
	
	if (appCtxt.getCurrentViewId() == this._currentViewId) {
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = resultsCtlr.getCurrentToolbar();
		elements[ZmAppViewMgr.C_APP_CONTENT] = resultsCtlr.getCurrentView();
		appCtxt.getAppViewMgr().setViewComponents(this._currentViewId, elements, true);
	}
	else {
		this._toolbar.setSearch(search);
		
		var elements = {};
		elements[ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR] = this._toolbar;
		elements[ZmAppViewMgr.C_TREE] = this._filterPanel;
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = resultsCtlr.getCurrentToolbar();
		elements[ZmAppViewMgr.C_APP_CONTENT] = resultsCtlr.getCurrentView();
		
		this._app.createView({	viewId:		this._currentViewId,
								viewType:	this._currentViewType,
								elements:	elements,
								controller:	this,
								hide:		[ ZmAppViewMgr.C_NEW_BUTTON, ZmAppViewMgr.C_TREE_FOOTER ],
								tabParams:	this._getTabParams()});
		this._app.pushView(this._currentViewId);
		
//		var button = appCtxt.getAppChooser().getButton(this.tabId);
//		var menu = new DwtMenu({parent: button});
	}
	setTimeout(this._toolbar.focus.bind(this._toolbar), 100);
};

ZmSearchResultsController.prototype._getTabParams =
function() {
	return {
		id:				this.tabId,
		image:			"Search",
		text:			ZmSearchResultsController.DEFAULT_TAB_TEXT,
		textPrecedence:	90,
		tooltip:		ZmSearchResultsController.DEFAULT_TAB_TEXT
	};
};

ZmSearchResultsController.prototype._searchListener =
function(ev, zimletEvent) {
	var query = this._toolbar.getSearchFieldValue();
	if (query) {
		var params = {
			ev:							ev,
			zimletEvent:				zimletEvent || "onSearchButtonClick",
			query:						query,
			skipUpdateSearchToolbar:	true
		}
		appCtxt.getSearchController()._toolbarSearch(params);
	}
};

ZmSearchResultsController.prototype._saveListener =
function(ev) {
	appCtxt.getSearchController()._saveButtonListener(ev);
};
