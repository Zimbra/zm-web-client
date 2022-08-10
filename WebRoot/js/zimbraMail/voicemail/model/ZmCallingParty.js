/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
* Creates a calling party.
* @constructor
* @class  ZmCallingParty
* This class represents a calling party. Should be treated as immutable.
*
*/
ZmCallingParty = function() {
	ZmPhone.call(this);

	this.type = null;
	this.city = null;
	this.state = null;
	this.country = null;
	this.callerId = null;
};

ZmCallingParty.prototype = new ZmPhone;
ZmCallingParty.prototype.constructor = ZmCallingParty;

ZmCallingParty.prototype.toString = 
function() {
	return "ZmCallingParty";
};

ZmCallingParty.prototype.getPhoneNumber = 
function() {
	return this.name;
};

ZmCallingParty.prototype._loadFromDom =
function(node) {
	if (node.n) this.name = node.n;
	if (node.p) this.callerId = node.p == node.n ? null : this._getDisplayString(node.p);
	if (node.t) this.type = node.t == "f" ? ZmVoiceItem.FROM : ZmVoiceItem.TO;
	if (node.ci) this.city = this._getDisplayString(node.ci);
	if (node.st) this.state = this._getDisplayString(node.st);
	if (node.co) this.country = node.co == "null" ? null : node.co;
};

ZmCallingParty.prototype._getDisplayString =
function(str) {
	return (str.toUpperCase() != "UNAVAILABLE") ? str : null;
};
