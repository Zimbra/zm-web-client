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
 * @param query			[String]		query string to search on
 * @param queryHint		[String]*		query hint (i.e. searching shared folders)
 * @param ascending		[boolean]*		if true, sort in ascending order
 * @param respCallback	[AjxCallback]*	callback to call once response comes back from server
 * @param errorCallback	[AjxCallback]*	callback to call if error returned from server
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

ZmContactsHelper.getRemoteQueryHint =
function() {
	var queryHint;
	var app = appCtxt.getApp(ZmApp.CONTACTS);
	var ids = app.getRemoteFolderIds();
	var list = [];

	for (var i = 0; i < ids.length; i++) {
		list.push("inid:" + ids[i]);
	}

	if (list.length > 0) {
		list.push("is:local");
		queryHint = list.join(" OR ");
	}

	return queryHint;
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
