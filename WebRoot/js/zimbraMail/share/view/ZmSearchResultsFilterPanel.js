/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004-2011 Zimbra, Inc.
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
 * This class represents a panel used to modify the current search.
 * 
 * @param {hash}			params		a hash of parameters:
 * @param {DwtComposite}	parent		parent widget
 */
ZmSearchResultsFilterPanel = function(params) {

	params.className = params.className || "ZmSearchResultsFilterPanel";
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	DwtComposite.apply(this, arguments);

	this._controller = params.controller;
	this._viewId = this._controller.getCurrentViewId();
	
	// basic filters
	this._checkbox = {};
	
	// advanced filters
	this._filter	= {};
	this._menu		= {};
	
	this._createHtml();
	this._addFilters();
	this._addConditionals();
};

ZmSearchResultsFilterPanel.prototype = new DwtComposite;
ZmSearchResultsFilterPanel.prototype.constructor = ZmSearchResultsFilterPanel;

ZmSearchResultsFilterPanel.prototype.isZmSearchResultsFilterPanel = true;
ZmSearchResultsFilterPanel.prototype.toString = function() { return "ZmSearchResultsFilterPanel"; };

ZmSearchResultsFilterPanel.prototype.TEMPLATE = "share.Widgets#ZmSearchResultsFilterPanel";

// used for element IDs
ZmSearchResultsFilterPanel.BASIC	= "BasicFilter";
ZmSearchResultsFilterPanel.ADVANCED	= "AdvancedFilter";

// filter types
ZmSearchResultsFilterPanel.ID_ATTACHMENT	= "ATTACHMENT";
ZmSearchResultsFilterPanel.ID_FLAGGED		= "FLAGGED";
ZmSearchResultsFilterPanel.ID_UNREAD		= "UNREAD";
ZmSearchResultsFilterPanel.ID_TO			= "TO";
ZmSearchResultsFilterPanel.ID_FROM			= "FROM";
ZmSearchResultsFilterPanel.ID_DATE			= "DATE";
ZmSearchResultsFilterPanel.ID_SIZE			= "SIZE";
ZmSearchResultsFilterPanel.ID_STATUS		= "STATUS";
ZmSearchResultsFilterPanel.ID_TAG			= "TAG";
ZmSearchResultsFilterPanel.ID_FOLDER		= "FOLDER";

// ordered list of basic filters
ZmSearchResultsFilterPanel.BASIC_FILTER_LIST = [
	ZmSearchResultsFilterPanel.ID_ATTACHMENT,
	ZmSearchResultsFilterPanel.ID_FLAGGED,
	ZmSearchResultsFilterPanel.ID_UNREAD
];
// basic filters
ZmSearchResultsFilterPanel.BASIC_FILTER = {};
ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_ATTACHMENT] = {
	text: ZmMsg.filterHasAttachment, term: new ZmSearchToken("has", "attachment")
};
ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_FLAGGED] = {
	text: ZmMsg.filterIsFlagged, term: new ZmSearchToken("is", "flagged")
};
ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_UNREAD] = {
	text: ZmMsg.filterisUnread, term: new ZmSearchToken("is", "unread")
}

// ordered list of advanced filters
ZmSearchResultsFilterPanel.ADVANCED_FILTER_LIST = [
	ZmSearchResultsFilterPanel.ID_FROM,
	ZmSearchResultsFilterPanel.ID_TO,
	ZmSearchResultsFilterPanel.ID_DATE,
	ZmSearchResultsFilterPanel.ID_ATTACHMENT,
	ZmSearchResultsFilterPanel.ID_SIZE,
	ZmSearchResultsFilterPanel.ID_STATUS,
	ZmSearchResultsFilterPanel.ID_TAG,
	ZmSearchResultsFilterPanel.ID_FOLDER
];
// advanced filters
ZmSearchResultsFilterPanel.ADVANCED_FILTER = {};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_FROM] = {
	text: 		ZmMsg.filterReceivedFrom,
	handler:	"ZmAddressSearchFilter",
	searchOp:	"from"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_TO] = {
	text: 		ZmMsg.filterSentTo,
	handler:	"ZmAddressSearchFilter",
	searchOp:	"to"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_DATE] = {
	text: 		ZmMsg.filterDateSent,
	handler:	"ZmDateSearchFilter"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_ATTACHMENT] = {
	text: 		ZmMsg.filterAttachments,
	handler:	"ZmAttachmentSearchFilter",
	searchOp:	"type"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_SIZE] = {
	text: 		ZmMsg.filterSize,
	handler:	"ZmSizeSearchFilter"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_STATUS] = {
	text: 		ZmMsg.filterStatus,
	handler:	"ZmStatusSearchFilter",
	searchOp:	"is"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_TAG] = {
	text: 		ZmMsg.filterTag,
	handler:	"ZmTagSearchFilter",
	searchOp:	"tag"
};
ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_FOLDER] = {
	text: 		ZmMsg.filterFolder,
	handler:	"ZmFolderSearchFilter",
	searchOp:	"in",
	noMenu:		true						// has own menu to add to button
};

ZmSearchResultsFilterPanel.CONDITIONALS = [
	ZmParsedQuery.COND_AND,
	ZmParsedQuery.COND_OR,
	ZmParsedQuery.COND_NOT,
	ZmParsedQuery.GROUP_OPEN,
	ZmParsedQuery.GROUP_CLOSE
];




ZmSearchResultsFilterPanel.prototype._createHtml =
function() {
	this.getHtmlElement().innerHTML = AjxTemplate.expand(this.TEMPLATE, {id:this._htmlElId});
	this._basicContainer = document.getElementById(this._htmlElId + "_basic");
	this._advancedContainer = document.getElementById(this._htmlElId + "_advanced");
	this._conditionalsContainer = document.getElementById(this._htmlElId + "_conditionals");
};

ZmSearchResultsFilterPanel.prototype._addFilters =
function() {
	var filters = ZmSearchResultsFilterPanel.BASIC_FILTER_LIST;
	for (var i = 0; i < filters.length; i++) {
		var id = filters[i];
		var filter = ZmSearchResultsFilterPanel.BASIC_FILTER[id];
		this._addBasicFilter(id, filter.text);
	}
	
	this._getDomains();
};

// TODO: fetch domains and att types in a batch request
ZmSearchResultsFilterPanel.prototype._getDomains =
function(callback) {
	var domainList = new ZmDomainList();
	domainList.search("", ZmAddressSearchFilter.NUM_DOMAINS_TO_FETCH, this._getAttachmentTypes.bind(this));
};

ZmSearchResultsFilterPanel.prototype._getAttachmentTypes =
function(domains) {
	ZmSearchResultsFilterPanel.domains = domains;
	var attTypeList = new ZmAttachmentTypeList();
	attTypeList.load(this._addAdvancedFilters.bind(this));
};

ZmSearchResultsFilterPanel.prototype._addAdvancedFilters =
function(attTypes) {
	ZmSearchResultsFilterPanel.attTypes = attTypes;
	var filters = ZmSearchResultsFilterPanel.ADVANCED_FILTER_LIST;
	for (var i = 0; i < filters.length; i++) {
		var id = filters[i];
		var filter = ZmSearchResultsFilterPanel.ADVANCED_FILTER[id];
		this._addAdvancedFilter(id, filter.text);
	}
};

// basic filter is just an on/off checkbox
ZmSearchResultsFilterPanel.prototype._addBasicFilter =
function(id, text) {
	var cb = this._checkbox[id] = new DwtCheckbox({
				parent:			this,
				className:		"filter",
				parentElement:	this._basicContainer,
				id:				DwtId.makeId(ZmId.WIDGET_CHECKBOX, this._viewId, ZmSearchResultsFilterPanel.BASIC, id)
			});
	cb.setText(text);
	cb.addSelectionListener(this._checkboxListener.bind(this, id));
};

ZmSearchResultsFilterPanel.prototype._checkboxListener =
function(id, ev) {
	var cb = this._checkbox[id];
	if (!cb) { return; }
	var filter = ZmSearchResultsFilterPanel.BASIC_FILTER[id];
	var term = filter && filter.term;
	if (term) {
		if (cb.isSelected()) {
			this._controller.addSearchTerm(term);
		}
		else {
			this._controller.removeSearchTerm(term);
		}
	}
};

ZmSearchResultsFilterPanel.prototype._addAdvancedFilter =
function(id, text) {

	var button, menu
	// button is what shows up in search panel
	button = new DwtButton({
				parent:			this,
				parentElement:	this._advancedContainer,
				id:				ZmId.getButtonId(this._viewId, id)
			});
	button.setText(text);
	
	// we want a wide button with dropdown on far right
	var buttonEl = button.getHtmlElement();
	var table = buttonEl && buttonEl.firstChild;
	if (table && table.tagName && (table.tagName.toLowerCase() == "table")) {
		table.style.width = "100%";
	}

	var filter = ZmSearchResultsFilterPanel.ADVANCED_FILTER[id];
	// most filters start with a generic menu
	if (!filter.noMenu) {
		menu = this._menu[id] = new DwtMenu({
					parent:	button,
					id:		ZmId.getMenuId(this._viewId, id),
					style:	DwtMenu.POPUP_STYLE
				});
		button.setMenu({menu: menu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	}
	
	var filterObject;
	var handler = filter && filter.handler;
	var updateCallback = this.update.bind(this, id);
	var params = {
		parent:			menu || button,
		id:				id,
		viewId:			this._viewId,
		searchOp:		filter.searchOp,
		updateCallback:	updateCallback
	}
	var filterClass = eval(handler);
	filterObject = new filterClass(params);
	if (filterObject) {
		this._filter[id] = filterObject;
	}
};

/**
 * Updates the current search with the given search term. A check is done to see if any of the current
 * search terms should be removed first. Some search operators should only appear once in a query (eg "in"),
 * and some conflict with others (eg "is:read" and "is:unread").
 * 
 * @param {string}			id		filter ID
 * @param {ZmSearchToken}	term	search term
 */
ZmSearchResultsFilterPanel.prototype.update =
function(id, term) {
	
	if (!id || !term) { return; }
	
	var terms = this._controller.getSearchTerms();
	if (terms && terms.length) {
		for (var i = 0; i < terms.length; i++) {
			var curTerm = terms[i];
			if (ZmParsedQuery.areExclusive(curTerm, term) || ((curTerm.op == term.op) && !ZmParsedQuery.isMultiple(term))) {
				this._controller.removeSearchTerm(curTerm, true);
			}
		}
	}
	
	this._controller.addSearchTerm(term);
	
	if (this._menu[id]) {
		this._menu[id].popdown();
	}
};

ZmSearchResultsFilterPanel.prototype._addConditionals =
function() {
	var conds = ZmSearchResultsFilterPanel.CONDITIONALS;
	for (var i = 0; i < conds.length; i++) {
		var cond = conds[i];
		var bubbleParams = {
			parent:			appCtxt.getShell(),
			parentElement:	this._conditionalsContainer,
			address:		cond,
			addClass:		ZmParsedQuery.COND_OP[cond] ? ZmParsedQuery.COND : ZmParsedQuery.GROUP
		};
		var bubble = new ZmAddressBubble(bubbleParams);
		bubble.addSelectionListener(this._conditionalSelectionListener.bind(this));
	}
};

ZmSearchResultsFilterPanel.prototype._conditionalSelectionListener =
function(ev) {
	var bubble = ev.item;
	this._controller.addSearchTerm(new ZmSearchToken(bubble.address), false, true);
};

/**
 * Base class for widget that adds a term to the current search.
 * 
 * @param {hash}		params			hash of params:
 * @param {DwtControl}	parent			usually a DwtMenu
 * @param {string}		id				ID of filter
 * @param {string}		searchOp		search operator for this filter (optional)
 * @param {function}	updateCallback	called when value of filter (as a search term) has changed
 */
ZmSearchFilter = function(params) {
	
	if (arguments.length == 0) { return; }
	
	this.parent = params.parent;
	this.id = params.id;
	this._viewId = params.viewId;
	this._searchOp = params.searchOp;
	this._updateCallback = params.updateCallback;
	
	this._setUi(params.parent);
};

ZmSearchFilter.prototype.isZmSearchFilter = true;
ZmSearchFilter.prototype.toString = function() { return "ZmSearchFilter"; };


// used to store data with a menu item
ZmSearchFilter.DATA_KEY = "DATA";

ZmSearchFilter.prototype._setUi = function(menu) {};

// Default listener for click on menu item. Constructs a search term from the value
// of that item and the search op for the filter.
ZmSearchFilter.prototype._selectionListener =
function(ev) {
	var data = ev && ev.dwtObj && ev.dwtObj.getData(ZmSearchFilter.DATA_KEY);
	if (data && this._searchOp) {
		var term = new ZmSearchToken(this._searchOp, data);
		this._updateCallback(term);
	}
};


/**
 * Allows the user to search by address or domain.
 * 
 * @param params
 */
ZmAddressSearchFilter = function(params) {
	ZmSearchFilter.apply(this, arguments);
};

ZmAddressSearchFilter.prototype = new ZmSearchFilter;
ZmAddressSearchFilter.prototype.constructor = ZmAddressSearchFilter;

ZmAddressSearchFilter.prototype.isZmAddressSearchFilter = true;
ZmAddressSearchFilter.prototype.toString = function() { return "ZmAddressSearchFilter"; };

// used for element IDs
ZmAddressSearchFilter.ADDRESS	= "address";
ZmAddressSearchFilter.DOMAIN	= "domain";

// map search op to address type
ZmAddressSearchFilter.ADDR = {};
ZmAddressSearchFilter.ADDR["from"]	= AjxEmailAddress.FROM;
ZmAddressSearchFilter.ADDR["to"]	= AjxEmailAddress.TO;

ZmAddressSearchFilter.INPUT_WIDTH = 25;
ZmAddressSearchFilter.NUM_DOMAINS_TO_FETCH = 100;
ZmAddressSearchFilter.NUM_DOMAINS_TO_SHOW = 10;

ZmAddressSearchFilter.prototype._addInput =
function(menu, text, width) {
	var menuItem = new DwtMenuItem({
				parent:	menu,
				id:		ZmId.getMenuItemId(this._viewId, this.id, ZmAddressSearchFilter.ADDRESS)
			});
	menuItem.setText(text);
	var subMenu = new DwtMenu({
				parent:	menuItem,
				id:		ZmId.getMenuId(this._viewId, this.id, ZmAddressSearchFilter.ADDRESS),
				style:	DwtMenu.GENERIC_WIDGET_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	var input = new DwtInputField({
				parent:	subMenu,
				id:		DwtId.makeId(ZmId.WIDGET_INPUT, this._viewId, this.id, ZmAddressSearchFilter.ADDRESS),
				size:	width
			});
	return input;
};

ZmAddressSearchFilter.prototype._addComboBox =
function(menu, text, width) {
	var menuItem = new DwtMenuItem({
				parent:	menu,
				id:		ZmId.getMenuItemId(this._viewId, this.id, ZmAddressSearchFilter.DOMAIN)
			});
	menuItem.setText(text);
	var subMenu = new DwtMenu({
				parent:	menuItem,
				id:		ZmId.getMenuId(this._viewId, this.id, ZmAddressSearchFilter.DOMAIN),
				style:	DwtMenu.GENERIC_WIDGET_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	var comboBox = new DwtComboBox({
				parent:			subMenu,
				id:		DwtId.makeId(ZmId.WIDGET_COMBOBOX, this._viewId, this.id, ZmAddressSearchFilter.ADDRESS),
				inputParams:	{size: width}
			});
	comboBox.addChangeListener(this._domainChangeListener.bind(this));
	comboBox.input.addListener(DwtEvent.ONKEYUP, this._keyUpListener.bind(this));
	return comboBox;
};

ZmAddressSearchFilter.prototype._initAutocomplete =
function() {
	if (appCtxt.get(ZmSetting.CONTACTS_ENABLED) || appCtxt.get(ZmSetting.GAL_ENABLED) || appCtxt.isOffline) {
		var params = {
			dataClass:			appCtxt.getAutocompleter(),
			matchValue:			ZmAutocomplete.AC_VALUE_EMAIL,
			compCallback:		this._acCompHandler.bind(this),
			keyDownCallback:	this._acKeyDownHandler.bind(this),
			separator:			"",
			contextId:			[this._viewId, this.id].join("-")
		};
		var aclv = new ZmAutocompleteListView(params);
		aclv.handle(this._addressBox.getInputElement());
	}
};

// Process the filter if an address is autocompleted.
ZmAddressSearchFilter.prototype._acCompHandler =
function() {
	this._doUpdate(this._addressBox.getValue());
};

// Process the filter if Enter is pressed.
ZmAddressSearchFilter.prototype._acKeyDownHandler =
function(ev) {
	var key = DwtKeyEvent.getCharCode(ev);
	if (key == 3 || key == 13) {
		this._doUpdate(this._addressBox.getValue());
		return false;
	}
	return true;
};

// Handles click on domain in the menu. Key events from the input will also
// come here. They are ignored.
ZmAddressSearchFilter.prototype._domainChangeListener =
function(ev) {
	// a menu item mouseup event will have dwtObj set
	if (ev && ev.dwtObj) {
		this._doUpdate(ev._args.newValue);
	}
};

// Process the filter if Enter is pressed.
ZmAddressSearchFilter.prototype._keyUpListener =
function(ev) {
	var keyCode = DwtKeyEvent.getCharCode(ev);
	if (keyCode == 13 || keyCode == 3) {
		this._doUpdate(this._domainBox.getText());
	}
};

ZmAddressSearchFilter.prototype._doUpdate =
function(address) {
	if (address) {
		var term = new ZmSearchToken(this._searchOp, address);
		this._updateCallback(term);
	}
};

ZmAddressSearchFilter.prototype._setUi =
function(menu) {
	
	this._addressBox = this._addInput(menu, ZmMsg.address, ZmAddressSearchFilter.INPUT_WIDTH);
	this._initAutocomplete();
	this._domainBox = this._addComboBox(menu, ZmMsg.domain, ZmAddressSearchFilter.INPUT_WIDTH);
	this._addDomains();
};

ZmAddressSearchFilter.prototype._addDomains =
function() {

	var domains = ZmSearchResultsFilterPanel.domains;
	if (domains && domains.length) {
		domains = domains.slice(0, ZmAddressSearchFilter.NUM_DOMAINS_TO_SHOW - 1);
		for (var i = 0; i < domains.length; i++) {
			var domain = domains[i];
			var addrType = ZmAddressSearchFilter.ADDR[this._searchOp];
			if (domain.hasAddress(addrType)) {
				this._domainBox.add(domain.name, domain.name);
			}
		}
	}
};



/**
 * Allows the user to search by date (before, after, or on a particular date).
 * 
 * @param params
 */
ZmDateSearchFilter = function(params) {

	this._calendar = {};	// calendar widgets

	ZmSearchFilter.apply(this, arguments);
	
	this._formatter = AjxDateFormat.getDateInstance(AjxDateFormat.SHORT);
};

ZmDateSearchFilter.prototype = new ZmSearchFilter;
ZmDateSearchFilter.prototype.constructor = ZmDateSearchFilter;

ZmDateSearchFilter.prototype.isZmDateSearchFilter = true;
ZmDateSearchFilter.prototype.toString = function() { return "ZmDateSearchFilter"; };

ZmDateSearchFilter.BEFORE	= "BEFORE";
ZmDateSearchFilter.AFTER	= "AFTER";
ZmDateSearchFilter.ON		= "ON";

ZmDateSearchFilter.TYPES = [
		ZmDateSearchFilter.BEFORE,
		ZmDateSearchFilter.AFTER,
		ZmDateSearchFilter.ON
];

ZmDateSearchFilter.TEXT_KEY = {};
ZmDateSearchFilter.TEXT_KEY[ZmDateSearchFilter.BEFORE]	= "filterBefore";
ZmDateSearchFilter.TEXT_KEY[ZmDateSearchFilter.AFTER]	= "filterAfter";
ZmDateSearchFilter.TEXT_KEY[ZmDateSearchFilter.ON]		= "filterOn";

ZmDateSearchFilter.OP = {};
ZmDateSearchFilter.OP[ZmDateSearchFilter.BEFORE]	= "before";
ZmDateSearchFilter.OP[ZmDateSearchFilter.AFTER]		= "after";
ZmDateSearchFilter.OP[ZmDateSearchFilter.ON]		= "date";

ZmDateSearchFilter.prototype._createCalendar =
function(menu, type) {
	var menuItem = new DwtMenuItem({
				parent:	menu,
				id:		ZmId.getMenuItemId(this._viewId, this.id, type)
			}); 
	menuItem.setText(ZmMsg[ZmDateSearchFilter.TEXT_KEY[type]]);
	var subMenu = new DwtMenu({
				parent:	menuItem,
				id:		ZmId.getMenuId(this._viewId, this.id, type),
				style:	DwtMenu.CALENDAR_PICKER_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	var calendar = new DwtCalendar({
				parent:	subMenu,
				id:		DwtId.makeId(ZmId.WIDGET_CALENDAR, this._viewId, this.id, type)
			});
	calendar.addSelectionListener(this._doUpdate.bind(this, type));
	return calendar;
};

ZmDateSearchFilter.prototype._doUpdate =
function(type) {
	var cal = this._calendar[type];
	var date = this._formatter.format(cal.getDate());
	var term = new ZmSearchToken(ZmDateSearchFilter.OP[type], date);
	this._updateCallback(term);
};

ZmDateSearchFilter.prototype._setUi =
function(menu) {
	var calTypes = ZmDateSearchFilter.TYPES;
	for (var i = 0; i < calTypes.length; i++) {
		var calType = calTypes[i];
		this._calendar[calType] = this._createCalendar(menu, calType);
	}
};



/**
 * Allows the user to search by attachment type (MIME type).
 * 
 * @param params
 */
ZmAttachmentSearchFilter = function(params) {
	ZmSearchFilter.apply(this, arguments);
};

ZmAttachmentSearchFilter.prototype = new ZmSearchFilter;
ZmAttachmentSearchFilter.prototype.constructor = ZmAttachmentSearchFilter;

ZmAttachmentSearchFilter.prototype.isZmAttachmentSearchFilter = true;
ZmAttachmentSearchFilter.prototype.toString = function() { return "ZmAttachmentSearchFilter"; };


ZmAttachmentSearchFilter.prototype._setUi =
function(menu) {
	
	var attTypes = ZmSearchResultsFilterPanel.attTypes;
	if (attTypes && attTypes.length) {
		for (var i = 0; i < attTypes.length; i++) {
			var attType = attTypes[i];
			var menuItem = new DwtMenuItem({
						parent:	menu,
						id:		ZmId.getMenuItemId(this._viewId, this.id, attType.type.replace("/", ":"))
					}); 
			menuItem.setText(attType.desc);
			menuItem.setImage(attType.image);
			menuItem.setData(ZmSearchFilter.DATA_KEY, attType.query || attType.type);
		}
	}
	menu.addSelectionListener(this._selectionListener.bind(this));
};



/**
 * Allows the user to search by size (larger or smaller than a particular size).
 * 
 * @param params
 */
ZmSizeSearchFilter = function(params) {
	this._input = {};
	ZmSearchFilter.apply(this, arguments);
};

ZmSizeSearchFilter.prototype = new ZmSearchFilter;
ZmSizeSearchFilter.prototype.constructor = ZmSizeSearchFilter;

ZmSizeSearchFilter.prototype.isZmSizeSearchFilter = true;
ZmSizeSearchFilter.prototype.toString = function() { return "ZmSizeSearchFilter"; };

ZmSizeSearchFilter.LARGER	= "LARGER";
ZmSizeSearchFilter.SMALLER	= "SMALLER";

ZmSizeSearchFilter.TYPES = [
		ZmSizeSearchFilter.LARGER,
		ZmSizeSearchFilter.SMALLER
];

ZmSizeSearchFilter.TEXT_KEY = {};
ZmSizeSearchFilter.TEXT_KEY[ZmSizeSearchFilter.LARGER]	= "filterLarger";
ZmSizeSearchFilter.TEXT_KEY[ZmSizeSearchFilter.SMALLER]	= "filterSmaller";

ZmSizeSearchFilter.OP = {};
ZmSizeSearchFilter.OP[ZmSizeSearchFilter.LARGER]	= "larger";
ZmSizeSearchFilter.OP[ZmSizeSearchFilter.SMALLER]	= "smaller";

ZmSizeSearchFilter.prototype._setUi =
function(menu) {

	var types = ZmSizeSearchFilter.TYPES;
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		var menuItem = new DwtMenuItem({
					parent:	menu,
					id:		ZmId.getMenuItemId(this._viewId, this.id, type)
				}); 
		menuItem.setText(ZmMsg[ZmSizeSearchFilter.TEXT_KEY[type]]);
		var subMenu = new DwtMenu({
					parent:	menuItem,
					id:		ZmId.getMenuId(this._viewId, this.id, type),
					style:	DwtMenu.GENERIC_WIDGET_STYLE
				});
		menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
		var input = this._input[type] = new DwtInputField({parent:subMenu, size: 10});
		input.addListener(DwtEvent.ONKEYUP, this._keyUpListener.bind(this, type));
	}
};

ZmSizeSearchFilter.prototype._keyUpListener =
function(type, ev) {
	var keyCode = DwtKeyEvent.getCharCode(ev);
	if (keyCode == 13 || keyCode == 3) {
		var term = new ZmSearchToken(ZmSizeSearchFilter.OP[type], this._input[type].getValue());
		this._updateCallback(term);
	}
};



/**
 * Allows the user to search by various message statuses (unread, flagged, etc).
 * 
 * @param params
 */
ZmStatusSearchFilter = function(params) {
	ZmSearchFilter.apply(this, arguments);
};

ZmStatusSearchFilter.prototype = new ZmSearchFilter;
ZmStatusSearchFilter.prototype.constructor = ZmStatusSearchFilter;

ZmStatusSearchFilter.prototype.isZmStatusSearchFilter = true;
ZmStatusSearchFilter.prototype.toString = function() { return "ZmStatusSearchFilter"; };


ZmStatusSearchFilter.prototype._setUi =
function(menu) {
	var values = ZmParsedQuery.IS_VALUES;
	for (var i = 0; i < values.length; i++) {
		var value = values[i];
		var menuItem = new DwtMenuItem({
					parent:	menu,
					id:		ZmId.getMenuItemId(this._viewId, this.id, value)
				}); 
		menuItem.setText(value);
		menuItem.setData(ZmSearchFilter.DATA_KEY, value);
	}
	menu.addSelectionListener(this._selectionListener.bind(this));
};



/**
 * Allows the user to search by tags.
 * 
 * @param params
 * TODO: filter should not show up if no tags
 */
ZmTagSearchFilter = function(params) {
	ZmSearchFilter.apply(this, arguments);
};

ZmTagSearchFilter.prototype = new ZmSearchFilter;
ZmTagSearchFilter.prototype.constructor = ZmTagSearchFilter;

ZmTagSearchFilter.prototype.isZmTagSearchFilter = true;
ZmTagSearchFilter.prototype.toString = function() { return "ZmTagSearchFilter"; };

ZmTagSearchFilter.prototype._setUi =
function(menu) {
	var tags = appCtxt.getTagTree().asList();
	if (tags && tags.length) {
		for (var i = 0; i < tags.length; i++) {
			var tag = tags[i];
			if (tag.id == ZmOrganizer.ID_ROOT) { continue; }
			var menuItem = new DwtMenuItem({
						parent:	menu,
						id:		ZmId.getMenuItemId(this._viewId, this.id, tag.id)
					}); 
			menuItem.setText(tag.getName());
			menuItem.setImage(tag.getIconWithColor());
			menuItem.setData(ZmSearchFilter.DATA_KEY, tag.getName());
		}
	}
	menu.addSelectionListener(this._selectionListener.bind(this));
};


/**
 * Allows the user to search by folder.
 * 
 * @param params
 */
ZmFolderSearchFilter = function(params) {
	ZmSearchFilter.apply(this, arguments);
};

ZmFolderSearchFilter.prototype = new ZmSearchFilter;
ZmFolderSearchFilter.prototype.constructor = ZmFolderSearchFilter;

ZmFolderSearchFilter.prototype.isZmFolderSearchFilter = true;
ZmFolderSearchFilter.prototype.toString = function() { return "ZmFolderSearchFilter"; };

ZmFolderSearchFilter.prototype._setUi =
function(button) {

	AjxDispatcher.require("Extras");

	// create menu for button
	var moveMenu = this._moveMenu = new DwtMenu({
				parent: button,
				id:		ZmId.getMenuId(this._viewId, this.id)
			});
	moveMenu.getHtmlElement().style.width = "auto";
	button.setMenu({menu: moveMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});

	var chooser = this._folderChooser = new DwtFolderChooser({
				parent:		moveMenu,
				id:			DwtId.makeId(ZmId.WIDGET_CHOOSER, this._viewId, this.id),
				noNewItem:	true
			});
	var moveParams = this._getMoveParams(chooser);
	chooser.setupFolderChooser(moveParams, this._selectionListener.bind(this));
};

ZmFolderSearchFilter.prototype._getMoveParams =
function(dlg) {
	return {
		overviewId:		dlg.getOverviewId(this.toString()),
		treeIds:		[ZmOrganizer.FOLDER],
		treeStyle:		DwtTree.SINGLE_STYLE
	};
};

ZmFolderSearchFilter.prototype._selectionListener =
function(folder) {
	if (folder) {
		var term = new ZmSearchToken("in", folder.createQuery(true));
		this._updateCallback(term);
		this._moveMenu.popdown();
	}
};
