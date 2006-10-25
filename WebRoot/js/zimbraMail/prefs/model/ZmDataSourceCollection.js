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

ZmDataSourceCollection.prototype.initialize = function(datasources) {

    /*** DEBUG: waiting for getinfo data ***/
    var soapDoc = AjxSoapDoc.create("GetDataSourcesRequest", "urn:zimbraMail");

    var params = {
        soapDoc: soapDoc,
        asyncMode: false
    };
    var resp;
    try {
        resp = this._appCtxt.getAppController().sendRequest(params);
        resp = resp && resp.GetDataSourcesResponse;
    }
    catch (e) {
        // DEBUG: ignore
    }

    if (resp && resp.pop3) {
        for (var i = 0; i < resp.pop3.length; i++) {
            var account = new ZmPopAccount(this._appCtxt);
            account.set(resp.pop3[i]);
            this.add(account);
        }
    }
    /***/

    if (!datasources) return;
    var popAccounts = datasources.pop3 || [];
    for (var i = 0; i < popAccounts.length; i++) {
        var pop3 = new ZmPopAccount(this._appCtxt);
        pop3.set(popAccounts[i]);
        this.add(pop3);
    }
};