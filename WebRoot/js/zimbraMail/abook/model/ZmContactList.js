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
* Create a new, empty contact list.
* @constructor
* @class
* This class represents a list of contacts. It may be a user contact list, or the
* global address list (aka GAL). A hash matching email addresses to contacts is
* maintained for convenience.
*
* Full contact data (attributes and their values) is only loaded once, so there is
* only one instance of this class that is fully populated. Other instances (such as
* those created by a search) will have minimal data, and will get their attribute
* values from the canonical list.
*/
function ZmContactList(appCtxt, search, isGal) {
	
	ZmList.call(this, ZmItem.CONTACT, appCtxt, search);

	this.isGal = isGal;
	this.isCanonical = false;

	this._emailToContact = {};
	this._acContacts = [];
};

ZmContactList.prototype = new ZmList;
ZmContactList.prototype.constructor = ZmContactList;


// Consts

// fields used for autocomplete matching
ZmContactList.AC_FIELDS 		= [ZmContact.F_firstName, ZmContact.F_lastName, ZmContact.X_fullName, ZmContact.X_firstLast];
ZmContactList.AC_NAME_FIELDS	= [ZmContact.F_firstName, ZmContact.F_lastName];
ZmContactList.AC_VALUE_FULL 	= "fullAddress";
ZmContactList.AC_VALUE_EMAIL	= "email";
ZmContactList.AC_MAX 			= 20; // max # of autocomplete matches to return

ZmContactList.prototype.toString = 
function() {
	return "ZmContactList";
};

// Public methods

/**
* Retrieves the contacts from the back end, and parses the response. The list is then sorted.
*
* Canonical list only.
*
* @param attrs		load only these attributes
*/
ZmContactList.prototype.load =
function(attrs, callback, errorCallback) {

	// only the canonical list gets loaded
	this.isCanonical = true;
	var soapDoc = AjxSoapDoc.create("GetContactsRequest", "urn:zimbraMail");
	// set sorting pref (or now, always sort by name asc)
	var method = soapDoc.getMethod();
	method.setAttribute("sortBy", "nameAsc");

	if (attrs) {
		// load only the given attributes
		var node;
		for (var i = 0; i < attrs.length; i++) {
			node = soapDoc.set("a");
			node.setAttribute("n", attrs[i]);
		}
	}
	
	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
DBG.showTiming(true, AjxDebug.PERF, "[PROFILING CONTACT LIST]");
DBG.timePt(AjxDebug.PERF, "requesting contact list");
	this._appCtxt.getAppController().sendRequest(soapDoc, true, respCallback, errorCallback);
};

ZmContactList.prototype._handleResponseLoad =
function(callback, result) {
	var response = result.getResponse();
	var list = response.GetContactsResponse.cn;
	if (list) {
		this.set(list);
	}
	
	if (callback) callback.run();
};

ZmContactList.prototype.set = 
function(list) {
	this.clear();
	
	for (var i = 0; i < list.length; i++) {
		var args = {appCtxt: this._appCtxt, addressHash: {}, list: this};
		var contact = ZmList.ITEM_CLASS[this.type].createFromDom(list[i], args);

		this._updateEmailHash(contact, true);
//		this._acContacts.push(this._setAcContact(contact));
		this._addAcContact(contact, this._acContacts);
		this.add(contact);
	}
};

/**
* Returns the contact with the given address, if any.
*
* Canonical list only.
*
* @param address	an email address (as a string)
*/
ZmContactList.prototype.getContactByEmail = 
function(address) {
	return address ? this._emailToContact[address.toLowerCase()] : null;
};

/**
* Deletes contacts after checking that this is not a GAL list.
*
* @param items		[Array]			list of contacts to delete
* @param hardDelete	[boolean]		whether to force physical removal of items
* @param attrs		[Object]		hash of additional attrs for SOAP command
*/
ZmContactList.prototype.deleteItems =
function(items, hardDelete, attrs) {
	if (this.isGal) {
		DBG.println(AjxDebug.DBG1, "Cannot delete GAL contacts");
		return;
	}
	ZmList.prototype.deleteItems.call(this, items, hardDelete, attrs);
};

/**
* Returns a list of matching contacts for a given string. The first name, last
* name, and email addresses are matched against.
*/
ZmContactList.prototype.autocompleteMatch =
function(str) {
	DBG.println(AjxDebug.DBG3, "begin contact matching");
	DBG.showTiming(true, "start autocomplete match: " + str);

	if (!this._acAddrList)
		this._acAddrList = {};
	
	// have we already done this string?
	if (this._acAddrList[str]) {
		DBG.println(AjxDebug.DBG3, "found previous match for " + str);
		DBG.timePt("end autocomplete match - found previous match");
		return this._matchList(str);
	}
		
	str = str.toLowerCase();
	var strLen = str.length;
	DBG.println(AjxDebug.DBG3, "str = " + str);
	var newList = [];

	// have we done part of this string?
	var tmp = str;
	var list = null;
	while (tmp && !list) {
		tmp = tmp.slice(0, -1);
		list = this._acAddrList[tmp];
		if (list && list.noMatches) {
			DBG.timePt("end autocomplete match - no matches");
			return null;
		}
	}
	
	var foundOne = false;
	if (list) {
		DBG.println(AjxDebug.DBG3, "working forward from '" + tmp + "'");
		this._acAddrList[str] = [];
		var len = list.length;
		for (var i = 0; i < len; i++) {
			var match = list[i];
			var acContact = match.data;
			var result = this._acMatch(acContact, str);
			if (result) {
				// propagate previous match forward, reset matched text
				DBG.println(AjxDebug.DBG2, "adding " + result[ZmContactList.AC_VALUE_EMAIL]);
				match.text = result.text;
				match[ZmContactList.AC_VALUE_FULL] = result[ZmContactList.AC_VALUE_FULL];
				match[ZmContactList.AC_VALUE_EMAIL] = result[ZmContactList.AC_VALUE_EMAIL];
				this._acAddrList[str].push(match);
				foundOne = true;
			}
		}
	} else { // initial matching
		DBG.println(AjxDebug.DBG2, "creating new match list for '" + str + "'");
		for (var i = 0; i < this._acContacts.length; i++) {
			var match = this._acMatch(this._acContacts[i], str);
			if (match) {
				DBG.println(AjxDebug.DBG2, "adding " + match[ZmContactList.AC_VALUE_EMAIL]);
				if (!this._acAddrList[str])
					this._acAddrList[str] = [];
				this._acAddrList[str].push(match);
				foundOne = true;
			}
		}	
	}
	if (!foundOne) {
		this._acAddrList[str] = {};
		this._acAddrList[str].noMatches = true;
	}

	DBG.timePt("end autocomplete match");
	return this._matchList(str);
};

/**
* Returns true if the given string maps to a single contact. Used by autocomplete.
*
* @param str		string to test for uniqueness
*/
ZmContactList.prototype.isUniqueValue =
function(str) {
	return (this.getContactByEmail(str) != null);
};

ZmContactList.prototype.setIsGal = 
function(isGal) {
	this.isGal = isGal;
};

ZmContactList.prototype.moveLocal =
function(items, folderId) {
	// don't remove any contacts from the canonical list
	if (!this.isCanonical)
		ZmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId == ZmFolder.ID_TRASH) {
		for (var i = 0; i < items.length; i++) {
			this._updateEmailHash(items[i], false);
			this._updateAcList(items[i], false);
		}
	}
};

ZmContactList.prototype.deleteLocal =
function(items) {
	ZmList.prototype.deleteLocal.call(this, items);
	for (var i = 0; i < items.length; i++) {
		this._updateEmailHash(items[i], false);
		this._updateAcList(items[i], false);
	}
}

// Handle modified contact. Note that the update of the autocomplete tree isn't
// optimized - we don't check whether any of the changed attributes are related to
// autocomplete.
ZmContactList.prototype.modifyLocal =
function(item, details) {
	// remove traces of old contact
	var oldContact = new ZmContact(this._appCtxt, details.contact.id, this);
	oldContact.attr = details.oldAttr;
	this._updateEmailHash(oldContact, false);
	this._updateAcList(oldContact, false);

	// add new contact to hashes
	var contact = details.contact;
	this._updateEmailHash(contact, true);
	this._updateAcList(contact, true);

	// place in correct position in list
	if (details.fileAsChanged) {
		this.remove(contact);
		this.add(contact, this._sortIndex(contact));
	}
};

ZmContactList.prototype.createLocal =
function(item) {
	this._updateEmailHash(item, true);
	this._updateAcList(item, true);
};

ZmContactList.prototype._updateEmailHash =
function(contact, doAdd) {
	for (var i = 0; i < ZmContact.F_EMAIL_FIELDS.length; i++) {
		var email = contact.getAttr(ZmContact.F_EMAIL_FIELDS[i]);
		if (email) {
			if (doAdd)
				this._emailToContact[email.toLowerCase()] = contact;
			else
				delete this._emailToContact[email.toLowerCase()];
		}
	}
};

/*
* Adds or removes a contact from its matching strings, as well as the
* list of contact matching objects.
*
* @param contact	[ZmContact]		contact to add or remove
* @param doAdd		[boolean]		if true, contact was added
*/
ZmContactList.prototype._updateAcList =
function(contact, doAdd) {
	// get matching objects for this contact
	var acContacts = this._addAcContact(contact);

	// check against matched strings
	for (var str in this._acAddrList) {
		var list = this._acAddrList[str];
		if (doAdd) {
			for (var i = 0; i < acContacts.length; i++) {
				var match = this._acMatch(acContacts[i], str);
				if (match) {
					if (list.noMatches)
						this._acAddrList[str] = [];
					this._acAddrList[str].push(match);
				}
			}
		} else {
			var newMatches = [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].data.id != contact.id)
					newMatches.push(list[i]);
			}
			this._acAddrList[str] = newMatches;
		}
	}
	// add or remove from acContacts
	if (this._acContacts) {
		if (doAdd) {
			this._acContacts = this._acContacts.concat(acContacts);
		} else {
			var newAcContacts = [];
			for (var i = 0; i < this._acContacts.length; i++)
				if (this._acContacts[i].id != contact.id)
					newAcContacts.push(this._acContacts[i]);
			this._acContacts = newAcContacts;
		}
	}
};

/*
* Parses a contact into an object to do autocomplete matching against.
* To make the matching process simpler, we create multiple objects for any 
* contact that has more than one email address, one for each address, and then 
* match against those.
*
* @param contact	[ZmContact]		contact to add
* @param list		[array]			list to add to
*/
ZmContactList.prototype._addAcContact =
function(contact, list) {
	var emails = contact.getEmails();

	list = list ? list : [];
	for (var j = 0; j < emails.length; j++) {
		var acContact = {};
		acContact.id = contact.id;
		acContact[ZmContact.F_email] = emails[j];
		for (var k = 0; k < ZmContactList.AC_FIELDS.length; k++) {
			var field = ZmContactList.AC_FIELDS[k];
			if (field == ZmContact.X_fullName)
				value = contact.getFullName();
			else if (field == ZmContact.X_firstLast)
				value = [contact.getAttr(ZmContact.F_firstName), contact.getAttr(ZmContact.F_lastName)].join(" ");
			else
				value = contact.getAttr(field);
			acContact[field] = value;
		}
		list.push(acContact);
	}
	return list;
};


// Returns a match object if the string matches any of the contact's autocomplete fields.
ZmContactList.prototype._acMatch =
function(acContact, str) {
	var matchedField = null;
	var savedMatch = null;
	for (var field in acContact) {
		if (field == "id") continue;
		var value = acContact[field];
		if (value && (value.toLowerCase().indexOf(str) == 0)) {
			matchedField = field;
			var regex = new RegExp("^(" + str + ")", "i");
			savedMatch = value.replace(regex, "<b>$1</b>");
			break;
		}
	}
	if (matchedField != null) {
		var name;
		if (matchedField == ZmContact.X_fullName || matchedField == ZmContact.X_firstLast) {
			// if one of these matched, it will already be highlighted
			name = savedMatch;
		} else {
			// construct name - first or last may have matched and been highlighted
			var names = [];
			for (var i = 0; i < ZmContactList.AC_NAME_FIELDS.length; i++) {
				var field = ZmContactList.AC_NAME_FIELDS[i];
				var val = acContact[field];
				if (val)
					names.push((matchedField == field) ? savedMatch : val);
			}
			name = names.join(" ");
		}			
		var textEmail, valEmail;
		if (matchedField == ZmContact.F_email) {
			textEmail = savedMatch; // highlighted version
			valEmail = acContact[ZmContact.F_email];
		} else {
			textEmail = valEmail = acContact[ZmContact.F_email];
		}
		var text = name + " &lt;" + textEmail + "&gt;";
		var acEmail = new ZmEmailAddress(valEmail, null, acContact[ZmContact.X_fullName]);
		var acValue = acEmail.toString();
		var result = {};
		result.data = acContact;
		result.text = text;
		result[ZmContactList.AC_VALUE_FULL] = acValue;
		result[ZmContactList.AC_VALUE_EMAIL] = valEmail;
		return result;
	}
	return null;
};

ZmContactList.prototype._matchList =
function(str) {
	var max = Math.min(this._acAddrList[str].length, ZmContactList.AC_MAX);
	DBG.println(AjxDebug.DBG2, "returning " + max + " match" + (max == 1) ? "" : "es");
	var list = null;
	if (this._acAddrList[str].length)
		list = this._acAddrList[str].slice(0, max);
	return list;
};

// Returns the position at which the given contact should be inserted in this list.
ZmContactList.prototype._sortIndex =
function(contact) {
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++)
		if (ZmContact.compareByFileAs(a[i], contact) > 0)
			return i;
	return a.length;
};
