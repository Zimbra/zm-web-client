/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

/**
 * Creates the filter rules view.
 * @class
 * This class represents the filters tab view in preferences application.
 * 
 * @param	{DwtComposite}	parent		the parent widget
 * @param	{ZmController}	controller	the controller
 *
 * @extends		DwtTabViewPage
 * 
 * @see		ZmPreferencesApp
 */
ZmFilterRulesView = function(parent, controller) {

	DwtTabViewPage.call(this, parent, "ZmPreferencesPage ZmFilterRulesView");

	this._controller = controller;
	this._prefsController = AjxDispatcher.run("GetPrefController");

	this._rules = AjxDispatcher.run("GetFilterRules");

	var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
	this._title = [ZmMsg.zimbraTitle, controller.getApp().getDisplayName(), section && section.title].join(": ");

	this._rendered = false;

	this._tabGroup = new DwtTabGroup(this._htmlElId);
};

ZmFilterRulesView.prototype = new DwtTabViewPage;
ZmFilterRulesView.prototype.constructor = ZmFilterRulesView;

ZmFilterRulesView.prototype.toString =
function() {
	return "ZmFilterRulesView";
};

ZmFilterRulesView.prototype.showMe =
function() {
	Dwt.setTitle(this._title);
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
	this._prefsController._resetOperations(this._prefsController._toolbar, section && section.id);
	if (this.hasRendered) { return; }

	// create the html
	var data = {id:this._htmlElId};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#MailFilters", data);

	// create toolbar
	var toolbarEl = document.getElementById(data.id + "_toolbar");
	if (toolbarEl) {
		var buttons = this._controller.getToolbarButtons();
		this._toolbar = new ZmButtonToolBar({parent:this, buttons:buttons, posStyle:Dwt.STATIC_STYLE,
											 context:ZmId.VIEW_FILTER_RULES});
		this._toolbar.replaceElement(toolbarEl);
		this._tabGroup.addMember(this._toolbar);
	}

	// create list view
	var listViewEl = document.getElementById(data.id + "_list");
	if (listViewEl) {
		this._listView = new ZmFilterListView(this, this._controller);
		this._listView.replaceElement(listViewEl);
		this._tabGroup.addMember(this._listView);
	}

	// initialize controller
	this._controller.initialize(this._toolbar, this._listView);

	this.hasRendered = true;
};

/**
 * Gets the title.
 * 
 * @return	{String}	the title
 */
ZmFilterRulesView.prototype.getTitle =
function() {
	return this._title;
};

/**
 * Gets the toolbar.
 * 
 * @return	{ZmButtonToolBar}		the toolbar
 */
ZmFilterRulesView.prototype.getToolbar =
function() {
	return this._toolbar;
};

/**
 * Gets the list view.
 * 
 * @return	{DwtListView}	the list view
 */
ZmFilterRulesView.prototype.getListView =
function() {
	return this._listView;
};

/**
 * Gets the tab group.
 * 
 * @return	{DwtTabGroup}		the tab group
 */
ZmFilterRulesView.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

// View is always in sync with rules
ZmFilterRulesView.prototype.reset = function() {};

ZmFilterRulesView.prototype.resetOnAccountChange =
function() {
	this.hasRendered = false;
};

/**
 * Creates the filter list view.
 * @class
 * This class represents the filter list view.
 *
 * @param	{DwtComposite}	parent		the parent widget
 * @param	{ZmController}	controller	the controller
 * 
 * @extends		DwtListView
 * 
 * @private
 */
ZmFilterListView = function(parent, controller) {
	var headerList = this._getHeaderList();
	DwtListView.call(this, {parent:parent, className:"ZmFilterListView", headerList:headerList,
							view:ZmId.VIEW_FILTER_RULES});

	this._rules = AjxDispatcher.run("GetFilterRules");

	this._controller = controller;
	this._rules.addChangeListener(new AjxListener(this, this._changeListener));
	this._internalId = AjxCore.assignId(this);
};

ZmFilterListView.COL_ACTIVE	= "ac";
ZmFilterListView.COL_NAME	= "na";

ZmFilterListView.prototype = new DwtListView;
ZmFilterListView.prototype.constructor = ZmFilterListView;

ZmFilterListView.prototype.toString =
function() {
	return "ZmFilterListView";
};

/**
 * Only show rules that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
 *
 * @param list
 * 
 * @private
 */
ZmFilterListView.prototype.set =
function(list) {
	this._checkboxIds = [];
	var list1 = new AjxVector();
	var len = list.size();
	for (var i = 0; i < len; i++) {
		var rule = list.get(i);
		if (rule.hasValidAction()) {
			list1.add(rule);
		}
	}
	DwtListView.prototype.set.call(this, list1);
};

ZmFilterListView.prototype._getHeaderList =
function() {
	return [
		(new DwtListHeaderItem({field:ZmFilterListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
		(new DwtListHeaderItem({field:ZmFilterListView.COL_NAME, text:ZmMsg.filterName}))
	];
};

ZmFilterListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmFilterListView.COL_ACTIVE) {
		html[idx++] = "<input type='checkbox' ";
		html[idx++] = item.active ? "checked " : "";
		html[idx++] = "id='_ruleCheckbox";
		html[idx++] = item.id;
		html[idx++] = "' _flvId='";
		html[idx++] = this._internalId;
		html[idx++] = "' onchange='ZmFilterListView._activeStateChange'>";
	} else if (field == ZmFilterListView.COL_NAME) {
		html[idx++] = AjxStringUtil.htmlEncode(item.name);
	}

	return idx;
};

/**
 * In general, we just re-display all the rules when anything changes, rather
 * than trying to update a particular row.
 *
 * @param {DwtEvent}	ev		the event
 * 
 * @private
 */
ZmFilterListView.prototype._changeListener =
function(ev) {
	if (ev.type != ZmEvent.S_FILTER) { return; }

	DBG.println(AjxDebug.DBG3, "FILTER RULES: change listener");
	if (ev.event == ZmEvent.E_MODIFY && !ev.handled) {
		this._controller.resetListView(ev.getDetail("index"));
		ev.handled = true;
	}
};

/**
 * Handles click of 'active' checkbox by toggling the rule's active state.
 *
 * @param {DwtEvent}	ev		the event
 * 
 * @private
 */
ZmFilterListView._activeStateChange =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	var flvId = target.getAttribute("_flvId");
	var flv = AjxCore.objectWithId(flvId);
	var ruleId = target.id.substring(13);
	var rule = flv._rules.getRuleById(ruleId);
	if (rule) {
		flv._rules.setActive(rule, !rule.active);
	}
};

/**
 * Override so that we don't change selection when the 'active' checkbox is clicked.
 * Also contains a hack for IE for handling a click of the 'active' checkbox, because
 * the ONCHANGE handler was only getting invoked on every other checkbox click for IE.
 *
 * @param {Element}	clickedEl	the list DIV that received the click
 * @param {DwtEvent}	ev			the click event
 * @param {constant}	button		the button that was clicked
 * 
 * @private
 */
ZmFilterListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	// We only care about mouse events
	if (!(ev instanceof DwtMouseEvent)) { return true; }

	var target = DwtUiEvent.getTarget(ev);
	var isInput = (target.id.indexOf("_ruleCheckbox") == 0);
	if (isInput) {
		ZmFilterListView._activeStateChange(ev);
	}

	return !isInput;
};
