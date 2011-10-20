/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file defines a task.
 */

/**
 * @class
 * 
 * This class represents a task.
 * 
 * @author Parag Shah
 *
 * @param	{Object}	list		the list
 * @param	{int}	id				the task id
 * @param	{String}	folderId	the folder id
 * 
 * @extends    ZmCalItem
 */
ZmTask = function(list, id, folderId) {
	ZmCalItem.call(this, ZmItem.TASK, list, id, folderId);

	this.priority = ZmCalItem.PRIORITY_NORMAL;
	this.pComplete = 0;
	this.status = ZmCalendarApp.STATUS_NEED;
    this.startDate = "";
    this.endDate = "";
    this.remindDate = new Date();
    this.alarm = false;
	this._useAbsoluteReminder = true;
};

ZmTask.prototype = new ZmCalItem;
ZmTask.prototype.constructor = ZmTask;


// Consts

/**
 * @private
 */
ZmTask.PCOMPLETE_INT = 10;

/**
 * Used to make our own copy because the form will modify the date object by
 * calling its setters instead of replacing it with a new date object.
 * 
 * @private
 */
ZmTaskClone = function() { };
ZmTask.quickClone =
function(task) {
	ZmTaskClone.prototype = task;

	var newTask = new ZmTaskClone();
	newTask.startDate = task.startDate ? (new Date(task.startDate.getTime())) : null;
	newTask.endDate = task.endDate ? (new Date(task.endDate.getTime())) : null;
    newTask._uniqId = Dwt.getNextId();

    newTask._validAttachments = AjxUtil.createProxy(task._validAttachments);
    
	if (!newTask._orig)
		newTask._orig = task;

	newTask.type = ZmItem.TASK;

	return newTask;
};

/**
 * Creates a task from the DOM.
 * 
 * @param	{Object}	taskNode	the task
 * @param	{Hash}		args		arguments
 * @param	{Object}	instNode	(not used)
 * 
 * @return	{ZmTask}		the task
 */
ZmTask.createFromDom =
function(taskNode, args, instNode) {
	// NOTE: passing ID implies this item should get cached!
	var task = new ZmTask(args.list, taskNode.id);
	task._loadFromDom(taskNode, instNode);

	return task;
};


// Public Methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmTask.prototype.toString =
function() {
	return "ZmTask";
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmTask.prototype.getIcon = function() { return "Task"; };

/**
 * Gets the folder.
 * 
 * @return	{ZmTaskFolder}	the folder
 */
ZmTask.prototype.getFolder =
function() {
	return appCtxt.getById(this.folderId);
};

/**
 * Gets the summary.
 * 
 * @private
 */
ZmTask.prototype.getSummary =
function(isHtml) {
	// TODO
};

/**
* Gets the tool tip.
* 
* @private
*/
ZmTask.prototype.getToolTip =
function(controller) {
	// TODO
	DBG.println("------------ TODO: getTooltip! --------------");
};

/**
 * @private
 */
ZmTask.prototype.notifyModify =
function(obj) {
	ZmItem.prototype.notifyModify.call(this, obj);

    this.uid = obj.uid;
    if (obj.l) this.folderId = obj.l;

	// update this tasks's list and notify
	this.list.modifyLocal(obj, {task:this});
	this._notify(ZmEvent.E_MODIFY, obj);
};

/**
 * Checks if this task is past due.
 * 
 * @return	{Boolean}	<code>true</code> if the task is past due
 */
ZmTask.prototype.isPastDue =
function() {
	return (this.endDate && ((new Date()).getTime() > this.endDate.getTime()));
};

/**
 * Gets the end time.
 *
 * @return	{Date}	the end time
 */
ZmTask.prototype.getEndTime = function() { return this.endDate ? this.endDate.getTime() : null; }; 	// end time in ms


/**
 * Gets the start time.
 *
 * @return	{Date}	the start time
 */
ZmTask.prototype.getStartTime = function() { return this.startDate ? this.startDate.getTime() : null; }; 	// start time in ms


/**
 * Checks if the task is complete.
 * 
 * @return	{Boolean}	<code>true</code> if the task is complete
 */
ZmTask.prototype.isComplete =
function() {
	return (this.pComplete == 100) || (this.status == ZmCalendarApp.STATUS_COMP);
};

/**
 * Gets the percent complete (between 0 and 100).
 * 
 * @return	{int}	the percentage complete
 */
ZmTask.prototype.getPercentComplete =
function() {
	return this.pComplete;
};

/**
 * Gets the status.
 * 
 * @return	{int}		the status
 * 
 * @see	ZmCalendarApp.STATUS_COMP
 * @see	ZmCalendarApp.STATUS_DEFR
 * @see	ZmCalendarApp.STATUS_INPR
 * @see	ZmCalendarApp.STATUS_NEED
 * @see	ZmCalendarApp.STATUS_WAIT
 * 
 * @see	ZmCalItem.getLabelForStatus
 */
ZmTask.prototype.getStatus =
function() {
	return	this.status;
}

/**
 * Gets the priority.
 * 
 * @return	{int}		the priority
 * 
 * @see	ZmCalItem.PRIORITY_LOW
 * @see	ZmCalItem.PRIORITY_NORMAL
 * @see	ZmCalItem.PRIORITY_HIGH
 * @see	ZmCalItem.getLabelForPriority
 * @see	ZmCalItem.getImageForPriority
 */
ZmTask.prototype.getPriority =
function() {
	return	this.priority;
}

/**
* Simplify deleting/canceling of Tasks by just not worrying about attendees,
* recurrence, etc. and always assume it will use BatchRequest. At some point,
* when Tasks supports attendees (aka assignment) and/or recurrence, this method
* will have to go thru ZmCalItem (share code with ZmAppt).
*
* @param mode		[Int]				Required constant. Usually ZmCalItem.MODE_DELETE
* @param batchCmd	[ZmBatchCommand]	Required API for batch request
* 
* @private
*/
ZmTask.prototype.cancel =
function(mode, batchCmd) {
	this.setViewMode(mode);
	var soapDoc = AjxSoapDoc.create(this._getSoapForMode(mode), "urn:zimbraMail");
	this._addInviteAndCompNum(soapDoc);

	// NOTE: we dont bother w/ handling the response - since UI gets updated via notifications
	batchCmd.addRequestParams(soapDoc);
};

/**
 * Gets the "owner" of remote/shared calItem folder this calItem belongs to.
 * 
 * @return	{ZmFolder}		the folder
 */
ZmTask.prototype.getRemoteFolderOwner =
function() {
	// bug fix #18855 - dont return the folder owner if moving betw. accounts
	var controller = AjxDispatcher.run("GetTaskController");
	if (controller.isMovingBetwAccounts(this, this.folderId)) {
		return null;
	}
	var folder = this.getFolder();
	return (folder && folder.link) ? folder.owner : null;
};

// Private/protected methods

/**
 * @private
 */
ZmTask.prototype._getDefaultFolderId =
function() {
	return ZmOrganizer.ID_TASKS;
};

/**
 * @private
 */
ZmTask.prototype._loadFromDom =
function(node, instNode) {
	var inv = node.inv ? node.inv[0] : null
	var comp = inv ? inv.comp[0] : null;

	if (!node.id) this.id = node.id;
	// always re-compute invId if given since its mutable
	if (node.invId) {
		this.invId = node.invId;
	} else if (inv) {
		var remoteIndex = inv.id;
        remoteIndex = remoteIndex.toString().indexOf(":");
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

    this.allDayEvent	= (instNode ? instNode.allDay : null || node.allDay)  ? "1" : "0";

    var nodeInst = node.inst && node.inst.length > 0 ? node.inst[0] : null;
    var tzo = this.tzo = nodeInst && nodeInst.tzo != null ? parseInt(nodeInst.tzo) : 0;
    var tzoDue = this.tzoDue = nodeInst && nodeInst.tzoDue != null ? parseInt(nodeInst.tzoDue) : 0;

    if (nodeInst && nodeInst.s) {
        var adjustMs = this.isAllDayEvent() ? (tzo + new Date(parseInt(nodeInst.s,10)).getTimezoneOffset()*60*1000) : 0;
        var startTime = parseInt(nodeInst.s,10) + adjustMs;
        this.startDate = new Date(startTime);
        this.uniqStartTime = this.startDate.getTime();
    } else {
        this.startDate = null;
        if(comp && comp.s && comp.s[0].d) {
            var start = comp.s[0].d;
            var yyyy = parseInt(start.substr(0,4), 10);
            var MM = parseInt(start.substr(4,2), 10);
            var dd = parseInt(start.substr(6,2), 10);
            this.startDate = new Date(yyyy, MM -1, dd);
        }
    }

    if (nodeInst && nodeInst.dueDate) {
        var adjustMs = this.isAllDayEvent() ? (tzoDue + new Date(parseInt(nodeInst.dueDate,10)).getTimezoneOffset()*60*1000) : 0;
        var endTime = parseInt(nodeInst.dueDate,10) + adjustMs;
        this.endDate = new Date(endTime);
    } else {
        this.endDate = null;
        if(comp && comp.e && comp.e[0].d) {
            var end = comp.e[0].d;
            var yyyy = parseInt(end.substr(0,4), 10);
            var MM = parseInt(end.substr(4,2), 10);
            var dd = parseInt(end.substr(6,2), 10);
            this.endDate = new Date(yyyy, MM -1, dd);
        }
    }


    if(node.alarm) this.alarm = node.alarm;
    if(node.alarmData) this.alarmData = this._getAttr(node, comp, "alarmData");

    if (node.name || comp)				this.name		= this._getAttr(node, comp, "name");
	if (node.loc || comp)				this.location	= this._getAttr(node, comp, "loc");
	if (node.allDay || comp)			this.setAllDayEvent(this._getAttr(node, comp, "allDay"));
	if (node.priority || comp)			this.priority	= parseInt(this._getAttr(node, comp, "priority"));
	if (node.percentComplete || comp)	this.pComplete	= parseInt(this._getAttr(node, comp, "percentComplete"));
	if (node.status || comp)			this.status	= this._getAttr(node, comp, "status");
	if (node.isOrg || comp)				this.isOrg		= new Boolean(this._getAttr(node, comp, "isOrg"));
	if (node.or || comp)				this.organizer	= node.or ? node.or.a : (comp.or ? comp.or.a : null);
	if (node.ptst || comp)				this.ptst		= this._getAttr(node, comp, "ptst");
	if (node.compNum != null)			this.compNum	= (this._getAttr(node, comp, "compNum") || "0");

	if (node.f)	this._parseFlags(node.f);
	if (node.t)	this._parseTags(node.t);

    this.type = ZmItem.TASK;
};

/**
 * Checks if alarm is in range (based on current time).
 *
 * @return	{Boolean}	<code>true</code> if the alarm is in range
 */
ZmTask.prototype.isAlarmInRange =
function() {
	if (!this.alarmData) { return false; }

	var alarmData = this.alarmData[0];

	if (!alarmData) { return false; }

    this._nextAlarmTime = new Date(alarmData.nextAlarm);
    this._alarmInstStart = this.adjustMS(alarmData.alarmInstStart, this.tzo);

	var currentTime = (new Date()).getTime();
 
    return this._nextAlarmTime <= currentTime;
};

/**
 * @private
 */
ZmTask.prototype._getAttr =
function(node, comp, name) {
	if (node[name] != null) return node[name];
	if (comp) return comp[name];
	return null;
};

/**
 * Checks if alarm is modified.
 *
 * @return	{Boolean}	<code>true</code> if the alarm is modified
 */
ZmTask.prototype.isAlarmModified =
function() {
    if(this._orig.alarm == true && this.alarm == false) {
        return true;
    }
    return false;
}

/**
 * Checks if this item is multi-day.
 *
 * @return	{Boolean}	<code>true</code> if start date and end date are on different days
 *
 * @see		#getStartTime
 * @see		#getEndTime
 */
ZmTask.prototype.isMultiDay =
function() {
	var start = this.startDate;
	var end = this.endDate;

    if(!start && !end) { return false; }

    if(!start) { return false; }

    //bug:55197 for task both startdate & enddate time is 00:00:00, so skipping the time based logic to check multiday or not
	/*
    if (end.getHours() == 0 && end.getMinutes() == 0 && end.getSeconds() == 0) {
		// if end is the beginning of day, then disregard that it
		// technically crossed a day boundary for the purpose of
		// determining if it is a multi-day appt
        end = new Date(end.getTime() - 2 * AjxDateUtil.MSEC_PER_HOUR);
	}*/

	return (start.getDate() != end.getDate()) ||
		   (start.getMonth() != end.getMonth()) ||
		   (start.getFullYear() != end.getFullYear());
};

/**
 * @private
 */
ZmTask.prototype._setExtrasFromMessage =
function(message) {
    ZmCalItem.prototype._setExtrasFromMessage.apply(this, arguments);

	this.location = message.invite.getLocation();
};

/**
 * @private overriden to set endDate to be null only if endDate is empty
 * @param message
 * @param viewMode
 */
ZmTask.prototype._setTimeFromMessage =
function(message, viewMode) {
    ZmCalItem.prototype._setTimeFromMessage.apply(this, arguments);
    if(message.invite.components[0].s == null){
        this.startDate = null;
    }
};

/**
 * @private
 */
ZmTask.prototype.parseAlarm =
function(tmp) {
	if (!tmp) { return; }

	var d;
	var trigger = (tmp) ? tmp.trigger : null;
	var abs = (trigger && (trigger.length > 0)) ? trigger[0].abs : null;
	d = (abs && (abs.length > 0)) ? abs[0].d : null;

	this._reminderMinutes = 0;
	if (tmp && (tmp.action == "DISPLAY")) {
		if (d != null) {
			this._reminderAbs = d;
            this.remindDate = d ? AjxDateUtil.parseServerDateTime(d) : null;
		}
	}
};


/**
 * @private
 */
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

/**
 * @private
 */
ZmTask.prototype._addExtrasToSoap =
function(soapDoc, inv, comp) {
	ZmCalItem.prototype._addExtrasToSoap.call(this, soapDoc, inv, comp);

	comp.setAttribute("percentComplete", this.pComplete);

	// TODO - set "completed" if applicable
};

/**
 * @private
 */
ZmTask.prototype._getInviteFromError =
function(result) {
	return (result._data.GetTaskResponse.task[0].inv[0]);
};

/**
 * @private
 */
ZmTask.prototype.setTaskReminder =
function(absStr) {
    this._reminderAbs = absStr;
};

/**
 * Checks if the task is in the trash.
 *
 * @param	{ZmTask}	task		the task
 * @return	{Boolean}	<code>true</code> if in trash
 */
ZmTask.isInTrash =
function(task) {
	var folderId = (task instanceof ZmTask) ? task.folderId : task.l;
	var folder = appCtxt.getById(folderId);
	return (folder && folder.isInTrash());
};