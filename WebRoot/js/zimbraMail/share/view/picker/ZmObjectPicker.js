/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmObjectPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.OBJECT);
}

ZmObjectPicker.prototype = new ZmPicker;
ZmObjectPicker.prototype.constructor = ZmObjectPicker;

ZmPicker.CTOR[ZmPicker.OBJECT] = ZmObjectPicker;

ZmObjectPicker.prototype.toString = 
function() {
	return "ZmObjectPicker";
}

ZmObjectPicker.prototype._addObject =
function(tree, text, imageInfo, type) {
	var ti = this._objects[type] = new DwtTreeItem(tree);
	ti.setText(text);
	ti.setImage(imageInfo);
}

ZmObjectPicker.prototype._setupPicker =
function(parent) {
	this._objects = new Object();
	
    var tti, ti;
	var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
	tree.addSelectionListener(new AjxListener(this, ZmObjectPicker.prototype._treeListener));
	
	this._addObject(tree, ZmMsg.tracking, "PurchaseOrder", "tracking");
	this._addObject(tree, ZmMsg.phoneNumber, "Telephone", "phone");
	this._addObject(tree, ZmMsg.po, "PurchaseOrder", "po");
	this._addObject(tree, ZmMsg.url, "URL", "url");	
}

ZmObjectPicker.prototype._updateQuery = 
function() {
	var types = new Array();
	for (var type in this._objects)
		if (this._objects[type].getChecked())
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

ZmObjectPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED)
 		this._updateQuery();
}
