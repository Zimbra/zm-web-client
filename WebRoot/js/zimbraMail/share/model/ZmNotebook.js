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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
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
* @param link
* @param owner
*/
function ZmNotebook(id, name, parent, tree, color, link, owner) {
	ZmOrganizer.call(this, ZmOrganizer.NOTEBOOK, id, name, parent, tree, null, null, null, owner);
	this.color = color || ZmOrganizer.DEFAULT_COLOR;
	this.link = link;
}

ZmNotebook.prototype = new ZmOrganizer;
ZmNotebook.prototype.constructor = ZmNotebook;

// Constants

ZmNotebook.PAGE_INDEX = "_INDEX_";
ZmNotebook.PAGE_CHROME = "_CHROME_";

// Public methods

ZmNotebook.prototype.toString = 
function() {
	return "ZmNotebook";
};

ZmNotebook.prototype.getName = 
function() {
	return this.id == ZmOrganizer.ID_ROOT ? ZmMsg.notebooks : this.name;
};

ZmNotebook.prototype.getIcon = 
function() {
	if (this.id == ZmOrganizer.ID_ROOT) return null;
	return this.parent.id == ZmOrganizer.ID_ROOT ? "Notebook" : "Section";
};

ZmNotebook.prototype.getSearchPath = function() {
	var serverName = "Notebook";
	var clientName = ZmMsg.notebook;
	
	var path = ZmOrganizer.prototype.getSearchPath.call(this);
	if (path.match(new RegExp("^"+clientName+"(/)?"))) {
		path = serverName + path.substring(clientName.length);
	}
	
	return path;
};

// Callbacks

ZmNotebook.prototype.notifyCreate =
function(obj, link) {
	var notebook = ZmNotebook.createFromJs(this, obj, this.tree, link);
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

/** Caller is responsible to catch exception. */
ZmNotebook.prototype.create =
function(name, color) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	folderNode.setAttribute("l", this.id);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]);

	var callback = color ? new AjxCallback(this, this._createResponse, [color]) : null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: callback,
		errorCallback: null
	};

	var appController = this.tree._appCtxt.getAppController();
	return appController.sendRequest(params);
};

// Protected methods

ZmNotebook.prototype._createResponse = function(color, response) {
	if (!response._data && !response._data.CreateFolderResponse) {
		// TODO
		throw "error response!";
	}
	var folder = response._data.CreateFolderResponse.folder[0];
	
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("id", folder.id);
	actionNode.setAttribute("op", "color");
	actionNode.setAttribute("color", color);
	
	var callback = null;
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: callback,
		errorCallback: null
	};

	var appController = this.tree._appCtxt.getAppController();
	return appController.sendRequest(params);
};

// Static methods

/** Caller is responsible to catch exception. */
/***
ZmNotebook.create =
function(appCtxt, name, parentFolderId) {
	parentFolderId = parentFolderId || ZmOrganizer.ID_ROOT;

	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	folderNode.setAttribute("l", parentFolderId);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]);

	var appController = appCtxt.getAppController();
	return appController.sendRequest({soapDoc: soapDoc, asyncMode: false});
};
/***/

ZmNotebook.createFromJs =
function(parent, obj, tree, link) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var notebook = new ZmNotebook(obj.id, obj.name, parent, tree, obj.color, link, obj.d);
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				var childNotebook = ZmNotebook.createFromJs(notebook, folder, tree, false);
				notebook.children.add(childNotebook);
			}
		}
	}
	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				var childNotebook = ZmNotebook.createFromJs(notebook, link, tree, true);
				notebook.children.add(childNotebook);
			}
		}
	}
	
	// set shares
	notebook._setSharesFromJs(obj);
	
	return notebook;
};

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
	if (nbAName < nbBName) return -1;
	if (nbAName > nbBName) return 1;
	return 0;
};
