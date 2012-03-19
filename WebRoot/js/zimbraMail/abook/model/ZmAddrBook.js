/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmAddrBook.prototype.toString = 
function() {
	return "ZmAddrBook";
};

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
ZmAddrBook.prototype.mayContain =
function(what) {
	if (!what) return true;

	if (this.id == ZmOrganizer.ID_DLS) {
		return false;
	}

	if (what instanceof ZmAddrBook) {
		if (!appCtxt.multiAccounts) {
			return true;
		}
		return this.mayContainFolderFromAccount(what.getAccount()); // cannot move folders across accounts, unless the target is local
	}

	if (this.nId == ZmOrganizer.ID_ROOT) {
		// cannot drag anything onto root folder
		return false;
	}
	if (this.link) {
		// cannot drop anything onto a read-only addrbook
		if (this.isReadOnly()) {
			return false;
		}
	}

	// An item or an array of items is being moved
	var items = (what instanceof Array) ? what : [what];
	var item = items[0];

	if (item.type != ZmItem.CONTACT && item.type != ZmItem.GROUP) {
		// only contacts are valid for addr books.
		return false;
	}

	// can't move items to folder they're already in; we're okay if
	// we have one item from another folder
	if (item.folderId) {
		var invalid = true;
		for (var i = 0; i < items.length; i++) {
			var tree = appCtxt.getById(items[i].folderId);
			if (tree != this) {
				invalid = false;
				break;
			}
		}

		return !invalid;
	}

	return true;
};
