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

ZmPriorityMessageFilterDialog = function() {

	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmPriorityMessageFilterDialog", title:ZmMsg.priorityMessageFilter});

	// set content
	this.setContent(this._contentHtml());
	this._initialize();
	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText(ZmMsg.save);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._rules = AjxDispatcher.run("GetFilterRules");
};

ZmPriorityMessageFilterDialog.prototype = new DwtDialog;
ZmPriorityMessageFilterDialog.prototype.constructor = ZmPriorityMessageFilterDialog;

ZmPriorityMessageFilterDialog.prototype._contentHtml = 
function() {   
	var html = "<div style='width: 500px; height: 300px' id='PRIORITYMESSAGE_PROMPT_FORM'>";
	return html;			
};

ZmPriorityMessageFilterDialog.prototype._initialize = 
function() {
	this._initSocialFilters();
	var priorityListener = this._onMarkAsPriority.bind(this);
	var streamListener = this._onMoveMsgIntoStream.bind(this);
	var socialListener = this._onMentions.bind(this);
	var advancedListener = this._onAdvancedControls.bind(this);
	var params = {};
	params.parent = this;
	params.template = "prefs.Pages#PriorityMessageFilterPrompt";
	params.id = "PriorityInboxDialog";
	params.form = {
		items: [
			{ id: "MARK_AS_PRIORITY", type: "DwtCheckbox", label: ZmMsg.markAsPriorityRule, checked: false, onclick: priorityListener},
			{ id: "FREQUENTLY_EMAIL", type: "DwtCheckbox", label: ZmMsg.frequentEmail, checked: true},
			{ id: "CONV_I_START", type: "DwtCheckbox", label: ZmMsg.convIStart, checked: true},
			{ id: "MENTIONS_DIRECT_MESSAGES", type: "DwtCheckbox", label: ZmMsg.mentionsDirectMessages, checked: true, onclick: socialListener},
			{ id: "SOCIAL_CAST", type: "DwtCheckbox", label: ZmMsg.socialcast, checked: true},
			{ id: "FACEBOOK", type: "DwtCheckbox", label: ZmMsg.facebook, checked: true},
			{ id: "TWITTER", type: "DwtCheckbox", label: ZmMsg.twitter, checked: true},
			{ id: "LINKEDIN", type: "DwtCheckbox", label: ZmMsg.linkedin, checked: true},
			{ id: "PRIORITY_ADVANCED", type: "DwtBorderlessButton", label: "<a href='javascript:void(0)'>" + ZmMsg.advancedControls + "</a>", onclick: advancedListener},
			{ id: "MOVE_MSG_STREAM", type: "DwtCheckbox", label: ZmMsg.moveToActivityStream, checked: false, onclick: streamListener},
			{ id: "NOT_TO_ME", type: "DwtCheckbox", label: ZmMsg.moveNotToMe, checked: true},
			{ id: "NOT_IN_ADDR", type: "DwtCheckbox", label: ZmMsg.moveNotInAddrBook, checked: true},
			{ id: "DL_SUBSCRIBED", type: "DwtCheckbox", label: ZmMsg.moveNotSubscribedTo, checked: true},
			{ id: "MASS_MARKETING", type: "DwtCheckbox", label: ZmMsg.massMarketingMessages, checked: true},
			{ id: "STREAM_ADVANCED", type: "DwtBorderlessButton", label: "<a href='javascript:void(0)'>" + ZmMsg.advancedControls + "</a>", onclick: advancedListener}
		]
	};
	this._priorityMessageForm = new DwtForm(params);
	var div = document.getElementById("PRIORITYMESSAGE_PROMPT_FORM");
	this._priorityMessageForm.appendElement(div);
	
	this._markAsPriority = this._priorityMessageForm.getControl("MARK_AS_PRIORITY");
	this._frequentEmail = this._priorityMessageForm.getControl("FREQUENTLY_EMAIL");
	this._convIStart = this._priorityMessageForm.getControl("CONV_I_START");
	this._mentions = this._priorityMessageForm.getControl("MENTIONS_DIRECT_MESSAGES");
	this._moveMsgIntoStream = this._priorityMessageForm.getControl("MOVE_MSG_STREAM");
	this._notToMe = this._priorityMessageForm.getControl("NOT_TO_ME");
	this._notInMyAddrBk = this._priorityMessageForm.getControl("NOT_IN_ADDR");
	this._dlSubscribedTo = this._priorityMessageForm.getControl("DL_SUBSCRIBED");
	this._massMarketing = this._priorityMessageForm.getControl("MASS_MARKETING");
	this._facebook = this._priorityMessageForm.getControl("FACEBOOK");
	this._socialCast = this._priorityMessageForm.getControl("SOCIAL_CAST");
	this._twitter = this._priorityMessageForm.getControl("TWITTER");
	this._linkedIn = this._priorityMessageForm.getControl("LINKEDIN");
	this._socialNetworks = [];
	
	this._frequentEmail.addClassName('ZmPriorityFilterCriteria');
	this._convIStart.addClassName('ZmPriorityFilterCriteria');
	this._mentions.addClassName('ZmPriorityFilterCriteria');
	
	this._streamAdvanced = this._priorityMessageForm.getControl("STREAM_ADVANCED");
	this._streamAdvanced.addClassName("ZmPriorityFilterCriteria");
	
	this._priorityAdvanced = this._priorityMessageForm.getControl("PRIORITY_ADVANCED");
	this._priorityAdvanced.addClassName("ZmPriorityFilterCriteria");

	this._priorityHash = {};
	if (this._facebookEnabled) {
		this._socialNetworks.push(this._facebook);
		this._priorityHash[ZmFilterRule.TEST_FACEBOOK] = {control: this._facebook, mentions: true, negative: false};
	}
	else {
		this._facebook.setVisible(false);
	}
	if (this._socialCastEnabled) {		
		this._socialNetworks.push(this._socialCast);
		this._priorityHash[ZmFilterRule.TEST_SOCIALCAST] = {control: this._socialCast, mentions: true, negative: false};
	}
	else {
		this._socialCast.setVisible(false);
	}
	if (this._twitterEnabled) {		
		this._socialNetworks.push(this._twitter);
		this._priorityHash[ZmFilterRule.TEST_TWITTER] = {control: this._twitter, mentions: true, negative: false};
	}
	else {
		this._twitter.setVisible(false);
	}
	if (this._linkedInEnabled) {		
		this._socialNetworks.push(this._linkedIn);
		this._priorityHash[ZmFilterRule.TEST_LINKEDIN] = {control: this._linkedIn, mentions: true, negative: false};
	}
	else {
		this._linkedIn.setVisible(false);
	}
	this._priorityHash[ZmFilterRule.TEST_CONVERSATIONS] = {control: this._convIStart, mentions: false, negative: false, headerValue: "started"};
	this._priorityHash[ZmFilterRule.TEST_RANKING] = {control: this._frequentEmail, mentions: false, negative: false, headerValue: "from"};
	
	this._streamHash = {};
	this._streamHash[ZmFilterRule.TEST_BULK] = {control: this._massMarketing, negative: false};
	this._streamHash[ZmFilterRule.TEST_LIST] = {control: this._dlSubscribedTo, negative: false};
	this._streamHash[ZmFilterRule.TEST_ADDRBOOK] = {control: this._notInMyAddrBk, negative: true, headerValue: "from"};
	this._streamHash[ZmFilterRule.TEST_ME] = {control: this._notToMe, negative: true, headerValue: "to"};
};

ZmPriorityMessageFilterDialog.prototype.popup =
function() {
	var callback = new AjxCallback(this, this._handleResponseLoadRules);
	this._rules.loadRules(true, callback); // make sure rules are loaded (for when we save)
	
	DwtDialog.prototype.popup.call(this);
};

ZmPriorityMessageFilterDialog.prototype._handleResponseLoadRules =
function() {
	this._priorityRule = this._rules.getRuleByName(ZmMsg.markAsPriorityRule);
	this._activityStreamRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
	this._setPrioritySelections(); 
	this._setStreamSelections();
};

ZmPriorityMessageFilterDialog.prototype._onMarkAsPriority = 
function() {
	var enabled = this._markAsPriority.isSelected();
	this._frequentEmail.setEnabled(enabled);
	this._convIStart.setEnabled(enabled);
	this._mentions.setEnabled(enabled);
	this._onMentions();
};

ZmPriorityMessageFilterDialog.prototype._onMentions = 
function() {
	var enabled = this._mentions.isSelected() && this._mentions.getEnabled();
	for (var i=0; i < this._socialNetworks.length; i++) {
		this._socialNetworks[i].setEnabled(enabled);
	}
};

ZmPriorityMessageFilterDialog.prototype._onMoveMsgIntoStream = 
function() {
	var enabled = this._moveMsgIntoStream.isSelected();
	this._notToMe.setEnabled(enabled);
	this._notInMyAddrBk.setEnabled(enabled);
	this._dlSubscribedTo.setEnabled(enabled);
	this._massMarketing.setEnabled(enabled);
};

ZmPriorityMessageFilterDialog.prototype._onAdvancedControls = 
function(controlId) {
	this.popdown(); //popdown existing 
	var filterRuleDialog = appCtxt.getFilterRuleDialog();
	var isPriority = false;
	var rule = null;
	if (controlId == "PRIORITY_ADVANCED") {
		rule = this._priorityRule;
		isPriority = true;
	}
	else if (controlId == "STREAM_ADVANCED") {
		rule = this._activityStreamRule;	
	}
	
	if (rule) {
		filterRuleDialog.popup(rule, true);		
	}
	else {
		//create rule with default conditions
		var ruleName = isPriority ? ZmMsg.markAsPriorityRule : ZmMsg.activityStreamsRule;
		var rule = new ZmFilterRule(ruleName, true, {}, {});
		if (isPriority) {
			rule.addAction(ZmFilterRule.A_FLAG, ZmFilterRule.PRIORITY);
			rule.addAction(ZmFilterRule.A_STOP);
			for (var id in this._priorityHash) {
				if (id == ZmFilterRule.TEST_CONVERSATIONS) {
					rule.addCondition(id, null, "started");	
				}
				else if (id == ZmFilterRule.TEST_RANKING) {
					rule.addCondition(id, null , null, this._priorityHash[id].headerValue);
				}
				else {
					rule.addCondition(id);
				}
			}
		}
		else {
			rule.addAction(ZmFilterRule.A_FOLDER, ZmMsg.activityStreamsRule);
			for (var id in this._streamHash) {
				if (id == ZmFilterRule.TEST_ME) {
					rule.addCondition(id, ZmFilterRule.OP_NOT_IS, null, this._streamHash[id].headerValue);	
				}
				else if (id == ZmFilterRule.TEST_ADDRBOOK) {
					rule.addCondition(id, ZmFilterRule.OP_NOT_IN ,"contacts", this._streamHash[id].headerValue); //Address in From not in Contacts	
				}
				else {
					rule.addCondition(id);
				}
			}
		}
		rule.setGroupOp(ZmFilterRule.GROUP_ANY);		
		filterRuleDialog.popup(rule, true);
	}
};

ZmPriorityMessageFilterDialog.prototype._setPrioritySelections = 
function() {
	if (this._priorityRule) {
		if (this._priorityRule.active) {
			this._markAsPriority.setEnabled(true);
			this._markAsPriority.setSelected(true);
		}
		else {
			this._markAsPriority.setSelected(false);
		}
		var conditions = this._priorityRule.conditions;
		//initialize checkboxes for conditions
		if (this._facebook) {
			this._facebook.setSelected(false);
		}
		if (this._socialCast) {
			this._socialCast.setSelected(false);
		}
		if (this._twitter) {
			this._twitter.setSelected(false);
		}
		if (this._linkedIn) {
			this._linkedIn.setSelected(false);
		}
		this._convIStart.setSelected(false);
		this._frequentEmail.setSelected(false);
	
		for (var c in conditions) {
			var isNegative = AjxUtil.isArray(conditions[c]) && conditions[c][0].negative ? (conditions[c][0].negative == "1") : false;
			var control = this._priorityHash[c] && this._priorityHash[c].control;
			if (c == ZmFilterRule.TEST_CONVERSATIONS && !isNegative) {
				var value = AjxUtil.isArray(conditions[c]) && conditions[c][0].where;
				if (value == "started") {
					control.setSelected(true);
					control.setEnabled(true);
				}	
			}
			else if (c == ZmFilterRule.TEST_RANKING && !isNegative) {
				var header = AjxUtil.isArray(conditions[c]) && conditions[c][0].header;
				if (header && header.toLowerCase() == ZmFilterRule.C_FROM.toLowerCase()) {
					control.setSelected(true);
					control.setEnabled(true);
				}	
			}
			else if (this._priorityHash[c] && !isNegative && this._priorityHash[c].mentions) {
				control.setSelected(true);
				control.setEnabled(true);
				this._mentions.setSelected(true);
			}
		}	
	}
	else {
		this._markAsPriority.setSelected(false);
	}
	this._onMarkAsPriority();	
};

ZmPriorityMessageFilterDialog.prototype._setStreamSelections = 
function() {
	if (this._activityStreamRule) {
		if (this._activityStreamRule.active) {
			this._moveMsgIntoStream.setEnabled(true);
			this._moveMsgIntoStream.setSelected(true);
		}
		else {
			this._moveMsgIntoStream.setSelected(false);
		}
		var conditions = this._activityStreamRule.conditions;
		//initialize checkboxes before loading them
		this._massMarketing.setSelected(false);
		this._dlSubscribedTo.setSelected(false);
		this._notInMyAddrBk.setSelected(false);
		this._notToMe.setSelected(false);

		for (var c in conditions) {
			var isNegative = AjxUtil.isArray(conditions[c]) && conditions[c][0].negative ? (conditions[c][0].negative == "1") : false;
			if (this._streamHash[c]) {
				if (isNegative && (c == ZmFilterRule.TEST_ADDRBOOK || c == ZmFilterRule.TEST_ME)) {
					var header = AjxUtil.isArray(conditions[c]) && conditions[c][0].header;
					var value = (c == ZmFilterRule.TEST_ADDRBOOK) ? ZmFilterRule.C_FROM : ZmFilterRule.C_TO;
					if (header && header.toLowerCase() == value.toLowerCase()) {
						this._streamHash[c].control.setSelected(true);
						this._streamHash[c].control.setEnabled(true);
					}
				}
				else if (!isNegative) {
					this._streamHash[c].control.setSelected(true);
					this._streamHash[c].control.setEnabled(true);
				}
			}
		}
	}
	else {
		this._moveMsgIntoStream.setSelected(false);
	}
	this._onMoveMsgIntoStream();	
};

ZmPriorityMessageFilterDialog.prototype._okButtonListener = 
function() {
	//build filter
	var foundCondition = false;
	var needSave = false; 
	var runNowPrompt = false;
	var condition = {};
	var priorityRule = this._rules.getRuleByName(ZmMsg.markAsPriorityRule);
	var activityRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
	
	if (this._markAsPriority.isSelected()) {		
		var rule = new ZmFilterRule(ZmMsg.markAsPriorityRule, true, {}, {});
		rule.addAction(ZmFilterRule.A_FLAG, "priority");
		rule.setGroupOp(ZmFilterRule.GROUP_ANY);		
		
		for (var id in this._priorityHash) {
			var control = this._priorityHash[id].control;
			var mentions = this._priorityHash[id].mentions ? this._mentions.isSelected() : true;
			var negative = this._priorityHash[id].negative;
			var headerValue = this._priorityHash[id].headerValue;
			if (control.isSelected() && mentions) {
				if (id == ZmFilterRule.TEST_CONVERSATIONS) {
					rule.addCondition(id, null, "started");	
				}
				else if (id == ZmFilterRule.TEST_RANKING) {
					rule.addCondition(id, null , null, headerValue);
				}
				else {
					rule.addCondition(id);
				}
				foundCondition = true;
			}
			else if (priorityRule) {
				priorityRule = this._removeCondition(priorityRule, id, negative, headerValue);
			}
		}				
		if (foundCondition && priorityRule) {			
			for (var id in rule.conditions) {
				priorityRule.conditions[id] = rule.conditions[id];
			}				
			for (var id in rule.actions) {
				priorityRule.actions[id] = rule.actions[id];
			}				
			priorityRule.active = true;
			needSave = true;
		}
		else if (foundCondition) {
				this._rules.insertRule(rule, 0); //make it first
				needSave = true;
				runNowPrompt = true;		
		}
		else if (priorityRule) {
			//no conditions selected
			return this._handleConditionsError(ZmMsg.ruleNoConditionPriorityFilter);
		}
	}
	else if (priorityRule){
		priorityRule.active = false;
		needSave = true;
	}
	//handle activity streams
	foundCondition = false;
	if (this._moveMsgIntoStream.isSelected()) {
		var streamRule = new ZmFilterRule(ZmMsg.activityStreamsRule, true, {}, {});
		streamRule.addAction(ZmFilterRule.A_FOLDER, ZmMsg.activityStreamsRule); 
		streamRule.setGroupOp(ZmFilterRule.GROUP_ANY);
		var flagRule = new ZmFilterRule(ZmMsg.priorityFlagRule, true, {}, {});
		flagRule.addCondition(ZmFilterRule.TEST_FLAGGED, null, ZmFilterRule.PRIORITY);
		flagRule.addAction(ZmFilterRule.A_KEEP);
		flagRule.addAction(ZmFilterRule.A_STOP);
		
		for (var id in this._streamHash) {
			var control = this._streamHash[id].control;
			var negative = this._streamHash[id].negative;
			var headerValue = this._streamHash[id].headerValue;
			if (control.isSelected()) {
				if (id == ZmFilterRule.TEST_ME) {
					streamRule.addCondition(id, ZmFilterRule.OP_NOT_IS, null, headerValue);	
				}
				else if (id == ZmFilterRule.TEST_ADDRBOOK) {
					streamRule.addCondition(id, ZmFilterRule.OP_NOT_IN ,"contacts", headerValue); //Address in From not in Contacts	
				}
				else {
					streamRule.addCondition(id);
				}
				foundCondition = true;
			}
			else if (activityRule) {
				activityRule = this._removeCondition(activityRule, id, negative, headerValue);
			}
		}
		
		if (foundCondition && activityRule) {
			for (var id in streamRule.conditions) {
				activityRule.conditions[id] = streamRule.conditions[id];
			}
	
			for (var id in streamRule.actions) {
				activityRule.actions[id] = streamRule.actions[id];
			}
	
			activityRule.active = true;
			needSave = true;
		}
		else if(foundCondition) {
			this._rules.insertRule(flagRule);
			this._rules.insertRule(streamRule); //insert last
			needSave = true;
			runNowPrompt = true;
		}
		else if (activityRule) {
			return this._handleConditionsError(ZmMsg.ruleNoConditonActivityFilter);	
		}
	}
	else if (activityRule) {
		//set existing rule to be non-active
		activityRule.active = false;
		needSave = true;
	}
	
	if (needSave) {
		this._rules.saveRules(null, true);
		this._createActivityStreamsFolder();
	}
	
	this.popdown();
	
	if (runNowPrompt) {
		var promptDialog = appCtxt.getPriorityMessagePromptDialog();
		promptDialog.setFilterRules(this._rules);
		promptDialog.popup();
	}
		
};

ZmPriorityMessageFilterDialog.prototype._getButtonsContainerStartTemplate =
function() {
	var html = "<div style='width: 250px; float: left;'>" + AjxMessageFormat.format(ZmMsg.messagePrioritizationTips, [appCtxt.get(ZmSetting.HELP_URI)]) + "</div><div style='float:right;'>";
	html += DwtDialog.prototype._getButtonsContainerStartTemplate.call(this);
	return html;
};

ZmPriorityMessageFilterDialog.prototype._getButtonsContainerEndTemplate = 
function() {
	var html = "</div>";
	html += DwtDialog.prototype._getButtonsContainerEndTemplate.call(this);
	return html;
};

/**
 * checks condition and value to determine if it should be removed; comparators are not checked
 * @param rule
 * @param condition
 * @param isNegative
 * @param headerValue
 */
ZmPriorityMessageFilterDialog.prototype._removeCondition = 
function(rule, condition, isNegative, headerValue) {
	var c = rule.conditions[condition];
	if (c) {
		for (var i=0; i<c.length; i++) {
			var negativeCheck = isNegative ? c[i].negative == "1" : !c[i].negative;
			var headerCheck = headerValue ? c[i].header == headerValue : true;
			if (condition == ZmFilterRule.TEST_CONVERSATIONS) {
				headerCheck = headerValue ? c[i].where == headerValue : true;
			}
			if (negativeCheck && headerCheck) {				
				c.splice(i, 1);
				rule.conditions[condition] = c;
			}
		} 			
	}
	return rule;
};

ZmPriorityMessageFilterDialog.prototype._handleConditionsError =
function(msg) {  
	var msgDialog = appCtxt.getMsgDialog();
	msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
	msgDialog.popup();
};

ZmPriorityMessageFilterDialog.prototype._initSocialFilters = 
function() {	
	this._facebookEnabled = false;
	this._twitterEnabled = false;
	this._linkedInEnabled = false;
	this._socialCastEnabled = false;
	this._socialFilters = appCtxt.get(ZmSetting.SOCIAL_FILTERS_ENABLED);
	if (this._socialFilters && this._socialFilters.length) {
		for (var i=0; i<this._socialFilters.length; i++) {
			if (this._socialFilters[i].toLowerCase() == ZmFilterRule.C_FACEBOOK.toLowerCase()) {
				this._facebookEnabled = true;	
			}
			else if (this._socialFilters[i].toLowerCase() == ZmFilterRule.C_TWITTER.toLowerCase()) {
				this._twitterEnabled = true;	
			}
			else if (this._socialFilters[i].toLowerCase() == ZmFilterRule.C_LINKEDIN.toLowerCase()) {
				this._linkedInEnabled = true;	
			}
			else if (this._socialFilters[i].toLowerCase() == ZmFilterRule.C_SOCIALCAST.toLowerCase()) {
				this._socialCastEnabled = true;	
			}
			
		}
	}
};

ZmPriorityMessageFilterDialog.prototype._createActivityStreamsFolder =
function() {
	var jsonObj = {CreateFolderRequest:{_jsns:"urn:zimbraMail"}};
	var folder = jsonObj.CreateFolderRequest.folder = {l: ZmOrganizer.ID_ROOT, name: ZmMsg.activityStreamsRule, fie: 1};
	return appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: true
	});
};

