/**
 * Base class for a controller that manages a single mail item.
 *
 * @see ZtItemPanel
 * @see ZtMailItem
 */
Ext.define('ZCS.controller.mail.ZtMailItemController', {

	extend: 'ZCS.controller.ZtItemController',

	/**
	 * Returns the compose controller
	 */
	getComposeController: function() {
		return ZCS.app.getController('ZCS.controller.mail.ZtComposeController');
	},

	/**
	 * Returns the message that an operation should be applied to.
	 */
	getActiveMsg: function() {},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function(msg) {
		this.getComposeController().reply(msg || this.getActiveMsg());
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function(msg) {
		this.getComposeController().replyAll(msg || this.getActiveMsg());
	},

	/**
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function(msg) {
		this.getComposeController().forward(msg || this.getActiveMsg());
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
	}
});
