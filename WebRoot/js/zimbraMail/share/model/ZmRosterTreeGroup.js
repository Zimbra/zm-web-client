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

function ZmRosterTreeGroup(id, name, parent, tree) {
	ZmOrganizer.call(this, ZmOrganizer.ROSTER_TREE_GROUP, id, name, parent, tree);
}

ZmRosterTreeGroup.prototype = new ZmOrganizer;
ZmRosterTreeGroup.prototype.constructor = ZmRosterTreeGroup;

ZmRosterTreeGroup.F_NAME = ZmOrganizer.F_NAME;

ZmRosterTreeGroup.prototype.toString = 
function() {
	return "ZmRosterTreeGroup - " + this.name;
};

ZmRosterTreeGroup.prototype.getIcon = 
function() {
    return "ImGroup";
};

ZmRosterTreeGroup.sortCompare = 
function(groupA, groupB) {
	var check = ZmOrganizer.checkSortArgs(groupA, groupB);
	if (check != null) return check;

	// sort by name
	var groupAName = groupA.getName().toLowerCase();
	var groupBName = groupB.getName().toLowerCase();
	if (groupAName < groupBName) {return -1;}
	if (groupAName > groupBName) {return 1;}
	return 0;
};

ZmRosterTreeGroup.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmRosterTreeGroup.prototype.getId = function() { return this.id; }

ZmRosterTreeGroup.prototype.getName = 
function() {
	return this.name;
};

ZmRosterTreeGroup.prototype.getRosterItems = 
function() {
    var a = this.children.getArray();
    var sz = this.children.size();
    var result = [];
    for (var i =0; i < sz; i++) {
        result.push(a[i].getRosterItem());
    }
    return result;
};
