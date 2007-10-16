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

ZmTag = function(params) {
	params.type = ZmOrganizer.TAG;
	ZmOrganizer.call(this, params);
};

ZmTag.prototype = new ZmOrganizer;
ZmTag.prototype.constructor = ZmTag;

ZmTag.prototype.toString = 
function() {
	return "ZmTag";
};

// color icons
ZmTag.COLOR_ICON = new Object();
ZmTag.COLOR_ICON[ZmOrganizer.C_ORANGE]	= "TagOrange";
ZmTag.COLOR_ICON[ZmOrganizer.C_BLUE]	= "TagBlue";
ZmTag.COLOR_ICON[ZmOrganizer.C_CYAN]	= "TagCyan";
ZmTag.COLOR_ICON[ZmOrganizer.C_GREEN]	= "TagGreen";
ZmTag.COLOR_ICON[ZmOrganizer.C_PURPLE]	= "TagPurple";
ZmTag.COLOR_ICON[ZmOrganizer.C_RED]		= "TagRed";
ZmTag.COLOR_ICON[ZmOrganizer.C_YELLOW]	= "TagYellow";


// system tags
ZmTag.ID_ROOT = ZmOrganizer.ID_ROOT;
ZmTag.ID_UNREAD		= 32;
ZmTag.ID_FLAGGED	= 33;
ZmTag.ID_FROM_ME	= 34;
ZmTag.ID_REPLIED	= 35;
ZmTag.ID_FORWARDED	= 36;
ZmTag.ID_ATTACHED	= 37;

/**
* Tags come from back end as a flat list, and we manually create a root tag, so all tags
* have the root as parent. If tags ever have a tree structure, then this should do what
* ZmFolder does (recursively create children).
*/
ZmTag.createFromJs =
function(parent, obj, tree, sorted) {
	var nId = ZmOrganizer.normalizeId(obj.id);
	if (nId < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.TAG]) { return; }
	var tag = new ZmTag({id: obj.id, name: obj.name, color: ZmTag.checkColor(obj.color),
						 parent: parent, tree: tree, numUnread: obj.u});
	var index = sorted ? ZmOrganizer.getSortIndex(tag, ZmTag.sortCompare) : null;
	parent.children.add(tag, index);

	return tag;
};

ZmTag.sortCompare = 
function(tagA, tagB) {
	var check = ZmOrganizer.checkSortArgs(tagA, tagB);
	if (check != null) return check;

	if (tagA.name.toLowerCase() > tagB.name.toLowerCase()) return 1;
	if (tagA.name.toLowerCase() < tagB.name.toLowerCase()) return -1;
	return 0;
};

ZmTag.checkName =
function(name) {
	var msg = ZmOrganizer.checkName(name);
	if (msg) return msg;

	if (name.indexOf('\\') == 0)
		return AjxMessageFormat.format(ZmMsg.errorInvalidName, name);

	return null;
};

ZmTag.checkColor =
function(color) {
	color = Number(color);
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR)) ? color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
};

ZmTag.create =
function(params) {
	var soapDoc = AjxSoapDoc.create("CreateTagRequest", "urn:zimbraMail");
	var tagNode = soapDoc.set("tag");
	tagNode.setAttribute("name", params.name);
	var color = ZmOrganizer.checkColor(params.color);
	if (color && (color != ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG])) {
		tagNode.setAttribute("color", color);
	}
	var errorCallback = new AjxCallback(null, ZmTag._handleErrorCreate, params);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmTag._handleErrorCreate =
function(params, ex) {
	if (ex.code == ZmCsfeException.MAIL_INVALID_NAME) {
		var msg = AjxMessageFormat.format(ZmMsg.errorInvalidName, params.name);
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

ZmTag.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	if (this.id == ZmOrganizer.ID_ROOT)
		return ZmMsg.tags;

	return ZmOrganizer.prototype.getName.call(this, showUnread, maxLength, noMarkup);
};

ZmTag.prototype.getIcon = 
function() {
	return (this.id == ZmOrganizer.ID_ROOT) ? null : ZmTag.COLOR_ICON[this.color];
};

ZmTag.prototype.getToolTip = function() {};

ZmTag.prototype.notifyCreate =
function(obj) {
	var child = ZmTag.createFromJs(this, obj, this.tree, true);
	child._notify(ZmEvent.E_CREATE);
};
