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


function ZmPhoneObjectHandler(appCtxt) {
	ZmObjectHandler.call(this, appCtxt, ZmPhoneObjectHandler.TYPE);
}

ZmPhoneObjectHandler.prototype = new ZmObjectHandler();
ZmPhoneObjectHandler.prototype.constructor = ZmPhoneObjectHandler;

ZmPhoneObjectHandler.TYPE = "phone";
ZmPhoneObjectHandler.PHONE_RE = /(^|\W)(?:\+1\s+)?(?:(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s]))?\d{3}[-.\s]\d{4}(\W|$)/g;

ZmPhoneObjectHandler.prototype.getReString =
function() {
	return ZmPhoneObjectHandler.PHONE;
};

ZmPhoneObjectHandler.prototype.match =
function(line, startIndex) {
	ZmPhoneObjectHandler.PHONE_RE.lastIndex = startIndex;

	var m = ZmPhoneObjectHandler.PHONE_RE.exec(line);
	if (m) {
		if (m[1] !== "" || m[2] !== "") {
			var from = 0;
			var to = m[0].length;
			if (m[1] !== "") {from++;}
			if (m[2] !== "") {to--;}
			var m2 = {index: m.index+from};
			m2[0] =  m[0].substring(from, to);
			m = m2;			
		}
	}
	return m;
};

ZmPhoneObjectHandler.prototype._getHtmlContent =
function(html, idx, phone, context) {
	var call = ZmPhoneObjectHandler.getCallToLink(phone);
	html[idx++] = '<a href="' + call + '" onclick="window.top.ZmPhoneObjectHandler.unsetOnbeforeunload()">'+AjxStringUtil.htmlEncode(phone)+'</a>';	
	return idx;
};

ZmPhoneObjectHandler.prototype.getToolTipText =
function(obj) {
	// TODO: implement tooltip cache?
	var html = new Array();
	var i = 0;
	html[i++] = "<table cellpadding=2 cellspacing=0 border=0><tr valign='center'>";
	html[i++] = "<td>";
	html[i++] = AjxImg.getImageHtml("Telephone");
	html[i++] = "</td>";
	html[i++] = "<td><b><div style='white-space:nowrap'>" + ZmMsg.phoneNumber + ":</div></b></td>";
	html[i++] = "<td><div style='white-space:nowrap'>" + AjxStringUtil.htmlEncode(obj) + "</div></td></tr></table>";
	return html.join("");
};

ZmPhoneObjectHandler.prototype.getActionMenu =
function(obj, span, context, isDialog) {
	if (!this._menu) {
		var list = [ZmOperation.SEARCH];
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			list.push(ZmOperation.CONTACT);
		}
		
		// Call option for SkypeOut (If you don't have Skype, Windows will default to NetMeeting)
		list.push(ZmOperation.CALL);
		this._menu = new ZmActionMenu(this._appCtxt.getShell(), list, null, isDialog);
		this._menu.addSelectionListener(ZmOperation.SEARCH, new AjxListener(this, this._searchListener));

		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			ZmOperation.setOperation(this._menu, ZmOperation.CONTACT, ZmOperation.NEW_CONTACT, ZmMsg.AB_ADD_CONTACT);
			this._menu.addSelectionListener(ZmOperation.CONTACT, new AjxListener(this, this._contactListener));
		}

		ZmOperation.setOperation(this._menu, ZmOperation.CALL, ZmOperation.CALL, ZmMsg.call);
		this._menu.addSelectionListener(ZmOperation.CALL, new AjxListener(this, this._callListener));
	}
	this._actionObject = obj;

	return this._menu;
};

ZmPhoneObjectHandler.prototype._searchListener =
function(ev) {
	// XXX: needs more params...
	this._appCtxt.getSearchController().search({query: this._actionObject});
};

ZmPhoneObjectHandler.prototype._contactListener = 
function(ev) {
	// always create new contact
	var contact = new ZmContact(this._appCtxt);
	contact.initFromPhone(this._actionObject);
	this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController().show(contact);
};

ZmPhoneObjectHandler.prototype._callListener = 
function(ev) {
	var phone = ZmPhoneObjectHandler.getCallToLink(this._actionObject.toString());
	ZmPhoneObjectHandler.unsetOnbeforeunload();
	window.location=phone;
};

ZmPhoneObjectHandler.resetOnbeforeunload = 
function() {
	window.onbeforeunload = ZmZimbraMail._confirmExitMethod;
};

ZmPhoneObjectHandler.unsetOnbeforeunload = 
function() {
	window.onbeforeunload = null;
	this._timerObj = new AjxTimedAction(null, ZmPhoneObjectHandler.resetOnbeforeunload);
	AjxTimedAction.scheduleAction(this._timerObj,3000);
};

// XXX: Regex assumes 10 or 11 digit US number.  Need to support intl numbers.
ZmPhoneObjectHandler.getCallToLink = 
function(phoneIn) {
	if(!phoneIn) {return "";}
	var phone = AjxStringUtil.trim(phoneIn, true);
	return 'callto:+1' + phone.replace('+1', '');
};

// Start at 5 so Zimlet writers can provide custom handlers if they choose.
ZmObjectManager.registerHandler("ZmPhoneObjectHandler", ZmPhoneObjectHandler.TYPE , 24);