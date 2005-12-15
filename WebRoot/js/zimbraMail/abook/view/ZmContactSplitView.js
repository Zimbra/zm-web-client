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

//////////////////////////////////////////////////////////////////////////////
// ZmContactSplitView
// - parent for the simple list view and xform view
//////////////////////////////////////////////////////////////////////////////
function ZmContactSplitView(parent, className, posStyle, controller, dropTgt) {

	if (arguments.length == 0) return;
	className = className ? className : "ZmContactSplitView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	DwtComposite.call(this, parent, className, posStyle);

	this._controller = controller;

	this._listPart = new ZmContactSimpleView(this, null, posStyle, controller, dropTgt);
	this._contactPart = new DwtComposite(this, "ZmContactInfoView", posStyle);

	this._changeListener = new AjxListener(this, this._contactChangeListener);
	
	this._contactPart._setMouseEventHdlrs(); // needed by object manager
	// this manages all the detected objects within the view
	this._objectManager = new ZmObjectManager(this._contactPart, this.shell.getData(ZmAppCtxt.LABEL));
	
};

ZmContactSplitView.prototype = new DwtComposite;
ZmContactSplitView.prototype.constructor = ZmContactSplitView;

ZmContactSplitView.prototype.toString = 
function() {
	return "ZmContactSplitView";
};

ZmContactSplitView.prototype.getListView = 
function() {
	return this._listPart;
};

ZmContactSplitView.prototype.getController =
function() {
	return this._controller;
}

ZmContactSplitView.prototype.setSize = 
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width-10, height-10);
	this._sizeChildren(width, height);
};

ZmContactSplitView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width-10, height-10);
	this._sizeChildren(width, height);
};

ZmContactSplitView.prototype.getTitle = 
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.contacts].join(": ");
};

ZmContactSplitView.prototype.setContact = 
function(contact, isGal) {

	if (this._objectManager)
		this._objectManager.reset();

	if (!isGal) {
		// Remove and re-add listeners for current contact if exists
		if (this._contact)
			this._contact.removeChangeListener(this._changeListener);
		contact.addChangeListener(this._changeListener);
	}
	
	this._contact = contact;
	this._setContact(contact, isGal);
};

ZmContactSplitView.prototype.clear = 
function() {
	// clear the right pane
	this._contactPart.getHtmlElement().innerHTML = "";
	this._htmlInitialized = false;
};

ZmContactSplitView.prototype._sizeChildren = 
function(width, height) {
	var padding = 4;		// css padding value (see ZmContactSplitView css class)
	var listWidth = 200;	// fixed width size of list view
	
	// calc. height for children of this view
	var childHeight = height - (padding * 2);
	// always set the list part width to 200px (should be in css?)
	this._listPart.setSize(listWidth, childHeight);
	
	// explicitly set the size for the xform part
	var listSize = this._listPart.getSize();
	var contactWidth = width - ((padding * 3) + listWidth);
	var contactXPos = (padding * 2) + listWidth;
	this._contactPart.setSize(contactWidth, childHeight);
	this._contactPart.setLocation(contactXPos, Dwt.DEFAULT);
	
	this._contactPartWidth = contactWidth;
	this._contactPartHeight = childHeight;
	
	if (this._htmlInitialized) {
		var bodyDiv = document.getElementById(this._contactBodyId);
		bodyDiv.style.width = this._contactPartWidth;
		bodyDiv.style.height = this._contactPartHeight - 40;
	}	
};

ZmContactSplitView.prototype._createHtml = 
function() {

	this._contactHeaderId = Dwt.getNextId();
	this._contactBodyId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=100% height=100%>"
	html[idx++] = "<tr height=40><td id='" + this._contactHeaderId + "' colspan='*' class='contactHeader'></td></tr>";
	html[idx++] = "<tr height=100%><td valign=top><div style='width:" + this._contactPartWidth + "; height:" + (this._contactPartHeight-40) + "; overflow: auto' id='" + this._contactBodyId + "'></div></td></tr>";
	html[idx++] = "</table>";

	this._contactPart.getHtmlElement().innerHTML = html.join("");
	
	this._htmlInitialized = true;
}

ZmContactSplitView.prototype._contactChangeListener = 
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT || ev.source != this._contact)
		return;

	this._setContact(ev.source);
};

ZmContactSplitView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

ZmContactSplitView.prototype._setContact = 
function(contact, isGal) {

	if (!this._htmlInitialized)
		this._createHtml();

	// set contact header (file as)
	var contactHdr = document.getElementById(this._contactHeaderId);
	contactHdr.innerHTML = contact.getFileAs();
	
	// set body
	var contactBodyDiv = document.getElementById(this._contactBodyId);
	
	var html = new Array();
	var idx = 0;
	
	var width = this._contactPart.getSize().x / 2;
	
	html[idx++] = "<div class='companyName'>" + (contact.getCompanyField() || "&nbsp;") + "</div>";
	html[idx++] = "<table border=0 width=100%>";
	// start real content
	
	// add email fields
	var email  = contact.getAttr(ZmContact.F_email);
	var email2 = contact.getAttr(ZmContact.F_email2);
	var email3 = contact.getAttr(ZmContact.F_email3);

	html[idx++] = "<tr><td colspan='*' valign=top>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (email || email2 || email3) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Email</td><td valign=top class='contactOutput'>";
		// TODO: make into EmailObjects and call compose view
		if (email) 	{ html[idx++] = this._generateObject(email,  ZmEmailObjectHandler.TYPE); html[idx++] = "<br>"; }
		if (email2) { html[idx++] = this._generateObject(email2, ZmEmailObjectHandler.TYPE); html[idx++] = "<br>"; }
		if (email3) { html[idx++] = this._generateObject(email3, ZmEmailObjectHandler.TYPE); html[idx++] = "<br>"; }
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";
	
	html[idx++] = "<tr><td><br></td></tr>";
	
	// add work fields
	var workField = AjxStringUtil.nl2br(contact.getWorkAddrField());
	var workPhone = contact.getAttr(ZmContact.F_workPhone);
	var workPhone2 = contact.getAttr(ZmContact.F_workPhone2);
	var workFax = contact.getAttr(ZmContact.F_workFax);
	var workAsst = contact.getAttr(ZmContact.F_assistantPhone);
	var workCompany = contact.getAttr(ZmContact.F_companyPhone);
	var workCallback = contact.getAttr(ZmContact.F_callbackPhone);
	var workURL = contact.getAttr(ZmContact.F_workURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (workField || workPhone || workPhone2 || workFax || workAsst || workCompany || workCallback || workURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Work</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (workField) 	html[idx++] = workField + "<br>";
		if (workURL) 	html[idx++] = this._generateObject(workURL, "url");
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (workPhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + this._generateObject(workPhone, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (workPhone2)		html[idx++] = "<tr><td class='contactLabel'>Phone 2</td><td class='contactOutput'>" + this._generateObject(workPhone2, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (workFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + this._generateObject(workFax, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (workAsst)		html[idx++] = "<tr><td class='contactLabel'>Assistant</td><td class='contactOutput'>" + this._generateObject(workAsst, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (workCompany)	html[idx++] = "<tr><td class='contactLabel'>Company</td><td class='contactOutput'>" + this._generateObject(workCompany, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (workCallback)	html[idx++] = "<tr><td class='contactLabel'>Callback</td><td class='contactOutput'>" + this._generateObject(workCallback, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";

	html[idx++] = "<tr><td><br></td></tr>";
	
	// add home fields
	var homeField = AjxStringUtil.nl2br(contact.getHomeAddrField());
	var homePhone = contact.getAttr(ZmContact.F_homePhone);
	var homePhone2 = contact.getAttr(ZmContact.F_homePhone2);
	var homeFax = contact.getAttr(ZmContact.F_homeFax);
	var mobile = contact.getAttr(ZmContact.F_mobilePhone);
	var pager = contact.getAttr(ZmContact.F_pager);
	var homeURL = contact.getAttr(ZmContact.F_homeURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (homeField || homePhone || homePhone2 || homeFax || mobile || pager || homeURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Home</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (homeField) 	html[idx++] = homeField + "<br>";
		if (homeURL) 	html[idx++] = this._generateObject(homeURL, ZmURLObjectHandler.TYPE);
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (homePhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + this._generateObject(homePhone, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (homePhone2)		html[idx++] = "<tr><td class='contactLabel'>Phone 2</td><td class='contactOutput'>" + this._generateObject(homePhone2, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (homeFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + this._generateObject(homeFax, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (mobile)			html[idx++] = "<tr><td class='contactLabel'>Mobile</td><td class='contactOutput'>" + this._generateObject(mobile, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (pager)			html[idx++] = "<tr><td class='contactLabel'>Pager</td><td class='contactOutput'>" + this._generateObject(pager, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";

	html[idx++] = "<tr><td><br></td></tr>";
	
	// add other fields
	var otherField = AjxStringUtil.nl2br(contact.getOtherAddrField());
	var otherPhone = contact.getAttr(ZmContact.F_otherPhone);
	var otherFax = contact.getAttr(ZmContact.F_otherFax);
	var otherURL = contact.getAttr(ZmContact.F_otherURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (otherField || otherPhone || otherFax || otherURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Other</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (otherField) html[idx++] = otherField + "<br>";
		if (otherURL) 	html[idx++] = this._generateObject(otherURL, ZmURLObjectHandler.TYPE);
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (otherPhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + this._generateObject(otherPhone, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	if (otherFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + this._generateObject(otherFax, ZmPhoneObjectHandler.TYPE) + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";
	
	html[idx++] = "<tr><td><br></td></tr>";

	var notes = this._generateObject(contact.getAttr(ZmContact.F_notes));
	html[idx++] = "<tr><td valign=top colspan='10'>";
	if (notes) {
		html[idx++] = "<table border=0 width=100%>";
		html[idx++] = "<tr><td valign=top class='contactLabel'>Notes</td><td class='contactOutput'>" + AjxStringUtil.nl2br(notes) + "</td></tr>";
		html[idx++] = "</table>";
	}
	html[idx++] = "</td></tr>";

	html[idx++] = "</table>";
	html[idx++] = "</div>";
	
	contactBodyDiv.innerHTML = html.join("");
};

//////////////////////////////////////////////////////////////////////////////
// ZmContactSimpleView
// - a simple contact list view (contains only full name)
//////////////////////////////////////////////////////////////////////////////
function ZmContactSimpleView(parent, className, posStyle, controller, dropTgt) {
	className = className ? className : "ZmContactSimpleView";
	ZmContactsBaseView.call(this, parent, className, posStyle, ZmController.CONTACT_SIMPLE_VIEW, controller, null, dropTgt);
};

ZmContactSimpleView.prototype = new ZmContactsBaseView;
ZmContactSimpleView.prototype.constructor = ZmContactSimpleView;

ZmContactSimpleView.prototype.toString = 
function() {
	return "ZmContactSimpleView";
};

ZmContactSimpleView.prototype.set =
function(list, defaultColumnSort) {
	ZmContactsBaseView.prototype.set.call(this, list, defaultColumnSort);
	if (!(this._list instanceof AjxVector) || this._list.size() == 0)
		this.parent.clear();
};

ZmContactSimpleView.prototype._modifyContact =
function(ev) {
	ZmContactsBaseView.prototype._modifyContact.call(this, ev);
	
	if (ev.getDetail("fileAsChanged")) {
		var selected = this.getSelection()[0];
		this._layout();
		this.setSelection(selected, true);
	}
};

ZmContactSimpleView.prototype._layout =
function() {
	// explicitly remove each child (setting innerHTML causes mem leak)
	while (this._parentEl.hasChildNodes()) {
		cDiv = this._parentEl.removeChild(this._parentEl.firstChild);
		AjxCore.unassignId(cDiv._itemIndex);
	}

	var size = this._list.size();
	for (var i = 0; i < size; i++) {
		var item = this._list.get(i);
		var div = item ? this._createItemHtml(item, this._now) : null;
		if (div)
			this._addRow(div);
	}
};

ZmContactSimpleView.prototype._createItemHtml =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == ZmFolder.ID_TRASH))
		return null;
	
	var div = this._getDiv(contact, isDndIcon);
	
	if (isDndIcon) {
		div.style.width = "175px";
		div.style.padding = "4px";
	}
	div.className = div._styleClass = div._styleClass + " SimpleContact";
	div._selectedStyleClass += " SimpleContact";
	// XXX: commented out b/c slows down loading contact (DOM tree is too deep!)
	//div._hoverStyleClass = "SimpleContactHover";
	div.id = this._getItemId(contact);

	var htmlArr = new Array();
	var idx = 0;

	// table/row
	idx = this._getTable(htmlArr, idx, isDndIcon);
	idx = this._getRow(htmlArr, idx, contact);

	// tags
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, ZmItem.F_TAG_CELL);
		htmlArr[idx++] = "<td style='vertical-align:middle; height:24px' width=16 class='Tag' id='" + cellId + "'>";
		htmlArr[idx++] = this._getTagImgHtml(contact, ZmItem.F_TAG);
		htmlArr[idx++] = "</td>";
	}
		
	// file as
	htmlArr[idx++] = "<td style='vertical-align: middle'>&nbsp;" + AjxStringUtil.htmlEncode(contact.getFileAs()) + "&nbsp;</td>";
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	
	return div;
};

// this is used by mixed view to create the old listview version of contact list
ZmContactSimpleView.prototype._createContactHtmlForMixed =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == ZmFolder.ID_TRASH))
		return null;
	
	var	div = this._getDiv(contact, isDndIcon);
	div.className = div._styleClass;

	var htmlArr = new Array();
	var idx = 0;

	// Table
	idx = this._getTable(htmlArr, idx, isDndIcon);

	// Row
	idx = this._getRow(htmlArr, idx, contact);
	
	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		// IE does not obey box model properly so we over compensate :(
		var width = AjxEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;

		if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ICON]) == 0) {
			// Type icon
			idx = this._getField(htmlArr, idx, contact, ZmItem.F_ITEM_TYPE, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_FLAG]) == 0) {
			// Flag
			idx = this._getField(htmlArr, idx, contact, ZmItem.F_FLAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, contact, ZmItem.F_TAG, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_PARTICIPANT]) == 0) {
			// Name (fileAs)
			htmlArr[idx++] = "<td width=" + width;
			htmlArr[idx++] = " id='" + this._getFieldId(contact, ZmItem.F_PARTICIPANT) + "'>";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
			/*
			if (this._appCtxt.get(ZmSetting.IM_ENABLED) && contact.hasIMProfile())
				htmlArr[idx++] = AjxImg.getImageHtml(contact.isIMAvailable() ? "ImAvailable" : "ImUnavailable", null, null, true);
			*/
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_ATTACHMENT]) == 0) {
			// Attachment icon
			idx = this._getField(htmlArr, idx, contact, ZmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_SUBJECT]) == 0) {
			// Company
			htmlArr[idx++] = "<td id='" + this._getFieldId(contact, ZmItem.F_COMPANY) + "'>";
			htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getCompanyField());
			htmlArr[idx++] = AjxEnv.isNav ? ZmListView._fillerString : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(ZmListView.FIELD_PREFIX[ZmItem.F_DATE]) == 0) {
			htmlArr[idx++] = "<td width=" + width;
			htmlArr[idx++] = " id='" + this._getFieldId(contact, ZmItem.F_DATE) + "'>";
			htmlArr[idx++] = AjxDateUtil.computeDateStr(now, contact.modified);
			if (AjxEnv.isNav)
				htmlArr[idx++] = ZmListView._fillerString;
			htmlArr[idx++] = "</td>";
		}
	}
	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};
