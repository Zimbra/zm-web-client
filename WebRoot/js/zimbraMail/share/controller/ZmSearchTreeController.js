/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
 * Creates a saved search tree controller.
 * @constructor
 * @class
 * This class controls a tree display of saved searches.
 *
 * @author Conrad Damon
 */
ZmSearchTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.SEARCH);

	this._listeners[ZmOperation.RENAME_SEARCH] = new AjxListener(this, this._renameListener);
	
	this._searchTypes = {};	// search types for each overview ID
};

ZmSearchTreeController.prototype = new ZmFolderTreeController;
ZmSearchTreeController.prototype.constructor = ZmSearchTreeController;

ZmSearchTreeController.APP_JOIN_CHAR = "-";

// Public methods

ZmSearchTreeController.prototype.toString = 
function() {
	return "ZmSearchTreeController";
};

/**
* Displays the tree of this type.
*
* @param overviewId		[constant]			overview ID
* @param showUnread		[boolean]*			if true, unread counts will be shown
* @param omit			[Object]*			hash of organizer IDs to ignore
* @param forceCreate	[boolean]*			if true, tree view will be created
* @param hideEmpty		[boolean]*			if true, don't show header if there is no data
* @param account		[ZmZimbraAccount]*	account we're showing tree for (if not currently active account)
*/
ZmSearchTreeController.prototype.show =
function(params) {
	var id = params.overviewId;
	this._hideEmpty[id] = params.hideEmpty;
	if (!this._treeView[id] || params.forceCreate) {
		this._treeView[id] = this._setup(id);
	}
	// mixed app should be filtered based on the previous app!
	var appController = appCtxt.getAppController();
	var activeApp = appController.getActiveApp();
	var prevApp = appController.getPreviousApp();
	var searchTypes = this._searchTypes[id] =
		(activeApp == ZmApp.MIXED && prevApp == ZmApp.CONTACTS) ?
			ZmApp.SEARCH_TYPES_R[ZmApp.CONTACTS] : ZmApp.SEARCH_TYPES_R[activeApp];
    var dataTree = this.getDataTree(params.account);
    if (dataTree) {
		params.dataTree = dataTree;
		params.searchTypes = searchTypes;
		this._treeView[id].set(params);
		this._checkTreeView(id, params.account);
	}
	
	return this._treeView[id];
};

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
ZmSearchTreeController.prototype.resetOperations = 
function(parent, type, id) {
	parent.enableAll(true);
	var search = appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (search.size() > 0));
};

// Private methods

/*
* Returns ops available for "Searches" container.
*/
ZmSearchTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

/*
* Returns ops available for saved searches.
*/
ZmSearchTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.DELETE,
			ZmOperation.RENAME_SEARCH,
			ZmOperation.MOVE,
			ZmOperation.EXPAND_ALL];
};

// override the ZmFolderTreeController override
ZmSearchTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

/*
* Returns a "New Saved Search" dialog.
*/
ZmSearchTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewSearchDialog();
};

/*
* Called when a left click occurs (by the tree view listener). The saved
* search will be run.
*
* @param search		ZmSearchFolder		search that was clicked
*/
ZmSearchTreeController.prototype._itemClicked =
function(searchFolder) {
	var searchController = appCtxt.getSearchController();
	searchController.redoSearch(searchFolder.search);
};

ZmSearchTreeController.prototype._getMoveParams =
function() {
	var params = ZmTreeController.prototype._getMoveParams.call(this);
	params.treeIds = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH];
	return params;
};

// Miscellaneous

/*
* Returns a title for moving a saved search.
*/
ZmSearchTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveSearch, this._pendingActionData.name);
};

/*
 * Shows or hides the tree view. It is hidden only if there are no saved searches that
 * belong to the owning app, and we have been told to hide empty tree views of this type.
 * 
 * @param overviewId		[constant]		overview ID
 */
ZmSearchTreeController.prototype._checkTreeView =
function(overviewId, account) {
	var treeView = this._treeView[overviewId];
	if (!overviewId || !treeView) { return;	}

	var rootId = (account != null || appCtxt.multiAccounts)
		? (ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, account))
		: ZmOrganizer.ID_ROOT;
	var hideMe = (this._hideEmpty[overviewId] && this._hideEmpty[overviewId][this.type]);
	var hide = (hideMe && !this._treeItemTypeMatch(treeView.getTreeItemById(rootId), this._searchTypes[overviewId]));
	this._treeView[overviewId].setVisible(!hide);
};

ZmSearchTreeController.prototype._treeItemTypeMatch =
function(treeItem, types) {
	if (!types) {
		// assume that no types specified means "allow all"
		return true;
	}
	var search = treeItem.getData(Dwt.KEY_OBJECT);
	if (search._typeMatch && search._typeMatch(types)) {
		return true;
	}
	
	var items = treeItem.getItems();
	for (var i = 0; i < items.length; i++) {
		if (this._treeItemTypeMatch(items[i], types)) {
			return true;
		}
	}
	return false;
};
