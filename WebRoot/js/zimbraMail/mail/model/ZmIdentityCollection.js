/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates the identity collection.
 * @class
 * This class represents the identity collection
 * 
 * @extends		ZmModel
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

ZmIdentityCollection.prototype.toString =
function() {
	return "ZmIdentityCollection";
};

//
// Public methods
//

/**
 * Gets the count of identities.
 * 
 * @return	{int}		the size
 */
ZmIdentityCollection.prototype.getSize =
function() {
	// bug: 30009
	return this.getIdentities().length;
};

/**
 * Gets the identities.
 * 
 * @param	{Object}	sort		(not used)
 * @return	{Array}		an array of {ZmIdentity} objects
 */
ZmIdentityCollection.prototype.getIdentities =
function(sort) {
	var identity, i = 0, result = [], isOffline = appCtxt.isOffline;
	for (var id in this._idToIdentity) {
		identity = this._idToIdentity[id];
		// bug: 30009
		if (isOffline && identity.isFromDataSource) continue;
		result[i++] = identity;
	}
	if (sort) {
		result.sort(ZmIdentityCollection._comparator);
	}
	return result;
};

/**
 * Gets the identity by id.
 * 
 * @param	{String}	id	the identity id
 * @return	{ZmIdentity}	the identity
 */
ZmIdentityCollection.prototype.getById =
function(id) {
	return this._idToIdentity[id];
};

/**
 * Gets the identity by name.
 * 
 * @param	{String}	name		the identity name
 * @return	{ZmIdentity}	the identity
 */
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

/**
 * Adds the identity to the collection.
 * 
 * @param	{ZmIdentity}	identity		the identity
 */
ZmIdentityCollection.prototype.add =
function(identity) {
	if (!this._idToIdentity[identity.id]) {
		this._idToIdentity[identity.id] = identity;
		if (identity.isDefault) {
			this.defaultIdentity = identity;
		}

		this._addToMaps(identity);
		this._size++;
	}
};

/**
 * Removes the identity from the collection.
 * 
 * @param	{ZmIdentity}	identity		the identity
 */
ZmIdentityCollection.prototype.remove =
function(identity) {
	if (this._idToIdentity[identity.id]) {
		this._removeFromMaps(identity);
		delete this._idToIdentity[identity.id];
		this._size--;
	}
};
/**
 * try to find the persona to use from the rules defined in the accounts settings. Recurse to parent so to apply rules to sub-folders too.
 * @param folderId
 * @returns {*}
 */
ZmIdentityCollection.prototype.selectIdentityFromFolder =
function(folderId) {
	if (!folderId) {
		return this.defaultIdentity;
	}
	var folder = appCtxt.getById(folderId);
	var parent = folder.parent;
	return this._folderToIdentity[folder.getRemoteId()] || this.selectIdentityFromFolder(parent && parent.id);
};

ZmIdentityCollection.prototype.selectIdentity =
function(mailMsg, type) {
	if (!appCtxt.get(ZmSetting.IDENTITIES_ENABLED) || !mailMsg) {
		return this.defaultIdentity;
	}

	// Check if the a identity's address was in the given type field.
	if (type) {
		return this._selectIdentityFromAddresses(mailMsg, type);
	}

	// Check if the a identity's address was in the to field.
	var identity = this._selectIdentityFromAddresses(mailMsg, AjxEmailAddress.TO);
	if (identity) { return identity; }

	// Check if the a identity's address was in the cc field.
	identity = this._selectIdentityFromAddresses(mailMsg, AjxEmailAddress.CC);
	if (identity) { return identity; }

    //Check if a identity's address was in the attendees list
    if(mailMsg.isInvite()) {
        identity = this._selectIdentityFromAttendees(mailMsg);
        if (identity) { return identity; }
    }

	// Check if a identity's folder is the same as where the message lives.
	return this.selectIdentityFromFolder(mailMsg.folderId);
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

//
// Protected methods
//

ZmIdentityCollection.prototype._addToMaps =
function(identity) {
	if (identity.useWhenSentTo) {
		var addresses = identity.whenSentToAddresses;
		for (var i = 0, count = addresses.length; i < count; i++) {
			var address = addresses[i].toLowerCase();
			// External emails are added after other identities, potentially overwriting a persona which should have
			// precedence.  Use the external identity only if the email address has not been assigned an identity.
			if (!this._addressToIdentity[address] || !identity.isFromDataSource) {
				this._addressToIdentity[address] = identity;
			}
		}
	}

	if (identity.useWhenInFolder) {
		var folders = identity.whenInFolderIds;
		for (var i = 0, count = folders.length; i < count; i++) {
			var folder = appCtxt.getById(folders[i]);
			if (folder) {
				var fid = folder.getRemoteId();
				this._folderToIdentity[fid] = identity;
			}
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
		var folder = appCtxt.getById(identity.whenInFolderIds[i]);
		if (folder) {
			var fid = folder.getRemoteId();
			delete this._folderToIdentity[fid];
		}
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

ZmIdentityCollection.prototype.getSortIndex =
function(identity) {

	var identities = this.getIdentities(true);
	if (!(identities && identities.length)) { return 0; }

	if (this.getById(identity.id)) {
		// already have the identity, find its current position
		for (var i = 0; i < identities.length; i++) {
			if (identities[i].id == identity.id) {
				return i;
			}
		}
	} else {
		// hasn't been added yet, find where it should go
		for (var i = 0; i < identities.length; i++) {
			var test = ZmIdentityCollection._comparator(identity, identities[i]);
			if (test == -1) {
				return i;
			}
		}
	}
	return identities.length - 1;
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

/**
 * Gets the identity based on attendees list
 *
 * @param	{ZmMailMsg}	    mail msg which is an invitation, passing non-invite mail msg will return null
 * @return	{ZmIdentity}	the identity
 */
ZmIdentityCollection.prototype._selectIdentityFromAttendees =
function(mailMsg) {

    if(!mailMsg.isInvite()) return null;

	var identity;
    var attendees = mailMsg.invite.getAttendees();

    if(!attendees) return null;
    
	for (var i = 0, count = attendees.length; i < count; i++) {
		var address = attendees[i].url;
		if (address) {
			identity = this._addressToIdentity[address.toLowerCase()];
			if(identity) {
				return identity;
			}
		}
	}
    
	return null;
};

ZmIdentityCollection.prototype.getIdentityBySendAddress =
function(address) {
    for(var id in this._idToIdentity){
        var identity = this._idToIdentity[id];
        if(identity.sendFromAddress == address){
            return identity;
        }
    }
    return null;
};
