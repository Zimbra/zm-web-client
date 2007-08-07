/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is: Zimbra Collaboration Suite Web Client
 *
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
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
	this._list = searchResult.getResults(folder.getSearchType());
	if (this._list)
		this._list.setHasMore(searchResult.getAttribute("more"));	
	this._setup(this._currentView);

    var offset = parseInt(this._activeSearch.getAttribute("offset"));
    if (this._listView[this._currentView]) {
        this._listView[this._currentView].setOffset(offset);
    }
    var elements = new Object();
    elements[ZmAppViewMgr.C_TOOLBAR_TOP] = this._toolbar[this._currentView];
    elements[ZmAppViewMgr.C_APP_CONTENT] = this._listView[this._currentView];
    this._setView(this._currentView, elements, true);
    this._resetNavToolBarButtons(this._currentView);
};

ZmVoiceListController.prototype.getFolder =
function(searchResult, folder) {
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
		var tb = new ZmNavToolBar(this._toolbar[view], DwtControl.STATIC_STYLE, null, ZmNavToolBar.SINGLE_ARROWS, true);
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
	params.soapInfo = ZmVoiceApp.SOAP_INFO;
};

ZmVoiceListController.prototype._createNewContact =
function(ev) {
	var item = ev.item;
	var contact = new ZmContact(appCtxt);
	contact.initFromPhone(this._getView().getCallingParty(item).getDisplay());
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
    var app = appCtxt.getAppController().getApp(ZmApp.PREFERENCES);
    app.launch(new AjxListener(this, this._handleResponseLaunchPrefs));
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
