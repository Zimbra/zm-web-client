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

ZmTagPicker = function(parent) {

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
