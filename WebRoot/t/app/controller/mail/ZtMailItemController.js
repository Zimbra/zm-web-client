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
		console.log("REPLY");
		this.getComposeController().reply(msg || this.getActiveMsg());
	}
});
