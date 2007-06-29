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

ZmNotebook.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = (this.nId == ZmOrganizer.ID_ROOT) ? ZmMsg.notebooks : this.name;
	return this._markupName(name, showUnread, noMarkup);
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
	return	AjxStringUtil.natCompare(nbAName,nbBName);};
