/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
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
* @param owner		[string]*		owner of the address book (if shared)
*/
function ZmAddrBook(id, name, parent, tree, owner) {
	ZmOrganizer.call(this, ZmOrganizer.CALENDAR, id, name, parent, tree, null, null, null, owner);
};

ZmAddrBook.prototype = new ZmOrganizer;
ZmAddrBook.prototype.constructor = ZmAddrBook;


// Consts

ZmAddrBook.ID_ADDRESSBOOK = ZmOrganizer.ID_ADDRBOOK; 							// XXX: may not be necessary


// Public methods

ZmAddrBook.prototype.toString = 
function() {
	return "ZmAddrBook";
};

ZmAddrBook.prototype.getName = 
function() {
	return this.id == ZmOrganizer.ID_ROOT ? ZmMsg.addressBooks : this.name;
};

// XXX: need Address Book "folder" icon
ZmAddrBook.prototype.getIcon = 
function() {
	return this.id == ZmOrganizer.ID_ROOT 
		? null
		: "ContactsApp";
};

// XXX: temp method until we get better server support post Birdseye!
ZmAddrBook.prototype.setPermissions = 
function(permission) {
	var share = null;
	if (this.shares == null) {
		share = new ZmOrganizerShare(this, null, null, null, permission, null);
		this.addShare(share);
	} else {
		// lets just assume we're dealing w/ a link (which should only have one share)
		this.shares[0].perm = permission;
	}
};


// Callbacks

ZmAddrBook.prototype.notifyCreate =
function(obj, link) {
	var ab = ZmAddrBook.createFromJs(this, obj, this.tree);
	var index = ZmOrganizer.getSortIndex(ab, ZmAddrBook.sortCompare);
	this.children.add(calendar, index);
	ab._notify(ZmEvent.E_CREATE);
};

/*

// TODO - figure out how this will work

ZmAddrBook.prototype.notifyModify =
function(obj) {
	ZmOrganizer.prototype.notifyModify.call(this, obj);

	var doNotify = false;
	var fields = new Object();
	if (obj.excludeFreeBusy != null && this.excludeFreeBusy != obj.excludeFreeBusy) {
		this.excludeFreeBusy = obj.excludeFreeBusy;
		// TODO: Should a F_EXCLUDE_FB property be added to ZmOrganizer?
		//       It doesn't make sense to require the base class to know about
		//       all the possible fields in sub-classes. So I'm just using the
		//       modified property name as the key.
		fields["excludeFreeBusy"] = true;
		doNotify = true;
	}
	
	if (doNotify)
		this._notify(ZmEvent.E_MODIFY, {fields: fields});
};
*/

// Static methods

/** Caller is responsible to catch exception. */
ZmAddrBook.create =
function(appCtxt, name, parentFolderId) {
	parentFolderId = parentFolderId || ZmOrganizer.ID_ROOT;

	var soapDoc = AjxSoapDoc.create("CreateFolderRequest", "urn:zimbraMail");
	var folderNode = soapDoc.set("folder");
	folderNode.setAttribute("name", name);
	folderNode.setAttribute("l", parentFolderId);
	folderNode.setAttribute("view", ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]);

	// XXX: why are we doing this synchronously?
	return appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: false});
};

ZmAddrBook.createFromJs =
function(parent, obj, tree) {
	if (!(obj && obj.id)) return;

	// create calendar, populate, and return
	var ab = new ZmAddrBook(obj.id, obj.name, parent, tree, obj.d);
	if (obj.folder && obj.folder.length) {
		for (var i = 0; i < obj.folder.length; i++) {
			var folder = obj.folder[i];
			if (folder.view == ZmOrganizer.VIEWS[ZmOrganizer.ADDRBOOK]) {
				var childAB = ZmAddrBook.createFromJs(ab, folder, tree);
				ab.children.add(childAB);
			}
		}
	}

	// set shares
	ab._setSharesFromJs(obj);
	
	return ab;
};

ZmAddrBook.checkName =
function(name) {
	return ZmOrganizer.checkName(name);
};

ZmAddrBook.sortCompare = 
function(addrBookA, addrBookB) {
	var check = ZmOrganizer.checkSortArgs(addrBookA, addrBookB);
	if (check != null) return check;

	// sort by calendar name
	var addrBookAName = addrBookA.name.toLowerCase();
	var addrBookBName = addrBookB.name.toLowerCase();
	if (addrBookAName < addrBookBName) return -1;
	if (addrBookAName > addrBookBName) return 1;
	return 0;
};
