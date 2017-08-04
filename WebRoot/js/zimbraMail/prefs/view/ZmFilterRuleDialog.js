/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * 
 * @extends		DwtDialog
 */
ZmFilterRuleDialog = function() {

	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmFilterRuleDialog", title:ZmMsg.selectAddresses, id: "ZmFilterRuleDialog"});

	// set content
	this.setContent(this._contentHtml());
	this._createControls();
	this._setConditionSelect();
	this._createTabGroup();

	// create these listeners just once
	this._rowChangeLstnr			= new AjxListener(this, this._rowChangeListener);
	this._opsChangeLstnr			= new AjxListener(this, this._opsChangeListener);
	this._dateLstnr					= new AjxListener(this, this._dateListener);
	this._removeLstnr				= new AjxListener(this, this._removeListener);
	this._browseLstnr				= new AjxListener(this, this._browseListener);
	this._addrBookChangeLstnr		= new AjxListener(this, this._addrBookChangeListener);
	this._importanceChangeLstnr		= new AjxListener(this, this._importanceChangeListener);
		
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));
	this._conditionErrorFormatter = new AjxMessageFormat(ZmMsg.filterErrorCondition);
	this._actionErrorFormatter = new AjxMessageFormat(ZmMsg.filterErrorAction);
	var addConditionIcon = Dwt.getElement(this._addConditionIconId);
	var addActionIcon = Dwt.getElement(this._addActionIconId);
	Dwt.setHandler(addConditionIcon, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._plusListener, this,true));
	Dwt.setHandler(addActionIcon, DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._plusListener, this,false));
};

ZmFilterRuleDialog.prototype = new DwtDialog;
ZmFilterRuleDialog.prototype.constructor = ZmFilterRuleDialog;

// data keys
ZmFilterRuleDialog.ROW_ID			= "_rowid_";
ZmFilterRuleDialog.IS_CONDITION		= "_condition_";
ZmFilterRuleDialog.DO_ADD			= "_add_";
ZmFilterRuleDialog.BROWSE_TYPE		= "_btype_";
ZmFilterRuleDialog.DATA				= "_data_";

// character width of text inputs
ZmFilterRuleDialog.INPUT_NUM_CHARS = 15;

// button widths
ZmFilterRuleDialog.CHOOSER_BUTTON_WIDTH		= 120;
ZmFilterRuleDialog.PLUS_MINUS_BUTTON_WIDTH	= 20;

ZmFilterRuleDialog.CONDITIONS_INDEX = 0;
ZmFilterRuleDialog.prototype.toString =
function() {
	return "ZmFilterRuleDialog";
};

/**
 * Pops-up the dialog and displays either a given rule for editing, or a dummy
 * rule that is the base for adding a new rule.
 *
 * @param {ZmFilterRule}	rule				the rule to edit
 * @param {Boolean}	editMode			if <code>true</code>, we are editing a rule
 * @param {ZmFilterRule}	referenceRule		the rule after which to add new rule
 * @param {String}	accountName		the name of the account
 */
ZmFilterRuleDialog.prototype.popup =
function(rule, editMode, referenceRule, accountName, outgoing) {
	// always make sure we have the right rules container in case of multi-mbox
	this._rules = AjxDispatcher.run(outgoing ? "GetOutgoingFilterRules" : "GetFilterRules", accountName);
	this._outgoing = outgoing;
	this._rules.loadRules(); // make sure rules are loaded (for when we save)
	this._inputs = {};
	this._rule = rule || ZmFilterRule.getDummyRule();
	this._editMode = editMode;
	this._referenceRule = referenceRule;
	this.setTitle(editMode ? ZmMsg.editFilter : ZmMsg.addFilter);

	var nameField = Dwt.byId(this._nameInputId);
	var name = rule ? rule.name : null;
	nameField.value = name || "";

	var activeField = Dwt.byId(this._activeCheckboxId);
	activeField.checked = (!rule || rule.active);
	Dwt.setHandler(activeField, DwtEvent.ONCHANGE, AjxCallback.simpleClosure(this._activeChangeListener, this));

	var stopField = Dwt.byId(this._stopCheckboxId);
	stopField.checked = (!editMode);

	var checkAll = (rule && (rule.getGroupOp() == ZmFilterRule.GROUP_ALL));
	this._conditionSelect.setSelectedValue(checkAll ? ZmFilterRule.GROUP_ALL : ZmFilterRule.GROUP_ANY);

	this._conditionsTabGroup.removeAllMembers();
	this._actionsTabGroup.removeAllMembers();

	this._renderTable(this._rule, true, this._conditionsTableId, this._rule.conditions, this._conditionsTabGroup);	// conditions
	this._renderTable(this._rule, false, this._actionsTableId, this._rule.actions, this._actionsTabGroup);	// actions
	this._addDwtObjects();

	DwtDialog.prototype.popup.call(this);

	nameField.focus();
};

/**
 * Pops-down the dialog. Clears the conditions and actions table before popdown
 * so we don't keep adding to them.
 */
ZmFilterRuleDialog.prototype.popdown =
function() {
	this._clearTables();
	DwtDialog.prototype.popdown.call(this);
};

/**
 * Gets the tab group member.
 * 
 * @return	{DwtTabGroup}		the tab group
 */
ZmFilterRuleDialog.prototype.getTabGroupMember =
function() {
	return this._tabGroup;
};

/**
 * Gets the HTML that forms the basic framework of the dialog.
 * 
 * @private
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
	this._addConditionIconId = id+"_add_condition";
	this._addActionIconId = id+"_add_action";


	// content html
	return AjxTemplate.expand("prefs.Pages#MailFilterRule", id);
};

ZmFilterRuleDialog.prototype._createControls =
function() {
 this._stopFiltersCheckbox = new DwtCheckbox({parent: this, id: this._stopCheckboxId, checked: true});
 this._stopFiltersCheckbox.replaceElement(document.getElementById(this._stopCheckboxId));
 this._stopFiltersCheckbox.setText(ZmMsg.stopFilterProcessing);
};

ZmFilterRuleDialog.prototype._setConditionSelect =
function() {
	var message = new DwtMessageComposite(this);
	var callback = new AjxCallback(this, this._createConditionControl);
	message.setFormat(ZmMsg.filterCondition, callback);

	var conditionEl = Dwt.byId(this._htmlElId+"_condition");
	message.appendElement(conditionEl);
};

ZmFilterRuleDialog.prototype._createConditionControl =
function(parent, segment, i) {
	if (segment.getIndex() == 0) {
		var format = segment.getSegmentFormat();
		var limits = format.getLimits();
		var formats = format.getFormats();
		var values = [ZmFilterRule.GROUP_ANY, ZmFilterRule.GROUP_ALL];

		var select = this._conditionSelect = new DwtSelect({parent:parent, id: "FilterRuleGroupCondition_" + ZmFilterRuleDialog.CONDITIONS_INDEX++});
		for (var i = 0; i < values.length; i++) {
			// TODO: guard against badly specified message
			select.addOption(formats[i].toPattern(), i == 0, values[i]);
		};
		return select;
	}
};

ZmFilterRuleDialog.prototype._createTabGroup =
function() {
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
		var el = Dwt.byId(ids[i]);
		var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 5 - i;
		tabIndexes[tabIndex] = el;
	}

	// add other controls
	var el = Dwt.byId(this._conditionId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 4;
	tabIndexes[tabIndex] = this._conditionSelect;

	// add tabgroups that will hold the conditions and actions
	var el = Dwt.byId(this._conditionsTableId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 3;
	tabIndexes[tabIndex] = this._conditionsTabGroup;

	var el = Dwt.byId(this._actionsTableId);
	var tabIndex = el.getAttribute("tabindex") || MAX_VALUE - 2;
	tabIndexes[tabIndex] = this._actionsTabGroup;

	// add dialog buttons
	tabIndexes[MAX_VALUE - 1] = this.getButton(DwtDialog.OK_BUTTON);
	tabIndexes[MAX_VALUE] = this.getButton(DwtDialog.CANCEL_BUTTON);

	// populate tabgroup
	var keys = AjxUtil.keys(tabIndexes);
	keys.sort(AjxUtil.byNumber);
	for (var i = 0; i < keys.length; i++) {
		this._tabGroup.addMember(tabIndexes[keys[i]]);
	}
};

/**
 * Draws a table of conditions or actions. Returns the ID of the last row added.
 *
 * @param {ZmFilterRule}	rule			the source rule
 * @param {Boolean}			isCondition		if <code>true</code>, we're drawing conditions (as opposed to actions)
 * @param {String}			tableId			the DWT id representing the parent table
 * @param {Object}			rowData			the meta data used to figure out which DWT widget to create
 * @param {DwtTabGroup}		tabGroup		tab group for focus
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._renderTable =
function(rule, isCondition, tableId, rowData, tabGroup) {
	var table = Dwt.byId(tableId);
	var row;
	for (var i in rowData) {
		var data = rowData[i];
		if (isCondition && i == "condition") { continue; }

		// don't show action if it's disabled
		if (!isCondition) {
			var actionIndex = ZmFilterRule.A_VALUE_MAP[i];
			if (!ZmFilterRule.checkPreconditions(ZmFilterRule.ACTIONS[actionIndex]) && actionIndex != ZmFilterRule.A_FORWARD) { continue; }
		}

		for (j = 0; j < data.length; j++) {
			var rowId = Dwt.getNextId();
			this._enterTabScope(rowId);
			try {
				var html = this._getRowHtml(data[j], i, isCondition, rowId);
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
	}

	this._resetOperations(isCondition);

	return (row ? row.id : null);
};

/**
 * Gets the HTML for a single condition or action row.
 *
 * @param {Object}	data			an object containing meta info about the filter rule condition or action
 * @param {String}	test			the type of test condition (headerTest, sizeTest, bodyTest, etc)
 * @param {Boolean}	isCondition		if <code>true</code>, we're rendering a condition row
 * @param {String}	rowId			the unique ID representing this row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._getRowHtml =
function(data, test, isCondition, rowId) {
	var conf;
	if (isCondition) {
		conf = this._getConditionFromTest(test, data);
		if (!conf) {
			return ""; //see bug 85825 - encountered such a case if I had a socialcast filter before I removed socialcast code.
		}
	} else {
		var actionId = ZmFilterRule.A_VALUE_MAP[test];
		conf = ZmFilterRule.ACTIONS[actionId];
	}

	var html = [];
	var i = 0;

	this._inputs[rowId] = {};

	html[i++] = "<tr id='";
	html[i++] = rowId;
	html[i++] = "'>";

	if (isCondition) {
		this._inputs[rowId].isCondition = true;
		html[i++] = this._createRowComponent(true, "subject", ZmFilterRule.CONDITIONS_LIST, data, test, rowId);
		html[i++] = this._createRowComponent(conf, "subjectMod", conf.smOptions, data, test, rowId);
		html[i++] = this._createRowComponent(conf, "ops", conf.opsOptions, data, test, rowId);
		html[i++] = this._createRowComponent(conf, "value", conf.vOptions, data, test, rowId);
		html[i++] = this._createRowComponent(conf, "valueMod", conf.vmOptions, data, test, rowId);
		if (data && data.caseSensitive) {
			this._inputs[rowId]["caseSensitive"] = {value: data.caseSensitive}; //save case sensitive value if it exists
		}
	} else {
		if (test == ZmFilterRule.A_NAME_STOP) {
			var stopField = Dwt.byId(this._stopCheckboxId);
			stopField.checked = true;
			return;
		}
		html[i++] = "<td><table class='filterActions'><tr>";
		if (conf) {
			var options = this._outgoing ? ZmFilterRule.ACTIONS_OUTGOING_LIST : ZmFilterRule.ACTIONS_LIST;
			html[i++] = this._createRowComponent(false, "name", options, data, test, rowId);
			html[i++] = this._createRowComponent(conf, "param", conf.pOptions, data, test, rowId);
		}
		else {
		 //see if it's a actionReply or actionNotify filter and output readonly
			if (actionId == ZmFilterRule.A_NOTIFY && data) {
				var email = data.a;
				var content = AjxUtil.isArray(data.content) ?  data.content[0]._content : "";
				var maxBodySize = data.maxBodySize;
				var subject = data.su;

				html[i++] = "<td><table>";
				html[i++] = "<tr><td>" + ZmMsg.actionNotifyReadOnlyMsg + "</td></tr>";
				html[i++] = "<tr><td>" + ZmMsg.emailLabel + " " + email + " | " + subject + " | " + ZmMsg.maxBodySize + ": " + maxBodySize + "</td><tr>";
				html[i++] = "<tr><td>" + ZmMsg.body + ": " + content + "</td></tr></table></td>";
			}
			else if (actionId == ZmFilterRule.A_REPLY && data) {
				var content = AjxUtil.isArray(data.content) ? data.content[0]._content : "";
				html[i++] = "<td><table><tr><td>" + ZmMsg.actionReplyReadOnlyMsg + "</td></tr>";
				html[i++] = "<tr><td>" + ZmMsg.body + ": " + content + "</td></tr></table></td>";
			}
			this.setButtonEnabled(DwtDialog.OK_BUTTON, false);
		}
		html[i++] = "</tr></table></td>";
	}
	html[i++] = this._getRemoveButtonHtml(rowId, isCondition);
	html[i++] = "</tr>";

	return html.join("");
};

ZmFilterRuleDialog.prototype._getConditionFromTest =
function(test, data) {
	var condition;
	switch (test) {
		case ZmFilterRule.TEST_ADDRESS:
			condition = ZmFilterRule.C_ADDRESS_MAP[data.header];
			if (!condition) { // shouldn't get here
				condition = ZmFilterRule.C_ADDRESS;
			}
			break;
		case ZmFilterRule.TEST_HEADER_EXISTS:	        condition = ZmFilterRule.C_HEADER; break;
		case ZmFilterRule.TEST_SIZE:			        condition = ZmFilterRule.C_SIZE; break;
		case ZmFilterRule.TEST_DATE:			        condition = ZmFilterRule.C_DATE; break;
		case ZmFilterRule.TEST_BODY:			        condition = ZmFilterRule.C_BODY; break;
		case ZmFilterRule.TEST_ATTACHMENT:		        condition = ZmFilterRule.C_ATT; break;
		case ZmFilterRule.TEST_MIME_HEADER:		        condition = ZmFilterRule.C_MIME_HEADER; break;
		case ZmFilterRule.TEST_ADDRBOOK:		        condition = ZmFilterRule.C_ADDRBOOK; break;
		case ZmFilterRule.TEST_INVITE:			        condition = ZmFilterRule.C_INVITE; break;
		case ZmFilterRule.TEST_CONVERSATIONS:	        condition = ZmFilterRule.C_CONV; break;
		case ZmFilterRule.TEST_SOCIAL:			        condition = ZmFilterRule.C_SOCIAL; break;
		case ZmFilterRule.TEST_FACEBOOK:		        condition = ZmFilterRule.C_SOCIAL; break;
		case ZmFilterRule.TEST_TWITTER:			        condition = ZmFilterRule.C_SOCIAL; break;
		case ZmFilterRule.TEST_LINKEDIN:		        condition = ZmFilterRule.C_SOCIAL; break;
		case ZmFilterRule.TEST_COMMUNITY:		        condition = ZmFilterRule.C_COMMUNITY; break;
		case ZmFilterRule.TEST_COMMUNITY_REQUESTS:		condition = ZmFilterRule.C_COMMUNITY; break;
		case ZmFilterRule.TEST_COMMUNITY_CONTENT:		condition = ZmFilterRule.C_COMMUNITY; break;
		case ZmFilterRule.TEST_COMMUNITY_CONNECTIONS:   condition = ZmFilterRule.C_COMMUNITY; break;
		case ZmFilterRule.TEST_LIST:			        condition = ZmFilterRule.C_CONV; break;
		case ZmFilterRule.TEST_BULK:			        condition = ZmFilterRule.C_CONV; break;
		case ZmFilterRule.TEST_ME:				        condition = ZmFilterRule.C_ADDRBOOK; break;
		case ZmFilterRule.TEST_RANKING:			        condition = ZmFilterRule.C_ADDRBOOK; break;
		case ZmFilterRule.TEST_IMPORTANCE:		        condition = ZmFilterRule.C_CONV; break;
		case ZmFilterRule.TEST_FLAGGED:			        condition = ZmFilterRule.C_CONV; break;
		case ZmFilterRule.TEST_HEADER:
			condition = ZmFilterRule.C_HEADER_MAP[data.header];
			if (!condition) { // means custom header
				condition = ZmFilterRule.C_HEADER;
			}  
			break;
	}

	//TODO: find a better way to do this.  Preconditions for opsOptions?
	if (condition == ZmFilterRule.C_SOCIAL) {
		condition = ZmFilterRule.CONDITIONS[condition];
		condition.opsOptions = ZmFilterRule.getSocialFilters();
		return condition;
	}
	return (condition ? ZmFilterRule.CONDITIONS[condition] : null);
};

ZmFilterRuleDialog.prototype._enterTabScope =
function(id) {
	if (!this._tabScope) {
		this._tabScope = [];
	}
	var tabGroup = new DwtTabGroup(id || Dwt.getNextId());
	this._tabScope.push(tabGroup);
	return tabGroup;
};

ZmFilterRuleDialog.prototype._getCurrentTabScope =
function() {
	if (this._tabScope) {
		return this._tabScope[this._tabScope.length - 1];
	}
};

ZmFilterRuleDialog.prototype._exitTabScope =
function() {
	return this._tabScope ? this._tabScope.pop() : null;
};

/**
 * Adds a new condition or action row to its table.
 *
 * @param {Boolean}	isCondition	if <code>true</code>, we're adding a condition row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._addRow =
function(isCondition) {
	var rule = ZmFilterRule.getDummyRule();
	var tableId, data, tabGroup;
	if (isCondition) {
		tableId = this._conditionsTableId;
		data = rule.conditions;
		tabGroup = this._conditionsTabGroup;
	} else {
		tableId = this._actionsTableId;
		data = rule.actions;
		tabGroup = this._actionsTabGroup;
	}
	var newRowId = this._renderTable(rule, isCondition, tableId, data, tabGroup);
	this._addDwtObjects(newRowId);
};

/**
 * Removes a condition or action row from its table. Also cleans up any DWT
 * objects the row was using.
 *
 * @param {String}	rowId			the ID of the row to remove
 * @param {Boolean}	isCondition		if <code>true</code>, we're removing a condition row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._removeRow =
function(rowId, isCondition) {
	var row = Dwt.byId(rowId);
	if (!row) { return; }
		
	var table = Dwt.byId(isCondition ? this._conditionsTableId : this._actionsTableId);
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

/**
 * Creates an input widget and returns HTML for a table cell that will contain it.
 * The config for a condition or action is based on its main operator; for conditions
 * it's called subject ("from", "body", etc), and for actions it's just called the
 * action ("keep", "fileinto", etc). Each one of those has its own particular inputs.
 * This method creates one of those inputs.
 *
 * @param {Hash|Boolean}	conf		the config for this subject or action; boolean if rendering
 *										the actual subject or action (means "isCondition")
 * @param {String}			field		the name of the input field
 * @param {Array}			options		if the field type is a select, its options
 * @param {Object}			rowData		the current value of the field, if any
 * @param {String}			testType	the type of test condition (i.e. headerTest, attachmentTest, bodyTest, etc)
 * @param {String}			rowId		the ID of the containing row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._createRowComponent =
function(conf, field, options, rowData, testType, rowId) {
	var tabGroup = this._getCurrentTabScope();

	var isCondition, type;
	var isMainSelect = AjxUtil.isBoolean(conf);
	if (isMainSelect) {
		type = ZmFilterRule.TYPE_SELECT;
		isCondition = conf;
	} else {
		type = conf[field];
		if (!type) {
			return "<td></td>";
		}
	}

	var dataValue = this._getDataValue(isMainSelect, testType, field, rowData);

	var id = Dwt.getNextId();
	if (type == ZmFilterRule.TYPE_INPUT) {
		var inputFieldId = "FilterRuleDialog_INPUTFIELD_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var inputId = "FilterRuleDialog_INPUT_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var input = new DwtInputField({parent: this, type: DwtInputField.STRING, initialValue: dataValue, size: 20, id: inputFieldId, inputId: inputId});
		input.setData(ZmFilterRuleDialog.ROW_ID, rowId);
		this._inputs[rowId][field] = {id: id, dwtObj: input};
		tabGroup.addMember(input.getTabGroupMember());
	}
	else if (type == ZmFilterRule.TYPE_SELECT) {
		var selectId = "FilterRuleDialog_SELECT_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var select = new DwtSelect({parent:this, id: selectId});
		select.setData(ZmFilterRuleDialog.ROW_ID, rowId);
        select.fixedButtonWidth();
		this._inputs[rowId][field] = {id: id, dwtObj: select};
		if (isMainSelect) {
			select.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
			select.addChangeListener(this._rowChangeLstnr);
		} 
		else if (field == "ops") {
			if (testType == ZmFilterRule.TEST_HEADER) {
				select.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
				select.addChangeListener(this._opsChangeLstnr);
			}
			else if (testType == ZmFilterRule.TEST_ADDRBOOK || testType == ZmFilterRule.TEST_ME) {
				select.addChangeListener(this._addrBookChangeLstnr);
			}
		}
		else if (field == "value") {
			if (testType == ZmFilterRule.TEST_ADDRESS || testType == ZmFilterRule.TEST_ME)
			{
				select.setVisibility(false); //Don't show value "me" for address test 
			}
			else if (testType == ZmFilterRule.TEST_CONVERSATIONS || testType == ZmFilterRule.TEST_LIST  ||  testType == ZmFilterRule.TEST_BULK || testType == ZmFilterRule.TEST_IMPORTANCE || testType == ZmFilterRule.TEST_FLAGGED) {
				select.addChangeListener(this._importanceChangeLstnr);
			}
		}
		else if (field == "valueMod"){
			if (testType == ZmFilterRule.TEST_FLAGGED && (rowData.flagName == ZmFilterRule.READ || rowData.flagName == ZmFilterRule.PRIORITY)) {
				var valueSelect = this._inputs[rowId]["value"].dwtObj;
				var index = valueSelect.getIndexForValue(ZmFilterRule.IMPORTANCE);
				valueSelect.setSelected(index);
			}
			else if (testType == ZmFilterRule.TEST_CONVERSATIONS || testType == ZmFilterRule.TEST_LIST ||  testType == ZmFilterRule.TEST_BULK || testType == ZmFilterRule.TEST_FLAGGED) {
				select.setVisibility(false);
			}
		}
		
		for (var i = 0; i < options.length; i++) {
			var o = options[i];
			// skip if the action or this option is disabled
			var okay = ZmFilterRule.checkPreconditions(ZmFilterRule.CONDITIONS[o] || ZmFilterRule.ACTIONS[o] || o);
			if (!okay && (o !== ZmFilterRule.A_FORWARD || !rowData || !rowData.a)) {
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
			var selected = (dataValue && value && (value.toLowerCase() == dataValue.toLowerCase()));
			if (value && value.toLowerCase()== "bcc" && !this._outgoing && !selected) {
				continue;
			}
			select.addOption(new DwtSelectOptionData(value, label, selected));
		}
		if (!select.getValue()) {
			select.setSelected(0);
		}
		tabGroup.addMember(select.getTabGroupMember());
	}
	else if (type == ZmFilterRule.TYPE_CALENDAR) {
		// create button with calendar that hangs off menu
		var dateId = "FilterRuleDialog_DATE_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var dateButton = new DwtButton({parent:this, id: dateId});
		dateButton.setSize(ZmFilterRuleDialog.CHOOSER_BUTTON_WIDTH, Dwt.DEFAULT);
		var date, dateText;
		if (dataValue) {
			date = new Date(dataValue);
			dateText = AjxDateUtil.simpleComputeDateStr(date);
		} else {
			date = null;
			dateText = ZmMsg.chooseDate;
		}
		dateButton.setText(dateText);
		dateButton.setData(ZmFilterRuleDialog.DATA, date);
		var calId = "FilterRuleDialog_CAL_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var calMenu = new DwtMenu({parent:dateButton, style:DwtMenu.CALENDAR_PICKER_STYLE, id: calId});
		dateButton.setMenu(calMenu, true);
		var cal = new DwtCalendar({parent:calMenu});
		cal.setSkipNotifyOnPage(true);
		cal.addSelectionListener(this._dateLstnr);
		cal.setDate(date || new Date());
		cal._dateButton = dateButton;
		this._inputs[rowId][field] = {id: id, dwtObj: dateButton};
		tabGroup.addMember(dateButton.getTabGroupMember());
	}
	else if (type == ZmFilterRule.TYPE_FOLDER_PICKER || type == ZmFilterRule.TYPE_TAG_PICKER) {
		var buttonId = "FilterRuleDialog_BUTTON_" + ZmFilterRuleDialog.CONDITIONS_INDEX++;
		var button = new DwtButton({parent:this, id: buttonId});
		var organizer;
		if (dataValue) {
			if (type == ZmFilterRule.TYPE_FOLDER_PICKER) {
				var folderTree = appCtxt.getFolderTree();
				if (folderTree) {
					dataValue = (dataValue.charAt(0) == '/') ? dataValue.substring(1) : dataValue;
					organizer = folderTree.getByPath(dataValue, true);
				}
			} else {
				var tagTree = appCtxt.getTagTree();
				if (tagTree) {
					organizer = tagTree.getByName(dataValue);
				}
			}
		}
		var	text = organizer ? AjxStringUtil.htmlEncode(organizer.getName(false, null, true)) : ZmMsg.browse;
		button.setText(text);
		button.addClassName("ZmFilterBrowse");
		button.setData(ZmFilterRuleDialog.BROWSE_TYPE, type);
		button.setData(ZmFilterRuleDialog.DATA, dataValue);
		this._inputs[rowId][field] = {id: id, dwtObj: button};
		button.addSelectionListener(this._browseLstnr);
		tabGroup.addMember(button.getTabGroupMember());
	}

	return "<td id='" + id + "'></td>";
};

ZmFilterRuleDialog.prototype._getDataValue =
function(isMainSelect, testType, field, rowData) {
	var dataValue;
	if (isMainSelect) {
		switch (testType) {
		case ZmFilterRule.TEST_HEADER:
			dataValue = ZmFilterRule.C_HEADER_MAP[rowData.header];
			if (!dataValue) { // means custom header
				dataValue = ZmFilterRule.C_HEADER;
			}
			break;
			case ZmFilterRule.TEST_HEADER_EXISTS:	        dataValue = ZmFilterRule.C_HEADER; break;
			case ZmFilterRule.TEST_SIZE:			        dataValue = ZmFilterRule.C_SIZE; break;
			case ZmFilterRule.TEST_DATE:			        dataValue = ZmFilterRule.C_DATE; break;
			case ZmFilterRule.TEST_BODY:			        dataValue = ZmFilterRule.C_BODY; break;
			case ZmFilterRule.TEST_ATTACHMENT:		        dataValue = ZmFilterRule.C_ATT; break;
			case ZmFilterRule.TEST_MIME_HEADER:		        dataValue = ZmFilterRule.C_MIME_HEADER; break;
			case ZmFilterRule.TEST_ADDRBOOK:		        dataValue = ZmFilterRule.C_ADDRBOOK; break;
			case ZmFilterRule.TEST_INVITE:			        dataValue = ZmFilterRule.C_INVITE; break;
			case ZmFilterRule.TEST_CONVERSATIONS:	        dataValue = ZmFilterRule.C_CONV; break;
			case ZmFilterRule.TEST_SOCIAL:			        dataValue = ZmFilterRule.C_SOCIAL; break;
			case ZmFilterRule.TEST_FACEBOOK:		        dataValue = ZmFilterRule.C_SOCIAL; break;
			case ZmFilterRule.TEST_TWITTER:			        dataValue = ZmFilterRule.C_SOCIAL; break;
			case ZmFilterRule.TEST_LINKEDIN:		        dataValue = ZmFilterRule.C_SOCIAL; break;
			case ZmFilterRule.TEST_COMMUNITY:		        dataValue = ZmFilterRule.C_COMMUNITY; break;
			case ZmFilterRule.TEST_COMMUNITY_REQUESTS:		dataValue = ZmFilterRule.C_COMMUNITY; break;
			case ZmFilterRule.TEST_COMMUNITY_CONTENT:		dataValue = ZmFilterRule.C_COMMUNITY; break;
			case ZmFilterRule.TEST_COMMUNITY_CONNECTIONS:   dataValue = ZmFilterRule.C_COMMUNITY; break;
			case ZmFilterRule.TEST_ADDRESS:
				dataValue = ZmFilterRule.C_ADDRESS_MAP[rowData.header];
				if (!dataValue) { 
					dataValue = ZmFilterRule.C_ADDRESS;
				}
				break;
			case ZmFilterRule.TEST_LIST:			        dataValue = ZmFilterRule.C_CONV; break;
			case ZmFilterRule.TEST_BULK:			        dataValue = ZmFilterRule.C_CONV; break;
			case ZmFilterRule.TEST_ME:				        dataValue = ZmFilterRule.C_ADDRBOOK; break;
			case ZmFilterRule.TEST_RANKING:			        dataValue = ZmFilterRule.C_ADDRBOOK; break;
			case ZmFilterRule.TEST_IMPORTANCE:		        dataValue = ZmFilterRule.C_CONV; break;
			case ZmFilterRule.TEST_FLAGGED:			        dataValue = ZmFilterRule.C_CONV; break;
			// default returns action type
			default:								return ZmFilterRule.A_VALUE_MAP[testType];
		}
	} else {
		// conditions
		if (testType == ZmFilterRule.TEST_HEADER) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = ZmFilterRule.OP_VALUE_MAP[rowData.stringComparison] == ZmFilterRule.OP_IS_READRECEIPT ? ZmFilterRule.OP_CONTAINS : 
						ZmFilterRule.OP_VALUE_MAP[rowData.stringComparison];
				if (dataValue && rowData.negative == "1") {
					dataValue = ZmFilterRule.getNegativeComparator(dataValue);
				}
			} else if (field == "value") {
				dataValue = rowData.value;
			}
		}
		else if (testType == ZmFilterRule.TEST_HEADER_EXISTS) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_EXISTS
					: ZmFilterRule.OP_EXISTS;
			} else if (field == "value") {
				dataValue = rowData.value;
			}
		}
		else if (testType == ZmFilterRule.TEST_SIZE) {
			if (field == "ops") {
				dataValue = ZmFilterRule.OP_VALUE_MAP[rowData.numberComparison];
				if (dataValue && rowData.negative == "1") {
					dataValue = ZmFilterRule.getNegativeComparator(dataValue);
				}
			} else if (field == "valueMod") {
				var m = rowData.s ? rowData.s.match(/(\d+)([A-Z]*)/) : null;
				dataValue = m ? ((!m[2]) ? "B" : m[2]) : null;
			} else if (field == "value") {
				dataValue = rowData.s ? rowData.s.match(/(\d+)/)[0] : null;
			}
		}
		else if (testType == ZmFilterRule.TEST_DATE) {
			if (field == "ops") {
				dataValue = ZmFilterRule.OP_VALUE_MAP[rowData.dateComparison];
				if (dataValue && rowData.negative == "1") {
					dataValue = ZmFilterRule.getNegativeComparator(dataValue);
				}
			} else if (field == "value") {
				dataValue = rowData.d * 1000;
			}
		}
		else if (testType == ZmFilterRule.TEST_BODY) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONTAINS
					: ZmFilterRule.OP_CONTAINS;
			} else if (field == "value") {
				dataValue = rowData.value;
			}
		}
		else if (testType == ZmFilterRule.TEST_ATTACHMENT) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_EXISTS
					: ZmFilterRule.OP_EXISTS;
			}
		}
		else if (testType == ZmFilterRule.TEST_LIST) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONV
					: ZmFilterRule.OP_CONV_IS;
			}
			else if (field == "value") {
				dataValue = ZmFilterRule.C_LIST;
			}
		}
		else if (testType == ZmFilterRule.TEST_BULK) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONV
					: ZmFilterRule.OP_CONV_IS;
			}
			else if (field == "value") {
				dataValue = ZmFilterRule.C_BULK;
			}
		}
		else if (testType == ZmFilterRule.TEST_CONVERSATIONS) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONV
					: ZmFilterRule.OP_CONV_IS;	
			}
			else if (field == "value") {
				dataValue = rowData.where;
			}
		}
		else if (testType == ZmFilterRule.TEST_IMPORTANCE) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONV
					: ZmFilterRule.OP_CONV_IS;	
			}
			else if (field == "value") {
				dataValue = ZmFilterRule.IMPORTANCE;
			}
			else if (field == "valueMod") {
				dataValue = rowData.imp;
			}
		}
		else if (testType == ZmFilterRule.TEST_FLAGGED) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_CONV
					: ZmFilterRule.OP_CONV_IS;	
			}
			else if (field == "value") {
				dataValue = ZmFilterRule.FLAGGED;	
			}
			else if (field == "valueMod") {
				dataValue = rowData.flagName;
			}
		}
		else if (testType == ZmFilterRule.TEST_FACEBOOK) {
			dataValue = ZmFilterRule.OP_SOCIAL_FACEBOOK;
		}
		else if (testType == ZmFilterRule.TEST_TWITTER) {
			dataValue = ZmFilterRule.OP_SOCIAL_TWITTER;
		}
		else if (testType == ZmFilterRule.TEST_LINKEDIN) {
			dataValue = ZmFilterRule.OP_SOCIAL_LINKEDIN;
		}
		else if (testType == ZmFilterRule.TEST_INVITE) {
			if (field == "ops") {
				var isRequested = ZmFilterRule.OP_VALUE[ZmFilterRule.OP_IS_REQUESTED];
				var tmpValue = rowData.method && rowData.method[0]._content;
				if (rowData.negative!=1) {
					dataValue = (isRequested == tmpValue)
					? ZmFilterRule.OP_IS_REQUESTED
					: ZmFilterRule.OP_IS_REPLIED;
				}else {
					dataValue = (isRequested == tmpValue)
					? ZmFilterRule.OP_NOT_REQUESTED
					: ZmFilterRule.OP_NOT_REPLIED;
				}
			}
		}
		else if (testType == ZmFilterRule.TEST_ADDRBOOK) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_IN
					: ZmFilterRule.OP_IN;
			} else if (field == "value") {
				dataValue = rowData.type;
			}
		}
		else if (testType == ZmFilterRule.TEST_ADDRESS) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = ZmFilterRule.OP_VALUE_MAP[rowData.stringComparison] == ZmFilterRule.OP_IS_READRECEIPT ? ZmFilterRule.OP_CONTAINS : 
				ZmFilterRule.OP_VALUE_MAP[rowData.stringComparison];
				if (dataValue && rowData.negative == "1") {
					dataValue = ZmFilterRule.getNegativeComparator(dataValue);
				}						
			} else if (field == "value") {
				dataValue = rowData.value;
			} else if (field == "valueMod") {
				dataValue = rowData.part;
			}
		}
		else if (testType == ZmFilterRule.TEST_ME) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = (rowData.negative == "1")
							? ZmFilterRule.OP_NOT_ME
							: ZmFilterRule.OP_IS_ME;						
			} else if (field == "value") {
				dataValue = rowData.value;
			}
		}
		else if (testType == ZmFilterRule.TEST_RANKING) {
			if (field == "subjectMod") {
				dataValue = rowData.header;
			} else if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_IN
					: ZmFilterRule.OP_IN;
			} else if (field == "value") {
				dataValue = ZmFilterRule.RANKING;
			}
		}
		else if (testType == ZmFilterRule.TEST_MIME_HEADER) {
			if (field == "ops") {
				dataValue = (rowData.negative == "1")
					? ZmFilterRule.OP_NOT_READRECEIPT
					: ZmFilterRule.OP_IS_READRECEIPT;
			}
		}
		// actions
		else if (testType == ZmFilterRule.A_NAME_FOLDER) {
			dataValue = rowData.folderPath;
		}
		else if (testType == ZmFilterRule.A_NAME_FLAG) {
			dataValue = rowData.flagName;
		}
		else if (testType == ZmFilterRule.A_NAME_TAG) {
			dataValue = rowData.tagName;
		}
		else if (testType == ZmFilterRule.A_NAME_FORWARD) {
			dataValue = rowData.a;
		}
		else if (ZmFilterRule.OP_COMMUNITY_MAP_R[testType]) {
			dataValue = ZmFilterRule.OP_COMMUNITY_MAP_R[testType];
		}
	}

	return dataValue;
};

/**
 * Returns HTML for the close buttons at the end of each row.
 *
 * @param {String}	rowId			the ID of the row that gets the buttons
 * @param {Boolean}	isCondition		the <code>true</code>, we're adding them to a condition row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._getRemoveButtonHtml =
function(rowId, isCondition) {
	var tabGroup = this._getCurrentTabScope();
	var html = [];
	var j = 0;
	html[j++] = "<td width='1%'><table class='ZmFilterRemoveButtons'><tr>";
		var button = new DwtButton({parent:this});
		button.setImage("Remove");
		button.setData(ZmFilterRuleDialog.ROW_ID, rowId);
		button.setData(ZmFilterRuleDialog.IS_CONDITION, isCondition);
		button.addSelectionListener(this._removeLstnr);
		var id = Dwt.getNextId("TEST_");
		this._inputs[rowId]["Remove"] = {id: id, dwtObj: button};
		html[j++] = "<td id='";
		html[j++] = id;
		html[j++] = "'></td>";
		tabGroup.addMember(button);
	html[j++] = "</tr></table></td>";
	return html.join("");
};

/**
 * If there's only one row, disable its Remove button (since removing it would
 * leave the user with nothing).
 *
 * @param {Boolean}	isCondition	if <code>true</code>, we're checking a condition row
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._resetOperations =
function(isCondition) {
	var tableId = isCondition ? this._conditionsTableId : this._actionsTableId;
	var table = Dwt.byId(tableId);
	var rows = table.rows;
	if (!(rows && rows.length)) { return; }

	var input = this._inputs[rows[0].id];
	if (input) {
		var removeButton = input["Remove"].dwtObj;
		if (rows.length == 1) {
			removeButton.setEnabled(false);
		} else {
			removeButton.setEnabled(true);
		}
	}
};

/**
 * Update the inputs for a row based on the subject (condition), or action name.
 * The old row is removed, and a new row is created and inserted.
 *
 * @param {DwtEvent}	ev		the event (from {@link DwtSelect})
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._rowChangeListener =
function(ev) {
	var newValue = ev._args.newValue;
	var oldValue = ev._args.oldValue;
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var isCondition = ev._args.selectObj.getData(ZmFilterRuleDialog.IS_CONDITION);
	var tabGroup = isCondition ? this._conditionsTabGroup : this._actionsTabGroup;

	// preserve op and value between header fields
	var comparator, dataValue;
	if (isCondition && (ZmFilterRule.IS_HEADER[oldValue] && ZmFilterRule.IS_HEADER[newValue])) {
		comparator = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "ops");
		dataValue = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "value");
	}
	else if (isCondition && (ZmFilterRule.IS_ADDRESS[oldValue] && ZmFilterRule.IS_ADDRESS[newValue])) {
		comparator = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "ops");
		dataValue = this._getInputValue(this._inputs[rowId], ZmFilterRule.CONDITIONS[oldValue], "value");
	}
		
	var row = Dwt.byId(rowId);
	var index = this._getIndexForRow(row, isCondition);
	var table = Dwt.byId(isCondition ? this._conditionsTableId : this._actionsTableId);
	this._removeDwtObjects(rowId);
	table.deleteRow(index);
	var newIndex = (index >= table.rows.length) ? null : index; // null means add to end

	var test, data, subjectMod;
	if (isCondition) {
		test = ZmFilterRule.C_TEST_MAP[newValue];
		if (test == ZmFilterRule.TEST_HEADER) {
			subjectMod = ZmFilterRule.C_HEADER_VALUE[newValue];
		}
		else if (test == ZmFilterRule.TEST_ADDRESS) {
			subjectMod = ZmFilterRule.C_ADDRESS_VALUE[newValue];
		}
		data = ZmFilterRule.getConditionData(test, comparator, dataValue, subjectMod);
	} else {
		test = ZmFilterRule.A_VALUE[newValue];
		data = ZmFilterRule.getActionData(test);
	}

	this._enterTabScope(rowId);
	try {
		var html = this._getRowHtml(data, test, isCondition, rowId);
		if (html) {
			row = Dwt.parseHtmlFragment(html, true);
			if (!row) {
				DBG.println(AjxDebug.DBG1, "Filter rule dialog: no row created!");
				return;
			}
			table.tBodies[0].insertBefore(row, (newIndex != null) ? table.rows[newIndex] : null);
			this._addDwtObjects(row.id);
			this._resetOperations(isCondition);
			tabGroup.removeMember(DwtTabGroup.getByName(rowId));
			tabGroup.addMember(this._getCurrentTabScope());
		}
	}
	finally {
		this._exitTabScope();
	}
};

/**
 * For the "Header Named" input only - hide the last input field (value) if the
 * selected op is "exists" or "does not exist", since those are unary ops which
 * don't take a value.
 *
 * @param {DwtEvent}	ev		the event (from {@link DwtSelect})
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._opsChangeListener =
function(ev) {
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var input = this._inputs[rowId];
	if (!input) { return; }
	var newValue = ev._args.newValue;
	input["value"].dwtObj.setVisibility(!(newValue == ZmFilterRule.OP_EXISTS || newValue == ZmFilterRule.OP_NOT_EXISTS));
};

ZmFilterRuleDialog.prototype._addrBookChangeListener =
function(ev) {
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var input = this._inputs[rowId];
	if (!input && !input["ops"] && !input["ops"].dwtObj) {
		return;
	}
	var value = input["ops"].dwtObj.getValue();
	if (value == ZmFilterRule.OP_IS_ME || value == ZmFilterRule.OP_NOT_ME) {
		input["value"].dwtObj.setVisibility(false);
	}
	else {
		input["value"].dwtObj.setVisibility(true);
	}
};

ZmFilterRuleDialog.prototype._importanceChangeListener = 
function(ev) {
	var rowId = ev._args.selectObj.getData(ZmFilterRuleDialog.ROW_ID);
	var input = this._inputs[rowId];
	if (!input && !input["value"] && !input["value"].dwtObj) {
		return;
	}
	var value = input["value"].dwtObj.getValue();
	if (value == ZmFilterRule.IMPORTANCE) {
		input["valueMod"].dwtObj.setVisibility(true);
	}
	else {
		input["valueMod"].dwtObj.setVisibility(false);
	}		
};

/**
 * Updates the calendar button text with a date that's just been selected.
 *
 * @param {DwtEvent}	ev		the event (from {@link DwtCalendar})
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._dateListener =
function(ev) {
	var cal = ev.item;
	if (!cal._dateButton) { return; }
	var date = ev.detail;
	var button = cal._dateButton;
	button.setText(AjxDateUtil.simpleComputeDateStr(date));
	button.setData(ZmFilterRuleDialog.DATA, date);
};

/**
 * Adds a condition/action row.
 *
 * @param {DwtEvent}	ev		the event
 *
 * @private
 */
ZmFilterRuleDialog.prototype._plusListener =
function(isCondition) {
	this._addRow(isCondition);
	this._resetOperations(isCondition);
};

/**
 * Removes a condition/action row.
 *
 * @param {DwtEvent}	ev		the event
 *
 * @private
 */
ZmFilterRuleDialog.prototype._removeListener =
function(ev) {
	var button = ev.item;
	var isCondition = button.getData(ZmFilterRuleDialog.IS_CONDITION);
	var rowId = button.getData(ZmFilterRuleDialog.ROW_ID);
	this._removeRow(rowId, isCondition);
	this._resetOperations(isCondition);
};

/**
 * Pops up one of two dialogs, for choosing a folder or a tag.
 * 
 * @param {DwtEvent}	ev		the event
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._browseListener =
function(ev) {
	var type = ev.item.getData(ZmFilterRuleDialog.BROWSE_TYPE);
	var isFolder = (type == ZmFilterRule.TYPE_FOLDER_PICKER);
	var dialog = isFolder ? appCtxt.getChooseFolderDialog(ZmApp.MAIL) : appCtxt.getPickTagDialog();
	var overviewId = isFolder ? dialog.getOverviewId(ZmApp.MAIL) : null;
	if (appCtxt.multiAccounts) {
		overviewId = [overviewId, "-", appCtxt.getActiveAccount().name, this.toString()].join("");
	}

	dialog.reset();
	dialog.setTitle((type == ZmFilterRule.TYPE_FOLDER_PICKER) ? ZmMsg.chooseFolder : ZmMsg.chooseTag);
	dialog.registerCallback(DwtDialog.OK_BUTTON, this._browseSelectionCallback, this, [ev.item, dialog]);
	dialog.popup({overviewId:overviewId, appName:ZmApp.MAIL, forceSingle:true});
};

/**
 * Changes the text of a button to the folder/tag that the user just chose.
 *
 * @param	{DwtButton}		button		the browse button
 * @param	{ZmDialog}		dialog		the folder or tag dialog that is popped up
 * @param	{ZmOrganizer}	organizer	the folder or tag that was chosen
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._browseSelectionCallback =
function(button, dialog, organizer) {
	var type = button.getData(ZmFilterRuleDialog.BROWSE_TYPE);
	var isFolder = (type == ZmFilterRule.TYPE_FOLDER_PICKER);
	if (organizer) {
		// Bug 24425, don't allow root folder selection
		if (isFolder && organizer.nId == ZmFolder.ID_ROOT) { return; }

		button.setText(AjxStringUtil.htmlEncode(organizer.getName(false, null, true)));
		var value = isFolder
			? organizer.getPath(false, false, null, true, true)
			: organizer.getName(false, null, true);
		button.setData(ZmFilterRuleDialog.DATA, value);
	}
	dialog.popdown();
};

/**
 * If "save to sent" is disabled and we're an outgoing filter and the user chose to active the filter, display a warning with the option to turn the setting on
 *
 * @param {DwtEvent}	ev		the event
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._activeChangeListener =
function(ev) {
	if (this._outgoing) {
		var target = DwtUiEvent.getTarget(ev);
		var active = target.checked;
		var cancelCallback = new AjxCallback(this, function(){target.checked = false;});
		if (active) {
			var outgoingFilterController = ZmPreferencesApp.getFilterRulesController(this._outgoing);
			if (outgoingFilterContrller) {
				outgoingFilterController.handleBeforeFilterChange(null, cancelCallback);
			}
		}
	}
};

/**
 * Attaches input widgets to the DOM tree based on placeholder IDs.
 *
 * @param {String}	rowId	the ID of a single row to add inputs to
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._addDwtObjects =
function(rowId) {
	for (var id in this._inputs) {
		if (rowId && (id != rowId)) { continue; }
		var row = this._inputs[id];
		for (var f in row) {
			var field = row[f];
			var el = (field.id && field.dwtObj) ? field.dwtObj.getHtmlElement() : null;
			if (el) {
				el.parentNode.removeChild(el);
				Dwt.byId(field.id).appendChild(el);
				el._rowId = id;
			}
		}
	}
};

/**
 * Destroys input widgets.
 *
 * @param {String}	rowId		the ID of a single row to clean up
 * 
 * @private
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

ZmFilterRuleDialog.prototype._cancelButtonListener =
function(ev) {
	var filterRulesController = ZmPreferencesApp.getFilterRulesController(this._outgoing);
	if (filterRulesController) {
		//get index before loading rules to keep selection on cancel
		var sel = filterRulesController.getListView() ? filterRulesController.getListView().getSelection()[0] : null;
		var index = sel ? this._rules.getIndexOfRule(sel) : null;
		var callback = new AjxCallback(this, this._handleResponseLoadRules, [index]);
		this._rules.loadRules(true, callback);
	}
	this.popdown();
};

ZmFilterRuleDialog.prototype._handleResponseLoadRules =
function(index) {
	var filterRulesController = ZmPreferencesApp.getFilterRulesController(this._outgoing);
	if (filterRulesController) {
		filterRulesController.resetListView(index);
	}
};

/**
 * Saves the newly created/edited rule.
 *
 * @param {DwtEvent}	ev		the event
 */
ZmFilterRuleDialog.prototype._okButtonListener =
function(ev) {

	var rule = this._rule;
	var msg = null;
	var name = Dwt.byId(this._nameInputId).value;
	name = name.replace (/\s*$/,'');
	name = name.replace (/^\s*/,'');
	if (!name) {
		msg = ZmMsg.filterErrorNoName;
	}

	var rule1 = this._rules.getRuleByName(name);
	if ( rule1 && (rule1 != rule))  {
		msg = ZmMsg.filterErrorNameExists;
	}
	if (msg) {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return;
	}

	var active = Dwt.byId(this._activeCheckboxId).checked;
	var anyAll = this._conditionSelect.getValue();

	// adding a rule always starts with dummy

	if (this._editMode) {
		var cachedRule = {
			name: rule.name,
			active: rule.active,
			conditions: rule.conditions,
			actions: rule.actions
		};

		rule.name = name;
		rule.active = active;
		rule.clearConditions();
		rule.clearActions();
	} else {
		rule = new ZmFilterRule(name, active);
	}
	rule.setGroupOp(anyAll);

	// get input from tables so order is preserved
	var table = Dwt.byId(this._conditionsTableId);
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++) {
		var c = this._getConditionFromRow(rows[i].id);
		if (msg = this._checkCondition(c)) {
			break;
		} else {
			rule.addCondition(c.testType, c.comparator, c.value, c.subjectMod, c.caseSensitive);
		}
	}
	if (!msg) {
		table = Dwt.byId(this._actionsTableId);
		rows = table.rows;
		for (var i = 0; i < rows.length; i++) {
			var action = this._getActionFromRow(rows[i].id);
			if (msg = this._checkAction(action)) {
				break;
			}
			rule.addAction(action.actionType, action.value);
		}
	}

	if (msg) {
		// bug #35912 - restore values from cached rule
		if (cachedRule) {
			rule.name = cachedRule.name;
			rule.active = cachedRule.active;
			rule.conditions = cachedRule.conditions;
			rule.actions = cachedRule.actions;
		}

		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return;
	}

	var stopAction = Dwt.byId(this._stopCheckboxId).checked;
	if (stopAction) {
		rule.addAction(ZmFilterRule.A_STOP);
	}

	var respCallback = new AjxCallback(this, this._handleResponseOkButtonListener);
	if (this._editMode) {
		this._rules._saveRules(this._rules.getIndexOfRule(rule), true, respCallback);
	} else {
		this._rules.addRule(rule, this._referenceRule, respCallback);
	}
};

ZmFilterRuleDialog.prototype._handleResponseOkButtonListener =
function() {
	this.popdown();
};

/**
 * Creates an Object based on the values of a condition row.
 *
 * @param {String}	rowId	the row ID
 * 
 * @private
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
	var testType = ZmFilterRule.C_TEST_MAP[subject];
	var caseSensitive = null;

	if (testType == ZmFilterRule.TEST_HEADER) {
		if (subject == ZmFilterRule.C_HEADER &&
			(comparator == ZmFilterRule.OP_EXISTS ||
			 comparator == ZmFilterRule.OP_NOT_EXISTS))
		{
			testType = ZmFilterRule.TEST_HEADER_EXISTS;
		}
		else {
			if (subject != ZmFilterRule.C_HEADER) {
				subjectMod = ZmFilterRule.C_HEADER_VALUE[subject];
			}
		}
	}
	else if (testType == ZmFilterRule.TEST_ADDRESS && subject) {
		subjectMod = ZmFilterRule.C_ADDRESS_VALUE[subject];
		value += ";" + valueMod;   //addressTest has value=email part=all|domain|localpart
	}
	else if (testType == ZmFilterRule.TEST_SIZE && valueMod && valueMod != "B") {
		value += valueMod;
	}
	// MIME header currently supports ZmMimeTable.MSG_READ_RECEIPT only.
	else if (testType == ZmFilterRule.TEST_MIME_HEADER) {
		subjectMod = "Content-Type";
		value = ZmMimeTable.MSG_READ_RECEIPT;
	}
	else if (testType == ZmFilterRule.TEST_ADDRESS) {
		value += ";" + valueMod;   //addressTest has value=email part=all|domain|localpart
	}
	else if (testType == ZmFilterRule.TEST_CONVERSATIONS && value == ZmFilterRule.IMPORTANCE) {
		value = valueMod;  //importanceTest
	}
		
	if (testType == ZmFilterRule.TEST_HEADER || testType == ZmFilterRule.TEST_MIME_HEADER || testType == ZmFilterRule.TEST_ADDRESS) {
		caseSensitive = inputs["caseSensitive"] ? inputs["caseSensitive"].value : null;	
	}

	return { testType:testType, comparator:comparator, value:value, subjectMod:subjectMod, caseSensitive:caseSensitive, subject: subject };
};

/**
 * Returns an Object based on the values of an action row.
 *
 * @param {String}	rowId	the row ID
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._getActionFromRow =
function(rowId) {
	var inputs = this._inputs[rowId];
	var name = inputs.name.dwtObj.getValue();
	var conf = ZmFilterRule.ACTIONS[name];
	var value = this._getInputValue(inputs, conf, "param");

	return {actionType:name, value:value};
};

/**
 * Retrieves the value of an input based on what type it is. For all but text
 * inputs, we can get it from a DWT object.
 *
 * @param {Object}	inputs		the the inputs for one row
 * @param {Object}	conf		the config info for this row's subject or action name
 * @param {String}	field		the current input field
 * 
 * @private
 */
ZmFilterRuleDialog.prototype._getInputValue =
function(inputs, conf, field) {
	var type = conf[field];
	if (!type) {
		return null;
	}
	if (type == ZmFilterRule.TYPE_INPUT) {
		return inputs[field].dwtObj.getValue();
	}
	if (type == ZmFilterRule.TYPE_SELECT) {
		return inputs[field].dwtObj.getValue();
	}
	if (type == ZmFilterRule.TYPE_CALENDAR) {
		var date = inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
		if (!date) {
			return null;
		}
		return String(date.getTime() / 1000);
	}
	if (type == ZmFilterRule.TYPE_FOLDER_PICKER) {
		return inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
	}
	if (type == ZmFilterRule.TYPE_TAG_PICKER) {
		return inputs[field].dwtObj.getData(ZmFilterRuleDialog.DATA);
	}
};

/**
* Given a row, returns its index in its containing table.
*
* @param row			[element]	a table row (TR)
* @param isCondition	[boolean]	true if the row is a condition row
* 
* @private
*/
ZmFilterRuleDialog.prototype._getIndexForRow =
function(row, isCondition) {
	var table = Dwt.byId(isCondition ? this._conditionsTableId : this._actionsTableId);
	var rows = table.rows;
	for (var i = 0; i < rows.length; i++) {
		if (rows[i] == row) { return i; }
	}

	return null;
};

/**
* Buses tables, hopes to make it big in movies some day.
* 
* @private
*/
ZmFilterRuleDialog.prototype._clearTables =
function() {
	var list = [this._conditionsTableId, this._actionsTableId];
	for (var i = 0; i < list.length; i++) {
		var table = Dwt.byId(list[i]);
		var tbody = table.tBodies[0];
		while (tbody.firstChild != null) {
			this._removeDwtObjects(tbody.firstChild.id);
			tbody.removeChild(tbody.firstChild);
		}
	}
};

/**
* Returns false if the condition has the necessary parts, an error message otherwise.
*
* @param condition	[Object]	condition
* 
* @private
*/
ZmFilterRuleDialog.prototype._checkCondition =
function(condition) {
	var conf = ZmFilterRule.CONDITIONS[condition.subject];
	for (var f in conf) {
		var key = ZmFilterRule.CONDITIONS_KEY[f];
		if (!key) { continue; }
		if ((key == "value") && (condition.subject == ZmFilterRule.C_HEADER) &&
			(condition.comparator == ZmFilterRule.OP_EXISTS || condition.comparator == ZmFilterRule.OP_NOT_EXISTS)) {
			continue; // "Header Named" with "exists" doesn't take a value
		}
		if (conf[f] && !condition[key]) {
			return this._conditionErrorFormatter.format([ZmFilterRule.C_LABEL[condition.subject]]);
		}
	}
};

/**
* Returns true if the action has the necessary parts, an error message otherwise.
*
* @param action	[Object]	action
*/
ZmFilterRuleDialog.prototype._checkAction =
function(action) {
	var conf = ZmFilterRule.ACTIONS[action.actionType];
	if (conf.param && !action.value) {
		return this._actionErrorFormatter.format([ZmFilterRule.A_LABEL[action.actionType]]);
	}
	if (conf.validationFunction && !conf.validationFunction(action.value)) {
		return conf.errorMessage;
	}
};

ZmFilterRuleDialog.prototype.isEditMode =
function() {
	return this._editMode;
};
