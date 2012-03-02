/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
	this._listeners[ZmOperation.CREATE_SLIDE_SHOW]	= this._createSlideShow.bind(this);
    this._listeners[ZmOperation.EDIT_FILE]			= this._editFileListener.bind(this);
    this._listeners[ZmOperation.RENAME_FILE]		= this._renameFileListener.bind(this);
    this._listeners[ZmOperation.NEW_BRIEFCASE_WIN]	= this._newWinListener.bind(this);

	this._listeners[ZmOperation.NEW_SPREADSHEET]	= this._handleDoc.bind(this, ZmOperation.NEW_SPREADSHEET);
	this._listeners[ZmOperation.NEW_PRESENTATION]	= this._handleDoc.bind(this, ZmOperation.NEW_PRESENTATION);
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
	if (appCtxt.get(ZmSetting.SPREADSHEET_ENABLED)) {
		list.push(ZmOperation.NEW_SPREADSHEET,ZmOperation.SEP);
	}
	if (appCtxt.get(ZmSetting.SLIDES_ENABLED)) {
		list.push(ZmOperation.NEW_PRESENTATION,ZmOperation.SEP);
	}
	list.push(ZmOperation.NEW_BRIEFCASE_WIN, ZmOperation.SEP);

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


    ops.push(ZmOperation.VIEW_MENU);

	return ops;
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
        deleteButton.setToolTipContent(ZmOperation.getToolTip(ZmOperation.DELETE, ZmKeyMap.MAP_NAME_R[this.getKeyMapName()], tooltip));
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
    var hasHighestRevisionSelected = false;
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
    var isRevision = item && item.isRevision;
	
	parent.enable([ZmOperation.SEND_FILE, ZmOperation.SEND_FILE_AS_ATT], (isZimbraAccount && isMailEnabled && isItemSelected && !isMultiFolder && !isFolderSelected));
	parent.enable(ZmOperation.TAG_MENU, (!isShared && isItemSelected && !isFolderSelected && !isRevision));
	parent.enable([ZmOperation.NEW_FILE, ZmOperation.VIEW_MENU], true);
	parent.enable([ZmOperation.NEW_SPREADSHEET, ZmOperation.NEW_PRESENTATION, ZmOperation.NEW_DOC], true);
	parent.enable([ZmOperation.MOVE, ZmOperation.MOVE_MENU], ( isItemSelected &&  !isReadOnly && !isShared && !isRevision));
    parent.enable(ZmOperation.NEW_FILE, !(isTrash || isReadOnly));
    parent.enable(ZmOperation.NEW_BRIEFCASE_WIN, (isItemSelected && !isFolderSelected));

    var firstItem = items && items[0];
    var isWebDoc = firstItem && !firstItem.isFolder && firstItem.isWebDoc();
    var isLocked = firstItem && !firstItem.isFolder && firstItem.locked;
    var isLockOwner = isLocked && (item.lockUser == appCtxt.getActiveAccount().name);


    //Rename Operation
    parent.enable(ZmOperation.RENAME_FILE, ( num ==1 && !isFolderSelected && !isReadOnly && !isRevision && (isLocked ? isLockOwner : true) ));

    //Download - Files
    parent.enable(ZmOperation.SAVE_FILE, num >0 && (!isFolderSelected || isBriefcaseItemSelected));

    // Edit
    parent.enable(ZmOperation.OPEN_FILE, (num == 1 && isWebDoc));
    parent.enable(ZmOperation.EDIT_FILE, !isReadOnly && (  !isLocked || isLockOwner ) && isWebDoc && !isRevision && num == 1);

    //Delete Operation
    parent.enable(ZmOperation.DELETE, (!isReadOnly && isItemSelected && !isMixedSelected && (isLocked ? isLockOwner : true) &&  (isRevision ? !hasHighestRevisionSelected : true )));

    if(parent &&  parent instanceof ZmActionMenu){

        //Open - webDocs
        parent.getOp(ZmOperation.OPEN_FILE) && parent.getOp(ZmOperation.OPEN_FILE).setVisible(isItemSelected && !isMultiFolder && isWebDoc);

	}
	//Case 1: Multiple Admins
	//Case 2: Stale Lock ( Handle exception )

	//Checkin
	var op = parent.getOp(ZmOperation.CHECKIN);
	if (op) {
		var checkinEnabled = !isReadOnly && isLockOwner && !isWebDoc && !isRevision;
		op.setVisible(checkinEnabled);
		parent.enable(ZmOperation.CHECKIN, checkinEnabled && num == 1);
	}

	//Checkout
	op = parent.getOp(ZmOperation.CHECKOUT);
	if (op) {
		var checkoutEnabled = !isReadOnly && !hasLocked && !isRevisionSelected;
		op.setVisible(!isRevision && !isLocked);
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
		var versionEnabled = (!isReadOnly && num == 1 && isRevision);
		var isHightestVersion = item && item.isRevision && ( item.parent.version == item.version );
		op.setVisible(isRevision);
		parent.enable(ZmOperation.RESTORE_VERSION, versionEnabled && !isHightestVersion);
	}

    var isDocOpEnabled = !(isTrash || isReadOnly);
    if (appCtxt.get(ZmSetting.DOCS_ENABLED)) {
        parent.enable(ZmOperation.NEW_DOC, isDocOpEnabled);
    }
    if (appCtxt.get(ZmSetting.SPREADSHEET_ENABLED)) {
        parent.enable(ZmOperation.NEW_SPREADSHEET, isDocOpEnabled);
    }
    if (appCtxt.get(ZmSetting.SLIDES_ENABLED)) {
        parent.enable(ZmOperation.NEW_PRESENTATION, isDocOpEnabled);
        parent.enable(ZmOperation.CREATE_SLIDE_SHOW, isDocOpEnabled && isItemSelected);
    }
};

ZmBriefcaseController.prototype._getTagMenuMsg =
function() {
	return ZmMsg.tagFile;
};

ZmBriefcaseController.prototype._doDelete =
function(items) {

	if (!items) {
		items = this._listView[this._currentViewId].getSelection();
	}
    var item = (items instanceof Array) ? items[0] : items;
    if(!item) return;

	var message = ( items.length > 1 ) ?  ( item.isRevision ? ZmMsg.confirmPermanentDeleteItemList : ZmMsg.confirmDeleteItemList ) : null;
	if (!message) {
        var delMsgFormatter = new AjxMessageFormat( (this._folderId == String(ZmOrganizer.ID_TRASH) || item.isRevision ) ? ZmMsg.confirmPermanentDeleteItem : ZmMsg.confirmDeleteItem );
		message = delMsgFormatter.format(AjxStringUtil.htmlEncode(item.name));
	}

    var dialog = appCtxt.getConfirmationDialog();
	dialog.popup(message, new AjxCallback(this, this._doDelete2, [items]));
};

ZmBriefcaseController.prototype._doDelete2 =
function(items) {

    var item = (items instanceof Array) ? items[0] : items;

    if(item.isRevision){
        var view = this._parentView[this._currentViewId];
        view.deleteVersions(items);
    }else if(item.isFolder){
        var delBatchCmd = new ZmBatchCommand(true), folder;
        for(var i=0; i< items.length; i++){
            folder = items[i].folder;
            if(folder.isHardDelete()){
                delBatchCmd.add(new AjxCallback(folder, folder._delete, [delBatchCmd]));
            }else{
                var trashFolder = appCtxt.getById(ZmFolder.ID_TRASH);
                delBatchCmd.add(new AjxCallback(folder, folder.move, [trashFolder, false, null, delBatchCmd]));
            }
        }
        delBatchCmd.run();
    }else{
        ZmListController.prototype._doDelete.call(this, items, null, null, true);
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
	var bcv = this._parentView[view];    
	bcv.set(this._list, this._switchView);
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
					elements:	elements,
					isAppView:	true});
	this._resetNavToolBarButtons();
};

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
        uploadDialog.setConflictAction(ZmUploadDialog.ACTION_KEEP_MINE);
        uploadDialog.popup(cFolder, callback, title, null, false, true, true);
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
			restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
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
        dlg.popup(item, new AjxCallback(this, this._doneCheckin, item));
    }
};

ZmBriefcaseController.prototype._doneCheckin =
function(item, file){
    //Update item attribs
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
        ZmOperation.EDIT_FILE,            
		ZmOperation.SEND_FILE,
		ZmOperation.SEND_FILE_AS_ATT
	];	
    if (appCtxt.get(ZmSetting.SLIDES_ENABLED)) {
		list.push(ZmOperation.CREATE_SLIDE_SHOW);
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
        var restUrl = item.getRestUrl(false, false, true); //get the URL with version number so even on IE9 it would always be the latest.
        if (restUrl) {

            if (item.isWebDoc()) {
                //added for bug: 45150
                restUrl = AjxStringUtil.fixCrossDomainReference(restUrl);
                restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
                restUrl += (restUrl.match(/\?/) ? '&' : '?') + "action=edit&localeId=" + AjxEnv.DEFAULT_LOCALE;
                window.open(restUrl, this._getWindowName(item.name), "");
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
			restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
			restUrl += (restUrl.match(/\?/) ? "&" : "?") + "localeId=" + AjxEnv.DEFAULT_LOCALE;
		} else {
            // do not try to
            //ZD doesn't support ConvertD.
			if (!ZmMimeTable.isRenderable(item.contentType) && !ZmMimeTable.isMultiMedia(item.contentType) && !appCtxt.isOffline) {
               	restUrl += (restUrl.match(/\?/) ? "&" : "?") + "view=html";
			}
        }

        
        this._fileInfo={
            "restUrl":restUrl,
            "name":this._getWindowName(item.name),
            "features":item.isWebDoc() ? "" : ZmBriefcaseApp.getDocWindowFeatures()
        }

		var ta = new AjxTimedAction(this, this._openChild);
		AjxTimedAction.scheduleAction(ta, 100);

	}
};

ZmBriefcaseController.prototype._openChild =
function(){
    if(this._fileInfo){
     var opener = window.open(this._fileInfo.restUrl, this._fileInfo.name, this._fileInfo.features);
     opener.focus();
    }
    this._fileInfo = null;
}

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
        restUrl += "?disp=a"+(item.version ? "&ver="+item.version : "");
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

ZmBriefcaseController.prototype._handlePostUpload =
function(folder, filenames, files){
     var msg = ZmMsg.successfullyUploaded;
     if(files.length > 1){
         msg = AjxMessageFormat.format(ZmMsg.successfullyUploadedFiles, files.length);
     }
     appCtxt.setStatusMsg(msg, ZmStatusView.LEVEL_INFO);    
};

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
    var enabled = (view == ZmId.VIEW_BRIEFCASE_DETAIL);
    var ids = ZmDoublePaneController.RP_IDS;    
    for (var i = 0; i < ids.length; i++) {
		var id = ids[i];
		if (menu._menuItems[id]) {
            menu._menuItems[id].setEnabled(enabled);
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
	if (this.isSearchResults) {
		this._readingPaneLoc = value;
	}
	else {
		appCtxt.set(ZmSetting.READING_PANE_LOCATION_BRIEFCASE, value);
	}
};

ZmBriefcaseController.prototype._previewPaneListener =
function(newPreviewStatus){
    var oldPreviewStatus = appCtxt.get(ZmSetting.READING_PANE_LOCATION_BRIEFCASE);
    appCtxt.set(ZmSetting.READING_PANE_LOCATION_BRIEFCASE, newPreviewStatus);
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
	if (item.modifyDate) {
		var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
		var dateStr = dateFormatter.format(item.modifyDate);
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

ZmBriefcaseController.prototype._createSlideShow =
function() {
	var importSlidesQueue = [];
	var view = this._listView[this._currentViewId];
	var items = view.getSelection();
	if (!items) { return; }

	items = AjxUtil.toArray(items);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var restUrl = item.getRestUrl();
		if(item && !item.isFolder && restUrl != null) {
			importSlidesQueue.push(restUrl);
		}
	}
	window.importSlides = true;
	window.importSlidesQueue = importSlidesQueue;
	this._app.handleOp(ZmOperation.NEW_PRESENTATION);
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
		appName:		ZmApp.BRIEFCASE
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
        dlg.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._handleConflictDialog, [msgId, partId, name, folderId, itemFound]))
		dlg.popup();
    }else{
       this._createFromAttachment(msgId, partId, name, folderId);
    }

    if(this._saveAttDialog.isPoppedUp())
        this._saveAttDialog.popdown();
};

ZmBriefcaseController.prototype._handleConflictDialog =
function(msgId, partId, name, folderId, itemFound){

    var attribs = {};
    if(this._renameRadio.checked){
        var newName = this._renameField.value;
        var errorMsg = this.checkInvalidFileName(newName);
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

    this._createFromAttachment(msgId, partId, name, folderId, attribs);
};

ZmBriefcaseController.prototype.checkInvalidFileName =
function(fileName) {

    var message;
    fileName = fileName.replace(/^\s+/,"").replace(/\s+$/,"");

    if(fileName == ""){
        message = ZmMsg.emptyDocName;
    }else if (!ZmOrganizer.VALID_NAME_RE.test(fileName)) {
        message = AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(fileName));
    } else if ( fileName.length > ZmOrganizer.MAX_NAME_LENGTH){
        message = AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);
    }

    return message;
};

ZmBriefcaseController.prototype._createFromAttachment =
function(msgId, partId, name, folderId, attribs){

    attribs = attribs || {};
    if(attribs.id || attribs.rename)
        attribs.callback = new AjxCallback(this, this._handleSuccessCreateFromAttachment, [msgId, partId, name, folderId]);
    if(attribs.rename)
        attribs.errorCallback = new AjxCallback(this, this._handleErrorCreateFromAttachment, [msgId, partId, name, folderId]);

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
        dlg.popup();
    }

    return handled;
};

ZmBriefcaseController.prototype._getFileConflictDialog =
function(){
    if(!this._nameConflictDialog){
       var dlg = this._nameConflictDialog = new DwtDialog({parent:appCtxt.getShell()});
       var id = this._nameConflictId = Dwt.getNextId();
       dlg.setContent(AjxTemplate.expand("briefcase.Briefcase#NameConflictDialog", {id: id}));
       dlg.setTitle(ZmMsg.addToBriefcaseTitle);

       this._renameRadio = document.getElementById(id+'_rename');
       this._renameField = document.getElementById(id+'_newname');

    }
    return this._nameConflictDialog;
};

ZmBriefcaseController.prototype.getKeyMapName =
function() {
	return "ZmBriefcaseController";
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