/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a filter rules object.
 * @constructor
 * @class
 * This class represents a set of filter rules. The rules are maintained in a {@link AjxVector}
 * and have an order. Each rule is a {@link ZmFilterRule}. Filter rules can be added and
 * edited via a {@link ZmFilterRuleDialog}.
 *
 * @author Conrad Damon
 *
 * @param {String}	accountName		the name of the account this set of filter rules belongs to
 * 
 * @extends		ZmModel
 */
ZmFilterRules = function(accountName, outgoing) {

	ZmModel.call(this, ZmEvent.S_FILTER);

	this._vector = new AjxVector();
	this._ruleIdHash = {};
	this._ruleNameHash = {};
	this._initialized = false;
	this._accountName = accountName;
	this._outgoing = outgoing;
};

ZmFilterRules.prototype = new ZmModel;
ZmFilterRules.prototype.constructor = ZmFilterRules;

ZmFilterRules.prototype.toString =
function() {
	return "ZmFilterRules";
};

/**
 * Adds a rule to the list.
 *
 * @param {ZmFilterRule}	rule			the rule to be added
 * @param {ZmFilterRule}	referenceRule	the rule after which to add the new rule
 * @param {AjxCallback}	callback		the callback
 */
ZmFilterRules.prototype.addRule = 
function(rule, referenceRule, callback) {
	DBG.println(AjxDebug.DBG3, "FILTER RULES: add rule '" + rule.name + "'");
	var index = referenceRule ? this._vector.indexOf(referenceRule) : 0;
	this._insertRule(rule, index);
	this._saveRules(index, true, callback);
};

/**
 * Removes a rule from the list.
 *
 * @param {ZmFilterRule}	rule			the rule to be removed
 */
ZmFilterRules.prototype.removeRule = 
function(rule) {
	if (!rule) { return; }
	DBG.println(AjxDebug.DBG3, "FILTER RULES: remove rule '" + rule.name + "'");
	var index = this.getIndexOfRule(rule);
	this._vector.removeAt(index);
	delete this._ruleIdHash[rule.id];
	delete this._ruleNameHash[rule.name];
	this._deleteMode = true;
    this._saveRules(index, true);
};

/**
 * Moves a rule up in the list. If the rule is the first in the list, it isn't moved.
 *
 * @param {ZmFilterRule}	rule			the rule to be moved
 */
ZmFilterRules.prototype.moveUp = 
function(rule) {
	if (!rule) { return; }
	DBG.println(AjxDebug.DBG3, "FILTER RULES: move up rule '" + rule.name + "'");
	var index = this.getIndexOfRule(rule);
	if (index == 0) { return; }

	var prevRule = this._vector.removeAt(index - 1);
	this._insertRule(prevRule, index);
	this._saveRules(index - 1, true);
};

/**
 * Moves a rule down in the list. If the rule is the last in the list, it isn't moved.
 *
 * @param {ZmFilterRule}	rule			the rule to be moved
 */
ZmFilterRules.prototype.moveDown = 
function(rule) {
	if (!rule) { return; }
	DBG.println(AjxDebug.DBG3, "FILTER RULES: move down rule '" + rule.name + "'");
	var index = this.getIndexOfRule(rule);
	if (index >= (this._vector.size() - 1)) { return; }
	
	var nextRule = this._vector.removeAt(index + 1);
	this._insertRule(nextRule, index);
	this._saveRules(index + 1, true);
};

/**
 * Moves a rule to the bottom of the list.  If the rule is the last in the list, it isn't moved.
 * @param rule  {ZmFilterRule}  rule    the rule to be moved
 * @param skipSave  {boolean}   true to not save
 */
ZmFilterRules.prototype.moveToBottom = 
function(rule, skipSave) {
	if (!rule) { return; }
	var index = this.getIndexOfRule(rule);
	if (index >= (this._vector.size() - 1)) { return; }
	
	while (index < this._vector.size() -1) {
		var nextRule = this._vector.removeAt(index+1);
		this._insertRule(nextRule, index);
		index++;
	}
	if (!skipSave) {
		this._saveRules(index, true);
	}
};

/**
 * Marks a rule as active/inactive.
 *
 * @param {ZmFilterRule}	rule			the rule to mark active/inactive
 * @param {Boolean}	active			if <code>true</code>, the rule is marked active
 */
ZmFilterRules.prototype.setActive =
function(rule, active) {
	if (!rule) { return; }
	DBG.println(AjxDebug.DBG3, "FILTER RULES: set active rule '" + rule.name + "', " + active);
	rule.active = active;
	this._saveRules(null, false);
};

// utility methods

/**
 * Gets the number of rules in the list.
 * 
 * @return	{int}		the number of rules
 */
ZmFilterRules.prototype.getNumberOfRules = 
function() {
	return this._vector.size();
};

/**
 * Gets the active rules in the list.
 * 
 * @return	{AjxVector}		the active rules
 */
ZmFilterRules.prototype.getActiveRules = 
function() {
	return this._vector.sub(function(rule){return !rule.active});
};

/**
 * Gets the numeric index of the rule in the list.
 *
 * @param {ZmFilterRule}	rule	a rule
 * @return	{int}	the index
 */
ZmFilterRules.prototype.getIndexOfRule = 
function(rule) {
	return this._vector.indexOf(rule);
};

/**
 * Gets a rule based on its index.
 *
 * @param {int}		index		the index
 * @return	{ZmFilterRule}	the rule
 */
ZmFilterRules.prototype.getRuleByIndex = 
function(index) {
    return this._vector.get(index);
};

/**
 * Gets a rule based on its ID.
 *
 * @param {String}	id		the rule ID
 * @return	{ZmFilterRule}	the rule
 */
ZmFilterRules.prototype.getRuleById = 
function(id) {
	return this._ruleIdHash[id];
};

/**
 * Gets a rule by name.
 *
 * @param {String}	name	the rule name
 * @return	{ZmFilterRule}	the rule
 */
ZmFilterRules.prototype.getRuleByName = 
function(name) {
	return this._ruleNameHash[name];
};

ZmFilterRules.prototype.getOutgoing = 
function(name) {
	return this._outgoing
};

/**
 * Loads the rules from the server.
 *
 * @param {Boolean}	force			if <code>true</code>, get rules from server
 * @param {AjxCallback}	callback		the callback
 */
ZmFilterRules.prototype.loadRules = 
function(force, callback) {
	// return cache?
	if (this._initialized && !force) {
		if (callback) {
			callback.run(new ZmCsfeResult(this._vector));
			return;
		}
		return this._vector;
	}

	// fetch from server:
	DBG.println(AjxDebug.DBG3, "FILTER RULES: load rules");
	var params = {
		soapDoc: AjxSoapDoc.create(this._outgoing ? "GetOutgoingFilterRulesRequest" : "GetFilterRulesRequest", "urn:zimbraMail"),
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseLoadRules, [callback])),
		accountName:this._accountName
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmFilterRules.prototype._handleResponseLoadRules =
function(callback, result) {
	this._vector.removeAll();
	this._ruleIdHash = {};
	this._ruleNameHash = {};

	var r = result.getResponse();
	var resp = this._outgoing ? r.GetOutgoingFilterRulesResponse : r.GetFilterRulesResponse;
	var children = resp.filterRules[0].filterRule;
	if (children) {
		for (var i = 0; i < children.length; i++) {
			var ruleNode = children[i];
			var rule = new ZmFilterRule(ruleNode.name, ruleNode.active, ruleNode.filterActions[0], ruleNode.filterTests[0]);
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
 * Public method to save the rules to the server.
 *
 * @param {int}	index			the index of rule to select in list after save
 * @param {Boolean}	notify			if <code>true</code>, notify listeners of change event
 * @param {AjxCallback}	callback		the callback
 * 
 * @public
 */
ZmFilterRules.prototype.saveRules = 
function(index, notify, callback) {
	this._saveRules(index, notify, callback);	
};

/**
 * Saves the rules to the server.
 *
 * @param {int}	index			the index of rule to select in list after save
 * @param {Boolean}	notify			if <code>true</code>, notify listeners of change event
 * @param {AjxCallback}	callback		the callback
 * 
 * @private
 */
ZmFilterRules.prototype._saveRules = 
function(index, notify, callback) {
	var requestKey = this._outgoing ? "ModifyOutgoingFilterRulesRequest" : "ModifyFilterRulesRequest";
	var jsonObj = {};
	jsonObj[requestKey] = {_jsns:"urn:zimbraMail"};

	var request = jsonObj[requestKey];

	var rules = this._vector.getArray();
	if (rules.length > 0) {
		request.filterRules = [{filterRule:[]}];
		var filterRuleObj = request.filterRules[0].filterRule;

		for (var i = 0; i < rules.length; i++) {
			var r = rules[i];
			var ruleObj = {
				active: r.active,
				name: r.name,
				filterActions: [],
				filterTests: []
			};
			ruleObj.filterActions.push(r.actions);
			ruleObj.filterTests.push(r.conditions);
			filterRuleObj.push(ruleObj);
		}
	} else {
		request.filterRules = {};
	}

	var params = {
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseSaveRules, [index, notify, callback])),
		errorCallback: (new AjxCallback(this, this._handleErrorSaveRules)),
		accountName: this._accountName
	};
	appCtxt.getAppController().sendRequest(params);
};

ZmFilterRules.prototype._handleResponseSaveRules =
function(index, notify, callback, result) {
	if (notify) {
		this._notify(ZmEvent.E_MODIFY, {index: index});
	}

    if(this._deleteMode){
        appCtxt.setStatusMsg(ZmMsg.filtersDeleted);
        this._deleteMode = false;
    }

    else if(appCtxt.getFilterRuleDialog().isEditMode()){
	    appCtxt.setStatusMsg(ZmMsg.filtersEdited);
    }
    else{
        appCtxt.setStatusMsg(ZmMsg.filtersSaved);
    }

	if (callback) {
		callback.run(result);
	}
};

/**
 * The save failed. Show an error dialog.
 * @param {AjxException}	ex		the exception
 * 
 * @private
 */
ZmFilterRules.prototype._handleErrorSaveRules =
function(ex) {
	if (ex.code == ZmCsfeException.SVC_PARSE_ERROR ||
		ex.code == ZmCsfeException.SVC_INVALID_REQUEST ||
		ex.code == ZmCsfeException.MAIL_NO_SUCH_FOLDER ||
		ex.code == ZmCsfeException.MAIL_NO_SUCH_TAG)
	{
		var msgDialog = appCtxt.getMsgDialog();

		var msg = '';
		switch(ex.code) {
			case ZmCsfeException.MAIL_NO_SUCH_FOLDER:
				msg = ZmMsg.errorNoSuchFolder;
				break;
			case ZmCsfeException.MAIL_NO_SUCH_TAG:
				msg = ZmMsg.errorNoSuchTag;
				break;
			default:
				msg = [ZmMsg.filterError, " ", AjxStringUtil.htmlEncode(ex.msg)].join("");
		}

		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();

		//only reload rules if the filter rule dialog is not popped up or if a new rule is being added
		//get index for refreshing list view
		if (!appCtxt.getFilterRuleDialog() || !appCtxt.getFilterRuleDialog().isPoppedUp() || !appCtxt.getFilterRuleDialog().isEditMode()) {
			var filterRulesController = ZmPreferencesApp.getFilterRulesController(this._outgoing);
			var sel = filterRulesController.getListView() ? filterRulesController.getListView().getSelection()[0] : null;
			var index = sel ? this.getIndexOfRule(sel) - 1: null;   //new filter is inserted into vector, subtract 1 to get the selected index
			var respCallback = new AjxCallback(this, this._handleResponseHandleErrorSaveRules, [index]);
			this.loadRules(true, respCallback);
		}
		return true;
	}
	return false;
};

// XXX: the caller should probably be the one doing this
ZmFilterRules.prototype._handleResponseHandleErrorSaveRules =
function(index) {
	var prefController = AjxDispatcher.run("GetPrefController");
	var prefsView = prefController.getPrefsView();
	var section = ZmPref.getPrefSectionWithPref(ZmSetting.FILTERS);
	if (section && prefsView && prefsView.getView(section.id)) {
        var filterRulesController = ZmPreferencesApp.getFilterRulesController(this._outgoing);
		filterRulesController.resetListView(index);
	}
};

/**
 * Inserts a rule into the internal vector. Adds to the end if no index is given.
 *
 * @param {ZmFilterRule}	rule		the rule to insert
 * @param {int}	index		the index at which to insert
 * 
 * @private
 */
ZmFilterRules.prototype._insertRule = 
function(rule, index) {
	this._vector.add(rule, index);
	this._ruleIdHash[rule.id] = rule;
	this._ruleNameHash[rule.name] = rule;
};

/**
 * Public method to insert rule into internval vectors.  Adds to the end if no index is given.
 * 
 * @param {ZmFilterRule}	rule		the rule to insert
 * @param {int}	index		the index at which to insert
 * 
 * @public
 */
ZmFilterRules.prototype.insertRule =
function(rule, index) {
	this._insertRule(rule, index);	
};