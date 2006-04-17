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

function ZmMailAssistant(appCtxt) {
	if (arguments.length == 0) return;
	ZmAssistant.call(this, appCtxt, ZmMsg.createNewMsg, ZmMsg.ASST_CMD_MAIL);
};

ZmMailAssistant.prototype = new ZmAssistant();
ZmMailAssistant.prototype.constructor = ZmAssistant;

ZmMailAssistant.prototype.okHandler =
function(dialog) {
	return true;	//override
};

ZmMailAssistant._FIELD_ORDER = [
     'subject', 'to', 'cc', 'bcc', 'body'
];

ZmMailAssistant._FIELDS = {
  	 cc: { field: ZmMsg.cc, key: 'cc' },
  	bcc: { field: ZmMsg.bcc, key: 'bcc' },
   body: { field: ZmMsg.body, key: 'body', defaultValue: ZmMsg.ASST_MAIL_body, multiLine: true },
subject: { field: ZmMsg.subject, key: 'subject', defaultValue: ZmMsg.ASST_MAIL_subject },
  	 to: { field: ZmMsg.to, key: 'to', defaultValue: ZmMsg.ASST_MAIL_to }
};

ZmMailAssistant._OBJECTS = { };
ZmMailAssistant._OBJECTS[ZmObjectManager.EMAIL] = { defaultType: 'to' };
ZmMailAssistant._OBJECTS[ZmAssistant._BRACKETS] = { defaultType: 'body', aliases: { b: 'body', t: 'to', c: 'cc' }};

// check address first, since we grab any fields quoted with [], objects in them won't be matched later
ZmMailAssistant._OBJECT_ORDER = [
	ZmAssistant._BRACKETS, ZmObjectManager.EMAIL
];

ZmMailAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true); //, true, "NewMessage");
	var match;
	var objects = {};	
		
	// check address first, since we grab any fields quoted with [], objects in them won't be matched later
	for (var i = 0; i < ZmMailAssistant._OBJECT_ORDER.length; i++) {
		var objType = ZmMailAssistant._OBJECT_ORDER[i];
		var obj = ZmMailAssistant._OBJECTS[objType];
		while (match = this._matchTypedObject(args, objType, obj)) {
			
//			var fieldData = ZmAssistantDialog._FIELDS[match.type];
//			if (fieldData) type = fieldData.key;

			var field = ZmMailAssistant._FIELDS[match.type];
			var type = field ? field.key : match.type;
			objects[type] = match;
			args = match.args;
		}
	}

	if (!objects.subject) {
		match = args.match(/\s*\"([^\"]*)\"?\s*/);
		if (match) {
			objects.subject = {data : match[1] };
			args = args.replace(match[0], " ");
		}
	}

	if (!objects.body) {
		var rest = args.replace(/^\s+/, ""); //.replace(/\s+$/, ""); // .replace(/\s+/g, ' ');
		if (rest == "" || rest == " ") rest = null;		
		objects.body = { data : rest };
	}

	var index = -1, ri;

	for (var i=0; i < ZmMailAssistant._FIELD_ORDER.length; i++) {	
		var key = ZmMailAssistant._FIELD_ORDER[i];
		var data = objects[key];
		var field = ZmMailAssistant._FIELDS[key];
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
