Ext.define('ZCS.view.ZtItemPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar'
	],

	config: {
		layout: 'fit',
		style: 'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var itemPanelXtype = this.xtype;

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
						this.up(itemPanelXtype).fireEvent('showMenu');
					},
					hidden: true
				}
			]
		};

		this.add([
			toolbar,
			this.getItemView()
		]);
	}
});
