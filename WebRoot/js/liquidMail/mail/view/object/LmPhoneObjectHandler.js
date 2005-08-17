function LmPhoneObjectHandler(appCtxt) {

	LmObjectHandler.call(this, appCtxt, "phone", null);
}

LmPhoneObjectHandler.prototype = new LmObjectHandler;
LmPhoneObjectHandler.prototype.constructor = LmPhoneObjectHandler;

LmPhoneObjectHandler.PHONE_RE = /(^|\W)(?:(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s]))?\d{3}[-.\s]\d{4}(\W|$)/g;

LmPhoneObjectHandler.prototype.getReString =
function() {
	return LmPhoneObjectHandler.PHONE;
}

LmPhoneObjectHandler.prototype.match =
function(line, startIndex) {
	LmPhoneObjectHandler.PHONE_RE.lastIndex = startIndex;

	var m = LmPhoneObjectHandler.PHONE_RE.exec(line);
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

LmPhoneObjectHandler.prototype.getToolTipText =
function(obj) {
	// TODO: implement tooltip cache?
	var html = new Array();
	var i = 0;
	html[i++] = "<table cellpadding=2 cellspacing=0 border=0><tr valign='center'>";
	html[i++] = "<td>";
	html[i++] = LsImg.getImageHtml(LmImg.I_TELEPHONE);
	html[i++] = "</td>";
	html[i++] = "<td><b><div style='white-space:nowrap'>" + LmMsg.phoneNumber + ":</div></b></td>";
	html[i++] = "<td><div style='white-space:nowrap'>" + LsStringUtil.htmlEncode(obj) + "</div></td></tr></table>";
	return html.join("");
}

LmPhoneObjectHandler.prototype.getActionMenu =
function(obj) {
	if (this._menu == null) {
		var list = [LmOperation.SEARCH];
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED))
			list.push(LmOperation.CONTACT);
		
		// Call option for SkypeOut (If you don't have Skype Windows will default to NetMeeting)
		list.push(LmOperation.CALL);
		this._menu = new LmActionMenu(this._appCtxt.getShell(), list);
		this._menu.addSelectionListener(LmOperation.SEARCH, new LsListener(this, this._searchListener));

		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED)) {
			LmOperation.setOperation(this._menu, LmOperation.CONTACT, LmOperation.NEW_CONTACT, LmMsg.AB_ADD_CONTACT);
			this._menu.addSelectionListener(LmOperation.CONTACT, new LsListener(this, this._contactListener));
		}

		LmOperation.setOperation(this._menu, LmOperation.CALL, LmOperation.CALL, LmMsg.call);
		this._menu.addSelectionListener(LmOperation.CALL, new LsListener(this, this._callListener));
	}
	this._actionObject = obj;

	return this._menu;
}

LmPhoneObjectHandler.prototype._searchListener =
function(ev) {
	// XXX: needs more params...
	this._appCtxt.getSearchController().search(this._actionObject);
}

LmPhoneObjectHandler.prototype._contactListener = 
function(ev) {
	// always create new contact (at least until someone complains)
	var contact = new LmContact(this._appCtxt);
	contact.initFromPhone(this._actionObject);
	this._appCtxt.getApp(LmLiquidMail.CONTACTS_APP).getContactController().show(contact);
}

LmPhoneObjectHandler.prototype._callListener = 
function(ev) {
    var phone = LsStringUtil.trim(this._actionObject.toString())
    // XXX: Assumes 10 digit US number.  Need to support 11 digit and intl numbers.
	phone = "callto:+1" + phone;
	window.location=phone
}
