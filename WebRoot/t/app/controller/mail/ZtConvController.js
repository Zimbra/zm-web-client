/**
 * This class manages the display and manipulation of a single conversation, which is made up of one or more messages.
 *
 * @see ZtConv
 * @see ZtMsg
 */
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

	/**
	 * Returns the compose controller
	 */
	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function() {
		console.log("conv controller REPLY");
		this.getComposeController().reply(this.getActiveMsg());
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function() {
		console.log("conv controller REPLY_ALL");
		this.getComposeController().replyAll(this.getActiveMsg());
	},

	/**
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function() {
		console.log("conv controller FORWARD");
		this.getComposeController().forward(this.getActiveMsg());
	},

	/**
	 * Moves the conv to Trash.
	 */
	doDelete: function() {
		console.log("conv controller DELETE");
	},

	/**
	 * Toggles read/unread on the conv.
	 */
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

	/**
	 * Clears out toolbar text and the msg list.
	 */
	clear: function() {
		this.callParent(arguments);
		this.getMsgListView().getStore().removeAll();
	},

	/**
	 * Displays the given conv as a list of messages. Sets toolbar text to the conv subject.
	 *
	 * @param {ZtConv}  conv        conv to show
	 */
	showItem: function(conv) {
		console.log("conv controller: show conv " + conv.get('id'));
		this.callParent(arguments);
		this.getItemToolbar().setTitle(conv.get("subject"));
		this.getMsgListView().getStore().load({convId: conv.get('id')});
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
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

	/**
	 * Returns the message that a conversation-level operation should be applied to.
	 */
	getActiveMsg: function() {
		var conv = this.getItem(),
			msgs = conv.getMessages(),
			msg = null;
			msg = (msgs && msgs.length) ? msgs[0] : null;

//		Ext.each(msgs, function(msg) {
//			if (msg.get('isUnread') === true) {
//				return msg;
//			}
//		}, this);

		return (msgs && msgs[0]) || null;
	}
});
