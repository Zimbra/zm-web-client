Ext.define('ZCS.view.mail.ZtConvListView', {

	extend: 'ZCS.view.ZtListView',

	xtype: ZCS.constant.APP_MAIL + 'listview',

	config: {
		loadingText: "Loading conversations ...",
		emptyText: "<div class=\"notes-list-empty-text\">No conversations found.</div>",
		itemTpl: ZCS.template.CONV_LIST_ITEM
	}
});
