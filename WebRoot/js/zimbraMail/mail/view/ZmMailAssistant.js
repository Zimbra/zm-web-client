/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
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

ZmMailAssistant = function() {
	ZmAssistant.call(this, ZmMsg.createNewMsg, ZmMsg.ASST_CMD_MAIL, ZmMsg.ASST_CMD_SUM_MAIL);
};

ZmMailAssistant.prototype = new ZmAssistant();
ZmMailAssistant.prototype.constructor = ZmMailAssistant;

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
	  b: { field: ZmMsg.body, key: 'body', defaultValue: ZmMsg.ASST_MAIL_body, multiLine: true },  	
   body: { field: ZmMsg.body, key: 'body', defaultValue: ZmMsg.ASST_MAIL_body, multiLine: true },
	  s: { field: ZmMsg.subject, key: 'subject', defaultValue: ZmMsg.ASST_MAIL_subject },
subject: { field: ZmMsg.subject, key: 'subject', defaultValue: ZmMsg.ASST_MAIL_subject },
  	 to: { field: ZmMsg.to, key: 'to', defaultValue: ZmMsg.ASST_MAIL_to }
};

ZmMailAssistant._OBJECTS = { };
ZmMailAssistant._OBJECTS[ZmObjectManager.EMAIL] = { defaultType: 'to' };
ZmMailAssistant._OBJECTS[ZmAssistant._BRACKETS] = { defaultType: 'body', aliases: { b: 'body', t: 'to', c: 'cc' }};

// check address first, since we grab any fields quoted with [], objects in them won't be matched later
ZmMailAssistant._OBJECT_ORDER = [
	ZmAssistant._BRACKETS //, ZmObjectManager.EMAIL
];

ZmMailAssistant.prototype.getHelp =
function() {
	return ZmMsg.ASST_MAIL_HELP;
};

ZmMailAssistant.prototype.okHandler =
function(dialog) {
	var bad = new AjxVector();	
	var good = new AjxVector();
	var msg = this.getMessage(bad, good);

	var cd = this._confirmDialog = appCtxt.getOkCancelMsgDialog();
	cd.reset();
	
	var subject = AjxStringUtil.trim(msg.subject);
	if ((subject == null || subject == "") && !this._noSubjectOkay) {
    	cd.setMessage(ZmMsg.compSubjectMissing, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._noSubjectOkCallback, this, dialog);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._noSubjectCancelCallback, this, dialog);
	    cd.popup();
		return false;
	}

	if (good.size() == 0) {
		dialog.messageDialog(ZmMsg.noAddresses, DwtMessageDialog.CRITICAL_STYLE);
		return false;
	}

	if (bad.size() > 0 && !this._badAddrsOkay) {
	    var badAddrs = AjxStringUtil.htmlEncode(bad.toString(AjxEmailAddress.SEPARATOR));
	    var message = AjxMessageFormat.format(ZmMsg.compBadAddresses, badAddrs);
    	cd.setMessage(message, DwtMessageDialog.WARNING_STYLE);
		cd.registerCallback(DwtDialog.OK_BUTTON, this._badAddrsOkCallback, this, dialog);
		cd.registerCallback(DwtDialog.CANCEL_BUTTON, this._badAddrsCancelCallback, this, dialog);
	    cd.popup();
		return false;
	} else {
		this._badAddrsOkay = false;
	}

	var contactList = AjxDispatcher.run("GetContacts");
	
	var respCallback = new AjxCallback(this, this._handleResponseSendMsg, [dialog]);
	var errorCallback = new AjxCallback(this, this._handleErrorSendMsg, [dialog]);
	
	msg.send(contactList, false, respCallback, errorCallback);
	// need to popdown in handle response instead of returning true..
	return false;
};

ZmMailAssistant.prototype._handleResponseSendMsg =
function(dialog) {
	appCtxt.setStatusMsg(ZmMsg.messageSent);	
	dialog.popdown();
};

ZmMailAssistant.prototype._handleErrorSendMsg =
function(dialog, ex) {
	var msg = null;
	if (ex.code == ZmCsfeException.MAIL_SEND_ABORTED_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		var invalidMsg = (invalid && invalid.length) ? AjxMessageFormat.format(ZmMsg.sendErrorInvalidAddresses,
														AjxStringUtil.htmlEncode(invalid.join(", "))) : null;
		msg = ZmMsg.sendErrorAbort + "<br/>" + invalidMsg;
	} else if (ex.code == ZmCsfeException.MAIL_SEND_PARTIAL_ADDRESS_FAILURE) {
		var invalid = ex.getData(ZmCsfeException.MAIL_SEND_ADDRESS_FAILURE_INVALID);
		msg = (invalid && invalid.length) ? AjxMessageFormat.format(ZmMsg.sendErrorPartial,
											AjxStringUtil.htmlEncode(invalid.join(", "))) : ZmMsg.sendErrorAbort;
	}
	if (msg) {
		dialog.messageDialog(msg, DwtMessageDialog.CRITICAL_STYLE);
		return true;
	} else {
		return false;
	}
};

// User has agreed to send message with no subject
ZmMailAssistant.prototype._noSubjectOkCallback =
function(dialog) {
	this._noSubjectOkay = true;
	this._confirmDialog.popdown();
	this.okHandler(dialog);
};

// User has declined to send message with no subject
ZmMailAssistant.prototype._noSubjectCancelCallback =
function(dialog) {
	this._noSubjectOkay = false;
	this._confirmDialog.popdown();
};

// User has agreed to send message with bad addresses
ZmMailAssistant.prototype._badAddrsOkCallback =
function(dialog) {
	this._badAddrsOkay = true;
	this._confirmDialog.popdown();
	this.okHandler(dialog);
};

// User has declined to send message with bad addresses - set focus to bad field
ZmMailAssistant.prototype._badAddrsCancelCallback =
function(dialog) {
	this._badAddrsOkay = false;
	this._confirmDialog.popdown();
};

ZmMailAssistant.prototype._getAddrs =
function(msg, type, value, bad, good) {
	if (value == null || value == "") return;
	var result = AjxEmailAddress.parseEmailString(value, type, false)
	if (result.bad.size() > 0 && bad != null) bad.addList(result.bad);
	if (result.all.size() > 0) 	{
		msg.setAddresses(type, result.all);
		if (good != null) good.addList(result.all);
	}
};

// bad is a vector that gets filled with bad addresses
ZmMailAssistant.prototype.getMessage =
function(bad, good) { 
	var msg = new ZmMailMsg();
	var body = new ZmMimePart();
	body.setContentType(ZmMimeTable.TEXT_PLAIN);
	var bodyText = this._mailFields.body != null ? this._mailFields.body : "";
	var identity = appCtxt.getIdentityCollection().defaultIdentity;
	if (Boolean(identity.signature)) {
		var sig = identity.signature;
		if (sig != null && sig != "") {
			bodyText = bodyText + "\n" + 
				((identity.signatureStyle == ZmSetting.SIG_INTERNET) ? "--\n" : "") +
				sig + "\n";
		}
	}
	body.setContent(bodyText);
	msg.setTopPart(body);
	if (this._mailFields.subject) msg.setSubject(this._mailFields.subject);
	this._getAddrs(msg, AjxEmailAddress.TO, this._mailFields.to, bad, good);
	this._getAddrs(msg, AjxEmailAddress.CC, this._mailFields.cc, bad, good);
	this._getAddrs(msg, AjxEmailAddress.BCC, this._mailFields.bcc, bad, good);		
	return msg;
}

ZmMailAssistant.prototype.handle =
function(dialog, verb, args) {
	dialog._setOkButton(AjxMsg.ok, true, true); //, true, "NewMessage");
	var match;
	this._mailFields = {};	

	if (!this._mailFields.subject) {
		match = args.match(/\s*\"([^\"]*)\"?\s*/);
		if (match) {
			this._mailFields.subject = match[1];
			args = args.replace(match[0], " ");
		}
	}

	while(match = args.match(/((\w+)(:\s*)(.*?)\s*)(\w+:|$)/m)) {
		var k = match[2];
		var v = match[4];
		var strip = match[1];
		var field = ZmMailAssistant._FIELDS[k];
		if (field) {
			if (field.key == 'body') {
				strip = match[2] + match[3];
				v = args.replace(strip,"").replace(/^\s*/, '');
				args = "";
			}
			if (v == null) v = "";
			this._mailFields[field.key] = v;
		}
		if (args) args = args.replace(strip,"");
	}

	var index = -1, ri;

	for (var i=0; i < ZmMailAssistant._FIELD_ORDER.length; i++) {	
		var key = ZmMailAssistant._FIELD_ORDER[i];
		var field = ZmMailAssistant._FIELDS[key];
		var value = this._mailFields[key]; 
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
};

ZmMailAssistant.prototype._getConfirmDialog = 
function(dialog) {
	if (!this._confirmDialog) {
		this._confirmDialog = new DwtMessageDialog({parent:dialog.shell, buttons:[DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON]});
	}
	return this._confirmDialog;
};

