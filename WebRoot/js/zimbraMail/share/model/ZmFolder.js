/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
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
* Creates a folder.
* @constructor
* @class
* This class represents a folder, which may contain mail. At some point, folders may be
* able to contain contacts and/or appointments.
*
* @author Conrad Damon
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent folder
* @param tree		[ZmTree]		tree model that contains this folder
* @param numUnread	[int]*			number of unread items for this folder
* @param numTotal	[int]*			number of items for this folder
* @param url		[string]*		URL for this folder's feed
* @param owner		[string]* 		Owner for this organizer
* @param zid		[string]*		Zimbra ID of owner, if remote folder
* @param rid		[string]*		Remote ID of organizer, if remote folder
* @param restUrl	[string]*		The REST URL of this organizer.
*/
function ZmFolder(id, name, parent, tree, numUnread, numTotal, url, owner, zid, rid, restUrl) {
	ZmOrganizer.call(this, ZmOrganizer.FOLDER, id, name, parent, tree, numUnread, numTotal, url, owner, zid, rid, restUrl);
};

ZmFolder.prototype = new ZmOrganizer;
ZmFolder.prototype.constructor = ZmFolder;

// path separator
ZmFolder.SEP = "/";

// system folders (see Mailbox.java in ZimbraServer for positive integer constants)
ZmFolder.ID_OTHER			= -2;	// used for tcon value (see below)
ZmFolder.ID_SEP				= -1;	// separator
ZmFolder.ID_ROOT			= ZmOrganizer.ID_ROOT;
ZmFolder.ID_INBOX			= ZmOrganizer.ID_INBOX;
ZmFolder.ID_TRASH			= ZmOrganizer.ID_TRASH;
ZmFolder.ID_SPAM			= ZmOrganizer.ID_SPAM;
ZmFolder.ID_SENT			= 5;
ZmFolder.ID_DRAFTS			= 6;
ZmFolder.ID_CONTACTS		= ZmOrganizer.ID_ADDRBOOK;
ZmFolder.ID_AUTO_ADDED		= ZmOrganizer.ID_AUTO_ADDED;
ZmFolder.LAST_SYSTEM_ID		= 6;
ZmFolder.ID_TAGS	 		= 8;
ZmFolder.ID_OUTBOX	 		= ZmOrganizer.ID_OUTBOX;

// system folder names
ZmFolder.MSG_KEY = new Object();
ZmFolder.MSG_KEY[ZmFolder.ID_INBOX]			= "inbox";
ZmFolder.MSG_KEY[ZmFolder.ID_TRASH]			= "trash";
ZmFolder.MSG_KEY[ZmFolder.ID_SPAM]			= "junk";
ZmFolder.MSG_KEY[ZmFolder.ID_SENT]			= "sent";
ZmFolder.MSG_KEY[ZmFolder.ID_DRAFTS]		= "drafts";
ZmFolder.MSG_KEY[ZmFolder.ID_CONTACTS]		= "contacts";
ZmFolder.MSG_KEY[ZmFolder.ID_AUTO_ADDED]	= "emailedContacts";
ZmFolder.MSG_KEY[ZmFolder.ID_TAGS]			= "tags";
ZmFolder.MSG_KEY[ZmOrganizer.ID_CALENDAR]	= "calendar";
ZmFolder.MSG_KEY[ZmOrganizer.ID_NOTEBOOK]	= "notebook";

// system folder icons
ZmFolder.IMAGE = new Object();
ZmFolder.IMAGE[ZmFolder.ID_INBOX]		= "Inbox";
ZmFolder.IMAGE[ZmFolder.ID_TRASH]		= "Trash";
ZmFolder.IMAGE[ZmFolder.ID_SPAM]		= "SpamFolder";
ZmFolder.IMAGE[ZmFolder.ID_SENT]		= "SentFolder";
ZmFolder.IMAGE[ZmFolder.ID_OUTBOX]		= "Outbox";
ZmFolder.IMAGE[ZmFolder.ID_DRAFTS]		= "DraftFolder";

// name to use within the query language
ZmFolder.QUERY_NAME = new Object();
ZmFolder.QUERY_NAME[ZmFolder.ID_INBOX]		= "inbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_TRASH]		= "trash";
ZmFolder.QUERY_NAME[ZmFolder.ID_SPAM]		= "junk";
ZmFolder.QUERY_NAME[ZmFolder.ID_SENT]		= "sent";
ZmFolder.QUERY_NAME[ZmFolder.ID_OUTBOX]		= "outbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS]		= "drafts";
ZmFolder.QUERY_NAME[ZmFolder.ID_CONTACTS]	= "contacts";
ZmFolder.QUERY_NAME[ZmFolder.ID_AUTO_ADDED] = "\"Emailed Contacts\"";
ZmFolder.QUERY_NAME[ZmOrganizer.ID_NOTEBOOK] = "notebook";

// order within the overview panel
ZmFolder.SORT_ORDER = new Object();
ZmFolder.SORT_ORDER[ZmFolder.ID_INBOX]		= 1;
ZmFolder.SORT_ORDER[ZmFolder.ID_SENT]		= 2;
ZmFolder.SORT_ORDER[ZmFolder.ID_DRAFTS]		= 3;
ZmFolder.SORT_ORDER[ZmFolder.ID_SPAM]		= 4;
ZmFolder.SORT_ORDER[ZmFolder.ID_TRASH]		= 5;
ZmFolder.SORT_ORDER[ZmFolder.ID_OUTBOX]		= 6;
ZmFolder.SORT_ORDER[ZmFolder.ID_SEP]		= 7;

// character codes for "tcon" attribute in conv action request, which
// controls which folders are affected
ZmFolder.TCON_CODE = new Object();
ZmFolder.TCON_CODE[ZmFolder.ID_TRASH]	= "t";
ZmFolder.TCON_CODE[ZmFolder.ID_SPAM]	= "j";
ZmFolder.TCON_CODE[ZmFolder.ID_SENT]	= "s";
ZmFolder.TCON_CODE[ZmFolder.ID_OTHER]	= "o";

// Hide folders migrated from Outlook mailbox
ZmFolder.HIDE = {};
ZmFolder.HIDE["Journal"]	= true;
ZmFolder.HIDE["Notes"]		= true;
//ZmFolder.HIDE["Outbox"]		= true;
ZmFolder.HIDE["Tasks"]		= true;

// The extra-special, visible but untouchable outlook folder
ZmFolder.SYNC_ISSUES = "Sync Issues";

// map name to ID
ZmFolder.QUERY_ID = new Object();
for (var i in ZmFolder.QUERY_NAME)
	ZmFolder.QUERY_ID[ZmFolder.QUERY_NAME[i]] = i;

ZmFolder.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;

	// check ID - can't be lower than root, or in tag range
    // Allow Outbox ID... breaks some assumptions :(
    if (obj.id != ZmFolder.ID_OUTBOX && (obj.id < ZmFolder.ID_ROOT || (obj.id > ZmFolder.LAST_SYSTEM_ID &&
		obj.id < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.FOLDER]))) return;

	// ignore non-mail folders
	if (obj.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR] ||
		obj.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK] ||
		obj.view == ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK]) {

		return;
	}

	var folder = new ZmFolder(obj.id, obj.name, parent, tree, obj.u, obj.n, obj.url, null, null, obj.rest);
	if (ZmFolder.MSG_KEY[obj.id]) {
		folder._systemName = obj.name;
	}
	folder._setSharesFromJs(obj);

	// a folder may contain other folders or searches
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var childFolder = ZmFolder.createFromJs(folder, obj.folder[i], tree);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}
	if (parent && obj.search && obj.search.length) {
		for (var i = 0; i < obj.search.length; i++) {
			var childFolder = ZmSearchFolder.createFromJs(folder, obj.search[i], tree);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}

	return folder;
};

/**
* Comparison function for folders. Intended for use on a list of user folders through a call to Array.sort().
*
* @param	folderA		a folder
* @param	folderB		a folder
*/
ZmFolder.sortCompare =
function(folderA, folderB) {
	var check = ZmOrganizer.checkSortArgs(folderA, folderB);
	if (check != null) return check;

	if (ZmFolder.SORT_ORDER[folderA.id] && ZmFolder.SORT_ORDER[folderB.id])
		return (ZmFolder.SORT_ORDER[folderA.id] - ZmFolder.SORT_ORDER[folderB.id]);
	if (!ZmFolder.SORT_ORDER[folderA.id] && ZmFolder.SORT_ORDER[folderB.id]) return 1;
	if (ZmFolder.SORT_ORDER[folderA.id] && !ZmFolder.SORT_ORDER[folderB.id]) return -1;
	if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) return 1;
	if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) return -1;
	return 0;
};

/**
* Checks a folder name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		a folder name
*/
ZmFolder.checkName =
function(name) {
	var error = ZmOrganizer.checkName(name);
	if (error) return error;

	// make sure name isn't a system folder (possibly not displayed)
	for (var id in ZmFolder.MSG_KEY) {
		if (name == ZmMsg[ZmFolder.MSG_KEY[id]])
			return ZmMsg.folderNameReserved;
	}
	if (name.toLowerCase() == ZmFolder.SYNC_ISSUES.toLowerCase()) {
		return ZmMsg.folderNameReserved;
	}

	return null;
};

ZmFolder.prototype.toString =
function() {
	return "ZmFolder";
};

// Searches created here since they may be created under a folder or
// another search.
ZmFolder.prototype.create =
function(name, color, url, search) {
	if (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_DRAFTS)
		throw new AjxException("Cannot create subfolder of Spam or Drafts");

	if (search) {
		var soapDoc = AjxSoapDoc.create("CreateSearchFolderRequest", "urn:zimbraMail");
		var searchNode = soapDoc.set("search");
		searchNode.setAttribute("name", AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name);
		searchNode.setAttribute("query", search.query);
		if (search.types) {
			var a = search.types.getArray();
			if (a.length) {
				var typeStr = new Array();
				for (var i = 0; i < a.length; i++)
					typeStr.push(ZmSearch.TYPE[a[i]]);
				searchNode.setAttribute("types", typeStr.join(","));
			}
		}
		if (search.sortBy)
			searchNode.setAttribute("sortBy", ZmSearch.SORT_BY[search.sortBy]);
		searchNode.setAttribute("l", this.id);
	} else {
		var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
		var folderNode = soapDoc.set("folder");
		folderNode.setAttribute("name", AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name);
		folderNode.setAttribute("l", this.id);
		if (url) folderNode.setAttribute("url", url);
	}
	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [url, name]);
	var appController = this.tree._appCtxt.getAppController();
	appController.sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmFolder.prototype._handleErrorCreate =
function(url, name, ex) {
	if (!url && !name) return false;

	var msgDialog = this.tree._appCtxt.getMsgDialog();
	var msg;
	if (name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
	} else if (url) {
		var errorMsg = (ex.code == ZmCsfeException.SVC_RESOURCE_UNREACHABLE) ? ZmMsg.feedUnreachable : ZmMsg.feedInvalid;
		msg = AjxMessageFormat.format(errorMsg, url);
	}
	if (msg) {
		msgDialog.reset();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
	}

	return true;
};

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
};

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
};

/**
* Handles the creation of a folder or search folder. This folder is the parent
* of the newly created folder. A folder may hold a folder or search folder,
* and a search folder may hold another search folder.
*
* @param obj		[Object]	a JS folder object from the notification
* @param isSearch	[boolean]	true if the created object is a search folder
*/
ZmFolder.prototype.notifyCreate =
function(obj, isSearch) {
	// ignore creates of system folders
	if (obj.id < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.FOLDER]) return;

	var folder = isSearch
		? ZmSearchFolder.createFromJs(this, obj, this.tree)
		: ZmFolder.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(folder, ZmFolder.sortCompare);
	this.children.add(folder, index);
	folder._notify(ZmEvent.E_CREATE);
};

/*
* Provide some extra info in the change event about the former state
* of the folder. Note that we null out the field after setting up the
* change event, so the notification isn't also sent when the parent
* class's method is called.
*
* @param obj	[Object]	a "modified" notification
*/
ZmFolder.prototype.notifyModify =
function(obj) {
	var details = {};
	var fields = {};
	var doNotify = false;
	if (obj.name != null && this.name != obj.name) {
		details.oldPath = this.getPath();
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		this.parent.children.sort(ZmTreeView.COMPARE_FUNC[this.type]);
		doNotify = true;
		obj.name = null;
	}
	if (doNotify) {
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}

	if (obj.l != null && obj.l != this.parent.id) {
		details.oldPath = this.getPath();
		var newParent = this._getNewParent(obj.l);
		this.reparent(newParent);
		this._notify(ZmEvent.E_MOVE, details);
		// could be moving search between Folders and Searches - make sure
		// it has the correct tree
		this.tree = newParent.tree;
		obj.l = null;
	}

	ZmOrganizer.prototype.notifyModify.apply(this, [obj]);
};

ZmFolder.prototype.createQuery =
function(pathOnly) {
	var query;
	if (this.isSystem()) {
		query = pathOnly ? ZmFolder.QUERY_NAME[this.id] : "in:" + ZmFolder.QUERY_NAME[this.id];
		return query;
	}
	var path = this.name;
	var f = this.parent;
	while (f && f.id > ZmFolder.ID_ROOT && f.name.length) {
		var name = f.isSystem() ? ZmFolder.QUERY_NAME[f.id] : f.name;
		path = name + "/" + path;
		f = f.parent;
	}
	path = '"' + path + '"';
	query = pathOnly ? path : "in:" + path;
	return query;
};

ZmFolder.prototype.getName =
function(showUnread, maxLength, noMarkup, useSystemName) {
	var name = (useSystemName && this._systemName) ? this._systemName : this.name;
	name = (maxLength && name.length > maxLength) ? name.substring(0, maxLength - 3) + "..." : name;
	if (this.id == ZmOrganizer.ID_ROOT) {
		return ZmMsg.folders;
	} else if (this.id == ZmFolder.ID_DRAFTS || this.id == ZmFolder.ID_OUTBOX) {
		if (showUnread && this.numTotal > 0) {
			name = [name, " (", this.numTotal, ")"].join("");
			if (!noMarkup) {
				name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
			}
		}
		return name;
	} else {
		return this._markupName(name, showUnread, noMarkup);
	}
};

ZmFolder.prototype.getIcon = 
function() {
	if (this.id == ZmOrganizer.ID_ROOT) {
		return null;
	} else if (ZmFolder.IMAGE[this.id]) {
		return ZmFolder.IMAGE[this.id];
	} else if (this.isFeed()) {
		return "RSS";
	} else {
		return "Folder";
	}
};

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
* - We are not the Folders container
* - We are not a search folder
* - The items aren't already in this folder
* - A contact can only be moved to Trash
* - A draft can be moved to Trash or Drafts
* - Non-drafts cannot be moved to Drafts
*
* @param what		object(s) to possibly move into this folder
*/
ZmFolder.prototype.mayContain =
function(what) {
	if (!what) return true;
	if (this.isFeed()) return false;
	if (this.isSyncIssuesFolder()) return false;

	var invalid = false;
	if (what instanceof ZmFolder) {
		var folder = what;
		invalid = (folder.parent == this || this.isChildOf(folder) || 
				   this.id == ZmFolder.ID_DRAFTS || this.id == ZmFolder.ID_SPAM || 
				   (!this.isInTrash() && this.hasChild(folder.name)) ||
				   (folder.type == ZmOrganizer.FOLDER && this.type == ZmOrganizer.SEARCH) ||
				   (folder.type == ZmOrganizer.SEARCH && this.type == ZmOrganizer.FOLDER && this.id == ZmOrganizer.ID_ROOT) ||
				   (folder.id == this.id));
	} else {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
		if (this.id == ZmOrganizer.ID_ROOT) {
			invalid = true;		// container can only have folders/searches
		} else if (this.type == ZmOrganizer.SEARCH) {
			invalid = true;		// can't drop items into saved searches
		} else if ((item.type == ZmItem.CONTACT) && item.isGal) {
			invalid = true;
		} else if ((item.type == ZmItem.CONV) && item.list.search && (item.list.search.folderId == this.id)) {
			invalid = true;		// convs which are a result of a search for this folder
		} else {	// checks that need to be done for each item
			for (var i = 0; i < items.length; i++) {
				if ((items[i].type == ZmItem.CONTACT) && (this.id != ZmFolder.ID_TRASH)) {
					invalid = true;		// can only move contacts into Trash
					break;
				} else if (items[i].isDraft && (this.id != ZmFolder.ID_TRASH && this.id != ZmFolder.ID_DRAFTS)) {
					invalid = true;		// can move drafts into Trash or Drafts
					break;
				} else if (this.id == ZmFolder.ID_DRAFTS && !items[i].isDraft) {
					invalid = true;		// only drafts can be moved into Drafts
					break;
				}
			}
			// can't move items to folder they're already in; we're okay if we have one item from another folder
			if (!invalid) {
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
};

/**
* Returns true if the folder is the one dealing with Outlook sync issues
*
*/
ZmFolder.prototype.isSyncIssuesFolder =
function() {
	return this.name == ZmFolder.SYNC_ISSUES;
};


/**
* Returns the folder with the given path
*
* @param path			[string]	the path to search for
* @param useSystemName	[boolean]*	if true, use untranslated version of system folder names
*/
ZmFolder.prototype.getByPath =
function(path, useSystemName) {
	return this._getByPath(path.toLowerCase(), useSystemName);
};

// Test the path of this folder and then descendants against the given path, case insensitively
ZmFolder.prototype._getByPath =
function(path, useSystemName) {
	if (this.id == ZmFolder.ID_TAGS) return null;

	if (path == this.getPath(false, false, null, true, useSystemName).toLowerCase())
		return this;
		
	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByPath(path, useSystemName))
			return organizer;
	}
	return null;	
};
