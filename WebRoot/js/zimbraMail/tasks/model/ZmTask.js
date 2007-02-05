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
	ZmCalItem.call(this, appCtxt, ZmItem.TASK, list);

	this.priority = ZmCalItem.PRIORITY_NORMAL;
	this.pComplete = 0;
	this.status = ZmCalItem.STATUS_NEED;
};

ZmTask.prototype = new ZmCalItem;
ZmTask.prototype.constructor = ZmTask;


// Consts
ZmTask.PCOMPLETE_INT	= 10;

/**
* Used to make our own copy because the form will modify the date object by 
* calling its setters instead of replacing it with a new date object.
*/
ZmTaskClone = function() { };
ZmTask.quickClone =
function(task) {
	ZmTaskClone.prototype = task;

	var newTask = new ZmTaskClone();
	newTask.startDate = task.startDate ? (new Date(task.startDate.getTime())) : null;
	newTask.endDate = task.endDate ? (new Date(task.endDate.getTime())) : null;

	if (!newTask._orig)
		newTask._orig = task;

	newTask.type = ZmItem.TASK;

	return newTask;
};

ZmTask.createFromDom =
function(taskNode, instNode, args) {
	var task = new ZmTask(args.appCtxt, args.list);
	task._loadFromDom(taskNode, instNode);

	return task;
};


// Public Methods

ZmTask.prototype.toString =
function() {
	return "ZmTask";
};

// Getters
ZmTask.prototype.getIcon				= function() { return "Task"; };
ZmTask.prototype.getLocation			= function() { return this.location || ""; };
ZmTask.prototype.getFolder =
function() {
	var ct = this._appCtxt.getTree(ZmOrganizer.TASKS);
	return ct ? ct.getById(this.folderId) : null;
};

ZmCalItem.prototype.getSummary =
function(isHtml) {
	// TODO
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmTask.prototype.getToolTip =
function(controller) {
	// TODO
};

ZmTask.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_TASKS;
};

ZmTask.prototype._loadFromDom =
function(calItemNode, instNode) {
	ZmCalItem.prototype._loadFromDom.call(this, calItemNode, instNode);

	this.pComplete = this._getAttr(calItemNode, instNode, "percentComplete");
	this.location = this._getAttr(calItemNode, instNode, "loc");
};


// Private/protected methods

ZmTask.prototype._setExtrasFromMessage =
function(message) {
	this.location = message.invite.getLocation();
};

ZmTask.prototype._getSoapForMode =
function(mode, isException) {
	switch (mode) {
		case ZmCalItem.MODE_NEW:
			return "CreateTaskRequest";

		case ZmCalItem.MODE_EDIT_SINGLE_INSTANCE:
			return !isException
				? "CreateTaskExceptionRequest"
				: "ModifyTaskRequest";

		case ZmCalItem.MODE_EDIT:
		case ZmCalItem.MODE_EDIT_SERIES:
			return "ModifyTaskRequest";

		case ZmCalItem.MODE_DELETE:
		case ZmCalItem.MODE_DELETE_SERIES:
		case ZmCalItem.MODE_DELETE_INSTANCE:
			return "CancelTaskRequest";

		case ZmCalItem.MODE_GET:
			return "GetTaskRequest";
	}

	return null;
};

ZmTask.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	ZmCalItem.prototype._addExtrasToSoap.call(this, soapDoc, inv, comp);

	comp.setAttribute("percentComplete", this.pComplete);

	// TODO - set "completed" if applicable
};

ZmTask.prototype._addLocationToSoap =
function(inv) {
	inv.setAttribute("loc", this.location);
};
