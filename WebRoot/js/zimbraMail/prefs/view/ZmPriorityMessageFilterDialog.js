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

	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmPriorityMessageFilterDialog", title:ZmMsg.activityStream});

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
	var html = "<div style='width: 400px; height: 225px' id='PRIORITYMESSAGE_PROMPT_FORM'>";
	return html;			
};

ZmPriorityMessageFilterDialog.prototype._initialize = 
function() {
	var streamListener = this._onMoveMsgIntoStream.bind(this);
	var advancedListener = this._onAdvancedControls.bind(this);
	var params = {};
	params.parent = this;
	params.template = "prefs.Pages#PriorityMessageFilterPrompt";
	params.id = "PriorityInboxDialog";
	params.form = {
		items: [
			{ id: "MOVE_MSG_STREAM", type: "DwtCheckbox", label: ZmMsg.enableActivityStream, checked: false, onclick: streamListener},
			{ id: "NOT_TO_ME", type: "DwtCheckbox", label: ZmMsg.moveNotToMe, checked: true},
			{ id: "SELECT_FIELD", type: "DwtSelect", items:[ZmMsg.to, ZmMsg.toOrCc]},
			{ id: "NOT_IN_ADDR", type: "DwtCheckbox", label: ZmMsg.moveNotInAddrBook, checked: true},
			{ id: "DL_SUBSCRIBED", type: "DwtCheckbox", label: ZmMsg.moveMessagesFromDL, checked: true},
			{ id: "MASS_MARKETING", type: "DwtCheckbox", label: ZmMsg.massMarketingMessages, checked: true}
		]
	};
	this._priorityMessageForm = new DwtForm(params);
	var div = document.getElementById("PRIORITYMESSAGE_PROMPT_FORM");
	this._priorityMessageForm.appendElement(div);
	
	this._moveMsgIntoStream = this._priorityMessageForm.getControl("MOVE_MSG_STREAM");
	this._notToMe = this._priorityMessageForm.getControl("NOT_TO_ME");
	this._selectField = this._priorityMessageForm.getControl("SELECT_FIELD");
	this._notInMyAddrBk = this._priorityMessageForm.getControl("NOT_IN_ADDR");
	this._dlSubscribedTo = this._priorityMessageForm.getControl("DL_SUBSCRIBED");
	this._massMarketing = this._priorityMessageForm.getControl("MASS_MARKETING");
	
	this._streamHash = {};
	this._streamHash[ZmFilterRule.TEST_BULK] = {control: this._massMarketing, negative: false};
	this._streamHash[ZmFilterRule.TEST_LIST] = {control: this._dlSubscribedTo, negative: false};
	this._streamHash[ZmFilterRule.TEST_ADDRBOOK] = {control: this._notInMyAddrBk, negative: true, headerValue: "from"};
	this._streamHash[ZmFilterRule.TEST_ME] = {control: this._notToMe, negative: true, headerValue: "to"};
	
    this._advancedControls = new DwtText({parent:this,className:"FakeAnchor"});
    this._advancedControls.setText(ZmMsg.advancedControls);
    this._advancedControls.getHtmlElement().onclick = advancedListener;
    this._advancedControls.replaceElement(document.getElementById("PriorityInboxAdvancedControls"));

	var htmlEl = this._notToMe.getHtmlElement();
	if (htmlEl) {
		htmlEl.style.cssFloat = "left";
		htmlEl.style.paddingRight = "3px";
	}
};

ZmPriorityMessageFilterDialog.prototype.popup =
function() {
	var callback = new AjxCallback(this, this._handleResponseLoadRules);
	this._rules.loadRules(true, callback); // make sure rules are loaded (for when we save)
	
	DwtDialog.prototype.popup.call(this);
};

ZmPriorityMessageFilterDialog.prototype._handleResponseLoadRules =
function() {
	this._activityStreamRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
	this._setStreamSelections();
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
	var filterRuleDialog = appCtxt.getFilterRuleDialog();
	var isPriority = false;
	var rule = this._activityStreamRule;	
	
	if (rule) {
		filterRuleDialog.popup(rule, true);		
	}
	else {
		//create rule with default conditions
		var ruleName = isPriority ? ZmMsg.markAsPriorityRule : ZmMsg.activityStreamsRule;
		var rule = new ZmFilterRule(ruleName, true, {}, {});
        rule.addAction(ZmFilterRule.A_FOLDER, ZmMsg.activityStreamsRule);
        for (var id in this._streamHash) {
            if (id == ZmFilterRule.TEST_ME) {
				var meTestValue = this._selectField.getValue() == ZmMsg.to ? ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO] : ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO_CC];
                rule.addCondition(id, ZmFilterRule.OP_NOT_IS, null, meTestValue);	
            }
            else if (id == ZmFilterRule.TEST_ADDRBOOK) {
                rule.addCondition(id, ZmFilterRule.OP_NOT_IN ,"contacts", this._streamHash[id].headerValue); //Address in From not in Contacts	
            }
            else {
                rule.addCondition(id);
            }
        }
		rule.setGroupOp(ZmFilterRule.GROUP_ANY);		
		filterRuleDialog.popup(rule, true);
	}
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
			var length = AjxUtil.isArray(conditions[c]) ? conditions[c].length : -1;
			for (var i=0; i<length; i++) {
				var isNegative = AjxUtil.isArray(conditions[c]) && conditions[c][i].negative ? (conditions[c][i].negative == "1") : false;
				if (this._streamHash[c]) {
					if (isNegative && (c == ZmFilterRule.TEST_ADDRBOOK || c == ZmFilterRule.TEST_ME)) {
						var header = AjxUtil.isArray(conditions[c]) && conditions[c][i].header;
						if (c == ZmFilterRule.TEST_ADDRBOOK) {
							value = ZmFilterRule.C_FROM;
						}
						else if (c == ZmFilterRule.TEST_ME) {
							if (header &&  header.toUpperCase() == ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO].toUpperCase()) {
								value = header;
								this._selectField.setSelected(ZmMsg.to);
							}
							else if (header &&  header.toUpperCase() == ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO_CC].toUpperCase()) {
								value = header;
								this._selectField.setSelected(ZmMsg.toOrCc);
							}
						}
						//var value = (c == ZmFilterRule.TEST_ADDRBOOK) ? ZmFilterRule.C_FROM : ZmFilterRule.C_TO;
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
	var activityRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
	
	//handle activity streams
	foundCondition = false;
	if (this._moveMsgIntoStream.isSelected()) {
		var streamRule = new ZmFilterRule(ZmMsg.activityStreamsRule, true, {}, {});
		streamRule.addAction(ZmFilterRule.A_FOLDER, ZmMsg.activityStreamsRule); 
		streamRule.setGroupOp(ZmFilterRule.GROUP_ANY);
		
		for (var id in this._streamHash) {
			var control = this._streamHash[id].control;
			var negative = this._streamHash[id].negative;
			var headerValue = this._streamHash[id].headerValue;
			if (control.isSelected()) {
				if (id == ZmFilterRule.TEST_ME) {
					var meTestValue = this._selectField.getValue() == ZmMsg.to ? ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO] : ZmFilterRule.C_ADDRESS_VALUE[ZmFilterRule.C_TO_CC];
					streamRule.addCondition(id, ZmFilterRule.OP_NOT_IS, null, meTestValue);	
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
				if (id == ZmFilterRule.TEST_ME && this._activityStreamRule.conditions[ZmFilterRule.TEST_ME]) {
					//if we uncheck the me filter we need to know which headerValue we are removing ("to" or "to,cc")
					activityRule = this._removeCondition(activityRule, id, negative, this._activityStreamRule.conditions[ZmFilterRule.TEST_ME][0].headerValue);	
				}
				else {
					activityRule = this._removeCondition(activityRule, id, negative, headerValue);
				}
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
	var html = "<div style='width: 250px; float: left;'><span id='PriorityInboxAdvancedControls'></span></div><div style='float:right;'>";
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

ZmPriorityMessageFilterDialog.prototype._createActivityStreamsFolder =
function() {
	var jsonObj = {CreateFolderRequest:{_jsns:"urn:zimbraMail"}};
	var folder = jsonObj.CreateFolderRequest.folder = {l: ZmOrganizer.ID_ROOT, name: ZmMsg.activityStreamsRule, fie: 1};
	return appCtxt.getAppController().sendRequest({
		jsonObj: jsonObj,
		asyncMode: true
	});
};