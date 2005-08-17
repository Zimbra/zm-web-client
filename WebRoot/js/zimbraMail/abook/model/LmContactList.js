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
function LmContactList(appCtxt, isGal) {
	
	LmList.call(this, LmItem.CONTACT, appCtxt);

	this.isGal = isGal;
	this.isCanonical = false;
	this._emailToContact = new Object();
}

LmContactList.prototype = new LmList;
LmContactList.prototype.constructor = LmContactList;

// fields used for autocomplete matching
LmContactList.AC_FIELDS = new Array();
LmContactList.AC_FIELDS.push(LmContact.F_firstName, LmContact.F_lastName);
LmContactList.AC_FIELDS.push(LmContact.X_fullName, LmContact.X_firstLast);

LmContactList.AC_NAME_FIELDS = [LmContact.F_firstName, LmContact.F_lastName];

LmContactList.AC_MAX = 20; // max number of autocomplete matches to return

LmContactList.prototype.toString = 
function() {
	return "LmContactList";
}

// Public methods

/**
* Retrieves the contacts from the back end, and parses the response. The list is then sorted.
*
* Canonical list only.
*
* @param attrs		load only these attributes
*/
LmContactList.prototype.load =
function(attrs) {

	// only the canonical list gets loaded
	this.isCanonical = true;
	var soapDoc = LsSoapDoc.create("GetContactsRequest", "urn:liquidMail");

	if (attrs) {
		// load only the given attributes
		var node;
		for (var i = 0; i < attrs.length; i++) {
			node = soapDoc.set("a");
			node.setAttribute("n", attrs[i]);
		}
	}
	
	var _st = new Date();
	var resp = this._appCtxt.getAppController().sendRequest(soapDoc);
	DBG.println(LsDebug.DBG1, "------ TOTAL time to EVAL contacts list: " +  (new Date() - _st.getTime()) + "ms");

	// extract the list of contacts out from eval'd result
	var list = resp.GetContactsResponse.cn;
	
	if (list) {
		var _st = new Date();
		this.set(list);
		DBG.println(LsDebug.DBG1, this.size() + " contacts parsed (time: " + (new Date() - _st.getTime()) + "ms)");
	
		var _st = new Date();
		this.getArray().sort(LmContact.compareByFileAs); // sort in place
		DBG.println(LsDebug.DBG1, "------ TOTAL time to SORT contacts list: " + (new Date() - _st.getTime()) + "ms");
	}
	this._acContacts = this._getAcContacts(this.getArray());
}

LmContactList.prototype.set = 
function(resp) {
	this.clear();
	var args = {appCtxt: this._appCtxt, addressHash: new Object(), list: this};
	for (var i = 0; i < resp.length; i++) {
		var node = resp[i];
		this.add(LmList.ITEM_CLASS[this.type].createFromDom(node, args, true));
	}
}

/**
* Returns the contact with the given address, if any.
*
* Canonical list only.
*
* @param address	an email address (as a string)
*/
LmContactList.prototype.getContactByEmail = 
function(address) {
	return address ? this._emailToContact[address.toLowerCase()] : null;
}

/**
* Deletes contacts after checking that this is not a GAL list.
*
* @param items			list of contacts to delete
* @param hardDelete		whether to force physical removal of contacts
*/
LmContactList.prototype.deleteItems =
function(items, hardDelete) {
	if (this.isGal) {
		DBG.println(LsDebug.DBG1, "Cannot delete GAL contacts");
		return;
	}
	LmList.prototype.deleteItems.call(this, items, hardDelete);
}

/**
* Returns a list of matching contacts for a given string. The first name, last
* name, and email addresses are matched against.
*/
LmContactList.prototype.autocompleteMatch =
function(str) {
	DBG.println(LsDebug.DBG3, "begin contact matching");
	DBG.showTiming(true, "start autocomplete match: " + str);

	if (!this._acAddrList)
		this._acAddrList = new Object();
	
	// have we already done this string?
	if (this._acAddrList[str]) {
		DBG.println(LsDebug.DBG3, "found previous match for " + str);
		DBG.timePt("end autocomplete match - found previous match");
		return this._matchList(str);
	}
		
	str = str.toLowerCase();
	var strLen = str.length;
	DBG.println(LsDebug.DBG3, "str = " + str);
	var newList = new Array();

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
		DBG.println(LsDebug.DBG3, "working forward from '" + tmp + "'");
		this._acAddrList[str] = new Array();
		var len = list.length;
		for (var i = 0; i < len; i++) {
			var match = list[i];
			var acContact = match.data;
			var result = this._acMatch(acContact, str);
			if (result) {
				// propagate previous match forward, reset matched text
				DBG.println(LsDebug.DBG2, "adding " + result.value);
				match.text = result.text;
				match.value = result.value;
				this._acAddrList[str].push(match);
				foundOne = true;
			}
		}
	} else { // initial matching
		DBG.println(LsDebug.DBG2, "creating new match list for '" + str + "'");
		for (var i = 0; i < this._acContacts.length; i++) {
			var match = this._acMatch(this._acContacts[i], str);
			if (match) {
				DBG.println(LsDebug.DBG2, "adding " + match.value);
				if (!this._acAddrList[str])
					this._acAddrList[str] = new Array();
				this._acAddrList[str].push(match);
				foundOne = true;
			}
		}	
	}
	if (!foundOne) {
		this._acAddrList[str] = new Object();
		this._acAddrList[str].noMatches = true;
	}

	DBG.timePt("end autocomplete match");
	return this._matchList(str);
}

LmContactList.prototype.setIsGal = 
function(isGal) {
	this.isGal = isGal;
}

LmContactList.prototype.moveLocal =
function(items, folderId) {
	// don't remove any contacts from the canonical list
	if (!this.isCanonical)
		LmList.prototype.moveLocal.call(this, items, folderId);
	if (folderId == LmFolder.ID_TRASH) {
		for (var i = 0; i < items.length; i++) {
			this._updateEmailHash(items[i], false);
			this._updateAcList(items[i], false);
		}
	}
}

LmContactList.prototype.deleteLocal =
function(items) {
	LmList.prototype.deleteLocal.call(this, items);
	for (var i = 0; i < items.length; i++) {
		this._updateEmailHash(items[i], false);
		this._updateAcList(items[i], false);
	}
}

// Handle modified contact. Note that the update of the autocomplete tree isn't
// optimized - we don't check whether any of the changed attributes are related to
// autocomplete.
LmContactList.prototype.modifyLocal =
function(item, details) {
	// remove traces of old contact
	var oldContact = new LmContact(this._appCtxt, this);
	oldContact.attr = details.oldAttr;
	oldContact.id = details.contact.id;
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
}

LmContactList.prototype.createLocal =
function(item) {
	this._updateEmailHash(item, true);
	this._updateAcList(item, true);
}

LmContactList.prototype._updateEmailHash =
function(contact, doAdd) {
	for (var i = 0; i < LmContact.F_EMAIL_FIELDS.length; i++) {
		var f = LmContact.F_EMAIL_FIELDS[i];
		var email = contact.getAttr(f);
		if (email) {
			if (doAdd)
				this._emailToContact[email.toLowerCase()] = contact;
			else
				delete this._emailToContact[email.toLowerCase()];
		}
	}
}

// Adds or removes a contact from its matching strings.
LmContactList.prototype._updateAcList =
function(contact, doAdd) {
	var acContacts = this._getAcContacts([contact]);
	for (var str in this._acAddrList) {
		var list = this._acAddrList[str];
		if (doAdd) {
			for (var i = 0; i < acContacts.length; i++) {
				var match = this._acMatch(acContacts[i], str);
				if (match) {
					if (list.noMatches)
						this._acAddrList[str] = new Array();
					this._acAddrList[str].push(match);
				}
			}
		} else {
			var newMatches = new Array();
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
			var newAcContacts = new Array();
			for (var i = 0; i < this._acContacts.length; i++)
				if (this._acContacts[i].id != contact.id)
					newAcContacts.push(this._acContacts[i]);
			this._acContacts = newAcContacts;
		}
	}
}

// A contact may have more than one email address that we want to match against. To make the
// matching process simpler, we create multiple "contacts" for any contact that has more than
// one email address, one for each address, and then match against those.
LmContactList.prototype._getAcContacts =
function(contacts) {
	var acContacts = new Array();
	for (var i = 0; i < contacts.length; i++) {
		var contact = contacts[i];
		if (contact.folderId == LmFolder.ID_TRASH)
			continue;
		var emails = contact.getEmails();
		if (!emails) continue;
		for (var j = 0; j < emails.length; j++) {
			var acContact = new Object();
			acContact.id = contact.id;
			acContact[LmContact.F_email] = emails[j];
			for (var k = 0; k < LmContactList.AC_FIELDS.length; k++) {
				var field = LmContactList.AC_FIELDS[k];
				if (field == LmContact.X_fullName)
					value = contact.getFullName();
				else if (field == LmContact.X_firstLast)
					value = [contact.getAttr(LmContact.F_firstName), contact.getAttr(LmContact.F_lastName)].join(" ");
				else
					value = contact.getAttr(field);
				acContact[field] = value;
			}
			acContacts.push(acContact);
		}
	}
	return acContacts;
}

// Returns a match object if the string matches any of the contact's autocomplete fields.
LmContactList.prototype._acMatch =
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
		if (matchedField == LmContact.X_fullName || matchedField == LmContact.X_firstLast) {
			// if one of these matched, it will already be highlighted
			name = savedMatch;
		} else {
			// construct name - first or last may have matched and been highlighted
			var names = new Array();
			for (var i = 0; i < LmContactList.AC_NAME_FIELDS.length; i++) {
				var field = LmContactList.AC_NAME_FIELDS[i];
				var val = acContact[field];
				if (val)
					names.push((matchedField == field) ? savedMatch : val);
			}
			name = names.join(" ");
		}			
		var textEmail, valEmail;
		if (matchedField == LmContact.F_email) {
			textEmail = savedMatch; // highlighted version
			valEmail = acContact[LmContact.F_email];
		} else {
			textEmail = valEmail = acContact[LmContact.F_email];
		}
		var text = name + " &lt;" + textEmail + "&gt;";
		var acEmail = new LmEmailAddress(valEmail, null, acContact[LmContact.X_fullName]);
		var acValue = acEmail.toString();
		return {data: acContact, text: text, value: acValue};
	}
	return null;
}

LmContactList.prototype._matchList =
function(str) {
	var max = Math.min(this._acAddrList[str].length, LmContactList.AC_MAX);
	DBG.println(LsDebug.DBG2, "returning " + max + " match" + (max == 1) ? "" : "es");
	var list = null;
	if (this._acAddrList[str].length)
		list = this._acAddrList[str].slice(0, max);
	return list;
}

// Returns the position at which the given contact should be inserted in this list.
LmContactList.prototype._sortIndex =
function(contact) {
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++)
		if (LmContact.compareByFileAs(a[i], contact) > 0)
			return i;
	return a.length;
}
