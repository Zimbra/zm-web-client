/**
* Creates an empty contact.
* @constructor
* @class
* This class represents a contact (typically a person) with all its associated versions
* of email address, home and work addresses, phone numbers, etc. Contacts can be filed/sorted
* in different ways, with the default being Last, First. A contact is an item, so
* it has tagging and flagging support, and belongs to a list.
*
* Most of a contact's data is kept in attributes. These include name, phone, etc. Meta-data and
* data common to items are not kept in attributes. These include flags, tags, folder, and
* modified/created dates. Since the attribute data for contacts is loaded only once, a contact
* gets its attribute values from that canonical list.
*/
function LmContact(appCtxt, list) {
	
	var contactList = appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
	list = list ? list : contactList;
	LmItem.call(this, appCtxt, LmItem.CONTACT, list);

	this.attr = new Object();
	// handle to canonical list (for contacts that are part of search results)
	if (!list.isCanonical && !list.isGal)
		this.canonicalList = contactList;

	this.isGal = this.list.isGal;

	this.participants = new LsVector(); // XXX: need to populate this guy (see LmConv)
	this._evt = new LmEvent(LmEvent.S_CONTACT);
}

LmContact.prototype = new LmItem;
LmContact.prototype.constructor = LmContact;

// fields
LmContact.F_assistantPhone	= "assistantPhone";
LmContact.F_callbackPhone	= "callbackPhone";
LmContact.F_carPhone		= "carPhone";
LmContact.F_company			= "company";
LmContact.F_companyPhone	= "companyPhone";
LmContact.F_email			= "email";
LmContact.F_email2			= "email2";
LmContact.F_email3			= "email3";
LmContact.F_fileAs			= "fileAs";
LmContact.F_firstName		= "firstName";
LmContact.F_homeCity		= "homeCity";
LmContact.F_homeCountry		= "homeCountry";
LmContact.F_homeFax			= "homeFax";
LmContact.F_homePhone		= "homePhone";
LmContact.F_homePhone2		= "homePhone2";
LmContact.F_homePostalCode	= "homePostalCode";
LmContact.F_homeState		= "homeState";
LmContact.F_homeStreet		= "homeStreet";
LmContact.F_homeURL			= "homeURL";
LmContact.F_jobTitle		= "jobTitle";
LmContact.F_lastName		= "lastName";
LmContact.F_middleName		= "middleName";
LmContact.F_mobilePhone		= "mobilePhone";
LmContact.F_namePrefix		= "namePrefix";
LmContact.F_nameSuffix		= "nameSuffix";
LmContact.F_notes			= "notes";
LmContact.F_otherCity		= "otherCity";
LmContact.F_otherCountry	= "otherCountry";
LmContact.F_otherFax		= "otherFax";
LmContact.F_otherPhone		= "otherPhone";
LmContact.F_otherPostalCode	= "otherPostalCode";
LmContact.F_otherState		= "otherState";
LmContact.F_otherStreet		= "otherStreet";
LmContact.F_otherURL		= "otherURL";
LmContact.F_pager			= "pager";
LmContact.F_workCity		= "workCity";
LmContact.F_workCountry		= "workCountry";
LmContact.F_workFax			= "workFax";
LmContact.F_workPhone		= "workPhone";
LmContact.F_workPhone2		= "workPhone2";
LmContact.F_workPostalCode	= "workPostalCode";
LmContact.F_workState		= "workState";
LmContact.F_workStreet		= "workStreet";
LmContact.F_workURL			= "workURL";

// extra fields
LmContact.X_firstLast		= "firstLast";
LmContact.X_fullName		= "fullName";

// file as
var i = 1;
LmContact.FA_LAST_C_FIRST			= i++;
LmContact.FA_FIRST_LAST 			= i++;
LmContact.FA_COMPANY 				= i++;
LmContact.FA_LAST_C_FIRST_COMPANY	= i++;
LmContact.FA_FIRST_LAST_COMPANY		= i++;
LmContact.FA_COMPANY_LAST_C_FIRST	= i++;
LmContact.FA_COMPANY_FIRST_LAST		= i++;

LmContact.F_EMAIL_FIELDS = [LmContact.F_email, LmContact.F_email2, LmContact.F_email3];

LmContact.prototype.toString = 
function() {
	return "LmContact: id = " + this.id + " fullName = " + this.getFullName();
}

// Class methods

/**
* Creates a contact from an XML node.
*
* @param node		a "cn" XML node
* @param args		args to pass to the constructor
*/
LmContact.createFromDom =
function(node, args) {
	var contact = new LmContact(args.appCtxt, args.list);
	contact._loadFromDom(node);
	contact._resetCachedFields();
	args.list._updateEmailHash(contact, true);

	return contact;
}

/**
* Compares two contacts based on how they are filed. Intended for use by
* sort methods.
*
* @param a		a contact
* @param b		a contact
*/
LmContact.compareByFileAs =
function(a, b) {
	if (a.getFileAs(true) > b.getFileAs(true)) return 1;
	if (a.getFileAs(true) < b.getFileAs(true)) return -1;
	return 0;
}

/**
* Figures out the filing string for the contact according to the chosen method.
*
* @param attr		a set of contact attributes
*/
LmContact.computeFileAs =
function(contact) {
	var attr = contact.getAttrs ? contact.getAttrs() : contact;
	var val = parseInt(attr.fileAs);

	var fa = new Array();
	var idx = 0;

	switch (val) {
		case LmContact.FA_LAST_C_FIRST: /* Last, First */
		default:
			if (attr.lastName) fa[idx++] = attr.lastName;
			if (attr.lastName && attr.firstName) fa[idx++] = ", ";
			if (attr.firstName) fa[idx++] = attr.firstName;
			break;
		case LmContact.FA_FIRST_LAST: /* First Last */
			if (attr.firstName) fa[idx++] = attr.firstName;
			if (attr.lastName && attr.firstName) fa[idx++] = " ";
			if (attr.lastName) fa[idx++] = attr.lastName;
			break;
		case LmContact.FA_COMPANY: /* Company */
			if (attr.company) fa[idx++] = attr.company;
			break;
		case LmContact.FA_LAST_C_FIRST_COMPANY: /* Last, First (Company) */
			if (attr.lastName) fa[idx++] = attr.lastName;
			if (attr.lastName && attr.firstName) fa[idx++] = ", ";
			if (attr.firstName) fa[idx++] = attr.firstName;
			if (attr.company) {
				if (attr.lastName || attr.firstName) fa[idx++] = " ";
				fa[idx++] = "(";
				fa[idx++] = attr.company;
				fa[idx++] = ")";
			}
			break;
		case LmContact.FA_FIRST_LAST_COMPANY: /* First Last (Company) */
			if (attr.firstName) fa[idx++] = attr.firstName;		
			if (attr.lastName && attr.firstName) fa[idx++] = " ";
			if (attr.lastName) fa[idx++] = attr.lastName;
			if (attr.company) {
				if (attr.lastName || attr.firstName) fa[idx++] = " ";
				fa[idx++] = "(";
				fa[idx++] = attr.company;
				fa[idx++] = ")";
			}			
			break;
		case LmContact.FA_COMPANY_LAST_C_FIRST: /* Company (Last,  First) */
			if (attr.company) fa[idx++] = attr.company;
			if (attr.lastName || attr.firstName) {
				fa[idx++] = " (";
				if (attr.lastName) fa[idx++] = attr.lastName;
				if (attr.lastName && attr.firstName) fa[idx++] = ", ";				
				if (attr.firstName) fa[idx++] = attr.firstName;
				fa[idx++] = ")";
			}
			break;
		case LmContact.FA_COMPANY_FIRST_LAST: /* Company (First Last) */
			if (attr.company) fa[idx++] = attr.company;
			if (attr.lastName || attr.firstName) {
				fa[idx++] = " (";
				if (attr.firstName) fa[idx++] = attr.firstName;				
				if (attr.lastName && attr.firstName) fa[idx++] = " ";
				if (attr.lastName) fa[idx++] = attr.lastName;
				fa[idx++] = ")";
			}
			break;
	}
	return fa.join("");
}

// Public methods

LmContact.prototype.getAttr =
function(name) {
	if (!this.list) return null;

	if (this.list.isCanonical || this.list.isGal) {
		return this.attr[name];
	} else {
		return this.canonicalList.getById(this.id).attr[name];
	}
}

LmContact.prototype.setAttr =
function(name, value) {
	if (!this.list) return;

	if (this.list.isCanonical || this.list.isGal) {
		this.attr[name] = value;
	} else {
		this.canonicalList.getById(this.id).attr[name] = value;
	}
}

LmContact.prototype.removeAttr =
function(name) {
	if (!this.list) return;

	if (this.list.isCanonical || this.list.isGal) {
		delete this.attr[name];
	} else {
		delete this.canonicalList.getById(this.id).attr[name];
	}
}

LmContact.prototype.getAttrs =
function() {
	return this.canonicalList ? this.canonicalList.getById(this.id).attr : this.attr;
}

/**
* Creates a contact from the given set of attributes. Used to create contacts on
* the fly (rather than by loading them). This method is called by a list's create()
* method; in our case that list is the canonical list of contacts.
*
* If this is a GAL contact, we assume it is being added to the contact list.
*
* @param attr		attr/value pairs for this contact
*/
LmContact.prototype.create =
function(attr) {
	DBG.println(LsDebug.DBG1, "LmContact.create");

	var soapDoc = LsSoapDoc.create("CreateContactRequest", "urn:liquidMail");
	var cn = soapDoc.set("cn");
	
	for (var name in attr) {
		var a = soapDoc.set("a", attr[name], cn);
		a.setAttribute("n", name);
	}
	
	var ac = this._appCtxt.getAppController();
	var resp = ac.sendRequest(soapDoc).CreateContactResponse;
	cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	if (id) {
		this._fileAs = null;
		this._fullName = null;
		this.id = id;
		this.modified = cn.md;
		this.folderId = LmFolder.ID_CONTACTS;
		for (var a in attr) {
			if (!(attr[a] == undefined || attr[a] == ''))
				this.setAttr(a, attr[a]);
		}
		
		ac.setStatusMsg(LmMsg.contactCreated);
	} else {
		var msg = LmMsg.errorCreateContact + " " + LmMsg.errorTryAgain + "\n" + LmMsg.errorContact;
		ac.setStatusMsg(msg);
	}
}

/**
* Updates contact attributes.
*
* @param attr		set of attributes and their new values
*/
LmContact.prototype.modify =
function(attr) {
	DBG.println(LsDebug.DBG1, "LmContact.modify");
	if (this.list.isGal) {
		DBG.println(LsDebug.DBG1, "Cannot modify GAL contact");
		return;
	}

	var soapDoc = LsSoapDoc.create("ModifyContactRequest", "urn:liquidMail");
	soapDoc.getMethod().setAttribute("replace", "0");
	// change force to 0 and put up dialog if we get a MODIFY_CONFLICT fault?
	soapDoc.getMethod().setAttribute("force", "1");
	var cn = soapDoc.set("cn");
	cn.setAttribute("md", this.modified);
	cn.setAttribute("id", this.id);
	
	for (var name in attr) {
		var a = soapDoc.set("a", attr[name], cn);
		a.setAttribute("n", name);
	}		
	
	var ac = this._appCtxt.getAppController();
	ac.setActionedIds([this.id]);
	var resp = ac.sendRequest(soapDoc).ModifyContactResponse;
	cn = resp ? resp.cn[0] : null;
	var id = cn ? cn.id : null;
	var details = null;
	
	if (id && id == this.id) {
		this.modified = cn.md;
		var oldFileAs = this.getFileAs();
		var oldFullName = this.getFullName();
		this._resetCachedFields();
		var oldAttr = new Object();
		for (var a in attr) {
			oldAttr[a] = this.getAttr(a);
			if (attr[a] == undefined || attr[a] == '') {
				this.removeAttr(a);
			} else {
				this.setAttr(a, attr[a]);
			}
		}
		details = {attr: attr, oldAttr: oldAttr, fullNameChanged: this.getFullName() != oldFullName,
					   fileAsChanged: this.getFileAs() != oldFileAs, contact: this};

		ac.setStatusMsg(LmMsg.contactModify);
	} else {
		var msg = LmMsg.errorModifyContact + " " + LmMsg.errorTryAgain + "\n" + LmMsg.errorContact;
		ac.setStatusMsg(msg);
	}
	
	return details;
}

/**
* Sets this contacts email address.
*
* @param email		an LmEmailAddress, or an email string
*/
LmContact.prototype.initFromEmail =
function(email) {
	if (email instanceof LmEmailAddress) {
		this.setAttr(LmContact.F_email, email.getAddress());
		this._initFullName(email);
	} else {
		this.setAttr(LmContact.F_email, email);
	}
}

LmContact.prototype.initFromPhone = 
function(phone) {
	this.setAttr(LmContact.F_companyPhone, phone);
}

LmContact.prototype.getEmail =
function() {
	for (var i = 0; i < LmContact.F_EMAIL_FIELDS.length; i++) {
		var value = this.getAttr(LmContact.F_EMAIL_FIELDS[i]);
		if (value)
			return value;
	}
	return null;
}

// returns a list (array) of all valid emails for this contact
LmContact.prototype.getEmails = 
function() {
	var emails = new Array();
	for (var i = 0; i < LmContact.F_EMAIL_FIELDS.length; i++) {
		var value = this.getAttr(LmContact.F_EMAIL_FIELDS[i]);
		if (value)
			emails.push(value);
	}
	return emails;
}

/**
* Returns the full name.
*/
LmContact.prototype.getFullName =
function() {
	// update/null if modified
	if (!this._fullName) {
		var fn = new Array();
		var idx = 0;
		var first = this.getAttr(LmContact.F_firstName);
		var middle = this.getAttr(LmContact.F_middleName);
		var last = this.getAttr(LmContact.F_lastName);
		if (first) fn[idx++] = first;
		if (middle) fn[idx++] = middle;
		if (last) fn[idx++] = last;
		this._fullName = fn.join(" ");
	}
	return this._fullName;
}

/**
* Returns HTML for a tool tip for this contact.
*/
LmContact.prototype.getToolTip =
function(email) {
	// update/null if modified
	if (!this._toolTip || this._toolTipEmail != email) {
		var html = new Array();
		var idx = 0;
		var entryTitle = this.getFileAs();
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0>";
		html[idx++] = "<tr><td colspan=2 valign=top>";
		html[idx++] = "<div style='border-bottom: 1px solid black;'>";
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%>";
		html[idx++] = "<tr valign='center'>";
		html[idx++] = "<td><b>" + LsStringUtil.htmlEncode(entryTitle) + "</b></td>";
		html[idx++] = "<td align='right'>";
		html[idx++] = LsImg.getImageHtml(LmImg.I_CONTACT); // could use different icon if GAL
		html[idx++] = "</td>";
		html[idx++] = "</table></div>";
		html[idx++] = "</td></tr>";
		idx = this._addEntryRow("fullName", null, html, idx);
		idx = this._addEntryRow("jobTitle", null, html, idx);
		idx = this._addEntryRow("company", null, html, idx);
		idx = this._addEntryRow("workPhone", null, html, idx);	
		idx = this._addEntryRow("email", email, html, idx);
		html[idx++] = "</table>";
		this._toolTip = html.join("");
		this._toolTipEmail = email;
	}
	return this._toolTip;
}

/**
* Returns the filing string for this contact, computing it if necessary.
*/
LmContact.prototype.getFileAs =
function(lower) {
	// update/null if modified
	if (!this._fileAs) {
		this._fileAs = LmContact.computeFileAs(this);
		this._fileAsLC = this._fileAs.toLowerCase();
	}
	return lower === true ? this._fileAsLC : this._fileAs;
};

LmContact.prototype.getHeader = 
function() {
	return this.id ? this.getFileAs() : LmMsg.newContact;
};

// company field has a getter b/c fileAs may be the Company name so 
// company field should return "last, first" name instead *or* 
// prepend the title if fileAs is not Company (assuming it exists)
LmContact.prototype.getCompanyField = 
function() {

	var attrs = this.getAttrs();
	var fa = parseInt(attrs.fileAs);
	
	var val = new Array();
	var idx = 0;
	
	if (fa == LmContact.FA_LAST_C_FIRST || fa == LmContact.FA_FIRST_LAST) {
		// return the title, company name
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			if (attrs.company)
				val[idx++] = ", ";
		}
		if (attrs.company)
			val[idx++] = attrs.company;
		
	} else if (fa == LmContact.FA_COMPANY) {
		// return the first/last name
		if (attrs.firstName) {
			val[idx++] = attrs.firstName;
			if (attrs.lastName)
				val[idx++] = ", ";
		}
		
		if (attrs.lastName)
			val[idx++] = attrs.lastName;
		
		if (attrs.jobTitle)
			val[idx++] = " (" + attrs.jobTitle + ")";
	
	} else {
		// just return the title
		if (attrs.jobTitle) {
			val[idx++] = attrs.jobTitle;
			// and/or company name if applicable
			if (attrs.company && (attrs.fileAs == null || fa == LmContact.FA_LAST_C_FIRST || fa == LmContact.FA_FIRST_LAST))
				val[idx++] = ", ";
		}
		if (attrs.company && (attrs.fileAs == null || fa == LmContact.FA_LAST_C_FIRST || fa == LmContact.FA_FIRST_LAST))
			 val[idx++] = attrs.company;
	}
	if (val.length == 0) return null;	
	return val.join("");
}

LmContact.prototype.getWorkAddrField = 
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.workStreet, attrs.workCity, attrs.workState, attrs.workPostalCode, attrs.workCountry);
}

LmContact.prototype.getHomeAddrField = 
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.homeStreet, attrs.homeCity, attrs.homeState, attrs.homePostalCode, attrs.homeCountry);
}

LmContact.prototype.getOtherAddrField = 
function(instance) {
	var attrs = this.getAttrs();
	return this._getAddressField(attrs.otherStreet, attrs.otherCity, attrs.otherState, attrs.otherPostalCode, attrs.otherCountry);
}

LmContact.prototype._getAddressField = 
function(street, city, state, zipcode, country) {
	if (street == null && city == null && state == null && zipcode == null && country == null) return null;
	
	var html = new Array();
	var idx = 0;
	
	if (street) {
		html[idx++] = street;
		if (city || state || zipcode)
			html[idx++] = "<br>";
	}
	
	if (city) {
		html[idx++] = city;
		if (state)
			html[idx++] = ", ";
	}
	
	if (state) {
		html[idx++] = state;
		if (zipcode)
			html[idx++] = " ";
	}
	
	if (zipcode)
		html[idx++] = zipcode;
	
	if (country)
		html[idx++] = "<br>" + country;
	
	return html.join("");
}

// IM presence
LmContact.prototype.hasIMProfile =
function() {
	return (this.id % 3) > 0;
}

// IM presence
LmContact.prototype.isIMAvailable =
function() {
	return (this.id % 3) == 2;
}

// Sets the full name based on an email address.
LmContact.prototype._initFullName =
function(email) {
	var name = email.getName();
	if (name && name.length) {
		this._setFullName(name, [" "]);
	} else {
		name = email.getAddress();
		if (name && name.length) {
			var i = name.indexOf("@");
			if (i == -1) return;
			name = name.substr(0, i);
			this._setFullName(name, [".", "_"]);
		}
	}
}

// Tries to extract a set of name components from the given text, with the
// given list of possible delimiters. The first delimiter contained in the
// text will be used. If none are found, the first delimiter in the list is
// used.
LmContact.prototype._setFullName =
function(text, delims) {
	var delim = delims[0];
	for (var i = 0; i < delims.length; i++) {
		if (text.indexOf(delims[i]) != -1) {
			delim = delims[i];
			break;
		}
	}
	var parts = text.split(delim, 3);
	this.setAttr(LmContact.F_firstName, parts[0]);
	if (parts.length == 2) {
		this.setAttr(LmContact.F_lastName, parts[1]);
	} else if (parts.length == 3) {
		this.setAttr(LmContact.F_middleName, parts[1]);
		this.setAttr(LmContact.F_lastName, parts[2]);
	}
}

// Adds a row to the tool tip.
LmContact.prototype._addEntryRow =
function(field, data, html, idx) {
	if (data == null) {
		data = field == "fullName" ? this.getFullName() : this.getAttr(field);	
	}
	if (data != null && data != "") {
		html[idx++] = "<tr valign=top>";
		html[idx++] = "<td align=right style='white-space:nowrap; padding-right:5px;'><b>";
		html[idx++] = LsStringUtil.htmlEncode(LmMsg.AB_FIELD[field]) + ":";
		html[idx++] = "</b></td>";
		html[idx++] = "<td style='white-space:nowrap;'>";
		html[idx++] = LsStringUtil.htmlEncode(data);
		html[idx++] = "</td>";
		html[idx++] = "</tr>";
	}
	return idx;
}

// Reset computed fields.
LmContact.prototype._resetCachedFields =
function() {
	this._fileAs = null;
	this._fullName = null;
	this._toolTip = null;
}

// Parse a contact node. A contact will only have attribute values if it is in the canonical list.
LmContact.prototype._loadFromDom =
function(node) {
	this.id = node.id;
	this.created = node.cd;
	this.modified = node.md;
	this.folderId = node.l;
	this._parseFlags(node.f);
	this._parseTags(node.t);
	this.attr = node._attrs;
}
