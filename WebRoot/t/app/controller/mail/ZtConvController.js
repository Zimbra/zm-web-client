Ext.define('ZCS.controller.mail.ZtConvController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.common.ZtMenu'
	],

	config: {
		models: ['ZCS.model.mail.ZtMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],
		refs: {
			convPanel: 'convpanel',
			convToolbar: 'convpanel titlebar',
			convMenuButton: 'convpanel titlebar button',
			msgListView: 'msglistview'
		},
		control: {
			convPanel: {
				showConvMenu: 'onShowConvMenu'
			}
		},
		conv: null
	},

	onShowConvMenu: function() {
		console.log("Conv menu event caught");

		if (!this.convMenu) {
			this.convMenu = Ext.create('ZCS.common.ZtMenu', {
				referenceComponent: this.getConvMenuButton()
			});
		}
		this.convMenu.setMenuItems([
			{label: 'Reply', action: 'REPLY', listener: this.doReply},
			{label: 'Reply All', action: 'REPLY_ALL', listener: this.doReplyAll},
			{label: 'Forward', action: 'FORWARD', listener: this.doForward},
			{label: 'Delete', action: 'DELETE', listener: this.doDelete},
			{label: 'Mark Read', action: 'MARK_READ', listener: this.doMarkRead}
		], this);
		this.convMenu.popup();
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
	},

	doForward: function() {
		console.log("conv controller FORWARD");
	},

	doDelete: function() {
		console.log("conv controller DELETE");
	},

	doMarkRead: function() {
		console.log("conv controller MARK_READ");
	},

	clear: function() {
		this.getConvToolbar().setTitle('');
		this.getConvMenuButton().hide();
		this.getMsgListView().getStore().removeAll();
	},

	showConv: function(conv) {
		console.log("conv controller: show conv " + conv.get('id'));
		this.clear();
		this.setConv(conv);
		this.getConvToolbar().setTitle(conv.get("subject"));
		this.getConvMenuButton().show();
		this.getMsgListView().getStore().load({convId: conv.get('id')});
	},

	// private
	getActiveMsg: function() {
		var conv = this.getConv(),
			msgs = conv.getMessages(),
			msg = (msgs && msgs.length) ? msgs[0] : null;

		return msg;
	}
});
