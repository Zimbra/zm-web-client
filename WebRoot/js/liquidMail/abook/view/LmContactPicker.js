/**
* Creates a dialog that lets the user select addresses from a contact list.
* @constructor
* @class
* This class creates and manages a dialog that lets the user select addresses 
* from a contact list. Two lists are maintained, one with contacts to select 
* from, and one that contains the selected addresses. Between them are buttons 
* to shuffle addresses back and forth between the two lists.
*
* @author Conrad Damon
* @param shell	the enclosing shell (which we are displayed on)
*/
function LmContactPicker(controller, shell, appCtxt) {

	DwtDialog.call(this, shell, null, LmMsg.selectAddresses);
	
	this._controller = controller;
	this._appCtxt = appCtxt;
	this._initialize();
}

LmContactPicker.prototype = new DwtDialog;
LmContactPicker.prototype.constructor = LmContactPicker;

// Consts

LmContactPicker.SEARCHFOR_CONTACTS 	= 1;
LmContactPicker.SEARCHFOR_GAL 		= 2;
LmContactPicker.SEARCHFOR_MAX 		= 50;
LmContactPicker.ADDRS = [LmEmailAddress.TO, LmEmailAddress.CC, LmEmailAddress.BCC];

LmContactPicker.ID_ICON 		= "i--";
LmContactPicker.ID_PARTICIPANT 	= "p--";
LmContactPicker.ID_EMAIL 		= "e--";

// Public methods

LmContactPicker.prototype.toString = 
function() {
	return "LmContactPicker";
}

/**
* Displays the contact picker dialog. The source list is populated with 
* contacts, and the target list is populated with any addresses that are 
* passed in. The address button that was used to popup the dialog is set 
* as the active button.
*
* @param loc		a DwtPoint for setting the location
* @param addrs		array of 3 vectors (one for each type of address)
* @param addrType	the address type of the button that called us
*/
LmContactPicker.prototype.popup =
function(addrType) {
	// create source list view if necessary
	if (!this._sourceListView) {
		this._sourceListView = this._createListView(this._sourceListId, LmController.CONTACT_SRC_VIEW);
		this._sourceListView.addSelectionListener(new LsListener(this, this._sourceListener));
	}
	
	// create target list view if necessary
	if (!this._targetListView) {
		this._targetListView = this._createListView(this._targetListId, LmController.CONTACT_TGT_VIEW, true);
		this._targetListView.addSelectionListener(new LsListener(this, this._targetListener));
	}
	
	// reset column sorting preference
	this._sourceListView.setSortByAsc(LmItem.F_PARTICIPANT, true);

	// reset button states
	this._setActiveButton(this._addrButtonId[addrType], addrType);
	this._enableButtons(true, false);
	
	// reset search field
	var searchField = Dwt.getDomObj(this.getDocument(), this._searchFieldId);
	searchField.disabled = false;
	searchField.focus();
	searchField.value = "";
	
	DwtDialog.prototype.popup.call(this);
}

/**
* Closes the dialog
*/
LmContactPicker.prototype.popdown =
function() {
	// cleanup
	this._targetListView._resetList();
	this._sourceListView._resetList();
	for (var i in this._vecs)
		this._vecs[i].removeAll();

	if (this._list && this._list.size())
		this._list.clear();

	// disabled search field (hack to fix bleeding cursor)
	var searchField = Dwt.getDomObj(this.getDocument(), this._searchFieldId);
	searchField.disabled = true;
	this._query = null;
	this._contactSource = null;

	DwtDialog.prototype.popdown.call(this);
}

// Private methods

// called only when LmContactPicker is first created. Sets up initial layout.
LmContactPicker.prototype._initialize = 
function() {

	var doc = this.getDocument();

	// init To/CC/BCC buttons
	this._addrButtonId = new Array();
	this._addrDivId = new Array();
	for (var i = 0; i < LmContactPicker.ADDRS.length; i++) {
		var type = LmContactPicker.ADDRS[i];
		this._addrDivId[type] = Dwt.getNextId();
		this._addrButtonId[type] = Dwt.getNextId();
	}
	
	// create static content and append to dialog parent	
	this.setContent(this._contentHtml());
	
	// add search button
	var searchSpan = Dwt.getDomObj(doc, this._listSearchId);
	var searchButton = new DwtButton(this);
	searchButton.setText(LmMsg.search);
	searchButton.addSelectionListener(new LsListener(this, this._searchButtonListener));
	searchSpan.appendChild(searchButton.getHtmlElement());

	// add transfer buttons
	this._addrButton = new Array();
	this._vecs = new Array();
	for (var i = 0; i < LmContactPicker.ADDRS.length; i++) {
		var type = LmContactPicker.ADDRS[i];
		var typeStr = LmEmailAddress.TYPE_STRING[type];
		this._addrButton[type] = this._setupButton(this._addrButtonId[type], typeStr, type);
		this._addrButton[type].addSelectionListener(new LsListener(this, this._addressButtonListener));
		var addrDiv = Dwt.getDomObj(doc, this._addrDivId[type]);
		addrDiv.appendChild(this._addrButton[type].getHtmlElement());
		this._vecs[type] = new LsVector();
	}

	// add remove button
	this._removeButtonId = Dwt.getNextId();
	this._removeButton = this._setupButton(this._removeButtonId, "remove");
	this._removeButton.addSelectionListener(new LsListener(this, this._removeButtonListener));
	var removeDiv = Dwt.getDomObj(doc, this._removeDivId);
	removeDiv.appendChild(this._removeButton.getHtmlElement());

	// add select menu
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED) && this._appCtxt.get(LmSetting.GAL_ENABLED)) {
		var listSelect = document.getElementById(this._listSelectId);
		this._selectDiv = new DwtSelect(this);
		this._selectDiv.addOption(LmMsg.contacts, true, LmContactPicker.SEARCHFOR_CONTACTS);
		this._selectDiv.addOption(LmMsg.GAL, false, LmContactPicker.SEARCHFOR_GAL);
		listSelect.appendChild(this._selectDiv.getHtmlElement());
	}
   
    // init listeners
	this.setButtonListener(DwtDialog.OK_BUTTON, new LsListener(this, this._okButtonListener));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new LsListener(this, this._cancelButtonListener));
	
	var searchField = Dwt.getDomObj(doc, this._searchFieldId);
	searchField.onkeypress = LmContactPicker._keyPressHdlr;
	this._keyPressCallback = new LsCallback(this, this._searchButtonListener);
}

LmContactPicker.prototype._contentHtml = 
function() {
	this._listSelectId = Dwt.getNextId();
	this._listSearchId = Dwt.getNextId();
	this._sourceListId = Dwt.getNextId();
	this._targetListId = Dwt.getNextId();
	this._removeDivId  = Dwt.getNextId();
	this._searchFieldId = Dwt.getNextId();

	var html = new Array();
	var idx = 0;
	
	html[idx++] = "<div class='LmContactPicker'>";
	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1 width=100%>";
	html[idx++] = "<tr><td>";
	// add search input field and search button
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
	html[idx++] = "<td valign=middle>";
	html[idx++] = LsImg.getImageHtml(LmImg.I_SEARCH);
	html[idx++] = "</td>";
	html[idx++] = "<td><input type='text' size=30 nowrap id='" + this._searchFieldId + "'>&nbsp;</td>";
	html[idx++] = "<td id='" + this._listSearchId + "'></td>";
	html[idx++] = "</tr></table>";
	html[idx++] = "</td><td align=right>";
	// add placeholder for drop down select widget
	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED) && this._appCtxt.get(LmSetting.GAL_ENABLED)) {
		html[idx++] = "<table border=0 cellpadding=0 cellspacing=0><tr>";
		html[idx++] = "<td class='Label nobreak'>" + LmMsg.showNames + ":&nbsp;</td>";
		html[idx++] = "<td id='" + this._listSelectId + "'></td>";
		html[idx++] = "</tr></table>";
	}
	html[idx++] = "</td>";
	html[idx++] = "</tr></table>";
	// start new table for list views
	html[idx++] = "<table cellspacing=0 cellpadding=0 border=0><tr>";
	// source list
	html[idx++] = "<td><div id='" + this._sourceListId + "' class='abPickList'></div></td>";
	// address buttons
	html[idx++] = "<td valign='middle'>";
	for (var i = 0; i < LmContactPicker.ADDRS.length; i++) {
		var type = LmContactPicker.ADDRS[i];
		html[idx++] = "<div id='" + this._addrDivId[type] + "'></div><br>";
	}
	// remove button
	html[idx++] = "<br><div id='" + this._removeDivId + "'></div></td>";
	// target list
	html[idx++] = "<td><div id='" + this._targetListId + "' class='abPickList'></div></td>";	
	html[idx++] = "</tr></table></div>";

	return html.join("");
}

LmContactPicker.prototype._createListView = 
function(listViewId, view, bExtendedHeader) {
	var listView = new LmContactPickerListView(this, view, bExtendedHeader);
	var listDiv = document.getElementById(listViewId);
 	listDiv.appendChild(listView.getHtmlElement());
	var size = Dwt.getSize(listDiv);
	listView.setSize(size.x, size.y);
	var defaultSortCol = bExtendedHeader ? null : LmItem.F_PARTICIPANT;
	listView.setUI(defaultSortCol);
	listView._initialized = true;
	
	return listView;
}

// Creates a DwtButton and adds a few props to it
LmContactPicker.prototype._setupButton =
function(id, name, addrType) {
	var button = new DwtButton(this);
	button.setText(LmMsg[name]);
	button.id = id;
	button.setHtmlElementId(id);
	button._activeClassName = button._origClassName + " LmContactPicker-Active";
	button._nonActiveClassName = button._origClassName;
	button._addrType = addrType;

	return button;
}

// Listeners

// Handle click and double-click in source list (for adding addresses)
LmContactPicker.prototype._sourceListener =
function(ev) {
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._addEmails(this._activeAddrType, this._sourceListView.getSelection());
		this._sourceListView.deselectAll();
		this._enableButtons(true, false);
	} else {
		this._enableButtons(true, false);
		if (this._activeButtonId != this._addrButtonId[this._activeAddrType])
			this._setActiveButton(null, this._activeAddrType);
	}
	this._targetListView.deselectAll();
}

// Handle click and double-click in target list (for removing addresses)
LmContactPicker.prototype._targetListener =
function(ev) {
	this._enableButtons(false, true);
	this._setActiveButton(this._removeButtonId);
	this._sourceListView.deselectAll();
}

// Clicking an address button adds the selected address
LmContactPicker.prototype._addressButtonListener =
function(ev) {
	var element = DwtUiEvent.getDwtObjFromEvent(ev);
	if (this._sourceListView.getSelectionCount() > 0) {
		this._addEmails(element._addrType, this._sourceListView.getSelection());
	} else {
		this._setActiveButton(null, element._addrType);
	}
}

LmContactPicker.prototype._searchButtonListener = 
function(ev) {
	this._query = LsStringUtil.trim(Dwt.getDomObj(this.getDocument(), this._searchFieldId).value);
	if (this._query.length) {
		if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED) && this._appCtxt.get(LmSetting.GAL_ENABLED)) {
			var searchFor = this._selectDiv.getSelectedOption().getValue();
			this._contactSource = (searchFor == LmContactPicker.SEARCHFOR_CONTACTS) ? LmItem.CONTACT : LmSearchToolBar.FOR_GAL_MI;
		} else {
			this._contactSource = this._appCtxt.get(LmSetting.CONTACTS_ENABLED) ? LmItem.CONTACT : LmSearchToolBar.FOR_GAL_MI;
		}
		this.search(LmSearch.NAME_ASC);
	}
}

// The controller used here is a LmComposeController, so we pass a handle to this object
LmContactPicker.prototype.search = 
function(sortBy) {
	this._controller._schedule(this._doSearch, {contactPicker: this, sortBy: sortBy})
}

LmContactPicker.prototype._doSearch = 
function(params) {
	var cp = params.contactPicker;
	var types = LsVector.fromArray([LmItem.CONTACT]);
	var search = new LmSearch(this._appCtxt, cp._query, types, params.sortBy, 0, LmContactPicker.SEARCHFOR_MAX, cp._contactSource);
	try {
		var searchResult = search.execute();
	} catch (ex) {
		if (ex.code == LsCsfeException.SVC_AUTH_EXPIRED || ex.code == LsCsfeException.SVC_AUTH_REQUIRED || 
			 ex.code == LsCsfeException.NO_AUTH_TOKEN) {
			cp.popdown();
		}
		this._handleException(ex, LmContactPicker.prototype._doSearch, params, false);
	}
	if (!searchResult) return;
	
	if (cp._list && cp._list.size())
		cp._list.clear();
	
	cp._list = searchResult.getResults(LmItem.CONTACT);
	
	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = new Array();
	var a = cp._list.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		var emails = contact.getEmails();
		for (var j = 0; j < emails.length; j++) {
			var email = new LmEmailAddress(emails[j], null, contact.getFullName());
			email.id = Dwt.getNextId();
			list.push(email);
		}
	}
	cp._sourceListView.set(LsVector.fromArray(list));
	// if there's only one, select it
	if (list.length == 1)
		cp._sourceListView.setSelection(list[0]);
}

// Removes the selected address
LmContactPicker.prototype._removeButtonListener =
function(ev) {
	this._handleRemove(this._targetListView.getSelection());
}

// Done choosing addresses, add them to the compose form
LmContactPicker.prototype._okButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev, [this._vecs]);
}

// Call custom popdown method
LmContactPicker.prototype._cancelButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev, [this._vecs]);
	this.popdown();
}

// Miscellaneous methods

// Enable/disable the address/remove buttons
LmContactPicker.prototype._enableButtons =
function(enableAddrs, enableRemove) {
	for (var i = 0; i < LmContactPicker.ADDRS.length; i++) {
		var type = LmContactPicker.ADDRS[i];
		this._addrButton[type].setEnabled(enableAddrs);
	}
	this._removeButton.setEnabled(enableRemove);
}

// Remove any selected addresses from target list. Also handles button state.
LmContactPicker.prototype._handleRemove =
function(items) {
	for (var i = 0; i < items.length; i++) {
		var addr = items[i];
		this._targetListView.removeItem(addr);
		this._vecs[addr.getType()].remove(addr);
	}

	// if the view is empty, disable the Remove button
	if (!this._targetListView.size()) {
		this._enableButtons(true, false);
		this._setActiveButton(null, this._activeAddrType);
	}
}

// Make a button "active" (the default for double-clicks). Done by 
// manipulating the style class. The active/non-active class is set as the 
// "_origClassName" so that activation/triggering still work.
LmContactPicker.prototype._setActiveButton =
function(id, addrType) {
	var doc = this.getDocument();
	id = id || this._addrButtonId[addrType];
	if (id != this._activeButtonId) {
		if (this._activeButtonId) {
			var oldButton = Dwt.getObjectFromElement(Dwt.getDomObj(doc, this._activeButtonId));
			oldButton._origClassName = oldButton._nonActiveClassName;
			oldButton.setClassName(oldButton._origClassName);
		}
		var button = Dwt.getObjectFromElement(Dwt.getDomObj(doc, id));
		button._origClassName = button._activeClassName;
		button.setClassName(button._origClassName);
		this._activeButtonId = id;
		if (addrType)
			this._activeAddrType = addrType;
	}
}

// Add selected addresses to the target list.
LmContactPicker.prototype._addEmails =
function(addrType, items) {
	this._setActiveButton(this._addrButtonId[addrType], addrType);
	for (var i = 0; i < items.length; i++) {
		var selItem = items[i];
		if (!this._vecs[addrType] || !this._vecs[addrType].containsLike(selItem, selItem.getAddress)) {
			var addr = new LmEmailAddress(selItem.getAddress(), addrType, selItem.getName(), selItem.getDispName());
			addr.id = selItem.id;
			this._addToTarget(addr);
			this._vecs[addrType].add(addr);
		}
	}
	this._sourceListView.deselectAll();
}

// Adds an email to the target list, prefixed by its type
LmContactPicker.prototype._addToTarget =
function(email) {
	var emailType = email.getType();
	
	// walk target list looking for valid place to insert new address based on its type
	var children = this._targetListView._parentEl.childNodes;
	var len = children.length;
	var count = 0;
	var addr = len > 0 ? this._targetListView.getItemFromElement(children[count++]) : null;
	
	while (addr && addr.getType() == LmEmailAddress.TO)
		addr = len > count ? this._targetListView.getItemFromElement(children[count++]) : null;

	if (emailType != LmEmailAddress.TO) {
		while (addr && addr.getType() == LmEmailAddress.CC)
			addr = len > count ? this._targetListView.getItemFromElement(children[count++]) : null;
		
		if (emailType == LmEmailAddress.BCC) {
			while (addr && addr.getType() == LmEmailAddress.BCC)
				addr = len > count ? this._targetListView.getItemFromElement(children[count++]) : null;
		}
	}
	
	if (addr && count <= len)
		this._targetListView.addItem(email, count - 1);
	else
		this._targetListView.addItem(email);
}

LmContactPicker._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
	    return false;
	}
	return true;
}


/**
* Creates a list view used by the contact picker to allow a user to select
* contacts populated by a user-initiated search.
* @constructor
* @class
* This class creates and manages a list view that lets the user select 
* addresses to email. 
*
* @author Parag Shah
* @param parent		
* @param className	
* @param posStyle 	
* @param controller 
* @param dropTgt 	
*/
function LmContactPickerListView(parent, view, bExtHeader) {
	
	var headerList = this._getHeaderList(parent, bExtHeader);
	LmListView.call(this, parent, null, null, view, LmItem.CONTACT, headerList);
	
	this._extHeader = bExtHeader || false;
}

LmContactPickerListView.prototype = new LmListView;
LmContactPickerListView.prototype.constructor = LmContactPickerListView;

LmContactPickerListView.prototype.toString = 
function() {
	return "LmContactPickerListView";
}

LmContactPickerListView.prototype.setSize =
function(width, height) {
	LmListView.prototype.setSize.call(this, width, height);
	this._sizeChildren(width, height);
}

LmContactPickerListView.prototype.setBounds =
function(x, y, width, height) {
	LmListView.prototype.setBounds.call(this, x, y, width, height);
	this._sizeChildren(width, height);
}

LmContactPickerListView.prototype._sizeChildren =
function(width, height) {
	Dwt.setSize(this._listDiv, Dwt.DEFAULT, this.getHtmlElement().clientHeight - DwtListView.HEADERITEM_HEIGHT);
	this._listDiv.style.overflow = 'auto';
}

LmContactPickerListView.prototype._setNoResultsHtml = 
function() {
	// ignore if target list view
	if (this._initialized && !this._extHeader)
		LmListView.prototype._setNoResultsHtml.call(this);
}

// The items are LmEmailAddress objects
LmContactPickerListView.prototype._createItemHtml =
function(item) {

	var doc = this.getDocument();
	var div = doc.createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
			
	var html = new Array();
	var idx = 0;

	if (this.view == LmController.CONTACT_SRC_VIEW) {
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>";
		for (var i = 0; i < this._headerList.length; i++) {
			var id = this._headerList[i]._id;
			if (id.indexOf(LmContactPicker.ID_PARTICIPANT) == 0) {
				html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + item.name + "</td>";
			} else if (id.indexOf(LmContactPicker.ID_EMAIL) == 0) {
				html[idx++] = "<td>&nbsp;" + item.address + "</td>";
			}
		}
		html[idx++] = "</tr></table>";
	} else if (this.view == LmController.CONTACT_TGT_VIEW) {
		html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>";
		for (var i = 0; i < this._headerList.length; i++) {
			var id = this._headerList[i]._id;
			if (id.indexOf(LmContactPicker.ID_ICON) == 0) {
				html[idx++] = "<td width=" + this._headerList[i]._width + ">" + LmMsg[item.getTypeAsString()] + ":</td>";
			} else if (id.indexOf(LmContactPicker.ID_PARTICIPANT) == 0) {
				html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + item.name + "</td>";
			} else if (id.indexOf(LmContactPicker.ID_EMAIL) == 0) {
				html[idx++] = "<td>&nbsp;" + item.address + "</td>";
			}
		}
		html[idx++] = "</tr></table>";
	}
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
		
	return div;
}

LmContactPickerListView.prototype._getHeaderList = 
function(parent, bExtHeader) {

	var headerList = new Array();

	if (bExtHeader)
		headerList.push(new DwtListHeaderItem(LmContactPicker.ID_ICON, null, LmImg.I_CONTACT_PICKER, 20));
	
	var sortBy = bExtHeader ? null : LmItem.F_PARTICIPANT;
	headerList.push(new DwtListHeaderItem(LmContactPicker.ID_PARTICIPANT, LmMsg._name, null, 100, sortBy));
	headerList.push(new DwtListHeaderItem(LmContactPicker.ID_EMAIL, LmMsg.email));
	
	return headerList;
}

LmContactPickerListView.prototype._itemClicked = 
function(clickedEl, ev) {

	// dont allow right clicks since it doesnt make sense here...
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) {
		return;
	} else {
		LmListView.prototype._itemClicked.call(this, clickedEl, ev);
	}
}

LmContactPickerListView.prototype._sortColumn = 
function(columnItem, bSortAsc) {
	var sortBy = bSortAsc ? LmSearch.NAME_ASC : LmSearch.NAME_DESC;
	this.parent.search(sortBy);
}
