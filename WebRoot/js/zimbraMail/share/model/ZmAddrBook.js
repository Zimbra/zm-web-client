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
* @param link		[boolean]		true means this address book is a share
* @param owner		[string]*		owner of the address book (if shared)
* @param zid 		[string]*		the share ID of a shared addrbook
* @param rid		[string]*		the remote folder id of a shared addrbook
*/
function ZmAddrBook(id, name, parent, tree, color, link, owner, zid, rid) {
	ZmFolder.call(this, id, name, parent, tree);
	this.type = ZmOrganizer.ADDRBOOK;
	this.link = link;
	this.owner = owner;
	this.zid = zid;
	this.rid = rid;
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
function() {
	return this.id == ZmOrganizer.ID_ROOT ? ZmMsg.addressBooks : this.name;
};

ZmAddrBook.prototype.getIcon = 
function() {
	var icon;

	if (this.id == ZmOrganizer.ID_ROOT)
		icon = null;
	else if (this.id == ZmOrganizer.ID_TRASH)
		icon = "Trash";
	else if (this.link)
		icon = "SharedContactsFolder";
	else
		icon = "ContactsFolder";

	return icon;
};

ZmAddrBook.prototype.getById =
function(id) {
	if (this.link) {
		var ids = id.split(":");
		if (this.zid == ids[0] && this.rid == ids[1])
			return this;
	}

	return ZmFolder.prototype.getById.call(this, id);
};

ZmAddrBook.prototype.create =
function(name, color) {
	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	folderNode.setAttribute("l", this.id);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]);

	var respCallback = new AjxCallback(this, this._handleResponseCreate, [color]);
	var errorCallback = new AjxCallback(this, this._handleErrorCreate, [name]);
	this.tree._appCtxt.getAppController().sendRequest({soapDoc:soapDoc, asyncMode:true, callback:respCallback, errorCallback:errorCallback});
};

ZmAddrBook.prototype._handleResponseCreate =
function(color, result) {
	var response = result.getResponse();
	var id = response.CreateFolderResponse.folder[0].id;
	var addrbook = this.tree._appCtxt.cacheGet(id);
	addrbook.setColor(color);
};

ZmAddrBook.prototype._handleErrorCreate =
function(name, ex) {
	if (name && ex.code == ZmCsfeException.MAIL_ALREADY_EXISTS) {
		var msg = AjxMessageFormat.format(ZmMsg.errorAlreadyExists, [ZmMsg.folderLc, name]);
	
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

	var invalid = false;

	if (what instanceof ZmAddrBook) {
		invalid = (what.parent == this || 
				   this.isChildOf(what) ||
				   what.id == this.id);
	} else {
		// An item or an array of items is being moved
		var items = (what instanceof Array) ? what : [what];
		var item = items[0];
		if (this.id == ZmOrganizer.ID_ROOT) {
			invalid = true;		// container can only have folders/searches
		} else if (item.type != ZmItem.CONTACT) {
			invalid = true;		// only contacts are valid for addr books.
		} else if ((item.type == ZmItem.CONTACT) && item.isGal) {
			invalid = true;		// cannot drag a gal to addr book (at least not for now)
		} else {
			// can't move items to folder they're already in; we're okay if we 
			// have one item from another folder
			if (!invalid) {
				if (items[0].folderId) {
					invalid = true;
					for (var i = 0; i < items.length; i++) {
						if (items[i].folderId != this.id) {
							invalid = false;
							break;
						}
					}
				}
			}
		}
	}

	return !invalid;
};


// Callbacks

ZmAddrBook.prototype.notifyCreate =
function(obj, link) {
	// ignore creates of system folders
	if (obj.id < ZmOrganizer.FIRST_USER_ID[ZmOrganizer.ADDRBOOK]) return;

	var ab = ZmAddrBook.createFromJs(this, obj, this.tree, link);
	var index = ZmOrganizer.getSortIndex(ab, ZmAddrBook.sortCompare);
	this.children.add(ab, index);
	ab._notify(ZmEvent.E_CREATE);
};


// Static methods

ZmAddrBook.createFromJs =
function(parent, obj, tree, link) {
	if (!(obj && obj.id)) return;

	// create addrbook, populate, and return
	var ab = new ZmAddrBook(obj.id, obj.name, parent, tree, obj.color, link, obj.d, obj.zid, obj.rid);
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK] ||
				folder.id == ZmOrganizer.ID_TRASH)
			{
				var childAB = ZmAddrBook.createFromJs(ab, folder, tree, false);
				ab.children.add(childAB);
			}
		}
	}

	if (obj.link && obj.link.length) {
		for (var i = 0; i < obj.link.length; i++) {
			var link = obj.link[i];
			if (link.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]) {
				var childAB = ZmAddrBook.createFromJs(ab, link, tree, true);
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
