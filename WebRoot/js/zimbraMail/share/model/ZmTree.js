/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmTree(type, appCtxt) {

	if (arguments.length == 0) return;
	ZmModel.call(this, true);

	this.type = type;
	this._appCtxt = appCtxt;
	this.root = null;
}

ZmTree.prototype = new ZmModel;
ZmTree.prototype.constructor = ZmTree;

// organizer class
ZmTree.CLASS = new Object();
ZmTree.CLASS[ZmOrganizer.FOLDER] = ZmFolder;
ZmTree.CLASS[ZmOrganizer.TAG] = ZmTag;

ZmTree.prototype.toString = 
function() {
	return "ZmTree";
}

ZmTree.prototype.asString = 
function() {
	return this.root ? this._asString(this.root, "") : "";
}

ZmTree.prototype.addChangeListener = 
function(listener) {
	if (ZmModel.prototype.addChangeListener.call(this, listener))
		this._appCtxt.getAppController().addModel(this);	
}

ZmTree.prototype.removeChangeListener = 
function(listener) {
	if (ZmModel.prototype.removeChangeListener.call(this, listener))
		if (!this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY))
			this._appCtxt.getAppController().removeModel(this);	
}

ZmTree.prototype.notifyDelete =
function(ids) {
	var deleted = new Array();
	for (var i = 0; i < ids.length; i++) {
		// ignore deletes of system folders
		if ((this.type == ZmOrganizer.FOLDER) && (ids[i] < ZmFolder.FIRST_USER_ID))
			continue;
		var organizer = this.getById(ids[i]);
		if (organizer)
			deleted.push(organizer);
	}
	if (deleted.length) {
		this.deleteLocal(deleted);
		this._eventNotify(ZmEvent.E_DELETE, deleted);
	}
}

ZmTree.prototype.getById =
function(id) {
	return this.root ? this.root.getById(id) : null;
}

ZmTree.prototype.getByName =
function(name) {
	return this.root ? this.root.getByName(name) : null;
}

ZmTree.prototype.size =
function() {
	return this.root ? this.root.size() : 0;
}

ZmTree.prototype.reset =
function() {
	this.root = null;
}

ZmTree.prototype.asList =
function() {
	var list = new Array();
	return this.root ? this._addToList(this.root, list) : list;
}

ZmTree.prototype.deleteLocal =
function(organizers) {
	if (!(organizers && organizers.length)) return;
	
	for (var i = 0; i < organizers.length; i++) {
		var organizer = organizers[i];
		organizer.children.removeAll();
		organizer.parent.children.remove(organizer);
	}
}

ZmTree.prototype.getUnreadHash =
function(unread) {
	if (!unread)
		unread = new Object();
	return this.root ? this._getUnreadHash(this.root, unread) : unread;
}

ZmTree.prototype._addToList =
function(organizer, list) {
	list.push(organizer);
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++)
		this._addToList(children[i], list)

	return list;
}

ZmTree.prototype._asString =
function(organizer, str) {
	if (organizer.id)
		str = str + organizer.id;
	var children = organizer.children.getArray();
	if (children.length) {
		children.sort(function(a,b){return a.id - b.id;});
		str = str + "[";
		for (var i = 0; i < children.length; i++) {
			if (children[i].id == ZmFolder.ID_TAGS) // Tags "folder" added when view is set
				continue;
			if (i > 0)
				str = str + ",";
			str = this._asString(children[i], str);
		}
		str = str + "]";
	}
	return str;
}

ZmTree.prototype._getUnreadHash =
function(organizer, unread) {
	unread[organizer.id] = organizer.numUnread;
	var children = organizer.children.getArray();
	for (var i = 0; i < children.length; i++)
		this._getUnreadHash(children[i], unread)

	return unread;
}

// Notify our listeners.
ZmTree.prototype._eventNotify =
function(event, organizers, details) {
	organizers = organizers || this;
	if (this._evtMgr.isListenerRegistered(ZmEvent.L_MODIFY)) {
		this._evt.set(event, this);
		this._evt.setDetails(details);
		this._evt.setDetail("organizers", organizers);
		this._evtMgr.notifyListeners(ZmEvent.L_MODIFY, this._evt);
	}
}

