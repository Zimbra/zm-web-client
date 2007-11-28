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

ZmNotebookApp = function(container, parentController) {

	ZmApp.call(this, ZmApp.NOTEBOOK, container, parentController);
}

// Organizer and item-related constants
ZmEvent.S_PAGE					= "PAGE";
ZmEvent.S_DOCUMENT				= "DOCUMENT";
ZmEvent.S_NOTEBOOK				= "NOTEBOOK";
ZmItem.PAGE						= ZmEvent.S_PAGE;
ZmItem.DOCUMENT					= ZmEvent.S_DOCUMENT;
ZmOrganizer.NOTEBOOK			= ZmEvent.S_NOTEBOOK;

// App-related constants
ZmApp.NOTEBOOK					= "Notebook";
ZmApp.CLASS[ZmApp.NOTEBOOK]		= "ZmNotebookApp";
ZmApp.SETTING[ZmApp.NOTEBOOK]	= ZmSetting.NOTEBOOK_ENABLED;
ZmApp.LOAD_SORT[ZmApp.NOTEBOOK]	= 60;
ZmApp.QS_ARG[ZmApp.NOTEBOOK]	= "documents";

ZmNotebookApp.prototype = new ZmApp;
ZmNotebookApp.prototype.constructor = ZmNotebookApp;

ZmNotebookApp.prototype.toString = 
function() {
	return "ZmNotebookApp";
}

// Constants

// Data

ZmNotebookApp.prototype._notebookCache;

// Construction

ZmNotebookApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("Notebook", new AjxCallback(this, this._postLoad, ZmOrganizer.NOTEBOOK));
	AjxDispatcher.registerMethod("GetNotebookController", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getNotebookController));
	AjxDispatcher.registerMethod("GetPageEditController", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getPageEditController));
	AjxDispatcher.registerMethod("GetNotebookCache", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getNotebookCache));
	AjxDispatcher.registerMethod("GetPageVersionController", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getPageVersionController));		
};

ZmNotebookApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("EDIT_NOTEBOOK_CHROME", {textKey:"editNotebookChrome", image:"Edit"});
	ZmOperation.registerOp("EDIT_NOTEBOOK_INDEX", {textKey:"editNotebookIndex", image:"Edit"});
	ZmOperation.registerOp("EDIT_NOTEBOOK_HEADER", {textKey:"editNotebookHeader", image:"Edit"});
	ZmOperation.registerOp("EDIT_NOTEBOOK_FOOTER", {textKey:"editNotebookFooter", image:"Edit"});
	ZmOperation.registerOp("EDIT_NOTEBOOK_SIDE_BAR", {textKey:"editNotebookSideBar", image:"Edit"});
	ZmOperation.registerOp("EDIT_NOTEBOOK_CHROME", {textKey:"editNotebookChrome", image:"Edit"});
	ZmOperation.registerOp("FORMAT_HTML_SOURCE", {textKey:"formatHtmlSource"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("FORMAT_MEDIA_WIKI", {textKey:"formatMediaWiki"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("FORMAT_RICH_TEXT", {textKey:"formatRichText"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("FORMAT_TWIKI", {textKey:"formatTWiki"}, ZmSetting.HTML_COMPOSE_ENABLED);
	ZmOperation.registerOp("MOUNT_NOTEBOOK", {textKey:"mountNotebook", image:"Notebook"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("NEW_NOTEBOOK", {textKey:"newNotebook", image:"NewNotebook"});
	ZmOperation.registerOp("NEW_PAGE", {textKey:"newPage", tooltipKey:"createNewPage", image:"NewPage"});
	ZmOperation.registerOp("IMPORT_FILE", {textKey:"_import", tooltipKey:"importDocs"});
	ZmOperation.registerOp("SEND_PAGE", {textKey:"send", tooltipKey:"sendPageTT", image:"Send"}, ZmSetting.MAIL_ENABLED);
	ZmOperation.registerOp("SHARE_NOTEBOOK", {textKey:"shareNotebook", image:"Notebook"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("REVERT_PAGE", {textKey:"revert", tooltipKey:"restorePage", image:"Edit"});	
};

ZmNotebookApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.PAGE,
						{app:			ZmApp.NOTEBOOK,
						 nameKey:		"page",
						 icon:			"Page",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmPage",
						 node:			"w",
						 organizer:		ZmOrganizer.NOTEBOOK,
						 searchType:	"wiki",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("NotebookCore");
			return new ZmPageList(search);
		}, this)
						});

	ZmItem.registerItem(ZmItem.DOCUMENT,
						{app:			ZmApp.NOTEBOOK,
						 nameKey:		"document",
						 icon:			"GenericDoc",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmDocument",
						 node:			"doc",
						 organizer:		ZmOrganizer.NOTEBOOK,
						 searchType:	"document",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("NotebookCore");
			return new ZmPageList(search, ZmItem.DOCUMENT);
		}, this)
						});
};

ZmNotebookApp.prototype._registerOrganizers =
function() {
	ZmOrganizer.registerOrg(ZmOrganizer.NOTEBOOK,
							{app:				ZmApp.NOTEBOOK,
							 nameKey:			"notebook",
							 defaultFolder:		ZmOrganizer.ID_NOTEBOOK,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmNotebook",
							 orgPackage:		"NotebookCore",
							 treeController:	"ZmNotebookTreeController",
							 labelKey:			"notebooks",
							 itemsKey:			"documents",
							 hasColor:			true,
							 defaultColor:		ZmOrganizer.C_NONE,							 			
							 treeType:			ZmOrganizer.FOLDER,
							 views:				["wiki"],
							 folderKey:			"notebookFolder",
							 mountKey:			"mountNotebook",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmNotebook.sortCompare",
							 deferrable:		true
							});
};

ZmNotebookApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.PAGE,
								{msgKey:		"searchNotebooks",
								 tooltipKey:	"searchForPages",
								 icon:			"Notebook",
								 shareIcon:		"SharedNotebook",
								 setting:		ZmSetting.NOTEBOOK_ENABLED								 
								});
};

ZmNotebookApp.prototype._setupCurrentAppToolbar =
function() {
	ZmCurrentAppToolBar.registerApp(this.getName(), ZmOperation.NEW_NOTEBOOK, ZmOrganizer.NOTEBOOK);
};

ZmNotebookApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_PAGE] = "page";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_NOTEBOOK] = "notebook";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_PAGE]		= ZmOperation.NEW_PAGE;
	actionCodes[ZmKeyMap.NEW_NOTEBOOK]	= ZmOperation.NEW_NOTEBOOK;

	ZmApp.registerApp(ZmApp.NOTEBOOK,
							 {mainPkg:				"Notebook",
							  nameKey:				"documents",
							  icon:					"NoteApp",
							  chooserTooltipKey:	"goToDocuments",
							  defaultSearch:		ZmItem.PAGE,
							  organizer:			ZmOrganizer.NOTEBOOK,
							  overviewTrees:		[ZmOrganizer.NOTEBOOK, ZmOrganizer.TAG],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.PAGE, ZmItem.DOCUMENT],
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  gotoActionCode:		ZmKeyMap.GOTO_NOTEBOOK,
							  newActionCode:		ZmKeyMap.NEW_PAGE,
							  chooserSort:			50,
							  defaultSort:			30
							  });
};

// App API

ZmNotebookApp.prototype.deleteNotify =
function(ids, force) {

	if (!force && this._deferNotifications("delete", ids)) { return; }

	var nextData = null;
	var idStr = ids.join(",")+",";
	var pageInUse = false;
	var notebookController = AjxDispatcher.run("GetNotebookController");
	var shownPage = notebookController.getPage();
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(ZmOrganizer.NOTEBOOK);
	var treeView = treeController.getTreeView(this.getOverviewId());
	if(!treeView){
		return;
	}
	var cache = this.getNotebookCache();
					
	for (var i = 0; i < ids.length; i++) {
		var tmp = treeView.getNextData(ids[i]);
			//next node might also be in the delete list : parent deleted
			if(tmp && idStr.indexOf(tmp.id+",")<0){
				nextData = tmp;
			}
			if (shownPage && shownPage.id == ids[i]) {
				pageInUse = true;				
			}
	}	
				
	for (var i = 0; i < ids.length; i++) {

		var page = cache.getPageById(ids[i]);
		if (page) {
			DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling delete notif for ID " + ids[i]);
			cache.removePage(page);
			page.notifyDelete();							
		}
		appCtxt.cacheRemove(ids[i]);
	}
	
	if(nextData && pageInUse){
	var pageRef = { folderId: nextData.id, name: ZmNotebook.PAGE_INDEX };
	notebookController.gotoPage(pageRef);
	}
	
	
		for (var i = 0; i < ids.length; i++) {
		var tmp1 = treeView.getTreeItemById(ids[i]);
		DBG.println("tmp1:"+tmp1+","+page);//cdebugs
		if(tmp1){
			tmp1.dispose();
		}
		ids[i] = null;
			
	}
	
};

/**
 * Checks for the creation of a notebook or a mount point to one, or of a page
 * or document.
 * 
 * @param creates	[hash]		hash of create notifications
 */
ZmNotebookApp.prototype.createNotify =
function(creates, force) {
	if (!creates["folder"] && !creates["w"] && !creates["doc"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }

	for (var name in creates) {
		var list = creates[name];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }
	
			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.NOTEBOOK);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.NOTEBOOK);
			} else if (name == "w") {
				DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
				// REVISIT: use app context item cache
				var cache = this.getNotebookCache();
				var page = new ZmPage();
				page.set(create);
				cache.putPage(page);
	
				// re-render current page, if necessary
				var notebookController = AjxDispatcher.run("GetNotebookController");	
				if(!notebookController.isIframeEnabled()){
					var shownPage = notebookController.getPage();
					if (shownPage && shownPage.name == ZmNotebook.PAGE_INDEX) {
						notebookController.gotoPage(shownPage);
					}
				}
			} else if (name == "doc") {
				DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
				// REVISIT: use app context item cache
				var cache = this.getNotebookCache();
				var doc = new ZmDocument();
				doc.set(create);
				cache.putDocument(doc);
			}
		}
	}
};

ZmNotebookApp.prototype.modifyNotify =
function(modifies, force) {
	if (!modifies["w"] && !modifies["doc"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("modify", list)) { return; }
	
	for (var name in modifies) {
		var list = modifies[name];
		for (var i = 0; i < list.length; i++) {
			var mod = list[i];
			var id = mod.id;
			if (!id) { continue; }
	
			if (name == "w") {
				DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling modified notif for ID " + id + ", node type = " + name);
				// REVISIT: Use app context item cache
				var cache = this.getNotebookCache();
				var page = cache.getPageById(id);
				if (!page) {
					page = new ZmPage();
					page.set(mod);
					cache.putPage(page);
				} else {
					page.notifyModify(mod);
					page.set(mod);
				}
				
				// re-render current page, if necessary
				var notebookController = AjxDispatcher.run("GetNotebookController");
				if(!notebookController.isIframeEnabled()){
				var shownPage = notebookController.getPage();
				if (shownPage && shownPage.folderId == page.folderId) {
					if (shownPage.name == ZmNotebook.PAGE_INDEX || shownPage.name == page.name) {
						notebookController.gotoPage(shownPage);
					}
				}
				}
				mod._handled = true;
			} else if (name == "doc") {
				DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling modified notif for ID " + id + ", node type = " + name);
				// REVISIT: Use app context item cache
				var cache = this.getNotebookCache();
				var doc = cache.getDocumentById(id);
				if (!doc) {
					doc = new ZmDocument();
					doc.set(mod);
					cache.putDocument(doc);
				}
				else {
					doc.notifyModify(mod);
					doc.set(mod);
				}
				mod._handled = true;
			}
		}
	}
};

ZmNotebookApp.prototype.refresh =
function(refresh) {
	this._handleRefresh();
};

ZmNotebookApp.prototype.handleOp =
function(op) {
	switch (op) {
		case ZmOperation.NEW_PAGE: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewPage);
			AjxDispatcher.require(["NotebookCore", "Notebook"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_NOTEBOOK: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewNotebook);
			AjxDispatcher.require(["NotebookCore", "Notebook"], false, loadCallback, null, true);
			break;
		}
	}
};

ZmNotebookApp.prototype._handleLoadNewPage =
function() {
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(ZmOrganizer.NOTEBOOK);
	var treeView = treeController.getTreeView(this.getOverviewId());

	var notebook = treeView ? treeView.getSelected() : null;
	var page = new ZmPage();
	page.folderId = notebook ? notebook.id : ZmNotebookItem.DEFAULT_FOLDER;
	page.name=this.generateUniqueName(page.folderId);
	AjxDispatcher.run("GetPageEditController").show(page);
};

ZmNotebookApp.prototype._handleLoadNewNotebook =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	var dialog = appCtxt.getNewNotebookDialog();
	if (!this._newNotebookCb) {
		this._newNotebookCb = new AjxCallback(this, this._newNotebookCallback);
	}
	ZmController.showDialog(dialog, this._newNotebookCb);
};

// Public methods

ZmNotebookApp.prototype.launch =
function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["NotebookCore", "Notebook"], true, loadCallback, null, true);
};

ZmNotebookApp.prototype._handleLoadLaunch =
function(callback) {
	var notebookController = this.getNotebookController();
	notebookController.show(null, true);

	if (callback) {
		callback.run();
	}
};

ZmNotebookApp.prototype.showSearchResults =
function(results, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadShowSearchResults, [results, callback]);
	AjxDispatcher.require(["NotebookCore", "Notebook"], false, loadCallback, null, true);
};

ZmNotebookApp.prototype._handleLoadShowSearchResults =
function(results, callback) {
	this.getFileController().show(results, true);
	if (callback) {
		callback.run();
	}
};

ZmNotebookApp.prototype.setActive =
function(active) {
	/***
	if (active) {
		var notebookController = AjxDispatcher.run("GetNotebookController");
		notebookController.show();
	}
	/***/
};

ZmNotebookApp.prototype.getNotebookController = function() {
	if (!this._notebookController) {
		this._notebookController = new ZmNotebookPageController(this._container, this);
	}
	return this._notebookController;
};

ZmNotebookApp.prototype.getPageEditController = function() {
	if (!this._pageController) {
		this._pageController = new ZmPageEditController(this._container, this);
	}
	return this._pageController;
};

ZmNotebookApp.prototype.getFileController = function() {
	if (!this._fileController) {
		this._fileController = new ZmNotebookFileController(this._container, this);
	}
	return this._fileController;
};

ZmNotebookApp.prototype.getNotebookCache =
function() {
	if (!this._notebookCache) {
		this._notebookCache = new ZmNotebookCache();
	}
	return this._notebookCache;
};

ZmNotebookApp.prototype._newNotebookCallback =
function(parent, name, color) {
	var dialog = appCtxt.getNewNotebookDialog();
	dialog.popdown();
	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.NOTEBOOK)._doCreate(parent, name, color);
};

ZmNotebookApp.prototype.generateUniqueName =
function(folderId) {
	var cache = this.getNotebookCache();
	var pages = cache.getPagesInFolder(folderId);
	var pagenames = "";
	for (var p in pages) {
		pagenames+=pages[p].name+",";
	}
	//first possible pagename page1,page2...
	for(var i=1;i<100;i++){
		if(pagenames.indexOf('page'+i+',')<0)
		{
			return 'page'+i;
		}
	}
	
	return 'Untitled';
};

ZmNotebookApp.prototype.getPageVersionController = 
function() {
	if (!this._versionController) {
		this._versionController = new ZmPageVersionController(this._container, this);
	}
	return this._versionController;	
};