Ext.define('ZCS.view.mail.ZtConvListPanel', {

	extend: 'ZCS.view.ZtListPanel',

	requires: [
		'ZCS.view.mail.ZtConvListView'
	],

	xtype: ZCS.constant.LIST_PANEL_XTYPE[ZCS.constant.APP_MAIL],

	config: {
		app: ZCS.constant.APP_MAIL,
		newItemIconCls: 'compose',
		listPanelStoreName: 'ZtConvStore'
	},

	getListPanelTitle: function() {
		var app = ZCS.constant.APP_MAIL,
			inboxId = ZCS.constant.ID_INBOX,
			inbox = ZCS.session.getFolderListByApp(app).getStore().getById(inboxId),
			unread = inbox ? inbox.get('unreadCount') : 0;

		return '<b>Inbox (' + unread + ')</b>';
	}
});
