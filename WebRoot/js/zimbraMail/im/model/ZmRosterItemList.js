/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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

ZmRosterItemList.prototype.setLoaded =
function() {
	this._notify(ZmEvent.E_LOAD);
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
    return this.getById(addr.toLowerCase());
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
