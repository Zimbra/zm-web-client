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
 * Creates a new reminder controller to manage the reminder dialog and status area
 *
 * need following timed actions:
 * 1) one for refreshing our "cache" of upcoming appts to notify on
 * 2) one for when to next popup the reminder dialog. 
 *    by default, next appt start time minus lead time pref (i..e, 5 minutes before).
 *    but, also could be controlled by snooze prefs.
 */
ZmReminderController = function(calController) {
	this._calController = calController;
	this._apptState = {};	// keyed on appt.getUniqueId(true)
	this._cachedAppts = new AjxVector(); // set of appts in cache from refresh
	this._activeAppts = new AjxVector(); // set of appts we are actively reminding on
	this._housekeepingTimedAction = new AjxTimedAction(this, this._housekeepingAction);
	this._refreshTimedAction = new AjxTimedAction(this, this.refresh);
	var settings = appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingChangeListener);
	settings.getSetting(ZmSetting.CAL_REMINDER_WARNING_TIME).addChangeListener(listener);
	this._warningTime = appCtxt.get(ZmSetting.CAL_REMINDER_WARNING_TIME);
};

ZmReminderController.prototype.constructor = ZmReminderController;

ZmReminderController._STATE_ACTIVE = 1; // appt was in reminder, never dismissed
ZmReminderController._STATE_DISMISSED = 2; // appt was in reminder, and was dismissed

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
*/
ZmReminderController.prototype.refresh =
function() {
	if (this._warningTime == 0) { return; }
	// grab appts -1 hour through +23 hours
	// schedule another refresh in + 12 hours
	var start = new Date();
	start.setMinutes(0, 0, 0);
	var startTime = start.getTime() - AjxDateUtil.MSEC_PER_HOUR;
	var endTime = startTime + (AjxDateUtil.MSEC_PER_HOUR * ZmReminderController._CACHE_RANGE);
	var params = {
		start: startTime,
		end: endTime,
		fanoutAllDay: false,
		folderIds: this._calController.getCheckedCalendarFolderIds(true),
		callback: (new AjxCallback(this, this._refreshCallback))
	};
	this._calController.getApptSummaries(params);
	
	// cancel outstanding refresh, since we are doing one now, and re-schedule a new one
	if (this._refreshActionId) {
		AjxTimedAction.cancelAction(this._refreshActionId);
	}
	this._refreshActionId = AjxTimedAction.scheduleAction(this._refreshTimedAction, (AjxDateUtil.MSEC_PER_HOUR * ZmReminderController._CACHE_REFRESH));
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
*/
ZmReminderController.prototype._refreshCallback =
function(list) {	
	if (list instanceof ZmCsfeException) {	
		this._calController._handleError(list, this._maintErrorHandler, null);
		return;
	}
	this._cachedAppts = list.clone();
	ZmApptList.sortVector(this._cachedAppts);
	this._activeAppts.removeAll();
	// cancel outstanding timed action and update now...
	this._cancelHousekeepingAction();
	this._housekeepingAction();
};

/**
* go through list to see if we should add any cachedAppts to activeAppts and
* popup the dialog or not.
*/
ZmReminderController.prototype._housekeepingAction =
function() {
	
	var rd = this.getReminderDialog();
	if (!ZmCsfeCommand.getAuthToken()) {
		DBG.println(AjxDebug.DBG1, "reminder check: no auth token, bailing");
		if (rd && rd.isPoppedUp()) {
			rd.popdown();
		}
		return;
	}

	var cachedSize = this._cachedAppts.size();
	var activeSize = this._activeAppts.size();	
	if (cachedSize == 0 && activeSize == 0) return;

	var numNotify = 0;
	
	// look for appts that fall with startTime/endTime
	var startTime = (new Date()).getTime();
	var endTime = startTime + (this._warningTime * 60 * 1000);

	var toRemove = [];

	for (var i=0; i < cachedSize; i++) {
		var appt = this._cachedAppts.get(i);
		if (!appt || appt.isAllDayEvent() || appt.getEndTime() < startTime || appt.ptst == ZmCalItem.PSTATUS_DECLINED) {
			toRemove.push(appt);
		} else if (appt.isInRange(startTime, endTime)) {
			toRemove.push(appt);
			// see if we already have state on this one
			var uid = appt.getUniqueId(true);
			var state = this._apptState[uid];
			if (state == ZmReminderController._STATE_DISMISSED) {
				// just remove themn
			} else if (state == ZmReminderController._STATE_ACTIVE) {
				this._activeAppts.add(appt);
			} else {
				// we need to notify on this one
				numNotify++;
				this._activeAppts.add(appt);
				this._apptState[uid] = ZmReminderController._STATE_ACTIVE;
			}
		} else if (appt.getStartTime() > endTime) {
			// list should be sorted, so break out...
			break;
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
	
	// need to schedule housekeeping callback, ideally right before next _cachedAppt start time - lead,
	// for now just check once a minute...
	this._housekeepingActionId = AjxTimedAction.scheduleAction(this._housekeepingTimedAction, 60*1000);
};

/**
* called when an appointment (individually or as part of "dismiss all") is removed from reminders
*/
ZmReminderController.prototype.dismissAppt =
function(appt) {
	this._apptState[appt.getUniqueId(true)] = ZmReminderController._STATE_DISMISSED;
	this._activeAppts.remove(appt);
};

ZmReminderController.prototype.getReminderDialog =
function() {
	if (this._reminderDialog == null) {
		this._reminderDialog = new ZmReminderDialog(appCtxt.getShell(), this, this._calController);
	}
	return this._reminderDialog;
};
