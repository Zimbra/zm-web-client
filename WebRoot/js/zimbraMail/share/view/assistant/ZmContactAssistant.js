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

function ZmContactAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt, ZmMsg.createNewContact, ZmMsg.ASST_CMD_CONTACT);
};

ZmContactAssistant.prototype = new ZmAssistant();
ZmContactAssistant.prototype.constructor = ZmContactAssistant;

ZmContactAssistant._CONTACT_FIELD_ORDER = [
     'fn', 'mn', 'ln',
     't', 'c',
	 'e', 'e2', 'e3', 
	 'wp', 'wp2', 'm', 'p', 'wf', 'a', 'ca', 'cp', 'cb',  'wa', 'wu',
	 'hp', 'hp2', 'hf', 'ha', 'hu',
	 'op', 'of', 'oa', 'ou', 'n'
];

ZmContactAssistant._lookupField =
function(key) {
	var f = ZmContactAssistant._CONTACT_FIELDS[key];
	//if (f && f.alias) f = ZmContactAssistant._CONTACT_FIELDS[f.alias];
	return f;
}

ZmContactAssistant._CONTACT_FIELDS = {
	  a: { field: ZmMsg.AB_FIELD_assistantPhone, key: ZmContact.F_assistantPhone },
      c: { field: ZmMsg.AB_FIELD_company, key: ZmContact.F_company },	  
     ca: { field: ZmMsg.AB_FIELD_carPhone, key: ZmContact.F_carPhone },      
	 cb: { field: ZmMsg.AB_FIELD_callbackPhone, key: ZmContact.F_callbackPhone },	 
	 cp: { field: ZmMsg.AB_FIELD_companyPhone, key: ZmContact.F_companyPhone },
 	  e: { field: ZmMsg.AB_FIELD_email, key: ZmContact.F_email, defaultValue: ZmMsg.ASST_CONTACT_email },
	 e2: { field: ZmMsg.AB_FIELD_email2, key: ZmContact.F_email2 },
	 e3: { field: ZmMsg.AB_FIELD_email3, key: ZmContact.F_email3 },
     fn: { field: ZmMsg.AB_FIELD_firstName, key: ZmContact.F_firstName, dontShow: true },
      f: { field: ZmMsg.AB_FIELD_workFax, key: ZmContact.F_workFax }, // alias fax to wf
	 ha: { field: ZmMsg.AB_ADDR_HOME, key: 'ha', multiline: true },
	 hf: { field: ZmMsg.AB_FIELD_homeFax, key: ZmContact.F_homeFax },
	 hp: { field: ZmMsg.AB_FIELD_homePhone, key: ZmContact.F_homePhone },
	hp2: { field: ZmMsg.AB_FIELD_homePhone2, key: ZmContact.F_homePhone2 },	 
	 hu: { field: ZmMsg.AB_HOME_URL, key: ZmContact.F_homeURL },
	 ln: { field: ZmMsg.AB_FIELD_lastName, key: ZmContact.F_lastName, dontShow: true },
	 mn: { field: ZmMsg.AB_FIELD_middleName, key: ZmContact.F_middleName, dontShow: true },
      m: { field: ZmMsg.AB_FIELD_mobilePhone, key: ZmContact.F_mobilePhone },
      n: { field: ZmMsg.notes, key: ZmContact.F_notes, multiLine: true, defaultValue: ZmMsg.ASST_CONTACT_notes },
	 oa: { field: ZmMsg.AB_ADDR_OTHER, key: 'oa', multiLine: true },
	 of: { field: ZmMsg.AB_FIELD_otherFax, key: ZmContact.F_otherFax },
	 op: { field: ZmMsg.AB_FIELD_otherPhone, key: ZmContact.F_otherPhone },
	 ou: { field: ZmMsg.AB_OTHER_URL, key: ZmContact.F_otherURL },
	  p: { field: ZmMsg.AB_FIELD_pager, key: ZmContact.F_pager },
	  t: { field: ZmMsg.AB_FIELD_jobTitle, key: ZmContact.F_jobTitle },	  
	 wa: { field: ZmMsg.AB_ADDR_WORK, key: 'wa', multiLine: true },
	 wf: { field: ZmMsg.AB_FIELD_workFax, key: ZmContact.F_workFax },
	 wp: { field: ZmMsg.AB_FIELD_workPhone, key: ZmContact.F_workPhone },
    wp2: { field: ZmMsg.AB_FIELD_workPhone2, key: ZmContact.F_workPhone2 },	 
	 wu: { field: ZmMsg.AB_WORK_URL, key: ZmContact.F_workURL }
};

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
	var cc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController();
	cc.show(this.getContact(), true);
	return true;
};

ZmContactAssistant.prototype.okHandler =
function(dialog) {
	var cn = this.getContact();
	cn.create(cn.getAttrs()); // what the?
	return true;
};

ZmContactAssistant.prototype.getContact =
function() {
	delete this._contactFields.wa;
	delete this._contactFields.ha;
	delete this._contactFields.oa;	
	var contact = new ZmContact(this._appCtxt);
	for (var key in this._contactFields)
		if (this._contactFields[key].data)
			contact.setAttr(key, this._contactFields[key].data);
	return contact;
};

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
			var field = ZmContactAssistant._lookupField(match.type);
			var type = field ? field.key : match.type;
			this._contactFields[type] = match;
			args = match.args;
		}
	}

	if (!this._contactFields.notes) {
		match = args.match(/\s*\(([^)]*)\)?\s*/);
		if (match) {
			this._contactFields.notes = {data : match[1] };
			args = args.replace(match[0], " ");
		}
	}

	//DBG.println("=============");
	while(match = args.match(/((\w+):\s*(.*?)\s*)(\w+:|$)/m)) {
		//for (i=0; i < match.length; i++) 	DBG.println(i+" ("+match[i] + ")");
		//DBG.println("-----");
		var k = match[2];
		var v = match[3];
		//var field = ZmContactAssistant._CONTACT_FIELDS[k];
		var field = ZmContactAssistant._lookupField(k);
		if (field) {
			if (v == null) v = "";
			this._contactFields[field.key] = {data: v};
		}
		args = args.replace(match[1],"");	
	}
	//DBG.println("=============");

	var remaining = args.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, ' '); //.split(",", 3);
		
	var fullName = remaining;
	
	if (this._contactFields[ZmContact.F_firstName] || this._contactFields[ZmContact.F_middleName] || this._contactFields[ZmContact.F_lastName]) {
		fullName = null;
		if (this._contactFields[ZmContact.F_firstName]) fullName = this._contactFields[ZmContact.F_firstName].data;
		if (this._contactFields[ZmContact.F_middleName]) { 
			if (fullName) fullName += " ";
			fullName += this._contactFields[ZmContact.F_middleName].data;
		}
		if (this._contactFields[ZmContact.F_lastName]) { 
			if (fullName) fullName += " ";
			fullName += this._contactFields[ZmContact.F_lastName].data;
		}		
	}

	var index, ri;
	
	index = this._setField(ZmMsg.AB_FIELD_fullName, fullName == "" ? ZmMsg.ASST_CONTACT_fullName : fullName, fullName == "", true);

	for (var i=0; i < ZmContactAssistant._CONTACT_FIELD_ORDER.length; i++) {	
		var fn = ZmContactAssistant._CONTACT_FIELD_ORDER[i];		
		var field = ZmContactAssistant._lookupField(fn);
		if (!field || field.dontShow) continue;		
		var data = this._contactFields[field.key];
		var value = (data && data.data != null) ? data.data : null;

		if (value != null) {
			value = field.multiLine ? AjxStringUtil.convertToHtml(value) : AjxStringUtil.htmlEncode(value);
		}
		if (field.defaultValue || value != null) {
			//var useDefault = (value == null || value == "");
			var useDefault = (value == null);
			ri = this._setField(field.field, useDefault ? field.defaultValue : value, useDefault, false, index+1);
		} else {
			ri = this._setOptField(field.field, value, false, false, index+1);
		}
		index = Math.max(index, ri);
	}
	return;
};
