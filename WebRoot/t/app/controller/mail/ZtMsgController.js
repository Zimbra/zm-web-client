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
 * @see ZtMsg
 * @author Conrad Damon <cdamon@zimbra.com>
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
