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

ZmVoiceListController = function(container, app) {
	if (arguments.length == 0) { return; }
	ZmListController.call(this, container, app);
    this._listeners[ZmOperation.CALL_MANAGER] = new AjxListener(this, this._callManagerListener);

	this._folder = null;
}
ZmVoiceListController.prototype = new ZmListController;
ZmVoiceListController.prototype.constructor = ZmVoiceListController;

ZmVoiceListController.prototype.toString =
function() {
	return "ZmVoiceListController";
};

/**
* Displays the given search results.
*
* @param search		search results (which should contain a list of conversations)
* @param folder		The folder being shown
*/
ZmVoiceListController.prototype.show =
function(searchResult, folder) {
	this._folder = folder;
	ZmListController.prototype.show.call(this, searchResult);
	this._list = searchResult ? searchResult.getResults(folder.getSearchType()) : null;
	if (this._list)
		this._list.setHasMore(searchResult.getAttribute("more"));	
	this._setup(this._currentView);

	var lv = this._listView[this._currentView];
	if (lv && this._activeSearch) {
		lv.offset = parseInt(this._activeSearch.getAttribute("offset"));
    }
    var elements = {};
    elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
    elements[ZmAppViewMgr.C_APP_CONTENT] = lv;
    this._setView(this._currentView, elements, true);
    this._resetNavToolBarButtons(this._currentView);
};

ZmVoiceListController.prototype.getFolder =
function() {
	return this._folder;
};

ZmVoiceListController.prototype._setViewContents =
function(viewId) {
	var view = this._listView[viewId];
	view.setFolder(this._folder);	
	view.set(this._list, ZmItem.F_DATE);
};

ZmVoiceListController.prototype._participantOps =
function() {
	return [ZmOperation.CONTACT];
};

ZmVoiceListController.prototype._initializeToolBar =
function(view) {
	if (!this._toolbar[view]) {
		ZmListController.prototype._initializeToolBar.call(this, view);
		this._toolbar[view].addFiller();
		var tb = new ZmNavToolBar({parent:this._toolbar[view], context:view});
		this._setNavToolBar(tb, view);
	};
};

ZmVoiceListController.prototype._getView = 
function() {
	return this._listView[this._currentView];
};

ZmVoiceListController.prototype._getToolbar = 
function() {
	return this._toolbar[this._currentView]
};

ZmVoiceListController.prototype._getMoreSearchParams =
function(params) {
	params.soapInfo = appCtxt.getApp(ZmApp.VOICE).soapInfo;
};

ZmVoiceListController.prototype._createNewContact =
function(ev) {
	var item = ev.item;
	var contact = new ZmContact(null);
	contact.initFromPhone(this._getView().getCallingParty(item).getDisplay(), ZmContact.F_homePhone);
	return contact;
};

ZmVoiceListController.prototype._refreshListener =
function(ev) {
	if (this._folder) {
		var app = appCtxt.getApp(ZmApp.VOICE);
		app.search(this._folder);
	}
};

ZmVoiceListController.prototype._printListener =
function(ev) {
	var html = this._getView().getPrintHtml();
	appCtxt.getPrintView().renderHtml(html);
};

ZmVoiceListController.prototype._callManagerListener =
function() {
	this._onPrefsActivedObj = this._onPrefsActivedObj || new AjxListener(this, this._handleResponseLaunchPrefs);
	appCtxt.getAppController().activateApp(ZmApp.PREFERENCES, false, this._onPrefsActivedObj);
};

ZmVoiceListController.prototype._handleResponseLaunchPrefs =
function() {
    var app = appCtxt.getAppController().getApp(ZmApp.PREFERENCES);
    var view = app.getPrefController().getPrefsView();
    view.selectSection("VOICE");
};

ZmVoiceListController.prototype._listActionListener =
function(ev) {
	ZmListController.prototype._listActionListener.call(this, ev);

	var view = ev.dwtObj;
	var isParticipant = ev.field == ZmItem.F_PARTICIPANT;
	var actionMenu = this.getActionMenu();
	var item = ev.item;
	
	// Update the add/edit contact item.
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		var contact = item.participants ? item.participants.getArray()[0] : null;
		var newOp = contact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
		var newText = contact? null : ZmMsg.AB_ADD_CONTACT;
		ZmOperation.setOperation(actionMenu, ZmOperation.CONTACT, newOp, newText);
		var contacts = AjxDispatcher.run("GetContacts");
		this._actionEv.contact = contact;
		this._setContactText(contact != null);
	}

	actionMenu.popup(0, ev.docX, ev.docY);
};

ZmVoiceListController.prototype._addToForwardListener = 
function(ev) {
	var selection = this._getView().getSelection();
	var errors = [];
	var combination = this._getPhoneFromCombination(selection, errors);
	
	if (errors.length>0 && AjxUtil.isString(errors[0])) {
		appCtxt.setStatusMsg(errors[0]);
	} else if (selection.length>0) {
		for (var name in combination) {
			var phone = combination[name].phone;
			var from = combination[name].addFrom;
			var callback = new AjxCallback(this, this._modifyCallFeatures, {featureName: ZmCallFeature.SELECTIVE_CALL_FORWARDING, addFrom: from, maxEntries: ZmCallFeature.SELECTIVE_CALL_FORWARDING_MAX_ENTRIES, maxMsg: ZmMsg.selectiveCallForwardingFromErrorMax});
			phone.getCallFeatures(callback);
		}
	}
};

ZmVoiceListController.prototype._addToRejectListener = 
function(ev) {
	var selection = this._getView().getSelection();
	var errors = [];
	var combination = this._getPhoneFromCombination(selection, errors);
	
	if (errors.length>0 && AjxUtil.isString(errors[0])) {
		appCtxt.setStatusMsg(errors[0]);
	} else if (selection.length>0) {
		for (var name in combination) {
			var phone = combination[name].phone;
			var from = combination[name].addFrom;
			var callback = new AjxCallback(this, this._modifyCallFeatures, {featureName: ZmCallFeature.SELECTIVE_CALL_REJECTION, addFrom: from, maxEntries: ZmCallFeature.SELECTIVE_CALL_REJECTION_MAX_ENTRIES, maxMsg: ZmMsg.selectiveCallRejectionFromErrorMax});
			var errorCallback = new AjxCallback(this, this._getCallFeaturesHandleError);
			phone.getCallFeatures(callback, errorCallback);
		}
	}
};

ZmVoiceListController.prototype._getPhoneFromCombination = 
function(selection, errors) {
	alert("ZmVoiceListController.prototype._getPhoneFromCombination should be overridden by subclasses");
	return {};
}

ZmVoiceListController.prototype._checkCanAddToList = 
function() {
	alert("ZmVoiceListController.prototype._checkCanAddToList should be overridden by subclasses");
	return {};
}

ZmVoiceListController.prototype._getCallFeaturesHandleError = 
function(exception1/*, ..., exceptionN*/) {
	for (var i = 0; i < arguments.length; i++) {
		var exception = arguments[i];
		var message = exception instanceof AjxException ?
			  (exception.msg || exception.code) : String(exception);
		if (exception.code == ZmCsfeException.ACCT_INVALID_ATTR_VALUE || exception.code == ZmCsfeException.INVALID_REQUEST) {
			// above faults come with technical/cryptic LDAP error msg; input validation
			// should keep us from getting here
			message = ZmMsg.invalidPrefValue;
		}
		appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
	}
};    


ZmVoiceListController.prototype._modifyCallFeatures = 
function(obj, features, phone) {
	var addPhones = (obj.addFrom instanceof AjxVector) ? obj.addFrom.getArray() : [];
	var maxEntries = obj.maxEntries;
	var maxMsg = obj.maxMsg || "";
	var feature = features[obj.featureName];
	
	if (feature instanceof ZmCallFeature && phone instanceof ZmPhone && addPhones.length > 0) {
		var result = feature.createProxy();
		result.data.phone = result.data.phone || [];
		
		if (addPhones.length > 0) {
			var added = 0;
			for (var i=0; i<addPhones.length; i++) {
				var from = addPhones[i];
				var number = ZmPhone.calculateName(from.getDisplay());
				var exists = false;
				for (var j=0; j<result.data.phone.length; j++) {
					if (result.data.phone[j].pn == number) {
						exists += true;
						break;
					}
				}
				if (!exists) {
					if (maxEntries && result.data.phone.length == maxEntries) {
						appCtxt.setStatusMsg(maxMsg);
						break;
					} else {
						result.data.phone.push({a:true, pn: number});
						added++;
					}
				}
			}
			if (added > 0)
				this._saveFeatures(phone, [result]);
		}
	}
}

ZmVoiceListController.prototype._saveFeatures =
function(phone, features) {
	var batchCommand = new ZmBatchCommand(false);
	phone.modifyCallFeatures(batchCommand, features);			
	appCtxt.getSettings().save(false, null, batchCommand);
	if (batchCommand.size()) {
		var respCallback = new AjxCallback(this, this._handleResponseSaveListener);
		var errorCallback = new AjxCallback(this, this._handleResponseSaveError);
		batchCommand.run(respCallback, errorCallback);
	}
}

ZmVoiceListController.prototype._handleResponseSaveListener =
function(optionsSaved, callback, result) {
	if (optionsSaved) {
		appCtxt.setStatusMsg(ZmMsg.optionsSaved);
	}
	if (callback) {
		callback.run(result);
	}
}

ZmVoiceListController.prototype._handleResponseSaveError =
function(exception1/*, ..., exceptionN*/) {
	for (var i = 0; i < arguments.length; i++) {
		var exception = arguments[i];
		var message = exception instanceof AjxException ?
			  (exception.msg || exception.code) : String(exception);
		if (exception.code == ZmCsfeException.ACCT_INVALID_ATTR_VALUE || exception.code == ZmCsfeException.INVALID_REQUEST) {
			// above faults come with technical/cryptic LDAP error msg; input validation
			// should keep us from getting here
			message = ZmMsg.invalidPrefValue;
		}
		appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
	}
};
