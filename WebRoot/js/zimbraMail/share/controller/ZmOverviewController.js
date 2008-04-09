/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
	
	this._overview		= {};
	this._accordion		= {};
	this._controller	= {};
	this._treeIds		= {};
	this._treeIdHash	= {};
	this._appOverviewId	= {};
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
 * Creates a new accordion.
 *
 * @param accordionId	[constant]		overview ID
 * @param parent		[DwtControl]*	containing widget
 */
ZmOverviewController.prototype.createAccordion =
function(params) {
	var accordion = this._accordion[params.accordionId] = new DwtAccordion(this._shell);
	accordion.id = params.accordionId;
	accordion.setScrollStyle(Dwt.CLIP);
	
	return accordion;
};

/**
 * Returns the accordion with the given ID.
 *
 * @param accordionId		[constant]	accordion ID
 */
ZmOverviewController.prototype.getAccordion =
function(accordionId) {
	return this._accordion[accordionId];
};

/**
 * Creates a new overview with the given options.
 *
 * @param params	hash of params (see ZmOverview)
 */
ZmOverviewController.prototype.createOverview =
function(params) {
	params.parent = params.parent || this._shell;
	var idKey = ["OVERVIEW", params.overviewId].join("_").toUpperCase();
	params.id = ZmId[idKey];
	var overview = this._overview[params.overviewId] = new ZmOverview(params, this);

	return overview;
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
 * @param noCreate		[boolean]*		if true, only returned an already created controller
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

/**
 * For offline/zdesktop, this method updates the status icon for each account
 * as returned by each server response in the context part of the SOAP header
 *
 * @param accountList	[Array]		JSON list of accounts that need to be updated
 */
ZmOverviewController.prototype.updateAccountIcon =
function(account, icon) {
	// if multi-account, update accordion item's status icon for each account
	if (appCtxt.multiAccounts) {
		for (var i in this._accordion) {
			var accordionItem = this._accordion[i].getItem(account.itemId);
			if (accordionItem) {
				accordionItem.setIcon(icon);
			}
		}
	} else {
		var el = document.getElementById(ZmId.SKIN_OFFLINE_STATUS);
		if (el) {
			el.className = icon;
		}
	}
};

ZmOverviewController.prototype.isAppOverviewId =
function(overviewId) {
	if (this._appOverviewId[overviewId] != null) {
		return this._appOverviewId[overviewId]
	}
	this._appOverviewId[overviewId] = false;
	for (var i = 0; i < ZmApp.APPS.length; i++) {
		var app = appCtxt.getApp(ZmApp.APPS[i]);
		if (app && (app.getOverviewPanelContentId() == overviewId)) {
			this._appOverviewId[overviewId] = true;
			return true;
		}
	}
	return false;
};
