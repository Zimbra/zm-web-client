/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

/**
*
* @constructor
* @class
*
* @author Parag Shah
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color
* @param url		[string]*		URL for this organizer's feed
* @param owner
* @param zid		[string]*		Zimbra id of owner, if remote share
* @param rid		[string]*		Remote id of organizer, if remote share
* @param restUrl	[string]*		The REST URL of this organizer.
*/
ZmTaskFolder = function(params) {
	params.type = ZmOrganizer.TASKS;
	ZmFolder.call(this, params);
}

ZmTaskFolder.prototype = new ZmFolder;
ZmTaskFolder.prototype.constructor = ZmTaskFolder;

// Public methods

ZmTaskFolder.prototype.toString =
function() {
	return "ZmTaskFolder";
};

ZmTaskFolder.prototype.getName =
function(showUnread, maxLength, noMarkup) {
    if (this.id == ZmFolder.ID_ROOT) return ZmMsg.tasks;
    if (this.path) return [this.path, this.name].join("/");
    return this.name;
};

ZmTaskFolder.prototype.getIcon =
function() {
	if (this.id == ZmFolder.ID_ROOT)	{ return null; }
	if (this.link)						{ return "SharedTaskList"; }
	return "TaskList";
};

ZmTaskFolder.prototype.supportsPublicAccess =
function() {
	// Task's can be accessed outside of ZCS (i.e. REST)
	return true;
};

ZmTaskFolder.prototype.setFreeBusy =
function(exclude, callback, errorCallback) {
	if (this.excludeFreeBusy == exclude) return;
	// NOTE: Don't need to store the value since the response will
	//       report that the object was modified.
	this._organizerAction({action: "fb", attrs: {excludeFreeBusy: exclude ? "1" : "0"}, callback: callback, errorCallback: errorCallback});
};

ZmTaskFolder.prototype.mayContain =
function(what) {
	if (!what) return true;

	var invalid = false;

	if (this.id == ZmFolder.ID_ROOT) {
		// cannot drag anything onto root folder
		invalid = true;
	} else if (this.link) {
		// cannot drop anything onto a read-only task folder
		invalid = this.isReadOnly();
	}

	if (!invalid) {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];

		if (item.type != ZmItem.TASK) {
			// only tasks are valid for task folders
			invalid = true;
		} else {
			// can't move items to folder they're already in; we're okay if
			// we have one item from another folder
			if (!invalid && item.folderId) {
				invalid = true;
				for (var i = 0; i < items.length; i++) {
					var tree = appCtxt.getById(items[i].folderId);
					if (tree != this) {
						invalid = false;
						break;
					}
				}
			}
		}
	}

	return !invalid;
};


// Callbacks

ZmTaskFolder.prototype.notifyCreate =
function(obj) {
	var t = ZmFolderTree.createFromJs(this, obj, this.tree);
	var i = ZmOrganizer.getSortIndex(t, ZmTaskFolder.sortCompare);
	this.children.add(t, i);
	t._notify(ZmEvent.E_CREATE);
};

ZmTaskFolder.prototype.notifyModify =
function(obj) {
	ZmFolder.prototype.notifyModify.call(this, obj);

	if (obj.f != null) {
		this._parseFlags(obj.f);
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		var fields = {};
		fields["excludeFreeBusy"] = true;
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
	}
};


// Static methods

ZmTaskFolder.checkName =
function(name) {
	return ZmFolder.checkName(name);
};

ZmTaskFolder.sortCompare =
function(calA, calB) {
	var check = ZmOrganizer.checkSortArgs(calA, calB);
	if (check != null) return check;

	// links appear after personal calendars
	if (calA.link != calB.link) {
		return calA.link ? 1 : -1;
	}

	// sort by calendar name
	var calAName = calA.name.toLowerCase();
	var calBName = calB.name.toLowerCase();
	if (calAName < calBName) return -1;
	if (calAName > calBName) return 1;
	return 0;
};
