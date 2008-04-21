/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * Creates a new tab view that can be used to choose attendees, locations, or equipment.
 * @constructor
 * @class
 * This class allows the user to search for attendees, locations, or
 * equipment. It presents a chooser which allows the user to select items from
 * the search results.
 *
 * @author Conrad Damon
 *
 * @param parent		[DwtComposite]				the element that created this view
 * @param attendees		[hash]						attendees/locations/equipment
 * @param controller	[ZmApptComposeController]	the appt compose controller
 * @param type			[constant]					chooser page type
 */
ZmApptChooserTabViewPage = function(parent, attendees, controller, type) {

	DwtTabViewPage.call(this, parent, "ZmApptChooserTabViewPage");

	this._attendees = attendees;
	this._controller = controller;
	this.type = type;

	this.setScrollStyle(DwtControl.CLIP);
	this._offset = 0;
	this._defaultQuery = ".";
	this._rendered = false;
	this._isClean = true;
	this._searchFields = {};
	this._searchFieldIds = {};
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
	this._kbMgr = appCtxt.getShell().getKeyboardMgr();
};

ZmApptChooserTabViewPage.COL_LABEL = {};
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_FOLDER]		= "folder";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_NAME]		= "_name";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_EMAIL]		= "email";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_WORK_PHONE]	= "AB_FIELD_workPhone";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_HOME_PHONE]	= "AB_FIELD_homePhone";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_LOCATION]	= "location";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_CONTACT]	= "contact";
ZmApptChooserTabViewPage.COL_LABEL[ZmItem.F_CAPACITY]	= "capacity";

ZmApptChooserTabViewPage.COL_IMAGE = {};
ZmApptChooserTabViewPage.COL_IMAGE[ZmItem.F_NOTES]		= "SearchNotes";

ZmApptChooserTabViewPage.COL_WIDTH = {};
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_FOLDER]		= 120;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_NAME]		= 150;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_EMAIL]		= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_WORK_PHONE]	= 100;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_HOME_PHONE]	= 100;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_LOCATION]	= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_CONTACT]	= 150;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_CAPACITY]	= 50;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_NOTES]		= 30;

ZmApptChooserTabViewPage.COLS = {};
ZmApptChooserTabViewPage.COLS[ZmCalItem.PERSON] =
	[ZmItem.F_FOLDER, ZmItem.F_NAME, ZmItem.F_EMAIL,
	 ZmItem.F_WORK_PHONE, ZmItem.F_HOME_PHONE];
ZmApptChooserTabViewPage.COLS[ZmCalItem.LOCATION] =
	[ZmItem.F_NAME, ZmItem.F_LOCATION,
	 ZmItem.F_CONTACT, ZmItem.F_CAPACITY,
	 ZmItem.F_NOTES];
ZmApptChooserTabViewPage.COLS[ZmCalItem.EQUIPMENT] =
	[ZmItem.F_NAME, ZmItem.F_LOCATION,
	 ZmItem.F_CONTACT, ZmItem.F_NOTES];

// search fields
var i = 1;
ZmApptChooserTabViewPage.SF_ATT_NAME	= i++;
ZmApptChooserTabViewPage.SF_NAME		= i++;
ZmApptChooserTabViewPage.SF_SOURCE		= i++;
ZmApptChooserTabViewPage.SF_CAPACITY	= i++;
ZmApptChooserTabViewPage.SF_NOTES		= i++;
ZmApptChooserTabViewPage.SF_SITE		= i++;
ZmApptChooserTabViewPage.SF_BUILDING	= i++;
ZmApptChooserTabViewPage.SF_FLOOR		= i++;
delete i;

// search field labels
ZmApptChooserTabViewPage.SF_LABEL = {};
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_ATT_NAME]	= "find";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_NAME]		= "_name";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_SOURCE]	= "source";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_CAPACITY]	= "minimumCapacity";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_NOTES]	= "notes";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_CONTACT]	= "contact";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_SITE]		= "site";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_BUILDING]	= "building";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_FLOOR]	= "floor"

// corresponding attributes for search command
ZmApptChooserTabViewPage.SF_ATTR = {};
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_NAME]		= "displayName";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_CAPACITY]	= "zimbraCalResCapacity";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_NOTES]		= "description";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_CONTACT]	= "zimbraCalResContactName";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_SITE]		= "zimbraCalResSite";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_BUILDING]	= "zimbraCalResBuilding";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_FLOOR]		= "zimbraCalResFloor";

// search field compares ops - listed here if not substring ("has")
ZmApptChooserTabViewPage.SF_OP = {};
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_CAPACITY]	= "ge";
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_FLOOR]		= "eq";

ZmApptChooserTabViewPage.ATTRS = {};
ZmApptChooserTabViewPage.ATTRS[ZmCalItem.LOCATION] =
	["displayName", "mail", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "description"];
ZmApptChooserTabViewPage.ATTRS[ZmCalItem.EQUIPMENT] =
	["displayName", "mail", "zimbraCalResLocationDisplayName",
	 "zimbraCalResContactEmail", "description"];

ZmApptChooserTabViewPage.SEARCH_FIELDS = {};
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalItem.PERSON] =
	[ZmApptChooserTabViewPage.SF_ATT_NAME, ZmApptChooserTabViewPage.SF_SOURCE];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalItem.LOCATION] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_CAPACITY, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_NOTES, ZmApptChooserTabViewPage.SF_FLOOR];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalItem.EQUIPMENT] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_NOTES, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_CONTACT, ZmApptChooserTabViewPage.SF_FLOOR];

ZmApptChooserTabViewPage.SORT_BY = {};
ZmApptChooserTabViewPage.SORT_BY[ZmCalItem.PERSON]				= ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmCalItem.LOCATION]			= ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmCalItem.EQUIPMENT]			= ZmSearch.NAME_ASC;

ZmApptChooserTabViewPage.TOP_LEGEND = {};
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalItem.PERSON]			= ZmMsg.findAttendees;
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalItem.LOCATION]			= ZmMsg.findLocations;
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalItem.EQUIPMENT]		= ZmMsg.findResources;

ZmApptChooserTabViewPage.BOTTOM_LEGEND = {};
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalItem.PERSON]		= ZmMsg.apptAttendees;
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalItem.LOCATION]		= ZmMsg.apptLocations;
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalItem.EQUIPMENT]		= ZmMsg.apptResources;

// images for the bottom fieldset legend
ZmApptChooserTabViewPage.ICON = {};
ZmApptChooserTabViewPage.ICON[ZmCalItem.PERSON]					= appContextPath+"/img/hiRes/calendar/ApptMeeting.gif";
ZmApptChooserTabViewPage.ICON[ZmCalItem.LOCATION]				= appContextPath+"/img/hiRes/calendar/Location.gif";
ZmApptChooserTabViewPage.ICON[ZmCalItem.EQUIPMENT]				= appContextPath+"/img/hiRes/calendar/Resource.gif";


ZmApptChooserTabViewPage.prototype = new DwtTabViewPage;
ZmApptChooserTabViewPage.prototype.constructor = ZmApptChooserTabViewPage;

ZmApptChooserTabViewPage.prototype.toString =
function() {
	return "ZmApptChooserTabViewPage";
};

ZmApptChooserTabViewPage.prototype.showMe =
function() {
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);

	this.parent.tabSwitched(this._tabKey);
	this._setAttendees();
	this._controller._setComposeTabGroup(true);

	if (this._isClean && this.type == ZmCalItem.PERSON) {
		this._isClean = false;
		this.searchContacts();
	}
};

ZmApptChooserTabViewPage.prototype.tabBlur =
function() {
};

ZmApptChooserTabViewPage.prototype.initialize =
function(appt, mode, isDirty) {
	this._appt = appt;
	this._isDirty = isDirty;

	if (this._rendered) {
		this._chooser.reset();
	} else {
		this._createPageHtml();
		this._addDwtObjects();
		this._rendered = true;
	}
};

ZmApptChooserTabViewPage.prototype.resize =
function(newWidth, newHeight) {
	if (!this._rendered) return;

	if (newWidth || newHeight) {
		var w = newWidth ? newWidth : Dwt.DEFAULT;
		var h = newHeight ? newHeight - 30 : Dwt.DEFAULT;
		this.setSize(w, h);
	}

	var searchTable = document.getElementById(this._searchTableId);
	var stSz = Dwt.getSize(searchTable);
	// leave clearance for field sets
	var newChooserWidth = newWidth ? newWidth - 32 : Dwt.DEFAULT;
	var newChooserHeight = newHeight ? newHeight - stSz.y - 100 : Dwt.DEFAULT;
	this._chooser.resize(newChooserWidth, newChooserHeight);
};

ZmApptChooserTabViewPage.prototype.cleanup =
function() {
	this._chooser.reset();

	if (this._prevButton && this._nextButton) {
		this._prevButton.setEnabled(false);
		this._nextButton.setEnabled(false);
	}
	this._isClean = true;
	this._offset = 0;

	for (var i in this._searchFieldIds) {
		var id = this._searchFieldIds[i];
		var el = document.getElementById(id);
		if (el && el.value) {
			el.value = "";
		}
	}
};

ZmApptChooserTabViewPage.prototype.isValid =
function() {
	return true;
};

/**
* Enables/disables multiple locations.
*
* @param enable		[boolean]	if true, allow multiple locations
*/
ZmApptChooserTabViewPage.prototype.enableMultipleLocations =
function(enable) {
	if (this._multLocsCheckboxId) {
		var cb = document.getElementById(this._multLocsCheckboxId);
		if (cb.checked != enable) {
			cb.checked = enable;
			this._chooser.setSelectStyle(cb.checked ? DwtChooser.MULTI_SELECT : DwtChooser.SINGLE_SELECT, true);
			if (parent._currentTabKey == this._tabKey) {
				var pSize = this.parent.getSize();
				this.resize(pSize.x, pSize.y); // force resize to adjust chooser layout
			}
		}
	}
};

ZmApptChooserTabViewPage.prototype._createPageHtml =
function() {

	this._searchTableId	= Dwt.getNextId();

	this._chooserSourceListViewDivId	= Dwt.getNextId();
	this._chooserButtonsDivId	= Dwt.getNextId();
	this._chooserTargetListViewDivId	= Dwt.getNextId();

	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	for (var i = 0; i < fields.length; i++) {
		this._searchFieldIds[fields[i]] = Dwt.getNextId();
	}

	var html = [];
	var i = 0;
	
	html[i++] = "<fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
	html[i++] = ZmApptChooserTabViewPage.TOP_LEGEND[this.type];
	html[i++] = "</legend>";
	
	html[i++] = "<div style='margin-top:10px' id='";
	html[i++] = this._searchTableId;
	html[i++] = "'>";

	html[i++] = "<table border=0 cellpadding=0 cellspacing=3><tr>";
	
	for (var j = 0; j < fields.length; j++) {
		var isEven = ((j % 2) == 0);
		if (isEven) {
			html[i++] = "<tr>";
		}
		var sf = fields[j];
		var addButton = (j == 1);
		var addMultLocsCheckbox = (this.type == ZmCalItem.LOCATION && j == fields.length - 1);
		i = this._getSearchFieldHtml(sf, html, i, addButton, addMultLocsCheckbox);
		if (!isEven || j == fields.length - 1) {
			if (this.type == ZmCalItem.PERSON) {
				this._prevButtonId = Dwt.getNextId();
				this._nextButtonId = Dwt.getNextId();
				html[i++] = "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
				html[i++] = "<td id='";
				html[i++] = this._prevButtonId;
				html[i++] = "'></td><td id='";
				html[i++] = this._nextButtonId;
				html[i++] = "'></td>";
			}

			html[i++] = "</tr>";
		}
	}

	html[i++] = "</table></div>";

	// placeholder for the chooser's source list view
	html[i++] = "<div id='";
	html[i++] = this._chooserSourceListViewDivId;
	html[i++] = "'></div>";
	html[i++] = "</fieldset>";
	
	// placeholder for the chooser's buttons
	html[i++] = "<div id='";
	html[i++] = this._chooserButtonsDivId;
	html[i++] = "'></div>";
	
	html[i++] = "<fieldset";
	if (AjxEnv.isMozilla)
		html[i++] = " style='border: 1px dotted #555555'";
	html[i++] = "><legend style='color:#555555'>";
//	html[i++] = "<img src='";
//	html[i++] = ZmApptChooserTabViewPage.ICON[this.type];
//	html[i++] = "' />&nbsp;";
	html[i++] = ZmApptChooserTabViewPage.BOTTOM_LEGEND[this.type];
	html[i++] = "</legend>";

	// placeholder for the chooser's target list view
	html[i++] = "<div id='";
	html[i++] = this._chooserTargetListViewDivId;
	html[i++] = "'></div>";
	html[i++] = "</fieldset>";
	
	this.getHtmlElement().innerHTML = html.join("");
};

ZmApptChooserTabViewPage.prototype._getSearchFieldHtml =
function(id, html, i, addButton, addMultLocsCheckbox) {
	if (id == ZmApptChooserTabViewPage.SF_SOURCE) {
		// no need for source select if not more than one choice to choose from
		var showSelect = false;
		if (appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
			if (appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.get(ZmSetting.SHARING_ENABLED))
				showSelect = true;
		}

		if (!showSelect) {
			html[i++] = "<td>&nbsp;</td>";
		} else {
			this._listSelectId = this._searchFieldIds[id];
			html[i++] = "<td align='right'>";
			html[i++] = ZmMsg[ZmApptChooserTabViewPage.SF_LABEL[id]];
			html[i++] = ":&nbsp;</td><td id='";
			html[i++] = this._listSelectId;
			html[i++] = "'></td>";
		}
	} else {
		html[i++] = "<td align='right'>";
		html[i++] = ZmMsg[ZmApptChooserTabViewPage.SF_LABEL[id]];
		html[i++] = ":&nbsp;</td><td>";
		html[i++] = Dwt.CARET_HACK_BEGIN;
		html[i++] = "<input type='text' autocomplete='off' size=30 nowrap id='";
		html[i++] = this._searchFieldIds[id];
		html[i++] = "' />";
		html[i++] = Dwt.CARET_HACK_END;
		html[i++] = "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>";
	}

	if (addButton) {
		this._searchBtnTdId	= Dwt.getNextId();
		html[i++] = "<td id='";
		html[i++] = this._searchBtnTdId;
		html[i++] = "'></td>";
	}
	else if (addMultLocsCheckbox) {
		this._multLocsCheckboxId = Dwt.getNextId();
		html[i++] = "<td><table border=0 cellpadding=0 cellspacing=0><tr><td>";
		html[i++] = "<input type='checkbox' id='";
		html[i++] = this._multLocsCheckboxId;
		html[i++] = "' /></td><td class='ZmFieldLabelLeft'>&nbsp;";
		html[i++] = ZmMsg.allowMultipleLocations;
		html[i++] = "</td></tr></table></td>";
	}

	return i;
};

ZmApptChooserTabViewPage.prototype._addDwtObjects =
function() {

	// add search button
	if (this._searchBtnTdId) {
		var element = document.getElementById(this._searchBtnTdId);
		var searchButton = this._searchButton = new DwtButton({parent:this});
		searchButton.setText(ZmMsg.search);
		searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
		element.appendChild(searchButton.getHtmlElement());
		// attendees tab: search button enabled only if there is search field input
		if (this.type == ZmCalItem.PERSON) {
			searchButton.setEnabled(false);
		}
	}

	// add select menu for contact source if we need one
	if (this._listSelectId) {
		var listSelect = document.getElementById(this._listSelectId);
		this._selectDiv = new DwtSelect({parent:this});
		this._selectDiv.addOption(ZmMsg.contacts, false, ZmContactsApp.SEARCHFOR_CONTACTS);
		if (appCtxt.get(ZmSetting.SHARING_ENABLED))
			this._selectDiv.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
		if (appCtxt.get(ZmSetting.GAL_ENABLED))
			this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
		if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL) || !appCtxt.get(ZmSetting.GAL_ENABLED)) {
			this._selectDiv.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
		}
		listSelect.appendChild(this._selectDiv.getHtmlElement());
		this._selectDiv.addChangeListener(new AjxListener(this, this._searchTypeListener));
	}

	// add paging buttons
	if (this._prevButtonId && this._nextButtonId) {
		var pageListener = new AjxListener(this, this._pageListener);

		this._prevButton = new DwtButton({parent:this});
		this._prevButton.setImage("LeftArrow");
		this._prevButton.addSelectionListener(pageListener);
		this._prevButton.reparentHtmlElement(this._prevButtonId);
		this._prevButton.setEnabled(false);

		this._nextButton = new DwtButton({parent:this});
		this._nextButton.setImage("RightArrow");
		this._nextButton.addSelectionListener(pageListener);
		this._nextButton.reparentHtmlElement(this._nextButtonId);
		this._nextButton.setEnabled(false);
	}

	// add chooser
	this._chooser = new ZmApptChooser(this);
	var chooserSourceListViewDiv = document.getElementById(this._chooserSourceListViewDivId);
	var sourceListView = this._chooser.getSourceListView();
	chooserSourceListViewDiv.appendChild(sourceListView);
	var chooserButtonsDiv = document.getElementById(this._chooserButtonsDivId);
	var buttons = this._chooser.getButtons();
	chooserButtonsDiv.appendChild(buttons);
	var chooserTargetListViewDiv = document.getElementById(this._chooserTargetListViewDivId);
	var targetListView = this._chooser.getTargetListView();
	chooserTargetListViewDiv.appendChild(targetListView);

	// save search fields, and add handler for Return key to them	
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	for (var i = 0; i < fields.length; i++) {
		var sf = fields[i];
		var searchField = this._searchFields[sf] = document.getElementById(this._searchFieldIds[sf]);
		if (searchField) {
			Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmApptChooserTabViewPage._keyPressHdlr);
			Dwt.setHandler(searchField, DwtEvent.ONKEYUP, ZmApptChooserTabViewPage._keyUpHdlr);
		}
	}
	
	if (this._multLocsCheckboxId) {
		var cb = document.getElementById(this._multLocsCheckboxId);
		Dwt.setHandler(cb, DwtEvent.ONCLICK, ZmApptChooserTabViewPage._multLocsCheckboxHdlr);
	}
};

ZmApptChooserTabViewPage.prototype._addTabGroupMembers =
function(tabGroup) {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	for (var i = 0; i < fields.length; i++) {
		if (fields[i] != ZmApptChooserTabViewPage.SF_SOURCE) {
			tabGroup.addMember(this._searchFields[fields[i]]);
		}
	}
};

ZmApptChooserTabViewPage.prototype._searchButtonListener = 
function(ev) {
	if (this.type == ZmCalItem.PERSON) {
		this._offset = 0;
		this.searchContacts();
	} else {
		this.searchCalendarResources();
	}
};

ZmApptChooserTabViewPage.prototype._searchTypeListener =
function(ev) {
	var oldValue = ev._args.oldValue;
	var newValue = ev._args.newValue;

	if (oldValue != newValue) {
		this._searchButtonListener();
	}
};

ZmApptChooserTabViewPage.prototype._pageListener =
function(ev) {
	if (ev.item == this._prevButton) {
		this._offset -= ZmContactsApp.SEARCHFOR_MAX;
	} else {
		this._offset += ZmContactsApp.SEARCHFOR_MAX;
	}

	this.searchContacts();
};

/*
* Sets the target list to the current set of attendees.
*/
ZmApptChooserTabViewPage.prototype._setAttendees =
function() {
	var attendees = this._attendees[this.type].getArray();
	if (attendees.length) {
		this._chooser.setItems(attendees, DwtChooserListView.TARGET);
	} else {
		this._chooser.reset(DwtChooserListView.TARGET);
	}
};

/**
* Performs a contact search (in either personal contacts or in the GAL) and populates
* the source list view with the results.
*
* @param sortBy			[constant]		ID of column to sort by
* @param ascending		[boolean]		if true, sort in ascending order
*/
ZmApptChooserTabViewPage.prototype.searchContacts = 
function(sortBy) {
	var id = this._searchFieldIds[ZmApptChooserTabViewPage.SF_ATT_NAME];
	var query = AjxStringUtil.trim(document.getElementById(id).value);
	if (!query.length) {
		query = this._defaultQuery;
	}

	var queryHint;
	if (this._selectDiv) {
		var searchFor = this._selectDiv.getValue();
		this._contactSource = (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS || searchFor == ZmContactsApp.SEARCHFOR_PAS)
			? ZmItem.CONTACT
			: ZmSearchToolBar.FOR_GAL_MI;
		if (searchFor == ZmContactsApp.SEARCHFOR_PAS) {
			queryHint = ZmContactsHelper.getRemoteQueryHint();
		} else if (searchFor == ZmContactsApp.SEARCHFOR_CONTACTS) {
			queryHint = "is:local";
		}
	} else {
		this._contactSource = appCtxt.get(ZmSetting.CONTACTS_ENABLED)
			? ZmItem.CONTACT
			: ZmSearchToolBar.FOR_GAL_MI;

		if (this._contactSource == ZmItem.CONTACT) {
			queryHint = "is:local";
		}
	}
	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
	this._chooser.sourceListView.enableSorting(this._contactSource == ZmItem.CONTACT);

	var params = {
		query: query,
		queryHint: queryHint,
		types: (AjxVector.fromArray([ZmItem.CONTACT])),
		sortBy: (sortBy || ZmApptChooserTabViewPage.SORT_BY[this.type]),
		offset: this._offset,
		limit: ZmContactsApp.SEARCHFOR_MAX,
		contactSource: this._contactSource
	};
	var search = new ZmSearch(params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchContacts)});
};

// If a contact has multiple emails, create a clone for each one.
ZmApptChooserTabViewPage.prototype._handleResponseSearchContacts = 
function(result) {
	var resp = result.getResponse();

	if (this._prevButton && this._nextButton) {
		var more = resp.getAttribute("more");
		this._prevButton.setEnabled(this._offset > 0);
		this._nextButton.setEnabled(more);
	}

	var list = resp.getResults(ZmItem.CONTACT).getArray();
	var list1 = [];
	for (var i = 0; i < list.length; i++) {
		var contact = list[i];
		var emails = contact.isGal ? [contact.getEmail()] : contact.getEmails();
		if (emails && emails.length > 1) {
			var workPhone = contact.getAttr(ZmContact.F_workPhone);
			var homePhone = contact.getAttr(ZmContact.F_homePhone);
			for (var j = 0; j < emails.length; j++) {
				var clone = new ZmContact(null);
				clone._fullName = contact.getFullName();
				clone.folderId = contact.folderId;
				clone.setAttr(ZmContact.F_workPhone, workPhone);
				clone.setAttr(ZmContact.F_homePhone, homePhone);
				clone.setAttr(ZmContact.F_email, emails[j]);
				list1.push(clone);
			}
		} else {
			list1.push(contact)
		}
	}
	this._chooser.setItems(list1);
};

ZmApptChooserTabViewPage.prototype.searchCalendarResources = 
function(sortBy) {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	var conds = [];
	var value = (this.type == ZmCalItem.LOCATION) ? "Location" : "Equipment";
	conds.push({attr: "zimbraCalResType", op: "eq", value: value});
	var gotValue = false;
	for (var i = 0; i < fields.length; i++) {
		var sf = fields[i];
		var searchField = document.getElementById(this._searchFieldIds[sf]);
		value = AjxStringUtil.trim(searchField.value);
		if (value.length) {
			gotValue = true;
			var attr = ZmApptChooserTabViewPage.SF_ATTR[sf];
			var op = ZmApptChooserTabViewPage.SF_OP[sf] ? ZmApptChooserTabViewPage.SF_OP[sf] : "has";
			conds.push({attr: attr, op: op, value: value});
		}
	}
	if (gotValue) {
		var params = {sortBy: sortBy, offset: 0, limit: ZmContactsApp.SEARCHFOR_MAX, conds: conds,
					  attrs: ZmApptChooserTabViewPage.ATTRS[this.type]};
		var search = new ZmSearch(params);
		search.execute({callback: new AjxCallback(this, this._handleResponseSearchCalendarResources)});
	}
};

ZmApptChooserTabViewPage.prototype._handleResponseSearchCalendarResources = 
function(result) {
	var resp = result.getResponse();
	this._chooser.setItems(resp.getResults(ZmItem.RESOURCE).getVector());
};

ZmApptChooserTabViewPage.prototype._getDefaultFocusItem = 
function() {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	return this._searchFields[fields[0]];
};

ZmApptChooserTabViewPage._keyPressHdlr =
function(ev) {
    var tvp = DwtControl.getTargetControl(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (tvp._keyPressCallback && (charCode == 13 || charCode == 3)) {
		tvp._keyPressCallback.run();
	    return false;
	}

	return true;
};

ZmApptChooserTabViewPage._keyUpHdlr =
function(ev) {
    var tvp = DwtControl.getTargetControl(ev);
	var field = DwtUiEvent.getTarget(ev);
	if (tvp.type == ZmCalItem.PERSON) {
		tvp._searchButton.setEnabled(field && field.value);
	}
	
	return true;
};

ZmApptChooserTabViewPage._multLocsCheckboxHdlr =
function(ev) {
	var cb = DwtUiEvent.getTarget(ev);
    var tvp = DwtControl.getTargetControl(ev);
    if (tvp) {
		tvp._chooser.setSelectStyle(cb.checked ? DwtChooser.MULTI_SELECT : DwtChooser.SINGLE_SELECT, true);
		var pSize = tvp.parent.getSize();
		tvp.resize(pSize.x, pSize.y); // force resize to adjust chooser layout
	}
};

/***********************************************************************************/

/**
 * This class creates a specialized chooser for the attendee picker.
 *
 * @param parent			[DwtComposite]	the attendee tab view
 * @param buttonInfo		[array]			transfer button IDs and labels
 */
ZmApptChooser = function(parent, buttonInfo) {
	var selectStyle = (parent.type == ZmCalItem.LOCATION) ? DwtChooser.SINGLE_SELECT : null;
	DwtChooser.call(this, {parent: parent, buttonInfo: buttonInfo, layoutStyle: DwtChooser.VERT_STYLE,
						   mode: DwtChooser.MODE_MOVE, selectStyle: selectStyle, allButtons: true});
};

ZmApptChooser.prototype = new DwtChooser;
ZmApptChooser.prototype.constructor = ZmApptChooser;

ZmApptChooser.prototype._createSourceListView =
function() {
	return new ZmApptChooserListView(this, DwtChooserListView.SOURCE, this.parent.type);
};

ZmApptChooser.prototype._createTargetListView =
function() {
	return new ZmApptChooserListView(this, DwtChooserListView.TARGET, this.parent.type);
};

ZmApptChooser.prototype._notify =
function(event, details) {
	details.type = this.parent.type;
	DwtChooser.prototype._notify.call(this, event, details);
};

/*
* The item is a ZmContact or ZmResource. Its address is used for comparison.
*
* @param item	[ZmContact]			ZmContact or ZmResource
* @param list	[AjxVector]			list to check against
*/
ZmApptChooser.prototype._isDuplicate =
function(item, list) {
	return list.containsLike(item, item.getEmail);
};

/***********************************************************************************/

/**
 * This class creates a specialized source list view for the contact chooser. The items
 * it manages are of type ZmContact or its subclass ZmResource.
 *
 * @param parent		[DwtChooser]	chooser that owns this list view
 * @param type			[constant]		list view type (source or target)
 * @param chooserType	[constant]		type of owning chooser (attendee/location/resource)
 */
ZmApptChooserListView = function(parent, type, chooserType) {

	this._chooserType = chooserType;
	DwtChooserListView.call(this, parent, type);

	this._notes = {};
};

ZmApptChooserListView.prototype = new DwtChooserListView;
ZmApptChooserListView.prototype.constructor = ZmApptChooserListView;

ZmApptChooserListView.prototype.toString = 
function() {
	return "ZmApptChooserListView";
};

ZmApptChooserListView.prototype._getHeaderList = 
function() {
	var headerList = [];
	var cols = ZmApptChooserTabViewPage.COLS[this._chooserType];
	for (var i = 0; i < cols.length; i++) {
		var id = cols[i];
		var label = ZmMsg[ZmApptChooserTabViewPage.COL_LABEL[id]];
		var image = ZmApptChooserTabViewPage.COL_IMAGE[id];
		var width = ZmApptChooserTabViewPage.COL_WIDTH[id];
		headerList.push(new DwtListHeaderItem(id, label, image, width));
	}
	
	return headerList;
};

ZmApptChooserListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
	html[idx++] = "&nbsp;";
	if (field == ZmItem.F_FOLDER) {
		var name = "";
		if (item.isGal) {
			name = ZmMsg.GAL;
		} else {
			var folder = appCtxt.getById(item.folderId);
			name = folder ? folder.name : "";
		}
		html[idx++] = name;
	} else if (field == ZmItem.F_NAME) {
		var name = (this._chooserType == ZmCalItem.PERSON) ? item.getFullName() : item.getAttr(ZmResource.F_name);
		html[idx++] = name;
	} else if (field == ZmItem.F_EMAIL) {
		html[idx++] = item.getEmail();
	} else if (field == ZmItem.F_WORK_PHONE) {
		html[idx++] = item.getAttr(ZmContact.F_workPhone);
	} else if (field == ZmItem.F_HOME_PHONE) {
		html[idx++] = item.getAttr(ZmContact.F_homePhone);
	} else if (field == ZmItem.F_LOCATION) {
		html[idx++] = item.getAttr(ZmResource.F_locationName);
	} else if (field == ZmItem.F_CONTACT) {
		html[idx++] = item.getAttr(ZmResource.F_contactMail);
	} else if (field == ZmItem.F_CAPACITY) {
		html[idx++] = item.getAttr(ZmResource.F_capacity);
	} else if (field == ZmItem.F_NOTES) {
		var notes = item.getAttr(ZmContact.F_description);
		if (notes) {
			var notesId = this._getFieldId(item, field);
			this._notes[notesId] = notes;
			html[idx++] = AjxImg.getImageHtml("SearchNotes", null, ["id='", notesId, "'"].join(""));
		}
	}
	return idx;
};

ZmApptChooserListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) { return true; }

	// check if we're hovering over a column header
	var type = Dwt.getAttr(div, "_type");
	if (type && type == DwtListView.TYPE_HEADER_ITEM) {
		var hdr = this.getItemFromElement(div);
		if (hdr) {
			if (hdr._field == ZmItem.F_NOTES) {
				this.setToolTipContent(ZmMsg.notes);
			}
		}
	} else {
		var note = this._notes[id];
		if (note) {
			this.setToolTipContent(note);
		}
	}

	return true;
};
