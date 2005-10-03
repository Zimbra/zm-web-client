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
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmEmailObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, ZmEmailObjectHandler.TYPE);
	this._contacts = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactList();
};

ZmEmailObjectHandler.prototype = new ZmObjectHandler;
ZmEmailObjectHandler.prototype.constructor = ZmEmailObjectHandler;

ZmEmailObjectHandler.TYPE = "email";
ZmEmailObjectHandler.EMAIL_RE = /[\w.\-]+@[\w.\-]+/g;

ZmEmailObjectHandler.prototype.match =
function(content, startIndex) {
	ZmEmailObjectHandler.EMAIL_RE.lastIndex = startIndex;
	return ZmEmailObjectHandler.EMAIL_RE.exec(content);
};

ZmEmailObjectHandler.prototype._getAddress =
function(obj) {
	if (obj.constructor == ZmEmailAddress) {
		return obj.address;
	} else {
		return obj;
	}
};

ZmEmailObjectHandler.prototype._getHtmlContent =
function(html, idx, obj) {

	var content = null;
	if (obj instanceof ZmEmailAddress) {
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			var contact = this._contacts.getContactByEmail(obj.address);
			if (contact)
				content = contact.getFullName();
		}
		if (!content)
			content = obj.toString();
	} else {
		content = obj;
	}
	html[idx++] = AjxStringUtil.htmlEncode(content);
	return idx;
};

ZmEmailObjectHandler.prototype.getToolTipText =
function(obj) {
	var toolTip;
	var addr = (obj instanceof ZmEmailAddress) ? obj.address : obj;
	var contact;
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && (contact = this._contacts.getContactByEmail(addr))) {
		toolTip = contact.getToolTip(addr);
	} else {
	    toolTip = "<b>" + ZmMsg.email + ": </b>" + AjxStringUtil.htmlEncode(obj.toString());
   	}
	return toolTip;
};

ZmEmailObjectHandler.prototype.getActionMenu =
function(obj) {
	if (this._menu == null) {
		var list = new Array();
		if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED))
			list.push(ZmOperation.SEARCH);
		if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED))
			list.push(ZmOperation.BROWSE);
		list.push(ZmOperation.NEW_MESSAGE);
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
			list.push(ZmOperation.CONTACT);
		list.push(ZmOperation.GO_TO_URL);
		this._menu = new ZmActionMenu(this._appCtxt.getShell(), list);
	
		if (this._appCtxt.get(ZmSetting.SEARCH_ENABLED))
			this._menu.addSelectionListener(ZmOperation.SEARCH, new AjxListener(this, this._searchListener));
		if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED))
			this._menu.addSelectionListener(ZmOperation.BROWSE, new AjxListener(this, this._browseListener));
		this._menu.addSelectionListener(ZmOperation.NEW_MESSAGE, new AjxListener(this, this._composeListener));
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
			this._menu.addSelectionListener(ZmOperation.CONTACT, new AjxListener(this, this._contactListener));
		this._menu.addSelectionListener(ZmOperation.GO_TO_URL, new AjxListener(this, this._goToUrlListener));
	}
	this._actionObject = obj;
	this._actionAddress = this._getAddress(this._actionObject);	
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		this._actionContact = this._contacts.getContactByEmail(this._actionAddress);
		var isContact = (this._actionContact != null);
		var newOp = isContact ? ZmOperation.EDIT_CONTACT : ZmOperation.NEW_CONTACT;
		var newText = isContact ? null : ZmMsg.AB_ADD_CONTACT;
		ZmOperation.setOperation(this._menu, ZmOperation.CONTACT, newOp, newText);
	}
	var parts = this._actionAddress.split("@");
	if (parts.length) {
		var domain = parts[parts.length - 1];
		var pieces = domain.split(".");
		var url = (pieces.length <= 2) ? 'www.' + domain : domain;
		var text = AjxStringUtil.resolve(ZmMsg.goToUrl, [url]);
		this._menu.getOp(ZmOperation.GO_TO_URL).setText(text);
		this._actionUrl = "http://" + url;
	} else {
		this._menu.removeOp(ZmOperation.GO_TO_URL);
		this._actionUrl = null;
	}

	return this._menu;
};

ZmEmailObjectHandler.prototype.selected =
function(obj, span, ev) {
	var inNewWindow = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	var cc = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
	cc.doAction(ZmOperation.NEW_MESSAGE, inNewWindow, null, obj+ZmEmailAddress.SEPARATOR);
};

ZmEmailObjectHandler.prototype._contactListener =
function(ev) {
	var cc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController();
	if (this._actionContact) {
		cc.show(this._actionContact);
	} else {
		var contact = new ZmContact(this._appCtxt);
		contact.initFromEmail(this._actionObject);
		cc.show(contact);
	}
};

ZmEmailObjectHandler.prototype._composeListener =
function(ev) {
	var inNewWindow = this._appCtxt.get(ZmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	// TODO: what if no email? probably should disable this menu. what if multiple emails?
	var cc = this._appCtxt.getApp(ZmZimbraMail.MAIL_APP).getComposeController();
	cc.doAction(ZmOperation.NEW_MESSAGE, inNewWindow, null, this._actionAddress+ZmEmailAddress.SEPARATOR);
};

ZmEmailObjectHandler.prototype._browseListener =
function(ev) {
	// TODO: use fullname if email empty? What if there are multiple emails?
	this._appCtxt.getSearchController().fromBrowse(this._actionAddress);
};

ZmEmailObjectHandler.prototype._searchListener =
function(ev) {
	// TODO: use fullname if email empty? What if there are multiple emails?
	this._appCtxt.getSearchController().fromSearch(this._actionAddress);
};

ZmEmailObjectHandler.prototype._goToUrlListener =
function(ev) {
	if (this._actionUrl)
		window.open(this._actionUrl, "_blank", "menubar=yes,resizable=yes,scrollbars=yes");
};
