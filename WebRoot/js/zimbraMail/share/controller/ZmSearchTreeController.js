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
function ZmSearchTreeController(appCtxt) {

	var dropTgt = new DwtDropTarget("ZmSearchFolder");
	ZmFolderTreeController.call(this, appCtxt, ZmOrganizer.SEARCH, dropTgt);

	this._listeners[ZmOperation.RENAME_SEARCH] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.MODIFY_SEARCH] = new AjxListener(this, this._modifySearchListener);
	
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
function(overviewId, showUnread, omit, forceCreate, app, hideEmpty) {
	var appController = this._appCtxt.getAppController();
	var activeApp = app || appController.getActiveApp();
	var prevApp = appController.getPreviousApp();
	var id = [overviewId, ZmSearchTreeController.APP_JOIN_CHAR, activeApp].join("");
	this._hideEmpty[id] = hideEmpty;

	if (!this._treeView[id] || forceCreate) {
		this._treeView[id] = this._setup(overviewId);
	}
	// mixed app should be filtered based on the previous app!
	var searchTypes = this._searchTypes[id] =
		(activeApp == ZmApp.MIXED && prevApp == ZmApp.CONTACTS) ?
			ZmApp.SEARCH_TYPES_R[ZmApp.CONTACTS] : ZmApp.SEARCH_TYPES_R[activeApp];
	this._treeView[id].set(this._dataTree, showUnread, omit, searchTypes);
	this._checkTreeView(id, searchTypes);
};

/**
* Returns the tree view for the given overview.
*
* @param overviewId		[constant]	overview ID
* @param app			[string]*	app that owns the overview
*/
ZmSearchTreeController.prototype.getTreeView =
function(overviewId, app) {
	app = app ? app : this._appCtxt.getAppController().getActiveApp();
	var id = [overviewId, ZmSearchTreeController.APP_JOIN_CHAR, app].join("");
	return this._treeView[id];
};

/**
* Clears the tree view for the given overview.
*
* @param overviewId		[constant]	overview ID
* @param app			[string]*	app that owns the overview
*/
ZmSearchTreeController.prototype.clearTreeView =
function(overviewId, app) {
	app = app ? app : this._appCtxt.getAppController().getActiveApp();
	var id = [overviewId, ZmSearchTreeController.APP_JOIN_CHAR, app].join("");
	if (this._treeView[id]) {
		this._treeView[id].dispose();
		delete this._treeView[id];
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
	var search = this._dataTree.getById(id);
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
	return ZmTreeController.prototype._getAllowedSubTypes.call();
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

/*
* Override to handle our multiple tree views. Primarily, we need to make sure that
* only the appropriate tree views receive CREATE notifications. For example, we
* don't want to add a saved search for contacts to the mail app's search tree view.
* CREATE notifications always come one at a time.
*
* @param ev		[ZmEvent]	a change event
*/
ZmSearchTreeController.prototype._treeChangeListener =
function(ev) {
	var organizers = ev.getDetail("organizers");
	for (var overviewId in this._treeView) {
		if (!this._treeView[overviewId].getHtmlElement()) continue;	// tree view may have been pruned from overview
		if (organizers.length == 1 && organizers[0].type == ZmOrganizer.SEARCH && ev.event == ZmEvent.E_CREATE) {
			var app = overviewId.substr(overviewId.indexOf(ZmSearchTreeController.APP_JOIN_CHAR) + 1);
			if (organizers[0]._typeMatch(ZmApp.SEARCH_TYPES_R[app])) {
				this._changeListener(ev, this._treeView[overviewId], overviewId);
			}
		} else {
			this._changeListener(ev, this._treeView[overviewId], overviewId);
		}
	}
};

/*
* Handles a search folder being moved from Searches to Folders.
*
* @param ev				[ZmEvent]		a change event
* @param treeView		[ZmTreeView]	a tree view
* @param overviewId		[constant]		overview ID
*/
ZmSearchTreeController.prototype._changeListener =
function(ev, treeView, overviewId) {
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	// handle one organizer at a time
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var fields = ev.getDetail("fields");
		var node = treeView.getTreeItemById(id);
		var parentNode = organizer.parent ? treeView.getTreeItemById(organizer.parent.id) : null;
		if ((organizer.type == ZmOrganizer.SEARCH &&
			(id == ZmOrganizer.ID_ROOT || organizer.parent.tree.type == ZmOrganizer.FOLDER)) &&
			(ev.event == ZmEvent.E_MOVE || (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_PARENT])))) {
			DBG.println(AjxDebug.DBG3, "Moving search from Searches to Folders");
			if (node) {
				node.dispose();
			}
			this._checkTreeView(overviewId);
			// send a CREATE event to folder tree controller to get it to add node
			var newEv = new ZmEvent(ZmEvent.S_FOLDER);
			newEv.set(ZmEvent.E_CREATE, organizer);
			var ftc = this._opc.getTreeController(ZmOrganizer.FOLDER);
			var ftv = ftc.getTreeView(treeView.overviewId);
			var folderOverviewId = overviewId.substring(0, overviewId.indexOf(ZmSearchTreeController.APP_JOIN_CHAR));
			ftc._changeListener(newEv, ftv, folderOverviewId);
		} else {
			ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);
		}
	}
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
	if (!overviewId || !this._treeView[overviewId].getHtmlElement()) return;	// tree view may have been pruned from overview
	var show = (this._dataTree.root._hasType(this._searchTypes[overviewId]) || !this._hideEmpty[overviewId]);
	this._treeView[overviewId].setVisible(show);
};
