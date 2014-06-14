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
		* @cfg {boolean} 		    remoteFilter   Set this to true for the bubble dropdown to
		*										   reload the menu store when a filtering is triggered.
		*/
		remoteFilter: false,

		/**
		 * @cfg {Ext.data.Store}    menuStore      The store which should be used to populate the dropdown.
		 *
		 */
		menuStore: null,

		/**
		 * @cfg {Funtion} filterFunction The function to filter the auto complete results.
		 *
		 * @param {String} 			value		   The value currently in the input.
		 * @param {Ext.data.Model}	record         The record to consider.
		 *
		 * @return {boolean} 		true to include the record, false to filter it out.
		 */
		filterFunction: null,

		/**
		 * @cfg {String}			dropdownDisplayField  The field which decides what piece of data to display in the menu
		 *
		 */
		dropdownDisplayField: null,

		/**
		 * @cfg {String}			menuItemTpl    The tpl to use to format each item in the dropdown menu
		 *
		 */
		menuItemTpl: null,

		/**
		 * @cfg {Number}			menuWidth      Controls the width of the dropdown menu.
		 *
		 */
		menuWidth: 250,

		listeners: {
			inputKeyup: function (e, el) {
				var value = el.value.trim();
				this.showMenu(value);
			},
			inputBlur: function (e, el) {
				if (this.menu) {
					this.menu.hide();
				}
			},
			destroy: function () {
                if (this.menu) {
                    this.menu.destroy();
                }
				this.showMenu = null;
			},
			/**
			 * Setup the menu that will be used to display options after
			 * the user inputs some search text.
			 */
			initialize: function () {
				var me = this;

				this.showMenu = Ext.Function.createBuffered(function (value) {

					// no autocomplete if contacts app is disabled
					if (!ZCS.util.isAppEnabled(ZCS.constant.APP_CONTACTS)) {
						return;
					}

					if (!this.menu) {
						this.menu = Ext.create('Ext.dataview.List', {
							cls: 'zcs-contact-suggest',
							itemTpl: '{label}',
							scrollable: 'vertical',
							defaultType: 'listitem',
							disableSelection: true,
							maxHeight: 400,
							itemHeight: 68,
							width: this.getMenuWidth()
						});
					}

					var ipadLandscapeKeyboardHeight = 352,
						ipadPortraitKeyboardHeight = 264,
						prevNextBarHeight = 65,
						viewportBox = Ext.Viewport.element.getBox(),
						isLandscape = viewportBox.height < viewportBox.width,
						availableHeight,
						keyboardHeight,
						showElementPositioning = this.getInput().getBox(),
						startY = showElementPositioning.top + showElementPositioning.height;


					//Unfortunately, there does not appear to be a programmatic way to get the height of the
					//current virtual keyboard so we are left with this, which is not cross-OS and seems a bit
					//brittle.
					if (Ext.os.deviceType === "Desktop") {
						keyboardHeight = 0;
					} else if (isLandscape) {
						keyboardHeight = ipadLandscapeKeyboardHeight + prevNextBarHeight;
					} else {
						keyboardHeight = ipadPortraitKeyboardHeight + prevNextBarHeight;
					}

					availableHeight = viewportBox.height - startY;

					//Let the menu know that it only has the space between the bottom of the input
					//and the top of the keyboard  to show itself, this will allow it to scroll.
					this.menu.setMaxHeight(availableHeight);

					//If the value length is greater than 0 and defined.
					if (value.length) {
						if (this.getRemoteFilter()) {
							this.configureStore(value, this.getMenuStore());
							this.getMenuStore().load({
								callback: function () {
									//only show the menu if the response we are getting is still the value of the input.
									if (value === this.getInput().getValue().trim()) {
										this.loadMenuFromStore.call(this);
									}
								},
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
					} else {
						this.menu.hide();
					}
				}, 750, this);
			}
		}
	},

	/**
	 * @template
	 * If remoteFilter is true, then provide this function to configure the menuStore before it is loaded.
	 *
	 * @param {String}  	   value        The value is the text value used to filter, and the
	 * @param {Ext.data.Store} store        The configured menuStore before it is loaded.
	 *
	 */
	configureStore: null,

	/**
	 * If the drop down is currently being displayed, then the blur events or key presses may
	 * not be instructions to auto bubble.  Instead, a blur is likely just due to a user tap
	 * on the drop down.
	 */
	shouldAutoBubble: function () {
		return !this.menu || this.menu.isHidden() === true;
	},

	/**
	 * @private
	 *
	 * Retrieve menu items based on the current menu store.
	 */
	getMenuItems: function () {

		var menuRecords = [],
			me = this,
			label,
			tpl = this.getMenuItemTpl() ? new Ext.XTemplate(this.getMenuItemTpl()) : null;

		this.getMenuStore().each(function (record) {
			if (tpl) {
				var name = record.get('longName'),
					email = record.get('email');
				label = (name || email) ? tpl.apply({ name:name, email:email }) : null;
			}
			else {
				label = record.get(me.getDropdownDisplayField());
			}

			menuRecords.push({
				label:              label,
				isGroup:            record.get('isGroup'),
				autocompleteRecord: record
			});
		});

		//Only return the number specified in the config and no more.
		return menuRecords;
	},

	/**
	 * @private
	 *
	 * Shows the menu ui element with the contents of the menu store.
	 */
	loadMenuFromStore: function () {

		var menuItems,
			menu = this.menu,
			store = menu.getStore();

		if (this.getMenuStore().getCount() > 0) {
			menuItems = this.getMenuItems();
			if (store) {
				store.suspendEvents();
				store.removeAll();
				store.resumeEvents();
			}
			menu.setHeight(Math.min(menu.get('maxHeight'), menu.get('itemHeight') * menuItems.length));
			menu.setData(menuItems);
			menu.on('itemtap', this.handleMenuItemTap, this);

			if (Ext.os.deviceType === "Phone") {
				menu.setTop(0);
				//Dock to the right
				menu.setRight(0);
				menu.show();
			} else {
				menu.showBy(this.getInput(), 'tc-bc?');
			}

			Ext.Viewport.lastFocusedElement = Ext.Viewport.focusedElement;

			// Don't let the viewport blur input field when scrolling menu
			delete Ext.Viewport.focusedElement;
		} else {
			menu.hide();
		}
	},

	handleMenuItemTap: function (list, index, target, record, e, eOpts) {

		var acRecord = record.get('autocompleteRecord'),
			contactId = acRecord && acRecord.get('contactId'),
			me = this;

		if (record.get('isGroup') && contactId) {
			// expand contact group and add a bubble for each member
			ZCS.app.getContactListController().loadGroupMembers(contactId, function(response) {
				var contact = response[0],
					members = contact && contact.get('members');

				if (members) {
					var groupMembers = Ext.Array.clean(Ext.Array.map(members, function(member) {
						return ZCS.model.mail.ZtEmailAddress.fromEmail(member.memberEmail);
					}));
					me.addBubbles(groupMembers);
				}
			});
		}
		else {
			this.addBubble(acRecord);
		}

		this.clearInput();
		this.focusInput();
		list.hide();

		e.preventDefault();
		e.stopPropagation();
	}
});
