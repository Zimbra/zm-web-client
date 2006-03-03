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
* Creates a dialog that lets the user select addresses from a contact list.
* @constructor
* @class
* This class creates and manages a dialog that lets the user select addresses 
* from a contact list. Two lists are maintained, one with contacts to select 
* from, and one that contains the selected addresses. Between them are buttons 
* to shuffle addresses back and forth between the two lists.
*
* @author Conrad Damon
* @param appCtxt		[ZmAppCtxt]		app context
* @param buttonInfo		[array]			transfer button IDs and labels
*/
function ZmContactPicker(appCtxt, buttonInfo) {

	DwtDialog.call(this, appCtxt.getShell(), null, ZmMsg.selectAddresses);
	
	this._appCtxt = appCtxt;
	this._buttonInfo = buttonInfo;
	this._initialized = false;
};

ZmContactPicker.prototype = new DwtDialog;
ZmContactPicker.prototype.constructor = ZmContactPicker;

// Consts

ZmContactPicker.SEARCHFOR_CONTACTS 	= 1;
ZmContactPicker.SEARCHFOR_GAL 		= 2;
ZmContactPicker.SEARCHFOR_MAX 		= 50;

ZmContactPicker.ID_ICON 		= "i--";
ZmContactPicker.ID_PARTICIPANT 	= "p--";
ZmContactPicker.ID_EMAIL 		= "e--";

ZmContactPicker.CHOOSER_HEIGHT = 300;

// Public methods

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
* @param buttonId	[string]*	button ID of the button that called us
* @param addrs		[hash]*		hash of 3 vectors (one for each type of address)
* @param str		[string]*	initial search string
*/
ZmContactPicker.prototype.popup =
function(buttonId, addrs, str) {
	if (!this._initialized) {
		this._initialize();
		this._initialized = true;
	}

	// reset column sorting preference
	this._chooser.sourceListView.setSortByAsc(ZmItem.F_PARTICIPANT, true);

	// reset button states
	this._chooser.reset();
	if (buttonId) {
		this._chooser._setActiveButton(buttonId);
	}
	
	// populate target list if addrs were passed in
	if (addrs) {
		for (var id in addrs) {
			if (this._button[id]) {
				this._chooser.transfer(addrs[id], id);
			}
		}
	}
	
	// reset search field
	var searchField = document.getElementById(this._searchFieldId);
	searchField.disabled = false;
	searchField.focus();
	searchField.value = str ? str : "";
	
	DwtDialog.prototype.popup.call(this);
};

/**
* Closes the dialog
*/
ZmContactPicker.prototype.popdown =
function() {
	// disable search field (hack to fix bleeding cursor)
	var searchField = document.getElementById(this._searchFieldId);
	searchField.disabled = true;
	this._query = null;
	this._contactSource = null;

	DwtDialog.prototype.popdown.call(this);
};

ZmContactPicker.prototype._contentHtml = 
function() {
	this._searchFieldId	= Dwt.getNextId();
	this._searchBtnTdId	= Dwt.getNextId();
	this._listSelectId	= Dwt.getNextId();
	this._chooserDivId	= Dwt.getNextId();

	var html = [];
	var idx = 0;
	
	html[idx++] = "<div class='ZmContactPicker'>";
	html[idx++] = "<table border=0 cellpadding=1 cellspacing=1 width=100%><tr><td>";
	// add search input field and search button
	html[idx++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td width=20 valign=middle>";
	html[idx++] = AjxImg.getImageHtml("Search");
	html[idx++] = "</td><td><input type='text' autocomplete='off' size=30 nowrap id='";
	html[idx++] = this._searchFieldId;
	html[idx++] = "'>&nbsp;</td><td id='";
	html[idx++] = this._searchBtnTdId;
	html[idx++] = "'></td></tr></table>";
	html[idx++] = "</td><td align=right>";
	// add placeholder for drop down select widget
	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED) && this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
		html[idx++] = "<table border=0 cellpadding=0 cellspacing=0><tr><td class='Label nobreak'>";
		html[idx++] = ZmMsg.showNames;
		html[idx++] = ":&nbsp;</td><td id='";
		html[idx++] = this._listSelectId;
		html[idx++] = "'></td></tr></table>";
	}
	html[idx++] = "</td></tr></table>";
	
	// placeholder for the chooser
	html[idx++] = "<div id='";
	html[idx++] = this._chooserDivId;
	html[idx++] = "'></div>";
	
	html[idx++] = "</div>";

	return html.join("");
};

// called only when ZmContactPicker is first created. Sets up initial layout.
ZmContactPicker.prototype._initialize = 
function() {

	// create static content and append to dialog parent	
	this.setContent(this._contentHtml());
	
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
	this._chooser = new ZmContactChooser(this, this._buttonInfo);
	var chooserDiv = document.getElementById(this._chooserDivId);
	chooserDiv.appendChild(this._chooser.getHtmlElement());
	this._chooser.resize(this.getSize().x, ZmContactPicker.CHOOSER_HEIGHT);

    // init listeners
	this.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._okButtonListener));
	this.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._cancelButtonListener));
	
	var searchField = document.getElementById(this._searchFieldId);
	Dwt.setHandler(searchField, DwtEvent.ONKEYPRESS, ZmContactPicker._keyPressHdlr);
	this._keyPressCallback = new AjxCallback(this, this._searchButtonListener);
};

// Listeners

ZmContactPicker.prototype._searchButtonListener = 
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

/**
* Performs a contact search (in either personal contacts or in the GAL) and populates
* the source list view with the results.
*
* @param columnItem		[constant]		ID of column to sort by
* @param ascending		[boolean]		if true, sort in ascending order
*/
ZmContactPicker.prototype.search = 
function(columnItem, ascending) {
	var sortBy = ascending ? ZmSearch.NAME_ASC : ZmSearch.NAME_DESC;
	var types = AjxVector.fromArray([ZmItem.CONTACT]);
	var params = {query: this._query, types: types, sortBy: sortBy, offset: 0, limit: ZmContactPicker.SEARCHFOR_MAX, contactSource: this._contactSource};
	var search = new ZmSearch(this._appCtxt, params);
	search.execute({callback: new AjxCallback(this, this._handleResponseSearch)});
};

ZmContactPicker.prototype._handleResponseSearch = 
function(result) {
	var resp = result.getResponse();

	if (this._list && this._list.size())
		this._list.clear();
	
	this._list = resp.getResults(ZmItem.CONTACT);
	
	// Take the contacts and create a list of their email addresses (a contact may have more than one)
	var list = [];
	var a = this._list.getArray();
	for (var i = 0; i < a.length; i++) {
		var contact = a[i];
		var emails = contact.getEmails();
		for (var j = 0; j < emails.length; j++) {
			var email = new ZmEmailAddress(emails[j], null, contact.getFullName());
			email.id = Dwt.getNextId();
			list.push(email);
		}
	}
	this._chooser.setItems(AjxVector.fromArray(list));
};

// Done choosing addresses, add them to the compose form
ZmContactPicker.prototype._okButtonListener =
function(ev) {
	var data = this._chooser.getItems();
	DwtDialog.prototype._buttonListener.call(this, ev, [data]);
}

// Call custom popdown method
ZmContactPicker.prototype._cancelButtonListener =
function(ev) {
	DwtDialog.prototype._buttonListener.call(this, ev);
	this.popdown();
};

ZmContactPicker._keyPressHdlr =
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
* This class creates a specialized chooser for the contact picker.
*
* @param parent			[DwtComposite]	the contact picker
* @param buttonInfo		[array]			transfer button IDs and labels
*/
function ZmContactChooser(parent, buttonInfo) {
	DwtChooser.call(this, parent, null, buttonInfo, DwtChooser.HORIZ_STYLE, true);
};

ZmContactChooser.prototype = new DwtChooser;
ZmContactChooser.prototype.constructor = ZmContactChooser;

ZmContactChooser.prototype._createSourceListView =
function() {
	return new ZmContactChooserSourceListView(this);
};

ZmContactChooser.prototype._createTargetListView =
function() {
	return new ZmContactChooserTargetListView(this, (this._buttonInfo.length > 1));
};

/*
* The item is a ZmEmailAddress. Its address is used for comparison.
*
* @param item	[ZmEmailAddress]	an email address
* @param list	[AjxVector]			list to check in
*/
ZmContactChooser.prototype._isDuplicate =
function(item, list) {
	return list.containsLike(item, item.getAddress);	
};

/***********************************************************************************/

/**
* This class creates a specialized source list view for the contact chooser.
*/
function ZmContactChooserSourceListView(parent) {

	DwtChooserListView.call(this, parent, DwtChooserListView.SOURCE);
};

ZmContactChooserSourceListView.prototype = new DwtChooserListView;
ZmContactChooserSourceListView.prototype.constructor = ZmContactChooserSourceListView;

ZmContactChooserSourceListView.prototype.toString = 
function() {
	return "ZmContactChooserSourceListView";
};

ZmContactChooserSourceListView.prototype._getHeaderList = 
function() {
	var headerList = [];
	headerList.push(new DwtListHeaderItem(ZmContactPicker.ID_PARTICIPANT, ZmMsg._name, null, 100, ZmItem.F_PARTICIPANT));
	headerList.push(new DwtListHeaderItem(ZmContactPicker.ID_EMAIL, ZmMsg.email));
	
	return headerList;
};

// The items are ZmEmailAddress objects
ZmContactChooserSourceListView.prototype._createItemHtml =
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
		if (id.indexOf(ZmContactPicker.ID_PARTICIPANT) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + item.name + "</td>";
		} else if (id.indexOf(ZmContactPicker.ID_EMAIL) == 0) {
			html[idx++] = "<td>&nbsp;" + item.address + "</td>";
		}
	}
	html[idx++] = "</tr></table>";
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
		
	return div;
};

/***********************************************************************************/

/**
* This class creates a specialized target list view for the contact chooser.
*/
function ZmContactChooserTargetListView(parent, showType) {

	this._showType = showType;
	DwtChooserListView.call(this, parent, DwtChooserListView.TARGET);
};

ZmContactChooserTargetListView.prototype = new DwtChooserListView;
ZmContactChooserTargetListView.prototype.constructor = ZmContactChooserTargetListView;

ZmContactChooserTargetListView.prototype.toString = 
function() {
	return "ZmContactChooserTargetListView";
};

ZmContactChooserTargetListView.prototype._getHeaderList = 
function() {
	var headerList = [];
	if (this._showType) {
		headerList.push(new DwtListHeaderItem(ZmContactPicker.ID_ICON, null, "ContactsPicker", 20));
	}
	headerList.push(new DwtListHeaderItem(ZmContactPicker.ID_PARTICIPANT, ZmMsg._name, null, 100));
	headerList.push(new DwtListHeaderItem(ZmContactPicker.ID_EMAIL, ZmMsg.email));
	
	return headerList;
};

// The items are ZmEmailAddress objects
ZmContactChooserTargetListView.prototype._createItemHtml =
function(item) {

	item.setType(item._buttonId);

	var div = document.createElement("div");
	div._styleClass = "Row";
	div._selectedStyleClass = div._styleClass + '-' + DwtCssStyle.SELECTED;
	div.className = div._styleClass;
			
	var html = [];
	var idx = 0;

	html[idx++] = "<table cellpadding=0 cellspacing=0 border=0 width=100%><tr>";
	for (var i = 0; i < this._headerList.length; i++) {
		var id = this._headerList[i]._id;
		if (id.indexOf(ZmContactPicker.ID_ICON) == 0 && this._showType) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">" + ZmMsg[item.getTypeAsString()] + ":</td>";
		} else if (id.indexOf(ZmContactPicker.ID_PARTICIPANT) == 0) {
			html[idx++] = "<td width=" + this._headerList[i]._width + ">&nbsp;" + item.name + "</td>";
		} else if (id.indexOf(ZmContactPicker.ID_EMAIL) == 0) {
			html[idx++] = "<td>&nbsp;" + item.address + "</td>";
		}
	}
	html[idx++] = "</tr></table>";
		
	div.innerHTML = html.join("");
		
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);
		
	return div;
};
