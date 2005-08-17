/**
* @class LaPopupMenu
* @constructor
* @param parent
* @param className
* @param dialog
* @param opList
*
* This widget class extends LaPopupMenu. Similar to LaToolBar, this class creates
* buttons form an array of LaOperation objects
**/
function LaPopupMenu(parent, className, dialog, opList) {
	if (arguments.length == 0) return;
	className = className || "ActionMenu";
	DwtMenu.call(this, parent, DwtMenu.POPUP_STYLE, className, null, dialog);
	this._menuItems = new Object();	
	if(opList) {
		var cnt = opList.length;
		for(var ix=0; ix < cnt; ix++) {
			this.createMenuItem(opList[ix].id, opList[ix].imageId, opList[ix].caption, null, true);
			this.addSelectionListener(opList[ix].id, opList[ix].listener);		
		}
	}
}

LaPopupMenu.prototype = new DwtMenu;
LaPopupMenu.prototype.constructor = LaPopupMenu;

LaPopupMenu.prototype.toString = 
function() {
	return "LaPopupMenu";
}

LaPopupMenu.prototype.addSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].addSelectionListener(listener);
}

LaPopupMenu.prototype.removeSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].removeSelectionListener(listener);
}

LaPopupMenu.prototype.popup =
function(delay, x, y) {
	if (delay == null)
		delay = 0;
	if (x == null) 
		x = Dwt.DEFAULT;
	if (y == null)
		y = Dwt.DEFAULT;
	this.setLocation(x, y);
	DwtMenu.prototype.popup.call(this, delay);
}

/**
* Enables/disables menu items.
*
* @param ids		a list of menu item IDs
* @param enabled	whether to enable the menu items
*/
LaPopupMenu.prototype.enable =
function(ids, enabled) {
	if (!(ids instanceof Array))
		ids = [ids];
	for (var i = 0; i < ids.length; i++)
		if (this._menuItems[ids[i]])
			this._menuItems[ids[i]].setEnabled(enabled);
}

LaPopupMenu.prototype.enableAll =
function(enabled) {
	for (var i in this._menuItems)
		this._menuItems[i].setEnabled(enabled);
}

LaPopupMenu.prototype.addMenuItem =
function(menuItemId, menuItem) {
	this._menuItems[menuItemId] = menuItem;
}

LaPopupMenu.prototype.createMenuItem =
function(menuItemId, imageId, text, disImageId, enabled, style, radioGroupId) {
	var mi = this._menuItems[menuItemId] = new DwtMenuItem(this, style, radioGroupId);
	if (imageId)
		mi.setImage(imageId);
	if (text)
		mi.setText(text);
	if (disImageId)
		mi.setDisabledImage(disImageId);
	mi.setEnabled(enabled !== false);
	return mi;
}

LaPopupMenu.prototype.createSeparator =
function() {
	new DwtMenuItem(this, DwtMenuItem.SEPARATOR_STYLE);
}
