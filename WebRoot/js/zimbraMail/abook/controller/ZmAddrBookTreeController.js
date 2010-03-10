/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the address book tree controller class.
 * 
 */

/**
 * Creates an address book tree controller.
 * @class
 * This class is a controller for the tree view used by the address book 
 * application. This class uses the support provided by {@link ZmOperation}. 
 *
 * @author Parag Shah
 * 
 * @extends		ZmFolderTreeController
 */
ZmAddrBookTreeController = function() {

	ZmFolderTreeController.call(this, ZmOrganizer.ADDRBOOK);

	this._listeners[ZmOperation.NEW_ADDRBOOK] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.SHARE_ADDRBOOK] = new AjxListener(this, this._shareAddrBookListener);
	this._listeners[ZmOperation.MOUNT_ADDRBOOK] = new AjxListener(this, this._mountAddrBookListener);
    this._listeners[ZmOperation.BROWSE] = new AjxListener(this, function(){ appCtxt.getSearchController().fromBrowse(""); });

	this._app = appCtxt.getApp(ZmApp.CONTACTS);
};

ZmAddrBookTreeController.prototype = new ZmFolderTreeController;
ZmAddrBookTreeController.prototype.constructor = ZmAddrBookTreeController;


// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAddrBookTreeController.prototype.toString =
function() {
	return "ZmAddrBookTreeController";
};

/**
 * Shows the controller and returns the resulting tree view.
 * 
 * @param	{Hash}	params		 a hash of parameters
 * @return	{ZmTreeView}	the tree view
 */
ZmAddrBookTreeController.prototype.show =
function(params) {
	params.include = {};
	params.include[ZmFolder.ID_TRASH] = true;
    params.showUnread = false;
    var treeView = ZmFolderTreeController.prototype.show.call(this, params);

	// contacts app has its own Trash folder so listen for change events
	var trash = this.getDataTree().getById(ZmFolder.ID_TRASH);
	if (trash) {
		trash.addChangeListener(new AjxListener(this, this._trashChangeListener, treeView));
	}

	return treeView;
};

/**
 * @private
 */
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

/**
 * Enables/disables operations based on the given organizer ID.
 * 
 * @private
 */
ZmAddrBookTreeController.prototype.resetOperations =
function(parent, type, id) {
	var deleteText = ZmMsg.del;
	var addrBook = appCtxt.getById(id);
	var nId = addrBook ? addrBook.nId : ZmOrganizer.normalizeId(id);
    var hasContent = ((addrBook.numTotal > 0) || (addrBook.children && (addrBook.children.size() > 0)));

	if (nId == ZmFolder.ID_TRASH) {
		parent.enableAll(false);
        parent.enable(ZmOperation.DELETE, hasContent);
		deleteText = ZmMsg.emptyTrash;
	} else {
		parent.enableAll(true);
		if (addrBook) {
			if (addrBook.isSystem()) {
				parent.enable([ZmOperation.DELETE, ZmOperation.RENAME_FOLDER], false);
			} else if (addrBook.link) {
				parent.enable([ZmOperation.SHARE_ADDRBOOK], !addrBook.link || addrBook.isAdmin());
			}
		}
	}

	if (addrBook) {
		parent.enable(ZmOperation.EXPAND_ALL, (addrBook.size() > 0));
	}

	var op = parent.getOp(ZmOperation.DELETE);
	if (op) {
		op.setText(deleteText);
	}

	// we always enable sharing in case we're in multi-mbox mode
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_ADDRBOOK, appCtxt.get(ZmSetting.SHARING_ENABLED));
	this._resetButtonPerSetting(parent, ZmOperation.MOUNT_ADDRBOOK, appCtxt.get(ZmSetting.SHARING_ENABLED));
};


// Protected methods

/**
 * @private
 */
ZmAddrBookTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[ZmOrganizer.SEARCH] = true;
	types[this.type] = true;
	return types;
};

/**
 * Returns a list of desired header action menu operations.
 * 
 * @private
 */
ZmAddrBookTreeController.prototype._getHeaderActionMenuOps =
function() {
	var ops = [];
	if (appCtxt.get(ZmSetting.NEW_ADDR_BOOK_ENABLED)) {
		ops.push(ZmOperation.NEW_ADDRBOOK);
	}
	ops.push(ZmOperation.MOUNT_ADDRBOOK,
			ZmOperation.EXPAND_ALL,
			ZmOperation.BROWSE);
	return ops;
};

/**
 * Returns a list of desired action menu operations.
 * 
 * @private
 */
ZmAddrBookTreeController.prototype._getActionMenuOps =
function() {
	var ops = [];
	if (appCtxt.get(ZmSetting.NEW_ADDR_BOOK_ENABLED)) {
		ops.push(ZmOperation.NEW_ADDRBOOK);
	}
	ops.push(ZmOperation.SHARE_ADDRBOOK,
			ZmOperation.DELETE,
			ZmOperation.RENAME_FOLDER,
			ZmOperation.EDIT_PROPS,
			ZmOperation.EXPAND_ALL);

	return ops;
};

/**
 * Returns a title for moving a folder.
 * 
 * @private
 */
ZmAddrBookTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveAddrBook, this._pendingActionData.name);
};

/**
 * Returns the dialog for organizer creation.
 * 
 * @private
 */
ZmAddrBookTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewAddrBookDialog();
};


// Listeners

/**
 * @private
 */
ZmAddrBookTreeController.prototype._shareAddrBookListener = 
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

/**
 * @private
 */
ZmAddrBookTreeController.prototype._mountAddrBookListener =
function(ev) {
	appCtxt.getMountFolderDialog().popup(ZmOrganizer.ADDRBOOK);
};

/**
 * Called when a left click occurs (by the tree view listener). The folder that
 * was clicked may be a search, since those can appear in the folder tree. The
 * appropriate search will be performed.
 *
 * @param {ZmOrganizer}	folder		the folder or search that was clicked
 * 
 * @private
 */
ZmAddrBookTreeController.prototype._itemClicked =
function(folder) {
	if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	} else {
		var capp = appCtxt.getApp(ZmApp.CONTACTS);
		capp.currentSearch = null;
		var query = capp.currentQuery = folder.createQuery();
		var sc = appCtxt.getSearchController();
		sc.setDefaultSearchType(ZmItem.CONTACT);
		var acct = folder.getAccount();
		var params = {
			query: query,
			searchFor: ZmItem.CONTACT,
			fetch: true,
			sortBy: ZmSearch.NAME_ASC,
			callback: new AjxCallback(this, this._handleSearchResponse, [folder]),
			accountName: (acct && acct.name)
		};
		sc.search(params);

		if (folder.id != ZmFolder.ID_TRASH) {
			var clc = AjxDispatcher.run("GetContactListController");
			clc.getParentView().getAlphabetBar().reset();
		}
	}
};

/**
 * @private
 */
ZmAddrBookTreeController.prototype._handleSearchResponse =
function(folder, result) {
	// bug fix #19307 - Trash is special when in Contacts app since it
	// is a FOLDER type in ADDRBOOK tree. So reset selection if clicked
	if (folder.nId == ZmFolder.ID_TRASH) {
		this._treeView[this._app.getOverviewId()].setSelected(ZmFolder.ID_TRASH, true);
	}
};
