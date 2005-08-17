
/**
 * FilterRules is a static class that handles the list of filter rules.
 * The list of rules should be modified via the api presented.
 */
function LmFilterRules() {
}

LmFilterRules.TYPE_INPUT = 1;
LmFilterRules.TYPE_EMPTY = 2;
LmFilterRules.TYPE_SELECT = 3;
LmFilterRules.TYPE_BUTTON = 4;
/*
 * Condition constraints
 * each type of condition is mapped to:
 *   desc: display name 
 *   op:   meaningful comparators that go with this type of condition;
 *         each comparators will have a negated comparator automatically added.
 *   lhs:  if this condition can take a LHS value. E.g., 'header' needs a LHS
 *         to identify which header
 *   rhs:  if this condition expects a RHS value.
 */
LmFilterRules.CONDITIONS = {
	from: { 
		desc:        "From",
		op:          ["is", "contains", "matches"], 
		negativeOps: ["is not", "does not contain", "does not match"],
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_INPUT,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    true
	},
	to: {
		desc:        "To", 
		op:          ["is", "contains", "matches"], 
		negativeOps: ["is not", "does not contain", "does not match"],
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_INPUT,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    true
	},
	cc: {
		desc:        "Cc", 
		op:          ["is", "contains", "matches"], 
		negativeOps: ["is not", "does not contain", "does not match"],
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_INPUT, 
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    true
	},
	subject: {
		desc:        "Subject", 
		op:          ["is", "contains", "matches"],
		negativeOps: ["is not", "does not contain", "does not match"],
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_INPUT, 
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    true
	},
	header: {
		desc:        "Header Named", 
		op:          ["is", "contains", "matches", "exists"], 
		negativeOps: ["is not", "does not contain", "does not match",
					  "does not exist"],
		cell1:       LmFilterRules.TYPE_INPUT, 
		cell3:       LmFilterRules.TYPE_INPUT,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    true
	},
	size: {
		desc:        "Size", 
		op:          ["under", "over"], 
		negativeOps: ["not under", "not over"],
		cell1:       LmFilterRules.TYPE_EMPTY,
		cell3:       LmFilterRules.TYPE_INPUT,
		cell4:       LmFilterRules.TYPE_SELECT,
		cell4length: 1,
		cell4ops:    [ {display:"B", value:"B"},
                       {display:"KB", value:"K"}, {display:"MB", value:"M"}],
		isHeader:    false
	},
	date: {
		desc:        "Date", 
		op:          ["before", "after"], 
		negativeOps: ["not before", "not after"],
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_BUTTON,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    false
	},
	body: {
		desc:        "Body",
		op:          ["contains"], 
		negativeOps: ["does not contain"], 
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_INPUT,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    false
	},
	attachment: {
		desc:        "Attachment", 
		op:          ["exists"], 
		negativeOps: ["does not exist"], 
		cell1:       LmFilterRules.TYPE_EMPTY, 
		cell3:       LmFilterRules.TYPE_EMPTY,
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    false
	},
	addressbook: {
		desc:        "Address in",
		op:          ["in"], 
		negativeOps: ["not in"],
		cell1:       LmFilterRules.TYPE_SELECT,
		cell1ops:    [{display:"From", value:"from"},{display:"To", value:"to"}, {display:"Cc", value:"cc"},{display:"Bcc", value:"bcc"}],
		cell3:       LmFilterRules.TYPE_SELECT,
		cell3ops:    [{display:"My contacts", value:"contacts"}],
		cell4:       LmFilterRules.TYPE_EMPTY,
		isHeader:    false
	}
};

LmFilterRules.getConfigForCondition = function (name) {
	for (var conditionName in LmFilterRules.CONDITIONS) {
		if (name != null && conditionName == name.toLowerCase()) {
			return LmFilterRules.CONDITIONS[conditionName];
		}
	}
	return null;
};

/*
 * Action constraints
 * each type of action is mapped to:
 *   desc: display name
 *   canHaveParam: if this action expects a parameter
 */
LmFilterRules.ACTIONS = { 
	keep:{ 
		desc:"Keep in INBOX", 
		param:LmFilterRules.TYPE_EMPTY
	}, 
	fileinto:{ 
		desc:"File into folder", 
		param: LmFilterRules.TYPE_INPUT 
	},
	discard:{ 
		desc:"Discard", 
		param: LmFilterRules.TYPE_EMPTY 
	},
	stop:{ 
		desc:"Stop further evaluation", 
		param: LmFilterRules.TYPE_EMPTY 
	},
	flag:{ 
		desc:"Mark", 
		param: LmFilterRules.TYPE_SELECT,
		paramOps: [{display: "As read", value:"read"},
	               {display: "As flagged", value: "flagged"}]
	},
	tag:{ 
		desc:"Tag with", 
		param: LmFilterRules.TYPE_INPUT 
	}
};

LmFilterRules.RULE_ADDED = "ruleAdded";
LmFilterRules.RULE_MODIFIED = "ruleModified";
LmFilterRules.RULE_MODIFIED = "ruleRemoved";
LmFilterRules.RULES_REORDERED = "rulesReordered";

// private "class" members
LmFilterRules._rules = new LsVector();
LmFilterRules._dirty = false;
LmFilterRules._eventManager = new LsEventMgr();
// -------------------------------------------------------------------
// Public methods
// -------------------------------------------------------------------
/**
 * This is important to call before using the filter rules.
 * The requestSender, is an object that has the method sendRequest(soapDoc).
 */
LmFilterRules.setRequestSender = 
function(reqSender) {
	LmFilterRules._sender = reqSender;
};

/**
 * Add a listener for a given event
 */
LmFilterRules.addListener = 
function(eventName, listener) {
	LmFilterRules._eventManager.addListener(eventName, listener);
};

/**
 * Add a rule to the rules list.
 */
LmFilterRules.addRule = 
function(rule) {
	LmFilterRules.insertRule(rule);
};

/**
 * Add a rule into the list before the referenceRule.
 */
LmFilterRules.insertRule = 
function(rule, referenceRule) {
	var index = LmFilterRules._rules.indexOf(referenceRule);
	LmFilterRules._internalInsertRule(rule, index, true);
};

/**
 * Modify a given rule. Notifies listeners of RULE_MODIFIED.
 */
LmFilterRules.modifyRule = 
function(modifiedRule) {
	LmFilterRules.markDirty();
	var ev = new Object();
	ev.rule = modifiedRule;
	LmFilterRules._eventManager.notifyListeners(LmFilterRules.RULE_MODIFIED, ev);
};

LmFilterRules.removeRules = 
function(rulesArray) {
	for (var i = 0; i < rulesArray.length; ++i) {
		var idx = LmFilterRules.getIndexOfRule(rulesArray[i]);
		var notify = i == (rulesArray.length - 1);
		LmFilterRules._internalRemoveRule(idx, notify);
	}
};

/**
 * Remove a rule from the list. Notifies listeners of RULE_REMOVED.
 */
LmFilterRules.removeRule = 
function(rule) {
	var index = LmFilterRules.getIndexOfRule(rule);
	LmFilterRules._internalRemoveRule(index, true);
};

/**
 * Moves a rule up in the list. If the rule is the first in the list, it wraps
 * to the bottom. Notifies listeners of RULES_REORDERED.
 */
LmFilterRules.moveUp = 
function(rule) {
	var index = LmFilterRules.getIndexOfRule(rule);
	var previous = index - 1;
	var rulesLen = LmFilterRules._rules.size();
	if (previous < 0 || previous > rulesLen) { 
		previous = rulesLen - 1;;
	}
	if (index == previous) {
		return;
	}

	LmFilterRules._internalRemoveRule(index, false);
	LmFilterRules._internalInsertRule(rule, previous, false);
	var ev = new Object();
	ev.rule = rule;
	LmFilterRules._eventManager.notifyListeners(LmFilterRules.RULES_REORDERED, ev);
};

/**
 * Moves a rule down in the list. If the rule is the last in the list, it wraps
 * to the top. Notifies listeners of RULES_REORDERED.
 */
LmFilterRules.moveDown = 
function(rule) {
	var index = LmFilterRules.getIndexOfRule(rule);
	var next = index + 1;
	var rulesLen = LmFilterRules._rules.size();
	if (next < 0 || next >= rulesLen ){
		next = 0;
	}
	if (index == next) {
		return;
	}

	var nextRule = LmFilterRules.getRuleByIndex(next);
	var ruleToMove, removeIndex, insertIndex;
	if (next > index ) {
		removeIndex = next;
		ruleToMove = nextRule;
		insertIndex = index;
	} else {
		removeIndex = index;
		ruleToMove = rule;
		insertIndex = next;
	}
	LmFilterRules._internalRemoveRule(removeIndex, false);
	LmFilterRules._internalInsertRule(ruleToMove, insertIndex, false);
	var ev = new Object();
	ev.rule = rule;
	LmFilterRules._eventManager.notifyListeners(LmFilterRules.RULES_REORDERED, ev);
};

LmFilterRules.markDirty = 
function() {
	LmFilterRules._dirty = true;
};
// -------------------------------------------------------------------
// Server interaction methods
// -------------------------------------------------------------------

/**
 * Get the rules. If rules have not been fetched from the server, or if
 * force is specified, this method requests the rules list from the server.
 * Otherwise it returns the internal list of rules. 
 *
 * @param force - force a trip to the server, and replace the existing
 *                internal list of rules.
 */
LmFilterRules.getRules = 
function(force) {
	if (force || (!LmFilterRules._rulesInitialized)) {
		var soapDoc = LsSoapDoc.create("GetRulesRequest", "urn:liquidMail");
		var resp = LmFilterRules._sender.sendRequest(soapDoc).GetRulesResponse;
		var rulesNode = resp.rules;
		var children = rulesNode.r;

		if (children) {
			for (var i = 0; i < children.length; i++) {
				var ruleNode = children[i];
				var name = ruleNode.name;
				var rule = new LmFilterRule(name, ruleNode.active);
				
				if (ruleNode.g) {
					for (var j = 0; j < ruleNode.g.length; j++) {
						var caNode = ruleNode.g[j];
						rule.setGroupOp(caNode.op);
						var condNodes = caNode.c;
						for (var k = 0; k < condNodes.length; k++)
							LmFilterRules._createConditionFromNode(condNodes[k], rule);
					}
				}
				
				if (ruleNode.c) {
					LmFilterRules._createConditionFromNode(ruleNode.c, rule);
				}
				
				if (ruleNode.action) {
					for (var j = 0; j < ruleNode.action.length; j++) {
						var aName = ruleNode.action[j].name;
						var argNodes = ruleNode.action[j].arg;
						var aArg = null;
						var rawArg = null;
						if (argNodes && argNodes.length > 0) {
							rawArg = argNodes[0]._content;
							aArg = rawArg.substring(1, rawArg.length-1);
						}
						rule.addAction(aName, aArg);
					}
				}
				LmFilterRules.addRule(rule);
			}
		}

		// reset the dirty setting, since we just got the full list from the server.
		LmFilterRules._dirty = false;
		LmFilterRules._rulesInitialized = true;
	}
	return LmFilterRules._rules;
};

LmFilterRules.saveRules = 
function() {

	if (!LmFilterRules._dirty)
		return null;
	
	var soapDoc = LsSoapDoc.create("SaveRulesRequest", "urn:liquidMail");
	var topNode = soapDoc.set("rules");

	var rules = LmFilterRules._rules.getArray();
	for (var i = 0; i < rules.length; ++i) {
		var rule = rules[i];
		var ruleName = rule.getName();
		var activeStr = rule.isActive() ? "1" : "0";

		ruleNode = soapDoc.set("r", null, topNode);
		ruleNode.setAttribute("name", rules[i].getName());
		ruleNode.setAttribute("active", activeStr);

		// 1. Check if any fields have changed in the conditions table.
		var gNode = soapDoc.set("g", null, ruleNode);
		gNode.setAttribute("op", rule.getConditionsOperator());

		for (var x = 0; x < rule.conditions.length; ++x) {
			var condition = rule.conditions[x];
			node = soapDoc.set("c",null, gNode);
			node.setAttribute("name", condition.field);

			if (condition.key0) {
				node.setAttribute("k0", condition.key0);
			}
			var comp = condition.comparator.replace(/(not\s+)*(.*)/i, "$1:$2");
			node.setAttribute("op", comp);

			if (condition.key1) {
				var k1 = condition.key1;
				// special case for the size condition: sieve doesn't handle 
				// bytes, so the deal was that our server wouldn't accept B at 
				// the end of the string but WILL send it back.
				if (condition.field == "size") {
					var units = k1.substring(k1.length - 1, k1.length);
					if (units == "B")
						k1 = k1.substring(0, k1.length -1);
				}
				node.setAttribute("k1", k1);
			}
		}

		// 2. Check if any fields have changed in the actions table.
		//var needsStop = true;
		for (var y = 0; y < rule.actions.length; ++y) {
			var action = rule.actions[y];
			node = soapDoc.set("action", null, ruleNode);
			node.setAttribute("name", action.name);
			//if (action.name == "stop") needsStop =false;

			if (action.arg) {
				soapDoc.set("arg", action.arg, node);
			}
		}

		// always need the stop node
		//if (needsStop){
		//	node = soapDoc.set("action", null, ruleNode);
		//	node.setAttribute("name", "stop");
		//}
	}

	LmFilterRules._dirty = false;
	return LmFilterRules._sender.sendRequest(soapDoc).SaveRulesResponse;
};


LmFilterRules.getIndexOfRule = 
function(rule) {
	return LmFilterRules._rules.indexOf(rule);
};

LmFilterRules.getNumberOfRules = 
function() {
	return LmFilterRules._rules.size();
};

LmFilterRules.getRuleByIndex = 
function(index) {
    return LmFilterRules._rules.get(index);
};
				       
LmFilterRules.shouldSave = 
function() {
	return LmFilterRules._dirty;
};

// -------------------------------------------------------------------
// Private methods
// -------------------------------------------------------------------
LmFilterRules._internalRemoveRule = 
function(ruleIndex, notify) {
	var rule = LmFilterRules._rules.removeAt(ruleIndex);
	LmFilterRules.markDirty();
	if (notify !== void 0 && notify !== null && notify == true) {
		var ev = new Object();
		ev.rule = rule;
		LmFilterRules._eventManager.notifyListeners(LmFilterRules.RULE_REMOVED,	ev);
	}
};

LmFilterRules._internalInsertRule = 
function(rule, referenceRuleIndex, notify) {
	LmFilterRules._rules.add(rule, referenceRuleIndex);
	LmFilterRules.markDirty();
	if (notify !== void 0 && notify !== null && notify == true) {
		var ev = new Object();
		ev.rule = rule;
		LmFilterRules._eventManager.notifyListeners(LmFilterRules.RULE_ADDED, ev);
	}
};

LmFilterRules._createConditionFromNode = 
function(node, rule) {
	var k0  = node.k0  ? node.k0.substring(2, node.k0.length-2) : null;
	var op  = node.op  ? node.op.replace(/:/, "") : null;
	var mod = node.mod ? node.mod.substring(1, node.mod.length) : null;
	var k1  = node.k1  ? node.k1.substring(2, node.k1.length-2) : null;

	rule.addCondition(node.name, k0, op, k1, mod);
};
