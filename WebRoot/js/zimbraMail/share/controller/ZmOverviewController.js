/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines the overview controller.
 *
 */

/**
 * Creates an overview as a set of tree views. When the overview is created, various
 * characteristics of its tree views can be provided. Each type of tree view
 * has a corresponding tree controller (also a singleton), which is lazily
 * created.
 * @class
 * This singleton class manages overviews, each of which has a unique ID.
 *
 * @author Conrad Damon
 * 
 * @param {DwtControl}	container	the top-level container
 * 
 * @extends		ZmController
 */
ZmOverviewController = function(container) {
	ZmController.call(this, container);

	this._overviewContainer = {};
	this._overview			= {};
	this._controller		= {};
	this._appOverviewId		= {};
};

// Controller for given org type
ZmOverviewController.CONTROLLER = {};

ZmOverviewController.DEFAULT_FOLDER_ID = ZmFolder.ID_INBOX;

ZmOverviewController.prototype = new ZmController;
ZmOverviewController.prototype.constructor = ZmOverviewController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmOverviewController.prototype.toString = 
function() {
	return "ZmOverviewController";
};

/**
 * Creates a new overview container with the given options. Used when mailbox
 * has multiple accounts.
 *
 * @param {Hash}	containerParams	a hash of params (see {@link ZmOverviewContainer})
 * @param {Hash}	overviewParams	a hash of params (see {@link ZmOverview})
 */
ZmOverviewController.prototype.createOverviewContainer =
function(containerParams, overviewParams) {
	containerParams.parent = containerParams.parent || this._shell;
	containerParams.controller = this;
	containerParams.id = ZmId.getOverviewContainerId(containerParams.containerId);

	// the overview container will create overviews for each account
	var container = this._overviewContainer[containerParams.containerId] =
		new ZmAccountOverviewContainer(containerParams);

	// we call initialize *after* creating new object since it references
	// this._overviewContainer hash
	overviewParams.containerId = containerParams.id;
	container.initialize(overviewParams);

	return container;
};

/**
 * Creates a new overview with the given options.
 *
 * @param {Hash}	params			a hash of params (see {@link ZmOverview})
 */
ZmOverviewController.prototype.createOverview =
function(params) {
	params.parent = params.parent || this._shell;

	var ov = this._overview[params.overviewId] = new ZmOverview(params, this);
	return ov;
};

/**
 * Gets the overview container for the given app.
 *
 * @param {String}	containerId		the container ID (defaults to current app name)
 * @return	{ZmOverviewContainer}	the container
 */
ZmOverviewController.prototype.getOverviewContainer =
function(containerId) {
	var containerId = containerId || appCtxt.getCurrentAppName();
	return this._overviewContainer[containerId];
};

/**
 * Gets the overview with the given id.
 *
 * @param {String}	overviewId		the overview id
 * @return	{ZmOverview}	the overview
 */
ZmOverviewController.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
};

/**
 * Gets the tree controller.
 *
 * @param {String}	treeId		the tree id
 * @param {Boolean}	noCreate		if <code>true</code>, only return an already created controller
 * 
 * @return	{ZmTreeController}	the tree controller
 */
ZmOverviewController.prototype.getTreeController =
function(treeId, noCreate) {
	if (!treeId) { return null; }
	if (!this._controller[treeId] && !noCreate) {
		var className = ZmOverviewController.CONTROLLER[treeId];
		if (className && window[className]) { // make sure the class has been loaded
			var treeControllerCtor = eval(ZmOverviewController.CONTROLLER[treeId]);
			if (treeControllerCtor) {
				this._controller[treeId] = new treeControllerCtor(treeId);
			}
		}
	}
	return this._controller[treeId];
};

/**
 * Gets the tree data for the given organizer type.
 *
 * @param {String}	treeId		the tree id
 * @return {ZmTree}		the tree
 */
ZmOverviewController.prototype.getTreeData =
function(treeId) {
	return treeId ? appCtxt.getTree(treeId) : null;
};

/**
 * Gets the tree view in the given overview.
 *
 * @param {String}	overviewId		the overview id
 * @param {String}	treeId			the organizer type
 * @return	{ZmTreeView}	the tree view or <code>null</code> if not found
 */
ZmOverviewController.prototype.getTreeView =
function(overviewId, treeId) {
	if (!overviewId || !treeId) { return null; }
	if (!this.getOverview(overviewId)) { return null; }
	return this.getOverview(overviewId).getTreeView(treeId);
};
