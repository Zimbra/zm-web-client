/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007 Zimbra, Inc.
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

ZmIdentityCollection = function() {
	ZmModel.call(this, ZmEvent.S_IDENTITY);
	this.defaultIdentity = null;
	this._initialized = false;
	this._idToIdentity = {};
	this._addressToIdentity = {};
	this._folderToIdentity = {};
	this._size = 0;
};

ZmIdentityCollection.prototype = new ZmModel;
ZmIdentityCollection.prototype.constructor = ZmIdentityCollection;

ZmIdentityCollection.prototype.toString = function() {
	return "ZmIdentityCollection";
};

//
// Public methods
//

ZmIdentityCollection.prototype.getSize =
function() {
	return this._size;
};

ZmIdentityCollection.prototype.getIdentities =
function(sort) {
	var i = 0;
	var result = [];
	for (var id in this._idToIdentity) {
		result[i++] = this._idToIdentity[id];
	}
	if (sort) {
		result.sort(ZmIdentityCollection._comparator);
	}
	return result;
};

ZmIdentityCollection.prototype.getById =
function(id) {
	return this._idToIdentity[id];
};

ZmIdentityCollection.prototype.getByName =
function(name) {
	name = name.toLowerCase();
	for (var id in this._idToIdentity) {
		var identity = this._idToIdentity[id];
		if (identity.name.toLowerCase() == name) {
			return identity;
		}
	}
	return null;
};

ZmIdentityCollection.prototype.add =
function(identity) {
	if (!this._idToIdentity[identity.id]) {
		this._idToIdentity[identity.id] = identity;
		if (identity.isDefault) {
			this.defaultIdentity = identity;
		}

		this._addToMaps(identity);
		this._size++;
		this._notify(ZmEvent.E_CREATE, { item: identity } );
	}
};

ZmIdentityCollection.prototype.remove =
function(identity) {
	if (this._idToIdentity[identity.id]) {
		this._removeFromMaps(identity);
		delete this._idToIdentity[identity.id];
		this._size--;
		this._notify(ZmEvent.E_DELETE, { item: identity } );
	}
};

ZmIdentityCollection.prototype.selectIdentity =
function(mailMsg) {
	if (!appCtxt.get(ZmSetting.IDENTITIES_ENABLED)) {
		return this.defaultIdentity;
	}

	if (!mailMsg) {
		return this.defaultIdentity;
	}

	// Check if the a identity's address was in the to field.
	var identity = this._selectIdentityFromAddresses(mailMsg, AjxEmailAddress.TO);
	if (identity) {
		return identity;
	}

	// Check if the a identity's address was in the cc field.
	identity = this._selectIdentityFromAddresses(mailMsg, AjxEmailAddress.CC);
	if (identity) {
		return identity;
	}

	// Check if a identity's folder is the same as where the message lives.
	var folder = mailMsg.folderId;
	identity = this._folderToIdentity[folder];
	if(identity) {
		return identity;
	}

	return this.defaultIdentity;
};

ZmIdentityCollection.prototype.initialize =
function(data) {
	// This can be called unnecessarily after auth token expires.
	if (this._initialized || this.getSize() || !data) { return; }

	var identities = data.identity;
	for (var i = 0, count = identities ? identities.length : 0; i < count; i++) {
		var identity = new ZmIdentity('');
		identity._loadFromDom(identities[i]);
		this.add(identity);
	}
	this._initialized = true;
};

ZmIdentityCollection.prototype.notifyModify =
function(identity, isRename) {
	this._notify(ZmEvent.E_MODIFY, { item: identity, rename: isRename } );
};

//
// Protected methods
//

ZmIdentityCollection.prototype._addToMaps =
function(identity) {
	if (identity.useWhenSentTo) {
		var addresses = identity.whenSentToAddresses;
		for (var i = 0, count = addresses.length; i < count; i++) {
			var address = addresses[i].toLowerCase();
			this._addressToIdentity[address] = identity;
		}
	}

	if (identity.useWhenInFolder) {
		var folders = identity.whenInFolderIds;
		for (var i = 0, count = folders.length; i < count; i++) {
			this._folderToIdentity[folders[i]] = identity;
		}
	}
};

ZmIdentityCollection.prototype._removeFromMaps =
function(identity) {
	for (var i = 0, count = identity.whenSentToAddresses.length; i < count; i++) {
		var address = identity.whenSentToAddresses[i];
		delete this._addressToIdentity[address];
	}

	for (var i = 0, count = identity.whenInFolderIds.length; i < count; i++) {
		var folderId = identity.whenInFolderIds[i];
		delete this._folderToIdentity[folderId];
	}
};

ZmIdentityCollection._comparator =
function(a, b) {
	if (a.isDefault) {
		return -1;
	} else if (b.isDefault) {
		return 1;
	} else {
		return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
	}
};

ZmIdentityCollection.prototype._selectIdentityFromAddresses =
function(mailMsg, type) {
	var identity;
	var addresses = mailMsg.getAddresses(type).getArray();
	for (var i = 0, count = addresses.length; i < count; i++) {
		var address = addresses[i].getAddress();
		if (address) {
			identity = this._addressToIdentity[address.toLowerCase()];
			if(identity) {
				return identity;
			}
		}
	}
	return null;
};
