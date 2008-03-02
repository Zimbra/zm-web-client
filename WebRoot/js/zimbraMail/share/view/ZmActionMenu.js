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
 * Creates an action menu with the given menu items.
 * @constructor
 * @class
 * This class represents an action menu, which is a popup menu with a few added features.
 * It can be easily created using a set of standard operations, and/or custom menu items
 * can be provided. This class is designed for use with items (ZmItem), so it can for
 * example contain a tab submenu. See also ZmButtonToolBar.
 *
 * @author Conrad Damon
 *
 * @param parent		[DwtComposite]		the containing widget
 * @param menuItems		[array]*			a list of operation IDs
 * @param overrides		[hash]*				hash of overrides by op ID
 */
ZmActionMenu = function(params) {

	ZmPopupMenu.call(this, params.parent);

	// standard menu items default to Tag/Print/Delete
	var menuItems = params.menuItems;
	if (!menuItems) {
		menuItems = [ZmOperation.TAG_MENU, ZmOperation.PRINT, ZmOperation.DELETE];
	} else if (menuItems == ZmOperation.NONE) {
		menuItems = null;
	}
	// weed out disabled ops, save list of ones that make it
	this.opList = ZmOperation.filterOperations(menuItems);
	var extraItems = params.extraMenuItems;
	this._menuItems = ZmOperation.createOperations(this, this.opList, params.overrides);
}

ZmActionMenu.prototype = new ZmPopupMenu;
ZmActionMenu.prototype.constructor = ZmActionMenu;

// Public methods

ZmActionMenu.prototype.toString = 
function() {
	return "ZmActionMenu";
}

/**
 * Creates a menu item and adds its operation ID as data.
 * 
 * @param id			[string]		name of the operation
 * @param text			[string]*		menu item text
 * @param image			[string]*		icon class for the menu item
 * @param disImage		[string]*		disabled version of icon
 * @param enabled		[boolean]*		if true, menu item is enabled
 * @param style			[constant]*		menu item style
 * @param radioGroupId	[string]*		ID of radio group for this menu item
 */
ZmActionMenu.prototype.createOp =
function(id, params) {
	var mi = this.createMenuItem(id, params);
	mi.setData(ZmOperation.KEY_ID, id);

	return mi;
};

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
ZmActionMenu.prototype.getMenuItem =
function(id) {
	return this._menuItems[id];
};

ZmActionMenu.prototype.addOp =
function(id) {
	ZmOperation.addOperation(this, id, this._menuItems);
};

ZmActionMenu.prototype.removeOp =
function(id) {
	ZmOperation.removeOperation(this, id, this._menuItems);
};

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
ZmActionMenu.prototype.getOp =
function(id) {
	return this.getMenuItem(id);
};

/**
* Returns the menu's tag submenu, if any.
*/
ZmActionMenu.prototype.getTagMenu =
function() {
	var menuItem = this.getMenuItem(ZmOperation.TAG_MENU);
	if (menuItem) {
		return menuItem.getMenu();
	}
};

// Private methods

// Returns the ID for the given menu item.
ZmActionMenu.prototype._menuItemId =
function(menuItem) {
	return menuItem.getData(ZmOperation.KEY_ID);
};
