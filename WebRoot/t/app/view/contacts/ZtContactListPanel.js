Ext.define('ZCS.view.contacts.ZtContactListPanel', {

	extend: 'ZCS.view.ZtListPanel',

	requires: [
		'ZCS.view.contacts.ZtContactListView'
	],

	xtype: 'contactlistpanel',

	config: {
		app: ZCS.constant.APP_CONTACTS,
		listPanelTitle: 'Contacts',
		newItemIconCls: 'plus',
		listPanelStoreName: 'ZtContactStore'
	}
});
