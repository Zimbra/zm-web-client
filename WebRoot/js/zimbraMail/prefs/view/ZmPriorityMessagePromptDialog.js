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

ZmPriorityMessagePromptDialog = function() {

	DwtDialog.call(this, {parent:appCtxt.getShell(), className:"ZmPriorityMessagePromptDialog", title:ZmMsg.applyPrioritizationTitle,
						  standardButtons:[DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON], id: "ZmPriorityMessagePromptDialog"});

	// set content
	this.setContent(this._contentHtml());
	
	this.setButtonListener(DwtDialog.YES_BUTTON, new AjxListener(this, this._handleYesButton));
	this.setButtonListener(DwtDialog.NO_BUTTON, new AjxListener(this, this._handleNoButton));
};

ZmPriorityMessagePromptDialog.prototype = new DwtDialog;
ZmPriorityMessagePromptDialog.prototype.constructor = ZmPriorityMessagePromptDialog;

ZmPriorityMessagePromptDialog.prototype._contentHtml = 
function() {   
	var id = "PriorityMessageRunNowPrompt";	
	return AjxTemplate.expand("prefs.Pages#PriorityMessageRunNowPrompt", id);		
};

ZmPriorityMessagePromptDialog.prototype._handleYesButton =
function() {
	//Run filters agains Inbox folder
	var prefsApp = appCtxt.getApp(ZmId.APP_PREFERENCES);
	var filterSel = [];
	if (this._rules) {
		this._activityStreamRule = this._rules.getRuleByName(ZmMsg.activityStreamsRule);
		if (this._activityStreamRule && this._activityStreamRule.active) {
			filterSel.push(this._activityStreamRule);
		}
		//can't reliably get filterRulesController so make call here.
		var work = new ZmFilterWork(filterSel, false);
		var progressController = new ZmProgressController(this, prefsApp);
		progressController.start([appCtxt.getById(ZmFolder.ID_INBOX)], work);    

	}
	this.popdown();
};

ZmPriorityMessagePromptDialog.prototype._handleNoButton =
function() {
	this.popdown();
};

/**
 * Sets the filter rules 
 * 
 * @param rules {ZmFilterRules}
 */
ZmPriorityMessagePromptDialog.prototype.setFilterRules =
function(rules) {
	this._rules = rules;
};

/**
 * Creates Query for Inbox folder
 * 
 * @return {String} 
 */
ZmPriorityMessagePromptDialog.prototype.createQuery = 
function() {
	var qName = ZmFolder.QUERY_NAME[ZmFolder.ID_INBOX];
	return "in:\"" + qName +'"';
};