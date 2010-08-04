/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
 * @class
 * @constructor 
 * @extends		DwtComposite
 */
ZmSearchToolBar = function(parent, id) {

	DwtComposite.call(this, {parent:parent, className:"ZmSearchToolbar", id:id});

	// setup "search all" menu item
	var params = {
		msgKey: "searchAll",
		tooltipKey: "searchForAny",
		icon: "Globe",
		setting: ZmSetting.MIXED_VIEW_ENABLED,
		index: 0,
		id: ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_ANY)
	};
	ZmSearchToolBar.addMenuItem(ZmId.SEARCH_ANY, params);

	// setup "include shared" menu item
	params = {
		msgKey: "searchShared",
		tooltipKey: "searchShared",
		icon: "Group",
		setting: ZmSetting.SHARING_ENABLED,
		id: ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_SHARED)
	};
	ZmSearchToolBar.addMenuItem(ZmId.SEARCH_SHARED, params);

	// setup "all accounts" menu item for multi account
	if (appCtxt.multiAccounts) {
		params = {
			msgKey: "searchAllAccounts",
			icon: "Globe",
			id: ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_ALL_ACCOUNTS)
		};
		ZmSearchToolBar.addMenuItem(ZmId.SEARCH_ALL_ACCOUNTS, params);
	}

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
ZmSearchToolBar.SETTING 				= {};									// required setting for menu item to appear
ZmSearchToolBar.MENU_ITEMS 				= [];									// list of menu items
ZmSearchToolBar.MSG_KEY 				= {};									// text for menu item
ZmSearchToolBar.TT_MSG_KEY 				= {};									// tooltip text for menu item
ZmSearchToolBar.ICON 					= {};									// icon for menu item
ZmSearchToolBar.SHARE_ICON				= {};									// icon for shared menu item
ZmSearchToolBar.ID 						= {};									// ID for menu item


// Public static methods

ZmSearchToolBar.addMenuItem =
function(id, params) {
	if (params.msgKey)		{ ZmSearchToolBar.MSG_KEY[id]		= params.msgKey; }
	if (params.tooltipKey)	{ ZmSearchToolBar.TT_MSG_KEY[id]	= params.tooltipKey; }
	if (params.icon)		{ ZmSearchToolBar.ICON[id]			= params.icon; }
	if (params.shareIcon)	{ ZmSearchToolBar.SHARE_ICON[id]	= params.shareIcon; }
	if (params.setting)		{ ZmSearchToolBar.SETTING[id]		= params.setting; }
	if (params.id)			{ ZmSearchToolBar.ID[id]			= params.id; }

	// test for null since index value can be zero :)
	if (params.index == null || params.index < 0 || params.index >= ZmSearchToolBar.MENU_ITEMS.length) {
		ZmSearchToolBar.MENU_ITEMS.push(id);
	} else {
		ZmSearchToolBar.MENU_ITEMS.splice(params.index, 0, id);
	}
};


// Public methods

ZmSearchToolBar.prototype.toString =
function() {
	return "ZmSearchToolBar";
};

ZmSearchToolBar.prototype.removeMenuItem =
function(id) {
	var idx = 0;
	
	while (idx < ZmSearchToolBar.MENU_ITEMS.length) {
		if ( ZmSearchToolBar.MENU_ITEMS[idx] == id ) { 
			break;
		}
		idx++;
	}

	if (idx < ZmSearchToolBar.MENU_ITEMS.length) {
		var menu = this._searchMenuButton.getMenu();
		menu.removeChild(menu.getItemById("_menuItemId",id));
		ZmSearchToolBar.MENU_ITEMS.splice(idx,1);
		ZmSearchToolBar.MSG_KEY[id]		= "";
		ZmSearchToolBar.TT_MSG_KEY[id]	= "";
		ZmSearchToolBar.ICON[id]		= "";
		ZmSearchToolBar.SHARE_ICON[id]	= "";
		ZmSearchToolBar.SETTING[id]		= "";
		ZmSearchToolBar.ID[id]			= "";
	}
	this.dedupSeparators(menu);
};

// Attempt to dedup separators, and remove any that start or end the menu
ZmSearchToolBar.prototype.dedupSeparators =
function(menu) {
	if (menu == null) {
		menu = this._searchMenuButton.getMenu();
	}

	var children = menu.getItems();
	var wasSep = false;
	var toRemove = [];
	for (mi in children) {
		if (!children[mi].__text) {
			if (wasSep == true || wasSep == null) {
				toRemove.push(children[mi]);
			} else {
				wasSep = true;
			}
		} else {
			wasSep = false;
		}
	}
	for (mi in toRemove) {
		menu.removeChild(toRemove[mi]);
	}
	if (!children[children.length-1].__text) {	 // No trailing separators
		menu.removeChild(children[children.length-1]);
	}
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

ZmSearchToolBar.prototype.getButtons =
function() {
	return AjxUtil.collapseList([this._searchMenuButton, this._searchButton, this._saveButton, this._browseButton, this._customSearchBtn]);
}

ZmSearchToolBar.prototype.focus =
function() {
	if (this._searchField) {
		this._searchField.focus();
	}
};

ZmSearchToolBar.prototype.blur =
function() {
	if (this._searchField) {
		this._searchField.blur();
	}
};

ZmSearchToolBar.prototype.setEnabled =
function(enable) {
	if (this._searchField)		{ this._searchField.setEnabled(enable); }
	if (this._searchMenuButton) { this._searchMenuButton.setEnabled(enable); }
	if (this._searchButton)		{ this._searchButton.setEnabled(enable); }
	if (this._saveButton)		{ this._saveButton.setEnabled(enable); }
	if (this._browseButton)		{ this._browseButton.setEnabled(enable); }
	if (this._customSearchBtn)	{ this._customSearchBtn.setEnabled(enable); }
};

ZmSearchToolBar.prototype.setSearchFieldValue =
function(value) {
	if (this._searchField && value != this.getSearchFieldValue()) {
		this._searchField.setValue(value);
	}
};

ZmSearchToolBar.prototype.getSearchFieldValue =
function() {
	return this._searchField ? this._searchField.getValue() : null;
};

ZmSearchToolBar.prototype.createCustomSearchBtn =
function(icon, text, listener, id) {
	if (!this._customSearchListener) {
		this._customSearchListener = new AjxListener(this, this._customSearchBtnListener);
	}

	// check if custom search should be a button by checking for the Id against the template
	var customSearchBtn = document.getElementById(this._htmlElId + "_customSearchButton");
	if (customSearchBtn) {
		if (!this._customSearchBtn) {
			this._customSearchBtn = this._addButton({ tdId:		"_customSearchButton",
													  buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_CUSTOM),
													  lbl:		text,
													  icon:		icon });
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
			var params = {parent:menu, enabled:true, style:DwtMenuItem.RADIO_STYLE, radioGroupId:0, id:id};
			if (!menu) {
				var data = this._customSearchBtn.getData("CustomSearchItem");
				menu = new DwtMenu({parent:this._customSearchBtn, className:"ActionMenu", id:ZmId.getMenuId(ZmId.SEARCH, ZmId.SEARCH_CUSTOM)});
				this._customSearchBtn.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
				params.imageInfo = data[0];
				params.text = data[1];
				item = DwtMenuItem.create(params);
				item.setData("CustomSearchItem", data);
				item.setData(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_CUSTOM);
				item.setChecked(true, true);
				item.addSelectionListener(this._customSearchListener);
			}
			params.imageInfo = icon;
			params.text = text;
			item = DwtMenuItem.create(params);
			item.setData("CustomSearchItem", [icon, text, listener] );
			item.addSelectionListener(this._customSearchListener);
		}
	} else {
		if (this._searchMenuCreated) {
			var menu = this._searchMenuButton.getMenu();
			this._createCustomSearchMenuItem(menu, icon, text, listener, id);
		} else {
			if (!this._customSearchMenuItems) {
				this._customSearchMenuItems = [];
			}
			this._customSearchMenuItems.push({icon:icon, text:text, listener:listener, id:id});
		}
	}
};

ZmSearchToolBar.prototype._createCustomSearchMenuItem =
function(menu, icon, text, listener, id) {
	var mi = menu.getItem(0);
	var params = {
		parent: menu,
		imageInfo: icon,
		text: text,
		enabled: true,
		style: DwtMenuItem.RADIO_STYLE,
		radioGroupId: 0,
		index: 0,
		id: id
	};
	mi = DwtMenuItem.create(params);
	mi.setData("CustomSearchItem", [icon, text, listener]);
	mi.setData(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_CUSTOM);
	mi.addSelectionListener(this._customSearchListener);

	// only add separator if this is the first custom search menu item
	if (!(mi && mi.getData("CustomSearchItem"))) {
		mi = new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE, index:1});
	}
};

ZmSearchToolBar.prototype._customSearchBtnListener = 
function(ev) {
	var item = ev.item;
	if (!item) { return; }
	var data = item.getData("CustomSearchItem");
	if (this._customSearchBtn) {
		if (item instanceof DwtMenuItem) {
			if (ev.detail != DwtMenuItem.CHECKED) { return; }
			this._customSearchBtn.setToolTipContent(data[1]);
			this._customSearchBtn.setData("CustomSearchItem", data);
		}
		data[2].run(ev); // call original listener
	} else {
		this._searchMenuButton.setToolTipContent(data[1]);

		var menu = item.parent;
		var shareMenuItem = menu ? menu.getItemById(ZmSearchToolBar.MENUITEM_ID, ZmId.SEARCH_SHARED) : null;
		if (shareMenuItem) {
			shareMenuItem.setChecked(false, true);
			shareMenuItem.setEnabled(false);
		}

		this._searchMenuButton.setImage(data[0]);
		this._searchMenuButton.setText(data[1]);
	}
};


// Private methods

ZmSearchToolBar.prototype._createHtml =
function() {

	this.getHtmlElement().innerHTML = AjxTemplate.expand("share.Widgets#ZmSearchToolBar", {id:this._htmlElId});

	// add search input field
	var inputFieldId = this._htmlElId + "_inputField";
	var inputField = document.getElementById(inputFieldId);
	if (inputField) {
		this._searchField = new DwtInputField({parent:this, hint:ZmMsg.searchInput, inputId:ZmId.SEARCH_INPUT});
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_input";
		this._searchField.reparentHtmlElement(inputFieldId);
		this._searchField.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
	}

	// add "search types" menu
	var searchMenuBtnId = this._htmlElId + "_searchMenuButton";
	var searchMenuBtn = document.getElementById(searchMenuBtnId);
	if (searchMenuBtn) {
		var mailEnabled = appCtxt.get(ZmSetting.MAIL_ENABLED);
		this._searchMenuButton = this._addButton({ tdId:		"_searchMenuButton",
												   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_MENU),
												   lbl:			mailEnabled ? ZmMsg.searchMail : ZmMsg.searchAll,
												   icon:		mailEnabled ? "Message" : "Globe" });
		var menu = new AjxCallback(this, this._createSearchMenu);
		this._searchMenuButton.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
		this._searchMenuButton.reparentHtmlElement(searchMenuBtnId);
	}

	// add search button
	this._searchButton = this._addButton({ tdId:		"_searchButton",
										   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_SEARCH),
										   lbl:			ZmMsg.search,
										   icon:		"Search",
										   tooltip:		ZmMsg.searchTooltip });

	// add save search button if saved-searches enabled
	this._saveButton = this._addButton({ setting:	ZmSetting.SAVED_SEARCHES_ENABLED,
										 tdId:		"_saveButton",
										 buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_SAVE),
										 lbl:		ZmMsg.save,
										 icon:		"Save",
  										 type:		"toolbar",
										 tooltip:	ZmMsg.saveSearchTooltip });
			


	// add advanced search button
	this._browseButton = this._addButton({ setting:		ZmSetting.BROWSE_ENABLED,
										   tdId:		"_advancedButton",
										   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_ADVANCED),
										   style:		(DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE),
										   lbl:			ZmMsg.searchBuilder,
										   icon:		"SearchBuilder",
										   type:		"toolbar",
										   tooltip:		ZmMsg.openSearchBuilder });
};

ZmSearchToolBar.prototype._createSearchMenu =
function() {
	var menu = new DwtMenu({parent:this._searchMenuButton, className:"ActionMenu", id:ZmId.getMenuId(ZmId.SEARCH)});
	var mi;
	if (this._customSearchMenuItems) {
		for (var i = 0; i < this._customSearchMenuItems.length; i++) {
			var csmi = this._customSearchMenuItems[i];
			this._createCustomSearchMenuItem(menu, csmi.icon, csmi.text, csmi.listener);
		}
	}
	var params = {parent:menu, enabled:true, radioGroupId:0};
	for (var i = 0; i < ZmSearchToolBar.MENU_ITEMS.length; i++) {
		var id = ZmSearchToolBar.MENU_ITEMS[i];

		// add separator *before* "shared" menu item
		if (id == ZmId.SEARCH_SHARED) {
			if (ZmSearchToolBar.MENU_ITEMS.length <= 1) { continue; }
			mi = new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
		}

		var setting = ZmSearchToolBar.SETTING[id];
		if (setting && !appCtxt.get(setting)) { continue; }

		params.style = (id == ZmId.SEARCH_SHARED || id == ZmId.SEARCH_ALL_ACCOUNTS)
			? DwtMenuItem.CHECK_STYLE : DwtMenuItem.RADIO_STYLE;
		params.imageInfo = ZmSearchToolBar.ICON[id];
		params.text = ZmMsg[ZmSearchToolBar.MSG_KEY[id]];
		params.id = ZmSearchToolBar.ID[id];
		mi = DwtMenuItem.create(params);
		mi.setData(ZmSearchToolBar.MENUITEM_ID, id);

		// add separator *after* "all" menu item
		if (id == ZmId.SEARCH_ANY) {
			if (ZmSearchToolBar.MENU_ITEMS.length <= 1) { continue; }
			mi = new DwtMenuItem({parent:menu, style:DwtMenuItem.SEPARATOR_STYLE});
		}
	}

	appCtxt.getSearchController()._addMenuListeners(menu);
	this._searchMenuCreated = true;

	return menu;
};

/**
 * Creates a button on the search toolbar.
 * 
 * @param params	[hash]		hash of params:
 *        setting	[const]		setting that must be true for this button to be added
 *        tdId		[string]	ID of TD that is to contain this button
 *        buttonId	[string]*	ID of the button
 *        style		[const]*	button style
 *        type		[string]*	used to differentiate between regular and toolbar buttons
 *        lbl		[string]*	button text
 *        icon		[string]*	button icon
 *        tooltip	[string]*	button tooltip
 */
ZmSearchToolBar.prototype._addButton =
function(params) {
	if (params.setting && !appCtxt.get(params.setting)) { return; }

	var button;
	var tdId = this._htmlElId + (params.tdId || params.buttonId);
	var buttonEl = document.getElementById(tdId);
	if (buttonEl) {
		var btnParams = {parent:this, style:params.style, id:params.buttonId};
		button = (params.type && params.type == "toolbar") ? (new DwtToolBarButton(btnParams)) : (new DwtButton(btnParams));
		var hint = Dwt.getAttr(buttonEl, "hint");
		this._setButtonStyle(button, hint, params.lbl, params.icon);
		if (params.tooltip) {
			button.setToolTipContent(params.tooltip);
		}
		button.reparentHtmlElement(tdId);
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

ZmSearchToolBar.prototype._handleKeyUp =
function(ev) {
	var code = DwtKeyEvent.getCharCode(ev);
	if (code == 0x0D) {
		return this._handleEnterKeyPress(ev);
	}
	return true;
};

ZmSearchToolBar.prototype._handleEnterKeyPress =
function(ev) {
	var menu = this._searchMenuButton && this._searchMenuButton.getMenu();
	var data = menu && menu.getSelectedItem().getData("CustomSearchItem");
	if (data) {
		data[2].run(ev); // call original listener
	} else {
		var queryString = this.getSearchFieldValue();
		appCtxt.notifyZimlets("onKeyPressSearchField", [queryString]);
		this._callback.run(queryString);
	}
	return false;
};

ZmSearchToolBar.prototype.initAutocomplete =
function(id) {

	var params = {
		dataClass:			new ZmSearchAutocomplete(),
		matchValue:			"matchText",
		delims:				[" ", "\t"],
		delimCodes:			[3, 13, 32, 9],
		separator:			" ",
		enterCallback:		new AjxCallback(this, this._handleEnterKeyPress)
	};
	this._acList = new ZmAutocompleteListView(params);
	this._acList.handle(this.getSearchField());
};
