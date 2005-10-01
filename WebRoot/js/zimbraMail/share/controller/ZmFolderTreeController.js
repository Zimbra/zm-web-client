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
 * The Original Code is: Zimbra Collaboration Suite.
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
* Creates a folder tree controller.
* @constructor
* @class
* This class controls a tree display of folders.
*
* @author Conrad Damon
* @param appCtxt	[ZmAppCtxt]		app context
* @param type		[constant]*		type of organizer we are displaying/controlling (folder or search)
*/
function ZmFolderTreeController(appCtxt, type) {

	if (arguments.length == 0) return;

	type = type ? type : ZmOrganizer.FOLDER;
	// searches are not drop targets
	var dropTgt = (type == ZmOrganizer.FOLDER) ? new DwtDropTarget(ZmFolder, ZmConv, ZmMailMsg, ZmContact) : null;
	ZmTreeController.call(this, appCtxt, type, dropTgt);

	this._listeners[ZmOperation.NEW_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
}

ZmFolderTreeController.prototype = new ZmTreeController;
ZmFolderTreeController.prototype.constructor = ZmFolderTreeController;

// Public methods

ZmFolderTreeController.prototype.toString = 
function() {
	return "ZmFolderTreeController";
}

/**
* Enables/disables operations based on context.
*
* @param parent		[DwtControl]	the widget that contains the operations
* @param id			[int]			ID of the currently selected/activated organizer
*/
ZmFolderTreeController.prototype.resetOperations = 
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	// user folder or Folders header
	if (id == ZmOrganizer.ID_ROOT || (id >= ZmFolder.FIRST_USER_ID)) {
		parent.enableAll(true);
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
	var folder = this._dataTree.getById(id);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
	if (id != ZmOrganizer.ID_ROOT)
		parent.enable(ZmOperation.MARK_ALL_READ, (folder.numUnread > 0));

	var op = parent.getOp(ZmOperation.DELETE);
	if (op)
		op.setText(deleteText);
}

// Private methods

/*
* Returns ops available for "Folders" container.
*/
ZmFolderTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_FOLDER, ZmOperation.EXPAND_ALL];
}

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
			  ZmOperation.EXPAND_ALL);
	return list;
}

/*
* Underlying model is a folder tree.
*/
ZmFolderTreeController.prototype._getData =
function() {
	return this._appCtxt.getFolderTree();
}

/*
* Returns a "New Folder" dialog.
*/
ZmFolderTreeController.prototype._getNewDialog =
function() {
	return this._appCtxt.getNewFolderDialog();
}

/*
* Returns a "Rename Folder" dialog.
*/
ZmFolderTreeController.prototype._getRenameDialog =
function() {
	return this._appCtxt.getRenameFolderDialog();
}

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
		var stc = this._opc.getController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	} else {
		var searchController = this._appCtxt.getSearchController();
		var types = searchController.getTypes(ZmSearchToolBar.FOR_ANY_MI);
		searchController.search(folder.createQuery(), types);
	}
}

// Actions

/*
* Creates a new organizer and adds it to the tree of that type.
*
* @param parent		[ZmOrganizer]	parent of the new organizer
* @param name		[string]		name of the new organizer
* @param search		[ZmSearch]		search object (saved search creation only)
*/
ZmTreeController.prototype._doCreate =
function(params) {
	try {
		params.parent.create(params.name, params.search);
	} catch (ex) {
		this._handleException(ex, this._doCreate, params, false);
	}
}

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
	if (organizer.isInTrash()) {
		this._schedule(this._doDelete, {organizer: organizer});
	} else if (organizer.id == ZmFolder.ID_SPAM) {
		this._pendingActionData = organizer;
		if (!this._deleteShield) {
			this._deleteShield = new DwtMessageDialog(this._shell, null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
			this._deleteShield.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, organizer);
			this._deleteShield.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
		}
		this._deleteShield.setMessage(ZmMsg.confirmEmptyJunk, DwtMessageDialog.WARNING_STYLE);
		this._deleteShield.popup();
    } else {
		var trash = this._appCtxt.getFolderTree().getById(ZmFolder.ID_TRASH);
		this._schedule(this._doMove, {organizer: organizer, tgtFolder: trash});
	}
}

/*
* Don't allow dragging of system folders.
*
* @param ev		[DwtDragEvent]		the drag event
*/
ZmFolderTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var folder = ev.srcData = ev.srcControl.getData(Dwt.KEY_OBJECT);
		if (!((folder instanceof ZmFolder) && (folder.id >= ZmFolder.FIRST_USER_ID)))
			ev.operation = Dwt.DND_DROP_NONE;
	}
}

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
	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		var srcData = ev.srcData;
		var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
		if (srcData instanceof ZmFolder) {
			DBG.println(AjxDebug.DBG3, "DRAG_ENTER: " + srcData.name + " on to " + dropFolder.name);
			var dragFolder = srcData; // note that folders cannot be moved as a list
			ev.doIt = dropFolder.mayContain(dragFolder);
		} else if (srcData instanceof ZmTag) {
			ev.doIt = false; // tags cannot be moved
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
			this._schedule(this._doMove, {organizer: srcData, tgtFolder: dropFolder});
		} else {
			var data = srcData.data;
			var ctlr = srcData.controller;
			var items = (data instanceof Array) ? data : [data];
			ctlr._schedule(ctlr._doMove, {items: items, folder: dropFolder});
		}
	}
}

// Miscellaneous

/*
* Returns a title for moving a folder.
*/
ZmFolderTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxStringUtil.resolve(ZmMsg.moveFolder, this._pendingActionData.name);
}
