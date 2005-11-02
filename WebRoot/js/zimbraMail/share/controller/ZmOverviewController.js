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

/**
* Creates an overview controller.
* @constructor
* @class
* This singleton class manages overviews, each of which has a unique ID.
* An overview is a set of tree views. When the overview is created, various
* characteristics of its tree views can be provided. Each type of tree view
* has a corresponding tree controller (also a singleton), which is lazily
* created.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
* @param container	[DwtControl]	top-level container
*/
function ZmOverviewController(appCtxt, container) {

	ZmController.call(this, appCtxt, container);
	
	// hashes that are keyed by overview ID
	this._overview = new Object();
	this._controllers = new Object();
	this._treeIds = new Object();
	this._selectionSupported = new Object();
	this._actionSupported = new Object();
	this._dndSupported = new Object();
	this._headerClass = new Object();
	this._showUnread = new Object();
	this._treeStyle = new Object();
}

ZmOverviewController.CONTROLLER = new Object();
ZmOverviewController.CONTROLLER[ZmOrganizer.FOLDER]	= ZmFolderTreeController;
ZmOverviewController.CONTROLLER[ZmOrganizer.SEARCH]	= ZmSearchTreeController;
ZmOverviewController.CONTROLLER[ZmOrganizer.TAG]		= ZmTagTreeController;
ZmOverviewController.CONTROLLER[ZmOrganizer.CALENDAR]	= ZmCalendarTreeController;
ZmOverviewController.CONTROLLER[ZmOrganizer.ZIMLET]	= ZmZimletTreeController;

ZmOverviewController.DEFAULT_FOLDER_ID = ZmFolder.ID_INBOX;

ZmOverviewController.prototype = new ZmController;
ZmOverviewController.prototype.constructor = ZmOverviewController;

ZmOverviewController.prototype.toString = 
function() {
	return "ZmOverviewController";
}

/**
* Creates a new overview with the given options.
*
* @param overviewId				[constant]		overview ID
* @param parent					[DwtControl]*	containing widget
* @param overviewClass			[string]*		class name for overview DIV
* @param posStyle				[constant]*		positioning style for overview DIV
* @param scroll					[constant]*		scrolling style for overview DIV
* @param selectionSupported		[boolean]*		true if left-click selection is supported
* @param actionSupported		[boolean]*		true if right-click action menus are supported
* @param dndSupported			[boolean]*		true if drag-and-drop is supported
* @param headerClass			[string]*		class name for header item
* @param showUnread				[boolean]*		if true, unread counts will be shown
* @param treeStyle				[constant]*		display style for tree views
*/
ZmOverviewController.prototype.createOverview =
function(params) {
	var overviewId = params.overviewId;
	var parent = params.parent ? params.parent : this._shell;
	var overviewClass = params.overviewClass ? params.overviewClass : "overview";
	var overview = this._overview[overviewId] = new DwtComposite(parent, overviewClass, params.posStyle);
	this._overview[overviewId].setScrollStyle(params.scroll ? params.scroll : Dwt.SCROLL);
	this._selectionSupported[overviewId] = params.selectionSupported;
	this._actionSupported[overviewId] = params.actionSupported;
	this._dndSupported[overviewId] = params.dndSupported;
	this._headerClass[overviewId] = params.headerClass;
	this._showUnread[overviewId] = params.showUnread;
	this._treeStyle[overviewId] = params.treeStyle;
	
	return overview;
}

/**
* Clears the given overview's tree views.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.clearOverview =
function(overviewId) {
	var treeIds = this._treeIds[overviewId];
	if (treeIds) {
		for (var i = 0; i < treeIds.length; i++)
			this._controllers[treeIds[i]].clearTreeView(overviewId);
	}
}

/**
* Displays the given list of tree views, applying the given overview's options.
*
* @param overviewId		[constant]	overview ID
* @param treeIds		[Array]		list of organizer types
* @param omit			[Object]*	hash of organizer IDs to ignore
*/
ZmOverviewController.prototype.set =
function(overviewId, treeIds, omit) {
	if (!overviewId) return;

	// hide the current tree views for the specified overview
	for (var treeId in this._controllers) {
		var treeView = this.getTreeView(overviewId, treeId);
		if (treeView) treeView.setVisible(false);
	}

	if (!treeIds || !treeIds.length) return;
	
	// show tree views for the specified overview	
	this._treeIds[overviewId] = treeIds;
	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		// lazily create appropriate tree controller
		if (!this._controllers[treeId])
			this._controllers[treeId] = new ZmOverviewController.CONTROLLER[treeId](this._appCtxt);
		this._controllers[treeId].show(overviewId, this._showUnread[overviewId], omit);
	}
	
	// re-order visible panels
	var overviewEl = this.getOverview(overviewId).getHtmlElement();
	for (var i = treeIds.length - 1; i >= 0; i--) {
		var treeId = treeIds[i];
		var treeView = this.getTreeView(overviewId, treeId);
		var treeEl = treeView.getHtmlElement();
		overviewEl.removeChild(treeEl);
		overviewEl.insertBefore(treeEl, overviewEl.firstChild);
	}
}

/**
* Returns the given tree controller.
*
* @param treeId		[constant]		organizer type
*/
ZmOverviewController.prototype.getTreeController =
function(treeId) {
	return this._controllers[treeId];
}

/**
* Returns the given tree controller.
*
* @param treeId		[constant]		organizer type
*/
ZmOverviewController.prototype.getTreeData =
function(treeId) {
	return this._appCtxt.getTree(treeId);
}

/**
* Returns the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
}

/**
* Returns true if left-click selection is supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.selectionSupported =
function(overviewId) {
	return this._selectionSupported[overviewId];
}

/**
* Returns true if right-click action menus are supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.actionSupported =
function(overviewId) {
	return this._actionSupported[overviewId];
}

/**
* Returns true if drag-and-drop is supported for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.dndSupported =
function(overviewId) {
	return this._dndSupported[overviewId];
}

/**
* Returns the custom CSS class for this overview's header items.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getHeaderClass =
function(overviewId) {
	return this._headerClass[overviewId];
}

/**
* Returns the style of tree views in the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getTreeStyle =
function(overviewId) {
	return this._treeStyle[overviewId];
}

/**
* Returns the given tree view in the given overview.
*
* @param overviewId		[constant]	overview ID
* @param treeId			[constant]	organizer type
*/
ZmOverviewController.prototype.getTreeView =
function(overviewId, treeId) {
	return this.getTreeController(treeId).getTreeView(overviewId);
}

/**
* Returns the first selected item within this overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype.getSelected =
function(overviewId) {
	var treeIds = this._treeIds[overviewId];
	for (var i = 0; i < treeIds.length; i++) {
		var item = this.getTreeView(overviewId, treeIds[i]).getSelected();
		if (item)
			return item;
	}
	return null;
}

/**
* Given a tree view within an overview, deselects all items in the overview's
* other tree views, enforcing single selection within an overview.
*
* @param overviewId		[constant]	overview ID
* @param treeId			[constant]	organizer type
*/
ZmOverviewController.prototype.itemSelected =
function(overviewId, treeId) {
	var treeIds = this._treeIds[overviewId];
	for (var i = 0; i < treeIds.length; i++) {
		if (treeIds[i] != treeId)
			this.getTreeView(overviewId, treeIds[i]).deselectAll();
	}
}

/*
* Adds a small amount of vertical space. Intended for use between tree views.
*
* @param overviewId		[constant]	overview ID
*/
ZmOverviewController.prototype._addSpacer =
function(overviewId) {
	var div = document.createElement("div");
	div.className = "vSpace";
	this._overview[overviewId].getHtmlElement().appendChild(div);
}
