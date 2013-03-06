/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * A simple dropdown menu. It's a panel that contains a list with actions that can be tapped.
 *
 * @see ZtMenuItem
 * @author Conrad Damon <cdamon@zimbra.com>
 *
 * TODO: See if this can be implemented more simply as a combo box with a hidden text field.
 */
Ext.define('ZCS.common.ZtMenu', {

	extend: 'Ext.Panel',

	requires: [
		'ZCS.model.ZtMenuItem'
	],

//	xtype: 'menu',

	config: {
		layout: 'fit',
		width: 160,     // TODO: would be nicer to have it autosize to width of longest item
		modal: true,
		hideOnMaskTap: true,
		padding: 5,
		defaultItemHeight: 47,
		menuItemTpl: '{label}',
		maxHeight: 350,

		/**
		 * @required
		 *
		 * @cfg {Component} referenceComponent
		 *
		 * The reference component is used to position the menu as a dropdown menu. It is typically the
		 * button that triggered display of the menu.
		 */
		referenceComponent: null,

		enableItemsFn: null,
		enableItemsScope: null
	},

	initialize: function() {
		var me = this;

		this.add({
			xtype: 'list',
			//Let this have scroll so that it will paint the real height of list items.
			autoScroll: true,
			variableHeights: true,
			// itemHeight: this.getDefaultItemHeight(),
			store: {
				model: 'ZCS.model.ZtMenuItem'
			},
			itemTpl: this.getMenuItemTpl(),
			listeners: {
				itemtap: function(list, index, target, record, e) {
					var action = record.get('action'),
						menu = this.up('panel');
					Ext.Logger.verbose('Menu click: ' + action);
					var listener = record.get('listener');
					if (listener) {
						menu.popdown();
						listener();
						e.stopEvent();
					}
				}
			}
		});
	},

	/**
	 *
	 * Adjusts the menus height to fit all items, or be the max height
	 * whichever is smaller.
	 * TODO: adjust width
	 */
	adjustHeight: function () {
		var menu = this,
			list = this.down('list'),
			totalHeight = list.getItemMap().getTotalHeight(),
			actualHeight = 0;

		this.setHeight(totalHeight + 12);
		list.refresh();

		var ln = list.listItems.length,
			i, item, itemIndex;

		// First we do all the reads
        for (i = 0; i < ln; i++) {
            item = list.listItems[i];
            itemIndex = item.dataIndex;
            // itemIndex may not be set yet if the store is still being loaded
            if (itemIndex !== null) {
                actualHeight += item.element.getFirstChild().getHeight();
            }
        }

        if (actualHeight === 0) {
        	//The list hasn't actually rendered yet, lets do this again until it has been
        	Ext.defer(this.adjustHeight, 100, menu);
        } else {
	        menu.setHeight(actualHeight + 12);
	        list.setHeight(actualHeight);
		}
	},

	/**
	 * Populates the menu with actions.
	 *
	 * @param {array}   menuItems       list of ZtMenuItem models
	 */
	setMenuItems: function(menuItems) {
		this.down('list').getStore().removeAll();
		this.down('list').getStore().setData(menuItems);
		this.adjustHeight();
	},

	/**
	 * Displays the menu.
	 */
	popup: function(positioning) {

		var list = this.down('list'),
			enableItemsFn = this.getEnableItemsFn();

		list.deselect(list.getSelection()); // clear the previous selection
		this.showBy(this.getReferenceComponent(), positioning || 'tr-br?');
		this.adjustHeight();

		if (enableItemsFn) {
			// Not happy with this (timeout of 0 does not work, so kinda racy),
			// but there's no good event fired when entire list has rendered.
			// May cause flicker first time menu is displayed.
			Ext.defer(enableItemsFn, 200, this.getEnableItemsScope() || this);
		}
	},

	/**
	 * Hides the menu.
	 */
	popdown: function() {
		this.hide();
	},

	enableItem: function(action, enabled) {
		var list = this.down('list'),
			store = list.getStore(),
			item = list.getItemAt(store.find('action', action));

		if (item) {
			item.setCls(enabled ? '' : 'zcs-menuitem-disabled');
		}
	}
});
