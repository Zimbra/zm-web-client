/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the address book class.
 */

/**
 * Creates an address book.
 * @constructor
 * @class
 * This class represents an address book.
 * 
 * @author Parag Shah
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {int}	params.id			a numeric ID
 * @param {String}	params.name		[string]	the name
 * @param {ZmOrganizer}	params.parent		the parent organizer
 * @param {ZmTree}	params.tree		a tree model that contains this organizer
 * @param {int}	params.color		the color of this address book
 * @param {String}	params.owner	the owner of the address book (if shared)
 * @param {String}	params.zid 		the the share ID of a shared address book
 * @param {String}	params.rid		the the remote folder id of a shared address book
 * @param {String}	params.restUrl	the REST URL of this organizer
 * 
 * @extends		ZmFolder
 */
ZmAddrBook = function(params) {
	params.type = ZmOrganizer.ADDRBOOK;
	ZmFolder.call(this, params);
};

ZmAddrBook.prototype = new ZmFolder;
ZmAddrBook.prototype.constructor = ZmAddrBook;

ZmAddrBook.prototype.isZmAddrBook = true;
ZmAddrBook.prototype.toString = function() { return "ZmAddrBook"; };


// Consts

ZmAddrBook.ID_ADDRESSBOOK = ZmOrganizer.ID_ADDRBOOK; 							// XXX: may not be necessary

// Public methods

ZmAddrBook.prototype.getIcon =
function() {
	if (this.nId == ZmFolder.ID_ROOT)			{ return null; }
	if (this.nId == ZmFolder.ID_TRASH)			{ return "Trash"; }
	if (this.link || this.isRemote())			{ return "SharedContactsFolder"; }
	if (this.nId == ZmFolder.ID_AUTO_ADDED)		{ return "EmailedContacts"; }
	if (this.nId == ZmOrganizer.ID_DLS)			{ return "DistributionList"; }
	return "ContactsFolder";
};

/**
 * Checks if the address book supports public access.
 * 
 * @return	{Boolean}		always returns <code>true</code>
 */
ZmAddrBook.prototype.supportsPublicAccess =
function() {
	// AddrBook's can be accessed outside of ZCS (i.e. REST)
	return true;
};

/**
 * @private
 */
ZmAddrBook.prototype.mayContain = function(what) {

	if (!what) {
		return true;
	}

	// Distribution Lists is a system-generated folder
	if (this.id == ZmOrganizer.ID_DLS) {
		return false;
	}

	if (what.isZmAddrBook) {
		return ZmFolder.prototype.mayContain.apply(this, arguments);
	}

	// An item or an array of items is being moved
	var items = AjxUtil.toArray(what);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.type !== ZmItem.CONTACT && item.type !== ZmItem.GROUP) {
			// only contacts are valid for addr books.
			return false;
		}
	}

	return ZmFolder.prototype.mayContain.apply(this, arguments);
};
