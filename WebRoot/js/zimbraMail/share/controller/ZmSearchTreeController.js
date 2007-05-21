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
* Creates a saved search tree controller.
* @constructor
* @class
* This class controls a tree display of saved searches.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
*/
ZmSearchTreeController = function(appCtxt) {

	var dropTgt = new DwtDropTarget("ZmSearchFolder");
	ZmFolderTreeController.call(this, appCtxt, ZmOrganizer.SEARCH, dropTgt);

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
* @param overviewId		[constant]	overview ID
* @param showUnread		[boolean]*	if true, unread counts will be shown
* @param omit			[Object]*	hash of organizer IDs to ignore
* @param forceCreate	[boolean]*	if true, tree view will be created
* @param app			[string]*	app that owns the overview
* @param hideEmpty		[boolean]*	if true, don't show header if there is no data
*/
ZmSearchTreeController.prototype.show =
function(params) {
	var id = params.overviewId;
	this._hideEmpty[id] = params.hideEmpty;
	if (!this._treeView[id] || params.forceCreate) {
		this._treeView[id] = this._setup(id);
	}
	// mixed app should be filtered based on the previous app!
	var appController = this._appCtxt.getAppController();
	var activeApp = params.app || appController.getActiveApp();
	var prevApp = appController.getPreviousApp();
	var searchTypes = this._searchTypes[id] =
		(activeApp == ZmApp.MIXED && prevApp == ZmApp.CONTACTS) ?
			ZmApp.SEARCH_TYPES_R[ZmApp.CONTACTS] : ZmApp.SEARCH_TYPES_R[activeApp];
    var dataTree = this.getDataTree();
    if (dataTree) {
		params.dataTree = dataTree;
		params.searchTypes = searchTypes;
		this._treeView[id].set(params);
		this._checkTreeView(id, searchTypes);
	}
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
	var search = this._appCtxt.getById(id);
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
	var list = new Array();
	list.push(ZmOperation.DELETE,
			  ZmOperation.RENAME_SEARCH,
			  ZmOperation.MOVE,
			  ZmOperation.EXPAND_ALL);
	return list;
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
	return this._appCtxt.getNewSearchDialog();
};

/*
* Called when a left click occurs (by the tree view listener). The saved
* search will be run.
*
* @param search		ZmSearchFolder		search that was clicked
*/
ZmSearchTreeController.prototype._itemClicked =
function(searchFolder) {
	var searchController = this._appCtxt.getSearchController();
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
function(overviewId) {
	var treeView = this._treeView[overviewId];
	if (!overviewId || !treeView.getHtmlElement()) return;	// tree view may have been pruned from overview

	var show = 	!this._hideEmpty[overviewId] || this._treeItemTypeMatch(treeView.getTreeItemById(ZmOrganizer.ID_ROOT), this._searchTypes[overviewId]);
	this._treeView[overviewId].setVisible(show);
};

ZmSearchTreeController.prototype._treeItemTypeMatch =
function(treeItem, types) {
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
