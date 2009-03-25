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

ZmZimletPicker = function(parent) {

	ZmPicker.call(this, parent, ZmPicker.ZIMLET);
}

ZmZimletPicker.prototype = new ZmPicker();
ZmZimletPicker.prototype.constructor = ZmZimletPicker;

ZmPicker.CTOR[ZmPicker.ZIMLET] = ZmZimletPicker;

ZmZimletPicker.prototype.toString = 
function() {
	return "ZmZimletPicker";
};

ZmZimletPicker.prototype._addZimlet =
function(tree, text, imageInfo, type) {
	var ti = this._zimlets[type] = new DwtTreeItem({parent:tree});
	ti.setText(text);
	ti.setImage(imageInfo);
};

ZmZimletPicker.prototype._setupPicker =
function(picker) {
    this._zimlets = {};
    var idxZimlets = appCtxt.getZimletMgr().getIndexedZimlets()
    if (idxZimlets.length) {
        var tree = this._tree = new DwtTree({parent:picker, style:DwtTree.CHECKEDITEM_STYLE});
        tree.addSelectionListener(new AjxListener(this, ZmZimletPicker.prototype._treeListener));
        for (var i = 0; i < idxZimlets.length; i += 1) {
            this._addZimlet(tree, idxZimlets[i].description, idxZimlets[i].icon, idxZimlets[i].keyword);
        }
    }
};

ZmZimletPicker.prototype._updateQuery = 
function() {
	var types = new Array();
	for (var type in this._zimlets)
		if (this._zimlets[type].getChecked())
			types.push(type);
	
	if (types.length) {
		var query = types.join(" OR ");
		if (types.length > 1)
			query = "(" + query + ")";
		this.setQuery("has:" + query);
	} else {
		this.setQuery("");
	}
	this.execute();
}

ZmZimletPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		this._updateQuery();
 	}
}
