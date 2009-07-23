/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
 * 
 * @param container	[DwtControl]	top-level container
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

ZmOverviewController.prototype.toString = 
function() {
	return "ZmOverviewController";
};

/**
 * Creates a new overview container with the given options. Used when mailbox
 * has multiple accounts.
 *
 * @param containerParams	hash of params (see ZmOverviewContainer)
 * @param overviewParams	hash of params (see ZmOverview)
 */
ZmOverviewController.prototype.createOverviewContainer =
function(containerParams, overviewParams) {
	containerParams.parent = containerParams.parent || this._shell;
	containerParams.controller = this;
	containerParams.id = ZmId.getOverviewContainerId(containerParams.containerId);

	// the overview container will create overviews for each account
	var container = this._overviewContainer[containerParams.containerId] = new ZmOverviewContainer(containerParams);

	// we call initialize *after* creating new object since it references
	// this._overviewContainer hash
	container.initialize(overviewParams);

	return container;
};

/**
 * Creates a new overview with the given options.
 *
 * @param params			[Object]	hash of params (see ZmOverview)
 */
ZmOverviewController.prototype.createOverview =
function(params) {
	params.parent = params.parent || this._shell;

	var ov = this._overview[params.overviewId] = new ZmOverview(params, this);
	return ov;
};

/**
 * Returns the overview container for the given appName.
 *
 * @param containerId		[String]*	container ID (defaults to current app name)
 */
ZmOverviewController.prototype.getOverviewContainer =
function(containerId) {
	var containerId = containerId || appCtxt.getCurrentAppName();
	return this._overviewContainer[containerId];
};

/**
 * Returns the overview with the given ID.
 *
 * @param overviewId		[constant]	overview ID
 */
ZmOverviewController.prototype.getOverview =
function(overviewId) {
	return this._overview[overviewId];
};

/**
 * Returns the given tree controller.
 *
 * @param treeId		[constant]		organizer type
 * @param noCreate		[boolean]*		if true, only return an already created controller
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
 * Returns the tree data (ZmTree) for the given organizer type.
 *
 * @param treeId		[constant]		organizer type
 */
ZmOverviewController.prototype.getTreeData =
function(treeId) {
	return treeId ? appCtxt.getTree(treeId) : null;
};

/**
 * Returns the given tree view in the given overview.
 *
 * @param overviewId		[constant]	overview ID
 * @param treeId			[constant]	organizer type
 */
ZmOverviewController.prototype.getTreeView =
function(overviewId, treeId) {
	if (!overviewId || !treeId) { return null; }
	return this.getOverview(overviewId).getTreeView(treeId);
};
