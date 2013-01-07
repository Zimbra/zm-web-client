Ext.define('ZCS.view.ZtAppView', {

	extend: 'Ext.Container',

	requires: [
		'Ext.Panel',
		'Ext.field.Text',
		'Ext.Label'
	],

	config: {
		layout: 'hbox',
		padding: 0
	},

	initialize: function() {

		this.callParent(arguments);

		var overview = {
			xtype: this.getOverviewXtype(),
			width: '20%',
			hidden: true
		};

		var listPanel = {
			xtype: this.getListPanelXtype(),
			width: '30%'
		};

		var itemPanel = {
			xtype: this.getItemPanelXtype(),
			width: '70%'
		};

		this.add([
			overview,
			listPanel,
			itemPanel
		]);
	}
});

