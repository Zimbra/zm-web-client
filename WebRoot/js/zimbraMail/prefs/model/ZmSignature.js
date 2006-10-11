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
function ZmSignature(name) {
	this.name = name;
	this.id = "";
	this.content = ""
};

ZmSignature.prototype._loadFromDom =
function(data) {
	if (data.name) this.name = data.name;
	if (data.id) this.id = data.id;
	if (data.content) this.content = data.content;
};

ZmSignature.prototype.toString =
function() {
	return "ZmSignature";
};

function ZmSignatureCollection() {
	this.defaultSignature = null;
	this._idToSignature = {};
};

ZmSignatureCollection.prototype.getSignatures =
function() {
	var i = 0;
	var result = [];
	for (var id in this._idToSignature) {
		result[i++] = this._idToSignature[id];
	}
	return result;
};

ZmSignatureCollection.prototype.add =
function(signature, isDefault) {
	this._idToSignature[signature.id] = signature;
	if (isDefault) {
		this.defaultSignature = signature;
	}
};

ZmSignatureCollection.prototype.remove =
function(signature) {
	delete this._idToSignature[signature.id];
};

// Make up some fake signature data..
ZmSignatureCollection.prototype.buildHack =
function() {
	var pro = new ZmSignature("Professional");
	pro.id = "222";
	pro.content = "Otis Floyd\nDirt Mover\n858-693-6165";
	
	var personal = new ZmSignature("Personal");
	personal.id = "333";
	personal.content = "Take it easy.";
	
	var angry = new ZmSignature("Angry");
	angry.id = "444";
	angry.content = "Leave me alone\nwww.stop-stalkers.com";
	
	this.add(pro, true);
	this.add(personal, false);
	this.add(angry);
};

