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

ZmSearchToolBar = function(appCtxt, parent, posStyle) {

	DwtComposite.call(this, parent, "ZmSearchToolbar");

	this._appCtxt = appCtxt;

	// set up "search all" menu item
	var params = { msgKey:"searchAll", tooltipKey:"searchForAny", icon:"Globe", setting:ZmSetting.MIXED_VIEW_ENABLED };
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_ANY_MI, params);

	// set up "incl. shared items" menu item
	params = { msgKey:"searchShared", tooltipKey:"searchShared", icon:"Group", setting:ZmSetting.SHARING_ENABLED };
	ZmSearchToolBar.addMenuItem(ZmSearchToolBar.FOR_SHARED_MI, params);

	this._createHtml();
};

ZmSearchToolBar.prototype = new DwtComposite;
ZmSearchToolBar.prototype.constructor = ZmSearchToolBar;


// Consts

ZmSearchToolBar.SEARCH_MENU_BUTTON		= 1;
ZmSearchToolBar.SEARCH_BUTTON 			= 2;
ZmSearchToolBar.SAVE_BUTTON 			= 3;
ZmSearchToolBar.BROWSE_BUTTON 			= 4;

ZmSearchToolBar.MENUITEM_ID 			= "_menuItemId";						// menu item key
ZmSearchToolBar.FOR_ANY_MI				= "FOR_ANY";							// search all item types menu item
ZmSearchToolBar.FOR_SHARED_MI			= "FOR_SHARED";							// incl. shared items menu item
ZmSearchToolBar.SETTING 				= {};									// required setting for menu item to appear
ZmSearchToolBar.MENU_ITEMS 				= [];									// list of menu items
ZmSearchToolBar.MSG_KEY 				= {};									// text for menu item
ZmSearchToolBar.TT_MSG_KEY 				= {};									// tooltip text for menu item
ZmSearchToolBar.ICON 					= {};									// image for menu item


// Public methods

ZmSearchToolBar.prototype.toString =
function() {
	return "ZmSearchToolBar";
};

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

ZmSearchToolBar.prototype.registerCallback =
function(func, obj) {
	this._callback = new AjxCallback(obj, func);
};

ZmSearchToolBar.prototype.addSelectionListener =
function(buttonId, listener) {
	var button;

	switch (buttonId) {
		case ZmSearchToolBar.SEARCH_MENU_BUTTON:button = this._searchMenuButton; break;
		case ZmSearchToolBar.SEARCH_BUTTON:		button = this._searchButton; break;
		case ZmSearchToolBar.SAVE_BUTTON:		button = this._saveButton; break;
		case ZmSearchToolBar.BROWSE_BUTTON:		button = this._browseButton; break;
	}

	if (button) {
		button.addSelectionListener(listener);
	}
};

ZmSearchToolBar.prototype.getButton =
function(buttonId) {
	switch (buttonId) {
		case ZmSearchToolBar.SEARCH_MENU_BUTTON:return this._searchMenuButton;
		case ZmSearchToolBar.SEARCH_BUTTON: 	return this._searchButton;
		case ZmSearchToolBar.SAVE_BUTTON:		return this._saveButton;
		case ZmSearchToolBar.BROWSE_BUTTON:		return this._browseButton;
	}

	return null;
};

ZmSearchToolBar.prototype.focus =
function() {
	if (this._searchField) {
		this._searchField.focus();
	}
};

ZmSearchToolBar.prototype.setEnabled =
function(enable) {
	if (this._searchField)		{ this._searchField.setEnabled(enable);	}
	if (this._searchMenuButton) { this._searchMenuButton.setEnabled(enable); }
	if (this._searchButton)		{ this._searchButton.setEnabled(enable); }
	if (this._saveButton)		{ this._saveButton.setEnabled(enable); }
	if (this._browseButton)		{ this._browseButton.setEnabled(enable); }
	if (this._customSearchBtn)	{ this._customSearchBtn.setEnabled(enable); }
};

ZmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
    if (this._searchField &&
		value != this.getSearchFieldValue())
	{
		this._searchField.setValue(value);
	}
};

ZmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField ? this._searchField.getValue() : null;
};

ZmSearchToolBar.prototype.includeSharedItems =
function() {
	var include = false;
	if (this._appCtxt.get(ZmSetting.SHARING_ENABLED)) {
		var menu = this._searchMenuButton.getMenu();
		if (menu) {
			include = menu.getItemById(ZmSearchToolBar.MENUITEM_ID, ZmSearchToolBar.FOR_SHARED_MI).getChecked();
		}
	}
	return include;
};

ZmSearchToolBar.prototype.createCustomSearchBtn =
function(icon, text, listener) {
	if (!this._customSearchListener) {
		this._customSearchListener = new AjxListener(this, this._customSearchBtnListener);
	}

	if (!this._customSearchBtn) {
		this._customSearchBtn = this._addButton({ buttonId:"_customSearchButton", lbl:text, icon:icon} );
		this._customSearchBtn.setData("CustomSearchItem", [ icon, text, listener ]);
		this._customSearchBtn.addSelectionListener(this._customSearchListener);

		// show the separator now that we've added a custom search button
		var sep = document.getElementById(this._htmlElId + "_customSearchButtonSep");
		if (sep) {
			Dwt.setVisible(sep, true);
		}
	} else {
		var menu = this._customSearchBtn.getMenu();
        var item;
		if (!menu) {
			var data = this._customSearchBtn.getData("CustomSearchItem");
			menu = new DwtMenu(this._customSearchBtn, null, "ActionMenu");
			this._customSearchBtn.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
			item = DwtMenuItem.create(menu, data[0], data[1], null, true, DwtMenuItem.RADIO_STYLE, 0);
			item.setData("CustomSearchItem", data);
			item.setChecked(true, true);
			item.addSelectionListener(this._customSearchListener);
		}
		item = DwtMenuItem.create(menu, icon, text, null, true, DwtMenuItem.RADIO_STYLE, 0);
		item.setData("CustomSearchItem", [icon, text, listener] );
		item.addSelectionListener(this._customSearchListener);
	}

	return this._customSearchBtn;
};

ZmSearchToolBar.prototype._customSearchBtnListener = 
function(ev) {
	var item = ev.item;
	var data = item.getData("CustomSearchItem");
	if (item instanceof DwtMenuItem) {
		if (ev.detail != DwtMenuItem.CHECKED) { return; }
		this._customSearchBtn.setToolTipContent(data[1]);
		this._customSearchBtn.setData("CustomSearchItem", data);
	}
	// call original listener
	data[2].run(ev);
};


// Private methods

ZmSearchToolBar.prototype._createHtml =
function() {

	this.getHtmlElement().innerHTML = AjxTemplate.expand("zimbraMail.share.templates.Widgets#ZmSearchToolBar", {id:this._htmlElId});

	// add search input field
	var inputFieldId = this._htmlElId + "_inputField";
	var inputField = document.getElementById(inputFieldId);
	if (inputField) {
		this._searchField = new DwtInputField({parent:this, hint:ZmMsg.search});
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_input";
		Dwt.setHandler(inputEl, DwtEvent.ONKEYPRESS, ZmSearchToolBar._keyPressHdlr);
		this._searchField.reparentHtmlElement(inputFieldId);
	}

	// add "search types" menu
	var searchMenuBtnId = this._htmlElId + "_searchMenuButton";
	var searchMenuBtn = document.getElementById(searchMenuBtnId);
	if (searchMenuBtn) {
		this._searchMenuButton = this._addButton({ buttonId:"_searchMenuButton", lbl:ZmMsg.searchMail, icon:"MailFolder"} );

		var menu = new DwtMenu(this._searchMenuButton, null, "ActionMenu");

		var mi;
		for (var i = 0; i < ZmSearchToolBar.MENU_ITEMS.length; i++) {
			var id = ZmSearchToolBar.MENU_ITEMS[i];

			if (id == ZmSearchToolBar.FOR_ANY_MI ||
				id == ZmSearchToolBar.FOR_SHARED_MI)
			{
				if (ZmSearchToolBar.MENU_ITEMS.length <= 1) { continue; }
				mi = new DwtMenuItem(menu, DwtMenuItem.SEPARATOR_STYLE);
			}

			var setting = ZmSearchToolBar.SETTING[id];
			if (setting && !this._appCtxt.get(setting)) { continue; }

			var style = id == ZmSearchToolBar.FOR_SHARED_MI
				? DwtMenuItem.CHECK_STYLE : DwtMenuItem.RADIO_STYLE;
			mi = DwtMenuItem.create(menu, ZmSearchToolBar.ICON[id], ZmMsg[ZmSearchToolBar.MSG_KEY[id]], null, true, style, 0);
			mi.setData(ZmSearchToolBar.MENUITEM_ID, id);
		}

		this._searchMenuButton.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
		this._searchMenuButton.reparentHtmlElement(searchMenuBtnId);
	}

	// add search button
	this._searchButton = this._addButton({ buttonId:"_searchButton", lbl:ZmMsg.search, icon:"Search"} );

	// add save search button if saved-searches enabled
	this._saveButton = this._addButton({ setting:ZmSetting.SAVED_SEARCHES_ENABLED,
										 buttonId:"_saveButton",
										 lbl:ZmMsg.save,
										 icon:"Save"} );

	// add advanced search button
	this._browseButton = this._addButton({ setting:ZmSetting.BROWSE_ENABLED,
											buttonId:"_advancedButton",
											style: (DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE),
											lbl:ZmMsg.searchBuilder,
											icon:"SearchBuilder"} );
};

ZmSearchToolBar.prototype._addButton =
function(params) {
	if (params.setting && !this._appCtxt.get(params.setting)) { return; }

	var button;
	var buttonId = this._htmlElId + params.buttonId;
	var buttonEl = document.getElementById(buttonId);
	if (buttonEl) {
		button = new DwtButton(this, params.style);
		var hint = Dwt.getAttr(buttonEl, "hint");
		this._setButtonStyle(button, hint, params.lbl, params.icon);
		button.reparentHtmlElement(buttonId);
	}

	return button;
};

ZmSearchToolBar.prototype._setButtonStyle =
function(button, hint, text, image) {
	if (hint == "text") {
		button.setText(text);
	} else if (hint == "icon") {
		button.setImage(image);
	} else { // add icon and text if no hint (or unsupported hint) provided
		button.setText(text);
		button.setImage(image);
	}
};

// Static methods

ZmSearchToolBar._keyPressHdlr =
function(ev) {
    // DwtInputField > ZmSearchToolBar
    var inputField = DwtUiEvent.getDwtObjFromEvent(ev);
    var stb = inputField.parent;

    var charCode = DwtKeyEvent.getCharCode(ev);
	if (charCode == 13 || charCode == 3) {
		stb._callback.run(stb.getSearchFieldValue());
	    return false;
	}
	return true;
};
