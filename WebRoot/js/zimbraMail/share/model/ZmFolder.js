/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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
* @param sizeTotal	[int]*			total size of folder's items
* @param url		[string]*		URL for this folder's feed
* @param owner		[string]* 		Owner for this organizer
* @param zid		[string]*		Zimbra ID of owner, if remote folder
* @param rid		[string]*		Remote ID of organizer, if remote folder
* @param restUrl	[string]*		The REST URL of this organizer.
*/
ZmFolder = function(params) {
	if (arguments.length == 0) { return; }
	params.type = params.type || ZmOrganizer.FOLDER;
	ZmOrganizer.call(this, params);
};

ZmFolder.prototype = new ZmOrganizer;
ZmFolder.prototype.constructor = ZmFolder;


ZmFolder.SEP 									= "/";							// path separator

// system folders (see Mailbox.java in ZimbraServer for positive int consts)
ZmFolder.ID_OTHER								= -2;							// used for tcon value (see below)
ZmFolder.ID_SEP									= -1;							// separator
ZmFolder.ID_ROOT								= ZmOrganizer.ID_ROOT;
ZmFolder.ID_INBOX								= ZmOrganizer.ID_INBOX;
ZmFolder.ID_TRASH								= ZmOrganizer.ID_TRASH;
ZmFolder.ID_SPAM								= ZmOrganizer.ID_SPAM;
ZmFolder.ID_SENT								= 5;
ZmFolder.ID_DRAFTS								= 6;
ZmFolder.ID_CONTACTS							= ZmOrganizer.ID_ADDRBOOK;
ZmFolder.ID_AUTO_ADDED							= ZmOrganizer.ID_AUTO_ADDED;
ZmFolder.ID_TAGS	 							= 8;
ZmFolder.ID_TASKS								= ZmOrganizer.ID_TASKS;
ZmFolder.ID_ARCHIVE	 							= ZmOrganizer.ID_ARCHIVE;
ZmFolder.ID_OUTBOX	 							= ZmOrganizer.ID_OUTBOX;
ZmFolder.ID_CHATS	 							= ZmOrganizer.ID_CHATS;

// system folder names
ZmFolder.MSG_KEY = {};
ZmFolder.MSG_KEY[ZmFolder.ID_INBOX]				= "inbox";
ZmFolder.MSG_KEY[ZmFolder.ID_TRASH]				= "trash";
ZmFolder.MSG_KEY[ZmFolder.ID_SPAM]				= "junk";
ZmFolder.MSG_KEY[ZmFolder.ID_SENT]				= "sent";
ZmFolder.MSG_KEY[ZmFolder.ID_DRAFTS]			= "drafts";
ZmFolder.MSG_KEY[ZmFolder.ID_CONTACTS]			= "contacts";
ZmFolder.MSG_KEY[ZmFolder.ID_AUTO_ADDED]		= "emailedContacts";
ZmFolder.MSG_KEY[ZmFolder.ID_TASKS]				= "tasks";
ZmFolder.MSG_KEY[ZmFolder.ID_TAGS]				= "tags";
ZmFolder.MSG_KEY[ZmOrganizer.ID_CALENDAR]		= "calendar";
ZmFolder.MSG_KEY[ZmOrganizer.ID_NOTEBOOK]		= "notebook";
ZmFolder.MSG_KEY[ZmOrganizer.ID_BRIEFCASE]		= "briefcase";
ZmFolder.MSG_KEY[ZmOrganizer.ID_CHATS]			= "chats";

// system folder icons
ZmFolder.ICON = {};
ZmFolder.ICON[ZmFolder.ID_INBOX]				= "Inbox";
ZmFolder.ICON[ZmFolder.ID_TRASH]				= "Trash";
ZmFolder.ICON[ZmFolder.ID_SPAM]					= "SpamFolder";
ZmFolder.ICON[ZmFolder.ID_SENT]					= "SentFolder";
ZmFolder.ICON[ZmFolder.ID_ARCHIVE]				= "ArchiveFolder";
ZmFolder.ICON[ZmFolder.ID_OUTBOX]				= "Outbox";
ZmFolder.ICON[ZmFolder.ID_DRAFTS]				= "DraftFolder";
ZmFolder.ICON[ZmFolder.ID_CHATS]				= "ChatFolder";

// name to use within the query language
ZmFolder.QUERY_NAME = {};
ZmFolder.QUERY_NAME[ZmFolder.ID_INBOX]			= "inbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_TRASH]			= "trash";
ZmFolder.QUERY_NAME[ZmFolder.ID_SPAM]			= "junk";
ZmFolder.QUERY_NAME[ZmFolder.ID_SENT]			= "sent";
ZmFolder.QUERY_NAME[ZmFolder.ID_ARCHIVE]		= "archive";
ZmFolder.QUERY_NAME[ZmFolder.ID_OUTBOX]			= "outbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS]			= "drafts";
ZmFolder.QUERY_NAME[ZmFolder.ID_CONTACTS]		= "contacts";
ZmFolder.QUERY_NAME[ZmFolder.ID_TASKS]			= "tasks";
ZmFolder.QUERY_NAME[ZmFolder.ID_AUTO_ADDED]		= '"Emailed Contacts"';
ZmFolder.QUERY_NAME[ZmOrganizer.ID_NOTEBOOK]	= "notebook";
ZmFolder.QUERY_NAME[ZmOrganizer.ID_BRIEFCASE]	= "briefcase";
ZmFolder.QUERY_NAME[ZmFolder.ID_CHATS]			= "chats";

// order within the overview panel
ZmFolder.SORT_ORDER = {};
ZmFolder.SORT_ORDER[ZmFolder.ID_INBOX]			= 1;
ZmFolder.SORT_ORDER[ZmFolder.ID_CHATS]			= 2;
ZmFolder.SORT_ORDER[ZmFolder.ID_SENT]			= 3;
ZmFolder.SORT_ORDER[ZmFolder.ID_DRAFTS]			= 4;
ZmFolder.SORT_ORDER[ZmFolder.ID_SPAM]			= 5;
ZmFolder.SORT_ORDER[ZmFolder.ID_TRASH]			= 6;
ZmFolder.SORT_ORDER[ZmFolder.ID_ARCHIVE]		= 7;
ZmFolder.SORT_ORDER[ZmFolder.ID_OUTBOX]			= 8;
ZmFolder.SORT_ORDER[ZmFolder.ID_SEP]			= 9;

// character codes for "tcon" attribute in conv action request, which controls
// which folders are affected
ZmFolder.TCON_CODE = {};
ZmFolder.TCON_CODE[ZmFolder.ID_TRASH]			= "t";
ZmFolder.TCON_CODE[ZmFolder.ID_SPAM]			= "j";
ZmFolder.TCON_CODE[ZmFolder.ID_SENT]			= "s";
ZmFolder.TCON_CODE[ZmFolder.ID_OTHER]			= "o";

// folders that look like mail folders that we don't want to show
ZmFolder.HIDE_ID = {};
ZmFolder.HIDE_ID[ZmOrganizer.ID_CHATS]			= true;
ZmFolder.HIDE_ID[ZmOrganizer.ID_ARCHIVE]		= true;

// Hide folders migrated from Outlook mailbox
ZmFolder.HIDE_NAME = {};
//ZmFolder.HIDE_NAME["Journal"]	= true;
//ZmFolder.HIDE_NAME["Notes"]		= true;
//ZmFolder.HIDE_NAME["Outbox"]		= true;
//ZmFolder.HIDE_NAME["Tasks"]		= true;

// The extra-special, visible but untouchable outlook folder
ZmFolder.SYNC_ISSUES 							= "Sync Issues";

// map name to ID
ZmFolder.QUERY_ID = {};
(function() {
	for (var i in ZmFolder.QUERY_NAME) {
		ZmFolder.QUERY_ID[ZmFolder.QUERY_NAME[i]] = i;
	}
})();

/**
* Comparison function for folders. Intended for use on a list of user folders
* through a call to Array.sort().
*
* @param	folderA		a folder
* @param	folderB		a folder
*/
ZmFolder.sortCompare =
function(folderA, folderB) {
	var check = ZmOrganizer.checkSortArgs(folderA, folderB);
	if (check != null) { return check; }

	// offline client wants POP folders above all else *unless* we are POP'ing into Inbox
	if (appCtxt.get(ZmSetting.OFFLINE)) {
		if (folderA.isDataSource(ZmAccount.POP)) {
			if (folderA.id == ZmFolder.ID_INBOX) return -1;
			if (folderB.isDataSource(ZmAccount.POP)) {
				if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) { return 1; }
				if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) { return -1; }
				return 0;
			}
			return -1;
		} else if (folderB.isDataSource(ZmAccount.POP)) {
			return 1;
		}
	}

	if (ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) {
		return (ZmFolder.SORT_ORDER[folderA.nId] - ZmFolder.SORT_ORDER[folderB.nId]);
	}
	if (!ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) { return 1; }
	if (ZmFolder.SORT_ORDER[folderA.nId] && !ZmFolder.SORT_ORDER[folderB.nId]) { return -1; }
	if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) { return 1; }
	if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) { return -1; }
	return 0;
};

/**
* Checks a folder name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		[string]		a folder name
* @param parent		[ZmFolder]*		parent folder
*/
ZmFolder.checkName =
function(name, parent) {
	var error = ZmOrganizer.checkName(name);
	if (error) { return error; }

	// make sure path isn't same as a system folder
	parent = parent || appCtxt.getFolderTree().root;
	if (parent && (parent.id == ZmFolder.ID_ROOT)) {
		var lname = name.toLowerCase();
		for (var id in ZmFolder.MSG_KEY) {
			var sysname = ZmMsg[ZmFolder.MSG_KEY[id]];
			if (sysname && (lname == sysname.toLowerCase())) {
				return ZmMsg.folderNameReserved;
			}
		}
		if (lname == ZmFolder.SYNC_ISSUES.toLowerCase()) {
			return ZmMsg.folderNameReserved;
		}
	}

	return null;
};

/**
* Helper method which returns the "well-known" ID for a given folder name
*/
ZmFolder.getIdForName =
function(folderName) {
	var name = folderName.toLowerCase();
	for (var i in ZmFolder.MSG_KEY) {
		if (ZmFolder.MSG_KEY[i] == name) {
			return i;
		}
	}
	return null;
};

ZmFolder.prototype.toString =
function() {
	return "ZmFolder";
};

// User can move a folder to Trash even if there's already a folder there with the
// same name. We find a new name for this folder and rename it before the move.
ZmFolder.prototype.move =
function(newParent) {
	var origName = this.name;
	var name = this.name;
	while (newParent.hasChild(name)) {
		name = name + "_";
	}
	if (origName != name) {
		this.rename(name);
	}
	ZmOrganizer.prototype.move.call(this, newParent);
};

/**
 * Sends FolderActionRequest to turn syncing on/off for IMAP folders. Currently,
 * this is only used by Offline/ZDesktop client
 *
 * @param syncIt		[Boolean]		flag indicating whether to sync this folder
 * @param callback		[AjxCallback]*	callback to call once server request is successful
 * @param errorCallback	[AjxCallback]*	callback to call if server returns error
 */
ZmFolder.prototype.toggleSyncOffline =
function(callback, errorCallback) {
	if (!this.isOfflineSyncable) { return; }

	var op = this.isOfflineSyncing ? "!syncon" : "syncon";
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", op);
	actionNode.setAttribute("id", this.id);

	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		callback: callback,
		errorCallback: errorCallback
	}
	appCtxt.getAppController().sendRequest(params);
};

ZmFolder.prototype.hasSearch =
function(id) {
	if (this.type == ZmOrganizer.SEARCH) { return true; }

	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (a[i].hasSearch()) {
			return true;
		}
	}

	return false;
};

ZmFolder.prototype.supportsPublicAccess =
function() {
	// mail folders cannot be accessed outside of ZCS
	return false;
};

/**
* Handles the creation of a folder or search folder. This folder is the parent
* of the newly created folder. A folder may hold a folder or search folder,
* and a search folder may hold another search folder.
*
* @param obj		[Object]	a JS folder object from the notification
* @param isSearch	[boolean]	true if the created object is a search folder
* @param skipNotify	[boolean]	true if notifying client should be ignored
*/
ZmFolder.prototype.notifyCreate =
function(obj, isSearch, skipNotify) {
	// ignore creates of system folders
	var nId = ZmOrganizer.normalizeId(obj.id);
	if (nId < ZmOrganizer.FIRST_USER_ID[this.type]) { return; }

	var folder = ZmFolderTree.createFromJs(this, obj, this.tree, isSearch ? "search" : "folder");
	var index = ZmOrganizer.getSortIndex(folder, ZmFolder.sortCompare);
	this.children.add(folder, index);

	if (!skipNotify) {
		folder._notify(ZmEvent.E_CREATE);
	}
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
		this.parent.children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
		doNotify = true;
		obj.name = null;
	}
	if (doNotify) {
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}

	if (obj.l != null && (!this.parent || (obj.l != this.parent.id))) {
		var newParent = this._getNewParent(obj.l);
		this.reparent(newParent);
		details.oldPath = this.getPath();
		this._notify(ZmEvent.E_MOVE, details);
		obj.l = null;
	}

	ZmOrganizer.prototype.notifyModify.apply(this, [obj]);
};

ZmFolder.prototype.createQuery =
function(pathOnly) {
	if (!this.isRemote() && this.isSystem()) {
		return pathOnly
			? ZmFolder.QUERY_NAME[this.nId]
			: ("in:" + ZmFolder.QUERY_NAME[this.nId]);
	}
	var path = this.name;
	var f = this.parent;
	while (f && (f.nId != ZmFolder.ID_ROOT) && f.name.length) {
		var name = f.isSystem() ? ZmFolder.QUERY_NAME[f.nId] : f.name;
		path = name + "/" + path;
		f = f.parent;
	}
	path = '"' + path + '"';
	return pathOnly ? path : ("in:" + path);
};

ZmFolder.prototype.getName =
function(showUnread, maxLength, noMarkup, useSystemName) {
	if (this.nId == ZmFolder.ID_DRAFTS || this.nId == ZmFolder.ID_OUTBOX) {
		var name = (useSystemName && this._systemName) ? this._systemName : this.name;
		if (showUnread && this.numTotal > 0) {
			name = [name, " (", this.numTotal, ")"].join("");
			if (!noMarkup) {
				name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
			}
		}
		return name;
	} else {
		return ZmOrganizer.prototype.getName.apply(this, arguments);
	}
};

ZmFolder.prototype.getIcon = 
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)	{ return null; }
	if (ZmFolder.ICON[this.nId])			{ return ZmFolder.ICON[this.nId]; }
	if (this.isFeed())						{ return "RSS"; }
	if (this.isRemote())					{ return "SharedMailFolder"; }
	if (this.isDataSource(ZmAccount.POP))	{ return "POPAccount"; }

	// make a "best-effort" to map imap folders to a well-known icon
	// (parent will be the root imap folder)
	if (this.parent && this.parent.isDataSource(ZmAccount.IMAP)) {
		var mappedId = ZmFolder.getIdForName(this.name);
		if (mappedId) { return ZmFolder.ICON[mappedId] || "Folder"; }
	}

	return "Folder";
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
* @param what		[object]	object(s) to possibly move into this folder (item or organizer)
* @param folderType	[constant]	contextual folder type (for tree view root items)
*/
ZmFolder.prototype.mayContain =
function(what, folderType) {
	if (!what) { return true; }
	if (this.isFeed()) { return false; }
	if (this.isSyncIssuesFolder()) { return false; }
	if (this.link && this.isReadOnly()) { return false; }

	var thisType = folderType || this.type;
	var invalid = false;
	if (what instanceof ZmFolder) {
		invalid = (what.parent == this || this.isChildOf(what) || this.nId == ZmFolder.ID_DRAFTS || this.nId == ZmFolder.ID_SPAM || 
				   (!this.isInTrash() && this.hasChild(what.name)) ||
				   (what.type == ZmOrganizer.FOLDER && thisType == ZmOrganizer.SEARCH) ||
				   (what.type == ZmOrganizer.SEARCH && thisType == ZmOrganizer.FOLDER && this.nId == ZmOrganizer.ID_ROOT) ||
				   (what.id == this.id) ||
				   (what.isRemote() && what.parent && what.parent.isRemote()));	// this means a remote folder can be DnD but not its children
	} else {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
		if (this.nId == ZmOrganizer.ID_ROOT) {
			invalid = true;														// container can only have folders/searches
		} else if (thisType == ZmOrganizer.SEARCH) {
			invalid = true;														// can't drop items into saved searches
		} else if ((item.type == ZmItem.CONTACT) && item.isGal) {
			invalid = true;
		} else if ((item.type == ZmItem.CONV) &&
			 item.list.search &&
			 (item.list.search.folderId == this.id)) {

			invalid = true;														// convs which are a result of a search for this folder
		} else {																// checks that need to be done for each item
			for (var i = 0; i < items.length; i++) {
				if ((items[i].type == ZmItem.CONTACT) && (this.nId != ZmFolder.ID_TRASH)) {
					// can only move contacts into Trash
					invalid = true;
					break;
				} else if (items[i].isDraft && (this.nId != ZmFolder.ID_TRASH && this.nId != ZmFolder.ID_DRAFTS)) {
					// can move drafts into Trash or Drafts
					invalid = true;
					break;
				} else if (this.nId == ZmFolder.ID_DRAFTS && !items[i].isDraft)	{
					// only drafts can be moved into Drafts
					invalid = true;
					break;
				}
			}
			// can't move items to folder they're already in; we're okay if we
			// have one item from another folder
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
	return (this.name == ZmFolder.SYNC_ISSUES);
};
