/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * This file contains the contact picker classes.
 * 
 */

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
 * 
 * @param {Array}	buttonInfo		the transfer button IDs and labels
 * 
 * @extends		DwtDialog
 */
ZmContactPicker = function(buttonInfo) {

	DwtDialog.call(this, {parent:appCtxt.getShell(), title:ZmMsg.selectAddresses, id: "ZmContactPicker"});

	this._buttonInfo = buttonInfo;
	this._initialized = false;
	this._emailListOffset = 0; //client side paginating over email list. Offset of current page of email addresses. Quite different than _lastServerOffset if contacts have 0 or more than 1 email addresses.
	this._serverContactOffset = 0; //server side paginating over contact list. Offset of last contact block we got from the server (each contact could have 0, 1, or more emails so we have to keep track of this separate from the view offset.
	this._ascending = true; //asending or descending search. Keep it stored for pagination to do the right sort.
	this._emailList = new AjxVector();
	this._detailedSearch = appCtxt.get(ZmSetting.DETAILED_CONTACT_SEARCH_ENABLED);
	this._ignoreSetDragBoundries = true;

	this.setSize(Dwt.DEFAULT, this._getDialogHeight());

	this._searchErrorCallback = new AjxCallback(this, this._handleErrorSearch);
};

ZmContactPicker.prototype = new DwtDialog;
ZmContactPicker.prototype.constructor = ZmContactPicker;

ZmContactPicker.prototype.isZmContactPicker = true;
ZmContactPicker.prototype.toString = function() { return "ZmContactPicker"; };

// Consts

ZmContactPicker.DIALOG_HEIGHT = 460;

ZmContactPicker.SEARCH_BASIC = "search";
ZmContactPicker.SEARCH_NAME = "name";
ZmContactPicker.SEARCH_EMAIL = "email";
ZmContactPicker.SEARCH_DEPT = "dept";
ZmContactPicker.SEARCH_PHONETIC = "phonetic";

ZmContactPicker.SHOW_ON_GAL = [ZmContactPicker.SEARCH_BASIC, ZmContactPicker.SEARCH_NAME, ZmContactPicker.SEARCH_EMAIL, ZmContactPicker.SEARCH_DEPT];
ZmContactPicker.SHOW_ON_NONGAL = [ZmContactPicker.SEARCH_BASIC, ZmContactPicker.SEARCH_NAME, ZmContactPicker.SEARCH_PHONETIC, ZmContactPicker.SEARCH_EMAIL];
ZmContactPicker.ALL = [ ZmContactPicker.SEARCH_BASIC, ZmContactPicker.SEARCH_NAME, ZmContactPicker.SEARCH_PHONETIC, ZmContactPicker.SEARCH_EMAIL, ZmContactPicker.SEARCH_DEPT ];

// Public methods


/**
* Displays the contact picker dialog. The source list is populated with
* contacts, and the target list is populated with any addresses that are
* passed in. The address button that was used to popup the dialog is set
* as the active button.
*
* @param {String}	buttonId	the button ID of the button that called us
* @param {Hash}	addrs		a hash of 3 vectors (one for each type of address)
* @param {String}	str		initial search string
*/
ZmContactPicker.prototype.popup =
function(buttonId, addrs, str, account) {

	if (!this._initialized) {
		this._initialize(account);
		this._initialized = true;
	}
	else if (appCtxt.multiAccounts && this._account != account) {
		this._account = account;
		this._resetSelectDiv();
	}
	this._emailListOffset = 0;

	var searchFor = this._searchInSelect ? this._searchInSelect.getValue() : ZmContactsApp.SEARCHFOR_CONTACTS;

	// reset column sorting preference
	this._chooser.sourceListView.setSortByAsc(ZmItem.F_NAME, true);

	// reset button states
	this._chooser.reset();
	if (buttonId) {
		this._chooser._setActiveButton(buttonId);
	}

	// populate target list if addrs were passed in
	if (addrs) {
		for (var id in addrs) {
			this._chooser.addItems(addrs[id], DwtChooserListView.TARGET, true, id);
		}
	}

	for (var fieldId in this._searchField) {
		var field = this._searchField[fieldId];
		field.disabled = false;
		field.value = (AjxUtil.isObject(str) ? str[fieldId] : str) || "";
	}

	// reset paging buttons
	this._prevButton.setEnabled(false);
	this._nextButton.setEnabled(false);

	this.search(null, true, true);

    DwtDialog.prototype.popup.call(this);

	this._resizeChooser();

    if ((this.getLocation().x < 0 ||  this.getLocation().y < 0) ){
                // parent window size is smaller than Dialog size
                this.setLocation(0,30);
                var size = Dwt.getWindowSize();
                var currentSize = this.getSize();
                var dragElement = document.getElementById(this._dragHandleId);
                DwtDraggable.setDragBoundaries(dragElement, 100 - currentSize.x, size.x - 100, 0, size.y - 100);
    }

	var focusField = this._searchField[ZmContactPicker.SEARCH_BASIC] || this._searchField[ZmContactPicker.SEARCH_NAME];
	appCtxt.getKeyboardMgr().grabFocus(focusField);

};


ZmContactPicker.prototype._resetResults =
function() {
	this._emailList.removeAll();
	this._serverContactOffset = 0;
	this._emailListOffset = 0;
};

/**
 * Closes the dialog.
 * 
 */
ZmContactPicker.prototype.popdown =
function() {
	// disable search field (hack to fix bleeding cursor)

	for (var fieldId in this._searchField) {
		this._searchField[fieldId].disabled = true;
	}

	this._contactSource = null;
	this._resetResults();

	DwtDialog.prototype.popdown.call(this);
};

/**
 * Performs a search.
 * 
 * @private
 */
ZmContactPicker.prototype.search =
function(colItem, ascending, firstTime, lastId, lastSortVal, offset) {
	if (offset == undefined) {
		//this could be a call from DwtChooserListView.prototype._sortColumn, which means we have to reset the result and both server and client pagination.
		//In any case the results should be reset or are already reset so doesn't hurt to reset.
		this._resetResults();
	}

	if (ascending === null || ascending === undefined) {
		ascending = this._ascending;
	}
	else {
		this._ascending = ascending;
	}
	
	var query;
	var queryHint = [];
	var emailQueryTerm = "";
	var phoneticQueryTerms = [];
	var nameQueryTerms = [];
	var conds = [];
	if (this._detailedSearch) {
		var nameQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_NAME);
		var emailQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_EMAIL);
		var deptQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_DEPT);
		var phoneticQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_PHONETIC);
		var isGal = this._searchInSelect && (this._searchInSelect.getValue() == ZmContactsApp.SEARCHFOR_GAL);
		if (nameQuery && !isGal) {
			var nameQueryPieces = nameQuery.split(/\s+/);
			for (var i = 0; i < nameQueryPieces.length; i++) {
				var nameQueryPiece = nameQueryPieces[i];
				nameQueryTerms.push("#"+ZmContact.F_firstName + ":" + nameQueryPiece);
				nameQueryTerms.push("#"+ZmContact.F_lastName + ":" + nameQueryPiece);
				nameQueryTerms.push("#"+ZmContact.F_middleName + ":" + nameQueryPiece);
				nameQueryTerms.push("#"+ZmContact.F_nickname + ":" + nameQueryPiece);
			}
			query = "(" + nameQueryTerms.join(" OR ") + ")";
		} else {
			if (nameQuery && isGal) {
				conds.push([{attr:ZmContact.F_firstName, op:"has", value: nameQuery},
				            {attr:ZmContact.F_lastName,  op:"has", value: nameQuery},
				            {attr:ZmContact.F_middleName, op:"has", value: nameQuery},
				            {attr:ZmContact.F_nickname,  op:"has", value: nameQuery},
				            {attr:ZmContact.F_phoneticFirstName, op:"has", value: nameQuery},
				            {attr:ZmContact.F_phoneticLastName,  op:"has", value: nameQuery}]);
			}
			query = "";
		}
		if (emailQuery) {
			if (isGal) {
				conds.push([{attr:ZmContact.F_email, op:"has", value: emailQuery},
				{attr:ZmContact.F_email2, op:"has", value: emailQuery},
				{attr:ZmContact.F_email3, op:"has", value: emailQuery},
				{attr:ZmContact.F_email4, op:"has", value: emailQuery},
				{attr:ZmContact.F_email5, op:"has", value: emailQuery},
				{attr:ZmContact.F_email6, op:"has", value: emailQuery},
				{attr:ZmContact.F_email7, op:"has", value: emailQuery},
				{attr:ZmContact.F_email8, op:"has", value: emailQuery},
				{attr:ZmContact.F_email9, op:"has", value: emailQuery},
				{attr:ZmContact.F_email10, op:"has", value: emailQuery},
				{attr:ZmContact.F_email11, op:"has", value: emailQuery},
				{attr:ZmContact.F_email12, op:"has", value: emailQuery},
				{attr:ZmContact.F_email13, op:"has", value: emailQuery},
				{attr:ZmContact.F_email14, op:"has", value: emailQuery},
				{attr:ZmContact.F_email15, op:"has", value: emailQuery},
				{attr:ZmContact.F_email16, op:"has", value: emailQuery}
				]);
			} else {
				emailQueryTerm = "to:"+emailQuery+"*";
			}
		}
		if (deptQuery && isGal) {
			conds.push({attr:ZmContact.F_department, op:"has", value: deptQuery});
		}
		if (phoneticQuery && !isGal) {
			var phoneticQueryPieces = phoneticQuery.split(/\s+/);
			for (var i=0; i<phoneticQueryPieces.length; i++) {
				phoneticQueryTerms.push("#"+ZmContact.F_phoneticFirstName + ":" + phoneticQueryPieces[i]);
				phoneticQueryTerms.push("#"+ZmContact.F_phoneticLastName + ":" + phoneticQueryPieces[i]);
			}
		}
	} else {
		query = this.getSearchFieldValue(ZmContactPicker.SEARCH_BASIC);
	}
	

	if (this._searchInSelect) {
		var searchFor = this._searchInSelect.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint.push(ZmSearchController.generateQueryForShares(ZmId.ITEM_CONTACT) || "is:local");
		} else if (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS) {
			queryHint.push("is:local");
		} else if (searchFor == ZmContactsApp.SEARCHFOR_GAL) {
            ascending = true;
        }
	} else {
		this._contactSource = appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (this._contactSource == ZmItem.CONTACT) {
			queryHint.push("is:local");
		}
	}

	if (this._contactSource == ZmItem.CONTACT && query != "" && !query.startsWith ("(")) {
		query = query.replace(/\"/g, '\\"');
		query = "\"" + query + "\"";
	}
	if (phoneticQueryTerms.length) {
		query = query + " (" + phoneticQueryTerms.join(" OR ") + ")";
	}
	if (emailQueryTerm.length) {
		query = query + " " + emailQueryTerm;  // MUST match email term, hence AND rather than OR
	}

	if (this._searchIcon) { //does not exist in ZmGroupView case
		this._searchIcon.className = "DwtWait16Icon";
	}

	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
	if (this._chooser) { //_chooser not defined in ZmGroupView but we also do not support sorting there anyway
		this._chooser.sourceListView.sortingEnabled = (this._contactSource == ZmItem.CONTACT);
	}

	var params = {
		obj:			this,
		ascending:		ascending,
		query:			query,
		queryHint:		queryHint.join(" "),
		conds:			conds,
		offset:			offset || 0,
		lastId:			lastId,
		lastSortVal:	lastSortVal,
		respCallback:	(new AjxCallback(this, this._handleResponseSearch, [firstTime])),
		errorCallback:	this._searchErrorCallback,
		accountName:	(this._account && this._account.name),
		expandDL:		true
	};
	ZmContactsHelper.search(params);
};

/**
 * @private
 */
ZmContactPicker.prototype._contentHtml =
function(account) {
	var showSelect;
	if (appCtxt.multiAccounts) {
		var list = appCtxt.accountList.visibleAccounts;
		for (var i = 0; i < list.length; i++) {
			var account = list[i];
			if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, account) &&
				(appCtxt.get(ZmSetting.GAL_ENABLED, null, account) ||
				 appCtxt.get(ZmSetting.SHARING_ENABLED, null, account)))
			{
				showSelect = true;
				break;
			}
		}
	} else {
		showSelect = (appCtxt.get(ZmSetting.CONTACTS_ENABLED) &&
					  (appCtxt.get(ZmSetting.GAL_ENABLED) ||
					   appCtxt.get(ZmSetting.SHARING_ENABLED)));
	}

	var subs = {
		id: this._htmlElId,
		showSelect: showSelect,
		detailed: this._detailedSearch
	};

	return (AjxTemplate.expand("abook.Contacts#ZmContactPicker", subs));
};

/**
 * @private
 */
ZmContactPicker.prototype._resetSelectDiv =
function() {
    this._searchInSelect.clearOptions();

    if (appCtxt.multiAccounts) {
        var accts = appCtxt.accountList.visibleAccounts;
        var org = ZmOrganizer.ITEM_ORGANIZER;
        org = ZmOrganizer.ITEM_ORGANIZER[ZmItem.CONTACT];

        for (var i = 0; i < accts.length; i++) {
            this._searchInSelect.addOption(accts[i].displayName, false, accts[i].id);
            var folderTree = appCtxt.getFolderTree(accts[i]);
            var data = [];
            data = data.concat(folderTree.getByType(org));
            for (var j = 0; j < data.length; j++) {
                var addrsbk = data[j];
                if(addrsbk.noSuchFolder) { continue; }
                this._searchInSelect.addOption(addrsbk.getName(), false, addrsbk.id, "ImgContact");
            }
            if(accts[i].isZimbraAccount && !accts[i].isMain) {
                if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)) {
                    if (appCtxt.get(ZmSetting.SHARING_ENABLED, null, this._account))
                        this._searchInSelect.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS, "ImgContact");
                }

                if (appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account)) {
                    this._searchInSelect.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL, "ImgContact");
                }

                if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL, null, this._account) ||
                        !appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account))
                {
                    this._searchInSelect.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
                }
            }
        }

        for (var k = 0; k < accts.length; k++) {
            this._searchInSelect.enableOption(accts[k].id, false);
        }
    } else {

        if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)) {
            this._searchInSelect.addOption(ZmMsg.contacts, false, ZmContactsApp.SEARCHFOR_CONTACTS);

            if (appCtxt.get(ZmSetting.SHARING_ENABLED, null, this._account))
                this._searchInSelect.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
        }

        if (appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account)) {
            this._searchInSelect.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
        }

        if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL, null, this._account) ||
                !appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account))
        {
            this._searchInSelect.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
        }

    }
};

ZmContactPicker.prototype.getSearchFieldValue =
function(fieldId) {
	if (!fieldId && !this._detailedSearch) {
		fieldId = ZmContactPicker.SEARCH_BASIC;
	}
	var field = this._searchField[fieldId];
	return field && AjxStringUtil.trim(field.value) || "";
};


ZmContactPicker.prototype._getDialogHeight =
function() {
	return ZmContactPicker.DIALOG_HEIGHT - (appCtxt.isChildWindow ? 100 : 0);
};

ZmContactPicker.prototype._getSectionHeight =
function(idSuffix) {
	return Dwt.getSize(document.getElementById(this._htmlElId + idSuffix)).y;

};

ZmContactPicker.prototype._resizeChooser =
function() {

	var chooserHeight = this._getDialogHeight()
			- this._getSectionHeight("_handle")  //the header
			- this._getSectionHeight("_searchTable")
			- this._getSectionHeight("_paging")
			- this._getSectionHeight("_buttons")
			- 30; //still need some magic to account for some margins etc.

	this._chooser.resize(this.getSize().x - 25, chooserHeight);
};

/**
 * called only when ZmContactPicker is first created. Sets up initial layout.
 * 
 * @private
 */
ZmContactPicker.prototype._initialize =
function(account) {

	// create static content and append to dialog parent
	this.setContent(this._contentHtml(account));

	this._searchIcon = document.getElementById(this._htmlElId + "_searchIcon");

	// add search button
	this._searchButton = new DwtButton({parent:this, parentElement:(this._htmlElId+"_searchButton")});
	this._searchButton.setText(ZmMsg.search);
	this._searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));

	// add select menu
	var selectCellId = this._htmlElId + "_listSelect";
	var selectCell = document.getElementById(selectCellId);
	if (selectCell) {
		this._searchInSelect = new DwtSelect({
			parent:         this,
			parentElement:  selectCellId,
			id:             Dwt.getNextId("ZmContactPickerSelect_"),
			legendId:       this._htmlElId + '_listSelectLbl'
		});
		this._resetSelectDiv();
		this._searchInSelect.addChangeListener(new AjxListener(this, this._searchTypeListener));
	} else {
		this.setSize("600");
	}

	// add chooser
	this._chooser = new ZmContactChooser({parent:this, buttonInfo:this._buttonInfo});
	this._chooser.reparentHtmlElement(this._htmlElId + "_chooser");

	// add paging buttons
	var pageListener = new AjxListener(this, this._pageListener);
	this._prevButton = new DwtButton({parent:this, parentElement:(this._htmlElId+"_pageLeft")});
	this._prevButton.setText(ZmMsg.previous);
	this._prevButton.setImage("LeftArrow");
	this._prevButton.addSelectionListener(pageListener);

	this._nextButton = new DwtButton({parent:this, style:DwtLabel.IMAGE_RIGHT, parentElement:(this._htmlElId+"_pageRight")});
	this._nextButton.setText(ZmMsg.next);
	this._nextButton.setImage("RightArrow");
	this._nextButton.addSelectionListener(pageListener);

	var pageContainer = document.getElementById(this._htmlElId + "_paging");
	if (pageContainer) {
		Dwt.setSize(pageContainer, this._chooser.sourceListView.getSize().x);
	}

	// init listeners
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));

	var fieldMap = {};
	var rowMap = {};
	this.mapFields(fieldMap, rowMap);

	this._searchField = {};
	for (var fieldId in fieldMap) {
		var field = Dwt.byId(fieldMap[fieldId]);
		if (field) {
			this._searchField[fieldId] = field;
			Dwt.setHandler(field, DwtEvent.ONKEYUP, ZmContactPicker._keyPressHdlr);
		}
	}

	this._searchRow = {};
	for (var rowId in rowMap) {
		var row = Dwt.byId(rowMap[rowId]);
		if (row) {
			this._searchRow[rowId] = row;
		}
	}
	this._updateSearchRows(this._searchInSelect && this._searchInSelect.getValue() || ZmContactsApp.SEARCHFOR_CONTACTS);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
    this.sharedContactGroups = [];

	//add tabgroups for keyboard navigation
	this._tabGroup = new DwtTabGroup(this.toString());
	this._tabGroup.removeAllMembers();
	for (var i = 0; i < ZmContactPicker.ALL.length; i++) {
		field = Dwt.byId(fieldMap[ZmContactPicker.ALL[i]]);
		if (Dwt.getVisible(field)) {
			this._tabGroup.addMember(field);
		}
	}
	this._tabGroup.addMember(this._searchButton);
	this._tabGroup.addMember(this._searchInSelect);
	this._tabGroup.addMember(this._chooser.getTabGroupMember());
	this._tabGroup.addMember(this._prevButton);
	this._tabGroup.addMember(this._nextButton);
	for (var i = 0; i < this._buttonList.length; i++) {
		this._tabGroup.addMember(this._button[this._buttonList[i]]);
	}
};

ZmContactPicker.prototype.mapFields =
function(fieldMap, rowMap) {
	if (this._detailedSearch) {
		fieldMap[ZmContactPicker.SEARCH_NAME] = this._htmlElId + "_searchNameField";
		fieldMap[ZmContactPicker.SEARCH_EMAIL] = this._htmlElId + "_searchEmailField";
		fieldMap[ZmContactPicker.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentField";
		fieldMap[ZmContactPicker.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticField";
		rowMap[ZmContactPicker.SEARCH_NAME] = this._htmlElId + "_searchNameRow";
		rowMap[ZmContactPicker.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticRow";
		rowMap[ZmContactPicker.SEARCH_EMAIL] = this._htmlElId + "_searchEmailRow";
		rowMap[ZmContactPicker.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentRow";
	}
	else {
		fieldMap[ZmContactPicker.SEARCH_BASIC] = this._htmlElId + "_searchField";
		rowMap[ZmContactPicker.SEARCH_BASIC] = this._htmlElId + "_searchRow";
	}
};		

// Listeners

/**
 * @private
 */
ZmContactPicker.prototype._searchButtonListener =
function(ev) {
	this._resetResults();
	this.search();
};

/**
 * @private
 */
ZmContactPicker.prototype._handleResponseSearch =
function(firstTime, result) {
	var resp = result.getResponse();
	var serverHasMore = resp.getAttribute("more");
	var serverPaginationSupported = resp.getAttribute("paginationSupported") !== false; //if it's not specified (such as the case of SearchResponse, i.e. not Gal) it IS supported.
	this._serverHasMoreAndPaginationSupported = serverHasMore && serverPaginationSupported;
	var offset = resp.getAttribute("offset");
	this._serverContactOffset = offset || 0;
	var info = resp.getAttribute("info");
	var expanded = info && info[0].wildcard[0].expanded == "0";

	//the check for firstTime is so when the picker is popped up we probably don't want to overwhelm them with a warning message. So only show it if the user plays with the picker, using the drop-down or the search box.
	if (!firstTime && !serverPaginationSupported && (serverHasMore || expanded)) { //no idea what the expanded case is
		var d = appCtxt.getMsgDialog();
		d.setMessage(ZmMsg.errorSearchNotExpanded);
		d.popup();
		if (expanded) { return; }
	}

	// this method will expand the list depending on the number of email
	// addresses per contact.
	var emailArray = ZmContactsHelper._processSearchResponse(resp, this._includeContactsWithNoEmail); //this._includeContactsWithNoEmail - true in the ZmGroupView case 
	var emailList = AjxVector.fromArray(emailArray);

	if (serverPaginationSupported) {
		this._emailList.addList(emailArray); //this internally calls concat. we do not need "merge" here because we use the _serverContactOffset as a marker of where to search next, never searching a block we already did.
	}
	else {
		this._emailList = emailList;
	}
    var list = this.getSubList();
    if (this.toString() === "ZmContactPicker") {
        list = this.loadSharedGroupContacts(list) || list;
    }
	this._showResults(list);

};

ZmContactPicker.prototype._showResults =
function(aList) {
    var list = aList || this.getSubList();
	// special case 1 - search forward another server block, to fill up a page. Could search several times.
	if (list.size() < ZmContactsApp.SEARCHFOR_MAX && this._serverHasMoreAndPaginationSupported) {
		this.search(null, null, null, null, null, this._serverContactOffset + ZmContactsApp.SEARCHFOR_MAX); //search another page
		return;
	}

	if (this._searchIcon) { //does not exist in ZmGroupView case
		this._searchIcon.className = "";
	}
	this._searchButton.setEnabled(true);

	// special case 2 - no results, and no more to search (that was covered in special case 1) - so display the "no results" text.
	if (list.size() == 0 && this._emailListOffset == 0) {
		this._setResultsInView(list); //empty the list
		this._nextButton.setEnabled(false);
		this._prevButton.setEnabled(false);
		this._setNoResultsHtml();
		return;
	}

	// special case 3 - If the AB ends with a long list of contacts w/o addresses,
	// we may get an empty list.  If that's the case, roll back the offset
	// not 100% sure this case could still happen after all my changes but it was there in the code, so I keep it just in case.
	if (list.size() == 0) {
		this._emailListOffset -= ZmContactsApp.SEARCHFOR_MAX;
		this._emailListOffset  = Math.max(0, this._emailListOffset);
	}

	var more = this._serverHasMoreAndPaginationSupported  //we can get more from the server
				|| (this._emailListOffset + ZmContactsApp.SEARCHFOR_MAX) < this._emailList.size(); //or we have more on the client we didn't yet show
	this._prevButton.setEnabled(this._emailListOffset > 0);
	this._nextButton.setEnabled(more);

	this._resetSearchColHeaders(); // bug #2269 - enable/disable sort column per type of search
	this._setResultsInView(list);
};

ZmContactPicker.prototype.loadSharedGroupContacts =
    function(aList) {

    var listLen,
        listArray,
        contact,
        item,
        i,
        j,
        k,
        sharedContactGroupArray,
        len1,
        jsonObj,
        batchRequest,
        request,
        response;

        listArray = aList.getArray();
        listLen = aList.size();
        sharedContactGroupArray = [];

    for (i = 0 ; i < listLen; i++) {
        item = listArray[i];
        contact = item.__contact;
        if (contact.isGroup() && contact.isShared()) {
            if (this.sharedContactGroups.indexOf(item.value) !== -1) {
                return;
            }
            this.sharedContactGroups.push(item.value);
            sharedContactGroupArray.push(item.value);
        }
    }

    len1 = sharedContactGroupArray.length;
    jsonObj = {BatchRequest:{GetContactsRequest:[],_jsns:"urn:zimbra", onerror:'continue'}};
    batchRequest = jsonObj.BatchRequest;
    request = batchRequest.GetContactsRequest;

    for (j = 0,k =0; j < len1; j++) {
        request.push({ cn: {id: sharedContactGroupArray[j]}, _jsns: 'urn:zimbraMail', derefGroupMember: '1', returnCertInfo: '1', requestId: k++ }); //See ZCS-999 and ZCS-991 for returnCertInfo param
    }
        var respCallback = new AjxCallback(this, this.handleSharedContactResponse,[aList]);
       response =  appCtxt.getAppController().sendRequest({
            jsonObj:jsonObj,
            asyncMode:true,
            callback:respCallback
        });
   };

ZmContactPicker.prototype.handleSharedContactResponse =
    function(aList,response) {

     var contactResponse,
         contactResponseLength,
         listArray,
         listArrayLength,
         sharedGroupMembers,
         i,
         j,
         k,
         resp,
         contact,
         member,
         isGal,
         memberContact,
         loadMember,
         listArrElement,
         sharedGroupMembers;

        if (response && response.getResponse() && response.getResponse().BatchResponse) {
            contactResponse = response.getResponse().BatchResponse.GetContactsResponse;
        }
        if (!contactResponse) {
            return;
        }
        contactResponseLength = contactResponse.length;
        listArray = aList.getArray();
        listArrayLength = aList.size();

        for (k= 0; k < listArrayLength; k++) {
            sharedGroupMembers = [];
            for (j = 0; j < contactResponseLength; j++) {
                resp = contactResponse[j];
                contact = resp.cn[0];

                if (contact.m) {
                    for (i = 0; i < contact.m.length; i++) {
                        member = contact.m[i];
                        isGal = false;
                        if (member.type == ZmContact.GROUP_GAL_REF) {
                            isGal = true;
                        }
                        if (member.cn && member.cn.length > 0) {
                            memberContact = member.cn[0];
                            memberContact.ref = memberContact.ref || (isGal && member.value);
                            loadMember = ZmContact.createFromDom(memberContact, {list: this.list, isGal: isGal});
                            loadMember.isDL = isGal && loadMember.attr[ZmContact.F_type] === "group";
                            appCtxt.cacheSet(member.value, loadMember);
                            listArrElement = listArray[k];
                            if (listArrElement.value === contact.id) {
                                sharedGroupMembers.push( '"'+loadMember.getFullName()+'"' +' <' + loadMember.getEmails() +'>;' ); // Updating the original list with shared members of shared contact group that comes in 'contactResponse'.
                                aList._array[k].address = sharedGroupMembers.join("");
                            }
                        }
                    }
                    ZmContact.prototype._loadFromDom(contact);
                }
            }
        }
        this._showResults(aList); // As async = true, when the response has come, again we render/update the  list with  contactResponse shared contact members,
    };


/**
 * extracted this so it can be used in ZmGroupView where this is different.
 * @param list
 */
ZmContactPicker.prototype._setResultsInView =
function(list) {
	this._chooser.setItems(list);
};

/**
 * extracted this so it can be used in ZmGroupView where this is different.
 * @param list
 */
ZmContactPicker.prototype._setNoResultsHtml =
function(list) {
	this._chooser.sourceListView._setNoResultsHtml();
};


ZmContactPicker.prototype._updateSearchRows =
function(searchFor) {
	var fieldIds = (searchFor == ZmContactsApp.SEARCHFOR_GAL) ? ZmContactPicker.SHOW_ON_GAL : ZmContactPicker.SHOW_ON_NONGAL;
	for (var fieldId in this._searchRow) {
		Dwt.setVisible(this._searchRow[fieldId], AjxUtil.indexOf(fieldIds, fieldId)!=-1);
	}
	for (var fieldId in this._searchField) {
		var field = this._searchField[fieldId];
		if (this._tabGroup.contains(field))
			this._tabGroup.removeMember(field);
	}
	for (var i=0; i<fieldIds.length; i++) {
		this._tabGroup.addMember(this._searchField[fieldIds[i]]);
	}

	this._resizeChooser();
};

/**
 * @private
 */
ZmContactPicker.prototype._handleErrorSearch =
function() {
	this._searchButton.setEnabled(true);
	return false;
};

/**
 * @private
 */
ZmContactPicker.prototype._pageListener =
function(ev) {
	if (ev.item == this._prevButton) {
		this._emailListOffset -= ZmContactsApp.SEARCHFOR_MAX;
		this._emailListOffset  = Math.max(0, this._emailListOffset);
	}
	else {
		this._emailListOffset += ZmContactsApp.SEARCHFOR_MAX;
	}
	this._showResults();
};

/**
 * Gets a sub-list of contacts.
 * 
 * @return	{AjxVector}		a vector of {ZmContact} objects
 */
ZmContactPicker.prototype.getSubList =
function() {
	var size = this._emailList.size();

	var end = this._emailListOffset + ZmContactsApp.SEARCHFOR_MAX;

	if (end > size) {
		end = size;
	}

	var a = (this._emailListOffset < end) ? this._emailList.getArray().slice(this._emailListOffset, end) : [];
	return AjxVector.fromArray(a);
};

/**
 * @private
 */
ZmContactPicker.prototype._searchTypeListener =
function(ev) {
	var oldValue = ev._args.oldValue;
	var newValue = ev._args.newValue;

	if (oldValue != newValue) {
		this._updateSearchRows(newValue);
		this._searchButtonListener();
	}
};

/**
 * @private
 */
ZmContactPicker.prototype._resetSearchColHeaders =
function () {
    var slv = this._chooser.sourceListView;
    var tlv = this._chooser.targetListView;
    slv.headerColCreated = false;
    tlv.headerColCreated = false;
    var isGal = this._searchInSelect && (this._searchInSelect.getValue() == ZmContactsApp.SEARCHFOR_GAL);

    // find the participant column
    var part = 0;
    for (var i = 0; i < slv._headerList.length; i++) {
        var field = slv._headerList[i]._field;
        if (field == ZmItem.F_NAME) {
            part = i;
        }
        if (field == ZmItem.F_DEPARTMENT) {
            slv._headerList[i]._visible = isGal && this._detailedSearch;
        }
    }

    var sortable = isGal ? null : ZmItem.F_NAME;
    slv._headerList[part]._sortable = sortable;
    slv.createHeaderHtml(sortable);

    for (i = 0; i < tlv._headerList.length; i++) {
        if (tlv._headerList[i]._field == ZmItem.F_DEPARTMENT) {
            tlv._headerList[i]._visible = isGal && this._detailedSearch;
        }
    }
    tlv.createHeaderHtml();
};

/**
 * Done choosing addresses, add them to the compose form.
 * 
 * @private
 */
ZmContactPicker.prototype._okButtonListener =
function(ev) {
	var data = this._chooser.getItems();
	DwtDialog.prototype._buttonListener.call(this, ev, [data]);
};

/**
 * Call custom popdown method.
 * 
 * @private
 */
ZmContactPicker.prototype._cancelButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev);
	this.popdown();
};

/**
 * @private
 */
ZmContactPicker._keyPressHdlr =
function(ev) {
	var stb = DwtControl.getTargetControl(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
		return false;
	}
	return true;
};


/***********************************************************************************/

/**
 * Creates a contact chooser.
 * @class
 * This class creates a specialized chooser for the contact picker.
 *
 * @param {DwtComposite}	parent			the contact picker
 * @param {Array}		buttonInfo		transfer button IDs and labels
 * 
 * @extends		DwtChooser
 * 
 * @private
 */
ZmContactChooser = function(params) {
	DwtChooser.call(this, params);
};

ZmContactChooser.prototype = new DwtChooser;
ZmContactChooser.prototype.constructor = ZmContactChooser;

/**
 * @private
 */
ZmContactChooser.prototype._createSourceListView =
function() {
	return new ZmContactChooserSourceListView(this);
};

/**
 * @private
 */
ZmContactChooser.prototype._createTargetListView =
function() {
	return new ZmContactChooserTargetListView(this, (this._buttonInfo.length > 1));
};

/**
 * The item is a AjxEmailAddress. Its address is used for comparison.
 *
 * @param {AjxEmailAddress}	item	an email address
 * @param {AjxVector}	list	list to check in
 * 
 * @private
 */
ZmContactChooser.prototype._isDuplicate =
function(item, list) {
	return list.containsLike(item, item.getAddress);
};

/***********************************************************************************/

/**
 * Creates a source list view.
 * @class
 * This class creates a specialized source list view for the contact chooser.
 * 
 * @param {DwtComposite}	parent			the contact picker
 * 
 * @extends		DwtChooserListView
 * 
 * @private
 */
ZmContactChooserSourceListView = function(parent) {
	DwtChooserListView.call(this, {parent:parent, type:DwtChooserListView.SOURCE});
	this.setScrollStyle(Dwt.CLIP);
};

ZmContactChooserSourceListView.prototype = new DwtChooserListView;
ZmContactChooserSourceListView.prototype.constructor = ZmContactChooserSourceListView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 * @private
 */
ZmContactChooserSourceListView.prototype.toString =
function() {
	return "ZmContactChooserSourceListView";
};

ZmContactChooserSourceListView.prototype.getToolTipContent =
function(ev) {
	
	if (this._hoveredItem) {
		var ttParams = {
			address:		this._hoveredItem.address,
			contact:		this._hoveredItem.__contact,
			ev:				ev,
			noRightClick:	true
		};
		var ttCallback = new AjxCallback(this,
			function(callback) {
				appCtxt.getToolTipMgr().getToolTip(ZmToolTipMgr.PERSON, ttParams, callback);
			});
		return {callback:ttCallback};
	}
	else {
		return "";
	}
};

/**
 * @private
 */
ZmContactChooserSourceListView.prototype._getHeaderList =
function() {
	var headerList = [];
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_TYPE, icon:"Folder", width:ZmMsg.COLUMN_WIDTH_FOLDER_CN}));
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg._name, width:ZmMsg.COLUMN_WIDTH_NAME_CN, resizeable: true}));
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_DEPARTMENT, text:ZmMsg.department, width:ZmMsg.COLUMN_WIDTH_DEPARTMENT_CN, resizeable: true}));
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.email, resizeable: true}));


	return headerList;
};

 
// Override of DwtListView.prototype._resetColWidth to set width; without overrriding causes vertical scrollbars to disapper
// on header resize
ZmContactChooserSourceListView.prototype._resetColWidth =
function() {

	if (!this.headerColCreated) { return; }

	var lastColIdx = this._getLastColumnIndex();
    if (lastColIdx) {
        var lastCol = this._headerList[lastColIdx];
        var lastCell = document.getElementById(lastCol._id);
		if (lastCell) {
			var div = lastCell.firstChild;
			lastCell.style.width = div.style.width = (lastCol._width || ""); 
		}
    }
};

/**
 * override for scrollbars in IE
 * @param headerIdx
 */
ZmContactChooserSourceListView.prototype._calcRelativeWidth =
function(headerIdx) {
	var column = this._headerList[headerIdx];
	if (!column._width || (column._width && column._width == "auto")) {
		var cell = document.getElementById(column._id);
		// UGH: clientWidth is 5px more than HTML-width (20px for IE to deal with scrollbars)
		return (cell) ? (cell.clientWidth - (AjxEnv.isIE ? Dwt.SCROLLBAR_WIDTH : 5)) : null;
	}
	return column._width;
};

/**
 * @private
 */
ZmContactChooserSourceListView.prototype._mouseOverAction =
function(ev, div) {
	DwtChooserListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	var item = this.getItemFromElement(div);
	this._hoveredItem = (id && item) ? item : null;
	return true;
};

/**
 * @private
 */
ZmContactChooserSourceListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_EMAIL && AjxEnv.isIE) {
		var maxWidth = AjxStringUtil.getWidth(item.address);
		html[idx++] = "<div style='float; left; overflow: visible; width: " + maxWidth + ";'>";
		idx = ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
		html[idx++] = "</div>";		
	}
	else {
		idx = ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
	}
	return idx;
};

/**
 * Returns a string of any extra attributes to be used for the TD.
 *
 * @param item		[object]	item to render
 * @param field		[constant]	column identifier
 * @param params	[hash]*		hash of optional params
 * 
 * @private
 */
ZmContactChooserSourceListView.prototype._getCellAttrText =
function(item, field, params) {
	if (field == ZmItem.F_EMAIL) {
		return "style='position: relative; overflow: visible;'";
	}
};

/***********************************************************************************/

/**
 * Creates the target list view.
 * @class
 * This class creates a specialized target list view for the contact chooser.
 * 
 * @param {DwtComposite}	parent			the contact picker
 * @param {constant}		showType		the show type
 * @extends		DwtChooserListView
 * 
 * @private
 */
ZmContactChooserTargetListView = function(parent, showType) {
	this._showType = showType; // call before base class since base calls getHeaderList

	DwtChooserListView.call(this, {parent:parent, type:DwtChooserListView.TARGET});

	this.setScrollStyle(Dwt.CLIP);
};

ZmContactChooserTargetListView.prototype = new DwtChooserListView;
ZmContactChooserTargetListView.prototype.constructor = ZmContactChooserTargetListView;

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactChooserTargetListView.prototype.toString =
function() {
	return "ZmContactChooserTargetListView";
};

/**
 * @private
 */
ZmContactChooserTargetListView.prototype._getHeaderList =
function() {
	var headerList = [];
	var view = this._view;
	if (this._showType) {
		headerList.push(new DwtListHeaderItem({field:ZmItem.F_TYPE, icon:"ContactsPicker", width:ZmMsg.COLUMN_WIDTH_TYPE_CN}));
	}
	headerList.push(new DwtListHeaderItem({field:ZmItem.F_NAME, text:ZmMsg._name, width:ZmMsg.COLUMN_WIDTH_NAME_CN, resizeable: true}));
    headerList.push(new DwtListHeaderItem({field:ZmItem.F_DEPARTMENT, text:ZmMsg.department, width:ZmMsg.COLUMN_WIDTH_DEPARTMENT_CN, resizeable: true}));
    headerList.push(new DwtListHeaderItem({field:ZmItem.F_EMAIL, text:ZmMsg.email, resizeable: true}));

	return headerList;
};

ZmContactChooserTargetListView.prototype._mouseOverAction =
ZmContactChooserSourceListView.prototype._mouseOverAction;

/**
 * The items are AjxEmailAddress objects.
 * 
 * @private
 */
ZmContactChooserTargetListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	if (field == ZmItem.F_TYPE) {
		item.setType(item._buttonId);
		html[idx++] = ZmMsg[item.getTypeAsString()];
		html[idx++] = ":";
	}
	else if (field == ZmItem.F_EMAIL && AjxEnv.isIE) {
		var maxWidth = AjxStringUtil.getWidth(item.address) + 10;
		html[idx++] = "<div style='float; left;  width: " + maxWidth + ";'>";
		idx = ZmContactsHelper._getEmailField(html, idx, item, field, colIdx, params);
		html[idx++] = "</div>";
	}
	else {
		idx = ZmContactsHelper._getEmailField(html, idx, item, field, colIdx);
	}
	return idx;
};


// Override of DwtListView.prototype._resetColWidth to set width; without overrriding causes vertical scrollbars to disapper
// on header resize
ZmContactChooserTargetListView.prototype._resetColWidth =
function() {

	if (!this.headerColCreated) { return; }

	var lastColIdx = this._getLastColumnIndex();

	
    if (lastColIdx) {
        var lastCol = this._headerList[lastColIdx];
        var lastCell = document.getElementById(lastCol._id);
		if (lastCell) {
			var div = lastCell.firstChild;
			lastCell.style.width = div.style.width = (lastCol._width || "");
		}
    }
};

/**
 * override for scrollbars in IE
 * @param headerIdx
 */
ZmContactChooserTargetListView.prototype._calcRelativeWidth =
function(headerIdx) {
	var column = this._headerList[headerIdx];
	if (!column._width || (column._width && column._width == "auto")) {
		var cell = document.getElementById(column._id);
		// UGH: clientWidth is 5px more than HTML-width (20px for IE to deal with scrollbars)
		return (cell) ? (cell.clientWidth - (AjxEnv.isIE ? Dwt.SCROLLBAR_WIDTH : 5)) : null;
	}
	return column._width;
};

/**
 * Returns a string of any extra attributes to be used for the TD.
 *
 * @param item		[object]	item to render
 * @param field		[constant]	column identifier
 * @param params	[hash]*		hash of optional params
 * 
 * @private
 */
ZmContactChooserTargetListView.prototype._getCellAttrText =
function(item, field, params) {
	if (field == ZmItem.F_EMAIL) {
		return "style='position: relative; overflow: visible;'";
	}
};
