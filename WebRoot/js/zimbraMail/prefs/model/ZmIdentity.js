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
	this._setReplyTo = false;
	this._setReplyToDisplay = "";
	this._setReplyToAddress = "";
	this._useSignature = false;
	this._signature = "";
	this._useWhenSentTo = false;
	this._whenSentToAddresses = [];
	this._useWhenInFolder = false;
	this._whenInFolderIds = [];
	
	this.useDefaultAdvanced = true;
	
	this._composeFormat = ZmIdentity.COMPOSE_TEXT;
	this._prefix = ">";
	this._forwardOption = ZmSetting.INCLUDE_PREFIX;
	this._replyOption = ZmSetting.INCLUDE_PREFIX;
	this._signatureStyle = ZmSetting.SIG_INTERNET;
};

ZmIdentity.COMPOSE_SAME = 1;
ZmIdentity.COMPOSE_TEXT = 2;
ZmIdentity.COMPOSE_HTML = 3;

ZmIdentity.STRING = 1;
ZmIdentity.ARRAY = 2;
ZmIdentity.BOOLEAN = 3;

var i = 0;
ZmIdentity.SEND_FROM_DISPLAY = i++;
ZmIdentity.SEND_FROM_ADDRESS = i++;
ZmIdentity.SET_REPLY_TO = i++;
ZmIdentity.SET_REPLY_TO_DISPLAY = i++;
ZmIdentity.SET_REPLY_TO_ADDRESS = i++;
ZmIdentity.USE_SIGNATURE = i++;
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

ZmIdentity.addField(ZmIdentity.SEND_FROM_DISPLAY, { name: "sendFromDisplay", soap: "sendFromDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SEND_FROM_ADDRESS, { name: "sendFromAddress", soap: "sendFromAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO, { name: "_setReplyTo", soap: "setReplyTo", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_DISPLAY, { name: "_setReplyToDisplay", soap: "setReplyToDisplay", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SET_REPLY_TO_ADDRESS, { name: "_setReplyToAddress", soap: "setReplyToAddress", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.USE_SIGNATURE, { name: "_useSignature", soap: "useSignature", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.SIGNATURE, { name: "_signature", soap: "signature", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.USE_WHEN_SENT_TO, { name: "_useWhenSentTo", soap: "useWhenSentTo", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_SENT_TO_ADDRESSES, { name: "_whenSentToAddresses", soap: "whenSentToAddresses", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_WHEN_IN_FOLDER, { name: "_useWhenInFolder", soap: "useWhenInFolder", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.WHEN_IN_FOLDERIDS, { name: "_whenInFolderIds", soap: "whenInFolderIds", type: ZmIdentity.ARRAY });
ZmIdentity.addField(ZmIdentity.USE_DEFAULT_ADVANCED, { name: "useDefaultAdvanced", soap: "useDefaultAdvanced", type: ZmIdentity.BOOLEAN });
ZmIdentity.addField(ZmIdentity.COMPOSE_FORMAT, { name: "_composeFormat", soap: "composeFormat", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.PREFIX, { name: "_prefix", soap: "prefix", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.FORWARD_OPTION, { name: "_forwardOption", soap: "forwardOption", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.REPLY_OPTION, { name: "_replyOption", soap: "replyOption", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.SIGNATURE_STYLE, { name: "_signatureStyle", soap: "signatureStyle", type: ZmIdentity.STRING });
ZmIdentity.addField(ZmIdentity.IS_DEFAULT, { name: "isDefault", soap: "isDefault", type: ZmIdentity.BOOLEAN });

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
			var name = props[i].n;
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
// Do the signature here...
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
						var propertyNode = soapDoc.set("a", value[j], identityNode);
						propertyNode.setAttribute("name", field.soap);
					}
				} else {
					var propertyNode = soapDoc.set("a", value, identityNode);
					propertyNode.setAttribute("name", field.soap);
				}
			}
		}		
// Do the signature here...
//		var signatureNode = soapDoc.set("signature", "My name, My Title, My phone number", identityNode);
//		signatureNode.setAttribute("name", "_0_");
    }
	var respCallback = new AjxCallback(this, this._handleAction, [request]);
	var errorCallback = new AjxCallback(this, this._handleErrorAction, [request]);
	batchCommand.addRequestParams(soapDoc, respCallback, errorCallback, request);
};

ZmIdentity.prototype._handleAction =
function(request, result) {
	var identityCollection = this._appCtxt.getApp(ZmZimbraMail.PREFERENCES_APP).getIdentityCollection();
	if (request == "ModifyIdentityRequest") {
		var identity = identityCollection.getById(this.id);
		identityCollection._removeFromMaps(identity);
		identity.name = this.name;
		for (var i in ZmIdentity.FIELDS) {
			var field = ZmIdentity.FIELDS[i];
			if (this.hasOwnProperty(field.name)) {
				var value = this.getField(i);
				identity.setField(i, value);
			}
		}
		identityCollection._addToMaps(identity);
	} else if (request == "CreateIdentityRequest") {
		identityCollection.add(this, false);
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

ZmIdentity.prototype.useWhenSentTo =
function() {
	return this._useWhenSentTo;
};

ZmIdentity.prototype.getWhenSentToAddresses =
function() {
	return this._whenSentToAddresses;
};

ZmIdentity.prototype.useWhenInFolder =
function() {
	return this._useWhenInFolder;
};

ZmIdentity.prototype.getWhenInFolderIds =
function() {
	return this._whenInFolderIds;
};

ZmIdentity.prototype.getWhenInFolderIds =
function() {
	return this._whenInFolderIds;
};
	
ZmIdentity.prototype.getComposeSameFormat =
function() {
	var format = this._getAdvancedIdentity()._composeFormat;
	return format == ZmIdentity.COMPOSE_SAME ? true : false;
};
ZmIdentity.prototype.getComposeAsFormat =
function() {
	var format = this._getAdvancedIdentity()._composeFormat;
	return format == ZmIdentity.COMPOSE_HTML ? ZmSetting.COMPOSE_HTML : ZmSetting.COMPOSE_TEXT;
};
ZmIdentity.prototype.getPrefix =
function() {
	return this._getAdvancedIdentity()._prefix;
};
ZmIdentity.prototype.getForwardOption =
function() {
	return this._getAdvancedIdentity()._forwardOption;
};
ZmIdentity.prototype.getReplyOption =
function() {
	return this._getAdvancedIdentity()._replyOption;
};

// ZmSetting.SIG_OUTLOOK: signature above quoted text.
ZmIdentity.prototype.getSignatureStyle =
function() {
	return this._getAdvancedIdentity()._signatureStyle;
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
	this._appCtxt = appCtxt;
	this._nextId = 1;
	this.defaultIdentity = null;
	this._idToIdentity = {};
	this._addressToIdentity = {};
	this._folderToIdentity = {};
};

ZmIdentityCollection.prototype.getIdentities =
function() {
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
	identity.id = this._nextId++;
	this._idToIdentity[identity.id] = identity;
	if (identity.isDefault || !this.defaultIdentity) {
		this.defaultIdentity = identity;
	}

	this._addToMaps(identity);	
};

ZmIdentityCollection.prototype.remove =
function(identity) {
	this._removeFromMaps(identity);
	delete this._idToIdentity[identity.id];
};

ZmIdentityCollection.prototype._addToMaps =
function(identity) {
	if (identity.useWhenSentTo()) {
		var addresses = identity.getWhenSentToAddresses();
		for (var i = 0, count = addresses.length; i < count; i++) {
			this._addressToIdentity[addresses[i]] = identity;
		}
	}

	if (identity.useWhenInFolder()) {
		var folders = identity.getWhenInFolderIds();
		for (var i = 0, count = folders.length; i < count; i++) {
			this._folderToIdentity[folders[i]] = identity;
		}
	}
};

ZmIdentityCollection.prototype._removeFromMaps =
function(identity) {
	for (var i = 0, count = identity._whenSentToAddresses.length; i < count; i++) {
		var address = identity._whenSentToAddresses[i];
		delete this._addressToIdentity[address];
	}

	for (var i = 0, count = identity._whenInFolderIds.length; i < count; i++) {
		var folderId = identity._whenInFolderIds[i];
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
		var address = addresses[i].getAddress();
		identity = this._addressToIdentity[address];
		if(identity) {
			return identity;
		}
	}
	return null;
};

// Make up some fake identity data..
//ZmIdentityCollection.prototype.buildHack =
//function() {
//	var dave = new ZmIdentity(this._appCtxt, "Dave");
//	dave.id = 11111;
//	dave.sendFromDisplay = "Dave Comfort";
//	dave.sendFromAddress = "dcomfort@zimbra.com";
//	dave._useWhenSentTo = true;
//	dave._whenSentToAddresses = ["dave@comfort.com", "qqquser1@example.zimbra.com", "whoever@junk.nothing"];
//	dave._useWhenInFolder = true;
//	dave._whenInFolderIds = [538];
//
//	var otis = new ZmIdentity(this._appCtxt, "Otis");
//	otis.id = 22222;
//	otis.sendFromDisplay = "Otis";
//	otis.sendFromAddress = "otis@elevator.com";
//	
//	var rufus = new ZmIdentity(this._appCtxt, "Rufus");
//	rufus.id = 33333;
//	rufus.sendFromDisplay = "rufus";
//	rufus.sendFromAddress = "rufus@moop.liquidsys.com";
//	// Ficticious JSON response object.....
//	var data = { sendFromDisplay:"Rufusmeister", useWhenInFolder:true, whenInFolderIds:["2"] };
//	rufus._loadFromDom(data);
	
//	this.add(otis, true);
//	this.add(dave, false);
//	this.add(rufus);
//
//    var soapDoc = AjxSoapDoc.create("IdentityActionRequest", "urn:zimbraMail");
//    var create = soapDoc.set("action");
//    create.setAttribute("op", "create");
//    var node = soapDoc.set("identity", null, create);
//    node.setAttribute("name", rufus.name);
//    node.setAttribute("sendFromDisplay", rufus.sendFromDisplay);
//    node.setAttribute("sendFromAddress", rufus.sendFromAddress);
//    
//    var callback = new AjxCallback(this, this._handleAction);
//    var errorCallback = new AjxCallback(this, this._handleActionError);
//	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
//												  callback: callback, errorCallback: errorCallback});
//};

//ZmIdentityCollection.prototype._handleAction =
//function() {
//	debugger;
//};
//	
//ZmIdentityCollection.prototype._handleActionError =
//function() {
//	debugger;
//};

ZmIdentityCollection.prototype.initialize =
function(data) {
	var identities = data.identity;
	for (var i = 0, count = identities ? identities.length : 0; i < count; i++) {
		var identity = new ZmIdentity(this._appCtxt, '');
		identity._loadFromDom(identities[i]);
		this.add(identity);
	}
};