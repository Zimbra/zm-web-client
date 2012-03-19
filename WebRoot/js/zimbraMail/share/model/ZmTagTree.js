/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * This file contains the tag tree class.
 */

/**
 * Creates the tag tree
 * @class
 * This class represents the tag tree.
 * 
 * @param	{ZmZimbraAccount}	account		the account
 * @extends	ZmTree
 */
ZmTagTree = function(account) {
	ZmTree.call(this, ZmOrganizer.TAG);
	var id = (account)
		? ([account.id, ZmTag.ID_ROOT].join(":"))
		: ZmTag.ID_ROOT;
	this.root = new ZmTag({ id:id, tree:this });
};

ZmTagTree.prototype = new ZmTree;
ZmTagTree.prototype.constructor = ZmTagTree;

// ordered list of colors
ZmTagTree.COLOR_LIST = [
    ZmOrganizer.C_BLUE,
    ZmOrganizer.C_CYAN,
    ZmOrganizer.C_GREEN,
    ZmOrganizer.C_PURPLE,
    ZmOrganizer.C_RED,
    ZmOrganizer.C_YELLOW,
    ZmOrganizer.C_PINK,
    ZmOrganizer.C_GRAY,
    ZmOrganizer.C_ORANGE
];

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTagTree.prototype.toString = 
function() {
	return "ZmTagTree";
};

/**
 * @private
 */
ZmTagTree.prototype.loadFromJs =
function(tagsObj, type, account) {
	if (!tagsObj || !tagsObj.tag || !tagsObj.tag.length) { return; }

	for (var i = 0; i < tagsObj.tag.length; i++) {
		ZmTag.createFromJs(this.root, tagsObj.tag[i], this, null, account);
	}
	var children = this.root.children.getArray();
	if (children.length) {
		children.sort(ZmTag.sortCompare);
	}
};

/**
 * Gets the tag by index.
 * 
 * @param	{int}	idx		the index
 * @return	{ZmTag}	the tag
 */
ZmTagTree.prototype.getByIndex =
function(idx) {
	var list = this.asList();	// tag at index 0 is root
	if (list && list.length && (idx < list.length))	{
		return list[idx];
	}
};

/**
 * Resets the tree.
 */
ZmTagTree.prototype.reset =
function() {
	this.root = new ZmTag({id: ZmTag.ID_ROOT, tree: this});
};
