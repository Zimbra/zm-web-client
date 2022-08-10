/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
