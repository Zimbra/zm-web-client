/**
 * The contacts panel contains a 'contactsoverview', a 'contactlistpanel', and a 'contactpanel'.
 */
Ext.define('ZCS.view.contacts.ZtContactsView', {

	extend: 'ZCS.view.ZtAppView',

	requires: [
		'ZCS.view.contacts.ZtContactsOverview',
		'ZCS.view.contacts.ZtContactListPanel',
		'ZCS.view.contacts.ZtContactPanel'
	],

	xtype: 'contactsview',

	config: {
		overviewXtype: 'contactsoverview',
		listPanelXtype: 'contactlistpanel',
		itemPanelXtype: 'contactpanel'
	}
});
