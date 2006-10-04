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
function ZmIdentity(name) {
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
};

ZmIdentity.prototype._loadFromDom =
function(data) {
	if (data.name) this.name = data.name;
	if (data.id) this.id = data.id;
	if (data.sendFromDisplay) this.sendFromDisplay = data.sendFromDisplay;
	if (data.sendFromAddress) this.sendFromAddress = data.sendFromAddress;
	if (data.setReplyTo) this._setReplyTo = data.setReplyTo;
	if (data.setReplyToDisplay) this._setReplyToDisplay = data.setReplyToDisplay;
	if (data.setReplyToAddress) this._setReplyToAddress = data.setReplyToAddress;
	if (data.useSignature) this._useSignature = data.useSignature;
	if (data.signature) this._signature = data.signature;
	if (data.useWhenSentTo) this._useWhenSentTo = data.useWhenSentTo;
	if (data.whenSentToAddresses) this._whenSentToAddresses = data.whenSentToAddresses;
	if (data.useWhenInFolder) this._useWhenInFolder = data.useWhenInFolder;
	if (data.whenInFolderIds) this._whenInFolderIds = data.whenInFolderIds;
};

ZmIdentity.prototype.toString =
function() {
	return "ZmIdentity";
};

ZmIdentity.prototype.useWhenSentTo =
function() {
	return this._whenSentTo;
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

function ZmIdentityCollection() {
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

ZmIdentityCollection.prototype.add =
function(identity, isDefault) {
	this._idToIdentity[identity.id] = identity;
	if (isDefault) {
		this.defaultIdentity = identity;
	}
	
	// Update map of sent to addresses.
	if (identity.useWhenSentTo()) {
		var addresses = identity.getWhenSentToAddresses();
		for (var i = 0, count = addresses.length; i < count; i++) {
			this._addressToIdentity[addresses[i]] = identity;
		}
	}

	// Update map of folders.
	if (identity.useWhenInFolder()) {
		var folders = identity.getWhenInFolderIds();
		for (var i = 0, count = folders.length; i < count; i++) {
			this._folderToIdentity[folders[i]] = identity;
		}
	}
};

ZmIdentityCollection.prototype.remove =
function(identity) {
	this._removeFromAddressMap(identity);
	this._removeFromFolderMap(identity);
	delete this._idToIdentity[identity.id];
};

ZmIdentityCollection.prototype._removeFromAddressMap =
function(identity) {
	for (var i = 0, count = identity._whenSentToAddresses.length; i < count; i++) {
		var address = identity._whenSentToAddresses[i];
		delete this._addressToIdentity[address];
	}
};

ZmIdentityCollection.prototype._removeFromFolderMap =
function(identity) {
	for (var i = 0, count = identity._whenInFolderIds.length; i < count; i++) {
		var folderId = identity._whenInFolderIds[i];
		delete this._folderToIdentity[folderId];
	}
};

ZmIdentityCollection.prototype.selectIdentity =
function(mailMsg) {

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
ZmIdentityCollection.buildHack =
function() {
	var dave = new ZmIdentity("Dave");
	dave.id = 11111;
	dave.sendFromDisplay = "Dave Comfort";
	dave.sendFromAddress = "dcomfort@zimbra.com";
	dave._whenSentTo = true;
	dave._whenSentToAddresses = ["dave@comfort.com", "qqquser1@example.zimbra.com", "whoever@junk.nothing"];
	dave._useWhenInFolder = true;
	dave._whenInFolderIds = [538];

	var otis = new ZmIdentity("Otis");
	otis.id = 22222;
	otis.sendFromDisplay = "Otis";
	otis.sendFromAddress = "otis@elevator.com";
	
	var rufus = new ZmIdentity("Rufus");
	rufus.id = 33333;
	rufus.sendFromDisplay = "rufus";
	rufus.sendFromAddress = "rufus@dogma.com";
	// Ficticious JSON response object.....
	var data = { sendFromDisplay:"Rufusmeister", useWhenInFolder:true, whenInFolderIds:["2"] };
	rufus._loadFromDom(data);
	
	ZmIdentityCollection.HACK = new ZmIdentityCollection();
	ZmIdentityCollection.HACK.add(otis, true);
	ZmIdentityCollection.HACK.add(dave, false);
	ZmIdentityCollection.HACK.add(rufus);
};
ZmIdentityCollection.buildHack();

