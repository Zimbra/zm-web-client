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

	/**
	 * Override this function to modify menu labels before menu pops up
	 */
	updateMenuLabels: function () {},

	/**
	 * Override this function to enable/disable menu items after menu has popped up
	 */
	enableMenuItems: function(menuName, items) {},

	showMenu: function (menuButton, params) {
		var itemPanel,
			menu = Ext.ComponentQuery.query('#' + params.menuName + 'Menu')[0];

		if (this.setActiveMailComponent) {
			itemPanel = menuButton.up('.itempanel');

			if (!itemPanel) {
				var itemPanelEl = menuButton.up('.zcs-item-panel');
				itemPanel = itemPanelEl && Ext.getCmp(itemPanelEl.id);
			}
			this.setActiveMailComponent(itemPanel);
		}

		menuButton.addCls('menu-open');
		menu.addListener('hide', function () {
			//We may have removed the menuButton in the menu action.
			if (menuButton.dom) {
				menuButton.removeCls('menu-open');
			}
		}, this, {single: true});

		this.updateMenuLabels(menuButton, params, menu);
		this.enableMenuItems(menu);
		menu.setActionParams(params);
		menu.popup(menuButton, 'tr-br?');
	},

	onMenuItemSelect: function (list, index, target, record) {
		if (list.getItemAt(index) && !list.getItemAt(index).getDisabled()) {
			this[record.get('handlerName')](list.getActionParams());
			list.hide();
		}
	}

});