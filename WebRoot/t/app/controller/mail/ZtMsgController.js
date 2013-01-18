/**
 * This class manages the display and manipulation of a single message.
 *
 * @see ZtMsg
 */
Ext.define('ZCS.controller.mail.ZtMsgController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			msgFooter: 'msgfooter',
			menuButton: 'msgfooter button'
		},

		control: {
			msgFooter: {
				reply: 'doReply',
				replyAll: 'doReplyAll',
				delete: 'doDelete',
				showMenu: 'doShowMenu'
			}
		},

		menuData: [
			{label: 'Delete', action: 'DELETE', listener: 'doDelete'},
			{label: 'Mark Read', action: 'MARK_READ', listener: 'doMarkRead'}
		]
	},

	launch: function() {
		console.log('STARTUP: msg ctlr launch - ' + this.$className);
		this.callParent(arguments);
	},

	doShowMenu: function(msg) {
		this.setItem(msg);
		this.callParent(arguments);
	},

	getActiveMsg: function() {
		return this.getItem();
	}
});
