/**
 * The mail panel contains a 'mailoverview', a 'convlistpanel', and a 'convpanel'.
 */
Ext.define('ZCS.view.mail.ZtMailView', {

	extend: 'ZCS.view.ZtAppView',

	requires: [
		'ZCS.view.mail.ZtMailOverview',
		'ZCS.view.mail.ZtConvListPanel',
		'ZCS.view.mail.ZtConvPanel'
	],

	xtype: 'mailview',

	config: {
		overviewXtype: 'mailoverview',
		listPanelXtype: ZCS.constant.LIST_PANEL_XTYPE[ZCS.constant.APP_MAIL],
		itemPanelXtype: 'convpanel'
	}
});
