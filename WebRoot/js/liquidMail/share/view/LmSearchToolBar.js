function LmSearchToolBar(appCtxt, parent, posStyle) {

	this._appCtxt = appCtxt;
	LmToolBar.call(this, parent, "LmAppToolBar");

	var fieldId = Dwt.getNextId();
	var searchColId = Dwt.getNextId();
	var browseColId = Dwt.getNextId();
	var saveColId = Dwt.getNextId();
	var navColId = Dwt.getNextId();
	var searchMenuColId = Dwt.getNextId();

	this._createHtml(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId);

	var doc = this.getDocument();
	this._searchField = Dwt.getDomObj(doc, fieldId);
	this._searchField.onkeypress = LmSearchToolBar._keyPressHdlr;
	
	var groupBy = this._appCtxt.getSettings().getGroupMailBy();
	var tooltip = LmMsg[LmSearchToolBar.TT_MSG_KEY[groupBy]];
    this._searchButton = this._createButton(LmSearchToolBar.SEARCH_BUTTON, null, LmMsg.search, null, tooltip, true, "TBButtonWhite");
    Dwt.getDomObj(doc, searchColId).appendChild(this._searchButton.getHtmlElement());

	this._searchMenuButton = this._createButton(LmSearchToolBar.SEARCH_MENU_BUTTON, LmImg.I_MAIL_MSG, null, null, LmMsg.chooseSearchType, true, "TBButtonWhite");
	this._searchMenuButton.noMenuBar = true;
    Dwt.getDomObj(doc, searchMenuColId).appendChild(this._searchMenuButton.getHtmlElement());
	var menuParent = this._searchMenuButton;
    var menu = new DwtMenu(menuParent, null, "ActionMenu");
    menuParent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);

    var mi = DwtMenuItem.create(menu, LmImg.I_SEARCH_MAIL, LmMsg.searchMail, null, true, DwtMenuItem.RADIO_STYLE, 0);
	mi.setData(LmSearchToolBar.MENUITEM_ID, LmSearchToolBar.FOR_MAIL_MI);

	if (this._appCtxt.get(LmSetting.CONTACTS_ENABLED)) {
	    mi = DwtMenuItem.create(menu, LmImg.I_SEARCH_CONTACTS, LmMsg.searchPersonalContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(LmSearchToolBar.MENUITEM_ID, LmItem.CONTACT);
	}

	if (this._appCtxt.get(LmSetting.GAL_ENABLED)) {
	    mi = DwtMenuItem.create(menu, LmImg.I_SEARCH_GAL, LmMsg.searchGALContacts, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(LmSearchToolBar.MENUITEM_ID, LmSearchToolBar.FOR_GAL_MI);
	}
/*
	if (this._appCtxt.get(LmSetting.CALENDAR_ENABLED)) {
	    mi = DwtMenuItem.create(menu, LmImg.I_SEARCH_CALENDAR, LmMsg.searchCalendar, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(LmSearchToolBar.MENUITEM_ID, LmItem.APPT);
	}
*/
	if (this._appCtxt.get(LmSetting.NOTES_ENABLED)) {
	    mi = DwtMenuItem.create(menu, LmImg.I_NOTE, LmMsg.searchNotes, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(LmSearchToolBar.MENUITEM_ID, LmItem.NOTE);
	}

	if (this._appCtxt.get(LmSetting.MIXED_VIEW_ENABLED)) {
		mi = new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
		mi = DwtMenuItem.create(menu, LmImg.I_SEARCH_ALL, LmMsg.searchAll, null, true, DwtMenuItem.RADIO_STYLE, 0);
		mi.setData(LmSearchToolBar.MENUITEM_ID, LmSearchToolBar.FOR_ANY_MI);
	}
	
	if (this._appCtxt.get(LmSetting.BROWSE_ENABLED)) {
		this._browseButton = this._createButton(LmSearchToolBar.BROWSE_BUTTON, null, LmMsg.searchBuilder, null, LmMsg.openSearchBuilder, true, "TBButtonWhite");
	    Dwt.getDomObj(doc, browseColId).appendChild(this._browseButton.getHtmlElement());
	}

	if (this._appCtxt.get(LmSetting.SAVED_SEARCHES_ENABLED)) {
		this._saveButton = this._createButton(LmSearchToolBar.SAVE_BUTTON, LmImg.I_SAVE, null, LmImg.ID_SAVE, LmMsg.saveCurrentSearch, this._appCtxt.get(LmSetting.BROWSE_ENABLED), "TBButtonWhite");
	    Dwt.getDomObj(doc, saveColId).appendChild(this._saveButton.getHtmlElement());
	}
}

LmSearchToolBar.BROWSE_BUTTON 		= 1;
LmSearchToolBar.SEARCH_BUTTON 		= 2;
LmSearchToolBar.SAVE_BUTTON 		= 3;
LmSearchToolBar.SEARCH_MENU_BUTTON 	= 4;

LmSearchToolBar.SEARCH_FIELD_SIZE 	= 48;
LmSearchToolBar.UNICODE_CHAR_RE 	= /\S/;

LmSearchToolBar.MENUITEM_ID = "_menuItemId";

LmSearchToolBar.FOR_MAIL_MI	= LmItem.MAX + 1;
LmSearchToolBar.FOR_GAL_MI	= LmItem.MAX + 2;
LmSearchToolBar.FOR_ANY_MI	= LmItem.MAX + 3;

LmSearchToolBar.MSG_KEY = new Object();
LmSearchToolBar.MSG_KEY[LmSearchToolBar.FOR_MAIL_MI] = "searchMail";
LmSearchToolBar.MSG_KEY[LmItem.CONTACT] = "searchContacts";
LmSearchToolBar.MSG_KEY[LmSearchToolBar.FOR_GAL_MI] = "searchGALContacts";
LmSearchToolBar.MSG_KEY[LmItem.APPT] = "searchCalendar";
LmSearchToolBar.MSG_KEY[LmSearchToolBar.FOR_ANY_MI] = "searchAll";

LmSearchToolBar.TT_MSG_KEY = new Object();
LmSearchToolBar.TT_MSG_KEY[LmItem.MSG] = "searchForMessages";
LmSearchToolBar.TT_MSG_KEY[LmItem.CONV] = "searchForConvs";
LmSearchToolBar.TT_MSG_KEY[LmItem.CONTACT] = "searchPersonalContacts";
LmSearchToolBar.TT_MSG_KEY[LmSearchToolBar.FOR_GAL_MI] = "searchGALContacts";
LmSearchToolBar.TT_MSG_KEY[LmItem.APPT] = "searchForAppts";
LmSearchToolBar.TT_MSG_KEY[LmSearchToolBar.FOR_ANY_MI] = "searchForAny";

LmSearchToolBar.ICON_KEY = new Object();
LmSearchToolBar.ICON_KEY[LmSearchToolBar.FOR_MAIL_MI] = LmImg.I_MAIL_MSG;
LmSearchToolBar.ICON_KEY[LmItem.CONTACT] = LmImg.I_CONTACT;
LmSearchToolBar.ICON_KEY[LmSearchToolBar.FOR_GAL_MI] = LmImg.I_GAL;
LmSearchToolBar.ICON_KEY[LmItem.APPT] = LmImg.I_APPT;
LmSearchToolBar.ICON_KEY[LmSearchToolBar.FOR_ANY_MI] = LmImg.I_GLOBE;

LmSearchToolBar.prototype = new LmToolBar;
LmSearchToolBar.prototype.constructor = LmSearchToolBar;

LmSearchToolBar.prototype.toString = 
function() {
	return "LmSearchToolBar";
}

// Public methods

LmSearchToolBar.prototype.getSearchField =
function() {
	return this._searchField;
}

LmSearchToolBar.prototype.getNavToolBar = 
function() {
	return this._navToolbar;
}

LmSearchToolBar.prototype.registerCallback =
function(func, obj) {
	this._callback = new LsCallback(obj, func);
}

LmSearchToolBar.prototype.focus =
function() {
	this._searchField.focus();
}

LmSearchToolBar.prototype.setEnabled =
function(enable) {
	this._searchField.disabled = !enable;
	this._searchButton.setEnabled(enable);
}

LmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
	if (value != this._searchField.value)
		this._searchField.value = value;
}

LmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField.value;
}

LmSearchToolBar._keyPressHdlr =
function(ev) {
    var stb = DwtUiEvent.getDwtObjFromEvent(ev); // get LmSearchToolBar object
	var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		stb._callback.run(stb._searchField.value);
	    return false;
	}
	return true;
}

LmSearchToolBar.prototype._createHtml =
function(fieldId, searchColId, browseColId, saveColId, navColId, searchMenuColId) {
	var html = new Array();
	var i = 0;
	html[i++] = "<table style='height:auto;width:100%;height:100%;border-collapse:collapse;'><tr>";
	html[i++] = "<td id='" + searchMenuColId + "'></td>";
	html[i++] = "<td width='100%'>";
	html[i++] = "<input type='text' nowrap id='" + fieldId + "' class='search_input'></td>";
	html[i++] = "<td id='" + searchColId + "'></td>";
	html[i++] = "<td id='" + saveColId + "'></td>";
	if (this._appCtxt.get(LmSetting.BROWSE_ENABLED)) {
		html[i++] = "<td><div class='vertSep'></div></td>";
		html[i++] = "<td id='" + browseColId + "'></td>";
	}
	html[i++] = "</tr></table>";

	this.getHtmlElement().innerHTML = html.join("");	
}
