/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
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

// Static methods

/**
 * Sorts the address books.
 * 
 * @param	{ZmAddrBook}	addrBookA		the address book
 * @param	{ZmAddrBook}	addrBookB		the address book
 * @return	{int}	0 if the address books are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmAddrBook.sortCompare = 
function(addrBookA, addrBookB) {
	var check = ZmOrganizer.checkSortArgs(addrBookA, addrBookB);
	if (check != null) return check;

	// links appear after personal address books
	if (addrBookA.link != addrBookB.link) {
		return addrBookA.link ? 1 : -1;
	}

	// trash folder should always go last w/in personal addrbooks
	if (addrBookA.nId == ZmFolder.ID_TRASH) { return 1; }
	if (addrBookB.nId == ZmFolder.ID_TRASH) { return -1; }

	// sort by calendar name
	var addrBookAName = addrBookA.name.toLowerCase();
	var addrBookBName = addrBookB.name.toLowerCase();
	if (addrBookAName < addrBookBName) { return -1; }
	if (addrBookAName > addrBookBName) { return 1; }
	return 0;
};

// Public methods

ZmAddrBook.prototype.getIcon =
function() {
	if (this.nId == ZmFolder.ID_ROOT)			{ return null; }
	if (this.nId == ZmFolder.ID_TRASH)			{ return "Trash"; }
	if (this.link || this.isRemote())			{ return "SharedContactsFolder"; }
	if (this.nId == ZmFolder.ID_AUTO_ADDED)		{ return "EmailedContacts"; }
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

	if (this.id == ZmOrganizer.ID_DLS) {
		return false;
	}

	if (!what.isZmAddrBook && item.type !== ZmItem.CONTACT && item.type !== ZmItem.GROUP) {
		// only contacts are valid for addr books.
		return false;
	}

	return ZmFolder.prototype.mayContain.apply(this, arguments);
};
