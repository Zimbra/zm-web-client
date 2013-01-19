/**
 * Base class for a panel that displays a single item. It has a toolbar at the top, and the item is
 * displayed below. The toolbar has a button that will show an action menu for the item.
 */
Ext.define('ZCS.view.ZtItemPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar'
	],

	xtype: 'itempanel',

	config: {
		layout: 'fit',
		style: 'border: solid blue 1px;',
		itemView: null,
		itemClass: null
	},

	initialize: function() {

		this.callParent(arguments);

		var toolbar = {
			xtype: 'titlebar',
			docked: 'top',
			ui: 'light',
			items: [
				{
					xtype: 'button',
					iconCls: 'arrow_down',
					iconMask: true,
					align: 'right',
					handler: function() {
						this.up('titlebar').fireEvent('showMenu');
					},
					hidden: true
				}
			]
		};

		var itemView = {
			xtype: this.getItemView()
		}

		this.add([
			toolbar,
			itemView
		]);
	}
});
