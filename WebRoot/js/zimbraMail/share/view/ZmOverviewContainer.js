/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
 */

/**
 * Creates an overview container.
 * @constructor
 * @class
 * Creates a header tree item for an account if mailbox has multiple accounts
 * configured. For each account header, a {@link ZmOverview} is added a child. If mailbox
 * only has one account configured, no account header is created and the
 * {@link ZmOverview} is added as a child of the container.
 *
 * @param	{Hash}	params		a hash of parameters
 * @author Parag Shah
 */
ZmOverviewContainer = function(params) {
	if (arguments.length == 0) { return; }

	params.className = params.className || "ZmOverviewContainer";
	params.id = params.id || ZmId.getOverviewContainerId(params.containerId);
	DwtTree.call(this, params);

	this.setScrollStyle(params.scroll || Dwt.SCROLL_Y);

	this.containerId = params.containerId;
	this._appName = params.appName;
	this._controller = params.controller;
	this._headerItems = {};
	this._overview = {};

	// add listeners
	this.addSelectionListener(new AjxListener(this, this._treeViewListener));
	this.addTreeListener(new AjxListener(this, this._treeListener));
};

ZmOverviewContainer.prototype = new DwtTree;
ZmOverviewContainer.prototype.constructor = ZmOverviewContainer;

ZmOverviewContainer.prototype.toString =
function() {
	return "ZmOverviewContainer";
};

/**
 * Initializes the overview container.
 * 
 * @param	{Hash}	params		a hash of parameters
 */
ZmOverviewContainer.prototype.initialize =
function(params) {
	// overload
};

/**
 * Gets the overview.
 * 
 * @param	{String}	overviewId		the overview id
 * @return	{ZmOverview}		the overview
 */
ZmOverviewContainer.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
};

/**
 * Gets the overviews.
 * 
 * @return	{Array}	an array of {ZmOverview} objects
 */
ZmOverviewContainer.prototype.getOverviews =
function() {
	return this._overview;
};

/**
 * Gets the header item.
 * 
 * 
 */
ZmOverviewContainer.prototype.getHeaderItem =
function() {
	// overload
};

/**
 * Gets the selected overview.
 * 
 * @return	{ZmOverview}	the overview
 */
ZmOverviewContainer.prototype.getSelected =
function() {
	var selected;
	for (var i in this._overview) {
		selected = this._overview[i].getSelected();
		if (selected) {
			return selected;
		}
	}
};

/**
 * Deselects all tree views for each overview in this container
 *
 * @param exception		[ZmOverview]*	If set, this overview is skipped during deselection
 */
ZmOverviewContainer.prototype.deselectAll =
function(exception) {
	DwtTree.prototype.deselectAll.call(this);
	this._deselectAllTreeViews(exception);
};

/**
 * Sets the overview trees.
 * 
 * @param	{Array}		treeIds		an array of tree ids
 */
ZmOverviewContainer.prototype.setOverviewTrees =
function(treeIds) {
	for (var i in this._overview) {
		this._overview[i].set(treeIds);
	}
};

/**
 * Resets the operations.
 * 
 * 
 */
ZmOverviewContainer.prototype.resetOperations =
function(parent, acctId) {
	// overload me
};

ZmOverviewContainer.prototype._treeViewListener =
function(ev) {
	// overload
};

ZmOverviewContainer.prototype._treeListener =
function(ev) {
	// overload
};

ZmOverviewContainer.prototype._initializeActionMenu =
function(account) {
	// overload
};

ZmOverviewContainer.prototype._getActionMenu =
function(ev) {
	if (this._actionMenu instanceof AjxCallback) {
		var callback = this._actionMenu;
		this._actionMenu = callback.run();
	}
	return this._actionMenu;
};

ZmOverviewContainer.prototype._createActionMenu =
function(parent, menuItems, account) {
	// overload
};

ZmOverviewContainer.prototype._actionMenuListener =
function(ev) {
	// overload
};

/**
 * Deselects any selection for each overview this container is managing.
 *
 * @param exception		[ZmOverview]*	If set, deselects all overviews except this one.
 */
ZmOverviewContainer.prototype._deselectAllTreeViews =
function(exception) {
	// make sure none of the other items in the other overviews are selected
	for (var i in this._overview) {
		var overview = this._overview[i];
		if (exception && exception == overview ) { continue; }

		var trees = overview._treeHash;
		for (var j in trees) {
			if (trees[j].getSelectionCount() > 0) {
				trees[j].deselectAll();
				break;
			}
		}
	}
};
