/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

AjxPackage.require("zimbraMail.calendar.view.ZmApptListView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalViewMgr");
AjxPackage.require("zimbraMail.calendar.view.ZmCalBaseView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalColView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalDayView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWorkWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalMultiDayView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalWeekView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalMonthView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalScheduleView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalListView");
AjxPackage.require("zimbraMail.calendar.view.ZmApptDeleteNotifyDialog");

AjxPackage.require("zimbraMail.calendar.view.ZmCalPrintDialog");

AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");
