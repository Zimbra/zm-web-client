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

ZmDataSourceCollection = function(appCtxt) {
    ZmModel.call(this, ZmEvent.S_DATA_SOURCE);
    this._appCtxt = appCtxt;
    this._itemMap = {};
    this._pop3Map = {};
	this._imapMap = {};
};
ZmDataSourceCollection.prototype = new ZmModel;
ZmDataSourceCollection.prototype.constructor = ZmDataSourceCollection;

//
// Public methods
//

ZmDataSourceCollection.prototype.getItems = function() {
	return AjxUtil.values(this._itemMap);
};

ZmDataSourceCollection.prototype.getPopAccounts = function() {
    return AjxUtil.values(this._pop3Map);
};

ZmDataSourceCollection.prototype.getImapAccounts = function() {
    return AjxUtil.values(this._imapMap);
};

ZmDataSourceCollection.prototype.getPopAccountsFor = function(folderId) {
    var accounts = [];
    for (var id in this._pop3Map) {
        var account = this._pop3Map[id];
        if (account.folderId == folderId && account.enabled) {
            accounts.push(account);
        }
    }
    return accounts;
};

ZmDataSourceCollection.prototype.getImapAccountsFor = function(folderId) {
    var accounts = [];
    for (var id in this._imapMap) {
        var account = this._imapMap[id];
        if (account.folderId == folderId && account.enabled) {
            accounts.push(account);
        }
    }
    return accounts;
};

ZmDataSourceCollection.prototype.importPopMailFor = function(folderId) {
	this.importMail(this.getPopAccountsFor(folderId));
};

ZmDataSourceCollection.prototype.importImapMailFor = function(folderId) {
	this.importMail(this.getImapAccountsFor(folderId));
};

ZmDataSourceCollection.prototype.importMail = function(accounts) {
    if (accounts && accounts.length > 0) {
        var sourceMap = {};
        var soapDoc = AjxSoapDoc.create("ImportDataRequest", "urn:zimbraMail");
        for (var i = 0; i < accounts.length; i++) {
            var account = accounts[i];
            sourceMap[account.id] = account;

            var dsrc = soapDoc.set(account.ELEMENT_NAME);
            dsrc.setAttribute("id", account.id);
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

ZmDataSourceCollection.prototype.getById = function(id) {
	return this._itemMap[id];
};

ZmDataSourceCollection.prototype.add = function(item) {
	this._itemMap[item.id] = item;
	if (item.type == ZmAccount.POP) {
		this._pop3Map[item.id] = item;
	}
	else if (item.type == ZmAccount.IMAP) {
		this._imapMap[item.id] = item;
	}
	this._appCtxt.getIdentityCollection().add(item.getIdentity());
	this._notify(ZmEvent.E_CREATE, {item:item});
};

ZmDataSourceCollection.prototype.modify = function(item) {
	this._appCtxt.getIdentityCollection().notifyModify(item.getIdentity(), true);
    this._notify(ZmEvent.E_MODIFY, {item:item});
};

ZmDataSourceCollection.prototype.remove = function(item) {
    delete this._itemMap[item.id];
	delete this._pop3Map[item.id];
	delete this._imapMap[item.id];
	this._appCtxt.getIdentityCollection().remove(item.getIdentity());
    this._notify(ZmEvent.E_DELETE, {item:item});
};

ZmDataSourceCollection.prototype.initialize = function(dataSources) {
    if (!dataSources) return;

    var popAccounts = dataSources.pop3 || [];
    for (var i = 0; i < popAccounts.length; i++) {
        var pop3 = new ZmPopAccount(this._appCtxt, popAccounts[i].id);
        pop3.setFromJson(popAccounts[i]);
        this.add(pop3);
    }

	var imapAccounts = dataSources.imap || [];
	for (var i = 0; i < imapAccounts.length; i++) {
		var imap = new ZmImapAccount(this._appCtxt);
		imap.setFromJson(imapAccounts[i]);
		this.add(imap);
	}
};

//
// Protected methods
//

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
    var status = result._data.GetImportStatusResponse.dsrc;
    if (!status) return;

    for (var i = 0; i < status.length; i++) {
        var dsrc = status[i];
        if (!dsrc.isRunning) {
            var source = sourceMap[dsrc.id];
            if (sourceMap[dsrc.id]) {
                delete sourceMap[dsrc.id];
                if (dsrc.success) {
                    var message = AjxMessageFormat.format(ZmMsg.dataSourceLoadSuccess, source.name);
                    this._appCtxt.setStatusMsg(message);
                }
                else {
                    var message = AjxMessageFormat.format(ZmMsg.dataSourceLoadFailure, source.name);
                    this._appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
                    var dialog = this._appCtxt.getErrorDialog();
                    dialog.setMessage(message, dsrc.error, DwtMessageDialog.CRITICAL_STYLE);
                    dialog.popup();
                }
            }
        }
    }

    if (AjxUtil.keys(sourceMap).length > 0) {
        this._checkStatus(sourceMap, 2000);
    }
};
