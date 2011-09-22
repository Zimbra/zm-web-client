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

	// setup "include shared" menu item
	var params = {
		msgKey:		"searchShared",
		tooltipKey:	"searchShared",
		icon:		"Group",
		setting:	ZmSetting.SHARING_ENABLED,
		id:			ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_SHARED)
	};
	ZmSearchToolBar.addMenuItem(ZmId.SEARCH_SHARED, params);

	// setup "all accounts" menu item for multi account
	if (appCtxt.multiAccounts) {
		var params = {
			msgKey:	"searchAllAccounts",
			icon:	"Globe",
			id:		ZmId.getMenuItemId(ZmId.SEARCH, ZmId.SEARCH_ALL_ACCOUNTS)
		};
		ZmSearchToolBar.addMenuItem(ZmId.SEARCH_ALL_ACCOUNTS, params);
	}

	this._createHtml();
};

ZmSearchToolBar.prototype = new DwtComposite;
ZmSearchToolBar.prototype.constructor = ZmSearchToolBar;

ZmSearchToolBar.prototype.isZmSearchToolBar = true;
ZmSearchToolBar.prototype.toString = function() { return "ZmSearchToolBar"; };

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


ZmSearchToolBar.prototype.removeMenuItem =
function(id) {
	
	var mi = menu.getItemById("_menuItemId", id);
	if (mi) {
		menu.removeChild(mi);
		mi.dispose();
	}
	this._cleanupSeparators(menu);
};

// Remove unneeded separators
ZmSearchToolBar.prototype._cleanupSeparators =
function(menu) {

	menu = menu || this._searchMenuButton.getMenu();

	var items = menu.getItems();
	var toRemove = [];
	for (var i = 0; i < items.length; i++) {
		var mi = items[i];
		if (mi.isSeparator() && (i == 0 || i == items.length - 1 || items[i - 1].isSeparator())) {
			toRemove.push(mi);
		}
	}
	for (var i = 0; i < toRemove.length; i++) {
		var mi = toRemove[i];
		menu.removeChild(mi);
		mi.dispose();
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
};

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
			this._customSearchBtn = ZmToolBar.addButton({ parent:	this,
														  tdId:		"_customSearchButton",
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
		this._searchField = new DwtInputField({parent:this, hint:ZmMsg.searchInput, inputId:ZmId.SEARCH_INPUTFIELD});
		var inputEl = this._searchField.getInputElement();
		inputEl.className = "search_input";
		this._searchField.reparentHtmlElement(inputFieldId);
		this._searchField._showHint();
		this._searchField.addListener(DwtEvent.ONFOCUS, this._onInputFocus.bind(this));
		this._searchField.addListener(DwtEvent.ONBLUR, this._onInputBlur.bind(this));
	}

	// add "search types" menu
	var searchMenuBtnId = this._htmlElId + "_searchMenuButton";
	var searchMenuBtn = document.getElementById(searchMenuBtnId);
	if (searchMenuBtn) {
		var firstItem = ZmSearchToolBar.MENU_ITEMS[0];
		this._searchMenuButton = ZmToolBar.addButton({ parent:		this, 
													   tdId:		"_searchMenuButton",
													   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_MENU),
													   tooltip:		ZmMsg[ZmSearchToolBar.TT_MSG_KEY[firstItem]],
													   icon:		ZmSearchToolBar.ICON[firstItem] });
		var menu = new AjxCallback(this, this._createSearchMenu);
		this._searchMenuButton.setMenu(menu, false, DwtMenuItem.RADIO_STYLE);
		this._searchMenuButton.reparentHtmlElement(searchMenuBtnId);
	}

	// add search button
	this._searchButton = ZmToolBar.addButton({ parent:		this, 
											   tdId:		"_searchButton",
											   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_SEARCH),
											   lbl:			"",
											   icon:		"Search2",
											   template: 	"dwt.Widgets#ZImageOnlyButton",
											   className: 	"ZImageOnlyButton",
											   tooltip:		ZmMsg.searchTooltip });

	// add save search button if saved-searches enabled
	this._saveButton = ZmToolBar.addButton({ parent:	this, 
											 setting:	ZmSetting.SAVED_SEARCHES_ENABLED,
											 tdId:		"_saveButton",
											 buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_SAVE),
											 lbl:		ZmMsg.save,
											 icon:		"Save",
											 type:		"toolbar",
											 tooltip:	ZmMsg.saveSearchTooltip });

	// add advanced search button
	this._browseButton = ZmToolBar.addButton({ parent:		this, 
											   setting:		ZmSetting.BROWSE_ENABLED,
											   tdId:		"_advancedButton",
											   buttonId:	ZmId.getButtonId(ZmId.SEARCH, ZmId.SEARCH_ADVANCED),
											   style:		(DwtLabel.IMAGE_LEFT | DwtLabel.ALIGN_CENTER | DwtButton.TOGGLE_STYLE),
											   lbl:			ZmMsg.searchBuilder,
											   icon:		"SearchBuilder",
											   type:		"toolbar",
											   tooltip:		ZmMsg.openSearchBuilder });
};

// Expand INPUT when it gets focus
ZmSearchToolBar.prototype._onInputFocus =
function(ev) {
	this._setInputExpanded(true);
};

// Collapse INPUT when it loses focus (unless that was due to a click on the menu button)
ZmSearchToolBar.prototype._onInputBlur =
function(ev) {
	var focusObj = appCtxt.getKeyboardMgr().getFocusObj();
	if (focusObj != this._searchMenuButton && focusObj != this._searchButton) {
		this._setInputExpanded(false);
	}
};

ZmSearchToolBar.prototype._setInputExpanded =
function(expanded) {
	this._searchField.getInputElement().className = expanded ? "search_input-expanded" : "search_input";
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
	}

	appCtxt.getSearchController()._addMenuListeners(menu);
	this._searchMenuCreated = true;

	return menu;
};

ZmSearchToolBar.prototype._handleKeyDown =
function(ev) {
	var key = DwtKeyEvent.getCharCode(ev);
	if (key == 3 || key == 13) {
		return this._handleEnterKeyPress(ev);
	}
	return true;
};

ZmSearchToolBar.prototype._handleEnterKeyPress =
function(ev) {
	var menu = this._searchMenuButton && this._searchMenuButton.getMenu();
    var item = menu ? menu.getSelectedItem() || menu.getItems()[0] : null
	var data = item && item.getData("CustomSearchItem");
	if (data) {
		data[2].run(ev); // call original listener
	} else {
		var searchFor = item.getData(ZmSearchToolBar.MENUITEM_ID);
		var queryString = this.getSearchFieldValue();
		appCtxt.notifyZimlets("onKeyPressSearchField", [queryString]);
		this._callback.run(queryString, searchFor);
	}
	return false;
};

ZmSearchToolBar.prototype.initAutocomplete =
function(id) {

	if (id == ZmId.SEARCH_SHARED) { //no change required when checking/unchecking the "include shared items" checkbox
		return;
	}

	var firstTime = this._isPeopleAutoComplete == undefined; //first time this is called. no autocomplete is set up

	var isPeople = this._isPeopleAutoComplete || false; //is the current autocomplete people search?
	var needPeople = this._isPeopleAutoComplete = (id == ZmItem.CONTACT || id == ZmId.SEARCH_GAL); //do we want people search autocomplete now?

	if (!firstTime && isPeople == needPeople) {
		return;
	}

	if (needPeople) {
		var params = {
			parent: appCtxt.getShell(),
			dataClass: (new ZmPeopleSearchAutocomplete()),
			matchValue: ZmAutocomplete.AC_VALUE_EMAIL,
			options: {type:ZmAutocomplete.AC_TYPE_GAL},
			separator: "",
			compCallback: (new AjxCallback(this, this._acCompCallback))
		};
		this._autocomplete = new ZmPeopleAutocompleteListView(params);
		this._autocomplete.handle(this._searchField.getInputElement());
		return;
	}

	var params = {
		dataClass:			new ZmSearchAutocomplete(),
		matchValue:			"matchText",
		delims:				[" ", "\t"],
		delimCodes:			[3, 13, 32, 9],
		separator:			" ",
		keyDownCallback:	new AjxCallback(this, this._handleKeyDown)
	};
	this._acList = new ZmAutocompleteListView(params);
	this._acList.handle(this.getSearchField());
};
