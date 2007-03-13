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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty organizer.
* @constructor
* @class
* This class represents an "organizer", which is something used to classify or contain
* items. So far, that's either a tag or a folder. Tags and folders are represented as
* a tree structure, though tags are flat and have only one level below the root. Folders
* can be nested.
*
* @author Conrad Damon
*
* @param type		[constant]		organizer type
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param numUnread	[int]*			number of unread items for this organizer
* @param numTotal	[int]*			number of items for this organizer
* @param url		[string]*		URL for this organizer's feed
* @param owner		[string]* 		Owner for this organizer
* @param zid		[string]*		Zimbra ID of owner, if remote folder
* @param rid		[string]*		Remote ID of organizer, if remote folder
* @param restUrl	[string]*		REST URL of this organizer.
*/
function ZmOrganizer(type, id, name, parent, tree, numUnread, numTotal, url, owner, zid, rid, restUrl) {

	if (arguments.length == 0) return;
	
	this.type = type;
	this.id = id;
	this.name = ZmFolder.MSG_KEY[id] ? ZmMsg[ZmFolder.MSG_KEY[id]] : name;
	this.parent = parent;
	this.tree = tree;
	this.numUnread = numUnread || 0;
	this.numTotal = numTotal || 0;
	this.url = url;
	this.owner = owner;
	this.link = Boolean(zid);
	this.zid = zid;
	this.rid = rid;
	this.restUrl = restUrl;
	this.noSuchFolder = false; // Is this a link to some folder that ain't there.

	if (id && tree)
		tree._appCtxt.cacheSet(id, this);

	this.children = new AjxVector();
};

// organizer types
ZmOrganizer.FOLDER				= ZmEvent.S_FOLDER;
ZmOrganizer.TAG					= ZmEvent.S_TAG;
ZmOrganizer.SEARCH				= ZmEvent.S_SEARCH;
ZmOrganizer.CALENDAR			= ZmEvent.S_APPT;
ZmOrganizer.ADDRBOOK 			= ZmEvent.S_CONTACT;
ZmOrganizer.ROSTER_TREE_ITEM	= ZmEvent.S_ROSTER_TREE_ITEM;
ZmOrganizer.ROSTER_TREE_GROUP	= ZmEvent.S_ROSTER_TREE_GROUP;
ZmOrganizer.ZIMLET				= ZmEvent.S_ZIMLET;
ZmOrganizer.NOTEBOOK			= ZmEvent.S_NOTEBOOK;
ZmOrganizer.MOUNTPOINT			= ZmEvent.S_MOUNTPOINT;

// Primary organizer for items
ZmOrganizer.ITEM_ORGANIZER = {};
ZmOrganizer.ITEM_ORGANIZER[ZmItem.CONV]		= ZmOrganizer.FOLDER;
ZmOrganizer.ITEM_ORGANIZER[ZmItem.MSG]		= ZmOrganizer.FOLDER;
//ZmOrganizer.ITEM_ORGANIZER[ZmItem.ATT]		= ZmOrganizer.FOLDER; // ???
ZmOrganizer.ITEM_ORGANIZER[ZmItem.CONTACT]	= ZmOrganizer.ADDRBOOK;
ZmOrganizer.ITEM_ORGANIZER[ZmItem.APPT]		= ZmOrganizer.CALENDAR;
//ZmOrganizer.ITEM_ORGANIZER[ZmItem.NOTE]		= ZmOrganizer.FOLDER; // ???
ZmOrganizer.ITEM_ORGANIZER[ZmItem.PAGE]		= ZmOrganizer.NOTEBOOK;
ZmOrganizer.ITEM_ORGANIZER[ZmItem.DOCUMENT]	= ZmOrganizer.NOTEBOOK;
//ZmOrganizer.ITEM_ORGANIZER[ZmItem.CHAT]		= ZmOrganizer.FOLDER; // ???
//ZmOrganizer.ITEM_ORGANIZER[ZmItem.ROSTER_ITEM]	= ZmOrganizer.FOLDER; // ???
//ZmOrganizer.ITEM_ORGANIZER[ZmItem.RESOURCE]	= ZmOrganizer.FOLDER; // ???

// defined in com.zimbra.cs.mailbox.Mailbox
ZmOrganizer.ID_ROOT				= 1;
ZmOrganizer.ID_INBOX			= 2;
ZmOrganizer.ID_TRASH			= 3;
ZmOrganizer.ID_SPAM				= 4;
ZmOrganizer.ID_ADDRBOOK			= 7;
ZmOrganizer.ID_CALENDAR			= 10;
ZmOrganizer.ID_NOTEBOOK			= 12;
ZmOrganizer.ID_AUTO_ADDED 		= 13;
ZmOrganizer.ID_OUTBOX    		= 254;
ZmOrganizer.ID_ZIMLET			= -1000;  // zimlets need a range.  start from -1000 incrementing up.
ZmOrganizer.ID_ROSTER_LIST		= -11;
ZmOrganizer.ID_ROSTER_TREE_ITEM	= -13;

ZmOrganizer.DEFAULT_FOLDER = {};
ZmOrganizer.DEFAULT_FOLDER[ZmOrganizer.FOLDER] = ZmOrganizer.ID_INBOX;
ZmOrganizer.DEFAULT_FOLDER[ZmOrganizer.ADDRBOOK] = ZmOrganizer.ID_ADDRBOOK;
ZmOrganizer.DEFAULT_FOLDER[ZmOrganizer.CALENDAR] = ZmOrganizer.ID_CALENDAR;
ZmOrganizer.DEFAULT_FOLDER[ZmOrganizer.NOTEBOOK] = ZmOrganizer.ID_NOTEBOOK;

ZmOrganizer.SOAP_CMD = {};
ZmOrganizer.SOAP_CMD[ZmOrganizer.FOLDER]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.TAG]		= "TagAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.SEARCH]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.CALENDAR]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.ADDRBOOK]	= "FolderAction";
ZmOrganizer.SOAP_CMD[ZmOrganizer.NOTEBOOK]	= "FolderAction";

ZmOrganizer.FIRST_USER_ID = {};
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.FOLDER]	= 256;
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.TAG]		= 64;
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.SEARCH]	= 256;
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.CALENDAR]	= 256;
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.ADDRBOOK] = 256;
ZmOrganizer.FIRST_USER_ID[ZmOrganizer.NOTEBOOK] = 256;

ZmOrganizer.TEXT = {};
ZmOrganizer.TEXT[ZmOrganizer.FOLDER]	= ZmMsg.folder;
ZmOrganizer.TEXT[ZmOrganizer.TAG]		= ZmMsg.tag;
ZmOrganizer.TEXT[ZmOrganizer.SEARCH]	= ZmMsg.savedSearch;
ZmOrganizer.TEXT[ZmOrganizer.CALENDAR]	= ZmMsg.calendar;
ZmOrganizer.TEXT[ZmOrganizer.ADDRBOOK]	= ZmMsg.addressBook;
ZmOrganizer.TEXT[ZmOrganizer.NOTEBOOK]	= ZmMsg.notebook;

// fields that can be part of a displayed organizer
var i = 1;
ZmOrganizer.F_NAME		= i++;
ZmOrganizer.F_UNREAD	= i++;
ZmOrganizer.F_TOTAL		= i++;
ZmOrganizer.F_PARENT	= i++;
ZmOrganizer.F_COLOR		= i++;
ZmOrganizer.F_QUERY		= i++;
ZmOrganizer.F_SHARES	= i++;
ZmOrganizer.F_FLAGS		= i++;
ZmOrganizer.F_REST_URL	= i++;

ZmOrganizer.FLAG_CHECKED			= "#";
ZmOrganizer.FLAG_IMAP_SUBSCRIBED	= "*";
ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY	= "b";
ZmOrganizer.ALL_FLAGS = [ZmOrganizer.FLAG_CHECKED, ZmOrganizer.FLAG_IMAP_SUBSCRIBED,
						 ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY];

ZmOrganizer.FLAG_PROP = {};
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_CHECKED]				= "isChecked";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_IMAP_SUBSCRIBED]		= "imapSubscribed";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY]	= "excludeFreeBusy";

// Following chars invalid in organizer names: " : / [anything less than " "]
ZmOrganizer.VALID_NAME_CHARS = "[^\\x00-\\x1F\\x7F:\\/\\\"]";
ZmOrganizer.VALID_PATH_CHARS = "[^\\x00-\\x1F\\x7F:\\\"]"; // forward slash is OK in path
ZmOrganizer.VALID_NAME_RE = new RegExp('^' + ZmOrganizer.VALID_NAME_CHARS + '+$');

ZmOrganizer.MAX_NAME_LENGTH			= 128;	// max allowed by server
ZmOrganizer.MAX_DISPLAY_NAME_LENGTH	= 30;	// max we will show

// colors - these are the server values
ZmOrganizer.C_ORANGE	= 0;
ZmOrganizer.C_BLUE		= 1;
ZmOrganizer.C_CYAN		= 2;
ZmOrganizer.C_GREEN		= 3;
ZmOrganizer.C_PURPLE	= 4;
ZmOrganizer.C_RED		= 5;
ZmOrganizer.C_YELLOW	= 6;
ZmOrganizer.C_PINK		= 7;
ZmOrganizer.C_GRAY		= 8;
ZmOrganizer.MAX_COLOR	= ZmOrganizer.C_GRAY;
ZmOrganizer.DEFAULT_COLOR = ZmOrganizer.C_ORANGE;

// color names
ZmOrganizer.COLOR_TEXT = {};
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_ORANGE]	= ZmMsg.orange;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_BLUE]		= ZmMsg.blue;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_CYAN]		= ZmMsg.cyan;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GREEN]		= ZmMsg.green;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PURPLE]	= ZmMsg.purple;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_RED]		= ZmMsg.red;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_YELLOW]	= ZmMsg.yellow;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PINK]		= ZmMsg.pink;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GRAY]		= ZmMsg.gray;

ZmOrganizer.COLORS = [];
ZmOrganizer.COLOR_CHOICES = [];
for (var i = 0; i <= ZmOrganizer.MAX_COLOR; i++) {
	var color = ZmOrganizer.COLOR_TEXT[i];
	ZmOrganizer.COLORS.push(color);
	ZmOrganizer.COLOR_CHOICES.push( { value: i, label: color } );
}
delete i;

// views
ZmOrganizer.VIEWS = new Object;
ZmOrganizer.VIEWS[ZmOrganizer.FOLDER] = "conversation";
ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR] = "appointment";
ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK] = "contact";
ZmOrganizer.VIEWS[ZmOrganizer.NOTEBOOK] = "wiki";

ZmOrganizer.TYPES = {};
for (var i in ZmOrganizer.VIEWS) {
	ZmOrganizer.TYPES[ZmOrganizer.VIEWS[i]] = i;
}
delete i;

// Abstract methods

ZmOrganizer.sortCompare = function(organizerA, organizerB) {};

ZmOrganizer.prototype.create =
function(name, attrs, callback, errorCallback, postCallback) {
	// create SOAP command
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name);
	folderNode.setAttribute("l", this.id);

	// set attributes
	attrs = attrs || {};
	attrs.view = attrs.view || ZmOrganizer.VIEWS[this.type];
	for (var attr in attrs) {
		folderNode.setAttribute(attr, attrs[attr]);
	}

	// send request
	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: callback,
		errorCallback: errorCallback,
		postCallback: postCallback
	};

	var appController = this.tree._appCtxt.getAppController();
	return appController.sendRequest(params);
};

/**
 * This method creates a sub-tree of organizers of a given view type
 * as specified by a path (e.g. "foo/bar/baz").
 *
 * @param path			[string]		Path of new folder.
 * @param attrs			[object]		Attributes of the folder object
 *										to set at creation. If no view
 *										is specified, the view of this
 *										organizer is used.
 * @param callback		[AjxCallback]	Optional. The first argument
 *										passed to the post-processing
 *										callback will be the last organizer
 *										object created in the path.
 * @param errorCallback	[AjxCallback]	Optional.
 */
/*** TODO ***
ZmOrganizer.prototype.createPath =
function(path, attrs, callback, errorCallback) {
	var organizer = this;
	if (path.match(/^\//)) {
		while (organizer.id != ZmOrganizer.ID_ROOT) {
			organizer = organizer.parent;
		}
		path = path.substr(1);
	}
	var parts = path.replace(/\/$/,"").split('/');
	var rest = parts.slice(1).join('/');
	var name = parts[0];

	var child = this.getChild(name);
	if (child) {
		child.createPath(rest, attrs, callback, errorCallback, postCallback);
	}

	var createCallback = new AjxCallback(this, this._handleCreatePath, [callback]);
	var createPostCallback = new AjxCallback(this, this._handlePostCreatePath, [rest, attrs, callback, errorCallback]);
	this.create(name, attrs, createCallback, errorCallback, createPostCallback);
};
ZmOrganizer.prototype._handleCreatePath =
function(callback, result) {
	// NOTE: The user callback is not called at each
	//       folder creation stage; rather, it is called
	//       at the end and is passed the leaf organizer
	//       so that it can operate on it.
	//if (callback) {
	//	callback.run(result);
	//}
};
ZmOrganizer.prototype._handlePostCreatePath =
function(path, attrs, callback, errorCallback, response) {
	debugger;
	var folderId = response.CreateFolderResponse.folder.id;
	var tree = this._appCtxt.getTree(ZmOrganizer.TYPES[attrs.view || this.type]);
	var organizer = tree.getById(folderId);
	if (path != "") {
		organizer.create(path, attrs, callback, errorCallback, postCallback);
	}
	else if (callback) {
		callback.run(organizer, response);
	}
};
/***/

// Static methods

ZmOrganizer.getViewName =
function(organizerType) {
	return ZmOrganizer.VIEWS[organizerType];
};

/**
* Checks an organizer (folder or tag) name for validity. Returns an error message if the
* name is invalid and null if the name is valid. Note that a name, rather than a path, is
* checked.
*
* @param name		an organizer name
*/
ZmOrganizer.checkName =
function(name) {
	if (name.length == 0)
		return ZmMsg.nameEmpty;

	if (name.length > ZmOrganizer.MAX_NAME_LENGTH)
		return AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);

	if (!ZmOrganizer.VALID_NAME_RE.test(name))
		return AjxMessageFormat.format(ZmMsg.errorInvalidName, name);

	return null;
};

/**
* Checks a URL (a folder or calendar feed, for example) for validity.
*
* TODO: be friendly and prepend "http://" when it's missing
*
* @param url	[string]	a URL
*/
ZmOrganizer.checkUrl =
function(url) {
	if (!url.match(/^[a-zA-Z]+:\/\/.*$/i)) {
		return ZmMsg.errorUrlMissing;
	}

	return null;
};

ZmOrganizer.checkSortArgs =
function(orgA, orgB) {
	if (!orgA && !orgB) return 0;
	if (orgA && !orgB) return 1;
	if (!orgA && orgB) return -1;
	return null;
};

ZmOrganizer.checkColor =
function(color) {
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR)) ? color : ZmOrganizer.DEFAULT_COLOR;
};

// Public methods

ZmOrganizer.prototype.toString = 
function() {
	return "ZmOrganizer";
};

/**
* Returns the name of this organizer.
*
* @param showUnread		whether to display the number of unread items (in parens)
* @param maxLength		length in chars to truncate the name to
* @param noMarkup		if true, don't return any HTML
*/
ZmOrganizer.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = (maxLength && this.name.length > maxLength) ? this.name.substring(0, maxLength - 3) + "..." : this.name;
	return this._markupName(name, showUnread, noMarkup);
};

/**
* Returns the full path as a string.
*
* @param includeRoot	[boolean]*	whether to include root name at the beginning of the path
* @param showUnread		[boolean]*	whether to display the number of unread items (in parens)
* @param maxLength		[int]*		length in chars to truncate the name to
* @param noMarkup		[boolean]*	if true, don't return any HTML
* @param useSystemName	[boolean]*	if true, use untranslated version of system folder names
*/
ZmOrganizer.prototype.getPath = 
function(includeRoot, showUnread, maxLength, noMarkup, useSystemName) {
	var parent = this.parent;
	var path = this.getName(showUnread, maxLength, noMarkup, useSystemName);
	while (parent && ((parent.id != ZmOrganizer.ID_ROOT) || includeRoot)) {
		path = parent.getName(showUnread, maxLength, noMarkup, useSystemName) + ZmFolder.SEP + path;
		parent = parent.parent;
	}
	
	return path;
};


/** Returns the full path, suitable for use in search expressions. */
ZmOrganizer.prototype.getSearchPath = function() {
	return this.id != ZmOrganizer.ID_ROOT ? this.getPath(null, null, null, true) : "/";
};

/** @deprecated Use getRestUrl. */
ZmOrganizer.prototype.getUrl = function() {
	return this.getRestUrl();
};

ZmOrganizer.prototype.getSyncUrl = function() {
	return url;
};

ZmOrganizer.prototype.getRestUrl = function() {
	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	var appCtxt = this.tree ? this.tree._appCtxt : null;
	if (!appCtxt) {
		var shell = DwtShell.getShell(window);
		appCtxt = ZmAppCtxt.getFromShell(shell);
	}

	var loc = document.location;
	var uname = this.owner || appCtxt.get(ZmSetting.USERNAME);
	var host = loc.host;

	var m = uname.match(/^(.*)@(.*)$/);
	uname = (m && m[1]) || uname;
	host = (m && m[2]) || host;
	// REVISIT: What about port? For now assume other host uses same port
	if (loc.port && loc.port != 80) {
		host = host + ":" + loc.port;
	}

	var url = [
		loc.protocol, "//", host, "/service/user/", uname, "/",
		AjxStringUtil.urlEncode(this.getSearchPath())
	].join("");

	DBG.println("NO REST URL FROM SERVER. GENERATED URL: "+url);

	return url;
};

ZmOrganizer.prototype.getShares =
function() {
	return this.shares;
};

ZmOrganizer.prototype.setShares = 
function(shares) {
	this.shares = shares;
};

ZmOrganizer.prototype.addShare =
function(share) {
	if (!this.shares)
		this.shares = [];
	this.shares.push(share);
};

ZmOrganizer.prototype.clearShares =
function() {
	if (this.shares && this.shares.length) {
		for (var i = 0; i < this.shares.length; i++) {
			this.shares[i] = null;
		}
	}
	this.shares = null;
};

// XXX: temp method until we get better *server* support post Birdseye! (see bug #4434)
// DO NOT REMOVE OR I WILL HUNT YOU DOWN AND SHOOT YOU.
ZmOrganizer.prototype.setPermissions =
function(permission) {
	if (this.shares == null) {
		var share = new ZmShare({appCtxt: this.tree._appCtxt, organizer: this, perm: permission});
		this.addShare(share);
	} else {
		// lets just assume we're dealing w/ a link (which should only have one share)
		this.shares[0].perm = permission;
	}
};

ZmOrganizer.prototype.getIcon = function() {};

// Actions

/**
* Assigns the organizer a new name.
*/
ZmOrganizer.prototype.rename =
function(name, callback, errorCallback) {
	if (name == this.name) return;
	name = AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name;
	this._organizerAction({action: "rename", attrs: {name: name}, callback: callback, errorCallback: errorCallback});
};

ZmOrganizer.prototype.setColor =
function(color, callback, errorCallback) {
	var color = ZmOrganizer.checkColor(color);
	if (this.color == color) return;
	this._organizerAction({action: "color", attrs: {color: color}, callback: callback, errorCallback: errorCallback});
};

// Though it's possible to use this method to change just about any folder attribute,
// it should only be used to set multiple attributes at once since it has extra
// overhead on the server.
ZmOrganizer.prototype.update =
function(attrs) {
	this._organizerAction({action: "update", attrs: attrs});
};

/**
* Assigns the organizer a new parent, moving it within its tree.
*
* @param newParent		the new parent of this organizer
*/
ZmOrganizer.prototype.move =
function(newParent) {
	var newId = (newParent.id > 0) ? newParent.id : ZmOrganizer.ID_ROOT;
	if ((newId == this.id || newId == this.parent.id) ||
		(this.type == ZmOrganizer.FOLDER && newId == ZmFolder.ID_SPAM) ||
		(newParent.isChildOf(this))) {
		return;
	}

	this._organizerAction({action: "move", attrs: {l: newId}});
};

/**
* Deletes an organizer. If it's a folder, the server deletes any contents and/or
* subfolders. If it's Trash or Spam, the server deletes and re-creates the folder.
* In that case, we don't bother to remove it from the UI (and we ignore creates on
* system folders).
*/
ZmOrganizer.prototype._delete =
function() {
	DBG.println(AjxDebug.DBG1, "deleting: " + this.name + ", ID: " + this.id);
	var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK) &&
					 (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.isSystem() && !isEmptyOp) return;

	var action = isEmptyOp ? "empty" : "delete";
	this._organizerAction({action: action});
};

ZmOrganizer.prototype.markAllRead =
function() {
	this._organizerAction({action: "read", attrs: {l: this.id}});
};

ZmOrganizer.prototype.sync =
function() {
	this._organizerAction({action: "sync"});
};

// Notification handling

ZmOrganizer.prototype.notifyDelete =
function() {
	// select next reasonable organizer if the currently selected
	// organizer is the one being deleted or a descendent of the
	// one being deleted
	var overviewController = this.tree._appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(this.type);
	var treeView = treeController.getTreeView(ZmZimbraMail._OVERVIEW_ID);
	var organizer = treeView && treeView.getSelected();
	if (organizer &&
		(organizer == this || organizer.isChildOf(this))) {
		var folderId = this.parent.id;
		if (folderId == ZmOrganizer.ID_ROOT) {
			folderId = ZmOrganizer.DEFAULT_FOLDER[this.type];
		}
		var skipNotify = false;
		treeView.setSelected(folderId, skipNotify);
	}

	// perform actual delete
	this.deleteLocal();
	this._notify(ZmEvent.E_DELETE);
};

ZmOrganizer.prototype.notifyCreate = function() {};

/*
* Handle modifications to fields that organizers have in general. Note that
* the notification object may contain multiple notifications.
*
* @param obj	[Object]	a "modified" notification
*/
ZmOrganizer.prototype.notifyModify =
function(obj) {
	var doNotify = false;
	var details = {};
	var fields = {};
	if (obj.name != null && this.name != obj.name) {
		details.oldName = this.name;
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		this.parent.children.sort(ZmTreeView.COMPARE_FUNC[this.type]);
		doNotify = true;
	}
	if (obj.u != null && this.numUnread != obj.u) {
		this.numUnread = obj.u;
		fields[ZmOrganizer.F_UNREAD] = true;
		doNotify = true;
	}
	if (obj.n != null && this.numTotal != obj.n) {
		this.numTotal = obj.n;
		fields[ZmOrganizer.F_TOTAL] = true;
		doNotify = true;
	}
	if (obj.color != null) {
		var color = ZmOrganizer.checkColor(obj.color);
		if (this.color != color) {
			this.color = color;
			fields[ZmOrganizer.F_COLOR] = true;
		}
		doNotify = true;
	}
	if (obj.f != null) {
		var oflags = this._setFlags().split("").sort().join("");
		var nflags = obj.f.split("").sort().join("");
		if (oflags != nflags) {
			this._parseFlags(obj.f);
			fields[ZmOrganizer.F_FLAGS] = true;
			doNotify = true;
		}
	}
	if (obj.rest != null && this.restUrl != obj.rest) {
		this.restUrl = obj.rest;
		fields[ZmOrganizer.F_REST_URL] = true;
		doNotify = true;
	}
	// if shares changed, do wholesale replace
	if (obj.acl) {
		this.clearShares();
		if (obj.acl.grant && obj.acl.grant.length) {
			for (var i = 0; i < obj.acl.grant.length; i++) {
				share = ZmShare.createFromJs(this, obj.acl.grant[i], this.tree._appCtxt);
				this.addShare(share);
			}
		}
		fields[ZmOrganizer.F_SHARES] = true;
		doNotify = true;
	}

	// Send out composite MODIFY change event
	if (doNotify) {
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}

	if (this.parent && obj.l != null && obj.l != this.parent.id) {
		var newParent = this._getNewParent(obj.l);
		this.reparent(newParent);
		this._notify(ZmEvent.E_MOVE);
		// could be moving search between Folders and Searches - make sure
		// it has the correct tree
		this.tree = newParent.tree;
	}
};

// Local change handling

ZmOrganizer.prototype.deleteLocal =
function() {
	this.children.removeAll();
	this.parent.children.remove(this);
};

/**
* Returns true if this organizer has a child with the given name.
*
* @param name		the name of the organizer to look for
*/
ZmOrganizer.prototype.hasChild =
function(name) {
	return this.getChild(name) ? true : false;
};

/**
* Returns the child with the given name, or null if no child has the name.
*
* @param name		the name of the organizer to look for
*/
ZmOrganizer.prototype.getChild =
function(name) {
	name = name.toLowerCase();
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++)
		if (a[i].name && (a[i].name.toLowerCase() == name))
			return a[i];

	return null;
};

/**
* Returns the child with the given path, or null if no child has the path.
*
* @param path		the path of the organizer to look for
*/
ZmOrganizer.prototype.getChildByPath =
function(path) {
	// get starting organizer
	var organizer = this;
	if (path.match(/^\//)) {
		while (organizer.id != ZmOrganizer.ID_ROOT) {
			organizer = organizer.parent;
		}
		path = path.substr(1);
	}

	// if no path, return current organizer
	if (path.length == 0) return organizer;

	// walk descendent axis to find organizer specified by path
	var parts = path.split('/');
	var i = 0;
	while (i < parts.length) {
		var part = parts[i++];
		var child = organizer.getChild(part);
		if (child == null) {
			return null;
		}
		organizer = child;
	}
	return organizer;
};

ZmOrganizer.prototype.reparent =
function(newParent) {
	this.parent.children.remove(this);
	newParent.children.add(this);
	this.parent = newParent;
};

/**
* Returns the organizer with the given ID, wherever it is.
*
* @param id		the ID to search for
*/
ZmOrganizer.prototype.getById =
function(id) {
	if (this.link && id && typeof(id) == "string") {
		var ids = id.split(":");
		if (this.zid == ids[0] && this.rid == ids[1])
			return this;
	}

	if (this.id == id)
		return this;

	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i].getById(id))
			return organizer;
	}
	return null;
};

/**
* Returns the first organizer found with the given name, starting from the root.
*
* @param name		the name to search for
*/
ZmOrganizer.prototype.getByName =
function(name) {
	return this._getByName(name.toLowerCase());
};

/**
* Returns the number of children of this organizer.
*/
ZmOrganizer.prototype.size =
function() {
	return this.children.size();
};

/**
* Returns true if the given organizer is a descendant of this one.
*
* @param organizer		a possible descendant of ours
*/
ZmOrganizer.prototype.isChildOf =
function (organizer) {
	var parent = this.parent;
	while (parent) {
		if (parent == organizer)
			return true;
		parent = parent.parent;
	}
	return false;
};

/*
* Returns the organizer with the given ID. Looks in this organizer's tree.
*
* @param parentId	[int]		ID of the organizer to find
*/
ZmOrganizer.prototype._getNewParent =
function(parentId) {
	return this.tree.getById(parentId);
};

ZmOrganizer.prototype.isUnder =
function(id) {
	if (this.id == id) return true;

	var parent = this.parent;
	while (parent && parent.id != ZmOrganizer.ID_ROOT) {
		if (parent.id == id)
			return true;
		else
			parent = parent.parent;
	}
	return false;
};

ZmOrganizer.prototype.isInTrash =
function() {
	return this.isUnder(ZmOrganizer.ID_TRASH);
};

ZmOrganizer.prototype.isReadOnly =
function() {
	var share = this.shares ? this.shares[0] : null;
	return (this.isRemote() && share && !share.isWrite());
};

ZmOrganizer.prototype.isRemote =
function() {
	return (this.zid != null || this.id.indexOf(":") != -1);
};

/**
* Returns true is this is a system tag or folder.
*/
ZmOrganizer.prototype.isSystem =
function () {
	return (this.id < ZmOrganizer.FIRST_USER_ID[this.type]);
};

/**
* Returns true if this organizer gets its contents from an external feed.
*/
ZmOrganizer.prototype.isFeed =
function () {
	return (this.url != null);
};

ZmOrganizer.prototype.getOwner =
function() {
	return this.owner;
};

ZmOrganizer.getSortIndex =
function(child, sortFunction) {
	if (!sortFunction) return null;
	var children = child.parent.children.getArray();
	for (var i = 0; i < children.length; i++) {
		var test = sortFunction(child, children[i]);
		if (test == -1)
			return i;
	}
	return i;
};

/*
* Sends a request to the server. Note that it's done asynchronously, but
* there is no callback given. Hence, an organizer action is the last thing
* done before returning to the event loop. The result of the action is
* handled via notifications.
*
* @param action		[string]			operation to perform
* @param attrs		[Object]			hash of additional attributes to set in the request
* @param batchCmd	[ZmBatchCommand]*	batch command that contains this request
*/
ZmOrganizer.prototype._organizerAction =
function(params) {
	var cmd = ZmOrganizer.SOAP_CMD[this.type];
	var soapDoc = AjxSoapDoc.create(cmd + "Request", "urn:zimbraMail");
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", params.action);
	actionNode.setAttribute("id", this.id);
	for (var attr in params.attrs) {
		actionNode.setAttribute(attr, params.attrs[attr]);
	}
	var respCallback = new AjxCallback(this, this._handleResponseOrganizerAction, params);
	if (params.batchCmd) {
		params.batchCmd.addRequestParams(soapDoc, respCallback, params.errorCallback);
	} else {
		this.tree._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
														   callback: respCallback, errorCallback: params.errorCallback });
	}
};

ZmOrganizer.prototype._handleResponseOrganizerAction =
function(params, result) {
	if (params.callback) {
		params.callback.run(result);
	}
};

// Test the name of this organizer and then descendants against the given name, case insensitively
ZmOrganizer.prototype._getByName =
function(name) {
	if (this.name && name == this.name.toLowerCase())
		return this;

	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByName(name))
			return organizer;
	}
	return null;
};

// Takes a string of flag chars and applies them to this organizer.
ZmOrganizer.prototype._parseFlags =
function(str) {
	for (var i = 0; i < ZmOrganizer.ALL_FLAGS.length; i++) {
		var flag = ZmOrganizer.ALL_FLAGS[i];
		this[ZmOrganizer.FLAG_PROP[flag]] = (str && (str.indexOf(flag) != -1)) ? true : false;
	}
};

// Converts this organizer's flag-related props into a string of flag chars.
ZmOrganizer.prototype._setFlags =
function() {
	var flags = "";
	for (var i = 0; i < ZmOrganizer.ALL_FLAGS.length; i++) {
		var flag = ZmOrganizer.ALL_FLAGS[i];
		var prop = ZmOrganizer.FLAG_PROP[flag];
		if (this[prop]) {
			flags = flags + flag;
		}
	}
	return flags;
};

ZmOrganizer.prototype.addChangeListener =
function(listener) {
	this.tree.addChangeListener(listener);
};

ZmOrganizer.prototype.removeChangeListener =
function(listener) {
	this.tree.removeChangeListener(listener);
};

ZmOrganizer.prototype._setSharesFromJs =
function(obj) {
	if (obj.acl && obj.acl.grant && obj.acl.grant.length > 0) {
		var shares = new Array(obj.acl.grant.length);
		for (var i = 0; i < obj.acl.grant.length; i++) {
			var grant = obj.acl.grant[i];
			shares[i] = ZmShare.createFromJs(this, grant, this.tree._appCtxt);
		}
		this.setShares(shares);
	}
};

// Handle notifications through the tree
ZmOrganizer.prototype._notify =
function(event, details) {
	if (details)
		details.organizers = [this];
	else
		details = {organizers: [this]};
	this.tree._notify(event, details);
};

/**
* Returns a marked-up version of the name.
*
* @param name			the name to mark up
* @param showUnread		whether to display the number of unread items (in parens)
* @param noMarkup		if true, don't return any HTML
*/
ZmOrganizer.prototype._markupName = 
function(name, showUnread, noMarkup) {
	if (!noMarkup)
		name = AjxStringUtil.htmlEncode(name, true);
	if (showUnread && this.numUnread > 0) {
		name = [name, " (", this.numUnread, ")"].join("");
		if (!noMarkup)
			name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
	}
	if (this.noSuchFolder && !noMarkup) {
		name = ["<del>", name, "</del>"].join("");
	}
	return name;
};

