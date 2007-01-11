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
*
* @constructor
* @class
*
* @author Parag Shah
*
* @param id			[int]			numeric ID
* @param name		[string]		name
*/
function ZmTask(appCtxt, list) {
	ZmAppt.call(this, appCtxt, ZmItem.TASK, list);
	this.folderId = ZmOrganizer.ID_TASKS;
};

ZmTask.prototype = new ZmAppt;
ZmTask.prototype.constructor = ZmTask;


// Consts
ZmTask.PRIORITY_LOW		= 9;
ZmTask.PRIORITY_NORMAL	= 5;
ZmTask.PRIORITY_HIGH	= 1;

/**
* Used to make our own copy because the form will modify the date object by 
* calling its setters instead of replacing it with a new date object.
*/
ZmTaskClone = function() { }
ZmTask.quickClone =
function(task) {
	ZmTaskClone.prototype = task;

	var newTask = new ZmTaskClone();
	newTask.startDate = new Date(task.startDate.getTime());
	newTask.endDate = new Date(task.endDate.getTime());

	if (!newTask._orig)
		newTask._orig = task;

	return newTask;
};


// Public Methods

ZmTask.prototype.toString =
function() {
	return "ZmTask";
};

// Getters
ZmTask.prototype.getFolderId =			function() { return this.folderId; };
ZmTask.prototype.getPercentComplete =	function() { return this._percentComplete; };
ZmTask.prototype.getPriority =			function() { return this._priority; };
ZmTask.prototype.getIcon = 				function() { return "Task"; };

// Setters
ZmTask.prototype.setPercentComplete =	function(pComplete) { this._percentCompelte = pComplete; };
ZmTask.prototype.setPriority =			function(priority) { this._priority = priority; };
