/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the contact class.
 */

if (!window.ZmContact) {
/**
 * Creates an empty contact.
 * @class
 * This class represents a contact (typically a person) with all its associated versions
 * of email address, home and work addresses, phone numbers, etc. Contacts can be filed/sorted
 * in different ways, with the default being Last, First. A contact is an item, so
 * it has tagging and flagging support, and belongs to a list.
 * <p>
 * Most of a contact's data is kept in attributes. These include name, phone, etc. Meta-data and
 * data common to items are not kept in attributes. These include flags, tags, folder, and
 * modified/created dates. Since the attribute data for contacts is loaded only once, a contact
 * gets its attribute values from that canonical list.
 * </p>
 *
 * @param {int}	id		the unique ID
 * @param {ZmContactList}	list		the list that contains this contact
 * @param {constant}	type		the item type
 * 
 * @extends		ZmItem
 */
ZmContact = function(id, list, type) {
	if (arguments.length == 0) { return; }

	type = type || ZmItem.CONTACT;
	ZmItem.call(this, type, id, list);

	this.attr = {};
	this.isGal = (this.list && this.list.isGal);

	this.participants = new AjxVector(); // XXX: need to populate this guy (see ZmConv)
};

ZmContact.prototype = new ZmItem;
ZmContact.prototype.constructor = ZmContact;

// fields
ZmContact.F_anniversary				= "anniversary";
ZmContact.F_assistantPhone			= "assistantPhone";
ZmContact.F_attachment				= "attachment";
ZmContact.F_birthday				= "birthday";
ZmContact.F_callbackPhone			= "callbackPhone";
ZmContact.F_carPhone				= "carPhone";
ZmContact.F_company					= "company";
ZmContact.F_companyPhone			= "companyPhone";
ZmContact.F_custom					= "custom";
ZmContact.F_description				= "description";
ZmContact.F_department				= "department";
ZmContact.F_dlist					= "dlist";				// Group fields
ZmContact.F_email					= "email";
ZmContact.F_email2					= "email2";
ZmContact.F_email3					= "email3";
ZmContact.F_fileAs					= "fileAs";
ZmContact.F_firstName				= "firstName";
ZmContact.F_folderId				= "folderId";
ZmContact.F_homeCity				= "homeCity";
ZmContact.F_homeCountry				= "homeCountry";
ZmContact.F_homeFax					= "homeFax";
ZmContact.F_homePhone				= "homePhone";
ZmContact.F_homePhone2				= "homePhone2";
ZmContact.F_homePostalCode			= "homePostalCode";
ZmContact.F_homeState				= "homeState";
ZmContact.F_homeStreet				= "homeStreet";
ZmContact.F_homeURL					= "homeURL";
ZmContact.F_image					= "image";				// contact photo
ZmContact.F_imAddress 				= "imAddress";			// IM addresses
ZmContact.F_imAddress1 				= "imAddress1";			// IM addresses
ZmContact.F_imAddress2 				= "imAddress2";
ZmContact.F_imAddress3				= "imAddress3";
ZmContact.F_jobTitle				= "jobTitle";
ZmContact.F_lastName				= "lastName";
ZmContact.F_maidenName				= "maidenName";
ZmContact.F_middleName				= "middleName";
ZmContact.F_mobilePhone				= "mobilePhone";
ZmContact.F_namePrefix				= "namePrefix";
ZmContact.F_nameSuffix				= "nameSuffix";
ZmContact.F_nickname				= "nickname";
ZmContact.F_notes					= "notes";
ZmContact.F_otherCity				= "otherCity";
ZmContact.F_otherCountry			= "otherCountry";
ZmContact.F_otherFax				= "otherFax";
ZmContact.F_otherPhone				= "otherPhone";
ZmContact.F_otherPostalCode			= "otherPostalCode";
ZmContact.F_otherState				= "otherState";
ZmContact.F_otherStreet				= "otherStreet";
ZmContact.F_otherURL				= "otherURL";
ZmContact.F_pager					= "pager";
ZmContact.F_type					= "type";
ZmContact.F_workAltPhone			= "workAltPhone";
ZmContact.F_workCity				= "workCity";
ZmContact.F_workCountry				= "workCountry";
ZmContact.F_workEmail1				= "workEmail1";
ZmContact.F_workEmail2				= "workEmail2";
ZmContact.F_workEmail3				= "workEmail3";
ZmContact.F_workFax					= "workFax";
ZmContact.F_workMobile				= "workMobile";
ZmContact.F_workPhone				= "workPhone";
ZmContact.F_workPhone2				= "workPhone2";
ZmContact.F_workPostalCode			= "workPostalCode";
ZmContact.F_workState				= "workState";
ZmContact.F_workStreet				= "workStreet";
ZmContact.F_workURL					= "workURL";
ZmContact.X_fileAs					= "fileAs";				// extra fields
ZmContact.X_firstLast				= "firstLast";
ZmContact.X_fullName				= "fullName";
ZmContact.X_vcardXProps             = "vcardXProps";
ZmContact.MC_cardOwner				= "cardOwner";			// My card fields
ZmContact.MC_workCardMessage		= "workCardMessage";
ZmContact.MC_homeCardMessage		= "homeCardMessage";
ZmContact.MC_homePhotoURL			= "homePhotoURL";
ZmContact.MC_workPhotoURL			= "workPhotoURL";
ZmContact.GAL_MODIFY_TIMESTAMP		= "modifyTimeStamp";	// GAL fields
ZmContact.GAL_CREATE_TIMESTAMP		= "createTimeStamp";
ZmContact.GAL_ZIMBRA_ID				= "zimbraId";
ZmContact.GAL_OBJECT_CLASS			= "objectClass";
ZmContact.GAL_MAIL_FORWARD_ADDRESS	= "zimbraMailForwardingAddress";
ZmContact.GAL_CAL_RES_TYPE			= "zimbraCalResType";
ZmContact.GAL_CAL_RES_LOC_NAME		= "zimbraCalResLocationDisplayName";

// file as
var i = 1;
ZmContact.FA_LAST_C_FIRST			= i++;
ZmContact.FA_FIRST_LAST 			= i++;
ZmContact.FA_COMPANY 				= i++;
ZmContact.FA_LAST_C_FIRST_COMPANY	= i++;
ZmContact.FA_FIRST_LAST_COMPANY		= i++;
ZmContact.FA_COMPANY_LAST_C_FIRST	= i++;
ZmContact.FA_COMPANY_FIRST_LAST		= i++;
ZmContact.FA_CUSTOM					= i++;

// Field information

ZmContact.ADDRESS_FIELDS = [
	ZmContact.F_homeCity,
	ZmContact.F_homeCountry,
	ZmContact.F_homePostalCode,
	ZmContact.F_homeState,
	ZmContact.F_homeStreet,
	ZmContact.F_otherCity,
	ZmContact.F_otherCountry,
	ZmContact.F_otherPostalCode,
	ZmContact.F_otherState,
	ZmContact.F_otherStreet,
	ZmContact.F_workCity,
	ZmContact.F_workCountry,
	ZmContact.F_workPostalCode,
	ZmContact.F_workState,
	ZmContact.F_workStreet
];
ZmContact.EMAIL_FIELDS = [
	ZmContact.F_email
];
ZmContact.IM_FIELDS = [
	ZmContact.F_imAddress
];
ZmContact.OTHER_FIELDS = [
	ZmContact.F_anniversary,
	ZmContact.F_birthday,
	ZmContact.F_custom
];
ZmContact.PHONE_FIELDS = [
	ZmContact.F_assistantPhone,
	ZmContact.F_callbackPhone,
	ZmContact.F_carPhone,
	ZmContact.F_companyPhone,
	ZmContact.F_homeFax,
	ZmContact.F_homePhone,
	ZmContact.F_mobilePhone,
	ZmContact.F_otherFax,
	ZmContact.F_otherPhone,
	ZmContact.F_workAltPhone,
	ZmContact.F_pager,
	ZmContact.F_workFax,
	ZmContact.F_workMobile,
	ZmContact.F_workPhone
];
ZmContact.PRIMARY_FIELDS = [
	ZmContact.F_company,
	ZmContact.F_department,
	ZmContact.F_fileAs,
	ZmContact.F_firstName,
	ZmContact.F_folderId,
	ZmContact.F_image,
	ZmContact.F_jobTitle,
	ZmContact.F_lastName,
	ZmContact.F_maidenName,
	ZmContact.F_middleName,
	ZmContact.F_namePrefix,
	ZmContact.F_nameSuffix,
	ZmContact.F_nickname,
	ZmContact.F_notes
];
ZmContact.URL_FIELDS = [
	ZmContact.F_homeURL,
	ZmContact.F_workURL,
	ZmContact.F_otherURL
];
ZmContact.GAL_FIELDS = [
	ZmContact.GAL_MODIFY_TIMESTAMP,
	ZmContact.GAL_CREATE_TIMESTAMP,
	ZmContact.GAL_ZIMBRA_ID,
	ZmContact.GAL_OBJECT_CLASS,
	ZmContact.GAL_MAIL_FORWARD_ADDRESS,
	ZmContact.GAL_CAL_RES_TYPE,
	ZmContact.GAL_CAL_RES_LOC_NAME
];
ZmContact.MYCARD_FIELDS = [
	ZmContact.MC_cardOwner,
	ZmContact.MC_homeCardMessage,
	ZmContact.MC_homePhotoURL,
	ZmContact.MC_workCardMessage,
	ZmContact.MC_workPhotoURL
];
ZmContact.X_FIELDS = [
	ZmContact.X_firstLast,
	ZmContact.X_fullName,
    ZmContact.X_vcardXProps
];


ZmContact.IGNORE_NORMALIZATION = [];

ZmContact.updateFieldConstants = function() {

ZmContact.DISPLAY_FIELDS = [].concat(
	ZmContact.ADDRESS_FIELDS,
	ZmContact.EMAIL_FIELDS,
	ZmContact.IM_FIELDS,
	ZmContact.OTHER_FIELDS,
	ZmContact.PHONE_FIELDS,
	ZmContact.PRIMARY_FIELDS,
	ZmContact.URL_FIELDS
);

ZmContact.IGNORE_FIELDS = [].concat(
	ZmContact.GAL_FIELDS,
	ZmContact.MYCARD_FIELDS,
	ZmContact.X_FIELDS
);

ZmContact.ALL_FIELDS = [].concat(
	ZmContact.DISPLAY_FIELDS, ZmContact.IGNORE_FIELDS
);

ZmContact.IS_DATE = {};
ZmContact.IS_DATE[ZmContact.F_birthday] = true;
ZmContact.IS_DATE[ZmContact.F_anniversary] = true;

ZmContact.IS_IGNORE = {};
for (var i = 0; i < ZmContact.IGNORE_FIELDS.length; i++) {
	ZmContact.IS_IGNORE[ZmContact.IGNORE_FIELDS[i]] = true;
}

}; // updateFieldConstants()
ZmContact.updateFieldConstants();

/**
 * This structure can be queried to determine if the first
 * entry in a multi-value entry is suffixed with "1". Most
 * attributes add a numerical suffix to all but the first
 * entry.
 * <p>
 * <strong>Note:</strong>
 * In most cases, {@link ZmContact#getAttributeName} is a better choice.
 */
ZmContact.IS_ADDONE = {};
ZmContact.IS_ADDONE[ZmContact.F_custom] = true;
ZmContact.IS_ADDONE[ZmContact.F_imAddress] = true;

/**
 * Gets an indexed attribute name taking into account if the field
 * with index 1 should append the "1" or not. Code should call this
 * function in lieu of accessing {@link ZmContact.IS_ADDONE} directly.
 */
ZmContact.getAttributeName = function(name, index) {
	index = index || 1;
	return index > 1 || ZmContact.IS_ADDONE[name] ? name+index : name;
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContact.prototype.toString =
function() {
	return "ZmContact";
};

// Class methods

/**
 * Creates a contact from an XML node.
 *
 * @param {Object}	node		a "cn" XML node
 * @param {Hash}	args		args to pass to the constructor
 * @return	{ZmContact}	the contact
 */
ZmContact.createFromDom =
function(node, args) {
	// check global cache for this item first
	var contact = appCtxt.cacheGet(node.id);

	// make sure the revision hasnt changed, otherwise contact is out of date
	if (contact == null || (contact && contact.rev != node.rev)) {
		contact = new ZmContact(node.id, args.list);
		contact._loadFromDom(node);
	} else {
		if (!AjxUtil.hashCompare(node._attrs, contact.attr)) {
			contact.attr = node._attrs;
		}
		contact.list = args.list || new ZmContactList(null);
	}

	return contact;
};

/**
 * Compares two contacts based on how they are filed. Intended for use by
 * sort methods.
 *
 * @param {ZmContact}		a		a contact
 * @param {ZmContact}		b		a contact
 * @return	{int}	0 if the contacts are the same; 1 if "a" is before "b"; -1 if "b" is before "a"
 */
ZmContact.compareByFileAs =
function(a, b) {
	var aFileAs = (a instanceof ZmContact) ? a.getFileAs(true) : ZmContact.computeFileAs(a._attrs).toLowerCase();
	var bFileAs = (b instanceof ZmContact) ? b.getFileAs(true) : ZmContact.computeFileAs(b._attrs).toLowerCase();

	if (!bFileAs || (aFileAs > bFileAs)) return 1;
	if (aFileAs < bFileAs) return -1;
	return 0;
};

/**
 * Figures out the filing string for the contact according to the chosen method.
 *
 * @param {ZmContact|Hash}	contact		a contact or a hash of contact attributes
 */
ZmContact.computeFileAs =
function(contact) {
	var attr = (contact instanceof ZmContact) ? contact.getAttrs() : contact;
	if (!attr) return;

	var val = parseInt(attr.fileAs);
	var fa;
	var idx = 0;

	switch (val) {
		case ZmContact.FA_LAST_C_FIRST: 										// Last, First
		default: {
			// if GAL contact, use full name instead (bug fix #4850,4009)
			if (contact && contact.isGal) {
				if (attr.fullName) { // bug fix #27428 - if fullName is Array, return first
					return (attr.fullName instanceof Array) ? attr.fullName[0] : attr.fullName;
				}
				return attr.email;
			}
			fa = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
		}
		break;

		case ZmContact.FA_FIRST_LAST: { 										// First Last
			fa = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
		}
		break;

		case ZmContact.FA_COMPANY: {											// Company
			if (attr.company) fa = attr.company;
		}
		break;

		case ZmContact.FA_LAST_C_FIRST_COMPANY: {								// Last, First (Company)
			var name = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
			fa = ZmContact.fileAsNameCompany(name, attr.company);
		}
		break;

		case ZmContact.FA_FIRST_LAST_COMPANY: {									// First Last (Company)
			var name = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName, attr.fullName, attr.nickname);
			fa = ZmContact.fileAsNameCompany(name, attr.company);
		}
		break;

		case ZmContact.FA_COMPANY_LAST_C_FIRST: {								// Company (Last, First)
			var name = ZmContact.fileAsLastFirst(attr.firstName, attr.lastName);
			fa = ZmContact.fileAsCompanyName(name, attr.company);
		}
		break;

		case ZmContact.FA_COMPANY_FIRST_LAST: {									// Company (First Last)
			var name = ZmContact.fileAsFirstLast(attr.firstName, attr.lastName);
			fa = ZmContact.fileAsCompanyName(name, attr.company);
		}
		break;

		case ZmContact.FA_CUSTOM: {												// custom looks like this: "8:foobar"
			return attr.fileAs.substring(2);
		}
		break;
	}
	return fa || attr.fullName || "";
};

/**
 * Name printing helper "First Last".
 * 
 * @param	{String}	first		the first name
 * @param	{String}	last		the last name
 * @param	{String}	fullname		the fullname
 * @param	{String}	nickname		the nickname
 * @return	{String}	the name format
 */
ZmContact.fileAsFirstLast =
function(first, last, fullname, nickname) {
	if (first && last)
		return AjxMessageFormat.format(ZmMsg.fileAsFirstLast, [first, last]);
	return first || last || fullname || nickname || "";
};

/**
 * Name printing helper "Last, First".
 * 
 * @param	{String}	first		the first name
 * @param	{String}	last		the last name
 * @param	{String}	fullname		the fullname
 * @param	{String}	nickname		the nickname
 * @return	{String}	the name format
 */
ZmContact.fileAsLastFirst =
function(first, last, fullname, nickname) {
	if (first && last)
		return AjxMessageFormat.format(ZmMsg.fileAsLastFirst, [first, last]);
	return first || last || fullname || nickname || "";
};

/**
 * Name printing helper "Name (Company)".
 * 
 * @param	{String}	name		the contact name
 * @param	{String}	company		the company
 * @return	{String}	the name format
 */
ZmContact.fileAsNameCompany =
function(name, company) {
	if (name && company)
		return AjxMessageFormat.format(ZmMsg.fileAsNameCompany, [name, company]);
	if (company)
		return AjxMessageFormat.format(ZmMsg.fileAsCompanyAsSecondaryOnly, [company]);
	return name;
};

/**
 * Name printing helper "Company (Name)".
 * 
 * @param	{String}	name		the contact name
 * @param	{String}	company		the company
 * @return	{String}	the name format
 */
ZmContact.fileAsCompanyName =
function(name, company) {
	if (company && name)
		return AjxMessageFormat.format(ZmMsg.fileAsCompanyName, [name, company]);
	if (name)
		return AjxMessageFormat.format(ZmMsg.fileAsNameAsSecondaryOnly, [name]);
	return company;
};

/**
 * Computes the custom file as string by prepending "8:" to the given custom fileAs string.
 * 
 * @param {Hash}	customFileAs	a set of contact attributes
 * @return	{String}	the name format
 */
ZmContact.computeCustomFileAs =
function(customFileAs) {
	return [ZmContact.FA_CUSTOM, ":", customFileAs].join("");
};

/*
 * 
 * These next few static methods handle a contact that is either an anonymous
 * object or an actual ZmContact. The former is used to optimize loading. The
 * anonymous object is upgraded to a ZmContact when needed.
 *  
 */

/**
 * Gets an attribute.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{String}	attr		the attribute
 * @return	{Object}	the attribute value or <code>null</code> for none
 */
ZmContact.getAttr =
function(contact, attr) {
	return (contact instanceof ZmContact)
		? contact.getAttr(attr)
		: (contact && contact._attrs) ? contact._attrs[attr] : null;
};

/**
 * Normalizes the numbering of the given attribute names and
 * returns a new object with the re-numbered attributes. For
 * example, if the attributes contains a "foo2" but no "foo",
 * then the "foo2" attribute will be renamed to "foo" in the
 * returned object.
 *
 * @param {Hash}	attrs  a hash of attributes to normalize.
 * @param {String}	[prefix] if specified, only the the attributes that match the given prefix will be returned
 * @param {Array}	[ignore] if specified, the attributes that are present in the array will not be normalized
 * @return	{Hash}	a hash of normalized attributes
 */
ZmContact.getNormalizedAttrs = function(attrs, prefix, ignore) {
	var nattrs = {};
	if (attrs) {
		// normalize attribute numbering
		var names = AjxUtil.keys(attrs);
		names.sort(ZmContact.__BY_ATTRIBUTE);
		var a = {};
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			// get current count
			var nprefix = name.replace(/\d+$/,"");
			if (prefix && prefix != nprefix) continue;
			if (AjxUtil.isArray(ignore) && AjxUtil.indexOf(ignore, nprefix)!=-1) {
				nattrs[name] = attrs[name];
			} else {
				if (!a[nprefix]) a[nprefix] = 0;
				// normalize, if needed
				var nname = ZmContact.getAttributeName(nprefix, ++a[nprefix]);
				nattrs[nname] = attrs[name];
			}
		}
	}
	return nattrs;
};

ZmContact.__RE_ATTRIBUTE = /^(.*?)(\d+)$/;
ZmContact.__BY_ATTRIBUTE = function(a, b) {
	var aa = a.match(ZmContact.__RE_ATTRIBUTE) || [a,a,1];
	var bb = b.match(ZmContact.__RE_ATTRIBUTE) || [b,b,1];
	return aa[1] == bb[1] ? Number(aa[2]) - Number(bb[2]) : aa[1].localeCompare(bb[1]);
};

/**
 * Sets the attribute.
 * 
 * @param	{ZmContact}	contact		the contact
 * @param	{String}	attr		the attribute
 * @param	{Object}	value		the attribute value
 */
ZmContact.setAttr =
function(contact, attr, value) {
	if (contact instanceof ZmContact)
		contact.setAttr(attr, value);
	else
		contact._attrs[attr] = value;
};

/**
 * Checks if the contact is in the trash.
 * 
 * @param	{ZmContact}	contact		the contact
 * @return	{Boolean}	<code>true</code> if in trash
 */
ZmContact.isInTrash =
function(contact) {
	var folderId = (contact instanceof ZmContact) ? contact.folderId : contact.l;
	var folder = appCtxt.getById(folderId);
	return (folder && folder.isInTrash());
};

/**
 * @private
 */
ZmContact.prototype.load =
function(callback, errorCallback, batchCmd) {
	var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.GetContactsRequest;
	request.cn = [{id:this.id}];

	var respCallback = new AjxCallback(this, this._handleLoadResponse, [callback]);

	if (batchCmd) {
		var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
		jsonObj.GetContactsRequest.cn = {id:this.id};
		batchCmd.addRequestParams(jsonObj, respCallback, errorCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj,
												asyncMode:true,
												callback:respCallback,
												errorCallback:errorCallback});
	}
};

/**
 * @private
 */
ZmContact.prototype._handleLoadResponse =
function(callback, result) {
	var resp = result.getResponse().GetContactsResponse;

	// for now, we just assume only one contact was requested at a time
	this.attr = resp.cn[0]._attrs;
	this.isLoaded = true;

	if (callback)
		callback.run(resp.cn[0], this);
};

/**
 * @private
 */
ZmContact.prototype.clear =
function() {
	// bug fix #41666 - override base class method and do nothing
};

/**
 * Checks if the contact attributes are empty.
 * 
 * @return	{Boolean}	<code>true</code> if empty
 */
ZmContact.prototype.isEmpty =
function() {
	for (var i in this.attr) {
		return false;
	}
	return true;
};

/**
 * Checks if the contact is shared.
 * 
 * @return	{Boolean}	<code>true</code> if shared
 */
ZmContact.prototype.isShared =
function() {
	return this.addrbook && this.addrbook.link;
};

/**
 * Checks if the contact is read-only.
 * 
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmContact.prototype.isReadOnly =
function() {
	if (this.isGal) { return true; }

	return this.isShared()
		? this.addrbook && this.addrbook.isReadOnly()
		: false;
};

/**
 * Checks if the contact is a group.
 * 
 * @return	{Boolean}	<code>true</code> if a group
 */
ZmContact.prototype.isGroup =
function() {
	return Boolean(this.getAttr(ZmContact.F_dlist) || this.type == ZmItem.GROUP);
};

// parses "dlist" attr into AjxEmailAddress objects stored in 3 vectors (all, good, and bad)
/**
 * Gets the group members.
 * 
 * @return	{AjxVector}		the group members or <code>null</code> if not group
 */
ZmContact.prototype.getGroupMembers =
function() {
	return this.isGroup()
		? AjxEmailAddress.parseEmailString(this.getAttr(ZmContact.F_dlist))
		: null;
};

/**
 * Gets the icon.
 * 
 * @return	{String}	the icon
 */
ZmContact.prototype.getIcon =
function() {
	if (this.isGal)			{ return "GALContact"; }
	if (this.isShared())	{ return "SharedContact"; }
	if (this.isGroup())		{ return "Group"; }
	return "Contact";
};

/**
 * Gets the folder id.
 * 
 * @return	{String}		the folder id	
 */
ZmContact.prototype.getFolderId =
function() {
	return this.isShared()
		? this.folderId.split(":")[0]
		: this.folderId;
};

/**
 * Gets the attribute.
 * 
 * @param	{String}	name		the attribute name
 * @return	{String}	the value
 */
ZmContact.prototype.getAttr =
function(name) {
	var val = this.attr[name];
	return val ? ((val instanceof Array) ? val[0] : val) : "";
};

/**
 * Sets the attribute.
 * 
 * @param	{String}	name		the attribute name
 * @param	{String}	value		the attribute value
 */
ZmContact.prototype.setAttr =
function(name, value) {
	this.attr[name] = value;
};

/**
 * Sets the participant status.
 *
 * @param	{String}	value the participant status value
 */
ZmContact.prototype.setParticipantStatus =
function(ptst) {
	this.participantStatus = ptst;
};

/**
 * gets the participant status.
 *
 * @return	{String}    the value
 */
ZmContact.prototype.getParticipantStatus =
function() {
	return this.participantStatus;
};

/**
 * Sets the participant role.
 *
 * @param	{String}	value the participant role value
 */
ZmContact.prototype.setParticipantRole =
function(role) {
	this.participantRole = role;
};

/**
 * gets the participant role.
 *
 * @return	{String}    the value
 */
ZmContact.prototype.getParticipantRole =
function() {
	return this.participantRole;
};

/**
 * Removes the attribute.
 * 
 * @param	{String}	name		the attribute name
 */
ZmContact.prototype.removeAttr =
function(name) {
	delete this.attr[name];
};

/**
 * Gets the contact attributes.
 *
 * @param {String}	[prefix] if specified, only the the attributes that match the given prefix will be returned
 * @return	{Hash}	a hash of attribute/value pairs
 */
ZmContact.prototype.getAttrs = function(prefix) {
	var attrs = this.attr;
	if (prefix) {
		attrs = {};
		for (var aname in this.attr) {
			if (aname.replace(/\d+$/,"") == prefix) {
				attrs[aname] = this.attr[aname];
			}
		}
	}
	return attrs;
};

/**
 * Gets a normalized set of attributes where the attribute
 * names have been re-numbered as needed. For example, if the
 * attributes contains a "foo2" but no "foo", then the "foo2"
 * attribute will be renamed to "foo" in the returned object.
 * <p>
 * <strong>Note:</strong>
 * This method is expensive so should be called once and
 * cached temporarily as needed instead of being called
 * for each normalized attribute that is needed.
 * 
 * @param {String}	[prefix]		if specified, only the
 *                        the attributes that match the given
 *                        prefix will be returned.
 * @return	{Hash}	a hash of attribute/value pairs
 */
ZmContact.prototype.getNormalizedAttrs = function(prefix) {
	return ZmContact.getNormalizedAttrs(this.attr, prefix, ZmContact.IGNORE_NORMALIZATION);
};

/**
* Creates a contact from the given set of attributes. Used to create contacts on
* the fly (rather than by loading them). This method is called by a list's <code>create()</code>
* method.
* <p>
* If this is a GAL contact, we assume it is being added to the contact list.</p>
*
* @param {Hash}	attr			the attribute/value pairs for this contact
* @param {ZmBatchCommand}	batchCmd	the batch command that contains this request
*/
ZmContact.prototype.create =
function(attr, batchCmd) {
	var jsonObj = {CreateContactRequest:{_jsns:"urn:zimbraMail"}};
	var request = jsonObj.CreateContactRequest;
	var cn = request.cn = {};

	var folderId = attr[ZmContact.F_folderId] || ZmFolder.ID_CONTACTS;
	var folder = appCtxt.getById(folderId);
	if (folder && folder.isRemote()) {
		folderId = folder.getRemoteId();
	}
	cn.l = folderId;
	cn.a = [];

	for (var name in attr) {
		if (name == ZmContact.F_folderId ||
			name == "objectClass" ||
			name == "zimbraId" ||
			name == "createTimeStamp" ||
			name == "modifyTimeStamp") { continue; }

		this._addRequestAttr(cn.a, name, attr[name]);
	}

	var respCallback = new AjxCallback(this, this._handleResponseCreate, [attr, batchCmd != null]);

	if (batchCmd) {
		batchCmd.addRequestParams(jsonObj, respCallback);
	} else {
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	}
};

/**
 * @private
 */
ZmContact.prototype._handleResponseCreate =
function(attr, isBatchMode, result) {
	// dont bother processing creates when in batch mode (just let create
	// notifications handle them)
	if (isBatchMode) { return; }

	var resp = result.getResponse().CreateContactResponse;
	cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	if (id) {
		this._fileAs = null;
		this._fullName = null;
		this.id = id;
		this.modified = cn.md;
		this.folderId = cn.l || ZmOrganizer.ID_ADDRBOOK;
		for (var a in attr) {
			if (!(attr[a] == undefined || attr[a] == ''))
				this.setAttr(a, attr[a]);
		}
		var msg = this.isGroup() ? ZmMsg.groupCreated : ZmMsg.contactCreated;
		appCtxt.getAppController().setStatusMsg(msg);
	} else {
		var msg = this.isGroup() ? ZmMsg.errorCreateGroup : ZmMsg.errorCreateContact;
		var detail = ZmMsg.errorTryAgain + "\n" + ZmMsg.errorContact;
		appCtxt.getAppController().setStatusMsg(msg, ZmStatusView.LEVEL_CRITICAL, detail);
	}
};

/**
 * Creates a contct from a VCF part of a message.
 * 
 * @param	{String}	msgId		the message
 * @param	{String}	vcardPartId	the vcard part id
 */
ZmContact.prototype.createFromVCard =
function(msgId, vcardPartId) {
	var jsonObj = {CreateContactRequest:{_jsns:"urn:zimbraMail"}};
	var cn = jsonObj.CreateContactRequest.cn = {l:ZmFolder.ID_CONTACTS};
	cn.vcard = {mid:msgId, part:vcardPartId};

	var params = {
		jsonObj: jsonObj,
		asyncMode: true,
		callback: (new AjxCallback(this, this._handleResponseCreateVCard)),
		errorCallback: (new AjxCallback(this, this._handleErrorCreateVCard))
	};

	appCtxt.getAppController().sendRequest(params);
};

/**
 * @private
 */
ZmContact.prototype._handleResponseCreateVCard =
function(result) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.contactCreated);
};

/**
 * @private
 */
ZmContact.prototype._handleErrorCreateVCard =
function(ex) {
	appCtxt.getAppController().setStatusMsg(ZmMsg.errorCreateContact, ZmStatusView.LEVEL_CRITICAL);
};

/**
 * Updates contact attributes.
 *
 * @param {Hash}	attr		a set of attributes and new values
 * @param {AjxCallback}	callback	the callback
 */
ZmContact.prototype.modify =
function(attr, callback) {
	if (this.list.isGal) { return; }

	// change force to 0 and put up dialog if we get a MODIFY_CONFLICT fault?
	var jsonObj = {ModifyContactRequest:{_jsns:"urn:zimbraMail", replace:"0", force:"1"}};
	var cn = jsonObj.ModifyContactRequest.cn = {id:this.id};
	cn.a = [];
	var continueRequest = false;

	for (var name in attr) {
		if (name == ZmContact.F_folderId) { continue; }
		this._addRequestAttr(cn.a, name, (attr[name] && attr[name].value) || attr[name]);
		continueRequest = true;
	}

	if (continueRequest) {
		var respCallback = new AjxCallback(this, this._handleResponseModify, [attr, callback]);
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	} else {
		if (attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
	}
};

/**
 * @private
 */
ZmContact.prototype._handleResponseModify =
function(attr, callback, result) {
	var resp = result.getResponse().ModifyContactResponse;
	var cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;

	if (id && id == this.id) {
		appCtxt.setStatusMsg(this.isGroup() ? ZmMsg.groupSaved : ZmMsg.contactSaved);
		// was this contact moved to another folder?
		if (attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
	} else {
        var detail = ZmMsg.errorTryAgain + "\n" + ZmMsg.errorContact;
        appCtxt.getAppController().setStatusMsg(ZmMsg.errorModifyContact, ZmStatusView.LEVEL_CRITICAL, detail);
	}
	// NOTE: we no longer process callbacks here since notification handling
	//       takes care of everything
};

/**
 * @private
 */
ZmContact.prototype._handleResponseMove =
function(newFolderId, resp) {
	var newFolder = newFolderId && appCtxt.getById(newFolderId);
	var count = 1;
	if (newFolder)
		appCtxt.setStatusMsg(AjxMessageFormat.format(ZmMsg.actionMove, [count, AjxMessageFormat.format(ZmMsg[ZmItem.COUNT_KEY[ZmItem.CONTACT]], count), newFolder.name]));
	
	this._notify(ZmEvent.E_MODIFY, resp);
};

/**
 * @private
 */
ZmContact.prototype._setFolder =
function(newFolderId) {
	var folder = appCtxt.getById(this.folderId);
	var fId = folder ? folder.nId : null;
	if (fId == newFolderId) { return; }

	// moving out of a share or into one is handled differently (create then hard delete)
	var newFolder = appCtxt.getById(newFolderId);
	if (this.isShared() || (newFolder && newFolder.link)) {
		if (this.list) {
			this.list.moveItems({items:[this], folder:newFolder});
		}
	} else {
		var jsonObj = {ContactActionRequest:{_jsns:"urn:zimbraMail"}};
		jsonObj.ContactActionRequest.action = {id:this.id, op:"move", l:newFolderId};
		var respCallback = new AjxCallback(this, this._handleResponseMove, [newFolderId]);
		var accountName = appCtxt.multiAccounts && appCtxt.accountList.mainAccount.name;
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback, accountName:accountName});
	}
};

/**
 * @private
 */
ZmContact.prototype.notifyModify =
function(obj, batchMode) {

	var result = ZmItem.prototype.notifyModify.apply(this, arguments);

	var context = window.parentAppCtxt || window.appCtxt;
	context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);

	if (result) {
		return result;
	}

	// cache old fileAs/fullName before resetting them
	var oldFileAs = this.getFileAs();
	var oldFullName = this.getFullName();
	this._resetCachedFields();

	var oldAttrCache = {};
	if (obj._attrs) {
		// remove attrs that were not returned back from the server
		var oldAttrs = this.getAttrs();
		for (var a in oldAttrs) {
			oldAttrCache[a] = oldAttrs[a];
			if (obj._attrs[a] == null)
				this.removeAttr(a);
		}

		// set attrs returned by server
		for (var a in obj._attrs) {
			this.setAttr(a, obj._attrs[a]);
		}
	}

	var details = {
		attr: obj._attrs,
		oldAttr: oldAttrCache,
		fullNameChanged: (this.getFullName() != oldFullName),
		fileAsChanged: (this.getFileAs() != oldFileAs),
		contact: this
	};

	// update this contact's list per old/new attrs
	this.list.modifyLocal(obj, details);
	this._notify(ZmEvent.E_MODIFY, obj);

	var buddy = this.getBuddy();
	if (buddy) {
		buddy._notifySetName(buddy.name);	// trigger a refresh
	}
};

/**
 * @private
 */
ZmContact.prototype.notifyDelete =
function() {
	ZmItem.prototype.notifyDelete.call(this);
	var context = window.parentAppCtxt || window.appCtxt;
	context.clearAutocompleteCache(ZmAutocomplete.AC_TYPE_CONTACT);
};

/**
 * Initializes this contact using an email address.
 *
 * @param {AjxEmailAddress|String}	email		an email address or an email string
 * @param {Boolean}	strictName	if <code>true</code>, do not try to set name from user portion of address
 */
ZmContact.prototype.initFromEmail =
function(email, strictName) {
	if (email instanceof AjxEmailAddress) {
		this.setAttr(ZmContact.F_email, email.getAddress());
		this._initFullName(email, strictName);
	} else {
		this.setAttr(ZmContact.F_email, email);
	}
};

/**
 * Initializes this contact using a phone number.
 *
 * @param {String}	phone		the phone string
 * @param {String}	field		the field or company phone if <code>null</code>
 */
ZmContact.prototype.initFromPhone =
function(phone, field) {
	this.setAttr(field || ZmContact.F_companyPhone, phone);
};

/**
 * Gets the email address.
 * 
 * @return	the email address
 */
ZmContact.prototype.getEmail =
function() {
	return (this.getAttr(ZmContact.F_email) ||
            this.getAttr(ZmContact.F_workEmail1) ||
			this.getAttr(ZmContact.F_email2) ||
            this.getAttr(ZmContact.F_workEmail2) ||
			this.getAttr(ZmContact.F_email3) ||
			this.getAttr(ZmContact.F_workEmail3));
};
    
/**
 * Gets the IM address.
 * 
 * @return	the IM address
 */
ZmContact.prototype.getIMAddress =
function() {
	return this.getAttr(ZmContact.F_imAddress1) ||
		   this.getAttr(ZmContact.F_imAddress2) ||
		   this.getAttr(ZmContact.F_imAddress3);
};

/**
 * Gets the IM buddy.
 * 
 * @return	the IM buddy
 */
ZmContact.prototype.getBuddy =
function() {
	var buddy;
	if (appCtxt.get(ZmSetting.IM_ENABLED) && ZmImApp.loggedIn()) {
		var roster = AjxDispatcher.run("GetRoster");
		buddy = roster.getRosterItem(this.getAttr(ZmContact.F_email), false)  ||
				roster.getRosterItem(this.getAttr(ZmContact.F_email2), false) ||
				roster.getRosterItem(this.getAttr(ZmContact.F_email3), false) ||
				roster.getRosterItem(this.getIMAddress(), true);
	}
	return buddy;
};

/**
 * Gets the IM presence.
 * 
 * @return	{Object}	the presence
 */
ZmContact.prototype.getImPresence =
function() {
	var buddy = this.getBuddy();
	return (buddy) ? buddy.getPresence() : null;
};

/**
 * Gets the emails.
 * 
 * @return	{Array}	 an array of all valid emails for this contact
 */
ZmContact.prototype.getEmails =
function() {
	var emails = [];
	var attrs = this.getAttrs();
	for (var index = 0; index < ZmContact.EMAIL_FIELDS.length; index++) {
		var field = ZmContact.EMAIL_FIELDS[index];
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(field, i);
			if (!attrs[aname]) break;
			emails.push(attrs[aname]);
		}
	}
	return emails;
};

/**
 * Gets the full name.
 * 
 * @return	{String}	the full name
 */
ZmContact.prototype.getFullName =
function() {
	if (!this._fullName) {
		var fullName = this.getAttr(ZmContact.X_fullName); // present if GAL contact
		if (fullName) {
			this._fullName = (fullName instanceof Array) ? fullName[0] : fullName;
		} else {
			var fn = [];
			var idx = 0;
			var prefix = this.getAttr(ZmContact.F_namePrefix);
			var first = this.getAttr(ZmContact.F_firstName);
			var middle = this.getAttr(ZmContact.F_middleName);
			var maiden = this.getAttr(ZmContact.F_maidenName);
			var last = this.getAttr(ZmContact.F_lastName);
			var suffix = this.getAttr(ZmContact.F_nameSuffix);
			var pattern = ZmMsg.fullname;
			if (suffix) {
				pattern = maiden ? ZmMsg.fullnameMaidenSuffix : ZmMsg.fullnameSuffix;
			}
			else if (maiden) {
				pattern = ZmMsg.fullnameMaiden;
			}
			var args = [prefix,first,middle,maiden,last,suffix];
			this._fullName = AjxStringUtil.trim(AjxMessageFormat.format(pattern, args), true);
		}
	}

	// as a last resort, set it to fileAs
	if (!this._fullName) {
		this._fullName = this.getFileAs();
	}

	return this._fullName;
};

/**
 * Gets the tool tip for this contact.
 * 
 * @param	{String}	email		the email address
 * @param	{Boolean}	isGal		(not used)
 * @param	{String}	hint		the hint text
 * @return	{String}	the tool tip in HTML
 */
ZmContact.prototype.getToolTip =
function(email, isGal, hint) {
	// XXX: we dont cache tooltip info anymore since its too dynamic :/
	// i.e. IM status can change anytime so always rebuild tooltip and bug 13834
	var subs = {
		contact: this,
		entryTitle: this.getFileAs(),
		hint: hint,
		buddy: this.getBuddy()
	};

	return (AjxTemplate.expand("abook.Contacts#Tooltip", subs));
};

/**
 * Gets the filing string for this contact, computing it if necessary.
 * 
 * @param	{Boolean}	lower		<code>true</code> to use lower case
 * @return	{String}	the file as string
 */
ZmContact.prototype.getFileAs =
function(lower) {
	// update/null if modified
	if (!this._fileAs) {
		this._fileAs = ZmContact.computeFileAs(this);
		this._fileAsLC = this._fileAs ? this._fileAs.toLowerCase() : null;
	}
	// if for some reason fileAsLC is not set even though fileAs is, reset it
	if (lower && !this._fileAsLC) {
		this._fileAsLC = this._fileAs.toLowerCase();
	}
	return lower ? this._fileAsLC : this._fileAs;
};

/**
 * Gets the header.
 * 
 * @return	{String}	the header
 */
ZmContact.prototype.getHeader =
function() {
	return this.id ? this.getFileAs() : ZmMsg.newContact;
};

/**
 * Get the image URL.
 * 
 * @return	{String}	the image URL
 */
ZmContact.prototype.getImageUrl =
function() {
  	var image = this.getAttr(ZmContact.F_image);
  	if(!image || !image.part) { return null; }
  	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
  	return  [msgFetchUrl, "&id=", this.id, "&part=", image.part, "&t=", (new Date()).getTime()].join("");
};

/**
 * Gets the company field. Company field has a getter b/c fileAs may be the Company name so
 * company field should return "last, first" name instead *or* prepend the title
 * if fileAs is not Company (assuming it exists).
 * 
 * @return	{String}	the company
 */
ZmContact.prototype.getCompanyField =
function() {

	var attrs = this.getAttrs();
	if (attrs == null) return null;

	var fa = parseInt(attrs.fileAs);
	var val = [];
	var idx = 0;

	if (fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST) {
		// return the title, company name
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			if (attrs.company)
				val[idx++] = ", ";
		}
		if (attrs.company)
			val[idx++] = attrs.company;

	} else if (fa == ZmContact.FA_COMPANY) {
		// return the first/last name
		if (attrs.lastName) {
			val[idx++] = attrs.lastName;
			if (attrs.firstName)
				val[idx++] = ", ";
		}

		if (attrs.firstName)
			val[idx++] = attrs.firstName;

		if (attrs.jobTitle)
			val[idx++] = " (" + attrs.jobTitle + ")";

	} else {
		// just return the title
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			// and/or company name if applicable
			if (attrs.company && (attrs.fileAs == null || fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST))
				val[idx++] = ", ";
		}
		if (attrs.company && (attrs.fileAs == null || fa == ZmContact.FA_LAST_C_FIRST || fa == ZmContact.FA_FIRST_LAST))
			 val[idx++] = attrs.company;
	}
	if (val.length == 0) return null;
	return val.join("");
};

/**
 * Gets the work address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the work address
 */
ZmContact.prototype.getWorkAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.workStreet, attrs.workCity, attrs.workState, attrs.workPostalCode, attrs.workCountry);
};

/**
 * Gets the home address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the home address
 */
ZmContact.prototype.getHomeAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.homeStreet, attrs.homeCity, attrs.homeState, attrs.homePostalCode, attrs.homeCountry);
};

/**
 * Gets the other address.
 * 
 * @param	{Object}	instance		(not used)
 * @return	{String}	the other address
 */
ZmContact.prototype.getOtherAddrField =
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.otherStreet, attrs.otherCity, attrs.otherState, attrs.otherPostalCode, attrs.otherCountry);
};

/**
 * Gets the address book.
 * 
 * @return	{ZmAddrBook}	the address book
 */
ZmContact.prototype.getAddressBook =
function() {
	if (!this.addrbook) {
		this.addrbook = appCtxt.getById(this.folderId);
	}
	return this.addrbook;
};

/**
 * @private
 */
ZmContact.prototype._getAddressField =
function(street, city, state, zipcode, country) {
	if (street == null && city == null && state == null && zipcode == null && country == null) return null;

	var html = [];
	var idx = 0;

	if (street) {
		html[idx++] = street;
		if (city || state || zipcode)
			html[idx++] = "\n";
	}

	if (city) {
		html[idx++] = city;
		if (state)
			html[idx++] = ", ";
		else if (zipcode)
			html[idx++] = " ";
	}

	if (state) {
		html[idx++] = state;
		if (zipcode)
			html[idx++] = " ";
	}

	if (zipcode)
		html[idx++] = zipcode;

	if (country)
		html[idx++] = "\n" + country;

	return html.join("");
};

/**
 * Sets the full name based on an email address.
 * 
 * @private
 */
ZmContact.prototype._initFullName =
function(email, strictName) {
	var name = email.getName();
	name = AjxStringUtil.trim(name.replace(AjxEmailAddress.commentPat, '')); // strip comment (text in parens)

	if (name && name.length) {
		this._setFullName(name, [" "]);
	} else if (!strictName) {
		name = email.getAddress();
		if (name && name.length) {
			var i = name.indexOf("@");
			if (i == -1) return;
			name = name.substr(0, i);
			this._setFullName(name, [".", "_"]);
		}
	}
};

/**
 * Tries to extract a set of name components from the given text, with the
 * given list of possible delimiters. The first delimiter contained in the
 * text will be used. If none are found, the first delimiter in the list is used.
 * 
 * @private
 */
ZmContact.prototype._setFullName =
function(text, delims) {
	var delim = delims[0];
	for (var i = 0; i < delims.length; i++) {
		if (text.indexOf(delims[i]) != -1) {
			delim = delims[i];
			break;
		}
	}
	var parts = text.split(delim, 3);
	this.setAttr(ZmContact.F_firstName, parts[0]);
	if (parts.length == 2) {
		this.setAttr(ZmContact.F_lastName, parts[1]);
	} else if (parts.length == 3) {
		this.setAttr(ZmContact.F_middleName, parts[1]);
		this.setAttr(ZmContact.F_lastName, parts[2]);
	}
};

/**
 * @private
 */
ZmContact.prototype._addRequestAttr =
function(attrs, name, value) {
	var a = {n:name};
	if (name == ZmContact.F_image && AjxUtil.isString(value) && value.length) {
		// handle contact photo
		if (value.indexOf("aid_") != -1) {
			a.aid = value.substring(4);
		} else {
			a.part = value.substring(5);
		}
	} else {
		a._content = value || "";
	}
	attrs.push(a);
};

/**
 * Reset computed fields.
 * 
 * @private
 */
ZmContact.prototype._resetCachedFields =
function() {
	this._fileAs = this._fileAsLC = this._fullName = null;
};

/**
 * Parse contact node.
 * 
 * @private
 */
ZmContact.prototype._loadFromDom =
function(node) {
	this.isLoaded = true;
	this.rev = node.rev;
	this.sf = node.sf;
	this.folderId = node.l;
	this.created = node.cd;
	this.modified = node.md;

	this.attr = node._attrs || {};

	// for shared contacts, we get these fields outside of the attr part
	if (node.email) this.attr[ZmContact.F_email] = node.email;
	if (node.email2) this.attr[ZmContact.F_email2] = node.email2;
	if (node.email3) this.attr[ZmContact.F_email3] = node.email3;

	this.type = (this.attr[ZmContact.F_dlist] != null) ? ZmItem.GROUP : ZmItem.CONTACT;

	// check if the folderId is found in our address book (otherwise, we assume
	// this contact to be a shared contact)
	var ac = window.parentAppCtxt || window.appCtxt;
	this.addrbook = ac.getById(this.folderId);

	// dont process tags/flags for shared contacts until we get server support
	if (!this.isShared()) {
		this._parseFlags(node.f);
		this._parseTags(node.t);
	} else {
		// shared contacts are never fully loaded since we never cache them
		this.isLoaded = false;
	}

	// bug: 22174
	// We ignore the server's computed file-as property and instead
	// format it based on the user's locale.
	this._fileAs = ZmContact.computeFileAs(this);
};

/**
 * Gets display text for an attendee. Prefers name over email.
 *
 * @param {constant}	type		the attendee type
 * @param {Boolean}	shortForm		if <code>true</code>, return only name or email
 * @return	{String}	the attendee
 */
ZmContact.prototype.getAttendeeText =
function(type, shortForm) {
	var text = "";
	var name = this.getFullName();
	var email = this.getEmail();
	if (shortForm || (type && type != ZmCalBaseItem.PERSON)) {
		text = name || email || "";
	} else {
		var e = new AjxEmailAddress(email, null, name);
		text = e.toString();
	}

	return text;
};

/**
 * Gets the unknown fields.
 * 
 * @param	{function}	[sortByNameFunc]	sort by function
 * @return	{Array}	an array of field name/value pairs
 */
ZmContact.prototype.getUnknownFields = function(sortByNameFunc) {
	var map = ZmContact.__FIELD_MAP;
	if (!map) {
		map = ZmContact.__FIELD_MAP = {};
		for (var i = 0; i < ZmContact.DISPLAY_FIELDS; i++) {
			map[ZmContact.DISPLAY_FIELDS[i]] = true;
		}
	}
	var fields = [];
	var attrs = this.getAttrs();
	for (var aname in attrs) {
		var field = aname.replace(/\d+$/,"");
		if (map[aname]) continue;
		fields.push(field);
	}
	return this.getFields(fields, sortByNameFunc);
};

/**
 * Gets the fields.
 * 
 * @param	{Array}	field		the fields
 * @param	{function}	[sortByNameFunc]	sort by function
 * @return	{Array}	an array of field name/value pairs
 */
ZmContact.prototype.getFields = function(fields, sortByNameFunc) {
	// TODO: [Q] Should sort function handle just the field names or the attribute names?
	var selection;
	var attrs = this.getAttrs();
	for (var index = 0; index < fields.length; index++) {
		for (var i = 1; true; i++) {
			var aname = ZmContact.getAttributeName(fields[index], i);
			if (!attrs[aname]) break;
			if (!selection) selection = {};
			selection[aname] = attrs[aname];
		}
	}
	if (sortByNameFunc && selection) {
		var keys = AjxUtil.keys(selection);
		keys.sort(sortByNameFunc);
		var nfields = {};
		for (var i = 0; i < keys; i++) {
			var key = keys[i];
			nfields[key] = fields[key];
		}
		selection = nfields;
	}
	return selection;
};

// these need to be kept in sync with ZmContact.F_*
ZmContact._AB_FIELD = {
	firstName:				ZmMsg.AB_FIELD_firstName,		// file as info
	lastName:				ZmMsg.AB_FIELD_lastName,
	middleName:				ZmMsg.AB_FIELD_middleName,
	fullName:				ZmMsg.AB_FIELD_fullName,
	jobTitle:				ZmMsg.AB_FIELD_jobTitle,
	company:				ZmMsg.AB_FIELD_company,
	email:					ZmMsg.AB_FIELD_email,			// email addresses
	email2:					ZmMsg.AB_FIELD_email2,
	email3:					ZmMsg.AB_FIELD_email3,
	imAddress1:				ZmMsg.AB_FIELD_imAddress1,		// IM addresses
	imAddress2:				ZmMsg.AB_FIELD_imAddress2,
	imAddress3:				ZmMsg.AB_FIELD_imAddress3,
	image: 					ZmMsg.AB_FIELD_image,			// contact photo
	attachment:				ZmMsg.AB_FIELD_attachment,
	workStreet:				ZmMsg.AB_FIELD_street,			// work address info
	workCity:				ZmMsg.AB_FIELD_city,
	workState:				ZmMsg.AB_FIELD_state,
	workPostalCode:			ZmMsg.AB_FIELD_postalCode,
	workCountry:			ZmMsg.AB_FIELD_country,
	workURL:				ZmMsg.AB_FIELD_URL,
	workPhone:				ZmMsg.AB_FIELD_workPhone,
	workPhone2:				ZmMsg.AB_FIELD_workPhone2,
	workFax:				ZmMsg.AB_FIELD_workFax,
	assistantPhone:			ZmMsg.AB_FIELD_assistantPhone,
	companyPhone:			ZmMsg.AB_FIELD_companyPhone,
	callbackPhone:			ZmMsg.AB_FIELD_callbackPhone,
	homeStreet:				ZmMsg.AB_FIELD_street,			// home address info
	homeCity:				ZmMsg.AB_FIELD_city,
	homeState:				ZmMsg.AB_FIELD_state,
	homePostalCode:			ZmMsg.AB_FIELD_postalCode,
	homeCountry:			ZmMsg.AB_FIELD_country,
	homeURL:				ZmMsg.AB_FIELD_URL,
	homePhone:				ZmMsg.AB_FIELD_homePhone,
	homePhone2:				ZmMsg.AB_FIELD_homePhone2,
	homeFax:				ZmMsg.AB_FIELD_homeFax,
	mobilePhone:			ZmMsg.AB_FIELD_mobilePhone,
	pager:					ZmMsg.AB_FIELD_pager,
	carPhone:				ZmMsg.AB_FIELD_carPhone,
	otherStreet:			ZmMsg.AB_FIELD_street,			// other info
	otherCity:				ZmMsg.AB_FIELD_city,
	otherState:				ZmMsg.AB_FIELD_state,
	otherPostalCode:		ZmMsg.AB_FIELD_postalCode,
	otherCountry:			ZmMsg.AB_FIELD_country,
	otherURL:				ZmMsg.AB_FIELD_URL,
	otherPhone:				ZmMsg.AB_FIELD_otherPhone,
	otherFax:				ZmMsg.AB_FIELD_otherFax,
	notes:					ZmMsg.notes,					// misc fields
	birthday:				ZmMsg.AB_FIELD_birthday
};

ZmContact._AB_FILE_AS = {
	1:						ZmMsg.AB_FILE_AS_lastFirst,
	2:						ZmMsg.AB_FILE_AS_firstLast,
	3:						ZmMsg.AB_FILE_AS_company,
	4:						ZmMsg.AB_FILE_AS_lastFirstCompany,
	5:						ZmMsg.AB_FILE_AS_firstLastCompany,
	6:						ZmMsg.AB_FILE_AS_companyLastFirst,
	7:						ZmMsg.AB_FILE_AS_companyFirstLast
};

} // if (!window.ZmContact)
