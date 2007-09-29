/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a folder tree controller.
* @constructor
* @class
* This class controls a tree display of folders.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
* @param type		[constant]*		type of organizer we are displaying/controlling (folder or search)
* @param dropTgt	[DwtDropTgt]	drop target for this type
*/
function ZmFolderTreeController(appCtxt, type, dropTgt) {

	if (arguments.length == 0) return;

	type = type ? type : ZmOrganizer.FOLDER;
	var list =[ZmFolder, ZmSearchFolder, ZmConv, ZmMailMsg];
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push(ZmContact);
	}
	dropTgt = dropTgt ? dropTgt : new DwtDropTarget(list);
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
};

ZmFolderTreeController.prototype = new ZmTreeController;
ZmFolderTreeController.prototype.constructor = ZmFolderTreeController;

// Public methods

ZmFolderTreeController.prototype.toString = 
function() {
	return "ZmFolderTreeController";
};

/**
* Displays a folder tree. Certain folders are hidden.
*
* @param overviewId		[constant]	overview ID
* @param showUnread		[boolean]*	if true, unread counts will be shown
* @param omit			[Object]*	hash of organizer IDs to ignore
* @param forceCreate	[boolean]*	if true, tree view will be created
* @param searchTypes	[hash]*		types of saved searches to show
*/
ZmFolderTreeController.prototype.show = 
function(overviewId, showUnread, omit, forceCreate, searchTypes) {
	for (var name in ZmFolder.HIDE) {
		var folder = this._dataTree.getByName(name);
		if (folder) {
			if (!omit) omit = {};
			omit[folder.id] = true;
		}
	}
	ZmTreeController.prototype.show.apply(this, [overviewId, showUnread, omit, forceCreate, searchTypes]);
};

/**
* Enables/disables operations based on context.
*
* @param parent		[DwtControl]	the widget that contains the operations
* @param id			[int]			ID of the currently selected/activated organizer
*/
ZmFolderTreeController.prototype.resetOperations = 
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var folder = this._dataTree.getById(id);
	// user folder or Folders header
	if (id == ZmOrganizer.ID_ROOT || ((!folder.isSystem()) && !folder.isSyncIssuesFolder())) {
		parent.enableAll(true);
		parent.enable(ZmOperation.SYNC, folder.isFeed());
	// system folder
	} else {
		parent.enableAll(false);
		// can't create folders under Drafts or Junk
		if (id == ZmFolder.ID_INBOX || id == ZmFolder.ID_SENT || id == ZmFolder.ID_TRASH)
			parent.enable(ZmOperation.NEW_FOLDER, true);
		// "Delete" for Junk and Trash is "Empty"
		if (id == ZmFolder.ID_SPAM || id == ZmFolder.ID_TRASH) {
			deleteText = (id == ZmFolder.ID_SPAM) ? ZmMsg.emptyJunk : ZmMsg.emptyTrash;
			parent.enable(ZmOperation.DELETE, true);
		}
	}
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
	if (id != ZmOrganizer.ID_ROOT)
		parent.enable(ZmOperation.MARK_ALL_READ, (folder.numUnread > 0));

	var op = parent.getOp(ZmOperation.DELETE);
	if (op)
		op.setText(deleteText);

    // are there any pop accounts associated to this folder?
    var button = parent.getOp(ZmOperation.SYNC);
    if (button) {
        button.setEnabled(true);
        button.setVisible(true);
        if (folder.isFeed()) {
            button.setText(ZmMsg.checkFeed);
        }
        else if (this._appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
            var prefsApp = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP);
            var dsCollection = prefsApp.getDataSourceCollection();
            var popAccounts = dsCollection.getPopAccountsFor(folder.id);
            if (popAccounts.length > 0) {
                button.setText(ZmMsg.checkPopMail);
            }
            else {
                button.setVisible(false);
            }
        }
        else {
            button.setVisible(false);
        }
    }
};

// Private methods

/*
* Returns ops available for "Folders" container.
*/
ZmFolderTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_FOLDER, ZmOperation.EXPAND_ALL];
};

/*
* Returns ops available for folder items.
*/
ZmFolderTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.NEW_FOLDER,
			ZmOperation.MARK_ALL_READ,
			ZmOperation.DELETE,
			ZmOperation.RENAME_FOLDER,
			ZmOperation.MOVE,
			ZmOperation.EXPAND_ALL,
			ZmOperation.SYNC];
};

/*
* Returns a "New Folder" dialog.
*/
ZmFolderTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewFolderDialog();
};

/*
* Returns a "Rename Folder" dialog.
*/
ZmFolderTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameFolderDialog();
};

/*
* Called when a left click occurs (by the tree view listener). The folder that
* was clicked may be a search, since those can appear in the folder tree. The
* appropriate search will be performed.
*
* @param folder		ZmOrganizer		folder or search that was clicked
*/
ZmFolderTreeController.prototype._itemClicked =
function(folder) {
	if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	} else {
		var searchController = this._appCtxt.getSearchController();
		var searchFor = ZmSearchToolBar.FOR_MAIL_MI;
		if (folder.isInTrash()) {
			var app = this._appCtxt.getAppController().getActiveApp();
			// if other apps add Trash to their folder tree, set appropriate type here:
			if (app == ZmZimbraMail.CONTACTS_APP)
				searchFor = ZmItem.CONTACT;
		}
		var types = searchController.getTypes(searchFor);
		searchController.search({query: folder.createQuery(), types: types});
	}
};

// Actions

/*
* Creates a new organizer and adds it to the tree of that type.
*
* @param parent		[ZmFolder]		parent of the new organizer
* @param name		[string]		name of the new organizer
* @param color		[constant]*		color of new folder
* @param url		[string]*		URL if folder is RSS/ATOM
* @param search		[ZmSearch]*		search object (saved search creation only)
*/
ZmFolderTreeController.prototype._doCreate =
function(parent, name, color, url, search) {
	parent.create(name, color, url, search);
};

ZmFolderTreeController.prototype._doSync = function(folder) {
    var prefsApp = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP);
    var dsCollection = prefsApp.getDataSourceCollection();
    var popAccounts = dsCollection.getPopAccountsFor(folder.id);

    if (popAccounts.length > 0) {
        dsCollection.importPopMailFor(folder.id);
    }
    else {
        ZmTreeController.prototype._doSync.call(this, folder);
    }
};

/*
* Makes a request to add a new item to the tree, returning true if the item was 
* actually added, or false if it was omitted.
* 
* @param treeView	[ZmTreeView]	a tree view
* @param parentNode	[DwtTreeItem]	node under which to add the new one
* @param organizer	[ZmOrganizer]	organizer for the new node
* @param index		[int]*			position at which to add the new node
 */
ZmFolderTreeController.prototype._addNew = 
function(treeView, parentNode, organizer, idx) {
	if (ZmFolder.HIDE[organizer.name]) {
		return false;
	}
	treeView._addNew(parentNode, organizer, idx);
	return true;
};

// Listeners

/*
* Deletes a folder. If the folder is in Trash, it is hard-deleted. Otherwise, it
* is moved to Trash (soft-delete). If the folder is Trash or Junk, it is emptied.
* A warning dialog will be shown before the Junk folder is emptied.
*
* @param ev		[DwtUiEvent]	the UI event
*/
ZmFolderTreeController.prototype._deleteListener = 
function(ev) {
	var organizer = this._getActionedOrganizer(ev);
	if (organizer.id == ZmFolder.ID_SPAM || organizer.isInTrash()) {
		this._pendingActionData = organizer;
		var ds = this._deleteShield = this._appCtxt.getYesNoCancelMsgDialog();
		ds.reset();
		ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
		ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
		var confirm = organizer.type == ZmOrganizer.SEARCH ? ZmMsg.confirmDeleteSavedSearch : ZmMsg.confirmEmptyFolder;
		var msg = AjxMessageFormat.format(confirm, organizer.getName());
		ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		ds.popup();
    } else {
		this._doMove(organizer, this._appCtxt.getTree(ZmOrganizer.FOLDER).getById(ZmFolder.ID_TRASH));
	}
};

/*
* Don't allow dragging of system folders.
*
* @param ev		[DwtDragEvent]		the drag event
*/
ZmFolderTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var folder = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!(folder instanceof ZmFolder) || folder.isSystem() || folder.isSyncIssuesFolder())
			ev.operation = Dwt.DND_DROP_NONE;
	}
};

/*
* Handles the potential drop of something onto a folder. When something is dragged over
* a folder, returns true if a drop would be allowed. When something is actually dropped,
* performs the move. If items are being dropped, the source data is not the items
* themselves, but an object with the items (data) and their controller, so they can be
* moved appropriately.
*
* @param ev		[DwtDropEvent]		the drop event
*/
ZmFolderTreeController.prototype._dropListener =
function(ev) {
	var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
	var srcData = ev.srcData;

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (srcData instanceof ZmFolder) {
			var dragFolder = srcData; // note that folders cannot be moved as a list
			ev.doIt = dropFolder.mayContain(dragFolder);
		} else if (srcData instanceof ZmTag) {
			ev.doIt = false; // tags cannot be moved
		} else {
			if (this._dropTgt.isValidTarget(srcData.data)) {
				ev.doIt = dropFolder.mayContain(srcData.data);

				var action = null;
				var plusDiv = null;
				var actionData = (!(srcData.data instanceof Array))
					? [srcData.data]
					: srcData.data;

				// walk thru the array and find out what action is allowed
				for (var i = 0; i < actionData.length; i++) {
					if (actionData[i] instanceof ZmItem)
						action |= actionData[i].getDefaultDndAction();
				}
				plusDiv = actionData.length == 1
					? ev.dndIcon.firstChild.nextSibling
					: ev.dndIcon.firstChild.nextSibling.nextSibling;

				if (action && plusDiv) {
					// TODO - what if action is ZmItem.DND_ACTION_BOTH ??
					var isCopy = ((action & ZmItem.DND_ACTION_COPY) != 0);
					Dwt.setVisibility(plusDiv, isCopy || dropFolder.link === true);
				}
			} else {
				ev.doIt = false;
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		if (srcData instanceof ZmFolder) {
			this._doMove(srcData, dropFolder);
		} else {
			var data = srcData.data;
			var ctlr = srcData.controller;
			var items = (data instanceof Array) ? data : [data];
			ctlr._doMove(items, dropFolder);
		}
	}
};

/*
* Handles a search folder being moved from Folders to Searches.
*
* @param ev				[ZmEvent]		a change event
* @param treeView		[ZmTreeView]	a tree view
* @param overviewId		[constant]		overview ID
*/
ZmFolderTreeController.prototype._changeListener =
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
			(organizer.parent.tree.type == ZmOrganizer.SEARCH || id == ZmOrganizer.ID_ROOT)) &&
		 	(ev.event == ZmEvent.E_MOVE || (ev.event == ZmEvent.E_MODIFY && (fields && fields[ZmOrganizer.F_PARENT])))) {
			DBG.println(AjxDebug.DBG3, "Moving search from Folders to Searches");
			if (node) {
				node.dispose();
			}
			this._checkTreeView(overviewId);
			// send a CREATE event to search tree controller to get it to add node
			var newEv = new ZmEvent(ZmEvent.S_SEARCH);
			newEv.set(ZmEvent.E_CREATE, organizer);
			var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
			var stv = stc.getTreeView(treeView.overviewId);
			var app = this._appCtxt.getAppController().getActiveApp();
			var searchOverviewId = [overviewId, ZmSearchTreeController.APP_JOIN_CHAR, app].join("");
			stc._changeListener(newEv, stv, searchOverviewId);
		} else {
			ZmTreeController.prototype._changeListener.call(this, ev, treeView, overviewId);
		}
	}
};

// Miscellaneous

/*
* Returns a title for moving a folder.
*/
ZmFolderTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveFolder, this._pendingActionData.name);
};
