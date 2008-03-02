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
 * Creates a dialog for specifying a filter rule. Can be used for either add or edit.
 * @constructor
 * @class
 * This class presents a dialog which a user can use to add or edit a filter rule.
 * A filter rule consists of conditions and actions (at least one of each). Different
 * types of conditions and actions require different fields to specify them, so they
 * are presented in a table in which all columns are not necessarily occupied.
 * <p>
 * First the HTML is laid out, then DWT objects that are needed for input are plugged
 * in.</p>
 *
 * @author Conrad Damon
 */
ZmFilterRuleDialog = function() {

	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmFilterRuleDialog", title:ZmMsg.selectAddresses});

	// set content
	this.setContent(this._contentHtml());
	this._setConditionSelect();
	this._createTabGroup();

	// create these listeners just once
	this._rowChangeLstnr	= new AjxListener(this, this._rowChangeListener);
	this._opsChangeLstnr	= new AjxListener(this, this._opsChangeListener);
	this._dateLstnr			= new AjxListener(this, this._dateListener);
	this._plusMinusLstnr	= new AjxListener(this, this._plusMinusListener);
	this._browseLstnr		= new AjxListener(this, this._browseListener);
	
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._conditionErrorFormatter = new AjxMessageFormat(ZmMsg.filterErrorCondition);
	this._actionErrorFormatter = new AjxMessageFormat(ZmMsg.filterErrorAction);
};

ZmFilterRuleDialog.prototype = new DwtDialog;
ZmFilterRuleDialog.prototype.constructor = ZmFilterRuleDialog;

// data keys
ZmFilterRuleDialog.ROW_ID			= "_rowid_";
ZmFilterRuleDialog.IS_CONDITION		= "_condition_";
ZmFilterRuleDialog.DO_ADD			= "_add_";
ZmFilterRuleDialog.BROWSE_TYPE		= "_btype_";
ZmFilterRuleDialog.DATA				= "_data_";

// condition fields in order they appear in dialog
ZmFilterRuleDialog.CONDITION_COLS	= ["subject", "subjectMod", "ops", "value", "valueMod", "Plus", "Minus"];
ZmFilterRuleDialog.ACTION_COLS		= ["name", "param", "Plus", "Minus"];

// character width of text inputs
ZmFilterRuleDialog.INPUT_NUM_CHARS = 15;

// button widths
ZmFilterRuleDialog.CHOOSER_BUTTON_WIDTH		= 120;
ZmFilterRuleDialog.PLUS_MINUS_BUTTON_WIDTH	= 20;

/**
* Shows the dialog and displays either a given rule for editing, or a dummy rule
* that is the base for adding a new rule.
*
* @param rule			[ZmFilterRule]*		rule to edit
* @param editMode		[boolean]*			if true, we are editing a rule
* @param referenceRule	[ZmFilterRule]*		rule after which to add new rule
*/
ZmFilterRuleDialog.prototype.popup =
function(rule, editMode, referenceRule) {
	// always make sure we have the right rules container in case of multi-mbox
	this._rules = AjxDispatcher.run("GetFilterRules");
	this._rules.loadRules(); // make sure rules are loaded (for when we save)

	this._inputs = {};
	this._rule = rule;
	this._editMode = editMode;
	this._referenceRule = referenceRule;
	this.setTitle(rule ? ZmMsg.editFilter : ZmMsg.addFilter);

	var nameField = document.getElementById(this._nameInputId);
	var name = rule ? AjxStringUtil.stripTags(rule.getName(), true) : null;
	nameField.value = name ? name : "";

	var activeField = document.getElementById(this._activeCheckboxId);
	activeField.checked = (!rule || rule.isActive());

	var stopField = document.getElementById(this._stopCheckboxId);
	stopField.checked = (!editMode);

	var checkAll = (rule && (rule.getGroupOp() == ZmFilterRule.GROUP_ALL));
	this._conditionSelect.setSelectedValue(checkAll ? ZmFilterRule.GROUP_ALL : ZmFilterRule.GROUP_ANY);

	this._conditionsTabGroup.removeAllMembers();
	this._actionsTabGroup.removeAllMembers();

	this._rule = rule ? rule : ZmFilterRule.DUMMY_RULE;
	this._renderTable(this._rule, true);	// conditions
	this._renderTable(this._rule, false);	// actions
	this._addDwtObjects();

	DwtDialog.prototype.popup.call(this);

	nameField.focus();
};

/**
* Clears the conditions and actions table before popdown so we don't keep
* adding to them.
*/
ZmFilterRuleDialog.prototype.popdown =
function() {
	this._clearTables();
	DwtDialog.prototype.popdown.call(this);
};

ZmFilterRuleDialog.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

/*
* Returns HTML that forms the basic framework of the dialog.
*/
ZmFilterRuleDialog.prototype._contentHtml =
function() {
	// identifiers
	var id = this._htmlElId;
	this._nameInputId = id+"_name";
	this._activeCheckboxId = id+"_active";
	this._groupSelectId = id+"_group";
	this._conditionId = id+"_condition";
	this._conditionsTableId = id+"_conditions";
	this._actionsTableId = id+"_actions";
	this._stopCheckboxId = id+"_stop";

	// content html
	return AjxTemplate.expand("prefs.Pages#MailFilterRule", id);
};

ZmFilterRuleDialog.prototype._setConditionSelect = function() {
	var message = new DwtMessageComposite(this);
	var callback = new AjxCallback(this, this._createConditionControl);
	message.setFormat(ZmMsg.filterCondition, callback);

	var conditionEl = document.getElementById(this._htmlElId+"_condition");
	message.appendElement(conditionEl);
};

ZmFilterRuleDialog.prototype._createConditionControl = function(parent, segment, i) {
	if (segment.getIndex() == 0) {
		var format = segment.getSegmentFormat();
		var limits = format.getLimits();
		var formats = format.getFormats();
		var values = [ZmFilterRule.GROUP_ANY, ZmFilterRule.GROUP_ALL];

		var select = this._conditionSelect = new DwtSelect({parent:parent});
		for (var i = 0; i < values.length; i++) {
			// TODO: guard against badly specified message
			select.addOption(formats[i].toPattern(), i == 0, values[i]);
		};
		return select;
	}
};

ZmFilterRuleDialog.prototype._createTabGroup = function() {
	// create tabgroups
	var id = this._htmlElId;
	this._tabGroup = new DwtTabGroup(id);
	this._conditionsTabGroup = new DwtTabGroup(id+"_conditions");
	this._actionsTabGroup = new DwtTabGroup(id+"_actions");

	// get basic controls
	var MAX_VALUE = 100000;
	var tabIndexes = {};
	var ids = [ this._nameInputId, this._activeCheckboxId, this._stopCheckboxId ];
	for (var i = 0; i < ids.length; i++) {
		var el = document.getElementById(ids[i]);
		var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 5 - i;
		tabIndexes[tabIndex] = el;
	}

	// add other controls
	var el = document.getElementById(this._conditionId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 4;
	tabIndexes[tabIndex] = this._conditionSelect;

	// add tabgroups that will hold the conditions and actions
	var el = document.getElementById(this._conditionsTableId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 3;
	tabIndexes[tabIndex] = this._conditionsTabGroup;

	var el = document.getElementById(this._actionsTableId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 2;
	tabIndexes[tabIndex] = this._actionsTabGroup;

	// add dialog buttons
	tabIndexes[MAX_VALUE - 1] = this.getButton(DwtDialog.OK_BUTTON);
	tabIndexes[MAX_VALUE - 0] = this.getButton(DwtDialog.CANCEL_BUTTON);

	// populate tabgroup
	var keys = AjxUtil.keys(tabIndexes);
	keys.sort(AjxUtil.byNumber);
	for (var i = 0; i < keys.length; i++) {
		this._tabGroup.addMember(tabIndexes[keys[i]]);
	}
};

/*
* Draws a table of conditions or actions. Returns the ID of the last row added.
*
* @param rule			[ZmFilterRule]		source rule
* @param isCondition	[boolean]			true if we're drawing conditions
*/
ZmFilterRuleDialog.prototype._renderTable =
function(rule, isCondition) {
	var tabGroup = isCondition ? this._conditionsTabGroup : this._actionsTabGroup;
	var table = document.getElementById(isCondition ? this._conditionsTableId : this._actionsTableId);
	var rowData = isCondition ? rule.getConditions() : rule.getActions();
	var row, len = rowData.length;
	for (var i = 0; i < len; i++) {
		var o = rowData[i];
		if (isCondition) {
			if (o.subject == ZmFilterRule.C_HEADER && o.subjectModifier && ZmFilterRule.C_VALUE_MAP[o.subjectModifier]) {
				o.subject = ZmFilterRule.C_VALUE_MAP[o.subjectModifier];
				o.subjectModifier = null;
			}
		} else {
			// don't show action if it's disabled
			var action = o.name;
			var actionCfg = ZmFilterRule.ACTIONS[action];
			if (actionCfg.precondition && !appCtxt.get(actionCfg.precondition)) {
				continue;
			}
		}
		var rowId = Dwt.getNextId();
		this._enterTabScope(rowId);
		try {
			var html = this._getRowHtml(o, isCondition, rowId);
			if (html) {
				row = Dwt.parseHtmlFragment(html, true);
				table.tBodies[0].appendChild(row);
				tabGroup.addMember(this._getCurrentTabScope());
			}
		}
		finally {
			this._exitTabScope();
		}
	}
	this._resetOperations(isCondition);
	return row ? row.id : null;
};

/*
* Returns the HTML for a single condition or action row.
*
* @param data			[object]	a ZmCondition or ZmAction
* @param isCondition	[boolean]	true if we're rendering a condition row
*/
ZmFilterRuleDialog.prototype._getRowHtml =
function(data, isCondition, rowId) {
	var conf = isCondition ? ZmFilterRule.CONDITIONS[data.subject] : ZmFilterRule.ACTIONS[data.name];

	var html = [];
	var i = 0;

	this._inputs[rowId] = {};

	html[i++] = "<tr id='" + rowId + "'>";

	if (isCondition) {
		this._inputs[rowId].isCondition = true;
		html[i++] = this._createRowComponent(true, "subject", ZmFilterRule.CONDITIONS_LIST, data.subject, rowId);
		html[i++] = this._createRowComponent(conf, "subjectMod", conf.smOptions, data.subjectModifier, rowId);
		html[i++] = this._createRowComponent(conf, "ops", conf.opsOptions, data.comparator, rowId, data);
		html[i++] = this._createRowComponent(conf, "value", conf.vOptions, data.value, rowId, data);
		html[i++] = this._createRowComponent(conf, "valueMod", conf.vmOptions, data.valueModifier, rowId);
	} else {
		if (data.name == ZmFilterRule.A_STOP) {
			var stopField = document.getElementById(this._stopCheckboxId);
			stopField.checked = true;
			return;
		}
		html[i++] = "<td><table><tr>";
		html[i++] = this._createRowComponent(false, "name", ZmFilterRule.ACTIONS_LIST, data.name, rowId);
		html[i++] = this._createRowComponent(conf, "param", conf.pOptions, data.arg, rowId);
		html[i++] = "</tr></table></td>";
	}
	html[i++] = this._getPlusMinusHtml(rowId, isCondition);
	html[i++] = "</tr>";

	return html.join("");
};

ZmFilterRuleDialog.prototype._enterTabScope = function(id) {
	if (!this._tabScope) {
		this._tabScope = [];
	}
	var tabGroup = new DwtTabGroup(id || Dwt.getNextId());
	this._tabScope.push(tabGroup);
	return tabGroup;
};

ZmFilterRuleDialog.prototype._getCurrentTabScope = function() {
	if (this._tabScope) {
		return this._tabScope[this._tabScope.length - 1];
	}
};

ZmFilterRuleDialog.prototype._exitTabScope = function() {
	return this._tabScope ? this._tabScope.pop() : null;
};

/*
* Adds a new condition or action row to its table.
*
* @param isCondition	[boolean]	true if we're adding a condition row
* @param rowId			[int]*		ID of row to clone
*/
ZmFilterRuleDialog.prototype._addRow =
function(isCondition, rowId) {
	var rule = ZmFilterRule.DUMMY_RULE;
	if (rowId) {
		if (isCondition) {
			rule.clearConditions();
			rule.addCondition(this._getConditionFromRow(rowId));
		} else {
			rule.clearActions();
			rule.addAction(this._getActionFromRow(rowId));
		}
	}
	var newRowId = this._renderTable(rule, isCondition);
	this._addDwtObjects(newRowId);
};

/*
* Removes a condition or action row from its table. Also cleans up any DWT
* objects the row was using.
*
* @param rowId			[string]	ID of the row to remove
* @param isCondition	[boolean]	true if we're removing a condition row
*/
ZmFilterRuleDialog.prototype._removeRow =
function(rowId, isCondition) {
	var row = document.getElementById(rowId);
	if (!row) return;
	
	var table = document.getElementById(isCondition ? this._conditionsTableId : this._actionsTableId);
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++) {
		if (rows[i] == row) {
			table.deleteRow(i);
			break;
		}
	}
	this._removeDwtObjects(rowId);
	delete this._inputs[rowId];
};

/*
* Creates an input widget and returns HTML for a table cell that will contain it.
* The config for a condition or action is based on its main operator; for conditions
* it's called subject ("from", "body", etc), and for actions it's just called the
* action ("keep", "fileinto", etc). Each one of those has its own particular inputs.
* This method creates one of those inputs.
*
* @param conf		[hash or boolean]	the config for this subject or action; boolean if rendering
*										the actual subject or action (means "isCondition")
* @param field		[string]			name of the input field
* @param options	[array]				if the field type is a select, its options
* @param dataValue	[string]			current value of the field, if any
* @param rowId		[string]			ID of the containing row
* @param data		[object]*			ZmCondition or ZmAction
*/
ZmFilterRuleDialog.prototype._createRowComponent =
function(conf, field, options, dataValue, rowId, data) {
	var tabGroup = this._getCurrentTabScope();
	var isMainSelect = (typeof conf == "boolean");
	var isCondition, type;
	if (isMainSelect) {
		type = ZmFilterRule.TYPE_SELECT; // subject/name always a SELECT
		isCondition = conf;
	} else {
		type = conf[field];
		if (!type)
			return "<td style='visibility:hidden'></td>";
	}
	
	var id = Dwt.getNextId();
	if (type == ZmFilterRule.TYPE_INPUT) {
		var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: dataValue, size: 20});
		input.setData(ZmFilterRuleDialog.ROW_ID, rowId);
		this._inputs[rowId][field] = {id: id, dwtObj: input};
		if (field == "value" && data.subject == ZmFilterRule.C_HEADER) {
			input.setVisibility(!(data.comparator == ZmFilterRule.OP_EXISTS || data.comparator == ZmFilterRule.OP_NOT_EXISTS));
		}
		tabGroup.addMember(input.getTabGroupMember());
		return "<td id='" + id + "' valign='center' class='paddedTableCell'></td>";

	} else if (type == ZmFilterRule.TYPE_SELECT) {
		var select = new DwtSelect({parent:this});
		select.setData(ZmFilterRuleDialog.ROW_ID, rowId);
		this._inputs[rowId][field] = {id: id, dwtObj: select};
		if (isMainSelect) {
			select.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
			select.addChangeListener(this._rowChangeLstnr);
		} else if (field == "ops") {
			if (data.subject == ZmFilterRule.C_HEADER) {
				select.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
				select.addChangeListener(this._opsChangeLstnr);
			}
		}
		for (var i = 0; i < options.length; i++) {
			var o = options[i];
			// skip if the action or this option is disabled
			if (isMainSelect && !isCondition) {
				var actionCfg = ZmFilterRule.ACTIONS[o];
				if (actionCfg.precondition && !appCtxt.get(actionCfg.precondition)) {
					continue;
				}
			}
			if (o.precondition && !appCtxt.get(o.precondition)) {
				continue;
			}
			var value, label;
			if (isMainSelect) {
				value = o;
				label = isCondition ? ZmFilterRule.C_LABEL[o] : ZmFilterRule.A_LABEL[o];
			} else if (field == "ops") {
				value = o;
				label = ZmFilterRule.OP_LABEL[o];
			} else {
				value = o.value;
				label = o.label;
			}
			var selected = (dataValue && (value == dataValue));
			select.addOption(new DwtSelectOptionData(value, label, selected));
		}
		if (!select.getValue()) {
			select.setSelected(0);
		}
		tabGroup.addMember(select.getTabGroupMember());
		return "<td id='" + id + "' valign='center' class='paddedTableCell'></td>";

	} else if (type == ZmFilterRule.TYPE_CALENDAR) {
		// create button with calendar that hangs off menu
		var dateButton = new DwtButton({parent:this});
		dateButton.setSize(ZmFilterRuleDialog.CHOOSER_BUTTON_WIDTH, Dwt.DEFAULT);
		var date, dateText;
		if (dataValue) {
			// convert from filter format (yyyymmdd) to display format (dd/mm/yyyy)
			var yyyy = parseInt(dataValue.substr(0, 4), 10);
			var mm = parseInt(dataValue.substr(4, 2), 10) - 1;
			var dd = parseInt(dataValue.substr(6, 2), 10);
			date = new Date(yyyy, mm, dd);
			dateText = AjxDateUtil.simpleComputeDateStr(date);
		} else {
			date = new Date();
			dateText = ZmMsg.chooseDate;
		}
		dateButton.setText(dateText);
		dateButton.setData(ZmFilterRuleDialog.DATA, date);
		var calMenu = new DwtMenu({parent:dateButton, style:DwtMenu.CALENDAR_PICKER_STYLE});
		dateButton.setMenu(calMenu, true);
		var cal = new DwtCalendar({parent:calMenu});
		cal.setSkipNotifyOnPage(true);
		cal.addSelectionListener(this._dateLstnr);
		cal.setDate(date);
		cal._dateButton = dateButton;
		this._inputs[rowId][field] = {id: id, dwtObj: dateButton};
		tabGroup.addMember(dateButton.getTabGroupMember());
		return "<td id='" + id + "' valign='center' class='paddedTableCell'></td>";

	} else if (type == ZmFilterRule.TYPE_FOLDER_PICKER || type == ZmFilterRule.TYPE_TAG_PICKER) {
		var button = new DwtButton({parent:this});
		var organizer = null;
		if (dataValue) {
			if (type == ZmFilterRule.TYPE_FOLDER_PICKER) {
				var folderTree = appCtxt.getFolderTree();
				if (folderTree) {
                    dataValue = ( dataValue.charAt(0) == '/' ) ? dataValue.substring(1) : dataValue;
                    organizer = folderTree.getByPath(dataValue, true);
				}
			} else {
				var tagTree = appCtxt.getTagTree();
				if (tagTree) {
					organizer = tagTree.getByName(dataValue);
				}
			}
		}
		var	text = organizer ? organizer.getName(false, null, true) : ZmMsg.browse;
		button.setText(text);
		button.setData(ZmFilterRuleDialog.BROWSE_TYPE, type);
		button.setData(ZmFilterRuleDialog.DATA, dataValue);
		this._inputs[rowId][field] = {id: id, dwtObj: button};
		button.addSelectionListener(this._browseLstnr);
		tabGroup.addMember(button.getTabGroupMember());
		return "<td id='" + id + "' valign='center' class='paddedTableCell'></td>";
	}
};

/*
* Returns HTML for the + and - buttons at the end of each row.
*
* @param rowId			[string]	ID of the row that gets the buttons
* @param isCondition	[boolean]	true if we're adding them to a condition row
*/
ZmFilterRuleDialog.prototype._getPlusMinusHtml =
function(rowId, isCondition) {
	var tabGroup = this._getCurrentTabScope();
	var html = [];
	html.push("<td style='align:right;'><table border=0 cellpadding=0 cellspacing=0><tr>");
	html.push("<td width='100%' style=''></td>"); // right-justify the plus/minus buttons
	var buttons = ["Plus", "Minus"];
	for (var i = 0; i < buttons.length; i++) {
		var b = buttons[i];
		var button = new DwtButton({parent:this});
// MOW: this was messing up velodrome skin
//		button.setSize(ZmFilterRuleDialog.PLUS_MINUS_BUTTON_WIDTH, Dwt.DEFAULT);
		button.setImage(b);
		button.setData(ZmFilterRuleDialog.ROW_ID, rowId);
		button.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
		button.setData(ZmFilterRuleDialog.DO_ADD, (b == "Plus"));
		button.addSelectionListener(this._plusMinusLstnr);
		var id = Dwt.getNextId();
		this._inputs[rowId][b] = {id: id, dwtObj: button};
		html.push("<td id='" + id + "' valign='center' class='paddedTableCell'></td>");
		tabGroup.addMember(button);
	}
	html.push("</tr></table></td>");
	return html.join("");
};

/*
* If there's only one row, disable its Minus button (since removing it would
* leave the user with nothing).
*
* @param isCondition	[boolean]	true if we're checking a condition row
*/
ZmFilterRuleDialog.prototype._resetOperations =
function(isCondition) {
	var table = document.getElementById(isCondition ? this._conditionsTableId : this._actionsTableId);
	var rows = table.rows;
	if (!(rows && rows.length)) { return; }
	var input = this._inputs[rows[0].id];
	if (input) {
		var minusButton = input["Minus"].dwtObj;
		if (rows.length == 1) {
			minusButton.setEnabled(false);
		} else {
			minusButton.setEnabled(true);
		}
	}
};

/*
* Update the inputs for a row based on the subject (condition), or action name. The old row is
* removed, and a new row is created and inserted.
*
* @param ev		[DwtEvent]		event (from DwtSelect)
*/
ZmFilterRuleDialog.prototype._rowChangeListener =
function(ev) {
	var newValue = ev._args.newValue;
	var oldValue = ev._args.oldValue;
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var isCondition = ev._args.selectObj.getData(ZmFilterRuleDialog.IS_CONDITION);
	var tabGroup = isCondition ? this._conditionsTabGroup : this._actionsTabGroup;

	// preserve op and value between header fields
	var comparator = null, dataValue = null;
	if (isCondition && (ZmFilterRule.IS_HEADER[oldValue] && ZmFilterRule.IS_HEADER[newValue])) {
		comparator = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "ops");
		dataValue = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "value");
	}
	
	var row = document.getElementById(rowId);
	var index = this._getIndexForRow(row, isCondition);
	var table = document.getElementById(isCondition ? this._conditionsTableId : this._actionsTableId);
	this._removeDwtObjects(rowId);
	table.deleteRow(index);
	var newIndex = (index >= table.rows.length) ? null : index; // null means add to end
	
	var data = isCondition ? new ZmCondition(newValue, comparator, dataValue) : new ZmAction(newValue);
	this._enterTabScope(rowId);
	try {
		var html = this._getRowHtml(data, isCondition, rowId);
		if (html) {
			row = Dwt.parseHtmlFragment(html, true);
			if (!row) {
				DBG.println(AjxDebug.DBG1, "Filter rule dialog: no row created!");
				return;
			}
			table.tBodies[0].insertBefore(row, (newIndex != null) ? table.rows[newIndex] : null);
			this._addDwtObjects(row.id);
			this._resetOperations(isCondition);
			tabGroup.removeMember(tabGroup.getTabGroupMemberByName(rowId));
			tabGroup.addMember(this._getCurrentTabScope());
		}
	}
	finally {
		this._exitTabScope();
	}
};

/*
* For the "Header Named" input only - hide the last input field (value) if the selected op is "exists" or
* "does not exist", since those are unary ops which don't take a value.
*
* @param ev		[DwtEvent]		event (from DwtSelect)
*/
ZmFilterRuleDialog.prototype._opsChangeListener =
function(ev) {
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var input = this._inputs[rowId];
	if (!input) return;
	var newValue = ev._args.newValue;
	input["value"].dwtObj.setVisibility(!(newValue == ZmFilterRule.OP_EXISTS || newValue == ZmFilterRule.OP_NOT_EXISTS));
};

/*
* Updates the calendar button text with a date that's just been selected.
*
* @param ev		[DwtEvent]		event (from DwtCalendar)
*/
ZmFilterRuleDialog.prototype._dateListener =
function(ev) {
	var cal = ev.item;
	if (!cal._dateButton) return;
	var date = ev.detail;
	var button = cal._dateButton;
	button.setText(AjxDateUtil.simpleComputeDateStr(date));
	button.setData(ZmFilterRuleDialog.DATA, date);
};

/*
* Adds or removes a condition/action row.
*
* @param ev		[DwtEvent]		event
*/
ZmFilterRuleDialog.prototype._plusMinusListener =
function(ev) {
	var button = ev.item;
	var rowId = button.getData(ZmFilterRuleDialog.ROW_ID);
	var isCondition = button.getData(ZmFilterRuleDialog.IS_CONDITION);
	var doAdd = button.getData(ZmFilterRuleDialog.DO_ADD);
	if (doAdd) {
		this._addRow(isCondition, rowId);
	} else {
		this._removeRow(rowId, isCondition);
	}
	this._resetOperations(isCondition);
};

/*
* Pops up one of two dialogs, for choosing a folder or a tag.
* 
* @param ev		[DwtEvent]		event
*/
ZmFilterRuleDialog.prototype._browseListener =
function(ev) {
	var dialog;
	var button = ev.item;
	var type = button.getData(ZmFilterRuleDialog.BROWSE_TYPE);
	var dialog = (type == ZmFilterRule.TYPE_FOLDER_PICKER) ? appCtxt.getChooseFolderDialog() :
															 appCtxt.getPickTagDialog();
	dialog.reset();
	dialog.setTitle((type == ZmFilterRule.TYPE_FOLDER_PICKER) ? ZmMsg.chooseFolder : ZmMsg.chooseTag);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseSelectionCallback, this, ev.item);
	dialog.popup({overviewId:this.toString()});
};

/*
* Changes the text of a button to the folder/tag that the user just chose.
*
* @param	[DwtButton]		the browse button
* @param	[ZmOrganizer]	the folder or tag that was chosen
*/
ZmFilterRuleDialog.prototype._browseSelectionCallback =
function(button, organizer) {
	var type = button.getData(ZmFilterRuleDialog.BROWSE_TYPE);
	var isFolder = (type == ZmFilterRule.TYPE_FOLDER_PICKER);
	var dialog = isFolder ? appCtxt.getChooseFolderDialog() : appCtxt.getPickTagDialog();
	if (organizer) {
		// Bug 24425, don't allow root folder selection
		if (isFolder && organizer.nId == ZmFolder.ID_ROOT)
			return;
		button.setText(organizer.getName(false, null, true));
		var value = isFolder ? organizer.getPath(false, false, null, true, true) :
							   organizer.getName(false, null, true);
		button.setData(ZmFilterRuleDialog.DATA, value);
	}
	dialog.popdown();
};

/*
* Attaches input widgets to the DOM tree based on placeholder IDs.
*
* @param	[string]*	rowId	ID of a single row to add inputs to
*/
ZmFilterRuleDialog.prototype._addDwtObjects =
function(rowId) {
	for (var id in this._inputs) {
		if (rowId && (id != rowId)) continue;
		var row = this._inputs[id];
		for (var f in row) {
			var field = row[f];
			if (field.id && field.dwtObj) {
				var el = field.dwtObj.getHtmlElement();
				if (el) {
					el.parentNode.removeChild(el);
					document.getElementById(field.id).appendChild(el);
					el._rowId = id;
				}
			}
		}
	}
};

/*
* Destroys input widgets.
*
* @param	[string]*	rowId	ID of a single row to clean up
*/
ZmFilterRuleDialog.prototype._removeDwtObjects =
function(rowId) {
	for (var id in this._inputs) {
		if (rowId && (id != rowId)) continue;
		var row = this._inputs[id];
		for (var f in row) {
			var field = row[f];
			if (field.dwtObj)
				field.dwtObj.dispose();
		}
	}
};

/*
* Saves the newly created/edited rule.
*
* @param ev		[DwtEvent]		event
*/
ZmFilterRuleDialog.prototype._okButtonListener =
function(ev) {

	var rule = this._rule;
	var msg = null;
	var name = document.getElementById(this._nameInputId).value;
	name = name.replace (/\s*$/,'');
	name = name.replace (/^\s*/,'');
	if (!name) {
		msg = ZmMsg.filterErrorNoName;
	} else {
		name = AjxStringUtil.stripTags(name, true);
	}
	var rule1 = this._rules.getRuleByName(name);
	if (rule1 && (rule1 != rule)) {
		msg = ZmMsg.filterErrorNameExists;
	}
	if (msg) {
		var msgDialog = appCtxt.getMsgDialog();
    	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	    msgDialog.popup();
	    return;
	}
	var active = document.getElementById(this._activeCheckboxId).checked;
	var anyAll = this._conditionSelect.getValue();

	// adding a rule always starts with dummy
	if (this._editMode) {
		rule.setName(name);
		rule.setGroupOp(anyAll);
		rule.clearConditions();
		rule.clearActions();
	} else {
		rule = new ZmFilterRule(name);
		rule.setGroupOp(anyAll);
	}
	rule.setActive(active);
	
	// get input from tables so order is preserved
	var table = document.getElementById(this._conditionsTableId);
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++) {
		var condition = this._getConditionFromRow(rows[i].id);
		if (msg = this._checkCondition(condition))
			break;
		else
			rule.addCondition(condition);
	}
	if (!msg) {
		table = document.getElementById(this._actionsTableId);
		rows = table.rows;
		for (var i = 0; i < rows.length; i++) {
			var action = this._getActionFromRow(rows[i].id);
			if (msg = this._checkAction(action))
				break;
			else
				rule.addAction(action);
		}
	}
	var stopAction = document.getElementById(this._stopCheckboxId).checked;
	if (stopAction)
		rule.addAction(new ZmAction(ZmFilterRule.A_STOP));

	if (msg) {
		var msgDialog = appCtxt.getMsgDialog();
    	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	    msgDialog.popup();
	    return;
	}
	
	var respCallback = new AjxCallback(this, this._handleResponseOkButtonListener);
	if (this._editMode)
		this._rules._saveRules(this._rules.getIndexOfRule(rule), true, respCallback);
	else
		this._rules.addRule(rule, this._referenceRule, respCallback);
};

ZmFilterRuleDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};

/*
* Creates a ZmCondition based on the values of a condition row.
*
* @param rowId	[string]	row ID
*/
ZmFilterRuleDialog.prototype._getConditionFromRow =
function(rowId) {
	var inputs = this._inputs[rowId];
	var subject = inputs.subject.dwtObj.getValue();
	var conf = ZmFilterRule.CONDITIONS[subject];
	var comparator = this._getInputValue(inputs, conf, "ops");
	var value = AjxStringUtil.trim(this._getInputValue(inputs, conf, "value"));
	var subjectMod = this._getInputValue(inputs, conf, "subjectMod");
	var valueMod = this._getInputValue(inputs, conf, "valueMod");

	return new ZmCondition(subject, comparator, value, subjectMod, valueMod);
};

/*
* Creates a ZmAction based on the values of an action row.
*
* @param rowId	[string]	row ID
*/
ZmFilterRuleDialog.prototype._getActionFromRow =
function(rowId) {
	var inputs = this._inputs[rowId];
	var name = inputs.name.dwtObj.getValue();
	var conf = ZmFilterRule.ACTIONS[name];
	var arg = this._getInputValue(inputs, conf, "param");

	return new ZmAction(name, arg);
};

/*
* Retrieves the value of an input based on what type it is. For all but text
* inputs, we can get it from a DWT object.
*
* @param inputs		[object]	the inputs for one row
* @param conf		[object]	config info for this row's subject or action name
* @param field		[string]	current input field
*/
ZmFilterRuleDialog.prototype._getInputValue =
function(inputs, conf, field) {
	var type = conf[field];
	if (!type) return null;
	
	if (type == ZmFilterRule.TYPE_INPUT) {
		return inputs[field].dwtObj.getValue();
	} else if (type == ZmFilterRule.TYPE_SELECT) {
		return inputs[field].dwtObj.getValue();
	} else if (type == ZmFilterRule.TYPE_CALENDAR) {
		var date = inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
		return AjxDateFormat.format("yyyyMMdd", date);
	} else if (type == ZmFilterRule.TYPE_FOLDER_PICKER) {
		return inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
	} else if (type == ZmFilterRule.TYPE_TAG_PICKER) {
		return inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
	}
};

/*
* Given a row, returns its index in its containing table.
*
* @param row			[element]	a table row (TR)
* @param isCondition	[boolean]	true if the row is a condition row
*/
ZmFilterRuleDialog.prototype._getIndexForRow =
function(row, isCondition) {
	var table = document.getElementById(isCondition ? this._conditionsTableId : this._actionsTableId);
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++)
		if (rows[i] == row)
			return i;

	return null;
};

/*
* Buses tables, hopes to make it big in movies some day.
*/
ZmFilterRuleDialog.prototype._clearTables =
function() {
	var list = [this._conditionsTableId, this._actionsTableId];
	for (var i = 0; i < list.length; i++) {
		var table = document.getElementById(list[i]);
		var tbody = table.tBodies[0];
		while (tbody.firstChild != null) {
			this._removeDwtObjects(tbody.firstChild.id);
			tbody.removeChild(tbody.firstChild);
		}
	}
};

/*
* Returns true if the condition has the necessary parts, an error message otherwise.
*
* @param condition	[ZmCondition]	condition
*/
ZmFilterRuleDialog.prototype._checkCondition =
function(condition) {
	var conf = ZmFilterRule.CONDITIONS[condition.subject];
	for (var f in conf) {
		var key = ZmFilterRule.CONDITIONS_KEY[f];
		if (!key) continue;
		if ((key == "value") && (condition.subject == ZmFilterRule.C_HEADER) &&
			(condition.comparator == ZmFilterRule.OP_EXISTS || condition.comparator == ZmFilterRule.OP_NOT_EXISTS)) {
			continue; // "Header Named" with "exists" doesn't take a value
		}
		if (conf[f] && !condition[key]) {
			return this._conditionErrorFormatter.format([ZmFilterRule.C_LABEL[condition.subject]]);
		}
		if (condition.value && (condition.value.indexOf('"') != -1) ||
							   (condition.value.indexOf("\\") != -1)) {
			return ZmMsg.filterErrorIllegalCharacter
		}
	}
};

/*
* Returns true if the action has the necessary parts, an error message otherwise.
*
* @param action	[ZmAction]	action
*/
ZmFilterRuleDialog.prototype._checkAction =
function(action) {
	var conf = ZmFilterRule.ACTIONS[action.name];
	if (conf.param && !action.arg) {
		return this._actionErrorFormatter.format([ZmFilterRule.A_LABEL[action.name]]);
	}
	if (conf.validationFunction && !conf.validationFunction(action.arg)) {
		return conf.errorMessage;
	}
};
