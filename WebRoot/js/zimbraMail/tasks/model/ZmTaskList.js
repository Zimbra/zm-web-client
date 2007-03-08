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

/**
* Create a new task list.
* @constructor
* @class
* This class represents a list of tasks.
*
*/
function ZmTaskList(appCtxt, search, type) {
	if (arguments.length == 0) return;

	type = type ? type : ZmItem.TASK;
	ZmList.call(this, type, appCtxt, search);
};

ZmTaskList.prototype = new ZmList;
ZmTaskList.prototype.constructor = ZmTaskList;


// Public methods

ZmTaskList.prototype.toString =
function() {
	return "ZmTaskList";
};

// Handle modified task.
ZmTaskList.prototype.modifyLocal =
function(item, details) {
	var task = details.task;

	this.remove(task);

	// TODO - figure out proper sorting index once server bug #15063 is fixed
	this.add(task, 0/*this._sortIndex(task)*/);
};
