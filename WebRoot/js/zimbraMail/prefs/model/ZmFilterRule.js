/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates an empty filter rule. Conditions and actions will need to be added.
* @constructor
* @class
* ZmFilterRule represents a filter rule. A rule includes one or more conditions
* and one or more actions.
*
* @author Conrad Damon
*
* @param name	[string]*	rule name
* @param active	[boolean]*	true if the rule is enabled
*/
function ZmFilterRule(name, active) {
	this.name = name;
	this.groupOp = ZmFilterRule.GROUP_ANY;
	this.actions = [];
	this.conditions = [];
	this.active = (active !== false);
	this.id = ZmFilterRule._nextId++;
}

ZmFilterRule._nextId = 1;

ZmFilterRule.GROUP_ANY = "anyof";
ZmFilterRule.GROUP_ALL = "allof";

// Display widgets for various rule properties
var i = 1;
ZmFilterRule.TYPE_INPUT			= i++;
ZmFilterRule.TYPE_SELECT		= i++;
ZmFilterRule.TYPE_CALENDAR		= i++;
ZmFilterRule.TYPE_FOLDER_PICKER	= i++;
ZmFilterRule.TYPE_TAG_PICKER	= i++;

// commonly used lists
ZmFilterRule.MATCHING_OPS = [{label: ZmMsg.is, value: ":is"}, {label: ZmMsg.notIs, value: "not :is"},
							 {label: ZmMsg.contains, value: ":contains"}, {label: ZmMsg.notContain, value: "not :contains"},
							 {label: ZmMsg.matches, value: ":matches"}, {label: ZmMsg.notMatch, value: "not :matches"}];
ZmFilterRule.ADDR_OPTIONS = [{label: ZmMsg.entireAddress, value: ":all"}, {label: ZmMsg.localPart, value: ":localpart"},
							 {label: ZmMsg.domainPart, value: ":domain"}];
							  
/*
* Conditions
*
* The key is also known as the condition's "subject". It is the field of an email message that 
* the condition is tested against.
*
* label			Text to show in dialog for the condition's subject
* subjectMod	Type of input widget for the subjectModifier, which is a specifier or 
*				modifier for the subject (such as which address to look at)
* smOptions		List of possible values for the subjectModifier (SELECT type)
* ops			Type of input widget for choosing the comparator
* opsOptions	List of possible comparators for this subject (SELECT type)
* value			Type of input widget for specifying the value
* vOptions		List of possible values (SELECT type)
* valueMod		Type of input widget for the valueModifier, which is a specifier or 
*				modifier for the value (such as units for size)
* vmOptions		List of possible values for the valueModifier (SELECT type)
*/
ZmFilterRule.CONDITIONS = {
	from: { 
		label:		ZmMsg.from,
//		subjectMod:	ZmFilterRule.TYPE_SELECT,
		smOptions:	ZmFilterRule.ADDR_OPTIONS,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	ZmFilterRule.MATCHING_OPS,
		value:		ZmFilterRule.TYPE_INPUT
	},
	to: {
		label:		ZmMsg.to,
//		subjectMod:	ZmFilterRule.TYPE_SELECT,
		smOptions:	ZmFilterRule.ADDR_OPTIONS,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	ZmFilterRule.MATCHING_OPS,
		value:		ZmFilterRule.TYPE_INPUT
	},
	cc: {
		label:		ZmMsg.cc,
//		subjectMod:	ZmFilterRule.TYPE_SELECT,
		smOptions:	ZmFilterRule.ADDR_OPTIONS,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	ZmFilterRule.MATCHING_OPS,
		value:		ZmFilterRule.TYPE_INPUT
	},
	subject: {
		label:		ZmMsg.subject,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	ZmFilterRule.MATCHING_OPS,
		value:		ZmFilterRule.TYPE_INPUT
	},
	header: {
		label:		ZmMsg.headerNamed,
		subjectMod:	ZmFilterRule.TYPE_INPUT,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	ZmFilterRule.MATCHING_OPS.concat([{label: ZmMsg.exists, value: ":exists"},
													  {label: ZmMsg.notExist, value: "not :exists"}]),
		value:		ZmFilterRule.TYPE_INPUT
	},
	size: {
		label:		ZmMsg.size,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	[{label: ZmMsg.under, value: ":under"}, {label: ZmMsg.notUnder, value: "not :under"},
					 {label: ZmMsg.over, value: ":over"}, {label: ZmMsg.notOver, value: "not :over"}],
		value:		ZmFilterRule.TYPE_INPUT,
		valueMod:	ZmFilterRule.TYPE_SELECT,
		vmOptions:	[{label: ZmMsg.b, value: "B"}, {label: ZmMsg.kb, value: "K"}, {label: ZmMsg.mb, value: "M"}]
	},
	date: {
		label:		ZmMsg.date,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	[{label: ZmMsg.beforeLc, value: ":before"}, {label: ZmMsg.notBefore, value: "not :before"},
					 {label: ZmMsg.afterLc, value: ":after"}, {label: ZmMsg.notAfter, value: "not :after"}],
		value:		ZmFilterRule.TYPE_CALENDAR
	},
	body: {
		label:		ZmMsg.body,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	[{label: ZmMsg.contains, value: ":contains"}, {label: ZmMsg.notContain, value: "not :contains"}],
		value:		ZmFilterRule.TYPE_INPUT
	},
	attachment: {
		label:		ZmMsg.attachment,
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	[{label: ZmMsg.exists, value: ":exists"}, {label: ZmMsg.notExist, value: "not :exists"}]
	},
	addressbook: {
		label:		ZmMsg.addressIn,
		subjectMod:	ZmFilterRule.TYPE_SELECT,
		smOptions:	[{label: ZmMsg.from, value: "from"}, {label: ZmMsg.to, value: "to"},
					 {label: ZmMsg.cc, value: "cc"}, {label: ZmMsg.bcc, value: "bcc"}],
		ops:		ZmFilterRule.TYPE_SELECT,
		opsOptions:	[{label: ZmMsg.isIn, value: ":in"}, {label: ZmMsg.notIn, value: "not :in"}],
		value:		ZmFilterRule.TYPE_SELECT,
		vOptions:	[{label: ZmMsg.myContacts, value: "contacts"}]
	}
};

// listed in order we want to display them in the SELECT
ZmFilterRule.CONDITIONS_LIST = ["from", "to", "cc", "subject", "header", "size",
								"date", "body", "attachment", "addressbook"];

// map config keys to fields in a ZmCondition
ZmFilterRule.CONDITIONS_KEY = {"subjectMod": "subjectModifier", "ops": "comparator",
							   "value": "value", "valueMod": "valueModifier"};

ZmFilterRule.IS_HEADER = {"from": true, "to": true, "cc": true, "subject": true};

/*
* Actions
*
* The key is known as the action's "name". It may or may not take an argument.
*
* label		text to show in dialog for the action's name
* param		type of input widget for the action's argument
*/
ZmFilterRule.ACTIONS = { 
	keep: { 
		label:		ZmMsg.keepInInbox
	}, 
	fileinto: {
		label:		ZmMsg.fileIntoFolder, 
		param:		ZmFilterRule.TYPE_FOLDER_PICKER
	},
	discard: {
		label:		ZmMsg.discard
	},
	stop: {
		label:		ZmMsg.stopEvaluation
	},
	flag: {
		label:		ZmMsg.mark,
		param:		ZmFilterRule.TYPE_SELECT,
		pOptions:	[{label: ZmMsg.asRead, value: "read"}, {label: ZmMsg.asFlagged, value: "flagged"}]
	},
	tag: {
		label:		ZmMsg.tagWith, 
		param:		ZmFilterRule.TYPE_TAG_PICKER
	}
};

ZmFilterRule.ACTIONS_LIST = ["keep", "fileinto", "discard", "stop", "flag", "tag"];

ZmFilterRule.prototype.toString =
function() {
	return "ZmFilterRule";
};

/**
* Returns the rule's internal ID.
*/
ZmFilterRule.prototype.getId =
function() {
	return this.id;
};

/**
* Enables or disables the rule.
*
* @param active	[boolean]	true if the rule is to be enabled
*/
ZmFilterRule.prototype.setActive =
function(active) {
	this.active = active;
};

/**
* Returns true if the rule is enabled.
*/
ZmFilterRule.prototype.isActive =
function() {
	return this.active;
};

/**
* Returns the rule's condition grouping operator.
*/
ZmFilterRule.prototype.getGroupOp =
function() {
	return this.groupOp;
};

/**
* Sets the rule's condition grouping operator to "any" or "all".
*
* @param groupOp	[constant]		grouping operator
*/
ZmFilterRule.prototype.setGroupOp =
function(groupOp) {
	this.groupOp = groupOp;
};

/**
* Returns the rule's name.
*/
ZmFilterRule.prototype.getName =
function() {
	return this.name;
};

/**
* Sets the rule's name.
*
* @param name	[string]	rule name
*/
ZmFilterRule.prototype.setName =
function(name) {
	this.name = name;
};

/**
* Returns the list of the rule's conditions.
*/
ZmFilterRule.prototype.getConditions =
function() {
	return this.conditions;
};

/**
* Adds a condition to the rule's conditions list.
*
* @param condition	[ZmCondition]	condition
*/
ZmFilterRule.prototype.addCondition =
function(condition) {
	this.conditions.push(condition);
};

/**
* Clears the rule's conditions list.
*/
ZmFilterRule.prototype.clearConditions =
function() {
	this.conditions = null;
	this.conditions = new Array();
};

/**
* Returns the list of the rule's actions.
*/
ZmFilterRule.prototype.getActions =
function() {
	return this.actions;
};

/**
* Adds an action to the rule's actions list.
*
* @param action	[ZmAction]	action
*/
ZmFilterRule.prototype.addAction =
function(action) {
	this.actions.push(action);
};

/**
* Clears the rule's actions list.
*/
ZmFilterRule.prototype.clearActions =
function() {
	this.actions = null;
	this.actions = new Array();
};

// placeholder rule used for adding a new rule
ZmFilterRule.DUMMY_RULE = new ZmFilterRule;
ZmFilterRule.DUMMY_RULE.conditions = [new ZmCondition("subject", ":contains")];
ZmFilterRule.DUMMY_RULE.actions = [new ZmAction("keep")];

/**
* Creates a ZmCondition.
* @constructor
* @class
* ZmCondition represents a rule condition.
*
* @param subject			[string]	term to compare (subject)
* @param comparator			[string]	type of comparison to make (verb)
* @param value				[string]	value to compare against (object)
* @param subjectModifier	[string]*	further detail for the subject
* @param valueModifier		[string]*	further detail for the value
*/
function ZmCondition(subject, comparator, value, subjectModifier, valueModifier) {
	this.subject = subject;
	this.comparator = comparator;
	this.value = value;
	this.subjectModifier = subjectModifier;
	this.valueModifier = valueModifier;
};

/*
* Creates a ZmAction.
* @constructor
* @class
* ZmAction represents a rule action.
*
* @param name	[string]	action name
* @param arg	[string]*	optional argument
*/
function ZmAction(name, arg) {
	this.name = name;
	this.arg = arg;
};
