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

AjxPackage.require("zimbraMail.prefs.view.ZmPreferencesPage");
AjxPackage.require("zimbraMail.prefs.view.ZmShortcutsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmAccountsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmMailPrefsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmPrefView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRulesView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRuleDialog");
AjxPackage.require("zimbraMail.prefs.view.ZmSignaturesPage");

AjxPackage.require("zimbraMail.prefs.controller.ZmPrefController");
AjxPackage.require("zimbraMail.prefs.controller.ZmFilterRulesController");
