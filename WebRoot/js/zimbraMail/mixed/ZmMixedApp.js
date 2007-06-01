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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmMixedApp = function(appCtxt, container) {

	ZmApp.call(this, ZmApp.MIXED, appCtxt, container);
};

// Organizer and item-related constants
ZmItem.MIXED	= "MIXED"; // special type for heterogeneous list

// App-related constants
ZmApp.MIXED						= "Mixed";
ZmApp.CLASS[ZmApp.MIXED]		= "ZmMixedApp";
ZmApp.SETTING[ZmApp.MIXED]		= null;	// so it gets instantiated
ZmApp.LOAD_SORT[ZmApp.MIXED]	= 50;

ZmMixedApp.prototype = new ZmApp;
ZmMixedApp.prototype.constructor = ZmMixedApp;

ZmMixedApp.prototype.toString = 
function() {
	return "ZmMixedApp";
};

// Construction

ZmMixedApp.prototype._defineAPI =
function() {
	AjxDispatcher.registerMethod("GetMixedController", "Mixed", new AjxCallback(this, this.getMixedController));
};

ZmMixedApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.MIXED,
						{app:			ZmApp.MIXED});
};

ZmMixedApp.prototype._registerApp =
function() {
	ZmApp.registerApp(ZmApp.MIXED,
							 {mainPkg:			"Mixed",
							  nameKey:			"zimbraTitle",
							  icon:				"Globe",
							  overviewTrees:	[ZmOrganizer.FOLDER, ZmOrganizer.ADDRBOOK, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:		true,
							  searchTypes:		[ZmItem.MSG, ZmItem.CONV]
							  });
};

ZmMixedApp.prototype.launch =
function() {
};

// Don't show folders when viewing mixed app coming from contacts app,
// and don't show addrbooks when viewing mixed app coming from mail app
ZmMixedApp.prototype._getOverviewTrees =
function() {
	var list = ZmApp.OVERVIEW_TREES[this._name];
	var trees = [];
	var prevApp = this._appCtxt.getAppController().getPreviousApp();
	for (var i = 0; i < list.length; i++) {
		var id = list[i];
		if (!((prevApp == ZmApp.CONTACTS && id == ZmOrganizer.FOLDER) ||
			  (prevApp == ZmApp.MAIL && id == ZmOrganizer.ADDRBOOK))) {

			trees.push[id];
		}
	}
	return trees;
};

ZmMixedApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require(["Mail", "Mixed"], false, loadCallback, null, true);
};

ZmMixedApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	this.getMixedController().show(results);
	if (callback) {
		callback.run();
	}
};

ZmMixedApp.prototype.getMixedController =
function() {
	if (!this._mixedController)
		this._mixedController = new ZmMixedController(this._appCtxt, this._container, this);
	return this._mixedController;
};
