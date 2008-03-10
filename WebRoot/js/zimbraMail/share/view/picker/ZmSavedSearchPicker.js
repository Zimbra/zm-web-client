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

ZmSavedSearchPicker = function(parent) {

	ZmPicker.call(this, parent, ZmPicker.SEARCH);

    this._checkedItems = new AjxVector();
}

ZmSavedSearchPicker._OVERVIEW_ID = "ZmSavedSearchPicker";

ZmSavedSearchPicker.prototype = new ZmPicker;
ZmSavedSearchPicker.prototype.constructor = ZmSavedSearchPicker;

ZmPicker.CTOR[ZmPicker.SEARCH] = ZmSavedSearchPicker;

ZmSavedSearchPicker.prototype.toString = 
function() {
	return "ZmSavedSearchPicker";
}

ZmSavedSearchPicker.prototype._setupPicker =
function(parent) {
	var overviewId = ZmSavedSearchPicker._OVERVIEW_ID + "_" + Dwt.getNextId();
	this._setOverview(overviewId, parent, [ZmOrganizer.FOLDER, ZmOrganizer.SEARCH]);
	this._twiddle();
}

ZmSavedSearchPicker.prototype._updateQuery = 
function() {
	var searches = [];
	var num = this._checkedItems.size();
	for (var i = 0; i < num; i++) {
		var search = this._checkedItems.get(i);
		searches.push("(" + search.query + ")");
	}
	var query = "";
	if (searches.length) {
		if (query.length)
			query += " OR ";
		var searchStr = searches.join(" OR ");
		if (searches.length > 1)
			searchStr = "(" + searchStr + ")";
		query += searchStr;
	}
	if (num == 1)
		this._searchId = this._checkedItems.get(0).searchId;
	this.setQuery(query);
	this.execute();
}

ZmSavedSearchPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var search = ti.getData(Dwt.KEY_OBJECT).search;
 		if (ti.getChecked()) {
			this._checkedItems.add(search);
 		} else {
			this._checkedItems.remove(search);
 		}
		this._updateQuery();
 	}
}

// Take the checkboxes away from folders, and make sure saved searches are visible
ZmSavedSearchPicker.prototype._twiddle =
function() {
	for (var i in this._treeView) {
		var treeView = this._treeView[i];
		var hi = treeView.getHeaderItem();
		// expand everything at the top level recursively
		if (hi) {
			hi.setExpanded(true, true);
			hi.setVisible(false, true);
		}
		// hide folders that don't have searches under them, and
		// take the checkbox away from folders
		for (var id in treeView._treeItemHash) {
			var ti = treeView._treeItemHash[id];
			var organizer = ti.getData(Dwt.KEY_OBJECT);
			if (organizer.type == ZmOrganizer.FOLDER && organizer.nId != ZmOrganizer.ID_ROOT) {
				if (organizer.hasSearch()) {
					if (ti._checkBoxCell)
						Dwt.setVisible(ti._checkBoxCell, false);
				} else {
					ti.setVisible(false);
				}
			}
		}
	}
}
