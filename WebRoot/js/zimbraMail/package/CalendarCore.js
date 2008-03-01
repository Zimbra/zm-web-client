/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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
AjxPackage.require("zimbraMail.calendar.model.ZmMiniCalCache");
AjxPackage.require("zimbraMail.calendar.model.ZmResource");
AjxPackage.require("zimbraMail.calendar.model.ZmResourceList");
AjxPackage.require("zimbraMail.calendar.view.ZmApptViewHelper");
AjxPackage.require("zimbraMail.calendar.view.ZmReminderDialog");
AjxPackage.require("zimbraMail.calendar.controller.ZmCalViewController");
AjxPackage.require("zimbraMail.calendar.controller.ZmReminderController");
