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
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmFolder(id, name, parent, tree, numUnread, numTotal) {

	ZmOrganizer.call(this, ZmOrganizer.FOLDER, id, name, parent, tree, numUnread, numTotal);
}

ZmFolder.prototype = new ZmOrganizer;
ZmFolder.prototype.constructor = ZmFolder;

// path separator
ZmFolder.SEP = "/";

// system folders (see Mailbox.java in ZimbraServer for positive integer constants)
ZmFolder.ID_OTHER			= -4;	// used for tcon value (see below)
ZmFolder.ID_SEARCH			= -3;	// container
ZmFolder.ID_SEP				= -2;	// separator
ZmFolder.ID_USER			= -1;	// container
ZmFolder.ID_ROOT = ZmOrganizer.ID_ROOT;
ZmFolder.ID_INBOX			= 2;
ZmFolder.ID_TRASH			= 3;
ZmFolder.ID_SPAM			= 4;
ZmFolder.ID_SENT			= 5;
ZmFolder.ID_DRAFTS			= 6;
ZmFolder.LAST_SYSTEM_ID		= 6;
ZmFolder.ID_CONTACTS 		= 7;
ZmFolder.ID_TAGS	 		= 8;
ZmFolder.ID_CALENDAR		= 10;
ZmFolder.FIRST_USER_ID		= 256;

// folder name overrides
ZmFolder.NAME = new Object();
ZmFolder.NAME[ZmFolder.ID_INBOX] = ZmMsg.inbox;
ZmFolder.NAME[ZmFolder.ID_SPAM] = ZmMsg.junk;

// name to use within the query language
ZmFolder.QUERY_NAME = new Object();
ZmFolder.QUERY_NAME[ZmFolder.ID_INBOX]		= "inbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_TRASH]		= "trash";
ZmFolder.QUERY_NAME[ZmFolder.ID_SPAM]		= "junk";
ZmFolder.QUERY_NAME[ZmFolder.ID_SENT]		= "sent";
ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS]		= "drafts";
ZmFolder.QUERY_NAME[ZmFolder.ID_CONTACTS]	= "contacts";
ZmFolder.QUERY_NAME[ZmFolder.ID_CALENDAR]	= "calendar";

// order within the overview panel
ZmFolder.SORT_ORDER = new Object();
ZmFolder.SORT_ORDER[ZmFolder.ID_USER]		= 1;
ZmFolder.SORT_ORDER[ZmFolder.ID_TAGS]		= 2;
ZmFolder.SORT_ORDER[ZmFolder.ID_SEARCH]		= 3;
ZmFolder.SORT_ORDER[ZmFolder.ID_INBOX]		= 101;
ZmFolder.SORT_ORDER[ZmFolder.ID_SENT]		= 102;
ZmFolder.SORT_ORDER[ZmFolder.ID_DRAFTS]		= 103;
ZmFolder.SORT_ORDER[ZmFolder.ID_SPAM]		= 104;
ZmFolder.SORT_ORDER[ZmFolder.ID_TRASH]		= 105;
ZmFolder.SORT_ORDER[ZmFolder.ID_SEP]		= 106;

// character codes for "tcon" attribute in conv action request, which
// controls which folders are affected
ZmFolder.TCON_CODE = new Object();
ZmFolder.TCON_CODE[ZmFolder.ID_TRASH]	= "t";
ZmFolder.TCON_CODE[ZmFolder.ID_SPAM]	= "j";
ZmFolder.TCON_CODE[ZmFolder.ID_SENT]	= "s";
ZmFolder.TCON_CODE[ZmFolder.ID_OTHER]	= "o";

// map name to ID
ZmFolder.QUERY_ID = new Object();
for (var i in ZmFolder.QUERY_NAME)
	ZmFolder.QUERY_ID[ZmFolder.QUERY_NAME[i]] = i;

ZmFolder.createFromJs =
function(parent, obj, tree, isSearch) {
	if (!obj) return;
	
	var name = ZmFolder.NAME[obj.id] ? ZmFolder.NAME[obj.id] : obj.name;
	var folder;
	if (isSearch) {
		var types = obj.types ? obj.types.split(",") : null;
		folder = new ZmSearchFolder(obj.id, obj.name, parent, tree, obj.u, obj.query, types, obj.sortBy);
	} else if (obj.id <= ZmFolder.LAST_SYSTEM_ID || obj.id >= ZmFolder.FIRST_USER_ID) {
		folder = new ZmFolder(obj.id, name, parent, tree, obj.u, obj.n);
	}
	if (!folder) return;
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var childFolder = ZmFolder.createFromJs(folder, obj.folder[i], tree, false);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}
	if (obj.search && obj.search.length) {
		for (var i = 0; i < obj.search.length; i++) {
			var childFolder = ZmFolder.createFromJs(folder, obj.search[i], tree, true);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}

	return folder;
}

/**
* Comparison function for folders. Intended for use on a list of user folders through a call to Array.sort().
*
* @param	folderA		a folder
* @param	folderB		a folder
*/
ZmFolder.sortCompare = 
function(folderA, folderB) {
	if (ZmFolder.SORT_ORDER[folderA.id] && ZmFolder.SORT_ORDER[folderB.id])
		return (ZmFolder.SORT_ORDER[folderA.id] - ZmFolder.SORT_ORDER[folderB.id]);
	if (!ZmFolder.SORT_ORDER[folderA.id] && ZmFolder.SORT_ORDER[folderB.id]) return 1;
	if (ZmFolder.SORT_ORDER[folderA.id] && !ZmFolder.SORT_ORDER[folderB.id]) return -1;
	if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) return 1;
	if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) return -1;
	return 0;
}

/**
* Checks a folder name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		a folder name
*/
ZmFolder.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
}

/**
* Checks that a folder with the given name can be created under the given parent.
* Returns an error message if the parent already has a child by the same name.
* Top-level folders and saved searches share a namespace on the server (USER_ROOT),
* so this method also checks for that case.
*
* @param name		a folder name
* @param parent		the parent folder
*/
ZmFolder.checkParent =
function(name, parent) {
	// make sure folder with this name doesn't already exist at this level
	if (parent.hasChild(name) || (parent.id < 0 && ZmFolder.QUERY_ID[name.toLowerCase()]))
		return ZmMsg.folderNameExists;

	// check for top-level folder or saved search
	var root = null;
	if (parent.id == ZmFolder.ID_USER)
		root = parent.tree.getById(ZmFolder.ID_SEARCH);
	else if (parent.id == ZmFolder.ID_SEARCH)
		root = parent.tree.getById(ZmFolder.ID_USER);
	if (root && root.hasChild(name))
		return ZmMsg.folderOrSearchNameExists;
	
	return null;
}

ZmFolder.prototype.toString = 
function() {
	return "ZmFolder";
}

ZmFolder.prototype.create =
function(name) {
	if (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_DRAFTS)
		throw new AjxException("Cannot create subfolder of Spam or Drafts");
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	var id = (this.id > 0) ? this.id : ZmFolder.ID_ROOT;
	folderNode.setAttribute("l", id);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}

// User can move a folder to Trash even if there's already a folder there with the
// same name. We find a new name for this folder and rename it before the move.
ZmFolder.prototype.move =
function(newParent) {
	var origName = this.name;
	var name = this.name;
	while (newParent.hasChild(name))
		name = name + "_";
	if (origName != name)
		this.rename(name);
	ZmOrganizer.prototype.move.call(this, newParent);
}

ZmFolder.prototype.isUnder =
function(id) {
	if (this.id == id) return true;

	var parent = this.parent;
	while (parent && parent.id != ZmFolder.ID_ROOT) {
		if (parent.id == id)
			return true;
		else
			parent = parent.parent;
	}
	return false;
}

ZmFolder.prototype.isInTrash =
function() {
	return this.isUnder(ZmFolder.ID_TRASH);
}

ZmFolder.prototype.hasSearch =
function(id) {
	if (this.type == ZmOrganizer.SEARCH)
		return true;
	
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++)
		if (a[i].hasSearch())
			return true;

	return false;
}

ZmFolder.prototype.notifyCreate =
function(obj, isSearch) {
	// ignore creates of system folders
	if (obj.id < ZmFolder.FIRST_USER_ID) return;

	var folder = ZmFolder.createFromJs(this, obj, this.tree, isSearch);
	var index = ZmOrganizer.getSortIndex(folder, ZmFolder.sortCompare);
	this.children.add(folder, index);
	this._eventNotify(ZmEvent.E_CREATE, folder);
}

ZmFolder.prototype.notifyModify =
function(obj) {
	var fields = ZmOrganizer.prototype._getCommonFields.call(this, obj);
	var parentId = obj.l;
	if (parentId == ZmFolder.ID_ROOT)
		parentId = (this.type == ZmOrganizer.FOLDER) ? ZmFolder.ID_USER : ZmFolder.ID_SEARCH;
	if ((parentId != null) && this.parent.id != parentId) {
		var newParent = this.tree.getById(parentId);
		this.reparent(newParent);
		fields[ZmOrganizer.F_PARENT] = true;
	}
	this._eventNotify(ZmEvent.E_MODIFY, this, {fields: fields});
}

ZmFolder.prototype.createQuery =
function(pathOnly) {
	var query;
	if (this.id < ZmFolder.FIRST_USER_ID) {
		query = pathOnly ? ZmFolder.QUERY_NAME[this.id] : "in:" + ZmFolder.QUERY_NAME[this.id];
		return query;
	}
	var path = this.name;
	var f = this.parent;
	while (f && f.id > ZmFolder.ID_ROOT && f.name.length) {
		path = f.name + "/" + path;
		f = f.parent;
	}
	path = '"' + path + '"';
	query = pathOnly ? path : "in:" + path;
	return query;
}

ZmFolder.prototype.dispose =
function() {
	DBG.println(AjxDebug.DBG1, "disposing: " + this.name + ", ID: " + this.id);
	var isEmptyOp = (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH);
	// make sure we're not deleting a system folder (unless we're emptying SPAM or TRASH)
	if (this.id < ZmFolder.FIRST_USER_ID && !isEmptyOp)
		return;
	
	var action = (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH) ? "empty" : "delete";
	this._organizerAction(action);

	if (isEmptyOp) {
		// emptied Trash or Spam will have no unread items
		this.numUnread = 0;
		this._eventNotify(ZmEvent.E_DELETE);
	} else {
		this.tree.deleteLocal([this]);
		this._eventNotify(ZmEvent.E_DELETE);
	}
}

ZmFolder.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	if (this.id == ZmFolder.ID_DRAFTS) {
		var name = this.name;
		if (showUnread && this.numTotal > 0) {
			name = [name, " (", this.numTotal, ")"].join("");
			if (!noMarkup)
				name = ["<b>", name, "</b>"].join("");
		}
		return name;
	} else {
		return ZmOrganizer.prototype.getName.call(this, showUnread, maxLength, noMarkup);
	}
}

/**
* Returns the full folder path as a string.
*
* @param includeUser		whether to include "My Folders" at the beginning of the path
*/
ZmFolder.prototype.getPath = 
function(includeUser) {
	var parent = this.parent;
	var path = this.getName();
	while (parent && (parent.id != ZmFolder.ID_ROOT) &&
		   ((parent.id != ZmFolder.ID_USER) || includeUser)) {
		path = parent.getName() + ZmFolder.SEP + path;
		parent = parent.parent;
	}
	
	return path;
}

/**
* Returns true if the given object(s) may be placed in this folder.
*
* If the object is a folder, check that:
* - We are not the immediate parent of the folder
* - We are not a child of the folder
* - We are not Spam or Drafts
* - We don't already have a child with the folder's name (unless we are in Trash)
* - We are not moving a regular folder into a search folder
* - We are not moving a search folder into the Folders container
* - We are not moving a folder into itself
*
* If the object is an item or a list or items, check that:
* - We are not the Folders container, or Drafts
* - We are not a search folder
* - The items aren't already in this folder
* - None of the items is a draft
*
* @param what		object(s) to possibly move into this folder
*/
ZmFolder.prototype.mayContain =
function(what) {
	var invalid = false;
	if (what instanceof ZmFolder) {
		var folder = what;
		invalid = (folder.parent == this || this.isChildOf(folder) || 
				   this.id == ZmFolder.ID_DRAFTS || this.id == ZmFolder.ID_SPAM || 
				   (!this.isInTrash() && this.hasChild(folder.name)) ||
				   (folder.type == ZmOrganizer.FOLDER && this.type == ZmOrganizer.SEARCH) ||
				   (folder.type == ZmOrganizer.SEARCH && this.id == ZmFolder.ID_USER) ||
				   (folder.id == this.id));
	} else {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
		if (this.id == ZmFolder.ID_USER || this.id == ZmFolder.ID_DRAFTS) {
			invalid = true;		// user folder can only contain folders, can't move items to Drafts
		} else if (this.type == ZmOrganizer.SEARCH) {
			invalid = true;		// can't drop items into saved searches
		} else if ((item.type == ZmItem.CONTACT) && item.isGal) {
			invalid = true;
		} else if ((item.type == ZmItem.CONV) && item.list.search && (item.list.search.folderId == this.id)) {
			invalid = true;		// convs which are a result of a search for this folder
		} else {
			invalid = false;	// make sure no drafts or contacts are being moved (other than into Trash)
			for (var i = 0; i < items.length; i++) {
				if ((items[i].isDraft || (items[i].type == ZmItem.CONTACT)) && (this.id != ZmFolder.ID_TRASH)) {
					invalid = true;
					break;
				}
			}
			if (!invalid) {		// can't move items to folder they're already in
				if (items[0].folderId) {
					invalid = true;
					for (var i = 0; i < items.length; i++) {
						if (items[i].folderId != this.id) {
							invalid = false;
							break;
						}
					}
				}
			}
		}
	}
	return !invalid;
}

/**
* Returns the folder with the given path
*
* @param path		the path to search for
*/
ZmFolder.prototype.getByPath =
function(path) {
	return this._getByPath(path.toLowerCase());
}

// Test the path of this folder and then descendants against the given path, case insensitively
ZmFolder.prototype._getByPath =
function(path) {
	if (this.id == ZmFolder.ID_TAGS) return null;

	if (path == this.getPath().toLowerCase())
		return this;
		
	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByPath(path))
			return organizer;
	}
	return null;	
}
