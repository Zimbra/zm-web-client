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

function ZmBuddyGroup(id, name, parent, tree) {
	ZmOrganizer.call(this, ZmOrganizer.BUDDY_GROUP, id, name, parent, tree);
}

ZmBuddyGroup.prototype = new ZmOrganizer;
ZmBuddyGroup.prototype.constructor = ZmBuddyGroup;

ZmBuddyGroup.F_NAME = ZmOrganizer.F_NAME;

ZmBuddyGroup.prototype.toString = 
function() {
	return "ZmBuddyGroup - " + this.name;
};

// Constants
ZmBuddyGroup.ID_BUDDY_GROUP = ZmOrganizer.ID_BUDDY_GROUP;

ZmBuddyGroup.prototype.getIcon = 
function() {
    return null; //"Group"; //null;
};

ZmBuddyGroup.sortCompare = 
function(buddyA, buddyB) {
	// sort by name
	var buddyAName = buddyA.name.toLowerCase();
	var buddyBName = buddyB.name.toLowerCase();
	if (buddyAName < buddyBName) {return -1;}
	if (buddyAName > buddyBName) {return 1;}
	return 0;
};

ZmBuddyGroup.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmBuddyGroup.prototype.getId = function() { return this.id; }

ZmBuddyGroup.prototype.getName = 
function() {
	return this.name;
};
