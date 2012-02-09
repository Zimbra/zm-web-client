/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmActivityStreamPromptDialog = function() {
	var extraButtons = new DwtDialog_ButtonDescriptor(ZmActivityStreamPromptDialog.ADD_ADVANCED_BUTTON, ZmMsg.advanced, DwtDialog.ALIGN_LEFT);
	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmActivityStreamPromptDialog", title:"Activity Stream Rules",
						  standardButtons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON], extraButtons: [extraButtons]});	
	// set content
	this.setContent(this._contentHtml());
	this._initialize();
	
	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText(ZmMsg.save);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._saveListener));
	
	var advancedButton = this.getButton(ZmActivityStreamPromptDialog.ADD_ADVANCED_BUTTON);
	this.setButtonListener(ZmActivityStreamPromptDialog.ADD_ADVANCED_BUTTON, new AjxListener(this, this._advancedListener));
};

ZmActivityStreamPromptDialog.prototype = new DwtDialog;
ZmActivityStreamPromptDialog.prototype.constructor = ZmActivityStreamPromptDialog;
ZmActivityStreamPromptDialog.ADD_ADVANCED_BUTTON = ++DwtDialog.LAST_BUTTON;

ZmActivityStreamPromptDialog.prototype._contentHtml = 
function() {   
	return "<div style='width: 400px' id='ACTIVITYSTREAM_PROMPT_FORM'>" + ZmMsg.activityStreamPrompt + "</div>";				
};

ZmActivityStreamPromptDialog.prototype._initialize = 
function() {
	var params = {};
	params.parent = this;
	params.template = "prefs.Pages#ActivityStreamPrompt";
	params.form = {
		items: [
			{ id: "SENTTO", type: "DwtCheckbox", label: ZmMsg.to, value: "to"},
			{ id: "TO", type: "DwtInputField", value: "", cols: 30},
			{ id: "RECEIVED", type: "DwtCheckbox", label: ZmMsg.receivedFrom, value: "received"},
			{ id: "FROM", type: "DwtInputField", value: "", cols: 30},
			{ id: "SUBJECT", type: "DwtCheckbox", label: ZmMsg.subjectContains, value: "subject"},
			{ id: "CONTAINS", type: "DwtInputField", value: "", cols: 30}
		]
	};
	this._activityStreamForm = new DwtForm(params);
	var activityStreamForm = document.getElementById("ACTIVITYSTREAM_PROMPT_FORM");
	this._activityStreamForm.appendElement(activityStreamForm);
	this._activityStreamForm.getControl("SUBJECT").setSelected(false);
};

ZmActivityStreamPromptDialog.prototype._handleResponseLoadRules = 
function() {
	this._activityRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);	
};

/**
 * Checks to see if new condition is being added before popping up dialog
 * @param skip {Boolean} true to skip new condition check
 */
ZmActivityStreamPromptDialog.prototype.popup = 
function(skip) {
	this._rules = AjxDispatcher.run("GetFilterRules");
	var callback = new AjxCallback(this, this._handleResponseLoadRules);
	this._rules.loadRules(true, callback); // make sure rules are loaded (for when we save)
	if (skip || this._isNewCondition(this._getActivityStreamRule())) {	
		DwtDialog.prototype.popup.call(this);
	}
};

/**
 * sets form fields
 * @param item  {ZmMailMsg} mail message
 */
ZmActivityStreamPromptDialog.prototype.setFields = 
function(item) {
	this._subject = item.subject;
	var msg = item.type == ZmId.ITEM_CONV ? item.getFirstHotMsg() : item;
	if (msg) {
		this._from = msg.getMsgSender();
	}
	else if (item.participants) {
		var arr = item.participants.getArray();
		for (var i=0; i<arr.length; i++) {
			if (arr[i].getType() == "FROM") {
				this._from = arr[i].getAddress();
			}
		}
	}


	var arr = msg._addrs && msg._addrs["TO"] && msg._addrs["TO"].getArray();
    this._to = (arr.length == 1) ? arr[0].getAddress() : "";

	if (this._subject) {
		var subjectField = this._activityStreamForm.getControl("CONTAINS");
		subjectField.setValue(this._subject);
	}
	
	if (this._from) {
		var fromField = this._activityStreamForm.getControl("FROM");
		fromField.setValue(this._from);
	}
    var toField = this._activityStreamForm.getControl("TO");
	toField.setValue(this._to);

};

ZmActivityStreamPromptDialog.prototype._saveListener =
function() {
	var foundCondition = this._setConditions(this._activityRule);		
	if (foundCondition) {
		this._rules.saveRules(null, true);
	}
	this.popdown();
};

ZmActivityStreamPromptDialog.prototype._setConditions = 
function(rule) {
	var received = this._activityStreamForm.getControl("RECEIVED");
    var sentto = this._activityStreamForm.getControl("SENTTO");
	var subject = this._activityStreamForm.getControl("SUBJECT");
	var foundCondition = false;
	
	if (received && received.isSelected() && rule) {
		var from = this._activityStreamForm.getControl("FROM");
		if (from) {
			rule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, from.getValue(), ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM]);
			foundCondition = true;
		}
	}

    if (sentto && sentto.isSelected() && rule) {
		var to = this._activityStreamForm.getControl("TO");
		if (to) {
			rule.addCondition(ZmFilterRule.TEST_ADDRESS, ZmFilterRule.OP_CONTAINS, to.getValue(), ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_TO]);
			foundCondition = true;
		}
	}
		
	if (subject && subject.isSelected() && rule) {
		var contains = this._activityStreamForm.getControl("CONTAINS");
		if (contains) {
			rule.addCondition(ZmFilterRule.TEST_HEADER, ZmFilterRule.OP_CONTAINS, contains.getValue(), ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT]);
			foundCondition = true;
		}
	}
	
	return foundCondition;
};

ZmActivityStreamPromptDialog.prototype._advancedListener =
function() {
	this.popdown(); //popdown existing 
	var filterRuleDialog = appCtxt.getFilterRuleDialog();
	this._setConditions(this._activityRule);
	filterRuleDialog.popup(this._activityRule, true);
};

/**
 * Determine if user has already created an activity stream condition with subject or email value.
 * @param  activityRule {ZmFilterRule} the activity stream rule to determine if condition already exists
 * @return {boolean} true this is a new condition or false condition with subject or email exists
 */
ZmActivityStreamPromptDialog.prototype._isNewCondition =
function(activityRule) {
	var newCondition = activityRule ? true : false;   //if we don't have an activity rule don't prompt user
	var conditionData = {};
	var header = "";
	var contains = -1;
	if (this._subject && activityRule) {
		var headerTest = activityRule.conditions[ZmFilterRule.TEST_HEADER] || [];
		for (var i=0; i<headerTest.length && newCondition; i++) {
			conditionData = headerTest[i];
			header = conditionData.header;
			contains = conditionData.value ? this._subject.indexOf(conditionData.value) : -1;		
			newCondition = !(header == ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_SUBJECT] && contains != -1);    
		}
	}
	
	if (this._from && activityRule && newCondition) {
		var addressTest = activityRule.conditions[ZmFilterRule.TEST_ADDRESS] || [];
		for (var i=0; i<addressTest.length && newCondition; i++) {
			conditionData = addressTest[i];
			header = conditionData.header;
			contains = conditionData.value ? this._from.indexOf(conditionData.value) : -1;
			newCondition = !(header == ZmFilterRule.C_FROM.toLowerCase() && contains != -1); 
		}
	}
	
	return newCondition;
};

ZmActivityStreamPromptDialog.prototype._getActivityStreamRule = 
function() {
	return this._activityStreamRule || this._rules.getRuleByName(ZmMsg.activityStreamsRule);	
};