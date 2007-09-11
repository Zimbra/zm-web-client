/*
 * Package: Calendar
 * 
 * Supports: The Calendar application
 * 
 * Loaded:
 * 	- When the user goes to the Calendar application
 * 	- If the user creates an appointment
 * 	- If the user uses a date object to create an appointment
 * 	- If the user uses a date object to view a certain day
 * 
 * Any user of this package will need to load CalendarCore first.
 */

// for creating and handling invites
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
// base class for ZmApptView
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");

AjxPackage.require("zimbraMail.calendar.view.ZmCalViewMgr");
AjxPackage.require("zimbraMail.calendar.view.ZmCalBaseView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalColView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalDayView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWorkWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalMonthView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalScheduleView");

AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");
