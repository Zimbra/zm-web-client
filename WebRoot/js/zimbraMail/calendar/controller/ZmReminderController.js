/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
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
ZmReminderController = function(calController, apptType) {
	this._calController = calController;
    this._apptType = apptType;
	this._apptState = {};	// keyed on appt.getUniqueId(true)
    this._cacheMap = {};    
	this._cachedAppts = new AjxVector(); // set of appts in cache from refresh
	this._activeAppts = new AjxVector(); // set of appts we are actively reminding on
	this._oldAppts = new AjxVector(); // set of appts which are olde and needs silent dismiss    
	this._housekeepingTimedAction = new AjxTimedAction(this, this._housekeepingAction);
	this._refreshTimedAction = new AjxTimedAction(this, this.refresh);
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

/**
 * called when: (1) app first loads, (2) on refresh blocks, (3) after appt cache is cleared. Our
 * _apptState info will keep us from popping up the same appt again if we aren't supposed to
 * (at least for the duration of the app)
 * 
 * @private
 */
ZmReminderController.prototype.refresh =
function(retryCount) {
	this._searchTimeRange = this.getSearchTimeRange();
    DBG.println(AjxDebug.DBG1, "reminder search time range: " + this._searchTimeRange.start + " to " + this._searchTimeRange.end);

	try {
		var params = this.getRefreshParams();
	} catch(e) {
		if (retryCount == null && retryCount != 0) {
			retryCount = 3; //retry 3 times before giving up.
		}
		//bug 76771 if there is a exception retry after 1 sec
		if (retryCount) {
			setTimeout(this.refresh.bind(this, --retryCount), 1000);
			return;
		}
		DBG.println(AjxDebug.DBG1, "Too many failures to get refresh params. Giving up.");
		return;
	}
	this._calController.getApptSummaries(params);

	// cancel outstanding refresh, since we are doing one now, and re-schedule a new one
	if (this._refreshActionId) {
		AjxTimedAction.cancelAction(this._refreshActionId);
	}
	DBG.println(AjxDebug.DBG1, "reminder refresh");
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
		folderIds: this._apptType ==
            "appt" ? this._calController.getReminderCalendarFolderIds() :
                     this._calController.getCheckedCalendarFolderIds(true),
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

ZmReminderController.prototype._scheduleHouseKeepingAction =
function() {
	this._cancelHousekeepingAction(); //cancel to be on safe side against race condition when 2 will be runing instead of one.
	this._housekeepingActionId = AjxTimedAction.scheduleAction(this._housekeepingTimedAction, 60 * 1000);
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
        var hasAlarm = appt.recurring ? appt.isAlarmInstance() : appt.hasAlarmData();
		if (hasAlarm) {
            var alarmData = appt.getAlarmData();
            alarmData = (alarmData && alarmData.length > 0) ? alarmData[0] : {};
            AjxDebug.println(AjxDebug.REMINDER, appt.name + " :: " + appt.startDate + " :: " + appt.endDate + " :: " + appt.recurring + " :: " + appt.isException + " :: " + alarmData.nextAlarm + " :: " + alarmData.alarmInstStart);
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

    AjxDebug.println(AjxDebug.REMINDER, "updating reminder cache...");
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

    AjxDebug.println(AjxDebug.REMINDER, "new appts added to reminder cache :" + count);
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
    AjxDebug.println(AjxDebug.REMINDER, "reminder house keeping action...");
	var rd = this.getReminderDialog();
	if (ZmCsfeCommand.noAuth) {
        AjxDebug.println(AjxDebug.REMINDER, "reminder check: no auth token, bailing");
		if (rd && rd.isPoppedUp()) {
			rd.popdown();
		}
		return;
	}

	if (this._searchTimeRange) {
		var newTimeRange = this.getSearchTimeRange();
		var diff = newTimeRange.end - this._searchTimeRange.end;
		if (diff > AjxDateUtil.MSEC_PER_HOUR) {
            AjxDebug.println(AjxDebug.REMINDER, "time elapsed - refreshing reminder cache");
			this._searchTimeRange = null;
			this.refresh();
			return;
		}
	}

	var cachedSize = this._cachedAppts.size();
	var activeSize = this._activeAppts.size();
	if (cachedSize == 0 && activeSize == 0) {
        AjxDebug.println(AjxDebug.REMINDER, "no appts - empty cached and active list");
		this._scheduleHouseKeepingAction();
		return;
	}

	var numNotify = 0;
	var toRemove = [];

	for (var i=0; i < cachedSize; i++) {
		var appt = this._cachedAppts.get(i);

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
			} else {
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
	for (var i = 0; i < toRemove.length; i++) {
		this._cachedAppts.remove(toRemove[i]);
	}

	// if we have any to notify on, do it
	if (numNotify || rd.isPoppedUp()) {
		if (this._activeAppts.size() == 0 && rd.isPoppedUp()) {
            AjxDebug.println(AjxDebug.REMINDER, "popping down reminder dialog");
            rd.popdown();
		} else {
            AjxDebug.println(AjxDebug.REMINDER, "initializing reminder dialog");
			rd.initialize(this._activeAppts);
			if (!rd.isPoppedUp()) rd.popup();
		}
	}

    AjxDebug.println(AjxDebug.REMINDER, "no of appts active:" + this._activeAppts.size() + ", no of appts cached:" + cachedSize);

	if (this._oldAppts.size() > 0) {
		this.dismissAppt(this._oldAppts, new AjxCallback(this, this._silentDismissCallback));
	}

	// need to schedule housekeeping callback, ideally right before next _cachedAppt start time - lead,
	// for now just check once a minute...
	this._scheduleHouseKeepingAction();
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
 * @param	{AjxVector}	appts	a list of {@link ZmAppt} objects
 * @return	{Array}	an array of snoozed apt ids
 */
ZmReminderController.prototype.snoozeAppt =
function(appts) {
	appts = AjxUtil.toArray(appts);

	var snoozedIds = [];
	var appt;
	var uid;
	for (var i = 0; i < appts.length; i++) {
		appt = appts[i];
		uid = appt.getUniqueId(true);
		this._apptState[uid] = ZmReminderController._STATE_SNOOZED;
		snoozedIds.push(uid);
		this._activeAppts.remove(appt);
		this._cachedAppts.add(appt);
	}
	return snoozedIds;
};

ZmReminderController.prototype.dismissApptRequest = 
function(list, callback) {


    //<DismissCalendarItemAlarmRequest>
    //    <appt|task id="cal item id" dismissedAt="time alarm was dismissed, in millis"/>+
    //</DismissCalendarItemAlarmRequest>
    var jsonObj = {DismissCalendarItemAlarmRequest:{_jsns:"urn:zimbraMail"}};
    var request = jsonObj.DismissCalendarItemAlarmRequest;

    var appts = [];
    var dismissedAt = (new Date()).getTime();
    for (var i = 0; i < list.size(); i++) {
        var appt = list.get(i);
        var apptInfo = { id: appt.id, dismissedAt: dismissedAt};
        appts.push(apptInfo)
    }
    request[this._apptType] = appts;

    var respCallback    = this._handleDismissAppt.bind(this, list, callback);
    var offlineCallback = this._handleOfflineReminderAction.bind(this,  jsonObj, list, true);
    var errorCallback   = this._handleErrorDismissAppt.bind(this, list, callback);
    var params =
        {jsonObj:         jsonObj,
         asyncMode:       true,
         callback:        respCallback,
         offlineCallback: offlineCallback,
         errorCallback:   errorCallback
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

    this._updateApptAlarmData(list, appts);

	if (callback) {
		callback.run(list);
	}
};

ZmReminderController.prototype._handleErrorDismissAppt =
function(list, callback, response) {
};


ZmReminderController.prototype._updateApptAlarmData =
function(apptList, responseAppts) {
    var updateData = {};
    for (var i = 0; i < responseAppts.length; i++) {
        var appt = responseAppts[i];
        if (appt && appt.calItemId) {
            updateData[appt.calItemId] = appt.alarmData ? appt.alarmData : {};
        }
    }

    var size = apptList.size();
    for (var i = 0; i < size; i++) {
        var appt = apptList.get(i);
        if (appt) {
            if (updateData[appt.id]) {
                appt.alarmData = (updateData[appt.id] != {}) ? updateData[appt.id] : null;
            }
        }
    }
};

/**
 * Gets the reminder dialog.
 * 
 * @return	{ZmReminderDialog}	the dialog
 */
ZmReminderController.prototype.getReminderDialog =
function() {
	if (this._reminderDialog == null) {
		this._reminderDialog = new ZmReminderDialog(appCtxt.getShell(), this, this._calController, this._apptType);
	}
	return this._reminderDialog;
};


ZmReminderController.prototype._snoozeApptAction =
function(apptArray, snoozeMinutes, beforeAppt) {

	var apptList = AjxVector.fromArray(apptArray);

    var chosenSnoozeMilliseconds = snoozeMinutes * 60 * 1000;
    var added = false;

    //     <SnoozeCalendarItemAlarmRequest xmlns="urn:zimbraMail">
    //        <appt id="573" until="1387833974851"/>
    //        <appt id="601" until="1387833974851"/>
    //    </SnoozeCalendarItemAlarmRequest>

    var jsonObj = {SnoozeCalendarItemAlarmRequest:{_jsns:"urn:zimbraMail"}};
    var request = jsonObj.SnoozeCalendarItemAlarmRequest;

    var appts = [];
    if (beforeAppt) {
        // Using a before time, relative to the start of each appointment
        if (!this._beforeProcessor) {
            this._beforeProcessor = new ZmSnoozeBeforeProcessor(this._apptType);
        }
        added = this._beforeProcessor.execute(apptList, chosenSnoozeMilliseconds, appts);
    } else {
        // using a fixed untilTime for all appts
        added = apptList.size() > 0;
        var untilTime = (new Date()).getTime() + chosenSnoozeMilliseconds;
        for (var i = 0; i < apptList.size(); i++) {
            var appt = apptList.get(i);
            var apptInfo = { id: appt.id, until: untilTime};
            appts.push(apptInfo)
        }
    }
    request[this._apptType] = appts;

    var respCallback    = this._handleResponseSnoozeAction.bind(this, apptList, snoozeMinutes);
    var offlineCallback = this._handleOfflineReminderAction.bind(this,  jsonObj, apptList, false);
    var errorCallback   = this._handleErrorResponseSnoozeAction.bind(this);
    var ac = window.parentAppCtxt || window.appCtxt;
    ac.getRequestMgr().sendRequest(
        {jsonObj:         jsonObj,
         asyncMode:       true,
         callback:        respCallback,
         offlineCallback: offlineCallback,
         errorCallback:   errorCallback});

};


ZmReminderController.prototype._handleResponseSnoozeAction =
function(apptList, snoozeMinutes, result) {
    if (result.isException()) { return; }

	var response = result.getResponse();
	var snoozeResponse = response.SnoozeCalendarItemAlarmResponse;
	var appts = snoozeResponse ? snoozeResponse[this._apptType] : null;
	if (!appts) { return; }

    this._updateApptAlarmData(apptList, appts);

    if (snoozeMinutes == 1) {
	    // cancel outstanding timed action and update now...
		// I'm not sure why this is here but I suspect to prevent some race condition.
		this._cancelHousekeepingAction();
		//however calling _housekeepingAction immediately caused some other race condition issues. so I just schedule it again.
		this._scheduleHouseKeepingAction();
    }
};
ZmReminderController.prototype._handleErrorResponseSnoozeAction =
function(result) {
    //appCtxt.getAppController().popupErrorDialog(ZmMsg.reminderSnoozeError, result.msg, null, true);
};

ZmReminderController.prototype._handleOfflineReminderAction =
function(jsonObj, apptList, dismiss) {
    var jsonObjCopy = $.extend(true, {}, jsonObj);  //Always clone the object.  ?? Needed here ??
    var methodName = dismiss ? "DismissCalendarItemAlarmRequest" : "SnoozeCalendarItemAlarmRequest";
    jsonObjCopy.methodName = methodName;
    // Modify the id to thwart ZmOffline._handleResponseSendOfflineRequest, which sends a DELETE
    // notification for the id (which impacts here if there is a single id).
    jsonObjCopy.id = "C" + this._createSendRequestKey(apptList);

    var value = {
        update:          true,
        methodName:      methodName,
        id:              jsonObjCopy.id,
        value:           jsonObjCopy
    };

    var callback = this._handleOfflineReminderDBCallback.bind(this, jsonObjCopy, apptList, dismiss);
    ZmOfflineDB.setItemInRequestQueue(value, callback);
};

ZmReminderController.prototype._createSendRequestKey =
function(apptList) {
    var keyPart = [];
    var appt;
    for (var i = 0; i < apptList.size(); i++) {
        appt = apptList.get(i);
        if (appt) {
            keyPart.push(apptList.get(i).invId);
        }
    }
    return keyPart.join(":");
}

ZmReminderController.prototype._handleOfflineReminderDBCallback =
function(jsonObj, apptList, dismiss) {
    // Successfully stored the snooze request in the SendRequest queue, update the db items and flush the apptCache

    var request = jsonObj[jsonObj.methodName];
    var appts   = request[this._apptType];

    var callback;
    var appt;
    var apptCache = this._calController.getApptCache();
    for (var i = 0; i < apptList.size(); i++) {
        appt = apptList.get(i);
        if (appt) {
            // AWKWARD, but with indexedDB there's no way to specify a set of ids to read. So for the moment
            // (hopefully not too many appts triggered at once) - read one, modify, write it to the Calendar Obj store.
            // When done with each one, invoke a callback to update the reminder appt in memory.
            var apptInfo = appts[i];
            callback = this._updateOfflineAlarmCallback.bind(this, appt, dismiss, apptInfo.until);
            // Set up null data and replacement data for snooze.  apptInfo.until will be undefined for dismiss,
            // but we remove the alarm data for dismiss anyway
            var nullData = [];
            nullData.push({ nextAlarm: apptInfo.until});
            apptCache.updateOfflineAppt(appt.invId, "alarmData.0.nextAlarm", apptInfo.until, nullData, callback);
        }
    }
}

// Final step in the Reminder Snooze: update in memory.  I believe alarmData[0].nextAlarm is all that needs to
// be modified, try for now.   The online _updateApptAlarmData replaces the entire alarmData with the Snooze response,
// but all we have is the nextAlarm value.
ZmReminderController.prototype._updateOfflineAlarmCallback =
function(appt, dismiss, origValue, field, value) {
    if (dismiss) {
        appt.alarmData = null;
    } else {
        appt.alarmData[0].nextAlarm = origValue;
    }
}