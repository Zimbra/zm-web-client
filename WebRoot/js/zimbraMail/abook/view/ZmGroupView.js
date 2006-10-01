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

function ZmGroupView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmGroupView", DwtControl.ABSOLUTE_STYLE);

	this._appCtxt = appCtxt;
	this._controller = controller;

	this._tagList = this._appCtxt.getTree(ZmOrganizer.TAG);
	this._tagList.addChangeListener(new AjxListener(this, this._tagChangeListener));

	this.getHtmlElement().style.overflow = "hidden";
	this._changeListener = new AjxListener(this, this._groupChangeListener);
};

ZmGroupView.prototype = new DwtComposite;
ZmGroupView.prototype.constructor = ZmGroupView;


// Public Methods

ZmGroupView.prototype.toString =
function() {
	return "ZmGroupView";
};

// need this since contact view now derives from list controller
ZmGroupView.prototype.getList = function() { return null; }

ZmGroupView.prototype.getContact =
function() {
	return this._contact;
};

ZmGroupView.prototype.getController =
function() {
	return this._controller;
};

ZmGroupView.prototype.set =
function(contact) {

	if (!this._htmlInitialized) {
		this._createHtml(contact);
		this._addWidgets(contact);
		this._installKeyHandlers();
	}

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	// TODO
};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	document.getElementById(this._groupNameId).disabled = !bEnable;
	document.getElementById(this._searchFieldId).disabled = !bEnable;
	this._picker.getTextField().setEnabled(bEnable);
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmGroupView.prototype.getSelection =
function() {
	return this._contact;
};

ZmGroupView.prototype.getSelectionCount =
function() {
	return 1;
};

ZmGroupView.prototype.isDirty =
function() {
	// TODO - check group name and group members for dirtyness
	return true;
};

ZmGroupView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.group].join(": ");
};

ZmGroupView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	this._picker.resize(width-10, height-160);
};

ZmGroupView.prototype.cleanup  =
function() {
	this._picker.reset();
	document.getElementById(this._searchFieldId).value = "";
};



// Private methods

// Consistent spot to locate various dialogs
ZmGroupView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + 50, loc.y + 100);
};

ZmGroupView.prototype._setFields =
function() {

	// TODO - set fields from this._contact

	this._setHeaderColor();
	this._setTitle();
	this._setTags();
	this._setFolder();
};

ZmGroupView.prototype._setHeaderColor =
function() {
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).getById(folderId) : null;
	var color = folder ? folder.color : ZmAddrBook.DEFAULT_COLOR;
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";
	var contactHdrRow = document.getElementById(this._contactHeaderRowId);
	contactHdrRow.className = "contactHeaderRow " + bkgdColor;
};

ZmGroupView.prototype._setTitle =
function(title) {
	var div = document.getElementById(this._titleId);
	var fileAs = title || this._contact.getFileAs();
	div.innerHTML = fileAs || (this._contact.id ? "&nbsp;" : ZmMsg.newGroup);
};

ZmGroupView.prototype._setTags =
function() {
	// get sorted list of tags for this msg
	var ta = new Array();
	for (var i = 0; i < this._contact.tags.length; i++)
		ta.push(this._tagList.getById(this._contact.tags[i]));
	ta.sort(ZmTag.sortCompare);

	var html = [];
	var i = 0;
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var icon = ZmTag.COLOR_MINI_ICON[tag.color];
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, tag.name);
		html[i++] = "&nbsp;";
	}

	var tagCell = document.getElementById(this._tagsId);
	tagCell.innerHTML = html.join("");
};

ZmGroupView.prototype._setFolder =
function() {
	var match;
	if (this._contact.id == null) {
		var clc = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getContactListController();
		match = clc._folderId;
	} else {
		match = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
	}

	var folders = this._appCtxt.getTree(ZmOrganizer.ADDRBOOK).asList();

	// for now, always re-populate folders DwtSelect
	this._folderSelect.clearOptions();

	for (var i = 0; i < folders.length; i++) {
		var folder = folders[i];
		if (folder.id == ZmFolder.ID_ROOT ||
			folder.isInTrash() ||
			folder.isReadOnly())
		{
			continue;
		}

		this._folderSelect.addOption(folder.name, folder.id == match, folder.id);
	}
};

ZmGroupView.prototype._createHtml =
function(contact) {
	this._contactHeaderId = Dwt.getNextId();
	this._contactHeaderRowId = Dwt.getNextId();
	this._titleId = Dwt.getNextId();
	this._tagsId = Dwt.getNextId();
	this._groupNameId = Dwt.getNextId();
	this._contactPickerId = Dwt.getNextId();
	this._folderCellId = Dwt.getNextId();
	this._searchFieldId = Dwt.getNextId();
	this._searchBtnTdId = Dwt.getNextId();
	this._listSelectId = Dwt.getNextId();

	var idx = 0;
	var html = [];

	// Title bar
	html[idx++] = "<table id='";
	html[idx++] = this._contactHeaderId;
	html[idx++] = "' cellspacing=0 cellpadding=0 width=100%><tr class='contactHeaderRow' id='";
	html[idx++] = this._contactHeaderRowId;
	html[idx++] = "'><td width=20><center>";
	html[idx++] = AjxImg.getImageHtml("Group");
	html[idx++] = "</center></td><td><div id='";
	html[idx++] = this._titleId;
	html[idx++] = "' class='contactHeader'></div></td><td align='right' id='";
	html[idx++] = this._tagsId;
	html[idx++] = "'></td></tr></table>";

	// content
	html[idx++] = "<table border=0 cellpadding=3 cellspacing=2 width=100%><tr>";
	html[idx++] = "<td width=50% valign=top>";
	html[idx++] = "<table border=0>";
	html[idx++] = "<tr><td class='editLabel'>";
	html[idx++] = ZmMsg.find;
	html[idx++] = ":</td><td><input type='text' autocomplete='off' size=30 nowrap id='";
	html[idx++] = this._searchFieldId;
	html[idx++] = "'></td><td id='";
	html[idx++] = this._searchBtnTdId;
	html[idx++] = "'></td><td width=100%></td></tr>";
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		html[idx++] = "<tr><td class='editLabel'>";
		html[idx++] = ZmMsg.searchIn;
		html[idx++] = ":</td><td colspan=2 id='";
		html[idx++] = this._listSelectId;
		html[idx++] = "'></td></tr>";
	}
	html[idx++] = "</table></td><td width=50% valign=top align=right>";
	html[idx++] = "<table border=0>";
	html[idx++] = "<tr><td class='editLabel' align=right>";
	html[idx++] = ZmMsg.groupName;
	html[idx++] = ":</td><td><input type='text' size=35 id='";
	html[idx++] = this._groupNameId;
	html[idx++] = "'></td></tr><tr><td class='editLabel' align=right>";
	html[idx++] = ZmMsg.addressBook;
	html[idx++] = ":</td><td id='";
	html[idx++] = this._folderCellId;
	html[idx++] = "'></td></tr></table>";
	html[idx++] = "</td></tr></table>";

	html[idx++] = "<div id='";
	html[idx++] = this._contactPickerId;
	html[idx++] = "'></div>";

	this.getHtmlElement().innerHTML = html.join("");

	this._htmlInitialized = true;
};

ZmGroupView.prototype._addWidgets =
function(contact) {
	// add select widget for user to choose folder
	this._folderSelect = new DwtSelect(this);
	this._folderSelect.reparentHtmlElement(this._folderCellId);

	// add search button
	this._searchButton = new DwtButton(this);
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
	this._searchButton.reparentHtmlElement(this._searchBtnTdId);

	// add select menu
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._selectDiv = new DwtSelect(this);
		this._selectDiv.addOption(ZmMsg.contacts, false, ZmContactPicker.SEARCHFOR_CONTACTS);
		if (this._appCtxt.get(ZmSetting.SHARING_ENABLED))
			this._selectDiv.addOption(ZmMsg.searchPersonalAndShared, false, ZmContactPicker.SEARCHFOR_PAS);
		this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactPicker.SEARCHFOR_GAL);
		this._selectDiv.reparentHtmlElement(this._listSelectId);
	}

	this._picker = new ZmContactChooser({parent:this, allButtons:true, hasTextField:true});
	this._picker.reparentHtmlElement(this._contactPickerId);
};

ZmGroupView.prototype._installKeyHandlers =
function() {
	var groupName = document.getElementById(this._groupNameId);
	Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(groupName, this);

	var searchField = document.getElementById(this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmGroupView._keyPressHdlr);
	Dwt.associateElementWithObject(searchField, this);
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];
	fields.push(document.getElementById(this._searchFieldId));
	fields.push(this._picker.getTextField().getInputElement());
	fields.push(document.getElementById(this._groupNameId));
	return fields;
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._searchFieldId);
};


// Listeners

ZmGroupView.prototype._contactChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_CONTACT)
		return;

	if (ev.event == ZmEvent.E_TAGS || ev.event == ZmEvent.E_REMOVE_ALL)
		this._setTags(this._contact);
};

ZmGroupView.prototype._tagChangeListener =
function(ev) {
	if (ev.type != ZmEvent.S_TAG)
		return;

	var fields = ev.getDetail("fields");
	var changed = fields && (fields[ZmOrganizer.F_COLOR] || fields[ZmOrganizer.F_NAME]);
	if ((ev.event == ZmEvent.E_MODIFY && changed) ||
		ev.event == ZmEvent.E_DELETE ||
		ev.event == ZmEvent.MODIFY)
	{
		this._setTags();
	}
};

ZmGroupView.prototype._searchButtonListener =
function(ev) {
	this._query = AjxStringUtil.trim(document.getElementById(this._searchFieldId).value);
	if (this._query.length) {
		if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
			var searchFor = this._selectDiv.getSelectedOption().getValue();
			this._contactSource = (searchFor == ZmContactPicker.SEARCHFOR_CONTACTS || searchFor == ZmContactPicker.SEARCHFOR_PAS)
				? ZmItem.CONTACT
				: ZmSearchToolBar.FOR_GAL_MI;
			// hack the query if searching for personal and shared contacts
			if (searchFor == ZmContactPicker.SEARCHFOR_PAS) {
				var addrbookList = this._appCtxt.getApp(ZmZimbraMail.CONTACTS_APP).getAddrbookList();
				this._query += " (" + addrbookList.join(" or ") + ")";
			}
		} else {
			this._contactSource = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		}
		this.search(ZmItem.F_PARTICIPANT, true);
	}
};

/**
* Performs a contact search (in either personal contacts or in the GAL) and populates
* the source list view with the results.
*
* @param columnItem		[constant]		ID of column to sort by
* @param ascending		[boolean]		if true, sort in ascending order
*/
ZmGroupView.prototype.search =
function(columnItem, ascending) {
	this._searchButton.setEnabled(false);

	var sortBy = ascending ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var params = {query: this._query, types: types, sortBy: sortBy, offset: 0, limit: ZmContactPicker.SEARCHFOR_MAX, contactSource: this._contactSource};
	var search = new ZmSearch(this._appCtxt, params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearch),
					errorCallback: new AjxCallback(this, this._handleErrorSearch)});
};

ZmGroupView.prototype._handleResponseSearch =
function(result) {
	var resp = result.getResponse();
	var vec = resp.getResults(ZmItem.CONTACT);

	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = [];
	var a = vec.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		var emails = contact.getEmails();
		for (var j = 0; j < emails.length; j++) {
			var email = new ZmEmailAddress(emails[j], null, contact.getFileAs());
			email.id = Dwt.getNextId();
			email.icon = contact.isGal ? "GAL" : contact.addrbook.getIcon();
			list.push(email);
		}
	}
	this._picker.setItems(AjxVector.fromArray(list));
	this._searchButton.setEnabled(true);
};

ZmGroupView.prototype._handleErrorSearch =
function() {
	this._searchButton.setEnabled(true);
	return false;
};


// Static methods

ZmGroupView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey)
		return;

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._setTitle(e.value);
	}

	return true;
};

ZmGroupView._keyPressHdlr =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey)
		return;

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		var charCode = DwtKeyEvent.getCharCode(ev);
		if (charCode == 13 || charCode == 3) {
			view._searchButtonListener(ev);
			return false;
		}
	}
	return true;
};

ZmGroupView.getPrintHtml =
function(contact, abridged, appCtxt) {
	DBG.println("TODO");
};
