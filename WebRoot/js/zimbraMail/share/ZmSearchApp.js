/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2011, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the search application class.
 */

/**
 * Creates and initializes the search application.
 * @constructor
 * @class
 * The search app manages user-initiated searches.
 *
 * @param	{DwtControl}	container		the container
 * @param	{ZmController}	parentController	the parent window controller (set by the child window)
 * 
 * @author Conrad Damon
 * 
 * @extends		ZmApp
 */
ZmSearchApp = function(container, parentController) {

	ZmApp.call(this, ZmApp.SEARCH, container, parentController);

	this._groupBy = appCtxt.get(ZmSetting.GROUP_MAIL_BY);
};

ZmSearchApp.prototype = new ZmApp;
ZmSearchApp.prototype.constructor = ZmSearchApp;

ZmSearchApp.prototype.isZmSearchApp = true;
ZmSearchApp.prototype.toString = function() {	return "ZmSearchApp"; };

ZmApp.SEARCH					= ZmId.APP_SEARCH;
ZmApp.CLASS[ZmApp.SEARCH]		= "ZmSearchApp";
ZmApp.SETTING[ZmApp.SEARCH]		= ZmSetting.SEARCH_ENABLED;

ZmSearchApp.CONTROLLER_CLASS = "ZmSearchResultsController";

ZmSearchApp.prototype.getSearchResultsController =
function(sessionId, appName) {
	return this.getSessionController({
				controllerClass:	ZmSearchApp.CONTROLLER_CLASS,
				sessionId:			sessionId,
				appName:			appName
			});
};

// override so we don't try to set overview panel content
ZmSearchApp.prototype.activate =
function(active) {
	this._active = active;
};

// Not hooked up for activate, but it will be called after displaying the search results
ZmSearchApp.prototype.resetWebClientOfflineOperations =
function(searchResultsController) {
	ZmApp.prototype.resetWebClientOfflineOperations.apply(this);
	if (!searchResultsController) {
		var controllerType = this.getTypeFromController(ZmSearchApp.CONTROLLER_CLASS);
		var sessionId = this.getCurrentSessionId(controllerType);
		searchResultsController = this.getSearchResultsController(sessionId);
	}
	// Only Save affected currently
	var searchResultsToolBar = searchResultsController && searchResultsController._toolbar;
	var saveButton = searchResultsToolBar && searchResultsToolBar.getButton(ZmSearchToolBar.SAVE_BUTTON);
	if (saveButton) {
		saveButton.setEnabled(!appCtxt.isWebClientOffline());
	}
};

// search app maintains its own "group mail by" setting
ZmSearchApp.prototype.getGroupMailBy = function() {
	return ZmMailApp.prototype.getGroupMailBy.call(this);
};

ZmSearchApp.prototype.setGroupMailBy = 	function(groupBy) {
	this._groupBy = groupBy;
};
