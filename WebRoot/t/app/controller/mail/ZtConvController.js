Ext.define('ZCS.controller.mail.ZtConvController', {

	extend: 'ZCS.controller.ZtItemController',

	config: {
		models: ['ZCS.model.mail.ZtMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],
		refs: {
			itemPanel: 'convpanel',
			itemToolbar: 'convpanel titlebar',
			menuButton: 'convpanel titlebar button',
			msgListView: 'msglistview'
		},
		menuData: [
			{label: 'Reply', action: 'REPLY', listener: 'doReply'},
			{label: 'Reply All', action: 'REPLY_ALL', listener: 'doReplyAll'},
			{label: 'Forward', action: 'FORWARD', listener: 'doForward'},
			{label: 'Delete', action: 'DELETE', listener: 'doDelete'},
			{label: 'Mark Read', action: 'MARK_READ', listener: 'doMarkRead'}
		]
	},

	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	doReply: function() {
		console.log("conv controller REPLY");
		this.getComposeController().reply(this.getActiveMsg());
	},

	doReplyAll: function() {
		console.log("conv controller REPLY_ALL");
		this.getComposeController().replyAll(this.getActiveMsg());
	},

	doForward: function() {
		console.log("conv controller FORWARD");
		this.getComposeController().forward(this.getActiveMsg());
	},

	doDelete: function() {
		console.log("conv controller DELETE");
	},

	doMarkRead: function() {
		console.log("conv controller MARK_READ");
		var conv = this.getItem(),
			wasUnread = conv.get('isUnread');

		conv.set('op', wasUnread ? 'read' : '!read');
		conv.save({ success: function(conv, operation) {
			console.log('conv saved successfully');
			conv.set('isUnread', !wasUnread);
		}});
	},

	clear: function() {
		this.callParent(arguments);
		this.getMsgListView().getStore().removeAll();
	},

	showItem: function(conv) {
		console.log("conv controller: show conv " + conv.get('id'));
		this.callParent(arguments);
		this.getItemToolbar().setTitle(conv.get("subject"));
		this.getMsgListView().getStore().load({convId: conv.get('id')});
	},

	onShowMenu: function() {

		var label = this.getItem().get('isUnread') ? 'Mark Read' : 'Mark Unread';
		if (this.itemMenu) {
			var list = this.itemMenu.down('list'),
				store = list.getStore(),
				item = list.getItemAt(store.find('action', 'MARK_READ'));

			item.getRecord().set('label', label);
		}
		else {
			// first time showing menu, change data since menu not ready yet
			var menuData = this.getMenuData();
			Ext.each(menuData, function(menuItem) {
				if (menuItem.action === 'MARK_READ') {
					menuItem.label = label;
				}
			}, this);
		}
		this.callParent(arguments);
	},

	// private
	getActiveMsg: function() {
		var conv = this.getItem(),
			msgs = conv.getMessages(),
			msg = null;
//			msg = (msgs && msgs.length) ? msgs[0] : null;

		Ext.each(msgs, function(msg) {
			if (msg.get('isUnread') === true) {
				return msg;
			}
		}, this);

		return (msgs && msgs[0]) || null;
	}
});
