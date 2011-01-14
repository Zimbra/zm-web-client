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
    if (this._acctListView) {
        var s = this._acctListView.getSelection();
        this._acctListView.set(this.getAccounts()._vector.clone());
        if (s && s[0]) {
            this._acctListView.setSelection(s[0]);
        }
    }

    if (this._restoreListView) {
        var r = this._restoreListView.getSelection();
        this._restoreListView.set(this.getBackups()._vector.clone());
        if (r && r[0]) {
            this._restoreListView.setSelection(r[0]);
        }
    }
};


/**
 * @private
 */
ZmBackupPage.prototype._setupCustom =
function(id, setup, value) {

    if (id == ZmSetting.OFFLINE_BACKUP_ACCOUNT_ID) {
        this._acctListView = new ZmPrefAcctListView(this, this._controller);
        return this._acctListView;
    }

    if (id == ZmSetting.OFFLINE_BACKUP_RESTORE) {
        this._restoreListView = new ZmPrefBackupListView(this, this._controller);
        return this._restoreListView;
    }

    return ZmPreferencesPage.prototype._setupCustom.apply(this, arguments);
};

ZmBackupPage.prototype._createControls =
function() {

    // add "Backup" button
    this._uploadButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_button"});
    this._uploadButton.setText(ZmMsg.offlineBackUpButton);
    this._uploadButton.addSelectionListener(new AjxListener(this, this._handleBackupAccountsButton));

    this._restoreButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_restore_button"});
    this._restoreButton.setText(ZmMsg.offlineBackUpRestore);
    this._restoreButton.addSelectionListener(new AjxListener(this, this._handleRestoreBackupButton));

    ZmPreferencesPage.prototype._createControls.apply(this, arguments);
};

ZmBackupPage.prototype._handleBackupAccountsButton =
function() {
    this._uploadButton.setEnabled(false);

    var accts = this.getAccounts()._vector.getArray();

    var settingsObj = appCtxt.getSettings();
    var setting = settingsObj.getSetting(ZmSetting.OFFLINE_BACKUP_ACCOUNT_ID);

    var checked = [];
    for (var i = 0; i < accts.length; i++) {
        if (accts[i].active) {
            checked.push(accts[i].id);
        }
    }
    if(checked.length < 1) {
        this._uploadButton.setEnabled(true);
        return;
    }

    setting.setValue(checked);

    var soapDoc = AjxSoapDoc.create("BatchRequest", "urn:zimbra", null);
    soapDoc.setMethodAttribute("onerror", "continue");
    for (var k=0; k<checked.length; k++) {
        var requestNode = soapDoc.set("AccountBackupRequest",null,null,"urn:zimbraOffline");
        requestNode.setAttribute("id", checked[k]);
    }

    var params = {
        soapDoc: soapDoc,
        asyncMode: true,
        errorCallback: null,
        accountName: appCtxt.accountList.mainAccount.name
    };

    params.callback = new AjxCallback(this, this._handleBackupStarted);
    var appController = appCtxt.getAppController();
    appController.sendRequest(params);
};

ZmBackupPage.prototype._handleBackupStarted =
function(result) {
    appCtxt.setStatusMsg(ZmMsg.offlineBackUpStarted);
    this._uploadButton.setEnabled(true);
};

ZmBackupPage.prototype._handleRestoreBackupButton =
function() {

    this._restoreButton.setEnabled(false);

    var backups = this.getBackups()._vector.getArray();
    var sel = [];
    for (var i = 0; i < backups.length; i++) {
        if (backups[i].active) {
            var bk = backups[i];
            sel.push(backups[i]);
            break;
        }
    }

    if(sel.length < 1) {
        this._restoreButton.setEnabled(true);
        return;
    }

    var soapDoc = AjxSoapDoc.create("AccountRestoreRequest", "urn:zimbraOffline");
    var method = soapDoc.getMethod();
    method.setAttribute("id", sel[0].acct);
    method.setAttribute("time", sel[0].timestamp);
    var respCallback = new AjxCallback(this, this._handleAccountRestoreSent, [sel[0].acct]);
    var params = {
        soapDoc:soapDoc,
        callback:respCallback,
        asyncMode:true
    };
    appCtxt.getAppController().sendRequest(params);

};

ZmBackupPage.prototype._handleAccountRestoreSent =
function(id, resp) {

    this._restoreButton.setEnabled(true);
    if(resp._data.AccountRestoreResponse.status == "restored") {
        appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.offlineBackupRestored, appCtxt.accountList.getAccount(id).name));
    }
};

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
        var id = visAccts[i].id;
        accounts.addPrefAccount(new ZmPrefAccount(name, false, desc, id));
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
    var visAccts = this.parent.getAccounts()._vector.getArray();
    for (var i=0; i< visAccts.length; i++) {
        item.name =  visAccts[i].name;
        item.desc = visAccts[i].desc;
        this.setCellContents(item, ZmPrefAcctListView.COL_NAME, AjxStringUtil.htmlEncode(AjxStringUtil.trim(item.name)));
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
    return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, "accts", AjxStringUtil.trim(item.name), field);
};

ZmPrefAcctListView.prototype._getHeaderList =
function() {
    return [
        (new DwtListHeaderItem({field:ZmPrefAcctListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
        (new DwtListHeaderItem({field:ZmPrefAcctListView.COL_NAME, text:ZmMsg.name, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),
        (new DwtListHeaderItem({field:ZmPrefAcctListView.COL_DESC, text:ZmMsg.emailAddr, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),
        (new DwtListHeaderItem({field:ZmPrefAcctListView.COL_ACTION, text:ZmMsg.action, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}))
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
        html[idx++] = "<input name='OFFLINE_BACKUP_ACCOUNT_ID' type='checkbox' ";
        html[idx++] = item.active ? "checked " : "";
        html[idx++] = "id='";
        html[idx++] = AjxStringUtil.trim(item.name);
        html[idx++] = "_acctsCheckbox' _name='";
        html[idx++] = AjxStringUtil.trim(item.name);
        html[idx++] = "' _acId='";
        html[idx++] = this._internalId;
        html[idx++] = "' onclick='ZmPrefAcctListView._activeStateChange;'>";
    } else if (field == ZmPrefAcctListView.COL_DESC) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefAcctListView.COL_DESC);
        html[idx++] = "'>";
        html[idx++] = AjxStringUtil.stripTags(item.desc, true);
        html[idx++] = "</div>";
    } else if (field == ZmPrefAcctListView.COL_NAME) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefAcctListView.COL_NAME);
        html[idx++] = "' title='";
        html[idx++] = item.name;
        html[idx++] = "'>";
        html[idx++] = AjxStringUtil.stripTags(item.name, true);
        html[idx++] = "</div>";
    } else if (field == ZmPrefAcctListView.COL_ACTION) {
        html[idx++] = "<a href='javascript:;' onclick='alert(";
        html[idx++] = '"' + item.name + '"';
        html[idx++] = ");'>";
        html[idx++] = ZmMsg.offlineBackUpNow;
        html[idx++] = "</a>";
    }

    return idx;
};


/**
 * Handles click of 'active' checkbox by toggling the rule's active state.
 *
 * @param ev			[DwtEvent]	click event
 */
ZmPrefAcctListView._activeStateChange =
function(ev) {
    var target = DwtUiEvent.getTarget(ev);
    var flvId = target.getAttribute("_acId");
    var flv = AjxCore.objectWithId(flvId);
    var name = target.getAttribute("_name");
    var z = flv.parent.getAccounts().getPrefAccountByName(name);
    if (z) {
        z.active = !z.active;
    }
};

ZmPrefAcctListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
    var target = DwtUiEvent.getTarget(ev);
    var isInput = (target.id.indexOf("_acctsCheckbox") > 0);
    if (isInput) {
        ZmPrefAcctListView._activeStateChange(ev);
    }

    return !isInput;
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
ZmPrefAccount = function(name, active, desc, id) {
    this.name = name;
    this.active = (active !== false);
    this.desc = desc;
    this.id = id;
    this._origStatus = this.active;
};

ZmBackupPage.prototype.getBackups =
function() {
    if (!this._backups) {
        this._backups = ZmBackupPage._getBackups();
    }
    return this._backups;
};


ZmBackupPage._getBackups = function(evt) {

    var backups = new ZmPrefBackups();
    var soapDoc = AjxSoapDoc.create("AccountBackupEnumerationRequest", "urn:zimbraOffline");
    var result = appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:false});

    this.backupDetailsLoaded = true;
    var _restoreAccts = result.AccountBackupEnumerationResponse.account;
    for (var i=0; i< _restoreAccts.length; i++) {
        var fileSize = _restoreAccts[i].backup[0].fileSize;
        var timestamp = _restoreAccts[i].backup[0].time;
        var acct =  _restoreAccts[i].id;
        backups.addPrefBackup(new ZmPrefBackup(timestamp, false, fileSize, acct));
    }
    return backups;
};

/**
 * ZmPrefBackupListView
 *
 * @param parent
 * @param controller
 * @private
 */

ZmPrefBackupListView  = function(parent, controller) {

    DwtListView.call(this, {
        parent: parent,
        className: "ZmFilterListView",
        headerList: this._getHeaderList(),
        view: ZmId.OFFLINE_BACKUP_RESTORE
    });

    this._controller = controller;
    this.multiSelectEnabled = false; // single selection only
    this._internalId = AjxCore.assignId(this);
};

ZmPrefBackupListView.COL_ACTIVE	= "ac";
ZmPrefBackupListView.COL_NAME	= "na";
ZmPrefBackupListView.COL_DESC	= "ds";
ZmPrefBackupListView.COL_ACTION	= "an";
ZmPrefBackupListView.CHECKBOX_PREFIX = "_BackupCheckbox";


ZmPrefBackupListView.prototype = new DwtListView;
ZmPrefBackupListView.prototype.constructor = ZmPrefBackupListView;

ZmPrefBackupListView.prototype.toString =
function() {
    return "ZmPrefBackupListView";
};

ZmPrefBackupListView.prototype.set =
function(list) {
    this._checkboxIds = [];
    DwtListView.prototype.set.call(this, list);
    //    if (!this.backupDetailsLoaded) {
    this.loadBackupDetails();
    //    }
};

ZmPrefBackupListView.prototype.loadBackupDetails =
function() {
    var restoreArr =   this.parent._backups._vector.getArray();
    var item = {};
    for (var i = 0; i < restoreArr.length; i++) {
        item.timestamp = restoreArr[i].timestamp;
        item.size = restoreArr[i].fileSize;
        this.setCellContents(item, ZmPrefBackupListView.COL_NAME, item.timestamp);
        this.setCellContents(item, ZmPrefBackupListView.COL_DESC, item.size);
    }
};

ZmPrefBackupListView.prototype.setCellContents = function(item, field, html) {
    var el = this.getCellElement(item, field);
    if (!el) { return; }
    el.innerHTML = html;
};

ZmPrefBackupListView.prototype.getCellElement = function(item, field) {
    return document.getElementById(this._getCellId(item, field));
};

ZmPrefBackupListView.prototype._getCellId = function(item, field, params) {
    return DwtId.getListViewItemId(DwtId.WIDGET_ITEM_CELL, "backup", item.timestamp, field);
};


ZmPrefBackupListView.prototype._getHeaderList =
function() {
    return  [
        (new DwtListHeaderItem({field:ZmPrefBackupListView.COL_ACTIVE, text:ZmMsg.active, width:ZmMsg.COLUMN_WIDTH_ACTIVE})),
        (new DwtListHeaderItem({field:ZmPrefBackupListView.COL_NAME, text:ZmMsg.date, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),
        (new DwtListHeaderItem({field:ZmPrefBackupListView.COL_DESC, text:ZmMsg.size, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV})),
        (new DwtListHeaderItem({field:ZmPrefBackupListView.COL_ACTION, text:ZmMsg.account, width:ZmMsg.COLUMN_WIDTH_FOLDER_DLV}))
    ];
};

ZmPrefBackupListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
    if (field == ZmPrefBackupListView.COL_ACTIVE) {
        html[idx++] = "<input name='offline_backup_restore' type='checkbox' ";
        html[idx++] = item.active ? "checked " : "";
        html[idx++] = "id='";
        html[idx++] = item.timestamp;
        html[idx++] = "_backupCheckbox' _name='";
        html[idx++] = item.timestamp;
        html[idx++] = "' _bkId='";
        html[idx++] = this._internalId;
        html[idx++] = "' onchange='ZmPrefBackupListView._activeStateChange'>";
    } else if (field == ZmPrefBackupListView.COL_DESC) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_DESC);
        html[idx++] = "'>";
        html[idx++] = item.fileSize;
        html[idx++] = "</div>";
    }
    else if (field == ZmPrefBackupListView.COL_NAME) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_NAME);
        html[idx++] = "' title='";
        html[idx++] = item.name;
        html[idx++] = "'>";
        html[idx++] = item.timestamp;
        html[idx++] = "</div>";
    }
    else if (field == ZmPrefBackupListView.COL_ACTION) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_ACTION);
        html[idx++] = "'>";
        html[idx++] = appCtxt.accountList.getAccount(item.id).name;
        html[idx++] = "</div>";
    }
    return idx;
};

ZmPrefBackupListView._activeStateChange =
function(ev) {
    var target = DwtUiEvent.getTarget(ev);
    var bkId = target.getAttribute("_bkId");
    var bk = AjxCore.objectWithId(bkId);
    var name = target.getAttribute("_name");
    var z = bk.parent.getBackups().getPrefBackupByName(name);
    if (z) {
        z.active = !z.active;
    }
};

ZmPrefBackupListView.prototype._allowLeftSelection =
function(clickedEl, ev, button) {
    var target = DwtUiEvent.getTarget(ev);
    var isInput = (target.id.indexOf("_backupCheckbox") > 0);
    if (isInput) {
        ZmPrefBackupListView._activeStateChange(ev);
    }

    return !isInput;
};


/**
 * Model class to hold the list of backups
 * @private
 */
ZmPrefBackups = function() {
    ZmModel.call(this, ZmEvent.S_PREF_BACKUP);
    this._vector = new AjxVector();
    this._zNameHash = {};
};

ZmPrefBackups.prototype = new ZmModel;
ZmPrefBackups.prototype.constructor = ZmPrefBackups;

ZmPrefBackups.prototype.toString =
function() {
    return "ZmPrefBackups";
};

ZmPrefBackups.prototype.addPrefBackup =
function(Backup) {
    this._vector.add(Backup);
    this._zNameHash[Backup.timestamp] = Backup;
};

ZmPrefBackups.prototype.removePrefBackup =
function(Backup) {
    delete this._zNameHash[Backup.timestamp];
    this._vector.remove(Backup);
};

ZmPrefBackups.prototype.getPrefBackupByName =
function(timestamp) {
    return this._zNameHash[timestamp];
};

/**
 * ZmPrefBackup
 *
 * @param timestamp
 * @param active
 * @param fileSize
 * @param acct
 *
 * @private
 */
ZmPrefBackup = function(timestamp, active, fileSize, acct) {
    this.fileSize = fileSize;
    this.active = (active !== false);
    this.timestamp = timestamp;
    this.acct = acct;
    this._origStatus = this.active;
};