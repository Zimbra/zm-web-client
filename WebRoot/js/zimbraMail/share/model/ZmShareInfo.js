//
// ZmShareInfo
//

/**
 * Share information.
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
 * </pre>
 */
function ZmShareInfo() {
	this.grantee = {};
	this.grantor = {};
	this.link = {};
}

// Utility methods

ZmShareInfo.getRoleName = function(perm) {
	return ZmShareInfo.ROLES[perm] || ZmMsg.shareRoleCustom;
}
ZmShareInfo.getRoleActions = function(perm) {
	var actions = [];
	for (var i = 0; i < perm.length; i++) {
		var c = perm.charAt(i);
		if (c == "-") {
			c += perm.charAt(++i);
		}
		actions.push(ZmShareInfo.PERMS[c]);
	}
	return actions.length > 0 ? actions.join(", ") : ZmMsg.shareActionNone;
}

// Constants

ZmShareInfo.URI = "urn:zimbraShare";
ZmShareInfo.VERSION = "0.1";

// actions
ZmShareInfo.NEW = "new";
ZmShareInfo.EDIT = "edit";
ZmShareInfo.DELETE = "delete";
ZmShareInfo.ACCEPT = "accept";
ZmShareInfo.DECLINE = "decline";

// allowed permission bits
ZmShareInfo.PERM_READ = "r";
ZmShareInfo.PERM_WRITE = "w";
ZmShareInfo.PERM_INSERT = "i";
ZmShareInfo.PERM_DELETE = "d";
ZmShareInfo.PERM_ADMIN = "a";
ZmShareInfo.PERM_WORKFLOW = "x";

// restricted permission bits
ZmShareInfo.PERM_NOREAD = "-r";
ZmShareInfo.PERM_NOWRITE = "-w";
ZmShareInfo.PERM_NOINSERT = "-i";
ZmShareInfo.PERM_NODELETE = "-d";
ZmShareInfo.PERM_NOADMIN = "-a";
ZmShareInfo.PERM_NOWORKFLOW = "-x";

// allowed permission names
ZmShareInfo.PERMS = {};
ZmShareInfo.PERMS[ZmShareInfo.PERM_READ] = ZmMsg.shareActionRead;
ZmShareInfo.PERMS[ZmShareInfo.PERM_WRITE] = ZmMsg.shareActionWrite;
ZmShareInfo.PERMS[ZmShareInfo.PERM_INSERT] = ZmMsg.shareActionInsert;
ZmShareInfo.PERMS[ZmShareInfo.PERM_DELETE] = ZmMsg.shareActionDelete;
ZmShareInfo.PERMS[ZmShareInfo.PERM_ADMIN] = ZmMsg.shareActionAdmin;
ZmShareInfo.PERMS[ZmShareInfo.PERM_WORKFLOW] = ZmMsg.shareActionWorkflow;

// restricted permission names
ZmShareInfo.PERMS[ZmShareInfo.PERM_NOREAD] = ZmMsg.shareActionNoRead;
ZmShareInfo.PERMS[ZmShareInfo.PERM_NOWRITE] = ZmMsg.shareActionNoWrite;
ZmShareInfo.PERMS[ZmShareInfo.PERM_NOINSERT] = ZmMsg.shareActionNoInsert;
ZmShareInfo.PERMS[ZmShareInfo.PERM_NODELETE] = ZmMsg.shareActionNoDelete;
ZmShareInfo.PERMS[ZmShareInfo.PERM_NOADMIN] = ZmMsg.shareActionNoAdmin;
ZmShareInfo.PERMS[ZmShareInfo.PERM_NOWORKFLOW] = ZmMsg.shareActionNoWorkflow;

// role permissions
ZmShareInfo.ROLE_NONE = "";
ZmShareInfo.ROLE_VIEWER = ZmShareInfo.PERM_READ;
ZmShareInfo.ROLE_MANAGER = ZmShareInfo.PERM_READ + ZmShareInfo.PERM_WRITE + ZmShareInfo.PERM_INSERT + ZmShareInfo.PERM_DELETE + ZmShareInfo.PERM_WORKFLOW;

// role names
ZmShareInfo.ROLES = {};
ZmShareInfo.ROLES[ZmShareInfo.ROLE_NONE] = ZmMsg.shareRoleNone;
ZmShareInfo.ROLES[ZmShareInfo.ROLE_VIEWER] = ZmMsg.shareRoleViewer;
ZmShareInfo.ROLES[ZmShareInfo.ROLE_MANAGER] = ZmMsg.shareRoleManager;

// role action names
ZmShareInfo.ACTIONS = {};
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_NONE] = ZmShareInfo.getRoleActions(ZmShareInfo.ROLE_NONE);
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_VIEWER] = ZmShareInfo.getRoleActions(ZmShareInfo.ROLE_VIEWER);
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_MANAGER] = ZmShareInfo.getRoleActions(ZmShareInfo.ROLE_MANAGER);

// Data

ZmShareInfo.prototype.action;
ZmShareInfo.prototype.version;
ZmShareInfo.prototype.grantee;
ZmShareInfo.prototype.grantor;
ZmShareInfo.prototype.link;

// Static methods

ZmShareInfo.createFromDom = function(doc) {
	// NOTE: This code initializes share info from the Zimbra share format, v0.1
	var shareInfo = new ZmShareInfo();
	
	var shareNode = doc.documentElement;
	shareInfo.version = shareNode.getAttribute("version");
	if (shareInfo.version != ZmShareInfo.VERSION) {
		throw "Zimbra share version must be "+ZmShareInfo.VERSION;
	}
	shareInfo.action = shareNode.getAttribute("action");
	
	// NOTE: IE's getElementsByTagName doesn't seem to return the specified
	//		 tags when they're in a namespace. Will have to do this the
	//		 old-fashioned way because I'm tired of fighting with it...
	var child = shareNode.firstChild;
	while (child != null) {
		switch (child.nodeName) {
			case "grantee": case "grantor": {
				shareInfo[child.nodeName].id = child.getAttribute("id");
				shareInfo[child.nodeName].email = child.getAttribute("email");
				shareInfo[child.nodeName].name = child.getAttribute("name");
				break;
			}
			case "link": {
				shareInfo.link.id = child.getAttribute("id");
				shareInfo.link.name = child.getAttribute("name");
				shareInfo.link.view = child.getAttribute("view");
				shareInfo.link.perm = child.getAttribute("perm");
				break;
			}
		}
		child = child.nextSibling;
	}
	
	return shareInfo;
}

ZmShareInfo.sendMessage = function(appCtxt, action, shareInfo) {
	// generate message
	var msg = ZmShareInfo._createMsg(appCtxt, action, shareInfo);

	// send message
	var contactsApp = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
	var contactList = contactsApp.getContactList();

	msg.send(contactList);
}
ZmShareInfo.composeMessage = function(appCtxt, action, shareInfo) {
	// generate message
	var msg = ZmShareInfo._createMsg(appCtxt, action, shareInfo, true);

	// initialize compose message
	var action = ZmOperation.SHARE;
	var inNewWindow = true;
	var toOverride = null;
	var subjOverride = null;
	var extraBodyText = null;

	var mailApp = appCtxt.getApp(ZmZimbraMail.MAIL_APP);
	var composeController = mailApp.getComposeController();

	// NOTE: Assumes text, html, and xml parts are in the top part
	var parts = msg._topPart.children;
	var textPart = parts.get(0);
	var htmlPart = parts.get(1);
	var xmlPart = parts.get(2);
	msg.setBodyParts([ textPart.node, htmlPart.node, xmlPart.node ]);
	composeController.doAction(action, inNewWindow, msg, toOverride, subjOverride, extraBodyText);
}
// Public methods

/** @param perm A single permission attribute (e.g. "r") */
ZmShareInfo.prototype.isPermAllowed = function(perm) {
	if (this.link.perm) {
		var regex = new RegExp("[^\\-]"+perm);
		return this.link.perm.match(regex);
	}
	return false;
}
/** @param perm A single permission attribute (e.g. "r") */
ZmShareInfo.prototype.isPermRestricted = function(perm) {
	if (this.link.perm) {
		var regex = new RegExp("-"+perm);
		return this.link.perm.match(regex);
	}
	return false;
}

ZmShareInfo.prototype.isRead = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_READ);
}
ZmShareInfo.prototype.isWrite = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_WRITE);
}
ZmShareInfo.prototype.isInsert = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_INSERT);
}
ZmShareInfo.prototype.isDelete = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_DELETE);
}
ZmShareInfo.prototype.isAdmin = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_ADMIN);
}
ZmShareInfo.prototype.isWorkflow = function() {
	return this.isPermAllowed(ZmShareInfo.PERM_WORKFLOW);
}

// Protected static methods

ZmShareInfo._createMsg = function(appCtxt, action, shareInfo, compose) {
	ZmShareInfo._init();

	// generate message
	var textPart = this._createTextPart(action, shareInfo, compose);
	var htmlPart = this._createHtmlPart(action, shareInfo, compose);
	var xmlPart = this._createXmlPart(action, shareInfo);		

	var topPart = new ZmMimePart();
	topPart.setContentType(ZmMimeTable.MULTI_ALT);
	topPart.children.add(textPart);
	topPart.children.add(htmlPart);
	topPart.children.add(xmlPart);

	var msg = new ZmMailMsg(appCtxt);
	var toEmail = shareInfo.grantee.email;
	var fromEmail = shareInfo.grantor.email;
	if (action == ZmShareInfo.ACCEPT || action == ZmShareInfo.DECLINE) {
		toEmail = shareInfo.grantor.email;
		fromEmail = shareInfo.grantee.email;
	}
	msg.setAddress(ZmEmailAddress.TO, new ZmEmailAddress(toEmail));
	msg.setAddress(ZmEmailAddress.FROM, new ZmEmailAddress(fromEmail, ZmEmailAddress.FROM));
	msg.setSubject(ZmShareInfo._SUBJECTS[action]);
	msg.setTopPart(topPart);
	return msg;
}

/** Assumes ZmShareInfo._init has been called. */
ZmShareInfo._createTextPart = function(action, shareInfo, compose) {
	var formatter = ZmShareInfo._TEXT[action];
	var content = this._createContent(formatter, shareInfo);
	if (shareInfo.notes || compose) {
		content += ZmAppt.NOTES_SEPARATOR + shareInfo.notes;
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_PLAIN);
	mimePart.setContent(content);
	return mimePart;
}
/** Assumes ZmShareInfo._init has been called. */
ZmShareInfo._createHtmlPart = function(action, shareInfo, compose) {
	var formatter = ZmShareInfo._HTML[action];
	var content = this._createContent(formatter, shareInfo);
	if (shareInfo.notes || compose) {
		content += ZmShareInfo._HTML_NOTE.format(shareInfo.notes);
	}

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.TEXT_HTML);
	mimePart.setContent(content);
	return mimePart;
}
/** Assumes ZmShareInfo._init has been called. */
ZmShareInfo._createXmlPart = function(action, shareInfo) {
	var params = [
		ZmShareInfo.URI, 
		ZmShareInfo.VERSION, 
		action,
		shareInfo.grantee.id, 
		shareInfo.grantee.email,
		AjxStringUtil.xmlAttrEncode(shareInfo.grantee.name),
		shareInfo.grantor.id, 
		shareInfo.grantor.email,
		AjxStringUtil.xmlAttrEncode(shareInfo.grantor.name),
		shareInfo.link.id, 
		AjxStringUtil.xmlAttrEncode(shareInfo.link.name), 
		shareInfo.link.view, 
		shareInfo.link.perm,
		AjxStringUtil.xmlEncode(shareInfo.notes)
	];
	var content = ZmShareInfo._XML.format(params);

	var mimePart = new ZmMimePart();
	mimePart.setContentType(ZmMimeTable.XML_ZIMBRA_SHARE);
	mimePart.setContent(content);
	return mimePart;
}
ZmShareInfo._createContent = function(formatter, shareInfo) {
	var params = [
		shareInfo.link.name, 
		shareInfo.link.view ? "(" + shareInfo.link.view + ")" : "", 
		shareInfo.grantor.name, 
		shareInfo.grantee.name,
		ZmShareInfo.getRoleName(shareInfo.link.perm),
		ZmShareInfo.getRoleActions(shareInfo.link.perm)
	];
	var content = formatter.format(params);
	return content;
}

ZmShareInfo._init = function() {
	if (ZmShareInfo._SUBJECTS) return;

	// message subjects
	ZmShareInfo._SUBJECTS = {};
	ZmShareInfo._SUBJECTS[ZmShareInfo.NEW] = ZmMsg.shareCreatedSubject;
	ZmShareInfo._SUBJECTS[ZmShareInfo.EDIT] = ZmMsg.shareModifiedSubject;
	ZmShareInfo._SUBJECTS[ZmShareInfo.DELETE] = ZmMsg.shareRevokedSubject;
	ZmShareInfo._SUBJECTS[ZmShareInfo.ACCEPT] = ZmMsg.shareAcceptedSubject;
	ZmShareInfo._SUBJECTS[ZmShareInfo.DECLINE] = ZmMsg.shareDeclinedSubject;
	
	// text formatters
	ZmShareInfo._TEXT = {};
	ZmShareInfo._TEXT[ZmShareInfo.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedText);
	ZmShareInfo._TEXT[ZmShareInfo.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedText);
	ZmShareInfo._TEXT[ZmShareInfo.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedText);
	ZmShareInfo._TEXT[ZmShareInfo.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedText);
	ZmShareInfo._TEXT[ZmShareInfo.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedText);
	
	// html formatters
	ZmShareInfo._HTML = {};
	ZmShareInfo._HTML[ZmShareInfo.NEW] = new AjxMessageFormat(ZmMsg.shareCreatedHtml);
	ZmShareInfo._HTML[ZmShareInfo.EDIT] = new AjxMessageFormat(ZmMsg.shareModifiedHtml);
	ZmShareInfo._HTML[ZmShareInfo.DELETE] = new AjxMessageFormat(ZmMsg.shareRevokedHtml);
	ZmShareInfo._HTML[ZmShareInfo.ACCEPT] = new AjxMessageFormat(ZmMsg.shareAcceptedHtml);
	ZmShareInfo._HTML[ZmShareInfo.DECLINE] = new AjxMessageFormat(ZmMsg.shareDeclinedHtml);
	
	ZmShareInfo._HTML_NOTE = new AjxMessageFormat(ZmMsg.shareNotesHtml);

	// xml formatter
	var pattern = [
		'<share xmlns="{0}" version="{1}" action="{2}" >',
		'  <grantee id="{3}" email="{4}" name="{5}" />',
		'  <grantor id="{6}" email="{7}" name="{8}" />',
		'  <link id="{9}" name="{10}" view="{11}" perm="{12}" />',
		'  <notes>{13}</notes>',
		'</share>'
	].join("\n");
	ZmShareInfo._XML = new AjxMessageFormat(pattern);
}
