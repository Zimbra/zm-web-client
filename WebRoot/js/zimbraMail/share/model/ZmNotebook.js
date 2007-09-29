/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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
* @param owner		[string]		The owner of this organizer
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
function ZmNotebook(id, name, parent, tree, color, owner, zid, rid, restUrl) {
	ZmOrganizer.call(this, ZmOrganizer.NOTEBOOK, id, name, parent, tree, null, null, null, owner, zid, rid, restUrl);
	this.color = color || ZmOrganizer.DEFAULT_COLOR;
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

ZmNotebook.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = this.id == ZmOrganizer.ID_ROOT ? ZmMsg.notebooks : this.name;
	return this._markupName(name, showUnread, noMarkup);
};

ZmNotebook.prototype.getIcon = 
function() {
	if (this.id == ZmOrganizer.ID_ROOT) return null;
	if (this.parent.id == ZmOrganizer.ID_ROOT) {
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
	var notebook = ZmNotebook.createFromJs(this, obj, this.tree);
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
	var attrs = { color: color || ZmOrganizer.DEFAULT_COLOR };
	var callback = new AjxCallback(this, this._handleCreate);
	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [name]);
	return ZmOrganizer.prototype.create.call(this, name, attrs, callback, errorCallback);
};

ZmNotebook.prototype._handleCreate = function() {}
ZmNotebook.prototype._handleErrorCreate =
function(name, ex) {
	if (!name) return false;
	
	var msgDialog = this.tree._appCtxt.getMsgDialog();
	var msg;
	if (name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
	}
	if (msg) {
		msgDialog.reset();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
	}

	return true;
};

// Static methods

ZmNotebook.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var notebook = new ZmNotebook(obj.id, obj.name, parent, tree, obj.color, obj.owner, obj.zid, obj.rid, obj.rest);
	if (obj.perm != null) {
		notebook.setPermissions(obj.perm); // REVISIT: bug 10801
	}
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				var childNotebook = ZmNotebook.createFromJs(notebook, folder, tree);
				notebook.children.add(childNotebook);
			}
		}
	}
	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {
				var childNotebook = ZmNotebook.createFromJs(notebook, link, tree);
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
