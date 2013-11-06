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
 * A simple dropdown menu. It's a list with actions that can be tapped.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtMenu', {

	extend: 'Ext.dataview.List',

	config: {
		bottom: 0,
		cls: 'zcs-floating-list',
		// TODO: would be nicer to have it autosize to width of longest item
		width: Ext.os.deviceType === "Phone" ? Ext.Viewport.element.getWidth() : 160,
		hidden: true,
		modal: true,
		hideOnMaskTap: true,
		defaultItemHeight: 47,
		itemTpl: '{label}',
		maxHeight: 450,
		scrollable: 'vertical',
		defaultType: 'listitem',
		disableSelection: true,

		name: '',

		/**
		 * @cfg {Component} referenceComponent
		 *
		 * The reference component is used to position the menu as a dropdown
		 * menu. It is typically the btton that triggered display of the menu.
		 * Stored so we can reposition the menu when orientation changes.
		 */
		referenceComponent: null,

		/**
		 * @cfg {Component} positioning
		 *
		 * The alignment for positioning this menu relative to its reference
		 * component. Defaults to 'tr-br?'
		 */
		positioning: null,

		actionParams: null
	},

	initialize: function() {
		var me = this;
		ZCS.app.on('orientationChange', function () {
			if (this.isHidden() !== null && !this.isHidden()) {
				this.rePosition();
			}
		}, this);

		me.callParent(arguments);
		me.add({
			xtype: 'button',
			text: 'Cancel',
			handler: function () {
				me.hide();
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
		var list = this,
			totalHeight = list.getItemMap().getTotalHeight(),
			actualHeight = 0,
			bufferHeight = 52;  // additional height for margin and cancel button

		this.setHeight(totalHeight + bufferHeight);
		//list.refresh();

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
			Ext.defer(this.adjustHeight, 100);
		} else {
			var heightToUse = Math.min(this.getMaxHeight(), actualHeight);
			list.setHeight(heightToUse + bufferHeight);
			list.setMaxHeight(heightToUse + bufferHeight);
		}
	},

	/**
	 * Displays the menu.
	 */
	popup: function(referenceComponent, positioning) {
		this.setReferenceComponent(referenceComponent);
		this.setPositioning(positioning);

		this.deselect(this.getSelection()); // clear the previous selection

		if (Ext.os.deviceType === "Phone") {
			this.show({
				type: 'slide',
				direction: 'up',
				duration: 250
			});
		} else {
			this.showBy(this.getReferenceComponent(), positioning || 'tr-br?');
		}
		if (this.get('name') !== ZCS.constant.MENU_ADDRESS) {
			this.adjustHeight();
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
	 * @param {String}  action	  action
	 * @return {ZtMenuItem}
	 */
	getItem: function(action) {
		var store = this.getStore();
		return this.getItemAt(store.find('action', action));
	},

	/**
	 * Enables or disables a menu item. A disabled item does not react to tap.
	 *
	 * @param {String}  action	  ID of item to disable
	 * @param {Boolean} enabled	 true to enable, false to disable
	 */
	enableItem: function(action, enabled) {
		var item = this.getItem(action);
		if (item) {
			item.setDisabled(!enabled);
		}
	},

	/**
	 * Hides or shows a menu item.
	 *
	 * @param {String}  action	  ID of item to disable
	 * @param {Boolean} enabled	 true to enable, false to disable
	 */
	hideItem: function(action, hidden) {
		var item = this.getItem(action);
		if (item) {
			item.setHidden(hidden);
		}
	}
});