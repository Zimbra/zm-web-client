/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmBriefcaseItem = function(id, list) {
	ZmItem.call(this, ZmItem.BRIEFCASE, id, list);
	this.folderId = ZmOrganizer.ID_BRIEFCASE;
	this.version = 0;
}
ZmBriefcaseItem.prototype = new ZmItem;
ZmBriefcaseItem.prototype.constructor = ZmBriefcaseItem;

ZmBriefcaseItem.prototype.toString =
function() {
	return "ZmBriefcaseItem";
};


// Static functions

ZmBriefcaseItem.createFromDom =
function(node, args) {
	var item = new ZmBriefcaseItem(args.type || -1, node.id, args.list);
	item.set(node);
	return item;
};

// Public methods

ZmBriefcaseItem.prototype.getPath =
function(dontIncludeThisName) {
	var notebook = appCtxt.getById(this.folderId);
	var name = !dontIncludeThisName ? this.name : "";
	return [notebook.getPath(), "/", name].join("");
};

ZmBriefcaseItem.prototype.getRestUrl =
function(dontIncludeThisName) {
	var url = ZmItem.prototype.getRestUrl.call(this);
	if (dontIncludeThisName) {
		url = url.replace(/[^\/]+$/,"");
	}
	return url;
};

ZmBriefcaseItem.prototype.set =
function(data) {
	this.id = data.id;
	if (data.rest) this.restUrl = data.rest;
	if (data.l) this.folderId = data.l;
	if (data.name) this.name = data.name;
	if (data.cr) this.creator = data.cr;
	if (data.d) this.createDate = new Date(Number(data.d));
	if (data.md) this.modifyDate = new Date(Number(data.md));
	if (data.leb) this.modifier = data.leb;
	if (data.s) this.size = Number(data.s);
	if (data.ver) this.version = Number(data.ver);
	if (data.ct) this.contentType = data.ct.split(";")[0];
	this._parseTags(data.t);
};

ZmBriefcaseItem.prototype.isReadOnly =
function() {
	// if one of the ancestor is readonly then no chances of childs being writable
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

ZmBriefcaseItem.prototype.getBriefcaseFolder =
function() {
	if (!this._briefcase) {
		var folder = appCtxt.getById(this.folderId);
		var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
		while (folder && folder.parent && (folder.parent.id != rootId)) {
			folder = folder.parent;
		}
		this._briefcase = folder;
	}
	return this._briefcase;
};

ZmBriefcaseItem.prototype.isShared =
function() {
	var notebook = this.getBriefcaseFolder();
	return notebook && notebook.link;
};

ZmBriefcaseItem.prototype.createFromAttachment =
function(msgId, partId, name, folderId) {

	var soapDoc = AjxSoapDoc.create("SaveDocumentRequest", "urn:zimbraMail");
	var doc = soapDoc.set("doc");
	doc.setAttribute("l", folderId);
	var mnode = soapDoc.set("m", null, doc);
	mnode.setAttribute("id", msgId);
	mnode.setAttribute("part", partId);

	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseCreateItem, [folderId])),
		errorCallback: (new AjxCallback(this, this._handleErrorCreateItem))
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmBriefcaseItem.prototype._handleResponseCreateItem =
function(folderId,response) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.fileCreated);
	appCtxt.getChooseFolderDialog().popdown();

	if (response && (response.SaveDocumentResponse || response._data.SaveDocumentResponse)) {
		var bController = AjxDispatcher.run("GetBriefcaseController");
		bController.removeCachedFolderItems(folderId);		
	}
};

ZmBriefcaseItem.prototype._handleErrorCreateItem =
function(ex) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.errorCreateFile, ZmStatusView.LEVEL_CRITICAL);
};

ZmBriefcaseItem.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};
