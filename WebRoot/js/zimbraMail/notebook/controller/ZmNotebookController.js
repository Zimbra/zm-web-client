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

ZmNotebookController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, app);

	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	//this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._uploadListener);
	this._listeners[ZmOperation.SEND_PAGE] = new AjxListener(this, this._sendPageListener);
	this._listeners[ZmOperation.DETACH] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.IMPORT_FILE] = new AjxListener(this, this._importListener);
}
ZmNotebookController.prototype = new ZmListController;
ZmNotebookController.prototype.constructor = ZmNotebookController;

ZmNotebookController.prototype.toString = function() {
	return "ZmNotebookController";
};

// Constants

ZmNotebookController._VIEWS = {};
ZmNotebookController._VIEWS[ZmId.VIEW_NOTEBOOK_PAGE] = ZmNotebookPageView;
//ZmNotebookController._VIEWS[ZmId.VIEW_NOTEBOOK_FILE] = ZmPageEditView;

//
// Public methods
//

// view management

ZmNotebookController.prototype.show = function(arg) {
	throw "TODO: show method not implemented";
};

ZmNotebookController.prototype.switchView = function(view, force) {
	var viewChanged = force || view != this._currentView;

	if (viewChanged) {
		this._currentView = view;
		this._setup(view);
	}
	this._resetOperations(this._toolbar[view], 1);

	if (viewChanged) {
		var elements = {};
		elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
		elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];

		this._setView(view, elements, true);
	}
	Dwt.setTitle(this.getCurrentView().getTitle());
};

//
// Protected methods
//

// initialization

// Overrides ZmListController method, leaving ZmOperation.MOVE off the menu.
ZmNotebookController.prototype._standardActionMenuOps =
function() {
	return [ZmOperation.TAG_MENU, ZmOperation.DELETE, ZmOperation.PRINT];
};

ZmNotebookController.prototype._getToolBarOps =
function() {
	var list = this._getBasicToolBarOps();
	list.push(ZmOperation.SEP);
	list = list.concat(this._getItemToolBarOps());
	list.push(ZmOperation.SEP,
				ZmOperation.TAG_MENU,
				ZmOperation.SEP,
				ZmOperation.FILLER);
	list = list.concat(this._getNaviToolBarOps());
	return list;
};

ZmNotebookController.prototype._getBasicToolBarOps =
function() {
	var list = [ZmOperation.NEW_MENU];
	list.push(ZmOperation.REFRESH, ZmOperation.EDIT);
    if(appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)) {
		list.push(ZmOperation.SEP);
		list.push(ZmOperation.IMPORT_FILE);
		list.push(ZmOperation.SEP);
	}
    return list;
};

ZmNotebookController.prototype._getItemToolBarOps =
function() {
	return [ZmOperation.DELETE, ZmOperation.PRINT];
};

ZmNotebookController.prototype._getNaviToolBarOps =
function() {
	return [ZmOperation.SEND_PAGE,
			ZmOperation.SEP,
			ZmOperation.DETACH];
};

ZmNotebookController.prototype._initializeToolBar =
function(view) {
	ZmListController.prototype._initializeToolBar.call(this, view);

	this._setNewButtonProps(view, ZmMsg.createNewPage, "NewPage", "NewPageDis", ZmOperation.NEW_PAGE);

	var toolbar = this._toolbar[this._currentView];

	var button = toolbar.getButton(ZmOperation.DELETE);
	if (button){
		button.setToolTipContent(ZmMsg.deletePermanentTooltip);
	}

	var printButton = toolbar.getButton(ZmOperation.PRINT);
	if (printButton) {
		printButton.setToolTipContent(ZmMsg.printDocument);
	}

	/***
	var button = toolbar.getButton(ZmOperation.ATTACHMENT);
	button.setText(ZmMsg.addDocuments);
	button.setToolTipContent(ZmMsg.addDocumentsTT);
	/***/
};

ZmNotebookController.prototype._resetOperations = function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) return;
	ZmListController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);
	toolbarOrActionMenu.enable(ZmOperation.REFRESH, true);
	toolbarOrActionMenu.enable(ZmOperation.PRINT, true);
	//toolbarOrActionMenu.enable(ZmOperation.ATTACHMENT, true);
	//toolbarOrActionMenu.enable(ZmOperation.DETACH, false);

	var buttonIds = [ ZmOperation.SEND_PAGE, ZmOperation.DETACH ];
	toolbarOrActionMenu.enable(buttonIds, true);
	var writable = this._object && !this._object.isReadOnly();
	toolbarOrActionMenu.enable([ZmOperation.EDIT], writable);
	if(appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML) ) {
        if(this._object && this._object.isIndex() && !this._object.isFolderReadOnly()) {
            toolbarOrActionMenu.enable([ZmOperation.IMPORT_FILE], true);
        } else {
            toolbarOrActionMenu.enable([ZmOperation.IMPORT_FILE], false);
        }
    }
    //bug:22488
    var deleteEnable = this._object && !this._object.isIndex() && this.isDeletable();
    toolbarOrActionMenu.enable([ZmOperation.DELETE], deleteEnable);

	var taggable = this._object && !this._object.isShared() && !this._object.isIndex();
	toolbarOrActionMenu.enable([ZmOperation.TAG_MENU], taggable);
};

ZmNotebookController.prototype.isDeletable = function(){

	var page = this._object;
	if(!page)
	return false;
	var writable = page && !page.isReadOnly();	
	if(!page.isIndex()){
		return writable;
	}
	var id = page.id;
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);	
	var notebook = appCtxt.getById(id);
	var notebookId = ZmOrganizer.getSystemId(ZmOrganizer.ID_NOTEBOOK);
	var isRoot = (notebook.id == rootId);
	var isNotebook = (notebook.id == notebookId);
	var isTopLevel = (!isRoot && notebook.parent.id == rootId);
	var isLink = notebook.link;
	var isLinkOrRemote = isLink || notebook.isRemote();
	return (!isNotebook && (!isLinkOrRemote || (isLink && isTopLevel) || ZmNotebookTreeController.__isAllowed(notebook.parent, ZmShare.PERM_DELETE)));
};

ZmNotebookController.prototype._getTagMenuMsg = function() {
	return ZmMsg.tagPage;
};

ZmNotebookController.prototype._doDelete = function(items,delcallback) {
	
	if(!items){
	items = this._listView[this._currentView].getSelection();
	}
	var page = items instanceof Array ? items[0] : items;
	if(page && ( page instanceof ZmPage ) && page.isIndex() ){
		var overviewController = appCtxt.getOverviewController();
		var treeController = overviewController.getTreeController(ZmOrganizer.NOTEBOOK);
		var organizer = appCtxt.getById(page.id);
		if(organizer) {
			var callback = new AjxCallback(treeController, treeController._deleteListener2, [ organizer ]);
			var message = AjxMessageFormat.format(ZmMsg.confirmDeleteNotebook, organizer.name);
			var dialog = appCtxt.getConfirmationDialog();
			dialog.popup(message, callback);		
			return;
		}
	}
	
	var dialog = appCtxt.getConfirmationDialog();
	var message = items instanceof Array && items.length > 1 ? ZmMsg.confirmDeleteItemList : null;
	if (!message) {
		if (!this._confirmDeleteFormatter) {
			this._confirmDeleteFormatter = new AjxMessageFormat(ZmMsg.confirmDeleteItem);
		}

		var item = items instanceof Array ? items[0] : items;
		message = this._confirmDeleteFormatter.format(item.name);
	}
	var callback = new AjxCallback(this, this._doDelete2, [items,delcallback]);
	dialog.popup(message, callback);
};

ZmNotebookController.prototype._doDelete2 = function(items,delcallback) {
	var ids = ZmNotebookController.__itemize(items);
	if (!ids) return;

	var soapDoc = AjxSoapDoc.create("ItemActionRequest", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", ids);
	actionNode.setAttribute("op", "delete");

	var responseHandler = this._currentView == ZmId.VIEW_NOTEBOOK_PAGE ? this._listeners[ZmOperation.PAGE_BACK] : null;

	if(delcallback){
		responseHandler = delcallback;
	}

	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: responseHandler,
		errorCallback: null,
		noBusyOverlay: false
	};

	var appController = appCtxt.getAppController();
	var response = appController.sendRequest(params);
	return response;
};

// view management

ZmNotebookController.prototype._getViewType = function() {
	return this._currentView;
};

ZmNotebookController.prototype._defaultView = function() {
	return ZmId.VIEW_NOTEBOOK_PAGE;
};

ZmNotebookController.prototype._createNewView = function(view) {
	if (!this._listView[view]) {
		var viewCtor = ZmNotebookController._VIEWS[view];
		this._listView[view] = new viewCtor(this._container, this, this._dropTgt);
	}
	return this._listView[view];
};

ZmNotebookController.prototype._setViewContents = function(view) {
	this._listView[view].set(this._object);

	// Select the appropriate notebook in the tree view.
	if (this._object) {
		var overviewController = appCtxt.getOverviewController();
		var treeController = overviewController.getTreeController(ZmOrganizer.NOTEBOOK);
		var treeView = treeController.getTreeView(this._app.getOverviewId());
		if (treeView) {
			var folderId = this._object.getFolderId();
			var skipNotify = true;
			treeView.setSelected(folderId, skipNotify);
		}
	}
};

/*** TODO: This will be exposed later.
ZmNotebookController.prototype._setViewMenu = function(view) {
	var appToolbar = appCtxt.getCurrentAppToolbar();
	var menu = appToolbar.getViewMenu(view);
	if (!menu) {
		var listener = this._listeners[ZmOperation.VIEW];

		menu = new ZmPopupMenu(appToolbar.getViewButton());

		var item = menu.createMenuItem(ZmNotebookApp.PAGE, {image:"Page", text:ZmMsg.notebookPageView, style:DwtMenuItem.RADIO_STYLE});
		item.setData(ZmOperation.MENUITEM_ID, ZmId.VIEW_NOTEBOOK_PAGE);
		item.addSelectionListener(listener);

		var item = menu.createMenuItem(ZmNotebookApp.FILE, {image:"Folder", text:ZmMsg.notebookFileView, style:DwtMenuItem.RADIO_STYLE});
		item.setData(ZmOperation.MENUITEM_ID, ZmId.VIEW_NOTEBOOK_FILE);
		item.addSelectionListener(listener);
	}

	var item = menu.getItemById(ZmOperation.MENUITEM_ID, view);
	item.setChecked(true, true);

	appToolbar.setViewMenu(view, menu);
};
/***/

// listeners

ZmNotebookController.prototype._refreshListener = function(event) {
	var pageRef = this._history[this._place];
	if (pageRef) {
		if (this._place == 0) {
			this._showIndex(pageRef.folderId);
		}
		else {
			var cache = this._app.getNotebookCache();
			var page = cache.getPageByName(pageRef.folderId, pageRef.name);
			page.load();
			page.folderId = pageRef.folderId; // Bug 9524
			this._listView[this._currentView].set(page);
		}
	}
};

ZmNotebookController.prototype._editListener = function(event) {
	var pageEditController = this._app.getPageEditController();
	var page = this._listView[this._currentView].getVisiblePage();
	pageEditController.show(page);
};

ZmNotebookController.prototype._importListener = function(event) {
	
	var folderId = this._object ? this._object.getFolderId() : ZmNotebookItem.DEFAULT_FOLDER;
	var notebook = appCtxt.getById(folderId);
	var callback = new AjxCallback(this, this._importCallback);

	var dialog = appCtxt.getImportDialog();
	dialog.popup(notebook, callback);
};

ZmNotebookController.prototype._importCallback = 
function(uploadFolder, filenames, result, files) {
	
	var page = new ZmPage();
	page.folderId = uploadFolder ? uploadFolder.id : ZmNotebookItem.DEFAULT_FOLDER;
	page.name=this._app.generateUniqueName(page.folderId);
	if(result.success) {
		this.setImportedPageContent(page, result);	
		var saveCallback = new AjxCallback(this, this._saveResponseHandler, [page, files]);
		var saveErrorCallback = new AjxCallback(this, this._saveErrorResponseHandler, [page, files]);
		this._importInProgress = true;
		page.save(saveCallback, saveErrorCallback);
	}else{
		var msg = ZmMsg.importFailed + ": " + ZmMsg.unableToGetPage;
		var msgDialog = appCtxt.getMsgDialog();
	    msgDialog.reset();
    	msgDialog.setMessage(msg, DwtMessageDialog.INFO_STYLE);
	    msgDialog.popup();
	}
};

ZmNotebookController.prototype.setImportedPageContent = 
function(page, result) {
		var pageContent = result.text;
		pageContent = pageContent.replace(/.*<body>/,"");
		pageContent = pageContent.replace(/<\/body>.*/,"");
		page.setContent(pageContent);	
};

ZmNotebookController.prototype._saveResponseHandler = 
function(page, files, response) {

	var saveResp = response._data && response._data.SaveWikiResponse;
	if (saveResp) {
		var data = saveResp.w[0];
		if (!page.id) {
			page.set(data);
		}
		else {
			page.version = data.ver;
		}
		this.gotoPage(page);
	}
	this._importInProgress = false;
	this.deleteImportedDocs(files);	
};

ZmNotebookController.prototype.deleteImportedDocs =
function(files) {
	this._doDelete2(files, new AjxCallback(this, this.deleteImportCallback));
};

ZmNotebookController.prototype.deleteImportCallback =
function() {

};

ZmNotebookController.prototype._saveErrorResponseHandler = 
function(page, files, response) {

	var msg = ZmMsg.importFailed + ": " + ZmMsg.unableToSavePage;
	var msgDialog = appCtxt.getMsgDialog();
    msgDialog.reset();
    msgDialog.setMessage(msg, DwtMessageDialog.INFO_STYLE);
    msgDialog.popup();
   	this._importInProgress = false;
   	this.deleteImportedDocs(files);
};

ZmNotebookController.prototype._sendPageListener = function(event) {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	items = items instanceof Array ? items : [ items ];

	var names = [];
	var urls = [];
	var inNewWindow = this._app._inNewWindow(event);

	var content = "<wiklet class='NAME'/>";

	var notebook, shares;
	var noprompt = false;

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var url = item.getRestUrl();
		
		if(item.remoteFolderId){
			//fetching the remote URL
			var cache = this._app.getNotebookCache();
			var item1 = cache.getItemInfo({id:item.remoteFolderId,ignoreCaching:true});
			if(item1){			
			url = item1.getRestUrl();
			}
		}		
		
		urls.push(url);
		names.push(ZmWikletProcessor.process(item, content));
		if (noprompt) continue;

		notebook = appCtxt.getById(item.folderId);
		shares = notebook && notebook.shares;
		if (shares) {
			for (var j = 0; j < shares.length; j++) {
				noprompt = noprompt || shares[j].grantee.type == ZmShare.TYPE_PUBLIC;
			}
		}
	}

	if (!shares || !noprompt) {
		var args = [names, urls, inNewWindow];
		var callback = new AjxCallback(this, this._sendPageListener2, args);

		var dialog = appCtxt.getConfirmationDialog();
		dialog.popup(ZmMsg.errorPermissionRequired, callback);
	}
	else {
		this._sendPageListener2(names, urls);
	}
};

ZmNotebookController.prototype._sendPageListener2 =
function(names, urls, inNewWindow) {
	var action = ZmOperation.NEW_MESSAGE;
	var msg = new ZmMailMsg();
	var toOverride = null;
	var subjOverride = new AjxListFormat().format(names);
	var extraBodyText = urls.join("\n");
	AjxDispatcher.run("Compose", {action: action, inNewWindow: inNewWindow, msg: msg,
								  toOverride: toOverride, subjOverride: subjOverride,
								  extraBodyText: extraBodyText});
};

ZmNotebookController.prototype._detachListener = function(event) {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	items = items instanceof Array ? items : [ items ];

	for (var i = 0; i < items.length; i++) {
		var item = items[i];

		var winurl = item.getRestUrl();
		var cache = this._app.getNotebookCache();		
		winurl = cache.fixCrossDomainReference(winurl);		
		var winname = "_new";
		var winfeatures = [
			"width=",(window.outerWidth || 640),",",
			"height=",(window.outerHeight || 480),",",
			"location,menubar,",
			"resizable,scrollbars,status,toolbar"
		].join("");

		var win = open(winurl, winname, winfeatures);
	}
};

ZmNotebookController.prototype._getDefaultFocusItem = 
function() {
	return this._toolbar[this._currentView];
};

//override
ZmNotebookController.prototype.gotoPage =
function(pageRef) {
	
};

//
// Private functions
//

ZmNotebookController.__itemize = function(objects) {
	if (objects instanceof Array) {
		var ids = [];
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			if (object.id) {
				ids.push(object.id);
			}
		}
		return ids.join();
	}
	return objects.id;
};
