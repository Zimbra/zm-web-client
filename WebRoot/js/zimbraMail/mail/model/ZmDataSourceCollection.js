/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates the data source collection.
 * @class
 * This class represents a data source collection.
 * 
 * @extends		ZmModel
 */
ZmDataSourceCollection = function() {
    ZmModel.call(this, ZmEvent.S_DATA_SOURCE);
	this._initialized = false;
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

/**
 * Gets the POP accounts.
 * 
 * @return	{Array}	an array of {@link ZmPopAccount} objects
 */
ZmDataSourceCollection.prototype.getPopAccounts = function() {
    return AjxUtil.values(this._pop3Map);
};

/**
 * Gets the IMAP accounts.
 * 
 * @return	{Array}	an array of {@link ZmImapAccount} objects
 */
ZmDataSourceCollection.prototype.getImapAccounts = function() {
    return AjxUtil.values(this._imapMap);
};

/**
 * Gets the POP accounts.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{Array}	an array of {@link ZmPopAccount} objects
 */
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

/**
 * Gets the IMAP accounts.
 * 
 * @param	{String}	folderId		the folder id
 * @return	{Array}	an array of {@link ZmImapAccount} objects
 */
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

	    // send import request
        var params = {
            soapDoc: soapDoc,
            asyncMode: true,
	        noBusyOverlay: true,
            callback: null,
            errorCallback: null
        };
        appCtxt.getAppController().sendRequest(params);

	    // kick off check status request because import request
	    // doesn't return for (potentially) a looong time
	    var delayMs = 2000;
	    var action = new AjxTimedAction(this, this._checkStatus, [sourceMap, delayMs]);
	    AjxTimedAction.scheduleAction(action, delayMs);
    }
};

ZmDataSourceCollection.prototype.getById = function(id) {
	return this._itemMap[id];
};

/**
 * Gets a list of data sources associated with the given folder ID.
 *
 * @param {String}	folderId		[String]	the folderId
 * @param {constant}	type			the type of data source (see <code>ZmAccount.TYPE_</code> constants)
 * @return	{Array}	an array of items
 * 
 * @see	ZmAccount
 */
ZmDataSourceCollection.prototype.getByFolderId = function(folderId, type) {
	var list = [];
	for (var id in this._itemMap) {
		var item = this._itemMap[id];
		if (item.folderId == folderId) {
			if (!type || (type && type == item.type))
				list.push(item);
		}
	}
	return list;
};

ZmDataSourceCollection.prototype.add = function(item) {
	this._itemMap[item.id] = item;
	if (item.type == ZmAccount.TYPE_POP) {
		this._pop3Map[item.id] = item;
	}
	else if (item.type == ZmAccount.TYPE_IMAP) {
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
	if (!dataSources || this._initialized) { return; }

	var errors = [];

	if (appCtxt.get(ZmSetting.POP_ACCOUNTS_ENABLED)) {
		var popAccounts = dataSources.pop3 || [];
		for (var i = 0; i < popAccounts.length; i++) {
			var object = popAccounts[i];
			var dataSource = new ZmPopAccount(object.id);
			dataSource.setFromJson(object);
			this.add(dataSource);
			if (!dataSource.isStatusOk()) {
				errors.push(dataSource);
			}
		}
	}

	if (appCtxt.get(ZmSetting.IMAP_ACCOUNTS_ENABLED)) {
		var imapAccounts = dataSources.imap || [];
		for (var i = 0; i < imapAccounts.length; i++) {
			var object = imapAccounts[i];
			var dataSource = new ZmImapAccount(object.id);
			dataSource.setFromJson(object);
			this.add(dataSource);
			if (!dataSource.isStatusOk()) {
				errors.push(dataSource);
			}
		}
	}

	this._initialized = true;

	var count = errors.length;
	if (count > 0) {
		// build error message
		var array = [
			AjxMessageFormat.format(ZmMsg.dataSourceFailureDescription, [count])
		];
		for (var i = 0; i < count; i++) {
			var dataSource = errors[i];
			var timestamp = Number(dataSource.failingSince);
			var lastError = dataSource.lastError;
			if (isNaN(timestamp)) {
				var pattern = ZmMsg.dataSourceFailureItem_noDate;
				var params = [AjxStringUtil.htmlEncode(dataSource.getName()), AjxStringUtil.htmlEncode(lastError)];
			} else {
				var pattern = ZmMsg.dataSourceFailureItem;
				var params = [AjxStringUtil.htmlEncode(dataSource.getName()), new Date(timestamp * 1000), AjxStringUtil.htmlEncode(lastError)];
			}
			array.push(AjxMessageFormat.format(pattern, params));
		}
		array.push(ZmMsg.dataSourceFailureInstructions);
		var message = array.join("");

		// show error message
		var shell = DwtShell.getShell(window);
		var dialog = new DwtMessageDialog({parent:shell,buttons:[DwtDialog.OK_BUTTON,DwtDialog.CANCEL_BUTTON]});
		dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE, ZmMsg.dataSourceFailureTitle);
		dialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this.__handleErrorDialogOk, [dialog]));
		dialog.popup();
	}
};

ZmDataSourceCollection.prototype.__handleErrorDialogOk = function(dialog) {
	dialog.popdown();

	var callback = new AjxCallback(this, this.__gotoPrefSection, ["ACCOUNTS"]);
	appCtxt.getAppController().activateApp(ZmApp.PREFERENCES, true, callback);
};

ZmDataSourceCollection.prototype.__gotoPrefSection = function(prefSectionId) {
	var controller = appCtxt.getApp(ZmApp.PREFERENCES).getPrefController();
	controller.getPrefsView().selectSection(prefSectionId);
};

//
// Protected methods
//

ZmDataSourceCollection.prototype._checkStatus =
function(sourceMap, delayMs) {
	// Slowly back off import status checks but no more than 15 secs.
	if (delayMs && delayMs < 15000) {
		delayMs += 2000;
	}

    var soapDoc = AjxSoapDoc.create("GetImportStatusRequest", "urn:zimbraMail");
    var callback = new AjxCallback(this, this._checkStatusResponse, [sourceMap, delayMs]);
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
function(sourceMap, delayMs, result) {
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
		this._checkStatus(sourceMap, delayMs);
	}
};
