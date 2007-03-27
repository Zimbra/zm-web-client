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

/**
* Create a new, empty appt list.
* @constructor
* @class
* This class represents a list of appts.
*
*/
function ZmRosterItemList(appCtxt) {
	ZmList.call(this, ZmItem.ROSTER_ITEM, appCtxt);
};

ZmRosterItemList.prototype = new ZmList;
ZmRosterItemList.prototype.constructor = ZmRosterItemList;

ZmRosterItemList.prototype.toString =
function() {
	return "ZmRosterItemList";
};

ZmRosterItemList.prototype.addItem = function(item, skipNotify, index) {
	this.add(item, index);
	if (!skipNotify) {
		this._notify(ZmEvent.E_CREATE, {items: [item]});
	}
};

ZmRosterItemList.prototype.removeItem = function(item, skipNotify) {
	if (!item.isDefaultBuddy()) {
		this.remove(item);
		if (!skipNotify) {
			this._notify(ZmEvent.E_REMOVE, {items: [item]});
		}
	}
};

ZmRosterItemList.prototype.getByAddr =
function(addr) {
    return this.getById(addr);
};

/**
 * return an array of all groups (uniqified)
 */

ZmRosterItemList.prototype.getGroupsArray =
function() {
	// TODO: cache. not currently used.
	var hash = {};
	var result = [];
	var listArray = this.getArray();
	for (var i=0; i < listArray.length; i++) {
		var groups = listArray[i].getGroups();
		for (var g in groups) {
			var name = groups[g];
			if (!(name in hash)) {
				hash[name] = true;
				result.push(name);
			}
		}
	}
	return result;
};

ZmRosterItemList.prototype.removeAllItems =
function() {
	// get a clone, since we are removing while iterating...
	var listArray = this.getVector().clone().getArray();
	for (var i=0; i < listArray.length; i++) {
		this.removeItem(listArray[i]);
	}
};
