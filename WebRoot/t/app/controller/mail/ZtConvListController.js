Ext.define("ZCS.controller.mail.ZtConvListController", {

	extend: "ZCS.controller.ZtBaseController",

	config: {
		models: ['ZCS.model.mail.ZtConv'],
		stores: ['ZCS.store.mail.ZtConvStore'],
		refs: {
			mailView: 'mailview',
			overview: 'overview',
			convPanel: 'convpanel',
			convListView: 'convlistview'
		},
		control: {
			mailView: {
				showFolders: 'onShowFolders',
				compose: 'onCompose',
				search: 'onSearch'
			},
			convListView: {
				showConv: 'onShowConv'
			},
			overview: {
				search: 'onSearch'
			}
		}
	},

	launch: function () {
		this.callParent();
		Ext.getStore('ZtConvStore').load();
	},

	getConvController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtConvController');
	},

	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	onShowFolders: function() {
		console.log("Folders event caught");
		var overview = this.getOverview(),
			convPanel = this.getConvPanel();

		if (overview.isHidden()) {
			convPanel.setWidth('50%');
			// animation clears space then slides in (not great)
			overview.show({
				type: 'slide',
				direction: 'right',
				duration: 500
			});
//			overview.show();
		}
		else {
			// animation starts overview at far right (flex) or doesn't work at all (%) :(
//			overview.hide({
//				type: 'slide',
//				direction: 'left'
//			});
			convPanel.setWidth('70%');
			overview.hide();
		}
	},

	onCompose: function() {
		this.getComposeController().compose();
	},

	onShowConv: function(view, conv) {
		this.getConvController().showConv(conv);
	},

	onSearch: function(query) {
		this.getConvController().clear();
		console.log('SearchRequest: ' + query);
		Ext.getStore('ZtConvStore').load({query: query});
	}
});
