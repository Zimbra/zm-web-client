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

function ZmContactCardsView(parent, className, posStyle, controller, dropTgt) {

	className = className ? className : "ZmContactCardsView";
	posStyle = posStyle ? posStyle : Dwt.ABSOLUTE_STYLE;
	ZmContactsBaseView.call(this, parent, className, posStyle, ZmController.CONTACT_CARDS_VIEW, controller, null, dropTgt);

	this._setMouseEventHdlrs(); // needed by object manager
	// this manages all the detected objects within the view
	this._objectManager = new ZmObjectManager(this, this.shell.getData(ZmAppCtxt.LABEL));
};

ZmContactCardsView.prototype = new ZmContactsBaseView;
ZmContactCardsView.prototype.constructor = ZmContactCardsView;

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
function(contacts) {
	if (this._objectManager)
		this._objectManager.reset();

	// XXX: optimize later - switch view always forces layout unnecessarily
	ZmContactsBaseView.prototype.set.call(this, contacts);
	this._layout();
};

ZmContactCardsView.prototype._generateObject =
function(data, type) {
	return this._objectManager.findObjects(data, true, type);
};

ZmContactCardsView.prototype._createItemHtml =
function(contact, now, isDndIcon, getHtml) {

	var style = AjxEnv.isLinux ? " style='line-height:13px'" : "";
	var html = new Array();
	var idx = 0;
	var div = null;

	if (getHtml) {
		html[idx++] = "<div class='ZmContactCard' _styleClass='ZmContactCard' _selectedStyleClass='ZmContactCard-";
		html[idx++] = DwtCssStyle.SELECTED;
		// manually associate item with element :(
		html[idx++] = "' id='";
		html[idx++] = this._getItemId(contact);
		html[idx++] = "' _itemIndex='";
		html[idx++] = AjxCore.assignId(contact);
		html[idx++] = "' _type='";
		html[idx++] = DwtListView.TYPE_LIST_ITEM;
		html[idx++] = "'>";
	} else {
		// create div for DnD
		div = document.createElement("div");
		div._styleClass = "ZmContactCard-dnd";
		// bug fix #3654 - yuck
		if (AjxEnv.isMozilla) div.style.overflow = "visible";
		div.style.position = "absolute";
		div.className = div._styleClass;
		this.associateItemWithElement(contact, div, DwtListView.TYPE_LIST_ITEM);
	}

	html[idx++] = "<table border=0 width=100% cellpadding=0 cellspacing=0>";
	html[idx++] = "<tr style='padding:0' class='contactHeader'>";
	html[idx++] = "<td valign=top><div class='contactHeader' style='font-size:16px;";
	if (AjxEnv.isIE)
		html[idx++] = " width:280;";
	html[idx++] = "'>";
	html[idx++] = contact.getFileAs();
	html[idx++] = "</div></td>";

	// Tag
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, ZmItem.F_TAG_CELL);
		html[idx++] = "<td id='" + cellId + "'>";
		var fieldId = this._getFieldId(contact, ZmItem.F_TAG);
		html[idx++] = AjxImg.getImageHtml(contact.getTagImageInfo(), null, ["id='", fieldId, "'"].join(""));
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr><tr";
	html[idx++] = style;
	html[idx++] = ">";
	
	html[idx++] = "<td valign=top width=100% style='font-weight:bold; padding-left: 2px'>";
	var value = contact.getCompanyField() || "&nbsp;";
	html[idx++] = value + "</td>";
	
	html[idx++] = "</tr><tr height=100%><td valign=top colspan=10>";

	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1>";
	html[idx++] = "<tr><td valign=top>";
	html[idx++] = "<table border=0><tr";
	html[idx++] = style;
	html[idx++] = ">";
	// add first column of work info here
	if (value = contact.getWorkAddrField())
		html[idx++] = this._getField("W", value, isDndIcon);
	else if (value = contact.getHomeAddrField())
		html[idx++] = this._getField("H", value, isDndIcon);
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
	html[idx++] = "</td></tr></table>";

	if (div) {
		div.innerHTML = html.join("");
		return div;
	} else {
		html[idx++] = "</div>";
		return html.join("");
	}
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

// override so that we don't get back ZmListView._fillerString
ZmContactCardsView.prototype._getTagImgHtml =
function(item, id) {
	var idStr = id ? ["id='", id, "'"].join("") : null;
	return AjxImg.getImageHtml(item.getTagImageInfo(), null, idStr);
};

ZmContactCardsView.prototype._layout =
function() {
	this.removeAll();
	if (this._list instanceof AjxVector && this._list.size()) {
		var list = this._list.getArray();
		var html = new Array();
		var i = 0;
		var count = 0;

		// OPTIMIZE: dont use appendChild to add to DOM - slows down IE
		html[i++] = "<table border=0 cellpadding=5 cellspacing=5>";
		for (var j = 0; j < list.length; j++) {
			var contact = list[j];
			
			// in canonical view, don't show contacts in the Trash
			if (contact.list.isCanonical && (contact.folderId == ZmFolder.ID_TRASH))
				continue;

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

		this.getHtmlElement().innerHTML = html.join("");
	} else {
		this._setNoResultsHtml();
	}
};

ZmContactCardsView.prototype._modifyContact =
function(ev) {
	// always call base class first to resort list if necessary
	ZmContactsBaseView.prototype._modifyContact.call(this, ev);
	// XXX: opitimize later - always re-layout no matter which field changed
	this._parentEl.innerHTML = "";
	this._layout();
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
	// set selection to the first non-trash contact in list
	var selected = this.getFirstValid(this.getList());
	if (selected)
		this.setSelection(selected);
};

// returns all child divs w/in each table's rows/cells
ZmContactCardsView.prototype._getChildren = 
function() {
	var children = new Array();
	
	if (this._parentEl.childNodes.length) {
		var table = this._parentEl.childNodes[0];
		for (var i = 0; i < table.rows.length; i++) {
			var cells = table.rows[i].cells;
			for (var j = 0; j < cells.length; j++)
				children.push(cells[j].firstChild);
		}
	}
	
	return children;
};

// we overload this base class method since cards view is unconventional
ZmContactCardsView.prototype._getElFromItem = 
function(item) {
	var children = this._getChildren();
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

ZmContactCardsView.getPrintHtml = 
function(list) {

	var html = new Array();
	var idx = 0;
	var list = list.getArray();
	
	html[idx++] = "<table border=0 style='width: 6.5in'>";
	
	for (var i = 0; i < list.length; i++) {
		var contact = list[i];
		
		// dont include contacts in trash folder
		if (contact.folderId == ZmFolder.ID_TRASH)
			continue;
		
		// add a new row every 3 columns
		if ((i % 3) == 0)
			html[idx++] = "<tr>";
		html[idx++] = "<td valign=top height=100%>";
		
		html[idx++] = "<div style='height: 100%; width: 2.2in; border: 1px solid #CCCCCC;'>";
		html[idx++] = ZmContactView.getPrintHtml(contact, true);
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
