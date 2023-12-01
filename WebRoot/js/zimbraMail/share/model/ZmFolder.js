/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines a folder.
 *
 */

/**
 * Creates a folder.
 * @class
 * This class represents a folder, which may contain mail. At some point, folders may be
 * able to contain contacts and/or appointments.
 *
 * @author Conrad Damon
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {int}	params.id		the numeric ID
 * @param {String}	params.name		the name
 * @param {ZmOrganizer}	params.parent	the parent folder
 * @param {ZmTree}	params.tree		the tree model that contains this folder
 * @param {int}	params.numUnread	the number of unread items for this folder
 * @param {int}	params.numTotal		the number of items for this folder
 * @param {int}	params.sizeTotal	the total size of folder's items
 * @param {String}	params.url		the URL for this folder's feed
 * @param {String}	params.owner	the Owner for this organizer
 * @param {String}	params.oname	the Owner's name for this organizer, if remote folder
 * @param {String}	params.zid		the Zimbra ID of owner, if remote folder
 * @param {String}	params.rid		the Remote ID of organizer, if remote folder
 * @param {String}	params.restUrl	the REST URL of this organizer
 * 
 * @extends		ZmOrganizer
 */
ZmFolder = function(params) {
	if (arguments.length == 0) { return; }
	params.type = params.type || ZmOrganizer.FOLDER;
	ZmOrganizer.call(this, params);
};

ZmFolder.prototype = new ZmOrganizer;
ZmFolder.prototype.constructor = ZmFolder;

ZmFolder.prototype.isZmFolder = true;
ZmFolder.prototype.toString = function() { return "ZmFolder"; };


// needed to construct USER_ROOT if mail disabled
ZmOrganizer.ORG_CLASS[ZmId.ORG_FOLDER] = "ZmFolder";

ZmFolder.SEP 									= "/";							// path separator

// system folders (see Mailbox.java in ZimbraServer for positive int consts)
// Note: since these are defined as Numbers, and IDs come into our system as Strings,
// we need to use == for comparisons (instead of ===, which will fail)
ZmFolder.ID_LOAD_FOLDERS						= -3;							// special "Load remaining folders" placeholder
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
ZmFolder.ID_SYNC_FAILURES						= ZmOrganizer.ID_SYNC_FAILURES;
ZmFolder.ID_OUTBOX	 							= ZmOrganizer.ID_OUTBOX;
ZmFolder.ID_ATTACHMENTS                         = ZmOrganizer.ID_ATTACHMENTS;
ZmFolder.ID_DLS									= ZmOrganizer.ID_DLS;

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
ZmFolder.MSG_KEY[ZmOrganizer.ID_BRIEFCASE]		= "briefcase";
ZmFolder.MSG_KEY[ZmOrganizer.ID_ALL_MAILBOXES]	= "allMailboxes";
ZmFolder.MSG_KEY[ZmFolder.ID_OUTBOX]			= "outbox";
ZmFolder.MSG_KEY[ZmFolder.ID_SYNC_FAILURES]		= "errorReports";
ZmFolder.MSG_KEY[ZmFolder.ID_ATTACHMENTS]       = "attachments";

// system folder icons
ZmFolder.ICON = {};
ZmFolder.ICON[ZmFolder.ID_INBOX]				= "Inbox";
ZmFolder.ICON[ZmFolder.ID_TRASH]				= "Trash";
ZmFolder.ICON[ZmFolder.ID_SPAM]					= "SpamFolder";
ZmFolder.ICON[ZmFolder.ID_SENT]					= "SentFolder";
ZmFolder.ICON[ZmFolder.ID_SYNC_FAILURES]		= "SendReceive";
ZmFolder.ICON[ZmFolder.ID_OUTBOX]				= "Outbox";
ZmFolder.ICON[ZmFolder.ID_DRAFTS]				= "DraftFolder";
ZmFolder.ICON[ZmFolder.ID_LOAD_FOLDERS]			= "Plus";
ZmFolder.ICON[ZmFolder.ID_ATTACHMENTS]          = "Attachment";

// name to use within the query language
ZmFolder.QUERY_NAME = {};
ZmFolder.QUERY_NAME[ZmFolder.ID_INBOX]			= "inbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_TRASH]			= "trash";
ZmFolder.QUERY_NAME[ZmFolder.ID_SPAM]			= "junk";
ZmFolder.QUERY_NAME[ZmFolder.ID_SENT]			= "sent";
ZmFolder.QUERY_NAME[ZmFolder.ID_OUTBOX]			= "outbox";
ZmFolder.QUERY_NAME[ZmFolder.ID_DRAFTS]			= "drafts";
ZmFolder.QUERY_NAME[ZmOrganizer.ID_CALENDAR]	= "calendar";
ZmFolder.QUERY_NAME[ZmFolder.ID_CONTACTS]		= "contacts";
ZmFolder.QUERY_NAME[ZmFolder.ID_TASKS]			= "tasks";
ZmFolder.QUERY_NAME[ZmFolder.ID_AUTO_ADDED]		= "Emailed Contacts";
ZmFolder.QUERY_NAME[ZmOrganizer.ID_BRIEFCASE]	= "briefcase";
ZmFolder.QUERY_NAME[ZmFolder.ID_SYNC_FAILURES]	= "Error Reports";

ZmFolder.QUERY_ID = AjxUtil.valueHash(ZmFolder.QUERY_NAME);

// order within the overview panel
ZmFolder.SORT_ORDER = {};
ZmFolder.SORT_ORDER[ZmFolder.ID_INBOX]			= 1;
ZmFolder.SORT_ORDER[ZmFolder.ID_SENT]			= 2;
ZmFolder.SORT_ORDER[ZmFolder.ID_DRAFTS]			= 3;
ZmFolder.SORT_ORDER[ZmFolder.ID_SPAM]			= 4;
ZmFolder.SORT_ORDER[ZmFolder.ID_OUTBOX]			= 5;
ZmFolder.SORT_ORDER[ZmFolder.ID_TRASH]			= 6;
ZmFolder.SORT_ORDER[ZmFolder.ID_SYNC_FAILURES]	= 7;
ZmFolder.SORT_ORDER[ZmFolder.ID_SEP]			= 8;
ZmFolder.SORT_ORDER[ZmFolder.ID_ATTACHMENTS]    = 99; // Last

// character codes for "tcon" attribute in conv action request, which controls
// which folders are affected
ZmFolder.TCON_CODE = {};
ZmFolder.TCON_CODE[ZmFolder.ID_TRASH]			= "t";
ZmFolder.TCON_CODE[ZmFolder.ID_SYNC_FAILURES]	= "o";
ZmFolder.TCON_CODE[ZmFolder.ID_SPAM]			= "j";
ZmFolder.TCON_CODE[ZmFolder.ID_SENT]			= "s";
ZmFolder.TCON_CODE[ZmFolder.ID_DRAFTS]			= "d";
ZmFolder.TCON_CODE[ZmFolder.ID_OTHER]			= "o";

// folders that look like mail folders that we don't want to show
ZmFolder.HIDE_ID = {};
ZmFolder.HIDE_ID[ZmOrganizer.ID_NOTIFICATION_MP]	= true;

// Hide folders migrated from Outlook mailbox
ZmFolder.HIDE_NAME = {};
//ZmFolder.HIDE_NAME["Journal"]		= true;
//ZmFolder.HIDE_NAME["Notes"]		= true;
//ZmFolder.HIDE_NAME["Outbox"]		= true;
//ZmFolder.HIDE_NAME["Tasks"]		= true;

// folders that contain mail from me instead of to me
ZmFolder.OUTBOUND = [ZmFolder.ID_SENT, ZmFolder.ID_OUTBOX, ZmFolder.ID_DRAFTS];

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
 * through a call to <code>Array.sort()</code>.
 *
 * @param {ZmFolder}	folderA		a folder
 * @param {ZmFolder}	folderB		a folder
 * @param {Boolean}		nonMail		this is sorting non mail tree.
 * @return	{int} 0 if the folders match
 */
ZmFolder.sortCompare =
function(folderA, folderB, nonMail) {
	var check = ZmOrganizer.checkSortArgs(folderA, folderB);
	if (check != null) { return check; }

	// offline client wants POP folders above all else *unless* we are POP'ing into Inbox
	if (appCtxt.isOffline) {
		if (folderA.isDataSource(ZmAccount.TYPE_POP)) {
			if (folderA.id == ZmFolder.ID_INBOX) return -1;
			if (folderB.isDataSource(ZmAccount.TYPE_POP)) {
				if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) { return 1; }
				if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) { return -1; }
				return 0;
			}
			return -1;
		} else if (folderB.isDataSource(ZmAccount.TYPE_POP)) {
			return 1;
		}
	}

	if (ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) {
		return (ZmFolder.SORT_ORDER[folderA.nId] - ZmFolder.SORT_ORDER[folderB.nId]);
	}

	// links (shared folders or mailboxes) appear after personal folders
	if (folderA.link !== folderB.link) {
		return folderA.link ? 1 : -1;
	}

	if (nonMail) {
		//for nonp-mail apps, trash last of all things
		if (folderA.isTrash()) {
			return 1;
		}
		if (folderB.isTrash()) {
			return -1;
		}
		//system before non-system (except for trash)
		if (folderA.isSystem() && !folderB.isSystem()) {
			return -1;
		}
		if (!folderA.isSystem() && folderB.isSystem()) {
			return 1;
		}
		if (folderA.isSystem() && folderB.isSystem()) {
			//for 2 system folders, the default one is first, and the rest ordered alphabetically (again except for trash that appears after the user folders)
			if (folderA.isDefault()) {
				return -1;
			}
			if (folderB.isDefault()) {
				return 1;
			}
			//the other cases will be sorted by name below. Either 2 system or 2 user folders.
		}
	}
	else {
		if (!ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) { return 1; }
		if (ZmFolder.SORT_ORDER[folderA.nId] && !ZmFolder.SORT_ORDER[folderB.nId]) { return -1; }
	}

	if (folderA.name.toLowerCase() > folderB.name.toLowerCase()) { return 1; }
	if (folderA.name.toLowerCase() < folderB.name.toLowerCase()) { return -1; }
	return 0;
};


ZmFolder.sortCompareNonMail =
function(folderA, folderB) {
	return ZmFolder.sortCompare(folderA, folderB, true);
};

/**
 * Compares the folders by path.
 * 
 * @param {ZmFolder}	folderA		a folder
 * @param {ZmFolder}	folderB		a folder
 * @return	{int} 0 if the folders match
 */
ZmFolder.sortComparePath =
function(folderA, folderB) {

	var pathA = folderA && folderA.getPath(false, false, null, true, true);
	var pathB = folderB && folderB.getPath(false, false, null, true, true);
	var check = ZmOrganizer.checkSortArgs(pathA, pathB);
	if (check != null) { return check; }

	if (ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) {
		return (ZmFolder.SORT_ORDER[folderA.nId] - ZmFolder.SORT_ORDER[folderB.nId]);
	}
	if (!ZmFolder.SORT_ORDER[folderA.nId] && ZmFolder.SORT_ORDER[folderB.nId]) { return 1; }
	if (ZmFolder.SORT_ORDER[folderA.nId] && !ZmFolder.SORT_ORDER[folderB.nId]) { return -1; }
	if (pathA.toLowerCase() > pathB.toLowerCase()) { return 1; }
	if (pathA.toLowerCase() < pathB.toLowerCase()) { return -1; }
	return 0;
};

/**
 * Checks a folder name for validity. Note: that a name, rather than a path, is checked.
 *
 * @param {String}	name		the folder name
 * @param {ZmFolder}	parent		the parent folder
 * @return	{String} an error message if the name is invalid; <code>null</code>if the name is valid. 
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
		/*if (lname == ZmFolder.SYNC_ISSUES.toLowerCase()) {
			return ZmMsg.folderNameReserved;
		}*/
	}

	return null;
};

/**
 * Gets the "well-known" ID for a given folder name.
 * 
 * @param	{String}	folderName	the folder name
 * @return	{String}	the id or <code>null</code> if not found
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

/**
 * Moves a folder. A user can move a folder to "Trash" even if there is already a folder in "Trash" with the
 * same name. A new name will be generated for this folder and a rename is performed before the move.
 * 
 * @param	{ZmFolder}	newParent		the new parent
 * @param	{boolean}	noUndo			true if the action should not be undoable
 * @param	{String}	actionText		optional custom action text to display as summary
 */
ZmFolder.prototype.move =
function(newParent, noUndo, actionText, batchCmd) {
	var origName = this.name;
	var name = this.name;
	while (newParent.hasChild(name)) {
		name = name + "_";
	}
	if (origName != name) {
		this.rename(name);
	}
	ZmOrganizer.prototype.move.call(this, newParent, noUndo, batchCmd);
};

/**
 * Sends <code>&lt;FolderActionRequest&gt;</code> to turn sync'ing on/off for IMAP folders. Currently,
 * this is only used by Offline/ZDesktop client
 *
 * @param {Boolean}	syncIt		the flag indicating whether to sync this folder
 * @param {AjxCallback}	callback		the callback to call once server request is successful
 * @param {AjxCallback}	errorCallback	the callback to call if server returns error
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
	};
	appCtxt.getAppController().sendRequest(params);
};

/**
 * Checks folders recursively for feeds.
 * 
 * @return	{Boolean}	<code>true</code> for feeds
 */
ZmFolder.prototype.hasFeeds =
function() {
	if (this.type != ZmOrganizer.FOLDER) { return false; }

	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (a[i].isFeed()) {
			return true;
		}
		if (a[i].children && a[i].children.size() > 0) {
			return (a[i].hasFeeds && a[i].hasFeeds());
		}
	}
	return false;
};

/**
 * Checks if the folder has search.
 * 
 * @param	{String}	id	not used
 * @return	{Boolean}	<code>true</code> if has search
 */
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

/**
 * Checks if the folder supports public access. Override this method if you dont want a folder to be accessed publicly
 * 
 * @return	{Boolean}	always returns <code>true</code>
 */
ZmFolder.prototype.supportsPublicAccess =
function() {
	return true;
};

/**
 * Handles the creation of a folder or search folder. This folder is the parent
 * of the newly created folder. A folder may hold a folder or search folder,
 * and a search folder may hold another search folder.
 *
 * @param {Object}	obj				a JS folder object from the notification
 * @param {String}	elementType		the type of containing JSON element
 * @param {Boolean}	skipNotify		<code>true</code> if notifying client should be ignored
 */
ZmFolder.prototype.notifyCreate =
function(obj, elementType, skipNotify) {
	// ignore creates of system folders
	var nId = ZmOrganizer.normalizeId(obj.id);
	if (this.isSystem() && nId < ZmOrganizer.FIRST_USER_ID[this.type]) { return; }

	var account = ZmOrganizer.parseId(obj.id).account;
	var folder = ZmFolderTree.createFromJs(this, obj, this.tree, elementType, null, account);
	if (folder) {
		var index = ZmOrganizer.getSortIndex(folder, eval(ZmTreeView.COMPARE_FUNC[this.type]));
		this.children.add(folder, index);

		if (!skipNotify) {
			folder._notify(ZmEvent.E_CREATE);
		}
	}
};

/**
 * Provide some extra info in the change event about the former state
 * of the folder. Note that we null out the field after setting up the
 * change event, so the notification isn't also sent when the parent
 * class's method is called.
 *
 * @param {Object}	obj	a "modified" notification
 */
ZmFolder.prototype.notifyModify =
function(obj) {
	var details = {};
	var fields = {};
	var doNotify = false;
	if (obj.name != null && this.name != obj.name && obj.id == this.id) {
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
		if (newParent) {
			details.oldPath = this.getPath();
			this.reparent(newParent);
			this._notify(ZmEvent.E_MOVE, details);
			obj.l = null;
		}
	}

	ZmOrganizer.prototype.notifyModify.apply(this, [obj]);
};

/**
 * Creates a query.
 * 
 * @param	{Boolean}	pathOnly	<code>true</code> if to use the path only
 * @return	{String}	the query
 */
ZmFolder.prototype.createQuery =
function(pathOnly) {
	if (!this.isRemote() && this.isSystem()) {
		var qName = ZmFolder.QUERY_NAME[this.nId] || this.getName(false, null, true, true) || this.name;
		// put quotes around folder names that consist of multiple words or have special characters.
		var quote = /^\w+$/.test(qName) ? "" : "\"";
		return pathOnly
			? qName
			: ("in:" + quote + qName + quote);
	}

	var path = this.isSystem() ? ZmFolder.QUERY_NAME[this.nId] : this.name;
	var f = this.parent;
	while (f && (f.nId != ZmFolder.ID_ROOT) && f.name.length) {
		var name = (f.isSystem() && ZmFolder.QUERY_NAME[f.nId]) || f.name;
		path = name + "/" + path;
		f = f.parent;
	}
	path = '"' + path + '"';
	return pathOnly ? path : ("in:" + path);
};

/**
 * Gets the name.
 * 
 * @param	{Boolean}	 showUnread		<code>true</code> to show unread
 * @param	{int}		maxLength		the max length
 * @param	{Boolean}	noMarkup		<code>true</code> to not include markup
 * @param	{Boolean}	useSystemName	<code>true</code> to use the system name
 * 
 * @return	{String}	the name
 */
ZmFolder.prototype.getName =
function(showUnread, maxLength, noMarkup, useSystemName) {
	if (this.nId == ZmFolder.ID_DRAFTS ||
		this.nId == ZmFolder.ID_OUTBOX ||
		this.rid == ZmFolder.ID_DRAFTS)
	{
		var name = (useSystemName && this._systemName) ? this._systemName : this.name;
		if (showUnread && this.numTotal > 0) {
			name = AjxMessageFormat.format(ZmMsg.folderUnread, [name, this.numTotal]);
			if (!noMarkup) {
				name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
			}
		}
		return name;
	}
	else {
		return ZmOrganizer.prototype.getName.apply(this, arguments);
	}
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmFolder.prototype.getIcon =
function() {
	if (this.nId == ZmOrganizer.ID_ROOT)			{ return null; }
	if (ZmFolder.ICON[this.nId])					{ return ZmFolder.ICON[this.nId]; }
	if (this.isFeed())								{ return "RSS"; }
	if (this.isRemote())							{ return "SharedMailFolder"; }
	if (this.isDataSource(ZmAccount.TYPE_POP))		{ return "POPAccount"; }

	// make a "best-effort" to map imap folders to a well-known icon
	// (parent will be the root imap folder)
	var mappedId = this.getSystemEquivalentFolderId();
	if (mappedId) {
		return ZmFolder.ICON[mappedId] || "Folder";
	}

	return "Folder";
};

ZmFolder.prototype.getSystemEquivalentFolderId =
function() {
	if (this.parent && this.parent.isDataSource(ZmAccount.TYPE_IMAP)) {
		return ZmFolder.getIdForName(this.name);
	}
	return null;
};

ZmFolder.prototype.isSystemEquivalent =
function() {
	return this.getSystemEquivalentFolderId() != null;
};

ZmFolder.prototype.mayContainFolderFromAccount =
function(otherAccount) {
	var thisAccount = this.getAccount();
	if (thisAccount == otherAccount) {
		return true;
	}
	return thisAccount.isLocal(); // can only move to local

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
 * <li>We are not moving it into a folder of a different type</li>
 * <li>We are not moving a folder into itself</li>
 * </ul>
 *
 * If the object is an item or a list or items, check that:
 * <ul>
 * <li>We are not the Folders container</li>
 * <li>We are not a search folder</li>
 * <li>The items aren't already in this folder</li>
 * <li>A contact can only be moved to Trash</li>
 * <li> A draft can be moved to Trash or Drafts</li>
 * <li>Non-drafts cannot be moved to Drafts</li>
 * </ul>
 *
 * @param {Object}	what		the object(s) to possibly move into this folder (item or organizer)
 * @param {constant}	folderType	the contextual folder type (for tree view root items)
 * @param {boolean}	ignoreExisting  Set to true if checks for item presence in the folder should be skipped (e.g. when recovering deleted items)
 */
ZmFolder.prototype.mayContain =
function(what, folderType, ignoreExisting) {

	if (!what) {
		return true;
	}
	if (this.isFeed() /*|| this.isSyncIssuesFolder()*/) {
		return false;
	}
	// placeholder for showing a large number of folders
	if (this.id == ZmFolder.ID_LOAD_FOLDERS) {
		return false;
	}

	var thisType = folderType || this.type;
	var invalid = false;
	if (what instanceof ZmFolder) {
        invalid = ((what.parent === this && !ignoreExisting) || this.isChildOf(what) || this.nId == ZmFolder.ID_DRAFTS || this.nId == ZmFolder.ID_SPAM ||
				   (!this.isInTrash() && this.hasChild(what.name) && !ignoreExisting) ||
	               (what.type !== thisType && this.nId != ZmFolder.ID_TRASH) ||
				   (what.id === this.id) ||
				   (this.disallowSubFolder) ||
				   (appCtxt.multiAccounts && !this.mayContainFolderFromAccount(what.getAccount())) || // cannot move folders across accounts, unless the target is local
                   (this.isRemote() && !this._remoteMoveOk(what)) ||
				   (what.isRemote() && !this._remoteMoveOk(what)));				// a remote folder can be DnD but not its children
    } else {
		// An item or an array of items is being moved
		var items = AjxUtil.toArray(what);
		var item = items[0];

        // container can only have folders/searches or calendars
		if ((this.nId == ZmOrganizer.ID_ROOT && (what.type !== ZmOrganizer.CALENDAR)) ||
             // nothing can be moved to outbox/sync failures folders
			 this.nId == ZmOrganizer.ID_OUTBOX ||
			 this.nId == ZmOrganizer.ID_SYNC_FAILURES)
		{
			invalid = true;
		} else if (thisType === ZmOrganizer.SEARCH) {
			invalid = true;														// can't drop items into saved searches
		} else if (item && (item.type === ZmItem.CONTACT) && item.isGal) {
			invalid = true;
		} else if (item && (item.type === ZmItem.CONV) && item.list && item.list.search && (item.list.search.folderId === this.id)) {
			invalid = true;														// convs which are a result of a search for this folder
		} else {																// checks that need to be done for each item
			for (var i = 0; i < items.length; i++) {
				var childItem = items[i];
				if (!childItem) {
					invalid = true;
					break;
				}
				if (Dwt.instanceOf(childItem, "ZmBriefcaseFolderItem")) {
                     if (childItem.folder && childItem.folder.isRemote() && !childItem.folder.rid) {
                        invalid = true;
                        break;
                     }
                } else if (item.type === ZmItem.MSG && childItem.isDraft && (this.nId != ZmFolder.ID_TRASH && this.nId != ZmFolder.ID_DRAFTS && this.rid != ZmFolder.ID_DRAFTS)) {
					// can move drafts only into Trash or Drafts
					invalid = true;
					break;
				} else if ((this.nId == ZmFolder.ID_DRAFTS || this.rid == ZmFolder.ID_DRAFTS) && !childItem.isDraft)	{
					// only drafts can be moved into Drafts
					invalid = true;
					break;
				}
			}
			// items in the "Sync Failures" folder cannot be dragged out
			if (appCtxt.isOffline && !invalid) {
				// bug: 41531 - don't allow items to be moved into exchange
				// account when moving across accounts
				var acct = this.getAccount();
				if (acct && item.getAccount() != acct &&
					(acct.type === ZmAccount.TYPE_MSE ||
					 acct.type === ZmAccount.TYPE_EXCHANGE))
				{
					invalid = true;
				}
				else {
					var cs = appCtxt.getCurrentSearch();
					var folder = cs && appCtxt.getById(cs.folderId);
					if (folder && folder.nId == ZmOrganizer.ID_SYNC_FAILURES) {
						invalid = true;
					}
				}
			}

			// bug #42890 - disable moving to shared folders across accounts
			// until server bug is fixed
			if (appCtxt.multiAccounts && this.isRemote() &&
				what.getAccount && this.getAccount().id != what.getAccount().id)
			{
				invalid = true;
			}

			// can't move items to folder they're already in; we're okay if we
			// have one item from another folder
			if (!invalid && !ignoreExisting) {
				if (item && item.folderId) {
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
		if (!invalid && this.link) {
			invalid = this.isReadOnly();										// cannot drop anything onto a read-only item
		}
	}
	return !invalid;
};

/**
 * Checks if this is the sync issues folder.
 * 
 * @return	{Boolean}	<code>true</code> if the folder is the one dealing with Outlook sync issues
 */

//Bug#68799 Removing special handling of the folder named "Sync Issues"

/*ZmFolder.prototype.isSyncIssuesFolder =
function() {
	return (this.name == ZmFolder.SYNC_ISSUES);
};*/

/**
 * Checks if this folder required hard delete.
 * 
 * @return	{Boolean}	<code>true</code> if deleting items w/in this folder should be hard deleted.
 */
ZmFolder.prototype.isHardDelete =
function() {
	return (this.isInTrash() || this.isInSpam() || (appCtxt.isOffline && this.isUnder(ZmOrganizer.ID_SYNC_FAILURES)));
};

/**
 * Checks if this folder is in spam folder.
 * 
 * @return	{Boolean}	<code>true</code> if in spam
 */
ZmFolder.prototype.isInSpam =
function(){
	return this.isUnder(ZmFolder.ID_SPAM);
};

/**
 *
 * @param {ZmFolder}	folder  the source folder
 * 
 * @return {Boolean}	<code>true/code> if the given remote folder can be moved into this remote folder.
 * The source and the target folder must belong to the same account. The source
 * must have delete permission and the target must have insert permission.
 * 
 * @private
 */
ZmFolder.prototype._remoteMoveOk =
function(folder) {
	if (!this.isRemote() && folder.isMountpoint && folder.rid) { return true; }
	if (!this.link || !folder.link || this.getOwner() !== folder.getOwner()) { return false; }
	if (!this._folderActionOk(this, "isInsert")) {
		return false;
	}
	return this._folderActionOk(folder, "isDelete");
};

ZmFolder.prototype._folderActionOk =
function(folder, func) {
	var share = folder.shares && folder.shares[0];
	if (!share) {
		//if shares is not set, default to readOnly.
		return !folder.isReadOnly();
	}
	return share[func]();
};
/**
 * Returns true if this folder is for outbound mail.
 */
ZmFolder.prototype.isOutbound =
function() {
	for (var i = 0; i < ZmFolder.OUTBOUND.length; i++) {
		if (this.isUnder(ZmFolder.OUTBOUND[i])) {
			return true;
		}
	}
	return false;
};


/**
 * Sets the Global Mark Read flag.  When the user sets this flag, read flags are global for all
 * shared instances of the folder. When not set, each user accessing the shared folder will maintain
 * their own read/unread flag.
 *
 * @param	{Object}	        globalMarkRead		the globalMarkRead boolean flag
 * @param	{AjxCallback}	    callback		    the callback
 * @param	{AjxCallback}	    errorCallback		the error callback
 * @param   {ZmBatchCommand}    batchCmd            optional batch command
 */
ZmOrganizer.prototype.setGlobalMarkRead = function(globalMarkRead, callback, errorCallback, batchCmd) {
	if (this.globalMarkRead == globalMarkRead) { return; }
    // TODO: Bug 59559, awaiting server side implementation (Bug 24567)
    // TODO: - For ZmFolderPropsDialog and ZmSharePropsDialog:
    // TODO:     Make sure that the attrName is indeed globalMarkRead - used in the dialogs
    // TODO:     Make the globalMarkRead labels and controls visible.
    // TODO: - Uncomment this once the server call is ready, make sure action/attrs are correct
	//this._organizerAction({action: "globalMarkRead", attrs: {globalMarkRead: globalMarkRead}, callback: callback,
    //                       errorCallback: errorCallback, batchCmd: batchCmd});
};
