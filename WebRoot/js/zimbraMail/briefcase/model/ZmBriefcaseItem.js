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
 * Abstract class
 * @class
 * This class is a base class for briefcase item classes.
 * 
 * @param {int}			id			the unique id
 * @param {ZmList}		list		a list that contains this item
 * @param {Boolean}		noCache		if <code>true</code>, do not cache this item

 * @extends		ZmItem
 * 
 * @see		ZmBriefcaseBaseItem
 */
ZmBriefcaseBaseItem = function(id, list, noCache, type) {

	if (arguments.length == 0) { return; }
	ZmItem.call(this, type, id, list, noCache);
};

ZmBriefcaseBaseItem.prototype = new ZmItem;
ZmBriefcaseBaseItem.prototype.constructor = ZmBriefcaseBaseItem;

//Public methods

/**
 * Gets the path.
 * 
 * @param	{Boolean}	dontIncludeThisName		if <code>true</code>, do not include this item name in the path
 * @return	{String}	the path
 */
ZmBriefcaseBaseItem.prototype.getPath =
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
 * @param   {Boolean}   includeVersion			if <code>true</code> include the version if exists (it's latest for the base item)
 * @return	{String}	the REST URL
 */
ZmBriefcaseBaseItem.prototype.getRestUrl =
function(dontIncludeThisName, ignoreCustomDocs, includeVersion) {
	var url = ZmItem.prototype.getRestUrl.call(this);
	if (dontIncludeThisName) {
		url = url.replace(/[^\/]+$/,"");
	}
	if (includeVersion && this.version){
		url = url + (url.match(/\?/) ? '&' : '?' ) + "ver=" + this.version;
	}

	return url;
};

/**
 * Checks if this item is a real file.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a real file (not a web doc or folder)
 */
ZmBriefcaseBaseItem.prototype.isRealFile =
function() {
    return (!this.isFolder && !this.isWebDoc());  
};

/**
 * Checks if this item is a web doc.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a web doc
 */
ZmBriefcaseBaseItem.prototype.isWebDoc =
function() {
    return (this.contentType == ZmMimeTable.APP_ZIMBRA_SLIDES || this.contentType == ZmMimeTable.APP_ZIMBRA_SPREADSHEET || this.contentType == ZmMimeTable.APP_ZIMBRA_DOC);
};

/**
 * Checks if this item is an document which can only be downloaded and cannot be rendered by browser
 *
 * @return	{Boolean}	<code>true</code> if this item is downloadable
 */
ZmBriefcaseBaseItem.prototype.isDownloadable =
function() {
    return (!this.isWebDoc() && !ZmMimeTable.isRenderable(this.contentType) && !ZmMimeTable.isRenderableImage(this.contentType) && !ZmMimeTable.isTextType(this.contentType));
};

/**
 * Checks if this item is a slide doc.
 * 
 * @return	{Boolean}	<code>true</code> if this item is a slide doc
 */
ZmBriefcaseBaseItem.prototype.isSlideDoc =
function() {
    return (this.contentType == ZmMimeTable.APP_ZIMBRA_SLIDES);
};

/**
 * Gets the content type.
 * 
 * @return	{String}	the content type
 */
ZmBriefcaseBaseItem.prototype.getContentType =
function() {
    return this.contentType;
};

/**
 * Gets the icon.
 * 
 * @param	{Boolean}	large		if <code>true</code>, return the large icon
 * @return	{String}	the icon
 */
ZmBriefcaseBaseItem.prototype.getIcon =
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
ZmBriefcaseBaseItem.prototype.isReadOnly =
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
ZmBriefcaseBaseItem.prototype.getBriefcaseFolder =
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
ZmBriefcaseBaseItem.prototype.isShared =
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
ZmBriefcaseBaseItem.prototype.createFromAttachment =
function(msgId, partId, name, folderId, attribs) {

    attribs = attribs || {};

    var acctId = appCtxt.getActiveAccount().id;

    var json = {
        SaveDocumentRequest: {
            _jsns: "urn:zimbraMail",
			doc: {
                m: {
                    id: msgId,
                    part: partId
                }
            }
        }
    };

    var doc = json.SaveDocumentRequest.doc;
    if (attribs.id && attribs.version) {
        doc.id = attribs.id;
        doc.ver = attribs.version;
    }else{
        doc.l = folderId;
    }
    if(attribs.rename){
        doc.name = attribs.rename;
    }
    var params = {
		jsonObj: json,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseCreateItem, [folderId, attribs.callback])),
		errorCallback: (new AjxCallback(this, this._handleErrorCreateItem, [attribs.errorCallback]))
	};
    appCtxt.getAppController().sendRequest(params);
};

ZmBriefcaseBaseItem.prototype.restoreVersion =
function(restoreVerion, callback){

    var json = {
		SaveDocumentRequest: {
			_jsns: "urn:zimbraMail",
			doc: {
				id:	this.id,
                ver: this.version,
                doc: {
                    id: this.id,
                    ver: restoreVerion
                }
			}
		}
	};

	var params = {
		jsonObj:		json,
		asyncMode:		true,
		callback:		callback
	};
	return appCtxt.getAppController().sendRequest(params);
    
};

ZmBriefcaseBaseItem.prototype.deleteVersion =
function(version, callback, batchCmd){

    var json = {
		PurgeRevisionRequest: {
			_jsns: "urn:zimbraMail",
			revision: {
				id:	this.id,
                ver: version,
                includeOlderRevisions: false
			}
		}
	};

    if(batchCmd){
        batchCmd.addRequestParams(json, callback);
    }else{
        var params = {
            jsonObj:		json,
            asyncMode:		true,
            callback:		callback
        };
        return appCtxt.getAppController().sendRequest(params);
    }

};


ZmBriefcaseBaseItem.prototype._handleResponseCreateItem =
function(folderId, callback, response) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.fileCreated);
	appCtxt.getChooseFolderDialog().popdown();
    if(callback)
        callback.run(response);
};

ZmBriefcaseBaseItem.prototype._handleErrorCreateItem =
function(callback, ex) {

    var handled = false;
	if(callback){
        handled = callback.run(ex);
    }
    appCtxt.getAppController().setStatusMsg(ZmMsg.errorCreateFile, ZmStatusView.LEVEL_CRITICAL);
    return handled;
};

ZmBriefcaseBaseItem.prototype.notifyModify =
function(obj, batchMode) {

	var result = ZmItem.prototype.notifyModify.apply(this, arguments);
	if (result) {
		return result;
	}

    var modified = false, doNotify = true, fields=[];    
    //Updating modified attributes
    this.set(obj);

    if (doNotify) {
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
	}
	
};
/**
 * Gets the folder.
 * 
 * @return	{ZmFolder}		the folder
 */
ZmBriefcaseBaseItem.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

ZmBriefcaseBaseItem.prototype._loadFromDom =
function(node) {

	this.id = node.id;

	if (node.rest)	{ this.restUrl = node.rest; }
	if (node.l)		{ this.folderId = node.l; }
	if (node.name)	{ this.name = node.name; }
	if (node.cr)	{ this.creator = node.cr; }
	if (node.d)		{ this.createDate = new Date(Number(node.d)); }
	if (node.md)	{ //node.md is seconds since epoch
        var mdMilliSecs = Number(node.md)*1000;
        this.modifyDate = new Date(mdMilliSecs);
    }
	if (node.leb)	{ this.modifier = node.leb; }
	if (node.s || node.s == 0) //size can be 0
                    { this.size = Number(node.s); }
	if (node.ver)	{ this.version = Number(node.ver) || 0; }
	if (node.ct)	{ this.contentType = node.ct.split(";")[0]; }
	if (node.t)		{ this._parseTags(node.t); }

    this.locked = false;
    if (node.loid)    {
        this.locked = true;
        this.lockId = node.loid;
        this.lockUser = node.loe;
        this.lockTime = new Date(Number(node.lt));
    }

    if (node.desc){  this.notes = AjxStringUtil.htmlEncode(node.desc); }
    this.subject = this.getNotes();

};

/**
 * Creates a briefcase item.
 * @class
 * This class represents a briefcase item.
 * 
 * @param {int}			id			the unique id
 * @param {ZmList}		list		a list that contains this item
 * @param {Boolean}		noCache		if <code>true</code>, do not cache this item

 * @extends		ZmBriefcaseBaseItem
 * 
 * @see		ZmBriefcase
 */
ZmBriefcaseItem = function(id, list, noCache) {

	if (arguments.length == 0) { return; }
	ZmBriefcaseBaseItem.call(this, id, list, noCache, ZmItem.BRIEFCASE_ITEM);
};

ZmBriefcaseItem.prototype = new ZmBriefcaseBaseItem;
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

ZmBriefcaseItem.getRevision =
function(itemId, version, callback, errorCallback, accountName) {
	var json = {
		ListDocumentRevisionsRequest: {
			_jsns: "urn:zimbraMail",
			doc: {
				id:	itemId,
                ver: version,   //verion=-1 for all versions of count
                count: 50       //parametrize count to allow pagination
			}
		}
	};

	var params = {
		jsonObj:		json,
		asyncMode:		Boolean(callback),
		callback:		callback,
		errorCallback:	errorCallback,
		accountName:	accountName
	};
	return appCtxt.getAppController().sendRequest(params);
};

ZmBriefcaseItem.lock =
function(itemId, callback, errorCallback, accountName) {
	var json = {
		ItemActionRequest: {
			_jsns: "urn:zimbraMail",
			action: {
				id:	itemId instanceof Array ? itemId.join() : itemId,
				op:	"lock"
			}
		}
	};

	var params = {
		jsonObj:		json,
		asyncMode:		Boolean(callback),
		callback:		callback,
		errorCallback:	errorCallback,
		accountName:	accountName
	};
	return appCtxt.getAppController().sendRequest(params);
};


ZmBriefcaseItem.unlock =
function(itemId, callback, errorCallback, accountName) {
	var json = {
		ItemActionRequest: {
			_jsns: "urn:zimbraMail",
			action: {
				id:	itemId instanceof Array ? itemId.join() : itemId,
				op:	"unlock"
			}
		}
	};

	var params = {
		jsonObj:		json,
		asyncMode:		Boolean(callback),
		callback:		callback,
		errorCallback:	errorCallback,
		accountName:	accountName
	};
	return appCtxt.getAppController().sendRequest(params);
};
	

// Mendoza line

ZmBriefcaseItem.prototype.getRevisions =
function(callback, errorCallback, accountName){
	ZmBriefcaseItem.getRevision(this.id, -1 ,callback, errorCallback, accountName);
};

ZmBriefcaseItem.prototype.lock =
function(callback, errorCallback, accountName){
	ZmBriefcaseItem.lock(this.id, callback, errorCallback, accountName);  
};


ZmBriefcaseItem.prototype.unlock =
function(callback, errorCallback, accountName){
	ZmBriefcaseItem.unlock(this.id, callback, errorCallback, accountName);
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
    if (data.t) this._parseTags(data.t);
    if (data.loid)    {
        this.locked = true;
        this.lockId = data.loid;
        this.lockUser = data.loe;
        this.lockTime = new Date(Number(data.lt));
    } else if (data.loid===""){
        //loid is not always set in response; set locked to false when value is blank
        this.locked = false;
    }

    if (data.desc)  this.notes = AjxStringUtil.htmlEncode(data.desc);
    this.subject = this.getNotes();
};

ZmBriefcaseItem.prototype.getNotes =
function(){
    return AjxMessageFormat.format(ZmMsg.revisionNotes, [this.version, (this.notes || "")]);
};

/**
 * Gets the normalized item id by splitting it from a/c id if any associated
 *
 * @return	{Int}	normalized item id
 */
ZmBriefcaseItem.prototype.getNormalizedItemId =
function(){
    if(!this.getBriefcaseFolder().isShared()){return this.id;}
    return AjxStringUtil.split(this.id,':')[1];
};

ZmBriefcaseFolderItem = function(folder) {

	ZmBriefcaseItem.call(this, folder.id, null, true);

	this.name = folder.name;
	this.folderId = folder.parent && folder.parent.id;
	this.isFolder = true;
	this.folder = folder;
    this.size = folder.sizeTotal;
    this.creator = folder.getOwner();

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

ZmBriefcaseFolderItem.prototype.getIcon =
function(baseIcon, large){
    if(baseIcon)
        return ZmBriefcaseBaseItem.prototype.getIcon.call(this, true);
    else
        return this.folder.getIconWithColor();  
};

ZmBriefcaseFolderItem.prototype.getOwner =
function(){
    return this.folder.getOwner();
};

//ZmRevisionItem
ZmRevisionItem = function(id, parentItem){
    if(arguments.length == 0) return;
    this.parent = parentItem;
    this.isRevision = true;
    this.id = id;
    ZmBriefcaseBaseItem.call(this, id, null, false, ZmItem.BRIEFCASE_REVISION_ITEM);
};

ZmRevisionItem.prototype = new ZmBriefcaseBaseItem;
ZmRevisionItem.prototype.constructor = ZmRevisionItem;

ZmRevisionItem.prototype.toString = function() {
	return "ZmRevisionItem"; 
}
ZmRevisionItem.prototype.set =
function(data){

    //Props
    //this.id =       this.id || data.id;
    this.version =  data.ver;
    if (data.name)  this.name = data.name;
    if (data.l)     this.folderId = data.l;
    if (data.ct)    this.contentType = data.ct.split(";")[0];
    if (data.s)     this.size = Number(data.s);

    //Data
    if (data.cr)    this.creator = data.cr;
    if (data.cd)    this.createDate = new Date(Number(data.cd));
    if (data.leb)   this.modifier = data.leb;
    if (data.md)    this.modifyDate = new Date(Number(data.md));
	if (data.desc)  this.notes = AjxStringUtil.htmlEncode(data.desc);

    this.subject = this.getNotes();
    this._parseTags(data.t);

};

ZmRevisionItem.prototype.getNotes =
function(){
    return ((this.notes)?AjxMessageFormat.format(ZmMsg.revisionNotes, [this.version, this.notes]):AjxMessageFormat.format(ZmMsg.revisionWithoutNotes, [this.version]));
};

ZmRevisionItem.prototype.getRestUrl =
function(){
    var restUrl = this.parent.getRestUrl();
    if(this.version){
        restUrl = restUrl + ( restUrl.match(/\?/) ? '&' : '?' ) + "ver="+this.version;
    }
    return restUrl;
};

ZmRevisionItem.prototype.getIcon =
function(){
   return null; 
};

