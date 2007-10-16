/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmDataSourceCollection = function() {
    ZmModel.call(this, ZmEvent.S_DATA_SOURCE);
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

ZmDataSourceCollection.prototype.getItemsFor = function(folderId) {
    var accounts = [];
    for (var id in this._itemMap) {
        var account = this._itemMap[id];
        if (account.folderId == folderId && account.enabled) {
            accounts.push(account);
        }
    }
    return accounts;
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

ZmDataSourceCollection.prototype.importMailFor = function(folderId) {
	this.importMail(this.getItemsFor(folderId));
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
        appCtxt.getAppController().sendRequest(params);
    }
};

ZmDataSourceCollection.prototype.getById = function(id) {
	return this._itemMap[id];
};

ZmDataSourceCollection.prototype.getByFolderId = function(folderId) {
	for (var id in this._itemMap) {
		var item = this._itemMap[id];
		if (item.folderId == folderId)
			return item;
	}
	return null;
};

ZmDataSourceCollection.prototype.add = function(item) {
	this._itemMap[item.id] = item;
	if (item.type == ZmAccount.POP) {
		this._pop3Map[item.id] = item;
	}
	else if (item.type == ZmAccount.IMAP) {
		this._imapMap[item.id] = item;
	}
	appCtxt.getIdentityCollection().add(item.getIdentity());
	this._notify(ZmEvent.E_CREATE, {item:item});
};

ZmDataSourceCollection.prototype.modify = function(item) {
	appCtxt.getIdentityCollection().notifyModify(item.getIdentity(), true);
    this._notify(ZmEvent.E_MODIFY, {item:item});
};

ZmDataSourceCollection.prototype.remove = function(item) {
    delete this._itemMap[item.id];
	delete this._pop3Map[item.id];
	delete this._imapMap[item.id];
	appCtxt.getIdentityCollection().remove(item.getIdentity());
    this._notify(ZmEvent.E_DELETE, {item:item});
};

ZmDataSourceCollection.prototype.initialize = function(dataSources) {
    if (!dataSources) return;

    var popAccounts = dataSources.pop3 || [];
    for (var i = 0; i < popAccounts.length; i++) {
        var pop3 = new ZmPopAccount(popAccounts[i].id);
        pop3.setFromJson(popAccounts[i]);
        this.add(pop3);
    }

	var imapAccounts = dataSources.imap || [];
	for (var i = 0; i < imapAccounts.length; i++) {
		var imap = new ZmImapAccount();
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

    var appController = appCtxt.getAppController();
    var action = new AjxTimedAction(appController, appController.sendRequest, [params]);
    AjxTimedAction.scheduleAction(action, delayMs || 2000);
};

ZmDataSourceCollection.prototype._checkStatusResponse =
function(sourceMap, result) {
	var dataSources = [];

	// gather sources from the response
	var popSources = result._data.GetImportStatusResponse.pop3;
	if (popSources) {
		for (var i in popSources) {
			dataSources.push(popSources[i]);
		}
	}
	var imapSources = result._data.GetImportStatusResponse.imap;
	if (imapSources) {
		for (var i in imapSources) {
			dataSources.push(imapSources[i]);
		}
	}
	var genericSources = result._data.GetImportStatusResponse.dsrc;
	if (genericSources) {
		for (var i in genericSources) {
			dataSources.push(genericSources[i]);
		}
	}

	// is there anything to do?
	if (dataSources.length == 0) return;

	// report status
	for (var i = 0; i < dataSources.length; i++) {
		var dsrc = dataSources[i];
		// NOTE: Only report the ones we were asked to; forget others
		if (!dsrc.isRunning && sourceMap[dsrc.id]) {
			var source = sourceMap[dsrc.id];
			if (sourceMap[dsrc.id]) {
				delete sourceMap[dsrc.id];
				if (dsrc.success) {
					var message = AjxMessageFormat.format(ZmMsg.dataSourceLoadSuccess, source.name);
					appCtxt.setStatusMsg(message);
				}
				else {
					var message = AjxMessageFormat.format(ZmMsg.dataSourceLoadFailure, source.name);
					appCtxt.setStatusMsg(message, ZmStatusView.LEVEL_CRITICAL);
					var dialog = appCtxt.getErrorDialog();
					dialog.setMessage(message, dsrc.error, DwtMessageDialog.CRITICAL_STYLE);
					dialog.popup();
				}
			}
		}
	}

	// continue checking status
	if (AjxUtil.keys(sourceMap).length > 0) {
		this._checkStatus(sourceMap, 2000);
	}
};
