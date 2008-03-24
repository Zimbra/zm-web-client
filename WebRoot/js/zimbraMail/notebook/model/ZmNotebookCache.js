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

ZmNotebookCache = function() {
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

ZmNotebookCache.prototype._idMap;
ZmNotebookCache.prototype._foldersMap;
ZmNotebookCache.prototype._pathMap;
ZmNotebookCache.prototype._idPathMap;
ZmNotebookCache.prototype._idxPageMap;

ZmNotebookCache.prototype._changeListener;

//
// Public methods
//

// cache management

ZmNotebookCache.prototype.fillCache = 
function(folderId, callback, errorCallback) {
	var tree = appCtxt.getFolderTree();
	/***
	var notebook = appCtxt.getById(folderId);
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
	
	var appController = appCtxt.getAppController();
	var response = appController.sendRequest(params);
	
	if (!params.asyncMode) {
		this._fillCacheResponse(params, folderId, null, errorCallback, response);
	}
};

ZmNotebookCache.prototype.putItem = 
function(item1, ignoreFolderContents) {
	
	var folderId = item1.folderId || ZmNotebookItem.DEFAULT_FOLDER;
	var item = this.getPage(item1);
	
	if (item.id) {
		this._idMap[item.id] = item;
	}
	if(item.path && item.id) {
		this._pathMap[item.path] = item;
		this._idPathMap[item.id] = item.path;
	}
	
    if(this._foldersMap[folderId] != null) {
	    this._foldersMap[folderId].all[item.name] = item;
		if (item instanceof ZmPage) {
	    	this._foldersMap[folderId].pages[item.name] = item;
		}else if (item instanceof ZmDocument) {
		    this._foldersMap[folderId].docs[item.name] = item;
		}
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
ZmNotebookCache.prototype.putPage = 
function(page, ignoreFolderContents) {
	this.putItem(page);
};
ZmNotebookCache.prototype.putDocument = 
function(doc, ignoreFolderContents) {
	this.putItem(doc, ignoreFolderContents);
};

ZmNotebookCache.prototype.renameItem = 
function(item, newName) {
	this.removeItem(item);
	item.name = newName;
	this.putItem(item);
};
ZmNotebookCache.prototype.renamePage = 
function(page, newName) {
	this.renameItem(page, newName);
};
ZmNotebookCache.prototype.renameDocument = 
function(doc, newName) {
	this.renameItem(doc, newName);
};

ZmNotebookCache.prototype.removeItem = 
function(item) {
	if(item.path){
		delete this._pathMap[item.path];
	}
	if (item.id) {
		delete this._idPathMap[item.id];
		delete this._idMap[item.id];
		delete this._idxPageMap[item.id];
	}
	
	if(item.folderId) {
		delete this._idxPageMap[item.folderId];
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
ZmNotebookCache.prototype.removePage = 
function(page) {
	this.removeItem(page);
};
ZmNotebookCache.prototype.removeDocument = 
function(doc) {
	this.removeItem(doc);
};

ZmNotebookCache.prototype.clearCache = 
function() {
	this._idMap = {};
	this._foldersMap = {};
	this._pathMap = {};
	this._idPathMap = {};
	this._idxPageMap = {};
};

// query methods
ZmNotebookCache.prototype.getPaths = 
function() {
	return this._pathMap;
};
ZmNotebookCache.prototype.getIds = 
function() {
	return this._idMap;
};
ZmNotebookCache.prototype.getFolders = 
function() {
	return this._foldersMap;
};
ZmNotebookCache.prototype.getItemByPath = 
function(path) {
	return this._pathMap[path];
};
ZmNotebookCache.prototype.getItemById = 
function(id) {
	return this._idMap[id];
};
ZmNotebookCache.prototype.getPageById = 
function(id) {
	var item = this._idMap[id];
	return item instanceof ZmPage ? item : null;
};
ZmNotebookCache.prototype.getDocumentById = 
function(id) {
	var item = this._idMap[id];
	return item instanceof ZmDocument ? item : null;
};

ZmNotebookCache.prototype.getItemByName = 
function(folderId, name, traverseUp) {
	var items = this.getItemsInFolder(folderId);
	var item = items.pages[name] || items.docs[name];
	return item;
};
ZmNotebookCache.prototype.getPageByName = 
function(folderId, name, traverseUp) {
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
			requestNode.setAttribute("requestId", specialName);
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

		var appController = appCtxt.getAppController();
		var response = appController.sendRequest(params);

		// add found pages to the cache
		var batchResp = response && response.BatchResponse;
		var wikiResp = batchResp && batchResp.GetWikiResponse;
		if (wikiResp) {
			for (var i = 0; i < wikiResp.length; i++) {
				var word = wikiResp[i].w[0];
				var page = this.getPageById(word.id);
				if (!page) {
					page = new ZmPage();
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
			var page = new ZmPage();
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
ZmNotebookCache.prototype.getDocumentByName = 
function(folderId, name, traverseUp) {
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
ZmNotebookCache.prototype.getItemByLink = 
function(link) {
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

		var appController = appCtxt.getAppController();
		var response = appController.sendRequest(params);

		// handle response
		return this._getPageByLinkResponse(response);
	}

	// link: /Foo/Bar
	var notebook = null;
	if (link.match(/^\//)) {
		// TODO: Handle case where current folder owner is not me
		//       because absolute paths should be relative to where
		//       the link was followed. [Q] Should they?
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
		notebook = appCtxt.getById(rootId);
		link = link.substr(1);
	}
	if (!notebook) {
		var app = appCtxt.getApp(ZmApp.NOTEBOOK);
		var controller = app.getNotebookController();
		var currentPage = controller.getPage();
		var folderId = (currentPage && currentPage.folderId) || ZmOrganizer.ID_NOTEBOOK;
		notebook = appCtxt.getById(folderId);
	}

	// link: Foo/Bar
	if (link.match(/\//)) {
		var names = link.replace(/\/$/,"").split('/');
		for (var i = 0; i < names.length - 1; i++) {
			var name = names[i];
            if (name == ".") continue;
            if (name == "..") {
                if (notebook == null) return null;
                notebook = notebook.parent;
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
	var item = notebook ? this.getItemByName(notebook.id, link, traverseUp) : null;
	return item;
};
ZmNotebookCache.prototype.getPageByLink = 
function(link) {
	var item = this.getItemByLink(link);
	return item instanceof ZmPage ? item : null;
};
ZmNotebookCache.prototype.getDocumentByLink = 
function(link) {
	var item = this.getItemByLink(link);
	return item instanceof ZmDocument ? item : null;
};

ZmNotebookCache.prototype._getPageByLinkResponse = 
function(response) {
	var batchResp = response && response._data && response._data.BatchResponse;
	var wikiResp = batchResp && batchResp.GetWikiResponse;
	var word = wikiResp && wikiResp.w && wikiResp.w[0];
	if (word) {
		var page = this.getPageById(word.id);
		if (!page) {
			page = new ZmPage();
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

ZmNotebookCache.__getNotebookByName = 
function(parent, name) {
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

ZmNotebookCache.prototype.getItemsInFolder = 
function(folderId) {
	folderId = folderId || ZmNotebookItem.DEFAULT_FOLDER;
	if (!this._foldersMap[folderId]) {
		this._foldersMap[folderId] = { all: {}, pages: {}, docs: {} };
		this.fillCache(folderId);
	}
	return this._foldersMap[folderId];
};
ZmNotebookCache.prototype.getPagesInFolder = 
function(folderId) {
	return this.getItemsInFolder(folderId).pages;
};
ZmNotebookCache.prototype.getDocumentsInFolder = 
function(folderId) {
	return this.getItemsInFolder(folderId).docs;
};

// make a proxy of a page in a different folder
ZmNotebookCache.prototype.makeProxyPage = 
function(page, folderId) {
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
	var notebook = appCtxt.getById(folderId);
	var remoteFolderId = (notebook && notebook.zid) ? notebook.zid + ":" + notebook.rid : undefined;
	// add pages to folder map in cache
	if (response && (response.SearchResponse || response._data.SearchResponse)) {
		var searchResponse = response.SearchResponse || response._data.SearchResponse;
		var words = searchResponse.w || [];
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var item = this.getPageById(word.id);
			if (!item) {
				item = new ZmPage();
				item.set(word);
				item.folderId = folderId;
				item.remoteFolderId = remoteFolderId; // REVISIT
				this.markCustomIndexPage(item);				
				this.putPage(item, true);
			}
			else {
				item.set(word);
			}
			
			if((item.name == "_Index") && (remoteFolderId !=null)){
				this._updateIndexItem(folderId, remoteFolderId, word);										
			}
			
		}
		var docs = searchResponse.doc || [];
		for (var i = 0; i < docs.length; i++) {
			var doc = docs[i];
			var item = this.getDocumentById(doc.id);
			if (!item) {
				item = new ZmDocument();
				item.set(doc);
				item.folderId = folderId;
				item.remoteFolderId = remoteFolderId; // REVISIT
				this.putDocument(item, true);
			}
			else {
				item.set(doc);
			}
		}

		// retrieve another block of pages, if necessary
		if (searchResponse.more && requestParams) {
			var soapDoc = requestParams.soapDoc;
			var limit = Number(soapDoc.getMethod().getAttribute("limit")) * 2;
			soapDoc.setMethodAttribute("offset", searchResponse.offset + words.length);
			soapDoc.setMethodAttribute("limit", limit);
			// NOTE: In order to re-use the soapDoc again, we have
			//       to remove the old header element.
			var headerEl = soapDoc.getHeader();
			headerEl.parentNode.removeChild(headerEl);

			var appController = appCtxt.getAppController();
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
		var appController = appCtxt.getAppController();
		appController.sendRequest(params);
	}
	
	// post processing
	else if (callback) {
		callback.run(folderId, response);
	}
};

ZmNotebookCache.prototype._updateIndexItem =
function(folderId, remoteFolderId, word) {
	var indexItem = this.getPageById(folderId);
	if (!indexItem) {					
		indexItem = new ZmPage();
		indexItem.set(word);
		indexItem.id = folderId;
		indexItem.folderId = folderId;
		indexItem.remoteFolderId = remoteFolderId; // REVISIT
		this.markCustomIndexPage(indexItem);				
		this.putPage(indexItem, true);
	}else {
		indexItem.set(word);
		indexItem.id = folderId;				
	}	
};

ZmNotebookCache.prototype._fillCacheResponse2 =
function(folderId, callback, errorCallback, response) {

	var tree = appCtxt.getFolderTree();
	var resp = response.GetFolderResponse || (response._data && response._data.GetFolderResponse);
	var folder = resp.folder && resp.folder[0];
	var folders = folder && folder.folder;
	var parent = appCtxt.getById(folderId);
	
	if (folders && parent) {
		for (var i = 0; i < folders.length; i++) {
			var obj = folders[i];
			
			// remove sub-tree if it already exists
			var notebook = appCtxt.getById(obj.id);
			if (notebook) {
				parent.children.remove(notebook);
				notebook._updated = true;
				notebook._notify(ZmEvent.E_DELETE);
			}

			// create sub-tree and add to tree
			var notebook = ZmFolderTree.createFromJs(parent, obj, tree);
			notebook._updated = true;
			parent.children.add(notebook);
			notebook._notify(ZmEvent.E_CREATE);
		}
	}
	
	if (callback) {
		callback.run(folderId, response);
	}
};

ZmNotebookCache.prototype._handleChange = 
function(event) {
};

ZmNotebookCache.prototype._processResponse = 
function(searchResponse)
{
	try{
		var result = [];
		
		if(!searchResponse){		
			return result;
		}
		
		//var searchResponse = response.SearchResponse || response._data.SearchResponse;
		var words = searchResponse.w || [];
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var item = this.getPageById(word.id);
			if (!item) {
				item = new ZmPage();
				item.set(word);
				item.folderId = word.l || ZmNotebookItem.DEFAULT_FOLDER;
				this.putPage(item);
			}
			else {
				item.set(word);
			}
			result.push(item);
		}
		var docs = searchResponse.doc || [];
		for (var i = 0; i < docs.length; i++) {
			var doc = docs[i];
			var item = this.getDocumentById(doc.id);
			if (!item) {
				item = new ZmDocument();
				item.set(doc);
				item.folderId = doc.l || ZmNotebookItem.DEFAULT_FOLDER;
				this.putDocument(item);
			}
			else {
				item.set(doc);
			}
			result.push(item);
		}
		
		return result;
		
	}
	//TODO: remote folder id
	catch(ex){ 
		DBG.println(AjxDebug.DBG1,'zmnotebook cache excep:'+ex); 
	} 
};


ZmNotebookCache.prototype.checkCache = 
function(params){
	var item = null;
	if(params.folderId && params.name){
		item = this.getItemByName(params.folderId,params.name);
	}else if(params.id){
		item = this.getItemById(params.id);
	}else if(params.path){
		item = this.getItemByPath(params.path);
	}
	return item;
};

ZmNotebookCache.prototype.getItemInfo = 
function(params,overrideCache)
{
		var item = this.checkCache(params);
		
		if(item && !overrideCache){
			//DBG.println("item found on cache:"+item+","+item.id+",folder:"+item.folderId+","+item.getRestUrl());
			if(params.callback){
				params.callback.run(item);
			}
			return item;
		}
		
		var soapDoc = AjxSoapDoc.create("GetItemRequest", "urn:zimbraMail");		
		var folderNode = soapDoc.set("item");
		
		if(params.path){
			folderNode.setAttribute("path", params.path);
        }else if(params.folderId && params.id){ //bug:19658
			folderNode.setAttribute("l", params.folderId);
			folderNode.setAttribute("id", params.id);    
        }else if(params.folderId && params.name){
			folderNode.setAttribute("l", params.folderId);			
			folderNode.setAttribute("name", params.name);
		}else if(params.id){
			folderNode.setAttribute("id", params.id);			
		}
		
		var args = [];
		var asyncMode = (params.callback?true:false);

		var handleResponse = null;
		if(asyncMode){
			handleResponse = new AjxCallback(this, this.handleGetItemResponse,[params]);
		}
		
		var reqParams = {
			soapDoc: soapDoc,
			asyncMode: asyncMode,
			callback: handleResponse,
			accountName: params.accountName		
		};
		
		var appController = appCtxt.getAppController();
		var response = appController.sendRequest(reqParams);
		
		if(!asyncMode && response){
		var item = this.handleGetItemResponse(params,response.GetItemResponse);		
		return item;
		}	
		
		return null;
};

ZmNotebookCache.prototype.handleGetItemResponse = 
function(params,response)
{
		try{
			var path = params.path;
			var callback = params.callback;
			
			var getItemResponse = response;
			if(response && response._data){
				getItemResponse = response && response._data && response._data.GetItemResponse;
			}
			var folderResp = getItemResponse && getItemResponse.folder && getItemResponse.folder[0];
			var wikiResp = getItemResponse && getItemResponse.w && getItemResponse.w[0];
			var linkResp = getItemResponse && getItemResponse.link && getItemResponse.link[0];
		
			var item = null;

			if(folderResp){
				item = new ZmPage();
				item.set(folderResp);
				item.folderId = folderResp.id || ZmNotebookItem.DEFAULT_FOLDER;
				item.name = "_Index";
			}
			if(wikiResp){
				item = new ZmPage();
				item.set(wikiResp);
				item.folderId = wikiResp.l || ZmNotebookItem.DEFAULT_FOLDER;
				this.markCustomIndexPage(item);				
			}
			if(linkResp){
				item = new ZmPage();
				item.set(linkResp);
				item.folderId = linkResp.id || ZmNotebookItem.DEFAULT_FOLDER;
				item.remoteFolderId = (linkResp && linkResp.zid) ? linkResp.zid + ":" + linkResp.rid : undefined;
				item.name = "_Index";
			}			

			if(item && !params.ignoreCaching){	
				if(!path){
					path = this.getPath(item.restUrl);
				}							
				item.path = path;				
				this.putItem(item);				
			}
	
			if(callback){
				callback.run(item);
			}

			return item;			
		}catch(ex){
			DBG.println(AjxDebug.DBG1,'exception in handleGetItemResponse:'+ex);
		}
};

ZmNotebookCache.prototype.getPath = 
function(url){

	var parts = this.parseURL(url);

	if(!parts)
	return;
	
	var path = parts.path;
//	var path = path1.replace(/^\/?home\//,"");

	if(!path || path=="blank")
	return;
	
	path = unescape(path);
	
	if(path.charAt(0)=='/'){
		path = path.substring(1);
	}		
	var accountName = null;
	var wikiPath = null;	
	var parts = path.split("/");	
	if(parts.length>=3 && parts[0] == "home"){
		var accountName = parts[1];
		var len = parts.length;
		var newParts = parts.splice(2,len-2);
		wikiPath = newParts.join("/");	
		return wikiPath;
	}
	return path;
};

ZmNotebookCache.prototype.parseURL = 
function(sourceUri) {

    var names = ["source","protocol","authority","domain","port","path","directoryPath","fileName","query","anchor"];
    var parts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
    var uri = {};
    
    for(var i = 0; i < 10; i++){
        uri[names[i]] = (parts[i] ? parts[i] : "");
    }
    
    if(uri.directoryPath.length > 0){
        uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
    }
    
    return uri;
};

//correct all the cross domain reference in passed url content
//eg: http://<ipaddress>/ url might have rest url page which points to http://<server name>/ pages
ZmNotebookCache.prototype.fixCrossDomainReference = 
function(url, restUrlAuthority) {

	var refURL = window.location.protocol+"//"+window.location.host;
	var urlParts = this.parseURL(url);
	if(urlParts.authority!=window.location.host){
		var oldRef = urlParts.protocol +"://"+ urlParts.authority;
		if((restUrlAuthority && url.indexOf(restUrlAuthority) >=0) || !restUrlAuthority){
			url = url.replace(oldRef,refURL);			
		}
	}
	return url;	

};

//tracking all custom pages which has the name _Index given by user
//currently we show table of contents page assuming it as _Index page
ZmNotebookCache.prototype.markCustomIndexPage =
function(item) {
	if(item.name == "_Index"){
		item._customIndexPage = true;
		this._idxPageMap[item.id] = item;
		this._idxPageMap[item.folderId] = item;		
		if(this._idMap[item.folderId] !=null){
			this._idMap[item.folderId]._customIndexPage = true;	
		}
	}
};

ZmNotebookCache.prototype.getPage =
function(item) {
	if(item.name == "_Index"){
		if(this._idxPageMap[item.id]){
			return this._idxPageMap[item.id];
		}else if(this._idxPageMap[item.folderId]){
			return this._idxPageMap[item.folderId];
		}
	}
	return item;	
};

ZmNotebookCache.prototype.updateItems =
function(folderId, oldRestUrl, newRestUrl) {
	
	this._updateOrganizers(folderId, oldRestUrl, newRestUrl);	
	this._updateCacheItems(folderId, oldRestUrl, newRestUrl);

};

ZmNotebookCache.prototype._updateOrganizers =
function(folderId, oldRestUrl, newRestUrl) {
	
	var folder = appCtxt.getById(folderId);	
	if(!folder) return;
	
	var notebooks = folder ? folder.children.getArray() : [];
	for (var i = 0; i < notebooks.length; i++) {
		var notebook = notebooks[i];
		if(notebook && notebook.restUrl) {
			notebook.restUrl = notebook.restUrl.replace(oldRestUrl,newRestUrl);				
		}
		if(notebook) {
			this._updateOrganizers(notebook.id, oldRestUrl, newRestUrl);
			this._updateCacheItems(notebook.id, oldRestUrl, newRestUrl);
		}
	}	

};

ZmNotebookCache.prototype._updateCacheItems =
function(folderId, oldRestUrl, newRestUrl) {
	
	var fItems = this._foldersMap[folderId];	
	if(!fItems) return;
	
	var pages = fItems.pages;
	for(var i in pages){
		var page = pages[i];
		if(page && page.restUrl){
			page.restUrl = page.restUrl.replace(oldRestUrl,newRestUrl);	
		}
	}

};