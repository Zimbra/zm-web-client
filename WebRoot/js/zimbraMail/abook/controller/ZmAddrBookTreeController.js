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

	this._listeners[ZmOperation.NEW_ADDRBOOK]	= this._newListener.bind(this);
	this._listeners[ZmOperation.SHARE_ADDRBOOK]	= this._shareAddrBookListener.bind(this);

	this._app = appCtxt.getApp(ZmApp.CONTACTS);
};

ZmAddrBookTreeController.prototype = new ZmFolderTreeController;
ZmAddrBookTreeController.prototype.constructor = ZmAddrBookTreeController;

ZmAddrBookTreeController.prototype.isZmAddrBookTreeController = true;
ZmAddrBookTreeController.prototype.toString = function() { return "ZmAddrBookTreeController"; };

// Public methods

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
	var isTrash = (nId == ZmFolder.ID_TRASH);

	var isDLs = (nId == ZmFolder.ID_DLS);

	this.setVisibleIfExists(parent, ZmOperation.EMPTY_FOLDER, nId == ZmFolder.ID_TRASH);

	if (isTrash) {
		parent.enableAll(false);
		parent.enable(ZmOperation.DELETE_WITHOUT_SHORTCUT, false);
		var hasContent = ((addrBook.numTotal > 0) || (addrBook.children && (addrBook.children.size() > 0)));
		parent.enable(ZmOperation.EMPTY_FOLDER,hasContent);
		parent.getOp(ZmOperation.EMPTY_FOLDER).setText(ZmMsg.emptyTrash);
	}
	else if (isDLs) {
		parent.enableAll(false);
	}
	else {
		parent.enableAll(true);        
		if (addrBook) {
			if (addrBook.isSystem()) {
				parent.enable([ZmOperation.DELETE_WITHOUT_SHORTCUT, ZmOperation.RENAME_FOLDER], false);
			} else if (addrBook.link) {
				parent.enable([ZmOperation.SHARE_ADDRBOOK], !addrBook.link || addrBook.isAdmin());
			}
			if (appCtxt.isOffline) {
				var acct = addrBook.getAccount();
				parent.enable([ZmOperation.SHARE_ADDRBOOK], !acct.isMain && acct.isZimbraAccount);
			}
		}
	}

	if (addrBook) {
		parent.enable(ZmOperation.EXPAND_ALL, (addrBook.size() > 0));
	}

	var op = parent.getOp(ZmOperation.DELETE_WITHOUT_SHORTCUT);
	if (op) {
		op.setText(deleteText);
	}
	this._enableRecoverDeleted(parent, isTrash);

	// we always enable sharing in case we're in multi-mbox mode
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_ADDRBOOK, appCtxt.get(ZmSetting.SHARING_ENABLED));
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

ZmAddrBookTreeController.prototype._getSearchTypes =
function(ev) {
	return [ZmItem.CONTACT];
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
			ZmOperation.DELETE_WITHOUT_SHORTCUT,
			ZmOperation.RENAME_FOLDER,
			ZmOperation.EDIT_PROPS,
			ZmOperation.EXPAND_ALL,
			ZmOperation.EMPTY_FOLDER,
			ZmOperation.RECOVER_DELETED_ITEMS);

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
	if (folder.id == ZmFolder.ID_DLS) {
		var request = {
			_jsns: "urn:zimbraAccount",
			"ownerOf": 1,
			attrs: "zimbraDistributionListUnsubscriptionPolicy,zimbraDistributionListSubscriptionPolicy"
		};

		var jsonObj = {GetAccountDistributionListsRequest: request};
		var respCallback = new AjxCallback(this, this._handleAccountDistributionListResponse, [folder]);
		appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
	}
	else if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	}
	else {
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
			var view = clc.getCurrentView();
			if (view) {
				view.getAlphabetBar().reset();
			}
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

/**
 * @private
 */
ZmAddrBookTreeController.prototype._handleAccountDistributionListResponse =
function(folder, result) {

	var contactList = new ZmContactList(null, true, ZmItem.CONTACT);
	var dls = result._data.GetAccountDistributionListsResponse.dl;
	if (dls) {
		for (var i = 0; i < dls.length; i++) {
			var dl = dls[i];
			var attrs = {email: dl.name, type: "group", zimbraId: dl.id, firstName: "", lastName: ""};
			attrs[ZmContact.F_dlDisplayName] = dl.d || dl.name;
			var dlInfo = { //this is minimal DL info, available mainly to allow to know whether to show the lock or not.
				isMember: dl.isMember,
				isOwner: dl.isOwner,
				subscriptionPolicy: dl._attrs.zimbraDistributionListSubscriptionPolicy,
				unsubscriptionPolicy: dl._attrs.zimbraDistributionListUnsubscriptionPolicy
			};

			contactList.addFromDom({_attrs: attrs,
									dlInfo: dlInfo,
									id: dl.id});
		}
	}
	var clc = AjxDispatcher.run("GetContactListController");
	clc.show(contactList, true, ZmFolder.ID_DLS);
};
