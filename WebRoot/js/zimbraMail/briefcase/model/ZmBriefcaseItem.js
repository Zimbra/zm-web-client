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

ZmBriefcaseItem = function(type, id, list) {
	if(!type){
		type = ZmItem.BRIEFCASE;
	}
	ZmItem.call(this, type, id, list);
	this.folderId = ZmBriefcaseItem.DEFAULT_FOLDER;
}
ZmBriefcaseItem.prototype = new ZmItem;
ZmBriefcaseItem.prototype.constructor = ZmBriefcaseItem;

ZmBriefcaseItem.prototype.toString = function() {
	return "ZmBriefcaseItem";
};

// Constants

ZmBriefcaseItem.DEFAULT_FOLDER = ZmOrganizer.ID_BRIEFCASE;

// Data

ZmBriefcaseItem.prototype.name;
ZmBriefcaseItem.prototype.creator;
ZmBriefcaseItem.prototype.createDate;
ZmBriefcaseItem.prototype.modifier;
ZmBriefcaseItem.prototype.modifyDate;
ZmBriefcaseItem.prototype.size;
ZmBriefcaseItem.prototype.version = 0;
ZmBriefcaseItem.prototype.contentType;

// Static functions

ZmBriefcaseItem.createFromDom = function(node, args) {
	var item = new ZmBriefcaseItem(args.type || -1, node.id, args.list);
	item.set(node);
	return item;
};

// Public methods

ZmBriefcaseItem.prototype.getPath = function(dontIncludeThisName) {
	var notebook = appCtxt.getById(this.folderId);
	var name = !dontIncludeThisName ? this.name : "";
	return [ notebook.getPath(), "/", name ].join("");
};

ZmBriefcaseItem.prototype.getRestUrl = function(dontIncludeThisName) {
	var url = ZmItem.prototype.getRestUrl.call(this);

	var notebook = appCtxt.getById(this.folderId);
	/*if (notebook) {
		url = url.replace(/^.*\/([^\/]+)$/, notebook.getRestUrl()+"$1");
	}*/

	if (dontIncludeThisName) {
		url = url.replace(/[^\/]+$/,"");
	}
	return url;
};

ZmBriefcaseItem.prototype.set = function(data) {
	this.id = data.id;
	this.restUrl = data.rest != null ? data.rest : this.restUrl;
	this.folderId = data.l != null ? data.l : this.folderId;
	this._parseTags(data.t);

	// ZmBriefcaseItem fields
	this.name = data.name != null ? data.name : this.name;
	this.creator = data.cr != null ? data.cr : this.creator;
	this.createDate = data.d != null ? new Date(Number(data.d)) : this.createDate;
	this.modifier = data.leb != null ? data.leb : this.modifier;
	this.modifyDate = data.md != null ? new Date(Number(data.md)) : this.modifyDate;
	this.size = data.s != null ? Number(data.s) : this.size;
	this.version = data.ver != null ? Number(data.ver) : this.version;
	this.contentType = data.ct != null ? data.ct : this.contentType;	
};

ZmBriefcaseItem.prototype.isReadOnly =
function() {

	//if one of the ancestor is readonly then no chances of childs being writable		
	var isReadOnly = false;
	var folder = appCtxt.getById(this.folderId);
	var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	while (folder && folder.parent && (folder.parent.id != rootId) && !folder.isReadOnly()) {
		folder = folder.parent;
	}
	if(folder && folder.isReadOnly()){
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

	var respCallback = new AjxCallback(this, this._handleResponseCreateItem,[folderId]);
	var errorCallback = new AjxCallback(this, this._handleErrorCreateItem);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true,
												callback:respCallback,
												errorCallback:errorCallback});
	
};

ZmBriefcaseItem.prototype._handleResponseCreateItem =
function(folderId,response) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.fileCreated);
	var copyToDialog =  appCtxt.getChooseFolderDialog();
	copyToDialog.popdown();
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

