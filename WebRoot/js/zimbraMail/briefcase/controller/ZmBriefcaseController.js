/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the briefcase controller class.
 * 
 */

/**
 * Creates the briefcase controller.
 * @class
 * This class represents the briefcase controller for the content view used by the briefcase application.
 *
 * @author Parag Shah
 *
 * @param {DwtControl}					container					the containing shell
 * @param {ZmApp}						app							the containing application
 * @param {constant}					type						type of controller
 * @param {string}						sessionId					the session id
 * @param {ZmSearchResultsController}	searchResultsController		containing controller
 * 
 * @extends		ZmListController
 */
ZmBriefcaseController = function(container, app, type, sessionId, searchResultsController) {

 	if (arguments.length == 0) { return; }

	ZmListController.apply(this, arguments);

	this._idMap = {};

	this._listChangeListener = this._fileListChangeListener.bind(this);
	
	this._listeners[ZmOperation.OPEN_FILE]			= this._openFileListener.bind(this);
	this._listeners[ZmOperation.SAVE_FILE]			= this._saveFileListener.bind(this);
	this._listeners[ZmOperation.SEND_FILE]			= this._sendFileListener.bind(this);
	this._listeners[ZmOperation.SEND_FILE_AS_ATT]	= this._sendFileAsAttachmentListener.bind(this);
	this._listeners[ZmOperation.NEW_FILE]			= this._uploadFileListener.bind(this);
	this._listeners[ZmOperation.VIEW_FILE_AS_HTML]	= this._viewAsHtmlListener.bind(this);
    this._listeners[ZmOperation.EDIT_FILE]			= this._editFileListener.bind(this);
    this._listeners[ZmOperation.RENAME_FILE]		= this._renameFileListener.bind(this);
    this._listeners[ZmOperation.DETACH_WIN]			= this._newWinListener.bind(this);

	this._listeners[ZmOperation.NEW_DOC]			= this._handleDoc.bind(this, ZmOperation.NEW_DOC);

    this._listeners[ZmOperation.CHECKIN]			= this._handleCheckin.bind(this);
    this._listeners[ZmOperation.CHECKOUT]			= this._checkoutListener.bind(this);
    this._listeners[ZmOperation.DISCARD_CHECKOUT]	= this._handleDiscardCheckout.bind(this);
    this._listeners[ZmOperation.RESTORE_VERSION]	= this._restoreVerListener.bind(this);

	if (this.supportsDnD()) {
		this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
		this._dragSrc.addDragListener(this._dragListener.bind(this));
	}

    this._parentView = {};
};

ZmBriefcaseController.prototype = new ZmListController;
ZmBriefcaseController.prototype.constructor = ZmBriefcaseController;

ZmBriefcaseController.prototype.isZmBriefcaseController = true;
ZmBriefcaseController.prototype.toString = function() { return "ZmBriefcaseController"; };

// Constants
ZmBriefcaseController._VIEWS = {};
ZmBriefcaseController._VIEWS[ZmId.VIEW_BRIEFCASE_DETAIL]	= "ZmPreviewPaneView";

ZmBriefcaseController.RP_IDS = [ZmSetting.RP_BOTTOM, ZmSetting.RP_RIGHT, ZmSetting.RP_OFF];

// reading pane options
ZmBriefcaseController.PREVIEW_PANE_TEXT = {};
ZmBriefcaseController.PREVIEW_PANE_TEXT[ZmSetting.RP_OFF]	= ZmMsg.previewPaneOff;
ZmBriefcaseController.PREVIEW_PANE_TEXT[ZmSetting.RP_BOTTOM]	= ZmMsg.previewPaneAtBottom;
ZmBriefcaseController.PREVIEW_PANE_TEXT[ZmSetting.RP_RIGHT]	= ZmMsg.previewPaneOnRight;

ZmBriefcaseController.PREVIEW_PANE_ICON = {};
ZmBriefcaseController.PREVIEW_PANE_ICON[ZmSetting.RP_OFF]	    = "SplitPaneOff";
ZmBriefcaseController.PREVIEW_PANE_ICON[ZmSetting.RP_BOTTOM]	= "SplitPane";
ZmBriefcaseController.PREVIEW_PANE_ICON[ZmSetting.RP_RIGHT]	    = "SplitPaneVertical";

// convert key mapping to view menu item
ZmBriefcaseController.ACTION_CODE_TO_MENU_ID = {};
ZmBriefcaseController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_OFF]		= ZmSetting.RP_OFF;
ZmBriefcaseController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_BOTTOM]	= ZmSetting.RP_BOTTOM;
ZmBriefcaseController.ACTION_CODE_TO_MENU_ID[ZmKeyMap.READING_PANE_RIGHT]	= ZmSetting.RP_RIGHT;

//List Views

ZmBriefcaseController.LIST_VIEW = {};
ZmBriefcaseController.LIST_VIEW[ZmId.VIEW_BRIEFCASE_DETAIL] =   {image: "GenericDoc", text: ZmMsg.byLatestFile };
ZmBriefcaseController.LIST_VIEW[ZmId.VIEW_BRIEFCASE_REVISION] = {image: "VersionHistory", text: ZmMsg.byVersionHistory };

/**
 * The list view as a whole is the drop target, since it's the lowest-level widget. Still, we
 * need to find out which item got dropped onto, so we get that from the original UI event
 * (a mouseup). The header is within the list view, but not an item, so it's not a valid drop
 * target. One drawback of having the list view be the drop target is that we can't exercise
 * fine-grained control on what's a valid drop target. If you enter via an item and then drag to
 * the header, it will appear to be valid.
 * 
 * @protected
 */
ZmBriefcaseController.prototype._dropListener =
function(ev) {
	var view = this._listView[this._currentViewId];
	var div = view.getTargetItemDiv(ev.uiEvent);
	var item = view.getItemFromElement(div);
	if(!item || !( item.isRevision || item.isFolder) ) {
		ZmListController.prototype._dropListener.call(this,ev);
	} else {
		ev.doIt = false;
	}
}

ZmBriefcaseController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE];
};

/**
 * @private
 */
ZmBriefcaseController.prototype._getSecondaryToolBarOps =
function() {
	var list = [];
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		list.push(ZmOperation.SEND_FILE, ZmOperation.SEND_FILE_AS_ATT, ZmOperation.SEP);
	}
	list.push(ZmOperation.DETACH_WIN, ZmOperation.SEP);

	list.push(ZmOperation.CHECKOUT, ZmOperation.CHECKIN, ZmOperation.DISCARD_CHECKOUT, ZmOperation.RESTORE_VERSION);

	list.push(ZmOperation.SEP);
	list.push(ZmOperation.RENAME_FILE);

	return list;
};


ZmBriefcaseController.prototype._getToolBarOps =
function() {
    var ops = [ZmOperation.NEW_FILE,
            ZmOperation.SAVE_FILE,
			ZmOperation.SEP,
            ZmOperation.EDIT_FILE,
			ZmOperation.SEP,
			ZmOperation.DELETE,
			ZmOperation.SEP,
			ZmOperation.MOVE_MENU,
			ZmOperation.TAG_MENU
			];

	/*if (appCtxt.get(ZmSetting.DOCS_ENABLED)) {
		   ops.push(ZmOperation.NEW_DOC,ZmOperation.SEP);
	}*/


	return ops;
};

ZmBriefcaseController.prototype._getRightSideToolBarOps =
function(noViewMenu) {
	return [ZmOperation.VIEW_MENU];
};


ZmBriefcaseController.prototype._handleDoc =
function(op) {
	this._app.handleOp(op);
};

ZmBriefcaseController.prototype._initializeToolBar =
function(view) {

	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._setupViewMenu(view, true);
        var toolbar = this._toolbar[view];
		toolbar.addFiller();
		this._initializeNavToolBar(view);
		appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, view], {waitUntilLoaded:true});
	} else {
        this._setupDeleteButton(this._toolbar[view]);
        this._setupViewMenu(view, false);
	}
};

// If we're in the Trash folder, change the "Delete" button tooltip
ZmBriefcaseController.prototype._setupDeleteButton =
function(parent) {
    var folder = this._getSearchFolder();
    var inTrashFolder = (folder && folder.nId == ZmFolder.ID_TRASH);
    var tooltip = inTrashFolder ? ZmMsg.deletePermanentTooltip : ZmMsg.deleteTooltip;
    var deleteButton = parent.getButton(ZmOperation.DELETE);
    if(deleteButton){
        deleteButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE, this.getKeyMapName(), tooltip));
    }
};

ZmBriefcaseController.prototype._initializeNavToolBar =
function(view) {
	this._itemCountText[view] = this._toolbar[view].getButton(ZmOperation.TEXT);
};

ZmBriefcaseController.prototype._resetOperations =
function(parent, num) {
	if (!parent) { return; }

	// call base class
	ZmListController.prototype._resetOperations.call(this, parent, num);

	var items = this._listView[this._currentViewId].getSelection();
	var isFolderSelected=false, noOfFolders = 0, isRevisionSelected=false, isBriefcaseItemSelected=false, isMixedSelected=false;
    var isWebDocSelected= false, hasLocked = false, allLocked = true, sameLockOwner=true;
    var hasHighestRevisionSelected = false, hasOldRevisionSelected = false;
	if (items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.isFolder) {
				isFolderSelected = true;
				noOfFolders++;
			}else if(item.isRevision){
                isRevisionSelected = true;
                if(item.parent.version == item.version){
                    hasHighestRevisionSelected = true;
                }
				else {
					hasOldRevisionSelected = true;
				}
            }else{
                isBriefcaseItemSelected = true;
            }

            isWebDocSelected = isWebDocSelected || ( !item.isFolder && item.isWebDoc() );

            allLocked = allLocked && item.locked;

            hasLocked = hasLocked || item.locked;

            sameLockOwner = sameLockOwner && (item.locked && item.lockUser == appCtxt.getActiveAccount().name);
		}
	}

    isMixedSelected = isFolderSelected ? (isBriefcaseItemSelected || isRevisionSelected) :  (isBriefcaseItemSelected && isRevisionSelected);

    var briefcase = appCtxt.getById(this._folderId);
    if(!(briefcase instanceof ZmBriefcase)){
        briefcase = null;
    }
    var isTrash = (briefcase && briefcase.nId == ZmOrganizer.ID_TRASH);
    var isShared = ((briefcase && briefcase.nId != ZmOrganizer.ID_TRASH && briefcase.isShared()));
	var isReadOnly = briefcase ? briefcase.isReadOnly() : false;
	var isMultiFolder = (noOfFolders > 1);
	var isItemSelected = (num>0);
	var isZimbraAccount = appCtxt.getActiveAccount().isZimbraAccount;
	var isMailEnabled = appCtxt.get(ZmSetting.MAIL_ENABLED);
    var isAdmin = briefcase && briefcase.isAdmin(); 

    var item = items[0];
    //bug 65351
    // treat the latest revision selection as if it was a file selection.
    // isOldRevision is true if the item is a revision but not the latest.
    var isOldRevision = hasOldRevisionSelected ? true : item && item.revision && !hasHighestRevisionSelected;
	
	parent.enable([ZmOperation.SEND_FILE, ZmOperation.SEND_FILE_AS_ATT], (isZimbraAccount && isMailEnabled && isItemSelected && !isMultiFolder && !isFolderSelected));
	parent.enable(ZmOperation.TAG_MENU, (!isReadOnly && isItemSelected && !isFolderSelected && !isOldRevision));
	parent.enable([ZmOperation.NEW_FILE, ZmOperation.VIEW_MENU], true);
	parent.enable([ZmOperation.NEW_DOC], true);
	parent.enable([ZmOperation.MOVE, ZmOperation.MOVE_MENU], ( isItemSelected &&  !isReadOnly && !isShared && !isOldRevision));
    parent.enable(ZmOperation.NEW_FILE, !(isTrash || isReadOnly));
    parent.enable(ZmOperation.DETACH_WIN, (isItemSelected && !isFolderSelected && num==1));

    var firstItem = items && items[0];
    var isWebDoc = firstItem && !firstItem.isFolder && firstItem.isWebDoc();
    var isLocked = firstItem && !firstItem.isFolder && firstItem.locked;
    var isLockOwner = isLocked && (item.lockUser == appCtxt.getActiveAccount().name);


    //Rename Operation
    parent.enable(ZmOperation.RENAME_FILE, ( num ==1 && !isFolderSelected && !isReadOnly && !isOldRevision && (isLocked ? isLockOwner : true) ));

    //Download - Files
    parent.enable(ZmOperation.SAVE_FILE, num >0 && (!isFolderSelected || isBriefcaseItemSelected));

    // Edit
    parent.enable(ZmOperation.OPEN_FILE, (num == 1 && isWebDoc));
    parent.enable(ZmOperation.EDIT_FILE, !isReadOnly && (  !isLocked || isLockOwner ) && isWebDoc && !isOldRevision && num == 1);

    //Delete Operation
    parent.enable(ZmOperation.DELETE, (!isReadOnly && isItemSelected && (hasHighestRevisionSelected ? !hasOldRevisionSelected : true) && !isMixedSelected && (isLocked ? isLockOwner : true)));

    if(parent &&  parent instanceof ZmActionMenu){

        //Open - webDocs
        parent.getOp(ZmOperation.OPEN_FILE) && parent.getOp(ZmOperation.OPEN_FILE).setVisible(isItemSelected && !isMultiFolder && isWebDoc);

	}
	//Case 1: Multiple Admins
	//Case 2: Stale Lock ( Handle exception )

	//Checkin
	var op = parent.getOp(ZmOperation.CHECKIN);
	if (op) {
		var checkinEnabled = !isReadOnly && isLockOwner && !isWebDoc && !isOldRevision;
		op.setVisible(checkinEnabled);
		parent.enable(ZmOperation.CHECKIN, checkinEnabled && num == 1);
	}

	//Checkout
	op = parent.getOp(ZmOperation.CHECKOUT);
	if (op) {
		var checkoutEnabled = !isReadOnly && !hasLocked && !isRevisionSelected && !isFolderSelected;
		op.setVisible(!isOldRevision && !isLocked);
		parent.enable(ZmOperation.CHECKOUT, checkoutEnabled);
	}

	//Discard Checkout
	op = parent.getOp(ZmOperation.DISCARD_CHECKOUT);
	if (op) {
		var discardCheckoutEnabled = sameLockOwner && !isRevisionSelected;
		op.setVisible(discardCheckoutEnabled);
		parent.enable(ZmOperation.DISCARD_CHECKOUT, discardCheckoutEnabled && (isAdmin || sameLockOwner || !isShared));
	}

	//Versioning
	op = parent.getOp(ZmOperation.RESTORE_VERSION);
	if (op) {
		var versionEnabled = (!isReadOnly && num == 1 && isOldRevision);
		var isHightestVersion = item && item.isRevision && ( item.parent.version == item.version );
		op.setVisible(isOldRevision);
		parent.enable(ZmOperation.RESTORE_VERSION, versionEnabled && !isHightestVersion);
	}

    var isDocOpEnabled = !(isTrash || isReadOnly);
    if (appCtxt.get(ZmSetting.DOCS_ENABLED)) {
        parent.enable(ZmOperation.NEW_DOC, isDocOpEnabled);
    }

    // ZmShare is not present when the virtual account loads
    AjxPackage.require("Briefcase");
	AjxPackage.require("Share");

    if (appCtxt.isExternalAccount() && items.length && isItemSelected) {

        var roleFromPerm = ZmShare.getRoleFromPerm(briefcase.perm);

        if (roleFromPerm === ZmShare.ROLE_NONE) {
            parent.enable ([ZmOperation.SEND_FILE,
                ZmOperation.SEND_FILE_AS_ATT,
                ZmOperation.RENAME_FILE,
                ZmOperation.MOVE,
                ZmOperation.MOVE_MENU,
                ZmOperation.NEW_FILE,
                ZmOperation.TAG_MENU,
                ZmOperation.EDIT_FILE,
                ZmOperation.OPEN_FILE,
                ZmOperation.CHECKIN,
                ZmOperation.CHECKOUT,
                ZmOperation.DISCARD_CHECKOUT,
                ZmOperation.RESTORE_VERSION,
                ZmOperation.DETACH_WIN,
                ZmOperation.DELETE
            ], false);
            parent.setItemVisible(ZmOperation.TAG_MENU, false);
        }
        else if (roleFromPerm === ZmShare.ROLE_MANAGER) {
            parent.enable ([
                ZmOperation.RENAME_FILE,
                ZmOperation.NEW_FILE,
                ZmOperation.OPEN_FILE,
                ZmOperation.CHECKIN,
                ZmOperation.CHECKOUT,
                ZmOperation.DISCARD_CHECKOUT,
                ZmOperation.DETACH_WIN,
                ZmOperation.DELETE
            ], true);
        }
    }
};

ZmBriefcaseController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagFile;
};

ZmBriefcaseController.prototype._doDelete = function(items, hardDelete) {

	items = items || this._listView[this._currentViewId].getSelection();
    var item = items instanceof Array ? items[0] : items;
    if (!item) {
        return;
    }

	var message = items.length > 1 ? item.isRevision  ? ZmMsg.confirmPermanentDeleteItemList : ZmMsg.confirmDeleteItemList : null;
	if (!message) {
		if (hardDelete || this._folderId == String(ZmOrganizer.ID_TRASH) || (item.isRevision && item.parent.version !== item.version)) {
			var pattern = ZmMsg.confirmPermanentDeleteItem;
		}
		else {
			var pattern = ZmMsg.confirmDeleteItem;
		}
		var delMsgFormatter = new AjxMessageFormat(pattern);
		message = delMsgFormatter.format(AjxStringUtil.htmlEncode(item.name));
	}

    var dialog = appCtxt.getConfirmationDialog();
	if (AjxEnv.isIE || AjxEnv.isModernIE) {
		dialog.addPopupListener(ZmBriefcaseController._onDeleteDialogPopup);
	}
	dialog.popup(message, this._doDelete2.bind(this, items, hardDelete));
};

ZmBriefcaseController.prototype._doDelete2 = function(items, hardDelete) {

    var item = items instanceof Array ? items[0] : items,
        i;

    if (item.isRevision && item.parent.version !== item.version) {
        var view = this._parentView[this._currentViewId];
        view.deleteVersions(items);
    }
    else if (item.isFolder) {
        //Bug fix # 80600 force the BatchCommand to use JSON, mimicking the way right click delete behaves
        var delBatchCmd = new ZmBatchCommand(true, null, true), folder;
        for (i = 0; i < items.length; i++) {
            folder = items[i].folder;
            if (folder.isHardDelete()) {
                delBatchCmd.add(new AjxCallback(folder, folder._delete, [delBatchCmd]));
            }
            else {
                var trashFolder = appCtxt.getById(ZmFolder.ID_TRASH);
                delBatchCmd.add(new AjxCallback(folder, folder.move, [trashFolder, false, null, delBatchCmd]));
            }
        }
        delBatchCmd.run();
    }
    else {
		for (i = 0; i < items.length; i++) {
			if (items[i].isRevision) {
				items[i] = items[i].parent;
			}
		}
        ZmListController.prototype._doDelete.call(this, items, hardDelete, null, true);
    }
};

// view management

ZmBriefcaseController.getDefaultViewType =
function() {
	return ZmId.VIEW_BRIEFCASE_DETAIL;
};
ZmBriefcaseController.prototype.getDefaultViewType = ZmBriefcaseController.getDefaultViewType;

ZmBriefcaseController.prototype._createNewView =
function(view) {

	var viewType = appCtxt.getViewTypeFromId(view);
    var viewCtor = eval(ZmBriefcaseController._VIEWS[viewType]);
	this._parentView[view] = new viewCtor(this._container, this, this._dropTgt);
	var listView = this._parentView[view].getListView();
	if (this._dragSrc) {
		listView.setDragSource(this._dragSrc);
	}

	return listView;
};

ZmBriefcaseController.prototype._setViewContents =
function(view) {
	// If the controller is being used via the ZmBriefcaseTabView (for attaching briefcase files
	// to a mail message), then there is only a list view in use, not a parent with multiple views.
	if (this._parentView[view]) {
		this._parentView[view].set(this._list, this._switchView);
	}
    this._switchView = false;
};

ZmBriefcaseController.prototype._getDefaultFocusItem =
function() {
	return this._listView[this._currentViewId];
};

// Returns a list of subfolders of the given folder, as ZmBriefcaseItem objects
ZmBriefcaseController.prototype._getSubfolders =
function(folderId) {

	var folderId = folderId || this._currentSearch.folderId;
	var folder = folderId && appCtxt.getById(folderId);
	var subfolders = [];
	if (folder) {
		var children = folder.children;
		for (var i = 0, len = children.size(); i < len; i++) {
            folder = children.get(i);
            if(folder.type == ZmOrganizer.BRIEFCASE)
			    subfolders.push(new ZmBriefcaseFolderItem(children.get(i)));
		}
	}

	return subfolders;
};


// view management

/**
 * Shows the search results.
 * 
 * @param	{Object}	results		the search results
 */
ZmBriefcaseController.prototype.show =
function(results) {

	this._folderId = results && results.search && results.search.folderId;
	this.setList(results.getResults(ZmItem.BRIEFCASE_ITEM));
	this._list.setHasMore(results.getAttribute("more"));

	ZmListController.prototype.show.call(this, results, this._currentViewId);

	this._setup(this._currentViewId);

	// start fresh with search results
	var lv = this._listView[this._currentViewId];
	lv.offset = 0;
	lv._folderId = this._folderId;

	var elements = this.getViewElements(this._currentViewId, this._parentView[this._currentViewId]);

	this._setView({	view:		this._currentViewId,
					viewType:	this._currentViewType,
					noPush:		this.isSearchResults,
					elements:	elements,
					isAppView:	true});
	if (this.isSearchResults) {
		// if we are switching views, make sure app view mgr is up to date on search view's components
		appCtxt.getAppViewMgr().setViewComponents(this.searchResultsController.getCurrentViewId(), elements, true);
	}
	this._resetNavToolBarButtons();
};

ZmBriefcaseController.prototype.getFolderId = function() {
	return this._folderId;
}

/**
 * Change how briefcase items are displayed.
 * 
 * @param {constant}	view			the view to show
 * @param {Boolean}	force			if <code>true</code>, render view even if it's the current view
 */
ZmBriefcaseController.prototype.switchView =
function(view, force) {

	var viewChanged = (force || view != this._currentViewId);

	if (viewChanged) {
        var lv = this._listView[this._currentViewId];
        if (lv) {
			lv.cleanup();
		}
        this._switchView = true;
		this._currentViewId = view;
		this._setup(view);
	}
	this._resetOperations(this._toolbar[view], 0);

	if (viewChanged) {
		var elements = this.getViewElements(view, this._parentView[view]);
		
		this._setView({ view:		view,
						viewType:	this._currentViewType,
						elements:	elements,
						isAppView:	true});
		this._resetNavToolBarButtons();
	}
	Dwt.setTitle(this.getCurrentView().getTitle());
};

ZmBriefcaseController.prototype._preHideCallback =
function() {

    var lv = this._listView[this._currentViewId];
    if(lv) lv.cleanup();

    return ZmController.prototype._preHideCallback.call(this);
};

ZmBriefcaseController.prototype.getItemById =
function(itemId) {
	return (this._idMap[itemId] ? this._idMap[itemId].item : null);
};

ZmBriefcaseController.prototype.__popupUploadDialog =
function(title, callback) {


	var folderId = this._folderId;
    if(!folderId || folderId == ZmOrganizer.ID_TRASH)
        folderId = ZmOrganizer.ID_BRIEFCASE;
    
    if(this.chkFolderPermission(folderId)){
        var cFolder = appCtxt.getById(folderId);
		var uploadDialog = appCtxt.getUploadDialog();
         uploadDialog.popup(this, cFolder, callback, title, null, false, true, true, ZmBriefcaseApp.ACTION_KEEP_MINE);
    }	
};

ZmBriefcaseController.prototype.chkFolderPermission =
function(folderId){
    var briefcase = appCtxt.getById(folderId);
    if(briefcase.isRemote() && briefcase.isReadOnly()){
        var dialog = appCtxt.getMsgDialog();
        dialog.setMessage(ZmMsg.errorPermissionCreate, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
        return false;
    }
    return true;
};

ZmBriefcaseController.prototype._listSelectionListener =
function(ev) {
	Dwt.setLoadingTime("ZmBriefcaseItem");
	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var item = ev.item;

        if(item.isFolder){
            this._app.search({folderId:item.id});
            return;
        }

		var restUrl = item.getRestUrl(false, false, true); //get it with the version number even if clicked on the base item (see ZmBriefcaseBaseItem.prototype.getRestUrl in ZmBriefcaseItem.js)
        //added for bug: 45150
        restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);
        if (item.isWebDoc()) {
            restUrl += (restUrl.match(/\?/) ? "&" : "?") + "localeId=" + AjxEnv.DEFAULT_LOCALE;

		}
		if (restUrl) {
            if(item.isDownloadable() && !this._alwaysOpenInNewWindow(item)) {
                this._downloadFile(restUrl);
            }else {
			    window.open(restUrl, this._getWindowName(item.name), item.isWebDoc() ? "" : ZmBriefcaseApp.getDocWindowFeatures());
            }
		}
	}
};

ZmBriefcaseController.prototype._alwaysOpenInNewWindow =
function(item){

    return (item.contentType == ZmMimeTable.APP_ADOBE_PDF && this.hasPDFReader())
            || (item.contentType == ZmMimeTable.TEXT_XML) || (item.contentType == ZmMimeTable.APP_XML);

};

ZmBriefcaseController.prototype.hasPDFReader =
function(){
    if(AjxUtil.isUndefined(this._hasPDFReader)){
        this._hasPDFReader = AjxPluginDetector.detectPDFReader();
    }
    return this._hasPDFReader;
}

ZmBriefcaseController.prototype._listActionListener =
function(ev) {

	var item = ev.item;

	if (item && item.isFolder) {
		ev.detail = DwtTree.ITEM_ACTIONED;
		var overviewController = appCtxt.getOverviewController();
		var treeController = overviewController.getTreeController(ZmOrganizer.BRIEFCASE);
		item.setData(ZmTreeView.KEY_TYPE, ZmOrganizer.BRIEFCASE);
		item.setData(Dwt.KEY_OBJECT, item.folder);
		item.setData(ZmTreeView.KEY_ID, this._app.getOverviewId());
		item.setData(Dwt.KEY_ID, item.id);
		treeController._treeViewListener(ev);
		return;
	}

	ZmListController.prototype._listActionListener.call(this, ev);

	var actionMenu = this.getActionMenu();
	actionMenu.popup(0, ev.docX, ev.docY);
	if (ev.ersatz) {
		actionMenu.setSelectedItem(0); // menu popped up via keyboard nav
	}

    
};

ZmBriefcaseController.prototype._restoreVerListener =
function(){
    var view = this._parentView[this._currentViewId];
    view._restoreVerListener();

};

//Checkin/Checkout

ZmBriefcaseController.prototype._checkoutListener =
function(){
     var items = this._getSelectedItems();
     if(items.length > 1){
        for(var i=0; i< items.length; i++){
           var item = items[i];
           if(item && item instanceof ZmBriefcaseItem){
                this.checkout(item);
           }
        }
     }else{
        var item = items[0];
        if(item && item instanceof ZmBriefcaseItem){
            this.checkout(item, item.isWebDoc() ? null : new AjxCallback(this, this._postCheckout, item));
        }
     }
};

ZmBriefcaseController.prototype._postCheckout =
function(item){
    if(AjxEnv.isSafari){
        setTimeout(AjxCallback.simpleClosure(this.downloadFile, this, item), 100);
    }else{
        this.downloadFile(item);
    }
};

ZmBriefcaseController.prototype._handleCheckin =
function(){    
    var item = this._getSelectedItem();
    if(item && item instanceof ZmBriefcaseItem){
        var dlg = this._getCheckinDlg();                                        
        dlg.popup(item, this._doneCheckin.bind(this, item));
    }
};

ZmBriefcaseController.prototype._doneCheckin =
function(item, files){
    //Update item attribs
	var file = files[0];
    item.version = file.version;
    item.name = file.name;
    this.unlockItem(item, new AjxCallback(this, this.refreshItem, item));

};

ZmBriefcaseController.prototype._handleDiscardCheckout =
function(){    
    var items = this._getSelectedItems();
    for(var i=0; i< items.length; i++){
        var item = items[i];
        if(item && item instanceof ZmBriefcaseItem)
            this.unlockItem(item);
    }
};

ZmBriefcaseController.prototype.refreshItem =
function(item){
    //TODO: Handle version notifications than hard refresh
    var view = this._parentView[this._currentViewId];
    view.refreshItem(item);
};

ZmBriefcaseController.prototype.checkout =
function(item, callback){        
    this.lockItem(item, callback);
};

ZmBriefcaseController.prototype.checkin =
function(item, callback){
    this.unlockItem(item, callback);
};

ZmBriefcaseController.prototype.unlockItem =
function(item, callback){
   item.unlock(callback, new AjxCallback(this, this._handleErrorResponse, item)); 
};

ZmBriefcaseController.prototype.lockItem =
function(item, callback){
   item.lock(callback, new AjxCallback(this, this._handleErrorResponse, item));
};

ZmBriefcaseController.prototype._handleErrorResponse =
function(item, response){
    if(!(response && response.code)) return;

    var msg;
    switch(response.code){
        case ZmCsfeException.CANNOT_UNLOCK:
            msg = ZmMsg.unlockSufficientPermission;
            break;

        case ZmCsfeException.CANNOT_LOCK:
            msg = ZmMsg.lockSuffientPermissions;
            break;
    }

    if(msg){
        var dialog = appCtxt.getMsgDialog();
        dialog.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
    }

    return msg;
};        

ZmBriefcaseController.prototype._getSelectedItem =
function(){
    var view = this._listView[this._currentViewId];
	var items = view.getSelection();    
    return ( items && items.length > 0 ) ? items[0] : null;
};

ZmBriefcaseController.prototype._getSelectedItems =
function(){
    var view = this._listView[this._currentViewId];
	return view.getSelection();
};

ZmBriefcaseController.prototype._getCheckinDlg =
function(){
    if(!this._checkinDlg){
       this._checkinDlg = new ZmCheckinDialog(appCtxt.getShell());
    }
    return this._checkinDlg;
};

//End of Checkin/Checkout

ZmBriefcaseController.prototype._getActionMenuOps =
function() {
    var list = [
        ZmOperation.OPEN_FILE,
        ZmOperation.SAVE_FILE,
        ZmOperation.EDIT_FILE
    ];

    if (!appCtxt.isExternalAccount()) {
        list.push(ZmOperation.SEND_FILE);
        list.push(ZmOperation.SEND_FILE_AS_ATT);
    }

    list.push(ZmOperation.SEP);
    list.push(ZmOperation.CHECKOUT, ZmOperation.CHECKIN, ZmOperation.DISCARD_CHECKOUT, ZmOperation.RESTORE_VERSION/*, ZmOperation.DELETE_VERSION*/);

	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
    list.push(ZmOperation.RENAME_FILE);
	return list;
};

ZmBriefcaseController.prototype._renameFileListener =
function(){

    var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }

    view.renameFile(items[0]);
};

ZmBriefcaseController.prototype._newWinListener =
function(){
    var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }
    items = AjxUtil.toArray(items);
    var item = items[0];
    if (item) {
        this.openFile(item);
    }
};


ZmBriefcaseController.prototype._editFileListener =
function() {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }
    items = AjxUtil.toArray(items);
    var item = items[0];
    if(item){
        this.editFile(item);
    }
};

ZmBriefcaseController.prototype.editFile =
function(items){
    items = AjxUtil.toArray(items);
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.isWebDoc()) {
			var win = appCtxt.getNewWindow(false, null, null, this._getWindowName(item.name));
	        if (win) {
	            win.command = "documentEdit";
	            win.params = {
					restUrl: item.getRestUrl(),
					id: item.id,
					name: item.name,
					folderId: item.folderId
				};
	        }
        }
    }
};

ZmBriefcaseController.prototype._getWindowName =
function(name){
    if(!name){
        return ZmMsg.briefcase;    
    }
    //IE does not like special chars as part of window name.
    return AjxEnv.isIE ? name.replace(/[^\w]/g,'') : name;    
};

ZmBriefcaseController.prototype._openFileListener =
function() {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }

    this.openFile(items);
};

ZmBriefcaseController.prototype.openFile =
function(items){
    items = AjxUtil.toArray(items);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var restUrl = item.getRestUrl(false, false, true);
		if (!restUrl) {
			continue;
		}
		restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);
		if (item.isWebDoc()) {
			//added for bug: 45150
			restUrl += (restUrl.match(/\?/) ? "&" : "?") + "localeId=" + AjxEnv.DEFAULT_LOCALE;
		} else {
            // do not try to
            //ZD doesn't support ConvertD.
			if (!ZmMimeTable.isRenderable(item.contentType) && !ZmMimeTable.isMultiMedia(item.contentType) && !appCtxt.isOffline) {
               	restUrl += (restUrl.match(/\?/) ? "&" : "?") + "view=html";
			}
        }

		var win = window.open(restUrl, this._getWindowName(item.name), item.isWebDoc() ? "" : ZmBriefcaseApp.getDocWindowFeatures());
        appCtxt.handlePopupBlocker(win);
	}
};

ZmBriefcaseController.prototype._saveFileListener =
function() {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }

	items = AjxUtil.toArray(items);

	// Allow download to only one file.
    this.downloadFile(items);
};

ZmBriefcaseController.prototype.downloadFile =
function(items){

    var restUrl, item, length= items.length;
    if(length > 1){
        var params = [];
        var organizer = appCtxt.getById(items[0].folderId);
        for(var i=0; i< length; i++){
            item = items[i];
	        if (!item.isFolder) {
				var itemId;
				if (appCtxt.isOffline && organizer.isShared()) {
					itemId = item.id;
				} else {
					itemId = item.getNormalizedItemId();
				}
				params.push((item.isRevision ? item.parent.id : itemId )+"."+item.version);
	        }
        }
        restUrl = [ ((organizer.isShared() && !appCtxt.isOffline ) ? organizer.getOwnerRestUrl() : organizer.getRestUrl()), "?fmt=zip&list=", params.join(',')].join('');
    }else{
        item = AjxUtil.isArray(items) ? items[0] : items;
        restUrl = item.getRestUrl();
        restUrl += ( restUrl.indexOf('?') == -1 ) ? "?" : "&";
        restUrl += "disp=a"+(item.version ? "&ver="+item.version : "");
    }

    if (!restUrl) {
        return false;
    }
    restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);
    if (restUrl) {
        this._downloadFile(restUrl)
    }
};

ZmBriefcaseController.prototype._downloadFile =
function(downloadUrl){
    if(downloadUrl){
        ZmZimbraMail.unloadHackCallback();
        location.href = downloadUrl;
    }
};

ZmBriefcaseController.prototype._viewAsHtmlListener =
function() {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }

	items = AjxUtil.toArray(items);
	for (var i = 0; i<items.length; i++) {
		var item = items[i];
		var restUrl = item.getRestUrl();
		if (item && restUrl) {
			this.viewAsHtml(restUrl);
		}
	}
};

ZmBriefcaseController.prototype.viewAsHtml =
function(restUrl) {
	if (restUrl.match(/\?/)) {
		restUrl+= "&view=html";
	} else {
		restUrl+= "?view=html";
	}
	window.open(restUrl);
};

ZmBriefcaseController.prototype._uploadFileListener =
function() {
    this.__popupUploadDialog(ZmMsg.uploadFileToBriefcase, new AjxCallback(this, this._handlePostUpload));
};

ZmBriefcaseController.prototype.resetSelection = function() {
	var view = this._listView[this._currentViewId];
	if (view) {
		view.deselectAll();
	}
	var lv = this.getCurrentView();
	if (lv) {
		lv._selectFirstItem()
	}
}

ZmBriefcaseController.prototype._sendFileListener =
function(event) {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	items = AjxUtil.toArray(items);

	var names = [];
	var urls = [];
	var inNewWindow = this._app._inNewWindow(event);

	var briefcase, shares;
	var noprompt = false;

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		briefcase = appCtxt.getById(item.folderId);
		var url;
		if (briefcase.restUrl) {
			//present if the briefcase is a share from another user. In this case, keep that URL as the base.
			url = [briefcase.restUrl, "/", AjxStringUtil.urlComponentEncode(item.name)].join("")
		}
		else {
			//item is in this user's briefcase, so build the rest url.
			url = item.getRestUrl();
		}
		if (appCtxt.isOffline) {
			var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
			url = remoteUri + url.substring((url.indexOf("/",7)));
		}
        
		urls.push(url);
		names.push(item.name);

		if (noprompt) { continue; }

		shares = briefcase && briefcase.shares;
		if (shares) {
			for (var j = 0; j < shares.length; j++) {
				noprompt = noprompt || shares[j].grantee.type == ZmShare.TYPE_PUBLIC;
			}
		}
	}

	if (!shares || !noprompt) {
		var args = [names, urls, inNewWindow];
		var callback = new AjxCallback(this, this._sendFileListener2, args);

		var dialog = appCtxt.getConfirmationDialog();
		dialog.popup(ZmMsg.errorPermissionRequired, callback);
	} else {
		this._sendFileListener2(names, urls);
	}
};

ZmBriefcaseController.prototype._sendFileListener2 =
function(names, urls, inNewWindow) {
	var action = ZmOperation.NEW_MESSAGE;
	var msg = new ZmMailMsg();
	var toOverride = null;
	var subjOverride = new AjxListFormat().format(names);
	var htmlCompose = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) == ZmSetting.COMPOSE_HTML;
	var extraBodyText = urls.join(htmlCompose ? "<br>" : "\n");
	AjxDispatcher.run("Compose", {action: action, inNewWindow: inNewWindow, msg: msg,
								  toOverride: toOverride, subjOverride: subjOverride,
								  extraBodyText: extraBodyText});
};

ZmBriefcaseController.prototype._sendFileAsAttachmentListener =
function(event) {
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();

    this.sendFilesAsAttachment(items);	
};

ZmBriefcaseController.prototype.sendFilesAsAttachment =
function(items, callback){

    items = AjxUtil.toArray(items);
    var docInfo = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        docInfo.push({
            id:     ( item.isRevision ? item.parent.id : item.id ),
            ver:    ( item.isRevision ? item.version : null ),
            ct:     item.contentType,
            s:      item.size
        });
    }

    if (docInfo.length == 0) { return; }

    var action = ZmOperation.NEW_MESSAGE;
    var msg = new ZmMailMsg();
    var toOverride;

    var cc = AjxDispatcher.run("GetComposeController");
    cc._setView({action:action, msg:msg, toOverride:toOverride, inNewWindow:false});
    var draftType = ZmComposeController.DRAFT_TYPE_AUTO;
    var sendDocsCallback = new AjxCallback(cc, cc._handleResponseSaveDraftListener, [draftType, callback]);
    cc.saveDraft(draftType, null, docInfo, sendDocsCallback);
};

ZmBriefcaseController.prototype._resetOpForCurrentView =
function(num) {
	this._resetOperations(this._toolbar[this._currentViewId], num || 0);
};


ZmBriefcaseController.prototype._setupViewMenu =
function(view, firstTime) {

	var btn, menu;
	if (firstTime) {
		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		var menu = btn.getMenu();
		if (!menu) {
			menu = new ZmPopupMenu(btn);
			btn.setMenu(menu);
			btn.addClassName("ZViewMenuButton");

            this._setupPreviewPaneMenu(menu, btn);
		}
	}

    if(!menu){
       btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
       menu = btn && btn.getMenu();
    }
	
    this._resetPreviewPaneMenu(menu, view);
};

ZmBriefcaseController.prototype._setupPreviewPaneMenu =
function(menu, btn){

    if (menu.getItemCount() > 0) {
		new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE, id:"PREVIEW_SEPERATOR"});
	}

	var miParams = {text:ZmMsg.readingPaneAtBottom, style:DwtMenuItem.RADIO_STYLE, radioGroupId:"RP"};
	var ids = ZmDoublePaneController.RP_IDS;
	var pref = appCtxt.get(ZmSetting.READING_PANE_LOCATION_BRIEFCASE);
	for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (!menu._menuItems[id]) {
			miParams.text = ZmBriefcaseController.PREVIEW_PANE_TEXT[id];
			miParams.image = ZmBriefcaseController.PREVIEW_PANE_ICON[id];
            var mi = menu.createMenuItem(id, miParams);
			mi.setData(ZmOperation.MENUITEM_ID, id);
			mi.addSelectionListener(new AjxListener(this, this._previewPaneListener, id));
			if (id == pref) {
				mi.setChecked(true, true);
				btn.setImage(mi.getImage());
			}
		}
	}

};

ZmBriefcaseController.prototype._resetPreviewPaneMenu =
function(menu, view){
    view = view || this._currentViewId;
    var ids = ZmDoublePaneController.RP_IDS;
    for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (menu._menuItems[id]) {
            menu._menuItems[id].setEnabled(true);
        }
    }
};

/**
 * Checks if the reading pane is "on".
 *
 * @return	{Boolean}	<code>true</code> if the reading pane is "on"
 */
ZmBriefcaseController.prototype.isReadingPaneOn =
function() {
	return (this._getReadingPanePref() != ZmSetting.RP_OFF);
};

/**
 * Checks if the reading pane is "on" right.
 *
 * @return	{Boolean}	<code>true</code> if the reading pane is "on" right.
 */
ZmBriefcaseController.prototype.isReadingPaneOnRight =
function() {
	return (this._getReadingPanePref() == ZmSetting.RP_RIGHT);
};

ZmBriefcaseController.prototype._getReadingPanePref =
function() {
	return (this._readingPaneLoc || appCtxt.get(ZmSetting.READING_PANE_LOCATION_BRIEFCASE));
};

ZmBriefcaseController.prototype._setReadingPanePref =
function(value) {
	if (this.isSearchResults || appCtxt.isExternalAccount()) {
		this._readingPaneLoc = value;
	}
	else {
		appCtxt.set(ZmSetting.READING_PANE_LOCATION_BRIEFCASE, value);
	}
};

ZmBriefcaseController.prototype._previewPaneListener =
function(newPreviewStatus){
    var oldPreviewStatus = appCtxt.get(ZmSetting.READING_PANE_LOCATION_BRIEFCASE);
    this._setReadingPanePref(newPreviewStatus);
    var lv = this._parentView[this._currentViewId];
    lv.resetPreviewPane(newPreviewStatus, oldPreviewStatus);
	//update view button icon to reflect current selection
	var btn = this._toolbar[this._currentViewId].getButton(ZmOperation.VIEW_MENU);
	if (btn) {
		btn.setImage(ZmBriefcaseController.PREVIEW_PANE_ICON[newPreviewStatus]);
	}

};

ZmBriefcaseController.CONVERTABLE = {
	doc:/\.doc$/i,
	xls:/\.xls$/i,
	pdf:/\.pdf$/i,
	ppt:/\.ppt$/i,
	zip:/\.zip$/i,
    txt:/\.txt$/i
};

ZmBriefcaseController.prototype.isConvertable =
function(item) {
	var name = item.name;
	for (var type in ZmBriefcaseController.CONVERTABLE) {
		var regex = ZmBriefcaseController.CONVERTABLE[type];
		if (name.match(regex)) {
			return true;
		}
	}
	return false;
};

ZmBriefcaseController.prototype._fileListChangeListener =
function(ev) {
	if (ev.handled) { return; }
	var details = ev._details;
	if (!details) { return; }
	this._list._notify(ev.event,{items:details.items});
};

ZmBriefcaseController.prototype.getCurrentView =
function() {
	return this._parentView[this._currentViewId];
};
ZmBriefcaseController.prototype.getParentView = ZmBriefcaseController.prototype.getCurrentView;

ZmBriefcaseController.prototype._addListListeners =
function(colView) {
	colView.addActionListener(new AjxListener(this, this._listActionListener));
};

ZmBriefcaseController.prototype.isMultiColView =
function() {
	return (this._currentViewType == ZmId.VIEW_BRIEFCASE_COLUMN);
};

ZmBriefcaseController.prototype.mapSupported =
function(map) {
	return (map == "list" && (this._currentViewType != ZmId.VIEW_BRIEFCASE));
};

ZmBriefcaseController.prototype.getItemTooltip =
function(item, listView) {

	if (item.isFolder) { return null; }

	var prop = [{name:ZmMsg.briefcasePropName, value:item.name}];
	if (item.size) {
		prop.push({name:ZmMsg.briefcasePropSize, value:AjxUtil.formatSize(item.size)});
	}
	if (item.contentChangeDate) {
		var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
		var dateStr = dateFormatter.format(item.contentChangeDate);
		prop.push({name:ZmMsg.briefcasePropModified, value:dateStr});
	}

	var subs = {
		fileProperties: prop,
		tagTooltip: listView._getTagToolTip(item)
	};
	return AjxTemplate.expand("briefcase.Briefcase#Tooltip", subs);
};

ZmBriefcaseController.prototype._getDateInLocaleFormat =
function(date) {
	var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
	return dateFormatter.format(date);
};

ZmBriefcaseController.prototype._resetToolbarOperations =
function() {
	if (this._listView[this._currentViewId] != null) {
		this._resetOperations(this._toolbar[this._currentViewId], this._listView[this._currentViewId].getSelectionCount());
	}
};

// item count doesn't include subfolders
ZmBriefcaseController.prototype._getItemCount =
function() {
	var lv = this._listView[this._currentViewId];
	var list = lv && lv._list;
	if (!list) { return null; }
	var a = list.getArray();
	var num = 0;
	for (var i = 0, len = a.length; i < len; i++) {
		var item = a[i];
		if (item && item.type == ZmItem.BRIEFCASE_ITEM && !item.isFolder) {
			num++;
		}
	}
	return num;
};


ZmBriefcaseController.prototype.handleCreateNotify =
function(create){

    if(this.isMultiColView()){
        var isTrash = (this._folderId == String(ZmOrganizer.ID_TRASH));
        if(!isTrash)
            this.getCurrentView().handleNotifyCreate(create);
    }else{
        var list = this.getList();
        if (list) {
            var item = ZmBriefcaseItem.createFromDom(create, {list:list});
            if (list.search && list.search.matches(item)) {
                list.notifyCreate(create);
            }
        }
    }
};

ZmBriefcaseController.prototype.handleModifyNotify =
function(modifies){
    var view = this._listView[this._currentViewId];
    if (view) {
        view.deselectAll();
	}
    this._resetToolbarOperations();
};

ZmBriefcaseController.prototype._actionErrorCallback =
function(ex){

    var handled = false;
    if(ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS){
        handled = true;
        var dlg = appCtxt.getMsgDialog();
        dlg.setMessage(ZmMsg.errorFileAlreadyExistsResolution, DwtMessageDialog.WARNING_STYLE);
        dlg.popup();
    }

    return handled;
};


//Add to Briefcase

ZmBriefcaseController.prototype.createFromAttachment =
function(msgId, partId, name){

     var dlg = this._saveAttDialog = appCtxt.getChooseFolderDialog();
	 var chooseCb = new AjxCallback(this, this._chooserCallback, [msgId, partId, name]);
	 ZmController.showDialog(dlg, chooseCb, this._getCopyParams(dlg, msgId, partId));

};

ZmBriefcaseController.prototype._getCopyParams =
function(dlg, msgId, partId) {
	var params = {
		data:			{msgId:msgId,partId:partId},
		treeIds:		[ZmOrganizer.BRIEFCASE],
		overviewId:		dlg.getOverviewId(this._app._name),
		title:			ZmMsg.addToBriefcaseTitle,
		description:	ZmMsg.targetFolder,
		appName:		ZmApp.BRIEFCASE,
		noRootSelect:	true
	};
    params.omit = {};
    params.omit[ZmFolder.ID_DRAFTS] = true;
    params.omit[ZmFolder.ID_TRASH] = true;
    return params;
};

ZmBriefcaseController.prototype._chooserCallback =
function(msgId, partId, name, folder) {
    //TODO: Avoid using search, instead try renaming on failure
	var callback = new AjxCallback(this, this._handleDuplicateCheck, [msgId, partId, name, folder]);
	this._app.search({query:folder.createQuery(), noRender:true, callback:callback, accountName:(folder && folder.account && folder.account.name) || undefined});
};

ZmBriefcaseController.prototype._handleDuplicateCheck =
function(msgId, partId, name, folder, results) {

	var msg = appCtxt.getById(msgId);

	var briefcase = folder;
	if (briefcase.isReadOnly(folder.id)) {
		ZmOrganizer._showErrorMsg(ZmMsg.errorPermission);
		return;
	}

	if (msgId.indexOf(":") < 0) {
		msgId = msg.getAccount().id + ":" + msg.id;
	}


	var searchResult = results.getResponse();
	var items = searchResult && searchResult.getResults(ZmItem.BRIEFCASE_ITEM);
	if (items instanceof ZmList) {
		items = items.getArray();
	}

    var itemFound = false;
	for (var i = 0, len = items.length; i < len; i++) {
		if (items[i].name == name) {
			itemFound = items[i];
			break;
		}
	}

    var folderId = (!folder.account || folder.account == appCtxt.getActiveAccount() || (folder.id.indexOf(":") != -1)) ? folder.id : [folder.account.id, folder.id].join(":");
    if(itemFound){
        var dlg = this._conflictDialog = this._getFileConflictDialog();
        dlg.setButtonListener(DwtDialog.OK_BUTTON, this._handleConflictDialog.bind(this, msgId, partId, name, folderId, itemFound));
		dlg.setEnterListener(DwtDialog.OK_BUTTON, this._handleConflictDialog.bind(this, msgId, partId, name, folderId, itemFound));
	    this._renameField.value = "";
	    dlg.popup();
    }else{
       this._createFromAttachment(msgId, partId, name, folderId);
    }

    if(this._saveAttDialog.isPoppedUp())
        this._saveAttDialog.popdown();
};

ZmBriefcaseController.prototype._popupConflictDialog = 
function(dlg) {
	if (dlg) {
		dlg.popdown();
	}
	if (!this._conflictDialog) {
		this._conflictDialog = this._getFileConflictDialog();
	}
	this._conflictDialog.popup();
};

ZmBriefcaseController.prototype._handleConflictDialog =
function(msgId, partId, name, folderId, itemFound){

    var attribs = {};
    if(this._renameRadio.checked){
        var newName = this._renameField.value;
        var errorMsg = this.checkInvalidFileName(newName, itemFound && itemFound.name);
        if(errorMsg){
		    var dialog = appCtxt.getMsgDialog();
		    dialog.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
		    dialog.popup();
		    return false;
        }
        attribs.rename = newName;
    }else{
        attribs.id = itemFound.id;
        attribs.version = itemFound.version;
    }
	this._conflictDialog.popdown(); //hide dialog so user doesn't get it into a state that can be hung
    this._createFromAttachment(msgId, partId, name, folderId, attribs);
};

ZmBriefcaseController.prototype.checkInvalidFileName =
function(fileName, itemFound) {

    var message;
    fileName = fileName.replace(/^\s+/,"").replace(/\s+$/,"");

    if(fileName == ""){
        message = ZmMsg.emptyDocName;
    }
    else if (!ZmOrganizer.VALID_NAME_RE.test(fileName)) {
        message = AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(fileName));
    } 
    else if (fileName.length > ZmOrganizer.MAX_NAME_LENGTH){
        message = AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);
    }
	else if (itemFound === fileName) {
	    message = AjxMessageFormat.format(ZmMsg.errorFileExistsWarning, AjxStringUtil.htmlEncode(fileName));
    }

    return message;
};

ZmBriefcaseController.prototype._createFromAttachment =
function(msgId, partId, name, folderId, attribs){

    attribs = attribs || {};
    if(attribs.id || attribs.rename)
        attribs.callback = new AjxCallback(this, this._handleSuccessCreateFromAttachment, [msgId, partId, name, folderId]);
    if(attribs.rename)
        attribs.errorCallback = new AjxCallback(this, this._handleErrorCreateFromAttachment, [msgId, partId, attribs.rename, folderId]);

    var srcData = new ZmBriefcaseItem();
    srcData.createFromAttachment(msgId, partId, name, folderId, attribs);
};

ZmBriefcaseController.prototype._handleSuccessCreateFromAttachment =
function(msgId, partId, name, folderId, response){
    if(this._conflictDialog){
        this._renameField.value = "";
        this._conflictDialog.popdown();
    }
};

ZmBriefcaseController.prototype._handleErrorCreateFromAttachment =
function(msgId, partId, name, folderId, ex){

    var handled = false;
    if(ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS){
        handled = true;
        var dlg = appCtxt.getMsgDialog();
        dlg.setMessage(AjxMessageFormat.format(ZmMsg.errorFileExistsWarning, name), DwtMessageDialog.WARNING_STYLE);
	    dlg.setButtonListener(DwtDialog.OK_BUTTON, this._popupConflictDialog.bind(this, dlg));
        dlg.popup();
    }

    return handled;
};

ZmBriefcaseController.prototype._getFileConflictDialog =
    function(){
        if(!this._nameConflictDialog){

            var dlg = new DwtMessageDialog({parent:appCtxt.getShell(), buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON],
                id: "Briefcase_FileConflictDialog"});
            this._nameConflictDialog = dlg;
            var id = this._nameConflictId = Dwt.getNextId();
            dlg.setTitle(ZmMsg.addToBriefcaseTitle);
            dlg.setContent(AjxTemplate.expand("briefcase.Briefcase#NameConflictDialog", {id: id}));

            this._renameRadio = document.getElementById(id+'_rename');
            this._renameField = document.getElementById(id+'_newname');

        }
        return this._nameConflictDialog;
    };

ZmBriefcaseController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_BRIEFCASE;
};

ZmBriefcaseController.prototype.handleKeyAction =
function(actionCode) {
	DBG.println(AjxDebug.DBG3, "ZmBriefcaseController.handleKeyAction");

    switch(actionCode) {

        case ZmKeyMap.READING_PANE_BOTTOM:
		case ZmKeyMap.READING_PANE_RIGHT:
		case ZmKeyMap.READING_PANE_OFF:
			var menuId = ZmBriefcaseController.ACTION_CODE_TO_MENU_ID[actionCode];
			this._previewPaneListener(menuId, true);
			break;

        default:
            return ZmListController.prototype.handleKeyAction.call(this, actionCode);
    }
    return true;
};

/**
 * Tag/untag items
 *
 * @private
 */
ZmBriefcaseController.prototype._doTag =
function(items, tag, doTag) {
	items = AjxUtil.toArray(items);
	if (!items.length) { return; }
	
	for (var i=0; i<items.length; i++) {
		if (items[i].isRevision) {
			items[i] = items[i].parent;
		}	
	}
	return ZmListController.prototype._doTag.call(this, items, tag, doTag);
};


/**
 * Moves a list of items to the given folder. Any item already in that folder is excluded.
 *
 * @param {Array}	items		a list of items to move
 * @param {ZmFolder}	folder		the destination folder
 * @param {Object}	attrs		the additional attrs for SOAP command
 * @param {Boolean}		isShiftKey	<code>true</code> if forcing a copy action
 * @param {Boolean}		noUndo	<code>true</code> undo not allowed
 * @private
 */
ZmBriefcaseController.prototype._doMove =
function(items, folder, attrs, isShiftKey, noUndo) {
	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	for (var i=0; i<items.length; i++) {
		if (items[i].isRevision) {
			items[i] = items[i].parent;
		}
	}
	return ZmListController.prototype._doMove.call(this, items, folder, attrs, isShiftKey, noUndo);
};

/**
 * Remove all tags for given items
 *
 * @private
 */
ZmBriefcaseController.prototype._doRemoveAllTags =
function(items) {

	items = AjxUtil.toArray(items);
	if (!items.length) { return; }

	for (var i=0; i<items.length; i++) {
		if (items[i].isRevision) {
			items[i] = items[i].parent;
		}
	}
	return ZmListController.prototype._doRemoveAllTags.call(this, items);
};

/*
** Using iframe provides a barrier to block any object below it
*/
ZmBriefcaseController._onDeleteDialogPopup = function(dialog) {
	var veilOverlay = appCtxt.getShell()._veilOverlay;
	if (!veilOverlay) {
		return;
	}
	var iframe = document.createElement("IFRAME");
	iframe.style.cssText = veilOverlay.style.cssText;
	iframe.style.zIndex = veilOverlay.style.zIndex - 1;
	document.body.appendChild(iframe);
	var onDeleteDialogPopdown = function(dialog) {
		iframe.parentNode.removeChild(iframe);
		dialog.removePopupListener(ZmBriefcaseController._onDeleteDialogPopup);
		dialog.removePopdownListener(onDeleteDialogPopdown);
	};
	dialog.addPopdownListener(onDeleteDialogPopdown);
};
