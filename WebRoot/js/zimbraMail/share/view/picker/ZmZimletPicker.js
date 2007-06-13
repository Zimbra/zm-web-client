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

function ZmZimletPicker(parent) {

	ZmPicker.call(this, parent, ZmPicker.ZIMLET);
	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);
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
	var ti = this._zimlets[type] = new DwtTreeItem(tree);
	ti.setText(text);
	ti.setImage(imageInfo);
};

ZmZimletPicker.prototype._setupPicker =
function(parent) {
    this._zimlets = {};
    var idxZimlets = this._appCtxt.getZimletMgr().getIndexedZimlets()
    if (idxZimlets.length) {
        var tree = this._tree = new DwtTree(parent, DwtTree.CHECKEDITEM_STYLE);
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
 		// bug fix #7057 - remove when new version of safari is release
 		// see http://bugzilla.opendarwin.org/show_bug.cgi?id=7279
 		if (AjxEnv.isSafari)
 			ev.item._checkBox.checked = !ev.item._checkBox.checked;
 		this._updateQuery();
 	}
}
