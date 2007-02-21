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
function ZmTaskList(appCtxt) {

	ZmList.call(this, ZmItem.TASK, appCtxt);
};

ZmTaskList.prototype = new ZmList;
ZmTaskList.prototype.constructor = ZmTaskList;


// Consts
//ZmTaskList.END_DATE_MAX_VALUE = 3650 * 24 * 60 * 60 * 1000;						// ~10 years in milliseconds
ZmTaskList.END_DATE_MAX_VALUE = 199 * 24 * 60 * 60 * 1000;						// HACK - server currently allows 200 days max range


// Public methods

ZmTaskList.prototype.toString =
function() {
	return "ZmTaskList";
};

ZmTaskList.prototype.load =
function(callback, errorCallback, folderId, startDate, endDate) {
	this.folderId = folderId || ZmOrganizer.ID_TASKS;

//	var sd = startDate || (new Date(0));										// either given start date or beginning of time
//	HACK HACK HACK - get 7 days earlier + 199 days until server allows more
	var sd = startDate;
	if (!sd) {
		var now = new Date().getTime();
		var minStart = now - (7 * 24 * 60 * 60 * 1000);
		sd = new Date(minStart);
	}

//	THIS CODE IS NOT PART OF THE HACK:
	var ed = endDate;															// either given end date or 10 years from now
	if (!ed) {
		var maxEnd = sd.getTime() + ZmTaskList.END_DATE_MAX_VALUE;
		ed = new Date(maxEnd);
	}

	var soapDoc = AjxSoapDoc.create("GetTaskSummariesRequest", "urn:zimbraMail");
	soapDoc.setMethodAttribute("s", sd.getTime());
	soapDoc.setMethodAttribute("e", ed.getTime());
	soapDoc.setMethodAttribute("l", this.folderId);

	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	var params = {soapDoc:soapDoc, asyncMode:true, callback:respCallback, errorCallback:errorCallback};

	this._appCtxt.getAppController().sendRequest(params);
};

ZmTaskList.prototype._handleResponseLoad =
function(callback, result) {

	var resp = result.getResponse().GetTaskSummariesResponse;
	var tasks = resp.task;
	if (tasks) {
		for (var i = 0; i < tasks.length; i++) {
			var taskNode = tasks[i];
			var args = {appCtxt: this._appCtxt, list: this};

			// XXX: for now, only add the first instance of any recurring task
			var task = ZmTask.createFromDom(taskNode, taskNode.inst[0], args);
			if (task) this.add(task);
/*
			var instances = taskNode ? taskNode.inst : null;
			if (instances) {
				var args = {appCtxt: this._appCtxt, list: this};
				for (var j = 0; j < instances.length; j++) {
					var instNode = instances[j];
					var task = ZmTask.createFromDom(taskNode, instNode, args);
					if (task) this.add(task);
				}
			}
*/
		}
	}

	if (callback) callback.run();
};
