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
* Creates a new tab view that can be used to choose attendees.
* @constructor
* @class
* This class allows the user to search their contacts or the GAL for attendees
* to add to the appointment.
*
* @author Conrad Damon
*
* @param parent			the element that created this view
* @param appCtxt 		app context
* @param type		[constant]		chooser page type
*/
function ZmApptChooserTabViewPage(parent, appCtxt, type) {

	DwtTabViewPage.call(this, parent);

	this._appCtxt = appCtxt;
	this.type = type;

	this.setScrollStyle(DwtControl.CLIP);
	this._rendered = false;
};

// List view columns
ZmApptChooserTabViewPage.ID_FULL_NAME	= "a--";
ZmApptChooserTabViewPage.ID_EMAIL		= "b--";
ZmApptChooserTabViewPage.ID_WORK_PHONE	= "c--";
ZmApptChooserTabViewPage.ID_HOME_PHONE	= "d--";

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

ZmApptChooserTabViewPage.prototype._createHtml =
function() {

	this._searchTableId	= Dwt.getNextId();
	this._searchFieldId	= Dwt.getNextId();
	this._searchBtnTdId	= Dwt.getNextId();
	this._listSelectId	= Dwt.getNextId();
	this._chooserDivId	= Dwt.getNextId();

	var html = [];
	var i = 0;
	
	html[i++] = "<div style='margin-top:10px' id='";
	html[i++] = this._searchTableId;
	html[i++] = "'>";

	html[i++] = "<table border=0 cellpadding=1 cellspacing=1 width=100%><tr><td>";
	// add search input field and search button
	html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td width=20 valign=middle>";
	html[i++] = AjxImg.getImageHtml("Search");
	html[i++] = "</td><td><input type='text' autocomplete='off' size=30 nowrap id='";
	html[i++] = this._searchFieldId;
	html[i++] = "'>&nbsp;</td><td id='";
	html[i++] = this._searchBtnTdId;
	html[i++] = "'></td></tr></table>";
	html[i++] = "</td><td align=right>";
	// add placeholder for drop down select widget
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		html[i++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td class='Label nobreak'>";
		html[i++] = ZmMsg.showNames;
		html[i++] = ":&nbsp;</td><td id='";
		html[i++] = this._listSelectId;
		html[i++] = "'></td></tr></table>";
	}
	html[i++] = "</td></tr></table></div>";
	
	// placeholder for the chooser
	html[i++] = "<div id='";
	html[i++] = this._chooserDivId;
	html[i++] = "'></div>";
	
	this.getHtmlElement().innerHTML = html.join("");
};

ZmApptChooserTabViewPage.prototype._addDwtObjects =
function() {

	// add search button
	var searchSpan = document.getElementById(this._searchBtnTdId);
	var searchButton = new DwtButton(this);
	searchButton.setText(ZmMsg.search);
	searchButton.addSelectionListener(new AjxListener(this, this._searchButtonListener));
	searchSpan.appendChild(searchButton.getHtmlElement());

	// add select menu
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
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
	
	var searchField = document.getElementById(this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmApptChooserTabViewPage._keyPressHdlr);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
};

ZmApptChooserTabViewPage.prototype._searchButtonListener = 
function(ev) {
	this._query = AjxStringUtil.trim(document.getElementById(this._searchFieldId).value);
	if (this._query.length) {
		if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
			var searchFor = this._selectDiv.getSelectedOption().getValue();
			this._contactSource = (searchFor == ZmContactPicker.SEARCHFOR_CONTACTS) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		} else {
			this._contactSource = this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) ? ZmItem.CONTACT : ZmSearchToolBar.FOR_GAL_MI;
		}
		// XXX: line below doesn't have intended effect (turn off column sorting for GAL search)
		this._chooser.sourceListView.enableSorting(this._contactSource == ZmItem.CONTACT);
		this.search(ZmItem.F_PARTICIPANT, true);
	}
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

/**
* Performs a contact search (in either personal contacts or in the GAL) and populates
* the source list view with the results.
*
* @param columnItem		[constant]		ID of column to sort by
* @param ascending		[boolean]		if true, sort in ascending order
*/
ZmApptChooserTabViewPage.prototype.search = 
function(columnItem, ascending) {
	var sortBy = ascending ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var params = {query: this._query, types: types, sortBy: sortBy, offset: 0, limit: ZmContactPicker.SEARCHFOR_MAX, contactSource: this._contactSource};
	var search = new ZmSearch(this._appCtxt, params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearch)});
};

ZmApptChooserTabViewPage.prototype._handleResponseSearch = 
function(result) {
	var resp = result.getResponse();
	this._chooser.setItems(resp.getResults(ZmItem.CONTACT).getVector());
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
	return new ZmApptChooserListView(this, DwtChooserListView.SOURCE);
};

ZmApptChooser.prototype._createTargetListView =
function() {
	return new ZmApptChooserListView(this, DwtChooserListView.TARGET);
};

/*
* The item is a ZmEmailAddress. Its address is used for comparison.
*
* @param item	[ZmEmailAddress]	an email address
* @param list	[AjxVector]			list to check in
*/
ZmApptChooser.prototype._isDuplicate =
function(item, list) {
	return list.containsLike(item, item.getEmail);	
};

/***********************************************************************************/

/**
* This class creates a specialized source list view for the contact chooser.
*/
function ZmApptChooserListView(parent, type) {

	DwtChooserListView.call(this, parent, type);
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
	headerList.push(new DwtListHeaderItem(ZmApptChooserTabViewPage.ID_FULL_NAME, ZmMsg._name, null, 100));
	headerList.push(new DwtListHeaderItem(ZmApptChooserTabViewPage.ID_EMAIL, ZmMsg.email));
	headerList.push(new DwtListHeaderItem(ZmApptChooserTabViewPage.ID_WORK_PHONE, ZmMsg.AB_FIELD_workPhone, null, 100));
	headerList.push(new DwtListHeaderItem(ZmApptChooserTabViewPage.ID_HOME_PHONE, ZmMsg.AB_FIELD_homePhone, null, 100));
	
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
		if (id.indexOf(ZmApptChooserTabViewPage.ID_FULL_NAME) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + AjxStringUtil.makeString(item.getFullName()) + "</td>";
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_EMAIL) == 0) {
			html[idx++] = "<td>&nbsp;" + AjxStringUtil.makeString(item.getEmail()) + "</td>";
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_WORK_PHONE) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + AjxStringUtil.makeString(item.getAttr(ZmContact.F_workPhone)) + "</td>";
		} else if (id.indexOf(ZmApptChooserTabViewPage.ID_HOME_PHONE) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + AjxStringUtil.makeString(item.getAttr(ZmContact.F_homePhone)) + "</td>";
		}
	}
	html[idx++] = "</tr></table>";
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
		
	return div;
};
