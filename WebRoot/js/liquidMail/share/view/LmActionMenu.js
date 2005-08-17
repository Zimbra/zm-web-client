/**
* Creates an action menu with the given menu items.
* @constructor
* @class
* This class represents an action menu, which is a popup menu with a few added features.
* It can be easily created using a set of standard operations, and/or custom menu items
* can be provided. This class is designed for use with items (LmItem), so it can for
* example contain a tab submenu. See also LmButtonToolBar.
*
* @author Conrad Damon
* @param parent					the containing widget
* @param standardMenuItems		a list of operation IDs
* @param extraMenuItems			a list of operation descriptors
* @param dialog					containing dialog, if any
*/
function LmActionMenu(parent, standardMenuItems, extraMenuItems, dialog) {

	LmPopupMenu.call(this, parent, null, dialog);

	this._appCtxt = this.shell.getData(LmAppCtxt.LABEL);

	// standard menu items default to Tag/Print/Delete
	if (!standardMenuItems) {
		standardMenuItems = new Array();
		if (this._appCtxt.get(LmSetting.TAGGING_ENABLED))
			standardMenuItems.push(LmOperation.TAG_MENU);
		if (this._appCtxt.get(LmSetting.PRINT_ENABLED))
			standardMenuItems.push(LmOperation.PRINT);
		standardMenuItems.push(LmOperation.DELETE);
	} else if (standardMenuItems == LmOperation.NONE) {
		standardMenuItems = null;
	}
	this._menuItems = LmOperation.createOperations(this, standardMenuItems, extraMenuItems);
}

LmActionMenu.prototype = new LmPopupMenu;
LmActionMenu.prototype.constructor = LmActionMenu;

// Public methods

LmActionMenu.prototype.toString = 
function() {
	return "LmActionMenu";
}

/**
* Creates a menu item and adds its operation ID as data.
*/
LmActionMenu.prototype.createOp =
function(menuItemId, text, imageInfo, disImageInfo, enabled) {
	var mi = LmPopupMenu.prototype.createMenuItem.call(this, menuItemId, imageInfo, text, disImageInfo, enabled);
	mi.setData(LmOperation.KEY_ID, menuItemId);
	return mi;
}

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
LmActionMenu.prototype.getMenuItem =
function(id) {
	return this._menuItems[id];
}

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
LmActionMenu.prototype.getOp =
function(id) {
	return this.getMenuItem(id);
}

/**
* Returns the menu's tag submenu, if any.
*/
LmActionMenu.prototype.getTagMenu =
function() {
	var menuItem = this.getMenuItem(LmOperation.TAG_MENU);
	if (menuItem)
		return menuItem.getData(LmOperation.KEY_TAG_MENU);
}

// Private methods

// Returns the ID for the given menu item.
LmActionMenu.prototype._menuItemId =
function(menuItem) {
	return menuItem.getData(LmOperation.KEY_ID);
}
