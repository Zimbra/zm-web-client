Ext.define('ZCS.controller.mail.ZtConvListController', {

	extend: 'ZCS.controller.ZtListController',

	config: {
		models: ['ZCS.model.mail.ZtConv'],
		stores: ['ZCS.store.mail.ZtConvStore'],
		refs: {
			parentView: 'mailview',
			overview: 'mailoverview',
			folderList: 'mailoverview nestedlist',
			itemPanel: 'convpanel',
			listView: 'convlistview'
		},
		control: {
			parentView: {
				compose: 'onCompose'
			}
		}
	},

	getItemController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtConvController');
	},

	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	onCompose: function() {
		this.getComposeController().compose();
	}
});
