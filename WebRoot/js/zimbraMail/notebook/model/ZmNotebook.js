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

/**
* 
* @constructor
* @class
*
* @author Andy Clark
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color		[constant]		color for this notebook
* @param owner		[string]		The owner of this organizer
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
ZmNotebook = function(params) {
	params.type = ZmOrganizer.NOTEBOOK;
	ZmOrganizer.call(this, params);
}

ZmNotebook.prototype = new ZmOrganizer;
ZmNotebook.prototype.constructor = ZmNotebook;

// Constants

ZmNotebook.PAGE_INDEX = "_Index";
ZmNotebook.PAGE_CHROME = "_Template";
ZmNotebook.PAGE_CHROME_STYLES = "_TemplateStyles";
ZmNotebook.PAGE_TITLE_BAR = "_TitleBar";
ZmNotebook.PAGE_HEADER = "_Header";
ZmNotebook.PAGE_FOOTER = "_Footer";
ZmNotebook.PAGE_SIDE_BAR = "_SideBar";
ZmNotebook.PAGE_TOC_BODY_TEMPLATE = "_TocBodyTemplate";
ZmNotebook.PAGE_TOC_ITEM_TEMPLATE = "_TocItemTemplate";
ZmNotebook.PATH_BODY_TEMPLATE = "_PathBodyTemplate";
ZmNotebook.PATH_ITEM_TEMPLATE = "_PathItemTemplate";
ZmNotebook.PATH_SEPARATOR = "_PathSeparator";

// Public methods

ZmNotebook.prototype.toString = 
function() {
	return "ZmNotebook";
};

ZmNotebook.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT) { return null; }
	if (this.parent.nId == ZmOrganizer.ID_ROOT) {
		return this.link ? "SharedNotebook" : "Notebook";
	}
	return this.link ? "SharedSection" : "Section";
};

ZmNotebook.prototype.getSearchPath = function() {
	var serverName = "Notebook";
	var clientName = ZmMsg.notebookPersonalName;
	
	var path = ZmOrganizer.prototype.getSearchPath.call(this);
	if (path.match(new RegExp("^"+clientName+"(/)?"))) {
		path = serverName + path.substring(clientName.length);
	}
	
	return path;
};

// Callbacks

ZmNotebook.prototype.notifyCreate =
function(obj) {
	var notebook = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(notebook, ZmNotebook.sortCompare);
	this.children.add(notebook, index);
	notebook._notify(ZmEvent.E_CREATE);
};

ZmNotebook.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = new Object();
	if (obj.name != null && this.name != obj.name) {
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		doNotify = true;
	}
	else if (obj.color != null && this.color != obj.color) {
		this.color = obj.color;
		fields[ZmOrganizer.F_COLOR] = true;
		doNotify = true;
	}
	
	if (doNotify)
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
};

// Static methods

ZmNotebook.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmNotebook.sortCompare = 
function(nbA, nbB) {
	var check = ZmOrganizer.checkSortArgs(nbA, nbB);
	if (check != null) return check;

	// links appear after personal calendars
	if (nbA.link != nbB.link) {
		return nbA.link ? 1 : -1;
	}
	
	// sort by calendar name
	var nbAName = nbA.name.toLowerCase();
	var nbBName = nbB.name.toLowerCase();
	return	AjxStringUtil.natCompare(nbAName,nbBName);
};

ZmNotebook.prototype._delete =
function() {
	DBG.println(AjxDebug.DBG1, "deleting: " + this.name + ", ID: " + this.id);
	var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK) &&
					 (this.nId == ZmFolder.ID_SPAM || this.nId == ZmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.isSystem() && !isEmptyOp) return;

	var action = isEmptyOp ? "empty" : "delete";
	var delCallback = new AjxCallback(this,this.deleteCallback);
	this._organizerAction({action: action,callback:delCallback});
};

ZmNotebook.prototype.deleteCallback = 
function(){
	if(this._isRemote){
	var app = appCtxt.getApp(ZmApp.NOTEBOOK);
	app.deleteNotify([this.id]);
	}
};

ZmNotebook.prototype.rename =
function(name, callback, errorCallback, batchCmd) {
	var newCallback  = new AjxCallback(this,this.renameCallback,[callback, name]);
	ZmOrganizer.prototype.rename.call(this, name, newCallback, errorCallback, batchCmd);
};

ZmNotebook.prototype.renameCallback =
function(callback, name, response) {
	var responseObj = (response && response.getResponse())?  response.getResponse() : null;
	var action = (responseObj && responseObj.FolderActionResponse) ? responseObj.FolderActionResponse.action : null;
	var id  = action ? action.id : "";
	var op  = action ? action.op : "";
	var isRemote = 	/:/.test(id);
	if(op == "rename" && isRemote){
		var cache = AjxDispatcher.run("GetNotebookCache");
		var item = cache.getItemInfo({id:id},true);
        cache.putItem(item);
		var obj = new Object();
		obj.name = name;
		obj.id = item.id;
		obj.rest = item.getRestUrl();
		this._updated = true;
		this.notifyModify(obj);
	}
	callback.run(response);
};