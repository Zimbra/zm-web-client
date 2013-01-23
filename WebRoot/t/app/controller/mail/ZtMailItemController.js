/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * Base class for a controller that manages a single mail item.
 *
 * @see ZtItemPanel
 * @see ZtMailItem
 * @author Conrad Damon <cdamon@zimbra.com>
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
