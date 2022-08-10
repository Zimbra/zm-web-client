/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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

	this.reset();
	this.name = name;
	this.id = "";
};

ZmIdentity.prototype.toString =
function() {
	return "ZmIdentity";
};


// Constants

ZmIdentity.COMPOSE_SAME				= "same";
ZmIdentity.COMPOSE_TEXT 			= "text";
ZmIdentity.COMPOSE_HTML 			= "html";
ZmIdentity.DEFAULT_NAME 			= "DEFAULT";


ZmIdentity.FIELDS	= {};
ZmIdentity._SOAP	= {};

ZmIdentity.SIG_ID_NONE = "11111111-1111-1111-1111-111111111111";

// Static inititialization

ZmIdentity.addField =
function(id, params) {

	ZmIdentity[id] = id;
	ZmIdentity.FIELDS[id] = params;
	ZmIdentity._SOAP[params.soap] = params;
};

// Identity fields. The "name" parameter is used to set a property on this object.

ZmIdentity.addField("NAME",						{ name: "name", soap: "zimbraPrefIdentityName", type: ZmSetting.D_STRING });
ZmIdentity.addField("SEND_FROM_DISPLAY",		{ name: "sendFromDisplay", soap: "zimbraPrefFromDisplay", type: ZmSetting.D_STRING });
ZmIdentity.addField("SEND_FROM_ADDRESS",		{ name: "sendFromAddress", soap: "zimbraPrefFromAddress", type: ZmSetting.D_STRING });
ZmIdentity.addField("SEND_FROM_ADDRESS_TYPE",	{ name: "sendFromAddressType", soap: "zimbraPrefFromAddressType", type: ZmSetting.D_STRING });
ZmIdentity.addField("SET_REPLY_TO",				{ name: "setReplyTo", soap: "zimbraPrefReplyToEnabled", type: ZmSetting.D_BOOLEAN });
ZmIdentity.addField("SET_REPLY_TO_DISPLAY",		{ name: "setReplyToDisplay", soap: "zimbraPrefReplyToDisplay", type: ZmSetting.D_STRING });
ZmIdentity.addField("SET_REPLY_TO_ADDRESS",		{ name: "setReplyToAddress", soap: "zimbraPrefReplyToAddress", type: ZmSetting.D_STRING });
ZmIdentity.addField("SIGNATURE",				{ name: "signature", soap: "zimbraPrefDefaultSignatureId", type: ZmSetting.D_STRING });
ZmIdentity.addField("REPLY_SIGNATURE",			{ name: "replySignature", soap: "zimbraPrefForwardReplySignatureId", type: ZmSetting.D_STRING });

// Used only for Persona
ZmIdentity.addField("USE_WHEN_SENT_TO",			{ name: "useWhenSentTo", soap: "zimbraPrefWhenSentToEnabled", type: ZmSetting.D_BOOLEAN });
ZmIdentity.addField("WHEN_SENT_TO_ADDRESSES",	{ name: "whenSentToAddresses", soap: "zimbraPrefWhenSentToAddresses", type: ZmSetting.D_LIST });
ZmIdentity.addField("USE_WHEN_IN_FOLDER",		{ name: "useWhenInFolder", soap: "zimbraPrefWhenInFoldersEnabled", type: ZmSetting.D_BOOLEAN });
ZmIdentity.addField("WHEN_IN_FOLDERIDS",		{ name: "whenInFolderIds", soap: "zimbraPrefWhenInFolderIds", type: ZmSetting.D_LIST });


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

/**
 * Clears this identity's fields.
 */
ZmIdentity.prototype.reset =
function() {
	for (var field in ZmIdentity.FIELDS) {
		var props = ZmIdentity.FIELDS[field];
		switch (props.type) {
			case ZmSetting.D_STRING:	this[props.name] = "";		break;
			case ZmSetting.D_BOOLEAN:	this[props.name] = false;	break;
			case ZmSetting.D_LIST:		this[props.name] = [];		break;
		}
	}
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
				if (field.type == ZmSetting.D_LIST) {
					for (var j = 0, count = value.length; j < count; j++) {
						if (value[j]) {
							var propertyNode = soapDoc.set("a", value[j], identityNode);
							propertyNode.setAttribute("name", field.soap);
						}
					}
				} else {
					if (field.type == ZmSetting.D_BOOLEAN) {
						value = value ? "TRUE" : "FALSE";
					}
					var isSignature = (i == ZmIdentity.SIGNATURE || i == ZmIdentity.REPLY_SIGNATURE);
					var isDisplayName = (i == ZmIdentity.SEND_FROM_DISPLAY || i == ZmIdentity.SET_REPLY_TO_DISPLAY);
					var isEmailAddress = (i == ZmIdentity.SET_REPLY_TO_ADDRESS);
					if (value || isSignature || isDisplayName || isEmailAddress) {
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
				if (field.type == ZmSetting.D_BOOLEAN) {
					this[field.name] = (value.toString().toUpperCase() == "TRUE");
				}
				else if (field.type == ZmSetting.D_LIST) {
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
        }
	}
};

ZmIdentity.prototype._handleCreateResponse =
function(callback, result, response) {

	this.id = response.identity[0].id;
	delete this._new;
	delete this._dirty;

	var collection = appCtxt.getIdentityCollection();
	collection.add(this);
	collection._notify(ZmEvent.E_CREATE, { item: this } );

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
	collection._notify(ZmEvent.E_MODIFY, { item: this } );

	if (callback) {
		callback.run(this, result);
	}
};

ZmIdentity.prototype._handleDeleteResponse =
function(callback, result, response) {

	var collection = appCtxt.getIdentityCollection();
	collection.remove(this);
	collection._notify(ZmEvent.E_DELETE, { item: this } );

	if (callback) {
		callback.run(this, result);
	}
};
