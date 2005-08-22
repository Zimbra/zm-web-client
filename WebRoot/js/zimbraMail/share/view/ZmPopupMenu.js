/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmPopupMenu(parent, className, dialog) {

	if (arguments.length == 0) return;
	className = className || "ActionMenu";
	DwtMenu.call(this, parent, DwtMenu.POPUP_STYLE, className, null, dialog);

	this._menuItems = new Object();
}

ZmPopupMenu.prototype = new DwtMenu;
ZmPopupMenu.prototype.constructor = ZmPopupMenu;

ZmPopupMenu.prototype.toString = 
function() {
	return "ZmPopupMenu";
}

ZmPopupMenu.prototype.addSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].addSelectionListener(listener);
}

ZmPopupMenu.prototype.removeSelectionListener =
function(menuItemId, listener) {
	this._menuItems[menuItemId].removeSelectionListener(listener);
}

ZmPopupMenu.prototype.popup =
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
ZmPopupMenu.prototype.enable =
function(ids, enabled) {
	if (!(ids instanceof Array))
		ids = [ids];
	for (var i = 0; i < ids.length; i++)
		if (this._menuItems[ids[i]])
			this._menuItems[ids[i]].setEnabled(enabled);
}

ZmPopupMenu.prototype.enableAll =
function(enabled) {
	for (var i in this._menuItems)
		this._menuItems[i].setEnabled(enabled);
}

ZmPopupMenu.prototype.addMenuItem =
function(menuItemId, menuItem) {
	this._menuItems[menuItemId] = menuItem;
}

ZmPopupMenu.prototype.createMenuItem =
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

ZmPopupMenu.prototype.createSeparator =
function() {
	new DwtMenuItem(this, DwtMenuItem.SEPARATOR_STYLE);
}
