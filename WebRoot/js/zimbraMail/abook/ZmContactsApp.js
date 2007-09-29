/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
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
* Contact app object
* @constructor
* @class
* Description goes here
*
* @author Conrad Damon
* @param appCtxt			The singleton appCtxt object
* @param container			the element that contains everything but the banner (aka _composite)
* @param parentController	Reference to the parent "uber" controller - populated if this is a child window opened by the parent
*/
function ZmContactsApp(appCtxt, container, parentController) {
	ZmApp.call(this, ZmZimbraMail.CONTACTS_APP, appCtxt, container, parentController);
	this._initialized = false;
};

ZmContactsApp.prototype = new ZmApp;
ZmContactsApp.prototype.constructor = ZmContactsApp;

ZmContactsApp.prototype.toString = 
function() {
	return "ZmContactsApp";
};

ZmContactsApp.prototype.launch =
function(callback, errorCallback) {
	var respCallback = new AjxCallback(this, this._handleResponseLaunch, callback);
	this.getContactList(respCallback, errorCallback);
};

ZmContactsApp.prototype._handleResponseLaunch =
function(callback) {
	var clc = this.getContactListController();
	if (!this._initialized) {
		// set search toolbar field manually
		if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
			var folder = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(ZmFolder.ID_CONTACTS);
			var stb = this._appCtxt.getSearchController().getSearchToolbar();
			stb.setSearchFieldValue(folder.createQuery());
		}
		// create contact view for the first time
		clc.show(this._contactList, null, ZmOrganizer.ID_ADDRBOOK);
	} else {
		// just push the view so it looks the same as last you saw it
		clc.switchView(clc._getViewType(), true, this._initialized);
	}

	if (callback)
		callback.run();

	this._initialized = true;
};

ZmContactsApp.prototype.showFolder = 
function(folder) {
	// we manually set search bar's field since contacts dont always make search requests
	if (this._appCtxt.get(ZmSetting.SHOW_SEARCH_STRING)) {
		var query = folder.createQuery();
		this._appCtxt.getSearchController().getSearchToolbar().setSearchFieldValue(query);
	}
	this.getContactListController().show(this._contactList, null, folder.id);
};

ZmContactsApp.prototype.setActive =
function(active) {
	if (active)
		this.getContactListController().show();
};

ZmContactsApp.prototype.getContactList =
function(callback, errorCallback) {
	if (!this._contactList) {
		try {
			// check if a parent controller exists and ask it for the contact list
			if (this._parentController) {
				this._contactList = this._parentController.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
			} else {
				this._contactList = new ZmContactList(this._appCtxt);
				var respCallback = new AjxCallback(this, this._handleResponseGetContactList, callback);
				this._contactList.load(respCallback, errorCallback);
			}
		} catch (ex) {
			this._contactList = null;
			throw ex;
		}
	} else {
		if (callback) callback.run();
	}
	if (!callback) return this._contactList;
};

ZmContactsApp.prototype._handleResponseGetContactList =
function(callback) {
	if (callback) callback.run();
};

// NOTE: calling method should handle exceptions!
ZmContactsApp.prototype.getGalContactList =
function() {
	if (!this._galContactList) {
		try {
			this._galContactList = new ZmContactList(this._appCtxt, null, true);
			this._galContactList.load();
		} catch (ex) {
			this._galContactList = null;
			throw ex;
		}
	}
	return this._galContactList;
};

// returns array of all addrbooks (incl. shared but excl. root and Trash)
ZmContactsApp.prototype.getAddrbookList =
function() {
	var addrbookList = [];
	var folders = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).asList();
	for (var i = 0; i < folders.length; i++) {
		if (folders[i].id == ZmFolder.ID_ROOT || folders[i].isInTrash())
			continue;
		addrbookList.push(folders[i].createQuery());
	}
	return addrbookList;
};

ZmContactsApp.prototype.createFromVCard =
function(msgId, vcardPartId) {
	var contact = new ZmContact(this._appCtxt);
	contact.createFromVCard(msgId, vcardPartId);
};

ZmContactsApp.prototype.getContactListController =
function() {
	if (!this._contactListController)
		this._contactListController = new ZmContactListController(this._appCtxt, this._container, this);
	return this._contactListController;
};

ZmContactsApp.prototype.getContactController =
function() {
	if (this._contactController == null)
		this._contactController = new ZmContactController(this._appCtxt, this._container, this);
	return this._contactController;
};
