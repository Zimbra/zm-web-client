/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmTagTree(appCtxt) {

	ZmTree.call(this, ZmOrganizer.TAG, appCtxt);
};

ZmTagTree.prototype = new ZmTree;
ZmTagTree.prototype.constructor = ZmTagTree;

// ordered list of colors
ZmTagTree.COLOR_LIST = [ZmOrganizer.C_CYAN, ZmOrganizer.C_BLUE, ZmOrganizer.C_PURPLE, ZmOrganizer.C_RED,
						ZmOrganizer.C_ORANGE, ZmOrganizer.C_YELLOW, ZmOrganizer.C_GREEN];

ZmTagTree.prototype.toString = 
function() {
	return "ZmTagTree";
};

ZmTagTree.prototype.loadFromJs =
function(tagsObj) {
	if (!tagsObj || !tagsObj.tag || !tagsObj.tag.length) return;

	this.createRoot();
	for (var i = 0; i < tagsObj.tag.length; i++)
		ZmTag.createFromJs(this.root, tagsObj.tag[i], this);
	var children = this.root.children.getArray();
	if (children.length)
		children.sort(ZmTag.sortCompare);
};

ZmTagTree.prototype.createRoot =
function() {
	if (!this.root)
		this.root = new ZmTag(ZmTag.ID_ROOT, null, null, null, this);
};

ZmTagTree.prototype.getByIndex =
function(idx) {
	var list = this.asList();	// tag at index 0 is root
	if (list && list.length && (idx < list.length))	{
		return list[idx];
	}
};
