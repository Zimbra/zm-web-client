/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a new, empty filter rules controller.
 * @class
 * This class represents the filter rules controller. This controller manages
 * the filter rules page, which has a button toolbar and a list view of the rules.
 *
 * @author Conrad Damon
 *
 * @param {DwtShell}		container		the shell
 * @param {ZmPreferencesApp}	prefsApp		the preferences application
 * 
 * @extends		ZmController
 */
ZmFilterController = function(container, prefsApp, prefsView, section, parent) {

	ZmPrefController.call(this, container, prefsApp);

	this._prefsView = prefsView;

	this._parent = parent;
	this._toolbar = parent._toolbar;

	this._filterView = new ZmFilterPage(prefsView, section, this);
	this._incomingFilterRulesController = new ZmFilterRulesController(container, prefsApp, this._filterView, this, false);
	this._outgoingFilterRulesController = new ZmFilterRulesController(container, prefsApp, this._filterView, this, true);
};

ZmFilterController.prototype = new ZmPrefController;
ZmFilterController.prototype.constructor = ZmFilterController;

ZmFilterController.prototype.toString =
function() {
	return "ZmFilterController";
};

/**
 * Gets the filter rules view, which is comprised of a toolbar and a list view.
 * 
 * @return	{ZmFilterRulesView}		the filter rules view
 */
ZmFilterController.prototype.getFilterView =
function() {
	return this._filterView;
};

ZmFilterController.prototype.getIncomingFilterRulesController =
function() {
	return this._incomingFilterRulesController;
};

ZmFilterController.prototype.getOutgoingFilterRulesController =
function() {
	return this._outgoingFilterRulesController;
};
/**
 * Initializes the controller.
 * 
 * @param	{ZmToolBar}	toolbar		the toolbar
 * @param	{ZmListView}	listView		the list view
 */
ZmFilterController.prototype.initialize =
function() {

};

ZmFilterController.prototype._getToolBarOps =
function () {
	return [];
};

ZmFilterController.prototype.hasOutgoingFiltersActive =
function(callback) {
	var rules = this._outgoingFilterRulesController.getRules();
	if (!rules._initialized) {
		rules.loadRules(false, new AjxCallback(this, this._handleLoadFilters, [callback]));
	} else {
		var outgoingActive = rules.getActiveRules().size() > 0;
		if (callback)
			callback.run(outgoingActive);
		return outgoingActive;
	}
};

ZmFilterController.prototype._handleLoadFilters =
function(callback) {
	var outgoingActive = this._outgoingFilterRulesController.getRules().getActiveRules().size() > 0;
	if (callback)
		callback.run(outgoingActive);
	return outgoingActive;
};

ZmFilterController.prototype._stateChangeListener =
function (ev) {
   var index, sel, rules = null;

   var listView = this._incomingFilterRulesController.getListView();
   if (listView) {
       sel = listView.getSelection()[0];
       rules = this._incomingFilterRulesController.getRules();
       index = sel ? rules.getIndexOfRule(sel) : null;
       this._incomingFilterRulesController.resetListView(index);
   }

   var outListView = this._outgoingFilterRulesController.getListView();
   if (outListView) {
       sel = outListView.getSelection()[0];
       rules = this._outgoingFilterRulesController.getRules();
       index = sel ? rules.getIndexOfRule(sel) : null;
       this._outgoingFilterRulesController.resetListView(index);
   }

	ZmPrefController.prototype._stateChangeListener.apply(this, arguments);
};
