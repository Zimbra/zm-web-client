/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines the tag class.
 */

/**
 * Creates a tag
 * @class
 * This class represents a tag.
 * 
 * @param	{Hash}	params		a hash of parameters
 * @extends	ZmOrganizer
 */
ZmTag = function(params) {
	params.type = ZmOrganizer.TAG;
	ZmOrganizer.call(this, params);
	this.notLocal = params.notLocal;
};

ZmTag.prototype = new ZmOrganizer;
ZmTag.prototype.constructor = ZmTag;
ZmTag.prototype.isZmTag = true;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
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
 * 
 * @private
 */
ZmTag.createFromJs =
function(parent, obj, tree, sorted, account) {
	var tag;
	var nId = ZmOrganizer.normalizeId(obj.id);
	if (nId < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.TAG]) { return; }
	tag = tree.getById(obj.id);
	if (tag) { return tag; }

	var params = {
		id: obj.id,
		name: obj.name,
		color: ZmTag.checkColor(obj.color),
		rgb: obj.rgb,
		parent: parent,
		tree: tree,
		numUnread: obj.u,
		account: account
	};
	tag = new ZmTag(params);
	var index = sorted ? ZmOrganizer.getSortIndex(tag, ZmTag.sortCompare) : null;
	parent.children.add(tag, index);

	var tagNameMap = parent.getTagNameMap();
	tagNameMap[obj.name] = tag;

	return tag;
};

ZmTag.createNotLocalTag =
function(name) {
	//cache so we don't create many objects in case many items are tagged by non local tags.
	var cache = ZmTag.notLocalCache = ZmTag.notLocalCache || [];
	var tag = cache[name];
	if (tag) {
		return tag;
	}
	tag = new ZmTag({notLocal: true, id: name, name: name});
	cache[name] = tag;
	return tag;
};

/**
 * Compares the tags by name.
 * 
 * @param	{ZmTag}	tagA		the first tag
 * @param	{ZmTag}	tagB		the second tag
 * @return	{int}	0 if the tag names match (case-insensitive); 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmTag.sortCompare = 
function(tagA, tagB) {
	var check = ZmOrganizer.checkSortArgs(tagA, tagB);
	if (check != null) return check;

	if (tagA.name.toLowerCase() > tagB.name.toLowerCase()) return 1;
	if (tagA.name.toLowerCase() < tagB.name.toLowerCase()) return -1;
	return 0;
};

/**
 * Checks the tag name.
 * 
 * @param	{String}	name		the name
 * @return	{String}	<code>null</code> if the name is valid or a error message
 */
ZmTag.checkName =
function(name) {
	var msg = ZmOrganizer.checkName(name);
	if (msg) { return msg; }

	if (name.indexOf('\\') == 0) {
		return AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(name));
	}

	return null;
};

/**
 * Checks the color.
 * 
 * @param	{String}	color	the color
 * @return	{Number}	the valid color
 */
ZmTag.checkColor =
function(color) {
	color = Number(color);
	return ((color != null) && (color >= 0 && color <= ZmOrganizer.MAX_COLOR)) ? color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
};

ZmTag.getIcon = function(color) {
    var object = { getIcon:ZmTag.prototype.getIcon, getColor:ZmTag.prototype.getColor, color:color };
    if (String(color).match(/^#/)) {
        object.rgb = color;
        object.color = null;
    }
    return ZmTag.prototype.getIconWithColor.call(object);
}

/**
 * Creates a tag.
 * 
 * @param	{Hash}	params	a hash of parameters
 */
ZmTag.create =
function(params) {
	var soapDoc = AjxSoapDoc.create("CreateTagRequest", "urn:zimbraMail");
	var tagNode = soapDoc.set("tag");
	tagNode.setAttribute("name", params.name);
    if (params.rgb) {
        tagNode.setAttribute("rgb", params.rgb);
    }
    else {
        var color = ZmOrganizer.checkColor(params.color) || ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
        tagNode.setAttribute("color", color);
    }
	var errorCallback = new AjxCallback(null, ZmTag._handleErrorCreate, params);
	appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback, accountName:params.accountName});
};

/**
 * @private
 */
ZmTag._handleErrorCreate =
function(params, ex) {
	if (ex.code == ZmCsfeException.MAIL_INVALID_NAME) {
		var msg = AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(params.name));
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon or <code>null</code> for no icon
 */
ZmTag.prototype.getIcon = 
function() {
	if (this.notLocal) {
		return "TagShared";
	}
	
	return (this.id == ZmOrganizer.ID_ROOT) ? null : "Tag";
};

/**
 * map from tag names to tags. used by getByNameOrRemote
 */
ZmTag.prototype.getTagNameMap =
function() {
	if (!this.tagNameMap) {
		this.tagNameMap = {};
	}
	return this.tagNameMap;
};

/**
 * Creates a query for this tag.
 * 
 * @return	{String}	the tag query
 */
ZmTag.prototype.createQuery =
function() {
	return ['tag:"', this.name, '"'].join("");
};

/**
 * Gets the tool tip.
 * 
 * @return	{String}	the tool tip
 */
ZmTag.prototype.getToolTip = function() {};

/**
 * @private
 */
ZmTag.prototype.notifyCreate =
function(obj) {
	var child = ZmTag.createFromJs(this, obj, this.tree, true);
	child._notify(ZmEvent.E_CREATE);
};


ZmTag.prototype.notifyModify =
function(obj) {
	if (obj.name) {
		//this is a rename - update the tagNameMap
		var oldName = this.name;
		var nameMap = this.parent.getTagNameMap();
		delete nameMap[oldName];
		nameMap[obj.name] = this;
		//we don't change the name on this ZmTag object here, it is done in ZmOrganizer.prototype.notifyModify
	}
	ZmOrganizer.prototype.notifyModify.call(this, obj);
};


ZmTag.prototype.notifyDelete =
function() {
	var nameMap = this.parent.getTagNameMap();
	delete nameMap[this.name];  //remove from name map
	
	ZmOrganizer.prototype.notifyDelete.call(this);
};

/**
 * Checks if the tag supports sharing.
 * 
 * @return	{Boolean}	always returns <code>false</code>. Tags cannot be shared.
 */
ZmTag.prototype.supportsSharing =
function() {
	// tags cannot be shared
	return false;
};

ZmTag.prototype.getByNameOrRemote =
function(name) {
	var tagNameMap = this.getTagNameMap();
	var tag = tagNameMap[name];
	if (tag) {
		return tag;
	}
	return ZmTag.createNotLocalTag(name);
};



