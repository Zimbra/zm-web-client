/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmDataSourceCollection(appCtxt) {
    ZmModel.call(this, ZmEvent.S_DATA_SOURCE);
    this._appCtxt = appCtxt;
    this._itemMap = {};
    this._pop3Map = {};
};
ZmDataSourceCollection.prototype = new ZmModel;
ZmDataSourceCollection.prototype.constructor = ZmDataSourceCollection;

//
// Data
//

ZmDataSourceCollection.prototype._appCtxt;
ZmDataSourceCollection.prototype._itemMap;
ZmDataSourceCollection.prototype._pop3Map;

//
// Public methods
//

ZmDataSourceCollection.prototype.getItems = function() {
	return AjxUtil.values(this._itemMap);
};

ZmDataSourceCollection.prototype.getPopAccounts = function() {
    return AjxUtil.values(this._pop3Map);
};

ZmDataSourceCollection.prototype.getPopAccountsFor = function(folderId) {
    var popAccounts = [];
    for (var id in this._pop3Map) {
        var account = this._pop3Map[id];
        if (account.folderId == folderId && account.enabled) {
            popAccounts.push(account);
        }
    }
    return popAccounts;
};

ZmDataSourceCollection.prototype.importPopMailFor = function(folderId) {
    var popAccounts = this.getPopAccountsFor(folderId);
    if (popAccounts.length > 0) {
        var sourceMap = {};
        var soapDoc = AjxSoapDoc.create("ImportDataRequest", "urn:zimbraMail");
        for (var i = 0; i < popAccounts.length; i++) {
            var account = popAccounts[i];
            sourceMap[account.id] = account;

            var pop3 = soapDoc.set("pop3");
            pop3.setAttribute("id", account.id);
        }

        var callback = new AjxCallback(this, this._checkStatus, [sourceMap, 2000]);
        var params = {
            soapDoc: soapDoc,
            asyncMode: true,
            callback: callback,
            errorCallback: null
        };
        this._appCtxt.getAppController().sendRequest(params);
    }
};

ZmDataSourceCollection.prototype._checkStatus =
function(sourceMap, delayMs) {
    var soapDoc = AjxSoapDoc.create("GetImportStatusRequest", "urn:zimbraMail");

    var callback = new AjxCallback(this, this._checkStatusResponse, [sourceMap]); 
    var params = {
        soapDoc: soapDoc,
        asyncMode: true,
        callback: callback,
        errorCallback: null
    };

    var appController = this._appCtxt.getAppController();
    var action = new AjxTimedAction(appController, appController.sendRequest, [params]);
    AjxTimedAction.scheduleAction(action, delayMs || 2000);
};

ZmDataSourceCollection.prototype._checkStatusResponse =
function(sourceMap, result) {
    var popStatus = result._data.GetImportStatusResponse.pop3;
    if (!popStatus) return;

    for (var i = 0; i < popStatus.length; i++) {
        var pop3 = popStatus[i];
        if (!pop3.isRunning) {
            var source = sourceMap[pop3.id];
            if (sourceMap[pop3.id]) {
                delete sourceMap[pop3.id];
                if (pop3.success) {
                    var message = AjxMessageFormat.format(ZmMsg.popAccountLoadSuccess, source.name);
                    this._appCtxt.setStatusMsg(message);
                }
                else {
                    var message = AjxMessageFormat.format(ZmMsg.popAccountLoadFailure, source.name);
                    this._appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
                    var dialog = this._appCtxt.getErrorDialog();
                    dialog.setMessage(message, pop3.error, DwtMessageDialog.CRITICAL_STYLE);
                    dialog.popup();
                }
            }
        }
    }

    if (AjxUtil.keys(sourceMap).length > 0) {
        this._checkStatus(sourceMap, 2000);
    }
};

ZmDataSourceCollection.prototype.getById = function(id) {
	return this._itemMap[id];
};

ZmDataSourceCollection.prototype.add = function(item) {
	this._itemMap[item.id] = item;
    if (item instanceof ZmPopAccount) {
        this._pop3Map[item.id] = item;
    }
    this._notify(ZmEvent.E_CREATE, {item:item});
};

ZmDataSourceCollection.prototype.modify = function(item) {
    this._notify(ZmEvent.E_MODIFY, {item:item});
};

ZmDataSourceCollection.prototype.remove = function(item) {
    delete this._itemMap[item.id];
    delete this._pop3Map[item.id];
    this._notify(ZmEvent.E_DELETE, {item:item});
};

ZmDataSourceCollection.prototype.initialize = function(dataSources) {
    if (!dataSources) return;

    var popAccounts = dataSources.pop3 || [];
    for (var i = 0; i < popAccounts.length; i++) {
        var pop3 = new ZmPopAccount(this._appCtxt);
        pop3.set(popAccounts[i]);
        this.add(pop3);
    }
};