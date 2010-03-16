/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact group view classes.
 */

/**
 * Creates the group view.
 * @class
 * This class represents the contact group view.
 * 
 * @param	{DwtComposite}	parent		the parent
 * @param	{ZmContactController}		controller		the controller
 * 
 * @extends		DwtComposite
 */
ZmGroupView = function(parent, controller) {
	if (arguments.length == 0) return;
	DwtComposite.call(this, {parent:parent, className:"ZmContactView", posStyle:DwtControl.ABSOLUTE_STYLE});
	this.setScrollStyle(Dwt.SCROLL);

	this._searchRespCallback = new AjxCallback(this, this._handleResponseSearch);

	this._controller = controller;

	this.setScrollStyle(Dwt.CLIP);
	this._offset = 0;
	this._defaultQuery = ".";
	this._view = ZmId.VIEW_GROUP;
};

ZmGroupView.prototype = new DwtComposite;
ZmGroupView.prototype.constructor = ZmGroupView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmGroupView.prototype.toString =
function() {
	return "ZmGroupView";
};

ZmGroupView.DIALOG_X = 50;
ZmGroupView.DIALOG_Y = 100;

//
// Public methods
//

// need this since contact view now derives from list controller
ZmGroupView.prototype.getList = function() { return null; }

/**
 * Gets the contact.
 * 
 * @return	{ZmContact}	the contact
 */
ZmGroupView.prototype.getContact =
function() {
	return this._contact;
};

/**
 * Gets the controller.
 * 
 * @return	{ZmContactController}	the controller
 */
ZmGroupView.prototype.getController =
function() {
	return this._controller;
};

// Following two overrides are a hack to allow this view to pretend it's a list view
ZmGroupView.prototype.getSelection = function() {
	return this.getContact();
};

ZmGroupView.prototype.getSelectionCount = function() {
	return 1;
};

ZmGroupView.prototype.set =
function(contact, isDirty) {
	this._attr = {};

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
	this._offset = 0;
	this._isDirty = isDirty;

	this.search();
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
		mods[ZmContact.F_folderId] = folderId;
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

		var oldFolderId = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
		if (folderId != oldFolderId) {
			mods[ZmContact.F_folderId] = folderId;
			foundOne = true;
		}
	}

	return foundOne ? mods : null;
};

ZmGroupView.prototype.isEmpty =
function(checkEither) {
	var groupName = AjxStringUtil.trim(document.getElementById(this._groupNameId).value);
	var members = ( this._groupListView.getList() && this._groupListView.getList().size() > 0 );

	return checkEither
		? (groupName == "" || !members )
		: (groupName == "" && !members );
};

ZmGroupView.prototype.isValid =
function() {
	// check for required group name
	if (this.isDirty() && this.isEmpty(true)) {
		return false;
	}
	return true;
};

ZmGroupView.prototype.getInvalidItems =
function() {
	if (!this.isValid()) {
		return ["members"];
	}
	return [];
};

ZmGroupView.prototype.getErrorMessage = function(id) {
	if (!this.isValid() && id=="members") {
		return ZmMsg.errorMissingGroup;
	}
};

ZmGroupView.prototype.enableInputs =
function(bEnable) {
	document.getElementById(this._groupNameId).disabled = !bEnable;
	if (!this._noManualEntry) {
		this._groupMembers.disabled = !bEnable;
	}
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
	if(this._addNewField){
		Dwt.setSize(this._addNewField, Dwt.DEFAULT, 50);
	}
	this._groupListView.setSize(Dwt.DEFAULT, height-150);
	var fudge = (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.SHARING_ENABLED))
		? 185 : 160;
	this._listview.setSize(Dwt.DEFAULT, height-fudge-(this._addNewField? 100 : 0));
};

ZmGroupView.prototype.cleanup  =
function() {
	document.getElementById(this._searchFieldId).value = "";
	this._listview.removeAll(true);
	this._groupListView.removeAll(true);
	this._addButton.setEnabled(false);
	this._addAllButton.setEnabled(false);
	this._prevButton.setEnabled(false);
	this._nextButton.setEnabled(false);
	this._delButton.setEnabled(false);
	if (this._addNewField) {
		this._addNewField.value = '';
	}
};

ZmGroupView.prototype.search =
function() {
	var query = AjxStringUtil.trim(document.getElementById(this._searchFieldId).value);
	if (!query.length) {
		query = this._defaultQuery;
	}

	var queryHint;
	if (this._searchInSelect) {
		var searchFor = this._searchInSelect.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;
		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint = ZmSearchController.generateQueryForShares([ZmId.ITEM_CONTACT]) || "is:local";
		} else if (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS) {
			queryHint = "is:local";
		}
	} else {
		this._contactSource = appCtxt.get(ZmSetting.CONTACTS_ENABLED)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (this._contactSource == ZmItem.CONTACT) {
			queryHint = "is:local";
		}
	}
	var params = {
		obj: this,
		ascending: true,
		query: query,
		queryHint: queryHint,
		offset: this._offset,
		respCallback: this._searchRespCallback
	};
	ZmContactsHelper.search(params);
};


// Private methods

ZmGroupView.prototype._setFields =
function() {
	// bug fix #35059 - always reset search-in select since non-zimbra accounts don't support GAL
	if (appCtxt.isOffline && appCtxt.accountList.size() > 1 && this._searchInSelect) {
		this._searchInSelect.clearOptions();
		this._resetSearchInSelect();
	}

	this._setGroupName();
	this._setFolder();
	this._setGroupMembers();
	this._setHeaderInfo();
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
	this._headerRowId = 		this._htmlElId + "_headerRow";
	this._titleId = 			this._htmlElId + "_title";
	this._tagsId = 				this._htmlElId + "_tags";
	this._groupNameId = 		this._htmlElId + "_groupName";
	this._searchFieldId = 		this._htmlElId + "_searchField";

	var showSearchIn = false;
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
		if (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.SHARING_ENABLED))
			showSearchIn = true;
	}
	var params = {
		id: this._htmlElId,
		showSearchIn: showSearchIn
	};
	this.getHtmlElement().innerHTML = AjxTemplate.expand("abook.Contacts#GroupView", params);
	this._htmlInitialized = true;
};

ZmGroupView.prototype._addWidgets =
function() {
	this._groupMembers = document.getElementById(this._htmlElId + "_groupMembers");
	this._noManualEntry = this._groupMembers.disabled; // see bug 23858

	// add folder DwtSelect
	var folderCellId = this._htmlElId + "_folderSelect";
	var folderCell = document.getElementById(folderCellId);
	if (folderCell) {
		// add select widget for user to choose folder
		this._folderSelect = new DwtSelect({parent:this});
		this._folderSelect.reparentHtmlElement(folderCellId);
		this._folderSelect.addChangeListener(new AjxListener(this, this._selectChangeListener));
	}

	// add select menu
	var selectId = this._htmlElId + "_listSelect";
	var selectCell = document.getElementById(selectId);
	if (selectCell) {
		this._searchInSelect = new DwtSelect({parent:this});
		this._resetSearchInSelect();
		this._searchInSelect.reparentHtmlElement(selectId);
		this._searchInSelect.addChangeListener(new AjxListener(this, this._searchTypeListener));
	}

	// add "Search" button
	this._searchButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_searchButton")});
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));

	// add list view for search results
	this._listview = new ZmGroupListView(this);
	this._listview.reparentHtmlElement(this._htmlElId + "_listView");
	this._listview.addSelectionListener(new AjxListener(this, this._selectionListener));
	this._listview.setUI(null, true); // renders headers and empty list
	this._listview._initialized = true;

	// add list view for group memebers
	this._groupListView = new ZmGroupMembersListView(this);
	this._groupListView.reparentHtmlElement(this._htmlElId + "_groupMembers");
	this._groupListView.addSelectionListener(new AjxListener(this, this._groupMembersSelectionListener));
	this._groupListView.setUI(null, true);
	this._groupListView._initialized = true;

	// add delete button
	var delListener = new AjxListener(this, this._delListener);
	this._delButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_delButton")});
	this._delButton.setText(ZmMsg.del);
	this._delButton.addSelectionListener(delListener);
	this._delButton.setEnabled(false);

	// add delete all button
	this._delAllButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_delAllButton")});
	this._delAllButton.setText(ZmMsg.delAll);
	this._delAllButton.addSelectionListener(delListener);

	var addListener = new AjxListener(this, this._addListener);
	// add "Add" button
	this._addButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addButton")});
	this._addButton.setText(ZmMsg.add);
	this._addButton.addSelectionListener(addListener);
	this._addButton.setEnabled(false);

	// add "Add All" button
	this._addAllButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addAllButton")});
	this._addAllButton.setText(ZmMsg.addAll);
	this._addAllButton.addSelectionListener(addListener);
	this._addAllButton.setEnabled(false);

	var pageListener = new AjxListener(this, this._pageListener);
	// add paging buttons
	this._prevButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_prevButton")});
	this._prevButton.setImage("LeftArrow");
	this._prevButton.addSelectionListener(pageListener);
	this._prevButton.setEnabled(false);

	this._nextButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_nextButton")});
	this._nextButton.setImage("RightArrow");
	this._nextButton.addSelectionListener(pageListener);
	this._nextButton.setEnabled(false);

	// add New Button
	this._addNewField = document.getElementById(this._htmlElId + "_addNewField");
	if (this._addNewField) {
		this._addNewButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_addNewButton")});
		this._addNewButton.setText(ZmMsg.add);
		this._addNewButton.addSelectionListener(new AjxListener(this, this._addNewListener));
	}
};

ZmGroupView.prototype._installKeyHandlers =
function() {
	var groupName = document.getElementById(this._groupNameId);
	Dwt.setHandler(groupName, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
	Dwt.associateElementWithObject(groupName, this);

	if (!this._noManualEntry) {
		Dwt.setHandler(this._groupMembers, DwtEvent.ONKEYUP, ZmGroupView._onKeyUp);
		Dwt.associateElementWithObject(this._groupMembers, this);
	}

	var searchField = document.getElementById(this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmGroupView._keyPressHdlr);
	Dwt.associateElementWithObject(searchField, this);
};

ZmGroupView.prototype._getTabGroupMembers =
function() {
	var fields = [];
	fields.push(document.getElementById(this._groupNameId));
	if (!this._noManualEntry) {
		fields.push(this._groupMembers);
	}
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
	var addrs = this._groupListView.getList();
	if (!addrs) { return null; }

	addrs = addrs.getArray();

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
	return (this._folderSelect != null)
		? this._folderSelect.getValue()
		: ZmFolder.ID_CONTACTS;
};

ZmGroupView.prototype._setGroupMembers =
function() {
	var members = this._contact.getGroupMembers().all.getArray();
	var membersList = [];
	for (var i = 0; i < members.length; i++) {
		membersList[i] = members[i].toString();
	}
	this._setGroupMembersListView(membersList, false);
};

ZmGroupView.prototype._setGroupName =
function() {
	var groupName = document.getElementById(this._groupNameId);
	if (groupName) groupName.value = this._contact.getFileAs() || "";
};

ZmGroupView.prototype._resetSearchInSelect =
function() {
	this._searchInSelect.addOption(ZmMsg.contacts, true, ZmContactsApp.SEARCHFOR_CONTACTS);
	if (appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		this._searchInSelect.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
	}
	if (appCtxt.get(ZmSetting.GAL_ENABLED) && appCtxt.getActiveAccount().isZimbraAccount) {
		this._searchInSelect.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
	}
	if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL) || !appCtxt.get(ZmSetting.GAL_ENABLED)) {
		this._searchInSelect.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
	}
};

ZmGroupView.prototype._setFolder =
function() {
	if (this._folderSelect) {
		var match;
		if (this._contact.id == null) {
			var clc = AjxDispatcher.run("GetContactListController");
			match = clc._folderId;
		}

		if (this._contact.id != null || !match) {
			match = this._contact.addrbook ? this._contact.addrbook.id : ZmFolder.ID_CONTACTS;
		}

		var folderTree = appCtxt.getFolderTree();
		var folders = folderTree ? folderTree.getByType(ZmOrganizer.ADDRBOOK) : [];
		folders.sort(ZmAddrBook.sortCompare);

		// for now, always re-populate folders DwtSelect
		this._folderSelect.clearOptions();

		for (var i = 0; i < folders.length; i++) {
			var folder = folders[i];
			if (folder.nId == ZmFolder.ID_ROOT || folder.isInTrash() || folder.isReadOnly()) {
				continue;
			}

			this._folderSelect.addOption(folder.name, folder.id == match, folder.id);
		}
	} else if (this._folderPickerButton) {
		var folder = this._contact.getAddressBook();
		if (folder) {
			this._folderPickerButton.setText(folder.name);
			this._folderPickedId = folder.id;
		} else {
			var name = ZmMsg[ZmFolder.MSG_KEY[ZmOrganizer.ID_ADDRBOOK]];
			this._folderPickerButton.setText(name);
			this._folderPickedId = ZmOrganizer.getSystemId(ZmOrganizer.ID_ADDRBOOK, appCtxt.getActiveAccount());
		}
	}
};

ZmGroupView.prototype._setHeaderInfo =
function() {
	// set the appropriate header color
	var folderId = this._contact.folderId;
	var folder = folderId ? appCtxt.getById(folderId) : null;
	var color = folder ? folder.color : ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.ADDRBOOK];
	var bkgdColor = ZmOrganizer.COLOR_TEXT[color] + "Bg";

	// set the header color for all tabs
	var contactHdrRow = document.getElementById(this._headerRowId);
	if (contactHdrRow) {
		contactHdrRow.className = "contactHeaderRow " + bkgdColor;
	}

	// set appropriate icon
	var iconCell = document.getElementById(this._iconCellId);
	if (iconCell) {
		iconCell.innerHTML = AjxImg.getImageHtml(this._contact.getIcon());
	}
};

ZmGroupView.prototype._setTags =
function() {
	var tagCell = this._getTagCell();
	if (!tagCell) { return; }

	// get sorted list of tags for this msg
	var ta = [];
	for (var i = 0; i < this._contact.tags.length; i++)
		ta.push(this._tagList.getById(this._contact.tags[i]));
	ta.sort(ZmTag.sortCompare);

	var html = [];
	var i = 0;
	for (var j = 0; j < ta.length; j++) {
		var tag = ta[j];
		if (!tag) continue;
		var icon = ZmTag.COLOR_ICON[tag.color];
		html[i++] = AjxImg.getImageSpanHtml(icon, null, null, tag.name);
		html[i++] = "&nbsp;";
	}

	tagCell.innerHTML = html.join("");
};

ZmGroupView.prototype._getTagCell =
function() {
	return document.getElementById(this._tagCellId);
};

// Consistent spot to locate various dialogs
ZmGroupView.prototype._getDialogXY =
function() {
	var loc = Dwt.toWindow(this.getHtmlElement(), 0, 0);
	return new DwtPoint(loc.x + ZmGroupView.DIALOG_X, loc.y + ZmGroupView.DIALOG_Y);
};

// Listeners

ZmGroupView.prototype._searchButtonListener =
function(ev) {
	this._offset = 0;
	this.search();
};


ZmGroupView.prototype._groupMembersSelectionListener =
function(ev){
	var selection = this._groupListView.getSelection();
	this._delButton.setEnabled(selection.length > 0);
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

ZmGroupView.prototype._selectChangeListener =
function(ev) {
	this._attr[ZmContact.F_folderId] = ev._args.newValue;
	this._isDirty = true;
};

ZmGroupView.prototype._searchTypeListener =
function(ev) {
	var oldValue = ev._args.oldValue;
	var newValue = ev._args.newValue;

	if (oldValue != newValue) {
		this._searchButtonListener();
	}
};

ZmGroupView.prototype._pageListener =
function(ev) {
	if (ev.item == this._prevButton) {
		this._offset -= ZmContactsApp.SEARCHFOR_MAX;
	} else {
		this._offset += ZmContactsApp.SEARCHFOR_MAX;
	}

	this.search();
};

ZmGroupView.prototype._delListener =
function(ev){

	if (ev.dwtObj == this._delButton) {
		var items = this._groupListView.getSelection();
		var list = this._groupListView.getSelectedItems();

		while (list.get(0)) {
			this._groupListView.removeItem(list.get(0));
			list = this._groupListView.getSelectedItems();
		}

		for (var i = 0;  i < items.length; i++) {
			this._groupListView.getList().remove(items[i]);
		}
	} else {
		this._groupListView.removeAll(true);
		this._groupListView.getList().removeAll();
	}

	this._groupMembersSelectionListener();
	this._isDirty = true;
};

ZmGroupView.prototype._addNewListener =
function(ev){
	var emailStr = this._addNewField.value;
	if (!emailStr || emailStr == '') { return; }

	var addrs = AjxEmailAddress.parseEmailString(emailStr);
	if (addrs && addrs.all) {
		var goodArry = addrs.all.getArray();
		var goodAddr = [];
		for (var i = 0; i < goodArry.length; i++) {
			goodAddr[i] = goodArry[i].toString();
		}
		this._setGroupMembersListView(goodAddr, true);
	}

	this._addNewField.value = '';
};

ZmGroupView.prototype._addListener =
function(ev) {
	var list = (ev.dwtObj == this._addButton)
		? this._listview.getSelection()
		: this._listview.getList().getArray();

	this._addItems(list);
};

ZmGroupView.prototype._addItems =
function(list) {
	if (list.length == 0) { return; }

	// we have to walk the results in case we hit a group which needs to be split
	var items = [];
	for (var i = 0; i < list.length; i++) {
		if (list[i].isGroup) {
			var emails = list[i].address.split(AjxEmailAddress.SEPARATOR);
			for (var j = 0; j < emails.length; j++)
				items.push(emails[j]);
		} else {
			items.push(list[i].toString());
		}
	}

	this._dedupe(items);
	if (items.length > 0) {
		this._setGroupMembersListView(items, true);
	}
};

ZmGroupView.prototype._setGroupMembersListView =
function(list, append){
	if (append) {
		var membersList = this._groupListView.getList();
		list = list.concat( membersList ? membersList.getArray() : [] );
	}
	this._groupListView.set(AjxVector.fromArray(list));
	this._isDirty = true;
};

ZmGroupView.prototype._dedupe =
function(items) {
	var addrs = this._groupListView.getList();
	if (addrs) {
		addrs = addrs.getArray();
		var i = 0;
		while (true) {
			var found = false;
			for (var j = 0; j < addrs.length; j++) {
				if (items[i] == AjxStringUtil.trim(addrs[j])) {
					items.splice(i,1);
					found = true;
					break;
				}
			}
			if (!found) i++;
			if (i == items.length) break;
		}
	}
};

ZmGroupView.prototype._setGroupMemberValue =
function(value, append) {
	if (this._noManualEntry) {
		this._groupMembers.disabled = false;
	}

	if (append) {
		this._groupMembers.value += value;
	} else {
		this._groupMembers.value = value;
	}

	if (this._noManualEntry) {
		this._groupMembers.disabled = true;
	}
};

ZmGroupView.prototype._handleResponseSearch =
function(result) {
	var resp = result.getResponse();

	var more = resp.getAttribute("more");
	this._prevButton.setEnabled(this._offset > 0);
	this._nextButton.setEnabled(more);

	var list = ZmContactsHelper._processSearchResponse(resp);
	this._listview.setItems(list);

	this._addButton.setEnabled(list.length > 0);
	this._addAllButton.setEnabled(list.length > 0);

	this._searchButton.setEnabled(true);
};


// Static methods

ZmGroupView._onKeyUp =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);

	var key = DwtKeyEvent.getCharCode(ev);
	if (DwtKeyMapMgr.hasModifier(ev) || DwtKeyMap.IS_MODIFIER[key] ||	key == DwtKeyMapMgr.TAB_KEYCODE) { return; }

	var e = DwtUiEvent.getTarget(ev);
	var view = e ? Dwt.getObjectFromElement(e) : null;
	if (view) {
		view._isDirty = true;
		if (e.tagName.toLowerCase() == "input") {
			view._setTitle(e.value);
		}
	}

	return true;
};

ZmGroupView._keyPressHdlr =
function(ev) {
	ev = DwtUiEvent.getEvent(ev);
	if (DwtKeyMapMgr.hasModifier(ev)) { return; }

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


/**
 * Creates a group list view for search results
 * @constructor
 * @class
 *
 * @param {ZmGroupView}		parent			containing widget
 * 
 * @extends		DwtListView
 * 
 * @private
*/
ZmGroupListView = function(parent) {
	if (arguments.length == 0) { return; }
	DwtListView.call(this, {parent:parent, className:"DwtChooserListView",
							headerList:this._getHeaderList(parent), view:parent._view});
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
	return [
		(new DwtListHeaderItem({field:ZmItem.F_TYPE,	icon:"Contact",		width:ZmMsg.COLUMN_WIDTH_TYPE_CN})),
		(new DwtListHeaderItem({field:ZmItem.F_NAME,	text:ZmMsg._name,	width:ZmMsg.COLUMN_WIDTH_NAME_CN})),
		(new DwtListHeaderItem({field:ZmItem.F_EMAIL,	text:ZmMsg.email}))
	];
};

ZmGroupListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	return ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
};

ZmGroupListView.prototype._itemClicked =
function(clickedEl, ev) {
	// Ignore right-clicks, we don't support action menus
	if (!ev.shiftKey && !ev.ctrlKey && ev.button == DwtMouseEvent.RIGHT) { return; }

	DwtListView.prototype._itemClicked.call(this, clickedEl, ev);
};


/**
 * Creates a group members list view
 * @constructor
 * @class
 *
 * @param {ZmGroupView}	parent			containing widget
 * 
 * @extends		ZmGroupListView
 * 
 * 
 * @private
 */
ZmGroupMembersListView = function (parent) {
	if (arguments.length == 0) { return; }
	ZmGroupListView.call(this, parent);
};

ZmGroupMembersListView.prototype = new ZmGroupListView;
ZmGroupMembersListView.prototype.constructor = ZmGroupMembersListView;

ZmGroupMembersListView.prototype._getHeaderList =
function() {
	return [(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.email, view:this._view}))];
};

ZmGroupMembersListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_EMAIL) {
		html[idx++] = AjxStringUtil.htmlEncode(item, true);
	}
	return idx;
};

// override from base class since it is handled differently
ZmGroupMembersListView.prototype._getItemId =
function(item) {
	return (item && item.id) ? item.id : Dwt.getNextId();
};
