/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains a share class.
 */

/**
 * Creates a share with the given information about the sharer, the sharee, and
 * what is being shared.
 * @class
 * A share comprises information about an object that is shared by one user with
 * another user. Currently, only organizers may be shared.
 * <br/>
 * <br/>
 * XML representation:
 * <pre>
 * &lt;!ELEMENT share (grantee,grantor,link)>
 * &lt;!ATTLIST share xmlns CDATA #FIXED "urn:zimbraShare">
 * &lt;!ATTLIST share version NMTOKEN #FIXED "0.1">
 * &lt;!ATTLIST share action (new|edit|delete|accept|decline) #REQUIRED>
 *
 * &lt;!ELEMENT grantee EMPTY>
 * &lt;!ATTLIST grantee id CDATA #REQUIRED>
 * &lt;!ATTLIST grantee name CDATA #REQUIRED>
 * &lt;!ATTLIST grantee email CDATA #REQUIRED>
 *
 * &lt;!ELEMENT grantor EMPTY>
 * &lt;!ATTLIST grantor id CDATA #REQUIRED>
 * &lt;!ATTLIST grantor name CDATA #REQUIRED>
 * &lt;!ATTLIST grantor email CDATA #REQUIRED>
 *
 * &lt;!ELEMENT link EMPTY>
 * &lt;!ATTLIST link id NMTOKEN #REQUIRED>
 * &lt;!ATTLIST link name CDATA #REQUIRED>
 * &lt;!ATTLIST link view (appointment|...) #REQUIRED>
 * &lt;!ATTLISt link perm CDATA #REQUIRED>
 * </pre>
 *
 * @author Andy Clark
 * 
 * @param	{Hash}	params		a hash of parameters
 * @param {Object}	params.object		the object being shared
 * @param {constant}	params.granteeType	the grantee type (see <code>ZmShare.TYPE_</code> constants) (everyone, or a single user)
 * @param {String}	params.granteeId		a unique ID for the grantee
 * @param {String}	params.granteeName	the grantee's name
 * @param {String}	granteePwd			the grantee's password
 * @param {constant}	params.perm		the grantee's permissions on the shared object
 * @param {Boolean}	params.inherit		if <code>true</code>, children inherit share info
 * @param {Boolean}	params.invalid		if <code>true</code>, the share is invalid
 */
ZmShare = function(params) {

	this.grantee = {};
	this.grantor = {};
	this.link = {};

	if (!params) { return; }
	this.object = params.object;
	this.grantee.type = params.granteeType;
	this.grantee.id = params.granteeId;
	this.grantee.name = params.granteeName || "";
	this.link.inh = params.inherit;
	this.link.pw = params.granteePwd;
	this.invalid = params.invalid;
	this.setPermissions(params.perm);
};

// Constants

ZmShare.URI = "urn:zimbraShare";
ZmShare.VERSION = "0.1";

// actions
/**
 * Defines the "new" action.
 * 
 * @type {String}
 */
ZmShare.NEW		= "new";
/**
 * Defines the "edit" action.
 * 
 * @type {String}
 */
ZmShare.EDIT	= "edit";
/**
 * Defines the "delete" action.
 * 
 * @type {String}
 */
ZmShare.DELETE	= "delete";
/**
 * Defines the "accept" action.
 * 
 * @type {String}
 */
ZmShare.ACCEPT	= "accept";
/**
 * Defines the "decline" action.
 * 
 * @type {String}
 */
ZmShare.DECLINE	= "decline";
/**
 * Defines the "notify" action.
 * 
 * @type {String}
 */
ZmShare.NOTIFY  = "notify";
/**
 * Defines the "resend" action.
 * 
 * @type {String}
 */
ZmShare.RESEND	= "resend";
/**
 * Defines the "revoke" action.
 * 
 * @type {String}
 */
ZmShare.REVOKE	= "revoke";

ZmShare.ACTION_LABEL = {};
ZmShare.ACTION_LABEL[ZmShare.EDIT]		= ZmMsg.edit;
ZmShare.ACTION_LABEL[ZmShare.RESEND]	= ZmMsg.resend;
ZmShare.ACTION_LABEL[ZmShare.REVOKE]	= ZmMsg.revoke;

// allowed permission bits
/**
 * Defines the "read" allowed permission.
 */
ZmShare.PERM_READ		= "r";
/**
 * Defines the "write" allowed permission.
 */
ZmShare.PERM_WRITE		= "w";
/**
 * Defines the "insert" allowed permission.
 */
ZmShare.PERM_INSERT		= "i";
/**
 * Defines the "delete" allowed permission.
 */
ZmShare.PERM_DELETE		= "d";
/**
 * Defines the "admin" allowed permission.
 */
ZmShare.PERM_ADMIN		= "a";
/**
 * Defines the "workflow" allowed permission.
 */
ZmShare.PERM_WORKFLOW	= "x";
/**
 * Defines the "private" allowed permission.
 */
ZmShare.PERM_PRIVATE	= "p";

// virtual permissions
ZmShare.PERM_CREATE_SUBDIR	= "c";

// restricted permission bits
/**
 * Defines the "no read" restricted permission.
 */
ZmShare.PERM_NOREAD		= "-r";
/**
 * Defines the "no write" restricted permission.
 */
ZmShare.PERM_NOWRITE	= "-w";
/**
 * Defines the "no insert" restricted permission.
 */
ZmShare.PERM_NOINSERT	= "-i";
/**
 * Defines the "no delete" restricted permission.
 */
ZmShare.PERM_NODELETE	= "-d";
/**
 * Defines the "no admin" restricted permission.
 */
ZmShare.PERM_NOADMIN	= "-a";
/**
 * Defines the "no workflow" restricted permission.
 */
ZmShare.PERM_NOWORKFLOW	= "-x";

// allowed permission names
ZmShare.PERMS = {};
ZmShare.PERMS[ZmShare.PERM_READ]		= ZmMsg.shareActionRead;
ZmShare.PERMS[ZmShare.PERM_WRITE]		= ZmMsg.shareActionWrite;
ZmShare.PERMS[ZmShare.PERM_INSERT]		= ZmMsg.shareActionInsert;
ZmShare.PERMS[ZmShare.PERM_DELETE]		= ZmMsg.shareActionDelete;
ZmShare.PERMS[ZmShare.PERM_ADMIN]		= ZmMsg.shareActionAdmin;
ZmShare.PERMS[ZmShare.PERM_WORKFLOW]	= ZmMsg.shareActionWorkflow;

// restricted permission names
ZmShare.PERMS[ZmShare.PERM_NOREAD]		= ZmMsg.shareActionNoRead;
ZmShare.PERMS[ZmShare.PERM_NOWRITE]		= ZmMsg.shareActionNoWrite;
ZmShare.PERMS[ZmShare.PERM_NOINSERT]	= ZmMsg.shareActionNoInsert;
ZmShare.PERMS[ZmShare.PERM_NODELETE]	= ZmMsg.shareActionNoDelete;
ZmShare.PERMS[ZmShare.PERM_NOADMIN]		= ZmMsg.shareActionNoAdmin;
ZmShare.PERMS[ZmShare.PERM_NOWORKFLOW]	= ZmMsg.shareActionNoWorkflow;

// role permissions
/**
 * Defines the "none" role.
 * 
 * @type {String}
 */
ZmShare.ROLE_NONE		= "NONE";
/**
 * Defines the "viewer" role.
 * 
 * @type {String}
 */
ZmShare.ROLE_VIEWER		= "VIEWER";
/**
 * Defines the "manager" role.
 * 
 * @type {String}
 */
ZmShare.ROLE_MANAGER	= "MANAGER";
/**
 * Defines the "admin" role.
 * 
 * @type {String}
 */
ZmShare.ROLE_ADMIN		= "ADMIN";

// role names
ZmShare.ROLE_TEXT = {};
ZmShare.ROLE_TEXT[ZmShare.ROLE_NONE]	= ZmMsg.shareRoleNone;
ZmShare.ROLE_TEXT[ZmShare.ROLE_VIEWER]	= ZmMsg.shareRoleViewer;
ZmShare.ROLE_TEXT[ZmShare.ROLE_MANAGER]	= ZmMsg.shareRoleManager;
ZmShare.ROLE_TEXT[ZmShare.ROLE_ADMIN]	= ZmMsg.shareRoleAdmin;

ZmShare.ROLE_PERMS = {};
ZmShare.ROLE_PERMS[ZmShare.ROLE_NONE]		= "";
ZmShare.ROLE_PERMS[ZmShare.ROLE_VIEWER]		= "r";
ZmShare.ROLE_PERMS[ZmShare.ROLE_MANAGER]	= "rwidx";
ZmShare.ROLE_PERMS[ZmShare.ROLE_ADMIN]		= "rwidxa";

/**
 * Defines the "all" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_ALL	= "all";
/**
 * Defines the "user" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_USER	= "usr";
/**
 * Defines the "group" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_GROUP	= "grp";
/**
 * Defines the "domain" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_DOMAIN	= "dom";
/**
 * Defines the "COS" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_COS	= "cos";
/**
 * Defines the "guest" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_GUEST	= "guest";
/**
 * Defines the "public" type.
 * 
 * @type {String}
 */
ZmShare.TYPE_PUBLIC	= "pub";

ZmShare.ZID_ALL = "00000000-0000-0000-0000-000000000000";
ZmShare.ZID_PUBLIC = "99999999-9999-9999-9999-999999999999";

ZmShare.SHARE = "SHARE";
ZmShare.GRANT = "GRANT";

// message subjects
ZmShare._SUBJECTS = {};
ZmShare._SUBJECTS[ZmShare.NEW] = ZmMsg.shareCreatedSubject;
ZmShare._SUBJECTS[ZmShare.EDIT] = ZmMsg.shareModifiedSubject;
ZmShare._SUBJECTS[ZmShare.DELETE] = ZmMsg.shareRevokedSubject;
ZmShare._SUBJECTS[ZmShare.ACCEPT] = ZmMsg.shareAcceptedSubject;
ZmShare._SUBJECTS[ZmShare.DECLINE] = ZmMsg.shareDeclinedSubject;
ZmShare._SUBJECTS[ZmShare.NOTIFY]  = ZmMsg.shareNotifySubject;

// formatters
ZmShare._TEXT = null;
ZmShare._HTML = null;
ZmShare._HTML_NOTE = null;
ZmShare._XML = null;

// Utility methods

/**
 * Gets the role name.
 * 
 * @param	{constant}	role		the role (see <code>ZmShare.ROLE_</code> constants)
 * @return	{String}	the name
 */
ZmShare.getRoleName =
function(role) {
	return ZmShare.ROLE_TEXT[role] || ZmMsg.shareRoleCustom;
};

/**
 * Gets the role actions.
 * 
 * @param	{constant}	role		the role (see <code>ZmShare.ROLE_</code> constants)
 * @return	{String}	the actions
 */
ZmShare.getRoleActions =
function(role) {
	var perm = ZmShare.ROLE_PERMS[role];
	var actions = [];
	if (perm) {
		for (var i = 0; i < perm.length; i++) {
			var c = perm.charAt(i);
			if (c == "-") {
				c += perm.charAt(++i);
			}
			actions.push(ZmShare.PERMS[c]);
		}
	}
	return (actions.length > 0) ? actions.join(", ") : ZmMsg.shareActionNone;
};

// role action names
ZmShare.ACTIONS = {};
ZmShare.ACTIONS[ZmShare.ROLE_NONE]		= ZmShare.getRoleActions(ZmShare.ROLE_NONE);
ZmShare.ACTIONS[ZmShare.ROLE_VIEWER]	= ZmShare.getRoleActions(ZmShare.ROLE_VIEWER);
ZmShare.ACTIONS[ZmShare.ROLE_MANAGER]	= ZmShare.getRoleActions(ZmShare.ROLE_MANAGER);
ZmShare.ACTIONS[ZmShare.ROLE_ADMIN]		= ZmShare.getRoleActions(ZmShare.ROLE_ADMIN);

// Static methods

/**
 * Creates the share from the DOM.
 * 
 * @param	{Object}	doc		the document
 * @return	{ZmShare}	the resulting share
 */
ZmShare.createFromDom =
function(doc) {
	// NOTE: This code initializes share info from the Zimbra share format, v0.1
	var share = new ZmShare();

	var shareNode = doc.documentElement;
	share.version = shareNode.getAttribute("version");
	if (share.version != ZmShare.VERSION) {
		throw "Zimbra share version must be " + ZmShare.VERSION;
	}
	share.action = shareNode.getAttribute("action");
	
	// NOTE: IE's getElementsByTagName doesn't seem to return the specified
	//		 tags when they're in a namespace. Will have to do this the
	//		 old-fashioned way because I'm tired of fighting with it...
	var child = shareNode.firstChild;
	while (child != null) {
		switch (child.nodeName) {
			case "grantee": case "grantor": {
				share[child.nodeName].id = child.getAttribute("id");
				share[child.nodeName].email = child.getAttribute("email");
				share[child.nodeName].name = child.getAttribute("name");
				break;
			}
			case "link": {
				share.link.id = child.getAttribute("id");
				share.link.name = child.getAttribute("name");
				share.link.view = child.getAttribute("view");
				share.link.perm = child.getAttribute("perm");
				break;
			}
		}
		child = child.nextSibling;
	}

	return share;
};

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmShare.prototype.toString =
function() {
	return "ZmShare";
};

/**
 * Sets the permission.
 * 
 * @param	{constant}	perm		the permission (see <code>ZmShare.PERM_</code> constants)
 */
ZmShare.prototype.setPermissions =
function(perm) {
	this.link.perm = perm;
	this.link.role = ZmShare._getRoleFromPerm(perm);
};

/**
 * Checks if the given permission exists on this share.
 * 
 * @param	{constant}	perm		the permission (see <code>ZmShare.PERM_</code> constants)
 * @return	{Boolean}	<code>true</code> if the permission is allowed on this share
 */
ZmShare.prototype.isPermAllowed =
function(perm) {
	if (this.link.perm) {
		var positivePerms = this.link.perm.replace(/-./g, "");
		return (positivePerms.indexOf(perm) != -1);
	}
	return false;
};

/**
 * Checks if the given permission is restricted for this share.
 *
 * @param	{constant}	perm		the permission (see <code>ZmShare.PERM_</code> constants)
 * @return	{Boolean}	<code>true</code> if the permission is restricted on this share
 */
ZmShare.prototype.isPermRestricted =
function(perm) {
	if (this.link.perm) {
		return (this.link.perm.indexOf("-" + perm) != -1);
	}
	return false;
};

// Methods that return whether a particular permission exists on this share
/**
 * Checks if the read permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the read permission is allowed on this share
 * @see ZmShare.PERM_READ
 */
ZmShare.prototype.isRead = function() { return this.isPermAllowed(ZmShare.PERM_READ); };
/**
 * Checks if the write permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the write permission is allowed on this share
 * @see ZmShare.PERM_WRITE
 */
ZmShare.prototype.isWrite = function() { return this.isPermAllowed(ZmShare.PERM_WRITE); };
/**
 * Checks if the insert permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the insert permission is allowed on this share
 * @see ZmShare.PERM_INSERT
 */
ZmShare.prototype.isInsert = function() { return this.isPermAllowed(ZmShare.PERM_INSERT); };
/**
 * Checks if the delete permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the delete permission is allowed on this share
 * @see ZmShare.PERM_DELETE
 */
ZmShare.prototype.isDelete = function() { return this.isPermAllowed(ZmShare.PERM_DELETE); };
/**
 * Checks if the admin permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the admin permission is allowed on this share
 * @see ZmShare.PERM_ADMIN
 */
ZmShare.prototype.isAdmin = function() { return this.isPermAllowed(ZmShare.PERM_ADMIN); };
/**
 * Checks if the workflow permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the workflow permission is allowed on this share
 * @see ZmShare.PERM_WORKFLOW
 */
ZmShare.prototype.isWorkflow = function() { return this.isPermAllowed(ZmShare.PERM_WORKFLOW); };
/**
 * Checks if the private permission exists on this share.
 * 
 * @return	{Boolean}	<code>true</code> if the private permission is allowed on this share
 * @see ZmShare.PERM_PRIVATE
 */
ZmShare.prototype.hasPrivateAccess = function() { return this.isPermAllowed(ZmShare.PERM_PRIVATE); };

// Protected static methods

/**
 * @private
 */
ZmShare._getFolderType =
function(view) {
	var folderKey = (view && ZmOrganizer.FOLDER_KEY[ZmOrganizer.TYPE[view]]) || "folder";
	return ZmMsg[folderKey];
};


// Static methods

/**
 * Creates the share from JS.
 * 
 * @param	
 * @return	{ZmShare}	the resulting share
 */
ZmShare.createFromJs =
function(parent, grant) {
	return new ZmShare({object:parent, granteeType:grant.gt, granteeId:grant.zid,
						granteeName:grant.d, perm:grant.perm, inherit:grant.inh,
						granteePwd:grant.pw, invalid:grant.invalid});
};

// Public methods
/**
 * Checks if the grantee type is "all".
 * 
 * @return	{Boolean}	<code>true</code> if type "all"
 * @see		ZmShare.TYPE_ALL
 */
ZmShare.prototype.isAll =
function() {
	return this.grantee.type == ZmShare.TYPE_ALL;
};
/**
 * Checks if the grantee type is "user".
 * 
 * @return	{Boolean}	<code>true</code> if type "user"
 * @see		ZmShare.TYPE_USER
 */
ZmShare.prototype.isUser =
function() {
	return this.grantee.type == ZmShare.TYPE_USER;
};
/**
 * Checks if the grantee type is "group".
 * 
 * @return	{Boolean}	<code>true</code> if type "group"
 * @see		ZmShare.TYPE_GROUP
 */
ZmShare.prototype.isGroup =
function() {
	return this.grantee.type == ZmShare.TYPE_GROUP;
};
/**
 * Checks if the grantee type is "domain".
 * 
 * @return	{Boolean}	<code>true</code> if type "domain"
 * @see		ZmShare.TYPE_DOMAIN
 */
ZmShare.prototype.isDomain =
function() {
	return this.grantee.type == ZmShare.TYPE_DOMAIN;
};
/**
 * Checks if the grantee type is "guest".
 * 
 * @return	{Boolean}	<code>true</code> if type "guest"
 * @see		ZmShare.TYPE_GUEST
 */
ZmShare.prototype.isGuest =
function() {
	return this.grantee.type == ZmShare.TYPE_GUEST;
};
/**
 * Checks if the grantee type is "public".
 * 
 * @return	{Boolean}	<code>true</code> if type "public"
 * @see		ZmShare.TYPE_PUBLIC
 */
ZmShare.prototype.isPublic =
function() {
	return (this.grantee.type == ZmShare.TYPE_PUBLIC);
};

/**
 * Grants the permission.
 * 
 * @param	{constant}	perm	the permission (see <code>ZmShare.PERM_</code> constants)
 * @param	{String}	pw		
 * @param	{ZmBatchCommand}	batchCmd	the batch command
 */
ZmShare.prototype.grant =
function(perm, pw, batchCmd) {
	this.link.perm = perm;
	var respCallback = new AjxCallback(this, this._handleResponseGrant);
	this._shareAction("grant", null, {perm: perm, pw: pw}, respCallback, batchCmd);
};

/**
 * @private
 */
ZmShare.prototype._handleResponseGrant =
function(result) {
	var action = result.getResponse().FolderActionResponse.action;
	this.grantee.id = action.zid;
	this.grantee.email = action.d;
};

/**
 * Revokes the share.
 * 
 * @param	{AjxCallback}	callback	the callback
 */
ZmShare.prototype.revoke = 
function(callback) {
	var isAllShare = this.grantee && (this.grantee.type == ZmShare.TYPE_ALL);
	var actionAttrs = { zid: this.isPublic() ? ZmShare.ZID_PUBLIC : isAllShare ? ZmShare.ZID_ALL : this.grantee.id };
	var respCallback = new AjxCallback(this, this._handleResponseRevoke, [callback]);
	this._shareAction("!grant", actionAttrs, null, respCallback);
};

/**
 * Revokes multiple shares.
 * 
 * @param	{AjxCallback}	callback	the callback
 * @param	{Object}	args		not used
 * @param	{ZmBatchCommand}	batchCmd	the batch command
 */
ZmShare.prototype.revokeMultiple =
function(callback, args, batchCmd) {
	var actionAttrs = { zid: this.isPublic() ? ZmShare.ZID_PUBLIC : this.grantee.id };
	var respCallback = new AjxCallback(this, this._handleResponseRevoke, [callback]);
	this._shareAction("!grant", actionAttrs, null, respCallback, batchCmd);
};

/**
 * @private
 */
ZmShare.prototype._handleResponseRevoke =
function(callback) {
	if (callback) {
		callback.run();
	}
};

/**
 * Accepts the share.
 * 
 */
ZmShare.prototype.accept = 
function(name, color, replyType, notes, callback, owner) {
	var respCallback = new AjxCallback(this, this._handleResponseAccept, [replyType, notes, callback, owner]);
	var params = {
		l: ZmOrganizer.ID_ROOT,
		name: name,
		zid: this.grantor.id,
		rid: ZmOrganizer.normalizeId(this.link.id),
		color: color,
		view: this.link.view
	};
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED) && ZmOrganizer.VIEW_HASH[ZmOrganizer.CALENDAR][this.link.view]) {
		params.f = ZmOrganizer.FLAG_CHECKED;
	}
	ZmMountpoint.create(params, respCallback);
};

/**
 * @private
 */
ZmShare.prototype._handleResponseAccept =
function(replyType, notes, callback, owner) {

	this.notes = notes;

	if (callback) {
		callback.run();
	}

	// check if we need to send message or bring up compose window
	if (replyType != ZmShareReply.NONE) {
		if (replyType == ZmShareReply.COMPOSE) {
			this.composeMessage(ZmShare.ACCEPT, null, owner);
		} else {
			this.sendMessage(ZmShare.ACCEPT, null, owner);
		}
	}
};

/**
 * Sends a message.
 * 
 * @param	{constant}			mode		the request mode
 * @param	{AjxVector}			addrs		a vector of {@link AjxEmailAddress} objects or <code>null</code> to send to the grantee
 * @param	{String}			owner		the message owner
 * @param	{ZmBatchCommand}	batchCmd	batchCommand to put the SendMsgRequest into or <code>null</code> to send the message immediately
 */
ZmShare.prototype.sendMessage =
function(mode, addrs, owner, batchCmd) {
	// generate message
	if (!addrs) {
		var email = this.grantee.email;
		addrs = new AjxVector();
		addrs.add(new AjxEmailAddress(email, AjxEmailAddress.TO));
	}
	var msg = this._createMsg(mode, false, addrs, owner);
	var accountName = appCtxt.multiAccounts ? this.object.getAccount().name : null;

	// send message
	msg.send(false, null, null, accountName, false, false, batchCmd);
};

/**
 * Composes a message.
 * 
 * @param	{constant}	mode	the request mode
 * @param	{AjxVector}	addrs	a vector of {@link AjxEmailAddress} objects or <code>null</code> to send to the grantee
 * @param	{String}	owner	the message owner
 */
ZmShare.prototype.composeMessage =
function(mode, addrs, owner) {
	// generate message
	if (!addrs) {
		var email = this.grantee.email;
		addrs = new AjxVector();
		addrs.add(new AjxEmailAddress(email, AjxEmailAddress.TO));
	}

	var msg = this._createMsg(mode, true, addrs, owner);

	// NOTE: Assumes text, html, and xml parts are in the top part
	var parts = msg._topPart.children;
	var textPart = parts.get(0);
	var htmlPart = parts.get(1);
	var xmlPart = parts.get(2);
	msg.setBodyParts([ textPart.node, htmlPart.node, xmlPart.node ]);
	AjxDispatcher.run("Compose", {action: ZmOperation.SHARE, inNewWindow: true, msg: msg});
};


// Protected methods

/**
 * text formatters
 * 
 * @private
 */
ZmShare._getText =
function(mode) {
	if (!ZmShare._TEXT) {
		ZmShare._TEXT = {};
		ZmShare._TEXT[ZmShare.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedText);
		ZmShare._TEXT[ZmShare.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedText);
		ZmShare._TEXT[ZmShare.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedText);
		ZmShare._TEXT[ZmShare.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedText);
		ZmShare._TEXT[ZmShare.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedText);
		ZmShare._TEXT[ZmShare.NOTIFY] = new AjxMessageFormat(ZmMsg.shareNotifyText);
	}
	return ZmShare._TEXT[mode];
};
	
/**
 * html formatters
 * 
 * @private
 */
ZmShare._getHtml =
function(mode) {
	if (!ZmShare._HTML) {
		ZmShare._HTML = {};
		ZmShare._HTML[ZmShare.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedHtml);
		ZmShare._HTML[ZmShare.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedHtml);
		ZmShare._HTML[ZmShare.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedHtml);
		ZmShare._HTML[ZmShare.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedHtml);
		ZmShare._HTML[ZmShare.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedHtml);
		ZmShare._HTML[ZmShare.NOTIFY] = new AjxMessageFormat(ZmMsg.shareNotifyHtml);
	}
	return ZmShare._HTML[mode];
};

/**
 * @private
 */
ZmShare._getHtmlNote =
function() {
	if (!ZmShare._HTML_NOTE) {
		ZmShare._HTML_NOTE = new AjxMessageFormat(ZmMsg.shareNotesHtml);
	}
	return ZmShare._HTML_NOTE;
};

/**
 * xml formatter
 * 
 * @private
 */
ZmShare._getXml =
function() {
	if (!ZmShare._XML) {
		var pattern = [
			'<share xmlns="{0}" version="{1}" action="{2}" >',
			'  <grantee id="{3}" email="{4}" name="{5}" />',
			'  <grantor id="{6}" email="{7}" name="{8}" />',
			'  <link id="{9}" name="{10}" view="{11}" perm="{12}" />',
			'  <notes>{13}</notes>',
			'</share>'
		].join("\n");
		ZmShare._XML = new AjxMessageFormat(pattern);
	}
	return ZmShare._XML;
};


/**
 * General method for handling the SOAP call. 
 * 
 * <strong>Note:</strong> Exceptions need to be handled by calling method.
 * 
 * @private
 */
ZmShare.prototype._shareAction =
function(operation, actionAttrs, grantAttrs, callback, batchCmd) {
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");

	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", operation);
	if (this.object.rid && this.object.zid) {
		actionNode.setAttribute("id", this.object.zid + ":" + this.object.rid);
	} else {
		actionNode.setAttribute("id", this.object.id);
	}
	for (var attr in actionAttrs) {
		actionNode.setAttribute(attr, actionAttrs[attr]);
	}

	if (operation != "!grant") {
		var shareNode = soapDoc.set("grant", null, actionNode);
		shareNode.setAttribute("gt", this.grantee.type);
		if (this.link.inh) {
			shareNode.setAttribute("inh", "1");
		}
		if (!this.isPublic()) {
			shareNode.setAttribute("d", this.grantee.name);
		}
		for (var attr in grantAttrs) {
			shareNode.setAttribute(attr, (grantAttrs[attr] || ""));
		}
	}
	var respCallback = new AjxCallback(this, this._handleResponseShareAction, [callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorShareAction);
	
	if (batchCmd) {
		batchCmd.addRequestParams(soapDoc, respCallback, errorCallback);
	} else {
		appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
													  callback: respCallback, errorCallback: errorCallback});
	}
};

/**
 * @private
 */
ZmShare.prototype._handleResponseShareAction =
function(callback, result) {
	if (callback) {
		callback.run(result);
	}
};

/**
 * @private
 */
ZmShare.prototype._handleErrorShareAction =
function(ex) {
	var message = ZmMsg.unknownError;
	if (ex instanceof ZmCsfeException && ex.code == "account.NO_SUCH_ACCOUNT") {
		if (!this._unknownUserFormatter) {
			this._unknownUserFormatter = new AjxMessageFormat(ZmMsg.unknownUser);
		}
		message = this._unknownUserFormatter.format(this.grantee.name);
		// NOTE: This prevents details from being shown
		ex = null;
	}

	appCtxt.getAppController().popupErrorDialog(message, ex, null, true);
	return true;
};

/**
 * @private
 */
ZmShare.prototype._createMsg =
function(mode, isCompose, addrs, owner) {
	// generate message
	var textPart = this._createTextPart(mode, isCompose);
	var htmlPart = this._createHtmlPart(mode, isCompose);

	var topPart = new ZmMimePart();
	topPart.setContentType(ZmMimeTable.MULTI_ALT);
	topPart.children.add(textPart);
	topPart.children.add(htmlPart);

	if (mode != ZmShare.NOTIFY) {
		var xmlPart = this._createXmlPart(mode);
		topPart.children.add(xmlPart);
	}

	var msg = new ZmMailMsg();
	if (mode == ZmShare.ACCEPT || mode == ZmShare.DECLINE) {
		msg.setAddress(AjxEmailAddress.FROM, new AjxEmailAddress(this.grantee.email, AjxEmailAddress.FROM));
		var fromAddrs = new AjxVector();
		if (owner && owner != this.grantor.email) {
			fromAddrs.add(new AjxEmailAddress(owner, AjxEmailAddress.TO));
		}
		fromAddrs.add(new AjxEmailAddress(this.grantor.email, AjxEmailAddress.TO));
		msg.setAddresses(AjxEmailAddress.TO, fromAddrs);
	} else {
		msg.setAddress(AjxEmailAddress.FROM, new AjxEmailAddress(this.grantee.email, AjxEmailAddress.FROM));
		var addrType = (addrs.size() > 1) ? AjxEmailAddress.BCC : AjxEmailAddress.TO;
		msg.setAddresses(addrType, addrs);
	}
    //bug:10008 modified subject to support subject normalization for conversation
    msg.setSubject(ZmShare._SUBJECTS[mode] + ": " + AjxMessageFormat.format(ZmMsg.sharedBySubject, [this.link.name, this.grantor.name]));	
	msg.setTopPart(topPart);

	return msg;
};

/**
 * @private
 */
ZmShare.prototype._createTextPart =
function(mode, isCompose) {
	var formatter = ZmShare._getText(mode);
	var content = this._createContent(formatter);
	if (this.notes || isCompose) {
		var notes = this.notes;
		content = [content, ZmItem.NOTES_SEPARATOR, notes].join("\n");
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);

	return mimePart;
};

/**
 * @private
 */
ZmShare.prototype._createHtmlPart =
function(mode, isCompose) {
	var formatter = ZmShare._getHtml(mode);
	var content = this._createContent(formatter);
	if (this.notes || isCompose) {
		formatter = ZmShare._getHtmlNote();
		var notes = AjxStringUtil.nl2br(AjxStringUtil.htmlEncode(this.notes));
		content = [content, formatter.format(notes)].join("");
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_HTML);
	mimePart.setContent(content);

	return mimePart;
};

/**
 * @private
 */
ZmShare.prototype._createXmlPart =
function(mode) {
	var folder = (appCtxt.isOffline) ? appCtxt.getFolderTree().getByPath(this.link.name) : null;
	var linkId = (folder) ? folder.id : this.link.id;
	var params = [
		ZmShare.URI, 
		ZmShare.VERSION, 
		mode,
		this.grantee.id, 
		this.grantee.email,
		AjxStringUtil.xmlAttrEncode(this.grantee.name),
		this.grantor.id, 
		this.grantor.email,
		AjxStringUtil.xmlAttrEncode(this.grantor.name),
		linkId,
		AjxStringUtil.xmlAttrEncode(this.link.name), 
		this.link.view, 
		this.link.perm,
		AjxStringUtil.xmlEncode(this.notes)
	];
	var content = ZmShare._getXml().format(params);

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.XML_ZIMBRA_SHARE);
	mimePart.setContent(content);

	return mimePart;
};

/**
 * @private
 */
ZmShare.prototype._createContent =
function(formatter) {
	var role = ZmShare._getRoleFromPerm(this.link.perm);
	var params = [
		this.link.name, 
		"(" + ZmShare._getFolderType(this.link.view) + ")",
		(this.object ? (this.object.owner || this.grantor.name) : this.grantor.name),
		this.grantee.name,
		ZmShare.getRoleName(role),
		ZmShare.getRoleActions(role)
	];
	return formatter.format(params);
};

/**
 * @private
 */
ZmShare._getRoleFromPerm =
function(perm) {
	if (!perm) { return ZmShare.ROLE_NONE; }

	if (perm.indexOf(ZmShare.PERM_ADMIN) != -1) {
		return ZmShare.ROLE_ADMIN;
	}
	if (perm.indexOf(ZmShare.PERM_WORKFLOW) != -1) {
		return ZmShare.ROLE_MANAGER;
	}
	if (perm.indexOf(ZmShare.PERM_READ) != -1) {
		return ZmShare.ROLE_VIEWER;
	}

	return ZmShare.ROLE_NONE;
};

/**
 * Revokes all grants for the given zid (one whose account has been
 * removed).
 *
 * @param {String}	zid			the zimbra ID
 * @param {constant}	granteeType	the grantee type (see <code>ZmShare.TYPE_</code> constants)
 * @param {AjxCallback}	callback		the client callback
 * @param {ZmBatchCommand}	batchCmd		the batch command
 */
ZmShare.revokeOrphanGrants =
function(zid, granteeType, callback, batchCmd) {

	var jsonObj = {
		FolderActionRequest: {
			_jsns:	"urn:zimbraMail",
			action:	{
				op:		"revokeorphangrants",
				id:		ZmFolder.ID_ROOT,
				zid:	zid,
				gt:		granteeType
			}
		}
	};

	if (batchCmd) {
		var respCallback = new AjxCallback(null, ZmShare._handleResponseRevokeOrphanGrants, [callback]);
		batchCmd.addRequestParams(jsonObj, respCallback);
	} else {
		appCtxt.getRequestMgr().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

/**
 * @private
 */
ZmShare._handleResponseRevokeOrphanGrants =
function(callback) {
	if (callback) {
		callback.run();
	}
};

/**
 * Creates or updates a ZmShare from share info that comes in JSON form from
 * GetShareInfoResponse.
 *
 * @param shareInfo	[object]		JSON representing share info
 * @param share		[ZmShare]*		share to update
 */
ZmShare.getShareFromShareInfo =
function(shareInfo, share) {

	share = share || new ZmShare();

	// grantee is the user, or a group they belong to
	share.grantee = share.grantee || {};
	if (shareInfo.granteeName)	{ share.grantee.name	= shareInfo.granteeName; }
	if (shareInfo.granteeId)	{ share.grantee.id		= shareInfo.granteeId; }
	if (shareInfo.granteeType)	{ share.grantee.type	= shareInfo.granteeType; }

	// grantor is the owner of the shared folder
	share.grantor = share.grantor || {};
	if (shareInfo.ownerEmail)	{ share.grantor.email	= shareInfo.ownerEmail; }
	if (shareInfo.ownerName)	{ share.grantor.name	= shareInfo.ownerName; }
	if (shareInfo.ownerId)		{ share.grantor.id		= shareInfo.ownerId; }

	// link is the shared folder
	share.link = share.link || {};
	share.link.view	= shareInfo.view || "message";
	if (shareInfo.folderId)		{ share.link.id		= shareInfo.folderId; }
	if (shareInfo.folderPath)	{ share.link.path	= shareInfo.folderPath; }
	if (shareInfo.folderPath)	{ share.link.name	= shareInfo.folderPath.substr(shareInfo.folderPath.lastIndexOf("/") + 1); }
	if (shareInfo.rights)		{ share.setPermissions(shareInfo.rights); }

	// mountpoint is the local folder, if the share has been accepted and mounted
	if (shareInfo.mid) {
		share.mounted		= true;
		share.mountpoint	= share.mountpoint || {};
		share.mountpoint.id	= shareInfo.mid;
		var mtpt = appCtxt.getById(share.mountpoint.id);
		if (mtpt) {
			share.mountpoint.name = mtpt.getName();
			share.mountpoint.path = mtpt.getPath();
		}
	}

	share.action	= "new";
	share.version	= "0.1";

	share.type = ZmShare.SHARE;

	return share;
};

/**
 * Creates or updates a ZmShare from a ZmOrganizer that's a mountpoint. The grantee is
 * the current user.
 *
 * @param link		[ZmFolder]		mountpoint
 * @param share		[ZmShare]*		share to update
 */
ZmShare.getShareFromLink =
function(link, share) {

	share = share || new ZmShare();

	// grantor is the owner of the shared folder
	share.grantor = share.grantor || {};
	if (link.owner)	{ share.grantor.email	= link.owner; }
	if (link.zid)	{ share.grantor.id		= link.zid; }

	// link is the shared folder
	share.link = share.link || {};
	share.link.view	= ZmOrganizer.VIEWS[link.type][0];
	if (link.rid)	{ share.link.id = link.rid; }

	var linkShare = link.getMainShare();
	share.link.name = linkShare ? linkShare.link.name : link.name;
	share.setPermissions(linkShare ? linkShare.link.perm : link.perm);

	// mountpoint is the local folder
	share.mounted = true;
	share.mountpoint = share.mountpoint || {};
	share.mountpoint.id		= link.id;
	share.mountpoint.name	= link.getName();
	share.mountpoint.path	= link.getPath();

	share.action	= "new";
	share.version	= "0.1";

	share.type = ZmShare.SHARE;

	return share;
};

/**
 * Updates a ZmShare that represents a grant
 *
 * @param share		[ZmShare]		folder grant
 * @param oldShare	[ZmShare]*		share to update
 */
ZmShare.getShareFromGrant =
function(share, oldShare) {

	share.link = share.link || {};
	share.link.id	= share.object && (share.object.nId || share.object.id);
	share.link.path = share.object && share.object.getPath();
	share.link.name = share.object && share.object.getName();

	share.type = ZmShare.GRANT;
	share.domId = oldShare && oldShare.domId;

	return share;
};
