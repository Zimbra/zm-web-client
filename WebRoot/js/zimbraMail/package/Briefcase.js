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
 * Package: Briefcase
 * 
 * Supports: The Briefcase application
 * 
 * Loaded:
 * 	- When the user goes to the Briefcase application
 * 	- When the user creates a new briefcase or uploaded file
 */
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseBaseView");
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseIconView");
AjxPackage.require("zimbraMail.briefcase.view.ZmDetailListView");
AjxPackage.require("zimbraMail.briefcase.view.ZmPreviewPaneView");
AjxPackage.require("zimbraMail.briefcase.view.ZmNewBriefcaseDialog");
AjxPackage.require("zimbraMail.briefcase.view.ZmBriefcaseTreeView");
AjxPackage.require("zimbraMail.briefcase.view.dialog.ZmBriefcaseTabView");
AjxPackage.require("zimbraMail.briefcase.view.dialog.ZmCheckinDialog");
AjxPackage.require("zimbraMail.briefcase.controller.ZmBriefcaseController");
AjxPackage.require("zimbraMail.briefcase.controller.ZmBriefcaseTreeController");
AjxPackage.require("ajax.util.AjxPluginDetector");