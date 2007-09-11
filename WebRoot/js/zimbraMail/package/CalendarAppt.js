/*
 * Package: CalendarAppt
 * 
 * Supports: The Calendar application
 * 
 * Loaded:
 * 	- When the user creates/edits an appointment
 * 	- If the user uses a date object to create an appointment
 * 
 * Any user of this package will need to load CalendarCore first.
 */

// for creating and handling invites

AjxPackage.require("zimbraMail.calendar.view.ZmApptRecurDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemEditView");

AjxPackage.require("zimbraMail.calendar.view.ZmCalItemTypeDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptComposeView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptEditView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptNotifyDialog");

AjxPackage.require("zimbraMail.calendar.view.ZmApptQuickAddDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmSchedTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmApptChooserTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmNewCalendarDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmAppointmentAssistant");
AjxPackage.require("zimbraMail.calendar.view.ZmCalendarAssistant");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmApptComposeController");
