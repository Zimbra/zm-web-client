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
 * This class manages the display and manipulation of a single message.
 *
 * @see ZtMailMsg
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtMsgController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMailMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			msgHeader: 'msgheader',
			msgFooter: 'msgfooter'
		},

		control: {
			msgHeader: {
				toggleView: 'doToggleView'
			},
			msgFooter: {
				reply: 'doReply',
				replyAll: 'doReplyAll',
				delete: 'doDelete',
				showMenu: 'doShowMenu'
			}
		},

		menuData: [
			{label: ZtMsg.del, action: ZCS.constant.OP_DELETE, listener: 'doDelete'},
			{label: ZtMsg.markRead, action: ZCS.constant.OP_MARK_READ, listener: 'doMarkRead'},
			{label: ZtMsg.markSpam, action: ZCS.constant.OP_SPAM, listener: 'doSpam'}
		]
	},

	getActiveMsg: function() {
		return this.getItem();
	},

	doToggleView: function(msgHeader) {

		var msgView = msgHeader.up('msgview'),
			msg = msgView.getMsg();

		if (!msgView.getExpanded() && msg && !msg.get('isLoaded')) {
			msg.set('op', 'load');
			msg.save(); // ZtMsgView updated via 'updatedata' event
		}
		else {
			msgView.toggleView();
		}
	},

	doShowMenu: function(menuButton, msg) {
		this.setItem(msg);
		this.callParent(arguments);
	}
});
