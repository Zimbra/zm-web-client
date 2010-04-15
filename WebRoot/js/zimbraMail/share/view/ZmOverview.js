/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * 
 * This file defines an overview, which holds tree views.
 *
 */

/**
 * @class
 * Creates an overview. An overview is a {@link DwtComposite} that holds tree views.
 * 
 * @author Conrad Damon
 *
 * @param {Hash}	params 				a hash of parameters
 * @param	{String}	params.id 	the id for the HTML element
 * @param	{String}	params.overviewId 	the overview id
 * @param	{String}	params.containerId 	the overview container id (multi-account)
 * @param	{Array}	params.treeIds an array of organizer types that may be displayed in this overview
 * @param	{ZmZimbraAccount}	params.account		the account this overview belongs to
 * @param	{DwtControl}	params.parent			the containing widget
 * @param	{String}	params.overviewClass		the class name for overview DIV
 * @param	{constant}	params.posStyle				the positioning style for overview DIV
 * @param	{constant}	params.scroll				the scrolling style for overview DIV
 * @param	{Boolean}	params.selectionSupported <code>true</code> left-click selection is supported
 * @param	{Boolean}	params.actionSupported		<code>true</code> if right-click action menus are supported
 * @param	{Boolean}	params.dndSupported			<code>true</code> if drag-and-drop is supported
 * @param	{String}	params.headerClass			the class name for header item
 * @param	{Boolean}	params.showUnread			if <code>true</code>, unread counts will be shown
 * @param	{Boolean}	params.showNewButtons		if <code>true</code>, tree headers may have buttons for creating new organizers
 * @param	{constant}	params.treeStyle			the default display style for tree views
 * @param	{Boolean}	params.isCheckedByDefault	the default state for "checked" display style
 * @param	{Boolean}	params.noTooltips			if <code>true</code>, do not show toolt ips for tree items
 * @param {ZmOverviewController}	controller			the overview controller
 * 
 * @extends	DwtComposite
 */
ZmOverview = function(params, controller) {

	var overviewClass = params.overviewClass ? params.overviewClass : "ZmOverview";
	params.id = params.id || ZmId.getOverviewId(params.overviewId);
	DwtComposite.call(this, {parent:params.parent, className:overviewClass, posStyle:params.posStyle, id:params.id});

	this._controller = controller;

	this.setScrollStyle(params.scroll || Dwt.SCROLL);

	this.overviewId			= params.overviewId;
	this.containerId		= params.containerId;
	this.account			= params.account;
	this.selectionSupported	= params.selectionSupported;
	this.actionSupported	= params.actionSupported;
	this.dndSupported		= params.dndSupported;
	this.headerClass		= params.headerClass;
	this.showUnread			= params.showUnread;
	this.showNewButtons		= params.showNewButtons;
	this.treeStyle			= params.treeStyle;
	this.isCheckedByDefault = params.isCheckedByDefault;
	this.noTooltips			= params.noTooltips;
	this.isAppOverview		= params.isAppOverview;

	this._treeIds			= [];
	this._treeHash			= {};
	this._treeParents		= {};

	// Create a parent div for each overview tree.
	var doc = document;
	var element = this.getHtmlElement();
	if (params.treeIds) {
		for (var i = 0, count = params.treeIds.length; i < count; i++) {
			var div = doc.createElement("DIV");
			var treeId = params.treeIds[i];
			this._treeParents[treeId] = div.id = [this.overviewId, treeId].join("-parent-");
			element.appendChild(div);
		}
	}

	if (this.dndSupported) {
		this._scrollableContainerId = this.containerId || this.overviewId;
		var container = this.containerId ? document.getElementById(this.containerId) : this.getHtmlElement();
		var params = {container:container, threshold:15, amount:5, interval:10, id:this._scrollableContainerId};
		this._dndScrollCallback = new AjxCallback(null, DwtControl._dndScrollCallback, [params]);
	}
};

ZmOverview.prototype = new DwtComposite;
ZmOverview.prototype.constructor = ZmOverview;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmOverview.prototype.toString =
function() {
	return "ZmOverview";
};

/**
 * Gets the parent element for the given tree id.
 * 
 * @param	{String}	treeId		the tree id
 * @return	{Object}	the tree parent element
 */
ZmOverview.prototype.getTreeParent =
function(treeId) {
	return this._treeParents[treeId];
};

/**
 * Displays the given list of tree views in this overview.
 *
 * @param {Array}	treeIds		an array of organizer ids
 * @param {Hash}	omit		the hash of organizer ids to ignore
 */
ZmOverview.prototype.set =
function(treeIds, omit) {
	if (treeIds && treeIds.length) {
		for (var i = 0; i < treeIds.length; i++) {
			this.setTreeView(treeIds[i], omit);
		}
	}
};

/**
 * Sets the given tree view. Its tree controller is responsible for using the appropriate
 * data tree to populate the tree view. The tree controller will be lazily created if
 * necessary. The tree view is cleared before it is set. The tree view inherits options
 * from this overview.
 * 
 * @param {String}	treeId	the organizer ID
 * @param {Hash}	omit	a hash of organizer ids to ignore
 */
ZmOverview.prototype.setTreeView =
function(treeId, omit) {
	// check for false since setting precondition is optional (can be null)
	if (appCtxt.get(ZmOrganizer.PRECONDITION[treeId]) === false) { return; }

	AjxDispatcher.require(ZmOrganizer.ORG_PACKAGE[treeId]);
	var treeController = this._controller.getTreeController(treeId);
	if (!treeController) { return; }
	if (this._treeHash[treeId]) {
		treeController.clearTreeView(this.overviewId);
	} else {
		this._treeIds.push(treeId);
	}
	var params = {
		overviewId:		this.overviewId,
		omit:			omit,
		showUnread:		this.showUnread,
		account:		this.account
	};
	this._treeHash[treeId] = treeController.show(params); // render tree view
};

/**
 * Gets the tree view.
 * 
 * @param	{String}	treeId		the tree id
 * @return	{Object}	the tree view
 */
ZmOverview.prototype.getTreeView =
function(treeId) {
	return this._treeHash[treeId];
};

/**
 * Gets the tree views.
 * 
 * @return	{Array}	an array of tree ids
 */
ZmOverview.prototype.getTreeViews =
function() {
	return this._treeIds;
};

/**
 * Searches the tree views for the tree item whose data object has the given ID and type.
 * 
 * @param {int}	id			the id to look for
 * @param {constant}	type			the item must also have this type
 * @return	{Object}	the item or <code>null</code> if not found
 */
ZmOverview.prototype.getTreeItemById =
function(id, type) {
	if (!id) { return null; }
	for (var i = 0; i < this._treeIds.length; i++) {
		var treeView = this._treeHash[this._treeIds[i]];
		if (treeView) {
			var item = treeView.getTreeItemById && treeView.getTreeItemById(id);
			if (item && (!type || (this._treeIds[i] == type))) {
				return item;
			}
		}
	}
	return null;
};

/**
* Returns the first selected item within this overview.
* 
* @param	{Boolean}	typeOnly	if <code>true</code>, return the type only
* @return	{Object}	the item (or type if <code>typeOnly</code>) or <code>null</code> if not found
*/
ZmOverview.prototype.getSelected =
function(typeOnly) {
	for (var i = 0; i < this._treeIds.length; i++) {
		var treeView = this._treeHash[this._treeIds[i]];
		if (treeView) {
			var item = treeView.getSelected();
			if (item) {
				return typeOnly ? treeView.type : item;
			} // otherwise continue with other treeviews to look for selected item
		}
	}
	return null;
};

/**
 * Selects the item with the given ID within the given tree in this overview.
 *
 * @param {String}	id	the item id
 * @param {constant}	type	the tree type
 */
ZmOverview.prototype.setSelected =
function(id, type) {
	var ti, treeView;
	if (type) {
		treeView = this._treeHash[type];
		ti = treeView && treeView.getTreeItemById(id);
	} else {
		for (var type in this._treeHash) {
			treeView = this._treeHash[type];
			ti = treeView && treeView.getTreeItemById(id);
			if (ti) { break; }
		}
	}

	if (ti && (this._selectedTreeItem != ti)) {
		treeView.setSelected(id, true, true);
	}
	this.itemSelected(ti);
};

/**
 * Given a tree item, de-selects all items in the overview's
 * other tree views, enforcing single selection within the overview.
 * Passing a null argument will clear selection in all tree views.
 *
 * @param {DwtTreeItem}	treeItem		the tree item
 */
ZmOverview.prototype.itemSelected =
function(treeItem) {
	if (appCtxt.multiAccounts && treeItem) {
		var name = this.overviewId.substring(0, this.overviewId.indexOf(":"));
		var container = this._controller.getOverviewContainer(name);
		if (container) {
			container.deselectAll(this);
		}
	}

	if (this._selectedTreeItem && (this._selectedTreeItem._tree != (treeItem && treeItem._tree))) {
		this._selectedTreeItem._tree.deselectAll();
	}

	this._selectedTreeItem = treeItem;
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
			treeController.clearTreeView(this.overviewId);
			delete this._treeHash[treeId];
		}
	}
};

/**
 * @private
 */
ZmOverview.prototype._initialize =
function() {
	// do nothing. 
	// - called by DwtTreeItem b/c it thinks its adding another tree item
};

/**
 * @private
 */
ZmOverview.prototype._focus =
function() {
	var item = this._selectedTreeItem;
	if (!item) {
		var tree = this._treeHash[this._treeIds[0]];
		if (tree) {
			item = tree._getNextTreeItem(true);
		}
	}

	if (item) {
		item.focus();
	}
};

/**
 * @private
 */
ZmOverview.prototype._blur =
function() {
	var item = this._selectedTreeItem;
	if (item) {
		item._blur();
	}
};

/**
 * Returns the next/previous selectable tree item within this overview, starting with the
 * tree immediately after/before the given one. Used to handle tree item selection that
 * spans trees.
 *
 * @param {Boolean}	next		if <code>true</code>, look for next item as opposed to previous item
 * @param {ZmTreeView}	tree		the tree that we are just leaving
 *
 * @private
 */
ZmOverview.prototype._getNextTreeItem =
function(next, tree) {

	for (var i = 0; i < this._treeIds.length; i++) {
		if (this._treeHash[this._treeIds[i]] == tree) {
			break;
		}
	}

	var nextItem = null;
	var idx = next ? i + 1 : i - 1;
	tree = this._treeHash[this._treeIds[idx]];
	while (tree) {
		nextItem = DwtTree.prototype._getNextTreeItem.call(tree, next);
		if (nextItem) {
			break;
		}
		idx = next ? idx + 1 : idx - 1;
		tree = this._treeHash[this._treeIds[idx]];
	}

	return nextItem;
};
