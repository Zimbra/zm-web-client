/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
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

function ZmTagPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.TAG);

    this._checkedItems = new Object();
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
	var tags = new Array();
	for (var tag in this._checkedItems)
		tags.push('"' + tag + '"');
		
	var num = tags.length;
	if (num) {
		var query = tags.join(" OR ");
		if (num > 1)
			query = "(" + query + ")";
		this.setQuery("tag:" + query);
	} else {
		this.setQuery("");
	}
	this.execute();
}

ZmTagPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		// bug fix #7057 - remove when new version of safari is release
 		// see http://bugzilla.opendarwin.org/show_bug.cgi?id=7279
 		if (AjxEnv.isSafari)
 			ev.item._checkBox.checked = !ev.item._checkBox.checked;
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		var tag = ti.getData(Dwt.KEY_OBJECT).getName(false);
 		if (ti.getChecked()) {
			this._checkedItems[tag] = true;
 		} else {
			delete this._checkedItems[tag];
 		}
		this._updateQuery();
 	}
}
