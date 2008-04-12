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
ZmBriefcase = function(params) {
	params.type = ZmOrganizer.BRIEFCASE;
	ZmOrganizer.call(this, params);
}

ZmBriefcase.prototype = new ZmOrganizer;
ZmBriefcase.prototype.constructor = ZmBriefcase;

// Constants

ZmBriefcase.PAGE_INDEX = "_Index";
ZmBriefcase.PAGE_CHROME = "_Template";
ZmBriefcase.PAGE_CHROME_STYLES = "_TemplateStyles";
ZmBriefcase.PAGE_TITLE_BAR = "_TitleBar";
ZmBriefcase.PAGE_HEADER = "_Header";
ZmBriefcase.PAGE_FOOTER = "_Footer";
ZmBriefcase.PAGE_SIDE_BAR = "_SideBar";
ZmBriefcase.PAGE_TOC_BODY_TEMPLATE = "_TocBodyTemplate";
ZmBriefcase.PAGE_TOC_ITEM_TEMPLATE = "_TocItemTemplate";
ZmBriefcase.PATH_BODY_TEMPLATE = "_PathBodyTemplate";
ZmBriefcase.PATH_ITEM_TEMPLATE = "_PathItemTemplate";
ZmBriefcase.PATH_SEPARATOR = "_PathSeparator";

// Public methods

ZmBriefcase.prototype.toString = 
function() {
	return "ZmBriefcase";
};

ZmBriefcase.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)	{ return null; }
	if (this.link)							{ return "SharedMailFolder"; }
	return "Folder";
};

ZmBriefcase.prototype.getSearchPath = function() {
	var serverName = "Briefcase";
	var clientName = ZmMsg.notebookPersonalName;
	
	var path = ZmOrganizer.prototype.getSearchPath.call(this);
	if (path.match(new RegExp("^"+clientName+"(/)?"))) {
		path = serverName + path.substring(clientName.length);
	}
	
	return path;
};

// Callbacks

ZmBriefcase.prototype.notifyCreate =
function(obj) {
	var briefcase = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(briefcase, ZmBriefcase.sortCompare);
	this.children.add(briefcase, index);
	briefcase._notify(ZmEvent.E_CREATE);
};

ZmBriefcase.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = new Object();
	if (obj.name != null && this.name != obj.name && !obj._isRemote) {
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		doNotify = true;
	} else if (obj.color != null && this.color != obj.color && !obj._isRemote) {
		this.color = obj.color;
		fields[ZmOrganizer.F_COLOR] = true;
		doNotify = true;
	}
	
	if (doNotify) {
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
	}
};

// Static methods

ZmBriefcase.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmBriefcase.sortCompare = 
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

ZmBriefcase.prototype.mayContain =
function(what) {
	if (!what) return true;

	var invalid = false;

	if (this.id == ZmFolder.ID_ROOT) {
		// cannot drag anything onto root folder
		invalid = true;
	} else if (this.link) {
		// cannot drop anything onto a read-only task folder
		invalid = this.isReadOnly();
	}

	if (!invalid) {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
	
		if ((item.type != ZmItem.BRIEFCASE) && (item.type != ZmItem.DOCUMENT)) {
			// only tasks are valid for task folders
			invalid = true;
		} else {
			
			// can't move items to folder they're already in; we're okay if
			// we have one item from another folder
			if (!invalid && item.folderId) {
				invalid = true;
				for (var i = 0; i < items.length; i++) {
					var tree = appCtxt.getById(items[i].folderId);
					if (tree != this) {
						invalid = false;
						break;
					}
				}
			}
		}
		//attachments from mail can be moved inside briefcase
		if(item && item.msgId && item.partId){
			invalid = false;
		}
	}

	return !invalid;
};
