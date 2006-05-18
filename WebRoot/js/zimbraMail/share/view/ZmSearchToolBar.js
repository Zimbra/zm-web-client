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
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmSearchToolBar(appCtxt, parent, posStyle) {

	this._appCtxt = appCtxt;
	ZmToolBar.call(this, parent, "ZmSearchToolbar");

	var fieldId = Dwt.getNextId();
	var searchColId = Dwt.getNextId();
	var browseColId = Dwt.getNextId();
	var saveColId = Dwt.getNextId();
	var navColId = Dwt.getNextId();
	var searchMenuColId = Dwt.getNextId();

	this._tabGroup = new DwtTabGroup(this.toString());
	this._createHtml(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId);

	this._searchField = document.getElementById(fieldId);
	Dwt.setHandler(this._searchField, DwtEvent.ONKEYPRESS, ZmSearchToolBar._keyPressHdlr);
	
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[groupBy]];
    this._searchButton = this._createButton(ZmSearchToolBar.SEARCH_BUTTON, null, ZmMsg.search, null, tooltip, true, "InsetTBButton");
     document.getElementById(searchColId).appendChild(this._searchButton.getHtmlElement());

	this._searchMenuButton = this._createButton(ZmSearchToolBar.SEARCH_MENU_BUTTON, "MailFolder", null, null, ZmMsg.chooseSearchType, true, "InsetTBButton");
	this._searchMenuButton.noMenuBar = true;
    document.getElementById(searchMenuColId).appendChild(this._searchMenuButton.getHtmlElement());
	var menuParent = this._searchMenuButton;
    var menu = new DwtMenu(menuParent, null, "ActionMenu");
    menuParent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);

    var mi = DwtMenuItem.create(menu, "SearchMail", ZmMsg.searchMail, null, true, DwtMenuItem.RADIO_STYLE, 0);
	mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_MAIL_MI);

	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchContacts", ZmMsg.searchPersonalContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.CONTACT);
	}

	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		// XXX: use different icon?
		mi = DwtMenuItem.create(menu, "SearchGAL", ZmMsg.searchPersonalAndShared, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_PAS_MI);
	}

	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchGAL", ZmMsg.searchGALContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_GAL_MI);
	}
/*
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchCalendar", ZmMsg.searchCalendar, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.APPT);
	}
*/
	if (this._appCtxt.get(ZmSetting.NOTES_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchNotes", ZmMsg.searchNotes, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.NOTE);
	}

	if (this._appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED)) {
		mi = new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
		mi = DwtMenuItem.create(menu, "SearchAll", ZmMsg.searchAll, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_ANY_MI);
	}

	this._tabGroup.addMember(this._searchField);
	this._tabGroup.addMember(this._searchButton);
	
	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._saveButton = this._createButton(ZmSearchToolBar.SAVE_BUTTON, "Save", null, "SaveDis", ZmMsg.saveCurrentSearch, true, "InsetTBButton");
	    document.getElementById(saveColId).appendChild(this._saveButton.getHtmlElement());
		this._tabGroup.addMember(this._saveButton);
	}
	
	if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		var buttonStyle = DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE;
		this._browseButton = this._createButton(ZmSearchToolBar.BROWSE_BUTTON, null, ZmMsg.searchBuilder, null, ZmMsg.openSearchBuilder, true, "InsetTBButton", buttonStyle);
	    document.getElementById(browseColId).appendChild(this._browseButton.getHtmlElement());
		this._tabGroup.addMember(this._browseButton);
	}

	
	DBG.println("DUMPING TG");
	this._tabGroup.dump();
	
}

ZmSearchToolBar.BROWSE_BUTTON 		= 1;
ZmSearchToolBar.SEARCH_BUTTON 		= 2;
ZmSearchToolBar.SAVE_BUTTON 		= 3;
ZmSearchToolBar.SEARCH_MENU_BUTTON 	= 4;

ZmSearchToolBar.SEARCH_FIELD_SIZE 	= 48;
ZmSearchToolBar.UNICODE_CHAR_RE 	= /\S/;

ZmSearchToolBar.MENUITEM_ID = "_menuItemId";

ZmSearchToolBar.FOR_MAIL_MI	= ZmItem.MAX + 1;
ZmSearchToolBar.FOR_PAS_MI 	= ZmItem.MAX + 2; // Personal and Shared
ZmSearchToolBar.FOR_GAL_MI	= ZmItem.MAX + 3; // Global Address List
ZmSearchToolBar.FOR_ANY_MI	= ZmItem.MAX + 4;

// XXX: are these used anywhere??
ZmSearchToolBar.MSG_KEY = new Object();
ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_MAIL_MI] = "searchMail";
ZmSearchToolBar.MSG_KEY[ZmItem.CONTACT] = "searchContacts";
ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_GAL_MI] = "searchGALContacts";
ZmSearchToolBar.MSG_KEY[ZmItem.APPT] = "searchCalendar";
ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchAll";

ZmSearchToolBar.TT_MSG_KEY = new Object();
ZmSearchToolBar.TT_MSG_KEY[ZmItem.MSG] = "searchForMessages";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.CONV] = "searchForConvs";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.CONTACT] = "searchPersonalContacts";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_PAS_MI] = "searchPersonalAndShared";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_GAL_MI] = "searchGALContacts";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.APPT] = "searchForAppts";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchForAny";

ZmSearchToolBar.ICON_KEY = new Object();
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_MAIL_MI] = "MailFolder";
ZmSearchToolBar.ICON_KEY[ZmItem.CONTACT] = "ContactsFolder";
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_PAS_MI] = "GAL"; // XXX: new icon?
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_GAL_MI] = "GAL";
ZmSearchToolBar.ICON_KEY[ZmItem.APPT] = "CalendarFolder";
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_ANY_MI] = "Globe";

ZmSearchToolBar.prototype = new ZmToolBar;
ZmSearchToolBar.prototype.constructor = ZmSearchToolBar;

ZmSearchToolBar.prototype.toString = 
function() {
	return "ZmSearchToolBar";
}

// Public methods

ZmSearchToolBar.prototype.getSearchField =
function() {
	return this._searchField;
}

ZmSearchToolBar.prototype.getNavToolBar = 
function() {
	return this._navToolbar;
}

ZmSearchToolBar.prototype.getTabGroup =
function() {
	return this._tabGroup;
}

ZmSearchToolBar.prototype.registerCallback =
function(func, obj) {
	this._callback = new AjxCallback(obj, func);
}

ZmSearchToolBar.prototype.focus =
function() {
	this._searchField.focus();
}

ZmSearchToolBar.prototype.setEnabled =
function(enable) {
	this._searchField.disabled = !enable;
	this._searchButton.setEnabled(enable);
}

ZmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
	if (value != this._searchField.value)
		this._searchField.value = value;
}

ZmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField.value;
}

ZmSearchToolBar._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev); // get ZmSearchToolBar object
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		stb._callback.run(stb._searchField.value);
	    return false;
	}
	return true;
}

ZmSearchToolBar.prototype._createHtml =
function(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId) {
	var html = new Array();
	var i = 0;
	html[i++] = "<table style='height:auto;width:100%;height:100%;border-collapse:collapse;'>";
	html[i++] = "<tr><td id='";
	html[i++] = searchMenuColId;
	html[i++] = "'></td><td width='100%'><input type='text' autocomplete='off' nowrap id='";
	html[i++] = fieldId;
	html[i++] = "' class='search_input'></td><td id='";
	html[i++] = searchColId;
	html[i++] = "'></td><td id='";
	html[i++] = saveColId;
	html[i++] = "'></td>";
	if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		html[i++] = "<td><div class='vertSep'></div></td>";
		html[i++] = "<td id='";
		html[i++] = browseColId;
		html[i++] = "'></td>";
	}
	html[i++] = "</tr></table>";

	this.getHtmlElement().innerHTML = html.join("");	
}
