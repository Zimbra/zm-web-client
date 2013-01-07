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

	setMenuItems: function() {
		var menuData = this.getMenuData();
		Ext.each(menuData, function(menuItem) {
			menuItem.listener = Ext.bind(this[menuItem.listener], this);
		}, this);
		this.itemMenu.setMenuItems(menuData);
	},

	onShowMenu: function() {
		console.log("Item menu event caught");

		if (!this.itemMenu) {
			this.itemMenu = Ext.create('ZCS.common.ZtMenu', {
				referenceComponent: this.getMenuButton()
			});
			this.setMenuItems();
		}
		this.itemMenu.popup();
	},

	clear: function() {
		this.getItemToolbar().setTitle('');
		this.getMenuButton().hide();
	},

	showItem: function(item) {
		this.clear();
		this.setItem(item);
		this.getMenuButton().show();
	}
});
