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
* Create a new, empty calendar resources list.
* @constructor
* @class
* This class represents a list of calendar resources. A calendar resource can be a
* location or a piece of equipment. All calendar resource records are stored in the GAL.
*
* @author Conrad Damon
*
* @param appCtxt	[ZmAppCtxt]		the app context
* @param search		[ZmSearch]*		search that generated this list
*/
function ZmResourceList(appCtxt, search) {
	ZmContactList.call(this, appCtxt, search, true, ZmItem.RESOURCE);

	this._emailToResource = {};
};

ZmResourceList.ATTRS =
	["displayName", "mail", "zimbraCalResType", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "description"];

ZmResourceList.prototype = new ZmContactList;
ZmResourceList.prototype.constructor = ZmResourceList;

ZmResourceList.prototype.load =
function() {
	var conds = [];
	conds.push({attr: "zimbraCalResType", op: "eq", value: ZmResource.TYPE_LOCATION});
	conds.push({attr: "zimbraCalResType", op: "eq", value: ZmResource.TYPE_EQUIPMENT});
	var params = {conds: conds, join: ZmSearch.JOIN_OR, attrs: ZmResourceList.ATTRS};
	var search = new ZmSearch(this._appCtxt, params);
	
	search.execute({callback: new AjxCallback(this, this._handleResponseLoad)});
};

ZmResourceList.prototype._handleResponseLoad = 
function(result) {
	var resp = result.getResponse();
	this._vector = resp.getResults(ZmItem.RESOURCE).getVector();
	var a = this._vector.getArray();
	for (var i = 0; i < a.length; i++) {
		var resource = a[i];
		var email = resource.getAttr("mail");
		if (email) {
			this._emailToResource[email.toLowerCase()] = resource;
		}
		this._addAcContact(resource, this._acContacts, true);
	}
	this._loaded = true;
};

/**
* Returns the resource with the given address, if any. Canonical list only.
*
* @param address	[string]	an email address
*/
ZmResourceList.prototype.getResourceByEmail = 
function(address) {
	if (!address || !this.isCanonical) return null;

	return this._emailToResource[address.toLowerCase()];
};

/**
* Returns true if the given string maps to a single resource. Used by autocomplete.
* We match names, and names are not guaranteed unique, so return false.
*
* @param str		string to test for uniqueness
*/
ZmResourceList.prototype.isUniqueValue =
function(str) {
	return false;
};

/*
* Parses a contact into an object to do autocomplete matching against.
* To make the matching process simpler, we create multiple objects for any 
* contact that has more than one email address, one for each address, and then 
* match against those.
*
* @param resource	[ZmResource]	resource to add
* @param list		[array]			list to add to
* @param preMatch	[boolean]		if true, perform matching for this contact
*/
ZmResourceList.prototype._addAcContact =
function(resource, list, preMatch) {

	var acContact = {};
	acContact._item = resource;
	var strings = preMatch ? {} : null;
	// only match against displayName
	var name = resource.getFullName();
	acContact[ZmContact.X_fullName] = name;
	if (preMatch && name) {
		strings[name.substring(0, 1).toLowerCase()] = true;
		strings[name.substring(0, 2).toLowerCase()] = true;
	}
	list.push(acContact);
	if (preMatch) {
		for (var str in strings) {
			var match = this._acMatch(acContact, str);
			if (!this._acAddrList[str])
				this._acAddrList[str] = [];
			this._acAddrList[str].push(match);
		}
	}

	return [acContact];
};

/*
* Returns a resource match object. The resource name is used as both
* display text and the completion value.
*/
ZmResourceList.prototype._getMatchObject =
function(acContact, matchedField, savedMatch) {
	var result = {};
	result.data = acContact;
	result.text = acContact[ZmContact.X_fullName];
	result[ZmContactList.AC_VALUE_EMAIL] = acContact[ZmContact.F_email];
	result[ZmContactList.AC_VALUE_NAME] = acContact[ZmContact.X_fullName];

	return result;
};
