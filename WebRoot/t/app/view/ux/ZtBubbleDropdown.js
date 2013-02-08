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
* @class ZCS.view.ZtBubbleDropdown
*
* This class provides additional functionality to the bubbleable area.
* When the user types anything into the area, the configured store
* will be filtered based on the text entered.  An autocomplete menu will
* then appear.  If the user hits enter without selecting an option from the menu,
* a bubble with exactly what they inputted will appear.  If the user selects
* an item from the menu, the configured displayField from the model will 
* be displayed in a bubble.
*/
Ext.define('ZCS.view.ux.ZtBubbleDropdown', {
	extend: 'ZCS.view.ux.ZtBubbleArea',
	config: {
		/**
		* @cfg {boolean} 		    remoteFilter  Set this to true for the bubble dropdown to
		*										  reload the menu store when a filtering is triggered.
		*/
		remoteFilter: false,

		/**
		 * @cfg {Function}			configureStore If remoteFilter is true, then provide this function
		 *										   to configure the menuStore before it is loaded.  The
		 *										   function will receieve two parameters, value and store.
		 *										   The value is the text value used to filter, and the
		 *										   store is the menuStore.
		 *
		 */
		configureStore: null,

		/**
		 * @cfg {Ext.data.Store}    menuStore      The store which should be used to populate the dropdown.
		 *
		 */
		menuStore: null,

		/**
		 * @cfg {Funtion} filterFunction The function to filter the auto complete results.
		 *
		 * @param {String} 			value		  The value currently in the input.
		 * @param {Ext.data.Model}	record        The record to consider.
		 *
		 * @return {boolean} 		true to include the record, false to filter it out.
		 */
		filterFunction: null,
		
		/**
		 * @cfg {String}			dropdownDisplayField  The field which decides what piece of data to display in the menu
		 *
		 */
		dropdownDisplayField: null
	},

	/**
	 * If the drop down is currently being displayed, then the blur events or key presses may
	 * not be instructions to auto bubble.  Instead, a blur is likely just due to a user tap
	 * on the drop down.
	 */
	shouldAutoBubble: function () {
		return this.menu.isHidden();
	},

	/**
	 * @private
	 * 
	 * Retrieve menu items based on the current menu store.
	 */
	getMenuItems: function () {
		var menuRecords = [],
			me = this;

		this.getMenuStore().each(function (record) {
			menuRecords.push({
				label: record.get(me.getDropdownDisplayField()),
				listener: function () {
					me.clearInput();
					me.addBubble(record);
					me.getInput().dom.value = '';
					me.focusInput();
				}
			});
		})

		return menuRecords;
	},

	/**
	 * @private
	 *
	 * Shows the menu ui element with the contents of the menu store.
	 */
	loadMenuFromStore: function () {
		var menuItems;

		if (this.getMenuStore().getCount() > 0) {
			menuItems = this.getMenuItems();
			this.menu.setMenuItems(menuItems);
			this.menu.popup('tc-bc?');
			this.menu.adjustHeight();
		} else {
			this.menu.hide();
		}
	},

	listeners: {
		inputKeyup: function (e, el) {
			var value = el.value;
			this.showMenu(value);
		},
		inputBlur: function (e, el) {
			if (this.menu) {
				this.menu.hide();
			}
		},
		destroy: function () {
			this.menu.destroy();
			this.showMenu = null;
		},
		/**
		 * Setup the menu that will be used to display options after
		 * the user inputs some search text.
		 */
		painted: function () {		
			this.menu = Ext.create('ZCS.common.ZtMenu', {
				referenceComponent: this.getInput(),
				modal: false
			});

			this.showMenu = Ext.Function.createBuffered(function (value) {
				
				if (this.getRemoteFilter()) {
					this.configureStore(value, this.getMenuStore());

					this.getMenuStore.load({
						callback: this.loadMenuFromStore,
						scope: this
					});
				} else {
					var filterFunction = this.getFilterFunction(),
						menuItems = null;

					if (filterFunction) {
						this.getMenuStore().clearFilter(true);
						this.getMenuStore().filterBy(function (record) {
							return filterFunction(value, record);
						});
					}

					this.loadMenuFromStore();
				}
			}, 100, this);
		}
	}
});