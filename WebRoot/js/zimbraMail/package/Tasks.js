/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * Package: Tasks
 * 
 * Supports: The Tasks application
 * 
 * Loaded: When the user goes to the Tasks application
 */

// base class for ZmApptView
AjxPackage.require("zimbraMail.mail.view.ZmMailMsgView");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalItemComposeController");

AjxPackage.require("zimbraMail.calendar.model.ZmRecurrence");
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");

AjxPackage.require("zimbraMail.calendar.view.ZmApptRecurDialog");
AjxPackage.require("zimbraMail.calendar.view.ZmApptViewHelper");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemEditView");
AjxPackage.require("zimbraMail.calendar.view.ZmCalItemView");

AjxPackage.require("zimbraMail.calendar.controller.ZmCalendarTreeController");


AjxPackage.require("zimbraMail.tasks.view.ZmTaskView");
AjxPackage.require("zimbraMail.tasks.view.ZmTaskMultiView");
AjxPackage.require("zimbraMail.tasks.view.ZmTaskEditView");
AjxPackage.require("zimbraMail.tasks.view.ZmNewTaskFolderDialog");

AjxPackage.require("zimbraMail.tasks.controller.ZmTaskController");
AjxPackage.require("zimbraMail.tasks.controller.ZmTaskTreeController");
