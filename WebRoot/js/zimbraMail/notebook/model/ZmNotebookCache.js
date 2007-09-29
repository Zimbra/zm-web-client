/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmNotebookCache(appCtxt) {
	this._appCtxt = appCtxt;
	this.clearCache();
	this._changeListener = new AjxListener(this, this._handleChange);
}

//
// Constants
//

ZmNotebookCache._SPECIAL_NAMES = {};
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_INDEX] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_CHROME] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_CHROME_STYLES] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_TITLE_BAR] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_HEADER] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_FOOTER] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_SIDE_BAR] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_TOC_BODY_TEMPLATE] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PAGE_TOC_ITEM_TEMPLATE] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PATH_BODY_TEMPLATE] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PATH_ITEM_TEMPLATE] = true;
ZmNotebookCache._SPECIAL_NAMES[ZmNotebook.PATH_SEPARATOR] = true;

ZmNotebookCache._SPECIAL_CONTENT = {};
ZmNotebookCache._SPECIAL_CONTENT[ZmNotebook.PAGE_INDEX] =
	"<wiklet class='TOC'/>"
;
ZmNotebookCache._SPECIAL_CONTENT[ZmNotebook.PAGE_CHROME] = [
	"<div style='margin:0.5em'>",
		"<h1><wiklet class='NAME'/></h1>",
		"<div class='ZmStatusWarningToast' style='margin:1em'>",
			ZmMsg.wikiTemplatesMissing,
		"</div>",
		"<div>",
			"<wiklet class='CONTENT'/>",
		"</div>",
	"</div>"
].join("");

//
// Data
//

ZmNotebookCache.prototype._appCtxt;

ZmNotebookCache.prototype._idMap;
ZmNotebookCache.prototype._foldersMap;

ZmNotebookCache.prototype._changeListener;

//
// Public methods
//

// cache management

ZmNotebookCache.prototype.fillCache = 
function(folderId, callback, errorCallback) {
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	/***
	var notebook = tree.getById(folderId);
	var path = notebook.getSearchPath();
	var search = 'in:"'+path+'"';
	/***/
	var search = 'inid:"'+folderId+'"';
	/***/

	var soapDoc = AjxSoapDoc.create("SearchRequest", "urn:zimbraMail");
	var types = [
		ZmSearch.TYPE[ZmItem.PAGE],
		ZmSearch.TYPE[ZmItem.DOCUMENT]
	];
	soapDoc.setMethodAttribute("types", types.join());
	soapDoc.setMethodAttribute("limit", "250");
	var queryNode = soapDoc.set("query", search);
		
	var args = callback ? [null, folderId, callback, errorCallback] : null;
	var handleResponse = callback ? new AjxCallback(this, this._fillCacheResponse, args) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(handleResponse),
		callback: handleResponse,
		errorCallback: errorCallback,
		noBusyOverlay: false
	};
	// NOTE: Need to keep track of request params for response handler
	if (args) {
		args[0] = params;
	}
	
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	
	if (!params.asyncMode) {
		this._fillCacheResponse(params, folderId, null, errorCallback, response);
	}
};

ZmNotebookCache.prototype.putItem = function(item) {
	if (item.id) {
		this._idMap[item.id] = item;
	}
	var folderId = item.folderId || ZmNotebookItem.DEFAULT_FOLDER;
	var items = this.getItemsInFolder(folderId);
	items.all[item.name] = item;
	if (item instanceof ZmPage) {
		items.pages[item.name] = item;
	}
	else if (item instanceof ZmDocument) {
		items.docs[item.name] = item;
	}
	/*** REVISIT ***/
	var remoteFolderId = item.remoteFolderId;
	if (remoteFolderId) {
		if (!this._foldersMap[remoteFolderId]) {
			this._foldersMap[remoteFolderId] = this._foldersMap[folderId];
		}
	}
	/***/

	item.addChangeListener(this._changeListener);
};
ZmNotebookCache.prototype.putPage = function(page) {
	this.putItem(page);
};
ZmNotebookCache.prototype.putDocument = function(doc) {
	this.putItem(doc);
};

ZmNotebookCache.prototype.renameItem = function(item, newName) {
	this.removeItem(item);
	item.name = newName;
	this.putItem(item);
};
ZmNotebookCache.prototype.renamePage = function(page, newName) {
	this.renameItem(page, newName);
};
ZmNotebookCache.prototype.renameDocument = function(doc, newName) {
	this.renameItem(doc, newName);
};

ZmNotebookCache.prototype.removeItem = function(item) {
	if (item.id) {
		delete this._idMap[item.id];
	}
	var items = this.getItemsInFolder(item.folderId);
	delete items.all[item.name];
	if (item instanceof ZmPage) {
		delete items.pages[item.name];
	}
	else if (item instanceof ZmDocument) {
		delete items.docs[item.name];
	}
	/*** REVISIT ***/
	var remoteFolderId = item.remoteFolderId;
	if (remoteFolderId) {
		var items = this.getItemsInFolder(remoteFolderId);
		delete items.all[item.name];
		if (item instanceof ZmPage) {
			delete items.pages[item.name];
		}
		else if (item instanceof ZmDocument) {
			delete items.docs[item.name];
		}
	}
	/***/

	item.removeChangeListener(this._changeListener);
};
ZmNotebookCache.prototype.removePage = function(page) {
	this.removeItem(page);
};
ZmNotebookCache.prototype.removeDocument = function(doc) {
	this.removeItem(doc);
};

ZmNotebookCache.prototype.clearCache = function() {
	this._idMap = {};
	this._foldersMap = {};
};

// query methods

ZmNotebookCache.prototype.getIds = function() {
	return this._idMap;
};
ZmNotebookCache.prototype.getFolders = function() {
	return this._foldersMap;
};

ZmNotebookCache.prototype.getItemById = function(id) {
	return this._idMap[id];
};
ZmNotebookCache.prototype.getPageById = function(id) {
	var item = this._idMap[id];
	return item instanceof ZmPage ? item : null;
};
ZmNotebookCache.prototype.getDocumentById = function(id) {
	var item = this._idMap[id];
	return item instanceof ZmDocument ? item : null;
};

ZmNotebookCache.prototype.getItemByName = function(folderId, name, traverseUp) {
	var items = this.getItemsInFolder(folderId);
	var item = items.pages[name] || items.docs[name];
	return item;
};
ZmNotebookCache.prototype.getPageByName = function(folderId, name, traverseUp) {
	var item = this.getItemByName(folderId, name, traverseUp);
	if (item) {
		return item instanceof ZmPage ? item : null;
	}

	// one of the "special" pages was requested so load them all at once
	if (name in ZmNotebookCache._SPECIAL_NAMES) {
		// batch load special pages
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");
		for (var specialName in ZmNotebookCache._SPECIAL_NAMES) {
			if (this._foldersMap[folderId].pages[specialName]) continue;
			var requestNode = soapDoc.set("GetWikiRequest",null,null,"urn:zimbraMail");
			requestNode.setAttribute("id", specialName);
			var wordNode = soapDoc.set("w", null, requestNode);
			wordNode.setAttribute("l", folderId);
			wordNode.setAttribute("name", specialName);
			wordNode.setAttribute("tr", 1);
		}

		var params = {
			soapDoc: soapDoc,
			asyncMode: false,
			callback: null,
			errorCallback: null
		};

		var appController = this._appCtxt.getAppController();
		var response = appController.sendRequest(params);

		// add found pages to the cache
		var batchResp = response && response.BatchResponse;
		var wikiResp = batchResp && batchResp.GetWikiResponse;
		if (wikiResp) {
			for (var i = 0; i < wikiResp.length; i++) {
				var word = wikiResp[i].w[0];
				var page = this.getPageById(word.id);
				if (!page) {
					page = new ZmPage(this._appCtxt);
					page.set(word);
					if (page.folderId != folderId) {
						page.id = 0;
						page.folderId = folderId;
						page.version = 0;
					}
					this.putPage(page);
				}
				else {
					page.set(word);
					page.folderId = folderId;
				}
			}
		}

		// check for mandatory pages
		for (var specialName in ZmNotebookCache._SPECIAL_CONTENT) {
			if (this._foldersMap[folderId].pages[specialName]) continue;
			var page = new ZmPage(this._appCtxt);
			page.name = specialName;
			page.folderId = folderId;
			page.setContent(ZmNotebookCache._SPECIAL_CONTENT[specialName]);
			this.putPage(page);
		}

		return this._foldersMap[folderId].pages[name];
	}

	// page not found
	return null;
};
ZmNotebookCache.prototype.getDocumentByName = function(folderId, name, traverseUp) {
	var item = this.getItemByName(folderId, name, traverseUp);
	return item instanceof ZmDocument ? item : null;
};

/**
 * Returns an item by link. This method will attempt to locate the item in
 * cache and, if not found, will attempt to get the item from the server.
 * <p>
 * Links can be one of the following formats:
 * <dl>
 * <dt> Foo
 *   <dd> Link to section/item in current notebook
 * <dt> Foo/Bar
 *   <dd> Link to section/item in sub-section of current notebook
 * <dt> /Foo/Bar
 *   <dd> Link to section/item in top-level notebook of owner of current
 *        notebook
 * <dt> //User/Foo/Bar
 *   <dd> Link to section/item in top-level notebook of specific user
 * </dl>
 */
ZmNotebookCache.prototype.getItemByLink = function(link) {
	// link: //User/Foo/Bar
	var m;
	if (m = link.match(/^\/\/([^\/]+)(?:\/(.*))?/)) {
		// TODO: What if remote link is a document???

		// normalize link
		if (!m[2]) {
			link = link.replace(/\/?$/,"/Notebook/"+ZmNotebook.PAGE_INDEX);
		}

		// create batch request
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		// exact request
		var requestNode = soapDoc.set("GetWikiRequest",null,null,"urn:zimbraMail");
		requestNode.setAttribute("id", "exact");
		var wikiNode = soapDoc.set("w", null, requestNode);
		wikiNode.setAttribute("name", link);
		// section request
		var requestNode = soapDoc.set("GetWikiRequest",null,null,"urn:zimbraMail");
		requestNode.setAttribute("id", "index");
		var wikiNode = soapDoc.set("w", null, requestNode);
		wikiNode.setAttribute("name", link.replace(/\/?$/,'/')+ZmNotebook.PAGE_INDEX);
		wikiNode.setAttribute("tr", 1);

		// send request
		var params = {
			soapDoc: soapDoc,
			asyncMode: false, // REVISIT
			callback: null,
			errorCallback: null
		};

		var appController = this._appCtxt.getAppController();
		var response = appController.sendRequest(params);

		// handle response
		return this._getPageByLinkResponse(response);
	}

	// link: /Foo/Bar
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	var notebook = null;
	if (link.match(/^\//)) {
		// TODO: Handle case where current folder owner is not me
		//       because absolute paths should be relative to where
		//       the link was followed. [Q] Should they?
		notebook = tree.getById(ZmOrganizer.ID_ROOT);
		link = link.substr(1);
	}
	if (!notebook) {
		var app = this._appCtxt.getApp(ZmZimbraMail.NOTEBOOK_APP);
		var controller = app.getNotebookController();
		var currentPage = controller.getPage();
		var folderId = (currentPage && currentPage.folderId) || ZmOrganizer.ID_NOTEBOOK;
		notebook = tree.getById(folderId);
	}

	// link: Foo/Bar
	if (link.match(/\//)) {
		var names = link.replace(/\/$/,"").split('/');
		for (var i = 0; i < names.length - 1; i++) {
			var name = names[i];
            if (name == ".") continue;
            if (name == "..") {
                notebook = notebook.parent;
                if (notebook == null) return null;
                continue;
            }
            notebook = ZmNotebookCache.__getNotebookByName(notebook, name);
			if (notebook == null) {
				// TODO: handle this case!
				throw "subfolder doesn't exist: "+(names.slice(0, i+1).join('/'));
			}
		}
		link = names[names.length-1];
	}

	// link: Foo (section)
	var section = ZmNotebookCache.__getNotebookByName(notebook, link);
	if (section) {
		notebook = section;
		link = ZmNotebook.PAGE_INDEX;
	}

	// link: Foo (item)
	var traverseUp = Boolean(link.match(/^_/));
	var item = this.getItemByName(notebook.id, link, traverseUp);
	return item;
};
ZmNotebookCache.prototype.getPageByLink = function(link) {
	var item = this.getItemByLink(link);
	return item instanceof ZmPage ? item : null;
};
ZmNotebookCache.prototype.getDocumentByLink = function(link) {
	var item = this.getItemByLink(link);
	return item instanceof ZmDocument ? item : null;
};

ZmNotebookCache.prototype._getPageByLinkResponse = function(response) {
	var batchResp = response && response._data && response._data.BatchResponse;
	var wikiResp = batchResp && batchResp.GetWikiResponse;
	var word = wikiResp && wikiResp.w && wikiResp.w[0];
	if (word) {
		var page = this.getPageById(word.id);
		if (!page) {
			page = new ZmPage(this._appCtxt);
			page.set(word);
			this.putPage(page);
		}
		else {
			page.set(word);
		}
		return page;
	}
	return null;
};

ZmNotebookCache.__getNotebookByName = function(parent, name) {
	if (name == ".") return parent;
	if (name == "..") return parent.parent;
	var notebooks = parent ? parent.children.getArray() : [];
	for (var i = 0; i < notebooks.length; i++) {
		var notebook = notebooks[i];
		if (notebook.name == name) {
			return notebook;
		}
	}
	return null;
};

ZmNotebookCache.prototype.getItemsInFolder = function(folderId) {
	folderId = folderId || ZmNotebookItem.DEFAULT_FOLDER;
	if (!this._foldersMap[folderId]) {
		this._foldersMap[folderId] = { all: {}, pages: {}, docs: {} };
		this.fillCache(folderId);
	}
	return this._foldersMap[folderId];
};
ZmNotebookCache.prototype.getPagesInFolder = function(folderId) {
	return this.getItemsInFolder(folderId).pages;
};
ZmNotebookCache.prototype.getDocumentsInFolder = function(folderId) {
	return this.getItemsInFolder(folderId).docs;
};

// make a proxy of a page in a different folder
ZmNotebookCache.prototype.makeProxyPage = function(page, folderId) {
	// force the page to get it's content
	// this way we can set the proxy's id to null, but still have the correct content in the proxy
	page.getContent();

	var specialNote = AjxUtil.createProxy(page);
	specialNote.id = null;
	specialNote.folderId = folderId;
	specialNote.version = 0;
	
	return specialNote;
}


// Protected methods

ZmNotebookCache.prototype._fillCacheResponse = 
function(requestParams, folderId, callback, errorCallback, response) {
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	var notebook = tree.getById(folderId);
	var remoteFolderId = notebook.zid ? notebook.zid+":"+notebook.rid : undefined;

	// add pages to folder map in cache
	if (response && (response.SearchResponse || response._data.SearchResponse)) {
		var searchResponse = response.SearchResponse || response._data.SearchResponse;
		var words = searchResponse.w || [];
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var item = this.getPageById(word.id);
			if (!item) {
				item = new ZmPage(this._appCtxt);
				item.set(word);
				item.folderId = folderId;
				item.remoteFolderId = remoteFolderId; // REVISIT
				this.putPage(item);
			}
			else {
				item.set(word);
			}
		}
		var docs = searchResponse.doc || [];
		for (var i = 0; i < docs.length; i++) {
			var doc = docs[i];
			var item = this.getDocumentById(doc.id);
			if (!item) {
				item = new ZmDocument(this._appCtxt);
				item.set(doc);
				item.folderId = folderId;
				item.remoteFolderId = remoteFolderId; // REVISIT
				this.putDocument(item);
			}
			else {
				item.set(doc);
			}
		}

		// retrieve another block of pages, if necessary
		if (searchResponse.more) {
			var soapDoc = requestParams.soapDoc;
			var limit = Number(soapDoc.getMethod().getAttribute("limit")) * 2;
			soapDoc.setMethodAttribute("offset", searchResponse.offset + words.length);
			soapDoc.setMethodAttribute("limit", limit);
			// NOTE: In order to re-use the soapDoc again, we have
			//       to remove the old header element.
			var headerEl = soapDoc.getHeader();
			headerEl.parentNode.removeChild(headerEl);

			var appController = this._appCtxt.getAppController();
			var response = appController.sendRequest(requestParams);

			if (!requestParams.asyncMode) {
				this._fillCacheResponse(requestParams, folderId, null, errorCallback, response);
			}
			return;
		}
	}
	
	// get sub-folders for remote notebook
	if (remoteFolderId) {
		var soapDoc = AjxSoapDoc.create("GetFolderRequest", "urn:zimbraMail");
		var folderNode = soapDoc.set("folder");
		folderNode.setAttribute("l", remoteFolderId);
	
		var args = [folderId, callback, errorCallback];
		var handleResponse = new AjxCallback(this, this._fillCacheResponse2, args);
		var params = {
			soapDoc: soapDoc,
			asyncMode: Boolean(handleResponse),
			callback: handleResponse,
			errorCallback: errorCallback
		};
		var appController = this._appCtxt.getAppController();
		appController.sendRequest(params);
	}
	
	// post processing
	else if (callback) {
		callback.run(folderId, response);
	}
};

ZmNotebookCache.prototype._fillCacheResponse2 =
function(folderId, callback, errorCallback, response) {

	var resp = response.GetFolderResponse || (response._data && response._data.GetFolderResponse);
	var folder = resp.folder && resp.folder[0];
	var folders = folder && folder.folder;
	if (folders) {
		var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
		var parent = tree.getById(folderId);
		for (var i = 0; i < folders.length; i++) {
			var obj = folders[i];

			// remove sub-tree if it already exists
			var notebook = tree.getById(obj.id);
			if (notebook) {
				parent.children.remove(notebook);
				notebook._notify(ZmEvent.E_DELETE);
			}

			// create sub-tree and add to tree
			var notebook = ZmNotebook.createFromJs(parent, obj, tree, null);
			parent.children.add(notebook);
			notebook._notify(ZmEvent.E_CREATE);
		}
	}

	if (callback) {
		callback.run(folderId, response);
	}
};

ZmNotebookCache.prototype._handleChange = function(event) {
};
