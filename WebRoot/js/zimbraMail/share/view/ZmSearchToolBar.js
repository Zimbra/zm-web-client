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
	var saveColId = this._saveColId = Dwt.getNextId();
	var navColId = Dwt.getNextId();
	var searchMenuColId = Dwt.getNextId();

	this._customSearchBtnListener = new AjxListener(this, this._customSearchBtnListener);

	this._createHtml(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId);

	this._searchField = document.getElementById(fieldId);
	Dwt.setHandler(this._searchField, DwtEvent.ONKEYPRESS, ZmSearchToolBar._keyPressHdlr);

	this._searchMenuButton = this._createButton(ZmSearchToolBar.SEARCH_MENU_BUTTON, "MailFolder", ZmMsg.searchMail,
						    null, ZmMsg.chooseSearchType, true, "DwtToolbarButton");
    document.getElementById(searchMenuColId).appendChild(this._searchMenuButton.getHtmlElement());
	var menuParent = this._searchMenuButton;
    var menu = new DwtMenu(menuParent, null, "ActionMenu");
    menuParent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);

	var numTypes = 0;
    var mi = DwtMenuItem.create(menu, "SearchMail", ZmMsg.searchMail, null, true, DwtMenuItem.RADIO_STYLE, 0);
	mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_MAIL_MI);
	numTypes++;

	if (this._appCtxt.get(ZmSetting.CONTACTS_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchContacts", ZmMsg.searchPersonalContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.CONTACT);
		numTypes++;

		if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
			mi = DwtMenuItem.create(menu, "SearchSharedContacts", ZmMsg.searchPersonalAndShared, null, true, DwtMenuItem.RADIO_STYLE, 0);
			mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_PAS_MI);
			numTypes++;
		}
	}

	if (this._appCtxt.get(ZmSetting.GAL_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchGAL", ZmMsg.searchGALContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_GAL_MI);
		numTypes++;
	}
/*
	if (this._appCtxt.get(ZmSetting.CALENDAR_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchCalendar", ZmMsg.searchCalendar, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.APPT);
		numTypes++;
	}
*/
	if (this._appCtxt.get(ZmSetting.NOTES_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchNotes", ZmMsg.searchNotes, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.NOTE);
		numTypes++;
	}

	if (this._appCtxt.get(ZmSetting.NOTEBOOK_ENABLED)) {
	    mi = DwtMenuItem.create(menu, "SearchNotes", ZmMsg.searchNotebooks, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmItem.PAGE);
		numTypes++;
	}

	if ((numTypes > 1) && this._appCtxt.get(ZmSetting.MIXED_VIEW_ENABLED)) {
		mi = new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
		mi = DwtMenuItem.create(menu, "SearchAll", ZmMsg.searchAll, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_ANY_MI);
	}

	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	var tooltip = ZmMsg[ZmSearchToolBar.TT_MSG_KEY[groupBy]];
// 	this._searchButton = this._createButton(ZmSearchToolBar.SEARCH_BUTTON, null, ZmMsg.search, null, tooltip, true, "DwtToolbarButton");
// 	document.getElementById(searchColId).appendChild(this._searchButton.getHtmlElement());

	if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
		this._saveButton = this._createButton(ZmSearchToolBar.SAVE_BUTTON, "Save", null, "SaveDis", ZmMsg.saveCurrentSearch, true, "DwtToolbarButton");
	    document.getElementById(saveColId).appendChild(this._saveButton.getHtmlElement());
	}

	if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
		var buttonStyle = DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE;
		this._browseButton = this._createButton(ZmSearchToolBar.BROWSE_BUTTON, null, ZmMsg.searchBuilder, null, ZmMsg.openSearchBuilder, true, "DwtToolbarButton", buttonStyle);
	    document.getElementById(browseColId).appendChild(this._browseButton.getHtmlElement());
	}
};

ZmSearchToolBar.BROWSE_BUTTON 		= 1;
ZmSearchToolBar.SEARCH_BUTTON 		= 2;
ZmSearchToolBar.SAVE_BUTTON 		= 3;
ZmSearchToolBar.SEARCH_MENU_BUTTON 	= 4;
ZmSearchToolBar.CUSTOM_SEARCH_BUTTON    = 5;

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
ZmSearchToolBar.MSG_KEY[ZmItem.PAGE] = "searchNotebooks";
ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchAll";

ZmSearchToolBar.TT_MSG_KEY = new Object();
ZmSearchToolBar.TT_MSG_KEY[ZmItem.MSG] = "searchForMessages";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.CONV] = "searchForConvs";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.CONTACT] = "searchPersonalContacts";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_PAS_MI] = "searchPersonalAndShared";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_GAL_MI] = "searchGALContacts";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.APPT] = "searchForAppts";
ZmSearchToolBar.TT_MSG_KEY[ZmItem.PAGE] = "searchForPages";
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchForAny";

ZmSearchToolBar.ICON_KEY = new Object();
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_MAIL_MI] = "MailFolder";
ZmSearchToolBar.ICON_KEY[ZmItem.CONTACT] = "ContactsFolder";
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_PAS_MI] = "GAL"; // XXX: new icon?
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_GAL_MI] = "GAL";
ZmSearchToolBar.ICON_KEY[ZmItem.APPT] = "CalendarFolder";
ZmSearchToolBar.ICON_KEY[ZmItem.PAGE] = "Notebook";
ZmSearchToolBar.ICON_KEY[ZmSearchToolBar.FOR_ANY_MI] = "Globe";

ZmSearchToolBar.prototype = new ZmToolBar;
ZmSearchToolBar.prototype.constructor = ZmSearchToolBar;

ZmSearchToolBar.prototype.toString =
function() {
	return "ZmSearchToolBar";
};

// Public methods

ZmSearchToolBar.prototype.getSearchField =
function() {
	return this._searchField;
};

ZmSearchToolBar.prototype.getNavToolBar =
function() {
	return this._navToolbar;
};

ZmSearchToolBar.prototype.registerCallback =
function(func, obj) {
	this._callback = new AjxCallback(obj, func);
};

ZmSearchToolBar.prototype.focus =
function() {
	this._searchField.focus();
};

ZmSearchToolBar.prototype.setEnabled =
function(enable) {
	this._searchField.disabled = !enable;
	// this._searchButton.setEnabled(enable);
	this._searchMenuButton.setEnabled(enable);
};

ZmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
	if (value != this._searchField.value)
		this._searchField.value = value;
};

ZmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField.value;
};

ZmSearchToolBar._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev); // get ZmSearchToolBar object
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		stb._callback.run(stb._searchField.value);
	    return false;
	}
	return true;
};

ZmSearchToolBar.prototype._createHtml =
function(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId) {
	var html = new Array();
	var i = 0;
	html[i++] = "<table style='height:auto;width:100%;height:100%;border-collapse:collapse;'>";
	html[i++] = "<tr><td>&nbsp;" + ZmMsg.find + ":&nbsp;</td>";
	html[i++] = "<td width='100%'><input type='text' autocomplete='off' nowrap id='";
	html[i++] = fieldId;
	html[i++] = "' class='search_input'></td><td>&nbsp;" + ZmMsg.searchIn + "&nbsp;</td>";
	html[i++] = "<td id='";
	html[i++] = searchMenuColId;
	html[i++] = "'></td>";
	html[i++] = "<td id='";
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
};

ZmSearchToolBar.prototype.createCustomSearchBtn = function(icon, label, listener) {
	var td = document.getElementById(this._saveColId);
	var newcell = document.createElement("td");
	td.parentNode.insertBefore(newcell, td);
	var btn = this.getButton(ZmSearchToolBar.CUSTOM_SEARCH_BUTTON);
	if (!btn) {
		btn = this._createButton(ZmSearchToolBar.CUSTOM_SEARCH_BUTTON, icon, null, null, label, true, "DwtToolbarButton");
		btn.setData("CustomSearchItem", [ icon, label, listener ]);
		newcell.appendChild(btn.getHtmlElement());
		btn.addSelectionListener(this._customSearchBtnListener);
	} else {
		var menu = btn.getMenu(), item;
		if (!menu) {
			var data = btn.getData("CustomSearchItem");
			menu = new DwtMenu(btn, null, "ActionMenu");
			btn.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
			item = DwtMenuItem.create(menu, data[0], data[1], null, true, DwtMenuItem.RADIO_STYLE, 0);
			item.setData("CustomSearchItem", data);
			item.setChecked(true, true);
			item.addSelectionListener(this._customSearchBtnListener);
		}
		item = DwtMenuItem.create(menu, icon, label, null, true, DwtMenuItem.RADIO_STYLE, 0);
		item.setData("CustomSearchItem", [ icon, label, listener ]);
		item.addSelectionListener(this._customSearchBtnListener);
	}
	return btn;
};

ZmSearchToolBar.prototype._customSearchBtnListener = function(ev) {
	var item = ev.item;
	var data = item.getData("CustomSearchItem");
	if (item instanceof DwtMenuItem) {
		if (ev.detail != DwtMenuItem.CHECKED)
			return;
		var btn = this.getButton(ZmSearchToolBar.CUSTOM_SEARCH_BUTTON);
		btn.setToolTipContent(data[1]);
		btn.setData("CustomSearchItem", data);
	}
	// call original listener
	data[2].run(ev);
};
