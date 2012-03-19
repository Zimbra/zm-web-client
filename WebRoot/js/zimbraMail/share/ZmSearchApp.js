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
};

ZmSearchApp.prototype = new ZmApp;
ZmSearchApp.prototype.constructor = ZmSearchApp;

ZmSearchApp.prototype.isZmSearchApp = true;
ZmSearchApp.prototype.toString = function() {	return "ZmSearchApp"; };

ZmApp.SEARCH					= ZmId.APP_SEARCH;
ZmApp.CLASS[ZmApp.SEARCH]		= "ZmSearchApp";
ZmApp.SETTING[ZmApp.SEARCH]		= ZmSetting.SEARCH_ENABLED;

ZmSearchApp.prototype.getSearchResultsController =
function(sessionId, appName) {
	return this.getSessionController({
				controllerClass:	"ZmSearchResultsController",
				sessionId:			sessionId,
				appName:			appName
			});
};

// override so we don't try to set overview panel content
ZmSearchApp.prototype.activate =
function(active) {
	this._active = active;
};
