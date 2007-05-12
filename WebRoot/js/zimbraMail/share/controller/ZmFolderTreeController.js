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
	dropTgt = dropTgt ? dropTgt : this._getDropTarget(appCtxt);
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.SHARE_FOLDER] = new AjxListener(this, this._shareAddrBookListener);
	this._listeners[ZmOperation.MOUNT_FOLDER] = new AjxListener(this, this._mountAddrBookListener);
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
*/
ZmFolderTreeController.prototype.show = 
function(params) {
	var omit = params.omit || {};
	for (var id in ZmFolder.HIDE_ID) {
		omit[id] = true;		
	}
    var dataTree = this.getDataTree();
    for (var name in ZmFolder.HIDE_NAME) {
		var folder = dataTree.getByName(name);
		if (folder) {
			omit[folder.id] = true;
		}
	}
	params.omit = omit;
	ZmTreeController.prototype.show.call(this, params);
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
	var folder = this._appCtxt.getById(id);

	// user folder or Folders header
	if (id == ZmOrganizer.ID_ROOT || ((!folder.isSystem()) && !folder.isSyncIssuesFolder()))
	{
		parent.enableAll(true);
		parent.enable(ZmOperation.SYNC, folder.isFeed());
		parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.MOUNT_FOLDER], !folder.link);

		if (folder.isRemote() && folder.isReadOnly()) {
			if (folder.parent && folder.parent.isRemote()) {
				parent.enableAll(false);
			} else {
				parent.enable([ZmOperation.NEW_FOLDER, ZmOperation.MARK_ALL_READ], false);
			}
		}
	}
	// system folder
	else
	{
		parent.enableAll(false);
		// can't create folders under Drafts or Junk
		if (id == ZmFolder.ID_INBOX || id == ZmFolder.ID_SENT || id == ZmFolder.ID_TRASH)
			parent.enable(ZmOperation.NEW_FOLDER, true);
		// "Delete" for Junk and Trash is "Empty"
		if (id == ZmFolder.ID_SPAM || id == ZmFolder.ID_TRASH) {
			deleteText = (id == ZmFolder.ID_SPAM) ? ZmMsg.emptyJunk : ZmMsg.emptyTrash;
			parent.enable(ZmOperation.DELETE, true);
		}
		// only allow Inbox and Sent system folders to be share-able for now
		if (!folder.link && (id == ZmFolder.ID_INBOX || id == ZmFolder.ID_SENT))
			parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.MOUNT_FOLDER, ZmOperation.EDIT_PROPS], true);
	}

	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
	if (id != ZmOrganizer.ID_ROOT && !folder.isReadOnly())
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
        } else if (this._appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
            var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
            var popAccounts = dsCollection.getPopAccountsFor(folder.id);
            if (popAccounts.length > 0) {
                button.setText(ZmMsg.checkPopMail);
            } else {
                button.setVisible(false);
            }
        } else {
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
	return [ZmOperation.NEW_FOLDER, ZmOperation.MOUNT_FOLDER, ZmOperation.EXPAND_ALL];
};

/*
* Returns ops available for folder items.
*/
ZmFolderTreeController.prototype._getActionMenuOps =
function() {
	var list = new Array();
	list.push(ZmOperation.NEW_FOLDER,
			  ZmOperation.MARK_ALL_READ,
			  ZmOperation.DELETE,
			  ZmOperation.RENAME_FOLDER,
			  ZmOperation.MOVE,
			  ZmOperation.SHARE_FOLDER,
			  ZmOperation.EDIT_PROPS,
			  ZmOperation.EXPAND_ALL,
			  ZmOperation.SYNC);
	return list;
};

ZmFolderTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[ZmOrganizer.FOLDER] = true;
	types[ZmOrganizer.SEARCH] = true;
	return types;
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
			if (app == ZmApp.CONTACTS)
				searchFor = ZmItem.CONTACT;
		}
		var types = searchController.getTypes(searchFor);
		searchController.search({query: folder.createQuery(), types: types});
	}
};

// override this method if you want different drop targets
ZmFolderTreeController.prototype._getDropTarget =
function(appCtxt) {
	var list = ["ZmFolder", "ZmSearchFolder"];
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		list.push("ZmMailMsg");
		list.push("ZmConv");
	}
	return (new DwtDropTarget(list));
};


// Actions

ZmFolderTreeController.prototype._doSync =
function(folder) {
    var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
    var popAccounts = dsCollection.getPopAccountsFor(folder.id);

    if (popAccounts.length > 0) {
        dsCollection.importPopMailFor(folder.id);
    }
    else {
        ZmTreeController.prototype._doSync.call(this, folder);
    }
};

/*
* Makes a request to add a new item to the tree.
* 
* @param treeView	[ZmTreeView]	a tree view
* @param parentNode	[DwtTreeItem]	node under which to add the new one
* @param organizer	[ZmOrganizer]	organizer for the new node
* @param index		[int]*			position at which to add the new node
 */
ZmFolderTreeController.prototype._addNew = 
function(treeView, parentNode, organizer, idx) {
	if (ZmFolder.HIDE_ID[organizer.id]) {
		return false;
	}
	return treeView._addNew(parentNode, organizer, idx);
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
		var ds = this._deleteShield = this._appCtxt.getOkCancelMsgDialog();
		ds.reset();
		ds.registerCallback(DwtDialog.OK_BUTTON, this._deleteShieldYesCallback, this, organizer);
		ds.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._deleteShield);
		var confirm = organizer.type == ZmOrganizer.SEARCH ? ZmMsg.confirmDeleteSavedSearch : ZmMsg.confirmEmptyFolder;
		var msg = AjxMessageFormat.format(confirm, organizer.getName());
		ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		ds.popup();
    } else {
		this._doMove(organizer, this._appCtxt.getById(ZmFolder.ID_TRASH));
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
		var type = ev.targetControl.getData(ZmTreeView.KEY_TYPE);
		if (srcData instanceof ZmFolder) {
			var dragFolder = srcData; // note that folders cannot be moved as a list
			ev.doIt = dropFolder.mayContain(dragFolder, type);
		} else if (srcData instanceof ZmTag) {
			ev.doIt = false; // tags cannot be moved
		} else {
			if (this._dropTgt.isValidTarget(srcData.data)) {
				ev.doIt = dropFolder.mayContain(srcData.data, type);

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
					Dwt.setVisibility(plusDiv, isCopy || dropFolder.isRemote());
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

ZmFolderTreeController.prototype._shareAddrBookListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	this._appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmFolderTreeController.prototype._mountAddrBookListener =
function(ev) {
	this._appCtxt.getMountFolderDialog().popup(ZmOrganizer.FOLDER);
};


// Miscellaneous

/*
* Returns a title for moving a folder.
*/
ZmFolderTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveFolder, this._pendingActionData.name);
};
