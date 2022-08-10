/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2011, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
    //this.backupDetailsLoaded = false;
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
        this._restoreListView.set(this.getBackups(true)._vector.clone());
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
    this._backupButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_button"});
    this._backupButton.setText(ZmMsg.offlineBackUpButton);
    this._backupButton.addSelectionListener(new AjxListener(this, this._handleBackupAccountsButton));

    this._restoreButton = new DwtButton({parent:this, parentElement: this._htmlElId+"_restore_button"});
    this._restoreButton.setText(ZmMsg.offlineBackUpRestore);
    this._restoreButton.addSelectionListener(new AjxListener(this, this._handleRestoreBackupButton));

    ZmPreferencesPage.prototype._createControls.apply(this, arguments);
};

ZmBackupPage.prototype._handleBackupAccountsButton =
function() {
    this._backupButton.setEnabled(false);

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
        this._backupButton.setEnabled(true);
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

ZmBackupPage._handleBackupNowLink =
function(id, obj) {
    var backupPage = DwtControl.fromElementId(obj);
    backupPage._handleBackupNowLink(id);
};

ZmBackupPage.prototype._handleBackupNowLink =
function(id) {

    try{
        var soapDoc = AjxSoapDoc.create("AccountBackupRequest", "urn:zimbraOffline");
        var method = soapDoc.getMethod();
        method.setAttribute("id", id);
        var respCallback = new AjxCallback(this, this._handleBackupAcctStarted , id);
        var params = {
            soapDoc:soapDoc,
            callback:respCallback,
            asyncMode:true
        };
        appCtxt.getAppController().sendRequest(params);
    }
    finally { // do
        return false;
    }
};

ZmBackupPage.prototype._handleBackupAcctStarted =
function(id) {
    appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.offlineBackupStartedForAcct, appCtxt.accountList.getAccount(id).getDisplayName()));
};

ZmBackupPage.prototype._handleBackupStarted =
function(result) {
    appCtxt.setStatusMsg(ZmMsg.offlineBackUpStarted);
    this._backupButton.setEnabled(true);
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

ZmBackupPage.prototype.addCommand  =
function(batchCommand) {

    var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
    var accts = this.getAccounts()._vector.getArray();

    var settingsObj = appCtxt.getSettings();
    var setting = settingsObj.getSetting(ZmSetting.OFFLINE_BACKUP_ACCOUNT_ID);

    var checked = [];
    for (var i = 0; i < accts.length; i++) {
        if (accts[i].active) {
            checked.push(accts[i].id);
        }
    }
    var node = soapDoc.set("pref", checked.join(","));
    node.setAttribute("name", "zimbraPrefOfflineBackupAccountId");
    setting.setValue(checked.join(", "));
    batchCommand.addNewRequestParams(soapDoc);
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
    var savedAccounts = appCtxt.get(ZmSetting.OFFLINE_BACKUP_ACCOUNT_ID);
    savedAccounts = (savedAccounts && savedAccounts.length) ? savedAccounts.split(",") : [];
    var accounts = new ZmPrefAccounts();
    var visAccts = appCtxt.accountList.visibleAccounts;
    for (var i=0; i< visAccts.length; i++) {
        var name =  visAccts[i].getDisplayName();
        var desc = visAccts[i].name;
        var id = visAccts[i].id;

        loop1: for (var k=0; k < savedAccounts.length ; k++)  {
                var checked = (id == AjxStringUtil.trim(savedAccounts[k]));
                if(checked) { break loop1; }
            }
        accounts.addPrefAccount(new ZmPrefAccount(name, checked, desc, id));
    }
    return accounts;
};

ZmBackupPage.prototype._isChecked =
function(name) {
    var z = this.getAccounts().getPrefAccountByName(name);
    return (z && z.active);
};

ZmBackupPage.prototype.isDirty =
function() {
    var allAccountss = this.getAccounts();
    var r = false;
    var arr = allAccountss._vector.getArray();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i]._origStatus != arr[i].active) {
            r = true;
            break;
        }
    }
    return r;
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
    this.setMultiSelect(false); // single selection only
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
        html[idx++] = "<a href='javascript:;' onclick='ZmBackupPage._handleBackupNowLink(";
        var accId = appCtxt.accountList.getAccountByName(AjxStringUtil.trim(item.desc)).id;
        html[idx++] = '"' + accId.toString();
        html[idx++] = '","' + this.parent._htmlElId + '"';
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
function(force) {
    if (!this._backups || force) {
        this._backups = ZmBackupPage._getBackups();
    }
    return this._backups;
};


ZmBackupPage._getBackups =
function(evt) {

    var soapDoc = AjxSoapDoc.create("AccountBackupEnumerationRequest", "urn:zimbraOffline");
    var result = appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:false});

    var _restoreAccts = result.AccountBackupEnumerationResponse.account;
    var backups = new ZmPrefBackups();
    for (var i=0; i< _restoreAccts.length; i++) {
        var acct =  _restoreAccts[i].id;
        var backupArray = _restoreAccts[i].backup;
        if(!backupArray) {
            continue;
        }

        for(var k=0; k<backupArray.length; k++) {
            var fileSize = backupArray[k].fileSize;
            var timestamp = backupArray[k].time;
            backups.addPrefBackup(new ZmPrefBackup(timestamp, false, fileSize, acct));
        }

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
    this.setMultiSelect(false); // single selection only
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
    //this.loadBackupDetails();
};

ZmPrefBackupListView.prototype.loadBackupDetails =
function() {
    var restoreArr =   this.parent._backups._vector.getArray();
    var item = {};
    for (var i = 0; i < restoreArr.length; i++) {
        item.timestamp = restoreArr[i].timestamp;
        item.size = restoreArr[i].fileSize;
        item.acct = restoreArr[i].acct;
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
        html[idx++] = "_";
        html[idx++] = item.acct;
        html[idx++] = "_backupCheckbox' _name='";
        html[idx++] = item.timestamp;
        html[idx++] = "_";
        html[idx++] = item.acct;
        html[idx++] = "' _bkId='";
        html[idx++] = this._internalId;
        html[idx++] = "' onchange='ZmPrefBackupListView._activeStateChange'>";
    } else if (field == ZmPrefBackupListView.COL_DESC) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_DESC);
        html[idx++] = "'>";
        var fSize = item.fileSize;
        var numFormater = AjxNumberFormat.getInstance();
        if (fSize != null && fSize >= 0) {
            if (fSize < 1024) { //" B";
                fSize = numFormater.format(fSize) + " "+ZmMsg.b;
            }
            else if (fSize < (1024*1024) ) { //" KB";
                fSize = numFormater.format(Math.round((fSize / 1024) * 10) / 10) + " "+ZmMsg.kb;
            }
            else { //" MB";
                fSize = numFormater.format(Math.round((fSize / (1024*1024)) * 10) / 10) + " "+ZmMsg.mb;
            }
        } else { fSize = 0+" "+ZmMsg.b; }
        html[idx++] = fSize;
        html[idx++] = "</div>";
    }
    else if (field == ZmPrefBackupListView.COL_NAME) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_NAME);
        html[idx++] = "'>";
        html[idx++] = AjxDateFormat.getDateTimeInstance(AjxDateFormat.MEDIUM).format(new Date(item.timestamp));
        html[idx++] = "</div>";
    }
    else if (field == ZmPrefBackupListView.COL_ACTION) {
        html[idx++] = "<div id='";
        html[idx++] = this._getCellId(item, ZmPrefBackupListView.COL_ACTION);
        html[idx++] = "'>";
        html[idx++] = appCtxt.accountList.getAccount(item.acct).name;
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
    var bkups = bk.parent.getBackups();
    var z = bkups.getPrefBackupByName(name);
    var bkarray = bkups._vector.getArray();
    // Make checkbox behave like radio button
    for (var k=0; k<bkarray.length; k++) {
        if(bkarray[k].active && (bkarray[k].timestamp != z.timestamp)) {
            var y = document.getElementById([bkarray[k].timestamp, "_", bkarray[k].acct, "_backupCheckbox"].join(""));
            y.checked = false;
            bkarray[k].active = false;
        }
    }
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
    var hash = [Backup.timestamp, "_", Backup.acct].join("");
    this._zNameHash[hash] = Backup;
};

ZmPrefBackups.prototype.removePrefBackup =
function(Backup) {
    var hash = [Backup.timestamp, "_", Backup.acct].join("");
    delete this._zNameHash[hash];
    this._vector.remove(Backup);
};

ZmPrefBackups.prototype.getPrefBackupByName =
function(hash) {
    return this._zNameHash[hash];
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