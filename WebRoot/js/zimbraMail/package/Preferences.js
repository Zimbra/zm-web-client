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
AjxPackage.require("zimbraMail.prefs.view.ZmPrefView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRulesView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRuleDialog");
AjxPackage.require("zimbraMail.prefs.view.ZmSignaturesPage");

AjxPackage.require("zimbraMail.prefs.controller.ZmPrefController");
AjxPackage.require("zimbraMail.prefs.controller.ZmFilterRulesController");
