/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmTaskMgr = function(container) {
	this._container = container;
	//this.clearCache();

	this._listeners = {};
	this._folderNames = {};

};

ZmTaskMgr.prototype = new ZmCalMgr;
ZmTaskMgr.prototype.constructor = ZmTaskMgr;

ZmTaskMgr.prototype.toString =
function() {
	return "ZmTaskMgr";
};

ZmTaskMgr.prototype._refreshCallback =
function(list) {
	this.getReminderController()._refreshCallback(list);
};

ZmTaskMgr.prototype.getReminderController =
function() {
	if (!this._reminderController) {
		this._reminderController = new ZmReminderController(this, "task");
	}
	return this._reminderController;
};

ZmTaskMgr.prototype.getCalViewController =
function() {
	var taskController = AjxDispatcher.run("GetTaskController");
	return taskController;
};

ZmTaskMgr.prototype._miniCalMouseOutDayCallback =
function(control) {
	this._currentMouseOverDay = null;
};

ZmTaskMgr.prototype.getApptSummaries =
function(params) {
	var apptVec = this.setSearchParams(params);

	if (apptVec != null && (apptVec instanceof AjxVector)) {
		return apptVec;
	}

	// this array will hold a list of tasks as we collect them from the server
	this._rawTasks = [];

	if (params.callback) {
		this._search(params);
	} else {
		return this._search(params);
	}
};

ZmTaskMgr.prototype.setSearchParams =
function(params) {
	if (!(params.folderIds instanceof Array)) {
		params.folderIds = [params.folderIds];
	} else if (params.folderIds.length == 0) {
		var newVec = new AjxVector();
		if (params.callback) {
			params.callback.run(newVec);
		}
		return newVec;
	}

	var folderIdMapper = {};
	var query = "";
	for (var i=0; i < params.folderIds.length; i++) {
		var fid = params.folderIds[i];
		var systemFolderId = appCtxt.getActiveAccount().isMain
			? fid : ZmOrganizer.getSystemId(fid);

		// map remote folder ids into local ones while processing search since
		// server wont do it for us (see bug 7083)
		var folder = appCtxt.getById(systemFolderId);
		var rid = folder ? folder.getRemoteId() : systemFolderId;
		folderIdMapper[rid] = systemFolderId;

		if (query.length) {
			query += " OR ";
		}
		var idText = AjxUtil.isNumeric(fid) ? fid : ['"', fid, '"'].join("");
		query += "inid:" + idText;

	}
	params.queryHint = query;
	params.folderIdMapper = folderIdMapper;
	params.offset = 0;
};

ZmTaskMgr.prototype._search =
function(params) {
	var jsonObj = {SearchRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.SearchRequest;

	this._setSoapParams(request, params);

	var accountName = appCtxt.multiAccounts ? appCtxt.accountList.mainAccount.name : null;
	if (params.callback) {
		appCtxt.getAppController().sendRequest({
			jsonObj: jsonObj,
			asyncMode: true,
			callback: (new AjxCallback(this, this._getApptSummariesResponse, [params])),
			noBusyOverlay: params.noBusyOverlay,
			accountName: accountName
		});
	} else {
		var response = appCtxt.getAppController().sendRequest({jsonObj: jsonObj, accountName: accountName});
		var result = new ZmCsfeResult(response, false);
		return this._getApptSummariesResponse(params, result);
	}
};

ZmTaskMgr.prototype._setSoapParams =
function(request, params) {
	request.sortBy = "none";
	request.limit = "500";
	//request.calExpandInstStart = params.start;
	//request.calExpandInstEnd = params.end;
	request.types = ZmSearch.TYPE[ZmItem.TASK];
	request.offset = params.offset;

	var query = params.query;
	if (params.queryHint) {
		query = (query != null)
			? (query + " (" + params.queryHint + ")")
			: params.queryHint;
	}
	request.query = {_content:query};
};


ZmTaskMgr.prototype._getApptSummariesResponse =
function(params, result) {
	// TODO: mark both as needing refresh?
	if (!result) { return; }

	var callback = params.callback;
	var resp;
	try {
		resp = result.getResponse();
	} catch (ex) {
		if (callback) {
			callback.run(new AjxVector());
		}
		return;
	}

	var searchResp = resp.SearchResponse;
	var newList = this.processSearchResponse(searchResp, params);
	if (newList == null) { return; }

	if (callback) {
		callback.run(newList, params.query);
	} else {
		return newList;
	}
};

ZmTaskMgr.prototype.processSearchResponse =
function(searchResp, params) {
	if(!searchResp) { return; }

	if (searchResp && searchResp.task && searchResp.task.length) {
		this._rawTasks = this._rawTasks != null
			? this._rawTasks.concat(searchResp.task)
			: searchResp.task;

		// if "more" flag set, keep requesting more appts
		if (searchResp.more) {
			var lastAppt = searchResp.task[searchResp.task.length-1];
			if (lastAppt) {
				params.offset += 500;
				this._search(params);
				return;
			}
		}
	}

	var newList = new AjxVector();
	if (this._rawTasks && this._rawTasks.length) {
		//this._list = new ZmList(ZmItem.TASK);
		for (var i = 0; i < this._rawTasks.length; i++) {
			DBG.println(AjxDebug.DBG2, "task[j]:" + this._rawTasks[i].name);
			var taskNode = this._rawTasks[i];
			////var instances = taskNode ? taskNode.inst : null;
			////if (instances) {
            //var args = {list:this._list};
            // Pass null as the list - otherwise the list, created above and used nowhere else
            // for viewing will be the one associated with teh
            var args = {list:null};
				////for (var j = 0; j < instances.length; j++) {
					var task = ZmTask.createFromDom(taskNode, args, null);
					DBG.println(AjxDebug.DBG2, "lite task :" + task);
					if (task) newList.add(task);
				////}
			////}

            // Accumulate this list to be processed by the reminderController callback
            newList.add(task);
		}

	}
	return newList;
};

ZmTaskMgr.prototype.getCalendarName =
function(folderId) {
	var app = appCtxt.getApp(ZmApp.TASKS);
	return app.getTaskFolderName(folderId);
};


ZmTaskMgr.prototype.getCheckedCalendarFolderIds =
function(localOnly) {
	var app = appCtxt.getApp(ZmApp.TASKS);
	return app.getTaskFolderIds(localOnly);
};

ZmTaskMgr.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(ZmMsg.apptOutOfDate, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};


ZmTaskMgr.prototype.getQuickReminderSearchTimeRange =
function() {
	var endOfDay = new Date();
	endOfDay.setHours(23,59,59,999);

	var end = new Date(endOfDay.getTime());

	var start = endOfDay;
	start.setHours(0,0,0, 0);

	return { start: start.getTime(), end: end.getTime() };
};

ZmTaskMgr.prototype.showQuickReminder =
function() {
    var params = this.getQuickReminderParams();
    this.getApptSummaries(params);
};

ZmTaskMgr.prototype.getQuickReminderParams =
function() {

	var timeRange = this.getQuickReminderSearchTimeRange();
	return {
		start: timeRange.start,
		end: timeRange.end,
		fanoutAllDay: false,
		folderIds: this.getCheckedCalendarFolderIds(true),
		callback: (new AjxCallback(this, this._quickReminderCallback)),
		includeReminders: true
	};
};

ZmTaskMgr.prototype._quickReminderCallback =
function(list) {
    var newList = new AjxVector();
    this._cacheMap = {};
    var size = list.size();

    var currentTime  = (new Date()).getTime();

    for (var i = 0; i < size; i++) {
        var appt = list.get(i);
        var id = appt.id;
        if (!this._cacheMap[id]) {
            this._cacheMap[id] = appt;
            if(appt.isAllDayEvent()) continue;
            var diff = appt.getStartTime() - currentTime;
            var isUpcomingEvent = (diff >= 0 && diff <= AjxDateUtil.MSEC_PER_HOUR)
            if((currentTime >= appt.getStartTime() && currentTime <= appt.getEndTime()) || isUpcomingEvent) {
                appt.isUpcomingEvent = isUpcomingEvent;
                newList.add(appt);
            }
        }
    }

    var qDlg = this.getQuickReminderDialog();
    qDlg.initialize(newList);
    qDlg.popup();
};


/**
 * Gets the quick reminder dialog.
 *
 * @return	{ZmQuickReminderDialog}	the dialog
 */
ZmTaskMgr.prototype.getQuickReminderDialog =
function() {
	if (this._reminderDialog == null) {
		this._reminderDialog = new ZmQuickReminderDialog(appCtxt.getShell(), this, this._calController);
	}
	return this._reminderDialog;
};
