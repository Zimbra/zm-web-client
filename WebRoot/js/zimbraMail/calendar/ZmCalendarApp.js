/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmCalendarApp(appCtxt, container) {

	ZmApp.call(this, ZmZimbraMail.CALENDAR_APP, appCtxt, container);

	var settings = this._appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingsChangeListener);
	settings.getSetting(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL).addChangeListener(listener);
	settings.getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK).addChangeListener(listener);

	this._active = false;
};

ZmCalendarApp.prototype = new ZmApp;
ZmCalendarApp.prototype.constructor = ZmCalendarApp;

ZmCalendarApp.prototype.toString = 
function() {
	return "ZmCalendarApp";
};

ZmCalendarApp.prototype.launch =
function(callback) {
	//DBG.showTiming(true, "ZmCalendarApp#launch");
	var cc = this.getCalController();
	var view = cc._defaultView();
	//DBG.timePt("cc._defaultView");
	cc.show(view);
	//DBG.timePt("cc.show");
	if (callback)
		callback.run();
	//DBG.showTiming(false, "ZmCalendarApp#launch");
};

ZmCalendarApp.prototype.activate =
function(active, view, date) {
	var showTiming = DBG._showTiming;
	//if(!showTiming)DBG.showTiming(true, "ZmCalendarApp#activate("+active+")");
	//else DBG.println("ZmCalendarApp#activate("+active+")");
	this._active = active;

	var cc = this.getCalController();
	this.showMiniCalendar(active || this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL));
	//DBG.timePt("this.showMiniCalendar");

//	cc.getMiniCalendar().setSkipNotifyOnPage(!active);
	if (active) {
		var isAppView = (view == null || view == ZmController.CAL_VIEW || view == ZmController.CAL_DAY_VIEW ||
						 view == ZmController.CAL_WEEK_VIEW || view == ZmController.CAL_WORK_WEEK_VIEW ||
						 view == ZmController.CAL_MONTH_VIEW || view == ZmController.CAL_SCHEDULE_VIEW);
		if (isAppView) {
			cc.show(view);
			//DBG.timePt("cc.show");
			if (date) cc.setDate(date);
			//DBG.timePt("cc.setDate");
		}
	} 
	//if(!showTiming)DBG.showTiming(false, "ZmCalendarApp#activate("+active+")");
	//else DBG.println("ZmCalendarApp#activate("+active+")");
};

ZmCalendarApp.prototype.showMiniCalendar =
function(show) {
	var mc = this.getCalController().getMiniCalendar();
	mc.setSkipNotifyOnPage(show && !this._active);	
	if (!this._active) mc.setSelectionMode(DwtCalendar.DAY);
	this._appCtxt.getAppViewMgr().showTreeFooter(show);
};

ZmCalendarApp.prototype.getCalController =
function() {
	if (!this._calController)
		this._calController = new ZmCalViewController(this._appCtxt, this._container, this);
	return this._calController;
};

ZmCalendarApp.prototype.getReminderController =
function() {
	if (!this._reminderController)
		this._reminderController = new ZmReminderController(this._appCtxt, this.getCalController());
	return this._reminderController;
};

ZmCalendarApp.prototype.getApptComposeController = 
function() {
	if (!this._apptController)
		this._apptController = new ZmApptComposeController(this._appCtxt, this._container, this);
	return this._apptController;
};

ZmCalendarApp.prototype.loadResources = 
function() {
	this._locations = new ZmResourceList(this._appCtxt, ZmAppt.LOCATION);
	this._locations.isCanonical = true;
	this._equipment = new ZmResourceList(this._appCtxt, ZmAppt.EQUIPMENT);
	this._equipment.isCanonical = true;
	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var batchCmd = new ZmBatchCommand(this._appCtxt);
		batchCmd.add(new AjxCallback(this._locations, this._locations.load));
		batchCmd.add(new AjxCallback(this._equipment, this._equipment.load));
		batchCmd.run();
	}
};

/**
* Returns a ZmResourceList of known locations.
*/
ZmCalendarApp.prototype.getLocations = 
function() {
	return this._locations;
};

/**
* Returns a ZmResourceList of known equipment.
*/
ZmCalendarApp.prototype.getEquipment = 
function() {
	return this._equipment;
};

ZmCalendarApp.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL) {
		if (setting.getValue()) {
			this.showMiniCalendar(true);
		} else if (!this._active) {
			this.showMiniCalendar(false);
		}
	} else if (setting.id == ZmSetting.CAL_FIRST_DAY_OF_WEEK) {
		var controller = this.getCalController();
		var minical = controller.getMiniCalendar();

		var firstDayOfWeek = setting.getValue();
		minical.setFirstDayOfWeek(firstDayOfWeek);

		var date = minical.getDate();
		controller.setDate(date, 0, true);
	}
};
