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

function ZmRosterTree(id, name, parent, tree) {
    this._appCtxt = tree._appCtxt;
    this._prefixId = Dwt.getNextId();
    this._addr2Items = {}; // hash from  roster tree item addr to ZmRosterItem for each group item is in
	ZmOrganizer.call(this, ZmOrganizer.ROSTER_TREE_ITEM, id, name, parent, tree);
}

ZmRosterTree.prototype = new ZmOrganizer;
ZmRosterTree.prototype.constructor = ZmRosterTree;

ZmRosterTree.prototype.toString = 
function() {
	return "ZmRosterTree - " + this.name;
};

// Constants
ZmRosterTree.ID_ROSTER_TREE_ITEM = ZmOrganizer.ID_ROSTER_TREE_ITEM;

ZmRosterTree.sortCompare = 
function(itemA, itemB) {
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

// return all item instances with given addr
ZmRosterTree.prototype.getAllItemsByAddr =
function(addr) {
    var b = this._addr2Items[addr]; 
    return b ? b : [];
};

ZmRosterTree.prototype._addRosterItem =
function(rosterItem) {
    var groupNames = rosterItem.getGroupNames() || ZmMsg.buddies;
    var groups = groupNames.split(/,/);
    var items = [];
    for (var j=0; j < groups.length; j++) {
        var groupName = groups[j];
        var rosterGroup = this._getGroup(groupName);
        var id = rosterItem.getAddress() + ":"+ groupName;
        var item = new ZmRosterTreeItem(id, rosterItem, rosterGroup, this);
	    rosterGroup.children.add(item);
	    items.push(item);
    }
    this._addr2Items[rosterItem.getAddress()] = items;
}

// used to get (auto-create) a group from the root
ZmRosterTree.prototype._getGroup =
function(name) {
    var groupId = this._prefixId+"_group_"+name;
    var group = this.getById(groupId);
    if (group == null) {
       group = new ZmRosterTreeGroup(groupId, name, this, this);
       this.children.add(group);
    }
    return group;
};

// Public methods
ZmRosterTree.prototype.getName = function() {    return ZmMsg.buddyList; };

ZmRosterTree.prototype.getIcon = function() {    return null; };

ZmRosterTree.createRoot = 
function(tree) {
    var root = new ZmRosterTree(ZmRosterTree.ID_ROSTER_TREE_ITEM, ZmMsg.buddyList, null, tree);
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
