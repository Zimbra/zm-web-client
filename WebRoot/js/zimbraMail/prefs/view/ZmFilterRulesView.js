/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

	DwtTabViewPage.call(this, parent, "ZmFilterRulesView", Dwt.STATIC_STYLE);

	this._controller = controller;
	this._prefsController = AjxDispatcher.run("GetPrefController");

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
    //TODO: We got to optimize / avoid force-rendering logic for multi-account setup
	if (this.hasRendered && !appCtxt.isOffline) { return; }

	// create the html
	var data = {id:this._htmlElId};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("prefs.Pages#MailFilter", data);

	// create toolbar
	var toolbarEl = Dwt.byId(data.id + "_toolbar");
	if (toolbarEl) {
		var buttons = this._controller.getToolbarButtons();
		this._toolbar = new ZmButtonToolBar({parent:this, buttons:buttons, posStyle:Dwt.STATIC_STYLE,
											 context:ZmId.VIEW_FILTER_RULES});
		this._toolbar.replaceElement(toolbarEl);
		this._tabGroup.addMember(this._toolbar);
		//add `ZAltButton` style to 'Create Filter' toolbar button
		var addFilterBtn = this._toolbar.getButton(ZmOperation.ADD_FILTER_RULE);
		addFilterBtn && addFilterBtn.delClassName('ZToolbarButton','ZButton ZAltButton'); //to look-it like ZButton
	}

	// create list view
	var listViewEl = Dwt.byId(data.id + "_list");
	this._listView = new ZmFilterListView(this, this._controller);
	this._listView.reparentHtmlElement(listViewEl);
	this._listView.addSelectionListener(new AjxListener(this, this._listItemSelectionListener));
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
 * `ZmFilterListView` selection listener
 * 
 * @param  {DwtEvent}  ev  an event object
 */
ZmFilterRulesView.prototype._listItemSelectionListener = function(ev) {
	var selection = this._listView.getSelection();
	if (ev && ev.target && this._listView.moveUpButtons[ev.target.id]) {
		//move-up button is clicked
		this._controller._moveUpListener(ev);
	} else if (ev && ev.target && this._listView.moveDownButtons[ev.target.id]) {
		//move-down button is clicked
		this._controller._moveDownListener(ev);
	} else if (ev && ev.target && this._listView.editButtons[ev.target.id]) {
		//edit button is clicked
		this._controller._editListener(ev);
	} else if (ev && ev.target && this._listView.delButtons[ev.target.id]) {
		//delete button has been clicked
		this._controller._removeListener(ev);
	} else if (ev && ev.target && this._listView.runButtons[ev.target.id]) {
		//run -filter button is clicked
		this._controller._runListener(ev);
	} else if (ev && ev.target && this._listView.toggleStateButtons[ev.target.id]) {
		//toggle state checkbox is clicked
		this._controller._toggleStateListener(ev, ev.target && !ev.target.checked);
	} else if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._controller._editListener(ev);
	}
}

/**
 * Creates listview for filter rules
 * @class
 * This class represents listview for filter-rules
 * 
 * @param	{DwtComposite}	parent		the parent widget
 * @param	{ZmController}	controller	the controller
 *
 * @extends		DwtListView
 * 
 */
ZmFilterListView = function(parent, controller) {
	DwtListView.call(this, {
		parent: parent,
		className: "DwtListView ZmFilterRuleList"
	});
	this._controller = controller;
	this.setMultiSelect(false); // single selection only

	this._rules = AjxDispatcher.run(controller.isOutgoing() ? "GetOutgoingFilterRules" : "GetFilterRules");
	this._rules.addChangeListener(new AjxListener(this, this._changeListener));
	
	this.moveUpButtons = {}; //hash of move-up icon IDs
	this.moveDownButtons = {}; //hash of move-down icon IDs
	this.editButtons = {}; //hash of edit icon IDs
	this.delButtons = {}; //hash of delete icon IDs
	this.runButtons = {}; //hash of run-filter icon IDs
	this.toggleStateButtons = {}; //hash of toggle state checkbox IDs
}

ZmFilterListView.prototype = new DwtListView;

ZmFilterListView.prototype.constructor = ZmFilterListView;

ZmFilterListView.prototype.toString = function() {
	return "ZmFilterListView";
}

/**
 * Reset list view when filter-rule changes
 */
ZmFilterListView.prototype._changeListener = function(ev) {
	if (ev.type != ZmEvent.S_FILTER) {
		AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: ev.type is not S_FILTER; ev.type == " + ev.type);
		return;
	}
	AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: ev.type == " + ev.type);
	if (ev.event == ZmEvent.E_MODIFY) {
		this._controller.resetListView(ev.getDetail("index"));
		AjxDebug.println(AjxDebug.FILTER, "FILTER RULES: MODIFY event, called resetListview");
	}
};

/**
 * Set's item for list view
 * 
 * @param	{AjxVector}	list	list of filter rules
 */
ZmFilterListView.prototype.set = function(list) {
	var rules = new AjxVector();
	for (var i = 0; i < list.size(); i++) {
		var rule = list.get(i);
		if (rule.hasValidAction()) {
			rules.add(rule);
		}
	}
	DwtListView.prototype.set.call(this, rules);
}

/**
 * Returns content of single cell
 * 
 * @override DwtListView.prototype._getCellContents
 */
ZmFilterListView.prototype._getCellContents = function(html, idx, item, field, colIdx, params) {
	var id = this._getCellId(item, field, params);
	var data =	{
		id: id,
		name: item.name,
		active: item.active,
		moveUpButtonId: Dwt.getNextId("MoveUpFilter_"),
		moveDownButtonId: Dwt.getNextId("MoveDownFilter_"),
		editButtonId: Dwt.getNextId("EditFilter_"),
		deleteButtonId: Dwt.getNextId("DeleteFilter_"),
		runButtonId: Dwt.getNextId("RunFilter_"),
		toggleStateButtonId: Dwt.getNextId("Active_"),
		disableMoveUpButton: this._list && (this._list.indexOf(item) === 0),
		disableMoveDownButton: this._list && (this._list.getLast() === item)
	};
	this.moveUpButtons[data.moveUpButtonId] = true;
	this.moveDownButtons[data.moveDownButtonId] = true;
	this.editButtons[data.editButtonId] = true;
	this.delButtons[data.deleteButtonId] = true;
	this.runButtons[data.runButtonId] = true;
	this.toggleStateButtons[data.toggleStateButtonId] = true;
			
	html[idx++] = AjxTemplate.expand("prefs.Pages#MailFilterRow", data);
	return idx;
};

/**
 * Returns id of single cell
 * 
 * @override DwtListView.prototype._getCellId
 */
ZmFilterListView.prototype._getCellId = function(item, field, params) {
	return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, this._view, item.id, field);
};
