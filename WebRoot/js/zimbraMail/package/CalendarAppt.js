/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
AjxPackage.require("zimbraMail.calendar.view.ZmFreeBusySchedulerView");
AjxPackage.require("zimbraMail.calendar.view.ZmNewCalendarDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmExternalCalendarDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptAssistantView");
AjxPackage.require("zimbraMail.calendar.view.ZmScheduleAssistantView");
AjxPackage.require("zimbraMail.calendar.view.ZmLocationAssistantView");
AjxPackage.require("zimbraMail.calendar.view.ZmSuggestionsView");
AjxPackage.require("zimbraMail.calendar.view.ZmTimeSuggestionView");
AjxPackage.require("zimbraMail.calendar.view.ZmLocationSuggestionView");
AjxPackage.require("zimbraMail.calendar.view.ZmTimeSuggestionPrefDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmResolveLocationConflictDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmResolveLocationView");
AjxPackage.require("zimbraMail.calendar.view.ZmAttendeePicker");
AjxPackage.require("zimbraMail.calendar.view.ZmMiniCalendar");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmApptComposeController");
AjxPackage.require("zimbraMail.calendar.controller.ZmApptController");
