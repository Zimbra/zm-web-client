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
	this._offset = 0;
	this._defaultQuery = ".";
	this._list = new AjxVector();
	this._detailed = appCtxt.get(ZmSetting.DETAILED_CONTACT_SEARCH_ENABLED);
	this._searchCleared = {};

	this._searchErrorCallback = new AjxCallback(this, this._handleErrorSearch);
};

ZmContactPicker.prototype = new DwtDialog;
ZmContactPicker.prototype.constructor = ZmContactPicker;

// Consts

ZmContactPicker.CHOOSER_HEIGHT = 300;

ZmContactPicker.SEARCH_BASIC = "search";
ZmContactPicker.SEARCH_NAME = "name";
ZmContactPicker.SEARCH_EMAIL = "email";
ZmContactPicker.SEARCH_DEPT = "dept";
ZmContactPicker.SEARCH_PHONETIC = "phonetic";

ZmContactPicker.HINT = {};
ZmContactPicker.HINT[ZmContactPicker.SEARCH_BASIC] = ZmMsg.contactPickerHint;
ZmContactPicker.HINT[ZmContactPicker.SEARCH_NAME] = ZmMsg.contactPickerHint;
ZmContactPicker.HINT[ZmContactPicker.SEARCH_EMAIL] = ZmMsg.contactPickerEmailHint;
ZmContactPicker.HINT[ZmContactPicker.SEARCH_DEPT] = ZmMsg.contactPickerDepartmentHint;
ZmContactPicker.HINT[ZmContactPicker.SEARCH_PHONETIC] = ZmMsg.contactPickerPhoneticHint;

ZmContactPicker.SHOW_ON_GAL = [ZmContactPicker.SEARCH_BASIC, ZmContactPicker.SEARCH_NAME, ZmContactPicker.SEARCH_EMAIL, ZmContactPicker.SEARCH_DEPT];
ZmContactPicker.SHOW_ON_NONGAL = [ZmContactPicker.SEARCH_BASIC, ZmContactPicker.SEARCH_NAME, ZmContactPicker.SEARCH_PHONETIC, ZmContactPicker.SEARCH_EMAIL];
	

// Public methods

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmContactPicker.prototype.toString =
function() {
	return "ZmContactPicker";
};

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
	this._offset = 0;

	var searchFor = this._selectDiv ? this._selectDiv.getValue() : ZmContactsApp.SEARCHFOR_CONTACTS;

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
		if (str) {
			field.className = "";
			field.value = AjxUtil.isObject(str) ? (str[fieldId] || "") : str;
			this._searchCleared[fieldId] = true;
		} else {
			field.className = "searchFieldHint";
			field.value = ZmContactPicker.HINT[fieldId];
			this._searchCleared[fieldId] = false;
		}
	}
	var focusField = this._searchField[ZmContactPicker.SEARCH_BASIC] || this._searchField[ZmContactPicker.SEARCH_NAME];
	focusField.focus();

	// reset paging buttons
	this._prevButton.setEnabled(false);
	this._nextButton.setEnabled(false);

	this.search(null, null, true);

	DwtDialog.prototype.popup.call(this);
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
	this._list.removeAll();

	DwtDialog.prototype.popdown.call(this);
};

/**
 * Performs a search.
 * 
 * @private
 */
ZmContactPicker.prototype.search =
function(colItem, ascending, firstTime, lastId, lastSortVal) {
	if (!AjxUtil.isSpecified(ascending)) {
		ascending = true;
	}

	var query;
	var queryHint = [];
	var conds = [];
	if (this._detailed) {
		var nameQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_NAME);
		var emailQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_EMAIL);
		var deptQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_DEPT);
		var phoneticQuery = this.getSearchFieldValue(ZmContactPicker.SEARCH_PHONETIC);
		var isGal = this._selectDiv && (this._selectDiv.getValue() == ZmContactsApp.SEARCHFOR_GAL);
		query = nameQuery || "";
		if (emailQuery) {
			if (isGal) {
				conds.push([{attr:ZmContact.F_email, op:"has", value: emailQuery},
				{attr:ZmContact.F_email2, op:"has", value: emailQuery},
				{attr:ZmContact.F_email3, op:"has", value: emailQuery}]);
			} else {
				queryHint.push("to:"+emailQuery+"*");
			}
		}
		if (deptQuery && isGal) {
			conds.push({attr:ZmContact.F_department, op:"has", value: deptQuery});
		}
		if (phoneticQuery && !isGal) {
			var condArr = [];
			var phoneticQueryPieces = phoneticQuery.split(/\s+/);
			for (var i=0; i<phoneticQueryPieces.length; i++) {
				condArr.push("#"+ZmContact.F_phoneticFirstName + ":" + phoneticQueryPieces[i]);
				condArr.push("#"+ZmContact.F_phoneticLastName + ":" + phoneticQueryPieces[i]);
			}
			queryHint.push(condArr.join(" || "));
		}
	} else {
		query = this.getSearchFieldValue(ZmContactPicker.SEARCH_BASIC);
	}
	

	if (this._selectDiv) {
		var searchFor = this._selectDiv.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmId.SEARCH_GAL;

		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint.push(ZmSearchController.generateQueryForShares([ZmId.ITEM_CONTACT]) || "is:local");
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
    
    if (!query.length && this._contactSource == ZmId.SEARCH_GAL) {
		query = this._defaultQuery;
	}

    if (this._contactSource == ZmItem.CONTACT && query != "") {
        query = query.replace(/\"/g, '\\"');
        query = "\"" + query + "\"";
    }

	this._searchIcon.className = "DwtWait16Icon";

	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
	this._chooser.sourceListView.sortingEnabled = (this._contactSource == ZmItem.CONTACT);

	var params = {
		obj:			this,
		ascending:		ascending,
		query:			query,
		queryHint:		queryHint.join(" "),
		conds:			conds,
		offset:			this._list.size(),
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
		detailed: this._detailed
	};

	return (AjxTemplate.expand("abook.Contacts#ZmContactPicker", subs));
};

/**
 * @private
 */
ZmContactPicker.prototype._resetSelectDiv =
function() {
    this._selectDiv.clearOptions();

    if (appCtxt.multiAccounts) {
        var accts = appCtxt.accountList.visibleAccounts;
        var org = ZmOrganizer.ITEM_ORGANIZER;
        org = ZmOrganizer.ITEM_ORGANIZER[ZmItem.CONTACT];

        for (var i = 0; i < accts.length; i++) {
            this._selectDiv.addOption(accts[i].displayName, false, accts[i].id);
            var folderTree = appCtxt.getFolderTree(accts[i]);
            var data = [];
            data = data.concat(folderTree.getByType(org));
            for (var j = 0; j < data.length; j++) {
                var addrsbk = data[j];
                if(addrsbk.noSuchFolder) { continue; }
                this._selectDiv.addOption(addrsbk.getName(), false, addrsbk.id, "ImgContact");
            }
            if(accts[i].isZimbraAccount && !accts[i].isMain) {
                if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)) {
                    if (appCtxt.get(ZmSetting.SHARING_ENABLED, null, this._account))
                        this._selectDiv.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS, "ImgContact");
                }

                if (appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account)) {
                    this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL, "ImgContact");
                }

                if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL, null, this._account) ||
                        !appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account))
                {
                    this._selectDiv.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
                }
            }
        }

        for (var k = 0; k < accts.length; k++) {
            this._selectDiv.enableOption(accts[k].id, false);
        }
    } else {

        if (appCtxt.get(ZmSetting.CONTACTS_ENABLED, null, this._account)) {
            this._selectDiv.addOption(ZmMsg.contacts, false, ZmContactsApp.SEARCHFOR_CONTACTS);

            if (appCtxt.get(ZmSetting.SHARING_ENABLED, null, this._account))
                this._selectDiv.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
        }

        if (appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account)) {
            this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
        }

        if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL, null, this._account) ||
                !appCtxt.get(ZmSetting.GAL_ENABLED, null, this._account))
        {
            this._selectDiv.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
        }

    }
};

ZmContactPicker.prototype.clearSearch =
function(el) {
	if (el) {
		for (var fieldId in this._searchField) {
			if (el == this._searchField[fieldId]) {
				if (!this._searchCleared[fieldId]) {
					el.className = el.value = "";
					this._searchCleared[fieldId] = true;
				}
				break;
			}
		}
	}
};

ZmContactPicker.prototype.getSearchFieldValue =
function(fieldId) {
	if (!fieldId && !this._detailed)
		fieldId = ZmContactPicker.SEARCH_BASIC;
	var field = this._searchField[fieldId];
	return (this._searchCleared[fieldId] && field) ? AjxStringUtil.trim(field.value) : "";
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
		this._selectDiv = new DwtSelect({parent:this, parentElement:selectCellId, id: Dwt.getNextId("ZmContactPickerSelect_")});
		this._resetSelectDiv();
		this._selectDiv.addChangeListener(new AjxListener(this, this._searchTypeListener));
	} else {
		this.setSize("600");
	}

	// add chooser
	this._chooser = new ZmContactChooser({parent:this, buttonInfo:this._buttonInfo});
	this._chooser.reparentHtmlElement(this._htmlElId + "_chooser");
	this._chooser.resize(this.getSize().x-25, ZmContactPicker.CHOOSER_HEIGHT);

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

	this._searchField = {};
	this._searchRow = {};
	var fieldMap = {}, field, rowMap = {};
	if (this._detailed) {
		fieldMap[ZmContactPicker.SEARCH_NAME] = this._htmlElId + "_searchNameField";
		fieldMap[ZmContactPicker.SEARCH_EMAIL] = this._htmlElId + "_searchEmailField";
		fieldMap[ZmContactPicker.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentField";
		fieldMap[ZmContactPicker.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticField";
		rowMap[ZmContactPicker.SEARCH_NAME] = this._htmlElId + "_searchNameRow";
		rowMap[ZmContactPicker.SEARCH_PHONETIC] = this._htmlElId + "_searchPhoneticRow";
		rowMap[ZmContactPicker.SEARCH_EMAIL] = this._htmlElId + "_searchEmailRow";
		rowMap[ZmContactPicker.SEARCH_DEPT] = this._htmlElId + "_searchDepartmentRow";
	} else {
		fieldMap[ZmContactPicker.SEARCH_BASIC] = this._htmlElId + "_searchField";
		rowMap[ZmContactPicker.SEARCH_BASIC] = this._htmlElId + "_searchRow";
	}
	for (var fieldId in fieldMap) {
		field = Dwt.byId(fieldMap[fieldId]);
		if (field) {
			this._searchField[fieldId] = field;
			Dwt.setHandler(field, DwtEvent.ONKEYUP, ZmContactPicker._keyPressHdlr);
			Dwt.setHandler(field, DwtEvent.ONCLICK, ZmContactPicker._onclickHdlr);
		}
	}
	for (var rowId in rowMap) {
		row = Dwt.byId(rowMap[rowId]);
		if (row) {
			this._searchRow[rowId] = row;
		}
	}
	this._updateSearchRows(this._selectDiv && this._selectDiv.getValue() || ZmContactsApp.SEARCHFOR_CONTACTS);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
};

// Listeners

/**
 * @private
 */
ZmContactPicker.prototype._searchButtonListener =
function(ev) {
	this._offset = 0;
	this._list.removeAll();
	this.search();
};

/**
 * @private
 */
ZmContactPicker.prototype._handleResponseSearch =
function(firstTime, result) {
	var resp = result.getResponse();
	var more = resp.getAttribute("more");
	var offset = resp.getAttribute("offset");
	var isPagingSupported = AjxUtil.isSpecified(offset);
	var info = resp.getAttribute("info");
	var expanded = info && info[0].wildcard[0].expanded == "0";

	if (!firstTime && !isPagingSupported &&
		(expanded || (this._contactSource == ZmId.SEARCH_GAL && more)))
	{
		var d = appCtxt.getMsgDialog();
		d.setMessage(ZmMsg.errorSearchNotExpanded);
		d.popup();
		if (expanded) { return; }
	}

	// this method will expand the list depending on the number of email
	// addresses per contact.
	var list = AjxVector.fromArray(ZmContactsHelper._processSearchResponse(resp));

	if (isPagingSupported) {
		this._list.merge(offset, list);
		this._list.hasMore = more;
	} else {
		this._list = list;
	}

	if (list.size() == 0 && firstTime) {
		this._chooser.sourceListView._setNoResultsHtml();
	}

	// if we don't get a full number of addresses in the results, repeat the search.
	// Could search several times.
	if (((this._list.size() - this._offset) < ZmContactsApp.SEARCHFOR_MAX) && more) {
		// We want to base our search off the ID of the last contact in the response,
		// NOT the last contact with an email address
		var vec = resp.getResults(ZmItem.CONTACT);

		var email = (vec.size() > 0) ? vec.getVector().getLast() : null;
		if (email) {
			if (email.__contact) {
				lastId = email.__contact.id;
				lastSortVal = email.__contact.sf;
			} else {
				lastId = email.id;
				lastSortVal = email.sf;
			}
		}
        if (!lastSortVal && isPagingSupported) {
			// BAIL. Server didn't send us enough info to make the next request
			this._searchIcon.className = "ImgSearch";
			return;
		}
        else if (!lastSortVal && !isPagingSupported) {
            //paging not supported, show what we have
            this._showResults(isPagingSupported, more, this.getSubList());
        }
        else {
            this.search(null, null, null, lastId, lastSortVal);
        }
	}
	else {
		list = this.getSubList();
		// If the AB ends with a long list of contacts w/o addresses,
		// we may never get a list back.  If that's the case, roll back the offset
		// and refetch, should disable the "next page" button.
		if (!list) {
			this._offset -= ZmContactsApp.SEARCHFOR_MAX;
			if (this._offset < 0) {
				this._offset = 0;
			}
			list = this.getSubList();
		}
		if (!more) {
			more = (this._offset+ZmContactsApp.SEARCHFOR_MAX) < this._list.size();
		}
		this._showResults(isPagingSupported, more, list);
	}

};

ZmContactPicker.prototype._showResults =
function(isPagingSupported, more, list) {
	// if offset is returned, then this account support gal paging
	if (this._contactSource == ZmId.SEARCH_GAL && !isPagingSupported) {
		this._prevButton.setEnabled(false);
		this._nextButton.setEnabled(false);
	} else {
		this._prevButton.setEnabled(this._offset > 0);
		this._nextButton.setEnabled(more);
	}

	this._resetColHeaders(); // bug #2269 - enable/disable sort column per type of search
	this._chooser.setItems(list);

	this._searchIcon.className = "ImgSearch";
	this._searchButton.setEnabled(true);
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
		this._offset -= ZmContactsApp.SEARCHFOR_MAX;
		if (this._offset < 0) {
			this._offset = 0;
		}
		this._showResults(true, true, this.getSubList()); // show cached results
	}
	else {
		var lastId;
		var lastSortVal;
		this._offset += ZmContactsApp.SEARCHFOR_MAX;
		var list = this.getSubList();
		if (!list || ((list.size() < ZmContactsApp.SEARCHFOR_MAX) && this._list.hasMore)) {
			if (!list) {
				list = this._chooser.sourceListView.getList();
			}
			var email = (list.size() > 0) ? list.getLast() : null;
			if (email) {
				lastId = email.__contact.id;
				lastSortVal = email.__contact.sf;
			}
			this.search(null, null, null, lastId, lastSortVal);
		} else {
			var more = this._list.hasMore;
			if (!more) {
				more = (this._offset+ZmContactsApp.SEARCHFOR_MAX) < this._list.size();
			}
			this._showResults(true, more, list); // show cached results
		}
	}
};

/**
 * Gets a sub-list of contacts.
 * 
 * @return	{AjxVector}		a vector of {ZmContact} objects
 */
ZmContactPicker.prototype.getSubList =
function() {
	var size = this._list.size();

	var end = this._offset+ZmContactsApp.SEARCHFOR_MAX;

	if (end > size) {
		end = size;
	}

	return (this._offset < end)
		? (AjxVector.fromArray(this._list.getArray().slice(this._offset, end))) : null;
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
ZmContactPicker.prototype._resetColHeaders =
function() {
	var slv = this._chooser.sourceListView;
	slv.headerColCreated = false;
	var isGal = this._selectDiv && (this._selectDiv.getValue() == ZmContactsApp.SEARCHFOR_GAL);

	// find the participant column
	var part = 0;
	for (var i = 0; i < slv._headerList.length; i++) {
		var field = slv._headerList[i]._field;
		if (field == ZmItem.F_NAME) {
			part = i;
		}
		if (field == ZmItem.F_DEPARTMENT) {
			slv._headerList[i]._visible = isGal && this._detailed;
		}
	}

	var sortable = isGal ? null : ZmItem.F_NAME;
	slv._headerList[part]._sortable = sortable;
	slv.createHeaderHtml(sortable);
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
	stb.clearSearch(DwtUiEvent.getTarget(ev));
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
		return false;
	}
	return true;
};

/**
 * @private
 */
ZmContactPicker._onclickHdlr =
function(ev) {
	var stb = DwtControl.getTargetControl(ev);
	stb.clearSearch(DwtUiEvent.getTarget(ev));
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