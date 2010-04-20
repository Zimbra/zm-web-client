/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * 
 * This file defines a folder tree controller.
 *
 */

/**
 * Creates a folder tree controller.
 * @class
 * This class controls a tree display of folders.
 *
 * @param {Constant}	type			the type of organizer we are displaying/controlling ({@link ZmOrganizer.FOLDER} or {@link ZmOrganizer.SEARCH})
 * @param {DwtDropTarget}		dropTgt		the drop target for this type
 * 
 * @extends		ZmTreeController
 */
ZmFolderTreeController = function(type, dropTgt) {

	if (arguments.length == 0) { return; }

	ZmTreeController.call(this, (type || ZmOrganizer.FOLDER));

	this._listeners[ZmOperation.NEW_FOLDER] = new AjxListener(this, this._newListener);
	this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
	this._listeners[ZmOperation.SHARE_FOLDER] = new AjxListener(this, this._shareFolderListener);
	this._listeners[ZmOperation.MOUNT_FOLDER] = new AjxListener(this, this._mountFolderListener);
	this._listeners[ZmOperation.EMPTY_FOLDER] = new AjxListener(this, this._emptyListener);
	this._listeners[ZmOperation.SYNC_OFFLINE_FOLDER] = new AjxListener(this, this._syncOfflineFolderListener);
	this._listeners[ZmOperation.BROWSE] = new AjxListener(this, this._browseListener);
};

ZmFolderTreeController.prototype = new ZmTreeController;
ZmFolderTreeController.prototype.constructor = ZmFolderTreeController;

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmFolderTreeController.prototype.toString =
function() {
	return "ZmFolderTreeController";
};

/**
 * Shows the folder tree with certain folders hidden.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param	{Array}	params.omit		an array of folder ids to omit
 * @param	{ZmAccount}	params.account		the account
 */
ZmFolderTreeController.prototype.show =
function(params) {
	var omit = params.omit || {};
	for (var id in ZmFolder.HIDE_ID) {
		omit[id] = true;
	}
	var dataTree = this.type != ZmOrganizer.VOICE && this.getDataTree(params.account);
	if (dataTree) {
	    for (var name in ZmFolder.HIDE_NAME) {
			var folder = dataTree.getByName(name);
			if (folder) {
				omit[folder.id] = true;
			}
		}
	}
	params.omit = omit;
	return ZmTreeController.prototype.show.call(this, params);
};

/**
* Resets and enables/disables operations based on context.
*
* @param {DwtControl}	parent		the widget that contains the operations
* @param {int}			id			the id of the currently selected/activated organizer
*/
ZmFolderTreeController.prototype.resetOperations =
function(parent, type, id) {

	var emptyText = ZmMsg.emptyFolder; //ZmMsg.empty + (ZmFolder.MSG_KEY[id]?" "+ZmFolder.MSG_KEY[id] : "");
	var folder = appCtxt.getById(id);
	var hasContent = ((folder.numTotal > 0) || (folder.children && (folder.children.size() > 0)));

	// user folder or Folders header
	var nId = ZmOrganizer.normalizeId(id, this.type);
	if (nId == ZmOrganizer.ID_ROOT || ((!folder.isSystem()) && !folder.isSyncIssuesFolder())) {
		var isShareVisible = (!folder.link || folder.isAdmin());
		parent.enableAll(true);
		parent.enable(ZmOperation.SYNC, folder.isFeed()/* || folder.hasFeeds()*/);
		parent.enable(ZmOperation.SYNC_ALL, folder.isFeed() || folder.hasFeeds());
		parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.MOUNT_FOLDER], isShareVisible);
		parent.enable(ZmOperation.EMPTY_FOLDER, (hasContent || folder.link));	// numTotal is not set for shared folders
		parent.enable(ZmOperation.RENAME_FOLDER, !folder.isDataSource());		// dont allow datasource'd folder to be renamed via overview
		parent.enable(ZmOperation.NEW_FOLDER, !folder.disallowSubFolder);

		if (folder.isRemote() && folder.isReadOnly()) {
			parent.enable([ZmOperation.NEW_FOLDER, ZmOperation.MARK_ALL_READ, ZmOperation.EMPTY_FOLDER], false);
		}
	}
	// system folder
	else {
		parent.enableAll(false);
		// can't create folders under Drafts or Junk
		if (!folder.disallowSubFolder &&
			(nId == ZmFolder.ID_INBOX ||
			 nId == ZmFolder.ID_SENT  ||
			 nId == ZmFolder.ID_TRASH))
		{
			parent.enable(ZmOperation.NEW_FOLDER, true);
		}
		// "Empty" for Chats, Junk and Trash
		if (nId == ZmFolder.ID_SPAM ||
			nId == ZmFolder.ID_TRASH ||
			nId == ZmFolder.ID_CHATS)
		{
			if (nId == ZmFolder.ID_SPAM) {
				emptyText = ZmMsg.emptyJunk;
			} else if (nId == ZmFolder.ID_TRASH) {
				 emptyText = ZmMsg.emptyTrash;
			}
			parent.enable(ZmOperation.EMPTY_FOLDER, hasContent);
		}
		// only allow Inbox and Sent system folders to be share-able for now
		if (!folder.link && (nId == ZmFolder.ID_INBOX || nId == ZmFolder.ID_SENT)) {
			parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.MOUNT_FOLDER, ZmOperation.EDIT_PROPS], true);
		}
		// bug fix #30435 - enable empty folder for sync failures folder
		if (appCtxt.isOffline && nId == ZmOrganizer.ID_SYNC_FAILURES && hasContent) {
			parent.enable(ZmOperation.EMPTY_FOLDER, true);
		}
	}

	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
	if (nId != ZmOrganizer.ID_ROOT && !folder.isReadOnly()) {
		// always enable for shared folders since we dont get this info from server
		parent.enable(ZmOperation.MARK_ALL_READ, (folder.numUnread > 0 || folder.link));
	}

	var op = parent.getOp(ZmOperation.EMPTY_FOLDER);
	if (op) {
		op.setText(emptyText);
	}

    var isTrash = (nId == ZmOrganizer.ID_TRASH);
	// are there any external accounts associated to this folder?
	var button = parent.getOp(ZmOperation.SYNC);
	if (button) {
		var syncAllButton = parent.getOp(ZmOperation.SYNC_ALL);
		var hasFeeds = folder.hasFeeds();
		if (folder.isFeed()) {
			button.setEnabled(true);
			button.setVisible(true);
			button.setText(ZmMsg.checkFeed);
			if (syncAllButton) {
				syncAllButton.setEnabled(true);
				syncAllButton.setVisible(true);
				syncAllButton.setText(ZmMsg.checkAllFeed);
			}
		}
		else if (hasFeeds && !isTrash) {
			if (syncAllButton){
				syncAllButton.setEnabled(true);
				syncAllButton.setVisible(true);
				syncAllButton.setText(ZmMsg.checkAllFeed);
			}
		}
		else {
			var isEnabled = appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED);
			if (!appCtxt.isOffline && isEnabled) {
				var dsCollection = AjxDispatcher.run("GetDataSourceCollection");
				var dataSources = dsCollection.getItemsFor(ZmOrganizer.normalizeId(folder.id));
				if (dataSources.length > 0) {
					button.setText(ZmMsg.checkExternalMail);
					button.setEnabled(true);
					button.setVisible(true);
				} else {
					button.setVisible(false);
				}
			}
			else {
				button.setVisible(false);
			}

			if ((!hasFeeds || isTrash) && syncAllButton) {
				syncAllButton.setVisible(false);
			}
		}
	}

	button = parent.getOp(ZmOperation.SYNC_OFFLINE_FOLDER);
	if (button) {
		if (!folder.isOfflineSyncable || isTrash) {
			button.setVisible(false);
		} else {
			button.setVisible(true);
			button.setEnabled(true);
			var text = (folder.isOfflineSyncing)
				? ZmMsg.syncOfflineFolderOff : ZmMsg.syncOfflineFolderOn;
			button.setText(text);
		}
	}
	parent.enable(ZmOperation.BROWSE, true);

	// we always enable sharing in case we're in multi-mbox mode
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_FOLDER, appCtxt.get(ZmSetting.SHARING_ENABLED));
	this._resetButtonPerSetting(parent, ZmOperation.MOUNT_FOLDER, appCtxt.get(ZmSetting.SHARING_ENABLED));
};


// Private methods

/**
 * Returns ops available for "Folders" container.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getHeaderActionMenuOps =
function() {
	return [
		ZmOperation.NEW_FOLDER,
		ZmOperation.MOUNT_FOLDER,
		ZmOperation.EXPAND_ALL,
		ZmOperation.SYNC,
		ZmOperation.BROWSE
	];
};

/**
 * Returns ops available for folder items.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getActionMenuOps =
function() {
	return [
		ZmOperation.NEW_FOLDER,
		ZmOperation.MARK_ALL_READ,
		ZmOperation.DELETE,
		ZmOperation.RENAME_FOLDER,
		ZmOperation.MOVE,
		ZmOperation.SHARE_FOLDER,
		ZmOperation.EDIT_PROPS,
		ZmOperation.EXPAND_ALL,
		ZmOperation.SYNC,
		ZmOperation.SYNC_ALL,
		ZmOperation.EMPTY_FOLDER,
		ZmOperation.SYNC_OFFLINE_FOLDER
	];
};

/**
 * @private
 */
ZmFolderTreeController.prototype._getAllowedSubTypes =
function() {
	var types = {};
	types[ZmOrganizer.FOLDER] = true;
	types[ZmOrganizer.SEARCH] = true;
	return types;
};

/**
 * Returns a "New Folder" dialog.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getNewDialog =
function() {
	return appCtxt.getNewFolderDialog();
};

/**
 * Returns a "Rename Folder" dialog.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getRenameDialog =
function() {
	return appCtxt.getRenameFolderDialog();
};

/**
 * Called when a left click occurs (by the tree view listener). The folder that
 * was clicked may be a search, since those can appear in the folder tree. The
 * appropriate search will be performed.
 *
 * @param {ZmOrganizer}		folder		the folder or search that was clicked
 * 
 * @private
 */
ZmFolderTreeController.prototype._itemClicked =
function(folder) {
	// bug 41196 - turn off new mail notifier if inactive account folder clicked
	if (appCtxt.isOffline) {
		var acct = folder.getAccount();
		if (acct && acct.inNewMailMode) {
			acct.inNewMailMode = false;
			appCtxt.getApp(ZmApp.MAIL).getOverviewContainer().updateAccountInfo(acct, true, true);
		}
	}

	if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder);
	} else if (folder.id == ZmFolder.ID_ATTACHMENTS) {
		var attController = AjxDispatcher.run("GetAttachmentsController");
		attController.show();
	} else {
		var searchFor = ZmId.SEARCH_MAIL;
		if (folder.isInTrash()) {
			var app = appCtxt.getCurrentAppName();
			// if other apps add Trash to their folder tree, set appropriate type here:
			if (app == ZmApp.CONTACTS) {
				searchFor = ZmItem.CONTACT;
			}
		}
		var sc = appCtxt.getSearchController();
		var acct = folder.getAccount();

		var params = {
			query: folder.createQuery(),
			searchFor: searchFor,
			getHtml: (folder.nId == ZmFolder.ID_DRAFTS) || appCtxt.get(ZmSetting.VIEW_AS_HTML),
			types: ((folder.nId == ZmOrganizer.ID_SYNC_FAILURES) ? [ZmItem.MSG] : null), // for Sync Failures folder, always show in traditional view
			sortBy: ((sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : ZmSearch.DATE_DESC),
			accountName: (acct && acct.name)
		};

		sc.resetSearchAllAccounts();

		if (appCtxt.multiAccounts) {
			// make sure we have permissions for this folder (in case an "external"
			// server was down during account load)
			if (folder.link && folder.perm == null) {
				var folderTree = appCtxt.getFolderTree(acct);
				if (folderTree) {
					var callback = new AjxCallback(this, this._getPermissionsResponse, [params]);
					folderTree.getPermissions({callback:callback, folderIds:[folder.id]});
				}
				return;
			}

			if (appCtxt.isOffline && acct.hasNotSynced() && !acct.__syncAsked) {
				acct.__syncAsked = true;

				var dialog = appCtxt.getYesNoMsgDialog();
				dialog.registerCallback(DwtDialog.YES_BUTTON, this._syncAccount, this, [dialog, acct]);
				dialog.setMessage(ZmMsg.neverSyncedAsk, DwtMessageDialog.INFO_STYLE);
				dialog.popup();
			}
		}

		sc.search(params);
	}
};

/**
 * @private
 */
ZmFolderTreeController.prototype._syncAccount =
function(dialog, account) {
	dialog.popdown();
	account.sync();
};

/**
 * @private
 */
ZmFolderTreeController.prototype._getPermissionsResponse =
function(params) {
	appCtxt.getSearchController().search(params);
};


// Actions

/**
 * @private
 */
ZmFolderTreeController.prototype._doSync =
function(folder) {
	var dsc = AjxDispatcher.run("GetDataSourceCollection");
	var nFid = ZmOrganizer.normalizeId(folder.id);
	var dataSources = dsc.getItemsFor(nFid);

	if (dataSources.length > 0) {
		dsc.importMailFor(nFid);
	}
	else {
		ZmTreeController.prototype._doSync.call(this, folder);
	}
};

/**
 * @private
 */
ZmFolderTreeController.prototype._syncFeeds =
function(folder) {
	if (!appCtxt.isOffline && folder && !folder.isFeed()) {
		var dataSources = (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED) || appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED))
			? folder.getDataSources(null, true) : null;

		if (dataSources) {
			var dsc = AjxDispatcher.run("GetDataSourceCollection");
			dsc.importMail(dataSources);
			return;
		}
	}

	ZmTreeController.prototype._syncFeeds.call(this, folder);
};

/**
 * Adds the new item to the tree.
 *
 * @param {ZmTreeView}		treeView		a tree view
 * @param {DwtTreeItem}		parentNode		the node under which to add the new one
 * @param {ZmOrganizer}		organizer		the organizer for the new node
 * @param {int}				idx				theposition at which to add the new node
 * @return	{DwtTreeItem}	the resulting item
 * 
 * @private
 */
ZmFolderTreeController.prototype._addNew =
function(treeView, parentNode, organizer, idx) {
	if (ZmFolder.HIDE_ID[organizer.id]) {
		return false;
	}
	return treeView._addNew(parentNode, organizer, idx);
};

// Listeners

/**
 * Deletes a folder. If the folder is in Trash, it is hard-deleted. Otherwise, it
 * is moved to Trash (soft-delete). If the folder is Trash or Junk, it is emptied.
 * A warning dialog will be shown before the Junk folder is emptied.
 *
 * @param {DwtUiEvent}	ev		the UI event
 * 
 * @private
 */
ZmFolderTreeController.prototype._deleteListener =
function(ev) {
	var organizer = this._getActionedOrganizer(ev);

	// bug fix #35405 - accounts with disallowSubFolder flag set cannot be moved to Trash
	var trashFolder = appCtxt.isOffline ? this.getDataTree().getById(ZmFolder.ID_TRASH) : null;
	if (trashFolder && trashFolder.disallowSubFolder && organizer.numTotal > 0) {
		var d = appCtxt.getMsgDialog();
		d.setMessage(ZmMsg.errorCannotDeleteFolder);
		d.popup();
		return;
	}

	if (organizer.nId == ZmFolder.ID_SPAM || organizer.isInTrash() || (trashFolder && trashFolder.disallowSubFolder)) {
		this._pendingActionData = organizer;
		var ds = this._deleteShield = appCtxt.getOkCancelMsgDialog();
		ds.reset();
		ds.registerCallback(DwtDialog.OK_BUTTON, this._deleteShieldYesCallback, this, organizer);
		ds.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._deleteShield);
		var confirm;
		if (organizer.type == ZmOrganizer.SEARCH) {
			confirm = ZmMsg.confirmDeleteSavedSearch;
		} else if (organizer.disallowSubFolder || organizer.isMountpoint) {
			confirm = ZmMsg.confirmDeleteFolder;
		} else if (organizer.nId == ZmFolder.ID_TRASH) {
			confirm = ZmMsg.confirmEmptyTrashFolder;
		} else {
			confirm = ZmMsg.confirmEmptyFolder;
		}
		var msg = AjxMessageFormat.format(confirm, organizer.getName());
		ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		ds.popup();
	} else {
		this._doMove(organizer, appCtxt.getById(ZmFolder.ID_TRASH));
	}
};

/**
 * Empties a folder.
 * It removes all the items in the folder except sub-folders.
 * If the folder is Trash, it empties even the sub-folders.
 * A warning dialog will be shown before any folder is emptied.
 *
 * @param {DwtUiEvent}		ev		the UI event
 * 
 * @private
 */
ZmFolderTreeController.prototype._emptyListener =
function(ev) {
	var organizer = this._pendingActionData = this._getActionedOrganizer(ev);
	var ds = this._emptyShield = appCtxt.getOkCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.OK_BUTTON, this._emptyShieldYesCallback, this, organizer);
	ds.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._emptyShield);
	var msg = (organizer.nId != ZmFolder.ID_TRASH)
		? (AjxMessageFormat.format(ZmMsg.confirmEmptyFolder, organizer.getName()))
		: ZmMsg.confirmEmptyTrashFolder;
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);

	var focusButtonId = (organizer.nId == ZmFolder.ID_TRASH || organizer.nId == ZmFolder.ID_SPAM) ?  DwtDialog.OK_BUTTON : DwtDialog.CANCEL_BUTTON;
	ds.associateEnterWithButton(focusButtonId);
	ds.popup(null, focusButtonId);

	if (!(organizer.nId == ZmFolder.ID_SPAM || organizer.isInTrash())) {
		var cancelButton = ds.getButton(DwtDialog.CANCEL_BUTTON);
		cancelButton.focus();
	}
};

/**
 * Toggles on/off flag for syncing IMAP folder with server. Only for offline use.
 *
 * @param {DwtUiEvent}	ev	the UI event
 * 
 * @private
 */
ZmFolderTreeController.prototype._syncOfflineFolderListener =
function(ev) {
	var folder = this._getActionedOrganizer(ev);
	if (folder) {
		folder.toggleSyncOffline();
	}
};

/**
 * @private
 */
ZmFolderTreeController.prototype._browseListener =
function(ev){
	var folder = this._getActionedOrganizer(ev);
	if (folder) {
		AjxDispatcher.require("Browse");
		appCtxt.getSearchController().showBrowsePickers([ZmPicker.FOLDER]);
	}
};

/**
 * Don't allow dragging of system folders.
 *
 * @param {DwtDragEvent}	ev		the drag event
 * 
 * @private
 */
ZmFolderTreeController.prototype._dragListener =
function(ev) {
	if (ev.action == DwtDragEvent.DRAG_START) {
		var folder = ev.srcControl.getData(Dwt.KEY_OBJECT);
		ev.srcData = {data:folder, controller:this};
		if (!(folder instanceof ZmFolder) || folder.isSystem() || folder.isSyncIssuesFolder()) {
			ev.operation = Dwt.DND_DROP_NONE;
		}
	}
};

/**
 * Handles the potential drop of something onto a folder. When something is dragged over
 * a folder, returns true if a drop would be allowed. When something is actually dropped,
 * performs the move. If items are being dropped, the source data is not the items
 * themselves, but an object with the items (data) and their controller, so they can be
 * moved appropriately.
 *
 * @param {DwtDropEvent}	ev		the drop event
 * 
 * @private
 */
ZmFolderTreeController.prototype._dropListener =
function(ev) {

	var dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
	var data = ev.srcData.data;
	var isShiftKey = (ev.shiftKey || ev.uiEvent.shiftKey);

	if (ev.action == DwtDropEvent.DRAG_ENTER) {
		if (!data) {
			ev.doIt = false;
			return;
		}
		var type = ev.targetControl.getData(ZmTreeView.KEY_TYPE);
		if (data instanceof ZmFolder) {
			ev.doIt = dropFolder.mayContain(data, type) && !dropFolder.disallowSubFolder;
		} else if (data instanceof ZmTag) {
			ev.doIt = false; // tags cannot be moved
		} else {
			if (this._dropTgt.isValidTarget(data)) {
				ev.doIt = dropFolder.mayContain(data, type);

				var action;
				var actionData = AjxUtil.toArray(data);

				// walk thru the array and find out what action is allowed
				for (var i = 0; i < actionData.length; i++) {
					if (actionData[i] instanceof ZmItem) {
						action |= actionData[i].getDefaultDndAction(isShiftKey);
					}
				}

				var plusDiv = document.getElementById(DwtId.DND_PLUS_ID);
				if (action && plusDiv) {
					// TODO - what if action is ZmItem.DND_ACTION_BOTH ??
					var isCopy = ((action & ZmItem.DND_ACTION_COPY) != 0);
					Dwt.setVisibility(plusDiv, isCopy);
				}
			} else {
				ev.doIt = false;
			}
		}
	} else if (ev.action == DwtDropEvent.DRAG_DROP) {
		if (data instanceof ZmFolder) {
			this._doMove(data, dropFolder);
		} else {
			var ctlr = ev.srcData.controller;
			var items = (data instanceof Array) ? data : [data];
			if (appCtxt.multiAccounts && !isShiftKey && !dropFolder.getAccount().isMain &&
				this._isMovingAcrossAccount(items, dropFolder))
			{
				var dialog = appCtxt.getYesNoMsgDialog();
				dialog.registerCallback(DwtDialog.YES_BUTTON, this._continueMovingAcrossAccount, this, [dialog, ctlr, items, dropFolder]);
				dialog.setMessage(ZmMsg.moveAcrossAccountWarning, DwtMessageDialog.WARNING_STYLE);
				dialog.popup();
			}
			else {
				ctlr._doMove(items, dropFolder, null, isShiftKey);
			}
		}
	}
};

ZmFolderTreeController.prototype._isMovingAcrossAccount =
function(items, dropFolder) {
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var itemAcct = item.getAccount();
		if (itemAcct && itemAcct != dropFolder.getAccount()) {
			return true;
		}
	}
	return false;
};

ZmFolderTreeController.prototype._continueMovingAcrossAccount =
function(dialog, ctlr, items, dropFolder) {
	dialog.popdown();
	ctlr._doMove(items, dropFolder);
};

/**
 * @private
 */
ZmFolderTreeController.prototype._shareFolderListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
};

/**
 * @private
 */
ZmFolderTreeController.prototype._mountFolderListener =
function(ev) {
	appCtxt.getMountFolderDialog().popup(ZmOrganizer.FOLDER);
};


// Miscellaneous

/**
 * Returns a title for moving a folder.
 * 
 * @return	{String}	the title
 * @private
 */
ZmFolderTreeController.prototype._getMoveDialogTitle =
function() {
	return AjxMessageFormat.format(ZmMsg.moveFolder, this._pendingActionData.name);
};
