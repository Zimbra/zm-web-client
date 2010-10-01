/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
		this._reminderController = new ZmReminderController(this);
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

	// this array will hold a list of appts as we collect them from the server
	this._rawAppts = [];

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
	request.calExpandInstStart = params.start;
	request.calExpandInstEnd = params.end;
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

	if (searchResp && searchResp.appt && searchResp.appt.length) {
		this._rawAppts = this._rawAppts != null
			? this._rawAppts.concat(searchResp.appt)
			: searchResp.appt;

		// if "more" flag set, keep requesting more appts
		if (searchResp.more) {
			var lastAppt = searchResp.appt[searchResp.appt.length-1];
			if (lastAppt) {
				params.offset += 500;
				this._search(params);
				return;
			}
		}
	}

	var newList = new AjxVector();
	if (this._rawAppts && this._rawAppts.length) {
		this._list = new ZmList(ZmItem.TASK);
		for (var i = 0; i < this._rawAppts.length; i++) {
			DBG.println(AjxDebug.DBG2, "appt[j]:" + this._rawAppts[i].name);
			var apptNode = this._rawAppts[i];
			var instances = apptNode ? apptNode.inst : null;
			if (instances) {
				var args = {list:this._list};
				for (var j = 0; j < instances.length; j++) {
					var appt = ZmCalBaseItem.createFromDom(apptNode, args, instances[j]);
					DBG.println(AjxDebug.DBG2, "lite appt :" + appt);
					if (appt) newList.add(appt);
				}
			}
		}

	}
	return newList;
};

ZmTaskMgr.prototype.getCalendarName =
function(folderId) {
	var app = appCtxt.getApp(ZmApp.TASKS);
	return app.getCalendarName(folderId);
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
