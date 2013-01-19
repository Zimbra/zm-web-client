/**
 * This class manages the display and manipulation of a single conversation, which is made up of one or more messages.
 *
 * @see ZtConv
 * @see ZtMsg
 */
Ext.define('ZCS.controller.mail.ZtConvController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			// event handlers
			itemPanelToolbar: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel titlebar',

			// other
			menuButton: 'appview #' + ZCS.constant.APP_MAIL + 'itempanel titlebar button',
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
	 * Displays the given conv as a list of messages. Sets toolbar text to the conv subject.
	 *
	 * @param {ZtConv}  conv        conv to show
	 */
	showItem: function(conv) {
		console.log("conv controller: show conv " + conv.get('id'));
		this.callParent(arguments);
		this.getItemPanelToolbar().setTitle(conv.get('subject'));
		this.getMsgListView().getStore().load({convId: conv.get('id')});
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	doShowMenu: function() {

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
