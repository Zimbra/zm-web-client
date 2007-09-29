/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

function ZmContactCardsView(parent, className, posStyle, controller, dropTgt) {

	className = className ? className : "ZmContactCardsView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmContactsBaseView.call(this, parent, className, posStyle, ZmController.CONTACT_CARDS_VIEW, controller, null, dropTgt);

	this._setMouseEventHdlrs(); // needed by object manager
	// this manages all the detected objects within the view
	this._objectManager = new ZmObjectManager(this, this.shell.getData(ZmAppCtxt.LABEL));

	// find out if the user's locale has a alphabet defined
	if (ZmMsg.alphabet && ZmMsg.alphabet.length>0) {
		this._alphabetBar = new ZmContactAlphabetBar(this, this._appCtxt, "ZmContactAlphabetBar");
	}

	this.addControlListener(new AjxListener(this, this._controlListener));

	this._addrbookTree = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK);
	this._addrbookTree.addChangeListener(new AjxListener(this, this._addrbookTreeListener));

	this._initialResized = false;
};

ZmContactCardsView.prototype = new ZmContactsBaseView;
ZmContactCardsView.prototype.constructor = ZmContactCardsView;

ZmContactCardsView.CARD_NAME = Dwt.getNextId();
ZmContactCardsView.CARD_TABLE_ID = Dwt.getNextId();

// Public methods

ZmContactCardsView.prototype.toString = 
function() {
	return "ZmContactCardsView";
};

ZmContactCardsView.prototype.paginate = 
function(contacts, bPageForward) {
	ZmContactsBaseView.prototype.paginate.call(this, contacts, bPageForward);
	this._layout();
	this.setSelection(contacts.getVector().get(this.getOffset()));
};

ZmContactCardsView.prototype.replenish = 
function(list) {
	ZmContactsBaseView.prototype.replenish.call(this, list);
	this._layout();
};

// lets just try to optimally layout all the cards by not letting base class do its thing
ZmContactCardsView.prototype.setUI =
function(defaultColumnSort) {
	// do nothing
};

ZmContactCardsView.prototype.set = 
function(contacts, sortField, folderId) {
	if (this._objectManager)
		this._objectManager.reset();

	// XXX: optimize later - switch view always forces layout unnecessarily
	ZmContactsBaseView.prototype.set.call(this, contacts, sortField, this._controller.getFolderId());

	if (this._initialResized)
		this._layout();

	// disable alphabet bar for gal searches
	this._alphabetBar.enable(!contacts.isGal);
};

ZmContactCardsView.prototype.getAlphabetBar =
function() {
	return this._alphabetBar;
};


// Private / protected methods

ZmContactCardsView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

ZmContactCardsView.prototype._createItemHtml =
function(contact, now, isDndIcon, getHtml) {
	var html = [];
	var idx = 0;
	var div = null;

	if (getHtml) {
		html[idx++] = "<div name='";
		html[idx++] = ZmContactCardsView.CARD_NAME;
		html[idx++] = "' class='ZmContactCard' ";
		html[idx++] = DwtListView._STYLE_CLASS;
		html[idx++] = "='ZmContactCard' ";
		html[idx++] = DwtListView._SELECTED_STYLE_CLASS;
		html[idx++] = "='ZmContactCard-";
		html[idx++] = DwtCssStyle.SELECTED;
		// manually associate item with element :(
		html[idx++] = "' ";
		html[idx++] = DwtListView._KBFOCUS_CLASS;
		html[idx++] = "='ZmContactCard-focused' id='";
		html[idx++] = this._getItemId(contact);
		html[idx++] = "' _itemIndex='";
		html[idx++] = AjxCore.assignId(contact);
		html[idx++] = "' _type='";
		html[idx++] = DwtListView.TYPE_LIST_ITEM;
		html[idx++] = "' style='width:";
		html[idx++] = this._cardWidth;
		html[idx++] = "'>";
	} else {
		// create div for DnD
		div = document.createElement("div");
		div[DwtListView._STYLE_CLASS] = "ZmContactCard-dnd";
		// bug fix #3654 - yuck
		if (AjxEnv.isMozilla) {
			div.style.overflow = "visible";
		}
		div.style.position = "absolute";
		div.className = div[DwtListView._STYLE_CLASS];
		if (isDndIcon) {
			div.style.width = this._cardWidth;
		}
		this.associateItemWithElement(contact, div, DwtListView.TYPE_LIST_ITEM);
	}

	html[idx++] = "<table border=0 width=100% height=100% cellpadding=0 cellspacing=0>";
	html[idx++] = "<tr class='contactHeader ";

	var color = contact.addrbook ? contact.addrbook.color : ZmAddrBook.DEFAULT_COLOR;
	html[idx++] = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	html[idx++] = "'>";
	html[idx++] = "<td width=16>";
	html[idx++] = AjxImg.getImageHtml(contact.getIcon(), "width:16");
	html[idx++] = "</td>";
	html[idx++] = "<td width=100% valign=top><div class='contactHeader'>";
	html[idx++] = contact.getFileAs();
	html[idx++] = "</div></td>";

	// Tag
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, ZmItem.F_TAG_CELL);
		html[idx++] = "<td width=16 id='";
		html[idx++] = cellId;
		html[idx++] = "'>";
		var fieldId = this._getFieldId(contact, ZmItem.F_TAG);
		html[idx++] = AjxImg.getImageHtml(contact.getTagImageInfo(), null, ["id='", fieldId, "'"].join(""));
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr>";

	idx = contact.isGroup()
		? this._getGroupHtml(contact, html, idx, isDndIcon)
		: this._getContactHtml(contact, html, idx, isDndIcon);

	html[idx++] = "</table>";

	if (div) {
		div.innerHTML = html.join("");
		return div;
	} else {
		html[idx++] = "</div>";
		return html.join("");
	}
};

ZmContactCardsView.prototype._getGroupHtml =
function(contact, html, idx, isDndIcon) {
	var style = AjxEnv.isLinux ? " style='line-height:13px'" : "";
	var members = contact.getGroupMembers().good.getArray();
	var size = members.length <= 5 ? members.length : Math.min(members.length, 5);

	html[idx++] = "<tr height=100%";
	html[idx++] = style;
	html[idx++] = ">";

	html[idx++] = "<td colspan=3 valign=top width=100% style='padding-left:2px'><table border=0>";

	for (var i = 0; i < size; i++) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = "<td width=20>";
		html[idx++] = AjxImg.getImageHtml("Message");
		html[idx++] = "</td><td><nobr>";
		html[idx++] = AjxStringUtil.htmlEncode(members[i].toString());
		html[idx++] = "</nobr></td></tr>";
	}
	if (size < members.length) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = "><td colspan=2><a href='javascript:;' onclick='ZmContactCardsView._moreDetailsCallback(";
		html[idx++] = '"';
		html[idx++] = contact.id;
		html[idx++] = '"';
		html[idx++] = ")'>";
		html[idx++] = ZmMsg.more;
		html[idx++] = "</a></td></tr>";
	}
	html[idx++] = "</table></td></tr>";

	return idx;
};

ZmContactCardsView.prototype._getContactHtml =
function(contact, html, idx, isDndIcon) {
	var style = AjxEnv.isLinux ? " style='line-height:13px'" : "";

	html[idx++] = "<tr";
	html[idx++] = style;
	html[idx++] = ">";

	html[idx++] = "<td colspan=2 valign=top width=100% style='font-weight:bold; padding-left:2px'>";
	var value = contact.getCompanyField() || "&nbsp;";
	html[idx++] = value;
	html[idx++] = "</td></tr>";

	html[idx++] = "<tr height=100%><td valign=top colspan=10>";

	html[idx++] = "<table height=100% border=0 cellpadding=1 cellspacing=1>";
	html[idx++] = "<tr height=100%><td valign=top>";
	html[idx++] = "<table border=0><tr";
	html[idx++] = style;
	html[idx++] = ">";
	// add first column of work info here
	if (value = contact.getWorkAddrField()) {
		html[idx++] = this._getField("W", value, isDndIcon);
	} else if (value = contact.getHomeAddrField()) {
		html[idx++] = this._getField("H", value, isDndIcon);
	}
	html[idx++] = "</tr>";

	if (value = contact.getAttr("email")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("E", value, isDndIcon, ZmObjectManager.EMAIL);
		html[idx++] = "</tr>";
	}

	if (value = contact.getAttr("email2")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("E2", value, isDndIcon, ZmObjectManager.EMAIL);
		html[idx++] = "</tr>";
	} else if (value = contact.getAttr("email3")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("E3", value, isDndIcon, ZmObjectManager.EMAIL);
		html[idx++] = "</tr>";
	}

	html[idx++] = "</table>";

	html[idx++] = "</td><td valign=top>";
	html[idx++] = "<table border=0>";
	// add second column of home info here
	if (value = contact.getAttr("workPhone")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("W", value, isDndIcon, ZmObjectManager.PHONE);
		html[idx++] = "</tr>";
	}
	if (value = contact.getAttr("workPhone2")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("W2", value, isDndIcon, ZmObjectManager.PHONE);
		html[idx++] = "</tr>";
	}
	if (value = contact.getAttr("workFax")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("F", value, isDndIcon, ZmObjectManager.PHONE);
		html[idx++] = "</tr>";
	}
	if (value = contact.getAttr("mobilePhone")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("M", value, isDndIcon, ZmObjectManager.PHONE);
		html[idx++] = "</tr>";
	}
	if (value = contact.getAttr("homePhone")) {
		html[idx++] = "<tr";
		html[idx++] = style;
		html[idx++] = ">";
		html[idx++] = this._getField("H", value, isDndIcon, ZmObjectManager.PHONE);
		html[idx++] = "</tr>";
	}

	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</td></tr>";
	if (!contact.isLoaded()) {
		html[idx++] = "<tr><td colspan=10 class='FinishLoading' onclick='ZmContactCardsView._loadContact(this, ";
		html[idx++] = '"';
		html[idx++] = contact.id;
		html[idx++] = '"';
		html[idx++] = ")'><center>";
		html[idx++] = ZmMsg.finishLoading;
		html[idx++] = "</center></td></tr>";
	}

	return idx;
};

ZmContactCardsView.prototype._getField =
function(fname, value, skipObjectify, type) {
	var newValue = skipObjectify ? value : this._generateObject(value, type);
	var html = new Array();
	var i = 0;

	html[i++] = "<td valign=top class='ZmContactFieldValue'>";
	html[i++] = fname;
	html[i++] = " </td><td valign=top class='ZmContactField'>";
	html[i++] = AjxStringUtil.nl2br(newValue);
	html[i++] = "</td>";

	return html.join("");
};

ZmContactCardsView.prototype._layout =
function() {
	this._resetListView();

	var html = new Array();
	var i = 0;

	html[i++] = "<center>";
	if (this._list instanceof AjxVector && this._list.size()) {
		var list = this._list.getArray();
		var count = 0;

		// OPTIMIZE: dont use appendChild to add to DOM - slows down IE
		html[i++] = "<table border=0 cellpadding=5 cellspacing=5 id='";
		html[i++] = ZmContactCardsView.CARD_TABLE_ID;
		html[i++] = "'>";
		for (var j = 0; j < list.length; j++) {
			var contact = list[j];
			
			// in canonical view, don't show contacts in the Trash unless explicitly set in prefs
			if (contact.list.isCanonical &&
				(contact.folderId == ZmFolder.ID_TRASH &&
				 !this._appCtxt.get(ZmSetting.SEARCH_INCLUDES_TRASH)))
			{
				continue;
			}

			if (count%2 == 0)
				html[i++] = "<tr>";

			count++;

			html[i++] = "<td valign=top>";
			html[i++] = this._createItemHtml(contact, null, null, true);
			html[i++] = "</td>";

			if (count%2 == 0)
				html[i++] = "</tr>";
		}
		html[i++] = "</table>";
	} else {
		html[i++] = "<div class='NoResults' id='";
		html[i++] = ZmContactCardsView.CARD_TABLE_ID;
		html[i++] = "'><br><br>";
		html[i++] = AjxMsg.noResults;
		html[i++] = "</div>";
	}
	html[i++] = "</center>";

	this.getHtmlElement().appendChild(Dwt.parseHtmlFragment(html.join("")));
};

ZmContactCardsView.prototype._setNoResultsHtml =
function() {
	// overload and ignore
};

// overload this protected method so we can keep the alphabet bar around
ZmContactCardsView.prototype._resetListView =
function() {
	var cards = document.getElementsByName(ZmContactCardsView.CARD_NAME);
	var cDiv;

	// explicitly remove each child (setting innerHTML causes mem leak)
	for (var i = 0; i < cards.length; i++) {
		cDiv = cards[0].parentNode.removeChild(cards[0]);
		AjxCore.unassignId(Dwt.getAttr(cDiv, "_itemIndex"));
	}

	var cardTable = document.getElementById(ZmContactCardsView.CARD_TABLE_ID);
	if (cardTable)
		cardTable.parentNode.removeChild(cardTable);
};

ZmContactCardsView.prototype._modifyContact =
function(ev) {
	// always call base class first to resort list if necessary
	ZmContactsBaseView.prototype._modifyContact.call(this, ev);

	// XXX: opitimize later - always re-layout no matter which field changed
	this._resetListView();
	this._layout();
};

// we overload this base class method since cards view is unconventional
ZmContactCardsView.prototype._getElFromItem = 
function(item) {
	var children = document.getElementsByName(ZmContactCardsView.CARD_NAME);
	var comparisonId = this._getItemId(item);

	for (var i = 0; i < children.length; i++) {
		if (children[i].id == comparisonId)
			return children[i];
	}
	return null;
};

ZmContactCardsView.prototype._setDnDIconState =
function(dropAllowed) {
	if (this._dndImg || !AjxEnv.isLinux) {
		ZmContactsBaseView.prototype._setDnDIconState.call(this, dropAllowed)
	} else {
		// bug fix #3235 - no opacity for linux
		this._dndIcon._origClassName = dropAllowed
			? this._dndIcon._origClassName + " DropAllowed-linux" 
			: this._dndIcon._origClassName + " DropNotAllowed-linux";
	}
};

ZmContactCardsView.prototype._handleResponseLoad =
function(result, contact) {
	var div = document.getElementById(this._getItemId(contact));
	var html = this._createItemHtml(contact, null, null, true);
	var newDiv = Dwt.parseHtmlFragment(html);
	div.innerHTML = newDiv.innerHTML;
};

ZmContactCardsView.prototype._getSiblingElement =
function(element, next){
	var item = this.getItemFromElement(this._kbAnchor);
	if (!item) return element;
	var index = this._list.indexOf(item);
	if ((next && (index >= this._list.size() - 1)) || (!next && index <= 0)) return element;
	index = next ? index + 1 : index - 1;
	var id = this._getItemId(this._list.get(index));
	var el = document.getElementById(id);
	return el ? el : element;
};


// Listeners

ZmContactCardsView.prototype._mouseDownListener = 
function(ev) {
	var div = ev.target;

	// bug fix #4595 - dont process mouse down for objects
	if (div.id.indexOf("OBJ_") == 0) {
		this._dragOp = Dwt.DND_DROP_NONE;
		this._dragging = DwtControl._NO_DRAG;
	} else {
		// otherwise, just call base class
		DwtListView.prototype._mouseDownListener.call(this, ev);
	}
};

ZmContactCardsView.prototype._changeListener =
function(ev) {
	// need custom handling for delete (can't just remove row)
	if (ev.event == ZmEvent.E_DELETE || ev.event == ZmEvent.E_MOVE) {
		var items = ev.getDetail("items");
		for (var i = 0; i < items.length; i++)
			this._list.remove(items[i]);
		this._layout();
	} else {
		ZmContactsBaseView.prototype._changeListener.call(this, ev);
	}
	this.setSelection(this.getList().get(0));
};

ZmContactCardsView.prototype._controlListener =
function(ev) {
	if (ev.newWidth < 0 || ev.oldWidth == ev.newWidth)
		return;

	// calc. width of card based on width of window
	this._cardWidth = Math.round((ev.newWidth / 2) - 40);

	this._initialResized = true;
	this._layout();
};

ZmContactCardsView.prototype._addrbookTreeListener =
function(ev, treeView) {
	var fields = ev.getDetail("fields");
	if (ev.event == ZmEvent.E_MODIFY && fields && fields[ZmOrganizer.F_COLOR]) {
		this._layout();
	}
};

// Static methods

ZmContactCardsView.getPrintHtml =
function(list) {

	var html = [];
	var idx = 0;
	var list = list.getArray();

	html[idx++] = "<table border=0 style='width:6.5in'>";

	for (var i = 0; i < list.length; i++) {
		var contact = list[i];

		// dont include contacts in trash folder
		if (contact.addrbook && contact.addrbook.isInTrash())
			continue;

		// add a new row every 3 columns
		if ((i % 3) == 0)
			html[idx++] = "<tr>";
		html[idx++] = "<td valign=top height=100%>";

		html[idx++] = "<div style='height:100%; width:2.2in; border:1px solid #CCCCCC; overflow-x:hidden'>";
		html[idx++] = contact.isGroup()
			? ZmGroupView.getPrintHtml(contact, true)
			: ZmContactView.getPrintHtml(contact, true);
		html[idx++] = "</div>";

		html[idx++] = "</td>";
		if (((i+1) % 3) == 0)
			html[idx++] = "</tr>";
	}

	if ((i % 3) != 0)
		html[idx++] = "</tr>";

	html[idx++] = "</table>";

	return html.join("");
};

ZmContactCardsView._loadContact =
function(cell, contactId) {
	var appCtxt = window._zimbraMail._appCtxt;
	var contact = appCtxt.cacheGet(contactId);
	if (contact && !contact.isLoaded()) {
		var clc = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactListController();
		var cardsView = clc.getParentView();
		var callback = new AjxCallback(cardsView, cardsView._handleResponseLoad);
		contact.load(callback);
	}

	// this looks weird, but we're just removing the table row
	cell.parentNode.parentNode.removeChild(cell.parentNode);
};

ZmContactCardsView._moreDetailsCallback =
function(contactId) {
	var appCtxt = window.parentController
		? window.parentController._appCtxt
		: window._zimbraMail._appCtxt;

	var capp = appCtxt.getApp(ZmZimbraMail.CONTACTS_APP);
	var contact = capp.getContactList().getById(contactId);
	capp.getContactController().show(contact);
};
