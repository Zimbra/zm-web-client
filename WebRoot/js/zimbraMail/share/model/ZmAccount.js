/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file defines the account base class.
 *
 */

/**
 * Creates the account.
 * @class
 * This class represents an account.
 * 
 * @param	{constant}	type	the account type (see <code>ZmAccount.TYPE_</code> constants)
 * @param	{String}	id		the account id
 * @param	{String}	name	the account name
 * @see		ZmAccount
 */
ZmAccount = function(type, id, name) {
	if (arguments.length == 0) { return; }

	this.id = id;
	this.name = name;
	this.type = type || ZmAccount.TYPE_ZIMBRA;
};


//
// Consts
//

/**
 * Defines the "AOL" account type.
 */
ZmAccount.TYPE_AOL		= "AOL";
/**
 * Defines the "Gmail" account type.
 */
ZmAccount.TYPE_GMAIL	= "Gmail";
/**
 * Defines the "IMAP" account type.
 */
ZmAccount.TYPE_IMAP		= "Imap";
/**
 * Defines the "Microsoft Live" or "Hotmail" account type.
 */
ZmAccount.TYPE_LIVE		= "Live";   // MS Live / hotmail
/**
 * Defines the "Microsoft Exchange IMAP" account type.
 */
ZmAccount.TYPE_MSE		= "MSE";    // exchange IMAP
/**
 * Defines the "Microsoft Exchange Mobile Sync" account type.
 */
ZmAccount.TYPE_EXCHANGE = "Xsync";  // exchange (using mobile sync protocol)
/**
 * Defines the "persona" account type.
 */
ZmAccount.TYPE_PERSONA	= "PERSONA";
/**
 * Defines the "POP" account type.
 */
ZmAccount.TYPE_POP		= "Pop";
/**
 * Defines the "Y! Mail" account type.
 */
ZmAccount.TYPE_YMP		= "YMP";    // Y! mail
/**
 * Defines the "Zimbra" account type.
 */
ZmAccount.TYPE_ZIMBRA	= "Zimbra";
/**
 * Defines the "Zimbra" account type.
 */
ZmAccount.TYPE_CALDAV	= "CalDAV";


ZmAccount.LOCAL_ACCOUNT_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";


//
// Public static methods
//

/**
 * Gets the name of the specified type.
 * 
 * @param	{constant}	type		the type (see <code>ZmAccount.TYPE_</code> constants)
 * @return	{String}	the name or unknown
 * 
 * @see		ZmAccount
 */
ZmAccount.getTypeName =
function(type) {
	switch (type) {
		case ZmAccount.TYPE_AOL:		return ZmMsg.aol;
		case ZmAccount.TYPE_GMAIL:		return ZmMsg.gmail;
		case ZmAccount.TYPE_IMAP:		return ZmMsg.accountTypeImap;
		case ZmAccount.TYPE_LIVE:		return ZmMsg.msLive;
		case ZmAccount.TYPE_MSE:		return ZmMsg.msExchange;
		case ZmAccount.TYPE_EXCHANGE:	return ZmMsg.msExchange;
		case ZmAccount.TYPE_PERSONA:	return ZmMsg.accountTypePersona;
		case ZmAccount.TYPE_POP:		return ZmMsg.accountTypePop;
		case ZmAccount.TYPE_YMP:		return ZmMsg.yahooMail;
		case ZmAccount.TYPE_ZIMBRA:		return ZmMsg.zimbraTitle;
	}
	return ZmMsg.unknown;
};


//
// Public methods
//

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAccount.prototype.toString =
function() {
	return "ZmAccount";
};

/**
 * Sets the name of the account.
 * 
 * @param		{String}	name		the account name
 */
ZmAccount.prototype.setName =
function(name) {
	this.name = name;
};

/**
 * Gets the name of the account.
 * 
 * @return		{String}		the account name
 */
ZmAccount.prototype.getName =
function() {
	return this.name;
};

// sub-classes MUST override these methods

/**
 * Sets the email address for this account. Subclasses should override this method.
 * 
 * @param	{String}	email 	the email address
 */
ZmAccount.prototype.setEmail =
function(email) {
	throw this.toString()+"#setEmail";
};

/**
 * Gets the email address for this account. Subclasses should override this method.
 * 
 * @return	{String}	the email address
 */
ZmAccount.prototype.getEmail =
function() {
	throw this.toString()+"#getEmail";
};

/**
 * Gets the identity for this account. Subclasses should override this method.
 * 
 * @return	{String}	the identity
 */
ZmAccount.prototype.getIdentity =
function() {
	throw this.toString()+"#getIdentity";
};

ZmAccount.prototype.isLocal =
function() {
	return this.id == ZmAccount.LOCAL_ACCOUNT_ID;
};
