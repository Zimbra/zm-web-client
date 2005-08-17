//////////////////////////////////////////////////////////////////////////////
// LmContactSplitView
// - parent for the simple list view and xform view
//////////////////////////////////////////////////////////////////////////////
function LmContactSplitView(parent, dropTgt, posStyle) {

	if (arguments.length == 0) return;
	posStyle = posStyle || Dwt.ABSOLUTE_STYLE;
	DwtComposite.call(this, parent, "LmContactSplitView", posStyle);

	this._listPart = new LmContactSimpleView(this, "LmContactSimpleView", dropTgt, posStyle);
	this._contactPart = new DwtComposite(this, "LmContactInfoView", posStyle);

	this._changeListener = new LsListener(this, this._contactChangeListener);
};

LmContactSplitView.prototype = new DwtComposite;
LmContactSplitView.prototype.constructor = LmContactSplitView;

LmContactSplitView.prototype.toString = 
function() {
	return "LmContactSplitView";
};

LmContactSplitView.prototype.getListView = 
function() {
	return this._listPart;
};

LmContactSplitView.prototype.setSize = 
function(width, height) {
	DwtComposite.prototype.setSize.call(this, width-10, height-10);
	this._sizeChildren(width, height);
};

LmContactSplitView.prototype.setBounds = 
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width-10, height-10);
	this._sizeChildren(width, height);
};

LmContactSplitView.prototype.getTitle = 
function() {
	return [LmMsg.zimbraTitle, LmMsg.contacts].join(": ");
};

LmContactSplitView.prototype.setContact = 
function(contact, isGal) {

	if (!isGal) {
		// Remove and re-add listeners for current contact if exists
		if (this._contact)
			this._contact.removeChangeListener(this._changeListener);
		contact.addChangeListener(this._changeListener);
	}
	
	this._contact = contact;
	this._setContact(contact, isGal);
};

LmContactSplitView.prototype.clear = 
function() {
	// clear the right pane
	this._contactPart.getHtmlElement().innerHTML = "";
	this._htmlInitialized = false;
}

LmContactSplitView.prototype._sizeChildren = 
function(width, height) {
	var padding = 4;		// css padding value (see LmContactSplitView class in lm.css)
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
		var bodyDiv = Dwt.getDomObj(this.getDocument(), this._contactBodyId);
		bodyDiv.style.width = this._contactPartWidth;
		bodyDiv.style.height = this._contactPartHeight - 40;
	}	
}

LmContactSplitView.prototype._createHtml = 
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

LmContactSplitView.prototype._contactChangeListener = 
function(ev) {
	if (ev.type != LmEvent.S_CONTACT || ev.source != this._contact)
		return;

	this._setContact(ev.source);
};

LmContactSplitView.prototype._setContact = 
function(contact, isGal) {

	if (!this._htmlInitialized)
		this._createHtml();

	var doc = this.getDocument();
	// set contact header (file as)
	var contactHdr = Dwt.getDomObj(doc, this._contactHeaderId);
	contactHdr.innerHTML = contact.getFileAs();
	
	// set body
	var contactBodyDiv = Dwt.getDomObj(doc, this._contactBodyId);
	
	var html = new Array();
	var idx = 0;
	
	var width = this._contactPart.getSize().x / 2;
	
	html[idx++] = "<div class='companyName'>" + (contact.getCompanyField() || "&nbsp;") + "</div>";
	html[idx++] = "<table border=0 width=100%>";
	// start real content
	
	// add email fields
	var email = contact.getAttr(LmContact.F_email);
	var email2 = contact.getAttr(LmContact.F_email2);
	var email3 = contact.getAttr(LmContact.F_email3);

	html[idx++] = "<tr><td colspan='*' valign=top>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (email || email2 || email3) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Email</td><td valign=top class='contactOutput'>";
		// TODO: make into EmailObjects and call compose view
		if (email) 		html[idx++] = email + "<br>";
		if (email2) 	html[idx++] = email2 + "<br>";
		if (email3) 	html[idx++] = email3 + "<br>";
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";
	
	html[idx++] = "<tr><td><br></td></tr>";
	
	// add work fields
	var workField = contact.getWorkAddrField();
	var workPhone = contact.getAttr(LmContact.F_workPhone);
	var workPhone2 = contact.getAttr(LmContact.F_workPhone2);
	var workFax = contact.getAttr(LmContact.F_workFax);
	var workAsst = contact.getAttr(LmContact.F_assistantPhone);
	var workCompany = contact.getAttr(LmContact.F_companyPhone);
	var workCallback = contact.getAttr(LmContact.F_callbackPhone);
	var workURL = contact.getAttr(LmContact.F_workURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (workField || workPhone || workPhone2 || workFax || workAsst || workCompany || workCallback || workURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Work</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (workField) 	html[idx++] = workField + "<br>";
		if (workURL) 	html[idx++] = "<a href='" + workURL + "' target='_blank'>" + workURL + "</a>";
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (workPhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + workPhone + "</td></tr>";
	if (workPhone2)		html[idx++] = "<tr><td class='contactLabel'>Phone 2</td><td class='contactOutput'>" + workPhone2 + "</td></tr>";
	if (workFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + workFax + "</td></tr>";
	if (workAsst)		html[idx++] = "<tr><td class='contactLabel'>Assistant</td><td class='contactOutput'>" + workAsst + "</td></tr>";
	if (workCompany)	html[idx++] = "<tr><td class='contactLabel'>Company</td><td class='contactOutput'>" + workCompany + "</td></tr>";
	if (workCallback)	html[idx++] = "<tr><td class='contactLabel'>Callback</td><td class='contactOutput'>" + workCallback + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";

	html[idx++] = "<tr><td><br></td></tr>";
	
	// add home fields
	var homeField = contact.getHomeAddrField();
	var homePhone = contact.getAttr(LmContact.F_homePhone);
	var homePhone2 = contact.getAttr(LmContact.F_homePhone2);
	var homeFax = contact.getAttr(LmContact.F_homeFax);
	var mobile = contact.getAttr(LmContact.F_mobilePhone);
	var pager = contact.getAttr(LmContact.F_pager);
	var homeURL = contact.getAttr(LmContact.F_homeURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (homeField || homePhone || homePhone2 || homeFax || mobile || pager || homeURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Home</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (homeField) 	html[idx++] = homeField + "<br>";
		if (homeURL) 	html[idx++] = "<a href='" + homeURL + "' target='_blank'>" + homeURL + "</a>";
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (homePhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + homePhone + "</td></tr>";
	if (homePhone2)		html[idx++] = "<tr><td class='contactLabel'>Phone 2</td><td class='contactOutput'>" + homePhone2 + "</td></tr>";
	if (homeFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + homeFax + "</td></tr>";
	if (mobile)			html[idx++] = "<tr><td class='contactLabel'>Mobile</td><td class='contactOutput'>" + mobile + "</td></tr>";
	if (pager)			html[idx++] = "<tr><td class='contactLabel'>Pager</td><td class='contactOutput'>" + pager + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";

	html[idx++] = "<tr><td><br></td></tr>";
	
	// add other fields
	var otherField = contact.getOtherAddrField();
	var otherPhone = contact.getAttr(LmContact.F_otherPhone);
	var otherFax = contact.getAttr(LmContact.F_otherFax);
	var otherURL = contact.getAttr(LmContact.F_otherURL);

	html[idx++] = "<tr><td valign=top width='" + width + "'>";
	// - column 1
	html[idx++] = "<table border=0>";
	if (otherField || otherPhone || otherFax || otherURL) {
		html[idx++] = "<tr><td valign=top class='contactLabel'>Other</td>";
		html[idx++] = "<td valign=top class='contactOutput'>";
		if (otherField) html[idx++] = otherField + "<br>";
		if (otherURL) 	html[idx++] = "<a href='" + otherURL + "' target='_blank'>" + otherURL + "</a>";
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";
	html[idx++] = "</td>";
	// - column 2
	html[idx++] = "<td valign=top><table border=0>";
	if (otherPhone)		html[idx++] = "<tr><td class='contactLabel'>Phone</td><td class='contactOutput'>" + otherPhone + "</td></tr>";
	if (otherFax)		html[idx++] = "<tr><td class='contactLabel'>Fax</td><td class='contactOutput'>" + otherFax + "</td></tr>";
	html[idx++] = "</table>";
	html[idx++] = "</td></tr>";
	
	html[idx++] = "<tr><td><br></td></tr>";
	
	var notes = contact.getAttr(LmContact.F_notes);
	html[idx++] = "<tr><td valign=top colspan='10'>";
	if (notes) {
		html[idx++] = "<table border=0 width=100%>";
		html[idx++] = "<tr><td valign=top class='contactLabel'>Notes</td><td class='contactOutput'>" + notes + "</td></tr>";
		html[idx++] = "</table>";
	}
	html[idx++] = "</td></tr>";

	html[idx++] = "</table>";
	html[idx++] = "</div>";
	
	contactBodyDiv.innerHTML = html.join("");
};

//////////////////////////////////////////////////////////////////////////////
// LmContactSimpleView
// - a simple contact list view (contains only full name)
//////////////////////////////////////////////////////////////////////////////
function LmContactSimpleView(parent, className, dropTgt, posStyle) {
	LmContactsBaseView.call(this, parent, className, LmController.CONTACT_SIMPLE_VIEW, null, dropTgt, posStyle);
};

LmContactSimpleView.prototype = new LmContactsBaseView;
LmContactSimpleView.prototype.constructor = LmContactSimpleView;

LmContactSimpleView.prototype.toString = 
function() {
	return "LmContactSimpleView";
};

LmContactSimpleView.prototype.set =
function(list, defaultColumnSort) {
	LmContactsBaseView.prototype.set.call(this, list, defaultColumnSort);
	if (!(this._list instanceof LsVector) || this._list.size() == 0)
		this.parent.clear();
};

LmContactSimpleView.prototype._modifyContact =
function(ev) {
	LmContactsBaseView.prototype._modifyContact.call(this, ev);
	
	if (ev.getDetail("fileAsChanged")) {
		var selected = this.getSelection()[0];
		this._layout();
		this.setSelection(selected, true);
	}
};

LmContactSimpleView.prototype._layout =
function() {
	// explicitly remove each child (setting innerHTML causes mem leak)
	while (this._parentEl.hasChildNodes()) {
		cDiv = this._parentEl.removeChild(this._parentEl.firstChild);
		LsCore.unassignId(cDiv._itemIndex);
	}

	var size = this._list.size();
	for (var i = 0; i < size; i++) {
		var item = this._list.get(i);
		var div = item ? this._createItemHtml(item, this._now) : null;
		if (div)
			this._addRow(div);
	}
};

LmContactSimpleView.prototype._createItemHtml =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == LmFolder.ID_TRASH))
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
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, LmItem.F_TAG_CELL);
		htmlArr[idx++] = "<td style='vertical-align:middle; height:24px' width=16 class='Tag' id='" + cellId + "'>";
		htmlArr[idx++] = this._getTagImgHtml(contact, LmItem.F_TAG);
		htmlArr[idx++] = "</td>";
	}
		
	// file as
	htmlArr[idx++] = "<td style='vertical-align: middle'>&nbsp;" + LsStringUtil.htmlEncode(contact.getFileAs()) + "&nbsp;</td>";
	
	htmlArr[idx++] = "</tr></table>";
	
	div.innerHTML = htmlArr.join("");
	
	return div;
};

// this is used by mixed view to create the old listview version of contact list
LmContactSimpleView.prototype._createContactHtmlForMixed =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == LmFolder.ID_TRASH))
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
		var width = LsEnv.isIE ? (this._headerList[i]._width + 4) : this._headerList[i]._width;

		if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ICON]) == 0) {
			// Type icon
			idx = this._getField(htmlArr, idx, contact, LmItem.F_ITEM_TYPE, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_FLAG]) == 0) {
			// Flag
			idx = this._getField(htmlArr, idx, contact, LmItem.F_FLAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_TAG]) == 0) {
			// Tags
			idx = this._getField(htmlArr, idx, contact, LmItem.F_TAG, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_PARTICIPANT]) == 0) {
			// Name (fileAs)
			htmlArr[idx++] = "<td width=" + width;
			htmlArr[idx++] = " id='" + this._getFieldId(contact, LmItem.F_PARTICIPANT) + "'>";
			htmlArr[idx++] = LsStringUtil.htmlEncode(contact.getFileAs());
			if (this._appCtxt.get(LmSetting.IM_ENABLED) && contact.hasIMProfile())
				htmlArr[idx++] = LsImg.getImageHtml(contact.isIMAvailable() ? LmImg.I_IM : LmImg.ID_IM);
			if (LsEnv.isNav)
				htmlArr[idx++] = LmListView._fillerString;
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_ATTACHMENT]) == 0) {
			// Attachment icon
			idx = this._getField(htmlArr, idx, contact, LmItem.F_ATTACHMENT, i);
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_SUBJECT]) == 0) {
			// Company
			htmlArr[idx++] = "<td id='" + this._getFieldId(contact, LmItem.F_COMPANY) + "'>";
			htmlArr[idx++] = LsStringUtil.htmlEncode(contact.getCompanyField());
			htmlArr[idx++] = LsEnv.isNav ? LmListView._fillerString : "";
			htmlArr[idx++] = "</td>";
		} else if (id.indexOf(LmListView.FIELD_PREFIX[LmItem.F_DATE]) == 0) {
			htmlArr[idx++] = "<td width=" + width;
			htmlArr[idx++] = " id='" + this._getFieldId(contact, LmItem.F_DATE) + "'>";
			htmlArr[idx++] = LsDateUtil.computeDateStr(now, contact.modified);
			if (LsEnv.isNav)
				htmlArr[idx++] = LmListView._fillerString;
			htmlArr[idx++] = "</td>";
		}
	}
	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");
	return div;
};
