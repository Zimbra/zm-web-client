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

ZmNotebookController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, app);

	this._listeners[ZmOperation.REFRESH] = new AjxListener(this, this._refreshListener);
	this._listeners[ZmOperation.EDIT] = new AjxListener(this, this._editListener);
	//this._listeners[ZmOperation.ATTACHMENT] = new AjxListener(this, this._uploadListener);
	this._listeners[ZmOperation.SEND_PAGE] = new AjxListener(this, this._sendPageListener);
	this._listeners[ZmOperation.DETACH] = new AjxListener(this, this._detachListener);
	this._listeners[ZmOperation.IMPORT_FILE] = new AjxListener(this, this._importListener);
        this._listeners[ZmOperation.BROWSE_FOLDER] = new AjxListener(this, this._browseFolderListener);
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

        //bug: 30036 if the search result notebookpage view should not be set as app view
        this._setView({view:view, elements:elements, isAppView:!(this._fromSearch  && (view == ZmId.VIEW_NOTEBOOK_PAGE))});
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
    list.push(ZmOperation.BROWSE_FOLDER);
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
};

ZmNotebookController.prototype._resetOperations =
function(toolbarOrActionMenu, num) {
	if (!toolbarOrActionMenu) { return; }

	// call base class
	ZmListController.prototype._resetOperations.call(this, toolbarOrActionMenu, num);

	toolbarOrActionMenu.enable([ZmOperation.REFRESH,ZmOperation.PRINT,ZmOperation.DETACH], true);
	toolbarOrActionMenu.enable(ZmOperation.SEND_PAGE, appCtxt.getActiveAccount().isZimbraAccount);
	toolbarOrActionMenu.enable(ZmOperation.EDIT, (this._object && !this._object.isReadOnly()));

	if (appCtxt.get(ZmSetting.VIEW_ATTACHMENT_AS_HTML)) {
		var isViewable = (this._object && this._object.isIndex() && !this._object.isFolderReadOnly());
		toolbarOrActionMenu.enable(ZmOperation.IMPORT_FILE, isViewable);
	}

	// bug:22488
	var deleteEnable = (this._object && !this._object.isIndex() && this.isDeletable());
	toolbarOrActionMenu.enable(ZmOperation.DELETE, deleteEnable);

	var taggable = (this._object && !this._object.isShared() && !this._object.isIndex());
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
			var message = AjxMessageFormat.format(ZmMsg.confirmDeleteNotebook, AjxStringUtil.htmlEncode(organizer.name));
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
		message = this._confirmDeleteFormatter.format(AjxStringUtil.htmlEncode(item.name));
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

ZmNotebookController.prototype._sendPageListener =
function(event) {
	var view = this._listView[this._currentView];
	var items = view.getSelection();
	items = items instanceof Array ? items : [items];

	var names = [];
	var urls = [];
	var inNewWindow = this._app._inNewWindow(event);

	var content = "<wiklet class='NAME'/>";

	var notebook, shares;
	var noprompt = false;

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		var url = item.getRestUrl();

		if (item.remoteFolderId) {
			// fetching the remote URL
			var cache = this._app.getNotebookCache();
			var item1 = cache.getItemInfo({id:item.remoteFolderId,ignoreCaching:true});
			if (item1) {
				url = item1.getRestUrl();
			}
		}

		if (appCtxt.isOffline) {
			var remoteUri = appCtxt.get(ZmSetting.OFFLINE_REMOTE_SERVER_URI);
			url = remoteUri + url.substring((url.indexOf("/",7)));
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

ZmNotebookController.prototype._browseFolderListener = function() {
        var folderId = this._object ? this._object.getFolderId() : ZmNotebookItem.DEFAULT_FOLDER;
        var folder = appCtxt.getById(folderId);
        appCtxt.getSearchController().search({ query: folder.createQuery(), types: [ZmItem.PAGE, ZmItem.DOCUMENT] }); // FIXME: is there a better way to browse a folder?
};

ZmNotebookController.prototype._getDefaultFocusItem =
function() {
	return this._toolbar[this._currentView];
};

//override
ZmNotebookController.prototype.gotoPage =
function(pageRef) {

};

ZmNotebookController.prototype.getItemTooltip =
function(item, listView) {
    var dateStr = this._getDateInLocaleFormat(item.modifyDate);
    var prop = [
		{name:ZmMsg.briefcasePropName, value:item.name},
		{name:ZmMsg.briefcasePropSize, value:AjxUtil.formatSize(item.size)},
		{name:ZmMsg.briefcasePropModified, value:(item.modifyDate ? dateStr+"" : "")}
	];

	var subs = {
		fileProperties: prop,
		tagTooltip: listView._getTagToolTip(item)
	};
    return AjxTemplate.expand("briefcase.Briefcase#Tooltip", subs);
};

ZmNotebookController.prototype._getDateInLocaleFormat =
function(date) {
    var dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.FULL, AjxDateFormat.MEDIUM);
    return dateFormatter.format(date);
}

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
