Ext.define('ZCS.view.mail.ZtConvPanel', {
	extend: 'Ext.Panel',
	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',
		'ZCS.view.mail.ZtConvToolbar',
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
			xtype: 'convtoolbar'
		};

		var msgListView = {
			xtype: 'msglistview',
			store: Ext.getStore('ZtMsgStore')
		}

		this.add([
			convToolbar,
			msgListView
		]);
	}
});
