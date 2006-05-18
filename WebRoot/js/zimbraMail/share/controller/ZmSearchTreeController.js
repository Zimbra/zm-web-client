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

	var dropTgt = new DwtDropTarget(ZmSearchFolder);
	ZmFolderTreeController.call(this, appCtxt, ZmOrganizer.SEARCH, dropTgt);

	this._listeners[ZmOperation.RENAME_SEARCH] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.MODIFY_SEARCH] = new AjxListener(this, this._modifySearchListener);
};

ZmSearchTreeController.prototype = new ZmFolderTreeController;
ZmSearchTreeController.prototype.constructor = ZmSearchTreeController;

// Public methods

ZmSearchTreeController.prototype.toString = 
function() {
	return "ZmSearchTreeController";
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

// Listeners

/*
* Handles the potential drop of a search folder into the search tree.
*
* @param ev		[DwtDropEvent]		the drop event
*/
ZmSearchTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var dragSearchFolder = ev.srcData; // note that search folders cannot be moved as a list
		var dropSearchFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		ev.doIt = dropSearchFolder.mayContain(dragSearchFolder);
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var dropSearchFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		DBG.println(AjxDebug.DBG3, "DRAG_DROP: " + ev.srcData.name + " on to " + dropSearchFolder.name);
		this._doMove(ev.srcData, dropSearchFolder);
	}
};

/*
* Handles a search folder being moved from Searches to Folders.
*
* @param ev			[ZmEvent]		a change event
* @param treeView	[ZmTreeView]	a tree view
*/
ZmSearchTreeController.prototype._changeListener =
function(ev, treeView) {
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
			if (node)
				node.dispose();
			// send a CREATE event to folder tree controller to get it to add node
			var newEv = new ZmEvent(ZmEvent.S_FOLDER);
			newEv.set(ZmEvent.E_CREATE, organizer);
			var ftc = this._opc.getTreeController(ZmOrganizer.FOLDER);
			var ftv = ftc.getTreeView(treeView.overviewId);
			ftc._changeListener(newEv, ftv);
		} else {
			ZmTreeController.prototype._changeListener.call(this, ev, treeView);
		}
	}
};

// Callbacks

/*
* Called when a "New Search" dialog is submitted. This override is necessary because we
* need to pass the search object to _doCreate().
*
* @param parent	[ZmFolder]	folder (or search) that will contain it
* @param name	[string]	name of the new saved search
* @param search	[ZmSearch]	search object with details of the search
*/
ZmSearchTreeController.prototype._newCallback =
function(parent, name, search) {
	this._doCreate(parent, name, null, null, search);
	this._getNewDialog().popdown();
};

// Miscellaneous

/*
* Returns a title for moving a saved search.
*/
ZmSearchTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveSearch, this._pendingActionData.name);
};
