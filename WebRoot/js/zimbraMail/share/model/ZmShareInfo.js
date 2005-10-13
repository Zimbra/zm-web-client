//
// ZmShareInfo
//

function ZmShareInfo() {
	this.grantor = {};
	this.link = {};
}

// Constants

ZmShareInfo.URI = "urn:zimbraShare";
ZmShareInfo.VERSION = "1.0";

ZmShareInfo.NEW = "new";
ZmShareInfo.EDIT = "edit";
ZmShareInfo.DELETE = "delete";

// TODO: 
ZmShareInfo.ROLE_NONE = "";
ZmShareInfo.ROLE_VIEWER = "r";
ZmShareInfo.ROLE_MANAGER = "rwidx";

// TODO: i18n
ZmShareInfo.ROLES = {};
ZmShareInfo.ROLES[ZmShareInfo.ROLE_NONE] = "None";
ZmShareInfo.ROLES[ZmShareInfo.ROLE_VIEWER] = "Viewer";
ZmShareInfo.ROLES[ZmShareInfo.ROLE_MANAGER] = "Manager";

ZmShareInfo.ACTIONS = {};
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_NONE] = "None";
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_VIEWER] = "View";
ZmShareInfo.ACTIONS[ZmShareInfo.ROLE_MANAGER] = "View, Edit, Add, Remove, Accept, Decline";

// Data

ZmShareInfo.prototype.action;
ZmShareInfo.prototype.version;
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
	
	/***
	// NOTE: IE's getElementsByTagName doesn't seem to return the specified
	//		 tags when they're in a namespace. Will have to do this the
	//		 old-fashioned way because I'm tired of fighting with it...
	var grantorNode = shareNode.getElementsByTagName("grantor")[0];
	shareInfo.grantor.id = grantorNode.getAttribute("id");
	shareInfo.grantor.name = grantorNode.getAttribute("name");
	
	var linkNode = shareNode.getElementsByTagName("link")[0];
	shareInfo.link.id = linkNode.getAttribute("id");
	shareInfo.link.name = linkNode.getAttribute("name");
	shareInfo.link.view = linkNode.getAttribute("view");
	shareInfo.link.perm = linkNode.getAttribute("perm");
	/***/
	var child = shareNode.firstChild;
	while (child != null) {
		switch (child.nodeName) {
			case "grantor": {
				shareInfo.grantor.id = child.getAttribute("id");
				shareInfo.grantor.name = child.getAttribute("name");
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
	/***/
	
	return shareInfo;
}

ZmShareInfo.prototype.isRead = function() {
	return this.link.perm && this.link.perm.match(/r/);
}
ZmShareInfo.prototype.isWrite = function() {
	return this.link.perm && this.link.perm.match(/w/);
}
ZmShareInfo.prototype.isInsert = function() {
	return this.link.perm && this.link.perm.match(/i/);
}
ZmShareInfo.prototype.isDelete = function() {
	return this.link.perm && this.link.perm.match(/d/);
}
ZmShareInfo.prototype.isAdmin = function() {
	return this.link.perm && this.link.perm.match(/a/);
}
ZmShareInfo.prototype.isWorkflow = function() {
	return this.link.perm && this.link.perm.match(/x/);
}
