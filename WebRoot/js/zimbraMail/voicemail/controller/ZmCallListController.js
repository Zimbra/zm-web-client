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
	this._listeners[ZmOperation.ADD_CALLER_FORWARD] = new AjxListener(this, this._addToForwardListener);
	this._listeners[ZmOperation.ADD_CALLER_REJECT] = new AjxListener(this, this._addToRejectListener);
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
	var list = [];
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		list.push(ZmOperation.CONTACT);
		list.push(ZmOperation.SEP);
	}
	list.push(ZmOperation.ADD_CALLER_FORWARD);
	list.push(ZmOperation.ADD_CALLER_REJECT);
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
	
		var list = this.getList();
		parent.enable(ZmOperation.PRINT, list && list.size());
		if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			parent.enable(ZmOperation.CONTACT, num == 1);
		}
		var items = this._listView[this._currentView].getSelection();
		var canAdd = (items && items.length>0) && this._checkCanAddToList();
		parent.enable(ZmOperation.ADD_CALLER_FORWARD, canAdd);
		parent.enable(ZmOperation.ADD_CALLER_REJECT, canAdd);
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

ZmVoiceListController.prototype._getPhoneFromCombination = 
function(selection, errors) {
	var phoneFromCombination = {};
	
	var compareFunction = function() {
		return this.name;
	}
	
	for (var i=0; i<selection.length; i++) {
		var call = selection[i];	
		var phone = call.getPhone();
		var from = call.getCallingParty(this._getView()._getCallType() == ZmVoiceFolder.PLACED_CALL ? ZmVoiceItem.TO : ZmVoiceItem.FROM);
	
		if (phone.validate(from.name, errors)) {
			if (!phoneFromCombination[phone.name])
				phoneFromCombination[phone.name] = {phone: phone, addFrom: new AjxVector()};
			
			if (!phoneFromCombination[phone.name].addFrom.containsLike(from, compareFunction))
				phoneFromCombination[phone.name].addFrom.add(from);
		}
	}
	return phoneFromCombination;
}
