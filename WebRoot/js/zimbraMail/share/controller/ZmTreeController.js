/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a tree controller.
* @constructor
* @class
* This class is a base class for controllers for organizers. Those are
* represented by trees, both as data and visually. This class uses the support provided by
* ZmOperation. Each type of organizer has a singleton tree controller which manages all 
* the tree views of that type.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
* @param type		[constant]		type of organizer we are displaying/controlling
* @param dropTgt	[DwtDropTgt]	drop target for this type
*/
function ZmTreeController(appCtxt, type, dropTgt) {

	if (arguments.length == 0) return;
	ZmController.call(this, appCtxt);

	this.type = type;
	this._opc = appCtxt.getOverviewController();
	
	// common listeners
	this._listeners = new Object();
	this._listeners[ZmOperation.DELETE] = new AjxListener(this, this._deleteListener);
	this._listeners[ZmOperation.MOVE] = new AjxListener(this, this._moveListener);
	this._listeners[ZmOperation.EXPAND_ALL] = new AjxListener(this, this._expandAllListener);
	this._listeners[ZmOperation.MARK_ALL_READ] = new AjxListener(this, this._markAllReadListener);
	this._listeners[ZmOperation.SYNC] = new AjxListener(this, this._syncListener);
	
	// drag-and-drop
	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
	this._dropTgt = dropTgt;
	if (this._dropTgt)
		this._dropTgt.addDropListener(new AjxListener(this, this._dropListener));

	// change listening
	this._dataTree = appCtxt.getTree(type);
	this._dataChangeListener = new AjxListener(this, this._treeChangeListener);
	this._dataTree.addChangeListener(this._dataChangeListener);
	
	// hash of tree views of this type, by overview ID
	this._treeView = new Object();
};

ZmTreeController.prototype = new ZmController;
ZmTreeController.prototype.constructor = ZmTreeController;

// Abstract protected methods

// Enables/disables operations based on the given organizer ID
ZmTreeController.prototype.resetOperations = function() {};

// Returns a list of desired header action menu operations
ZmTreeController.prototype._getHeaderActionMenuOps = function() {};

// Returns a list of desired action menu operations
ZmTreeController.prototype._getActionMenuOps = function() {};

// Returns the dialog for organizer creation
ZmTreeController.prototype._getNewDialog = function() {};

// Returns the dialog for renaming an organizer
ZmTreeController.prototype._getRenameDialog = function() {};

// Method that is run when a tree item is left-clicked
ZmTreeController.prototype._itemClicked = function() {};

// Method that is run when a tree item is dbl-clicked
ZmTreeController.prototype._itemDblClicked = function() {};

// Handles a drop event
ZmTreeController.prototype._dropListener = function() {};

// Returns an appropriate title for the "Move To" dialog
ZmTreeController.prototype._getMoveDialogTitle = function() {};

// Public methods

ZmTreeController.prototype.toString = 
function() {
	return "ZmTreeController";
};

/**
* Displays the tree of this type.
*
* @param overviewId		[constant]	overview ID
* @param showUnread		[boolean]*	if true, unread counts will be shown
* @param omit			[Object]*	hash of organizer IDs to ignore
* @param forceCreate	[boolean]*	if true, tree view will be created
*/
ZmTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate) {
	if (!this._treeView[overviewId] || forceCreate)
		this._setup(overviewId, forceCreate);
	this._treeView[overviewId].set(this._dataTree, showUnread, omit);
	this._treeView[overviewId].setVisible(true);
};

/**
* Returns the tree view for the given overview.
*
* @param overviewId		[constant]	overview ID
*/
ZmTreeController.prototype.getTreeView =
function(overviewId) {
	return this._treeView[overviewId];
};

/**
* Clears the tree view for the given overview.
*
* @param overviewId		[constant]	overview ID
*
* TODO: remove change listener if last tree view cleared
*/
ZmTreeController.prototype.clearTreeView =
function(overviewId) {
	delete this._treeView[overviewId];
};

// Private and protected methods

/*
* Performs initialization.
*
* @param overviewId		[constant]	overview ID
* @param forceCreate	[boolean]*	if true, tree view will be created
*/
ZmTreeController.prototype._setup = 
function(overviewId, forceCreate) {
	this._initializeTreeView(overviewId, forceCreate);
	if (this._opc.actionSupported(overviewId))
		this._initializeActionMenus();
};

/*
* Lazily creates a tree view of this type, using options from the overview.
*
* @param overviewId		[constant]	overview ID
* @param forceCreate	[boolean]*	if true, tree view will be created
*/
ZmTreeController.prototype._initializeTreeView =
function(overviewId, forceCreate) {
	if (!this._treeView[overviewId] || forceCreate) {
		var dragSrc = this._opc.dndSupported(overviewId) ? this._dragSrc : null;
		var dropTgt = this._opc.dndSupported(overviewId) ? this._dropTgt : null;
		var params = {parent: this._opc.getOverview(overviewId), overviewId: overviewId, type: this.type,
					  headerClass: this._opc.getHeaderClass(overviewId), dragSrc: dragSrc, dropTgt: dropTgt,
					  treeStyle: this.getTreeStyle() || this._opc.getTreeStyle(overviewId)}; 
		this._treeView[overviewId] = new ZmTreeView(params);
		this._treeView[overviewId].addSelectionListener(new AjxListener(this, this._treeViewListener));
	}
};

/** 
 * This allows a tree controller to override the default tree style
 * specified by the overview controller.
 */
ZmTreeController.prototype.getTreeStyle = function() {};

/*
* Creates up to two action menus, one for the tree view's header item, and
* one for the rest of the items. Note that each of these two menus is a 
* singleton, shared among the tree views of this type.
*/
ZmTreeController.prototype._initializeActionMenus =
function() {
	var ops = this._getHeaderActionMenuOps();
	if (!this._headerActionMenu && ops)
		this._headerActionMenu = this._createActionMenu(this._shell, ops);
	ops = this._getActionMenuOps();
	if (!this._actionMenu && ops)
		this._actionMenu = this._createActionMenu(this._shell, ops);
};

/*
* Creates and returns an action menu, and sets its listeners.
*
* @param parent			[DwtControl]	menu's parent widget
* @param menuItems		[Array]*		list of menu items
*/
ZmTreeController.prototype._createActionMenu = 
function(parent, menuItems) {
	if (!menuItems) return;
	
	var actionMenu = new ZmActionMenu(parent, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	actionMenu.addPopdownListener(new AjxListener(this, this._popdownActionListener));

	return actionMenu;
};

// Actions

/*
* Creates a new organizer and adds it to the tree of that type.
*
* @param parent		[ZmOrganizer]	parent of the new organizer
* @param name		[string]		name of the new organizer
*/
ZmTreeController.prototype._doCreate =
function(parent, name) {
	parent.create(name);
};

/*
* Deletes an organizer and removes it from the tree.
*
* @param organizer		[ZmOrganizer]	organizer to delete
*/
ZmTreeController.prototype._doDelete =
function(organizer) {
	organizer._delete();
};

/*
* Renames an organizer.
*
* @param organizer	[ZmOrganizer]	organizer to rename
* @param name		[string]		new name of the organizer
*/
ZmTreeController.prototype._doRename =
function(organizer, name) {
	organizer.rename(name);
};

/*
* Moves an organizer to a new folder.
*
* @param organizer	[ZmOrganizer]	organizer to move
* @param folder		[ZmFolder]		target folder
*/
ZmTreeController.prototype._doMove =
function(organizer, folder) {
	organizer.move(folder);
};

/*
* Marks an organizer's items as read.
*
* @param organizer	[ZmOrganizer]	organizer
*/
ZmTreeController.prototype._doMarkAllRead =
function(organizer) {
	organizer.markAllRead();
};

/*
* Syncs an organizer to its feed (URL).
*
* @param organizer	[ZmOrganizer]	organizer
*/
ZmTreeController.prototype._doSync =
function(organizer) {
	organizer.sync();
};

// Listeners

/*
* Handles left and right mouse clicks. A left click generates a selection event.
* If selection is supported for the overview, some action (typically a search)
* will be performed. A right click generates an action event, which pops up an
* action menu if supported.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._treeViewListener =
function(ev) {
	if (ev.detail != DwtTree.ITEM_ACTIONED && ev.detail != DwtTree.ITEM_SELECTED && ev.detail != DwtTree.ITEM_DBL_CLICKED) return;
	
	this._actionedTreeItem = ev.item;
	
	var type = ev.item.getData(ZmTreeView.KEY_TYPE);
	if (!type) return;
	
	var item = ev.item.getData(Dwt.KEY_OBJECT);
	if (item)
		this._actionedOrganizer = item;
	var id = ev.item.getData(Dwt.KEY_ID);
	var overviewId = ev.item.getData(ZmTreeView.KEY_ID);
	if (overviewId)
		this._actionedOverviewId = overviewId;

	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		// right click
		if (this._opc.actionSupported(overviewId)) {
			var actionMenu = (id == ZmOrganizer.ID_ROOT) ? this._headerActionMenu : this._actionMenu;
			if (actionMenu) {
				this.resetOperations(actionMenu, type, id);
				actionMenu.popup(0, ev.docX, ev.docY);
			}
		}
	} else if ((ev.detail == DwtTree.ITEM_SELECTED) && item) {
		// left click
		this._opc.itemSelected(overviewId, type);
		if (this._opc.selectionSupported(overviewId))
			this._itemClicked(item);
	} else if ((ev.detail == DwtTree.ITEM_DBL_CLICKED) && item) {
		// dbl click
		//this._opc.itemSelected(overviewId, type);
		//if (this._opc.selectionSupported(overviewId))
		this._itemDblClicked(item);
	}
};

/*
* Handles changes to the underlying model. The change is propagated to
* all the tree views known to this controller.
*
* @param ev		[ZmEvent]	a change event
*/
ZmTreeController.prototype._treeChangeListener =
function(ev) {
	for (var overviewId in this._treeView)
		this._changeListener(ev, this._treeView[overviewId]);
};

/*
* Handles a change event for one tree view.
*
* @param ev			[ZmEvent]		a change event
* @param treeView	[ZmTreeView]	a tree view
*/
ZmTreeController.prototype._changeListener =
function(ev, treeView) {
	if (ev.type != this.type) return;
	
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source)
		organizers = [ev.source];

	// handle one organizer at a time
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		var id = organizer.id;
		var node = treeView.getTreeItemById(id);
		var parentNode = organizer.parent ? treeView.getTreeItemById(organizer.parent.id) : null;

		var fields = ev.getDetail("fields");
		if (ev.event == ZmEvent.E_FLAGS) {
			var flag = ev.getDetail("flag");
			var state = ev.getDetail("state");
			// handle "Mark All As Read" by clearing unread count
			if (node && (flag == ZmItem.FLAG_UNREAD) && !state)
				node.setText(organizer.getName(false));
		} else if (ev.event == ZmEvent.E_DELETE) {
			if (node) {
				if (id == ZmFolder.ID_TRASH || id == ZmFolder.ID_SPAM)
					// empty Trash or Junk
					node.setText(organizer.getName(false));
				else
					node.dispose();
			}
		} else if (ev.event == ZmEvent.E_CREATE || ev.event == ZmEvent.E_MOVE ||
				   (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_PARENT]))) {
			if (node && (ev.event != ZmEvent.E_CREATE))
				node.dispose(); // remove from current parent
			if (parentNode) {
				var idx = ZmTreeView.getSortIndex(parentNode, organizer, ZmTreeView.COMPARE_FUNC[organizer.type]);
				treeView._addNew(parentNode, organizer, idx); // add to new parent
				if (parentNode)
					parentNode.setExpanded(true); // so that new node is visible
			}
		} else if (ev.event == ZmEvent.E_MODIFY) {
			if (node) {
				// change that affects name
				if ((fields && fields[ZmOrganizer.F_NAME]) || (fields && fields[ZmOrganizer.F_UNREAD]) ||
					((id == ZmFolder.ID_DRAFTS) && (fields && fields[ZmOrganizer.F_TOTAL]))) {
					var checked = node.getChecked();
					node.setText(organizer.getName(true));
					if (fields && fields[ZmOrganizer.F_NAME] && parentNode && (parentNode.getNumChildren() > 1)) {
						// remove and re-insert the node (if parent has more than one child)
						node.dispose();
						var idx = ZmTreeView.getSortIndex(parentNode, organizer, ZmTreeView.COMPARE_FUNC[organizer.type]);
						treeView._addNew(parentNode, organizer, idx);
						if (checked) {
							node = treeView.getTreeItemById(id);
							node.setChecked(checked);
						}
					}
					if (parentNode)
						parentNode.setExpanded(true);
				}
			}
		}
	}
};

/*
* Pops up the appropriate "New ..." dialog.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._newListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var newDialog = this._getNewDialog();
	this._showDialog(newDialog, this._newCallback, this._pendingActionData);
	newDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, newDialog);
};

/*
* Pops up the appropriate "Rename ..." dialog.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._renameListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var renameDialog = this._getRenameDialog();
	this._showDialog(renameDialog, this._renameCallback, this._pendingActionData);
	renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
};

/*
* Deletes an organizer.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._deleteListener = 
function(ev) {
	this._doDelete(this._getActionedOrganizer(ev));
};

/*
* Moves an organizer into another folder.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._moveListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var moveToDialog = this._appCtxt.getMoveToDialog();
	this._showDialog(moveToDialog, this._moveCallback, this._pendingActionData);
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
	moveToDialog.setTitle(this._getMoveDialogTitle());
};

/*
* Expands the tree below the actioned node.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._expandAllListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var treeView = this.getTreeView(this._actionedOverviewId);
	var ti = treeView.getTreeItemById(organizer.id);
	ti.setExpanded(true, true);
};

/*
* Mark's an organizer's contents as read.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._markAllReadListener = 
function(ev) {
	this._doMarkAllRead(this._getActionedOrganizer(ev));
};

/*
* Syncs an organizer to its feed (URL).
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmTreeController.prototype._syncListener =
function(ev) {
	this._doSync(this._getActionedOrganizer(ev));
};

/*
* Handles a drag event by setting the source data.
*
* @param ev		[DwtDragEvent]		a drag event
*/
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
};

/*
* Called when a dialog we opened is closed. Sets the style of the actioned
* tree item from "actioned" back to its normal state.
*/
ZmTreeController.prototype._popdownActionListener = 
function() {
	if (this._pendingActionData) return;

	var treeView = this.getTreeView(this._actionedOverviewId);
	if (this._actionedOrganizer && (treeView.getSelected() != this._actionedOrganizer)) {
		var ti = treeView.getTreeItemById(this._actionedOrganizer.id);
		if (ti)
			ti._setActioned(false);
	}
	this._actionedOrganizer = null;
	this._actionedOverviewId = null;
};

// Callbacks

/*
* Called when a "New ..." dialog is submitted to create the organizer.
*
* @param 0		[ZmOrganizer]	parent organizer
* @param 1		[string]		the name of the new organizer
*/
ZmTreeController.prototype._newCallback =
function(args) {
	this._doCreate(args[0], args[1], null, args[2]);
	this._clearDialog(this._getNewDialog());
};

/*
* Called when a "Rename ..." dialog is submitted to rename the organizer.
*
* @param 0		[ZmOrganizer]	the organizer
* @param 1		[string]		the new name of the organizer
*/
ZmTreeController.prototype._renameCallback =
function(args) {
	this._doRename(args[0], args[1]);
	this._clearDialog(this._getRenameDialog());
};

/*
* Called when a "Move To ..." dialog is submitted to move the organizer.
*
* @param 0		[ZmFolder]		the target folder
*/
ZmTreeController.prototype._moveCallback =
function(args) {
	this._doMove(this._pendingActionData, args[0]);
	this._clearDialog(this._appCtxt.getMoveToDialog());
};

/*
* Called if a user has agreed to go ahead and delete an organizer.
*
* @param organizer	[ZmOrganizer]	organizer to delete
*/
ZmTreeController.prototype._deleteShieldYesCallback =
function(organizer) {
	this._doDelete(organizer);
	this._clearDialog(this._deleteShield);
};

// Miscellaneous private methods

/*
* Returns the organizer that's currently selected for action (via right-click).
* Note: going up the object tree to find the actioned organizer will only work 
* for tree item events; it won't work for action menu item events, since action
* menus are children of the shell.
*
* @param ev		[DwtUiEvent]	the UI event
*/
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
};
