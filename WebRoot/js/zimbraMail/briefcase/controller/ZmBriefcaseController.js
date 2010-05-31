/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @param	{DwtControl}	container		the container
 * @param	{ZmBriefcaseApp}	abApp	the briefcase application
 * 
 * @extends		ZmListController
 */
ZmBriefcaseController = function(container, app) {

 	if (arguments.length == 0) { return; }

	ZmListController.call(this, container, app);

	this._idMap = {};

	this._listChangeListener = new AjxListener(this,this._fileListChangeListener);
	this._listeners[ZmOperation.OPEN_FILE] = new AjxListener(this, this._openFileListener);
	this._listeners[ZmOperation.SAVE_FILE] = new AjxListener(this, this._saveFileListener);
	this._listeners[ZmOperation.SEND_FILE] = new AjxListener(this, this._sendFileListener);
	this._listeners[ZmOperation.SEND_FILE_AS_ATT] = new AjxListener(this, this._sendFileAsAttachmentListener);
	this._listeners[ZmOperation.NEW_FILE] = new AjxListener(this, this._uploadFileListener);
	this._listeners[ZmOperation.VIEW_FILE_AS_HTML] = new AjxListener(this, this._viewAsHtmlListener);
	this._listeners[ZmOperation.CREATE_SLIDE_SHOW] = new AjxListener(this, this._createSlideShow);
    this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editFileListener);

	this._listeners[ZmOperation.NEW_SPREADSHEET] = new AjxListener(this, this._handleDoc, [ZmOperation.NEW_SPREADSHEET]);
	this._listeners[ZmOperation.NEW_PRESENTATION] = new AjxListener(this, this._handleDoc, [ZmOperation.NEW_PRESENTATION]);
	this._listeners[ZmOperation.NEW_DOC] = new AjxListener(this, this._handleDoc, [ZmOperation.NEW_DOC]);

	this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
	this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));

    this._parentView = {};
};

ZmBriefcaseController.prototype = new ZmListController;
ZmBriefcaseController.prototype.constructor = ZmBriefcaseController;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseController.prototype.toString =
function() {
	return "ZmBriefcaseController";
};

// Constants
ZmBriefcaseController._VIEWS = {};
ZmBriefcaseController._VIEWS[ZmId.VIEW_BRIEFCASE]			= "ZmBriefcaseView";
ZmBriefcaseController._VIEWS[ZmId.VIEW_BRIEFCASE_DETAIL]	= "ZmDetailListView";
ZmBriefcaseController._VIEWS[ZmId.VIEW_BRIEFCASE_COLUMN]	= "ZmMultiColView";
ZmBriefcaseController._VIEWS[ZmId.VIEW_BRIEFCASE_PREVIEW]	= "ZmBriefcaseSplitView";

// Stuff for the View menu
ZmBriefcaseController.GROUP_BY_ICON = {};
ZmBriefcaseController.GROUP_BY_MSG_KEY = {};
ZmBriefcaseController.GROUP_BY_VIEWS = [];

ZmBriefcaseController.GROUP_BY_MSG_KEY[ZmId.VIEW_BRIEFCASE]			= "explorerView";
ZmBriefcaseController.GROUP_BY_MSG_KEY[ZmId.VIEW_BRIEFCASE_DETAIL]	= "detailView";
ZmBriefcaseController.GROUP_BY_MSG_KEY[ZmId.VIEW_BRIEFCASE_COLUMN]	= "columnBrowserView";
ZmBriefcaseController.GROUP_BY_MSG_KEY[ZmId.VIEW_BRIEFCASE_PREVIEW]	= "previewView";

ZmBriefcaseController.GROUP_BY_ICON[ZmId.VIEW_BRIEFCASE]			= "Folder";
ZmBriefcaseController.GROUP_BY_ICON[ZmId.VIEW_BRIEFCASE_DETAIL]		= "ListView";
ZmBriefcaseController.GROUP_BY_ICON[ZmId.VIEW_BRIEFCASE_COLUMN]		= "ListView";
ZmBriefcaseController.GROUP_BY_ICON[ZmId.VIEW_BRIEFCASE_PREVIEW]	= "ListView";

ZmBriefcaseController.GROUP_BY_VIEWS.push(ZmId.VIEW_BRIEFCASE);
ZmBriefcaseController.GROUP_BY_VIEWS.push(ZmId.VIEW_BRIEFCASE_DETAIL);
ZmBriefcaseController.GROUP_BY_VIEWS.push(ZmId.VIEW_BRIEFCASE_COLUMN);
ZmBriefcaseController.GROUP_BY_VIEWS.push(ZmId.VIEW_BRIEFCASE_PREVIEW);

ZmBriefcaseController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.MOVE];
};

ZmBriefcaseController.prototype._getToolBarOps =
function() {
    var ops = [ZmOperation.NEW_MENU,
			ZmOperation.SEP,
			ZmOperation.NEW_FILE,
			ZmOperation.SEP,
			ZmOperation.DELETE, ZmOperation.MOVE,
			ZmOperation.SEP,
			ZmOperation.TAG_MENU,
			ZmOperation.SEP,
			ZmOperation.VIEW_MENU,
			ZmOperation.SEP];

	if (appCtxt.get(ZmSetting.DOCS_ENABLED)) {
		   ops.push(ZmOperation.NEW_DOC);
	}
	if (appCtxt.get(ZmSetting.SPREADSHEET_ENABLED)) {
		ops.push(ZmOperation.NEW_SPREADSHEET);
	}
	if (appCtxt.get(ZmSetting.SLIDES_ENABLED)) {
		ops.push(ZmOperation.NEW_PRESENTATION);
	}

	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		ops.push(ZmOperation.SEND_FILE_MENU);
	}

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
		this._setNewButtonProps(view, ZmMsg.uploadNewFile, "NewPage", "NewPageDis", ZmOperation.NEW_FILE);
		var toolbar = this._toolbar[view];
		button = toolbar.getButton(ZmOperation.DELETE);
		button.setToolTipContent(ZmMsg.deletePermanentTooltip);
		this._initSendMenu(view);
		toolbar.addFiller();
		this._initializeNavToolBar(view);
		appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, view], {waitUntilLoaded:true});
	} else {
		this._setupViewMenu(view, false);
	}
};

ZmBriefcaseController.prototype._initializeNavToolBar =
function(view) {
	this._toolbar[view].addOp(ZmOperation.TEXT);
	var text = this._itemCountText[view] = this._toolbar[view].getButton(ZmOperation.TEXT);
	text.addClassName("itemCountText");
};

ZmBriefcaseController.prototype._resetOperations =
function(parent, num) {
	if (!parent) { return; }

	// call base class
	ZmListController.prototype._resetOperations.call(this, parent, num);

	var isFolderSelected;
	var items = this._listView[this._currentView].getSelection();
	var noOfFolders = 0;
	if (items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.isFolder) {
				isFolderSelected = true;
				noOfFolders++;
			}
		}
	}

    var briefcase = appCtxt.getById(this._folderId);
    var isShared = ((briefcase && briefcase.nId != ZmOrganizer.ID_TRASH) && briefcase.isShared());
	var isReadOnly = briefcase ? briefcase.isReadOnly() : false;
	var isMultiFolder = (noOfFolders > 1);
	var isItemSelected = (num>0);
	var isZimbraAccount = appCtxt.getActiveAccount().isZimbraAccount;
	var isMailEnabled = appCtxt.get(ZmSetting.MAIL_ENABLED);

	if (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)) {
		var isViewHtmlEnabled = true;

		var items = this._listView[this._currentView].getSelection();
		if (items) {
			for (var i = 0; i < items.length; i++) {
				if (!this.isConvertable(items[i])) {
					isViewHtmlEnabled = false;
					break;
				}
			}
		}
		parent.enable([ZmOperation.VIEW_FILE_AS_HTML], (isItemSelected && isViewHtmlEnabled));
	}

	parent.enable([ZmOperation.SEND_FILE_MENU, ZmOperation.SEND_FILE, ZmOperation.SEND_FILE_AS_ATT], (isZimbraAccount && isMailEnabled && isItemSelected && !isMultiFolder && !isFolderSelected));
	parent.enable(ZmOperation.OPEN_FILE, (isItemSelected && !isMultiFolder));
	parent.enable(ZmOperation.DELETE, (!isReadOnly && isItemSelected));
	parent.enable(ZmOperation.TAG_MENU, (!isShared && isItemSelected && !isFolderSelected));
	parent.enable([ZmOperation.NEW_FILE, ZmOperation.VIEW_MENU], true);
	parent.enable([ZmOperation.NEW_SPREADSHEET, ZmOperation.NEW_PRESENTATION, ZmOperation.NEW_DOC], true);
	parent.enable(ZmOperation.MOVE, ( isItemSelected &&  !isReadOnly && !isShared));

    var isDocOpEnabled = !isReadOnly && (this._folderId != ZmFolder.ID_TRASH)
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
		items = this._listView[this._currentView].getSelection();
	}

	var dialog = appCtxt.getConfirmationDialog();
	var message = (items instanceof Array && items.length > 1) ? ZmMsg.confirmDeleteItemList : null;
	if (!message) {
		if (!this._confirmDeleteFormatter) {
			this._confirmDeleteFormatter = new AjxMessageFormat(ZmMsg.confirmDeleteItem);
		}

		var item = (items instanceof Array) ? items[0] : items;
		if (!item) { return; }
		message = this._confirmDeleteFormatter.format(AjxStringUtil.htmlEncode(item.name));
	}
	var callback = new AjxCallback(this, this._doDelete2, [items]);
	dialog.popup(message, callback);
};

ZmBriefcaseController.prototype._doDelete2 =
function(items) {
	ZmListController.prototype._doDelete.call(this, items);
};

// view management

ZmBriefcaseController.prototype._getViewType =
function() {
	return this._currentView;
};

ZmBriefcaseController.prototype._defaultView =
function() {
	return ZmId.VIEW_BRIEFCASE_COLUMN;
};

ZmBriefcaseController.prototype._createNewView =
function(view) {

    var viewCtor = eval(ZmBriefcaseController._VIEWS[view]);
	this._parentView[view] = new viewCtor(this._container, this, this._dropTgt);
	var listView = this._parentView[view].getListView();
	listView.setDragSource(this._dragSrc);

	return listView;
};

ZmBriefcaseController.prototype._setViewContents =
function(view) {
	var bcv = this._parentView[view];
	bcv.set(this._list);
};

ZmBriefcaseController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[this._currentView];
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
	this._list = results.getResults(ZmItem.BRIEFCASE_ITEM);
	this._list.setHasMore(results.getAttribute("more"));

	ZmListController.prototype.show.call(this, results, this._currentView);

	this._setup(this._currentView);

	// start fresh with search results
	var lv = this._listView[this._currentView];
	lv.offset = 0;
	lv._folderId = this._folderId;

	var elements = {};
	elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
	elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[this._currentView];//this.isMultiColView() ? this._multiColView : lv;

	this._setView({view:this._currentView, elements:elements, isAppView:true});
	this._resetNavToolBarButtons(this._currentView);
};

/**
 * Change how briefcase items are displayed.
 * 
 * @param {constant}	view			the view to show
 * @param {Boolean}	force			if <code>true</code>, render view even if it's the current view
 */
ZmBriefcaseController.prototype.switchView =
function(view, force) {

	var viewChanged = (force || view != this._currentView);

	if (viewChanged) {
		var mcv = this._parentView[ZmId.VIEW_BRIEFCASE_COLUMN];
		if (this.isMultiColView()) {
			// remember list columns in case we return to col view
			mcv.setCurrentListIndex(mcv._nextIndex - 1);
		}
		if (view == ZmId.VIEW_BRIEFCASE_COLUMN) {
			// preserve list columns
			mcv._noReset = true;
		}
		this._currentView = view;
		this._setup(view);
	}
	this._resetOperations(this._toolbar[view], 0);

	if (viewChanged) {
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[view];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._parentView[view]; /*this.isMultiColView() ? this._multiColView : this._listView[this._currentView];*/
		this._setView({view:view, elements:elements, isAppView:true});
		this._resetNavToolBarButtons(view);
	}
	Dwt.setTitle(this.getCurrentView().getTitle());
};

ZmBriefcaseController.prototype.getItemById =
function(itemId) {
	return (this._idMap[itemId] ? this._idMap[itemId].item : null);
};

ZmBriefcaseController.prototype.__popupUploadDialog =
function(callback, title) {

	var folderId = this._folderId || ZmOrganizer.ID_BRIEFCASE;
    if(this.chkFolderPermission(folderId)){
        var cFolder = appCtxt.getById(folderId);
		appCtxt.getUploadDialog().popup(cFolder, callback, title);
    }	
};

ZmBriefcaseController.prototype.chkFolderPermission =
function(folderId){
    var briefcase = appCtxt.getById(folderId);
    if(briefcase.isShared() && briefcase.isReadOnly()){
        var dialog = appCtxt.getMsgDialog();
        dialog.setMessage(ZmMsg.errorPermissionCreate, DwtMessageDialog.WARNING_STYLE);
        dialog.popup();
        return false;
    }
    return true;
};

ZmBriefcaseController.prototype._listSelectionListener =
function(ev) {

	ZmListController.prototype._listSelectionListener.call(this, ev);

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		var item = ev.item;
		var restUrl = item.getRestUrl();

        if (item.isWebDoc()) {
            //added for bug: 45150
            restUrl = this._app.fixCrossDomainReference(restUrl);
			restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
            restUrl = restUrl + "&preview=1" + "&localeId=" + AjxEnv.DEFAULT_LOCALE;
		}
        var name = item.name || 'Briefcase';
        if(AjxEnv.isIE)
            name = name.replace(/[^\w]/g,'');
		if (restUrl) {
            if(item.isDownloadable()) {
                location.href = restUrl;
            }else {
			    window.open(restUrl, name, item.isWebDoc() ? "" : ZmBriefcaseApp.getDocWindowFeatures());
            }
		}
	}
};

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

	var op = actionMenu.getOp(ZmOperation.SAVE_FILE);
	if (op) {
		op.setEnabled(item && item.isRealFile());
	}
    var op = actionMenu.getOp(ZmOperation.EDIT);
	if (op) {
		op.setEnabled(item && item.isWebDoc());
	}
};

ZmBriefcaseController.prototype._getActionMenuOps =
function() {
	var list = [
		ZmOperation.OPEN_FILE,
        ZmOperation.EDIT,    
		ZmOperation.SAVE_FILE,
		ZmOperation.SEND_FILE,
		ZmOperation.SEND_FILE_AS_ATT
	];
	if (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)) {
		list.push(ZmOperation.VIEW_FILE_AS_HTML);
	}
    if (appCtxt.get(ZmSetting.SLIDES_ENABLED)) {
		list.push(ZmOperation.CREATE_SLIDE_SHOW);
	}	
	list.push(ZmOperation.SEP);
	list = list.concat(this._standardActionMenuOps());
	return list;
};

ZmBriefcaseController.prototype._editFileListener =
function() {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	if (!items) { return; }
    this.editFile(items);

};

ZmBriefcaseController.prototype.editFile =
function(items){
    items = AjxUtil.toArray(items);
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var restUrl = item.getRestUrl();
        if (restUrl) {

            if (item.isWebDoc()) {
                //added for bug: 45150
                restUrl = this._app.fixCrossDomainReference(restUrl);
                restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
                restUrl = restUrl + "&localeId=" + AjxEnv.DEFAULT_LOCALE;
                window.open(restUrl, item.name, "");
            }
        }
    }
};

ZmBriefcaseController.prototype._openFileListener =
function() {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	if (!items) { return; }

    this.openFile(items);
};

ZmBriefcaseController.prototype.openFile =
function(items){
    items = AjxUtil.toArray(items);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var restUrl = item.getRestUrl();
		if (restUrl) {

            if (item.isWebDoc()) {
                //added for bug: 45150
                restUrl = this._app.fixCrossDomainReference(restUrl);
                restUrl = ZmBriefcaseApp.addEditorParam(restUrl);
                restUrl = restUrl + "&preview=1" + "&localeId=" + AjxEnv.DEFAULT_LOCALE;
			}
			window.open(restUrl, item.name, item.isWebDoc() ? "" : ZmBriefcaseApp.getDocWindowFeatures());
		}
	}
};

ZmBriefcaseController.prototype._saveFileListener =
function() {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	if (!items) { return; }

	items = AjxUtil.toArray(items);

	// Allow download to only one file.
    this._downloadFile(items[0]);
};

ZmBriefcaseController.prototype._downloadFile =
function(item){
    var restUrl = item.getRestUrl();
    if (item && restUrl) {
        // bug fix #36618 - force new window since some users may get prompted for auth
        window.open(restUrl+ "?disp=a");
    }

};

ZmBriefcaseController.prototype._viewAsHtmlListener =
function() {
	var view = this._listView[this._currentView];
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
	this._app._handleNewItem();
};

ZmBriefcaseController.prototype._sendFileListener =
function(event) {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	items = AjxUtil.toArray(items);

	var names = [];
	var urls = [];
	var inNewWindow = this._app._inNewWindow(event);

	var briefcase, shares;
	var noprompt = false;

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var url = item.getRestUrl();
		if (appCtxt.isOffline) {
			var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
			url = remoteUri + url.substring((url.indexOf("/",7)));
		}

        if(item.isWebDoc()) {
            url += (url.match(/\?/) ?  '&' : '?') + 'preview=1';
        }
        
		urls.push(url);
		names.push(item.name);

		if (noprompt) { continue; }

		briefcase = appCtxt.getById(item.folderId);
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
	var view = this._listView[this._currentView];
	var items = view.getSelection();

    this.sendFilesAsAttachment(items);	
};

ZmBriefcaseController.prototype.sendFilesAsAttachment =
function(items){

    items = AjxUtil.toArray(items);
    var docInfo = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        docInfo.push({id: item.id, ct: item.contentType, s: item.size});
    }

    if (docInfo.length == 0) { return; }

    var action = ZmOperation.NEW_MESSAGE;
    var msg = new ZmMailMsg();
    var toOverride;

    var cc = AjxDispatcher.run("GetComposeController");
    cc._setView({action:action, msg:msg, toOverride:toOverride, inNewWindow:false});
    var draftType = ZmComposeController.DRAFT_TYPE_AUTO;
    var callback = new AjxCallback(cc, cc._handleResponseSaveDraftListener, [draftType, null]);
    cc.sendDocs(docInfo, draftType, callback);
};

ZmBriefcaseController.prototype._resetOpForCurrentView =
function(num) {
	this._resetOperations(this._toolbar[this._currentView], num || 0);
};

ZmBriefcaseController.prototype._initSendMenu =
function(view) {

	var sendBtn = this._toolbar[view].getButton(ZmOperation.SEND_FILE_MENU);
	if (!sendBtn) { return; }

	var menu = new ZmPopupMenu(sendBtn);
	sendBtn.setMenu(menu);

	var sendOps = [ZmOperation.SEND_FILE, ZmOperation.SEND_FILE_AS_ATT];
	for (var i = 0; i < sendOps.length; i++) {
		var id = sendOps[i];
		var params = {
			image:ZmOperation.getProp(id, "image"),
			text:ZmMsg[ZmOperation.getProp(id, "textKey")]
		};
		var mi = menu.createMenuItem(id, params);
		mi.setData(ZmOperation.MENUITEM_ID, id);
		mi.addSelectionListener(this._listeners[id]);
	}
	return menu;
};

ZmBriefcaseController.prototype._setupViewMenu =
function(view, firstTime) {

	var btn;
	if (firstTime) {
		btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
		var menu = btn.getMenu();
		if (!menu) {
			menu = new ZmPopupMenu(btn);
			btn.setMenu(menu);
			for (var i = 0; i < ZmBriefcaseController.GROUP_BY_VIEWS.length; i++) {
				var id = ZmBriefcaseController.GROUP_BY_VIEWS[i];
                if(id == ZmId.VIEW_BRIEFCASE_PREVIEW && !appCtxt.get(ZmSetting.PREVIEW_ENABLED)) continue;
				var mi = menu.createMenuItem(id, {image:ZmBriefcaseController.GROUP_BY_ICON[id],
												  text:ZmMsg[ZmBriefcaseController.GROUP_BY_MSG_KEY[id]],
												  style:DwtMenuItem.RADIO_STYLE});
				mi.setData(ZmOperation.MENUITEM_ID, id);
				mi.addSelectionListener(this._listeners[ZmOperation.VIEW]);
			}
		}
	}

	// select menu item for current view
	btn = this._toolbar[view].getButton(ZmOperation.VIEW_MENU);
	var menu = btn && btn.getMenu();
	var mi = menu && menu.getItemById(ZmOperation.MENUITEM_ID, view);
	if (mi) {
		mi.setChecked(true, true);
	}

	// always reset the view menu button icon to reflect the current view
	btn.setImage(ZmBriefcaseController.GROUP_BY_ICON[view]);
};

ZmBriefcaseController.CONVERTABLE = {
	doc:/\.doc$/i,
	xls:/\.xls$/i,
	pdf:/\.pdf$/i,
	ppt:/\.ppt$/i,
	zip:/\.zip$/i
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

ZmBriefcaseController.prototype.addChangeListeners =
function() {
	var items = this._list.getArray();
	if (items) {
		var list = ((items instanceof Array) && items.length>0)
			? items[0].list : items.list;
		if (list) {
			list.addChangeListener(this._listChangeListener);
		}
	}
};

ZmBriefcaseController.prototype._fileListChangeListener =
function(ev) {
	if (ev.handled) { return; }
	var details = ev._details;
	if (!details) { return; }
	this._list._notify(ev.event,{items:details.items});
};

ZmBriefcaseController.prototype.getParentView =
function() {
	return this._parentView[this._currentView];
};

ZmBriefcaseController.prototype._addListListeners =
function(colView) {
	colView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
	colView.addActionListener(new AjxListener(this, this._listActionListener));
};

ZmBriefcaseController.prototype.isMultiColView =
function() {
	return (this._currentView == ZmId.VIEW_BRIEFCASE_COLUMN);
};

ZmBriefcaseController.prototype.mapSupported =
function(map) {
	return (map == "list" && (this._currentView != ZmId.VIEW_BRIEFCASE));
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
	if (this._listView[this._currentView] != null) {
		this._resetOperations(this._toolbar[this._currentView], this._listView[this._currentView].getSelectionCount());
	}
};

ZmBriefcaseController.prototype._createSlideShow =
function() {
	var importSlidesQueue = [];
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	if (!items) { return; }

	items = AjxUtil.toArray(items);
	for (var i in items) {
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
