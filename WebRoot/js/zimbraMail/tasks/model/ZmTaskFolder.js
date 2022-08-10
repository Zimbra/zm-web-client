/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the task folder class.
 */

/**
 * Creates the task folder.
 * @class
 * This class represents a task folder.
 * 
 * @author Parag Shah
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {int}	params.id			the numeric ID
 * @param {String}	params.name		the name
 * @param {ZmOrganizer}	params.parent		the parent organizer
 * @param {ZmTree}	params.tree		the tree model that contains this organizer
 * @param {String}	params.color	the color
 * @param {String}	params.url		the URL for this organizer's feed
 * @param {String}	params.owner	the owner
 * @param {String}	params.zid		the Zimbra id of owner, if remote share
 * @param {String}	params.rid		the remote id of organizer, if remote share
 * @param {String}	params.restUrl	[the REST URL of this organizer.
 * 
 * @extends		ZmFolder
 */
ZmTaskFolder = function(params) {
	params.type = ZmOrganizer.TASKS;
	ZmFolder.call(this, params);
}

ZmTaskFolder.prototype = new ZmFolder;
ZmTaskFolder.prototype.constructor = ZmTaskFolder;

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTaskFolder.prototype.toString =
function() {
	return "ZmTaskFolder";
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

/**
 * Sets the free/busy.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{AjxCallback}		errorCallback		the error callback
 * @param	{Boolean}		exclude		checks to exclose free busy
 */
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
					var item = items[i];
					var folder = appCtxt.getById(item.folderId);
					if (folder != this) {
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
	var i = ZmOrganizer.getSortIndex(t, ZmFolder.sortCompareNonMail);
	this.children.add(t, i);
	t._notify(ZmEvent.E_CREATE);
};

ZmTaskFolder.prototype.notifyModify =
function(obj) {
	ZmFolder.prototype.notifyModify.call(this, obj);

	if (obj.f != null && !obj._isRemote) {
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

/**
 * Checks the name for validity
 * 
 * @return	{String}	an error message if the name is invalid; <code>null</code> if the name is valid.
 */
ZmTaskFolder.checkName =
function(name) {
	return ZmFolder.checkName(name);
};

