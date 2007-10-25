/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates an address book tree controller.
 * @constructor
 * @class
 * This class is a controller for the tree view used by the address book 
 * application. This class uses the support provided by ZmOperation. 
 *
 * @author Parag Shah
 */
ZmAddrBookTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.ADDRBOOK);

	this._listeners[ZmOperation.NEW_ADDRBOOK] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_ADDRBOOK] = new AjxListener(this, this._shareAddrBookListener);
	this._listeners[ZmOperation.MOUNT_ADDRBOOK] = new AjxListener(this, this._mountAddrBookListener);
}

ZmAddrBookTreeController.prototype = new ZmFolderTreeController;
ZmAddrBookTreeController.prototype.constructor = ZmAddrBookTreeController;


// Public methods

ZmAddrBookTreeController.prototype.toString =
function() {
	return "ZmAddrBookTreeController";
};

ZmAddrBookTreeController.prototype.show =
function(params) {
	params.include = {};
	params.include[ZmFolder.ID_TRASH] = true;
	var treeView = ZmFolderTreeController.prototype.show.call(this, params);

	// contacts app has its own Trash folder so listen for change events
	var trash = this.getDataTree().getById(ZmFolder.ID_TRASH);
	if (trash) {
		trash.addChangeListener(new AjxListener(this, this._trashChangeListener, treeView));
	}

	return treeView;
};

ZmAddrBookTreeController.prototype._trashChangeListener =
function(treeView, ev) {
	var organizers = ev.getDetail("organizers");
	if (!organizers && ev.source) {
		organizers = [ev.source];
	}

	// handle one organizer at a time
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];

		if (organizer.id == ZmFolder.ID_TRASH &&
			ev.event == ZmEvent.E_MODIFY)
		{
			var fields = ev.getDetail("fields");
			if (fields && (fields[ZmOrganizer.F_TOTAL] || fields[ZmOrganizer.F_SIZE])) {
				var ti = treeView.getTreeItemById(organizer.id);
				if (ti) ti.setToolTipContent(organizer.getToolTip(true));
			}
		}
	}
};

// Enables/disables operations based on the given organizer ID
ZmAddrBookTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;

	if (id == ZmFolder.ID_TRASH) {
		parent.enableAll(false);
		parent.enable(ZmOperation.DELETE, true);
		deleteText = ZmMsg.emptyTrash;
	} else if (id == ZmOrganizer.ID_MY_CARD){
		parent.enableAll(false);
	} else {
		parent.enableAll(true);
		var addrBook = appCtxt.getById(id);
		if (addrBook) {
			if (addrBook.isSystem()) {
				parent.enable([ZmOperation.DELETE, ZmOperation.RENAME_FOLDER], false);
			} else if (addrBook.link) {
				parent.enable([ZmOperation.SHARE_ADDRBOOK], false);
			}
		}
	}

	var op = parent.getOp(ZmOperation.DELETE);
	if (op) {
		op.setText(deleteText);
	}
};


// Protected methods

ZmAddrBookTreeController.prototype._getDropTarget =
function() {
	return (new DwtDropTarget(["ZmContact"]));
};

ZmAddrBookTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[ZmOrganizer.SEARCH] = true;
	types[this.type] = true;
	return types;
};

// Returns a list of desired header action menu operations
ZmAddrBookTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [ZmOperation.NEW_ADDRBOOK, ZmOperation.MOUNT_ADDRBOOK];
};

// Returns a list of desired action menu operations
ZmAddrBookTreeController.prototype._getActionMenuOps =
function() {
	return [ZmOperation.SHARE_ADDRBOOK, ZmOperation.DELETE,
			ZmOperation.RENAME_FOLDER, ZmOperation.EDIT_PROPS];
};

/*
* Returns a title for moving a folder.
*/
ZmAddrBookTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveAddrBook, this._pendingActionData.name);
};

// Returns the dialog for organizer creation
ZmAddrBookTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewAddrBookDialog();
};

ZmAddrBookTreeController.prototype._getDropTarget =
function() {
	return (new DwtDropTarget(["ZmContact"]));
};


// Listeners

ZmAddrBookTreeController.prototype._shareAddrBookListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

ZmAddrBookTreeController.prototype._mountAddrBookListener =
function(ev) {
	appCtxt.getMountFolderDialog().popup(ZmOrganizer.ADDRBOOK);
};

/*
* Called when a left click occurs (by the tree view listener). The folder that
* was clicked may be a search, since those can appear in the folder tree. The
* appropriate search will be performed.
*
* @param folder		ZmOrganizer		folder or search that was clicked
*/
ZmAddrBookTreeController.prototype._itemClicked =
function(folder) {
	if (folder.id == ZmOrganizer.ID_MY_CARD) {
		var controller = AjxDispatcher.run("GetContactController");
		var contacts = AjxDispatcher.run("GetContacts");
		controller.show(contacts.getMyCard());
	} else if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	} else {
		var sc = appCtxt.getSearchController();
		sc.setDefaultSearchType(ZmItem.CONTACT);

		var capp = appCtxt.getApp(ZmApp.CONTACTS);

		// force a search if user clicked Trash folder or share
		if (folder.id == ZmFolder.ID_TRASH || folder.link) {
			var params = {
				query: folder.createQuery(),
				searchFor: ZmItem.CONTACT,
				fetch: true,
				sortBy: ZmSearch.NAME_ASC,
				callback: new AjxCallback(this, this._handleSearchResponse, [folder, capp])
			};
			sc.search(params);
		} else {
			capp.showFolder(folder);
		}

		if (folder.id != ZmFolder.ID_TRASH) {
			var clc = AjxDispatcher.run("GetContactListController");
			clc.getParentView().getAlphabetBar().reset();
		}
	}
};

ZmAddrBookTreeController.prototype._handleSearchResponse =
function(folder, capp, result) {
	// bug fix #19307 - Trash is special when in Contacts app since it
	// is a FOLDER type in ADDRBOOK tree. So reset selection if clicked
	if (folder.id == ZmFolder.ID_TRASH) {
		this._treeView[capp.getOverviewId()].setSelected(ZmFolder.ID_TRASH, true);
	}
};
