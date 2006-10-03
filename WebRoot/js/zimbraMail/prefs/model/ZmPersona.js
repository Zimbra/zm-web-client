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
function ZmPersona(name) {
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

ZmPersona.prototype._loadFromDom =
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

ZmPersona.prototype.toString =
function() {
	return "ZmPersona";
};

ZmPersona.prototype.useWhenSentTo =
function() {
	return this._whenSentTo;
};

ZmPersona.prototype.getWhenSentToAddresses =
function() {
	return this._whenSentToAddresses;
};

ZmPersona.prototype.useWhenInFolder =
function() {
	return this._useWhenInFolder;
};

ZmPersona.prototype.getWhenInFolderIds =
function() {
	return this._whenInFolderIds;
};

function ZmPersonaCollection() {
	this.defaultPersona = null;
	this._idToPersona = {};
	this._addressToPersona = {};
	this._folderToPersona = {};
};

ZmPersonaCollection.prototype.getPersonas =
function() {
	var i = 0;
	var result = [];
	for (var id in this._idToPersona) {
		result[i++] = this._idToPersona[id];
	}
	return result;
};

ZmPersonaCollection.prototype.add =
function(persona, isDefault) {
	this._idToPersona[persona.id] = persona;
	if (isDefault) {
		this.defaultPersona = persona;
	}
	
	// Update map of sent to addresses.
	if (persona.useWhenSentTo()) {
		var addresses = persona.getWhenSentToAddresses();
		for (var i = 0, count = addresses.length; i < count; i++) {
			this._addressToPersona[addresses[i]] = persona;
		}
	}

	// Update map of folders.
	if (persona.useWhenInFolder()) {
		var folders = persona.getWhenInFolderIds();
		for (var i = 0, count = folders.length; i < count; i++) {
			this._folderToPersona[folders[i]] = persona;
		}
	}
};

ZmPersonaCollection.prototype.remove =
function(persona) {
	this._removeFromAddressMap(persona);
	this._removeFromFolderMap(persona);
	delete this._idToPersona[persona.id];
};

ZmPersonaCollection.prototype._removeFromAddressMap =
function(persona) {
	for (var i = 0, count = persona._whenSentToAddresses.length; i < count; i++) {
		var address = persona._whenSentToAddresses[i];
		delete this._addressToPersona[address];
	}
};

ZmPersonaCollection.prototype._removeFromFolderMap =
function(persona) {
	for (var i = 0, count = persona._whenInFolderIds.length; i < count; i++) {
		var folderId = persona._whenInFolderIds[i];
		delete this._folderToPersona[folderId];
	}
};

ZmPersonaCollection.prototype.selectPersona =
function(mailMsg) {

	// Check if the a persona's address was in the to field.
	var persona = this._selectPersonaFromAddresses(mailMsg, ZmEmailAddress.TO);
	if (persona) {
		return persona;
	}

	// Check if the a persona's address was in the cc field.
	persona = this._selectPersonaFromAddresses(mailMsg, ZmEmailAddress.CC);
	if (persona) {
		return persona;
	}
	
	// Check if a persona's folder is the same as where the message lives.
	var folder = mailMsg.folderId;
	persona = this._folderToPersona[folder];
	if(persona) {
		return persona;
	}
	
	return this.defaultPersona;
};

ZmPersonaCollection.prototype._selectPersonaFromAddresses =
function(mailMsg, type) {
	var persona;
	var addresses = mailMsg.getAddresses(type).getArray();
	for (var i = 0, count = addresses.length; i < count; i++) {
		var address = addresses[i].getAddress();
		persona = this._addressToPersona[address];
		if(persona) {
			return persona;
		}
	}
	return null;
};

// Make up some fake persona data..
ZmPersonaCollection.buildHack =
function() {
	var dave = new ZmPersona("Dave");
	dave.id = 11111;
	dave.sendFromDisplay = "Dave Comfort";
	dave.sendFromAddress = "dcomfort@zimbra.com";
	dave._whenSentTo = true;
	dave._whenSentToAddresses = ["dave@comfort.com", "qqquser1@example.zimbra.com", "whoever@junk.nothing"];
	dave._useWhenInFolder = true;
	dave._whenInFolderIds = [538];

	var otis = new ZmPersona("Otis");
	otis.id = 22222;
	otis.sendFromDisplay = "Otis";
	otis.sendFromAddress = "otis@elevator.com";
	
	var rufus = new ZmPersona("Rufus");
	rufus.id = 33333;
	rufus.sendFromDisplay = "rufus";
	rufus.sendFromAddress = "rufus@dogma.com";
	// Ficticious JSON response object.....
	var data = { sendFromDisplay:"Rufusmeister", useWhenInFolder:true, whenInFolderIds:["2"] };
	rufus._loadFromDom(data);
	
	ZmPersonaCollection.HACK = new ZmPersonaCollection();
	ZmPersonaCollection.HACK.add(otis, true);
	ZmPersonaCollection.HACK.add(dave, false);
	ZmPersonaCollection.HACK.add(rufus);
};
ZmPersonaCollection.buildHack();

