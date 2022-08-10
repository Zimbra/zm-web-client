/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {Array}   params.conds	the conds to restrict the search by (array of {attr:"", op:"", value:""} hashes)
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
function(resp, includeContactsWithNoEmail) {
	var vec = resp.getResults(ZmItem.CONTACT);

	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = [];
	var a = vec.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		if (contact.isGroup() && !contact.isDL) {
			var members = contact.getGroupMembers().good.toString(AjxEmailAddress.SEPARATOR);
			ZmContactsHelper._addContactToList(list, contact, members, true);
		} else {
			var emails = contact.isGal ? [contact.getEmail()] : contact.getEmails();
			for (var j = 0; j < emails.length; j++) {
				ZmContactsHelper._addContactToList(list, contact, emails[j]);
			}
			if (includeContactsWithNoEmail && emails.length == 0) {
				ZmContactsHelper._addContactToList(list, contact, null);
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

	var email = ZmContactsHelper._wrapContact(contact, addr, isGroup);  
	list.push(email);
};

/**
 * wrapps the contact inside a AjxEmailAddress object, and adds a couple extra fields to the AjxEmailAddress instance (value, contact, icon [which I'm not sure is used])
 *
 * @param contact
 * @param addr {String} optional.
 * @param isGroup
 */
ZmContactsHelper._wrapContact =
function(contact, addr, isGroup) {

	addr = addr || contact.getEmail();
	var fileAs = contact.getFileAs();
	var name = (fileAs != addr) ? fileAs : "";  //todo ??? this is weird.
	var	type = contact.isGal ? ZmContact.GROUP_GAL_REF : ZmContact.GROUP_CONTACT_REF;
	var	value = contact.isGal ? (contact.ref || contact.id) : contact.id;  //defaulting to contact.id in the gal case since from GetContactsResponse the ref is not returned and we can end up with it cached without the ref. Probably need to fix that.
	var displayName = contact.getFullNameForDisplay();

	var email = new AjxEmailAddress(addr, type, name, displayName, isGroup);

	email.value = value;
	email.id = Dwt.getNextId();
	email.__contact = contact;
	email.icon = contact.getIcon();
	if (contact.isDL) {
		email.isGroup = true;
		email.canExpand = contact.canExpand;
		var ac = window.parentAppCtxt || window.appCtxt;
		ac.setIsExpandableDL(addr, email.canExpand);
	}
	return email;
};

/**
 * wrapps the inline address (there's no real ZmContact object) inside AjxEmailAddress and adds the value attribute to it.
 * this is so we treat real contacts and inline contacts consistently throughout the rest of the code.
 *
 * @param value  {String} - the inline email address and/or name (e.g. "john doe <john@doe.com>" or "john@doe.com")
 */
ZmContactsHelper._wrapInlineContact =
function(value) {
	var email = AjxEmailAddress.parse(value); //from legacy data at least (not sure about new), the format might be something like "Inigo Montoya <inigo@theprincessbride.com>" so we have to parse.
	if (!email) {
		//this can happen when creating inline in contact group edit, and the user did not suply email address in the inline value
		email = new AjxEmailAddress(value, null, value);
	}
	email.type = ZmContact.GROUP_INLINE_REF;
	email.value = value;
	email.id = Dwt.getNextId();
	return email;
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
		html[idx++] = '<span style="white-space:nowrap">';
		html[idx++] = AjxStringUtil.htmlEncode(item.name || ZmMsg.noName);
		html[idx++] = "</span>";
	} else if (field == ZmItem.F_EMAIL) {
		html[idx++] = AjxStringUtil.htmlEncode(item.address);
	} else if (field == ZmItem.F_DEPARTMENT) {
		if (item.__contact) {
			html[idx++] = AjxStringUtil.htmlEncode(ZmContact.getAttr(item.__contact, ZmContact.F_department));
		}
	}
	return idx;
};
