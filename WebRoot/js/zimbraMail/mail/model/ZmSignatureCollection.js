/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmSignatureCollection = function() {
	ZmModel.call(this, ZmEvent.S_SIGNATURE);
	this._idMap = {};
	this._nameMap= {};
	this._size = 0;
};

ZmSignatureCollection.prototype = new ZmModel;
ZmSignatureCollection.prototype.constructor = ZmSignatureCollection;

ZmSignatureCollection.prototype.toString =
function() {
	return "ZmSignatureCollection";
};

//
// Public methods
//

ZmSignatureCollection.prototype.add =
function(signature) {
	if (!this._idMap[signature.id]) {
		this._idMap[signature.id] = signature;
		this._nameMap[signature.name] = signature;
		this._size++;
		this._notify(ZmEvent.E_CREATE, { item: signature });
	}
};

ZmSignatureCollection.prototype.remove =
function(signature) {
	if (this._idMap[signature.id]) {
		delete this._idMap[signature.id];
		delete this._nameMap[signature.name];
		this._size--;
		this._notify(ZmEvent.E_DELETE, { item: signature });
	}
};

ZmSignatureCollection.prototype.getSize =
function() {
	return this._size;
};

ZmSignatureCollection.prototype.getSignatures =
function() {
	return AjxUtil.values(this._idMap);
};

ZmSignatureCollection.prototype.getSignatureOptions =
function() {
	// collect signatures
	var signatures = [];
	for (var id in this._idMap) {
		signatures.push(this._idMap[id]);
	}
	signatures.sort(ZmSignatureCollection.BY_NAME);

	// create options
	var options = [];
	for (var i = 0; i < signatures.length; i++) {
		var signature = signatures[i];
		options.push(new DwtSelectOptionData(signature.id, signature.name));
	}
	options.push(new DwtSelectOptionData("", ZmMsg.signatureDoNotAttach));
	return options;
};

ZmSignatureCollection.prototype.getById =
function(id) {
	return this._idMap[id];
};

ZmSignatureCollection.prototype.getByName =
function(name) {
	var lname = name.toLowerCase();
	for (var key in this._nameMap) {
		if (key.toLowerCase() == lname) {
			return this._nameMap[key];
		}
	}
};

ZmSignatureCollection.prototype.initialize =
function(data) {
	if (this._size) return;

	var signatures = data.signature;
	if (!signatures) return;

	for (var i = 0; i < signatures.length; i++) {
		var signature = ZmSignature.createFromJson(signatures[i]);
		this.add(signature);
	}
};

//
// Static functions
//

ZmSignatureCollection.BY_NAME =
function(a, b) {
	return a.name.localeCompare(b.name);
};
