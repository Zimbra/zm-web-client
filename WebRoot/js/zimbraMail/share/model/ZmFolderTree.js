/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmFolderTree(appCtxt, type) {
	
	ZmTree.call(this, type, appCtxt);
};

ZmFolderTree.prototype = new ZmTree;
ZmFolderTree.prototype.constructor = ZmFolderTree;

ZmFolderTree.prototype.toString = 
function() {
	return "ZmFolderTree";
};

/**
 * Loads the folder or the zimlet tree.
 */
ZmFolderTree.prototype.loadFromJs =
function(rootObj, elementType) {
	this.root = (elementType == "zimlet") ? ZmZimlet.createFromJs(null, rootObj, this) :
											ZmFolderTree.createFromJs(null, rootObj, this, elementType);
};

/**
 * Generic function for creating an organizer. Handles any organizer type other than
 * tag or zimlet.
 * 
 * @param parent		[ZmFolder]		parent folder
 * @param obj			[object]		JSON with folder data
 * @param tree			[ZmFolderTree]	containing tree
 * @param elementType	[string]		type of containing JSON element
 * @param path			[array]			list of path elements
 */
ZmFolderTree.createFromJs =
function(parent, obj, tree, elementType, path) {
	if (!(obj && obj.id)) return;

	var folder = null;
	if (elementType == "search") {
		var types = null;
		if (obj.types) {
			var t = obj.types.split(",");
			types = [];
			for (var i = 0; i < t.length; i++) {
				types.push(ZmSearch.TYPE_MAP[t[i]]);
			}
		}
		var sortBy = obj.sortBy ? ZmSearch.SORT_BY_MAP[obj.sortBy] : null;
		DBG.println(AjxDebug.DBG2, "Creating SEARCH with id " + obj.id + " and name " + obj.name);
		folder = new ZmSearchFolder({id:obj.id, name:obj.name, parent:parent, tree:tree, numUnread:obj.u,
									 query:obj.query, types:types, sortBy:sortBy});
		ZmFolderTree._fillInFolder(folder, obj, path);
	} else {
		var type = obj.view ? ZmOrganizer.TYPE[obj.view] : ZmOrganizer.FOLDER;
		if (!type) { return; }
		if (ZmOrganizer.DEFERRABLE[type]) {
			var app = tree._appCtxt.getApp(ZmOrganizer.APP[type]);
			app.addDeferredFolder(type, obj, tree, path);
		} else {
			var pkg = ZmOrganizer.ORG_PACKAGE[type];
			if (pkg) {
				DBG.println("******************** refresh, require: " + pkg + "****************");
				AjxDispatcher.require(pkg);
			}
			folder = ZmFolderTree.createFolder(type, parent, obj, tree, path);
		}
	}

	ZmFolderTree._traverse(folder, obj, tree, path || []);

	return folder;
};

ZmFolderTree._traverse =
function(folder, obj, tree, path) {

	var isRoot = (obj.id == ZmOrganizer.ID_ROOT);
	if (obj.folder && obj.folder.length) {
		if (!isRoot) {
			path.push(obj.name);
		}
		for (var i = 0; i < obj.folder.length; i++) {
			var folderObj = obj.folder[i];
			var childFolder = ZmFolderTree.createFromJs(folder, folderObj, tree, "folder", path);
			if (childFolder) {
				folder.children.add(childFolder);
			}
		}
		if (!isRoot) {
			path.pop();
		}
	}
	
	if (obj.search && obj.search.length) {
		if (!isRoot) {
			path.push(obj.name);
		}
		for (var i = 0; i < obj.search.length; i++) {
			var searchObj = obj.search[i];
			var childSearch = ZmFolderTree.createFromJs(folder, searchObj, tree, "search", path);
			if (childSearch) {
				folder.children.add(childSearch);
			}
		}
		if (!isRoot) {
			path.pop();
		}
	}

	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			var childFolder = ZmFolderTree.createFromJs(folder, link, tree, "link", path);
			if (childFolder) {
				folder.children.add(childFolder);
			}
		}
	}
};

ZmFolderTree.createFolder =
function(type, parent, obj, tree, path) {
		var orgClass = eval(ZmOrganizer.ORG_CLASS[type]);
		DBG.println(AjxDebug.DBG2, "Creating " + type + " with id " + obj.id + " and name " + obj.name);
		params = {id:obj.id, name:obj.name, parent:parent, tree:tree, color:obj.color,
				  owner:obj.owner, zid:obj.zid, rid:obj.rid, restUrl:obj.rest,
				  url:obj.url, numUnread:obj.u, numTotal:obj.n};
		var folder = new orgClass(params);
		ZmFolderTree._fillInFolder(folder, obj, path);
		
		return folder;
};

ZmFolderTree._fillInFolder =
function(folder, obj, path) {
	if (path) {
		folder.path = path.join("/");
	}
	if (obj.f && folder._parseFlags) {
		folder._parseFlags(obj.f);
	}

	if (ZmFolder.MSG_KEY[obj.id]) {
		folder._systemName = obj.name;
	}

	folder._setSharesFromJs(obj);
};

ZmFolderTree.prototype.getByPath =
function(path, useSystemName) {
	return this.root ? this.root.getByPath(path, useSystemName) : null;
};

ZmFolderTree.prototype._sortFolder =
function(folder) {
	var children = folder.children;
	if (children && children.length) {
		children.sort(ZmFolder.sortCompare);
		for (var i = 0; i < children.length; i++)
			this._sortFolder(children[i]);
	}
};
