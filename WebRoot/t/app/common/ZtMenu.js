Ext.define('ZCS.common.ZtMenu', {

	extend: 'Ext.Panel',

	config: {
		layout: 'fit',
		width: 160,
		modal: true,
		hideOnMaskTap: true,
		padding: 5,
		items: [
			{
				xtype:'list',
				store: {
					fields: ['label', 'action']
				},
				itemTpl: '{label}',
				listeners: {
					select: function(list, record) {
						var action = record.get('action'),
							menu = this.up('panel');
						console.log('Menu click: ' + action);
						var listener = menu.getActionListeners()[action];
						if (listener) {
							listener(record);
							menu.popdown();
						}
					}
				}
			}
		],
		referenceComponent: null,
		actionListeners: {}
	},

	initialize: function() {
		// if we don't wait before doing this, the 'painted' event is fired before DOM is ready :(
		Ext.defer(this.initMenu, 100, this);
	},

	initMenu: function() {
		console.log('Initializing menu');
		this.on({
			painted: {
				scope: this,
				fn: function(el) {
					console.log('PAINTED event fired on menu');
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

	setMenuItems: function(menuItems, scope) {
		var actionListeners = {};
		Ext.each(menuItems, function(menuItem) {
			actionListeners[menuItem.action] = Ext.bind(menuItem.listener, scope);
		});
		this.setActionListeners(actionListeners);
		this.down('list').getStore().setData(menuItems);
	},

	popup: function() {
		this.showBy(this.getReferenceComponent(), 'tr-br?');
	},

	popdown: function() {
		this.hide();
	}
});
