/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
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
 * @param {object}	newDl		true if this is a new DL
 *
 * @extends		ZmItem
 */
ZmContact = function(id, list, type, newDl) {
	if (arguments.length == 0) { return; }

	type = type || ZmItem.CONTACT;
	ZmItem.call(this, type, id, list);

	this.attr = {};
	this.isGal = (this.list && this.list.isGal) || newDl;
	if (newDl) {
		this.folderId = ZmFolder.ID_DLS;
		this.dlInfo = {	isMember: false,
						isOwner: true,
						subscriptionPolicy: null,
						unsubscriptionPolicy: null,
						description: "",
						displayName: "",
						notes: "",
						hideInGal: false,
						mailPolicy: null,
						owners: [appCtxt.get(ZmSetting.USERNAME)]
		};

	}

	this.participants = new AjxVector(); // XXX: need to populate this guy (see ZmConv)
};

ZmContact.prototype = new ZmItem;
ZmContact.prototype.constructor = ZmContact;
ZmContact.prototype.isZmContact = true;

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
ZmContact.F_dlDisplayName			= "dldisplayname"; //DL
ZmContact.F_dlDesc					= "dldesc";  //DL
ZmContact.F_dlHideInGal				= "dlhideingal";  //DL
ZmContact.F_dlNotes					= "dlnotes";  //DL
ZmContact.F_dlSubscriptionPolicy	= "dlsubspolicy";  //DL
ZmContact.F_dlMailPolicy			= "dlmailpolicy";  //DL
ZmContact.F_dlMailPolicySpecificMailers	= "dlmailpolicyspecificmailers";  //DL
ZmContact.F_dlUnsubscriptionPolicy	= "dlunsubspolicy";  //DL
ZmContact.F_dlListOwners			= "dllistowners";  //DL
ZmContact.F_email					= "email";
ZmContact.F_email2					= "email2";
ZmContact.F_email3					= "email3";
ZmContact.F_email4					= "email4";
ZmContact.F_email5					= "email5";
ZmContact.F_email6					= "email6";
ZmContact.F_email7					= "email7";
ZmContact.F_email8					= "email8";
ZmContact.F_email9					= "email9";
ZmContact.F_email10					= "email10";
ZmContact.F_email11					= "email11";
ZmContact.F_email12					= "email12";
ZmContact.F_email13					= "email13";
ZmContact.F_email14					= "email14";
ZmContact.F_email15					= "email15";
ZmContact.F_email16					= "email16";
ZmContact.F_fileAs					= "fileAs";
ZmContact.F_firstName				= "firstName";
ZmContact.F_folderId				= "folderId";
ZmContact.F_groups                  = "groups";         //group members
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
ZmContact.F_memberC                 = "memberC";
ZmContact.F_memberG                 = "memberG";
ZmContact.F_memberI                 = "memberI";
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
ZmContact.F_phoneticFirstName       = "phoneticFirstName";
ZmContact.F_phoneticLastName        = "phoneticLastName";
ZmContact.F_phoneticCompany         = "phoneticCompany";
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
ZmContact.F_imagepart               = "imagepart";          // New field for bug 73146 - Contacts call does not return the image information
ZmContact.F_zimletImage				= "zimletImage";
ZmContact.X_fileAs					= "fileAs";				// extra fields
ZmContact.X_firstLast				= "firstLast";
ZmContact.X_fullName				= "fullName";
ZmContact.X_vcardXProps             = "vcardXProps";
ZmContact.X_outlookUserField        = "outlookUserField";
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
(function() {
	var i = 1;
	ZmContact.FA_LAST_C_FIRST			= i++;
	ZmContact.FA_FIRST_LAST 			= i++;
	ZmContact.FA_COMPANY 				= i++;
	ZmContact.FA_LAST_C_FIRST_COMPANY	= i++;
	ZmContact.FA_FIRST_LAST_COMPANY		= i++;
	ZmContact.FA_COMPANY_LAST_C_FIRST	= i++;
	ZmContact.FA_COMPANY_FIRST_LAST		= i++;
	ZmContact.FA_CUSTOM					= i++;
})();

// Field information

ZmContact.ADDRESS_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
	ZmContact.F_homeCity,
	ZmContact.F_homeCountry,
	ZmContact.F_homePostalCode,
	ZmContact.F_homeState,
	ZmContact.F_homeStreet,
	ZmContact.F_workCity,
	ZmContact.F_workCountry,
	ZmContact.F_workPostalCode,
	ZmContact.F_workState,
	ZmContact.F_workStreet,
    ZmContact.F_otherCity,
    ZmContact.F_otherCountry,
    ZmContact.F_otherPostalCode,
    ZmContact.F_otherState,
    ZmContact.F_otherStreet
];
ZmContact.EMAIL_FIELDS = [
	ZmContact.F_email,
	ZmContact.F_workEmail1,
	ZmContact.F_workEmail2,
	ZmContact.F_workEmail3
];
ZmContact.IM_FIELDS = [
	ZmContact.F_imAddress
];
ZmContact.OTHER_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
	ZmContact.F_birthday,
    ZmContact.F_anniversary,
	ZmContact.F_custom
];
ZmContact.PHONE_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
    ZmContact.F_mobilePhone,
    ZmContact.F_workPhone,
    ZmContact.F_workFax,
    ZmContact.F_companyPhone,
    ZmContact.F_homePhone,
    ZmContact.F_homeFax,
    ZmContact.F_pager,
    ZmContact.F_callbackPhone,
	ZmContact.F_assistantPhone,
	ZmContact.F_carPhone,
	ZmContact.F_otherPhone,
    ZmContact.F_otherFax,
	ZmContact.F_workAltPhone,
	ZmContact.F_workMobile
];
ZmContact.PRIMARY_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
    ZmContact.F_image,
    ZmContact.F_namePrefix,
    ZmContact.F_firstName,
    ZmContact.F_phoneticFirstName,
    ZmContact.F_middleName,
	ZmContact.F_maidenName,
    ZmContact.F_lastName,
    ZmContact.F_phoneticLastName,
    ZmContact.F_nameSuffix,
    ZmContact.F_nickname,
    ZmContact.F_jobTitle,
    ZmContact.F_department,
	ZmContact.F_company,
    ZmContact.F_phoneticCompany,
	ZmContact.F_fileAs,
	ZmContact.F_folderId,
	ZmContact.F_notes
];
ZmContact.URL_FIELDS = [
    // NOTE: sync with field order in ZmEditContactView's templates
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
	ZmContact.GAL_CAL_RES_LOC_NAME,
	ZmContact.F_type
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

ZmContact.ADDR_PREFIXES = ["work","home","other"];
ZmContact.ADDR_SUFFIXES = ["Street","City","State","PostalCode","Country"];

ZmContact.updateFieldConstants = function() {

	for (var i = 0; i < ZmContact.ADDR_PREFIXES.length; i++) {
		for (var j = 0; j < ZmContact.ADDR_SUFFIXES.length; j++) {
			ZmContact.IGNORE_NORMALIZATION.push(ZmContact.ADDR_PREFIXES[i] + ZmContact.ADDR_SUFFIXES[j]);
		}
	}

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
	ZmContact.X_FIELDS,
	[ZmContact.F_imagepart]
);

ZmContact.ALL_FIELDS = [].concat(
	ZmContact.DISPLAY_FIELDS, ZmContact.IGNORE_FIELDS
);

ZmContact.IS_DATE = {};
ZmContact.IS_DATE[ZmContact.F_birthday] = true;
ZmContact.IS_DATE[ZmContact.F_anniversary] = true;

ZmContact.IS_IGNORE = AjxUtil.arrayAsHash(ZmContact.IGNORE_FIELDS);

// number of distribution list members to fetch at a time
ZmContact.DL_PAGE_SIZE = 100;

ZmContact.GROUP_CONTACT_REF = "C";
ZmContact.GROUP_GAL_REF = "G";
ZmContact.GROUP_INLINE_REF = "I";	
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
ZmContact.IS_ADDONE[ZmContact.X_outlookUserField] = true;

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
		if (args.isGal) {
			contact.isGal = args.isGal;
		}
		contact._loadFromDom(node);
		//update the canonical list
		appCtxt.getApp(ZmApp.CONTACTS).getContactList().add(contact);
	} else {
		if (node.m) {
			contact.attr[ZmContact.F_groups] = node.m;
		}
		if (node.ref) {
			contact.ref = node.ref;
		}
		if (node.tn) {
			contact._parseTagNames(node.tn);
		}
		AjxUtil.hashUpdate(contact.attr, node._attrs);	// merge new attrs just in case we don't have them
		contact.list = args.list || new ZmContactList(null);
		contact._list = {};
		contact._list[contact.list.id] = true;
	}
	//S/MIME: If user certificate is present, include it into contact's object
	if (node.certificate) {
		contact.certificate = node.certificate;
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
	/*
	 * Bug 98176: To keep the same logic of generating the FileAs contact
	 *    label string between the Ajax client, and HTML client, when the
	 *    computeFileAs(), and fileAs*() functions are modified, please
	 *    change the corresponding functions defined in the autoComplete.tag
	 */
	var attr = (contact instanceof ZmContact) ? contact.getAttrs() : contact;
	if (!attr) return;

	if (attr[ZmContact.F_dlDisplayName]) {
		//this is only DL case. But since this is sometimes just the attrs,
		//I can't always use isDistributionList method.
		return attr[ZmContact.F_dlDisplayName];
	}

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
				return ((attr.email instanceof Array) ? attr.email[0] : attr.email);
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
	return last || first || fullname || nickname || "";
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
 * returns the prefix of a string in the format "abc123". (would return "abc"). If the string is all number, it's a special case and returns the string itself. e.g. "234" would return "234".
 */
ZmContact.getPrefix = function(s) {
	var trimmed = s.replace(/\d+$/, "");
	if (trimmed === "") {
		//number only - don't trim. The number is the prefix.
		return s;
	}
	return trimmed;
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
			var nprefix = ZmContact.getPrefix(name);
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
function(callback, errorCallback, batchCmd, deref) {
	var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
	if (deref) {
		jsonObj.GetContactsRequest.derefGroupMember = "1";
	}
	jsonObj.GetContactsRequest.returnCertInfo = "1"; //Fix for: ZCS-999 and ZCS-991
	var request = jsonObj.GetContactsRequest;
	request.cn = [{id:this.id}];

	var respCallback = new AjxCallback(this, this._handleLoadResponse, [callback]);

	if (batchCmd) {
		var jsonObj = {GetContactsRequest:{_jsns:"urn:zimbraMail"}};
		if (deref) {
			jsonObj.GetContactsRequest.derefGroupMember = "1";
		}
		jsonObj.GetContactsRequest.returnCertInfo = "1"; //Fix for: ZCS-999 and ZCS-991
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
	var contact = resp.cn[0];
	this.attr = contact._attrs;
	if (contact.m) {
		for (var i = 0; i < contact.m.length; i++) {
			//cache contacts from contact groups (e.g. GAL contacts, shared contacts have not already been cached)
			var member = contact.m[i];
			var isGal = false;
			if (member.type == ZmContact.GROUP_GAL_REF) {
				isGal = true;
			}
			if (member.cn && member.cn.length > 0) {
				var memberContact = member.cn[0];
				memberContact.ref = memberContact.ref || (isGal && member.value); //we sometimes don't get "ref" but the "value" for GAL is the ref.
				var loadMember = ZmContact.createFromDom(memberContact, {list: this.list, isGal: isGal}); //pass GAL so fileAS gets set correctly
				loadMember.isDL = isGal && loadMember.attr[ZmContact.F_type] == "group";
				appCtxt.cacheSet(member.value, loadMember);
			}
			
		}
		this._loadFromDom(contact); //load group
	}
	this.isLoaded = true;
	if (callback) {
		callback.run(contact, this);
	}
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
 * Checks if the contact is locked. This is different for DLs than read-only.
 *
 * @return	{Boolean}	<code>true</code> if read-only
 */
ZmContact.prototype.isLocked =
function() {
	if (!this.isDistributionList()) {
		return this.isReadOnly();
	}
	if (!this.dlInfo) {
		return false; //rare case after editing by an owner if the fileAsChanged, the new dl Info still not read, and the layout re-done. So don't show the lock.
	}
	var dlInfo = this.dlInfo;
	if (dlInfo.isOwner) {
		return false;
	}
	if (dlInfo.isMember) {
    	return dlInfo.unsubscriptionPolicy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT;
	}
	return dlInfo.subscriptionPolicy == ZmContactSplitView.SUBSCRIPTION_POLICY_REJECT;
};

/**
 * Checks if the contact is a group.
 * 
 * @return	{Boolean}	<code>true</code> if a group
 */
ZmContact.prototype.isGroup =
function() {
	return this.getAttr(ZmContact.F_type) == "group" || this.type == ZmItem.GROUP;
};

/**
 * Checks if the contact is a DL.
 *
 * @return	{Boolean}	<code>true</code> if a group
 */
ZmContact.prototype.isDistributionList =
function() {
	return this.isGal && this.isGroup();
};


// parses "groups" attr into AjxEmailAddress objects stored in 3 vectors (all, good, and bad)
/**
 * Gets the group members.
 *
 * @return	{AjxVector}		the group members or <code>null</code> if not group
 */
ZmContact.prototype.getGroupMembers =
function() {
	var allMembers = this.getAllGroupMembers();
	var addrs = [];
	for (var i = 0; i < allMembers.length; i++) {
		addrs.push(allMembers[i].toString());
	}
	return AjxEmailAddress.parseEmailString(addrs.join(", "));
};	

/**
 * parses "groups" attr into an AjxEmailAddress with a few extra attributes (see ZmContactsHelper._wrapInlineContact)
 * 
 * @return	{AjxVector}		the group members or <code>null</code> if not group
 */
ZmContact.prototype.getAllGroupMembers =
function() {

	if (this.isDistributionList()) {
		return this.dlMembers;
	}

	var addrs = [];

	var groupMembers = this.attr[ZmContact.F_groups];
	if (!groupMembers){
		return AjxEmailAddress.parseEmailString(this.attr[ZmContact.F_email]);  //I doubt this is needed or works correctly, but I keep this logic from before. If we don't have the group members, how can we return the group email instead?
	}
	for (var i = 0; i < groupMembers.length; i++) {
		var member = groupMembers[i];
		var type = member.type;
		var value = member.value;
		if (type == ZmContact.GROUP_INLINE_REF) {
			addrs.push(ZmContactsHelper._wrapInlineContact(value));
		}
		else {
			var contact = ZmContact.getContactFromCache(value);	 //TODO: handle contacts not cached?
			if (!contact) {
				DBG.println(AjxDebug.DBG1, "Disregarding uncached contact: " + value);
				continue;
			}
			var ajxEmailAddress = ZmContactsHelper._wrapContact(contact);
			if (ajxEmailAddress && type === ZmContact.GROUP_CONTACT_REF) {
				ajxEmailAddress.groupRefValue = value; //don't normalize value
			}
			if (ajxEmailAddress) {
				addrs.push(ajxEmailAddress);
			}
		}
	}
	return addrs;
};


ZmContact.prototype.gatherExtraDlStuff =
function(callback) {
	if (this.dlInfo && !this.dlInfo.isMinimal) {
		//already there, skip to next step, loading DL Members
		this.loadDlMembers(callback);
		return;
	}
	var callbackFromGettingInfo = this._handleGetDlInfoResponse.bind(this, callback);
	this.loadDlInfo(callbackFromGettingInfo);
};


ZmContact.prototype._handleGetDlInfoResponse =
function(callback, result) {
	var response = result._data.GetDistributionListResponse;
	var dl = response.dl[0];
	var attrs = dl._attrs;
	var isMember = dl.isMember;
	var isOwner = dl.isOwner;
	var mailPolicySpecificMailers = [];
	this.dlInfo = {	isMember: isMember,
						isOwner: isOwner,
						subscriptionPolicy: attrs.zimbraDistributionListSubscriptionPolicy,
						unsubscriptionPolicy: attrs.zimbraDistributionListUnsubscriptionPolicy,
						description: attrs.description || "",
						displayName: attrs.displayName || "",
						notes: attrs.zimbraNotes || "",
						hideInGal: attrs.zimbraHideInGal == "TRUE",
						mailPolicy: isOwner && this._getMailPolicy(dl, mailPolicySpecificMailers),
						owners: isOwner && this._getOwners(dl)};
	this.dlInfo.mailPolicySpecificMailers = mailPolicySpecificMailers;

	this.loadDlMembers(callback);
};

ZmContact.prototype.loadDlMembers =
function(callback) {
	if ((!appCtxt.get("EXPAND_DL_ENABLED") || this.dlInfo.hideInGal) && !this.dlInfo.isOwner) {
		// can't get members if dl has zimbraHideInGal true, and not owner
		//also, if zimbraFeatureDistributionListExpandMembersEnabled is false - also do not show the members (again unless it's the owner)
		this.dlMembers = [];
		if (callback) {
			callback();
		}
		return;
	}
	if (this.dlMembers) {
		//already there - just callback
		if (callback) {
			callback();
		}
		return;
	}
	var respCallback = this._handleGetDlMembersResponse.bind(this, callback);
	this.getAllDLMembers(respCallback);
};


ZmContact.prototype._handleGetDlMembersResponse =
function(callback, result) {
	var list = result.list;
	if (!list) {
		this.dlMembers = [];
		callback();
		return;
	}
	var members = [];
	for (var i = 0; i < list.length; i++) {
		members.push({type: ZmContact.GROUP_INLINE_REF,
						value: list[i],
						address: list[i]});
	}

	this.dlMembers = members;
	callback();
};

ZmContact.prototype._getOwners =
function(dl) {
	var owners = dl.owners[0].owner;
	var ownersArray = [];
	for (var i = 0; i < owners.length; i++) {
		var owner = owners[i].name;
		ownersArray.push(owner); //just the email address, I think and hope.
	}
	return ownersArray;
};

ZmContact.prototype._getMailPolicy =
function(dl, specificMailers) {
	var mailPolicy;

	var rights = dl.rights[0].right;
	var right = rights[0];
	var grantees = right.grantee;
	if (!grantees) {
		return ZmGroupView.MAIL_POLICY_ANYONE;
	}
	for (var i = 0; i < grantees.length; i++) {
		var grantee = grantees[i];

		mailPolicy = ZmGroupView.GRANTEE_TYPE_TO_MAIL_POLICY_MAP[grantee.type];

		if (mailPolicy == ZmGroupView.MAIL_POLICY_SPECIFIC) {
			specificMailers.push(grantee.name);
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_ANYONE) {
			break;
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_INTERNAL) {
			break;
		}
		else if (mailPolicy == ZmGroupView.MAIL_POLICY_MEMBERS) {
			if (grantee.name == this.getEmail()) {
				//this means only members of this DL can send.
				break;
			}
			else {
				//must be another DL, and we do allow it, so treat it as regular user.
				specificMailers.push(grantee.name);
				mailPolicy = ZmGroupView.MAIL_POLICY_SPECIFIC;
			}
		}
	}
	mailPolicy = mailPolicy || ZmGroupView.MAIL_POLICY_ANYONE;

	return mailPolicy;
};


ZmContact.prototype.loadDlInfo =
function(callback) {
	var soapDoc = AjxSoapDoc.create("GetDistributionListRequest", "urn:zimbraAccount", null);
	soapDoc.setMethodAttribute("needOwners", "1");
	soapDoc.setMethodAttribute("needRights", "sendToDistList");
	var elBy = soapDoc.set("dl", this.getEmail());
	elBy.setAttribute("by", "name");

	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback});
};

ZmContact.prototype.toggleSubscription =
function(callback) {
	var soapDoc = AjxSoapDoc.create("SubscribeDistributionListRequest", "urn:zimbraAccount", null);
	soapDoc.setMethodAttribute("op", this.dlInfo.isMember ? "unsubscribe" : "subscribe");
	var elBy = soapDoc.set("dl", this.getEmail());
	elBy.setAttribute("by", "name");
	appCtxt.getAppController().sendRequest({soapDoc: soapDoc, asyncMode: true, callback: callback});
};



/**
 *  Returns the contact id.  If includeUserZid is true it will return the format zid:id
 * @param includeUserZid {boolean} true to include the zid prefix for the contact id
 * @return {String} contact id string
 */
ZmContact.prototype.getId = 
function(includeUserZid) {

	if (includeUserZid) {
		return this.isShared() ? this.id : appCtxt.accountList.mainAccount.id + ":" + this.id; 
	}
	
	return this.id;
};
/**
 * Gets the icon.
 * @param 	{ZmAddrBook} addrBook	address book of contact 
 * @return	{String}	the icon
 */
ZmContact.prototype.getIcon =
function(addrBook) {
	if (this.isDistributionList()) 						{ return "DistributionList"; }
	if (this.isGal)										{ return "GALContact"; }
	if (this.isShared() || (addrBook && addrBook.link))	{ return "SharedContact"; }
	if (this.isGroup())									{ return "Group"; }
	return "Contact";
};

ZmContact.prototype.getIconLarge =
function() {
	if (this.isDistributionList()) {
		return "Group_48";
	}
	//todo - get a big version of ImgGalContact.png
//	if (this.isGal) {
//	}
	return "Person_48";
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
			var namePrefix = ZmContact.getPrefix(aname);
			if (namePrefix === prefix) {
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
* @param {boolean} isAutoCreate true if this is a auto create and toast message should not be shown
*/
ZmContact.prototype.create =
function(attr, batchCmd, isAutoCreate) {

	if (this.isDistributionList()) {
		this._createDl(attr);
		return;
	}

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
	cn.m = [];

	for (var name in attr) {
		if (name == ZmContact.F_folderId ||
			name == "objectClass" ||
			name == "zimbraId" ||
			name == "createTimeStamp" ||
			name == "modifyTimeStamp") { continue; }

		if (name == ZmContact.F_groups) {
			this._addContactGroupAttr(cn, attr);
		}
		else {
			this._addRequestAttr(cn, name, attr[name]);
		}
	}

	this._addRequestAttr(cn, ZmContact.X_fullName, ZmContact.computeFileAs(attr));

	var respCallback = new AjxCallback(this, this._handleResponseCreate, [attr, batchCmd != null, isAutoCreate]);

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
function(attr, isBatchMode, isAutoCreate, result) {
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
		var groupMembers = cn ? cn.m : null;
		if (groupMembers) {
			this.attr[ZmContact.F_groups] = groupMembers;
			cn._attrs[ZmContact.F_groups] = groupMembers;
		}
		if (!isAutoCreate) {
			var msg = this.isGroup() ? ZmMsg.groupCreated : ZmMsg.contactCreated;
			appCtxt.getAppController().setStatusMsg(msg);
		}
		//update the canonical list. (this includes adding to the _idHash like before (bug 44132) calling updateIdHash. But calling that left the list inconcistant.
		appCtxt.getApp(ZmApp.CONTACTS).getContactList().add(cn);
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
 * @param {boolean} isAutoSave  true if it is a auto save and toast should not be displayed.
 */
ZmContact.prototype.modify =
function(attr, callback, isAutoSave, batchCmd) {
	if (this.isDistributionList()) {
		this._modifyDl(attr);
		return;
	}
	if (this.list.isGal) { return; }

	// change force to 0 and put up dialog if we get a MODIFY_CONFLICT fault?
	var jsonObj = {ModifyContactRequest:{_jsns:"urn:zimbraMail", replace:"0", force:"1"}};
	var cn = jsonObj.ModifyContactRequest.cn = {id:this.id};
	cn.a = [];
	cn.m = [];
	var continueRequest = false;
	
	for (var name in attr) {
		if (name == ZmContact.F_folderId) { continue; }
		if (name == ZmContact.F_groups) {
			this._addContactGroupAttr(cn, attr);	
		}
		else {
			this._addRequestAttr(cn, name, (attr[name] && attr[name].value) || attr[name]);
		}
		continueRequest = true;
	}

    // bug: 45026
    if (ZmContact.F_firstName in attr || ZmContact.F_lastName in attr || ZmContact.F_company in attr || ZmContact.X_fileAs in attr) {
        var contact = {};
        var fields = [ZmContact.F_firstName, ZmContact.F_lastName, ZmContact.F_company, ZmContact.X_fileAs];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var value = attr[field];
            contact[field] = value != null ? value : this.getAttr(field);
        }
        var fullName = ZmContact.computeFileAs(contact); 
        this._addRequestAttr(cn, ZmContact.X_fullName, fullName);
    }

	if (continueRequest) {
		if (batchCmd) {
			batchCmd.addRequestParams(jsonObj, null, null); //no need for response callback for current use-case (batch modifying zimlet image)
		}
		else {
			var respCallback = this._handleResponseModify.bind(this, attr, callback, isAutoSave);
			appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
		}

	} else {
		if (attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
	}
};

ZmContact.prototype._createDl =
function(attr) {

	this.attr = attr; //this is mainly important for the email. attr is not set before this.

	var createDlReq = this._getCreateDlReq(attr);

	var reqs = [];

	this._addMemberModsReqs(reqs, attr);

	this._addMailPolicyAndOwnersReqs(reqs, attr);

	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			CreateDistributionListRequest: createDlReq,
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._createDlResponseHandler.bind(this);
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});
	
};

ZmContact.prototype._addMailPolicyAndOwnersReqs =
function(reqs, attr) {

	var mailPolicy = attr[ZmContact.F_dlMailPolicy];
	if (mailPolicy) {
		reqs.push(this._getSetMailPolicyReq(mailPolicy, attr[ZmContact.F_dlMailPolicySpecificMailers]));
	}

	var listOwners = attr[ZmContact.F_dlListOwners];
	if (listOwners) {
		reqs.push(this._getSetOwnersReq(listOwners));
	}


};



ZmContact.prototype._addMemberModsReqs =
function(reqs, attr) {
	var memberModifications = attr[ZmContact.F_groups];
	var adds = [];
	var removes = [];
	if (memberModifications) {
		for (var i = 0; i < memberModifications.length; i++) {
			var mod = memberModifications[i];
			var col = (mod.op == "+" ? adds : removes);
			col.push(mod);
		}
	}

	if (adds.length > 0) {
		reqs.push(this._getAddOrRemoveReq(adds, true));
	}
	if (removes.length > 0) {
		reqs.push(this._getAddOrRemoveReq(removes, false));
	}
};

ZmContact.prototype._modifyDl =
function(attr) {
	var reqs = [];

	var newEmail = attr[ZmContact.F_email];

	var emailChanged = false;
	if (newEmail !== undefined) {
		emailChanged = true;
		reqs.push(this._getRenameDlReq(newEmail));
		this.setAttr(ZmContact.F_email, newEmail);
	}

	var modDlReq = this._getModifyDlAttributesReq(attr);
	if (modDlReq) {
		reqs.push(modDlReq);
	}

	var displayName = attr[ZmContact.F_dlDisplayName];
	if (displayName !== undefined) {
		this.setAttr(ZmContact.F_dlDisplayName, displayName);
	}

	var oldFileAs = this.getFileAs();
	this._resetCachedFields();
	var fileAsChanged = oldFileAs != this.getFileAs();

	this._addMemberModsReqs(reqs, attr);

	this._addMailPolicyAndOwnersReqs(reqs, attr);

	if (reqs.length == 0) {
		this._modifyDlResponseHandler(false, null); //pretend it was saved
		return;
	}
	var jsonObj = {
		BatchRequest: {
			_jsns: "urn:zimbra",
			DistributionListActionRequest: reqs
		}
	};
	var respCallback = this._modifyDlResponseHandler.bind(this, fileAsChanged || emailChanged); //there's some issue with fileAsChanged so adding the emailChanged to be on safe side
	appCtxt.getAppController().sendRequest({jsonObj: jsonObj, asyncMode: true, callback: respCallback});

};

ZmContact.prototype._getAddOrRemoveReq =
function(members, add) {
	var req = {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: add ? "addMembers" : "removeMembers",
			dlm: []
		}
	};
	for (var i = 0; i < members.length; i++) {
		var member = members[i];
		req.action.dlm.push({_content: member.email});
	}
	return req;

};


ZmContact.prototype._getRenameDlReq =
function(name) {
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "rename",
			newName: {_content: name}
		}
	};
};

ZmContact.prototype._getSetOwnersReq =
function(owners) {
	var ownersPart = [];
	for (var i = 0; i < owners.length; i++) {
		ownersPart.push({
			type: ZmGroupView.GRANTEE_TYPE_USER,
			by: "name",
			_content: owners[i]
		});
	}
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "setOwners",
			owner: ownersPart
		}
	};
};

ZmContact.prototype._getSetMailPolicyReq =
function(mailPolicy, specificMailers) {
	var grantees = [];
	if (mailPolicy == ZmGroupView.MAIL_POLICY_SPECIFIC) {
		for (var i = 0; i < specificMailers.length; i++) {
			grantees.push({
				type: ZmGroupView.GRANTEE_TYPE_EMAIL,
				by: "name",
				_content: specificMailers[i]
			});
		}
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_ANYONE) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_PUBLIC
		});
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_INTERNAL) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_ALL
		});
	}
	else if (mailPolicy == ZmGroupView.MAIL_POLICY_MEMBERS) {
		grantees.push({
			type: ZmGroupView.GRANTEE_TYPE_GROUP,
			by: "name",
			_content: this.getEmail()
		});
	}
	else {
		throw "invalid mailPolicy value " + mailPolicy;
	}

	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "setRights",
			right: {
				right: "sendToDistList",
				grantee: grantees
			}
		}
	};

};

ZmContact.prototype._addDlAttribute =
function(attrs, mods, name, soapAttrName) {
	var attr = mods[name];
	if (attr === undefined) {
		return;
	}
	attrs.push({n: soapAttrName, _content: attr});
};

ZmContact.prototype._getDlAttributes =
function(mods) {
	var attrs = [];
	this._addDlAttribute(attrs, mods, ZmContact.F_dlDisplayName, "displayName");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlDesc, "description");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlNotes, "zimbraNotes");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlHideInGal, "zimbraHideInGal");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlSubscriptionPolicy, "zimbraDistributionListSubscriptionPolicy");
	this._addDlAttribute(attrs, mods, ZmContact.F_dlUnsubscriptionPolicy, "zimbraDistributionListUnsubscriptionPolicy");

	return attrs;
};


ZmContact.prototype._getCreateDlReq =
function(attr) {
	return {
		_jsns: "urn:zimbraAccount",
		name: attr[ZmContact.F_email],
		a: this._getDlAttributes(attr),
		dynamic: false
	};
};

ZmContact.prototype._getModifyDlAttributesReq =
function(attr) {
	var modAttrs = this._getDlAttributes(attr);
	if (modAttrs.length == 0) {
		return null;
	}
	return {
		_jsns: "urn:zimbraAccount",
		dl: {by: "name",
			 _content: this.getEmail()
		},
		action: {
			op: "modify",
			a: modAttrs
		}
	};
};

ZmContact.prototype._modifyDlResponseHandler =
function(fileAsChanged, result) {
	if (this._handleErrorDl(result)) {
		return;
	}
	appCtxt.setStatusMsg(ZmMsg.dlSaved);

	//for DLs we reload from the server since the server does not send notifications.
	this.clearDlInfo();

	var details = {
		fileAsChanged: fileAsChanged
	};

	this._popView(fileAsChanged);

	this._notify(ZmEvent.E_MODIFY, details);
};

ZmContact.prototype._createDlResponseHandler =
function(result) {
	if (this._handleErrorDl(result, true)) {
		this.attr = {}; //since above in _createDl, we set it to new values prematurely. which would affect next gathering of modified attributes.
		return;
	}
	appCtxt.setStatusMsg(ZmMsg.distributionListCreated);

	this._popView(true);
};

ZmContact.prototype._popView =
function(updateDlList) {
	var controller = AjxDispatcher.run("GetContactController");
	controller.popView(true);
	if (!updateDlList) {
		return;
	}
	var clc = AjxDispatcher.run("GetContactListController");
	if (clc.getFolderId() != ZmFolder.ID_DLS) {
		return;
	}
	ZmAddrBookTreeController.dlFolderClicked(); //This is important in case of new DL created OR a renamed DL, so it would reflect in the list.
};

ZmContact.prototype._handleErrorDl =
function(result, creation) {
	if (!result) {
		return false;
	}
	var batchResp = result.getResponse().BatchResponse;
	var faults = batchResp.Fault;
	if (!faults) {
		return false;
	}
	var ex = ZmCsfeCommand.faultToEx(faults[0]);
	var controller = AjxDispatcher.run("GetContactController");
	controller.popupErrorDialog(creation ? ZmMsg.dlCreateFailed : ZmMsg.dlModifyFailed, ex);
	return true;

};

ZmContact.prototype.clearDlInfo =
function () {
	this.dlMembers = null;
	this.dlInfo = null;
	var app = appCtxt.getApp(ZmApp.CONTACTS);
	app.cacheDL(this.getEmail(), null); //clear the cache for this DL.
	appCtxt.cacheRemove(this.getId()); //also some other cache.
};

/**
 * @private
 */
ZmContact.prototype._handleResponseModify =
function(attr, callback, isAutoSave, result) {
	var resp = result.getResponse().ModifyContactResponse;
	var cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	var groupMembers = cn ? cn.m : null;
	if (groupMembers) {
		this.attr[ZmContact.F_groups] = groupMembers;
		cn._attrs[ZmContact.F_groups] = groupMembers;	
	}

	if (id && id == this.id) {
		if (!isAutoSave) {
			appCtxt.setStatusMsg(this.isGroup() ? ZmMsg.groupSaved : ZmMsg.contactSaved);
		}
		// was this contact moved to another folder?
		if (attr[ZmContact.F_folderId] && this.folderId != attr[ZmContact.F_folderId]) {
			this._setFolder(attr[ZmContact.F_folderId]);
		}
		appCtxt.getApp(ZmApp.CONTACTS).updateIdHash(cn, false);
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
	if (newFolder) {
		appCtxt.setStatusMsg(ZmList.getActionSummary({
			actionTextKey:  'actionMove',
			numItems:       count,
			type:           ZmItem.CONTACT,
			actionArg:      newFolder.name
		}));
	}

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
		if (obj.m) {
			this.setAttr(ZmContact.F_groups, obj.m);
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
	for (var listId in this._list) {
		var list = listId && appCtxt.getById(listId);
		if (!list) { continue; }
		list.modifyLocal(obj, details);
	}

	this._notify(ZmEvent.E_MODIFY, obj);
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
 * @param {boolean}		asObj	if true, return an AjxEmailAddress
 * 
 * @return	the email address
 */
ZmContact.prototype.getEmail =
function(asObj) {

	var email = (this.getAttr(ZmContact.F_email) ||
				 this.getAttr(ZmContact.F_workEmail1) ||
				 this.getAttr(ZmContact.F_email2) ||
				 this.getAttr(ZmContact.F_workEmail2) ||
				 this.getAttr(ZmContact.F_email3) ||
				 this.getAttr(ZmContact.F_workEmail3));
	
	if (asObj) {
		email = AjxEmailAddress.parse(email);
        if(email){
		    email.isGroup = this.isGroup();
		    email.canExpand = this.canExpand;
        }
	}
	
	return email;
};

/**
 * Returns user's phone number
 * @return {String} phone number
 */
ZmContact.prototype.getPhone = 
function() {
	var phone = (this.getAttr(ZmContact.F_mobilePhone) ||
				this.getAttr(ZmContact.F_workPhone) || 
				this.getAttr(ZmContact.F_homePhone) ||
				this.getAttr(ZmContact.F_otherPhone));
	return phone;
};

    
/**
 * Gets the lookup email address, when an contact object is located using email address we store
 * the referred email address in this variable for easy lookup
 *
 * @param {boolean}		asObj	if true, return an AjxEmailAddress
 *
 * @return	the lookup address
 */
ZmContact.prototype.getLookupEmail =
function(asObj) {
    var email = this._lookupEmail;

    if (asObj && email) {
        email = AjxEmailAddress.parse(email);
        email.isGroup = this.isGroup();
        email.canExpand = this.canExpand;
    }

	return  email;
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
function(html) {
    var fullNameHtml = null;
	if (!this._fullName || html) {
		var fullName = this.getAttr(ZmContact.X_fullName); // present if GAL contact
		if (fullName) {
			this._fullName = (fullName instanceof Array) ? fullName[0] : fullName;
		}
        else {
            this._fullName = this.getFullNameForDisplay(false);
        }

        if (html) {
            fullNameHtml = this.getFullNameForDisplay(html);
        }
	}

	// as a last resort, set it to fileAs
	if (!this._fullName) {
		this._fullName = this.getFileAs();
	}

	return fullNameHtml || this._fullName;
};

/*
* Gets the fullname for display -- includes (if applicable): prefix, first, middle, maiden, last, suffix
*
* @param {boolean}  if phonetic fields should be used
* @return {String}  the fullname for display
*/
ZmContact.prototype.getFullNameForDisplay =
function(html){
	if (this.isDistributionList()) {
		//I'm not sure where that fullName is set sometime to the display name. This is so complicated
		// I'm trying to set attr[ZmContact.F_dlDisplayName] to the display name but in soem cases it's not.
		return this.getAttr(ZmContact.F_dlDisplayName) || this.getAttr("fullName");
	}
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
    if (appCtxt.get(ZmSetting.LOCALE_NAME) === "ja") {
        var fileAsId = this.getAttr(ZmContact.F_fileAs);
        if (!AjxUtil.isEmpty(fileAsId) && fileAsId !== "1" && fileAsId !== "4" && fileAsId !== "6") {
            /* When Japanese locale is selected, in the most every case, the name should be
             * displayed as "Last First" which is set by the default pattern (ZmMsg_ja.fullname).
             * But if the contact entry's fileAs field explicitly specifies the display
             * format as "First Last", we should override the pattern to lay it out so.
             * For other locales, it is not necessary to override the pattern: The default pattern is
             * already set as "First Last", and even the FileAs specifies as "Last, First", the display
             * name is always expected to be displayed as "First Last".
             */
            pattern = "{0} {1} {2} {4}";
        }
    }
    var formatter = new AjxMessageFormat(pattern);
    var args = [prefix,first,middle,maiden,last,suffix];
    if (!html){
        return AjxStringUtil.trim(formatter.format(args), true);
    }

    return this._getFullNameHtml(formatter, args);
};

/**
 * @param formatter
 * @param parts {Array} Name parts: [prefix,first,middle,maiden,last,suffix]
 */
ZmContact.prototype._getFullNameHtml = function(formatter, parts) {
    var a = [];
    var segments = formatter.getSegments();
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        if (segment instanceof AjxFormat.TextSegment) {
            a.push(segment.format());
            continue;
        }
        // NOTE: Assume that it's a AjxMessageFormat.MessageSegment
        // NOTE: if not a AjxFormat.TextSegment.
        var index = segment.getIndex();
        var base = parts[index];
        var text = ZmContact.__RUBY_FIELDS[index] && this.getAttr(ZmContact.__RUBY_FIELDS[index]);
        a.push(AjxStringUtil.htmlRubyEncode(base, text));
    }
    return a.join("");
};
ZmContact.__RUBY_FIELDS = [
    null, ZmContact.F_phoneticFirstName, null, null,
    ZmContact.F_phoneticLastName, null
];

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
		hint: hint
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
 * Gets the filing string for this contact, from the email address (used in case no name exists).
 * todo - maybe return this from getFileAs, but there are a lot of callers to getFileAs, and not sure
 * of the implications on all the use-cases.
 *
 * @return	{String}	the file as string
 */
ZmContact.prototype.getFileAsNoName = function() {
	return [ZmMsg.noName, this.getEmail()].join(" ");
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

ZmContact.NO_MAX_IMAGE_WIDTH = ZmContact.NO_MAX_IMAGE_HEIGHT = - 1;

/**
 * Get the image URL.
 *
 * Please note that maxWidth and maxHeight are hints, as they have no
 * effect on Zimlet-supplied images.
 *
 * maxWidth {int} max pixel width (optional - default 48, or pass ZmContact.NO_MAX_IMAGE_WIDTH if full size image is required)
 * maxHeight {int} max pixel height (optional - default to maxWidth, or pass ZmContact.NO_MAX_IMAGE_HEIGHT if full size image is required)
 * @return	{String}	the image URL
 */
ZmContact.prototype.getImageUrl =
function(maxWidth, maxHeight) {
  	var image = this.getAttr(ZmContact.F_image);
	var imagePart  = image && image.part || this.getAttr(ZmContact.F_imagepart); //see bug 73146

	if (!imagePart) {
		return this.getAttr(ZmContact.F_zimletImage);  //return zimlet populated image only if user-uploaded image is not there.
	}
  	var msgFetchUrl = appCtxt.get(ZmSetting.CSFE_MSG_FETCHER_URI);
	var maxWidthStyle = "";
	if (maxWidth !== ZmContact.NO_MAX_IMAGE_WIDTH) {
		maxWidth = maxWidth || 48;
		maxWidthStyle = ["&max_width=", maxWidth].join("");
	}
	var maxHeightStyle = "";
	if (maxHeight !== ZmContact.NO_MAX_IMAGE_HEIGHT) {
		maxHeight = maxHeight ||
			(maxWidth !== ZmContact.NO_MAX_IMAGE_WIDTH ? maxWidth : 48);
		maxHeightStyle = ["&max_height=", maxHeight].join("");
	}
  	return  [msgFetchUrl, "&id=", this.id, "&part=", imagePart, maxWidthStyle, maxHeightStyle, "&t=", (new Date()).getTime()].join("");
};

ZmContact.prototype.addModifyZimletImageToBatch =
function(batchCmd, image) {
	var attr = {};
	if (this.getAttr(ZmContact.F_zimletImage) === image) {
		return; //no need to update if same
	}
	attr[ZmContact.F_zimletImage] = image;
	batchCmd.add(this.modify.bind(this, attr, null, true));
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
    var parts = text.split(delim);
    var func = this["__setFullName_"+AjxEnv.DEFAULT_LOCALE] || this.__setFullName;
    func.call(this, parts, text, delims);
};

ZmContact.prototype.__setFullName = function(parts, text, delims) {
    this.setAttr(ZmContact.F_firstName, parts[0]);
    if (parts.length == 2) {
        this.setAttr(ZmContact.F_lastName, parts[1]);
    } else if (parts.length == 3) {
        this.setAttr(ZmContact.F_middleName, parts[1]);
        this.setAttr(ZmContact.F_lastName, parts[2]);
    }
};
ZmContact.prototype.__setFullName_ja = function(parts, text, delims) {
    if (parts.length > 2) {
        this.__setFullName(parts, text, delims);
        return;
    }
    // TODO: Perhaps do some analysis to auto-detect Japanese vs.
    // TODO: non-Japanese names. For example, if the name text is
    // TODO: comprised of kanji, treat it as "last first"; else if
    // TODO: first part is all uppercase, treat it as "last first";
    // TODO: else treat it as "first last".
    this.setAttr(ZmContact.F_lastName, parts[0]);
    if (parts.length > 1) {
        this.setAttr(ZmContact.F_firstName, parts[1]);
    }
};
ZmContact.prototype.__setFullName_ja_JP = ZmContact.prototype.__setFullName_ja;

/**
 * @private
 */
ZmContact.prototype._addRequestAttr =
function(cn, name, value) {
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

    if (value instanceof Array) {
        if (!cn._attrs)
            cn._attrs = {};
        cn._attrs[name] = value || "";
    }
    else  {
        if (!cn.a)
            cn.a = [];
        cn.a.push(a);
    }
};
	
ZmContact.prototype._addContactGroupAttr = 
function(cn, group) {
	var groupMembers = group[ZmContact.F_groups];
	for (var i = 0; i < groupMembers.length; i++) {
		var member = groupMembers[i];
		if (!cn.m) {
			cn.m = [];
		}

		var m = {type: member.type,	value: member.value}; //for the JSON object this is all we need.
		if (member.op) {
			m.op = member.op; //this is only for modify, not for create.
		}
		cn.m.push(m);
	}
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
	this.sf = node.sf || node._attrs.sf;
	if (!this.isGal) {
		this.folderId = node.l;
	}
	this.created = node.cd;
	this.modified = node.md;

	this.attr = node._attrs || {};
	if (node.m) {
		this.attr[ZmContact.F_groups] = node.m;
	}

	this.ref = node.ref || this.attr.dn; //bug 78425
	
	// for shared contacts, we get these fields outside of the attr part
	if (node.email)		{ this.attr[ZmContact.F_email] = node.email; }
	if (node.email2)	{ this.attr[ZmContact.F_email2] = node.email2; }
	if (node.email3)	{ this.attr[ZmContact.F_email3] = node.email3; }

	// in case attrs are coming in from an external GAL, make an effort to map them, including multivalued ones
	this.attr = ZmContact.mapAttrs(this.attr);

    //the attr groups is returned as [] so check both null and empty array to set the type
    var groups = this.attr[ZmContact.F_groups];
    if(!groups || (groups instanceof Array && groups.length == 0)) {
        this.type = ZmItem.CONTACT;
    }
    else {
        this.type = ZmItem.GROUP;
    }

	// check if the folderId is found in our address book (otherwise, we assume
	// this contact to be a shared contact)
	var ac = window.parentAppCtxt || window.appCtxt;
	this.addrbook = ac.getById(this.folderId);

	this._parseTagNames(node.tn);

	// dont process flags for shared contacts until we get server support
	if (!this.isShared()) {
		this._parseFlags(node.f);
	} else {
		// shared contacts are never fully loaded since we never cache them
		this.isLoaded = false;
	}

	// bug: 22174
	// We ignore the server's computed file-as property and instead
	// format it based on the user's locale.
	this._fileAs = ZmContact.computeFileAs(this);

	// Is this a distribution list?
	this.isDL = this.isDistributionList();
	if (this.isDL) {
		this.dlInfo = { //this is minimal DL info, available mainly to allow to know whether to show the lock or not.
			isMinimal: true,
			isMember: node.isMember,
			isOwner: node.isOwner,
			subscriptionPolicy: this.attr.zimbraDistributionListSubscriptionPolicy,
			unsubscriptionPolicy: this.attr.zimbraDistributionListUnsubscriptionPolicy,
			displayName: node.d || "",
			hideInGal: this.attr.zimbraHideInGal == "TRUE"
		};

		this.canExpand = node.exp !== false; //default to true, since most cases this is implicitly true if not returned. See bug 94867
		var emails = this.getEmails();
		var ac = window.parentAppCtxt || window.appCtxt;
		for (var i = 0; i < emails.length; i++) {
			ac.setIsExpandableDL(emails[i], this.canExpand);
		}
	}
	//S/MIME: If user certificate is present, include it into contact's object
	if (node.certificate) {
		this.certificate = node.certificate;
	}
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
	var email = this.getEmail(true);
	return (email?email.toString(shortForm || (type && type != ZmCalBaseItem.PERSON)):"");
};

/**
 * Gets display text for an attendee. Prefers name over email.
 *
 * @param {constant}	type		the attendee type
 * @param {Boolean}	shortForm		if <code>true</code>, return only name or email
 * @return	{String}	the attendee
 */
ZmContact.prototype.getAttendeeKey =
function() {
	var email = this.getLookupEmail() || this.getEmail();
	var name = this.getFullName();
	return email ? email : name;
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
		var field = ZmContact.getPrefix(aname);
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
ZmContact.prototype.getFields =
function(fields, sortByNameFunc) {
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

/**
 * Returns a list of distribution list members for this contact. Only the
 * requested range is returned.
 *
 * @param offset	{int}			offset into list to start at
 * @param limit		{int}			number of members to fetch and return
 * @param callback	{AjxCallback}	callback to run with results
 */
ZmContact.prototype.getDLMembers =
function(offset, limit, callback) {

	var result = {list:[], more:false, isDL:{}};
	if (!this.isDL) { return result; }

	var email = this.getEmail();
	var app = appCtxt.getApp(ZmApp.CONTACTS);
	var dl = app.getDL(email);
	if (!dl) {
		dl = result;
		dl.more = true;
		app.cacheDL(email, dl);
	}

	limit = limit || ZmContact.DL_PAGE_SIZE;
	var start = offset || 0;
	var end = (offset + limit) - 1;

	// see if we already have the requested members, or know that we don't
	if (dl.list.length >= end + 1 || !dl.more) {
		var list = dl.list.slice(offset, end + 1);
		result = {list:list, more:dl.more || (dl.list.length > end + 1), isDL:dl.isDL};
		DBG.println("dl", "found cached DL members");
		this._handleResponseGetDLMembers(start, limit, callback, result);
		return;
	}

	DBG.println("dl", "server call " + offset + " / " + limit);
	if (!dl.total || (offset < dl.total)) {
		var jsonObj = {GetDistributionListMembersRequest:{_jsns:"urn:zimbraAccount", offset:offset, limit:limit}};
		var request = jsonObj.GetDistributionListMembersRequest;
		request.dl = {_content: this.getEmail()};
		var respCallback = new AjxCallback(this, this._handleResponseGetDLMembers, [offset, limit, callback]);
		appCtxt.getAppController().sendRequest({jsonObj:jsonObj, asyncMode:true, callback:respCallback});
	} else {
		this._handleResponseGetDLMembers(start, limit, callback, result);
	}
};

ZmContact.prototype._handleResponseGetDLMembers =
function(offset, limit, callback, result, resp) {

	if (resp || !result.list) {
		var list = [];
		resp = resp || result.getResponse();  //if response is passed, take it. Otherwise get it from result
		resp = resp.GetDistributionListMembersResponse;
		var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
		var more = dl.more = resp.more;
		var isDL = {};
		var members = resp.dlm;
		if (members && members.length) {
			for (var i = 0, len = members.length; i < len; i++) {
				var member = members[i]._content;
				list.push(member);
				dl.list[offset + i] = member;
				if (members[i].isDL) {
					isDL[member] = dl.isDL[member] = true;
				}
			}
		}
		dl.total = resp.total;
		DBG.println("dl", list.join("<br>"));
		var result = {list:list, more:more, isDL:isDL};
	}
	DBG.println("dl", "returning list of " + result.list.length + ", more is " + result.more);
	if (callback) {
		callback.run(result);
	}
	else { //synchronized case - see ZmContact.prototype.getDLMembers above
		return result;
	}
};

/**
 * Returns a list of all the distribution list members for this contact.
 *
 * @param callback	{AjxCallback}	callback to run with results
 */
ZmContact.prototype.getAllDLMembers =
function(callback) {

	var result = {list:[], more:false, isDL:{}};
	if (!this.isDL) { return result; }

	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
	if (dl && !dl.more) {
		result = {list:dl.list.slice(), more:false, isDL:dl.isDL};
		callback.run(result);
		return;
	}

	var nextCallback = new AjxCallback(this, this._getNextDLChunk, [callback]);
	this.getDLMembers(dl ? dl.list.length : 0, null, nextCallback);
};

ZmContact.prototype._getNextDLChunk =
function(callback, result) {

	var dl = appCtxt.getApp(ZmApp.CONTACTS).getDL(this.getEmail());
	if (result.more) {
		var nextCallback = new AjxCallback(this, this._getNextDLChunk, [callback]);
		this.getDLMembers(dl.list.length, null, nextCallback);
	} else {
		result.list = dl.list.slice();
		callback.run(result);
	}
};

/**
 * Gets the contact from cache handling parsing of contactId
 * 
 * @param contactId {String} contact id
 * @return contact {ZmContact} contact or null
 * @private
 */
ZmContact.getContactFromCache =
function(contactId) {
	var userZid = appCtxt.accountList.mainAccount.id;
	var contact = null;
	if (contactId && contactId.indexOf(userZid + ":") !=-1) {
		//strip off the usersZid to pull from cache
		var arr = contactId.split(userZid + ":");
		contact = arr && arr.length > 1 ? appCtxt.cacheGet(arr[1]) : appCtxt.cacheGet(contactId);
	}
	else {
		contact = appCtxt.cacheGet(contactId);
	}
	if (contact instanceof ZmContact) {
		return contact;
	}
	return null;
};

// For mapAttrs(), prepare a hash where each key is the base name of an attr (without an ending number and lowercased),
// and the value is a numerically sorted list of attr names in their original form.
ZmContact.ATTR_VARIANTS = {};
ZmContact.IGNORE_ATTR_VARIANT = {};
ZmContact.IGNORE_ATTR_VARIANT[ZmContact.F_groups] = true;

ZmContact.initAttrVariants = function(attrClass) {
	var keys = Object.keys(attrClass),
		len = keys.length, key, i, attr,
		attrs = [];

	// first, grab all the attr names
	var ignoreVariant = attrClass.IGNORE_ATTR_VARIANT || {};
	for (i = 0; i < len; i++) {
		key = keys[i];
		if (key.indexOf('F_') === 0) {
			attr = attrClass[key];
			if (!ignoreVariant[attr]) {
				attrs.push(attr);
			}
		}
	}

	// sort numerically, eg so that we get ['email', 'email2', 'email10'] in right order
	var numRegex = /^([a-zA-Z]+)(\d+)$/;
	attrs.sort(function(a, b) {
		var aMatch = a.match(numRegex),
			bMatch = b.match(numRegex);
		// check if both are numbered attrs with same base
		if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
			return aMatch[2] - bMatch[2];
		}
		else {
			return a > b ? 1 : (a < b ? -1 : 0);
		}
	});

	// construct hash mapping generic base name to its iterated attr names
	var attr, base;
	for (i = 0; i < attrs.length; i++) {
		attr = attrs[i];
		base = attr.replace(/\d+$/, '').toLowerCase();
		if (!ZmContact.ATTR_VARIANTS[base]) {
			ZmContact.ATTR_VARIANTS[base] = [];
		}
		ZmContact.ATTR_VARIANTS[base].push(attr);
	}
};
ZmContact.initAttrVariants(ZmContact);

/**
 * Takes a hash of attrs and values and maps it to our attr names as best as it can. Scalar attrs will map if they
 * have the same name or only differ by case. A multivalued attr will map to a set of our attributes that share the
 * same case-insensitive base name. Some examples:
 *
 *      FIRSTNAME: "Mildred"    =>      firstName: "Mildred"
 *      email: ['a', 'b']       =>      email: 'a',
 *                                      email2: 'b'
 *      WorkEmail: ['y', 'z']   =>      workEmail1: 'y',
 *                                      workEmail2: 'z'
 *      IMaddress: ['f', 'g']   =>      imAddress1: 'f',
 *                                      imAddress2: 'g'
 *
 * @param   {Object}    attrs       hash of attr names/values
 *
 * @returns {Object}    hash of attr names/values using known attr names ZmContact.F_*
 */
ZmContact.mapAttrs = function(attrs) {

	var attr, value, baseAttrs, newAttrs = {};
	for (attr in attrs) {
		value = attrs[attr];
		if (value) {
			baseAttrs = ZmContact.ATTR_VARIANTS[attr.toLowerCase()];
			if (baseAttrs) {
				value = AjxUtil.toArray(value);
				var len = Math.min(value.length, baseAttrs.length), i;
				for (i = 0; i < len; i++) {
					newAttrs[baseAttrs[i]] = value[i];
				}
			} else {
				// Any overlooked/ignored attributes are simply passed along
				newAttrs[attr] = value;
			}
		}
	}
	return newAttrs;
};

// these need to be kept in sync with ZmContact.F_*
ZmContact._AB_FIELD = {
	firstName:				ZmMsg.AB_FIELD_firstName,		// file as info
	lastName:				ZmMsg.AB_FIELD_lastName,
	middleName:				ZmMsg.AB_FIELD_middleName,
	fullName:				ZmMsg.AB_FIELD_fullName,
	jobTitle:				ZmMsg.AB_FIELD_jobTitle,
	company:				ZmMsg.AB_FIELD_company,
	department:				ZmMsg.AB_FIELD_department,
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
