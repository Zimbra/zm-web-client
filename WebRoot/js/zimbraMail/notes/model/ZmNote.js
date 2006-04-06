/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNote(appCtxt, id, list) {
	if (arguments.length == 0) return;
	ZmItem.call(this, appCtxt, ZmItem.MSG, id, list);
	this.folderId = ZmNote.DEFAULT_FOLDER;
}
ZmNote.prototype = new ZmItem;
ZmNote.prototype.constructor = ZmNote;

ZmNote.prototype.toString =
function() {
	return "ZmNote";
};

// Constants

ZmNote.DEFAULT_FOLDER = ZmFolder.ID_INBOX; // REVISIT

// Data

ZmNote.prototype.name;
ZmNote.prototype.fragment;
ZmNote.prototype._content; // NOTE: content loading can be deferred
ZmNote.prototype.creator;
ZmNote.prototype.createDate;
ZmNote.prototype.modifier;
ZmNote.prototype.modifyDate;
ZmNote.prototype.size;
ZmNote.prototype.version = 0;

ZmNote.prototype._new;

// Static functions

ZmNote.load = function(appCtxt, folderId, name, version, callback, errorCallback) {
	var note = new ZmNote(appCtxt);
	note.folderId = folderId;
	note.name = name;
	note.load(version, callback, errorCallback);
	return note;
};

ZmNote.save = function(appCtxt, folderId, name, content, callback, errorCallback) {
	var note = new ZmNote(appCtxt);
	note.folderId = folderId;
	note.name = name;
	note._content = content;
	note.save(callback, errorCallback);
};

// Public methods

// query

ZmNote.prototype.setContent = function(content) {
	this._content = content;
};
ZmNote.prototype.getContent = function(callback, errorCallback) {
	if (this.name && this._content == null) {
		this.load(this.version, callback, errorCallback);
	}
	else if (callback) {
		callback.run();
	}
	return this._content;
};

// i/o

ZmNote.prototype.save =
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

ZmNote.prototype.load = 
function(version, callback, errorCallback) {
	var soapDoc = AjxSoapDoc.create("GetWikiRequest", "urn:zimbraMail");
	var wordNode = soapDoc.set("w");
	wordNode.setAttribute("name", this.name);
	if (this.folderId) {
		wordNode.setAttribute("l", this.folderId);
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

// initialization

ZmNote.prototype.set = function(data) {
	var version = Number(data.ver);
	if (this.version == version && this._content) return;
	
	// ZmItem fields
	this.id = Number(data.id);
	this.folderId = Number(data.l);
	// ZmNote fields
	this.name = data.name;
	this.fragment = data.fr;
	this._content = data.body;
	this.creator = data.cr;
	this.createDate = new Date(Number(data.d));
	this.modifier = data.leb;
	this.modifyDate = new Date(Number(data.md));
	this.size = Number(data.s);
	this.version = version;
};

// Protected methods

ZmNote.prototype._loadHandleResponse =
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
