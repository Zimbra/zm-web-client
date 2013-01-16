Ext.define('ZCS.controller.contacts.ZtContactListController', {

	extend: 'ZCS.controller.ZtListController',

	config: {
		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],
		refs: {
			parentView: 'contactsview',
			overview: 'contactsoverview',
			folderList: 'contactsoverview nestedlist',
			itemPanel: 'contactpanel',
			listView: 'contactlistview',
			titlebar: 'contactlistpanel titlebar'
		},
		control: {
			contactsView: {
				compose: 'onCompose'
			}
		}
	},

	// TODO: launch happens on startup; delay load until Contacts tab shown

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.contacts.ZtContactController');
	}
});
