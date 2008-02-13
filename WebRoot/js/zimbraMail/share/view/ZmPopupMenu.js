/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
 * Creates a popup menu.
 * @const
 * @class
 * This class represents a basic popup menu which can add menu items, manage listeners, and
 * enable/disabled its menu items.
 *
 * @author Conrad Damon
 *
 * @param parent		[DwtComposite]		the containing widget
 * @param className		[string]*			CSS class
 * @param inDialog 		[boolean]*			if true, menu is part of a dialog
 */
ZmPopupMenu = function(parent, className, inDialog) {

	if (arguments.length == 0) return;
	className = className ? className : "ActionMenu";
	DwtMenu.call(this, {parent:parent, style:DwtMenu.POPUP_STYLE, className:className, inDialog:inDialog});

	this._menuItems = {};
};

ZmPopupMenu.prototype = new DwtMenu;
ZmPopupMenu.prototype.constructor = ZmPopupMenu;

ZmPopupMenu.prototype.toString = 
function() {
	return "ZmPopupMenu";
};

ZmPopupMenu.prototype.addSelectionListener =
function(menuItemId, listener, index) {
	var menuItem = this._menuItems[menuItemId];
	if (menuItem) {
		menuItem.addSelectionListener(listener, index);
	}
};

ZmPopupMenu.prototype.removeSelectionListener =
function(menuItemId, listener) {
	var menuItem = this._menuItems[menuItemId];
	if (menuItem) {
		menuItem.removeSelectionListener(listener);
	}
};

ZmPopupMenu.prototype.popup =
function(delay, x, y, kbGenerated) {
	delay = delay ? delay : 0;
	x = (x != null) ? x : Dwt.DEFAULT;
	y = (y != null) ? y : Dwt.DEFAULT;
	DwtMenu.prototype.popup.call(this, delay, x, y, kbGenerated);
};

/**
* Enables/disables menu items.
*
* @param ids		a list of menu item IDs
* @param enabled	whether to enable the menu items
*/
ZmPopupMenu.prototype.enable =
function(ids, enabled) {
	ids = (ids instanceof Array) ? ids : [ids];
	for (var i = 0; i < ids.length; i++) {
		if (this._menuItems[ids[i]]) {
			this._menuItems[ids[i]].setEnabled(enabled);
		}
	}
};

ZmPopupMenu.prototype.enableAll =
function(enabled) {
	for (var i in this._menuItems) {
		this._menuItems[i].setEnabled(enabled);
	}
};

/**
 * Adds a menu item to this menu.
 * 
 * @param id			[string]		menu item ID
 * @param text			[string]*		menu item text
 * @param image			[string]*		icon class for the or menu item
 * @param disImage		[string]*		disabled version of icon
 * @param enabled		[boolean]*		if true, menu item is enabled
 * @param style			[constant]*		menu item style
 * @param radioGroupId	[string]*		ID of radio group for this menu item
 */
ZmPopupMenu.prototype.createMenuItem =
function(id, params) {
	var mi = this._menuItems[id] = new DwtMenuItem({parent:this, style:params.style, radioGroupId:params.radioGroupId});
	if (params.image) {
		mi.setImage(params.image);
	}
	if (params.text) {
		mi.setText(params.text);
	}
	mi.setEnabled(params.enabled !== false);

	return mi;
};

ZmPopupMenu.prototype.createSeparator =
function() {
	new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
};
