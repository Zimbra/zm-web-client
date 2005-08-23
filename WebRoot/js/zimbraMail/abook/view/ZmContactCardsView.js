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

function ZmContactCardsView(parent, dropTgt, posStyle) {

	posStyle = posStyle || Dwt.ABSOLUTE_STYLE;
	ZmContactsBaseView.call(this, parent, "ZmContactCardsView", ZmController.CONTACT_CARDS_VIEW, null, dropTgt, posStyle);
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
	// XXX: optimize later - switch view always forces layout unnecessarily
	ZmContactsBaseView.prototype.set.call(this, contacts);
	this._layout();
};

ZmContactCardsView.prototype._createItemHtml =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == ZmFolder.ID_TRASH))
		return null;
	
	// create div to add
	var div = this.getDocument().createElement("div");
	if (!isDndIcon) {
		div._styleClass = "ZmContactCard";
		div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	} else {
		div._styleClass = "ZmContactCard-dnd";
		div.style.position = "absolute";
	}
	div.className = div._styleClass;
	
	this.associateItemWithElement(contact, div, DwtListView.TYPE_LIST_ITEM);

	var style = AjxEnv.isLinux ? " style='line-height:13px'" : "";
	var html = new Array();
	var idx = 0;

	html[idx++] = "<table border=0 width=100% cellpadding=0 cellspacing=0>";
	html[idx++] = "<tr style='padding:0' class='contactHeader'><td valign=top class='contactHeader' style='font-size:16px'>" + contact.getFileAs() + "</td>";
	// Tag
	if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, ZmItem.F_TAG_CELL);
		html[idx++] = "<td id='" + cellId + "'>";
		var fieldId = this._getFieldId(contact, ZmItem.F_TAG);
		html[idx++] = AjxImg.getImageHtml(contact.getTagImageInfo(), null, ["id='", fieldId, "'"].join(""));
		html[idx++] = "</td>";
	}
	html[idx++] = "</tr><tr" + style + ">"
	
	html[idx++] = "<td valign=top width=100% style='font-weight:bold; padding-left: 2px'>";
	var value = contact.getCompanyField() || "&nbsp;";
	html[idx++] = value + "</td>";
	
	html[idx++] = "</tr><tr height=100%><td valign=top colspan=10>";

	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1>";
	html[idx++] = "<tr><td valign=top>";
	html[idx++] = "<table border=0><tr" + style + ">";
	// add first column of work info here
	if (value = contact.getWorkAddrField())
		html[idx++] = this._getField("W", value);
	else if (value = contact.getHomeAddrField())
		html[idx++] = this._getField("H", value);
	html[idx++] = "</tr>";
	
	if (value = contact.getAttr("email"))
		html[idx++] = "<tr" + style + ">" + this._getField("E", value) + "</tr>";
	if (value = contact.getAttr("email2"))
		html[idx++] = "<tr" + style + ">" + this._getField("E2", value) + "</tr>";
	else if (value = contact.getAttr("email3"))
		html[idx++] = "<tr" + style + ">" + this._getField("E3", value) + "</tr>";
	
	html[idx++] = "</table>";
	
	html[idx++] = "</td><td valign=top>";
	html[idx++] = "<table border=0>";
	// add second column of home info here
	if (value = contact.getAttr("workPhone"))
		html[idx++] = "<tr" + style + ">" + this._getField("W", value) + "</tr>";
	if (value = contact.getAttr("workPhone2"))
		html[idx++] = "<tr" + style + ">" + this._getField("W2", value) + "</tr>";
	if (value = contact.getAttr("workFax"))
		html[idx++] = "<tr" + style + ">" + this._getField("F", value) + "</tr>";
	if (value = contact.getAttr("mobilePhone"))
		html[idx++] = "<tr" + style + ">" + this._getField("M", value) + "</tr>";
	if (value = contact.getAttr("homePhone"))
		html[idx++] = "<tr" + style + ">" + this._getField("H", value) + "</tr>";
	
	html[idx++] = "</table>";
	html[idx++] = "</td></tr></table>";
	html[idx++] = "</td></tr></table>";
	
	div.innerHTML = html.join("");
	
	return div;
};

ZmContactCardsView.prototype._getField = 
function(fname, value) {
	return "<td valign=top class='ZmContactFieldValue'>" + fname + " </td><td valign=top class='ZmContactField'>" + value + "</td>";
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
		var html = new Array();
		var idx = 0;
		var size = Dwt.getSize(this._parentEl);
		var len = this._list.size();
		
		// dynamically add the table and its contents to improve rendering speed
		var table = this.getDocument().createElement("table");
		table.cellPadding = table.cellSpacing = "5";
		this.getHtmlElement().appendChild(table);
		var row = null;
		var div = null;
		var count = 0;
		
		for (var i = 0; i < len; i++) {
			if (count%2 == 0)
				row = table.insertRow(-1);
			if (div = this._createItemHtml(this._list.get(i))) {
				var cell = row.insertCell(-1);
				cell.valign = "top";
				cell.appendChild(div);
			} else {
				count--;
			}
			count++;
		}
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
	
	var table = this._parentEl.childNodes[0];
	for (var i = 0; i < table.rows.length; i++) {
		var cells = table.rows[i].cells;
		for (var j = 0; j < cells.length; j++)
			children.push(cells[j].firstChild);
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
