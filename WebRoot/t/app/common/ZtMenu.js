/**
 * A simple dropdown menu. It's a panel that contains a list with actions that can be tapped.
 *
 * @see ZtMenuItem
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
		items: [
			{
				xtype:'list',
				store: {
					model: 'ZCS.model.ZtMenuItem'
				},
				itemTpl: '{label}',
				listeners: {
					select: function(list, record) {
						var action = record.get('action'),
							menu = this.up('panel');
						console.log('Menu click: ' + action);
						var listener = record.get('listener');
						if (listener) {
							listener(record);
							menu.popdown();
						}
					}
				}
			}
		],
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
//		console.log('Initializing menu');
		this.on({
			painted: {
				scope: this,
				fn: function(el) {
//					console.log('PAINTED event fired on menu');
					var list = this.down('list');
					var firstItem = list && list.element.down('.x-list-item');
					var itemHeight = firstItem && firstItem.getHeight();
					if (itemHeight) {
						var itemCount = list.getStore().getCount();
						this.setHeight((itemHeight * itemCount) + 12);
					}
				}
			}
		});
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
	popup: function() {
		var list = this.down('list');
		list.deselect(list.getSelection()); // clear the previous selection
		this.showBy(this.getReferenceComponent(), 'tr-br?');
	},

	/**
	 * Hides the menu.
	 */
	popdown: function() {
		this.hide();
	}
});
