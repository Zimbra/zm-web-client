function LmFolder(id, name, parent, tree, numUnread, numTotal) {

	LmOrganizer.call(this, LmOrganizer.FOLDER, id, name, parent, tree, numUnread, numTotal);
}

LmFolder.prototype = new LmOrganizer;
LmFolder.prototype.constructor = LmFolder;

// path separator
LmFolder.SEP = "/";

// system folders (see Mailbox.java in LiquidArchive for positive integer constants)
LmFolder.ID_SEARCH			= -3;
LmFolder.ID_SEP				= -2;
LmFolder.ID_USER			= -1;
LmFolder.ID_ROOT = LmOrganizer.ID_ROOT;
LmFolder.ID_INBOX			= 2;
LmFolder.ID_TRASH			= 3;
LmFolder.ID_SPAM			= 4;
LmFolder.ID_SENT			= 5;
LmFolder.ID_DRAFTS			= 6;
LmFolder.LAST_SYSTEM_ID		= 6;
LmFolder.ID_CONTACTS 		= 7;
LmFolder.ID_TAGS	 		= 8;
LmFolder.ID_CALENDAR		= 10;
LmFolder.FIRST_USER_ID		= 256;

// folder name overrides
LmFolder.NAME = new Object();
LmFolder.NAME[LmFolder.ID_INBOX] = LmMsg.inbox;
LmFolder.NAME[LmFolder.ID_SPAM] = LmMsg.junk;

// name to use within the query language
LmFolder.QUERY_NAME = new Object();
LmFolder.QUERY_NAME[LmFolder.ID_INBOX]		= "inbox";
LmFolder.QUERY_NAME[LmFolder.ID_TRASH]		= "trash";
LmFolder.QUERY_NAME[LmFolder.ID_SPAM]		= "junk";
LmFolder.QUERY_NAME[LmFolder.ID_SENT]		= "sent";
LmFolder.QUERY_NAME[LmFolder.ID_DRAFTS]		= "drafts";
LmFolder.QUERY_NAME[LmFolder.ID_CONTACTS]	= "contacts";
LmFolder.QUERY_NAME[LmFolder.ID_CALENDAR]	= "calendar";

LmFolder.SORT_ORDER = new Object();
LmFolder.SORT_ORDER[LmFolder.ID_USER]		= 1;
LmFolder.SORT_ORDER[LmFolder.ID_TAGS]		= 2;
LmFolder.SORT_ORDER[LmFolder.ID_SEARCH]		= 3;
LmFolder.SORT_ORDER[LmFolder.ID_INBOX]		= 101;
LmFolder.SORT_ORDER[LmFolder.ID_SENT]		= 102;
LmFolder.SORT_ORDER[LmFolder.ID_DRAFTS]		= 103;
LmFolder.SORT_ORDER[LmFolder.ID_SPAM]		= 104;
LmFolder.SORT_ORDER[LmFolder.ID_TRASH]		= 105;
LmFolder.SORT_ORDER[LmFolder.ID_SEP]		= 106;

// map name to ID
LmFolder.QUERY_ID = new Object();
for (var i in LmFolder.QUERY_NAME)
	LmFolder.QUERY_ID[LmFolder.QUERY_NAME[i]] = i;

LmFolder.createFromJs =
function(parent, obj, tree, isSearch) {
	if (!obj) return;
	
	var name = LmFolder.NAME[obj.id] ? LmFolder.NAME[obj.id] : obj.name;
	var folder;
	if (isSearch) {
		var types = obj.types ? obj.types.split(",") : null;
		folder = new LmSearchFolder(obj.id, obj.name, parent, tree, obj.u, obj.query, types, obj.sortBy);
	} else if (obj.id <= LmFolder.LAST_SYSTEM_ID || obj.id >= LmFolder.FIRST_USER_ID) {
		folder = new LmFolder(obj.id, name, parent, tree, obj.u, obj.n);
	}
	if (!folder) return;
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var childFolder = LmFolder.createFromJs(folder, obj.folder[i], tree, false);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}
	if (obj.search && obj.search.length) {
		for (var i = 0; i < obj.search.length; i++) {
			var childFolder = LmFolder.createFromJs(folder, obj.search[i], tree, true);
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
LmFolder.sortCompare = 
function(folderA, folderB) {
	if (LmFolder.SORT_ORDER[folderA.id] && LmFolder.SORT_ORDER[folderB.id])
		return (LmFolder.SORT_ORDER[folderA.id] - LmFolder.SORT_ORDER[folderB.id]);
	if (!LmFolder.SORT_ORDER[folderA.id] && LmFolder.SORT_ORDER[folderB.id]) return 1;
	if (LmFolder.SORT_ORDER[folderA.id] && !LmFolder.SORT_ORDER[folderB.id]) return -1;
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
LmFolder.checkName =
function(name) {
	return LmOrganizer.checkName(name);
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
LmFolder.checkParent =
function(name, parent) {
	// make sure folder with this name doesn't already exist at this level
	if (parent.hasChild(name) || (parent.id < 0 && LmFolder.QUERY_ID[name.toLowerCase()]))
		return LmMsg.folderNameExists;

	// check for top-level folder or saved search
	var root = null;
	if (parent.id == LmFolder.ID_USER)
		root = parent.tree.getById(LmFolder.ID_SEARCH);
	else if (parent.id == LmFolder.ID_SEARCH)
		root = parent.tree.getById(LmFolder.ID_USER);
	if (root && root.hasChild(name))
		return LmMsg.folderOrSearchNameExists;
	
	return null;
}

LmFolder.prototype.toString = 
function() {
	return "LmFolder";
}

LmFolder.prototype.create =
function(name) {
	if (this.id == LmFolder.ID_SPAM || this.id == LmFolder.ID_DRAFTS)
		throw new LsException("Cannot create subfolder of Spam or Drafts");
	var soapDoc = LsSoapDoc.create("CreateFolderRequest", "urn:liquidMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	var id = (this.id > 0) ? this.id : LmFolder.ID_ROOT;
	folderNode.setAttribute("l", id);
	var resp = this.tree._appCtxt.getAppController().sendRequest(soapDoc).firstChild;
}

// User can move a folder to Trash even if there's already a folder there with the
// same name. We find a new name for this folder and rename it before the move.
LmFolder.prototype.move =
function(newParent) {
	var origName = this.name;
	var name = this.name;
	while (newParent.hasChild(name))
		name = name + "_";
	if (origName != name)
		this.rename(name);
	LmOrganizer.prototype.move.call(this, newParent);
}

LmFolder.prototype.isInTrash =
function() {
	if (this.id == LmFolder.ID_TRASH)
		return true;

	var parent = this.parent;
	while (parent && parent.id != LmFolder.ID_ROOT) {
		if (parent.id == LmFolder.ID_TRASH)
			return true;
		else
			parent = parent.parent;
	}
	return false;
}

LmFolder.prototype.hasSearch =
function(id) {
	if (this.type == LmOrganizer.SEARCH)
		return true;
	
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++)
		if (a[i].hasSearch())
			return true;

	return false;
}

LmFolder.prototype.notifyCreate =
function(obj, isSearch) {
	// ignore creates of system folders
	if (obj.id < LmFolder.FIRST_USER_ID) return;

	var folder = LmFolder.createFromJs(this, obj, this.tree, isSearch);
	var index = LmOrganizer.getSortIndex(folder, LmFolder.sortCompare);
	this.children.add(folder, index);
	this._eventNotify(LmEvent.E_CREATE, folder);
}

LmFolder.prototype.notifyModify =
function(obj) {
	var fields = LmOrganizer.prototype._getCommonFields.call(this, obj);
	var parentId = obj.l;
	if (parentId == LmFolder.ID_ROOT)
		parentId = (this.type == LmOrganizer.FOLDER) ? LmFolder.ID_USER : LmFolder.ID_SEARCH;
	if ((parentId != null) && this.parent.id != parentId) {
		var newParent = this.tree.getById(parentId);
		this.reparent(newParent);
		fields[LmOrganizer.F_PARENT] = true;
	}
	this._eventNotify(LmEvent.E_MODIFY, this, {fields: fields});
}

LmFolder.prototype.createQuery =
function(pathOnly) {
	var query;
	if (this.id < LmFolder.FIRST_USER_ID) {
		query = pathOnly ? LmFolder.QUERY_NAME[this.id] : "in:" + LmFolder.QUERY_NAME[this.id];
		return query;
	}
	var path = this.name;
	var f = this.parent;
	while (f && f.id > LmFolder.ID_ROOT && f.name.length) {
		path = f.name + "/" + path;
		f = f.parent;
	}
	path = '"' + path + '"';
	query = pathOnly ? path : "in:" + path;
	return query;
}

LmFolder.prototype.dispose =
function() {
	DBG.println(LsDebug.DBG1, "disposing: " + this.name + ", ID: " + this.id);
	var isEmptyOp = (this.id == LmFolder.ID_SPAM || this.id == LmFolder.ID_TRASH);
	// make sure we're not deleting a system folder (unless we're emptying SPAM or TRASH)
	if (this.id < LmFolder.FIRST_USER_ID && !isEmptyOp)
		return;
	
	var action = (this.id == LmFolder.ID_SPAM || this.id == LmFolder.ID_TRASH) ? "empty" : "delete";
	this._organizerAction(action);

	if (isEmptyOp) {
		// emptied Trash or Spam will have no unread items
		this.numUnread = 0;
		this._eventNotify(LmEvent.E_DELETE);
	} else {
		this.tree.deleteLocal([this]);
		this._eventNotify(LmEvent.E_DELETE);
	}
}

LmFolder.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	if (this.id == LmFolder.ID_DRAFTS) {
		var name = this.name;
		if (showUnread && this.numTotal > 0) {
			name = [name, " (", this.numTotal, ")"].join("");
			if (!noMarkup)
				name = ["<b>", name, "</b>"].join("");
		}
		return name;
	} else {
		return LmOrganizer.prototype.getName.call(this, showUnread, maxLength, noMarkup);
	}
}

/**
* Returns the full folder path as a string.
*
* @param includeUser		whether to include "My Folders" at the beginning of the path
*/
LmFolder.prototype.getPath = 
function(includeUser) {
	var parent = this.parent;
	var path = this.getName();
	while (parent && (parent.id != LmFolder.ID_ROOT) &&
		   ((parent.id != LmFolder.ID_USER) || includeUser)) {
		path = parent.getName() + LmFolder.SEP + path;
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
LmFolder.prototype.mayContain =
function(what) {
	var invalid = false;
	if (what instanceof LmFolder) {
		var folder = what;
		invalid = (folder.parent == this || this.isChildOf(folder) || 
				   this.id == LmFolder.ID_DRAFTS || this.id == LmFolder.ID_SPAM || 
				   (!this.isInTrash() && this.hasChild(folder.name)) ||
				   (folder.type == LmOrganizer.FOLDER && this.type == LmOrganizer.SEARCH) ||
				   (folder.type == LmOrganizer.SEARCH && this.id == LmFolder.ID_USER) ||
				   (folder.id == this.id));
	} else {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
		if (this.id == LmFolder.ID_USER || this.id == LmFolder.ID_DRAFTS) {
			invalid = true;		// user folder can only contain folders, can't move items to Drafts
		} else if (this.type == LmOrganizer.SEARCH) {
			invalid = true;		// can't drop items into saved searches
		} else if ((item instanceof LmConv) && item.list.search && (item.list.search.folderId == this.id)) {
			invalid = true;		// convs which are a result of a search for this folder
		} else {
			invalid = false;	// make sure no drafts or contacts are being moved
			for (var i = 0; i < items.length; i++) {
				if (items[i].isDraft || (items[i] instanceof LmContact && this.id != LmFolder.ID_TRASH)) {
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
LmFolder.prototype.getByPath =
function(path) {
	return this._getByPath(path.toLowerCase());
}

// Test the path of this folder and then descendants against the given path, case insensitively
LmFolder.prototype._getByPath =
function(path) {
	if (this.id == LmFolder.ID_TAGS) return null;

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
