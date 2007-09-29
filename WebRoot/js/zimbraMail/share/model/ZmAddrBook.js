/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
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
function ZmAddrBook(id, name, parent, tree, color, owner, zid, rid, restUrl) {
	ZmFolder.call(this, id, name, parent, tree, null, null, null, owner, zid, rid, restUrl);
	this.type = ZmOrganizer.ADDRBOOK;
	this.color = color || ZmAddrBook.DEFAULT_COLOR;
};

ZmAddrBook.prototype = new ZmFolder;
ZmAddrBook.prototype.constructor = ZmAddrBook;


// Consts

ZmAddrBook.ID_ADDRESSBOOK = ZmOrganizer.ID_ADDRBOOK; 							// XXX: may not be necessary
ZmAddrBook.DEFAULT_COLOR = ZmOrganizer.C_GRAY;

// Public methods

ZmAddrBook.prototype.toString = 
function() {
	return "ZmAddrBook";
};

ZmAddrBook.prototype.getName = 
function(showUnread, maxLength, noMarkup) {
	var name = this.id == ZmOrganizer.ID_ROOT ? ZmMsg.addressBooks : this.name;
	return this._markupName(name, showUnread, noMarkup);
};

ZmAddrBook.prototype.getIcon = 
function() {
	var icon;

	if (this.id == ZmFolder.ID_ROOT)			icon = null;
	else if (this.id == ZmFolder.ID_TRASH)		icon = "Trash";
	else if (this.link)							icon = "SharedContactsFolder";
	else if (this.id == ZmFolder.ID_AUTO_ADDED)	icon = "EmailedContacts";
	else										icon = "ContactsFolder";

	return icon;
};

ZmAddrBook.prototype.create =
function(name, color) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", AjxEnv.isSafari ? AjxStringUtil.xmlEncode(name) : name);
	folderNode.setAttribute("l", this.id);
	folderNode.setAttribute("color", color || ZmAddrBook.DEFAULT_COLOR);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]);

	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [name]);
	var appController = this.tree._appCtxt.getAppController();
	appController.sendRequest({soapDoc:soapDoc, asyncMode:true, errorCallback:errorCallback});
};

ZmAddrBook.prototype._handleErrorCreate =
function(name, ex) {
	if (name && ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		var msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [name]);
	
		var msgDialog = this.tree._appCtxt.getMsgDialog();
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

	if (what instanceof ZmAddrBook) {
		// allow non-system folders in Trash to be dragged ONLY to root OR
		// allow non-system folders not in Trash to be dragged into ONLY Trash
		return (what.isInTrash() && this.id == ZmFolder.ID_ROOT) ||
			   (!what.isInTrash() && this.id == ZmFolder.ID_TRASH);
	} else {
		var invalid = false;

		if (this.id == ZmOrganizer.ID_ROOT) {
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
						var tree = this.tree.getById(items[i].folderId);
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
};


// Callbacks

ZmAddrBook.prototype.notifyCreate =
function(obj) {
	// ignore creates of system folders
	if (obj.id < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.ADDRBOOK]) return;

	var ab = ZmAddrBook.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(ab, ZmAddrBook.sortCompare);
	this.children.add(ab, index);
	ab._notify(ZmEvent.E_CREATE);
};


// Static methods

ZmAddrBook.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;

	// create addrbook, populate, and return
	var ab = new ZmAddrBook(obj.id, obj.name, parent, tree, obj.color, obj.owner, obj.zid, obj.rid, obj.rest);
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK])
			{
				var childAB = ZmAddrBook.createFromJs(ab, folder, tree);
				ab.children.add(childAB);
			} else if (folder.id == ZmOrganizer.ID_TRASH) {
				// get trash folder from cache and add it instead of creating new one
				ab.children.add(tree._appCtxt.cacheGet(ZmOrganizer.ID_TRASH));
			}
		}
	}

	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]) {
				var childAB = ZmAddrBook.createFromJs(ab, link, tree);
				ab.children.add(childAB);
			}
		}
	}

	// set shares
	ab._setSharesFromJs(obj);
	
	return ab;
};

ZmAddrBook.sortCompare = 
function(addrBookA, addrBookB) {
	var check = ZmOrganizer.checkSortArgs(addrBookA, addrBookB);
	if (check != null) return check;

	// links appear after personal address books
	if (addrBookA.link != addrBookB.link) {
		return addrBookA.link ? 1 : -1;
	}

	// trash folder should always go last w/in personal addrbooks
	if (addrBookA.id == ZmFolder.ID_TRASH) return 1;
	if (addrBookB.id == ZmFolder.ID_TRASH) return -1;

	// sort by calendar name
	var addrBookAName = addrBookA.name.toLowerCase();
	var addrBookBName = addrBookB.name.toLowerCase();
	if (addrBookAName < addrBookBName) return -1;
	if (addrBookAName > addrBookBName) return 1;
	return 0;
};
