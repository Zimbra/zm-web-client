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

ZmTree = function(type) {

	if (arguments.length == 0) { return; }
	ZmModel.call(this, type);

	this.type = type;
	this.root = null;
};

ZmTree.prototype = new ZmModel;
ZmTree.prototype.constructor = ZmTree;

ZmTree.prototype.toString = 
function() {
	return "ZmTree";
};

ZmTree.prototype.asString = 
function() {
	return this.root ? this._asString(this.root, "") : "";
};

ZmTree.prototype.getById =
function(id) {
	return this.root ? this.root.getById(id) : null;
};

ZmTree.prototype.getByName =
function(name) {
	return this.root ? this.root.getByName(name) : null;
};

ZmTree.prototype.getByType =
function(name) {
	return this.root ? this.root.getByType(name) : null;
};

ZmTree.prototype.size =
function() {
	return this.root ? this.root.size() : 0;
};

ZmTree.prototype.reset =
function() {
	this.root = null;
};

ZmTree.prototype.asList =
function() {
	var list = [];
	return this.root ? this._addToList(this.root, list) : list;
};

ZmTree.prototype.getUnreadHash =
function(unread) {
	if (!unread) {
		unread = {};
	}
	return this.root ? this._getUnreadHash(this.root, unread) : unread;
};

ZmTree.prototype._addToList =
function(organizer, list) {
	if (!organizer.isRemote()) {
		list.push(organizer);
	}
	var children = organizer.children.getArray();
    for (var i = 0; i < children.length; i++) {
        this._addToList(children[i], list);
    }
	return list;
};

ZmTree.prototype._asString =
function(organizer, str) {
	if (organizer.id) {
		str = str + organizer.id;
	}
	var children = organizer.children.clone().getArray();
	if (children.length) {
		children.sort(function(a,b){return a.id - b.id;});
		str = str + "[";
		for (var i = 0; i < children.length; i++) {
			if (children[i].id == ZmFolder.ID_TAGS) { // Tags "folder" added when view is set
				continue;
			}
			if (i > 0) {
				str = str + ",";
			}
			str = this._asString(children[i], str);
		}
		str = str + "]";
	}
	return str;
};

ZmTree.prototype._getUnreadHash =
function(organizer, unread) {
	unread[organizer.id] = organizer.numUnread;
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++) {
		this._getUnreadHash(children[i], unread);
	}

	return unread;
};
