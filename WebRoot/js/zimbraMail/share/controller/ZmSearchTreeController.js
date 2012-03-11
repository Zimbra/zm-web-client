/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines the search tree controller.
 *
 */

/**
 * Creates a search tree controller.
 * @class
 * This class controls a tree display of saved searches.
 *
 * @author Conrad Damon
 * 
 * @extends		ZmFolderTreeController
 */
ZmSearchTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.SEARCH);

	this._listeners[ZmOperation.RENAME_SEARCH] = this._renameListener.bind(this);
};

ZmSearchTreeController.prototype = new ZmFolderTreeController;
ZmSearchTreeController.prototype.constructor = ZmSearchTreeController;

ZmSearchTreeController.prototype.isZmSearchTreeController = true;
ZmSearchTreeController.prototype.toString = function() { return "ZmSearchTreeController"; };

ZmSearchTreeController.APP_JOIN_CHAR = "-";

// Public methods

/**
 * Shows the tree of this type.
 *
 * @param	{Hash}	params		a hash of parameters
 * @param	{String}	params.overviewId		the overview ID
 * @param	{Boolean}	params.showUnread		if <code>true</code>, unread counts will be shown
 * @param	{Array}	params.omit				a hash of organizer IDs to ignore
 * @param	{Boolean}	params.forceCreate	if <code>true</code>, tree view will be created
 * @param	{ZmZimbraAccount}	params.account	the account to show tree for (if not currently active account)
 * 
 */
ZmSearchTreeController.prototype.show =
function(params) {
	var id = params.overviewId;
	if (!this._treeView[id] || params.forceCreate) {
		this._treeView[id] = this._setup(id);
	}
    var dataTree = this.getDataTree(params.account);
    if (dataTree) {
		params.dataTree = dataTree;
		params.searchTypes = {};
		params.omit = params.omit || {};
		params.omit[ZmFolder.ID_TRASH] = true;
		params.omitParents = true;
		var setting = ZmOrganizer.OPEN_SETTING[this.type];
		params.collapsed = !(!setting || (appCtxt.get(setting, null, params.account) !== false));
		var overview = this._opc.getOverview(id);
		if (overview && overview.showNewButtons)
			this._setupOptButton(params);
		this._treeView[id].set(params);
		this._checkTreeView(id);
	}
	
	return this._treeView[id];
};

/**
 * Gets the tree style.
 * 
 * @return	{Object}	the tree style or <code>null</code> if not set
 */
ZmSearchTreeController.prototype.getTreeStyle =
function() {
	return null;
};

/**
* Resets and enables/disables operations based on context.
*
* @param {ZmControl}	parent		the widget that contains the operations
* @param {constant}	type		the type
* @param {String}	id			the currently selected/activated organizer
*/
ZmSearchTreeController.prototype.resetOperations =
function(parent, type, id) {
	parent.enableAll(true);
	var search = appCtxt.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (search.size() > 0));
};



// Private methods

/**
 * Returns ops available for "Searches" container.
 * 
 * @private
 */
ZmSearchTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.EXPAND_ALL];
};

/**
 * Returns ops available for saved searches.
 * 
 * @private
 */
ZmSearchTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.DELETE_WITHOUT_SHORTCUT,
			ZmOperation.RENAME_SEARCH,
			ZmOperation.EDIT_PROPS,
			ZmOperation.MOVE,
			ZmOperation.EXPAND_ALL];
};

/**
 * override the ZmFolderTreeController override.
 * 
 * @private
 */
ZmSearchTreeController.prototype._getAllowedSubTypes =
function() {
	return ZmTreeController.prototype._getAllowedSubTypes.call(this);
};

/**
 * Returns a "New Saved Search" dialog.
 * 
 * @private
 */
ZmSearchTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewSearchDialog();
};

/**
 * Called when a left click occurs (by the tree view listener). The saved
 * search will be run.
 *
 * @param {ZmSearchFolder}		searchFolder		the search that was clicked
 * 
 * @private
 */
ZmSearchTreeController.prototype._itemClicked =
function(searchFolder) {
	if (searchFolder._showFoldersCallback) {
		searchFolder._showFoldersCallback.run();
		return;
	}

	appCtxt.getSearchController().redoSearch(searchFolder.search, false, {getHtml: appCtxt.get(ZmSetting.VIEW_AS_HTML)});
};

/**
 * @private
 */
ZmSearchTreeController.prototype._getMoveParams =
function(dlg) {
	var params = ZmTreeController.prototype._getMoveParams.apply(this, arguments);
	params.overviewId = dlg.getOverviewId(this.type);
	params.treeIds = [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH];
	return params;
};

// Miscellaneous

/**
 * Returns a title for moving a saved search.
 * 
 * @private
 */
ZmSearchTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveSearch, this._pendingActionData.name);
};

/**
 * Shows or hides the tree view. It is hidden only if there are no saved
 * searches that belong to the owning app, and we have been told to hide empty
 * tree views of this type.
 * 
 * @param {constant}	overviewId		the overview ID
 * 
 * @private
 */
ZmSearchTreeController.prototype._checkTreeView =
function(overviewId) {
	var treeView = this._treeView[overviewId];
	if (!overviewId || !treeView) { return; }

	var account = this._opc.getOverview(overviewId).account;
	var rootId = (appCtxt.multiAccounts && !account.isMain)
		? (ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT, account))
		: ZmOrganizer.ID_ROOT;
	var hide = ZmOrganizer.HIDE_EMPTY[this.type] && !treeView.getTreeItemById(rootId).getItemCount();
	this._treeView[overviewId].setVisible(!hide);
};
