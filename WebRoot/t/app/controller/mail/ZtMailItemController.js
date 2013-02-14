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
	 * Returns the message that an operation should be applied to.
	 */
	getActiveMsg: function() {},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function(msg) {
		ZCS.app.getComposeController().reply(msg || this.getActiveMsg());
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function(msg) {
		ZCS.app.getComposeController().replyAll(msg || this.getActiveMsg());
	},

	/**
	 * Starts a forward session with the active message as the original message.
	 */
	doForward: function(msg) {
		ZCS.app.getComposeController().forward(msg || this.getActiveMsg());
	},

	/**
	 * Moves the mail item to Trash.
	 *
	 * @param {ZtMailMsg}   msg     mail msg (present if delete action triggered by button)
	 */
	doDelete: function(msg) {
		this.performOp(msg, 'trash');
	},

	/**
	 * Moves the mail item to Junk.
	 *
	 * @param {ZtMailMsg}   msg     mail msg (present if spam action triggered by button)
	 */
	doSpam: function(msg) {
		this.performOp(msg, 'spam');
	},

	/**
	 * Toggles read/unread on the conv.
	 */
	doMarkRead: function(msg) {
		Ext.Logger.info("mail item controller MARK_READ");
		var item = msg || this.getItem(),
			wasUnread = item.get('isUnread');

		item.set('op', wasUnread ? 'read' : '!read');
		item.save({
			success: function(item, operation) {
				Ext.Logger.info('mail item saved successfully');
				item.set('op', null);
			}
		});
	}
});
