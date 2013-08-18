/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Mixin that provides menu support. Meant to be added to a controller, which can
 * have multiple menus identified by name.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */

Ext.define('ZCS.common.ZtMenuable', {

	config: {
		menus:          {},
		menuButtons:    {},
		menuConfigs:    {}
	},

	getMenu: function(menuName) {
		return this.getMenus()[menuName];
	},

	getMenuButton: function(menuName) {
		return this.getMenuButtons()[menuName];
	},

	getMenuConfig: function(menuName) {
		return this.getMenuConfigs()[menuName];
	},

	setMenu: function(menuName, menu) {
		this.getMenus()[menuName] = menu;
	},

	setMenuButton: function(menuName, button) {
		this.getMenuButtons()[menuName] = button;
	},

	setMenuConfig: function(menuName, config) {
		this.getMenuConfigs()[menuName] = config;
	},

	/**
	 * Sets up the action menu, creating a listener for each action.
	 */
	setMenuItems: function(menuName) {
		var menuData = this.getMenuConfig(menuName);
		Ext.each(menuData, function(menuItem) {
			menuItem.listener = this[menuItem.listener];
			menuItem.scope = this;
		}, this);
		this.getMenu(menuName).setMenuItems(menuData);
	},

	/**
	 * Displays the action menu after the dropdown button on the toolbar has been tapped.
	 *
	 * @param {Button}  menuButton      dropdown button
	 * @param {Object}  params          additional params
	 */
	doShowMenu: function(menuButton, params) {

		var menuName = params.menuName,
			menu = this.getMenu(menuName);

		if (!menu) {
			menu = Ext.create('ZCS.common.ZtMenu', {
				name: menuName,
				enableItemsFn: this.enableMenuItems,
				enableItemsScope: this
			});
			this.setMenu(menuName, menu);
			this.setMenuItems(menuName);
		}
		this.setMenuButton(menuName, menuButton);
		menu.setReferenceComponent(menuButton);
		menu.popup();
	},

	/**
	 * Override this function to enable/disable menu items after menu has popped up
	 */
	enableMenuItems: function(menuName, items) {}
});
