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
	this._createControls();
	
	var okButton = this.getButton(DwtDialog.OK_BUTTON);
	okButton.setText(ZmMsg.save);
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this._rules = AjxDispatcher.run("GetFilterRules");
};

ZmPriorityMessageFilterDialog.prototype = new DwtDialog;
ZmPriorityMessageFilterDialog.prototype.constructor = ZmPriorityMessageFilterDialog;

ZmPriorityMessageFilterDialog.prototype._contentHtml = 
function() {   
	//TODO: move to template?
	var html = "<div style='width: 500px; height: 300px'>" + 
			     "<div>" + ZmMsg.priorityFilterDescription + "</div>" +
			     "<div class='horizSep'></div>" +
			     "<div style='float: left'>" + 
			        "<div id='MARK_AS_PRIORITY'></div>" + 
					 "<div id='FREQUENTLY_EMAIL'></div>" + 
					 "<div id='CONV_I_START'></div>" + 
					 "<div id='MENTIONS_DIRECT_MESSAGES'></div>" + 
					 "<div style='padding-left: 20px'>" + 
						"<div id='SOCIAL_LIST'></div>" +
					 "</div>" +
				  "</div>" +
				  "<div class='ZmPriorityFilterDivider' style='float: left;'></div>" +
				  "<div id='MOVE_MSG_STREAM'></div>" + 
				  "<div style='padding-left: 10px; float: left;'>" + 
					  "<div id='NOT_TO_ME'></div>" + 
					  "<div id='NOT_IN_ADDR'></div>" + 
					  "<div id='DL_SUBSCRIBED'></div>" + 
					  "<div id='MASS_MARKETING'></div>" +
			      "</div>" +
			  "</div>";
	
	return html;			
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
	
	if (this._priorityRule) {
		if (this._priorityRule.active) {
			this._markAsPriorityCbox.setEnabled(true);
			this._markAsPriorityCbox.setSelected(true);
		}
		else {
			this._markAsPriorityCbox.setSelected(false);
		}
		var conditions = this._priorityRule.conditions;
		//initialize checkboxes for conditions
		this._facebook.setSelected(false);
		this._socialCast.setSelected(false);
		this._twitter.setSelected(false);
		this._linkedIn.setSelected(false);
		this._convIStartCbox.setSelected(false);
		this._frequentEmailCbox.setSelected(false);

		for (var c in conditions) {
			var isNegative = AjxUtil.isArray(conditions[c]) && conditions[c][0].negative ? (conditions[c][0].negative == "1") : false;
			switch (c) {
				case ZmFilterRule.TEST_FACEBOOK:
					if (!isNegative) {
						this._facebook.setSelected(true);
						this._facebook.setEnabled(true);
						this._mentionsCbox.setSelected(true);
					}
					break;
				
				case ZmFilterRule.TEST_SOCIALCAST:
					if (!isNegative) {
						this._socialCast.setSelected(true);
						this._socialCast.setEnabled(true);
						this._mentionsCbox.setSelected(true);
					}
					break;
				
				case ZmFilterRule.TEST_TWITTER:
					if (!isNegative) {
						this._twitter.setSelected(true);
						this._twitter.setEnabled(true);
						this._mentionsCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_LINKEDIN:
					if (!isNegative) {
						this._linkedIn.setSelected(true);
						this._linkedIn.setEnabled(true);
						this._mentionsCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_CONVERSATIONS:
					var value = conditions[c][0].where;
					if (!isNegative && value == "started") {
						this._convIStartCbox.setSelected(true);
						this._convIStartCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_RANKING:
					var header = AjxUtil.isArray(conditions[c]) && conditions[c][0].header;
					if (!isNegative && header && header.toLowerCase() == ZmFilterRule.C_FROM.toLowerCase()) {
						this._frequentEmailCbox.setSelected(true);
						this._frequentEmailCbox.setEnabled(true);
					}
					break;
			}
		}
		this._onMarkAsPriority();
	}
	else {
		this._markAsPriorityCbox.setSelected(false);
	}
	
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
		this._massMarketingCbox.setSelected(false);
		this._dlSubscribedToCbox.setSelected(false);
		this._notInMyAddrBkCbox.setSelected(false);
		this._notToMeCbox.setSelected(false);
		for (var c in conditions) {
			var isNegative = AjxUtil.isArray(conditions[c]) && conditions[c][0].negative ? (conditions[c][0].negative == "1") : false;
			switch (c) {
				case ZmFilterRule.TEST_BULK:
					if (!isNegative) {
						this._massMarketingCbox.setSelected(true);
						this._massMarketingCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_LIST:
					if (!isNegative) {
						this._dlSubscribedToCbox.setSelected(true);
						this._dlSubscribedToCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_ADDRBOOK:
					var header = AjxUtil.isArray(conditions[c]) && conditions[c][0].header;
					if (isNegative && header && header.toLowerCase() == ZmFilterRule.C_FROM.toLowerCase()) {
						this._notInMyAddrBkCbox.setSelected(true);
						this._notInMyAddrBkCbox.setEnabled(true);
					}
					break;
				
				case ZmFilterRule.TEST_ME:
					var header = AjxUtil.isArray(conditions[c]) && conditions[c][0].header;
					if (isNegative && header && header.toLowerCase() == ZmFilterRule.C_TO.toLowerCase()) {
						this._notToMeCbox.setSelected(true);
						this._notToMeCbox.setEnabled(true);
					}
					break;
			}
		}
		this._onMoveMsgIntoStream();
	}
	else {
		this._moveMsgIntoStream.setSelected(false);
	}
};

ZmPriorityMessageFilterDialog.prototype._createControls = 
function() {
	this._markAsPriorityCbox = new DwtCheckbox({parent: this, id: "MARK_AS_PRIORITY", checked: false});
	this._markAsPriorityCbox.setText(ZmMsg.markAsPriorityRule);
	this._markAsPriorityCbox.replaceElement(document.getElementById("MARK_AS_PRIORITY"));
	var priorityListener = this._onMarkAsPriority.bind(this);
    this._markAsPriorityCbox.addSelectionListener(priorityListener);
	
	this._frequentEmailCbox = new DwtCheckbox({parent: this, id: Dwt.getNextId("FREQUENT_EMAIL_"), checked : true, className: "ZmPriorityFilterCriteria"});
	this._frequentEmailCbox.setText(ZmMsg.frequentEmail);
	this._frequentEmailCbox.replaceElement(document.getElementById("FREQUENTLY_EMAIL"));
	this._frequentEmailCbox.setEnabled(false);

    this._convIStartCbox = new DwtCheckbox({parent: this, id: Dwt.getNextId("CONV_I_START_"), checked: true, className: "ZmPriorityFilterCriteria"});
	this._convIStartCbox.setText(ZmMsg.convIStart);
	this._convIStartCbox.replaceElement(document.getElementById("CONV_I_START"));
	this._convIStartCbox.setEnabled(false);
	
	this._mentionsCbox = new DwtCheckbox({parent: this, id: Dwt.getNextId("MENTIONS_DIRECT_MESSAGES"), checked: true, className: "ZmPriorityFilterCriteria"});
    this._mentionsCbox.setText(ZmMsg.mentionsDirectMessages);
	this._mentionsCbox.replaceElement(document.getElementById("MENTIONS_DIRECT_MESSAGES"));
	this._mentionsCbox.setEnabled(false);
	var socialListener = this._onMentions.bind(this);
	this._mentionsCbox.addSelectionListener(socialListener);
	
	var socialList = new DwtComposite({parent: this, id: Dwt.getNextId("SOCIAL_LIST_"), className: "ZmPriorityFilterSocialList"});
	socialList.setScrollStyle(Dwt.SCROLL);
	socialList.replaceElement(document.getElementById("SOCIAL_LIST"));
	socialList.setEnabled(false);
	
	//TODO: Which of these social boxes should be configurable?
	this._socialCast = new DwtCheckbox({parent: socialList, id: Dwt.getNextId("SOCIAL_CAST_"), checked: true, className: "ZmPriorityFilterCriteria"});
	this._socialCast.setText(ZmMsg.socialcast);
	this._socialCast.setEnabled(false);
	
	this._facebook = new DwtCheckbox({parent: socialList, id: Dwt.getNextId("FACEBOOK_"), checked: true, className: "ZmPriorityFilterCriteria"});
	this._facebook.setText(ZmMsg.facebook);
	this._facebook.setEnabled(false);
	
	this._twitter = new DwtCheckbox({parent: socialList, id: Dwt.getNextId("TWITTER_"), checked: true, className: "ZmPriorityFilterCriteria"});
	this._twitter.setText(ZmMsg.twitter);
	this._twitter.setEnabled(false);
	
	this._linkedIn = new DwtCheckbox({parent: socialList, id: Dwt.getNextId("LINKEDIN_"), checked: true, className: "ZmPriorityFilterCriteria"});
	this._linkedIn.setText(ZmMsg.linkedin);
	this._linkedIn.setEnabled(false);
	this._socialNetworks = [this._socialCast, this._facebook, this._twitter, this._linkedIn];
	
	this._moveMsgIntoStream = new DwtCheckbox({parent: this, id: "MOVE_MSG_STREAM", checked: false});
	this._moveMsgIntoStream.setText(ZmMsg.moveToActivityStream);
	this._moveMsgIntoStream.replaceElement(document.getElementById("MOVE_MSG_STREAM"));
	var streamListener = this._onMoveMsgIntoStream.bind(this);
	this._moveMsgIntoStream.addSelectionListener(streamListener);
	
	this._notToMeCbox = new DwtCheckbox({parent: this, id: "NOT_TO_ME_", checked: true, className: "ZmPriorityFilterCriteria"});
	this._notToMeCbox.setText(ZmMsg.moveNotToMe);
	this._notToMeCbox.replaceElement(document.getElementById("NOT_TO_ME"));
	this._notToMeCbox.setEnabled(false);
	
	this._notInMyAddrBkCbox = new DwtCheckbox({parent: this, id: "NOT_IN_ADDR_", checked: true, className: "ZmPriorityFilterCriteria"});
	this._notInMyAddrBkCbox.setText(ZmMsg.moveNotInAddrBook);
	this._notInMyAddrBkCbox.replaceElement(document.getElementById("NOT_IN_ADDR"));
	this._notInMyAddrBkCbox.setEnabled(false);
	
	this._dlSubscribedToCbox = new DwtCheckbox({parent: this, id: "DL_SUBSCRIBED_", checked: true, className: "ZmPriorityFilterCriteria"});
	this._dlSubscribedToCbox.setText(ZmMsg.moveNotSubscribedTo);
	this._dlSubscribedToCbox.replaceElement(document.getElementById("DL_SUBSCRIBED"));
	this._dlSubscribedToCbox.setEnabled(false);
	
	this._massMarketingCbox = new DwtCheckbox({parent: this, id: "MASS_MARKETING_", checked: true, className: "ZmPriorityFilterCriteria"});
	this._massMarketingCbox.setText(ZmMsg.massMarketingMessages);
	this._massMarketingCbox.replaceElement(document.getElementById("MASS_MARKETING"));
	this._massMarketingCbox.setEnabled(false);
};

ZmPriorityMessageFilterDialog.prototype._onMarkAsPriority = 
function() {
	var enabled = this._markAsPriorityCbox.isSelected();
	this._frequentEmailCbox.setEnabled(enabled);
	this._convIStartCbox.setEnabled(enabled);
	this._mentionsCbox.setEnabled(enabled);
	this._onMentions();
};

ZmPriorityMessageFilterDialog.prototype._onMentions = 
function() {
	var enabled = this._mentionsCbox.isSelected() && this._mentionsCbox.getEnabled();
	for (var i=0; i < this._socialNetworks.length; i++) {
		this._socialNetworks[i].setEnabled(enabled);
	}
};

ZmPriorityMessageFilterDialog.prototype._onMoveMsgIntoStream = 
function() {
	var enabled = this._moveMsgIntoStream.isSelected();
	this._notToMeCbox.setEnabled(enabled);
	this._notInMyAddrBkCbox.setEnabled(enabled);
	this._dlSubscribedToCbox.setEnabled(enabled);
	this._massMarketingCbox.setEnabled(enabled);
};

ZmPriorityMessageFilterDialog.prototype._okButtonListener = 
function() {
	//build filter
	var foundCondition = false;
	var needSave = false; 
	var runNowPrompt = false;
	var prioritySelected = this._markAsPriorityCbox.isSelected();
	if (prioritySelected) {
		var isRankingTest = this._frequentEmailCbox.isSelected();
		var isConversationTest = this._convIStartCbox.isSelected();
		var isSocialTest = this._mentionsCbox.isSelected();
		var isFacebookTest = isSocialTest && this._facebook.isSelected();
		var isLinkedinTest = isSocialTest && this._linkedIn.isSelected();
		var isSocialcastTest = isSocialTest && this._socialCast.isSelected();
		var isTwitterTest = isSocialTest && this._twitter.isSelected();
		var rule = new ZmFilterRule(ZmMsg.markAsPriorityRule, true, {}, {});
		rule.setGroupOp(ZmFilterRule.GROUP_ANY);
		if (isFacebookTest) {
			rule.addCondition(ZmFilterRule.TEST_FACEBOOK);
			foundCondition = true;
		}
		if (isTwitterTest) {
			rule.addCondition(ZmFilterRule.TEST_TWITTER);
			foundCondition = true;
		}
		
		if (isSocialcastTest) {
			rule.addCondition(ZmFilterRule.TEST_SOCIALCAST);
			foundCondition = true;
		}
		
		if (isLinkedinTest) {
			rule.addCondition(ZmFilterRule.TEST_LINKEDIN);
			foundCondition = true;
		}
		
		if (isConversationTest) {
			rule.addCondition(ZmFilterRule.TEST_CONVERSATIONS, null, "started");
			foundCondition = true;
		}
		
		if (isRankingTest) {
			rule.addCondition(ZmFilterRule.TEST_RANKING, null , null, ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM]);
		}
		
		if (foundCondition) {
			rule.addAction(ZmFilterRule.A_FLAG, "priority");
			rule.addAction(ZmFilterRule.A_STOP);
			var priorityRule = this._rules.getRuleByName(ZmMsg.markAsPriorityRule);
			if (priorityRule) {
				priorityRule.conditions = rule.conditions;
				priorityRule.actions = rule.actions;
				priorityRule.active = true;
				needSave = true;
			}
			else {
				this._rules.insertRule(rule, 0); //make it first in list
				needSave = true;
				runNowPrompt = true;
			}
			
		}
	}
	else {
		//User didn't check mark as priority; set existing filter rule to non-active
		var priorityRule = this._rules.getRuleByName(ZmMsg.markAsPriorityRule);
		if (priorityRule) {	
			priorityRule.active = false;
			needSave = true;
		}
	}
	
	foundCondition = false;
	var moveMsgSelected = this._moveMsgIntoStream.isSelected();
	if (moveMsgSelected) {
		var streamRule = new ZmFilterRule(ZmMsg.activityStreamsRule, true, {}, {});
		streamRule.setGroupOp(ZmFilterRule.GROUP_ANY);
		var isNotToMe = this._notToMeCbox.isSelected();
		var isNotInAddrBk = this._notInMyAddrBkCbox.isSelected();
		var isDLSubTo = this._dlSubscribedToCbox.isSelected();
		var isMassMarketing = this._massMarketingCbox.isSelected();
		
		if (isNotToMe) {
			streamRule.addCondition(ZmFilterRule.TEST_ME, ZmFilterRule.OP_NOT_IS, null, ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_TO]); 
			foundCondition = true;
		}
		
		if (isNotInAddrBk) {
			streamRule.addCondition(ZmFilterRule.TEST_ADDRBOOK, ZmFilterRule.OP_NOT_IN ,"contacts", ZmFilterRule.C_HEADER_VALUE[ZmFilterRule.C_FROM]); //Address in From not in Contacts
			foundCondition = true;
		}
		
		if (isDLSubTo) {
			streamRule.addCondition(ZmFilterRule.TEST_LIST); 
			foundCondition = true;
		}
		
		if (isMassMarketing) {
			streamRule.addCondition(ZmFilterRule.TEST_BULK);
			foundCondition = true;
		}
		
		if (foundCondition) {
			streamRule.addAction(ZmFilterRule.A_FOLDER, ZmMsg.activityStreamsRule); 
			var activityRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
			if (activityRule) {
				activityRule.conditions = streamRule.conditions;
				activityRule.actions = streamRule.actions;
				activityRule.active = true;
				needSave = true;

			}
			else {
				var index = this._rules.getIndexOfRule(ZmMsg.markAsPriorityRule);
				this._rules.insertRule(streamRule, index); 
				needSave = true;
				runNowPrompt = true;
			}
		}
	}
	else {
		//set existing rule to be non-active
		var activityRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
		if (activityRule) {
			activityRule.active = false;
			needSave = true;
		}
	}
	
	if (needSave) {
		this._rules.saveRules(null, true); 
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
	var html = "<div style='width: 250px; float: left;'>" + ZmMsg.messagePrioritizationTips + "</div><div style='float:right;'>";
	html += DwtDialog.prototype._getButtonsContainerStartTemplate.call(this);
	return html;
};

ZmPriorityMessageFilterDialog.prototype._getButtonsContainerEndTemplate = 
function() {
	var html = "</div>";
	html += DwtDialog.prototype._getButtonsContainerEndTemplate.call(this);
	return html;
};