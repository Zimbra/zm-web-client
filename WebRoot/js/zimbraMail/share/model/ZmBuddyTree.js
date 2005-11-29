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
    this._addr2Buddies = {}; // hash from buddy.addr to ZmBuddy for each group buddy is in
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
            if (buddy.group == null) buddy.group = ZmMsg.buddies;
            var groups = buddy.group.split(/,/);
            var buddies = [];
            for (var j=0; j < groups.length; j++) {
                var groupName = groups[j];
                var buddyGroup = root._getGroup(groupName, tree);
                var id = buddy.addr + ":"+ groupName;
                var b = new ZmBuddy(id, buddy.addr, buddy.name, buddyGroup, tree, buddy.status, buddy.statusText, groups, j);
	        	   buddyGroup.children.add(b);
	        	   buddies.push(b);
            }
            root._addr2Buddies[buddy.addr] = buddies;
        	}
		var children = root.children.getArray();
		if (children.length)
		    children.sort(ZmBuddyGroup.sortCompare);
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

// return all buddy instances with given addr
ZmBuddyTree.prototype.getAllBuddiesByAddr =
function(addr) {
    var b = this._addr2Buddies[addr]; 
    return b ? b : [];
};

// used to get (auto-create) a group from the root
ZmBuddyTree.prototype._getGroup =
function(name, tree) {
    var groupId = this._prefixId+"_group_"+name;
    var group = this.getById(groupId);
    if (group == null) {
       group = new ZmBuddyGroup(groupId, name, this, tree);
       this.children.add(group);
    }
    return group;
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
            {id: "b0", addr: "dkarp@zimbra.com", name: "Dan", status:ZmBuddy.STATUS_AVAILABLE, group: "Friends"},
            {id: "b1", addr: "ross@zimbra.com", name: "Ross", status:ZmBuddy.STATUS_DND, group: "Work"},
            {id: "b2", addr: "satish@zimbra.com", name: "Satish", status:ZmBuddy.STATUS_AWAY, statusText:"out to lunch", group: "Work"},
            {id: "b3", addr: "tim@zimbra.com", name: "Tim", status:ZmBuddy.STATUS_OFFLINE, group: "Work"},
            {id: "b4", addr: "anand@zimbra.com", name: "Anand", status:ZmBuddy.STATUS_EXT_AWAY, group: "Friends,Work"},
            {id: "b5", addr: "andy@zibra.com", name: "Andy", status:ZmBuddy.STATUS_CHAT, group: "Work"},
            {id: "b6", addr: "matt@gmail.com", name: "Matt", status:ZmBuddy.STATUS_AVAILABLE, group: "Family"}
	    ]
    });
}
