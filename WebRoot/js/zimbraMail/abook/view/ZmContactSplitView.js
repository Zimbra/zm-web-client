/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
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
ZmContactSplitView = function(parent, className, posStyle, controller, dropTgt) {
	if (arguments.length == 0) return;

	className = className || "ZmContactSplitView";
	posStyle = posStyle || Dwt.ABSOLUTE_STYLE;
	DwtComposite.call(this, parent, className, posStyle);

	this._controller = controller;
	this._appCtxt = controller._appCtxt;

	this._appCtxt.getFolderTree().addChangeListener(new AjxListener(this, this._addrbookTreeListener));
	var tagTree = this._appCtxt.getTagTree();
	if (tagTree) {
		tagTree.addChangeListener(new AjxListener(this, this._tagChangeListener));
	}

	this._tagCellId = Dwt.getNextId();

	// find out if the user's locale has a alphabet defined
	if (ZmMsg.alphabet && ZmMsg.alphabet.length>0) {
		this._alphabetBar = new ZmContactAlphabetBar(this, this._appCtxt);
	}

	this._listPart = new ZmContactSimpleView(this, null, posStyle, controller, dropTgt);
	this._contactPart = new DwtComposite(this, "ZmContactInfoView", posStyle);
	this._contactPart._setAllowSelection();

	this._changeListener = new AjxListener(this, this._contactChangeListener);

	this._contactPart._setMouseEventHdlrs(); // needed by object manager
	// this manages all the detected objects within the view
	this._objectManager = new ZmObjectManager(this._contactPart, this.shell.getData(ZmAppCtxt.LABEL));
};

ZmContactSplitView.prototype = new DwtComposite;
ZmContactSplitView.prototype.constructor = ZmContactSplitView;


// Consts
ZmContactSplitView.ALPHABET_HEIGHT = 35;

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
};

ZmContactSplitView.prototype.getAlphabetBar =
function() {
	return this._alphabetBar;
};

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

	if (this._contact.isLoaded) {
		this._setContact(contact, isGal);
	} else {
		var callback = new AjxCallback(this, this._handleResponseLoad, [isGal]);
		var errorCallback = new AjxCallback(this, this._handleErrorLoad);
		this._contact.load(callback);
	}
};

ZmContactSplitView.prototype._handleResponseLoad =
function(isGal, contact) {
	if (contact.id == this._contact.id)
		this._setContact(this._contact, isGal);
};

ZmContactSplitView.prototype._handleErrorLoad =
function(ex) {
	this._clear();
	// TODO - maybe display some kind of error?
};

ZmContactSplitView.prototype.clear =
function() {
	// clear the right pane
	this._contactPart.getHtmlElement().innerHTML = "";
	this._htmlInitialized = false;
};

ZmContactSplitView.prototype.enableAlphabetBar =
function(enable) {
	this._alphabetBar.enable(enable);
};

ZmContactSplitView.prototype._sizeChildren =
function(width, height) {
	var padding = 5;		// css padding value (see ZmContactSplitView css class)
	var listWidth = 200;	// fixed width size of list view

	// calc. height for children of this view
	var alphabetBarHeight = this._alphabetBar ? ZmContactSplitView.ALPHABET_HEIGHT : null;
	var childHeight = (height - (padding * 2)) - (alphabetBarHeight || 0);
	// always set the list part width to 200px (should be in css?)
	this._listPart.setSize(listWidth, childHeight);
	this._listPart.setLocation(Dwt.DEFAULT, (alphabetBarHeight || Dwt.DEFAULT));

	// explicitly set the size for the xform part
	var listSize = this._listPart.getSize();
	var contactWidth = width - ((padding * 5) + listWidth);
	var contactXPos = (padding * 3) + listWidth;
	this._contactPart.setSize(contactWidth, childHeight);
	this._contactPart.setLocation(contactXPos, (alphabetBarHeight || Dwt.DEFAULT));

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
	this._contactHeaderRowId = Dwt.getNextId();
	this._contactHeaderId = Dwt.getNextId();
	this._contactBodyId = Dwt.getNextId();

	var html = [];
	var idx = 0;

	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0 width=100% height=100%>";
	html[idx++] = "<tr class='contactHeaderRow' id='";
	html[idx++] = this._contactHeaderRowId;
	html[idx++] = "'><td width='";
	html[idx++] = this._contactPartWidth;
	html[idx++] = "' id='";
	html[idx++] = this._contactHeaderId;
	html[idx++] = "'></td></tr>";
	html[idx++] = "<tr height=100%><td colspan=3 valign=top><div style='width:";
	html[idx++] = this._contactPartWidth;
	html[idx++] = "; height:";
	html[idx++] = this._contactPartHeight - 40;
	html[idx++] = "; overflow: auto' id='";
	html[idx++] = this._contactBodyId;
	html[idx++] = "'></div></td></tr></table>";

	this._contactPart.getHtmlElement().innerHTML = html.join("");

	this._htmlInitialized = true;
};

ZmContactSplitView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT ||
		ev.source != this._contact ||
		ev.event == ZmEvent.E_DELETE)
	{
		return;
	}

	this._setContact(ev.source);
};

ZmContactSplitView.prototype._addrbookTreeListener =
function(ev, treeView) {
	if (!this._contact)
		return;

	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && fields && fields[ZmOrganizer.F_COLOR]) {
		var organizers = ev.getDetail("organizers");
		if (!organizers && ev.source)
			organizers = [ev.source];

		for (var i = 0; i < organizers.length; i++) {
			var organizer = organizers[i];
			var folderId = this._contact.isShared()
				? this._appCtxt.getById(this._contact.folderId).id
				: this._contact.folderId;

			if (organizer.id == folderId)
				this._setHeaderColor(organizer);
		}
	}
};

ZmContactSplitView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

ZmContactSplitView.prototype._setContact =
function(contact, isGal) {

	// if folderId is null, that means user did a search (did not click on a addrbook)
	var folderId = this._controller.getFolderId();
	if (folderId && contact.folderId != folderId && !contact.isShared())
		return;

	if (!this._htmlInitialized)
		this._createHtml();

	this._setHeaderColor(contact.addrbook);

	// set contact header (file as)
	var newFolder = this._appCtxt.getById(contact.folderId);
	var hdrHtml = [];
	var idx = 0;
	hdrHtml[idx++] = "<table border=0 width=100% cellpadding=0 cellspacing=0><tr>";
	hdrHtml[idx++] = "<td width=20><center>";
	hdrHtml[idx++] = AjxImg.getImageHtml(contact.getIcon());
	hdrHtml[idx++] = "</center></td><td class='";
	hdrHtml[idx++] = newFolder && newFolder.isInTrash() ? "contactHeader Trash" : "contactHeader";
	hdrHtml[idx++] = "'>";
	hdrHtml[idx++] = contact.getFileAs();
	hdrHtml[idx++] = "</td><td align=right id='";
	hdrHtml[idx++] = this._tagCellId;
	hdrHtml[idx++] = "'>";
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		hdrHtml[idx++] = this._getTagHtml(contact);
	}
	hdrHtml[idx++] = "</td></tr></table>";

	var contactHdr = document.getElementById(this._contactHeaderId);
	contactHdr.innerHTML = hdrHtml.join("");

	// set body
	var contactBodyDiv = document.getElementById(this._contactBodyId);
	var width = this._contactPart.getSize().x / 2;

	contactBodyDiv.innerHTML = contact.isGroup()
		? this._getGroupHtml(contact, width)
		: this._getContactHtml(contact, isGal);
};

ZmContactSplitView.prototype._getGroupHtml =
function(contact, width) {
	var html = [];
	var idx = 0;

	var members = contact.getGroupMembers().good.getArray();

	// set company name and folder this contact belongs to
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%><tr>";
	html[idx++] = "<td width=100%><table border=0>";
	for (var i = 0; i < members.length; i++) {
		html[idx++] = "<tr><td width=20>";
		html[idx++] = AjxImg.getImageHtml("Message");
		html[idx++] = "</td><td><nobr>";
		html[idx++] = AjxStringUtil.htmlEncode(members[i].toString());
		html[idx++] = "</nobr></td></tr>";
	}
	html[idx++] = "</table></td>";
	html[idx++] = "<td width=20 valign=top>";
	html[idx++] = AjxImg.getImageHtml(contact.addrbook.getIcon());
	html[idx++] = "</td><td class='companyFolder' valign=top>";
	html[idx++] = contact.addrbook.getName();
	html[idx++] = "</td>";
	html[idx++] = "</tr></table>";

	return html.join("");
};

ZmContactSplitView.prototype._getContactHtml =
function(contact, isGal, width) {
	var html = [];
	var idx = 0;

	// set company name and folder this contact belongs to
	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%><tr>";
	html[idx++] = "<td width=100% class='companyName'>";
	html[idx++] = (contact.getCompanyField() || "&nbsp;");
	html[idx++] = "</td>";
	if (contact.addrbook) {
		html[idx++] = "<td width=20>";
		html[idx++] = AjxImg.getImageHtml(contact.addrbook.getIcon());
		html[idx++] = "</td><td class='companyFolder'>";
		html[idx++] = contact.addrbook.getName();
		html[idx++] = "</td>";
	} else if (isGal) {
		html[idx++] = "<td width=20>";
		html[idx++] = AjxImg.getImageHtml("GAL");
		html[idx++] = "</td><td class='companyFolder'>";
		html[idx++] = ZmMsg.GAL;
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr></table>";

	html[idx++] = "<table border=0 width=100% cellpadding=3 cellspacing=3>";

	// add email fields
	var email  = contact.getAttr(ZmContact.F_email);
	var email2 = contact.getAttr(ZmContact.F_email2);
	var email3 = contact.getAttr(ZmContact.F_email3);
	var hasEmail = email || email2 || email3;

	if (hasEmail) {
		html[idx++] = "<tr><td colspan=4 valign=top class='sectionLabel'>";
		html[idx++] = ZmMsg.email;
		html[idx++] = "</td></tr><tr><td width=5>&nbsp;</td><td class='contactOutput'>";
		if (email) 	{ html[idx++] = this._generateObject(email,  ZmObjectManager.EMAIL); html[idx++] = "<br>"; }
		if (email2) { html[idx++] = this._generateObject(email2, ZmObjectManager.EMAIL); html[idx++] = "<br>"; }
		if (email3) { html[idx++] = this._generateObject(email3, ZmObjectManager.EMAIL); html[idx++] = "<br>"; }
		html[idx++] = "</td></tr>";
		html[idx++] = "<tr><td><br></td></tr>";
	}

	// add work fields
	var workField	= AjxStringUtil.nl2br(contact.getWorkAddrField());
	var workPhone	= contact.getAttr(ZmContact.F_workPhone);
	var workPhone2	= contact.getAttr(ZmContact.F_workPhone2);
	var workFax		= contact.getAttr(ZmContact.F_workFax);
	var workAsst	= contact.getAttr(ZmContact.F_assistantPhone);
	var workCompany = contact.getAttr(ZmContact.F_companyPhone);
	var workCallback= contact.getAttr(ZmContact.F_callbackPhone);
	var workURL 	= contact.getAttr(ZmContact.F_workURL);
	var hasWork		= workField || workPhone || workPhone2 || workFax || workAsst || workCompany || workCallback || workURL;

	if (hasWork) {
		html[idx++] = "<tr><td colspan=4 valign=top class='sectionLabel'>";
		html[idx++] = ZmMsg.work;
		html[idx++] = "</td></tr>";

		// - column 1
		html[idx++] = "<tr><td width=5>&nbsp;</td><td valign=top width='";
		html[idx++] = width;
		html[idx++] = "'>";

		if (workField || workURL) {
			html[idx++] = "<div class='contactOutput'>";
			if (workField) {
				html[idx++] = workField;
				html[idx++] = "<br>";
			}
			if (workURL)
				html[idx++] = this._generateObject(workURL, ZmObjectManager.URL);
			html[idx++] = "</div>";
		}
		html[idx++] = "</td>";

		// - column 2
		html[idx++] = "<td valign=top><table border=0>";
		if (workPhone)		idx = this._getObjectHtml(html, idx, ZmMsg.phone, workPhone, ZmObjectManager.PHONE);
		if (workPhone2)		idx = this._getObjectHtml(html, idx, ZmMsg.phone2, workPhone2, ZmObjectManager.PHONE);
		if (workFax)		idx = this._getObjectHtml(html, idx, ZmMsg.fax, workFax, ZmObjectManager.PHONE);
		if (workAsst)		idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_assistantPhone, workAsst, ZmObjectManager.PHONE);
		if (workCompany)	idx = this._getObjectHtml(html, idx, ZmMsg.company, workCompany, ZmObjectManager.PHONE);
		if (workCallback)	idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_callbackPhone, workCallback, ZmObjectManager.PHONE);
		html[idx++] = "</table>";
		html[idx++] = "</td></tr>";
		html[idx++] = "<tr><td><br></td></tr>";
	}

	// add home fields
	var homeField = AjxStringUtil.nl2br(contact.getHomeAddrField());
	var homePhone = contact.getAttr(ZmContact.F_homePhone);
	var homePhone2 = contact.getAttr(ZmContact.F_homePhone2);
	var homeFax = contact.getAttr(ZmContact.F_homeFax);
	var mobile = contact.getAttr(ZmContact.F_mobilePhone);
	var pager = contact.getAttr(ZmContact.F_pager);
	var homeURL = contact.getAttr(ZmContact.F_homeURL);
	var hasHome = homeField || homePhone || homePhone2 || homeFax || mobile || pager || homeURL;

	if (hasHome) {
		html[idx++] = "<tr><td colspan=4 valign=top class='sectionLabel'>";
		html[idx++] = ZmMsg.home;
		html[idx++] = "</td></tr>";

		// - column 1
		html[idx++] = "<tr><td width=5>&nbsp;</td><td valign=top width='";
		html[idx++] = width;
		html[idx++] = "'>";

		if (homeField || homeURL) {
			html[idx++] = "<div class='contactOutput'>";
			if (homeField) {
				html[idx++] = homeField;
				html[idx++] = "<br>";
			}
			if (homeURL)
				html[idx++] = this._generateObject(homeURL, ZmObjectManager.URL);
			html[idx++] = "</div>";
		}
		html[idx++] = "</td>";

		// - column 2
		html[idx++] = "<td valign=top><table border=0>";
		if (homePhone)		idx = this._getObjectHtml(html, idx, ZmMsg.phone, homePhone, ZmObjectManager.PHONE);
		if (homePhone2)		idx = this._getObjectHtml(html, idx, ZmMsg.phone2, homePhone2, ZmObjectManager.PHONE);
		if (homeFax)		idx = this._getObjectHtml(html, idx, ZmMsg.fax, homeFax, ZmObjectManager.PHONE);
		if (mobile)			idx = this._getObjectHtml(html, idx, ZmMsg.mobile, mobile, ZmObjectManager.PHONE);
		if (pager)			idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_pager, pager, ZmObjectManager.PHONE);
		html[idx++] = "</table></td></tr>";
		html[idx++] = "<tr><td><br></td></tr>";
	}

	// add other fields
	var otherField = AjxStringUtil.nl2br(contact.getOtherAddrField());
	var otherPhone = contact.getAttr(ZmContact.F_otherPhone);
	var otherFax = contact.getAttr(ZmContact.F_otherFax);
	var otherURL = contact.getAttr(ZmContact.F_otherURL);
	var birthday = contact.getAttr(ZmContact.F_birthday);
	var parsedBday = birthday ? (new AjxDateFormat("yyyy-MM-dd")).parse(birthday) : null;
	var hasOther = otherField || otherPhone || otherFax || otherURL || parsedBday;

	if (hasOther) {
		html[idx++] = "<tr><td colspan=4 valign=top class='sectionLabel'>";
		html[idx++] = ZmMsg.other;
		html[idx++] = "</td></tr>";

		// - column 1
		html[idx++] = "<tr><td width=5>&nbsp;</td><td valign=top width='";
		html[idx++] = width;
		html[idx++] = "'>";

		if (otherField || otherURL) {
			html[idx++] = "<div class='contactOutput'>";
			if (otherField) {
				html[idx++] = otherField;
				html[idx++] = "<br>";
			}
			if (otherURL)
				html[idx++] = this._generateObject(otherURL, ZmObjectManager.URL);
			html[idx++] = "</div>";
		}
		html[idx++] = "</td>";

		// - column 2
		html[idx++] = "<td valign=top><table border=0>";
		if (otherPhone)		idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_otherPhone, otherPhone, ZmObjectManager.PHONE);
		if (otherFax)		idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_otherFax, otherFax, ZmObjectManager.PHONE);
		if (parsedBday) {
			var dateStr = AjxDateUtil.simpleComputeDateStr(parsedBday);
			idx = this._getObjectHtml(html, idx, ZmMsg.AB_FIELD_birthday, dateStr, ZmObjectManager.DATE);
		}
		html[idx++] = "</table></td></tr>";
		html[idx++] = "<tr><td><br></td></tr>";
	}

	// add notes field
	var notes = this._generateObject(contact.getAttr(ZmContact.F_notes));
	if (notes) {
		html[idx++] = "<tr><td valign=top colspan=4 class='sectionLabel'>";
		html[idx++] = ZmMsg.notes;
		html[idx++] = "</td></tr><tr><td colspan=4 class='contactOutput'>";
		html[idx++] = AjxStringUtil.nl2br(notes);
		html[idx++] = "<br><br></td></tr>";
	}

	html[idx++] = "</table></div>";

	return html.join("");
};

ZmContactSplitView.prototype._getTagHtml =
function(contact) {
	var html = [];
	var idx = 0;

	// get sorted list of tags for this msg
	var ta = [];
	for (var i = 0; i < contact.tags.length; i++) {
		ta.push(this._appCtxt.getById(contact.tags[i]));
	}
	ta.sort(ZmTag.sortCompare);

	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) { continue; }
		var icon = ZmTag.COLOR_MINI_ICON[tag.color];
		var attr = ["id='", this._tagCellId, tag.id, "'"].join("");
		// XXX: set proper class name for link once defined!
		html[idx++] = "<a href='javascript:;' class='' onclick='ZmContactSplitView._tagClicked(";
		html[idx++] = '"';
		html[idx++] = tag.id;
		html[idx++] = '"';
		html[idx++] = "); return false;'>"
		html[idx++] = AjxImg.getImageSpanHtml(icon, null, attr, tag.name);
		html[idx++] = "</a>&nbsp;";
	}
	return html.join("");
};

ZmContactSplitView.prototype._getObjectHtml = 
function(html, idx, label, field, objMgr) {
	html[idx++] = "<tr><td class='contactLabel'>";
	html[idx++] = label;
	html[idx++] = ":</td><td class='contactOutput'>";
	html[idx++] = this._generateObject(field, objMgr);
	html[idx++] = "</td></tr>";

	return idx;
};

ZmContactSplitView.prototype._setHeaderColor =
function(folder) {
	// set background color of header
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var contactHdrRow = document.getElementById(this._contactHeaderRowId);
	contactHdrRow.className = "contactHeaderRow " + bkgdColor;
};

ZmContactSplitView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		var tagCell = document.getElementById(this._tagCellId);
		tagCell.innerHTML = this._getTagHtml(this._contact);
	}
};

ZmContactSplitView._tagClicked =
function(tagId) {
	var appCtxt = window._zimbraMail._appCtxt;
	var sc = appCtxt ? appCtxt.getSearchController() : null;
	if (sc) {
		var tag = appCtxt.getById(tagId);
		var query = 'tag:"' + tag.name + '"';
		sc.search({query: query});
	}
};

//////////////////////////////////////////////////////////////////////////////
// ZmContactSimpleView
// - a simple contact list view (contains only full name)
//////////////////////////////////////////////////////////////////////////////
ZmContactSimpleView = function(parent, className, posStyle, controller, dropTgt) {
	className = className || "ZmContactSimpleView";
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
	ZmContactsBaseView.prototype.set.call(this, list, defaultColumnSort, this._controller.getFolderId());
	if (!(this._list instanceof AjxVector) || this._list.size() == 0) {
		this.parent.clear();
		var view = this._controller._getViewType();
		this._controller._navToolBar[view].setText("");
	}

	this.parent.enableAlphabetBar(!list.isGal);
};

ZmContactSimpleView.prototype._setNoResultsHtml =
function() {
	ZmContactsBaseView.prototype._setNoResultsHtml.call(this);
	this.parent.clear();
};

ZmContactSimpleView.prototype._changeListener =
function(ev) {
	ZmContactsBaseView.prototype._changeListener.call(this, ev);

	// bug fix #14874 - if moved to trash, show strike-thru
	var folderId = this._controller.getFolderId();
	if (!folderId && ev.event == ZmEvent.E_MOVE) {
		var contact = ev._details.items[0];
		var folder = this._appCtxt.getById(contact.folderId);
		var row = this._getElement(contact, ZmItem.F_ITEM_ROW);
		if (row) {
			row.className = folder && folder.isInTrash()
				? "Trash" : "";
		}
	}
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
		var div = item ? this._createItemHtml(item, {now:this._now}) : null;
		if (div)
			this._addRow(div);
	}
};

/**
 * A contact is normally displayed in a list view with no headers, and shows
 * just an icon and name. The mixed list view has headers, and the row can
 * be built in the standard way.
 * 
 * @param contact	[ZmContact]		contact to display
 * @param params	[hash]*			optional params
 */
ZmContactSimpleView.prototype._createItemHtml =
function(contact, params) {

	if (params.isMixedView) {
		return ZmContactsBaseView.prototype._createItemHtml.apply(this, arguments);
	}

	var div = this._getDiv(contact, params);
	
	if (params.isDnDIcon) {
		div.style.width = "175px";
		div.style.padding = "4px";
	}
	div.className = div[DwtListView._STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + " SimpleContact";
	div[DwtListView._SELECTED_STYLE_CLASS] += " SimpleContact";
	// XXX: commented out b/c slows down loading contact (DOM tree is too deep!)
	//div._hoverStyleClass = "SimpleContactHover";
	div.id = this._getItemId(contact);

	var htmlArr = [];
	var idx = 0;

	// table/row
	idx = this._getTable(htmlArr, idx, params);
	idx = this._getRow(htmlArr, idx, contact, params);

	// checkbox selection
	if (this._appCtxt.get(ZmSetting.SHOW_SELECTION_CHECKBOX)) {
		htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
		idx = this._getImageHtml(htmlArr, idx, "TaskCheckbox", this._getFieldId(contact, ZmItem.F_SELECTION));
		htmlArr[idx++] = "</center></td>";
	}

	// icon
	htmlArr[idx++] = "<td style='vertical-align:middle;' width=20><center>";
	htmlArr[idx++] = AjxImg.getImageHtml(contact.getIcon());
	htmlArr[idx++] = "</center></td>";

	// file as
	htmlArr[idx++] = "<td style='vertical-align:middle;'>&nbsp;";
	htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
	htmlArr[idx++] = "</td>";

	if (!params.isDnDIcon) {
		// if read only, show lock icon in place of the tag column since we dont
		// currently support tags for "read-only" contacts (i.e. shares)
		if (contact.isReadOnly()) {
			htmlArr[idx++] = "<td width=16>";
			htmlArr[idx++] = AjxImg.getImageHtml("ReadOnly");
			htmlArr[idx++] = "</td>";
		} else if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			// otherwise, show tag if there is one
			htmlArr[idx++] = "<td style='vertical-align:middle;' width=16 class='Tag'>";
			idx = this._getImageHtml(htmlArr, idx, contact.getTagImageInfo(), this._getFieldId(contact, ZmItem.F_TAG));
			htmlArr[idx++] = "</td>";
		}
	}
	htmlArr[idx++] = "</tr></table>";

	div.innerHTML = htmlArr.join("");

	return div;
};

// mixed view
ZmContactSimpleView.prototype._getCellContents =
function(htmlArr, idx, contact, field, colIdx, params) {
	if (field == ZmItem.F_FROM) {
		// Name (fileAs)
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
	} else if (field == ZmItem.F_SUBJECT) {
		// Company
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getCompanyField());
	} else if (field == ZmItem.F_DATE) {
		htmlArr[idx++] = AjxDateUtil.computeDateStr(params.now, contact.modified);
	} else {
		idx = ZmContactsBaseView.prototype._getCellContents.apply(this, arguments);
	}
	
	return idx;
};

ZmContactSimpleView.prototype._getToolTip =
function(field, item, ev) {
	return (item && (field == ZmItem.F_FROM)) ? item.getToolTip(item.getAttr(ZmContact.F_email)) :
												ZmContactsBaseView.prototype._getToolTip.apply(this, arguments);
};

ZmContactSimpleView.prototype._getDateToolTip = 
function(item, div) {
	div._dateStr = div._dateStr || this._getDateToolTipText(item.modified, ["<b>", ZmMsg.lastModified, ":</b><br>"].join(""));
	return div._dateStr;
};
