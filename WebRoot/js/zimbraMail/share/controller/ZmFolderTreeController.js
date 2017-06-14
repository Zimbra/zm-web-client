/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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

	if (!arguments.length) { return; }

	ZmTreeController.call(this, (type || ZmOrganizer.FOLDER));

	this._listeners[ZmOperation.NEW_FOLDER]				= this._newListener.bind(this);
	this._listeners[ZmOperation.PRIORITY_FILTER]		= this._priorityFilterListener.bind(this);
	this._listeners[ZmOperation.RENAME_FOLDER]			= this._renameListener.bind(this);
	this._listeners[ZmOperation.SHARE_FOLDER]			= this._shareFolderListener.bind(this);
	this._listeners[ZmOperation.EMPTY_FOLDER]			= this._emptyListener.bind(this);
	this._listeners[ZmOperation.RECOVER_DELETED_ITEMS]	= this._recoverListener.bind(this);
	this._listeners[ZmOperation.SYNC_OFFLINE_FOLDER]	= this._syncOfflineFolderListener.bind(this);
};

ZmFolderTreeController.prototype = new ZmTreeController;
ZmFolderTreeController.prototype.constructor = ZmFolderTreeController;

ZmFolderTreeController.prototype.isZmFolderTreeController = true;
ZmFolderTreeController.prototype.toString = function() { return "ZmFolderTreeController"; };

// Public methods

/**
 * Shows the folder tree with certain folders hidden.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param	{Array}	params.omit		an array of folder ids to omit
 * @param	{ZmAccount}	params.account		the account
 */
ZmFolderTreeController.prototype.show =
function(params) {

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

    // disable empty folder option for inbox, sent and drafts: bug 66656
    var isEmptyFolderAllowed = true;
    var y = folder.rid;
    if (y == ZmFolder.ID_ROOT || y == ZmFolder.ID_INBOX || y == ZmFolder.ID_SENT || y == ZmFolder.ID_DRAFTS) {
        isEmptyFolderAllowed = false;
    }

	// user folder or Folders header
	var nId = ZmOrganizer.normalizeId(id, this.type);
	if (nId == ZmOrganizer.ID_ROOT || (!folder.isSystem() && !folder.isSystemEquivalent()) /*&& !folder.isSyncIssuesFolder()*/) {
		var isShareVisible = (!folder.link || folder.isAdmin());
        if (appCtxt.isOffline) {
            isShareVisible = !folder.getAccount().isMain && folder.getAccount().isZimbraAccount;
        }
		parent.enableAll(true);
		var isSubFolderOfReadOnly = folder.parent && folder.parent.isReadOnly();
		parent.enable([ZmOperation.DELETE_WITHOUT_SHORTCUT, ZmOperation.MOVE_FOLDER, ZmOperation.EDIT_PROPS], !isSubFolderOfReadOnly);
		parent.enable(ZmOperation.SYNC, folder.isFeed()/* || folder.hasFeeds()*/);
		parent.enable(ZmOperation.SYNC_ALL, folder.isFeed() || folder.hasFeeds());
		parent.enable(ZmOperation.SHARE_FOLDER, isShareVisible);
		parent.enable(ZmOperation.EMPTY_FOLDER, ((hasContent || folder.link) && isEmptyFolderAllowed && !appCtxt.isExternalAccount()));	// numTotal is not set for shared folders
		parent.enable(ZmOperation.RENAME_FOLDER, !(isSubFolderOfReadOnly || folder.isDataSource() || appCtxt.isExternalAccount()));		// dont allow datasource'd folder to be renamed via overview
		parent.enable(ZmOperation.NEW_FOLDER, !(folder.disallowSubFolder || appCtxt.isExternalAccount()));

		if (folder.isRemote() && folder.isReadOnly()) {
			parent.enable([ZmOperation.NEW_FOLDER, ZmOperation.MARK_ALL_READ, ZmOperation.EMPTY_FOLDER], false);
		}
        if (appCtxt.isExternalAccount()) {
			parent.enable([ZmOperation.DELETE_WITHOUT_SHORTCUT, ZmOperation.MOVE_FOLDER], false);
		}
	}
	// system folder
	else {
		if (folder.isSystemEquivalent()) {
			nId = folder.getSystemEquivalentFolderId();
		}
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
		if (nId == ZmFolder.ID_SPAM  ||
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
		if (!folder.link && (nId == ZmFolder.ID_INBOX || nId == ZmFolder.ID_SENT || nId == ZmFolder.ID_DRAFTS)) {
			parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.EDIT_PROPS], true);
		}
        if (appCtxt.multiAccounts) {
            var isShareVisible = !folder.getAccount().isMain && folder.getAccount().isZimbraAccount;
            if(nId == ZmFolder.ID_SPAM || nId == ZmFolder.ID_TRASH) {
                isShareVisible = false;
            }
            parent.enable([ZmOperation.SHARE_FOLDER, ZmOperation.EDIT_PROPS], isShareVisible);
        }
		// bug fix #30435 - enable empty folder for sync failures folder
		if (appCtxt.isOffline && nId == ZmOrganizer.ID_SYNC_FAILURES && hasContent) {
			parent.enable(ZmOperation.EMPTY_FOLDER, true);
		}
	}

	parent.enable(ZmOperation.OPEN_IN_TAB, true);
	parent.enable(ZmOperation.EXPAND_ALL, (folder.size() > 0));
	if (nId != ZmOrganizer.ID_ROOT && !folder.isReadOnly()) {
		// always enable for shared folders since we dont get this info from server
		parent.enable(ZmOperation.MARK_ALL_READ, !folder.isRemoteRoot() && (folder.numUnread > 0 || folder.link));
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
		if (!folder.isOfflineSyncable) {
			button.setVisible(false);
		} else {
			button.setVisible(true);
			button.setEnabled(true);
			var text = (folder.isOfflineSyncing)
				? ZmMsg.syncOfflineFolderOff : ZmMsg.syncOfflineFolderOn;
			button.setText(text);
		}
	}
	var priorityInboxEnabled = appCtxt.get(ZmSetting.PRIORITY_INBOX_ENABLED);
	var priorityInboxOp = parent.getOp(ZmOperation.PRIORITY_FILTER);
	if (priorityInboxOp) {
		priorityInboxOp.setVisible(priorityInboxEnabled);
		priorityInboxOp.setEnabled(priorityInboxEnabled);
	}
	this._enableRecoverDeleted(parent, isTrash);

	// we always enable sharing in case we're in multi-mbox mode
	this._resetButtonPerSetting(parent, ZmOperation.SHARE_FOLDER, appCtxt.get(ZmSetting.SHARING_ENABLED));
};


// Private methods

/**
 * Returns ops available for "Folders" container.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getHeaderActionMenuOps =
function() {
    if (appCtxt.isExternalAccount()) {
        return [ZmOperation.EXPAND_ALL];
    }
	return [
		ZmOperation.NEW_FOLDER,
		ZmOperation.SEP,
		ZmOperation.PRIORITY_FILTER,
		ZmOperation.EXPAND_ALL,
		ZmOperation.SYNC,
		ZmOperation.FIND_SHARES
	];
};

/**
 * Returns ops available for folder items.
 * 
 * @private
 */
ZmFolderTreeController.prototype._getActionMenuOps = function() {

	return [
		ZmOperation.NEW_FOLDER,
		ZmOperation.SYNC,
		ZmOperation.SYNC_ALL,
		ZmOperation.MARK_ALL_READ,
		ZmOperation.EMPTY_FOLDER,
		ZmOperation.RECOVER_DELETED_ITEMS,
		ZmOperation.SHARE_FOLDER,
		ZmOperation.MOVE_FOLDER,
		ZmOperation.DELETE_WITHOUT_SHORTCUT,
		ZmOperation.RENAME_FOLDER,
		ZmOperation.EDIT_PROPS,
		ZmOperation.SYNC_OFFLINE_FOLDER,
		ZmOperation.OPEN_IN_TAB,
		ZmOperation.EXPAND_ALL
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
 * was clicked may be a search, since those can appear in Trash within the folder tree. The
 * appropriate search will be performed.
 *
 * @param {ZmOrganizer}		folder		the folder or search that was clicked
 * 
 * @private
 */
ZmFolderTreeController.prototype._itemClicked = function(folder, openInTab) {

	// bug 41196 - turn off new mail notifier if inactive account folder clicked
	if (appCtxt.isOffline) {
		var acct = folder.getAccount();
		if (acct && acct.inNewMailMode) {
			acct.inNewMailMode = false;
			var allContainers = appCtxt.getOverviewController()._overviewContainer;
			for (var i in allContainers) {
				allContainers[i].updateAccountInfo(acct, true, true);
			}
		}
	}

	if (folder.type == ZmOrganizer.SEARCH) {
		// if the clicked item is a search (within the folder tree), hand
		// it off to the search tree controller
		var stc = this._opc.getTreeController(ZmOrganizer.SEARCH);
		stc._itemClicked(folder, openInTab);
	} else if (folder.id == ZmFolder.ID_ATTACHMENTS) {
		var attController = AjxDispatcher.run("GetAttachmentsController");
		attController.show();
	}
    else {
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

		var sortBy = appCtxt.get(ZmSetting.SORTING_PREF, folder.nId);
		if (!sortBy) {
			sortBy = (sc.currentSearch && folder.nId == sc.currentSearch.folderId) ? null : ZmSearch.DATE_DESC;
		}
		else {
			//user may have saved folder with From search then switched views; don't allow From sort in conversation mode
			var groupMode = appCtxt.getApp(ZmApp.MAIL).getGroupMailBy();
			if (groupMode == ZmItem.CONV && (sortBy == ZmSearch.NAME_ASC || sortBy == ZmSearch.NAME_DESC)) {
				sortBy = appCtxt.get(ZmSetting.SORTING_PREF, appCtxt.getCurrentViewId());  //default to view preference
				if (!sortBy) {
					sortBy = ZmSearch.DATE_DESC; //default
				}
				appCtxt.set(ZmSetting.SORTING_PREF, sortBy, folder.nId);
			}
		}
		var params = {
			query:          folder.createQuery(),
			searchFor:      searchFor,
			getHtml:        folder.nId == ZmFolder.ID_DRAFTS || appCtxt.get(ZmSetting.VIEW_AS_HTML),
			types:          folder.nId == ZmOrganizer.ID_SYNC_FAILURES ? [ZmItem.MSG] : null, // for Sync Failures folder, always show in traditional view
			sortBy:         sortBy,
			accountName:    acct && acct.name,
			userInitiated:  openInTab,
			origin:         ZmId.SEARCH
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

	// bug fix #35405 - accounts with disallowSubFolder flag set (eg Yahoo) do not support moving folder to Trash
	var trashFolder = appCtxt.isOffline ? this.getDataTree().getById(ZmFolder.ID_TRASH) : null;
	if (trashFolder && trashFolder.disallowSubFolder && organizer.numTotal > 0) {
		var d = appCtxt.getMsgDialog();
		d.setMessage(ZmMsg.errorCannotDeleteFolder);
		d.popup();
		return;
	}

	// TODO: not sure what SPAM is doing in here - can you delete it?
	if (organizer.nId == ZmFolder.ID_SPAM || organizer.isInTrash() || (trashFolder && trashFolder.disallowSubFolder)) {
		this._pendingActionData = organizer;
		var ds = this._deleteShield = appCtxt.getOkCancelMsgDialog();
		ds.reset();
		ds.registerCallback(DwtDialog.OK_BUTTON, this._deleteShieldYesCallback, this, organizer);
		ds.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._deleteShield);
		var confirm;
		if (organizer.type === ZmOrganizer.SEARCH) {
			confirm = ZmMsg.confirmDeleteSavedSearch;
		}
		else if (organizer.nId == ZmFolder.ID_TRASH) {
			confirm = ZmMsg.confirmEmptyTrashFolder;
		}
		else if (organizer.nId == ZmFolder.ID_SPAM) {
			confirm = ZmMsg.confirmEmptyFolder;
		}
		else {
			// TODO: should probably split out msgs by folder type
			confirm = ZmMsg.confirmDeleteFolder;
		}
		var msg = AjxMessageFormat.format(confirm, organizer.getName());
		ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
		ds.popup();
	}
	else {
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
	this._getEmptyShieldWarning(ev);
};

ZmFolderTreeController.prototype._recoverListener =
function(ev) {
	appCtxt.getDumpsterDialog().popup(this._getSearchFor(), this._getSearchTypes());
};

ZmFolderTreeController.prototype._getSearchFor =
function(ev) {
	return ZmId.SEARCH_MAIL; // Fallback value; subclasses should return differently
};

ZmFolderTreeController.prototype._getSearchTypes =
function(ev) {
	return [ZmItem.MSG]; // Fallback value; subclasses should return differently
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
		if (!(folder instanceof ZmFolder) || folder.isSystem() /*|| folder.isSyncIssuesFolder()*/) {
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


ZmTreeController.prototype._priorityFilterListener =
function(ev) {
	var priorityFilterDialog = appCtxt.getPriorityMessageFilterDialog();
	ZmController.showDialog(priorityFilterDialog);
};

/**
 * @private
 */
ZmFolderTreeController.prototype._shareFolderListener =
function(ev) {
	this._pendingActionData = this._getActionedOrganizer(ev);
	appCtxt.getSharePropsDialog().popup(ZmSharePropsDialog.NEW, this._pendingActionData);
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
