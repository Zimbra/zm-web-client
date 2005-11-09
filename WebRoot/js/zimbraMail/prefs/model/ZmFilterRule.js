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

/*
 * A filter rule. Each rule has the following fields:
 *   groupOp: anyof | allof, used to group multiple conditions
 *   conditions: an array of ZmCondition objects
 *   actions: an array of ZmAction objects
 */
// event handling

function ZmFilterRule (name, isActive) {
	this.name = name;
	this.groupOp = "anyof";
	this.actions = new Array();
	this.conditions = new Array();
	this.active = isActive;
	this._id = ZmFilterRule._uniqueId++;
}

ZmFilterRule._uniqueId = 0;

ZmFilterRule.prototype.getUniqueId = function() {
	return this._id;
};

ZmFilterRule.prototype.setActive = function (isActive) {
	this.active = isActive;
};

ZmFilterRule.prototype.isActive = function () {
	return this.active;
};

ZmFilterRule.prototype.setGroupOp = function (groupOp) {
	this.groupOp = groupOp;
};

ZmFilterRule.prototype.toString = function() {
	return "ZmFilterRules";
};

ZmFilterRule.prototype.getName = function () {
	return this.name;
};

ZmFilterRule.prototype.setName = function (newName) {
	this.name = newName;
};

ZmFilterRule.prototype.getConditionsOperator = function () {
	return this.groupOp;
};

ZmFilterRule.prototype.addAction = function (name, arg) {
	if (name) {
		this.actions.push(new ZmAction(name, arg));
	}
};

ZmFilterRule.prototype.clearActions = function () {
	this.actions = null;
	this.actions = new Array();
};

ZmFilterRule.prototype.clearConditions = function () {
	this.conditions = null;
	this.conditions = new Array();
};


/**
 * only accepts ZmConditions, fails silently if it's not an ZmCondition
 */
ZmFilterRule.prototype.addCondition = function (conditionName, lhs, 
												opValue, rhs, mod) {
	if (conditionName && opValue) {
		this.conditions.push(new ZmCondition(conditionName, lhs, opValue,
											 rhs, mod));
	}
};

// a place-holder rule used for adding a new rule
ZmFilterRule.DUMMY_RULE = new ZmFilterRule;
ZmFilterRule.DUMMY_RULE.conditions = [ new ZmCondition ];
ZmFilterRule.DUMMY_RULE.actions = [ new ZmAction ];

/*
 * Condition. Each condition has the following fields:
 *   field: type of condition: header, body, size, date, etc.
 *   comparator: contains, not contains, over, under, before, after, etc.
 *   key0:  lhs 
 *   key1:  rhs value
 */
function ZmCondition(field, key0, comparator, key1, mod) {
	this.field = field;
	this.comparator = comparator;
	this.key0 = key0;
	this.key1 = key1;
	this.modified = mod;
}


/*
 * Action. Each action has the following fields:
 *   name: name of the action: keep, stop, fileinto, etc.
 *   param: parameter that the action takes.
 */
function ZmAction(name, arg) {
	this.name = name;
	if (!arg){
		this.arg = null;
	} else {
		this.arg = arg;
	}
}
