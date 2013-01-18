Ext.define('ZCS.view.mail.ZtConvListPanel', {

	extend: 'ZCS.view.ZtListPanel',

	requires: [
		'ZCS.view.mail.ZtConvListView'
	],

	xtype: ZCS.constant.LIST_PANEL_XTYPE[ZCS.constant.APP_MAIL],

	config: {
		app: ZCS.constant.APP_MAIL,
		listPanelTitle: 'Mail',
		newItemIconCls: 'compose',
		listPanelStoreName: 'ZtConvStore'
	}
});
