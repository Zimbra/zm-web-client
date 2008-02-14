/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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
* 
* @constructor
* @class
*
* @author Parag Shah
*
* @param id			[int]			numeric ID
* @param name		[string]		name
* @param parent		[ZmOrganizer]	parent organizer
* @param tree		[ZmTree]		tree model that contains this organizer
* @param color		[int]			color of this address book
* @param owner		[string]*		owner of the address book (if shared)
* @param zid 		[string]*		the share ID of a shared addrbook
* @param rid		[string]*		the remote folder id of a shared addrbook
* @param restUrl	[string]*		The REST URL of this organizer.
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
	if (this.nId == ZmOrganizer.ID_MY_CARD)		{ return "MyCard"; }
	return "ContactsFolder";
};

ZmAddrBook.prototype.supportsPublicAccess =
function() {
	// AddrBook's can be accessed outside of ZCS (i.e. REST)
	return true;
};

ZmAddrBook.create =
function(params) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", params.name);
	folderNode.setAttribute("l", params.parent.id);
	folderNode.setAttribute("color", params.color || ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK]);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK][0]);

	var errorCallback = new AjxCallback(null, ZmAddrBook._handleErrorCreate, params);
	var appController = appCtxt.getAppController();
	appController.sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmAddrBook._handleErrorCreate =
function(params, ex) {
	if (params.name && ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		var msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [params.name]);
		var msgDialog = appCtxt.getMsgDialog();
		msgDialog.reset();
		msgDialog.setMessage(msg, DwtMessageDialog.CRITICAL_STYLE);
		msgDialog.popup();
		return true;
	}

	return false;
};

ZmAddrBook.prototype.mayContain =
function(what) {
	if (!what) return true;

	if (this.id == ZmOrganizer.ID_MY_CARD) {
		return false;
	}

	if (!(what instanceof ZmAddrBook)) {
		var invalid = false;

		if (this.nId == ZmOrganizer.ID_ROOT) {
			// cannot drag anything onto root folder
			invalid = true;
		} else if (this.link) {
			// cannot drop anything onto a read-only addrbook
			invalid = this.isReadOnly();
		}

		if (!invalid) {
			// An item or an array of items is being moved
			var items = (what instanceof Array) ? what : [what];
			var item = items[0];

			if (item.type != ZmItem.CONTACT && item.type != ZmItem.GROUP) {
				// only contacts are valid for addr books.
				invalid = true;
			} else {
				// can't move items to folder they're already in; we're okay if
				// we have one item from another folder
				if (!invalid && item.folderId) {
					invalid = true;
					for (var i = 0; i < items.length; i++) {
						var tree = appCtxt.getById(items[i].folderId);
						if (tree != this) {
							invalid = false;
							break;
						}
					}
				}
			}
		}

		return !invalid;
	}

	return true;
};


// Callbacks

ZmAddrBook.prototype.notifyCreate =
function(obj) {
	// ignore creates of system folders
	var nId = ZmOrganizer.normalizeId(obj.id);
	if (nId < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.ADDRBOOK]) { return; }

	var ab = ZmFolderTree.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(ab, ZmAddrBook.sortCompare);
	this.children.add(ab, index);
	ab._notify(ZmEvent.E_CREATE);
};
