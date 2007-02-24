/*
 * Package: CalendarCore
 * 
 * Supports: Minimal calendar functionality
 * 
 * Loaded:
 * 	- To display mini-calendar
 * 	- For reminders refresh
 * 	- If search for resources returns data
 */

// base classes for ZmResource and ZmResourceList
AjxPackage.require("zimbraMail.abook.model.ZmContact");
AjxPackage.require("zimbraMail.abook.model.ZmContactList");

AjxPackage.require("zimbraMail.calendar.model.ZmCalendar");
AjxPackage.require("zimbraMail.calendar.model.ZmRecurrence");
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");
AjxPackage.require("zimbraMail.calendar.model.ZmAppt");
AjxPackage.require("zimbraMail.calendar.model.ZmApptList");
AjxPackage.require("zimbraMail.calendar.model.ZmApptCache");
AjxPackage.require("zimbraMail.calendar.model.ZmResource");
AjxPackage.require("zimbraMail.calendar.model.ZmResourceList");
AjxPackage.require("zimbraMail.calendar.view.ZmApptViewHelper");
AjxPackage.require("zimbraMail.calendar.view.ZmReminderDialog");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalViewController");
AjxPackage.require("zimbraMail.calendar.controller.ZmReminderController");
