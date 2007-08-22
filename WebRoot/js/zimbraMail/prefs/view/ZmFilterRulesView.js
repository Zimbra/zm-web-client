/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmFilterRulesView = function(parent, controller) {

	DwtTabViewPage.call(this, parent, "ZmPreferencesPage ZmFilterRulesView");

	this._controller = controller;
	this._prefsController = AjxDispatcher.run("GetPrefController");

	this._rules = AjxDispatcher.run("GetFilterRules");

    var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
    this._title = [ZmMsg.zimbraTitle, ZmMsg.options, section && section.title].join(": ");

	this._rendered = false;
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
	var activeAcct = appCtxt.getActiveAccount().name;
	if (this._hasRendered == activeAcct) { return; }

	// create the html
	var data = { id: this._htmlElId };
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.prefs.templates.Pages#MailFilters", data);

	// create toolbar
	var toolbarEl = document.getElementById(data.id+"_toolbar");
	if (toolbarEl) {
		var buttons = this._controller.getToolbarButtons();
		this._toolbar = new ZmButtonToolBar({parent:this, buttons:buttons, posStyle:Dwt.STATIC_STYLE});
		this._toolbar.replaceElement(toolbarEl);
	}

	// create list view
	var listViewEl = document.getElementById(data.id+"_list");
	if (listViewEl) {
		this._listView = new ZmFilterListView(this, this._controller);
		this._listView.replaceElement(listViewEl);
	}

	// initialize controller
	this._controller.initialize(this._toolbar, this._listView);

	this._hasRendered = activeAcct;
};

ZmFilterRulesView.prototype.hasRendered =
function(account) {
	var acct = account || appCtxt.getActiveAccount();
	return (this._hasRendered == acct.name);
};

ZmFilterRulesView.prototype.getTitle =
function() {
	return this._title;
};

ZmFilterRulesView.prototype.getToolbar =
function() {
	return this._toolbar;
};

ZmFilterRulesView.prototype.getListView =
function() {
	return this._listView;
};

// View is always in sync with rules
ZmFilterRulesView.prototype.reset = function() {};

/*
* ZmFilterListView
*/
ZmFilterListView = function(parent, controller) {
	var headerList = this._getHeaderList();
	DwtListView.call(this, parent, "ZmFilterListView", null, headerList);

	this._rules = AjxDispatcher.run("GetFilterRules");

	this._controller = controller;
	this._rules.addChangeListener(new AjxListener(this, this._changeListener));
	this.setMultiSelect(false);	// single selection only
	this._internalId = AjxCore.assignId(this);
};

ZmFilterListView.COL_ACTIVE	= "ac";
ZmFilterListView.COL_NAME	= "na";

ZmFilterListView.COL_WIDTH_ACTIVE = 40;

ZmFilterListView.prototype = new DwtListView;
ZmFilterListView.prototype.constructor = ZmFilterListView;

ZmFilterListView.prototype.toString =
function() {
	return "ZmFilterListView";
};

/**
 * Only show rules that have at least one valid action (eg, if the only action
 * is "tag" and tagging is disabled, don't show the rule).
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
	// can't add handlers until item divs have been added to DOM
	this._addCheckboxHandlers();
};

ZmFilterListView.prototype._getHeaderList =
function() {
	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmFilterListView.COL_ACTIVE, ZmMsg.active, null, ZmFilterListView.COL_WIDTH_ACTIVE));
	headerList.push(new DwtListHeaderItem(ZmFilterListView.COL_NAME, ZmMsg.filterName));
	return headerList;
};

ZmFilterListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmFilterListView.COL_ACTIVE) {
		html[idx++] = "<input type='checkbox' ";
		html[idx++] = item.isActive() ? "checked" : "";
		html[idx++] = " id='_ruleCheckbox";
		html[idx++] = item.id;
		html[idx++] = "'>";
	} else if (field == ZmFilterListView.COL_NAME) {
		html[idx++] = item.getName();
	}

	return idx;
};

/*
* Sets up handlers for the 'active' checkboxes. IE handles checkbox events through the list
* view's _itemClicked() method, since its ONCHANGE responsiveness appears to be flaky.
*/
ZmFilterListView.prototype._addCheckboxHandlers =
function() {
	for (var i = 0; i < this._checkboxIds.length; i++) {
		var id = this._checkboxIds[i];
		var inputEl = document.getElementById(id);
		if (inputEl) {
			inputEl._flvId = this._internalId;
			if (!AjxEnv.isIE)
				Dwt.setHandler(inputEl, DwtEvent.ONCHANGE, ZmFilterListView._activeStateChange);
		}
	}
};

/*
* In general, we just re-display all the rules when anything changes, rather
* than trying to update a particular row.
*/
ZmFilterListView.prototype._changeListener =
function(ev) {
	if (ev.type != ZmEvent.S_FILTER) return;

	DBG.println(AjxDebug.DBG3, "FILTER RULES: change listener");
	if (ev.event == ZmEvent.E_MODIFY) {
		var index = ev.getDetail("index");
		this._controller.resetListView();
	}
};

/*
* Handles click of 'active' checkbox by toggling the rule's active state.
*
* @param ev			[DwtEvent]	click event
*/
ZmFilterListView._activeStateChange =
function(ev) {
	var target = DwtUiEvent.getTarget(ev);
	DBG.println(AjxDebug.DBG3, "FILTER RULES: active state change for filter with ID " + target.id);
	var flv = AjxCore.objectWithId(target._flvId);
	var ruleId = target.id.substring(13);
	var rule = flv._rules.getRuleById(ruleId);
	if (rule)
		flv._rules.setActive(rule, !rule.isActive());
};

/*
* Override so that we don't change selection when the 'active' checkbox is clicked.
* Also contains a hack for IE for handling a click of the 'active' checkbox, because
* the ONCHANGE handler was only getting invoked on every other checkbox click for IE.
*
* @param clickedEl	[Element]	list DIV that received the click
* @param ev			[DwtEvent]	click event
* @param button		[constant]	button that was clicked
*/
ZmFilterListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
	// We only care about mouse events
	if (!(ev instanceof DwtMouseEvent))
		return true;

	var target = DwtUiEvent.getTarget(ev);
	var isInput = (target.id.indexOf("_ruleCheckbox") == 0);
	if (AjxEnv.isIE && isInput)
		ZmFilterListView._activeStateChange(ev);

	return !isInput;
};
