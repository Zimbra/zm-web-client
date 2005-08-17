function LmPopupMenu(parent, className, dialog) {

	if (arguments.length == 0) return;
	className = className || "ActionMenu";
	DwtMenu.call(this, parent, DwtMenu.POPUP_STYLE, className, null, dialog);

	this._menuItems = new Object();
}

LmPopupMenu.prototype = new DwtMenu;
LmPopupMenu.prototype.constructor = LmPopupMenu;

LmPopupMenu.prototype.toString = 
function() {
	return "LmPopupMenu";
}

LmPopupMenu.prototype.addSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].addSelectionListener(listener);
}

LmPopupMenu.prototype.removeSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].removeSelectionListener(listener);
}

LmPopupMenu.prototype.popup =
function(delay, x, y) {
	if (delay == null)
		delay = 0;
	if (x == null) 
		x = Dwt.DEFAULT;
	if (y == null)
		y = Dwt.DEFAULT;
	DwtMenu.prototype.popup.call(this, delay, x, y);
}

/**
* Enables/disables menu items.
*
* @param ids		a list of menu item IDs
* @param enabled	whether to enable the menu items
*/
LmPopupMenu.prototype.enable =
function(ids, enabled) {
	if (!(ids instanceof Array))
		ids = [ids];
	for (var i = 0; i < ids.length; i++)
		if (this._menuItems[ids[i]])
			this._menuItems[ids[i]].setEnabled(enabled);
}

LmPopupMenu.prototype.enableAll =
function(enabled) {
	for (var i in this._menuItems)
		this._menuItems[i].setEnabled(enabled);
}

LmPopupMenu.prototype.addMenuItem =
function(menuItemId, menuItem) {
	this._menuItems[menuItemId] = menuItem;
}

LmPopupMenu.prototype.createMenuItem =
function(menuItemId, imageInfo, text, disImageInfo, enabled, style, radioGroupId) {
	var mi = this._menuItems[menuItemId] = new DwtMenuItem(this, style, radioGroupId);
	if (imageInfo)
		mi.setImage(imageInfo);
	if (text)
		mi.setText(text);
	if (disImageInfo)
		mi.setDisabledImage(disImageInfo);
	mi.setEnabled(enabled !== false);
	return mi;
}

LmPopupMenu.prototype.createSeparator =
function() {
	new DwtMenuItem(this, DwtMenuItem.SEPARATOR_STYLE);
}
