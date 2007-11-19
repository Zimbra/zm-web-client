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
* @param color		[constant]		color for this organizer
* @param numUnread	[int]*			number of unread items for this organizer
* @param numTotal	[int]*			number of items for this organizer
* @param sizeTotal	[int]*			total size of organizer's items
* @param url		[string]*		URL for this organizer's feed
* @param owner		[string]* 		Owner for this organizer
* @param zid		[string]*		Zimbra ID of owner, if remote folder
* @param rid		[string]*		Remote ID of organizer, if remote folder
* @param restUrl	[string]*		REST URL of this organizer.
*/
ZmOrganizer = function(params) {

	if (arguments.length == 0) { return; }
	
	this.type = params.type;
	var id = this.id = params.id;
	// save the local ID, for comparing against system IDs
	this.nId = ZmOrganizer.normalizeId(id);
	this.name = ZmFolder.MSG_KEY[id] ? ZmMsg[ZmFolder.MSG_KEY[id]] : params.name;
	this.parent = params.parent;
	this.tree = params.tree;
	this.color = params.color || ZmOrganizer.ORG_COLOR[id] || ZmOrganizer.DEFAULT_COLOR[this.type];
	this.numUnread = params.numUnread || 0;
	this.numTotal = params.numTotal || 0;
	this.sizeTotal = params.sizeTotal || 0;
	this.url = params.url;
	this.owner = params.owner;
	this.link = Boolean(params.zid);
	this.zid = params.zid;
	this.rid = params.rid;
	this.restUrl = params.restUrl;
	if (params.perm) this.setPermissions(params.perm);
	this.noSuchFolder = false; // Is this a link to some folder that ain't there.

	if (id && params.tree) {
		appCtxt.cacheSet(id, this);
		if (this.link) {
			// also store under ID that items use for parent folder ("l" attribute in node)
			appCtxt.cacheSet([this.zid, this.rid].join(":"), this);
		}
	}

	this.children = new AjxVector();
};

// global organizer types
ZmOrganizer.TAG					= ZmEvent.S_TAG;
ZmOrganizer.SEARCH				= ZmEvent.S_SEARCH;
ZmOrganizer.MOUNTPOINT			= ZmEvent.S_MOUNTPOINT;

// folder IDs defined in com.zimbra.cs.mailbox.Mailbox
ZmOrganizer.ID_ROOT				= 1;
ZmOrganizer.ID_INBOX			= 2;
ZmOrganizer.ID_TRASH			= 3;
ZmOrganizer.ID_SPAM				= 4;
ZmOrganizer.ID_ADDRBOOK			= 7;
ZmOrganizer.ID_CALENDAR			= 10;
ZmOrganizer.ID_NOTEBOOK			= 12;
ZmOrganizer.ID_AUTO_ADDED 		= 13;
ZmOrganizer.ID_CHATS			= 14;
ZmOrganizer.ID_TASKS			= 15;
ZmOrganizer.ID_BRIEFCASE		= 16;
ZmOrganizer.ID_ARCHIVE    		= 253;
ZmOrganizer.ID_OUTBOX    		= 254;
ZmOrganizer.ID_ZIMLET			= -1000;	// zimlets need a range.  start from -1000 incrementing up.
ZmOrganizer.ID_ROSTER_LIST		= -11;
ZmOrganizer.ID_ROSTER_TREE_ITEM	= -13;
ZmOrganizer.ID_MY_CARD			= -15;

ZmOrganizer.MSG_KEY 			= {};		// keys for org names
ZmOrganizer.ITEM_ORGANIZER 		= {};		// primary organizer for item types
ZmOrganizer.DEFAULT_FOLDER 		= {};		// default folder for org type
ZmOrganizer.SOAP_CMD 			= {};		// SOAP command for modifying an org
ZmOrganizer.FIRST_USER_ID 		= {};		// lowest valid user ID for an org type
ZmOrganizer.PRECONDITION 		= {};		// setting that this org type depends on

// fields that can be part of a displayed organizer
ZmOrganizer.F_NAME				= "name";
ZmOrganizer.F_UNREAD			= "unread";
ZmOrganizer.F_TOTAL				= "total";
ZmOrganizer.F_SIZE				= "size";
ZmOrganizer.F_COLOR				= "color";
ZmOrganizer.F_QUERY				= "query";
ZmOrganizer.F_SHARES			= "shares";
ZmOrganizer.F_FLAGS				= "flags";
ZmOrganizer.F_REST_URL			= "rest";

// server representation of org flags
ZmOrganizer.FLAG_CHECKED			= "#";
ZmOrganizer.FLAG_IMAP_SUBSCRIBED	= "*";
ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY	= "b";
ZmOrganizer.ALL_FLAGS = [ZmOrganizer.FLAG_CHECKED, ZmOrganizer.FLAG_IMAP_SUBSCRIBED,
						 ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY];

// org property for each flag
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

// color constants (server stores a number)
ZmOrganizer.C_NONE				= 0;
ZmOrganizer.C_BLUE				= 1;
ZmOrganizer.C_CYAN				= 2;
ZmOrganizer.C_GREEN				= 3;
ZmOrganizer.C_PURPLE			= 4;
ZmOrganizer.C_RED				= 5;
ZmOrganizer.C_YELLOW			= 6;
ZmOrganizer.C_PINK				= 7;
ZmOrganizer.C_GRAY				= 8;
ZmOrganizer.C_ORANGE			= 9;
ZmOrganizer.MAX_COLOR			= ZmOrganizer.C_ORANGE;
ZmOrganizer.ORG_DEFAULT_COLOR 	= ZmOrganizer.C_ORANGE;

// color names
ZmOrganizer.COLOR_TEXT = {};
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_NONE]		= ZmMsg.none;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_ORANGE]	= ZmMsg.orange;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_BLUE]		= ZmMsg.blue;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_CYAN]		= ZmMsg.cyan;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GREEN]		= ZmMsg.green;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PURPLE]	= ZmMsg.purple;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_RED]		= ZmMsg.red;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_YELLOW]	= ZmMsg.yellow;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_PINK]		= ZmMsg.pink;
ZmOrganizer.COLOR_TEXT[ZmOrganizer.C_GRAY]		= ZmMsg.gray;

// list of colors and text for populating a color select menu
ZmOrganizer.COLORS = [];
ZmOrganizer.COLOR_CHOICES = [];
(function() {
	for (var i = 0; i <= ZmOrganizer.MAX_COLOR; i++) {
		var color = ZmOrganizer.COLOR_TEXT[i];
		ZmOrganizer.COLORS.push(color);
		ZmOrganizer.COLOR_CHOICES.push( { value:i, label:color } );
	}
})();


ZmOrganizer.HAS_COLOR 		= {};		// whether an org uses colors
ZmOrganizer.DEFAULT_COLOR 	= {};		// default color for each org type
ZmOrganizer.ORG_COLOR 		= {};		// color overrides by ID
ZmOrganizer.APP 			= {};		// App responsible for organizer
ZmOrganizer.ORG_CLASS 		= {};		// constructor for organizer
ZmOrganizer.ORG_PACKAGE 	= {};		// package required to construct organizer
ZmOrganizer.CREATE_FUNC 	= {};		// function that creates this organizer
ZmOrganizer.LABEL 			= {};		// msg key for text for tree view header item
ZmOrganizer.ITEMS_KEY 		= {};		// msg key for text describing contents
ZmOrganizer.TREE_TYPE 		= {};		// type of server data tree that contains this type of organizer
ZmOrganizer.VIEWS 			= {};		// views by type
ZmOrganizer.TYPE 			= {};		// types by view (reverse map of above)
ZmOrganizer.FOLDER_KEY 		= {};		// keys for label "[org] folder"
ZmOrganizer.MOUNT_KEY 		= {}		// keys for label "mount [org]"
ZmOrganizer.DEFERRABLE 		= {};		// creation can be deferred to app launch

// Abstract methods

/**
 * Stores information about the given organizer type.
 * 
 * @param org				[constant]	organizer type
 * @param params			[hash]		hash of params:
 *        app				[constant]	app that handles this org type
 *        nameKey			[string]	msg key for org name
 *        precondition		[constant]	setting that this org type depends on
 *        defaultFolder		[int]		ID of default folder for this org
 *        soapCmd			[string]	SOAP command for acting on this org
 *        firstUserId		[int]		minimum ID for a user instance of this org
 *        orgClass			[string]	name of constructor for this org
 *        orgPackage		[string]	name of smallest package with org class
 *        treeController	[string]	name of associated tree controller
 *        labelKey			[string]	msg key for label in overview
 *        itemsKey			[string]	msg key for text describing contents
 *        hasColor			[boolean]	true if org has color associated with it
 *        defaultColor		[constant]	default color for org in overview
 *        orgColor			[array]		color override by ID (in pairs)
 *        treeType			[constant]	type of data tree (from server) that contains this org
 *        views				[string]	associated folder views (JSON)
 *        folderKey			[string]	msg key for folder props dialog
 *        mountKey			[string]	msg key for folder mount dialog
 *        createFunc		[string]	name of function for creating this org
 *        compareFunc		[string]	name of function for comparing instances of this org
 *        deferrable		[boolean]	true if creation can be deferred to app launch
 *        shortcutKey		[string]	letter encoding of this org type for custom shortcuts
 */
ZmOrganizer.registerOrg =
function(org, params) {
	if (params.nameKey)			{ ZmOrganizer.MSG_KEY[org]				= params.nameKey; }
	if (params.app)				{ ZmOrganizer.APP[org]					= params.app; }
	if (params.defaultFolder)	{ ZmOrganizer.DEFAULT_FOLDER[org]		= params.defaultFolder; }
	if (params.precondition)	{ ZmOrganizer.PRECONDITION[org]			= params.precondition; }
	if (params.soapCmd)			{ ZmOrganizer.SOAP_CMD[org]				= params.soapCmd; }
	if (params.firstUserId)		{ ZmOrganizer.FIRST_USER_ID[org]		= params.firstUserId; }
	if (params.orgClass)		{ ZmOrganizer.ORG_CLASS[org]			= params.orgClass; }
	if (params.orgPackage)		{ ZmOrganizer.ORG_PACKAGE[org]			= params.orgPackage; }
	if (params.labelKey)		{ ZmOrganizer.LABEL[org]				= params.labelKey; }
	if (params.itemsKey)		{ ZmOrganizer.ITEMS_KEY[org]			= params.itemsKey; }
	if (params.hasColor)		{ ZmOrganizer.HAS_COLOR[org]			= params.hasColor; }
	if (params.views)			{ ZmOrganizer.VIEWS[org]				= params.views; }
	if (params.folderKey)		{ ZmOrganizer.FOLDER_KEY[org]			= params.folderKey; }
	if (params.mountKey)		{ ZmOrganizer.MOUNT_KEY[org]			= params.mountKey; }
	if (params.deferrable)		{ ZmOrganizer.DEFERRABLE[org]			= params.deferrable; }

	if (!appCtxt.isChildWindow) {
		if (params.compareFunc)		{ ZmTreeView.COMPARE_FUNC[org]			= params.compareFunc; }
		if (params.treeController)	{ ZmOverviewController.CONTROLLER[org]	= params.treeController; }
	}

	ZmOrganizer.TREE_TYPE[org] = params.treeType || org;	// default to own type

	ZmOrganizer.CREATE_FUNC[org]	= params.createFunc || "ZmOrganizer.create";

	if (params.hasColor) {
		ZmOrganizer.DEFAULT_COLOR[org]	= (params.defaultColor != null) ? params.defaultColor :
																		  ZmOrganizer.ORG_DEFAULT_COLOR;
	}
	
	if (params.orgColor) {
		for (var id in params.orgColor) {
			ZmOrganizer.ORG_COLOR[id] = params.orgColor[id];
		}
	}
	
	if (params.shortcutKey) {
		ZmShortcut.ORG_KEY[org] = params.shortcutKey;
		ZmShortcut.ORG_TYPE[params.shortcutKey] = org;
	}
};

ZmOrganizer.sortCompare = function(organizerA, organizerB) {};

/**
 * Generic function for creating an organizer via CreateFolderRequest. Attribute pairs can
 * be passed in and will become attributes of the folder node in the request.
 * 
 * @param params	[hash]			attribute pairs
 */
ZmOrganizer.create =
function(params) {
	// create SOAP command
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");

	var errorCallback = params.errorCallback || new AjxCallback(null, ZmOrganizer._handleErrorCreate, params);
	var type = params.type;

	// set attributes
	params.view = params.view || ZmOrganizer.VIEWS[type] ? ZmOrganizer.VIEWS[type][0] : null;
	for (var i in params) {
		if (i == "type" || i == "errorCallback") { continue; }
		var value = params[i];
		if (i == "color") {
			// no need to save color if missing or default
			if (!value || (value == ZmOrganizer.DEFAULT_COLOR[type])) {
				value = null;
			}
		}
		if (value) {
			folderNode.setAttribute(i, value);
		}
	}

	return appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmOrganizer._handleErrorCreate =
function(params, ex) {
	if (!params.url && !params.name) { return false; }
	
	var msg;
	if (params.name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [params.name]);
	} else if (params.url) {
		var errorMsg = (ex.code == ZmCsfeException.SVC_RESOURCE_UNREACHABLE) ? ZmMsg.feedUnreachable : ZmMsg.feedInvalid;
		msg = AjxMessageFormat.format(errorMsg, params.url);
	}

	if (msg) {
		ZmOrganizer._showErrorMsg(msg);
		return true;
	}

	return false;
};

ZmOrganizer._showErrorMsg =
function(msg) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup();
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
// make static
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
	var organizer = appCtxt.getById(folderId);
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
	return ZmOrganizer.VIEWS[organizerType][0];
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
	if (name.length == 0) {	return ZmMsg.nameEmpty; }

	if (name.length > ZmOrganizer.MAX_NAME_LENGTH) {
		return AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);
	}

	if (!ZmOrganizer.VALID_NAME_RE.test(name)) {
		return AjxMessageFormat.format(ZmMsg.errorInvalidName, name);
	}

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
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR))
		? color : ZmOrganizer.ORG_DEFAULT_COLOR;
};

/**
 * Returns the system ID for the given system ID and account. Unless this
 * is a child account, the system ID is returned unchanged. For child
 * accounts, the ID consists of the account ID and the local ID.
 * 
 * @param id		[int]			ID of a system organizer
 * @param account	[ZmZimbraAccount]*	an account
 */
ZmOrganizer.getSystemId =
function(id, account) {
	account = account || appCtxt.getActiveAccount();
	return (account && !account.isMain) ? [account.id, id].join(":") : id;
};

/**
 * Strips the account ID portion from a system ID for a child account, which
 * can then be used to check against known system IDs. Any non-system ID is
 * returned unchanged (if type is provided).
 * 
 * @param id	[string]		ID of an organizer
 * @param type	[constant]		type of organizer
 */
ZmOrganizer.normalizeId =
function(id, type) {
	if (typeof(id) != "string") { return id; }
	var idx = id.indexOf(":");
	var localId = (idx == -1) ? id : id.substr(idx + 1);
	return (type && (localId >= ZmOrganizer.FIRST_USER_ID[type])) ? id : localId;
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
	while (parent && ((parent.nId != ZmOrganizer.ID_ROOT) || includeRoot)) {
		path = parent.getName(showUnread, maxLength, noMarkup, useSystemName) + ZmFolder.SEP + path;
		parent = parent.parent;
	}
	
	return path;
};

/**
 * Folder tooltip shows number of items and total size.
 *
 * @param force		[boolean]*		if true, don't use cached tooltip
 */
ZmOrganizer.prototype.getToolTip =
function(force) {
	if (this.numTotal == null || this.isRemote()) { return ""; }
	if (!this._tooltip || force) {
		var subs = {itemText:this._getItemsText(), numTotal:this.numTotal, sizeTotal:this.sizeTotal};
		this._tooltip = AjxTemplate.expand("share.App#FolderTooltip", subs);
	}
	return this._tooltip;
};

/** Returns the full path, suitable for use in search expressions. */
ZmOrganizer.prototype.getSearchPath =
function() {
	return (this.nId != ZmOrganizer.ID_ROOT) ? this.getPath(null, null, null, true) : "/";
};

/** @deprecated Use getRestUrl. */
ZmOrganizer.prototype.getUrl =
function() {
	return this.getRestUrl();
};

ZmOrganizer.prototype.getSyncUrl =
function() {
	return url;
};

ZmOrganizer.prototype.getRemoteId =
function() {
	if (!this._remoteId) {
		this._remoteId = this.isRemote() ? this.zid + ":" + this.rid : this.id;
	}
	return this._remoteId;
}

ZmOrganizer.prototype.getRestUrl =
function() {
	// return REST URL as seen by server
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
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

ZmOrganizer.prototype.supportsPublicAccess =
function() {
	// overload per organizer type
	return true;
};

// XXX: temp method until we get better *server* support post Birdseye! (see bug #4434)
// DO NOT REMOVE OR I WILL HUNT YOU DOWN AND SHOOT YOU.
ZmOrganizer.prototype.setPermissions =
function(permission) {
	if (this.shares == null) {
		AjxDispatcher.require("Share");
		var share = new ZmShare({organizer:this, perm:permission});
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
function(name, callback, errorCallback, batchCmd) {
	if (name == this.name) { return };
	var params = {
		action: "rename",
		attrs: {name: name},
		callback: callback,
		errorCallback: errorCallback,
		batchCmd: batchCmd
	};
	this._organizerAction(params);
};

ZmOrganizer.prototype.setColor =
function(color, callback, errorCallback) {
	var color = ZmOrganizer.checkColor(color);
	if (this.color == color) { return; }
	if (color == ZmOrganizer.DEFAULT_COLOR[this.type]) {
		color = 0;
	}
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
	var newId = (newParent.nId > 0) ? newParent.id : ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
	if ((newId == this.id || newId == this.parent.id) ||
		(this.type == ZmOrganizer.FOLDER && (ZmOrganizer.normalizeId(newId, this.type) == ZmFolder.ID_SPAM)) ||
		(newParent.isChildOf(this)))
	{
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
					 (this.nId == ZmFolder.ID_SPAM || this.nId == ZmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.isSystem() && !isEmptyOp) return;

	var action = isEmptyOp ? "empty" : "delete";
	this._organizerAction({action: action});
};

ZmOrganizer.prototype._empty = 
function(){
	DBG.println(AjxDebug.DBG1, "emptying: " + this.name + ", ID: " + this.id);
	var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK) &&
					  (this.id == ZmFolder.ID_SPAM || this.id == ZmFolder.ID_TRASH));
	// make sure we're not emptying a system object (unless it's SPAM or TRASH)
	if (this.isSystem() && !isEmptyOp) return;
	var params = {action:"empty"};
	if (this.id == ZmFolder.ID_TRASH) {
		params.attrs = {recursive:"true"};
	}
	if (this.isRemote()) {
		params.id = this.getRemoteId();
	}
	this._organizerAction(params);
};


ZmOrganizer.prototype.markAllRead =
function() {
	var id = this.isRemote() ? this.getRemoteId() : null;
	this._organizerAction({action: "read", id: id, attrs: {l: this.id}});
};

ZmOrganizer.prototype.sync =
function() {
	this._organizerAction({action: "sync"});
};

// Notification handling

ZmOrganizer.prototype.notifyDelete =
function() {
	// select next reasonable organizer if the currently selected
	// organizer is the one being deleted or is a descendent of the
	// one being deleted
	var overviewController = appCtxt.getOverviewController();
	var treeController = overviewController.getTreeController(this.type);
	var overviewId = appCtxt.getCurrentApp().getOverviewId();
	var treeView = treeController.getTreeView(overviewId);
	var organizer = treeView && treeView.getSelected();
	if (organizer && (organizer == this || organizer.isChildOf(this))) {
		var folderId = this.parent.id;
		if (this.parent.nId == ZmOrganizer.ID_ROOT) {
			folderId = ZmOrganizer.getSystemId(ZmOrganizer.DEFAULT_FOLDER[this.type]);
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
* @param obj		[object]	a "modified" notification
* @param details	[hash]*		event details
*/
ZmOrganizer.prototype.notifyModify =
function(obj, details) {
	var doNotify = false;
	var details = details || {};
	var fields = {};
	if (obj.name != null && this.name != obj.name) {
		details.oldName = this.name;
		this.name = obj.name;
		fields[ZmOrganizer.F_NAME] = true;
		this.parent.children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
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
	if (obj.s != null && this.sizeTotal != obj.s) {
		this.sizeTotal = obj.s;
		fields[ZmOrganizer.F_SIZE] = true;
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
			AjxDispatcher.require("Share");
			for (var i = 0; i < obj.acl.grant.length; i++) {
				share = ZmShare.createFromJs(this, obj.acl.grant[i]);
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

/**
 * Cleans up a deleted organizer:
 * 	- remove from parent's list of children
 * 	- remove from item cache
 * 	- perform above two steps for each child
 * 	- clear list of children
 */
ZmOrganizer.prototype.deleteLocal =
function() {
	this.parent.children.remove(this);
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		var org = a[i];
		if (org) { org.deleteLocal(); }
	}
	this.children.removeAll();
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
	for (var i = 0; i < sz; i++) {
		if (a[i].name && (a[i].name.toLowerCase() == name)) {
			return a[i];
		}
	}

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
		while (organizer.nId != ZmOrganizer.ID_ROOT) {
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
	if (this.parent) {
		this.parent.children.remove(this);
	}
	newParent.children.add(this);
	this.parent = newParent;
};

/**
* Returns the organizer with the given ID, searching recursively through
* child organizers. The preferred method for getting an organizer by ID
* is to use appCtxt.getById().
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

	if (this.nId == id) {
		return this;
	}

	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i].getById(id)) {
			return organizer;
		}
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
* Returns a list of organizers with the given type
*
* @param type			[constant]	the desired organizer type
*/
ZmOrganizer.prototype.getByType =
function(type) {
	var list = [];
	this._getByType(type, list);
	return list;
};

ZmOrganizer.prototype._getByType =
function(type, list) {
	if (this.type == type) {
		list.push(this);
	}
	var a = this.children.getArray();
	for (var i = 0; i < a.length; i++) {
		a[i]._getByType(type, list);
	}
};

/**
* Returns the organizer with the given path
*
* @param path			[string]	the path to search for
* @param useSystemName	[boolean]*	if true, use untranslated version of system folder names
*/
ZmOrganizer.prototype.getByPath =
function(path, useSystemName) {
	return this._getByPath(path.toLowerCase(), useSystemName);
};

// Test the path of this folder and then descendants against the given path, case insensitively
ZmOrganizer.prototype._getByPath =
function(path, useSystemName) {
	if (this.nId == ZmFolder.ID_TAGS) { return null; }

	if (path == this.getPath(false, false, null, true, useSystemName).toLowerCase()) {
		return this;
	}
		
	var a = this.children.getArray();
	for (var i = 0; i < a.length; i++) {
		var organizer = a[i]._getByPath(path, useSystemName);
		if (organizer) {
			return organizer;
		}
	}
	return null;	
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
		if (parent == organizer) {
			return true;
		}
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
	return appCtxt.getById(parentId);
};

ZmOrganizer.prototype.isUnder =
function(id) {
	if (this.id == id) return true;

	var parent = this.parent;
	while (parent && parent.nId != ZmOrganizer.ID_ROOT) {
		if (parent.id == id) {
			return true;
		} else {
			parent = parent.parent;
		}
	}
	return false;
};

ZmOrganizer.prototype.isInTrash =
function() {
	return this.isUnder(ZmOrganizer.ID_TRASH);
};

ZmOrganizer.prototype.isReadOnly =
function() {
	if (!this._isReadOnly) {
		var share = this.shares ? this.shares[0] : null;
		this._isReadOnly = (this.isRemote() && share && !share.isWrite());
	}
	return this._isReadOnly;
};

ZmOrganizer.prototype.isRemote =
function() {
	if (this._isRemote == null) {
		if (this.zid != null) {
			this._isRemote = true;
		} else {
			var acct = appCtxt.getActiveAccount();
			var id = String(this.id);
			this._isRemote = ((id.indexOf(":") != -1) && (id.indexOf(acct.id) != 0));
		}
	}
	return this._isRemote;
};

/**
* Returns true is this is a system tag or folder.
*/
ZmOrganizer.prototype.isSystem =
function () {
	return (this.nId < ZmOrganizer.FIRST_USER_ID[this.type]);
};

/**
* Returns true if this organizer gets its contents from an external feed.
*/
ZmOrganizer.prototype.isFeed =
function () {
	return (this.url != null);
};


/**
* Returns true if this folder maps to a datasource. If type is given, returns
* true if folder maps to a datasource *and* is of the given type.
*
* @type			[Int]*		Either ZmAccount.POP or ZmAccount.IMAP
* @checkParent	[Boolean]*	walk up the parent chain
*/
ZmOrganizer.prototype.isDataSource =
function(type, checkParent) {
	if (!appCtxt.get(ZmSetting.MAIL_ENABLED)) { return false };

	var dsc = appCtxt.getDataSourceCollection();
	var dataSource = dsc.getByFolderId(this.nId);

	if (!dataSource) {
		return (checkParent && this.parent)
			? this.parent.isDataSource(type, checkParent)
			: false;
	}

	return (type)
		? (dataSource.type == type)
		: true;
};

ZmOrganizer.prototype.getOwner =
function() {
	return this.owner;
};

ZmOrganizer.getSortIndex =
function(child, sortFunction) {
	if (!(child && child.parent && sortFunction)) { return null };
	var children = child.parent.children.getArray();
	for (var i = 0; i < children.length; i++) {
		var test = sortFunction(child, children[i]);
		if (test == -1) {
			return i;
		}
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
	actionNode.setAttribute("id", params.id || this.id);
	for (var attr in params.attrs) {
		actionNode.setAttribute(attr, params.attrs[attr]);
	}
	var respCallback = new AjxCallback(this, this._handleResponseOrganizerAction, params);
	if (params.batchCmd) {
		params.batchCmd.addRequestParams(soapDoc, respCallback, params.errorCallback);
	} else {
		appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true,
											    callback:respCallback, errorCallback:params.errorCallback});
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
	if (this.name && name == this.name.toLowerCase()) {
		return this;
	}

	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByName(name)) {
			return organizer;
		}
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
		AjxDispatcher.require("Share");
		var shares = [];
		for (var i = 0; i < obj.acl.grant.length; i++) {
			var grant = obj.acl.grant[i];
			shares[i] = ZmShare.createFromJs(this, grant);
		}
		this.setShares(shares);
	}
};

// Handle notifications through the tree
ZmOrganizer.prototype._notify =
function(event, details) {
	if (details) {
		details.organizers = [this];
	} else {
		details = {organizers: [this]};
	}
	this.tree._evt.type = this.type;	// all folder types are in a single tree
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
	if (!noMarkup) {
		name = AjxStringUtil.htmlEncode(name, true);
	}
	if (showUnread && this.numUnread > 0) {
		name = [name, " (", this.numUnread, ")"].join("");
		if (!noMarkup) {
			name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
		}
	}
	if (this.noSuchFolder && !noMarkup) {
		name = ["<del>", name, "</del>"].join("");
	}
	return name;
};

ZmOrganizer.prototype._getItemsText =
function() {
	var result = ZmMsg[ZmOrganizer.ITEMS_KEY[this.type]];
	if (!result || (this.nId == ZmFolder.ID_TRASH)) {
		result = ZmMsg.items;
	}
	return result;
};
