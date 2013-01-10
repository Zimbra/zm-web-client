/**
 * Base class for a controller that manages a single item. It handles item actions initiated by a dropdown action menu
 * anchored to the toolbar, or from within the item itself.
 *
 * @see ZtItemPanel
 * @see ZtItem
 */
Ext.define('ZCS.controller.ZtItemController', {

	extend: 'Ext.app.Controller',

	requires: [
		'ZCS.common.ZtMenu'
	],

	config: {
		refs: {
			itemPanel: null,
			itemToolbar: null,
			menuButton: null
		},
		control: {
			itemPanel: {
				showMenu: 'onShowMenu'
			}
		},
		item: null
	},

	/**
	 * Sets up the action menu, creating a listener for each action.
	 * @protected
	 */
	setMenuItems: function() {
		var menuData = this.getMenuData();
		Ext.each(menuData, function(menuItem) {
			menuItem.listener = Ext.bind(this[menuItem.listener], this);
		}, this);
		this.itemMenu.setMenuItems(menuData);
	},

	/**
	 * Displays the action menu after the dropdown button on the toolbar has been tapped.
	 * @protected
	 */
	onShowMenu: function() {
//		console.log("Item menu event caught");

		if (!this.itemMenu) {
			this.itemMenu = Ext.create('ZCS.common.ZtMenu', {
				referenceComponent: this.getMenuButton()
			});
			this.setMenuItems();
		}
		this.itemMenu.popup();
	},

	/**
	 * Clears the content of the toolbar and hides the dropdown button.
	 */
	clear: function() {
		this.getItemToolbar().setTitle('');
		this.getMenuButton().hide();
	},

	/**
	 * Displays the given item in a ZtItemPanel.
	 *
	 * @param {ZtItem}  item        the item
	 */
	showItem: function(item) {
		this.clear();
		this.setItem(item);
		this.getMenuButton().show();
	}
});
