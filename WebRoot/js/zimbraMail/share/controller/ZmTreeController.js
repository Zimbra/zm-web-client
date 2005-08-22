/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

/**
* Creates an empty tree controller.
* @constructor
* @class
* This class is a base class for controllers for tags and folders (organizers). Those are
* represented by trees, both as data and visually. This class uses the support provided by
* ZmOperation.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param parent		parent of the tree we are controlling
* @param tree		the tree we are controlling
*/
function ZmTreeController(appCtxt, parent, tree, dropTgt) {

	if (arguments.length == 0) return;
	ZmController.call(this, appCtxt);

	this.parent = parent;
	if (!tree && (parent instanceof DwtTree))
		tree = parent;
	this.tree = tree;
	
	this._listeners = new Object();
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.MARK_ALL_READ] = new AjxListener(this, this._markAllReadListener);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	this._dropTgt = dropTgt;
	this._dropTgt.addDropListener(new AjxListener(this, this._dropListener));
}

ZmTreeController.prototype = new ZmController;
ZmTreeController.prototype.constructor = ZmTreeController;

// Abstract methods

// Enables/disables operations based on the given organizer ID
ZmTreeController.prototype.resetOperations = function(id) {}

// Creates the tree view element
ZmTreeController.prototype._createNewTreeView = function() {}

// Returns a list of desired action menu operations
ZmTreeController.prototype._getActionMenuOps = function() {}

// Returns the dialog for organizer creation
ZmTreeController.prototype._getNewDialog = function() {}

// Returns the dialog for renaming an organizer
ZmTreeController.prototype._getRenameDialog = function() {}

// Handles tree selection (and action) events
ZmTreeController.prototype._treeViewListener = function(ev) {}

// Public methods

ZmTreeController.prototype.toString = 
function() {
	return "ZmTreeController";
}

/**
* Returns the tree view.
*/
ZmTreeController.prototype.getTreeView =
function() {
	return this._treeView;
}

/**
* Creates and returns an action menu, and sets its listeners.
*
* @param parent			parent widget
* @param menuItems		optional list of menu items
*/
ZmTreeController.prototype.createActionMenu = 
function(parent, menuItems) {
	menuItems = menuItems ? menuItems : this._getActionMenuOps();
	if (!menuItems) return;
	
	var actionMenu = new ZmActionMenu(parent, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	actionMenu.addPopdownListener(new AjxListener(this, this._popdownActionListener));

	return actionMenu;
}


// Private and protected methods

// Performs initialization.
ZmTreeController.prototype._setup = 
function() {
	this._initializeTreeView();
	this._initializeActionMenu();
}

ZmTreeController.prototype._initializeTreeView =
function() {
	if (!this._treeView) {
		this._treeView = this._createNewTreeView();
		this._treeView.addSelectionListener(new AjxListener(this, this._treeViewListener));
	}
}

ZmTreeController.prototype._initializeActionMenu =
function() {
    if (!this._actionMenu) {
    	this._actionMenu = this.createActionMenu(this._shell);
	}
}

// Actions

// Creates a new organizer and adds it to the tree.
ZmTreeController.prototype._doCreate =
function(params) {
	try {
		params.parent.create(params.name);
	} catch (ex) {
		this._handleException(ex, this._doCreate, params, false);
	}
}

// Deletes an organizer and removes it from the tree.
ZmTreeController.prototype._doDelete =
function(params) {
	try {
   		params.organizer.dispose();
	} catch (ex) {
		this._handleException(ex, this._doDelete, params, false);
	}
}

// Renames an organizer.
// TODO: re-sort
ZmTreeController.prototype._doRename =
function(params) {
	try {
		params.organizer.rename(params.name);
	} catch (ex) {
		this._handleException(ex, this._doRename, params, false);
	}
}

// Listeners

ZmTreeController.prototype._newListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var newDialog = this._getNewDialog();
	this._showDialog(newDialog, this._newCallback, this._pendingActionData);
	newDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newDialog);
}

ZmTreeController.prototype._renameListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var renameDialog = this._getRenameDialog();
	this._showDialog(renameDialog, this._renameCallback, this._pendingActionData);
	renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
}

ZmTreeController.prototype._deleteListener = 
function(ev) {
	this._schedule(this._doDelete, {organizer: this._getActionedOrganizer(ev)});
}

ZmTreeController.prototype._markAllReadListener = 
function(ev) {
	this._schedule(this._doMarkAllRead, this._getActionedOrganizer(ev));
}

ZmTreeController.prototype._dragListener =
function(ev) {
	switch (ev.action) {
		case DwtDragEvent.SET_DATA:
			ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
			break;
		case DwtDragEvent.DRAG_START:
		case DwtDragEvent.DRAG_END:
		default:
			break;		
	}
}

ZmTreeController.prototype._popdownActionListener = 
function(ev) {
	if (this._pendingActionData) return;

	var treeView = this.getTreeView();
	if (this._actionedOrganizer && (treeView.getSelected() != this._actionedOrganizer)) {
		var ti = treeView.getTreeItemById(this._actionedOrganizer.id);
		if (ti)
			ti._setActioned(false);
	}
	this._actionedOrganizer = null;
}

// Callbacks

ZmTreeController.prototype._newCallback =
function(args) {
	this._schedule(this._doCreate, {name: args[0], parent: args[1]});
	this._clearDialog(this._getNewDialog());
}

ZmTreeController.prototype._renameCallback =
function(args) {
	this._schedule(this._doRename, {organizer: args[0], name: args[1]});
	this._clearDialog(this._getRenameDialog());
}

ZmTreeController.prototype._doMarkAllRead =
function(organizer) {
	try {
		organizer.markAllRead();
	} catch (ex) {
		this._handleException(ex, this._doMarkAllRead, organizer, false);
	}
}

// Typically the actioned organizer is the item that's been right-clicked in the overview
// panel. But it may be the one that was selected if the user is using the dropdown menu
// that hangs off the button at top, in which case we need to get it from the button data.
ZmTreeController.prototype._getActionedOrganizer =
function(ev) {
	if (this._actionedOrganizer)
		return this._actionedOrganizer;
		
	var obj = ev.item;
	while (obj) {
		var data = obj.getData(Dwt.KEY_OBJECT);
		if (data instanceof ZmOrganizer) {
			this._actionedOrganizer = data;
			return this._actionedOrganizer;
		}
		obj = obj.parent;
	}
	return null;
}
