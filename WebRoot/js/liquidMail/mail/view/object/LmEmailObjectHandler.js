function LmEmailObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "email", null);

	this._contacts = appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactList();
}

LmEmailObjectHandler.prototype = new LmObjectHandler;
LmEmailObjectHandler.prototype.constructor = LmEmailObjectHandler;

LmEmailObjectHandler.EMAIL_RE = /[\w.\-]+@[\w.\-]+/g;

LmEmailObjectHandler.prototype.match =
function(content, startIndex) {
	LmEmailObjectHandler.EMAIL_RE.lastIndex = startIndex;
	return LmEmailObjectHandler.EMAIL_RE.exec(content);
}

LmEmailObjectHandler.prototype._getAddress =
function(obj) {
	if (obj.constructor == LmEmailAddress) {
		return obj.address;
	} else {
		return obj;
	}
}

LmEmailObjectHandler.prototype._getHtmlContent =
function(html, idx, obj) {

	var content = null;
	if (obj instanceof LmEmailAddress) {
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED)) {
			var contact = this._contacts.getContactByEmail(obj.address);
			if (contact)
				content = contact.getFullName();
		}
		if (!content)
			content = obj.toString();
	} else {
		content = obj;
	}
	html[idx++] = LsStringUtil.htmlEncode(content);
	return idx;
}

LmEmailObjectHandler.prototype.getToolTipText =
function(obj) {
	var toolTip;
	var addr = (obj instanceof LmEmailAddress) ? obj.address : obj;
	var contact;
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED) && (contact = this._contacts.getContactByEmail(addr))) {
		toolTip = contact.getToolTip(addr);
	} else {
	    toolTip = "<b>E-mail: </b>" + LsStringUtil.htmlEncode(obj.toString());
   	}
	return toolTip;
}

LmEmailObjectHandler.prototype.getActionMenu =
function(obj) {
	if (this._menu == null) {
		var list = new Array();
		if (this._appCtxt.get(LmSetting.SEARCH_ENABLED))
			list.push(LmOperation.SEARCH);
		if (this._appCtxt.get(LmSetting.BROWSE_ENABLED))
			list.push(LmOperation.BROWSE);
		list.push(LmOperation.NEW_MESSAGE);
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
			list.push(LmOperation.CONTACT);
		this._menu = new LmActionMenu(this._appCtxt.getShell(), list);
	
		if (this._appCtxt.get(LmSetting.SEARCH_ENABLED))
			this._menu.addSelectionListener(LmOperation.SEARCH, new LsListener(this, this._searchListener));
		if (this._appCtxt.get(LmSetting.BROWSE_ENABLED))
			this._menu.addSelectionListener(LmOperation.BROWSE, new LsListener(this, this._browseListener));
		this._menu.addSelectionListener(LmOperation.NEW_MESSAGE, new LsListener(this, this._composeListener));
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
			this._menu.addSelectionListener(LmOperation.CONTACT, new LsListener(this, this._contactListener));
	}
	this._actionObject = obj;
	this._actionAddress = this._getAddress(this._actionObject);	
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED)) {
		this._actionContact = this._contacts.getContactByEmail(this._actionAddress);
		var isContact = (this._actionContact != null);
		var newOp = isContact ? LmOperation.EDIT_CONTACT : LmOperation.NEW_CONTACT;
		var newText = isContact ? null : LmMsg.AB_ADD_CONTACT;
		LmOperation.setOperation(this._menu, LmOperation.CONTACT, newOp, newText);
	}

	return this._menu;
}

LmEmailObjectHandler.prototype.selected =
function(obj, span, ev) {
	var inNewWindow = this._appCtxt.get(LmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	var cc = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
	cc.doAction(LmOperation.NEW_MESSAGE, inNewWindow, null, obj+LmEmailAddress.SEPARATOR);
}

LmEmailObjectHandler.prototype._contactListener =
function(ev) {
	var cc = this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController();
	if (this._actionContact) {
		cc.show(this._actionContact);
	} else {
		var contact = new LmContact(this._appCtxt);
		contact.initFromEmail(this._actionObject);
		cc.show(contact);
	}
}

LmEmailObjectHandler.prototype._composeListener =
function(ev) {
	var inNewWindow = this._appCtxt.get(LmSetting.NEW_WINDOW_COMPOSE) || ev.shiftKey;
	// TODO: what if no email? probably should disable this menu. what if multiple emails?
	var cc = this._appCtxt.getApp(LmLiquidMail.MAIL_APP).getComposeController();
	cc.doAction(LmOperation.NEW_MESSAGE, inNewWindow, null, this._actionAddress+LmEmailAddress.SEPARATOR);
}

LmEmailObjectHandler.prototype._browseListener =
function(ev) {
	// TODO: use fullname if email empty? What if there are multiple emails?
	this._appCtxt.getSearchController().fromBrowse(this._actionAddress);
}

LmEmailObjectHandler.prototype._searchListener =
function(ev) {
	// TODO: use fullname if email empty? What if there are multiple emails?
	this._appCtxt.getSearchController().fromSearch(this._actionAddress);
}
