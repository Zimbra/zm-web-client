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

ZmPage = function(id, list) {
	ZmNotebookItem.call(this, ZmItem.PAGE, id, list);
}
ZmPage.prototype = new ZmNotebookItem;
ZmPage.prototype.constructor = ZmPage;

ZmPage.prototype.toString =
function() {
	return "ZmPage";
};

// Static functions

ZmPage.load =
function(folderId, name, version, callback, errorCallback, traverseUp) {
	var page = new ZmPage();
	page.folderId = folderId;
	page.name = name;
	page.load(version, callback, errorCallback, traverseUp);
	return page;
};

ZmPage.save =
function(folderId, name, content, callback, errorCallback) {
	var page = new ZmPage();
	page.folderId = folderId;
	page.name = name;
	page._content = content;
	page.save(callback, errorCallback);
};

ZmPage.createFromDom =
function(node, args) {
	var page = new ZmPage(null, args.list);
	page.set(node);
	var notebookApp = appCtxt.getApp(ZmApp.NOTEBOOK);
	var cache = notebookApp.getNotebookCache();
	cache.putPage(page);
	return page;
};

// Public methods

// query

ZmPage.prototype.getPath =
function() {
	var dontIncludeThisName = this.name == ZmNotebook.PAGE_INDEX;
	return ZmNotebookItem.prototype.getPath.call(this, dontIncludeThisName);
};

ZmPage.prototype.getRestUrl =
function() {
	var dontIncludeThisName = this.name == ZmNotebook.PAGE_INDEX;
	return ZmNotebookItem.prototype.getRestUrl.call(this, dontIncludeThisName);
};

ZmPage.prototype.setContent =
function(content) {
	this._content = content;
};

ZmPage.prototype.getContent =
function(callback, errorCallback) {
	if (this.name && this._content == null && this.version != 0) {
		this.load(this.version, callback, errorCallback);
	} else if (callback) {
		callback.run();
	}
	return this._content;
};

/**
* Returns the notebook that owns this page. If this item's owning folder is a section,
* we will go up the hierarchy of folders till we get to the top-level notebook.
*/
ZmPage.prototype.getNotebook =
function() {
	if (!this._notebook) {
		var folder = appCtxt.getById(this.folderId);
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
		while (folder && folder.parent && (folder.parent.id != rootId)) {
			folder = folder.parent;
		}
		this._notebook = folder;
	}
	return this._notebook;
};

ZmPage.prototype.isShared =
function() {
	var notebook = this.getNotebook();
	return notebook && notebook.link;
};

ZmPage.prototype.isFolderReadOnly =
function() {
    var isFolderReadOnly = false;
	var folder = appCtxt.getById(this.folderId);
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
    while (folder && folder.parent && (folder.parent.id != rootId) && !folder.isReadOnly()) {
		folder = folder.parent;
	}

	if (folder && folder.isReadOnly()) {
		isFolderReadOnly = true;
	}
	return isFolderReadOnly;
};

ZmPage.prototype.isReadOnly =
function() {
	if (this.isIndex()) {return true; }
	
	//if one of the ancestor is readonly then no chances of childs being writable		
	var isReadOnly = false;
	var folder = appCtxt.getById(this.folderId);
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	while (folder && folder.parent && (folder.parent.id != rootId) && !folder.isReadOnly()) {
		folder = folder.parent;
	}

	if (folder && folder.isReadOnly()) {
		isReadOnly = true;
	}
	
	return isReadOnly;
};

ZmPage.prototype.isChildOf =
function(folderId) {
	var folder = appCtxt.getById(this.folderId);

	if (this.folderId == folderId) { return true; }

	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	while (folder && folder.id && (folder.id != rootId) ) {
		if(folder.id == folderId) return true;
		folder = folder.parent;
	}

	return false;
};

ZmPage.prototype.isIndex =
function() {
	return ((this.name == ZmNotebook.PAGE_INDEX) && (!this._customIndexPage));
};


// i/o

ZmPage.prototype.save =
function(callback, errorCallback) {

	// create soap doc
	var soapDoc = AjxSoapDoc.create("SaveWikiRequest", "urn:zimbraMail", null);
	var wordNode = soapDoc.set("w", this._content);
	wordNode.setAttribute("name", this.name);
	if (this.id && this.version) {
		wordNode.setAttribute("id", this.id);
		wordNode.setAttribute("ver", this.version);
	}
	if (this.folderId) {
		wordNode.setAttribute("l", this.folderId);
	}

	// execute call
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback
	};
	appCtxt.getAppController().sendRequest(params);
};

/**
 * @param version		[number]		The version to load.
 * @param callback		[AjxCallback]*	The callback to run on successful
 *										completion. If no value is passed
 *										for this parameter, then the load
 *										is performed synchronously.
 * @param errorCallback	[AjxCallback]*	The callback to run on error.
 * @param traverseUp	[boolean]*		Tells the server to look up the
 *										directory chain to find this page.
 *										Page's whose name starts with an
 *										underscore are automatically traced
 *										up the folder chain unless this
 *										parameter is explicitly set.
 */
ZmPage.prototype.load = 
function(version, callback, errorCallback, traverseUp) {
	var soapDoc = AjxSoapDoc.create("GetWikiRequest", "urn:zimbraMail");
	var wordNode = soapDoc.set("w");
	if (this.id) {
		wordNode.setAttribute("id", this.id);
	}
	else {
		wordNode.setAttribute("name", this.name);
		if (this.folderId) {
			wordNode.setAttribute("l", this.folderId);
		}
	}
	if (version) {
		wordNode.setAttribute("ver", version);
	}
	if (traverseUp || (traverseUp == null && this.name.match(/^_/))) {
		wordNode.setAttribute("tr", "1");
	}
	
	var handleResponse = callback ? new AjxCallback(this, this._loadHandleResponse, [callback]) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(handleResponse),
		callback: handleResponse,
		errorCallback: errorCallback,
		noBusyOverlay: false
	};
	
	var appController = appCtxt.getAppController();
	var response = appController.sendRequest(params);
	if (!params.asyncMode) {
		this._loadHandleResponse(callback, response);
	}
};

ZmPage.prototype.getPrintHtml =
function(preferHtml, callback) {
	return ZmNotebookPageView.getPrintHtml(this);
};

/***
ZmPage.prototype.notifyModify = function(obj) {
	// TODO
	ZmItem.prototype.notifyModify.call(this, obj);
};
/***/

// initialization

ZmPage.prototype.set =
function(data) {
	var version = this.version;
	ZmNotebookItem.prototype.set.call(this, data);

	// ZmPage fields
	// REVISIT: This is temporary!
	if (data.fr != null) {
		this.fragment = data.fr instanceof Array ? data.fr[0]._content : data.fr;
	}

	if (version != this.version && data.body == null) {
		this._content = null;
	} else if (data.body != null) {
		this._content = (data.body instanceof Array) ? data.body[0]._content : data.body;
	}
};

// Protected methods

ZmPage.prototype._loadHandleResponse =
function(callback, response) {
	var loaded = response && response.GetWikiResponse && response.GetWikiResponse.w;
	if (loaded) {
		var data = response.GetWikiResponse.w[0];
		this.set(data);
	}
	if (callback) {
		callback.run(this);
	}
};
