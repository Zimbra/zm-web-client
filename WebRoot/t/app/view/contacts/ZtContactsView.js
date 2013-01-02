Ext.define('ZCS.view.contacts.ZtContactsView', {

	extend: 'Ext.Container',

	requires: [
		'Ext.Panel',
		'Ext.field.Text',
		'Ext.Label',

		'ZCS.view.contacts.ZtContactsOverview',
		"ZCS.view.contacts.ZtContactListPanel",
		"ZCS.view.contacts.ZtContactPanel"
	],

	xtype: 'contactsview',

	config: {
		layout: 'hbox',
		padding: 0
	},

	initialize: function() {

		this.callParent(arguments);

/*
		var overview = {
			xtype: 'contactsoverview',
			width: '20%',
			hidden: true
		};
*/

		var contactListPanel = {
			xtype: 'contactlistpanel',
			width: '30%'
		};

		var contactPanel = {
			xtype: 'contactpanel',
			width: '70%'
		};

		this.add([
//			overview,
			contactListPanel,
			contactPanel
		]);
	}
});
