/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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

/**
 * Creates a Back-up preference page.
 * @constructor
 * @class ZmBackupPage
 * This class represents a page that allows the user to set preferences on backup
 * For Instance, How often user wants to backup data and list of accounts user wants to back-up
 *
 * @author KK
 *
 * @param {DwtControl}	parent			the containing widget
 * @param {Object}	section			the page
 * @param {ZmPrefController}	controller		the prefs controller
 *
 * @extends		ZmPreferencesPage
 * @private
 */
ZmBackupPage = function(parent, section, controller) {
    ZmPreferencesPage.call(this, parent, section, controller);
};

ZmBackupPage.prototype = new ZmPreferencesPage;
ZmBackupPage.prototype.constructor = ZmBackupPage;

ZmBackupPage.prototype.toString =
function () {
    return "ZmBackupPage";
};

ZmBackupPage.prototype.showMe =
function(){
    ZmPreferencesPage.prototype.showMe.call(this);
    if (this._listView) {
        var s = this._listView.getSelection();
        this._listView.set(this.getAccounts()._vector.clone());
        if (s && s[0]) {
            this._listView.setSelection(s[0]);
        }
    }
};



/**
 * @private
 */
ZmBackupPage.prototype._setupCustom =
function(id, setup, value) {

    if (id == ZmSetting.OFFLINE_BACKUP_ACCOUNT_ID) {
        this._listView = new ZmPrefAcctListView(this, this._controller);
        return this._listView;
    }

    return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmBackupPage.prototype._createControls =
function() {
    if (appCtxt.isOffline) {
        // add "Backup" button
        this._uploadButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_button"});
        this._uploadButton.setText(ZmMsg.offlineBackUpButton);
        this._uploadButton.addSelectionListener(new AjxListener(this, this._handleBackupButton));
    }

    ZmPreferencesPage.prototype._createControls.apply(this, arguments);
};

ZmBackupPage.prototype._handleBackupButton =
function() {
    //this._uploadButton.setEnabled(false);
}

/**
 * Gets the account preferences.
 *
 * @return	{ZmPrefAccounts}	the accounts
 *
 * @private
 */


ZmBackupPage.prototype.getAccounts =
function() {
    if (!this._accounts) {
        this._accounts = ZmBackupPage._getAccounts();
    }
    return this._accounts;
};


ZmBackupPage._getAccounts =
function() {
    var accounts = new ZmPrefAccounts();
    var visAccts = appCtxt.accountList.visibleAccounts;
    for (var i=0; i< visAccts.length; i++) {
        var name =  visAccts[i].getDisplayName();
        var desc = visAccts[i].name;
        accounts.addPrefAccount(new ZmPrefAccount(name, true, desc));
    }
    return accounts;
};

/**
 * ZmPrefAcctListView
 *
 * @param parent
 * @param controller
 * @private
 */
ZmPrefAcctListView = function(parent, controller) {

    var headerList = this._getHeaderList();

    DwtListView.call(this, {
        parent: parent,
        className: "ZmFilterListView",
        headerList: this._getHeaderList(),
        view: ZmId.OFFLINE_BACKUP_ACCOUNT_ID
    });

    this._controller = controller;
    this.multiSelectEnabled = false; // single selection only
    this._internalId = AjxCore.assignId(this);
};

ZmPrefAcctListView.COL_ACTIVE	= "ac";
ZmPrefAcctListView.COL_NAME	= "na";
ZmPrefAcctListView.COL_DESC	= "ds";
ZmPrefAcctListView.COL_ACTION	= "an";
ZmPrefAcctListView.CHECKBOX_PREFIX = "_accCheckbox";


ZmPrefAcctListView.prototype = new DwtListView;
ZmPrefAcctListView.prototype.constructor = ZmPrefAcctListView;

ZmPrefAcctListView.prototype.toString =
function() {
    return "ZmPrefAcctListView";
};

ZmPrefAcctListView.prototype.set =
function(list) {
    this._checkboxIds = [];
    DwtListView.prototype.set.call(this, list);
    this._handleAccts();
};

ZmPrefAcctListView.prototype._handleAccts = function(evt) {
    this._acctsLoaded = true;
    var item = {};
    var visAccts = appCtxt.accountList.visibleAccounts;
    for (var i=0; i< visAccts.length; i++) {
        item.name =  visAccts[i].getDisplayName();
        item.desc = visAccts[i].name;
        this.setCellContents(item, ZmPrefAcctListView.COL_NAME, AjxStringUtil.htmlEncode(item.name));
        this.setCellContents(item, ZmPrefAcctListView.COL_DESC, AjxStringUtil.htmlEncode(item.desc));
    }
};

ZmPrefAcctListView.prototype.setCellContents = function(item, field, html) {
    var el = this.getCellElement(item, field);
    if (!el) { return; }
    el.innerHTML = html;
};

ZmPrefAcctListView.prototype.getCellElement = function(item, field) {
    return document.getElementById(this._getCellId(item, field));
};

ZmPrefAcctListView.prototype._getCellId = function(item, field, params) {
    var id =  DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, "accts", item.name, field);
    return id;
};


ZmPrefAcctListView.prototype._getHeaderList =
function() {
    return [
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_DESC, text:ZmMsg.emailAddr})),
        (new DwtListHeaderItem({field:ZmPrefZimletListView.COL_ACTION, text:ZmMsg.action, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}))
    ];

};

ZmPrefAcctListView.prototype._getCellClass =
function(item, field, params) {
    if (field == ZmPrefAcctListView.COL_ACTIVE) {
        return "FilterActiveCell";
    }
    return DwtListView.prototype._getCellClass.call(this, item, field, params);
};

ZmPrefAcctListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
    if (field == ZmPrefAcctListView.COL_ACTIVE) {
        html[idx++] = "<input name='checked_accts' type='checkbox' ";
        html[idx++] = item.active ? "checked " : "";
        html[idx++] = "id='";
        html[idx++] = item.name;
        html[idx++] = "_acctsCheckbox' _name='";
        html[idx++] = item.name;
        html[idx++] = "' _flvId='";
        html[idx++] = this._internalId;
        html[idx++] = "'>";
    } else if (field == ZmPrefAcctListView.COL_DESC) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefAcctListView.COL_DESC);
        html[idx++] = "'>";
        html[idx++] = AjxStringUtil.stripTags(item.desc, true);
        html[idx++] = "</div>";
    } else if (field == ZmPrefZimletListView.COL_NAME) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefAcctListView.COL_NAME);
        html[idx++] = "' title='";
        html[idx++] = item.name;
        html[idx++] = "'>";
        html[idx++] = AjxStringUtil.stripTags(item.name, true);
        html[idx++] = "</div>";
    } else if (field == ZmPrefZimletListView.COL_ACTION) {
        html[idx++] = "<a href='javascript:;' onclick='alert(";
        html[idx++] = '"' + item.name + '"';
        html[idx++] = ");'>";
        html[idx++] = ZmMsg.offlineBackUpNow;
        html[idx++] = "</a>";
    }

    return idx;
};



/**
 * Model class to hold the list of PrefAccounts
 * @private
 */
ZmPrefAccounts = function() {
    ZmModel.call(this, ZmEvent.S_PREF_ACCOUNT);
    this._vector = new AjxVector();
    this._zNameHash = {};
};

ZmPrefAccounts.prototype = new ZmModel;
ZmPrefAccounts.prototype.constructor = ZmPrefAccounts;

ZmPrefAccounts.prototype.toString =
function() {
    return "ZmPrefAccounts";
};

ZmPrefAccounts.prototype.addPrefAccount =
function(Account) {
    this._vector.add(Account);
    this._zNameHash[Account.name] = Account;
};

ZmPrefAccounts.prototype.removePrefAccount =
function(Account) {
    delete this._zNameHash[Account.name];
    this._vector.remove(Account);
};

ZmPrefAccounts.prototype.getPrefAccountByName =
function(name) {
    return this._zNameHash[name];
};

/**
 * ZmPrefAccount
 *
 * @param name
 * @param active
 * @param desc
 *
 * @private
 */
ZmPrefAccount = function(name, active, desc) {
    this.name = name;
    this.active = (active !== false);
    this.desc = desc;
    this._origStatus = this.active;
};
