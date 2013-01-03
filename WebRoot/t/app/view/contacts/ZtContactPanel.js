//Ext.Loader.setPath('Ext.plugin', './plugin');
Ext.define('ZCS.view.contacts.ZtContactPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.TitleBar',
		'ZCS.view.contacts.ZtContactView'
	],

	xtype: 'contactpanel',

	config: {
		layout: 'fit',
		style: 'border: solid blue 1px;'
	},

	initialize: function() {

		this.callParent(arguments);

		var contactToolbar = {
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
						this.up('contactpanel').fireEvent('showContactMenu');
					},
					hidden: true
				}
			]
		};

		var contactView = {
			xtype: 'contactview'
		};

		this.add([
			contactToolbar,
			contactView
		]);
	}
});
