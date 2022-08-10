/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
	if (this.nId == ZmOrganizer.ID_FILE_SHARED_WITH_ME)	{ return "SharedContact"; }
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
function(what, targetFolderType) {

    if (!what) return true;

	var invalid = false;
    targetFolderType = targetFolderType || this.type;

    if (what instanceof ZmFolder) { //ZmBriefcase
         invalid =(
                    what.parent == this || this.isChildOf(what)
                 || targetFolderType == ZmOrganizer.SEARCH || targetFolderType == ZmOrganizer.TAG
                 || (!this.isInTrash() && this.hasChild(what.name))
                 || (what.id == this.id)
                 || (this.isRemote() && !this._remoteMoveOk(what))
                 || (what.isRemote() && !this._remoteMoveOk(what))
                 ||  this.disallowSubFolder
                 );
    } else { //ZmBriefcaseItem
        var items = AjxUtil.toArray(what);
		var item = items[0];
        if (item.type == ZmItem.BRIEFCASE_ITEM) {
            invalid = this._checkInvalidFolderItems(items);

            if (!invalid) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i] instanceof ZmBriefcaseFolderItem && (items[i].id == this.id ||             // Can't move folder items to themselves
                    		this.isChildOf(items[i].folder))) { // Can't move parent folder to child folder
                        invalid = true;
                        break;
                    }
                }
            }
            
            
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
        } else {
            invalid = true;
        }
        
        // attachments from mail can be moved inside briefcase
		if (item && item.msgId && item.partId) {
			invalid = false;
		}

    }

    if (!invalid && this.link) {
        invalid = this.isReadOnly();
    }	

	return !invalid;
};

ZmBriefcase.prototype._checkInvalidFolderItems =
function(items, targetFolderType) {
  var invalid = false;
  for (var i=0; i<items.length && !invalid; i++) {
    if (items[i] instanceof ZmBriefcaseFolderItem) {
        var item = items[i];
        invalid = (
           item.parent == this || this.isChildOf(item)
        || targetFolderType == ZmOrganizer.SEARCH || targetFolderType == ZmOrganizer.TAG
        || (!this.isInTrash() && this.hasChild(item.name))
        || (item.id == this.id)
        || (item.folder && item.folder.isRemote() && !this.isRemote() && !item.folder.rid)
        || (item.folder && this.isRemote())
        );
    }
  }
    return invalid;
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

	var searchPath =  this.getSearchPath(true);
	var generatedRestURL = [loc.protocol, "//", host, "/service/user/", uname, "/", AjxStringUtil.urlEncode(searchPath)].join("");
	var restUrl = this.restUrl;
	var oname = this.oname;
	var parent = this.parent;
	//Get the restUrl and oname from remote share
	while (parent) {
		if (parent.restUrl) {
			restUrl = parent.restUrl;
		}
		if (parent.oname) {
			oname = parent.oname;
		}
		parent = parent.parent;
	}

	if (restUrl) {
		var index = searchPath.indexOf(oname);  //remove oname from searchPath
		if (index != -1) {
			searchPath = searchPath.substring(index + oname.length);
		}
		generatedRestURL = restUrl +  AjxStringUtil.urlEncode(searchPath);
	}
	return generatedRestURL;
};
