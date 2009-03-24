/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmTagPicker = function(parent) {

	ZmPicker.call(this, parent, ZmPicker.TAG);

    this._checkedItems = {};
}

ZmTagPicker._OVERVIEW_ID = "ZmTagPicker";

ZmTagPicker.prototype = new ZmPicker;
ZmTagPicker.prototype.constructor = ZmTagPicker;

ZmPicker.CTOR[ZmPicker.TAG] = ZmTagPicker;

ZmTagPicker.prototype.toString = 
function() {
	return "ZmTagPicker";
}

ZmTagPicker.prototype._setupPicker =
function(parent) {
	var overviewId = ZmTagPicker._OVERVIEW_ID + "_" + Dwt.getNextId();
	this._setOverview(overviewId, parent, [ZmOrganizer.TAG]);
}

ZmTagPicker.prototype._updateQuery = 
function() {
	var tags = [];
	for (var tagId in this._checkedItems) {
		var tag = this._checkedItems[tagId];
		tags.push('"' + tag.name + '"');
	}
		
	var num = tags.length;
	if (num) {
		var query = tags.join(" OR ");
		if (num > 1) {
			query = "(" + query + ")";
		}
		this.setQuery("tag:" + query);
	} else {
		this.setQuery("");
	}
	this.execute();
}

ZmTagPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var tagId = ti.getData(Dwt.KEY_ID);
 		var tag = ti.getData(Dwt.KEY_OBJECT);
 		if (ti.getChecked()) {
			this._checkedItems[tagId] = tag;
 		} else {
			delete this._checkedItems[tagId];
 		}
		this._updateQuery();
 	}
}
