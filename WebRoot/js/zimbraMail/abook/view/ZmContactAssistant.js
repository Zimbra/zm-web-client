/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2009, 2010 Zimbra, Inc.
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
 * This file contains the contact assistant class.
 */

/**
 * Creates a contact assistant.
 * @class
 * This class represents a contact assistant.
 * 
 * @extends	ZmAssistant
 */
ZmContactAssistant = function() {
	ZmAssistant.call(this, ZmMsg.createNewContact, ZmMsg.ASST_CMD_CONTACT, ZmMsg.ASST_CMD_SUM_CONTACT);
	this._commandIndex = {};	
	this._sortedFields = [];
	for (var i=0; i < ZmContactAssistant._CONTACT_FIELDS.length; i++) {
		var f = ZmContactAssistant._CONTACT_FIELDS[i];
		this._sortedFields.push(f.scmd);
		this._commandIndex[f.scmd.toLowerCase()] = i;
		this._commandIndex[f.lcmd.toLowerCase()] = i;		
	}
	this._sortedFields.sort();
};

ZmContactAssistant.prototype = new ZmAssistant();
ZmContactAssistant.prototype.constructor = ZmContactAssistant;

/**
 * @private
 */
ZmContactAssistant.prototype._lookupField =
function(key) {
	key = key.toLowerCase();
	if (key in this._commandIndex) {
		return ZmContactAssistant._CONTACT_FIELDS[this._commandIndex[key]];
	} else {
		return null;
	}
}

// fields are displayed in this order as they are populated
ZmContactAssistant._CONTACT_FIELDS = [
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_firstName, lcmd: ZmMsg.ASST_CONTACT_LONG_firstName, field: ZmMsg.AB_FIELD_firstName, key: ZmContact.F_firstName, dontShow: true, capitalize: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_middleName, lcmd: ZmMsg.ASST_CONTACT_LONG_middleName, field: ZmMsg.AB_FIELD_middleName, key: ZmContact.F_middleName, dontShow: true, capitalize: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_lastName, lcmd: ZmMsg.ASST_CONTACT_LONG_lastName, field: ZmMsg.AB_FIELD_lastName, key: ZmContact.F_lastName, dontShow: true, capitalize: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_jobTitle, lcmd: ZmMsg.ASST_CONTACT_LONG_jobTitle, field: ZmMsg.AB_FIELD_jobTitle, key: ZmContact.F_jobTitle, capitalize: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_company, lcmd: ZmMsg.ASST_CONTACT_LONG_company, field: ZmMsg.AB_FIELD_company, key: ZmContact.F_company , capitalize: true},
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_email, lcmd: ZmMsg.ASST_CONTACT_LONG_email, field: ZmMsg.AB_FIELD_email, key: ZmContact.F_email, defaultValue: ZmMsg.ASST_CONTACT_email },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_email2, lcmd: ZmMsg.ASST_CONTACT_LONG_email2, field: ZmMsg.AB_FIELD_email2, key: ZmContact.F_email2 },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_email3, lcmd: ZmMsg.ASST_CONTACT_LONG_email3, field: ZmMsg.AB_FIELD_email3, key: ZmContact.F_email3 },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_workPhone, field: ZmMsg.AB_FIELD_workPhone, key: ZmContact.F_workPhone, defaultValue: ZmMsg.ASST_CONTACT_phone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workPhone2, lcmd: ZmMsg.ASST_CONTACT_LONG_workPhone2, field: ZmMsg.AB_FIELD_workPhone2, key: ZmContact.F_workPhone2 },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_mobilePhone, lcmd: ZmMsg.ASST_CONTACT_LONG_mobilePhone, field: ZmMsg.AB_FIELD_mobilePhone, key: ZmContact.F_mobilePhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_pager, lcmd: ZmMsg.ASST_CONTACT_LONG_pager, field: ZmMsg.AB_FIELD_pager, key: ZmContact.F_pager },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workFax, lcmd: ZmMsg.ASST_CONTACT_LONG_workFax, field: ZmMsg.AB_FIELD_workFax, key: ZmContact.F_workFax },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_assistantPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_assistantPhone, field: ZmMsg.AB_FIELD_assistantPhone, key: ZmContact.F_assistantPhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_carPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_carPhone, field: ZmMsg.AB_FIELD_carPhone, key: ZmContact.F_carPhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_companyPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_companyPhone, field: ZmMsg.AB_FIELD_companyPhone, key: ZmContact.F_companyPhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_callbackPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_callbackPhone, field: ZmMsg.AB_FIELD_callbackPhone, key: ZmContact.F_callbackPhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workAddress, lcmd: ZmMsg.ASST_CONTACT_LONG_workAddress, field: ZmMsg.AB_ADDR_WORK, key: 'wa', multiLine: true, noHelp: true},
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workStreet, lcmd: ZmMsg.ASST_CONTACT_LONG_workStreet, field: ZmMsg.AB_FIELD_workStreet, key: ZmContact.F_workStreet, defaultValue: ZmMsg.ASST_CONTACT_address },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workCity, lcmd: ZmMsg.ASST_CONTACT_LONG_workCity, field: ZmMsg.AB_FIELD_workCity, key: ZmContact.F_workCity },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workState, lcmd: ZmMsg.ASST_CONTACT_LONG_workState, field: ZmMsg.AB_FIELD_workState, key: ZmContact.F_workState },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workPostalCode, lcmd: ZmMsg.ASST_CONTACT_LONG_workPostalCode, field: ZmMsg.AB_FIELD_workPostalCode, key: ZmContact.F_workPostalCode },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workCountry, lcmd: ZmMsg.ASST_CONTACT_LONG_workCountry, field: ZmMsg.AB_FIELD_workCountry, key: ZmContact.F_workCountry },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_workURL, lcmd: ZmMsg.ASST_CONTACT_LONG_workURL, field: ZmMsg.AB_WORK_URL, key: ZmContact.F_workURL, defaultValue: ZmMsg.ASST_CONTACT_url },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homePhone, lcmd: ZmMsg.ASST_CONTACT_LONG_homePhone, field: ZmMsg.AB_FIELD_homePhone, key: ZmContact.F_homePhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homePhone2, lcmd: ZmMsg.ASST_CONTACT_LONG_homePhone2, field: ZmMsg.AB_FIELD_homePhone2, key: ZmContact.F_homePhone2 },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeFax, lcmd: ZmMsg.ASST_CONTACT_LONG_homeFax, field: ZmMsg.AB_FIELD_homeFax, key: ZmContact.F_homeFax },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeAddress, lcmd: ZmMsg.ASST_CONTACT_LONG_homeAddress, field: ZmMsg.AB_ADDR_HOME, key: 'ha', multiline: true, noHelp: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeStreet, lcmd: ZmMsg.ASST_CONTACT_LONG_homeStreet, field: ZmMsg.AB_FIELD_homeStreet, key: ZmContact.F_homeStreet },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeCity, lcmd: ZmMsg.ASST_CONTACT_LONG_homeCity, field: ZmMsg.AB_FIELD_homeCity, key: ZmContact.F_homeCity },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeState, lcmd: ZmMsg.ASST_CONTACT_LONG_homeState, field: ZmMsg.AB_FIELD_homeState, key: ZmContact.F_homeState },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homePostalCode, lcmd: ZmMsg.ASST_CONTACT_LONG_homePostalCode, field: ZmMsg.AB_FIELD_homePostalCode, key: ZmContact.F_homePostalCode },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeCountry, lcmd: ZmMsg.ASST_CONTACT_LONG_homeCountry, field: ZmMsg.AB_FIELD_homeCountry, key: ZmContact.F_homeCountry },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_homeURL, lcmd: ZmMsg.ASST_CONTACT_LONG_homeURL, field: ZmMsg.AB_HOME_URL, key: ZmContact.F_homeURL },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherPhone, lcmd: ZmMsg.ASST_CONTACT_LONG_otherPhone, field: ZmMsg.AB_FIELD_otherPhone, key: ZmContact.F_otherPhone },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherFax, lcmd: ZmMsg.ASST_CONTACT_LONG_otherFax, field: ZmMsg.AB_FIELD_otherFax, key: ZmContact.F_otherFax },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherAddress, lcmd: ZmMsg.ASST_CONTACT_LONG_otherAddress, field: ZmMsg.AB_ADDR_OTHER, key: 'oa', multiLine: true, noHelp: true },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherStreet, lcmd: ZmMsg.ASST_CONTACT_LONG_otherStreet, field: ZmMsg.AB_FIELD_otherStreet, key: ZmContact.F_otherStreet },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherCity, lcmd: ZmMsg.ASST_CONTACT_LONG_otherCity, field: ZmMsg.AB_FIELD_otherCity, key: ZmContact.F_otherCity },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherState, lcmd: ZmMsg.ASST_CONTACT_LONG_otherState, field: ZmMsg.AB_FIELD_otherState, key: ZmContact.F_otherState },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherPostalCode, lcmd: ZmMsg.ASST_CONTACT_LONG_otherPostalCode, field: ZmMsg.AB_FIELD_otherPostalCode, key: ZmContact.F_otherPostalCode },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherCountry, lcmd: ZmMsg.ASST_CONTACT_LONG_otherCountry, field: ZmMsg.AB_FIELD_otherCountry, key: ZmContact.F_otherCountry },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_otherURL, lcmd: ZmMsg.ASST_CONTACT_LONG_otherURL, field: ZmMsg.AB_OTHER_URL, key: ZmContact.F_otherURL },
	{ scmd: ZmMsg.ASST_CONTACT_SHORT_notes, lcmd: ZmMsg.ASST_CONTACT_LONG_notes, field: ZmMsg.notes, key: ZmContact.F_notes, multiLine: true, defaultValue: ZmMsg.ASST_CONTACT_notes }
];

ZmContactAssistant._CONTACT_OBJECTS = { };
ZmContactAssistant._CONTACT_OBJECTS[ZmObjectManager.URL] = { defaultType: 'wu', aliases: { w: 'wu', h: 'hu', o: 'ou' }};
ZmContactAssistant._CONTACT_OBJECTS[ZmObjectManager.PHONE] = { defaultType: 'wp', aliases: { w: 'wp', h: 'hp', o: 'op' }};
ZmContactAssistant._CONTACT_OBJECTS[ZmObjectManager.EMAIL] = { defaultType: 'e' };
ZmContactAssistant._CONTACT_OBJECTS[ZmAssistant._BRACKETS] = { defaultType: 'wa', aliases: { w: 'wa', h: 'ha', o: 'oa' }};

// check address first, since we grab any fields quoted with [], objects in them won't be matched later
ZmContactAssistant._CONTACT_OBJECT_ORDER = [
	ZmAssistant._BRACKETS, ZmObjectManager.PHONE, ZmObjectManager.URL, ZmObjectManager.EMAIL
];

ZmContactAssistant.prototype.extraButtonHandler =
function(dialog) {
	var cc = AjxDispatcher.run("GetContactController");
	cc.show(this.getContact(), true);
	return true;
};

ZmContactAssistant.prototype.okHandler =
function(dialog) {
	var cn = this.getContact();
	cn.create(cn.getAttrs()); // what the?
	return true;
};

ZmContactAssistant.prototype.getHelp =
function() {
	if (this._helpCommand == null) {
		var html = new AjxBuffer();
		html.append("<div class='ZmAsstContactHelp'>");
		html.append(ZmMsg.ASST_CONTACT_HELP);
		html.append("<table cellspacing=1 cellpadding=2 border=0>");
		html.append("<tr class=ZmAsstContactHelpHeader><td>", "Short Name", "</td><td>", "Long Name", "</td><td>", "Contact Field", "</td></tr>");
		var cmds = ZmAssistant.getHandlerCommands();
		for (var i=0; i < this._sortedFields.length; i++) {
			var field = this._lookupField(this._sortedFields[i]);
			if (field.noHelp) continue;
			html.append("<tr><td><b>", AjxStringUtil.htmlEncode(field.scmd), "</b></td><td><b>", AjxStringUtil.htmlEncode(field.lcmd), "</b></td><td>", AjxStringUtil.htmlEncode(field.field),"</td></tr>");
		}
		html.append("</table></div>");
		this._helpCommand = html.toString();
	}
	return this._helpCommand;
};

// street
// city
// state
// postal code
// country

ZmContactAssistant._ADDR_FIELDS = {
	home: [ ZmContact.F_homeStreet, ZmContact.F_homeCity, ZmContact.F_homeState, ZmContact.F_homePostalCode, ZmContact.F_homeCountry],
	other: [ ZmContact.F_otherStreet, ZmContact.F_otherCity, ZmContact.F_otherState, ZmContact.F_otherPostalCode, ZmContact.F_otherCountry],
	work: [ ZmContact.F_workStreet, ZmContact.F_workCity, ZmContact.F_workState, ZmContact.F_workPostalCode, ZmContact.F_workCountry]		
};

/**
 * @private
 */
ZmContactAssistant.prototype._parseAddress =
function(addr, type) {
	var fields = ZmContactAssistant._ADDR_FIELDS[type];
	var values= addr.split(";");
	for (var i = 0; i < values.length; i++) {
		var v = ZmAssistant.trim(values[i]);
		this._contactFields[fields[i]] = (i == 2) ? v.toUpperCase() : this._capitalize(v);
	}
};

/**
 * Gets the contact.
 * 
 * @return	{ZmContact}	the contact
 */
ZmContactAssistant.prototype.getContact =
function() {
	var contact = new ZmContact(null);
	for (var key in this._contactFields) {
		if (this._contactFields[key]) {
			contact.setAttr(key, this._contactFields[key]);
		}
	}
	return contact;
};

/**
 * @private
 */
ZmContactAssistant.prototype._capitalize =
function(v) {
	var words = ZmAssistant.split(v);
	for (var i=0; i < words.length; i++) words[i] = words[i].substring(0,1).toUpperCase() + words[i].substring(1);
	return words.join(" ");
};

ZmContactAssistant.__RE_handleNotes = new RegExp([ZmAssistant.SPACES,"\\(([^)]*)\\)?",ZmAssistant.SPACES].join(""));
ZmContactAssistant.__RE_handleKeyValue = new RegExp([
    "((",ZmAssistant.WORD,"):",ZmAssistant.SPACES,"(.*?)",ZmAssistant.SPACES,")",
    "(",ZmAssistant.WORD,":|$)"
].join(""),"m");

/**
 * @private
 */
ZmContactAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true); // true, "NewContact");
	dialog._setExtraButton(ZmMsg.moreDetails, true, true);

	var match, i;
	this._contactFields = {};

	// check address first, since we grab any fields quoted with [], objects in them won't be matched later
	for (i = 0; i < ZmContactAssistant._CONTACT_OBJECT_ORDER.length; i++) {
		var objType = ZmContactAssistant._CONTACT_OBJECT_ORDER[i];
		var obj = ZmContactAssistant._CONTACT_OBJECTS[objType];
		while (match = this._matchTypedObject(args, objType, obj)) {
			var field = this._lookupField(match.type);
			var type = field ? field.key : match.type;
			this._contactFields[type] = field && field.capitalize ? this._capitalize(match.data) : match.data;
			args = match.args;
		}
	}

	if (!this._contactFields.notes) {
		match = args.match(ZmContactAssistant.__RE_handleNotes);
		if (match) {
			this._contactFields.notes = match[1];
			args = args.replace(match[0], " ");
		}
	}

	while(match = args.match(ZmContactAssistant.__RE_handleKeyValue)) {
		var k = match[2];
		var v = match[3];
		var field = this._lookupField(k);
		if (field) {
			if (v == null) v = "";
			this._contactFields[field.key] = (field.capitalize) ? this._capitalize(v) : v;
		}
		args = args.replace(match[1],"");
	}

	var fullName = ZmAssistant.normalize(ZmAssistant.trim(args));

	if (this._contactFields[ZmContact.F_firstName] || this._contactFields[ZmContact.F_middleName] || this._contactFields[ZmContact.F_lastName]) {
		fullName = null;
		if (this._contactFields[ZmContact.F_firstName]) fullName = this._contactFields[ZmContact.F_firstName];
		if (this._contactFields[ZmContact.F_middleName]) {
			if (fullName) fullName += " ";
			fullName += this._contactFields[ZmContact.F_middleName];
		}
		if (this._contactFields[ZmContact.F_lastName]) {
			if (fullName) fullName += " ";
			fullName += this._contactFields[ZmContact.F_lastName];
		}
	} else {
        fullName = this._capitalize(fullName);
        var parts = ZmAssistant.split(fullName);
		switch (parts.length) {
			case 0:
				break;
			case 1:
				this._contactFields[ZmContact.F_firstName] = parts[0];
				break;
			case 2:
				this._contactFields[ZmContact.F_firstName] = parts[0];
				this._contactFields[ZmContact.F_lastName] = parts[1];
				break;
			default:
				this._contactFields[ZmContact.F_firstName] = parts.shift();
				this._contactFields[ZmContact.F_middleName] = parts.shift();
				this._contactFields[ZmContact.F_lastName] = parts.join(" ");
				break;
		}
	}

	if ("wa" in this._contactFields) {
		this._parseAddress(this._contactFields.wa, "work");
		delete this._contactFields.wa;
	}
	if ("ha" in this._contactFields) {
		this._parseAddress(this._contactFields.ha, "home");
		delete this._contactFields.ha;
	}
	if ("oa" in this._contactFields) {
		this._parseAddress(this._contactFields.oa, "other");
		delete this._contactFields.oa;
	}

	var index, ri;

	index = this._setField(ZmMsg.AB_FIELD_fullName, fullName == "" ? ZmMsg.ASST_CONTACT_fullName : fullName, fullName == "", true);

	for (var i=0; i < ZmContactAssistant._CONTACT_FIELDS.length; i++) {
		var field = ZmContactAssistant._CONTACT_FIELDS[i];
		if (!field || field.dontShow) continue;		
		var value = this._contactFields[field.key];

		if (value != null) {
			value = field.multiLine ? AjxStringUtil.convertToHtml(value) : AjxStringUtil.htmlEncode(value);
		}
		if (field.defaultValue || value != null) {
			var useDefault = (value == null);
			ri = this._setField(field.field, useDefault ? field.defaultValue : value, useDefault, false, index+1);
		} else {
			ri = this._setOptField(field.field, value, false, false, index+1);
		}
		index = Math.max(index, ri);
	}
	return;
};
