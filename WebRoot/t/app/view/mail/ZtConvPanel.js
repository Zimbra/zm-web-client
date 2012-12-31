//Ext.Loader.setPath('Ext.plugin', './plugin');
Ext.define('ZCS.view.mail.ZtConvPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',
//		'ZCS.view.mail.ZtConvToolbar',
		'ZCS.view.mail.ZtMsgListView'
	],

	xtype: 'convpanel',

	config: {
		layout: 'fit',
		style: 'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var convToolbar = {
//			xtype: 'convtoolbar'
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
						this.up('convpanel').fireEvent('showConvMenu');
					},
					hidden: true
				}
			]
		};

		var msgListView = {
			xtype: 'msglistview',
			store: Ext.getStore('ZtMsgStore')
		};

		this.add([
			convToolbar,
			msgListView
		]);
	}
});
