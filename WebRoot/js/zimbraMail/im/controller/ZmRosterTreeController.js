/*
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
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

ZmRosterTreeController = function() {
	ZmController.call(this, ZmOrganizer.ROSTER_TREE_ITEM);
	this._opc = appCtxt.getOverviewController();
	this._treeView = {};	// hash of tree views of this type, by overview ID
};

ZmRosterTreeController.prototype = new ZmController;
ZmRosterTreeController.prototype.constructor = ZmRosterTreeController;

ZmRosterTreeController.prototype.toString = function() {
	return "ZmRosterTreeController";
};

// Public methods
ZmRosterTreeController.prototype.show =
function(params) {
	var id = params.overviewId;
	if (!this._treeView[id] || params.forceCreate) {
		this._treeView[id] = this._createTreeView(id);
	}
	return this._treeView[id];
};

/** Returns the tree control. Implemented for consistency with ZmTreeController */
ZmRosterTreeController.prototype.getTreeView =
function(overviewId) {
	return this._treeView[overviewId];
};

/** Clears the tree control. Implemented for consistency with ZmTreeController */
ZmRosterTreeController.prototype.clearTreeView =
function(overviewId) {
	if (this._treeView[overviewId]) {
		this._treeView[overviewId].dispose();
		delete this._treeView[overviewId];
	}
};

// Protected methods
ZmRosterTreeController.prototype._createTreeView =
function(overviewId) {
	var overview = this._opc.getOverview(overviewId);
	var treeArgs = {
		posStyle: Dwt.STATIC_STYLE,
		noAssistant: true,
		isOverview: true,
		expanded: overviewId == ZmApp.IM
	};
	var imOverview = new ZmImOverview(overview, treeArgs);
	return imOverview.getTree();
};

