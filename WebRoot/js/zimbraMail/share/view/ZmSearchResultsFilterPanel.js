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

	this._createHtml();
	this._addFilters();
};

ZmSearchResultsFilterPanel.prototype = new DwtComposite;
ZmSearchResultsFilterPanel.prototype.constructor = ZmSearchResultsFilterPanel;

ZmSearchResultsFilterPanel.prototype.isZmSearchResultsFilterPanel = true;
ZmSearchResultsFilterPanel.prototype.toString = function() { return "ZmSearchResultsFilterPanel"; };

ZmSearchResultsFilterPanel.prototype.TEMPLATE = "share.Widgets#ZmSearchResultsFilterPanel";

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


ZmSearchResultsFilterPanel.BASIC_FILTERS = [
	{ id: ZmSearchResultsFilterPanel.ID_ATTACHMENT,	text: ZmMsg.filterHasAttachment },
	{ id: ZmSearchResultsFilterPanel.ID_FLAGGED,	text: ZmMsg.filterIsFlagged },
	{ id: ZmSearchResultsFilterPanel.ID_UNREAD,		text: ZmMsg.filterisUnread }
];


ZmSearchResultsFilterPanel.ADVANCED_FILTERS = [
	{ id: ZmSearchResultsFilterPanel.ID_TO,			text: ZmMsg.filterSentTo },
	{ id: ZmSearchResultsFilterPanel.ID_FROM,		text: ZmMsg.filterSentFrom },
	{ id: ZmSearchResultsFilterPanel.ID_DATE,		text: ZmMsg.filterDateSent },
	{ id: ZmSearchResultsFilterPanel.ID_ATTACHMENT,	text: ZmMsg.filterAttachments },
	{ id: ZmSearchResultsFilterPanel.ID_SIZE,		text: ZmMsg.filterSize },
	{ id: ZmSearchResultsFilterPanel.ID_STATUS,		text: ZmMsg.filterStatus },
	{ id: ZmSearchResultsFilterPanel.ID_TAG,		text: ZmMsg.filterTag },
	{ id: ZmSearchResultsFilterPanel.ID_FOLDER,		text: ZmMsg.filterFolder }
];

ZmSearchResultsFilterPanel.prototype._createHtml =
function() {
	this.getHtmlElement().innerHTML = AjxTemplate.expand(this.TEMPLATE, {id:this._htmlElId});
	this._basicContainer = document.getElementById(this._htmlElId + "_basic");
	this._advancedContainer = document.getElementById(this._htmlElId + "_advanced");
};

ZmSearchResultsFilterPanel.prototype._addFilters =
function() {

	var filters = ZmSearchResultsFilterPanel.BASIC_FILTERS;
	for (var i = 0; i < filters.length; i++) {
		var filter = filters[i];
		this._addBasicFilter(filter.id, filter.text);
	}

	filters = ZmSearchResultsFilterPanel.ADVANCED_FILTERS;
	for (var i = 0; i < filters.length; i++) {
		var filter = filters[i];
		this._addAdvancedFilter(filter.id, filter.text);
	}
};

ZmSearchResultsFilterPanel.prototype._addBasicFilter =
function(id, text) {
	var div = document.createElement("DIV");
	div.className = "filter";
	div.innerHTML = "<input type='checkbox' id='" + id + "'/><label for='" + id + "'>" + text + "</label>";
	this._basicContainer.appendChild(div);
};

ZmSearchResultsFilterPanel.prototype._addAdvancedFilter =
function(id, text) {

	var button = new DwtButton({
				parent:			this,
				parentElement:	this._advancedContainer,
				id:				ZmId.getMenuId(ZmId.SEARCHRESULTS, id)
			});
	button.setText(text);
	
	// we want a wide button with dropdown on far right
	var buttonEl = button.getHtmlElement();
	var table = buttonEl && buttonEl.firstChild;
	if (table && table.tagName && (table.tagName.toLowerCase() == "table")) {
		table.style.width = "100%";
	}

	var menu = new DwtMenu({
				parent:	button,
				style:	DwtMenu.GENERIC_WIDGET_STYLE
			});
	button.setMenu({menu: menu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	
	switch (id) {
		case ZmSearchResultsFilterPanel.ID_TO:			this._addToFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_FROM:		this._addFromFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_DATE:		this._addDateFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_ATTACHMENT:	this._addAttachmentFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_SIZE:		this._addSizeFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_STATUS:		this._addStatusFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_TAG:			this._addTagFilter(menu); break;
		case ZmSearchResultsFilterPanel.ID_FOLDER:		this._addFolderFilter(menu); break;
	}
};

ZmSearchResultsFilterPanel.prototype._addToFilter =
function(menu) {
	
	var menuItem, subMenu, comboBox;
	menuItem = new DwtMenuItem({ parent:menu });
	menuItem.setText(ZmMsg.address);
	subMenu = new DwtMenu({
				parent:	menuItem,
				style:	DwtMenu.GENERIC_WIDGET_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	comboBox = new DwtComboBox({parent:subMenu, inputParams:{size: 25}});

	menuItem = new DwtMenuItem({ parent:menu }); 
	menuItem.setText(ZmMsg.domain);
	subMenu = new DwtMenu({
				parent:	menuItem,
				style:	DwtMenu.GENERIC_WIDGET_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	comboBox = new DwtComboBox({parent:subMenu, inputParams:{size: 25}});
	comboBox.add("aaaa", "a");
	comboBox.add("bbbb", "b");
	
};

ZmSearchResultsFilterPanel.prototype._addFromFilter =
function(menu) {
	
};

ZmSearchResultsFilterPanel.prototype._addDateFilter =
function(menu) {

	var menuItem, subMenu, cal;
	menuItem = new DwtMenuItem({ parent:menu }); 
	menuItem.setText("is before ...");
	subMenu = new DwtMenu({
				parent:	menuItem,
				style:	DwtMenu.CALENDAR_PICKER_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	cal = new DwtCalendar({parent:subMenu});
	
	menuItem = new DwtMenuItem({ parent:menu }); 
	menuItem.setText("is after ...");
	subMenu = new DwtMenu({
				parent:	menuItem,
				style:	DwtMenu.CALENDAR_PICKER_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	cal = new DwtCalendar({parent:subMenu});

	menuItem = new DwtMenuItem({ parent:menu }); 
	menuItem.setText("is on ...");
	subMenu = new DwtMenu({
				parent:	menuItem,
				style:	DwtMenu.CALENDAR_PICKER_STYLE
			});
	menuItem.setMenu({menu: subMenu, menuPopupStyle: DwtButton.MENU_POPUP_STYLE_CASCADE});
	cal = new DwtCalendar({parent:subMenu});
};

ZmSearchResultsFilterPanel.prototype._addAttachmentFilter =
function(menu) {
	
};

ZmSearchResultsFilterPanel.prototype._addSizeFilter =
function(menu) {
	
};

ZmSearchResultsFilterPanel.prototype._addStatusFilter =
function(menu) {
	
};

ZmSearchResultsFilterPanel.prototype._addTagFilter =
function() {
	
};

ZmSearchResultsFilterPanel.prototype._addFolderFilter =
function(menu) {
	
};
