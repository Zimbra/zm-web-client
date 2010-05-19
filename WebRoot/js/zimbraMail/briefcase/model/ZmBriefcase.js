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
 * This file contains the briefcase class.
 */

/**
 * Creates the briefcase 
 * @class
 * This class represents a briefcase. A briefcase contains briefcase items.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param {int}	params.id			the numeric ID
 * @param {String}	params.name		the name
 * @param {ZmOrganizer}	params.parent		the parent organizer
 * @param {ZmTree}	params.tree		the tree model that contains this organizer
 * @param {constant}	params.color	the color for this briefcase
 * @param {String}	params.owner		the owner of this organizer
 * @param {String}	params.oname		the owner's name for this organizer
 * @param {String}	[params.zid]		the Zimbra id of owner, if remote share
 * @param {String}	[params.rid]		the Remote id of organizer, if remote share
 * @param {String}	[params.restUrl]	the REST URL of this organizer.
 * 
 * @extends		ZmFolder
 */
ZmBriefcase = function(params) {
	params.type = ZmOrganizer.BRIEFCASE;
	ZmFolder.call(this, params);
}

ZmBriefcase.prototype = new ZmFolder;
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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
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

ZmBriefcase.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = {};
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

/**
* Checks the briefcase name for validity. Returns an error message if the
* name is invalid and null if the name is valid.
*
* @param {String}		name		a briefcase name
* @return	{String}	the name
*/
ZmBriefcase.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

/**
 * Comparison function for briefcases.
 *
 * @param {ZmBriefcase}	nbA		an item
 * @param {ZmBriefcase}	nbB		an item
 * @return	{int} 0 if the items match
 */
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

/**
 * Returns true if the given object(s) may be placed in this folder.
 *
 * If the object is a folder, check that:
 * <ul>
 * <li>We are not the immediate parent of the folder</li>
 * <li>We are not a child of the folder</li>
 * <li>We are not Spam or Drafts</li>
 * <li>We don't already have a child with the folder's name (unless we are in Trash)</li>
 * <li>We are not moving a regular folder into a search folder</li>
 * <li>We are not moving a search folder into the Folders container</li>
 * <li>We are not moving a folder into itself</li>
 * </ul>
 *
 * If the object is an item or a list or items, check that:
 * <ul>
 * <li>We are not the Folders container</li>
 * <li>We are not a search folder</li>
 * <li>The items aren't already in this folder</li>
 * <li>A contact can only be moved to Trash</li>
 * <li>A draft can be moved to Trash or Drafts</li>
 * <li>Non-drafts cannot be moved to Drafts</li>
 * </ul>
 *
 * @param {Object}	what		the object(s) to possibly move into this briefcase (item or organizer)
 */
ZmBriefcase.prototype.mayContain =
function(what) {
	if (!what) return true;

	var invalid = false;

	if (this.id == ZmFolder.ID_ROOT) {
		// cannot drag anything onto root folder
		invalid = true;
	} else if (this.link) {
		// cannot drop anything onto a read-only folder
		invalid = this.isReadOnly();
	}

	if (!invalid) {
		// An item or an array of items is being moved
		var items = AjxUtil.toArray(what);
		var item = items[0];
	
		if (item.type != ZmItem.BRIEFCASE_ITEM) {
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
		// attachments from mail can be moved inside briefcase
		if(item && item.msgId && item.partId){
			invalid = false;
		}
	}

	return !invalid;
};

ZmBriefcase.prototype.supportsPublicAccess =
function() {
	return true;
};

ZmBriefcase.prototype.isShared =
function(){
    return this.link ? true : false;  
};

ZmBriefcase.prototype._generateRestUrl =
function() {
	var loc = document.location;
	var uname = this.getOwner();
	var host = loc.host;
	var m = uname.match(/^(.*)@(.*)$/);

	host = (m && m[2]) || host;

	// REVISIT: What about port? For now assume other host uses same port
	if (loc.port && loc.port != 80) {
		host = host + ":" + loc.port;
	}

	return [
		loc.protocol, "//", host, "/service/user/", uname, "/",
		AjxStringUtil.urlEncode(this.getSearchPath(true))
	].join("");
};
