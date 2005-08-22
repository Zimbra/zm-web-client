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

function ZmFolderTreeController(appCtxt, parent, tree) {

	var dropTgt = new DwtDropTarget(ZmFolder, ZmConv, ZmMailMsg, ZmContact);
	ZmTreeController.call(this, appCtxt, parent, tree, dropTgt);

	this._listeners[ZmOperation.NEW_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.RENAME_SEARCH] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.MODIFY_SEARCH] = new AjxListener(this, this._modifySearchListener);
	this._listeners[ZmOperation.EXPAND_ALL] = new AjxListener(this, this._expandAllListener);
	this._listeners[ZmOperation.MOVE] = new AjxListener(this, this._moveListener);
}

ZmFolderTreeController.prototype = new ZmTreeController;
ZmFolderTreeController.prototype.constructor = ZmFolderTreeController;

// Public methods

ZmFolderTreeController.prototype.toString = 
function() {
	return "ZmFolderTreeController";
}

/**
* Renders the given list of system folders, and any subfolders.
*
* @param folders		IDs of top-level folders to display
* @returns				a handle to a tag tree controller, if one was created
*/
ZmFolderTreeController.prototype.show = 
function(folders, showUnread) {
	this._setup();
	return this._treeView.set(this._appCtxt.getFolderTree(), folders, showUnread);
}

ZmFolderTreeController.prototype.createSearchActionMenu = 
function(parent) {
   	var menuItems = this._getSearchActionMenuOps();
   	if (!menuItems) return;
	var actionMenu = new ZmActionMenu(parent, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	actionMenu.addPopdownListener(new AjxListener(this, this._popdownActionListener));

	return actionMenu;
}

// Override so we can create special menus for Folders and Search containers
ZmFolderTreeController.prototype._setup = 
function() {
	ZmTreeController.prototype._setup.call(this);
	if (!this._searchActionMenu)
		this._searchActionMenu = this.createSearchActionMenu(this._shell);
	if (!this._customActionMenu) {
		this._customActionMenu = new Object();
		this._customActionMenu[ZmFolder.ID_USER] = this.createActionMenu(this._shell, 
													[ZmOperation.NEW_FOLDER, ZmOperation.EXPAND_ALL]);
		if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED))
			this._customActionMenu[ZmFolder.ID_SEARCH] = this.createActionMenu(this._shell, [ZmOperation.EXPAND_ALL]);
	}
}

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
ZmFolderTreeController.prototype.resetOperations = 
function(parent, id) {
	var deleteText = ZmMsg.del;
	var folder = this._appCtxt.getFolderTree().getById(id);
	// user folder or Tags header
	if (id >= ZmFolder.FIRST_USER_ID || id == ZmFolder.ID_TAGS) {
		parent.enableAll(true);
	// system or fake folder
	} else {
		parent.enableAll(false);
		if (id == ZmFolder.ID_INBOX || id == ZmFolder.ID_SENT ||
			id == ZmFolder.ID_TRASH || id == ZmFolder.ID_USER)
			parent.enable(ZmOperation.NEW_FOLDER, true);
		if (id == ZmFolder.ID_SPAM || id == ZmFolder.ID_TRASH) {
			deleteText = (id == ZmFolder.ID_SPAM) ? ZmMsg.emptyJunk : ZmMsg.emptyTrash;
			parent.enable(ZmOperation.DELETE, true);
		}
	}
	parent.enable(ZmOperation.MARK_ALL_READ, (folder.numUnread > 0));
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
//	if (folder.type == ZmOrganizer.SEARCH)
//		parent.enable(ZmOperation.MODIFY_SEARCH, false);
	var op = parent.getOp(ZmOperation.DELETE);
	if (op)
		op.setText(deleteText);
}

// Private methods

ZmFolderTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(ZmOperation.NEW_FOLDER,
			  ZmOperation.MARK_ALL_READ,
			  ZmOperation.DELETE,
			  ZmOperation.RENAME_FOLDER,
			  ZmOperation.MOVE,
			  ZmOperation.EXPAND_ALL);
	return list;
}

ZmFolderTreeController.prototype._getSearchActionMenuOps =
function() {
	var list = new Array();
	list.push( // ZmOperation.MARK_ALL_READ, waiting for server implementation
			  ZmOperation.DELETE,
			  ZmOperation.RENAME_SEARCH,
//			  ZmOperation.MODIFY_SEARCH,
			  ZmOperation.MOVE,
			  ZmOperation.EXPAND_ALL);
	return list;
}

ZmFolderTreeController.prototype._createNewTreeView =
function() {
	return (new ZmFolderTreeView(this._appCtxt, this.parent, this.tree, this._dragSrc, this._dropTgt));
}

ZmFolderTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewFolderDialog();
}

ZmFolderTreeController.prototype._getNewSearchDialog =
function() {
	return this._appCtxt.getNewSearchDialog();
}

ZmFolderTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameFolderDialog();
}

// Listeners

ZmFolderTreeController.prototype._treeViewListener =
function(ev) {
	this._actionedOrganizer = ev.item.getData(Dwt.KEY_OBJECT);
	var folder = this._actionedOrganizer;
	if (!(folder && folder instanceof ZmFolder)) return;
	var id = ev.item.getData(Dwt.KEY_ID);
	if (id == ZmFolder.ID_TAGS) return;
	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		var actionMenu = this._customActionMenu[id] ? this._customActionMenu[id] :
						(folder.type == ZmOrganizer.SEARCH) ? this._searchActionMenu : this._actionMenu;
		this.resetOperations(actionMenu, id);
		actionMenu.popup(0, ev.docX, ev.docY);
	} else if ((ev.detail == DwtTree.ITEM_SELECTED) && folder) {
		var searchController = this._appCtxt.getSearchController();
		// for now, click on folder searches for mail (except for Trash)
		var type = folder.isInTrash() ? ZmSearchToolBar.FOR_ANY_MI : ZmSearchToolBar.FOR_MAIL_MI;
		searchController.setDefaultSearchType(type);
		if (folder.type == ZmOrganizer.SEARCH) {
			searchController.search(folder.query, folder.types, folder.sortBy);
		} else {
			searchController.search(folder.createQuery());
		}
	}
}

ZmFolderTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	if (organizer.isInTrash() || 
		(organizer.id == ZmFolder.ID_TRASH || organizer.id == ZmFolder.ID_SPAM)) {
		this._schedule(this._doDelete, {organizer: organizer});
	} else {
		var trash = this._appCtxt.getFolderTree().getById(ZmFolder.ID_TRASH);
		this._schedule(this._doMove, {srcFolder: organizer, tgtFolder: trash});
	}
}

ZmFolderTreeController.prototype._moveListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var moveToDialog = this._appCtxt.getMoveToDialog();
	this._showDialog(moveToDialog, this._moveCallback, this._pendingActionData);
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
	var title = AjxStringUtil.resolve(ZmMsg.moveFolder, this._pendingActionData.name);
	moveToDialog.setTitle(title);
}

ZmFolderTreeController.prototype._expandAllListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var ti = this._treeView.getTreeItemById(organizer.id);
	ti.setExpanded(true, true);
}

// Don't allow dragging of system folders
ZmFolderTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var folder = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!((folder instanceof ZmFolder) && (folder.id >= ZmFolder.FIRST_USER_ID)))
			ev.operation = Dwt.DND_DROP_NONE;
	}
}

ZmFolderTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
		var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (srcData instanceof ZmFolder) {
			DBG.println(AjxDebug.DBG3, "DRAG_ENTER: " + srcData.name + " on to " + dropFolder.name);
			var dragFolder = srcData; // Note that folders can't be moved as a list.
			ev.doIt = dropFolder.mayContain(dragFolder);
		} else if (srcData instanceof ZmTag) {
			ev.doIt = false;
		} else {
			if (!this._dropTgt.isValidTarget(srcData.data)) {
				ev.doIt = false;
			} else {
				ev.doIt = dropFolder.mayContain(srcData.data);
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		DBG.println(AjxDebug.DBG3, "DRAG_DROP: " + ev.srcData.name + " on to " + dropFolder.name);
		var srcData = ev.srcData;
		if (srcData instanceof ZmFolder) {
			this._schedule(this._doMove, {srcFolder: srcData, tgtFolder: dropFolder});
		} else {
			var data = srcData.data;
			var ctlr = srcData.controller;
			var items = (data instanceof Array) ? data : [data];
			ctlr._schedule(ctlr._doMove, {items: items, folder: dropFolder});
		}
	} else if (ev.action == DwtDropEvent.DRAG_LEAVE || ev.action == DwtDropEvent.DRAG_OP_CHANGED) {
		// do nothing
	}
}

// Callbacks

ZmFolderTreeController.prototype._moveCallback =
function(args) {
	this._schedule(this._doMove, {srcFolder: this._pendingActionData, tgtFolder: args[0]});
	this._clearDialog(this._appCtxt.getMoveToDialog());
}

ZmFolderTreeController.prototype._newSearchCallback =
function(args) {
	this._schedule(this._doCreateSearch, {name: args[0], parent: args[1], search: args[2]});
	this._getNewSearchDialog().popdown();
}

// Actions

ZmFolderTreeController.prototype._doMove =
function(params) {
	try {
		params.srcFolder.move(params.tgtFolder);
	} catch (ex) {
		this._handleException(ex, this._doMove, params, false);
	}
}

ZmFolderTreeController.prototype._doCreateSearch =
function(params) {
	var parent = params.parent || this._appCtxt.getFolderTree().root;
	try {
		if (parent.type == ZmOrganizer.SEARCH) {
			parent.create(params.name, params.search);
		} else if (parent.type == ZmOrganizer.FOLDER) {
			var searchFolder = this._appCtxt.getFolderTree().getById(ZmFolder.ID_SEARCH);
			searchFolder.create(params.name, params.search, parent.id);
		}
	} catch (ex) {
		this._handleException(ex, this._doCreateSearch, params, false);
	}
}
