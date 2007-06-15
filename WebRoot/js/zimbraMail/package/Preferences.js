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

AjxPackage.require("zimbraMail.prefs.view.ZmPrefListView");
AjxPackage.require("zimbraMail.prefs.view.ZmPreferencesPage");
AjxPackage.require("zimbraMail.prefs.view.ZmShortcutsPage");
AjxPackage.require("zimbraMail.prefs.view.ZmPopAccountsView");
AjxPackage.require("zimbraMail.prefs.view.ZmPrefView");
AjxPackage.require("zimbraMail.prefs.view.ZmPrefListView");
AjxPackage.require("zimbraMail.prefs.view.ZmIdentityView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRulesView");
AjxPackage.require("zimbraMail.prefs.view.ZmFilterRuleDialog");

AjxPackage.require("zimbraMail.prefs.controller.ZmPrefController");
AjxPackage.require("zimbraMail.prefs.controller.ZmPrefListController");
AjxPackage.require("zimbraMail.prefs.controller.ZmPopAccountsController");
AjxPackage.require("zimbraMail.prefs.controller.ZmIdentityController");
AjxPackage.require("zimbraMail.prefs.controller.ZmFilterRulesController");
