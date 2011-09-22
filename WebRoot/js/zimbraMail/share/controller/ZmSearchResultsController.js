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
};

ZmSearchResultsController.prototype = new ZmController;
ZmSearchResultsController.prototype.constructor = ZmSearchController;

ZmSearchResultsController.prototype.isZmSearchResultsController = true;
ZmSearchResultsController.prototype.toString = function() { return "ZmSearchResultsController"; };

ZmSearchResultsController.DEFAULT_TAB_TEXT = ZmMsg.search;

ZmSearchResultsController.prototype.getCurrentViewId =
function() {
	return this.viewId;
};

ZmSearchResultsController.prototype.show =
function(results) {
	
	var resultsType = results.type;
//	var loadCallback = this._handleLoadShowResults.bind(this, results, search, noUpdateOverview);
	var app = this._resultsApp = appCtxt.getApp(ZmItem.APP[resultsType]) || appCtxt.getCurrentApp();
//	app.currentSearch = search;
//	app.currentQuery = search.query;
	app.showSearchResults(results, this._setView.bind(this), this);
};

ZmSearchResultsController.prototype._setView =
function(resultsCtlr) {
	
	this._toolbar = new ZmSearchResultsToolBar(this._container, ZmId.SEARCHRESULTS_TOOLBAR);
	this._filterPanel = new DwtComposite({parent:this._container, className:"FilterPanel", posStyle:Dwt.ABSOLUTE_STYLE});
	this._filterPanel.getHtmlElement().innerHTML = "<div style='position:absolute;top:50%;margin-left:5px;'>Filter Panel not ready yet</div>";
	
	var callbacks = {};
	callbacks[ZmAppViewMgr.CB_PRE_SHOW]		= this._preShowCallback.bind(this, true);
	callbacks[ZmAppViewMgr.CB_POST_SHOW]	= this._postShowCallback.bind(this, true);
	callbacks[ZmAppViewMgr.CB_POST_HIDE]	= this._postHideCallback.bind(this, false);

	var elements = {};
	elements[ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR] = this._toolbar;
	elements[ZmAppViewMgr.C_TREE] = this._filterPanel;
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = resultsCtlr.getCurrentToolbar();
	elements[ZmAppViewMgr.C_APP_CONTENT] = resultsCtlr.getCurrentView();
	
	this._app.createView({	viewId:		this.viewId,
							elements:	elements,
							controller:	this,
//							show:		[ ZmAppViewMgr.C_SEARCH_RESULTS_TOOLBAR ],
							hide:		[ ZmAppViewMgr.C_NEW_BUTTON, ZmAppViewMgr.C_TREE_FOOTER ],
//							callbacks:	callbacks,
							tabParams:	this._getTabParams()});
	this._app.pushView(this.viewId);
};

ZmSearchResultsController.prototype._getTabParams =
function() {
	return {	id:				this.tabId,
				image:			"Search",
				text:			ZmSearchResultsController.DEFAULT_TAB_TEXT,
				textPrecedence:	90,
				tooltip:		ZmSearchResultsController.DEFAULT_TAB_TEXT};
};
