/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
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

/**
 * Creates a new, empty filter rules controller.
 * @constructor
 * @class
 * Manages the filter rules page, which has a button toolbar and a list view of the rules.
 *
 * @author Conrad Damon
 *
 * @param container		[DwtShell]			the shell
 * @param prefsApp		[ZmPreferencesApp]	the preferences app
 */
ZmFilterRulesController = function(container, prefsApp, prefsView) {

	ZmController.call(this, container, prefsApp);

	ZmFilterRule._setPreconditions();

	this._prefsView = prefsView;
	this._filterRulesView = new ZmFilterRulesView(this._prefsView._parent, this);
	
	this._buttonListeners = {};
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

ZmFilterRulesController.prototype.initialize =
function(toolbar, listView) {
	// always reset the the rules to make sure we get the right one for the *active* account
	this._rules = AjxDispatcher.run("GetFilterRules");

	if (toolbar) {
		var buttons = this.getToolbarButtons();
		for (var i = 0; i < buttons.length; i++) {
			var id = buttons[i];
			if (this._buttonListeners[id]) {
				toolbar.addSelectionListener(id, this._buttonListeners[id]);
			}
		}
		this._resetOperations(toolbar, 0);
	}

	if (listView) {
		listView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
		this.resetListView();
	}
};

ZmFilterRulesController.prototype.getToolbarButtons =
function() {
	return [
		ZmOperation.ADD_FILTER_RULE,
		ZmOperation.SEP,
		ZmOperation.EDIT_FILTER_RULE,
		ZmOperation.SEP,
		ZmOperation.REMOVE_FILTER_RULE,
		ZmOperation.FILLER, ZmOperation.MOVE_UP_FILTER_RULE,
		ZmOperation.SEP,
		ZmOperation.MOVE_DOWN_FILTER_RULE
	];
};

ZmFilterRulesController.prototype.resetListView =
function(callback, selectedIndex) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var respCallback = new AjxCallback(this, this._handleResponseSetListView, [listView, callback, selectedIndex]);
	this._rules.loadRules(false, respCallback);
};

ZmFilterRulesController.prototype._handleResponseSetListView =
function(listView, callback, selectedIndex, result) {
	listView.set(result.getResponse().clone());

	var rule = this._rules.getRuleByIndex(selectedIndex || 0);
	if (rule) {
		listView.setSelection(rule);
	}

	if (callback) {
		callback.run();
	}
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
		var toolbar = this._filterRulesView.getToolbar();
		var listView = this._filterRulesView.getListView();
		this._resetOperations(toolbar, listView.getSelectionCount(), listView.getSelection());
	}
};

/*
* The "Add Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._addListener =
function(ev) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var sel = listView.getSelection();
	var refRule = sel.length ? sel[sel.length - 1] : null;
	appCtxt.getFilterRuleDialog().popup(null, false, refRule);
};

/*
* The "Edit Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._editListener =
function(ev) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var sel = listView.getSelection();
	appCtxt.getFilterRuleDialog().popup(sel[0], true);
};

/*
* The "Delete Filter" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._removeListener =
function(ev) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var sel = listView.getSelection();
	
	var filter = sel[0];
	//bug:16053 changed getYesNoCancelMsgDialog to getYesNoMsgDialog
	var ds = this._deleteShield = appCtxt.getYesNoMsgDialog();
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
	var toolbar = this._filterRulesView.getToolbar();
	this._rules.removeRule(rule);
	this._clearDialog(this._deleteShield);
	this._resetOperations(toolbar, 0);
};

/*
* The "Move Up" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._moveUpListener =
function(ev) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var sel = listView.getSelection();
	this._rules.moveUp(sel[0]);
};

/*
* The "Move Down" button has been pressed.
*
* @param	[DwtEvent]		the click event
*/
ZmFilterRulesController.prototype._moveDownListener =
function(ev) {
	var listView = this._filterRulesView.getListView();
	if (!listView) return;

	var sel = listView.getSelection();
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
		parent.enable(ZmOperation.ADD_FILTER_RULE, true);
	}
	if (numRules == 1) {
		parent.enable(ZmOperation.MOVE_UP_FILTER_RULE, false);
		parent.enable(ZmOperation.MOVE_DOWN_FILTER_RULE, false);
	} else if (numRules == 0) {
		parent.enable(ZmOperation.EDIT_FILTER_RULE, false);
		parent.enable(ZmOperation.REMOVE_FILTER_RULE, false);
	}
};
