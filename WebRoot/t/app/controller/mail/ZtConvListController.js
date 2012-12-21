Ext.define("ZCS.controller.mail.ZtConvListController", {
	extend: "ZCS.controller.ZtBaseController",
//	singleton: true,    // introduces JS error :(
	config: {
		models: ['ZCS.model.mail.ZtConv'],
		stores: ['ZCS.store.mail.ZtConvStore'],
		refs: {
			mailView: 'mailview',
			convListView: 'convlistview'
		},
		control: {
			mailView: {
				showFolders: 'onShowFolders',
				compose: 'onCompose'
			},
			convListView: {
				showConv: 'onShowConv'
			}
		}
	},
	launch: function () {
		this.callParent();
		console.log("launch ZtConvListController");
		Ext.getStore('ZtConvStore').load();
		console.log("load store");
	},
	init: function () {
		this.callParent();
		console.log("init ZtConvListController");
	},
	onShowFolders: function() {
		console.log("Folders event caught");
	},
	onCompose: function() {
		console.log("Compose event caught");
	},
	onShowConv: function(view, conv) {
		console.log("Conv selected: " + conv.get("subject"));
		var convCtlr = ZCS.app.getController('ZCS.controller.mail.ZtConvController');
		convCtlr.showConv(conv);
	}
});
