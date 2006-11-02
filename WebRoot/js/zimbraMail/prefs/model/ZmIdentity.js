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
function ZmIdentity(appCtxt, name) {
	if (arguments.length == 0) return;
	
	this._appCtxt = appCtxt;
	this.name = name;
	this.id = "";

	this.sendFromDisplay = "";
	this.sendFromAddress = "";
	this.setReplyTo = false;
	this.setReplyToDisplay = "";
	this.setReplyToAddress = "";
	this.signature = "";
	this.useWhenSentTo = false;
	this.whenSentToAddresses = [];
	this.useWhenInFolder = false;
	this.whenInFolderIds = [];
	
	this.useDefaultAdvanced = true;
	
	this.composeFormat = ZmIdentity.COMPOSE_TEXT;
	this.prefix = ">";
	this.forwardOption = ZmSetting.INCLUDE_PREFIX;
	this.replyOption = ZmSetting.INCLUDE_PREFIX;
	this.signatureStyle = ZmSetting.SIG_INTERNET;
};

ZmIdentity.COMPOSE_SAME = "same";
ZmIdentity.COMPOSE_TEXT = "text";
ZmIdentity.COMPOSE_HTML = "html";

ZmIdentity.STRING = 1;
ZmIdentity.ARRAY = 2;
ZmIdentity.BOOLEAN = 3;

var i = 0;
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
ZmIdentity.USE_DEFAULT_ADVANCED = i++;
ZmIdentity.COMPOSE_FORMAT = i++;
ZmIdentity.PREFIX = i++;
ZmIdentity.FORWARD_OPTION = i++;
ZmIdentity.REPLY_OPTION = i++;
ZmIdentity.SIGNATURE_STYLE = i++;
ZmIdentity.IS_DEFAULT = i++;
delete i;

ZmIdentity.FIELDS = {};
ZmIdentity._SOAP = {};
ZmIdentity.addField =

function(fieldId, field) {
	ZmIdentity.FIELDS[fieldId] = field;
	ZmIdentity._SOAP[field.soap] = field;
};

ZmIdentity.addField(ZmIdentity.SEND_FROM_DISPLAY, { name: "sendFromDisplay", node: "a", soap: "zimbraPrefFromDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SEND_FROM_ADDRESS, { name: "sendFromAddress", node: "a", soap: "zimbraPrefFromAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO, { name: "setReplyTo", node: "a", soap: "zimbraPrefReplyToEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_DISPLAY, { name: "setReplyToDisplay", node: "a", soap: "zimbraPrefReplyToDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_ADDRESS, { name: "setReplyToAddress", node: "a", soap: "zimbraPrefReplyToAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SIGNATURE, { name: "signature", node: "a", soap: "zimbraPrefMailSignature", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.USE_WHEN_SENT_TO, { name: "useWhenSentTo", node: "a", soap: "zimbraPrefWhenSentToEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_SENT_TO_ADDRESSES, { name: "whenSentToAddresses", node: "a", soap: "zimbraPrefWhenSentToAddresses", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_WHEN_IN_FOLDER, { name: "useWhenInFolder", node: "a", soap: "zimbraPrefWhenInFoldersEnabled", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_IN_FOLDERIDS, { name: "whenInFolderIds", node: "a", soap: "zimbraPrefWhenInFolderIds", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_DEFAULT_ADVANCED, { name: "useDefaultAdvanced", node: "a", soap: "zimbraPrefUseDefaultIdentitySettings", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.COMPOSE_FORMAT, { name: "composeFormat", node: "a", soap: "zimbraPrefForwardReplyInOriginalFormat", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.PREFIX, { name: "prefix", node: "a", soap: "zimbraPrefForwardReplyPrefixChar", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.FORWARD_OPTION, { name: "forwardOption", node: "a", soap: "zimbraPrefForwardIncludeOriginalText", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.REPLY_OPTION, { name: "replyOption", node: "a", soap: "zimbraPrefReplyIncludeOriginalText", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SIGNATURE_STYLE, { name: "signatureStyle", node: "a", soap: "zimbraPrefMailSignatureStyle", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.IS_DEFAULT, { name: "isDefault", node: "a", soap: "zimbraPrefDefaultIdentity", type: ZmIdentity.BOOLEAN });

ZmIdentity.prototype.getField =
function(fieldId) {
	return this[ZmIdentity.FIELDS[fieldId].name];
};

ZmIdentity.prototype.setField =
function(fieldId, value) {
	this[ZmIdentity.FIELDS[fieldId].name] = value;
};

ZmIdentity.prototype._loadFromDom =
function(data) {
	if (data.name) this.name = data.name;
	var props = data.a;
	if (props) {
		for (var i = 0, count = props.length; i < count; i++) {
			var name = props[i].name;
			var field = ZmIdentity._SOAP[name];
			if (field) {
				var value = props[i]._content;
				if (field.type == ZmIdentity.BOOLEAN) {
					this[field.name] = (value.toString().toLowerCase() == "true");
				} else if (field.type == ZmIdentity.ARRAY) {
					this[field.name].push(value);
				} else {
					this[field.name] = value;
				}
			}
		}
	}
};

ZmIdentity.prototype.createRequest =
function(request, batchCommand) {
    var soapDoc = AjxSoapDoc.create(request, "urn:zimbraMail");
    var identityNode = soapDoc.set("identity");
    var name = this._object_ ? this._object_.name : this.name; 
    identityNode.setAttribute("name", name);
    if (request != "DeleteIdentityRequest") {
		if (this.hasOwnProperty("name")) {
			var propertyNode = soapDoc.set("a", this.name, identityNode);
			propertyNode.setAttribute("name", "name");
		}

		for (var i in ZmIdentity.FIELDS) {
			var field = ZmIdentity.FIELDS[i];
			if (this.hasOwnProperty(field.name)) {
				var value = this.getField(i);
				if (field.type == ZmIdentity.ARRAY) {
					for (var j = 0, count = value.length; j < count; j++) {
						var propertyNode = soapDoc.set(field.node, value[j], identityNode);
						propertyNode.setAttribute("name", field.soap);
					}
				} else {
					var propertyNode = soapDoc.set(field.node, value, identityNode);
					propertyNode.setAttribute("name", field.soap);
				}
			}
		}		
    }
	var respCallback = new AjxCallback(this, this._handleAction, [request]);
	var errorCallback = new AjxCallback(this, this._handleErrorAction, [request]);
	batchCommand.addNewRequestParams(soapDoc, respCallback, errorCallback, request);
};

ZmIdentity.prototype._handleAction =
function(request, result) {
	var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
	if (request == "ModifyIdentityRequest") {
		var identity = identityCollection.getById(this.id);
		identityCollection._removeFromMaps(identity);
		var rename = false;
		if (this.hasOwnProperty("name")) {
			identity.name = this.name;
			rename = true;
		}
		for (var i in ZmIdentity.FIELDS) {
			var field = ZmIdentity.FIELDS[i];
			if (this.hasOwnProperty(field.name)) {
				var value = this.getField(i);
				identity.setField(i, value);
			}
		}
		identityCollection._addToMaps(identity);
		identityCollection._notify(ZmEvent.E_MODIFY, { item: identity, rename: rename } );
	} else if (request == "CreateIdentityRequest") {
		identityCollection.add(this);
	} else if (request == "DeleteIdentityRequest") {
		identityCollection.remove(this);
	}
};

ZmIdentity.prototype._handleErrorAction =
function() {
//	debugger;
};


ZmIdentity.prototype.toString =
function() {
	return "ZmIdentity";
};

ZmIdentity.prototype.getUseWhenSentTo =
function() {
	return this.useWhenSentTo;
};

ZmIdentity.prototype.getComposeSameFormat =
function() {
	var format = this._getAdvancedIdentity().composeFormat;
	return format == ZmIdentity.COMPOSE_SAME ? true : false;
};
ZmIdentity.prototype.getComposeAsFormat =
function() {
	var format = this._getAdvancedIdentity().composeFormat;
	return format == ZmIdentity.COMPOSE_HTML ? ZmSetting.COMPOSE_HTML : ZmSetting.COMPOSE_TEXT;
};
ZmIdentity.prototype.getPrefix =
function() {
	return this._getAdvancedIdentity().prefix;
};
ZmIdentity.prototype.getForwardOption =
function() {
	return this._getAdvancedIdentity().forwardOption;
};
ZmIdentity.prototype.getReplyOption =
function() {
	return this._getAdvancedIdentity().replyOption;
};

// ZmSetting.SIG_OUTLOOK: signature above quoted text.
ZmIdentity.prototype.getSignatureStyle =
function() {
	return this.signatureStyle;
};

// Returns the identity that owns the advanced options for this identity
// (If the Use Settings From Default) is checked, then this returns the
// default identity, otherwise it returns this.
ZmIdentity.prototype._getAdvancedIdentity =
function() {
	if (this.useDefaultAdvanced) {
		var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
		return identityCollection.defaultIdentity;
	} else {
		return this;
	}
};


function ZmIdentityCollection(appCtxt) {
	ZmModel.call(this, ZmEvent.S_IDENTITY);
	this._appCtxt = appCtxt;
	this._nextId = 1;
	this.defaultIdentity = null;
	this._idToIdentity = {};
	this._addressToIdentity = {};
	this._folderToIdentity = {};
};

ZmIdentityCollection.prototype = new ZmModel;
ZmIdentityCollection.prototype.constructor = ZmIdentityCollection;

ZmIdentityCollection.prototype.getIdentities =
function(includeFakeDefault) {
	if (!includeFakeDefault && this._hasFakeDefault) {
		return [];
	}
	var i = 0;
	var result = [];
	for (var id in this._idToIdentity) {
		result[i++] = this._idToIdentity[id];
	}
	return result;
};

ZmIdentityCollection.prototype.getById =
function(id) {
	return this._idToIdentity[id];
};

ZmIdentityCollection.prototype.add =
function(identity) {
	if (identity.isDefault && this._hasFakeDefault) {
		this.remove(this.defaultIdentity);
		this.defaultIdentity = null;
		this._hasFakeDefault = false;
	}

	identity.id = this._nextId++;
	this._idToIdentity[identity.id] = identity;
	if (identity.isDefault || !this.defaultIdentity) {
		this.defaultIdentity = identity;
	}

	this._addToMaps(identity);	
	this._notify(ZmEvent.E_CREATE, { item: identity } );
};

ZmIdentityCollection.prototype.remove =
function(identity) {
	this._removeFromMaps(identity);
	delete this._idToIdentity[identity.id];
	this._notify(ZmEvent.E_DELETE, { item: identity } );
};

ZmIdentityCollection.prototype._addToMaps =
function(identity) {
	if (identity.useWhenSentTo) {
		var addresses = identity.whenSentToAddresses;
		for (var i = 0, count = addresses.length; i < count; i++) {
			var address = addresses[i].toLowerCase();
			this._addressToIdentity[address] = identity;
		}
	}

	if (identity.useWhenInFolder) {
		var folders = identity.whenInFolderIds;
		for (var i = 0, count = folders.length; i < count; i++) {
			this._folderToIdentity[folders[i]] = identity;
		}
	}
};

ZmIdentityCollection.prototype._removeFromMaps =
function(identity) {
	for (var i = 0, count = identity.whenSentToAddresses.length; i < count; i++) {
		var address = identity.whenSentToAddresses[i];
		delete this._addressToIdentity[address];
	}

	for (var i = 0, count = identity.whenInFolderIds.length; i < count; i++) {
		var folderId = identity.whenInFolderIds[i];
		delete this._folderToIdentity[folderId];
	}
};

ZmIdentityCollection.prototype.selectIdentity =
function(mailMsg) {
	if (!mailMsg) {
		return this.defaultIdentity;
	}

	// Check if the a identity's address was in the to field.
	var identity = this._selectIdentityFromAddresses(mailMsg, ZmEmailAddress.TO);
	if (identity) {
		return identity;
	}

	// Check if the a identity's address was in the cc field.
	identity = this._selectIdentityFromAddresses(mailMsg, ZmEmailAddress.CC);
	if (identity) {
		return identity;
	}
	
	// Check if a identity's folder is the same as where the message lives.
	var folder = mailMsg.folderId;
	identity = this._folderToIdentity[folder];
	if(identity) {
		return identity;
	}
	
	return this.defaultIdentity;
};


ZmIdentityCollection.prototype._selectIdentityFromAddresses =
function(mailMsg, type) {
	var identity;
	var addresses = mailMsg.getAddresses(type).getArray();
	for (var i = 0, count = addresses.length; i < count; i++) {
		var address = addresses[i].getAddress().toLowerCase();
		identity = this._addressToIdentity[address];
		if(identity) {
			return identity;
		}
	}
	return null;
};

ZmIdentityCollection.prototype.initialize =
function(data) {
	var identities = data.identity;
	for (var i = 0, count = identities ? identities.length : 0; i < count; i++) {
		var identity = new ZmIdentity(this._appCtxt, '');
		identity._loadFromDom(identities[i]);
		this.add(identity);
	}
	if (!count) {
		// This is a hack to make sure there is always a default identity, even though
		// the server isn't yet creating one for us.
		var identity = new ZmIdentity(this._appCtxt, "Fake Identity");
		identity.isDefault = true;
		this.add(identity);		
		this._hasFakeDefault = true;
	}
};


