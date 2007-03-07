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

	ZmSearchToolBar.SETTING[ZmSearchToolBar.FOR_ANY_MI] = ZmSetting.MIXED_VIEW_ENABLED;

	this._customSearchBtnListener = new AjxListener(this, this._customSearchBtnListener);

    this._search = new DwtMessageComposite(this);
    this._search.getHtmlElement().parentNode.style.width = "100%";

    this._searchField = new DwtInputField({parent:this._search});
    var searchFieldEl = this._searchField.getInputElement();
    searchFieldEl.className = "search_input";
    Dwt.setHandler(searchFieldEl, DwtEvent.ONKEYPRESS, ZmSearchToolBar._keyPressHdlr);

	var params = {image:"MailFolder", text:ZmMsg.searchMail, tooltip:ZmMsg.chooseSearchType, className:"DwtButton"};
    this._searchMenuButton = this.createButton(ZmSearchToolBar.SEARCH_MENU_BUTTON, params);
    var menuParent = this._searchMenuButton;

    var menu = new DwtMenu(menuParent, null, "ActionMenu");
    menuParent.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);

	ZmSearchToolBar.MENU_ITEMS.push(ZmSearchToolBar.FOR_ANY_MI);	// "All" comes last
	for (var i = 0; i < ZmSearchToolBar.MENU_ITEMS.length; i++){
		var id = ZmSearchToolBar.MENU_ITEMS[i];
		if (id == ZmSearchToolBar.FOR_ANY_MI) {
			if (ZmSearchToolBar.MENU_ITEMS.length <= 1) { continue; }
	        mi = new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
		}
		var setting = ZmSearchToolBar.SETTING[id];
		if (setting && !this._appCtxt.get(setting)) { continue; }
	    var mi = DwtMenuItem.create(menu, ZmSearchToolBar.ICON[id], ZmMsg[ZmSearchToolBar.MSG_KEY[id]], null, true, DwtMenuItem.RADIO_STYLE, 0);
	    mi.setData(ZmSearchToolBar.MENUITEM_ID, id);
	}

    var callback = new AjxCallback(this, this._getControl);
    var hintsCallback = new AjxCallback(this, this._getControlHints);
    this._search.setFormat(ZmMsg.searchToolBar, callback, hintsCallback);

    if (this._appCtxt.get(ZmSetting.SAVED_SEARCHES_ENABLED)) {
        this._saveButton = this.createButton(ZmSearchToolBar.SAVE_BUTTON, {image:"Save", disImage:"SaveDis", tooltip:ZmMsg.saveCurrentSearch,
        																   className:"DwtToolbarButton"});
    }

    if (this._appCtxt.get(ZmSetting.BROWSE_ENABLED)) {
        this.addSeparator("vertSep");
        var buttonStyle = DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE;
        this._browseButton = this.createButton(ZmSearchToolBar.BROWSE_BUTTON, {text:ZmMsg.searchBuilder, tooltip:ZmMsg.openSearchBuilder,
        																	   className:"DwtToolbarButton", style:buttonStyle});
    }
};

ZmSearchToolBar.BROWSE_BUTTON 			= 1;
ZmSearchToolBar.SEARCH_BUTTON 			= 2;
ZmSearchToolBar.SAVE_BUTTON 			= 3;
ZmSearchToolBar.SEARCH_MENU_BUTTON 		= 4;
ZmSearchToolBar.CUSTOM_SEARCH_BUTTON    = 5;

ZmSearchToolBar.SEARCH_FIELD_SIZE 	= 48;
ZmSearchToolBar.UNICODE_CHAR_RE 	= /\S/;

ZmSearchToolBar.MENUITEM_ID = "_menuItemId";

// menu items
ZmSearchToolBar.FOR_ANY_MI	= "FOR_ANY";

// text for menu item
ZmSearchToolBar.MSG_KEY = {};
ZmSearchToolBar.MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchAll";

// tooltip text for menu item
ZmSearchToolBar.TT_MSG_KEY = {};
ZmSearchToolBar.TT_MSG_KEY[ZmSearchToolBar.FOR_ANY_MI] = "searchForAny";

// image for menu item
ZmSearchToolBar.ICON = {};
ZmSearchToolBar.ICON[ZmSearchToolBar.FOR_ANY_MI] = "SearchAll";

// required setting for menu item to appear
ZmSearchToolBar.SETTING = {};

// list of menu items
ZmSearchToolBar.MENU_ITEMS = [];

ZmSearchToolBar.prototype = new ZmToolBar;
ZmSearchToolBar.prototype.constructor = ZmSearchToolBar;

ZmSearchToolBar.prototype.toString =
function() {
	return "ZmSearchToolBar";
};

// Public methods

ZmSearchToolBar.addMenuItem =
function(id, params) {
	if (params.msgKey)		{ ZmSearchToolBar.MSG_KEY[id]		= params.msgKey; }
	if (params.tooltipKey)	{ ZmSearchToolBar.TT_MSG_KEY[id]	= params.tooltipKey; }
	if (params.icon)		{ ZmSearchToolBar.ICON[id]			= params.icon; }
	if (params.setting)		{ ZmSearchToolBar.SETTING[id]		= params.setting; }
	ZmSearchToolBar.MENU_ITEMS.push(id);
};

ZmSearchToolBar.prototype.getSearchField =
function() {
	return this._searchField.getInputElement();
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
	this._searchField.setEnabled(enable);
	// this._searchButton.setEnabled(enable);
	this._searchMenuButton.setEnabled(enable);
};

ZmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
    if (value != this.getSearchFieldValue())
		this._searchField.setValue(value);
};

ZmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField.getValue();
};

ZmSearchToolBar._keyPressHdlr =
function(ev) {
    // DwtInputField > DwtMessageComposite > ZmSearchToolBar
    var inputField = DwtUiEvent.getDwtObjFromEvent(ev);
    var stb = inputField.parent.parent;
    
    var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		stb._callback.run(stb.getSearchFieldValue());
	    return false;
	}
	return true;
};

ZmSearchToolBar.prototype._getControl = 
function(parent, segment, i) {
    return [this._searchField, this._searchMenuButton][segment.getIndex()];
};
ZmSearchToolBar.prototype._getControlHints = 
function(parent, segment, i) {
    return segment.getIndex() == 0 ? { width: "100%" } : null;
};

ZmSearchToolBar.prototype.createCustomSearchBtn = 
function(icon, text, listener) {
	var btn = this.getButton(ZmSearchToolBar.CUSTOM_SEARCH_BUTTON);
	if (!btn) {
		btn = this.createButton(ZmSearchToolBar.CUSTOM_SEARCH_BUTTON, {image:icon, text:text, className:"DwtButton"}, 1);
		btn.setData("CustomSearchItem", [ icon, text, listener ]);
		btn.addSelectionListener(this._customSearchBtnListener);
	} else {
		var menu = btn.getMenu();
        var item;
		if (!menu) {
			var data = btn.getData("CustomSearchItem");
			menu = new DwtMenu(btn, null, "ActionMenu");
			btn.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
			item = DwtMenuItem.create(menu, data[0], data[1], null, true, DwtMenuItem.RADIO_STYLE, 0);
			item.setData("CustomSearchItem", data);
			item.setChecked(true, true);
			item.addSelectionListener(this._customSearchBtnListener);
		}
		item = DwtMenuItem.create(menu, icon, text, null, true, DwtMenuItem.RADIO_STYLE, 0);
		item.setData("CustomSearchItem", [ icon, text, listener ]);
		item.addSelectionListener(this._customSearchBtnListener);
	}
	return btn;
};

ZmSearchToolBar.prototype._customSearchBtnListener = 
function(ev) {
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
