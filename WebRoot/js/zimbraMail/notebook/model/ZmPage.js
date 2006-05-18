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

function ZmPage(appCtxt, id, list) {
	if (arguments.length == 0) return;
	ZmItem.call(this, appCtxt, ZmItem.PAGE, id, list);
	this.folderId = ZmPage.DEFAULT_FOLDER;
}
ZmPage.prototype = new ZmItem;
ZmPage.prototype.constructor = ZmPage;

ZmPage.prototype.toString =
function() {
	return "ZmPage";
};

// Constants

ZmPage.DEFAULT_FOLDER = ZmOrganizer.ID_NOTEBOOK;

// Data

ZmPage.prototype.name;
ZmPage.prototype.fragment;
ZmPage.prototype._content; // NOTE: content loading can be deferred
ZmPage.prototype.creator;
ZmPage.prototype.createDate;
ZmPage.prototype.modifier;
ZmPage.prototype.modifyDate;
ZmPage.prototype.size;
ZmPage.prototype.version = 0;

ZmPage.prototype._new;

// Static functions

ZmPage.load = function(appCtxt, folderId, name, version, callback, errorCallback) {
	var page = new ZmPage(appCtxt);
	page.folderId = folderId;
	page.name = name;
	page.load(version, callback, errorCallback);
	return page;
};

ZmPage.save = function(appCtxt, folderId, name, content, callback, errorCallback) {
	var page = new ZmPage(appCtxt);
	page.folderId = folderId;
	page.name = name;
	page._content = content;
	page.save(callback, errorCallback);
};

// Public methods

// query

ZmPage.prototype.getPath = function() {
	var tree = this._appCtxt.getTree(ZmOrganizer.NOTEBOOK);
	var notebook = tree.getById(this.folderId);
	var name = this.name != ZmNotebook.PAGE_INDEX ? this.name : "";
	return [ notebook.getPath(), "/", name ].join("");
};

ZmPage.prototype.getUrl = function() {
	var url = ZmItem.prototype.getUrl.call(this);
	if (this.name == ZmNotebook.PAGE_INDEX) {
		url = url.substring(0, url.length - this.name.length);
	}
	return url;
};

ZmPage.prototype.setContent = function(content) {
	this._content = content;
};
ZmPage.prototype.getContent = function(callback, errorCallback) {
	if (this.name && this._content == null && this.version != 0) {
		this.load(this.version, callback, errorCallback);
	}
	else if (callback) {
		callback.run();
	}
	return this._content;
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
		errorCallback: errorCallback,
		execFrame: null
	};
	var appController = this._appCtxt.getAppController();
	appController.sendRequest(params);
};

ZmPage.prototype.load = 
function(version, callback, errorCallback) {
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
	
	var handleResponse = callback ? new AjxCallback(this, this._loadHandleResponse, [callback]) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(handleResponse),
		callback: handleResponse,
		errorCallback: errorCallback,
		noBusyOverlay: false
	};
	
	var appController = this._appCtxt.getAppController();
	var response = appController.sendRequest(params);
	if (!params.asyncMode) {
		this._loadHandleResponse(callback, response);
	}
};

/***
ZmPage.prototype.notifyModify = function(obj) {
	// TODO
	ZmItem.prototype.notifyModify.call(this, obj);
};
/***/

// initialization

ZmPage.prototype.set = function(data) {
	var version = Number(data.ver);
	if (this.version == version && this._content) return;
	
	// ZmItem fields
	this.id = data.id;
	// REVISIT: Sometimes the server doesn't return the folderId!!!
	this.folderId = data.l || this.folderId;
	this._parseTags(data.t);

	// ZmPage fields
	this.name = data.name;
	// REVISIT: This is temporary!
	this.fragment = data.fr instanceof Array ? data.fr[0]._content : data.fr;
	this._content = data.body instanceof Array ? data.body[0]._content : data.body;
	this.creator = data.cr;
	this.createDate = new Date(Number(data.d));
	this.modifier = data.leb;
	this.modifyDate = new Date(Number(data.md));
	this.size = Number(data.s);
	this.version = version;
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
