/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the filters page, with tabs for incoming and outgoing filters.
 * @class
 * This class represents the filters page.
 * 
 * @param {DwtControl}	            parent			the containing widget
 * @param {Object}	                section			the page
 * @param {ZmFilterController}	    controller		the filter controller
 * 
 * @extends	ZmPreferencesPage
 * 
 * @private
 */
ZmFilterPage = function(parent, section, controller) {
	ZmPreferencesPage.apply(this, arguments);
	this.addClassName("ZmFilterPage");
};

ZmFilterPage.prototype = new ZmPreferencesPage;
ZmFilterPage.prototype.constructor = ZmFilterPage;

ZmFilterPage.prototype.isZmFilterPage = true;
ZmFilterPage.prototype.toString = function () { return "ZmFilterPage"; };

ZmFilterPage.prototype._createControls =
function() {
	if (appCtxt.get(ZmSetting.PRIORITY_INBOX_ENABLED)) {
		this._activityStreamsButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_ACTIVITY_STREAM_BUTTON", className: "ZButton ZInlineButton"});
		this._activityStreamsButton.setText(ZmMsg.activityStreamSettings);
		this._activityStreamsButton.addSelectionListener(new AjxListener(this, this._activityStreamDialog));
	}
	this._tabView = new DwtTabView({parent:this, posStyle:Dwt.STATIC_STYLE});
	this._tabView.reparentHtmlElement(this._htmlElId+"_tabview");
	var incomingController = this._controller.getIncomingFilterRulesController();
	this._tabView.addTab(ZmMsg.incomingMessageFilters, incomingController.getFilterRulesView());
	var outgoingController = this._controller.getOutgoingFilterRulesController();
	this._tabView.addTab(ZmMsg.outgoingMessageFilters, outgoingController.getFilterRulesView());
	this.setVisible(true);
	
	this.hasRendered = true;
};

ZmFilterPage.prototype.reset =
function() {
	ZmPreferencesPage.prototype.reset.apply(this, arguments);
	this._controller._stateChangeListener();
};

ZmFilterPage.prototype.getTabView =
function () {
	return this._tabView;
};

ZmFilterPage.prototype.hasResetButton =
function() {
	return false;
};


//
// Protected methods
//

ZmFilterPage.prototype._setupCustom = function(id, setup, value) {
	if (id == "FILTER_TABS") {
		return this.getTabView();
	}
	return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmFilterPage.prototype._activityStreamDialog = function() {
	var priorityFilterDialog = appCtxt.getPriorityMessageFilterDialog();
	ZmController.showDialog(priorityFilterDialog);
};
