/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * A small model to represent an action in an action menu.
 */
Ext.define('ZCS.model.ZtMenuItem', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			{ name: 'label',    type: 'string' },   // user-visible text
			{ name: 'action',   type: 'string' },   // constant for the operation to perform
			{ name: 'listener', type: 'auto' },     // function to run when the action is invoked
			{ name: 'scope',    type: 'auto' },
			{ name: 'args',     type: 'auto' }
		]
	}
});

/**
 * A menu list component that supports calling a configured listener for each item.
 */
Ext.define('ZCS.model.ZtMenuList', {

	extend: 'Ext.dataview.List',

	xtype: 'menulist',

	config: {
		//Let this have scroll so that it will paint the real height of list items.
		autoScroll: true,
		variableHeights: true,
		// itemHeight: this.getDefaultItemHeight(),
		store: {
			model: 'ZCS.model.ZtMenuItem'
		},
		listeners: {
			itemtap: function(list, index, target, record, e) {
				var action = record.get('action'),
					menu = this.up('panel'),
					args = record.get('args') || [];
                //<debug>
				Ext.Logger.verbose('Menu click: ' + action);
                //</debug>
				var listener = record.get('listener');
				if (listener && !target.getDisabled()) {
					menu.popdown();
					listener.apply(record.get('scope'), args);
					e.stopEvent();
					record.set('args', null);
				}
			}
		}
	},

	// The two overrides below are so that absolutely nothing happens when the user taps on a
	// disabled menu item. Don't show the pressed or the selected background color.
	onItemTrigger: function(me, index) {
		if (!me.getItemAt(index).getDisabled()) {
			this.callParent(arguments);
		}
	},
	doItemTouchStart: function(me, index, target, record) {
		if (me.getItemAt(index) && !me.getItemAt(index).getDisabled()) {
			this.callParent(arguments);
		}
	}
});

/**
 * A simple dropdown menu. It's a panel that contains a list with actions that can be tapped.
 *
 * @see ZtMenuItem
 * @see ZtMenuList
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtMenu', {

	extend: 'Ext.Panel',

//	xtype: 'menu',

	config: {
		layout: 'fit',
		width: 160,     // TODO: would be nicer to have it autosize to width of longest item
		modal: true,
		hideOnMaskTap: true,
		padding: '5 5 6 5',
		style: 'overflow: hidden;',
		defaultItemHeight: 47,
		menuItemTpl: '{label}',
		maxHeight: 450,

		name: '',

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
		enableItemsScope: null,
		positioning: null
	},

	initialize: function() {
		var me = this;

		Ext.get(this.element.dom.childNodes[0]).applyStyles({
			"background-color": "transparent"
		});

		this.add({
			xtype: 'menulist',
			itemTpl: this.getMenuItemTpl()
		});

		ZCS.app.on('orientationChange', function () {
			if (!this.isHidden()) {
				this.rePosition();
			}
		}, this);
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
                actualHeight += item.element.getHeight();
            }
        }

        if (actualHeight === 0) {
        	//The list hasn't actually rendered yet, lets do this again until it has been
        	Ext.defer(this.adjustHeight, 100, menu);
        } else {
        	var heightToUse = Math.min(this.getMaxHeight(), actualHeight);
	        menu.setHeight(heightToUse + 12);
	        menu.setMaxHeight(heightToUse + 12);
	        list.setHeight(heightToUse);
		}
	},

	/**
	 * Populates the menu with actions.
	 *
	 * @param {array}   menuItems       list of ZtMenuItem models
	 */
	setMenuItems: function(menuItems) {
		var list = this.down('list'),
			store = list.getStore();
		store.removeAll();
		store.setData(menuItems);
		this.adjustHeight();
	},

	/**
	 * Displays the menu.
	 */
	popup: function(positioning) {

		var list = this.down('list'),
			enableItemsFn = this.getEnableItemsFn();

		this.setPositioning(positioning);

		list.deselect(list.getSelection()); // clear the previous selection
		this.showBy(this.getReferenceComponent(), positioning || 'tr-br?');
		this.adjustHeight();

		if (enableItemsFn) {
			// Not happy with this (timeout of 0 does not work, so kinda racy),
			// but there's no good event fired when entire list has rendered.
			// May cause flicker first time menu is displayed.
			Ext.defer(enableItemsFn, 200, this.getEnableItemsScope() || this, [this.getName()]);
		}
	},

	rePosition: function () {
		this.showBy(this.getReferenceComponent(), this.getPositioning() || 'tr-br?');
	},

	/**
	 * Hides the menu.
	 */
	popdown: function() {
		this.hide();
	},

	/**
	 * Returns the menu item associated with the given action.
	 *
	 * @param {String}  action      action
	 * @return {ZtMenuItem}
	 */
	getItem: function(action) {
		var list = this.down('list'),
			store = list.getStore();
		return list.getItemAt(store.find('action', action));
	},

	/**
	 * Enables or disables a menu item. A disabled item will be grey, and tapping it
	 * does nothing.
	 *
	 * @param {String}  action      ID of item to disable
	 * @param {Boolean} enabled     true to enable, false to disable
	 */
	enableItem: function(action, enabled) {

		var item = this.getItem(action);
		if (item) {
			item.setDisabled(!enabled);
			item.setCls(enabled ? 'x-list-item-relative' : 'zcs-menuitem-disabled x-list-item-relative');
		}
	},

	/**
	 * Adds arguments to a listener before it's called.
	 *
	 * @param {String}  action      action
	 * @param {Array}   args        args to add
	 */
	setArgs: function(action, args) {
		var list = this.down('list'),
			store = list.getStore(),
			menuItem = store.findRecord('action', action);
		if (menuItem) {
			menuItem.set('args', args);
		}
	}
});
