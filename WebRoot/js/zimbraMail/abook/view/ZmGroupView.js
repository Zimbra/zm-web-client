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
 * Portions created by Zimbra are Copyright (C) 2006 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

ZmGroupView = function(parent, appCtxt, controller) {
	ZmContactView.call(this, parent, appCtxt, controller);

	this._searchRespCallback = new AjxCallback(this, this._handleResponseSearch);
	this._searchErrorCallback = new AjxCallback(this, this._handleErrorSearch);
};

ZmGroupView.prototype = new ZmContactView;
ZmGroupView.prototype.constructor = ZmGroupView;

// Public Methods

ZmGroupView.prototype.toString =
function() {
	return "ZmGroupView";
};

ZmGroupView.prototype.set =
function(contact, isDirty) {

	if (!this._htmlInitialized) {
		this._createHtml();
		this._addWidgets();
		this._installKeyHandlers();
	}

	if (this._contact) {
		this._contact.removeChangeListener(this._changeListener);
	}
	contact.addChangeListener(this._changeListener);
	this._contact = contact;

	this._setFields();

	this._isDirty = isDirty;
};

ZmGroupView.prototype.getModifiedAttrs =
function() {
	if (!this.isDirty()) return null;

	var mods = this._attr = {};
	var foundOne = false;

	// get field values
	var groupName = AjxStringUtil.trim(document.getElementById(this._groupNameId).value);
	var groupMembers = this._getGroupMembers();
	var folderId = this._getFolderId();

	// creating new contact (possibly some fields - but not ID - prepopulated)
	if (this._contact.id == null || this._contact.isGal) {
		mods[ZmContact.F_folderId] = folderId
		mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
		mods[ZmContact.F_nickname] = groupName;
		mods[ZmContact.F_dlist] = groupMembers;
		mods[ZmContact.F_type] = "group";
		foundOne = true;
	} else {
		// modifying existing contact
		if (this._contact.getFileAs() != groupName) {
			mods[ZmContact.F_fileAs] = ZmContact.computeCustomFileAs(groupName);
			mods[ZmContact.F_nickname] = groupName;
			foundOne = true;
		}

		if (this._contact.getAttr(ZmContact.F_dlist) != groupMembers) {
			mods[ZmContact.F_dlist] = groupMembers;
			foundOne = true;
		}

		if (folderId != this._contact.getFolderId()) {
			mods[ZmContact.F_folderId] = folderId;
			foundOne = true;
		}
	}

	return foundOne ? mods : null;
};

ZmGroupView.prototype.isEmpty =
function(checkEither) {
	var groupName = AjxStringUtil.trim(document.getElementById(this._groupNameId).value);
	var members = AjxStringUtil.trim(this._groupMembers.value);

	return checkEither
		? (groupName == "" || members == "")
		: (groupName == "" && members == "");
};

ZmGroupView.prototype.isValid =
function() {
	// check for required group name
	if (this.isDirty() && this.isEmpty(true)) {
		throw ZmMsg.errorMissingGroup;
	}

	// validate email addresses
	var addrs = this._getGroupMembers(true);
	if (addrs) {
		var invalidAddrs = [];
		for (var i = 0; i < addrs.length; i++) {
			var addr = addrs[i];
			if (!AjxEmailAddress.isValid(addr))
				invalidAddrs.push(addr);
		}
		if (invalidAddrs.length) {
			var bad = invalidAddrs.join("<br>");
			throw AjxMessageFormat.format(ZmMsg.groupBadAddresses, bad);
		}
	}

	return true;
};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	document.getElementById(this._groupNameId).disabled = !bEnable;
	this._groupMembers.disabled = !bEnable;
	document.getElementById(this._searchFieldId).disabled = !bEnable;
};

ZmGroupView.prototype.isDirty =
function() {
	return this._isDirty;
};

ZmGroupView.prototype.getTitle =
function() {
	return [ZmMsg.zimbraTitle, ZmMsg.group].join(": ");
};

ZmGroupView.prototype.setSize =
function(width, height) {
	// overloaded since base class calls sizeChildren which we dont care about
	DwtComposite.prototype.setSize.call(this, width, height);
};

ZmGroupView.prototype.setBounds =
function(x, y, width, height) {
	DwtComposite.prototype.setBounds.call(this, x, y, width, height);
	Dwt.setSize(this._groupMembers, Dwt.DEFAULT, height-100);
	var fudge = (this._appCtxt.get(ZmSetting.GAL_ENABLED) || this._appCtxt.get(ZmSetting.SHARING_ENABLED))
		? 185 : 160;
	this._listview.setSize(Dwt.DEFAULT, height-fudge);
};

ZmGroupView.prototype.cleanup  =
function() {
	document.getElementById(this._searchFieldId).value = "";
	this._listview.removeAll(true);
	this._addButton.setEnabled(false);
	this._addAllButton.setEnabled(false);
};


// Private methods

ZmGroupView.prototype._setFields =
function() {
	this._setGroupName();
	this._setGroupMembers();
	this._setHeaderColor();
	this._setTitle();
	this._setTags();
};

ZmGroupView.prototype._setTitle =
function(title) {
	var div = document.getElementById(this._titleId);
	var fileAs = title || this._contact.getFileAs();
	div.innerHTML = fileAs || (this._contact.id ? "&nbsp;" : ZmMsg.newGroup);
};

ZmGroupView.prototype._getTagCell =
function() {
	return document.getElementById(this._tagsId);
};

ZmGroupView.prototype._createHtml =
function() {
	this._contactHeaderId = 	this._htmlElId + "_header";
	this._contactHeaderRowId = 	this._htmlElId + "_headerRow";
	this._titleId = 			this._htmlElId + "_title";
	this._tagsId = 				this._htmlElId + "_tags";
	this._groupNameId = 		this._htmlElId + "_groupName";
	this._groupMembersId = 		this._htmlElId + "_groupMembers";
	this._searchFieldId = 		this._htmlElId + "_searchField";
	this._listSelectId = 		this._htmlElId + "_listSelect";
	this._searchButtonId = 		this._htmlElId + "_searchButton";
	this._listViewId = 			this._htmlElId + "_listView";
	this._addButtonId = 		this._htmlElId + "_addButton";
	this._addAllButtonId = 		this._htmlElId + "_addAllButton";

	var showSearchIn = this._appCtxt.get(ZmSetting.SHARING_ENABLED) || this._appCtxt.get(ZmSetting.GAL_ENABLED);
	var params = {id:this._htmlElId, showSearchIn:showSearchIn};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.abook.templates.Contacts#GroupView", params);
	this._htmlInitialized = true;
};

ZmGroupView.prototype._addWidgets =
function() {
	this._groupMembers = document.getElementById(this._groupMembersId);

	// add select menu
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED) ||
		this._appCtxt.get(ZmSetting.GAL_ENABLED))
	{
		this._searchInSelect = new DwtSelect(this);
		this._searchInSelect.addOption(ZmMsg.contacts, true, ZmContactsApp.SEARCHFOR_CONTACTS);
		if (this._appCtxt.get(ZmSetting.SHARING_ENABLED))
			this._searchInSelect.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
		if (this._appCtxt.get(ZmSetting.GAL_ENABLED))
			this._searchInSelect.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
		this._searchInSelect.reparentHtmlElement(this._listSelectId);
	}

	// add "Search" button
	this._searchButton = new DwtButton(this);
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
	this._searchButton.reparentHtmlElement(this._searchButtonId);

	// add list view for search results
	this._listview = new ZmGroupListView(this);
	this._listview.reparentHtmlElement(this._listViewId);
	this._listview.addSelectionListener(new AjxListener(this, this._selectionListener));
	this._listview.setUI(null, true); // renders headers and empty list
	this._listview._initialized = true;

	var addListener = new AjxListener(this, this._addListener);
	// add "Add" button
	this._addButton = new DwtButton(this);
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(addListener);
	this._addButton.reparentHtmlElement(this._addButtonId);
	this._addButton.setEnabled(false);

	// add "Add All" button
	this._addAllButton = new DwtButton(this);
	this._addAllButton.setText(ZmMsg.addAll);
	this._addAllButton.addSelectionListener(addListener);
	this._addAllButton.reparentHtmlElement(this._addAllButtonId);
	this._addAllButton.setEnabled(false);
};

ZmGroupView.prototype._installKeyHandlers =
function() {
	var groupName = document.getElementById(this._groupNameId);
	Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(groupName, this);

	Dwt.setHandler(this._groupMembers, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(this._groupMembers, this);

	var searchField = document.getElementById(this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmGroupView._keyPressHdlr);
	Dwt.associateElementWithObject(searchField, this);
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];
	fields.push(document.getElementById(this._groupNameId));
	fields.push(this._groupMembers);
	fields.push(document.getElementById(this._searchFieldId));
	return fields;
};

ZmGroupView.prototype._getDefaultFocusItem =
function() {
	return document.getElementById(this._groupNameId);
};

/*
 * @asArray	[Boolean]	true, if you want group members back in an Array
 *						otherwise, returns comma-separated String
*/
ZmGroupView.prototype._getGroupMembers =
function(asArray) {
	var addrs = AjxStringUtil.split(this._groupMembers.value, ['\n', ';', ',']);

	// if there are any empty values, remove them
	var i = 0;
	while (true) {
		var email = AjxStringUtil.trim(addrs[i]);
		if (email == "") {
			addrs.splice(i,1);
		} else {
			i++;
		}
		if (i == addrs.length)
			break;
	}

	return addrs.length > 0
		? (asArray ? addrs : addrs.join(", "))
		: null;
};

ZmGroupView.prototype._getFolderId =
function() {
	var id = ZmFolder.ID_CONTACTS;
	if (this._contact.id == null) {
		var clc = this._appCtxt.getApp(ZmApp.CONTACTS).getContactListController();
		id = clc._folderId;
	} else {
		if (this._contact.addrbook)
			id = this._contact.addrbook.id;
	}
	return id;
};

ZmGroupView.prototype._setGroupMembers =
function() {
	var members = this._contact.getGroupMembers().good.getArray();
	this._groupMembers.value = members.join("\n");
	this._appendNewline();
};

ZmGroupView.prototype._setGroupName =
function() {
	var groupName = document.getElementById(this._groupNameId);
	if (groupName) groupName.value = this._contact.getFileAs() || "";
};


// Listeners

ZmGroupView.prototype._searchButtonListener =
function(ev) {
	this._query = AjxStringUtil.trim(document.getElementById(this._searchFieldId).value);
	if (this._query.length) {
		if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
			var searchFor = this._searchInSelect
				? this._searchInSelect.getSelectedOption().getValue()
				: ZmContactsApp.SEARCHFOR_CONTACTS;
			this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
				? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
			// hack the query if searching for personal and shared contacts
			if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
				var addrbookList = this._appCtxt.getApp(ZmApp.CONTACTS).getAddrbookList();
				this._query += " (" + addrbookList.join(" or ") + ")";
			}
		} else {
			this._contactSource = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		}
		ZmContactsHelper.search(this, ZmItem.F_NAME, true, this._searchRespCallback, this._searchErrorCallback);
	}
};

ZmGroupView.prototype._selectionListener =
function(ev) {
	var selection = this._listview.getSelection();

	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		this._addItems(selection);
	} else {
		this._addButton.setEnabled(selection.length > 0);
	}
};

ZmGroupView.prototype._addListener =
function(ev) {

	var list = ev.dwtObj == this._addButton
		? this._listview.getSelection()
		: this._listview.getList().getArray();

	this._addItems(list);
};

ZmGroupView.prototype._addItems =
function(list) {
	if (list.length == 0) return;

	this._appendNewline();

	// we have to walk the results in case we hit a group which needs to be split
	var items = new Array();
	for (var i = 0; i < list.length; i++) {
		if (list[i].isGroup) {
			var emails = list[i].address.split(AjxEmailAddress.SEPARATOR);
			for (var j = 0; j < emails.length; j++)
				items.push(emails[j]);
		} else {
			items.push(list[i]);
		}
	}
	this._groupMembers.value += (items.join("\n") + "\n");
	this._isDirty = true;
};

// appends newline at the end of textarea if one does not already exist
ZmGroupView.prototype._appendNewline =
function() {
	var members = this._groupMembers.value;
	if (members.length) {
		if (members.charAt(members.length-1) != "\n")
			this._groupMembers.value += "\n";
	}
};

ZmGroupView.prototype._handleResponseSearch =
function(result) {
	var resp = result.getResponse();
	var list = ZmContactsHelper._processSearchResponse(resp);
	this._listview.setItems(list);
	this._addButton.setEnabled(list.length > 0);
	this._addAllButton.setEnabled(list.length > 0);
	this._searchButton.setEnabled(true);

	var more = resp.getAttribute("more");
	if (more) {
		var dlg = this._appCtxt.getMsgDialog();
		dlg.reset();
		dlg.setMessage(ZmMsg.errorSearchNotExpanded, DwtMessageDialog.WARNING_STYLE);
		dlg.popup();
	}
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

	var key = DwtKeyEvent.getCharCode(ev);
	if (ev.metaKey || ev.altKey || ev.ctrlKey || DwtKeyMapMgr.isModifier(key) || key == DwtKeyMapMgr.TAB_KEYCODE)
		return;

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._isDirty = true;
		if (e.tagName.toLowerCase() == "input")
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
	contact = contact.list._realizeContact(contact); // make sure it's a real ZmContact
	var members = contact.getGroupMembers().good.getArray();

	var html = new Array();
	var idx = 0;

	var size = (members.length <= 5 || !abridged)
		? members.length
		: Math.min(members.length, 5);

	html[idx++] = "<table border=0 cellpadding=2 cellspacing=2 width=100%>";
	html[idx++] = "<tr><td style='font-family:Arial; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:bold; background-color:#DDDDDD'>";
	html[idx++] = contact.getFileAs();
	html[idx++] = "</td></tr>";

	for (var i = 0; i < size; i++) {
		html[idx++] = "<tr><td valign=top style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>";
		html[idx++] = AjxStringUtil.htmlEncode(members[i].toString());
		html[idx++] = "</td></tr>";
	}
	if (abridged && size < members.length) {
		html[idx++] = "<tr><td valign=top style='font-family:Arial; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>";
		html[idx++] = ZmMsg.more;
		html[idx++] = "</td></tr>";
	}
	html[idx++] = "</table>";

	return html.join("");
};



/**
* Creates a group list view for search results
* @constructor
* @class
*
* @param parent			[ZmGroupView]	containing widget
*/
ZmGroupListView = function(parent) {
	if (arguments.length == 0) return;
	DwtListView.call(this, parent, "DwtChooserListView", null, this._getHeaderList(parent));
};

ZmGroupListView.prototype = new DwtListView;
ZmGroupListView.prototype.constructor = ZmGroupListView;


ZmGroupListView.prototype.setItems =
function(items) {
	this._resetList();
	this.addItems(items);
	var list = this.getList();
	if (list && list.size() > 0) {
		this.setSelection(list.get(0));
	}
};

ZmGroupListView.prototype._getHeaderList =
function() {
	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmItem.F_TYPE, null, "Contact", 20));
	headerList.push(new DwtListHeaderItem(ZmItem.F_NAME, ZmMsg._name, null, 100));
	headerList.push(new DwtListHeaderItem(ZmItem.F_EMAIL, ZmMsg.email));
	return headerList;
};

ZmGroupListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	return ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
};

ZmGroupListView.prototype._itemClicked =
function(clickedEl, ev) {
	// Ignore right-clicks, we don't support action menus
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) {
		return;
	} else {
		DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
	}
};
