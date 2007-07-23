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
 * Portions created by Zimbra are Copyright (C) 2006-2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmDataSource = function(appCtxt, type, id, list) {
	if (arguments.length == 0) return;
	ZmAccount.call(this, appCtxt, type, id, null, list);
	this.port = this.getDefaultPort();
	this.identity = new ZmIdentity(appCtxt, id);
	// defensive programming
	this.identity.create = null;
	this.identity.save = null;
	this.identity.doDelete = null;
};
ZmDataSource.prototype = new ZmAccount;
ZmDataSource.prototype.constructor = ZmDataSource;

ZmDataSource.prototype.toString =
function() {
	return "ZmDataSource";
};

//
// Constants
//

ZmDataSource.CONNECT_CLEAR = "cleartext";
ZmDataSource.CONNECT_SSL = "ssl";
ZmDataSource.CONNECT_DEFAULT = ZmDataSource.CONNECT_CLEAR;

ZmDataSource.POLL_NEVER = "0";

// soap attribute to property maps

ZmDataSource.DATASOURCE_ATTRS = {
	"id":				"id",
	"name":				"name",
	"isEnabled":		"enabled",
	"host":				"mailServer",
	"port":				"port",
	"username":			"userName",
	"password":			"password",
	"l":				"folderId",
	"connectionType":	"connectionType",
	"pollingInterval":	"pollingInterval",
	"leaveOnServer":	"leaveOnServer" // POP only
};

ZmDataSource.IDENTITY_ATTRS = {
	"emailAddress":					"sendFromAddress",
	"fromDisplay":					"sendFromDisplay",
	"useAddressForForwardReply":	"setReplyTo",
	"replyToAddress":				"setReplyToAddress",
	"replyToDisplay":				"setReplyToDisplay",
	"defaultSignature":				"signature"
};

//
// Data
//

ZmDataSource.prototype.ELEMENT_NAME = "dsrc";

// data source settings

ZmDataSource.prototype.enabled = true;

// basic settings

ZmDataSource.prototype.mailServer = "";
ZmDataSource.prototype.userName = "";
ZmDataSource.prototype.password = "";
ZmDataSource.prototype.folderId = ZmOrganizer.ID_INBOX;

// advanced settings

ZmDataSource.prototype.leaveOnServer = true;
ZmDataSource.prototype.connectionType = ZmDataSource.CONNECT_DEFAULT;
ZmDataSource.prototype.pollingInterval = ZmDataSource.POLL_NEVER;

//
// Public methods
//

/** NOTE: Email is same as the identity's from address. */
ZmDataSource.prototype.setEmail = function(email) {
	var identity = this.getIdentity();
	identity.setField(ZmIdentity.SEND_FROM_ADDRESS, email);
};

ZmDataSource.prototype.getEmail = function() {
	var identity = this.getIdentity();
	return identity.getField(ZmIdentity.SEND_FROM_ADDRESS);
};

ZmDataSource.prototype.setFolderId = function(folderId) {
	// TODO: Is there a better way to do this?
	//       I basically need to have the folder selector on the options
	//       page have a value of -1 but allow other code to see that and
	//       fill in the correct folder id. But I don't want it to
	//       overwrite that value once set.
	if (folderId == -1 && this.folderId != ZmOrganizer.ID_INBOX) {
		return;
	}
	this.folderId = folderId;
};

ZmDataSource.prototype.getFolderId = function() {
	return this.folderId;
};

ZmDataSource.prototype.getIdentity = function() {
	return this.identity;
};

// operations

ZmDataSource.prototype.create =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("CreateDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	for (var aname in ZmDataSource.DATASOURCE_ATTRS) {
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		var pvalue = this[pname];
		if (pname == "id" || !pvalue) continue;

		dsrc.setAttribute(aname, String(pvalue));
	}
	var identity = this.getIdentity();
	for (var aname in ZmDataSource.IDENTITY_ATTRS) {
		var pname = ZmDataSource.IDENTITY_ATTRS[aname];
		var pvalue = identity[pname];
		if (!pvalue) continue;

		dsrc.setAttribute(aname, String(pvalue));
	}

	var respCallback = new AjxCallback(this, this._handleCreateResponse, [callback]);
	if (batchCommand) {
		var execFrame = null; // REVISIT: What should this be?
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback, execFrame);
		return;
	}

	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return this._appCtxt.getAppController().sendRequest(params);
};

ZmDataSource.prototype.save =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("ModifyDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	// NOTE: If this object is a proxy, we guarantee that the
	//       the id attribute is ÷*always* set.
	dsrc.setAttribute("id", this.id);
	for (var aname in ZmDataSource.DATASOURCE_ATTRS) {
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		if (!this.hasOwnProperty(pname)) continue;

		var avalue = this[pname];
		dsrc.setAttribute(aname, String(avalue));
	}
	var identity = this.getIdentity();
	for (var aname in ZmDataSource.IDENTITY_ATTRS) {
		var pname = ZmDataSource.IDENTITY_ATTRS[aname];
		if (!identity.hasOwnProperty(pname)) continue;

		var avalue = identity[pname];
		dsrc.setAttribute(aname, String(avalue));
	}

	var respCallback = new AjxCallback(this, this._handleSaveResponse, [callback]);
	if (batchCommand) {
		var execFrame = null; // REVISIT: What should this be?
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback, execFrame);
		return;
	}

	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return this._appCtxt.getAppController().sendRequest(params);
};

ZmDataSource.prototype.doDelete =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("DeleteDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	dsrc.setAttribute("id", this.id);

	var respCallback = new AjxCallback(this, this._handleDeleteResponse, [callback]);
	if (batchCommand) {
		var execFrame = null; // REVISIT: What should this be?
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback, execFrame);
		return;
	}

	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return this._appCtxt.getAppController().sendRequest(params);
};

ZmDataSource.prototype.testConnection =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("TestDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);

	var attrs = ["host", "port", "username", "password", "connectionType"];
	for (var i = 0; i < attrs.length; i++) {
		var aname = attrs[i];
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		dsrc.setAttribute(aname, this[pname]);
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

ZmDataSource.prototype.getPort = function() {
	return this.port || this.getDefaultPort();
};

ZmDataSource.prototype.setFromJson = function(obj) {
	// data source fields
	for (var aname in ZmDataSource.DATASOURCE_ATTRS) {
		var avalue = obj[aname];
		if (avalue == null) continue;
		if (aname == "isEnabled" || aname == "leaveOnServer") {
			avalue = avalue == "1" || String(avalue).toLowerCase() == "true";
		}

		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		this[pname] = avalue;
	}

	// pseudo-identity fields
	var identity = this.getIdentity();
	for (var aname in ZmDataSource.IDENTITY_ATTRS) {
		var avalue = obj[aname];
		if (avalue == null) continue;
		if (aname == "useAddressForForwardReply") {
			avalue = avalue == "1" || String(avalue).toLowerCase() == "true";
		}

		var pname = ZmDataSource.IDENTITY_ATTRS[aname];
		identity[pname] = avalue;
	}
};

//
// Protected methods
//

ZmDataSource.prototype._loadFromDom = function(data) {
	this.setFromJson(data);
};

ZmDataSource.prototype._handleCreateResponse = function(callback, result) {
	var resp = result._data.CreateDataSourceResponse;
	this.id = resp[this.ELEMENT_NAME][0].id;
	delete this._new;
	delete this._dirty;

	this._appCtxt.getDataSourceCollection().add(this);

	if (callback) {
		callback.run();
	}
};

ZmDataSource.prototype._handleSaveResponse = function(callback, result) {
	delete this._dirty;

	var collection = this._appCtxt.getDataSourceCollection();
	// NOTE: By removing and adding it again, we make this proxy the
	//       base datasource object in the collection.
	collection.remove(this);
	collection.add(this);

	if (callback) {
		callback.run();
	}
};

ZmDataSource.prototype._handleDeleteResponse = function(callback, result) {
	this._appCtxt.getDataSourceCollection().remove(this);

	if (callback) {
		callback.run();
	}
};
