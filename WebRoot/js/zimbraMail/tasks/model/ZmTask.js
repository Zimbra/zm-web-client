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
 * @param id		[int]			numeric ID
 * @param name		[string]		name
 */
ZmTask = function(list, id, folderId) {
	ZmCalItem.call(this, ZmItem.TASK, list, id, folderId);

	this.priority = ZmCalItem.PRIORITY_NORMAL;
	this.pComplete = 0;
	this.status = ZmCalendarApp.STATUS_NEED;
};

ZmTask.prototype = new ZmCalItem;
ZmTask.prototype.constructor = ZmTask;


// Consts
ZmTask.PCOMPLETE_INT = 10;

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

// XXX: set start/end intervals for instNode
ZmTask.createFromDom =
function(taskNode, args, instNode) {
	// NOTE: passing ID implies this item should get cached!
	var task = new ZmTask(args.list, taskNode.id);
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
	return appCtxt.getById(this.folderId);
};

ZmTask.prototype.getSummary =
function(isHtml) {
	// TODO
};

/**
* Returns HTML for a tool tip for this appt.
*/
ZmTask.prototype.getToolTip =
function(controller) {
	// TODO
	DBG.println("------------ TODO: getTooltip! --------------");
};

ZmTask.prototype.getPrintHtml =
function(preferHtml, callback) {
	this.getDetails(ZmCalItem.MODE_EDIT, new AjxCallback(null, ZmTaskView.getPrintHtml, [this, preferHtml, callback]));
};

ZmTask.prototype.notifyModify =
function(obj) {
	ZmItem.prototype.notifyModify.call(this, obj);

	this._loadFromDom(obj);

	// update this tasks's list and notify
	this.list.modifyLocal(obj, {task:this});
	this._notify(ZmEvent.E_MODIFY, obj);
};

ZmTask.prototype.isPastDue =
function() {
	return (this.endDate && ((new Date()).getTime() > this.endDate.getTime()));
};

ZmTask.prototype.isComplete =
function() {
	return (this.pComplete == 100) || (this.status == ZmCalendarApp.STATUS_COMP);
};

/**
* Simplify deleting/canceling of Tasks by just not worrying about attendees,
* recurrence, etc. and always assume it will use BatchRequest. At some point,
* when Tasks supports attendees (aka assignment) and/or recurrence, this method
* will have to go thru ZmCalItem (share code with ZmAppt).
*
* @param mode		[Int]				Required constant. Usually ZmCalItem.MODE_DELETE
* @param batchCmd	[ZmBatchCommand]	Required API for batch request
*/
ZmTask.prototype.cancel =
function(mode, batchCmd) {
	this.setViewMode(mode);
	var soapDoc = AjxSoapDoc.create(this._getSoapForMode(mode), "urn:zimbraMail");
	this._addInviteAndCompNum(soapDoc);

	// NOTE: we dont bother w/ handling the response - since UI gets updated via notifications
	batchCmd.addRequestParams(soapDoc);
};


// Private/protected methods

ZmTask.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_TASKS;
};

ZmTask.prototype._loadFromDom =
function(node, instNode) {
	var inv = node.inv ? node.inv[0] : null
	var comp = inv ? inv.comp[0] : null;

	if (!node.id) this.id = node.id;
	// always re-compute invId if given since its mutable
	if (node.invId) {
		this.invId = node.invId;
	} else if (inv) {
		var remoteIndex = inv.id.indexOf(":");
		if (remoteIndex != -1) {
			this.invId = this.id + "-" + inv.id.substring(remoteIndex+1);
		} else {
			this.invId = [node.id, inv.id].join("-");
		}
	}
	this.uid = node.uid; // XXX: what is this?

	if (node.l) this.folderId = node.l;
	if (node.s) this.size = node.s;
	if (node.sf) this.sf = node.sf;
	if (node.dueDate) {
		this.endDate = new Date(parseInt(node.dueDate,10));
	} else {
		var part = this._getPart(node, comp, "e");
		var ed = (part && part.length) ? part[0].d : null;
		this.endDate = ed ? AjxDateUtil.parseServerDateTime(ed) : null;
		if (this.endDate)
			this.endDate.setHours(0,0,0);
	}

	if (node.name || comp) this.name = this._getPart(node, comp, "name");
	if (node.loc || comp) this.location = this._getPart(node, comp, "loc");
	if (node.allDay || comp) this.setAllDayEvent(this._getPart(node, comp, "allDay"));
	if (node.priority || comp) this.priority = parseInt(this._getPart(node, comp, "priority"));
	if (node.percentComplete || comp) this.pComplete = parseInt(this._getPart(node, comp, "percentComplete"));
	if (node.status || comp) this.status = this._getPart(node, comp, "status");
	if (node.isOrg || comp) this.isOrg = this._getPart(node, comp, "isOrg");
	if (node.or || comp) this.organizer = node.or ? node.or.a : (comp.or ? comp.or.a : null);
	if (node.ptst || comp) this.ptst = this._getPart(node, comp, "ptst");
	if (node.compNum != null) this.compNum = (this._getPart(node, comp, "compNum") || "0");

	if (node.f)	this._parseFlags(node.f);
	if (node.t)	this._parseTags(node.t);
};

ZmTask.prototype._getPart =
function(node, comp, name) {
	if (node[name] != null) return node[name];
	if (comp) return comp[name];
	return null;
};

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

ZmTask.prototype._getInviteFromError =
function(result) {
	return (result._data.GetTaskResponse.task[0].inv[0]);
};
