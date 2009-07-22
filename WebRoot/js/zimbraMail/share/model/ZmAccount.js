/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */

ZmAccount = function(type, id, name, list) {
	if (arguments.length == 0) { return; }

	this.id = id;
	this.name = name;
	this.type = type || ZmAccount.TYPE_ZIMBRA;
};


//
// Consts
//

ZmAccount.TYPE_AOL		= "AOL";
ZmAccount.TYPE_GMAIL	= "Gmail";
ZmAccount.TYPE_IMAP		= "Imap";
ZmAccount.TYPE_LIVE		= "Live";   // MS Live / hotmail
ZmAccount.TYPE_MSE		= "MSE";    // exchange IMAP
ZmAccount.TYPE_PERSONA	= "PERSONA";
ZmAccount.TYPE_POP		= "Pop";
ZmAccount.TYPE_YMP		= "YMP";    // Y! mail
ZmAccount.TYPE_ZIMBRA	= "Zimbra";


//
// Public static methods
//

ZmAccount.getTypeName =
function(type) {
	switch (type) {
		case ZmAccount.TYPE_AOL:		return "AOL";
		case ZmAccount.TYPE_GMAIL:		return "Gmail";
		case ZmAccount.TYPE_IMAP:		return ZmMsg.accountTypeImap;
		case ZmAccount.TYPE_LIVE:		return "Microsoft Live";
		case ZmAccount.TYPE_MSE:		return "Microsoft Exchange";
		case ZmAccount.TYPE_PERSONA:	return ZmMsg.accountTypePersona;
		case ZmAccount.TYPE_POP:		return ZmMsg.accountTypePop;
		case ZmAccount.TYPE_YMP:		return "Yahoo! Mail";
		case ZmAccount.TYPE_ZIMBRA:		return "Zimbra";
	}
	return ZmMsg.unknown;
};


//
// Public methods
//

ZmAccount.prototype.toString =
function() {
	return "ZmAccount";
};

ZmAccount.prototype.setName =
function(name) {
	this.name = name;
};

ZmAccount.prototype.getName =
function() {
	return this.name;
};

// sub-classes MUST override these methods

ZmAccount.prototype.setEmail =
function(email) {
	throw this.toString()+"#setEmail";
};

ZmAccount.prototype.getEmail =
function() {
	throw this.toString()+"#getEmail";
};

ZmAccount.prototype.getIdentity =
function() {
	throw this.toString()+"#getIdentity";
};
