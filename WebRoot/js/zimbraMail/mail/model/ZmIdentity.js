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
ZmIdentity = function(name) {
	this.name = name;
};

ZmIdentity.prototype.toString = function() {
	return "ZmIdentity";
};

//
// Constants
//

ZmIdentity.COMPOSE_SAME = "same";
ZmIdentity.COMPOSE_TEXT = "text";
ZmIdentity.COMPOSE_HTML = "html";

ZmIdentity.STRING = 1;
ZmIdentity.ARRAY = 2;
ZmIdentity.BOOLEAN = 3;

ZmIdentity.DEFAULT_NAME = "DEFAULT";

var i = 0;
ZmIdentity.NAME = i++;
ZmIdentity.SEND_FROM_DISPLAY = i++;
ZmIdentity.SEND_FROM_ADDRESS = i++;
ZmIdentity.SET_REPLY_TO = i++;
ZmIdentity.SET_REPLY_TO_DISPLAY = i++;
ZmIdentity.SET_REPLY_TO_ADDRESS = i++;
ZmIdentity.SIGNATURE = i++;
ZmIdentity.USE_WHEN_SENT_TO = i++;
ZmIdentity.WHEN_SENT_TO_ADDRESSES = i++;
ZmIdentity.USE_WHEN_IN_FOLDER = i++;
ZmIdentity.WHEN_IN_FOLDERIDS = i++;
ZmIdentity.IS_DEFAULT = i++;
delete i;

ZmIdentity.FIELDS = {};
ZmIdentity._SOAP = {};

//
// Static inititialization
//

ZmIdentity.addField = function(fieldId, field) {
	ZmIdentity.FIELDS[fieldId] = field;
	ZmIdentity._SOAP[field.soap] = field;
};

ZmIdentity.addField(ZmIdentity.NAME, { name: "name", soap: "zimbraPrefIdentityName", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SEND_FROM_DISPLAY, { name: "sendFromDisplay", soap: "zimbraPrefFromDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SEND_FROM_ADDRESS, { name: "sendFromAddress", soap: "zimbraPrefFromAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO, { name: "setReplyTo", soap: "zimbraPrefReplyToEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_DISPLAY, { name: "setReplyToDisplay", soap: "zimbraPrefReplyToDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_ADDRESS, { name: "setReplyToAddress", soap: "zimbraPrefReplyToAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SIGNATURE, { name: "signature", soap: "zimbraPrefDefaultSignatureId", type: ZmIdentity.STRING });
// Used only for Persona
ZmIdentity.addField(ZmIdentity.USE_WHEN_SENT_TO, { name: "useWhenSentTo", soap: "zimbraPrefWhenSentToEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_SENT_TO_ADDRESSES, { name: "whenSentToAddresses", soap: "zimbraPrefWhenSentToAddresses", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_WHEN_IN_FOLDER, { name: "useWhenInFolder", soap: "zimbraPrefWhenInFoldersEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_IN_FOLDERIDS, { name: "whenInFolderIds", soap: "zimbraPrefWhenInFolderIds", type: ZmIdentity.ARRAY });

//
// Data
//

// field defaults

ZmIdentity.prototype.id = "";
ZmIdentity.prototype.sendFromDisplay = "";
ZmIdentity.prototype.sendFromAddress = "";
ZmIdentity.prototype.setReplyTo = false;
ZmIdentity.prototype.setReplyToDisplay = "";
ZmIdentity.prototype.setReplyToAddress = "";
ZmIdentity.prototype.signature = "";
ZmIdentity.prototype.useWhenSentTo = false;
ZmIdentity.prototype.whenSentToAddresses = [];
ZmIdentity.prototype.useWhenInFolder = false;
ZmIdentity.prototype.whenInFolderIds = [];
ZmIdentity.prototype.isFromDataSource = false;

//
// Public methods
//

// fields

ZmIdentity.prototype.getField =
function(fieldId) {
	return this[ZmIdentity.FIELDS[fieldId].name];
};

ZmIdentity.prototype.setField =
function(fieldId, value) {
	this[ZmIdentity.FIELDS[fieldId].name] = value;
};

// requests

ZmIdentity.prototype.create = function(callback, errorCallback, batchCmd) {
	return this._doRequest("Create", this._handleCreateResponse, callback, errorCallback, batchCmd);
};

ZmIdentity.prototype.save = function(callback, errorCallback, batchCmd) {
	return this._doRequest("Modify", this._handleSaveResponse, callback, errorCallback, batchCmd);
};

ZmIdentity.prototype.doDelete = function(callback, errorCallback, batchCmd) {
	return this._doRequest("Delete", this._handleDeleteResponse, callback, errorCallback, batchCmd);
};

// TODO: remove these obsolete methods once compose is fixed to use account settings

ZmIdentity.prototype.getUseWhenSentTo = function() {
	return this.useWhenSentTo;
};

ZmIdentity.prototype.getComposeSameFormat = function() {
	return appCtxt.get(ZmSetting.COMPOSE_SAME_FORMAT);
};

ZmIdentity.prototype.getComposeAsFormat = function() {
	return appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT);
};

ZmIdentity.prototype.getPrefix = function() {
	return appCtxt.get(ZmSetting.REPLY_PREFIX);
};

ZmIdentity.prototype.getForwardOption = function() {
	return appCtxt.get(ZmSetting.FORWARD_INCLUDE_ORIG);
};

ZmIdentity.prototype.getReplyOption = function() {
	return appCtxt.get(ZmSetting.REPLY_INCLUDE_ORIG);
};

ZmIdentity.prototype.getSignatureStyle = function() {
	return appCtxt.get(ZmSetting.SIGNATURE_STYLE);
};

ZmIdentity.prototype.getAdvancedIdentity = function() {
	return this.isDefault ? this : appCtxt.getIdentityCollection().defaultIdentity;
};

ZmIdentity.prototype.setAllDefaultAdvancedFields = function() {
	// NOP
};

//
// Protected methods
//

ZmIdentity.prototype._doRequest =
function(requestType, respFunction, callback, errorCallback, batchCmd) {
	var soapDoc = AjxSoapDoc.create(requestType+"IdentityRequest", "urn:zimbraAccount");
	var identityNode = soapDoc.set("identity");

	var name = this.isDefault ? ZmIdentity.DEFAULT_NAME : this.name;
	if (requestType != "Create") {
		identityNode.setAttribute("id", this.id);
	}
	else {
		identityNode.setAttribute("name", this.name);
	}
	if (requestType != "Delete") {
		for (var i in ZmIdentity.FIELDS) {
			var field = ZmIdentity.FIELDS[i];
			if (this.hasOwnProperty(field.name)) {
				var value = this.getField(i);
				if (field.type == ZmIdentity.ARRAY) {
					for (var j = 0, count = value.length; j < count; j++) {
						if (value[j]) {
							var propertyNode = soapDoc.set("a", value[j], identityNode);
							propertyNode.setAttribute("name", field.soap);
						}
					}
				} else {
					if (field.type == ZmIdentity.BOOLEAN) {
						value = value ? "TRUE" : "FALSE";
					}
					if (value || (i == ZmIdentity.SIGNATURE)) {
						var propertyNode = soapDoc.set("a", value, identityNode);
						propertyNode.setAttribute("name", field.soap);
					}
				}
			}
		}
	}

	var respCallback = new AjxCallback(this, respFunction, [callback]);
	if (batchCmd) {
		batchCmd.addNewRequestParams(soapDoc, respCallback, errorCallback);
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

ZmIdentity.prototype._loadFromDom =
function(data) {

	this.id = data.id;

    var props = data._attrs;
	if (props) {
		for (var i in props) {
			var field = ZmIdentity._SOAP[i];
			if (field) {
				var value = props[i];
				if (field.type == ZmIdentity.BOOLEAN) {
					this[field.name] = (value.toString().toUpperCase() == "TRUE");
				}
				else if (field.type == ZmIdentity.ARRAY) {
					this[field.name] = AjxUtil.isArray(value) ? value : [value];
				}
				else {
					this[field.name] = value;
				}
			}
		}
	}

    if (data.name) {
		if (data.name == ZmIdentity.DEFAULT_NAME) {
			this.isDefault = true;
            this.name = ZmMsg.defaultIdentityName;
        }
	}
};

ZmIdentity.prototype._handleCreateResponse = function(callback, result, response) {
	this.id = response.identity[0].id;
	delete this._new;
	delete this._dirty;

	var collection = appCtxt.getIdentityCollection();
	collection.add(this);

	if (callback) {
		callback.run(this, result);
	}
};

ZmIdentity.prototype._handleSaveResponse = function(callback, result, response) {
	delete this._dirty;

	var collection = appCtxt.getIdentityCollection();
	collection.remove(this);
	collection.add(this);

	// TODO: Is this necessary?
	var rename = this.hasOwnProperty("name");
	collection.notifyModify(this, rename);

	if (callback) {
		callback.run(this, result);
	}
};

ZmIdentity.prototype._handleDeleteResponse = function(callback, result, response) {
	var collection = appCtxt.getIdentityCollection();
	collection.remove(this);

	if (callback) {
		callback.run(this, result);
	}
};