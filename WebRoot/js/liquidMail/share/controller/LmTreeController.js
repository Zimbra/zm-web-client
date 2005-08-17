/**
* Creates an empty tree controller.
* @constructor
* @class
* This class is a base class for controllers for tags and folders (organizers). Those are
* represented by trees, both as data and visually. This class uses the support provided by
* LmOperation.
*
* @author Conrad Damon
* @param appCtxt	app context
* @param parent		parent of the tree we are controlling
* @param tree		the tree we are controlling
*/
function LmTreeController(appCtxt, parent, tree, dropTgt) {

	if (arguments.length == 0) return;
	LmController.call(this, appCtxt);

	this.parent = parent;
	if (!tree && (parent instanceof DwtTree))
		tree = parent;
	this.tree = tree;
	
	this._listeners = new Object();
	this._listeners[LmOperation.DELETE] = new LsListener(this, this._deleteListener);
	this._listeners[LmOperation.MARK_ALL_READ] = new LsListener(this, this._markAllReadListener);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new LsListener(this, this._dragListener));
	this._dropTgt = dropTgt;
	this._dropTgt.addDropListener(new LsListener(this, this._dropListener));
}

LmTreeController.prototype = new LmController;
LmTreeController.prototype.constructor = LmTreeController;

// Abstract methods

// Enables/disables operations based on the given organizer ID
LmTreeController.prototype.resetOperations = function(id) {}

// Creates the tree view element
LmTreeController.prototype._createNewTreeView = function() {}

// Returns a list of desired action menu operations
LmTreeController.prototype._getActionMenuOps = function() {}

// Returns the dialog for organizer creation
LmTreeController.prototype._getNewDialog = function() {}

// Returns the dialog for renaming an organizer
LmTreeController.prototype._getRenameDialog = function() {}

// Handles tree selection (and action) events
LmTreeController.prototype._treeViewListener = function(ev) {}

// Public methods

LmTreeController.prototype.toString = 
function() {
	return "LmTreeController";
}

/**
* Returns the tree view.
*/
LmTreeController.prototype.getTreeView =
function() {
	return this._treeView;
}

/**
* Creates and returns an action menu, and sets its listeners.
*
* @param parent			parent widget
* @param menuItems		optional list of menu items
*/
LmTreeController.prototype.createActionMenu = 
function(parent, menuItems) {
	menuItems = menuItems ? menuItems : this._getActionMenuOps();
	if (!menuItems) return;
	
	var actionMenu = new LmActionMenu(parent, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	actionMenu.addPopdownListener(new LsListener(this, this._popdownActionListener));

	return actionMenu;
}


// Private and protected methods

// Performs initialization.
LmTreeController.prototype._setup = 
function() {
	this._initializeTreeView();
	this._initializeActionMenu();
}

LmTreeController.prototype._initializeTreeView =
function() {
	if (!this._treeView) {
		this._treeView = this._createNewTreeView();
		this._treeView.addSelectionListener(new LsListener(this, this._treeViewListener));
	}
}

LmTreeController.prototype._initializeActionMenu =
function() {
    if (!this._actionMenu) {
    	this._actionMenu = this.createActionMenu(this._shell);
	}
}

// Actions

// Creates a new organizer and adds it to the tree.
LmTreeController.prototype._doCreate =
function(params) {
	try {
		params.parent.create(params.name);
	} catch (ex) {
		this._handleException(ex, this._doCreate, params, false);
	}
}

// Deletes an organizer and removes it from the tree.
LmTreeController.prototype._doDelete =
function(params) {
	try {
   		params.organizer.dispose();
	} catch (ex) {
		this._handleException(ex, this._doDelete, params, false);
	}
}

// Renames an organizer.
// TODO: re-sort
LmTreeController.prototype._doRename =
function(params) {
	try {
		params.organizer.rename(params.name);
	} catch (ex) {
		this._handleException(ex, this._doRename, params, false);
	}
}

// Listeners

LmTreeController.prototype._newListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var newDialog = this._getNewDialog();
	this._showDialog(newDialog, this._newCallback, this._pendingActionData);
	newDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newDialog);
}

LmTreeController.prototype._renameListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var renameDialog = this._getRenameDialog();
	this._showDialog(renameDialog, this._renameCallback, this._pendingActionData);
	renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
}

LmTreeController.prototype._deleteListener = 
function(ev) {
	this._schedule(this._doDelete, {organizer: this._getActionedOrganizer(ev)});
}

LmTreeController.prototype._markAllReadListener = 
function(ev) {
	this._schedule(this._doMarkAllRead, this._getActionedOrganizer(ev));
}

LmTreeController.prototype._dragListener =
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

LmTreeController.prototype._popdownActionListener = 
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

LmTreeController.prototype._newCallback =
function(args) {
	this._schedule(this._doCreate, {name: args[0], parent: args[1]});
	this._clearDialog(this._getNewDialog());
}

LmTreeController.prototype._renameCallback =
function(args) {
	this._schedule(this._doRename, {organizer: args[0], name: args[1]});
	this._clearDialog(this._getRenameDialog());
}

LmTreeController.prototype._doMarkAllRead =
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
LmTreeController.prototype._getActionedOrganizer =
function(ev) {
	if (this._actionedOrganizer)
		return this._actionedOrganizer;
		
	var obj = ev.item;
	while (obj) {
		var data = obj.getData(Dwt.KEY_OBJECT);
		if (data instanceof LmOrganizer) {
			this._actionedOrganizer = data;
			return this._actionedOrganizer;
		}
		obj = obj.parent;
	}
	return null;
}
