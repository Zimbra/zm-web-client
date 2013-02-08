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

	config: {
		layout: 'fit',
		width: 160,     // TODO: would be nicer to have it autosize to width of longest item
		modal: true,
		hideOnMaskTap: true,
		padding: 5,
		defaultItemHeight: 47,
		items: [
			{
				xtype:'list',
				store: {
					model: 'ZCS.model.ZtMenuItem'
				},
				itemTpl: '{label}',
				scrollable: 'vertical',
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
			}
		],
		maxHeight: 300,
		// the reference component is typically the button that triggered display of this menu
		referenceComponent: null
	},

	initialize: function() {
		// if we don't wait before doing this, the 'painted' event is fired before DOM is ready :(
		Ext.defer(this.initMenu, 100, this);
	},

	/**
	 * Set the menu's height so that it matches the list of items.
	 * @private
	 */
	initMenu: function() {
		Ext.Logger.verbose('Initializing menu');
		this.on({
			painted: {
				scope: this,
				fn: function(el) {
					Ext.Logger.verbose('PAINTED event fired on menu');
					//refresh the list as it may not have rendered anything since the menu was not ready.
					this.down('list').refresh();
					this.adjustHeight();
				}
			}
		});
	},

	/**
	 *
	 * Adjusts the menus height to fit all items, are be the max height
	 * whichever is smaller.
	 */
	adjustHeight: function () {
		var list = this.down('list');
		var firstItem = list && list.element.down('.x-list-item');
		var itemHeight = firstItem && firstItem.getHeight();

		var hasItems = list.getStore().getCount() > 0;
		
		//The view has not yet rendered, so we need to set a height anyway.
		if (!itemHeight && hasItems) {
			itemHeight = this.getDefaultItemHeight();
		}

		if (itemHeight) {
			var itemCount = list.getStore().getCount(),
				height = Math.min(this.getMaxHeight(), (itemHeight * itemCount) + 12);


			this.setHeight(height);
			list.setHeight(height - 12);
		}
	},

	/**
	 * Populates the menu with actions.
	 *
	 * @param {array}   menuItems       list of ZtMenuItem models
	 */
	setMenuItems: function(menuItems) {
		this.down('list').getStore().setData(menuItems);
	},

	/**
	 * Displays the menu.
	 */
	popup: function(positioning) {
		var list = this.down('list');
		list.deselect(list.getSelection()); // clear the previous selection
		this.showBy(this.getReferenceComponent(), positioning || 'tr-br?');
	},

	/**
	 * Hides the menu.
	 */
	popdown: function() {
		this.hide();
	}
});
