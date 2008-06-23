/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmRosterItemList = function() {
	ZmList.call(this, ZmItem.ROSTER_ITEM);
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

ZmRosterItemList.prototype.addItems = function(items) {
	for (var i = 0, count = items.length; i < count; i++) {
		this.add(items[i]);
	}
	this._notify(ZmEvent.E_CREATE, {items: items});
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

ZmRosterItemList.prototype.getGroupsArray = function() {
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

ZmRosterItemList.prototype.removeAllItems = function() {
	// get a clone, since we are removing while iterating...
	var listArray = this.getVector().clone().getArray();
	for (var i = 0; i < listArray.length; i++) {
		this.removeItem(listArray[i]);
	}
};
