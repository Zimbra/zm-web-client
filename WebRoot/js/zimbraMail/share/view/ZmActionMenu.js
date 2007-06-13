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
* @param parent					[DwtComposite]		the containing widget
* @param standardMenuItems		[array]*			a list of operation IDs
* @param extraMenuItems			[array]*			a list of operation descriptors
* @param dialog					[DwtDialog]*		containing dialog, if any
*/
function ZmActionMenu(parent, standardMenuItems, extraMenuItems, dialog) {

	ZmPopupMenu.call(this, parent, null, dialog);

	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	// standard menu items default to Tag/Print/Delete
	if (!standardMenuItems) {
		standardMenuItems = new Array();
		if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED)) {
			standardMenuItems.push(ZmOperation.TAG_MENU);
		}
		if (this._appCtxt.get(ZmSetting.PRINT_ENABLED)) {
			standardMenuItems.push(ZmOperation.PRINT);
		}
		standardMenuItems.push(ZmOperation.DELETE);
	} else if (standardMenuItems == ZmOperation.NONE) {
		standardMenuItems = null;
	}
	this._menuItems = ZmOperation.createOperations(this, standardMenuItems, extraMenuItems);
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
*/
ZmActionMenu.prototype.createOp =
function(menuItemId, text, imageInfo, disImageInfo, enabled) {
	var mi = this.createMenuItem(menuItemId, imageInfo, text, disImageInfo, enabled);
	mi.setData(ZmOperation.KEY_ID, menuItemId);

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
