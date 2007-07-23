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
 * Portions created by Zimbra are Copyright (C) 2007 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmSignatureCollection = function(appCtxt) {
	ZmModel.call(this, ZmEvent.S_SIGNATURE);
	this._appCtxt = appCtxt;
	this._idMap = {};
	this._nameMap= {};
	this._size = 0;
};
ZmSignatureCollection.prototype = new ZmModel;
ZmSignatureCollection.prototype.constructor = ZmSignatureCollection;

ZmSignatureCollection.prototype.toString = function() {
	return "ZmSignatureCollection";
};

//
// Public methods
//

ZmSignatureCollection.prototype.add = function(signature) {
	if (!this._idMap[signature.id]) {
		this._idMap[signature.id] = signature;
		this._nameMap[signature.name] = signature;
		this._size++;
		this._notify(ZmEvent.E_CREATE, { item: signature });
	}
};
ZmSignatureCollection.prototype.remove = function(signature) {
	if (this._idMap[signature.id]) {
		delete this._idMap[signature.id];
		delete this._nameMap[signature.name];
		this._size--;
		this._notify(ZmEvent.E_DELETE, { item: signature });
	}
};

ZmSignatureCollection.prototype.getSize = function() {
	return this._size;
};

ZmSignatureCollection.prototype.getSignatures = function() {
	return AjxUtil.values(this._idMap);
};

ZmSignatureCollection.prototype.getById = function(id) {
	return this._idMap[id];
};
ZmSignatureCollection.prototype.getByName = function(name) {
	var lname = name.toLowerCase();
	for (var key in this._nameMap) {
		if (key.toLowerCase() == lname) {
			return this._nameMap[key];
		}
	}
};

ZmSignatureCollection.prototype.initialize = function(data) {
	if (this._size) return;

	var signatures = data.signature;
	if (!signatures) return;

	for (var i = 0; i < signatures.length; i++) {
		var signature = ZmSignature.createFromJson(signatures[i]);
		this.add(signature);
	}
};
