/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 */

/**
 * Creates a briefcase item.
 * @class
 * This class represents a briefcase item.
 * 
 * @param {int}			id			the unique id
 * @param {ZmList}		list		a list that contains this item
 * @param {Boolean}		noCache		if <code>true</code>, do not cache this item

 * @extends		ZmItem
 * 
 * @see		ZmBriefcase
 */
ZmBriefcaseItem = function(id, list, noCache) {

	if (arguments.length == 0) { return; }

	ZmItem.call(this, ZmItem.BRIEFCASE_ITEM, id, list, noCache);
};

ZmBriefcaseItem.prototype = new ZmItem;
ZmBriefcaseItem.prototype.constructor = ZmBriefcaseItem;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmBriefcaseItem.prototype.toString =
function() {
	return "ZmBriefcaseItem";
};


// Static functions

/**
 * Creates a briefcase item from the dom.
 * 
 * @param	{Object}	node		the node
 * @param	{Hash}		args		a hash of arguments
 * 
 * @return	{ZmBriefcaseItem}	the briefcase item
 */
ZmBriefcaseItem.createFromDom =
function(node, args) {
	var item = new ZmBriefcaseItem(node.id, args.list);
	item._loadFromDom(node);
	return item;
};

// Public methods

/**
 * Gets the path.
 * 
 * @param	{Boolean}	dontIncludeThisName		if <code>true</code>, do not include this item name in the path
 * @return	{String}	the path
 */
ZmBriefcaseItem.prototype.getPath =
function(dontIncludeThisName) {
	var briefcase = appCtxt.getById(this.folderId);
	var name = !dontIncludeThisName ? this.name : "";
	return [briefcase.getPath(), "/", name].join("");
};
                      
/**
 * Gets the REST URL.
 * 
 * @param	{Boolean}	dontIncludeThisName		if <code>true</code>, do not include this item name in the path
 * @param	{Boolean}	ignoreCustomDocs		if <code>true</code>, ignore custom docs
 * @return	{String}	the REST URL
 */
ZmBriefcaseItem.prototype.getRestUrl =
function(dontIncludeThisName, ignoreCustomDocs) {
	var url = ZmItem.prototype.getRestUrl.call(this);
	if (dontIncludeThisName) {
		url = url.replace(/[^\/]+$/,"");
	}
    if(!ignoreCustomDocs && this.contentType && this.isWebDoc()) {
        url += "?fmt=html";
    }
	return url;
};

/**
 * Checks if this item is a real file.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a real file (not a web doc or folder)
 */
ZmBriefcaseItem.prototype.isRealFile =
function() {
    return (!this.isFolder && !this.isWebDoc());  
};

/**
 * Checks if this item is a web doc.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a web doc
 */
ZmBriefcaseItem.prototype.isWebDoc =
function() {
    return (this.contentType == ZmMimeTable.APP_ZIMBRA_SLIDES || this.contentType == ZmMimeTable.APP_ZIMBRA_SPREADSHEET || this.contentType == ZmMimeTable.APP_ZIMBRA_DOC);
};

/**
 * Checks if this item is an document which can only be downloaded and cannot be rendered by browser
 *
 * @return	{Boolean}	<code>true</code> if this item is downloadable
 */
ZmBriefcaseItem.prototype.isDownloadable =
function() {
    return (!this.isWebDoc() && !ZmMimeTable.isRenderable(this.contentType) && !ZmMimeTable.isRenderableImage(this.contentType) && !ZmMimeTable.isTextType(this.contentType));
};

/**
 * Checks if this item is a slide doc.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a slide doc
 */
ZmBriefcaseItem.prototype.isSlideDoc =
function() {
    return (this.contentType == ZmMimeTable.APP_ZIMBRA_SLIDES);
};

/**
 * Gets the content type.
 * 
 * @return	{String}	the content type
 */
ZmBriefcaseItem.prototype.getContentType =
function() {
    return this.contentType;
};

/**
 * Gets the icon.
 * 
 * @param	{Boolean}	large		if <code>true</code>, return the large icon
 * @return	{String}	the icon
 */
ZmBriefcaseItem.prototype.getIcon =
function(large) {

	if (this.isFolder) {
		return "Folder";
	}

	var ct = this.contentType, icon;
	if (ct && ct.match(/;/)) {
		ct = ct.split(";")[0];
	}
	var mimeInfo = ct ? ZmMimeTable.getInfo(ct) : null;
	if (large) {
		icon = mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48";
	} else {
		icon = mimeInfo ? mimeInfo.image : "UnknownDoc" ;
	}

	return icon;
};

/**
 * Checks if this item is read only.
 * 
 * @return	{Boolean}	<code>true</code> if this item is read only
 */
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

/**
 * Gets the briefcase folder.
 * 
 * @return	{ZmBriefcase}	the folder
 */
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

/**
 * Checks if this item is shared.
 * 
 * @return	{Boolean}	<code>true</code> if this item is shared
 */
ZmBriefcaseItem.prototype.isShared =
function() {
	var briefcase = this.getBriefcaseFolder();
	return briefcase && briefcase.link;
};

/**
 * Creates an item from an attachment.
 * 
 * @param	{String}	msgId		the message
 * @param	{String}	partId		the message part
 * @param	{String}	name		the item name
 * @param	{String}	folderId		the folder id
 */
ZmBriefcaseItem.prototype.createFromAttachment =
function(msgId, partId, name, folderId) {
	var acctId = appCtxt.getActiveAccount().id;
    
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
};

ZmBriefcaseItem.prototype._handleErrorCreateItem =
function(ex) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.errorCreateFile, ZmStatusView.LEVEL_CRITICAL);
};

/**
 * Gets the folder.
 * 
 * @return	{ZmFolder}		the folder
 */
ZmBriefcaseItem.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

ZmBriefcaseItem.prototype._loadFromDom =
function(node) {

	this.id = node.id;

	if (node.rest)	{ this.restUrl = node.rest; }
	if (node.l)		{ this.folderId = node.l; }
	if (node.name)	{ this.name = node.name; }
	if (node.cr)	{ this.creator = node.cr; }
	if (node.d)		{ this.createDate = new Date(Number(node.d)); }
	if (node.md)	{ this.modifyDate = new Date(Number(node.md)); }
	if (node.leb)	{ this.modifier = node.leb; }
	if (node.s)		{ this.size = Number(node.s); }
	if (node.ver)	{ this.version = Number(node.ver) || 0; }
	if (node.ct)	{ this.contentType = node.ct.split(";")[0]; }
	if (node.t)		{ this._parseTags(node.t); }
};

// Mendoza line

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


ZmBriefcaseFolderItem = function(folder) {

	ZmBriefcaseItem.call(this, folder.id, null, true);

	this.name = folder.name;
	this.folderId = folder.parent && folder.parent.id;
	this.isFolder = true;
	this.folder = folder;

	this._data = {};
};

ZmBriefcaseFolderItem.prototype = new ZmBriefcaseItem;
ZmBriefcaseFolderItem.prototype.constructor = ZmBriefcaseFolderItem;

ZmBriefcaseFolderItem.prototype.toString =
function() {
	return "ZmBriefcaseFolderItem";
};

ZmBriefcaseFolderItem.prototype.getData =
function(key) {
	return this._data[key];
};

ZmBriefcaseFolderItem.prototype.setData =
function(key, value) {
  this._data[key] = value;
};
