/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2010 Zimbra, Inc.
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
AjxPackage.require("ajax.dwt.events.DwtIdleTimer");

// for creating and handling invites
AjxPackage.require("zimbraMail.mail.model.ZmMimePart");
AjxPackage.require("zimbraMail.mail.model.ZmMailItem");
AjxPackage.require("zimbraMail.mail.model.ZmMailMsg");
AjxPackage.require("zimbraMail.mail.controller.ZmMailListController");
AjxPackage.require("zimbraMail.mail.controller.ZmMsgController");
// base class for ZmApptView
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");

AjxPackage.require("zimbraMail.calendar.view.ZmApptListView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalViewMgr");
AjxPackage.require("zimbraMail.calendar.view.ZmCalBaseView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalColView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalDayView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWorkWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalMonthView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalScheduleView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalListView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptDeleteNotifyDialog");

AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");
