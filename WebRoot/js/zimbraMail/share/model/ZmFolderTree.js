/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmFolderTree(appCtxt) {
	
	ZmTree.call(this, ZmOrganizer.FOLDER, appCtxt);
	
	this._evt = new ZmEvent(ZmEvent.S_FOLDER);
}

ZmFolderTree.prototype = new ZmTree;
ZmFolderTree.prototype.constructor = ZmFolderTree;

ZmFolderTree.prototype.toString = 
function() {
	return "ZmFolderTree";
}

ZmFolderTree.prototype.loadFromJs =
function(rootFolderObj) {
	this.root = ZmFolder.createFromJs(null, rootFolderObj, this);
	this._moveUserFolders();
}

ZmFolderTree.prototype.getByPath =
function(path) {
	return this.root ? this.root.getByPath(path) : null;
}

ZmFolderTree.prototype._moveUserFolders =
function() {
	var userTop = new Array();
	var searchTop = new Array();
	var children = this.root.children.getArray();
	var addedSep = false;
	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (child.id > ZmFolder.ID_ROOT && child.id <= ZmFolder.LAST_SYSTEM_ID) {
			userTop.push(child);
			if (child.id == ZmFolder.ID_TRASH)
				child.addSep = true; // add some space below the last system folder
		} else if (child.id >= ZmFolder.FIRST_USER_ID) {
			if (child.type == ZmOrganizer.FOLDER)
				userTop.push(child);
			else if (child.type == ZmOrganizer.SEARCH)
				searchTop.push(child);
		}
	}

	var name = ZmMsg[ZmFolder.MSG_KEY[ZmFolder.ID_USER]];
	this.userRoot = new ZmFolder(ZmFolder.ID_USER, name, this.root, this);
	this.root.children.add(this.userRoot);
	for (var i = 0; i < userTop.length; i++) {
		var userFolder = userTop[i];
		this.root.children.remove(userFolder);
		this.userRoot.children.add(userFolder);
		userFolder.parent = this.userRoot;
	}

	name = ZmMsg[ZmFolder.MSG_KEY[ZmFolder.ID_SEARCH]];
	this.searchRoot = new ZmSearchFolder(ZmFolder.ID_SEARCH, name, this.root, this);
	this.root.children.add(this.searchRoot);
	for (var i = 0; i < searchTop.length; i++) {
		var searchFolder = searchTop[i];
		this.root.children.remove(searchFolder);
		this.searchRoot.children.add(searchFolder);
		searchFolder.parent = this.searchRoot;
	}
}

ZmFolderTree.prototype._sortFolder =
function(folder) {
	var children = folder.children;
	if (children && children.length) {
		children.sort(ZmFolder.sortCompare);
		for (var i = 0; i < children.length; i++)
			this._sortFolder(children[i]);
	}
}
