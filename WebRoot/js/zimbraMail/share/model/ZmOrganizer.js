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
 * This file defines an organizer.
 */

/**
* Creates an empty organizer.
* @class
* This class represents an "organizer", which is something used to classify or contain
* items. So far, that's either a tag or a folder. Tags and folders are represented as
* a tree structure, though tags are flat and have only one level below the root. Folders
* can be nested.
*
* @author Conrad Damon
*
* @param	{Hash}	params		a hash of parameters
* @param {constant}	params.type		the organizer type
* @param {int}		params.id			the numeric ID
* @param {String}	params.name		the name
* @param {ZmOrganizer}	params.parent		the parent organizer
* @param {ZmTree}	params.tree		the tree model that contains this organizer
* @param {constant}	params.color		the color for this organizer
* @param {String}	params.rgb		the color for this organizer, as HTML RGB value
* @param {Boolean}	params.link		<code>true</code> if this organizer is shared
* @param {Boolean}	params.broken		<code>true</code> if this link is broken
* @param {int}	params.numUnread	the number of unread items for this organizer
* @param {int}	params.numTotal	the number of items for this organizer
* @param {Boolean}	params.noTooltip	do not show tooltip 
* @param {int}	params.sizeTotal	the total size of organizer's items
* @param {String}	params.url		the URL for this organizer's feed
* @param {String}	params.owner		the owner for this organizer
* @param {String}	params.oname		the owner's name for this organizer
* @param {String}	params.zid		the Zimbra ID of owner, if remote folder
* @param {String}	params.rid		the remote ID of organizer, if remote folder
* @param {String}	params.restUrl	the REST URL of this organizer.
* @param {String}	params.newOp		the name of operation run by button in overview header
* @param {ZmZimbraAccount}	params.account	the account this organizer belongs to
*/
ZmOrganizer = function(params) {

	if (arguments.length == 0) { return; }

	this.type = params.type;
	var id = this.id = params.id;
	this.nId = ZmOrganizer.normalizeId(id);
	this.name = ZmFolder.MSG_KEY[this.nId] ? ZmMsg[ZmFolder.MSG_KEY[this.nId]] : params.name;
	this._systemName = this.nId < 256 && params.name;
	this.parent = params.parent;
	this.tree = params.tree;
	this.numUnread = params.numUnread || 0;
	this.numTotal = params.numTotal || 0;
	this.noTooltip = params.noTooltip;
	this.sizeTotal = params.sizeTotal || 0;
	this.url = params.url;
	this.owner = params.owner;
	this.oname = params.oname;
	this.link = params.link || (Boolean(params.zid)) || (this.parent && this.parent.link);
	this.isMountpoint = params.link;
	this.zid = params.zid;
	this.rid = params.rid;
	this.restUrl = params.restUrl;
	this.account = params.account;
    this.perm = params.perm;
	this.noSuchFolder = params.broken; // Is this a link to some folder that ain't there.
	this._isAdmin = this._isReadOnly = this._hasPrivateAccess = null;
    this.retentionPolicy = params.retentionPolicy;
	this.webOfflineSyncDays = params.webOfflineSyncDays;

	this.color =
        params.color ||
        (this.parent && this.parent.color) ||
        ZmOrganizer.ORG_COLOR[id] ||
        ZmOrganizer.ORG_COLOR[this.nId] ||
        ZmOrganizer.DEFAULT_COLOR[this.type] ||
        ZmOrganizer.C_NONE
    ;
	this.isColorCustom = params.rgb != null; //set so we know if the user chose a custom color (to distiguish from basic color or none
	this.rgb =
        params.rgb ||
        ZmOrganizer.COLOR_VALUES[this.color] ||
        ZmOrganizer.COLOR_VALUES[ZmOrganizer.ORG_DEFAULT_COLOR]
    ;

	if (appCtxt.isOffline && !this.account && this.id == this.nId) {
		this.account = appCtxt.accountList.mainAccount;
	}

	if (id && params.tree) {
		appCtxt.cacheSet(id, this);
		if (this.link) {
			// also store under ID that items use for parent folder ("l" attribute in node)
			appCtxt.cacheSet([this.zid, this.rid].join(":"), this);
		}
	}

	this.children = new AjxVector();
};

ZmOrganizer.prototype.isZmOrganizer = true;
ZmOrganizer.prototype.toString = function() { return "ZmOrganizer"; };

// global organizer types
ZmOrganizer.TAG					= ZmEvent.S_TAG;
ZmOrganizer.SEARCH				= ZmEvent.S_SEARCH;
ZmOrganizer.SHARE               = ZmEvent.S_SHARE;
ZmOrganizer.MOUNTPOINT			= ZmEvent.S_MOUNTPOINT;
ZmOrganizer.ZIMLET				= ZmEvent.S_ZIMLET;

// folder IDs defined in com.zimbra.cs.mailbox.Mailbox
// Note: since these are defined as Numbers, and IDs come into our system as Strings,
// we need to use == for comparisons (instead of ===, which will fail)
ZmOrganizer.ID_ROOT				= 1;
ZmOrganizer.ID_INBOX			= 2;
ZmOrganizer.ID_TRASH			= 3;
ZmOrganizer.ID_SPAM				= 4;
ZmOrganizer.ID_ADDRBOOK			= 7;
ZmOrganizer.ID_CALENDAR			= 10;
ZmOrganizer.ID_AUTO_ADDED 		= 13;
ZmOrganizer.ID_CHATS			= 14;
ZmOrganizer.ID_TASKS			= 15;
ZmOrganizer.ID_BRIEFCASE		= 16;
ZmOrganizer.ID_ALL_MAILBOXES	= 249; 
ZmOrganizer.ID_NOTIFICATION_MP	= 250;
ZmOrganizer.ID_SYNC_FAILURES	= 252;		// offline only
ZmOrganizer.ID_OUTBOX    		= 254;		// offline only
ZmOrganizer.ID_ZIMLET			= -1000;	// zimlets need a range.  start from -1000 incrementing up.
ZmOrganizer.ID_ATTACHMENTS		= -17;		// Attachments View
ZmOrganizer.ID_DLS				= -18;

// fields that can be part of a displayed organizer
ZmOrganizer.F_NAME				= "name";
ZmOrganizer.F_UNREAD			= "unread";
ZmOrganizer.F_TOTAL				= "total";
ZmOrganizer.F_SIZE				= "size";
ZmOrganizer.F_COLOR				= "color";
ZmOrganizer.F_RGB				= "rgb";
ZmOrganizer.F_QUERY				= "query";
ZmOrganizer.F_SHARES			= "shares";
ZmOrganizer.F_FLAGS				= "flags";
ZmOrganizer.F_REST_URL			= "rest";
ZmOrganizer.F_PERMS				= "perms";
ZmOrganizer.F_RNAME				= "rname";	// remote name

// server representation of org flags
ZmOrganizer.FLAG_CHECKED			= "#";
ZmOrganizer.FLAG_DISALLOW_SUBFOLDER	= "o";
ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY	= "b";
ZmOrganizer.FLAG_IMAP_SUBSCRIBED	= "*";
ZmOrganizer.FLAG_OFFLINE_GLOBAL		= "g";
ZmOrganizer.FLAG_OFFLINE_SYNCABLE	= "y";
ZmOrganizer.FLAG_OFFLINE_SYNCING	= "~";
ZmOrganizer.ALL_FLAGS = [
	ZmOrganizer.FLAG_CHECKED,
	ZmOrganizer.FLAG_IMAP_SUBSCRIBED,
	ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY,
	ZmOrganizer.FLAG_DISALLOW_SUBFOLDER,
	ZmOrganizer.FLAG_OFFLINE_GLOBAL,
	ZmOrganizer.FLAG_OFFLINE_SYNCABLE,
	ZmOrganizer.FLAG_OFFLINE_SYNCING
];

// org property for each flag
ZmOrganizer.FLAG_PROP = {};
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_CHECKED]				= "isChecked";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_IMAP_SUBSCRIBED]		= "imapSubscribed";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_EXCLUDE_FREE_BUSY]	= "excludeFreeBusy";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_DISALLOW_SUBFOLDER]	= "disallowSubFolder";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_OFFLINE_GLOBAL]		= "isOfflineGlobalSearch";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_OFFLINE_SYNCABLE]	= "isOfflineSyncable";
ZmOrganizer.FLAG_PROP[ZmOrganizer.FLAG_OFFLINE_SYNCING]		= "isOfflineSyncing";

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
ZmOrganizer.ORG_DEFAULT_COLOR 	= ZmOrganizer.C_NONE;

ZmOrganizer.COLOR_VALUES = [
	null,
	ZmMsg.colorBlue,
	ZmMsg.colorCyan,
	ZmMsg.colorGreen,
	ZmMsg.colorPurple,
	ZmMsg.colorRed,
	ZmMsg.colorYellow,
	ZmMsg.colorPink,
	ZmMsg.colorGray,
	ZmMsg.colorOrange
];

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


ZmOrganizer.MSG_KEY 		= {};		// keys for org names
ZmOrganizer.ROOT_MSG_KEY	= {};		// key for name of root (used as tree header)
ZmOrganizer.ITEM_ORGANIZER 	= {};		// primary organizer for item types
ZmOrganizer.DEFAULT_FOLDER 	= {};		// default folder for org type
ZmOrganizer.SOAP_CMD 		= {};		// SOAP command for modifying an org
ZmOrganizer.FIRST_USER_ID 	= {};		// lowest valid user ID for an org type
ZmOrganizer.PRECONDITION 	= {};		// setting that this org type depends on
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
ZmOrganizer.VIEWS 			= {};		// views by org type
ZmOrganizer.VIEW_HASH		= {};		// view hash by org type
ZmOrganizer.TYPE 			= {};		// types by view (reverse map of above)
ZmOrganizer.FOLDER_KEY 		= {};		// keys for label "[org] folder"
ZmOrganizer.MOUNT_KEY 		= {};		// keys for label "mount [org]"
ZmOrganizer.DEFERRABLE 		= {};		// creation can be deferred to app launch
ZmOrganizer.PATH_IN_NAME	= {};		// if true, provide full path when asked for name
ZmOrganizer.OPEN_SETTING	= {};		// setting that controls whether the tree view is open
ZmOrganizer.NEW_OP			= {};		// name of operation for new button in tree header (optional)
ZmOrganizer.DISPLAY_ORDER	= {};		// sort number to determine order of tree view (optional)
ZmOrganizer.HIDE_EMPTY		= {};		// if true, hide tree header if tree is empty
ZmOrganizer.SHAREABLE 		= {};		// allow share or not

ZmOrganizer.APP2ORGANIZER	= {};		// organizer types, keyed by app name
ZmOrganizer.APP2ORGANIZER_R = {};		// app names, keyed by app organizer type

// allowed permission bits
ZmOrganizer.PERM_READ		= "r";
ZmOrganizer.PERM_WRITE		= "w";
ZmOrganizer.PERM_INSERT		= "i";
ZmOrganizer.PERM_DELETE		= "d";
ZmOrganizer.PERM_ADMIN		= "a";
ZmOrganizer.PERM_WORKFLOW	= "x";
ZmOrganizer.PERM_PRIVATE	= "p";

// Retention Policy Elements - Keep or Purge
ZmOrganizer.RETENTION_KEEP  = "keep";
ZmOrganizer.RETENTION_PURGE = "purge";

// Abstract methods

/**
 * Stores information about the given organizer type.
 * 
 * @param {constant}	org				the organizer type
 * @param {Hash}	params			a hash of parameters
 * @param	{constant}	app				the app that handles this org type
 * @param	{String}	nameKey			the msg key for org name
 * @param	{constant}	precondition		the setting that this org type depends on
 * @param	{int}	defaultFolder		the folder ID of default folder for this org
 * @param	{String}	soapCmd			the SOAP command for acting on this org
 * @param	{int}	firstUserId		the minimum ID for a user instance of this org
 * @param	{String}	orgClass			the name of constructor for this org
 * @param	{String}	orgPackage		the name of smallest package with org class
 * @param	{String}	treeController	the name of associated tree controller
 * @param	{String}	labelKey			the msg key for label in overview
 * @param	{String}	itemsKey			the msg key for text describing contents
 * @param	{Boolean}	hasColor			<code>true</code> if org has color associated with it
 * @param	{constant}	defaultColor		the default color for org in overview
 * @param	{Array}	orgColor			the color override by ID (in pairs)
 * @param	{constant}	treeType			the type of data tree (from server) that contains this org
 * @param	{String}	views				the associated folder views (JSON)
 * @param	{String}	folderKey			the msg key for folder props dialog
 * @param	{String}	mountKey			the msg key for folder mount dialog
 * @param	{String}	createFunc		the name of function for creating this org
 * @param	{String}	compareFunc		the name of function for comparing instances of this org
 * @param	{Boolean}	deferrable		if <code>true</code>, creation can be deferred to app launch
 * @param	{Boolean}	pathInName		if <code>true</code>, provide full path when asked for name
 * @param	{constant}	openSetting		the setting that controls whether the tree view is open
 * @param	{int}	displayOrder		the number that is used when sorting the display of trees. (Lower number means higher display.)
 * @param	{Boolean}	hideEmpty			if <code>true</code>, hide tree header if tree is empty
 */
ZmOrganizer.registerOrg =
function(org, params) {
	if (params.nameKey)			{ ZmOrganizer.MSG_KEY[org]				= params.nameKey; }
	if (params.app)				{
		ZmOrganizer.APP[org] = params.app;
		if (!ZmOrganizer.APP2ORGANIZER[params.app]) {
			ZmOrganizer.APP2ORGANIZER[params.app] = [];
		}
		ZmOrganizer.APP2ORGANIZER[params.app].push(org);
        ZmOrganizer.APP2ORGANIZER_R[org] = params.app;
	}
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
	if (params.pathInName)		{ ZmOrganizer.PATH_IN_NAME[org]			= params.pathInName; }
	if (params.openSetting)		{ ZmOrganizer.OPEN_SETTING[org]			= params.openSetting; }
	if (params.newOp)			{ ZmOrganizer.NEW_OP[org]				= params.newOp; }
	if (params.displayOrder)	{ ZmOrganizer.DISPLAY_ORDER[org]		= params.displayOrder; }
	if (params.hideEmpty)		{ ZmOrganizer.HIDE_EMPTY[org]			= params.hideEmpty; }
	ZmOrganizer.SHAREABLE[org]	= !params.disableShare; 

	if (!appCtxt.isChildWindow || params.childWindow ) {
		if (params.compareFunc)		{ ZmTreeView.COMPARE_FUNC[org]			= params.compareFunc; }
		if (params.treeController)	{ ZmOverviewController.CONTROLLER[org]	= params.treeController; }
	}

	ZmOrganizer.TREE_TYPE[org] = params.treeType || org; // default to own type
	ZmOrganizer.CREATE_FUNC[org] = params.createFunc || "ZmOrganizer.create";

	if (params.views) {
		ZmOrganizer.VIEW_HASH[org] = AjxUtil.arrayAsHash(ZmOrganizer.VIEWS[org]);
	}

	if (params.hasColor) {
		ZmOrganizer.DEFAULT_COLOR[org] = (params.defaultColor != null)
			? params.defaultColor
			: ZmOrganizer.ORG_DEFAULT_COLOR;
	}

	if (params.orgColor) {
		for (var id in params.orgColor) {
			ZmOrganizer.ORG_COLOR[id] = params.orgColor[id];
		}
	}

	if (params.dropTargets) {
		if (!ZmApp.DROP_TARGETS[params.app]) {
			ZmApp.DROP_TARGETS[params.app] = {};
		}
		ZmApp.DROP_TARGETS[params.app][org] = params.dropTargets;
	}
};

ZmOrganizer.sortCompare = function(organizerA, organizerB) {};

/**
 * nulls value that is the default color for the type.
 * @param value
 */
ZmOrganizer.getColorValue =
function(value, type) {
	// no need to save color if missing or default
	if (value == ZmOrganizer.DEFAULT_COLOR[type]) {
		return null;
	}

	return value;
};

/**
 * Creates an organizer via <code>&lt;CreateFolderRequest&gt;</code>. Attribute pairs can
 * be passed in and will become attributes of the folder node in the request.
 * 
 * @param {Hash}	params	a hash of parameters
 */
ZmOrganizer.create =
function(params) {
	var jsonObj = {CreateFolderRequest:{_jsns:"urn:zimbraMail"}};
	var folder = jsonObj.CreateFolderRequest.folder = {};
	var errorCallback = params.errorCallback || new AjxCallback(null, ZmOrganizer._handleErrorCreate, params);
	var type = params.type;

	// set attributes
	params.view = params.view || ZmOrganizer.VIEWS[type] ? ZmOrganizer.VIEWS[type][0] : null;
	for (var i in params) {
		if (i == "type" || i == "errorCallback" || i == "account") { continue; }

		var value = params[i];
		if (value) {
			folder[i] = value;
		}
	}
	//adding support to asyncMode == false didn't eventually help me, but why not keep it?
	var asyncMode = params.asyncMode === undefined ? true : params.asyncMode; //default is true

	return appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: asyncMode,
		accountName: (params.account && params.account.name),
		callback: params.callback,
		callbackAfterNotifications: params.callbackAfterNotifications, 
		errorCallback: errorCallback
	});
};

/**
 * @private
 */
ZmOrganizer._handleErrorCreate =
function(params, ex) {
	if (!params.url && !params.name) { return false; }
	
	var msg;
	if (params.name && (ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS)) {
		var type = appCtxt.getFolderTree(appCtxt.getActiveAccount()).getFolderTypeByName(params.name);
        msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [params.name, type.toLowerCase()]);
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

/**
 * @private
 */
ZmOrganizer._showErrorMsg =
function(msg) {
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.reset();
	msgDialog.setMessage(AjxStringUtil.htmlEncode(msg), DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup();
};

/**
 * Gets the folder.
 * 
 * @param	{String}	id		the folder id
 * @param	{AjxCallback}	callback	the callback
 * @param	{ZmBatchCommand}	batchCmd	the batch command or <code>null</code> for none
 */
ZmOrganizer.getFolder =
function(id, callback, batchCmd) {
	var jsonObj = {GetFolderRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetFolderRequest;
	request.folder = {l:id};
	var respCallback = new AjxCallback(null, ZmOrganizer._handleResponseGetFolder, [callback]);
	if (batchCmd) {
		batchCmd.addRequestParams(jsonObj, respCallback);
	} else {
		appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

/**
 * @private
 */
ZmOrganizer._handleResponseGetFolder =
function(callback, result) {
	var resp = result.getResponse().GetFolderResponse;
	var folderObj = (resp && resp.folder && resp.folder[0]) ||
					(resp && resp.link && resp.link[0]);
	var folder;
	if (folderObj) {
		folder = appCtxt.getById(folderObj.id);
		if (folder) {
			folder.clearShares();
			folder._setSharesFromJs(folderObj);
		} else {
			var parent = appCtxt.getById(folderObj.l);
			folder = ZmFolderTree.createFromJs(parent, folderObj, appCtxt.getFolderTree(), "folder");
		}
	}
	if (callback) {
		callback.run(folder);
	}
};

/**
 * Gets the folder.
 * 
 * @param	{AjxCallback}	callback	the callback
 * @param	{ZmBatchCommand}	batchCmd	the batch command or <code>null</code> for none
 */
ZmOrganizer.prototype.getFolder =
function(callback, batchCmd) {
	ZmOrganizer.getFolder(this.id, callback, batchCmd);
};


// Static methods

/**
 * Gets the view name by organizer type.
 * 
 * @param	{String}	organizerType		the organizer type
 * @return	{String}	the view
 */
ZmOrganizer.getViewName =
function(organizerType) {
	return ZmOrganizer.VIEWS[organizerType][0];
};

/**
 * Checks an organizer (folder or tag) offlineSyncInterval for validity.
 *
 * @param {String}	value		offlineSyncInterval
 * @return	{String}	<code>null</code> if the offlineSyncInterval is valid or an error message if the name is invalid
 */
ZmOrganizer.checkWebOfflineSyncDays =
function(value) {
    if (isNaN(value)) {	return ZmMsg.invalidFolderSyncInterval; }
    var interval = parseInt(value);
	if (interval < 0 ||  interval > 30) {
		return ZmMsg.invalidFolderSyncInterval;
	}
	return null;
};

/**
 * Checks an organizer (folder or tag) name for validity.
 *
 * @param {String}	name		an organizer name
 * @return	{String}	<code>null</code> if the name is valid or an error message if the name is invalid
 */
ZmOrganizer.checkName =
function(name) {
	if (name.length == 0) {	return ZmMsg.nameEmpty; }

	if (name.length > ZmOrganizer.MAX_NAME_LENGTH) {
		return AjxMessageFormat.format(ZmMsg.nameTooLong, ZmOrganizer.MAX_NAME_LENGTH);
	}

	if (!ZmOrganizer.VALID_NAME_RE.test(name)) {
		return AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(name));
	}

	return null;
};

/**
 * Checks a URL (a folder or calendar feed, for example) for validity.
 *
 * @param {String}	url	a URL
 * @return	{String}	<code>null</code> if valid or an error message
 */
ZmOrganizer.checkUrl =
function(url) {
	// TODO: be friendly and prepend "http://" when it's missing
	if (!url.match(/^[a-zA-Z]+:\/\/.*$/i)) {
		return ZmMsg.errorUrlMissing;
	}

	return null;
};

/**
 * @private
 */
ZmOrganizer.checkSortArgs =
function(orgA, orgB) {
	if (!orgA && !orgB) return 0;
	if (orgA && !orgB) return 1;
	if (!orgA && orgB) return -1;
	return null;
};

/**
 * @private
 */
ZmOrganizer.checkColor =
function(color) {
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR))
		? color : ZmOrganizer.ORG_DEFAULT_COLOR;
};

/**
 * Gets the system ID for the given system ID and account. Unless this
 * is a child account, the system ID is returned unchanged. For child
 * accounts, the ID consists of the account ID and the local ID.
 * 
 * @param {int}	id		the ID of a system organizer
 * @param {ZmZimbraAccount}	account	the account
 * @param {Boolean}		force		<code>true</code> to generate the fully qualified ID even if this is the main account
 * @return	{String}	the ID
 */
ZmOrganizer.getSystemId =
function(id, account, force) {
	account = account || appCtxt.getActiveAccount();
	if ((account && !account.isMain) || force) {
		return ((typeof(id) == "string") && (id.indexOf(":") != -1) || !id)
			? id : ([account.id, id].join(":"));
	}
	return id;
};

/**
 * Normalizes the id by stripping the account ID portion from a system ID for a child account, which
 * can then be used to check against known system IDs. Any non-system ID is
 * returned unchanged (if type is provided).
 *
 * @param {String}	id	ID of an organizer
 * @param {constant}	type	the type of organizer
 * @return	{String}	the resulting id
 */
ZmOrganizer.normalizeId =
function(id, type) {
	if (typeof(id) != "string") { return id; }
	var idx = id.indexOf(":");
	var localId = (idx == -1) ? id : id.substr(idx + 1);
	return (type && (localId >= ZmOrganizer.FIRST_USER_ID[type])) ? id : localId;
};

/**
 * Parses an id into an object with fields for account and normalized id
 *
 * @param {String}	id		the ID of an organizer
 * @param {Object}	result	an optional object in which the result is stored
 * @return	{Object}	the resulting ID
 */
ZmOrganizer.parseId =
function(id, result) {
	var ac = window.parentAppCtxt || window.appCtxt;

	result = result || {};
	if (id == null) { return result; }
	var idx = (typeof id == "string") ? id.indexOf(":") : -1;
	if (idx == -1) {
		result.account = ac.accountList.mainAccount;
		result.id = id;
	} else {
		result.acctId = id.substring(0, idx);
		result.account = ac.accountList.getAccount(result.acctId);
		result.id = id.substr(idx + 1);
	}
	return result;
};

// Public methods

/**
* Gets the name of this organizer.
*
* @param {Boolean}	showUnread		<code>true</code> to display the number of unread items (in parens)
* @param {int}	maxLength		the length (in chars) to truncate the name to
* @param {Boolean}	noMarkup		if <code>true</code>, don't return any HTML
* @param {Boolean}	useSystemName	if <code>true</code>, don't use translated version of name
* @return	{String}	the name
*/
ZmOrganizer.prototype.getName = 
function(showUnread, maxLength, noMarkup, useSystemName, useOwnerName, defaultRootType) {
	if (this.nId == ZmFolder.ID_ROOT) {
		var type = defaultRootType || this.type;
		return (ZmOrganizer.LABEL[type])
			? ZmMsg[ZmOrganizer.LABEL[type]] : "";
	}
	var name = (useSystemName && this._systemName) || (useOwnerName && this.oname) || this.name || "";
	if (ZmOrganizer.PATH_IN_NAME[this.type] && this.path) {
		name = [this.path, name].join("/");
	}
	name = (maxLength && name.length > maxLength)
		? name.substring(0, maxLength - 3) + "..." : name;
	return this._markupName(name, showUnread, noMarkup);
};

/**
* Gets the full path as a string.
*
* @param {Boolean}	includeRoot		<code>true</code> to include root name at the beginning of the path
* @param {Boolean}	showUnread		<code>true</code> to display the number of unread items (in parens)
* @param {int}	maxLength		the length (in chars) to truncate the name to
* @param {Boolean}	noMarkup		if <code>true</code>, do not return any HTML
* @param {Boolean}	useSystemName	if <code>true</code>, use untranslated version of system folder names
* @return	{String}	the path
*/
ZmOrganizer.prototype.getPath = 
function(includeRoot, showUnread, maxLength, noMarkup, useSystemName, useOwnerName) {
	var parent = this.parent;
	var path = this.getName(showUnread, maxLength, noMarkup, useSystemName, useOwnerName);
	while (parent && ((parent.nId != ZmOrganizer.ID_ROOT) || includeRoot)) {
		path = parent.getName(showUnread, maxLength, noMarkup, useSystemName, useOwnerName) + ZmFolder.SEP + path;
		parent = parent.parent;
	}

	return path;
};

/**
 * Gets the tooltip. The tooltip shows number of unread items, total messages and the total size.
 *
 * @param {Boolean}	force		if <code>true</code>, don't use cached tooltip
 * @return	{String}	the tooltip
 */
ZmOrganizer.prototype.getToolTip =
function(force) {
	if (this.noTooltip) {
		return null;
	}
    if (!this._tooltip || force) {
		var itemText = this._getItemsText();
		var unreadLabel = this._getUnreadLabel();
		var subs = {name:this.name, itemText:itemText, numTotal:this.numTotal, sizeTotal:this.sizeTotal, numUnread:this.numUnread, unreadLabel:unreadLabel};
		this._tooltip = AjxTemplate.expand("share.App#FolderTooltip", subs);
	}
	return this._tooltip;
};

/**
 * Gets the full path, suitable for use in search expressions.
 *
 * @return	{String}	the path
 */
ZmOrganizer.prototype.getSearchPath =
function(useOwnerName) {
	return (this.nId != ZmOrganizer.ID_ROOT)
		? this.getPath(null, null, null, true, true, useOwnerName) : "/";
};

/**
 * Gets the URL.
 * 
 * @return	{String}	the URL
 * 
 * @deprecated use {@link getRestUrl}
 */
ZmOrganizer.prototype.getUrl =
function() {
	return this.getRestUrl();
};

/**
 * Gets the sync URL.
 * 
 * @return		{String}	the URL
 */
ZmOrganizer.prototype.getSyncUrl =
function() {
	return url;
};

/**
 * Gets the remote ID.
 * 
 * @return	{String}	the ID
 */
ZmOrganizer.prototype.getRemoteId =
function() {
	if (!this._remoteId) {
		this._remoteId = (this.isRemote() && this.zid && this.rid)
			? (this.zid + ":" + this.rid)
			: this.id;
	}
	return this._remoteId;
};


/**
 * Gets the REST URL.
 * 
 * @return	{String}	the URL
 */
ZmOrganizer.prototype.getRestUrl =
function(noRemote) {

	var restUrl = appCtxt.get(ZmSetting.REST_URL);
	if (restUrl && (!this.isRemote() || noRemote)) { //for remote - this does not work. either use this.restUrl (if set, which is for shared folder, but not for sub-folders) or call _generateRestUrl which seems to work for subfodlers of shared as well.
		var path = AjxStringUtil.urlEncode(this.getSearchPath()).replace("#","%23").replace(";", "%3B"); // User may type in a # in a folder name, but that's not ok for our urls
		// return REST URL as seen by the GetInfoResponse
		return ([restUrl, "/", path].join(""));
	}

	// return REST URL as seen by server - this is the remote (isRemote() true) case - shared folder.
	if (this.restUrl) {
		return this.restUrl;
	}

	// if server doesn't tell us what URL to use, do our best to generate
	var url = this._generateRestUrl();
	DBG.println(AjxDebug.DBG3, "NO REST URL FROM SERVER. GENERATED URL: " + url);

	return url;
};

/**
 * Gets the OWNER'S REST URL,used to fetch resturl of shared folders.
 *
 * @return	{String}	the URL
 */
ZmOrganizer.prototype.getOwnerRestUrl =
function(){
  var restUrl=this.restUrl;
  var path = AjxStringUtil.urlEncode(this.oname).replace("#","%23");

  // return REST URL as seen by the GetInfoResponse
  return ([restUrl, "/", path].join(""));
};

ZmOrganizer.prototype._generateRestUrl =
function() {
	var loc = document.location;
	var uname = appCtxt.get(ZmSetting.USERNAME);
	var host = loc.host;
	var m = uname.match(/^(.*)@(.*)$/);

	host = (m && m[2]) || host;

	// REVISIT: What about port? For now assume other host uses same port
	if (loc.port && loc.port != 80) {
		host = host + ":" + loc.port;
	}

	var path = AjxStringUtil.urlEncode(this.getSearchPath()).replace("#","%23"); // User may type in a # in a folder name, but that's not ok for our urls
		
	return [
		loc.protocol, "//", host, "/service/user/", uname, "/",	path
	].join("");
};

/**
 * Gets the account.
 * 
 * @return	{ZmZimbraAccount}	the account
 */
ZmOrganizer.prototype.getAccount =
function() {
	if (appCtxt.multiAccounts) {
		if (!this.account) {
			this.account = ZmOrganizer.parseId(this.id).account;
		}
		// bug 46364:
		// still no account?! Must be remote organizer, keep checking parent
		if (!this.account) {
			var parent = this.parent;
			while (parent && !this.account) {
				this.account = parent.getAccount();
				parent = parent.parent;
			}
		}
		return this.account;
	}

	return (this.account || appCtxt.accountList.mainAccount);
};

/**
 * Gets the shares.
 * 
 * @return	{Array}	an array of shares
 */
ZmOrganizer.prototype.getShares =
function() {
	return this.shares;
};

/**
 * Adds the share.
 * 
 * @param	{Object}	share		the share to add
 */
ZmOrganizer.prototype.addShare =
function(share) {
	this.shares = this.shares || [];
	this.shares.push(share);

	var curAcct = appCtxt.getActiveAccount();
	var curZid = curAcct && curAcct.id;
	var shareId = share.grantee && share.grantee.id;
	if (shareId && (shareId == curZid)) {
		this._mainShare = share;
	}
};

/**
 * Clears all shares.
 * 
 */
ZmOrganizer.prototype.clearShares =
function() {
	if (this.shares && this.shares.length) {
		for (var i = 0; i < this.shares.length; i++) {
			this.shares[i] = null;
		}
	}
	this.shares = null;
	this._mainShare = null;
};

/**
 * Gets the share granted to the current user.
 * 
 * @return	{String}	the main share
 */
ZmOrganizer.prototype.getMainShare =
function() {
	if (!this._mainShare) {
		var curAcct = appCtxt.getActiveAccount();
		var curZid = curAcct && curAcct.id;
		if (curZid && this.shares && this.shares.length) {
			for (var i = 0; i < this.shares.length; i++) {
				var share = this.shares[i];
				var id = share && share.grantee && share.grantee.id;
				if (id && id == curZid) {
					this._mainShare = share;
					break;
				}
			}
		}
	}
	return this._mainShare;
};

/**
 * Checks if the organizer supports sharing.
 * 
 * @return	{Boolean}	<code>true</code> if the organizer supports sharing
 */
ZmOrganizer.prototype.supportsSharing =
function() {
	// overload per organizer type
	return true;
};

/**
 * Checks if the organizer supports pulbic access.
 * 
 * @return	{Boolean}	<code>true</code> if the organizer supports public access
 */
ZmOrganizer.prototype.supportsPublicAccess =
function() {
	// overload per organizer type
	return true;
};

/**
 * Checks if the organizer supports private permission.
 * 
 * @return	{Boolean}	<code>true</code> if the organizer supports private permission
 */
ZmOrganizer.prototype.supportsPrivatePermission =
function() {
	// overload per organizer type
	return false;
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmOrganizer.prototype.getIcon = function() {};

/**
 * Gets the color of the organizer
 *
 * @return	{String}	the color
 */
ZmOrganizer.prototype.getColor =
function() {
    return this.rgb || ZmOrganizer.COLOR_VALUES[this.color];
}


/**
 * Gets the icon with color
 * 
 * @return	{String}	the icon
 */
ZmOrganizer.prototype.getIconWithColor =
function() {
	var icon = this.getIcon() || "";
	var color = this.getColor();
	return color ? [icon,color].join(",color=") : icon;
};

// Actions

/**
 * Renames the organizer.
 * 
 * @param	{String}	name		the name
 * @param	{AjxCallback}	callback		the callback
 * @param	{AjxCallback}	errorCallback		the error callback
 * @param	{ZmBatchCommand}	batchCmd		the batch command
 */
ZmOrganizer.prototype.rename =
function(name, callback, errorCallback, batchCmd) {
	if (name == this.name) { return; }
	var params = {
		action: "rename",
		attrs: {name: name},
		callback: callback,
		errorCallback: errorCallback,
		batchCmd: batchCmd
	};
	this._organizerAction(params);
};

/**
 * Sets the web offline sync interval.
 *
 * @param	{String}	        interval		the web offline sync interval
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback   the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmOrganizer.prototype.setOfflineSyncInterval =
function(interval, callback, errorCallback, batchCmd) {
	if (this.webOfflineSyncDays == interval) { return; }

	this._organizerAction({action: "webofflinesyncdays", attrs: {numDays: interval}, callback: callback,
                           errorCallback: errorCallback, batchCmd: batchCmd});
};

/**
 * Sets the color.
 * 
 * @param	{String}	        color		    the color
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback   the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmOrganizer.prototype.setColor =
function(color, callback, errorCallback, batchCmd) {
	var color = ZmOrganizer.checkColor(color);
	if (!this.isColorChanged(color)) { return; }

	this._organizerAction({action: "color", attrs: {color: color}, callback: callback,
                           errorCallback: errorCallback, batchCmd: batchCmd});
};

/**
 * Sets the RGB color.
 * 
 * @param	{Object}	        rgb		        the rgb
 * @param	{AjxCallback}	    callback		the callback
 * @param	{AjxCallback}	    errorCallback	the error callback
 * @param   {ZmBatchCommand}    batchCmd        optional batch command
 */
ZmOrganizer.prototype.setRGB = function(rgb, callback, errorCallback, batchCmd) {
	if (!this.isColorChanged(rgb)) { return; }
	this._organizerAction({action: "color", attrs: {rgb: rgb}, callback: callback,
                           errorCallback: errorCallback, batchCmd: batchCmd});
};


ZmOrganizer.prototype.getRetentionPolicy =
function(policyElement) {
    var policy = null;
    if (this.retentionPolicy && this.retentionPolicy[0] && this.retentionPolicy[0][policyElement] &&
        this.retentionPolicy[0][policyElement][0]       && this.retentionPolicy[0][policyElement][0].policy &&
        this.retentionPolicy[0][policyElement][0].policy[0]) {
        policy = this.retentionPolicy[0][policyElement][0].policy[0];
    }
    return policy;
}

ZmOrganizer.prototype.getRetentionPolicyLifetimeMsec =
function(policy) {
    if (policy) {
        // Apply the keep (retention) period
        var lifetime = policy.lifetime;
        var amount = parseInt(lifetime);
        // Intervals taken from DateUtil.java.
        var interval = lifetime.slice(lifetime.length-1);
        var lifetimeMsec = 0;
        switch (interval) {
            case  "d": lifetimeMsec = amount * AjxDateUtil.MSEC_PER_DAY;    break;
            case  "h": lifetimeMsec = amount * AjxDateUtil.MSEC_PER_HOUR;   break;
            case  "m": lifetimeMsec = amount * AjxDateUtil.MSEC_PER_MINUTE; break;
            case  "s": lifetimeMsec = amount * 1000; break;
            case "ms": lifetimeMsec = amount;  break;
            default  : lifetimeMsec = amount * 1000; break;
        }
    }
    return lifetimeMsec;
}

/**
 * Sets the Retention Policy.
 *
 * @param	{Object}	        retentionPolicy     the new retention policy
 * @param	{AjxCallback}	    callback		    the callback
 * @param	{AjxCallback}	    errorCallback	    the error callback
 * @param   {ZmBatchCommand}    batchCmd            optional batch command
 */
ZmOrganizer.prototype.setRetentionPolicy = function(newRetentionPolicy, callback, errorCallback, batchCmd) {
    var keepPolicy  = this.getRetentionPolicy(ZmOrganizer.RETENTION_KEEP);
    var purgePolicy = this.getRetentionPolicy(ZmOrganizer.RETENTION_PURGE);
    if (!this.policiesDiffer(keepPolicy,  newRetentionPolicy.keep) &&
        !this.policiesDiffer(purgePolicy, newRetentionPolicy.purge)) {
        // No updated policy specified or no changes.
        return;
    }

	var cmd = ZmOrganizer.SOAP_CMD[this.type] + "Request";
	var request = {
		_jsns: "urn:zimbraMail",
		action : {
			op: "retentionpolicy",
			id: this.id,
			retentionPolicy: {
				keep: {},
				purge: {}
			}
		}
	};
	var jsonObj = {};
	jsonObj[cmd] = request;

	var retentionNode = request.action.retentionPolicy;

    if (newRetentionPolicy.keep) {
        this._addPolicy(retentionNode.keep, newRetentionPolicy.keep);
    }
    if (newRetentionPolicy.purge) {
        this._addPolicy(retentionNode.purge, newRetentionPolicy.purge);
    }

	if (batchCmd) {
        batchCmd.addRequestParams(jsonObj, callback, errorCallback);
 	}
	else {
		var accountName;
		if (appCtxt.multiAccounts) {
			accountName = (this.account)
				? this.account.name : appCtxt.accountList.mainAccount.name;
		}
		appCtxt.getAppController().sendRequest({
			jsonObj:       jsonObj,
			asyncMode:     true,
			accountName:   accountName,
			callback:      callback,
			errorCallback: errorCallback
		});
	}

};

ZmOrganizer.prototype.policiesDiffer =
function(policyA, policyB) {
    var differ = false;
    if ((policyA && !policyB) || (!policyA && policyB)) {
        differ = true;
    } else if (policyA) {
        // Old and new specified
        if (policyA.type != policyB.type) {
            differ = true;
        } else {
            if (policyA.type == "user") {
                differ = policyA.lifetime != policyB.lifetime;
            } else {
                // System policy
                differ = policyA.id != policyB.id;
            }
        }
    }
    return differ;
}

ZmOrganizer.prototype._addPolicy =
function(node, policy) {
	var policyNode = node.policy = {};
	for (var attr in policy) {
		if (AjxEnv.isIE) {
			policy[attr] += ""; //To string
		}

		policyNode[attr] = policy[attr];
	}
};

/**
 * Returns color number b/w 0-9 for a given color code
 *
 * @param	{String}	color	The color (usually in #43eded format
 * @return {int} Returns 0-9 for a standard color and returns -1 for custom color
 */
ZmOrganizer.getStandardColorNumber =
function(color) {
	if (String(color).match(/^#/)) {
		var len = ZmOrganizer.COLOR_VALUES.length;
		for(var i =0; i < len; i++) {
			var currentVal = ZmOrganizer.COLOR_VALUES[i];
			if(currentVal && currentVal == color) {
				return i;
			}
		}
	} else if(color <= 9 && color >= 0) {
		return color;
	}
	return -1;
};

/**
 * Returns true if the color is changed
 *
 * @param	{String/int}	color	The color (usually in #rgb format or numeric color code
 * @return {Boolean} Returns true if the color is changed
 */
ZmOrganizer.prototype.isColorChanged =
function(color) {
    var isNewColorCustom = ZmOrganizer.getStandardColorNumber(color) === -1,
        isPrevColorCustom = this.isColorCustom;
    if ((isNewColorCustom && !isPrevColorCustom) ||
        (!isNewColorCustom && isPrevColorCustom) ) {
        //Custom changed to standard or standard changed to custom
        return true;
    }
    else if (isNewColorCustom && isPrevColorCustom) {
        //If both are custom colors check the rgb codes
        return color != this.rgb;
    }
    else if (!isNewColorCustom && !isPrevColorCustom){
        //If both are standard check the numeric color codes
        return color != this.color;
    }
    //default fallback
    return false;
};

/**
 * Updates the folder. Although it is possible to use this method to change just about any folder
 * attribute, it should only be used to set multiple attributes at once since it
 * has extra overhead on the server.
 *
 * @param {Hash}	attrs		the attributes
 */
ZmOrganizer.prototype.update =
function(attrs) {
	this._organizerAction({action: "update", attrs: attrs});
};

/**
 * Assigns the organizer a new parent, moving it within its tree.
 *
 * @param {ZmOrganizer}	newParent		the new parent of this organizer
 * @param {boolean}		noUndo			if true, action is not undoable
 */
ZmOrganizer.prototype.move =
function(newParent, noUndo, batchCmd) {

	var newId = (newParent.nId > 0)
		? newParent.id
		: ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);

	if ((newId == this.id || newId == this.parent.id) ||
		(this.type == ZmOrganizer.FOLDER && (ZmOrganizer.normalizeId(newId, this.type) == ZmFolder.ID_SPAM)) ||
		(newParent.isChildOf(this)))
	{
		return;
	}
	var params = {};
	params.batchCmd = batchCmd;
	params.actionTextKey = 'actionMoveOrganizer';
	params.orgName = this.getName(false, false, true, false, false, this.type);
	if (newId == ZmOrganizer.ID_TRASH) {
		params.actionArg = ZmMsg.trash;
		params.action = "trash";
		params.noUndo = noUndo;
	}
	else {
		if (newParent.account && newParent.account.isLocal()) {
			newId = [ZmAccount.LOCAL_ACCOUNT_ID, newId].join(":");
		}
		params.actionArg = newParent.getName(false, false, true, false, false, this.type);
		params.action = "move";
		params.attrs = {l: newId};
		params.noUndo = noUndo;
	}
	this._organizerAction(params);
};

/**
 * Deletes an organizer. If it's a folder, the server deletes any contents and/or
 * subfolders. If the organizer is "Trash" or "Spam", the server deletes and re-creates the
 * folder. In that case, we do not bother to remove it from the UI (and we ignore
 * creates on system folders).
 *
 */
ZmOrganizer.prototype._delete =
function(batchCmd) {
	DBG.println(AjxDebug.DBG1, "deleting: " + AjxStringUtil.htmlEncode(this.name) + ", ID: " + this.id);
	var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK || this.type == ZmOrganizer.BRIEFCASE) &&
					 (this.nId == ZmFolder.ID_SPAM || this.nId == ZmFolder.ID_TRASH));
	// make sure we're not deleting a system object (unless we're emptying SPAM or TRASH)
	if (this.isSystem() && !isEmptyOp) return;

	var action = isEmptyOp ? "empty" : "delete";
	this._organizerAction({action: action, batchCmd: batchCmd});
};

/**
 * Empties the organizer.
 *
 * @param	{Boolean}	doRecursive		<code>true</code> to recursively empty the organizer
 * @param	{ZmBatchCommand}	batchCmd	the batch command
 * @param	{Object}	callback
 * @param	{number}	timeout		the timeout(in seconds)
 * @param	{AjxCallback}	errorCallback		the callback to run after timeout
 * @param	{Boolean}	noBusyOverlay		if <code>true</code>, do not show busy overlay
 */
ZmOrganizer.prototype.empty =
function(doRecursive, batchCmd, callback, timeout, errorCallback, noBusyOverlay) {
	doRecursive = doRecursive || false;

	var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK) &&
					 (this.nId == ZmFolder.ID_SPAM ||
					  this.nId == ZmFolder.ID_TRASH ||
					  this.nId == ZmFolder.ID_CHATS ||
					  this.nId == ZmOrganizer.ID_SYNC_FAILURES));

	// make sure we're not emptying a system object (unless it's SPAM/TRASH/SYNCFAILURES)
	if (this.isSystem() && !isEmptyOp) { return; }

	var params = {
		action: "empty",
		batchCmd: batchCmd,
		callback: callback,
		timeout: timeout,
		errorCallback: errorCallback,
		noBusyOverlay: noBusyOverlay
	};
	params.attrs = (this.nId == ZmFolder.ID_TRASH)
		? {recursive:true}
		: {recursive:doRecursive};

	if (this.isRemote()) {
		params.id = this.getRemoteId();
	}

	this._organizerAction(params);
};

/**
 * Marks all items as "read".
 *
 * @param	{ZmBatchCommand}	batchCmd	the batch command
 */
ZmOrganizer.prototype.markAllRead =
function(batchCmd) {
	var id = this.isRemote() ? this.getRemoteId() : null;
	this._organizerAction({action: "read", id: id, attrs: {l: this.id}, batchCmd:batchCmd});
};

/**
 * Synchronizes the organizer.
 *
 */
ZmOrganizer.prototype.sync =
function() {
	this._organizerAction({action: "sync"});
};

// Notification handling

/**
 * Handles delete notification.
 *
 */
ZmOrganizer.prototype.notifyDelete =
function() {
	// select next reasonable organizer if the currently selected organizer is
	// the one being deleted or is a descendent of the one being deleted
	var tc = appCtxt.getOverviewController().getTreeController(this.type);
	var treeView = tc && tc.getTreeView(appCtxt.getCurrentApp().getOverviewId());

	// treeview returns array of organizers for checkbox style trees
	var organizers = treeView && treeView.getSelected();
	if (organizers) {
		if (!(organizers instanceof Array)) organizers = [organizers];
		for (var i = 0; i <  organizers.length; i++) {
			var organizer = organizers[i];
			if (organizer && (organizer == this || organizer.isChildOf(this))) {
				var folderId = this.parent.id;
				if (this.parent.nId == ZmOrganizer.ID_ROOT) {
					folderId = ZmOrganizer.getSystemId(this.getDefaultFolderId());
				}
				var skipNotify = false;
				treeView.setSelected(folderId, skipNotify);
			}
		}
	}

	// perform actual delete
	this.deleteLocal();
	this._notify(ZmEvent.E_DELETE);
};

/**
 * Handles create notification.
 */
ZmOrganizer.prototype.notifyCreate = function() {};

/**
* Handles modifications to fields that organizers have in general. Note that
* the notification object may contain multiple notifications.
*
* @param {Object}	obj		a "modified" notification
* @param {Hash}	details	the event details
*/
ZmOrganizer.prototype.notifyModify =
function(obj, details) {
	var doNotify = false;
	var details = details || {};
	var fields = {};
	if (obj.name != null && (this.name != obj.name || this.id != obj.id)) {
		if (obj.id == this.id) {
			details.oldName = this.name;
			this.name = obj.name;
			fields[ZmOrganizer.F_NAME] = true;
			this.parent.children.sort(eval(ZmTreeView.COMPARE_FUNC[this.type]));
		} else {
			// rename of a remote folder
			details.newName = obj.name;
			fields[ZmOrganizer.F_RNAME] = true;
		}
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
	if ((obj.rgb != null || obj.color != null) && !obj._isRemote) {
        var color = obj.color || obj.rgb;
		if (this.isColorChanged(color)) {
			this.isColorCustom = obj.rgb != null;
			this.color = obj.color;
            this.rgb = obj.rgb || ZmOrganizer.COLOR_VALUES[color];
			fields[ZmOrganizer.F_COLOR] = true;
            fields[ZmOrganizer.F_RGB] = true;
		}
		doNotify = true;
	}
	if (obj.f != null && !obj._isRemote) {
		var oflags = this._setFlags().split("").sort().join("");
		var nflags = obj.f.split("").sort().join("");
		if (oflags != nflags) {
			this._parseFlags(obj.f);
			fields[ZmOrganizer.F_FLAGS] = true;
			doNotify = true;
		}
	}
	if (obj.rest != null && this.restUrl != obj.rest && !obj._isRemote) {
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
	if (obj.perm && obj._isRemote) {
		fields[ZmOrganizer.F_PERMS] = true;
		doNotify = true;

		// clear acl-related flags so they are recalculated
		this._isAdmin = this._isReadOnly = this._hasPrivateAccess = null;
	}
    if (obj.retentionPolicy) {
        // Only displayed in a modal dialog - no need to doNotify
        if (obj.retentionPolicy[0].keep || obj.retentionPolicy[0].purge) {
            this.retentionPolicy = obj.retentionPolicy;
        } else {
            this.retentionPolicy = null;
        }
    }
	if (obj.hasOwnProperty("webOfflineSyncDays")) {
		this.webOfflineSyncDays = obj.webOfflineSyncDays;
	}

	// Send out composite MODIFY change event
	if (doNotify) {
		details.fields = fields;
		this._notify(ZmEvent.E_MODIFY, details);
	}

	if (this.parent && obj.l != null && obj.l != this.parent.id) {
		var newParent = this._getNewParent(obj.l);
		if (newParent) {
			this.reparent(newParent);
			this._notify(ZmEvent.E_MOVE);
			// could be moving search between Folders and Searches - make sure
			// it has the correct tree
			this.tree = newParent.tree;
		}
	}
};

// Local change handling

/**
 * Deletes the organizer (local). Cleans up a deleted organizer:
 *
 * <ul>
 * <li>remove from parent's list of children</li>
 * <li>remove from item cache</li>
 * <li>perform above two steps for each child</li>
 * <li>clear list of children</li>
 * </ul>
 *
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
 * Checks if the organizer has a child with the given name.
 *
 * @param {String}	name		the name of the organizer to look for
 * @return	{Boolean}	<code>true</code> if the organizer has a child
 */
ZmOrganizer.prototype.hasChild =
function(name) {
	return (this.getChild(name) != null);
};

/**
* Gets the child with the given name
*
* @param {String}	name		the name of the organizer to look for
* @return	{String}	the name of the child or <code>null</code> if no child has the name
*/
ZmOrganizer.prototype.getChild =
function(name) {
	name = name ? name.toLowerCase() : "";
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (a[i] && a[i].name && (a[i].name.toLowerCase() == name)) {
			return a[i];
		}
	}

	return null;
};

/**
* Gets the child with the given path
*
* @param {String}	path		the path of the organizer to look for
* @return	{String}	the child or <code>null</code> if no child has the path
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

/**
 * Changes the parent of this organizer. Note that the new parent passed
 * in may be <code>null</code>, which makes this organizer an orphan.
 *
 * @param {ZmOrganizer}	newParent		the new parent
 */
ZmOrganizer.prototype.reparent =
function(newParent) {
	if (this.parent) {
		this.parent.children.remove(this);
	}
	if (newParent) {
		newParent.children.add(this);
	}
	this.parent = newParent;
};

/**
 * Gets the organizer with the given ID, searching recursively through
 * child organizers. The preferred method for getting an organizer by ID
 * is to use <code>appCtxt.getById()</code>.
 *
 * @param {String}	id		the ID to search for
 * @return	{ZmOrganizer}	the organizer or <code>null</code> if not found
 */
ZmOrganizer.prototype.getById =
function(id) {
	if (this.link && id && typeof(id) == "string") {
		var ids = id.split(":");
		if (this.zid == ids[0] && this.rid == ids[1])
			return this;
	}

	if (this.id == id || this.nId == id) {
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
 * Gets the first organizer found with the given name, starting from the root.
 *
 * @param {String}	name		the name to search for
 * @return	{ZmOrganizer}	the organizer
 */
ZmOrganizer.prototype.getByName =
function(name, skipImap) {
	return this._getByName(name.toLowerCase(), skipImap);
};

/**
 * Gets a list of organizers with the given type.
 *
 * @param {constant}	type			the desired organizer type
 * @return	{Array}	an array of {ZmOrganizer} objects
 */
ZmOrganizer.prototype.getByType =
function(type) {
	var list = [];
	this._getByType(type, list);
	return list;
};

/**
 * @private
 */
ZmOrganizer.prototype._getByType =
function(type, list) {
	if (this.type == type) {
		list.push(this);
	}
	var a = this.children.getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i]) {
			a[i]._getByType(type, list);
		}
	}
};

/**
 * Gets the organizer with the given path.
 *
 * @param {String}	path			the path to search for
 * @param {Boolean}	useSystemName	if <code>true</code>, use untranslated version of system folder names
 * @return	{ZmOrganizer}	the organizer
 */
ZmOrganizer.prototype.getByPath =
function(path, useSystemName) {
	return this._getByPath(path.toLowerCase(), useSystemName);
};

/**
 * Test the path of this folder and then descendants against the given path, case insensitively.
 *
 * @private
 */
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
 * Gets the number of children of this organizer.
 *
 * @return	{int}	the size
 */
ZmOrganizer.prototype.size =
function() {
	return this.children.size();
};

/**
 * Checks if the given organizer is a descendant of this one.
 *
 * @param {ZmOrganizer}	organizer		a possible descendant of ours
 * @return	{Boolean}	<code>if the given organizer is a descendant; <code>false</code> otherwise
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

/**
 * Gets the organizer with the given ID (looks in this organizer tree).
 *
 * @param {int}	parentId	the ID of the organizer to find
 * @return	{ZmOrganizer}	the organizer
 *
 * @private
 */
ZmOrganizer.prototype._getNewParent =
function(parentId) {
	return appCtxt.getById(parentId);
};

/**
 * Checks if the organizer with the given ID is under this organizer.
 *
 * @param	{String}	id		the ID
 * @return	{Boolean}	<code>true</code> if the organizer is under this organizer
 */
ZmOrganizer.prototype.isUnder =
function(id) {
	id = id.toString();
	if (this.nId == id || (this.isRemote() && this.rid == id)) { return true; }

	var parent = this.parent;
	while (parent && parent.nId != ZmOrganizer.ID_ROOT) {
		if (parent.nId == id) {
			return true;
		}
		parent = parent.parent;
	}
	return false;
};

/**
 * Checks if this organizer is in "Trash".
 *
 * @return	{Boolean}	<code>true</code> if in "Trash"
 */
ZmOrganizer.prototype.isInTrash =
function() {
	return this.isUnder(ZmOrganizer.ID_TRASH);
};

/**
 * Checks if permissions are allowed.
 *
 * @return	{Boolean}	<code>true</code> if permissions are allowed
 */
ZmOrganizer.prototype.isPermAllowed =
function(perm) {
	if (this.perm) {
		var positivePerms = this.perm.replace(/-./g, "");
		return (positivePerms.indexOf(perm) != -1);
	}
	return false;
};

/**
 * Checks if the organizer is read-only.
 *
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmOrganizer.prototype.isReadOnly =
function() {
	if (this._isReadOnly == null) {
		var share = this.getMainShare();
		this._isReadOnly = (share != null)
			? (this.isRemote() && !share.isWrite())
			: (this.isRemote() && this.isPermAllowed(ZmOrganizer.PERM_READ) && !this.isPermAllowed(ZmOrganizer.PERM_WRITE));
	}
	return this._isReadOnly;
};

/**
 * Checks if admin.
 *
 * @return	{Boolean}	<code>true</code> if this organizer is admin
 */
ZmOrganizer.prototype.isAdmin =
function() {
	if (this._isAdmin == null) {
		var share = this.getMainShare();
		this._isAdmin = (share != null)
			? (this.isRemote() && share.isAdmin())
			: (this.isRemote() && this.isPermAllowed(ZmOrganizer.PERM_ADMIN));
	}
	return this._isAdmin;
};

/**
 * Checks if the organizer has private access.
 *
 * @return	{Boolean}	<code>true</code> if has private access
 */
ZmOrganizer.prototype.hasPrivateAccess =
function() {
	if (this._hasPrivateAccess == null) {
		var share = this.getMainShare();
		this._hasPrivateAccess = (share != null)
			? (this.isRemote() && share.hasPrivateAccess())
			: (this.isRemote() && this.isPermAllowed(ZmOrganizer.PERM_PRIVATE));
	}
	return this._hasPrivateAccess;
};

/**
 * Checks if the organizer is "remote". That applies to mountpoints (links),
 * the folders they represent, and any subfolders we know about.
 *
 * @return	{Boolean}	<code>true</code> if the organizer is "remote"
 */
ZmOrganizer.prototype.isRemote =
function() {
	if (this._isRemote == null) {
		if (this.zid != null) {
			this._isRemote = true;
		} else {
			if (appCtxt.multiAccounts) {
				var account = this.account;
				var parsed = ZmOrganizer.parseId(this.id);

				if (!account) {
					if (parsed.account && parsed.account.isMain) {
						this._isRemote = false;
						return this._isRemote;
					} else {
						account = appCtxt.getActiveAccount();
					}
				}
				this._isRemote = Boolean(!parsed.account || (parsed.account && (parsed.account != account)));
			} else {
				var id = String(this.id);
				this._isRemote = ((id.indexOf(":") != -1) && (id.indexOf(appCtxt.getActiveAccount().id) != 0));
			}
		}
	}
	return this._isRemote;
};

ZmOrganizer.prototype.isRemoteRoot = function() {
	return this.isRemote() && (this.rid == ZmOrganizer.ID_ROOT);
}

/**
 * Checks if the organizer is a system tag or folder.
 *
 * @return	{Boolean}	<code>true</code> if system tag or folder
 */
ZmOrganizer.prototype.isSystem =
function () {
	return (this.nId < ZmOrganizer.FIRST_USER_ID[this.type]);
};

ZmOrganizer.prototype.isDefault =
function () {
	return this.nId == this.getDefaultFolderId();
};

ZmOrganizer.prototype.getDefaultFolderId =
function() {
	return ZmOrganizer.DEFAULT_FOLDER[this.type];
};

ZmOrganizer.prototype.isTrash =
function () {
	return this.nId == ZmFolder.ID_TRASH;
};


/**
 * Checks if the organizer gets its contents from an external feed.
 *
 * @return	{Boolean}	<code>true</code>  if from external feed
 */
ZmOrganizer.prototype.isFeed =
function () {
	return Boolean(this.url);
};

/** Returns true if organizer has feeds. */
ZmOrganizer.prototype.hasFeeds = function() { return false; };

/**
 * Checks if this folder maps to a datasource. If type is given, returns
 * true if folder maps to a datasource *and* is of the given type.
 *
 * @param	{constant}	type			the type (see {@link ZmAccount.TYPE_POP} or {@link ZmAccount.TYPE_IMAP})
 * @param	{Boolean}	checkParent		if <code>true</code>, walk-up the parent chain
 * @return	{Boolean}	<code>true</code> if this folder maps to a datasource
 */
ZmOrganizer.prototype.isDataSource =
function(type, checkParent) {
	var dss = this.getDataSources(type, checkParent);
	return (dss && dss.length > 0);
};

/**
 * Gets the data sources this folder maps to. If type is given,
 * returns non-null result only if folder maps to datasource(s) *and* is of the
 * given type.
 *
 * @param	{constant}	type			the type (see {@link ZmAccount.TYPE_POP} or {@link ZmAccount.TYPE_IMAP})
 * @param	{Boolean}	checkParent		if <code>true</code>, walk-up the parent chain
 * @return	{Array}	the data sources this folder maps to or <code>null</code> for none
 */
ZmOrganizer.prototype.getDataSources =
function(type, checkParent) {
	if (!appCtxt.get(ZmSetting.MAIL_ENABLED)) { return null; }

	var dsc = appCtxt.getDataSourceCollection();
	var dataSources = dsc.getByFolderId(this.nId, type);

	if (dataSources.length == 0) {
		return (checkParent && this.parent)
			? this.parent.getDataSources(type, checkParent)
			: null;
	}

	return dataSources;
};

/**
 * Gets the owner.
 *
 * @return	{String}	the owner
 */
ZmOrganizer.prototype.getOwner =
function() {
	return this.owner || (this.parent && this.parent.getOwner()) || appCtxt.get(ZmSetting.USERNAME);
};

/**
 * Gets the sort index.
 *
 * @return	{int}	the sort index
 */
ZmOrganizer.getSortIndex =
function(child, sortFunction) {
	if (!(child && child.parent && sortFunction)) { return null; }
	var children = child.parent.children.getArray();
	for (var i = 0; i < children.length; i++) {
		var test = sortFunction(child, children[i]);
		if (test == -1) {
			return i;
		}
	}
	return i;
};

/**
 * Sends a request to the server. Note that it's done asynchronously, but
 * there is no callback given. Hence, an organizer action is the last thing
 * done before returning to the event loop. The result of the action is
 * handled via notifications.
 *
 * @param {String}	action		the operation to perform
 * @param {Hash}	attrs		a hash of additional attributes to set in the request
 * @param {ZmBatchCommand}	batchCmd	the batch command that contains this request
 *
 * @private
 */
ZmOrganizer.prototype._organizerAction =
function(params) {

	var cmd = ZmOrganizer.SOAP_CMD[this.type] + "Request";
	var request = {
		_jsns: "urn:zimbraMail",
		action : {
			op: params.action,
			id: params.id || this.id
		}
	};
	var jsonObj = {};
	jsonObj[cmd] = request;

	for (var attr in params.attrs) {
		if (AjxEnv.isIE) {
			params.attrs[attr] += ""; //To string
		}
		request.action[attr] = params.attrs[attr];
	}
	var actionController = appCtxt.getActionController();
	actionController.dismiss();
	var actionLogItem = (!params.noUndo && actionController && actionController.actionPerformed({op: params.action, id: params.id || this.id, attrs: params.attrs})) || null;
	var respCallback = new AjxCallback(this, this._handleResponseOrganizerAction, [params, actionLogItem]);
	if (params.batchCmd) {
        params.batchCmd.addRequestParams(jsonObj, respCallback, params.errorCallback);
 	}
	else {
		var accountName;
		if (appCtxt.multiAccounts) {
			accountName = (this.account)
				? this.account.name : appCtxt.accountList.mainAccount.name;
		}
		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			accountName: accountName,
			callback: respCallback,
			errorCallback: params.errorCallback,
			timeout: params.timeout,
			noBusyOverlay: params.noBusyOverlay
		});
	}
};

/**
 * @private
 */
ZmOrganizer.prototype._handleResponseOrganizerAction =
function(params, actionLogItem, result) {

	if (actionLogItem) {
		actionLogItem.setComplete();
	}
	if (params.callback) {
		params.callback.run(result);
	}
	if (params.actionTextKey) {
		var actionController = appCtxt.getActionController();
		var summary = ZmOrganizer.getActionSummary({
			actionTextKey:  params.actionTextKey,
			numItems:       params.numItems || 1,
			type:           this.type,
			orgName:        params.orgName,
			actionArg:      params.actionArg
		});
		var undoLink = actionLogItem && actionController && actionController.getUndoLink(actionLogItem);
		if (undoLink && actionController) {
			actionController.onPopup();
			appCtxt.setStatusMsg({msg: summary, button:undoLink, transitions: actionController.getStatusTransitions()});
		} else {
			appCtxt.setStatusMsg(summary);
		}
	}
};

/**
 * Returns a string describing an action, intended for display as toast to tell the
 * user what they just did.
 *
 * @param   {Object}        params          hash of params:
 *          {String}        type            organizer type (ZmOrganizer.*)
 *          {String}        actionTextKey   ZmMsg key for text string describing action
 *          {String}        orgName         name of the organizer that was affected
 *          {String}        actionArg       (optional) additional argument
 *
 * @return {String}     action summary
 */
ZmOrganizer.getActionSummary =
function(params) {

	var type = params.type,
		typeKey = ZmOrganizer.FOLDER_KEY[type],
		typeText = ZmMsg[typeKey],
		capKey = AjxStringUtil.capitalize(typeKey),
		alternateKey = params.actionTextKey + capKey,
		text = ZmMsg[alternateKey] || ZmMsg[params.actionTextKey],
		orgName = AjxStringUtil.htmlEncode(params.orgName),
		arg = AjxStringUtil.htmlEncode(params.actionArg);

	return AjxMessageFormat.format(text, [ typeText, orgName, arg ]);
};

/**
 * Test the name of this organizer and then descendants against the given name, case insensitively.
 * 
 * @private
 */
ZmOrganizer.prototype._getByName =
function(name, skipImap) {
	if (this.name && name == this.name.toLowerCase()) {
		return this;
	}

	var organizer;
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (organizer = a[i]._getByName(name, skipImap)) {
			if (skipImap && organizer.isDataSource(ZmAccount.TYPE_IMAP, true)) {
				continue;
			}
			return organizer;
		}
	}
	return null;
};

/**
 * Takes a string of flag chars and applies them to this organizer.
 * 
 * @private
 */
ZmOrganizer.prototype._parseFlags =
function(str) {
	for (var i = 0; i < ZmOrganizer.ALL_FLAGS.length; i++) {
		var flag = ZmOrganizer.ALL_FLAGS[i];
		this[ZmOrganizer.FLAG_PROP[flag]] = (Boolean(str && (str.indexOf(flag) != -1)));
	}
};

/**
 * Converts this organizer's flag-related props into a string of flag chars.
 * 
 * @private
 */
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

/**
 * Adds a change listener.
 * 
 * @param	{AjxListener}	the listener
 */
ZmOrganizer.prototype.addChangeListener =
function(listener) {
	this.tree.addChangeListener(listener);
};

/**
 * Removes a change listener.
 * 
 * @param	{AjxListener}	the listener
 */
ZmOrganizer.prototype.removeChangeListener =
function(listener) {
	this.tree.removeChangeListener(listener);
};

/**
 * @private
 */
ZmOrganizer.prototype._setSharesFromJs =
function(obj) {

	// a folder object will have an acl with grants if this user has
	// shared it, or if it has been shared to this user with admin rights
	if (obj.acl && obj.acl.grant && obj.acl.grant.length > 0) {
		AjxDispatcher.require("Share");
		for (var i = 0; i < obj.acl.grant.length; i++) {
			var grant = obj.acl.grant[i];
			this.addShare(ZmShare.createFromJs(this, grant));
		}
	}
};

/**
 * Handle notifications through the tree.
 * 
 * @private
 */
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
 * Gets a marked-up version of the name.
 *
 * @param {String}	name			the name to mark up
 * @param {Boolean}	showUnread		if <code>true</code>, display the number of unread items (in parens)
 * @param {Boolean}	noMarkup		if <code>true</code>, do not return any HTML
 * 
 * @private
 */
ZmOrganizer.prototype._markupName = 
function(name, showUnread, noMarkup) {
	if (!noMarkup) {
		name = AjxStringUtil.htmlEncode(name, true);
	}
	if (showUnread && this.hasUnreadDescendent()) {
		if (this.numUnread > 0) {
            name = AjxMessageFormat.format(ZmMsg.folderUnread, [name, this.numUnread]);
		}
		if (!noMarkup) {
			name = ["<span style='font-weight:bold'>", name, "</span>"].join("");
		}
	}
	if (this.noSuchFolder && !noMarkup) {
		name = ["<del>", name, "</del>"].join("");
	}
	return name;
};

/**
 * @private
 */
ZmOrganizer.prototype._getItemsText =
function() {
	var result = ZmMsg[ZmOrganizer.ITEMS_KEY[this.type]];
	if (!result || this.isTrash()) {
		result = ZmMsg.items;
	}
	return result;
};

ZmOrganizer.prototype._getUnreadLabel = 
function() {
	return ZmMsg.unread;	
};

/**
 * Returns true if any descendent folders have unread messages.
 *
 * @returns {boolean}   true if any descendent folders have unread messages
 */
ZmOrganizer.prototype.hasUnreadDescendent = function() {

	if (this.numUnread > 0) {
		return true;
	}

	var a = this.children.getArray(),
		sz = this.children.size();

	for (var i = 0; i < sz; i++) {
		if (a[i].hasUnreadDescendent()) {
			return true;
		}
	}

	return false;
};
