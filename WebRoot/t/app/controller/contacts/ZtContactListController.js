Ext.define('ZCS.controller.contacts.ZtContactListController', {

	extend: 'ZCS.controller.ZtListController',

	// slight hack to load some needed files early, rather than dynamically loading as needed via an
	// asynchronous request (which introduces timing problems)
	requires: [
		'ZCS.model.contacts.ZtContactsFolder',
		'ZCS.view.contacts.ZtContactPanel'
	],

	config: {

		models: ['ZCS.model.contacts.ZtContact'],
		stores: ['ZCS.store.contacts.ZtContactStore'],

		refs: {
			// event handlers
			listPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'listpanel',
			listView: ZCS.constant.APP_CONTACTS + 'listview',
			folderList: 'appview #' + ZCS.constant.APP_CONTACTS + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_CONTACTS + 'itempanel',

			// other
			overview: 'appview #' + ZCS.constant.APP_CONTACTS + 'overview',
			titlebar: 'appview #' + ZCS.constant.APP_CONTACTS + 'listpanel titlebar'
		},

		control: {
			listPanel: {
				newItem: 'doNewContact'
			}
		},

		app: ZCS.constant.APP_CONTACTS
	},

	// TODO: launch happens on startup; delay load until Contacts tab shown

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.contacts.ZtContactController');
	},

	doNewContact: function() {
		console.log('Create new contact');
	}
});
