/*
 * A filter rule. Each rule has the following fields:
 *   groupOp: anyof | allof, used to group multiple conditions
 *   conditions: an array of LmCondition objects
 *   actions: an array of LmAction objects
 */
// event handling

function LmFilterRule (name, isActive) {
	this.name = name;
	this.groupOp = "anyof";
	this.actions = new Array();
	this.conditions = new Array();
	this.active = isActive;
	this._id = LmFilterRule._uniqueId++;
}

LmFilterRule._uniqueId = 0;

LmFilterRule.prototype.getUniqueId = function() {
	return this._id;
};

LmFilterRule.prototype.setActive = function (isActive) {
	this.active = isActive;
};

LmFilterRule.prototype.isActive = function () {
	return this.active;
};

LmFilterRule.prototype.setGroupOp = function (groupOp) {
	this.groupOp = groupOp;
};

LmFilterRule.prototype.toString = function() {
	return "LmFilterRules";
};

LmFilterRule.prototype.getName = function () {
	return this.name;
};

LmFilterRule.prototype.setName = function (newName) {
	this.name = newName;
};

LmFilterRule.prototype.getConditionsOperator = function () {
	return this.groupOp;
};

LmFilterRule.prototype.addAction = function (name, arg) {
	if (name) {
		this.actions.push(new LmAction(name, arg));
	}
};

LmFilterRule.prototype.clearActions = function () {
	this.actions = null;
	this.actions = new Array();
};

LmFilterRule.prototype.clearConditions = function () {
	this.conditions = null;
	this.conditions = new Array();
};


/**
 * only accepts LmConditions, fails silently if it's not an LmCondition
 */
LmFilterRule.prototype.addCondition = function (conditionName, lhs, 
												opValue, rhs, mod) {
	if (conditionName && opValue) {
		this.conditions.push(new LmCondition(conditionName, lhs, opValue,
											 rhs, mod));
	}
};

// a place-holder rule used for adding a new rule
LmFilterRule.DUMMY_RULE = new LmFilterRule;
LmFilterRule.DUMMY_RULE.conditions = [ new LmCondition ];
LmFilterRule.DUMMY_RULE.actions = [ new LmAction ];

/*
 * Condition. Each condition has the following fields:
 *   field: type of condition: header, body, size, date, etc.
 *   comparator: contains, not contains, over, under, before, after, etc.
 *   key0:  lhs 
 *   key1:  rhs value
 */
function LmCondition(field, key0, comparator, key1, mod) {
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
function LmAction(name, arg) {
	this.name = name;
	if (!arg){
		this.arg = null;
	} else {
		this.arg = arg;
	}
}
