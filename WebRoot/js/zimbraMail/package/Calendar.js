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
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemEditView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemTypeDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptComposeView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptEditView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptNotifyDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptRecurDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptQuickAddDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmSchedTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmApptChooserTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmNewCalendarDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmAppointmentAssistant");
AjxPackage.require("zimbraMail.calendar.view.ZmCalendarAssistant");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmApptComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");
