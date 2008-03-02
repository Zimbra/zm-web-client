/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
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

ZmCalendarApp = function(container) {

	ZmApp.call(this, ZmApp.CALENDAR, container);

	var settings = appCtxt.getSettings();
	var listener = new AjxListener(this, this._settingChangeListener);
	settings.getSetting(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL).addChangeListener(listener);
	settings.getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK).addChangeListener(listener);
};

// Organizer and item-related constants
ZmEvent.S_APPT				= "APPT";
ZmEvent.S_RESOURCE			= "RESOURCE";
ZmItem.APPT					= ZmEvent.S_APPT;
ZmItem.RESOURCE				= ZmEvent.S_RESOURCE;
ZmOrganizer.CALENDAR		= "CALENDAR";

// App-related constants
ZmApp.CALENDAR							= "Calendar";
ZmApp.CLASS[ZmApp.CALENDAR]				= "ZmCalendarApp";
ZmApp.SETTING[ZmApp.CALENDAR]			= ZmSetting.CALENDAR_ENABLED;
ZmApp.UPSELL_SETTING[ZmApp.CALENDAR]	= ZmSetting.CALENDAR_UPSELL_ENABLED;
ZmApp.LOAD_SORT[ZmApp.CALENDAR]			= 40;
ZmApp.QS_ARG[ZmApp.CALENDAR]			= "calendar";

// ms to wait before fetching reminders
ZmCalendarApp.REMINDER_START_DELAY = 10000;
ZmCalendarApp.MINICAL_DELAY = 5000;

ZmCalendarApp.COLORS = [];
// these need to match CSS rules
ZmCalendarApp.COLORS[ZmOrganizer.C_ORANGE]	= "Orange";
ZmCalendarApp.COLORS[ZmOrganizer.C_BLUE]	= "Blue";
ZmCalendarApp.COLORS[ZmOrganizer.C_CYAN]	= "Cyan";
ZmCalendarApp.COLORS[ZmOrganizer.C_GREEN]	= "Green";
ZmCalendarApp.COLORS[ZmOrganizer.C_PURPLE]	= "Purple";
ZmCalendarApp.COLORS[ZmOrganizer.C_RED]		= "Red";
ZmCalendarApp.COLORS[ZmOrganizer.C_YELLOW]	= "Yellow";
ZmCalendarApp.COLORS[ZmOrganizer.C_PINK]	= "Pink";
ZmCalendarApp.COLORS[ZmOrganizer.C_GRAY]	= "Gray";

ZmCalendarApp.CUTYPE_INDIVIDUAL			= "IND";
ZmCalendarApp.CUTYPE_GROUP				= "GRO";
ZmCalendarApp.CUTYPE_RESOURCE			= "RES";
ZmCalendarApp.CUTYPE_ROOM				= "ROO";
ZmCalendarApp.CUTYPE_UNKNOWN			= "UNK";

ZmCalendarApp.STATUS_CANC				= "CANC";		// vevent, vtodo
ZmCalendarApp.STATUS_COMP				= "COMP";		// vtodo
ZmCalendarApp.STATUS_CONF				= "CONF";		// vevent
ZmCalendarApp.STATUS_DEFR				= "DEFERRED";	// vtodo					[outlook]
ZmCalendarApp.STATUS_INPR				= "INPR";		// vtodo
ZmCalendarApp.STATUS_NEED				= "NEED";		// vtodo
ZmCalendarApp.STATUS_TENT				= "TENT";		// vevent
ZmCalendarApp.STATUS_WAIT				= "WAITING";	// vtodo					[outlook]

ZmCalendarApp.prototype = new ZmApp;
ZmCalendarApp.prototype.constructor = ZmCalendarApp;

ZmCalendarApp.prototype.toString = 
function() {
	return "ZmCalendarApp";
};

// Construction

ZmCalendarApp.prototype._defineAPI =
function() {
	AjxDispatcher.setPackageLoadFunction("CalendarCore", new AjxCallback(this, this._postLoadCore));
	AjxDispatcher.setPackageLoadFunction("Calendar", new AjxCallback(this, this._postLoad, ZmOrganizer.CALENDAR));
	AjxDispatcher.setPackageLoadFunction("CalendarAppt", new AjxCallback(this, this._postLoadAppt, ZmOrganizer.CALENDAR));		
	AjxDispatcher.registerMethod("GetCalController", "CalendarCore", new AjxCallback(this, this.getCalController));
	AjxDispatcher.registerMethod("GetReminderController", "CalendarCore", new AjxCallback(this, this.getReminderController));
	AjxDispatcher.registerMethod("ShowMiniCalendar", "CalendarCore", new AjxCallback(this, this.showMiniCalendar));
	AjxDispatcher.registerMethod("GetApptComposeController", ["CalendarCore", "Calendar", "CalendarAppt"], new AjxCallback(this, this.getApptComposeController));
};

ZmCalendarApp.prototype._registerSettings =
function(settings) {
	var settings = settings || appCtxt.getSettings();
	settings.registerSetting("CAL_ALWAYS_SHOW_MINI_CAL",	{name: "zimbraPrefCalendarAlwaysShowMiniCal", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("CAL_EXPORT",					{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("CAL_FIRST_DAY_OF_WEEK",		{name: "zimbraPrefCalendarFirstDayOfWeek", type: ZmSetting.T_PREF, dataType: ZmSetting.D_INT, defaultValue: 0});
	settings.registerSetting("CAL_IMPORT",					{type: ZmSetting.T_PREF, dataType: ZmSetting.D_NONE});
	settings.registerSetting("CAL_REMINDER_WARNING_TIME",	{name: "zimbraPrefCalendarApptReminderWarningTime", type: ZmSetting.T_PREF, dataType: ZmSetting.D_INT, defaultValue: 0});
	settings.registerSetting("CAL_SHOW_TIMEZONE",			{name: "zimbraPrefUseTimeZoneListInCalendar", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: false});
	settings.registerSetting("CAL_USE_QUICK_ADD",			{name: "zimbraPrefCalendarUseQuickAdd", type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
	settings.registerSetting("CALENDAR_INITIAL_VIEW",		{name: "zimbraPrefCalendarInitialView", type: ZmSetting.T_PREF, defaultValue: ZmSetting.CAL_DAY});
	settings.registerSetting("DEFAULT_CALENDAR_TIMEZONE",	{name: "zimbraPrefTimeZoneId", type: ZmSetting.T_PREF});
	settings.registerSetting("DELETE_INVITE_ON_REPLY",      {name: "zimbraPrefDeleteInviteOnReply",type: ZmSetting.T_PREF, dataType: ZmSetting.D_BOOLEAN, defaultValue: true});
};

ZmCalendarApp.prototype._registerPrefs =
function() {
    var sections = {
        CALENDAR: {
            title: ZmMsg.calendar,
            templateId: "prefs.Pages#Calendar",
            priority: 80,
            precondition: ZmSetting.CALENDAR_ENABLED,
            prefs: [
                ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL,
                ZmSetting.CAL_EXPORT,
                ZmSetting.CAL_FIRST_DAY_OF_WEEK,
                ZmSetting.CAL_IMPORT,
                ZmSetting.CAL_REMINDER_WARNING_TIME,
                ZmSetting.CAL_SHOW_TIMEZONE,
                ZmSetting.CAL_USE_QUICK_ADD,
                ZmSetting.CALENDAR_INITIAL_VIEW,
                ZmSetting.DELETE_INVITE_ON_REPLY
            ]
        }
    };
    for (var id in sections) {
        ZmPref.registerPrefSection(id, sections[id]);
    }

    ZmPref.registerPref("CAL_ALWAYS_SHOW_MINI_CAL", {
	 	displayName:		ZmMsg.alwaysShowMiniCal,
	 	displayContainer:	ZmPref.TYPE_CHECKBOX
	});
	
	ZmPref.registerPref("CAL_EXPORT", {
		displayName:		ZmMsg.exportToICS,
		displayContainer:	ZmPref.TYPE_EXPORT,
		displaySeparator:	true
	});

	ZmPref.registerPref("CAL_FIRST_DAY_OF_WEEK", {
	 	displayName:		ZmMsg.calendarFirstDayOfWeek,
	 	displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		AjxDateUtil.WEEKDAY_LONG,
		options:			[0,1,2,3,4,5,6]
	});

	ZmPref.registerPref("CAL_IMPORT", {
		displayName:		ZmMsg.importFromICS,
		displayContainer:	ZmPref.TYPE_IMPORT
	});

	ZmPref.registerPref("CAL_REMINDER_WARNING_TIME", {
		displayName:		ZmMsg.numberOfMinutes,
		displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.apptRemindNever, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore, ZmMsg.apptRemindNMinutesBefore],
		options:			[0, 1, 5, 10, 15, 30, 45, 60],
		displaySeparator:	true
	});
	
	ZmPref.registerPref("CAL_SHOW_TIMEZONE", {
	 	displayName:		ZmMsg.shouldShowTimezone,
	 	displayContainer:	ZmPref.TYPE_CHECKBOX
	 });
	
	ZmPref.registerPref("CAL_USE_QUICK_ADD", {
	 	displayName:		ZmMsg.useQuickAdd,
	 	displayContainer:	ZmPref.TYPE_CHECKBOX
	 });
	
	ZmPref.registerPref("CALENDAR_INITIAL_VIEW", {
	 	displayName:		ZmMsg.calendarInitialView,
	 	displayContainer:	ZmPref.TYPE_SELECT,
		displayOptions:		[ZmMsg.calViewDay, ZmMsg.calViewWorkWeek, ZmMsg.calViewWeek, ZmMsg.calViewMonth, ZmMsg.calViewSchedule],
		options:			[ZmSetting.CAL_DAY, ZmSetting.CAL_WORK_WEEK, ZmSetting.CAL_WEEK, ZmSetting.CAL_MONTH, ZmSetting.CAL_SCHEDULE]
	});
	
	ZmPref.registerPref("DELETE_INVITE_ON_REPLY",{
		displayName: ZmMsg.deleteInviteOnReply,
		displayContainer:	ZmPref.TYPE_CHECKBOX
	});
};

ZmCalendarApp.prototype._registerOperations =
function() {
	ZmOperation.registerOp("CAL_REFRESH", {textKey:"refresh", tooltipKey:"calRefreshTooltip", image:"Refresh"});
	ZmOperation.registerOp("CAL_VIEW_MENU", {textKey:"view", image:"Appointment"}, null,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmCalendarApp.addCalViewMenu, parent);
	}));
	ZmOperation.registerOp("DAY_VIEW", {textKey:"viewDay", tooltipKey:"viewDayTooltip", image:"DayView"});
	ZmOperation.registerOp("EDIT_REPLY_ACCEPT", {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp("EDIT_REPLY_CANCEL");
	ZmOperation.registerOp("EDIT_REPLY_TENTATIVE", {textKey:"replyTentative", image:"QuestionMark"});
	ZmOperation.registerOp("EDIT_REPLY_DECLINE", {textKey:"replyDecline", image:"Cancel"});
	ZmOperation.registerOp("INVITE_REPLY_ACCEPT", {textKey:"editReply", image:"Check"});
	ZmOperation.registerOp("INVITE_REPLY_DECLINE", {textKey:"editReply", image:"Cancel"});
	ZmOperation.registerOp("INVITE_REPLY_MENU", {textKey:"editReply", image:"Reply"}, ZmSetting.MAIL_ENABLED,
		AjxCallback.simpleClosure(function(parent) {
			ZmOperation.addDeferredMenu(ZmCalendarApp.addInviteReplyMenu, parent);
	}));
	ZmOperation.registerOp("INVITE_REPLY_TENTATIVE", {textKey:"editReply", image:"QuestionMark"});
	ZmOperation.registerOp("MONTH_VIEW", {textKey:"viewMonth", tooltipKey:"viewMonthTooltip", image:"MonthView"});
	ZmOperation.registerOp("MOUNT_CALENDAR", {textKey:"mountCalendar", image:"GroupSchedule"});
	ZmOperation.registerOp("NEW_ALLDAY_APPT", {textKey:"newAllDayAppt", tooltipKey:"newAllDayApptTooltip", image:"NewAppointment"});
	ZmOperation.registerOp("NEW_APPT", {textKey:"newAppt", tooltipKey:"newApptTooltip", image:"NewAppointment"});
	ZmOperation.registerOp("NEW_CALENDAR", {textKey:"newCalendar", image:"NewAppointment"});
	ZmOperation.registerOp("REPLY_ACCEPT", {textKey:"replyAccept", image:"Check"});
	ZmOperation.registerOp("REPLY_CANCEL");
	ZmOperation.registerOp("REPLY_DECLINE", {textKey:"replyDecline", image:"Cancel"});
	ZmOperation.registerOp("REPLY_MODIFY");
	ZmOperation.registerOp("REPLY_NEW_TIME", {textKey:"replyNewTime", image:"NewTime"});
	ZmOperation.registerOp("REPLY_TENTATIVE", {textKey:"replyTentative", image:"QuestionMark"});
	ZmOperation.registerOp("SCHEDULE_VIEW", {textKey:"viewSchedule", tooltipKey:"viewScheduleTooltip", image:"GroupSchedule"});
	ZmOperation.registerOp("SEARCH_MAIL", {textKey:"searchMail", image:"SearchMail"}, ZmSetting.MAIL_ENABLED);
	ZmOperation.registerOp("SHARE_CALENDAR", {textKey:"shareCalendar", image:"CalendarFolder"}, ZmSetting.SHARING_ENABLED);
	ZmOperation.registerOp("TODAY", {textKey:"today", tooltipKey:"todayTooltip", image:"Date"});
	ZmOperation.registerOp("VIEW_APPOINTMENT", {textKey:"viewAppointment", image:"Appointment"});
	ZmOperation.registerOp("VIEW_APPT_INSTANCE", {textKey:"apptInstance", image:"Appointment"});
	ZmOperation.registerOp("VIEW_APPT_SERIES", {textKey:"apptSeries", image:"Appointment"});
	ZmOperation.registerOp("WEEK_VIEW", {textKey:"viewWeek", tooltipKey:"viewWeekTooltip", image:"WeekView"});
	ZmOperation.registerOp("WORK_WEEK_VIEW", {textKey:"viewWorkWeek", tooltipKey:"viewWorkWeekTooltip", image:"WorkWeekView"});
};

ZmCalendarApp.prototype._registerItems =
function() {
	ZmItem.registerItem(ZmItem.APPT,
						{app:			ZmApp.CALENDAR,
						 nameKey:		"appointment",
						 icon:			"Appointment",
						 soapCmd:		"ItemAction",
						 itemClass:		"ZmAppt",
						 node:			"appt",
						 organizer:		ZmOrganizer.CALENDAR,
						 dropTargets:	[ZmOrganizer.TAG, ZmOrganizer.CALENDAR],
						 searchType:	"appointment",
						 resultsList:
	   AjxCallback.simpleClosure(function(search) {
		   AjxDispatcher.require("CalendarCore");
		   return new ZmApptList(ZmItem.APPT, search);
	   }, this)
						});

	ZmItem.registerItem(ZmItem.RESOURCE,
						{app:			ZmApp.CALENDAR,
						 itemClass:		"ZmResource",
						 node:			"calResource",
						 resultsList:
		AjxCallback.simpleClosure(function(search) {
			AjxDispatcher.require("CalendarCore");
			return new ZmResourceList(null, search);
		}, this)
						});
};

ZmCalendarApp.prototype._registerOrganizers =
function() {
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
							 itemsKey:			"appointments",
							 hasColor:			true,
							 treeType:			ZmOrganizer.FOLDER,
							 views:				["appointment"],
							 folderKey:			"calendarFolder",
							 mountKey:			"mountCalendar",
							 createFunc:		"ZmCalendar.create",
							 compareFunc:		"ZmCalendar.sortCompare",
							 deferrable:		true,
							 pathInName:		true
							});
};

ZmCalendarApp.prototype._setupSearchToolbar =
function() {
	ZmSearchToolBar.addMenuItem(ZmItem.APPT,
								{msgKey:		"appointments",
								 tooltipKey:	"searchAppts",
								 icon:			"Appointment",
								 shareIcon:		"SharedCalendarFolder",
								 setting:		ZmSetting.CALENDAR_ENABLED
								});
};

ZmCalendarApp.prototype._setupCurrentAppToolbar =
function() {
	ZmCurrentAppToolBar.registerApp(this.getName(), ZmOperation.NEW_CALENDAR, ZmOrganizer.CALENDAR);
};

ZmCalendarApp.prototype._registerApp =
function() {
	var newItemOps = {};
	newItemOps[ZmOperation.NEW_APPT] = "appointment";

	var newOrgOps = {};
	newOrgOps[ZmOperation.NEW_CALENDAR] = "calendar";

	var actionCodes = {};
	actionCodes[ZmKeyMap.NEW_APPT]		= ZmOperation.NEW_APPT;
	actionCodes[ZmKeyMap.NEW_CALENDAR]	= ZmOperation.NEW_CALENDAR;

	ZmApp.registerApp(ZmApp.CALENDAR,
							 {mainPkg:				"Calendar",
							  nameKey:				"calendar",
							  icon:					"CalendarApp",
							  chooserTooltipKey:	"goToCalendar",
							  viewTooltipKey:		"displayCalendar",
							  defaultSearch:		ZmItem.APPT,
							  organizer:			ZmOrganizer.CALENDAR,
							  overviewTrees:		[ZmOrganizer.CALENDAR, ZmOrganizer.SEARCH, ZmOrganizer.TAG],
							  showZimlets:			true,
							  assistants:			{"ZmAppointmentAssistant":	["CalendarCore", "Calendar", "CalendarAppt"],
							  						 "ZmCalendarAssistant":		["CalendarCore", "Calendar", "CalendarAppt"]},
							  newItemOps:			newItemOps,
							  newOrgOps:			newOrgOps,
							  actionCodes:			actionCodes,
							  searchTypes:			[ZmItem.APPT],
							  gotoActionCode:		ZmKeyMap.GOTO_CALENDAR,
							  newActionCode:		ZmKeyMap.NEW_APPT,
							  chooserSort:			30,
							  defaultSort:			20,
							  upsellUrl:			ZmSetting.CALENDAR_UPSELL_URL,
							  supportsMultiMbox:	true
							  });
};

// App API

ZmCalendarApp.prototype.startup =
function(result) {
	if (appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL)) {
		var miniCalAction = new AjxTimedAction(this, function() {
				AjxDispatcher.run("GetCalController")._refreshReminder = true;
				AjxDispatcher.run("ShowMiniCalendar", true);
			});
		AjxTimedAction.scheduleAction(miniCalAction, ZmCalendarApp.MINICAL_DELAY);
	}else {
		var refreshAction = new AjxTimedAction(this, function() {
				AjxDispatcher.run("GetReminderController").refresh(true);
			});
		AjxTimedAction.scheduleAction(refreshAction, ZmCalendarApp.REMINDER_START_DELAY);
	}
};

ZmCalendarApp.prototype.refresh =
function(refresh) {
	if (!appCtxt.inStartup) {
		AjxDispatcher.run("GetCalController").refreshHandler(refresh);
	}
	this._handleRefresh();
};

ZmCalendarApp.prototype.deleteNotify =
function(ids, force) {
	if (!force && this._deferNotifications("delete", ids)) { return; }
	AjxDispatcher.run("GetCalController").notifyDelete(ids);
};

/**
 * Checks for the creation of a calendar or a mount point to one, or an
 * appointment.
 * 
 * @param creates	[hash]		hash of create notifications
 */
ZmCalendarApp.prototype.createNotify =
function(creates, force) {
	if (!creates["folder"] && !creates["appt"] && !creates["link"]) { return; }
	if (!force && !this._noDefer && this._deferNotifications("create", creates)) { return; }
	
	for (var name in creates) {
		var list = creates[name];
		for (var i = 0; i < list.length; i++) {
			var create = list[i];
			if (appCtxt.cacheGet(create.id)) { continue; }
	
			if (name == "folder") {
				this._handleCreateFolder(create, ZmOrganizer.CALENDAR);
			} else if (name == "link") {
				this._handleCreateLink(create, ZmOrganizer.CALENDAR);
			} else if (name == "appt") {
				AjxDispatcher.run("GetCalController").notifyCreate(create);
			}
		}
	}
};

ZmCalendarApp.prototype.modifyNotify =
function(modifies, force) {
	if (!force && !this._noDefer && this._deferNotifications("modify", modifies)) { return; }
	AjxDispatcher.run("GetCalController").notifyModify(modifies);
};

ZmCalendarApp.prototype.postNotify =
function(notify) {
	AjxDispatcher.run("GetCalController").notifyComplete();
};

ZmCalendarApp.prototype.handleOp =
function(op) {
	switch (op) {
		case ZmOperation.NEW_APPT: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewAppt);
			AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
			break;
		}
		case ZmOperation.NEW_CALENDAR: {
			var loadCallback = new AjxCallback(this, this._handleLoadNewCalendar);
			AjxDispatcher.require(["CalendarCore", "Calendar"], false, loadCallback, null, true);
			break;
		}
	}
};

ZmCalendarApp.prototype._handleLoadNewAppt =
function() {
	AjxDispatcher.run("GetCalController").newAppointment(null, null, null, null);
};

ZmCalendarApp.prototype._handleLoadNewCalendar =
function() {
	appCtxt.getAppViewMgr().popView(true, ZmController.LOADING_VIEW);	// pop "Loading..." page
	var dialog = appCtxt.getNewCalendarDialog();
	if (!this._newCalendarCb) {
		this._newCalendarCb = new AjxCallback(this, this._newCalendarCallback);
	}
	ZmController.showDialog(dialog, this._newCalendarCb);
};

// Public methods

ZmCalendarApp.prototype.launch =
function(params, callback) {
	var loadCallback = new AjxCallback(this, this._handleLoadLaunch, [params, callback]);
	AjxDispatcher.require(["CalendarCore", "Calendar"], true, loadCallback, null, true);
};

ZmCalendarApp.prototype._handleLoadLaunch =
function(params, callback) {
	var cc = AjxDispatcher.run("GetCalController");
	var view = cc._defaultView();
	var sd = null;

	params = params || {};
	if (params.checkQS && location) {
		var search = location.search;
		var found = false;
		if (search.match(/\bview=day\b/)) {
			found = true;
			view = ZmController.CAL_DAY_VIEW;
		} else if (search.match(/\bview=workWeek\b/)) {
			found = true;
			view = ZmController.CAL_WORK_WEEK_VIEW;
		} else if (search.match(/\bview=week\b/)) {
			found = true;
			view = ZmController.CAL_WEEK_VIEW;
		} else if (search.match(/\bview=month\b/)) {
			found = true;
			view = ZmController.CAL_MONTH_VIEW;
		}

		if (found) {
			var match = search.match(/\bdate=([^&]+)/)[1];
			var parsed = match ? AjxDateUtil.parseServerDateTime(match) : null;
			if (parsed && !isNaN(parsed))
				sd = new Date((parsed).setHours(0,0,0,0));
		}
	}

	this.initResources();

	cc.show(view, sd);
	if (callback) {
		callback.run();
	}
};

ZmCalendarApp.prototype.showSearchResults =
function(results, callback, isGal, folderId) {
	// calls ZmSearchController's _handleLoadShowResults
	if (callback) {
		callback.run();
	}
};

ZmCalendarApp.prototype.activate =
function(active) {
	ZmApp.prototype.activate.apply(this, arguments);

	var show = active || appCtxt.get(ZmSetting.CAL_ALWAYS_SHOW_MINI_CAL);
	AjxDispatcher.run("ShowMiniCalendar", show);
};

ZmCalendarApp.prototype.showMiniCalendar =
function(show, delay) {
	var mc = AjxDispatcher.run("GetCalController").getMiniCalendar(delay);
	mc.setSkipNotifyOnPage(show && !this._active);
	if (!this._active) {
		mc.setSelectionMode(DwtCalendar.DAY);
	}
	appCtxt.getAppViewMgr().showTreeFooter(show);
};

// common API shared by tasks app
ZmCalendarApp.prototype.getListController =
function() {
	return this.getCalController();
};

ZmCalendarApp.prototype.getCalController =
function() {
	if (!this._calController) {
		AjxDispatcher.require("CalendarCore");
		this._calController = new ZmCalViewController(this._container, this);
	}
	return this._calController;
};

ZmCalendarApp.prototype.getReminderController =
function() {
	if (!this._reminderController) {
		AjxDispatcher.require("CalendarCore");
		this._reminderController = new ZmReminderController(AjxDispatcher.run("GetCalController"));
	}
	return this._reminderController;
};

ZmCalendarApp.prototype.getApptComposeController = 
function() {
	if (!this._apptController) {
		AjxDispatcher.require(["CalendarCore", "Calendar", "CalendarAppt"]);		
		this._apptController = new ZmApptComposeController(this._container, this);
	}
	return this._apptController;
};

ZmCalendarApp.prototype.initResources =
function() {
	if (!this._locations) {
		this._locations = new ZmResourceList(ZmCalItem.LOCATION);
		this._locations.isCanonical = true;
	}

	if (!this._equipment) {
		this._equipment = new ZmResourceList(ZmCalItem.EQUIPMENT);
		this._equipment.isCanonical = true;
	}
}

ZmCalendarApp.prototype.loadResources =
function() {
	this.initResources();

	if (appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var batchCmd = new ZmBatchCommand();
		if (!this._locations.isLoaded) {
			batchCmd.add(new AjxCallback(this._locations, this._locations.load));
		}
		if (!this._equipment.isLoaded) {
			batchCmd.add(new AjxCallback(this._equipment, this._equipment.load));
		}
		if (batchCmd._cmds.length) {
			batchCmd.run();
		}
	}
};

/**
* Returns a ZmResourceList of known locations.
*/
ZmCalendarApp.prototype.getLocations = 
function() {
    this.initResources();
    return this._locations;
};

/**
* Returns a ZmResourceList of known equipment.
*/
ZmCalendarApp.prototype.getEquipment = 
function() {
     this.initResources();
    return this._equipment;
};

ZmCalendarApp.prototype._postLoadAppt =
function(type) {
	this.getApptComposeController().initComposeView(true);
};

ZmCalendarApp.prototype._setMiniCalForActiveAccount =
function() {
	// do nothing since calendar handles mini cal on its own
};

ZmCalendarApp.prototype._activateAccordionItem =
function(accordionItem) {
	ZmApp.prototype._activateAccordionItem.call(this, accordionItem);

	this.getCalController().handleMailboxChange();
};

ZmCalendarApp.prototype._settingChangeListener =
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
		var controller = AjxDispatcher.run("GetCalController");
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
*/
ZmCalendarApp.createMiniCalButton =
function(parent, buttonId, dateButtonListener, dateCalSelectionListener) {
	// create button
	var dateButton = new DwtButton({parent:parent});
	dateButton.addDropDownSelectionListener(dateButtonListener);
	dateButton.setData(Dwt.KEY_ID, buttonId);
	if (AjxEnv.isIE) {
		dateButton.setSize("20");
	}

	// create menu for button
	var calMenu = new DwtMenu({parent:dateButton});
	calMenu.setSize("150");
	calMenu._table.width = "100%";
	dateButton.setMenu(calMenu, true);

	// create mini cal for menu for button
	var cal = new DwtCalendar({parent:calMenu});
	cal.setData(Dwt.KEY_ID, buttonId);
	cal.setSkipNotifyOnPage(true);
	var fdow = appCtxt.get(ZmSetting.CAL_FIRST_DAY_OF_WEEK) || 0;
	cal.setFirstDayOfWeek(fdow);
	cal.addSelectionListener(dateCalSelectionListener);
	// add settings change listener on mini cal in case first day of week setting changes
	// safety check since this is static code (may not have loaded calendar)
	var fdowSetting = appCtxt.getSettings().getSetting(ZmSetting.CAL_FIRST_DAY_OF_WEEK);
	if (fdowSetting) {
		var listener = new AjxListener(null, ZmCalendarApp._settingChangeListener, cal);
		fdowSetting.addChangeListener(listener);
	}
	
	// reparent and cleanup
	dateButton.reparentHtmlElement(buttonId);
	delete buttonId;

	return dateButton;
};

ZmCalendarApp._settingChangeListener =
function(cal, ev) {
	if (ev.type != ZmEvent.S_SETTING) return;

	var setting = ev.source;
	if (setting.id == ZmSetting.CAL_FIRST_DAY_OF_WEEK)
		cal.setFirstDayOfWeek(setting.getValue());
};

ZmCalendarApp.prototype._newCalendarCallback =
function(parent, name, color, url, excludeFb) {
	// REVISIT: Do we really want to close the dialog before we
	//          know if the create succeeds or fails?
	var dialog = appCtxt.getNewCalendarDialog();
	dialog.popdown();

	var oc = appCtxt.getOverviewController();
	oc.getTreeController(ZmOrganizer.CALENDAR)._doCreate(parent, name, color, url, excludeFb);
};

/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmCalendarApp.addInviteReplyMenu =
function(parent) {
	var list = [ZmOperation.EDIT_REPLY_ACCEPT, ZmOperation.EDIT_REPLY_TENTATIVE, ZmOperation.EDIT_REPLY_DECLINE];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};


/**
 * Adds an invite actions submenu for accept/decline/tentative.
 *
 * @param parent		parent widget (a toolbar or action menu)
 */
ZmCalendarApp.addCalViewMenu =
function(parent) {
	var list = [ZmOperation.DAY_VIEW, ZmOperation.WORK_WEEK_VIEW, ZmOperation.WEEK_VIEW, ZmOperation.MONTH_VIEW, ZmOperation.SCHEDULE_VIEW];
	var menu = new ZmActionMenu({parent:parent, menuItems:list});
	parent.setMenu(menu);
	return menu;
};
