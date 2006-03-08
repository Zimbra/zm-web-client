/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
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
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */
/**
* Creates a new tab view that can be used to choose attendees, locations, and/or
* resources.
* @constructor
* @class
* This class allows the user to search for attendees, locations, and/or
* resources. It presents a chooser which allows the user to select items from
* the search results.
*
* @author Conrad Damon
*
* @param parent		[DwtComposite]	the element that created this view
* @param appCtxt 	[ZmAppCtxt]		app context
* @param type		[constant]		chooser page type
*/
function ZmApptChooserTabViewPage(parent, appCtxt, type) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this.type = type;

	this.setScrollStyle(DwtControl.CLIP);
	this._rendered = false;
	this._searchFields = {};
	this._searchFieldIds = {};
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
};

// List view columns
ZmApptChooserTabViewPage.ID_NAME		= "a--";
ZmApptChooserTabViewPage.ID_EMAIL		= "b--";
ZmApptChooserTabViewPage.ID_WORK_PHONE	= "c--";
ZmApptChooserTabViewPage.ID_HOME_PHONE	= "d--";
ZmApptChooserTabViewPage.ID_LOCATION	= "e--";
ZmApptChooserTabViewPage.ID_CONTACT		= "f--";
ZmApptChooserTabViewPage.ID_CAPACITY	= "g--";
ZmApptChooserTabViewPage.ID_NOTES		= "h--";

ZmApptChooserTabViewPage.COL_LABEL = {};
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_NAME]		= "_name";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_EMAIL]		= "email";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_WORK_PHONE]	= "AB_FIELD_workPhone";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_HOME_PHONE]	= "AB_FIELD_homePhone";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_LOCATION]	= "location";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_CONTACT]		= "contact";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_CAPACITY]	= "size";
ZmApptChooserTabViewPage.COL_LABEL[ZmApptChooserTabViewPage.ID_NOTES]		= "notes";

ZmApptChooserTabViewPage.COL_WIDTH = {};
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_NAME]		= 150;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_EMAIL]		= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_WORK_PHONE]	= 100;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_HOME_PHONE]	= 100;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_LOCATION]	= null;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_CONTACT]		= 150;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_CAPACITY]	= 30;
ZmApptChooserTabViewPage.COL_WIDTH[ZmApptChooserTabViewPage.ID_NOTES]		= 30;

ZmApptChooserTabViewPage.COLS = {};
ZmApptChooserTabViewPage.COLS[ZmAppt.ATTENDEE] =
	[ZmApptChooserTabViewPage.ID_NAME, ZmApptChooserTabViewPage.ID_EMAIL,
	 ZmApptChooserTabViewPage.ID_WORK_PHONE, ZmApptChooserTabViewPage.ID_HOME_PHONE];
ZmApptChooserTabViewPage.COLS[ZmAppt.LOCATION] =
	[ZmApptChooserTabViewPage.ID_NAME, ZmApptChooserTabViewPage.ID_LOCATION,
	 ZmApptChooserTabViewPage.ID_CONTACT, ZmApptChooserTabViewPage.ID_CAPACITY,
	 ZmApptChooserTabViewPage.ID_NOTES];
ZmApptChooserTabViewPage.COLS[ZmAppt.RESOURCE] =
	[ZmApptChooserTabViewPage.ID_NAME, ZmApptChooserTabViewPage.ID_LOCATION,
	 ZmApptChooserTabViewPage.ID_CONTACT, ZmApptChooserTabViewPage.ID_NOTES];

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
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_NOTES]		= "zimbraNotes";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_CONTACT]	= "zimbraCalResContactName";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_SITE]		= "zimbraCalResSite";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_BUILDING]	= "zimbraCalResBuilding";
ZmApptChooserTabViewPage.SF_ATTR[ZmApptChooserTabViewPage.SF_FLOOR]		= "zimbraCalResFloor";

// search field compares ops - listed here if not substring ("has")
ZmApptChooserTabViewPage.SF_OP = {};
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_CAPACITY]	= "ge";
ZmApptChooserTabViewPage.SF_OP[ZmApptChooserTabViewPage.SF_FLOOR]		= "eq";

ZmApptChooserTabViewPage.ATTRS = {};
ZmApptChooserTabViewPage.ATTRS[ZmAppt.LOCATION] =
	["displayName", "mail", "zimbraCalResSite", "zimbraCalResBuilding", "zimbraCalResFloor", "zimbraCalResRoom",
	 "zimbraCalResCapacity", "zimbraCalResContactEmail", "zimbraNotes",
	 "street", "l", "st", "postalCode", "co"];
ZmApptChooserTabViewPage.ATTRS[ZmAppt.RESOURCE] =
	["displayName", "mail", "zimbraCalResSite", "zimbraCalResBuilding", "zimbraCalResFloor", "zimbraCalResRoom",
	 "zimbraCalResContactEmail", "zimbraNotes",
	 "street", "l", "st", "postalCode", "co"];

ZmApptChooserTabViewPage.SEARCH_FIELDS = {};
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmAppt.ATTENDEE] =
	[ZmApptChooserTabViewPage.SF_ATT_NAME, ZmApptChooserTabViewPage.SF_SOURCE];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmAppt.LOCATION] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_CAPACITY, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_NOTES, ZmApptChooserTabViewPage.SF_FLOOR];
ZmApptChooserTabViewPage.SEARCH_FIELDS[ZmAppt.RESOURCE] =
	[ZmApptChooserTabViewPage.SF_NAME, ZmApptChooserTabViewPage.SF_SITE,
	 ZmApptChooserTabViewPage.SF_NOTES, ZmApptChooserTabViewPage.SF_BUILDING,
	 ZmApptChooserTabViewPage.SF_CONTACT, ZmApptChooserTabViewPage.SF_FLOOR];

ZmApptChooserTabViewPage.SORT_BY = {};
ZmApptChooserTabViewPage.SORT_BY[ZmAppt.ATTENDEE] = ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmAppt.LOCATION] = ZmSearch.NAME_ASC;
ZmApptChooserTabViewPage.SORT_BY[ZmAppt.RESOURCE] = ZmSearch.NAME_ASC;

ZmApptChooserTabViewPage.prototype = new DwtTabViewPage;
ZmApptChooserTabViewPage.prototype.constructor = ZmApptChooserTabViewPage;

ZmApptChooserTabViewPage.prototype.toString =
function() {
	return "ZmApptChooserTabViewPage";
};

ZmApptChooserTabViewPage.prototype.showMe =
function() {
	if (this._rendered)
		this.parent.tabSwitched(this._tabKey);

	var pSize = this.parent.getSize();
	this.resize(pSize.x, pSize.y);
};

ZmApptChooserTabViewPage.prototype.initialize =
function(appt, mode, isDirty) {
	this._appt = appt;
	this._isDirty = isDirty;

	this._createHtml();
	this._addDwtObjects();
	this._chooser.reset();
	this._rendered = true;
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
	this._chooser.resize(newWidth - 12, newHeight - stSz.y - 40);
};

ZmApptChooserTabViewPage.prototype.cleanup =
function() {

};

ZmApptChooserTabViewPage.prototype.isValid =
function() {
	return true;
};

ZmApptChooserTabViewPage.prototype._createHtml =
function() {

	this._searchTableId	= Dwt.getNextId();
	this._chooserDivId	= Dwt.getNextId();

	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	for (var i = 0; i < fields.length; i++) {
		this._searchFieldIds[fields[i]] = Dwt.getNextId();
	}

	var html = [];
	var i = 0;
	
	html[i++] = "<div style='margin-top:10px' id='";
	html[i++] = this._searchTableId;
	html[i++] = "'>";

	html[i++] = "<table border=0 cellpadding=1 cellspacing=1 width=100%><tr>";
	
	var row = 0;
	for (var j = 0; j < fields.length; j++) {
		var isEven = ((j % 2) == 0);
		if (isEven) html[i++] = "<tr>";
		var sf = fields[j];
		var addButton = (row == 0 && j == 1);
		i = this._getSearchFieldHtml(sf, html, i, addButton);
		if (!isEven) html[i++] = "</tr>";
	}
			
	html[i++] = "</table></div>";
	
	// placeholder for the chooser
	html[i++] = "<div id='";
	html[i++] = this._chooserDivId;
	html[i++] = "'></div>";
	
	this.getHtmlElement().innerHTML = html.join("");
};

ZmApptChooserTabViewPage.prototype._getSearchFieldHtml =
function(id, html, i, addButton) {
	if (id == ZmApptChooserTabViewPage.SF_SOURCE) {
		// no need for source select if contacts and GAL aren't both supported
		if (!(this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED))) {
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

		html[i++] = "<input type='text' autocomplete='off' size=30 nowrap id='";
		html[i++] = this._searchFieldIds[id];
		html[i++] = "'>&nbsp;</td>";
	}

	if (addButton) {
		this._searchBtnTdId	= Dwt.getNextId();
		html[i++] = "<td id='";
		html[i++] = this._searchBtnTdId;
		html[i++] = "'></td>";
	}

	return i;
};

ZmApptChooserTabViewPage.prototype._addDwtObjects =
function() {

	// add search button
	if (this._searchBtnTdId) {
		var element = document.getElementById(this._searchBtnTdId);
		var searchButton = new DwtButton(this);
		searchButton.setText(ZmMsg.search);
		searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
		element.appendChild(searchButton.getHtmlElement());
	}

	// add select menu for contact source if we need one
	if (this._listSelectId) {
		var listSelect = document.getElementById(this._listSelectId);
		this._selectDiv = new DwtSelect(this);
		this._selectDiv.addOption(ZmMsg.contacts, true, ZmContactPicker.SEARCHFOR_CONTACTS);
		this._selectDiv.addOption(ZmMsg.GAL, false, ZmContactPicker.SEARCHFOR_GAL);
		listSelect.appendChild(this._selectDiv.getHtmlElement());
	}
   
	// add chooser
	this._chooser = new ZmApptChooser(this);
	var chooserDiv = document.getElementById(this._chooserDivId);
	chooserDiv.appendChild(this._chooser.getHtmlElement());

	// save search fields, and add handler for Return key to them	
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	for (var i = 0; i < fields.length; i++) {
		var sf = fields[i];
		var searchField = this._searchFields[sf] = document.getElementById(this._searchFieldIds[sf]);
		Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmApptChooserTabViewPage._keyPressHdlr);
	}
};

ZmApptChooserTabViewPage.prototype._searchButtonListener = 
function(ev) {
	if (this.type == ZmAppt.ATTENDEE) {
		this.searchContacts();
	} else {
		this.searchCalendarResources();
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
	this._query = AjxStringUtil.trim(document.getElementById(id).value);
	if (!this._query.length) return;
	
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		var searchFor = this._selectDiv.getSelectedOption().getValue();
		this._contactSource = (searchFor == ZmContactPicker.SEARCHFOR_CONTACTS) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
	} else {
		this._contactSource = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
	}
	// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
	this._chooser.sourceListView.enableSorting(this._contactSource == ZmItem.CONTACT);

	sortBy = sortBy ? sortBy : ZmApptChooserTabViewPage.SORT_BY[this.type];
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var params = {query: this._query, types: types, sortBy: sortBy, offset: 0,
				  limit: ZmContactPicker.SEARCHFOR_MAX, contactSource: this._contactSource};
	var search = new ZmSearch(this._appCtxt, params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchContacts)});
};

ZmApptChooserTabViewPage.prototype._handleResponseSearchContacts = 
function(result) {
	var resp = result.getResponse();
	this._chooser.setItems(resp.getResults(ZmItem.CONTACT).getVector());
};

ZmApptChooserTabViewPage.prototype.searchCalendarResources = 
function(sortBy) {
	var fields = ZmApptChooserTabViewPage.SEARCH_FIELDS[this.type];
	var conds = [];
	var value = (this.type == ZmAppt.LOCATION) ? "Location" : "Equipment";
	conds.push({attr: "zimbraCalResType", op: "eq", value: value});
	for (var i = 0; i < fields.length; i++) {
		var sf = fields[i];
		var searchField = document.getElementById(this._searchFieldIds[sf]);
		value = searchField.value;
		if (value) {
			var attr = ZmApptChooserTabViewPage.SF_ATTR[sf];
			var op = ZmApptChooserTabViewPage.SF_OP[sf] ? ZmApptChooserTabViewPage.SF_OP[sf] : "has";
			conds.push({attr: attr, op: op, value: value});
		}
	}
	var params = {sortBy: sortBy, offset: 0, limit: ZmContactPicker.SEARCHFOR_MAX, conds: conds,
				  attrs: ZmApptChooserTabViewPage.ATTRS[this.type]};
	var search = new ZmSearch(this._appCtxt, params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearchCalendarResources)});
};

ZmApptChooserTabViewPage.prototype._handleResponseSearchCalendarResources = 
function(result) {
	var resp = result.getResponse();
	this._chooser.setItems(resp.getResults(ZmItem.CONTACT).getVector());
};

ZmApptChooserTabViewPage._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev);
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (stb._keyPressCallback && (charCode == 13 || charCode == 3)) {
		stb._keyPressCallback.run();
	    return false;
	}
	return true;
};

/***********************************************************************************/

/**
* This class creates a specialized chooser for the attendee picker.
*
* @param parent			[DwtComposite]	the attendee tab view
* @param buttonInfo		[array]			transfer button IDs and labels
*/
function ZmApptChooser(parent, buttonInfo) {
	DwtChooser.call(this, parent, null, buttonInfo, DwtChooser.VERT_STYLE, true);
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
	details.chooserType = this.parent.type;
	DwtChooser.prototype._notify.call(this, event, details);
};

/***********************************************************************************/

/**
* This class creates a specialized source list view for the contact chooser.
*/
function ZmApptChooserListView(parent, type, chooserType) {

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
		var width = ZmApptChooserTabViewPage.COL_WIDTH[id];
		headerList.push(new DwtListHeaderItem(id, label, null, width));
	}
	
	return headerList;
};

// The items are ZmEmailAddress objects
ZmApptChooserListView.prototype._createItemHtml =
function(item) {

	var div = document.createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;

	var html = [];
	var idx = 0;

	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>";
	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmApptChooserTabViewPage.ID_NAME) == 0) {
			var name = (this._chooserType == ZmAppt.ATTENDEE) ? item.getFullName() : item.getAttr("displayName");
			html[idx++] = this._getField(i, name);
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_EMAIL) == 0) {
			html[idx++] = this._getField(i, item.getEmail());
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_WORK_PHONE) == 0) {
			html[idx++] = this._getField(i, item.getAttr(ZmContact.F_workPhone));
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_HOME_PHONE) == 0) {
			html[idx++] = this._getField(i, item.getAttr(ZmContact.F_homePhone));
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_LOCATION) == 0) {
			var a;
			var site = item.getAttr("zimbraCalResSite");
			if (site) {
				var building, floor, room;
				var buildingText = (building = item.getAttr("zimbraCalResBuilding")) ? [ZmMsg.building, ": ", building].join("") : null;
				var floorText = (floor = item.getAttr("zimbraCalResFloor")) ? [ZmMsg.floor, ": ", floor].join("") : null;
				var roomText = (room = item.getAttr("zimbraCalResRoom")) ? [ZmMsg.room, ": ", room].join("") : null;
				a = [site, buildingText, floorText, roomText];
			} else {
				a = [site, item.getAttr("street"), item.getAttr("l"), item.getAttr("st"), item.getAttr("co")];
			}
			var loc = AjxUtil.collapseList(a).join(", ");
			html[idx++] = this._getField(i, loc);
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_CONTACT) == 0) {
			html[idx++] = this._getField(i, item.getAttr("zimbraCalResContactEmail"));
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_CAPACITY) == 0) {
			html[idx++] = this._getField(i, item.getAttr("zimbraCalResCapacity"), 'right');
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_NOTES) == 0) {
			var notes = item.getAttr("zimbraNotes");
			if (notes) {
				var notesId = Dwt.getNextId();
				this._notes[notesId] = notes;
				html[idx++] = "<td align='center' width=" + this._headerList[i]._width + ">";
				html[idx++] = AjxImg.getImageHtml("SearchNotes", null, ["id='", notesId, "'"].join(""));
				html[idx++] = "</td>";					
			} else {
				html[idx++] = this._getField(i, notes);
			}
		}
	}
	html[idx++] = "</tr></table>";
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
		
	return div;
};

ZmApptChooserListView.prototype._getField =
function(index, value, align) {
	var width = this._headerList[index]._width;
	var widthText = width ? "width='" + width + "'" : "";
	var alignText = align ? "align='" + align + "'" : "";
	value = value ? value : "";
	return "<td " + alignText + widthText + ">&nbsp;" + value + "</td>";
};

ZmApptChooserListView.prototype._mouseOverAction =
function(ev, div) {
	DwtListView.prototype._mouseOverAction.call(this, ev, div);
	var id = ev.target.id || div.id;
	if (!id) return true;
	
	var note = this._notes[id];
	if (note)
		this.setToolTipContent(note);

	return true;
}
