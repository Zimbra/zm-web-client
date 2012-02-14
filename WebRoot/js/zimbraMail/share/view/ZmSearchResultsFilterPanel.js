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
 * @param {ZmController}	controller	search results controller
 * @param {constant}		resultsApp	name of app corresponding to type of results
 * 
 * TODO: Add change listeners to update filters as necessary, eg folders and tags.
 */
ZmSearchResultsFilterPanel = function(params) {

	params.className = params.className || "ZmSearchResultsFilterPanel";
	params.posStyle = Dwt.ABSOLUTE_STYLE;
	DwtComposite.apply(this, arguments);
	
	// Need to wait for ZmApp.* constants to have been defined
	if (!ZmSearchResultsFilterPanel.BASIC_FILTER) {
		ZmSearchResultsFilterPanel._initConstants();
	}

	this._controller = params.controller;
	this._resultsApp = params.resultsApp;
	this._viewId = this._controller.getCurrentViewId();
	
	// basic filters
	this._checkbox = {};
	
	// advanced filters
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
ZmSearchResultsFilterPanel.ID_DATE_SENT		= "DATE_SENT";
ZmSearchResultsFilterPanel.ID_SIZE			= "SIZE";
ZmSearchResultsFilterPanel.ID_STATUS		= "STATUS";
ZmSearchResultsFilterPanel.ID_TAG			= "TAG";
ZmSearchResultsFilterPanel.ID_FOLDER		= "FOLDER";

// filter can be used within any app
ZmSearchResultsFilterPanel.ALL_APPS = "ALL";

// ordered list of basic filters
ZmSearchResultsFilterPanel.BASIC_FILTER_LIST = [
	ZmSearchResultsFilterPanel.ID_ATTACHMENT,
	ZmSearchResultsFilterPanel.ID_FLAGGED,
	ZmSearchResultsFilterPanel.ID_UNREAD
];

// ordered list of advanced filters
ZmSearchResultsFilterPanel.ADVANCED_FILTER_LIST = [
	ZmSearchResultsFilterPanel.ID_FROM,
	ZmSearchResultsFilterPanel.ID_TO,
	ZmSearchResultsFilterPanel.ID_DATE,
	ZmSearchResultsFilterPanel.ID_DATE_SENT,
	ZmSearchResultsFilterPanel.ID_ATTACHMENT,
	ZmSearchResultsFilterPanel.ID_SIZE,
	ZmSearchResultsFilterPanel.ID_STATUS,
	ZmSearchResultsFilterPanel.ID_TAG,
	ZmSearchResultsFilterPanel.ID_FOLDER
];

ZmSearchResultsFilterPanel._initConstants =
function() {

	// basic filters
	ZmSearchResultsFilterPanel.BASIC_FILTER = {};
	ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_ATTACHMENT] = {
		text:	ZmMsg.filterHasAttachment,
		term:	new ZmSearchToken("has", "attachment"),
		apps:	[ZmApp.MAIL, ZmApp.CALENDAR, ZmApp.TASKS]
	};
	ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_FLAGGED] = {
		text:	ZmMsg.filterIsFlagged,
		term:	new ZmSearchToken("is", "flagged")
	};
	ZmSearchResultsFilterPanel.BASIC_FILTER[ZmSearchResultsFilterPanel.ID_UNREAD] = {
		text:	ZmMsg.filterisUnread,
		term:	new ZmSearchToken("is", "unread")
	};
	
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
		text: 		ZmMsg.filterDate,
		handler:	"ZmApptDateSearchFilter",
		apps:		[ZmApp.CALENDAR, ZmApp.TASKS]
	};
	ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_DATE_SENT] = {
		text: 		ZmMsg.filterDateSent,
		handler:	"ZmDateSearchFilter"
	};
	ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_ATTACHMENT] = {
		text: 		ZmMsg.filterAttachments,
		handler:	"ZmAttachmentSearchFilter",
		searchOp:	"type",
		apps:		[ZmApp.MAIL, ZmApp.CALENDAR, ZmApp.TASKS]
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
		text: 			ZmMsg.filterTag,
		handler:		"ZmTagSearchFilter",
		searchOp:		"tag",
		apps:			ZmSearchResultsFilterPanel.ALL_APPS,
		precondition:	(appCtxt.getTagTree() && appCtxt.getTagTree().size() > 0)
	};
	ZmSearchResultsFilterPanel.ADVANCED_FILTER[ZmSearchResultsFilterPanel.ID_FOLDER] = {
		text: 		ZmMsg.filterFolder,
		handler:	"ZmFolderSearchFilter",
		searchOp:	"in",
		noMenu:		true,						// has own menu to add to button
		apps:		ZmSearchResultsFilterPanel.ALL_APPS
	};
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
	this._basicPanel			= document.getElementById(this._htmlElId + "_basicPanel");
	this._basicContainer		= document.getElementById(this._htmlElId + "_basic");
	this._advancedPanel			= document.getElementById(this._htmlElId + "_advancedPanel");
	this._advancedContainer		= document.getElementById(this._htmlElId + "_advanced");
	this._conditionalsContainer	= document.getElementById(this._htmlElId + "_conditionals");
};

// returns a list of filters that apply for the results' app
ZmSearchResultsFilterPanel.prototype._getApplicableFilters =
function(filterIds, filterHash) {
	
	var filters = [];
	for (var i = 0; i < filterIds.length; i++) {
		var id = filterIds[i];
		var filter = filterHash[id];
		filter.index = i;
		if (filter.precondition != null) {
			var pre = filter.precondition;
			var result = (pre === true || pre === false) ? pre : (typeof(pre) == "function") ? pre() : appCtxt.get(pre);
			if (!result) {
				continue;
			}
		}
		var apps = (filter.apps == ZmSearchResultsFilterPanel.ALL_APPS) ? filter.apps : AjxUtil.arrayAsHash(filter.apps || [ZmApp.MAIL]);
		if ((filter.apps == ZmSearchResultsFilterPanel.ALL_APPS) || apps[this._resultsApp]) {
			filters.push({id:id, filter:filter});
		}
	}
	return filters;
};

ZmSearchResultsFilterPanel.prototype._addFilters =
function() {
	var results = this._getApplicableFilters(ZmSearchResultsFilterPanel.BASIC_FILTER_LIST, ZmSearchResultsFilterPanel.BASIC_FILTER);
	Dwt.setVisible(this._basicPanel, (results.length > 0));
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		this._addBasicFilter(result.id, result.filter.text);
	}
	
	var results = this._getApplicableFilters(ZmSearchResultsFilterPanel.ADVANCED_FILTER_LIST, ZmSearchResultsFilterPanel.ADVANCED_FILTER);
	Dwt.setVisible(this._advancedPanel, (results.length > 0));
	this._addAdvancedFilters();
};

ZmSearchResultsFilterPanel.prototype._addAdvancedFilters =
function(attTypes) {
	ZmSearchResultsFilterPanel.attTypes = attTypes;
	var results = this._getApplicableFilters(ZmSearchResultsFilterPanel.ADVANCED_FILTER_LIST, ZmSearchResultsFilterPanel.ADVANCED_FILTER);
	Dwt.setVisible(this._advancedPanel, (results.length > 0));
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		this._addAdvancedFilter(result.id, result.filter.text);
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
		var params = {
			parent:	button,
			id:		ZmId.getMenuId(this._viewId, id),
			style:	DwtMenu.POPUP_STYLE
		};
		menu = new AjxCallback(this, this._createMenu, [params, id, filter]);
		button.setMenu({menu: menu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	}
	else {
		this._createFilter(button, id, filter);
	}
};

ZmSearchResultsFilterPanel.prototype._createMenu =
function(params, id, filter, button) {

	var menu = this._menu[id] = new DwtMenu(params);
	this._createFilter(menu, id, filter);
	return menu;
};

ZmSearchResultsFilterPanel.prototype._createFilter =
function(parent, id, filter) {
	var handler = filter && filter.handler;
	var updateCallback = this.update.bind(this, id);
	var params = {
		parent:			parent,
		id:				id,
		viewId:			this._viewId,
		searchOp:		filter.searchOp,
		updateCallback:	updateCallback,
		resultsApp:		this._resultsApp
	}
	var filterClass = eval(handler);
	new filterClass(params);
};

/**
 * Updates the current search with the given search term. A check is done to see if any of the current
 * search terms should be removed first. Some search operators should only appear once in a query (eg "in"),
 * and some conflict with others (eg "is:read" and "is:unread").
 * 
 * @param {string}			id			filter ID
 * @param {ZmSearchToken}	newTerms	search term(s)
 * @param {boolean}			noPopdown	if true, don't popdown menu after update
 */
ZmSearchResultsFilterPanel.prototype.update =
function(id, newTerms, noPopdown) {
	
	if (!id || !newTerms) { return; }
	
	newTerms = AjxUtil.toArray(newTerms);
	
	var curTerms = this._controller.getSearchTerms();
	if (curTerms && curTerms.length) {
		for (var i = 0; i < curTerms.length; i++) {
			var curTerm = curTerms[i];
			for (var j = 0; j < newTerms.length; j++) {
				var newTerm = newTerms[j];
				if (this._areExclusiveTerms(curTerm, newTerm)) {
					this._controller.removeSearchTerm(curTerm, true);
				}
			}
		}
	}
	
	for (var i = 0; i < newTerms.length; i++) {
		this._controller.addSearchTerm(newTerms[i]);
	}
	
	if (this._menu[id] && !noPopdown) {
		this._menu[id].popdown();
	}
};

ZmSearchResultsFilterPanel.prototype._areExclusiveTerms =
function(termA, termB) {
	termA = this._translateTerm(termA);
	termB = this._translateTerm(termB);
	return (ZmParsedQuery.areExclusive(termA, termB) || ((termA.op == termB.op) && !ZmParsedQuery.isMultiple(termA)));
};

// Treat "appt-start" like "before", "after", or "date" depending on its argument.
ZmSearchResultsFilterPanel.prototype._translateTerm =
function(term) {
	var newOp;
	if (term.op == "appt-start") {
		var first = term.arg.substr(0, 1);
		newOp = (first == "<") ? "before" : (first == ">") ? "after" : "date";
	}
	return newOp ? new ZmSearchToken(newOp, term.arg) : term;
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
 * @param {constant}	resultsApp		name of app corresponding to type of results
 */
ZmSearchFilter = function(params) {
	
	if (arguments.length == 0) { return; }
	
	this.parent = params.parent;
	this.id = params.id;
	this._viewId = params.viewId;
	this._searchOp = params.searchOp;
	this._updateCallback = params.updateCallback;
	this._resultsApp = params.resultsApp;
	
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
	
	if (!ZmSearchResultsFilterPanel.domains) {
		var domainList = new ZmDomainList();
		domainList.search("", ZmAddressSearchFilter.NUM_DOMAINS_TO_FETCH, this._addDomains.bind(this, menu));
	}
	else {
		this._addDomains(menu, ZmSearchResultsFilterPanel.domains);
	}
};

ZmAddressSearchFilter.prototype._addDomains =
function(menu, domains) {

	ZmSearchResultsFilterPanel.domains = domains;
	this._domainBox = this._addComboBox(menu, ZmMsg.domain, ZmAddressSearchFilter.INPUT_WIDTH);
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
	var term = this._getSearchTerm(type, date);
	this._updateCallback(term, true);
};

ZmDateSearchFilter.prototype._getTypes =
function() {
	return [
		ZmDateSearchFilter.BEFORE,
		ZmDateSearchFilter.AFTER,
		ZmDateSearchFilter.ON
	];
};

ZmDateSearchFilter.prototype._getSearchTerm =
function(type, date) {
	return new ZmSearchToken(ZmDateSearchFilter.OP[type], date);
};

ZmDateSearchFilter.prototype._setUi =
function(menu) {
	var calTypes = this._getTypes();
	for (var i = 0; i < calTypes.length; i++) {
		var calType = calTypes[i];
		this._calendar[calType] = this._createCalendar(menu, calType);
	}
};



/**
 * Allows the user to search for appts by date (before, after, or on a particular date).
 * 
 * @param params
 */
ZmApptDateSearchFilter = function(params) {
	ZmDateSearchFilter.apply(this, arguments);
};

ZmApptDateSearchFilter.prototype = new ZmDateSearchFilter;
ZmApptDateSearchFilter.prototype.constructor = ZmApptDateSearchFilter;

ZmApptDateSearchFilter.prototype.isZmApptDateSearchFilter = true;
ZmApptDateSearchFilter.prototype.toString = function() { return "ZmApptDateSearchFilter"; };

ZmApptDateSearchFilter.prototype._getSearchTerm =
function(type, date) {
	if (type == ZmDateSearchFilter.BEFORE) {
		return new ZmSearchToken("appt-start", "<" + date);
	}
	else if (type == ZmDateSearchFilter.AFTER) {
		return new ZmSearchToken("appt-end", ">" + date);
	}
	else if (type == ZmDateSearchFilter.ON) {
		return [new ZmSearchToken("appt-start", "<=" + date),
				new ZmSearchToken("appt-end", ">=" + date)];
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

	if (!ZmSearchResultsFilterPanel.attTypes) {
		var attTypeList = new ZmAttachmentTypeList();
		attTypeList.load(this._addAttachmentTypes.bind(this, menu));
	}
	else {
		this._addAttachmentTypes(menu, ZmSearchResultsFilterPanel.attTypes);
	}
};
	
ZmAttachmentSearchFilter.prototype._addAttachmentTypes =
function(menu, attTypes) {

	ZmSearchResultsFilterPanel.attTypes = attTypes;
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

	// create menu for button
	var moveMenu = this._moveMenu = new DwtMenu({
				parent: button,
				id:		ZmId.getMenuId(this._viewId, this.id)
			});
	moveMenu.getHtmlElement().style.width = "auto";
	button.setMenu({menu: moveMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});

	var chooser = this._folderChooser = new ZmFolderChooser({
				parent:			moveMenu,
				id:				DwtId.makeId(ZmId.WIDGET_CHOOSER, this._viewId, this.id),
				hideNewButton:	true
			});
	var moveParams = this._getMoveParams(chooser);
	chooser.setupFolderChooser(moveParams, this._selectionListener.bind(this));
};

ZmFolderSearchFilter.prototype._getMoveParams =
function(dlg) {
	return {
		overviewId:		dlg.getOverviewId(this.toString()),
		treeIds:		[ZmApp.ORGANIZER[this._resultsApp]],
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
