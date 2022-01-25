/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact list class.
 * 
 */

/**
 * Create a new, empty contact list.
 * @class
 * This class represents a list of contacts. In general, the list is the result of a
 * search. It may be the result of a <code>&lt;GetContactsRequest&gt;</code>, which returns all of the user's
 * local contacts. That list is considered to be canonical.
 * <p>
 * Loading of all local contacts has been optimized by delaying the creation of {@link ZmContact} objects until
 * they are needed. That has a big impact on IE, and not much on Firefox. Loading a subset
 * of attributes did not have much impact on load time, probably because a large majority
 * of contacts contain only those minimal fields.</p>
 *
 * @author Conrad Damon
 *
 * @param {ZmSearch}	search	the search that generated this list
 * @param {Boolean}	isGal		if <code>true</code>, this is a list of GAL contacts
 * @param {constant}	type		the item type
 * 
 * @extends		ZmList
 */
ZmContactList = function(search, isGal, type) {

	if (arguments.length == 0) { return; }
	type = type || ZmItem.CONTACT;
	ZmList.call(this, type, search);

	this.isGal = (isGal === true);
	this.isCanonical = false;
	this.isLoaded = false;

	this._app = appCtxt.getApp(ZmApp.CONTACTS);
	if (!this._app) { 
		this._emailToContact = this._phoneToContact = {};
		return;
	}
	this._emailToContact = this._app._byEmail;
	this._phoneToContact = this._app._byPhone;

	this._alwaysUpdateHashes = true; // Should we update the phone & IM fast-lookup hashes even when account features don't require it? (bug #60411)
};

ZmContactList.prototype = new ZmList;
ZmContactList.prototype.constructor = ZmContactList;

ZmContactList.prototype.isZmContactList = true;
ZmContactList.prototype.toString = function() { return "ZmContactList"; };




// Constants

// Support for loading user's local contacts from a large string

ZmContactList.URL = "/Contacts";	// REST URL for loading user's local contacts
ZmContactList.URL_ARGS = { fmt: 'cf', t: 2, all: 'all' }; // arguments for the URL above
ZmContactList.CONTACT_SPLIT_CHAR	= '\u001E';	// char for splitting string into contacts
ZmContactList.FIELD_SPLIT_CHAR		= '\u001D';	// char for splitting contact into fields
// fields that belong to a contact rather than its attrs
ZmContactList.IS_CONTACT_FIELD = {"id":true, "l":true, "d":true, "fileAsStr":true, "rev":true};



/**
 * @private
 */
ZmContactList.prototype.addLoadedCallback =
function(callback) {
	if (this.isLoaded) {
		callback.run();
		return;
	}
	if (!this._loadedCallbacks) {
		this._loadedCallbacks = [];
	}
	this._loadedCallbacks.push(callback);
};

/**
 * @private
 */
ZmContactList.prototype._finishLoading =
function() {
	DBG.timePt("done loading " + this.size() + " contacts");
	this.isLoaded = true;
	if (this._loadedCallbacks) {
		var callback;
		while (callback = this._loadedCallbacks.shift()) {
			callback.run();
		}
	}
};

/**
 * Retrieves the contacts from the back end, and parses the response. The list is then sorted.
 * This method is used only by the canonical list of contacts, in order to load their content.
 * <p>
 * Loading a minimal set of attributes did not result in a significant performance gain.
 * </p>
 * 
 * @private
 */
ZmContactList.prototype.load =
function(callback, errorCallback, accountName) {
	// only the canonical list gets loaded
	this.isCanonical = true;
	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	DBG.timePt("requesting contact list", true);
    if(appCtxt.isExternalAccount()) {
        //Do not make a call in case of external user
        //The rest url constructed wont exist in case of external user
        if (callback) {
		    callback.run();
	    }
        return;
    }
	var args = ZmContactList.URL_ARGS;

	// bug 74609: suppress overzealous caching by IE
	if (AjxEnv.isIE) {
		args = AjxUtil.hashCopy(args);
		args.sid = ZmCsfeCommand.getSessionId();
	}

	var params = {asyncMode:true, noBusyOverlay:true, callback:respCallback, errorCallback:errorCallback, offlineCallback:callback};
	params.restUri = AjxUtil.formatUrl({
		path:["/home/", (accountName || appCtxt.getUsername()),
	          ZmContactList.URL].join(""),
	    qsArgs: args, qsReset:true
	});
	DBG.println(AjxDebug.DBG1, "loading contacts from " + params.restUri);
	appCtxt.getAppController().sendRequest(params);

	// wait for Contacts package to be loaded
	AjxDispatcher.addPackageLoadFunction("Contacts", new AjxCallback(this, this._loadSharedFolders));

	ZmContactList.addDlFolder();
	
};

ZmContactList.prototype._loadSharedFolders =
function() {
	DBG.println(AjxDebug.DBG1, "loading sharing folders in Contacts");
	var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
	var sharingFolder = [];
	appCtxt.getSharedFolders(root, ZmOrganizer.ADDRBOOK, sharingFolder);
	if (sharingFolder.length) {
		var query = "";
		for (var i = 0; i < sharingFolder.length; i++) {
			query += sharingFolder[i].createQuery() + " or ";
		}
		query = query.replace(/\sor\s$/, '');
		var sc = appCtxt.getSearchController();
		sc.setDefaultSearchType(ZmItem.CONTACT);
		var params = {
			query: query,
			searchFor: ZmItem.CONTACT,
			fetch: true,
			sortBy: ZmSearch.NAME_ASC,
			callback: null,
			noRender: true
		};
		sc.search(params);
	}
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseLoad =
function(callback, result) {
	DBG.timePt("got contact list");
	var text = result.getResponse();
    if (text && typeof text !== 'string'){
        text = text._data;
    }
	var derefList = [];
	if (text) {
		var contacts = text.split(ZmContactList.CONTACT_SPLIT_CHAR);
		var derefBatchCmd = new ZmBatchCommand(true, null, true);
		for (var i = 0, len = contacts.length; i < len; i++) {
			var fields = contacts[i].split(ZmContactList.FIELD_SPLIT_CHAR);
			var contact = {}, attrs = {};
			var groupMembers = [];
			var foundDeref = false;
			for (var j = 0, len1 = fields.length; j < len1; j += 2) {
				if (ZmContactList.IS_CONTACT_FIELD[fields[j]]) {
					contact[fields[j]] = fields[j + 1];
				} else {
					var value = fields[j+1];
					switch (fields[j]) {
						case ZmContact.F_memberC:
							groupMembers.push({type: ZmContact.GROUP_CONTACT_REF, value: value});
							foundDeref = true; //load shared contacts
							break;
						case ZmContact.F_memberG:
							groupMembers.push({type: ZmContact.GROUP_GAL_REF, value: value});
							foundDeref = true;
							break;
						case ZmContact.F_memberI:
							groupMembers.push({type: ZmContact.GROUP_INLINE_REF, value: value});
							foundDeref = true;
							break;
						default:
							attrs[fields[j]] = value;
					}
				}
			}
			if (attrs[ZmContact.F_type] === "group") { //set only for group.
				attrs[ZmContact.F_groups] = groupMembers;
			}
			if (foundDeref) {
				//batch group members for deref loading
				var dummy = new ZmContact(contact["id"], this);
				derefBatchCmd.add(new AjxCallback(dummy, dummy.load, [null, null, derefBatchCmd, true]));
			}
			contact._attrs = attrs;
			this._addContact(contact);
		}
		derefBatchCmd.run();
	}

	this._finishLoading();

	if (callback) {
		callback.run();
	}
};

/**
 * @static
 */
ZmContactList.addDlFolder =
function() {

	if (!appCtxt.get(ZmSetting.DLS_FOLDER_ENABLED)) {
		return;
	}

	var dlsFolder = appCtxt.getById(ZmOrganizer.ID_DLS);

	var root = appCtxt.getById(ZmOrganizer.ID_ROOT);
	if (!root) { return; }

	if (dlsFolder && root.getById(ZmOrganizer.ID_DLS)) {
		//somehow (after a refresh block, can be reprod using $set:refresh. ZmClientCmdHandler.prototype.execute_refresh) the DLs folder object is removed from under the root (but still cached in appCtxt). So making sure it's there.
		return;
	}

	if (!dlsFolder) {
		var params = {
			id: ZmOrganizer.ID_DLS,
			name: ZmMsg.distributionLists,
			parent: root,
			tree: root.tree,
			type: ZmOrganizer.ADDRBOOK,
			numTotal: null, //we don't know how many
			noTooltip: true //so don't show tooltip
		};

		dlsFolder = new ZmAddrBook(params);
		root.children.add(dlsFolder);
		dlsFolder._isDL = true;
	}
	else {
		//the dls folder object exists but no longer as a child of the root.
		dlsFolder.parent = root;
		root.children.add(dlsFolder); //any better way to do this?
	}

};

ZmContactList.prototype.add = 
function(item, index) {
	if (!item.id || !this._idHash[item.id]) {
		this._vector.add(item, index);
		if (item.id) {
			this._idHash[item.id] = item;
		}
		this._updateHashes(item, true);
	}
};

ZmContactList.prototype.cache = 
function(offset, newList) {
	var getId = function(){
		return this.id;
	}
	var exists = function(obj) {
		return this._vector.containsLike(obj, getId);
	}
	var unique = newList.sub(exists, this);

	this.getVector().merge(offset, unique);
	// reparent each item within new list, and add it to ID hash
	var list = unique.getArray();
	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		item.list = this;
		if (item.id) {
			this._idHash[item.id] = item;
		}
	}
};

/**
 * @private
 */
ZmContactList.prototype._addContact =
function(contact) {

	// note that we don't create a ZmContact here (optimization)
	contact.list = this;
	this._updateHashes(contact, true);
	var fn = [], fl = [];
	if (contact._attrs[ZmContact.F_firstName])	{ fn.push(contact._attrs[ZmContact.F_firstName]); }
	if (contact._attrs[ZmContact.F_middleName])	{ fn.push(contact._attrs[ZmContact.F_middleName]); }
	if (contact._attrs[ZmContact.F_lastName])	{ fn.push(contact._attrs[ZmContact.F_lastName]); }
	if (fn.length) {
		contact._attrs[ZmContact.X_fullName] = fn.join(" ");
	}
	if (contact._attrs[ZmContact.F_firstName])	{ fl.push(contact._attrs[ZmContact.F_firstName]); }
	if (contact._attrs[ZmContact.F_lastName])	{ fl.push(contact._attrs[ZmContact.F_lastName]); }
	contact._attrs[ZmContact.X_firstLast] = fl.join(" ");

	this.add(contact);
};

/**
 * Converts an anonymous contact object (contained by the JS returned by load request)
 * into a ZmContact, and updates the containing list if it is the canonical one.
 *
 * @param {Object}	contact		a contact
 * @param {int}	idx		the index of contact in canonical list
 * 
 * @private
 */
ZmContactList.prototype._realizeContact =
function(contact, idx) {

	if (contact instanceof ZmContact) { return contact; }
	if (contact && contact.type == ZmItem.CONTACT) { return contact; }	// instanceof often fails in new window

	var args = {list:this};
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	var realContact = obj && obj.createFromDom(contact, args);

	if (this.isCanonical) {
		var a = this.getArray();
		idx = idx || this.getIndexById(contact.id);
		a[idx] = realContact;
		this._updateHashes(realContact, true);
		this._idHash[contact.id] = realContact;
	}

	return realContact;
};

/**
 * Finds the array index for the contact with the given ID.
 *
 * @param {int}	id		the contact ID
 * @return	{int}	the index
 * @private
 */
ZmContactList.prototype.getIndexById =
function(id) {
	var a = this.getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i].id == id) {
			return i;
		}
	}
	return null;
};

/**
 * Override in order to make sure the contacts have been realized. We don't
 * call realizeContact() since this is not the canonical list.
 *
 * @param {int}	offset		the starting index
 * @param {int}	limit		the size of sublist
 * @return	{AjxVector}	a vector of {@link ZmContact} objects
 */
ZmContactList.prototype.getSubList =
function(offset, limit, folderId) {
	if (folderId && this.isCanonical) {
		// only collect those contacts that belong to the given folderId if provided
		var newlist = [];
		var sublist = this.getArray();
		var offsetCount = 0;
		this.setHasMore(false);

		for (var i = 0; i < sublist.length; i++) {
			sublist[i] = this._realizeContact(sublist[i], i);
			var folder = appCtxt.getById(sublist[i].folderId);
			if (folder && folder.nId == ZmOrganizer.normalizeId(folderId)) {
				if (offsetCount >= offset) {
					if (newlist.length == limit) {
						this.setHasMore(true);
						break;
					}
					newlist.push(sublist[i]);
				}
				offsetCount++;
			}
		}

		return AjxVector.fromArray(newlist);
	} else {
		var vec = ZmList.prototype.getSubList.call(this, offset, limit);
		if (vec) {
			var a = vec.getArray();
			for (var i = 0; i < a.length; i++) {
				a[i] = this._realizeContact(a[i], offset + i);
			}
		}

		return vec;
	}
};

/**
 * Override in order to make sure the contact has been realized. Canonical list only.
 *
 * @param {int}	id		the contact ID
 * @return	{ZmContact}	the contact or <code>null</code> if not found
 */
ZmContactList.prototype.getById =
function(id) {
	if (!id || !this.isCanonical) return null;

	var contact = this._idHash[id];
	return contact ? this._realizeContact(contact) : null;
};

/**
 * Gets the contact with the given address, if any (canonical list only).
 *
 * @param {String}	address	an email address
 * @return	{ZmContact}	the contact or <code>null</code> if not found
 */
ZmContactList.prototype.getContactByEmail =
function(address) {
	if (!address || !this.isCanonical) return null;

	var contact = this._emailToContact[address.toLowerCase()];
	if (contact) {
		contact = this._realizeContact(contact);
		contact._lookupEmail = address;	// so caller knows which address matched
		return contact;
	} else {
		return null;
	}
};

/**
 * Gets information about the contact with the given phone number, if any (canonical list only).
 *
 * @param {String}	phone	the phone number
 * @return	{Hash}	an object with <code>contact</code> = the contact & <code>field</code> = the field with the matching phone number
 */
ZmContactList.prototype.getContactByPhone =
function(phone) {
	if (!phone || !this.isCanonical) return null;

	var digits = this._getPhoneDigits(phone);
	var data = this._phoneToContact[digits];
	if (data) {
		data.contact = this._realizeContact(data.contact);
		return data;
	} else {
		return null;
	}
};

/**
 * Moves a list of items to the given folder.
 * <p>
 * This method calls the base class for normal "moves" UNLESS we're dealing w/
 * shared items (or folder) in which case we must send a CREATE request for the
 * given folder to the server followed by a hard delete of the shared contact.
 * </p>
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{Array}       params.items			a list of items to move
 * @param	{ZmFolder}	params.folder		the destination folder
 * @param	{Hash}	       params.attrs		the additional attrs for SOAP command
 * @param	{Boolean}	params.outOfTrash	if <code>true</code>, we are moving contacts out of trash
 */
ZmContactList.prototype.moveItems =
function(params) {

	params = Dwt.getParams(arguments, ["items", "folder", "attrs", "outOfTrash"]);
	params.items = AjxUtil.toArray(params.items);

	var moveBatchCmd = new ZmBatchCommand(true, null, true);
	var loadBatchCmd = new ZmBatchCommand(true, null, true);
	var softMove = [];

	// if the folder we're moving contacts to is a shared folder, then dont bother
	// checking whether each item is shared or not
	if (params.items[0] && params.items[0] instanceof ZmItem) {
		for (var i = 0; i < params.items.length; i++) {
			var contact = params.items[i];

			if (contact.isReadOnly()) { continue; }

			softMove.push(contact);
		}
	} else {
		softMove = params.items;
	}

	// for "soft" moves, handle moving out of Trash differently
	if (softMove.length > 0) {
		var params1 = AjxUtil.hashCopy(params);
		params1.attrs = params.attrs || {};
		var toFolder = params.folder;
		params1.attrs.l = toFolder.isRemote() ? toFolder.getRemoteId() : toFolder.id;
		params1.action = "move";
        params1.accountName = appCtxt.multiAccounts && appCtxt.accountList.mainAccount.name;
        if (params1.folder.id == ZmFolder.ID_TRASH) {
            params1.actionTextKey = 'actionTrash';
            // bug: 47389 avoid moving to local account's Trash folder.
            params1.accountName = appCtxt.multiAccounts && params.items[0].getAccount().name;
        } else {
            params1.actionTextKey = 'actionMove';
            params1.actionArg = toFolder.getName(false, false, true);
        }
		params1.callback = params.outOfTrash && new AjxCallback(this, this._handleResponseMoveItems, params);

		this._itemAction(params1);
	}
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseMoveBatchCmd =
function(result) {
	var resp = result.getResponse().BatchResponse.ContactActionResponse;
	// XXX: b/c the server does not return notifications for actions done on
	//      shares, we manually notify - TEMP UNTIL WE GET BETTER SERVER SUPPORT
	var ids = resp[0].action.id.split(",");
	for (var i = 0; i < ids.length; i++) {
		var contact = appCtxt.cacheGet(ids[i]);
		if (contact && contact.isShared()) {
			contact.notifyDelete();
			appCtxt.cacheRemove(ids[i]);
		}
	}
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseLoadMove =
function(moveBatchCmd, params) {
	var deleteCmd = new AjxCallback(this, this._itemAction, [params]);
	moveBatchCmd.add(deleteCmd);

	var respCallback = new AjxCallback(this, this._handleResponseMoveBatchCmd);
	moveBatchCmd.run(respCallback);
};

/**
 * @private
 */
ZmContactList.prototype._handleResponseBatchLoad =
function(batchCmd, folder, result, contact) {
	batchCmd.add(this._getCopyCmd(contact, folder));
};

/**
 * @private
 */
ZmContactList.prototype._getCopyCmd =
function(contact, folder) {
	var temp = new ZmContact(null, this);
	for (var j in contact.attr) {
		temp.attr[j] = contact.attr[j];
	}
	temp.attr[ZmContact.F_folderId] = folder.id;

	return new AjxCallback(temp, temp.create, [temp.attr]);
};

/**
 * Deletes contacts after checking that this is not a GAL list.
 *
 * @param {Hash}	params		a hash of parameters
 * @param	{Array}	       params.items			the list of items to delete
 * @param	{Boolean}	params.hardDelete	if <code>true</code>, force physical removal of items
 * @param	{Object}	params.attrs			the additional attrs for SOAP command
 */
ZmContactList.prototype.deleteItems =
function(params) {
	if (this.isGal) {
		if (ZmContactList.deleteGalItemsAllowed(params.items)) {
			this._deleteDls(params.items);
			return;
		}
		DBG.println(AjxDebug.DBG1, "Cannot delete GAL contacts that are not DLs");
		return;
	}
	ZmList.prototype.deleteItems.call(this, params);
};

ZmContactList.deleteGalItemsAllowed =
function(items) {
	var deleteDomainsAllowed = appCtxt.createDistListAllowedDomainsMap;
	if (items.length == 0) {
		return false; //need a special case since we don't want to enable the "delete" button for 0 items.
	}
	for (var i = 0; i < items.length; i++) {
		var contact = items[i];
		var email = contact.getEmail();
		var domain = email.split("@")[1];
		var isDL = contact && contact.isDistributionList();
		//see bug 71368 and also bug 79672 - the !contact.dlInfo is in case somehow dlInfo is missing - so unfortunately if that happens (can't repro) - let's not allow to delete since we do not know if it's an owner
		if (!isDL || !deleteDomainsAllowed[domain] || !contact.dlInfo || !contact.dlInfo.isOwner) {
			return false;
		}
	}
	return true;
};

ZmContactList.prototype._deleteDls =
function(items, confirmDelete) {

	if (!confirmDelete) {
		var callback = this._deleteDls.bind(this, items, true);
		this._popupDeleteWarningDialog(callback, false, items.length);
		return;
	}

	var reqs = [];
	for (var i = 0; i < items.length; i++) {
		var contact = items[i];
		var email = contact.getEmail();
		reqs.push({
				_jsns: "urn:zimbraAccount",
				dl: {by: "name",
					 _content: contact.getEmail()
				},
				action: {
					op: "delete"
				}
			});
	}
	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._deleteDlsResponseHandler.bind(this, items);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});

};

ZmContactList.prototype._deleteDlsResponseHandler =
function(items) {
	if (appCtxt.getCurrentView().isZmGroupView) {
		//this is the case we were editing the DL (different than viewing it in the DL list, in which case it's the contactListController).
		//so we now need to pop up the view.
		this.controller.popView();
	}

	appCtxt.setStatusMsg(items.length == 1 ? ZmMsg.dlDeleted : ZmMsg.dlsDeleted);

	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		item.clearDlInfo();
		item._notify(ZmEvent.E_DELETE);
	}
};



/**
 * Sets the is GAL flag.
 * 
 * @param	{Boolean}	isGal		<code>true</code> if contact list is GAL
 */
ZmContactList.prototype.setIsGal =
function(isGal) {
	this.isGal = isGal;
};

ZmContactList.prototype.notifyCreate =
function(node) {
	var obj = eval(ZmList.ITEM_CLASS[this.type]);
	if (obj) {
		var item = obj.createFromDom(node, {list:this});
		var index = this._sortIndex(item);
		// only add if it sorts into this list
		var listSize = this.size();
		var visible = false;
		if (index < listSize || listSize == 0 || (index==listSize && !this._hasMore)) {
			this.add(item, index);
			this.createLocal(item);
			visible = true;
		}
		this._notify(ZmEvent.E_CREATE, {items: [item], sortIndex: index, visible: visible});
	}
};

/**
 * Moves the items.
 * 
 * @param	{Array}	items		an array of {@link ZmContact} objects
 * @param	{String}	folderId	the folder id
 */
ZmContactList.prototype.moveLocal =
function(items, folderId) {
	// don't remove any contacts from the canonical list
	if (!this.isCanonical)
		ZmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId == ZmFolder.ID_TRASH) {
		for (var i = 0; i < items.length; i++) {
			this._updateHashes(items[i], false);
		}
	}
};

/**
 * Deletes the items.
 * 
 * @param	{Array}	items		an array of {@link ZmContact} objects
 */
ZmContactList.prototype.deleteLocal =
function(items) {
	ZmList.prototype.deleteLocal.call(this, items);
	for (var i = 0; i < items.length; i++) {
		this._updateHashes(items[i], false);
	}
};

/**
 * Handle modified contact.
 * 
 * @private
 */
ZmContactList.prototype.modifyLocal =
function(item, details) {
	if (details) {
		// notify item's list
		this._evt.items = details.items = [item];
		this._evt.item = details.contact; //somehow this was set to something obsolete. What a mess. Also note that item is Object while details.contact is ZmContact
		this._notify(ZmEvent.E_MODIFY, details);
	}

	var contact = details.contact;
	if (this.isCanonical || contact.attr[ZmContact.F_email] != details.oldAttr[ZmContact.F_email]) {
		// Remove traces of old contact - NOTE: we pass in null for the ID on
		// PURPOSE to avoid overwriting the existing cached contact
		var oldContact = new ZmContact(null, this);
		oldContact.id = details.contact.id;
		oldContact.attr = details.oldAttr;
		this._updateHashes(oldContact, false);

		// add new contact to hashes
		this._updateHashes(contact, true);
	}

	// place in correct position in list
	if (details.fileAsChanged) {
		this.remove(contact);
		var index = this._sortIndex(contact);
		var listSize = this.size();
		if (index < listSize || listSize == 0 || (index == listSize && !this._hasMore)) {
			this.add(contact, index);
		}
	}

	// reset addrbook property
	if (contact.addrbook && (contact.addrbook.id != contact.folderId)) {
		contact.addrbook = appCtxt.getById(contact.folderId);
	}
};

/**
 * Creates the item local.
 * 
 * @param	{ZmContact}	item		the item
 */
ZmContactList.prototype.createLocal =
function(item) {
	this._updateHashes(item, true);
};

/**
 * @private
 */
ZmContactList.prototype._updateHashes =
function(contact, doAdd) {

	this._app.updateCache(contact, doAdd);

	// Update email hash.
	for (var index = 0; index < ZmContact.EMAIL_FIELDS.length; index++) {
		var field = ZmContact.EMAIL_FIELDS[index];
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(field, i);
			var avalue = ZmContact.getAttr(contact, aname);
			if (!avalue) break;
			if (doAdd) {
				this._emailToContact[avalue.toLowerCase()] = contact;
			} else {
				delete this._emailToContact[avalue.toLowerCase()];
			}
		}
	}

	// Update phone hash.
	if (appCtxt.get(ZmSetting.VOICE_ENABLED) || this._alwaysUpdateHashes) {
		for (var index = 0; index < ZmContact.PHONE_FIELDS.length; index++) {
			var field = ZmContact.PHONE_FIELDS[index];
			for (var i = 1; true; i++) {
				var aname = ZmContact.getAttributeName(field, i);
				var avalue = ZmContact.getAttr(contact, aname);
				if (!avalue) break;
				var digits = this._getPhoneDigits(avalue);
				if (digits) {
					if (doAdd) {
						this._phoneToContact[avalue] = {contact: contact, field: aname};
					} else {
						delete this._phoneToContact[avalue];
					}
				}
			}
		}
	}
};

/**
 * Strips all non-digit characters from a phone number.
 * 
 * @private
 */
ZmContactList.prototype._getPhoneDigits =
function(phone) {
	return phone.replace(/[^\d]/g, '');
};

/**
 * Returns the position at which the given contact should be inserted in this list.
 * 
 * @private
 */
ZmContactList.prototype._sortIndex =
function(contact) {
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		if (ZmContact.compareByFileAs(a[i], contact) > 0) {
			return i;
		}
	}
	return a.length;
};

/**
 * Gets the list ID hash
 * @return idHash {Ojbect} list ID hash
 */
ZmContactList.prototype.getIdHash =
function() {
	return this._idHash;
}

/**
 * @private
 */
ZmContactList.prototype._handleResponseModifyItem =
function(item, result) {
	// NOTE: we overload and do nothing b/c base class does more than we want
	//       (since everything is handled by notifications)
};
