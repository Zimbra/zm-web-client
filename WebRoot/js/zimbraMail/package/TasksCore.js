/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010 Zimbra, Inc.
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
 * Package: TasksCore
 * 
 * Supports: Creation of a tasks folder
 * 
 * Loaded:
 *  - If a task folder arrives in a <refresh> block
 *  - If a search for tasks returns results
 */
AjxPackage.require("zimbraMail.calendar.model.ZmCalItem");

AjxPackage.require("zimbraMail.tasks.model.ZmTaskFolder");
AjxPackage.require("zimbraMail.tasks.model.ZmTask");

AjxPackage.require("zimbraMail.tasks.controller.ZmTaskListController");

AjxPackage.require("zimbraMail.tasks.view.ZmTaskListView");
AjxPackage.require("zimbraMail.tasks.view.ZmTaskMultiView");
