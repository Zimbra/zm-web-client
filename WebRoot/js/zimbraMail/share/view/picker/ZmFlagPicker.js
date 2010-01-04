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
	var tree = this._tree = new DwtTree({parent:picker, style:DwtTree.CHECKEDITEM_STYLE});
	tree.addSelectionListener(new AjxListener(this, ZmFlagPicker.prototype._treeListener));
	
	var ti = this._flagged = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.flagged);
	ti.setImage("FlagRed");
	
	ti = this._unflagged = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.unflagged);
	ti.setImage("FlagRedDis");
	
	tree.addSeparator();

	ti = this._read = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.read);
	ti.setImage("ReadMessage");
	
	ti = this._unread = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.unread);
	ti.setImage("UnreadMessage");	

	tree.addSeparator();

	ti = this._replied = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.replied);
	ti.setImage("Reply");
	
	ti = this._forwarded = new DwtTreeItem({parent:tree});
	ti.setText(ZmMsg.forwarded);
	ti.setImage("Forward");	
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

	if (query.length) {
		this.setQuery(query.join(" "));
	} else {
		this.setQuery("");
	}
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
