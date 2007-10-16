/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an overview.
 * @constructor
 * @class
 * An overview is a DwtComposite that holds tree views.
 * 
 * @author Conrad Damon
 *
 * @param params 				[hash]					hash of params:
 *        overviewId			[constant]				overview ID
 *        parent				[DwtControl]*			containing widget
 *        overviewClass			[string]*				class name for overview DIV
 *        posStyle				[constant]*				positioning style for overview DIV
 *        scroll				[constant]*				scrolling style for overview DIV
 *        selectionSupported	[boolean]*				true if left-click selection is supported
 *        actionSupported		[boolean]*				true if right-click action menus are supported
 *        dndSupported			[boolean]*				true if drag-and-drop is supported
 *        headerClass			[string]*				class name for header item
 *        showUnread			[boolean]*				if true, unread counts will be shown
 *        treeStyle				[constant]*				default display style for tree views
 *        hideEmpty				[hash]*					IDs of trees to hide if they lack data
 *        noTooltips			[boolean]*				if true, don't show tooltips for tree items
 * @param controller			[ZmOverviewController]	the overview controller
 */
ZmOverview = function(params, controller) {
	
	var overviewClass = params.overviewClass ? params.overviewClass : "ZmOverview";
	DwtComposite.call(this, params.parent, overviewClass, params.posStyle);
	
	this.id = params.overviewId;
	this._controller = controller;

	this.setScrollStyle(params.scroll || Dwt.SCROLL);

	this.selectionSupported	= params.selectionSupported;
	this.actionSupported	= params.actionSupported;
	this.dndSupported		= params.dndSupported;
	this.headerClass		= params.headerClass;
	this.showUnread			= params.showUnread;
	this.treeStyle			= params.treeStyle;
	this.hideEmpty			= params.hideEmpty;
	this.noTooltips			= params.noTooltips;
	
	this._treeIds	= [];
	this._treeHash	= {};
}

ZmOverview.prototype = new DwtComposite;
ZmOverview.prototype.constructor = ZmOverview;

ZmOverview.prototype.toString =
function() {
	return "ZmOverview";
};

/**
 * Displays the given list of tree views in this overview.
 *
 * @param treeIds	[array]		list of organizer types
 * @param omit		[hash]*		hash of organizer IDs to ignore
 */
ZmOverview.prototype.set =
function(treeIds, omit) {
	if (!(treeIds && treeIds.length)) { return; }
	this._treeIds = treeIds;	
	for (var i = 0; i < treeIds.length; i++) {
		this.setTreeView(treeIds[i], omit);
	}
};

/**
 * Sets the given tree view. Its tree controller is responsible for using the appropriate
 * data tree to populate the tree view. The tree controller will be lazily created if
 * necessary. The tree view is cleared before it is set. The tree view inherits options
 * from this overview.
 * 
 * @param treeId	[constant]		organizer ID
 * @param omit		[hash]*			hash of organizer IDs to ignore
 */
ZmOverview.prototype.setTreeView =
function(treeId, omit) {
	// check for false since setting precondition is optional (can be null)
	if (appCtxt.get(ZmOrganizer.PRECONDITION[treeId]) === false) { return; }

	var treeController = this._controller.getTreeController(treeId);
	if (this._treeHash[treeId]) {
		treeController.clearTreeView(this.id);
	}
	var params = {
		overviewId: this.id,
		omit: omit,
		hideEmpty: this.hideEmpty,
		showUnread: this.showUnread
	};
	this._treeHash[treeId] = treeController.show(params);	// render tree view
};

ZmOverview.prototype.getTreeView =
function(treeId) {
	return this._treeHash[treeId];
};

ZmOverview.prototype.getTreeViews =
function(treeId) {
	return this._treeIds;
};

/**
 * Searches the tree views for the tree item
 * whose data object has the given ID and type.
 * 
 * @param id			[int]			ID to look for
 * @param type			[constant]*		item must also have this type
 */
ZmOverview.prototype.getTreeItemById =
function(id, type) {
	if (!id) { return null; }
	for (var i = 0; i < this._treeIds.length; i++) {
		var treeView = this._treeHash[this._treeIds[i]];
		if (treeView) {
			var item = treeView.getTreeItemById(id);
			if (item && (!type || (this._treeIds[i] == type))) {
				return item;
			}
		}
	}
	return null;
};

/**
* Returns the first selected item within this overview.
*/
ZmOverview.prototype.getSelected =
function() {
	for (var i = 0; i < this._treeIds.length; i++) {
		var treeView = this._treeHash[this._treeIds[i]];
		if (treeView) {
			var item = treeView.getSelected();
			if (item) {
				return item;
			}
		}
	}
	return null;
};

/**
 * Given a tree view, deselects all items in the overview's
 * other tree views, enforcing single selection within the overview.
 * Passing a null argument will clear selection in all tree views.
 *
 * @param treeId			[constant]	organizer type
 */
ZmOverview.prototype.itemSelected =
function(treeId) {
	for (var i = 0; i < this._treeIds.length; i++) {
		if (this._treeIds[i] != treeId) {
			var treeView = this._treeHash[this._treeIds[i]];
			if (treeView) {
				treeView.deselectAll();
			}
		}
	}
};

/**
 * Clears the tree views.
 */
ZmOverview.prototype.clear =
function() {
	for (var i = 0; i < this._treeIds.length; i++) {
		var treeId = this._treeIds[i];
		if (this._treeHash[treeId]) {
			var treeController = this._controller.getTreeController(treeId);
			treeController.clearTreeView(this.id);
		}
	}
};
