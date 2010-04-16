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

ZmCalMgr = function(container) {
	this._container = container;
	this.clearCache();
	
	this._listeners = {};
	this._folderNames = {};

	this._listeners[ZmOperation.NEW_APPT] = new AjxListener(this, this._newApptAction);
	this._listeners[ZmOperation.NEW_ALLDAY_APPT] = new AjxListener(this, this._newAllDayApptAction);
	this._listeners[ZmOperation.SEARCH_MAIL] = new AjxListener(this, this._searchMailAction);
};

ZmCalMgr.prototype.toString =
function() {
	return "ZmCalMgr";
};

ZmCalMgr.prototype.clearCache =
function() {
	this._miniCalData = {};
};

ZmCalMgr.prototype._createMiniCalendar =
function(date) {
	date = date ? date : new Date();

	var firstDayOfWeek = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;

    //todo: need to use server setting to decide the weekno standard
    var serverId = AjxTimezone.getServerId(AjxTimezone.DEFAULT);
    var useISO8601WeekNo = (serverId && serverId.indexOf("Europe")==0 && serverId != "Europe/London");

	this._miniCalendar = new DwtCalendar({parent: this._container, posStyle:DwtControl.ABSOLUTE_STYLE,
										  firstDayOfWeek: firstDayOfWeek, showWeekNumber: appCtxt.get(ZmSetting.CAL_SHOW_CALENDAR_WEEK), useISO8601WeekNo: useISO8601WeekNo});
	this._miniCalendar.setDate(date);
	this._miniCalendar.setScrollStyle(Dwt.CLIP);
	this._miniCalendar.addSelectionListener(new AjxListener(this, this._miniCalSelectionListener));
	this._miniCalendar.addActionListener(new AjxListener(this, this._miniCalActionListener));
	this._miniCalendar.addDateRangeListener(new AjxListener(this, this._miniCalDateRangeListener));
	this._miniCalendar.setMouseOverDayCallback(new AjxCallback(this, this._miniCalMouseOverDayCallback));
	this._miniCalendar.setMouseOutDayCallback(new AjxCallback(this, this._miniCalMouseOutDayCallback));

	var list = [];
	if (appCtxt.get(ZmSetting.MAIL_ENABLED)) {
		list.push("ZmMailMsg");
		list.push("ZmConv");
	}
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push("ZmContact");
	}
	this._miniCalDropTarget = new DwtDropTarget(list);
	this._miniCalDropTarget.addDropListener(new AjxListener(this, this._miniCalDropTargetListener));
	this._miniCalendar.setDropTarget(this._miniCalDropTarget);

	var workingWeek = [];
	for (var i = 0; i < 7; i++) {
		var d = (i + firstDayOfWeek) % 7;
		workingWeek[i] = (d > 0 && d < 6);
	}
	this._miniCalendar.setWorkingWeek(workingWeek);

	// add mini-calendar to skin
	var components = {};
	components[ZmAppViewMgr.C_TREE_FOOTER] = this._miniCalendar;
	appCtxt.getAppViewMgr().addComponents(components, true);
	
	var app = appCtxt.getApp(ZmApp.CALENDAR);
	var show = app._active || appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL);
	this._miniCalendar.setSkipNotifyOnPage(show && !app._active);
	if (!app._active) {
		this._miniCalendar.setSelectionMode(DwtCalendar.DAY);
	}
};

ZmCalMgr.prototype._miniCalDropTargetListener =
function(ev) {
	var calController = this.getCalViewController();
	calController._miniCalDropTargetListener(ev);
};

ZmCalMgr.prototype.getMiniCalendar = 
function() {
	if (!this._miniCalendar) {
		this._createMiniCalendar();
	}
	
	return this._miniCalendar;
};

ZmCalMgr.prototype._refreshCallback =
function(list) {
	this.getReminderController()._refreshCallback(list);
};

ZmCalMgr.prototype.getReminderController =
function() {
	if (!this._reminderController) {
		this._reminderController = new ZmReminderController(this);
	}
	return this._reminderController;
};

ZmCalMgr.prototype._miniCalSelectionListener =
function(ev) {
	if (ev.item instanceof DwtCalendar) {
		var calController = this.getCalViewController();
		calController._handleLoadMiniCalSelection(ev);
	}
};

ZmCalMgr.prototype._miniCalActionListener =
function(ev) {
	var mm = this._getMiniCalActionMenu();
	mm.__detail = ev.detail;
	mm.popup(0, ev.docX, ev.docY);
};

ZmCalMgr.prototype._getMiniCalActionMenu =
function() {
	if (this._minicalMenu == null) {

		this.postInitListeners();

		var list = [ZmOperation.NEW_APPT, ZmOperation.NEW_ALLDAY_APPT, ZmOperation.SEP, ZmOperation.SEARCH_MAIL];
		//Zimlet hack
		var zimletOps = ZmZimlet.actionMenus ? ZmZimlet.actionMenus["ZmCalViewController"] : null;
		if (zimletOps && zimletOps.length) {
			for (var i = 0; i < zimletOps.length; i++) {
				var op = zimletOps[i];
				ZmOperation.defineOperation(null, op);
				list.push(op.id);
			}
		}
		var params = {parent: appCtxt.getShell(), menuItems:list};
		this._minicalMenu = new ZmActionMenu(params);
		list = this._minicalMenu.opList;
		var cnt = list.length;
		for(var ix=0; ix < cnt; ix++) {
			if(this._listeners[list[ix]]) {
				this._minicalMenu.addSelectionListener(list[ix], this._listeners[list[ix]]);
			}
		}
	}
	return this._minicalMenu;
};

// Zimlet hack
ZmCalMgr.prototype.postInitListeners =
function () {
	if (ZmZimlet.listeners && ZmZimlet.listeners["ZmCalViewController"]) {
		for (var ix in ZmZimlet.listeners["ZmCalViewController"]) {
			if (ZmZimlet.listeners["ZmCalViewController"][ix] instanceof AjxListener) {
				this._listeners[ix] = ZmZimlet.listeners["ZmCalViewController"][ix];
			} else {
				this._listeners[ix] = new AjxListener(this, this._proxyListeners, [ZmZimlet.listeners["ZmCalViewController"][ix]]);
			}
		}
	}
};

// Few zimlets might expect listeners from calendar view controller object
ZmCalMgr.prototype._proxyListeners =
function(zimletListener, event) {
	var calController = this.getCalViewController();
	return (new AjxListener(calController, zimletListener)).handleEvent(event);
};

ZmCalMgr.prototype.isMiniCalCreated =
function() {
	return (this._miniCalendar != null);
};

ZmCalMgr.prototype._miniCalDateRangeListener =
function(ev) { 
	var viewId = appCtxt.getCurrentViewId();
	if (viewId == ZmId.VIEW_CAL_APPT || viewId == ZmId.VIEW_CAL) {
		var calController = this.getCalViewController();
		calController._scheduleMaintenance(ZmCalViewController.MAINT_MINICAL);
	} else {
		this.highlightMiniCal();
	}
};

ZmCalMgr.prototype._miniCalMouseOverDayCallback =
function(control, day) {
	this._currentMouseOverDay = day;
	var action = new AjxTimedAction(this, this._getDayToolTipOnDelay, [control, day]);
	AjxTimedAction.scheduleAction(action, 1000);
};

ZmCalMgr.prototype.getCalViewController = 
function() {
	var calController = AjxDispatcher.run("GetCalController");
	calController._miniCalendar = this._miniCalendar;
	calController._minicalMenu = this._minicalMenu;
	calController._miniCalDropTarget = this._miniCalDropTarget;
	return calController;
};

ZmCalMgr.prototype._miniCalMouseOutDayCallback =
function(control) {
	this._currentMouseOverDay = null;
};

ZmCalMgr.prototype._getDayToolTipOnDelay =
function(control, day) {
	if (!this._currentMouseOverDay) { return; }
	if ((this._currentMouseOverDay.getDate() == day.getDate()) &&
		(this._currentMouseOverDay.getMonth() == day.getMonth()))
	{
		this._currentMouseOverDay = null;
        var mouseEv = DwtShell.mouseEvent;
        if(mouseEv && mouseEv.docX > 0 && mouseEv.docY > 0) {
            var callback = new AjxCallback(this, this.showTooltip, [control, mouseEv.docX, mouseEv.docY]);
            this.getCalViewController().getDayToolTipText(day, false, callback);
        }
	}
};

ZmCalMgr.prototype.showTooltip =
function(control, x, y, tooltipContent) {
    control.setToolTipContent(tooltipContent);
    if(x > 0 && y > 0) {
        var shell = DwtShell.getShell(window);
        var tooltip = shell.getToolTip();
        tooltip.setContent(tooltipContent);
        tooltip.popup(x, y);
        control.__tooltipClosed = false;
    }
};

ZmCalMgr.prototype.getApptSummaries =
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

ZmCalMgr.prototype.setSearchParams =
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

ZmCalMgr.prototype._search =
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

ZmCalMgr.prototype._setSoapParams =
function(request, params) {	
	request.sortBy = "none";
	request.limit = "500";
	request.calExpandInstStart = params.start;
	request.calExpandInstEnd = params.end;
	request.types = ZmSearch.TYPE[ZmItem.APPT];
	request.offset = params.offset;

	var query = params.query;
	if (params.queryHint) {
		query = (query != null)
			? (query + " (" + params.queryHint + ")")
			: params.queryHint;
	}
	request.query = {_content:query};
};


ZmCalMgr.prototype._getApptSummariesResponse =
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

ZmCalMgr.prototype.processSearchResponse = 
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
		this._list = new ZmList(ZmItem.APPT);
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

ZmCalMgr.prototype.getCalendarName =
function(folderId) {
	var app = appCtxt.getApp(ZmApp.CALENDAR);
	return app.getCalendarName(folderId);
};

// Mini calendar action menu listeners, calview controller is loaded and than
// event handling listener functions are called
ZmCalMgr.prototype._newApptAction =
function(ev) {
	var calController = this.getCalViewController();
	calController._newApptAction(ev);
};

ZmCalMgr.prototype._newAllDayApptAction =
function(ev) {
	var calController = this.getCalViewController();
	calController._newAllDayApptAction(ev);
};

ZmCalMgr.prototype._searchMailAction =
function(ev) {
	var calController = this.getCalViewController();
	calController._searchMailAction(ev);
};

ZmCalMgr.prototype.getCheckedCalendarFolderIds =
function(localOnly) {
	var app = appCtxt.getApp(ZmApp.CALENDAR);
	return app.getCheckedCalendarFolderIds(localOnly);
};

ZmCalMgr.prototype._handleError =
function(ex) {
	if (ex.code == 'mail.INVITE_OUT_OF_DATE' ||	ex.code == 'mail.NO_SUCH_APPT') {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(ZmMsg.apptOutOfDate, DwtMessageDialog.INFO_STYLE);
		msgDialog.popup();
		return true;
	}
	return false;
};

ZmCalMgr.prototype.highlightMiniCal =
function() {
	this.getMiniCalCache()._getMiniCalData(this.getMiniCalendarParams());
};

ZmCalMgr.prototype.getMiniCalendarParams =
function() {
	var dr = this.getMiniCalendar().getDateRange();
	return {
		start: dr.start.getTime(),
		end: dr.end.getTime(),
		fanoutAllDay: true,
		noBusyOverlay: true,
		folderIds: this.getCheckedCalendarFolderIds(),
        tz: AjxTimezone.DEFAULT
	};
};

ZmCalMgr.prototype.getMiniCalCache =
function() {
	if (!this._miniCalCache) {
		this._miniCalCache = new ZmMiniCalCache(this);
	}
	return this._miniCalCache;
};

ZmCalMgr.prototype.getQuickReminderSearchTimeRange =
function() {
	var endOfDay = new Date();
	endOfDay.setHours(23,59,59,999);

	var end = new Date(endOfDay.getTime());

	var start = endOfDay;
	start.setHours(0,0,0, 0);

	return { start: start.getTime(), end: end.getTime() };
};

ZmCalMgr.prototype.showQuickReminder =
function() {
    var params = this.getQuickReminderParams();
    this.getApptSummaries(params);
};

ZmCalMgr.prototype.getQuickReminderParams =
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

ZmCalMgr.prototype._quickReminderCallback =
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
ZmCalMgr.prototype.getQuickReminderDialog =
function() {
	if (this._reminderDialog == null) {
		this._reminderDialog = new ZmQuickReminderDialog(appCtxt.getShell(), this, this._calController);
	}
	return this._reminderDialog;
};
