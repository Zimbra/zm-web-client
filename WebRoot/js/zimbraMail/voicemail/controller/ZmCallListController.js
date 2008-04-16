/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmCallListController = function(container, app) {
	if (arguments.length == 0) { return; }
	
	ZmVoiceListController.call(this, container, app);
    this._listeners[ZmOperation.CHECK_CALLS] = new AjxListener(this, this._refreshListener);

}

ZmCallListController.prototype = new ZmVoiceListController;
ZmCallListController.prototype.constructor = ZmCallListController;

ZmCallListController.prototype.toString =
function() {
	return "ZmCallListController";
};

ZmCallListController.prototype._defaultView =
function() {
	return ZmId.VIEW_CALL_LIST;
};

ZmCallListController.prototype._getViewType = 
function() {
	return ZmId.VIEW_CALL_LIST;
};

ZmCallListController.prototype._getItemType =
function() {
	return ZmItem.CALL;
};

ZmCallListController.prototype._createNewView = 
function(view) {
	return new ZmCallListView(this._container, this);
};

ZmCallListController.prototype._getToolBarOps =
function() {
	var list = [];
    list.push(ZmOperation.CHECK_CALLS);
    list.push(ZmOperation.SEP);
	list.push(ZmOperation.PRINT);
    list.push(ZmOperation.SEP);
    list.push(ZmOperation.CALL_MANAGER);
	return list;
};

ZmCallListController.prototype._getActionMenuOps =
function() {
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		return [ZmOperation.CONTACT];
	}
	return null;
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
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		parent.enable(ZmOperation.CONTACT, num == 1);
	}
};

ZmCallListController.prototype.getKeyMapName =
function() {
	return "ZmCallListController";
};

ZmCallListController.prototype.handleKeyAction =
function(actionCode) {
	switch (actionCode) {
        case ZmKeyMap.CALL_MANAGER:
            this._callManagerListener();
            break;
		case ZmKeyMap.PRINT:
			this._printListener();
			break;
		default:
			return ZmVoiceListController.prototype.handleKeyAction.call(this, actionCode);
	}
	return true;
};


