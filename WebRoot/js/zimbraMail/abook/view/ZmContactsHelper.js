/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains a contact helper class.
 * 
 */

/**
 * Default constructor for helper class.
 * @class
 * Miscellaneous contacts-related utility functions. So far, mostly things that
 * {@link ZmContactPicker} and {@link ZmGroupView} both need to perform a contacts search and
 * display results in a list view.
 *
 * @author Conrad Damon
 */
ZmContactsHelper = function() {};

/**
 * Performs a contact search (in either personal contacts or in the GAL) and populates
 * the source list view with the results.
 *
 * @param	{Hash}	params		a hash of parameters
 * @param {Object}	params.obj			the object that is doing the search
 * @param {String}	params.query			the query string to search on
 * @param {String}	params.queryHint		the query hint (i.e. searching shared folders)
 * @param {Boolean}	params.ascending		if <code>true</code>, sort in ascending order
 * @param {int}	params.lastId		the ID of last item displayed (for pagination)
 * @param {String}	params.lastSortVal	the value of sort field for above item
 * @param {AjxCallback}	params.respCallback	the callback to call once response comes back from server
 * @param {AjxCallback}	params.errorCallback	the callback to call if error returned from server
 * @param {String}	params.accountName	the account to make search request on behalf of
 */
ZmContactsHelper.search =
function(params) {
	var o = params.obj;
	if (o._searchButton) {
		o._searchButton.setEnabled(false);
	}

	params.sortBy = params.ascending ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
	params.types = AjxVector.fromArray([ZmItem.CONTACT]);
	params.offset = params.offset || 0;
	params.limit = ZmContactsApp.SEARCHFOR_MAX;
	params.contactSource = o._contactSource;
	params.field = "contact";

	var search = new ZmSearch(params);
	search.execute({callback:params.respCallback, errorCallback:params.errorCallback});
};

/**
 * Take the contacts and create a list of their email addresses (a contact may have more than one)
 * 
 * @private
 */
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

/**
 * @private
 */
ZmContactsHelper._addContactToList = 
function(list, contact, addr, isGroup) {
	var email = new AjxEmailAddress(addr, null, contact.getFileAs(), null, isGroup);
	email.id = Dwt.getNextId();
	email.__contact = contact;
	email.icon = contact.getIcon();
	list.push(email);
};

/**
 * The items are AjxEmailAddress objects
 * 
 * @private
 */
ZmContactsHelper._getEmailField =
function(html, idx, item, field, colIdx) {
	if (field == ZmItem.F_TYPE) {
		html[idx++] = AjxImg.getImageHtml(item.icon);
	} else if (field == ZmItem.F_NAME) {
		html[idx++] = "<nobr>";
		html[idx++] = item.name;
		html[idx++] = "</nobr>";
	} else if (field == ZmItem.F_EMAIL) {
		html[idx++] = AjxStringUtil.htmlEncode(item.address);
	}
	return idx;
};
