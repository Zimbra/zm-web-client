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
* @param parent					the containing widget
* @param standardMenuItems		a list of operation IDs
* @param extraMenuItems			a list of operation descriptors
* @param dialog					containing dialog, if any
*/
function ZmActionMenu(parent, standardMenuItems, extraMenuItems, dialog) {

	ZmPopupMenu.call(this, parent, null, dialog);

	this._appCtxt = this.shell.getData(ZmAppCtxt.LABEL);

	// standard menu items default to Tag/Print/Delete
	if (!standardMenuItems) {
		standardMenuItems = new Array();
		if (this._appCtxt.get(ZmSetting.TAGGING_ENABLED))
			standardMenuItems.push(ZmOperation.TAG_MENU);
		if (this._appCtxt.get(ZmSetting.PRINT_ENABLED))
			standardMenuItems.push(ZmOperation.PRINT);
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
	var mi = ZmPopupMenu.prototype.createMenuItem.call(this, menuItemId, imageInfo, text, disImageInfo, enabled);
	mi.setData(ZmOperation.KEY_ID, menuItemId);
	return mi;
}

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
ZmActionMenu.prototype.getMenuItem =
function(id) {
	return this._menuItems[id];
}

/**
* Returns the menu item with the given ID.
*
* @param id		an operation ID
*/
ZmActionMenu.prototype.getOp =
function(id) {
	return this.getMenuItem(id);
}

/**
* Returns the menu's tag submenu, if any.
*/
ZmActionMenu.prototype.getTagMenu =
function() {
	var menuItem = this.getMenuItem(ZmOperation.TAG_MENU);
	if (menuItem)
		return menuItem.getData(ZmOperation.KEY_TAG_MENU);
}

// Private methods

// Returns the ID for the given menu item.
ZmActionMenu.prototype._menuItemId =
function(menuItem) {
	return menuItem.getData(ZmOperation.KEY_ID);
}
