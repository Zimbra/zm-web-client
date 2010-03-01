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
 * Creates a new reminder controller to manage the reminder dialog and status area.
 * @class
 *
 * This controller uses the following timed actions:
 * <ol>
 * <li>one for refreshing our "cache" of upcoming appts to notify on</li>
 * <li>one for when to next popup the reminder dialog. 
 *    by default, next appt start time minus lead time pref (i..e, 5 minutes before).
 *    but, also could be controlled by snooze prefs.</li>
 * </ol>
 * 
 * @param	{ZmCalViewController}		calController		the controller
 * 
 */
ZmReminderController = function(calController) {
	this._calController = calController;
	this._apptState = {};	// keyed on appt.getUniqueId(true)
    this._cacheMap = {};    
	this._cachedAppts = new AjxVector(); // set of appts in cache from refresh
	this._activeAppts = new AjxVector(); // set of appts we are actively reminding on
	this._oldAppts = new AjxVector(); // set of appts which are olde and needs silent dismiss    
	this._housekeepingTimedAction = new AjxTimedAction(this, this._housekeepingAction);
	this._refreshTimedAction = new AjxTimedAction(this, this.refresh);
	var settings = appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingChangeListener);
	var setting = settings.getSetting(ZmSetting.CAL_REMINDER_WARNING_TIME);
	if (setting) {
		setting.addChangeListener(listener);
		this._warningTime = appCtxt.get(ZmSetting.CAL_REMINDER_WARNING_TIME);
	}
};

ZmReminderController.prototype.constructor = ZmReminderController;

/**
 * Defines the "active" reminder state.
 */
ZmReminderController._STATE_ACTIVE = 1; // appt was in reminder, never dismissed
/**
 * Defines the "dismissed" reminder state.
 */
ZmReminderController._STATE_DISMISSED = 2; // appt was in reminder, and was dismissed
/**
 * Defines the "snoozed" reminder state.
 */
ZmReminderController._STATE_SNOOZED = 3; // appt was in reminder, and was snoozed

ZmReminderController._CACHE_RANGE = 24; // range of appts to grab 24 hours (-1, +23)
ZmReminderController._CACHE_REFRESH = 16; // when to grab another range

ZmReminderController.prototype.toString =
function() {
	return "ZmReminderController";
};

ZmReminderController.prototype._settingChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	var setting = ev.source;
	if (setting.id != ZmSetting.CAL_REMINDER_WARNING_TIME) return;

	var oldWarningTime = this._warningTime;
	var newWarningTime = this._warningTime = setting.getValue();
	if (newWarningTime == 0) {
		this._cancelRefreshAction();
		this._cancelHousekeepingAction();
	} else {
		if (oldWarningTime == 0) {
			this.refresh();
		} else {
			this._cancelHousekeepingAction();
			this._housekeepingAction();
		}
	}
	this._warningTime = newWarningTime;
};

/**
 * called when: (1) app first loads, (2) on refresh blocks, (3) after appt cache is cleared. Our
 * _apptState info will keep us from popping up the same appt again if we aren't supposed to
 * (at least for the duration of the app)
 * 
 * @private
 */
ZmReminderController.prototype.refresh =
function() {
	if (this._warningTime == 0) { return; }

	this._searchTimeRange = this.getSearchTimeRange();
	DBG.println(AjxDebug.DBG1, "reminder search time range: " + this._searchTimeRange.start + " to " + this._searchTimeRange.end);

	var params = this.getRefreshParams();
	this._calController.getApptSummaries(params);
	
	// cancel outstanding refresh, since we are doing one now, and re-schedule a new one
	if (this._refreshActionId) {
		AjxTimedAction.cancelAction(this._refreshActionId);
	}
	DBG.println(AjxDebug.DBG2, "reminder refresh");
	this._refreshActionId = AjxTimedAction.scheduleAction(this._refreshTimedAction, (AjxDateUtil.MSEC_PER_HOUR * ZmReminderController._CACHE_REFRESH));
};

/**
 * Gets the search time range.
 * 
 * @return	{Hash}	a hash of parameters
 */
ZmReminderController.prototype.getSearchTimeRange =
function() {
	var endOfDay = new Date();
	endOfDay.setHours(23,59,59,999);

	//grab a week's appt backwards
	var end = new Date(endOfDay.getTime());
	endOfDay.setDate(endOfDay.getDate()-7);

	var start = endOfDay;
	start.setHours(0,0,0, 0);

	return { start: start.getTime(), end: end.getTime() };
};

ZmReminderController.prototype.getRefreshParams =
function() {
	
	var timeRange = this.getSearchTimeRange();
	return {
		start: timeRange.start,
		end: timeRange.end,
		fanoutAllDay: false,
		folderIds: this._calController.getCheckedCalendarFolderIds(true),
		callback: (new AjxCallback(this, this._refreshCallback)),
		includeReminders: true
	};
};

ZmReminderController.prototype._cancelRefreshAction =
function() {
	if (this._refreshActionId) {
		AjxTimedAction.cancelAction(this._refreshActionId);
		delete this._refreshActionId;
	}
};

ZmReminderController.prototype._cancelHousekeepingAction =
function() {
	if (this._houseKeepingActionId) {
		AjxTimedAction.cancelAction(this._housekeepingActionId);
		delete this._houseKeepingActionId;
	}
};

/**
 * called after we get upcoming appts from server. Save list,
 * and call housekeeping.
 * 
 * @private
 */
ZmReminderController.prototype._refreshCallback =
function(list) {
	if (this._refreshDelay > 0) {
		AjxTimedAction.scheduleAction(new AjxTimedAction(this, this._refreshCallback, [list]), this._refreshDelay);
		this._refreshDelay = 0;
		return;
	}

	if (list instanceof ZmCsfeException) {
		this._calController._handleError(list, new AjxCallback(this, this._maintErrorHandler));
		return;
	}

	var newList = new AjxVector();
	this._cacheMap = {};

	// filter recurring appt instances, the alarmData is common for all the instances
	var size = list.size();
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		var id = appt.id;

		if (appt.hasAlarmData()) {
			if (!this._cacheMap[id]) {
				this._cacheMap[id] = true;
				newList.add(appt);
			}
		}
	}

	this._cachedAppts = newList.clone();
	this._cachedAppts.sort(ZmCalBaseItem.compareByTimeAndDuration);
	this._activeAppts.removeAll();

	// cancel outstanding timed action and update now...
	this._cancelHousekeepingAction();
	this._housekeepingAction();
};

ZmReminderController.prototype.updateCache =
function(list) {
	if (!list) { return; }

	if (!this._cachedAppts) {
		this._cachedAppts = new AjxVector();
	}

	DBG.println(AjxDebug.DBG2, "updating reminder cache...");
	var srchRange = this.getSearchTimeRange();
	var count = 0;

	// filter recurring appt instances, the alarmData is common for all the instances
	var size = list.size();
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		var id = appt.id;
		if(appt.hasAlarmData() && !this._cacheMap[id] && appt.isStartInRange(srchRange.start, srchRange.end)) {
			this._cacheMap[id] = true;
			this._cachedAppts.add(appt);
			count++;
		}
	}

	DBG.println(AjxDebug.DBG2, "new appts added to reminder cache :" + count);
};

ZmReminderController.prototype.isApptSnoozed =
function(uid) {
	return (this._apptState[uid] == ZmReminderController._STATE_SNOOZED);
};

/**
 * go through list to see if we should add any cachedAppts to activeAppts and
 * popup the dialog or not.
 * 
 * @private
 */
ZmReminderController.prototype._housekeepingAction =
function() {
	DBG.println(AjxDebug.DBG2, "reminder house keeping action...");
	var rd = this.getReminderDialog();
	if (!ZmCsfeCommand.getAuthToken()) {
		DBG.println(AjxDebug.DBG1, "reminder check: no auth token, bailing");
		if (rd && rd.isPoppedUp()) {
			rd.popdown();
		}
		return;
	}

	if (this._searchTimeRange) {
		var newTimeRange = this.getSearchTimeRange();
		var diff = newTimeRange.end - this._searchTimeRange.end;
		if (diff > AjxDateUtil.MSEC_PER_HOUR) {
			DBG.println(AjxDebug.DBG2, "time elapsed - refreshing reminder cache");
			this._searchTimeRange = null;
			this.refresh();
			return;
		}
	}

	var cachedSize = this._cachedAppts.size();
	var activeSize = this._activeAppts.size();
	if (cachedSize == 0 && activeSize == 0) {
		DBG.println(AjxDebug.DBG2, "no appts - empty cached and active list");
		this._housekeepingActionId = AjxTimedAction.scheduleAction(this._housekeepingTimedAction, 60*1000);
		return;
	}

	var numNotify = 0;

	// look for appts that fall with startTime/endTime
	var startTime = (new Date()).getTime();
	var endTime = startTime + (this._warningTime * 60 * 1000);

	var toRemove = [];

	for (var i=0; i < cachedSize; i++) {
		var appt = this._cachedAppts.get(i);
		if (appt && this._snoozedAppt) {
			var uid = appt.getUniqueId(true);
			if (this._snoozedAppt[uid]) {
				this._apptState[uid] = ZmReminderController._STATE_ACTIVE;
				toRemove.push(appt);
				numNotify++;
				this._activeAppts.add(appt);
				delete this._snoozedAppt[uid];
				continue;
			}
		}

		if (!appt || appt.ptst == ZmCalBaseItem.PSTATUS_DECLINED) {
			toRemove.push(appt);
		} else if (appt.isAlarmInRange()) {
			var uid = appt.getUniqueId(true);
			var state = this._apptState[uid];
			var addToActiveList = false;
			if (state == ZmReminderController._STATE_DISMISSED) {
				// just remove themn
			} else if (state == ZmReminderController._STATE_ACTIVE) {
				addToActiveList = true;
			} else if (state != ZmReminderController._STATE_SNOOZED) {
				// we need to notify on this one
				numNotify++;
				addToActiveList = true;
				this._apptState[uid] = ZmReminderController._STATE_ACTIVE;
			}

			if (addToActiveList) {
				toRemove.push(appt);
				if (!appCtxt.get(ZmSetting.CAL_SHOW_PAST_DUE_REMINDERS) && appt.isAlarmOld()) {
					numNotify--;
					this._oldAppts.add(appt);
				} else {
					this._activeAppts.add(appt);
				}
			}
		}
	}

	// remove any appts in cachedAppts that are no longer supposed to be in there	
	// need to do this here so we don't screw up iteration above
	for (var i in toRemove) {
		this._cachedAppts.remove(toRemove[i]);
	}

	// if we have any to notify on, do it
	if (numNotify || rd.isPoppedUp()) {
		if (this._activeAppts.size() == 0 && rd.isPoppedUp()) {
			rd.popdown();
		} else {
			rd.initialize(this._activeAppts);
			if (!rd.isPoppedUp()) rd.popup();
		}
	}

	DBG.println(AjxDebug.DBG2, "no of appts active:" + this._activeAppts.size() + ", no of appts cached:" + cachedSize);

	if (this._oldAppts.size() > 0) {
		this.dismissAppt(this._oldAppts, new AjxCallback(this, this._silentDismissCallback));
	}

	// need to schedule housekeeping callback, ideally right before next _cachedAppt start time - lead,
	// for now just check once a minute...
	this._housekeepingActionId = AjxTimedAction.scheduleAction(this._housekeepingTimedAction, 60*1000);
};

ZmReminderController.prototype._silentDismissCallback =
function(list) {
	var size = list.size();
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		if (appt && appt.hasAlarmData()) {
			if(appt.isAlarmInRange()) {
				this._activeAppts.add(appt);
			}
		}
	}
	this._oldAppts.removeAll();

	// cancel outstanding timed action and update now...
	this._cancelHousekeepingAction();
	this._housekeepingAction();
};

/**
 * Dismisses an appointment. This method is called when
 * an appointment (individually or as part of "dismiss all") is removed from reminders.
 * 
 * @param	{AjxVector|Array}	list	a list of {@link ZmAppt} objects
 * @param	{AjxCallback}		callback		a callback
 */
ZmReminderController.prototype.dismissAppt =
function(list, callback) {
	var appt;
	if (!(list instanceof AjxVector)) {
		list = AjxVector.fromArray((list instanceof Array)? list: [list]);
	}

	for (var i=0; i<list.size(); i++) {
		var appt = list.get(i);
		this._apptState[appt.getUniqueId(true)] = ZmReminderController._STATE_DISMISSED;
		this._activeAppts.remove(appt);
	}

	this.dismissApptRequest(list, callback);
};

/**
 * Snoozes the appointments.
 * 
 * @param	{AjxVector}	list	a list of {@link ZmAppt} objects
 * @return	{Array}	an array of snoozed apt ids
 */
ZmReminderController.prototype.snoozeAppt =
function(list) {
	var snoozedIds = [];
	var appt;
	var uid;
	for (var i = 0; i < list.size(); i++) {
		appt = list.get(i);
		uid = appt.getUniqueId(true);
		this._apptState[uid] = ZmReminderController._STATE_SNOOZED;
		snoozedIds.push(uid);
		this._activeAppts.remove(appt);
		this._cachedAppts.add(appt);
	}
	return snoozedIds;
};

ZmReminderController.prototype.activateSnoozedAppts =
function(list) {
	var rd = this.getReminderDialog();
	if (rd && rd.isPoppedUp()) {
		rd.popdown();
	}

	if (this._snoozedAppt == null) {
		this._snoozedAppt = {};
	}

	var appt;
	var uid;
	for (var i = 0; i < list.size(); i++) {
		appt = list.get(i);
		if (appt) {
			uid = appt.getUniqueId(true);
			this._snoozedAppt[uid] = true;
		}
	}

	this._cancelHousekeepingAction();
	this._housekeepingAction();
};

ZmReminderController.prototype.dismissApptRequest = 
function(list, callback) {
	var soapDoc = AjxSoapDoc.create("DismissCalendarItemAlarmRequest", "urn:zimbraMail");

	var dismissedAt = (new Date()).getTime();
	for (var i = 0; i < list.size(); i++) {
		var appt = list.get(i);
		var apptNode = soapDoc.set("appt");
		apptNode.setAttribute("id", appt.id);
		apptNode.setAttribute("dismissedAt", dismissedAt);
	}

	// for multi-account, always set account name to be the local account
	var acct = appCtxt.multiAccounts && appCtxt.accountList.mainAccount;
	var params = {
		soapDoc: soapDoc,
		asyncMode: true,
		accountName: (acct ? acct.name : null),
		callback: (new AjxCallback(this, this._handleDismissAppt, [list, callback])),
		errorCallback: (new AjxCallback(this, this._handleErrorDismissAppt, [list, callback]))
	};
	appCtxt.getAppController().sendRequest(params);
	return true;
};

ZmReminderController.prototype.setAlarmData =
function (soapDoc, request, params) {
	var alarmData = soapDoc.set("alarmData", null, request);
	alarmData.setAttribute("");
};

ZmReminderController.prototype._handleDismissAppt =
function(list, callback, result) {
	if (result.isException()) { return; }

	var response = result.getResponse();
	var dismissResponse = response.DismissCalendarItemAlarmResponse;
	var appts = dismissResponse ? dismissResponse.appt : null;
	if (!appts) { return; }

	var updateData = {};
	for (var i in appts) {
		var appt = appts[i];
		if (appt && appt.calItemId) {
			updateData[appt.calItemId] = appt.alarmData ? appt.alarmData : {};
		}
	}

	var size = list.size();
	for (var i = 0; i < size; i++) {
		var appt = list.get(i);
		if (appt) {
			if (updateData[appt.id]) {
				appt.alarmData = (updateData[appt.id] != {}) ? updateData[appt.id] : null;
			}
		}
	}

	if (callback) {
		callback.run(list);
	}
};

ZmReminderController.prototype._handleErrorDismissAppt =
function(list, callback, response) {
};

/**
 * Gets the reminder dialog.
 * 
 * @return	{ZmReminderDialog}	the dialog
 */
ZmReminderController.prototype.getReminderDialog =
function() {
	if (this._reminderDialog == null) {
		this._reminderDialog = new ZmReminderDialog(appCtxt.getShell(), this, this._calController);
	}
	return this._reminderDialog;
};
