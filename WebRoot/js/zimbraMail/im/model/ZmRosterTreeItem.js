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
function ZmRosterTreeItem(params) {
	// console.log(params);
	params.type = ZmOrganizer.ROSTER_TREE_ITEM;
	params.name = params.rosterItem.getDisplayName();
	ZmOrganizer.call(this, params);
	this.rosterItem = params.rosterItem;
}

ZmRosterTreeItem.prototype = new ZmOrganizer;
ZmRosterTreeItem.prototype.constructor = ZmRosterTreeItem;

ZmRosterTreeItem.prototype.toString = 
function() {
	return "ZmRosterTreeItem - " + this.rosterItem;
};

// Constants
ZmRosterTreeItem.ID_ROSTER_TREE_ITEM = ZmOrganizer.ID_ROSTER_TREE_ITEM;

ZmRosterTreeItem.sortCompare = 
function(itemA, itemB) {
	var check = ZmOrganizer.checkSortArgs(itemA, itemB);
	if (check != null) return check;

	// sort by name
	var itemAName = itemA.getName().toLowerCase();
	var itemBName = itemB.getName().toLowerCase();
	if (itemAName < itemBName) {return -1;}
	if (itemAName > itemBName) {return 1;}
	return 0;
};

ZmRosterTreeItem.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

// Public methods
ZmRosterTreeItem.prototype.getIcon = function() { return this.rosterItem.getPresence().getIcon(); };

ZmRosterTreeItem.prototype.getId = function() { return this.id; }

ZmRosterTreeItem.prototype.getRosterItem = function() { return this.rosterItem; }

ZmRosterTreeItem.prototype.getGroupName = function() { return this.parent.getName(); }

ZmRosterTreeItem.prototype.getName = function() { return this.rosterItem.getDisplayName(); }
