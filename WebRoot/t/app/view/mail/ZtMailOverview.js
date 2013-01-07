Ext.define('ZCS.view.mail.ZtMailOverview', {

	extend: 'ZCS.view.ZtOverview',

	requires: [
		'ZCS.model.mail.ZtMailFolder'
	],

	xtype: 'mailoverview',

	config: {
		overviewApp: ZCS.constant.APP_MAIL,
		overviewModel: 'ZCS.model.mail.ZtMailFolder',
		overviewTitle: 'Folders'
	}
});
