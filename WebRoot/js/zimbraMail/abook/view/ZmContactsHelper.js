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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

/**
 * Miscellaneous contacts-related utility functions. So far, mostly things that
 * ZmContactPicker and ZmGroupView both need to perform a contacts search and
 * display results in a list view.
 *
 * @author Conrad Damon
 */
ZmContactsHelper = function() {};

/**
 * Performs a contact search (in either personal contacts or in the GAL) and populates
 * the source list view with the results.
 *
 * @param obj			[object]		object that is doing the search
 * @param ascending		[boolean]*		if true, sort in ascending order
 * @param respCallback	[AjxCallback]*	callback to call once response comes back from server
 * @param errorCallback	[AjxCallback]*	callback to call if error returned from server
 */
ZmContactsHelper.search =
function(obj, ascending, query, queryHint, respCallback, errorCallback) {
	if (obj._searchButton) {
		obj._searchButton.setEnabled(false);
	}

	var sortBy = ascending ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var params = {query:query, queryHint:queryHint, types:types, sortBy:sortBy, offset:0,
				  limit:ZmContactsApp.SEARCHFOR_MAX, contactSource:obj._contactSource,
				  field:"contact"};
	var search = new ZmSearch(obj._appCtxt, params);
	search.execute({callback:respCallback, errorCallback:errorCallback});
};

// Take the contacts and create a list of their email addresses (a contact may have more than one)
ZmContactsHelper._processSearchResponse = 
function(resp) {
	var vec = resp.getResults(ZmItem.CONTACT);

	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = [];
	var a = vec.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		if (contact.isGroup()) {
			var members = contact.getGroupMembers().good.toString(AjxEmailAddress.SEPARATOR);
			ZmContactsHelper._addContactToList(list, contact, members, true);
		} else {
			var emails = contact.isGal ? [contact.getEmail()] : contact.getEmails();
			for (var j = 0; j < emails.length; j++) {
				ZmContactsHelper._addContactToList(list, contact, emails[j]);
			}
		}
	}
	
	return list;
};

ZmContactsHelper._addContactToList = 
function(list, contact, addr, isGroup) {
	var email = new AjxEmailAddress(addr, null, contact.getFileAs(), null, isGroup);
	email.id = Dwt.getNextId();
	email.__contact = contact;
	email.icon = contact.getIcon();
	list.push(email);
};

// The items are AjxEmailAddress objects
ZmContactsHelper._getEmailField =
function(html, idx, item, field, colIdx) {
	if (field == ZmItem.F_TYPE) {
		html[idx++] = AjxImg.getImageHtml(item.icon);
	} else if (field == ZmItem.F_NAME) {
		html[idx++] = "<nobr>";
		html[idx++] = item.name;
		html[idx++] = "</nobr>";
	} else if (field == ZmItem.F_EMAIL) {
		html[idx++] = item.address;
	}
	return idx;
};
