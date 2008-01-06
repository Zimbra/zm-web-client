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
 * Creates an empty ZmFilterRules.
 * @constructor
 * @class
 * ZmFilterRules represents a set of filter rules. The rules are maintained in a vector, and have
 * an order. Each rule is a ZmFilterRule. They can be added and edited via a ZmFilterRuleDialog.
 *
 * @author Conrad Damon
 */
ZmFilterRules = function() {

	ZmModel.call(this, ZmEvent.S_FILTER);

	this._vector = new AjxVector();
	this._ruleIdHash = {};
	this._ruleNameHash = {};
	this._initialized = false;
};

ZmFilterRules.prototype = new ZmModel;
ZmFilterRules.prototype.constructor = ZmFilterRules;

/**
* Adds a rule to the list.
*
* @param rule			[ZmFilterRule]		rule to be added
* @param referenceRule	[ZmFilterRule]*		rule after which to add the new rule
* @param callback		[AjxCallback]*		callback
*/
ZmFilterRules.prototype.addRule = 
function(rule, referenceRule, callback) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: add rule '" + rule.getName() + "'");
	var index = referenceRule ? this._vector.indexOf(referenceRule) : null;
	this._insertRule(rule, index);
	this._saveRules(index, true, callback);
};

/**
* Removes a rule from the list.
*
* @param rule			[ZmFilterRule]		rule to be removed
*/
ZmFilterRules.prototype.removeRule = 
function(rule) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: remove rule '" + rule.getName() + "'");
	var index = this.getIndexOfRule(rule);
	this._vector.removeAt(index);
	delete this._ruleIdHash[rule.id];
	delete this._ruleNameHash[rule.name];
	this._saveRules(index, true);
};

/**
* Moves a rule up in the list. If the rule is the first in the list, it isn't moved.
*
* @param rule			[ZmFilterRule]		rule to be moved
*/
ZmFilterRules.prototype.moveUp = 
function(rule) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: move up rule '" + rule.getName() + "'");
	var index = this.getIndexOfRule(rule);
	if (index == 0) return;

	var prevRule = this._vector.removeAt(index - 1);
	this._insertRule(prevRule, index);

	this._saveRules(index - 1, true);
};

/**
* Moves a rule down in the list. If the rule is the last in the list, it isn't moved.
*
* @param rule			[ZmFilterRule]		rule to be moved
*/
ZmFilterRules.prototype.moveDown = 
function(rule) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: move down rule '" + rule.getName() + "'");
	var index = this.getIndexOfRule(rule);
	if (index >= (this._vector.size() - 1)) return;
	
	var nextRule = this._vector.removeAt(index + 1);
	this._insertRule(nextRule, index);

	this._saveRules(index + 1, true);
};

/**
* Marks a rule as active/inactive.
*
* @param rule			[ZmFilterRule]		rule to mark active/inactive
* @param active			[boolean]			if true, rule is marked active
*/
ZmFilterRules.prototype.setActive =
function(rule, active) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: set active rule '" + rule.getName() + "', " + active);
	rule.setActive(active);
	this._saveRules(null, false);
};

// utility methods

/**
* Returns the number of rules in the list.
*/
ZmFilterRules.prototype.getNumberOfRules = 
function() {
	return this._vector.size();
};

/**
* Returns the numeric index of the rule in the list.
*
* @param rule	[ZmFilterRule]		a rule
*/
ZmFilterRules.prototype.getIndexOfRule = 
function(rule) {
	return this._vector.indexOf(rule);
};

/**
* Fetches a rule based on its index.
*
* @param index	[int]	an index
*/
ZmFilterRules.prototype.getRuleByIndex = 
function(index) {
    return this._vector.get(index);
};
				       
/**
* Fetches a rule based on its ID.
*
* @param id		[string]	rule ID
*/
ZmFilterRules.prototype.getRuleById = 
function(id) {
    return this._ruleIdHash[id];
};
				       
/**
* Fetches a rule based on its name.
*
* @param name	[string]	rule name
*/
ZmFilterRules.prototype.getRuleByName = 
function(name) {
    return this._ruleNameHash[name];
};

/**
* Gets the rules from the server and parses them into ZmFilterRule objects.
*
* @param force			[boolean]*			if true, get rules from server
* @param callback		[AjxCallback]*		callback
*/
ZmFilterRules.prototype.loadRules = 
function(force, callback) {
	if (this._initialized && !force) {
		if (callback) {
			callback.run(new ZmCsfeResult(this._vector));
			return;
		} else {
			return this._vector;
		}
	}

	DBG.println(AjxDebug.DBG3, "FILTER RULES: load rules");
	var soapDoc = AjxSoapDoc.create("GetRulesRequest", "urn:zimbraMail");
	var respCallback = new AjxCallback(this, this._handleResponseLoadRules, [callback]);
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: respCallback});
};
	
ZmFilterRules.prototype._handleResponseLoadRules = 
function(callback, result) {
	
	this._vector.removeAll();
	this._ruleIdHash = {};
	this._ruleNameHash = {};

	var resp = result.getResponse().GetRulesResponse;

	var rulesNode = resp.rules;
	var children = rulesNode.r;

	if (children) {
		for (var i = 0; i < children.length; i++) {
			var ruleNode = children[i];
			var name = ruleNode.name;
			var rule = new ZmFilterRule(name, ruleNode.active);
				
			if (ruleNode.g) {
				for (var j = 0; j < ruleNode.g.length; j++) {
					var caNode = ruleNode.g[j];
					rule.setGroupOp(caNode.op);
					var condNodes = caNode.c;
					for (var k = 0; k < condNodes.length; k++)
						this._createConditionFromNode(condNodes[k], rule);
				}
			}
				
			if (ruleNode.action) {
				for (var j = 0; j < ruleNode.action.length; j++) {
					var name = ZmFilterRule.A_VALUE_MAP[ruleNode.action[j].name.toLowerCase()];
					var argNodes = ruleNode.action[j].arg;
					var arg = null;
					if (argNodes && argNodes.length > 0) {
						var rawArg = argNodes[0]._content;
						arg = rawArg.substring(1, rawArg.length - 1);
					}
					var action = new ZmAction(name, arg);
					rule.addAction(action);
				}
			}
			this._insertRule(rule);
		}
	}

	this._initialized = true;

	if (callback) {
		result.set(this._vector);
		callback.run(result);
	} else {
		return this._vector;
	}
};

/**
* Saves the rules to the server.
*
* @param index			[int]*				index of rule to select in list after save
* @param notify			[boolean]*			if true, notify listeners of change event
* @param callback		[AjxCallback]*		callback
* @param errorCallback	[AjxCallback]*		error callback
*/
ZmFilterRules.prototype._saveRules = 
function(index, notify, callback, errorCallback) {

	DBG.println(AjxDebug.DBG3, "FILTER RULES: save rules");
	var soapDoc = AjxSoapDoc.create("SaveRulesRequest", "urn:zimbraMail");
	var topNode = soapDoc.set("rules");

	var rules = this._vector.getArray();
	for (var i = 0; i < rules.length; i++) {
		var r = rules[i];
		// rule element "r"
		ruleNode = soapDoc.set("r", null, topNode);
		ruleNode.setAttribute("name", r.getName());
		ruleNode.setAttribute("active", r.isActive() ? "1" : "0");

		// grouping element "g"
		var gNode = soapDoc.set("g", null, ruleNode);
		gNode.setAttribute("op", r.getGroupOp());

		var conditions = r.getConditions();
		for (var c = 0; c < conditions.length; c++) {
			var condition = conditions[c];
			// condition element "c"
			node = soapDoc.set("c", null, gNode);
			var subject = ZmFilterRule.C_VALUE[condition.subject];
			var subjectMod = condition.subjectModifier;
			var comp = ZmFilterRule.OP_VALUE[condition.comparator];
			var value = condition.value;
			var valueMod = condition.valueModifier;
			// convert convenience headers
			if (ZmFilterRule.IS_HEADER[condition.subject]) {
				// suppport address mod if present
				if (subjectMod == ":localpart" || subjectMod == ":domain")
					node.setAttribute("mod", subjectMod);
				subjectMod = subject;
				subject = ZmFilterRule.C_VALUE[ZmFilterRule.C_HEADER];
			} else if (condition.subject == ZmFilterRule.C_ATT) {
				// attachment is weird, doesn't take an op
				if (condition.comparator == ZmFilterRule.OP_NOT_EXISTS)
					subject = "not attachment";
				comp = "";
			} else if (condition.subject == ZmFilterRule.C_HEADER &&
					   (condition.comparator == ZmFilterRule.OP_EXISTS ||
					    condition.comparator == ZmFilterRule.OP_NOT_EXISTS)) {
				subject = comp;
				value = subjectMod;
				subjectMod = comp = null;
			}
			if (subject)
				node.setAttribute("name", subject);
			if (subjectMod && subjectMod != "all")
				node.setAttribute("k0", subjectMod);
			if (comp)
				node.setAttribute("op", comp);
			if (value) {
				// don't include "B" for bytes
				if (valueMod && (!(subject == "size" && valueMod == "B")))
					value = [value, valueMod].join("");
				node.setAttribute("k1", value);
			}
		}

		var actions = r.getActions();
		for (var a = 0; a < actions.length; a++) {
			var action = actions[a];
			node = soapDoc.set("action", null, ruleNode);
			node.setAttribute("name", ZmFilterRule.A_VALUE[action.name]);
			if (action.arg)
				soapDoc.set("arg", action.arg, node);
		}
	}

	var respCallback = new AjxCallback(this, this._handleResponseSaveRules, [index, notify, callback]);
	var errorCallback = new AjxCallback(this, this._handleErrorSaveRules);
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
												  callback: respCallback, errorCallback: errorCallback});
};

ZmFilterRules.prototype._handleResponseSaveRules =
function(index, notify, callback, result) {
	if (notify)
		this._notify(ZmEvent.E_MODIFY, {index: index});
	appCtxt.setStatusMsg(ZmMsg.filtersSaved);
	if (callback) callback.run(result);
};

/*
* The save failed. Show an error dialog, then reload the rules and display them afresh.
* We do that because our internal version of the rules changed, but we couldn't save 
* them, and we don't want the list view to be out of sync with the list.
*
* @param ex		[AjxException]		exception
*/
ZmFilterRules.prototype._handleErrorSaveRules =
function(ex) {
	if (ex.code == ZmCsfeException.SVC_PARSE_ERROR || ex.code == ZmCsfeException.SVC_INVALID_REQUEST) {
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.setMessage([ZmMsg.filterError, " ", ex.msg].join(""), DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
	    var respCallback = new AjxCallback(this, this._handleResponseHandleErrorSaveRules);
	    this.loadRules(true, respCallback);
		return true;
	} else {
		return false;
	}
};

// XXX: the caller should probably be the one doing this
ZmFilterRules.prototype._handleResponseHandleErrorSaveRules =
function() {
	var prefController = AjxDispatcher.run("GetPrefController");
	var prefsView = prefController.getPrefsView();
    var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
    if (section && prefsView && prefsView.getView(section.id)) {
		prefController.getFilterRulesController().resetListView();
    }
};

/*
* Inserts a rule into the internal vector. Adds to the end if no index is given.
*
* @param rule		[ZmFilterRule]		rule to insert
* @param index		[int]*				index at which to insert
*/
ZmFilterRules.prototype._insertRule = 
function(rule, index) {
	this._vector.add(rule, index);
	this._ruleIdHash[rule.id] = rule;
	this._ruleNameHash[rule.name] = rule;
};

/*
* Creates a ZmCondition from a condition node and adds it to the given rule.
*
* @param node	[object]		condition node
* @param rule	[ZmFilterRule]	owning rule
*/
ZmFilterRules.prototype._createConditionFromNode = 
function(node, rule) {
	var name = node.name;
	var subject = ZmFilterRule.C_VALUE_MAP[name];
	var subjectMod = node.k0 ? node.k0.toLowerCase().substring(2, node.k0.length - 2) : null;
	var subjectModKey = ZmFilterRule.C_VALUE_MAP[subjectMod];
	// convert convenience headers
	if (subjectModKey && (subject == ZmFilterRule.C_HEADER) && (ZmFilterRule.IS_HEADER[subjectMod])) {
		subject = subjectModKey;
		subjectMod = null;
	}
	var comparator = ZmFilterRule.OP_VALUE_MAP[node.op];
	if (node.mod) {
		subjectMod = node.mod.substring(1, node.mod.length);
	}
	var value = node.k1 ? node.k1.substring(2, node.k1.length - 2) : null;
	var valueMod = null;
	if (subject == ZmFilterRule.C_SIZE) {
		value = node.k1;
		var m = value.match(/(\d+)([A-Z]+)/);
		value = m[1];
		valueMod = m[2];
	} else if (node.name == ZmFilterRule.OP_VALUE[ZmFilterRule.OP_EXISTS] ||
			   node.name == ZmFilterRule.OP_VALUE[ZmFilterRule.OP_NOT_EXISTS]) {
		if (node.k0) {
			subject = ZmFilterRule.C_HEADER;
			comparator = ZmFilterRule.OP_VALUE_MAP[node.name];
		}
	}

	var condition = new ZmCondition(subject, comparator, value, subjectMod);
	rule.addCondition(condition);
};
