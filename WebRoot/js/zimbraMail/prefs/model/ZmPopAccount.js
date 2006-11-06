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
function ZmPopAccount(appCtxt, id, list) {
    ZmItem.call(this, appCtxt, ZmItem.DATA_SOURCE, id, list);
    // NOTE: ZmItem sets folderId to 0, so reset it
    this.folderId = ZmPopAccount.prototype.folderId;
};
ZmPopAccount.prototype = new ZmItem;
ZmPopAccount.prototype.constructor = ZmPopAccount;

ZmPopAccount.prototype.toString =
function() {
	return "ZmPopAccount";
};

//
// Constants
//

/***
ZmPopAccount.REMOVE_NEVER = 0;
ZmPopAccount.REMOVE_UPON_DOWNLOAD = 1;
ZmPopAccount.REMOVE_AFTER_1_DAY = 2;
ZmPopAccount.REMOVE_AFTER_1_WEEK = 3;
ZmPopAccount.REMOVE_AFTER_1_MONTH = 4;
ZmPopAccount.REMOVE_UPON_DELETE = 5;
/***/

ZmPopAccount.PORT_DEFAULT = 110;
ZmPopAccount.PORT_SSL = 995;

ZmPopAccount.CONNECT_CLEAR = "cleartext";
ZmPopAccount.CONNECT_SSL = "ssl";
/***
ZmPopAccount.CONNECT_START_TLS = "starttls";
/***/

ZmPopAccount._ANAME2PNAME = {
    id: "id",
    name: "name",
    isEnabled: "enabled",
    host: "mailServer",
    port: "port",
    username: "userName",
    password: "password",
    l: "folderId",
    connectionType: "connectionType"
};

//
// Data
//

ZmPopAccount.prototype.id;
ZmPopAccount.prototype.name = "";
ZmPopAccount.prototype.enabled = true;

// basic settings
ZmPopAccount.prototype.mailServer = "";
ZmPopAccount.prototype.userName = "";
ZmPopAccount.prototype.password = "";
ZmPopAccount.prototype.folderId = ZmOrganizer.ID_INBOX;

// advanced settings
/***
ZmPopAccount.prototype.maxDownloadSizeKb;
ZmPopAccount.prototype.removeMessages = ZmPopAccount.REMOVE_NEVER;
/***/
ZmPopAccount.prototype.port = ZmPopAccount.PORT_DEFAULT;
ZmPopAccount.prototype.connectionType = ZmPopAccount.CONNECT_CLEAR;
/***
ZmPopAccount.prototype.trustSelfSignedCerts = false;
/***/

//
// Public methods
//

ZmPopAccount.prototype.create =
function(callback, errorCallback, batchCommand) {
    var soapDoc = AjxSoapDoc.create("CreateDataSourceRequest", "urn:zimbraMail");
    var pop3 = soapDoc.set("pop3");
    for (var aname in ZmPopAccount._ANAME2PNAME) {
        var pname = ZmPopAccount._ANAME2PNAME[aname];
        var avalue = this[pname];
        pop3.setAttribute(aname, avalue);
    }

    if (batchCommand) {
        var execFrame = null; // REVISIT: What should this be?
        batchCommand.addNewRequestParams(soapDoc, callback, errorCallback, execFrame);
    }
    else {
        var params = {
            soapDoc: soapDoc,
            asyncMode: Boolean(callback),
            callback: callback,
            errorCallback: errorCallback
        };
        return this._appCtxt.getAppController().sendRequest(params);
    }
};

ZmPopAccount.prototype.save =
function(callback, errorCallback, batchCommand) {
    var soapDoc = AjxSoapDoc.create("ModifyDataSourceRequest", "urn:zimbraMail");
    var pop3 = soapDoc.set("pop3");
    pop3.setAttribute("id", this.id);
    for (var aname in ZmPopAccount._ANAME2PNAME) {
        var pname = ZmPopAccount._ANAME2PNAME[aname];
        if (!this.hasOwnProperty(pname)) {
            continue;
        }
        var avalue = this[pname];
        pop3.setAttribute(aname, avalue);
    }

    if (batchCommand) {
        var execFrame = null; // REVISIT: What should this be?
        batchCommand.addNewRequestParams(soapDoc, callback, errorCallback, execFrame);
    }
    else {
        var params = {
            soapDoc: soapDoc,
            asyncMode: Boolean(callback),
            callback: callback,
            errorCallback: errorCallback
        };
        return this._appCtxt.getAppController().sendRequest(params);
    }
};

ZmPopAccount.prototype.doDelete =
function(callback, errorCallback, batchCommand) {
    var soapDoc = AjxSoapDoc.create("DeleteDataSourceRequest", "urn:zimbraMail");
    var pop3 = soapDoc.set("pop3");
    pop3.setAttribute("id", this.id);

    if (batchCommand) {
        var execFrame = null; // REVISIT: What should this be?
        batchCommand.addNewRequestParams(soapDoc, callback, errorCallback, execFrame);
        return;
    }

    var params = {
        soapDoc: soapDoc,
        asyncMode: Boolean(callback),
        callback: callback,
        errorCallback: errorCallback
    };
    return this._appCtxt.getAppController().sendRequest(params);
};

ZmPopAccount.prototype.testConnection =
function(callback, errorCallback, batchCommand) {
    var soapDoc = AjxSoapDoc.create("TestDataSourceRequest", "urn:zimbraMail");
    var pop3 = soapDoc.set("pop3");
    pop3.setAttribute("host", this.mailServer);
    pop3.setAttribute("port", this.port || ZmPopAccount.PORT_DEFAULT);
    pop3.setAttribute("username", this.userName);
    pop3.setAttribute("password", this.password);
    pop3.setAttribute("connectionType", this.connectionType);

    if (!this._new) {
        pop3.setAttribute("id", this.id);
        if (!this.hasOwnProperty("mailServer")) pop3.removeAttribute("host");
        if (!this.hasOwnProperty("port")) pop3.removeAttribute("port");
        if (!this.hasOwnProperty("userName")) pop3.removeAttribute("username");
        if (!this.hasOwnProperty("password")) pop3.removeAttribute("password");
        if (!this.hasOwnProperty("connectionType")) pop3.removeAttribute("connectionType");
    }

    if (batchCommand) {
        var execFrame = null;
        batchCommand.addNewRequestParams(soapDoc, callback, errorCallback, execFrame);
        return;
    }

    var params = {
        soapDoc: soapDoc,
        asyncMode: Boolean(callback),
        callback: callback,
        errorCallback: errorCallback
    };
    return this._appCtxt.getAppController().sendRequest(params);
};

ZmPopAccount.prototype.removeMessages =
function(callback, errorCallback) {
    alert("removeMessages"); // TODO
};

ZmPopAccount.prototype.set = function(obj) {
    this.id = obj.id;
    this.name = obj.name || this.name;
    this.enabled = obj.isEnabled != null ? Boolean(obj.isEnabled) : this.enabled;
    this.mailServer = obj.host || this.mailServer;
    this.port = obj.port || this.port || ZmPopAccount.PORT_DEFAULT;
    this.userName = obj.username || this.userName;
    this.password = obj.password != null ? obj.password : this.password;
    this.folderId = obj.l || this.folderId;
    this.connectionType = obj.connectionType || this.connectionType;
};

//
// Protected methods
//

ZmPopAccount.prototype._loadFromDom =
function(data) {
    this.set(data);
};
