Ext.define("ZCS.view.mail.ZtMailView", {

	extend: "Ext.Container",

	requires: [
		'Ext.Panel',
		'Ext.field.Text',
		'Ext.Label',

		'ZCS.view.ZtOverview',
		"ZCS.view.mail.ZtConvListPanel",
		"ZCS.view.mail.ZtConvPanel"
	],

	xtype: "mailview",

	config: {
		layout: 'hbox',
		padding: 0
	},

	initialize: function() {

		this.callParent(arguments);

		var overview = {
			xtype: 'overview',
//			flex: 1,
			width: '20%',
			hidden: true
		};

		var convListPanel = {
			xtype: 'convlistpanel',
//			flex: 1
			width: '30%'
		};

		var convPanel = {
			xtype: 'convpanel',
//			flex: 2
			width: '70%'
		};

		this.add([
			overview,
			convListPanel,
			convPanel
		]);
	}
});

