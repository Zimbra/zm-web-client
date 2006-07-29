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

//
// Data
//

ZmNotebookCache.prototype._appCtxt;

ZmNotebookCache.prototype._idMap;
ZmNotebookCache.prototype._foldersMap;
ZmNotebookCache.prototype._creatorsMap;

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
	soapDoc.setMethodAttribute("types", "wiki");
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

ZmNotebookCache.prototype.putPage = function(page) {
	if (page.id) { 
		this._idMap[page.id] = page; 
	}
	var folderId = page.folderId || ZmNotebookItem.DEFAULT_FOLDER;
	this.getPagesInFolder(folderId)[page.name] = page;
	/*** REVISIT ***/
	var remoteFolderId = page.remoteFolderId;
	if (remoteFolderId) {
		if (!this._foldersMap[remoteFolderId]) {
			this._foldersMap[remoteFolderId] = this._foldersMap[folderId];
		}
	}
	/***/
	if (page.creator) {
		this.getPagesByCreator(page.creator)[page.name] = page;
	}
	
	page.addChangeListener(this._changeListener);
};

ZmNotebookCache.prototype.renamePage = function(page, newName) {
	var pages = this._foldersMap[page.folderId];
	if (pages) {
		if (pages[page.name]) {
			delete pages[page.name];
			pages[newName] = page;
			page.name = newName;
		}
	}
};

ZmNotebookCache.prototype.removePage = function(page) {
	if (page.id) { 
		delete this._idMap[page.id]; 
	}
	delete this.getPagesInFolder(page.folderId)[page.name];
	/*** REVISIT ***/
	var remoteFolderId = page.remoteFolderId;
	if (remoteFolderId) {
		delete this.getPagesInFolder(remoteFolderId)[page.name];
	}
	/***/
	if (page.creator) {
		delete this.getPagesByCreator(page.creator)[page.name];
	}
	
	page.removeChangeListener(this._changeListener);
};

ZmNotebookCache.prototype.clearCache = function() {
	this._idMap = {};
	this._foldersMap = {};
	this._creatorsMap = {};
};

// query methods

ZmNotebookCache.prototype.getIds = function() {
	return this._idMap;
};
ZmNotebookCache.prototype.getFolders = function() {
	return this._foldersMap;
};
ZmNotebookCache.prototype.getCreators = function() {
	return this._creatorsMap;
};

ZmNotebookCache.prototype.getPageById = function(id) {
	return this._idMap[id];
};
ZmNotebookCache.prototype.getPageByName = function(folderId, name, traverseUp) {
	var pages = this.getPagesInFolder(folderId);
	var page = pages[name];
	if (page != null) return page;

	// one of the "special" pages was requested so load them all at once
	if (name in ZmNotebookCache._SPECIAL_NAMES) {
		// batch load special pages
		var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra");
		soapDoc.setMethodAttribute("onerror", "continue");
		for (var specialName in ZmNotebookCache._SPECIAL_NAMES) {
			if (this._foldersMap[folderId][specialName]) continue;
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

		return this._foldersMap[folderId][name];
	}

	// page not found
	return null;
};

/**
 * Returns a page by link. This method will attempt to locate the page in
 * cache and, if not found, will attempt to get the page from the server.
 * <p>
 * Links can be one of the following formats:
 * <dl>
 * <dt> Foo
 *   <dd> Link to section/page in current notebook
 * <dt> Foo/Bar
 *   <dd> Link to section/page in sub-section of current notebook
 * <dt> /Foo/Bar
 *   <dd> Link to section/page in top-level notebook of owner of current
 *        notebook
 * <dt> //User/Foo/Bar
 *   <dd> Link to section/page in top-level notebook of specific user
 * </dl>
 */
ZmNotebookCache.prototype.getPageByLink = function(link) {
	// link: //User/Foo/Bar
	var m;
	if (m = link.match(/^\/\/([^\/]+)(?:\/(.*))?/)) {
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

	// link: Foo (page)
	var traverseUp = Boolean(link.match(/^_/));
	var page = this.getPageByName(notebook.id, link, traverseUp);
	return page;
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

ZmNotebookCache.prototype.getPagesInFolder = function(folderId) {
	folderId = folderId || ZmNotebookItem.DEFAULT_FOLDER;
	if (!this._foldersMap[folderId]) {
		this._foldersMap[folderId] = {};
		this.fillCache(folderId);
	}
	return this._foldersMap[folderId];
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


ZmNotebookCache.prototype.getPagesByCreator = function(creator) {
	if (!this._creatorsMap[creator]) {
		this._creatorsMap[creator] = {};
	}
	return this._creatorsMap[creator];
};

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
			var page = this.getPageById(word.id);
			if (!page) {
				page = new ZmPage(this._appCtxt);
				page.set(word);
				page.folderId = folderId;
				page.remoteFolderId = remoteFolderId; // REVISIT
				this.putPage(page);
			}
			else {
				page.set(word);
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
