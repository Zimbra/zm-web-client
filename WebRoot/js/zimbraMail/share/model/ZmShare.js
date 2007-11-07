/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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
 * Creates a share with the given information about the sharer, the sharee, and
 * what is being shared.
 * @constructor
 * @class
 * A share comprises information about an object that is shared by one user with
 * another user. Currently, only organizers may be shared.
 * <p>
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
 * </pre></p>
 *
 * @author Andy Clark
 * 
 * @param object		[object]		what is being shared
 * @param granteeType	[constant]*		sharee (everyone, or a single user)
 * @param granteeId		[string]*		a unique ID for the grantee
 * @param granteeName	[string]*		grantee's name
 * @param perm			[constant]*		grantee's permissions on the shared object
 * @param inherit		[boolean]*		if true, children inherit share info
 */
ZmShare = function(params) {

	this.grantee = {};
	this.grantor = {};
	this.link = {};

	if (!params) { return; }
	this.object = params.object;
	this.grantee.type = params.granteeType;
	this.grantee.id = params.granteeId;
	this.grantee.name = params.granteeName ? params.granteeName : "";
	this.link.perm = params.perm;
	this.link.inh = params.inherit;
	this.link.pw = params.granteePwd;
};

// Constants

ZmShare.URI = "urn:zimbraShare";
ZmShare.VERSION = "0.1";

// actions
ZmShare.NEW		= "new";
ZmShare.EDIT	= "edit";
ZmShare.DELETE	= "delete";
ZmShare.ACCEPT	= "accept";
ZmShare.DECLINE	= "decline";

// allowed permission bits
ZmShare.PERM_READ		= "r";
ZmShare.PERM_WRITE		= "w";
ZmShare.PERM_INSERT		= "i";
ZmShare.PERM_DELETE		= "d";
ZmShare.PERM_ADMIN		= "a";
ZmShare.PERM_WORKFLOW	= "x";

// virtual permissions
ZmShare.PERM_CREATE_SUBDIR	= "c";

// restricted permission bits
ZmShare.PERM_NOREAD		= "-r";
ZmShare.PERM_NOWRITE	= "-w";
ZmShare.PERM_NOINSERT	= "-i";
ZmShare.PERM_NODELETE	= "-d";
ZmShare.PERM_NOADMIN	= "-a";
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
ZmShare.ROLE_NONE		= "";
ZmShare.ROLE_VIEWER		= ZmShare.PERM_READ;
ZmShare.ROLE_MANAGER	= [ZmShare.PERM_READ, ZmShare.PERM_WRITE, ZmShare.PERM_INSERT,
						   ZmShare.PERM_DELETE, ZmShare.PERM_WORKFLOW].join("");

// role names
ZmShare.ROLES = {};
ZmShare.ROLES[ZmShare.ROLE_NONE]	= ZmMsg.shareRoleNone;
ZmShare.ROLES[ZmShare.ROLE_VIEWER]	= ZmMsg.shareRoleViewer;
ZmShare.ROLES[ZmShare.ROLE_MANAGER]	= ZmMsg.shareRoleManager;

ZmShare.TYPE_ALL	= "all";
ZmShare.TYPE_USER	= "usr";
ZmShare.TYPE_GROUP	= "grp";
ZmShare.TYPE_DOMAIN	= "dom";
ZmShare.TYPE_COS	= "cos";
ZmShare.TYPE_GUEST	= "guest";
ZmShare.TYPE_PUBLIC	= "pub";

ZmShare.ZID_ALL = "00000000-0000-0000-0000-000000000000";
ZmShare.ZID_PUBLIC = "99999999-9999-9999-9999-999999999999";

// message subjects
ZmShare._SUBJECTS = {};
ZmShare._SUBJECTS[ZmShare.NEW] = ZmMsg.shareCreatedSubject;
ZmShare._SUBJECTS[ZmShare.EDIT] = ZmMsg.shareModifiedSubject;
ZmShare._SUBJECTS[ZmShare.DELETE] = ZmMsg.shareRevokedSubject;
ZmShare._SUBJECTS[ZmShare.ACCEPT] = ZmMsg.shareAcceptedSubject;
ZmShare._SUBJECTS[ZmShare.DECLINE] = ZmMsg.shareDeclinedSubject;
	

// formatters
ZmShare._TEXT = null;
ZmShare._HTML = null;
ZmShare._HTML_NOTE = null;
ZmShare._XML = null;

// Utility methods

ZmShare.getRoleName =
function(perm) {
	return ZmShare.ROLES[perm] || ZmMsg.shareRoleCustom;
};

ZmShare.getRoleActions =
function(perm) {
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
	return actions.length > 0 ? actions.join(", ") : ZmMsg.shareActionNone;
};

// role action names
ZmShare.ACTIONS = {};
ZmShare.ACTIONS[ZmShare.ROLE_NONE]		= ZmShare.getRoleActions(ZmShare.ROLE_NONE);
ZmShare.ACTIONS[ZmShare.ROLE_VIEWER]	= ZmShare.getRoleActions(ZmShare.ROLE_VIEWER);
ZmShare.ACTIONS[ZmShare.ROLE_MANAGER]	= ZmShare.getRoleActions(ZmShare.ROLE_MANAGER);

// Static methods

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


ZmShare.prototype.toString =
function() {
	return "ZmShare";
};

/**
 * Returns true if the given permission exists on this share.
 * 
 * @param perm	[constant]	A single permission attribute (e.g. "r")
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
 * Returns true if the given permission is restricted for this share.
 *
 * @param perm	[constant]	A single permission attribute (e.g. "r")
*/
ZmShare.prototype.isPermRestricted =
function(perm) {
	if (this.link.perm) {
		return (this.link.perm.indexOf("-" + perm) != -1);
	}
	return false;
};

// Methods that return whether a particular permission exists on this share
ZmShare.prototype.isRead = function() { return this.isPermAllowed(ZmShare.PERM_READ); };
ZmShare.prototype.isWrite = function() { return this.isPermAllowed(ZmShare.PERM_WRITE); };
ZmShare.prototype.isInsert = function() { return this.isPermAllowed(ZmShare.PERM_INSERT); };
ZmShare.prototype.isDelete = function() { return this.isPermAllowed(ZmShare.PERM_DELETE); };
ZmShare.prototype.isAdmin = function() { return this.isPermAllowed(ZmShare.PERM_ADMIN); };
ZmShare.prototype.isWorkflow = function() { return this.isPermAllowed(ZmShare.PERM_WORKFLOW); };

// Protected static methods

ZmShare._getFolderType =
function(view) {
	if (view) {
		var type = ZmOrganizer.TYPE[view];
		var folderKey = ZmOrganizer.FOLDER_KEY[type] || "folder";
		return "(" + ZmMsg[folderKey] + ")";
	}
	return "";
};


// Static methods

ZmShare.createFromJs =
function(parent, grant) {
	return new ZmShare({object:parent, granteeType:grant.gt, granteeId:grant.zid,
						granteeName:grant.d, perm:grant.perm, inherit:grant.inh, granteePwd:grant.pw});
};

// Public methods

ZmShare.prototype.isAll =
function() {
	return this.grantee.type == ZmShare.TYPE_ALL;
};
ZmShare.prototype.isUser =
function() {
	return this.grantee.type == ZmShare.TYPE_USER;
};
ZmShare.prototype.isGroup =
function() {
	return this.grantee.type == ZmShare.TYPE_GROUP;
};
ZmShare.prototype.isDomain =
function() {
	return this.grantee.type == ZmShare.TYPE_DOMAIN;
};
ZmShare.prototype.isGuest =
function() {
	return this.grantee.type == ZmShare.TYPE_GUEST;
};
ZmShare.prototype.isPublic =
function() {
	return (this.grantee.type == ZmShare.TYPE_PUBLIC);
};

ZmShare.prototype.grant =
function(perm, args, batchCmd) {
	this.link.perm = perm;
	var respCallback = new AjxCallback(this, this._handleResponseGrant);
	this._shareAction("grant", null, {perm: perm, args: args}, respCallback, batchCmd);
};

ZmShare.prototype._handleResponseGrant =
function(result) {
	var action = result.getResponse().FolderActionResponse.action;
	this.grantee.id = action.zid;
	this.grantee.email = action.d;
};

ZmShare.prototype.revoke = 
function(callback) {
	var actionAttrs = { zid: this.isPublic() ? ZmShare.ZID_PUBLIC : this.grantee.id };
	var respCallback = new AjxCallback(this, this._handleResponseRevoke, [callback]);
	this._shareAction("!grant", actionAttrs, null, respCallback);
};

ZmShare.prototype._handleResponseRevoke =
function(callback) {
	if (callback) {
		callback.run();
	}
};

ZmShare.prototype.accept = 
function(name, color, replyType, notes, callback) {
	var respCallback = new AjxCallback(this, this._handleResponseAccept, [replyType, notes, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorAccept, name);
	var params = {
		"l": ZmOrganizer.ID_ROOT,
		"name": name,
		"zid": this.grantor.id,
		"rid": this.link.id,
		"color": color,
		"view": this.link.view
	};
	if (appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
		if (this.link.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR][0]) {
			params.f = ZmOrganizer.FLAG_CHECKED;
		}
	}
	ZmMountpoint.create(params, respCallback, errorCallback);
};

ZmShare.prototype._handleResponseAccept =
function(replyType, notes, callback) {

	this.notes = notes;

	if (callback) {
		callback.run();
	}

	// check if we need to send message or bring up compose window
	if (replyType != ZmShareReply.NONE) {
		if (replyType == ZmShareReply.COMPOSE)
			this.composeMessage(ZmShare.ACCEPT);
		else
			this.sendMessage(ZmShare.ACCEPT);
	}
};

ZmShare.prototype._handleErrorAccept =
function(name, ex) {
	var message = ZmMsg.unknownError;
	if (ex instanceof ZmCsfeException && ex.code == "mail.ALREADY_EXISTS") {
		message = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
		// NOTE: This prevents details from being shown
		ex = null;
	}
		
	appCtxt.getAppController().popupErrorDialog(message, ex, null, true);
	return true;
};

ZmShare.prototype.sendMessage =
function(mode, addrs) {
	// generate message
	if (!addrs) {
		var email = this.grantee.email;
		addrs = new AjxVector();
		addrs.add(new AjxEmailAddress(email, AjxEmailAddress.TO));
	}
	var msg = this._createMsg(mode, false, addrs);

	// send message
	msg.send(AjxDispatcher.run("GetContacts"));
};

ZmShare.prototype.composeMessage =
function(mode, addrs) {
	// generate message
	if (!addrs) {
		var email = this.grantee.email;
		addrs = new AjxVector();
		addrs.add(new AjxEmailAddress(email, AjxEmailAddress.TO));
	}

	var msg = this._createMsg(mode, true, addrs);

	// NOTE: Assumes text, html, and xml parts are in the top part
	var parts = msg._topPart.children;
	var textPart = parts.get(0);
	var htmlPart = parts.get(1);
	var xmlPart = parts.get(2);
	msg.setBodyParts([ textPart.node, htmlPart.node, xmlPart.node ]);
	AjxDispatcher.run("Compose", {action: ZmOperation.SHARE, inNewWindow: true, msg: msg});
};


// Protected methods

// text formatters
ZmShare._getText =
function(mode) {
	if (!ZmShare._TEXT) {
		ZmShare._TEXT = {};
		ZmShare._TEXT[ZmShare.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedText);
		ZmShare._TEXT[ZmShare.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedText);
		ZmShare._TEXT[ZmShare.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedText);
		ZmShare._TEXT[ZmShare.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedText);
		ZmShare._TEXT[ZmShare.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedText);
	}
	return ZmShare._TEXT[mode];
};
	
// html formatters
ZmShare._getHtml =
function(mode) {
	if (!ZmShare._HTML) {
		ZmShare._HTML = {};
		ZmShare._HTML[ZmShare.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedHtml);
		ZmShare._HTML[ZmShare.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedHtml);
		ZmShare._HTML[ZmShare.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedHtml);
		ZmShare._HTML[ZmShare.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedHtml);
		ZmShare._HTML[ZmShare.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedHtml);
	}
	return ZmShare._HTML[mode];
}
	
ZmShare._getHtmlNote =
function() {
	if (!ZmShare._HTML_NOTE) {
		ZmShare._HTML_NOTE = new AjxMessageFormat(ZmMsg.shareNotesHtml);
	}
	return ZmShare._HTML_NOTE;
};

// xml formatter
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
}


/**
 * General method for handling the SOAP call. 
 * <p>
 * <strong>Note:</strong>
 * Exceptions need to be handled by calling method.
 */
ZmShare.prototype._shareAction =
function(operation, actionAttrs, grantAttrs, callback, batchCmd) {
	var soapDoc = AjxSoapDoc.create("FolderActionRequest", "urn:zimbraMail");
	
	var actionNode = soapDoc.set("action");
	actionNode.setAttribute("op", operation);
	actionNode.setAttribute("id", this.object.id);
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
			if (grantAttrs[attr] != null)
				shareNode.setAttribute(attr, grantAttrs[attr]);
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

ZmShare.prototype._handleResponseShareAction =
function(callback, result) {
	if (callback) {
		callback.run(result);
	}
};

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

ZmShare.prototype._createMsg =
function(mode, isCompose, addrs) {
	// generate message
	var textPart = this._createTextPart(mode, isCompose);
	var htmlPart = this._createHtmlPart(mode, isCompose);
	var xmlPart = this._createXmlPart(mode);

	var topPart = new ZmMimePart();
	topPart.setContentType(ZmMimeTable.MULTI_ALT);
	topPart.children.add(textPart);
	topPart.children.add(htmlPart);
	topPart.children.add(xmlPart);

	var msg = new ZmMailMsg();
	var toEmail, fromEmail;
	if (mode == ZmShare.ACCEPT || mode == ZmShare.DECLINE) {
		msg.setAddress(AjxEmailAddress.FROM, new AjxEmailAddress(this.grantee.email, AjxEmailAddress.FROM));
		msg.setAddress(AjxEmailAddress.TO, new AjxEmailAddress(this.grantor.email), AjxEmailAddress.TO);
	} else {
		msg.setAddress(AjxEmailAddress.FROM, new AjxEmailAddress(this.grantee.email, AjxEmailAddress.FROM));
		var addrType = (addrs.size() > 1) ? AjxEmailAddress.BCC : AjxEmailAddress.TO;
		msg.setAddresses(addrType, addrs);
	}
	msg.setSubject(ZmShare._SUBJECTS[mode]);
	msg.setTopPart(topPart);

	return msg;
};

ZmShare.prototype._createTextPart =
function(mode, isCompose) {
	var formatter = ZmShare._getText(mode);
	var content = this._createContent(formatter);
	if (this.notes || isCompose) {
		var notes = this.notes;
		content = [content, ZmCalendarApp.NOTES_SEPARATOR, notes].join("\n");
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);

	return mimePart;
};

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

ZmShare.prototype._createXmlPart =
function(mode) {
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
		this.link.id, 
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

ZmShare.prototype._createContent =
function(formatter) {
	var params = [
		this.link.name, 
		ZmShare._getFolderType(this.link.view),
		this.grantor.name, 
		this.grantee.name,
		ZmShare.getRoleName(this.link.perm),
		ZmShare.getRoleActions(this.link.perm)
	];
	return formatter.format(params);
};
