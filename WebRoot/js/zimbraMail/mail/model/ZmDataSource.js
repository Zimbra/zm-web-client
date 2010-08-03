/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * Creates a data source.
 * @class
 * This class represents a data source.
 * 
 * @param	{constant}	type	the account type (see <code>ZmAccount.TYPE_</code> constants)
 * @param	{String}	id		the id
 * 
 * @extends		ZmAccount
 */
ZmDataSource = function(type, id) {
	if (arguments.length == 0) { return; }
	ZmAccount.call(this, type, id);
	this.reset();
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
/**
 * Defines the "cleartext" connection type.
 */
ZmDataSource.CONNECT_CLEAR = "cleartext";
/**
 * Defines the "ssl" connection type.
 */
ZmDataSource.CONNECT_SSL = "ssl";
ZmDataSource.CONNECT_DEFAULT = ZmDataSource.CONNECT_CLEAR;

ZmDataSource.POLL_NEVER = "0";

// soap attribute to property maps

ZmDataSource.DATASOURCE_ATTRS = {
	// SOAP attr:		JS property
	"id":				"id",
	"name":				"name",
	"isEnabled":		"enabled",
	"emailAddress":		"email",
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
	// SOAP attr:					JS property
	"fromDisplay":					"sendFromDisplay",
	"fromAddress":					"sendFromAddress",
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
ZmDataSource.prototype.pollingInterval;

//
// Public methods
//

/** NOTE: Email is same as the identity's from address. */
ZmDataSource.prototype.setEmail =
function(email) {
	this.email = email;
};

ZmDataSource.prototype.getEmail =
function() {
	var email = this.email != null ? this.email : this.identity.getField(ZmIdentity.SEND_FROM_ADDRESS); // bug: 23042
	if (!email) { // bug: 38175
		var provider = ZmDataSource.getProviderForAccount(this);
		var host = (provider && provider._host) || this.mailServer;
		email = "";
        if (this.userName) {
            if (this.userName.match(/@/)) email = this.userName; // bug: 48186
            else if (host) email = [ this.userName, host].join("@");
        }
	}
	return email;
};

ZmDataSource.prototype.setFolderId =
function(folderId) {
	// TODO: Is there a better way to do this?
	//       I basically need to have the folder selector on the options
	//       page have a value of -1 but allow other code to see that and
	//       fill in the correct folder id. But I don't want it to
	//       overwrite that value once set.
	if (folderId == -1 && this.folderId != ZmOrganizer.ID_INBOX) { return; }
	this.folderId = folderId;
};

ZmDataSource.prototype.getFolderId =
function() {
	return this.folderId;
};

ZmDataSource.prototype.getIdentity =
function() {
	return this.identity;
};

// operations

ZmDataSource.prototype.create =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("CreateDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	for (var aname in ZmDataSource.DATASOURCE_ATTRS) {
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		var pvalue = pname == "folderId"
			? ZmOrganizer.normalizeId(this[pname])
			: this[pname];
		if (pname == "id" || (!pvalue && pname != "enabled" && pname != "leaveOnServer")) continue;

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
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback);
		batchCommand.setSensitive(Boolean(this.password));
		return;
	}

	var params = {
		soapDoc: soapDoc,
		sensitive: Boolean(this.password),
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return appCtxt.getAppController().sendRequest(params);
};

ZmDataSource.prototype.save =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("ModifyDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	// NOTE: If this object is a proxy, we guarantee that the
	//       the id attribute is *always* set.
	dsrc.setAttribute("id", this.id);
	for (var aname in ZmDataSource.DATASOURCE_ATTRS) {
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		if (!this.hasOwnProperty(pname)) continue;

		var avalue = pname == "folderId"
			? ZmOrganizer.normalizeId(this[pname])
			: this[pname];
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
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback);
		batchCommand.setSensitive(Boolean(this.password));
		return;
	}

	var params = {
		soapDoc: soapDoc,
		sensitive: Boolean(this.password),
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return appCtxt.getAppController().sendRequest(params);
};

ZmDataSource.prototype.doDelete =
function(callback, errorCallback, batchCommand) {
	var soapDoc = AjxSoapDoc.create("DeleteDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);
	dsrc.setAttribute("id", this.id);

	var respCallback = new AjxCallback(this, this._handleDeleteResponse, [callback]);
	if (batchCommand) {
		batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback);
		return;
	}

	var params = {
		soapDoc: soapDoc,
		asyncMode: Boolean(callback),
		callback: respCallback,
		errorCallback: errorCallback
	};
	return appCtxt.getAppController().sendRequest(params);
};

/**
 * Tests the data source connection.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{AjxCallback}		errorCallback		the error callback
 * @param	{ZmBatchCommand}		batchCommand		the batch command
 * @param	{Boolean}	noBusyOverlay		if <code>true</code>, do not show busy overlay
 * @return	{Object}	the response
 */
ZmDataSource.prototype.testConnection =
function(callback, errorCallback, batchCommand, noBusyOverlay) {
	var soapDoc = AjxSoapDoc.create("TestDataSourceRequest", "urn:zimbraMail");
	var dsrc = soapDoc.set(this.ELEMENT_NAME);

	var attrs = ["host", "port", "username", "password", "connectionType", "leaveOnServer"];
	for (var i = 0; i < attrs.length; i++) {
		var aname = attrs[i];
		var pname = ZmDataSource.DATASOURCE_ATTRS[aname];
		dsrc.setAttribute(aname, this[pname]);
	}

	if (batchCommand) {
		batchCommand.addNewRequestParams(soapDoc, callback, errorCallback);
		batchCommand.setSensitive(true);
		return;
	}

	var params = {
		soapDoc: soapDoc,
		sensitive: true,
		asyncMode: Boolean(callback),
		noBusyOverlay: noBusyOverlay,
		callback: callback,
		errorCallback: errorCallback
	};
	return appCtxt.getAppController().sendRequest(params);
};

/**
 * Gets the port.
 * 
 * @return	{int}	port
 */
ZmDataSource.prototype.getPort =
function() {
	return this.port || this.getDefaultPort();
};

ZmDataSource.prototype.isStatusOk = function() {
	return this.enabled && !this.failingSince;
};

ZmDataSource.prototype.setFromJson =
function(obj) {
	// errors
	if (obj.failingSince) {
		this.failingSince = obj.failingSince;
		this.lastError = (obj.lastError && obj.lastError[0]._content) || ZmMsg.unknownError;
	}
	else {
		delete this.failingSince;
		delete this.lastError;
	}
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
	this._setupIdentity();
};

ZmDataSource.prototype.reset = function() {
	// reset data source properties
	// NOTE: These have default values on the prototype object
	delete this.mailServer;
	delete this.userName;
	delete this.password;
	delete this.folderId;
	delete this.leaveOnServer;
	delete this.connectionType;
	delete this.pollingInterval;
	// other
	this.email = "";
	this.port = this.getDefaultPort();

	// reset identity
	var identity = this.identity = new ZmIdentity();
	identity.id = this.id;
	identity.isFromDataSource = true;
	// defensive programming
	identity.create = null;
	identity.save = null;
	identity.doDelete = null;
};

ZmDataSource.prototype.getProvider = function() {
	return ZmDataSource.getProviderForAccount(this);
};

//
// Public functions
//

// data source providers - provides default values

/**
 * Adds a data source provider. The registered providers are objects that
 * specify default values for data sources. This can be used to show the
 * user a list of known email providers (e.g. Yahoo! Mail) to pre-fill the
 * account information.
 *
 * @param {Hash}	provider  a hash of provider information
 * @param	{String}	provider.id		a unique identifier for this provider
 * @param	{String}	provider.name	the name of this provider to display to the user
 * @param	{String}	[provider.type]		the type (see <code>ZmAccount.TYPE_</code> constants)
 * @param	{String}	[provider.connectionType]	the connection type (see <code>ZmDataSource.CONNECT_</code> constants)
 * @param	{String}	[provider.host]	the server
 * @param	{String}	[provider.pollingInterval]		the polling interval
 * @param	{Boolean}	[provider.leaveOnServer]	if <code>true</code>, leave message on server (POP only)
 */
ZmDataSource.addProvider = function(provider) {
	var providers = ZmDataSource.getProviders();
	providers[provider.id] = provider;
	// normalize values -- defensive programming
	if (provider.type) {
		provider.type = provider.type.toLowerCase() == "pop" ? ZmAccount.TYPE_POP : ZmAccount.TYPE_IMAP;
	}
	else {
		provider.type = ZmAccount.TYPE_POP;
	}
	if (provider.connectionType) {
		var isSsl = provider.connectionType.toLowerCase() == "ssl";
		provider.connectionType =  isSsl ? ZmDataSource.CONNECT_SSL : ZmDataSource.CONNECT_CLEAR;
	}
	else {
		provider.connectionType = ZmDataSource.CONNECT_CLEAR;
	}
	if (!provider.port) {
		var isPop = provider.type == ZmAccount.TYPE_POP;
		if (isSsl) {
			provider.port = isPop ? ZmPopAccount.PORT_SSL : ZmImapAccount.PORT_SSL;
		}
		else {
			provider.port = isPop ? ZmPopAccount.PORT_CLEAR : ZmImapAccount.PORT_CLEAR;
		}
	}
};

/**
 * Gets the providers.
 * 
 * @return	{Array}		an array of providers
 */
ZmDataSource.getProviders =
function() {
	if (!ZmDataSource._providers) {
		ZmDataSource._providers = {};
	}
	return ZmDataSource._providers;
};

/**
 * Gets the provider.
 * 
 * @param	{ZmAccount}	account		the account
 * @return	{Hash}		the provider or <code>null</code> for none
 */
ZmDataSource.getProviderForAccount =
function(account) {
	return ZmDataSource.getProviderForHost(account.mailServer);
};

/**
 * Gets the provider.
 * 
 * @param	{String}	host		the host
 * @return	{Hash}		the provider or <code>null</code> for none
 */
ZmDataSource.getProviderForHost =
function(host) {
	var providers = ZmDataSource.getProviders();
	for (var id in providers) {
		hasProviders = true;
		var provider = providers[id];
		if (provider.host == host) {
			return provider;
		}
	}
	return null;
};

/**
 * Removes all providers.
 */
ZmDataSource.removeAllProviders = function() {
	delete ZmDataSource._providers;
};

//
// Protected methods
//


ZmDataSource.prototype._setupIdentity =
function() {
	this.identity.useWhenSentTo = true;
	this.identity.whenSentToAddresses = [ this.getEmail() ];
	this.identity.name = this.name;
};

ZmDataSource.prototype._loadFromDom =
function(data) {
	this.setFromJson(data);
};

ZmDataSource.prototype._handleCreateResponse =
function(callback, result) {
	var resp = result._data.CreateDataSourceResponse;
	this.id = resp[this.ELEMENT_NAME][0].id;
	this.identity.id = this.id;
	this._setupIdentity();
	delete this._new;
	delete this._dirty;

	appCtxt.getDataSourceCollection().add(this);

	var apps = [ZmApp.MAIL, ZmApp.PORTAL];
	for (var i=0; i<apps.length; i++) {
		var app = appCtxt.getApp(apps[i]);
		if (app) {
			var overviewId = app.getOverviewId();
			var treeView = appCtxt.getOverviewController().getTreeView(overviewId, ZmOrganizer.FOLDER);
			var fid = appCtxt.getActiveAccount().isMain ? this.folderId : ZmOrganizer.getSystemId(this.folderId);
			var treeItem = treeView ? treeView.getTreeItemById(fid) : null;
			if (treeItem) {
				// reset the icon in the tree view if POP account since the first time it
				// was created, we didnt know it was a data source
				if (this.type == ZmAccount.TYPE_POP && this.folderId != ZmFolder.ID_INBOX) {
					treeItem.setImage("POPAccount");
				}
				else if (this.type == ZmAccount.TYPE_IMAP) {
					// change imap folder to a tree header since folder is first created
					// without knowing its a datasource
					treeItem.dispose();
					var rootId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ROOT);
					var parentNode = treeView.getTreeItemById(rootId);
					var organizer = appCtxt.getById(this.folderId);
					treeView._addNew(parentNode, organizer);
				}
			}
		}
	}

	if (callback) {
		callback.run();
	}
};

ZmDataSource.prototype._handleSaveResponse =
function(callback, result) {
	delete this._dirty;

	var collection = appCtxt.getDataSourceCollection();
	// NOTE: By removing and adding it again, we make this proxy the
	//       base datasource object in the collection.
	collection.remove(this);
	collection.add(this);

	if (callback) {
		callback.run();
	}
};

ZmDataSource.prototype._handleDeleteResponse =
function(callback, result) {
	appCtxt.getDataSourceCollection().remove(this);

	var overviewId = appCtxt.getApp(ZmApp.MAIL).getOverviewId();
	var treeView = appCtxt.getOverviewController().getTreeView(overviewId, ZmOrganizer.FOLDER);
	var fid = appCtxt.getActiveAccount().isMain ? this.folderId : ZmOrganizer.getSystemId(this.folderId);
	if(this.folderId == ZmAccountsPage.DOWNLOAD_TO_FOLDER && this._object_ && this._object_.folderId) {
		fid = this._object_.folderId;
	}	
	var treeItem = treeView ? treeView.getTreeItemById(fid) : null;
	if (treeItem) {
		if (this.type == ZmAccount.TYPE_POP && this.folderId != ZmFolder.ID_INBOX) {
			// reset icon since POP folder is no longer hooked up to a datasource
			treeItem.setImage("Folder");
		} else if (this.type == ZmAccount.TYPE_IMAP) {
			// reset the icon in the tree view if POP account since the first time it
			// was created, we didnt know it was a data source
			treeItem.dispose();
			var parentNode = treeView.getTreeItemById(ZmOrganizer.ID_ROOT);
			var organizer = appCtxt.getById(fid);
			if (organizer) {
				treeView._addNew(parentNode, organizer);
			}
		}
	}

	if (callback) {
		callback.run();
	}
};
