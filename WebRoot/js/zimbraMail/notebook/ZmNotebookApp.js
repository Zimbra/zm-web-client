/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookApp(appCtxt, container, parentController) {

	ZmApp.call(this, ZmApp.NOTEBOOK, appCtxt, container, parentController);

	AjxDispatcher.registerMethod("GetNotebookController", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getNotebookController));
	AjxDispatcher.registerMethod("GetPageEditController", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getPageEditController));
	AjxDispatcher.registerMethod("GetNotebookCache", ["NotebookCore", "Notebook"], new AjxCallback(this, this.getNotebookCache));

	ZmItem.registerItem(ZmItem.PAGE,
						{app:			ZmApp.NOTEBOOK,
						 nameKey:		"page",
						 icon:			"Page",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmPage",
						 node:			"w",
						 organizer:		ZmOrganizer.NOTEBOOK,
						 searchType:	"wiki",
						 stbNameKey:	"searchNotebooks",
						 stbTooltipKey:	"searchForPages",
						 stbIcon:		"SearchNotes",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("NotebookCore");
			return new ZmPageList(this._appCtxt, search);
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
			return new ZmPageList(this._appCtxt, search, ZmItem.DOCUMENT);
		}, this)
						});

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
							 views:				["wiki"],
							 folderKey:			"notebookFolder",
							 mountKey:			"mountNotebook",
							 createFunc:		"ZmOrganizer.create",
							 compareFunc:		"ZmNotebook.sortCompare",
							 deferrable:		true
							});

	ZmApp.registerApp(ZmApp.NOTEBOOK,
							 {nameKey:				"BETA_documents",
							  icon:					"NoteApp",
							  chooserTooltipKey:	"goToDocuments",
							  defaultSearch:		ZmItem.PAGE,
							  overviewTrees:		[ZmOrganizer.NOTEBOOK, ZmOrganizer.TAG],
							  showZimlets:			true,
							  searchTypes:			[ZmItem.PAGE, ZmItem.DOCUMENT],
							  actionCode:			ZmKeyMap.GOTO_NOTEBOOK,
							  chooserSort:			50,
							  defaultSort:			30
							  });

	ZmSearchToolBar.MENU_ITEMS.push(ZmItem.PAGE);
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

ZmNotebookApp.prototype = new ZmApp;
ZmNotebookApp.prototype.constructor = ZmNotebookApp;

ZmNotebookApp.prototype.toString = 
function() {
	return "ZmNotebookApp";
}

// Constants

// Data

ZmNotebookApp.prototype._notebookCache;

// Public methods

ZmNotebookApp.prototype.deleteNotify =
function(ids) {
	this._handleDeletes(ids);
};

ZmNotebookApp.prototype.createNotify =
function(list) {
	this._handleCreates(list);
};

ZmNotebookApp.prototype.modifyNotify =
function(list) {
	this._handleModifies(list);
};

ZmNotebookApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["NotebookCore", "Notebook"], false, loadCallback, null, true);
};

ZmNotebookApp.prototype._handleLoadLaunch =
function(callback) {
	this._createDeferredFolders();
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
		this._notebookController = new ZmNotebookPageController(this._appCtxt, this._container, this);
	}
	return this._notebookController;
};

ZmNotebookApp.prototype.getPageEditController = function() {
	if (!this._pageController) {
		this._pageController = new ZmPageEditController(this._appCtxt, this._container, this);
	}
	return this._pageController;
};

ZmNotebookApp.prototype.getFileController = function() {
	if (!this._fileController) {
		this._fileController = new ZmNotebookFileController(this._appCtxt, this._container, this);
	}
	return this._fileController;
};

ZmNotebookApp.prototype.getNotebookCache =
function() {
	if (!this._notebookCache) {
		this._notebookCache = new ZmNotebookCache(this._appCtxt);
	}
	return this._notebookCache;
};

ZmNotebookApp.prototype._handleDeletes =
function(ids) {
	for (var i = 0; i < ids.length; i++) {
		var cache = this.getNotebookCache();
		var page = cache.getPageById(ids[i]);
		if (page) {
			DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling delete notif for ID " + ids[i]);
			cache.removePage(page);
			page.notifyDelete();
				
			// re-render, if necessary
			var notebookController = AjxDispatcher.run("GetNotebookController");
			var shownPage = notebookController.getPage();
			if (shownPage && shownPage.id == page.id) {
				if (shownPage.name == ZmNotebook.PAGE_INDEX || shownPage.name == page.name) {
					var pageRef = { folderId: page.folderId, name: ZmNotebook.PAGE_INDEX };
					notebookController.gotoPage(pageRef);
				}
			}
			ids[i] = null;
		}
	}
};

/**
 * Checks for the creation of a notebook or a mount point to one, or of a page
 * or document.
 * 
 * @param list	[array]		list of create notifications
 */
ZmNotebookApp.prototype._handleCreates =
function(list) {
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if (this._appCtxt.cacheGet(create.id)) { continue; }

		if (name == "folder") {
			var parentId = create.l;
			var parent;
			var notebookTree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
			if (parentId == ZmOrganizer.ID_ROOT) {
				if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK][0]) {
					parent = notebookTree.getById(parentId);
				}
			} else {
				parent = notebookTree.getById(parentId);
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
				parent.notifyCreate(create);
			}
		} else if (name == "link") {
			var parentId = create.l;
			var parent, share;
			if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK][0]) {
				var notebookTree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
				parent = notebookTree.getById(parentId);
				share = ZmOrganizer.NOTEBOOK;
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
				parent.notifyCreate(create, true);
				// XXX: once bug #4434 is fixed, check if this call is still needed
				this._appCtxt.getRequestMgr().getFolderPermissions([share]);
			}
		} else if (name == "w") {
			DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
			// REVISIT: use app context item cache
			var cache = this.getNotebookCache();
			var page = new ZmPage(this._appCtxt);
			page.set(create);
			cache.putPage(page);

			// re-render current page, if necessary
			var notebookController = AjxDispatcher.run("GetNotebookController");
			var shownPage = notebookController.getPage();
			if (shownPage && shownPage.name == ZmNotebook.PAGE_INDEX) {
				notebookController.gotoPage(shownPage);
			}
		} else if (name == "doc") {
			DBG.println(AjxDebug.DBG1, "ZmNotebookApp: handling CREATE for node: " + name);
			// REVISIT: use app context item cache
			var cache = this.getNotebookCache();
			var doc = new ZmDocument(this._appCtxt);
			doc.set(create);
			cache.putDocument(doc);
		}
	}
};

ZmNotebookApp.prototype._handleModifies =
function(list) {
	for (var i = 0; i < list.length; i++) {
		var mod = list[i];
		var id = mod.id;
		if (!id) { continue; }
		var name = mod._name;

		if (name == "w") {
			DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling modified notif for ID " + id + ", node type = " + name);
			// REVISIT: Use app context item cache
			var cache = this.getNotebookCache();
			var page = cache.getPageById(id);
			if (!page) {
				page = new ZmPage(this._appCtxt);
				page.set(mod);
				cache.putPage(page);
			} else {
				page.notifyModify(mod);
				page.set(mod);
			}
			
			// re-render current page, if necessary
			var notebookController = AjxDispatcher.run("GetNotebookController");
			var shownPage = notebookController.getPage();
			if (shownPage && shownPage.folderId == page.folderId) {
				if (shownPage.name == ZmNotebook.PAGE_INDEX || shownPage.name == page.name) {
					notebookController.gotoPage(shownPage);
				}
			}
			mod._handled = true;
		} else if (name == "doc") {
			DBG.println(AjxDebug.DBG2, "ZmNotebookApp: handling modified notif for ID " + id + ", node type = " + name);
			// REVISIT: Use app context item cache
			var cache = this.getNotebookCache();
			var doc = cache.getDocumentById(id);
			if (!doc) {
				doc = new ZmDocument(this._appCtxt);
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
};
