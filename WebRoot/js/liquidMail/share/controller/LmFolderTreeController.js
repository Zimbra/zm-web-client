function LmFolderTreeController(appCtxt, parent, tree) {

	var dropTgt = new DwtDropTarget(LmFolder, LmConv, LmMailMsg, LmContact);
	LmTreeController.call(this, appCtxt, parent, tree, dropTgt);

	this._listeners[LmOperation.NEW_FOLDER] = new LsListener(this, this._newListener);
	this._listeners[LmOperation.RENAME_FOLDER] = new LsListener(this, this._renameListener);
	this._listeners[LmOperation.RENAME_SEARCH] = new LsListener(this, this._renameListener);
	this._listeners[LmOperation.MODIFY_SEARCH] = new LsListener(this, this._modifySearchListener);
	this._listeners[LmOperation.EXPAND_ALL] = new LsListener(this, this._expandAllListener);
	this._listeners[LmOperation.MOVE] = new LsListener(this, this._moveListener);
}

LmFolderTreeController.prototype = new LmTreeController;
LmFolderTreeController.prototype.constructor = LmFolderTreeController;

// Public methods

LmFolderTreeController.prototype.toString = 
function() {
	return "LmFolderTreeController";
}

/**
* Renders the given list of system folders, and any subfolders.
*
* @param folders		IDs of top-level folders to display
* @returns				a handle to a tag tree controller, if one was created
*/
LmFolderTreeController.prototype.show = 
function(folders, showUnread) {
	this._setup();
	return this._treeView.set(this._appCtxt.getFolderTree(), folders, showUnread);
}

LmFolderTreeController.prototype.createSearchActionMenu = 
function(parent) {
   	var menuItems = this._getSearchActionMenuOps();
   	if (!menuItems) return;
	var actionMenu = new LmActionMenu(parent, menuItems);
	for (var i = 0; i < menuItems.length; i++)
		if (menuItems[i] > 0)
			actionMenu.addSelectionListener(menuItems[i], this._listeners[menuItems[i]]);
	actionMenu.addPopdownListener(new LsListener(this, this._popdownActionListener));

	return actionMenu;
}

// Override so we can create special menus for Folders and Search containers
LmFolderTreeController.prototype._setup = 
function() {
	LmTreeController.prototype._setup.call(this);
	if (!this._searchActionMenu)
		this._searchActionMenu = this.createSearchActionMenu(this._shell);
	if (!this._customActionMenu) {
		this._customActionMenu = new Object();
		this._customActionMenu[LmFolder.ID_USER] = this.createActionMenu(this._shell, 
													[LmOperation.NEW_FOLDER, LmOperation.EXPAND_ALL]);
		if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED))
			this._customActionMenu[LmFolder.ID_SEARCH] = this.createActionMenu(this._shell, [LmOperation.EXPAND_ALL]);
	}
}

/**
* Enables/disables operations based on context.
*
* @param parent		the widget that contains the operations
* @param id			the currently selected/activated organizer
*/
LmFolderTreeController.prototype.resetOperations = 
function(parent, id) {
	var deleteText = LmMsg.del;
	var folder = this._appCtxt.getFolderTree().getById(id);
	// user folder or Tags header
	if (id >= LmFolder.FIRST_USER_ID || id == LmFolder.ID_TAGS) {
		parent.enableAll(true);
	// system or fake folder
	} else {
		parent.enableAll(false);
		if (id == LmFolder.ID_INBOX || id == LmFolder.ID_SENT ||
			id == LmFolder.ID_TRASH || id == LmFolder.ID_USER)
			parent.enable(LmOperation.NEW_FOLDER, true);
		if (id == LmFolder.ID_SPAM || id == LmFolder.ID_TRASH) {
			deleteText = (id == LmFolder.ID_SPAM) ? LmMsg.emptyJunk : LmMsg.emptyTrash;
			parent.enable(LmOperation.DELETE, true);
		}
	}
	parent.enable(LmOperation.MARK_ALL_READ, (folder.numUnread > 0));
	parent.enable(LmOperation.EXPAND_ALL, (folder.size() > 0));
//	if (folder.type == LmOrganizer.SEARCH)
//		parent.enable(LmOperation.MODIFY_SEARCH, false);
	var op = parent.getOp(LmOperation.DELETE);
	if (op)
		op.setText(deleteText);
}

// Private methods

LmFolderTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(LmOperation.NEW_FOLDER,
			  LmOperation.MARK_ALL_READ,
			  LmOperation.DELETE,
			  LmOperation.RENAME_FOLDER,
			  LmOperation.MOVE,
			  LmOperation.EXPAND_ALL);
	return list;
}

LmFolderTreeController.prototype._getSearchActionMenuOps =
function() {
	var list = new Array();
	list.push( // LmOperation.MARK_ALL_READ, waiting for server implementation
			  LmOperation.DELETE,
			  LmOperation.RENAME_SEARCH,
//			  LmOperation.MODIFY_SEARCH,
			  LmOperation.MOVE,
			  LmOperation.EXPAND_ALL);
	return list;
}

LmFolderTreeController.prototype._createNewTreeView =
function() {
	return (new LmFolderTreeView(this._appCtxt, this.parent, this.tree, this._dragSrc, this._dropTgt));
}

LmFolderTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewFolderDialog();
}

LmFolderTreeController.prototype._getNewSearchDialog =
function() {
	return this._appCtxt.getNewSearchDialog();
}

LmFolderTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameFolderDialog();
}

// Listeners

LmFolderTreeController.prototype._treeViewListener =
function(ev) {
	this._actionedOrganizer = ev.item.getData(Dwt.KEY_OBJECT);
	var folder = this._actionedOrganizer;
	if (!(folder && folder instanceof LmFolder)) return;
	var id = ev.item.getData(Dwt.KEY_ID);
	if (id == LmFolder.ID_TAGS) return;
	if (ev.detail == DwtTree.ITEM_ACTIONED) {
		var actionMenu = this._customActionMenu[id] ? this._customActionMenu[id] :
						(folder.type == LmOrganizer.SEARCH) ? this._searchActionMenu : this._actionMenu;
		this.resetOperations(actionMenu, id);
		actionMenu.popup(0, ev.docX, ev.docY);
	} else if ((ev.detail == DwtTree.ITEM_SELECTED) && folder) {
		var searchController = this._appCtxt.getSearchController();
		// for now, click on folder searches for mail (except for Trash)
		var type = folder.isInTrash() ? LmSearchToolBar.FOR_ANY_MI : LmSearchToolBar.FOR_MAIL_MI;
		searchController.setDefaultSearchType(type);
		if (folder.type == LmOrganizer.SEARCH) {
			searchController.search(folder.query, folder.types, folder.sortBy);
		} else {
			searchController.search(folder.createQuery());
		}
	}
}

LmFolderTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	if (organizer.isInTrash() || 
		(organizer.id == LmFolder.ID_TRASH || organizer.id == LmFolder.ID_SPAM)) {
		this._schedule(this._doDelete, {organizer: organizer});
	} else {
		var trash = this._appCtxt.getFolderTree().getById(LmFolder.ID_TRASH);
		this._schedule(this._doMove, {srcFolder: organizer, tgtFolder: trash});
	}
}

LmFolderTreeController.prototype._moveListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	var moveToDialog = this._appCtxt.getMoveToDialog();
	this._showDialog(moveToDialog, this._moveCallback, this._pendingActionData);
	moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveToDialog);
	var title = LsStringUtil.resolve(LmMsg.moveFolder, this._pendingActionData.name);
	moveToDialog.setTitle(title);
}

LmFolderTreeController.prototype._expandAllListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	var ti = this._treeView.getTreeItemById(organizer.id);
	ti.setExpanded(true, true);
}

// Don't allow dragging of system folders
LmFolderTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var folder = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!((folder instanceof LmFolder) && (folder.id >= LmFolder.FIRST_USER_ID)))
			ev.operation = Dwt.DND_DROP_NONE;
	}
}

LmFolderTreeController.prototype._dropListener =
function(ev) {
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
		var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (srcData instanceof LmFolder) {
			DBG.println(LsDebug.DBG3, "DRAG_ENTER: " + srcData.name + " on to " + dropFolder.name);
			var dragFolder = srcData; // Note that folders can't be moved as a list.
			ev.doIt = dropFolder.mayContain(dragFolder);
		} else if (srcData instanceof LmTag) {
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
		DBG.println(LsDebug.DBG3, "DRAG_DROP: " + ev.srcData.name + " on to " + dropFolder.name);
		var srcData = ev.srcData;
		if (srcData instanceof LmFolder) {
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

LmFolderTreeController.prototype._moveCallback =
function(args) {
	this._schedule(this._doMove, {srcFolder: this._pendingActionData, tgtFolder: args[0]});
	this._clearDialog(this._appCtxt.getMoveToDialog());
}

LmFolderTreeController.prototype._newSearchCallback =
function(args) {
	this._schedule(this._doCreateSearch, {name: args[0], parent: args[1], search: args[2]});
	this._getNewSearchDialog().popdown();
}

// Actions

LmFolderTreeController.prototype._doMove =
function(params) {
	try {
		params.srcFolder.move(params.tgtFolder);
	} catch (ex) {
		this._handleException(ex, this._doMove, params, false);
	}
}

LmFolderTreeController.prototype._doCreateSearch =
function(params) {
	var parent = params.parent || this._appCtxt.getFolderTree().root;
	try {
		if (parent.type == LmOrganizer.SEARCH) {
			parent.create(params.name, params.search);
		} else if (parent.type == LmOrganizer.FOLDER) {
			var searchFolder = this._appCtxt.getFolderTree().getById(LmFolder.ID_SEARCH);
			searchFolder.create(params.name, params.search, parent.id);
		}
	} catch (ex) {
		this._handleException(ex, this._doCreateSearch, params, false);
	}
}
