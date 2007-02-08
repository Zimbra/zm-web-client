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

function ZmCalendarApp(appCtxt, container) {

	ZmApp.call(this, ZmApp.CALENDAR, appCtxt, container);

	AjxDispatcher.setPackageLoadFunction("Calendar", new AjxCallback(this, this._postLoad));
	AjxDispatcher.registerMethod("GetCalController", "CalendarCore", new AjxCallback(this, this.getCalController));
	AjxDispatcher.registerMethod("GetReminderController", "CalendarCore", new AjxCallback(this, this.getReminderController));
	AjxDispatcher.registerMethod("ShowMiniCalendar", "CalendarCore", new AjxCallback(this, this.showMiniCalendar));
	AjxDispatcher.registerMethod("GetApptComposeController", ["CalendarCore", "Calendar"], new AjxCallback(this, this.getApptComposeController));

	ZmItem.registerItem(ZmItem.APPT,
						{app:			ZmApp.CALENDAR,
						 nameKey:		"appointment",
						 icon:			"Appointment",
						 itemClass:		"ZmAppt",
						 organizer:		ZmOrganizer.CALENDAR,
						 searchType:	"appointment",
						 stbNameKey:	"searchCalendar",
						 stbTooltipKey:	"searchForAppts",
						 stbIcon:		"CalendarFolder"
						});

	ZmItem.registerItem(ZmItem.RESOURCE,
						{app:			ZmApp.CALENDAR,
						 itemClass:		"ZmResource",
						 node:			"calResource",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("CalendarCore");
			return new ZmResourceList(this._appCtxt, null, search);
		}, this)
						});

	ZmOrganizer.registerOrg(ZmOrganizer.CALENDAR,
							{app:				ZmApp.CALENDAR,
							 nameKey:			"calendar",
							 defaultFolder:		ZmOrganizer.ID_CALENDAR,
							 soapCmd:			"FolderAction",
							 firstUserId:		256,
							 orgClass:			"ZmCalendar",
							 orgPackage:		"CalendarCore",
							 treeController:	"ZmCalendarTreeController",
							 labelKey:			"calendars",
							 views:				["appointment"],
							 folderKey:			"calendarFolder",
							 mountKey:			"mountCalendar",
							 createFunc:		"ZmCalendar.create",
							 compareFunc:		"ZmCalendar.sortCompare",
							 deferrable:		true
							});

	ZmApp.registerApp(ZmApp.CALENDAR,
							 {mainPkg:				"Calendar",
							  nameKey:				"calendar",
							  icon:					"CalendarApp",
							  chooserTooltipKey:	"goToCalendar",
							  viewTooltipKey:		"displayCalendar",
							  defaultSearch:		ZmSearchToolBar.FOR_MAIL_MI,
							  overviewTrees:		[ZmOrganizer.CALENDAR],
							  showZimlets:			true,
							  assistants:			{"ZmAppointmentAssistant":	["CalendarCore", "Calendar"],
							  						 "ZmCalendarAssistant":		["CalendarCore", "Calendar"]},
							  actionCode:			ZmKeyMap.GOTO_CALENDAR,
							  chooserSort:			30,
							  defaultSort:			20
							  });

	var settings = this._appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingsChangeListener);
	settings.getSetting(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL).addChangeListener(listener);
	settings.getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK).addChangeListener(listener);

	this._active = false;
};

// Organizer and item-related constants
ZmEvent.S_APPT				= "APPT";
ZmEvent.S_RESOURCE			= "RESOURCE";
ZmItem.APPT					= ZmEvent.S_APPT;
ZmItem.RESOURCE				= ZmEvent.S_RESOURCE;
ZmOrganizer.CALENDAR		= "CALENDAR";

// App-related constants
ZmApp.CALENDAR					= "Calendar";
ZmApp.CLASS[ZmApp.CALENDAR]		= "ZmCalendarApp";
ZmApp.SETTING[ZmApp.CALENDAR]	= ZmSetting.CALENDAR_ENABLED;
ZmApp.LOAD_SORT[ZmApp.CALENDAR]	= 40;
ZmApp.QS_ARG[ZmApp.CALENDAR]	= "calendar";

// ms to wait before fetching reminders
ZmCalendarApp.REMINDER_START_DELAY = 30000;

ZmCalendarApp.prototype = new ZmApp;
ZmCalendarApp.prototype.constructor = ZmCalendarApp;

ZmCalendarApp.prototype.toString = 
function() {
	return "ZmCalendarApp";
};

ZmCalendarApp.prototype.startup =
function(result) {
	if (this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		AjxDispatcher.run("ShowMiniCalendar", true);
	}
	var refreshAction = new AjxTimedAction(this, function() {
			AjxDispatcher.run("GetReminderController").refresh();
		});
	AjxTimedAction.scheduleAction(refreshAction, ZmCalendarApp.REMINDER_START_DELAY);
};

ZmCalendarApp.prototype.refresh =
function(refresh) {
	if (!this._appCtxt.inStartup) {
		AjxDispatcher.run("GetCalController").refreshHandler(refresh);
	}
};

ZmCalendarApp.prototype.deleteNotify =
function(ids) {
	if (this._deferNotifications("delete", ids)) { return; }
	AjxDispatcher.run("GetCalController").notifyDelete(ids);
};

ZmCalendarApp.prototype.createNotify =
function(list) {
	if (this._deferNotifications("create", list)) { return; }
	for (var i = 0; i < list.length; i++) {
		var create = list[i];
		var name = create._name;
		if (this._appCtxt.cacheGet(create.id)) { continue; }

		if (name == "folder") {
			var parentId = create.l;
			var parent;
			var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
			if (parentId == ZmOrganizer.ID_ROOT) {
				if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR][0]) {
					parent = calendarTree.getById(parentId);
				}
			} else {
				parent = calendarTree.getById(parentId);
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmCalendarApp: handling CREATE for node: " + name);
				parent.notifyCreate(create);
				create._handled = true;
			}
		} else if (name == "link") {
			var parentId = create.l;
			var parent, share;
			if (create.view == ZmOrganizer.VIEWS[ZmOrganizer.CALENDAR][0]) {
				var calendarTree = this._appCtxt.getTree(ZmOrganizer.CALENDAR);
				parent = calendarTree.getById(parentId);
				share = ZmOrganizer.CALENDAR;
			}
			if (parent) {
				DBG.println(AjxDebug.DBG1, "ZmCalendarApp: handling CREATE for node: " + name);
				parent.notifyCreate(create, true);
				// XXX: once bug #4434 is fixed, check if this call is still needed
				this._appCtxt.getRequestMgr().getFolderPermissions([share]);
				create._handled = true;
			}
		} else if (name == "appt") {
			// TODO: create appt object and pass into notify create
			AjxDispatcher.run("GetCalController").notifyCreate(null);
		}
	}
};

ZmCalendarApp.prototype.modifyNotify =
function(list) {
	if (this._deferNotifications("modify", list)) { return; }
	AjxDispatcher.run("GetCalController").notifyModify(list);
};

ZmCalendarApp.prototype.postNotify =
function(notify) {
	AjxDispatcher.run("GetCalController").notifyComplete();
};

ZmCalendarApp.prototype.launch =
function(callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [callback]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
};

ZmCalendarApp.prototype._handleLoadLaunch =
function(callback) {
	var cc = this.getCalController();
	var view = cc._defaultView();
	cc.show(view);
	if (callback)
		callback.run();
};

ZmCalendarApp.prototype.activate =
function(active, view, date) {
	this._active = active;

	var show = active || this._appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL);
	AjxDispatcher.run("ShowMiniCalendar", show);

	if (active) {
		var isAppView = (view == null || view == ZmController.CAL_VIEW || view == ZmController.CAL_DAY_VIEW ||
						 view == ZmController.CAL_WEEK_VIEW || view == ZmController.CAL_WORK_WEEK_VIEW ||
						 view == ZmController.CAL_MONTH_VIEW || view == ZmController.CAL_SCHEDULE_VIEW);
		if (isAppView) {
			var cc = this.getCalController();
			cc.show(view);
			if (date) cc.setDate(date);
		}
	} 
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
	this._locations = new ZmResourceList(this._appCtxt, ZmCalItem.LOCATION);
	this._locations.isCanonical = true;
	this._equipment = new ZmResourceList(this._appCtxt, ZmCalItem.EQUIPMENT);
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

ZmCalendarApp.prototype._postLoad =
function() {
	this._createDeferredFolders(ZmOrganizer.CALENDAR);
	this.getApptComposeController().initComposeView(true);
};

ZmCalendarApp.prototype._settingsChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_SETTING) return;
	
	var setting = ev.source;
	if (setting.id == ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL) {
		if (setting.getValue()) {
			AjxDispatcher.run("ShowMiniCalendar", true);
		} else if (!this._active) {
			AjxDispatcher.run("ShowMiniCalendar", false);
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

/**
 * creates a new button with a DwtCalendar as its menu
 * @document 					the DOM document
 * @parent						parent this DwtButton gets appended to
 * @buttonId 					buttonId to fetch inside DOM and append DwtButton to
 * @dateButtonListener			AjxListener to call when date button is pressed
 * @dateCalSelectionListener	AjxListener to call when date is selected in DwtCalendar
 * @isInDialog 					true if mini cal is inside a DwtDialog (otherwise z-index will be too low)
*/
ZmCalendarApp.createMiniCalButton =
function(parent, buttonId, dateButtonListener, dateCalSelectionListener, appCtxt, isInDialog) {
	// create button
	var dateButton = new DwtButton(parent, null, "DwtSelect");
	dateButton.addDropDownSelectionListener(dateButtonListener);
	if (AjxEnv.isIE)
		dateButton.setSize("20");

	// create menu for button
	var calMenu = new DwtMenu(dateButton, null, null, null, isInDialog);
	calMenu.setSize("150");
	calMenu._table.width = "100%";
	dateButton.setMenu(calMenu, true);

	// create mini cal for menu for button
	var cal = new DwtCalendar(calMenu);
	cal.setSkipNotifyOnPage(true);
	cal.setFirstDayOfWeek(appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK));
	cal.addSelectionListener(dateCalSelectionListener);
	// add settings change listener on mini cal in case first day of week setting changes
	var listener = new AjxListener(null, ZmCalendarApp._settingsChangeListener, cal);
	appCtxt.getSettings().getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK).addChangeListener(listener);

	// reparent and cleanup
	dateButton.reparentHtmlElement(buttonId);
	delete buttonId;

	return dateButton;
};

ZmCalendarApp._settingsChangeListener =
function(cal, ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var setting = ev.source;
	if (setting.id == ZmSetting.CAL_FIRST_DAY_OF_WEEK)
		cal.setFirstDayOfWeek(setting.getValue());
};
