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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
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
 * @param appCtxt				[ZmAppCtxt]				the app context
 */
ZmOverview = function(params, controller, appCtxt) {
	
	var overviewClass = params.overviewClass ? params.overviewClass : "ZmOverview";
	DwtComposite.call(this, params.parent, overviewClass, params.posStyle);
	
	this.id = params.overviewId;
	this._controller = controller;
	this._appCtxt = appCtxt;

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
* Displays the given list of tree views, applying the given options. If a tree
* view has already been created, its HTML element will be added to the overview, so that
* its state is preserved.
*
* @param treeIds	[array]		list of organizer types
* @param omit		[hash]*		hash of organizer IDs to ignore
*/
ZmOverview.prototype.set =
function(treeIds, omit) {
	if (!(treeIds && treeIds.length)) { return; }
	this._treeIds = treeIds;	

	this.clear();

	for (var i = 0; i < treeIds.length; i++) {
		var treeId = treeIds[i];
		var setting = ZmOrganizer.PRECONDITION[treeId];
		if (setting && !this._appCtxt.get(setting)) { continue;	}
		// lazily create appropriate tree controller
		var treeController = this._controller.getTreeController(treeId);
		// render tree view, creating it if needed
		var params = {overviewId:this.id, omit:omit, hideEmpty:this.hideEmpty,
					  showUnread:this.showUnread, noTooltips:this.noTooltips};
		this._treeHash[treeId] = treeController.show(params);
	}
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
