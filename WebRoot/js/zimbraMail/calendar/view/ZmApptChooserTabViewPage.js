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
 * Creates a new tab view that can be used to choose attendees, locations, or equipment.
 * @constructor
 * @class
 * This class allows the user to search for attendees, locations, or
 * equipment. It presents a chooser which allows the user to select items from
 * the search results.
 *
 * @author Conrad Damon
 *
 * @param {DwtComposite}	parent		the element that created this view
 * @param {Hash}	attendees		the attendees/locations/equipment
 * @param {ZmApptComposeController}	controller	the appt compose controller
 * @param {constant}	type			the chooser page type
 * 
 * @extends		DwtTabViewPage
 */
ZmApptChooserTabViewPage = function(parent, attendees, controller, type) {

	DwtTabViewPage.call(this, parent, "ZmApptChooserTabViewPage");

	this._attendees = attendees;
	this._controller = controller;
	this._editView = parent.getTabPage(ZmApptComposeView.TAB_APPOINTMENT).getEditView();
	this.type = type;

	this.setScrollStyle(DwtControl.CLIP);
	this._offset = 0;
	this._defaultQuery = ".";
	this._rendered = false;
	this._isClean = true;
	this._searchFields = {};
	this._searchFieldIds = {};
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
	this._kbMgr = appCtxt.getKeyboardMgr();    
    this._list = new AjxVector();
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
ZmApptChooserTabViewPage.COL_LABEL["FBSTATUS"]          = "status";

ZmApptChooserTabViewPage.COL_IMAGE = {};
ZmApptChooserTabViewPage.COL_IMAGE[ZmItem.F_NOTES]		= "Page";

ZmApptChooserTabViewPage.COL_WIDTH = {};
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_FOLDER]		= ZmMsg.COLUMN_WIDTH_FOLDER_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_NAME]		= ZmMsg.COLUMN_WIDTH_NAME_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_EMAIL]		= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_WORK_PHONE]	= ZmMsg.COLUMN_WIDTH_WORK_PHONE_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_HOME_PHONE]	= ZmMsg.COLUMN_WIDTH_HOME_PHONE_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_LOCATION]	= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_CONTACT]	= ZmMsg.COLUMN_WIDTH_CONTACT_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_CAPACITY]	= ZmMsg.COLUMN_WIDTH_CAPACITY_NA;
ZmApptChooserTabViewPage.COL_WIDTH[ZmItem.F_NOTES]		= ZmMsg.COLUMN_WIDTH_NOTES_NA;
ZmApptChooserTabViewPage.COL_WIDTH["FBSTATUS"]			= ZmMsg.COLUMN_WIDTH_FBSTATUS_NA;

ZmApptChooserTabViewPage.COLS = {};
ZmApptChooserTabViewPage.COLS[ZmCalBaseItem.PERSON]		= [ZmItem.F_FOLDER, ZmItem.F_NAME, ZmItem.F_EMAIL, ZmItem.F_WORK_PHONE, ZmItem.F_HOME_PHONE, "FBSTATUS"];
ZmApptChooserTabViewPage.COLS[ZmCalBaseItem.LOCATION]	= [ZmItem.F_NAME, ZmItem.F_LOCATION, ZmItem.F_CONTACT, ZmItem.F_CAPACITY, "FBSTATUS", ZmItem.F_NOTES];
ZmApptChooserTabViewPage.COLS[ZmCalBaseItem.EQUIPMENT]	= [ZmItem.F_NAME, ZmItem.F_LOCATION, ZmItem.F_CONTACT, "FBSTATUS", ZmItem.F_NOTES];

// search fields
var i = 1;
ZmApptChooserTabViewPage.SF_ATT_NAME	= i++;
ZmApptChooserTabViewPage.SF_NAME		= i++;
ZmApptChooserTabViewPage.SF_SOURCE		= i++;
ZmApptChooserTabViewPage.SF_CAPACITY	= i++;
ZmApptChooserTabViewPage.SF_DESCRIPTION	= i++;
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
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_DESCRIPTION]	= "description";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_CONTACT]	= "contact";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_SITE]		= "site";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_BUILDING]	= "building";
ZmApptChooserTabViewPage.SF_LABEL[ZmApptChooserTabViewPage.SF_FLOOR]	= "floor";

// corresponding attributes for search command
ZmApptChooserTabViewPage.SF_ATTR = {};
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_NAME]		  = "displayName";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_CAPACITY]	  = "zimbraCalResCapacity";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_DESCRIPTION] = "description";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_CONTACT]	  = "zimbraCalResContactName";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_SITE]		  = "zimbraCalResSite";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_BUILDING]	  = "zimbraCalResBuilding";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_FLOOR]		  = "zimbraCalResFloor";

// search field compares ops - listed here if not substring ("has")
ZmApptChooserTabViewPage.SF_OP = {};
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_CAPACITY]	= "ge";
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_FLOOR]		= "eq";

ZmApptChooserTabViewPage.ATTRS = {};
ZmApptChooserTabViewPage.ATTRS[ZmCalBaseItem.LOCATION] =
	["displayName", "mail", "zimbraCalResLocationDisplayName",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "description", "zimbraCalResType"];
ZmApptChooserTabViewPage.ATTRS[ZmCalBaseItem.EQUIPMENT] =
	["displayName", "mail", "zimbraCalResLocationDisplayName",
	 "zimbraCalResContactEmail", "description", "zimbraCalResType"];

ZmApptChooserTabViewPage.SEARCH_FIELDS = {};
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalBaseItem.PERSON] =
	[ZmApptChooserTabViewPage.SF_ATT_NAME, ZmApptChooserTabViewPage.SF_SOURCE];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalBaseItem.LOCATION] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_CAPACITY, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_DESCRIPTION, ZmApptChooserTabViewPage.SF_FLOOR];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmCalBaseItem.EQUIPMENT] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_DESCRIPTION, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_CONTACT, ZmApptChooserTabViewPage.SF_FLOOR];

ZmApptChooserTabViewPage.SORT_BY = {};
ZmApptChooserTabViewPage.SORT_BY[ZmCalBaseItem.PERSON]				= ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmCalBaseItem.LOCATION]			= ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmCalBaseItem.EQUIPMENT]			= ZmSearch.NAME_ASC;

ZmApptChooserTabViewPage.TOP_LEGEND = {};
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalBaseItem.PERSON]			= ZmMsg.findAttendees;
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalBaseItem.LOCATION]			= ZmMsg.findLocations;
ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalBaseItem.EQUIPMENT]		= ZmMsg.findResources;

ZmApptChooserTabViewPage.BOTTOM_LEGEND = {};
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalBaseItem.PERSON]		= ZmMsg.apptAttendees;
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalBaseItem.LOCATION]		= ZmMsg.apptLocations;
ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalBaseItem.EQUIPMENT]		= ZmMsg.apptResources;

// images for the bottom fieldset legend
ZmApptChooserTabViewPage.ICON = {};
ZmApptChooserTabViewPage.ICON[ZmCalBaseItem.PERSON]					= appContextPath+"/img/hiRes/calendar/ApptMeeting.gif";
ZmApptChooserTabViewPage.ICON[ZmCalBaseItem.LOCATION]				= appContextPath+"/img/hiRes/calendar/Location.gif";
ZmApptChooserTabViewPage.ICON[ZmCalBaseItem.EQUIPMENT]				= appContextPath+"/img/hiRes/calendar/Resource.gif";


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
    if (this._rendered) {
		this._chooser.reset();
	}

	this.parent.tabSwitched(this._tabKey);
	this._setAttendees();
	this._controller._setComposeTabGroup(true);

	if (this._isClean && this.type == ZmCalBaseItem.PERSON) {
		this._isClean = false;
		this.searchContacts(true);
	}
};

ZmApptChooserTabViewPage.prototype.tabBlur =
function() {
};

ZmApptChooserTabViewPage.prototype.initialize =
function(appt, mode, isDirty) {
	this._appt = appt;
	this._isDirty = isDirty;
    this._list.removeAll();

	if (this._rendered) {
		this._chooser.reset();
	} else {
		this._createPageHtml();
		this._addDwtObjects();
		this._rendered = true;
	}
	this._resetSelectDiv();
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
 * @param {Boolean}	enable		if <code>true</code>, allow multiple locations
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

    if(!appCtxt.get(ZmSetting.CAL_SHOW_RESOURCE_TABS)) {
        ZmApptChooserTabViewPage.TOP_LEGEND[ZmCalBaseItem.PERSON]			= ZmMsg.findAttendeesRooms;
        ZmApptChooserTabViewPage.BOTTOM_LEGEND[ZmCalBaseItem.PERSON]		= ZmMsg.apptAttendeesRooms;
    }

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
		var addMultLocsCheckbox = (this.type == ZmCalBaseItem.LOCATION && j == fields.length - 1);
		i = this._getSearchFieldHtml(sf, html, i, addButton, addMultLocsCheckbox);
		if (!isEven || j == fields.length - 1) {
			if (this.type == ZmCalBaseItem.PERSON) {
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
			html[i++] = "' width='130'></td>";
		}
	} else {
		html[i++] = "<td align='right'>";
		html[i++] = ZmMsg[ZmApptChooserTabViewPage.SF_LABEL[id]];
		html[i++] = ":&nbsp;</td><td>";
		html[i++] = "<input type='text' autocomplete='off' size=30 nowrap id='";
		html[i++] = this._searchFieldIds[id];
		html[i++] = "' />";
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
		html[i++] = "' /></td><td class='ZmFieldLabelLeft'>&nbsp;<label for='";
		html[i++] = this._multLocsCheckboxId;
		html[i++] = "'>";
		html[i++] = ZmMsg.allowMultipleLocations;
		html[i++] = "</label></td></tr></table></td>";
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
		if (this.type == ZmCalBaseItem.PERSON) {
			searchButton.setEnabled(false);
		}
	}

	// add select menu for contact source if we need one
	if (this._listSelectId) {
		var listSelect = document.getElementById(this._listSelectId);
		this._selectDiv = new DwtSelect({parent:this});
		this._resetSelectDiv();
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
			searchField.onkeypress = AjxCallback.simpleClosure(this._handleKeyPress, this);
			searchField.onkeyup = AjxCallback.simpleClosure(this._handleKeyUp, this);
		}
	}

	if (this._multLocsCheckboxId) {
		var cb = document.getElementById(this._multLocsCheckboxId);
		cb.onclick = AjxCallback.simpleClosure(this._handleMultiLocsCheckbox, this);
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
    this._list.removeAll();
	if (this.type == ZmCalBaseItem.PERSON) {
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
        this._showResults(true, true, this.getSubList()); // show cached results
    }
    else {
        var lastId;
        var lastSortVal;
        this._offset += ZmContactsApp.SEARCHFOR_MAX;
        var list = this.getSubList();
        if (!list) {
            list = this._chooser.sourceListView.getList();
            var contact = (list.size() > 0) ? list.getLast() : null;
            if (contact) {
                lastId = contact.id;
                lastSortVal = contact.sf;
            }
            this.searchContacts(false, null, lastId, lastSortVal);
        } else {
            var more = this._list.hasMore;
            if (!more) {
                more = (this._offset+ZmContactsApp.SEARCHFOR_MAX) < this._list.size();
            }
            this._showResults(true, more, list); // show cached results
        }
    }
};

ZmApptChooserTabViewPage.prototype.getSubList =
function() {
	var size = this._list.size();

	var end = (this._offset + ZmContactsApp.SEARCHFOR_MAX > size)
		? size : (this._offset + ZmContactsApp.SEARCHFOR_MAX);

	return (this._offset < end)
		? (AjxVector.fromArray(this._list.getArray().slice(this._offset, end))) : null;
};

/*
* Sets the target list to the current set of attendees.
*/
ZmApptChooserTabViewPage.prototype._setAttendees =
function() {
	var attendees = this._attendees[this.type].getArray();
	if (attendees.length) {
		if (this.type == ZmCalBaseItem.LOCATION && attendees.length > 1) {
			this.enableMultipleLocations(true);
			var pSize = this.parent.getSize();
			this.resize(pSize.x, pSize.y);
		}
                this._chooser.setItems(attendees, DwtChooserListView.TARGET);
	} else {
		this._chooser.reset(DwtChooserListView.TARGET);
	}
};

ZmApptChooserTabViewPage.prototype._resetSelectDiv =
function() {
	if (this._selectDiv) {
		this._selectDiv.clearOptions();
		this._selectDiv.addOption(ZmMsg.contacts, false, ZmContactsApp.SEARCHFOR_CONTACTS);
		if (appCtxt.get(ZmSetting.SHARING_ENABLED))
			this._selectDiv.addOption(ZmMsg.searchPersonalSharedContacts, false, ZmContactsApp.SEARCHFOR_PAS);
		if (appCtxt.get(ZmSetting.GAL_ENABLED) && appCtxt.getActiveAccount().isZimbraAccount)
			this._selectDiv.addOption(ZmMsg.GAL, true, ZmContactsApp.SEARCHFOR_GAL);
		if (!appCtxt.get(ZmSetting.INITIALLY_SEARCH_GAL) || !appCtxt.get(ZmSetting.GAL_ENABLED)) {
			this._selectDiv.setSelectedValue(ZmContactsApp.SEARCHFOR_CONTACTS);
		}
	}
};

/**
 * Performs a contact search (in either personal contacts or in the GAL) and populates
 * the source list view with the results.
 *
 * @param {Boolean}	defaultSearch set to true when contacts are searched by default without user initiation
 * @param {constant}	sortBy			the ID of column to sort by
 * @param {int}	lastId		   the ID of last item displayed (for pagination)
 * @param {String}	lastSortVal	the value of sort field for above item
 */
ZmApptChooserTabViewPage.prototype.searchContacts =
function(defaultSearch, sortBy, lastId, lastSortVal) {
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
	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
	this._chooser.sourceListView.sortingEnabled = (this._contactSource == ZmItem.CONTACT);

	var params = {
		query: query,
		queryHint: queryHint,
		types: (AjxVector.fromArray([ZmItem.CONTACT])),
		sortBy: (sortBy || ZmApptChooserTabViewPage.SORT_BY[this.type]),
		offset: this._offset,
		limit: (this._contactSource != ZmId.SEARCH_GAL) ? ZmContactsApp.SEARCHFOR_MAX : "",
		contactSource: this._contactSource,
        lastId: lastId,
        lastSortVal: lastSortVal        
	};
	var search = new ZmSearch(params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchContacts, [defaultSearch])});
};

// If a contact has multiple emails, create a clone for each one.
ZmApptChooserTabViewPage.prototype._handleResponseSearchContacts =
function(defaultSearch, result) {
	var resp = result.getResponse();
    var offset = resp.getAttribute("offset");
    var isPagingSupported = AjxUtil.isSpecified(offset);
    var more = resp.getAttribute("more");    
    var info = resp.getAttribute("info");
    var expanded = info && info[0].wildcard[0].expanded == "0";

    //bug: 47649 avoid showing warning message for default contacts search
    if (!defaultSearch && !isPagingSupported &&
        (expanded || (this._contactSource == ZmId.SEARCH_GAL && more)))
    {
        var d = appCtxt.getMsgDialog();
        d.setMessage(ZmMsg.errorSearchNotExpanded);
        d.popup();
        if (expanded) { return; }
    }

    var list = AjxVector.fromArray(ZmContactsHelper._processSearchResponse(resp));

    if (isPagingSupported) {
        this._list.merge(offset, list);
        this._list.hasMore = more;
    }

    this._showResults(isPagingSupported, more, list.getArray());
};

ZmApptChooserTabViewPage.prototype._showResults =
function(isPagingSupported, more, list) {
    if(this._prevButton && this._nextButton) {
        // if offset is returned, then this account support gal paging
        if (this._contactSource == ZmId.SEARCH_GAL && !isPagingSupported) {
            this._prevButton.setEnabled(false);
            this._nextButton.setEnabled(false);
        } else {
            this._prevButton.setEnabled(this._offset > 0);
            this._nextButton.setEnabled(more);
        }
    }
    
	var list1 = [];
    var contactList = list ? list : [];
    if(!(contactList instanceof Array)) {
        contactList = contactList.getArray();                
    }

	for (var i = 0; i < contactList.length; i++) {
        if(!contactList[i]) continue;
		var contact = (contactList[i] && contactList[i].__contact) ? contactList[i].__contact : contactList[i];
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
			list1.push(contact);
		}
	}

	this._fillFreeBusy(list1, AjxCallback.simpleClosure(function(list1) { this._chooser.setItems(list1); }, this));
};

ZmApptChooserTabViewPage.prototype.searchCalendarResources =
function(sortBy) {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	var conds = [];
	var value = (this.type == ZmCalBaseItem.LOCATION) ? "Location" : "Equipment";
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
	var params = {
		sortBy: sortBy,
		offset: 0,
		limit: ZmContactsApp.SEARCHFOR_MAX,
		conds: conds,
		attrs: ZmApptChooserTabViewPage.ATTRS[this.type]
	};
	var search = new ZmSearch(params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchCalendarResources)});
};

ZmApptChooserTabViewPage.prototype._getTimeFrame =
function() {
	var di = {};
	ZmApptViewHelper.getDateInfo(this._editView, di);
	var startDate = AjxDateUtil.simpleParseDateStr(di.startDate);
	var endDate;
	if (di.isAllDay) {
		endDate = new Date(startDate);
		endDate.setHours(23, 59, 0, 0);
		startDate.setHours(0, 0, 0, 0);
	} else {
		endDate = AjxDateUtil.simpleParseDateStr(di.endDate);
		startDate = this._editView._startTimeSelect.getValue(startDate);
		endDate = this._editView._endTimeSelect.getValue(endDate);
	}

	return {start:startDate, end:endDate};
};

ZmApptChooserTabViewPage.prototype._fillFreeBusy =
function(items, callback) {
	// bug fix #28693 - offline does not support free/busy yet
	if (appCtxt.isOffline) {
		if (callback) callback(items);
		return;
	}

	var tf = this._getTimeFrame();
	var list = (items instanceof AjxVector) ? items.getArray() : (items instanceof Array) ? items : [items];
	var emails = [];
	var itemsById = {};
	for (var i = list.length; --i >= 0;) {
		var item = list[i];
		emails[i] = item.getEmail();

        //bug: 30824 - Don't list all addresses/aliases of a resource in GetFreeBusyRequest.  One should suffice.
		if (emails[i] instanceof Array) {
			emails[i] = emails[i][0];
		}

		itemsById[emails[i]] = item;
		item.__fbStatus = { txt: ZmMsg.unknown };
	}
	callback(items);

	if (this._freeBusyRequest) {
		appCtxt.getRequestMgr().cancelRequest(this._freeBusyRequest, null, true);
	}
	this._freeBusyRequest = this._controller.getFreeBusyInfo(tf.start.getTime(),
															 tf.end.getTime(),
															 emails.join(","),
															 new AjxCallback(this, this._handleResponseFreeBusy, [itemsById]),
															 null,
															 true);
};

ZmApptChooserTabViewPage.prototype._handleResponseFreeBusy =
function(itemsById, result) {
	this._freeBusyRequest = null;

	var args = result.getResponse().GetFreeBusyResponse.usr;
	for (var i = args.length; --i >= 0;) {
		var el = args[i];
		var id = el.id;
		if (!id) {
			continue;
		}
		var item = itemsById[id];
		if (!item) {
			continue;
		}
		var status = ZmMsg.free;
		item.__fbStatus.status = 0;
		if (el.b) {
			status = "<b style='color: red'>" + ZmMsg.busy + "</b>";
			item.__fbStatus.status = 1;
		} else if (el.u) {
			status = "<b style='color: red'>" + ZmMsg.outOfOffice + "</b>";
			item.__fbStatus.status = 2;
		} else if (el.t) {
			status = "<b style='color: orange'>" + ZmMsg.tentative + "</b>";
			item.__fbStatus.status = 3;
		}
		item.__fbStatus.txt = status;
		this._updateStatus(item, this._chooser.sourceListView);
		this._updateStatus(item, this._chooser.targetListView);
	}
};

ZmApptChooserTabViewPage.prototype._updateStatus =
function(item, view) {
	var id = view._getFieldId(item, "FBSTATUS"),
		element = document.getElementById(id);
	
	if (element) {
		element.innerHTML = item.__fbStatus.txt;
	}
};

ZmApptChooserTabViewPage.prototype._handleResponseSearchCalendarResources =
function(result) {
	var resp = result.getResponse();
	resp = resp.getResults(ZmItem.RESOURCE).getVector();
	this._fillFreeBusy(resp, AjxCallback.simpleClosure(function(items) {
		this._chooser.setItems(items);
	}, this));
};

ZmApptChooserTabViewPage.prototype._getDefaultFocusItem =
function() {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	return this._searchFields[fields[0]];
};

ZmApptChooserTabViewPage.prototype._handleKeyPress =
function(ev) {
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (this._keyPressCallback && (charCode == 13 || charCode == 3)) {
		this._keyPressCallback.run();
	    return false;
	}
	return true;
};

ZmApptChooserTabViewPage.prototype._handleKeyUp =
function(ev) {
	var field = DwtUiEvent.getTarget(ev);
	if (this.type == ZmCalBaseItem.PERSON) {
		this._searchButton.setEnabled(field && field.value);
	}

	return true;
};

ZmApptChooserTabViewPage.prototype._handleMultiLocsCheckbox =
function(ev) {
	var cb = DwtUiEvent.getTarget(ev);
	this._chooser.setSelectStyle(cb.checked ? DwtChooser.MULTI_SELECT : DwtChooser.SINGLE_SELECT, true);
	if (!cb.checked) {
		this.parent.updateAttendees(this._chooser.getItems(), ZmCalBaseItem.LOCATION);
	}
	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y); // force resize to adjust chooser layout
};

// *********************

/**
 * @class
 * This class creates a specialized chooser for the attendee picker.
 *
 * @param {DwtComposite}	parent			the attendee tab view
 * @param {Array}		buttonInfo		transfer button IDs and labels
 * 
 * @extends		DwtChooser
 * 
 * @private
 */
ZmApptChooser = function(parent, buttonInfo) {
	var selectStyle = (parent.type == ZmCalBaseItem.LOCATION) ? DwtChooser.SINGLE_SELECT : null;
	DwtChooser.call(this, {parent: parent, buttonInfo: buttonInfo, layoutStyle: DwtChooser.VERT_STYLE,
						   mode: DwtChooser.MODE_MOVE, selectStyle: selectStyle, allButtons: true});
};

ZmApptChooser.prototype = new DwtChooser;
ZmApptChooser.prototype.constructor = ZmApptChooser;

ZmApptChooser.prototype.toString =
function() {
	return "ZmApptChooser";
};

// overload to handle contact groups - see bug 28398
ZmApptChooser.prototype.addItems =
function(items, view, skipNotify, id) {
	var newList;

	if (view == DwtChooserListView.TARGET) {
		newList = [];
		var list = (items instanceof AjxVector) ? items.getArray() : (items instanceof Array) ? items : [items];

		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			if (item instanceof ZmContact && item.isGroup()) {
				var addrs = item.getGroupMembers().good.getArray();
				for (var j = 0; j < addrs.length; j++) {
					var contact = new ZmContact(null);
					contact.initFromEmail(addrs[j]);
					newList.push(contact);
				}
			} else {
				newList.push(item);
			}
		}
	} else {
		newList = items;
	}

	DwtChooser.prototype.addItems.call(this, newList, view, skipNotify, id);
};

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

/**
 * The item is a {@link ZmContact} or {@link ZmResource}. Its address is used for comparison.
 *
 * @param {ZmContact}	item	the ZmContact or ZmResource
 * @param {AjxVector}	list	list to check against
 * 
 * @private
 */
ZmApptChooser.prototype._isDuplicate =
function(item, list) {
	return list.containsLike(item, item.getEmail);
};

/**
 * This class creates a specialized source list view for the contact chooser. The items
 * it manages are of type ZmContact or its subclass ZmResource.
 *
 * @param {DwtChooser}	parent		chooser that owns this list view
 * @param {constant}	type			list view type (source or target)
 * @param {constant}	chooserType		type of owning chooser (attendee/location/resource)
 * 
 * @extends		DwtChooserListView
 * 
 * @private
 */
ZmApptChooserListView = function(parent, type, chooserType) {

	this._chooserType = chooserType;
	DwtChooserListView.call(this, {parent:parent, type:type});

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
		var text = ZmMsg[ZmApptChooserTabViewPage.COL_LABEL[id]];
		var image = ZmApptChooserTabViewPage.COL_IMAGE[id];
		var width = ZmApptChooserTabViewPage.COL_WIDTH[id];
		headerList.push(new DwtListHeaderItem({field:id, text:text, icon:image, width:width,
											   resizeable:(id == ZmItem.F_NAME)}));
	}

	return headerList;
};

ZmApptChooserListView.prototype._getCellId =
function(item, field) {
	return field == "FBSTATUS" ? this._getFieldId(item, field) : null;
};

ZmApptChooserListView.prototype._getCellContents =
function(html, idx, item, field, colIdx, params) {
    if(field != ZmItem.F_NOTES) {
        html[idx++] = "&nbsp;";
    }
    if (field == ZmItem.F_FOLDER) {
		var name = "";
		if (item.isGal) {
			name = ZmMsg.GAL;
		} else {
			var folder = appCtxt.getById(item.folderId);
			name = folder ? folder.name : "";
		}
		html[idx++] = AjxStringUtil.htmlEncode(name);
	} else if (field == ZmItem.F_NAME) {
		var name = (this._chooserType == ZmCalBaseItem.PERSON) ? item.getFullName() : item.getAttr(ZmResource.F_name);
        if(this._chooserType != ZmCalBaseItem.PERSON && item instanceof ZmContact) {
            name = item.getFullName();             
        }
		html[idx++] = AjxStringUtil.htmlEncode(name);
	} else if (field == ZmItem.F_EMAIL) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getEmail());
	} else if (field == ZmItem.F_WORK_PHONE) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAttr(ZmContact.F_workPhone));
	} else if (field == ZmItem.F_HOME_PHONE) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAttr(ZmContact.F_homePhone));
	} else if (field == ZmItem.F_LOCATION) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAttr(ZmResource.F_locationName));
	} else if (field == ZmItem.F_CONTACT) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAttr(ZmResource.F_contactMail));
	} else if (field == ZmItem.F_CAPACITY) {
		html[idx++] = AjxStringUtil.htmlEncode(item.getAttr(ZmResource.F_capacity));
	} else if (field == ZmItem.F_NOTES) {
		var notes = item.getAttr(ZmContact.F_description);
		if (notes) {
			var notesId = this._getFieldId(item, field);
			this._notes[notesId] = notes;
            html[idx++] = AjxImg.getImageHtml("Page", null, ["id='", notesId, "'"].join(""));
		}
	} else if (field == "FBSTATUS" && item.__fbStatus) {
                html[idx++] = item.__fbStatus.txt;
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
        if (!note) {
            var item = this.getItemFromElement(div);
            if (item) {
                var notesId = this._getFieldId(item, ZmItem.F_NOTES);
                note = this._notes[notesId];
            }
        }
        if (note) {
			this.setToolTipContent(AjxStringUtil.htmlEncode(note));
		}
	}

	return true;
};
