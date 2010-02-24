/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a flag picker control.
 * @class
 * This class represents a flag picker control.
 * 
 * @param		{DwtControl}	parent		the parent
 * 
 * @extends		ZmPicker
 * @see			ZmPicker.FLAG
 */
ZmFlagPicker = function(parent) {
	ZmPicker.call(this, parent, ZmPicker.FLAG);
};

ZmFlagPicker.prototype = new ZmPicker;
ZmFlagPicker.prototype.constructor = ZmFlagPicker;

ZmPicker.CTOR[ZmPicker.FLAG] = ZmFlagPicker;

ZmFlagPicker.prototype.toString = 
function() {
	return "ZmFlagPicker";
};

ZmFlagPicker.prototype._setupPicker =
function(picker) {
	var tree = this._tree = new DwtTree({parent:picker, style:DwtTree.CHECKEDITEM_STYLE, isCheckedByDefault:false});
	tree.addSelectionListener(new AjxListener(this, ZmFlagPicker.prototype._treeListener));

	var ti = this._flagged = new DwtTreeItem({parent:tree, text:ZmMsg.flagged, imageInfo:"FlagRed"});
	ti = this._unflagged = new DwtTreeItem({parent:tree, text:ZmMsg.unflagged, imageInfo:"FlagDis"});

	tree.addSeparator();

	ti = this._read = new DwtTreeItem({parent:tree, text:ZmMsg.read, imageInfo:"ReadMessage"});
	ti = this._unread = new DwtTreeItem({parent:tree, text:ZmMsg.unread, imageInfo:"UnreadMessage"});

	tree.addSeparator();

	ti = this._replied = new DwtTreeItem({parent:tree, text:ZmMsg.replied, imageInfo:"Reply"});
	ti = this._forwarded = new DwtTreeItem({parent:tree, text:ZmMsg.forwarded, imageInfo:"Forward"});
};

ZmFlagPicker.prototype._updateQuery =
function() {
	var query = [];

	if (this._flagged.getChecked()) {
		query.push("is:flagged");
	} else if (this._unflagged.getChecked()) {
		query.push("is:unflagged");
	}

	if (this._read.getChecked()) {
		query.push("is:read");
	} else if (this._unread.getChecked()) {
		query.push("is:unread");
	}
	
	if (this._replied.getChecked()) {
		query.push("is:replied");
	}

	if (this._forwarded.getChecked()) {
		query.push("is:forwarded");
	}

	this.setQuery(query.length ? (query.join(" ")) :  "");

	this.execute();
};

ZmFlagPicker.prototype._treeListener =
function(ev) {
 	if (ev.detail == DwtTree.ITEM_CHECKED) {
 		var ti = ev.item;
 		var checked = ti.getChecked();
 		if (ti == this._flagged && checked && this._unflagged.getChecked()) {
 			this._unflagged.setChecked(false);
		} else if (ti == this._unflagged && checked && this._flagged.getChecked()) {
 			this._flagged.setChecked(false);
		} else if (ti == this._read && checked && this._unread.getChecked()) {
 			this._unread.setChecked(false);
		} else if (ti == this._unread && checked && this._read.getChecked()) {
 			this._read.setChecked(false);
 		}
		this._updateQuery();
 	}
};
