/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
AjxPackage.require("zimbraMail.calendar.view.ZmResourceConflictDialog");

AjxPackage.require("zimbraMail.calendar.view.ZmApptQuickAddDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmFreeBusySchedulerView");
AjxPackage.require("zimbraMail.calendar.view.ZmSchedTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmApptChooserTabViewPage");
AjxPackage.require("zimbraMail.calendar.view.ZmNewCalendarDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmAppointmentAssistant");
AjxPackage.require("zimbraMail.calendar.view.ZmCalendarAssistant");
AjxPackage.require("zimbraMail.calendar.view.ZmScheduleAssistantView");
AjxPackage.require("zimbraMail.calendar.view.ZmTimeSuggestionView");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmApptComposeController");
