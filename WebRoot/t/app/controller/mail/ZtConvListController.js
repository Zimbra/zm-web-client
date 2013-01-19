Ext.define('ZCS.controller.mail.ZtConvListController', {

	extend: 'ZCS.controller.ZtListController',

	// slight hack to load some needed files early, rather than dynamically loading as needed via an
	// asynchronous request (which introduces timing problems)
	requires: [
		'ZCS.model.mail.ZtMailFolder',
		'ZCS.view.mail.ZtMsgListView'
	],

	config: {

		models: ['ZCS.model.mail.ZtConv'],
		stores: ['ZCS.store.mail.ZtConvStore'],

		refs: {
			// event handlers
			listPanel: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel',
			listView: ZCS.constant.APP_MAIL + 'listview',
			folderList: 'appview #' + ZCS.constant.APP_MAIL + 'overview nestedlist',
			itemPanel: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel',

			// other
			overview: 'appview #' + ZCS.constant.APP_MAIL + 'overview',
			titlebar: 'appview #' + ZCS.constant.APP_MAIL + 'listpanel titlebar'
		},

		control: {
			listPanel: {
				newItem: 'doCompose'
			}
		},

		app: ZCS.constant.APP_MAIL
	},

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtConvController');
	},

	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	doCompose: function() {
		this.getComposeController().compose();
	}
});
