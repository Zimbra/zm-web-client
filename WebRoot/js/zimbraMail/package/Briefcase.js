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
 * Package: Briefcase
 * 
 * Supports: The Briefcase application
 * 
 * Loaded:
 * 	- When the user goes to the Briefcase application
 * 	- When the user creates a new briefcase or uploaded file
 */
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseBaseView");
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseView");
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseIconView");
AjxPackage.require("zimbraMail.briefcase.view.ZmDetailListView");
AjxPackage.require("zimbraMail.briefcase.view.ZmPreviewPaneView");
AjxPackage.require("zimbraMail.briefcase.view.ZmColListView");
AjxPackage.require("zimbraMail.briefcase.view.ZmMultiColView");
AjxPackage.require("zimbraMail.briefcase.view.ZmNewBriefcaseDialog");
AjxPackage.require("zimbraMail.briefcase.view.dialog.ZmBriefcaseTabView");
AjxPackage.require("zimbraMail.briefcase.view.dialog.ZmCheckinDialog");
AjxPackage.require("zimbraMail.briefcase.view.dialog.ZmRevisionDialog");
AjxPackage.require("zimbraMail.briefcase.controller.ZmBriefcaseController");
AjxPackage.require("zimbraMail.briefcase.controller.ZmBriefcaseTreeController");
