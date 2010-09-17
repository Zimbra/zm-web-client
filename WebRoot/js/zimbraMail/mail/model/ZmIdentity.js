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
 * Creates an identity.
 * @class
 * This class represents an identity.
 * 
 * @param	{String}	name		the identity name
 * 
 */
ZmIdentity = function(name) {
	this.name = name;
	this.id = "";
	this.sendFromDisplay = "";
	this.sendFromAddress = "";
	this.setReplyTo = false;
	this.setReplyToDisplay = "";
	this.setReplyToAddress = "";
	this.readReceiptAddr = "";
	this.signature = "";
	this.useWhenSentTo = false;
	this.whenSentToAddresses = [];
	this.useWhenInFolder = false;
	this.whenInFolderIds = [];
	this.isFromDataSource = false;
};

ZmIdentity.prototype.toString =
function() {
	return "ZmIdentity";
};


// Constants

ZmIdentity.COMPOSE_SAME				= "same";
ZmIdentity.COMPOSE_TEXT 			= "text";
ZmIdentity.COMPOSE_HTML 			= "html";
ZmIdentity.STRING					= 1;
ZmIdentity.ARRAY					= 2;
ZmIdentity.BOOLEAN					= 3;
ZmIdentity.DEFAULT_NAME 			= "DEFAULT";

var i = 0;
/**
 * Defines the "name" field id.
 */
ZmIdentity.NAME 					= i++;
/**
 * Defines the "send from display" field id.
 */
ZmIdentity.SEND_FROM_DISPLAY		= i++;
/**
 * Defines the "send from address" field id.
 */
ZmIdentity.SEND_FROM_ADDRESS		= i++;
/**
 * Defines the "set reply to" field id.
 */
ZmIdentity.SET_REPLY_TO				= i++;
/**
 * Defines the "set reply to display" field id.
 */
ZmIdentity.SET_REPLY_TO_DISPLAY		= i++;
/**
 * Defines the "set reply to address" field id.
 */
ZmIdentity.SET_REPLY_TO_ADDRESS		= i++;
/**
 * Defines the "signature" field id.
 */
ZmIdentity.SIGNATURE				= i++;
/**
 * Defines the "reply signature" field id.
 */
ZmIdentity.REPLY_SIGNATURE			= i++;
/**
 * Defines the "use when sent to" field id.
 */
ZmIdentity.USE_WHEN_SENT_TO			= i++;
/**
 * Defines the "when sent to addresses" field id.
 */
ZmIdentity.WHEN_SENT_TO_ADDRESSES	= i++;
/**
 * Defines the "use when in folder" field id.
 */
ZmIdentity.USE_WHEN_IN_FOLDER		= i++;
/**
 * Defines the "when in folder ids" field id.
 */
ZmIdentity.WHEN_IN_FOLDERIDS		= i++;
/**
 * Defines the "is default" field id.
 */
ZmIdentity.IS_DEFAULT				= i++;
delete i;

ZmIdentity.FIELDS = {};
ZmIdentity._SOAP = {};


// Static inititialization

ZmIdentity.addField =
function(fieldId, field) {
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
ZmIdentity.addField(ZmIdentity.REPLY_SIGNATURE, { name: "replySignature", soap: "zimbraPrefForwardReplySignatureId", type: ZmIdentity.STRING });

// Used only for Persona
ZmIdentity.addField(ZmIdentity.USE_WHEN_SENT_TO, { name: "useWhenSentTo", soap: "zimbraPrefWhenSentToEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_SENT_TO_ADDRESSES, { name: "whenSentToAddresses", soap: "zimbraPrefWhenSentToAddresses", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_WHEN_IN_FOLDER, { name: "useWhenInFolder", soap: "zimbraPrefWhenInFoldersEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_IN_FOLDERIDS, { name: "whenInFolderIds", soap: "zimbraPrefWhenInFolderIds", type: ZmIdentity.ARRAY });


// Public methods

/**
 * Gets the field.
 * 
 * @param	{constant}	fieldId		the id
 * @return	{Object}	the value
 */
ZmIdentity.prototype.getField =
function(fieldId) {
	return this[ZmIdentity.FIELDS[fieldId].name];
};

/**
 * Sets the field.
 * 
 * @param	{constant}	fieldId		the id
 * @param	{Object}	value		the value
 */
ZmIdentity.prototype.setField =
function(fieldId, value) {
	this[ZmIdentity.FIELDS[fieldId].name] = value;
};

/**
 * Creates the identity.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{AjxCallback}		errorCallback		the error callback
 * @param	{ZmBatchCommand}		batchCmd		the batch command
 */
ZmIdentity.prototype.create =
function(callback, errorCallback, batchCmd) {
	return this._doRequest("Create", this._handleCreateResponse, callback, errorCallback, batchCmd);
};

/**
 * Saves the identity.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{AjxCallback}		errorCallback		the error callback
 * @param	{ZmBatchCommand}		batchCmd		the batch command
 */
ZmIdentity.prototype.save =
function(callback, errorCallback, batchCmd) {
	return this._doRequest("Modify", this._handleSaveResponse, callback, errorCallback, batchCmd);
};

/**
 * Deletes the identity.
 * 
 * @param	{AjxCallback}		callback		the callback
 * @param	{AjxCallback}		errorCallback		the error callback
 * @param	{ZmBatchCommand}		batchCmd		the batch command
 */
ZmIdentity.prototype.doDelete =
function(callback, errorCallback, batchCmd) {
	return this._doRequest("Delete", this._handleDeleteResponse, callback, errorCallback, batchCmd);
};


// Protected methods

ZmIdentity.prototype._doRequest =
function(requestType, respFunction, callback, errorCallback, batchCmd) {

	var soapDoc = AjxSoapDoc.create(requestType + "IdentityRequest", "urn:zimbraAccount");
	var identityNode = soapDoc.set("identity");

	var name = this.isDefault ? ZmIdentity.DEFAULT_NAME : this.name;
	if (requestType != "Create" && this.id !== "") {
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
					var isSignature = i == ZmIdentity.SIGNATURE;
					var isDisplayName = i == ZmIdentity.SEND_FROM_DISPLAY || i == ZmIdentity.SET_REPLY_TO_DISPLAY;
					if (value || isSignature || isDisplayName) {
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

ZmIdentity.prototype._handleCreateResponse =
function(callback, result, response) {
	this.id = response.identity[0].id;
	delete this._new;
	delete this._dirty;

	appCtxt.getIdentityCollection().add(this);

	if (callback) {
		callback.run(this, result);
	}
};

ZmIdentity.prototype._handleSaveResponse =
function(callback, result, response) {
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

ZmIdentity.prototype._handleDeleteResponse =
function(callback, result, response) {
	appCtxt.getIdentityCollection().remove(this);

	if (callback) {
		callback.run(this, result);
	}
};
