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

/**
 * @constructor
 * @class
 *
 * @param appCtxt		[ZmAppCtxt]			the app context
 * @param container		[DwtShell]			the shell
 * @param prefsApp		[ZmPreferencesApp]	the preferences app
 * @param prefsView		[ZmPreferencesView]	the preferences view
 */
function ZmPopAccountsController(appCtxt, container, prefsApp, prefsView) {
	ZmPrefListController.call(this, appCtxt, container, prefsApp, prefsView);
	this._listView = new ZmPopAccountsView(prefsView._parent, appCtxt, this);
    this._removedItems = {};
    this._count = 0;
};

ZmPopAccountsController.prototype = new ZmPrefListController();
ZmPopAccountsController.prototype.constructor = ZmPopAccountsController;

// Data

ZmPopAccountsController.prototype._removedItems;
ZmPopAccountsController.prototype._count;

// Public methods

ZmPopAccountsController.prototype.getRemovedItems = function() {
    return AjxUtil.values(this._removedItems);
};

// Protected methods

ZmPopAccountsController.prototype._addHandler =
function() {
    var account = new ZmPopAccount(this._appCtxt);
    var count = ++this._count;
    account.name = AjxMessageFormat.format(ZmMsg.newPopAccountName, count);
    account.id = "new"+count;
    var proxy = AjxUtil.createProxy(account);
    proxy._new = true;

    var list= this.getListView().getList();
    list.addItem(proxy);
    list.setSelection(proxy);

    this._listView.showItem(proxy);
};

ZmPopAccountsController.prototype._removeHandler =
function() {
    var listView = this.getListView().getList();
	var account = listView.getSelection()[0];
	if (account) {
        var dialog = this._appCtxt.getConfirmationDialog();
        var callback = new AjxCallback(this, this._removeOkHandler, [listView, account]);
        var message = AjxMessageFormat.format(ZmMsg.confirmRemovePopAccount, account.name);
        dialog.popup(message, callback);
    }
};

ZmPopAccountsController.prototype._removeOkHandler =
function(dwtList, account) {
    this._listView.clearError(account);
    this._listView.showItem(null);
    if (!account._new) {
        this._removedItems[account.id] = account;
    }
    dwtList.removeItem(account);
};

ZmPopAccountsController.prototype._getListData =
function() {
    var prefsApp = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP);
    var collection = prefsApp.getDataSourceCollection();

    var listener = new AjxListener(this, this._changeListener);
    collection.addChangeListener(listener);

    var accounts = collection.getPopAccounts();
    for (var i = 0; i < accounts.length; i++) {
        accounts[i] = AjxUtil.createProxy(accounts[i]);
    }
    return AjxVector.fromArray(accounts);
};

ZmPopAccountsController.prototype._changeListener = function(evt) {
    var list = this._listView.getList();
    var account = evt.getDetail("item");
    var needsRefresh = account === this._listView.getAccount();
    if (evt.event == ZmEvent.E_CREATE || evt.event == ZmEvent.E_MODIFY) {
        ZmPopAccountsController.__promoteProps(account);
    }
    else {
        delete this._removedItems[account.id];
    }
    if (needsRefresh) {
        this._listView.showItem(account);
    }
};

// Private methods

ZmPopAccountsController.prototype.__getById = function(id) {
    var list = this._listView.getList();
    var items = list.getList().getArray();
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.id == id) {
            return item;
        }
    }
    return null;
};

// Private functions

ZmPopAccountsController.__promoteProps = function(proxy) {
    for (var p in proxy) {
        if (/^_/.test(p)) continue;
        if (proxy.hasOwnProperty(p)) {
            proxy._object_[p] = proxy[p];
            delete proxy[p];
        }
    }
};
