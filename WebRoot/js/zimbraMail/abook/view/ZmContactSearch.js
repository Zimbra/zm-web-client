/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * This file contains the contact search class.
 *
 */

/**
 * Creates a component that lets the user search for and select one or more contacts.
 * @constructor
 * @class
 * This class creates and manages a component that lets the user search for and
 * select one or more contacts. It is intended to be plugged into a larger
 * component such as a dialog or a tab view.
 *
 * @author Conrad Damon
 *
 * @param {hash}			params				hash of parameters:
 * @param {DwtComposite}		parent			the containing widget
 * @param {string}				className		the CSS class
 * @param {hash}				options			hash of options:
 * @param {string}					preamble	explanatory text
 * @param {array}					searchFor	list of ZmContactsApp.SEARCHFOR_*
 * @param {boolean}					showEmails	if true, show each email in results
 *
 * @extends		DwtComposite
 *
 * TODO: scroll-based paging
 * TODO: adapt for contact picker and attachcontacts zimlet
 */
ZmContactSearch = function(params) {

	params = params || {};
	params.parent = params.parent || appCtxt.getShell();
	params.className = params.className || "ZmContactSearch";
	DwtComposite.call(this, params);

	this._options = params.options;
	this._defaultQuery = ".";
	this._initialized = false;
	this._searchErrorCallback = new AjxCallback(this, this._handleErrorSearch);
	if (!ZmContactSearch._controller) {
		ZmContactSearch._controller = new ZmContactSearchController();
	}
	this._controller = ZmContactSearch._controller;
	this._initialize();
};

ZmContactSearch.prototype = new DwtComposite;
ZmContactSearch.prototype.constructor = ZmContactSearch;

ZmContactSearch.SEARCHFOR_SETTING = {};
ZmContactSearch.SEARCHFOR_SETTING[ZmContactsApp.SEARCHFOR_CONTACTS]	= ZmSetting.CONTACTS_ENABLED;
ZmContactSearch.SEARCHFOR_SETTING[ZmContactsApp.SEARCHFOR_GAL]		= ZmSetting.GAL_ENABLED;
ZmContactSearch.SEARCHFOR_SETTING[ZmContactsApp.SEARCHFOR_PAS]		= ZmSetting.SHARING_ENABLED;
ZmContactSearch.SEARCHFOR_SETTING[ZmContactsApp.SEARCHFOR_FOLDERS]	= ZmSetting.CONTACTS_ENABLED;

// Public methods

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmContactSearch.prototype.toString =
function() {
	return "ZmContactSearch";
};

/**
 * Performs a search.
 *
 */
ZmContactSearch.prototype.search =
function(ascending, firstTime, lastId, lastSortVal) {

	if (!AjxUtil.isSpecified(ascending)) {
		ascending = true;
	}

	var query = this._searchCleared ? AjxStringUtil.trim(this._searchField.value) : "";
	if (!query.length) {
		query = this._defaultQuery;
	}

	var queryHint;
	if (this._selectDiv) {
		var searchFor = this._selectDiv.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint = ZmSearchController.generateQueryForShares([ZmId.ITEM_CONTACT]) || "is:local";
		} else if (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS) {
			queryHint = "is:local";
		} else if (searchFor == ZmContactsApp.SEARCHFOR_GAL) {
            ascending = true;
        }
	} else {
		this._contactSource = appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (this._contactSource == ZmItem.CONTACT) {
			queryHint = "is:local";
		}
	}

	this._searchIcon.className = "DwtWait16Icon";

	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
//	this._chooser.sourceListView.sortingEnabled = (this._contactSource == ZmItem.CONTACT);

	var params = {
		obj: this,
		ascending: ascending,
		query: query,
		queryHint: queryHint,
		offset: this._list.size(),
		lastId: lastId,
		lastSortVal: lastSortVal,
		respCallback: (new AjxCallback(this, this._handleResponseSearch, [firstTime])),
		errorCallback: this._searchErrorCallback,
		accountName: (this._account && this._account.name)
	};
	ZmContactsHelper.search(params);
};

ZmContactSearch.prototype._handleResponseSearch =
function(firstTime, result) {

	this._controller.show(result.getResponse(), firstTime);
	var list = this._controller._list;
	if (list) {
		this._list = list.getVector();
		if (list && list.size() == 1) {
			this._listView.setSelection(list.get(0));
		}
	}

	this._searchIcon.className = "ImgSearch";
	this._searchButton.setEnabled(true);
};

ZmContactSearch.prototype.getContacts =
function() {
	return this._listView.getSelection();
};

ZmContactSearch.prototype.setAccount =
function(account) {
	if (this._account != account) {
		this._account = account;
		this._resetSelectDiv();
	}
};

ZmContactSearch.prototype.reset =
function(query, account) {

	this._offset = 0;
	if (this._list) {
		this._list.removeAll();
	}
	this._list = new AjxVector();

	// reset search field
	this._searchField.disabled = false;
	this._searchField.focus();
	query = query || this._searchField.value;
	if (query) {
		this._searchField.className = "";
		this._searchField.value = query;
		this._searchCleared = true;
	} else {
		this._searchField.className = "searchFieldHint";
		this._searchField.value = ZmMsg.contactPickerHint;
		this._searchCleared = false;
	}

	this.setAccount(account || this._account);
};


// Private and protected methods

ZmContactSearch.prototype._initialize =
function() {

	this._searchForHash = this._options.searchFor ? AjxUtil.arrayAsHash(this._options.searchFor) : {};

	this.getHtmlElement().innerHTML = this._contentHtml();

	if (this._options.preamble) {
		var div = document.getElementById(this._htmlElId + "_preamble");
		div.innerHTML = this._options.preamble;
	}

	this._searchIcon = document.getElementById(this._htmlElId + "_searchIcon");

	// add search button
	this._searchButton = new DwtButton({parent:this, parentElement:(this._htmlElId + "_searchButton")});
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));

	// add select menu, if needed
	var selectCellId = this._htmlElId + "_folders";
	var selectCell = document.getElementById(selectCellId);
	if (selectCell) {
		this._selectDiv = new DwtSelect({parent:this, parentElement:selectCellId});
		this._resetSelectDiv();
		this._selectDiv.addChangeListener(new AjxListener(this, this._searchTypeListener));
	}

	this._searchField = document.getElementById(this._htmlElId + "_searchField");
	Dwt.setHandler(this._searchField, DwtEvent.ONKEYUP, ZmContactSearch._keyPressHdlr);
	Dwt.setHandler(this._searchField, DwtEvent.ONCLICK, ZmContactSearch._onclickHdlr);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);

	var listDiv = document.getElementById(this._htmlElId + "_results");
	if (listDiv) {
		params = {parent:this, parentElement:listDiv, options:this._options};
		this._listView = this._controller._listView = new ZmContactSearchListView(params);
	}

	this._initialized = true;
};

/**
 * @private
 */
ZmContactSearch.prototype._contentHtml =
function() {

	var showSelect;
	if (appCtxt.multiAccounts) {
		var list = appCtxt.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			this._setSearchFor(account);
			if (this._searchFor.length > 1) {
				showSelect = true;
				break;
			}
		}
	} else {
		this._setSearchFor();
		showSelect = (this._searchFor.length > 1);
	}

	var subs = {
		id: this._htmlElId,
		showSelect: showSelect
	};

	return (AjxTemplate.expand("abook.Contacts#ZmContactSearch", subs));
};

ZmContactSearch.prototype._setSearchFor =
function(account) {

	account = account || this._account;
	this._searchFor = [];
	if (this._options.searchFor && this._options.searchFor.length) {
		for (var i = 0; i < this._options.searchFor.length; i++) {
			var searchFor = this._options.searchFor[i];
			if (appCtxt.get(ZmContactSearch.SEARCHFOR_SETTING[searchFor], null, account)) {
				this._searchFor.push(searchFor);
			}
		}
	}
	this._searchForHash = AjxUtil.arrayAsHash(this._searchFor);
};

/**
 * @private
 */
ZmContactSearch.prototype._resetSelectDiv =
function() {

	if (!this._selectDiv) { return; }
	
	this._selectDiv.clearOptions();
	this._setSearchFor();

	var sfh = this._searchForHash;
	if (sfh[ZmContactsApp.SEARCHFOR_CONTACTS]) {
		this._selectDiv.addOption(ZmMsg.contacts, false, ZmContactsApp.SEARCHFOR_CONTACTS);

		if (sfh[ZmContactsApp.SEARCHFOR_PAS]) {
			this._selectDiv.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
		}
	}

	if (sfh[ZmContactsApp.SEARCHFOR_GAL]) {
		this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
	}

	if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL, null, this._account) ||
		!appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account))
	{
		this._selectDiv.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
	}

	if (sfh[ZmContactsApp.SEARCHFOR_FOLDERS]) {
		// TODO
	}
};

/**
 * @private
 */
ZmContactSearch.prototype._searchButtonListener =
function(ev) {
	this._offset = 0;
	this._list.removeAll();
	this.search();
};

/**
 * @private
 */
ZmContactSearch._keyPressHdlr =
function(ev) {
	var stb = DwtControl.getTargetControl(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (!stb._searchCleared) {
		stb._searchField.className = stb._searchField.value = "";
		stb._searchCleared = true;
	}
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
		return false;
	}
	return true;
};

/**
 * @private
 */
ZmContactSearch._onclickHdlr =
function(ev) {
	var stb = DwtControl.getTargetControl(ev);
	if (!stb._searchCleared) {
		stb._searchField.className = stb._searchField.value = "";
		stb._searchCleared = true;
	}
};


// ZmContactSearchController

ZmContactSearchController = function(params) {

	ZmContactListController.call(this, appCtxt.getShell(), appCtxt.getApp(ZmApp.CONTACTS));
};

ZmContactSearchController.prototype = new ZmContactListController;
ZmContactSearchController.prototype.constructor = ZmContactSearchController;

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmContactSearchController.prototype.toString =
function() {
	return "ZmContactSearchController";
};

ZmContactSearchController.prototype.show =
function(searchResult, firstTime) {

	var more = searchResult.getAttribute("more");
	var list = this._list = searchResult.getResults(ZmItem.CONTACT);
	if (list.size() == 0 && firstTime) {
		this._listView._setNoResultsHtml();
	}

	more = more || (this._offset + ZmContactsApp.SEARCHFOR_MAX) < this._list.size();
	this._listView.set(list);
};

// ZmContactSearchListView

ZmContactSearchListView = function(params) {

	params = params || {};
	params.posStyle = Dwt.STATIC_STYLE;
	params.className = params.className || "ZmContactSearchListView";
	params.headerList = this._getHeaderList();
	ZmContactsBaseView.call(this, params);
	this._options = params.options;
}

ZmContactSearchListView.prototype = new ZmContactsBaseView;
ZmContactSearchListView.prototype.constructor = ZmContactSearchListView;

/**
 * Returns a string representation of the object.
 *
 * @return		{String}		a string representation of the object
 */
ZmContactSearchListView.prototype.toString =
function() {
	return "ZmContactSearchListView";
};

ZmContactSearchListView.prototype._getHeaderList =
function() {
	var headerList = [];
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_TYPE, width:ZmMsg.COLUMN_WIDTH_FOLDER_CN}));
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg._name, width:ZmMsg.COLUMN_WIDTH_NAME_CN}));
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.email}));

	return headerList;
};

/**
 * @private
 */
ZmContactSearchListView.prototype._getCellContents =
function(htmlArr, idx, contact, field, colIdx, params) {
	if (field == ZmItem.F_TYPE) {
		htmlArr[idx++] = AjxImg.getImageHtml(contact.getIcon());
	} else if (field == ZmItem.F_NAME) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getFileAs());
	} else if (field == ZmItem.F_EMAIL) {
		htmlArr[idx++] = AjxStringUtil.htmlEncode(contact.getEmail());
	}
	return idx;
};
