Ext.define('ZCS.view.contacts.ZtContactsOverview', {

	extend: 'ZCS.view.ZtOverview',

	requires: [
		'ZCS.model.contacts.ZtContactsFolder',
	],

	xtype: 'contactsoverview',

	config: {
		overviewApp: ZCS.constant.APP_CONTACTS,
		overviewModel: 'ZCS.model.contacts.ZtContactsFolder',
		overviewTitle: 'Contacts'
	}
});
