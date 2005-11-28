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

function ZmBuddyTree(id, name, parent, tree) {
    this._appCtxt = tree._appCtxt;
    this._prefixId = Dwt.getNextId();
	ZmOrganizer.call(this, ZmOrganizer.BUDDY, id, name, parent, tree);
}

ZmBuddyTree.prototype = new ZmOrganizer;
ZmBuddyTree.prototype.constructor = ZmBuddyTree;

ZmBuddyTree.prototype.toString = 
function() {
	return "ZmBuddyTree - " + this.name;
};

// Constants
ZmBuddyTree.ID_BUDDY = ZmOrganizer.ID_BUDDY;

// Static methods
ZmBuddyTree.createFromJs =
function(parent, obj, tree, link) {
//	if (!obj && obj.length < 1) {return null;}
	DBG.println(AjxDebug.DBG1, "ZmBuddyTree.createFromJs() Loading...");
	var root = new ZmBuddyTree(ZmBuddyTree.ID_BUDDY, ZmMsg.buddyList, parent, tree);
	if (obj && obj.buddy && obj.buddy.length) {
		for (var i = 0; i < obj.buddy.length; i++) {
		    var buddy = obj.buddy[i];
		    var buddyParent = root;
		    if (buddy.group == null) buddy.group = ZmMsg.buddies;
		    if (buddy.group) {
                var groupId = root._prefixId+"_group_"+buddy.group;
                var group = root.getById(groupId);
                if (group == null) {
                    group = new ZmBuddyGroup(groupId, buddy.group, root, tree);
                    root.children.add(group);
                }
                buddyParent = group;
		    }
		    var b = ZmBuddy.createFromJs(buddyParent, buddy, tree);
		    
		}
		var children = root.children.getArray();
		if (children.length)
		    children.sort(ZmBuddy.sortCompare);
	}
	return root;
};

ZmBuddyTree.sortCompare = 
function(buddyA, buddyB) {
	// sort by name>
	var buddyAName = buddyA.name.toLowerCase();
	var buddyBName = buddyB.name.toLowerCase();
	if (buddyAName < buddyBName) {return -1;}
	if (buddyAName > buddyBName) {return 1;}
	return 0;
};

ZmBuddyTree.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmBuddyTree.prototype.getName = 
function() {
	if (this.id == ZmBuddyTree.ID_BUDDY) {
		return ZmMsg.buddyList;
	} 
	return this.name;
};

ZmBuddyTree.prototype.getIcon = 
function() {
    return null;
	if (this.id == ZmBuddyTree.ID_BUDDY) {
        	// base this on buddy's status
		return "ImAvailable";
	}  else {
    	    return "ImStartChat";
    	}
};

ZmBuddyTree.loadDummyData =
function(tree) {
	tree.loadFromJs({ 
	    buddy: [
            {id: "b0", name: "Dan", status:ZmBuddy.STATUS_AVAILABLE, group: "Friends"},
            {id: "b1", name: "Ross", status:ZmBuddy.STATUS_DND, group: "Zimbra"},
            {id: "b2", name: "Satish", status:ZmBuddy.STATUS_AWAY, statusText:"out to lunch", group: "Zimbra"},
            {id: "b3", name: "Tim", status:ZmBuddy.STATUS_OFFLINE, group: "Zimbra"},
            {id: "b4", name: "Anand", status:ZmBuddy.STATUS_EXT_AWAY, group: "Friends"},
            {id: "b5", name: "Andy", status:ZmBuddy.STATUS_CHAT, group: "Zimbra"},
            {id: "b5", name: "Matt", status:ZmBuddy.STATUS_AVAILABLE, group: "Family"}
	    ]
    });
}
