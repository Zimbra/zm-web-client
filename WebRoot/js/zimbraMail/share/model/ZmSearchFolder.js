/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
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

function ZmSearchFolder(id, name, parent, tree, numUnread, query, types, sortBy) {

	ZmFolder.call(this, id, name, parent, tree, numUnread);
	
	this.type = ZmOrganizer.SEARCH;
	if (query) {
		this.search = new ZmSearch(tree._appCtxt, {query: query, types: types, sortBy: sortBy, searchId: id});
	}
};

ZmSearchFolder.prototype = new ZmFolder;
ZmSearchFolder.prototype.constructor = ZmSearchFolder;

ZmSearchFolder.ID_ROOT = ZmOrganizer.ID_ROOT;

ZmSearchFolder.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;
	
	// check ID - can't be lower than root, or in tag range
	if (obj.id < ZmFolder.ID_ROOT || (obj.id > ZmFolder.LAST_SYSTEM_ID &&
		obj.id < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.SEARCH])) return;

	var types = null;
	if (obj.types) {
		var t = obj.types.split(",");
		types = [];
		for (var i = 0; i < t.length; i++)
			types.push(ZmSearch.TYPE_MAP[t[i]]);
	}
	var sortBy = obj.sortBy ? ZmSearch.SORT_BY_MAP[obj.sortBy] : null;
	var folder = new ZmSearchFolder(obj.id, obj.name, parent, tree, obj.u, obj.query, types, sortBy);

	// a search may only contain other searches
	if (obj.search && obj.search.length) {
		for (var i = 0; i < obj.search.length; i++) {
			var childFolder = ZmSearchFolder.createFromJs(folder, obj.search[i], tree);
			if (childFolder)
				folder.children.add(childFolder);
		}
	}

	return folder;
};

ZmSearchFolder.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	if (this.id == ZmOrganizer.ID_ROOT) {
		return ZmMsg.searches;
	} else {
		return ZmOrganizer.prototype.getName.call(this, showUnread, maxLength, noMarkup);
	}
};

ZmSearchFolder.prototype.getIcon = 
function() {
	return (this.id == ZmOrganizer.ID_ROOT) ? null : "SearchFolder";
};

/*
* Returns the organizer with the given ID. Looks in this organizer's tree first.
* Since a search folder may have either a regular folder or another search folder
* as its parent, we may need to get the parent folder from another type of tree.
*
* @param parentId	[int]		ID of the organizer to find
*/
ZmSearchFolder.prototype._getNewParent =
function(parentId) {
	var parent = this.tree.getById(parentId);
	if (parent) return parent;
	
	var type = (this.parent.type == ZmOrganizer.SEARCH) ? ZmOrganizer.FOLDER : ZmOrganizer.SEARCH;
	var tree = this.tree._appCtxt.getTree(type);
	return tree.getById(parentId); 
};

/**
 * Returns true if this saved search contains one of the types in the given hash.
 * 
 * @param types		[hash]		a hash of search types (item type IDs)
 */
ZmSearchFolder.prototype._typeMatch =
function(types) {
	if (!this.search) {
		return false;
	}
	if (!this.search.types) {
		// if types are missing, default to mail
		return (types[ZmItem.CONV] || types[ZmItem.MSG]);
	}
	var childSearchTypes = this.search.types;
	for (var j = 0; j < childSearchTypes.length; j++) {
		if (types && types[childSearchTypes[j]]) {
			return true;
		}
	}
	return false;
};

/*
 * Returns true if this search folder has a search folder for any of
 * the given types anywhere in or under it.
 *
 * @param types		[hash]		a hash of search types (item type IDs)
 */
ZmSearchFolder.prototype._hasType =
function(types) {
	if (this._typeMatch(types)) return true;
	
	var a = this.children.getArray();
	var sz = this.children.size();
	for (var i = 0; i < sz; i++) {
		if (a[i]._typeMatch(types)) {
			return true;
		}
	}
	return false;
};
