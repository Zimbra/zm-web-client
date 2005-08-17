function ZmPhoneObjectHandler(appCtxt) {

	ZmObjectHandler.call(this, appCtxt, "phone", null);
}

ZmPhoneObjectHandler.prototype = new ZmObjectHandler;
ZmPhoneObjectHandler.prototype.constructor = ZmPhoneObjectHandler;

ZmPhoneObjectHandler.PHONE_RE = /(^|\W)(?:(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s]))?\d{3}[-.\s]\d{4}(\W|$)/g;

ZmPhoneObjectHandler.prototype.getReString =
function() {
	return ZmPhoneObjectHandler.PHONE;
}

ZmPhoneObjectHandler.prototype.match =
function(line, startIndex) {
	ZmPhoneObjectHandler.PHONE_RE.lastIndex = startIndex;

	var m = ZmPhoneObjectHandler.PHONE_RE.exec(line);
	if (m != null) {
		if (m[1] != "" || m[2] != "") {
			var from = 0;
			var to = m[0].length;
			if (m[1] != "") from++;
			if (m[2] != "") to--;
			var m2 = {index: m.index+from};
			m2[0] =  m[0].substring(from, to);
			m = m2;			
		}
	}
	return m;
}

ZmPhoneObjectHandler.prototype.getToolTipText =
function(obj) {
	// TODO: implement tooltip cache?
	var html = new Array();
	var i = 0;
	html[i++] = "<table cellpadding=2 cellspacing=0 border=0><tr valign='center'>";
	html[i++] = "<td>";
	html[i++] = AjxImg.getImageHtml(ZmImg.I_TELEPHONE);
	html[i++] = "</td>";
	html[i++] = "<td><b><div style='white-space:nowrap'>" + ZmMsg.phoneNumber + ":</div></b></td>";
	html[i++] = "<td><div style='white-space:nowrap'>" + AjxStringUtil.htmlEncode(obj) + "</div></td></tr></table>";
	return html.join("");
}

ZmPhoneObjectHandler.prototype.getActionMenu =
function(obj) {
	if (this._menu == null) {
		var list = [ZmOperation.SEARCH];
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED))
			list.push(ZmOperation.CONTACT);
		
		// Call option for SkypeOut (If you don't have Skype Windows will default to NetMeeting)
		list.push(ZmOperation.CALL);
		this._menu = new ZmActionMenu(this._appCtxt.getShell(), list);
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
}

ZmPhoneObjectHandler.prototype._searchListener =
function(ev) {
	// XXX: needs more params...
	this._appCtxt.getSearchController().search(this._actionObject);
}

ZmPhoneObjectHandler.prototype._contactListener = 
function(ev) {
	// always create new contact (at least until someone complains)
	var contact = new ZmContact(this._appCtxt);
	contact.initFromPhone(this._actionObject);
	this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactController().show(contact);
}

ZmPhoneObjectHandler.prototype._callListener = 
function(ev) {
    var phone = AjxStringUtil.trim(this._actionObject.toString())
    // XXX: Assumes 10 digit US number.  Need to support 11 digit and intl numbers.
	phone = "callto:+1" + phone;
	window.location=phone
}
