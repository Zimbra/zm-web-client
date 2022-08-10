/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

ZmCallListController = function(container, app) {
	if (arguments.length == 0) { return; }
	
	ZmVoiceListController.call(this, container, app);
	this._listeners[ZmOperation.CALL_BACK]	= this._callbackListener.bind(this);
}

ZmCallListController.prototype = new ZmVoiceListController;
ZmCallListController.prototype.constructor = ZmCallListController;

ZmCallListController.prototype.isZmCallListController = true;
ZmCallListController.prototype.toString = function() { return "ZmCallListController"; };

ZmCallListController.getDefaultViewType =
function() {
	return ZmId.VIEW_CALL_LIST;
};
ZmCallListController.prototype.getDefaultViewType = ZmCallListController.getDefaultViewType;

ZmCallListController.prototype._createNewView = 
function(view) {
	return new ZmCallListView(this._container, this);
};

ZmCallListController.prototype._getToolBarOps =
function() {
	var list = [];
    list.push(ZmOperation.CALL_BACK);
    list.push(ZmOperation.SEP);
	list.push(ZmOperation.PRINT);
	return list;
};

ZmCallListController.prototype._getActionMenuOps =
function() {
	var list = [];
    list.push(ZmOperation.CALL_BACK);
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push(ZmOperation.CONTACT);
	}
    list.push(ZmOperation.SEP);
	list.push(ZmOperation.PRINT);
	return list;
};

ZmCallListController.prototype._initializeToolBar =
function(view) {
	ZmVoiceListController.prototype._initializeToolBar.call(this, view);
	this._toolbar[view].getButton(ZmOperation.PRINT).setToolTipContent(ZmMsg.printCallTooltip)
};

ZmCallListController.prototype._resetOperations = 
function(parent, num) {
	ZmVoiceListController.prototype._resetOperations.call(this, parent, num);
	if (parent) {
		parent.enableAll(true);
	}
	var list = this.getList();
	parent.enable(ZmOperation.PRINT, list && list.size());
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		parent.enable(ZmOperation.CONTACT, num == 1);
	}
};

ZmCallListController.prototype.getKeyMapName =
function() {
	return ZmKeyMap.MAP_CALL;
};

ZmCallListController.prototype.handleKeyAction =
function(actionCode) {
	switch (actionCode) {
		case ZmKeyMap.PRINT:
			this._printListener();
			break;
		default:
			return ZmVoiceListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


