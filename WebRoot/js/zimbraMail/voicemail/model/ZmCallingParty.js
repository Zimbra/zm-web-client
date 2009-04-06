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

/**
* Creates a calling party.
* @constructor
* @class
* This class represents a calling party. Should be treated as immutable.
*
*/
ZmCallingParty = function() {
	ZmPhone.call(this);

	this.type = null;
	this.city = null;
	this.state = null;
	this.country = null;
}

ZmCallingParty.prototype = new ZmPhone;
ZmCallingParty.prototype.constructor = ZmCallingParty;

ZmCallingParty.prototype.toString = 
function() {
	return "ZmCallingParty";
}

ZmCallingParty.prototype.getPhoneNumber = 
function() {
	return this.name;
};

ZmCallingParty.prototype._loadFromDom =
function(node) {
	if (node.n) this.name = node.n
	if (node.t) this.type = node.t == "f" ? ZmVoiceItem.FROM : ZmVoiceItem.TO;
	if (node.ci) this.city = node.ci == "Unavailable" ? null : node.ci;
	if (node.st) this.state = node.st  == "Unavailable" ? null : node.st;
	if (node.co) this.country = node.co == "null" ? null : node.co;
};

