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
* <p>
* Full contact data (attributes and their values) is only loaded once, so there is
* only one instance of this class that is fully populated. Other instances (such as
* those created by a search) will have minimal data, and will get their attribute
* values from the canonical list.</p>
* <p>
* Also, loading has been optimized by delaying the creation of ZmContact objects until
* they are needed. That has a big impact on IE, and not much on Firefox. Loading a subset
* of attributes did not have much impact on load time, probably because a large majority
* of contacts contain only those minimal fields.</p>
*
* @author Conrad Damon
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param search		[ZmSearch]*		search that generated this list
* @param isGal		[boolean]*		if true, this is a list of GAL contacts
* @param type		[constant]*		item type
*/
function ZmContactList(appCtxt, search, isGal, type) {
	
	if (arguments.length == 0) return;
	type = type ? type : ZmItem.CONTACT;
	ZmList.call(this, type, appCtxt, search);

	this.isGal = (isGal === true);
	this.isCanonical = false;

	this._emailToContact = {};
	this._acAddrList = {};
	this._loadCount = 0;
	this._loaded = false;
	this._showStatus = true;
	
	this._acMatchFields = ZmContactList.AC_FIELDS;
};

ZmContactList.prototype = new ZmList;
ZmContactList.prototype.constructor = ZmContactList;


// Constants

// fields used for autocomplete matching
ZmContactList.AC_FIELDS 		= [ZmContact.F_firstName, ZmContact.F_lastName, ZmContact.X_fullName, ZmContact.X_firstLast,
								   ZmContact.F_email, ZmContact.F_email2, ZmContact.F_email3];
ZmContactList.AC_NAME_FIELDS	= [ZmContact.F_firstName, ZmContact.F_lastName];
ZmContactList.AC_VALUE_FULL 	= "fullAddress";
ZmContactList.AC_VALUE_EMAIL	= "email";
ZmContactList.AC_VALUE_NAME		= "name";
ZmContactList.AC_MAX 			= 20;	// max # of autocomplete matches to return
ZmContactList.AC_PREMATCH		= 2;	// # of characters to do pre-matching for

// Load contacts in chunks so browser remains reasonably responsive.
// To increase browser responsiveness, lower the chunk size and increase the
// delay (of course, it will then take longer to load the contacts).
ZmContactList.MAX_LOAD_COUNT	= AjxEnv.isIE ? 100 : 500;	// chunk size for loading contacts
ZmContactList.LOAD_PAUSE		= AjxEnv.isIE ? 500 : 250;	// delay between chunks


ZmContactList.prototype.toString = 
function() {
	return "ZmContactList";
};

/**
* Retrieves the contacts from the back end, and parses the response. The list is then sorted.
* This method is used only by the canonical list of contacts, in order to load their content.
* <p>
* Loading a minimal set of attributes did not result in a significant performance gain.</p>
*/
ZmContactList.prototype.load =
function(callback, errorCallback) {

	// only the canonical list gets loaded
	DBG.println(AjxDebug.DBG1, "loading contacts");
	this.isCanonical = true;
	var soapDoc = AjxSoapDoc.create("GetContactsRequest", "urn:zimbraMail");
	// set sorting pref (or now, always sort by name asc)
	var method = soapDoc.getMethod();
	method.setAttribute("sortBy", "nameAsc");

	var respCallback = new AjxCallback(this, this._handleResponseLoad, [callback]);
	DBG.timePt("requesting contact list", true);
	this._appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true,
												  callback: respCallback, errorCallback: errorCallback});
};

ZmContactList.prototype._handleResponseLoad =
function(callback, result) {
	DBG.timePt("got contact list");
	var list = result.getResponse().GetContactsResponse.cn;
	if (list) {
		if (list.length > ZmContactList.MAX_LOAD_COUNT) {
			this._loadAction = new AjxTimedAction(this, this._smartLoad, [list]);
		}
		this.set(list);
	} else {
		this._loaded = true; // user has no contacts
	}
	if (callback) callback.run();
};

ZmContactList.prototype.set = 
function(list) {
	this.clear();
	this._smartLoad(list);
};

ZmContactList.prototype._smartLoad = 
function(list) {
	DBG.timePt("loading contacts - " + this._loadCount);
	var diff = list.length - this._loadCount;
	var limit = diff < ZmContactList.MAX_LOAD_COUNT ? (diff + this._loadCount) :
													  (ZmContactList.MAX_LOAD_COUNT + this._loadCount);

	for (var i = this._loadCount; i < limit; i++) {
		var contact = list[i];
		if (!contact._attrs) contact._attrs = {}; // handle empty contacts
		// note that we don't create a ZmContact here (optimization)
		contact.list = this;
		this._updateEmailHash(contact, true);
		contact._attrs[ZmContact.X_fullName] = AjxStringUtil.trim(([contact._attrs[ZmContact.F_firstName],
		                                       contact._attrs[ZmContact.F_middleName],
		                                       contact._attrs[ZmContact.F_lastName]]).join(" "));
		contact._attrs[ZmContact.X_firstLast] = AjxStringUtil.trim(([contact._attrs[ZmContact.F_firstName],
		                                        contact._attrs[ZmContact.F_lastName]]).join(" "));
		this._preMatch(contact);
		this.add(contact);
	}

	if (i < (list.length - 1) && this._loadAction) {
		this._loadCount = i;
		AjxTimedAction.scheduleAction(this._loadAction, ZmContactList.LOAD_PAUSE);
	} else {
		DBG.timePt("done loading contacts");
		this._loaded = true;
	}
};

/**
* Returns true if contacts have finished loading.
*/
ZmContactList.prototype.isLoaded =
function() {
	return this._loaded;
};

/*
* Converts an anonymous contact object (contained by the JS returned by load request)
* into a ZmContact, and updates the containing list if it is the canonical one.
*
* @param contact	[object]	a contact
* @param idx		[int]*		index of contact in canonical list
*/
ZmContactList.prototype._realizeContact =
function(contact, idx) {
	if (contact instanceof ZmContact) return contact;

	if (this.isCanonical)
		idx = idx ? idx : this._getIndexById(contact.id);
	
	var args = {appCtxt: this._appCtxt, addressHash: {}, list: this};
	var realContact = ZmList.ITEM_CLASS[this.type].createFromDom(contact, args);

	if (this.isCanonical) {
		var a = this.getArray();
		a[idx] = realContact;
		this._updateEmailHash(realContact, true);
		this._idHash[contact.id] = realContact;
	}
	
	return realContact;	
};

/*
* Finds the array index for the contact with the given ID.
*
* @param id		[int]		a contact ID
*/
ZmContactList.prototype._getIndexById =
function(id) {
	var a = this.getArray();
	for (var i = 0; i < a.length; i++) {
		if (a[i].id == id)
			return i;
	}
	return null;
};

/**
* Override in order to make sure the contacts have been realized. We don't
* call realizeContact() since this is not the canonical list.
*
* @param offset		[int]		starting index
* @param limit		[int]		size of sublist
*/
ZmContactList.prototype.getSubList = 
function(offset, limit) {
	var vec = ZmList.prototype.getSubList.call(this, offset, limit);
	if (vec) {
		var a = vec.getArray();
		for (var i = 0; i < a.length; i++) {
			a[i] = this._realizeContact(a[i], offset + i);
		}
	}
	return vec;
};

/**
* Override in order to make sure the contact has been realized. Canonical list only.
* Returns a ZmContact.
*
* @param id		[int]		a contact ID
*/
ZmContactList.prototype.getById =
function(id) {
	if (!id || !this.isCanonical) return null;

	var contact = this._idHash[id];
	if (!contact) return null;

	return this._realizeContact(contact);
};

/**
* Returns the contact with the given address, if any. Canonical list only.
*
* @param address	[string]	an email address
*/
ZmContactList.prototype.getContactByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	var contact = this._emailToContact[address.toLowerCase()];
	if (!contact) return null;

	return this._realizeContact(contact);
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

/**
* Overridden to prevent the adding of the same contact more than once by a single
* notification. Of course, once the user reloads, they'll see duplicates if the
* server in fact created them.
*/
ZmContactList.prototype.notifyCreate =
function(node) {
	if (this.getContactByEmail(node._attrs.email)) return;
	ZmList.prototype.notifyCreate.call(this, node);
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

// Handle modified contact. 
ZmContactList.prototype.modifyLocal =
function(item, details) {
	if (details) {
		// notify item's list
		details.items = [item];
		this._notify(ZmEvent.E_MODIFY, details);
	}

	// Remove traces of old contact - NOTE: we pass in null for the ID on 
	// PURPOSE to avoid overwriting the existing cached contact
	var oldContact = new ZmContact(this._appCtxt, null, this);
	oldContact.id = details.contact.id;
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
		var email = ZmContact.getAttr(contact, ZmContact.F_EMAIL_FIELDS[i]);
		if (email) {
			if (doAdd)
				this._emailToContact[email.toLowerCase()] = contact;
			else
				delete this._emailToContact[email.toLowerCase()];
		}
	}
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

ZmContactList.prototype._handleResponseModifyItem =
function(item, result) {
	// NOTE: we overload and do nothing b/c base class does more than we want 
	//       (since everything is handled by notifications)
};

/**
* Returns a list of matching contacts for a given string. The first name, last
* name, full name, first/last name, and email addresses are matched against.
*
* @param str	[string]	string to match against
*/
ZmContactList.prototype.autocompleteMatch =
function(str) {
	DBG.println(AjxDebug.DBG3, "begin contact matching");

	if (!this.isLoaded() && this._showStatus) {
		this._appCtxt.setStatusMsg(ZmMsg.autocompleteNotReady, ZmStatusView.LEVEL_WARNING);
		this._showStatus = false; // only show status message once.
		return null;
	}

	str = str.toLowerCase();
	DBG.println(AjxDebug.DBG3, "str = " + str);

	// have we already done this string?
	if (this._acAddrList[str]) {
		DBG.println(AjxDebug.DBG3, "found previous match for " + str);
		DBG.timePt("end autocomplete match - found previous match");
		return this._matchList(str);
	}
		
	var strLen = str.length;
	var newList = [];

	// have we done part of this string?
	var tmp = str;
	var list = null;
	while (tmp && !list) {
		tmp = tmp.slice(0, -1); // remove last character
		list = this._acAddrList[tmp];
		if (list && list.length == 0) {
			// substring had no matches, so this one doesn't as well
			DBG.timePt("end autocomplete match - no matches");
			return null;
		}
	}
	
	var foundOne = false;
	if (list) {
		// found a substring that we've already done matching for
		DBG.println(AjxDebug.DBG3, "working forward from '" + tmp + "'");
		this._acAddrList[str] = [];
		var len = list.length;
		// test each of the substring's matches to see if it also matches this string
		for (var i = 0; i < len; i++) {
			var id = list[i];
			if (this._testAcMatch(this.getById(id), str)) {
				this._acAddrList[str].push(id);
				foundOne = true;
			}
		}
	} else {
		// initial matching against all contacts
		DBG.println(AjxDebug.DBG2, "creating new match list for '" + str + "'");
		list = this.getArray();
		for (var i = 0; i < list.length; i++) {
			var contact = list[i];
			if (this._testAcMatch(contact, str)) {
				if (!this._acAddrList[str]) {
					this._acAddrList[str] = [];
				}
				this._acAddrList[str].push(contact.id);
				foundOne = true;
			}
		}
	}
	if (!foundOne) {
		this._acAddrList[str] = [];
	}

	DBG.timePt("end autocomplete match");
	return this._matchList(str);
};

/*
* Fills in matches for strings up to two characters.
*
* @param contact	[object]	a contact
*/
ZmContactList.prototype._preMatch =
function(contact) {
	if (!ZmContactList.AC_PREMATCH) {return;}
	var strings = {};
	for (var i = 0; i < this._acMatchFields.length; i++) {
		// placeholder objects (ZmContactList) will have _attrs
		// realized objects (ZmResourceList) will have attr
		var value = contact._attrs ? contact._attrs[this._acMatchFields[i]] :
									 contact.attr ? contact.attr[this._acMatchFields[i]] : null;
		if (value) {
			for (var j = 1; j <= ZmContactList.AC_PREMATCH; j++) {
				var str = value.substring(0, j).toLowerCase();
				if(!strings[str]) {
					this._acAddrList[str] = this._acAddrList[str] ? this._acAddrList[str] : [];
					this._acAddrList[str].push(contact.id);
					strings[str] = true;
				}
			}
		}
	}
};

/*
* Tests a string against various fields of a contact to see if the contact matches.
* Contacts that are in the Trash will always fail to match.
*
* @param contact	[object]		contact
* @param str		[string]		test string
* @param doMarkup	[boolean]		if true, return highlighted value and matched field
*/
ZmContactList.prototype._testAcMatch =
function(contact, str, doMarkup) {
	if (!contact || ZmContact.isInTrash(contact)) return false;

	for (var i = 0; i < this._acMatchFields.length; i++) {
		var field = this._acMatchFields[i];
		var value = ZmContact.getAttr(contact, field);
		if (value && (value.toLowerCase().indexOf(str) == 0)) {
			if (doMarkup) {
				try {
					var regex = new RegExp("^(" + str + ")", "i");
					savedMatch = value.replace(regex, "<b>$1</b>");
				} catch (ex) {}	// illegal regex attempt - do nothing...
				return {savedMatch: savedMatch, matchedField: field};
			} else {
				return contact.id;
			}
		}
	}
	return null;
};

/*
* Returns a list of no more than the maximum number of matches. Each item in the list
* is a matching object from which the caller selects the data it needs.
*
* @param str		[string]	string to match against
*/
ZmContactList.prototype._matchList =
function(str) {
	var max = Math.min(this._acAddrList[str].length, ZmContactList.AC_MAX);
	DBG.println(AjxDebug.DBG2, "returning " + max + " match" + (max == 1) ? "" : "es");
	var list = null;
	if (this._acAddrList[str].length)
		list = this._acAddrList[str].slice(0, max);
	else
		return null;
	
	var num = 0;
	var results = [];
	for (var i = 0; i < list.length; i++) {
		var matches = this._getMatches(list[i], str);
		if (matches && matches.length) {
			for (var j = 0; j < matches.length; j++) {
				num++;
				if (num <= ZmContactList.AC_MAX)
					results.push(matches[j]);
			}
		}
	}

	return results;
};

/*
* Creates the matching object(s) for a particular matched contact. If a contact has multiple
* email addresses and didn't match on one of them (it matched on a name), then a matching
* object will be created for each email address.
*
* @param id		[int]		ID of matched contact
* @param str	[string]	string that was matched
*/
ZmContactList.prototype._getMatches =
function(id, str) {
	var match = this._testAcMatch(this.getById(id), str, true);
	if (!match) {
		DBG.println(AjxDebug.DBG1, "Matched contact with ID " + id + " no longer matches '" + str + "' (possibly deleted)");
		return null;
	}

	var contact = this.getById(id);
	var name;
	if (match.matchedField == ZmContact.X_fullName || match.matchedField == ZmContact.X_firstLast) {
		// if one of these matched, it will already be highlighted
		name = match.savedMatch;
	} else {
		// construct name - first or last may have matched and been highlighted
		var names = [];
		for (var i = 0; i < ZmContactList.AC_NAME_FIELDS.length; i++) {
			var field = ZmContactList.AC_NAME_FIELDS[i];
			var val = ZmContact.getAttr(contact, field);
			if (val)
				names.push((match.matchedField == field) ? match.savedMatch : val);
		}
		name = names.join(" ");
	}			
	var results = [];
	var fullName = ZmContact.getAttr(contact, ZmContact.X_fullName);
	if (match.matchedField == ZmContact.F_email || match.matchedField == ZmContact.F_email2 || match.matchedField == ZmContact.F_email3) {
		results.push(this._createMatch(name, match.savedMatch, fullName, ZmContact.getAttr(contact, match.matchedField), contact));
	} else {
		for (var i = 0; i < ZmContact.F_EMAIL_FIELDS.length; i++) {
			var val = ZmContact.getAttr(contact, ZmContact.F_EMAIL_FIELDS[i]);
			if (val)
				results.push(this._createMatch(name, val, fullName, val, contact));
		}
	}
	
	return results;
};

/*
* Creates a match object from the given fields.
*
* @param nameHL		[string]		full name (may have highlighting)
* @param emailHL	[string]		email address (may have highlighting)
* @param name		[string]		full name
* @param email		[string]		email address (for sending message)
* @param contact	[ZmContact]		the matched contact
*/
ZmContactList.prototype._createMatch =
function(nameHL, emailHL, name, email, contact) {
	var text = nameHL + " &lt;" + emailHL + "&gt;";
	var acValue = ['"', name, '" <', email, ">"].join("");
	
	var result = {};
	result.text = text;
	result.item = contact;
	result[ZmContactList.AC_VALUE_FULL] = acValue;
	result[ZmContactList.AC_VALUE_EMAIL] = email;
	result[ZmContactList.AC_VALUE_NAME] = name;

	return result;
};

/*
* Adds or removes a contact from its matching strings.
*
* @param contact	[object]		contact to add or remove
* @param doAdd		[boolean]		if true, contact was added
*/
ZmContactList.prototype._updateAcList =
function(contact, doAdd) {
	for (var str in this._acAddrList) {
		var list = this._acAddrList[str];
		if (doAdd) {
			if (this._testAcMatch(contact, str))
				list.push(contact.id);
		} else {
			var newMatches = [];
			for (var i = 0; i < list.length; i++) {
				if (list[i] != contact.id) {
					newMatches.push(list[i]);
				}
			}
			this._acAddrList[str] = newMatches;
		}
	}
};
