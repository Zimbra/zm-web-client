Ext.define("ZCS.view.mail.ZtMailView", {
	extend: "Ext.Container",
	requires: [
		'Ext.Panel',
		'Ext.field.Text',
		'Ext.Label',
		"ZCS.view.mail.ZtConvListPanel",
		"ZCS.view.mail.ZtConvPanel"
	],
	xtype: "mailview",

	initialize: function() {
		this.callParent(arguments);
	},

	config: {
		layout: 'hbox',
		padding: 0,
		items: [
			{
				xtype: 'convlistpanel',
				flex: 1
			},
			{
				xtype: 'convpanel',
				flex: 2
			}
		]

	}
});

