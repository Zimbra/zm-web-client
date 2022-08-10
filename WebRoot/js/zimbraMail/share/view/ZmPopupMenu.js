/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 */

/**
 * Creates a popup menu.
 * @class
 * This class represents a basic popup menu which can add menu items, manage listeners, and
 * enable/disabled its menu items.
 *
 * @author Conrad Damon
 *
 * @param {DwtComposite}	parent		the containing widget
 * @param {string}	className		the CSS class
 * @param {string}	id			an explicit ID to use for the control's HTML element
 * @param {ZmController}	controller	the owning controller
 * 
 * @extends		DwtMenu
 */
ZmPopupMenu = function(parent, className, id, controller) {

	if (arguments.length == 0) return;
	var params = Dwt.getParams(arguments, ZmPopupMenu.PARAMS);
	params.className = params.className ? params.className : "ActionMenu";
	params.style = params.style || DwtMenu.POPUP_STYLE;
    params.id = params.id || "POPUP_" + Dwt.getNextId();
	DwtMenu.call(this, params);

	controller = controller || appCtxt.getCurrentController();
	if (controller) {
		this._controller = controller;
		this._keyMap = this._controller.getKeyMapName();
	}

	this._menuItems = {};
};

ZmPopupMenu.PARAMS = ["parent", "className", "id", "controller"];

ZmPopupMenu.prototype = new DwtMenu;
ZmPopupMenu.prototype.constructor = ZmPopupMenu;

ZmPopupMenu.prototype.isZmPopupMenu = true;
ZmPopupMenu.prototype.toString = function() { return "ZmPopupMenu"; };

/**
 * Adds a section listener.
 * 
 * @param	{string}		menuItemId		the menu item id
 * @param	{AjxListener}	listener		the selection listener
 * @param	{number}		index				the index where to insert the listener
 */
ZmPopupMenu.prototype.addSelectionListener =
function(menuItemId, listener, index) {
	var menuItem = this._menuItems[menuItemId];
	if (menuItem) {
		menuItem.addSelectionListener(listener, index);
	}
};

/**
 * Removes a section listener.
 * 
 * @param	{string}		menuItemId		the menu item id
 * @param	{AjxListener}	listener		the selection listener
 */
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
 * @param {array}	ids		a list of menu item IDs
 * @param {boolean}		enabled	if <code>true</code>, enable the menu items
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

/**
 * Enables/disables all menu items.
 *
 * @param {boolean}		enabled	if <code>true</code>, enable the menu items
 */
ZmPopupMenu.prototype.enableAll =
function(enabled) {
	for (var i in this._menuItems) {
		this._menuItems[i].setEnabled(enabled);
	}
};

/**
 * Creates a menu item and adds the item to this menu.
 *
 * @param {string}	id			the menu item ID
 * @param {hash}	params		a hash of parameters
 * @param {string}	params.text		the menu item text
 * @param {string}	params.image		the icon class for the or menu item
 * @param {string}	params.disImage	disabled version of icon
 * @param {boolean}	params.enabled		if <code>true</code>, menu item is enabled
 * @param {constant}	params.style			the menu item style
 * @param {string}	params.radioGroupId	the ID of radio group for this menu item
 * @param {constant}	params.shortcut		the shortcut ID (from {@link ZmKeyMap}) for showing hint
 * 
 * @see		DwtMenuItem
 */
ZmPopupMenu.prototype.createMenuItem =
function(id, params, htmlElId) {
	var mi = this._menuItems[id] = new DwtMenuItem({parent:this, style:params.style, radioGroupId:params.radioGroupId,
													id: (htmlElId || params.id || id), index: params.index});
	if (params.image) {
		mi.setImage(params.image);
	}
	if (params.text) {
		mi.setText(AjxStringUtil.htmlEncode(params.text));
	}
	if (params.shortcut) {
		mi.setShortcut(appCtxt.getShortcutHint(this._keyMap, params.shortcut));
	}

	mi.setEnabled(params.enabled !== false);
	mi.setData(ZmOperation.MENUITEM_ID, id);

    //set context menu tr id
    var row = mi.getRowElement();
	if (row) {
		row.setAttribute("id", "POPUP" + "_" + mi.getHTMLElId().toString().replace(/\s/g, ""));
    }

	return mi;
};

/**
 * Gets the menu item with the given ID.
 *
 * @param {string}	id		an operation ID
 * @return	{DwtMenuItem}		the menu item
 */
ZmPopupMenu.prototype.getMenuItem =
function(id) {
	return this._menuItems[id];
};

/**
 * sets an item visibility. finds the menu item by id. 
 *
 * @param	{String}	id  the operation id
 * @param	{Boolean}	visible
 */
ZmPopupMenu.prototype.setItemVisible =
function(id, visible) {
	var item = this.getMenuItem(id);
	if (!item) {
		return;
	}
	item.setVisible(visible);
};

/**
 * Gets the menu items.
 *
 * @return	{array}		an array of {@link DwtMenuItem} objects
 */
ZmPopupMenu.prototype.getMenuItems =
function() {
	return this._menuItems;
};

/**
 * Gets the menu search sub-menu (if any).
 *
 * @return {DwtMenu}        the menu
 */
ZmPopupMenu.prototype.getSearchMenu =
function() {
    var menuItem = this.getMenuItem(ZmOperation.SEARCH_MENU);
    if (menuItem) {
        return menuItem.getMenu();
    }
};

ZmPopupMenu.prototype.getContactGroupMenu =
function() {
	var menuItem = this.getMenuItem(ZmOperation.CONTACTGROUP_MENU);
	if (menuItem) {
		return menuItem.getMenu();
	}
};


/**
 * Creates a menu item separator.
 * 
 * @return	{DwtMenuItem}	the separator menu item
 */
ZmPopupMenu.prototype.createSeparator =
function() {
	new DwtMenuItem({parent:this, style:DwtMenuItem.SEPARATOR_STYLE});
};
