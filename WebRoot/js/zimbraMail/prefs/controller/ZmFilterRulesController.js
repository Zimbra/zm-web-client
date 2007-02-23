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

/**
* Creates a new, empty filter rules controller.
* @constructor
* @class
* Manages the filter rules page, which has a button toolbar and a list view of the rules.
*
* @author Conrad Damon
*
* @param appCtxt		[ZmAppCtxt]			the app context
* @param container		[DwtShell]			the shell
* @param prefsApp		[ZmPreferencesApp]	the preferences app
*/
function ZmFilterRulesController(appCtxt, container, prefsApp, prefsView) {

	ZmController.call(this, appCtxt, container, prefsApp);

	this._prefsView = prefsView;
	this._rules = AjxDispatcher.run("GetFilterRules");
	this._filterRulesView = new ZmFilterRulesView(this._prefsView._parent, appCtxt, this);
	
	this._buttonListeners = new Object();
	this._buttonListeners[ZmOperation.ADD_FILTER_RULE] = new AjxListener(this, this._addListener);
	this._buttonListeners[ZmOperation.EDIT_FILTER_RULE] = new AjxListener(this, this._editListener);
	this._buttonListeners[ZmOperation.REMOVE_FILTER_RULE] = new AjxListener(this, this._removeListener);
	this._buttonListeners[ZmOperation.MOVE_UP_FILTER_RULE] = new AjxListener(this, this._moveUpListener);
	this._buttonListeners[ZmOperation.MOVE_DOWN_FILTER_RULE] = new AjxListener(this, this._moveDownListener);
};

ZmFilterRulesController.prototype = new ZmController();
ZmFilterRulesController.prototype.constructor = ZmFilterRulesController;

/**
* Returns the filter rules view, which comprises a toolbar and a list view.
*/
ZmFilterRulesController.prototype.getFilterRulesView =
function() {
	return this._filterRulesView;
};

/*
* Creates the initial filter rules UI.
*/
ZmFilterRulesController.prototype._setup =
function() {
	if (this._toolbar && this._listView) return;

	this._initializeToolBar();
	this._initializeListView();
};

/*
* Sets up the filter rules toolbar.
*/
ZmFilterRulesController.prototype._initializeToolBar =
function() {
	var buttons = [ZmOperation.ADD_FILTER_RULE,
				   ZmOperation.SEP,
				   ZmOperation.EDIT_FILTER_RULE,
				   ZmOperation.SEP,
				   ZmOperation.REMOVE_FILTER_RULE,
				   ZmOperation.FILLER,
				   ZmOperation.MOVE_UP_FILTER_RULE,
				   ZmOperation.SEP,
				   ZmOperation.MOVE_DOWN_FILTER_RULE];
	
	this._toolbar = new ZmButtonToolBar(this._filterRulesView, buttons, null, Dwt.STATIC_STYLE);

	// add listeners
	buttons = this._toolbar.opList;
	for (var i = 0; i < buttons.length; i++) {
		var id = buttons[i];
		if (this._buttonListeners[id]) {
			this._toolbar.addSelectionListener(id, this._buttonListeners[id]);
		}
	}
	this._resetOperations(this._toolbar, 0);
};

/*
* Creates the list view of the rules set and displays the rules.
*/
ZmFilterRulesController.prototype._initializeListView =
function() {
	this._listView = new ZmFilterListView(this._filterRulesView, this._appCtxt, this);
	this._listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
	this._setListView();
};

/*
* Displays the given list of rules.
*
* @param list		[Array]		list of rules to show
* @param index		[int]*		index of rule to select
*/
ZmFilterRulesController.prototype._setListView =
function(list, index) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: set list view");
	if (list) {
		this._handleResponseSetListView(list, index);
		this._listView.set(list);
	} else {
		var respCallback = new AjxCallback(this, this._handleResponseSetListView, [list, index]);
		this._rules.loadRules(false, respCallback);
	}
};

ZmFilterRulesController.prototype._handleResponseSetListView =
function(list, index, result) {
	list = list ? list : result.getResponse().clone();
	this._listView.set(list);
	index = index ? index : 0;
	var rule = this._rules.getRuleByIndex(index);
	if (rule)
		this._listView.setSelection(rule);
};

/*
* Handles left-clicking on a rule. Double click opens up a rule for editing.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._listSelectionListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._editListener(ev);
	} else {
		this._resetOperations(this._toolbar, this._listView.getSelectionCount(), this._listView.getSelection());
	}
};

/*
* The "Add Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._addListener =
function(ev) {
	var sel = this._listView.getSelection();
	var refRule = sel.length ? sel[sel.length - 1] : null;
	this._appCtxt.getFilterRuleDialog().popup(null, false, refRule);
};

/*
* The "Edit Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._editListener =
function(ev) {
	var sel = this._listView.getSelection();
	this._appCtxt.getFilterRuleDialog().popup(sel[0], true);
};

/*
* The "Delete Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._removeListener =
function(ev) {
	var sel = this._listView.getSelection();
	
	var filter = sel[0];
	var ds = this._deleteShield = this._appCtxt.getYesNoCancelMsgDialog();
	ds.reset();
	ds.registerCallback(DwtDialog.NO_BUTTON, this._clearDialog, this, this._deleteShield);
	ds.registerCallback(DwtDialog.YES_BUTTON, this._deleteShieldYesCallback, this, filter);
	var msg = AjxMessageFormat.format(ZmMsg.askDeleteFilter, filter.getName());
	ds.setMessage(msg, DwtMessageDialog.WARNING_STYLE);
	ds.popup();
};

/*
* The user has agreed to delete a filter rule.
*
* @param rule	[ZmFilterRule]		rule to delete
*/
ZmFilterRulesController.prototype._deleteShieldYesCallback =
function(rule) {
	this._rules.removeRule(rule);
	this._clearDialog(this._deleteShield);
};

/*
* The "Move Up" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._moveUpListener =
function(ev) {
	var sel = this._listView.getSelection();
	this._rules.moveUp(sel[0]);
};

/*
* The "Move Down" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._moveDownListener =
function(ev) {
	var sel = this._listView.getSelection();
	this._rules.moveDown(sel[0]);
};

/*
* Resets the toolbar button states, depending on which rule is selected.
* The list view enforces single selection only. If the first rule is selected,
* "Move Up" is disabled. Same for last rule and "Move Down". They're both
* disabled if there aren't at least two rules.
*
* @param parent		[ZmButtonToolBar]	the toolbar
* @param numSel		[int]				number of rules selected (0 or 1)
* @param sel		[Array]				list of selected rules
*/
ZmFilterRulesController.prototype._resetOperations =
function(parent, numSel, sel) {
	var numRules = this._rules.getNumberOfRules();
	if (numSel == 1) {
		parent.enableAll(true);
		var index = this._rules.getIndexOfRule(sel[0]);
		if (index == 0)
			parent.enable(ZmOperation.MOVE_UP_FILTER_RULE, false);
		if (index == (numRules - 1))
			parent.enable(ZmOperation.MOVE_DOWN_FILTER_RULE, false);
	} else {
		parent.enableAll(false);
		parent.enable(ZmOperation.ADD_FILTER_RULE, true);
	}
	if (numRules == 1) {
		parent.enable(ZmOperation.MOVE_UP_FILTER_RULE, false);
		parent.enable(ZmOperation.MOVE_DOWN_FILTER_RULE, false);
	}
};
