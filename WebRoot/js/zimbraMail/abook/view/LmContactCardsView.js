function LmContactCardsView(parent, dropTgt, posStyle) {

	posStyle = posStyle || Dwt.ABSOLUTE_STYLE;
	LmContactsBaseView.call(this, parent, "LmContactCardsView", LmController.CONTACT_CARDS_VIEW, null, dropTgt, posStyle);
};

LmContactCardsView.prototype = new LmContactsBaseView;
LmContactCardsView.prototype.constructor = LmContactCardsView;

LmContactCardsView.prototype.toString = 
function() {
	return "LmContactCardsView";
};

LmContactCardsView.prototype.paginate = 
function(contacts, bPageForward) {
	LmContactsBaseView.prototype.paginate.call(this, contacts, bPageForward);
	this._layout();
};

LmContactCardsView.prototype.replenish = 
function(list) {
	LmContactsBaseView.prototype.replenish.call(this, list);
	this._layout();
};

// lets just try to optimally layout all the cards by not letting base class do its thing
LmContactCardsView.prototype.setUI =
function(defaultColumnSort) {
	// do nothing
};

LmContactCardsView.prototype.set = 
function(contacts) {
	// XXX: optimize later - switch view always forces layout unnecessarily
	LmContactsBaseView.prototype.set.call(this, contacts);
	this._layout();
};

LmContactCardsView.prototype._createItemHtml =
function(contact, now, isDndIcon) {

	// in canonical view, don't show contacts in the Trash
	if (contact.list.isCanonical && (contact.folderId == LmFolder.ID_TRASH))
		return null;
	
	// create div to add
	var div = this.getDocument().createElement("div");
	if (!isDndIcon) {
		div._styleClass = "LmContactCard";
		div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	} else {
		div._styleClass = "LmContactCard-dnd";
		div.style.position = "absolute";
	}
	div.className = div._styleClass;
	
	this.associateItemWithElement(contact, div, DwtListView.TYPE_LIST_ITEM);

	var style = LsEnv.isLinux ? " style='line-height:13px'" : "";
	var html = new Array();
	var idx = 0;

	html[idx++] = "<table border=0 width=100% cellpadding=0 cellspacing=0>";
	html[idx++] = "<tr style='padding:0' class='contactHeader'><td valign=top class='contactHeader' style='font-size:16px'>" + contact.getFileAs() + "</td>";
	// Tag
	if (this._appCtxt.get(LmSetting.TAGGING_ENABLED)) {
		var cellId = this._getFieldId(contact, LmItem.F_TAG_CELL);
		html[idx++] = "<td id='" + cellId + "'>";
		var fieldId = this._getFieldId(contact, LmItem.F_TAG);
		html[idx++] = LsImg.getImageHtml(contact.getTagImageInfo(), null, ["id='", fieldId, "'"].join(""));
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

LmContactCardsView.prototype._getField = 
function(fname, value) {
	return "<td valign=top class='LmContactFieldValue'>" + fname + " </td><td valign=top class='LmContactField'>" + value + "</td>";
};

// override so that we don't get back LmListView._fillerString
LmContactCardsView.prototype._getTagImgHtml =
function(item, id) {
	var idStr = id ? ["id='", id, "'"].join("") : null;
	return LsImg.getImageHtml(item.getTagImageInfo(), null, idStr);
};

LmContactCardsView.prototype._layout =
function() {
	this.removeAll();
	if (this._list instanceof LsVector && this._list.size()) {
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

LmContactCardsView.prototype._modifyContact =
function(ev) {
	// always call base class first to resort list if necessary
	LmContactsBaseView.prototype._modifyContact.call(this, ev);
	// XXX: opitimize later - always re-layout no matter which field changed
	this._parentEl.innerHTML = "";
	this._layout();
};

LmContactCardsView.prototype._changeListener =
function(ev) {
	// need custom handling for delete (can't just remove row)
	if (ev.event == LmEvent.E_DELETE || ev.event == LmEvent.E_MOVE) {
		var items = ev.getDetail("items");
		for (var i = 0; i < items.length; i++)
			this._list.remove(items[i]);
		this._layout();
		// XXX: need to iterate for the non-trash contact in list!
		this.setSelection(this.getList().get(0));
	} else {
		LmContactsBaseView.prototype._changeListener.call(this, ev);
		// XXX: need to iterate for the non-trash contact in list!
		this.setSelection(this.getList().get(0));
	}
};

// we have to overload _tagChangeListener here since DOM hierarchy is 
// unconventional compared w/ other list views
LmContactCardsView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != LmEvent.S_TAG) return;

	var fields = ev.getDetail("fields");
	if (ev.event == LmEvent.E_MODIFY && (fields && fields[LmOrganizer.F_COLOR])) {
		var tag = ev.source;
		var children = this._getChildren();
		for (var i = 0; i < children.length; i++) {
			var item = this.getItemFromElement(children[i]);
			if (item && item.tags && (item.tags.length == 1) && (item.tags[0] == tag.id))
				this._setTagImg(item);
		}
	} else if (ev.event == LmEvent.E_DELETE) {
		var tag = ev.source;
		var children = this._getChildren();
		for (var i = 0; i < children.length; i++) {
			var item = this.getItemFromElement(children[i]);
			if (item && item.hasTag(tag.id)) {
				item.tagLocal(tag.id, false);
				this._setTagImg(item);
			}
		}
	} else {
		LmContactsBaseView.prototype._tagChangeListener.call(this, ev);
	}
};

// returns all child divs w/in each table's rows/cells
LmContactCardsView.prototype._getChildren = 
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

LmContactCardsView.prototype._setDnDIconState =
function(dropAllowed) {
	if (this._dndImg || !LsEnv.isLinux) {
		LmContactsBaseView.prototype._setDnDIconState.call(this, dropAllowed)
	} else {
		// bug fix #3235 - no opacity for linux
		this._dndIcon._origClassName = dropAllowed
			? this._dndIcon._origClassName + " DropAllowed-linux" 
			: this._dndIcon._origClassName + " DropNotAllowed-linux";
	}
};

LmContactCardsView.getPrintHtml = 
function(list) {

	var html = new Array();
	var idx = 0;
	var list = list.getArray();
	
	html[idx++] = "<table border=0 style='width: 6.5in'>";
	
	for (var i = 0; i < list.length; i++) {
		var contact = list[i];
		
		// dont include contacts in trash folder
		if (contact.folderId == LmFolder.ID_TRASH)
			continue;
		
		// add a new row every 3 columns
		if ((i % 3) == 0)
			html[idx++] = "<tr>";
		html[idx++] = "<td valign=top height=100%>";
		
		html[idx++] = "<div style='height: 100%; width: 2.2in; border: 1px solid #CCCCCC;'>";
		html[idx++] = LmContactView.getPrintHtml(contact, true);
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
