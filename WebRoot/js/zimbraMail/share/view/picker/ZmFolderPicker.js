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

ZmFolderPicker = function(parent) {

	ZmPicker.call(this, parent, ZmPicker.FOLDER);

    this._checkedItems = new AjxVector();
}

ZmFolderPicker._OVERVIEW_ID = "ZmFolderPicker";

ZmFolderPicker.prototype = new ZmPicker;
ZmFolderPicker.prototype.constructor = ZmFolderPicker;

ZmPicker.CTOR[ZmPicker.FOLDER] = ZmFolderPicker;

ZmFolderPicker.prototype.toString = 
function() {
	return "ZmFolderPicker";
}

ZmFolderPicker.prototype._setupPicker =
function(parent) {
	var overviewId = ZmFolderPicker._OVERVIEW_ID + "_" + Dwt.getNextId();
	this._setOverview(overviewId, parent, [ZmOrganizer.FOLDER]);
	this._twiddle();
}

ZmFolderPicker.prototype._updateQuery = 
function() {
	var folders = [];
	var num = this._checkedItems.size();
	for (var i = 0; i < num; i++) {
		var folder = this._checkedItems.get(i);
		folders.push(folder.createQuery(true));
	}
	var query = "";
	if (folders.length) {
		var folderStr = folders.join(" OR ");
		if (folders.length > 1) {
			folderStr = "(" + folderStr + ")";
		}
		query += "in:" + folderStr;
	}
	this.setQuery(query);
	this.execute();
}

ZmFolderPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var folder = ti.getData(Dwt.KEY_OBJECT);
 		if (ti.getChecked()) {
			this._checkedItems.add(folder);
 		} else {
			this._checkedItems.remove(folder);
 		}
		this._updateQuery();
 	}
}

// Hide saved searches
ZmFolderPicker.prototype._twiddle =
function() {
	for (var i in this._treeView) {
		var treeView = this._treeView[i];
		for (var id in treeView._treeItemHash) {
			var ti = treeView._treeItemHash[id];
			var organizer = ti.getData(Dwt.KEY_OBJECT);
			if (organizer.type == ZmOrganizer.SEARCH) {
				ti.setVisible(false);
			}
		}
	}
};
