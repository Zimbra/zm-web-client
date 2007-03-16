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

function ZmRosterTree(params) {
	this._appCtxt = params.tree._appCtxt;
	params.type = ZmOrganizer.ROSTER_TREE_ITEM;
	ZmOrganizer.call(this, params);
}

ZmRosterTree.prototype = new ZmOrganizer;
ZmRosterTree.prototype.constructor = ZmRosterTree;

ZmRosterTree.prototype.toString =
function() {
	return "ZmRosterTree - " + this.name;
};

ZmRosterTree.sortCompare =
function(itemA, itemB) {
	var check = ZmOrganizer.checkSortArgs(itemA, itemB);
	if (check != null) return check;

	// sort by name>
	var itemAName = itemA.getName().toLowerCase();
	var itemBName = itemB.getName().toLowerCase();
	if (itemAName < itemBName) {return -1;}
	if (itemAName > itemBName) {return 1;}
	return 0;
};

ZmRosterTree.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmRosterTree.prototype.getName = function() {
	return ZmMsg.buddyList;
};

ZmRosterTree.prototype.getIcon = function() {
	return null;
};

ZmRosterTree.createRoot =
function(tree) {
	var root = new ZmRosterTree({id: ZmOrganizer.ID_ROSTER_LIST, name: ZmMsg.buddyList, tree: tree});
	// TODO: nothing for now...
	return root;
};

ZmRosterTree.createFromJs =
function(parent, obj, tree) {
	// TODO: nothing for now...
};

ZmRosterTree.loadDummyData =
function(tree) {
	tree.loadFromJs({});
};

//------------------------------------------
// for autocomplete
//------------------------------------------

function ZmRosterTreeGroups(tree) {
	this._root = tree.root;
};

ZmRosterTreeGroups.prototype.constructor = ZmRosterTreeGroups;

/**
 * Returns a list of matching groups for a given string
 */
ZmRosterTreeGroups.prototype.autocompleteMatch = function(str) {
	str = str.toLowerCase();
	var result = [];

	var a = this._root.children.getArray();
	var sz = this._root.children.size();
	for (var i =0; i < sz; i++) {
		var g = a[i].getName();
		if (g.toLowerCase().indexOf(str) == 0)
			result.push({data: g, text: g });
	}
	return result;
};

ZmRosterTreeGroups.prototype.isUniqueValue =
function(str) {
	return false;
};
