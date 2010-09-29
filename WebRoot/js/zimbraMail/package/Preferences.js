/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Package: Preferences
 * 
 * Supports: The Options (preferences) application
 * 
 * Loaded:
 * 	- When the user goes to the Options application
 * 	- When the user creates a filter rule from message headers
 */
AjxPackage.require("zimbraMail.prefs.model.ZmFilterRule");
AjxPackage.require("zimbraMail.prefs.model.ZmFilterRules");
AjxPackage.require("zimbraMail.prefs.model.ZmLocale");
AjxPackage.require("zimbraMail.prefs.model.ZmMobileDevice");

AjxPackage.require("zimbraMail.mail.model.ZmIdentity");
AjxPackage.require("zimbraMail.mail.model.ZmIdentityCollection");
AjxPackage.require("zimbraMail.mail.model.ZmDataSource");
AjxPackage.require("zimbraMail.mail.model.ZmDataSourceCollection");
AjxPackage.require("zimbraMail.mail.model.ZmPopAccount");
AjxPackage.require("zimbraMail.mail.model.ZmImapAccount");
AjxPackage.require("zimbraMail.mail.model.ZmSignature");
AjxPackage.require("zimbraMail.mail.model.ZmSignatureCollection");

AjxPackage.require("zimbraMail.prefs.view.ZmPreferencesPage");
AjxPackage.require("zimbraMail.prefs.view.ZmShortcutsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmPrefView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRulesView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRuleDialog");
AjxPackage.require("zimbraMail.prefs.view.ZmZimletsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmMobileDevicesPage");
AjxPackage.require("zimbraMail.prefs.view.ZmSharingPage");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterPage");

AjxPackage.require("zimbraMail.calendar.view.ZmCalendarPrefsPage");

AjxPackage.require("zimbraMail.mail.view.prefs.ZmAccountsPage");
AjxPackage.require("zimbraMail.mail.view.prefs.ZmAccountTestDialog");
AjxPackage.require("zimbraMail.mail.view.prefs.ZmMailPrefsPage");
AjxPackage.require("zimbraMail.mail.view.prefs.ZmSignaturesPage");

AjxPackage.require("zimbraMail.im.view.prefs.ZmImGatewayControl");

AjxPackage.require("zimbraMail.prefs.controller.ZmPrefController");
AjxPackage.require("zimbraMail.prefs.controller.ZmFilterController");
AjxPackage.require("zimbraMail.prefs.controller.ZmFilterRulesController");
AjxPackage.require("zimbraMail.prefs.controller.ZmMobileDevicesController");
