/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
    this._setView({view:this._currentView, elements:elements, isAppView:true});
    this._resetNavToolBarButtons(this._currentView);
};

ZmVoiceListController.prototype.getFolder =
function() {
	return this._folder;
};

ZmVoiceListController.prototype.setFolder =
function(folder) {
	if (this._folder && this._folder != folder) {
		this._app.search(folder);
	}
	this._folder = folder;
}

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
		this._toolbar[view].addOp(ZmOperation.FILLER);
		this._initializeNavToolBar(view);
	};
};

ZmVoiceListController.prototype._initializeNavToolBar =
function(view) {
	this._toolbar[view].addOp(ZmOperation.TEXT);
	var text = this._itemCountText[view] = this._toolbar[view].getButton(ZmOperation.TEXT);
	text.addClassName("itemCountText");
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
	var url;
	var v = this._getView();

	var query = {
		relative: true,
		qsArgs: {
			sq: ['phone:', v._folder.phone.name, ' in:"', v._folder.name, '"'].join('')
		}
	};

	if (v.view == ZmId.VIEW_VOICEMAIL) {
		query.path = "/h/printvoicemails";
		query.qsArgs.st = "voicemail";
		query.qsArgs.sl = this._activeSearch.getResults("VOICEMAIL").folder.numTotal;
		url = AjxUtil.formatUrl(query);
	} else if (v.view == ZmId.VIEW_CALL_LIST) {
		query.path = "/h/printcalls";
		query.qsArgs.st = "calllog";
		query.qsArgs.sl = this._activeSearch.getResults("CALL").folder.numTotal;
		url = AjxUtil.formatUrl(query);
	}

	if (url) {
		window.open(appContextPath+AjxStringUtil.urlEncode(url), "_blank");
	}
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
